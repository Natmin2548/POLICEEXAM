// Check for runtime errors in home/js/app.js on startup
const fs = require('fs');

// We can check if any variables are accessed before initialization or undefined functions called
const js = fs.readFileSync('home/js/app.js', 'utf8');

console.log('JS File Size:', js.length, 'bytes');

// Check top-level syntax
try {
  new Function(js);
  console.log('Top-level syntax: OK');
} catch (e) {
  console.error('Syntax Error:', e);
}
