// Run against an assembled site served at http://127.0.0.1:8765.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL || 'chrome'});
 const page=await browser.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 fs.mkdirSync('qa',{recursive:true});
 for(const [width,height] of [[1920,1080],[1366,768],[768,1024],[360,800]]){
  await page.setViewportSize({width,height});
  for(const route of ['index','downloads','runeschema','changelog','docs']){
   await page.goto(`http://127.0.0.1:8765/${route}.html`);
   assert.equal(await page.locator('h1').count(),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} overflow at ${width}`);
   if(width<=820){
    const toggle=page.locator('[data-nav-toggle]');
    await toggle.focus(); await page.keyboard.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('[data-nav]').isVisible(),true);
    await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    assert.equal(await toggle.evaluate(e=>e===document.activeElement),true);
   }
   if(route==='changelog'){
    for(const summary of await page.locator('summary').all()){await summary.focus();await page.keyboard.press('Enter');}
    assert.equal(await page.locator('details:not([open])').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   }
   await page.screenshot({path:`qa/${route}-${width}.png`,fullPage:true});
  }
 }
 for(const route of ['setup','mod-packaging','runeschema-authoring','servers','world-builder']){
  await page.goto(`http://127.0.0.1:8765/${route}.html`);
  await page.screenshot({path:`qa/${route}-360.png`,fullPage:true});
 }
 assert.deepEqual(errors,[]);
 await browser.close();
 console.log('20 public-page viewport checks passed; mobile keyboard menus, all changelog accordions, and reference-page runtime smoke checks passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
