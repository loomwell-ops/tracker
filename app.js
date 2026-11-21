
const CFG={SUPABASE_URL:"https://ywowmewfdaalgoqrimyj.supabase.co",SUPABASE_ANON_KEY:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3b3dtZXdmZGFhbGdvcXJpbXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4ODk4NjAsImV4cCI6MjExMDQ2NTg2MH0.KXXW61f05PyTD-9Jixl9xJNtvqdXrnnuxB2nEf5V4b0",AI_URL:"https://loomwellops-ai.loomwellops.workers.dev"};
function fixUrl(u){u=String(u||"").trim().replace(/\s+/g,"");if(!u)return"";if(/^[a-z][a-z0-9+.-]*:/i.test(u))return/^https?:/i.test(u)?u:"";return/^[\w-]+(\.[\w-]+)+/.test(u)?"https://"+u.replace(/^\/+/,""):""}
const ST=["To Apply","Applied","Screening","Interviewing","Assessment","Offer Received","Rejected","Ghosted","Withdrawn"];
const OPEN=["To Apply","Applied","Screening","Interviewing","Assessment"];
let pendJd="";const K="lw.v3";let S,cur=null,ab=null,sample=null,dl=null,view="ov",U=null,sb=null,tm=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const blank=()=>({resume:"",goal:10,apps:[]});
const key=()=>K+(U?"."+U.id:"");
function load(){try{const r=localStorage.getItem(key());if(r)return JSON.parse(r)}catch(e){}return blank()}
function save(){try{localStorage.setItem(key(),JSON.stringify(S))}catch(e){}
if(sb&&U){clearTimeout(tm);$("sy").textContent="Saving…";tm=setTimeout(async()=>{const r=await push();$("sy").textContent=r==="ok"?"Synced":"Sync failed. Changes are saved on this device."},700)}}
function msg(t){$("msg").textContent=t;setTimeout(()=>{if($("msg").textContent===t)$("msg").textContent=""},4000)}
S=load();S.goal=S.goal||10;
if(window.claude){claude.use("sample").then(x=>sample=x).catch(()=>{});claude.use("downloads").then(x=>dl=x).catch(()=>{})}
const days=d=>Math.floor((Date.now()-new Date(d+"T00:00:00"))/864e5);
const host=l=>{try{const h=new URL(fixUrl(l)).hostname.split(".");return h[h.length-2]||"other"}catch(e){return"other"}};
$("f").innerHTML='<option value="">All statuses</option>'+ST.map(s=>`<option>${s}</option>`).join("");
$("th").onclick=()=>{const r=document.documentElement,d=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=d?"light":"dark"};
let rng=30,prev="",lastSync=null;
function snap(t){prev=JSON.stringify(S.apps);const m=$("msg");m.innerHTML=esc(t)+' <button class="s" id="undo">Undo</button>';$("undo").onclick=()=>{S.apps=JSON.parse(prev);save();render();m.textContent=""};setTimeout(()=>{if($("undo"))m.textContent=""},7000)}
function line(r){const n=r===90?13:r,sz=r===90?7:1,v=[];for(let i=n-1;i>=0;i--)v.push(S.apps.filter(a=>{const d=days(a.d);return d>=i*sz&&d<(i+1)*sz}).length);
const m=Math.max(2,...v),W=600,H=170,pt=v.map((c,i)=>(i*W/(n-1)).toFixed(1)+","+(H-12-c/m*(H-30)).toFixed(1)).join(" ");
return`<svg class="ln" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Applications over time"><polygon points="0,${H} ${pt} ${W},${H}" fill="var(--glow)"/><polyline points="${pt}" fill="none" stroke="var(--pill)" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`}
async function push(n=0){const t=new Date().toISOString();let r;
if(lastSync)r=await sb.from("trackers").update({data:S,updated_at:t}).eq("user_id",U.id).eq("updated_at",lastSync).select("updated_at");
else r=await sb.from("trackers").upsert({user_id:U.id,data:S,updated_at:t}).select("updated_at");
if(r.error)return"err";if(r.data&&r.data.length){lastSync=t;return"ok"}
if(n>2)return"err";const g=await sb.from("trackers").select("data,updated_at").eq("user_id",U.id).maybeSingle();
if(!g.data)return"err";const m=new Map((g.data.data.apps||[]).map(a=>[a.id,a]));S.apps.forEach(a=>m.set(a.id,a));S.apps=[...m.values()];if(!S.rs&&g.data.data.rs)S.rs=g.data.data.rs;lastSync=g.data.updated_at;render();return push(n+1)}
function vbars(rows){const m=Math.max(1,...rows.map(r=>r[1]));return'<div class="vb">'+rows.map(r=>`<div><div class="t"><b>${r[1]}</b><i style="--r:${r[1]/m}"></i></div><span>${esc(r[0])}</span></div>`).join("")+'</div>'}
function bars(rows){const m=Math.max(1,...rows.map(r=>r[1]));return rows.map(r=>`<div class="br"><span>${esc(r[0])}</span><i style="width:${r[1]/m*100}%"></i><b>${r[1]}</b></div>`).join("")}
function card(a){const age=days(a.d),old=a.s==="Applied"&&age>=14,gh=old&&age>=30,dup=S.apps.filter(x=>x.c===a.c).length,due=a.f&&a.f<=today()&&OPEN.includes(a.s);
return`<div class="card" data-id="${a.id}" data-st="${esc(a.s)}" ${view==="board"?'draggable="true"':""}><div><h3>${esc(a.t)}${a.tr?'<span class="dot" title="Tailored resume saved"></span>':""}${gh?'<span class="tag w">Ghosted? '+age+'d</span>':old?'<span class="tag w">Follow up · '+age+'d</span>':""}${due?'<span class="tag w">Due</span>':""}${dup>1?'<span class="tag">'+dup+' roles here</span>':""}</h3><small>${esc(a.c)} · ${esc(a.d)}${a.p?" · "+esc(a.p):""}${a.k?" · "+esc(a.k):""}</small></div>
<div class="act"><select data-a="st">${ST.map(s=>`<option${s===a.s?" selected":""}>${s}</option>`).join("")}</select><button class="s p" data-a="tl">Tailor</button><button class="s" data-a="ed">Edit</button>${fixUrl(a.l)?`<a class="note" href="${esc(fixUrl(a.l))}" target="_blank" rel="noopener noreferrer">Link</a>`:""}</div></div>`}
function render(){
const A=S.apps,n=s=>A.filter(a=>a.s===s).length,tot=A.length;
const resp=A.filter(a=>["Screening","Interviewing","Assessment","Offer Received","Rejected"].includes(a.s)).length;
const fu=A.filter(a=>a.s==="Applied"&&days(a.d)>=14).length,wk=A.filter(a=>days(a.d)<7).length;
$("stats").innerHTML=[["Total",tot],["Interviewing",n("Interviewing")],["Offers",n("Offer Received")],["Need follow-up",fu]].map(x=>`<div class="chip"><b>${x[1]}</b><span>${x[0]}</span></div>`).join("")+`<div class="chip"><b>${wk}/<input id="gl" type="number" min="1" value="${S.goal}" aria-label="Weekly goal"></b><span>Applied this week (goal)</span></div>`;
$("gl").onchange=e=>{S.goal=Math.max(1,+e.target.value||10);save();render()};
const rp=tot?Math.round(resp/tot*100):0;const dueL=A.filter(a=>OPEN.includes(a.s)&&((a.f&&a.f<=today())||(a.s==="Applied"&&days(a.d)>=14))).slice(0,4);
const dueP=dueL.length?`<div class="panel s6"><h4>Needs a follow-up</h4>${dueL.map(a=>`<div class="rw" data-id="${a.id}"><b>${esc(a.t)}</b><small>${esc(a.c)}, ${a.f&&a.f<=today()?"follow-up date "+esc(a.f):"applied "+days(a.d)+" days ago"}</small><span><button class="s" data-a="fu">Draft email</button></span></div>`).join("")}</div>`:"";const wks=[5,4,3,2,1,0].map(i=>[i?i+"w ago":"This week",A.filter(a=>Math.floor(days(a.d)/7)===i).length]);
const src={};A.forEach(a=>{const h=host(a.l);src[h]=(src[h]||0)+1});
const top=Object.entries(src).sort((a,b)=>b[1]-a[1]).slice(0,5);
const RP=["Screening","Interviewing","Assessment","Offer Received","Rejected"];
const rate=g=>{const m={};A.filter(a=>a.s!=="To Apply").forEach(a=>{const k=g(a);(m[k]=m[k]||[0,0]);m[k][0]++;if(RP.includes(a.s))m[k][1]++});return bars(Object.entries(m).filter(e=>e[1][0]).sort((x,y)=>y[1][0]-x[1][0]).slice(0,5).map(e=>[e[0]+" ("+e[1][1]+"/"+e[1][0]+")",Math.round(e[1][1]/e[1][0]*100)]))||'<p class="note">Add applied jobs to see this.</p>'};
const stt=ST.map(s=>[s,n(s)]).filter(r=>r[1]);
$("ch").innerHTML=`${dueP}<div class="panel"><h4>Response rate</h4><div class="ring" style="--p:${rp}"><b>${rp}%</b></div><p class="note" style="text-align:center;margin:0">${resp} of ${tot} heard back</p></div><div class="panel s4"><h4>Applications over time</h4><div class="rg">${[[7,"Week"],[30,"Month"],[90,"Quarter"]].map(x=>`<button class="s" data-r="${x[0]}" aria-pressed="${rng===x[0]}">${x[1]}</button>`).join("")}</div>${line(rng)}</div><div class="panel"><h4>By status</h4>${bars(stt)}</div><div class="panel"><h4>Top job sites</h4>${bars(top)}</div><div class="panel"><h4>Reply rate by site (%)</h4>${rate(a=>host(a.l))}</div><div class="panel s3"><h4>Reply rate by resume version (%)</h4>${rate(a=>(RS()[a.ri||0]||{n:"Main"}).n)}</div><div class="panel s3"><h4>Recent activity</h4>${[...A].sort((a,b)=>(b.d||"").localeCompare(a.d||"")).slice(0,5).map(a=>`<div class="rw" data-id="${a.id}"><b>${esc(a.t)}</b><small>${esc(a.c)} ${esc(a.d||"")}</small><span class="tag">${esc(a.s)}</span></div>`).join("")||'<p class="note">Nothing yet.</p>'}</div>`;
const q=$("q").value.toLowerCase(),f=$("f").value;
const L=A.filter(a=>(!f||a.s===f)&&(a.t+" "+a.c+" "+(a.n||"")).toLowerCase().includes(q)).sort((a,b)=>b.d.localeCompare(a.d));
$("vc").setAttribute("aria-pressed",view==="cal");$("vl").setAttribute("aria-pressed",view==="list");$("vb").setAttribute("aria-pressed",view==="board");
if(view==="cal"){const ev=[];A.forEach(a=>{if(a.i)ev.push([a.i,"Interview",a]);if(a.f&&OPEN.includes(a.s))ev.push([a.f,"Follow up",a])});ev.sort((x,y)=>x[0].localeCompare(y[0]));const t0=today();
$("list").innerHTML='<div class="row"><button class="s" id="ics">Export .ics (add to phone calendar)</button></div>'+(ev.length?ev.map(e=>`<div class="card" data-id="${e[2].id}"><div><h3>${esc(e[1])}: ${esc(e[2].t)}${e[0].slice(0,10)<t0?'<span class="tag w">Past</span>':e[0].slice(0,10)===t0?'<span class="tag w">Today</span>':""}</h3><small>${esc(e[2].c)} · ${esc(e[0].replace("T"," "))}</small></div><div class="act"><button class="s" data-a="ed">Open</button></div></div>`).join(""):'<p class="note">No dates yet. Add an interview date or follow-up date to a job.</p>');
const ic=$("ics");if(ic)ic.onclick=()=>{const z=x=>x.replace(/[-:]/g,"").slice(0,15).padEnd(15,"0").replace(/^(.{8})$/,"$1T000000"),L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//LoomwellOps//EN"];ev.forEach(e=>{const d=e[0].includes("T")?z(e[0].length===16?e[0]+":00":e[0]):e[0].replace(/-/g,"");L.push("BEGIN:VEVENT","UID:"+e[2].id+e[1].replace(/\W/g,"")+"@loomwellops","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z",e[0].includes("T")?"DTSTART:"+d:"DTSTART;VALUE=DATE:"+d,"SUMMARY:"+e[1]+": "+e[2].t+" @ "+e[2].c,"END:VEVENT")});L.push("END:VCALENDAR");out0("loomwellops-calendar.ics",L.join("\r\n"),"text/calendar")}}
else if(view==="board")$("list").innerHTML='<div class="kb">'+ST.map(s=>{const c=L.filter(a=>a.s===s);return`<div class="col" data-s="${s}"><h4>${s}<span>${c.length}</span></h4>${c.map(card).join("")}</div>`}).join("")+"</div>";
else $("list").innerHTML=L.map(card).join("")||(S.apps.length?'<p class="note">No matches.</p>':'<div class="empty"><b>Your tracker is empty.</b><p>Start with <b>Master resume</b> (paste or drop your resume), then click <b>+ Add job</b> for your first application. You can also import a backup file.</p></div>')}
$("q").oninput=render;$("f").onchange=render;
$("vl").onclick=()=>{view="list";render()};$("vb").onclick=()=>{view="board";render()};$("vc").onclick=()=>{view="cal";render()};
const byId=id=>S.apps.find(x=>x.id===id);
$("list").onchange=e=>{if(e.target.dataset.a!=="st")return;snap("Status changed.");byId(e.target.closest(".card").dataset.id).s=e.target.value;save();render()};
$("list").onclick=e=>{const b=e.target.closest("button");const c=b&&b.closest(".card");if(!c)return;cur=byId(c.dataset.id);b.dataset.a==="ed"?editJob(cur):openTailor(cur)};
$("list").ondragstart=e=>{const c=e.target.closest(".card");if(c)e.dataTransfer.setData("text",c.dataset.id)};
$("list").ondragover=e=>{const c=e.target.closest(".col");if(c){e.preventDefault();document.querySelectorAll(".col.over").forEach(x=>x.classList.remove("over"));c.classList.add("over")}};
$("list").ondrop=e=>{const c=e.target.closest(".col");if(!c)return;e.preventDefault();const a=byId(e.dataTransfer.getData("text"));if(a){snap("Moved to "+c.dataset.s+".");a.s=c.dataset.s;save();render()}};
function editJob(a){cur=a;$("djt").textContent=a?"Edit job":"Add job";[["jt","t"],["jc","c"],["jp","p"],["jl","l"],["jk","k"],["jn","n"],["jf","f"],["ji","i"],["jlg","lg"]].forEach(p=>$(p[0]).value=a?.[p[1]]||"");pendJd="";$("jam").textContent="";
$("jd").value=a?.d||today();$("jdel").hidden=!a;$("jdel").textContent="Delete";$("dj").showModal()}
$("jla").onclick=()=>{const t=$("jlg").value;$("jlg").value=today()+": \n"+t;$("jlg").focus();$("jlg").setSelectionRange(12,12)};
$("jaf").onclick=async()=>{const u=fixUrl($("jl").value);if(!u){$("jam").textContent="Paste the full posting link first (it should start with https://).";return}$("jl").value=u;$("jaf").disabled=true;$("jam").textContent="Reading the posting...";
try{const tok=(await sb.auth.getSession()).data.session?.access_token;const r=await fetch(CFG.AI_URL,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+tok},body:JSON.stringify({url:u})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Failed ("+r.status+")");
if(j.title&&!$("jt").value)$("jt").value=j.title;if(j.company&&!$("jc").value)$("jc").value=j.company;if(j.pay&&!$("jp").value)$("jp").value=j.pay;pendJd=j.description||"";$("jam").textContent="Filled in. Check the details, then Save. The description is saved for tailoring."}
catch(e){const m=e.message||"Could not read that link.";$("jam").textContent=/limit|sign in|Unauthorized/i.test(m)?m:m+" Some sites (LinkedIn, Indeed, OnlineJobs) block automatic reading. You can still save the link and paste the description when you tailor."}$("jaf").disabled=false};
$("add").onclick=()=>editJob(null);$("jx").onclick=()=>$("dj").close();
$("js").onclick=()=>{if(!$("jt").value.trim())return;const v={t:$("jt").value.trim(),c:$("jc").value.trim(),p:$("jp").value.trim(),d:$("jd").value,l:fixUrl($("jl").value)||$("jl").value.trim(),k:$("jk").value.trim(),n:$("jn").value,f:$("jf").value,i:$("ji").value,lg:$("jlg").value};if(pendJd)v.jd=pendJd;
if(cur)Object.assign(cur,v);else S.apps.push({id:"n"+Date.now(),s:"Applied",jd:"",tr:"",...v});save();render();$("dj").close()};
$("jdel").onclick=()=>{if($("jdel").textContent==="Delete"){$("jdel").textContent="Click again to confirm";return}snap("Job deleted.");S.apps=S.apps.filter(x=>x!==cur);save();render();$("dj").close()};
const RS=()=>{if(!S.rs||!S.rs.length)S.rs=[{n:"Main",t:S.resume||""}];return S.rs};
const curRes=()=>(RS()[+$("tsel").value||0]||{t:""}).t;let ri=0;
function fillRs(){const r=RS();ri=Math.min(ri,r.length-1);$("rsel").innerHTML=r.map((x,i)=>`<option value="${i}">${esc(x.n)}</option>`).join("");$("rsel").value=ri;$("rnm").value=r[ri].n;$("rt").value=r[ri].t}
function stash(){const r=RS();r[ri].t=$("rt").value;r[ri].n=$("rnm").value.trim()||r[ri].n}
$("rsel").onchange=()=>{stash();ri=+$("rsel").value;fillRs()};
$("rnw").onclick=()=>{stash();RS().push({n:"Version "+(RS().length+1),t:""});ri=RS().length-1;fillRs()};
$("rdl").onclick=()=>{if(RS().length>1&&confirm("Delete this resume version?")){RS().splice(ri,1);ri=0;fillRs()}};
$("mr").onclick=()=>{ri=0;fillRs();$("dr").showModal()};$("rx").onclick=()=>$("dr").close();
$("rs").onclick=()=>{stash();S.resume=RS()[0].t;save();$("dr").close()};
function openTailor(a){$("dtt").textContent=a.t+" @ "+a.c;$("td").value=a.jd||"";$("to").value=a.tr||"";$("cl").value=a.cl||"";
$("tsel").innerHTML=RS().map((x,i)=>`<option value="${i}">${esc(x.n)}</option>`).join("");$("tsel").value=a.ri<RS().length?a.ri||0:0;$("tnt").value=a.nt||"";$("xo").value="";
$("tn").textContent=RS().some(x=>x.t.trim())?"":"Add your master resume first (Master resume button).";$("dt").showModal()}
$("tx").onclick=()=>{ab&&ab.abort();$("dt").close()};$("ts").onclick=()=>ab&&ab.abort();
async function ask(p,on,sig){
if(sample)return sample(p,{onText:({text})=>on(text),signal:sig,cache:false});
const tok=(await sb.auth.getSession()).data.session?.access_token;
if(!tok)throw{code:"auth",msg:"You are not signed in. Sign out and sign in again."};
let r;try{r=await fetch(CFG.AI_URL,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+tok},body:JSON.stringify({prompt:p}),signal:sig})}
catch(e){if(e&&e.name==="AbortError")throw{code:"aborted"};throw{code:"network",msg:"Could not reach the AI worker (network or CORS)."}}
if(!r.ok){let b="";try{b=(await r.text()).slice(0,300)}catch(e){}throw{code:r.status===429?"rate_limited":"failed",msg:"AI worker returned "+r.status+(b?": "+b:"")}}
if((r.headers.get("content-type")||"").includes("text/plain")&&r.body){const rd=r.body.getReader(),dc=new TextDecoder();let acc="";for(;;){const{done,value}=await rd.read();if(done)break;acc+=dc.decode(value,{stream:true});on(acc)}if(!acc.trim())throw{code:"failed",msg:"The AI returned nothing. Try again."};return}
let j;try{j=await r.json()}catch(e){throw{code:"badjson",msg:"AI worker reply is not JSON."}}
if(typeof j.text!=="string")throw{code:"badjson",msg:"AI worker reply has no 'text' field."}
on(j.text)}
async function gen(kind){
if(!curRes().trim()){$("tn").textContent="Add your master resume first.";return}
if(!$("td").value.trim()){$("tn").textContent="Paste the job description first.";return}
if(!sample&&!(CFG.AI_URL&&sb)){$("tn").textContent="AI is not set up yet. See the README (AI_URL).";return}
cur.jd=$("td").value;save();ab=new AbortController();$("tg").disabled=$("tl").disabled=true;$("ts").disabled=false;$("tn").textContent="Generating…";
const ctx=`JOB: ${cur.t} at ${cur.c}\nJOB DESCRIPTION:\n${$("td").value}\nMASTER RESUME:\n${curRes()}`;
const p=kind==="r"?`You are an expert resume writer. Tailor the MASTER RESUME to the JOB below.
Rules:
- Use ONLY facts in the master resume. Never invent employers, titles, dates, metrics, tools or credentials.
- Reorder and rephrase bullets so the most relevant experience comes first; mirror the job's keywords only where the candidate truly has that experience.
- Write a 2-3 line summary aimed at this role. ATS-friendly: plain headings, no tables, about one page.
- Keep every claim exactly as strong as the master: never add words like "consistently", "expert" or "advanced", never add channels (e.g. email), tools or duties the master does not state, and never relabel a role (a moderator is not technical support).
- Format: "# FULL NAME", a headline line, a contact line, then "## SECTION" headings, "### Job title" lines with "**Company** | dates" beneath, and "- " bullets. Do not put notes inside the resume.
- After the resume write a line containing only ===NOTES=== and then the notes: keywords matched, honest gaps, and 3 interview talking points.
${ctx}`:`Write a concise, warm cover letter (under 250 words, 3 short paragraphs) for the JOB below, from the candidate in the MASTER RESUME.
Rules: use ONLY facts from the resume, never invent achievements; connect 2 or 3 real strengths to what the posting asks for; no clichés; plain text; sign off with the candidate's name from the resume.
${ctx}`;
const on=kind==="r"?(x=>{const k=x.indexOf("===NOTES==="),i=k<0?x:x.slice(0,k);$("to").value=i.trim();if(k>=0)$("tnt").value=x.slice(k+10).trim()}):(x=>{$("cl").value=x});
try{await ask(p,on,ab.signal);$("tn").textContent="Done. Review before sending."}
catch(e){console.error("Tailor error:",e);$("tn").textContent=e&&e.code==="not_granted"?"Permission was declined.":e&&e.code==="rate_limited"?(/Daily/.test(e.msg||"")?"Daily AI limit reached. Try again tomorrow.":"Rate limited. Try again shortly."):e&&e.code==="aborted"?"Stopped.":e&&e.msg?e.msg:"Failed: "+(e&&e.message||"unknown error")}
$("tg").disabled=$("tl").disabled=false;$("ts").disabled=true}
const LD=u=>new Promise((ok,no)=>{const e=document.createElement("script");e.src=u;e.onload=ok;e.onerror=()=>no(new Error("load"));document.head.appendChild(e)});
const mdBlocks=md=>md.split("\n").map(l=>{l=l.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/\s+$/,"");let m;
if(m=l.match(/^#\s+(.*)/))return{k:"n",t:m[1]};
if(m=l.match(/^##\s+(.*)/))return{k:"h",t:m[1].toUpperCase()};
if(m=l.match(/^###\s+(.*)/))return{k:"r",t:m[1]};
if(m=l.match(/^\s*[-*\u2022]\s+(.*)/))return{k:"b",t:m[1]};
return l.trim()?{k:"p",t:l}:null}).filter(Boolean);
const mdRuns=t=>t.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(s=>s.startsWith("**")?{t:s.slice(2,-2),b:1}:{t:s.replace(/\*/g,"")});
function buildDocx(md,D){const{Document,Paragraph,TextRun,AlignmentType,BorderStyle}=D;let top=true;
const R=(t,o={})=>mdRuns(t).map(r=>new TextRun({text:r.t,bold:!!(r.b||o.b),size:o.s||21,font:"Calibri"}));
const ch=mdBlocks(md).map(b=>{if(b.k==="h")top=false;
if(b.k==="n")return new Paragraph({alignment:AlignmentType.CENTER,children:R(b.t,{b:1,s:32})});
if(b.k==="h")return new Paragraph({spacing:{before:200,after:60},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:"666666",space:1}},children:R(b.t,{b:1,s:23})});
if(b.k==="r")return new Paragraph({spacing:{before:100},children:R(b.t,{b:1})});
if(b.k==="b")return new Paragraph({bullet:{level:0},children:R(b.t)});
return new Paragraph({alignment:top?AlignmentType.CENTER:AlignmentType.LEFT,spacing:{after:60},children:R(b.t)})});
return new Document({sections:[{properties:{page:{margin:{top:720,bottom:720,left:864,right:864}}},children:ch}]})}
function buildPdf(md,J){const d=new J({unit:"pt",format:"letter"}),W=612,M=54,TW=W-2*M;let y=M,top=true;
const fx=s=>s.replace(/[\u2013\u2014]/g,"-").replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/\u2026/g,"...").replace(/[^\x20-\x7E\u00A0-\u00FF]/g,"");
function put(rs,o){const sz=o.s||10.5,x0=M+(o.i||0),w=TW-(o.i||0);d.setFontSize(sz);const ws=[];
rs.forEach(r=>fx(r.t).split(/\s+/).filter(Boolean).forEach(t=>ws.push({t,b:r.b||o.b})));let ln=[],lw=0;
const flush=()=>{if(!ln.length)return;if(y>792-M){d.addPage();y=M}let x=o.c?(W-lw)/2:x0;ln.forEach(k=>{d.setFont("helvetica",k.b?"bold":"normal");d.text(k.t,x,y);x+=k.w});y+=sz*1.35;ln=[];lw=0};
ws.forEach(k=>{d.setFont("helvetica",k.b?"bold":"normal");k.w=d.getTextWidth(k.t+" ");if(lw+k.w>w+4&&ln.length)flush();ln.push(k);lw+=k.w});flush()}
mdBlocks(md).forEach(b=>{const r=mdRuns(b.t);
if(b.k==="n"){put(r,{s:17,b:1,c:1});y+=2}
else if(b.k==="h"){top=false;y+=7;put(r,{s:11,b:1});d.setDrawColor(120);d.line(M,y-9,W-M,y-9);y+=1}
else if(b.k==="r"){y+=3;put(r,{b:1})}
else if(b.k==="b"){const y0=y;put(r,{i:14});d.setFillColor(0);d.circle(M+4,y0-3.3,1.2,"F")}
else put(r,{c:top})});
return d}

$("dw").onclick=async()=>{const m=$("to").value;if(!m.trim()){$("tn").textContent="Tailor a resume first.";return}try{$("tn").textContent="Building Word file...";await LD("https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.js");const b=await docx.Packer.toBlob(buildDocx(m,docx));await out(fn("resume.docx"),b,"application/vnd.openxmlformats-officedocument.wordprocessingml.document");$("tn").textContent="Word file downloaded."}catch(e){$("tn").textContent="Could not build the Word file. Use Download resume (.md) instead."}};
$("dp").onclick=async()=>{const m=$("to").value;if(!m.trim()){$("tn").textContent="Tailor a resume first.";return}try{$("tn").textContent="Building PDF...";await LD("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");await out(fn("resume.pdf"),buildPdf(m,window.jspdf.jsPDF).output("blob"),"application/pdf");$("tn").textContent="PDF downloaded."}catch(e){$("tn").textContent="Could not build the PDF."}};
$("xg").onclick=async()=>{const k=$("xk").value,res=curRes();if(!res.trim()||!$("td").value.trim()){$("tn").textContent="Need a master resume and the job description.";return}
const T={m:"Score how well the MASTER RESUME fits the JOB. Reply with: Match score /100, Strong matches, Missing keywords or skills (only ones truly absent from the resume), and a one-line verdict on whether to apply. Max 12 lines.",i:"List 8 likely interview questions for this job, each with a short answer outline using ONLY facts from the resume. Where the resume has a gap, say so and suggest an honest way to answer.",f:"Write a short polite follow-up email (under 90 words, subject line first) for an application sent a week ago with no reply.",t:"Write a short thank-you email (under 120 words, subject line first) after an interview. Use [Interviewer name] as a placeholder and mention 1 or 2 real strengths from the resume.",r:"Write a gracious reply (under 70 words, subject line first) to a rejection, asking to be kept in mind for future roles."}[k];
$("xg").disabled=true;$("tn").textContent="Generating...";ab=new AbortController();
try{await ask(T+"\nRules: use ONLY facts in the resume; never invent anything.\nJOB: "+cur.t+" at "+cur.c+"\nJOB DESCRIPTION:\n"+$("td").value+"\nMASTER RESUME:\n"+res,x=>{$("xo").value=x},ab.signal);$("tn").textContent="Done."}
catch(e){$("tn").textContent=e&&e.msg?e.msg:"Stopped or failed."}$("xg").disabled=false};
$("tg").onclick=()=>gen("r");$("tl").onclick=()=>gen("c");
const copy=async id=>{try{await navigator.clipboard.writeText($(id).value);$("tn").textContent="Copied."}catch(e){$(id).select();$("tn").textContent="Press Ctrl/Cmd+C to copy."}};
$("c1").onclick=()=>copy("to");$("c2").onclick=()=>copy("cl");
async function out(name,text,type){const b=new Blob([text],{type});if(dl){try{await dl.save({filename:name,data:b})}catch(e){}return}
const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e3)}
const out0=out;
const fn=s=>(cur.c+"-"+cur.t).replace(/[^\w-]+/g,"_")+"-"+s;
$("d1").onclick=()=>out(fn("resume.md"),$("to").value,"text/markdown");$("d2").onclick=()=>out(fn("cover-letter.txt"),$("cl").value,"text/plain");
$("tsv").onclick=()=>{cur.tr=$("to").value;cur.nt=$("tnt").value;cur.ri=+$("tsel").value||0;cur.cl=$("cl").value;cur.jd=$("td").value;save();render();$("tn").textContent="Saved."};
$("bk").onclick=()=>out0("job-tracker-backup.json",JSON.stringify(S),"application/json");
$("cv").onclick=()=>out0("job-applications.csv","Job,Company,Pay,Date,Status,Contact,Link\n"+S.apps.map(a=>[a.t,a.c,a.p,a.d,a.s,a.k,a.l].map(v=>'"'+String(v||"").replace(/"/g,'""')+'"').join(",")).join("\n"),"text/csv");
$("im").onclick=()=>$("fi").click();
$("fi").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!Array.isArray(d.apps))throw 0;
const ids=new Set(S.apps.map(a=>a.id));let c=0;d.apps.forEach(a=>{if(!ids.has(a.id)){S.apps.push(a);c++}});if(!S.resume&&d.resume)S.resume=d.resume;if(!S.rs&&d.rs)S.rs=d.rs;save();render();msg("Imported "+c+" new jobs.")}catch(x){msg("That file is not a valid backup.")}e.target.value=""};
async function enter(user){U=user;S=load();
if(sb){lastSync=null;const r=await sb.from("trackers").select("data,updated_at").eq("user_id",U.id).maybeSingle();if(r.data&&r.data.data){S=r.data.data;lastSync=r.data.updated_at}else if(r.error)msg("Could not load cloud data. Showing this device's copy.")}
S.goal=S.goal||10;S.apps=S.apps||[];$("auth").hidden=true;$("app").hidden=false;$("so").hidden=false;$("dd").hidden=false;$("who").textContent=U.email;render()}
if(CFG.SUPABASE_URL&&window.supabase){
sb=supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY);$("app").hidden=true;$("auth").hidden=false;
sb.auth.onAuthStateChange((ev,s)=>{setTimeout(()=>{
if(ev==="PASSWORD_RECOVERY"){const np=prompt("Enter a new password (8+ characters)");if(np&&np.length>=8)sb.auth.updateUser({password:np})}
if(s&&s.user){if(!U||U.id!==s.user.id)enter(s.user)}
else if(U){U=null;S=blank();$("app").hidden=true;$("auth").hidden=false;$("so").hidden=true;$("dd").hidden=true;$("who").textContent=""}},0)});
const go=async m=>{const email=$("ae").value.trim(),pw=$("ap").value;if(!email||pw.length<8){$("am").textContent="Enter your email and a password of at least 8 characters.";return}
$("am").textContent="Please wait…";const r=m==="in"?await sb.auth.signInWithPassword({email,password:pw}):await sb.auth.signUp({email,password:pw,options:{emailRedirectTo:location.href.split("#")[0]}});
$("am").textContent=r.error?r.error.message:m==="up"&&!r.data.session?"Check your email to confirm your account, then sign in.":""};
$("ain").onclick=()=>go("in");$("aup").onclick=()=>go("up");
$("afg").onclick=async()=>{const email=$("ae").value.trim();if(!email){$("am").textContent="Enter your email first.";return}const r=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.href.split("#")[0]});$("am").textContent=r.error?r.error.message:"Password reset email sent."};
$("so").onclick=()=>sb.auth.signOut();
$("dd").onclick=async()=>{if($("dd").textContent==="Delete my cloud data"){$("dd").textContent="Click again to confirm";return}
await sb.from("trackers").delete().eq("user_id",U.id);lastSync=null;S=blank();try{localStorage.removeItem(key())}catch(e){}$("dd").textContent="Delete my cloud data";render();msg("Cloud data deleted.")}
}else{$("auth").hidden=true;render()}
;

(function(){var g=function(i){return document.getElementById(i)},ta=g("rt"),st=g("rst"),inp=g("rff"),dlg=g("dr");if(!ta||!dlg)return;
function say(t){st.textContent=t}
function load(src){return new Promise(function(ok,no){var s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=function(){no(new Error("load"))};document.head.appendChild(s)})}
async function pdfText(f){if(!window.pdfjsLib)await load("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
var d=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise,out=[];
for(var i=1;i<=d.numPages;i++){var p=await d.getPage(i),c=await p.getTextContent(),line="",y=null;
c.items.forEach(function(it){var yy=Math.round(it.transform[5]);if(y!==null&&Math.abs(yy-y)>2)line+="\n";line+=it.str+" ";y=yy});out.push(line)}
return out.join("\n\n")}
async function take(f){if(!f)return;var n=f.name.toLowerCase(),t="";say("Reading "+f.name+"...");
try{if(/\.pdf$/.test(n))t=await pdfText(f);
else if(/\.docx$/.test(n)){if(!window.mammoth)await load("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");t=(await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()})).value}
else if(/\.(txt|md)$/.test(n))t=await f.text();
else{say("Use a PDF, Word (.docx), or text file.");return}}
catch(e){say("Could not read that file. Paste the text instead.");return}
t=t.replace(/[ \t]+/g," ").replace(/ ?\n ?/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
if(!t){say("No text found. A scanned PDF has no text, so paste it instead.");return}
if(ta.value.trim()&&!confirm("Replace the text in the box with this file?")){say("Kept your current text.");return}
ta.value=t;say("Loaded "+f.name+". Check that it looks right, then click Save.")}
["dragenter","dragover"].forEach(function(ev){dlg.addEventListener(ev,function(e){e.preventDefault();dlg.classList.add("drag")})});
["dragleave","drop"].forEach(function(ev){dlg.addEventListener(ev,function(e){e.preventDefault();dlg.classList.remove("drag")})});
dlg.addEventListener("drop",function(e){take(e.dataTransfer&&e.dataTransfer.files[0])});
g("rf").addEventListener("click",function(){inp.click()});
inp.addEventListener("change",function(){take(inp.files[0]);inp.value=""});
g("mr").addEventListener("click",function(){say("")})})();
;

(function(){var g=function(i){return document.getElementById(i)},pw=g("spw");
if(pw)pw.addEventListener("change",function(){g("ap").type=pw.checked?"text":"password"});
var btn=g("demo");if(!btn)return;
function iso(n){var d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
btn.addEventListener("click",function(){
var rf=window.fetch;window.fetch=function(u){if(typeof u==="string"&&CFG.AI_URL&&u.indexOf(CFG.AI_URL)===0)return Promise.resolve(new Response(JSON.stringify({error:"The AI tools are off in the demo. Create a free account to use them."}),{status:403,headers:{"content-type":"application/json"}}));return rf.apply(this,arguments)};
save=function(){};U=null;
S={resume:"Sample master resume (demo). After you create a free account, paste or drop your own resume here.",goal:5,apps:[
{id:"d1",s:"Interviewing",t:"GoHighLevel Automation Specialist",c:"Brightpath Fitness (sample)",p:"$12/hr",d:iso(-9),f:iso(2),i:iso(3)+"T10:00",k:"Maya, recruiter",n:"Prepare two example follow-up workflows.",lg:"",jd:"",tr:"",l:""},
{id:"d2",s:"Screening",t:"Executive Assistant",c:"Northline Logistics (sample)",p:"$9/hr",d:iso(-6),f:iso(1),k:"",n:"",lg:"",jd:"",tr:"",l:"",i:""},
{id:"d3",s:"Applied",t:"Virtual Assistant, Lead Follow-Up",c:"Harbor Dental Group (sample)",p:"",d:iso(-12),f:iso(-1),k:"",n:"No reply yet. Send a short follow-up.",lg:"",jd:"",tr:"",l:"",i:""},
{id:"d4",s:"Applied",t:"Operations Support",c:"Summit Auto Wraps (sample)",p:"",d:iso(-3),f:iso(4),k:"",n:"",lg:"",jd:"",tr:"",l:"",i:""},
{id:"d5",s:"To Apply",t:"CRM Administrator",c:"Clearview Realty (sample)",p:"",d:"",f:"",k:"",n:"Tailor the resume first.",lg:"",jd:"",tr:"",l:"",i:""},
{id:"d6",s:"Offer Received",t:"Social Media Manager",c:"Palm & Pine Studio (sample)",p:"$1,500/mo",d:iso(-20),f:"",k:"",n:"Reply by Friday.",lg:"",jd:"",tr:"",l:"",i:""},
{id:"d7",s:"Rejected",t:"Admin Assistant",c:"Redwood Clinic (sample)",p:"",d:iso(-18),f:"",k:"",n:"",lg:"",jd:"",tr:"",l:"",i:""},
{id:"d8",s:"Ghosted",t:"Customer Success Associate",c:"Lumen Software (sample)",p:"",d:iso(-30),f:"",k:"",n:"",lg:"",jd:"",tr:"",l:"",i:""}]};
g("auth").hidden=true;g("app").hidden=false;g("who").textContent="Demo";g("demobar").hidden=false;render()});
g("demox").addEventListener("click",function(){location.reload()})})();
;
document.getElementById("addf").addEventListener("click",function(){editJob(null)});;

(function(){
const TT={ov:"Overview",list:"Applications",board:"Pipeline",cal:"Schedule"},SUB={list:"Newest first. Search, or filter by status.",board:"Drag a card to change its status.",cal:"Interviews and follow-up dates."};
const EMPTY='<div class="panel s6"><h4>Start your search here</h4><p class="note">Three steps and you are tracking.</p><div class="row"><button class="p" data-k="mr">1. Add your master resume</button><button data-k="hadd">2. Add your first job</button><button data-k="im">Or import a backup</button></div></div>';
const tabs=[...document.querySelectorAll(".tabs button")],R0=render;
function ind(){const a=document.querySelector(".tabs [aria-selected=true]"),i=$("ind");if(a&&i){i.style.width=a.offsetWidth+"px";i.style.transform="translateX("+a.offsetLeft+"px)"}}
render=function(){document.body.dataset.view=view;R0();tabs.forEach(b=>b.setAttribute("aria-selected",b.dataset.v===view));
const A=S.apps,fu=A.filter(a=>a.s==="Applied"&&days(a.d)>=14).length;
$("pt").textContent=TT[view];
$("ps").textContent=view!=="ov"?SUB[view]:A.length?A.length+(A.length===1?" application":" applications")+" tracked. "+(fu?fu+" need a follow-up.":"Nothing needs a follow-up."):"Nothing tracked yet. Add your first job.";if(view==="ov"&&!A.length)$("ch").innerHTML=EMPTY;ind()};
tabs.forEach(b=>b.onclick=()=>{view=b.dataset.v;render()});
addEventListener("resize",ind);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(ind);
document.querySelectorAll(".dock button").forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==="s"){view="list";render();$("q").focus()}else if(k==="r")$("mr").click();else if(k==="c"){view="cal";render()}else $("bk").click()});
$("hadd").onclick=()=>editJob(null);
$("ch").onclick=e=>{const b=e.target.closest("button"),r=e.target.closest(".rw");
if(b&&b.dataset.r){rng=+b.dataset.r;render();return}
if(b&&b.dataset.k){$(b.dataset.k).click();return}
if(r){cur=byId(r.dataset.id);if(b&&b.dataset.a==="fu"){openTailor(cur);$("xk").value="f"}else editJob(cur)}};
const typing=()=>/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName)||document.querySelector("dialog[open]")||$("app").hidden;
addEventListener("keydown",e=>{if(e.metaKey||e.ctrlKey||e.altKey||typing())return;if(e.key==="n"){e.preventDefault();editJob(null)}else if(e.key==="/"){e.preventDefault();view="list";render();$("q").focus()}});
addEventListener("paste",e=>{if(typing())return;const t=((e.clipboardData&&e.clipboardData.getData("text"))||"").trim();if(/^https?:\/\/\S+$/i.test(t)){e.preventDefault();editJob(null);$("jl").value=t;$("jaf").click()}});
const gx=$("glx"),ap=()=>document.documentElement.style.setProperty("--blur",gx.value+"px");
try{const v=localStorage.getItem("lw.glass");if(v!==null)gx.value=v}catch(e){}
ap();gx.oninput=()=>{ap();try{localStorage.setItem("lw.glass",gx.value)}catch(e){}};
if(!$("app").hidden)render();
})();
