(() => {
  'use strict';
  const params=new URLSearchParams(location.search);
  if(params.get('embed')==='1')document.documentElement.classList.add('helpy-embedded');
  const requestedTheme=params.get('theme');
  if(['dark','white','glass'].includes(requestedTheme)){document.documentElement.dataset.theme=requestedTheme;localStorage.setItem('dragonwilds-sync-theme',requestedTheme);}
  const root=location.pathname.includes('/website/')?'../help/':'help/';
  let manifest=null;let selected='';
  const esc=(value)=>String(value??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const imageUrl=(value)=>new URL(String(value||''),new URL(root,location.href)).href;
  const nav=document.querySelector('#helpy-nav');const article=document.querySelector('#helpy-article');const search=document.querySelector('#helpy-search');

  function renderNav(){
    const query=String(search.value||'').trim().toLowerCase();
    const pages=(manifest?.pages||[]).filter((page)=>!query||`${page.title} ${page.category} ${page.summary} ${page.intro} ${JSON.stringify(page.sections||[])} ${JSON.stringify(page.screenshots||[])}`.toLowerCase().includes(query));
    nav.innerHTML=pages.map((page)=>`<button type="button" class="${page.id===selected?'active':''}" data-helpy-page="${esc(page.id)}"><strong>${esc(page.title)}</strong><small>${esc(page.summary)}</small></button>`).join('')||'<div class="helpy-error"><strong>No matching guide.</strong></div>';
    nav.querySelectorAll('[data-helpy-page]').forEach((button)=>button.addEventListener('click',()=>select(button.dataset.helpyPage)));
  }
  function screenshotMarkup(shot){
    if(shot.image)return `<button class="helpy-screenshot ready" type="button" data-helpy-image="${esc(imageUrl(shot.image))}" data-helpy-alt="${esc(shot.alt||shot.title)}"><img src="${esc(imageUrl(shot.image))}" alt="${esc(shot.alt||shot.title)}" loading="lazy"><span><strong>${esc(shot.title)}</strong><small>${esc(shot.description||'Open screenshot')}</small></span></button>`;
    return `<div class="helpy-screenshot placeholder"><div class="helpy-placeholder-art" aria-hidden="true"><span></span><span></span><span></span></div><span><strong>${esc(shot.title)}</strong><small>${esc(shot.description||'Screenshot coming soon.')}</small>${shot.suggested_file?`<code>${esc(shot.suggested_file)}</code>`:''}</span></div>`;
  }
  function renderPage(page){
    const screenshots=page.screenshots?.length?`<section class="helpy-screenshots"><div class="helpy-screenshots-heading"><div><div class="eyebrow">Screenshot plan</div><h3>Visual references</h3></div><small>Add an <code>image</code> property to a slot in <code>help/manifest.json</code>.</small></div><div class="helpy-screenshot-grid">${page.screenshots.map(screenshotMarkup).join('')}</div></section>`:'';
    article.innerHTML=`<header><div class="eyebrow">${esc(page.category||'Guide')}</div><h2>${esc(page.title)}</h2><p class="helpy-article-intro">${esc(page.intro||page.summary||'')}</p></header>${page.image?`<button class="helpy-article-shot" type="button" data-helpy-image="${esc(imageUrl(page.image))}" data-helpy-alt="${esc(page.image_alt||page.title)}"><img src="${esc(imageUrl(page.image))}" alt="${esc(page.image_alt||page.title)}" loading="eager"></button>`:''}<div class="helpy-section-grid">${(page.sections||[]).map((section)=>`<section class="helpy-section"><h3>${esc(section.title)}</h3>${section.body?`<p>${esc(section.body)}</p>`:''}${section.steps?.length?`<ol>${section.steps.map((step)=>`<li>${esc(step)}</li>`).join('')}</ol>`:''}</section>`).join('')}</div>${screenshots}${page.tips?.length?`<div class="helpy-tips">${page.tips.map((tip)=>`<span>${esc(tip)}</span>`).join('')}</div>`:''}`;
    article.querySelectorAll('[data-helpy-image]').forEach((button)=>button.addEventListener('click',(event)=>{const dialog=document.querySelector('#helpy-image-dialog');const image=dialog.querySelector('img');image.src=event.currentTarget.dataset.helpyImage;image.alt=event.currentTarget.dataset.helpyAlt;dialog.querySelector('p').textContent=event.currentTarget.dataset.helpyAlt;dialog.showModal();}));
  }
  function select(id){
    const page=(manifest?.pages||[]).find((row)=>row.id===id)||manifest?.pages?.[0];if(!page)return;
    selected=page.id;history.replaceState(null,'',`${location.pathname}${location.search}#${encodeURIComponent(selected)}`);renderNav();renderPage(page);
  }
  async function load(force=false){
    article.innerHTML='<div class="helpy-loading"><span class="status-dot"></span><strong>Loading Helpy from GitHub...</strong></div>';
    try{
      const response=await fetch(`${root}manifest.json${force?`?v=${Date.now()}`:''}`,{cache:force?'reload':'default'});if(!response.ok)throw new Error(`Help source returned ${response.status}`);
      manifest=await response.json();if(manifest.schema!=='DragonwildsSync.Help.v1'||!Array.isArray(manifest.pages))throw new Error('Unsupported Helpy manifest');
      document.querySelector('#helpy-subtitle').textContent=manifest.subtitle||'';document.querySelector('#helpy-version').textContent=`Version ${manifest.version} · ${manifest.pages.length} systems · updated ${manifest.updated_at}`;
      select(decodeURIComponent(location.hash.slice(1))||selected||manifest.pages[0]?.id);
    }catch(error){article.innerHTML=`<div class="helpy-error"><strong>Helpy could not load.</strong><p>${esc(error.message)} Refresh when GitHub Pages is available.</p></div>`;}
  }
  search.addEventListener('input',renderNav);document.querySelector('#helpy-refresh').addEventListener('click',()=>load(true));
  const dialog=document.querySelector('#helpy-image-dialog');dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',(event)=>{if(event.target===dialog)dialog.close();});
  load(false);
})();
