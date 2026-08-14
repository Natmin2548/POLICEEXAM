const fs = require('fs');

// Modify app.js to update the greeting streak
let appJs = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', 'utf8');

const initRegex = /const greetingName = document\.getElementById\('greetingName'\);/;

if (appJs.match(initRegex)) {
  appJs = appJs.replace(initRegex, (match) => {
    return `
  const greetingStreakTitle = document.getElementById('greetingStreakTitle');
  const greetingStreakSubtitle = document.getElementById('greetingStreakSubtitle');
  
  if (userProfile) {
    if (greetingStreakTitle) {
      greetingStreakTitle.innerHTML = \`\${userProfile.streak || 0} วันติดต่อกัน! 🔥\`;
    }
    if (greetingStreakSubtitle) {
      if ((userProfile.streak || 0) > 0) {
        greetingStreakSubtitle.textContent = 'ทำข้อสอบวันนี้เพื่อรักษา streak';
      } else {
        greetingStreakSubtitle.textContent = 'เริ่มทำข้อสอบเพื่อสะสม streak เลย!';
      }
    }
  }
  
  ${match}`;
  });
  
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', appJs);
  console.log('Done modifying app.js for streak');
} else {
  console.log('Regex did not match app.js');
}
