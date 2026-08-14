const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', 'utf8');
html = html.replace('<span style="font-size: 18px;">🧠</span> คำแนะนำจาก AI', 'คำแนะนำ');
fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', html);
console.log('index.html updated');

// 2. Update app.js
let appJs = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', 'utf8');

// The logic starts around line 1130: `// 6. Generate AI Recommendations`
// We want to replace the inner logic of `if (recsContainer) { ... }` with a placeholder
const startString = `const recsContainer = document.getElementById('aiRecsListContainer');`;
const endString = `// Render Weaknesses List in the second column`;

const startIndex = appJs.indexOf(startString);
const endIndex = appJs.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `const recsContainer = document.getElementById('aiRecsListContainer');
  if (recsContainer) {
    recsContainer.innerHTML = '<div style="text-align: center; color: var(--text-light); padding: 20px; font-size: 13px;">เร็วๆ นี้...</div>';
  }

  `;
  const originalSection = appJs.substring(startIndex, endIndex);
  appJs = appJs.replace(originalSection, replacement);
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', appJs);
  console.log('app.js updated');
} else {
  console.log('Could not find boundaries in app.js');
}
