const fs = require('fs');
let code = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', 'utf8');

const helper = `
function renderAvatarHtml(user, classNames, inlineStyles = '', defaultBgColor = '#64748B') {
  if (!user) return '';
  const name = user.fullName || user.username || 'ผู้ใช้งาน';
  const initial = typeof escapeHTML === 'function' ? escapeHTML(name.charAt(0)) : name.charAt(0);
  if (user.faceImage) {
    return \`<div class="\${classNames}" style="\${inlineStyles}; background-color: transparent; overflow: hidden; padding: 0; display: flex; align-items: center; justify-content: center;"><img src="\${user.faceImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>\`;
  }
  return \`<div class="\${classNames}" style="\${inlineStyles}; background-color: \${defaultBgColor}; display: flex; align-items: center; justify-content: center; color: white;">\${initial}</div>\`;
}
`;

if (!code.includes('function renderAvatarHtml')) {
  code = helper + code;
}

// 1. In loadCommunityPosts
code = code.replace(/<div class="post-author-avatar">\$\{initial\}<\/div>/g, '${renderAvatarHtml(p.user, \'post-author-avatar\', \'\', \'#CBD5E1\')}');

// 2. In loadCommunityPosts comments
code = code.replace(/<div class="comment-avatar">\$\{cInitial\}<\/div>/g, '${renderAvatarHtml(c.user, \'comment-avatar\', \'\', \'#94A3B8\')}');

// 3. In loadChatMessages (and Group/DM chat) avatarHtml
code = code.replace(/const avatarHtml = `[\s\S]*?`;/g, (match) => {
  if (match.includes('showUserProfile(${m.userId})') && match.includes('escapeHTML(initial)')) {
    return 'const avatarHtml = renderAvatarHtml(m.user, \'friend-user-avatar\', \'width: 32px; height: 32px; font-size: 13px; cursor: pointer; flex-shrink: 0; border-radius: 50%; font-weight: 600; margin-right: 8px;\', isMe ? \'var(--primary-color)\' : \'#BD1B0B\').replace(\'<div \', \'<div onclick="showUserProfile(${m.userId})" \');';
  }
  return match;
});

// 4. In loadGroupChatMessages avatarHtml
code = code.replace(/const avatarHtml = `\s*<div class="friend-user-avatar" style="width: 32px; height: 32px; font-size: 13px; flex-shrink: 0; background-color: \$\{isMe \? 'var\(--primary-color\)' : '#64748B'\}; display: flex; align-items: center; justify-content: center; color: white; border-radius: 50%; font-weight: 600; margin-right: 8px;">\s*\$\{escapeHTML\(initial\)\}\s*<\/div>\s*`;/g, 
  'const avatarHtml = renderAvatarHtml(m.user, \'friend-user-avatar\', \'width: 32px; height: 32px; font-size: 13px; flex-shrink: 0; border-radius: 50%; font-weight: 600; margin-right: 8px;\', isMe ? \'var(--primary-color)\' : \'#64748B\');');

// 5. In loadDmChatMessages avatarHtml
code = code.replace(/const avatarHtml = `\s*<div class="friend-user-avatar" style="width: 32px; height: 32px; font-size: 13px; flex-shrink: 0; background-color: \$\{isMe \? 'var\(--primary-color\)' : '#3B82F6'\}; display: flex; align-items: center; justify-content: center; color: white; border-radius: 50%; font-weight: 600; margin-right: 8px;">\s*\$\{escapeHTML\(initial\)\}\s*<\/div>\s*`;/g, 
  'const avatarHtml = renderAvatarHtml(m.user, \'friend-user-avatar\', \'width: 32px; height: 32px; font-size: 13px; flex-shrink: 0; border-radius: 50%; font-weight: 600; margin-right: 8px;\', isMe ? \'var(--primary-color)\' : \'#3B82F6\');');

// 6. User Profile posts modal
code = code.replace(/<div class="post-author-avatar">\$\{userProfile\.fullName \? userProfile\.fullName\.charAt\(0\) : 'ส'\}<\/div>/g, 
  '${renderAvatarHtml(userProfile, \'post-author-avatar\', \'\', \'#CBD5E1\')}');

fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', code);
console.log('Script ran successfully!');
