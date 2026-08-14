const fs = require('fs');
let code = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/index.js', 'utf8');

// 1. In /api/auth/verify, check if streak needs reset (if last active was > 24h ago)
// But wait, user said "reset if not used for > 24h". 
const verifyRegex = /app\.get\('\/api\/auth\/verify', authenticateToken, async \(req, res\) => \{[\s\S]*?const user = await prisma\.user\.findUnique\(\{[^}]*\}\);/;

if (code.match(verifyRegex)) {
  code = code.replace(verifyRegex, (match) => {
    return match + `
    if (user) {
      const now = new Date();
      const lastActive = new Date(user.updatedAt);
      const diffHours = (now - lastActive) / (1000 * 60 * 60);
      if (diffHours > 24 && user.streak > 0) {
        // Reset streak if inactive > 24h
        await prisma.user.update({
          where: { id: user.id },
          data: { streak: 0 }
        });
        user.streak = 0;
      }
    }
    `;
  });
}

// 2. In /api/exams/submit, increment streak correctly
const submitRegex = /\/\/ Update streak if completed exam today\s*const newStreak = [^;]+;/;
if (code.match(submitRegex)) {
  code = code.replace(submitRegex, `// Update streak if completed exam today
    const now = new Date();
    const lastActive = new Date(currentUser.updatedAt);
    let newStreak = currentUser.streak;
    
    const diffHours = (now - lastActive) / (1000 * 60 * 60);
    const isSameDay = now.toDateString() === lastActive.toDateString();
    
    if (diffHours > 24) {
      // If they somehow skipped verify and it's > 24h, reset and add 1
      newStreak = 1;
    } else if (!isSameDay) {
      // Different day, within 24 hours -> increment streak
      newStreak += 1;
    } else if (newStreak === 0) {
      // First time doing an exam or just reset to 0
      newStreak = 1;
    }`);
}

// Same for /api/vocab/submit
const vocabSubmitRegex = /\/\/ Update streak if playing vocab\s*const newStreak = [^;]+;/;
if (code.match(vocabSubmitRegex)) {
  code = code.replace(vocabSubmitRegex, `// Update streak if playing vocab
    const now = new Date();
    const lastActive = new Date(currentUser.updatedAt);
    let newStreak = currentUser.streak;
    
    const diffHours = (now - lastActive) / (1000 * 60 * 60);
    const isSameDay = now.toDateString() === lastActive.toDateString();
    
    if (diffHours > 24) {
      newStreak = 1;
    } else if (!isSameDay) {
      newStreak += 1;
    } else if (newStreak === 0) {
      newStreak = 1;
    }`);
}

fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/index.js', code);
console.log('Backend streak logic updated!');
