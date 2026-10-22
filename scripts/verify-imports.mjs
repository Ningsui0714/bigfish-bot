/**
 * 静态 import 解析检查。
 *
 * 语法检查（`node --check`）只保证单个文件能解析；**运行时**才会发现某个
 * import 指向一个已被裁剪掉的文件 —— 那正是裁剪最容易出的错：文件本身语法
 * 正确，但它 import 的兄弟模块已经不存在了。
 *
 * 这个脚本把每个源文件的相对 import 解析成绝对路径，检查目标是否存在。
 * 只检查相对路径 —— 裸模块说明符由 Node 解析，不受裁剪影响。
 *
 *     node scripts/verify-imports.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = ['src', 'plugin-src'];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target, out);
    else if (/\.(mjs|js)$/.test(entry.name)) out.push(target);
  }
  return out;
}

const IMPORT_RE = /(?:^|\n)\s*(?:import|export)[^'"\n]*?from\s*['"](\.[^'"]+)['"]/g;
const BARE_IMPORT_RE = /(?:^|\n)\s*import\s*['"](\.[^'"]+)['"]/g;
const DYNAMIC_RE = /import\(\s*['"](\.[^'"]+)['"]\s*\)/g;

let broken = 0;
let checked = 0;

for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const text = fs.readFileSync(file, 'utf8');
    const specs = new Set();
    for (const re of [IMPORT_RE, BARE_IMPORT_RE, DYNAMIC_RE]) {
      re.lastIndex = 0;
      let match;
      while ((match = re.exec(text)) !== null) specs.add(match[1]);
    }
    for (const spec of specs) {
      checked += 1;
      const base = path.resolve(path.dirname(file), spec);
      const candidates = [base, `${base}.mjs`, `${base}.js`, path.join(base, 'index.mjs'), path.join(base, 'index.js')];
      if (!candidates.some((candidate) => fs.existsSync(candidate))) {
        broken += 1;
        console.log(`缺失 import: ${path.relative(ROOT, file)} → ${spec}`);
      }
    }
  }
}

console.log(`检查 ${checked} 条相对 import，缺失 ${broken} 条`);
process.exit(broken === 0 ? 0 : 1);
