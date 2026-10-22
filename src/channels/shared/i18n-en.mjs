import imageInput from './i18n-en/image-input.mjs';
import permission from './i18n-en/permission.mjs';
import diagnostics from './i18n-en/diagnostics.mjs';
// English translations for host-side user-facing text.
// Keys are the exact Chinese literals passed to t() in src/channels/**.
// Chinese output is the identity default and needs no entries here.
// Entries are maintained per area in ./i18n-en/*.mjs and merged here.

import sharedA from './i18n-en/shared-a.mjs';
import sharedB from './i18n-en/shared-b.mjs';
import sharedC from './i18n-en/shared-c.mjs';
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 feishu）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 dingtalk）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 wecom）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 wecom-app）
import qq from './i18n-en/qq.mjs';
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 weixin）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 slack）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 telegram）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 discord）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 whatsapp）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 matrix）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 office）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 email）

export const EN = Object.freeze(Object.assign(
  {},
  diagnostics,
  imageInput,
  permission,
  sharedA,
  sharedB,
  sharedC,
  qq,
));
