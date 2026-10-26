export const DEFAULT_PERSONA_ID='default';
export function personaScope(id,scope){return !id||id===DEFAULT_PERSONA_ID?scope:`persona:${id}:${scope}`;}
export function scopePersona(scope){return /^persona:([a-zA-Z0-9_-]+):/.exec(scope??'')?.[1]??DEFAULT_PERSONA_ID;}
