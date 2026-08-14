const fs = require('fs');

// 1. Modify app.js
let appJs = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', 'utf8');

// Add formatMessageContent helper
const helper = `
function formatMessageContent(content) {
  if (!content) return '';
  if (content.startsWith('data:image/') || content.match(/^https?:\\/\\/.*\\.(gif|png|jpg|jpeg|webp)(\\?.*)?$/i)) {
    return \`<img src="\${content}" style="max-width: 250px; width: 100%; border-radius: 8px; margin-top: 4px;">\`;
  }
  return escapeHTML(content);
}
`;

if (!appJs.includes('function formatMessageContent')) {
  appJs = helper + appJs;
}

// Replace escapeHTML(m.content) with formatMessageContent(m.content) in chats
appJs = appJs.replace(/escapeHTML\(m\.content\)/g, 'formatMessageContent(m.content)');
// Replace escapeHTML(p.content) with formatMessageContent(p.content) in posts?
appJs = appJs.replace(/escapeHTML\(p\.content\)/g, 'formatMessageContent(p.content)');
// Replace escapeHTML(c.content) in comments
appJs = appJs.replace(/escapeHTML\(c\.content\)/g, 'formatMessageContent(c.content)');

// Remove chatInputAvatar from updateAllMyAvatars
appJs = appJs.replace(/'chatInputAvatarImg', 'groupChatInputAvatarImg', 'dmChatInputAvatarImg'/g, '');
appJs = appJs.replace(/'chatInputAvatarBox', 'groupChatInputAvatarBox', 'dmChatInputAvatarBox'/g, '');

// Add image upload handlers
const handlers = `
// Handle Image Uploads for Chats
function handleChatImageUpload(e, apiEndpoint) {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = ''; // Reset
  
  if (file.size > 5 * 1024 * 1024) {
    showCenteredAlert('ไฟล์ภาพมีขนาดใหญ่เกินไป (จำกัด 5MB)');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const base64 = ev.target.result;
    let url = apiEndpoint;
    // Replace dynamic parts if needed, like groupId or dmUserId
    if (url.includes(':groupId')) url = url.replace(':groupId', window.activeGroupId);
    if (url.includes(':friendId')) url = url.replace(':friendId', window.activeDmFriendId);
    
    try {
      const res = await fetch(\`\${API_BASE}\${url}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${authToken}\` },
        body: JSON.stringify({ content: base64 })
      });
      if (!res.ok) throw new Error('Failed to send image');
      
      // Reload chat based on endpoint
      if (url.includes('/chat') && !url.includes('/groups/') && !url.includes('/dm/')) loadChatMessages();
      else if (url.includes('/groups/')) loadGroupChatMessages(window.activeGroupId);
      else if (url.includes('/dm/')) loadDmChatMessages(window.activeDmFriendId);
    } catch (err) {
      console.error('Upload image error:', err);
      showCenteredAlert('ไม่สามารถส่งรูปภาพได้');
    }
  };
  reader.readAsDataURL(file);
}
`;

if (!appJs.includes('function handleChatImageUpload')) {
  appJs += handlers;
}
fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', appJs);

// 2. Modify index.html
let indexHtml = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', 'utf8');

const imageUploadIcon = `
<label style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #F8FAFC; color: #64748B; border: 1px solid #E2E8F0; flex-shrink: 0;" title="ส่งรูปภาพ/GIF">
  <input type="file" accept="image/*" style="display: none;" onchange="handleChatImageUpload(event, 'API_ENDPOINT')">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
</label>
`;

// Replace global chat avatar with upload button
indexHtml = indexHtml.replace(
  /<img src="" id="chatInputAvatarImg".*?>\s*<div class="profile-avatar-box" id="chatInputAvatarBox".*?>\?<\/div>/g,
  imageUploadIcon.replace('API_ENDPOINT', '/api/community/chat')
);

// Replace group chat avatar with upload button
indexHtml = indexHtml.replace(
  /<img src="" id="groupChatInputAvatarImg".*?>\s*<div class="profile-avatar-box" id="groupChatInputAvatarBox".*?>\?<\/div>/g,
  imageUploadIcon.replace('API_ENDPOINT', '/api/community/groups/:groupId/chat')
);

// Replace DM chat avatar with upload button
indexHtml = indexHtml.replace(
  /<img src="" id="dmChatInputAvatarImg".*?>\s*<div class="profile-avatar-box" id="dmChatInputAvatarBox".*?>\?<\/div>/g,
  imageUploadIcon.replace('API_ENDPOINT', '/api/community/dm/:friendId')
);

// Do the same for compose post
const postUploadIcon = `
<label style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #F8FAFC; color: #64748B; border: 1px solid #E2E8F0; flex-shrink: 0;" title="แนบรูปภาพ">
  <input type="file" accept="image/*" style="display: none;" onchange="handlePostImageSelect(event)">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
</label>
`;

// Wait, the user might want their avatar in the compose post, maybe just add the upload button below the textarea?
// "ตรง? ให้ส่ง gif ได้" - this only strictly mentions the chat. Let's just do chat for now.
// For compose post, leave avatar as is.

fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', indexHtml);

console.log('Done!');
