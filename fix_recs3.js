const fs = require('fs');

let appJs = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', 'utf8');

const target1 = `    recsContainer.innerHTML = recsHtml;`;
const replacement1 = `    // recsContainer.innerHTML = recsHtml;
    recsContainer.innerHTML = '<div style="text-align: center; color: var(--text-light); padding: 20px; font-size: 13px;">คำแนะนำกำลังจะมาในเร็วๆ นี้...</div>';`;

if (appJs.includes(target1) && !appJs.includes('คำแนะนำกำลังจะมาในเร็วๆ นี้')) {
  appJs = appJs.replace(target1, replacement1);
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', appJs);
  console.log('Successfully replaced innerHTML!');
} else {
  console.log('Target not found or already replaced.');
}

// BUMP VERSION
let html = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', 'utf8');
html = html.replace('app.js?v=16', 'app.js?v=17');
fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', html);
