import { harnessPeer } from './harness-peer.mjs';

export function dsBotError(code = 'ds-bot-unavailable') {
  return Object.assign(new Error(code), { code });
}

function appearance(bot) {
  const avatar = {};
  if (/^[a-z][\w-]{0,31}$/u.test(bot.avatar?.shape ?? '')) avatar.shape = bot.avatar.shape;
  if (typeof bot.avatar?.image === 'string' && bot.avatar.image.length <= 1_500_000
    && /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(bot.avatar.image)) {
    avatar.image = bot.avatar.image;
  }
  return {
    ...(/^(?:#[0-9a-fA-F]{6}|[a-z][\w-]{0,31})$/u.test(bot.color ?? '') ? { color: bot.color } : {}),
    ...(Object.keys(avatar).length ? { avatar } : {}),
  };
}

/** Read DS Bot through the current Host's registered route, without a second
 * runtime, credentials, or assumptions about its configured storage directory. */
export function createDsBotClient(ctx) {
  async function status() {
    try {
      const manager = ctx.get?.('pluginManager');
      if (typeof manager?.listBundles === 'function') {
        const bundles = await manager.listBundles();
        const bundle = bundles.find((entry) => entry.name === 'ds-bot');
        if (!bundle?.installed) return { state: 'missing', bots: [] };
        if (!bundle.enabled) return { state: 'disabled', bots: [] };
      }
      const connection = ctx.connection;
      if (typeof connection?.createSharedFetchHandler !== 'function') {
        return { state: 'unavailable', bots: [] };
      }
      const response = await connection.createSharedFetchHandler('/api').fetch(new Request(
        'http://localhost/api/bot',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ endpoint: 'state', payload: {} }),
          signal: AbortSignal.timeout(15_000),
        },
      ), harnessPeer(ctx));
      if (!response.ok) return { state: 'unavailable', bots: [] };
      const result = await response.json();
      if (result?.ok !== true || !Array.isArray(result.value?.bots)) {
        return { state: 'unavailable', bots: [] };
      }
      if (result.value.readOnly) return { state: 'readonly', bots: [] };
      const bots = result.value.bots.filter((bot) => (
        typeof bot.id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(bot.id)
        && typeof bot.sessionId === 'string' && Boolean(bot.sessionId)
        && typeof bot.name === 'string'
      )).map((bot) => ({
        id: bot.id, name: bot.name, sessionId: bot.sessionId, ...appearance(bot),
        ...(Array.isArray(bot.parts) ? { parts: bot.parts.filter((id) => typeof id === 'string') } : {}),
      }));
      return { state: 'ready', bots };
    } catch {
      return { state: 'unavailable', bots: [] };
    }
  }
  return Object.freeze({
    status,
    async resolve(id) {
      const result = await status();
      if (result.state !== 'ready') throw dsBotError();
      const bot = result.bots.find((entry) => entry.id === id);
      if (!bot) throw dsBotError('ds-bot-not-found');
      return bot;
    },
  });
}
