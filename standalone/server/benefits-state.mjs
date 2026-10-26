export const BENEFITS = Object.freeze({
  trae: {mode:'daily',label:'每日签到积分',unit:'credits'},
  codearts: {mode:'daily',label:'每日活动积分',unit:'积分'},
  qoder: {mode:'daily',label:'每日活动额度',unit:'credits'},
  qodercn: {mode:'daily',label:'每日活动额度',unit:'credits'},
  loomy: {mode:'daily',label:'每日额度',unit:'积分'},
  minimax: {mode:'daily',label:'每日签到额度',unit:'积分'},
  raccoon: {mode:'automatic',label:'每日自动发放，无需签到'},
  zcode: {mode:'manual',label:'请在厂商页面完成人工验证领取'},
  cline: {mode:'none',label:'没有独立的每日签到接口'},
  gemini: {mode:'none',label:'额度随账号套餐自动刷新'},
});
const str=(v,n=300)=>typeof v==='string'?v.slice(0,n):'';
export function normalizeBenefits(value={}) {
  if(!value||typeof value!=='object'||Array.isArray(value))value={};
  // Internal receipts only. Browser config updates may change enabled, never receipts.
  const job=value.lastJob;
  return {enabled:value.enabled!==false,lastJob:job&&typeof job==='object'?{
    id:str(job.id,80),source:job.source==='automatic'?'automatic':'manual',day:str(job.day,10),
    running:job.running===true,stopping:job.stopping===true,current:BENEFITS[job.current]?job.current:'',
    startedAt:str(job.startedAt,40),finishedAt:str(job.finishedAt,40),
    rows:(Array.isArray(job.rows)?job.rows:[]).filter(r=>BENEFITS[r?.id]).slice(0,10).map(r=>({
      id:r.id,phase:str(r.phase,40),message:str(r.message),credit:Number.isFinite(r.credit)?r.credit:null,
      unit:str(r.unit,40),coversToday:r.coversToday!==false,cached:r.cached===true,
      balancePhase:str(r.balancePhase,40),at:str(r.at,40),
    })),
  }:null};
}
