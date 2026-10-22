/**
 * 车道配置的持久化。
 *
 * GUI 需要让用户改车道顺序、开关某条车道、开关兜底车道 —— 这些都必须落盘，
 * 否则重启就回到默认值。
 *
 * ## 为什么不用 DSH 的 settings 服务
 *
 * DSH 的 `settings` 服务要求 provider 先 `registerConfigurableProviders`，
 * 而那个目录是给「模型 provider 自己的配置」用的；本产品的车道顺序是一份
 * **插件私有**的运行时配置，不需要出现在 DSH 的设置树里。落一个自己的
 * JSON 文件更简单，也不会和别的插件抢命名空间。
 *
 * ## 文件位置
 *
 * `<DSH_HOME>/dsh-qq-free-bot/lanes.json`，权限 0600。
 *
 * ## 容错
 *
 * 配置文件是用户可能手改的。任何读不懂的内容都不能让插件起不来：
 * 解析失败 → 备份坏文件 → 回落到默认值。
 *
 * @module src/product/lane-config.js
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { AUTO_MODEL, DEFAULT_LANES, isAutoLane, orderLanes } from './lane-fallback.js';
import { isDeepSeekModel } from './deepseek-filter.js';

/** 配置文件名。 */
const FILENAME = 'lanes.json';
/** 目录名（`<DSH_HOME>/` 下）。 */
const DIRNAME = 'dsh-qq-free-bot';
/**
 * 配置版本。
 *
 * 2：车道从「固定 model id」改成「自动选择」。
 *
 * ⚠️ 为什么必须靠版本号迁移：v1 的默认配置里写死了 `deepseek-v4.1-flash`，
 * 而 TRAE 的真实 id 是 `DeepSeek-V4-Flash` —— 那些车道会**静默失效**（被降级
 * 链跳过）。光看配置文件是看不出错的，只能整体升级到新版默认值。
 */
const VERSION = 2;

/**
 * 解析 DSH home。
 *
 * @param {object} [config]
 * @returns {string}
 */
export function resolveDshHome(config = {}) {
  if (typeof config.dshHome === 'string' && config.dshHome !== '') {
    return path.resolve(config.dshHome);
  }
  if (typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== '') {
    return path.resolve(process.env.DSH_HOME);
  }
  return path.join(os.homedir(), '.dsh');
}

/**
 * 默认配置。
 *
 * @returns {{version: number, lanes: Array<object>, freeFallback: boolean}}
 */
export function defaultConfig() {
  return {
    version: VERSION,
    lanes: DEFAULT_LANES.map((lane) => ({ ...lane, enabled: true })),
    freeFallback: false,
  };
}

/**
 * 规范化一份车道数组。
 *
 * 规则：
 *   - 丢掉结构不完整、或模型不是 DeepSeek 的条目（产品契约）；
 *   - 丢掉指向本适配器自己的条目（防递归）；
 *   - 同一 provider+model 只留第一个；
 *   - `enabled` 缺省为 `true`。
 *
 * @param {unknown} lanes
 * @returns {Array<object>}
 */
export function normalizeLanesConfig(lanes) {
  if (!Array.isArray(lanes)) return [];
  const seen = new Set();
  const result = [];
  for (const lane of orderLanes(lanes)) {
    // `auto` 车道没有固定模型 —— 它在调用时从渠道目录里挑，不能按 id 过滤。
    if (!isAutoLane(lane) && !isDeepSeekModel(lane.model)) continue;
    if (lane.provider === 'dsh-deepseek') continue;
    const key = `${lane.provider}::${lane.model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      provider: lane.provider,
      model: lane.model ?? AUTO_MODEL,
      ...(typeof lane.label === 'string' && lane.label !== '' ? { label: lane.label } : {}),
      enabled: lane.enabled !== false,
    });
  }
  return result;
}

/**
 * 规范化整份配置。
 *
 * @param {unknown} raw
 * @returns {{version: number, lanes: Array<object>, freeFallback: boolean}}
 */
export function normalizeConfig(raw) {
  const fallback = defaultConfig();
  if (!raw || typeof raw !== 'object') return fallback;
  // 旧版本一律回到默认值：v1 的固定 id 在新版里是错的，保留它只会留下死车道。
  if (raw.version !== VERSION) return fallback;
  const lanes = normalizeLanesConfig(raw.lanes);
  return {
    version: VERSION,
    // 车道为空时回落默认 —— 否则用户会得到一个「没有任何车道」的死配置，
    // 而设置页里也没有任何可点的东西。
    lanes: lanes.length > 0 ? lanes : fallback.lanes,
    freeFallback: raw.freeFallback === true,
  };
}

/**
 * 车道配置存储。
 */
export class LaneConfigStore {
  /**
   * @param {object} [options]
   * @param {string} [options.dshHome]
   * @param {object} [options.logger]
   */
  constructor({ dshHome, logger = console } = {}) {
    this.logger = logger;
    this.dir = path.join(resolveDshHome({ dshHome }), DIRNAME);
    this.file = path.join(this.dir, FILENAME);
    /** @type {ReturnType<typeof defaultConfig>|null} */
    this.value = null;
  }

  /**
   * 读取配置。第一次调用会落盘默认值。
   *
   * @returns {ReturnType<typeof defaultConfig>}
   */
  load() {
    if (this.value !== null) return this.value;
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        // 文件存在但读不懂 —— 先备份再从默认值开始，别让插件起不来。
        this.#quarantine();
        this.logger.warn?.(
          `[dsh-qq-free-bot] 车道配置无法解析，已重置为默认值：${error?.message ?? error}`,
        );
      }
      this.value = defaultConfig();
      this.#persist(this.value);
      return this.value;
    }
    this.value = normalizeConfig(raw);
    return this.value;
  }

  /**
   * 写入并落盘。
   *
   * @param {object} next
   * @returns {ReturnType<typeof defaultConfig>}
   */
  save(next) {
    // 调用方交进来的是「车道 + 开关」，版本号由存储自己盖 —— 否则 normalizeConfig
    // 会把它当成旧版本、直接回落默认值。
    this.value = normalizeConfig({ ...next, version: VERSION });
    this.#persist(this.value);
    return this.value;
  }

  /**
   * 恢复到默认配置。
   *
   * @returns {ReturnType<typeof defaultConfig>}
   */
  reset() {
    return this.save(defaultConfig());
  }

  /**
   * 原子写入：先写 `.tmp` 再改名。
   *
   * @param {object} value
   */
  #persist(value) {
    try {
      fs.mkdirSync(this.dir, { recursive: true, mode: 0o700 });
      const temporary = `${this.file}.tmp`;
      fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
      fs.renameSync(temporary, this.file);
    } catch (error) {
      this.logger.warn?.(
        `[dsh-qq-free-bot] 车道配置写入失败：${error?.message ?? error}`,
      );
    }
  }

  /** 把读不懂的配置文件挪到一边，保留现场供排查。 */
  #quarantine() {
    try {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.renameSync(this.file, `${this.file}.corrupt-${stamp}`);
    } catch {
      // 备份失败不该影响主流程。
    }
  }
}
