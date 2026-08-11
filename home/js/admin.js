// Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000' 
  : 'https://police-exam-t090.onrender.com';

const authToken = sessionStorage.getItem('token');
let currentUser = null;

// Initialization
async function initAdmin() {
  if (!authToken) {
    window.location.href = '../index.html';
    return;
  }

  try {
    // Verify user role
    const res = await fetch(`${API_BASE}/api/user`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error('Unauthorized');
    const data = await res.json();
    if (data.user.role !== 'ADMIN' && data.user.role !== 'OWNER') {
      window.location.href = 'index.html'; // Kick out
      return;
    }
    
    currentUser = data.user;
    document.getElementById('adminUserInfo').textContent = `Admin: ${currentUser.username}`;
    
    // Setup Navigation
    setupTabs();
    
    // Load Dashboard by default
    loadDashboard();
    
  } catch (err) {
    console.error('Init Admin error:', err);
    window.location.href = '../index.html';
  }
}

// Tab Navigation
function setupTabs() {
  const tabs = [
    { id: 'tabDashboard', view: 'viewDashboard', loadFn: loadDashboard },
    { id: 'tabUsers', view: 'viewUsers', loadFn: loadUsers },
    { id: 'tabExams', view: 'viewExams', loadFn: loadExams },
    { id: 'tabAnnouncements', view: 'viewAnnouncements', loadFn: loadAnnouncements }
  ];

  tabs.forEach(tab => {
    document.getElementById(tab.id).addEventListener('click', () => {
      // Remove active classes
      tabs.forEach(t => {
        document.getElementById(t.id).classList.remove('active');
        document.getElementById(t.view).classList.remove('active');
      });
      // Set active
      document.getElementById(tab.id).classList.add('active');
      document.getElementById(tab.view).classList.add('active');
      
      // Update Title & Load data
      document.getElementById('pageTitle').textContent = document.getElementById(tab.id).textContent.trim();
      tab.loadFn();
    });
  });
}

// ==========================================
// Dashboard View
// ==========================================
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const stats = await res.json();
      document.getElementById('statUsers').textContent = stats.totalUsers || 0;
      document.getElementById('statExams').textContent = stats.totalExams || 0;
      document.getElementById('statPremium').textContent = stats.pendingPremiumRequests || 0;
    }
    
    // Announcements count doesn't come from stats, fetch manually
    const resAnn = await fetch(`${API_BASE}/api/announcements`);
    if (resAnn.ok) {
      const announcements = await resAnn.json();
      document.getElementById('statAnnouncements').textContent = announcements.length || 0;
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

// ==========================================
// Users View
// ==========================================
async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const users = await res.json();
      const tbody = document.getElementById('usersTableBody');
      tbody.innerHTML = '';
      
      users.forEach(u => {
        const tr = document.createElement('tr');
        const roleBadge = u.role === 'ADMIN' ? 'badge-admin' : 'badge-user';
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${u.username}</td>
          <td>Lv ${u.level || 1}</td>
          <td>${u.points || 0}</td>
          <td><span class="badge ${roleBadge}">${u.role}</span></td>
          <td class="action-buttons">
            <button class="btn btn-outline" onclick="toggleUserRole(${u.id}, '${u.role}')">สลับสิทธิ</button>
            <button class="btn btn-danger" onclick="confirmDelete('user', ${u.id})">ลบ</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Users load error:', err);
  }
}

async function toggleUserRole(id, currentRole) {
  const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      loadUsers();
    } else {
      alert('ไม่สามารถเปลี่ยนสิทธิได้');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// Exams View
// ==========================================
async function loadExams() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/exams`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const exams = await res.json();
      const tbody = document.getElementById('examsTableBody');
      tbody.innerHTML = '';
      
      exams.forEach(ex => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${ex.id}</td>
          <td>${ex.title}</td>
          <td>${ex.category}</td>
          <td>${ex.totalCount}</td>
          <td><span class="badge badge-user">${ex.status}</span></td>
          <td class="action-buttons">
            <button class="btn btn-danger" onclick="confirmDelete('exam', ${ex.id})">ลบ</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Exams load error:', err);
  }
}

function showAddExamModal() {
  alert('ฟีเจอร์เพิ่มชุดข้อสอบใหม่ผ่านหน้าเว็บกำลังพัฒนา กรุณาใช้สคริปต์หลังบ้านชั่วคราว');
}

// ==========================================
// Announcements View
// ==========================================
let editAnnouncementId = null;

async function loadAnnouncements() {
  try {
    const res = await fetch(`${API_BASE}/api/announcements`);
    if (res.ok) {
      const announcements = await res.json();
      const tbody = document.getElementById('announcementsTableBody');
      tbody.innerHTML = '';
      
      announcements.forEach(ann => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${ann.id}</td>
          <td>${ann.orgAbbr}</td>
          <td>${ann.jobTitle}</td>
          <td>${ann.positionsCount}</td>
          <td><span class="badge badge-user">${ann.status}</span></td>
          <td class="action-buttons">
            <button class="btn btn-outline" onclick="editAnnouncement(${ann.id})">แก้ไข</button>
            <button class="btn btn-danger" onclick="confirmDelete('announcement', ${ann.id})">ลบ</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Announcements load error:', err);
  }
}

function showAddAnnouncementModal() {
  editAnnouncementId = null;
  document.getElementById('announcementModalTitle').textContent = 'เพิ่มประกาศรับสมัคร';
  document.getElementById('annOrgName').value = '';
  document.getElementById('annOrgAbbr').value = '';
  document.getElementById('annJobTitle').value = '';
  document.getElementById('annPositions').value = '';
  document.getElementById('annYear').value = '';
  document.getElementById('annLink').value = '';
  
  document.getElementById('announcementModal').style.display = 'flex';
}

async function editAnnouncement(id) {
  try {
    const res = await fetch(`${API_BASE}/api/announcements`);
    if (res.ok) {
      const announcements = await res.json();
      const ann = announcements.find(a => a.id === id);
      if (ann) {
        editAnnouncementId = id;
        document.getElementById('announcementModalTitle').textContent = 'แก้ไขประกาศ';
        document.getElementById('annOrgName').value = ann.orgName;
        document.getElementById('annOrgAbbr').value = ann.orgAbbr;
        document.getElementById('annJobTitle').value = ann.jobTitle;
        document.getElementById('annPositions').value = ann.positionsCount;
        document.getElementById('annYear').value = ann.year;
        document.getElementById('annLink').value = ann.link || '';
        
        document.getElementById('announcementModal').style.display = 'flex';
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function saveAnnouncement() {
  const payload = {
    orgName: document.getElementById('annOrgName').value,
    orgAbbr: document.getElementById('annOrgAbbr').value,
    jobTitle: document.getElementById('annJobTitle').value,
    positionsCount: parseInt(document.getElementById('annPositions').value) || 0,
    year: parseInt(document.getElementById('annYear').value) || new Date().getFullYear(),
    link: document.getElementById('annLink').value
  };

  const method = editAnnouncementId ? 'PUT' : 'POST';
  const url = editAnnouncementId 
    ? `${API_BASE}/api/announcements/${editAnnouncementId}`
    : `${API_BASE}/api/announcements`;

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      closeModal('announcementModal');
      loadAnnouncements();
    } else {
      alert('บันทึกข้อมูลล้มเหลว');
    }
  } catch (err) {
    console.error('Save announcement error:', err);
  }
}

// ==========================================
// Global Modals & Helpers
// ==========================================
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

let deleteTarget = null;
let deleteId = null;

function confirmDelete(target, id) {
  deleteTarget = target;
  deleteId = id;
  document.getElementById('confirmModal').style.display = 'flex';
}

document.getElementById('btnConfirmDelete').addEventListener('click', async () => {
  if (!deleteTarget || !deleteId) return;
  
  let url = '';
  if (deleteTarget === 'user') url = `${API_BASE}/api/admin/users/${deleteId}`;
  if (deleteTarget === 'exam') url = `${API_BASE}/api/admin/exams/${deleteId}`;
  if (deleteTarget === 'announcement') url = `${API_BASE}/api/announcements/${deleteId}`;

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      closeModal('confirmModal');
      if (deleteTarget === 'user') loadUsers();
      if (deleteTarget === 'exam') loadExams();
      if (deleteTarget === 'announcement') loadAnnouncements();
    } else {
      alert('ไม่สามารถลบข้อมูลได้');
    }
  } catch (err) {
    console.error('Delete error:', err);
  }
});

// Run Init
window.addEventListener('DOMContentLoaded', initAdmin);
