import { createRequire } from 'node:module';
import { connectionStageError, extractConnectionEvidence } from './connection-error.mjs';
import { normalizeDiagnosticDetails } from './diagnostic-details.mjs';

const require = createRequire(import.meta.url);
let installedDependencies;

function resolvedPackage(name, from) {
  try {
    const path = from.resolve(`${name}/package.json`);
    return { version: from(path)?.version, require: createRequire(path) };
  } catch {
    // Diagnostics must not replace the original encoding failure.
    return undefined;
  }
}

function dependencies() {
  if (!installedDependencies) {
    const qrcode = resolvedPackage('qrcode', require);
    // Resolve from qrcode so nested installations report the PNG library it uses.
    const pngjs = qrcode && resolvedPackage('pngjs', qrcode.require);
    installedDependencies = Object.freeze(normalizeDiagnosticDetails({ dependencies: {
      qrcode: qrcode?.version, pngjs: pngjs?.version, zlib: process.versions.zlib,
    } }).dependencies ?? {});
  }
  return installedDependencies;
}

/** Attach only safe facts; never copy QR contents, exception text or stack traces. */
export function qrEncodingError(cause) {
  if (cause?.name === 'AbortError') return cause;
  const evidence = extractConnectionEvidence(cause);
  return connectionStageError(new Error('QR encoding failed', { cause }), 'qr.encode', undefined, {
    qrEncoder: 'qrcode', qrRenderer: 'png',
    errorTypes: evidence.errors.map(error => error.type),
    dependencies: dependencies(),
  });
}
