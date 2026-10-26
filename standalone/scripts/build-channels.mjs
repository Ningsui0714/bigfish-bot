/** Extract audited account/protocol code, NOT the old host, gateway, or account pool. */
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { build } from '../../node_modules/esbuild/lib/main.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await fs.readFile(resolve(root, '../vendor/channel-pack/pack.js'), 'utf8');
const names = ['CodeArtsAuth','LobsteraiAuth','QoderAuth','ClineAuth','LoomyAuth','RaccoonAuth','MinimaxAuth','GeminiAuth',
  'CodeArtsAdapter','LobsteraiAdapter','QoderAdapter','ClineAdapter','LoomyAdapter','RaccoonAdapter','ZcodeAdapter','MinimaxAdapter','GeminiAdapter',
  'LOBSTERAI','QODER','QODER_CN','CLINE','LOOMY','RACCOON','ZCODE','MINIMAX','GEMINI',
  'startOAuthFlow','startLobsteraiLoginFlow','startQoderLoginFlow','startClineLoginFlow','startLoomyWechatLoginFlow','startRaccoonLoginFlow',
  'startZcodeLogin','pollZcodeLogin','startMinimaxDeviceAuthorization','pollMinimaxDeviceToken','startGeminiOAuthFlow',
  'fetchRaccoonUserInfo','fetchCodingPlanApiKey','fetchCodeArtsRemoteModels','fetchClineRemoteModels','parseLoomyRemoteModels','fetchZcodeModels',
  'fetchLobsteraiCreditBalance','fetchQoderCreditBalance','fetchClineCreditBalance','fetchLoomyCreditBalance','fetchRaccoonCreditBalance','fetchZcodeBalance','fetchMinimaxCreditBalance','fetchGeminiCreditBalance','fetchCodeArtsAccountInfoDetailed',
  'fetchMinimaxSigninStatus','claimCodeArtsDailyCheckin','claimLobsteraiDailyCheckin','claimQoderDailyCheckin','claimLoomyDailyQuota','claimMinimaxDailyCheckin'];
// Exclude host apply() and its startup side effects. Retain pure protocol definitions.
let entry = source.slice(0, source.lastIndexOf('// vendor/channel-pack/src/index.ts'));
entry = entry.replace(/import \{ createRequire as __ofmCreateRequire \} from 'node:module'\nconst require = __ofmCreateRequire\(import.meta.url\)/, '');
// Keep the local chat's text intact; do not inherit the host's prose/loop filters.
entry = entry.replace('function isReasoningLoopGuardEnabled() {', 'function isReasoningLoopGuardEnabled() { return false;');
entry = entry.replace('function isCourseLeakStripEnabled() {', 'function isCourseLeakStripEnabled() { return false;');
entry = entry.replace('function cacheDir() {', `function cacheDir() { return ${JSON.stringify(resolve(root, 'data/protocol-cache'))};`);
entry = `import { protocolFetch as fetch } from '../channel-transport.mjs';\n${entry}\ninit_login();\nexport { ${names.join(',')} };`;
await fs.mkdir(resolve(root, 'server/vendor'), { recursive: true });
await build({ stdin: { contents: entry, resolveDir: resolve(root, 'server/vendor'), sourcefile: 'account-protocol-snapshot.mjs', loader: 'js' },
  bundle: true, platform: 'node', format: 'esm', target: 'node22', treeShaking: true, minify: false,
  outfile: resolve(root, 'server/vendor/channels.mjs'), legalComments: 'inline',
  banner: {js: `// MIT / Copyright (c) 2026 Jet. Derived protocol subset. Source SHA256: ${createHash('sha256').update(source).digest('hex')}\nimport { createRequire as __sdkRequire } from 'node:module'; const require = __sdkRequire(import.meta.url);`},
  plugins: [{ name: 'standalone-values', setup(b) {
    b.onResolve({filter:/^@deepseek-ai\//}, () => ({path:resolve(root,'server/protocol-sdk-shim.mjs')}));
    b.onResolve({filter:/channel-transport\.mjs$/}, () => ({path:'../channel-transport.mjs',external:true}));
  }}],
});
await fs.copyFile(resolve(root,'../vendor/channel-pack/qoder-auth-wasm.wasm'),resolve(root,'server/vendor/qoder-auth-wasm.wasm'));
await fs.copyFile(resolve(root,'../vendor/channel-pack/LICENSE'),resolve(root,'server/vendor/LICENSE'));
console.log('Standalone account protocols rebuilt (no DSH runtime imports).');
