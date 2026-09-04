const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync('website/site-overhaul.js','utf8');
const base = 'https://github.com/gh0sted5456-us/Dragonwilds-Sync/releases';
async function resolve(assets, fail = false) {
  const links = ['windows','linux','linux-checksums'].map(kind => ({dataset:{syncDownload:kind},href:base}));
  vm.runInNewContext(code, {URL, AbortSignal, document:{querySelector:()=>null,querySelectorAll:selector=>selector==='[data-sync-download]'?links:[]}, fetch:async()=>{if(fail)throw Error();return {ok:true,json:async()=>({tag_name:'test',html_url:base+'/tag/test',assets})};}});
  await new Promise(resolve=>setImmediate(resolve));
  return links;
}
test('selects the correct platform, excludes headless, and resolves checksums',async()=>{
  const names=['headless.exe','portable.exe','linux.AppImage','checksums-linux.sha256'];
  const links=await resolve(names.map(name=>({name,browser_download_url:base+'/download/test/'+name})));
  assert.deepEqual(links.map(l=>l.href),names.slice(1).map(n=>base+'/download/test/'+n));
});
test('missing platform assets lead to release details',async()=>{
  const links=await resolve([]);assert.ok(links.every(l=>l.href===base+'/tag/test'));
});
test('API failures retain release history',async()=>{
  const links=await resolve([],true);assert.ok(links.every(l=>l.href===base));
});
test('untrusted asset URLs cannot replace release links',async()=>{
  const links=await resolve([{name:'portable.exe',browser_download_url:'javascript:alert(1)'}]);assert.equal(links[0].href,base);
});
