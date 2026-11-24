// Rebuilds demo.html + demo.js from index.html + app.js.
// Run:  node build-demo.mjs        (needs Node 18+)
// The demo has no login, no Supabase keys, no AI Worker URL and never reads or writes saved data.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const fail = m => { console.error('\n[X] Demo build failed: ' + m + '\n'); process.exit(1); };
const must = (src, re, rep, label) => {
  if (!re.test(src)) fail(`${label} was not found. The source code changed, so update that pattern in build-demo.mjs (or ask Claude).`);
  return src.replace(re, () => rep);
};
const maybe = (src, from, to) => (src.includes(from) ? src.replace(from, to) : (console.warn('  note: optional text not found: ' + from.slice(0, 50)), src));

let js = readFileSync('app.js', 'utf8');
let html = readFileSync('index.html', 'utf8');

// Collect the real config values so we can prove they are gone afterwards.
const cfg = js.match(/const CFG\s*=\s*\{[\s\S]*?\};/);
if (!cfg) fail('The CFG block in app.js was not found.');
const secrets = [...cfg[0].matchAll(/"([^"]{8,})"|'([^']{8,})'/g)].map(m => m[1] || m[2]);

// ---- demo.js ----
js = must(js, /const CFG\s*=\s*\{[\s\S]*?\};/, 'const CFG={SUPABASE_URL:"",SUPABASE_ANON_KEY:"",AI_URL:""};', 'The CFG block');
js = must(js, /function load\(\)\{[^\n]*return blank\(\)\}/, 'function load(){return blank()}', 'function load()');
js = must(js, /const keep=\(\)=>\{try\{localStorage\.setItem\(key\(\),JSON\.stringify\(S\)\)\}catch\(e\)\{\}\};/, 'const keep=()=>{};', 'const keep');
if (!js.includes('id:"d1"')) fail('The demo sample data (id:"d1") was not found in app.js, so the Try the demo button may be gone.');
js += '\n;document.getElementById("demo").click();\n';
const ver = createHash('sha1').update(js).digest('hex').slice(0, 8);

// ---- demo.html ----
html = must(html, /\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[^>]*><\/script>/, '', 'The Supabase script tag');
html = must(html, /<script src="app\.js[^"]*" defer><\/script>/, `<script src="demo.js?v=${ver}" defer></script>`, 'The app.js script tag');
html = maybe(html, '<title>LoomwellOps™ Job Tracker</title>', '<title>LoomwellOps™ Job Tracker (Live Demo)</title>');
html = maybe(html, 'Demo mode: sample data only, nothing is saved, and the AI tools are off.', 'Live demo: sample data only. Nothing is saved, and sign-in and the AI tools are turned off.');
html = maybe(html, '<button type="button" id="demox">Exit demo</button>', '<button type="button" id="demox">Reset demo</button>');
html = maybe(html, '<meta name="description" content="', '<meta name="robots" content="noindex"><meta name="description" content="');

// ---- safety check: nothing private may remain ----
for (const [name, text] of [['demo.js', js], ['demo.html', html]])
  for (const s of secrets) if (text.includes(s)) fail(`${name} still contains a private config value (${s.slice(0, 18)}...).`);
for (const [name, text] of [['demo.js', js], ['demo.html', html]])
  if (/supabase\.co|workers\.dev|sb_publishable/.test(text)) fail(`${name} still mentions Supabase or the Worker.`);

writeFileSync('demo.js', js);
writeFileSync('demo.html', html);
console.log(`OK: demo.html and demo.js rebuilt (${(js.length / 1024).toFixed(0)} KB js). Safety check passed.`);
