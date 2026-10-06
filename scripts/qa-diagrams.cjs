const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright' : 'playwright');
const p=JSON.parse(fs.readFileSync('content/organic-polymer.json'));
const C={text:'#F0F5F8',muted:'#99ACBA',mint:'#89E1CB',purple:'#B7B2EF',gold:'#F0CE8C',red:'#FFA7A7'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function element(e){const color=C[e.color??'text'];const stroke=`stroke="${color}" stroke-width="2" fill="none" ${e.dashed?'stroke-dasharray="5 4"':''}`;
 if(e.type==='text')return `<text x="${e.x}" y="${e.y}" fill="${color}" font-size="${e.size??15}" text-anchor="${e.align??'middle'}">${esc(e.text)}</text>`;
 if(e.type==='line')return `<line ${stroke} x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}"/>`;
 if(e.type==='polyline')return `<polyline ${stroke} points="${e.points.map(x=>x.join(',')).join(' ')}"/>`;
 if(e.type==='rect')return `<rect ${stroke} x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" rx="6"/>`;
 return `<ellipse ${stroke} cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}"/>`;}
(async()=>{const browser=await chromium.launch({...(process.env.STUDY_CHROME_PATH ? {executablePath:process.env.STUDY_CHROME_PATH} : {}),args:['--no-zygote','--single-process']});
 try{const page=await browser.newPage({viewport:{width:1240,height:1000}});const fontPath=process.env.STUDY_FONT_PATH || '/tmp/NotoSansJP.ttf';const font=fs.existsSync(fontPath)?fs.readFileSync(fontPath).toString('base64'):'';
 await page.setContent(`<style>${font?'@font-face{font-family:Noto;src:url(data:font/ttf;base64,'+font+')}':''}*{box-sizing:border-box;font-family:Noto,sans-serif}body{margin:0;background:#0C141C;color:#F0F5F8;padding:24px}main{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}figure{margin:0;padding:20px;background:#16222E;border-radius:15px;min-height:450px}h3{font-size:16px}small{color:#99ACBA}svg{width:100%;overflow:visible}</style><main>${p.diagrams.map(d=>`<figure><small>${esc(d.id.split('.diagram.')[1])}</small><h3>${esc(d.title)}</h3><svg data-id="${d.id}" viewBox="0 0 ${d.width} ${d.height}" height="${d.height}">${d.elements.map(element).join('')}</svg></figure>`).join('')}</main>`);
 await page.evaluate(()=>document.fonts.ready);
 const boxes=await page.locator('svg').evaluateAll(svgs=>svgs.flatMap(svg=>[...svg.querySelectorAll('text')].map(t=>{const b=t.getBBox(),v=svg.viewBox.baseVal;return{id:svg.dataset.id,text:t.textContent,x:b.x,y:b.y,right:b.x+b.width,bottom:b.y+b.height,width:v.width,height:v.height}})));
 const clipped=boxes.filter(b=>b.x<-.5||b.y<-.5||b.right>b.width+.5||b.bottom>b.height+.5);
 await page.screenshot({path:'artifacts/polymer-diagrams-contact.png',fullPage:true});
 for(let i=0;i<p.diagrams.length;i++){const id=p.diagrams[i].id.split('.diagram.')[1];if(['pet','nylon66','nylon6','pmma','ester','hbond','quiz-pet','quiz-nylon66'].includes(id))await page.locator('figure').nth(i).screenshot({path:`/tmp/polymer-diagram-${id}.png`});}
 fs.writeFileSync('artifacts/polymer-diagram-qa.json',JSON.stringify({date:new Date().toISOString(),diagrams:p.diagrams.length,textElements:boxes.length,clippedText:clipped,limits:'Browser glyph bounds using Noto Sans JP; native font and expanded Android view require device acceptance'},null,2));
 console.log(JSON.stringify({diagrams:p.diagrams.length,textElements:boxes.length,clipped},null,2));assert.equal(clipped.length,0,'Clipped diagram text');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
