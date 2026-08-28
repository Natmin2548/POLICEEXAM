const fs = require('fs');
const js = fs.readFileSync('home/js/app.js', 'utf8');

// Check tab click listeners
const lines = js.split('\n');
lines.forEach((l, i) => {
  if (l.includes('btnTabBank') || l.includes('btnTabBattle') || l.includes('btnTabCommunity') || l.includes('nav-tab') || l.includes('switchTab') || l.includes('btnActionQuestionBank') || l.includes('btnActionBattle')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
