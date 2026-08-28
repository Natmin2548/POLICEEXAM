const fs = require('fs');
const js = fs.readFileSync('home/js/app.js', 'utf8');
const html = fs.readFileSync('home/index.html', 'utf8');

// Find all document.getElementById('...') in app.js
const idRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
const foundIds = new Set();
let match;
while ((match = idRegex.exec(js)) !== null) {
  foundIds.add(match[1]);
}

console.log(`Total getElementById queries: ${foundIds.size}`);

const missingIds = [];
foundIds.forEach(id => {
  if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
    missingIds.push(id);
  }
});

console.log('IDs in app.js missing from home/index.html:', missingIds);

// Check if any missing ID has .addEventListener without null check
missingIds.forEach(id => {
  const dangerousPatterns = [
    new RegExp(`document\\.getElementById\\(['"]${id}['"]\\)\\.addEventListener`, 'g'),
    new RegExp(`const\\s+([a-zA-Z0-9_]+)\\s*=\\s*document\\.getElementById\\(['"]${id}['"]\\);[\\s\\S]{1,200}\\1\\.addEventListener`, 'g')
  ];
  dangerousPatterns.forEach(p => {
    if (p.test(js)) {
      console.log(`❌ DANGEROUS CRASH: Element "${id}" is missing in HTML and has unguarded .addEventListener!`);
    }
  });
});
