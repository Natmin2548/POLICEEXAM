const fs = require('fs');
const html = fs.readFileSync('home/index.html', 'utf8');
const lines = html.split('\n');

let stack = [];
lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const tagRegex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    
    // Ignore self closing
    if (['img', 'input', 'br', 'hr', 'meta', 'link', 'source'].includes(tagName)) continue;
    if (fullTag.endsWith('/>')) continue;

    if (fullTag.startsWith('</')) {
      if (stack.length === 0) {
        console.log(`L${lineNum}: Extra closing </${tagName}> with empty stack: ${line.trim()}`);
      } else {
        const top = stack.pop();
        if (top.tagName !== tagName) {
          console.log(`L${lineNum}: Tag mismatch! Expected </${top.tagName}> (from L${top.lineNum}) but got </${tagName}>: ${line.trim()}`);
        }
      }
    } else {
      stack.push({ tagName, lineNum, line: line.trim() });
    }
  }
});

console.log('Remaining open tags at EOF:', stack.map(s => `${s.tagName} (L${s.lineNum})`));
