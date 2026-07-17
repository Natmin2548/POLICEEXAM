import fs from 'fs';
import { Parser } from 'acorn';

const html = fs.readFileSync('../admin-dashboard/index.html', 'utf8');

// Find all script blocks
let idx = 0;
let count = 0;
while (true) {
  idx = html.indexOf('<script', idx);
  if (idx === -1) break;
  const startTagEnd = html.indexOf('>', idx) + 1;
  const endTag = html.indexOf('</script>', startTagEnd);
  if (endTag === -1) break;

  const scriptContent = html.substring(startTagEnd, endTag);
  const isModule = html.substring(idx, startTagEnd).includes('type="module"');
  const src = html.substring(idx, startTagEnd).match(/src="([^"]+)"/);

  if (!src) {
    console.log(`Script block ${count} (start index ${startTagEnd}):`);
    try {
      Parser.parse(scriptContent, {
        ecmaVersion: 'latest',
        sourceType: isModule ? 'module' : 'script'
      });
      console.log('-> Syntax OK!');
    } catch (err) {
      console.error('-> Syntax ERROR:', err.message);
      const lineNum = scriptContent.substring(0, err.pos).split('\n').length;
      console.error(`Error line: ${lineNum}`);
      const lines = scriptContent.split('\n');
      console.error(lines.slice(Math.max(0, lineNum - 5), Math.min(lines.length, lineNum + 5)).join('\n'));
      process.exit(1);
    }
  }

  idx = endTag + 9;
  count++;
}
