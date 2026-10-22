/**
 * 宿主半身的构建脚本。
 *
 *     node scripts/build-host.mjs
 *
 * 产物：`lib/index.js`（ESM，Node 22+）。
 *
 * ## 什么被内联、什么保持外部
 *
 * **内联**：`src/**` 与 `plugin-src/host/**` 里本产品自己的代码。
 *
 * **外部**（不打包，运行期由 Node 解析）：
 *   - `@tencent-connect/*` —— 腾讯官方 QQ 机器人 SDK。它是 `UNLICENSED` 的
 *     官方包，且必须与宿主共享同一份实例。
 *   - `node:*` —— 平台内建模块。
 *
 * **特别地**，账号渠道包 `vendor/channel-pack/pack.js` 也**不**静态并入：它需要
 * 与宿主共享同一批 cordis 实例（否则身份检查失败），所以运行期动态 import。
 *
 * @module scripts/build-host.mjs
 */

import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(packageRoot, 'lib/index.js');

/** 运行期由 Node 解析的第三方包。 */
const externalRuntimePackages = [
  '@tencent-connect/qqbot-connector',
  '@tencent-connect/qqbot-nodejs',
  'qrcode',
  'undici',
];

const external = externalRuntimePackages.flatMap((name) => [name, `${name}/*`]);

await mkdir(dirname(outputPath), { recursive: true });

await build({
  entryPoints: [resolve(packageRoot, 'plugin-src', 'host', 'index.mjs')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  mainFields: ['module', 'main'],
  external,
  outfile: outputPath,
  banner: {
    js: [
      "import { createRequire as __dshCreateRequire } from 'node:module';",
      "import { dirname as __dshDirname } from 'node:path';",
      'const require = __dshCreateRequire(import.meta.url);',
    ].join('\n'),
  },
  logLevel: 'info',
});

console.log(`Wrote ${outputPath}`);
