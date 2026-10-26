window.__ModuleLoader__.load({
  id: "dsh-qq-free-bot",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports, module2) {
    "use strict";
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module2.exports = debug;
  }
});

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports, module2) {
    "use strict";
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports, module2) {
    "use strict";
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports = module2.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var safeSrc = exports.safeSrc = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name2, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name2, index, value);
      t[name2] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports, module2) {
    "use strict";
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports, module2) {
    "use strict";
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports, module2) {
    "use strict";
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var isPrereleaseIdentifier = (prerelease, identifier) => {
      const identifiers = identifier.split(".");
      if (identifiers.length > prerelease.length) {
        return false;
      }
      for (let i = 0; i < identifiers.length; i++) {
        if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) {
          return false;
        }
      }
      return true;
    };
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id2) => {
            if (/^[0-9]+$/.test(id2)) {
              const num = +id2;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id2;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (isPrereleaseIdentifier(this.prerelease, identifier)) {
                const prereleaseBase = this.prerelease[identifier.split(".").length];
                if (isNaN(prereleaseBase)) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports, module2) {
    "use strict";
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports, module2) {
    "use strict";
    var parse = require_parse();
    var valid = (version, options) => {
      const v = parse(version, options);
      return v ? v.version : null;
    };
    module2.exports = valid;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports, module2) {
    "use strict";
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports, module2) {
    "use strict";
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module2.exports = rcompare;
  }
});

// src/product/client/entry.js
var entry_exports = {};
__export(entry_exports, {
  apply: () => apply2,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(entry_exports);

// plugin-src/management-rpc.mjs
function rpcEndpoint(channel) {
  if (!/^\/[A-Za-z0-9._~-]+$/.test(channel)) throw new TypeError("Invalid IM RPC channel");
  return `dsh-im${channel}`;
}
async function callManagementRpc(connection, channel, method, payload, signal) {
  try {
    return await connection.rpc.call("/api", rpcEndpoint(channel), { method, payload }, signal);
  } catch (cause) {
    if (signal?.aborted || cause?.name === "AbortError") throw cause;
    const error = new Error("\u65E0\u6CD5\u8BBF\u95EE DSH \u7BA1\u7406\u63A5\u53E3\uFF0C\u8BF7\u68C0\u67E5 DSH \u8FDE\u63A5\u6216\u91CD\u65B0\u767B\u5F55\u540E\u91CD\u8BD5\u3002", { cause });
    error.code = "management-unreachable";
    error.details = {
      operation: method,
      stage: "management.request",
      occurredAt: (/* @__PURE__ */ new Date()).toISOString(),
      ...Number.isInteger(cause?.status) && cause.status >= 100 && cause.status <= 599 ? { httpStatus: cause.status } : {}
    };
    throw error;
  }
}

// plugin-src/client/index.js
var React30 = __toESM(require("react"), 1);

// package.json
var package_default = {
  name: "bigfish-bot",
  version: "0.2.0",
  private: true,
  type: "module",
  description: "\u5927\u80A5\u9C7C BigFish\uFF1A\u4E00\u952E\u63A5\u5165\u591A\u5382\u5546\u8D26\u53F7\uFF0C\u96C6\u4E2D\u4F7F\u7528\u514D\u8D39\u989D\u5EA6\u4E0E\u7B7E\u5230\u79EF\u5206\uFF0C\u81EA\u52A8\u9009\u62E9\u6A21\u578B\u6E20\u9053\uFF0C\u63A5\u5165 QQ \u81EA\u7136\u7FA4\u804A\u3002",
  main: "./lib/index.js",
  exports: {
    ".": "./lib/index.js",
    "./client": "./lib/client.js",
    "./package.json": "./package.json"
  },
  scripts: {
    build: "npm --prefix standalone run build",
    migrate: "node scripts/migrate.mjs",
    check: "npm run local:check && npm run legacy:check",
    test: "node --test test/*.test.mjs",
    verify: "node scripts/verify-imports.mjs && node scripts/verify-client.mjs",
    start: "node standalone/server/index.mjs",
    "local:install": "npm --prefix standalone ci",
    "local:build": "npm --prefix standalone run build",
    "local:check": "npm --prefix standalone run check",
    "legacy:build": "node scripts/build-host.mjs && node plugin-src/client/build.mjs",
    "legacy:check": "npm run legacy:build && npm run verify && npm test"
  },
  files: [
    "lib",
    "locale/*.json",
    "plugin-src",
    "src",
    "vendor",
    "LICENSE",
    "LICENSE.upstream-dsh-im",
    "LICENSE.upstream-dsh-our-free-model",
    "README.md",
    "THIRD_PARTY_NOTICES.md",
    "cordis.patch.yml"
  ],
  keywords: [
    "bigfish",
    "qq",
    "qqbot",
    "napcat",
    "onebot",
    "chatbot",
    "agent",
    "deepseek"
  ],
  author: "BigFish contributors",
  license: "MIT",
  engines: {
    node: ">=22.19"
  },
  dependencies: {
    "@tencent-connect/qqbot-connector": "1.2.0",
    "@tencent-connect/qqbot-nodejs": "1.0.4",
    qrcode: "1.5.4",
    undici: "7.29.1"
  },
  peerDependencies: {
    "@deepseek-ai/cordis": "^4.0.2",
    "@deepseek-ai/dsh-commands": "^0.1.7-rc.2 || ^0.2.0-rc.1 || ^0.2.1-rc.2",
    "@deepseek-ai/dsh-credentials": "^0.1.7-rc.2 || ^0.2.0-rc.1 || ^0.2.1-rc.2",
    "@deepseek-ai/dsh-llm": "^0.1.7-rc.2 || ^0.2.0-rc.1 || ^0.2.1-rc.2"
  },
  devDependencies: {
    "@deepseek-ai/cordis": "4.0.5",
    esbuild: "0.25.9",
    react: "18.3.1",
    "react-dom": "18.3.1",
    semver: "7.8.5"
  },
  dsh: {
    bundle: {
      patch: "./cordis.patch.yml"
    },
    client: {
      inject: [
        "@deepseek-ai/dsh-client-connection",
        "@deepseek-ai/dsh-client-runtime",
        "@deepseek-ai/dsh-client-ui-settings",
        "@deepseek-ai/dsh-client-ui-slots",
        "@deepseek-ai/dsh-client-locale"
      ],
      platform: "web"
    },
    compatibility: {
      dsh: "0.2.1-rc.2",
      profiles: [
        "web"
      ]
    }
  },
  homepage: "https://github.com/Ningsui0714/bigfish-bot#readme",
  repository: {
    type: "git",
    url: "git+https://github.com/Ningsui0714/bigfish-bot.git"
  },
  bugs: {
    url: "https://github.com/Ningsui0714/bigfish-bot/issues"
  }
};

// src/product/client/deepseek-settings.js
var React = __toESM(require("react"), 1);

// src/product/lane-rpc-shared.js
var MODEL_LANE_ENDPOINTS = Object.freeze({
  status: "lane.status",
  update: "lane.update",
  reset: "lane.reset",
  move: "lane.move",
  toggle: "lane.toggle",
  fallback: "lane.fallback"
});

// src/product/client/channel-rpc-client.js
var CHANNEL_RPC_PATH = "channel-pack";
async function callChannelRpc(connection, method, payload = {}, signal) {
  if (typeof connection?.rpc?.call !== "function") {
    throw new Error("DSH \u8FDE\u63A5\u4E0D\u53EF\u7528\uFF0C\u65E0\u6CD5\u64CD\u4F5C\u8D26\u53F7\u6E20\u9053");
  }
  const result2 = await connection.rpc.call("/api", CHANNEL_RPC_PATH, { method, payload }, signal);
  if (result2?.ok === true) return result2.value;
  if (result2?.ok === false) {
    throw new Error(result2.error?.message ?? result2.error?.code ?? "\u6E20\u9053\u64CD\u4F5C\u5931\u8D25");
  }
  return result2;
}
var LOGIN_PROVIDERS = Object.freeze([
  { id: "codearts", label: "CodeArts\uFF08\u534E\u4E3A\u4E91\uFF09", hint: "\u6BCF\u65E5\u7B7E\u5230\u79EF\u5206\uFF0CDeepSeek \u5728\u514D\u8D39\u96C6\u5408\u91CC" },
  { id: "trae", label: "TRAE\uFF08\u5B57\u8282\uFF09", hint: "\u6BCF\u65E5\u7B7E\u5230\uFF0C\u6309\u5929\u91CD\u7F6E" },
  { id: "lobsterai", label: "\u6709\u9053 LobsterAI", hint: "\u6BCF\u65E5\u7B7E\u5230\uFF08\u5E42\u7B49\uFF09" },
  { id: "zcode", label: "\u667A\u8C31 ZCode", hint: "\u51ED\u636E\u4E0D\u53EF\u7EED\u671F\uFF0C\u5931\u6548\u8981\u91CD\u65B0\u767B\u5F55" },
  { id: "cline", label: "Cline", hint: "\u6709\u72EC\u7ACB\u514D\u8D39\u6A21\u578B id" },
  { id: "loomy", label: "\u8BAF\u98DE Loomy", hint: "\u6BCF\u65E5\u8D60\u9001\u6C60\uFF0C14 \u5929\u9700\u91CD\u767B" },
  { id: "raccoon", label: "\u5546\u6C64 Raccoon", hint: "\u6CE8\u518C\u793C\u5305 + \u6BCF\u65E5\u81EA\u52A8\u53D1\u653E" },
  { id: "minimax", label: "MiniMax Code", hint: "\u6BCF\u65E5\u7B7E\u5230" },
  { id: "gemini", label: "Gemini Code Assist", hint: "\u914D\u989D\u7A97\u53E3\uFF085 \u5C0F\u65F6 / \u5468\uFF09" },
  { id: "qoder", label: "Qoder", hint: "\u6BCF\u65E5\u9886\u53D6\uFF0C\u6709\u6548\u671F 30 \u5929" },
  { id: "qodercn", label: "Qoder \u4E2D\u56FD\u7248", hint: "\u6BCF\u65E5\u9886\u53D6\uFF0C\u6709\u6548\u671F 30 \u5929" }
]);

// src/product/client/deepseek-settings.js
var { createElement: h, useState, useEffect, useCallback } = React;
var STYLE_ATTR = "data-plugin";
var STYLE_VALUE = "dsh-qq-free-bot";
var styles = `
.qqfb_page { display: flex; flex-direction: column; gap: 16px; padding: 4px 2px 24px; }
.qqfb_head { display: flex; flex-direction: column; gap: 4px; }
.qqfb_head strong { font-size: 15px; font-weight: 600; }
.qqfb_head p { margin: 0; font-size: 12px; color: var(--dsw-alias-label-tertiary); line-height: 1.6; }
.qqfb_card { border: 1px solid var(--dsw-alias-border-l2); border-radius: 14px; background: var(--dsw-alias-bg-layer-2); padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
.qqfb_cardTitle { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
.qqfb_hint { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); line-height: 1.6; }
.qqfb_row { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 10px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-3); }
.qqfb_row[data-off="true"] { opacity: .5; }
.qqfb_idx { width: 20px; text-align: center; font-variant-numeric: tabular-nums; font-size: 11px; color: var(--dsw-alias-label-tertiary); flex: none; }
.qqfb_rowMain { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.qqfb_rowName { font-size: 12.5px; font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qqfb_rowId { font-size: 11px; color: var(--dsw-alias-label-tertiary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qqfb_badge { flex: none; font-size: 10.5px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.qqfb_badge[data-tone="ok"] { border-color: color-mix(in srgb, #2f9e62 55%, transparent); color: #2f9e62; }
.qqfb_badge[data-tone="warn"] { border-color: color-mix(in srgb, #d9812f 55%, transparent); color: #d9812f; }
.qqfb_badge[data-tone="off"] { border-color: var(--dsw-alias-border-l1); color: var(--dsw-alias-label-tertiary); }
.qqfb_icon { width: 24px; height: 24px; flex: none; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--dsw-alias-border-l2); border-radius: 7px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); cursor: pointer; font-size: 12px; line-height: 1; padding: 0; }
.qqfb_icon:hover:not(:disabled) { color: var(--dsw-alias-label-primary); }
.qqfb_icon:disabled { opacity: .35; cursor: default; }
.qqfb_actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.qqfb_btn { font: inherit; font-size: 12px; font-weight: 550; padding: 6px 13px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); cursor: pointer; }
.qqfb_btn:hover:not(:disabled) { border-color: var(--dsw-alias-state-business-primary, #4b6fff); }
.qqfb_btn:disabled { opacity: .45; cursor: default; }
.qqfb_switch { display: inline-flex; align-items: center; gap: 9px; cursor: pointer; user-select: none; font-size: 12.5px; }
.qqfb_switch input { width: 16px; height: 16px; accent-color: var(--dsw-alias-state-business-primary, #4b6fff); cursor: inherit; }
.qqfb_meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 11.5px; color: var(--dsw-alias-label-tertiary); }
.qqfb_meta b { color: var(--dsw-alias-label-primary); font-weight: 600; }
.qqfb_error { padding: 9px 12px; border-radius: 10px; border: 1px solid color-mix(in srgb, #c94a4a 50%, transparent); background: color-mix(in srgb, #c94a4a 10%, transparent); font-size: 12px; line-height: 1.6; }
.qqfb_empty { font-size: 12px; color: var(--dsw-alias-label-tertiary); padding: 10px 0; }
.qqfb_prov { display: flex; flex-direction: column; gap: 6px; padding: 10px 11px; border-radius: 10px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-3); }
.qqfb_provHead { display: flex; align-items: center; gap: 9px; }
.qqfb_provName { font-size: 12.5px; font-weight: 550; }
.qqfb_provHint { font-size: 11px; color: var(--dsw-alias-label-tertiary); margin-left: auto; text-align: right; }
.qqfb_account { display: flex; align-items: center; gap: 8px; padding-left: 2px; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
.qqfb_accountId { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10.5px; color: var(--dsw-alias-label-tertiary); }
.qqfb_link { font-size: 11.5px; color: var(--dsw-alias-state-business-primary, #4b6fff); background: none; border: 0; padding: 0; cursor: pointer; text-decoration: underline; font-family: inherit; }
.qqfb_pending { font-size: 11.5px; color: var(--dsw-alias-state-warning-primary, #d9812f); }
`;
function installStyles() {
  if (typeof document === "undefined") return () => {
  };
  const existing = document.querySelector(`style[${STYLE_ATTR}="${STYLE_VALUE}"]`);
  if (existing !== null) return () => {
  };
  const element = document.createElement("style");
  element.setAttribute(STYLE_ATTR, STYLE_VALUE);
  element.textContent = styles;
  document.head.appendChild(element);
  return () => {
    element.remove();
  };
}
function channelPackBadge(state) {
  switch (state) {
    case "mounted":
      return { text: "\u6E20\u9053\u5305\u5DF2\u6302\u8F7D", tone: "ok" };
    case "reused":
      return { text: "\u590D\u7528\u5176\u5B83\u63D2\u4EF6\u7684\u6E20\u9053", tone: "ok" };
    case "failed":
      return { text: "\u6E20\u9053\u5305\u52A0\u8F7D\u5931\u8D25", tone: "warn" };
    case "absent":
      return { text: "\u672A\u914D\u7F6E\u6E20\u9053\u5305", tone: "warn" };
    default:
      return { text: "\u6E20\u9053\u5305\u52A0\u8F7D\u4E2D", tone: "off" };
  }
}
function laneBadge(lane, loggedIn) {
  if (lane.enabled === false) return { text: "\u5DF2\u505C\u7528", tone: "off" };
  if (!lane.providerRegistered) return { text: "\u6E20\u9053\u672A\u6CE8\u518C", tone: "warn" };
  if (loggedIn === false) return { text: "\u672A\u767B\u5F55", tone: "warn" };
  if (!lane.channelServicePresent) return { text: "\u6E20\u9053\u4E0D\u53EF\u7528", tone: "warn" };
  return { text: "\u53EF\u7528", tone: "ok" };
}
function Badge({ text: text3, tone }) {
  return h("span", { className: "qqfb_badge", "data-tone": tone }, text3);
}
function LaneRow({ lane, busy, onMove, onToggle, total, loggedIn }) {
  const badge = laneBadge(lane, loggedIn);
  return h(
    "div",
    { className: "qqfb_row", "data-off": lane.enabled === false },
    h("span", { className: "qqfb_idx" }, String(lane.index + 1)),
    h(
      "div",
      { className: "qqfb_rowMain" },
      h("span", { className: "qqfb_rowName" }, lane.label),
      h(
        "span",
        { className: "qqfb_rowId" },
        lane.model === "auto" ? `${lane.provider} / \u81EA\u52A8\u9009\u62E9 DeepSeek` : `${lane.provider} / ${lane.model}`
      )
    ),
    h(Badge, badge),
    h("button", {
      type: "button",
      className: "qqfb_icon",
      title: "\u4E0A\u79FB\uFF08\u66F4\u4F18\u5148\u5C1D\u8BD5\uFF09",
      "aria-label": `\u4E0A\u79FB ${lane.label}`,
      disabled: busy || lane.index === 0,
      onClick: () => onMove(lane.index, lane.index - 1)
    }, "\u2191"),
    h("button", {
      type: "button",
      className: "qqfb_icon",
      title: "\u4E0B\u79FB\uFF08\u66F4\u665A\u5C1D\u8BD5\uFF09",
      "aria-label": `\u4E0B\u79FB ${lane.label}`,
      disabled: busy || lane.index === total - 1,
      onClick: () => onMove(lane.index, lane.index + 1)
    }, "\u2193"),
    h("button", {
      type: "button",
      className: "qqfb_icon",
      title: lane.enabled === false ? "\u542F\u7528\u8FD9\u6761\u8F66\u9053" : "\u505C\u7528\u8FD9\u6761\u8F66\u9053",
      "aria-label": `${lane.enabled === false ? "\u542F\u7528" : "\u505C\u7528"} ${lane.label}`,
      disabled: busy,
      onClick: () => onToggle(lane.index)
    }, lane.enabled === false ? "\u25CB" : "\u25CF")
  );
}
function AccountChannels({ channelRpc, onChanged, onAccounts }) {
  const [accounts, setAccounts] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState({});
  const [links, setLinks] = useState({});
  const refresh = useCallback(async () => {
    const results = await Promise.all(LOGIN_PROVIDERS.map(async (provider) => {
      try {
        const value = await channelRpc("account.list", { provider: provider.id });
        return Array.isArray(value?.accounts) ? value.accounts : [];
      } catch {
        return [];
      }
    }));
    const flat = results.flat();
    setAccounts(flat);
    onAccounts?.(flat);
  }, [channelRpc, onAccounts]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const poll = useCallback(async (accountId, provider) => {
    const deadline = Date.now() + 5 * 6e4;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      let value;
      try {
        value = await channelRpc("login.poll", { accountId });
      } catch {
        continue;
      }
      if (value?.done !== true) continue;
      setPending((current) => {
        const next = { ...current };
        delete next[provider];
        return next;
      });
      if (value.success === true) {
        setLinks((current) => {
          const next = { ...current };
          delete next[provider];
          return next;
        });
        await refresh();
        onChanged?.();
      } else {
        setError(value.error?.message ?? `${provider} \u767B\u5F55\u672A\u5B8C\u6210`);
        await refresh();
      }
      return;
    }
    setPending((current) => {
      const next = { ...current };
      delete next[provider];
      return next;
    });
    setError(`${provider} \u767B\u5F55\u7B49\u5F85\u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5`);
  }, [channelRpc, refresh, onChanged]);
  const login = useCallback(async (provider) => {
    setError(null);
    setPending((current) => ({ ...current, [provider]: true }));
    try {
      const value = await channelRpc("account.create", { provider });
      const url = value?.loginUrl;
      if (typeof url === "string" && url !== "") {
        const popup = window.open(url, "_blank", "noopener,noreferrer");
        if (!popup) {
          setLinks((current) => ({ ...current, [provider]: url }));
        }
      }
      void poll(value?.accountId, provider);
    } catch (cause) {
      setPending((current) => {
        const next = { ...current };
        delete next[provider];
        return next;
      });
      setError(cause?.message ?? String(cause));
    }
  }, [channelRpc, poll]);
  const remove = useCallback(async (accountId) => {
    setError(null);
    try {
      await channelRpc("account.delete", { accountId });
      await refresh();
      onChanged?.();
    } catch (cause) {
      setError(cause?.message ?? String(cause));
    }
  }, [channelRpc, refresh, onChanged]);
  return h(
    "div",
    { className: "qqfb_card" },
    h("div", { className: "qqfb_cardTitle" }, "\u8D26\u53F7\u767B\u5F55"),
    h(
      "div",
      { className: "qqfb_hint" },
      "\u8FD9\u4E9B\u662F\u5404\u5BB6\u5B98\u65B9\u6E20\u9053\u7684\u514D\u8D39\u989D\u5EA6\uFF0C\u767B\u5F55\u4E00\u6B21\u5373\u53EF\uFF08\u591A\u6570\u6309\u5929\u91CD\u7F6E\uFF09\u3002\u767B\u5F55\u540E\u4F1A\u51FA\u73B0\u5728\u4E0A\u9762\u7684\u964D\u7EA7\u94FE\u91CC\u3002\u70B9\u300C\u767B\u5F55\u300D\u4F1A\u6253\u5F00\u5B98\u65B9\u6388\u6743\u9875\uFF0C\u5B8C\u6210\u6388\u6743\u540E\u81EA\u52A8\u56DE\u6765\u3002"
    ),
    error !== null ? h("div", { className: "qqfb_error", role: "alert" }, error) : null,
    accounts === null ? h("div", { className: "qqfb_empty" }, "\u6B63\u5728\u8BFB\u53D6\u5DF2\u6709\u8D26\u53F7\u2026") : null,
    // ⚠️ provider 列表**不等账号列表**：登录按钮必须立刻可点，否则用户会以为
    // 页面还没准备好。账号为空时 `owned` 自然为空，渲染结果一样。
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 7 } },
      LOGIN_PROVIDERS.map((provider) => {
        const owned = (accounts ?? []).filter((account) => account.provider === provider.id);
        const ready = owned.filter((account) => account.source !== void 0);
        const busy = pending[provider.id] === true;
        return h(
          "div",
          { key: provider.id, className: "qqfb_prov" },
          h(
            "div",
            { className: "qqfb_provHead" },
            h("span", { className: "qqfb_provName" }, provider.label),
            h(Badge, ready.length > 0 ? { text: `${ready.length} \u4E2A\u8D26\u53F7`, tone: "ok" } : owned.length > 0 ? { text: "\u672A\u5B8C\u6210", tone: "warn" } : { text: "\u672A\u767B\u5F55", tone: "off" }),
            busy ? h("span", { className: "qqfb_pending" }, "\u7B49\u5F85\u6388\u6743\u2026") : null,
            h("button", {
              type: "button",
              className: "qqfb_btn",
              style: { marginLeft: "auto", padding: "4px 11px" },
              disabled: busy,
              onClick: () => void login(provider.id)
            }, busy ? "\u767B\u5F55\u4E2D\u2026" : "\u767B\u5F55")
          ),
          h("div", { className: "qqfb_provHint" }, provider.hint),
          links[provider.id] !== void 0 ? h("button", {
            type: "button",
            className: "qqfb_link",
            onClick: () => window.open(links[provider.id], "_blank", "noopener,noreferrer")
          }, "\u5F39\u7A97\u88AB\u62E6\u622A\uFF0C\u70B9\u8FD9\u91CC\u6253\u5F00\u6388\u6743\u9875") : null,
          owned.map((account) => h(
            "div",
            { key: account.id, className: "qqfb_account" },
            account.source === void 0 ? h("span", { className: "qqfb_pending" }, "\u672A\u5B8C\u6210\u767B\u5F55") : h("span", null, account.nickname ?? account.id),
            h("span", { className: "qqfb_accountId" }, account.id),
            h("button", {
              type: "button",
              className: "qqfb_link",
              onClick: () => void remove(account.id)
            }, "\u5220\u9664")
          ))
        );
      })
    )
  );
}
function DeepSeekSettingsPage({ rpcCall, channelRpc }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState(null);
  const handleAccounts = useCallback((next) => setAccounts(next), []);
  const load = useCallback(async () => {
    setError(null);
    try {
      const result2 = await rpcCall(MODEL_LANE_ENDPOINTS.status, {});
      if (result2?.ok !== true) throw new Error(result2?.error?.message ?? "\u8BFB\u53D6\u8F66\u9053\u72B6\u6001\u5931\u8D25");
      setState(result2.value);
    } catch (cause) {
      setError(cause?.message ?? String(cause));
    } finally {
      setLoaded(true);
    }
  }, [rpcCall]);
  useEffect(() => {
    void load();
  }, [load]);
  const mutate = useCallback(async (endpoint, payload) => {
    setBusy(true);
    setError(null);
    try {
      const result2 = await rpcCall(endpoint, payload);
      if (result2?.ok !== true) throw new Error(result2?.error?.message ?? "\u8BBE\u7F6E\u672A\u751F\u6548");
      setState(result2.value);
    } catch (cause) {
      setError(cause?.message ?? String(cause));
    } finally {
      setBusy(false);
    }
  }, [rpcCall]);
  const loading = state === null;
  const pack = channelPackBadge(state?.channelPack);
  const lanes = Array.isArray(state?.lanes) ? state.lanes : [];
  const channels = Array.isArray(state?.channels) ? state.channels : [];
  return h(
    "section",
    { className: "qqfb_page", "aria-label": "\u514D\u5145\u503C DeepSeek \u8BBE\u7F6E" },
    h(
      "header",
      { className: "qqfb_head" },
      h("strong", null, "\u514D\u5145\u503C DeepSeek"),
      h(
        "p",
        null,
        "QQ \u673A\u5668\u4EBA\u53EA\u4F7F\u7528 DeepSeek \u6A21\u578B\u3002\u8FD9\u4E9B\u6A21\u578B\u6765\u81EA\u5404\u8D26\u53F7\u6E20\u9053\u7684\u5B98\u65B9\u514D\u8D39\u989D\u5EA6\uFF0C\u6309\u4E0B\u9762\u7684\u987A\u5E8F\u4F9D\u6B21\u5C1D\u8BD5\uFF0C\u524D\u4E00\u6761\u4E0D\u53EF\u7528\u5C31\u81EA\u52A8\u6362\u4E0B\u4E00\u6761\u3002"
      )
    ),
    error !== null ? h("div", { className: "qqfb_error", role: "alert" }, error) : null,
    h(
      "div",
      { className: "qqfb_card" },
      h("div", { className: "qqfb_cardTitle" }, "\u8D26\u53F7\u6E20\u9053", h(Badge, pack)),
      loading ? h("div", { className: "qqfb_empty" }, "\u6B63\u5728\u8BFB\u53D6\u6E20\u9053\u72B6\u6001\u2026") : h(
        "div",
        { className: "qqfb_meta" },
        h("span", null, "\u5DF2\u6302\u8F7D\u6E20\u9053\u670D\u52A1 ", h("b", null, String(channels.length))),
        h("span", null, "\u751F\u6548\u8F66\u9053 ", h("b", null, String(state.effective?.length ?? 0)))
      ),
      h(
        "div",
        { className: "qqfb_hint" },
        channels.length === 0 ? "\u8FD8\u6CA1\u6709\u6E20\u9053\u6302\u4E0A\u3002\u6E20\u9053\u5305\u6302\u8F7D\u6210\u529F\u540E\u4F1A\u5728\u8FD9\u91CC\u5217\u51FA\uFF1B\u4E0B\u9762\u7684\u767B\u5F55\u9762\u677F\u53EF\u76F4\u63A5\u767B\u5F55\u3002" : `\u5DF2\u6302\u8F7D\uFF1A${channels.join("\u3001")}\u3002`
      )
    ),
    // 登录面板必须先于降级顺序出现：没有账号就没有车道，顺序先摆出来是空的。
    channelRpc ? h(AccountChannels, {
      channelRpc,
      onChanged: () => void load(),
      onAccounts: handleAccounts
    }) : null,
    h(
      "div",
      { className: "qqfb_card" },
      h("div", { className: "qqfb_cardTitle" }, "\u964D\u7EA7\u987A\u5E8F"),
      h(
        "div",
        { className: "qqfb_hint" },
        "\u8D8A\u9760\u524D\u8D8A\u4F18\u5148\u3002\u67D0\u6761\u8F66\u9053\u5728\u5410\u51FA\u7B2C\u4E00\u4E2A\u5B57\u4E4B\u524D\u5931\u8D25\uFF08\u79EF\u5206\u7528\u5B8C\u3001\u767B\u5F55\u8FC7\u671F\u3001\u8D85\u65F6\uFF09\uFF0C\u5C31\u4F1A\u81EA\u52A8\u6362\u4E0B\u4E00\u6761\uFF0C\u804A\u5929\u91CC\u770B\u4E0D\u51FA\u6765\u3002"
      ),
      loading ? h("div", { className: "qqfb_empty" }, "\u6B63\u5728\u8BFB\u53D6\u8F66\u9053\u2026") : lanes.length === 0 ? h("div", { className: "qqfb_empty" }, "\u6CA1\u6709\u8F66\u9053\u3002\u70B9\u300C\u6062\u590D\u9ED8\u8BA4\u987A\u5E8F\u300D\u91CD\u65B0\u751F\u6210\u3002") : h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 7 } },
        lanes.map((lane) => h(LaneRow, {
          key: `${lane.provider}::${lane.model}`,
          lane,
          busy,
          total: lanes.length,
          onMove: (index, to) => void mutate(MODEL_LANE_ENDPOINTS.move, { index, to }),
          onToggle: (index) => void mutate(MODEL_LANE_ENDPOINTS.toggle, { index }),
          loggedIn: accounts === null ? void 0 : accounts.some((account) => account.provider === lane.provider && account.source !== void 0)
        }))
      )
    ),
    h(
      "div",
      { className: "qqfb_card" },
      h("div", { className: "qqfb_cardTitle" }, "\u514D\u8D39\u515C\u5E95"),
      h(
        "label",
        { className: "qqfb_switch" },
        h("input", {
          type: "checkbox",
          checked: state?.fallback?.enabled === true,
          disabled: busy || loading,
          onChange: (event) => void mutate(MODEL_LANE_ENDPOINTS.fallback, {
            enabled: event.target.checked
          })
        }),
        "\u6240\u6709 DeepSeek \u8F66\u9053\u90FD\u4E0D\u53EF\u7528\u65F6\uFF0C\u7528 Kilo \u516C\u5171\u514D\u8D39\u6C60\u515C\u5E95\u56DE\u7B54"
      ),
      h(
        "div",
        { className: "qqfb_hint" },
        "\u515C\u5E95\u8F66\u9053\u7528\u7684\u662F\u975E DeepSeek \u6A21\u578B\uFF08Kilo \u5B98\u65B9\u6807\u6CE8\u514D\u8D39\u3001\u65E0\u9700\u8D26\u53F7\uFF09\uFF0C\u53EA\u4E3A\u4E86\u8BA9\u673A\u5668\u4EBA\u300C\u81F3\u5C11\u8FD8\u80FD\u56DE\u4E00\u53E5\u8BDD\u300D\uFF0C\u4E0D\u4F1A\u51FA\u73B0\u5728\u6A21\u578B\u9009\u62E9\u5668\u91CC\u3002"
      )
    ),
    h(
      "div",
      { className: "qqfb_actions" },
      h("button", {
        type: "button",
        className: "qqfb_btn",
        disabled: busy || loading,
        onClick: () => void mutate(MODEL_LANE_ENDPOINTS.reset, {})
      }, "\u6062\u590D\u9ED8\u8BA4\u987A\u5E8F"),
      h("button", {
        type: "button",
        className: "qqfb_btn",
        disabled: busy,
        onClick: () => void load()
      }, loading ? "\u91CD\u8BD5\u8BFB\u53D6" : "\u5237\u65B0")
    )
  );
}
function installDeepSeekStyles() {
  return installStyles();
}

// plugin-src/client/channel-logos.js
var React2 = __toESM(require("react"), 1);
var h2 = React2.createElement;
function dimensions(size) {
  return size === void 0 ? {} : { width: size, height: size };
}
function WeixinLogoGlyph({ size } = {}) {
  return h2("svg", {
    ...dimensions(size),
    viewBox: "0 0 24 24",
    focusable: "false",
    "aria-hidden": "true",
    "data-im-channel-logo": "weixin"
  }, h2("path", {
    fill: "currentColor",
    d: "M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"
  }));
}
function FeishuLogoGlyph({ size } = {}) {
  return h2(
    "svg",
    {
      ...dimensions(size),
      viewBox: "0 0 24 24",
      focusable: "false",
      "aria-hidden": "true",
      "data-im-channel-logo": "feishu"
    },
    h2("path", { fill: "#00D6B9", d: "M7.2 4.5h7.6c1.2 0 2.1.55 2.7 1.58 1.05 1.8 1.55 3.45 1.58 4.95-2.04-.62-4.2-.15-6.22 1.45C11.3 9.7 9.42 7.04 7.2 4.5Z" }),
    h2("path", { fill: "#1456B8", d: "M10.8 13.55c3.3-2.93 5.72-4.24 9.47-2.52-1.2 1.45-2.27 4.18-3.86 5.43-1.67 1.31-3.9.5-5.61-.64v-2.27Z" }),
    h2("path", { fill: "#3370FF", d: "M4.4 8.35c3.47 3.61 7.25 6.1 10.33 5.7 1.06-.14 2.2-.72 3.4-1.72-1.04 2.65-2.6 4.8-5.06 6-2.46 1.2-5.56.52-7.42-.72A2.76 2.76 0 0 1 4.4 15.3V8.35Z" })
  );
}
function DingtalkLogoGlyph({ size } = {}) {
  return h2("svg", {
    ...dimensions(size),
    viewBox: "0 0 48 48",
    focusable: "false",
    "aria-hidden": "true",
    "data-im-channel-logo": "dingtalk"
  }, h2("path", {
    fill: "currentColor",
    d: "M37.05 22.783c-6.758-5.216-14.378-12.128-22.73-19.538-.655-.585-1.242-.354-1.536.42-1.88 4.973-.058 9.386 2.889 11.932s7.368 4.912 10.058 6.155c.105.049.013.203-.093.163-4.953-2.182-8.397-3.765-13.07-7.368-.497-.388-1.01-.242-1.07.521-.384 4.748 2.657 8.483 6.058 9.745 2.1.781 4.398 1.212 6.53 1.474.109.015.084.178-.027.178-2.747.01-6.058-.654-8.935-1.751-.606-.233-.818.25-.722.633.491 2.008 2.974 5.076 6.926 5.73a12 12 0 0 0 2.228.115c.164 0 .208.089.154.217q-2.685 4.6-2.803 4.797c-.091.152-.036.275.156.275h3.543c.164 0 .264.106.18.246l-4.958 8.196c-.191.328.035.565.395.301s15.212-11.133 15.636-11.448c.195-.142.148-.327-.124-.327h-3.18c-.206 0-.252-.14-.111-.28.14-.141 3.602-3.594 4.837-4.888 1.283-1.35 1.938-3.825-.231-5.498"
  }));
}
function QqLogoGlyph({ size } = {}) {
  return h2("svg", {
    ...dimensions(size),
    viewBox: "0 0 24 24",
    focusable: "false",
    "aria-hidden": "true",
    "data-im-channel-logo": "qq"
  }, h2("path", {
    fill: "currentColor",
    d: "M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"
  }));
}
function WecomLogoGlyph2({ size } = {}) {
  return h2(
    "svg",
    {
      ...dimensions(size),
      viewBox: "0 0 24 24",
      focusable: "false",
      "aria-hidden": "true",
      "data-im-channel-logo": "wecom"
    },
    h2("path", {
      fill: "none",
      stroke: "#3370FF",
      strokeWidth: "2.35",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M17.7 14.5c1.05-1.12 1.65-2.52 1.65-4.03 0-3.82-3.58-6.92-8-6.92s-8 3.1-8 6.92 3.58 6.92 8 6.92c1.17 0 2.28-.22 3.28-.62"
    }),
    h2("path", { fill: "#07C160", d: "M16.1 15.15c.7-.7 1.83-.7 2.53 0s.7 1.83 0 2.53-1.83.7-2.53 0-.7-1.83 0-2.53Z" }),
    h2("path", { fill: "#FFB800", d: "M19.25 13.45a1.36 1.36 0 1 1 1.92 1.92 1.36 1.36 0 0 1-1.92-1.92Z" }),
    h2("path", { fill: "#FF7A00", d: "M19.55 18.05a1.16 1.16 0 1 1 1.64 1.64 1.16 1.16 0 0 1-1.64-1.64Z" }),
    h2("path", { fill: "#3370FF", d: "M15.25 18.75a.92.92 0 1 1 1.3 1.3.92.92 0 0 1-1.3-1.3Z" })
  );
}
function TelegramLogoGlyph({ size } = {}) {
  return h2("svg", {
    ...dimensions(size),
    viewBox: "0 0 24 24",
    focusable: "false",
    "aria-hidden": "true",
    "data-im-channel-logo": "telegram"
  }, h2("path", {
    fill: "currentColor",
    d: "M23.95 4.57c-.36-1.45-1.43-1.76-2.82-1.24L1.5 10.9c-1.34.52-1.32 1.27-.24 1.6l5.03 1.57 11.66-7.36c.55-.34 1.05-.16.64.21l-9.44 8.52-.37 5.12c.54 0 .78-.24 1.08-.53l2.59-2.51 5.38 3.97c.99.55 1.7.27 1.95-.92L23.95 4.57Z"
  }));
}
function DiscordLogoGlyph({ size } = {}) {
  return h2("svg", {
    ...dimensions(size),
    viewBox: "0 0 24 24",
    focusable: "false",
    "aria-hidden": "true",
    "data-im-channel-logo": "discord"
  }, h2("path", {
    fill: "currentColor",
    d: "M20.32 4.37a19.8 19.8 0 0 0-4.89-1.51c-.21.38-.46.89-.63 1.29a18.4 18.4 0 0 0-5.59 0 13 13 0 0 0-.64-1.29c-1.71.29-3.36.8-4.89 1.52C.59 9.09-.25 13.68.17 18.2a19.9 19.9 0 0 0 6 3.04c.48-.66.91-1.36 1.28-2.1-.7-.26-1.37-.58-2-.96.17-.12.33-.25.49-.38 3.86 1.79 8.04 1.79 11.86 0 .16.13.32.26.49.38-.64.38-1.31.7-2.01.97.37.73.8 1.44 1.28 2.09a19.8 19.8 0 0 0 6-3.04c.49-5.24-.84-9.79-3.24-13.83ZM8.02 15.42c-1.16 0-2.11-1.07-2.11-2.38s.93-2.38 2.11-2.38c1.18 0 2.13 1.08 2.11 2.38 0 1.31-.93 2.38-2.11 2.38Zm7.95 0c-1.16 0-2.11-1.07-2.11-2.38s.93-2.38 2.11-2.38c1.18 0 2.13 1.08 2.11 2.38 0 1.31-.93 2.38-2.11 2.38Z"
  }));
}
function SlackLogoGlyph({ size } = {}) {
  return h2(
    "svg",
    {
      ...dimensions(size),
      viewBox: "0 0 100 100",
      focusable: "false",
      "aria-hidden": "true",
      "data-im-channel-logo": "slack"
    },
    h2("path", {
      fill: "#36C5F0",
      d: "M36.5 0A10.5 10.5 0 0 0 36.5 21H47V10.5A10.5 10.5 0 0 0 36.5 0ZM10.5 26a10.5 10.5 0 0 0 0 21h26a10.5 10.5 0 0 0 0-21Z"
    }),
    h2("path", {
      fill: "#2EB67D",
      d: "M100 36.5A10.5 10.5 0 0 0 79 36.5V47h10.5A10.5 10.5 0 0 0 100 36.5ZM74 10.5a10.5 10.5 0 0 0-21 0v26a10.5 10.5 0 0 0 21 0Z"
    }),
    h2("path", {
      fill: "#ECB22E",
      d: "M63.5 100a10.5 10.5 0 0 0 0-21H53v10.5A10.5 10.5 0 0 0 63.5 100ZM89.5 74a10.5 10.5 0 0 0 0-21h-26a10.5 10.5 0 0 0 0 21Z"
    }),
    h2("path", {
      fill: "#E01E5A",
      d: "M0 63.5a10.5 10.5 0 0 0 21 0V53H10.5A10.5 10.5 0 0 0 0 63.5ZM26 89.5a10.5 10.5 0 0 0 21 0v-26a10.5 10.5 0 0 0-21 0Z"
    })
  );
}
function WhatsappLogoGlyph({ size } = {}) {
  return h2("svg", {
    ...dimensions(size),
    viewBox: "0 0 24 24",
    focusable: "false",
    "aria-hidden": "true",
    "data-im-channel-logo": "whatsapp"
  }, h2("path", {
    fill: "currentColor",
    d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.173.198-.297.298-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.83 9.83 0 0 1 2.893 6.991c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.8 11.8 0 0 0 12.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.688 1.448h.005c6.557 0 11.892-5.335 11.895-11.893a11.82 11.82 0 0 0-3.486-8.413"
  }));
}
function IMessageLogoGlyph({ size } = {}) {
  return h2("svg", {
    ...dimensions(size),
    viewBox: "0 0 24 24",
    focusable: "false",
    "aria-hidden": "true",
    "data-im-channel-logo": "imessage"
  }, h2("path", {
    fill: "currentColor",
    d: "M12 2.5C5.65 2.5.5 6.66.5 11.8c0 2.76 1.49 5.24 3.85 6.94.28 1.34-.35 2.76-1.6 4.01 2.1-.2 3.87-.86 5.26-1.85 1.25.4 2.6.62 3.99.62 6.35 0 11.5-4.35 11.5-9.72S18.35 2.5 12 2.5Z"
  }));
}
function MatrixLogoGlyph({ size } = {}) {
  return h2("svg", {
    ...dimensions(size),
    viewBox: "0 0 24 24",
    focusable: "false",
    "aria-hidden": "true",
    "data-im-channel-logo": "matrix"
  }, h2("path", {
    fill: "currentColor",
    "fill-rule": "evenodd",
    d: "M4 4h16a2.4 2.4 0 0 1 2.4 2.4v8.2A2.4 2.4 0 0 1 20 17h-7.55l-4.2 3.3a.6.6 0 0 1-.98-.47V17H4A2.4 2.4 0 0 1 1.6 14.6V6.4A2.4 2.4 0 0 1 4 4Zm3 4.1a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Zm5.6 0a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Zm5.6 0a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Z"
  }));
}
function OfficeLogoGlyph({ size } = {}) {
  return h2(
    "svg",
    {
      ...dimensions(size),
      viewBox: "0 0 24 24",
      focusable: "false",
      "aria-hidden": "true",
      "data-im-channel-logo": "office"
    },
    h2("path", { fill: "currentColor", d: "M4 3.5h10.5a2 2 0 0 1 2 2v13H4v-15Zm2.2 3v1.8h2V6.5h-2Zm4.1 0v1.8h2V6.5h-2Zm-4.1 4v1.8h2v-1.8h-2Zm4.1 0v1.8h2v-1.8h-2ZM8.4 15v3.5h3V15h-3Z" }),
    h2("path", { fill: "currentColor", d: "M18.3 8.2h1.5v3h3v1.5h-3v3h-1.5v-3h-3v-1.5h3v-3Z" })
  );
}

// src/channels/shared/message-mode.mjs
var SET_MESSAGE_MODE_ENDPOINT = "bot.message-mode.set";
function normalizeBusyMessageMode(value) {
  return value === "steer" ? "steer" : "queue";
}

// plugin-src/client/connection-error.js
var React4 = __toESM(require("react"), 1);

// src/channels/shared/i18n-en/image-input.mjs
var image_input_default = {
  "\u56FE\u7247\u539F\u6587\u4EF6\u5DF2\u4FDD\u5B58\u5230\u5DE5\u4F5C\u533A\uFF0C\u6587\u4EF6\u6E05\u5355\u4E2D\u7684\u56FE\u7247\u5E8F\u53F7\u4E0E\u672C\u6761\u6D88\u606F\u4E00\u81F4\u3002\u56FE\u7247\u5185\u5BB9\u5757\u53EF\u80FD\u7ECF\u8FC7\u7F29\u653E\u6216\u538B\u7F29\uFF1B\u9700\u8981\u67E5\u770B\u7EC6\u8282\u65F6\u53EF\u7528\u5DE5\u5177\u8BFB\u53D6\u539F\u6587\u4EF6\u3002": "Original images are saved in the workspace. Image numbers in the file list match this message. Image blocks may be resized or compressed; use tools to read originals for details.",
  "\u90E8\u5206\u56FE\u7247\u672A\u76F4\u63A5\u63D0\u4F9B\u7ED9\u6A21\u578B\uFF0C\u56FE\u7247\u5E8F\u53F7\uFF1A{indexes}\u3002\u539F\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u8BF7\u4F7F\u7528\u53EF\u7528\u5DE5\u5177\u8BFB\u53D6\u6216\u5206\u6790\uFF1B\u4E0D\u8981\u5047\u8BBE\u81EA\u5DF1\u5DF2\u770B\u5230\u8FD9\u4E9B\u56FE\u7247\u3002": "Some images were not provided directly to the model: {indexes}. Originals are saved; use available tools to read or analyze them. Do not assume you have seen these images.",
  "\u5BBF\u4E3B\u62D2\u7EDD\u4E86\u672C\u6B21\u56FE\u7247\u8F93\u5165\u3002\u539F\u56FE\u5DF2\u4FDD\u5B58\u5230\u5DE5\u4F5C\u533A\uFF0C\u8BF7\u6839\u636E\u6587\u4EF6\u6E05\u5355\u4F7F\u7528\u53EF\u7528\u5DE5\u5177\u8BFB\u53D6\u6216\u5206\u6790\uFF0C\u4E0D\u8981\u5047\u8BBE\u81EA\u5DF1\u5DF2\u770B\u5230\u56FE\u7247\u3002": "The Host rejected the image input. Originals are saved in the workspace; use the file list and available tools to read or analyze them. Do not assume you have seen the images.",
  "\u56FE\u7247\u8D85\u8FC7\u539F\u56FE\u63A5\u6536\u4E0A\u9650 {maxMb} MB\uFF0C\u8BF7\u538B\u7F29\u540E\u91CD\u8BD5\uFF0C\u6216\u5728\u901A\u7528\u8BBE\u7F6E\u7684\u9644\u4EF6\u4E2D\u8C03\u6574\u4E0A\u9650\u3002": "The image exceeds the original-image receipt limit of {maxMb} MB. Compress it and retry, or adjust the limit in General settings > Attachments.",
  "\u56FE\u7247 {index}\uFF08\u539F\u56FE\u6587\u4EF6\uFF1A{name}\uFF09": "Image {index} (original file: {name})",
  "\u56FE\u7247\u9650\u5236\u65E0\u6548\uFF1A\u8BF7\u8F93\u5165\u6B63\u6574\u6570\uFF0C\u539F\u56FE\u63A5\u6536\u4E0A\u9650\u548C\u603B\u91CF\u4E0A\u9650\u4E0D\u80FD\u5C0F\u4E8E\u5355\u56FE\u4E0A\u9650\u3002": "Invalid image limits: enter positive integers. The receipt and total limits must be at least the per-image limit.",
  "\u65E0\u6CD5\u8BFB\u53D6\u6216\u4FDD\u5B58\u56FE\u7247\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Could not read or save image settings. Try again later.",
  "\u539F\u56FE\u63A5\u6536\u4E0A\u9650 (MB)": "Original-image receipt limit (MB)",
  "\u6A21\u578B\u5355\u56FE\u4E0A\u9650 (MB)": "Model per-image limit (MB)",
  "\u6A21\u578B\u56FE\u7247\u603B\u91CF\u4E0A\u9650 (MB)": "Model total image limit (MB)",
  "\u6BCF\u6761\u6D88\u606F\u6700\u591A\u56FE\u7247\u6570": "Maximum images per message",
  "\u56FE\u7247\u8F93\u5165": "Image input",
  "\u67E5\u770B\u56FE\u7247\u8F93\u5165\u8BF4\u660E": "View image input details",
  "\u9002\u7528\u4E8E\u652F\u6301\u56FE\u7247\u7684\u804A\u5929\u6E20\u9053\u3002\u539F\u56FE\u6309\u9644\u4EF6\u4FDD\u7559\u65F6\u957F\u4FDD\u5B58\uFF0C\u53D1\u9001\u7ED9\u6A21\u578B\u7684\u526F\u672C\u4F1A\u81EA\u52A8\u7F29\u653E\u6216\u538B\u7F29\uFF1B\u65E0\u6CD5\u76F4\u63A5\u53D1\u9001\u65F6\u4EA4\u7ED9\u6A21\u578B\u6309\u6587\u4EF6\u5904\u7406\u3002": "Applies to chat channels that support images. Originals follow attachment retention settings. Model copies are resized or compressed automatically; images that cannot be sent directly are provided as files.",
  "\u4FDD\u5B58\u56FE\u7247\u8BBE\u7F6E": "Save image settings",
  "\u6B63\u5728\u8BFB\u53D6\u56FE\u7247\u8BBE\u7F6E\u2026": "Loading image settings\u2026"
};

// src/channels/shared/i18n-en/diagnostics.mjs
var diagnostics_default = Object.freeze({
  "\u5F02\u5E38\u7C7B\u578B": "Exception types",
  "\u4E8C\u7EF4\u7801\u7F16\u7801\u5668": "QR encoder",
  "\u4E8C\u7EF4\u7801\u56FE\u7247\u683C\u5F0F": "QR image format",
  "\u672C\u673A\u4E8C\u7EF4\u7801\u56FE\u7247\u751F\u6210\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\uFF1B\u82E5\u6301\u7EED\u5931\u8D25\uFF0C\u8BF7\u590D\u5236\u8BCA\u65AD\u4FE1\u606F\u5E76\u68C0\u67E5 DSH \u8FD0\u884C\u73AF\u5883\u3002": "The QR-code image could not be generated locally. Retry; if it keeps failing, copy the diagnostics and check the DSH runtime environment.",
  "\u51C6\u5907\u4F1A\u8BDD": "Prepare session",
  "\u51C6\u5907\u6D88\u606F": "Prepare message",
  "\u5EFA\u7ACB\u4EA4\u4E92\u901A\u9053": "Open interaction channel",
  "\u63D0\u4EA4\u6D88\u606F": "Submit message",
  "\u7B49\u5F85\u5904\u7406\u7ED3\u679C": "Wait for result",
  "\u6D88\u606F\u63D0\u4EA4\u72B6\u6001": "Message submission status",
  "\u672A\u63D0\u4EA4": "Not submitted",
  "\u5DF2\u786E\u8BA4\u63A5\u6536": "Acceptance confirmed",
  "\u63D0\u4EA4\u7ED3\u679C\u672A\u77E5": "Submission outcome unknown",
  "\u8FDE\u63A5\u5C1D\u8BD5\u6B21\u6570": "Connection attempts",
  "\u6700\u8FD1\u4E00\u6B21\u8FDE\u63A5\u5931\u8D25": "Last observed connection failure",
  "\u6253\u5F00\u524D\u5173\u95ED": "Closed before opening",
  "\u6253\u5F00\u524D\u5931\u8D25": "Failed before opening",
  "\u901A\u9053\u8FDE\u63A5\u5931\u8D25": "Stream connection failed",
  "\u4E0E DSH \u7684\u4EA4\u4E92\u901A\u9053\u5728 30 \u79D2\u5185\u672A\u5C31\u7EEA\uFF0C\u672C\u6761\u6D88\u606F\u5C1A\u672A\u63D0\u4EA4\u6267\u884C\u3002\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "The DSH interaction channel was not ready within 30 seconds. This message has not been submitted for execution. Please try again later.",
  "\u6D88\u606F\u63D0\u4EA4\u524D\u7684\u64CD\u4F5C\u8D85\u65F6\uFF0C\u672C\u6761\u6D88\u606F\u5C1A\u672A\u63D0\u4EA4\u6267\u884C\u3002\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "An operation timed out before submission. This message has not been submitted for execution. Please try again later.",
  "\u6D88\u606F\u63D0\u4EA4\u524D\u7684\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF0C\u672C\u6761\u6D88\u606F\u5C1A\u672A\u63D0\u4EA4\u6267\u884C\u3002\u8BF7\u68C0\u67E5\u8FDE\u63A5\u540E\u91CD\u8BD5\u3002": "A network request failed before submission. This message has not been submitted for execution. Check the connection and try again.",
  "\u6D88\u606F\u5728\u63D0\u4EA4\u524D\u5904\u7406\u5931\u8D25\uFF0C\u5C1A\u672A\u63D0\u4EA4\u6267\u884C\u3002\u8BF7\u91CD\u8BD5\uFF1B\u82E5\u6301\u7EED\u53D1\u751F\uFF0C\u8BF7\u5C06\u53C2\u8003\u53F7\u63D0\u4F9B\u7ED9\u7BA1\u7406\u5458\u3002": "Message preparation failed before submission. It has not been submitted for execution. Try again; if this persists, share the reference with your administrator.",
  "\u6D88\u606F\u5DF2\u5C1D\u8BD5\u63D0\u4EA4\uFF0C\u4F46\u4EFB\u52A1\u7ED3\u679C\u5C1A\u672A\u786E\u8BA4\u3002\u8BF7\u5148\u5230 DSH \u67E5\u770B\u72B6\u6001\uFF0C\u4E0D\u8981\u7ACB\u5373\u91CD\u590D\u63D0\u4EA4\uFF1B\u82E5\u6301\u7EED\u53D1\u751F\uFF0C\u8BF7\u5C06\u53C2\u8003\u53F7\u63D0\u4F9B\u7ED9\u7BA1\u7406\u5458\u3002": "Message submission was attempted, but the task outcome is unconfirmed. Check its status in DSH before resubmitting; if this persists, share the reference with your administrator.",
  "DSH \u7248\u672C": "DSH version",
  "\u4F9D\u8D56\u7248\u672C": "Dependency versions",
  "\u4EE3\u7406\u5DF2\u914D\u7F6E": "Proxy configured",
  "\u539F\u56E0\u94FE\u5DF2\u622A\u65AD": "Cause chain truncated",
  "\u8BF7\u5728 macOS \u7CFB\u7EDF\u8BBE\u7F6E\u4E2D\u6388\u4E88 DSH \u5B8C\u5168\u78C1\u76D8\u8BBF\u95EE\u6743\u9650\uFF0C\u4EE5\u8BFB\u53D6 Messages \u6570\u636E\u5E93\u3002": "Grant DSH Full Disk Access in macOS System Settings to read the Messages database.",
  "\u8BF7\u5728 macOS \u7CFB\u7EDF\u8BBE\u7F6E\u4E2D\u5141\u8BB8 DSH \u81EA\u52A8\u63A7\u5236 Messages\u3002": "Allow DSH to control Messages in macOS System Settings.",
  "\u5148\u5728 macOS \u7CFB\u7EDF\u8BBE\u7F6E\u4E2D\u6388\u4E88 Messages \u6743\u9650\u3002": "Grant Messages permissions in macOS System Settings first.",
  "\u52A0\u8F7D\u6E20\u9053\u914D\u7F6E": "Load channel configuration",
  "\u6FC0\u6D3B\u8D26\u53F7": "Activate account",
  "\u542F\u52A8\u8FDE\u63A5": "Start connection",
  "\u76D1\u6D4B\u8FDE\u63A5\u4E0E\u6D88\u606F": "Monitor connection and messages",
  "\u505C\u6B62\u8FDE\u63A5": "Stop connection",
  "\u670D\u52A1\u8FD4\u56DE\u7801": "Provider code",
  "\u9A8C\u8BC1\u51ED\u636E": "Verify credentials",
  "\u68C0\u67E5\u6743\u9650": "Check permissions",
  "\u52A0\u8F7D\u6E20\u9053\u7EC4\u4EF6": "Load channel component",
  "\u6267\u884C\u6E20\u9053\u64CD\u4F5C": "Perform channel operation",
  "\u63A5\u6536\u6D88\u606F": "Receive message",
  "\u53D1\u9001\u6D88\u606F": "Send message",
  "\u53D1\u9001\u6D4B\u8BD5\u6D88\u606F": "Send test message",
  "\u6682\u672A\u8BC6\u522B": "Unknown",
  "\u64CD\u4F5C\u5DF2\u53D6\u6D88\u3002": "The operation was cancelled.",
  "\u672C\u5730\u4F1A\u8BDD\u72B6\u6001\u6E05\u7406\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u8BCA\u65AD\u8BE6\u60C5\u3002": "Local session state cleanup failed. See the diagnostic details.",
  "\u8D26\u53F7\u5DF2\u79FB\u9664\uFF0C\u4F46\u672C\u5730\u72B6\u6001\u6E05\u7406\u5931\u8D25\u3002": "The account was removed, but local state cleanup failed.",
  "\u8D26\u53F7\u5DF2\u79FB\u9664\uFF0C\u4F46\u767B\u5F55\u51ED\u636E\u6E05\u7406\u5931\u8D25\u3002": "The account was removed, but credential cleanup failed.",
  "\u8FDE\u63A5\u5DF2\u79FB\u9664\uFF0C\u4F46\u767B\u5F55\u51ED\u636E\u6E05\u7406\u5931\u8D25\u3002": "The connection was removed, but credential cleanup failed.",
  "\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u539F\u56E0\u548C\u8BCA\u65AD\u8BE6\u60C5\u3002": "The operation failed. See the cause and diagnostic details.",
  "\u68C0\u6D4B\u5230\u591A\u4E2A\u5E95\u5C42\u539F\u56E0\uFF0C\u8BF7\u5C55\u5F00\u8BCA\u65AD\u8BE6\u60C5\u9010\u9879\u68C0\u67E5\u3002": "Multiple underlying causes were detected. Expand the diagnostic details to inspect them.",
  "\u670D\u52A1\u57DF\u540D\u89E3\u6790\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u8FD0\u884C DSH \u7684\u673A\u5668\u7684 DNS \u548C\u7F51\u7EDC\u8BBE\u7F6E\u3002": "Service DNS resolution failed. Check DNS and network settings on the machine running DSH.",
  "\u76EE\u6807\u62D2\u7EDD\u8FDE\u63A5\uFF0C\u8BF7\u68C0\u67E5\u670D\u52A1\u5730\u5740\u3001\u7AEF\u53E3\u548C\u8BBF\u95EE\u9650\u5236\u3002": "The connection was refused. Check the service address, port, and access restrictions.",
  "\u8FDE\u63A5\u5DF2\u4E2D\u65AD\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u548C\u76EE\u6807\u670D\u52A1\u72B6\u6001\u3002": "The connection was interrupted. Check the network and target service.",
  "\u76EE\u6807\u7F51\u7EDC\u4E0D\u53EF\u8FBE\uFF0C\u8BF7\u68C0\u67E5\u8FD0\u884C DSH \u7684\u673A\u5668\u7684\u7F51\u7EDC\u51FA\u53E3\u548C\u8BBF\u95EE\u9650\u5236\u3002": "The target network is unreachable. Check network routing and access restrictions on the machine running DSH.",
  "TLS \u6216\u8BC1\u4E66\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7CFB\u7EDF\u65F6\u95F4\u3001\u8BC1\u4E66\u94FE\u548C\u7F51\u7EDC\u8BBE\u7F6E\u3002": "TLS or certificate validation failed. Check the system clock, certificate chain, and network settings.",
  "\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u68C0\u67E5\u76EE\u6807\u670D\u52A1\u548C\u7F51\u7EDC\uFF1B\u8BCA\u65AD\u8BE6\u60C5\u4E2D\u53EF\u67E5\u770B\u5DF2\u77E5\u7684\u8017\u65F6\u3002": "The request timed out. Check the service and network; available timings are in the diagnostic details.",
  "\u4EE3\u7406\u8FDE\u63A5\u6216\u8BA4\u8BC1\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 DSH \u8FDB\u7A0B\u4F7F\u7528\u7684\u4EE3\u7406\u914D\u7F6E\u3002": "Proxy connection or authentication failed. Check the proxy configuration used by the DSH process.",
  "\u670D\u52A1\u8BA4\u8BC1\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u8D26\u53F7\u548C\u6388\u6743\u4FE1\u606F\u3002": "Service authentication failed. Check the account and credentials.",
  "\u64CD\u4F5C\u6743\u9650\u4E0D\u8DB3\uFF0C\u8BF7\u68C0\u67E5\u5BF9\u5E94\u8D44\u6E90\u7684\u8BBF\u95EE\u6743\u9650\u3002": "Permission was denied. Check access to the affected resource.",
  "\u6240\u9700\u6587\u4EF6\u6216\u672C\u5730\u5DE5\u5177\u4E0D\u5B58\u5728\uFF0C\u8BF7\u68C0\u67E5\u5B89\u88C5\u548C\u914D\u7F6E\u3002": "A required file or local tool is missing. Check installation and configuration.",
  "\u670D\u52A1\u6B63\u5728\u9650\u6D41\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "The service is rate limiting requests. Try again later.",
  "\u670D\u52A1\u62D2\u7EDD\u4E86\u8BF7\u6C42\uFF0C\u8BF7\u68C0\u67E5\u51ED\u636E\u3001\u6743\u9650\u6216\u8BBF\u95EE\u9650\u5236\uFF1BHTTP \u72B6\u6001\u672C\u8EAB\u4E0D\u80FD\u786E\u8BA4\u767B\u5F55\u5931\u6548\u3002": "The service rejected the request. Check credentials, permissions, or access restrictions; the HTTP status alone does not prove that the login expired.",
  "\u76EE\u6807\u670D\u52A1\u6682\u65F6\u5F02\u5E38\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "The target service is temporarily unavailable. Try again later.",
  "\u76EE\u6807\u670D\u52A1\u8FD4\u56DE\u4E86 HTTP \u9519\u8BEF\uFF0C\u8BF7\u67E5\u770B\u8BCA\u65AD\u8BE6\u60C5\u3002": "The target service returned an HTTP error. See the diagnostic details.",
  "\u6570\u636E\u683C\u5F0F\u65E0\u6548\uFF0C\u8BF7\u6309\u5931\u8D25\u9636\u6BB5\u68C0\u67E5\u670D\u52A1\u54CD\u5E94\u6216\u672C\u5730\u914D\u7F6E\u3002": "The data format is invalid. Check the service response or local configuration indicated by the failing stage.",
  "\u6682\u672A\u8BC6\u522B\u5177\u4F53\u539F\u56E0\uFF0C\u8BF7\u590D\u5236\u8BCA\u65AD\u4FE1\u606F\uFF0C\u5E76\u67E5\u770B\u76F8\u540C\u53C2\u8003\u53F7\u7684 DSH \u65E5\u5FD7\u3002": "The underlying cause is unknown. Copy the diagnostics and find the matching reference in the DSH logs.",
  "\u591A\u4E2A\u539F\u56E0": "Multiple causes",
  "\u670D\u52A1\u57DF\u540D": "Service host",
  "RPC \u65B9\u6CD5": "RPC method",
  "\u8C03\u7528\u65B9\u5F0F": "Transport",
  "\u5BBF\u4E3B API\uFF08\u8FDB\u7A0B\u5185\uFF09": "Host API (in-process)",
  "\u8BF7\u6C42\u8017\u65F6\uFF08\u6BEB\u79D2\uFF09": "Request duration (ms)",
  "\u8D85\u65F6\u9608\u503C\uFF08\u6BEB\u79D2\uFF09": "Timeout (ms)",
  "Node \u7248\u672C": "Node version",
  "\u8FD0\u884C\u5E73\u53F0": "Platform",
  "\u65E0\u6CD5\u8BBF\u95EE DSH \u7BA1\u7406\u63A5\u53E3\uFF0C\u8BF7\u68C0\u67E5 DSH \u8FDE\u63A5\u6216\u91CD\u65B0\u767B\u5F55\u540E\u91CD\u8BD5\u3002": "Cannot access the DSH management API. Check the DSH connection or sign in again."
});

// plugin-src/client/i18n.js
var React3 = __toESM(require("react"), 1);
var IM_LOCALE_NAMESPACE = "dsh-qq-free-bot";
var EN = Object.freeze({
  "\u79C1\u804A\u5BF9\u8C61": "Private chat",
  "\u9009\u62E9\u79C1\u804A\u5BF9\u8C61": "Select a private chat",
  "\u4EC5\u652F\u6301\u5DF2\u7ECF\u5EFA\u7ACB\u4F1A\u8BDD\u7684\u79C1\u804A\uFF0C\u8BF7\u5148\u4E0E\u673A\u5668\u4EBA\u79C1\u804A\u540E\u5237\u65B0\u3002": "Only established private chats are supported. Message the bot privately, then refresh.",
  "\u9009\u62E9 DS Bot \u548C\u79C1\u804A\u5BF9\u8C61\uFF0C\u76F4\u63A5\u4F7F\u7528 Bot \u7684\u4F1A\u8BDD\u3002": "Choose a DS Bot and a private chat to use the Bot\u2019s session.",
  "\u8FD8\u6CA1\u6709\u53EF\u7ED1\u5B9A\u7684\u79C1\u804A\u3002\u5148\u7ED9\u8FD9\u4E2A\u673A\u5668\u4EBA\u53D1\u4E00\u6761\u79C1\u804A\u6D88\u606F\uFF0C\u518D\u70B9\u51FB\u5237\u65B0\u3002": "No private chats yet. Send this bot a private message, then refresh.",
  "\u7ED1\u5B9Abot": "Bind bot",
  "\u6B63\u5728\u68C0\u6D4B DS Bot\u2026": "Checking DS Bot\u2026",
  "\u9009\u62E9 DS Bot": "Select DS Bot",
  "\u6682\u65E0\u53EF\u9009 DS Bot": "No available DS Bots",
  "\u6682\u65E0\u53EF\u9009\u79C1\u804A\u5BF9\u8C61": "No available private chats",
  "\u5DF2\u7ED1\u5B9A\u7684 DS Bot \u548C\u79C1\u804A\u5BF9\u8C61\u4E0D\u53EF\u91CD\u590D\u9009\u62E9\uFF0C\u89E3\u9664\u7ED1\u5B9A\u540E\u53EF\u91CD\u65B0\u9009\u62E9\u3002": "Bound DS Bots and private chats cannot be selected again. Unbind them to make them available.",
  "\u6240\u9009 DS Bot \u6216\u79C1\u804A\u5BF9\u8C61\u5DF2\u7ED1\u5B9A\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u65B0\u9009\u62E9\u3002": "The selected DS Bot or private chat is already bound. Refresh and choose again.",
  "\u89E3\u9664\u7ED1\u5B9A": "Unbind",
  "\u5DF2\u7ED1\u5B9A": "Bound",
  "\u672A\u5B89\u88C5 DS Bot\uFF0C\u8BF7\u5148\u5728 DSH \u63D2\u4EF6\u7BA1\u7406\u4E2D\u5B89\u88C5 ds-bot\uFF0C\u7136\u540E\u5237\u65B0\u3002": "DS Bot is not installed. Install ds-bot in DSH plugin management, then refresh.",
  "DS Bot \u5C1A\u672A\u542F\u7528\uFF0C\u8BF7\u5728 DSH \u63D2\u4EF6\u7BA1\u7406\u4E2D\u542F\u7528\u540E\u5237\u65B0\u3002": "DS Bot is disabled. Enable it in DSH plugin management, then refresh.",
  "\u6682\u65F6\u65E0\u6CD5\u8BFB\u53D6 DS Bot\uFF0C\u8BF7\u68C0\u67E5\u63D2\u4EF6\u662F\u5426\u6B63\u5E38\u8FD0\u884C\u540E\u91CD\u8BD5\u3002": "Unable to read DS Bot. Check that the plugin is running, then retry.",
  "DS Bot \u5F53\u524D\u7531\u5176\u4ED6 Host \u7BA1\u7406\uFF0C\u8BF7\u5728\u8FD0\u884C\u5B83\u7684 Host \u4E2D\u7ED1\u5B9A\u3002": "DS Bot is managed by another Host. Bind it on that Host.",
  "\u7ED1\u5B9Abot\u4EC5\u652F\u6301\u5F53\u524D Host \u7684\u4F1A\u8BDD\uFF0C\u8BF7\u5148\u68C0\u67E5\u673A\u5668\u4EBA\u7684 Harness \u8FDE\u63A5\u8BBE\u7F6E\u3002": "Bot binding requires the current Host. Check the bot\u2019s Harness connection settings.",
  "\u6240\u9009 DS Bot \u5DF2\u4E0D\u5B58\u5728\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u65B0\u9009\u62E9\u3002": "The selected DS Bot no longer exists. Refresh and select another.",
  "\u7ED1\u5B9A\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002": "Could not save the binding. Refresh and retry.",
  "\u7ED1\u5B9A\u5DF2\u4FDD\u5B58\u3002": "Binding saved.",
  "\u5DF2\u89E3\u9664\u7ED1\u5B9A\uFF0C\u804A\u5929\u8BB0\u5F55\u4FDD\u7559\u3002": "Binding removed. Chat history is preserved.",
  "\u8FD8\u6CA1\u6709 DS Bot\uFF0C\u8BF7\u5148\u5728 DS Bot \u4E2D\u521B\u5EFA\u673A\u5668\u4EBA\u540E\u5237\u65B0\u3002": "No bots yet. Create a bot in DS Bot, then refresh.",
  "DS Bot \u6682\u4E0D\u53EF\u7528": "DS Bot unavailable",
  ...diagnostics_default,
  ...image_input_default,
  "$locale": "en",
  "\u4FA7\u8FB9\u680F\u5165\u53E3": "Sidebar entry",
  "\u81EA\u52A8\u6A21\u5F0F\uFF1A\u672A\u914D\u7F6E\u6E20\u9053\u65F6\u663E\u793A\uFF0C\u914D\u7F6E\u81F3\u5C11\u4E00\u4E2A\u6E20\u9053\u540E\u9690\u85CF\u3002\u9690\u85CF\u540E\u4ECD\u53EF\u4ECE\u63D2\u4EF6\u8BE6\u60C5\u6216\u8BBE\u7F6E\u8FDB\u5165\uFF0C\u4E0D\u5F71\u54CD\u673A\u5668\u4EBA\u540E\u53F0\u8FD0\u884C\u3002": "Automatic: show before any channel is configured, then hide. Plugin details and Settings remain available; bots keep running in the background.",
  "\u81EA\u52A8\u9690\u85CF": "Auto-hide",
  "\u59CB\u7EC8\u663E\u793A": "Always show",
  "\u59CB\u7EC8\u9690\u85CF": "Always hide",
  "\u6B63\u5728\u8BFB\u53D6\u4FA7\u8FB9\u680F\u8BBE\u7F6E\u2026": "Loading sidebar settings\u2026",
  "\u65E0\u6CD5\u8BFB\u53D6\u6216\u4FDD\u5B58\u4FA7\u8FB9\u680F\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Unable to read or save sidebar settings. Try again.",
  "\u4FA7\u8FB9\u680F\u8BBE\u7F6E\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94\u3002": "Unrecognized sidebar settings response.",
  "\u4FDD\u6301\u672C\u9875\u6253\u5F00\uFF0C\u7B49\u5F85\u6743\u9650\u751F\u6548": "Keep this page open while the permission takes effect",
  "\u7FA4\u804A\u5929\u8BB0\u5F55": "Group chat history",
  "\u7FA4\u804A\u5929\u8BB0\u5F55\u4FDD\u7559\u5929\u6570": "Group chat retention (days)",
  "\u8FC7\u671F\u7684\u7FA4\u6D88\u606F\u548C\u6587\u4EF6\u4F1A\u81EA\u52A8\u6E05\u7406\u3002": "Expired group messages and files are removed automatically.",
  "\u4FDD\u7559\u5929\u6570": "Retention days",
  "\u5929": "days",
  "\u6B63\u5728\u8BFB\u53D6\u7FA4\u8BB0\u5F55\u8BBE\u7F6E\u2026": "Loading group history settings\u2026",
  "\u4FDD\u7559\u5929\u6570\u5FC5\u987B\u4E3A\u6B63\u6574\u6570\u3002": "Retention days must be a positive integer.",
  "\u65E0\u6CD5\u8BFB\u53D6\u6216\u4FDD\u5B58\u7FA4\u8BB0\u5F55\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Unable to read or save group history settings. Try again.",
  "\u7FA4\u8BB0\u5F55\u8BBE\u7F6E\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94\u3002": "Unrecognized group history settings response.",
  "\u626B\u7801\u4F1A\u66F4\u65B0\u73B0\u6709\u98DE\u4E66\u5E94\u7528\uFF0C\u53EA\u589E\u91CF\u5F00\u901A\u201C\u83B7\u53D6\u7FA4\u7EC4\u4E2D\u6240\u6709\u6D88\u606F\u201D\u6743\u9650\uFF0C\u4E0D\u4F1A\u521B\u5EFA\u65B0\u5E94\u7528\u3002\u5355\u72EC\u6388\u6743\u91C7\u96C6\u65F6\u4FDD\u7559\u539F\u6765\u7684\u56DE\u590D\u65B9\u5F0F\uFF1B\u9009\u62E9\u54CD\u5E94\u6240\u6709\u6D88\u606F\u65F6\u624D\u5207\u6362\u3002": "Scanning updates the existing Feishu app with permission to receive all group messages. Separate recording authorization preserves the reply mode; selecting all-message replies changes it.",
  "\u79C1\u804A\u59CB\u7EC8\u54CD\u5E94\uFF1B\u7FA4\u804A\u4EC5\u5904\u7406\u660E\u786E @\u5F53\u524D\u673A\u5668\u4EBA\u7684\u6D88\u606F\u3002\u4E5F\u53EF\u5355\u72EC\u6388\u6743\u91C7\u96C6\u7FA4\u6D88\u606F\uFF0C\u4FDD\u6301\u4EC5 @ \u65F6\u56DE\u590D\u3002": "Direct messages always receive replies; groups require a mention. You can authorize group recording separately below.",
  "\u9700\u6388\u6743 im:message.group_msg\uFF1B\u6388\u6743\u91C7\u96C6\u4E0D\u6539\u53D8\u7FA4\u56DE\u590D\u6A21\u5F0F\u3002": "Requires im:message.group_msg. Recording authorization does not change the reply mode.",
  "\u5173\u95ED Privacy Mode \u6216\u8BBE\u4E3A\u7FA4\u7BA1\u7406\u5458\u540E\u624D\u80FD\u63A5\u6536\u666E\u901A\u7FA4\u6D88\u606F\uFF1B\u53EA\u4FDD\u5B58\u5E73\u53F0\u5B9E\u9645\u6295\u9012\u7684\u6D88\u606F\u3002": "Disable Privacy Mode or make the bot a group administrator. Only messages actually delivered by the platform are saved.",
  "\u9700\u8981\u9891\u9053\u8BBF\u95EE\u6743\u9650\u53CA MESSAGE_CONTENT\uFF1B\u672A\u6388\u6743\u65F6\u6B63\u6587\u548C\u9644\u4EF6\u53EF\u80FD\u4E3A\u7A7A\u3002": "Requires channel access and MESSAGE_CONTENT. Text and attachments may be empty without authorization.",
  "\u9700\u8BA2\u9605 message.channels / message.groups\uFF0C\u5E76\u5DF2\u52A0\u5165\u76EE\u6807\u9891\u9053\u3002": "Subscribe to message.channels / message.groups and add the bot to the target channel.",
  "\u4FEE\u6539\u522B\u540D": "Edit alias",
  "\u5173\u95ED\u4FEE\u6539\u522B\u540D": "Close alias editor",
  "\u539F\u540D\u79F0": "Original name",
  "\u522B\u540D": "Alias",
  "\u6062\u590D\u539F\u540D\u79F0": "Restore original name",
  "\u4F8B\u5982\uFF1A\u5BA2\u670D\u52A9\u624B": "e.g. Customer support",
  "\u4EC5\u66F4\u6539\u663E\u793A\u540D\u79F0\uFF0C\u7559\u7A7A\u5219\u663E\u793A\u539F\u540D\u79F0\u3002": "Only changes the display name. Leave blank to use the original name.",
  "\u522B\u540D\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not save the alias. Try again.",
  "\u522B\u540D\u4E0D\u80FD\u5305\u542B\u6362\u884C\u6216\u63A7\u5236\u5B57\u7B26\uFF0C\u4E14\u6700\u591A 80 \u4E2A\u5B57\u7B26\u3002": "Use at most 80 characters without line breaks or control characters.",
  "\u8BF7\u8F93\u5165\u6709\u6548\u7684\u522B\u540D\uFF08\u6700\u591A 80 \u4E2A\u5B57\u7B26\uFF09\u3002": "Enter a valid alias (up to 80 characters).",
  " macOS Messages \u8FDE\u63A5": " macOS Messages connection",
  "\u63A5\u5165 iMessage": "Connect iMessage",
  "\u5148\u5728 macOS \u7CFB\u7EDF\u8BBE\u7F6E\u4E2D\u6388\u4E88 Messages \u6743\u9650\u3002": "Grant Messages permissions in macOS System Settings first.",
  "\u914D\u7F6E macOS Messages \u6743\u9650": "Configure macOS Messages permissions",
  "\u914D\u7F6E\u672C\u673A\u6743\u9650": "Configure local permissions",
  "\u542F\u7528 macOS \u539F\u751F iMessage": "Enable native macOS iMessage",
  "\u652F\u6301\u540C\u8D26\u53F7\u81EA\u804A\uFF1A\u5728 iPhone \u6216 Mac \u4E0A\u7ED9\u81EA\u5DF1\u5DF2\u767B\u5F55\u7684 iMessage \u90AE\u7BB1\u6216\u53F7\u7801\u53D1\u6307\u4EE4\u3002AI \u56DE\u590D\u4EE5 \u{1F916} DSH \u5F00\u5934\uFF0C\u4E0D\u4F1A\u518D\u6B21\u89E6\u53D1\u673A\u5668\u4EBA\u3002": "Self-chat is supported: send instructions from your iPhone or Mac to your signed-in iMessage email or phone number. AI replies start with \u{1F916} DSH and do not trigger the bot again.",
  "\u68C0\u67E5\u6743\u9650\u5E76\u542F\u7528": "Check permissions and enable",
  "DeepSeek Harness \u901A\u8FC7 macOS Messages.app \u6536\u53D1\u6587\u672C\u6D88\u606F\u3002\u9996\u6B21\u4F7F\u7528\u9700\u8981\u6388\u4E88\u4EE5\u4E0B\u6743\u9650\uFF1A": "DeepSeek Harness sends and receives messages through macOS Messages.app. The following permissions are required the first time:",
  "\u2713 \u5B8C\u5168\u78C1\u76D8\u8BBF\u95EE\u6743\u9650\u5DF2\u6388\u4E88": "\u2713 Full Disk Access granted",
  "1. \u6388\u4E88\u5B8C\u5168\u78C1\u76D8\u8BBF\u95EE\u6743\u9650": "1. Grant Full Disk Access",
  "\u5728\u201C\u7CFB\u7EDF\u8BBE\u7F6E \u2192 \u9690\u79C1\u4E0E\u5B89\u5168\u6027 \u2192 \u5B8C\u5168\u78C1\u76D8\u8BBF\u95EE\u6743\u9650\u201D\u4E2D\uFF0C\u6253\u5F00\u8FD0\u884C DeepSeek Harness \u7684\u7EC8\u7AEF\u6216\u5E94\u7528\u3002": "In System Settings \u2192 Privacy & Security \u2192 Full Disk Access, enable the terminal or app running DeepSeek Harness.",
  "\u6253\u5F00\u5B8C\u5168\u78C1\u76D8\u8BBF\u95EE\u6743\u9650\u8BBE\u7F6E": "Open Full Disk Access settings",
  "\u2713 Messages \u81EA\u52A8\u5316\u6743\u9650\u5DF2\u6388\u4E88": "\u2713 Messages automation granted",
  "2. \u5141\u8BB8\u81EA\u52A8\u5316\u63A7\u5236 Messages": "2. Allow automation control of Messages",
  "\u5728\u201C\u7CFB\u7EDF\u8BBE\u7F6E \u2192 \u9690\u79C1\u4E0E\u5B89\u5168\u6027 \u2192 \u81EA\u52A8\u5316\u201D\u4E2D\uFF0C\u5141\u8BB8\u8FD0\u884C DeepSeek Harness \u7684\u5E94\u7528\u63A7\u5236 Messages\u3002": "In System Settings \u2192 Privacy & Security \u2192 Automation, allow the app running DeepSeek Harness to control Messages.",
  "\u6253\u5F00\u81EA\u52A8\u5316\u8BBE\u7F6E": "Open Automation settings",
  "\u6B63\u5728\u68C0\u67E5\u2026": "Checking\u2026",
  "\u63A5\u5165 macOS \u539F\u751F iMessage": "Connect native macOS iMessage",
  "\u65E0\u9700\u5B89\u88C5\u7B2C\u4E09\u65B9\u670D\u52A1\uFF1B\u8BF7\u6309\u6307\u5F15\u6388\u4E88 macOS Messages \u8BBF\u95EE\u6743\u9650\u3002": "No third-party service is required; follow the guide to grant macOS Messages access.",
  "macOS Messages \u6743\u9650": "macOS Messages permissions",
  "IM\u673A\u5668\u4EBA": "IM bots",
  "\u6253\u5F00 IM\u673A\u5668\u4EBA": "Open IM bots",
  "IM\u673A\u5668\u4EBA\u8BBE\u7F6E": "IM bot settings",
  "IM \u9762\u677F\u52A0\u8F7D\u5931\u8D25": "Could not load the IM panel",
  "\u66F4\u591A\u673A\u5668\u4EBA\u8BBE\u7F6E": "More bot settings",
  "\u66F4\u591A\u8BBE\u7F6E": "More settings",
  "\u5411\u5DE6\u6EDA\u52A8\u8BBE\u7F6E\u9875\u7B7E": "Scroll settings tabs left",
  "\u5411\u53F3\u6EDA\u52A8\u8BBE\u7F6E\u9875\u7B7E": "Scroll settings tabs right",
  "\u5E38\u7528\u914D\u7F6E": "Common settings",
  "\u673A\u5668\u4EBA\u8BBE\u7F6E": "Bot settings",
  "\u673A\u5668\u4EBA\u8BBE\u7F6E\u9875\u7B7E": "Bot settings tabs",
  "\u6295\u9012\u8BBE\u7F6E": "Delivery settings",
  "\u673A\u5668\u4EBA\u7FA4\u804A\u884C\u4E3A": "Bot in groups",
  "\u65B0\u7FA4\u804A\u9ED8\u8BA4\u8BBE\u7F6E": "Default for new groups",
  "\u54CD\u5E94\u6761\u4EF6": "React to",
  "\u4E0D\u54CD\u5E94": "Do not react",
  "\u88AB @ \u6216\u56DE\u590D\u65F6\uFF08\u4EFB\u4F55\u4EBA\uFF09": "Mention or reply, anyone",
  "\u88AB @ \u6216\u56DE\u590D\u65F6\uFF08\u4EC5\u540D\u5355\u6210\u5458\uFF09": "Mention or reply, listed members only",
  "\u6240\u6709\u6D88\u606F\uFF08\u4EFB\u4F55\u4EBA\uFF09": "All messages, anyone",
  "\u6240\u6709\u6D88\u606F\uFF08\u4EC5\u540D\u5355\u6210\u5458\uFF09": "All messages, listed members only",
  "\u6210\u5458\u540D\u5355": "Members list",
  "\u540D\u5355\u4E3A\u7A7A\uFF1A\u8BE5\u6A21\u5F0F\u4E0D\u4F1A\u54CD\u5E94\u4EFB\u4F55\u6210\u5458\u3002": "The list is empty, so nobody can trigger the bot in this mode.",
  "\u5F53\u524D\u6A21\u5F0F\u4E0D\u4F7F\u7528\u540D\u5355\u3002": "This mode does not use the list.",
  "\u7FA4 ID": "Group",
  "\u6807\u9898": "Title",
  "\u6700\u8FD1\u6D3B\u52A8": "Last activity",
  "\uFF08\u9ED8\u8BA4\uFF09": " (default)",
  "\xD7 \u79FB\u9664": "\xD7 Remove",
  "\u81EA\u5B9A\u4E49": "Customize",
  "\u6DFB\u52A0\u7FA4\u804A": "Add group",
  "\u7FA4 ID\u3001@\u7528\u6237\u540D\u6216\u6D88\u606F\u94FE\u63A5": "Group ID, @username or message link",
  "\u652F\u6301\u6570\u5B57 ID\u3001@\u7528\u6237\u540D\u3001t.me/<name> \u6216 t.me/c/<id>/<msg>\uFF1B\u771F\u5B9E ID \u901A\u8FC7 getChat \u89E3\u6790\u3002": "Accepts a numeric ID, @username, t.me/<name> or t.me/c/<id>/<msg>; the real ID is resolved through getChat.",
  "+ \u6DFB\u52A0": "+ Add",
  "\u4FDD\u5B58\u7FA4\u804A\u8BBE\u7F6E": "Save group settings",
  "\u5DF2\u4ECE\u5217\u8868\u79FB\u9664\uFF0C\u4FDD\u5B58\u540E\u751F\u6548\u3002": "Removed from the list. Save to apply.",
  "\u5DF2\u6DFB\u52A0\uFF0C\u4FDD\u5B58\u540E\u751F\u6548\u3002": "Added. Save to apply.",
  "\u5DF2\u6DFB\u52A0\u3002Telegram \u672A\u786E\u8BA4\u8BE5\u7FA4\uFF08\u673A\u5668\u4EBA\u53EF\u80FD\u8FD8\u4E0D\u5728\u7FA4\u91CC\uFF09\uFF0C\u4FDD\u5B58\u540E\u751F\u6548\u3002": "Added without Telegram confirmation (the bot may not be in that group yet). Save to apply.",
  "\u7FA4\u804A\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\u3002": "Group settings saved.",
  "\u6B63\u5728\u8BFB\u53D6\u7FA4\u804A\u8BBE\u7F6E\u2026": "Loading group settings\u2026",
  "\u65E0\u6CD5\u8BFB\u53D6\u7FA4\u804A\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Unable to read group settings. Try again.",
  "\u65E0\u6CD5\u4FDD\u5B58\u7FA4\u804A\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Unable to save group settings. Try again.",
  "\u65E0\u6CD5\u8BFB\u53D6\u6216\u4FDD\u5B58\u7FA4\u804A\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Unable to read or save group settings. Try again.",
  "\u65E0\u6CD5\u89E3\u6790\u8BE5\u7FA4\u804A\uFF0C\u8BF7\u91CD\u8BD5\u6216\u586B\u5199\u6570\u5B57\u7FA4 ID\u3002": "Could not resolve this group. Try again or enter the numeric group ID.",
  "\u8BE5\u7FA4\u5DF2\u5728\u5217\u8868\u4E2D\uFF0C\u8BF7\u7F16\u8F91\u4E0A\u65B9\u7684\u5361\u7247\u3002": "This group is already in the list. Edit its card above instead.",
  "\u8BBF\u95EE\u8BBE\u7F6E": "Access settings",
  "\u67E5\u770B\u8BBF\u95EE\u6743\u9650\u8BF4\u660E": "View access permission details",
  "\u5141\u8BB8\u6240\u6709\u7528\u6237": "Allow all users",
  "\u4EC5\u767D\u540D\u5355\u7528\u6237": "Allowlisted users only",
  "\u9ED8\u8BA4\u547D\u4EE4\u6743\u9650": "Default command permission",
  "\u547D\u4EE4\u6743\u9650": "Command permission",
  "\u53EF\u4EE5\u6267\u884C\u547D\u4EE4": "Can run commands",
  "\u4E0D\u53EF\u4EE5\u6267\u884C\u547D\u4EE4": "Cannot run commands",
  "\u767D\u540D\u5355\u7528\u6237": "Allowlisted users",
  "\u67E5\u770B\u767D\u540D\u5355\u8BF4\u660E": "View allowlist details",
  "\u547D\u4EE4\u6743\u9650\u4F8B\u5916": "Command permission exceptions",
  "\u5F53\u524D\u6CA1\u6709\u767D\u540D\u5355\u7528\u6237\uFF0C\u4FDD\u5B58\u540E\u666E\u901A\u7528\u6237\u5C06\u65E0\u6CD5\u4F7F\u7528\u673A\u5668\u4EBA\u3002": "There are currently no allowlisted users. After saving, regular users will not be able to use the bot.",
  "\u65B0\u589E\u7528\u6237": "Add user",
  "\u5C1A\u672A\u6DFB\u52A0\u7528\u6237": "No users added",
  "\u5F53\u524D\u6E20\u9053\u4E0D\u652F\u6301\u7FA4\u804A": "Group chat is not supported by this channel",
  "\u539F\u6240\u6709\u8005\u6216\u626B\u7801\u63A5\u5165\u8005\u59CB\u7EC8\u53EF\u4EE5\u8BBF\u95EE\u5E76\u6267\u884C\u547D\u4EE4\uFF1B\u4EE5\u4E0B\u8BBE\u7F6E\u4EC5\u7EA6\u675F\u5176\u4ED6\u7528\u6237\u3002": "The original owner or QR-code operator can always access the bot and run commands; the settings below apply only to other users.",
  "\u5DF2\u7531\u63A5\u5165\u6D41\u7A0B\u786E\u8BA4\u7684\u6240\u6709\u8005\u53EF\u4EE5\u8BBF\u95EE\u5E76\u6267\u884C\u547D\u4EE4\uFF0C\u4E0D\u53D7\u672C\u9875\u9650\u5236\u3002\u672A\u8BC6\u522B\u5230\u6240\u6709\u8005\u8EAB\u4EFD\u65F6\uFF0C\u6309\u672C\u9875\u8BBF\u95EE\u8BBE\u7F6E\u6267\u884C\u3002": "Owners confirmed during connection setup can access the bot and run commands regardless of these settings. When no owner has been identified, these access settings apply.",
  "\u767D\u540D\u5355\u8BF7\u586B\u5199\u4F7F\u7528\u8005\u7684 Open ID\uFF0C\u4E0D\u662F\u673A\u5668\u4EBA\u7684 Open ID\u3002\u4EC5\u4FDD\u5B58\u901A\u914D\u7B26\u7684\u63A5\u5165\u914D\u7F6E\u4E0D\u5305\u542B\u6240\u6709\u8005\u8EAB\u4EFD\u3002": "Enter the user\u2019s Open ID in the allowlist, not the bot\u2019s Open ID. A connection configured with only a wildcard has no identified owner.",
  "\u626B\u7801\u83B7\u5F97\u7684\u662F\u79C1\u804A\u8EAB\u4EFD\uFF0C\u7FA4\u804A\u53EA\u6709\u5339\u914D\u5DF2\u786E\u8BA4\u7684\u6240\u6709\u8005\u8EAB\u4EFD\u65F6\u624D\u8C41\u514D\uFF1B\u5176\u4ED6\u6210\u5458\u6309\u7FA4\u804A\u767D\u540D\u5355\u8BBE\u7F6E\u6267\u884C\u3002": "QR setup identifies the owner for direct messages. In groups, only a matching confirmed owner identity is exempt; other members follow the group allowlist settings.",
  "\u586B\u5199\u4F7F\u7528\u8005\u7684 Open ID\uFF08ou_xxx\uFF09\uFF0C\u4E0D\u662F\u673A\u5668\u4EBA ID": "Enter the user\u2019s Open ID (ou_xxx), not the bot ID",
  "\u8FD9\u91CC\u9700\u8981\u586B\u5199\u7528\u6237\u7684 Open ID\uFF0C\u4E0D\u80FD\u586B\u5199\u673A\u5668\u4EBA\u81EA\u5DF1\u7684 Open ID\u3002": "Enter a user Open ID here, not the bot\u2019s own Open ID.",
  "\u6B64\u533A\u57DF\u65E0\u9700\u914D\u7F6E\uFF0C\u4FDD\u5B58\u79C1\u804A\u8BBE\u7F6E\u65F6\u4F1A\u4FDD\u7559\u73B0\u6709\u7FA4\u804A\u7B56\u7565\u3002": "No setup is needed here. Saving direct-message settings keeps the existing group policy.",
  "\u8BBF\u95EE\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\u3002": "Access settings saved.",
  "\u8BBF\u95EE\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002": "Access settings are currently unavailable.",
  "\u8BBF\u95EE\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Could not save access settings. Try again later.",
  "\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u5DF2\u4FDD\u5B58\u7684\u8BBF\u95EE\u7B56\u7565\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002": "The service did not return the saved access policy. Refresh and try again.",
  "\u8BBF\u95EE\u7B56\u7565\u5C1A\u672A\u5C31\u7EEA\uFF0C\u8BF7\u8FD4\u56DE\u673A\u5668\u4EBA\u5217\u8868\u5237\u65B0\u540E\u91CD\u8BD5\u3002": "The access policy is not ready. Return to the bot list, refresh, and try again.",
  "\u5F53\u524D\u6E20\u9053\u6682\u4E0D\u652F\u6301\u8BBF\u95EE\u8BBE\u7F6E\u3002": "Access settings are not supported by this channel yet.",
  "\u7528\u6237\u6807\u8BC6\u65E0\u6548\u3002": "The user ID is invalid.",
  "\u7528\u6237\u6807\u8BC6\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u3002": "The user ID must be a string.",
  "\u7528\u6237\u6807\u8BC6\u4E0D\u80FD\u4E3A\u7A7A\u3001\u5305\u542B\u63A7\u5236\u5B57\u7B26\u6216\u8D85\u8FC7 256 \u4E2A\u5B57\u7B26\u3002": "The user ID cannot be empty, contain control characters, or exceed 256 characters.",
  "\u7528\u6237\u6761\u76EE\u5FC5\u987B\u5305\u542B\u7528\u6237\u6807\u8BC6\u548C\u547D\u4EE4\u6743\u9650\u3002": "Each user entry must include a user ID and command permission.",
  "\u547D\u4EE4\u6743\u9650\u5FC5\u987B\u662F\u5E03\u5C14\u503C\u3002": "Command permission must be a boolean.",
  "\u8BBF\u95EE\u6A21\u5F0F\u53EA\u80FD\u662F open \u6216 allowlist\u3002": "Access mode must be open or allowlist.",
  "\u5F00\u653E\u6A21\u5F0F\u8BBE\u7F6E\u5FC5\u987B\u5B8C\u6574\u3002": "Open-mode settings must be complete.",
  "\u5F00\u653E\u6A21\u5F0F\u9ED8\u8BA4\u547D\u4EE4\u6743\u9650\u5FC5\u987B\u662F\u5E03\u5C14\u503C\u3002": "The open-mode default command permission must be a boolean.",
  "\u5F00\u653E\u6A21\u5F0F\u547D\u4EE4\u6743\u9650\u8986\u76D6\u7528\u6237\u5FC5\u987B\u662F\u6570\u7EC4\u3002": "Open-mode command permission overrides must be an array.",
  "\u5F00\u653E\u6A21\u5F0F\u547D\u4EE4\u6743\u9650\u8986\u76D6\u7528\u6237\u4E0D\u80FD\u5305\u542B\u91CD\u590D\u7684\u7528\u6237\u6807\u8BC6\u3002": "Open-mode command permission overrides cannot contain duplicate user IDs.",
  "\u767D\u540D\u5355\u6A21\u5F0F\u8BBE\u7F6E\u5FC5\u987B\u5B8C\u6574\u3002": "Allowlist-mode settings must be complete.",
  "\u767D\u540D\u5355\u6A21\u5F0F\u7528\u6237\u5FC5\u987B\u662F\u6570\u7EC4\u3002": "Allowlist-mode users must be an array.",
  "\u767D\u540D\u5355\u6A21\u5F0F\u7528\u6237\u4E0D\u80FD\u5305\u542B\u91CD\u590D\u7684\u7528\u6237\u6807\u8BC6\u3002": "Allowlist-mode users cannot contain duplicate user IDs.",
  "\u8BBF\u95EE\u573A\u666F\u8BBE\u7F6E\u5FC5\u987B\u540C\u65F6\u5305\u542B\u6A21\u5F0F\u3001\u5F00\u653E\u6A21\u5F0F\u8BBE\u7F6E\u548C\u767D\u540D\u5355\u6A21\u5F0F\u8BBE\u7F6E\u3002": "Each access context must include its mode, open-mode settings, and allowlist-mode settings.",
  "\u8BF7\u540C\u65F6\u63D0\u4EA4\u5B8C\u6574\u7684\u79C1\u804A\u548C\u7FA4\u804A\u8BBF\u95EE\u8BBE\u7F6E\u3002": "Submit complete direct-message and group access settings together.",
  "\u586B\u5199\u5FAE\u4FE1\u7528\u6237 ID": "Enter a WeChat user ID",
  "\u98DE\u4E66 Open ID": "Feishu Open ID",
  "\u7FA4\u6210\u5458 Open ID": "Group member Open ID",
  "\u9489\u9489\u7528\u6237 ID": "DingTalk user ID",
  "\u586B\u5199 senderStaffId \u6216 senderId": "Enter senderStaffId or senderId",
  "\u7FA4\u6210\u5458\u7528\u6237 ID": "Group member user ID",
  "\u4F01\u4E1A\u5FAE\u4FE1\u7528\u6237 ID": "WeCom user ID",
  "\u586B\u5199 userid": "Enter userid",
  "\u586B\u5199 member_openid": "Enter member_openid",
  "QQ User Open ID": "QQ User Open ID",
  "\u7FA4\u6210\u5458 User ID": "Group member User ID",
  "\u586B\u5199\u6570\u5B57 User ID": "Enter a numeric user ID",
  "WhatsApp \u7535\u8BDD\u53F7\u7801\u6216 JID": "WhatsApp phone number or JID",
  "\u7FA4\u6210\u5458\u7535\u8BDD\u53F7\u7801\u6216 JID": "Group member phone number or JID",
  "8613800000000 \u6216\u5B8C\u6574 JID": "8613800000000 or a full JID",
  "IM \u6E20\u9053": "IM channels",
  "\u8BA9 DeepSeek Harness \u89E6\u624B\u53EF\u53CA": "Connecting DeepSeek Harness",
  "\u5F53\u524D\u7248\u672C": "Current version",
  "DSH-IM \u66F4\u65B0": "DSH-IM update",
  "\u68C0\u67E5\u66F4\u65B0": "Check for updates",
  "DSH \u7248\u672C\u517C\u5BB9\u8BF4\u660E": "DSH version compatibility",
  "dsh-im 4.25.0 \u652F\u6301\u5230 DSH v0.1.6-alpha.2\u3002": "dsh-im 4.25.0 supports DSH up to v0.1.6-alpha.2.",
  "dsh-im 4.39.0 \u4EC5\u652F\u6301 DSH 0.2.0-rc.2\u3002": "dsh-im 4.39.0 only supports DSH 0.2.0-rc.2.",
  "dsh-im 5.0.0 \u4EC5\u652F\u6301 DSH 0.2.1-rc.2\u3002": "dsh-im 5.0.0 only supports DSH 0.2.1-rc.2.",
  "\u91CD\u65B0\u68C0\u67E5": "Check again",
  "\u5237\u65B0\u72B6\u6001": "Refresh status",
  "\u624B\u5DE5\u66F4\u65B0": "Manual update",
  "\u624B\u5DE5\u66F4\u65B0\u547D\u4EE4": "Manual update command",
  "\u590D\u5236\u547D\u4EE4": "Copy command",
  "\u590D\u5236\u4E2D\u2026": "Copying\u2026",
  "\u5DF2\u590D\u5236": "Copied",
  "\u547D\u4EE4\u5DF2\u590D\u5236\u3002": "Command copied.",
  "\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u9009\u4E2D\u547D\u4EE4\u540E\u6309 Ctrl+C \u6216 \u2318C \u590D\u5236\u3002": "Copy failed. Select the command and press Ctrl+C or \u2318C to copy it.",
  "\u81EA\u52A8\u66F4\u65B0\u5931\u8D25\u53EF\u4EE5\u4F7F\u7528\u547D\u4EE4\u66F4\u65B0\uFF1A": "If the automatic update fails, update with this command:",
  "\u5C1A\u672A\u786E\u8BA4\u76EE\u6807\u7248\u672C\uFF0C\u6B64\u547D\u4EE4\u5B89\u88C5\u6267\u884C\u65F6 npm \u7684 latest \u7248\u672C\u3002": "No target version has been confirmed. This command installs the npm latest version available when you run it.",
  "\u8BF7\u5728\u5F53\u524D Desktop \u7684\u5185\u7F6E\u7EC8\u7AEF\u6267\u884C\uFF0C\u5B8C\u6210\u540E\u624B\u52A8\u91CD\u542F\u3002": "Run this in the current Desktop\u2019s built-in terminal, then restart manually.",
  "\u8BF7\u5728\u8FD0\u884C\u5F53\u524D Harness \u7684\u540C\u4E00\u73AF\u5883\u6267\u884C\uFF0C\u4FDD\u6301 DSH_HOME \u4E00\u81F4\uFF0C\u5B8C\u6210\u540E\u624B\u52A8\u91CD\u542F\u3002": "Run this in the same environment as the current Harness, with the same DSH_HOME, then restart manually.",
  "\u8BF7\u7B49\u5F85\u5F53\u524D\u64CD\u4F5C\u7ED3\u675F\uFF0C\u786E\u8BA4\u6CA1\u6709\u5B89\u88C5\u8FDB\u7A0B\u8FD0\u884C\u540E\u518D\u6267\u884C\u547D\u4EE4\u3002": "Wait for the current operation to finish and confirm no installer is running before using this command.",
  "\u6E90\u7801\u6216\u94FE\u63A5\u5B89\u88C5\u8BF7\u6309\u539F\u5B89\u88C5\u65B9\u5F0F\u66F4\u65B0\uFF0C\u4E0D\u63D0\u4F9B\u8986\u76D6\u6E90\u7801\u7684 npm \u547D\u4EE4\u3002": "Update source or linked installations using their original method. No npm command is provided to overwrite the source.",
  "\u65E0\u6CD5\u5B89\u5168\u751F\u6210\u5F53\u524D profile \u7684\u547D\u4EE4\uFF0C\u8BF7\u5728\u7EC8\u7AEF\u4E2D\u624B\u52A8\u786E\u8BA4 profile \u540E\u66F4\u65B0\u3002": "A safe command cannot be generated for this profile. Confirm the profile in your terminal before updating manually.",
  "\u66F4\u65B0\u81F3": "Update to",
  "\u5B89\u88C5\u66F4\u65B0": "Install update",
  "\u6B63\u5728\u66F4\u65B0\u2026": "Updating\u2026",
  "\u5F85\u624B\u52A8\u91CD\u542F": "Restart needed",
  "\u8FD0\u884C\u7248\u672C": "Running version",
  "\u5DF2\u5B89\u88C5\u7248\u672C": "Installed version",
  "\u76EE\u6807 profile": "Target profile",
  "\u76EE\u6807\u7248\u672C": "Target version",
  "\u6700\u65B0\u7248\u672C": "Latest version",
  "\u4E0A\u6B21\u66F4\u65B0\u76EE\u6807": "Previous update target",
  "\u65E0\u6CD5\u786E\u8BA4": "Unknown",
  "\u53D1\u73B0\u65B0\u7248\u672C": "Update available",
  "\u5DF2\u662F\u6700\u65B0\u7248\u672C": "Up to date",
  "\u5F53\u524D\u7248\u672C\u65E0\u9700\u66F4\u65B0": "No newer version available",
  "\u5DF2\u83B7\u53D6 npm \u6700\u65B0\u7248\u672C": "Latest npm version retrieved",
  "\u68C0\u67E5 npm \u6700\u65B0\u7248\u672C\uFF0C\u4E0D\u4F1A\u81EA\u52A8\u5B89\u88C5\u3002": "Check the latest npm version. Nothing is installed automatically.",
  "\u6B63\u5728\u4ECE npm \u68C0\u67E5\u6700\u65B0\u7248\u672C\u2026": "Checking npm for the latest version\u2026",
  "\u6B63\u5728\u5B89\u88C5\uFF0C\u8BF7\u7A0D\u5019\u2026": "Installing, please wait\u2026",
  "\u6B63\u5728\u6821\u9A8C\u5B89\u88C5\u7ED3\u679C\u2026": "Verifying the installation\u2026",
  "\u5DF2\u5B89\u88C5\uFF0C\u5F85\u624B\u52A8\u91CD\u542F": "Installed \u2014 manual restart needed",
  "\u66F4\u65B0\u5DF2\u751F\u6548": "Updated version is active",
  "\u66F4\u65B0\u5931\u8D25": "Update failed",
  "\u66F4\u65B0\u8BF7\u6C42\u5931\u8D25": "Update request failed",
  "\u6682\u65F6\u65E0\u6CD5\u5B89\u88C5\u66F4\u65B0": "Update installation is unavailable",
  "\u4EC5\u66F4\u65B0 DSH-IM\u3002\u5B89\u88C5\u5B8C\u6210\u540E\u9700\u624B\u52A8\u91CD\u542F\u540E\u53F0\uFF1B\u672C\u529F\u80FD\u4E0D\u4F1A\u81EA\u52A8\u91CD\u542F\u6216\u4E3B\u52A8\u5237\u65B0\u9875\u9762\u3002": "Only DSH-IM will be updated. Restart the backend manually after installation. This feature does not automatically restart it or initiate a page refresh.",
  "\u5F53\u524D\u662F\u6E90\u7801\u6216\u94FE\u63A5\u5B89\u88C5\uFF0C\u53EA\u80FD\u68C0\u67E5\u7248\u672C\uFF1B\u8BF7\u624B\u52A8\u66F4\u65B0\u6E90\u7801\uFF0C\u6216\u8FC1\u79FB\u5230 npm \u5B89\u88C5\u3002": "This is a source or linked installation. You can check versions, but must update the source manually or migrate to an npm installation.",
  "\u65E0\u6CD5\u786E\u8BA4\u5F53\u524D profile\uFF0C\u8BF7\u5728\u5BF9\u5E94\u7684 Harness \u73AF\u5883\u4E2D\u624B\u52A8\u66F4\u65B0\u3002": "The current profile could not be identified. Update manually in the corresponding Harness environment.",
  "\u5F53\u524D\u8FD0\u884C\u73AF\u5883\u4E0D\u652F\u6301\u6309\u94AE\u5B89\u88C5\uFF0C\u8BF7\u624B\u52A8\u66F4\u65B0\u63D2\u4EF6\u3002": "This runtime cannot install through this button. Update the plugin manually.",
  "\u5F53\u524D npm \u6E90\u914D\u7F6E\u4E0E\u5B98\u65B9\u6E90\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u5148\u68C0\u67E5 registry \u914D\u7F6E\u3002": "The npm registry configuration differs from the official registry. Check your registry settings first.",
  "\u5F53\u524D Host \u7684 Node.js \u7248\u672C\u4E0D\u6EE1\u8DB3\u65B0\u7248\u8981\u6C42\uFF0C\u8BF7\u5148\u66F4\u65B0\u8FD0\u884C\u73AF\u5883\u3002": "The Host Node.js version does not meet the new version\u2019s requirements. Update the runtime first.",
  "\u65B0\u7248\u672C\u5DF2\u5B89\u88C5\uFF0C\u8BF7\u5728\u65B9\u4FBF\u65F6\u624B\u52A8\u91CD\u542F\u5F53\u524D Harness \u6216 Desktop\u3002": "The new version is installed. Manually restart this Harness or Desktop when convenient.",
  "\u4E0A\u6B21\u5B89\u88C5\u7ED3\u679C\u65E0\u6CD5\u786E\u8BA4\uFF0C\u8BF7\u5148\u68C0\u67E5\u6B64 profile \u7684\u63D2\u4EF6\u5B89\u88C5\u72B6\u6001\u3002": "The previous installation result is uncertain. Check this profile\u2019s plugin installation first.",
  "\u65E0\u6CD5\u8BBF\u95EE npm \u6216\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u65B0\u68C0\u67E5\u3002": "npm is unreachable or the request timed out. Check again later.",
  "npm \u8FD4\u56DE\u7684\u7248\u672C\u4FE1\u606F\u65E0\u6548\uFF0C\u6682\u65F6\u65E0\u6CD5\u66F4\u65B0\u3002": "npm returned invalid release information. Updating is unavailable.",
  "\u7248\u672C\u786E\u8BA4\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u68C0\u67E5\u540E\u518D\u5B89\u88C5\u3002": "The version confirmation expired. Check again before installing.",
  "\u63D2\u4EF6\u5B89\u88C5\u72B6\u6001\u5DF2\u53D1\u751F\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u68C0\u67E5\u3002": "The plugin installation changed. Check again.",
  "\u6B64 profile \u6B63\u5728\u66F4\u65B0\uFF0C\u8BF7\u7A0D\u540E\u67E5\u770B\u72B6\u6001\u3002": "This profile is already updating. Check its status shortly.",
  "\u5B89\u88C5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u5F53\u524D\u5B89\u88C5\u72B6\u6001\u540E\u91CD\u8BD5\u3002": "Installation failed. Check the current installation before retrying.",
  "\u5B89\u88C5\u7ED3\u679C\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u68C0\u67E5\u63D2\u4EF6\u7248\u672C\u3002": "Installation verification failed. Check the plugin version manually.",
  "\u65E0\u6CD5\u5B89\u5168\u4FDD\u5B58\u66F4\u65B0\u72B6\u6001\uFF0C\u8BF7\u5148\u68C0\u67E5\u5F53\u524D\u5B89\u88C5\u7ED3\u679C\u3002": "Update state could not be saved safely. Check the current installation result before retrying.",
  "\u4E0A\u6B21\u66F4\u65B0\u5DF2\u4E2D\u65AD\uFF0C\u8BF7\u68C0\u67E5\u5B89\u88C5\u72B6\u6001\u540E\u91CD\u8BD5\u3002": "The previous update was interrupted. Check the installation before retrying.",
  "\u66F4\u65B0\u670D\u52A1\u5DF2\u5173\u95ED\uFF0C\u8BF7\u624B\u52A8\u91CD\u65B0\u6253\u5F00\u8BBE\u7F6E\u9875\u3002": "The update service has closed. Reopen settings manually.",
  "\u66F4\u65B0\u8BF7\u6C42\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u68C0\u67E5\u7248\u672C\u3002": "The update request is invalid. Check the version again.",
  "\u5F53\u524D\u63D2\u4EF6\u5B89\u88C5\u4E0D\u5B8C\u6574\u6216\u4E0E profile \u4E0D\u7B26\uFF0C\u8BF7\u624B\u52A8\u68C0\u67E5\u5B89\u88C5\u914D\u7F6E\u3002": "The plugin installation is incomplete or does not match this profile. Check the installation configuration manually.",
  "\u65E0\u6CD5\u786E\u8BA4\u5F53\u524D npm \u6E90\u914D\u7F6E\uFF0C\u6682\u65F6\u4E0D\u80FD\u5B89\u88C5\u66F4\u65B0\u3002": "The npm registry configuration could not be verified. Installation is unavailable.",
  "\u5B89\u88C5\u8D85\u65F6\uFF0C\u8BF7\u5148\u786E\u8BA4\u5F53\u524D\u5B89\u88C5\u72B6\u6001\uFF0C\u518D\u51B3\u5B9A\u662F\u5426\u91CD\u8BD5\u3002": "Installation timed out. Check the current installation before retrying.",
  "\u66F4\u65B0\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "The update request failed. Try again.",
  "\u66F4\u65B0\u670D\u52A1\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94\u3002": "The update service returned an unrecognized response.",
  "\u5F53\u524D Host \u4E0D\u652F\u6301\u66F4\u65B0\u63A5\u53E3\uFF0C\u8BF7\u5148\u624B\u52A8\u66F4\u65B0\u63D2\u4EF6\u5E76\u91CD\u542F\u3002": "This Host does not support the update API. Update the plugin manually and restart first.",
  "\u5173\u95ED\u7A97\u53E3\u4E0D\u4F1A\u53D6\u6D88\u5B89\u88C5\u3002\u8BF7\u52FF\u540C\u65F6\u5728\u5176\u4ED6\u7A97\u53E3\u7BA1\u7406\u6B64 profile \u7684\u63D2\u4EF6\u3002": "Closing this window does not cancel installation. Do not manage this profile\u2019s plugins in another window at the same time.",
  "\u9875\u9762\u7248\u672C\u4E0E\u8FD0\u884C\u7248\u672C\u4E0D\u540C\uFF0C\u8BF7\u624B\u52A8\u5237\u65B0\u9875\u9762\uFF1B\u82E5\u4ECD\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u624B\u52A8\u91CD\u542F Harness \u6216 Desktop\u3002": "The page and running versions differ. Refresh the page manually; if they still differ, manually restart Harness or Desktop.",
  "\u8BF7\u5728\u673A\u5668\u4EBA\u7A7A\u95F2\u65F6\u5B89\u88C5\uFF1B\u5B89\u88C5\u4F1A\u4FEE\u6539\u5F53\u524D profile \u7684\u4F9D\u8D56\uFF0C\u5B8C\u6210\u540E\u9700\u624B\u52A8\u91CD\u542F\u3002": "Install while bots are idle. This changes the current profile\u2019s dependencies and requires a manual restart afterward.",
  "AI Office": "AI Office",
  "\uFF08\u5B9E\u9A8C\u529F\u80FD\uFF09": "(Experimental)",
  "AI Office \u8BBE\u7F6E": "AI Office settings",
  "AI Office \u8BBE\u7F6E\u9875\u7F3A\u5C11 RPC \u8FDE\u63A5": "AI Office settings are missing an RPC connection",
  "\u6B63\u5728\u8BFB\u53D6 AI Office Connector\u2026": "Loading AI Office Connector\u2026",
  "\u672C\u673A\u4E3B\u52A8\u8FDE\u63A5\u516C\u7F51 Office\uFF1BHarness \u4E0D\u5F00\u653E\u7AEF\u53E3\u3002\u534F\u8BAE Hook \u56FA\u5B9A\u4E3A ": "This machine connects outward to the public Office; Harness exposes no port. Protocol hooks: ",
  "\u5C1A\u672A\u914D\u7F6E": "Not configured",
  "\u5DF2\u8FDE\u63A5 Office": "Connected to Office",
  "\u5DF2\u914D\u7F6E": "Configured",
  "\u7B49\u5F85\u91CD\u8FDE": "Waiting to reconnect",
  "\u51ED\u636E\u7F3A\u5931": "Credential missing",
  "\u6700\u8FD1\u5FC3\u8DF3": "Last heartbeat",
  "\u6700\u8FD1\u4E8B\u4EF6": "Last event",
  "\u91CD\u8FDE\u6B21\u6570": "Reconnects",
  "\u8FD0\u884C Job": "Running Jobs",
  "\u5B8C\u6210 Job": "Completed Jobs",
  "\u5C1A\u65E0": "None yet",
  "\u8BBE\u5907\u8FDE\u63A5": "Device connection",
  "Token \u53EA\u5199\u5165\u672C\u673A\u51ED\u636E\u5B58\u50A8": "Token is written only to the local credential store",
  "\u7C98\u8D34 Office \u4E00\u6B21\u6027\u51ED\u636E": "Paste the one-time Office credential",
  "\u5DF2\u5B89\u5168\u4FDD\u5B58\uFF1B\u7559\u7A7A\u4FDD\u6301\u4E0D\u53D8": "Stored securely; leave blank to keep it",
  "\u6700\u5927\u5E76\u53D1": "Max concurrency",
  "Heartbeat \u79D2\u6570": "Heartbeat seconds",
  "Workspace \u6620\u5C04": "Workspace mappings",
  "\u6BCF\u884C alias=/\u672C\u673A/\u7EDD\u5BF9\u8DEF\u5F84\uFF1BOffice \u53EA\u80FD\u770B\u5230 alias\u3002": "One alias=/local/absolute/path per line; Office sees only aliases.",
  "Instruction Preset \u6620\u5C04": "Instruction preset mappings",
  "\u6BCF\u884C alias=\u6307\u4EE4\uFF1B\u65B0\u589E preset \u4E0D\u9700\u8981\u6539 Office \u4EE3\u7801\u3002": "One alias=instruction per line; new presets require no Office code change.",
  "\u4FDD\u5B58\u5E76\u8FDE\u63A5": "Save and connect",
  "\u6D4B\u8BD5\u8FDE\u63A5": "Test connection",
  "\u6D4B\u8BD5\u4E2D\u2026": "Testing\u2026",
  "\u91CD\u65B0\u8FDE\u63A5": "Reconnect",
  "\u79FB\u9664\u8FDE\u63A5": "Remove connection",
  "\u8FDE\u63A5\u6D4B\u8BD5\u901A\u8FC7\u3002": "Connection test passed.",
  "\u914D\u7F6E\u5DF2\u4FDD\u5B58\u3002": "Configuration saved.",
  "\u534F\u8BAE Hook \u9884\u89C8": "Protocol hook preview",
  "\u7531 Base URL \u81EA\u52A8\u6D3E\u751F\uFF0C\u4E0D\u5355\u72EC\u586B\u5199": "Derived from Base URL; no separate input",
  "Base URL \u65E0\u6548": "Invalid Base URL",
  "Office Hook \u5C1A\u672A\u90E8\u7F72\u65F6\uFF0C\u914D\u7F6E\u4F1A\u5B89\u5168\u4FDD\u5B58\u5E76\u81EA\u52A8\u91CD\u8BD5\uFF1B\u51FA\u73B0 HTTP 404 \u4EE3\u8868\u534F\u8BAE\u7AEF\u70B9\u5F85\u4E0A\u7EBF\uFF0C\u4E0D\u4EE3\u8868 Harness \u6545\u969C\u3002": "Configuration is saved and retried while Office hooks are unavailable; HTTP 404 means the protocol endpoint is pending, not a Harness failure.",
  "Workspace \u6620\u5C04\u6BCF\u884C\u5FC5\u987B\u4F7F\u7528 alias=value": "Each workspace mapping must use alias=value",
  "Instruction Preset \u6620\u5C04\u6BCF\u884C\u5FC5\u987B\u4F7F\u7528 alias=value": "Each instruction preset mapping must use alias=value",
  "action-items=\u8F6C\u6362\u4E3A\u8D1F\u8D23\u4EBA\u3001\u622A\u6B62\u548C\u9A8C\u6536\u660E\u786E\u7684\u5DE5\u5355": "action-items=Turn this into accountable tasks with deadlines and acceptance criteria",
  "AI Office \u62D2\u7EDD\u4E86 Device Token\u3002": "AI Office rejected the Device Token.",
  "AI Office Connector Hook \u5C1A\u672A\u5C31\u7EEA\u3002": "AI Office Connector hooks are not available yet.",
  "AI Office Connector \u534F\u8BAE\u7248\u672C\u4E0D\u517C\u5BB9\u3002": "The AI Office Connector protocol is incompatible.",
  "\u672C\u673A\u6682\u65F6\u65E0\u6CD5\u8BBF\u95EE AI Office\u3002": "AI Office cannot currently be reached from this machine.",
  "AI Office \u8FDE\u63A5\u5DF2\u4E2D\u65AD\u3002": "The AI Office connection was interrupted.",
  "\u5E2E\u52A9\u4E0E\u53CD\u9988 \xB7 \u524D\u5F80 GitHub": "Help & feedback \xB7 Open GitHub",
  "\u8BF7\u6539\u7528 localhost \u91CD\u65B0\u6253\u5F00": "Reopen with localhost",
  "\u9875\u9762\u4F1A\u5728\u5F53\u524D\u7AEF\u53E3\u91CD\u65B0\u6253\u5F00\uFF0C\u673A\u5668\u4EBA\u914D\u7F6E\u4E0D\u4F1A\u6539\u53D8\u3002": "The page will reopen on the current port. Your bot configuration will not change.",
  "\u4F7F\u7528 localhost \u91CD\u65B0\u6253\u5F00": "Reopen with localhost",
  "\u5F53\u524D\u5730\u5740\u4E0E\u6D4F\u89C8\u5668\u7684\u672C\u673A\u8BF7\u6C42\u6821\u9A8C\u4E0D\u517C\u5BB9\u3002\u8BF7\u4F7F\u7528\u4E0A\u65B9\u6309\u94AE\u6539\u7528 localhost \u91CD\u65B0\u6253\u5F00\u3002": "This address is incompatible with the browser\u2019s local-request checks. Use the button above to reopen with localhost.",
  "\u5FAE\u4FE1": "WeChat",
  "\u98DE\u4E66": "Feishu",
  "\u9489\u9489": "DingTalk",
  "\u4F01\u4E1A\u5FAE\u4FE1": "WeCom",
  "\u5FAE\u4FE1\u673A\u5668\u4EBA": "WeChat bot",
  "\u98DE\u4E66\u673A\u5668\u4EBA": "Feishu bot",
  "\u9489\u9489\u673A\u5668\u4EBA": "DingTalk bot",
  "\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA": "WeCom bot",
  "QQ\u673A\u5668\u4EBA": "QQ bot",
  "WhatsApp\u673A\u5668\u4EBA": "WhatsApp bot",
  "WhatsApp\u8D26\u53F7": "WhatsApp account",
  "\u5FAE\u4FE1\u8BBE\u7F6E": "WeChat settings",
  "\u98DE\u4E66\u673A\u5668\u4EBA\u8BBE\u7F6E": "Feishu bot settings",
  "\u7FA4\u804A\u54CD\u5E94\u65B9\u5F0F": "Group response mode",
  "\u4EC5\u5728 @\u673A\u5668\u4EBA\u65F6\u54CD\u5E94\uFF08\u63A8\u8350\uFF09": "Only respond when @mentioned (recommended)",
  "\u54CD\u5E94\u6240\u6709\u7FA4\u6D88\u606F": "Respond to all group messages",
  "\u54CD\u5E94\u6240\u6709\u7FA4\u6D88\u606F\uFF08\u9700\u98DE\u4E66\u654F\u611F\u6743\u9650\uFF09": "Respond to all group messages (requires a sensitive Feishu scope)",
  "\u91CD\u65B0\u6388\u6743": "Reauthorize",
  "\u53BB\u6388\u6743": "Authorize",
  "\u91CD\u65B0\u6388\u6743\u7FA4\u6D88\u606F\u6743\u9650": "Reauthorize group-message permission",
  "\u6388\u6743\u7FA4\u6D88\u606F\u6743\u9650": "Authorize group-message permission",
  "\u6B63\u5728\u51C6\u5907\u6388\u6743\u2026": "Preparing authorization\u2026",
  "\u6B63\u5728\u51C6\u5907\u2026": "Preparing\u2026",
  "\u79C1\u804A\u59CB\u7EC8\u54CD\u5E94\uFF1B\u7FA4\u804A\u4EC5\u5904\u7406\u660E\u786E @\u5F53\u524D\u673A\u5668\u4EBA\u7684\u6D88\u606F\u3002\u7FA4\u6D88\u606F\u6743\u9650\u5DF2\u5F00\u901A\uFF0C\u518D\u6B21\u5207\u6362\u65E0\u9700\u6388\u6743\u3002": "Direct messages always work; group chats require an explicit @mention of this bot. The group-message permission is already granted, so switching again needs no authorization.",
  "\u79C1\u804A\u59CB\u7EC8\u54CD\u5E94\uFF1B\u7FA4\u804A\u4EC5\u5904\u7406\u660E\u786E @\u5F53\u524D\u673A\u5668\u4EBA\u7684\u6D88\u606F\u3002\u9009\u62E9\u5168\u90E8\u6D88\u606F\u540E\u4F1A\u6253\u5F00\u98DE\u4E66\u5B98\u65B9\u6388\u6743\u6D41\u7A0B\u3002": "Direct messages always work; group chats require an explicit @mention of this bot. Selecting all messages opens the official Feishu authorization flow.",
  "\u5DF2\u5F00\u901A\u201C\u83B7\u53D6\u7FA4\u7EC4\u4E2D\u6240\u6709\u6D88\u606F\u201D\u6743\u9650\uFF08im:message.group_msg\uFF09\uFF1B\u673A\u5668\u4EBA\u4F1A\u5904\u7406\u7FA4\u804A\u4E2D\u7684\u6240\u6709\u53EF\u89C1\u6D88\u606F\u3002": "The \u201CRead all messages in associated group chat\u201D scope (im:message.group_msg) is granted; the bot processes every visible group message.",
  "\u5C1A\u672A\u786E\u8BA4\u201C\u83B7\u53D6\u7FA4\u7EC4\u4E2D\u6240\u6709\u6D88\u606F\u201D\u6743\u9650\uFF0C\u8BF7\u5B8C\u6210\u98DE\u4E66\u6388\u6743\u3002": "The \u201CRead all messages in associated group chat\u201D scope has not been confirmed. Complete Feishu authorization.",
  "\u79C1\u804A\u59CB\u7EC8\u54CD\u5E94\uFF1B\u7FA4\u804A\u4EC5\u5904\u7406\u660E\u786E @\u5F53\u524D\u673A\u5668\u4EBA\u7684\u6D88\u606F\u3002": "Direct messages always work; group chats require an explicit @mention of this bot.",
  "\u9700\u5728\u98DE\u4E66\u4E3A\u8BE5\u673A\u5668\u4EBA\u5F00\u901A\u201C\u83B7\u53D6\u7FA4\u7EC4\u4E2D\u6240\u6709\u6D88\u606F\u201D\u6743\u9650\uFF08im:message.group_msg\uFF09\uFF1B\u5F00\u901A\u540E\uFF0C\u673A\u5668\u4EBA\u4F1A\u5904\u7406\u7FA4\u804A\u4E2D\u7684\u6240\u6709\u53EF\u89C1\u6D88\u606F\u3002": "Grant this bot the \u201CRead all messages in associated group chat\u201D Feishu scope (im:message.group_msg); once granted, it will process every visible group message.",
  "\u7FA4\u804A\u54CD\u5E94\u65B9\u5F0F\u4FEE\u6539\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not update the group response mode. Try again.",
  "\u7FA4\u6D88\u606F\u6743\u9650\u6388\u6743\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not authorize group-message permission. Try again.",
  "\u88AB @ \u65F6\u4EE5\u8BDD\u9898\u65B9\u5F0F\u56DE\u590D": "Reply as a Feishu topic when mentioned",
  "\u4EE5\u8BDD\u9898\u65B9\u5F0F\u56DE\u590D\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not save the topic reply setting. Try again.",
  "\u5173\u95ED\uFF08\u5728\u4F1A\u8BDD\u4E3B\u7A97\u53E3\u56DE\u590D\uFF09": "Off (reply in the chat feed)",
  "\u5F00\u542F\uFF08\u81EA\u52A8\u5F00\u542F\u72EC\u7ACB\u98DE\u4E66\u8BDD\u9898\uFF09": "On (auto-open a dedicated Feishu topic)",
  "\u5F00\u542F\u540E\uFF0C\u5728\u7FA4\u804A\u6216\u79C1\u804A\u91CC @\u673A\u5668\u4EBA \u63D0\u95EE\uFF0C\u673A\u5668\u4EBA\u4F1A\u5728\u90A3\u6761\u6D88\u606F\u4E0B\u65B0\u5EFA\u4E00\u4E2A\u98DE\u4E66\u8BDD\u9898\u5E76\u5728\u8BDD\u9898\u5185\u56DE\u7B54\uFF1B\u8BE5\u8BDD\u9898\u662F\u4E00\u6761\u72EC\u7ACB\u4F1A\u8BDD\uFF0C\u8BDD\u9898\u91CC\u7684\u540E\u7EED\u6D88\u606F\u90FD\u5C5E\u4E8E\u540C\u4E00\u4E2A\u4F1A\u8BDD\u3002\u53EA\u53D1\u4E00\u4E2A @\u673A\u5668\u4EBA\uFF08\u6253\u5F00\u83DC\u5355\uFF09\u4E0D\u4F1A\u65B0\u5EFA\u8BDD\u9898\uFF0C\u6CA1\u6709 @\u673A\u5668\u4EBA \u7684\u6D88\u606F\u4E5F\u7559\u5728\u539F\u6765\u7684\u4F1A\u8BDD\u91CC\u3002": `When enabled, mentioning the bot in a group or a private chat opens a dedicated Feishu topic under that message and the answer stays inside it. That topic is an independent conversation in dsh, and later messages in the topic belong to the same conversation. A bare "@bot" (which opens the menu) opens no topic, and messages without a mention stay in the chat's own conversation.`,
  "\u5206\u6B65\u76F4\u63A8": "Step push",
  "\u6307\u4EE4\u9762\u677F": "Command panel",
  "\u4E2A\u5931\u8D25\u3002": "failed.",
  "\u4E2A\u673A\u5668\u4EBA\uFF0C": "bots,",
  "\u4E2A\u673A\u5668\u4EBA\u3002": "bots.",
  "\u5DF2\u540C\u6B65\u5230": "Copied to",
  "\u8FD9\u4E2A\u6E20\u9053\u6CA1\u6709\u5176\u4ED6\u98DE\u4E66\u673A\u5668\u4EBA\uFF0C\u4E0D\u7528\u540C\u6B65\u3002": "This channel has no other Feishu bots to copy to.",
  "\u6B63\u5728\u540C\u6B65\u2026": "Copying\u2026",
  "\u786E\u8BA4\u540C\u6B65": "Copy to all",
  "\u4E2A\u98DE\u4E66\u673A\u5668\u4EBA\uFF0C\u5B83\u4EEC\u5404\u81EA\u7684\u9762\u677F\u8BBE\u7F6E\u4F1A\u88AB\u8986\u76D6\u3002": "other Feishu bots, overwriting their own panel settings.",
  "\u5C06\u628A\u8FD9\u5957\u9762\u677F\u8BBE\u7F6E\u5199\u5165\u53E6\u5916": "This copies the panel to",
  "\u4FDD\u5B58\u5E76\u540C\u6B65\u5230\u5176\u4ED6\u673A\u5668\u4EBA": "Save and copy to the other bots",
  "\u6307\u4EE4\u9762\u677F\u8BBE\u7F6E": "Command panel settings",
  "\u6307\u4EE4\u9762\u677F\u6A21\u5F0F": "Command panel mode",
  "\u9762\u677F\u53EA\u51B3\u5B9A\u804A\u5929\u8F93\u5165\u6846\u91CC\u6253\u300C/\u300D\u65F6\u5217\u51FA\u7684\u6307\u4EE4\u548C\u987A\u5E8F\uFF1B\u88AB\u79FB\u9664\u7684\u6307\u4EE4\u4ECD\u53EF\u624B\u52A8\u8F93\u5165\uFF0C\u529F\u80FD\u4E0D\u53D7\u5F71\u54CD\u3002\u540C\u6B65\u7531\u673A\u5668\u4EBA\u540E\u53F0\u5B8C\u6210\uFF0C\u6307\u4EE4\u8F83\u591A\u65F6\u9700\u8981\u4E00\u70B9\u65F6\u95F4\u3002": 'The panel only decides which commands the "/" list in the chat input offers, and in which order. A removed command can still be typed by hand and keeps working. The bot syncs the panel in the background; many commands take a moment.',
  "\u8DDF\u968F\u9ED8\u8BA4\uFF08\u968F\u63D2\u4EF6\u7248\u672C\u66F4\u65B0\uFF09": "Follow the default (updated with the plugin)",
  "\u81EA\u5B9A\u4E49\uFF08\u81EA\u5DF1\u6311\u6307\u4EE4\u548C\u987A\u5E8F\uFF09": "Custom (choose the commands and their order)",
  "\u5F53\u524D\u6CA1\u6709\u9009\u62E9\u4EFB\u4F55\u6307\u4EE4\uFF0C\u4FDD\u5B58\u540E\u300C/\u300D\u9762\u677F\u4F1A\u53D8\u6210\u7A7A\u7684\u3002": 'No commands are selected; saving leaves the "/" panel empty.',
  "\u6DFB\u52A0\u6307\u4EE4": "Add command",
  "\u9009\u62E9\u8981\u52A0\u5165\u7684\u6307\u4EE4": "Choose a command to add",
  "\u6307\u4EE4\u90FD\u5DF2\u52A0\u5165": "Every command is already listed",
  "\u52A0\u5165": "Add",
  "\u6062\u590D\u5168\u90E8": "Restore all",
  "\u5168\u90E8\u79FB\u9664": "Remove all",
  "\u79FB\u9664": "Remove",
  "\u4E0A\u79FB": "Move up",
  "\u4E0B\u79FB": "Move down",
  "\u4FDD\u5B58": "Save",
  "\u5DF2\u4FDD\u5B58\uFF0C\u9762\u677F\u7A0D\u540E\u540C\u6B65": "Saved; the panel syncs shortly",
  "\u8BF7\u9009\u62E9\u9762\u677F\u8981\u663E\u793A\u7684\u6307\u4EE4\u4E0E\u987A\u5E8F\u3002": "Choose which commands the panel shows, and in what order.",
  "\u98DE\u4E66\u6307\u4EE4\u9762\u677F\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002": "The Feishu command panel settings are unavailable right now.",
  "\u67E5\u770B\u5206\u6B65\u76F4\u63A8\u8BF4\u660E": "View step push help",
  "\u5F00\u542F\u540E\u9010\u6B65\u63A8\u9001\u5DE5\u5177\u8C03\u7528\u4E0E\u8FC7\u7A0B\u8BF4\u660E": "Push tool calls and process notes step by step",
  "\u4EFB\u52A1\u8FC7\u7A0B\u5C55\u793A": "Task progress display",
  "\u8BBE\u7F6E\u4EFB\u52A1\u6267\u884C\u8FC7\u7A0B\u7684\u5448\u73B0\u65B9\u5F0F\uFF1A\u4E0D\u663E\u793A\u3001\u539F\u751F\u76F4\u64AD\u3001\u5B9E\u65F6\u5361\u7247\u6216\u9010\u6B65\u6D88\u606F": "Choose how execution is presented: hidden, native live process, one live card, or step-by-step messages",
  "\u4E0D\u663E\u793A\u8FC7\u7A0B\uFF08\u53EA\u53D1\u9001\u6700\u7EC8\u7B54\u6848\uFF09": "Hide the process (send the final answer only)",
  "\u5B9E\u65F6\u76F4\u64AD\uFF08\u98DE\u4E66\u539F\u751F\u601D\u8003\u8FC7\u7A0B\uFF09": "Live process (native Feishu thinking process)",
  "\u5B9E\u65F6\u8FC7\u7A0B\u5361\uFF08\u5168\u7A0B\u4E00\u5F20\u5361\u7247\u52A8\u6001\u66F4\u65B0\uFF09": "Live process card (one card updated throughout)",
  "\u9010\u6B65\u76F4\u64AD\uFF08\u6BCF\u4E00\u6B65\u5355\u72EC\u53D1\u4E00\u6761\u6D88\u606F\uFF09": "Step-by-step feed (one message per step)",
  "\u9002\u5408\u65E5\u5E38\u95EE\u7B54\uFF1A\u6267\u884C\u8FC7\u7A0B\u4E2D\u4E0D\u663E\u793A\u5DE5\u5177\u8C03\u7528\u7B49\u4E2D\u95F4\u6B65\u9AA4\uFF0C\u53EA\u56DE\u590D\u6700\u7EC8\u7ED3\u679C": "For everyday Q&A: tool calls and other interim steps stay hidden, only the final result is replied",
  "\u4F7F\u7528\u98DE\u4E66\u539F\u751F\u601D\u8003\u8FC7\u7A0B\u5C55\u793A\u63A8\u7406\u3001\u5DE5\u5177\u8C03\u7528\u4E0E\u7ED3\u679C\uFF0C\u6700\u7EC8\u7B54\u6848\u5355\u72EC\u53D1\u9001": "Use Feishu\u2019s native thinking process for reasoning, tool calls, and results, then send the final answer separately",
  "\u63A8\u8350\u957F\u4EFB\u52A1\u4F7F\u7528\uFF1A\u8FC7\u7A0B\u4E0E\u6700\u7EC8\u7B54\u6848\u90FD\u5728\u540C\u4E00\u5F20\u5361\u7247\u91CC\u5B9E\u65F6\u66F4\u65B0\uFF0C\u4E0D\u5237\u5C4F": "Recommended for long tasks: the process and the final answer update live in one card without flooding the chat",
  "\u6BCF\u4E00\u6B65\u90FD\u5355\u72EC\u53D1\u4E00\u6761\u6D88\u606F\uFF08\u542B\u5DE5\u5177\u8C03\u7528\u548C\u8FC7\u7A0B\u8BF4\u660E\uFF09\uFF1B\u6CE8\u610F\u957F\u4EFB\u52A1\u4F1A\u8FDE\u7EED\u53D1\u9001\u8F83\u591A\u6D88\u606F": "Every step is sent as its own message (including tool calls and notes); long tasks may send many messages in a row",
  "\u5206\u6B65\u76F4\u63A8\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not save the step push setting. Try again.",
  "\u8BED\u97F3\u4EA4\u4E92": "Voice",
  "\u6B63\u5728\u8BFB\u53D6\u8BED\u97F3\u8BBE\u7F6E\u2026": "Loading voice settings\u2026",
  "\u98DE\u4E66\u8BED\u97F3\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002": "Feishu voice settings are unavailable.",
  "\u672A\u627E\u5230\u5F53\u524D\u98DE\u4E66\u673A\u5668\u4EBA\uFF0C\u8BF7\u8FD4\u56DE\u5217\u8868\u540E\u91CD\u8BD5\u3002": "This Feishu bot was not found. Return to the bot list and try again.",
  "\u67E5\u770B\u8BED\u97F3\u4EA4\u4E92\u8BF4\u660E": "View voice help",
  "\u8BED\u97F3\u4EA4\u4E92\u5F00\u5173": "Voice on/off",
  "\u5F00\u542F(\u8BED\u97F3\u63D0\u95EE\u4E0E\u8BED\u97F3\u56DE\u590D)": "On (voice questions and voice replies)",
  "\u6536\u5230\u8BED\u97F3\u6D88\u606F\u65F6\u8F6C\u5199\u4E3A\u6587\u5B57\u5E76\u6309\u6587\u5B57\u6D41\u6C34\u7EBF\u5904\u7406,\u7B54\u6848\u540C\u65F6\u4EE5\u8BED\u97F3\u56DE\u590D;\u8F6C\u5199\u5931\u8D25\u65F6\u964D\u7EA7\u4E3A\u4EC5\u652F\u6301\u6587\u5B57/\u56FE\u7247/\u6587\u4EF6\u7684\u63D0\u793A\u3002\u51ED\u636E\u503C\u5728\u63D2\u4EF6\u51ED\u636E\u5E93\u91CC\u7BA1\u7406,\u8FD9\u91CC\u53EA\u5F15\u7528\u73AF\u5883\u53D8\u91CF\u540D\u3002": "Voice messages are transcribed to text and processed by the normal text pipeline; the answer is also sent as a voice reply. If transcription fails, the bot falls back to the text/image/file-only notice. The credential value lives in the plugin credential store; only the environment variable name is referenced here.",
  "\u51ED\u636E\u5F15\u7528(\u73AF\u5883\u53D8\u91CF\u540D)": "Credential reference (environment variable name)",
  "\u8F6C\u5199\u6A21\u578B(ASR)": "Transcription model (ASR)",
  "\u5408\u6210\u6A21\u578B(TTS)": "Synthesis model (TTS)",
  "\u56DE\u590D\u97F3\u8272": "Reply voice",
  '\u9700\u8981 DashScope \u5BC6\u94A5(\u51ED\u636E\u5E93\u4E2D\u4EE5"\u51ED\u636E\u5F15\u7528"\u4E3A\u540D\u7684\u73AF\u5883\u53D8\u91CF)\u4E0E\u53EF\u7528 ffmpeg;\u97F3\u8272\u652F\u6301 Cherry/Serena/Bella/Chelsie/Momo/Katerina \u7B49 qwen3-tts-flash \u5B98\u65B9\u97F3\u8272\u3002': "Requires a DashScope API key (the credential-store environment variable named by the credential reference above) and a working ffmpeg. Supported voices include the official qwen3-tts-flash voices Cherry/Serena/Bella/Chelsie/Momo/Katerina.",
  "\u4FDD\u5B58\u8BED\u97F3\u8BBE\u7F6E": "Save voice settings",
  "\u9ED8\u8BA4\u5173\u95ED;\u5F00\u542F\u540E\u673A\u5668\u4EBA\u53EF\u542C\u61C2\u8BED\u97F3\u6D88\u606F\u5E76\u4EE5\u8BED\u97F3\u56DE\u590D\u3002": "Off by default. When enabled, the bot understands voice messages and replies by voice.",
  "\u8BED\u97F3\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not save the voice settings. Try again.",
  "zcode\u8FC7\u7A0B\u5361\u6A21\u5F0F": "ZCode process-card mode",
  "\u8FC7\u7A0B\u8BF4\u660E\u3001\u5DE5\u5177\u6458\u8981\u4E0E\u6700\u7EC8\u7B54\u6848\u90FD\u5728\u540C\u4E00\u5F20\u5361\u7247\u4E2D\u539F\u5730\u5237\u65B0": "Process notes, the tool summary, and the final answer refresh in place inside one card",
  "\u601D\u8003\u4E0E\u5DE5\u5177\u6458\u8981\u6298\u53E0\u5C55\u793A\uFF0C\u6700\u7EC8\u7B54\u6848\u5728\u540C\u4E00\u5F20\u5361\u7247\u4E2D\u539F\u5730\u5237\u65B0": "Thinking and the tool summary stay folded; the final answer refreshes in place inside one card",
  "\u9489\u9489\u8BBE\u7F6E": "DingTalk settings",
  "\u4F01\u4E1A\u5FAE\u4FE1\u8BBE\u7F6E": "WeCom settings",
  "\u626B\u7801\u63A5\u5165\u673A\u5668\u4EBA": "Scan QR code",
  "\u6B63\u5728\u63A5\u5165": "Connecting",
  "\u624B\u52A8\u63A5\u5165": "Manual setup",
  "\u6536\u8D77\u51ED\u636E": "Hide credentials",
  "\u6536\u8D77\u63A5\u5165": "Hide setup",
  "\u5C55\u5F00\u8BE5\u8D26\u53F7\u7684\u8BBE\u7F6E": "Expand this account's settings",
  "\u6536\u8D77\u8BE5\u8D26\u53F7\u7684\u8BBE\u7F6E": "Collapse this account's settings",
  "\u63A5\u5165\u673A\u5668\u4EBA": "Connect bot",
  "\u5F00\u59CB\u63A5\u5165": "Start setup",
  "\u5728\u7EBF": "online",
  "\u8FD0\u884C\u6B63\u5E38": "Connected",
  "\u6B63\u5728\u8FDE\u63A5": "Connecting",
  "\u6B63\u5728\u8FDE\u63A5\u2026": "Connecting\u2026",
  "\u8FDE\u63A5\u672A\u5C31\u7EEA": "Not connected",
  "\u8FDE\u63A5\u4E2D": "Connecting",
  "\u8FDE\u63A5\u4E2D\u65AD": "Disconnected",
  "\u9700\u8981\u5904\u7406": "Needs attention",
  "\u72B6\u6001\u672A\u77E5": "Unknown status",
  "\u79BB\u7EBF": "Offline",
  "\u5DF2\u65AD\u5F00": "Disconnected",
  "\u6D88\u606F\u901A\u9053": "Message channel",
  "\u67E5\u770B\u6D88\u606F\u901A\u9053\u8BF4\u660E": "View message channel details",
  "\u6700\u8FD1\u68C0\u67E5": "Last checked",
  "\u6700\u8FD1\u4E00\u6761\u6D88\u606F\u5904\u7406\u5931\u8D25": "Latest message failed",
  "\u9519\u8BEF\u7801": "Code",
  "\u53C2\u8003\u53F7": "Reference",
  "\u5F53\u524D\u5DE5\u4F5C\u533A": "Current workspace",
  "\u9009\u62E9\u76EE\u5F55": "Choose folder",
  "\u9009\u62E9\u673A\u5668\u4EBA\u5DE5\u4F5C\u533A\u76EE\u5F55": "Select bot workspace folder",
  "\u5F53\u524D\u76EE\u5F55": "Current folder",
  "\u4E3B\u76EE\u5F55": "Home",
  "\u76F4\u63A5\u8F93\u5165\u8DEF\u5F84": "Enter a path directly",
  "\u652F\u6301 Windows \u76D8\u7B26\u3001UNC \u4E0E POSIX \u7EDD\u5BF9\u8DEF\u5F84\u3002": "Supports Windows drives, UNC paths, and POSIX absolute paths.",
  "\u8F93\u5165 Host \u4E0A\u7684\u5B8C\u6574\u7EDD\u5BF9\u8DEF\u5F84": "Enter a full absolute path on the Host",
  "\u524D\u5F80": "Go",
  "\u8BFB\u53D6\u4E2D\u2026": "Loading\u2026",
  "\u6B63\u5728\u51C6\u5907\u76EE\u5F55\u9009\u62E9\u5668\u2026": "Preparing folder picker\u2026",
  "\u6B63\u5728\u8BFB\u53D6\u76EE\u5F55\u2026": "Loading folders\u2026",
  "\u8FD9\u4E2A\u76EE\u5F55\u4E2D\u6CA1\u6709\u5B50\u6587\u4EF6\u5939\u3002": "This folder has no subfolders.",
  "\u6B64\u76EE\u5F55\u7684\u5B50\u6587\u4EF6\u5939\u8FC7\u591A\uFF0C\u4EC5\u663E\u793A\u524D\u4E00\u90E8\u5206\u3002": "This folder has too many subfolders; only the first group is shown.",
  "\u65E0\u6CD5\u8BFB\u53D6\u76EE\u5F55\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not load the folder. Try again.",
  "\u91CD\u8BD5": "Retry",
  "\u663E\u793A\u9690\u85CF\u6587\u4EF6\u5939": "Show hidden folders",
  "\u5207\u6362\u540E\u4F1A\u6E05\u9664\u8FD9\u4E2A\u673A\u5668\u4EBA\u7684\u65E7\u4F1A\u8BDD\u6620\u5C04\u3002": "Switching clears this bot\u2019s previous session mappings.",
  "\u5207\u6362\u4E2D\u2026": "Switching\u2026",
  "\u9009\u62E9\u6B64\u76EE\u5F55": "Select this folder",
  "\u5DE5\u4F5C\u533A\u7EDD\u5BF9\u8DEF\u5F84": "Absolute workspace path",
  "/\u7EDD\u5BF9\u8DEF\u5F84/\u5230/\u5DE5\u4F5C\u533A": "/absolute/path/to/workspace",
  "\u4FEE\u6539": "Change",
  "\u4E0A\u4E0B\u6587\u589E\u5F3A": "Context enhancement",
  "\u672A\u5F00\u542F": "Not enabled",
  "\u4EC5\u7FA4\u804A": "Groups only",
  "\u4EC5\u79C1\u804A": "Direct only",
  "\u7FA4\u804A\u548C\u79C1\u804A": "Groups and direct",
  "\u5173\u95ED\u5F39\u7A97": "Close dialog",
  "\u67E5\u770B\u4E0A\u4E0B\u6587\u589E\u5F3A\u8BF4\u660E": "View context enhancement details",
  "\u4E0A\u4E0B\u6587\u589E\u5F3A\u8303\u56F4": "Context enhancement scope",
  "\u542F\u7528\u8303\u56F4": "Enable in",
  "\u542F\u7528": "Enabled",
  "\uFF08\u5F53\u524D\u6E20\u9053\u4E0D\u652F\u6301\u7FA4\u804A\uFF09": "(This channel does not support group chats)",
  "\u6765\u6E90\u5B57\u6BB5": "Source fields",
  "\u67E5\u770B\u6765\u6E90\u5B57\u6BB5\u8BF4\u660E": "View source field details",
  "\u67E5\u770B\u7FA4\u804A\u6765\u6E90\u5B57\u6BB5\u8BF4\u660E": "View group source field details",
  "\u67E5\u770B\u79C1\u804A\u6765\u6E90\u5B57\u6BB5\u8BF4\u660E": "View direct source field details",
  "\u6E20\u9053": "Channel",
  "\u4F1A\u8BDD\u7C7B\u578B": "Conversation type",
  "\u53D1\u9001\u8005\u6807\u8BC6": "Sender ID",
  "\u53D1\u9001\u8005\u6635\u79F0": "Sender name",
  "\u67E5\u770B\u53D1\u9001\u8005\u6635\u79F0\u5B57\u6BB5\u8BF4\u660E": "View sender name field details",
  "\u67E5\u770B\u7FA4\u804A\u53D1\u9001\u8005\u6635\u79F0\u5B57\u6BB5\u8BF4\u660E": "View group sender name field details",
  "\u67E5\u770B\u79C1\u804A\u53D1\u9001\u8005\u6635\u79F0\u5B57\u6BB5\u8BF4\u660E": "View direct sender name field details",
  "\u8BE5\u5B57\u6BB5\u4E0D\u662F\u6BCF\u4E2A\u6E20\u9053\u90FD\u80FD\u63D0\u4F9B\u3002\u5F53\u524D\u6D88\u606F\u6CA1\u6709\u53D1\u9001\u8005\u6635\u79F0\u65F6\uFF0C\u5373\u4F7F\u5DF2\u9009\u62E9\u8BE5\u5B57\u6BB5\uFF0C<dsh_im_source> \u4E2D\u4E5F\u4F1A\u7701\u7565 senderName\u3002": "This field is not available on every channel. If the current message has no sender name, <dsh_im_source> omits senderName even when the field is selected.",
  "\u4F1A\u8BDD\u6807\u9898": "Conversation title",
  "\u67E5\u770B\u7FA4\u804A\u4F1A\u8BDD\u6807\u9898\u5B57\u6BB5\u8BF4\u660E": "View group conversation title field details",
  "\u67E5\u770B\u79C1\u804A\u4F1A\u8BDD\u6807\u9898\u5B57\u6BB5\u8BF4\u660E": "View direct conversation title field details",
  "\u8BE5\u5B57\u6BB5\u4E0D\u662F\u6BCF\u4E2A\u6E20\u9053\u90FD\u80FD\u63D0\u4F9B\u3002\u9489\u9489\u7FA4\u804A\u4F1A\u5E26\u4E0A\u7FA4\u540D\u3002\u5F53\u524D\u6D88\u606F\u6CA1\u6709\u4F1A\u8BDD\u6807\u9898\u65F6\uFF0C\u5373\u4F7F\u5DF2\u9009\u62E9\u8BE5\u5B57\u6BB5\uFF0C<dsh_im_source> \u4E2D\u4E5F\u4F1A\u7701\u7565 conversationTitle\u3002": "This field is not available on every channel. DingTalk group chats include the group name. If the current message has no conversation title, <dsh_im_source> omits conversationTitle even when the field is selected.",
  "\u4F1A\u8BDD\u6807\u8BC6": "Chat ID",
  "\u67E5\u770B\u7FA4\u804A\u4F1A\u8BDD\u6807\u8BC6\u5B57\u6BB5\u8BF4\u660E": "View group chat ID field details",
  "\u67E5\u770B\u79C1\u804A\u4F1A\u8BDD\u6807\u8BC6\u5B57\u6BB5\u8BF4\u660E": "View direct chat ID field details",
  "\u8BE5\u5B57\u6BB5\u4E0D\u662F\u6BCF\u4E2A\u6E20\u9053\u90FD\u80FD\u63D0\u4F9B\u3002\u4F1A\u8BDD\u6807\u8BC6\u7528\u4E8E\u533A\u5206\u4E0D\u540C\u7684\u7FA4\u7EC4\u6216\u79C1\u804A\uFF0C\u98DE\u4E66\u7FA4\u804A\u4F1A\u5E26\u4E0A\u7FA4 ID\u3002\u5F53\u524D\u6D88\u606F\u6CA1\u6709\u4F1A\u8BDD\u6807\u8BC6\u65F6\uFF0C\u5373\u4F7F\u5DF2\u9009\u62E9\u8BE5\u5B57\u6BB5\uFF0C<dsh_im_source> \u4E2D\u4E5F\u4F1A\u7701\u7565 chatId\u3002": "This field is not available on every channel. The chat ID distinguishes different groups or direct chats, and Feishu group chats include the group ID. If the current message has no chat ID, <dsh_im_source> omits chatId even when the field is selected.",
  "\u8BDD\u9898\u6807\u8BC6": "Topic ID",
  "\u67E5\u770B\u7FA4\u804A\u8BDD\u9898\u6807\u8BC6\u5B57\u6BB5\u8BF4\u660E": "View group topic ID field details",
  "\u67E5\u770B\u79C1\u804A\u8BDD\u9898\u6807\u8BC6\u5B57\u6BB5\u8BF4\u660E": "View direct topic ID field details",
  "\u8BE5\u5B57\u6BB5\u4E0D\u662F\u6BCF\u4E2A\u6E20\u9053\u90FD\u80FD\u63D0\u4F9B\u3002\u98DE\u4E66\u8BDD\u9898\u7FA4\u7684\u6D88\u606F\u4F1A\u5E26\u4E0A\u8BDD\u9898 ID\uFF0C\u7528\u4E8E\u533A\u5206\u540C\u4E00\u7FA4\u7EC4\u5185\u7684\u4E0D\u540C\u8BDD\u9898\uFF1B\u5F53\u524D\u6D88\u606F\u4E0D\u5728\u8BDD\u9898\u4E2D\u65F6\uFF0C\u5373\u4F7F\u5DF2\u9009\u62E9\u8BE5\u5B57\u6BB5\uFF0C<dsh_im_source> \u4E2D\u4E5F\u4F1A\u7701\u7565 threadId\u3002": "This field is not available on every channel. Messages in a Feishu topic chat carry the topic ID, which distinguishes different topics inside the same group. If the current message is not inside a topic, <dsh_im_source> omits threadId even when the field is selected.",
  "\u673A\u5668\u4EBA\u6807\u8BC6": "Bot ID",
  "\u53D1\u9001\u65F6\u95F4": "Sent at",
  "\u67E5\u770B\u7FA4\u804A\u53D1\u9001\u65F6\u95F4\u5B57\u6BB5\u8BF4\u660E": "View group sent-at field details",
  "\u67E5\u770B\u79C1\u804A\u53D1\u9001\u65F6\u95F4\u5B57\u6BB5\u8BF4\u660E": "View direct sent-at field details",
  "\u5F53\u524D\u6D88\u606F\u7684\u53D1\u9001\u65F6\u95F4\uFF0C\u683C\u5F0F\u4E3A YYYY-MM-DD HH:mm:ss\uFF08\u672C\u673A\u65F6\u533A\uFF09\u3002\u4F18\u5148\u4F7F\u7528\u5E73\u53F0\u7ED9\u51FA\u7684\u53D1\u9001\u65F6\u95F4\uFF1B\u5E73\u53F0\u672A\u63D0\u4F9B\u65F6\uFF0C\u4ECE\u5FAE\u4FE1\u6D88\u606F ID \u4E2D\u89E3\u6790\u51FA\u53D1\u9001\u65F6\u95F4\uFF1B\u4E24\u8005\u90FD\u4E0D\u53EF\u7528\u65F6\uFF0C\u5373\u4F7F\u5DF2\u9009\u62E9\u8BE5\u5B57\u6BB5\uFF0C<dsh_im_source> \u4E2D\u4E5F\u4F1A\u7701\u7565 sentAt\u3002\u76EE\u524D\u4EC5\u5FAE\u4FE1\u6E20\u9053\u63D0\u4F9B\uFF1B\u628A\u672C\u673A\u65F6\u533A\u5199\u8FDB\u589E\u5F3A\u63D0\u793A\u8BCD\uFF0C\u6A21\u578B\u5224\u65AD\u5148\u540E\u987A\u5E8F\u65F6\u66F4\u51C6\u786E\u3002": "When the current message was sent, as YYYY-MM-DD HH:mm:ss in the local time zone. The platform send time is used when available; otherwise the send time is decoded from the WeChat message ID. If neither is available, <dsh_im_source> omits sentAt even when the field is selected. WeChat is the only channel that provides it today. Naming your time zone in the guidance makes ordering judgements more accurate.",
  "\u589E\u5F3A\u63D0\u793A\u8BCD": "Guidance",
  "\u67E5\u770B\u589E\u5F3A\u63D0\u793A\u8BCD\u4F7F\u7528\u8BF4\u660E": "View guidance instructions",
  "\u67E5\u770B\u7FA4\u804A\u589E\u5F3A\u63D0\u793A\u8BCD\u4F7F\u7528\u8BF4\u660E": "View group guidance instructions",
  "\u67E5\u770B\u79C1\u804A\u589E\u5F3A\u63D0\u793A\u8BCD\u4F7F\u7528\u8BF4\u660E": "View direct guidance instructions",
  "\u4F7F\u7528\u8BF4\u660E": "How to use",
  "\u7528\u4E8E\u544A\u8BC9\u6A21\u578B\u5982\u4F55\u4F7F\u7528 <dsh_im_source> \u4E2D\u5DF2\u9009\u62E9\u7684\u6765\u6E90\u5B57\u6BB5\u3002\u53EA\u586B\u5199\u6B63\u6587\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u6DFB\u52A0 <dsh_im_source_guidance> \u6210\u5BF9\u6807\u7B7E\u3002": "Tell the model how to use the selected fields in <dsh_im_source>. Enter only the body; the plugin adds paired <dsh_im_source_guidance> tags.",
  "\u751F\u6548\u89C4\u5219": "Behavior",
  "\u9690\u79C1\u63D0\u793A": "Privacy",
  "\u4F7F\u7528\u793A\u4F8B": "Example",
  "\u4EC5\u4F9D\u636E\u5F53\u524D\u6D88\u606F\u7684 <dsh_im_source> \u4E2D\u5B9E\u9645\u63D0\u4F9B\u7684\u5B57\u6BB5\u7406\u89E3\u6765\u6E90\uFF1B\u6CA1\u6709\u63D0\u4F9B\u7684\u5B57\u6BB5\u4E0D\u8981\u731C\u6D4B\u6216\u8865\u5168\u3002\nconversationType\u662F\u7FA4\u804A\u65F6\u56DE\u590D\u4E25\u8083\u4E00\u70B9\uFF0CconversationType\u662F\u79C1\u804A\u65F6\u56DE\u590D\u4E00\u5B9A\u8981\u5E7D\u9ED8\u641E\u7B11\uFF0C\u50CF\u5468\u661F\u9A70\u7684\u7535\u5F71\u4E00\u6837\u641E\u7B11": "Understand the source only from fields actually present in <dsh_im_source> for the current message; do not guess or fill in missing fields.\nWhen conversationType is group, reply more seriously. When conversationType is direct, make the reply humorous and funny.",
  "\u4EC5\u4F9D\u636E\u5F53\u524D\u6D88\u606F\u7684 <dsh_im_source> \u4E2D\u5B9E\u9645\u63D0\u4F9B\u7684\u5B57\u6BB5\u7406\u89E3\u6765\u6E90\uFF1B\u6CA1\u6709\u63D0\u4F9B\u7684\u5B57\u6BB5\u4E0D\u8981\u731C\u6D4B\u6216\u8865\u5168\u3002\n\u5F53\u524D\u6D88\u606F\u6765\u81EA\u7FA4\u804A\uFF0C\u8BF7\u4F7F\u7528\u4E25\u8083\u3001\u514B\u5236\u3001\u7B80\u6D01\u7684\u8868\u8FBE\u65B9\u5F0F\u3002": "Understand the source only from fields actually present in <dsh_im_source> for the current message; do not guess or fill in missing fields.\nThis message is from a group chat. Use a serious, restrained, and concise style.",
  "\u4EC5\u4F9D\u636E\u5F53\u524D\u6D88\u606F\u7684 <dsh_im_source> \u4E2D\u5B9E\u9645\u63D0\u4F9B\u7684\u5B57\u6BB5\u7406\u89E3\u6765\u6E90\uFF1B\u6CA1\u6709\u63D0\u4F9B\u7684\u5B57\u6BB5\u4E0D\u8981\u731C\u6D4B\u6216\u8865\u5168\u3002\n\u5F53\u524D\u6D88\u606F\u6765\u81EA\u79C1\u804A\uFF0C\u53EF\u4EE5\u4F7F\u7528\u66F4\u8F7B\u677E\u3001\u5E7D\u9ED8\u3001\u8BE6\u7EC6\u7684\u8868\u8FBE\u65B9\u5F0F\u3002": "Understand the source only from fields actually present in <dsh_im_source> for the current message; do not guess or fill in missing fields.\nThis message is from a direct chat. You may use a lighter, more humorous, and detailed style.",
  "\u586B\u5165\u793A\u4F8B": "Use example",
  "\u6E05\u7A7A": "Clear",
  "\u9009\u62E9\u5728\u54EA\u4E9B\u4F1A\u8BDD\u4E2D\u542F\u7528\u3001\u63D0\u4F9B\u54EA\u4E9B\u6765\u6E90\u5B57\u6BB5\uFF0C\u4EE5\u53CA\u5982\u4F55\u4F7F\u7528\u8FD9\u4E9B\u4FE1\u606F\u3002\u4EC5\u4F7F\u7528\u5DF2\u6709\u6D88\u606F\u5143\u6570\u636E\uFF0C\u4E0D\u67E5\u8BE2\u5E73\u53F0 API\u3002": "Choose which conversations to enhance, which source fields to include, and how to use them. Only existing message metadata is used; no platform APIs are queried.",
  "\u589E\u5F3A\u63D0\u793A\u8BCD\u4E2D\u8BF7\u4F7F\u7528\u5B57\u6BB5\u540D\uFF08\u5982 senderId\u3001conversationType\uFF09\u5F15\u7528\u8FD9\u4E9B\u4FE1\u606F\u3002\u53EA\u53D1\u9001\u52FE\u9009\u4E14\u5F53\u524D\u6D88\u606F\u4E2D\u53EF\u7528\u7684\u5B57\u6BB5\uFF0C\u4E0D\u4F1A\u989D\u5916\u67E5\u8BE2\u6216\u8865\u5168\u3002": "Reference these values by field name (such as senderId or conversationType) in the guidance. Only selected fields available in the current message are sent; no extra lookups are made.",
  "\u589E\u5F3A\u63D0\u793A\u8BCD\u4E2D\u8BF7\u4F7F\u7528\u5B57\u6BB5\u540D\uFF08\u5982 senderId\u3001conversationType\uFF09\u5F15\u7528\u8FD9\u4E9B\u4FE1\u606F\u3002\u53EA\u53D1\u9001\u5F53\u524D\u4F1A\u8BDD\u4E2D\u52FE\u9009\u4E14\u53EF\u7528\u7684\u5B57\u6BB5\uFF0C\u4E0D\u4F1A\u989D\u5916\u67E5\u8BE2\u6216\u8865\u5168\u3002": "Reference these values by field name (such as senderId or conversationType) in the guidance. Only fields selected and available in the current conversation are sent; no extra lookups are made.",
  "\u7528\u4E8E\u544A\u8BC9\u6A21\u578B\u5982\u4F55\u4F7F\u7528\u5F53\u524D\u7FA4\u804A\u6D88\u606F\u7684 <dsh_im_source> \u6765\u6E90\u5B57\u6BB5\u3002\u53EA\u586B\u5199\u6B63\u6587\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u6DFB\u52A0 <dsh_im_source_guidance> \u6210\u5BF9\u6807\u7B7E\u3002": "Tell the model how to use <dsh_im_source> fields for the current group message. Enter only the body; the plugin adds paired <dsh_im_source_guidance> tags.",
  "\u7528\u4E8E\u544A\u8BC9\u6A21\u578B\u5982\u4F55\u4F7F\u7528\u5F53\u524D\u79C1\u804A\u6D88\u606F\u7684 <dsh_im_source> \u6765\u6E90\u5B57\u6BB5\u3002\u53EA\u586B\u5199\u6B63\u6587\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u6DFB\u52A0 <dsh_im_source_guidance> \u6210\u5BF9\u6807\u7B7E\u3002": "Tell the model how to use <dsh_im_source> fields for the current direct message. Enter only the body; the plugin adds paired <dsh_im_source_guidance> tags.",
  "\u4EC5\u5728\u7FA4\u804A\u5F00\u5173\u5F00\u542F\u65F6\u4F7F\u7528\u3002\u6E05\u7A7A\u5E76\u4FDD\u5B58\u540E\u4E0D\u518D\u9644\u52A0\u7FA4\u804A\u589E\u5F3A\u63D0\u793A\u8BCD\uFF1B\u6240\u9009\u6765\u6E90\u5B57\u6BB5\u4ECD\u6309\u5F53\u524D\u573A\u666F\u8BBE\u7F6E\u53D1\u9001\u3002": "Used only when group enhancement is enabled. Clear and save to omit group guidance; selected source fields still follow the group settings.",
  "\u4EC5\u5728\u79C1\u804A\u5F00\u5173\u5F00\u542F\u65F6\u4F7F\u7528\u3002\u6E05\u7A7A\u5E76\u4FDD\u5B58\u540E\u4E0D\u518D\u9644\u52A0\u79C1\u804A\u589E\u5F3A\u63D0\u793A\u8BCD\uFF1B\u6240\u9009\u6765\u6E90\u5B57\u6BB5\u4ECD\u6309\u5F53\u524D\u573A\u666F\u8BBE\u7F6E\u53D1\u9001\u3002": "Used only when direct enhancement is enabled. Clear and save to omit direct guidance; selected source fields still follow the direct settings.",
  "\u53EA\u9700\u586B\u5199\u6B63\u6587\uFF0C\u63D2\u4EF6\u81EA\u52A8\u6DFB\u52A0 <dsh_im_source_guidance> \u6210\u5BF9\u6807\u7B7E\u3002\u6E05\u7A7A\u5E76\u4FDD\u5B58\u540E\uFF0C\u4E0D\u518D\u9644\u52A0\u589E\u5F3A\u63D0\u793A\u8BCD\uFF0C\u5DF2\u9009\u6765\u6E90\u5B57\u6BB5\u4ECD\u6309\u5F00\u5173\u8BBE\u7F6E\u53D1\u9001\u3002": "Enter only the body; the plugin adds paired <dsh_im_source_guidance> tags. Clear and save to omit guidance. Selected source fields still follow the conversation switches.",
  "\u53D1\u9001\u8005\u6807\u8BC6\u53EF\u80FD\u5305\u542B\u5E73\u53F0\u7528\u6237 ID \u6216\u7535\u8BDD\u53F7\u7801\u5F62\u5F0F\u7684\u6807\u8BC6\u3002\u5173\u95ED\u5F00\u5173\u4E0D\u4F1A\u5220\u9664\u5DF2\u7ECF\u5199\u5165\u4F1A\u8BDD\u5386\u53F2\u7684\u4FE1\u606F\u3002": "Sender IDs may contain platform user IDs or phone-number-like identifiers. Turning this off does not remove information already saved in conversation history.",
  "\u4E0A\u4E0B\u6587\u589E\u5F3A\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not save context enhancement. Try again.",
  "\u8BF7\u63D0\u4EA4\u5B8C\u6574\u7684\u4E0A\u4E0B\u6587\u589E\u5F3A\u8BBE\u7F6E\u3002": "Submit the complete context enhancement settings.",
  "\u7FA4\u804A\u548C\u79C1\u804A\u5F00\u5173\u5FC5\u987B\u662F\u5E03\u5C14\u503C\u3002": "Group and direct switches must be booleans.",
  "\u6765\u6E90\u5B57\u6BB5\u53EA\u80FD\u9009\u62E9\u5DF2\u5B9A\u4E49\u7684\u5B57\u6BB5\u3002": "Source fields must be chosen from the defined fields.",
  "\u4FDD\u5B58\u4E2D\u2026": "Saving\u2026",
  "\u672A\u8BBE\u7F6E": "Not set",
  "\u5DE5\u4F5C\u533A\u4FEE\u6539\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not update the workspace. Try again.",
  "\u8BF7\u8F93\u5165\u5DE5\u4F5C\u533A\u7EDD\u5BF9\u8DEF\u5F84\u3002": "Enter an absolute workspace path.",
  "\u5DE5\u4F5C\u533A\u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84\u3002": "The workspace must be an absolute path.",
  "\u5DE5\u4F5C\u533A\u8DEF\u5F84\u4E0D\u5B58\u5728\u3002": "The workspace path does not exist.",
  "\u5DE5\u4F5C\u533A\u8DEF\u5F84\u5FC5\u987B\u6307\u5411\u4E00\u4E2A\u76EE\u5F55\u3002": "The workspace path must point to a directory.",
  "\u627E\u4E0D\u5230\u8981\u4FEE\u6539\u7684\u673A\u5668\u4EBA\u3002": "The bot could not be found.",
  "Agent Preset": "Agent Preset",
  "\u67E5\u770B Agent Preset \u8BF4\u660E": "View Agent Preset help",
  "\u8DDF\u968F Host \u9ED8\u8BA4": "Follow the Host default",
  "\uFF08\u5DF2\u4E0D\u53EF\u7528\uFF09": " (unavailable)",
  "\u53EA\u5F71\u54CD\u65B0\u5EFA\u4F1A\u8BDD\uFF1B\u82E5\u5F53\u524D\u804A\u5929\u5DF2\u6709\u4F1A\u8BDD\uFF0C\u5148\u53D1\u9001 /new\uFF0C\u518D\u53D1\u9001\u666E\u901A\u6D88\u606F\u751F\u6548\u3002": "This affects only new sessions. If the current chat already has a session, send /new, then send a regular message to apply it.",
  "\u5F53\u524D Agent Preset \u5DF2\u4E0D\u53EF\u7528\uFF0C\u8BF7\u9009\u62E9\u5176\u4ED6 Preset \u6216\u8DDF\u968F Host \u9ED8\u8BA4\u3002": "The current Agent Preset is unavailable. Choose another preset or follow the Host default.",
  "Agent Preset \u4FEE\u6539\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not update the Agent Preset. Try again.",
  "\u8BF7\u9009\u62E9 Agent Preset\u3002": "Choose an Agent Preset.",
  "Agent Preset \u65E0\u6548\u3002": "The Agent Preset is invalid.",
  "Agent Preset \u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u7528\u3002": "The Agent Preset does not exist or is unavailable.",
  "\u6A21\u578B": "Model",
  "\u6A21\u578B\u4E0E\u601D\u8003\u5F3A\u5EA6": "Model and reasoning effort",
  "\u601D\u8003\u5F3A\u5EA6": "Reasoning effort",
  "\u8DDF\u968F\u6A21\u578B\u9ED8\u8BA4": "Model default",
  "\u5148\u9009\u62E9\u6A21\u578B\uFF0C\u518D\u8BBE\u7F6E\u601D\u8003\u5F3A\u5EA6\u3002": "Select a model to configure its reasoning effort.",
  "\u8BE5\u6A21\u578B\u672A\u63D0\u4F9B\u53EF\u8C03\u8282\u7684\u601D\u8003\u5F3A\u5EA6\u3002": "This model does not provide adjustable reasoning effort.",
  "\u5DF2\u4FDD\u5B58\u7684\u601D\u8003\u5F3A\u5EA6\u5DF2\u4E0D\u53EF\u7528\uFF0C\u8BF7\u9009\u62E9\u5176\u4ED6\u5F3A\u5EA6\u6216\u6062\u590D\u9ED8\u8BA4\u3002": "The saved reasoning effort is unavailable. Choose another effort or restore the default.",
  "\u4F7F\u7528\u6A21\u578B\u6216\u670D\u52A1\u63D0\u4F9B\u65B9\u7684\u9ED8\u8BA4\u601D\u8003\u5F3A\u5EA6\u3002": "Use the default reasoning effort from the model or provider.",
  "\u5F53\u524D\u6A21\u578B\u4E0D\u652F\u6301\u6240\u9009\u601D\u8003\u5F3A\u5EA6\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002": "This model does not support the selected reasoning effort. Choose another effort.",
  "\u67E5\u770B\u6A21\u578B\u8BBE\u7F6E\u8BF4\u660E": "View model setting help",
  "\u8DDF\u968F\u9ED8\u8BA4\u6A21\u578B": "Follow the default model",
  "\u6A21\u578B\u4FEE\u6539\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not update the model. Try again.",
  "\u6A21\u578B\u65E0\u6548\u3002": "The model is invalid.",
  "\u6A21\u578B\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u7528\u3002": "The model does not exist or is unavailable.",
  "\u5F53\u524D\u6A21\u578B\u5DF2\u4E0D\u53EF\u7528\uFF0C\u8BF7\u9009\u62E9\u5176\u4ED6\u6A21\u578B\u6216\u8DDF\u968F\u9ED8\u8BA4\u6A21\u578B\u3002": "The current model is unavailable. Choose another model or follow the default.",
  "\u5C1A\u672A\u68C0\u67E5": "Not checked yet",
  "\u521A\u521A": "Just now",
  "\u68C0\u67E5\u8FDE\u63A5": "Check connection",
  "\u68C0\u67E5\u4E2D\u2026": "Checking\u2026",
  "\u8FDE\u63A5\u68C0\u67E5\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Connection check failed. Try again later.",
  "\u673A\u5668\u4EBA\u5DF2\u4FDD\u5B58\uFF0C\u4F46\u8FDE\u63A5\u672A\u5C31\u7EEA": "The bot was saved, but the connection is not ready",
  "\u67E5\u770B\u5DF2\u4FDD\u5B58\u7684\u673A\u5668\u4EBA": "View saved bot",
  "\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\uFF0C\u8BF7\u5230\u5BF9\u5E94\u673A\u5668\u4EBA\u4F1A\u8BDD\u4E2D\u786E\u8BA4\u3002": "Test message sent. Check the matching bot conversation.",
  "\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\u3002\u673A\u5668\u4EBA\u5C1A\u672A\u6536\u5230\u53EF\u7528\u4E8E\u6D4B\u8BD5\u7684\u79C1\u804A\u6D88\u606F\u3002": "Connection check completed. The bot has not received a direct message it can use for testing.",
  "\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\uFF0C\u4F46\u6D4B\u8BD5\u6D88\u606F\u53D1\u9001\u5931\u8D25\u3002": "Connection check completed, but the test message could not be sent.",
  "\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\uFF0C\u8BF7\u5230\u98DE\u4E66\u4F1A\u8BDD\u4E2D\u786E\u8BA4\u3002": "Test message sent. Check the Feishu conversation.",
  "\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\uFF0C\u8BF7\u5230 WhatsApp \u81EA\u804A\u4F1A\u8BDD\u4E2D\u786E\u8BA4\u3002": "Test message sent. Check the WhatsApp self-chat.",
  "\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\uFF0C\u4F46\u5F53\u524D\u6CA1\u6709\u53EF\u7528\u7684 WhatsApp \u81EA\u804A\u76EE\u6807\u3002": "Connection check completed, but no WhatsApp self-chat target is available.",
  "\u9489\u9489\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\uFF0C\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\u3002": "DingTalk connection check completed and the test message was sent.",
  "\u9489\u9489\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\uFF0C\u4F46\u6D4B\u8BD5\u6D88\u606F\u53D1\u9001\u5931\u8D25\u3002": "DingTalk connection check completed, but the test message could not be sent.",
  "\u5FAE\u4FE1\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\uFF0C\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\u3002": "WeChat connection check completed and the test message was sent.",
  "\u5FAE\u4FE1\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\uFF0C\u4F46\u6D4B\u8BD5\u6D88\u606F\u53D1\u9001\u5931\u8D25\u3002": "WeChat connection check completed, but the test message could not be sent.",
  "\u4F01\u4E1A\u5FAE\u4FE1\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\uFF0C\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\u3002": "WeCom connection check completed and the test message was sent.",
  "\u4F01\u4E1A\u5FAE\u4FE1\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\uFF0C\u4F46\u6D4B\u8BD5\u6D88\u606F\u53D1\u9001\u5931\u8D25\u3002": "WeCom connection check completed, but the test message could not be sent.",
  "\u91CD\u8BD5\u8FDE\u63A5": "Reconnect",
  "\u91CD\u8BD5\u4E2D\u2026": "Retrying\u2026",
  "\u79FB\u9664\u63A5\u5165": "Remove connection",
  "\u786E\u8BA4\u79FB\u9664\u63A5\u5165": "Remove connection",
  "\u786E\u8BA4\u79FB\u9664": "Remove",
  "\u6B63\u5728\u79FB\u9664\u2026": "Removing\u2026",
  "\u4FDD\u7559\u673A\u5668\u4EBA": "Keep bot",
  "\u4FDD\u7559\u8D26\u53F7": "Keep account",
  "\u53D6\u6D88": "Cancel",
  "\u5173\u95ED": "Close",
  "\u7ACB\u5373\u91CD\u8BD5": "Retry now",
  "\u91CD\u65B0\u8BFB\u53D6": "Reload",
  "\u91CD\u65B0\u751F\u6210\u4E8C\u7EF4\u7801": "Generate a new QR code",
  "\u91CD\u65B0\u751F\u6210\u4E8C\u7EF4\u7801\u540E\u7EE7\u7EED": "Generate a new QR code",
  "\u5237\u65B0\u4E8C\u7EF4\u7801": "Refresh QR code",
  "\u5237\u65B0\u4E2D\u2026": "Refreshing\u2026",
  "\u6362\u4E00\u4E2A\u4E8C\u7EF4\u7801": "Get another QR code",
  "\u7EE7\u7EED\u8FDE\u63A5": "Continue connecting",
  "\u7ED1\u5B9A\u5E76\u8FDE\u63A5": "Connect",
  "\u6B63\u5728\u7ED1\u5B9A\u2026": "Connecting\u2026",
  "\u9A8C\u8BC1\u5E76\u8FDE\u63A5": "Verify and connect",
  "\u6B63\u5728\u9A8C\u8BC1\u5E76\u8FDE\u63A5\u2026": "Verifying and connecting\u2026",
  "\u6B63\u5728\u9A8C\u8BC1\u2026": "Verifying\u2026",
  "\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5": "The operation failed. Try again later.",
  "\u8BF7\u7A0D\u540E\u91CD\u8BD5": "Try again later.",
  "\u5F53\u524D\u4E8C\u7EF4\u7801\u6709\u6548\u65F6\u95F4": "QR code expires in",
  "\u4E8C\u7EF4\u7801\u6709\u6548\u65F6\u95F4": "QR code expires in",
  "\u4E8C\u7EF4\u7801\u5DF2\u8FC7\u671F": "QR code expired",
  "\u4E8C\u7EF4\u7801\u5DF2\u5931\u6548": "QR code expired",
  "\u4E8C\u7EF4\u7801\u5DF2\u8FC7\u671F\n\u8BF7\u91CD\u65B0\u751F\u6210": "QR code expired\nGenerate a new one",
  "\u4E8C\u7EF4\u7801\u56FE\u7247\u6B63\u5728\u751F\u6210\u2026": "Generating QR code\u2026",
  "\u4E8C\u7EF4\u7801\u6B63\u5728\u751F\u6210\u2026": "Generating QR code\u2026",
  "\u4E8C\u7EF4\u7801\u6B63\u5728\u81EA\u52A8\u5237\u65B0\u2026": "Refreshing QR code\u2026",
  "\u4E8C\u7EF4\u7801\u672A\u5C31\u7EEA\uFF0C\u8BF7\u6253\u5F00\u6388\u6743\u94FE\u63A5": "The QR code is not ready. Open the authorization link.",
  "\u4E8C\u7EF4\u7801\u56FE\u7247\u672A\u5C31\u7EEA\uFF0C\u8BF7\u4F7F\u7528\u5907\u7528\u94FE\u63A5\u3002": "The QR code is not ready. Use the alternate link.",
  "\u4E8C\u7EF4\u7801\u56FE\u7247\u672A\u5C31\u7EEA\uFF0C\u8BF7\u91CD\u65B0\u751F\u6210\u3002": "The QR code is not ready. Generate a new one.",
  "\u7B49\u5F85\u5237\u65B0": "Waiting to refresh",
  "\u6B63\u5728\u5237\u65B0\u4E8C\u7EF4\u7801": "Refreshing QR code",
  "\u6253\u5F00\u5907\u7528\u94FE\u63A5": "Open alternate link",
  "\u751F\u6210\u4E8C\u7EF4\u7801": "Generate QR code",
  "\u751F\u6210\u5FAE\u4FE1\u4E8C\u7EF4\u7801": "Generate WeChat QR code",
  "\u751F\u6210\u98DE\u4E66\u4E8C\u7EF4\u7801": "Generate Feishu QR code",
  "\u751F\u6210\u9489\u9489\u4E8C\u7EF4\u7801": "Generate DingTalk QR code",
  "\u751F\u6210\u4F01\u4E1A\u5FAE\u4FE1\u4E8C\u7EF4\u7801": "Generate WeCom QR code",
  "\u751F\u6210 QQ \u4E8C\u7EF4\u7801": "Generate QQ QR code",
  "\u6B63\u5728\u751F\u6210\u4E8C\u7EF4\u7801\u2026": "Generating QR code\u2026",
  "\u6B63\u5728\u51C6\u5907\u6388\u6743\u4E8C\u7EF4\u7801": "Preparing authorization QR code",
  "\u6B63\u5728\u51C6\u5907\u6743\u9650\u6388\u6743\u4E8C\u7EF4\u7801": "Preparing permission authorization QR code",
  "\u6B63\u5728\u51C6\u5907\u5FAE\u4FE1\u4E8C\u7EF4\u7801": "Preparing WeChat QR code",
  "\u6B63\u5728\u6DFB\u52A0\u65B0\u673A\u5668\u4EBA": "Adding a new bot",
  "\u6B63\u5728\u7533\u8BF7\u9489\u9489\u6388\u6743\u4E8C\u7EF4\u7801\u2026": "Requesting DingTalk authorization QR code\u2026",
  "\u6B63\u5728\u7533\u8BF7\u4F01\u4E1A\u5FAE\u4FE1\u4E8C\u7EF4\u7801\u2026": "Requesting WeCom QR code\u2026",
  "\u6B63\u5728\u7533\u8BF7 QQ \u4E8C\u7EF4\u7801\u2026": "Requesting QQ QR code\u2026",
  "\u6B63\u5728\u751F\u6210 WhatsApp \u4E8C\u7EF4\u7801": "Generating WhatsApp QR code",
  "\u626B\u7801\uFF0C\u521B\u5EFA\u7B2C\u4E00\u4E2A\u98DE\u4E66\u5165\u53E3": "Scan to create your first Feishu bot",
  "\u626B\u7801\u4F1A\u65B0\u589E\u4E00\u4E2A\u673A\u5668\u4EBA\uFF0C\u5E76\u7533\u8BF7 im:message.group_msg\uFF08\u63A5\u6536\u672A @ \u7684\u7FA4\u6D88\u606F\uFF09\u3001im:message:readonly\uFF08\u8BFB\u53D6\u6D88\u606F\u4E2D\u7684\u56FE\u7247\u6216\u6587\u4EF6\uFF09\u7B49\u6240\u9700\u6743\u9650\u3002\u65B0\u673A\u5668\u4EBA\u9ED8\u8BA4\u4EC5 @ \u65F6\u56DE\u590D\uFF0C\u5B9E\u9645\u6536\u5230\u7684\u7FA4\u6D88\u606F\u548C\u6587\u4EF6\u4F1A\u81EA\u52A8\u4FDD\u5B58\uFF1B\u5DF2\u63A5\u5165\u7684\u673A\u5668\u4EBA\u7EE7\u7EED\u6B63\u5E38\u6536\u53D1\u6D88\u606F\u3002": "Scanning creates a bot and requests the required permissions, including im:message.group_msg for group messages without mentions and im:message:readonly for images or files in messages. New bots reply only when mentioned by default; received group messages and files are saved automatically. Existing bots continue to work.",
  "\u65E0\u9700\u624B\u52A8\u586B\u5199 App ID\u3002\u4EE5\u540E\u8FD8\u53EF\u4EE5\u7EE7\u7EED\u6DFB\u52A0\u673A\u5668\u4EBA\uFF0C\u5206\u522B\u670D\u52A1\u4E0D\u540C\u56E2\u961F\u6216\u98DE\u4E66\u79DF\u6237\u3002": "No App ID is required. You can add more bots later for different teams or Feishu tenants.",
  "\u4F7F\u7528\u98DE\u4E66\u626B\u7801\u521B\u5EFA\u673A\u5668\u4EBA": "Scan with Feishu to create a bot",
  "\u5237\u65B0\u4E8C\u7EF4\u7801\u540E\u7EE7\u7EED": "Refresh the QR code to continue",
  "\u6253\u5F00\u98DE\u4E66\u79FB\u52A8\u7AEF\uFF0C\u4F7F\u7528\u626B\u4E00\u626B\u8BFB\u53D6\u4E8C\u7EF4\u7801": "Open Feishu on your phone and scan the QR code",
  "\u6838\u5BF9\u5E94\u7528\u540D\u79F0\u4E0E\u6743\u9650\u8303\u56F4\uFF0C\u5E76\u786E\u8BA4\u521B\u5EFA": "Review the app name and permissions, then confirm",
  "\u4FDD\u6301\u672C\u9875\u6253\u5F00\uFF0C\u7B49\u5F85\u65B0\u673A\u5668\u4EBA\u7684\u957F\u8FDE\u63A5\u5C31\u7EEA": "Keep this page open until the bot connection is ready",
  "\u5728\u98DE\u4E66\u4E2D\u6253\u5F00": "Open in Feishu",
  "\u53D6\u6D88\u6DFB\u52A0": "Cancel",
  "\u4F7F\u7528\u98DE\u4E66\u626B\u7801\u8865\u5168\u6743\u9650": "Scan with Feishu to complete permissions",
  "\u4F7F\u7528\u98DE\u4E66\u786E\u8BA4\u7FA4\u6D88\u606F\u6743\u9650": "Confirm group-message permission with Feishu",
  "\u626B\u7801\u4F1A\u66F4\u65B0\u73B0\u6709\u98DE\u4E66\u5E94\u7528\uFF0C\u53EA\u589E\u91CF\u5F00\u901A\u201C\u83B7\u53D6\u7FA4\u7EC4\u4E2D\u6240\u6709\u6D88\u606F\u201D\u6743\u9650\uFF1B\u4E0D\u4F1A\u521B\u5EFA\u65B0\u5E94\u7528\u3002\u786E\u8BA4\u540E\u4F1A\u81EA\u52A8\u542F\u7528\u201C\u54CD\u5E94\u6240\u6709\u7FA4\u6D88\u606F\u201D\uFF0C\u5176\u4ED6\u673A\u5668\u4EBA\u4E0D\u53D7\u5F71\u54CD\u3002": "Scanning updates the existing Feishu app with only the \u201CRead all messages in associated group chat\u201D scope. It does not create a new app. After confirmation, \u201CRespond to all group messages\u201D is enabled automatically; other bots are unaffected.",
  "\u6838\u5BF9\u73B0\u6709\u5E94\u7528\uFF0C\u5E76\u786E\u8BA4\u201C\u83B7\u53D6\u7FA4\u7EC4\u4E2D\u6240\u6709\u6D88\u606F\u201D\u6743\u9650": "Review the existing app and confirm the \u201CRead all messages in associated group chat\u201D permission",
  "\u4FDD\u6301\u672C\u9875\u6253\u5F00\uFF0C\u7B49\u5F85\u6743\u9650\u751F\u6548\u5E76\u81EA\u52A8\u5207\u6362\u54CD\u5E94\u65B9\u5F0F": "Keep this page open while the permission takes effect and the response mode switches automatically",
  "\u53D6\u6D88\u6388\u6743": "Cancel authorization",
  "\u5DF2\u786E\u8BA4\uFF0C\u6B63\u5728\u542F\u7528\u5168\u90E8\u6D88\u606F\u6A21\u5F0F": "Confirmed. Enabling all-message mode",
  "\u6743\u9650\u914D\u7F6E\u5DF2\u63D0\u4EA4\uFF0C\u6B63\u5728\u4FDD\u5B58\u8BBE\u7F6E\u5E76\u91CD\u8FDE\u6B64\u673A\u5668\u4EBA\uFF1B\u6B64\u9636\u6BB5\u65E0\u6CD5\u53D6\u6D88\uFF0C\u5176\u4ED6\u673A\u5668\u4EBA\u4E0D\u4F1A\u4E2D\u65AD\u3002": "The permission update was submitted. Saving the setting and reconnecting this bot. This stage cannot be cancelled; other bots will not be interrupted.",
  "\u6743\u9650\u914D\u7F6E\u5DF2\u63D0\u4EA4\uFF0C\u6B63\u5728\u542F\u7528\u5168\u90E8\u6D88\u606F\u6A21\u5F0F\u5E76\u91CD\u8FDE\u6B64\u673A\u5668\u4EBA\uFF1B\u6B64\u9636\u6BB5\u65E0\u6CD5\u53D6\u6D88\uFF0C\u5176\u4ED6\u673A\u5668\u4EBA\u4E0D\u4F1A\u4E2D\u65AD\u3002": "The permission update was submitted. Enabling all-message mode and reconnecting this bot. This stage cannot be cancelled; other bots will not be interrupted.",
  "\u6B63\u5728\u4E3A\u73B0\u6709\u98DE\u4E66\u5E94\u7528\u7533\u8BF7\u7FA4\u6D88\u606F\u6743\u9650\u4E8C\u7EF4\u7801\uFF0C\u8BF7\u7A0D\u5019\u3002": "Requesting a group-message permission QR code for the existing Feishu app\u2026",
  "\u7FA4\u6D88\u606F\u6743\u9650\u6CA1\u6709\u5F00\u901A\u5B8C\u6210": "Group-message permission was not granted",
  "\u626B\u7801\u4F1A\u66F4\u65B0\u73B0\u6709\u98DE\u4E66\u5E94\u7528\uFF0C\u589E\u91CF\u8865\u5145\u5F53\u524D\u7F3A\u5C11\u7684\u5361\u7247\u6309\u94AE\u56DE\u8C03\u3001\u63A5\u6536\u672A @ \u7FA4\u6D88\u606F\u6240\u9700\u7684 im:message.group_msg\u3001\u8BFB\u53D6\u7528\u6237\u6D88\u606F\u5185\u56FE\u7247\u6216\u6587\u4EF6\u6240\u9700\u7684 im:message:readonly\uFF08\u98DE\u4E66\u663E\u793A\u4E3A\u201C\u83B7\u53D6\u5355\u804A\u3001\u7FA4\u7EC4\u6D88\u606F\u201D\uFF09\u3001\u4E0A\u4F20\u673A\u5668\u4EBA\u56FE\u7247\u6216\u6587\u4EF6\u6240\u9700\u7684 im:resource\u3001\u63A5\u6536\u7FA4\u5185\u5176\u4ED6\u673A\u5668\u4EBA @ \u5F53\u524D\u673A\u5668\u4EBA\u6240\u9700\u7684 im:message.group_at_msg.include_bot:readonly\uFF0C\u4EE5\u53CA\u539F\u751F\u547D\u4EE4\u9762\u677F\u6240\u9700\u7684 application:app_slash_command:read / write\uFF1B\u4E0D\u4F1A\u521B\u5EFA\u65B0\u5E94\u7528\uFF0C\u7FA4\u56DE\u590D\u65B9\u5F0F\u4FDD\u6301\u4E0D\u53D8\uFF0C\u5B9E\u9645\u6536\u5230\u7684\u7FA4\u6D88\u606F\u548C\u6587\u4EF6\u4F1A\u81EA\u52A8\u4FDD\u5B58\u3002\u786E\u8BA4\u9875\u53EA\u663E\u793A\u5F53\u524D\u7F3A\u5C11\u9879\uFF0C\u5B8C\u6210\u540E\u6B64\u673A\u5668\u4EBA\u4F1A\u77ED\u6682\u91CD\u8FDE\uFF0C\u5176\u4ED6\u673A\u5668\u4EBA\u4E0D\u53D7\u5F71\u54CD\u3002": "Scanning updates the existing Feishu app with the missing card-button callback, im:message.group_msg for group messages without mentions, im:message:readonly for reading images or files in user messages (shown by Feishu as \u201CRead direct and group messages\u201D), im:resource for uploading images or files sent by the bot, im:message.group_at_msg.include_bot:readonly for receiving group messages from other bots that mention this bot, and application:app_slash_command:read / write for the native command panel. It does not create a new app or change the group reply mode. Received group messages and files are saved automatically. The confirmation page shows only missing items; this bot reconnects briefly afterward, while other bots are unaffected.",
  "\u6838\u5BF9\u73B0\u6709\u5E94\u7528\u540D\u79F0\uFF0C\u5E76\u786E\u8BA4\u53EA\u65B0\u589E\u5F53\u524D\u7F3A\u5C11\u7684\u4E0A\u8FF0\u914D\u7F6E": "Review the existing app name and confirm that only the missing items described above are added",
  "\u4FDD\u6301\u672C\u9875\u6253\u5F00\uFF0C\u7B49\u5F85\u6743\u9650\u4E0E\u56DE\u8C03\u8865\u5168\u5B8C\u6210": "Keep this page open until permissions and the callback are complete",
  "\u53D6\u6D88\u8865\u5168": "Cancel setup",
  "\u5DF2\u786E\u8BA4\uFF0C\u6B63\u5728\u5B8C\u6210\u6743\u9650\u4E0E\u56DE\u8C03\u914D\u7F6E": "Confirmed. Completing permissions and callback setup",
  "\u6B63\u5728\u51C6\u5907\u6743\u9650\u8865\u5168\u4E8C\u7EF4\u7801": "Preparing the permission-completion QR code",
  "\u914D\u7F6E\u5DF2\u63D0\u4EA4\uFF0C\u6B63\u5728\u4FDD\u5B58\u6743\u9650\u3001\u9A8C\u8BC1\u5361\u7247\u56DE\u8C03\u5E76\u91CD\u8FDE\u6B64\u673A\u5668\u4EBA\uFF1B\u6B64\u9636\u6BB5\u65E0\u6CD5\u53D6\u6D88\uFF0C\u5176\u4ED6\u673A\u5668\u4EBA\u4E0D\u4F1A\u4E2D\u65AD\u3002": "The update was submitted. Saving permissions, verifying the card callback, and reconnecting this bot. This stage cannot be cancelled; other bots will not be interrupted.",
  "\u6B63\u5728\u4E3A\u73B0\u6709\u98DE\u4E66\u5E94\u7528\u7533\u8BF7\u4E00\u6B21\u6027\u66F4\u65B0\u4E8C\u7EF4\u7801\uFF0C\u8BF7\u7A0D\u5019\u3002": "Requesting a one-time update QR code for the existing Feishu app\u2026",
  "\u6743\u9650\u4E0E\u56DE\u8C03\u6CA1\u6709\u8865\u5168\u5B8C\u6210": "Permissions and callback setup did not finish",
  "\u8865\u5168\u6743\u9650": "Complete permissions",
  "\u8865\u5168\u8303\u56F4": "Completion scope",
  "\u589E\u91CF\u6DFB\u52A0\u5F53\u524D\u7F3A\u5C11\u7684\u5361\u7247\u56DE\u8C03 card.action.trigger\u3001\u63A5\u6536\u672A @ \u7FA4\u6D88\u606F\u6240\u9700\u7684 im:message.group_msg\u3001\u8BFB\u53D6\u6D88\u606F\u5185\u56FE\u7247\u6216\u6587\u4EF6\u6240\u9700\u7684 im:message:readonly\uFF08\u98DE\u4E66\u663E\u793A\u4E3A\u201C\u83B7\u53D6\u5355\u804A\u3001\u7FA4\u7EC4\u6D88\u606F\u201D\uFF09\u3001\u4E0A\u4F20\u673A\u5668\u4EBA\u56FE\u7247\u6216\u6587\u4EF6\u6240\u9700\u7684 im:resource\uFF0C\u4EE5\u53CA\u539F\u751F\u547D\u4EE4\u9762\u677F\u6240\u9700\u7684 application:app_slash_command:read / write\uFF1B\u786E\u8BA4\u9875\u53EA\u663E\u793A\u5F53\u524D\u7F3A\u5C11\u9879\uFF0C\u4E0D\u4F1A\u521B\u5EFA\u65B0\u5E94\u7528\uFF0C\u7FA4\u56DE\u590D\u65B9\u5F0F\u4FDD\u6301\u4E0D\u53D8\uFF0C\u5B9E\u9645\u6536\u5230\u7684\u7FA4\u6D88\u606F\u548C\u6587\u4EF6\u4F1A\u81EA\u52A8\u4FDD\u5B58\u3002": "Adds the missing card callback card.action.trigger, im:message.group_msg for group messages without mentions, im:message:readonly for reading images or files in messages (shown by Feishu as \u201CRead direct and group messages\u201D), im:resource for uploading images or files sent by the bot, and application:app_slash_command:read / write for the native command panel. The confirmation page shows only missing items; no new app is created, and the group reply mode stays unchanged. Received group messages and files are saved automatically.",
  "\u7B49\u5F85\u626B\u7801\u2026": "Waiting for scan\u2026",
  "\u98DE\u4E66\u670D\u52A1\u8FD4\u56DE\u4E86\u4E0D\u5339\u914D\u7684\u6743\u9650\u8865\u5168\u4E8C\u7EF4\u7801": "Feishu returned a permission-completion QR code for a different bot",
  "\u98DE\u4E66\u670D\u52A1\u8FD4\u56DE\u4E86\u4E0D\u5339\u914D\u7684\u7FA4\u6D88\u606F\u6743\u9650\u4E8C\u7EF4\u7801": "Feishu returned a group-message permission QR code for a different bot",
  "\u98DE\u4E66\u670D\u52A1\u8FD4\u56DE\u7684\u4FEE\u590D\u4FE1\u606F\u7F3A\u5C11 botId": "Feishu repair status is missing the bot ID",
  "\u98DE\u4E66\u670D\u52A1\u8FD4\u56DE\u7684\u5E94\u7528\u66F4\u65B0\u4FE1\u606F\u7F3A\u5C11 botId": "Feishu app-update status is missing the bot ID",
  "\u98DE\u4E66\u670D\u52A1\u8FD4\u56DE\u4E86\u4E0D\u5339\u914D\u7684\u6CE8\u518C\u8FDB\u5EA6": "Feishu returned registration progress for a different operation",
  "\u6B64\u673A\u5668\u4EBA": "this bot",
  "\u7528\u4E8E\u4E3A${botName}\u5F00\u901A\u7FA4\u6D88\u606F\u6743\u9650\u7684\u4E00\u6B21\u6027\u6388\u6743\u4E8C\u7EF4\u7801": "One-time QR code for granting group-message permission to ${botName}",
  "\u6B63\u5728\u4E3A\u300C${botName}\u300D\u5F00\u901A\u7FA4\u6D88\u606F\u6743\u9650": "Granting group-message permission to \u201C${botName}\u201D",
  '${botName ?? "\u673A\u5668\u4EBA"}\u7684\u6743\u9650\u8865\u5168\u4E8C\u7EF4\u7801\u5DF2\u751F\u6210\uFF0C\u8BF7\u4F7F\u7528\u98DE\u4E66\u626B\u7801\u3002': 'Permission-completion QR code generated for ${botName ?? "bot"}. Scan it with Feishu.',
  '${botName ?? "\u673A\u5668\u4EBA"}\u7684\u7FA4\u6D88\u606F\u6743\u9650\u4E8C\u7EF4\u7801\u5DF2\u751F\u6210\uFF0C\u8BF7\u4F7F\u7528\u98DE\u4E66\u786E\u8BA4\u3002': 'Group-message permission QR code generated for ${botName ?? "bot"}. Confirm it with Feishu.',
  "${targetBotName}\u5DF2\u5F00\u901A\u7FA4\u6D88\u606F\u6743\u9650\uFF0C\u5E76\u542F\u7528\u201C\u54CD\u5E94\u6240\u6709\u7FA4\u6D88\u606F\u201D\u3002": "${targetBotName} now has group-message permission and \u201CRespond to all group messages\u201D is enabled.",
  "${targetBot.bot.name}\u5DF2\u5F00\u901A\u7FA4\u6D88\u606F\u6743\u9650\uFF0C\u5E76\u542F\u7528\u201C\u54CD\u5E94\u6240\u6709\u7FA4\u6D88\u606F\u201D\u3002": "${targetBot.bot.name} now has group-message permission and \u201CRespond to all group messages\u201D is enabled.",
  "${targetBot.bot.name}\u5DF2\u8FDE\u63A5\uFF0C\u53EF\u4EE5\u5728\u98DE\u4E66\u4E2D\u5F00\u59CB\u804A\u5929\u3002": "${targetBot.bot.name} is connected and ready to chat in Feishu.",
  "\u5DF2\u53D6\u6D88\u8865\u5168\u6743\u9650\u4E0E\u56DE\u8C03\u3002": "Completing permissions and the callback was cancelled.",
  "\u5DF2\u53D6\u6D88\u7FA4\u6D88\u606F\u6743\u9650\u6388\u6743\u3002": "Group-message permission authorization was cancelled.",
  "\u6743\u9650\u4E0E\u56DE\u8C03\u5DF2\u66F4\u65B0\uFF0C\u4F46\u6682\u65F6\u65E0\u6CD5\u786E\u8BA4\u673A\u5668\u4EBA\u8FDE\u63A5\u72B6\u6001": "Permissions and the callback were updated, but the bot connection could not be confirmed yet",
  "\u7FA4\u6D88\u606F\u6743\u9650\u5DF2\u66F4\u65B0\uFF0C\u4F46\u6682\u65F6\u65E0\u6CD5\u786E\u8BA4\u673A\u5668\u4EBA\u8FDE\u63A5\u72B6\u6001": "The group-message permission was updated, but the bot connection could not be confirmed yet",
  "\u98DE\u4E66\u6743\u9650\u4E0E\u56DE\u8C03\u8865\u5168\u5931\u8D25": "Could not complete Feishu permissions and callback setup",
  "\u98DE\u4E66\u7FA4\u6D88\u606F\u6743\u9650\u5F00\u901A\u5931\u8D25": "Could not grant the Feishu group-message permission",
  "\u8BF7\u5148\u5B8C\u6210\u5F53\u524D\u98DE\u4E66\u6388\u6743\u64CD\u4F5C\uFF0C\u518D\u5F00\u901A\u7FA4\u6D88\u606F\u6743\u9650\u3002": "Finish the current Feishu authorization before granting group-message permission.",
  "\u5DF2\u786E\u8BA4\uFF0C\u6B63\u5728\u8FDE\u63A5\u65B0\u673A\u5668\u4EBA": "Confirmed. Connecting the new bot",
  "\u6B63\u5728\u5B89\u5168\u4FDD\u5B58\u51ED\u636E\u5E76\u68C0\u67E5\u65B0\u673A\u5668\u4EBA\u7684\u6D88\u606F\u901A\u9053\uFF0C\u5176\u4ED6\u673A\u5668\u4EBA\u4E0D\u4F1A\u4E2D\u65AD\u3002": "Saving credentials and checking the new bot connection. Existing bots will not be interrupted.",
  "\u6B63\u5728\u5411\u98DE\u4E66\u7533\u8BF7\u4E00\u6B21\u6027\u6388\u6743\u4E8C\u7EF4\u7801\uFF0C\u8BF7\u7A0D\u5019\u3002": "Requesting a one-time authorization QR code from Feishu\u2026",
  "\u65B0\u673A\u5668\u4EBA\u6CA1\u6709\u6DFB\u52A0\u5B8C\u6210": "The new bot was not added",
  "\u65B0\u98DE\u4E66\u673A\u5668\u4EBA\u5DF2\u8FDE\u63A5\uFF0C\u53EF\u4EE5\u5F00\u59CB\u804A\u5929\u3002": "The new Feishu bot is connected and ready to chat.",
  "\u98DE\u4E66\u5E94\u7528\u521B\u5EFA\u5931\u8D25": "Could not create the Feishu app",
  "\u673A\u5668\u4EBA\u5DF2\u7ECF\u521B\u5EFA\uFF0C\u4F46\u6682\u65F6\u65E0\u6CD5\u786E\u8BA4\u8FDE\u63A5\u72B6\u6001": "The bot was created, but its connection could not be confirmed yet",
  "\u673A\u5668\u4EBA\u4ECD\u672A\u8FDE\u63A5": "The bot is still offline",
  "\u673A\u5668\u4EBA\u5C1A\u672A\u8FDE\u63A5": "The bot is not connected yet",
  "\u957F\u8FDE\u63A5\u8FD0\u884C\u6B63\u5E38": "Persistent connection is healthy",
  "\u957F\u8FDE\u63A5": "Persistent connection",
  "\u5E94\u7528\u6807\u8BC6\u5DF2\u5B89\u5168\u4FDD\u5B58": "App identifier stored securely",
  "\u673A\u5668\u4EBA\u6807\u8BC6\u5DF2\u5B89\u5168\u4FDD\u5B58": "Bot identifier stored securely",
  "\u5DF2\u5B89\u5168\u4FDD\u5B58": "Stored securely",
  "\u5DF2\u63A5\u5165\u7684\u5FAE\u4FE1\u8D26\u53F7": "Connected WeChat accounts",
  "\u5DF2\u63A5\u5165\u7684\u673A\u5668\u4EBA": "Connected bots",
  "\u5DF2\u63A5\u5165\u7684\u9489\u9489\u673A\u5668\u4EBA": "Connected DingTalk bots",
  "\u5DF2\u7ED1\u5B9A\u7684\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA": "Connected WeCom bots",
  "\u5DF2\u7ED1\u5B9A\u7684 QQ \u673A\u5668\u4EBA": "Connected QQ bots",
  "\u5DF2\u63A5\u5165\u7684 WhatsApp \u673A\u5668\u4EBA": "Connected WhatsApp accounts",
  "\u4F7F\u7528\u624B\u673A\u5FAE\u4FE1\u626B\u63CF\u4E8C\u7EF4\u7801": "Scan with WeChat on your phone",
  "\u626B\u4E00\u6B21\u7801\uFF0C\u5C31\u80FD\u5728\u5FAE\u4FE1\u91CC\u4F7F\u7528 Harness": "Scan once to use Harness in WeChat",
  "\u6253\u5F00\u624B\u673A\u5FAE\u4FE1\u5E76\u626B\u63CF\u5DE6\u4FA7\u4E8C\u7EF4\u7801": "Open WeChat on your phone and scan the QR code",
  "\u5728\u5FAE\u4FE1\u4E2D\u786E\u8BA4\u8FDE\u63A5\u8BE5\u673A\u5668\u4EBA": "Confirm the bot connection in WeChat",
  "\u4FDD\u6301\u672C\u9875\u6253\u5F00\uFF0C\u7B49\u5F85\u673A\u5668\u4EBA\u81EA\u52A8\u8FDE\u63A5": "Keep this page open while the bot connects",
  "\u7B49\u5F85\u5FAE\u4FE1\u626B\u7801": "Waiting for WeChat scan",
  "\u9700\u8981\u914D\u5BF9\u7801": "Pairing code required",
  "\u8F93\u5165\u624B\u673A\u5FAE\u4FE1\u663E\u793A\u7684\u6570\u5B57": "Enter the number shown in WeChat",
  "\u5FAE\u4FE1\u914D\u5BF9\u7801": "WeChat pairing code",
  "\u5DF2\u626B\u7801\uFF0C\u8BF7\u5728\u624B\u673A\u4E0A\u786E\u8BA4": "Scanned. Confirm on your phone",
  "\u914D\u5BF9\u7801\u5DF2\u63D0\u4EA4\uFF0C\u6B63\u5728\u7B49\u5F85\u5FAE\u4FE1\u786E\u8BA4\u3002": "Pairing code submitted. Waiting for WeChat confirmation.",
  "\u8FD9\u662F\u5FAE\u4FE1\u9644\u52A0\u7684\u5B89\u5168\u786E\u8BA4\u6B65\u9AA4\u3002\u914D\u5BF9\u7801\u53EA\u7528\u4E8E\u672C\u6B21\u626B\u7801\u8F6E\u8BE2\uFF0C\u4E0D\u4F1A\u5199\u5165\u914D\u7F6E\u6216\u65E5\u5FD7\u3002": "This is an additional WeChat confirmation step. The pairing code is used only for this connection and is never stored.",
  "\u6B63\u5728\u4FDD\u5B58\u51ED\u636E\u5E76\u9A8C\u8BC1 Harness \u4E0E\u5FAE\u4FE1\u957F\u8F6E\u8BE2\u3002": "Saving credentials and verifying the WeChat connection.",
  "\u5FAE\u4FE1\u5DF2\u786E\u8BA4\uFF0C\u6B63\u5728\u542F\u52A8\u6D88\u606F\u8FDE\u63A5": "Confirmed in WeChat. Starting the message connection",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46\u65E0\u6CD5\u8BFB\u53D6\u73B0\u6709\u767B\u5F55\u51ED\u636E\u3002\u8BF7\u68C0\u67E5 DSH \u51ED\u636E\u5B58\u50A8\u3002": "WeChat was authorized, but the existing login credential could not be read. Check the DSH credential store.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46\u767B\u5F55\u51ED\u636E\u65E0\u6CD5\u5199\u5165 DSH \u51ED\u636E\u5B58\u50A8\u3002\u8BF7\u68C0\u67E5\u51ED\u636E\u5B58\u50A8\u662F\u5426\u53EF\u5199\u3002": "WeChat was authorized, but the login credential could not be written to the DSH credential store. Check that the store is writable.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46\u8D26\u53F7\u914D\u7F6E\u65E0\u6CD5\u5199\u5165\u672C\u673A\u3002\u8BF7\u68C0\u67E5 DSH_HOME \u76EE\u5F55\u6743\u9650\u3002": "WeChat was authorized, but the account configuration could not be saved locally. Check the DSH_HOME directory permissions.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46\u65E0\u6CD5\u521D\u59CB\u5316\u8D26\u53F7\u72B6\u6001\u6216\u5DE5\u4F5C\u533A\u3002\u8BF7\u68C0\u67E5 DSH_HOME \u548C\u5DE5\u4F5C\u533A\u76EE\u5F55\u3002": "WeChat was authorized, but the account state or workspace could not be initialized. Check DSH_HOME and the workspace directory.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46\u63D2\u4EF6\u65E0\u6CD5\u8FDE\u63A5\u672C\u673A Harness\u3002\u8BF7\u68C0\u67E5 dsh web \u5730\u5740\u548C\u7AEF\u53E3\u3002": "WeChat was authorized, but the plugin could not connect to the local Harness. Check the dsh web address and port.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46 Harness \u5065\u5EB7\u68C0\u67E5\u8D85\u65F6\u3002\u8BF7\u786E\u8BA4 dsh web \u672A\u963B\u585E\u3002": "WeChat was authorized, but the Harness health check timed out. Confirm that dsh web is not blocked.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46 Harness \u62D2\u7EDD\u4E86\u672C\u673A\u5065\u5EB7\u68C0\u67E5\u3002\u8BF7\u68C0\u67E5 Host \u4FE1\u4EFB\u914D\u7F6E\u3002": "WeChat was authorized, but Harness denied the local health check. Check the Host trust configuration.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46\u627E\u4E0D\u5230 Harness \u5065\u5EB7\u68C0\u67E5\u63A5\u53E3\u3002\u8BF7\u786E\u8BA4 Harness \u4E0E\u63D2\u4EF6\u7248\u672C\u517C\u5BB9\u3002": "WeChat was authorized, but the Harness health endpoint was not found. Confirm that Harness and the plugin are compatible.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46 Harness \u5065\u5EB7\u68C0\u67E5\u8FD4\u56DE\u670D\u52A1\u9519\u8BEF\u3002\u8BF7\u67E5\u770B dsh web \u65E5\u5FD7\u3002": "WeChat was authorized, but the Harness health check returned a service error. Check the dsh web logs.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46 Harness \u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94\u3002\u8BF7\u786E\u8BA4 Harness \u4E0E\u63D2\u4EF6\u7248\u672C\u517C\u5BB9\u3002": "WeChat was authorized, but Harness returned an unrecognized response. Confirm that Harness and the plugin are compatible.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46 Harness \u62D2\u7EDD\u4E86\u5065\u5EB7\u68C0\u67E5\u8BF7\u6C42\u3002\u8BF7\u67E5\u770B dsh web \u65E5\u5FD7\u3002": "WeChat was authorized, but Harness rejected the health-check request. Check the dsh web logs.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46 Harness \u5065\u5EB7\u68C0\u67E5\u53D1\u751F\u672A\u77E5\u9519\u8BEF\u3002\u8BF7\u67E5\u770B dsh web \u65E5\u5FD7\u3002": "WeChat was authorized, but the Harness health check failed unexpectedly. Check the dsh web logs.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46\u6D88\u606F\u8FDE\u63A5\u521D\u59CB\u5316\u5931\u8D25\u3002\u8BF7\u67E5\u770B dsh web \u65E5\u5FD7\u540E\u91CD\u8BD5\u3002": "WeChat was authorized, but the message connection could not be initialized. Check the dsh web logs and try again.",
  "\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u4F46\u6FC0\u6D3B\u8FC7\u7A0B\u4E2D\u53D1\u751F\u672A\u77E5\u9519\u8BEF\u3002\u8BF7\u67E5\u770B dsh web \u65E5\u5FD7\u3002": "WeChat was authorized, but an unknown error occurred during activation. Check the dsh web logs.",
  "\u5FAE\u4FE1\u5DF2\u7ED1\u5B9A\uFF0C\u53EF\u4EE5\u5F00\u59CB\u5411\u5DF2\u7ED1\u5B9A\u7684\u673A\u5668\u4EBA\u53D1\u6D88\u606F\u3002": "WeChat is connected and ready for messages.",
  "\u8FD9\u4E2A\u5FAE\u4FE1\u8D26\u53F7\u5DF2\u7ECF\u7ED1\u5B9A\u5E76\u4FDD\u6301\u5728\u7EBF\u3002": "This WeChat account is connected and online.",
  "\u5FAE\u4FE1\u8D26\u53F7\u53CA\u672C\u673A\u51ED\u636E\u5DF2\u79FB\u9664\u3002": "The WeChat account and local credentials were removed.",
  "\u5DF2\u53D6\u6D88\u5FAE\u4FE1\u7ED1\u5B9A\u3002": "WeChat setup was cancelled.",
  "\u6B63\u5728\u8054\u7CFB\u817E\u8BAF\u5FAE\u4FE1 iLink \u670D\u52A1\u3002": "Contacting the WeChat iLink service.",
  "iLink \u957F\u8F6E\u8BE2": "iLink long polling",
  "\u626B\u4E00\u6B21\u7801\uFF0C\u81EA\u52A8\u521B\u5EFA\u5E76\u8FDE\u63A5\u673A\u5668\u4EBA": "Scan once to create and connect a bot",
  "\u4F7F\u7528\u9489\u9489 App \u5B8C\u6210\u673A\u5668\u4EBA\u6388\u6743": "Authorize the bot with the DingTalk app",
  "\u4F7F\u7528\u5DF2\u52A0\u5165\u4F01\u4E1A/\u7EC4\u7EC7\u7684\u9489\u9489\u8D26\u53F7\u626B\u63CF\u5DE6\u4FA7\u4E8C\u7EF4\u7801": "Scan the QR code with a DingTalk account that belongs to an organization",
  "\u5728\u6388\u6743\u9875\u70B9\u51FB\u201C\u4E00\u952E\u521B\u5EFA\u65B0\u673A\u5668\u4EBA\u201D": "Select \u201CCreate new bot\u201D on the authorization page",
  "\u8BF7\u52FF\u5173\u95ED\u672C\u9875\uFF0C\u9489\u9489\u5B8C\u6210\u6388\u6743\u540E\u5C06\u81EA\u52A8\u7EE7\u7EED\u3002": "Keep this page open. Setup will continue after DingTalk authorization.",
  "\u7B49\u5F85\u9489\u9489\u626B\u7801\u6388\u6743": "Waiting for DingTalk authorization",
  "\u6388\u6743\u5DF2\u786E\u8BA4\uFF0C\u6B63\u5728\u521B\u5EFA\u9489\u9489\u673A\u5668\u4EBA": "Authorized. Creating the DingTalk bot",
  "\u6B63\u5728\u786E\u8BA4\u9489\u9489\u6388\u6743": "Confirming DingTalk authorization",
  "\u6B63\u5728\u68C0\u67E5\u9489\u9489 Stream \u957F\u8FDE\u63A5\uFF0C\u6210\u529F\u540E\u4F1A\u81EA\u52A8\u663E\u793A\u4E3A\u5728\u7EBF\u3002": "Checking the DingTalk Stream connection. It will appear online when ready.",
  "\u9489\u9489\u673A\u5668\u4EBA\u5DF2\u63A5\u5165\uFF0C\u53EF\u4EE5\u5F00\u59CB\u53D1\u9001\u6D88\u606F\u3002": "The DingTalk bot is connected and ready for messages.",
  "\u8FD9\u4E2A\u9489\u9489\u673A\u5668\u4EBA\u5DF2\u7ECF\u63A5\u5165\u5E76\u4FDD\u6301\u5728\u7EBF\u3002": "This DingTalk bot is connected and online.",
  "Stream \u957F\u8FDE\u63A5": "Stream persistent connection",
  "\u4F7F\u7528\u4F01\u4E1A\u5FAE\u4FE1 App \u626B\u7801\u521B\u5EFA\u667A\u80FD\u673A\u5668\u4EBA": "Scan with WeCom to create an AI bot",
  "\u4F7F\u7528\u4F01\u4E1A\u5FAE\u4FE1 App \u5B8C\u6210\u667A\u80FD\u673A\u5668\u4EBA\u6388\u6743": "Authorize the AI bot with WeCom",
  "\u6253\u5F00\u4F01\u4E1A\u5FAE\u4FE1 App\uFF0C\u626B\u63CF\u5DE6\u4FA7\u4E8C\u7EF4\u7801": "Open WeCom and scan the QR code",
  "\u5728\u817E\u8BAF\u6388\u6743\u9875\u9762\u786E\u8BA4\u521B\u5EFA\u667A\u80FD\u673A\u5668\u4EBA": "Confirm bot creation on the Tencent authorization page",
  "\u8FD4\u56DE\u8FD9\u91CC\u7B49\u5F85\u8FDE\u63A5\u5B8C\u6210": "Return here and wait for the connection to complete",
  "\u7B49\u5F85\u4F01\u4E1A\u5FAE\u4FE1 App \u626B\u7801": "Waiting for WeCom scan",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5DF2\u6388\u6743\uFF0C\u6B63\u5728\u8FDE\u63A5\u673A\u5668\u4EBA": "Authorized in WeCom. Connecting the bot",
  "\u51ED\u636E\u6B63\u5728\u5199\u5165\u672C\u673A\uFF0C\u5E76\u542F\u52A8\u4F01\u4E1A\u5FAE\u4FE1 WebSocket \u6D88\u606F\u8FDE\u63A5\u3002": "Saving credentials locally and starting the WeCom WebSocket connection.",
  "WebSocket \u957F\u8FDE\u63A5": "WebSocket persistent connection",
  "\u4F7F\u7528\u624B\u673A QQ \u626B\u7801\u521B\u5EFA\u5E76\u7ED1\u5B9A\u673A\u5668\u4EBA": "Scan with mobile QQ to create and connect a bot",
  "\u4F7F\u7528\u624B\u673A QQ \u5B8C\u6210\u673A\u5668\u4EBA\u7ED1\u5B9A": "Complete bot setup with mobile QQ",
  "\u6253\u5F00\u624B\u673A QQ\uFF0C\u626B\u63CF\u5DE6\u4FA7\u4E8C\u7EF4\u7801": "Open mobile QQ and scan the QR code",
  "\u5728\u817E\u8BAF\u6388\u6743\u9875\u9762\u786E\u8BA4\u521B\u5EFA\u6216\u7ED1\u5B9A\u673A\u5668\u4EBA": "Confirm bot creation or connection on the Tencent authorization page",
  "\u7B49\u5F85\u624B\u673A QQ \u626B\u7801": "Waiting for mobile QQ scan",
  "QQ \u5DF2\u6388\u6743\uFF0C\u6B63\u5728\u8FDE\u63A5\u673A\u5668\u4EBA": "Authorized in QQ. Connecting the bot",
  "\u51ED\u636E\u6B63\u5728\u5199\u5165\u672C\u673A\uFF0C\u5E76\u542F\u52A8 QQ WebSocket \u6D88\u606F\u8FDE\u63A5\u3002": "Saving credentials locally and starting the QQ WebSocket connection.",
  "\u4F7F\u7528\u624B\u673A WhatsApp \u626B\u63CF\u4E8C\u7EF4\u7801\u5373\u53EF\u63A5\u5165\u3002": "Scan the QR code with WhatsApp to connect.",
  "\u7528\u624B\u673A WhatsApp \u626B\u63CF\u4E8C\u7EF4\u7801": "Scan with WhatsApp on your phone",
  "\u6253\u5F00 WhatsApp \u2192 \u8BBE\u7F6E \u2192 \u5DF2\u5173\u8054\u8BBE\u5907": "Open WhatsApp \u2192 Settings \u2192 Linked devices",
  "\u70B9\u51FB\u201C\u5173\u8054\u8BBE\u5907\u201D\u5E76\u626B\u63CF\u5DE6\u4FA7\u4E8C\u7EF4\u7801": "Select \u201CLink a device\u201D and scan the QR code",
  "\u7B49\u5F85 WhatsApp \u626B\u7801": "Waiting for WhatsApp scan",
  "\u5DF2\u626B\u7801\uFF0C\u6B63\u5728\u8FDE\u63A5 WhatsApp": "Scanned. Connecting WhatsApp",
  "\u6B63\u5728\u5EFA\u7ACB\u5B89\u5168\u7684\u5173\u8054\u8BBE\u5907\u4F1A\u8BDD\u3002": "Creating a secure linked-device session.",
  "\u5173\u8054\u8BBE\u5907\u6B63\u5728\u63A5\u5165 DeepSeek Harness\u3002": "Linking the device to DeepSeek Harness.",
  "WhatsApp Web \u5173\u8054\u8BBE\u5907\u8FD0\u884C\u6B63\u5E38": "WhatsApp linked device is healthy",
  "\u67E5\u770B WhatsApp \u8BBF\u95EE\u6A21\u5F0F\u8BF4\u660E": "View WhatsApp access mode details",
  "WhatsApp \u8BBF\u95EE\u6A21\u5F0F": "WhatsApp access mode",
  "\u4EC5\u81EA\u5DF1\u6A21\u5F0F": "Only me",
  "\u6307\u5B9A\u8054\u7CFB\u4EBA\u6A21\u5F0F": "Selected contacts",
  "\u5F00\u653E\u54CD\u5E94\u6A21\u5F0F": "Open responses",
  "\u4EC5\u81EA\u5DF1\u6A21\u5F0F\uFF08\u9ED8\u8BA4\uFF09": "Only me (default)",
  "\u5DF2\u751F\u6548\uFF1A": "Active: ",
  "\u53EA\u54CD\u5E94\u5DF2\u7ED1\u5B9A WhatsApp \u8D26\u53F7\u7684\u81EA\u804A\u6D88\u606F\u3002": "Only respond to self-chat messages from the linked WhatsApp account.",
  "\u54CD\u5E94\u81EA\u804A\u548C\u767D\u540D\u5355\u8054\u7CFB\u4EBA\u7684\u79C1\u804A\uFF0C\u5FFD\u7565\u7FA4\u804A\u3002": "Respond to self-chat and allowlisted direct messages; ignore group messages.",
  "\u54CD\u5E94\u6240\u6709\u79C1\u804A\u3001\u5DF2\u7ED1\u5B9A\u8D26\u53F7\u81EA\u5DF1\u53D1\u51FA\u7684\u7FA4\u804A\u6D88\u606F\uFF0C\u4EE5\u53CA\u5176\u4ED6\u7FA4\u6210\u5458\u7684\u63D0\u53CA\u6216\u56DE\u590D\u3002": "Respond to all direct messages, group messages sent by the linked account, and mentions or replies from other group members.",
  "\u5141\u8BB8\u79C1\u804A\u7684 WhatsApp \u7535\u8BDD\u53F7\u7801": "WhatsApp phone numbers allowed to send direct messages",
  "\u6BCF\u884C\u4E00\u4E2A\u542B\u56FD\u5BB6\u6216\u5730\u533A\u4EE3\u7801\u7684\u53F7\u7801": "One number with country or region code per line",
  "\u53EF\u4EE5\u5305\u542B\u5F00\u5934\u7684 +\uFF0C\u4FDD\u5B58\u65F6\u4F1A\u81EA\u52A8\u79FB\u9664\u3002": "A leading + is allowed and removed when saved.",
  "\u4EC5\u6307\u5B9A\u8054\u7CFB\u4EBA\u6A21\u5F0F\u4F7F\u7528\u767D\u540D\u5355\uFF0C\u5207\u6362\u6A21\u5F0F\u65F6\u4F1A\u4FDD\u7559\u3002": "Only Selected contacts uses the allowlist; it is retained when modes change.",
  "\u767D\u540D\u5355\u4E3A\u7A7A\uFF1B\u4FDD\u5B58\u540E\u5C06\u53EA\u63A5\u53D7\u81EA\u804A\u6D88\u606F\u3002": "The allowlist is empty; only self-chat messages will be accepted after saving.",
  "\u7535\u8BDD\u53F7\u7801\u5FC5\u987B\u5305\u542B\u56FD\u5BB6\u6216\u5730\u533A\u4EE3\u7801\uFF0C\u6BCF\u884C\u4E00\u4E2A\u3002": "Each phone number must include a country or region code on its own line.",
  "WhatsApp \u8BBF\u95EE\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002": "WhatsApp access settings are currently unavailable.",
  "WhatsApp \u8BBF\u95EE\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\u3002": "Could not save WhatsApp access settings.",
  "Bot API \u957F\u8F6E\u8BE2": "Bot API long polling",
  " Gateway \u957F\u8FDE\u63A5": " Gateway persistent connection",
  "Gateway \u957F\u8FDE\u63A5": "Gateway persistent connection",
  " Socket Mode \u957F\u8FDE\u63A5": " Socket Mode persistent connection",
  "Socket Mode \u957F\u8FDE\u63A5": "Socket Mode persistent connection",
  " CS API \u957F\u8F6E\u8BE2": " CS API long polling",
  "CS API \u957F\u8F6E\u8BE2": "CS API long polling",
  "\u63A5\u5165 Matrix \u673A\u5668\u4EBA": "Connect a Matrix bot",
  "\u8FDE\u63A5\u4F60\u7684 Matrix homeserver": "Connect your Matrix homeserver",
  "\u586B\u5199 homeserver \u5730\u5740\uFF0C\u5E76\u63D0\u4F9B\u8BBF\u95EE\u4EE4\u724C\uFF0C\u6216\u8005\u7528\u6237 ID \u4E0E\u5BC6\u7801\u7684\u7EC4\u5408\u3002\u673A\u5668\u4EBA\u53EA\u8BBF\u95EE\u8BE5 homeserver\uFF0C\u4E0D\u8FDE\u63A5\u7B2C\u4E09\u65B9\u670D\u52A1\u5668\u3002": "Enter the homeserver URL plus an access token, or a user id with a password. The bot only talks to that homeserver and never to third-party servers.",
  "Homeserver \u5730\u5740": "Homeserver URL",
  "\u8BBF\u95EE\u4EE4\u724C\uFF08\u4E0E\u7528\u6237 ID\u3001\u5BC6\u7801\u4E8C\u9009\u4E00\uFF09": "Access token (or user id + password)",
  "\u7528\u6237 ID\uFF08\u53EF\u9009\uFF09": "User id (optional)",
  "\u5BC6\u7801\uFF08\u53EF\u9009\uFF09": "Password (optional)",
  "\u8BBF\u95EE\u4EE4\u724C\u6765\u81EA Element \u8BBE\u7F6E \u2192 \u5E2E\u52A9 \u2192 \u7F16\u8F91\u8BBE\u7F6E\uFF0C\u6216 homeserver \u7684\u767B\u5F55\u63A5\u53E3\uFF1B\u7528\u6237 ID \u4E0E\u5BC6\u7801\u65B9\u5F0F\u4F1A\u4E3A\u672C\u5B89\u88C5\u6D3E\u751F\u7A33\u5B9A\u8BBE\u5907\u4F1A\u8BDD\u3002": "The access token comes from Element settings \u2192 Help \u2192 Advanced settings, or from the homeserver login API; the user id and password flow derives a stable device session for this installation.",
  "\u586B\u5199 homeserver \u5730\u5740\u4E0E\u8BBF\u95EE\u4EE4\u724C\uFF0C\u6216\u8005\u7528\u6237 ID \u4E0E\u5BC6\u7801\uFF0C\u5373\u53EF\u8BA9\u673A\u5668\u4EBA\u4EE5 CS API \u957F\u8F6E\u8BE2\u63A5\u6536\u6D88\u606F\u5E76\u4EE5\u5BCC\u6587\u672C\u56DE\u590D\u3002": "Enter the homeserver URL with an access token, or a user id with a password, and the bot receives messages over the CS API long poll and replies with rich text.",
  "\u4F7F\u7528 homeserver \u4E0E\u51ED\u636E\u63A5\u5165 Matrix \u673A\u5668\u4EBA": "Connect a Matrix bot with the homeserver and credentials",
  "\u8BBF\u95EE\u4EE4\u724C\u6216\u7528\u6237 ID \u4E0E\u5BC6\u7801": "access token or user id with password",
  "\u63A5\u5165 Telegram \u673A\u5668\u4EBA": "Connect a Telegram bot",
  "\u5148\u901A\u8FC7 @BotFather \u83B7\u53D6 Bot Token\uFF0C\u518D\u5728\u8FD9\u91CC\u5B8C\u6210\u63A5\u5165\u3002": "Get a Bot Token from @BotFather, then connect it here.",
  "\u586B\u5199 @BotFather \u751F\u6210\u7684 Bot Token": "Enter the Bot Token from @BotFather",
  "\u4F1A\u8BDD\u884C\u4E3A": "Conversation behavior",
  "\u601D\u8003\u8FC7\u7A0B\u7559\u75D5": "Thinking traces",
  "\u5B9E\u65F6\u663E\u793A\u601D\u8003\u6B65\u9AA4\u4E0E\u5DE5\u5177\u8C03\u7528\uFF0C\u6700\u7EC8\u7B54\u6848\u5355\u72EC\u6210\u6761": "Show thinking steps and tool calls as they happen; the final answer arrives as its own message",
  "\u8BF7\u63D0\u4EA4\u6709\u6548\u7684\u601D\u8003\u8FC7\u7A0B\u7559\u75D5\u8BBE\u7F6E\u3002": "Submit a valid thinking-traces setting.",
  "\u6B63\u5728\u4F7F\u7528{name}\u2026": "Using {name}\u2026",
  "\u8BBF\u95EE\u6A21\u5F0F": "Access mode",
  "Telegram \u8BBF\u95EE\u6A21\u5F0F": "Telegram access mode",
  "\u67E5\u770B Telegram \u8BBF\u95EE\u6A21\u5F0F\u8BF4\u660E": "View Telegram access mode details",
  "\u7FA4\u804A\u5168\u90E8\u5FFD\u7565\uFF0C\u79C1\u804A\u4EC5\u5141\u8BB8\u767D\u540D\u5355\u7528\u6237\u3002": "All group messages are ignored; only allowlisted users may send DMs.",
  "\u4FDD\u6301\u539F\u6709\u884C\u4E3A\uFF1A\u79C1\u804A\u76F4\u63A5\u54CD\u5E94\uFF0C\u7FA4\u804A\u5728\u88AB\u63D0\u53CA\u6216\u56DE\u590D\u65F6\u54CD\u5E94\u3002": "Keep the original behavior: respond to DMs and to group mentions or replies.",
  "\u5B89\u5168\u6A21\u5F0F": "Safe mode",
  "\u517C\u5BB9\u6A21\u5F0F": "Compatible mode",
  "\u5DF2\u751F\u6548\uFF1A\u5B89\u5168\u6A21\u5F0F": "Active: Safe mode",
  "\u5DF2\u751F\u6548\uFF1A\u517C\u5BB9\u6A21\u5F0F": "Active: Compatible mode",
  "\u6A21\u5F0F": "Mode",
  "\u517C\u5BB9\u6A21\u5F0F\uFF08\u9ED8\u8BA4\uFF09": "Compatible mode (default)",
  "\u5B89\u5168\u6A21\u5F0F\uFF08\u79C1\u804A\u767D\u540D\u5355\uFF09": "Safe mode (private-chat allowlist)",
  "\u5141\u8BB8\u79C1\u804A\u7684 Telegram User ID": "Telegram User IDs allowed to send DMs",
  "\u6BCF\u884C\u4E00\u4E2A\u6570\u5B57 User ID": "One numeric User ID per line",
  "\u767D\u540D\u5355\u4EC5\u5C5E\u4E8E\u5F53\u524D\u673A\u5668\u4EBA\u3002": "This allowlist belongs only to the current bot.",
  "\u517C\u5BB9\u6A21\u5F0F\u4E0B\u6682\u4E0D\u4F7F\u7528\u767D\u540D\u5355\uFF0C\u5207\u6362\u6A21\u5F0F\u65F6\u4F1A\u4FDD\u7559\u3002": "Compatible mode does not enforce the allowlist; it is retained when modes change.",
  "\u767D\u540D\u5355\u4E3A\u7A7A\uFF1B\u4FDD\u5B58\u540E\u8BE5\u673A\u5668\u4EBA\u4F1A\u62D2\u7EDD\u6240\u6709\u5165\u7AD9\u6D88\u606F\u3002": "The allowlist is empty; this bot will reject all inbound messages after saving.",
  "\u6B63\u5728\u4FDD\u5B58\u2026": "Saving\u2026",
  "\u4FDD\u5B58\u8BBF\u95EE\u8BBE\u7F6E": "Save access settings",
  "User ID \u5FC5\u987B\u662F 1\u201316 \u4F4D\u6B63\u6574\u6570\uFF0C\u6BCF\u884C\u4E00\u4E2A\u3002": "Each User ID must be a 1\u201316 digit positive integer on its own line.",
  "Telegram \u8BBF\u95EE\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002": "Telegram access settings are currently unavailable.",
  "Telegram \u8BBF\u95EE\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\u3002": "Could not save Telegram access settings.",
  "\u63A5\u5165 Discord \u673A\u5668\u4EBA": "Connect a Discord bot",
  "\u5148\u5728 Developer Portal \u521B\u5EFA Bot \u5E76\u9080\u8BF7\u5230\u670D\u52A1\u5668\uFF0C\u518D\u5728\u8FD9\u91CC\u5B8C\u6210\u63A5\u5165\u3002": "Create a bot in the Developer Portal and invite it to your server, then connect it here.",
  "\u586B\u5199 Discord Developer Portal \u7684 Bot Token": "Enter the Bot Token from the Discord Developer Portal",
  "\u63A5\u5165 Slack \u673A\u5668\u4EBA": "Connect a Slack bot",
  "\u5148\u7528 Manifest \u521B\u5EFA\u5E76\u914D\u7F6E Slack App": "Create and configure a Slack app with the manifest",
  "\u590D\u5236\u914D\u7F6E\u540E\uFF0C\u5728 Slack \u9009\u62E9 From a manifest\uFF1B\u521B\u5EFA\u5B8C\u6210\u540E\u751F\u6210 connections:write App Token\uFF0C\u5E76\u5C06\u5E94\u7528\u5B89\u88C5\u5230\u5DE5\u4F5C\u533A\u3002": "Copy the manifest and choose \u201CFrom a manifest\u201D in Slack. Then create a connections:write App Token and install the app to your workspace.",
  "\u590D\u5236 Manifest": "Copy manifest",
  "\u5DF2\u590D\u5236 Manifest": "Manifest copied",
  "\u6253\u5F00 Slack \u521B\u5EFA\u9875": "Open Slack app creation",
  "Bot Token \u6765\u81EA OAuth & Permissions\uFF1BApp Token \u6765\u81EA Basic Information\uFF0C\u5E76\u4E14\u5FC5\u987B\u5305\u542B connections:write\u3002": "Get the Bot Token from OAuth & Permissions and the App Token from Basic Information. The App Token must include connections:write.",
  "\u4F7F\u7528\u5B98\u65B9 App Manifest \u5FEB\u901F\u914D\u7F6E\u673A\u5668\u4EBA\uFF0C\u518D\u586B\u5199 Bot Token \u4E0E App Token \u5EFA\u7ACB\u672C\u5730 Socket Mode \u8FDE\u63A5\u3002": "Configure the bot with the official app manifest, then enter the Bot Token and App Token to start a local Socket Mode connection.",
  "Slack \u5DE5\u4F5C\u533A": "Slack workspace",
  "Bot Token \u4E0E App Token": "Bot Token and App Token",
  "\u586B\u5199 Bot Token": "Enter Bot Token",
  "\u5E94\u7528\u5E73\u53F0": "App platform",
  "Lark\uFF08\u56FD\u9645\u7248\uFF09": "Lark (international)",
  "\u624B\u52A8\u63A5\u5165Lark\u673A\u5668\u4EBA": "Connect Lark bot manually",
  "\u586B\u5199 Lark \u5F00\u653E\u5E73\u53F0 App ID": "Enter the Lark Developer App ID",
  "\u586B\u5199 Lark \u5F00\u653E\u5E73\u53F0 App Secret": "Enter the Lark Developer App Secret",
  "Lark \u673A\u5668\u4EBA\u51ED\u636E\u5DF2\u7ED1\u5B9A\u3002": "Lark bot credentials connected.",
  "\u624B\u52A8\u63A5\u5165\u98DE\u4E66\u673A\u5668\u4EBA": "Connect Feishu bot manually",
  "\u624B\u52A8\u63A5\u5165\u9489\u9489\u673A\u5668\u4EBA": "Connect DingTalk bot manually",
  "\u624B\u52A8\u63A5\u5165\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA": "Connect WeCom bot manually",
  "\u624B\u52A8\u63A5\u5165QQ\u673A\u5668\u4EBA": "Connect QQ bot manually",
  "\u586B\u5199\u98DE\u4E66\u5F00\u653E\u5E73\u53F0 App ID": "Enter the Feishu Open Platform App ID",
  "\u586B\u5199\u98DE\u4E66\u5F00\u653E\u5E73\u53F0 App Secret": "Enter the Feishu Open Platform App Secret",
  "\u586B\u5199\u9489\u9489\u5E94\u7528 Client ID": "Enter the DingTalk Client ID",
  "\u586B\u5199\u9489\u9489\u5E94\u7528 Client Secret": "Enter the DingTalk Client Secret",
  "\u586B\u5199\u4F01\u4E1A\u5FAE\u4FE1\u667A\u80FD\u673A\u5668\u4EBA Bot ID": "Enter the WeCom AI Bot ID",
  "\u586B\u5199\u4F01\u4E1A\u5FAE\u4FE1\u667A\u80FD\u673A\u5668\u4EBA Secret": "Enter the WeCom AI Bot Secret",
  "\u586B\u5199 QQ \u5F00\u653E\u5E73\u53F0 AppID": "Enter the QQ Open Platform AppID",
  "\u586B\u5199 QQ \u5F00\u653E\u5E73\u53F0 AppSecret": "Enter the QQ Open Platform AppSecret",
  "\u626B\u7801\u63A5\u5165\u5FAE\u4FE1\u673A\u5668\u4EBA": "Connect WeChat bot by QR code",
  "\u626B\u7801\u63A5\u5165\u98DE\u4E66\u673A\u5668\u4EBA": "Connect Feishu bot by QR code",
  "\u626B\u7801\u63A5\u5165\u9489\u9489\u673A\u5668\u4EBA": "Connect DingTalk bot by QR code",
  "\u626B\u7801\u63A5\u5165\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA": "Connect WeCom bot by QR code",
  "\u626B\u7801\u63A5\u5165 QQ \u673A\u5668\u4EBA": "Connect QQ bot by QR code",
  "\u626B\u7801\u63A5\u5165 WhatsApp \u673A\u5668\u4EBA": "Connect WhatsApp by QR code",
  "\u626B\u7801\u7ED1\u5B9A WhatsApp \u673A\u5668\u4EBA": "Connect WhatsApp by QR code",
  "\u4F7F\u7528 App ID \u548C App Secret \u7ED1\u5B9A\u98DE\u4E66\u673A\u5668\u4EBA": "Connect a Feishu bot with App ID and App Secret",
  "\u4F7F\u7528 Client ID \u548C Client Secret \u7ED1\u5B9A\u9489\u9489\u673A\u5668\u4EBA": "Connect a DingTalk bot with Client ID and Client Secret",
  "\u4F7F\u7528 Bot ID \u548C Secret \u7ED1\u5B9A\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA": "Connect a WeCom bot with Bot ID and Secret",
  "\u4F7F\u7528 AppID \u548C AppSecret \u7ED1\u5B9A QQ \u673A\u5668\u4EBA": "Connect a QQ bot with AppID and AppSecret",
  "\u4F7F\u7528 Manifest \u548C\u53CC Token \u63A5\u5165 Slack \u673A\u5668\u4EBA": "Connect a Slack bot with a manifest and two tokens",
  "\u4F7F\u7528 Bot Token \u63A5\u5165 Telegram \u673A\u5668\u4EBA": "Connect a Telegram bot with a Bot Token",
  "\u4F7F\u7528 Bot Token \u63A5\u5165 Discord \u673A\u5668\u4EBA": "Connect a Discord bot with a Bot Token",
  "\u53D6\u6D88\u7ED1\u5B9A": "Cancel setup",
  "\u53D6\u6D88\u63A5\u5165": "Cancel setup",
  "\u4E8C\u7EF4\u7801\u7531\u817E\u8BAF\u5FAE\u4FE1 iLink \u670D\u52A1\u7B7E\u53D1\u3002\u7528\u624B\u673A\u5FAE\u4FE1\u626B\u63CF\u5E76\u786E\u8BA4\u540E\uFF0C\u8D26\u53F7\u51ED\u636E\u4F1A\u76F4\u63A5\u5199\u5165 Harness Host\uFF0C\u6D4F\u89C8\u5668\u4E0D\u4F1A\u6536\u5230 bot_token\u3002": "The QR code is issued by Tencent WeChat iLink. After you scan and confirm, account credentials are written directly to the Harness Host and are never exposed to the browser.",
  "\u626B\u7801\u8D26\u53F7\u5FC5\u987B\u5DF2\u52A0\u5165\u4F01\u4E1A/\u7EC4\u7EC7\u3002\u5982\u679C\u9489\u9489\u63D0\u793A\u5C1A\u672A\u52A0\u5165\u7EC4\u7EC7\uFF0C\u8BF7\u5728\u63D0\u793A\u9875\u521B\u5EFA\u7EC4\u7EC7\uFF0C\u6216\u6362\u7528\u5DF2\u52A0\u5165\u7EC4\u7EC7\u7684\u8D26\u53F7\u3002": "The DingTalk account must belong to an organization. If prompted, create an organization or use an account that already belongs to one.",
  "\u8BF7\u5728\u624B\u673A\u4E0A\u6838\u5BF9\u5E76\u786E\u8BA4\u6388\u6743\u3002\u90E8\u5206\u8D26\u53F7\u4F1A\u989D\u5916\u663E\u793A\u4E00\u4E2A\u914D\u5BF9\u6570\u5B57\uFF0C\u9875\u9762\u4F1A\u5728\u9700\u8981\u65F6\u63D0\u793A\u8F93\u5165\u3002": "Review and confirm authorization on your phone. Some accounts may also require a pairing number.",
  "\u6388\u6743\u7531\u9489\u9489\u5B98\u65B9\u9875\u9762\u5B8C\u6210\u3002\u626B\u7801\u8D26\u53F7\u5FC5\u987B\u5DF2\u52A0\u5165\u4E00\u4E2A\u4F01\u4E1A/\u7EC4\u7EC7\u5E76\u6709\u6743\u521B\u5EFA\u673A\u5668\u4EBA\uFF1B\u521B\u5EFA\u6210\u529F\u540E\uFF0C\u5E94\u7528\u51ED\u636E\u4F1A\u76F4\u63A5\u5199\u5165 Harness Host\u3002": "Authorization is completed on DingTalk\u2019s official page. The account must belong to an organization and be allowed to create bots. Credentials are written directly to the Harness Host.",
  "\u626B\u7801\u7531\u817E\u8BAF\u5B98\u65B9\u9875\u9762\u5B8C\u6210\uFF0C\u4E0D\u9700\u8981\u624B\u52A8\u586B\u5199 AppID \u6216 AppSecret\u3002\u626B\u7801\u6210\u529F\u540E\uFF0C\u673A\u5668\u4EBA\u4F1A\u81EA\u52A8\u8FDE\u63A5 DeepSeek Harness\u3002": "Scanning is completed on Tencent\u2019s official page. No AppID or AppSecret is required, and the bot connects automatically.",
  "\u626B\u7801\u7531\u817E\u8BAF\u5B98\u65B9\u9875\u9762\u5B8C\u6210\uFF0C\u4E0D\u9700\u8981\u624B\u52A8\u586B\u5199 Bot ID \u6216 Secret\u3002\u521B\u5EFA\u6210\u529F\u540E\uFF0C\u673A\u5668\u4EBA\u4F1A\u81EA\u52A8\u8FDE\u63A5 DeepSeek Harness\u3002": "Scanning is completed on Tencent\u2019s official page. No Bot ID or Secret is required, and the bot connects automatically.",
  "\u817E\u8BAF\u9875\u9762\u4F1A\u521B\u5EFA\u6216\u7ED1\u5B9A\u4E00\u4E2A QQ \u673A\u5668\u4EBA\uFF0C\u5E76\u628A\u8FDE\u63A5\u51ED\u636E\u5B89\u5168\u4EA4\u7ED9\u672C\u673A Harness Host\u3002": "Tencent will create or connect a QQ bot and securely deliver its credentials to the local Harness Host.",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5B98\u65B9\u9875\u9762\u4F1A\u521B\u5EFA\u4E00\u4E2A\u667A\u80FD\u673A\u5668\u4EBA\uFF0C\u5E76\u628A\u8FDE\u63A5\u51ED\u636E\u5B89\u5168\u4EA4\u7ED9\u672C\u673A Harness Host\u3002": "WeCom will create an AI bot and securely deliver its credentials to the local Harness Host.",
  "\u4ECE\u6B64 Harness \u79FB\u9664\u8FD9\u4E2A\u5FAE\u4FE1\u8D26\u53F7\uFF1F": "Remove this WeChat account from Harness?",
  "\u8FD9\u4F1A\u505C\u6B62\u6D88\u606F\u8FDE\u63A5\uFF0C\u5E76\u5220\u9664\u672C\u673A\u4FDD\u5B58\u7684 bot_token\u3001\u8D26\u53F7\u914D\u7F6E\u548C\u4F1A\u8BDD\u6620\u5C04\u3002\u5176\u4ED6\u5FAE\u4FE1\u8D26\u53F7\u4E0D\u53D7\u5F71\u54CD\u3002": "This stops the message connection and removes the locally stored bot_token, account configuration, and session mappings. Other WeChat accounts are not affected.",
  "\u6B64\u64CD\u4F5C\u4F1A\u505C\u6B62\u8FD9\u4E2A\u673A\u5668\u4EBA\u7684\u8FDE\u63A5\uFF0C\u5E76\u5220\u9664\u4FDD\u5B58\u5728\u672C\u673A\u7684\u63A5\u5165\u914D\u7F6E\u548C\u51ED\u636E\u3002\u98DE\u4E66\u5F00\u653E\u5E73\u53F0\u4E2D\u7684\u5E94\u7528\u4E0D\u4F1A\u88AB\u81EA\u52A8\u5220\u9664\uFF0C\u5176\u4ED6\u673A\u5668\u4EBA\u4E5F\u4E0D\u53D7\u5F71\u54CD\u3002": "This stops the bot connection and removes the locally stored configuration and credentials. The app in Feishu Open Platform is not deleted, and other bots are not affected.",
  "\u8FD9\u4F1A\u505C\u6B62\u6D88\u606F\u8FDE\u63A5\uFF0C\u5E76\u5220\u9664\u672C\u673A\u4FDD\u5B58\u7684\u5E94\u7528\u51ED\u636E\u3001\u673A\u5668\u4EBA\u914D\u7F6E\u53CA\u4F1A\u8BDD\u6620\u5C04\u3002\u9489\u9489\u5F00\u653E\u5E73\u53F0\u4E2D\u7684\u673A\u5668\u4EBA\u4E0D\u4F1A\u88AB\u81EA\u52A8\u5220\u9664\u3002": "This stops the message connection and removes the locally stored app credentials, bot configuration, and session mappings. The bot in DingTalk Open Platform is not deleted.",
  "\u8FD9\u4F1A\u505C\u6B62\u6D88\u606F\u8FDE\u63A5\uFF0C\u5E76\u5220\u9664\u672C\u673A\u4FDD\u5B58\u7684\u5E94\u7528\u51ED\u636E\u3001\u673A\u5668\u4EBA\u914D\u7F6E\u53CA\u4F1A\u8BDD\u6620\u5C04\u3002\u4F01\u4E1A\u5FAE\u4FE1\u5E73\u53F0\u4E2D\u7684\u673A\u5668\u4EBA\u4E0D\u4F1A\u88AB\u81EA\u52A8\u5220\u9664\u3002": "This stops the message connection and removes the locally stored app credentials, bot configuration, and session mappings. The bot in WeCom is not deleted.",
  "\u8FD9\u4F1A\u505C\u6B62\u6D88\u606F\u8FDE\u63A5\uFF0C\u5E76\u5220\u9664\u672C\u673A\u4FDD\u5B58\u7684\u5E94\u7528\u51ED\u636E\u3001\u673A\u5668\u4EBA\u914D\u7F6E\u53CA\u4F1A\u8BDD\u6620\u5C04\u3002\u817E\u8BAF\u5E73\u53F0\u4E2D\u7684\u673A\u5668\u4EBA\u4E0D\u4F1A\u88AB\u81EA\u52A8\u5220\u9664\u3002": "This stops the message connection and removes the locally stored app credentials, bot configuration, and session mappings. The bot on Tencent\u2019s platform is not deleted.",
  "\u8FD9\u4F1A\u505C\u6B62\u6D88\u606F\u8FDE\u63A5\uFF0C\u5E76\u5220\u9664\u672C\u673A\u4FDD\u5B58\u7684 WhatsApp \u5173\u8054\u8BBE\u5907\u548C\u4F1A\u8BDD\u6620\u5C04\u3002": "This stops the message connection and removes the locally stored WhatsApp linked device and session mappings.",
  "\u6B63\u5728\u8BFB\u53D6\u98DE\u4E66\u673A\u5668\u4EBA\u5217\u8868": "Loading Feishu bots",
  "\u6B63\u5728\u8BFB\u53D6\u98DE\u4E66\u8FDE\u63A5\u72B6\u6001\u2026": "Loading Feishu connection status\u2026",
  "\u6B63\u5728\u8BFB\u53D6\u5FAE\u4FE1\u8FDE\u63A5\u72B6\u6001\u2026": "Loading WeChat connection status\u2026",
  "\u6B63\u5728\u8BFB\u53D6\u9489\u9489\u8FDE\u63A5\u72B6\u6001\u2026": "Loading DingTalk connection status\u2026",
  "\u901A\u8FC7\u626B\u7801\u628A\u9489\u9489\u673A\u5668\u4EBA\u63A5\u5165 DeepSeek Harness": "Connect a DingTalk bot to DeepSeek Harness by QR code",
  "\u9489\u9489\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u626B\u7801\u7ED1\u5B9A\u8FDB\u5EA6": "DingTalk did not return QR setup progress",
  "\u9489\u9489\u626B\u7801\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u7ED1\u5B9A\u4EFB\u52A1": "DingTalk did not return a valid setup attempt",
  "\u9489\u9489 Stream \u957F\u8FDE\u63A5\u8FD0\u884C\u6B63\u5E38": "DingTalk Stream connection is healthy",
  "\u9489\u9489\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u673A\u5668\u4EBA\u5217\u8868": "DingTalk did not return a valid bot list",
  "${totals.connected} / ${totals.configured} \u5728\u7EBF": "${totals.connected} / ${totals.configured} online",
  "\u7528\u4E8E\u628A\u9489\u9489\u673A\u5668\u4EBA\u63A5\u5165 DeepSeek Harness \u7684\u4E00\u6B21\u6027\u4E8C\u7EF4\u7801": "One-time QR code for connecting a DingTalk bot to DeepSeek Harness",
  "\u4E8C\u7EF4\u7801\u5DF2\u8FC7\u671F\\n\u8BF7\u91CD\u65B0\u751F\u6210": "QR code expired\\nGenerate a new one",
  "\u673A\u5668\u4EBA\u5DF2\u521B\u5EFA\uFF0C\u6B63\u5728\u5EFA\u7ACB\u6D88\u606F\u8FDE\u63A5": "Bot created. Starting the message connection",
  "\u9489\u9489\u626B\u7801\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u5B89\u5168\u7684\u4E8C\u7EF4\u7801": "DingTalk did not return a secure QR code",
  "\u9489\u9489\u4E8C\u7EF4\u7801\u5DF2\u751F\u6210\uFF0C\u8BF7\u4F7F\u7528\u9489\u9489 App \u626B\u63CF\u3002": "DingTalk QR code generated. Scan it with the DingTalk app.",
  "\u9489\u9489\u673A\u5668\u4EBA\u51ED\u636E\u5DF2\u7ED1\u5B9A\u3002": "DingTalk bot credentials connected.",
  "\u5DF2\u53D6\u6D88\u9489\u9489\u673A\u5668\u4EBA\u63A5\u5165\u3002": "DingTalk bot setup cancelled.",
  "\u9489\u9489\u673A\u5668\u4EBA\u53CA\u672C\u673A\u51ED\u636E\u5DF2\u79FB\u9664\u3002": "DingTalk bot and local credentials removed.",
  "\u98DE\u4E66\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u4E8C\u7EF4\u7801\u4FE1\u606F": "Feishu did not return QR code information",
  "\u98DE\u4E66\u670D\u52A1\u8FD4\u56DE\u7684\u4E8C\u7EF4\u7801\u4FE1\u606F\u4E0D\u5B8C\u6574": "Feishu returned incomplete QR code information",
  "\u98DE\u4E66\u670D\u52A1\u8FD4\u56DE\u4E86\u65E0\u6548\u7684\u673A\u5668\u4EBA\u72B6\u6001": "Feishu returned an invalid bot status",
  "\u98DE\u4E66\u670D\u52A1\u8FD4\u56DE\u7684\u673A\u5668\u4EBA\u7F3A\u5C11 botId": "The Feishu bot is missing botId",
  "\u98DE\u4E66\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u8FDE\u63A5\u72B6\u6001": "Feishu did not return connection status",
  "\u98DE\u4E66\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u521B\u5EFA\u8FDB\u5EA6": "Feishu did not return creation progress",
  "\u98DE\u4E66\u670D\u52A1\u8FD4\u56DE\u4E86\u672A\u77E5\u7684\u521B\u5EFA\u72B6\u6001": "Feishu returned an unknown creation status",
  "\u5DF2\u63A5\u5165 ${totals.configured} \u4E2A\u673A\u5668\u4EBA\uFF0C\u5176\u4E2D ${totals.connected} \u4E2A\u5728\u7EBF": "${totals.connected} of ${totals.configured} bots online",
  "\u5C1A\u672A\u63A5\u5165\u673A\u5668\u4EBA": "No bot connected yet",
  "\u7528\u4E8E\u65B0\u589E DeepSeek Harness \u98DE\u4E66\u673A\u5668\u4EBA\u7684\u4E00\u6B21\u6027\u6388\u6743\u4E8C\u7EF4\u7801": "One-time authorization QR code for adding a Feishu bot to DeepSeek Harness",
  "\u8BF7\u5237\u65B0\u540E\u91CD\u65B0\u626B\u7801": "Refresh and scan again",
  '${connected ? "\u68C0\u67E5\u8FDE\u63A5" : "\u91CD\u8BD5\u8FDE\u63A5"}${bot.name}': '${connected ? "Check connection" : "Reconnect"} ${bot.name}',
  "\u65E0\u6CD5\u8BFB\u53D6\u98DE\u4E66\u673A\u5668\u4EBA": "Could not load Feishu bots",
  "\u6388\u6743\u4E8C\u7EF4\u7801\u5DF2\u751F\u6210\uFF0C\u8BF7\u4F7F\u7528\u98DE\u4E66\u626B\u7801\u3002": "Authorization QR code generated. Scan it with Feishu.",
  "\u98DE\u4E66\u673A\u5668\u4EBA\u51ED\u636E\u5DF2\u7ED1\u5B9A\u3002": "Feishu bot credentials connected.",
  "\u5DF2\u53D6\u6D88\u6DFB\u52A0\u673A\u5668\u4EBA\u3002": "Adding the bot was cancelled.",
  "${newBot.bot.name}\u5DF2\u8FDE\u63A5\uFF0C\u53EF\u4EE5\u5728\u98DE\u4E66\u4E2D\u5F00\u59CB\u804A\u5929\u3002": "${newBot.bot.name} is connected and ready to chat in Feishu.",
  "${bot.name}\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u673A\u5668\u4EBA\u72B6\u6001\u3002": "${bot.name} operation failed. Check the bot status.",
  "${bot.name}\u5DF2\u4ECE\u6B64 DeepSeek Harness \u79FB\u9664\uFF1B\u98DE\u4E66\u5F00\u653E\u5E73\u53F0\u4E2D\u7684\u5E94\u7528\u672A\u88AB\u5220\u9664\u3002": "${bot.name} was removed from this DeepSeek Harness. The app in Feishu Open Platform was not deleted.",
  "\u65E0\u6CD5\u8BFB\u53D6\u8FDE\u63A5\u72B6\u6001": "Could not load connection status",
  "QQ \u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u626B\u7801\u7ED1\u5B9A\u8FDB\u5EA6": "QQ did not return QR setup progress",
  "QQ \u626B\u7801\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u7ED1\u5B9A\u4EFB\u52A1": "QQ did not return a valid setup attempt",
  "QQ WebSocket \u957F\u8FDE\u63A5\u8FD0\u884C\u6B63\u5E38": "QQ WebSocket connection is healthy",
  "QQ \u8FDE\u63A5\u672A\u5C31\u7EEA\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u91CD\u8BD5\u3002": "The QQ connection is not ready; the plugin will retry automatically.",
  "QQ \u8FDE\u63A5\u672A\u5C31\u7EEA\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u91CD\u8BD5": "The QQ connection is not ready; the plugin will retry automatically",
  "QQ \u8FDE\u63A5\u5F53\u524D\u79BB\u7EBF": "The QQ connection is currently offline",
  "QQ \u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u673A\u5668\u4EBA\u5217\u8868": "QQ did not return a valid bot list",
  "\u5C1A\u672A\u7ED1\u5B9A QQ \u673A\u5668\u4EBA": "No QQ bot connected yet",
  "\u7528\u4E8E\u7ED1\u5B9A QQ \u673A\u5668\u4EBA\u7684\u4E00\u6B21\u6027\u4E8C\u7EF4\u7801": "One-time QR code for connecting a QQ bot",
  "${channel}${connectionSummary}\u8FD0\u884C\u6B63\u5E38": "${channel}${connectionSummary} is healthy",
  "${channel} \u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u673A\u5668\u4EBA\u5217\u8868": "${channel} did not return a valid bot list",
  "\u4F7F\u7528 Bot Token \u63A5\u5165 ${channel} \u673A\u5668\u4EBA": "Connect a ${channel} bot with a Bot Token",
  "${model.totals.connected} / ${model.totals.configured} \u5728\u7EBF": "${model.totals.connected}/${model.totals.configured} online",
  " Bot API \u957F\u8F6E\u8BE2": " Bot API long polling",
  "\u4F01\u4E1A\u5FAE\u4FE1\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u626B\u7801\u7ED1\u5B9A\u8FDB\u5EA6": "WeCom did not return QR setup progress",
  "\u4F01\u4E1A\u5FAE\u4FE1\u626B\u7801\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u7ED1\u5B9A\u4EFB\u52A1": "WeCom did not return a valid setup attempt",
  "\u4F01\u4E1A\u5FAE\u4FE1 WebSocket \u957F\u8FDE\u63A5\u8FD0\u884C\u6B63\u5E38": "WeCom WebSocket connection is healthy",
  "\u4F01\u4E1A\u5FAE\u4FE1\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u673A\u5668\u4EBA\u5217\u8868": "WeCom did not return a valid bot list",
  "\u5C1A\u672A\u7ED1\u5B9A\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA": "No WeCom bot connected yet",
  "\u7528\u4E8E\u7ED1\u5B9A\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA\u7684\u4E00\u6B21\u6027\u4E8C\u7EF4\u7801": "One-time QR code for connecting a WeCom bot",
  "\u5FAE\u4FE1\u626B\u7801\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u7ED1\u5B9A\u4EFB\u52A1": "WeChat did not return a valid setup attempt",
  "\u5FAE\u4FE1\u7ED1\u5B9A\u6CA1\u6709\u5B8C\u6210": "WeChat setup did not complete",
  "\u5FAE\u4FE1\u8FDE\u63A5\u6B63\u5E38": "WeChat connection is healthy",
  "\u5FAE\u4FE1\u8FDE\u63A5\u672A\u5C31\u7EEA": "WeChat connection is not ready",
  "\u5F53\u524D\u6A21\u578B\u4E0D\u652F\u6301\u56FE\u7247\uFF0C\u8BF7\u7528 /models \u67E5\u770B\u53EF\u7528\u6A21\u578B\uFF0C\u518D\u7528 /model <\u5E8F\u53F7> \u5207\u6362\u540E\u91CD\u53D1\u3002": "The current model does not support images. Use /models to list models, then /model <number> to switch and resend.",
  "\u56FE\u7247\u8D85\u8FC7\u5BBF\u4E3B\u5141\u8BB8\u7684\u5927\u5C0F\uFF0C\u8BF7\u538B\u7F29\u540E\u91CD\u8BD5\u3002": "The image exceeds the Host size limit. Compress it and try again.",
  "\u56FE\u7247\u5206\u8FA8\u7387\u8FC7\u9AD8\uFF0C\u8BF7\u538B\u7F29\u540E\u91CD\u8BD5\u3002": "The image resolution is too high. Compress it and try again.",
  "\u56FE\u7247\u5185\u5BB9\u65E0\u6548\u6216\u683C\u5F0F\u4E0D\u53D7\u652F\u6301\uFF0C\u8BF7\u91CD\u65B0\u53D1\u9001\u3002": "The image is invalid or unsupported. Send it again.",
  "\u672A\u80FD\u8BFB\u53D6\u56FE\u7247\u5185\u5BB9\uFF0C\u8BF7\u91CD\u65B0\u53D1\u9001\u3002": "The image could not be read. Send it again.",
  "\u56FE\u7247\u683C\u5F0F\u4E0E\u5B9E\u9645\u5185\u5BB9\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u91CD\u65B0\u53D1\u9001\u3002": "The declared image format does not match its content. Send it again.",
  "\u4E00\u6B21\u53D1\u9001\u7684\u56FE\u7247\u6570\u91CF\u8D85\u8FC7\u5BBF\u4E3B\u9650\u5236\uFF0C\u8BF7\u51CF\u5C11\u540E\u91CD\u8BD5\u3002": "The message exceeds the Host image-count limit. Remove some images and try again.",
  "\u56FE\u7247\u603B\u5927\u5C0F\u8D85\u8FC7\u5BBF\u4E3B\u9650\u5236\uFF0C\u8BF7\u51CF\u5C11\u56FE\u7247\u6216\u538B\u7F29\u540E\u91CD\u8BD5\u3002": "The images exceed the Host total-size limit. Remove or compress some images and try again.",
  "\u56FE\u7247\u4E0B\u8F7D\u5730\u5740\u53D1\u751F\u4E86\u91CD\u5B9A\u5411\uFF0C\u6682\u65F6\u65E0\u6CD5\u8BFB\u53D6\u3002": "The image download redirected and cannot be read.",
  "\u56FE\u7247\u8D85\u8FC7 5 MB\uFF0C\u8BF7\u538B\u7F29\u540E\u91CD\u8BD5\u3002": "The image exceeds 5 MB. Compress it and try again.",
  "\u4E00\u6B21\u53D1\u9001\u7684\u56FE\u7247\u603B\u5927\u5C0F\u8FC7\u5927\uFF0C\u8BF7\u51CF\u5C11\u56FE\u7247\u6570\u91CF\u6216\u538B\u7F29\u540E\u91CD\u8BD5\u3002": "The images are too large in total. Remove or compress some images and try again.",
  "\u56FE\u7247\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u91CD\u65B0\u53D1\u9001\u540E\u518D\u8BD5\u3002": "The image download failed. Send it again.",
  "\u6682\u4E0D\u652F\u6301\u8BE5\u56FE\u7247\u683C\u5F0F\uFF0C\u8BF7\u53D1\u9001 JPEG\u3001PNG\u3001WebP \u6216 GIF \u56FE\u7247\u3002": "This image format is unsupported. Send a JPEG, PNG, WebP, or GIF image.",
  "\u6D88\u606F\u5904\u7406\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Message processing failed. Try again later.",
  "\u5FAE\u4FE1\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u8D26\u53F7\u5217\u8868": "WeChat did not return a valid account list",
  "\u5C1A\u672A\u7ED1\u5B9A\u5FAE\u4FE1": "No WeChat account connected yet",
  "\u7528\u4E8E\u628A\u5FAE\u4FE1\u673A\u5668\u4EBA\u7ED1\u5B9A\u5230 DeepSeek Harness \u7684\u4E00\u6B21\u6027\u4E8C\u7EF4\u7801": "One-time QR code for connecting a WeChat bot to DeepSeek Harness",
  "\u4FDD\u6301\u672C\u9875\u6253\u5F00\uFF0C\u7B49\u5F85\u6D88\u606F\u957F\u8F6E\u8BE2\u53D8\u4E3A\u5728\u7EBF": "Keep this page open until long polling is online",
  "\u5FAE\u4FE1\u4E8C\u7EF4\u7801\u5DF2\u751F\u6210\uFF0C\u8BF7\u4F7F\u7528\u624B\u673A\u5FAE\u4FE1\u626B\u63CF\u3002": "WeChat QR code generated. Scan it with WeChat on your phone.",
  "\u79FB\u9664\u5931\u8D25\uFF1A${presentError(error).message}": "Removal failed: ${presentError(error).message}",
  "\u65E0\u6CD5\u8BFB\u53D6\u5FAE\u4FE1\u72B6\u6001": "Could not load WeChat status",
  "WhatsApp \u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u626B\u7801\u8FDB\u5EA6": "WhatsApp did not return QR setup progress",
  "WhatsApp \u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u626B\u7801\u4EFB\u52A1": "WhatsApp did not return a valid setup attempt",
  "WhatsApp \u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u673A\u5668\u4EBA\u5217\u8868": "WhatsApp did not return a valid account list",
  "\u7528\u4E8E\u5173\u8054 WhatsApp \u8BBE\u5907\u7684\u4E00\u6B21\u6027\u4E8C\u7EF4\u7801": "One-time QR code for linking a WhatsApp device",
  "\u7528\u6237": "User",
  "\u5FAE\u4FE1\u7528\u6237 ID": "WeChat user ID",
  "\u586B\u5199\u63A5\u6536\u6D88\u606F\u7684\u7528\u6237 ID": "Enter the recipient user ID",
  "\u79C1\u804A": "Direct message",
  "\u7FA4\u804A": "Group",
  "\u7FA4\u804A\u8BBE\u7F6E": "Group settings",
  "\u5F53\u524D\u673A\u5668\u4EBA": "Current bot",
  "\u98DE\u4E66\u7FA4\u804A\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002": "Feishu group settings are currently unavailable.",
  "\u98DE\u4E66\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u5F53\u524D\u673A\u5668\u4EBA\u7684\u8BBE\u7F6E": "Feishu did not return settings for this bot",
  "\u7FA4 Chat ID": "Group Chat ID",
  "\u7528\u6237 ID": "User ID",
  "\u586B\u5199\u9489\u9489\u7528\u6237 ID": "Enter the DingTalk user ID",
  "\u7FA4 Open Conversation ID": "Group Open Conversation ID",
  "\u586B\u5199\u4F01\u4E1A\u5FAE\u4FE1\u7528\u6237 ID": "Enter the WeCom user ID",
  "\u586B\u5199\u7FA4 chatid": "Enter the group chatid",
  "\u5355\u804A": "Direct message",
  "\u7528\u6237 Open ID": "User Open ID",
  "\u586B\u5199 user_openid": "Enter the user_openid",
  "\u7FA4 Open ID": "Group Open ID",
  "\u586B\u5199 group_openid": "Enter the group_openid",
  "\u4F1A\u8BDD": "Conversation",
  "\u7EBF\u7A0B": "Thread",
  "Thread \u65F6\u95F4\u6233": "Thread timestamp",
  "\u804A\u5929": "Chat",
  "\u8BDD\u9898": "Topic",
  "\u9891\u9053\u6216\u79C1\u4FE1": "Channel or DM",
  "\u586B\u5199\u53EF\u53D1\u6D88\u606F\u7684 Channel ID": "Enter a Channel ID the bot can message",
  "\u7528\u6237 JID": "User JID",
  "\u7FA4 JID": "Group JID",
  "\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Request failed. Try again later.",
  "\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u81EA\u52A8\u590D\u5236\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9\u590D\u5236\u3002": "Automatic copy is unavailable. Select and copy the value manually.",
  "\u76EE\u6807\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5\u3002": "Could not save the target. Check it and try again.",
  "\u65E0\u6CD5\u751F\u6210\u672A\u5360\u7528\u7684 Target ID\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Could not generate an unused Target ID. Try again.",
  "\u7F16\u8F91\u6295\u9012\u76EE\u6807": "Edit delivery target",
  "\u65B0\u5EFA\u6295\u9012\u76EE\u6807": "New delivery target",
  "\u5DF2\u4ECE\u4F1A\u8BDD\u81EA\u52A8\u586B\u5165\u76EE\u6807\u4FE1\u606F\uFF1B\u786E\u8BA4\u540E\u518D\u4FDD\u5B58\u3002": "Target details were filled from the conversation. Review them before saving.",
  "\u8BF7\u624B\u52A8\u586B\u5199\u4ECE\u5BF9\u5E94\u5E73\u53F0\u53D6\u5F97\u7684\u539F\u751F\u6807\u8BC6\u3002": "Enter the native identifier from the platform manually.",
  "\u4F8B\u5982 daily-report": "For example, daily-report",
  "\u4F7F\u7528\u5927\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u5192\u53F7\u3001@ \u6216\u8FDE\u5B57\u7B26\u3002": "Use letters, numbers, dots, underscores, colons, @, or hyphens.",
  "\u663E\u793A\u540D\u79F0\uFF08\u53EF\u9009\uFF09": "Display name (optional)",
  "\u4F8B\u5982 \u6BCF\u65E5\u6C47\u62A5\u7FA4": "For example, Daily reports",
  "\u76EE\u6807\u7C7B\u578B": "Target type",
  "\u4FDD\u5B58\u76EE\u6807": "Save target",
  "\u8BF7\u5148\u5B8C\u6210\u6295\u9012\u76EE\u6807\u8BFB\u53D6": "Wait for delivery targets to finish loading",
  "\u4ECE\u5DF2\u804A\u8FC7\u7684\u4F1A\u8BDD\u9009\u62E9": "Choose from conversations",
  "\u5DF2\u804A\u4F1A\u8BDD": "Conversation",
  "\u4ECE\u4F1A\u8BDD\u9009\u62E9targetID": "Select a targetID from conversations",
  "\u9009\u62E9\u540E\u4F1A\u81EA\u52A8\u586B\u5199\u76EE\u6807\u4FE1\u606F\u548C\u8C03\u7528\u522B\u540D\uFF0C\u786E\u8BA4\u540E\u518D\u4FDD\u5B58\u3002": "Selecting a conversation fills the target details and call alias. Review them before saving.",
  "\u6B63\u5728\u5237\u65B0\u2026": "Refreshing\u2026",
  "\u5237\u65B0": "Refresh",
  "\u6B63\u5728\u8BFB\u53D6\u5DF2\u804A\u4F1A\u8BDD\u2026": "Loading known conversations\u2026",
  "\u65E0\u6CD5\u8BFB\u53D6\u5DF2\u804A\u4F1A\u8BDD\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Could not load known conversations. Try again later.",
  "\u8FD8\u6CA1\u6709\u53EF\u9009\u62E9\u7684\u4F1A\u8BDD": "No conversations to choose from",
  "\u5148\u5728\u5BF9\u5E94\u5E73\u53F0\u4E0E\u673A\u5668\u4EBA\u804A\u4E00\u6761\u6D88\u606F\uFF0C\u518D\u5237\u65B0\u3002": "Send the bot a message on the platform, then refresh.",
  "\u5DF2\u6DFB\u52A0": "Added",
  "\u624B\u52A8\u586B\u5199\uFF08\u9AD8\u7EA7\uFF09": "Enter manually (advanced)",
  "\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\uFF0C\u8BF7\u5230\u76EE\u6807\u4F1A\u8BDD\u786E\u8BA4\u3002": "Test message sent. Confirm it in the target conversation.",
  "\u6D4B\u8BD5\u53D1\u9001\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Test delivery failed. Try again later.",
  "\u5DF2\u590D\u5236\u8C03\u7528\u53C2\u6570": "Call parameters copied",
  "\u590D\u5236\u5931\u8D25\u3002": "Copy failed.",
  "\u5220\u9664\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Could not delete the target. Try again later.",
  "\u590D\u5236\u8C03\u7528\u53C2\u6570": "Copy call parameters",
  "\u673A\u5668\u4EBA\u79BB\u7EBF\u65F6\u4E0D\u53EF\u53D1\u9001\u6D4B\u8BD5\u6D88\u606F": "Test delivery is unavailable while the bot is offline",
  "\u6D4B\u8BD5\u6295\u9012\u76EE\u6807": "Test delivery target",
  "\u6D4B\u8BD5": "Test",
  "\u7F16\u8F91": "Edit",
  "\u5220\u9664": "Delete",
  "\u5220\u9664 ": "Delete ",
  "\uFF1F\u4F7F\u7528\u8FD9\u4E2A targetId \u7684\u5916\u90E8\u8C03\u7528\u5C06\u8FD4\u56DE unknown-target\u3002": "? External calls using this targetId will return unknown-target.",
  "\u6B63\u5728\u5220\u9664\u2026": "Deleting\u2026",
  "\u786E\u8BA4\u5220\u9664": "Delete target",
  "\u4F1A\u8BDD\u53CC\u5411\u540C\u6B65": "Two-way Session sync",
  "\u81EA\u52A8\u8DDF\u968F\u8BE5\u79C1\u804A\u7684\u5F53\u524D\u4F1A\u8BDD": "Automatically follow this direct message\u2019s current Session",
  "\u7B49\u5F85\u8BE5\u79C1\u804A\u5EFA\u7ACB\u65B0\u4F1A\u8BDD": "Waiting for this direct message to establish a new Session",
  "\u5173\u95ED\u65F6\u4E0D\u53D1\u9001 DSH \u4F1A\u8BDD\u6D88\u606F": "DSH Session messages are not sent while disabled",
  "\u4EC5\u652F\u6301\u5DF2\u7ECF\u804A\u8FC7\u3001\u5DF2\u5EFA\u7ACB\u5F53\u524D\u4F1A\u8BDD\u4E14\u4F7F\u7528\u5F53\u524D Host Harness \u7684\u79C1\u804A\u76EE\u6807": "Only a known direct message with a current Session on this Host Harness is supported",
  "\u4F1A\u8BDD\u540C\u6B65\u4EC5\u652F\u6301\u5DF2\u7ECF\u804A\u8FC7\u3001\u5DF2\u5EFA\u7ACB\u5F53\u524D\u4F1A\u8BDD\u4E14\u4F7F\u7528\u5F53\u524D Host Harness \u7684\u79C1\u804A\u76EE\u6807\u3002": "Session sync requires a known direct message with a current Session on this Host Harness.",
  "\u4F1A\u8BDD\u540C\u6B65\u8BBE\u7F6E\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Could not update Session sync. Try again later.",
  "\u4FEE\u6539\u63A5\u6536\u4F4D\u7F6E\u4F1A\u5173\u95ED\u4F1A\u8BDD\u53CC\u5411\u540C\u6B65\u3002": "Changing the destination disables two-way Session sync.",
  " \u4F1A\u8BDD\u540C\u6B65\u8BBE\u7F6E\u4E5F\u4F1A\u4E00\u5E76\u5220\u9664\u3002": " Its Session sync setting will also be deleted.",
  "\u6295\u9012\u76EE\u6807\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002": "Delivery target settings are unavailable.",
  "\u65E0\u6CD5\u8BFB\u53D6\u6295\u9012\u76EE\u6807\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Could not load delivery targets. Try again later.",
  "\u2190 \u8FD4\u56DE\u673A\u5668\u4EBA\u5217\u8868": "\u2190 Back to bots",
  "\u4F7F\u7528\u6587\u6863": "User guide",
  "\u6253\u5F00\u4E3B\u52A8\u6295\u9012\u4F7F\u7528\u6587\u6863": "Open the proactive delivery guide",
  "\u5F53\u524D\u6E20\u9053\u6682\u4E0D\u652F\u6301\u6295\u9012\u76EE\u6807\u3002": "Delivery targets are not supported for this channel.",
  "\u5DF2\u590D\u5236 Bot ID": "Bot ID copied",
  "\u590D\u5236": "Copy",
  "\u6295\u9012\u76EE\u6807": "Delivery targets",
  "\u673A\u5668\u4EBA\u5F53\u524D\u79BB\u7EBF\uFF1B\u4ECD\u53EF\u914D\u7F6E\u76EE\u6807\uFF0C\u6062\u590D\u8FDE\u63A5\u540E\u518D\u6D4B\u8BD5\u3002": "The bot is offline. You can still configure targets and test them after reconnection.",
  "\u65B0\u5EFA\u76EE\u6807": "New target",
  "\u6B63\u5728\u8BFB\u53D6\u6295\u9012\u76EE\u6807\u2026": "Loading delivery targets\u2026",
  "\u5C1A\u672A\u914D\u7F6E\u6295\u9012\u76EE\u6807": "No delivery targets yet",
  "\u70B9\u51FB\u201C\u65B0\u5EFA\u76EE\u6807\u201D\u53EF\u4ECE\u5DF2\u804A\u8FC7\u7684\u4F1A\u8BDD\u9009\u62E9\uFF0C\u4E5F\u53EF\u624B\u52A8\u586B\u5199\u3002": "Select New target to choose a conversation or enter the details manually.",
  "\u5168\u5C40\u8BBE\u7F6E": "Global settings",
  "\u901A\u7528": "General",
  "\u5904\u7406\u4E2D\u2026": "Processing\u2026",
  "\u673A\u5668\u4EBA\u901A\u7528\u8BBE\u7F6E": "General bot settings",
  "\u5C55\u5F00\u601D\u8003\u8FC7\u7A0B": "Expand thinking",
  "\u5C55\u5F00\u5DE5\u5177\u6458\u8981": "Expand tool summaries",
  "\u4EC5\u5BF9\u5B9E\u65F6\u8FC7\u7A0B\u5361\u751F\u6548\uFF0C\u4EFB\u52A1\u7ED3\u675F\u540E\u81EA\u52A8\u6536\u8D77\u3002": "Applies to streaming process cards only. Panels collapse when the task ends.",
  "\u8BF7\u9009\u62E9\u5B9E\u65F6\u8FC7\u7A0B\u5361\u9762\u677F\u7684\u5C55\u5F00\u72B6\u6001\u3002": "Choose whether to expand the streaming process card panels.",
  "\u6D88\u606F\u5904\u7406\u65B9\u5F0F": "Message handling",
  "\u6392\u961F": "Queue",
  "\u63D2\u8BDD": "Steer",
  "\u5F53\u524D\u4EFB\u52A1\u7ED3\u675F\u540E\u5904\u7406\u65B0\u6D88\u606F": "Process new messages after the current task",
  "\u5C06\u65B0\u6D88\u606F\u8865\u5145\u5230\u5F53\u524D\u4EFB\u52A1": "Add new messages to the current task",
  "\u65E0\u6CD5\u8BFB\u53D6\u6D88\u606F\u5904\u7406\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Could not read message handling settings. Try again later.",
  "\u8BF7\u63D0\u4EA4\u6709\u6548\u7684\u6D88\u606F\u5904\u7406\u65B9\u5F0F\u3002": "Choose a valid message handling mode.",
  "\u901A\u7528\u8BBE\u7F6E": "General settings",
  "\u901A\u7528\u8BBE\u7F6E\u5206\u7C7B": "General settings categories",
  "\u9644\u4EF6": "Attachments",
  "IM \u8BBE\u7F6E\u5BFC\u822A": "IM settings navigation",
  "\u9644\u4EF6\u4FDD\u7559\u65F6\u957F (\u5C0F\u65F6)": "Attachment retention (hours)",
  "\u67E5\u770B\u9644\u4EF6\u4FDD\u7559\u65F6\u957F\u8BF4\u660E": "View attachment retention details",
  "\u6C38\u4E45\u4FDD\u7559\uFF0C\u4E0D\u4F1A\u81EA\u52A8\u6E05\u7406": "Keep forever; nothing is removed automatically",
  "\u6BCF Turn \u7ED3\u675F\u540E\u7ACB\u5373\u6E05\u7406": "Cleaned up as soon as each turn ends",
  "\u5C0F\u65F6\u540E\u81EA\u52A8\u6E05\u7406": "hours until automatic cleanup",
  "\u8BF7\u8F93\u5165 -1\u30010 \u6216 1~${INBOUND_TTL_MAX_HOURS} \u4E4B\u95F4\u7684\u6574\u6570\u3002": "Enter -1, 0, or an integer from 1 to ${INBOUND_TTL_MAX_HOURS}.",
  "\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Could not save the setting. Try again later.",
  "\u5DF2\u4FDD\u5B58": "Saved",
  "\u901A\u7528\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002": "General settings are unavailable.",
  "\u6B63\u5728\u8BFB\u53D6\u901A\u7528\u8BBE\u7F6E\u2026": "Loading general settings\u2026",
  "\u65E0\u6CD5\u8BFB\u53D6\u901A\u7528\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "Could not load general settings. Try again later.",
  "\u901A\u7528\u8BBE\u7F6E\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94\u3002": "General settings returned an unrecognized response.",
  "\u6E05\u7406\u8FC7\u671F\u9644\u4EF6": "Clean up expired attachments",
  "\u786E\u8BA4\u6E05\u7406\u8FC7\u671F\u9644\u4EF6": "Confirm expired attachment cleanup",
  "\u786E\u8BA4\u6E05\u7406\u5F53\u524D\u5DF2\u8FC7\u671F\u7684\u9644\u4EF6\uFF1F": "Clean up the attachments that are currently expired?",
  "\u786E\u8BA4\u6E05\u7406": "Confirm cleanup",
  "\u6B63\u5728\u6E05\u7406\u2026": "Cleaning up\u2026",
  "\u6B63\u5728\u8BFB\u53D6\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u72B6\u6001\u2026": "Loading WeCom app status\u2026",
  "\u6DFB\u52A0\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528": "Add WeCom app",
  "\u6536\u8D77\u8868\u5355": "Collapse form",
  "\u6DFB\u52A0\u4F01\u4E1A\u5FAE\u4FE1\u81EA\u5EFA\u5E94\u7528": "Add a WeCom self-built app",
  "\u6B63\u5728\u586B\u5199": "Filling in details",
  "\u5C1A\u672A\u7ED1\u5B9A\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528": "No WeCom app connected yet",
  "\u5728\u4F01\u4E1A\u5FAE\u4FE1\u4E2D\u521B\u5EFA\u81EA\u5EFA\u5E94\u7528\uFF0C\u5373\u53EF\u5728\u5FAE\u4FE1\u91CC\u4F7F\u7528": "Create a self-built app in WeCom to use it inside WeChat",
  "\u5728\u5E94\u7528\u7BA1\u7406\u540E\u53F0\u521B\u5EFA\u81EA\u5EFA\u5E94\u7528\uFF0C\u5F00\u542F\u300C\u63A5\u6536\u6D88\u606F\u300D\u5E76\u586B\u5165\u4E0B\u9762\u7684\u53C2\u6570\u3002\u6210\u5458\u7684\u5FAE\u4FE1\u5173\u6CE8\u8BE5\u4F01\u4E1A\u7684\u5FAE\u4FE1\u63D2\u4EF6\u540E\uFF0C\u5C31\u80FD\u5728\u5FAE\u4FE1\u4E2D\u4E0E\u672C\u5E94\u7528\u53CC\u5411\u5BF9\u8BDD\u3002": "Create the self-built app in the WeCom admin console, enable receive-messages, and fill in the parameters below. Once members follow the enterprise WeChat plugin, they can chat with this app directly inside WeChat.",
  "\u586B\u5199\u5E94\u7528\u53C2\u6570": "Fill in app parameters",
  "\u4F01\u4E1A ID\uFF08CorpID\uFF09": "Corp ID",
  "\u4F8B\u5982 ww1234567890abcdef": "for example ww1234567890abcdef",
  "\u5E94\u7528 AgentId": "AgentId",
  "\u4F8B\u5982 1000002": "for example 1000002",
  "\u5E94\u7528 Secret": "App Secret",
  "\u5E94\u7528\u8BE6\u60C5\u9875\u7684 Secret": "The Secret from the app details page",
  "\u56DE\u8C03 Token": "Callback Token",
  "\u63A5\u6536\u6D88\u606F \u2192 API \u63A5\u6536\u4E2D\u7684 Token": "The Token from Receive messages \u2192 API receive",
  "43 \u4F4D\u5B57\u6BCD\u6216\u6570\u5B57": "43 alphanumeric characters",
  "\u4EE3\u7406\u5730\u5740\uFF08\u53EF\u9009\uFF09": "API proxy (optional)",
  "\u7559\u7A7A\u76F4\u8FDE qyapi.weixin.qq.com": "leave empty to reach qyapi.weixin.qq.com directly",
  "\u516C\u7F51\u56DE\u8C03\u57FA\u5740\uFF08\u53EF\u9009\uFF09": "Public callback base URL (optional)",
  "\u4F8B\u5982 https://im.example.com": "for example https://im.example.com",
  "\u6D41\u5F0F\u56DE\u590D\uFF1A\u5F00": "Streaming replies: on",
  "\u6D41\u5F0F\u56DE\u590D\uFF1A\u5173": "Streaming replies: off",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5BA2\u6237\u7AEF\u5B9E\u65F6\u51FA\u5B57\uFF1B\u5FAE\u4FE1\u7AEF\u4E0D\u652F\u6301\u65F6\u81EA\u52A8\u6539\u4E3A\u6574\u6BB5\u53D1\u9001": "Streams replies in the WeCom client; falls back to segmented text messages when the WeChat side does not support it",
  "\u7ED1\u5B9A\u4F01\u4E1A\u5FAE\u4FE1\u81EA\u5EFA\u5E94\u7528": "Bind a WeCom self-built app",
  "\u56DE\u8C03 URL\uFF08\u586B\u5165\u4F01\u4E1A\u5FAE\u4FE1\u540E\u53F0\u300C\u63A5\u6536\u6D88\u606F \u2192 \u8BBE\u7F6EAPI\u63A5\u6536\u300D\uFF09": "Callback URL (paste into the WeCom console under Receive messages \u2192 API receive)",
  "\u672A\u914D\u7F6E\u516C\u7F51\u56DE\u8C03\u57FA\u5740\uFF1A\u8BF7\u5728\u672C\u9875\u300C\u8BBE\u7F6E\u300D\u4E2D\u586B\u5199\u56DE\u8C03\u57FA\u5740\uFF0C\u6216\u624B\u52A8\u62FC\u63A5 \u56DE\u8C03\u57FA\u5740 + \u8DEF\u5F84": "No public callback base URL configured: fill it in under Settings on this page, or manually combine the base URL and the path",
  "\u91CD\u7F6E\u5BC6\u94A5": "Reset secret",
  "\u91CD\u7F6E\u4E2D\u2026": "Resetting\u2026",
  "\u91CD\u7F6E\u5BC6\u94A5\u540E\u56DE\u8C03 URL \u4F1A\u53D8\u5316\uFF0C\u9700\u8981\u540C\u6B65\u66F4\u65B0\u4F01\u4E1A\u5FAE\u4FE1\u540E\u53F0\u3002\u82E5\u516C\u7F51\u53CD\u4EE3\u672A\u5C31\u7EEA\uFF0C\u53EF\u4E34\u65F6\u4F7F\u7528 http://\u670D\u52A1\u5668IP:\u7AEF\u53E3 \u5F62\u5F0F\u7684\u56DE\u8C03\u5730\u5740\u3002": "Resetting the secret changes the callback URL; update the WeCom console accordingly. If the public reverse proxy is not ready yet, a http://server-ip:port callback address works temporarily.",
  "\u4FDD\u5B58\u8BBE\u7F6E": "Save settings",
  "\u8FD9\u4F1A\u5220\u9664\u672C\u673A\u4FDD\u5B58\u7684\u5E94\u7528\u51ED\u636E\u3001\u56DE\u8C03\u914D\u7F6E\u53CA\u4F1A\u8BDD\u6620\u5C04\u3002\u4F01\u4E1A\u5FAE\u4FE1\u540E\u53F0\u7684\u5E94\u7528\u4E0D\u4F1A\u88AB\u5220\u9664\u3002": "This removes the locally stored app credentials, callback configuration, and session mappings. The app in the WeCom console is not deleted.",
  "\u4FDD\u7559\u5E94\u7528": "Keep app",
  "\u5DF2\u7ED1\u5B9A\u7684\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528": "Connected WeCom apps",
  "HTTP \u56DE\u8C03\u901A\u9053": "HTTP callback channel",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528": "WeCom app",
  "\u4F01\u4E1A ID \u5DF2\u4FDD\u5B58": "Corp ID saved securely",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u56DE\u8C03\u901A\u9053\u5C31\u7EEA": "WeCom app callback channel is ready",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u8FDE\u63A5\u5C1A\u672A\u5C31\u7EEA": "WeCom app connection is not ready",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u4ECD\u672A\u5C31\u7EEA\uFF0C\u63D2\u4EF6\u4F1A\u7EE7\u7EED\u81EA\u52A8\u91CD\u8BD5\u3002": "The WeCom app is still not ready; the plugin keeps retrying automatically.",
  "\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\u3002": "Connection check finished.",
  "\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\uFF0C\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\u3002": "Connection check finished; the test message was sent.",
  "\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\u3002\u5E94\u7528\u5C1A\u672A\u6536\u5230\u53EF\u7528\u4E8E\u6D4B\u8BD5\u7684\u79C1\u804A\u6D88\u606F\u3002": "Connection check finished. The app has not received a private chat usable for testing yet.",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u5DF2\u7ED1\u5B9A\u3002\u8BF7\u628A\u56DE\u8C03 URL \u586B\u5165\u4F01\u4E1A\u5FAE\u4FE1\u540E\u53F0\u5E76\u4FDD\u5B58\u3002": "The WeCom app is bound. Paste the callback URL into the WeCom console and save.",
  "\u56DE\u8C03\u5BC6\u94A5\u5DF2\u91CD\u7F6E\uFF0C\u8BF7\u628A\u65B0\u7684\u56DE\u8C03 URL \u66F4\u65B0\u5230\u4F01\u4E1A\u5FAE\u4FE1\u540E\u53F0\u3002": "The callback secret was reset; update the new callback URL in the WeCom console.",
  "\u56DE\u8C03\u5BC6\u94A5\u91CD\u7F6E\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002": "The callback secret reset failed; try again later.",
  "\u65E0\u6CD5\u8BFB\u53D6\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u72B6\u6001": "Could not load WeCom app status",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u8BBE\u7F6E": "WeCom app settings",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u8BBE\u7F6E\u9875\u7F3A\u5C11 RPC \u8FDE\u63A5": "The WeCom app settings page is missing the RPC connection",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u64CD\u4F5C\u5931\u8D25": "The WeCom app operation failed",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5": "The WeCom app operation failed; try again later",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u670D\u52A1\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94": "The WeCom app service returned an unrecognized response",
  "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u673A\u5668\u4EBA\u5217\u8868": "The WeCom app service did not return a valid bot list",
  "\u90AE\u7BB1": "Email",
  " IMAP/SMTP \u90AE\u7BB1": " IMAP/SMTP mailbox",
  "QQ \u90AE\u7BB1": "QQ Mail",
  "163 \u90AE\u7BB1": "163 Mail",
  "\u81EA\u5B9A\u4E49\u670D\u52A1\u5668": "Custom servers",
  "\u5728 QQ \u90AE\u7BB1\u300C\u8BBE\u7F6E \u2192 \u8D26\u6237\u300D\u4E2D\u5F00\u542F IMAP/SMTP \u670D\u52A1\uFF0C\u5E76\u751F\u6210 16 \u4F4D\u6388\u6743\u7801\uFF08\u4E0D\u662F\u767B\u5F55\u5BC6\u7801\uFF09\u3002": "In QQ Mail open Settings \u2192 Account, enable IMAP/SMTP, and generate a 16-character authorization code (not your login password).",
  "\u5728 163 \u90AE\u7BB1\u300C\u8BBE\u7F6E \u2192 POP3/SMTP/IMAP\u300D\u4E2D\u5F00\u542F\u670D\u52A1\uFF0C\u5E76\u65B0\u589E\u6388\u6743\u5BC6\u7801\u3002": "In 163 Mail open Settings \u2192 POP3/SMTP/IMAP, enable the service, and add an authorization password.",
  "\u9700\u8981\u5148\u5F00\u542F\u4E24\u6B65\u9A8C\u8BC1\uFF0C\u518D\u751F\u6210\u300C\u5E94\u7528\u4E13\u7528\u5BC6\u7801\u300D\u3002": "Enable two-step verification first, then generate an app-specific password.",
  "\u8BF7\u586B\u5199\u90AE\u7BB1\u670D\u52A1\u5546\u63D0\u4F9B\u7684 IMAP \u4E0E SMTP \u670D\u52A1\u5668\u5730\u5740\u53CA\u7AEF\u53E3\u3002": "Enter the IMAP and SMTP host and port provided by your mail provider.",
  "\u63A5\u5165\u90AE\u7BB1": "Connect a mailbox",
  "DeepSeek Harness \u4F1A\u8BFB\u53D6\u8BE5\u90AE\u7BB1\u7684\u65B0\u90AE\u4EF6\u4F5C\u4E3A\u6307\u4EE4\uFF0C\u5E76\u5728\u540C\u4E00\u90AE\u4EF6\u7EBF\u7A0B\u5185\u56DE\u590D\u5904\u7406\u7ED3\u679C\u3002": "DeepSeek Harness reads new mail in this mailbox as instructions and replies with the result inside the same mail thread.",
  "\u90AE\u7BB1\u670D\u52A1\u5546": "Mail provider",
  "\u90AE\u7BB1\u5730\u5740": "Email address",
  "\u5E94\u7528\u5BC6\u7801 / \u6388\u6743\u7801": "App password / authorization code",
  "IMAP/SMTP \u6388\u6743\u7801": "IMAP/SMTP authorization code",
  "\u4E0D\u662F\u90AE\u7BB1\u767B\u5F55\u5BC6\u7801\uFF1B\u8BF7\u5728\u90AE\u7BB1\u8BBE\u7F6E\u4E2D\u5355\u72EC\u751F\u6210\u3002": "This is not your login password; generate it separately in your mailbox settings.",
  "IMAP \u670D\u52A1\u5668": "IMAP server",
  "\u7AEF\u53E3": "Port",
  "SMTP \u670D\u52A1\u5668": "SMTP server",
  "\u5141\u8BB8\u7684\u53D1\u4EF6\u4EBA": "Allowed senders",
  "me@example.com\\n\u540C\u4E8B@example.com": "me@example.com\\ncolleague@example.com",
  "\u5FC5\u586B\u3002\u53EA\u6709\u8FD9\u4E9B\u5730\u5740\u53D1\u6765\u7684\u90AE\u4EF6\u4F1A\u89E6\u53D1 Harness\uFF1B\u591A\u4E2A\u5730\u5740\u7528\u6362\u884C\u6216\u9017\u53F7\u5206\u9694\u3002": "Required. Only mail from these addresses triggers the Harness; separate multiple addresses with newlines or commas.",
  "\u6B63\u5728\u8FDE\u63A5\u90AE\u7BB1\u2026": "Connecting the mailbox\u2026",
  "\u8FDE\u63A5\u90AE\u7BB1": "Connect mailbox",
  "\u4FDD\u5B58\u540E\u4F1A\u91CD\u65B0\u8FDE\u63A5\u90AE\u7BB1\u4EE5\u4F7F\u8BBE\u7F6E\u7ACB\u5373\u751F\u6548\u3002": "Saving reconnects the mailbox so the change takes effect immediately.",
  "\u4F7F\u7528\u73B0\u6709\u90AE\u7BB1\u6536\u53D1\u6307\u4EE4\uFF1A\u90AE\u4EF6\u8FDB\u6765\u89E6\u53D1 Harness\uFF0C\u5904\u7406\u7ED3\u679C\u4EE5\u56DE\u4FE1\u5F62\u5F0F\u9001\u8FBE\u3002": "Use an existing mailbox to send instructions: incoming mail triggers the Harness and the result is delivered as a reply.",
  "\u914D\u7F6E\u90AE\u7BB1\u6536\u53D1": "Configure email send and receive",
  "\u914D\u7F6E\u90AE\u7BB1": "Configure mailbox",
  "\u90AE\u7BB1\u914D\u7F6E": "Mailbox configuration",
  "\u4F1A\u8BDD\u7ED1\u5B9A": "Session binding",
  "\u4F1A\u8BDD\u7ED1\u5B9A\u5DF2\u4FDD\u5B58\u3002": "Session binding saved.",
  "\u4E0D\u7ED1\u5B9A\u5219\u6BCF\u5C01\u65B0\u90AE\u4EF6\u5F00\u542F\u4E00\u4E2A\u65B0\u4F1A\u8BDD\uFF1B\u7ED1\u5B9A\u56FA\u5B9A\u4F1A\u8BDD\u540E\uFF0C\u6765\u4FE1\u90FD\u5728\u8BE5\u4F1A\u8BDD\u5185\u7EE7\u7EED\u3002": "With no binding every new mail starts a new session; with a fixed session, incoming mail continues in that session.",
  "\u56FA\u5B9A\u4F1A\u8BDD\uFF08\u8D26\u53F7\u7EA7\uFF09": "Fixed session (account level)",
  "\u4E0D\u7ED1\u5B9A\uFF08\u6BCF\u5C01\u65B0\u90AE\u4EF6\u65B0\u5EFA\u4F1A\u8BDD\uFF09": "No binding (new session per mail)",
  "\u6309\u53D1\u4EF6\u4EBA\u8986\u76D6\uFF08\u4F18\u5148\u4E8E\u8D26\u53F7\u7EA7\uFF09": "Per-sender override (takes priority)",
  "\u8DDF\u968F\u8D26\u53F7\u7EA7": "Follow the account setting",
  "\u5C1A\u65E0\u53EF\u8986\u76D6\u7684\u53D1\u4EF6\u4EBA\uFF08\u5148\u5728\u4E0A\u65B9\u914D\u7F6E\u5141\u8BB8\u7684\u53D1\u4EF6\u4EBA\uFF09\u3002": "No senders to override yet (configure allowed senders above first).",
  "\u4FDD\u5B58\u7ED1\u5B9A": "Save binding",
  "\u6E05\u9664\u7ED1\u5B9A": "Clear binding",
  "\u6240\u6709\u53D1\u4EF6\u4EBA\u540C\u4E0A": "Point every sender at the same session",
  "\u5DF2\u9009\uFF1A": "Selected: ",
  "\u63A5\u5165\u65B9\u5F0F": "Access method",
  "\u751F\u6210\u6388\u6743\u94FE\u63A5": "Generate authorization link",
  "\u91CD\u65B0\u751F\u6210": "Regenerate",
  "\u6388\u6743\u94FE\u63A5": "Authorization link",
  "\u914D\u5BF9\u7801": "Pairing code",
  "\u7B49\u5F85\u6388\u6743\u4E2D\u2026": "Waiting for authorization\u2026",
  "\u7B49\u5F85\u6388\u6743\u4E2D\uFF0C": "Waiting for authorization \u2014 valid for ",
  " \u5206\u949F": " minutes",
  "\u5185\u6709\u6548\uFF0C\u53EF\u4FDD\u6301\u672C\u9875\u6253\u5F00\u3002": "; you can keep this page open.",
  "\u6388\u6743\u6210\u529F\uFF0C\u6B63\u5728\u63A5\u5165\u90AE\u7BB1\u2026": "Authorized; connecting the mailbox\u2026",
  "\u6388\u6743\u6210\u529F\uFF1B\u8BF7\u586B\u5199\u90AE\u7BB1\u5730\u5740\u4E0E\u5141\u8BB8\u7684\u53D1\u4EF6\u4EBA\u540E\u5B8C\u6210\u63A5\u5165\u3002": "Authorized. Enter the mailbox address and at least one allowed sender to finish connecting.",
  "\u6388\u6743\u540E\u81EA\u52A8\u586B\u5165": "Filled in after authorization",
  "\u7531\u6388\u6743\u7ED3\u679C\u81EA\u52A8\u586B\u5165\uFF0C\u65E0\u9700\u624B\u5DE5\u586B\u5199\u3002": "Filled in from the authorization; no need to type it.",
  "\u5237\u65B0\u4F1A\u8BDD\u5217\u8868": "Refresh the session list",
  "\u817E\u8BAF Agent \u90AE\u7BB1\u9700\u8981\u5FAE\u4FE1\u626B\u7801\u6388\u6743\u3002\u70B9\u4E0B\u9762\u7684\u6309\u94AE\u751F\u6210\u6388\u6743\u94FE\u63A5\uFF0C\u5728\u6253\u5F00\u7684\u9875\u9762\u91CC\u7528\u5FAE\u4FE1\u626B\u7801\u767B\u5F55\u5E76\u786E\u8BA4\u3002": "The Tencent Agent mailbox authorizes with a WeChat QR code. Generate an authorization link, then scan it with WeChat on the page that opens and confirm.",
  "\u8BF7\u6C42\u5931\u8D25": "The request failed"
});
var en = EN;
var zh = Object.freeze(Object.fromEntries(
  Object.keys(EN).map((key) => [key, key === "$locale" ? "zh" : key])
));
var translate = (key) => key;
function setImTranslator(next) {
  translate = typeof next === "function" ? next : (key) => key;
}
function isEnglish() {
  return translate("$locale") === "en";
}
function channelName(value) {
  return localizeText(value);
}
function translateDynamic(text3) {
  const configMessage = /^微信配置格式错误：(config\.json|workspaces\.json)。请查看诊断详情，修复后重启 DSH。$/.exec(text3);
  if (configMessage) return EN["\u5FAE\u4FE1\u914D\u7F6E\u683C\u5F0F\u9519\u8BEF\uFF1A{file}\u3002\u8BF7\u67E5\u770B\u8BCA\u65AD\u8BE6\u60C5\uFF0C\u4FEE\u590D\u540E\u91CD\u542F DSH\u3002"].replace("{file}", configMessage[1]);
  const configHint = /^(.*?)请检查微信渠道数据目录中的 (config\.json|workspaces\.json)，修复后重启 DSH；“重新读取”不会重新加载配置。\s*(字段位置中的序号从 0 开始，按文件中的条目顺序计数，不包含真实账号标识。)?$/.exec(text3);
  if (configHint) return [
    localizeText(configHint[1].trim()),
    EN["\u8BF7\u68C0\u67E5\u5FAE\u4FE1\u6E20\u9053\u6570\u636E\u76EE\u5F55\u4E2D\u7684 {file}\uFF0C\u4FEE\u590D\u540E\u91CD\u542F DSH\uFF1B\u201C\u91CD\u65B0\u8BFB\u53D6\u201D\u4E0D\u4F1A\u91CD\u65B0\u52A0\u8F7D\u914D\u7F6E\u3002"].replace("{file}", configHint[2]),
    configHint[3] ? localizeText(configHint[3]) : ""
  ].filter(Boolean).join(" ");
  const guidanceLimit = /^增强提示词不得超过 (\d+) 个字符。$/.exec(text3);
  if (guidanceLimit) return `Guidance must not exceed ${guidanceLimit[1]} characters.`;
  let match = /^(\d+) \/ (\d+) 在线$/.exec(text3);
  if (match) return `${match[1]}/${match[2]} online`;
  match = /^已接入 (\d+) 个机器人，其中 (\d+) 个在线$/.exec(text3);
  if (match) return `${match[2]} of ${match[1]} bots online`;
  match = /^请输入 -1、0 或 1~(\d+) 之间的整数。$/.exec(text3);
  if (match) return `Enter -1, 0, or an integer from 1 to ${match[1]}.`;
  match = /^正在读取\s*(.+?)\s*机器人状态…$/.exec(text3);
  if (match) return `Loading ${channelName(match[1])} bot status\u2026`;
  match = /^无法读取\s*(.+?)\s*机器人状态$/.exec(text3);
  if (match) return `Could not load ${channelName(match[1])} bot status`;
  match = /^尚未接入\s*(.+?)\s*机器人$/.exec(text3);
  if (match) return `No ${channelName(match[1])} bot connected yet`;
  match = /^已接入的\s*(.+?)\s*机器人$/.exec(text3);
  if (match) return `Connected ${channelName(match[1])} bots`;
  match = /^手动接入(.+)机器人$/.exec(text3);
  if (match) return `Connect ${channelName(match[1])} bot manually`;
  match = /^(.+) 设置$/.exec(text3);
  if (match) return `${channelName(match[1])} settings`;
  match = /^从 DeepSeek Harness 移除“(.+)”？$/.exec(text3);
  if (match) return `Remove \u201C${match[1]}\u201D from DeepSeek Harness?`;
  match = /^从 DeepSeek Harness 移除(.+)$/.exec(text3);
  if (match) return `Remove ${match[1]} from DeepSeek Harness`;
  match = /^(.+)的飞书授权流程$/.exec(text3);
  if (match) return `Feishu authorization flow for ${match[1]}`;
  match = /^用于为(.+)补全权限与回调的一次性授权二维码$/.exec(text3);
  if (match) return `One-time QR code for completing permissions and the callback for ${match[1]}`;
  match = /^用于为(.+)开通群消息权限的一次性授权二维码$/.exec(text3);
  if (match) return `One-time QR code for granting group-message permission to ${match[1]}`;
  match = /^正在为「(.+)」补全权限与回调$/.exec(text3);
  if (match) return `Completing permissions and the callback for \u201C${match[1]}\u201D`;
  match = /^正在为「(.+)」开通群消息权限$/.exec(text3);
  if (match) return `Granting group-message permission to \u201C${match[1]}\u201D`;
  match = /^为(.+)补全权限与回调$/.exec(text3);
  if (match) return `Complete permissions and the callback for ${match[1]}`;
  match = /^(.+)的权限补全二维码已生成，请使用飞书扫码。$/.exec(text3);
  if (match) return `Permission-completion QR code generated for ${match[1]}. Scan it with Feishu.`;
  match = /^(.+)的群消息权限二维码已生成，请使用飞书确认。$/.exec(text3);
  if (match) return `Group-message permission QR code generated for ${match[1]}. Confirm it with Feishu.`;
  match = /^(.+)的权限与回调已补全。$/.exec(text3);
  if (match) return `Permissions and the callback completed for ${match[1]}.`;
  match = /^(.+)已开通群消息权限，并启用“响应所有群消息”。$/.exec(text3);
  if (match) return `${match[1]} now has group-message permission and \u201CRespond to all group messages\u201D is enabled.`;
  match = /^(检查连接|重试连接)(.+)$/.exec(text3);
  if (match) return `${localizeText(match[1])} ${match[2]}`;
  match = /^移除(.+)$/.exec(text3);
  if (match) return `Remove ${match[1]}`;
  match = /^这会停止消息连接，并删除本机保存的 (.+)、机器人配置及会话映射。(.+)中的机器人不会被自动删除。$/.exec(text3);
  if (match) {
    return `This stops the message connection and removes the locally stored ${localizeText(match[1])}, bot configuration, and session mappings. The bot in ${localizeText(match[2])} is not deleted.`;
  }
  match = /^二维码剩余 (.+)$/.exec(text3);
  if (match) return `QR code expires in ${match[1]}`;
  match = /^最近一条消息处理失败：(.+)$/.exec(text3);
  if (match) return `Latest message failed: ${localizeText(match[1])}`;
  match = /^图片下载失败（HTTP (.+)），请重新发送后再试。$/.exec(text3);
  if (match) return `The image download failed (HTTP ${match[1]}). Send it again.`;
  match = /^一次最多只能处理 (\d+) 张图片。$/.exec(text3);
  if (match) return `A message can contain at most ${match[1]} images.`;
  match = /^状态刷新失败：(.+)$/.exec(text3);
  if (match) return `Status refresh failed: ${match[1]}`;
  match = /^状态自动刷新失败：(.+)$/.exec(text3);
  if (match) return `Automatic status refresh failed: ${match[1]}`;
  match = /^操作失败：(.+)$/.exec(text3);
  if (match) return `Operation failed: ${match[1]}`;
  match = /^连接检查失败：(.+)（参考号：(.+)）$/.exec(text3);
  if (match) return `Connection check failed: ${localizeText(match[1])} (reference: ${match[2]})`;
  match = /^连接检查失败：(.+)$/.exec(text3);
  if (match) return `Connection check failed: ${match[1]}`;
  match = /^移除失败：(.+)$/.exec(text3);
  if (match) return `Removal failed: ${match[1]}`;
  const phrases = [
    ["\u4F01\u4E1A\u5FAE\u4FE1", "WeCom"],
    ["DeepSeek Harness", "DeepSeek Harness"],
    ["WhatsApp", "WhatsApp"],
    ["iMessage", "iMessage"],
    ["macOS Messages", "macOS Messages"],
    ["Telegram", "Telegram"],
    ["Discord", "Discord"],
    ["Slack", "Slack"],
    ["\u98DE\u4E66", "Feishu"],
    ["\u9489\u9489", "DingTalk"],
    ["\u5FAE\u4FE1", "WeChat"],
    ["\u673A\u5668\u4EBA", "bot"],
    ["\u8D26\u53F7", "account"],
    ["\u5E94\u7528", "app"],
    ["\u51ED\u636E", "credentials"],
    ["\u670D\u52A1\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94", "service returned an unrecognized response"],
    ["\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u673A\u5668\u4EBA\u5217\u8868", "service did not return a valid bot list"],
    ["\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5", "operation failed; try again later"],
    ["\u64CD\u4F5C\u5931\u8D25", "operation failed"],
    ["\u8FDE\u63A5\u5C1A\u672A\u5C31\u7EEA", "connection is not ready"],
    ["\u6CA1\u6709\u63A5\u5165\u5B8C\u6210", "was not connected"],
    ["\u6CA1\u6709\u7ED1\u5B9A\u5B8C\u6210", "was not connected"],
    ["\u8BBE\u7F6E\u9875\u7F3A\u5C11 RPC \u8FDE\u63A5", "settings are missing an RPC connection"],
    ["\u8BBE\u7F6E", "settings"],
    ["\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210", "connection check completed"],
    ["\u4ECD\u672A\u8FDE\u63A5\uFF0C\u63D2\u4EF6\u4F1A\u7EE7\u7EED\u81EA\u52A8\u91CD\u8BD5", "is still offline; the plugin will keep retrying"],
    ["\u5DF2\u91CD\u65B0\u8FDE\u63A5", "reconnected"],
    ["\u79FB\u9664\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5", "could not be removed; try again"],
    ["\u5DF2\u8FDE\u63A5\uFF0C\u53EF\u4EE5\u5F00\u59CB\u804A\u5929", "is connected and ready to chat"],
    ["\u5DF2\u8FDE\u63A5\uFF0C\u53EF\u4EE5\u5F00\u59CB\u53D1\u9001\u6D88\u606F", "is connected and ready for messages"],
    ["\u670D\u52A1\u8BF7\u6C42\u5931\u8D25", "service request failed"],
    ["\u8FDE\u63A5\u9047\u5230\u95EE\u9898", "connection encountered a problem"],
    ["\u6B63\u5728\u8BFB\u53D6", "Loading "],
    ["\u8FDE\u63A5\u72B6\u6001", "connection status"],
    ["\u4E8C\u7EF4\u7801", "QR code"]
  ];
  let output = text3;
  for (const [source, target] of phrases) output = output.replaceAll(source, target);
  return output;
}
function localizeText(value) {
  if (typeof value !== "string") return value;
  const exact = translate(value);
  if (exact !== value || !isEnglish()) return exact;
  return translateDynamic(value);
}
var LOCALIZED_PROPS = Object.freeze([
  "aria-label",
  "alt",
  "placeholder",
  "title"
]);
function localizeChild(child) {
  if (typeof child === "string") return localizeText(child);
  if (Array.isArray(child)) return child.map(localizeChild);
  return child;
}
function h3(type, props, ...children) {
  let localizedProps = props;
  if (props) {
    for (const key of LOCALIZED_PROPS) {
      if (typeof props[key] === "string") {
        localizedProps = localizedProps === props ? { ...props } : localizedProps;
        localizedProps[key] = localizeText(props[key]);
      }
    }
  }
  return React3.createElement(type, localizedProps, ...children.map(localizeChild));
}

// src/channels/shared/diagnostic-details.mjs
var OPERATIONS = /* @__PURE__ */ new Set([
  "bot.bind-credentials",
  "bot.bind-native",
  "bot.bind-mailbox",
  "bot.mailbox.update",
  "bot.auth.start",
  "bot.auth.poll",
  "permissions.status",
  "bot.session-binding.get",
  "bot.session-binding.set",
  "bot.session.list",
  "connection.test",
  "message.receive",
  "message.send",
  "connector.configure",
  "connector.reconnect",
  "connector.test",
  "connector.remove",
  "startup",
  "connection.restore",
  "connection.monitor",
  "connection.close",
  "connection.status",
  "provision.begin",
  "provision.poll",
  "provision.verify",
  "provision.cancel",
  "bot.reconnect",
  "bot.delete",
  "bot.workspace.set",
  "bot.model.set",
  "bot.agent-preset.set",
  "bot.context-enhancement.set",
  "bot.access-policy.set",
  "bot.alias.set"
]);
var STAGES = /* @__PURE__ */ new Set([
  "session.prepare",
  "prompt.prepare",
  "interaction.open",
  "prompt.submit",
  "reply.wait",
  "credential.verify",
  "permission.check",
  "sdk.load",
  "operation",
  "message.receive",
  "message.send",
  "connection.test",
  "startup.load",
  "qr.begin",
  "qr.encode",
  "qr.poll",
  "qr.verify",
  "qr.cancel",
  "credential.read",
  "credential.save",
  "credential.remove",
  "account.save",
  "account.remove",
  "state.load",
  "state.write",
  "state.cleanup",
  "workspace.write",
  "workspace.cleanup",
  "runtime.prepare",
  "activation",
  "harness.check",
  "connection.start",
  "connection.poll",
  "connection.stop",
  "status.read",
  "rollback",
  "management.request"
]);
var REASONS = /* @__PURE__ */ new Set([
  "stream-closed-before-open",
  "stream-failed-before-open",
  "stream-failed",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ETIMEDOUT",
  "EPIPE",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_SOCKET",
  "CERT_HAS_EXPIRED",
  "CERT_NOT_YET_VALID",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "ERR_TLS_CERT_ALTNAME_INVALID",
  "ERR_SSL_WRONG_VERSION_NUMBER",
  "ENOENT",
  "EACCES",
  "EPERM",
  "ENOSPC",
  "EROFS",
  "ENOTDIR",
  "EISDIR",
  "EBUSY",
  "EIO",
  "EXDEV",
  "EMFILE",
  "ENFILE",
  "EEXIST",
  "ERR_INVALID_ARG_TYPE",
  "ERR_INVALID_ARG_VALUE",
  "ERR_OUT_OF_RANGE",
  "ERR_BUFFER_OUT_OF_BOUNDS",
  "ERR_ZLIB_INITIALIZATION_FAILED",
  "ERR_STREAM_DESTROYED",
  "ERR_STREAM_PREMATURE_CLOSE",
  "Z_STREAM_ERROR",
  "Z_DATA_ERROR",
  "Z_MEM_ERROR",
  "Z_BUF_ERROR",
  "Z_VERSION_ERROR",
  "MODULE_NOT_FOUND",
  "ERR_MODULE_NOT_FOUND",
  "unknown",
  "multiple-causes",
  "timeout",
  "http-error",
  "provider-rejected",
  "invalid-response",
  "ERR_PROXY_CONNECTION_FAILED",
  "ERR_TLS_HANDSHAKE_TIMEOUT",
  "ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR",
  "ERR_NETWORK_ACCESS_DENIED",
  "AUTHENTICATIONFAILED",
  "EAUTH",
  "invalid-json",
  "invalid-config",
  "read-only"
]);
var RESOURCES = /* @__PURE__ */ new Set(["credential-store", "account-config", "account-state", "workspace-config", "workspace-directory"]);
var RPC_METHODS = /* @__PURE__ */ new Set([
  "host.describe",
  "workspace.list",
  "workspace.create",
  "session.list",
  "session.create",
  "session.adopt",
  "session.history",
  "session.prompt",
  "session.rename",
  "session.cancel",
  "session.models",
  "session.permissions",
  "session.selectModel",
  "llm.models"
]);
var TRANSPORTS = /* @__PURE__ */ new Set(["host-api", "http", "websocket"]);
var SUBMISSION_STATES = /* @__PURE__ */ new Set(["not-submitted", "accepted", "unknown"]);
var CONFIG_FILES = /* @__PURE__ */ new Set(["config.json", "workspaces.json"]);
var DIAGNOSTIC_ERROR_TYPES = /* @__PURE__ */ new Set([
  "Error",
  "TypeError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "AggregateError",
  "DOMException",
  "AxiosError",
  "TimeoutError",
  "AbortError"
]);
var CONFIG_ISSUE_LABELS = Object.freeze({
  "expected-object": "\u5E94\u4E3A JSON \u5BF9\u8C61\u3002",
  "expected-array": "\u5E94\u4E3A JSON \u6570\u7EC4\u3002",
  "unsupported-version": "\u914D\u7F6E\u7248\u672C\u7F3A\u5931\u6216\u4E0D\u53D7\u5F53\u524D\u63D2\u4EF6\u652F\u6301\u3002",
  "invalid-string": "\u5B57\u6BB5\u7F3A\u5931\u6216\u4E0D\u662F\u975E\u7A7A\u5B57\u7B26\u4E32\u3002",
  "invalid-identifier": "\u6807\u8BC6\u7B26\u683C\u5F0F\u4E0D\u7B26\u5408\u8981\u6C42\u3002",
  "identity-mismatch": "\u6807\u8BC6\u7B26\u4E0E accountId \u6D3E\u751F\u7ED3\u679C\u4E0D\u4E00\u81F4\u3002",
  "duplicate-identity": "\u8D26\u53F7\u6807\u8BC6\u91CD\u590D\u3002",
  "invalid-api-url": "\u5FAE\u4FE1\u670D\u52A1\u5730\u5740\u4E0D\u662F\u6709\u6548 URL\u3002",
  "untrusted-api-url": "\u5FAE\u4FE1\u670D\u52A1\u5730\u5740\u5FC5\u987B\u4F7F\u7528\u53D7\u4FE1\u4EFB\u7684 HTTPS \u57DF\u540D\u548C\u7AEF\u53E3\u3002",
  "invalid-workspace-path": "\u5DE5\u4F5C\u533A\u8DEF\u5F84\u5FC5\u987B\u662F\u5F53\u524D\u64CD\u4F5C\u7CFB\u7EDF\u7684\u7EDD\u5BF9\u8DEF\u5F84\u3002",
  "invalid-agent-preset": "Agent Preset \u6807\u8BC6\u65E0\u6548\u3002",
  "invalid-model-selection": "\u6A21\u578B\u8BBE\u7F6E\u987B\u5305\u542B\u6709\u6548\u7684 provider\u3001model \u548C\u53EF\u9009 reasoningEffort\u3002",
  "invalid-delivery-target": "\u6295\u9012\u76EE\u6807\u7684\u6807\u8BC6\u3001\u7ED3\u6784\u6216\u8DEF\u7531\u4E0D\u7B26\u5408\u5F53\u524D\u914D\u7F6E\u7248\u672C\u8981\u6C42\u3002",
  "unexpected-field": "\u5F53\u524D\u914D\u7F6E\u7248\u672C\u4E0D\u5141\u8BB8\u6B64\u5B57\u6BB5\u3002"
});
var CONFIG_FIELD = /^(?:\$|version|accounts(?:\[\d{1,10}\](?:\.(?:accountId|ownerUserId|botId|tokenRef|baseUrl))?)?|(?:workspaces|agentPresets|models)(?:\[\d{1,10}\]\.(?:key|value))?|deliveryTargets(?:\[\d{1,10}\]\.(?:key|targets(?:\[\d{1,10}\])?))?)$/;
function normalizeDiagnosticDetails(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result2 = {};
  for (const [field, allowed] of [["operation", OPERATIONS], ["stage", STAGES], ["reason", REASONS], ["resource", RESOURCES], ["method", RPC_METHODS], ["transport", TRANSPORTS], ["submissionState", SUBMISSION_STATES], ["lastFailureReason", REASONS]]) {
    if (allowed.has(value[field])) result2[field] = value[field];
  }
  if (DIAGNOSTIC_CHANNELS.includes(value.channel)) result2.channel = value.channel;
  if (Array.isArray(value.errorTypes)) {
    const errorTypes = [...new Set(value.errorTypes.filter((type) => DIAGNOSTIC_ERROR_TYPES.has(type)))];
    if (errorTypes.length) result2.errorTypes = errorTypes;
  }
  if (value.qrEncoder === "qrcode") result2.qrEncoder = value.qrEncoder;
  if (value.qrRenderer === "png") result2.qrRenderer = value.qrRenderer;
  if (Array.isArray(value.reasons)) {
    const reasons = [...new Set(value.reasons.filter((v) => REASONS.has(v) && !["unknown", "multiple-causes"].includes(v)))].slice(0, 16);
    if (reasons.length) result2.reasons = reasons;
  }
  for (const field of ["durationMs", "timeoutMs"]) if (Number.isFinite(value[field]) && value[field] >= 0) result2[field] = Math.round(value[field]);
  if (Number.isSafeInteger(value.attempts) && value.attempts >= 0) result2.attempts = value.attempts;
  for (const field of ["nodeVersion", "dshVersion"]) if (typeof value[field] === "string" && /^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(value[field]) && value[field].length < 80) result2[field] = value[field];
  if (["darwin", "linux", "win32", "freebsd"].includes(value.platform)) result2.platform = value.platform;
  if (["ilinkai.weixin.qq.com", "oapi.dingtalk.com", "api.dingtalk.com", "api.telegram.org", "discord.com", "slack.com", "open.feishu.cn", "qyapi.weixin.qq.com"].includes(value.host)) result2.host = value.host;
  if (value.dependencies && typeof value.dependencies === "object") {
    const dependencies = {};
    for (const name2 of ["dingtalkStream", "axios", "httpsProxyAgent", "agentBase", "qrcode", "pngjs", "zlib"]) {
      const version = value.dependencies[name2];
      if (typeof version === "string" && /^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/.test(version) && version.length <= 80) dependencies[name2] = version;
    }
    if (Object.keys(dependencies).length) result2.dependencies = dependencies;
  }
  if (typeof value.proxyConfigured === "boolean") result2.proxyConfigured = value.proxyConfigured;
  if (value.truncated === true) result2.truncated = true;
  if (CONFIG_FILES.has(value.file)) result2.file = value.file;
  if (typeof value.field === "string" && CONFIG_FIELD.test(value.field)) result2.field = value.field;
  if (typeof value.issue === "string" && Object.hasOwn(CONFIG_ISSUE_LABELS, value.issue)) result2.issue = value.issue;
  if (/^(?:(?:WX|DT|IM)-CONN|MF)-[A-F0-9]{8}$/.test(value.referenceId ?? "")) result2.referenceId = value.referenceId;
  if (typeof value.occurredAt === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value.occurredAt) && Number.isFinite(Date.parse(value.occurredAt))) result2.occurredAt = value.occurredAt;
  if (Number.isInteger(value.httpStatus) && value.httpStatus >= 100 && value.httpStatus <= 599) result2.httpStatus = value.httpStatus;
  const provider = typeof value.providerCode === "number" && Number.isSafeInteger(value.providerCode) ? String(value.providerCode) : value.providerCode;
  if (typeof provider === "string" && /^-?\d{1,12}$/.test(provider)) result2.providerCode = provider;
  if (typeof value.pluginVersion === "string" && /^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(value.pluginVersion) && value.pluginVersion.length <= 64) result2.pluginVersion = value.pluginVersion;
  if (["succeeded", "failed", "not-attempted", "unknown"].includes(value.rollback)) result2.rollback = value.rollback;
  if (typeof value.hint === "string" && value.hint.trim()) result2.hint = value.hint.trim().slice(0, 500);
  return result2;
}
var DIAGNOSTIC_CHANNELS = Object.freeze([
  "qq"
]);
function diagnosticFields(value) {
  if (!value?.details) return {};
  const details = normalizeDiagnosticDetails({
    ...value?.details,
    referenceId: value?.details?.referenceId ?? value?.referenceId,
    hint: value?.details?.hint ?? value?.hint
  });
  return Object.keys(details).length ? { details } : {};
}

// plugin-src/client/connection-error.js
var STAGE_LABELS = {
  "session.prepare": "\u51C6\u5907\u4F1A\u8BDD",
  "prompt.prepare": "\u51C6\u5907\u6D88\u606F",
  "interaction.open": "\u5EFA\u7ACB\u4EA4\u4E92\u901A\u9053",
  "prompt.submit": "\u63D0\u4EA4\u6D88\u606F",
  "reply.wait": "\u7B49\u5F85\u5904\u7406\u7ED3\u679C",
  "credential.verify": "\u9A8C\u8BC1\u51ED\u636E",
  "permission.check": "\u68C0\u67E5\u6743\u9650",
  "sdk.load": "\u52A0\u8F7D\u6E20\u9053\u7EC4\u4EF6",
  operation: "\u6267\u884C\u6E20\u9053\u64CD\u4F5C",
  "message.receive": "\u63A5\u6536\u6D88\u606F",
  "message.send": "\u53D1\u9001\u6D88\u606F",
  "connection.test": "\u53D1\u9001\u6D4B\u8BD5\u6D88\u606F",
  "startup.load": "\u52A0\u8F7D\u6E20\u9053\u914D\u7F6E",
  "qr.begin": "\u7533\u8BF7\u4E8C\u7EF4\u7801",
  "qr.encode": "\u751F\u6210\u4E8C\u7EF4\u7801\u56FE\u7247",
  "qr.poll": "\u67E5\u8BE2\u626B\u7801\u72B6\u6001",
  "qr.verify": "\u63D0\u4EA4\u914D\u5BF9\u7801",
  "qr.cancel": "\u53D6\u6D88\u7ED1\u5B9A",
  "credential.read": "\u8BFB\u53D6\u767B\u5F55\u51ED\u636E",
  "credential.save": "\u4FDD\u5B58\u767B\u5F55\u51ED\u636E",
  "credential.remove": "\u79FB\u9664\u767B\u5F55\u51ED\u636E",
  "account.save": "\u4FDD\u5B58\u8D26\u53F7\u914D\u7F6E",
  "account.remove": "\u79FB\u9664\u8D26\u53F7\u914D\u7F6E",
  "state.load": "\u8BFB\u53D6\u8D26\u53F7\u72B6\u6001",
  "state.write": "\u4FDD\u5B58\u8D26\u53F7\u72B6\u6001",
  "state.cleanup": "\u6E05\u7406\u8D26\u53F7\u72B6\u6001",
  "workspace.write": "\u4FDD\u5B58\u5DE5\u4F5C\u533A\u8BBE\u7F6E",
  "workspace.cleanup": "\u6E05\u7406\u5DE5\u4F5C\u533A\u8BBE\u7F6E",
  "runtime.prepare": "\u51C6\u5907\u6D88\u606F\u8FDE\u63A5",
  activation: "\u6FC0\u6D3B\u8D26\u53F7",
  "harness.check": "\u68C0\u67E5 DSH \u5BBF\u4E3B",
  "connection.start": "\u542F\u52A8\u8FDE\u63A5",
  "connection.poll": "\u76D1\u6D4B\u8FDE\u63A5\u4E0E\u6D88\u606F",
  "connection.stop": "\u505C\u6B62\u8FDE\u63A5",
  "status.read": "\u8BFB\u53D6\u8FDE\u63A5\u72B6\u6001",
  rollback: "\u6062\u590D\u539F\u8D26\u53F7\u72B6\u6001",
  "management.request": "\u8BBF\u95EE DSH \u7BA1\u7406\u63A5\u53E3"
};
var SUBMISSION_LABELS = { "not-submitted": "\u672A\u63D0\u4EA4", accepted: "\u5DF2\u786E\u8BA4\u63A5\u6536", unknown: "\u63D0\u4EA4\u7ED3\u679C\u672A\u77E5" };
var STREAM_REASON_LABELS = {
  "stream-closed-before-open": "\u6253\u5F00\u524D\u5173\u95ED",
  "stream-failed-before-open": "\u6253\u5F00\u524D\u5931\u8D25",
  "stream-failed": "\u901A\u9053\u8FDE\u63A5\u5931\u8D25",
  unknown: "\u6682\u672A\u8BC6\u522B"
};
function formatConnectionDiagnostic(value) {
  const error = normalizeConnectionError(value);
  const details = error.details ?? {};
  return [
    localizeText(error.message),
    details.hint ? localizeText(details.hint) : null,
    localizeText("\u9519\u8BEF\u7801") + ": " + error.code,
    ...["channel", "operation", "stage", "method", "transport", "submissionState", "attempts", "lastFailureReason", "reason", "reasons", "errorTypes", "qrEncoder", "qrRenderer", "host", "durationMs", "timeoutMs", "nodeVersion", "dshVersion", "platform", "dependencies", "proxyConfigured", "truncated", "httpStatus", "providerCode", "resource", "file", "field", "issue", "referenceId", "occurredAt", "rollback", "pluginVersion"].filter((field) => details[field] !== void 0).map((field) => `${field}: ${typeof details[field] === "object" ? JSON.stringify(details[field]) : details[field]}`)
  ].filter(Boolean).join("\n");
}
function ConnectionError({ error: value, warning = false, showMessage = true }) {
  const error = normalizeConnectionError(value);
  const details = error.details ?? {};
  const isWarning = warning || error.code.endsWith("cleanup-failed");
  const [copyState, setCopyState] = React4.useState(null);
  React4.useEffect(() => setCopyState(null), [details.referenceId, error.code, error.message]);
  const copy = async () => {
    try {
      if (typeof globalThis.navigator?.clipboard?.writeText !== "function") throw new Error("clipboard unavailable");
      await globalThis.navigator.clipboard.writeText(formatConnectionDiagnostic(error));
      setCopyState("copied");
    } catch {
      setCopyState("manual");
    }
  };
  const fields = [
    ["\u9519\u8BEF\u7801", error.code],
    ["\u5931\u8D25\u9636\u6BB5", localizeText(STAGE_LABELS[details.stage] ?? details.stage ?? "")],
    ["RPC \u65B9\u6CD5", details.method],
    ["\u8C03\u7528\u65B9\u5F0F", details.transport === "host-api" ? localizeText("\u5BBF\u4E3B API\uFF08\u8FDB\u7A0B\u5185\uFF09") : details.transport === "http" ? "HTTP" : details.transport === "websocket" ? "WebSocket" : void 0],
    ["\u6D88\u606F\u63D0\u4EA4\u72B6\u6001", localizeText(SUBMISSION_LABELS[details.submissionState] ?? "")],
    ["\u8FDE\u63A5\u5C1D\u8BD5\u6B21\u6570", details.attempts],
    ["\u5F02\u5E38\u7C7B\u578B", details.errorTypes?.join(", ")],
    ["\u4E8C\u7EF4\u7801\u7F16\u7801\u5668", details.qrEncoder],
    ["\u4E8C\u7EF4\u7801\u56FE\u7247\u683C\u5F0F", details.qrRenderer],
    ["\u6700\u8FD1\u4E00\u6B21\u8FDE\u63A5\u5931\u8D25", localizeText(STREAM_REASON_LABELS[details.lastFailureReason] ?? details.lastFailureReason ?? "")],
    ["\u5E95\u5C42\u539F\u56E0", details.reason === "unknown" ? localizeText("\u6682\u672A\u8BC6\u522B") : details.reason],
    ["\u591A\u4E2A\u539F\u56E0", details.reasons?.join(", ")],
    ["\u670D\u52A1\u57DF\u540D", details.host],
    ["\u8BF7\u6C42\u8017\u65F6\uFF08\u6BEB\u79D2\uFF09", details.durationMs],
    ["\u8D85\u65F6\u9608\u503C\uFF08\u6BEB\u79D2\uFF09", details.timeoutMs],
    ["Node \u7248\u672C", details.nodeVersion],
    ["DSH \u7248\u672C", details.dshVersion],
    ["\u4F9D\u8D56\u7248\u672C", details.dependencies ? Object.entries(details.dependencies).map(([name2, version]) => `${name2}: ${version}`).join(", ") : void 0],
    ["\u4EE3\u7406\u5DF2\u914D\u7F6E", details.proxyConfigured],
    ["\u539F\u56E0\u94FE\u5DF2\u622A\u65AD", details.truncated],
    ["\u8FD0\u884C\u5E73\u53F0", details.platform],
    ["HTTP \u72B6\u6001", details.httpStatus],
    ["\u670D\u52A1\u8FD4\u56DE\u7801", details.providerCode],
    ["\u914D\u7F6E\u6587\u4EF6", details.file],
    ["\u914D\u7F6E\u5B57\u6BB5", details.field],
    ["\u6821\u9A8C\u539F\u56E0", details.issue ? localizeText(CONFIG_ISSUE_LABELS[details.issue]) : void 0],
    ["\u53C2\u8003\u53F7", details.referenceId],
    ["\u53D1\u751F\u65F6\u95F4", details.occurredAt],
    ["\u63D2\u4EF6\u7248\u672C", details.pluginVersion]
  ].filter(([, text3]) => text3 !== void 0 && text3 !== "");
  return h3(
    "div",
    { className: "dim-connectionDiagnostic", "data-connection-diagnostic": true, "data-weixin-diagnostic": details.channel === "weixin" || /^WX-CONN/.test(details.referenceId ?? "") || void 0, role: isWarning ? "status" : void 0, "data-warning": isWarning || void 0 },
    showMessage ? h3("p", null, error.message) : null,
    details.hint ? h3("p", null, details.hint) : null,
    h3(
      "details",
      { style: { marginTop: 8 } },
      h3("summary", { style: { cursor: "pointer" } }, "\u8BCA\u65AD\u8BE6\u60C5"),
      h3(
        "dl",
        { style: { display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "4px 12px", margin: "10px 0" } },
        ...fields.flatMap(([label, text3]) => [
          h3("dt", { key: `${label}-label` }, label),
          React4.createElement("dd", { key: label, style: { margin: 0, overflowWrap: "anywhere" } }, String(text3))
        ])
      ),
      !details.referenceId ? h3("p", null, "\u672A\u53D6\u5F97 Host \u8BCA\u65AD\u53C2\u8003\u53F7\u3002") : null,
      h3(
        "div",
        { className: "dim-viewActions" },
        h3("button", { type: "button", className: "dxw-button", onClick: copy }, copyState === "copied" ? "\u8BCA\u65AD\u4FE1\u606F\u5DF2\u590D\u5236" : "\u590D\u5236\u8BCA\u65AD\u4FE1\u606F")
      ),
      copyState === "manual" ? h3(
        "div",
        null,
        h3("p", null, "\u65E0\u6CD5\u8BBF\u95EE\u526A\u8D34\u677F\uFF0C\u8BF7\u9009\u62E9\u5E76\u590D\u5236\u4EE5\u4E0B\u8BCA\u65AD\u4FE1\u606F\u3002"),
        React4.createElement("textarea", {
          readOnly: true,
          value: formatConnectionDiagnostic(error),
          rows: 7,
          "aria-label": localizeText("\u8BCA\u65AD\u4FE1\u606F"),
          style: { width: "100%", boxSizing: "border-box", marginTop: 8 }
        })
      ) : null
    )
  );
}
function normalizeConnectionError(value, fallbackCode = "operation-failed", fallbackMessage = "\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u539F\u56E0\u548C\u8BCA\u65AD\u8BE6\u60C5\u3002") {
  const source = value && typeof value === "object" ? value : {};
  const text3 = (v, fallback, n) => typeof v === "string" && v.trim() ? v.trim().slice(0, n) : fallback;
  const details = normalizeDiagnosticDetails({
    ...source.details,
    referenceId: source.details?.referenceId ?? source.referenceId,
    hint: source.details?.hint ?? source.hint
  });
  return {
    code: text3(source.code, fallbackCode, 100),
    message: text3(source.message, fallbackMessage, 500),
    ...Object.keys(details).length ? { details } : {},
    ...source.hint ? { hint: details.hint } : {},
    ...source.referenceId ? { referenceId: details.referenceId } : {}
  };
}

// src/channels/shared/bot-alias.mjs
var MAX_BOT_ALIAS_LENGTH = 80;
function validateBotAlias(value) {
  if (typeof value !== "string" || value.trim().length > MAX_BOT_ALIAS_LENGTH || /[\u0000-\u001f\u007f]/u.test(value)) {
    throw new TypeError("\u522B\u540D\u4E0D\u80FD\u5305\u542B\u6362\u884C\u6216\u63A7\u5236\u5B57\u7B26\uFF0C\u4E14\u6700\u591A 80 \u4E2A\u5B57\u7B26\u3002");
  }
  return value.trim();
}
function normalizeBotAlias(bot) {
  try {
    const alias = validateBotAlias(bot?.alias);
    return alias && typeof bot.originalName === "string" ? { alias, originalName: bot.originalName } : {};
  } catch {
    return {};
  }
}

// plugin-src/client/agent-preset.js
var React5 = __toESM(require("react"), 1);
var SET_AGENT_PRESET_ENDPOINT = "bot.preset.set";
var PRESET_ID = /^[a-z0-9][a-z0-9-]*$/;
var EMPTY_AGENT_PRESET_CATALOG = Object.freeze({
  defaultId: "",
  items: Object.freeze([])
});
var AgentPresetCatalogContext = React5.createContext(EMPTY_AGENT_PRESET_CATALOG);
function normalizeAgentPresetId(value) {
  if (typeof value !== "string") return "";
  const id2 = value.trim();
  return PRESET_ID.test(id2) ? id2 : "";
}
function normalizeAgentPresetCatalog(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { defaultId: "", items: [] };
  }
  const items = [];
  const seen = /* @__PURE__ */ new Set();
  for (const entry of Array.isArray(value.items) ? value.items : []) {
    const id2 = typeof entry === "string" ? normalizeAgentPresetId(entry) : normalizeAgentPresetId(entry?.id);
    if (!id2 || seen.has(id2)) continue;
    seen.add(id2);
    const label = typeof entry?.label === "string" && entry.label.trim() ? entry.label.trim().slice(0, 128) : typeof entry?.name === "string" && entry.name.trim() ? entry.name.trim().slice(0, 128) : id2;
    items.push({ id: id2, label });
  }
  return {
    defaultId: normalizeAgentPresetId(value.defaultId),
    items
  };
}
function AgentPresetEditor({ agentPreset = "", disabled = false, onSave }) {
  const catalog = React5.useContext(AgentPresetCatalogContext) ?? EMPTY_AGENT_PRESET_CATALOG;
  const helpId = React5.useId();
  const current = normalizeAgentPresetId(agentPreset);
  const [saving, setSaving] = React5.useState(false);
  const [error, setError] = React5.useState(null);
  const items = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of Array.isArray(catalog.items) ? catalog.items : []) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
  }
  const currentUnavailable = Boolean(current && !seen.has(current));
  if (currentUnavailable) items.push({ id: current, label: current, unavailable: true });
  const inheritLabel = "\u8DDF\u968F Host \u9ED8\u8BA4";
  const change = async (event) => {
    const next = event.target.value;
    if (next === current || saving || disabled) return;
    setSaving(true);
    setError(null);
    try {
      await onSave?.(next || null);
    } catch (cause) {
      setError(cause?.message ?? "Agent Preset \u4FEE\u6539\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    } finally {
      setSaving(false);
    }
  };
  return h3(
    "div",
    { className: "dim-preset" },
    h3(
      "div",
      { className: "dim-presetHeader" },
      h3(
        "span",
        { className: "dim-presetTitle" },
        h3("span", null, "Agent Preset"),
        h3(
          "span",
          { className: "dim-presetHelp" },
          h3("button", {
            type: "button",
            className: "dim-presetHelpButton",
            "aria-label": "\u67E5\u770B Agent Preset \u8BF4\u660E",
            "aria-describedby": helpId
          }, h3("span", { "aria-hidden": "true" }, "?")),
          h3("span", {
            id: helpId,
            className: "dim-presetTooltip",
            role: "tooltip"
          }, "\u53EA\u5F71\u54CD\u65B0\u5EFA\u4F1A\u8BDD\uFF1B\u82E5\u5F53\u524D\u804A\u5929\u5DF2\u6709\u4F1A\u8BDD\uFF0C\u5148\u53D1\u9001 /new\uFF0C\u518D\u53D1\u9001\u666E\u901A\u6D88\u606F\u751F\u6548\u3002")
        )
      ),
      saving ? h3("span", { className: "dim-presetStatus" }, "\u4FDD\u5B58\u4E2D\u2026") : null
    ),
    React5.createElement(
      "select",
      {
        className: "dim-presetSelect",
        value: current,
        disabled: disabled || saving,
        "aria-label": "Agent Preset",
        onChange: (event) => {
          void change(event);
        }
      },
      h3("option", { value: "" }, inheritLabel),
      ...items.map((item) => h3(
        "option",
        { key: item.id, value: item.id },
        item.unavailable ? [item.id, "\uFF08\u5DF2\u4E0D\u53EF\u7528\uFF09"] : item.label && item.label !== item.id ? `${item.label}\uFF08${item.id}\uFF09` : item.id
      ))
    ),
    error || currentUnavailable ? h3(
      "p",
      { className: "dim-presetError", role: error ? "alert" : "status" },
      error ?? "\u5F53\u524D Agent Preset \u5DF2\u4E0D\u53EF\u7528\uFF0C\u8BF7\u9009\u62E9\u5176\u4ED6 Preset \u6216\u8DDF\u968F Host \u9ED8\u8BA4\u3002"
    ) : null
  );
}

// plugin-src/client/model-setting.js
var React6 = __toESM(require("react"), 1);

// src/channels/shared/model-setting.mjs
var MAX_PROVIDER_ID_LENGTH = 256;
var MAX_MODEL_ID_LENGTH = 1024;
var MAX_EFFORT_ID_LENGTH = 256;
var MAX_LABEL_LENGTH = 256;
var UNSAFE_DISPLAY_TEXT = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]+/gu;
var UNSAFE_ID_TEXT = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
function cleanId(value, maxLength) {
  if (typeof value !== "string") return "";
  const id2 = value.trim();
  if (!id2 || id2.length > maxLength || UNSAFE_ID_TEXT.test(id2)) return "";
  return id2;
}
function cleanLabel(value, fallback) {
  if (typeof value !== "string") return fallback;
  const label = value.replace(UNSAFE_DISPLAY_TEXT, " ").replace(/\s+/gu, " ").trim();
  return label ? label.slice(0, MAX_LABEL_LENGTH) : fallback;
}
var EMPTY_MODEL_CATALOG = Object.freeze({
  groups: Object.freeze([]),
  failures: Object.freeze([])
});
function normalizeModelSelection(value) {
  if (value == null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const provider = cleanId(value.provider, MAX_PROVIDER_ID_LENGTH);
  const model = cleanId(value.model, MAX_MODEL_ID_LENGTH);
  const reasoningEffort = value.reasoningEffort === void 0 ? void 0 : cleanId(value.reasoningEffort, MAX_EFFORT_ID_LENGTH);
  if (!provider || !model || reasoningEffort === "") return null;
  return { provider, model, ...reasoningEffort === void 0 ? {} : { reasoningEffort } };
}
function sameModelSelection(left, right) {
  return left?.provider === right?.provider && left?.model === right?.model && left?.reasoningEffort === right?.reasoningEffort;
}
function normalizeReasoning(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.efforts)) return void 0;
  const efforts = [];
  const seen = /* @__PURE__ */ new Set();
  for (const entry of value.efforts) {
    const id2 = cleanId(entry?.id, MAX_EFFORT_ID_LENGTH);
    if (!id2 || seen.has(id2)) continue;
    seen.add(id2);
    const description = cleanLabel(entry.description, "");
    efforts.push({ id: id2, name: cleanLabel(entry.name, id2), ...description ? { description } : {} });
  }
  if (!efforts.length) return void 0;
  const defaultEffort = cleanId(value.defaultEffort, MAX_EFFORT_ID_LENGTH);
  return { efforts, ...seen.has(defaultEffort) ? { defaultEffort } : {} };
}
function modelSelectionId(value) {
  const selection = normalizeModelSelection(value);
  return selection ? `${selection.provider}/${selection.model}` : "";
}
function normalizeModelCatalog(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { groups: [], failures: [] };
  }
  const groups = [];
  const seen = /* @__PURE__ */ new Set();
  for (const candidate of Array.isArray(value.groups) ? value.groups : []) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const provider = cleanId(candidate.id, MAX_PROVIDER_ID_LENGTH);
    if (!provider) continue;
    const models = [];
    for (const entry of Array.isArray(candidate.models) ? candidate.models : []) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
      const model = cleanId(entry.id, MAX_MODEL_ID_LENGTH);
      if (!model) continue;
      const key = `${provider}\0${model}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const description = cleanLabel(entry.description, "");
      const reasoning = normalizeReasoning(entry.reasoning);
      models.push({
        id: model,
        name: cleanLabel(entry.name, model),
        ...description ? { description } : {},
        ...reasoning ? { reasoning } : {}
      });
    }
    if (models.length > 0) {
      groups.push({
        id: provider,
        name: cleanLabel(candidate.name, provider),
        models
      });
    }
  }
  const failures = [];
  for (const candidate of Array.isArray(value.failures) ? value.failures : []) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const id2 = cleanId(candidate.id, MAX_PROVIDER_ID_LENGTH);
    if (!id2) continue;
    failures.push({ id: id2, name: cleanLabel(candidate.name, id2) });
  }
  return { groups, failures };
}
function modelCatalogEntry(catalog, selection) {
  const normalized = normalizeModelSelection(selection);
  if (!normalized) return void 0;
  return normalizeModelCatalog(catalog).groups.filter((group) => group.id === normalized.provider).flatMap((group) => group.models).find((model) => model.id === normalized.model);
}

// plugin-src/client/model-setting.js
var SET_MODEL_ENDPOINT = "bot.model.set";
var ModelCatalogContext = React6.createContext(EMPTY_MODEL_CATALOG);
function chevron(open = false) {
  return h3(
    "svg",
    {
      width: 14,
      height: 14,
      viewBox: "0 0 16 16",
      "aria-hidden": true,
      className: "dim-modelChevron",
      style: open ? { transform: "rotate(90deg)" } : void 0
    },
    h3("path", { d: "m6 4 4 4-4 4", fill: "none", stroke: "currentColor", strokeWidth: 1.5 })
  );
}
function ModelEditor({ model = null, disabled = false, onSave }) {
  const catalog = normalizeModelCatalog(React6.useContext(ModelCatalogContext));
  const id2 = React6.useId();
  const rootRef = React6.useRef(null);
  const menuRef = React6.useRef(null);
  const triggerRef = React6.useRef(null);
  const restoreFocusRef = React6.useRef(false);
  const savingRef = React6.useRef(false);
  const [pane, setPane] = React6.useState(null);
  const [saving, setSaving] = React6.useState(false);
  const [error, setError] = React6.useState(null);
  const current = normalizeModelSelection(model);
  const entry = modelCatalogEntry(catalog, current);
  const currentAvailable = !current || Boolean(entry);
  const reasoning = entry?.reasoning;
  const effort = current?.reasoningEffort;
  const effectiveEffort = effort ?? reasoning?.defaultEffort;
  const effortEntry = reasoning?.efforts.find((level) => level.id === effectiveEffort);
  const effortUnavailable = effort !== void 0 && !reasoning?.efforts.some((level) => level.id === effort);
  const defaultName = reasoning?.efforts.find((level) => level.id === reasoning.defaultEffort)?.name;
  const defaultLabel = localizeText("\u8DDF\u968F\u6A21\u578B\u9ED8\u8BA4") + (defaultName ? ` \xB7 ${defaultName}` : "");
  const effortLabel = !current ? localizeText("\u8DDF\u968F\u9ED8\u8BA4\u6A21\u578B") : effort === void 0 ? defaultLabel : effortEntry?.name ?? effort;
  const effortHint = !current ? "\u5148\u9009\u62E9\u6A21\u578B\uFF0C\u518D\u8BBE\u7F6E\u601D\u8003\u5F3A\u5EA6\u3002" : !currentAvailable ? null : effortUnavailable ? "\u5DF2\u4FDD\u5B58\u7684\u601D\u8003\u5F3A\u5EA6\u5DF2\u4E0D\u53EF\u7528\uFF0C\u8BF7\u9009\u62E9\u5176\u4ED6\u5F3A\u5EA6\u6216\u6062\u590D\u9ED8\u8BA4\u3002" : !reasoning ? "\u8BE5\u6A21\u578B\u672A\u63D0\u4F9B\u53EF\u8C03\u8282\u7684\u601D\u8003\u5F3A\u5EA6\u3002" : null;
  const effortDisabled = !current || !currentAvailable || !reasoning && effort === void 0;
  const close = (restoreFocus = false) => {
    restoreFocusRef.current = restoreFocus;
    setPane(null);
  };
  React6.useEffect(() => {
    if (!pane && !saving && !disabled && restoreFocusRef.current) {
      restoreFocusRef.current = false;
      triggerRef.current?.focus();
    }
  }, [pane, saving, disabled]);
  React6.useEffect(() => {
    if (!pane) return void 0;
    const options = menuRef.current?.querySelectorAll('[role="menuitemradio"]');
    const selected = menuRef.current?.querySelector('[aria-checked="true"]');
    (selected ?? options?.[0])?.focus();
    const outside = (event) => {
      if (!rootRef.current?.contains(event.target)) setPane(null);
    };
    globalThis.document?.addEventListener("mousedown", outside);
    return () => globalThis.document?.removeEventListener("mousedown", outside);
  }, [pane]);
  const save = async (next) => {
    if (savingRef.current || disabled) return;
    if (sameModelSelection(current, next)) {
      close(true);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      await onSave?.(next);
      close(true);
    } catch (cause) {
      setError(cause?.message ?? "\u6A21\u578B\u4FEE\u6539\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  const option = (key, label, description, selected, next) => h3(
    "button",
    {
      key,
      type: "button",
      role: "menuitemradio",
      "aria-checked": selected,
      className: "dim-modelOption",
      disabled: disabled || saving,
      onClick: () => {
        void save(next);
      }
    },
    h3(
      "span",
      { className: "dim-modelOptionCopy" },
      h3("span", { className: "dim-modelOptionName" }, label),
      description ? h3("span", { className: "dim-modelDescription" }, description) : null
    ),
    h3("span", { className: "dim-modelCheck", "aria-hidden": true }, selected ? "\u2713" : "")
  );
  const row = (key, label, value, blocked = false) => h3(
    "button",
    {
      type: "button",
      className: "dim-modelRow",
      disabled: disabled || saving || blocked,
      "aria-label": label,
      "aria-haspopup": "menu",
      "aria-expanded": pane === key,
      "aria-controls": pane === key ? `${id2}-menu` : void 0,
      "aria-describedby": key === "effort" && effortHint ? `${id2}-hint` : void 0,
      onClick: (event) => {
        triggerRef.current = event.currentTarget;
        setPane(pane === key ? null : key);
      }
    },
    h3("span", { className: "dim-modelRowLabel" }, label),
    h3("span", { className: "dim-modelValue", title: value }, value),
    chevron(pane === key)
  );
  return h3(
    "div",
    {
      ref: rootRef,
      className: "dim-preset dim-modelSetting",
      onBlur: (event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close();
      },
      onKeyDown: (event) => {
        if (!pane) return;
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          close(true);
        }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        const items = [...menuRef.current?.querySelectorAll('[role="menuitemradio"]:not(:disabled)') ?? []];
        if (!items.length) return;
        event.preventDefault();
        const at = items.indexOf(globalThis.document?.activeElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (at + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items[next]?.focus();
      }
    },
    h3(
      "div",
      { className: "dim-presetHeader" },
      h3(
        "span",
        { className: "dim-presetTitle" },
        "\u6A21\u578B\u4E0E\u601D\u8003\u5F3A\u5EA6",
        h3(
          "span",
          { className: "dim-presetHelp" },
          h3(
            "button",
            {
              type: "button",
              className: "dim-presetHelpButton",
              "aria-label": "\u67E5\u770B\u6A21\u578B\u8BBE\u7F6E\u8BF4\u660E",
              "aria-describedby": `${id2}-help`
            },
            h3("span", { "aria-hidden": true }, "?")
          ),
          h3(
            "span",
            { id: `${id2}-help`, className: "dim-presetTooltip", role: "tooltip" },
            effortHint && !effortUnavailable ? h3("span", { id: `${id2}-hint` }, effortHint, " ") : null,
            "\u53EA\u5F71\u54CD\u65B0\u5EFA\u4F1A\u8BDD\uFF1B\u82E5\u5F53\u524D\u804A\u5929\u5DF2\u6709\u4F1A\u8BDD\uFF0C\u5148\u53D1\u9001 /new\uFF0C\u518D\u53D1\u9001\u666E\u901A\u6D88\u606F\u751F\u6548\u3002"
          )
        )
      ),
      saving ? h3("span", { className: "dim-presetStatus", role: "status" }, "\u4FDD\u5B58\u4E2D\u2026") : null
    ),
    row("model", "\u6A21\u578B", entry?.name ?? (current ? modelSelectionId(current) : localizeText("\u8DDF\u968F\u9ED8\u8BA4\u6A21\u578B"))),
    row("effort", "\u601D\u8003\u5F3A\u5EA6", effortLabel, effortDisabled),
    pane ? h3(
      "div",
      {
        ref: menuRef,
        id: `${id2}-menu`,
        role: "menu",
        "aria-label": pane === "model" ? "\u6A21\u578B" : "\u601D\u8003\u5F3A\u5EA6",
        "aria-busy": saving,
        className: "dim-modelMenu"
      },
      pane === "model" ? [
        option("default", "\u8DDF\u968F\u9ED8\u8BA4\u6A21\u578B", null, !current, null),
        ...catalog.groups.map((group) => h3(
          "section",
          { key: group.id, role: "group", "aria-label": group.name },
          h3("div", { className: "dim-modelGroupTitle" }, group.name),
          ...group.models.map((choice) => {
            const selected = current?.provider === group.id && current?.model === choice.id;
            return option(
              choice.id,
              choice.name,
              choice.description ?? `${group.id}/${choice.id}`,
              selected,
              selected ? current : { provider: group.id, model: choice.id }
            );
          })
        ))
      ] : [
        option(
          "provider-default",
          defaultLabel,
          "\u4F7F\u7528\u6A21\u578B\u6216\u670D\u52A1\u63D0\u4F9B\u65B9\u7684\u9ED8\u8BA4\u601D\u8003\u5F3A\u5EA6\u3002",
          effort === void 0,
          current ? { provider: current.provider, model: current.model } : null
        ),
        ...(reasoning?.efforts ?? []).map((level) => option(
          `effort:${level.id}`,
          level.name,
          level.description,
          effort === level.id,
          { ...current, reasoningEffort: level.id }
        ))
      ]
    ) : null,
    effortHint && effortUnavailable ? h3("p", {
      id: `${id2}-hint`,
      className: "dim-modelHint",
      role: "status"
    }, effortHint) : null,
    error || !currentAvailable ? h3(
      "p",
      { className: "dim-presetError", role: error ? "alert" : "status" },
      error ?? "\u5F53\u524D\u6A21\u578B\u5DF2\u4E0D\u53EF\u7528\uFF0C\u8BF7\u9009\u62E9\u5176\u4ED6\u6A21\u578B\u6216\u8DDF\u968F\u9ED8\u8BA4\u6A21\u578B\u3002"
    ) : null
  );
}

// plugin-src/client/last-message-error.js
function text(value, maxLength) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}
function normalizeLastMessageError(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const code = text(value.code, 64);
  const reason = text(value.reason, 64);
  const message = text(value.message, 500);
  const referenceId = text(value.referenceId, 40);
  const at = Number.isFinite(value.at) ? value.at : null;
  return code && reason && message && referenceId && at !== null ? { code, reason, message, referenceId, at, ...value.details ? diagnosticFields(value) : {} } : null;
}

// src/channels/shared/access-policy.mjs
var ACCESS_POLICY_MODES = Object.freeze(["open", "allowlist"]);
var ACCESS_POLICY_CONVERSATION_TYPES = Object.freeze(["direct", "group"]);
var ACCESS_POLICY_USER_ID_MAX_LENGTH = 256;
var POLICY_KEYS = ["direct", "group"];
var SCOPE_KEYS = ["mode", "open", "allowlist"];
var OPEN_KEYS = ["defaultCanExecuteCommands", "commandPermissionOverrides"];
var ALLOWLIST_KEYS = ["users"];
var USER_KEYS = ["id", "canExecuteCommands"];
var CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/;
function invalidAccessPolicy(message) {
  const error = new TypeError(message);
  error.code = "access-policy-invalid";
  return error;
}
function hasExactKeys(input, keys) {
  return input && typeof input === "object" && !Array.isArray(input) && [Object.prototype, null].includes(Object.getPrototypeOf(input)) && Reflect.ownKeys(input).length === keys.length && keys.every((key) => Object.hasOwn(input, key));
}
function normalizeAccessPolicyUserId(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw invalidAccessPolicy("\u7528\u6237\u6807\u8BC6\u65E0\u6548\u3002");
    value = String(value);
  } else if (typeof value === "bigint") {
    value = String(value);
  }
  if (typeof value !== "string") throw invalidAccessPolicy("\u7528\u6237\u6807\u8BC6\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u3002");
  const id2 = value.trim();
  if (!id2 || id2.length > ACCESS_POLICY_USER_ID_MAX_LENGTH || CONTROL_CHARACTERS.test(id2)) {
    throw invalidAccessPolicy(`\u7528\u6237\u6807\u8BC6\u4E0D\u80FD\u4E3A\u7A7A\u3001\u5305\u542B\u63A7\u5236\u5B57\u7B26\u6216\u8D85\u8FC7 ${ACCESS_POLICY_USER_ID_MAX_LENGTH} \u4E2A\u5B57\u7B26\u3002`);
  }
  return id2;
}
function validateAccessPolicyUser(input) {
  if (!hasExactKeys(input, USER_KEYS)) {
    throw invalidAccessPolicy("\u7528\u6237\u6761\u76EE\u5FC5\u987B\u5305\u542B\u7528\u6237\u6807\u8BC6\u548C\u547D\u4EE4\u6743\u9650\u3002");
  }
  if (typeof input.canExecuteCommands !== "boolean") {
    throw invalidAccessPolicy("\u547D\u4EE4\u6743\u9650\u5FC5\u987B\u662F\u5E03\u5C14\u503C\u3002");
  }
  return Object.freeze({
    id: normalizeAccessPolicyUserId(input.id),
    canExecuteCommands: input.canExecuteCommands
  });
}
function validateUsers(input, { listMessage, duplicateMessage }) {
  if (!Array.isArray(input)) throw invalidAccessPolicy(listMessage);
  const users = input.map(validateAccessPolicyUser);
  if (new Set(users.map(({ id: id2 }) => id2)).size !== users.length) {
    throw invalidAccessPolicy(duplicateMessage);
  }
  return Object.freeze(users);
}
function validateOpenSettings(input) {
  if (!hasExactKeys(input, OPEN_KEYS)) {
    throw invalidAccessPolicy("\u5F00\u653E\u6A21\u5F0F\u8BBE\u7F6E\u5FC5\u987B\u5B8C\u6574\u3002");
  }
  if (typeof input.defaultCanExecuteCommands !== "boolean") {
    throw invalidAccessPolicy("\u5F00\u653E\u6A21\u5F0F\u9ED8\u8BA4\u547D\u4EE4\u6743\u9650\u5FC5\u987B\u662F\u5E03\u5C14\u503C\u3002");
  }
  return Object.freeze({
    defaultCanExecuteCommands: input.defaultCanExecuteCommands,
    commandPermissionOverrides: validateUsers(input.commandPermissionOverrides, {
      listMessage: "\u5F00\u653E\u6A21\u5F0F\u547D\u4EE4\u6743\u9650\u8986\u76D6\u7528\u6237\u5FC5\u987B\u662F\u6570\u7EC4\u3002",
      duplicateMessage: "\u5F00\u653E\u6A21\u5F0F\u547D\u4EE4\u6743\u9650\u8986\u76D6\u7528\u6237\u4E0D\u80FD\u5305\u542B\u91CD\u590D\u7684\u7528\u6237\u6807\u8BC6\u3002"
    })
  });
}
function validateAllowlistSettings(input) {
  if (!hasExactKeys(input, ALLOWLIST_KEYS)) {
    throw invalidAccessPolicy("\u767D\u540D\u5355\u6A21\u5F0F\u8BBE\u7F6E\u5FC5\u987B\u5B8C\u6574\u3002");
  }
  return Object.freeze({
    users: validateUsers(input.users, {
      listMessage: "\u767D\u540D\u5355\u6A21\u5F0F\u7528\u6237\u5FC5\u987B\u662F\u6570\u7EC4\u3002",
      duplicateMessage: "\u767D\u540D\u5355\u6A21\u5F0F\u7528\u6237\u4E0D\u80FD\u5305\u542B\u91CD\u590D\u7684\u7528\u6237\u6807\u8BC6\u3002"
    })
  });
}
function validateAccessPolicyScope(input) {
  if (!hasExactKeys(input, SCOPE_KEYS)) {
    throw invalidAccessPolicy("\u8BBF\u95EE\u573A\u666F\u8BBE\u7F6E\u5FC5\u987B\u540C\u65F6\u5305\u542B\u6A21\u5F0F\u3001\u5F00\u653E\u6A21\u5F0F\u8BBE\u7F6E\u548C\u767D\u540D\u5355\u6A21\u5F0F\u8BBE\u7F6E\u3002");
  }
  if (!ACCESS_POLICY_MODES.includes(input.mode)) {
    throw invalidAccessPolicy("\u8BBF\u95EE\u6A21\u5F0F\u53EA\u80FD\u662F open \u6216 allowlist\u3002");
  }
  return Object.freeze({
    mode: input.mode,
    open: validateOpenSettings(input.open),
    allowlist: validateAllowlistSettings(input.allowlist)
  });
}
function validateAccessPolicy(input) {
  if (!hasExactKeys(input, POLICY_KEYS)) {
    throw invalidAccessPolicy("\u8BF7\u540C\u65F6\u63D0\u4EA4\u5B8C\u6574\u7684\u79C1\u804A\u548C\u7FA4\u804A\u8BBF\u95EE\u8BBE\u7F6E\u3002");
  }
  return Object.freeze({
    direct: validateAccessPolicyScope(input.direct),
    group: validateAccessPolicyScope(input.group)
  });
}
function normalizeAccessPolicy(input) {
  try {
    return validateAccessPolicy(input);
  } catch {
    return null;
  }
}
function createAccessPolicyScope(options) {
  return validateAccessPolicyScope(options === void 0 ? {
    mode: "allowlist",
    open: {
      defaultCanExecuteCommands: false,
      commandPermissionOverrides: []
    },
    allowlist: { users: [] }
  } : options);
}
var DENY_SCOPE = createAccessPolicyScope();
var DEFAULT_ACCESS_POLICY = Object.freeze({
  direct: DENY_SCOPE,
  group: DENY_SCOPE
});
var ALLOWED = Object.freeze({ allowed: true, reason: "allowed" });
var POLICY_UNAVAILABLE = Object.freeze({ allowed: false, reason: "policy-unavailable" });
var INVALID_CONTEXT = Object.freeze({ allowed: false, reason: "invalid-context" });
var SENDER_UNAVAILABLE = Object.freeze({ allowed: false, reason: "sender-unavailable" });
var SENDER_NOT_ALLOWED = Object.freeze({ allowed: false, reason: "sender-not-allowed" });
var COMMAND_NOT_ALLOWED = Object.freeze({ allowed: false, reason: "command-not-allowed" });

// src/channels/shared/context-enhancement.mjs
var CONTEXT_ENHANCEMENT_FIELDS = Object.freeze([
  "channel",
  "conversationType",
  "senderId",
  "senderName",
  "conversationTitle",
  "chatId",
  "threadId",
  "botId",
  "sentAt"
]);
var INJECTED_CONTEXT_TAGS = Object.freeze({
  sourceOpen: "<dsh_im_source>",
  sourceClose: "</dsh_im_source>",
  guidanceOpen: "<dsh_im_source_guidance>",
  guidanceClose: "</dsh_im_source_guidance>",
  replyOpen: "<dsh_im_reply_to>",
  replyClose: "</dsh_im_reply_to>",
  contextOpen: "<dsh_im_context>",
  contextClose: "</dsh_im_context>"
});
var CONTEXT_ENHANCEMENT_GUIDANCE_MAX_LENGTH = 8e3;
var CONTEXT_GROUP_GUIDANCE_EXAMPLE = `\u4EC5\u4F9D\u636E\u5F53\u524D\u6D88\u606F\u7684 <dsh_im_source> \u4E2D\u5B9E\u9645\u63D0\u4F9B\u7684\u5B57\u6BB5\u7406\u89E3\u6765\u6E90\uFF1B\u6CA1\u6709\u63D0\u4F9B\u7684\u5B57\u6BB5\u4E0D\u8981\u731C\u6D4B\u6216\u8865\u5168\u3002
\u5F53\u524D\u6D88\u606F\u6765\u81EA\u7FA4\u804A\uFF0C\u8BF7\u4F7F\u7528\u4E25\u8083\u3001\u514B\u5236\u3001\u7B80\u6D01\u7684\u8868\u8FBE\u65B9\u5F0F\u3002`;
var CONTEXT_DIRECT_GUIDANCE_EXAMPLE = `\u4EC5\u4F9D\u636E\u5F53\u524D\u6D88\u606F\u7684 <dsh_im_source> \u4E2D\u5B9E\u9645\u63D0\u4F9B\u7684\u5B57\u6BB5\u7406\u89E3\u6765\u6E90\uFF1B\u6CA1\u6709\u63D0\u4F9B\u7684\u5B57\u6BB5\u4E0D\u8981\u731C\u6D4B\u6216\u8865\u5168\u3002
\u5F53\u524D\u6D88\u606F\u6765\u81EA\u79C1\u804A\uFF0C\u53EF\u4EE5\u4F7F\u7528\u66F4\u8F7B\u677E\u3001\u5E7D\u9ED8\u3001\u8BE6\u7EC6\u7684\u8868\u8FBE\u65B9\u5F0F\u3002`;
var DEFAULT_CONTEXT_ENHANCEMENT_CONFIG = Object.freeze({
  group: Object.freeze({
    enabled: false,
    fields: Object.freeze(["senderId"]),
    guidance: ""
  }),
  direct: Object.freeze({
    enabled: false,
    fields: Object.freeze(["senderId"]),
    guidance: ""
  })
});
var CONFIG_KEYS = ["group", "direct"];
var SCOPE_KEYS2 = ["enabled", "fields", "guidance"];
var LEGACY_CONFIG_KEYS = ["groupEnabled", "directEnabled", "fields", "guidance"];
function invalidConfig(message) {
  const error = new TypeError(message);
  error.code = "context-enhancement-invalid";
  return error;
}
function hasExactKeys2(input, keys) {
  return input && typeof input === "object" && !Array.isArray(input) && [Object.prototype, null].includes(Object.getPrototypeOf(input)) && Reflect.ownKeys(input).length === keys.length && keys.every((key) => Object.hasOwn(input, key));
}
function validateContextEnhancementScope(input) {
  if (!hasExactKeys2(input, SCOPE_KEYS2)) {
    throw invalidConfig("\u8BF7\u63D0\u4EA4\u5B8C\u6574\u7684\u4E0A\u4E0B\u6587\u589E\u5F3A\u8BBE\u7F6E\u3002");
  }
  const { enabled, fields, guidance } = input;
  if (typeof enabled !== "boolean") {
    throw invalidConfig("\u7FA4\u804A\u548C\u79C1\u804A\u5F00\u5173\u5FC5\u987B\u662F\u5E03\u5C14\u503C\u3002");
  }
  if (!Array.isArray(fields) || ![...fields].every((field) => CONTEXT_ENHANCEMENT_FIELDS.includes(field))) {
    throw invalidConfig("\u6765\u6E90\u5B57\u6BB5\u53EA\u80FD\u9009\u62E9\u5DF2\u5B9A\u4E49\u7684\u5B57\u6BB5\u3002");
  }
  if (typeof guidance !== "string" || guidance.length > CONTEXT_ENHANCEMENT_GUIDANCE_MAX_LENGTH) {
    throw invalidConfig(`\u589E\u5F3A\u63D0\u793A\u8BCD\u4E0D\u5F97\u8D85\u8FC7 ${CONTEXT_ENHANCEMENT_GUIDANCE_MAX_LENGTH} \u4E2A\u5B57\u7B26\u3002`);
  }
  return Object.freeze({
    enabled,
    fields: Object.freeze(CONTEXT_ENHANCEMENT_FIELDS.filter((field) => fields.includes(field))),
    guidance: guidance.trim() ? guidance : ""
  });
}
function validateContextEnhancementConfig(input) {
  if (!hasExactKeys2(input, CONFIG_KEYS)) {
    throw invalidConfig("\u8BF7\u63D0\u4EA4\u5B8C\u6574\u7684\u4E0A\u4E0B\u6587\u589E\u5F3A\u8BBE\u7F6E\u3002");
  }
  return Object.freeze({
    group: validateContextEnhancementScope(input.group),
    direct: validateContextEnhancementScope(input.direct)
  });
}
function migrateLegacyContextEnhancementConfig(input) {
  if (!hasExactKeys2(input, LEGACY_CONFIG_KEYS)) {
    throw invalidConfig("\u8BF7\u63D0\u4EA4\u5B8C\u6574\u7684\u4E0A\u4E0B\u6587\u589E\u5F3A\u8BBE\u7F6E\u3002");
  }
  return validateContextEnhancementConfig({
    group: {
      enabled: input.groupEnabled,
      fields: input.fields,
      guidance: input.guidance
    },
    direct: {
      enabled: input.directEnabled,
      fields: input.fields,
      guidance: input.guidance
    }
  });
}
function normalizeContextEnhancementConfig(input) {
  try {
    return validateContextEnhancementConfig(input);
  } catch {
    try {
      return migrateLegacyContextEnhancementConfig(input);
    } catch {
      return DEFAULT_CONTEXT_ENHANCEMENT_CONFIG;
    }
  }
}

// plugin-src/client/channels/qq/api.js
var QQ_RPC_CHANNEL = "/qq";
var QQ_ENDPOINTS = Object.freeze({
  status: "connection.status",
  beginProvisioning: "provision.begin",
  pollProvisioning: "provision.poll",
  cancelProvisioning: "provision.cancel",
  bindCredentials: "bot.bind-credentials",
  reconnectBot: "bot.reconnect",
  deleteBot: "bot.delete",
  setWorkspace: "bot.workspace.set",
  setModel: SET_MODEL_ENDPOINT,
  setAgentPreset: SET_AGENT_PRESET_ENDPOINT,
  setContextEnhancement: "bot.context-enhancement.set",
  setBusyMessageMode: "bot.message-mode.set",
  setAccessPolicy: "bot.access-policy.set",
  setAlias: "bot.alias.set"
});
var PROVISION_STATES = /* @__PURE__ */ new Set(["starting", "pending", "refreshing", "connecting", "connected", "failed", "cancelled"]);
var ACCOUNT_STATES = /* @__PURE__ */ new Set(["connected", "connecting", "offline", "error"]);
var TEST_MESSAGE_CODES = /* @__PURE__ */ new Set(["test-target-unavailable", "test-message-failed"]);
var QR_DATA_URL = /^data:image\/(?:png|webp);base64,[a-z\d+/]+={0,2}$/i;
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function text2(value, fallback, max = 240) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback;
}
function id(value) {
  const result2 = text2(value, "", 128);
  return /^[a-z\d_-]+$/i.test(result2) ? result2 : void 0;
}
function timestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = typeof value === "string" ? Date.parse(value) : Number.NaN;
  return Number.isNaN(parsed) ? void 0 : parsed;
}
function unwrapRpcResult(result2) {
  if (!isRecord(result2) || typeof result2.ok !== "boolean") throw new Error("QQ \u670D\u52A1\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94");
  if (!result2.ok) {
    const error = new Error(text2(result2.error?.message, "QQ \u64CD\u4F5C\u5931\u8D25"));
    error.code = text2(result2.error?.code, "QQ_RPC_ERROR", 80);
    Object.assign(error, diagnosticFields(result2.error));
    throw error;
  }
  return result2.value;
}
function safeQrSource(value) {
  return typeof value === "string" && value.length <= 2 * 1024 * 1024 && QR_DATA_URL.test(value) ? value : void 0;
}
function normalizeProvisioning(value, now = Date.now()) {
  const source = isRecord(value?.provisioning) ? value.provisioning : value;
  if (!isRecord(source)) throw new Error("QQ \u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u626B\u7801\u7ED1\u5B9A\u8FDB\u5EA6");
  const attemptId = id(source.attemptId);
  if (!attemptId) throw new Error("QQ \u626B\u7801\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u7ED1\u5B9A\u4EFB\u52A1");
  const reported = text2(source.status, "failed", 32);
  const result2 = {
    attemptId,
    status: PROVISION_STATES.has(reported) ? reported : "failed",
    expiresAt: timestamp(source.expiresAt) ?? now + 5 * 6e4,
    pollIntervalMs: Math.min(1e4, Math.max(500, Number(source.pollIntervalMs) || 1e3)),
    qrRevision: Number.isSafeInteger(source.qrRevision) ? source.qrRevision : 0
  };
  const qrCodeDataUrl = safeQrSource(source.qrCodeDataUrl);
  if (qrCodeDataUrl) result2.qrCodeDataUrl = qrCodeDataUrl;
  if (id(source.botId)) result2.botId = id(source.botId);
  if (isRecord(source.error)) result2.error = {
    ...diagnosticFields(source.error),
    code: text2(source.error.code, "QQ_PROVISION_FAILED", 80),
    message: text2(source.error.message, "QQ \u673A\u5668\u4EBA\u6CA1\u6709\u63A5\u5165\u5B8C\u6210")
  };
  return result2;
}
function normalizeBot(value) {
  if (!isRecord(value) || !id(value.botId)) return void 0;
  const connected = value.connected === true;
  const state = ACCOUNT_STATES.has(value.state) ? value.state : "offline";
  return {
    botId: id(value.botId),
    connected,
    state: connected ? "connected" : state,
    workspace: text2(value.workspace, "", 4096),
    model: normalizeModelSelection(value.model),
    agentPreset: normalizeAgentPresetId(value.agentPreset),
    busyMessageMode: normalizeBusyMessageMode(value.busyMessageMode),
    contextEnhancement: normalizeContextEnhancementConfig(value.contextEnhancement),
    ...Object.hasOwn(value, "accessPolicy") ? { accessPolicy: normalizeAccessPolicy(value.accessPolicy) } : {},
    bot: {
      ...normalizeBotAlias(value.bot),
      name: text2(value.bot?.name, "QQ\u673A\u5668\u4EBA", 100),
      appIdMasked: text2(value.bot?.appIdMasked, "\u5E94\u7528\u6807\u8BC6\u5DF2\u5B89\u5168\u4FDD\u5B58", 140)
    },
    health: {
      summary: text2(value.health?.summary, connected ? "QQ WebSocket \u957F\u8FDE\u63A5\u8FD0\u884C\u6B63\u5E38" : "QQ \u8FDE\u63A5\u5C1A\u672A\u5C31\u7EEA"),
      lastCheckedAt: timestamp(value.health?.lastCheckedAt)
    },
    lastMessageError: normalizeLastMessageError(value.lastMessageError),
    error: isRecord(value.error) ? {
      ...diagnosticFields(value.error),
      code: text2(value.error.code, "QQ_ACCOUNT_ERROR", 80),
      message: text2(value.error.message, "QQ \u8FDE\u63A5\u5C1A\u672A\u5C31\u7EEA")
    } : null
  };
}
function normalizeTestMessage(value) {
  if (!isRecord(value) || typeof value.sent !== "boolean") return void 0;
  if (value.sent) return { sent: true };
  const code = text2(value.code, "test-message-failed", 80);
  return {
    sent: false,
    ...value.error ? { error: normalizeConnectionError(value.error) } : {},
    code: TEST_MESSAGE_CODES.has(code) ? code : "test-message-failed"
  };
}
function normalizeSnapshot(value) {
  const source = isRecord(value?.snapshot) ? value.snapshot : value;
  if (!isRecord(source) || !Array.isArray(source.bots)) throw new Error("QQ \u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u7684\u673A\u5668\u4EBA\u5217\u8868");
  const bots = source.bots.map(normalizeBot).filter(Boolean);
  const testMessage = normalizeTestMessage(source.testMessage);
  return {
    revision: Number.isSafeInteger(source.revision) ? source.revision : 0,
    bots,
    totals: { configured: bots.length, connected: bots.filter((bot) => bot.connected).length },
    provisioning: source.provisioning ? normalizeProvisioning(source.provisioning) : null,
    agentPresetCatalog: normalizeAgentPresetCatalog(source.agentPresetCatalog),
    modelCatalog: normalizeModelCatalog(source.modelCatalog),
    ...testMessage ? { testMessage } : {}
  };
}
function connectionTestFeedback(result2) {
  if (result2?.sent === true) return "\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\uFF0C\u8BF7\u5230\u5BF9\u5E94\u673A\u5668\u4EBA\u4F1A\u8BDD\u4E2D\u786E\u8BA4\u3002";
  if (result2?.code === "test-target-unavailable") {
    return "\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\u3002\u673A\u5668\u4EBA\u5C1A\u672A\u6536\u5230\u53EF\u7528\u4E8E\u6D4B\u8BD5\u7684\u79C1\u804A\u6D88\u606F\u3002";
  }
  return result2 ? "\u8FDE\u63A5\u68C0\u67E5\u5B8C\u6210\uFF0C\u4F46\u6D4B\u8BD5\u6D88\u606F\u53D1\u9001\u5931\u8D25\u3002" : null;
}
function presentError(error) {
  return {
    ...diagnosticFields(error),
    code: text2(error?.code, "QQ_ERROR", 80),
    message: text2(error?.message, "QQ \u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5")
  };
}
function formatRemaining(milliseconds) {
  const seconds = Math.max(0, Math.ceil(Number(milliseconds) / 1e3) || 0);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

// plugin-src/client/bot-alias.js
var React7 = __toESM(require("react"), 1);
var import_react_dom = require("react-dom");
function AliasDialog({ bot, onSave, onClose }) {
  const id2 = React7.useId();
  const dialogRef = React7.useRef(null);
  const inputRef = React7.useRef(null);
  const savingRef = React7.useRef(false);
  const [draft, setDraft] = React7.useState(bot.alias ?? "");
  const [saving, setSaving] = React7.useState(false);
  const [error, setError] = React7.useState(null);
  React7.useEffect(() => {
    const previous = globalThis.document?.activeElement;
    dialogRef.current?.showModal?.();
    inputRef.current?.focus?.();
    inputRef.current?.select?.();
    return () => {
      if (previous?.isConnected) previous.focus?.();
    };
  }, []);
  const close = () => {
    if (!savingRef.current) onClose();
  };
  const save = async (value) => {
    if (savingRef.current) return;
    setError(null);
    try {
      const alias = validateBotAlias(value);
      if (alias === (bot.alias ?? "")) {
        onClose();
        return;
      }
      savingRef.current = true;
      setSaving(true);
      await onSave(alias);
      onClose();
    } catch (cause) {
      setError(cause?.message ?? "\u522B\u540D\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  const content = h3(
    "dialog",
    {
      ref: dialogRef,
      className: "dim-aliasDialog",
      "aria-labelledby": `${id2}-title`,
      "aria-busy": saving,
      onCancel: (event) => {
        event.preventDefault();
        close();
      },
      onClick: (event) => event.stopPropagation(),
      onKeyDown: (event) => event.stopPropagation()
    },
    h3(
      "div",
      { className: "dim-aliasHeader" },
      h3("h3", { id: `${id2}-title` }, "\u4FEE\u6539\u522B\u540D"),
      h3("button", {
        type: "button",
        className: "dim-aliasClose",
        disabled: saving,
        "aria-label": "\u5173\u95ED\u4FEE\u6539\u522B\u540D",
        onClick: close
      }, "\xD7")
    ),
    h3(
      "div",
      { className: "dim-aliasOriginal" },
      h3("span", null, "\u539F\u540D\u79F0"),
      h3("span", null, bot.originalName ?? bot.name)
    ),
    h3("label", { htmlFor: `${id2}-input` }, "\u522B\u540D"),
    h3("input", {
      id: `${id2}-input`,
      ref: inputRef,
      value: draft,
      disabled: saving,
      maxLength: MAX_BOT_ALIAS_LENGTH,
      placeholder: "\u4F8B\u5982\uFF1A\u5BA2\u670D\u52A9\u624B",
      "aria-describedby": `${id2}-help`,
      onChange: (event) => setDraft(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "Enter" && !event.nativeEvent?.isComposing) {
          event.preventDefault();
          void save(draft);
        }
      }
    }),
    h3("p", { id: `${id2}-help`, className: "dim-aliasHelp" }, "\u4EC5\u66F4\u6539\u663E\u793A\u540D\u79F0\uFF0C\u7559\u7A7A\u5219\u663E\u793A\u539F\u540D\u79F0\u3002"),
    error ? h3("p", { className: "dim-aliasError", role: "alert" }, error) : null,
    h3(
      "div",
      { className: "dim-aliasFooter" },
      h3("button", {
        type: "button",
        className: "dim-aliasRestore",
        disabled: saving || !bot.alias,
        onClick: () => void save("")
      }, "\u6062\u590D\u539F\u540D\u79F0"),
      h3(
        "div",
        { className: "dim-aliasActions" },
        h3("button", { type: "button", disabled: saving, onClick: close }, "\u53D6\u6D88"),
        h3("button", {
          type: "button",
          className: "dim-aliasSave",
          disabled: saving,
          onClick: () => void save(draft)
        }, saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58")
      )
    )
  );
  return globalThis.document?.body ? (0, import_react_dom.createPortal)(content, document.body) : content;
}
function BotNameTooltip({ anchorRef, id: id2, name: name2, onDismiss }) {
  const tooltipRef = React7.useRef(null);
  const [position, setPosition] = React7.useState(null);
  React7.useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const tooltip = tooltipRef.current;
    if (!anchor || !tooltip) return void 0;
    const document2 = anchor.ownerDocument;
    const view = document2.defaultView;
    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const { width, height } = tooltip.getBoundingClientRect();
      const viewport = document2.documentElement;
      const margin = 8;
      const below = rect.bottom + 6;
      setPosition({
        left: Math.max(margin, Math.min(rect.left, viewport.clientWidth - width - margin)),
        top: Math.max(margin, Math.min(
          below + height <= viewport.clientHeight - margin ? below : rect.top - height - 6,
          viewport.clientHeight - height - margin
        ))
      });
    };
    const dismiss = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onDismiss();
      }
    };
    place();
    view.addEventListener("resize", place);
    document2.addEventListener("scroll", onDismiss, true);
    document2.addEventListener("keydown", dismiss, true);
    return () => {
      view.removeEventListener("resize", place);
      document2.removeEventListener("scroll", onDismiss, true);
      document2.removeEventListener("keydown", dismiss, true);
    };
  }, [anchorRef, name2, onDismiss]);
  const body = anchorRef.current?.ownerDocument.body;
  return body ? (0, import_react_dom.createPortal)(h3("span", {
    ref: tooltipRef,
    id: id2,
    role: "tooltip",
    className: "dim-botNameTooltip",
    style: position ?? { visibility: "hidden" }
  }, name2), body) : null;
}
function BotName({ bot, id: id2, disabled = false, onSave }) {
  const [open, setOpen] = React7.useState(false);
  const nameRef = React7.useRef(null);
  const tooltipId = React7.useId();
  const [truncated, setTruncated] = React7.useState(false);
  const [hovered, setHovered] = React7.useState(false);
  const [focused, setFocused] = React7.useState(false);
  const [dismissed, setDismissed] = React7.useState(false);
  const dismissTooltip = React7.useCallback(() => setDismissed(true), []);
  const measure = React7.useCallback(() => {
    const node = nameRef.current;
    setTruncated(Boolean(node && node.scrollWidth > node.clientWidth));
  }, []);
  React7.useEffect(() => {
    const node = nameRef.current;
    if (!node) return void 0;
    measure();
    const view = node.ownerDocument.defaultView;
    const observer = view.ResizeObserver ? new view.ResizeObserver(measure) : null;
    observer?.observe(node);
    view.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      view.removeEventListener("resize", measure);
    };
  }, [bot.name, measure]);
  const showTooltip = truncated && !dismissed && !open && (hovered || focused);
  return h3(
    "div",
    { className: "dim-aliasName" },
    h3("h3", {
      id: id2,
      ref: nameRef,
      tabIndex: truncated ? 0 : void 0,
      "aria-describedby": showTooltip ? tooltipId : void 0,
      onMouseEnter: () => {
        measure();
        setHovered(true);
        setDismissed(false);
      },
      onMouseLeave: () => setHovered(false),
      onFocus: () => {
        measure();
        setFocused(true);
        setDismissed(false);
      },
      onBlur: () => setFocused(false),
      onClick: dismissTooltip
    }, bot.name),
    showTooltip ? h3(BotNameTooltip, {
      anchorRef: nameRef,
      id: tooltipId,
      name: bot.name,
      onDismiss: dismissTooltip
    }) : null,
    h3(
      "span",
      {
        className: "dim-aliasEntry",
        onClick: (event) => event.stopPropagation(),
        onKeyDown: (event) => event.stopPropagation()
      },
      h3(
        "button",
        {
          type: "button",
          className: "dim-aliasEdit",
          "aria-label": "\u4FEE\u6539\u522B\u540D",
          title: "\u4FEE\u6539\u522B\u540D",
          "aria-haspopup": "dialog",
          disabled: disabled || typeof onSave !== "function",
          onClick: () => setOpen(true)
        },
        h3(
          "svg",
          {
            width: 14,
            height: 14,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.7,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": true
          },
          h3("path", { d: "m16 3 5 5M3 21l5-1L21 7a2.1 2.1 0 0 0-5-5L3 15Z" })
        )
      ),
      open ? h3(AliasDialog, { bot, onSave, onClose: () => setOpen(false) }) : null
    )
  );
}

// plugin-src/client/channels/qq/index.js
var React15 = __toESM(require("react"), 1);

// plugin-src/client/credential-binding.js
var React8 = __toESM(require("react"), 1);
function ActionIcon({ children }) {
  return h3("svg", {
    className: "dim-actionIcon",
    width: 15,
    height: 15,
    viewBox: "0 0 20 20",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    focusable: "false"
  }, children);
}
function QrActionIcon() {
  return h3(
    ActionIcon,
    null,
    h3("path", {
      d: "M2.5 2.5h5v5h-5v-5Zm10 0h5v5h-5v-5Zm-10 10h5v5h-5v-5Z",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }),
    h3("path", {
      d: "M11.5 11.5h2v2h-2v-2Zm4 0h2v3h-2v-3Zm-4 4h3v2h-3v-2Zm5 1h1v1h-1v-1Z",
      fill: "currentColor"
    })
  );
}
function CredentialActionIcon() {
  return h3(
    ActionIcon,
    null,
    h3("circle", {
      cx: "6.25",
      cy: "10",
      r: "3.5",
      stroke: "currentColor",
      strokeWidth: "1.6"
    }),
    h3("path", {
      d: "M9.75 10h7.75m-2.5 0v2m-2.5-2v2",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })
  );
}
function CredentialBindingPanel({
  channel,
  identityLabel,
  identityPlaceholder,
  secretLabel,
  secretPlaceholder,
  busy = false,
  error = null,
  onSubmit,
  onCancel,
  children
}) {
  const [identity, setIdentity] = React8.useState("");
  const [secret, setSecret] = React8.useState("");
  const headingId = React8.useId();
  const hasIdentity = Boolean(identityLabel);
  const submit = (event) => {
    event.preventDefault();
    const normalizedIdentity = identity.trim();
    const normalizedSecret = secret.trim();
    if (hasIdentity && !normalizedIdentity || !normalizedSecret || busy) return;
    void onSubmit?.({ identity: normalizedIdentity, secret: normalizedSecret });
  };
  return h3(
    "section",
    {
      className: "ddt-card dim-surfaceCard dim-credentialPanel",
      "aria-labelledby": headingId
    },
    h3("h3", { id: headingId, className: "dim-credentialTitle" }, `\u624B\u52A8\u63A5\u5165${channel}\u673A\u5668\u4EBA`),
    children,
    h3(
      "form",
      {
        className: `dim-credentialForm${hasIdentity ? "" : " dim-credentialFormSingle"}`,
        onSubmit: submit
      },
      hasIdentity ? h3(
        "label",
        { className: "dim-credentialField" },
        h3("span", null, identityLabel),
        h3("input", {
          value: identity,
          onChange: (event) => setIdentity(event.target.value),
          placeholder: identityPlaceholder,
          maxLength: 512,
          autoCapitalize: "none",
          autoCorrect: "off",
          spellCheck: false,
          autoComplete: "off",
          disabled: busy,
          required: true
        })
      ) : null,
      h3(
        "label",
        { className: "dim-credentialField" },
        h3("span", null, secretLabel),
        h3("input", {
          type: "password",
          value: secret,
          onChange: (event) => setSecret(event.target.value),
          placeholder: secretPlaceholder,
          maxLength: 1024,
          autoCapitalize: "none",
          autoCorrect: "off",
          spellCheck: false,
          autoComplete: "new-password",
          disabled: busy,
          required: true
        })
      ),
      error ? h3("p", { className: "dim-credentialError", role: "alert" }, error.message ?? String(error)) : null,
      h3(
        "div",
        { className: "ddt-actions dim-viewActions dim-credentialActions" },
        h3("button", {
          type: "submit",
          className: "ddt-button",
          "data-kind": "primary",
          disabled: busy || hasIdentity && !identity.trim() || !secret.trim()
        }, busy ? "\u6B63\u5728\u7ED1\u5B9A\u2026" : "\u7ED1\u5B9A\u5E76\u8FDE\u63A5"),
        h3("button", {
          type: "button",
          className: "ddt-button",
          onClick: onCancel,
          disabled: busy
        }, "\u53D6\u6D88")
      )
    )
  );
}

// plugin-src/client/channels/shared/collapsible-account.js
var React10 = __toESM(require("react"), 1);

// plugin-src/client/channel-card-meta.js
var React9 = __toESM(require("react"), 1);
var BotSettingsContext = React9.createContext(Object.freeze({
  openBotSettings() {
  }
}));
function SettingsGlyph() {
  return h3(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    h3("circle", { cx: 12, cy: 12, r: 3 }),
    h3("path", { d: "M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 8.97 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.52-1.03H3v-4h.08A1.7 1.7 0 0 0 4.6 8.97a1.7 1.7 0 0 0-.34-1.88l-.06-.06L7.03 4.2l.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.03 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" })
  );
}
function BotSettingsButton({
  channel,
  botId,
  botName,
  connected,
  accessPolicy,
  channelSettings
}) {
  const { openBotSettings } = React9.useContext(BotSettingsContext);
  return h3(
    "span",
    { className: "dim-botSettingsAction" },
    h3(
      "button",
      {
        type: "button",
        className: "dim-botSettingsButton",
        "data-delivery-channel": channel,
        "aria-label": "\u66F4\u591A\u673A\u5668\u4EBA\u8BBE\u7F6E",
        onClick: () => openBotSettings?.({
          ...channelSettings && typeof channelSettings === "object" ? channelSettings : {},
          channel,
          botId,
          botName,
          connected: Boolean(connected),
          accessPolicy
        })
      },
      h3(SettingsGlyph),
      h3("span", null, "\u66F4\u591A\u8BBE\u7F6E"),
      h3("span", { className: "dim-moreSettingsChevron", "aria-hidden": "true" })
    )
  );
}
function messageErrorTime(value) {
  try {
    return new Intl.DateTimeFormat(isEnglish() ? "en-US" : "zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return null;
  }
}
function ChannelListHeading({ className = "", id: id2, title, connectionLabel }) {
  const helpId = React9.useId();
  return h3(
    "div",
    { className: `${className} dim-listHeading`.trim() },
    h3(
      "div",
      { className: "dim-listTitle" },
      h3("h3", id2 ? { id: id2 } : null, title),
      h3(
        "span",
        { className: "dim-channelHelp" },
        h3("button", {
          type: "button",
          className: "dim-channelHelpButton",
          "aria-label": "\u67E5\u770B\u6D88\u606F\u901A\u9053\u8BF4\u660E",
          "aria-describedby": helpId
        }, h3("span", { "aria-hidden": "true" }, "?")),
        h3(
          "span",
          {
            id: helpId,
            className: "dim-channelTooltip",
            role: "tooltip"
          },
          h3("span", null, "\u6D88\u606F\u901A\u9053"),
          h3("strong", null, connectionLabel)
        )
      )
    )
  );
}
function BotStatusMeta({
  className = "",
  dotClassName = "",
  tone,
  stateLabel,
  lastCheckedAt,
  formatCheckedTime,
  healthState
}) {
  return h3(
    "div",
    { className: "dim-botHealthGroup" },
    h3(
      "div",
      {
        className: `${className} dim-botHealth`.trim(),
        ...healthState ? { "data-health": healthState } : {}
      },
      h3("span", {
        className: `${dotClassName} dim-healthDot`.trim(),
        "data-tone": tone
      }),
      h3("span", null, stateLabel)
    ),
    h3(
      "div",
      { className: "dim-lastChecked" },
      h3("span", null, "\u6700\u8FD1\u68C0\u67E5"),
      h3("span", null, formatCheckedTime(lastCheckedAt))
    )
  );
}
function LastMessageErrorSummary({ className = "", error }) {
  if (!error) return null;
  const occurredAt = messageErrorTime(error.at);
  return h3(
    "div",
    {
      className: `${className} dim-cardSummary`.trim(),
      role: "status"
    },
    h3("strong", null, "\u6700\u8FD1\u4E00\u6761\u6D88\u606F\u5904\u7406\u5931\u8D25"),
    "\uFF1A",
    h3("span", null, error.message),
    error.details ? h3(ConnectionError, { error, showMessage: false }) : null,
    "\uFF08",
    h3("span", null, "\u9519\u8BEF\u7801"),
    ` ${error.code} \xB7 `,
    h3("span", null, "\u53C2\u8003\u53F7"),
    ` ${error.referenceId}`,
    occurredAt ? h3(
      React9.Fragment,
      null,
      " \xB7 ",
      h3("time", { dateTime: new Date(error.at).toISOString() }, occurredAt)
    ) : null,
    "\uFF09"
  );
}

// plugin-src/client/channels/shared/collapsible-account.js
var AccountSectionContext = React10.createContext(null);
function AccountSettingsToggle() {
  const { open, toggle, contentId } = React10.useContext(AccountSectionContext);
  return h3(
    "button",
    {
      type: "button",
      className: "dim-accountSettingsToggle",
      "aria-label": open ? "\u6536\u8D77\u8BE5\u8D26\u53F7\u7684\u8BBE\u7F6E" : "\u5C55\u5F00\u8BE5\u8D26\u53F7\u7684\u8BBE\u7F6E",
      "aria-expanded": open ? "true" : "false",
      "aria-controls": contentId,
      onClick: (event) => {
        event.stopPropagation();
        toggle();
      }
    },
    h3(SettingsGlyph),
    h3("svg", {
      className: "dim-collapsibleChevron",
      viewBox: "0 0 12 16",
      width: 12,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, h3("path", { d: "M2 6 6 10 10 6" }))
  );
}
function CollapsibleAccountSection({
  header,
  settings,
  defaultOpen = false,
  open: controlledOpen,
  onToggle,
  id: id2,
  className = "",
  children
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React10.useState(defaultOpen);
  const generatedId = React10.useId();
  const open = controlledOpen ?? uncontrolledOpen;
  const contentId = `${id2 ?? generatedId}-content`;
  const toggle = () => {
    if (controlledOpen === void 0) setUncontrolledOpen((value) => !value);
    onToggle?.(!open);
  };
  return h3(
    AccountSectionContext.Provider,
    { value: { open, toggle, contentId } },
    h3(
      "div",
      {
        className: `dim-collapsibleAccount ${open ? "is-open" : ""} ${className}`.trim(),
        "data-open": open ? "true" : "false"
      },
      h3(
        "div",
        {
          className: "dim-collapsibleHead",
          onClick: toggle
        },
        h3("div", { className: "dim-collapsibleHeaderContent" }, header)
      ),
      h3(
        "div",
        {
          id: contentId,
          className: "dim-collapsibleBody",
          role: "region"
        },
        h3(
          "div",
          { className: "dim-collapsibleBodyInner" },
          settings ? h3(
            "div",
            { className: "dim-accountSettingsHeader" },
            h3("span", null, "\u5E38\u7528\u914D\u7F6E"),
            settings
          ) : null,
          children
        )
      )
    )
  );
}

// plugin-src/client/workspace-editor.js
var React12 = __toESM(require("react"), 1);

// plugin-src/client/workspace-directory-picker.js
var React11 = __toESM(require("react"), 1);
var import_react_dom2 = require("react-dom");
function pickerErrorCode(error) {
  return error?.rpcError?.code ?? error?.code;
}
var PICKER_ERROR_KINDS = /* @__PURE__ */ new Map([
  ["directory-picker/unavailable", "unavailable"],
  ["directory-picker-unavailable", "unavailable"],
  ["directory-picker/unreadable", "unreadable"],
  ["directory-unreadable", "unreadable"]
]);
function pickerErrorKind(error) {
  return PICKER_ERROR_KINDS.get(pickerErrorCode(error));
}
function pickerErrorDetails(error) {
  return error?.rpcError?.details ?? error?.details;
}
function pickerErrorMessage(error) {
  return error?.rpcError?.message ?? error?.message ?? "\u65E0\u6CD5\u8BFB\u53D6\u76EE\u5F55\uFF0C\u8BF7\u91CD\u8BD5\u3002";
}
function FolderIcon() {
  return React11.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    React11.createElement("path", { d: "M3.5 7.25A2.25 2.25 0 0 1 5.75 5h4.1l1.8 2h6.6a2.25 2.25 0 0 1 2.25 2.25v7A2.75 2.75 0 0 1 17.75 19h-12A2.25 2.25 0 0 1 3.5 16.75v-9.5Z" })
  );
}
function ChevronIcon() {
  return React11.createElement("svg", {
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, React11.createElement("path", { d: "m7.5 4.5 5 5.5-5 5.5" }));
}
function displayCrumbs(listing) {
  const homeIndex = listing.crumbs.findIndex((crumb) => crumb.path === listing.home);
  if (homeIndex < 0) return listing.crumbs;
  return listing.crumbs.slice(homeIndex);
}
function WorkspaceDirectoryPicker({
  open,
  startPath,
  picker,
  busy = false,
  saveError = null,
  onPicked,
  onCancel
}) {
  const [listing, setListing] = React11.useState(null);
  const [loading, setLoading] = React11.useState(false);
  const [error, setError] = React11.useState(null);
  const [pathDraft, setPathDraft] = React11.useState(startPath ?? "");
  const [showHidden, setShowHidden] = React11.useState(false);
  const [retryKey, setRetryKey] = React11.useState(0);
  const requestRef = React11.useRef(0);
  const controllerRef = React11.useRef(null);
  const dialogRef = React11.useRef(null);
  const bodyRef = React11.useRef(null);
  const titleId = React11.useId();
  const noticeId = React11.useId();
  const pathInputId = React11.useId();
  const errorId = React11.useId();
  const initialPathRef = React11.useRef(startPath);
  const onPickedRef = React11.useRef(onPicked);
  const onCancelRef = React11.useRef(onCancel);
  const busyRef = React11.useRef(busy);
  onPickedRef.current = onPicked;
  onCancelRef.current = onCancel;
  busyRef.current = busy;
  const loadDirectory = React11.useCallback(async (path, { reportError = true } = {}) => {
    const request = requestRef.current + 1;
    requestRef.current = request;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    if (reportError) setError(null);
    try {
      const next = await picker.listDirectory(path, controller.signal);
      if (request !== requestRef.current || controller.signal.aborted) return { aborted: true };
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
      setListing(next);
      if (typeof next?.path === "string") setPathDraft(next.path);
      setError(null);
      return { value: next };
    } catch (cause) {
      if (request !== requestRef.current || controller.signal.aborted) return { aborted: true };
      if (reportError) setError(pickerErrorMessage(cause));
      return { error: cause };
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [picker]);
  React11.useEffect(() => {
    if (!open) return void 0;
    let active = true;
    setListing(null);
    setError(null);
    setPathDraft(initialPathRef.current ?? "");
    setShowHidden(false);
    dialogRef.current?.focus?.();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busyRef.current) onCancelRef.current?.();
    };
    if (typeof document !== "undefined") document.addEventListener("keydown", handleKeyDown);
    const start = async () => {
      const initialPath = initialPathRef.current;
      const initial = await loadDirectory(initialPath || void 0, { reportError: false });
      if (!active || initial.aborted || initial.value) return;
      const kind = pickerErrorKind(initial.error);
      const details = pickerErrorDetails(initial.error);
      if (kind === "unavailable" && details?.capability === "native" && typeof picker.pickDirectory === "function") {
        setLoading(true);
        try {
          const selected = await picker.pickDirectory();
          if (!active) return;
          if (selected !== null) await onPickedRef.current?.(selected);
          else onCancelRef.current?.();
        } catch (cause) {
          if (active) setError(pickerErrorMessage(cause));
        } finally {
          if (active) setLoading(false);
        }
        return;
      }
      if (initialPath && kind === "unreadable") {
        const home = await loadDirectory(void 0, { reportError: false });
        if (!active || home.aborted || home.value) return;
        setError(pickerErrorMessage(home.error));
        return;
      }
      setError(pickerErrorMessage(initial.error));
    };
    void start();
    return () => {
      active = false;
      if (typeof document !== "undefined") document.removeEventListener("keydown", handleKeyDown);
      requestRef.current += 1;
      controllerRef.current?.abort();
    };
  }, [loadDirectory, open, picker, retryKey]);
  if (!open) return null;
  const entries = (listing?.entries ?? []).filter((entry) => showHidden || !entry.hidden);
  const crumbs = listing ? displayCrumbs(listing) : [];
  const presentedError = saveError ?? error;
  const pathReady = listing !== null && pathDraft === listing.path;
  const content = h3(
    "div",
    {
      className: "dim-directoryPickerBackdrop",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }
    },
    h3(
      "section",
      {
        ref: dialogRef,
        className: "dim-directoryPicker",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": titleId,
        "aria-describedby": noticeId,
        tabIndex: -1
      },
      h3(
        "header",
        { className: "dim-directoryPickerHeader" },
        h3("h3", { id: titleId }, "\u9009\u62E9\u673A\u5668\u4EBA\u5DE5\u4F5C\u533A\u76EE\u5F55"),
        listing ? h3(
          "nav",
          { className: "dim-directoryCrumbs", "aria-label": "\u5F53\u524D\u76EE\u5F55" },
          crumbs.map((crumb, index) => h3(
            React11.Fragment,
            { key: crumb.path },
            index > 0 ? h3("span", { className: "dim-directoryCrumbSeparator", "aria-hidden": "true" }, "\u203A") : null,
            React11.createElement("button", {
              type: "button",
              title: crumb.path,
              disabled: loading || busy,
              "aria-current": index === crumbs.length - 1 ? "page" : void 0,
              onClick: () => void loadDirectory(crumb.path)
            }, crumb.path === listing.home ? h3("span", null, "\u4E3B\u76EE\u5F55") : crumb.name || crumb.path)
          ))
        ) : h3("p", null, "\u6B63\u5728\u51C6\u5907\u76EE\u5F55\u9009\u62E9\u5668\u2026"),
        h3(
          "form",
          {
            className: "dim-directoryPathForm",
            onSubmit: (event) => {
              event.preventDefault();
              if (!busy && !loading && pathDraft.trim()) void loadDirectory(pathDraft);
            }
          },
          h3(
            "div",
            { className: "dim-directoryPathMeta" },
            h3("label", { htmlFor: pathInputId }, "\u76F4\u63A5\u8F93\u5165\u8DEF\u5F84"),
            h3("span", null, "\u652F\u6301 Windows \u76D8\u7B26\u3001UNC \u4E0E POSIX \u7EDD\u5BF9\u8DEF\u5F84\u3002")
          ),
          h3(
            "div",
            { className: "dim-directoryPathControl" },
            h3("input", {
              id: pathInputId,
              className: "dim-directoryPathInput",
              value: pathDraft,
              placeholder: "\u8F93\u5165 Host \u4E0A\u7684\u5B8C\u6574\u7EDD\u5BF9\u8DEF\u5F84",
              "aria-label": "\u5DE5\u4F5C\u533A\u7EDD\u5BF9\u8DEF\u5F84",
              "aria-describedby": presentedError ? errorId : void 0,
              "aria-invalid": presentedError ? "true" : void 0,
              autoCapitalize: "none",
              autoCorrect: "off",
              spellCheck: false,
              maxLength: 4096,
              disabled: busy || loading,
              onChange: (event) => {
                setPathDraft(event.target.value);
                setError(null);
              }
            }),
            h3("button", {
              type: "submit",
              disabled: busy || loading || !pathDraft.trim()
            }, loading ? "\u8BFB\u53D6\u4E2D\u2026" : "\u524D\u5F80")
          )
        )
      ),
      h3(
        "div",
        { ref: bodyRef, className: "dim-directoryPickerBody", "aria-busy": loading },
        loading && !listing ? h3(
          "div",
          { className: "dim-directoryPickerState" },
          h3("span", { className: "dim-directoryPickerSpinner", "aria-hidden": "true" }),
          h3("p", null, "\u6B63\u5728\u8BFB\u53D6\u76EE\u5F55\u2026")
        ) : listing ? entries.length > 0 ? h3("ul", { className: "dim-directoryList" }, entries.map((entry) => h3(
          "li",
          { key: entry.path },
          React11.createElement(
            "button",
            {
              type: "button",
              title: entry.path,
              disabled: loading || busy,
              onClick: () => void loadDirectory(entry.path)
            },
            h3("span", { className: "dim-directoryFolder" }, h3(FolderIcon)),
            React11.createElement("span", { className: "dim-directoryName" }, entry.name),
            h3("span", { className: "dim-directoryChevron" }, h3(ChevronIcon))
          )
        ))) : h3(
          "div",
          { className: "dim-directoryPickerState" },
          h3("p", null, "\u8FD9\u4E2A\u76EE\u5F55\u4E2D\u6CA1\u6709\u5B50\u6587\u4EF6\u5939\u3002")
        ) : null,
        listing?.truncated ? h3("p", { className: "dim-directoryPickerTruncated" }, "\u6B64\u76EE\u5F55\u7684\u5B50\u6587\u4EF6\u5939\u8FC7\u591A\uFF0C\u4EC5\u663E\u793A\u524D\u4E00\u90E8\u5206\u3002") : null,
        presentedError ? h3(
          "div",
          { id: errorId, className: "dim-directoryPickerError", role: "alert" },
          h3("span", null, presentedError),
          !listing && !busy ? h3("button", {
            type: "button",
            onClick: () => setRetryKey((value) => value + 1)
          }, "\u91CD\u8BD5") : null
        ) : null
      ),
      h3(
        "footer",
        { className: "dim-directoryPickerFooter" },
        h3(
          "button",
          {
            type: "button",
            className: "dim-directoryHidden",
            "aria-pressed": showHidden,
            onClick: () => setShowHidden((value) => !value),
            disabled: busy || !listing
          },
          h3("span", { className: "dim-directoryHiddenBox", "aria-hidden": "true" }),
          h3("span", null, "\u663E\u793A\u9690\u85CF\u6587\u4EF6\u5939")
        ),
        h3("p", { id: noticeId, className: "dim-directoryPickerNotice" }, "\u5207\u6362\u540E\u4F1A\u6E05\u9664\u8FD9\u4E2A\u673A\u5668\u4EBA\u7684\u65E7\u4F1A\u8BDD\u6620\u5C04\u3002"),
        h3(
          "div",
          { className: "dim-directoryPickerActions" },
          h3("button", { type: "button", onClick: onCancel, disabled: busy }, "\u53D6\u6D88"),
          h3("button", {
            type: "button",
            className: "dim-directoryPickerPrimary",
            disabled: busy || loading || !pathReady,
            onClick: () => listing && void onPicked(listing.path)
          }, busy ? "\u5207\u6362\u4E2D\u2026" : "\u9009\u62E9\u6B64\u76EE\u5F55")
        )
      )
    )
  );
  return typeof document === "undefined" ? content : (0, import_react_dom2.createPortal)(content, document.body);
}

// plugin-src/client/workspace-editor.js
var WorkspaceDirectoryPickerContext = React12.createContext(null);
function WorkspaceEditor({ workspace, directoryPicker, disabled = false, onSave }) {
  const sharedDirectoryPicker = React12.useContext(WorkspaceDirectoryPickerContext);
  const activeDirectoryPicker = directoryPicker ?? sharedDirectoryPicker;
  const [open, setOpen] = React12.useState(false);
  const [saving, setSaving] = React12.useState(false);
  const [error, setError] = React12.useState(null);
  const editButtonRef = React12.useRef(null);
  const savingRef = React12.useRef(false);
  const close = React12.useCallback(() => {
    setOpen(false);
    setError(null);
    queueMicrotask(() => editButtonRef.current?.focus?.());
  }, []);
  const pick = React12.useCallback(async (value) => {
    if (!value || savingRef.current || disabled) return;
    if (value === workspace) {
      close();
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      await onSave?.(value);
      close();
    } catch (cause) {
      setError(cause?.message ?? "\u5DE5\u4F5C\u533A\u4FEE\u6539\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [close, disabled, onSave, workspace]);
  return h3(
    "div",
    { className: "dim-workspace" },
    h3(
      "div",
      { className: "dim-workspaceHeader" },
      h3("span", null, "\u5F53\u524D\u5DE5\u4F5C\u533A"),
      h3("button", {
        type: "button",
        ref: editButtonRef,
        className: "dim-workspaceEdit",
        onClick: () => {
          setOpen(true);
          setError(null);
        },
        disabled: disabled || !activeDirectoryPicker
      }, "\u9009\u62E9\u76EE\u5F55")
    ),
    workspace ? React12.createElement("code", {
      className: "dim-workspacePath",
      title: workspace
    }, workspace) : h3("code", { className: "dim-workspacePath" }, "\u672A\u8BBE\u7F6E"),
    open ? h3(WorkspaceDirectoryPicker, {
      open,
      startPath: workspace,
      picker: activeDirectoryPicker,
      busy: saving || disabled,
      saveError: error,
      onPicked: pick,
      onCancel: close
    }) : null
  );
}

// plugin-src/client/context-enhancement.js
var React13 = __toESM(require("react"), 1);
var import_react_dom3 = require("react-dom");
var FIELD_LABELS = Object.freeze({
  channel: "\u6E20\u9053",
  conversationType: "\u4F1A\u8BDD\u7C7B\u578B",
  senderId: "\u53D1\u9001\u8005\u6807\u8BC6",
  senderName: "\u53D1\u9001\u8005\u6635\u79F0",
  conversationTitle: "\u4F1A\u8BDD\u6807\u9898",
  chatId: "\u4F1A\u8BDD\u6807\u8BC6",
  threadId: "\u8BDD\u9898\u6807\u8BC6",
  botId: "\u673A\u5668\u4EBA\u6807\u8BC6",
  sentAt: "\u53D1\u9001\u65F6\u95F4"
});
var FIELD_HELP = Object.freeze({
  senderName: Object.freeze({
    labelKey: "senderNameHelpLabel",
    text: "\u8BE5\u5B57\u6BB5\u4E0D\u662F\u6BCF\u4E2A\u6E20\u9053\u90FD\u80FD\u63D0\u4F9B\u3002\u5F53\u524D\u6D88\u606F\u6CA1\u6709\u53D1\u9001\u8005\u6635\u79F0\u65F6\uFF0C\u5373\u4F7F\u5DF2\u9009\u62E9\u8BE5\u5B57\u6BB5\uFF0C<dsh_im_source> \u4E2D\u4E5F\u4F1A\u7701\u7565 senderName\u3002"
  }),
  conversationTitle: Object.freeze({
    labelKey: "conversationTitleHelpLabel",
    text: "\u8BE5\u5B57\u6BB5\u4E0D\u662F\u6BCF\u4E2A\u6E20\u9053\u90FD\u80FD\u63D0\u4F9B\u3002\u9489\u9489\u7FA4\u804A\u4F1A\u5E26\u4E0A\u7FA4\u540D\u3002\u5F53\u524D\u6D88\u606F\u6CA1\u6709\u4F1A\u8BDD\u6807\u9898\u65F6\uFF0C\u5373\u4F7F\u5DF2\u9009\u62E9\u8BE5\u5B57\u6BB5\uFF0C<dsh_im_source> \u4E2D\u4E5F\u4F1A\u7701\u7565 conversationTitle\u3002"
  }),
  chatId: Object.freeze({
    labelKey: "chatIdHelpLabel",
    text: "\u8BE5\u5B57\u6BB5\u4E0D\u662F\u6BCF\u4E2A\u6E20\u9053\u90FD\u80FD\u63D0\u4F9B\u3002\u4F1A\u8BDD\u6807\u8BC6\u7528\u4E8E\u533A\u5206\u4E0D\u540C\u7684\u7FA4\u7EC4\u6216\u79C1\u804A\uFF0C\u98DE\u4E66\u7FA4\u804A\u4F1A\u5E26\u4E0A\u7FA4 ID\u3002\u5F53\u524D\u6D88\u606F\u6CA1\u6709\u4F1A\u8BDD\u6807\u8BC6\u65F6\uFF0C\u5373\u4F7F\u5DF2\u9009\u62E9\u8BE5\u5B57\u6BB5\uFF0C<dsh_im_source> \u4E2D\u4E5F\u4F1A\u7701\u7565 chatId\u3002"
  }),
  threadId: Object.freeze({
    labelKey: "threadIdHelpLabel",
    text: "\u8BE5\u5B57\u6BB5\u4E0D\u662F\u6BCF\u4E2A\u6E20\u9053\u90FD\u80FD\u63D0\u4F9B\u3002\u98DE\u4E66\u8BDD\u9898\u7FA4\u7684\u6D88\u606F\u4F1A\u5E26\u4E0A\u8BDD\u9898 ID\uFF0C\u7528\u4E8E\u533A\u5206\u540C\u4E00\u7FA4\u7EC4\u5185\u7684\u4E0D\u540C\u8BDD\u9898\uFF1B\u5F53\u524D\u6D88\u606F\u4E0D\u5728\u8BDD\u9898\u4E2D\u65F6\uFF0C\u5373\u4F7F\u5DF2\u9009\u62E9\u8BE5\u5B57\u6BB5\uFF0C<dsh_im_source> \u4E2D\u4E5F\u4F1A\u7701\u7565 threadId\u3002"
  }),
  sentAt: Object.freeze({
    labelKey: "sentAtHelpLabel",
    text: "\u5F53\u524D\u6D88\u606F\u7684\u53D1\u9001\u65F6\u95F4\uFF0C\u683C\u5F0F\u4E3A YYYY-MM-DD HH:mm:ss\uFF08\u672C\u673A\u65F6\u533A\uFF09\u3002\u4F18\u5148\u4F7F\u7528\u5E73\u53F0\u7ED9\u51FA\u7684\u53D1\u9001\u65F6\u95F4\uFF1B\u5E73\u53F0\u672A\u63D0\u4F9B\u65F6\uFF0C\u4ECE\u5FAE\u4FE1\u6D88\u606F ID \u4E2D\u89E3\u6790\u51FA\u53D1\u9001\u65F6\u95F4\uFF1B\u4E24\u8005\u90FD\u4E0D\u53EF\u7528\u65F6\uFF0C\u5373\u4F7F\u5DF2\u9009\u62E9\u8BE5\u5B57\u6BB5\uFF0C<dsh_im_source> \u4E2D\u4E5F\u4F1A\u7701\u7565 sentAt\u3002\u76EE\u524D\u4EC5\u5FAE\u4FE1\u6E20\u9053\u63D0\u4F9B\uFF1B\u628A\u672C\u673A\u65F6\u533A\u5199\u8FDB\u589E\u5F3A\u63D0\u793A\u8BCD\uFF0C\u6A21\u578B\u5224\u65AD\u5148\u540E\u987A\u5E8F\u65F6\u66F4\u51C6\u786E\u3002"
  })
});
var SCOPE_COPY = Object.freeze({
  group: Object.freeze({
    title: "\u7FA4\u804A",
    enable: "\u542F\u7528",
    fieldsHelpLabel: "\u67E5\u770B\u7FA4\u804A\u6765\u6E90\u5B57\u6BB5\u8BF4\u660E",
    senderNameHelpLabel: "\u67E5\u770B\u7FA4\u804A\u53D1\u9001\u8005\u6635\u79F0\u5B57\u6BB5\u8BF4\u660E",
    conversationTitleHelpLabel: "\u67E5\u770B\u7FA4\u804A\u4F1A\u8BDD\u6807\u9898\u5B57\u6BB5\u8BF4\u660E",
    chatIdHelpLabel: "\u67E5\u770B\u7FA4\u804A\u4F1A\u8BDD\u6807\u8BC6\u5B57\u6BB5\u8BF4\u660E",
    threadIdHelpLabel: "\u67E5\u770B\u7FA4\u804A\u8BDD\u9898\u6807\u8BC6\u5B57\u6BB5\u8BF4\u660E",
    sentAtHelpLabel: "\u67E5\u770B\u7FA4\u804A\u53D1\u9001\u65F6\u95F4\u5B57\u6BB5\u8BF4\u660E",
    guidanceLabel: "\u589E\u5F3A\u63D0\u793A\u8BCD",
    guidanceHelpLabel: "\u67E5\u770B\u7FA4\u804A\u589E\u5F3A\u63D0\u793A\u8BCD\u4F7F\u7528\u8BF4\u660E",
    guidanceUsage: "\u7528\u4E8E\u544A\u8BC9\u6A21\u578B\u5982\u4F55\u4F7F\u7528\u5F53\u524D\u7FA4\u804A\u6D88\u606F\u7684 <dsh_im_source> \u6765\u6E90\u5B57\u6BB5\u3002\u53EA\u586B\u5199\u6B63\u6587\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u6DFB\u52A0 <dsh_im_source_guidance> \u6210\u5BF9\u6807\u7B7E\u3002",
    guidanceBehavior: "\u4EC5\u5728\u7FA4\u804A\u5F00\u5173\u5F00\u542F\u65F6\u4F7F\u7528\u3002\u6E05\u7A7A\u5E76\u4FDD\u5B58\u540E\u4E0D\u518D\u9644\u52A0\u7FA4\u804A\u589E\u5F3A\u63D0\u793A\u8BCD\uFF1B\u6240\u9009\u6765\u6E90\u5B57\u6BB5\u4ECD\u6309\u5F53\u524D\u573A\u666F\u8BBE\u7F6E\u53D1\u9001\u3002"
  }),
  direct: Object.freeze({
    title: "\u79C1\u804A",
    enable: "\u542F\u7528",
    fieldsHelpLabel: "\u67E5\u770B\u79C1\u804A\u6765\u6E90\u5B57\u6BB5\u8BF4\u660E",
    senderNameHelpLabel: "\u67E5\u770B\u79C1\u804A\u53D1\u9001\u8005\u6635\u79F0\u5B57\u6BB5\u8BF4\u660E",
    conversationTitleHelpLabel: "\u67E5\u770B\u79C1\u804A\u4F1A\u8BDD\u6807\u9898\u5B57\u6BB5\u8BF4\u660E",
    chatIdHelpLabel: "\u67E5\u770B\u79C1\u804A\u4F1A\u8BDD\u6807\u8BC6\u5B57\u6BB5\u8BF4\u660E",
    threadIdHelpLabel: "\u67E5\u770B\u79C1\u804A\u8BDD\u9898\u6807\u8BC6\u5B57\u6BB5\u8BF4\u660E",
    sentAtHelpLabel: "\u67E5\u770B\u79C1\u804A\u53D1\u9001\u65F6\u95F4\u5B57\u6BB5\u8BF4\u660E",
    guidanceLabel: "\u589E\u5F3A\u63D0\u793A\u8BCD",
    guidanceHelpLabel: "\u67E5\u770B\u79C1\u804A\u589E\u5F3A\u63D0\u793A\u8BCD\u4F7F\u7528\u8BF4\u660E",
    guidanceUsage: "\u7528\u4E8E\u544A\u8BC9\u6A21\u578B\u5982\u4F55\u4F7F\u7528\u5F53\u524D\u79C1\u804A\u6D88\u606F\u7684 <dsh_im_source> \u6765\u6E90\u5B57\u6BB5\u3002\u53EA\u586B\u5199\u6B63\u6587\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u6DFB\u52A0 <dsh_im_source_guidance> \u6210\u5BF9\u6807\u7B7E\u3002",
    guidanceBehavior: "\u4EC5\u5728\u79C1\u804A\u5F00\u5173\u5F00\u542F\u65F6\u4F7F\u7528\u3002\u6E05\u7A7A\u5E76\u4FDD\u5B58\u540E\u4E0D\u518D\u9644\u52A0\u79C1\u804A\u589E\u5F3A\u63D0\u793A\u8BCD\uFF1B\u6240\u9009\u6765\u6E90\u5B57\u6BB5\u4ECD\u6309\u5F53\u524D\u573A\u666F\u8BBE\u7F6E\u53D1\u9001\u3002"
  })
});
function contextEnhancementLabel(config) {
  const { group, direct } = normalizeContextEnhancementConfig(config);
  if (group.enabled && direct.enabled) return "\u7FA4\u804A\u548C\u79C1\u804A";
  if (group.enabled) return "\u4EC5\u7FA4\u804A";
  if (direct.enabled) return "\u4EC5\u79C1\u804A";
  return "\u672A\u5F00\u542F";
}
function ContextIcon({ kind = "sliders" }) {
  const path = kind === "close" ? "M6 6l12 12M6 18 18 6" : kind === "chevron" ? "m9 5 7 7-7 7" : "M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-3M14 20H3M14 2v4M8 10v4M18 18v4";
  return h3("svg", {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false"
  }, h3("path", { d: path }));
}
function ContextEnhancementScopeEditor({
  kind,
  scope,
  example,
  supported,
  busy,
  idPrefix,
  onChange
}) {
  const copy = SCOPE_COPY[kind];
  const unavailableId = `${idPrefix}-${kind}-unavailable`;
  const fieldsHelpId = `${idPrefix}-${kind}-fields-help`;
  const guidanceId = `${idPrefix}-${kind}-guidance`;
  const guidanceHelpId = `${idPrefix}-${kind}-guidance-help`;
  const disabled = busy || !supported;
  return h3(
    "fieldset",
    {
      className: "dim-contextSection dim-contextScope",
      "data-context-kind": kind,
      "aria-label": copy.title,
      disabled
    },
    h3(
      "label",
      { className: "dim-contextSwitchRow" },
      h3(
        "span",
        { className: "dim-contextSwitchLabel" },
        h3("span", null, copy.enable),
        !supported ? h3("span", {
          id: unavailableId,
          className: "dim-contextUnavailable"
        }, "\uFF08\u5F53\u524D\u6E20\u9053\u4E0D\u652F\u6301\u7FA4\u804A\uFF09") : null
      ),
      h3("input", {
        type: "checkbox",
        role: "switch",
        className: "dim-contextSwitch",
        checked: supported && scope.enabled,
        disabled,
        "aria-describedby": !supported ? unavailableId : void 0,
        onChange: (event) => {
          if (supported) onChange("enabled", event.target.checked);
        }
      })
    ),
    h3(
      "div",
      { className: "dim-contextScopeBlock" },
      h3(
        "div",
        { className: "dim-contextLegend" },
        h3("span", null, "\u6765\u6E90\u5B57\u6BB5"),
        h3(
          "span",
          { className: "dim-contextHelp dim-contextLegendHelp" },
          h3("button", {
            type: "button",
            className: "dim-contextHelpButton",
            disabled,
            "aria-label": copy.fieldsHelpLabel,
            "aria-describedby": fieldsHelpId
          }, h3("span", { "aria-hidden": "true" }, "?")),
          h3(
            "span",
            { id: fieldsHelpId, className: "dim-contextTooltip dim-contextLegendTooltip", role: "tooltip" },
            "\u589E\u5F3A\u63D0\u793A\u8BCD\u4E2D\u8BF7\u4F7F\u7528\u5B57\u6BB5\u540D\uFF08\u5982 senderId\u3001conversationType\uFF09\u5F15\u7528\u8FD9\u4E9B\u4FE1\u606F\u3002\u53EA\u53D1\u9001\u5F53\u524D\u4F1A\u8BDD\u4E2D\u52FE\u9009\u4E14\u53EF\u7528\u7684\u5B57\u6BB5\uFF0C\u4E0D\u4F1A\u989D\u5916\u67E5\u8BE2\u6216\u8865\u5168\u3002"
          )
        )
      ),
      h3("div", { className: "dim-contextFields" }, CONTEXT_ENHANCEMENT_FIELDS.map((field) => {
        const fieldId = `${idPrefix}-${kind}-field-${field}`;
        return h3(
          "div",
          { key: field, className: "dim-contextField" },
          h3("input", {
            id: fieldId,
            type: "checkbox",
            name: `${kind}-${field}`,
            checked: scope.fields.includes(field),
            disabled,
            onChange: (event) => onChange("fields", event.target.checked ? [...scope.fields, field] : scope.fields.filter((value) => value !== field))
          }),
          h3(
            "span",
            { className: "dim-contextFieldText" },
            h3("label", { className: "dim-contextFieldName", htmlFor: fieldId }, FIELD_LABELS[field]),
            FIELD_HELP[field] ? h3(
              "span",
              { className: "dim-contextHelp dim-contextFieldHelp" },
              h3("button", {
                type: "button",
                className: "dim-contextHelpButton dim-contextFieldHelpButton",
                disabled,
                "aria-label": copy[FIELD_HELP[field].labelKey],
                "aria-describedby": `${idPrefix}-${kind}-${field}-help`
              }, h3("span", { "aria-hidden": "true" }, "?")),
              h3("span", {
                id: `${idPrefix}-${kind}-${field}-help`,
                className: "dim-contextTooltip dim-contextFieldTooltip",
                role: "tooltip"
              }, FIELD_HELP[field].text)
            ) : null,
            h3("label", { className: "dim-contextFieldKey", htmlFor: fieldId }, field)
          )
        );
      }))
    ),
    h3(
      "div",
      { className: "dim-contextGuidance dim-contextScopeBlock" },
      h3(
        "div",
        { className: "dim-contextEditorHeader" },
        h3(
          "span",
          { className: "dim-contextEditorTitle" },
          h3("label", { htmlFor: guidanceId }, copy.guidanceLabel),
          h3(
            "span",
            { className: "dim-contextHelp" },
            h3("button", {
              type: "button",
              className: "dim-contextHelpButton",
              disabled,
              "aria-label": copy.guidanceHelpLabel,
              "aria-describedby": guidanceHelpId
            }, h3("span", { "aria-hidden": "true" }, "?")),
            h3(
              "span",
              { id: guidanceHelpId, className: "dim-contextTooltip dim-contextGuidanceTooltip", role: "tooltip" },
              h3("strong", null, "\u4F7F\u7528\u8BF4\u660E"),
              h3("span", null, copy.guidanceUsage),
              h3("strong", null, "\u751F\u6548\u89C4\u5219"),
              h3("span", null, copy.guidanceBehavior),
              h3("strong", null, "\u9690\u79C1\u63D0\u793A"),
              h3("span", null, "\u53D1\u9001\u8005\u6807\u8BC6\u53EF\u80FD\u5305\u542B\u5E73\u53F0\u7528\u6237 ID \u6216\u7535\u8BDD\u53F7\u7801\u5F62\u5F0F\u7684\u6807\u8BC6\u3002\u5173\u95ED\u5F00\u5173\u4E0D\u4F1A\u5220\u9664\u5DF2\u7ECF\u5199\u5165\u4F1A\u8BDD\u5386\u53F2\u7684\u4FE1\u606F\u3002"),
              h3("strong", null, "\u4F7F\u7528\u793A\u4F8B"),
              h3("span", { className: "dim-contextTooltipExample" }, example)
            )
          )
        ),
        h3(
          "div",
          { className: "dim-contextTextActions" },
          h3("button", { type: "button", disabled, onClick: () => onChange("guidance", example) }, "\u586B\u5165\u793A\u4F8B"),
          h3("button", { type: "button", disabled, onClick: () => onChange("guidance", "") }, "\u6E05\u7A7A")
        )
      ),
      h3("textarea", {
        id: guidanceId,
        value: scope.guidance,
        placeholder: example,
        rows: 4,
        disabled,
        "data-context-kind": kind,
        maxLength: CONTEXT_ENHANCEMENT_GUIDANCE_MAX_LENGTH,
        "aria-describedby": guidanceHelpId,
        onChange: (event) => onChange("guidance", event.target.value)
      })
    )
  );
}
function ContextEnhancementDialog({ config, groupSupported, disabled, onSave, onClose, returnFocusRef, id: id2 }) {
  const [draft, setDraft] = React13.useState(() => {
    const normalized = normalizeContextEnhancementConfig(config);
    return {
      ...normalized,
      ...!groupSupported ? {
        group: { ...normalized.group, enabled: false }
      } : {}
    };
  });
  const [saving, setSaving] = React13.useState(false);
  const [error, setError] = React13.useState(null);
  const [activeScope, setActiveScope] = React13.useState("direct");
  const savingRef = React13.useRef(false);
  const dialogRef = React13.useRef(null);
  const mountedRef = React13.useRef(true);
  const groupTabRef = React13.useRef(null);
  const directTabRef = React13.useRef(null);
  const titleId = React13.useId();
  const descriptionId = React13.useId();
  const scopeIdPrefix = React13.useId();
  const groupGuidanceExample = localizeText(CONTEXT_GROUP_GUIDANCE_EXAMPLE);
  const directGuidanceExample = localizeText(CONTEXT_DIRECT_GUIDANCE_EXAMPLE);
  const busy = disabled || saving;
  const scopeKinds = ["direct", "group"];
  const tabRefs = { group: groupTabRef, direct: directTabRef };
  React13.useEffect(() => {
    mountedRef.current = true;
    dialogRef.current?.focus?.();
    const keepFocus = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) dialogRef.current.focus();
    };
    globalThis.document?.addEventListener?.("focusin", keepFocus);
    return () => {
      mountedRef.current = false;
      globalThis.document?.removeEventListener?.("focusin", keepFocus);
      queueMicrotask(() => returnFocusRef.current?.focus?.());
    };
  }, [returnFocusRef]);
  const changeScope = (kind, key, value) => {
    if (busy || savingRef.current) return;
    setDraft((current) => ({
      ...current,
      [kind]: { ...current[kind], [key]: value }
    }));
    setError(null);
  };
  const cancel = () => {
    if (!savingRef.current) onClose();
  };
  const activateScope = (kind, focus = false) => {
    if (busy || !scopeKinds.includes(kind)) return;
    setActiveScope(kind);
    if (focus) tabRefs[kind].current?.focus?.();
  };
  const handleTabKeyDown = (event, kind) => {
    let next;
    if (event.key === "Home") next = scopeKinds[0];
    else if (event.key === "End") next = scopeKinds.at(-1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const offset = event.key === "ArrowRight" ? 1 : -1;
      next = scopeKinds[(scopeKinds.indexOf(kind) + offset + scopeKinds.length) % scopeKinds.length];
    }
    if (!next) return;
    event.preventDefault();
    activateScope(next, true);
  };
  const save = async () => {
    if (busy || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    dialogRef.current?.focus?.();
    try {
      const next = validateContextEnhancementConfig(draft);
      await onSave(next);
      if (mountedRef.current) onClose();
    } catch (cause) {
      if (mountedRef.current) setError(cause?.message ?? "\u4E0A\u4E0B\u6587\u589E\u5F3A\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };
  const content = h3("div", {
    className: "dim-contextBackdrop",
    onMouseDown: (event) => {
      if (event.target === event.currentTarget) cancel();
    }
  }, h3(
    "section",
    {
      id: id2,
      ref: dialogRef,
      className: "dim-contextDialog",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
      "aria-describedby": descriptionId,
      "aria-busy": saving,
      tabIndex: -1,
      onKeyDown: (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          cancel();
        }
        if (event.key !== "Tab") return;
        const controls = dialogRef.current?.querySelectorAll?.(
          "button:not(:disabled), input:not(:disabled), textarea:not(:disabled)"
        );
        if (!controls?.length) {
          event.preventDefault();
          dialogRef.current?.focus?.();
          return;
        }
        const first = controls[0];
        const last = controls[controls.length - 1];
        const active = globalThis.document?.activeElement;
        if (event.shiftKey && (active === first || active === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || active === dialogRef.current)) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    h3(
      "header",
      { className: "dim-contextHeader" },
      h3(
        "div",
        { className: "dim-contextHeaderTitle" },
        h3("h3", { id: titleId }, "\u4E0A\u4E0B\u6587\u589E\u5F3A"),
        h3(
          "span",
          { className: "dim-contextHelp dim-contextHeaderHelp" },
          h3("button", {
            type: "button",
            className: "dim-contextHelpButton",
            disabled: busy,
            "aria-label": "\u67E5\u770B\u4E0A\u4E0B\u6587\u589E\u5F3A\u8BF4\u660E",
            "aria-describedby": descriptionId
          }, h3("span", { "aria-hidden": "true" }, "?")),
          h3(
            "span",
            { id: descriptionId, className: "dim-contextTooltip dim-contextHeaderTooltip", role: "tooltip" },
            "\u9009\u62E9\u5728\u54EA\u4E9B\u4F1A\u8BDD\u4E2D\u542F\u7528\u3001\u63D0\u4F9B\u54EA\u4E9B\u6765\u6E90\u5B57\u6BB5\uFF0C\u4EE5\u53CA\u5982\u4F55\u4F7F\u7528\u8FD9\u4E9B\u4FE1\u606F\u3002\u4EC5\u4F7F\u7528\u5DF2\u6709\u6D88\u606F\u5143\u6570\u636E\uFF0C\u4E0D\u67E5\u8BE2\u5E73\u53F0 API\u3002"
          )
        )
      ),
      h3("button", {
        type: "button",
        className: "dim-contextClose",
        "aria-label": "\u5173\u95ED\u5F39\u7A97",
        disabled: saving,
        onClick: cancel
      }, h3(ContextIcon, { kind: "close" }))
    ),
    h3(
      "div",
      { className: "dim-contextTabs", role: "tablist", "aria-label": "\u4E0A\u4E0B\u6587\u589E\u5F3A\u8303\u56F4" },
      scopeKinds.map((kind) => {
        const selected = activeScope === kind;
        return h3("button", {
          key: kind,
          id: `${scopeIdPrefix}-${kind}-tab`,
          ref: tabRefs[kind],
          type: "button",
          role: "tab",
          className: "dim-contextTab",
          "data-context-kind": kind,
          "aria-selected": selected,
          "aria-controls": `${scopeIdPrefix}-${kind}-panel`,
          tabIndex: selected ? 0 : -1,
          disabled: busy,
          onClick: () => activateScope(kind),
          onKeyDown: (event) => handleTabKeyDown(event, kind)
        }, SCOPE_COPY[kind].title);
      })
    ),
    scopeKinds.map((kind) => h3("div", {
      key: kind,
      id: `${scopeIdPrefix}-${kind}-panel`,
      className: "dim-contextTabPanel",
      role: "tabpanel",
      "data-context-kind": kind,
      "aria-labelledby": `${scopeIdPrefix}-${kind}-tab`,
      hidden: activeScope !== kind
    }, h3(ContextEnhancementScopeEditor, {
      kind,
      scope: draft[kind],
      example: kind === "group" ? groupGuidanceExample : directGuidanceExample,
      supported: kind === "group" ? groupSupported : true,
      busy,
      idPrefix: scopeIdPrefix,
      onChange: (key, value) => changeScope(kind, key, value)
    }))),
    error ? h3("p", { className: "dim-contextError", role: "alert" }, error) : null,
    h3(
      "footer",
      { className: "dim-contextFooter" },
      h3("button", { type: "button", disabled: saving, onClick: cancel }, "\u53D6\u6D88"),
      h3("button", {
        type: "button",
        className: "dim-contextSave",
        disabled: busy,
        onClick: () => {
          void save();
        }
      }, saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58")
    )
  ));
  return globalThis.document?.body ? (0, import_react_dom3.createPortal)(content, document.body) : content;
}
function ContextEnhancementEditor({ config, groupSupported = true, disabled = false, onSave }) {
  const [open, setOpen] = React13.useState(false);
  const entryRef = React13.useRef(null);
  const dialogId = React13.useId();
  const statusId = React13.useId();
  const saved = normalizeContextEnhancementConfig(config);
  const label = contextEnhancementLabel(groupSupported ? saved : {
    ...saved,
    group: { ...saved.group, enabled: false }
  });
  return h3(
    React13.Fragment,
    null,
    h3(
      "button",
      {
        type: "button",
        ref: entryRef,
        className: "dim-contextEntry",
        disabled,
        "aria-label": "\u4E0A\u4E0B\u6587\u589E\u5F3A",
        "aria-describedby": statusId,
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        "aria-controls": open ? dialogId : void 0,
        onClick: () => setOpen(true)
      },
      h3(ContextIcon),
      h3("span", { className: "dim-contextLabel" }, "\u4E0A\u4E0B\u6587\u589E\u5F3A"),
      h3("span", { id: statusId, className: "dim-contextStatus", "data-active": label !== "\u672A\u5F00\u542F", "aria-live": "polite" }, label),
      h3(ContextIcon, { kind: "chevron" })
    ),
    open ? h3(ContextEnhancementDialog, {
      id: dialogId,
      config,
      groupSupported,
      disabled,
      onSave,
      onClose: () => setOpen(false),
      returnFocusRef: entryRef
    }) : null
  );
}

// plugin-src/client/workspace-snapshot-fence.js
var React14 = __toESM(require("react"), 1);
function useWorkspaceSnapshotFence() {
  const state = React14.useRef({ version: 0, pendingMutations: 0 });
  return React14.useMemo(() => Object.freeze({
    beginStatus() {
      return state.current.pendingMutations === 0 ? state.current.version : null;
    },
    canCommitStatus(version) {
      return version !== null && state.current.pendingMutations === 0 && state.current.version === version;
    },
    beginMutation() {
      state.current.pendingMutations += 1;
      state.current.version += 1;
      return state.current.version;
    },
    canCommitMutation(version) {
      return state.current.version === version;
    },
    endMutation() {
      state.current.pendingMutations = Math.max(0, state.current.pendingMutations - 1);
      return state.current.pendingMutations === 0;
    }
  }), []);
}

// plugin-src/client/channels/shared/base-styles.js
var DINGTALK_STYLE_ID = "xmanrui-dsh-im-dingtalk-settings";
var CSS = String.raw`
.ddt-page {
  --ddt-accent: #1677ff;
  --ddt-accent-deep: #0958d9;
  --ddt-accent-wash: #eaf3ff;
  --ddt-success: var(--dsw-alias-state-success-primary, #20a162);
  --ddt-warning: var(--dsw-alias-state-warn-primary, #d97706);
  --ddt-error: var(--dsw-alias-state-error-primary, #d54941);
  width: 100%;
  max-width: 880px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 2px 0 28px;
  container-type: inline-size;
  color: var(--dsw-alias-label-primary, #1f2329);
  box-sizing: border-box;
}
.ddt-page *, .ddt-page *::before, .ddt-page *::after { box-sizing: border-box; }
.ddt-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.ddt-headingCopy { min-width: 0; }
.ddt-heading h2, .ddt-heading p, .ddt-card h3, .ddt-card h4, .ddt-card p { margin: 0; }
.ddt-eyebrow { margin-bottom: 3px; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 12px; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; }
.ddt-heading h2 { font-size: 20px; line-height: 28px; font-weight: 680; }
.ddt-heading p { margin-top: 5px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 13px; line-height: 20px; white-space: nowrap; }
.ddt-tools, .ddt-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.ddt-tools { width: 100%; justify-content: space-between; flex-wrap: nowrap; }
.ddt-badge { min-height: 30px; display: inline-flex; align-items: center; gap: 7px; padding: 0 11px; border-radius: 999px; color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-module-platform, #f2f3f5); font-size: 12px; white-space: nowrap; }
.ddt-dot { width: 8px; height: 8px; flex: none; border-radius: 50%; background: #aeb3bb; }
.ddt-dot[data-tone="success"] { background: var(--ddt-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ddt-success) 14%, transparent); }
.ddt-dot[data-tone="warning"] { background: var(--ddt-warning); }
.ddt-dot[data-tone="error"] { background: var(--ddt-error); }
.ddt-button { min-height: 34px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0 13px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 13px; font-weight: 560; text-decoration: none; cursor: pointer; transition: border-color .15s ease, background .15s ease, transform .15s ease; }
.ddt-button:hover:not(:disabled) { border-color: #aeb3bb; background: var(--dsw-alias-interactive-bg-hover, #f7f8fa); }
.ddt-button:active:not(:disabled) { transform: translateY(1px); }
.ddt-button:focus-visible { outline: 2px solid color-mix(in srgb, var(--ddt-accent) 70%, white); outline-offset: 2px; }
.ddt-button:disabled { cursor: not-allowed; opacity: .55; }
.ddt-button[data-kind="primary"] { color: #fff; border-color: var(--ddt-accent); background: var(--ddt-accent); }
.ddt-button[data-kind="primary"]:hover:not(:disabled) { border-color: var(--ddt-accent-deep); background: var(--ddt-accent-deep); }
.ddt-button[data-kind="danger"] { color: var(--ddt-error); }
.ddt-button[data-kind="quiet"] { min-height: 30px; padding: 0 10px; border-color: transparent; background: transparent; }
.ddt-card { overflow: hidden; border: 1px solid var(--dsw-alias-border-l2, #e5e6eb); border-radius: 14px; background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: 0 1px 2px rgb(31 35 41 / 3%); }
.ddt-cardBody { padding: 24px; }
.ddt-empty { min-height: 230px; display: grid; grid-template-columns: minmax(0, 1fr) 180px; align-items: center; gap: 30px; }
.ddt-empty h3 { margin: 8px 0; font-size: 18px; }
.ddt-empty p { max-width: 560px; color: var(--dsw-alias-label-secondary, #646a73); line-height: 1.65; }
.ddt-empty .ddt-actions { margin-top: 20px; }
.ddt-brandMark { width: 110px; height: 110px; display: grid; place-items: center; justify-self: center; border-radius: 28px; color: #fff; background: linear-gradient(145deg, #2997ff, var(--ddt-accent)); box-shadow: 0 18px 45px rgb(22 119 255 / 23%); }
.ddt-brandMark svg { filter: drop-shadow(0 3px 8px rgb(0 35 96 / 16%)); }
.ddt-qrLayout { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 34px; align-items: start; }
.ddt-qrColumn { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.ddt-qrFrame { position: relative; width: min(270px, 100%); aspect-ratio: 1; display: grid; place-items: center; overflow: hidden; padding: 10px; border: 1px solid var(--dsw-alias-border-l2, #e5e6eb); border-radius: 16px; background: #fff; }
.ddt-qrFrame::before { content: ''; position: absolute; inset: 6px; border: 1px solid rgb(22 119 255 / 10%); border-radius: 11px; pointer-events: none; }
.ddt-qrFrame img { display: block; width: 100%; height: 100%; object-fit: contain; }
.ddt-qrFallback { padding: 24px; color: #646a73; text-align: center; }
.ddt-expired { position: absolute; inset: 0; display: grid; place-items: center; padding: 30px; color: #fff; text-align: center; font-weight: 650; white-space: pre-line; background: rgb(31 35 41 / 76%); backdrop-filter: blur(3px); }
.ddt-countdown { width: min(270px, 100%); color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; }
.ddt-countdownTop { display: flex; justify-content: space-between; margin-bottom: 6px; }
.ddt-countdown strong { color: var(--dsw-alias-label-primary, #1f2329); font-variant-numeric: tabular-nums; }
.ddt-progress { height: 4px; overflow: hidden; border-radius: 99px; background: #eef0f3; }
.ddt-progress span { display: block; width: var(--ddt-progress); height: 100%; background: var(--ddt-accent); transition: width .2s linear; }
.ddt-stateLabel { display: inline-flex; align-items: center; gap: 8px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; font-weight: 600; }
.ddt-qrCopy { min-width: 0; overflow-wrap: anywhere; }
.ddt-qrCopy h3 { margin: 9px 0 8px; font-size: 18px; }
.ddt-qrCopy > p { color: var(--dsw-alias-label-secondary, #646a73); line-height: 1.65; }
.ddt-steps { margin: 18px 0 16px; padding: 0; list-style: none; counter-reset: ddt-step; }
.ddt-steps li { position: relative; min-height: 28px; padding: 3px 0 3px 36px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 13px; line-height: 22px; counter-increment: ddt-step; }
.ddt-steps li::before { content: counter(ddt-step); position: absolute; left: 0; top: 1px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: var(--ddt-accent-deep); background: var(--ddt-accent-wash); font-size: 12px; font-weight: 700; }
.ddt-loading { padding: 38px; color: var(--dsw-alias-label-secondary, #646a73); text-align: center; }
.ddt-loading h3 { margin: 0 0 7px; color: var(--dsw-alias-label-primary, #1f2329); font-size: 17px; }
.ddt-loading p { line-height: 1.6; }
.ddt-spinner { width: 24px; height: 24px; margin: 0 auto 13px; border: 3px solid #e6e8eb; border-top-color: var(--ddt-accent); border-radius: 50%; animation: ddt-spin .8s linear infinite; }
.ddt-statusNotice, .ddt-inlineError { display: flex; align-items: flex-start; gap: 10px; padding: 13px 15px; border: 1px solid color-mix(in srgb, var(--ddt-error) 28%, transparent); border-radius: 10px; color: var(--ddt-error); background: color-mix(in srgb, var(--ddt-error) 7%, transparent); font-size: 13px; }
.ddt-inlineError { flex-direction: column; padding: 22px; }
.ddt-inlineError h3 { font-size: 17px; }
.ddt-inlineError p { line-height: 1.55; }
.ddt-errorCode { font: 11px ui-monospace, SFMono-Regular, monospace; opacity: .8; }
.ddt-errorDiagnostic { display: grid; gap: 5px; color: var(--ddt-error); }
.ddt-errorHint { margin: 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 1.55; }
.ddt-listHeading { display: flex; align-items: center; justify-content: space-between; margin: 2px 0 9px; }
.ddt-listHeading h3 { margin: 0; font-size: 14px; }
.ddt-list { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.ddt-accountTop { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.ddt-accountIdentity { min-width: 0; display: flex; align-items: center; gap: 12px; }
.ddt-avatar { width: 42px; height: 42px; display: grid; place-items: center; flex: none; border-radius: 12px; color: #fff; background: linear-gradient(145deg, #2997ff, var(--ddt-accent)); }
.ddt-accountIdentity h3 { overflow: hidden; font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
.ddt-accountIdentity p { margin-top: 4px; color: var(--dsw-alias-label-secondary, #646a73); font: 12px ui-monospace, SFMono-Regular, monospace; }
.ddt-health { display: inline-flex; align-items: center; gap: 7px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; white-space: nowrap; }
.ddt-accountFooter { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding-top: 16px; border-top: 1px solid var(--dsw-alias-border-l1, #eef0f3); }
.ddt-accountFooter .ddt-actions { flex: none; flex-wrap: nowrap; gap: 8px; margin-top: 0; }
.ddt-accountFooter .ddt-button { flex: none; white-space: nowrap; }
.ddt-summary { color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; }
.ddt-confirm { padding: 18px 24px; border-top: 1px solid color-mix(in srgb, var(--ddt-error) 25%, transparent); background: color-mix(in srgb, var(--ddt-error) 5%, transparent); }
.ddt-confirm strong { display: block; margin-bottom: 6px; font-size: 14px; }
.ddt-confirm p { color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 1.55; }
.ddt-confirm .ddt-actions { margin-top: 13px; }
.ddt-visuallyHidden { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@keyframes ddt-spin { to { transform: rotate(360deg); } }
@container (max-width: 680px) {
  .ddt-heading { flex-direction: column; align-items: stretch; }
  .ddt-tools { width: 100%; flex-wrap: nowrap; gap: 6px; }
  .ddt-tools .ddt-badge { min-height: 34px; padding-inline: 8px; }
  .ddt-tools .ddt-button { flex: none; padding-inline: 10px; white-space: nowrap; }
  .ddt-empty { grid-template-columns: minmax(0, 1fr); }
  .ddt-brandMark { display: none; }
  .ddt-qrLayout { grid-template-columns: minmax(0, 1fr); justify-items: center; gap: 24px; }
  .ddt-qrColumn { width: 100%; min-width: 0; }
  .ddt-qrCopy { width: 100%; }
}
@media (max-width: 720px) {
  .ddt-heading, .ddt-accountTop { flex-direction: column; align-items: stretch; }
  .ddt-heading p { white-space: normal; }
  .ddt-empty { grid-template-columns: minmax(0, 1fr); }
  .ddt-brandMark { display: none; }
  .ddt-qrLayout { grid-template-columns: minmax(0, 1fr); justify-items: center; }
  .ddt-qrCopy { width: 100%; }
  .ddt-cardBody { padding: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .ddt-page *, .ddt-page *::before, .ddt-page *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
`;
function installDingtalkStyles() {
  if (typeof document === "undefined") return () => {
  };
  const existing = document.querySelector(`style[data-plugin-css="${DINGTALK_STYLE_ID}"]`);
  if (existing) return () => {
  };
  const style = document.createElement("style");
  style.dataset.plugin = "@xmanrui/dsh-im";
  style.dataset.pluginCss = DINGTALK_STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
  return () => style.remove();
}

// plugin-src/client/channels/qq/styles.js
var QQ_STYLE_ID = "xmanrui-dsh-im-qq-settings";
var CSS2 = String.raw`
.dqq-page { --ddt-accent: #1677ff; --ddt-accent-deep: #0958d9; --ddt-accent-wash: #eaf3ff; }
.dqq-avatar, .dqq-brand { color: #fff; background: #1677ff; }
.dqq-avatar svg, .dqq-brand svg { display: block; }
`;
function installQqStyles() {
  if (typeof document === "undefined") return () => {
  };
  const existing = document.querySelector(`style[data-plugin-css="${QQ_STYLE_ID}"]`);
  if (existing) return () => {
  };
  const style = document.createElement("style");
  style.dataset.plugin = "@xmanrui/dsh-im";
  style.dataset.pluginCss = QQ_STYLE_ID;
  style.textContent = CSS2;
  document.head.appendChild(style);
  return () => style.remove();
}

// plugin-src/client/channels/qq/index.js
var ACTIVE_STATES = /* @__PURE__ */ new Set(["pending", "refreshing", "connecting"]);
var Button = React15.forwardRef(function Button2({ children, kind = "secondary", className = "", ...props }, ref) {
  return h3("button", {
    ...props,
    ref,
    type: "button",
    className: `ddt-button ${className}`.trim(),
    "data-kind": kind
  }, children);
});
function checkedTime(value) {
  if (!value) return "\u5C1A\u672A\u68C0\u67E5";
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date(value));
  } catch {
    return "\u521A\u521A";
  }
}
function Heading({ totals, adding, busy, onAdd, onCredential, credentialOpen, addButtonRef }) {
  return h3(
    "div",
    { className: "ddt-heading" },
    h3(
      "div",
      { className: "ddt-tools" },
      h3(
        "div",
        { className: "dim-bindActions" },
        h3(Button, {
          kind: "primary",
          className: "dim-scanButton",
          onClick: onAdd,
          disabled: adding || busy,
          ref: addButtonRef,
          "aria-label": "\u626B\u7801\u63A5\u5165 QQ \u673A\u5668\u4EBA"
        }, h3(QrActionIcon), adding ? "\u6B63\u5728\u63A5\u5165" : "\u626B\u7801\u63A5\u5165\u673A\u5668\u4EBA"),
        h3(Button, {
          kind: "credential",
          className: "dim-credentialButton",
          onClick: onCredential,
          disabled: adding || busy,
          "aria-pressed": credentialOpen,
          "aria-label": "\u4F7F\u7528 AppID \u548C AppSecret \u7ED1\u5B9A QQ \u673A\u5668\u4EBA"
        }, h3(CredentialActionIcon), credentialOpen ? "\u6536\u8D77\u51ED\u636E" : "\u624B\u52A8\u63A5\u5165")
      ),
      totals.configured > 0 ? h3(
        "div",
        { className: "ddt-badge dim-onlineBadge" },
        h3("span", null, `${totals.connected} / ${totals.configured} \u5728\u7EBF`)
      ) : null
    )
  );
}
function LoadingView() {
  return h3(
    "div",
    { className: "ddt-card ddt-loading dim-surfaceCard dim-loadingView", "aria-busy": "true" },
    h3("div", { className: "ddt-spinner dim-spinner" }),
    h3("span", null, "\u6B63\u5728\u8BFB\u53D6 QQ \u673A\u5668\u4EBA\u72B6\u6001\u2026")
  );
}
function EmptyView({ busy, onStart }) {
  return h3(
    "div",
    { className: "ddt-card dim-surfaceCard" },
    h3(
      "div",
      { className: "ddt-cardBody ddt-empty dim-surfaceBody dim-emptyView" },
      h3(
        "div",
        { className: "dim-emptyCopy" },
        h3(
          "div",
          { className: "ddt-stateLabel dim-stateLabel" },
          h3("span", { className: "ddt-dot dim-stateDot" }),
          h3("span", null, "\u5C1A\u672A\u7ED1\u5B9A QQ \u673A\u5668\u4EBA")
        ),
        h3("h3", null, "\u4F7F\u7528\u624B\u673A QQ \u626B\u7801\u521B\u5EFA\u5E76\u7ED1\u5B9A\u673A\u5668\u4EBA"),
        h3("p", null, "\u626B\u7801\u7531\u817E\u8BAF\u5B98\u65B9\u9875\u9762\u5B8C\u6210\uFF0C\u4E0D\u9700\u8981\u624B\u52A8\u586B\u5199 AppID \u6216 AppSecret\u3002\u626B\u7801\u6210\u529F\u540E\uFF0C\u673A\u5668\u4EBA\u4F1A\u81EA\u52A8\u8FDE\u63A5 DeepSeek Harness\u3002"),
        h3(
          "div",
          { className: "ddt-actions dim-viewActions" },
          h3(
            Button,
            { kind: "primary", onClick: onStart, disabled: busy },
            busy ? "\u6B63\u5728\u751F\u6210\u4E8C\u7EF4\u7801\u2026" : "\u751F\u6210 QQ \u4E8C\u7EF4\u7801"
          )
        )
      ),
      h3(
        "div",
        { className: "ddt-brandMark dim-emptyBrand dqq-brand", "aria-hidden": "true" },
        h3(QqLogoGlyph, { size: 64 })
      )
    )
  );
}
function QrPanel({ provision, now, busy, onRefresh, onCancel }) {
  const source = safeQrSource(provision.qrCodeDataUrl);
  const remaining = Math.max(0, provision.expiresAt - now);
  const duration = Math.max(1, provision.durationMs ?? 5 * 6e4);
  const progress = Math.round(Math.min(1, remaining / duration) * 100);
  const refreshing = provision.status === "refreshing";
  return h3(
    "div",
    { className: "ddt-card dim-surfaceCard" },
    h3(
      "div",
      { className: "ddt-cardBody ddt-qrLayout dim-surfaceBody dim-qrLayout" },
      h3(
        "div",
        { className: "ddt-qrColumn dim-qrColumn" },
        h3(
          "div",
          { className: "ddt-qrFrame dim-qrFrame" },
          source ? h3("img", { src: source, alt: "\u7528\u4E8E\u7ED1\u5B9A QQ \u673A\u5668\u4EBA\u7684\u4E00\u6B21\u6027\u4E8C\u7EF4\u7801" }) : h3(
            "div",
            { className: "ddt-qrFallback dim-qrFallback" },
            refreshing ? "\u4E8C\u7EF4\u7801\u6B63\u5728\u81EA\u52A8\u5237\u65B0\u2026" : "\u4E8C\u7EF4\u7801\u56FE\u7247\u6B63\u5728\u751F\u6210\u2026"
          )
        ),
        h3(
          "div",
          { className: "ddt-countdown dim-countdown" },
          h3(
            "div",
            { className: "ddt-countdownTop dim-countdownTop" },
            h3("span", null, "\u5F53\u524D\u4E8C\u7EF4\u7801\u6709\u6548\u65F6\u95F4"),
            h3("strong", null, refreshing ? "--:--" : formatRemaining(remaining))
          ),
          h3("div", { className: "ddt-progress dim-progress", style: { "--ddt-progress": `${progress}%` } }, h3("span"))
        )
      ),
      h3(
        "div",
        { className: "ddt-qrCopy dim-qrCopy" },
        h3(
          "div",
          { className: "ddt-stateLabel dim-stateLabel" },
          h3("span", { className: "ddt-dot dim-stateDot", "data-tone": "warning" }),
          h3("span", null, refreshing ? "\u6B63\u5728\u5237\u65B0\u4E8C\u7EF4\u7801" : "\u7B49\u5F85\u624B\u673A QQ \u626B\u7801")
        ),
        h3("h3", null, "\u4F7F\u7528\u624B\u673A QQ \u5B8C\u6210\u673A\u5668\u4EBA\u7ED1\u5B9A"),
        h3("p", null, "\u817E\u8BAF\u9875\u9762\u4F1A\u521B\u5EFA\u6216\u7ED1\u5B9A\u4E00\u4E2A QQ \u673A\u5668\u4EBA\uFF0C\u5E76\u628A\u8FDE\u63A5\u51ED\u636E\u5B89\u5168\u4EA4\u7ED9\u672C\u673A Harness Host\u3002"),
        h3(
          "ol",
          { className: "ddt-steps dim-steps" },
          h3("li", null, "\u6253\u5F00\u624B\u673A QQ\uFF0C\u626B\u63CF\u5DE6\u4FA7\u4E8C\u7EF4\u7801"),
          h3("li", null, "\u5728\u817E\u8BAF\u6388\u6743\u9875\u9762\u786E\u8BA4\u521B\u5EFA\u6216\u7ED1\u5B9A\u673A\u5668\u4EBA"),
          h3("li", null, "\u8FD4\u56DE\u8FD9\u91CC\u7B49\u5F85\u8FDE\u63A5\u5B8C\u6210")
        ),
        h3(
          "div",
          { className: "ddt-actions dim-viewActions" },
          h3(Button, { onClick: onRefresh, disabled: busy }, "\u91CD\u65B0\u751F\u6210\u4E8C\u7EF4\u7801"),
          h3(Button, { kind: "quiet", onClick: onCancel, disabled: busy }, "\u53D6\u6D88")
        )
      )
    )
  );
}
function ProvisionView({ provision, busy, onRetry, onClose }) {
  if (provision.status === "connecting") {
    return h3(
      "div",
      { className: "ddt-card ddt-loading dim-surfaceCard dim-specialView", "aria-busy": "true" },
      h3("div", { className: "ddt-spinner dim-spinner" }),
      h3("h3", null, "QQ \u5DF2\u6388\u6743\uFF0C\u6B63\u5728\u8FDE\u63A5\u673A\u5668\u4EBA"),
      h3("p", null, "\u51ED\u636E\u6B63\u5728\u5199\u5165\u672C\u673A\uFF0C\u5E76\u542F\u52A8 QQ WebSocket \u6D88\u606F\u8FDE\u63A5\u3002")
    );
  }
  const error = provision.error ?? { code: "QQ_PROVISION_FAILED", message: "QQ \u673A\u5668\u4EBA\u6CA1\u6709\u7ED1\u5B9A\u5B8C\u6210" };
  return h3(
    "div",
    { className: "ddt-card dim-surfaceCard" },
    h3(
      "div",
      { className: "ddt-inlineError dim-inlineError", role: "alert" },
      h3("h3", null, "QQ \u673A\u5668\u4EBA\u6CA1\u6709\u7ED1\u5B9A\u5B8C\u6210"),
      h3(ConnectionError, { error }),
      h3("span", { className: "ddt-errorCode" }, error.code),
      h3(
        "div",
        { className: "ddt-actions dim-viewActions" },
        h3(Button, { kind: "primary", onClick: onRetry, disabled: busy }, "\u91CD\u65B0\u751F\u6210\u4E8C\u7EF4\u7801"),
        h3(Button, { onClick: onClose, disabled: busy }, "\u5173\u95ED")
      )
    )
  );
}
function RemoveConfirmation({ account, busy, onConfirm, onCancel }) {
  return h3(
    "div",
    { className: "ddt-confirm dim-confirm", role: "alertdialog" },
    h3("strong", null, `\u4ECE DeepSeek Harness \u79FB\u9664\u201C${account.bot.name}\u201D\uFF1F`),
    h3("p", null, "\u8FD9\u4F1A\u505C\u6B62\u6D88\u606F\u8FDE\u63A5\uFF0C\u5E76\u5220\u9664\u672C\u673A\u4FDD\u5B58\u7684\u5E94\u7528\u51ED\u636E\u3001\u673A\u5668\u4EBA\u914D\u7F6E\u53CA\u4F1A\u8BDD\u6620\u5C04\u3002\u817E\u8BAF\u5E73\u53F0\u4E2D\u7684\u673A\u5668\u4EBA\u4E0D\u4F1A\u88AB\u81EA\u52A8\u5220\u9664\u3002"),
    h3(
      "div",
      { className: "ddt-actions dim-viewActions" },
      h3(Button, { onClick: onCancel, disabled: busy }, "\u4FDD\u7559\u673A\u5668\u4EBA"),
      h3(Button, { kind: "danger", onClick: onConfirm, disabled: busy }, busy ? "\u6B63\u5728\u79FB\u9664\u2026" : "\u786E\u8BA4\u79FB\u9664\u63A5\u5165")
    )
  );
}
function AccountCard({
  account,
  busy,
  feedback,
  removing,
  onReconnect,
  onWorkspaceSave,
  onAliasSave,
  onModelSave,
  onAgentPresetSave,
  onContextEnhancementSave,
  onRequestRemove,
  onConfirmRemove,
  onCancelRemove
}) {
  const tone = account.connected ? "success" : account.state === "error" ? "error" : "warning";
  const stateLabel = account.connected ? "\u8FD0\u884C\u6B63\u5E38" : account.state === "connecting" ? "\u6B63\u5728\u8FDE\u63A5" : "\u8FDE\u63A5\u672A\u5C31\u7EEA";
  const summary = account.error?.message ?? (account.connected ? null : account.health.summary);
  return h3(
    "article",
    { className: "ddt-card dim-botCard", "data-bot-id": account.botId },
    h3(
      "div",
      { className: "ddt-cardBody dim-botCardBody" },
      h3(
        CollapsibleAccountSection,
        {
          settings: h3(BotSettingsButton, {
            channel: "qq",
            botId: account.botId,
            botName: account.bot.name,
            connected: account.connected,
            accessPolicy: account.accessPolicy
          }),
          id: `qq-settings-${account.botId.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
          header: h3(
            "div",
            { className: "ddt-accountTop dim-botCardTop" },
            h3(
              "div",
              { className: "ddt-accountIdentity dim-botIdentity" },
              h3("div", { className: "ddt-avatar dim-botAvatar dqq-avatar", "aria-hidden": "true" }, h3(QqLogoGlyph, { size: 29 })),
              h3(
                "div",
                { className: "dim-botName" },
                h3(BotName, { bot: account.bot, disabled: Boolean(busy), onSave: onAliasSave }),
                h3("p", null, account.bot.appIdMasked)
              )
            ),
            h3(
              "div",
              {
                className: "dim-botCardTools",
                // The header is the collapse toggle; keep inner controls clickable.
                onClick: (event) => {
                  event.stopPropagation();
                },
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") event.stopPropagation();
                }
              },
              h3(BotStatusMeta, {
                className: "ddt-health",
                dotClassName: "ddt-dot",
                tone,
                stateLabel,
                lastCheckedAt: account.health.lastCheckedAt,
                formatCheckedTime: checkedTime
              }),
              h3(AccountSettingsToggle)
            )
          )
        },
        h3(WorkspaceEditor, {
          workspace: account.workspace,
          disabled: Boolean(busy),
          onSave: onWorkspaceSave
        }),
        h3(ModelEditor, {
          model: account.model,
          disabled: Boolean(busy),
          onSave: onModelSave
        }),
        h3(AgentPresetEditor, {
          agentPreset: account.agentPreset,
          disabled: Boolean(busy),
          onSave: onAgentPresetSave
        }),
        h3(ContextEnhancementEditor, {
          config: account.contextEnhancement,
          disabled: Boolean(busy),
          onSave: onContextEnhancementSave
        }),
        h3(
          "div",
          { className: "ddt-accountFooter dim-cardFooter" },
          h3(
            "div",
            { className: "dim-cardFooterLayout" },
            h3(
              "div",
              { className: "ddt-actions dim-cardActions" },
              h3(Button, { className: "dim-cardAction", onClick: onReconnect, disabled: Boolean(busy) }, busy === "reconnect" ? "\u68C0\u67E5\u4E2D\u2026" : account.connected ? "\u68C0\u67E5\u8FDE\u63A5" : "\u91CD\u8BD5\u8FDE\u63A5"),
              h3(Button, { className: "dim-cardAction", kind: "danger", onClick: onRequestRemove, disabled: Boolean(busy) }, "\u79FB\u9664\u63A5\u5165")
            ),
            summary ? h3("div", { className: "ddt-summary dim-cardSummary" }, summary) : null,
            account.error ? h3(ConnectionError, { error: account.error, showMessage: false }) : null,
            account.lastMessageError ? h3(LastMessageErrorSummary, {
              className: "ddt-summary",
              error: account.lastMessageError
            }) : null,
            feedback ? h3("div", {
              className: "ddt-summary dim-cardFeedback",
              role: "status",
              "aria-live": "polite"
            }, feedback) : null
          )
        )
      )
    ),
    removing ? h3(RemoveConfirmation, {
      account,
      busy: busy === "delete",
      onConfirm: onConfirmRemove,
      onCancel: onCancelRemove
    }) : null
  );
}
function QqSettingsTab({ rpcCall }) {
  const [operationError, setOperationError] = React15.useState(null);
  const [model, setModel] = React15.useState({
    phase: "loading",
    bots: [],
    totals: { configured: 0, connected: 0 },
    error: null,
    agentPresetCatalog: EMPTY_AGENT_PRESET_CATALOG,
    modelCatalog: EMPTY_MODEL_CATALOG
  });
  const [provision, setProvision] = React15.useState(null);
  const [busy, setBusy] = React15.useState(false);
  const [busyByBot, setBusyByBot] = React15.useState({});
  const [feedbackByBot, setFeedbackByBot] = React15.useState({});
  const [removeTarget, setRemoveTarget] = React15.useState(null);
  const [credentialOpen, setCredentialOpen] = React15.useState(false);
  const [credentialError, setCredentialError] = React15.useState(null);
  const [now, setNow] = React15.useState(Date.now());
  const mounted = React15.useRef(true);
  const workspaceFence = useWorkspaceSnapshotFence();
  const addButtonRef = React15.useRef(null);
  React15.useEffect(() => {
    const disposeDingtalk = installDingtalkStyles();
    const disposeQq = installQqStyles();
    mounted.current = true;
    return () => {
      mounted.current = false;
      disposeQq();
      disposeDingtalk();
    };
  }, []);
  const invoke = React15.useCallback(async (endpoint, payload = {}, signal) => {
    if (typeof rpcCall !== "function") throw new TypeError("QQ \u8BBE\u7F6E\u9875\u7F3A\u5C11 RPC \u8FDE\u63A5");
    const operation = !["connection.status", "provision.poll", "provision.begin", "provision.cancel"].includes(endpoint);
    if (operation && mounted.current) setOperationError(null);
    try {
      const value = unwrapRpcResult(await rpcCall(endpoint, payload, signal));
      if (operation && mounted.current) setOperationError(value?.testMessage?.error ?? value?.warnings?.[0] ?? null);
      return value;
    } catch (error) {
      if (operation && mounted.current && !signal?.aborted && error?.name !== "AbortError") setOperationError(normalizeConnectionError(error));
      throw error;
    }
  }, [rpcCall]);
  const loadStatus = React15.useCallback(async ({ signal, silent = false, restore = false } = {}) => {
    const workspaceVersion = workspaceFence.beginStatus();
    if (workspaceVersion === null) return void 0;
    if (!silent && mounted.current) setModel((current) => ({ ...current, phase: "loading", error: null }));
    try {
      const snapshot = normalizeSnapshot(await invoke(QQ_ENDPOINTS.status, {}, signal));
      if (!mounted.current || signal?.aborted || !workspaceFence.canCommitStatus(workspaceVersion)) return void 0;
      setModel({
        phase: "ready",
        bots: snapshot.bots,
        totals: snapshot.totals,
        error: null,
        agentPresetCatalog: snapshot.agentPresetCatalog ?? EMPTY_AGENT_PRESET_CATALOG,
        modelCatalog: snapshot.modelCatalog ?? EMPTY_MODEL_CATALOG
      });
      if (restore && snapshot.provisioning) setProvision({
        ...snapshot.provisioning,
        durationMs: Math.max(1, snapshot.provisioning.expiresAt - Date.now())
      });
      return snapshot;
    } catch (error) {
      if (error?.name !== "AbortError" && mounted.current && !signal?.aborted && workspaceFence.canCommitStatus(workspaceVersion)) {
        setModel((current) => ({ ...current, phase: silent ? current.phase : "error", error: presentError(error) }));
      }
      return void 0;
    }
  }, [invoke, workspaceFence]);
  React15.useEffect(() => {
    const controller = new AbortController();
    void loadStatus({ signal: controller.signal, restore: true });
    return () => controller.abort();
  }, [loadStatus]);
  React15.useEffect(() => {
    if (model.phase !== "ready") return void 0;
    const controller = new AbortController();
    const timer = window.setInterval(() => void loadStatus({ signal: controller.signal, silent: true }), 15e3);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [loadStatus, model.phase]);
  React15.useEffect(() => {
    if (!provision || !ACTIVE_STATES.has(provision.status)) return void 0;
    const timer = window.setInterval(() => mounted.current && setNow(Date.now()), 1e3);
    return () => window.clearInterval(timer);
  }, [provision?.attemptId, provision?.status]);
  const startProvisioning = React15.useCallback(async (replace = false) => {
    setCredentialOpen(false);
    setCredentialError(null);
    setBusy(true);
    try {
      if (replace && provision?.attemptId) await invoke(QQ_ENDPOINTS.cancelProvisioning, { attemptId: provision.attemptId });
      if (!mounted.current) return;
      setProvision({ status: "starting" });
      const started = normalizeProvisioning(await invoke(QQ_ENDPOINTS.beginProvisioning, { locale: "zh-CN" }));
      if (!mounted.current) return;
      setNow(Date.now());
      setProvision({ ...started, durationMs: Math.max(1, started.expiresAt - Date.now()) });
    } catch (error) {
      if (mounted.current) setProvision({ status: "failed", error: presentError(error) });
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, [invoke, provision?.attemptId]);
  const bindCredentials = React15.useCallback(async ({ identity, secret }) => {
    const snapshotVersion = workspaceFence.beginMutation();
    setBusy(true);
    setCredentialError(null);
    try {
      const snapshot = normalizeSnapshot(await invoke(
        QQ_ENDPOINTS.bindCredentials,
        { appId: identity, appSecret: secret }
      ));
      if (!mounted.current) return;
      if (workspaceFence.canCommitMutation(snapshotVersion)) {
        setModel({
          phase: "ready",
          bots: snapshot.bots,
          totals: snapshot.totals,
          error: null,
          agentPresetCatalog: snapshot.agentPresetCatalog ?? EMPTY_AGENT_PRESET_CATALOG,
          modelCatalog: snapshot.modelCatalog ?? EMPTY_MODEL_CATALOG
        });
      }
      setCredentialOpen(false);
    } catch (error) {
      if (mounted.current) setCredentialError(presentError(error));
    } finally {
      const shouldRefresh = workspaceFence.endMutation();
      if (shouldRefresh && mounted.current) void loadStatus({ silent: true });
      if (mounted.current) setBusy(false);
    }
  }, [invoke, loadStatus, workspaceFence]);
  const closeProvision = React15.useCallback(async () => {
    setBusy(true);
    try {
      if (provision?.attemptId && ACTIVE_STATES.has(provision.status)) {
        await invoke(QQ_ENDPOINTS.cancelProvisioning, { attemptId: provision.attemptId });
      }
      if (mounted.current) setProvision(null);
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, [invoke, provision?.attemptId, provision?.status]);
  React15.useEffect(() => {
    const attemptId = provision?.attemptId;
    if (!attemptId || !ACTIVE_STATES.has(provision.status)) return void 0;
    const controller = new AbortController();
    let disposed = false;
    let timer;
    const poll = async () => {
      try {
        const current = normalizeProvisioning(await invoke(QQ_ENDPOINTS.pollProvisioning, { attemptId }, controller.signal));
        if (disposed || controller.signal.aborted || !mounted.current) return;
        if (current.status === "connected") {
          setProvision(null);
          await loadStatus({ signal: controller.signal, silent: true });
          return;
        }
        setProvision((previous) => previous?.attemptId === attemptId ? { ...previous, ...current, durationMs: current.qrRevision !== previous.qrRevision ? Math.max(1, current.expiresAt - Date.now()) : previous.durationMs } : previous);
        if (ACTIVE_STATES.has(current.status)) timer = window.setTimeout(poll, current.pollIntervalMs);
      } catch (error) {
        if (!disposed && !controller.signal.aborted && mounted.current) {
          setProvision((current) => ({ ...current, status: "failed", error: presentError(error) }));
        }
      }
    };
    timer = window.setTimeout(poll, provision.pollIntervalMs ?? 1e3);
    return () => {
      disposed = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [invoke, loadStatus, provision?.attemptId, provision?.pollIntervalMs, provision?.status]);
  const botAction = React15.useCallback(async (account, operation, endpoint, payload) => {
    const snapshotVersion = workspaceFence.beginMutation();
    setBusyByBot((current) => ({ ...current, [account.botId]: operation }));
    try {
      const snapshot = normalizeSnapshot(await invoke(endpoint, payload));
      if (mounted.current && workspaceFence.canCommitMutation(snapshotVersion)) {
        setModel({
          phase: "ready",
          bots: snapshot.bots,
          totals: snapshot.totals,
          error: null,
          agentPresetCatalog: snapshot.agentPresetCatalog ?? EMPTY_AGENT_PRESET_CATALOG,
          modelCatalog: snapshot.modelCatalog ?? EMPTY_MODEL_CATALOG
        });
      }
      return snapshot;
    } finally {
      const shouldRefresh = workspaceFence.endMutation();
      if (shouldRefresh && mounted.current) void loadStatus({ silent: true });
      if (mounted.current) setBusyByBot((current) => {
        const next = { ...current };
        delete next[account.botId];
        return next;
      });
    }
  }, [invoke, loadStatus, workspaceFence]);
  const reconnect = React15.useCallback(async (account) => {
    setFeedbackByBot((current) => {
      const next = { ...current };
      delete next[account.botId];
      return next;
    });
    try {
      const snapshot = await botAction(
        account,
        "reconnect",
        QQ_ENDPOINTS.reconnectBot,
        { botId: account.botId, sendTest: true }
      );
      if (mounted.current) {
        setFeedbackByBot((current) => ({
          ...current,
          [account.botId]: connectionTestFeedback(snapshot?.testMessage)
        }));
      }
    } catch {
      if (mounted.current) {
        setFeedbackByBot((current) => ({
          ...current,
          [account.botId]: "\u8FDE\u63A5\u68C0\u67E5\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"
        }));
      }
    }
  }, [botAction]);
  let provisionView = null;
  if (provision?.status === "starting") provisionView = h3("div", { className: "ddt-card ddt-loading dim-surfaceCard" }, h3("div", { className: "ddt-spinner" }), "\u6B63\u5728\u7533\u8BF7 QQ \u4E8C\u7EF4\u7801\u2026");
  else if (["pending", "refreshing"].includes(provision?.status)) provisionView = h3(QrPanel, {
    provision,
    now,
    busy,
    onRefresh: () => void startProvisioning(true),
    onCancel: () => void closeProvision()
  });
  else if (provision) provisionView = h3(ProvisionView, {
    provision,
    busy,
    onRetry: () => void startProvisioning(true),
    onClose: () => void closeProvision()
  });
  const botList = model.bots.length > 0 ? h3(
    "section",
    { className: "dim-listSection" },
    h3(ChannelListHeading, {
      className: "ddt-listHeading",
      title: "\u5DF2\u7ED1\u5B9A\u7684 QQ \u673A\u5668\u4EBA",
      connectionLabel: "WebSocket \u957F\u8FDE\u63A5"
    }),
    h3("ul", { className: "ddt-list dim-botList" }, model.bots.map((account) => h3("li", { key: account.botId }, h3(AccountCard, {
      account,
      busy: busyByBot[account.botId],
      feedback: feedbackByBot[account.botId],
      removing: removeTarget === account.botId,
      onReconnect: () => void reconnect(account),
      onWorkspaceSave: (workspace) => botAction(
        account,
        "workspace",
        QQ_ENDPOINTS.setWorkspace,
        { botId: account.botId, workspace }
      ),
      onAliasSave: (alias) => botAction(
        account,
        "alias",
        QQ_ENDPOINTS.setAlias,
        { botId: account.botId, alias }
      ),
      onModelSave: (selectedModel) => botAction(
        account,
        "model",
        QQ_ENDPOINTS.setModel,
        { botId: account.botId, model: selectedModel }
      ),
      onAgentPresetSave: (agentPreset) => botAction(
        account,
        "preset",
        QQ_ENDPOINTS.setAgentPreset,
        { botId: account.botId, agentPreset }
      ),
      onContextEnhancementSave: (config) => botAction(
        account,
        "context-enhancement",
        QQ_ENDPOINTS.setContextEnhancement,
        { botId: account.botId, config }
      ),
      onRequestRemove: () => setRemoveTarget(account.botId),
      onCancelRemove: () => setRemoveTarget(null),
      onConfirmRemove: async () => {
        await botAction(account, "delete", QQ_ENDPOINTS.deleteBot, { botId: account.botId, confirm: true });
        if (mounted.current) setRemoveTarget(null);
      }
    }))))
  ) : null;
  const credentialView = credentialOpen ? h3(CredentialBindingPanel, {
    channel: "QQ",
    identityLabel: "AppID",
    identityPlaceholder: "\u586B\u5199 QQ \u5F00\u653E\u5E73\u53F0 AppID",
    secretLabel: "AppSecret",
    secretPlaceholder: "\u586B\u5199 QQ \u5F00\u653E\u5E73\u53F0 AppSecret",
    busy,
    error: credentialError,
    onSubmit: bindCredentials,
    onCancel: () => {
      setCredentialOpen(false);
      setCredentialError(null);
    }
  }) : null;
  return h3(ModelCatalogContext.Provider, {
    value: model.modelCatalog ?? EMPTY_MODEL_CATALOG
  }, h3(AgentPresetCatalogContext.Provider, {
    value: model.agentPresetCatalog ?? EMPTY_AGENT_PRESET_CATALOG
  }, h3(
    "section",
    { className: "ddt-page dqq-page dim-channelPage", "aria-label": "QQ \u8BBE\u7F6E" },
    operationError ? h3(ConnectionError, { error: operationError }) : null,
    h3(Heading, {
      totals: model.totals,
      adding: Boolean(provision),
      busy,
      onAdd: () => void startProvisioning(),
      onCredential: () => {
        setCredentialOpen((value) => !value);
        setCredentialError(null);
      },
      credentialOpen,
      addButtonRef
    }),
    model.phase === "loading" ? h3(LoadingView) : model.phase === "error" ? h3("div", { className: "ddt-card dim-surfaceCard" }, h3("div", { className: "ddt-inlineError dim-inlineError" }, h3("h3", null, "\u65E0\u6CD5\u8BFB\u53D6 QQ \u673A\u5668\u4EBA\u72B6\u6001"), h3(ConnectionError, { error: model.error }), h3(Button, { onClick: () => void loadStatus() }, "\u91CD\u65B0\u8BFB\u53D6"))) : h3(
      React15.Fragment,
      null,
      credentialView,
      provisionView,
      model.bots.length === 0 && !provision && !credentialOpen ? h3(EmptyView, { busy, onStart: () => void startProvisioning() }) : null,
      botList
    )
  )));
}

// src/channels/shared/interface-language.mjs
var LANGUAGE_TAG = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u;
var HOST_LANGUAGE_SOURCES = Object.freeze(["config", "settings", "mirror"]);
function normalizeInterfaceLanguageTag(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return LANGUAGE_TAG.test(trimmed) ? trimmed : null;
}

// plugin-src/client/lifecycle.js
var React16 = __toESM(require("react"), 1);
function createPollScheduler({ setTimeoutFn, clearTimeoutFn }) {
  let disposed = false;
  let timer;
  return {
    get disposed() {
      return disposed;
    },
    schedule(callback, delayMs) {
      if (disposed) return false;
      if (timer !== void 0) clearTimeoutFn(timer);
      timer = setTimeoutFn(() => {
        timer = void 0;
        if (!disposed) void callback();
      }, delayMs);
      return true;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (timer !== void 0) clearTimeoutFn(timer);
      timer = void 0;
    }
  };
}

// plugin-src/client/interface-language.js
var HOST_LANGUAGE_RPC_CHANNEL = "/dsh-im-language";
var HOST_LANGUAGE_ENDPOINTS = Object.freeze({
  get: "settings.language.get",
  mirror: "settings.language.mirror"
});
var RETRY_DELAYS_MS = Object.freeze([1e3, 4e3, 15e3]);
function installInterfaceLanguageMirror(ctx, {
  rpcCall,
  setTimeoutFn = (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeoutFn = (timer) => globalThis.clearTimeout(timer),
  retryDelaysMs = RETRY_DELAYS_MS
} = {}) {
  if (typeof rpcCall !== "function" || typeof ctx?.locale?.getLocale !== "function") {
    return () => {
    };
  }
  const delays = retryDelaysMs.length > 0 ? retryDelaysMs : RETRY_DELAYS_MS;
  const scheduler = createPollScheduler({ setTimeoutFn, clearTimeoutFn });
  let mirrored = null;
  let attempt = 0;
  const retry = (active) => {
    if (mirrored === active) mirrored = null;
    scheduler.schedule(report, delays[Math.min(attempt, delays.length - 1)]);
    attempt += 1;
  };
  const report = () => {
    if (scheduler.disposed) return;
    const active = normalizeInterfaceLanguageTag(ctx.locale.getLocale()?.active);
    if (active === null || active === mirrored) return;
    mirrored = active;
    Promise.resolve(rpcCall(HOST_LANGUAGE_ENDPOINTS.mirror, { locale: active })).then(
      (result2) => {
        if (result2?.ok === true) {
          attempt = 0;
          return;
        }
        retry(active);
      },
      () => retry(active)
    );
  };
  report();
  const off = typeof ctx.on === "function" ? ctx.on("locale/change", () => {
    attempt = 0;
    report();
  }) : null;
  return () => {
    scheduler.dispose();
    if (typeof off === "function") off();
  };
}

// plugin-src/client/delivery-settings.js
var React22 = __toESM(require("react"), 1);

// plugin-src/client/access-policy-settings.js
var React17 = __toESM(require("react"), 1);
var ACCESS_POLICY_ENDPOINT = "bot.access-policy.set";
var CONFIRMED_OWNER_CHANNELS = /* @__PURE__ */ new Set(["weixin", "feishu", "qq", "whatsapp", "discord"]);
var ACCESS_CHANNEL_DEFINITIONS = Object.freeze({
  weixin: Object.freeze({
    directUserLabel: "\u5FAE\u4FE1\u7528\u6237 ID",
    directPlaceholder: "\u586B\u5199\u5FAE\u4FE1\u7528\u6237 ID",
    groupSupported: false
  }),
  feishu: Object.freeze({
    directUserLabel: "\u98DE\u4E66 Open ID",
    directPlaceholder: "\u586B\u5199\u4F7F\u7528\u8005\u7684 Open ID\uFF08ou_xxx\uFF09\uFF0C\u4E0D\u662F\u673A\u5668\u4EBA ID",
    groupUserLabel: "\u7FA4\u6210\u5458 Open ID",
    groupPlaceholder: "\u586B\u5199\u4F7F\u7528\u8005\u7684 Open ID\uFF08ou_xxx\uFF09\uFF0C\u4E0D\u662F\u673A\u5668\u4EBA ID"
  }),
  dingtalk: Object.freeze({
    directUserLabel: "\u9489\u9489\u7528\u6237 ID",
    directPlaceholder: "\u586B\u5199 senderStaffId \u6216 senderId",
    groupUserLabel: "\u7FA4\u6210\u5458\u7528\u6237 ID",
    groupPlaceholder: "\u586B\u5199 senderStaffId \u6216 senderId"
  }),
  wecom: Object.freeze({
    directUserLabel: "\u4F01\u4E1A\u5FAE\u4FE1\u7528\u6237 ID",
    directPlaceholder: "\u586B\u5199 userid",
    groupUserLabel: "\u7FA4\u6210\u5458\u7528\u6237 ID",
    groupPlaceholder: "\u586B\u5199 userid"
  }),
  wecomApp: Object.freeze({
    directUserLabel: "\u4F01\u4E1A\u5FAE\u4FE1\u7528\u6237 ID",
    directPlaceholder: "\u586B\u5199 userid",
    groupUserLabel: "\u7FA4\u6210\u5458\u7528\u6237 ID",
    groupPlaceholder: "\u586B\u5199 userid"
  }),
  qq: Object.freeze({
    directUserLabel: "QQ User Open ID",
    directPlaceholder: "\u586B\u5199 user_openid",
    groupUserLabel: "\u7FA4\u6210\u5458 Open ID",
    groupPlaceholder: "\u586B\u5199 member_openid"
  }),
  slack: Object.freeze({
    directUserLabel: "Slack User ID",
    directPlaceholder: "U0123456789",
    groupUserLabel: "\u7FA4\u6210\u5458 User ID",
    groupPlaceholder: "U0123456789"
  }),
  telegram: Object.freeze({
    directUserLabel: "Telegram User ID",
    directPlaceholder: "\u586B\u5199\u6570\u5B57 User ID",
    groupUserLabel: "\u7FA4\u6210\u5458 User ID",
    groupPlaceholder: "\u586B\u5199\u6570\u5B57 User ID"
  }),
  discord: Object.freeze({
    directUserLabel: "Discord User ID",
    directPlaceholder: "\u586B\u5199\u6570\u5B57 User ID",
    groupUserLabel: "\u7FA4\u6210\u5458 User ID",
    groupPlaceholder: "\u586B\u5199\u6570\u5B57 User ID"
  }),
  whatsapp: Object.freeze({
    directUserLabel: "WhatsApp \u7535\u8BDD\u53F7\u7801\u6216 JID",
    directPlaceholder: "8613800000000 \u6216\u5B8C\u6574 JID",
    groupUserLabel: "\u7FA4\u6210\u5458\u7535\u8BDD\u53F7\u7801\u6216 JID",
    groupPlaceholder: "8613800000000 \u6216\u5B8C\u6574 JID"
  }),
  imessage: Object.freeze({
    directUserLabel: "iMessage Chat GUID",
    directPlaceholder: "iMessage;+;chat123",
    groupSupported: false
  })
});
function clonePolicy(policy) {
  const cloneScope = (scope) => ({
    mode: scope.mode,
    open: {
      defaultCanExecuteCommands: scope.open.defaultCanExecuteCommands,
      commandPermissionOverrides: scope.open.commandPermissionOverrides.map((user) => ({
        ...user
      }))
    },
    allowlist: {
      users: scope.allowlist.users.map((user) => ({ ...user }))
    }
  });
  return {
    direct: cloneScope(policy.direct),
    group: cloneScope(policy.group)
  };
}
function unwrapRpcResult2(result2) {
  if (result2?.ok === true) return result2.value;
  if (result2?.ok === false) {
    const error = new Error(result2.error?.message || "\u8BBF\u95EE\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
    error.code = result2.error?.code;
    throw error;
  }
  return result2;
}
function policyFromSnapshot(value, botId) {
  const source = value?.snapshot ?? value;
  const bot = Array.isArray(source?.bots) ? source.bots.find((entry) => entry?.botId === botId) : null;
  return normalizeAccessPolicy(bot?.accessPolicy ?? source?.accessPolicy ?? source?.policy);
}
function commandValue(value) {
  return value === "allow";
}
function ScenePolicyEditor({
  scene,
  title,
  policy,
  userLabel,
  placeholder,
  disabled = false,
  unsupported = false,
  ownerHelp,
  identityHelp,
  onChange
}) {
  const ownerHelpId = React17.useId();
  const emptyAllowlistHelpId = React17.useId();
  const allowlist = policy.mode === "allowlist";
  const collectionKey = allowlist ? "users" : "commandPermissionOverrides";
  const branchKey = allowlist ? "allowlist" : "open";
  const users = policy[branchKey][collectionKey];
  const emptyAllowlist = allowlist && users.length === 0;
  const updateUsers = (nextUsers) => onChange({
    ...policy,
    [branchKey]: {
      ...policy[branchKey],
      [collectionKey]: nextUsers
    }
  });
  const updateUser = (index, patch) => updateUsers(users.map((user, userIndex) => userIndex === index ? { ...user, ...patch } : user));
  return h3(
    "fieldset",
    {
      className: "dim-accessScene",
      disabled,
      "data-scene": scene,
      "aria-label": localizeText(title)
    },
    h3(
      "legend",
      null,
      h3(
        "span",
        { className: "dim-accessLegendContent" },
        h3("span", null, title),
        h3(
          "span",
          { className: "dim-channelHelp dim-accessLegendHelp" },
          h3("button", {
            type: "button",
            className: "dim-channelHelpButton",
            "aria-label": [localizeText(title), localizeText("\u67E5\u770B\u8BBF\u95EE\u6743\u9650\u8BF4\u660E")].join(" "),
            "aria-describedby": ownerHelpId
          }, h3("span", { "aria-hidden": true }, "?")),
          h3("span", {
            id: ownerHelpId,
            className: "dim-channelTooltip dim-accessHelpTooltip",
            role: "tooltip"
          }, ownerHelp, identityHelp ? h3("br") : null, identityHelp)
        )
      )
    ),
    unsupported ? h3(
      "div",
      { className: "dim-accessUnsupported", role: "note" },
      h3("strong", null, "\u5F53\u524D\u6E20\u9053\u4E0D\u652F\u6301\u7FA4\u804A"),
      h3("p", null, "\u6B64\u533A\u57DF\u65E0\u9700\u914D\u7F6E\uFF0C\u4FDD\u5B58\u79C1\u804A\u8BBE\u7F6E\u65F6\u4F1A\u4FDD\u7559\u73B0\u6709\u7FA4\u804A\u7B56\u7565\u3002")
    ) : h3(
      React17.Fragment,
      null,
      h3(
        "div",
        { className: "dim-accessControls", "data-mode": policy.mode },
        h3(
          "label",
          { className: "dim-accessField" },
          h3("span", null, "\u8BBF\u95EE\u6A21\u5F0F"),
          h3(
            "select",
            {
              value: policy.mode,
              "aria-label": [localizeText(title), localizeText("\u8BBF\u95EE\u6A21\u5F0F")].join(" "),
              onChange: (event) => onChange({ ...policy, mode: event.target.value })
            },
            h3("option", { value: "open" }, "\u5141\u8BB8\u6240\u6709\u7528\u6237"),
            h3("option", { value: "allowlist" }, "\u4EC5\u767D\u540D\u5355\u7528\u6237")
          )
        ),
        allowlist ? null : h3(
          "label",
          { className: "dim-accessField" },
          h3("span", null, "\u9ED8\u8BA4\u547D\u4EE4\u6743\u9650"),
          h3(
            "select",
            {
              value: policy.open.defaultCanExecuteCommands ? "allow" : "deny",
              "aria-label": [localizeText(title), localizeText("\u9ED8\u8BA4\u547D\u4EE4\u6743\u9650")].join(" "),
              onChange: (event) => onChange({
                ...policy,
                open: {
                  ...policy.open,
                  defaultCanExecuteCommands: commandValue(event.target.value)
                }
              })
            },
            h3("option", { value: "allow" }, "\u53EF\u4EE5\u6267\u884C\u547D\u4EE4"),
            h3("option", { value: "deny" }, "\u4E0D\u53EF\u4EE5\u6267\u884C\u547D\u4EE4")
          )
        )
      ),
      h3(
        "div",
        { className: "dim-accessUsers" },
        h3(
          "div",
          { className: "dim-accessUsersHeading" },
          h3(
            "div",
            { className: "dim-accessUsersTitle" },
            h3("strong", null, allowlist ? "\u767D\u540D\u5355\u7528\u6237" : "\u547D\u4EE4\u6743\u9650\u4F8B\u5916"),
            emptyAllowlist ? h3(
              "span",
              { className: "dim-channelHelp dim-accessUsersHelp" },
              h3("button", {
                type: "button",
                className: "dim-channelHelpButton",
                "aria-label": [localizeText(title), localizeText("\u67E5\u770B\u767D\u540D\u5355\u8BF4\u660E")].join(" "),
                "aria-describedby": emptyAllowlistHelpId
              }, h3("span", { "aria-hidden": true }, "?")),
              h3("span", {
                id: emptyAllowlistHelpId,
                className: "dim-channelTooltip dim-accessEmptyAllowlistTooltip",
                role: "tooltip"
              }, "\u5F53\u524D\u6CA1\u6709\u767D\u540D\u5355\u7528\u6237\uFF0C\u4FDD\u5B58\u540E\u666E\u901A\u7528\u6237\u5C06\u65E0\u6CD5\u4F7F\u7528\u673A\u5668\u4EBA\u3002")
            ) : null
          ),
          h3("button", {
            type: "button",
            className: "dim-deliveryButton dim-accessAddUser",
            "aria-label": [localizeText(title), localizeText("\u65B0\u589E\u7528\u6237")].join(" "),
            title: localizeText("\u65B0\u589E\u7528\u6237"),
            onClick: () => updateUsers([...users, {
              id: "",
              canExecuteCommands: allowlist ? false : !policy.open.defaultCanExecuteCommands
            }])
          }, h3("span", { "aria-hidden": true }, "+"))
        ),
        users.length === 0 ? h3("div", { className: "dim-accessUsersEmpty" }, "\u5C1A\u672A\u6DFB\u52A0\u7528\u6237") : h3("ul", { className: "dim-accessUserList" }, users.map((user, index) => h3(
          "li",
          { key: `${scene}-${policy.mode}-${index}`, className: "dim-accessUserRow" },
          h3(
            "label",
            { className: "dim-accessField dim-accessUserId" },
            h3("span", null, userLabel),
            h3("input", {
              value: user.id,
              maxLength: 256,
              required: true,
              autoCapitalize: "none",
              autoCorrect: "off",
              spellCheck: false,
              placeholder,
              "aria-label": [localizeText(title), localizeText(userLabel), index + 1].join(" "),
              onChange: (event) => updateUser(index, { id: event.target.value })
            })
          ),
          h3(
            "label",
            { className: "dim-accessField dim-accessUserCommand" },
            h3("span", null, "\u547D\u4EE4\u6743\u9650"),
            h3(
              "select",
              {
                value: user.canExecuteCommands ? "allow" : "deny",
                "aria-label": [
                  localizeText(title),
                  localizeText("\u7528\u6237"),
                  index + 1,
                  localizeText("\u547D\u4EE4\u6743\u9650")
                ].join(" "),
                onChange: (event) => updateUser(index, {
                  canExecuteCommands: commandValue(event.target.value)
                })
              },
              h3("option", { value: "allow" }, "\u53EF\u4EE5\u6267\u884C\u547D\u4EE4"),
              h3("option", { value: "deny" }, "\u4E0D\u53EF\u4EE5\u6267\u884C\u547D\u4EE4")
            )
          ),
          h3("button", {
            type: "button",
            className: "dim-deliveryButton dim-accessDeleteUser",
            "data-kind": "danger",
            "aria-label": [
              localizeText(title),
              localizeText("\u5220\u9664"),
              localizeText("\u7528\u6237"),
              index + 1
            ].join(" "),
            onClick: () => updateUsers(users.filter((_, userIndex) => userIndex !== index))
          }, "\u5220\u9664")
        )))
      )
    )
  );
}
function AccessPolicySettingsPage({ channel, account, rpcCall, onSaved }) {
  const definition = ACCESS_CHANNEL_DEFINITIONS[channel];
  const ownerHelp = CONFIRMED_OWNER_CHANNELS.has(channel) ? "\u5DF2\u7531\u63A5\u5165\u6D41\u7A0B\u786E\u8BA4\u7684\u6240\u6709\u8005\u53EF\u4EE5\u8BBF\u95EE\u5E76\u6267\u884C\u547D\u4EE4\uFF0C\u4E0D\u53D7\u672C\u9875\u9650\u5236\u3002\u672A\u8BC6\u522B\u5230\u6240\u6709\u8005\u8EAB\u4EFD\u65F6\uFF0C\u6309\u672C\u9875\u8BBF\u95EE\u8BBE\u7F6E\u6267\u884C\u3002" : "\u539F\u6240\u6709\u8005\u6216\u626B\u7801\u63A5\u5165\u8005\u59CB\u7EC8\u53EF\u4EE5\u8BBF\u95EE\u5E76\u6267\u884C\u547D\u4EE4\uFF1B\u4EE5\u4E0B\u8BBE\u7F6E\u4EC5\u7EA6\u675F\u5176\u4ED6\u7528\u6237\u3002";
  const identityHelp = channel === "feishu" ? "\u767D\u540D\u5355\u8BF7\u586B\u5199\u4F7F\u7528\u8005\u7684 Open ID\uFF0C\u4E0D\u662F\u673A\u5668\u4EBA\u7684 Open ID\u3002\u4EC5\u4FDD\u5B58\u901A\u914D\u7B26\u7684\u63A5\u5165\u914D\u7F6E\u4E0D\u5305\u542B\u6240\u6709\u8005\u8EAB\u4EFD\u3002" : null;
  const initialPolicy = normalizeAccessPolicy(account?.accessPolicy);
  const initialKey = JSON.stringify(initialPolicy);
  const [draft, setDraft] = React17.useState(() => clonePolicy(
    initialPolicy ?? DEFAULT_ACCESS_POLICY
  ));
  const [saving, setSaving] = React17.useState(false);
  const [feedback, setFeedback] = React17.useState(null);
  React17.useEffect(() => {
    const next = normalizeAccessPolicy(account?.accessPolicy);
    setDraft(clonePolicy(next ?? DEFAULT_ACCESS_POLICY));
  }, [account?.botId, initialKey]);
  React17.useEffect(() => {
    setFeedback(null);
  }, [account?.botId]);
  if (!definition) {
    return h3(
      "div",
      { className: "dim-accessState", role: "alert" },
      "\u5F53\u524D\u6E20\u9053\u6682\u4E0D\u652F\u6301\u8BBF\u95EE\u8BBE\u7F6E\u3002"
    );
  }
  const save = async (event) => {
    event.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const policy = validateAccessPolicy(draft);
      if (typeof rpcCall !== "function") throw new Error("\u8BBF\u95EE\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002");
      const value = unwrapRpcResult2(await rpcCall(ACCESS_POLICY_ENDPOINT, {
        botId: account.botId,
        policy
      }));
      const saved = policyFromSnapshot(value, account.botId);
      if (!saved) throw new Error("\u670D\u52A1\u6CA1\u6709\u8FD4\u56DE\u5DF2\u4FDD\u5B58\u7684\u8BBF\u95EE\u7B56\u7565\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002");
      setDraft(clonePolicy(saved));
      onSaved?.(saved);
      setFeedback({ tone: "success", message: "\u8BBF\u95EE\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\u3002" });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error?.message || "\u8BBF\u95EE\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"
      });
    } finally {
      setSaving(false);
    }
  };
  return h3(
    "form",
    {
      className: "dim-accessPage",
      onSubmit: (event) => void save(event)
    },
    initialPolicy ? null : h3(
      "div",
      { className: "dim-accessState", role: "alert" },
      "\u8BBF\u95EE\u7B56\u7565\u5C1A\u672A\u5C31\u7EEA\uFF0C\u8BF7\u8FD4\u56DE\u673A\u5668\u4EBA\u5217\u8868\u5237\u65B0\u540E\u91CD\u8BD5\u3002"
    ),
    h3(ScenePolicyEditor, {
      scene: "direct",
      title: "\u79C1\u804A",
      policy: draft.direct,
      userLabel: definition.directUserLabel,
      placeholder: definition.directPlaceholder,
      ownerHelp,
      identityHelp,
      disabled: saving,
      onChange: (direct) => {
        setDraft((current) => ({ ...current, direct }));
        setFeedback(null);
      }
    }),
    h3(ScenePolicyEditor, {
      scene: "group",
      title: "\u7FA4\u804A",
      policy: draft.group,
      userLabel: definition.groupUserLabel ?? definition.directUserLabel,
      placeholder: definition.groupPlaceholder ?? definition.directPlaceholder,
      ownerHelp,
      identityHelp: channel === "qq" ? "\u626B\u7801\u83B7\u5F97\u7684\u662F\u79C1\u804A\u8EAB\u4EFD\uFF0C\u7FA4\u804A\u53EA\u6709\u5339\u914D\u5DF2\u786E\u8BA4\u7684\u6240\u6709\u8005\u8EAB\u4EFD\u65F6\u624D\u8C41\u514D\uFF1B\u5176\u4ED6\u6210\u5458\u6309\u7FA4\u804A\u767D\u540D\u5355\u8BBE\u7F6E\u6267\u884C\u3002" : identityHelp,
      disabled: saving || definition.groupSupported === false,
      unsupported: definition.groupSupported === false,
      onChange: (group) => {
        setDraft((current) => ({ ...current, group }));
        setFeedback(null);
      }
    }),
    feedback ? h3("p", {
      className: "dim-accessFeedback",
      "data-tone": feedback.tone,
      role: feedback.tone === "error" ? "alert" : "status",
      "aria-live": "polite"
    }, feedback.message) : null,
    h3(
      "div",
      { className: "dim-accessActions" },
      h3("button", {
        type: "submit",
        className: "dim-deliveryButton",
        "data-kind": "primary",
        disabled: saving || !initialPolicy
      }, saving ? "\u6B63\u5728\u4FDD\u5B58\u2026" : "\u4FDD\u5B58\u8BBF\u95EE\u8BBE\u7F6E")
    )
  );
}

// plugin-src/client/bot-general-settings.js
var React18 = __toESM(require("react"), 1);
var __removed_normalizeFeishuStepCardPanels = () => ({});
function settingsFromResult(result2, botId) {
  if (result2?.ok !== true) throw new Error(result2?.error?.message || "\u65E0\u6CD5\u8BFB\u53D6\u901A\u7528\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
  const bot = result2.value?.bots?.find((entry) => entry.botId === botId);
  if (!bot) throw new Error("\u627E\u4E0D\u5230\u8981\u4FEE\u6539\u7684\u673A\u5668\u4EBA\u3002");
  return {
    busyMessageMode: normalizeBusyMessageMode(bot.busyMessageMode),
    stepCardPanels: __removed_normalizeFeishuStepCardPanels(bot.stepCardPanels)
  };
}
function BotGeneralSettingsPage({ channel, account, rpcCall }) {
  const modeId = React18.useId();
  const [settings, setSettings] = React18.useState(() => ({
    busyMessageMode: "queue",
    stepCardPanels: __removed_normalizeFeishuStepCardPanels()
  }));
  const [savedSettings, setSavedSettings] = React18.useState(null);
  const [busy, setBusy] = React18.useState(false);
  const [feedback, setFeedback] = React18.useState(null);
  const mounted = React18.useRef(false);
  const inFlight = React18.useRef(false);
  const mode = settings.busyMessageMode;
  const load = React18.useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      const value = settingsFromResult(await rpcCall("connection.status", {}), account.botId);
      if (!mounted.current) return;
      setSettings(value);
      setSavedSettings(value);
    } catch (error) {
      if (mounted.current) setFeedback(error.message);
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }, [account.botId, rpcCall]);
  React18.useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);
  const save = async (field, value) => {
    if (inFlight.current || savedSettings === null || value === savedSettings[field]) return;
    inFlight.current = true;
    setSettings({ ...settings, [field]: value });
    setBusy(true);
    setFeedback(null);
    try {
      const endpoint = SET_MESSAGE_MODE_ENDPOINT;
      const saved = settingsFromResult(await rpcCall(endpoint, {
        botId: account.botId,
        [field]: value
      }), account.botId);
      if (!mounted.current) return;
      setSettings(saved);
      setSavedSettings(saved);
    } catch (error) {
      if (mounted.current) {
        setSettings(savedSettings);
        setFeedback(error.message);
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return h3(
    "section",
    { className: "dim-botGeneralSettings", "aria-label": "\u673A\u5668\u4EBA\u901A\u7528\u8BBE\u7F6E", "aria-busy": busy },
    h3(
      "div",
      { className: "dim-botGeneralList" },
      h3(
        "div",
        { className: "dim-botGeneralRow" },
        h3(
          "div",
          { className: "dim-botGeneralText" },
          h3("label", { className: "dim-botGeneralTitle", htmlFor: modeId }, "\u6D88\u606F\u5904\u7406\u65B9\u5F0F"),
          h3("p", { className: "dim-botGeneralHelp", id: `${modeId}-description` }, mode === "queue" ? "\u5F53\u524D\u4EFB\u52A1\u7ED3\u675F\u540E\u5904\u7406\u65B0\u6D88\u606F" : "\u5C06\u65B0\u6D88\u606F\u8865\u5145\u5230\u5F53\u524D\u4EFB\u52A1")
        ),
        h3(
          "div",
          { className: "dim-botGeneralControl" },
          h3(
            "select",
            {
              id: modeId,
              value: mode,
              disabled: busy || savedSettings === null,
              "aria-label": "\u6D88\u606F\u5904\u7406\u65B9\u5F0F",
              "aria-describedby": `${modeId}-description`,
              onChange: (event) => void save("busyMessageMode", event.target.value)
            },
            h3("option", { value: "queue" }, "\u6392\u961F"),
            h3("option", { value: "steer" }, "\u63D2\u8BDD")
          ),
          h3(
            "svg",
            { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true },
            h3("path", { d: "m4 6 4 4 4-4", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" })
          )
        )
      ),
      channel === "feishu" ? [
        ["thinkingExpanded", "\u5C55\u5F00\u601D\u8003\u8FC7\u7A0B"],
        ["toolsExpanded", "\u5C55\u5F00\u5DE5\u5177\u6458\u8981"]
      ].map(([field, label]) => h3(
        "div",
        { key: field, className: "dim-botGeneralRow dim-botGeneralPanelRow" },
        h3("label", { className: "dim-botGeneralTitle", htmlFor: `${modeId}-${field}` }, label),
        h3(
          "div",
          { className: "dim-botGeneralControl" },
          h3("input", {
            id: `${modeId}-${field}`,
            type: "checkbox",
            role: "switch",
            className: "dim-contextSwitch",
            checked: settings.stepCardPanels[field],
            disabled: busy || savedSettings === null,
            "aria-label": label,
            "aria-describedby": `${modeId}-panels-description`,
            onChange: (event) => void save("stepCardPanels", {
              ...settings.stepCardPanels,
              [field]: event.target.checked
            })
          })
        )
      )) : null
    ),
    channel === "feishu" ? h3(
      "p",
      { className: "dim-botGeneralHelp dim-botGeneralPanelHelp", id: `${modeId}-panels-description` },
      "\u4EC5\u5BF9\u5B9E\u65F6\u8FC7\u7A0B\u5361\u751F\u6548\uFF0C\u4EFB\u52A1\u7ED3\u675F\u540E\u81EA\u52A8\u6536\u8D77\u3002"
    ) : null,
    feedback ? h3("p", {
      className: "dim-accessFeedback",
      "data-tone": "error",
      role: "alert"
    }, feedback) : null,
    savedSettings === null && !busy ? h3(
      "div",
      { className: "dim-botGeneralActions" },
      h3("button", {
        type: "button",
        className: "dim-deliveryButton",
        onClick: () => void load()
      }, "\u91CD\u65B0\u8BFB\u53D6")
    ) : null
  );
}

// plugin-src/client/bot-settings-tabs.js
var React19 = __toESM(require("react"), 1);
function revealTab(strip, tab) {
  if (!strip || !tab) return;
  const viewport = strip.getBoundingClientRect();
  const bounds = tab.getBoundingClientRect();
  if (bounds.left < viewport.left) strip.scrollLeft += bounds.left - viewport.left;
  else if (bounds.right > viewport.right) strip.scrollLeft += bounds.right - viewport.right;
}
function BotSettingsTabs({ tabs, activeTabId, onChange }) {
  const barRef = React19.useRef(null);
  const stripRef = React19.useRef(null);
  const listRef = React19.useRef(null);
  const [scroll, setScroll] = React19.useState({ overflow: false, left: false, right: false });
  const measure = React19.useCallback(() => {
    const bar = barRef.current;
    const strip = stripRef.current;
    const list = listRef.current;
    if (!bar || !strip || !list) return;
    const next = {
      // Compare against the whole bar, so arrows disappear as soon as all tabs fit.
      overflow: list.scrollWidth > bar.clientWidth + 1,
      left: strip.scrollLeft > 1,
      right: strip.scrollWidth - strip.clientWidth - strip.scrollLeft > 1
    };
    setScroll((previous) => Object.keys(next).every((key) => next[key] === previous[key]) ? previous : next);
  }, []);
  React19.useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return void 0;
    const refresh = () => {
      revealTab(strip, strip.querySelector('[aria-selected="true"]'));
      measure();
    };
    refresh();
    const view = strip.ownerDocument.defaultView;
    const observer = view.ResizeObserver ? new view.ResizeObserver(refresh) : null;
    for (const node of [barRef.current, strip, listRef.current]) observer?.observe(node);
    view.addEventListener("resize", refresh);
    return () => {
      observer?.disconnect();
      view.removeEventListener("resize", refresh);
    };
  }, [tabs, activeTabId, scroll.overflow, measure]);
  const scrollTabs = (direction) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollLeft += direction * Math.max(80, strip.clientWidth * 0.75);
    measure();
  };
  const handleKeyDown = (event, index) => {
    let next;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      next = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    }
    if (next === void 0) return;
    event.preventDefault();
    onChange(tabs[next].id);
    const target = stripRef.current?.querySelectorAll('[role="tab"]')[next];
    target?.focus({ preventScroll: true });
    revealTab(stripRef.current, target);
  };
  const arrow = (direction, label, enabled) => scroll.overflow ? h3("button", {
    type: "button",
    className: "dim-botSettingsScroll",
    "aria-label": label,
    title: label,
    disabled: !enabled,
    onClick: () => scrollTabs(direction)
  }, h3(
    "svg",
    { width: 16, height: 16, viewBox: "0 0 16 16", "aria-hidden": "true" },
    h3("path", {
      d: direction < 0 ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })
  )) : null;
  return h3(
    "div",
    { ref: barRef, className: "dim-botSettingsTabsBar" },
    arrow(-1, "\u5411\u5DE6\u6EDA\u52A8\u8BBE\u7F6E\u9875\u7B7E", scroll.left),
    h3("nav", {
      ref: stripRef,
      className: "dim-botSettingsTabs",
      role: "tablist",
      "aria-label": "\u673A\u5668\u4EBA\u8BBE\u7F6E\u9875\u7B7E",
      onScroll: measure
    }, h3(
      "div",
      { ref: listRef, className: "dim-botSettingsTabsList", role: "presentation" },
      tabs.map((tab, index) => h3("button", {
        key: tab.id,
        id: `dim-bot-settings-${tab.id}-tab`,
        type: "button",
        role: "tab",
        className: "dim-botSettingsTab",
        "aria-selected": tab.id === activeTabId,
        "aria-controls": `dim-bot-settings-${tab.id}-panel`,
        tabIndex: tab.id === activeTabId ? 0 : -1,
        onClick: (event) => {
          onChange(tab.id);
          revealTab(stripRef.current, event?.currentTarget);
        },
        onKeyDown: (event) => handleKeyDown(event, index)
      }, tab.label))
    )),
    arrow(1, "\u5411\u53F3\u6EDA\u52A8\u8BBE\u7F6E\u9875\u7B7E", scroll.right)
  );
}

// plugin-src/client/ds-bot-settings.js
var React21 = __toESM(require("react"), 1);

// plugin-src/client/ds-bot-avatar.js
var React20 = __toESM(require("react"), 1);

// plugin-src/client/ds-bot-avatar-data.js
var SHAPES = {
  "whale": {
    "label": "Whale",
    "body": "M65.3 20.9l5.1 .1 4.8 .9 4.8 1.7 4.3 2.3 3.8 3.1 3 3.4 2.3 3.8 1.6 4.3 .9 4.3 0 4.8-.8 4.8-1.4 4.3-2.3 4.3-3.2 4.3-3.4 3.3-4.3 3.1-7.2 3.5-7.6 1.7-7.2 .1-9.6-1.6-3.3-1-2.9-1.7-8.8-8.9-6-4.7-3.3-.5-7.7 1.1-4.8-.1-4.7-1.2-1.9-1.2-1-1-.5-1.5 .4-1.4 1.1-1.3 1.9-1.3 4.7-1.5 7.7-.6 1.1-.5 .7-1 0-1.4-2.8-7.2-1.2-5.3-.1-4.3 .4-1.4 .9-1.2 1.9-.2 2 1 2.2 2.3 2.2 3.4 3.2 7.6 1.9 9.7 .5-.1 1.1-7.2 1.8-4.8 3.2-5.2 3.9-4.3 4.9-3.9 5.6-2.9 5.8-1.9z",
    "paints": [
      [
        "M93.3 55.8l1-.3 .1 1.2-2.4 5.3-3.4 4.8-3.8 3.8-4.8 3.4-5.7 2.8-4.8 1.5-4.8 .4 20.1-17.4 5.2-3.7z",
        "#fff",
        1
      ]
    ],
    "shade": "M88.6 29.5l2.4 2.9 1.9 2.8 2.4 6.3 .5 3.3 .1 5.3-1.5 6.6-1.9 4.3-2 3.3-4.8 5.4-5.7 4.3-7.2 3.3-6.2 1.5-6.7 .1-3.3-.2-9.6-1.8-3.3-1.5-2.4-1.9-8.6-8.9-5.3-3.9-3.3-.1-2.9 .2-3.3 .8-5.8 0-4.3-1-2.9-1.9 .6-.6 3.8-1.3 10.5-2.5 4.3 .9 1.4-.1 2.2-1.7 .5-1.4-.3-1.5-1.2-1.4-2.2-1.4-1.2-1.9-.6-12 .4-3.3 .5-.5 2.9 3.8 2.4 4.8 1.9 5.7 .7 5.8 .7 2.8 2.1 2.4 2.7 5.5 3.8 4.3 2.9 2.2 3.3 1 3.4-.4 6.2-3 7.1-4.5 7.3-5.6 6.6-5.9 5.9-6.5 3.7-5.3 1.7-4.2 .1-2.9z",
    "light": "M55.6 22.8l1.9-.3 1.5 .3 .6 1 .1 .9-2 4.3-3.8 5.3-5.8 6.2-5.4 4.4-4.8 2.3-1.4 0-1.2-.5-.8-1.9 .5-3.3 2.5-4.8 3.3-4.3 2.4-2.4 5.3-3.9zM19.3 28.1l-1.4 2 .3-1.1zM21.7 49.1l.6 .5-.3 .5-.8 0zM35.8 52l1.2-.4 .9 .7 .7 1.6-.4 .9-1.2 .1-2.6-.5zM7.2 52.9l-2.9 2.9 1.2-1.6z",
    "eyes": [
      [
        72.5,
        48.4,
        9.3,
        23,
        -15.8
      ],
      [
        85.6,
        43.4,
        7,
        22.9,
        -21.2
      ]
    ]
  },
  "star": {
    "label": "Star",
    "body": "M40.1 4.4l1.5-.4 1.9 .1 5.2 1.1 1.9 .9 13.2 14.9 17.1-.8 5.2 1.1 1.8 .9 1.7 1.6 .7 2.4-.4 1.9-9.7 23.6 5.6 23.7 .1 1.9-.6 1.4-2.1 1.8-2.3 .5-19.9-1.8-16.6 15.5-1.9 1-1.9 .3-7-1.5-2.6-2.1-.9-2.4-2.8-24.1-16-13.6-1.1-1.5-.5-1.9 .4-1.9 1.2-1.5 18.9-13.6 7.1-24.6 1-1.7z",
    "shade": "M52 7.7l14.3 16.1 1 2.9 .3 3.1 19.4-1.3 2-1.4 .7-2.3-.4-1 .5 .5 .5 1.9-.4 1.9-9.8 23.2 5.5 23.1 .1 3.4-2 2.4-2.8 .8-19.4-2.1-1.9 1.4-14.7 14-2.4 1.4-3.3 .1-4.7-1-2-1 .6-.2 3.3 .8 2.8 .1 5.1-2.1 .7-.9 .4-2.4-2.6-22.7-.3-.3-1.4 .2-1.4 .7-5.7 .7-5.6-1.2-16.7-13.8 1-.1 5.2 1 3.8-1.1 1-.7 1.9-.4 .4-.4 1.5 .3 .4-.4 1 .2 18-12.8 6.7-23.5 0-1.8-.4-.5-.3-1.9 .4-2.4z",
    "light": "M40.1 4.4l2-.1 4.7 1 .7 1-.5 1.4-2.8 1.5-6.6 23.1 .7 1.2 .6 .3-18.1 12.5-1.8 2.1-3.4 .7-5.2-1.2-.3-.4 .3-.9 1.4-1.4 18.3-12.9 .9-2.3 6.4-22.7 .8-1.4z",
    "eyes": [
      [
        53.9,
        53.4,
        7.2,
        18.8,
        -10
      ],
      [
        65.1,
        49.2,
        7.2,
        18.8,
        -10
      ]
    ]
  },
  "moon": {
    "label": "Moon",
    "body": "M45.8 4.2l4.7-.2 4.2 .4 10.2 2.4 3.7 1.6 3.6 2.1 3.3 2.5 3 3.1 4.6 6.7 3.4 8.3 1.5 8.8 .1 4.6-.8 7.8-2.6 8.8-3.9 7.7-5.1 6.7-6.1 5.3-4.1 2.6-3.6 1.6-27.2 10.2-2.8 .7-2.6 0-5.7-1.3-2-.8-1.9-1.7-1.1-2.6-6.5-37.7-.2-5.2 .8-7.7 1.3-5.2 3.1-7.8 4.2-6.7 3-3.6 3.9-3.6 6.3-4.2 4.1-1.8z",
    "paints": [
      [
        "M57.6 9.9l.2-.3 .2 .3 2 4.7 1.9 1.9 2.6 .5 1.5-.7 1.1-1.1 .4 .4-.1 1.6-.7 1.5-2.2 2.5-1.6 .7-2 0-1.6-.8-1.3-1.4-.8-2-.4-2.6 .1-3.1z",
        "#1783FF",
        1
      ]
    ],
    "shade": "M74.3 13.5l2.1 1.5 .3-.4-.3-.6 2.1 2.1 4.6 6.7 3.1 7.4 1.5 7.6 .1 10.4-.6 4.6-2.5 8.3-4.2 8.2-3.1 4.2-5.7 5.7-6.2 4.2-4.6 2-28 10.3-4.1 0-5.2-1.1-2-.9-.5-.7 .5 .5 1.5 0 3.6 1 2.6-.3 5.7-2.1 2.1-2.1-5.4-31.5-.2-4.1 .4-1.1-.1-2.6 .5-3.6 1.8-7.7 2.8-6.7 1.9-3.1 3.9-5.2 3.2-3.1 2.5-2 5.2-2.9 3.1-1.1 3.1-.8 2.1 0 .5-.4 2.6 .2 1-.3 1.6 .4 1-.5 2.1 .8 1-.8 2.1 1.2z",
    "light": "M38 6.3l1.7-.3 2.5 .2 .6 .4 1.5 0 .5 .5 1.6 .3-3.1 1.3 .4 .7-2.5 1.6-.5 1-2.5 2.1-2.7 2.9-6.2 7.9-1.5 2.7-1 .9-1.2 2.6-1.4 1-1.3 3.7-1.3 .3-6-1.4-1 3.6-.8 0 .9-3.6-.5-1 1.1-3.6 2.7-5.7 4.1-6.2 5.7-5.8 3.1-2.4 3.6-2.2z",
    "eyes": [
      [
        51.6,
        48.5,
        8.4,
        22.1,
        -10
      ],
      [
        66.8,
        42.9,
        8.4,
        22.1,
        -10
      ]
    ]
  },
  "wave": {
    "label": "Wave",
    "body": "M46.1 4l6.1 .3 9.6 2.1 4.5 1.8 4.1 2.4 3.5 2.8 4.4 4.8 2.6 4 2.1 4.1 2.2 6 4.8 26 .5 5.3-.3 4.1-1.2 3.8-1.5 2.8-2.4 2.5-2.1 1.4-3.1 1-3 .3-8.1-1.5-3.2 5.3-2.1 2.1-2.5 1.5-2.8 1-3 .4-9.1-1.6-2.7 4.2-3.4 3.1-4 1.7-4.6 .1-7-1.5-3.5-1.9-3.4-3.5-2.1-4-1.5-5.6-3.7-20.7-.6-5.6-.1-5 .5-6.1 2.3-9.6 2.3-5.5 2.7-4.9 2.7-3.7 3.2-3.6 4.2-3.6 4.7-2.9 4.4-2 4-1.2z",
    "paints": [
      [
        "M61.6 48.5l2.2-.3 2 1.1 1.1 2.2 .3 3-.6 3.1-1.5 3.5-2.5 4.1-2.4 2.8-5-2.2-3-2.2-2.3-3-.7-3.5 .6-2.6 1.8-2.1 1.6-.7 1.5 0 1.5 .6 1.5 1.3 2-3.6z",
        "#fff",
        0.4
      ]
    ],
    "shade": "M69.3 13.6l2.6 1.3 .5-.3 .5-1.3 2 1.7 .5 0 2.5 2.7 3.5 5.5 3.6 8.6 1.5 6.6 3.5 19.7 .5 5.5-.4 4.6-2 5-1 1.6-2.6 2.5-3 1.5-2.1 .5-4 0-6.6-1.4-1.4 2.9-1.9 2.5-2.7 2.6-3.1 1.5-2.5 .6-4 .1-7.1-1.5-1.5 2.8-2.6 3-2 1.6-3 1.4-4.5 .6-7.1-1.5-3.6-1.5-3.5-3.1 6.6 1.5 2.8-.5 .5-.5-.3-.5 3.2-2-.4-1 1.4-1.5-.3-1 .7-1.6-.2-2.5-3.4-19.2 .3-.5-.6-5 .5-.5-.1-4.6 .4-.5 .3-4 1-4.1 1.5-4.5 3.8-7.7 5.5-6.9 3.1-2.6 6.5-3.9 7.6-2.2 3.1 0 .5-.4 3 .5 1-.5 2.5 1z",
    "light": "M36.5 6.1l2-.3 .5 .6 4.1 .5 1 .7-3.3 1.5-.3 1.2-3 2-.3 .8-2.8 2.6-3.5 4-3.9 5-2 3.6-1 .5-1.7 4-1.5 .5-1.4 4.6-1.6 .2-.5-.4-5.6-.9-.4-.4 1.4-5.1 1.5-3.5 2.6-5.1 4-5.5 6.6-6.2 4-2.5z",
    "eyes": [
      [
        47.5,
        37.2,
        8.4,
        22.1,
        -10
      ],
      [
        61.6,
        31.9,
        8.4,
        22.1,
        -10
      ]
    ]
  },
  "squircle": {
    "label": "Squircle",
    "body": "M54.5 4.2l3.9-.2 3.7 .3 11.6 2.7 3.1 1.6 2.8 1.9 2.6 2.7 2.2 3.1 2.4 4.8 1.9 5.8 3.7 19.4 .8 11.1-.4 4.7-1 4.7-1.3 3.5-1.8 3.4-4.8 5.8-6.4 4.7-8 4-14.2 5.3-9.5 2.2-7.4 .1-10.5-2.2-5.3-2.5-4.3-3.7-3.3-4.8-2.7-6.3-2.4-9.5-2.8-17.9-.2-7.8 1.3-7.9 2.2-5.3 2.8-4.2 4.1-4.2 4.3-3.1 6.3-3.4 11.6-4.6 7.9-2.7z",
    "shade": "M80.5 11.6l2.1 2.1 2.1 3.2 3.2 7.3 2.1 8.4 2.7 15.8 .5 7.9-.6 7.4-2 6.3-3.8 6.3-4.2 4.3-2.6 2-6.9 3.8-15.2 6.2-9.5 2.7-6.8 .6-6.2-.7-8.5-2-5.8-3.2-3.2-3.3 .5 .4 1.1-.2 5.8 1.4 2.1-.8 1.4-.7-.3-.5 1.4-1.1-.1-1 .8-.5 0-1.1 1.1-1 .1-2.1 .4-.6-.2-3.6-2.4-17.9-.2-9.5 .8-5.3 1.1-3.6 1.2-2.7 2.2-3.5 2.7-2.8 3.1-2.5 5.8-3.2 17.9-6.9 5.3-1.4 8.4-1.4 1.6-1.1 .5 .1 .9-1.5z",
    "light": "M39.4 8.4l1.2 0-1.6 .7-1-.1 1-.1zM36.8 9.5l1 0 .6 .9 4.2 .6 .7 .6-3.8-.4-.3 .4 1.9 .3 .1 .7-3.2 1.6-6.9 5.8-5.3 6-4.7 6.1-3.8 3.7-.2 .5-1.8 .1-6.8-1.7 .4-3.6 2.1-4.2 2.2-3.2 4.2-4.3 4.2-3 3.1-1.8 5.3-2.5zM35.1 10.5l1.7 0-.5 .4zM36.5 11.1l.3-.5 2.2 .1 .4 .4-.4 .3z",
    "eyes": [
      [
        52.6,
        52.4,
        8.4,
        22.1,
        -10
      ],
      [
        67.3,
        46.9,
        8.4,
        22.1,
        -10
      ]
    ]
  },
  "zed": {
    "label": "Bull",
    "body": "M77 4.4l1.1-.4 1.1 .2 1.2 1.3 2 9.8 2.2 5.9 .4 2.8-.3 2.1-.8 1.7-4.7 5.1-1.3 1.9-.4 1.7 .1 1.6 1 1.7 4.4 .2 3.8 1.3 2 1.7 .6 1.6-.3 1.7-.7 1.1-3.5 2.7 1.7 6 .4 5.9-.8 6.6-1.9 6-3.4 5.9-4.4 5.3-5.5 4.4-6 3.1-6.5 2-7.1 .7-6.5-.7-6.5-2.1-6-3.4-4.8-4.4-3.5-4.9-3.1-6.7-3.3 1.1-2.7 .3-2-.6-1.1-1.1-.3-2.2 .9-2.7 2.9-3.8 4.6-3.8 1.8-7.1-6.3-1.8-1.6-1.3-1.3-1.8-.6-2.7 0-6.6-1.4-8.7 .2-1.1 1.5-1.4 1.1-.1 1 .5 5.5 7.9 2.2 2.2 2.7 1.4 4.9 .4 .5-.1 6.5-5.1 6.6-3.2 6-1.6 8.7-.7 3.8-.9 2.7-1.5 3.9-3.2 3-3.8 2.4-4.9 2.1-10z",
    "paints": [
      [
        "M61 36.5l1.9 .7 1.4 2-.7 5.4 .3 .4 2.8-1.2 1.1 0 1 .9 .5 1.6-.5 .8-1 .5-7.1 2.4-1.1-.5-.9-1.6 1.4-5.4-.5-.6-3.3 1.1-1.1-.1-1.6-1-1-1.6 .5-.9z",
        "#fff",
        1
      ]
    ],
    "shade": "M80.2 5.5l.6 1.6 1.3 8.2 2.5 6 .2 3.7-.1 1.1-1.2 2.2-5.2 5.4-1.1 3.3 .9 2.7 3.8 3.9 1.6 .1 4.4-1.4 1.2 1.2 .1 1.1-.2 1.7-.6 1.1-3.6 2.7 .9 2.2 1.1 5.4 .1 6-1.1 6.5-2.3 6-3.8 6-6 6-4.9 3.3-5.9 2.6-7.1 1.7-7.1 .1-6-1.1-5.9-2.3-4.4-2.7-4.4-4.5 3.8 .4 5.5-1.5 7.6-3.9 6.8-4.7 7.9-6.5 7.1-6.9 5.4-6.5 4.4-6.7 1.8-4.4 .4-3.2-.3-1.1-3.3-3.8-.8-2.8 .8-2.7 6.2-7 .8-2.2-.1-2.7-1.7-4.4-.8-8.2zM14.9 29.9l.1-.5 4 6.5 2.3 2.7-1.4 .1-2-.6-3.6-7.1zM24.3 44.6l1-.3 1.1 .2 3.3 2.9 1.7 .5 .3 1.6-.5 2.2-1 1.6-1.6 1.5-1.6 .7-1.7 .1-3.2-2.2-2.2 0-2.7-.6-2.9-1.6 3.9-1.6 2.2-1.7 2.2-2.3zM21 68.6l.5-.5 1.1 .1 1.1 .5 .8 1 .6 2.7-.1 1.1-.7 1.1-.6 .1-2.2-1.2-2.7 1.1-3.8 .6-2.7-1.2 3.4-1.6z",
    "light": "M77 4.4l.6-.2 .1 .7-1.2 .8-.1-.8zM74.2 15.8l.6 1.1 .1 2.7-.6 2.2-1 1.6-5.5 5-1.7 .7-3.3 .3 .1-.6 2.1-1.2 4.2-3.6 2.7-3.9zM11.7 28.9l.8 0-.1 .5-1.2 .8-.1-.8zM44.3 32.1l3.1 0 .8 1.1 0 1.1-1.9 4.3-3 4.1-1.7-1.1-2.1-.8-4.4-.6-4.4 .1 5.5-4.4zM22 54.4l.6 0-.3 .6 .2 .5 2.3 2.7 .4 1.7-1 .9-4.8 2.3-7.1 7.8 0-1.8 2.1-3.3 6.4-5.4 1.2-4.3z",
    "eyes": [
      [
        61.8,
        69,
        9.5,
        22.3,
        -10.5
      ],
      [
        78.4,
        62.7,
        6.9,
        22.2,
        -11.2
      ]
    ]
  },
  "hex": {
    "label": "Blossom",
    "body": "M38.8 4.2l2.6-.1 6 1.3 2 1.3 3 3.3 12-4.5 2-.5 6.5 1.1 2.9 1.6 4.9 6 .8 2 .3 2-.2 2.5-1.9 7-1.3 2.2-1.9 1.8 2.9 1.3 1.8 1.7 10.1 12.5 1.5 3 .1 4-1.8 7-.9 2-2.8 2.7-7.1 2.7-5.2 20-.8 2-1.4 1.9-1.5 1.1-6.5 2.6-3 .2-6.5-1.6-2-1.4-4-4.9-16 5.7-2 .1-4.5-1-3-1.2-5.2-6-1.3-3 0-3.5 2-8.5-10.8-13.4-1.4-3-.3-2 .3-2.5 1.7-6.5 1.8-3 2.2-1.8 5.9-2.2 2.1-.4 2.5 .3 .4-.4-.7-2.5 .1-2.5 4.8-18.5 1-2.5 2.9-2.9z",
    "shade": "M49.7 7.7l.2-.4 .5 .4 2 2.3 0 .7 1.6 1.5 1 2 .1 1.5-.3 .5 .6 1.3 17.5-6.5 2.5-1.3 1-1.5 4.5 6 .6 1.5 .3 3-1.9 8-1 2-3 3-.3 1 .4 .5-1.7 3 .1 .5-.5 .5 0 .7 5.5-2.2 1.5-1.5 2 2 8 10 1 1.5 1 2.5-.1 4-1.9 7-1.1 1.9-2.9 2.5-6.8 2.5-4.7 19-1.5 3.5-2.5 2.5-6.5 2.6-4 0-5.5-1.4-2.2-1.7-3.2-4 4.9 .8 2.5-1.4 1.5-2.6 .7-2.3 1.7-6.5-.4-.3-.6 .8-.7 3.5-1.1 1.5 .3 .5-.3 .5-.7-.5-1.4-5.5-.5 1-.2 2-.9 1-.1 1.5-1.1 2-2.7 2.8-1 .4-1 .1-15.5 5.8-3-.1-4.5-1-2-1-2-2-2.2-3 .2-.2 4 .9 2-1.1 1.7-1.6 1.3-3.2 1.7-6.3 1.1-2.5-.3-.3-.5 .2-6.5-.3-.5-.5-2 0-.5-.5-1.7-.1-10.4-13.4 4.1 .7 3.1-1.7 1.3-2 2.5-8.5 .9-1.5 1.7-1.3 6.5-2.7 2-1.5-.3-.5 .3-.5 1.5-1.2 1.5-3 5.6-20.3 1.9-2 6-2.4 1.1-.6zM73.2 31.2l1.5 0-.8 1-34 12.7-1 .1-1.5-.5-2 .8-1.9-2.6 .4-.9 2 .5 1.5 1 .5-.4 1 .5 1-.3 1 .4 3-1.5 1 .1 3-1.6 1 .1 3-1.6 1 .1 3-1.6 2.5-.5 1.5-1 2.5-.5 1.5-1 2.5-.5 1.5-1 2.5-.5 1.5-1 1 0zM61.3 74.6l.1-.2 .4 .2-.4 1.7z",
    "light": "M33.4 6.2l3 .1 1.9 .9-.1 .5-1.8 2.5-3.4 3.5-4.5 17-3.6-.9-1 .4 0-1 4.4-16.5 0-1.5 2.1-3.1zM68.2 6.2l1.2 0zM14.9 37.7l3.5 .9 .4 .6-.3 1-5 5.5-1.1 4.6-2.5-.5-2 .1 0-1.7 1-4.5 1-2.5 2-2.1zM19.4 71.6l4 .7 1.8 .8-1.2 1-1.1 5.1-4.5-.5-.5-.6 1.4-5z",
    "eyes": [
      [
        49.8,
        55.5,
        6.7,
        17.7,
        -10
      ],
      [
        61.6,
        51.1,
        6.7,
        17.7,
        -10
      ]
    ]
  },
  "gumdrop": {
    "body": "M38.7 4.5l4.4-.5 4.6 .8 4.1 1.9 3.7 3.2 23.2 36.6 2.3 5 1.4 5.1 .7 6.4-.7 6.4-1.8 6.1-3.1 5.7-4.1 5.1-5.2 4.2-5.8 3.1-6 1.8-6.4 .6-6.4-.6-6-1.8-5.9-3.1-5.1-4.2-4.1-5.1-3-5.4-1.9-6.4-.7-6 .5-5.9 9-41.6 2-4.1 2.6-3.2 3.4-2.5z",
    "shade": "M54.9 9.5l1.9 2.3 22.9 36.5 1.8 4.6 .9 3.7 .6 4.1-.1 5.9-1.4 6.4-2.3 5.5-3.7 5.4-4.1 4.2-4.5 3.3-7.3 3.2-6.4 1.2-6.4 0-5.1-.9-5.9-2.1-5.5-3.3-4.6-4.1 .5-.3 4.1 .8 5.5-1 6.4-2.6 7.3-4.5 7.2-5.7 6.5-6.4 5.5-6.9 3.5-5.9-18.1-37 1.1-3.7 .2-2.3z",
    "light": "M37.1 4.9l2.5 0 .8 1.4-.5 2.1-1.8 2.9-3.2 3.2-3.2 2.1-2.3 .7-1.8-.1-.7-.9 .1-1.8 2.4-4.1 2.7-2.8z",
    "eyes": [
      [
        52.1,
        40.3,
        9.7,
        22.9,
        -15.2
      ],
      [
        64.8,
        35.6,
        6.3,
        23,
        -27
      ]
    ]
  },
  "peanut": {
    "body": "M43.5 4l6.6 .7 5.8 2.2 5.4 3.8 4.1 4.7 2 3.8 1.4 4.3 1.3 11.9 1 4.3 1.6 3.8 5.8 10.5 1.4 3.8 .8 4.3 .1 6.2-1 5.7-2.1 5.5-3.2 4.9-4.1 4.3-4.8 3.4-5.6 2.4-5.7 1.3-6.1 .1-5.8-1.1-5.7-2.2-4.7-3.1-4.3-4.1-3.3-4.8-2.5-5.7-1.2-5.7-.1-6.7 1.7-9 .4-4.3-.5-4.7-2.5-9.6-.6-3.8 .2-5.2 1.2-5.2 1.5-3.4 2.2-3.3 2.5-2.9 2.8-2.3 3.4-2.1 3.4-1.4 3.8-.9z",
    "shade": "M62.7 12.6l2.6 2.8 2.8 5.8 1.1 4.2 1 11.9 1 3.4 2.3 4.7 4.2 6.7 1.9 4.7 .9 3.8 .2 2.9-.1 6.2-.5 3.3-1.9 5.3-3.4 5.7-3.4 3.8-4.2 3.3-5.7 2.9-4.8 1.4-5.7 .6-6.2-.6-3.8-1-5.2-2.3-4.8-3.4-2.9-2.8 3.9 .8 5.2-.7 6.2-2.5 5.7-3.3 6.7-5.1 6.2-5.9 5.1-6.2 3.5-5.7-1.1-2.8-2.4-2.4-3.2-1.7-11.5-4.1-2.7-1.8-1.6-2.4-.2-2.4 .8-2.9 7.8-8 4.9-7.7 1.6-5.2z",
    "light": "M35.9 5.4l3.2-.2 1.3 .7 .5 1-.5 3.3-2.9 4.8-4.1 4.1-4.8 3.3-4.2 1.5-1.5 0-1.4-.6-.7-1.2 .2-2.4 1.9-3.8 2.4-3.3 4.3-3.9z",
    "eyes": [
      [
        50.9,
        31.5,
        8.7,
        20.5,
        -11.9
      ],
      [
        64.2,
        26.5,
        5.7,
        20.3,
        -16.3
      ]
    ]
  },
  "saucer": {
    "body": "M45 22.7l6.7 .1 6.7 1.9 4.3 2.5 3.5 3.1 2.8 3.5 2.5 4.5 6.8 .9 5.6 1.2 4.5 1.6 3.5 2.1 2.8 2.8 1.3 3.5-.5 3.5-2 3.5-2.6 2.8-3.5 2.8-4.5 2.8-5.1 2.6-12 4.4-13.6 3.1-13.6 1.5-12.6-.3-5.5-.7-5-1.2-4.1-1.6-3.5-2-2.8-3.1-1.1-3 .5-3.5 2-3.6 2.7-3 3.7-2.9 10.3-5.6 .7-5.1 1.5-4.5 2.6-4.5 3.1-3.5 3-2.4 3.5-2 3.5-1.4z",
    "shade": "M66.5 31.3l.3-.2 .6 .7 1.9 2.5 2 4.5 1.6 1.5 .1 1.5-1.7 1.7-3 1.2-3.1 .5-3.1-.3 4-8.1 .7-3.5zM94.9 47.4l1.1 3-.5 3.5-2.1 3.5-4 4.1-5 3.5-6.1 3.1-7 2.9-6.6 2.1-8 2-9.1 1.5-6.5 .6-11.6 0-4.5-.2-8-1.4-4.6-1.5-3.6-2.1 4.1 1.2 5.1 .8 7 .3 6-.2 15.1-1.9 15.6-3.6 14.5-5.1 5.4-2.5 5.3-3.1 4-3 2.3-2.5 1.2-2.1zM7.3 71l.7 .5z",
    "light": "M40.6 23.7l2.8 0 .8 .5 .7 1.5-.8 3.6-2.6 4-3.9 4-4.5 3.2-4.6 1.7-2.5-.4-1-1.4 0-1.6 .9-2.5 2.1-3.5 2.6-3 3-2.6 3.5-2.1zM22.4 47.4l.7 0-.5 .5 0 1.5 .4 .8 2 1.4 3 1.2 9.1 2 15.1 1.1-.2 1.5-2.2 3.6-3 2.5-4.9 2.5-6 2-7.9 1.5-6.5 .5-7.1-.4-4.9-1.1-3-1.5-1.6-1.7-.6-2.3 1.1-3.1 2.9-3.5 4.1-3.5 4.1-2.6z",
    "eyes": [
      [
        53.6,
        45,
        7.8,
        18.4,
        -14.5
      ],
      [
        66.2,
        40.3,
        5,
        18.3,
        -25.1
      ]
    ]
  },
  "bunny": {
    "body": "M49.3 4.4l1.5-.4 2 1.2 1.6 2.7 1.2 3.4 1.6 8.9 .2 6-.2 6.4 .6 3 2.4 2.5 5.4 3 3.4 2.4 5.1 5.5 2.4 3.9 1.7 4 1.1 4.4 .4 4.5-.5 5.9-1.6 5.5-2.8 5.4-3.6 4.5-4.6 3.8-4.9 2.7-5.5 1.7-5.9 .7-6-.5-5.4-1.7-4.9-2.5-4.7-3.7-3.8-4.5-2.7-4.9-1.8-5.5-.7-5.9 .6-6.5 1.9-5.9 3.1-5.4 4.6-5.5-.4-2-3.4-8.4-1.8-6.9-.6-6.9 .3-3 .6-2 1.3-1.4 2-.1 2.5 1.5 2.1 2.5 4 6.9 2.1 5.5 1.7 5.9 1.5 2.1 1.8-1.6 .7-2-.4-12.4 1-8.9 1.6-4.9z",
    "shade": "M52.7 5.4l2.1 3.5 1.9 7.4 .7 7.9-.5 8.4 .8 3.6-4.4-2.5-2.1-2.6 1.4-17.3zM31.2 15.3l.3-.5 2 2.5 2.9 4.9 2.5 6 1.7 6.4 1.4 2.5 0 .5-1.1 .9-4.5 1.9-2.4 .2-1.2-.6zM71.5 46l3.6 4.4 2.9 6 1.5 6.4 .1 5.5-1.1 6.3-2 5-3.4 5.4-3.5 3.6-4 2.9-6.4 3-4 1-6.9 .5-5.9-1-5.5-2-5.4-3.5-3.6-3.4 2.6 .7 2.5 .1 2.9-.5 4-1.3 8.4-4.6 8.7-6.8 7.4-7.9 5.3-7.9 1.3-3 1-3.5 .2-2.9-.2-2z",
    "light": "M49.3 4.4l.6 0-3.6 6.2 1-3.7zM26 13.3l.5-.4 .2 .4-1.7 2.2 0-.7zM44.8 34.6l.5-.1 1.2 1.1 .8 1 0 .7-.5 .3-4-.5zM45.1 42.5l.8 0-.3 1-2.4 4.5-3.8 4.4-4.1 3.5-3.8 2.4-4 1.6-2.9 .1-1.8-1.1-.4-2.5 1.1-3.5 3.5-5.4 3-3.1 .2 1.6 .8 .8 3 .1 4.4-1.2z",
    "eyes": [
      [
        59.2,
        69.2,
        8.2,
        19.3,
        -12
      ],
      [
        72.9,
        64,
        5.6,
        19.1,
        -15.4
      ]
    ]
  },
  "kitty": {
    "body": "M62.4 4.2l1.6-.1 1.5 1.2 7.4 21.3 3.7 6.4 6.2 7.4 3.1 5.9 1.5 4.8 .7 5.3-.2 5.4-1.1 5.3-3 7.4-4.4 6.4-5.3 5.4-6.9 4.6-7.5 3.1-8 1.7-8 .2-7.4-1.4-4.3-1.5-3.7-1.8-3.8-2.5-3.1-2.7-2.7-3-2.5-3.7-1.9-3.7-1.4-4.3-.9-5.3 .1-5.8 1.4-7 1.6-4.2 2-3.8 .8-3.2 .2-20.2 1.1-1.4 1.1-.3 1.1 .3 12.2 9.7 5.9-2.5 8-2.1 3.2-1.8 2.3-2.4 8.3-16z",
    "shade": "M64.9 5.8l.1-.3 .7 .3 6.5 19.7 3.1 5.9 2.5 3.2-1.6-.8-2.6-2.4-5.1-8zM79.4 36.7l2.2 2.1 1.6 2.2 3.3 6.9 1.5 6.9-.1 6.4-1.6 7.5-3.1 6.9-3.8 5.3-5.3 5.4-6.4 4.3-7 3.1-6.3 1.6-4.3 .6-5.3 0-7.5-1.1-5.8-2-5.9-3.3-5.9-5.4 2.7 .7 3.2-.1 3.7-.8 5.2-1.9 10.3-5.5 11-7.8 10.7-9.6 7.8-9.1 3-4.6 1.6-3.4 .7-3.2z",
    "light": "M62.4 4.2l.5-.1 0 .6-.8 1.1-4.5 14.4 .2 2.7-.3 1.6-1.1 1-2 .6-6.9-.5 2.6-1.3 3.1-3 8.1-16zM18.7 20.7l1.1-.5 0 .8-1.1 .9-.6-.1zM39.5 27.7l2.6-.3 1.9 .8 .4 1.6-.7 1.8-4.2-1.5-5.4 .2 0-.5zM16 47.4l.3 4.2 1.6 2.2 3 2.1-.6 .5-3.7 .6-1.1-.3-1.1-1.1-.4-1.8 .4-2.7z",
    "eyes": [
      [
        59.6,
        65.1,
        9.4,
        22.6,
        -11.9
      ],
      [
        77.5,
        58.4,
        7,
        22.5,
        -14
      ]
    ]
  },
  "beacon": {
    "body": "M40 4.1l2.7 0 2.5 .9 2 1.7 1.1 2.1 .5 2-.2 2.1-2.1 4.1-.4 1.6 1.5 7.7 9-3.1 4.1-.2 18.5 4 3.1 1.6 2.4 2.3 1.3 2.1 .9 2.6 5.8 33.4-.4 3.1-1.3 3.1-2 2.5-2.6 1.9-41.7 15.7-4.1 .7-19.6-4-3.5-1.9-2.5-2.5-1.2-2.1-.8-2.6-5.7-32.9 .4-3.1 1-2.7 1.7-2.5 2.4-1.9 28.4-10.9-1.5-9.3-.7-1-3.5-3.3-.9-1.9-.4-2 .5-2.6 1.1-2.1 1.7-1.5z",
    "shade": "M47.1 7.2l.4 0 .8 1.6 .3 2-.2 2.6-2.5 4.7 1.5 8.2 0 2 .5 .6 .1 1.5 .5 1-1.2 .4-1.3-.4-.3-.5-1.9-10.3-4.1-1.5-3.2-2.6 3.1-.9 3.2-2.2 2.5-2.6zM84.2 30.9l1.2 1.1 1.5 3.6 5.7 32.4 0 2.6-1 3.6-1 1.5-3.1 3.2-4.2 1.9-40.6 15-4.2 0-16.4-3.6-3.6-1.4-2.6-2.2 .5 .4 17.5 3.4 3.8-1.2 5-3.4 1-1.3-5.4-30.3 .2-.6 3.1-3.4 40.2-15.1 2-3.6z",
    "light": "M38.5 4.7l2 0-.1 1-.8 1.4-2.6 2.2-1 .4-1.1-.1-.1-.8 .7-1.6 1.5-1.6zM55 23.7l1.1 .1-1.6 .6-.9-.2 .9 0zM52.4 24.7l1 0-3 1.2-.9-.1 2.4-.6zM48.3 26.3l1 0-1.5 .6zM40 29.4l1.1 0-3.1 1.2-.9-.2 2.5-.5zM35.9 30.9l1 0-3 1.2-.9-.1 2.5-.6zM31.8 32.5l1 0-3 1.2-.9-.2 2.4-.5zM40.2 33l.4-.4 1-.1 1.6 .8 3 .7-1.5 .5-4.1 0-.9-1zM27.7 34l1 0-3 1.2-1-.2 2.5-.5zM23.6 35.6l1 0-3 1.1-1-.1 2.5-.5zM19.4 37.1l1 0-2.4 .8-.5 .7 15.4 3.3 .5 .3 .3 1.1-1.1 2.6-3.3 3.3-3.1 1.5-17.5-3.6-.6-1.2 .5-1.6 3.2-3.7 2.1-1.4 2.5-1.1 1 0 .6-.5 1 0z",
    "eyes": [
      [
        55.5,
        65.3,
        8.4,
        22.1,
        -10
      ],
      [
        74.2,
        58.3,
        8.4,
        22.1,
        -10
      ]
    ]
  },
  "plus": {
    "body": "M44.6 4.3l3.3-.1 11.9 2.5 2.5 1.3 1.3 1.4 .7 1.6 2.1 11.4 4.1-1.2 2.1 0 12.3 2.6 2.8 1.6 1.2 1.5 .7 1.5 3.8 21.6-.5 3.1-1 1.5-1.3 1.3-17 6.6 3.4 20.4-.4 2.5-1.2 2.1-2.3 1.6-19 6.9-2-.2-11.9-2.5-2.5-1.3-1.3-1.4-.7-1.6-2.1-11.4-4.1 1.2-2.1 0-12.3-2.6-2.8-1.6-1.2-1.5-.7-1.5-3.8-21.6 .5-3.1 1-1.5 1.3-1.3 17-6.6-3.4-20.4 .2-2 1.1-2.2 2.6-2z",
    "shade": "M63.2 9.4l.7 .6 .5 1.5 2.1 13.3 .6 .6 0 2.5 .5 .5 .1 2.6 .5 .5 .1 2.1-.8 3.1 19-7.1 1-1.2 1-2.1 1.1 2.1 .4 2.6 3.2 18 0 3.1-1 2-2.2 2.1-15.9 5.8-.8 .8 3.6 19.5-.1 2.6-1.5 2.6-2.2 1.6-16.4 6.1-2.1 .6-2.5 0-12.4-2.7-2.2-1.5 12.5 2.5 2.4-1 2.7-2-3.9-22.1-3.8 3.5-1 .4-2.6 .5-1.5 1-2.6 .5-1.5 1-2.6 .4-1.5 1-4.6 1.5-2.5 0-11.9-2.6-2.7-1.6 12.4 2.3 2.6-.9 2.4-1.9-3.4-20.5 .3-.5 1.7-1.8 18.6-6.9 .3-.6-.7-1-3.8-22.1 2.1-2.1 16.4-6.1 .6-.5z",
    "light": "M28.4 10.5l1.1 .5 10.2 2.1 .5 .4-.1 1.1-1.9 2.3-2.1 1-12.3-2.5-.1-1.3 1-1.6 1.2-1zM11.4 43.3l11.4 2.2 1 .6 0 .8-1.5 2.3-2.6 1.4-12.3-2.6-.2-1.1 .6-1 2.2-2.1z",
    "eyes": [
      [
        54.5,
        53.1,
        6.1,
        15.9,
        -10
      ],
      [
        64.5,
        49.4,
        6.1,
        15.9,
        -10
      ]
    ]
  },
  "magnet": {
    "body": "M71.9 4.2l1.2-.2 12.1 2.6 .5 .3 .6 1 6.2 35.6 .6 5.8-.1 5.7-.7 5.8-1.5 5.7-2.2 5.8-4.2 7.3-5.5 6.5-6.5 5-7.1 3.4-6.3 1.3-6.3 0-15.2-3.1-5.2-1.8-5.2-3-4.6-4.1-4-5.2-2.9-5.8-2.4-7.8-6.4-36.2 25-9.5 13.1 2.9 .5 .9 6.3 35.3 1.8-3.9 .5-4.7-6.3-36.1 .4-.6z",
    "shade": "M86.2 9.5l.5 1 5.8 33 .6 4.7 0 5.2-.6 5.8-2.1 8.4-3.1 7.3-3.7 5.8-6.3 6.8-5.7 4.1-5.8 2.7-6.8 1.5-6.3 0-15.2-3.1-5.7-2-5.2-3.2-5.9-5.8 .1-.7 11.5 2.5 .3-3.4-1.9-13.6-5.7-32.4 1-.1 18.3-6.9 .9-.9 .4-1 6.1 35 1.6 2.1 .1 .6 4 4.7 3.2 1.1 3.6-.6 3.2-1.9 2.4-2.8 1.9-4.2 .6-3.7-6.4-36.6 19.3-7.1 .8-.8z",
    "light": "M53.6 54.5l.7-.4 12 2.8 .6 1.8-.6 2.1-2.1 2.4-2.6 1-1.5 0-6.3-1.4-1.6-2.6-.2-2.1z",
    "eyes": [
      [
        59.6,
        82.1,
        6.1,
        15.9,
        -10
      ],
      [
        72,
        77.5,
        6.1,
        15.9,
        -10
      ]
    ]
  },
  "acorn": {
    "body": "M47.6 4l2.1 .6 1.3 1.5 .4 1.5-.4 5.2 .3 .3 8.8-.1 7.7 1 7.3 2.1 5.7 2.9 3.6 2.9 2.6 3 1.8 3.4 .9 3.7 0 4.1-1 3.6-1.7 2.2-3.9 3 2.9 8.3 .9 8.3-.9 8.3-2.7 7.7-4.2 6.8-2.9 3.1-3.2 2.6-6.7 3.8-3.7 1.2-4.1 .8-7.2 0-7.3-1.7-7-3.6-5.9-5.1-4.8-6.3-3.3-7.3-1.8-7.7-.1-8.3-4.5-1.5-2.6-1.7-2.6-4.1-1.1-4.1 0-4.2 1.2-4.1 2.2-4.1 2.8-3.7 5.2-4.6 6.3-3.8 7.2-3.2 8.3-2.3 .9-8.3 1.2-1.4z",
    "shade": "M50.6 6.1l.1-.5 .6 2-.6 5.7 .2 2.1-1.2 .2-1.2-.7 .5-6.8zM85.8 23.7l1.7 2 1.6 3.7 .6 2.6-.1 4.1-.5 2.6-1.1 2.1-2.1 2-2.9 2.1 1.4 3.1 1.6 5.2 .9 8.8-.5 5.7-1.4 5.7-2.2 5.1-2.6 4.2-5.1 5.7-5.2 3.6-4.7 2.2-6.2 1.5-7.7 .1-5.7-1.2-6.8-3-4.6-3.2-4.2-4.2 2.1 1 2.1 .3 3.1-.3 3.1-.9 6.4-3.1 6.5-4.6 6.6-5.8 5.9-6.4 5.6-7.9 4-7.4-2.4 .4-.5 .5-1.1 0-.5 .5-1 0-.5 .5-1.1 0-.5 .5-1 0-.5 .6-1.6-.1-.5 .5-1.6 0-.5 .5-3.6 .5-.5 .5-2.1-.1-.5 .6-2.1-.1-.5 .7-3.1-.2-.5 .5-3.1 0-.5 .7-4.7-.2-.5 .7-15.6-.3 0-.3 8.3-.6 11.4-2.4 11.4-3.8 10.5-4.8 9.2-5.7 6-5.2 2.2-2.6 1.6-2.9 .5-1.7z",
    "light": "M46 4.5l1.1-.1 0 .6-1.5 1.6-1.1 .2-.1-.7zM38.5 15.9l5 0 3.3 1.6 1.6 3.1 .1 3.1-.9 3.1-1.9 3.1-3.2 3.6-4 3.1-3.6 2.1-8.5 3.2-4.1 .7-4.2 .1-3.1-.5-2.6-1.5-1.1-2 .1-2.1 .5-1.5 2.1-3.7 4.1-4.6 3.7-3.1 5.1-3.2 6.3-3z",
    "eyes": [
      [
        63.6,
        63.3,
        9.6,
        22.7,
        -11.9
      ],
      [
        79.5,
        57.3,
        6.5,
        22.5,
        -15.5
      ]
    ]
  },
  "pebbles": {
    "body": "M47.3 4.5l2.7-.4 2.7 .1 13.7 3 4.3 2.1 3.3 3.4 1.3 2.2 1 2.8 2 12-.5 4.3-3.1 7.7 .2 .5 8.4 1.9 2.7 1 3.3 2.1 2.7 2.8 2.4 4.3 1.4 6.5 .1 4.4-.8 3.8-1.3 2.7-2 2.8-2.4 2.2-2.7 1.6-45.5 17-3.3 .6-3.2-.2-19.2-4.2-4.9-2.8-3.4-3.8-1.9-4.4-1.3-7.7 .2-3.2 .8-2.8 1.3-2.7 2-2.7 3.2-2.8 7.9-3.8 2.5-2.2-.4-1.6-5.4-6.1-1.8-3.8-2.3-12.5 .2-3.3 .7-2.7 2.6-4.4 2.2-2 2.2-1.4z",
    "shade": "M73.2 12.2l.4 0 1.5 2.2 1.2 3.3 1.8 11.4-.2 4.4-3.3 7.6 0 1.1 .6 1.1-1.2 1.3-26.8 10.1-3.2 .5-5.8-.4-15.2-3.3-1.4-.5-3.5-3.8 .2-.3 1.6 .2 10.9 2.2 2.8-.5 4.4-2.2 5-3.8 .1-.6-1.5-8.7 4-4.5 24.2-9.2 2.4-3.8zM90.9 48.8l2.8 3.8 1 2.8 1.2 6 0 4.3-1.1 3.9-1.7 3.2-3.8 3.9-2.7 1.7-42.1 15.8-5.5 1.6-3.8 0-18-3.8-4.9-2.1-3.4-2.9 17.6 3.8 2.7-.2 3.3-1.2 4.3-2.6 4.4-3.6-.4-3.8 4.4-4.9 42.5-16 2.1-3.1 1.1-2.8 .5-3.3z",
    "light": "M45.6 5.1l1.5 0-.4 .2-22.9 8.5 11.4 2.5 .6 .8 0 1.6-1.5 2.8-1.9 2.2-2.8 2.1-3.1 1.2-13.2-2.8-.1-2.2 1.2-2.2 1.7-2.2 2.7-2.2 2.2-1.1 2.2-.5 .5-.5 2.8-.6 1.6-1.1 2.7-.5 1.7-1.1 2.7-.6 1.6-1 2.8-.6 1.6-1.1 2.8-.5zM21.6 53.2l15.8 3.6 1.2 .7-.1 .9-.8 .8-3.1 1.6-1.3 3.8-3 3.8-3.3 2.5-3.3 1.4-18-3.6-.6-1.3 .6-2.2 1.6-2.7 1.7-1.8 3.8-2.8 5.5-2.2z",
    "eyes": [
      [
        51.2,
        34.1,
        6.9,
        18.1,
        -10
      ],
      [
        66.4,
        28.4,
        6.9,
        18.1,
        -10
      ]
    ]
  },
  "cushion": {
    "body": "M64.2 4.4l3.3-.4 2.8 .2 3.9 .8 2.8 1.1 2.7 1.7 2.4 2.1 1.9 2.4 1.5 2.8 1.2 3.9 7.1 40.6-.1 5-1.4 4.5-1.6 2.9-1.9 2.2-2.2 1.9-2.8 1.7-45.6 17.1-3.4 .9-3.4 .2-4.5-.7-3.4-1.2-3.3-2-2.9-2.7-2.3-3.4-1.5-3.9-7.3-41.7 .1-5 1.4-4.5 1.6-2.9 1.9-2.2 2.2-1.9 2.8-1.7z",
    "shade": "M82.1 10l2.9 4 1.6 4.5 7.3 42.2-.5 5.1-1.1 3.3-1.7 2.9-4.6 4.5-3.3 1.7-46.8 17.4-5.6 .2-4-.7-3.3-1.2-3.4-2.2-1.7-1.8 .6 .4 3.3 .2 4.5-1.2 5.1-2.8 5.3-4.4-6.9-39.4 5-5.7 43.9-16.4 2.3-3.6 1.1-2.8 .5-3.6z",
    "light": "M62.3 4.9l1.8 .1-43.4 16.1 1.1 .4 .8 .9 .1 1.7-1.6 3.4-2.6 3-3.4 2.7-3.4 1.5-3.4-.2-.8-.8-.2-1.2 .4-1.6 1.7-2.9 3.4-3.5 2.3-1.6 3.4-1.6 5.6-1.8 .6-.5 1.1 0 .5-.6 2.3-.5 .6-.6 1.1 0 .6-.6 2.2-.5 .6-.6 1.1 0 .6-.6 2.2-.5 .6-.6 1.1 0 .6-.5 2.2-.6 .6-.6 1.1 0 .6-.5 2.2-.6 .6-.5 1.1-.1 .6-.5 2.2-.6 .6-.5 1.1-.1 .6-.5 2.2-.6 .6-.5 1.1 0 .6-.6 2.2-.6 .6-.5 1.1 0z",
    "eyes": [
      [
        51.1,
        57.2,
        8.4,
        22.1,
        -10
      ],
      [
        69.9,
        50.1,
        8.4,
        22.1,
        -10
      ]
    ]
  },
  "ring": {
    "body": "M48.1 4.3l8-.1 7.8 1.8 7.3 3.5 6.7 5.4 5.2 6.7 4.1 8.3 2.3 8.9 .7 9-1 9.5-2.5 8.9-4.1 8.3-5.3 7.3-6.6 6.1-7.3 4.5-7.8 2.7-8.4 .9-7.2-.8-7.3-2.5-6.7-4.1-5.6-5.3-4.5-6.5-3.5-7.8-2-8.4-.6-8.4 .9-8.9 2.2-8.4 3.5-7.8 4.9-7.2 5.8-6.1 6.3-4.5 7.1-3.3zM50.5 33.8l2.3-.3 1.7 .4 1.6 1.1 2 2.2 1.3 2.8 .8 2.7 .4 3.4-.1 3.3-1.4 6.2-3 5.6-2.2 2.4-2.2 1.6-2.3 1-2.2 .3-1.7-.4-1.6-1.1-2.8-3.7-1.5-5.2-.1-5.5 1.2-5.6 2.4-5 3.6-4z",
    "shade": "M76.2 14.9l1.1-.5 3.4 3.8 2.8 3.9 2.3 4.5 1.6 3.9 1.6 5.6 1.1 8.3-.4 10.1-1.3 6.1-2.6 7.8-4.6 8.3-4.4 5.6-6.2 5.7-6.1 3.8-7.2 2.9-6.2 1.1-7.8-.1-7.2-1.7-3.9-1.6-4-2.2-5.5-4.5-2.8-3.4 1.7-.6 2.4-2.1 2-2.8 1.2-2.8 1.2-5 1.1-13.4 1.4-7.8 2.5-7.8 3.8-7.3 3.3-4.5 3.4-3.4 3.9-3.1 4.4-2.6 3.9-1.5 4.5-1.1 12.3-.9zM50.5 33.8l.6-.3 2.8 0 1.6 .9 2.7 2.8 3 1.4 3.3 .5 6.1 .2 3.9 .9 1.7 1 1.7 1.6 2.1 4.4 .7 4.5-.3 5-1.2 5-1.9 4.5-2.8 4.2-3.3 3.6-3.9 2.8-3.9 1.7-3.4 .6-3.3-.1-3.4-1.1-2.5-1.7-2.5-3-3.6-7-2.9-3.4-2.1-5-.6-5.6 .6-4.4 1-3.4 2.3-4.4 1.4-2.1 2.3-2.2 2.7-1.7z",
    "light": "M41.1 5.9l.5 .1 .2 .5-.3 .6-12.4 13.3-13.1 18.1-2.3 2.1-1.1 0-.2-1.2 .2-2.8 1.6-5 4.6-8.3 3.9-5.1 4.4-4.4 4.5-3.4 5-2.8zM60.5 53.3l1.2-.3 1.1 .6 1.1 1.3 .8 1.8-.2 3.3-1.5 2.8-2 1.7-2.6 1-7.3 .2 2.2-1.4 2.6-2.6z",
    "eyes": [
      [
        56.2,
        84.6,
        5.3,
        13.3,
        -6.8
      ],
      [
        71.7,
        78.8,
        5.1,
        13.4,
        -6.5
      ]
    ]
  },
  "gem": {
    "body": "M57 9.3l2.9-.4 14.9 3.5 19.6 14.1 1 1.4 .6 1.6-.5 2.6-27.1 56.5-1.6 1.8-2.1 .7-15.9-3.4-42.9-30.7-1.3-1.6-.6-1.6 .5-2.6 12-25.2 1.1-1.5 1.5-1z",
    "shade": "M75.7 14.6l.1-.4 .6 .2 16.9 12.3 1.1 .7 .5-.2 .5 .7 .6 2.6-.5 1.6-26.4 55.1-1.2 2.1-1.1 1.1-1.6 .6-2.1 0-14.3-3.3-42.8-30.7 1.5-.2 11.6 2.5 2.2-.7 2.8-2.6 11.9-24.9 .6-.8 38.2-14.2z",
    "light": "M19.1 23.6l1.1-.4 .5 .5 11.7 2.2 1 .9-.2 .5-1.8 2.7-11.7 24.4-1.6 .6-13.3-2.8-.5-.5 12.1-25.4 1.2-1.7z",
    "eyes": [
      [
        51.4,
        42.9,
        6.7,
        17.7,
        -10
      ],
      [
        66.1,
        37.4,
        6.7,
        17.7,
        -10
      ]
    ]
  }
};
var INKS = {
  "deepseek": [
    "#4D6BFE",
    "#6A84FF"
  ],
  "charcoal": [
    "#141416",
    "#F1F2F4"
  ],
  "graphite": [
    "#2D2D2D",
    "#D6D6DA"
  ],
  "rose": [
    "#EC2F6B",
    "#FF5A7A"
  ],
  "sky": [
    "#0AA8D6",
    "#2EE6E0"
  ],
  "tangerine": [
    "#FF6900",
    "#FF8A2E"
  ],
  "cobalt": [
    "#082DFF",
    "#5C78FF"
  ],
  "black": [
    "#000000",
    "#FFFFFF"
  ],
  "brown": [
    "#A27952",
    "#855C36"
  ],
  "red": [
    "#FF3E51",
    "#E02135"
  ],
  "orange": [
    "#FF781C",
    "#FF6700"
  ],
  "yellow": [
    "#FFAF38",
    "#FF9800"
  ],
  "green": [
    "#00C972",
    "#009957"
  ],
  "cyan": [
    "#1CC3B0",
    "#00A592"
  ],
  "blue": [
    "#2A92FE",
    "#0E74E0"
  ],
  "violet": [
    "#A97EFE",
    "#804EE0"
  ],
  "magenta": [
    "#FF5EB1",
    "#E02A88"
  ],
  "gray": [
    "#959595",
    "#777777"
  ],
  "aurora": [
    "#00B8D4",
    "#2EE6E0"
  ]
};

// plugin-src/client/ds-bot-avatar.js
function defaultLook(id2 = "") {
  let hash = 2166136261;
  for (const char of id2) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  let shape = Math.imul(hash ^ hash >>> 16, 73244475);
  shape = Math.imul(shape ^ shape >>> 13, 3266489909);
  const shapes = ["star", "moon", "gumdrop", "peanut", "bunny", "kitty", "acorn"];
  const seed = hash + 1831565813 | 0;
  let color = Math.imul(seed ^ seed >>> 15, 1 | seed);
  color = color + Math.imul(color ^ color >>> 7, 61 | color) ^ color;
  const colors = ["red", "orange", "yellow", "green", "cyan", "blue", "violet", "magenta"];
  return {
    shape: shapes[((shape ^ shape >>> 16) >>> 0) % shapes.length],
    color: colors[Math.floor(((color ^ color >>> 14) >>> 0) / 4294967296 * colors.length)]
  };
}
function DsBotAvatar({ bot, size = 24 }) {
  const id2 = React20.useId().replaceAll(":", "");
  const fallback = defaultLook(bot?.id);
  const shape = Object.hasOwn(SHAPES, bot?.avatar?.shape) ? SHAPES[bot.avatar.shape] : SHAPES[fallback.shape];
  const color = bot?.color ?? fallback.color;
  const fill = /^#[0-9a-f]{6}$/i.test(color) ? color : (Object.hasOwn(INKS, color) ? INKS[color] : INKS[fallback.color])[0];
  const image = bot?.avatar?.image;
  if (typeof image === "string" && /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(image)) {
    return React20.createElement("img", {
      className: "dim-dsBotAvatar",
      src: image,
      width: size,
      height: size,
      alt: ""
    });
  }
  const h5 = React20.createElement;
  return h5(
    "svg",
    { className: "dim-dsBotAvatar", width: size, height: size, viewBox: "0 0 100 100", "aria-hidden": true },
    h5(
      "defs",
      null,
      h5(
        "mask",
        { id: `${id2}mask` },
        h5("rect", { width: 100, height: 100, fill: "#fff" }),
        shape.eyes.map(([x, y, w, height, angle], index) => h5("rect", {
          key: index,
          x: -w / 2,
          y: -height / 2,
          width: w,
          height,
          rx: w / 2,
          fill: "#000",
          transform: `translate(${x} ${y}) rotate(${angle})`
        }))
      ),
      color === "aurora" ? h5(
        "linearGradient",
        { id: `${id2}gradient`, x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
        h5("stop", { offset: 0, stopColor: "#A4FFB0" }),
        h5("stop", { offset: ".42", stopColor: "#00F0E4" }),
        h5("stop", { offset: 1, stopColor: "#2E9EF7" })
      ) : null
    ),
    h5(
      "g",
      { mask: `url(#${id2}mask)`, fillRule: "evenodd" },
      h5("path", { d: shape.body, fill: color === "aurora" ? `url(#${id2}gradient)` : fill }),
      (shape.paints ?? []).map(([d, paint, opacity], index) => h5("path", { key: index, d, fill: paint, opacity })),
      h5("path", { d: shape.shade, fill: "#000", opacity: 0.14 }),
      h5("path", { d: shape.light, fill: "#fff", opacity: 0.16 })
    )
  );
}

// plugin-src/client/ds-bot-settings.js
var DS_BOT_MESSAGES = Object.freeze({
  missing: "\u672A\u5B89\u88C5 DS Bot\uFF0C\u8BF7\u5148\u5728 DSH \u63D2\u4EF6\u7BA1\u7406\u4E2D\u5B89\u88C5 ds-bot\uFF0C\u7136\u540E\u5237\u65B0\u3002",
  disabled: "DS Bot \u5C1A\u672A\u542F\u7528\uFF0C\u8BF7\u5728 DSH \u63D2\u4EF6\u7BA1\u7406\u4E2D\u542F\u7528\u540E\u5237\u65B0\u3002",
  unavailable: "\u6682\u65F6\u65E0\u6CD5\u8BFB\u53D6 DS Bot\uFF0C\u8BF7\u68C0\u67E5\u63D2\u4EF6\u662F\u5426\u6B63\u5E38\u8FD0\u884C\u540E\u91CD\u8BD5\u3002",
  readonly: "DS Bot \u5F53\u524D\u7531\u5176\u4ED6 Host \u7BA1\u7406\uFF0C\u8BF7\u5728\u8FD0\u884C\u5B83\u7684 Host \u4E2D\u7ED1\u5B9A\u3002",
  remote: "\u7ED1\u5B9Abot\u4EC5\u652F\u6301\u5F53\u524D Host \u7684\u4F1A\u8BDD\uFF0C\u8BF7\u5148\u68C0\u67E5\u673A\u5668\u4EBA\u7684 Harness \u8FDE\u63A5\u8BBE\u7F6E\u3002"
});
function dsBotErrorMessage(error) {
  return {
    "ds-bot-unavailable": DS_BOT_MESSAGES.unavailable,
    "ds-bot-not-found": "\u6240\u9009 DS Bot \u5DF2\u4E0D\u5B58\u5728\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u65B0\u9009\u62E9\u3002",
    "ds-bot-private-required": "\u4EC5\u652F\u6301\u5DF2\u7ECF\u5EFA\u7ACB\u4F1A\u8BDD\u7684\u79C1\u804A\uFF0C\u8BF7\u5148\u4E0E\u673A\u5668\u4EBA\u79C1\u804A\u540E\u5237\u65B0\u3002",
    "ds-bot-binding-conflict": "\u6240\u9009 DS Bot \u6216\u79C1\u804A\u5BF9\u8C61\u5DF2\u7ED1\u5B9A\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u65B0\u9009\u62E9\u3002"
  }[error?.code] ?? "\u7ED1\u5B9A\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002";
}
function DsBotPicker({ bots, value, onChange, disabled }) {
  const [open, setOpen] = React21.useState(false);
  const [active, setActive] = React21.useState(0);
  const root = React21.useRef(null);
  const trigger = React21.useRef(null);
  const listId = React21.useId();
  const selected = bots.find((bot) => bot.id === value);
  const isOpen = open && !disabled && bots.length > 0;
  React21.useEffect(() => {
    const dismiss = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    if (open) globalThis.document?.addEventListener("pointerdown", dismiss);
    return () => globalThis.document?.removeEventListener("pointerdown", dismiss);
  }, [open]);
  const choose = (bot) => {
    onChange(bot.id);
    setOpen(false);
    trigger.current?.focus();
  };
  const optionId = (index) => `${listId}-${index}`;
  return h3(
    "div",
    { className: "dim-dsBotPicker", ref: root },
    h3(
      "button",
      {
        type: "button",
        role: "combobox",
        ref: trigger,
        className: "dim-dsBotPickerTrigger",
        disabled: disabled || !bots.length,
        "aria-label": "DS Bot",
        "aria-expanded": isOpen,
        "aria-controls": listId,
        "aria-haspopup": "listbox",
        "aria-activedescendant": isOpen ? optionId(active) : void 0,
        onClick: () => {
          setActive(Math.max(0, bots.findIndex((bot) => bot.id === value)));
          setOpen(!open);
        },
        onKeyDown: (event) => {
          if (disabled || !bots.length) return;
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const index = event.key === "Home" ? 0 : event.key === "End" ? bots.length - 1 : open ? (active + (event.key === "ArrowDown" ? 1 : -1) + bots.length) % bots.length : Math.max(0, bots.findIndex((bot) => bot.id === value));
            setActive(index);
            setOpen(true);
          } else if (open && ["Enter", " "].includes(event.key)) {
            event.preventDefault();
            if (bots[active]) choose(bots[active]);
          } else if (event.key === "Escape" || event.key === "Tab") setOpen(false);
        }
      },
      selected ? h3(DsBotAvatar, { bot: selected }) : null,
      selected ? React21.createElement("span", { className: "dim-dsBotPickerName" }, selected.name) : h3("span", { className: "dim-dsBotPickerName" }, bots.length ? "\u9009\u62E9 DS Bot" : "\u6682\u65E0\u53EF\u9009 DS Bot"),
      h3(
        "svg",
        { width: 14, height: 14, viewBox: "0 0 16 16", "aria-hidden": true },
        h3("path", { d: "m4 6 4 4 4-4", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" })
      )
    ),
    isOpen ? h3(
      "div",
      { id: listId, role: "listbox", "aria-label": "DS Bot", className: "dim-dsBotOptions" },
      bots.map((bot, index) => h3(
        "button",
        {
          key: bot.id,
          id: optionId(index),
          type: "button",
          role: "option",
          tabIndex: -1,
          "aria-selected": value === bot.id,
          "data-active": active === index,
          onMouseDown: (event) => event.preventDefault(),
          onMouseEnter: () => setActive(index),
          onClick: () => choose(bot)
        },
        h3(DsBotAvatar, { bot }),
        React21.createElement("span", { className: "dim-dsBotPickerName" }, bot.name),
        value === bot.id ? h3("span", { "aria-hidden": true }, "\u2713") : null
      ))
    ) : null
  );
}
function conversationLabel(conversation) {
  if (conversation.name) return conversation.name;
  const value = conversation.address;
  return value.length > 24 ? `${value.slice(0, 10)}\u2026${value.slice(-8)}` : value;
}
function DsBotSettingsPage({ botId, rpcCall }) {
  const [status, setStatus] = React21.useState(null);
  const [dsBotId, setDsBotId] = React21.useState("");
  const [conversationKey, setConversationKey] = React21.useState("");
  const [loading, setLoading] = React21.useState(true);
  const [busy, setBusy] = React21.useState(false);
  const [feedback, setFeedback] = React21.useState(null);
  const [feedbackTone, setFeedbackTone] = React21.useState("success");
  const requests = React21.useRef({ revision: 0, busy: false, controller: null });
  const refresh = React21.useCallback(async (signal = requests.current.controller?.signal) => {
    const state = requests.current;
    if (signal?.aborted) return;
    const revision = ++state.revision;
    const current = () => !signal?.aborted && revision === state.revision;
    setLoading(true);
    try {
      const value = await rpcCall("ds-bot.status", { botId }, signal);
      if (current()) setStatus(value);
    } catch {
      if (current()) setStatus((previous) => ({ ...previous, state: "unavailable" }));
    } finally {
      if (current()) setLoading(false);
    }
  }, [botId, rpcCall]);
  React21.useEffect(() => {
    const controller = new AbortController();
    requests.current.controller = controller;
    void refresh(controller.signal);
    return () => {
      controller.abort();
      requests.current.revision++;
    };
  }, [refresh]);
  const conversations = status?.conversations ?? [];
  const bots = status?.bots ?? [];
  const bindings = conversations.filter((conversation) => conversation.dsBotId);
  const usedBotIds = new Set(bindings.map((binding) => binding.dsBotId));
  const availableBots = bots.filter((bot) => !usedBotIds.has(bot.id));
  const availableConversations = conversations.filter((conversation) => !conversation.dsBotId);
  const canSave = !busy && !loading && status?.state === "ready" && availableBots.some((bot) => bot.id === dsBotId) && availableConversations.some((conversation) => conversation.conversationKey === conversationKey);
  React21.useEffect(() => {
    setDsBotId((value) => availableBots.some((bot) => bot.id === value) ? value : "");
    setConversationKey((value) => availableConversations.some((conversation) => conversation.conversationKey === value) ? value : "");
  }, [status]);
  const save = async (event) => {
    event.preventDefault();
    if (!canSave || requests.current.busy) return;
    requests.current.busy = true;
    requests.current.revision++;
    setBusy(true);
    setFeedback(null);
    try {
      await rpcCall("ds-bot.bind", { botId, conversationKey, dsBotId });
      setDsBotId("");
      setConversationKey("");
      await refresh();
      setFeedbackTone("success");
      setFeedback("\u7ED1\u5B9A\u5DF2\u4FDD\u5B58\u3002");
    } catch (error) {
      if (error?.code === "ds-bot-binding-conflict") await refresh();
      setFeedbackTone("error");
      setFeedback(dsBotErrorMessage(error));
    } finally {
      requests.current.busy = false;
      setBusy(false);
    }
  };
  const unbind = async (key) => {
    if (requests.current.busy) return;
    requests.current.busy = true;
    requests.current.revision++;
    setBusy(true);
    setFeedback(null);
    try {
      await rpcCall("ds-bot.unbind", { botId, conversationKey: key });
      await refresh();
      setFeedbackTone("success");
      setFeedback("\u5DF2\u89E3\u9664\u7ED1\u5B9A\uFF0C\u804A\u5929\u8BB0\u5F55\u4FDD\u7559\u3002");
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(dsBotErrorMessage(error));
    } finally {
      requests.current.busy = false;
      setBusy(false);
    }
  };
  return h3(
    "section",
    { className: "dim-deliveryTargets dim-dsBotSettings", "aria-label": "\u7ED1\u5B9Abot" },
    h3(
      "div",
      { className: "dim-deliverySectionHeading" },
      h3("div", null, h3("h3", null, "\u7ED1\u5B9Abot"), h3("p", null, "\u9009\u62E9 DS Bot \u548C\u79C1\u804A\u5BF9\u8C61\uFF0C\u76F4\u63A5\u4F7F\u7528 Bot \u7684\u4F1A\u8BDD\u3002")),
      h3("button", { className: "dim-deliveryButton", type: "button", disabled: busy || loading, onClick: () => void refresh() }, "\u5237\u65B0")
    ),
    !status ? h3("p", { className: "dim-dsBotNotice", role: "status" }, "\u6B63\u5728\u68C0\u6D4B DS Bot\u2026") : status.state !== "ready" ? h3("p", { className: "dim-dsBotNotice", role: "status" }, DS_BOT_MESSAGES[status.state] ?? DS_BOT_MESSAGES.unavailable) : !bots.length ? h3("p", { className: "dim-dsBotNotice" }, "\u8FD8\u6CA1\u6709 DS Bot\uFF0C\u8BF7\u5148\u5728 DS Bot \u4E2D\u521B\u5EFA\u673A\u5668\u4EBA\u540E\u5237\u65B0\u3002") : !conversations.length ? h3("p", { className: "dim-dsBotNotice" }, "\u8FD8\u6CA1\u6709\u53EF\u7ED1\u5B9A\u7684\u79C1\u804A\u3002\u5148\u7ED9\u8FD9\u4E2A\u673A\u5668\u4EBA\u53D1\u4E00\u6761\u79C1\u804A\u6D88\u606F\uFF0C\u518D\u70B9\u51FB\u5237\u65B0\u3002") : h3(
      "form",
      { className: "dim-dsBotForm", onSubmit: save },
      h3(
        "div",
        { className: "dim-targetFormGrid" },
        h3(
          "div",
          { className: "dim-targetField" },
          h3("span", null, "DS Bot"),
          h3(DsBotPicker, { bots: availableBots, value: dsBotId, onChange: setDsBotId, disabled: busy || loading })
        ),
        h3(
          "label",
          { className: "dim-targetField" },
          h3("span", null, "\u79C1\u804A\u5BF9\u8C61"),
          h3(
            "select",
            {
              value: conversationKey,
              required: true,
              disabled: busy || loading || !availableConversations.length,
              onChange: (event) => setConversationKey(event.target.value)
            },
            h3("option", { value: "" }, availableConversations.length ? "\u9009\u62E9\u79C1\u804A\u5BF9\u8C61" : "\u6682\u65E0\u53EF\u9009\u79C1\u804A\u5BF9\u8C61"),
            availableConversations.map((conversation) => React21.createElement("option", {
              key: conversation.conversationKey,
              value: conversation.conversationKey
            }, conversationLabel(conversation)))
          )
        )
      ),
      !availableBots.length || !availableConversations.length ? h3("p", { className: "dim-dsBotNotice" }, "\u5DF2\u7ED1\u5B9A\u7684 DS Bot \u548C\u79C1\u804A\u5BF9\u8C61\u4E0D\u53EF\u91CD\u590D\u9009\u62E9\uFF0C\u89E3\u9664\u7ED1\u5B9A\u540E\u53EF\u91CD\u65B0\u9009\u62E9\u3002") : null,
      h3(
        "div",
        { className: "dim-targetFormActions" },
        h3("button", {
          type: "submit",
          className: "dim-deliveryButton",
          "data-kind": "primary",
          disabled: !canSave
        }, busy ? "\u6B63\u5728\u4FDD\u5B58\u2026" : "\u4FDD\u5B58\u7ED1\u5B9A")
      )
    ),
    bindings.length ? h3("ul", { className: "dim-targetList" }, bindings.map((conversation) => {
      const bot = bots.find((entry) => entry.id === conversation.dsBotId);
      return h3(
        "li",
        { className: "dim-targetRow dim-dsBotBinding", key: conversation.conversationKey },
        h3(
          "div",
          { className: "dim-dsBotBoundIdentity" },
          h3(DsBotAvatar, { bot: bot ?? { id: conversation.dsBotId }, size: 32 }),
          h3(
            "div",
            { className: "dim-targetSummary" },
            h3(
              "div",
              { className: "dim-targetTitle" },
              bot ? React21.createElement("strong", null, bot.name) : h3("strong", null, "DS Bot \u6682\u4E0D\u53EF\u7528"),
              h3("span", null, "\u5DF2\u7ED1\u5B9A")
            ),
            React21.createElement("p", { className: "dim-dsBotDestination" }, conversationLabel(conversation))
          )
        ),
        h3("button", {
          type: "button",
          className: "dim-deliveryButton",
          "data-kind": "danger",
          disabled: busy || loading,
          onClick: () => void unbind(conversation.conversationKey)
        }, "\u89E3\u9664\u7ED1\u5B9A")
      );
    })) : null,
    feedback ? h3("p", { role: "status", className: "dim-targetFeedback", "data-tone": feedbackTone }, feedback) : null
  );
}

// plugin-src/client/delivery-settings.js
var DELIVERY_RPC_CHANNEL = "/dsh-im-delivery";
var DELIVERY_DOCS_URL = Object.freeze({
  zh: "https://github.com/xmanrui/dsh-im/blob/main/PROACTIVE_DELIVERY.md",
  en: "https://github.com/xmanrui/dsh-im/blob/main/PROACTIVE_DELIVERY.en.md"
});
var DELIVERY_ENDPOINTS = Object.freeze({
  list: "target.list",
  listSuggestions: "target.suggestion.list",
  create: "target.create",
  update: "target.update",
  delete: "target.delete",
  sessionSync: "target.session-sync.set",
  test: "target.test"
});
var BOT_SETTINGS_TABS = Object.freeze([
  Object.freeze({ id: "general", label: "\u901A\u7528" }),
  Object.freeze({ id: "delivery", label: "\u6295\u9012\u8BBE\u7F6E" }),
  Object.freeze({ id: "ds-bot", label: "\u7ED1\u5B9Abot" }),
  Object.freeze({ id: "access", label: "\u8BBF\u95EE\u8BBE\u7F6E" })
]);
var FEISHU_BOT_SETTINGS_TABS = Object.freeze([
  ...BOT_SETTINGS_TABS,
  Object.freeze({ id: "group", label: "\u7FA4\u804A" }),
  Object.freeze({ id: "slash", label: "\u6307\u4EE4\u9762\u677F" }),
  Object.freeze({ id: "voice", label: "\u8BED\u97F3\u4EA4\u4E92" })
]);
var TELEGRAM_BOT_SETTINGS_TABS = Object.freeze([
  ...BOT_SETTINGS_TABS,
  Object.freeze({ id: "groups", label: "\u673A\u5668\u4EBA\u7FA4\u804A\u884C\u4E3A" })
]);
function botSettingsTabsForChannel(channel) {
  if (channel === "feishu") return FEISHU_BOT_SETTINGS_TABS;
  if (channel === "telegram") return TELEGRAM_BOT_SETTINGS_TABS;
  return BOT_SETTINGS_TABS;
}
var CHANNEL_DEFINITIONS = Object.freeze({
  weixin: {
    label: "\u5FAE\u4FE1",
    kinds: [{ value: "user", label: "\u7528\u6237" }],
    fields: { user: [{ key: "toUserId", label: "\u5FAE\u4FE1\u7528\u6237 ID", placeholder: "\u586B\u5199\u63A5\u6536\u6D88\u606F\u7684\u7528\u6237 ID" }] }
  },
  feishu: {
    label: "\u98DE\u4E66",
    kinds: [{ value: "user", label: "\u79C1\u804A" }, { value: "group", label: "\u7FA4\u804A" }],
    fields: {
      user: [{ key: "openId", label: "Open ID", placeholder: "ou_xxx" }],
      group: [{ key: "chatId", label: "\u7FA4 Chat ID", placeholder: "oc_xxx" }]
    }
  },
  dingtalk: {
    label: "\u9489\u9489",
    kinds: [{ value: "user", label: "\u7528\u6237" }, { value: "group", label: "\u7FA4\u804A" }],
    fields: {
      user: [{ key: "userId", label: "\u7528\u6237 ID", placeholder: "\u586B\u5199\u9489\u9489\u7528\u6237 ID" }],
      group: [{ key: "openConversationId", label: "\u7FA4 Open Conversation ID", placeholder: "cidxxx" }]
    }
  },
  wecom: {
    label: "\u4F01\u4E1A\u5FAE\u4FE1",
    kinds: [{ value: "user", label: "\u79C1\u804A" }, { value: "group", label: "\u7FA4\u804A" }],
    fields: {
      user: [{ key: "chatId", label: "\u7528\u6237 ID", placeholder: "\u586B\u5199\u4F01\u4E1A\u5FAE\u4FE1\u7528\u6237 ID" }],
      group: [{ key: "chatId", label: "\u7FA4 Chat ID", placeholder: "\u586B\u5199\u7FA4 chatid" }]
    }
  },
  wecomApp: {
    label: "\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528",
    kinds: [{ value: "user", label: "\u79C1\u804A" }],
    fields: {
      user: [{ key: "chatId", label: "\u7528\u6237 ID", placeholder: "\u586B\u5199\u4F01\u4E1A\u5FAE\u4FE1\u7528\u6237 ID" }]
    }
  },
  qq: {
    label: "QQ",
    kinds: [{ value: "user", label: "\u5355\u804A" }, { value: "group", label: "\u7FA4\u804A" }],
    fields: {
      user: [{ key: "userOpenId", label: "\u7528\u6237 Open ID", placeholder: "\u586B\u5199 user_openid" }],
      group: [{ key: "groupOpenId", label: "\u7FA4 Open ID", placeholder: "\u586B\u5199 group_openid" }]
    }
  },
  slack: {
    label: "Slack",
    kinds: [{ value: "conversation", label: "\u4F1A\u8BDD" }, { value: "thread", label: "\u7EBF\u7A0B" }],
    fields: {
      conversation: [{ key: "channelId", label: "Channel ID", placeholder: "C0123456789" }],
      thread: [
        { key: "channelId", label: "Channel ID", placeholder: "C0123456789" },
        { key: "threadTs", label: "Thread \u65F6\u95F4\u6233", placeholder: "1712345678.123456" }
      ]
    }
  },
  telegram: {
    label: "Telegram",
    kinds: [{ value: "chat", label: "\u804A\u5929" }, { value: "topic", label: "\u8BDD\u9898" }],
    fields: {
      chat: [{ key: "chatId", label: "Chat ID", placeholder: "-1001234567890", inputMode: "numeric" }],
      topic: [
        { key: "chatId", label: "Chat ID", placeholder: "-1001234567890", inputMode: "numeric" },
        { key: "messageThreadId", label: "Topic ID", placeholder: "123", inputMode: "numeric", integer: true }
      ]
    }
  },
  discord: {
    label: "Discord",
    kinds: [{ value: "channel", label: "\u9891\u9053\u6216\u79C1\u4FE1" }],
    fields: { channel: [{ key: "channelId", label: "Channel ID", placeholder: "\u586B\u5199\u53EF\u53D1\u6D88\u606F\u7684 Channel ID", inputMode: "numeric" }] }
  },
  whatsapp: {
    label: "WhatsApp",
    kinds: [{ value: "user", label: "\u7528\u6237" }, { value: "group", label: "\u7FA4\u804A" }],
    fields: {
      user: [{ key: "jid", label: "\u7528\u6237 JID", placeholder: "8613800000000@s.whatsapp.net" }],
      group: [{ key: "jid", label: "\u7FA4 JID", placeholder: "1234567890@g.us" }]
    }
  },
  imessage: {
    label: "iMessage",
    kinds: [{ value: "user", label: "\u79C1\u804A" }],
    fields: { user: [{ key: "chatGuid", label: "Chat GUID", placeholder: "iMessage;+;chat123" }] }
  }
});
function presentError2(error, fallback) {
  return error?.message || fallback;
}
function unwrapRpcResult3(result2) {
  if (result2?.ok === true) return result2.value;
  if (result2?.ok === false) {
    const error = new Error(result2.error?.message || "\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
    error.code = result2.error?.code;
    throw error;
  }
  return result2;
}
function targetsFrom(value) {
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.targets) ? value.targets : [];
}
function suggestionsFrom(value) {
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.suggestions) ? value.suggestions : [];
}
function kindLabel(definition, kind) {
  return definition.kinds.find((entry) => entry.value === kind)?.label ?? kind;
}
function fieldsFor(definition, kind) {
  return definition.fields[kind] ?? [];
}
function cleanDisplayName(value) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 80) : null;
}
function suggestionDisplayName(suggestion) {
  return cleanDisplayName(
    suggestion?.name ?? suggestion?.displayName ?? suggestion?.label
  );
}
function routeIdentity(definition, candidate) {
  const fields = fieldsFor(definition, candidate?.kind);
  if (fields.length === 0 || !candidate?.route || typeof candidate.route !== "object") return null;
  const values = [];
  for (const field of fields) {
    const value = candidate.route[field.key];
    if (value === void 0 || value === null || String(value).trim() === "") return null;
    values.push(String(value).trim());
  }
  return JSON.stringify([candidate.kind, ...values]);
}
function validSuggestions(definition, value) {
  const seen = /* @__PURE__ */ new Set();
  return suggestionsFrom(value).filter((suggestion) => {
    const identity = routeIdentity(definition, suggestion);
    if (!identity || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}
function maskRouteValue(value) {
  const text3 = String(value ?? "").trim();
  if (!text3) return "";
  const at = text3.indexOf("@");
  if (at > 0) {
    const local = text3.slice(0, at);
    const domain = text3.slice(at);
    const visible = local.length <= 4 ? `${local.slice(0, 1)}\u2022\u2022${local.slice(-1)}` : `${local.slice(0, 3)}\u2026${local.slice(-2)}`;
    return `${visible}${domain}`;
  }
  if (text3.length <= 6) return `${text3.slice(0, 2)}\u2026${text3.slice(-1)}`;
  if (text3.length <= 12) return `${text3.slice(0, 3)}\u2026${text3.slice(-3)}`;
  return `${text3.slice(0, 5)}\u2026${text3.slice(-4)}`;
}
function suggestionFallbackName(definition, suggestion) {
  const displayName = suggestionDisplayName(suggestion);
  if (displayName) return displayName;
  const firstField = fieldsFor(definition, suggestion.kind)[0];
  const route = firstField ? maskRouteValue(suggestion.route?.[firstField.key]) : "";
  return `${localizeText(kindLabel(definition, suggestion.kind))}${route ? ` \xB7 ${route}` : ""}`;
}
function randomTargetId(targets) {
  const used = new Set(targets.map((target) => target?.targetId));
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const bytes = new Uint8Array(8);
    const crypto = globalThis.crypto;
    if (typeof crypto?.getRandomValues === "function") {
      crypto.getRandomValues(bytes);
    } else {
      for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = Math.floor(Math.random() * 256);
      }
    }
    const suffix = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
    const targetId = `tgt_${suffix}`;
    if (!used.has(targetId)) return targetId;
  }
  throw new Error("\u65E0\u6CD5\u751F\u6210\u672A\u5360\u7528\u7684 Target ID\uFF0C\u8BF7\u91CD\u8BD5\u3002");
}
function DeliveryButton({ children, kind = "secondary", className = "", ...props }) {
  return h3("button", {
    ...props,
    type: props.type ?? "button",
    className: `dim-deliveryButton ${className}`.trim(),
    "data-kind": kind
  }, children);
}
async function copyText(value) {
  const clipboard = globalThis.navigator?.clipboard;
  if (typeof clipboard?.writeText !== "function") {
    throw new Error("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u81EA\u52A8\u590D\u5236\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9\u590D\u5236\u3002");
  }
  await clipboard.writeText(value);
}
function TargetForm({
  definition,
  mode,
  initialValue,
  source,
  busy,
  connected,
  onCancel,
  onSave,
  onTest
}) {
  const editing = mode === "edit";
  const initialKind = initialValue?.kind && definition.fields[initialValue.kind] ? initialValue.kind : definition.kinds[0].value;
  const [targetId, setTargetId] = React22.useState(initialValue?.targetId ?? "");
  const [name2, setName] = React22.useState(initialValue?.name ?? "");
  const [kind, setKind] = React22.useState(initialKind);
  const [route, setRoute] = React22.useState(initialValue?.route ?? {});
  const [error, setError] = React22.useState(null);
  const [testing, setTesting] = React22.useState(false);
  const [testState, setTestState] = React22.useState(null);
  const currentTarget = () => {
    const normalizedRoute = Object.fromEntries(fieldsFor(definition, kind).map((field) => {
      const raw = String(route[field.key] ?? "").trim();
      return [field.key, field.integer ? Number(raw) : raw];
    }));
    return {
      targetId: targetId.trim(),
      ...name2.trim() ? { name: name2.trim() } : {},
      kind,
      route: normalizedRoute
    };
  };
  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await onSave({
        ...currentTarget()
      });
    } catch (caught) {
      setError(presentError2(caught, "\u76EE\u6807\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5\u3002"));
    }
  };
  const testTarget = async () => {
    if (typeof onTest !== "function") return;
    setTesting(true);
    setTestState(null);
    try {
      const target = currentTarget();
      await onTest({ kind: target.kind, route: target.route });
      setTestState({ tone: "success", message: "\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\uFF0C\u8BF7\u5230\u76EE\u6807\u4F1A\u8BDD\u786E\u8BA4\u3002" });
    } catch (caught) {
      setTestState({ tone: "error", message: presentError2(caught, "\u6D4B\u8BD5\u53D1\u9001\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002") });
    } finally {
      setTesting(false);
    }
  };
  const testReady = fieldsFor(definition, kind).every((field) => String(route[field.key] ?? "").trim());
  return h3(
    "form",
    { className: "dim-targetForm", onSubmit: submit },
    h3(
      "div",
      { className: "dim-targetFormHeading" },
      h3("h3", null, editing ? "\u7F16\u8F91\u6295\u9012\u76EE\u6807" : "\u65B0\u5EFA\u6295\u9012\u76EE\u6807"),
      editing ? initialValue?.sessionSync?.enabled ? h3("p", null, "\u4FEE\u6539\u63A5\u6536\u4F4D\u7F6E\u4F1A\u5173\u95ED\u4F1A\u8BDD\u53CC\u5411\u540C\u6B65\u3002") : null : h3("p", null, source === "suggestion" ? "\u5DF2\u4ECE\u4F1A\u8BDD\u81EA\u52A8\u586B\u5165\u76EE\u6807\u4FE1\u606F\uFF1B\u786E\u8BA4\u540E\u518D\u4FDD\u5B58\u3002" : "\u8BF7\u624B\u52A8\u586B\u5199\u4ECE\u5BF9\u5E94\u5E73\u53F0\u53D6\u5F97\u7684\u539F\u751F\u6807\u8BC6\u3002")
    ),
    h3(
      "div",
      { className: "dim-targetFormGrid" },
      h3(
        "label",
        { className: "dim-targetField" },
        h3("span", null, "Target ID"),
        h3("input", {
          name: "targetId",
          value: targetId,
          readOnly: editing,
          disabled: testing,
          required: true,
          pattern: "[A-Za-z0-9._:@-]{1,128}",
          maxLength: 128,
          autoCapitalize: "none",
          autoCorrect: "off",
          spellCheck: false,
          placeholder: "\u4F8B\u5982 daily-report",
          onChange: (event) => setTargetId(event.target.value)
        })
      ),
      h3(
        "label",
        { className: "dim-targetField" },
        h3("span", null, "\u663E\u793A\u540D\u79F0\uFF08\u53EF\u9009\uFF09"),
        h3("input", {
          name: "name",
          value: name2,
          disabled: testing,
          maxLength: 80,
          placeholder: "\u4F8B\u5982 \u6BCF\u65E5\u6C47\u62A5\u7FA4",
          onChange: (event) => setName(event.target.value)
        })
      ),
      h3(
        "label",
        { className: "dim-targetField" },
        h3("span", null, "\u76EE\u6807\u7C7B\u578B"),
        h3("select", {
          name: "kind",
          value: kind,
          disabled: testing,
          onChange: (event) => {
            setKind(event.target.value);
            setRoute({});
            setTestState(null);
          }
        }, definition.kinds.map((entry) => h3("option", {
          key: entry.value,
          value: entry.value
        }, entry.label)))
      ),
      fieldsFor(definition, kind).map((field) => h3(
        "label",
        {
          key: field.key,
          className: "dim-targetField"
        },
        h3("span", null, field.label),
        h3("input", {
          name: field.key,
          value: route[field.key] ?? "",
          disabled: testing,
          required: true,
          inputMode: field.inputMode,
          autoCapitalize: "none",
          autoCorrect: "off",
          spellCheck: false,
          placeholder: field.placeholder,
          onChange: (event) => {
            setRoute((current) => ({
              ...current,
              [field.key]: event.target.value
            }));
            setTestState(null);
          }
        })
      ))
    ),
    error ? h3("p", { className: "dim-targetFormError", role: "alert" }, error) : null,
    testState ? h3("p", {
      className: "dim-targetFeedback",
      "data-tone": testState.tone,
      role: "status",
      "aria-live": "polite"
    }, testState.message) : null,
    h3(
      "div",
      { className: "dim-targetFormActions" },
      h3(DeliveryButton, { onClick: onCancel, disabled: busy || testing }, "\u53D6\u6D88"),
      h3(DeliveryButton, {
        onClick: () => void testTarget(),
        disabled: busy || testing || !connected || !testReady || typeof onTest !== "function",
        title: connected ? void 0 : "\u673A\u5668\u4EBA\u79BB\u7EBF\u65F6\u4E0D\u53EF\u53D1\u9001\u6D4B\u8BD5\u6D88\u606F",
        "aria-label": "\u6D4B\u8BD5\u6295\u9012\u76EE\u6807"
      }, testing ? "\u6D4B\u8BD5\u4E2D\u2026" : "\u6D4B\u8BD5"),
      h3(
        DeliveryButton,
        { type: "submit", kind: "primary", disabled: busy || testing },
        busy ? "\u6B63\u5728\u4FDD\u5B58\u2026" : "\u4FDD\u5B58\u76EE\u6807"
      )
    )
  );
}
function suggestionOptionLabel(definition, suggestion, added) {
  const name2 = suggestionDisplayName(suggestion);
  const type = localizeText(kindLabel(definition, suggestion.kind));
  const route = fieldsFor(definition, suggestion.kind).map((field) => maskRouteValue(suggestion.route?.[field.key])).filter(Boolean).join(" \xB7 ");
  return [name2, type, route, added ? localizeText("\u5DF2\u6DFB\u52A0") : null].filter(Boolean).join(" \xB7 ");
}
function TargetSuggestionPicker({
  definition,
  phase,
  suggestions,
  error,
  targets,
  onRefresh,
  onSelect,
  onManual,
  onCancel
}) {
  const configured = new Set(targets.map((target) => routeIdentity(definition, target)).filter(Boolean));
  return h3(
    "section",
    { className: "dim-targetSuggestions", "aria-label": "\u4ECE\u5DF2\u804A\u8FC7\u7684\u4F1A\u8BDD\u9009\u62E9" },
    h3(
      "div",
      { className: "dim-targetSuggestionHeading" },
      h3(
        "div",
        null,
        h3("h3", null, "\u4ECE\u5DF2\u804A\u8FC7\u7684\u4F1A\u8BDD\u9009\u62E9"),
        h3("p", null, "\u9009\u62E9\u540E\u4F1A\u81EA\u52A8\u586B\u5199\u76EE\u6807\u4FE1\u606F\u548C\u8C03\u7528\u522B\u540D\uFF0C\u786E\u8BA4\u540E\u518D\u4FDD\u5B58\u3002")
      ),
      h3(DeliveryButton, {
        onClick: () => void onRefresh(),
        disabled: phase === "loading"
      }, phase === "loading" ? "\u6B63\u5728\u5237\u65B0\u2026" : "\u5237\u65B0")
    ),
    phase === "loading" ? h3("div", { className: "dim-targetSuggestionState", "aria-busy": "true" }, "\u6B63\u5728\u8BFB\u53D6\u5DF2\u804A\u4F1A\u8BDD\u2026") : phase === "error" ? h3(
      "div",
      { className: "dim-targetSuggestionState", role: "alert" },
      h3("p", null, error),
      h3(DeliveryButton, { onClick: () => void onRefresh() }, "\u91CD\u65B0\u8BFB\u53D6")
    ) : suggestions.length === 0 ? h3(
      "div",
      { className: "dim-targetSuggestionState" },
      h3("strong", null, "\u8FD8\u6CA1\u6709\u53EF\u9009\u62E9\u7684\u4F1A\u8BDD"),
      h3("p", null, "\u5148\u5728\u5BF9\u5E94\u5E73\u53F0\u4E0E\u673A\u5668\u4EBA\u804A\u4E00\u6761\u6D88\u606F\uFF0C\u518D\u5237\u65B0\u3002")
    ) : h3(
      "label",
      { className: "dim-targetSuggestionField" },
      h3("span", null, "\u5DF2\u804A\u4F1A\u8BDD"),
      h3(
        "select",
        {
          name: "suggestion",
          value: "",
          onChange: (event) => {
            if (event.target.value === "") return;
            const suggestion = suggestions[Number(event.target.value)];
            if (suggestion) onSelect(suggestion);
          }
        },
        h3("option", { value: "", disabled: true }, "\u4ECE\u4F1A\u8BDD\u9009\u62E9targetID"),
        suggestions.map((suggestion, index) => {
          const identity = routeIdentity(definition, suggestion);
          const added = configured.has(identity);
          return React22.createElement("option", {
            key: suggestion.id ?? suggestion.suggestionId ?? `${identity}:${index}`,
            value: String(index),
            disabled: added
          }, suggestionOptionLabel(definition, suggestion, added));
        })
      )
    ),
    h3(
      "div",
      { className: "dim-targetFormActions" },
      h3(DeliveryButton, { onClick: onCancel }, "\u53D6\u6D88"),
      h3(DeliveryButton, { onClick: onManual }, "\u624B\u52A8\u586B\u5199\uFF08\u9AD8\u7EA7\uFF09")
    )
  );
}
function TargetRow({ definition, target, botId, connected, rpcCall, onChanged, onEdit }) {
  const [action, setAction] = React22.useState(null);
  const [testState, setTestState] = React22.useState(null);
  const [syncFeedback, setSyncFeedback] = React22.useState(null);
  const [copyState, setCopyState] = React22.useState(null);
  const [confirmDelete, setConfirmDelete] = React22.useState(false);
  const sessionSync = target.sessionSync ?? { enabled: false, state: "unavailable" };
  const syncDescription = sessionSync.state === "active" ? "\u81EA\u52A8\u8DDF\u968F\u8BE5\u79C1\u804A\u7684\u5F53\u524D\u4F1A\u8BDD" : sessionSync.state === "waiting" ? "\u7B49\u5F85\u8BE5\u79C1\u804A\u5EFA\u7ACB\u65B0\u4F1A\u8BDD" : sessionSync.state === "unavailable" ? "\u4EC5\u652F\u6301\u5DF2\u7ECF\u804A\u8FC7\u3001\u5DF2\u5EFA\u7ACB\u5F53\u524D\u4F1A\u8BDD\u4E14\u4F7F\u7528\u5F53\u524D Host Harness \u7684\u79C1\u804A\u76EE\u6807" : "\u5173\u95ED\u65F6\u4E0D\u53D1\u9001 DSH \u4F1A\u8BDD\u6D88\u606F";
  const testTarget = async () => {
    setAction("test");
    setTestState(null);
    try {
      await rpcCall(DELIVERY_ENDPOINTS.test, { botId, targetId: target.targetId });
      setTestState({ tone: "success", message: "\u6D4B\u8BD5\u6D88\u606F\u5DF2\u53D1\u9001\uFF0C\u8BF7\u5230\u76EE\u6807\u4F1A\u8BDD\u786E\u8BA4\u3002" });
    } catch (error) {
      setTestState({ tone: "error", message: presentError2(error, "\u6D4B\u8BD5\u53D1\u9001\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002") });
    } finally {
      setAction(null);
    }
  };
  const copyPair = async () => {
    setCopyState(null);
    try {
      await copyText(JSON.stringify({ botId, targetId: target.targetId }));
      setCopyState("\u5DF2\u590D\u5236\u8C03\u7528\u53C2\u6570");
    } catch (error) {
      setCopyState(presentError2(error, "\u590D\u5236\u5931\u8D25\u3002"));
    }
  };
  const deleteTarget = async () => {
    setAction("delete");
    try {
      await rpcCall(DELIVERY_ENDPOINTS.delete, { botId, targetId: target.targetId });
      await onChanged();
    } catch (error) {
      setTestState({ tone: "error", message: presentError2(error, "\u5220\u9664\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002") });
      setAction(null);
      setConfirmDelete(false);
    }
  };
  const setSessionSync = async (enabled) => {
    setAction("sync");
    setSyncFeedback(null);
    try {
      await rpcCall(DELIVERY_ENDPOINTS.sessionSync, {
        botId,
        targetId: target.targetId,
        enabled
      });
      await onChanged();
    } catch (error) {
      setSyncFeedback({
        tone: "error",
        message: error?.code === "session-sync-unavailable" ? "\u4F1A\u8BDD\u540C\u6B65\u4EC5\u652F\u6301\u5DF2\u7ECF\u804A\u8FC7\u3001\u5DF2\u5EFA\u7ACB\u5F53\u524D\u4F1A\u8BDD\u4E14\u4F7F\u7528\u5F53\u524D Host Harness \u7684\u79C1\u804A\u76EE\u6807\u3002" : presentError2(error, "\u4F1A\u8BDD\u540C\u6B65\u8BBE\u7F6E\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002")
      });
    } finally {
      setAction(null);
    }
  };
  return h3(
    "li",
    { className: "dim-targetRow", "data-target-id": target.targetId },
    h3(
      "div",
      { className: "dim-targetSummary" },
      h3(
        "div",
        { className: "dim-targetTitle" },
        React22.createElement("strong", null, target.name || target.targetId),
        h3("span", null, kindLabel(definition, target.kind))
      ),
      h3("code", null, `targetId: ${target.targetId}`)
    ),
    h3(
      "div",
      { className: "dim-targetActions" },
      h3(DeliveryButton, { onClick: () => void copyPair() }, "\u590D\u5236\u8C03\u7528\u53C2\u6570"),
      h3(DeliveryButton, {
        onClick: () => void testTarget(),
        disabled: !connected || action === "test",
        title: connected ? void 0 : "\u673A\u5668\u4EBA\u79BB\u7EBF\u65F6\u4E0D\u53EF\u53D1\u9001\u6D4B\u8BD5\u6D88\u606F",
        "aria-label": "\u6D4B\u8BD5\u6295\u9012\u76EE\u6807"
      }, action === "test" ? "\u6D4B\u8BD5\u4E2D\u2026" : "\u6D4B\u8BD5"),
      h3(DeliveryButton, { onClick: onEdit, disabled: Boolean(action) }, "\u7F16\u8F91"),
      h3(DeliveryButton, {
        kind: "danger",
        onClick: () => setConfirmDelete(true),
        disabled: Boolean(action)
      }, "\u5220\u9664")
    ),
    h3(
      "label",
      { className: "dim-targetSessionSync" },
      h3(
        "span",
        { className: "dim-targetSessionSyncCopy" },
        h3("strong", null, "\u4F1A\u8BDD\u53CC\u5411\u540C\u6B65"),
        h3("small", null, syncDescription)
      ),
      h3("input", {
        type: "checkbox",
        checked: sessionSync.enabled === true,
        disabled: Boolean(action) || sessionSync.enabled !== true && sessionSync.state === "unavailable",
        onChange: (event) => void setSessionSync(event.target.checked),
        "aria-label": "\u4F1A\u8BDD\u53CC\u5411\u540C\u6B65"
      })
    ),
    copyState ? h3("p", { className: "dim-targetFeedback", role: "status" }, copyState) : null,
    syncFeedback ? h3("p", {
      className: "dim-targetFeedback",
      "data-tone": syncFeedback.tone,
      role: "alert"
    }, syncFeedback.message) : null,
    testState ? h3("p", {
      className: "dim-targetFeedback",
      "data-tone": testState.tone,
      role: "status",
      "aria-live": "polite"
    }, testState.message) : null,
    confirmDelete ? h3(
      "div",
      { className: "dim-targetDeleteConfirm", role: "alertdialog" },
      h3(
        "p",
        null,
        "\u5220\u9664 ",
        h3("code", null, target.targetId),
        "\uFF1F\u4F7F\u7528\u8FD9\u4E2A targetId \u7684\u5916\u90E8\u8C03\u7528\u5C06\u8FD4\u56DE unknown-target\u3002",
        sessionSync.enabled ? " \u4F1A\u8BDD\u540C\u6B65\u8BBE\u7F6E\u4E5F\u4F1A\u4E00\u5E76\u5220\u9664\u3002" : null
      ),
      h3(
        "div",
        { className: "dim-targetFormActions" },
        h3(DeliveryButton, {
          onClick: () => setConfirmDelete(false),
          disabled: action === "delete"
        }, "\u53D6\u6D88"),
        h3(DeliveryButton, {
          kind: "danger",
          onClick: () => void deleteTarget(),
          disabled: action === "delete"
        }, action === "delete" ? "\u6B63\u5728\u5220\u9664\u2026" : "\u786E\u8BA4\u5220\u9664")
      )
    ) : null
  );
}
function DeliveryTargetSettingsPage({
  channel,
  account,
  rpcCall,
  accessRpcCall,
  onBack
}) {
  const definition = CHANNEL_DEFINITIONS[channel];
  const [activeTabId, setActiveTabId] = React22.useState(BOT_SETTINGS_TABS[0].id);
  const [phase, setPhase] = React22.useState("loading");
  const [targets, setTargets] = React22.useState([]);
  const [suggestionPhase, setSuggestionPhase] = React22.useState("idle");
  const [suggestions, setSuggestions] = React22.useState([]);
  const [suggestionError, setSuggestionError] = React22.useState(null);
  const [error, setError] = React22.useState(null);
  const [editor, setEditor] = React22.useState(null);
  const [saving, setSaving] = React22.useState(false);
  const [botCopyState, setBotCopyState] = React22.useState(null);
  const [accessPolicy, setAccessPolicy] = React22.useState(account.accessPolicy);
  const [slashPanel, setSlashPanel] = React22.useState(account.slashPanel);
  const mounted = React22.useRef(true);
  React22.useEffect(() => {
    setAccessPolicy(account.accessPolicy);
  }, [account.botId, account.accessPolicy]);
  React22.useEffect(() => {
    setSlashPanel(account.slashPanel);
  }, [account.botId, account.slashPanel]);
  const invoke = React22.useCallback(async (endpoint, payload = {}, signal) => {
    if (typeof rpcCall !== "function") throw new Error("\u6295\u9012\u76EE\u6807\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002");
    return unwrapRpcResult3(await rpcCall(endpoint, payload, signal));
  }, [rpcCall]);
  const loadTargets = React22.useCallback(async ({ signal, silent = false } = {}) => {
    if (!silent) setPhase("loading");
    setError(null);
    try {
      const value = await invoke(DELIVERY_ENDPOINTS.list, { botId: account.botId }, signal);
      if (signal?.aborted || !mounted.current) return;
      setTargets(targetsFrom(value));
      setPhase("ready");
    } catch (caught) {
      if (signal?.aborted || caught?.name === "AbortError" || !mounted.current) return;
      setError(presentError2(caught, "\u65E0\u6CD5\u8BFB\u53D6\u6295\u9012\u76EE\u6807\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"));
      setPhase("error");
    }
  }, [account.botId, invoke]);
  const loadSuggestions = React22.useCallback(async () => {
    setSuggestionPhase("loading");
    setSuggestionError(null);
    try {
      const value = await invoke(DELIVERY_ENDPOINTS.listSuggestions, { botId: account.botId });
      if (!mounted.current) return;
      setSuggestions(validSuggestions(definition, value));
      setSuggestionPhase("ready");
    } catch (caught) {
      if (caught?.name === "AbortError" || !mounted.current) return;
      setSuggestionError(presentError2(caught, "\u65E0\u6CD5\u8BFB\u53D6\u5DF2\u804A\u4F1A\u8BDD\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"));
      setSuggestionPhase("error");
    }
  }, [account.botId, definition, invoke]);
  React22.useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    void loadTargets({ signal: controller.signal });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [loadTargets]);
  if (!definition) {
    return h3(
      "section",
      { className: "dim-deliveryPage" },
      h3(DeliveryButton, { className: "dim-deliveryBack", onClick: onBack }, "\u2190 \u8FD4\u56DE\u673A\u5668\u4EBA\u5217\u8868"),
      h3("p", { role: "alert" }, "\u5F53\u524D\u6E20\u9053\u6682\u4E0D\u652F\u6301\u6295\u9012\u76EE\u6807\u3002")
    );
  }
  const saveTarget = async (target) => {
    setSaving(true);
    try {
      if (editor?.mode === "edit") {
        await invoke(DELIVERY_ENDPOINTS.update, {
          botId: account.botId,
          targetId: editor.target.targetId,
          target: {
            ...target.name ? { name: target.name } : {},
            kind: target.kind,
            route: target.route
          }
        });
      } else {
        await invoke(DELIVERY_ENDPOINTS.create, { botId: account.botId, target });
      }
      await loadTargets({ silent: true });
      if (mounted.current) setEditor(null);
    } finally {
      if (mounted.current) setSaving(false);
    }
  };
  const openSuggestionPicker = () => {
    setEditor({ mode: "suggestions" });
    void loadSuggestions();
  };
  const selectSuggestion = (suggestion) => {
    const identity = routeIdentity(definition, suggestion);
    if (!identity) return;
    const route = Object.fromEntries(fieldsFor(definition, suggestion.kind).map((field) => [
      field.key,
      suggestion.route[field.key]
    ]));
    setEditor({
      mode: "create",
      source: "suggestion",
      draftKey: identity,
      initialValue: {
        targetId: randomTargetId(targets),
        name: suggestionFallbackName(definition, suggestion),
        kind: suggestion.kind,
        route
      }
    });
  };
  const copyBotId = async () => {
    setBotCopyState(null);
    try {
      await copyText(account.botId);
      setBotCopyState("\u5DF2\u590D\u5236 Bot ID");
    } catch (caught) {
      setBotCopyState(presentError2(caught, "\u590D\u5236\u5931\u8D25\u3002"));
    }
  };
  const settingsTabs = botSettingsTabsForChannel(channel);
  const activeTab = settingsTabs.find((tab) => tab.id === activeTabId) ?? settingsTabs[0];
  const activeTabDomId = `dim-bot-settings-${activeTab.id}-tab`;
  const activePanelId = `dim-bot-settings-${activeTab.id}-panel`;
  return h3(
    "section",
    {
      className: "dim-deliveryPage",
      "aria-label": `${account.botName || definition.label}\u673A\u5668\u4EBA\u8BBE\u7F6E`
    },
    h3(
      "header",
      { className: "dim-deliveryHeader" },
      h3(DeliveryButton, { className: "dim-deliveryBack", onClick: onBack }, "\u2190 \u8FD4\u56DE\u673A\u5668\u4EBA\u5217\u8868")
    ),
    h3(BotSettingsTabs, { tabs: settingsTabs, activeTabId: activeTab.id, onChange: setActiveTabId }),
    h3(
      "div",
      {
        id: activePanelId,
        className: "dim-botSettingsTabPanel",
        role: "tabpanel",
        "aria-labelledby": activeTabDomId
      },
      activeTab.id === "general" ? h3(BotGeneralSettingsPage, { key: `${channel}:${account.botId}`, channel, account, rpcCall: accessRpcCall }) : activeTab.id === "ds-bot" ? h3(DsBotSettingsPage, {
        key: account.botId,
        botId: account.botId,
        rpcCall: invoke
      }) : activeTab.id === "access" ? h3(AccessPolicySettingsPage, {
        channel,
        account: { ...account, accessPolicy },
        rpcCall: accessRpcCall,
        onSaved: setAccessPolicy
      }) : h3(
        React22.Fragment,
        null,
        h3(
          "section",
          { className: "dim-deliveryIdentity", "aria-labelledby": "dim-delivery-bot-title" },
          h3(
            "div",
            { className: "dim-deliveryIdentityHeading" },
            h3(
              "h2",
              { id: "dim-delivery-bot-title", className: "dim-deliveryBotName" },
              account.botName || "\u673A\u5668\u4EBA\u8BBE\u7F6E"
            ),
            h3(
              "a",
              {
                className: "dim-deliveryDocsLink",
                href: isEnglish() ? DELIVERY_DOCS_URL.en : DELIVERY_DOCS_URL.zh,
                target: "_blank",
                rel: "noopener noreferrer",
                "aria-label": "\u6253\u5F00\u4E3B\u52A8\u6295\u9012\u4F7F\u7528\u6587\u6863"
              },
              h3("span", null, "\u4F7F\u7528\u6587\u6863"),
              h3("span", { "aria-hidden": "true" }, "\u2197")
            )
          ),
          h3(
            "div",
            { className: "dim-deliveryBotId" },
            h3("span", null, "Bot ID"),
            h3("code", { title: account.botId }, account.botId),
            h3(DeliveryButton, { onClick: () => void copyBotId() }, "\u590D\u5236")
          ),
          botCopyState ? h3("p", { className: "dim-targetFeedback", role: "status" }, botCopyState) : null
        ),
        h3(
          "section",
          { className: "dim-deliveryTargets", "aria-labelledby": "dim-delivery-targets-title" },
          h3(
            "div",
            { className: "dim-deliverySectionHeading" },
            h3(
              "div",
              null,
              h3("h3", { id: "dim-delivery-targets-title" }, "\u6295\u9012\u76EE\u6807"),
              account.connected ? null : h3("p", null, "\u673A\u5668\u4EBA\u5F53\u524D\u79BB\u7EBF\uFF1B\u4ECD\u53EF\u914D\u7F6E\u76EE\u6807\uFF0C\u6062\u590D\u8FDE\u63A5\u540E\u518D\u6D4B\u8BD5\u3002")
            ),
            h3(DeliveryButton, {
              kind: "primary",
              onClick: openSuggestionPicker,
              disabled: Boolean(editor) || phase !== "ready",
              title: phase === "ready" ? void 0 : "\u8BF7\u5148\u5B8C\u6210\u6295\u9012\u76EE\u6807\u8BFB\u53D6"
            }, "\u65B0\u5EFA\u76EE\u6807")
          ),
          editor?.mode === "suggestions" ? h3(TargetSuggestionPicker, {
            definition,
            phase: suggestionPhase,
            suggestions,
            error: suggestionError,
            targets,
            onRefresh: loadSuggestions,
            onSelect: selectSuggestion,
            onManual: () => setEditor({
              mode: "create",
              source: "manual",
              draftKey: "manual",
              initialValue: { targetId: randomTargetId(targets) }
            }),
            onCancel: () => setEditor(null)
          }) : editor ? h3(TargetForm, {
            key: editor.mode === "edit" ? editor.target.targetId : editor.draftKey,
            definition,
            mode: editor.mode,
            initialValue: editor.mode === "edit" ? editor.target : editor.initialValue,
            source: editor.source,
            busy: saving,
            connected: account.connected,
            onCancel: () => setEditor(editor.source === "suggestion" ? { mode: "suggestions" } : null),
            onSave: saveTarget,
            onTest: (target) => invoke(DELIVERY_ENDPOINTS.test, {
              botId: account.botId,
              target
            })
          }) : null,
          phase === "loading" ? h3("div", { className: "dim-deliveryState", "aria-busy": "true" }, "\u6B63\u5728\u8BFB\u53D6\u6295\u9012\u76EE\u6807\u2026") : phase === "error" ? h3(
            "div",
            { className: "dim-deliveryState", role: "alert" },
            h3("p", null, error),
            h3(DeliveryButton, { onClick: () => void loadTargets() }, "\u91CD\u65B0\u8BFB\u53D6")
          ) : targets.length === 0 ? h3(
            "div",
            { className: "dim-deliveryState dim-deliveryEmpty" },
            h3("strong", null, "\u5C1A\u672A\u914D\u7F6E\u6295\u9012\u76EE\u6807"),
            h3("p", null, "\u70B9\u51FB\u201C\u65B0\u5EFA\u76EE\u6807\u201D\u53EF\u4ECE\u5DF2\u804A\u8FC7\u7684\u4F1A\u8BDD\u9009\u62E9\uFF0C\u4E5F\u53EF\u624B\u52A8\u586B\u5199\u3002")
          ) : h3("ul", { className: "dim-targetList" }, targets.map((target) => h3(TargetRow, {
            key: target.targetId,
            definition,
            target,
            botId: account.botId,
            connected: account.connected,
            rpcCall: invoke,
            onChanged: () => loadTargets({ silent: true }),
            onEdit: () => setEditor({ mode: "edit", target, source: "edit" })
          })))
        )
      )
    )
  );
}

// plugin-src/client/group-history-settings.js
var React23 = __toESM(require("react"), 1);
var GROUP_HISTORY_SETTINGS_ENDPOINTS = Object.freeze({
  get: "settings.group-history.get",
  set: "settings.group-history.set"
});
function result(value) {
  if (value?.ok === false) throw new Error(value.error?.message || "\u65E0\u6CD5\u8BFB\u53D6\u6216\u4FDD\u5B58\u7FA4\u8BB0\u5F55\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
  return value?.ok === true ? value.value : value;
}
function GroupHistorySettings({ rpcCall }) {
  const [days, setDays] = React23.useState("14");
  const [phase, setPhase] = React23.useState("loading");
  const [error, setError] = React23.useState(null);
  const [notice, setNotice] = React23.useState(null);
  const mounted = React23.useRef(false);
  const busy = React23.useRef(false);
  const id2 = React23.useId();
  const load = React23.useCallback(async (signal) => {
    setPhase("loading");
    setError(null);
    try {
      const settings = result(await rpcCall(GROUP_HISTORY_SETTINGS_ENDPOINTS.get, {}, signal));
      if (signal?.aborted || !mounted.current) return;
      if (!Number.isSafeInteger(settings?.groupHistoryRetentionDays)) throw new Error("\u7FA4\u8BB0\u5F55\u8BBE\u7F6E\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94\u3002");
      setDays(String(settings.groupHistoryRetentionDays));
      setError(settings.error ?? null);
      setPhase("ready");
    } catch (caught) {
      if (signal?.aborted || !mounted.current) return;
      setError(caught.message);
      setPhase("error");
    }
  }, [rpcCall]);
  React23.useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    void load(controller.signal);
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [load]);
  const save = async (event) => {
    event.preventDefault();
    if (busy.current || phase !== "ready") return;
    const value = Number(days);
    if (!/^\d+$/.test(days.trim()) || !Number.isSafeInteger(value) || value < 1 || !Number.isSafeInteger(value * 864e5)) {
      setError("\u4FDD\u7559\u5929\u6570\u5FC5\u987B\u4E3A\u6B63\u6574\u6570\u3002");
      return;
    }
    busy.current = true;
    setPhase("saving");
    setError(null);
    setNotice(null);
    try {
      const settings = result(await rpcCall(GROUP_HISTORY_SETTINGS_ENDPOINTS.set, { groupHistoryRetentionDays: value }));
      if (mounted.current) {
        setDays(String(settings.groupHistoryRetentionDays));
        setNotice("\u5DF2\u4FDD\u5B58");
      }
    } catch (caught) {
      if (mounted.current) setError(caught.message);
    } finally {
      busy.current = false;
      if (mounted.current) setPhase("ready");
    }
  };
  return h3(
    "section",
    { className: "dim-botGeneralSettings dim-groupHistorySettings", "aria-label": "\u7FA4\u804A\u5929\u8BB0\u5F55", "aria-busy": phase === "loading" || phase === "saving" },
    h3(
      "form",
      { onSubmit: save },
      h3(
        "div",
        { className: "dim-botGeneralRow" },
        h3(
          "div",
          { className: "dim-botGeneralText" },
          h3("label", { className: "dim-botGeneralTitle", htmlFor: `${id2}-days` }, "\u7FA4\u804A\u5929\u8BB0\u5F55\u4FDD\u7559\u5929\u6570"),
          h3("p", { className: "dim-botGeneralHelp", id: `${id2}-description` }, "\u8FC7\u671F\u7684\u7FA4\u6D88\u606F\u548C\u6587\u4EF6\u4F1A\u81EA\u52A8\u6E05\u7406\u3002")
        ),
        h3(
          "div",
          { className: "dim-botGeneralControl dim-groupHistoryControl" },
          h3("input", {
            id: `${id2}-days`,
            className: "dim-groupHistoryInput",
            type: "number",
            min: 1,
            step: 1,
            value: days,
            disabled: phase !== "ready",
            "aria-describedby": `${id2}-description`,
            onChange: (event) => {
              setDays(event.target.value);
              setNotice(null);
            }
          }),
          h3("span", { className: "dim-groupHistoryUnit" }, "\u5929")
        )
      ),
      h3(
        "div",
        { className: "dim-botGeneralActions" },
        h3("button", {
          type: "submit",
          className: "dim-deliveryButton dim-groupHistorySave",
          "data-kind": "primary",
          disabled: phase !== "ready"
        }, phase === "saving" ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58")
      )
    ),
    phase === "loading" ? h3("p", { role: "status", className: "dim-botGeneralHelp dim-groupHistoryFeedback" }, "\u6B63\u5728\u8BFB\u53D6\u7FA4\u8BB0\u5F55\u8BBE\u7F6E\u2026") : null,
    error ? h3("p", { role: "alert", className: "dim-accessFeedback dim-groupHistoryFeedback", "data-tone": "error" }, error) : null,
    notice ? h3("p", { role: "status", className: "dim-botGeneralHelp dim-groupHistoryFeedback" }, notice) : null
  );
}

// plugin-src/client/sidebar-settings.js
var React24 = __toESM(require("react"), 1);
var SIDEBAR_SETTINGS_RPC_CHANNEL = "/dsh-im-sidebar";
var SIDEBAR_SETTINGS_ENDPOINTS = Object.freeze({
  get: "settings.sidebar-entry.get",
  set: "settings.sidebar-entry.set"
});
function settingsResult(result2) {
  if (result2?.ok === false) throw new Error(result2.error?.message || "\u65E0\u6CD5\u8BFB\u53D6\u6216\u4FDD\u5B58\u4FA7\u8FB9\u680F\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
  const value = result2?.ok === true ? result2.value : result2;
  if (!["auto", "show", "hide"].includes(value?.mode) || typeof value.visible !== "boolean") {
    throw new Error("\u4FA7\u8FB9\u680F\u8BBE\u7F6E\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94\u3002");
  }
  return value;
}
function installSidebarVisibilitySync({
  rpcCall,
  setVisible,
  setTimeoutFn = globalThis.setTimeout,
  clearTimeoutFn = globalThis.clearTimeout,
  pollMs = 3e4
}) {
  const abort = new AbortController();
  let timer;
  let running = false;
  let pending = false;
  let revision = 0;
  const schedule = (delay) => {
    clearTimeoutFn(timer);
    if (!abort.signal.aborted) timer = setTimeoutFn(refresh, delay);
  };
  const refresh = async () => {
    if (abort.signal.aborted) return;
    if (running) {
      pending = true;
      return;
    }
    running = true;
    pending = false;
    const current = revision;
    try {
      const value = settingsResult(await rpcCall(SIDEBAR_SETTINGS_ENDPOINTS.get, {}, abort.signal));
      if (!abort.signal.aborted && current === revision && !pending) setVisible(value.visible);
    } catch {
    } finally {
      running = false;
      schedule(pending ? 0 : pollMs);
    }
  };
  void refresh();
  return {
    refresh() {
      revision++;
      if (running) pending = true;
      else schedule(0);
    },
    apply(value) {
      revision++;
      if (!abort.signal.aborted) setVisible(settingsResult(value).visible);
    },
    dispose() {
      abort.abort();
      clearTimeoutFn(timer);
    }
  };
}
function SidebarSettings({ rpcCall }) {
  const [mode, setMode] = React24.useState("auto");
  const [phase, setPhase] = React24.useState("loading");
  const [error, setError] = React24.useState(null);
  const [saved, setSaved] = React24.useState(false);
  const mounted = React24.useRef(false);
  const busy = React24.useRef(false);
  const failedMode = React24.useRef(null);
  const id2 = React24.useId();
  const disabled = phase === "loading" || phase === "saving";
  const load = React24.useCallback(async (signal) => {
    setPhase("loading");
    setError(null);
    setSaved(false);
    failedMode.current = null;
    try {
      const value = settingsResult(await rpcCall(SIDEBAR_SETTINGS_ENDPOINTS.get, {}, signal));
      if (signal?.aborted || !mounted.current) return;
      setMode(value.mode);
      setPhase("ready");
    } catch (caught) {
      if (signal?.aborted || !mounted.current) return;
      setError(caught.message);
      setPhase("error");
    }
  }, [rpcCall]);
  React24.useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    void load(abort.signal);
    return () => {
      mounted.current = false;
      abort.abort();
    };
  }, [load]);
  const save = async (nextMode) => {
    if (busy.current || disabled) return;
    const previousMode = mode;
    busy.current = true;
    setPhase("saving");
    setError(null);
    setSaved(false);
    setMode(nextMode);
    failedMode.current = null;
    try {
      const value = settingsResult(await rpcCall(SIDEBAR_SETTINGS_ENDPOINTS.set, { mode: nextMode }));
      if (mounted.current) {
        setMode(value.mode);
        setSaved(true);
        setPhase("ready");
      }
    } catch (caught) {
      if (mounted.current) {
        failedMode.current = nextMode;
        setMode(previousMode);
        setError(caught.message);
        setPhase("error");
      }
    } finally {
      busy.current = false;
    }
  };
  return h3(
    "section",
    { className: "dim-botGeneralSettings dim-sidebarSettings", "aria-label": "\u4FA7\u8FB9\u680F\u5165\u53E3", "aria-busy": disabled },
    h3(
      "div",
      { className: "dim-botGeneralRow" },
      h3(
        "div",
        { className: "dim-botGeneralText" },
        h3(
          "div",
          { className: "dim-sidebarHeading" },
          h3("label", { className: "dim-botGeneralTitle", htmlFor: id2 }, "\u4FA7\u8FB9\u680F\u5165\u53E3"),
          h3(
            "span",
            { role: "status", className: "dim-botGeneralHelp" },
            phase === "loading" ? "\u6B63\u5728\u8BFB\u53D6\u4FA7\u8FB9\u680F\u8BBE\u7F6E\u2026" : phase === "saving" ? "\u4FDD\u5B58\u4E2D\u2026" : saved ? "\u5DF2\u4FDD\u5B58" : ""
          )
        ),
        h3("p", { className: "dim-botGeneralHelp", id: `${id2}-help` }, "\u81EA\u52A8\u6A21\u5F0F\uFF1A\u672A\u914D\u7F6E\u6E20\u9053\u65F6\u663E\u793A\uFF0C\u914D\u7F6E\u81F3\u5C11\u4E00\u4E2A\u6E20\u9053\u540E\u9690\u85CF\u3002\u9690\u85CF\u540E\u4ECD\u53EF\u4ECE\u63D2\u4EF6\u8BE6\u60C5\u6216\u8BBE\u7F6E\u8FDB\u5165\uFF0C\u4E0D\u5F71\u54CD\u673A\u5668\u4EBA\u540E\u53F0\u8FD0\u884C\u3002")
      ),
      h3(
        "div",
        { className: "dim-botGeneralControl" },
        h3(
          "select",
          {
            id: id2,
            className: "dim-sidebarSelect",
            value: mode,
            disabled,
            "aria-describedby": `${id2}-help`,
            onChange: (event) => save(event.target.value)
          },
          h3("option", { value: "auto" }, "\u81EA\u52A8\u9690\u85CF"),
          h3("option", { value: "show" }, "\u59CB\u7EC8\u663E\u793A"),
          h3("option", { value: "hide" }, "\u59CB\u7EC8\u9690\u85CF")
        ),
        h3(
          "svg",
          { width: 16, height: 16, viewBox: "0 0 16 16", "aria-hidden": true },
          h3("path", { d: "m4 6 4 4 4-4", fill: "none", stroke: "currentColor", strokeWidth: 1.5 })
        )
      )
    ),
    error ? h3(
      "div",
      { className: "dim-sidebarFeedback" },
      h3("p", { role: "alert", className: "dim-accessFeedback", "data-tone": "error" }, error),
      h3("button", {
        type: "button",
        className: "dim-deliveryButton",
        onClick: () => failedMode.current === null ? load() : save(failedMode.current)
      }, "\u91CD\u8BD5")
    ) : null
  );
}

// plugin-src/client/global-settings.js
var React25 = __toESM(require("react"), 1);

// src/channels/shared/inbound-ttl.mjs
var DEFAULT_INBOUND_TTL_HOURS = 168;
var INBOUND_TTL_MAX_HOURS = 8760;
var INTEGER_STRING = /^[+-]?\d+$/;
function normalizeInboundTtlHours(value) {
  let candidate = value;
  if (typeof candidate === "string") {
    const trimmed = candidate.trim();
    if (!INTEGER_STRING.test(trimmed)) return null;
    candidate = Number(trimmed);
  }
  if (typeof candidate !== "number" || !Number.isInteger(candidate)) return null;
  if (candidate === -1) return -1;
  if (candidate >= 0 && candidate <= INBOUND_TTL_MAX_HOURS) return candidate;
  return null;
}

// src/channels/shared/image-input-policy.mjs
var IMAGE_MEGABYTE = 1024 * 1024;
var DEFAULT_IMAGE_INPUT_SETTINGS = Object.freeze({
  maxDownloadMb: 30,
  maxImageMb: 5,
  maxTotalMb: 20,
  maxImages: 20
});
function normalizeImageInputSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result2 = {};
  for (const key of Object.keys(DEFAULT_IMAGE_INPUT_SETTINGS)) {
    const input = value[key];
    const number = typeof input === "string" && /^\d+$/.test(input.trim()) ? Number(input.trim()) : input;
    if (!Number.isSafeInteger(number) || number < 1 || !Number.isSafeInteger(number * IMAGE_MEGABYTE)) return null;
    result2[key] = number;
  }
  if (result2.maxDownloadMb < result2.maxImageMb || result2.maxTotalMb < result2.maxImageMb) return null;
  return Object.freeze(result2);
}

// plugin-src/client/global-settings.js
var GLOBAL_SETTINGS_RPC_CHANNEL = "/dsh-im-settings";
var GLOBAL_SETTINGS_TAB_ID = "global-settings";
var ATTACHMENTS_TAB_ID = "dim-general-settings-tab-attachments";
var ATTACHMENTS_PANEL_ID = "dim-general-settings-panel-attachments";
var GLOBAL_SETTINGS_ENDPOINTS = Object.freeze({
  getTtl: "settings.inbound-ttl.get",
  setTtl: "settings.inbound-ttl.set",
  sweep: "settings.inbound-ttl.sweep",
  getImages: "settings.image-input.get",
  setImages: "settings.image-input.set"
});
function presentError3(error, fallback) {
  return error?.message || fallback;
}
function unwrapRpcResult4(result2) {
  if (result2?.ok === true) return result2.value;
  if (result2?.ok === false) {
    const error = new Error(result2.error?.message || "\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
    error.code = result2.error?.code;
    throw error;
  }
  return result2;
}
function GlobalSettingsLogoGlyph({ size } = {}) {
  return h3("svg", {
    ...size === void 0 ? {} : { width: size, height: size },
    viewBox: "0 0 24 24",
    focusable: "false",
    "aria-hidden": "true",
    "data-im-icon": "global-settings"
  }, h3("path", {
    fill: "currentColor",
    d: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58ZM12 15.6A3.61 3.61 0 0 1 8.4 12c0-1.98 1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6Z"
  }));
}
function GlobalButton({ children, kind = "secondary", className = "", ...props }) {
  return h3("button", {
    ...props,
    type: props.type ?? "button",
    className: `dim-deliveryButton ${className}`.trim(),
    "data-kind": kind
  }, children);
}
function ImageInputSettings({ rpcCall }) {
  const [values, setValues] = React25.useState(DEFAULT_IMAGE_INPUT_SETTINGS);
  const [phase, setPhase] = React25.useState("loading");
  const [error, setError] = React25.useState(null);
  const [saved, setSaved] = React25.useState(false);
  const mounted = React25.useRef(false);
  const saving = React25.useRef(false);
  const id2 = React25.useId();
  const load = React25.useCallback(async (signal) => {
    setPhase("loading");
    setError(null);
    try {
      const result2 = unwrapRpcResult4(await rpcCall(GLOBAL_SETTINGS_ENDPOINTS.getImages, {}, signal));
      if (signal?.aborted || !mounted.current) return;
      const settings = normalizeImageInputSettings(result2);
      if (!settings) throw new Error("\u901A\u7528\u8BBE\u7F6E\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94\u3002");
      setValues(settings);
      setPhase("ready");
    } catch (caught) {
      if (signal?.aborted || !mounted.current) return;
      setError(presentError3(caught, "\u65E0\u6CD5\u8BFB\u53D6\u6216\u4FDD\u5B58\u56FE\u7247\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"));
      setPhase("error");
    }
  }, [rpcCall]);
  React25.useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    void load(controller.signal);
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [load]);
  const save = async (event) => {
    event.preventDefault();
    if (saving.current || phase !== "ready") return;
    const settings = normalizeImageInputSettings(values);
    setSaved(false);
    if (!settings) {
      setError("\u56FE\u7247\u9650\u5236\u65E0\u6548\uFF1A\u8BF7\u8F93\u5165\u6B63\u6574\u6570\uFF0C\u539F\u56FE\u63A5\u6536\u4E0A\u9650\u548C\u603B\u91CF\u4E0A\u9650\u4E0D\u80FD\u5C0F\u4E8E\u5355\u56FE\u4E0A\u9650\u3002");
      return;
    }
    saving.current = true;
    setPhase("saving");
    setError(null);
    try {
      const result2 = unwrapRpcResult4(await rpcCall(GLOBAL_SETTINGS_ENDPOINTS.setImages, settings));
      if (!normalizeImageInputSettings(result2)) throw new Error("\u901A\u7528\u8BBE\u7F6E\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94\u3002");
      if (mounted.current) {
        setValues(result2);
        setSaved(true);
      }
    } catch (caught) {
      if (mounted.current) setError(presentError3(caught, "\u65E0\u6CD5\u8BFB\u53D6\u6216\u4FDD\u5B58\u56FE\u7247\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"));
    } finally {
      saving.current = false;
      if (mounted.current) setPhase("ready");
    }
  };
  const fields = [
    ["maxDownloadMb", "\u539F\u56FE\u63A5\u6536\u4E0A\u9650 (MB)"],
    ["maxImageMb", "\u6A21\u578B\u5355\u56FE\u4E0A\u9650 (MB)"],
    ["maxTotalMb", "\u6A21\u578B\u56FE\u7247\u603B\u91CF\u4E0A\u9650 (MB)"],
    ["maxImages", "\u6BCF\u6761\u6D88\u606F\u6700\u591A\u56FE\u7247\u6570"]
  ];
  return h3(
    "section",
    { className: "dim-globalSection dim-imageSettings", "aria-label": "\u56FE\u7247\u8F93\u5165", "aria-busy": phase === "loading" || phase === "saving" },
    h3(
      "div",
      { className: "dim-globalHead" },
      h3(
        "div",
        { className: "dim-globalHeadTitle" },
        h3("h3", null, "\u56FE\u7247\u8F93\u5165"),
        h3(
          "div",
          { className: "dim-globalTtlHelp" },
          h3("button", {
            type: "button",
            className: "dim-channelHelpButton dim-globalTtlHelpButton",
            "aria-label": "\u67E5\u770B\u56FE\u7247\u8F93\u5165\u8BF4\u660E",
            "aria-describedby": `${id2}-help`
          }, h3("span", { "aria-hidden": "true" }, "?")),
          h3(
            "div",
            { id: `${id2}-help`, className: "dim-globalTtlTooltip dim-imageSettingsTooltip", role: "tooltip" },
            "\u9002\u7528\u4E8E\u652F\u6301\u56FE\u7247\u7684\u804A\u5929\u6E20\u9053\u3002\u539F\u56FE\u6309\u9644\u4EF6\u4FDD\u7559\u65F6\u957F\u4FDD\u5B58\uFF0C\u53D1\u9001\u7ED9\u6A21\u578B\u7684\u526F\u672C\u4F1A\u81EA\u52A8\u7F29\u653E\u6216\u538B\u7F29\uFF1B\u65E0\u6CD5\u76F4\u63A5\u53D1\u9001\u65F6\u4EA4\u7ED9\u6A21\u578B\u6309\u6587\u4EF6\u5904\u7406\u3002"
          )
        )
      )
    ),
    h3(
      "form",
      { onSubmit: save },
      h3(
        "div",
        { className: "dim-imageSettingsFields" },
        ...fields.map(([key, label]) => h3(
          "div",
          { className: "dim-imageSettingsField", key },
          h3("label", { htmlFor: `${id2}-${key}` }, label),
          h3("input", {
            id: `${id2}-${key}`,
            className: "dim-globalTtlInput",
            type: "number",
            min: 1,
            step: 1,
            value: values[key],
            disabled: phase !== "ready",
            onChange: (event) => {
              setValues((current) => ({ ...current, [key]: event.target.value }));
              setSaved(false);
              setError(null);
            }
          })
        ))
      ),
      h3(
        "div",
        { className: "dim-imageSettingsActions" },
        h3(GlobalButton, { type: "submit", kind: "primary", className: "dim-globalSaveButton", disabled: phase !== "ready" }, phase === "saving" ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u56FE\u7247\u8BBE\u7F6E"),
        phase === "error" ? h3(GlobalButton, { className: "dim-globalSaveButton", onClick: () => void load() }, "\u91CD\u8BD5") : null
      )
    ),
    error ? h3("p", { className: "dim-globalInline dim-imageSettingsFeedback", "data-tone": "error", role: "alert" }, error) : null,
    saved ? h3("p", { className: "dim-globalInline dim-imageSettingsFeedback", role: "status" }, "\u5DF2\u4FDD\u5B58") : null,
    phase === "loading" ? h3("p", { className: "dim-globalInline dim-imageSettingsFeedback", role: "status" }, "\u6B63\u5728\u8BFB\u53D6\u56FE\u7247\u8BBE\u7F6E\u2026") : null
  );
}
function AttachmentSettingsPanel({ rpcCall }) {
  const [phase, setPhase] = React25.useState("loading");
  const [loadError, setLoadError] = React25.useState(null);
  const [ttlInput, setTtlInput] = React25.useState("");
  const [savedTtl, setSavedTtl] = React25.useState(null);
  const [ttlError, setTtlError] = React25.useState(false);
  const [saveError, setSaveError] = React25.useState(null);
  const [saveSucceeded, setSaveSucceeded] = React25.useState(false);
  const [isSaving, setIsSaving] = React25.useState(false);
  const [sweepConfirming, setSweepConfirming] = React25.useState(false);
  const [sweeping, setSweeping] = React25.useState(false);
  const ttlErrorId = React25.useId();
  const ttlHintsId = React25.useId();
  const sweepTriggerId = React25.useId();
  const sweepConfirmId = React25.useId();
  const sweepConfirmTextId = React25.useId();
  const sweepConfirmButtonId = React25.useId();
  const mounted = React25.useRef(true);
  const saving = React25.useRef(false);
  const invoke = React25.useCallback(async (endpoint, payload = {}, signal) => {
    if (typeof rpcCall !== "function") throw new Error("\u901A\u7528\u8BBE\u7F6E\u6682\u4E0D\u53EF\u7528\u3002");
    return unwrapRpcResult4(await rpcCall(endpoint, payload, signal));
  }, [rpcCall]);
  const loadSettings = React25.useCallback(async ({ signal } = {}) => {
    setPhase("loading");
    setLoadError(null);
    try {
      const value = await invoke(GLOBAL_SETTINGS_ENDPOINTS.getTtl, {}, signal);
      if (signal?.aborted || !mounted.current) return;
      const ttlHours = normalizeInboundTtlHours(value?.ttlHours);
      if (ttlHours === null) {
        setLoadError("\u901A\u7528\u8BBE\u7F6E\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BC6\u522B\u7684\u54CD\u5E94\u3002");
        setPhase("error");
        return;
      }
      setSavedTtl(ttlHours);
      setTtlInput(String(ttlHours));
      setTtlError(false);
      setSaveError(null);
      setSaveSucceeded(false);
      setPhase("ready");
    } catch (caught) {
      if (signal?.aborted || caught?.name === "AbortError" || !mounted.current) return;
      setLoadError(presentError3(caught, "\u65E0\u6CD5\u8BFB\u53D6\u901A\u7528\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"));
      setPhase("error");
    }
  }, [invoke]);
  React25.useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    void loadSettings({ signal: controller.signal });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [loadSettings]);
  React25.useEffect(() => {
    if (!sweepConfirming) return;
    globalThis.document?.getElementById(sweepConfirmButtonId)?.focus();
  }, [sweepConfirmButtonId, sweepConfirming]);
  const commitTtl = async () => {
    if (phase === "loading" || saving.current) return;
    const proposed = normalizeInboundTtlHours(ttlInput.trim());
    if (proposed === null) {
      setSaveError(null);
      setSaveSucceeded(false);
      setTtlError(true);
      return;
    }
    setTtlError(false);
    if (proposed === savedTtl) return;
    saving.current = true;
    setIsSaving(true);
    setSaveError(null);
    setSaveSucceeded(false);
    try {
      const value = await invoke(GLOBAL_SETTINGS_ENDPOINTS.setTtl, { ttlHours: proposed });
      if (!mounted.current) return;
      const confirmed = normalizeInboundTtlHours(value?.ttlHours);
      const finalTtl = confirmed === null ? proposed : confirmed;
      setSavedTtl(finalTtl);
      setTtlInput((current) => current.trim() === String(proposed) ? String(finalTtl) : current);
      setLoadError(null);
      setSaveSucceeded(true);
      setPhase("ready");
    } catch (caught) {
      if (mounted.current) {
        setSaveError(presentError3(caught, "\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"));
      }
    } finally {
      saving.current = false;
      if (mounted.current) setIsSaving(false);
    }
  };
  const requestSweep = () => {
    if (sweeping) return;
    setSweepConfirming(true);
  };
  const cancelSweep = ({ restoreFocus = false } = {}) => {
    setSweepConfirming(false);
    if (restoreFocus) globalThis.document?.getElementById(sweepTriggerId)?.focus();
  };
  const runSweep = async () => {
    setSweepConfirming(false);
    setSweeping(true);
    try {
      await invoke(GLOBAL_SETTINGS_ENDPOINTS.sweep, {});
    } catch {
    } finally {
      if (mounted.current) setSweeping(false);
    }
  };
  const inlineStatus = phase === "loading" ? { role: "status", message: "\u6B63\u5728\u8BFB\u53D6\u901A\u7528\u8BBE\u7F6E\u2026" } : ttlError ? { role: "alert", message: `\u8BF7\u8F93\u5165 -1\u30010 \u6216 1~${INBOUND_TTL_MAX_HOURS} \u4E4B\u95F4\u7684\u6574\u6570\u3002` } : saveError ? { role: "alert", message: saveError } : phase === "error" && loadError ? { role: "alert", message: loadError } : saveSucceeded ? { role: "status", message: "\u5DF2\u4FDD\u5B58" } : null;
  const proposedTtl = normalizeInboundTtlHours(ttlInput.trim());
  const canSave = phase !== "loading" && !isSaving && proposedTtl !== null && proposedTtl !== savedTtl;
  return h3(
    "div",
    {
      id: ATTACHMENTS_PANEL_ID,
      className: "dim-generalSettingsTabPanel",
      role: "tabpanel",
      "aria-labelledby": ATTACHMENTS_TAB_ID
    },
    h3(
      "section",
      {
        className: "dim-globalSection",
        "aria-label": "\u9644\u4EF6",
        "aria-busy": phase === "loading"
      },
      h3(
        "div",
        { className: "dim-globalHead" },
        h3(
          "div",
          { className: "dim-globalHeadTitle" },
          h3("h3", { id: "dim-globalTtlTitle" }, "\u9644\u4EF6\u4FDD\u7559\u65F6\u957F (\u5C0F\u65F6)"),
          h3(
            "div",
            { className: "dim-globalTtlHelp" },
            h3("button", {
              type: "button",
              className: "dim-channelHelpButton dim-globalTtlHelpButton",
              "aria-label": "\u67E5\u770B\u9644\u4EF6\u4FDD\u7559\u65F6\u957F\u8BF4\u660E",
              "aria-describedby": ttlHintsId
            }, h3("span", { "aria-hidden": "true" }, "?")),
            h3(
              "div",
              {
                id: ttlHintsId,
                className: "dim-globalTtlTooltip",
                role: "tooltip"
              },
              h3(
                "ul",
                { className: "dim-globalTtlHints" },
                h3(
                  "li",
                  null,
                  h3("code", null, "-1"),
                  h3("span", null, "\u6C38\u4E45\u4FDD\u7559\uFF0C\u4E0D\u4F1A\u81EA\u52A8\u6E05\u7406")
                ),
                h3(
                  "li",
                  null,
                  h3("code", null, "0"),
                  h3("span", null, "\u6BCF Turn \u7ED3\u675F\u540E\u7ACB\u5373\u6E05\u7406")
                ),
                h3(
                  "li",
                  null,
                  h3("code", null, `1~${INBOUND_TTL_MAX_HOURS}`),
                  h3("span", null, "\u5C0F\u65F6\u540E\u81EA\u52A8\u6E05\u7406")
                )
              )
            )
          )
        )
      ),
      h3(
        "form",
        {
          className: "dim-globalTtlRow",
          onSubmit: (event) => {
            event.preventDefault();
            void commitTtl();
          }
        },
        h3("input", {
          id: "dim-globalTtlInput",
          className: "dim-globalTtlInput",
          type: "text",
          value: ttlInput,
          placeholder: String(DEFAULT_INBOUND_TTL_HOURS),
          autoComplete: "off",
          disabled: phase === "loading" || isSaving,
          "aria-labelledby": "dim-globalTtlTitle",
          "aria-invalid": ttlError ? "true" : void 0,
          "aria-describedby": ttlError ? ttlErrorId : ttlHintsId,
          onBlur: () => {
            setTtlError(normalizeInboundTtlHours(ttlInput.trim()) === null);
          },
          onKeyDown: (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            void commitTtl();
          },
          onChange: (event) => {
            setTtlInput(event.target.value);
            setTtlError(false);
            setSaveError(null);
            setSaveSucceeded(false);
          }
        }),
        h3(GlobalButton, {
          type: "submit",
          kind: "primary",
          className: "dim-globalSaveButton",
          disabled: !canSave
        }, isSaving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58"),
        h3(
          "div",
          {
            className: "dim-globalSweepAction",
            onBlur: (event) => {
              if (sweepConfirming && !event.currentTarget.contains(event.relatedTarget)) cancelSweep();
            }
          },
          h3(GlobalButton, {
            id: sweepTriggerId,
            className: "dim-globalSweepButton",
            onClick: () => sweepConfirming ? cancelSweep() : requestSweep(),
            disabled: sweeping,
            "aria-haspopup": "dialog",
            "aria-expanded": sweepConfirming,
            "aria-controls": sweepConfirmId
          }, sweeping ? "\u6B63\u5728\u6E05\u7406\u2026" : "\u6E05\u7406\u8FC7\u671F\u9644\u4EF6"),
          sweepConfirming ? h3(
            "div",
            {
              id: sweepConfirmId,
              className: "dim-globalSweepConfirm",
              role: "alertdialog",
              "aria-label": "\u786E\u8BA4\u6E05\u7406\u8FC7\u671F\u9644\u4EF6",
              "aria-describedby": sweepConfirmTextId,
              onKeyDown: (event) => {
                if (event.key !== "Escape") return;
                event.preventDefault();
                cancelSweep({ restoreFocus: true });
              }
            },
            h3("p", { id: sweepConfirmTextId }, "\u786E\u8BA4\u6E05\u7406\u5F53\u524D\u5DF2\u8FC7\u671F\u7684\u9644\u4EF6\uFF1F"),
            h3(
              "div",
              { className: "dim-globalSweepConfirmActions" },
              h3(GlobalButton, { onClick: () => cancelSweep({ restoreFocus: true }) }, "\u53D6\u6D88"),
              h3(GlobalButton, {
                id: sweepConfirmButtonId,
                kind: "danger",
                className: "dim-globalSweepConfirmButton",
                onClick: () => void runSweep()
              }, "\u786E\u8BA4\u6E05\u7406")
            )
          ) : null
        ),
        inlineStatus ? h3("p", {
          id: ttlErrorId,
          className: "dim-globalInline",
          "data-tone": inlineStatus.role === "alert" ? "error" : void 0,
          role: inlineStatus.role,
          "aria-live": inlineStatus.role === "status" ? "polite" : void 0
        }, inlineStatus.message) : null
      )
    ),
    h3(ImageInputSettings, { rpcCall })
  );
}
function GlobalSettingsPanel({ rpcCall }) {
  const [tab, setTab] = React25.useState("general");
  const tabs = [{ key: "general", label: "\u901A\u7528" }, { key: "attachments", label: "\u9644\u4EF6" }];
  return h3(
    "section",
    { className: "dim-generalSettingsPage", "aria-label": "\u901A\u7528\u8BBE\u7F6E" },
    h3("header", { className: "dim-generalSettingsHeader" }, h3("h2", null, "\u901A\u7528\u8BBE\u7F6E")),
    h3(
      "div",
      { className: "dim-generalSettingsTabsBar" },
      h3(
        "div",
        { className: "dim-generalSettingsTabs", role: "tablist", "aria-label": "\u901A\u7528\u8BBE\u7F6E\u5206\u7C7B" },
        ...tabs.map((item) => h3("button", {
          key: item.key,
          type: "button",
          id: `dim-general-settings-tab-${item.key}`,
          className: "dim-generalSettingsTab",
          role: "tab",
          "aria-selected": tab === item.key,
          "aria-controls": `dim-general-settings-panel-${item.key}`,
          tabIndex: tab === item.key ? 0 : -1,
          onClick: () => setTab(item.key),
          onKeyDown: (event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === "Home" ? "general" : event.key === "End" ? "attachments" : tab === "general" ? "attachments" : "general";
            setTab(next);
            globalThis.document?.getElementById(`dim-general-settings-tab-${next}`)?.focus();
          }
        }, item.label))
      )
    ),
    tab === "general" ? h3("div", {
      id: "dim-general-settings-panel-general",
      className: "dim-generalSettingsTabPanel",
      role: "tabpanel",
      "aria-labelledby": "dim-general-settings-tab-general"
    }, h3(SidebarSettings, { rpcCall }), h3(GroupHistorySettings, { rpcCall })) : h3(AttachmentSettingsPanel, { rpcCall })
  );
}

// plugin-src/client/loopback-recovery.js
var TRANSPORT_FORBIDDEN = /^transport failure for \/[A-Za-z0-9._~-]+\/[A-Za-z0-9_$./~-]+: HTTP 403$/;
var LOOPBACK_RECOVERY_ERROR_CODE = "loopback-recovery-required";
var LOOPBACK_RECOVERY_ERROR_MESSAGE = "\u5F53\u524D\u5730\u5740\u4E0E\u6D4F\u89C8\u5668\u7684\u672C\u673A\u8BF7\u6C42\u6821\u9A8C\u4E0D\u517C\u5BB9\u3002\u8BF7\u4F7F\u7528\u4E0A\u65B9\u6309\u94AE\u6539\u7528 localhost \u91CD\u65B0\u6253\u5F00\u3002";
function isIpv4Loopback(hostname) {
  const parts = hostname.split(".");
  return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
function createLoopbackRecovery(error, location) {
  if (!TRANSPORT_FORBIDDEN.test(error?.message ?? "")) return null;
  if (typeof location?.href !== "string") return null;
  try {
    const current = new URL(location.href);
    if (current.protocol !== "http:" || !isIpv4Loopback(current.hostname)) return null;
    current.hostname = "localhost";
    return Object.freeze({
      url: current.href,
      origin: current.origin
    });
  } catch {
    return null;
  }
}
function createLoopbackAwareRpcCall(rpcCall, {
  location,
  onRecovery
} = {}) {
  if (typeof rpcCall !== "function") throw new TypeError("rpcCall must be a function");
  return async (...args) => {
    try {
      return await rpcCall(...args);
    } catch (error) {
      const recovery = createLoopbackRecovery(error, location);
      if (!recovery) throw error;
      onRecovery?.(recovery);
      const presented = new Error(LOOPBACK_RECOVERY_ERROR_MESSAGE);
      presented.code = LOOPBACK_RECOVERY_ERROR_CODE;
      presented.cause = error;
      presented.recoveryUrl = recovery.url;
      throw presented;
    }
  };
}
function createLoopbackAwareRpcCalls(rpcCalls, options) {
  return Object.freeze(Object.fromEntries(
    Object.entries(rpcCalls).map(([name2, rpcCall]) => [
      name2,
      typeof rpcCall === "function" ? createLoopbackAwareRpcCall(rpcCall, options) : rpcCall
    ])
  ));
}
function replacePageLocation(url, location = globalThis.location) {
  location?.replace?.(url);
}

// plugin-src/client/styles.js
var IM_STYLE_ID = "xmanrui-dsh-im-settings";
var CSS3 = String.raw`
.dim-sidebarIcon { display: block; flex: none; }
.dim-pluginOpen { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 7px 14px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 13px; line-height: 20px; cursor: pointer; }
.dim-pluginOpen:hover { background: var(--dsw-alias-interactive-bg-hover, #f7f8fa); }
.dim-pluginOpen:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 3px; }
.dim-pluginPage { height: 100%; min-height: 0; overflow: auto; box-sizing: border-box; padding: 24px clamp(16px, 4vw, 48px) 32px; color: var(--dsw-alias-label-primary, #1f2329); }
.dim-pluginPageContent { max-width: 1080px; margin: 0 auto; }
@media (pointer: coarse) { .dim-pluginOpen { min-height: 44px; } }
.dim-connectionDiagnostic { min-width: 0; width: 100%; color: var(--dsw-alias-label-secondary, #646a73); overflow-wrap: anywhere; font-size: 13px; line-height: 1.6; }
.dim-connectionDiagnostic[data-warning="true"] { color: var(--dsw-alias-state-warn-primary, #d97706); }
.dim-connectionDiagnostic p { margin: 4px 0; }
.dim-connectionDiagnostic button { border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 6px; padding: 6px 10px; color: inherit; background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; cursor: pointer; }
.dim-connectionDiagnostic button:focus-visible, .dim-connectionDiagnostic summary:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }

.dim-aliasName { display: flex; align-items: center; gap: 4px; min-width: 0; }
.dim-aliasName h3 { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dim-aliasName h3:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; border-radius: 3px; }
.dim-botNameTooltip { position: fixed; z-index: 1000; box-sizing: border-box; width: max-content; max-width: min(320px, calc(100vw - 16px)); padding: 6px 9px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 7px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 8px 24px rgb(31 35 41 / 14%); font: 500 12px/18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; white-space: normal; overflow-wrap: anywhere; pointer-events: none; animation: dim-botNameTooltip-in .15s ease; }
@keyframes dim-botNameTooltip-in { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .dim-botNameTooltip { animation: none; } }
.dim-aliasEntry { display: inline-flex; flex: none; }
.dim-aliasEdit { display: grid; place-items: center; width: 28px; height: 28px; padding: 4px; border: 0; border-radius: 5px; color: var(--dsw-alias-label-tertiary, #8f959e); background: transparent; cursor: pointer; }
.dim-aliasEdit svg { opacity: .55; transition: opacity .15s ease; }
.dim-aliasName:hover .dim-aliasEdit:not(:disabled) svg, .dim-aliasEdit:focus-visible svg { opacity: 1; }
.dim-aliasEdit:hover:not(:disabled), .dim-aliasEdit:focus-visible { color: var(--dsw-alias-state-business-primary, #3370ff); background: var(--dsw-alias-interactive-bg-hover, #f7f8fa); }
.dim-aliasDialog { box-sizing: border-box; width: min(380px, calc(100% - 32px)); max-height: calc(100dvh - 32px); overflow-y: auto; padding: 22px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 12px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 12px 36px rgb(0 0 0 / 18%); font: 13px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.dim-aliasDialog * { box-sizing: border-box; }
.dim-aliasDialog::backdrop { background: rgb(15 17 21 / 30%); }
.dim-aliasHeader { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
.dim-aliasHeader h3 { margin: 0; font-size: 16px; }
.dim-aliasDialog button { font: inherit; cursor: pointer; }
.dim-aliasDialog .dim-aliasClose { width: 28px; height: 28px; padding: 0; border: 0; border-radius: 5px; background: transparent; color: var(--dsw-alias-label-secondary, #646a73); font-size: 20px; }
.dim-aliasOriginal { display: flex; flex-wrap: wrap; gap: 6px 14px; padding: 10px 12px; margin-bottom: 18px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2, #f5f6f7); overflow-wrap: anywhere; }
.dim-aliasOriginal > span:first-child { flex: none; color: var(--dsw-alias-label-secondary, #646a73); }
.dim-aliasDialog label { display: block; margin-bottom: 7px; }
.dim-aliasDialog input { width: 100%; min-height: 38px; padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 6px; color: inherit; background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; }
.dim-aliasHelp { margin: 8px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; }
.dim-aliasError { color: var(--dsw-alias-state-danger-primary, #c53030); overflow-wrap: anywhere; }
.dim-aliasFooter { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-top: 24px; }
.dim-aliasRestore { padding: 4px 0; border: 0; color: var(--dsw-alias-state-business-primary, #3370ff); background: transparent; }
.dim-aliasActions { display: flex; gap: 8px; margin-left: auto; }
.dim-aliasActions button { padding: 7px 14px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 6px; color: inherit; background: var(--dsw-alias-bg-layer-1, #fff); }
.dim-aliasActions .dim-aliasSave { color: #fff; border-color: var(--dsw-alias-state-business-primary, #3370ff); background: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-aliasEdit:disabled, .dim-aliasDialog button:disabled, .dim-aliasDialog input:disabled { opacity: .55; cursor: not-allowed; }
.dim-aliasEdit:focus-visible, .dim-aliasDialog button:focus-visible, .dim-aliasDialog input:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }
@media (pointer: coarse) { .dim-aliasEdit, .dim-aliasDialog button { min-width: 44px; min-height: 44px; } .dim-aliasDialog input { font-size: 16px; } }
.dim-page {
  --dim-blue: var(--dsw-alias-state-business-primary, #3370ff);
  --dim-blue-soft: color-mix(in srgb, var(--dim-blue) 9%, transparent);
  width: 100%;
  max-width: 1080px;
  padding: 2px 0 30px;
  color: var(--dsw-alias-label-primary, #1f2329);
  box-sizing: border-box;
}
.dim-page *, .dim-page *::before, .dim-page *::after { box-sizing: border-box; }
.dim-title { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 0 0 18px; }
.dim-brand { min-width: 0; width: max-content; max-width: 100%; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; margin: -2px -6px; padding: 2px 6px; border-radius: 8px; }
.dim-brandHeading { display: flex; align-items: baseline; gap: 8px; white-space: nowrap; }
.dim-brandName { color: var(--dsw-alias-label-primary, #1f2329); font-size: 20px; line-height: 24px; font-weight: 800; letter-spacing: .04em; }
.dim-brandVersion { color: var(--dsw-alias-label-tertiary, #8f959e); font: 500 10px/16px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0; }
.dim-title p { margin: 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 18px; font-weight: 500; white-space: nowrap; }
.dim-titleActions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.dim-updateButton { min-height: 30px; display: inline-flex; align-items: center; justify-content: center; gap: 3px; padding: 5px 10px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 12px; line-height: 18px; font-weight: 560; cursor: pointer; }
.dim-updateButton:hover:not(:disabled) { border-color: #aeb3bb; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-interactive-bg-hover, #f7f8fa); }
.dim-updateButton:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }
.dim-updateButton:disabled { opacity: .55; cursor: default; }
.dim-updateAction { position: relative; display: inline-flex; flex: none; }
.dim-updateTrigger { width: 30px; height: 30px; flex: none; padding: 0; }
.dim-updateTrigger svg { display: block; }
.dim-updateBackdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; background: rgb(15 17 21 / 42%); }
.dim-updateBackdrop, .dim-updateBackdrop * { box-sizing: border-box; }
.dim-updateDialog { width: min(480px, 100%); max-height: calc(100vh - 48px); overflow-y: auto; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 16px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 20px 70px rgb(0 0 0 / 20%); text-align: left; }
.dim-updateDialog:focus { outline: none; }
.dim-updateDialog h3 { margin: 22px 24px 8px; font-size: 18px; line-height: 25px; font-weight: 680; }
.dim-updateDescription { margin: 0 24px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 13px; line-height: 20px; }
.dim-updateBody { padding: 18px 24px 20px; }
.dim-updateVersions { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 8px 18px; margin: 0 0 18px; font-size: 12px; line-height: 18px; }
.dim-updateVersions dt { color: var(--dsw-alias-label-secondary, #646a73); }
.dim-updateVersions dd { min-width: 0; margin: 0; overflow-wrap: anywhere; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.dim-updateStatus { padding: 12px 14px; border: 1px solid var(--dsw-alias-border-l1, #eef0f3); border-radius: 10px; background: var(--dsw-alias-bg-layer-1, #f7f8fa); font-size: 13px; line-height: 20px; }
.dim-updateStatus strong { font-weight: 600; }
.dim-updateStatus p { margin: 6px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
.dim-updateStatusError { border-color: color-mix(in srgb, var(--dsw-alias-state-danger-primary, #d92d20) 25%, var(--dsw-alias-border-l2, #dfe1e5)); }
.dim-updateHint, .dim-updateError { margin: 12px 0 0; font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
.dim-updateHint { color: var(--dsw-alias-label-secondary, #646a73); }
.dim-updateError { color: var(--dsw-alias-state-danger-primary, #d92d20); }
.dim-updateManual { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--dsw-alias-border-l1, #eef0f3); }
.dim-updateManualHeading { margin: 0; font-size: 13px; line-height: 20px; font-weight: 600; }
.dim-updateManualHint { margin: 8px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 19px; }
.dim-updateCommandRow { display: flex; align-items: center; gap: 8px; margin-top: 10px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; background: var(--dsw-alias-bg-layer-1, #f7f8fa); }
.dim-updateCommand { display: block; flex: 1; width: 100%; min-width: 0; padding: 0; resize: none; border: 0; color: var(--dsw-alias-label-primary, #1f2329); background: transparent; font: 12px/19px ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }
.dim-updateCommand:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }
.dim-updateCopy { display: inline-flex; flex: 0 0 28px; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border: 0; border-radius: 6px; color: var(--dsw-alias-label-secondary, #646a73); background: transparent; cursor: pointer; }
.dim-updateCopy:hover:not(:disabled) { color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-interactive-bg-hover, #eef0f3); }
.dim-updateCopy:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }
.dim-updateCopy:disabled { opacity: .55; cursor: default; }
.dim-updateCopyCopied { color: var(--dsw-alias-state-success-primary, #20a162); }
.dim-updateFooter { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--dsw-alias-border-l1, #eef0f3); }
.dim-updateFooter .dim-updateButton:first-child { margin-right: auto; }
.dim-updatePrimary, .dim-updatePrimary:hover:not(:disabled) { border-color: var(--dsw-alias-state-business-primary, #3370ff); color: #fff; background: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-githubAction { position: relative; display: inline-flex; flex: none; }
.dim-githubLink { width: 30px; height: 30px; display: grid; place-items: center; flex: none; padding: 0; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-layer-1, #fff); text-decoration: none; transition: border-color .15s ease, color .15s ease, background .15s ease; }
.dim-githubLink svg { display: block; }
.dim-githubLink:hover { border-color: #aeb3bb; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-interactive-bg-hover, #f7f8fa); }
.dim-githubLink:focus-visible { outline: 2px solid color-mix(in srgb, var(--dim-blue) 70%, white); outline-offset: 2px; }
.dim-updateTooltip, .dim-githubTooltip { position: absolute; top: calc(100% + 8px); right: 0; z-index: 20; width: max-content; max-width: min(220px, 80vw); padding: 6px 9px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 7px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 8px 24px rgb(31 35 41 / 14%); font-size: 11px; line-height: 16px; font-weight: 500; white-space: nowrap; opacity: 0; visibility: hidden; transform: translateY(-3px); pointer-events: none; transition: opacity .15s ease, transform .15s ease, visibility .15s ease; }
.dim-updateAction:hover .dim-updateTooltip, .dim-updateTrigger:focus-visible + .dim-updateTooltip, .dim-githubAction:hover .dim-githubTooltip, .dim-githubAction:focus-within .dim-githubTooltip { opacity: 1; visibility: visible; transform: translateY(0); }
.dim-generalSettingsAction { position: relative; display: inline-flex; flex: none; }
.dim-generalSettingsButton { width: 30px; height: 30px; display: grid; place-items: center; flex: none; padding: 0; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-layer-1, #fff); cursor: pointer; transition: border-color .15s ease, color .15s ease, background .15s ease, box-shadow .15s ease; }
.dim-generalSettingsButton svg { display: block; }
.dim-generalSettingsButton:hover { border-color: #aeb3bb; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-interactive-bg-hover, #f7f8fa); }
.dim-generalSettingsButton[aria-current="page"] { border-color: color-mix(in srgb, var(--dim-blue) 42%, var(--dsw-alias-border-l2, #dfe1e5)); color: var(--dim-blue); background: var(--dim-blue-soft); }
.dim-generalSettingsButton:focus-visible { outline: 2px solid color-mix(in srgb, var(--dim-blue) 70%, white); outline-offset: 2px; }
.dim-generalSettingsTooltip { position: absolute; top: calc(100% + 8px); right: 0; z-index: 20; width: max-content; padding: 6px 9px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 7px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 8px 24px rgb(31 35 41 / 14%); font-size: 11px; line-height: 16px; font-weight: 500; white-space: nowrap; opacity: 0; visibility: hidden; transform: translateY(-3px); pointer-events: none; transition: opacity .15s ease, transform .15s ease, visibility .15s ease; }
.dim-generalSettingsAction:hover .dim-generalSettingsTooltip, .dim-generalSettingsButton:focus-visible + .dim-generalSettingsTooltip { opacity: 1; visibility: visible; transform: translateY(0); }
.dim-generalSettingsButton[aria-current="page"] + .dim-generalSettingsTooltip { opacity: 0; visibility: hidden; transform: translateY(-3px); }
.dim-layout { display: grid; grid-template-columns: 174px 1px minmax(0, 1fr); gap: 24px; align-items: start; }
.dim-rail { display: grid; align-content: start; gap: 8px; padding: 0 4px 1px 1px; }
.dim-channel { width: 100%; min-height: 48px; display: grid; grid-template-columns: 30px minmax(0, 1fr); align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--dsw-alias-border-l2, #eef0f3); border-radius: 14px; color: inherit; background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 2px 8px rgb(31 35 41 / 3%); font: inherit; text-align: left; cursor: pointer; transition: border-color .16s ease, background .16s ease, box-shadow .16s ease; }
.dim-channel:hover { border-color: color-mix(in srgb, var(--dim-blue) 25%, var(--dsw-alias-border-l2, #eef0f3)); background: color-mix(in srgb, var(--dim-blue) 2%, var(--dsw-alias-bg-layer-3, #fff)); box-shadow: 0 5px 16px rgb(31 35 41 / 5%); }
.dim-channel[aria-selected="true"] { border-color: color-mix(in srgb, var(--dim-blue) 43%, var(--dsw-alias-border-l2, #dfe1e5)); color: var(--dim-blue); background: color-mix(in srgb, var(--dim-blue) 12%, var(--dsw-alias-bg-layer-3, #fff)); box-shadow: 0 3px 12px rgb(51 112 255 / 7%); }
.dim-channel:focus-visible { outline: none; border-color: color-mix(in srgb, var(--dim-blue) 72%, var(--dsw-alias-border-l2, #dfe1e5)); box-shadow: 0 0 0 1px color-mix(in srgb, var(--dim-blue) 24%, transparent) inset, 0 3px 12px rgb(51 112 255 / 7%); }
.dim-logo { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; box-shadow: 0 1px 3px rgb(31 35 41 / 7%); }
.dim-logo svg { display: block; width: 20px; height: 20px; }
.dim-logoWeixin { color: white; background: #07c160; }
.dim-logoWeixin svg { width: 19px; height: 19px; }
.dim-logoFeishu { background: white; border: 1px solid var(--dsw-alias-border-l2, #e5e6eb); }
.dim-logoFeishu svg { width: 28px; height: 28px; }
.dim-logoDingtalk { color: white; background: #1677ff; }
.dim-logoDingtalk svg { width: 24px; height: 24px; }
.dim-logoQq { color: white; background: #1677ff; }
.dim-logoQq svg { width: 21px; height: 21px; }
.dim-logoWecom { background: white; border: 1px solid var(--dsw-alias-border-l2, #e5e6eb); }
.dim-logoWecom svg { width: 22px; height: 22px; }
.dim-logoTelegram { color: white; background: #229ed9; }
.dim-logoTelegram svg { width: 21px; height: 21px; }
.dim-logoOffice { color: white; background: linear-gradient(145deg, #12213f, #3964fe); }
.dim-logoOffice svg { width: 23px; height: 23px; }
.dim-logoDiscord { color: white; background: #5865f2; }
.dim-logoDiscord svg { width: 21px; height: 21px; }
.dim-logoSlack { background: linear-gradient(145deg, #fff, #f8fafb); border: 1px solid #e5e6eb; }
.dim-logoSlack svg { width: 21px; height: 21px; }
.dim-logoWhatsapp { color: white; background: #25d366; }
.dim-logoIMessage { color: white; background: linear-gradient(180deg, #5bf675 0%, #28d944 50%, #0fbd2c 100%); box-shadow: inset 0 1px 1px rgb(255 255 255 / 45%), 0 1px 3px rgb(31 35 41 / 12%); }
.dim-logoIMessage svg { width: 23px; height: 23px; }
.dim-logoWhatsapp svg { width: 21px; height: 21px; }
.dim-channelCopy { min-width: 0; display: grid; }
.dim-channelCopy strong { overflow: hidden; color: inherit; font-size: 14px; line-height: 20px; font-weight: 680; text-overflow: ellipsis; white-space: nowrap; }
.dim-channelNote { overflow: hidden; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 10px; line-height: 13px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.dim-divider { width: 1px; align-self: stretch; background: var(--dsw-alias-border-l1, #eef0f3); }
.dim-panel { min-width: 0; container-type: inline-size; }
.dim-loopbackRecovery { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 0 0 14px; padding: 14px 16px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary, #d97706) 30%, var(--dsw-alias-border-l2, #dfe1e5)); border-radius: 12px; color: var(--dsw-alias-label-primary, #1f2329); background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #d97706) 8%, var(--dsw-alias-bg-layer-1, #fff)); }
.dim-loopbackRecoveryCopy { min-width: 0; }
.dim-loopbackRecoveryCopy strong { display: block; font-size: 14px; line-height: 20px; font-weight: 650; }
.dim-loopbackRecoveryCopy p { margin: 3px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 18px; }
.dim-loopbackRecoveryCopy code { display: block; overflow: hidden; margin-top: 5px; color: var(--dsw-alias-label-secondary, #646a73); font: 11px/16px ui-monospace, SFMono-Regular, Menlo, monospace; text-overflow: ellipsis; white-space: nowrap; }
.dim-loopbackRecoveryAction { flex: none; min-height: 34px; display: inline-flex; align-items: center; justify-content: center; padding: 0 12px; border: 1px solid #1677ff; border-radius: 8px; color: #fff; background: #1677ff; font: inherit; font-size: 13px; font-weight: 560; white-space: nowrap; cursor: pointer; }
.dim-loopbackRecoveryAction:hover { border-color: #0958d9; background: #0958d9; }
.dim-loopbackRecoveryAction:focus-visible { outline: 2px solid color-mix(in srgb, #1677ff 62%, white); outline-offset: 2px; }
.dim-panel .bxf-page, .dim-panel .dxw-page, .dim-panel .ddt-page, .dim-panel .dqq-page, .dim-panel .dwecom-page, .dim-panel .dsl-page, .dim-panel .dwa-page { width: 100%; max-width: none; padding: 0 0 24px; }
.dim-panel .bxf-heading, .dim-panel .dxw-heading, .dim-panel .ddt-heading { justify-content: flex-end; }
.dim-panel .bxf-headingTools, .dim-panel .dxw-tools, .dim-panel .ddt-tools { width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) max-content; align-items: center; justify-content: stretch; gap: 8px; }
.dim-panel .dim-bindActions { min-width: 0; display: flex; align-items: center; flex-wrap: nowrap; gap: 8px; }
.dim-panel .dim-bindActions > button { min-width: 0; }
.dim-panel .bxf-headingTools .dim-scanButton, .dim-panel .dxw-tools .dim-scanButton, .dim-panel .ddt-tools .dim-scanButton { flex: none; min-height: 34px; display: inline-flex; align-items: center; justify-content: center; justify-self: start; gap: 6px; padding: 0 10px; border: 1px solid #1677ff; border-radius: 8px; color: #fff; background: #1677ff; box-shadow: none; font: inherit; font-size: 13px; font-weight: 560; white-space: nowrap; }
.dim-panel .bxf-headingTools .dim-scanButton:hover:not(:disabled), .dim-panel .dxw-tools .dim-scanButton:hover:not(:disabled), .dim-panel .ddt-tools .dim-scanButton:hover:not(:disabled) { border-color: #0958d9; background: #0958d9; }
.dim-panel .dim-credentialButton { flex: none; min-height: 34px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 10px; border: 1px solid #86909c; border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: 0 1px 2px rgb(31 35 41 / 5%); font: inherit; font-size: 13px; font-weight: 560; line-height: normal; white-space: nowrap; }
.dim-panel .dim-actionIcon { width: 15px; height: 15px; flex: 0 0 15px; }
.dim-panel .dim-credentialButton:hover:not(:disabled) { border-color: #4e5969; background: var(--dsw-alias-interactive-bg-hover, #f7f8fa); }
.dim-panel .dim-credentialButton[aria-pressed="true"] { border-color: #4e5969; background: var(--dsw-alias-bg-module-platform, #f2f3f5); box-shadow: inset 0 0 0 1px rgb(78 89 105 / 8%); }
.dim-panel .bxf-headingTools .dim-onlineBadge, .dim-panel .dxw-tools .dim-onlineBadge, .dim-panel .ddt-tools .dim-onlineBadge { min-height: 30px; display: inline-flex; align-items: center; justify-self: end; gap: 0; padding: 0 11px; border: 0; border-radius: 999px; color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-module-platform, #f2f3f5); font: inherit; font-size: 12px; font-weight: 400; line-height: normal; white-space: nowrap; }
.dim-panel .dim-channelPage { min-width: 0; width: 100%; max-width: none; display: flex; flex-direction: column; gap: 12px; padding: 0 0 24px; color: var(--dsw-alias-label-primary, #1f2329); box-sizing: border-box; }
.dim-panel .dim-surfaceCard { position: relative; overflow: hidden; border: 1px solid var(--dsw-alias-border-l2, #e5e6eb); border-radius: 14px; background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: 0 1px 2px rgb(31 35 41 / 3%); }
.dim-panel .dim-surfaceCard::before { display: none; }
.dim-panel .dim-surfaceBody { padding: 24px; }
.dim-panel .dim-credentialPanel { display: grid; gap: 18px; padding: 20px; }
.dim-panel .dim-credentialTitle { margin: 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 17px; line-height: 1.35; font-weight: 650; }
.dim-panel .dim-credentialForm { min-width: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 12px; }
.dim-panel .dim-credentialFormSingle { grid-template-columns: minmax(0, 1fr); }
.dim-panel .dim-credentialField { min-width: 0; display: grid; gap: 7px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: normal; font-weight: 560; }
.dim-panel .dim-credentialField input { width: 100%; min-width: 0; height: 38px; padding: 0 11px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; outline: none; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: 13px ui-monospace, SFMono-Regular, Menlo, monospace; transition: border-color .16s ease, box-shadow .16s ease; }
.dim-panel .dim-credentialField input:focus { border-color: #4e5969; box-shadow: 0 0 0 3px rgb(78 89 105 / 10%); }
.dim-panel .dim-credentialField input::placeholder { color: var(--dsw-alias-label-tertiary, #8f959e); font-family: inherit; }
.dim-panel .dim-credentialError, .dim-panel .dim-credentialActions { grid-column: 1 / -1; }
.dim-panel .dim-credentialError { margin: 0; color: var(--dsw-alias-state-error-primary, #d54941); font-size: 12px; line-height: 1.5; }
.dim-panel .dim-credentialActions { margin-top: 0; }
.dim-panel .dim-listSection { min-width: 0; width: 100%; max-width: 100%; display: flex; flex-direction: column; gap: 0; }
.dim-panel .dim-listHeading { min-height: 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 0 0 6px; padding: 0; }
.dim-panel .dim-listHeading h3 { margin: 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 14px; line-height: normal; font-weight: 650; }
.dim-panel .dim-listTitle { min-width: 0; display: inline-flex; align-items: center; gap: 6px; }
.dim-panel .dim-channelHelp { position: relative; display: inline-flex; flex: none; }
.dim-panel .dim-channelHelpButton { width: 17px; height: 17px; display: grid; place-items: center; padding: 0; border: 1px solid color-mix(in srgb, #1677ff 28%, var(--dsw-alias-border-l2, #dfe1e5)); border-radius: 50%; color: #1677ff; background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 11px; line-height: 1; font-weight: 700; cursor: help; transition: border-color .15s ease, color .15s ease, background .15s ease, box-shadow .15s ease; }
.dim-panel .dim-channelHelpButton:hover { border-color: #1677ff; color: #0f5fce; background: color-mix(in srgb, #1677ff 8%, var(--dsw-alias-bg-layer-1, #fff)); }
.dim-panel .dim-channelHelpButton:focus-visible { outline: none; border-color: #1677ff; box-shadow: 0 0 0 3px color-mix(in srgb, #1677ff 16%, transparent); }
.dim-panel .dim-channelTooltip { position: absolute; top: calc(100% + 7px); left: 0; z-index: 30; width: max-content; max-width: min(280px, calc(100vw - 48px)); display: flex; align-items: baseline; gap: 5px; padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 10px 28px rgb(31 35 41 / 16%); font-size: 11px; line-height: 16px; font-weight: 400; white-space: normal; opacity: 0; visibility: hidden; transform: translateY(-3px); pointer-events: none; transition: opacity .15s ease, transform .15s ease, visibility .15s ease; }
.dim-panel .dim-channelTooltip strong { color: var(--dsw-alias-label-primary, #1f2329); font-weight: 600; white-space: nowrap; }
.dim-panel .dim-channelHelp:hover .dim-channelTooltip, .dim-panel .dim-channelHelp:focus-within .dim-channelTooltip { opacity: 1; visibility: visible; transform: translateY(0); }
.dim-panel .dim-botList { min-width: 0; width: 100%; max-width: 100%; display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; margin: 0; padding: 0; list-style: none; }
.dim-panel .dim-botList > li { min-width: 0; max-width: 100%; }
.dim-panel .dim-loadingView { padding: 38px; color: var(--dsw-alias-label-secondary, #646a73); text-align: center; }
.dim-panel .dim-loadingView h3 { margin: 0 0 7px; color: var(--dsw-alias-label-primary, #1f2329); font-size: 17px; line-height: normal; font-weight: 650; }
.dim-panel .dim-loadingView p { margin: 0; line-height: 1.6; }
.dim-panel .dim-spinner { width: 24px; height: 24px; margin: 0 auto 13px; border: 3px solid var(--dsw-alias-border-l2, #e6e8eb); border-top-color: #1677ff; border-radius: 50%; animation: dim-spin .8s linear infinite; }
@keyframes dim-spin { to { transform: rotate(360deg); } }
.dim-panel .dim-emptyView { min-height: 230px; display: grid; grid-template-columns: minmax(0, 1fr) 180px; align-items: center; gap: 30px; }
.dim-panel .dim-emptyCopy { min-width: 0; }
.dim-panel .dim-emptyCopy h3 { margin: 8px 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 18px; line-height: 1.35; font-weight: 650; }
.dim-panel .dim-emptyCopy > p { max-width: 560px; margin: 0; color: var(--dsw-alias-label-secondary, #646a73); line-height: 1.65; }
.dim-panel .dim-emptyBrand { width: 110px; height: 110px; display: grid; place-items: center; justify-self: center; border-radius: 28px; box-shadow: 0 18px 45px rgb(22 119 255 / 18%); }
.dim-panel .dim-stateLabel { display: inline-flex; align-items: center; gap: 8px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: normal; font-weight: 600; }
.dim-panel .dim-stateDot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-label-tertiary, #8f959e); box-shadow: none; }
.dim-panel .dim-stateDot[data-tone="success"] { background: var(--dsw-alias-state-success-primary, #20a162); }
.dim-panel .dim-stateDot[data-tone="warning"] { background: var(--dsw-alias-state-warn-primary, #d97706); }
.dim-panel .dim-stateDot[data-tone="error"] { background: var(--dsw-alias-state-error-primary, #d54941); }
.dim-panel .dim-viewActions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
.dim-panel .dim-viewActions .bxf-button, .dim-panel .dim-viewActions .dxw-button, .dim-panel .dim-viewActions .ddt-button { min-height: 34px; padding: 0 13px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: none; font: inherit; font-size: 13px; font-weight: 560; line-height: normal; white-space: nowrap; }
.dim-panel .dim-viewActions .bxf-button[data-kind="primary"], .dim-panel .dim-viewActions .dxw-button[data-kind="primary"], .dim-panel .dim-viewActions .ddt-button[data-kind="primary"] { border-color: #1677ff; color: #fff; background: #1677ff; box-shadow: none; }
.dim-panel .dim-viewActions .bxf-button[data-kind="danger"], .dim-panel .dim-viewActions .dxw-button[data-kind="danger"], .dim-panel .dim-viewActions .ddt-button[data-kind="danger"] { color: var(--dsw-alias-state-error-primary, #d54941); }
.dim-panel .dim-qrLayout { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 34px; align-items: start; }
.dim-panel .dim-qrColumn { width: 100%; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.dim-panel .dim-qrFrame { position: relative; width: min(270px, 100%); height: auto; aspect-ratio: 1; display: grid; place-items: center; overflow: hidden; padding: 10px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 16px; background: #fff; }
.dim-panel .dim-qrFrame::before { content: ""; position: absolute; inset: 7px; z-index: 0; border: 1px solid color-mix(in srgb, #1677ff 16%, var(--dsw-alias-border-l2, #dfe1e5)); border-radius: 12px; pointer-events: none; }
.dim-panel .dim-qrFrame::after { display: none; }
.dim-panel .dim-qrFrame img { position: relative; z-index: 1; width: 100%; height: 100%; display: block; object-fit: contain; }
.dim-panel .dim-qrFallback { position: relative; z-index: 1; display: grid; place-items: center; gap: 8px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 13px; line-height: 1.5; text-align: center; }
.dim-panel .dim-qrExpired { position: absolute; inset: 0; z-index: 2; display: grid; place-items: center; padding: 20px; color: var(--dsw-static-neutral-bluish-1000, #0f1115); background: rgb(255 255 255 / 92%); font-size: 15px; line-height: 1.6; font-weight: 650; text-align: center; white-space: pre-line; backdrop-filter: blur(3px); }
.dim-panel .dim-countdown { width: min(270px, 100%); margin: 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: normal; }
.dim-panel .dim-countdownTop { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
.dim-panel .dim-countdownTop strong { color: var(--dsw-alias-label-primary, #1f2329); font-weight: 650; }
.dim-panel .dim-progress { height: 4px; overflow: hidden; margin: 0; border-radius: 99px; background: var(--dsw-alias-bg-module-platform, #eef0f3); }
.dim-panel .dim-progress span { display: block; width: var(--bxf-progress, var(--dxw-progress, var(--ddt-progress, 0%))); height: 100%; border-radius: inherit; background: #1677ff; transition: width .25s linear; }
.dim-panel .dim-qrCopy { min-width: 0; overflow-wrap: anywhere; }
.dim-panel .dim-qrCopy h3 { margin: 9px 0 8px; color: var(--dsw-alias-label-primary, #1f2329); font-size: 18px; line-height: 1.35; font-weight: 650; }
.dim-panel .dim-qrCopy > p { margin: 0; color: var(--dsw-alias-label-secondary, #646a73); line-height: 1.65; }
.dim-panel .dim-steps { margin: 18px 0 16px; padding: 0; list-style: none; counter-reset: dim-step; }
.dim-panel .dim-steps li { position: relative; min-height: 28px; display: flex; align-items: center; padding: 5px 0 5px 36px; color: var(--dsw-alias-label-secondary, #646a73); line-height: 1.5; counter-increment: dim-step; }
.dim-panel .dim-steps li::before { content: counter(dim-step); position: absolute; left: 0; top: 4px; width: 25px; height: 25px; display: grid; place-items: center; border-radius: 8px; color: #4d93f8; background: color-mix(in srgb, #1677ff 16%, var(--dsw-alias-bg-layer-1, #fff)); font-size: 12px; font-weight: 650; }
.dim-panel .dim-specialView { padding: 32px; text-align: center; }
.dim-panel .dim-statusNotice { display: flex; align-items: flex-start; gap: 10px; padding: 13px 15px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 22%, var(--dsw-alias-border-l2, #dfe1e5)); border-radius: 10px; color: var(--dsw-alias-state-error-primary, #d54941); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 8%, var(--dsw-alias-bg-layer-1, #fff)); font-size: 13px; line-height: 1.5; }
.dim-panel .dim-inlineError { display: flex; align-items: flex-start; flex-direction: column; gap: 10px; padding: 22px; color: var(--dsw-alias-state-error-primary, #d54941); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 8%, var(--dsw-alias-bg-layer-1, #fff)); }
.dim-panel .dim-inlineError > div { min-width: 0; }
.dim-panel .dim-inlineError h3 { margin: 0; color: inherit; font-size: 17px; line-height: 1.35; font-weight: 650; }
.dim-panel .dim-inlineError p { margin: 7px 0 0; color: inherit; line-height: 1.6; }
.dim-panel .dim-confirm { padding: 18px 24px; border-top: 1px solid var(--dsw-alias-border-l1, #eef0f3); background: var(--dsw-alias-interactive-bg-hover, #f7f8fa); }
.dim-panel .dim-confirm strong, .dim-panel .dim-confirm h4 { margin: 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 14px; line-height: 1.4; font-weight: 650; }
.dim-panel .dim-confirm p { margin: 7px 0 0; color: var(--dsw-alias-label-secondary, #646a73); line-height: 1.6; }
.dim-panel .dim-cardFooter { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 6px; border-top: 1px solid var(--dsw-alias-border-l1, #eef0f3); }
.dim-panel .dim-workspace { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) max-content; align-items: center; column-gap: 10px; row-gap: 4px; margin-top: 6px; padding: 6px 10px; border: 1px solid var(--dsw-alias-border-l1, #eef0f3); border-radius: 9px; background: var(--dsw-alias-bg-module-platform, #f7f8fa); }
.dim-panel .dim-workspaceHeader { display: contents; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: normal; }
.dim-panel .dim-workspaceHeader > span { grid-column: 1; grid-row: 1; white-space: nowrap; }
.dim-panel .dim-workspaceEdit { grid-column: 2; grid-row: 1; padding: 0; border: 0; color: #1677ff; background: transparent; font: inherit; font-weight: 560; white-space: nowrap; cursor: pointer; }
.dim-panel .dim-workspaceEdit:disabled { cursor: not-allowed; opacity: .55; }
.dim-panel .dim-workspacePath { min-width: 0; max-width: 100%; grid-column: 1 / -1; grid-row: 2; display: block; overflow: hidden; color: var(--dsw-alias-label-primary, #1f2329); font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; white-space: normal; }
.dim-panel .dim-preset { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) max-content; align-items: center; column-gap: 10px; row-gap: 4px; margin-top: 6px; padding: 6px 10px; border: 1px solid var(--dsw-alias-border-l1, #eef0f3); border-radius: 9px; background: var(--dsw-alias-bg-module-platform, #f7f8fa); }
.dim-panel .dim-presetHeader { position: relative; min-width: 0; grid-column: 1 / -1; grid-row: 1; display: flex; align-items: center; justify-content: space-between; gap: 10px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: normal; }
.dim-panel .dim-presetTitle { min-width: 0; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
.dim-panel .dim-presetHelp { display: inline-flex; align-items: center; flex: none; }
.dim-panel .dim-presetHelpButton { width: 17px; height: 17px; display: grid; place-items: center; padding: 0; border: 1px solid color-mix(in srgb, #1677ff 28%, var(--dsw-alias-border-l2, #dfe1e5)); border-radius: 50%; color: #1677ff; background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 11px; line-height: 1; font-weight: 700; cursor: help; transition: border-color .15s ease, color .15s ease, background .15s ease, box-shadow .15s ease; }
.dim-panel .dim-presetHelpButton:hover { border-color: #1677ff; color: #0f5fce; background: color-mix(in srgb, #1677ff 8%, var(--dsw-alias-bg-layer-1, #fff)); }
.dim-panel .dim-presetHelpButton:focus-visible { outline: none; border-color: #1677ff; box-shadow: 0 0 0 3px color-mix(in srgb, #1677ff 16%, transparent); }
.dim-panel .dim-presetTooltip { position: absolute; top: calc(100% + 7px); left: 0; z-index: 30; width: min(320px, 100%); padding: 9px 10px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 10px 28px rgb(31 35 41 / 16%); font-size: 11px; line-height: 16px; font-weight: 400; overflow-wrap: anywhere; white-space: normal; opacity: 0; visibility: hidden; transform: translateY(-3px); pointer-events: none; transition: opacity .15s ease, transform .15s ease, visibility .15s ease; }
.dim-panel .dim-presetHelp:hover .dim-presetTooltip, .dim-panel .dim-presetHelp:focus-within .dim-presetTooltip { opacity: 1; visibility: visible; transform: translateY(0); }
.dim-panel .dim-presetStatus { grid-column: 2; grid-row: 1; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 12px; white-space: nowrap; }
.dim-panel .dim-presetSelect { min-width: 0; max-width: 100%; grid-column: 1 / -1; grid-row: 2; height: 30px; padding: 0 8px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 7px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 12px; }
.dim-panel .dim-presetSelect:disabled { cursor: not-allowed; opacity: .55; }
.dim-panel .dim-modelSetting { display: block; padding: 8px 4px 4px; }
.dim-modelSetting > .dim-presetHeader { padding: 0 6px 6px; }
.dim-modelRow { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 40px; padding: 6px 10px; border: 0; border-radius: 10px; background: transparent; color: var(--dsw-alias-label-primary, #1f2329); font: inherit; font-size: 14px; line-height: 22px; text-align: left; cursor: pointer; }
.dim-modelRowLabel { flex: none; }
.dim-modelValue { flex: 1; min-width: 0; overflow: hidden; color: var(--dsw-alias-label-tertiary, #81858c); text-overflow: ellipsis; white-space: nowrap; text-align: right; }
.dim-modelChevron { flex: none; color: var(--dsw-alias-label-tertiary, #81858c); }
.dim-modelRow:hover:not(:disabled), .dim-modelOption:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #eceef1); }
.dim-modelRow:focus-visible, .dim-modelOption:focus-visible { outline: 2px solid var(--dsw-alias-border-l3, #1677ff); outline-offset: -2px; }
.dim-modelRow:disabled, .dim-modelOption:disabled { opacity: .55; cursor: default; }
/* In-flow lists avoid clipping by collapsed-card and settings scroll containers. */
.dim-modelMenu { max-height: 280px; overflow-y: auto; margin: 4px; padding: 4px; border: 1px solid var(--dsw-alias-border-l2, #e5e6eb); border-radius: 12px; background: var(--dsw-specific-menu, var(--dsw-alias-bg-layer-3, #fff)); color: var(--dsw-alias-label-primary, #1f2329); scrollbar-width: thin; }
.dim-modelGroupTitle { padding: 7px 8px 3px; color: var(--dsw-alias-label-tertiary, #81858c); font-size: 12px; line-height: 18px; font-weight: 500; }
.dim-modelOption { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 38px; padding: 6px 8px; border: 0; border-radius: 10px; background: transparent; color: inherit; text-align: left; font: inherit; cursor: pointer; }
.dim-modelOptionCopy { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 2px; }
.dim-modelOptionName { font-size: 14px; line-height: 20px; font-weight: 500; overflow-wrap: anywhere; }
.dim-modelDescription { color: var(--dsw-alias-label-tertiary, #81858c); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
.dim-modelCheck { flex: 0 0 18px; text-align: center; }
.dim-modelHint { margin: 4px 10px 6px; color: var(--dsw-alias-label-tertiary, #81858c); font-size: 11px; line-height: 17px; }
.dim-panel .dim-presetError { grid-column: 1 / -1; grid-row: 3; margin: 0; color: var(--dsw-alias-state-error-primary, #d54941); font-size: 12px; line-height: 1.4; }
.dim-contextEntry { width: 100%; min-height: 40px; display: grid; grid-template-columns: 16px minmax(0, 1fr) max-content 16px; align-items: center; gap: 9px; margin: 10px 0; padding: 8px 11px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-module-platform, #f7f8fa); font: inherit; font-size: 13px; line-height: 20px; text-align: left; cursor: pointer; }
.dim-contextEntry:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #eef0f3); }
.dim-contextEntry > svg { color: var(--dsw-alias-label-secondary, #646a73); }
.dim-contextLabel { min-width: 0; font-weight: 500; overflow-wrap: anywhere; }
.dim-contextStatus { padding: 2px 7px; border-radius: 5px; color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-layer-1, #fff); font-size: 11px; line-height: 16px; font-weight: 400; white-space: nowrap; }
.dim-contextStatus[data-active="true"] { color: var(--dsw-alias-state-business-primary, #3370ff); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 10%, var(--dsw-alias-bg-layer-1, #fff)); }
.dim-contextBackdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 12px; background: rgb(15 17 21 / 42%); }
.dim-contextBackdrop, .dim-contextBackdrop *, .dim-contextBackdrop *::before, .dim-contextBackdrop *::after { box-sizing: border-box; }
.dim-contextDialog { width: min(450px, 100%); min-width: 0; max-height: calc(100vh - 24px); max-height: calc(100dvh - 24px); overflow-y: auto; padding: 16px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 12px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 20px 70px rgb(0 0 0 / 20%); font-size: 13px; line-height: 1.5; text-align: left; }
.dim-contextDialog:focus { outline: none; }
.dim-contextHeader, .dim-contextEditorHeader { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.dim-contextHeader { position: relative; }
.dim-contextHeaderTitle { min-width: 0; display: inline-flex; align-items: center; gap: 6px; }
.dim-contextHeader h3 { margin: 0; font-size: 15px; line-height: 22px; font-weight: 500; }
.dim-contextHeaderTooltip { width: min(340px, calc(100vw - 72px)); }
.dim-contextClose { width: 30px; height: 30px; flex: none; display: grid; place-items: center; padding: 0; border: 0; border-radius: 6px; color: var(--dsw-alias-label-secondary, #646a73); background: transparent; cursor: pointer; }
.dim-contextClose:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #eef0f3); }
.dim-contextTabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3px; margin-top: 14px; padding: 3px; border: 1px solid var(--dsw-alias-border-l1, #eef0f3); border-radius: 8px; background: var(--dsw-alias-bg-module-platform, #f7f8fa); }
.dim-contextTab { min-width: 0; min-height: 34px; padding: 5px 12px; border: 0; border-radius: 6px; color: var(--dsw-alias-label-secondary, #646a73); background: transparent; font: inherit; font-weight: 500; cursor: pointer; transition: color .15s ease, background .15s ease, box-shadow .15s ease; }
.dim-contextTab:hover:not(:disabled):not([aria-selected="true"]) { color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-interactive-bg-hover, #eef0f3); }
.dim-contextTab[aria-selected="true"] { color: var(--dsw-alias-state-business-primary, #3370ff); background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: 0 1px 3px rgb(31 35 41 / 12%); }
.dim-contextTabPanel[hidden] { display: none; }
.dim-contextSection { min-width: 0; margin: 0; padding: 0; border: 0; }
.dim-contextScope { margin-top: 10px; padding: 12px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 9px; background: var(--dsw-alias-bg-layer-1, #fff); }
.dim-contextScopeBlock { margin-top: 12px; }
.dim-contextLegend { position: relative; display: inline-flex; align-items: center; gap: 6px; }
.dim-contextSwitchRow { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 34px; cursor: pointer; }
.dim-contextSwitchLabel { min-width: 0; display: inline-flex; align-items: baseline; gap: 5px; flex-wrap: wrap; }
.dim-contextUnavailable { color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 11px; line-height: 16px; font-weight: 400; }
.dim-contextSwitch { appearance: none; flex: none; width: 32px; height: 19px; margin: 0; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 12px; background: var(--dsw-alias-interactive-bg-hover, #eef0f3); cursor: pointer; }
.dim-contextSwitch::before { content: ""; display: block; width: 13px; height: 13px; margin: 2px; border-radius: 50%; background: var(--dsw-alias-label-secondary, #646a73); }
.dim-contextSwitch:checked { border-color: var(--dsw-alias-state-business-primary, #3370ff); background: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-contextSwitch:checked::before { transform: translateX(13px); background: #fff; }
.dim-contextFields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3px 12px; }
.dim-contextField { position: relative; min-width: 0; min-height: 30px; display: flex; align-items: center; gap: 6px; }
.dim-contextField input { flex: none; width: 14px; height: 14px; margin: 0; accent-color: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-contextFieldText { min-width: 0; display: grid; grid-template-columns: max-content max-content; align-items: center; column-gap: 5px; overflow-wrap: anywhere; }
.dim-contextFieldName { min-width: 0; line-height: 17px; cursor: pointer; }
.dim-contextFieldKey { min-width: 0; grid-column: 1 / -1; color: var(--dsw-alias-label-tertiary, #8f959e); font: 10px/14px ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; cursor: pointer; }
.dim-contextFieldHelp { position: static; }
.dim-contextFieldHelpButton { width: 16px; height: 16px; font-size: 10px; }
.dim-contextTooltip.dim-contextFieldTooltip { top: calc(100% + 6px); right: 0; left: auto; width: min(280px, calc(100vw - 72px)); }
.dim-contextField:nth-child(odd) .dim-contextFieldTooltip { right: auto; left: 0; }
.dim-contextEditorHeader { position: relative; flex-wrap: wrap; }
.dim-contextEditorTitle { min-width: 0; display: inline-flex; align-items: center; gap: 6px; }
.dim-contextEditorTitle > label { font-weight: 500; }
.dim-contextHelp { display: inline-flex; align-items: center; flex: none; }
.dim-contextHelpButton { width: 18px; height: 18px; display: grid; place-items: center; padding: 0; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 30%, var(--dsw-alias-border-l2, #dfe1e5)); border-radius: 50%; color: var(--dsw-alias-state-business-primary, #3370ff); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 11px; line-height: 1; font-weight: 700; cursor: help; transition: border-color .15s ease, color .15s ease, background .15s ease, box-shadow .15s ease; }
.dim-contextHelpButton:hover:not(:disabled) { border-color: var(--dsw-alias-state-business-primary, #3370ff); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 8%, var(--dsw-alias-bg-layer-1, #fff)); }
.dim-contextTooltip { position: absolute; top: calc(100% + 7px); left: 0; z-index: 30; width: min(330px, calc(100vw - 72px)); display: grid; gap: 5px; padding: 10px 11px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 10px 28px rgb(31 35 41 / 16%); font-size: 11px; line-height: 16px; font-weight: 400; overflow-wrap: anywhere; white-space: normal; opacity: 0; visibility: hidden; transform: translateY(-3px); pointer-events: none; transition: opacity .15s ease, transform .15s ease, visibility .15s ease; }
.dim-contextTooltip strong { font-weight: 600; }
.dim-contextTooltipExample { padding: 7px 8px; border-radius: 6px; background: var(--dsw-alias-bg-module-platform, #f7f8fa); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; }
.dim-contextTooltip.dim-contextLegendTooltip { width: min(350px, calc(100vw - 72px)); }
.dim-contextTooltip.dim-contextGuidanceTooltip { top: auto; bottom: calc(100% + 7px); width: min(380px, calc(100vw - 72px)); max-height: calc(100dvh - 48px); overflow-y: auto; }
.dim-contextHelp:hover .dim-contextTooltip, .dim-contextHelp:focus-within .dim-contextTooltip { opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto; }
.dim-contextTextActions { display: flex; gap: 10px; margin-left: auto; }
.dim-contextTextActions button { min-height: 30px; padding: 4px 0; border: 0; border-radius: 4px; color: var(--dsw-alias-state-business-primary, #3370ff); background: transparent; font: inherit; font-size: 12px; cursor: pointer; }
.dim-contextTextActions button:hover:not(:disabled) { text-decoration: underline; }
.dim-contextGuidance textarea { display: block; width: 100%; min-height: 88px; margin-top: 7px; padding: 9px 10px; resize: vertical; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 7px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-module-platform, #f7f8fa); font: inherit; font-size: 12px; line-height: 1.6; }
.dim-contextGuidance textarea::placeholder { color: var(--dsw-alias-label-tertiary, #8f959e); opacity: 1; }
.dim-contextHint { margin: 5px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }
.dim-contextError { margin: 12px 0 0; color: var(--dsw-alias-state-error-primary, #d54941); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
.dim-contextFooter { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.dim-contextFooter button { min-height: 34px; padding: 6px 15px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 7px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; cursor: pointer; }
.dim-contextFooter button:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #eef0f3); }
.dim-contextFooter .dim-contextSave, .dim-contextFooter .dim-contextSave:hover:not(:disabled) { border-color: var(--dsw-alias-state-business-primary, #3370ff); color: #fff; background: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-contextEntry:focus-visible, .dim-contextDialog button:focus-visible, .dim-contextDialog input:focus-visible, .dim-contextDialog textarea:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }
.dim-contextEntry:disabled, .dim-contextDialog button:disabled, .dim-contextDialog input:disabled, .dim-contextDialog textarea:disabled { opacity: .55; cursor: not-allowed; }
@media (pointer: coarse) {
  .dim-contextEntry, .dim-contextTab, .dim-contextClose, .dim-contextFooter button, .dim-contextTextActions button, .dim-contextField, .dim-contextSwitchRow { min-height: 44px; }
  .dim-contextClose, .dim-contextTextActions button { min-width: 44px; }
  .dim-contextGuidance textarea { font-size: 16px; }
}
.dim-directoryPickerBackdrop { --dim-blue: var(--dsw-alias-state-business-primary, #3370ff); --dim-blue-soft: color-mix(in srgb, var(--dim-blue) 9%, transparent); position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; background: rgb(15 17 21 / 42%); backdrop-filter: blur(3px); }
.dim-directoryPickerBackdrop, .dim-directoryPickerBackdrop *, .dim-directoryPickerBackdrop *::before, .dim-directoryPickerBackdrop *::after { box-sizing: border-box; }
.dim-directoryPicker { width: min(720px, 100%); height: min(620px, calc(100vh - 48px)); min-height: 420px; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; overflow: hidden; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 18px; outline: none; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: 0 24px 72px rgb(15 17 21 / 24%); }
.dim-directoryPickerHeader { min-width: 0; padding: 22px 24px 17px; border-bottom: 1px solid var(--dsw-alias-border-l1, #eef0f3); }
.dim-directoryPickerHeader h3 { margin: 0 0 14px; color: var(--dsw-alias-label-primary, #1f2329); font-size: 20px; line-height: 1.35; font-weight: 680; }
.dim-directoryPickerHeader > p { margin: 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 13px; }
.dim-directoryCrumbs { min-width: 0; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; color: var(--dsw-alias-label-tertiary, #8f959e); }
.dim-directoryCrumbs button { max-width: 210px; overflow: hidden; padding: 3px 5px; border: 0; border-radius: 6px; color: var(--dsw-alias-label-secondary, #646a73); background: transparent; font: inherit; font-size: 12px; line-height: 18px; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
.dim-directoryCrumbs button:hover:not(:disabled) { color: var(--dim-blue); background: var(--dim-blue-soft); }
.dim-directoryCrumbs button[aria-current="page"] { color: var(--dsw-alias-label-primary, #1f2329); font-weight: 650; }
.dim-directoryCrumbs button:focus-visible, .dim-directoryPathInput:focus-visible, .dim-directoryPathControl button:focus-visible, .dim-directoryList button:focus-visible, .dim-directoryPickerActions button:focus-visible { outline: 2px solid color-mix(in srgb, var(--dim-blue) 65%, white); outline-offset: 1px; }
.dim-directoryCrumbSeparator { flex: none; font-size: 12px; }
.dim-directoryPathForm { display: grid; gap: 7px; margin-top: 14px; }
.dim-directoryPathMeta { min-width: 0; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.dim-directoryPathMeta label { flex: none; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; font-weight: 650; }
.dim-directoryPathMeta span { min-width: 0; overflow: hidden; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.dim-directoryPathControl { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) max-content; gap: 8px; }
.dim-directoryPathInput { min-width: 0; height: 38px; padding: 0 11px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: 12px ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; line-height: 38px; }
.dim-directoryPathInput::placeholder { color: var(--dsw-alias-label-tertiary, #8f959e); }
.dim-directoryPathInput:hover:not(:disabled) { border-color: var(--dsw-alias-border-l3, #bbbfc4); }
.dim-directoryPathInput:focus { border-color: var(--dim-blue); }
.dim-directoryPathInput[aria-invalid="true"] { border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 62%, var(--dsw-alias-border-l2, #dfe1e5)); }
.dim-directoryPathControl button { min-height: 38px; padding: 0 14px; border: 1px solid color-mix(in srgb, var(--dim-blue) 30%, var(--dsw-alias-border-l2, #dfe1e5)); border-radius: 8px; color: var(--dim-blue); background: var(--dim-blue-soft); font: inherit; font-size: 13px; font-weight: 650; cursor: pointer; }
.dim-directoryPathControl button:hover:not(:disabled) { border-color: color-mix(in srgb, var(--dim-blue) 48%, var(--dsw-alias-border-l2, #dfe1e5)); background: color-mix(in srgb, var(--dim-blue) 13%, transparent); }
.dim-directoryPathInput:disabled, .dim-directoryPathControl button:disabled { cursor: not-allowed; opacity: .55; }
.dim-directoryPickerBody { min-height: 0; overflow-y: auto; padding: 14px 16px; scrollbar-width: thin; scrollbar-color: var(--dsw-alias-border-l2, #dfe1e5) transparent; }
.dim-directoryList { display: grid; gap: 3px; margin: 0; padding: 0; list-style: none; }
.dim-directoryList button { width: 100%; min-height: 46px; display: grid; grid-template-columns: 24px minmax(0, 1fr) 18px; align-items: center; gap: 10px; padding: 7px 11px; border: 0; border-radius: 9px; color: var(--dsw-alias-label-primary, #1f2329); background: transparent; font: inherit; text-align: left; cursor: pointer; }
.dim-directoryList button:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #f7f8fa); }
.dim-directoryList button:disabled, .dim-directoryCrumbs button:disabled { cursor: wait; opacity: .55; }
.dim-directoryFolder { width: 24px; height: 24px; display: grid; place-items: center; color: var(--dsw-alias-label-secondary, #646a73); }
.dim-directoryFolder svg { width: 22px; height: 22px; }
.dim-directoryName { min-width: 0; overflow: hidden; font-size: 14px; line-height: 20px; text-overflow: ellipsis; white-space: nowrap; }
.dim-directoryChevron { width: 18px; height: 18px; display: grid; place-items: center; color: var(--dsw-alias-label-tertiary, #8f959e); }
.dim-directoryChevron svg { width: 17px; height: 17px; }
.dim-directoryPickerState { min-height: 210px; display: grid; place-content: center; justify-items: center; gap: 10px; color: var(--dsw-alias-label-secondary, #646a73); text-align: center; }
.dim-directoryPickerState p { margin: 0; font-size: 13px; line-height: 1.6; }
.dim-directoryPickerSpinner { width: 24px; height: 24px; border: 3px solid var(--dsw-alias-border-l2, #e6e8eb); border-top-color: var(--dim-blue); border-radius: 50%; animation: dim-spin .8s linear infinite; }
.dim-directoryPickerError { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 8px 0 0; padding: 10px 12px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 22%, var(--dsw-alias-border-l2, #dfe1e5)); border-radius: 8px; color: var(--dsw-alias-state-error-primary, #d54941); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 7%, var(--dsw-alias-bg-layer-1, #fff)); font-size: 12px; line-height: 1.5; }
.dim-directoryPickerError button { flex: none; padding: 4px 8px; border: 0; border-radius: 6px; color: inherit; background: transparent; font: inherit; font-weight: 650; cursor: pointer; }
.dim-directoryPickerTruncated { margin: 10px 4px 0; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 12px; line-height: 1.5; }
.dim-directoryPickerFooter { display: grid; grid-template-columns: max-content minmax(0, 1fr) max-content; align-items: center; gap: 14px; padding: 16px 20px; border-top: 1px solid var(--dsw-alias-border-l1, #eef0f3); background: var(--dsw-alias-bg-layer-1, #fff); }
.dim-directoryHidden { display: inline-flex; align-items: center; gap: 7px; padding: 2px 0; border: 0; color: var(--dsw-alias-label-secondary, #646a73); background: transparent; font: inherit; font-size: 12px; white-space: nowrap; cursor: pointer; }
.dim-directoryHidden:focus-visible { outline: 2px solid color-mix(in srgb, var(--dim-blue) 65%, white); outline-offset: 2px; }
.dim-directoryHidden:disabled { cursor: not-allowed; opacity: .52; }
.dim-directoryHiddenBox { position: relative; width: 15px; height: 15px; flex: 0 0 15px; border: 1px solid var(--dsw-alias-border-l2, #c9cdd4); border-radius: 4px; background: var(--dsw-alias-bg-layer-1, #fff); }
.dim-directoryHidden[aria-pressed="true"] .dim-directoryHiddenBox { border-color: var(--dim-blue); background: var(--dim-blue); }
.dim-directoryHidden[aria-pressed="true"] .dim-directoryHiddenBox::after { content: ""; position: absolute; left: 4px; top: 1px; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.dim-directoryPickerNotice { min-width: 0; margin: 0; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 11px; line-height: 1.45; text-align: right; }
.dim-directoryPickerActions { display: flex; gap: 8px; }
.dim-directoryPickerActions button { min-height: 36px; padding: 0 14px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 13px; font-weight: 560; white-space: nowrap; cursor: pointer; }
.dim-directoryPickerActions .dim-directoryPickerPrimary { border-color: var(--dim-blue); color: #fff; background: var(--dim-blue); }
.dim-directoryPickerActions button:hover:not(:disabled) { filter: brightness(.97); }
.dim-directoryPickerActions button:disabled { cursor: not-allowed; opacity: .52; }
.dim-panel .dim-cardSummary { min-width: 0; color: var(--dsw-alias-label-secondary, #646a73); font: inherit; font-size: 12px; font-weight: 400; line-height: normal; overflow-wrap: anywhere; white-space: normal; }
.dim-panel .dim-cardFooterLayout { min-width: 0; width: 100%; display: flex; flex-direction: column; align-items: stretch; gap: 9px; }
.dim-panel .dim-cardFooterLayout > .dim-cardActions { align-self: stretch; }
.dim-panel .dim-cardFeedback { width: 100%; padding: 8px 10px; border-radius: 8px; color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-module-platform, #f7f8fa); font: inherit; font-size: 12px; font-weight: 400; line-height: 18px; overflow-wrap: anywhere; white-space: normal; }
.dim-panel .dim-cardActions { flex: none; width: 100%; display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin: 0; }
.dim-panel .dim-cardActions .dim-cardAction { flex: none; min-height: 32px; padding: 0 11px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 13px; font-weight: 560; line-height: normal; white-space: nowrap; }
.dim-panel .dim-cardActions .dim-cardAction:hover:not(:disabled) { border-color: #aeb3bb; background: var(--dsw-alias-interactive-bg-hover, #f7f8fa); }
.dim-panel .dim-cardActions .dim-cardAction[data-kind="danger"] { color: var(--dsw-alias-state-error-primary, #d54941); }
/* Header tooltips may extend beyond the card; the collapsible body clips its own content. */
.dim-panel .dim-botCard { position: relative; min-width: 0; width: 100%; max-width: 100%; overflow: visible; border: 1px solid var(--dsw-alias-border-l2, #e5e6eb); border-radius: 14px; background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: 0 1px 2px rgb(31 35 41 / 3%); }
.dim-panel .dim-botCard::before { display: none; }
.dim-panel .dim-botCardBody { position: relative; min-width: 0; width: 100%; max-width: 100%; padding: 12px 8px; }
.dim-collapsibleAccount { min-width: 0; display: flex; flex-direction: column; }
.dim-collapsibleHead { min-width: 0; display: flex; align-items: center; gap: 4px; cursor: pointer; user-select: none; -webkit-user-select: none; }
.dim-collapsibleHeaderContent { min-width: 0; flex: 1 1 auto; display: flex; align-items: center; }
/* Keep the original header footprint; center both icons with equal side space. */
.dim-accountSettingsToggle { flex: none; width: 45px; height: 32px; display: inline-flex; gap: 5px; align-items: center; justify-content: center; padding: 0; border: 0; border-radius: 8px; color: var(--dsw-alias-state-business-primary, #3370ff); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 8%, var(--dsw-alias-bg-layer-1, #fff)); cursor: pointer; }
.dim-accountSettingsToggle > svg { flex: none; display: block; }
.dim-accountSettingsToggle:hover { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 14%, var(--dsw-alias-bg-layer-1, #fff)); }
.dim-accountSettingsToggle:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }
.dim-collapsibleChevron { width: 12px; height: 16px; transition: transform .22s cubic-bezier(.4, 0, .2, 1); transform-origin: 50% 50%; }
.dim-accountSettingsToggle[aria-expanded="true"] .dim-collapsibleChevron { transform: rotate(180deg); }
.dim-accountSettingsHeader { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; padding-top: 8px; border-top: 1px solid var(--dsw-alias-border-l2, #e5e6eb); color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; }
/* Animate height without measuring content; hide collapsed controls from focus and accessibility. */
.dim-collapsibleBody { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .22s cubic-bezier(.4, 0, .2, 1); }
.dim-collapsibleAccount.is-open > .dim-collapsibleBody { grid-template-rows: 1fr; }
.dim-collapsibleBodyInner { min-height: 0; overflow: hidden; }
.dim-collapsibleAccount:not(.is-open) .dim-collapsibleBodyInner { visibility: hidden; }
/* Reclaim horizontal spacing for names while keeping status on the same row,
   including when a channel's mobile stylesheet requests a column layout. */
.dim-panel .dim-botCardTop { min-width: 0; width: 100%; max-width: 100%; display: flex; flex-direction: row; flex-wrap: nowrap; align-items: flex-start; justify-content: space-between; gap: 6px; }
.dim-panel .dim-botIdentity { min-width: 0; flex: 1 1 0; display: flex; align-items: center; gap: 6px; }
.dim-panel .dim-botAvatar { flex: none; width: 38px; height: 38px; display: grid; place-items: center; overflow: hidden; border-radius: 11px; box-shadow: none; }
.dim-panel .dim-botAvatar svg { width: 27px; height: 27px; }
.dim-panel .dim-botName { min-width: 0; flex: 1; }
.dim-panel .dim-aliasName { gap: 2px; }
.dim-panel .dim-botName h3 { overflow: hidden; margin: 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 15px; font-weight: 650; line-height: normal; text-overflow: ellipsis; white-space: nowrap; }
.dim-panel .dim-botName p { overflow: hidden; margin: 4px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font: 12px ui-monospace, SFMono-Regular, monospace; line-height: normal; text-overflow: ellipsis; white-space: nowrap; }
.dim-panel .dim-botCardTools { flex: none; display: flex; align-items: flex-start; gap: 4px; }
.dim-panel .dim-botHealthGroup { min-width: 0; max-width: 100%; flex: none; display: grid; justify-items: end; gap: 5px; }
.dim-panel .dim-botCard .dim-botHealth { flex: none; min-height: 0; display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; border-radius: 0; color: var(--dsw-alias-label-secondary, #646a73); background: transparent; font: inherit; font-size: 12px; font-weight: 400; line-height: normal; white-space: nowrap; }
.dim-panel .dim-lastChecked { display: inline-flex; align-items: baseline; gap: 4px; color: var(--dsw-alias-label-tertiary, #8f959e); font: inherit; font-size: 11px; font-weight: 400; line-height: normal; white-space: nowrap; }
.dim-panel .dim-botCard .dim-healthDot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: #aeb3bb; box-shadow: none; }
.dim-panel .dim-botCard .dim-healthDot[data-tone="success"] { background: var(--dsw-alias-state-success-primary, #20a162); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary, #20a162) 14%, transparent); }
.dim-panel .dim-botCard .dim-healthDot[data-tone="warning"] { background: var(--dsw-alias-state-warn-primary, #d97706); }
.dim-panel .dim-botCard .dim-healthDot[data-tone="error"] { background: var(--dsw-alias-state-error-primary, #d54941); }
.dim-botSettingsAction { position: relative; flex: none; display: inline-flex; }
.dim-botSettingsButton { min-height: 32px; display: inline-flex; align-items: center; gap: 6px; padding: 0 6px; border: 0; border-radius: 8px; color: var(--dsw-alias-state-business-primary, #3370ff); background: transparent; font: inherit; font-size: 12px; white-space: nowrap; cursor: pointer; transition: color .15s ease, background .15s ease; }
.dim-botSettingsButton:hover { color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-interactive-bg-hover, #eef0f3); }
.dim-botSettingsButton:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }
.dim-moreSettingsChevron { width: 6px; height: 6px; margin-right: 2px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(-45deg); }
.dim-deliveryPage { min-width: 0; display: grid; }
.dim-deliveryHeader { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.dim-botSettingsTabsBar { min-width: 0; display: flex; align-items: center; gap: 4px; margin-top: 10px; border-bottom: 1px solid var(--dsw-alias-border-l2, #dfe1e5); }
.dim-botSettingsTabs { min-width: 0; flex: 1; overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; }
.dim-botSettingsTabs::-webkit-scrollbar { display: none; }
.dim-botSettingsTabsList { width: max-content; min-width: 100%; display: flex; align-items: flex-end; gap: 24px; }
.dim-botSettingsScroll { flex: 0 0 30px; width: 30px; height: 32px; display: inline-flex; align-items: center; justify-content: center; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-secondary, #646a73); cursor: pointer; }
.dim-botSettingsScroll:hover:not(:disabled) { color: var(--dsw-alias-state-business-primary, #3370ff); background: var(--dsw-alias-interactive-bg-hover, #eef0f3); }
.dim-botSettingsScroll:disabled { opacity: .3; cursor: default; }
.dim-botSettingsScroll:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: -2px; }
.dim-botSettingsTab { position: relative; min-height: 38px; flex: none; display: inline-flex; align-items: center; justify-content: center; padding: 6px 2px 9px; border: 0; color: var(--dsw-alias-label-secondary, #646a73); background: transparent; font: inherit; font-size: 13px; line-height: 20px; font-weight: 560; white-space: nowrap; cursor: pointer; transition: color .15s ease; }
.dim-botSettingsTab::after { content: ''; position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; border-radius: 2px 2px 0 0; background: transparent; transform: scaleX(.45); transition: background .15s ease, transform .15s ease; }
.dim-botSettingsTab:hover:not([aria-selected="true"]) { color: var(--dsw-alias-label-primary, #1f2329); }
.dim-botSettingsTab[aria-selected="true"] { color: var(--dsw-alias-state-business-primary, #3370ff); font-weight: 650; }
.dim-botSettingsTab[aria-selected="true"]::after { background: var(--dsw-alias-state-business-primary, #3370ff); transform: scaleX(1); }
.dim-botSettingsTab:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: -2px; border-radius: 5px; }
.dim-botSettingsTabPanel { min-width: 0; display: grid; gap: 14px; padding-top: 14px; }
.dim-feishuGroupSettings { min-width: 0; display: grid; gap: 14px; }
.dim-feishuGroupControls { min-width: 0; display: grid; gap: 12px; }
.dim-feishuGroupControl { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; padding: 16px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 12px; background: var(--dsw-alias-bg-layer-3, #fff); }
.dim-feishuGroupControlHeader { position: relative; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dim-feishuGroupControlHeader h3 { min-width: 0; margin: 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 14px; line-height: 21px; font-weight: 650; }
.dim-feishuGroupControlStatus { flex: none; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 11px; line-height: 17px; }
.dim-feishuGroupSelect { min-width: 0; width: 100%; height: 38px; padding: 0 34px 0 11px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 13px; line-height: 38px; cursor: pointer; transition: border-color .15s ease, box-shadow .15s ease; }
.dim-feishuGroupSelect:hover:not(:disabled) { border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 42%, var(--dsw-alias-border-l2, #dfe1e5)); }
.dim-feishuGroupSelect:focus-visible { outline: none; border-color: var(--dsw-alias-state-business-primary, #3370ff); box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 15%, transparent); }
.dim-feishuGroupSelect:disabled { cursor: not-allowed; opacity: .55; }
.dim-feishuGroupHelp { margin: -2px 0 0; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 12px; line-height: 19px; }
.dim-feishuVoiceForm { min-width: 0; display: grid; gap: 10px; }
.dim-feishuVoiceField { min-width: 0; display: grid; gap: 5px; }
.dim-feishuVoiceLabel { color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 18px; }
.dim-feishuVoiceInput { min-width: 0; width: 100%; height: 36px; padding: 0 11px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 13px; line-height: 36px; transition: border-color .15s ease, box-shadow .15s ease; }
.dim-feishuVoiceInput:hover:not(:disabled) { border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 42%, var(--dsw-alias-border-l2, #dfe1e5)); }
.dim-feishuVoiceInput:focus-visible { outline: none; border-color: var(--dsw-alias-state-business-primary, #3370ff); box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 15%, transparent); }
.dim-feishuVoiceInput:disabled { cursor: not-allowed; opacity: .55; }
.dim-feishuVoiceActions { display: flex; justify-content: flex-start; }
.dim-feishuVoiceSave { height: 34px; padding: 0 15px; border: 1px solid var(--dsw-alias-state-business-primary, #3370ff); border-radius: 8px; color: var(--dsw-alias-state-business-primary, #3370ff); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 13px; line-height: 32px; cursor: pointer; transition: border-color .15s ease, color .15s ease, background .15s ease; }
.dim-feishuVoiceSave:hover:not(:disabled) { color: #0f5fce; border-color: #0f5fce; background: color-mix(in srgb, #3370ff 6%, var(--dsw-alias-bg-layer-1, #fff)); }
.dim-feishuVoiceSave:disabled { cursor: not-allowed; opacity: .55; }
.dim-feishuGroupPermissionAction { display: flex; justify-content: flex-start; }
.dim-feishuGroupPermissionAction .dim-deliveryButton { color: var(--dsw-alias-state-business-primary, #3370ff); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 30%, var(--dsw-alias-border-l2, #dfe1e5)); }
.dim-feishuGroupError, .dim-feishuGroupRefreshError { margin: 0; padding: 9px 11px; border-radius: 8px; font-size: 12px; line-height: 18px; }
.dim-feishuGroupError, .dim-feishuGroupRefreshError { color: var(--dsw-alias-state-error-primary, #d54941); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 7%, var(--dsw-alias-bg-layer-1, #fff)); }
.dim-feishuPanelList { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
.dim-feishuPanelRow { min-width: 0; display: grid; grid-template-columns: max-content minmax(0, 1fr) max-content; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l1, #eef0f3); border-radius: 9px; background: var(--dsw-alias-bg-module-platform, #f7f8fa); }
.dim-feishuPanelIndex { min-width: 18px; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 11px; line-height: 17px; text-align: right; }
.dim-feishuPanelCommand { min-width: 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
.dim-feishuPanelRowActions, .dim-feishuPanelAdd { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.dim-feishuPanelRow .dim-deliveryButton { min-height: 28px; padding: 0 9px; font-size: 12px; }
.dim-feishuPanelAdd { margin-top: 2px; }
.dim-feishuPanelAdd .dim-feishuGroupSelect { flex: 1 1 220px; width: auto; }
.dim-feishuPanelFooter { display: flex; justify-content: flex-start; }
.dim-feishuGroupAuthorization { min-width: 0; display: grid; grid-template-columns: 184px minmax(0, 1fr); align-items: start; gap: 24px; padding: 18px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 30%, var(--dsw-alias-border-l2, #dfe1e5)); border-radius: 12px; background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 2.5%, var(--dsw-alias-bg-layer-3, #fff)); }
.dim-feishuGroupAuthorizationState { min-height: 126px; grid-template-columns: 32px minmax(0, 1fr); align-items: center; }
.dim-feishuGroupAuthorizationState h3, .dim-feishuGroupAuthorizationError h3, .dim-feishuGroupAuthorizationCopy h3 { margin: 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 16px; line-height: 24px; font-weight: 650; }
.dim-feishuGroupAuthorizationState p, .dim-feishuGroupAuthorizationError p, .dim-feishuGroupAuthorizationCopy > p { margin: 5px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 19px; }
.dim-feishuGroupSpinner { width: 24px; height: 24px; border: 3px solid var(--dsw-alias-border-l2, #dfe1e5); border-top-color: var(--dsw-alias-state-business-primary, #3370ff); border-radius: 50%; animation: dim-spin .8s linear infinite; }
.dim-feishuGroupAuthorizationError { grid-template-columns: minmax(0, 1fr) max-content; align-items: center; border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 28%, var(--dsw-alias-border-l2, #dfe1e5)); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 4%, var(--dsw-alias-bg-layer-3, #fff)); }
.dim-feishuGroupAuthorizationError code { display: inline-block; margin-top: 6px; color: var(--dsw-alias-label-tertiary, #8f959e); font: 11px/17px ui-monospace, SFMono-Regular, Menlo, monospace; }
.dim-feishuGroupQrColumn { min-width: 0; }
.dim-feishuGroupQrFrame { position: relative; width: 176px; height: 176px; display: grid; place-items: center; padding: 10px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 11px; background: #fff; box-shadow: 0 6px 18px rgb(31 35 41 / 7%); }
.dim-feishuGroupQrFrame img { width: 100%; height: 100%; display: block; object-fit: contain; }
.dim-feishuGroupQrFallback { width: 100%; height: 100%; display: grid; place-content: center; justify-items: center; gap: 7px; border-radius: 7px; color: var(--dsw-alias-state-business-primary, #3370ff); background: #f7f9ff; text-align: center; }
.dim-feishuGroupQrFallback span { color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 17px; }
.dim-feishuGroupQrExpired { position: absolute; inset: 10px; display: grid; place-content: center; gap: 2px; border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: rgb(255 255 255 / 94%); backdrop-filter: blur(3px); text-align: center; }
.dim-feishuGroupQrExpired span { font-size: 13px; line-height: 20px; font-weight: 650; }
.dim-feishuGroupQrExpired small { color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 17px; }
.dim-feishuGroupCountdown { width: 176px; display: grid; grid-template-columns: minmax(0, 1fr) max-content; gap: 5px 10px; margin-top: 9px; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 11px; line-height: 17px; font-variant-numeric: tabular-nums; }
.dim-feishuGroupCountdown strong { color: var(--dsw-alias-label-secondary, #646a73); font-weight: 600; }
.dim-feishuGroupProgress { grid-column: 1 / -1; height: 3px; overflow: hidden; border-radius: 99px; background: var(--dsw-alias-bg-module-platform, #f2f3f5); }
.dim-feishuGroupProgress > span { display: block; height: 100%; border-radius: inherit; background: var(--dsw-alias-state-business-primary, #3370ff); transition: width 1s linear; }
.dim-feishuGroupAuthorizationCopy { min-width: 0; }
.dim-feishuGroupAuthorizationEyebrow { display: block; margin-bottom: 7px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 17px; font-weight: 600; }
.dim-feishuGroupAuthorizationCopy ol { display: grid; gap: 6px; margin: 13px 0 0; padding-left: 18px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 18px; }
.dim-feishuGroupAuthorizationActions { display: flex; align-items: center; justify-content: flex-start; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.dim-feishuGroupAuthorizationLink { text-decoration: none; }
.dim-deliveryDocsLink { min-height: 30px; flex: none; display: inline-flex; align-items: center; gap: 4px; padding: 5px 8px; border-radius: 7px; color: var(--dsw-alias-state-business-primary, #3370ff); font-size: 12px; line-height: 18px; text-decoration: none; white-space: nowrap; }
.dim-deliveryDocsLink:hover { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 8%, transparent); }
.dim-deliveryDocsLink:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }
.dim-deliveryButton { min-height: 30px; display: inline-flex; align-items: center; justify-content: center; padding: 5px 10px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 12px; line-height: 18px; cursor: pointer; }
.dim-deliveryButton:hover:not(:disabled) { border-color: #aeb3bb; background: var(--dsw-alias-interactive-bg-hover, #eef0f3); }
.dim-deliveryButton:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }
.dim-deliveryButton:disabled { opacity: .5; cursor: not-allowed; }
.dim-deliveryButton[data-kind="primary"] { border-color: var(--dsw-alias-state-business-primary, #3370ff); color: #fff; background: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-deliveryButton[data-kind="danger"] { color: var(--dsw-alias-state-error-primary, #d54941); }
.dim-deliveryBack { flex: none; border-color: transparent; background: transparent; }
.dim-deliveryIdentity, .dim-deliveryTargets { min-width: 0; padding: 16px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 12px; background: var(--dsw-alias-bg-layer-3, #fff); }
.dim-deliveryIdentityHeading { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dim-deliveryBotName, .dim-deliverySectionHeading h3 { min-width: 0; overflow: hidden; margin: 0; font-size: 15px; line-height: 22px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.dim-deliveryIdentity > div:first-child p, .dim-deliverySectionHeading p { margin: 2px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 18px; }
.dim-deliveryBotId { min-width: 0; display: grid; grid-template-columns: max-content minmax(0, 1fr) max-content; align-items: center; gap: 10px; margin-top: 12px; padding: 10px 12px; border-radius: 9px; background: var(--dsw-alias-bg-module-platform, #f7f8fa); }
.dim-deliveryBotId > span { color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; }
.dim-deliveryBotId code { min-width: 0; overflow: hidden; font: 12px/18px ui-monospace, SFMono-Regular, Menlo, monospace; text-overflow: ellipsis; white-space: nowrap; }
.dim-deliverySectionHeading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dim-deliveryState { margin-top: 14px; padding: 24px 16px; border: 1px dashed var(--dsw-alias-border-l2, #dfe1e5); border-radius: 10px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 19px; text-align: center; }
.dim-deliveryState p { margin: 5px 0; }
.dim-deliveryEmpty strong { color: var(--dsw-alias-label-primary, #1f2329); font-size: 13px; }
.dim-targetList { display: grid; gap: 10px; margin: 14px 0 0; padding: 0; list-style: none; }
.dim-targetRow { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) max-content; gap: 8px 14px; padding: 13px; border: 1px solid var(--dsw-alias-border-l1, #eef0f3); border-radius: 10px; background: var(--dsw-alias-bg-layer-1, #fff); }
.dim-targetSummary { min-width: 0; }
.dim-targetTitle { min-width: 0; display: flex; align-items: center; gap: 7px; }
.dim-targetTitle strong { overflow: hidden; font-size: 13px; line-height: 20px; font-weight: 620; text-overflow: ellipsis; white-space: nowrap; }
.dim-targetTitle span { flex: none; padding: 1px 6px; border-radius: 5px; color: var(--dsw-alias-state-business-primary, #3370ff); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 9%, transparent); font-size: 10px; line-height: 16px; }
.dim-targetSummary code { display: block; overflow: hidden; margin-top: 3px; color: var(--dsw-alias-label-secondary, #646a73); font: 11px/17px ui-monospace, SFMono-Regular, Menlo, monospace; text-overflow: ellipsis; white-space: nowrap; }
.dim-targetActions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; flex-wrap: wrap; }
.dim-targetSessionSync { grid-column: 1 / -1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 9px; border-top: 1px solid var(--dsw-alias-border-l1, #eef0f3); cursor: pointer; }
.dim-targetSessionSyncCopy { min-width: 0; display: grid; gap: 1px; }
.dim-targetSessionSyncCopy strong { color: var(--dsw-alias-label-primary, #1f2329); font-size: 12px; line-height: 18px; font-weight: 600; }
.dim-targetSessionSyncCopy small { color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 17px; }
.dim-targetSessionSync input { width: 16px; height: 16px; flex: none; margin: 0; accent-color: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-targetSessionSync:has(input:disabled) { cursor: default; }
.dim-targetFeedback { grid-column: 1 / -1; margin: 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 17px; }
.dim-targetFeedback[data-tone="success"] { color: var(--dsw-alias-state-success-primary, #20a162); }
.dim-targetFeedback[data-tone="error"], .dim-targetFormError { color: var(--dsw-alias-state-error-primary, #d54941); }
.dim-targetDeleteConfirm { grid-column: 1 / -1; padding: 10px 12px; border-radius: 8px; background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 7%, var(--dsw-alias-bg-layer-1, #fff)); }
.dim-targetDeleteConfirm p { margin: 0 0 8px; font-size: 12px; line-height: 18px; }
.dim-targetSuggestions { margin-top: 14px; padding: 14px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 10px; background: var(--dsw-alias-bg-module-platform, #f7f8fa); }
.dim-targetSuggestionHeading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dim-targetSuggestionHeading h3 { margin: 0; font-size: 14px; line-height: 21px; }
.dim-targetSuggestionHeading p { margin: 2px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 17px; }
.dim-targetSuggestionState { margin-top: 12px; padding: 18px 12px; border: 1px dashed var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 18px; text-align: center; }
.dim-targetSuggestionState p { margin: 4px 0; }
.dim-targetSuggestionState strong { color: var(--dsw-alias-label-primary, #1f2329); }
.dim-targetSuggestionField { min-width: 0; display: grid; gap: 5px; margin-top: 12px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 16px; }
.dim-targetSuggestionField select { width: 100%; min-width: 0; height: 38px; padding: 0 10px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 12px; cursor: pointer; }
.dim-targetSuggestionField select:focus { outline: 2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 28%, transparent); border-color: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-targetForm { margin-top: 14px; padding: 14px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 10px; background: var(--dsw-alias-bg-module-platform, #f7f8fa); }
.dim-targetFormHeading h3 { margin: 0; font-size: 14px; line-height: 21px; }
.dim-targetFormHeading p { margin: 2px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 17px; }
.dim-targetFormGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px 12px; margin-top: 12px; }
.dim-targetField { min-width: 0; display: grid; align-content: start; gap: 5px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 16px; }
.dim-targetField input, .dim-targetField select { width: 100%; min-width: 0; height: 34px; padding: 0 9px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 7px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 12px; }
.dim-targetField input:focus, .dim-targetField select:focus { outline: 2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 28%, transparent); border-color: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-targetField input[readonly] { color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-module-platform, #f7f8fa); }
.dim-targetFormError { margin: 10px 0 0; font-size: 12px; line-height: 18px; }
.dim-targetFormActions { display: flex; justify-content: flex-end; gap: 7px; margin-top: 12px; }
.dim-dsBotForm { margin-top: 20px; }
.dim-dsBotForm .dim-targetFormGrid { grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); margin-top: 0; gap: 16px; }
.dim-dsBotForm .dim-targetFormActions { margin-top: 16px; }
.dim-targetRow.dim-dsBotBinding { grid-template-columns: minmax(0, 1fr) max-content; align-items: center; }
.dim-dsBotDestination { margin: 3px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
.dim-dsBotNotice { margin: 20px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 20px; }
.dim-dsBotNotice p { margin: 0 0 10px; }
.dim-dsBotSettings > .dim-targetFeedback { margin-top: 12px; }
.dim-dsBotAvatar { display: block; flex: none; object-fit: cover; border-radius: 5px; }
.dim-dsBotBoundIdentity { display: flex; align-items: center; gap: 10px; min-width: 0; }
.dim-dsBotPicker { position: relative; min-width: 0; }
.dim-dsBotPickerTrigger { display: flex; align-items: center; gap: 8px; width: 100%; height: 34px; padding: 0 9px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 7px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
.dim-dsBotPickerName { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dim-dsBotPickerTrigger:focus-visible { outline: 2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 28%, transparent); border-color: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-dsBotPickerTrigger:disabled { opacity: .5; cursor: not-allowed; }
.dim-dsBotOptions { position: absolute; z-index: 20; inset: calc(100% + 5px) 0 auto; max-height: 240px; overflow-y: auto; padding: 4px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 9px; background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: 0 5px 18px rgb(0 0 0 / 10%); }
.dim-dsBotOptions > button { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 36px; padding: 5px 8px; border: 0; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-primary, #1f2329); font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
.dim-dsBotOptions > button[data-active="true"] { background: var(--dsw-alias-interactive-bg-hover, #eef0f3); }
.dim-dsBotOptions > button[aria-selected="true"] { color: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-accessPage { min-width: 0; display: grid; gap: 14px; }
.dim-accessScene { position: relative; min-width: 0; margin: 0; padding: 16px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 12px; background: var(--dsw-alias-bg-layer-3, #fff); }
.dim-accessScene > legend { padding: 0 6px; color: var(--dsw-alias-label-primary, #1f2329); font-size: 15px; line-height: 22px; font-weight: 650; }
.dim-accessLegendContent { display: inline-flex; align-items: center; gap: 6px; }
.dim-panel .dim-accessLegendHelp { position: static; }
.dim-accessLegendHelp .dim-channelTooltip { top: 20px; right: auto; left: 16px; width: min(320px, calc(100% - 32px)); max-width: none; }
.dim-accessControls { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.dim-accessControls[data-mode="allowlist"] { grid-template-columns: minmax(0, 1fr); }
.dim-accessField { min-width: 0; display: grid; align-content: start; gap: 5px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 16px; }
.dim-accessField input, .dim-accessField select { width: 100%; min-width: 0; height: 36px; padding: 0 9px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 7px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 12px; }
.dim-accessField textarea { width: 100%; min-width: 0; padding: 7px 9px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 7px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 12px; line-height: 18px; resize: vertical; }
.dim-accessField textarea:focus { outline: 2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 28%, transparent); border-color: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-accessField textarea:disabled { opacity: .6; }
.dim-groupTriggerValue { color: var(--dsw-alias-label-primary, #1f2329); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
.dim-accessField input:focus, .dim-accessField select:focus { outline: 2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, #3370ff) 28%, transparent); border-color: var(--dsw-alias-state-business-primary, #3370ff); }
.dim-accessUsers { min-width: 0; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--dsw-alias-border-l1, #eef0f3); }
.dim-accessUsersHeading { position: relative; min-width: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dim-accessUsersHeading > div { min-width: 0; }
.dim-accessUsersTitle { display: inline-flex; align-items: center; gap: 6px; }
.dim-accessUsersHeading strong { color: var(--dsw-alias-label-primary, #1f2329); font-size: 13px; line-height: 20px; font-weight: 620; }
.dim-accessUsersHeading p { margin: 2px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 17px; }
.dim-panel .dim-accessUsersHelp { position: static; }
.dim-accessUsersHelp .dim-channelTooltip { top: calc(100% + 7px); right: auto; left: 0; width: min(320px, 100%); max-width: none; }
.dim-accessAddUser { width: 32px; height: 32px; min-height: 32px; flex: 0 0 32px; padding: 0; font-size: 20px; line-height: 1; }
.dim-accessUsersEmpty { margin-top: 10px; padding: 15px 12px; border: 1px dashed var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 12px; line-height: 18px; text-align: center; }
.dim-accessUserList { display: grid; gap: 9px; margin: 10px 0 0; padding: 0; list-style: none; }
.dim-accessUserRow { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(145px, 180px) max-content; align-items: end; gap: 10px; padding: 11px; border: 1px solid var(--dsw-alias-border-l1, #eef0f3); border-radius: 9px; background: var(--dsw-alias-bg-module-platform, #f7f8fa); }
.dim-accessDeleteUser { margin-bottom: 1px; }
.dim-accessUnsupported { padding: 18px 14px; border: 1px dashed var(--dsw-alias-border-l2, #dfe1e5); border-radius: 9px; color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-module-platform, #f7f8fa); text-align: center; }
.dim-accessUnsupported strong { color: var(--dsw-alias-label-primary, #1f2329); font-size: 13px; line-height: 20px; }
.dim-accessUnsupported p { margin: 4px 0 0; font-size: 12px; line-height: 18px; }
.dim-accessState { padding: 11px 13px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary, #d97706) 24%, var(--dsw-alias-border-l2, #dfe1e5)); border-radius: 9px; color: var(--dsw-alias-state-warn-primary, #d97706); background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #d97706) 7%, var(--dsw-alias-bg-layer-1, #fff)); font-size: 12px; line-height: 18px; }
.dim-accessFeedback { margin: 0; padding: 10px 12px; border-radius: 8px; color: var(--dsw-alias-label-secondary, #646a73); background: var(--dsw-alias-bg-module-platform, #f7f8fa); font-size: 12px; line-height: 18px; }
.dim-accessFeedback[data-tone="success"] { color: var(--dsw-alias-state-success-primary, #20a162); }
.dim-accessFeedback[data-tone="error"] { color: var(--dsw-alias-state-error-primary, #d54941); }
.dim-accessActions { display: flex; justify-content: flex-end; }
.dim-botGeneralSettings { min-width: 0; }
.dim-botGeneralList { min-width: 0; display: grid; }
.dim-botGeneralRow { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) max-content; align-items: center; gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--dsw-alias-border-l2, #dfe1e5); }
.dim-botGeneralRow:last-child { border-bottom: 0; }
.dim-botGeneralPanelRow { border-bottom: 0; }
.dim-botGeneralText { min-width: 0; display: grid; gap: 4px; }
.dim-botGeneralTitle { color: var(--dsw-alias-label-primary, #1f2329); font-size: 14px; line-height: 22px; font-weight: 400; }
.dim-botGeneralHelp { margin: 0; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
.dim-botGeneralPanelHelp { padding-bottom: 16px; border-bottom: 1px solid var(--dsw-alias-border-l2, #dfe1e5); }
.dim-botGeneralControl { position: relative; min-width: 0; max-width: 100%; justify-self: end; color: var(--dsw-alias-label-primary, #1f2329); }
.dim-botGeneralControl select, .dim-groupHistoryInput { display: block; min-width: 104px; max-width: 100%; height: 36px; padding: 0 36px 0 14px; border: 0; border-radius: 10px; color: inherit; background: var(--dsw-alias-bg-module-platform, #f5f6f7); font: inherit; font-size: 14px; line-height: 22px; appearance: none; }
.dim-botGeneralControl select { cursor: pointer; }
.dim-sidebarSettings { border-bottom: 1px solid var(--dsw-alias-border-l2, #dfe1e5); }
.dim-sidebarSettings .dim-botGeneralRow { border-bottom: 0; }
.dim-sidebarHeading { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; }
.dim-sidebarFeedback { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; }
.dim-sidebarFeedback .dim-accessFeedback { flex: 1; min-width: 0; }
/* Native option popups do not inherit the select's painted background on
   Windows. Set both colors so dark Host text never lands on a light popup. */
.dim-sidebarSelect option { color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-3, #fff); }
.dim-botGeneralControl select:hover:not(:disabled), .dim-groupHistoryInput:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #eef0f3); }
.dim-botGeneralControl select:focus-visible, .dim-groupHistoryInput:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 2px; }
.dim-botGeneralControl select:disabled, .dim-groupHistoryInput:disabled { opacity: .5; cursor: not-allowed; }
.dim-botGeneralControl svg { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); pointer-events: none; }
.dim-botGeneralControl .dim-contextSwitch { display: block; }
.dim-botGeneralControl .dim-contextSwitch:disabled { opacity: .5; cursor: not-allowed; }
.dim-botGeneralControl .dim-contextSwitch:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3370ff); outline-offset: 3px; }
.dim-botGeneralActions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; padding-top: 16px; }
.dim-generalSettingsPage { min-width: 0; display: grid; }
.dim-generalSettingsHeader { min-width: 0; margin: 0 0 8px; }
.dim-generalSettingsHeader h2 { margin: 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 18px; line-height: 25px; font-weight: 680; }
.dim-generalSettingsTabsBar { min-width: 0; border-bottom: 1px solid var(--dsw-alias-border-l2, #dfe1e5); }
.dim-generalSettingsTabs { min-width: 0; display: flex; align-items: flex-end; gap: 24px; overflow-x: auto; scrollbar-width: none; }
.dim-generalSettingsTabs::-webkit-scrollbar { display: none; }
.dim-generalSettingsTab { position: relative; min-height: 38px; flex: none; display: inline-flex; align-items: center; justify-content: center; padding: 6px 2px 9px; border: 0; color: var(--dsw-alias-label-secondary, #646a73); background: transparent; font: inherit; font-size: 13px; line-height: 20px; font-weight: 560; white-space: nowrap; cursor: pointer; transition: color .15s ease; }
.dim-generalSettingsTab::after { content: ''; position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; border-radius: 2px 2px 0 0; background: transparent; transform: scaleX(.45); transition: background .15s ease, transform .15s ease; }
.dim-generalSettingsTab:hover:not([aria-selected="true"]) { color: var(--dsw-alias-label-primary, #1f2329); }
.dim-generalSettingsTab[aria-selected="true"] { color: var(--dim-blue); font-weight: 650; }
.dim-generalSettingsTab[aria-selected="true"]::after { background: var(--dim-blue); transform: scaleX(1); }
.dim-generalSettingsTab:focus-visible { outline: 2px solid var(--dim-blue); outline-offset: -2px; border-radius: 5px; }
.dim-generalSettingsTabPanel { min-width: 0; padding-top: 14px; }
.dim-groupHistoryControl { width: 104px; }
.dim-groupHistoryInput { box-sizing: border-box; width: 100%; appearance: textfield; }
.dim-groupHistoryInput::-webkit-inner-spin-button, .dim-groupHistoryInput::-webkit-outer-spin-button { margin: 0; appearance: none; }
.dim-groupHistoryUnit { position: absolute; top: 50%; right: 14px; transform: translateY(-50%); color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 18px; pointer-events: none; }
.dim-deliveryButton.dim-groupHistorySave { min-width: 58px; min-height: 36px; border-radius: 10px; }
.dim-groupHistoryFeedback { margin-top: 12px; }

.dim-globalSection { min-width: 0; padding: 14px 16px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 12px; background: var(--dsw-alias-bg-layer-3, #fff); }
.dim-globalSection + .dim-globalSection { margin-top: 12px; }
.dim-imageSettings { container-type: inline-size; }
.dim-imageSettings .dim-globalHead { position: relative; }
.dim-imageSettings .dim-globalTtlHelp { position: static; }
.dim-globalTtlTooltip.dim-imageSettingsTooltip { width: min(320px, 100%); max-width: none; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 17px; white-space: normal; overflow-wrap: anywhere; }
.dim-imageSettingsFields { min-width: 0; display: grid; gap: 12px; margin-top: 12px; }
.dim-imageSettingsField { min-width: 0; display: grid; grid-template-columns: minmax(0, 220px) minmax(0, 160px); align-items: center; gap: 6px 16px; }
.dim-imageSettingsField label { min-width: 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
.dim-imageSettingsField .dim-globalTtlInput { width: 100%; min-width: 0; }
.dim-imageSettingsActions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.dim-globalInline.dim-imageSettingsFeedback { margin: 10px 0 0; }
@container (max-width: 380px) {
  .dim-imageSettingsField { grid-template-columns: minmax(0, 1fr); }
}
.dim-globalHead { min-width: 0; display: flex; align-items: center; }
.dim-globalHeadTitle { min-width: 0; display: inline-flex; align-items: center; gap: 6px; }
.dim-globalHead h3 { min-width: 0; overflow: hidden; margin: 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 15px; line-height: 22px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.dim-globalTtlHelp { position: relative; display: inline-flex; flex: none; }
.dim-globalTtlTooltip { position: absolute; top: calc(100% + 7px); left: 0; z-index: 30; width: max-content; max-width: min(280px, calc(100vw - 48px)); padding: 9px 10px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 10px 28px rgb(31 35 41 / 16%); opacity: 0; visibility: hidden; transform: translateY(-3px); pointer-events: none; transition: opacity .15s ease, transform .15s ease, visibility .15s ease; }
.dim-globalTtlHelp:hover .dim-globalTtlTooltip, .dim-globalTtlHelpButton:focus-visible + .dim-globalTtlTooltip { opacity: 1; visibility: visible; transform: translateY(0); }
.dim-globalTtlHints { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; }
.dim-globalTtlHints li { min-width: 0; display: flex; align-items: baseline; gap: 8px; }
.dim-globalTtlHints code { flex: none; min-width: 44px; padding: 0 6px; border-radius: 5px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-module-platform, #f7f8fa); font: 10px/16px ui-monospace, SFMono-Regular, Menlo, monospace; text-align: center; }
.dim-globalTtlHints span { min-width: 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 16px; }
.dim-globalTtlRow { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 10px; margin-top: 12px; }
.dim-globalTtlInput { width: min(160px, 100%); min-width: 110px; max-width: 160px; flex: 1 1 130px; height: 34px; padding: 0 11px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: 13px ui-monospace, SFMono-Regular, Menlo, monospace; transition: border-color .16s ease, box-shadow .16s ease; }
.dim-globalTtlInput:hover:not(:disabled) { border-color: var(--dsw-alias-border-l3, #bbbfc4); }
.dim-globalTtlInput:focus { outline: none; border-color: var(--dim-blue); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dim-blue) 14%, transparent); }
.dim-globalTtlInput[aria-invalid="true"] { border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 62%, var(--dsw-alias-border-l2, #dfe1e5)); }
.dim-globalTtlInput:disabled { cursor: not-allowed; opacity: .55; }
.dim-globalSaveButton { min-width: 58px; min-height: 34px; }
.dim-globalSweepAction { position: relative; display: inline-flex; flex: none; margin-left: auto; }
.dim-globalSweepButton { flex: none; }
.dim-globalSweepConfirm { position: absolute; top: calc(100% + 8px); right: 0; z-index: 35; width: 218px; padding: 11px 12px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 9px; background: var(--dsw-alias-bg-layer-3, #fff); box-shadow: 0 12px 30px rgb(31 35 41 / 18%); }
.dim-globalSweepConfirm p { margin: 0; color: var(--dsw-alias-label-primary, #1f2329); font-size: 12px; line-height: 18px; }
.dim-globalSweepConfirmActions { display: flex; justify-content: flex-end; gap: 7px; margin-top: 10px; }
.dim-deliveryButton.dim-globalSweepConfirmButton { border-color: var(--dsw-alias-state-error-primary, #d54941); color: #fff; background: var(--dsw-alias-state-error-primary, #d54941); }
.dim-deliveryButton.dim-globalSweepConfirmButton:hover:not(:disabled) { border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 82%, #000); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #d54941) 88%, #000); }
.dim-globalInline { flex: 1 0 100%; min-width: 0; margin: 2px 0 0; color: var(--dsw-alias-label-secondary, #646a73); font-size: 11px; line-height: 16px; overflow-wrap: anywhere; }
.dim-globalInline[data-tone="error"] { color: var(--dsw-alias-state-error-primary, #d54941); }
.dim-panel .dim-botCard .dim-cardFooter { margin-top: 0; }
.dim-panel .ddt-headingCopy { display: none; }
.dim-panel .ddt-qrFrame, .dim-panel .ddt-countdown { width: min(270px, 100%); }
@container (max-width: 680px) {
  .dim-panel .bxf-headingTools, .dim-panel .dxw-tools, .dim-panel .ddt-tools { gap: 6px; }
  .dim-panel .dim-bindActions { gap: 6px; }
  .dim-panel .bxf-headingTools .dim-scanButton, .dim-panel .dxw-tools .dim-scanButton, .dim-panel .ddt-tools .dim-scanButton, .dim-panel .dim-credentialButton { gap: 5px; padding-inline: 8px; font-size: 12px; }
  .dim-panel .dim-actionIcon { width: 13px; height: 13px; flex-basis: 13px; }
  .dim-panel .bxf-headingTools .dim-onlineBadge, .dim-panel .dxw-tools .dim-onlineBadge, .dim-panel .ddt-tools .dim-onlineBadge { padding-inline: 8px; font-size: 11px; }
  .dim-panel .dim-credentialForm { grid-template-columns: minmax(0, 1fr); }
  .dim-panel .dim-credentialError, .dim-panel .dim-credentialActions { grid-column: auto; }
  .dim-panel .dim-emptyView { min-height: 0; grid-template-columns: minmax(0, 1fr); }
  .dim-panel .dim-emptyBrand { display: none; }
  .dim-panel .dim-qrLayout { grid-template-columns: minmax(0, 1fr); justify-items: center; gap: 24px; }
  .dim-panel .dim-qrColumn { width: 100%; min-width: 0; }
  .dim-panel .dim-qrCopy { width: 100%; min-width: 0; overflow-wrap: anywhere; }
  .dim-panel .ddt-qrLayout { grid-template-columns: minmax(0, 1fr); justify-items: center; gap: 24px; }
  .dim-panel .ddt-qrColumn { width: 100%; min-width: 0; }
  .dim-panel .ddt-qrCopy { width: 100%; min-width: 0; overflow-wrap: anywhere; }
  .dim-targetRow { grid-template-columns: minmax(0, 1fr); }
  .dim-targetActions { justify-content: flex-start; }
  .dim-targetFormGrid { grid-template-columns: minmax(0, 1fr); }
  .dim-targetSuggestionHeading { align-items: stretch; flex-direction: column; }
  .dim-accessControls { grid-template-columns: minmax(0, 1fr); }
  .dim-accessUserRow { grid-template-columns: minmax(0, 1fr); }
  .dim-accessDeleteUser { justify-self: start; }
  .dim-feishuGroupAuthorization { grid-template-columns: minmax(0, 1fr); justify-items: center; }
  .dim-feishuGroupAuthorizationCopy { width: 100%; }
  .dim-feishuGroupAuthorizationState { grid-template-columns: 32px minmax(0, 1fr); justify-items: stretch; }
  .dim-feishuGroupAuthorizationError { justify-items: stretch; }
}
@media (max-width: 840px) {
  .dim-title { align-items: flex-start; }
  .dim-layout { grid-template-columns: minmax(0, 1fr); gap: 18px; }
  .dim-rail { grid-template-columns: repeat(2, minmax(0, 1fr)); padding-right: 1px; }
  .dim-divider { display: none; }
  .dim-channel { min-height: 48px; }
}
@media (max-width: 560px) {
  .dim-title { flex-direction: column; gap: 10px; }
  .dim-title p { white-space: normal; }
  .dim-titleActions { justify-content: flex-start; }
  .dim-updateBackdrop { padding: 12px; }
  .dim-updateDialog { max-height: calc(100vh - 24px); }
  .dim-updateDialog h3 { margin: 18px 18px 8px; }
  .dim-updateDescription { margin: 0 18px; }
  .dim-updateBody { padding: 16px 18px; }
  .dim-updateFooter { padding: 12px 18px; }
  .dim-githubTooltip { right: auto; left: 0; }
  .dim-rail { grid-template-columns: minmax(0, 1fr); }
  .dim-loopbackRecovery { align-items: stretch; flex-direction: column; gap: 12px; }
  .dim-loopbackRecoveryAction { width: 100%; }
  .dim-deliverySectionHeading { align-items: stretch; flex-direction: column; }
  .dim-botSettingsTabsList { gap: 18px; }
  .dim-deliveryBotId { grid-template-columns: minmax(0, 1fr) max-content; }
  .dim-deliveryBotId > span { grid-column: 1 / -1; }
  .dim-targetActions .dim-deliveryButton { flex: 1 1 auto; }
  .dim-accessActions .dim-deliveryButton { width: 100%; }
  .dim-feishuGroupAuthorizationActions .dim-deliveryButton { flex: 1 1 auto; }
  .dim-directoryPickerBackdrop { padding: 10px; }
  .dim-directoryPicker { height: calc(100vh - 20px); min-height: 0; border-radius: 14px; }
  .dim-directoryPickerHeader { padding: 18px 17px 14px; }
  .dim-directoryPickerHeader h3 { font-size: 18px; }
  .dim-directoryPathMeta span { display: none; }
  .dim-directoryPickerBody { padding: 10px; }
  .dim-directoryPickerFooter { grid-template-columns: minmax(0, 1fr) max-content; gap: 10px; padding: 13px 14px; }
  .dim-directoryPickerNotice { grid-column: 1 / -1; grid-row: 1; text-align: left; }
}
@media (prefers-reduced-motion: reduce) {
  .dim-page * { transition-duration: .01ms !important; }
  .dim-directoryPickerSpinner { animation-duration: 1.8s; }
  .dim-collapsibleBody, .dim-collapsibleChevron { transition: none !important; }
}
`;
function installImStyles() {
  if (typeof document === "undefined") return () => {
  };
  const existing = document.querySelector(`style[data-plugin-css="${IM_STYLE_ID}"]`);
  if (existing) return () => {
  };
  const style = document.createElement("style");
  style.dataset.plugin = "@xmanrui/dsh-im";
  style.dataset.pluginCss = IM_STYLE_ID;
  style.textContent = CSS3;
  document.head.appendChild(style);
  return () => style.remove();
}

// src/channels/shared/session-channel-labels.mjs
var SESSION_CHANNEL_LABELS = Object.freeze(Object.fromEntries(Object.entries({
  weixin: ["\u5FAE\u4FE1", "WeChat"],
  feishu: ["\u98DE\u4E66", "Feishu"],
  dingtalk: ["\u9489\u9489", "DingTalk"],
  wecom: ["\u4F01\u4E1A\u5FAE\u4FE1", "WeCom"],
  qq: ["QQ", "QQ"],
  slack: ["Slack", "Slack"],
  telegram: ["Telegram", "Telegram"],
  discord: ["Discord", "Discord"],
  whatsapp: ["WhatsApp", "WhatsApp"],
  imessage: ["iMessage", "iMessage"],
  matrix: ["Matrix", "Matrix"],
  office: ["AI Office", "AI Office"]
}).map(([channel, labels]) => [channel, Object.freeze(labels)])));
function parseSessionChannelTitle(title) {
  if (typeof title !== "string") return null;
  for (const [channel, labels] of Object.entries(SESSION_CHANNEL_LABELS)) {
    for (const label of labels) {
      const prefix = `${label} \xB7 `;
      if (title.startsWith(prefix) && title.slice(prefix.length).trim()) {
        return { channel, title: title.slice(prefix.length) };
      }
    }
  }
  return null;
}

// plugin-src/client/session-channel-logos.js
var GLYPHS = Object.freeze({
  weixin: [WeixinLogoGlyph, "#07c160"],
  feishu: [FeishuLogoGlyph, "#3370ff"],
  dingtalk: [DingtalkLogoGlyph, "#1677ff"],
  wecom: [WecomLogoGlyph2, "#3370ff"],
  qq: [QqLogoGlyph, "#12b7f5"],
  slack: [SlackLogoGlyph, "#e01e5a"],
  telegram: [TelegramLogoGlyph, "#229ed9"],
  discord: [DiscordLogoGlyph, "#5865f2"],
  whatsapp: [WhatsappLogoGlyph, "#25d366"],
  imessage: [IMessageLogoGlyph, "#3478f6"],
  matrix: [MatrixLogoGlyph, "#1a8f6f"],
  office: [OfficeLogoGlyph, "#f97316"]
});
var CHANNEL_ATTR = "data-dsh-im-session-channel";
var TITLE_ATTR = "data-dsh-im-session-text";
var MARKED = `[${CHANNEL_ATTR}]`;
var ROW = '[role="treeitem"][aria-selected]';
var SVG_NS = "http://www.w3.org/2000/svg";
var installations = /* @__PURE__ */ new WeakMap();
function hasClassPart(element, part) {
  return [...element.classList].some((token) => token.split(/[_-]/u).includes(part));
}
function titleOf(row) {
  if (!row.matches(ROW) || row.closest('input, textarea, [contenteditable]:not([contenteditable="false"])')) return null;
  let title;
  if (row.tagName === "DIV" && hasClassPart(row, "sessionRow")) {
    title = [...row.children].find((child) => child.tagName === "SPAN" && hasClassPart(child, "title"));
  } else if (row.tagName === "BUTTON" && hasClassPart(row, "searchResultRow")) {
    const heading = [...row.children].find((child) => hasClassPart(child, "searchResultHeading"));
    title = heading && [...heading.children].find((child) => child.tagName === "SPAN" && hasClassPart(child, "searchResultTitle"));
  }
  return title?.childNodes.length === 1 && title.firstChild.nodeType === 3 ? title : null;
}
function logoUri(document2, channel) {
  const [Glyph, color] = GLYPHS[channel];
  const render = (node) => {
    if (!["svg", "path"].includes(node.type)) throw new Error("Unsupported channel logo element");
    const element = document2.createElementNS(SVG_NS, node.type);
    for (const [name2, value] of Object.entries(node.props)) {
      if (name2 === "children") continue;
      const attribute = name2.startsWith("stroke") ? name2.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`) : name2;
      element.setAttribute(attribute, String(value));
    }
    for (const child of [node.props.children].flat().filter(Boolean)) element.appendChild(render(child));
    return element;
  };
  const svg = render(Glyph({ size: 16 }));
  svg.setAttribute("xmlns", SVG_NS);
  svg.setAttribute("color", color);
  return `data:image/svg+xml,${encodeURIComponent(svg.outerHTML)}`;
}
function createInstallation(document2) {
  const view = document2.defaultView;
  const ready = /* @__PURE__ */ new Set();
  const owned = /* @__PURE__ */ new Map();
  const queued = /* @__PURE__ */ new Set();
  const images = [];
  let closed = false;
  let scheduled = false;
  const style = document2.createElement("style");
  style.dataset.pluginCss = "dsh-im-session-channel-logos";
  const uris = Object.fromEntries(Object.keys(GLYPHS).map((channel) => [channel, logoUri(document2, channel)]));
  style.textContent = `
${MARKED}[${TITLE_ATTR}] {
  position: relative;
  -webkit-text-fill-color: transparent;
  text-overflow: clip !important;
  overflow: hidden;
}
${MARKED}[${TITLE_ATTR}]::before {
  content: "";
  position: absolute;
  inset-inline-start: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: var(--dsh-im-session-logo) center / contain no-repeat;
  text-indent: 0;
  pointer-events: none;
}
${MARKED}[${TITLE_ATTR}]::after {
  content: attr(${TITLE_ATTR}) / "";
  position: absolute;
  inset: 0;
  inset-inline-start: 22px;
  -webkit-text-fill-color: currentColor;
  text-indent: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  pointer-events: none;
}
${Object.entries(uris).map(([channel, uri]) => `[${CHANNEL_ATTR}="${channel}"] { --dsh-im-session-logo: url("${uri}"); }`).join("\n")}
`;
  document2.head.appendChild(style);
  const restore = (title) => {
    const previous = owned.get(title);
    if (!previous) return;
    owned.delete(title);
    for (const [attribute, value] of previous) {
      if (value === null) title.removeAttribute(attribute);
      else title.setAttribute(attribute, value);
    }
  };
  const update = (row) => {
    const title = row.isConnected ? titleOf(row) : null;
    for (const marked of row.querySelectorAll(MARKED)) {
      if (marked !== title) restore(marked);
    }
    if (!title) return;
    const parsed = parseSessionChannelTitle(title.textContent);
    if (!parsed || !ready.has(parsed.channel)) {
      restore(title);
      return;
    }
    if (!owned.has(title)) {
      owned.set(title, [CHANNEL_ATTR, TITLE_ATTR].map((attribute) => [attribute, title.getAttribute(attribute)]));
    }
    title.setAttribute(TITLE_ATTR, parsed.title);
    title.setAttribute(CHANNEL_ATTR, parsed.channel);
  };
  const schedule = () => {
    if (closed || scheduled || !queued.size) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (closed) return;
      const rows = [...queued];
      queued.clear();
      for (const row of rows) {
        try {
          update(row);
        } catch {
          for (const marked of row.querySelectorAll(MARKED)) restore(marked);
        }
      }
    });
  };
  const collect = (node, descendants = false) => {
    const element = node.nodeType === 1 ? node : node.parentElement;
    if (!element) return;
    const row = element.closest(ROW);
    if (row) queued.add(row);
    if (descendants) {
      for (const child of element.querySelectorAll(ROW)) queued.add(child);
      const marked = [...element.querySelectorAll(MARKED)];
      if (owned.has(element)) marked.push(element);
      for (const title of marked) {
        const owner = title.closest(ROW);
        if (owner) queued.add(owner);
        else restore(title);
      }
    }
    schedule();
  };
  const observer = new view.MutationObserver((records) => {
    if (closed) return;
    for (const record of records) {
      collect(record.target, record.type === "attributes");
      if (record.type !== "childList") continue;
      for (const node of record.addedNodes) collect(node, true);
      for (const node of record.removedNodes) {
        if (node.nodeType !== 1 || node.isConnected) continue;
        if (owned.has(node)) restore(node);
        for (const title of node.querySelectorAll(MARKED)) restore(title);
      }
    }
  });
  observer.observe(document2.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "role", "aria-selected", "contenteditable"]
  });
  for (const [channel, uri] of Object.entries(uris)) {
    const image = new view.Image();
    images.push(image);
    image.onload = () => {
      if (closed) return;
      ready.add(channel);
      collect(document2.body, true);
    };
    image.src = uri;
  }
  return () => {
    closed = true;
    observer.disconnect();
    queued.clear();
    for (const image of images) image.onload = null;
    for (const title of [...owned.keys()]) restore(title);
    style.remove();
  };
}
function installSessionChannelLogos(document2 = globalThis.document) {
  const view = document2?.defaultView;
  if (!document2?.body || !document2?.head || !view?.MutationObserver || !view?.Image || !view.CSS?.supports?.("content", `attr(${TITLE_ATTR}) / ""`) || !view.CSS.supports("-webkit-text-fill-color", "transparent")) return () => {
  };
  let entry = installations.get(document2);
  if (!entry) {
    try {
      entry = { references: 0, close: createInstallation(document2) };
    } catch {
      return () => {
      };
    }
    installations.set(document2, entry);
  }
  entry.references += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    entry.references -= 1;
    if (entry.references > 0) return;
    entry.close();
    installations.delete(document2);
  };
}

// plugin-src/client/ds-bot-session-avatars.js
var React26 = __toESM(require("react"), 1);
var DS_BOT_SESSIONS_ENDPOINT = "ds-bot.sessions.list";
function installDsBotSessionAvatars(ctx, {
  rpcCall,
  setTimeoutFn = globalThis.setTimeout,
  clearTimeoutFn = globalThis.clearTimeout,
  document: document2 = globalThis.document,
  window: window2 = globalThis.window
}) {
  let refresh = () => {
  };
  const stop = ctx.slots.inject("sidebar.session.row.leading", () => {
    const abort = new AbortController();
    const listeners = /* @__PURE__ */ new Set();
    let bots = /* @__PURE__ */ new Map();
    let signature = "";
    let timer;
    let running = false;
    let revision = 0;
    const publish = (entries) => {
      const next = JSON.stringify(entries);
      if (next === signature) return;
      signature = next;
      bots = new Map(entries.map(({ sessionId, bot }) => [sessionId, bot]));
      for (const listener of listeners) listener();
    };
    const subscribe = (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };
    function SessionAvatar({ sessionId }) {
      const bot = React26.useSyncExternalStore(subscribe, () => bots.get(sessionId) ?? null);
      return bot ? React26.createElement(DsBotAvatar, { bot, size: 16 }) : null;
    }
    const schedule = () => {
      clearTimeoutFn(timer);
      if (!abort.signal.aborted) timer = setTimeoutFn(load, 0);
    };
    const load = async () => {
      if (abort.signal.aborted || running) return;
      running = true;
      const current = revision;
      try {
        const result2 = await rpcCall(DS_BOT_SESSIONS_ENDPOINT, {}, abort.signal);
        if (result2?.ok !== true || !Array.isArray(result2.value)) throw new Error("Unavailable");
        if (!abort.signal.aborted && current === revision) publish(result2.value);
      } catch {
        if (!abort.signal.aborted && current === revision) publish([]);
      } finally {
        running = false;
        if (current !== revision) schedule();
      }
    };
    refresh = () => {
      revision++;
      if (!running) schedule();
    };
    const wake = () => {
      if (!document2?.hidden) refresh();
    };
    window2?.addEventListener("focus", wake);
    document2?.addEventListener("visibilitychange", wake);
    const unregister = ctx.slots.register({
      name: "sidebar.session.row.leading",
      id: "dsh-qq-free-bot-ds-bot-avatar",
      order: 0
    }, SessionAvatar);
    void load();
    return () => {
      abort.abort();
      clearTimeoutFn(timer);
      window2?.removeEventListener("focus", wake);
      document2?.removeEventListener("visibilitychange", wake);
      refresh = () => {
      };
      unregister();
      listeners.clear();
    };
  });
  return { refresh: () => refresh(), dispose: stop };
}

// plugin-src/client/update-panel.js
var React27 = __toESM(require("react"), 1);
var import_react_dom4 = require("react-dom");
var import_valid = __toESM(require_valid(), 1);
var import_rcompare = __toESM(require_rcompare(), 1);
var UPDATE_RPC_CHANNEL = "/dsh-im";
var BLOCKED_REASONS = Object.freeze({
  "source-install": "\u5F53\u524D\u662F\u6E90\u7801\u6216\u94FE\u63A5\u5B89\u88C5\uFF0C\u53EA\u80FD\u68C0\u67E5\u7248\u672C\uFF1B\u8BF7\u624B\u52A8\u66F4\u65B0\u6E90\u7801\uFF0C\u6216\u8FC1\u79FB\u5230 npm \u5B89\u88C5\u3002",
  "unknown-profile": "\u65E0\u6CD5\u786E\u8BA4\u5F53\u524D profile\uFF0C\u8BF7\u5728\u5BF9\u5E94\u7684 Harness \u73AF\u5883\u4E2D\u624B\u52A8\u66F4\u65B0\u3002",
  "unsupported-runtime": "\u5F53\u524D\u8FD0\u884C\u73AF\u5883\u4E0D\u652F\u6301\u6309\u94AE\u5B89\u88C5\uFF0C\u8BF7\u624B\u52A8\u66F4\u65B0\u63D2\u4EF6\u3002",
  "registry-conflict": "\u5F53\u524D npm \u6E90\u914D\u7F6E\u4E0E\u5B98\u65B9\u6E90\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u5148\u68C0\u67E5 registry \u914D\u7F6E\u3002",
  "incompatible-node": "\u5F53\u524D Host \u7684 Node.js \u7248\u672C\u4E0D\u6EE1\u8DB3\u65B0\u7248\u8981\u6C42\uFF0C\u8BF7\u5148\u66F4\u65B0\u8FD0\u884C\u73AF\u5883\u3002",
  "pending-restart": "\u65B0\u7248\u672C\u5DF2\u5B89\u88C5\uFF0C\u8BF7\u5728\u65B9\u4FBF\u65F6\u624B\u52A8\u91CD\u542F\u5F53\u524D Harness \u6216 Desktop\u3002",
  "recovery-required": "\u4E0A\u6B21\u5B89\u88C5\u7ED3\u679C\u65E0\u6CD5\u786E\u8BA4\uFF0C\u8BF7\u5148\u68C0\u67E5\u6B64 profile \u7684\u63D2\u4EF6\u5B89\u88C5\u72B6\u6001\u3002"
});
var ERROR_MESSAGES = Object.freeze({
  "check-failed": "\u65E0\u6CD5\u8BBF\u95EE npm \u6216\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u65B0\u68C0\u67E5\u3002",
  "update-failed": "\u66F4\u65B0\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002",
  "invalid-release": "npm \u8FD4\u56DE\u7684\u7248\u672C\u4FE1\u606F\u65E0\u6548\uFF0C\u6682\u65F6\u65E0\u6CD5\u66F4\u65B0\u3002",
  "check-expired": "\u7248\u672C\u786E\u8BA4\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u68C0\u67E5\u540E\u518D\u5B89\u88C5\u3002",
  "installation-changed": "\u63D2\u4EF6\u5B89\u88C5\u72B6\u6001\u5DF2\u53D1\u751F\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u68C0\u67E5\u3002",
  "update-busy": "\u6B64 profile \u6B63\u5728\u66F4\u65B0\uFF0C\u8BF7\u7A0D\u540E\u67E5\u770B\u72B6\u6001\u3002",
  "install-failed": "\u5B89\u88C5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u5F53\u524D\u5B89\u88C5\u72B6\u6001\u540E\u91CD\u8BD5\u3002",
  "verify-failed": "\u5B89\u88C5\u7ED3\u679C\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u68C0\u67E5\u63D2\u4EF6\u7248\u672C\u3002",
  "state-unavailable": "\u65E0\u6CD5\u5B89\u5168\u4FDD\u5B58\u66F4\u65B0\u72B6\u6001\uFF0C\u8BF7\u5148\u68C0\u67E5\u5F53\u524D\u5B89\u88C5\u7ED3\u679C\u3002",
  interrupted: "\u4E0A\u6B21\u66F4\u65B0\u5DF2\u4E2D\u65AD\uFF0C\u8BF7\u68C0\u67E5\u5B89\u88C5\u72B6\u6001\u540E\u91CD\u8BD5\u3002",
  disposed: "\u66F4\u65B0\u670D\u52A1\u5DF2\u5173\u95ED\uFF0C\u8BF7\u624B\u52A8\u91CD\u65B0\u6253\u5F00\u8BBE\u7F6E\u9875\u3002",
  "bad-request": "\u66F4\u65B0\u8BF7\u6C42\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u68C0\u67E5\u7248\u672C\u3002",
  "invalid-installation": "\u5F53\u524D\u63D2\u4EF6\u5B89\u88C5\u4E0D\u5B8C\u6574\u6216\u4E0E profile \u4E0D\u7B26\uFF0C\u8BF7\u624B\u52A8\u68C0\u67E5\u5B89\u88C5\u914D\u7F6E\u3002",
  "executor-unavailable": BLOCKED_REASONS["unsupported-runtime"],
  "registry-check-failed": "\u65E0\u6CD5\u786E\u8BA4\u5F53\u524D npm \u6E90\u914D\u7F6E\uFF0C\u6682\u65F6\u4E0D\u80FD\u5B89\u88C5\u66F4\u65B0\u3002",
  "install-interrupted": "\u4E0A\u6B21\u66F4\u65B0\u5DF2\u4E2D\u65AD\uFF0C\u8BF7\u68C0\u67E5\u5B89\u88C5\u72B6\u6001\u540E\u91CD\u8BD5\u3002",
  "install-timeout": "\u5B89\u88C5\u8D85\u65F6\uFF0C\u8BF7\u5148\u786E\u8BA4\u5F53\u524D\u5B89\u88C5\u72B6\u6001\uFF0C\u518D\u51B3\u5B9A\u662F\u5426\u91CD\u8BD5\u3002",
  "invalid-version": "npm \u8FD4\u56DE\u7684\u7248\u672C\u4FE1\u606F\u65E0\u6548\uFF0C\u6682\u65F6\u65E0\u6CD5\u66F4\u65B0\u3002"
});

// plugin-src/client/panel-error-boundary.js
var React28 = __toESM(require("react"), 1);
var IMPanelErrorBoundary = class extends React28.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return h3(
      "section",
      { className: "dim-page", role: "alert" },
      h3("p", null, "IM \u9762\u677F\u52A0\u8F7D\u5931\u8D25"),
      h3("button", {
        type: "button",
        onClick: () => this.setState({ failed: false })
      }, "\u91CD\u8BD5")
    );
  }
};

// plugin-src/client/plugin-page.js
var React29 = __toESM(require("react"), 1);
var IM_MAIN_PANEL_ID = "dsh-qq-free-bot";
var h4 = React29.createElement;
function OpenImAction({ subject, packageName, onOpen, t }) {
  if (subject?.kind !== "bundle" && subject?.kind !== "row") return null;
  if (subject.pkg?.name !== packageName) return null;
  if (subject.kind === "row" && subject.row?.moduleName !== packageName) return null;
  return h4("button", {
    type: "button",
    className: "dim-pluginOpen",
    onClick: onOpen
  }, t("\u6253\u5F00 IM\u673A\u5668\u4EBA"));
}
function ImPluginPage({ renderPanel }) {
  return h4(
    "div",
    { className: "dim-pluginPage" },
    h4(
      "div",
      { className: "dim-pluginPageContent" },
      renderPanel()
    )
  );
}
function ImSidebarIcon({ size }) {
  return h4(
    "svg",
    {
      className: "dim-sidebarIcon",
      "aria-hidden": true,
      focusable: false,
      width: size,
      height: size,
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    h4("path", { d: "M5 9.5H3.8L1.5 10.7l.7-2.2A2.4 2.4 0 0 1 1.5 6.8V4A2.5 2.5 0 0 1 4 1.5h4A2.5 2.5 0 0 1 10.5 4v3A2.5 2.5 0 0 1 8 9.5h-.5" }),
    h4("path", { d: "M12 6.5A2.5 2.5 0 0 1 14.5 9v2.8a2.4 2.4 0 0 1-.7 1.7l.7 1.2-2.3-.7H8A2.5 2.5 0 0 1 5.5 11.5V9A2.5 2.5 0 0 1 8 6.5h.5" })
  );
}
function installImPluginPage(ctx, { packageName, renderPanel, sidebarVisible = false }) {
  let visible = sidebarVisible;
  let updateSidebar = null;
  const controller = {
    setSidebarVisible(value) {
      if (typeof value !== "boolean") throw new TypeError("visible must be a boolean");
      visible = value;
      updateSidebar?.();
    }
  };
  if (typeof ctx.inject !== "function") return controller;
  ctx.inject(["layout"], (pageCtx) => pageCtx.slots.inject("main", () => {
    const unregisterPage = pageCtx.slots.register({
      name: "main",
      key: IM_MAIN_PANEL_ID,
      locale: IM_LOCALE_NAMESPACE,
      inject: () => ({ renderPanel })
    }, ImPluginPage);
    let stopSidebar = null;
    const update = () => {
      if (visible === (stopSidebar !== null)) return;
      if (!visible) {
        const stop = stopSidebar;
        stopSidebar = null;
        stop();
        return;
      }
      stopSidebar = pageCtx.slots.inject("sidebar.panellist", () => pageCtx.slots.register({
        name: "sidebar.panellist",
        id: IM_MAIN_PANEL_ID,
        order: 10,
        label: () => pageCtx.locale.bind(IM_LOCALE_NAMESPACE)("IM\u673A\u5668\u4EBA"),
        locale: IM_LOCALE_NAMESPACE
      }, ImSidebarIcon));
    };
    updateSidebar = update;
    update();
    const stopActions = pageCtx.slots.inject("plugins.detail.actions", () => pageCtx.slots.register({
      name: "plugins.detail.actions",
      id: "dsh-qq-free-bot-open",
      order: 20,
      locale: IM_LOCALE_NAMESPACE,
      inject: () => ({
        packageName,
        onOpen: () => pageCtx.layout.selectPanel(IM_MAIN_PANEL_ID)
      })
    }, OpenImAction));
    return () => {
      stopActions();
      updateSidebar = null;
      stopSidebar?.();
      unregisterPage();
    };
  }));
  return controller;
}

// plugin-src/client/index.js
var IM_PLUGIN_VERSION = package_default.version;
function callWorkspaceDirectoryApi(ctx, method, ...args) {
  const uiWorkspace = typeof ctx.get === "function" ? ctx.get("uiWorkspace") : void 0;
  const service = typeof uiWorkspace?.[method] === "function" ? uiWorkspace : ctx.workspaces;
  if (typeof service?.[method] !== "function") {
    throw new Error("\u65E0\u6CD5\u8BFB\u53D6\u76EE\u5F55\uFF0C\u8BF7\u91CD\u8BD5\u3002");
  }
  return service[method](...args);
}
var CHANNELS = Object.freeze([
  { id: "qq", label: "QQ" }
]);
var MODEL_TAB = Object.freeze({ id: "deepseek", label: "\u514D\u5145\u503C DeepSeek", note: "\u8F66\u9053\u4E0E\u515C\u5E95" });
var RAIL_TABS = [...CHANNELS, MODEL_TAB];
function QqLogo() {
  return h3("span", { className: "dim-logo dim-logoQq", "aria-hidden": "true" }, h3(QqLogoGlyph));
}
function ModelGlyph() {
  return h3("svg", {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    focusable: "false",
    "aria-hidden": "true"
  }, h3("path", { d: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z" }));
}
function ChannelLogo({ channel }) {
  if (channel === "deepseek") return h3(ModelGlyph);
  return h3(QqLogo);
}
function LoopbackRecoveryNotice({ recovery, onNavigate = replacePageLocation }) {
  return h3(
    "div",
    {
      className: "dim-loopbackRecovery",
      role: "alert"
    },
    h3(
      "div",
      { className: "dim-loopbackRecoveryCopy" },
      h3("strong", null, "\u8BF7\u6539\u7528 localhost \u91CD\u65B0\u6253\u5F00"),
      h3("p", null, "\u9875\u9762\u4F1A\u5728\u5F53\u524D\u7AEF\u53E3\u91CD\u65B0\u6253\u5F00\uFF0C\u673A\u5668\u4EBA\u914D\u7F6E\u4E0D\u4F1A\u6539\u53D8\u3002"),
      h3("code", null, recovery.origin)
    ),
    h3("button", {
      type: "button",
      className: "dim-loopbackRecoveryAction",
      onClick: () => onNavigate(recovery.url)
    }, "\u4F7F\u7528 localhost \u91CD\u65B0\u6253\u5F00")
  );
}
function IMSettingsTab({
  dingtalkRpcCall,
  discordRpcCall,
  feishuRpcCall,
  imessageRpcCall,
  emailRpcCall,
  matrixRpcCall,
  qqRpcCall,
  slackRpcCall,
  telegramRpcCall,
  wecomRpcCall,
  wecomAppRpcCall,
  weixinRpcCall,
  whatsappRpcCall,
  officeRpcCall,
  updateRpcCall,
  deliveryRpcCall,
  globalSettingsRpcCall,
  workspaceDirectoryPicker,
  laneRpcCall,
  channelRpcCall,
  preferredSectionId,
  browserLocation = globalThis.location,
  navigateToRecoveryUrl = replacePageLocation
}) {
  const [selected, setSelected] = React30.useState(() => preferredSectionId === GLOBAL_SETTINGS_TAB_ID || RAIL_TABS.some((tab) => tab.id === preferredSectionId) ? preferredSectionId : RAIL_TABS[0].id);
  const [loopbackRecovery, setLoopbackRecovery] = React30.useState(null);
  const [runningVersion, setRunningVersion] = React30.useState(IM_PLUGIN_VERSION);
  const [deliverySettings, setDeliverySettings] = React30.useState(null);
  const visibleChannels = RAIL_TABS;
  const githubTooltipId = React30.useId();
  const generalSettingsTooltipId = React30.useId();
  const globalSettingsSelected = selected === GLOBAL_SETTINGS_TAB_ID;
  const active = visibleChannels.find((channel) => channel.id === selected) ?? visibleChannels[0];
  const activeTabId = globalSettingsSelected ? "dim-general-settings-trigger" : `dim-tab-${active.id}`;
  const activePanelId = globalSettingsSelected ? `dim-panel-${GLOBAL_SETTINGS_TAB_ID}` : `dim-panel-${active.id}`;
  const reportLoopbackRecovery = React30.useCallback((recovery) => {
    setLoopbackRecovery((current) => current?.url === recovery.url ? current : recovery);
  }, []);
  const reportUpdateStatus = React30.useCallback((snapshot) => {
    setRunningVersion(snapshot.runningVersion);
  }, []);
  const rpcCalls = React30.useMemo(() => createLoopbackAwareRpcCalls({
    dingtalkRpcCall,
    discordRpcCall,
    feishuRpcCall,
    qqRpcCall,
    slackRpcCall,
    telegramRpcCall,
    wecomRpcCall,
    wecomAppRpcCall,
    weixinRpcCall,
    whatsappRpcCall,
    officeRpcCall,
    updateRpcCall,
    deliveryRpcCall,
    globalSettingsRpcCall,
    imessageRpcCall,
    emailRpcCall,
    matrixRpcCall
  }, {
    location: browserLocation,
    onRecovery: reportLoopbackRecovery
  }), [
    browserLocation,
    dingtalkRpcCall,
    discordRpcCall,
    deliveryRpcCall,
    feishuRpcCall,
    globalSettingsRpcCall,
    imessageRpcCall,
    emailRpcCall,
    matrixRpcCall,
    officeRpcCall,
    qqRpcCall,
    reportLoopbackRecovery,
    slackRpcCall,
    telegramRpcCall,
    updateRpcCall,
    wecomRpcCall,
    wecomAppRpcCall,
    weixinRpcCall,
    whatsappRpcCall
  ]);
  const botSettingsContext = React30.useMemo(() => Object.freeze({
    openBotSettings: setDeliverySettings
  }), []);
  return h3(
    WorkspaceDirectoryPickerContext.Provider,
    { value: workspaceDirectoryPicker },
    h3(
      "section",
      { className: "dim-page", "aria-label": "QQ \u673A\u5668\u4EBA\u8BBE\u7F6E" },
      h3(
        "header",
        { className: "dim-title" },
        h3(
          "div",
          { className: "dim-brand" },
          h3(
            "div",
            { className: "dim-brandHeading" },
            h3("strong", { className: "dim-brandName" }, "QQ \u673A\u5668\u4EBA")
          ),
          h3("p", null, "\u626B\u7801\u63A5\u5165 QQ\uFF0C\u6A21\u578B\u8D70\u514D\u5145\u503C DeepSeek")
        ),
        h3(
          "div",
          { className: "dim-titleActions" },
          h3(
            "span",
            { className: "dim-generalSettingsAction" },
            h3("button", {
              type: "button",
              id: "dim-general-settings-trigger",
              className: "dim-generalSettingsButton",
              "aria-label": "\u901A\u7528\u8BBE\u7F6E",
              "aria-describedby": generalSettingsTooltipId,
              "aria-controls": `dim-panel-${GLOBAL_SETTINGS_TAB_ID}`,
              "aria-current": globalSettingsSelected ? "page" : void 0,
              onClick: () => {
                setSelected(GLOBAL_SETTINGS_TAB_ID);
                setDeliverySettings(null);
              }
            }, h3(GlobalSettingsLogoGlyph, { size: 17 })),
            h3("span", {
              id: generalSettingsTooltipId,
              className: "dim-generalSettingsTooltip",
              role: "tooltip"
            }, "\u901A\u7528\u8BBE\u7F6E")
          )
        )
      ),
      h3(
        "div",
        { className: "dim-layout" },
        h3(
          "nav",
          { className: "dim-rail", role: "tablist", "aria-label": "\u8BBE\u7F6E\u5BFC\u822A" },
          visibleChannels.map((channel) => h3(
            "button",
            {
              key: channel.id,
              type: "button",
              role: "tab",
              id: `dim-tab-${channel.id}`,
              className: "dim-channel",
              "aria-selected": !globalSettingsSelected && channel.id === active.id,
              "aria-controls": `dim-panel-${channel.id}`,
              onClick: () => {
                setSelected(channel.id);
                setDeliverySettings(null);
              }
            },
            h3(ChannelLogo, { channel: channel.id }),
            h3(
              "span",
              { className: "dim-channelCopy" },
              h3("strong", null, channel.label),
              channel.note ? h3("small", { className: "dim-channelNote" }, channel.note) : null
            )
          ))
        ),
        h3("div", { className: "dim-divider", "aria-hidden": "true" }),
        h3(
          "main",
          {
            className: "dim-panel",
            role: "tabpanel",
            id: activePanelId,
            "aria-labelledby": activeTabId
          },
          loopbackRecovery ? h3(LoopbackRecoveryNotice, {
            recovery: loopbackRecovery,
            onNavigate: navigateToRecoveryUrl
          }) : null,
          h3(
            BotSettingsContext.Provider,
            { value: botSettingsContext },
            globalSettingsSelected ? h3(GlobalSettingsPanel, { rpcCall: rpcCalls.globalSettingsRpcCall }) : deliverySettings?.channel === active.id ? h3(DeliveryTargetSettingsPage, {
              channel: active.id,
              account: deliverySettings,
              rpcCall: rpcCalls.deliveryRpcCall,
              accessRpcCall: rpcCalls[`${active.id}RpcCall`],
              onBack: () => setDeliverySettings(null)
            }) : active.id === "deepseek" ? h3(DeepSeekSettingsPage, { rpcCall: laneRpcCall, channelRpc: channelRpcCall }) : h3(QqSettingsTab, { rpcCall: rpcCalls.qqRpcCall })
          )
        )
      )
    )
  );
}
function apply(ctx, options = {}) {
  const laneRpcCall = options.laneRpcCall ?? null;
  const channelRpcCall = options.channelRpcCall ?? null;
  ctx.effect(
    () => ctx.locale.register(IM_LOCALE_NAMESPACE, { zh, en }),
    "im-settings: bilingual dictionaries"
  );
  const t = ctx.locale.bind(IM_LOCALE_NAMESPACE);
  setImTranslator(t);
  ctx.effect(
    () => installInterfaceLanguageMirror(ctx, {
      rpcCall: (endpoint, payload, signal) => callManagementRpc(ctx.connection, HOST_LANGUAGE_RPC_CHANNEL, endpoint, payload, signal)
    }),
    "im-settings: mirror the DSH interface language"
  );
  ctx.effect(() => installSessionChannelLogos(), "im-settings: Session channel logos");
  let dsBotAvatars;
  ctx.effect(() => {
    dsBotAvatars = installDsBotSessionAvatars(ctx, {
      rpcCall: (endpoint, payload, signal) => callManagementRpc(ctx.connection, DELIVERY_RPC_CHANNEL, endpoint, payload, signal)
    });
    return () => {
      dsBotAvatars.dispose();
      dsBotAvatars = null;
    };
  }, "im-settings: bound DS Bot session avatars");
  ctx.effect(() => {
    const disposers = [
      installQqStyles(),
      installImStyles()
    ];
    return () => {
      for (const dispose of disposers.reverse()) dispose();
    };
  }, "im-settings: install combined channel styles");
  let sidebarSync;
  const managementRpc = async (connection, channel, endpoint, payload, signal) => {
    const result2 = await callManagementRpc(connection, channel, endpoint, payload, signal);
    if (result2?.ok === true) {
      const dsBotRead = channel === DELIVERY_RPC_CHANNEL && endpoint === "ds-bot.status";
      if (channel === DELIVERY_RPC_CHANNEL && ["ds-bot.bind", "ds-bot.unbind"].includes(endpoint)) dsBotAvatars?.refresh();
      if (endpoint === SIDEBAR_SETTINGS_ENDPOINTS.set) sidebarSync?.apply(result2);
      else if (!dsBotRead && endpoint !== SIDEBAR_SETTINGS_ENDPOINTS.get) sidebarSync?.refresh();
    }
    return result2;
  };
  const feishuRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, FEISHU_RPC_CHANNEL, endpoint, payload, signal);
  const weixinRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, WEIXIN_RPC_CHANNEL, endpoint, payload, signal);
  const dingtalkRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, DINGTALK_RPC_CHANNEL, endpoint, payload, signal);
  const qqRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, QQ_RPC_CHANNEL, endpoint, payload, signal);
  const wecomRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, WECOM_RPC_CHANNEL, endpoint, payload, signal);
  const wecomAppRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, WECOM_APP_RPC_CHANNEL, endpoint, payload, signal);
  const telegramRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, TELEGRAM_RPC_CHANNEL, endpoint, payload, signal);
  const discordRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, DISCORD_RPC_CHANNEL, endpoint, payload, signal);
  const whatsappRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, WHATSAPP_RPC_CHANNEL, endpoint, payload, signal);
  const imessageRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, IMESSAGE_RPC_CHANNEL, endpoint, payload, signal);
  const emailRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, EMAIL_RPC_CHANNEL, endpoint, payload, signal);
  const matrixRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, MATRIX_RPC_CHANNEL, endpoint, payload, signal);
  const slackRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, SLACK_RPC_CHANNEL, endpoint, payload, signal);
  const officeRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, OFFICE_RPC_CHANNEL, endpoint, payload, signal);
  const updateRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, UPDATE_RPC_CHANNEL, endpoint, payload, signal);
  const deliveryRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, DELIVERY_RPC_CHANNEL, endpoint, payload, signal);
  const globalSettingsRpcCall = (endpoint, payload, signal) => managementRpc(ctx.connection, Object.values(SIDEBAR_SETTINGS_ENDPOINTS).includes(endpoint) ? SIDEBAR_SETTINGS_RPC_CHANNEL : GLOBAL_SETTINGS_RPC_CHANNEL, endpoint, payload, signal);
  const workspaceDirectoryPicker = Object.freeze({
    listDirectory: (path, signal) => callWorkspaceDirectoryApi(ctx, "listDirectory", path, signal),
    pickDirectory: () => callWorkspaceDirectoryApi(ctx, "pickDirectory")
  });
  const panelDependencies = {
    dingtalkRpcCall,
    discordRpcCall,
    feishuRpcCall,
    qqRpcCall,
    slackRpcCall,
    telegramRpcCall,
    wecomRpcCall,
    wecomAppRpcCall,
    weixinRpcCall,
    whatsappRpcCall,
    imessageRpcCall,
    officeRpcCall,
    emailRpcCall,
    matrixRpcCall,
    updateRpcCall,
    deliveryRpcCall,
    globalSettingsRpcCall,
    workspaceDirectoryPicker,
    laneRpcCall,
    channelRpcCall
  };
  const subscribeLocale = (listener) => typeof ctx.on === "function" ? ctx.on("locale/change", listener) : () => {
  };
  const localeSnapshot = () => ctx.locale.getLocale?.()?.active ?? "";
  function IMPanel({ preferredSectionId }) {
    React30.useSyncExternalStore(subscribeLocale, localeSnapshot, localeSnapshot);
    return h3(
      IMPanelErrorBoundary,
      null,
      h3(IMSettingsTab, { ...panelDependencies, preferredSectionId })
    );
  }
  const buildPanelElement = (props = {}) => h3(IMPanel, {
    preferredSectionId: props.preferredSectionId
  });
  const pluginPage = installImPluginPage(ctx, {
    packageName: package_default.name,
    renderPanel: buildPanelElement
  });
  ctx.effect(() => {
    sidebarSync = installSidebarVisibilitySync({
      rpcCall: (endpoint, payload, signal) => callManagementRpc(ctx.connection, SIDEBAR_SETTINGS_RPC_CHANNEL, endpoint, payload, signal),
      setVisible: (visible) => pluginPage.setSidebarVisible(visible)
    });
    return () => {
      sidebarSync.dispose();
      sidebarSync = null;
    };
  }, "im-settings: sidebar visibility");
  ctx.effect(() => {
    let disposed = false;
    let stopSettings = null;
    let registered = false;
    const setSettingsVisible = (visible) => {
      if (disposed) return;
      if (typeof visible !== "boolean") throw new TypeError("visible must be a boolean");
      if (visible === (stopSettings !== null)) return;
      if (!visible) {
        const stop = stopSettings;
        stopSettings = null;
        stop();
        return;
      }
      stopSettings = ctx.slots.inject("settings.section", () => {
        const unregister = ctx.slots.register({
          name: "settings.section",
          id: "dsh-qq-free-bot",
          order: 22,
          label: () => "QQ \u673A\u5668\u4EBA",
          locale: IM_LOCALE_NAMESPACE,
          inject: () => panelDependencies
        }, buildPanelElement);
        registered = true;
        return () => {
          registered = false;
          unregister();
        };
      });
    };
    setSettingsVisible(true);
    if (typeof ctx.provide === "function") {
      ctx.provide("dshImClient", Object.freeze({
        version: 1,
        render: (props) => disposed ? null : buildPanelElement(props),
        setSettingsVisible,
        settingsVisible: () => !disposed && registered
      }));
    }
    return () => {
      disposed = true;
      const stop = stopSettings;
      stopSettings = null;
      registered = false;
      stop?.();
    };
  }, "im-settings: client panel service");
}

// src/product/client/lane-rpc-client.js
var LANE_RPC_PATH = "dsh-qq-free-bot";
async function callLaneRpc(connection, method, payload = {}, signal) {
  if (typeof connection?.rpc?.call !== "function") {
    throw new Error("DSH \u8FDE\u63A5\u4E0D\u53EF\u7528\uFF0C\u65E0\u6CD5\u8BFB\u53D6\u8F66\u9053\u8BBE\u7F6E");
  }
  return connection.rpc.call("/api", LANE_RPC_PATH, { method, payload }, signal);
}

// src/product/client/entry.js
var name = "dsh-qq-free-bot-settings";
var inject = ["slots", "connection", "locale", "workspaces"];
function apply2(ctx) {
  ctx.effect(installDeepSeekStyles, "dsh-qq-free-bot: \u8F66\u9053\u8BBE\u7F6E\u9875\u6837\u5F0F");
  apply(ctx, {
    laneRpcCall: (endpoint, payload, signal) => callLaneRpc(ctx.connection, endpoint, payload, signal),
    channelRpcCall: (method, payload, signal) => callChannelRpc(ctx.connection, method, payload, signal)
  });
}

    return module.exports;
  }
});
