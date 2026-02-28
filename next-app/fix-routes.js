const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('route.ts')) {
      results.push(file);
    }
  });
  return results;
}

const routes = walk('./src/app/api');

routes.forEach(r => {
  let content = fs.readFileSync(r, 'utf8');
  if (!content.includes('\n')) {
    console.log('Fixing inline file ' + r);
    content = content.replace(/export const dynamic = 'force-dynamic';/g, '');
    content = content.replace(/;/g, ';\n');
    fs.writeFileSync(r, "export const dynamic = 'force-dynamic';\n" + content);
  }
});

console.log('Fixed all API route syntax.');
