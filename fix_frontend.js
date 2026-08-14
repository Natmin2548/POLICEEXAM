const fs = require('fs');
let html = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', 'utf8');

const groupMembersModalHtml = `
  <!-- Group Members Modal -->
  <div class="modal-overlay" id="groupMembersModal"
    style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); align-items: center; justify-content: center; z-index: 1000; padding: 20px;">
    <div class="modal-card"
      style="background: white; max-width: 480px; width: 100%; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; max-height: 80vh;">
      <div style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background-color: #F8FAFC;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text-dark);">รายชื่อสมาชิกกลุ่ม</h3>
        <button id="btnCloseGroupMembersModal" style="background: none; border: none; font-size: 20px; color: var(--text-light); cursor: pointer;">&times;</button>
      </div>
      <div id="groupMembersContainer" style="padding: 16px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 12px; background-color: white;">
        <!-- Members injected here -->
      </div>
    </div>
  </div>
`;

if (!html.includes('id="groupMembersModal"')) {
  // Insert right before closing body or after another modal
  html = html.replace('</body>', groupMembersModalHtml + '\n</body>');
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', html);
  console.log('Group Members Modal added to index.html');
}

let appJs = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', 'utf8');

const groupMembersLogic = `
// ==========================================
// Group Members Management
// ==========================================
let currentManageGroupId = null;
let currentManageGroupCreatorId = null;

window.openGroupMembersModal = async function(groupId, creatorId) {
  currentManageGroupId = groupId;
  currentManageGroupCreatorId = creatorId;
  const modal = document.getElementById('groupMembersModal');
  const container = document.getElementById('groupMembersContainer');
  if (!modal || !container) return;
  
  modal.style.display = 'flex';
  container.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-light);">กำลังโหลด...</div>';
  
  try {
    const res = await fetch(\`\${API_BASE}/api/community/groups/\${groupId}/members\`, {
      headers: { 'Authorization': \`Bearer \${authToken}\` }
    });
    if (!res.ok) throw new Error('Failed to load members');
    const members = await res.json();
    
    // Check my role
    const myMember = members.find(m => m.userId === userProfile.id);
    const iAmAdmin = myMember && (myMember.role === 'ADMIN' || creatorId === userProfile.id);
    
    let html = '';
    members.forEach(m => {
      const isCreator = m.userId === creatorId;
      const isAdmin = m.role === 'ADMIN';
      const isMe = m.userId === userProfile.id;
      
      let roleBadge = '';
      if (isCreator) roleBadge = '<span style="font-size:10px; background:#FEF3C7; color:#D97706; padding:2px 6px; border-radius:4px; margin-left:6px;">หัวหน้ากลุ่ม</span>';
      else if (isAdmin) roleBadge = '<span style="font-size:10px; background:#DBEAFE; color:#1D4ED8; padding:2px 6px; border-radius:4px; margin-left:6px;">แอดมิน</span>';
      
      let actionBtns = '';
      if (iAmAdmin && !isCreator && !isMe) {
        if (!isAdmin) {
          actionBtns += \`<button onclick="updateMemberRole(\${m.userId}, 'ADMIN')" style="font-size:11px; padding:4px 8px; border-radius:4px; background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; cursor:pointer;">ตั้งแอดมิน</button>\`;
        } else if (creatorId === userProfile.id) {
          // Only creator can demote admins
          actionBtns += \`<button onclick="updateMemberRole(\${m.userId}, 'MEMBER')" style="font-size:11px; padding:4px 8px; border-radius:4px; background:#FFF1F2; color:#E11D48; border:1px solid #FECDD3; cursor:pointer;">ปลดแอดมิน</button>\`;
        }
        actionBtns += \`<button onclick="kickMember(\${m.userId})" style="font-size:11px; padding:4px 8px; border-radius:4px; background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; cursor:pointer; margin-left:6px;">เตะออก</button>\`;
      }

      html += \`
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px; border:1px solid var(--border-color); border-radius:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div onclick="showUserProfileModal(\${m.userId})" style="cursor:pointer;">
              \${renderAvatarHtml(m.user, '', 'width:36px; height:36px; border-radius:50%;', '#64748B')}
            </div>
            <div>
              <div style="font-size:14px; font-weight:600; color:var(--text-dark); display:flex; align-items:center;">
                \${escapeHTML(m.user.fullName || m.user.username || 'ผู้ใช้งาน')} \${roleBadge}
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center;">\${actionBtns}</div>
        </div>
      \`;
    });
    container.innerHTML = html;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="text-align:center; padding: 20px; color: #EF4444;">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>';
  }
};

window.updateMemberRole = async function(userId, newRole) {
  if (!confirm(\`ยืนยันการ\${newRole === 'ADMIN' ? 'ตั้ง' : 'ปลด'}แอดมิน?\`)) return;
  try {
    const res = await fetch(\`\${API_BASE}/api/community/groups/\${currentManageGroupId}/members/\${userId}/role\`, {
      method: 'PUT',
      headers: { 'Authorization': \`Bearer \${authToken}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update role');
    }
    openGroupMembersModal(currentManageGroupId, currentManageGroupCreatorId);
  } catch(err) {
    alert(err.message);
  }
};

window.kickMember = async function(userId) {
  if (!confirm('ยืนยันการเตะสมาชิกออกจากกลุ่ม?')) return;
  try {
    const res = await fetch(\`\${API_BASE}/api/community/groups/\${currentManageGroupId}/members/\${userId}\`, {
      method: 'DELETE',
      headers: { 'Authorization': \`Bearer \${authToken}\` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to kick member');
    }
    openGroupMembersModal(currentManageGroupId, currentManageGroupCreatorId);
  } catch(err) {
    alert(err.message);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const btnClose = document.getElementById('btnCloseGroupMembersModal');
  if (btnClose) {
    btnClose.onclick = () => {
      document.getElementById('groupMembersModal').style.display = 'none';
    };
  }
});
`;

if (!appJs.includes('window.openGroupMembersModal')) {
  appJs += '\n' + groupMembersLogic;
}

// Update avatar rendering to make it clickable
if (appJs.includes('function renderAvatarHtml(user, classNames, inlineStyles = \'\', defaultBgColor = \'#64748B\') {') && !appJs.includes('onclick="if(window.showUserProfileModal)')) {
  appJs = appJs.replace(
    /function renderAvatarHtml\(user, classNames, inlineStyles = '', defaultBgColor = '#64748B'\) \{[\s\S]*?return `<div class="\$\{classNames\}" style="\$\{inlineStyles\}; background-color: \$\{defaultBgColor\}; display: flex; align-items: center; justify-content: center; color: white;">\$\{initial\}<\/div>`;\n\}/,
    `function renderAvatarHtml(user, classNames, inlineStyles = '', defaultBgColor = '#64748B') {
  if (!user) return '';
  const name = user.fullName || user.username || 'ผู้ใช้งาน';
  const initial = typeof escapeHTML === 'function' ? escapeHTML(name.charAt(0)) : name.charAt(0);
  const clickAction = user.id ? \`onclick="event.stopPropagation(); if(window.showUserProfileModal) showUserProfileModal(\${user.id});" style="cursor: pointer;"\` : '';
  
  if (user.faceImage) {
    return \`<div class="\${classNames}" \${clickAction} style="\${inlineStyles}; background-color: transparent; overflow: hidden; padding: 0; display: flex; align-items: center; justify-content: center;"><img src="\${user.faceImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>\`;
  }
  return \`<div class="\${classNames}" \${clickAction} style="\${inlineStyles}; background-color: \${defaultBgColor}; display: flex; align-items: center; justify-content: center; color: white;">\${initial}</div>\`;
}`
  );
}

// Add the Members button inside the group chat header
const enterGroupChatMatch = `lblChatModalTitle.textContent = groupName;`;
const enterGroupChatReplace = `lblChatModalTitle.textContent = groupName;
  // Add group members button
  const headerRight = document.querySelector('.chat-header-actions') || document.querySelector('.chat-header');
  if (headerRight && currentChatType === 'group') {
    let membersBtn = document.getElementById('btnGroupMembers');
    if (!membersBtn) {
      membersBtn = document.createElement('button');
      membersBtn.id = 'btnGroupMembers';
      membersBtn.className = 'btn-quick-match';
      membersBtn.style = 'padding: 6px 12px; font-size: 12px; margin-left: 8px; box-shadow: none;';
      membersBtn.textContent = '👥 สมาชิก';
      if (document.querySelector('.chat-header-actions')) {
        document.querySelector('.chat-header-actions').prepend(membersBtn);
      }
    }
    membersBtn.style.display = 'block';
    membersBtn.onclick = () => openGroupMembersModal(groupId, createdById);
  }
`;
if (appJs.includes(enterGroupChatMatch) && !appJs.includes('btnGroupMembers')) {
  appJs = appJs.replace(enterGroupChatMatch, enterGroupChatReplace);
  
  // Also hide the button when not in group chat
  const hideMembersBtnMatch = `lblChatModalTitle.textContent = \`แชทส่วนตัว: \${targetName}\`;`;
  const hideMembersBtnReplace = `lblChatModalTitle.textContent = \`แชทส่วนตัว: \${targetName}\`;
  const membersBtn = document.getElementById('btnGroupMembers');
  if (membersBtn) membersBtn.style.display = 'none';`;
  appJs = appJs.replace(hideMembersBtnMatch, hideMembersBtnReplace);
  
  const hideMembersGlobalMatch = `lblChatModalTitle.textContent = 'ห้องแชทรวม (Global)';`;
  const hideMembersGlobalReplace = `lblChatModalTitle.textContent = 'ห้องแชทรวม (Global)';
  const membersBtn = document.getElementById('btnGroupMembers');
  if (membersBtn) membersBtn.style.display = 'none';`;
  appJs = appJs.replace(hideMembersGlobalMatch, hideMembersGlobalReplace);
}

fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', appJs);
console.log('app.js updated successfully');
