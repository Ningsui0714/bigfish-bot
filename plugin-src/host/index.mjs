/**
 * dsh-qq-free-bot — 宿主入口（Host 半身）。
 *
 * 这个插件把两件原本分开的东西装进一个包里：
 *
 *   1. **QQ 渠道**（来自 dsh-im）—— 负责「怎么收消息、怎么回消息」：扫码建机器人、
 *      会话绑定、群历史、斜杠命令、审批流、图片与文件回传。
 *   2. **免充值 DeepSeek 模型**（本产品新增）—— 负责「用什么思考」：把十一个
 *      账号渠道里官方免费额度的 DeepSeek 模型接进 DSH 的模型目录，并在它们
 *      之间做自动降级。
 *
 * 两者在 DSH 内核里天然解耦：QQ 侧通过 Harness 的 `session.prompt` 发起一轮
 * 对话，模型由 DSH 的 `llm` provider 抽象决定。本插件同时挂上这两半，于是
 * 「QQ 里问一句」到「某个 DeepSeek 车道作答」之间不需要任何胶水。
 *
 * ## 与上游 dsh-im 的关系
 *
 * 宿主装配的**结构**（挂载顺序、嵌套 fiber 的注入时机、deliveryService 的构造
 * 参数、`ctx.provide('dshIm')` 的契约）逐行对齐上游 dsh-im —— 那是经过实战的
 * 代码，结构对了才不会在各种宿主组合下出微妙问题。差别只有两处：
 *
 *   1. 渠道列表只有 QQ 一个；
 *   2. 多挂一层模型车道（`installModelLane`）。
 *
 * ## 为什么模型侧自己实现
 *
 * 上游 `dsh-our-free-model` 的模型侧（`src/adapter.js` + `src/core/runtime.js`）
 * 是一条**面向通用免费聚合**的完整实现：它同时维护免 Key 免账号车道、EAC
 * 协付车道、聚合车道（用户自备 Key）、combo 降级链、本地 OpenAI 网关、公告
 * 中心、应用内自更新、用量看板……而本产品只需要其中一小块，且诉求不同：
 *
 *   - 目录里**只有 DeepSeek**（产品契约，不是偏好）；
 *   - 降级要**跨 provider** —— 上游的 combo 只能在同一个 adapter 的目录里换
 *     模型，而账号渠道各自是独立的 llm provider 注册，combo 覆盖不到；
 *   - 不要自更新/公告/赞助位 —— 本产品没有维护者服务器。
 *
 * 所以模型侧在这里重新实现，只保留真正需要的部分；**降级链的语义**（正文才算
 * 提交、思考增量不算）沿用上游，因为它是对的。
 *
 * @module plugin-src/host/index.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { apply as applyQq } from './channels/qq/index.mjs';
import { installGroupHistoryTools } from '../../src/channels/shared/group-history-access.mjs';
import { installOutboundArtifactTool } from '../../src/channels/shared/semantic/artifact.mjs';
import { installHostLanguage } from './host-language.mjs';
import { installHostLanguageRpc } from './host-language-rpc.mjs';
import { installDeliveryRpc } from './delivery-rpc.mjs';
import { installDeliveryHttp } from './delivery-http.mjs';
import { createDeliveryService } from './delivery-service.mjs';
import { createDsBotClient } from './ds-bot-client.mjs';
import { installInboundTtlRpc } from './inbound-ttl-rpc.mjs';
import { installSidebarSettingsRpc } from './sidebar-settings.mjs';
import { installInjectedContext } from './injected-context.mjs';
import { installSessionSyncCoordinator } from './session-sync-coordinator.mjs';
import { installSessionTitlePrefix } from './session-title-prefix.mjs';
import { installUpdateRpc } from './update-rpc.mjs';
import { installModelLane } from './model-lane.mjs';

export const name = 'dsh-qq-free-bot';
export const inject = [
  'connection',
  'credentials',
  'typertGateway',
  // 模型车道要往 DSH 的模型目录里注册 DeepSeek provider，宿主必须提供 llm。
  // 没有 llm 的组合（比如纯 TUI）会因此少掉模型车道，但 QQ 渠道仍可工作。
  'llm',
];

/**
 * 账号渠道包的位置（`vendor/channel-pack/pack.js`）。
 *
 * ⚠️ 必须在**运行期**从 `import.meta.url` 推算包根，不能在构建期把路径写死
 * —— 写死的是构建机的路径，装到别的机器上就找不到了。
 *
 * 两种布局的包根都从「本文件到 `package.json` 的距离」反推：
 *
 *   - 源码直跑：`plugin-src/host/index.mjs` → 上溯两层到包根；
 *   - 打包产物：`lib/index.js`               → 上溯一层到包根。
 *
 * 办法是找**最近的**含 `package.json` 的祖先目录 —— 两种布局都对，且不依赖
 * 硬编码的层数。
 */
function resolvePackageRoot(startUrl) {
  let dir = path.dirname(fileURLToPath(startUrl));
  for (let depth = 0; depth < 6; depth += 1) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(path.dirname(fileURLToPath(startUrl)), '..');
}

const PACKAGE_ROOT = resolvePackageRoot(import.meta.url);
const CHANNEL_PACK_ENTRY = path.join(PACKAGE_ROOT, 'vendor', 'channel-pack', 'pack.js');

/**
 * 宿主插件工厂。
 *
 * 抽出工厂是为了测试能注入替身，不用真的把 QQ 连出去。
 *
 * @param {object} [internals] 每个键替换一个内部实现
 */
export function createQqFreeBotPlugin(internals = {}) {
  const startHostLanguage = internals.installHostLanguage ?? installHostLanguage;
  const startHostLanguageRpc = internals.installHostLanguageRpc ?? installHostLanguageRpc;
  const startUpdate = internals.installUpdateRpc ?? installUpdateRpc;
  const startInboundTtl = internals.installInboundTtlRpc ?? installInboundTtlRpc;
  const startSidebarSettings = internals.installSidebarSettingsRpc ?? installSidebarSettingsRpc;
  const startInjectedContext = internals.installInjectedContext ?? installInjectedContext;
  const startDelivery = internals.installDeliveryRpc ?? installDeliveryRpc;
  const startDeliveryHttp = internals.installDeliveryHttp ?? installDeliveryHttp;
  const startSessionSync = internals.installSessionSyncCoordinator
    ?? installSessionSyncCoordinator;
  const makeDeliveryService = internals.createDeliveryService ?? createDeliveryService;
  const startQq = internals.applyQq ?? applyQq;
  const startModelLane = internals.installModelLane ?? installModelLane;

  /** 本产品只支持一个渠道。 */
  const channels = [
    ['qq', startQq],
  ];

  function channelConfig(config, name, deliveryService) {
    const channel = { ...(config.dshHome ? { dshHome: config.dshHome } : {}), ...config[name] };
    const withAuthority = config.rpcAuthority === undefined
      ? channel
      : { ...channel, rpcAuthority: config.rpcAuthority };
    return { ...withAuthority, deliveryService };
  }

  return Object.freeze({
    name,
    inject,
    async apply(ctx, config = {}) {
      const unavailableSessionSyncChannels = channels
        .map(([channel]) => channel)
        .filter((channel) => config[channel]?.harnessBaseUrl !== undefined);
      const deliveryService = makeDeliveryService({
        unavailableSessionSyncChannels: unavailableSessionSyncChannels.map(
          (channel) => (channel === 'wecomApp' ? 'wecom-app' : channel),
        ),
        dsBot: createDsBotClient(ctx),
      });

      if (typeof ctx?.provide === 'function') {
        ctx.provide('dshIm', Object.freeze({
          contractVersion: 1,
          receiptVersion: 1,
          inboundVersion: 1,
          consumeInbound: (botId, options) => deliveryService.consumeInbound(botId, options),
          historyChecked: (botId, route, query, options) => deliveryService.historyChecked(botId, route, query, options),
          replyChecked: (botId, route, text, options) => deliveryService.replyChecked(botId, route, text, options),
          describeBot: (botId) => deliveryService.describeBot(botId),
          sendChecked: (botId, targetId, text, options) => deliveryService.sendChecked(botId, targetId, text, options),
          send: (botId, targetId, text, options) => (
            deliveryService.send(botId, targetId, text, options)
          ),
          listTargets: async (botId) => (await deliveryService.listTargets(botId)).targets,
          listBots: () => deliveryService.listBots(),
        }));
        ctx.provide('dshQqFreeBot', Object.freeze({
          contractVersion: 1,
          modelLane: null,
        }));
      }

      // ── 模型车道 ──────────────────────────────────────────────────────────
      //
      // 必须在 `apply()` 的**顶层**挂载，不能放进 `activateChannels` ——
      // 后者运行在 `ctx.inject(['sessionController', 'workspaceController'])`
      // 的回调里，那个作用域在回调结束后就销毁了，模型车道会跟着被拆掉。
      //
      // 模型车道与渠道互不依赖：它只往 DSH 的模型目录里注册 DeepSeek provider。
      try {
        const modelLane = startModelLane(ctx, {
          ...config,
          channelPackEntry: config.channelPackEntry ?? CHANNEL_PACK_ENTRY,
        });
        if (typeof ctx?.provide === 'function') {
          ctx.provide('dshQqFreeBot', Object.freeze({
            contractVersion: 1,
            modelLane: modelLane?.describe?.() ?? null,
          }));
        }
      } catch (error) {
        const logger = typeof ctx?.logger === 'function'
          ? ctx.logger(name)
          : (ctx?.logger ?? console);
        logger.error?.('[dsh-qq-free-bot] 挂载模型车道失败；QQ 渠道仍会启动，但没有可用模型', error);
      }

      const activate = async (readyCtx) => {
        const logger = typeof ctx?.logger === 'function' ? ctx.logger(name) : (ctx?.logger ?? console);
        logger.info?.('[dsh-qq-free-bot] 正在挂载 QQ 渠道…');
        await activateChannels(readyCtx, config, deliveryService);
        logger.info?.('[dsh-qq-free-bot] QQ 渠道已挂载');
      };

      if (typeof ctx?.inject === 'function') {
        // ⚠️ 这里**不能**用 `ctx.inject([...], activate)` 来挂渠道。
        //
        // `ctx.inject()` 建立的是一个**新 fiber**，它要等 `inject` 列表里的服务
        // 全部就绪才会执行回调；`await` 一个尚未就绪的 fiber 会一直挂着。而
        // 渠道的挂载只需要 `credentials` —— 它已经在本插件的 `inject` 里声明，
        // 所以这个 fiber 本身就已经保证了它可用。
        //
        // 直接调用 `activate(ctx)` 才是对的：QQ 渠道的挂载不该被任何一个额外
        // 服务的就绪时机卡住。
        await activate(ctx);
        ctx.inject(['webServer'], (httpCtx) => {
          startDeliveryHttp(httpCtx, deliveryService);
        });
        return;
      }

      await activate(ctx);
      if (ctx?.webServer?.register && typeof ctx?.effect === 'function') {
        startDeliveryHttp(ctx, deliveryService);
      }
    },
  });

  /**
   * 挂载渠道与全局能力。
   *
   * 顺序与上游一致：先绑定界面语言（让平台存下的第一条命令菜单就是界面语言），
   * 再装工具，再挂管理面，最后启动渠道。
   */
  async function activateChannels(ctx, config, deliveryService) {
    const hostLanguage = startHostLanguage(ctx, config);
    await hostLanguage?.ready;

    const startTitlePrefix = (titleCtx) => {
      // The installer owns its cleanup through ctx.effect(). Cordis startup
      // callbacks must not return its controller object as an effect.
      installSessionTitlePrefix(titleCtx, {
        logger: typeof titleCtx?.logger === 'function'
          ? titleCtx.logger('dsh-qq-free-bot:session-title') : (titleCtx?.logger ?? console),
      });
    };
    if (typeof ctx?.inject === 'function') {
      ctx.inject(['sessions'], startTitlePrefix);
    } else if (ctx?.sessions && typeof ctx.on === 'function') {
      startTitlePrefix(ctx);
    }

    if (typeof ctx?.inject === 'function') {
      ctx.inject(['tools', 'systemPrompt'], (artifactCtx) => {
        installOutboundArtifactTool(artifactCtx);
        installGroupHistoryTools(artifactCtx);
      });
    } else {
      installOutboundArtifactTool(ctx);
      installGroupHistoryTools(ctx);
    }

    const logger = typeof ctx?.logger === 'function'
      ? ctx.logger(name)
      : (ctx?.logger ?? console);

    try {
      startInjectedContext(ctx, { logger });
    } catch (error) {
      logger.error?.('[dsh-qq-free-bot] failed to activate injected-context pairing; prompts keep the inline prefix', error);
    }

    if (ctx?.connection?.fetch) {
      if (hostLanguage) {
        try {
          startHostLanguageRpc(ctx, hostLanguage, config.rpcAuthority);
        } catch (error) {
          logger.error?.('[dsh-qq-free-bot] failed to activate interface language mirroring; continuing with channels', error);
        }
      }
      try {
        startUpdate(ctx);
      } catch (error) {
        logger.error?.('[dsh-qq-free-bot] failed to activate update management; continuing with channels', error);
      }
      try {
        startSidebarSettings(ctx, { config });
      } catch (error) {
        logger.error?.('[dsh-qq-free-bot] failed to activate sidebar settings; continuing with channels', error);
      }
      try {
        startInboundTtl(ctx, { config });
      } catch (error) {
        logger.error?.('[dsh-qq-free-bot] failed to activate inbound TTL settings; continuing with channels', error);
      }
      try {
        startDelivery(ctx, deliveryService, { authority: config.rpcAuthority });
      } catch (error) {
        logger.error?.('[dsh-qq-free-bot] failed to activate delivery management; continuing with channels', error);
      }
    }

    const failures = [];
    // Each channel mounts its management RPC before awaiting initialization.
    // Start them together so a slow channel cannot leave later routes absent.
    await Promise.all(channels.map(async ([channel, start]) => {
      try {
        await start(ctx, channelConfig(config, channel, deliveryService));
      } catch (error) {
        failures.push(error);
        logger.error?.(
          `[dsh-qq-free-bot] failed to activate ${channel}; continuing with the remaining channels`,
          error,
        );
      }
    }));
    if (failures.length === channels.length) {
      throw new AggregateError(failures, 'dsh-qq-free-bot failed to activate every channel');
    }

    if (typeof ctx?.on === 'function') {
      try {
        startSessionSync(ctx, deliveryService, {
          logger,
          inputScope: ctx.root ?? ctx,
        });
      } catch (error) {
        logger.error?.('[dsh-qq-free-bot] failed to activate Session sync; continuing with channels', error);
      }
    }
  }
}

export async function apply(ctx, config = {}) {
  return createQqFreeBotPlugin().apply(ctx, config);
}

// ⚠️ **不要** `export default apply`。
//
// cordis 读的是**具名导出**的 `inject` 与 `apply`；加一个 default 导出会让
// 加载器优先采用 default 那个函数，而它与本模块的 `inject` 常量没有关联 ——
// 于是 fiber 不会声明 `connection`/`credentials`/`llm`，插件运行期一访问
// `ctx.connection` 就抛 "cannot get property connection without inject"。
// 上游 dsh-im 同样没有 default 导出，原因一致。

/** 供测试与外部集成使用。 */
export { applyQq };
export { createDsBotClient };
