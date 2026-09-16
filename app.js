'use strict';

// Replace this sample data with a commerce API when the storefront is production-ready.
const PRODUCTS = [
  ['sunday-hoops','The Sunday Hoops','Earrings',349,'Everyday muse','#e7ddce','hoops',['Gold tone','Silver tone'],'Sculptural hoops for chai dates, white shirts and spontaneous plans.'],
  ['soft-orbit','Soft Orbit Ring','Rings',249,'Less, but better','#ded2bd','ring',['Small','Medium','Large'],'A softly rounded statement, worn alone or in your favourite stack.'],
  ['moonlit-chain','Moonlit Pendant','Necklaces',449,'After hours','#e4cbbc','necklace',['Gold tone','Silver tone'],'A tiny moon-inspired pendant for slow mornings and late evenings.'],
  ['little-link','Little Link Bracelet','Bracelets',299,'Stack story','#d6d6c7','bracelet',['Gold tone','Silver tone'],'Soft, open links bring a little shine to rolled-up sleeves.'],
  ['gul-bangles','Gul Bangle Duo','Bangles',499,'Desi, reimagined','#ddc3aa','bangles',['Small','Medium','Large'],'A familiar silhouette with a fresh point of view. Pair with kurtas or your favourite oversized shirt.'],
  ['dil-se','Dil Se Gift Box','Gift hampers',899,'For your person','#e6c9c0','gift',['Everyday edit','Celebration edit'],'A thoughtful little collection of jewelry, made for big feelings.'],
  ['pearl-drop','The Pearl Pause','Earrings',399,'Soft statement','#dad9cd','pearl',['Gold tone','Silver tone'],'A delicate pearl-inspired drop with an effortlessly dressed-up mood.'],
  ['daydream-ring','Daydream Ring','Rings',279,'Golden hour','#dbcdbf','ring',['Small','Medium','Large'],'A playful little orbit for the days that deserve something extra.']
].map(([id,name,category,price,tag,tone,type,options,description])=>({id,name,category,price,tag,tone,type,options,description}));
const CATEGORIES = ['All',...new Set(PRODUCTS.map(p=>p.category))];
const findProduct = id => PRODUCTS.find(p=>p.id===id);
const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const limitQty = value => Math.max(1,Math.min(99,Math.floor(Number(value)||1)));
const STORE = 'satvastones-shopping-v1';
function readState(){
  const clean = {wishlist:[],cart:[]};
  try {
    const raw = JSON.parse(localStorage.getItem(STORE));
    if(!raw || typeof raw!=='object') return clean;
    if(Array.isArray(raw.wishlist)) clean.wishlist=[...new Set(raw.wishlist.filter(id=>findProduct(id)))];
    if(Array.isArray(raw.cart)) for(const item of raw.cart.slice(0,100)){
      if(!item || typeof item!=='object') continue;
      const p=findProduct(item.id);
      if(!p || !p.options.includes(item.option) || !Number.isInteger(item.qty) || item.qty<1) continue;
      const existing=clean.cart.find(x=>x.id===item.id && x.option===item.option);
      if(existing) existing.qty=limitQty(existing.qty+item.qty);
      else clean.cart.push({id:item.id,option:item.option,qty:limitQty(item.qty)});
    }
  } catch { /* Storage is optional; private browsing still supports session shopping. */ }
  return clean;
}
let state=readState(), svgId=0, toastTimer, observer;
const main=document.querySelector('#main');
const dialog=document.querySelector('#cart-dialog');
function persist(){
  try { localStorage.setItem(STORE,JSON.stringify(state)); }
  catch { notify('Storage is unavailable. Your bag lasts only for this page session.'); }
  updateCounts();
}
function updateCounts(){
  document.querySelector('#wish-count').textContent=state.wishlist.length;
  document.querySelector('#cart-count').textContent=state.cart.reduce((n,x)=>n+x.qty,0);
}
function notify(text){
  const toast=document.querySelector('#toast');
  clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('visible');
  toastTimer=setTimeout(()=>toast.classList.remove('visible'),3500);
}
// Original inline SVG art: no image services, fonts, packages or network required.
function art(p,option=''){
  const id=`metal-${++svgId}`, silver=option==='Silver tone';
  const colors=silver?['#686b6e','#f3f5f3','#9a9ea0','#fff','#7b8085']:['#78501e','#eed199','#b58a42','#fff0c3','#946425'];
  const ellipse=(cx,cy,rx,ry,rotation=0,width=16)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rotation} ${cx} ${cy})" fill="none" stroke="url(#${id})" stroke-width="${width}"/>`;
  let shape='';
  if(p.type==='hoops') shape=ellipse(150,185,48,70,-22,21)+ellipse(250,218,48,70,20,21);
  else if(p.type==='ring') shape=ellipse(200,210,84,57,-28,27)+ellipse(200,210,85,59,-28,2);
  else if(p.type==='bangles') shape=ellipse(183,192,101,57,-24,10)+ellipse(219,234,100,56,-24,10);
  else if(p.type==='necklace') shape=`<path d="M100 55Q80 255 200 270Q320 255 300 55" fill="none" stroke="url(#${id})" stroke-width="5"/>`+ellipse(200,273,8,12,0,4)+`<path d="M207 287c-50-18-50 63 0 46-20-8-20-37 0-46Z" fill="url(#${id})"/>`;
  else if(p.type==='bracelet') shape=Array.from({length:12},(_,i)=>{const angle=i*Math.PI/6;return ellipse(200+92*Math.cos(angle),205+65*Math.sin(angle),21,13,i*30+90,7);}).join('');
  else if(p.type==='pearl') shape=[145,255].map((x,i)=>ellipse(x,153+i*25,19,29,0,9)+`<path d="M${x} ${182+i*25}v30" stroke="url(#${id})" stroke-width="5"/><ellipse cx="${x}" cy="${235+i*25}" rx="25" ry="32" fill="url(#pearl-${id})"/>`).join('');
  else shape=`<rect x="80" y="130" width="240" height="170" rx="3" fill="#583b2b"/><path d="M80 165h240M190 130v170" stroke="#cba467" stroke-width="20"/><path d="M190 139c-100-5-73-79-34-42l34 42c100-5 73-79 34-42Z" fill="none" stroke="url(#${id})" stroke-width="12"/><text x="202" y="252" text-anchor="middle" fill="#ebd6b5" font-family="Georgia,serif" font-style="italic" font-size="22">dil se.</text>`;
  return `<svg class="jewel" viewBox="0 0 400 400" role="img" aria-label="${escapeHTML(p.name)} — concept illustration"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${colors.map((c,i)=>`<stop offset="${i*25}%" stop-color="${c}"/>`).join('')}</linearGradient><radialGradient id="pearl-${id}" cx="30%" cy="25%"><stop stop-color="#fffdf9"/><stop offset=".7" stop-color="#eadfd3"/><stop offset="1" stop-color="#bfae9e"/></radialGradient><filter id="shadow-${id}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="6" dy="12" stdDeviation="7" flood-color="#4d3724" flood-opacity=".23"/></filter></defs><g filter="url(#shadow-${id})">${shape}</g></svg>`;
}
function card(p){
  const saved=state.wishlist.includes(p.id);
  return `<article class="product-card reveal"><span class="product-tag">${p.tag}</span><button class="wish-button" data-action="wish" data-id="${p.id}" aria-label="${saved?'Remove from':'Add to'} wishlist: ${p.name}" aria-pressed="${saved}">${saved?'♥':'♡'}</button><a class="product-image" href="#/product/${p.id}" style="background:${p.tone}">${art(p)}</a><div class="product-info"><div><h3><a href="#/product/${p.id}">${p.name}</a></h3><p>${p.category} · Sample design</p></div><span class="price">${money(p.price)}</span></div><a class="quick-add" href="#/product/${p.id}">Choose your details ↗</a></article>`;
}
function empty(title,text){return `<div class="empty-state"><span class="empty-icon" aria-hidden="true">✳</span><h2>${title}</h2><p>${text}</p><a class="button" href="#/shop">Find your little extra ↗</a></div>`;}
function heading(kicker,title,text){return `<header class="page-header"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p>${text}</p></header>`;}
function home(){return `<section class="hero"><div class="hero-copy"><p class="eyebrow">Indian soul. Global mood. — SatvaStones</p><h1>A little extra.<br><em>Every day.</em></h1><p>For your coffee runs. Your main-character moments. And everything beautifully in between.</p><a class="button" href="#/shop">Find your everyday gold <span>↗</span></a><div class="hero-note"><span aria-hidden="true">✳</span>Small details. Big feelings.</div></div><div class="hero-art"><span class="hero-index">THE EVERYDAY EDIT / 01</span>${art(PRODUCTS[0])}<span class="sticker">not just<br>for occasions.</span><div class="hero-caption"><span>The Sunday Hoops · Illustration</span><a href="#/product/sunday-hoops">Meet your muse ↗</a></div></div></section><div class="marquee" aria-hidden="true"><div class="marquee-track">${Array(2).fill('<span>Less noise. More you. <b>✳</b> Chai dates & golden hours <b>✳</b> A little desi. A little dreamy. <b>✳</b></span>').join('')}</div></div><section class="section"><div class="section-heading"><div><p class="eyebrow">Your next little obsession</p><h2>The everyday <em>edit.</em></h2></div><a class="text-link" href="#/shop">See the whole collection ↗</a></div><div class="category-row">${CATEGORIES.slice(1).map(c=>`<a class="chip" href="#/shop?category=${encodeURIComponent(c)}">${c}</a>`).join('')}</div><div class="product-grid home-grid">${PRODUCTS.slice(0,4).map(card).join('')}</div></section><section class="story-panel reveal"><div class="story-visual">${art(PRODUCTS[4])}<span class="stamp">a little desi, always.</span></div><div class="story-copy"><p class="eyebrow">Rooted here. Inspired everywhere.</p><h2>Not precious.<br>Just <em>personal.</em></h2><p>Your nani’s love for a good bangle. Your saved Pinterest board. A little Korean minimalism. A whole lot of you. That’s the world of SatvaStones.</p><a class="button light" href="#/about">Get to know us ↗</a></div></section><section class="rituals"><div><span>01</span><h3>Small luxuries, everyday.</h3><p>Premium-looking pieces, with accessible pricing at heart.</p></div><div><span>02</span><h3>Your kind of expression.</h3><p>Minimal one day. All stacked up the next. Make it yours.</p></div><div><span>03</span><h3>Gifting, with feeling.</h3><p>A little something for someone. Including yourself.</p></div></section>`;}
function currentRoute(){const [path,query='']=(location.hash.slice(1)||'/').split('?');return {path,params:new URLSearchParams(query)};}
function shop(params){
  const category=CATEGORIES.includes(params.get('category'))?params.get('category'):'All';
  const query=(params.get('q')||'').slice(0,100),sort=params.get('sort')||'featured';
  const results=PRODUCTS.filter(p=>(category==='All'||p.category===category)&&`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
  if(sort==='low') results.sort((a,b)=>a.price-b.price);
  if(sort==='high') results.sort((a,b)=>b.price-a.price);
  if(sort==='name') results.sort((a,b)=>a.name.localeCompare(b.name));
  return heading('The collection','Good things.<br><em>Little packages.</em>','Find the pieces that feel like you. Illustrated sample catalog; prices and specifications are for this preview only.')+`<section class="section shop-section"><nav class="category-row" aria-label="Product categories">${CATEGORIES.map(c=>{const next=new URLSearchParams(params);next.set('category',c);return `<a class="chip ${c===category?'active':''}" ${c===category?'aria-current="true"':''} href="#/shop?${escapeHTML(next.toString())}">${c}</a>`;}).join('')}</nav><div class="toolbar"><form id="search-form" class="search-form"><input name="q" type="search" maxlength="100" aria-label="Search the collection" placeholder="Find your little extra…" value="${escapeHTML(query)}"><button type="submit">Search ↗</button></form><label class="sort-control">Sort by<select id="sort">${[['featured','Featured'],['low','Price: low to high'],['high','Price: high to low'],['name','Name: A–Z']].map(([value,label])=>`<option value="${value}" ${sort===value?'selected':''}>${label}</option>`).join('')}</select></label></div><p class="result-count">${results.length} little treasures</p><div class="product-grid">${results.length?results.map(card).join(''):empty('Nothing here, just yet.','Try another search or explore the full collection.')}</div></section>`;
}
function productPage(p){return `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><a href="#/shop">Shop</a><span>/</span><span>${p.name}</span></nav><section class="detail"><div class="detail-visual" style="background:${p.tone}"><div id="detail-art">${art(p)}</div><span class="visual-note">Concept illustration · not a product photograph</span></div><div class="detail-copy"><p class="eyebrow">${p.category} / ${p.tag}</p><h1>${p.name}</h1><p class="detail-price">${money(p.price)}</p><p class="small-note">Sample price · no live purchases</p><p class="detail-description">${p.description}</p><form id="buy-form" data-id="${p.id}"><fieldset class="option-field"><legend>Make it yours</legend><select name="option" id="product-option" aria-label="Choose a product option">${p.options.map(o=>`<option>${o}</option>`).join('')}</select></fieldset><div class="buy-row"><div class="quantity"><button type="button" data-action="detail-minus" aria-label="Decrease quantity">−</button><input name="qty" id="detail-qty" type="number" min="1" max="99" value="1" required aria-label="Quantity"><button type="button" data-action="detail-plus" aria-label="Increase quantity">+</button></div><button type="submit" class="button">Add to bag ↗</button></div></form><button class="save-detail" data-action="wish" data-id="${p.id}" aria-pressed="${state.wishlist.includes(p.id)}">${state.wishlist.includes(p.id)?'♥ Saved to wishlist':'♡ Save for a little later'}</button><details open><summary>The little details</summary><p>This is a sample ${p.category.toLowerCase()} design. Material, dimensions, sizing and finish specifications must be confirmed before real orders are enabled. No waterproof or hypoallergenic claims are made.</p></details><details><summary>A little care goes a long way</summary><p>As general fashion-jewelry care: keep dry, avoid direct perfume contact and store separately. Follow the final material-specific guidance when available.</p></details><details><summary>Delivery & returns</summary><p>This preview does not accept orders. Shipping charges, delivery timelines and return policies are not yet configured.</p></details></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Good company</p><h2>Better <em>together.</em></h2></div></div><div class="product-grid">${PRODUCTS.filter(x=>x.id!==p.id).slice(0,4).map(card).join('')}</div></section>`;}
function about(){return `<section class="section about-intro"><div><p class="eyebrow">Hello. Namaste. Welcome to our world.</p><h1 style="margin-top:24px">Indian roots.<br><em>Limitless mood.</em></h1><p class="lead">We believe your favourite jewelry shouldn’t wait for a special occasion.</p><p>SatvaStones is an Indian fashion jewelry brand bringing thoughtful design and accessible pricing to your everyday. We manufacture, curate and resell pieces with one simple vision: a premium experience that feels personal, not out of reach.</p></div><div class="about-art">${art(PRODUCTS[2])}<span>Small things. Full hearts.</span></div></section><section class="manifesto reveal"><span aria-hidden="true">✳</span><p class="eyebrow">Our kind of luxury</p><h2>Not a price tag.<br>A feeling. A detail.<br><em>A little more you.</em></h2><p>From Pinterest boards to the streets of home.</p></section><section class="section"><p class="eyebrow">The Satva state of mind</p><div class="values"><div><span>01 / THE DESIGN</span><h3>Quiet, never boring.</h3><p>Korean minimalism meets Western silhouettes, with an unmistakably Indian soul. Jewelry that whispers, but still says something.</p></div><div><span>02 / THE EVERYDAY</span><h3>For your real life.</h3><p>Rings, bracelets, necklaces, earrings and bangles. For college corridors, first jobs, festive evenings and absolutely no reason at all.</p></div><div><span>03 / THE FEELING</span><h3>A gift with a story.</h3><p>Customized gift hampers for your people. Thoughtful gestures and small celebrations, because the little things are the big things.</p></div></div><a class="button" href="#/shop" style="margin-top:40px">Find your Satva ↗</a></section>`;}
function account(){return heading('Your little corner','Hello, <em>you.</em>','A space for your details and everyday favourites.')+`<section class="section account-layout"><nav class="account-sidebar" aria-label="Account navigation"><a href="#/account" aria-current="page">Personal details ↗</a><a href="#/wishlist">Your wishlist ↗</a><a href="#/shop">Keep exploring ↗</a></nav><div class="account-panel"><h2>The personal details.</h2><p class="demo-notice">Demo only: no account is created and no information is sent or saved. Use fictional details to explore this form. Authentication and order history require a backend.</p><form id="account-form"><div class="form-grid"><label class="field">First name<input name="firstName" autocomplete="off" maxlength="60" required placeholder="Aanya"></label><label class="field">Last name<input name="lastName" autocomplete="off" maxlength="60" placeholder="Sharma"></label><label class="field full">Email<input type="email" name="email" autocomplete="off" maxlength="254" required placeholder="aanya@example.com"></label><label class="field">Phone (optional)<input type="tel" name="phone" autocomplete="off" maxlength="20" placeholder="Demo phone number"></label><label class="field">City (optional)<input name="city" autocomplete="off" maxlength="80" placeholder="Jaipur"></label></div><button class="button" type="submit">Preview details ↗</button><p id="account-status" class="small-note" role="status"></p></form></div></section>`;}
function wishlist(){const list=PRODUCTS.filter(p=>state.wishlist.includes(p.id));return heading('Saved with love','Your little <em>wishlist.</em>','Keep the pieces you’re dreaming about close. Saved in this browser when storage is available.')+`<section class="section shop-section"><div class="product-grid">${list.length?list.map(card).join(''):empty('A little room for love.','Tap a heart on any piece to save it here.')}</div></section>`;}
function render(focus=true){
  const {path,params}=currentRoute();
  let content,title;
  if(path==='/'){content=home();title='A little extra, every day';}
  else if(path==='/shop'){content=shop(params);title='The collection';}
  else if(path==='/about'){content=about();title='Our world';}
  else if(path==='/account'){content=account();title='Your account';}
  else if(path==='/wishlist'){content=wishlist();title='Your wishlist';}
  else {const p=path.startsWith('/product/')?findProduct(path.slice(9)):null;content=p?productPage(p):heading('A little detour','Page not found.','This link does not lead to a page in the collection.')+empty('Let’s start again.','Your next favourite might be just around the corner.');title=p?p.name:'Page not found';}
  if(observer) observer.disconnect();
  main.innerHTML=`<div class="page-enter">${content}</div>`;
  document.title=`${title} — SatvaStones`;
  document.querySelectorAll('[data-nav]').forEach(a=>{a.removeAttribute('aria-current');if(path===`/${a.dataset.nav}`) a.setAttribute('aria-current','page');});
  if(focus){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');observer.unobserve(e.target);}}),{threshold:.08});main.querySelectorAll('.reveal').forEach(el=>{el.classList.add('pending');observer.observe(el);});}
}
function renderCart(){
  document.querySelector('#cart-content').innerHTML=state.cart.length?`<div class="cart-items">${state.cart.map((x,i)=>{const p=findProduct(x.id);return `<article class="cart-item"><a class="cart-art" href="#/product/${p.id}">${art(p,x.option)}</a><div><h3><a href="#/product/${p.id}">${p.name}</a></h3><p>${escapeHTML(x.option)} · ${money(p.price)} each</p><span class="price">${money(p.price*x.qty)}</span><div class="cart-item-controls"><div class="quantity"><button data-action="cart-minus" data-index="${i}" aria-label="Decrease ${p.name} quantity" ${x.qty===1?'disabled':''}>−</button><output aria-label="Quantity">${x.qty}</output><button data-action="cart-plus" data-index="${i}" aria-label="Increase ${p.name} quantity" ${x.qty===99?'disabled':''}>+</button></div><button class="remove" data-action="remove" data-index="${i}" aria-label="Remove ${p.name} from bag">Remove</button></div></div></article>`;}).join('')}</div><div class="cart-total"><div class="total-row"><span>Subtotal</span><strong>${money(state.cart.reduce((n,x)=>n+findProduct(x.id).price*x.qty,0))}</strong></div><p>Sample prices. Shipping and tax rules are not configured. No payment will be taken.</p><button class="button" data-action="checkout">Preview checkout ↗</button><div id="checkout-message" role="status"></div><button class="text-link" data-action="close-cart" style="margin-top:20px">Keep exploring</button></div>`:empty('Your bag is taking a breath.','Add a little something you love.');
}
function openCart(){renderCart();if(!dialog.open) dialog.showModal();document.body.classList.add('cart-open');}
function updateShop(key,value){const {params}=currentRoute();params.set(key,value);location.hash=`/shop?${params.toString()}`;}
document.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]');
  if(dialog.open && event.target.closest('a[href^="#/"]')) dialog.close();
  if(!action) return;
  const {id,index}=action.dataset, type=action.dataset.action;
  if(type==='open-cart') openCart();
  else if(type==='close-cart') dialog.close();
  else if(type==='back-top'){event.preventDefault();main.focus({preventScroll:true});window.scrollTo({top:0,behavior:document.documentElement.classList.contains('motion-off')||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  else if(type==='motion'){const off=document.documentElement.classList.toggle('motion-off');action.setAttribute('aria-pressed',String(off));action.textContent=off?'Resume animations':'Pause animations';}
  else if(type==='wish' && findProduct(id)){
    const saved=state.wishlist.includes(id);state.wishlist=saved?state.wishlist.filter(x=>x!==id):[...state.wishlist,id];persist();
    if(currentRoute().path==='/wishlist'){render(false);const next=main.querySelector('.wish-button')||main;next.focus({preventScroll:true});}
    else document.querySelectorAll(`[data-action="wish"][data-id="${id}"]`).forEach(button=>{button.setAttribute('aria-pressed',String(!saved));button.setAttribute('aria-label',`${saved?'Add to':'Remove from'} wishlist: ${findProduct(id).name}`);button.textContent=button.classList.contains('save-detail')?(saved?'♡ Save for a little later':'♥ Saved to wishlist'):(saved?'♡':'♥');});
    notify(saved?'Removed from your wishlist.':'Saved for a little later.');
  } else if(type==='detail-minus'||type==='detail-plus'){const input=document.querySelector('#detail-qty');input.value=limitQty(Number(input.value)+(type==='detail-plus'?1:-1));}
  else if(['cart-minus','cart-plus','remove'].includes(type)){
    const item=state.cart[Number(index)];if(!item) return;
    if(type==='remove') state.cart.splice(Number(index),1);else item.qty=limitQty(item.qty+(type==='cart-plus'?1:-1));
    persist();renderCart();
    const replacement=dialog.querySelector(`[data-action="${type}"][data-index="${index}"]:not(:disabled)`)||dialog.querySelector('[data-action="close-cart"]');replacement.focus({preventScroll:true});
  } else if(type==='checkout'){const message=document.querySelector('#checkout-message');message.className='cart-message';message.textContent='This is a design preview. No order was placed. Connect a commerce backend and payment provider to enable checkout.';}
});
document.addEventListener('submit',event=>{
  if(event.target.id==='search-form'){event.preventDefault();updateShop('q',new FormData(event.target).get('q').trim());}
  if(event.target.id==='account-form'){event.preventDefault();document.querySelector('#account-status').textContent='The demo form is valid. No details were saved or sent, and no account was created.';event.target.reset();}
  if(event.target.id==='buy-form'){
    event.preventDefault();const p=findProduct(event.target.dataset.id),data=new FormData(event.target),option=data.get('option'),qty=limitQty(data.get('qty'));
    if(!p || !p.options.includes(option)) return;
    const item=state.cart.find(x=>x.id===p.id&&x.option===option);
    if(item) item.qty=limitQty(item.qty+qty);else state.cart.push({id:p.id,option,qty});persist();openCart();
  }
});
document.addEventListener('change',event=>{
  if(event.target.id==='sort') updateShop('sort',event.target.value);
  if(event.target.id==='detail-qty') event.target.value=limitQty(event.target.value);
  if(event.target.id==='product-option'){const p=findProduct(currentRoute().path.slice(9));if(p) document.querySelector('#detail-art').innerHTML=art(p,event.target.value);}
});
dialog.addEventListener('close',()=>document.body.classList.remove('cart-open'));
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close();}});
window.addEventListener('hashchange',()=>{if(dialog.open) dialog.close();render();});
window.addEventListener('storage',event=>{if(event.key!==STORE && event.key!==null) return;state=readState();updateCounts();if(dialog.open) renderCart();if(currentRoute().path==='/wishlist') render(false);});
document.querySelector('#year').textContent=new Date().getFullYear();
const motionButton=document.createElement('button');motionButton.className='motion-toggle';motionButton.dataset.action='motion';motionButton.type='button';motionButton.textContent='Pause animations';motionButton.setAttribute('aria-pressed','false');document.querySelector('.fine-print').append(motionButton);
updateCounts();render(false);
