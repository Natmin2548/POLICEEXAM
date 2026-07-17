import fs from 'fs';

const content = fs.readFileSync('c:\\Users\\minam\\Downloads\\police-exam\\home\\index.html', 'utf8');
const lines = content.split('\n');

console.log('Printing exam functions in home/index.html...');
for (let i = 1650; i <= 1860; i++) {
  if (lines[i]) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
