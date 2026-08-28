const fs = require('fs');
const js = fs.readFileSync('home/js/app.js', 'utf8');
const lines = js.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('.addEventListener(')) {
    console.log(`L${idx + 1}: ${line.trim()}`);
  }
});
