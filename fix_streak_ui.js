const fs = require('fs');
let html = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', 'utf8');

// Replace greeting streak title
html = html.replace(
  /<h2 style="margin: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 6px;">3 วันติดต่อกัน! 🔥<\/h2>/g, 
  '<h2 id="greetingStreakTitle" style="margin: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 6px;">0 วันติดต่อกัน! 🔥</h2>'
);

// Replace greeting streak subtitle
html = html.replace(
  /<span style="font-size: 12px; opacity: 0.9; margin-top: 2px; display: block;">ทำข้อสอบวันนี้เพื่อรักษา streak<\/span>/g,
  '<span id="greetingStreakSubtitle" style="font-size: 12px; opacity: 0.9; margin-top: 2px; display: block;">ทำข้อสอบวันนี้เพื่อรักษา streak</span>'
);

fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', html);

// Modify app.js to update the greeting streak
let appJs = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', 'utf8');

const updateGreetingRegex = /function updateGreetingSection\(user\) \{[\s\S]*?lblGreetingName\.textContent = user\.fullName \|\| user\.username \|\| 'ผู้ใช้งาน';/;

if (appJs.match(updateGreetingRegex)) {
  appJs = appJs.replace(updateGreetingRegex, (match) => {
    return match + `
    
    // Update streak UI
    const greetingStreakTitle = document.getElementById('greetingStreakTitle');
    if (greetingStreakTitle) {
      greetingStreakTitle.innerHTML = \`\${user.streak || 0} วันติดต่อกัน! 🔥\`;
    }
    const greetingStreakSubtitle = document.getElementById('greetingStreakSubtitle');
    if (greetingStreakSubtitle) {
      if (user.streak > 0) {
        greetingStreakSubtitle.textContent = 'ทำข้อสอบวันนี้เพื่อรักษา streak';
      } else {
        greetingStreakSubtitle.textContent = 'เริ่มทำข้อสอบเพื่อเก็บ streak เลย!';
      }
    }
    `;
  });
  
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', appJs);
  console.log('Done modifying index.html and app.js');
} else {
  console.log('Regex did not match app.js');
}
