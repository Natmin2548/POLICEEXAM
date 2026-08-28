const fs = require('fs');
const js = fs.readFileSync('home/js/app.js', 'utf8');
const lines = js.split('\n');

const crashWarnings = [];

lines.forEach((line, idx) => {
  const lineNum = idx + 1;

  // Direct .addEventListener without if check on previous line or same line
  if (line.includes('.addEventListener(') && !line.includes('if (') && !line.includes('document.addEventListener(') && !line.includes('window.addEventListener(')) {
    // Check if preceded by if
    const prevLine = idx > 0 ? lines[idx - 1] : '';
    if (!prevLine.includes('if (') && !prevLine.includes('if(')) {
      crashWarnings.push(`L${lineNum}: Unguarded addEventListener -> ${line.trim()}`);
    }
  }

  // Direct .querySelector('span').textContent on button
  if (line.includes(".querySelector('span').textContent") || line.includes('.querySelector("span").textContent')) {
    crashWarnings.push(`L${lineNum}: Potential querySelector null -> ${line.trim()}`);
  }
});

console.log('CRASH WARNINGS COUNT:', crashWarnings.length);
crashWarnings.forEach(w => console.log(w));
