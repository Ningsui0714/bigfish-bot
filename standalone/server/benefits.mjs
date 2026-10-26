import {randomUUID} from 'node:crypto';
import {ACCOUNT_CHANNELS, TRAE_CHANNEL} from './channel-state.mjs';
import {BENEFITS, normalizeBenefits} from './benefits-state.mjs';
import {shanghaiDay} from './trae.mjs';

const RETRYABLE=new Set(['inactive','status-error','previous-period']);
export const checkinDue=(record,now)=>!record||record.day!==shanghaiDay(now)||RETRYABLE.has(record.phase)&&Number(record.retryAt||0)<=now;

/** One application-level queue, native clients retain per-account claim singleflight. */
export class DailyBenefits {
  job=null; task=null; closed=false; startup=null; ticker=null;
  constructor({store,accounts,trae,now=Date.now,startupDelayMs=30_000,intervalMs=60_000}={}) {
    Object.assign(this,{store,accounts,trae,now,startupDelayMs,intervalMs});
  }
  candidates(automatic=false) {
    const config=this.store.get();
    return [TRAE_CHANNEL,...ACCOUNT_CHANNELS].filter(meta=>{
      const s=meta.id==='trae'?config.trae:config.accounts[meta.id];
      return !!s?.credential&&s.enabled!==false&&(!automatic||BENEFITS[meta.id].mode==='daily'&&s.autoCheckin&&!s.authRequired&&checkinDue(s.checkin,this.now()));
    });
  }
  state(id) {const c=this.store.get();return id==='trae'?c.trae:c.accounts[id];}
  status() {
    const saved=normalizeBenefits(this.store.get().benefits),job=this.job?structuredClone(this.job):saved.lastJob;
    // A previous process may have died with a claim in flight. Its native receipt
    // remains authoritative; never make a saved batch appear to still be running.
    if(!this.job&&job?.running){job.running=false;job.current='';for(const row of job.rows)if(['pending','running'].includes(row.phase)){row.phase='interrupted';row.message='上次运行已中断，领取状态以账号记录为准';}}
    const totals={};
    for(const row of job?.rows??[])if(['claimed','previous-period'].includes(row.phase)&&!row.cached&&Number.isFinite(row.credit)){
      // Credits from different vendors are not interchangeable, even if named alike.
      const key=row.id;totals[key]={credit:(totals[key]?.credit??0)+row.credit,unit:row.unit};
    }
    return {enabled:saved.enabled,benefits:BENEFITS,job,totals,eligible:this.candidates(true).length};
  }
  async persist() {await this.store.patchBenefits({lastJob:this.job});}
  launch(source='manual') {
    if(this.closed)throw new Error('签到服务已停止');
    if(this.task)return this.status();
    const automatic=source==='automatic';
    if(automatic&&!normalizeBenefits(this.store.get().benefits).enabled)return this.status();
    const selected=this.candidates(automatic);
    if(automatic&&!selected.length)return this.status();
    // Reserve synchronously before the first persistence/network await.
    this.job={id:randomUUID(),source:automatic?'automatic':'manual',day:shanghaiDay(this.now()),running:true,stopping:false,current:'',startedAt:new Date(this.now()).toISOString(),finishedAt:'',rows:selected.map(m=>({id:m.id,phase:'pending',message:'等待处理',credit:null,unit:BENEFITS[m.id].unit??''}))};
    this.task=this.run(automatic).catch(()=>{
      this.job.running=false;this.job.current='';this.job.finishedAt=new Date(this.now()).toISOString();
      for(const row of this.job.rows)if(['pending','running'].includes(row.phase)){row.phase='interrupted';row.message='本地记录保存失败，请检查数据目录后重试';}
    }).finally(()=>{this.task=null;});
    return this.status();
  }
  async run(automatic) {
    await this.persist();
    for(const row of this.job.rows) {
      if(this.closed||this.job.stopping||automatic&&!this.store.get().benefits.enabled)break;
      const s=this.state(row.id),benefit=BENEFITS[row.id];
      if(!s?.credential||s.enabled===false||automatic&&(!s.autoCheckin||s.authRequired||!checkinDue(s.checkin,this.now()))) {
        row.phase='skipped';row.message='账号已停用、退出或本次无需领取';await this.persist();continue;
      }
      if(benefit.mode!=='daily'){row.phase=benefit.mode;row.message=benefit.label;await this.persist();continue;}
      this.job.current=row.id;row.phase='running';row.message='正在查询与领取';await this.persist();
      const client=row.id==='trae'?this.trae:this.accounts;
      const before=JSON.stringify(s.checkin);
      try {
        const receipt=await client.checkin(row.id);
        row.phase=receipt.phase;row.message=receipt.message;row.at=receipt.at??'';
        row.credit=Number.isFinite(receipt.credit)?receipt.credit:null;row.unit=receipt.unit??benefit.unit;
        row.coversToday=receipt.coversToday!==false;row.cached=JSON.stringify(receipt)===before;
      } catch {
        // Errors may contain opaque upstream secrets. Use only native sanitized receipts.
        const receipt=this.state(row.id)?.checkin;
        row.phase=receipt?.phase??'error';row.message='本渠道签到未完成，其他渠道继续处理';
      }
      await this.persist(); // Persist a confirmed claim before any balance refresh.
      if(['claimed','already-claimed','previous-period'].includes(row.phase)&&!this.closed){
        try {await client.balance(row.id);row.balancePhase='updated';}
        catch {row.balancePhase='error';} // Never erase a successful claim.
      }
      await this.persist();
    }
    for(const row of this.job.rows)if(row.phase==='pending'){row.phase='cancelled';row.message='已停止后续渠道';}
    this.job.running=false;this.job.current='';this.job.finishedAt=new Date(this.now()).toISOString();await this.persist();
  }
  stopRemaining(){if(this.job?.running)this.job.stopping=true;return this.status();}
  async tick(){this.launch('automatic');await this.task;}
  start(){if(this.startup||this.ticker||this.closed)return;this.startup=setTimeout(()=>{
    this.startup=null;void this.tick().catch(()=>{});
    this.ticker=setInterval(()=>void this.tick().catch(()=>{}),this.intervalMs);this.ticker.unref();
  },this.startupDelayMs);this.startup.unref();}
  stop(){this.closed=true;clearTimeout(this.startup);clearInterval(this.ticker);this.startup=this.ticker=null;this.stopRemaining();}
}
