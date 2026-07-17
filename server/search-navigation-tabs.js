import fs from 'fs';

const content = fs.readFileSync('c:\\Users\\minam\\Downloads\\police-exam\\home\\index.html', 'utf8');
const lines = content.split('\n');

console.log('Searching for dashboard tabs in home/index.html...');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('nav-') || line.includes('switchTab') || line.includes('class="sidebar') || line.includes('menu-item') || line.includes('sidebar-menu')) {
    console.log(`L${i+1}: ${line.trim()}`);
  }
}
