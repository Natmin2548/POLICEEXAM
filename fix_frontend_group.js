const fs = require('fs');

// 1. Add editGroupModal to index.html
let html = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', 'utf8');

const editGroupModalHtml = `
  <!-- Edit Group Modal -->
  <div class="modal-overlay" id="editGroupModal"
    style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); align-items: center; justify-content: center; z-index: 100;">
    <div class="modal-card"
      style="background: white; max-width: 400px; width: 90%; padding: 24px; border-radius: 20px; text-align: left; box-shadow: var(--shadow-lg);">
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1E293B;">ตั้งค่ากลุ่ม</h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="font-size: 13px; font-weight: 500; color: #64748B; display: block; margin-bottom: 4px;">ชื่อกลุ่ม</label>
          <input type="text" id="txtEditGroupName" placeholder="เช่น ตะลุยโจทย์อังกฤษ นายสิบตำรวจ"
            style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; font-family: 'Kanit'; font-size: 14px; outline: none;">
        </div>
        <div>
          <label style="font-size: 13px; font-weight: 500; color: #64748B; display: block; margin-bottom: 4px;">รูปภาพกลุ่ม</label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <img id="editGroupImagePreview" src="" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; display: none;">
            <input type="file" id="fileEditGroupImage" accept="image/*" style="font-size: 12px; font-family: 'Kanit'; max-width: 100%;">
          </div>
        </div>
        <div>
          <label style="font-size: 13px; font-weight: 500; color: #64748B; display: block; margin-bottom: 4px;">รายละเอียดกลุ่ม</label>
          <textarea id="txtEditGroupDesc" placeholder="อธิบายวัตถุประสงค์ หรือแนวข้อสอบในกลุ่ม..."
            style="width: 100%; height: 60px; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; font-family: 'Kanit'; font-size: 14px; outline: none; resize: none;"></textarea>
        </div>
        <div>
          <label style="font-size: 13px; font-weight: 500; color: #64748B; display: block; margin-bottom: 4px;">ประเภทกลุ่ม</label>
          <div style="display: flex; gap: 16px; margin-top: 4px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; color: var(--text-dark);">
              <input type="radio" name="optEditGroupPrivacy" value="public" checked>
              สาธารณะ (ใครก็เข้าร่วมได้)
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; color: var(--text-dark);">
              <input type="radio" name="optEditGroupPrivacy" value="private">
              ส่วนตัว (ต้องรออนุมัติ)
            </label>
          </div>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button id="btnCancelEditGroup"
          style="background: transparent; border: none; padding: 10px 16px; font-size: 14px; font-family: 'Kanit'; cursor: pointer; color: #64748B; font-weight: 500;">ยกเลิก</button>
        <button id="btnSubmitEditGroup" class="btn-quick-match"
          style="width: auto; padding: 10px 20px; font-size: 14px; box-shadow: none;">บันทึกการเปลี่ยนแปลง</button>
      </div>
    </div>
  </div>
`;

if (!html.includes('id="editGroupModal"')) {
  html = html.replace('<!-- Create Group Modal -->', editGroupModalHtml + '\n  <!-- Create Group Modal -->');
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/index.html', html);
  console.log('Added editGroupModal to index.html');
}

// 2. Add logic to app.js
let appJs = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', 'utf8');

const editGroupLogic = `
// ==========================================
// Edit Group Management
// ==========================================
let pendingEditGroupImageBase64 = null;
let currentEditingGroupId = null;

const editGroupModal = document.getElementById('editGroupModal');
const btnCancelEditGroup = document.getElementById('btnCancelEditGroup');
const btnSubmitEditGroup = document.getElementById('btnSubmitEditGroup');
const fileEditGroupImage = document.getElementById('fileEditGroupImage');
const editGroupImagePreview = document.getElementById('editGroupImagePreview');
const txtEditGroupName = document.getElementById('txtEditGroupName');
const txtEditGroupDesc = document.getElementById('txtEditGroupDesc');

if (fileEditGroupImage) {
  fileEditGroupImage.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      pendingEditGroupImageBase64 = ev.target.result;
      if (editGroupImagePreview) {
        editGroupImagePreview.src = pendingEditGroupImageBase64;
        editGroupImagePreview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  };
}

if (btnCancelEditGroup && editGroupModal) {
  btnCancelEditGroup.onclick = () => {
    editGroupModal.style.display = 'none';
  };
}

window.openEditGroupModal = async function(groupId) {
  currentEditingGroupId = groupId;
  if (!editGroupModal) return;
  
  // Try to find group data from feed if available
  try {
    const res = await fetch(\`\${API_BASE}/api/community/groups\`, {
      headers: { 'Authorization': \`Bearer \${authToken}\` }
    });
    const groups = await res.json();
    const g = groups.find(x => x.id === groupId);
    if (g) {
      txtEditGroupName.value = g.name || '';
      txtEditGroupDesc.value = g.description || '';
      if (g.isPrivate) {
        document.querySelector('input[name="optEditGroupPrivacy"][value="private"]').checked = true;
      } else {
        document.querySelector('input[name="optEditGroupPrivacy"][value="public"]').checked = true;
      }
      if (g.image) {
        editGroupImagePreview.src = g.image;
        editGroupImagePreview.style.display = 'block';
        pendingEditGroupImageBase64 = g.image; // Keep the same image by default
      } else {
        editGroupImagePreview.style.display = 'none';
        pendingEditGroupImageBase64 = null;
      }
    }
    editGroupModal.style.display = 'flex';
  } catch(err) {
    console.error(err);
    alert('โหลดข้อมูลกลุ่มไม่สำเร็จ');
  }
};

if (btnSubmitEditGroup && editGroupModal) {
  btnSubmitEditGroup.onclick = async () => {
    const name = txtEditGroupName.value.trim();
    const description = txtEditGroupDesc.value.trim();
    const optPrivacy = document.querySelector('input[name="optEditGroupPrivacy"]:checked');
    const isPrivate = optPrivacy ? optPrivacy.value === 'private' : false;

    if (!name) {
      alert('กรุณากรอกชื่อกลุ่ม');
      return;
    }

    btnSubmitEditGroup.disabled = true;
    btnSubmitEditGroup.textContent = 'กำลังบันทึก...';

    try {
      const res = await fetch(\`\${API_BASE}/api/community/groups/\${currentEditingGroupId}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${authToken}\`
        },
        body: JSON.stringify({ name, description, isPrivate, image: pendingEditGroupImageBase64 })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update group');
      }

      editGroupModal.style.display = 'none';
      alert('บันทึกการตั้งค่ากลุ่มเรียบร้อย');
      loadGroupsList(); // Reload feed
      
      // Update chat header if currently inside this chat
      if (currentChatType === 'group' && currentChatTargetId === currentEditingGroupId) {
         document.getElementById('lblChatModalTitle').textContent = name;
      }
    } catch (err) {
      console.error('Update group error:', err);
      alert(err.message);
    } finally {
      btnSubmitEditGroup.disabled = false;
      btnSubmitEditGroup.textContent = 'บันทึกการเปลี่ยนแปลง';
    }
  };
}
`;

if (!appJs.includes('window.openEditGroupModal')) {
  appJs += '\n' + editGroupLogic;
  
  // Insert Settings Button in Group Chat logic
  // Find where we added the btnGroupMembers in the last script
  const membersBtnRegex = /membersBtn\.onclick = \(\) => openGroupMembersModal\(groupId, createdById\);/;
  if (appJs.match(membersBtnRegex)) {
    const replacement = `membersBtn.onclick = () => openGroupMembersModal(groupId, createdById);

  // Add Group Settings Button for Admin/Creator
  let settingsBtn = document.getElementById('btnGroupSettings');
  if (!settingsBtn) {
    settingsBtn = document.createElement('button');
    settingsBtn.id = 'btnGroupSettings';
    settingsBtn.className = 'btn-quick-match';
    settingsBtn.style = 'padding: 6px 12px; font-size: 12px; margin-left: 8px; box-shadow: none; background-color: #F1F5F9; color: #475569;';
    settingsBtn.textContent = '⚙️ ตั้งค่ากลุ่ม';
    if (document.querySelector('.chat-header-actions')) {
      document.querySelector('.chat-header-actions').prepend(settingsBtn);
    }
  }
  
  // Show only if user is creator (for now we assume if they can see delete button, they are creator, OR we check members list later. But wait, we can verify via api, or just show it and backend rejects it. Better: fetch members to check role)
  settingsBtn.style.display = 'none';
  settingsBtn.onclick = () => openEditGroupModal(groupId);
  
  // Check role to show settings button
  fetch(\`\${API_BASE}/api/community/groups/\${groupId}/members\`, { headers: { 'Authorization': \`Bearer \${authToken}\` } })
    .then(r => r.json())
    .then(members => {
       const myMember = members.find(m => m.userId === userProfile.id);
       if (myMember && (myMember.role === 'ADMIN' || createdById === userProfile.id)) {
          settingsBtn.style.display = 'block';
       }
    })
    .catch(console.error);
`;
    appJs = appJs.replace(membersBtnRegex, replacement);
  }
  
  const hideSettingsGlobalMatch = `const membersBtn = document.getElementById('btnGroupMembers');`;
  const hideSettingsGlobalReplace = `const membersBtn = document.getElementById('btnGroupMembers');
  const settingsBtn = document.getElementById('btnGroupSettings');
  if (settingsBtn) settingsBtn.style.display = 'none';`;
  // Replace the first 2 instances (for global chat and private chat)
  appJs = appJs.replace(hideSettingsGlobalMatch, hideSettingsGlobalReplace);
  appJs = appJs.replace(hideSettingsGlobalMatch, hideSettingsGlobalReplace);

  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', appJs);
  console.log('Added edit group logic to app.js');
}
