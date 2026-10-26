const clone=value=>structuredClone(value);
export function stashPersona(config){
  const c=clone(config);c.activePersonaId??='default';c.personas??=[{id:'default',name:'大肥鱼',kind:'persona',persona:clone(c.persona),agent:clone(c.agent)}];c.personas=c.personas.map(p=>p.id===c.activePersonaId?{...p,persona:clone(c.persona),agent:clone(c.agent)}:p);return c;
}
export function selectPersona(config,id){
  const c=stashPersona(config),p=c.personas.find(p=>p.id===id);if(!p)throw new Error('人格 / 模板不存在');
  return {...c,activePersonaId:id,persona:clone(p.persona),agent:clone(p.agent)};
}
export function createPersona(config,{id,name,kind='persona',copy=false}){
  const c=stashPersona(config);name=name.trim();if(!name||name.length>80)throw new Error('请填写 1～80 字的名称');
  if(c.personas.length>=16)throw new Error('最多保存 16 个人格 / 模板');if(c.personas.some(p=>p.id===id))throw new Error('人格标识重复');
  const p={id,name,kind,persona:copy?clone(c.persona):{...clone(c.persona),guidance:'',nicknames:[name],interests:[]},agent:clone(c.agent)};
  c.personas.push(p);return kind==='template'?c:selectPersona(c,id);
}
