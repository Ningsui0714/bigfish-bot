/** Recover the localhost HttpOnly session after a server restart, without losing form edits. */
export function createApiClient(fetchImpl=fetch) {
  let sessionFlight=null,generation=0;
  async function renew() {
    if(!sessionFlight)sessionFlight=(async()=>{
      const home=await fetchImpl('/',{credentials:'same-origin',cache:'no-store',redirect:'error'});
      if(!home.ok||!home.headers.get('content-type')?.includes('text/html'))throw new Error('本地会话恢复失败，请刷新页面后重试');
      await home.body?.cancel();generation++;
    })().finally(()=>{sessionFlight=null;});
    await sessionFlight;
  }
  return async function api(path,data,method='POST') {
    const options={credentials:'same-origin',...(data===undefined?{}:{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})};
    const before=generation;
    let response=await fetchImpl(`/api/${path}`,options);
    // Only an explicit local HTTP 401 means the handler did not run.
    // Never replay on timeout, upstream errors or a partially completed action.
    if(response.status===401){
      await response.body?.cancel();
      if(before===generation)await renew();
      response=await fetchImpl(`/api/${path}`,options);
    }
    const value=await response.json();
    if(!response.ok)throw new Error(response.status===401?'本地会话已失效，请刷新页面后重试':value.error||'请求未完成');
    return value;
  };
}
export const api=createApiClient();
