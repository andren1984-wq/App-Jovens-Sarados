const fs = require('fs');
const path = require('path');
const base = 'C:\\Users\\andre\\.gemini\\antigravity\\scratch\\jovens-sarados-web';

function searchIn(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (!fs.statSync(full).isFile()) continue;
    if (!f.endsWith('.html') && !f.endsWith('.js') && !f.endsWith('.json')) continue;
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
      if (/conhec/i.test(l) || /carisma/i.test(l)) {
        console.log(`${f}:${idx+1} -> ${l.trim().substring(0, 120)}`);
      }
    });
  }
}

searchIn(path.join(base, 'templates'));
searchIn(path.join(base, 'data'));
