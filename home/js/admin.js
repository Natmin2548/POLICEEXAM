function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Configuration
function getApiBase() {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return '';
  if (host.includes('onrender.com')) return 'https://police-exam-backend.onrender.com';
  return '';
}
const API_BASE = getApiBase();

const authToken = localStorage.getItem('authToken');
let currentUser = null;

// Initialization
async function initAdmin() {
  if (!authToken) {
    alert('ไม่พบ Token สำหรับยืนยันตัวตน (Session ว่างเปล่า) กรุณาล็อกอินใหม่');
    window.location.href = '/index.html';
    return;
  }

  try {
    // Verify user role
    let currentUserProfile = null;
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        currentUserProfile = data.user;
        localStorage.setItem('userProfile', JSON.stringify(currentUserProfile));
      }
    } catch (fetchErr) {
      console.warn('Backend fetch failed, falling back to cached profile:', fetchErr);
    }

    // Fallback to cache if API failed
    if (!currentUserProfile) {
      const cachedProfileStr = localStorage.getItem('userProfile');
      if (cachedProfileStr) {
        try { currentUserProfile = JSON.parse(cachedProfileStr); } catch (e) {}
      }
    }

    if (!currentUserProfile) {
      alert('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      window.location.href = '/index.html';
      return;
    }

    currentUser = currentUserProfile;

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'OWNER') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (สำหรับผู้ดูแลระบบเท่านั้น)');
      window.location.href = 'index.html';
      return;
    }

    document.getElementById('adminUserInfo').textContent = `Admin: ${currentUser.username || currentUser.fullName || currentUser.email || 'Admin'}`;
    
    // Setup Navigation
    setupTabs();
    
    // Load Dashboard by default
    loadDashboard();
    
  } catch (err) {
    console.error('Init Admin error:', err);
    alert('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ: ' + err.message + '\nกรุณาล็อกเอาท์และล็อกอินใหม่');
    window.location.href = 'index.html';
  }
}

// Tab Navigation
function setupTabs() {
  const tabs = [
    { id: 'tabDashboard', view: 'viewDashboard', loadFn: loadDashboard },
    { id: 'tabUsers', view: 'viewUsers', loadFn: loadUsers },
    { id: 'tabExams', view: 'viewExams', loadFn: loadExams },
    { id: 'tabAnnouncements', view: 'viewAnnouncements', loadFn: loadAnnouncements },
    { id: 'tabReports', view: 'viewReports', loadFn: loadAdminReports }
  ];

  tabs.forEach(tab => {
    const tabEl = document.getElementById(tab.id);
    if (!tabEl) return;
    tabEl.addEventListener('click', () => {
      // Remove active classes
      tabs.forEach(t => {
        const el = document.getElementById(t.id);
        const vEl = document.getElementById(t.view);
        if (el) el.classList.remove('active');
        if (vEl) vEl.classList.remove('active');
      });
      // Set active
      tabEl.classList.add('active');
      const targetView = document.getElementById(tab.view);
      if (targetView) targetView.classList.add('active');
      
      // Update Title & Load data
      const pageTitleEl = document.getElementById('pageTitle');
      if (pageTitleEl) pageTitleEl.textContent = tabEl.textContent.trim();
      if (typeof tab.loadFn === 'function') tab.loadFn();
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

    // Update pending reports badge count
    if (typeof updateReportsCount === 'function') {
      updateReportsCount();
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

// ==========================================
// Users View & Detailed Statistics
// ==========================================
let allLoadedUsers = [];
let currentUserFilterStatus = 'ALL';
let currentUserSearchQuery = '';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const SUBJECT_ICON_MAP = {
  'ความสามารถทั่วไป': '🧠',
  'ทั่วไป': '🧠',
  'ภาษาไทย': '🇹🇭',
  'ไทย': '🇹🇭',
  'ภาษาอังกฤษ': '🇬🇧',
  'อังกฤษ': '🇬🇧',
  'คอม': '💻',
  'คอมพิวเตอร์': '💻',
  'เทคโนโลยีสารสนเทศ': '💻',
  'สังคม': '🏛️',
  'สังคม วัฒนธรรม และอาเซียน': '🏛️',
  'งานสารบรรณ': '📜',
  'ระเบียบงานสารบรรณ': '📜',
  'ลักษณะที่54': '📑',
  'ลักษณะ ๕๔': '📑',
  'สารบรรณตำรวจ': '📑',
  'กฏหมาย': '⚖️',
  'กฎหมาย': '⚖️',
  'กฎหมายที่ควรรู้': '⚖️'
};

function getSubjectIcon(subName) {
  if (!subName) return '📚';
  for (const [key, icon] of Object.entries(SUBJECT_ICON_MAP)) {
    if (subName.includes(key)) return icon;
  }
  return '📚';
}

function formatThaiDateTime(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      allLoadedUsers = await res.json();
      renderUsersWithFilters();
    }
  } catch (err) {
    console.error('Users load error:', err);
  }
}

function renderUsersWithFilters() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const q = currentUserSearchQuery.toLowerCase().trim();

  const filtered = allLoadedUsers.filter(u => {
    // 1. Search Query
    if (q) {
      const matchId = String(u.id).includes(q);
      const matchUsername = (u.username || '').toLowerCase().includes(q);
      const matchName = (u.fullName || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      if (!matchId && !matchUsername && !matchName && !matchEmail) return false;
    }

    // 2. Filter Status
    const totalExams = (u.quizCount || 0) + (u.completionsCount || 0);
    if (currentUserFilterStatus === 'HAS_EXAMS') {
      return totalExams > 0;
    }
    if (currentUserFilterStatus === 'NO_EXAMS') {
      return totalExams === 0;
    }
    if (currentUserFilterStatus === 'ADMIN_ONLY') {
      return u.role === 'ADMIN' || u.role === 'OWNER';
    }

    return true;
  });

  // Update counters
  const totalBadge = document.getElementById('usersTotalCountBadge');
  if (totalBadge) {
    totalBadge.textContent = `${filtered.length} / ${allLoadedUsers.length} คน`;
  }

  const summaryEl = document.getElementById('userFilterStatsSummary');
  if (summaryEl) {
    const activeQuizUsers = allLoadedUsers.filter(u => (u.quizCount || 0) > 0);
    summaryEl.innerHTML = `ผู้ใช้ที่ทำข้อสอบแล้ว: <b style="color: #059669;">${activeQuizUsers.length} คน</b>`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 48px 16px; color: #64748B;">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <div style="font-size: 15px; font-weight: 700; color: #1E293B;">ไม่พบข้อมูลผู้ใช้ที่ค้นหา</div>
          <div style="font-size: 13px; margin-top: 4px;">ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเป็น "ผู้ใช้ทั้งหมด"</div>
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(u => {
    const tr = document.createElement('tr');
    tr.style.transition = 'background 0.15s ease';

    const roleBadge = u.role === 'ADMIN' || u.role === 'OWNER' ? 'badge-admin' : 'badge-user';
    const initial = ((u.fullName && u.fullName.trim()) || u.username || 'U').charAt(0).toUpperCase();

    // Exams Count Badge
    let examBadgeHtml = '';
    const examCount = u.quizCount || 0;
    if (examCount > 0) {
      examBadgeHtml = `<span class="badge" style="background: #EFF6FF; color: #1D4ED8; font-weight: 700; font-size: 12.5px; border: 1px solid #BFDBFE;">📝 ${examCount} ชุด</span>`;
    } else {
      examBadgeHtml = `<span style="color: #94A3B8; font-size: 12.5px;">-</span>`;
    }

    // Average Score Badge
    let scoreBadgeHtml = '';
    if (examCount > 0) {
      const avg = u.avgScore || 0;
      if (avg >= 60) {
        scoreBadgeHtml = `<span class="badge" style="background: #ECFDF5; color: #059669; font-weight: 800; font-size: 12.5px; border: 1px solid #A7F3D0;">${avg}% ผ่าน</span>`;
      } else {
        scoreBadgeHtml = `<span class="badge" style="background: #FFFBEB; color: #D97706; font-weight: 800; font-size: 12.5px; border: 1px solid #FDE68A;">${avg}%</span>`;
      }
    } else {
      scoreBadgeHtml = `<span style="color: #94A3B8; font-size: 12.5px;">-</span>`;
    }

    tr.innerHTML = `
      <td style="font-weight: 700; color: #64748B;">#${u.id}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #CBD5E1, #94A3B8); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0;">
            ${initial}
          </div>
          <div>
            <div style="font-weight: 700; color: #0F172A; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span>${escapeHtml(u.fullName || u.username)}</span>
            </div>
            <div style="font-size: 12px; color: #64748B; margin-top: 1px;">
              @${escapeHtml(u.username)} • ${escapeHtml(u.email || '-')}
            </div>
          </div>
        </div>
      </td>
      <td style="text-align: center;">${examBadgeHtml}</td>
      <td style="text-align: center;">${scoreBadgeHtml}</td>
      <td style="text-align: center;">
        <div style="font-weight: 700; color: #EA580C; font-size: 13px;">🔥 ${u.streak || 1} วัน</div>
        <div style="font-size: 11.5px; color: #64748B;">⭐ ${u.points || 0} แต้ม (Lv.${u.level || 1})</div>
      </td>
      <td style="text-align: center;">
        <span class="badge ${roleBadge}">${u.role}</span>
      </td>
      <td style="text-align: right;">
        <div style="display: inline-flex; align-items: center; gap: 6px;">
          <button class="btn" onclick="openUserStatsModal(${u.id})" style="background: linear-gradient(135deg, #0284C7, #0369A1); color: white; padding: 7px 13px; border-radius: 9px; font-weight: 700; font-size: 12.5px; box-shadow: 0 2px 6px rgba(2,132,199,0.25); display: inline-flex; align-items: center; gap: 4px; border: none; cursor: pointer;">
            <span>📊 สถิติ</span>
          </button>
          <button class="btn btn-outline" onclick="toggleUserRole(${u.id}, '${u.role}')" style="padding: 7px 11px; font-size: 12.5px;">สลับสิทธิ</button>
          <button class="btn btn-danger" onclick="confirmDelete('user', ${u.id})" style="padding: 7px 10px; font-size: 12.5px;">ลบ</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.onUserSearchInput = function() {
  const input = document.getElementById('userSearchInput');
  currentUserSearchQuery = input ? input.value : '';
  renderUsersWithFilters();
};

window.onUserFilterStatusChange = function() {
  const select = document.getElementById('userFilterExamStatus');
  currentUserFilterStatus = select ? select.value : 'ALL';
  renderUsersWithFilters();
};

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
      const err = await res.json();
      alert(err.error || 'ไม่สามารถเปลี่ยนสิทธิได้');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// User Detailed Statistics Modal
// ==========================================
window.openUserStatsModal = async function(userId) {
  const modal = document.getElementById('adminUserStatsModal');
  const body = document.getElementById('modalUserStatsBody');
  if (!modal || !body) return;

  modal.style.display = 'flex';
  body.innerHTML = `
    <div style="text-align: center; padding: 60px 20px; color: #64748B;">
      <div style="font-size: 32px; animation: spin 1s linear infinite; display: inline-block; margin-bottom: 12px;">⏳</div>
      <div style="font-size: 15px; font-weight: 700; color: #1E293B;">กำลังโหลดสถิติและประวัติการทำข้อสอบ...</div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!res.ok) {
      const err = await res.json();
      body.innerHTML = `<div style="text-align: center; padding: 40px; color: #EF4444; font-weight: 700;">${err.error || 'เกิดข้อผิดพลาดในการโหลดสถิติ'}</div>`;
      return;
    }

    const data = await res.json();
    const u = data.user;
    const s = data.summary;
    const subjects = data.subjectStats || [];
    const attempts = data.attempts || [];

    // Header updates
    const avatarEl = document.getElementById('modalUserAvatar');
    const nameEl = document.getElementById('modalUserFullName');
    const roleBadgeEl = document.getElementById('modalUserRoleBadge');
    const idBadgeEl = document.getElementById('modalUserIdBadge');
    const metaEl = document.getElementById('modalUserMetaInfo');

    const initial = ((u.fullName && u.fullName.trim()) || u.username || 'U').charAt(0).toUpperCase();
    if (avatarEl) avatarEl.textContent = initial;
    if (nameEl) nameEl.textContent = u.fullName || u.username;
    if (roleBadgeEl) {
      roleBadgeEl.textContent = u.role;
      roleBadgeEl.className = `badge ${u.role === 'ADMIN' || u.role === 'OWNER' ? 'badge-admin' : 'badge-user'}`;
    }
    if (idBadgeEl) idBadgeEl.textContent = `ID: #${u.id}`;
    if (metaEl) {
      metaEl.textContent = `@${u.username} • ${u.email || '-'} • สมัครเมื่อ: ${formatThaiDateTime(u.createdAt)}`;
    }

    // Render Stats HTML
    let html = `
      <!-- KPI Overview Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 24px;">
        <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12.5px; font-weight: 700; color: #64748B;">ทำข้อสอบแล้ว</span>
            <span style="font-size: 18px;">📝</span>
          </div>
          <div style="font-size: 26px; font-weight: 800; color: #0284C7; margin-top: 6px;">
            ${s.totalAttempts} <span style="font-size: 14px; font-weight: 600; color: #64748B;">ชุด</span>
          </div>
          <div style="font-size: 11.5px; color: #94A3B8; margin-top: 2px;">จำนวนการทำข้อสอบทั้งหมด</div>
        </div>

        <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12.5px; font-weight: 700; color: #64748B;">คะแนนเฉลี่ยรวม</span>
            <span style="font-size: 18px;">🎯</span>
          </div>
          <div style="font-size: 26px; font-weight: 800; color: ${s.avgScore >= 60 ? '#059669' : '#D97706'}; margin-top: 6px;">
            ${s.avgScore}%
          </div>
          <div style="font-size: 11.5px; color: #94A3B8; margin-top: 2px;">สูงสุด: ${s.highestScore}%</div>
        </div>

        <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12.5px; font-weight: 700; color: #64748B;">ผ่านเกณฑ์ (≥60%)</span>
            <span style="font-size: 18px;">🏆</span>
          </div>
          <div style="font-size: 26px; font-weight: 800; color: #059669; margin-top: 6px;">
            ${s.passedCount} <span style="font-size: 14px; font-weight: 600; color: #64748B;">ชุด (${s.passRate}%)</span>
          </div>
          <div style="font-size: 11.5px; color: #94A3B8; margin-top: 2px;">ไม่ผ่าน: ${s.failedCount} ชุด</div>
        </div>

        <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12.5px; font-weight: 700; color: #64748B;">Streak ต่อเนื่อง</span>
            <span style="font-size: 18px;">🔥</span>
          </div>
          <div style="font-size: 26px; font-weight: 800; color: #EA580C; margin-top: 6px;">
            ${u.streak || 1} <span style="font-size: 14px; font-weight: 600; color: #64748B;">วัน</span>
          </div>
          <div style="font-size: 11.5px; color: #94A3B8; margin-top: 2px;">แต้มสะสม: ${u.points || 0} (Lv.${u.level || 1})</div>
        </div>
      </div>

      <!-- Subject Performance Breakdown (8 หมวดวิชา) -->
      <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 18px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 6px;">
              <span>📊 ผลคะแนนเฉลี่ยแยกตามหมวดวิชา (Subject Mastery)</span>
            </h4>
            <p style="margin: 2px 0 0 0; font-size: 12.5px; color: #64748B;">คำนวณจากประวัติการทำข้อสอบทุกชุดของผู้ใช้</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
    `;

    subjects.forEach(sub => {
      const icon = getSubjectIcon(sub.name || sub.key);
      const avg = sub.avgScore || 0;
      const barColor = avg >= 60 ? '#10B981' : avg >= 40 ? '#F59E0B' : avg > 0 ? '#EF4444' : '#E2E8F0';
      const textColor = avg >= 60 ? '#059669' : avg >= 40 ? '#D97706' : avg > 0 ? '#DC2626' : '#94A3B8';

      html += `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="font-size: 13.5px; font-weight: 700; color: #1E293B; display: flex; align-items: center; gap: 6px;">
              <span>${icon}</span>
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 190px;" title="${escapeHtml(sub.name)}">${escapeHtml(sub.name)}</span>
            </div>
            <span style="font-size: 14px; font-weight: 800; color: ${textColor};">
              ${avg}%
            </span>
          </div>

          <!-- Progress Bar -->
          <div style="width: 100%; height: 7px; background: #E2E8F0; border-radius: 999px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${Math.min(100, Math.max(0, avg))}%; height: 100%; background: ${barColor}; border-radius: 999px; transition: width 0.5s ease;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #64748B;">
            <span>ทำแล้ว: <b style="color: #0F172A;">${sub.attemptsCount}</b> ชุด</span>
            <span>สูงสุด: <b style="color: #0F172A;">${sub.maxScore || 0}%</b></span>
            <span>ผ่าน: <b style="color: #059669;">${sub.passedCount || 0}</b></span>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>

      <!-- Quiz Attempts Log (ประวัติการทำข้อสอบทุกครั้ง) -->
      <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 18px; overflow: hidden;">
        <div style="padding: 18px 20px; border-bottom: 1.5px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 6px;">
              <span>📜 ประวัติการทำข้อสอบทั้งหมด (${attempts.length} ครั้งล่าสุด)</span>
            </h4>
            <p style="margin: 2px 0 0 0; font-size: 12.5px; color: #64748B;">แสดงรายการชุดข้อสอบที่ผู้ใช้คนนี้เคยทำ เรียงจากล่าสุด</p>
          </div>
        </div>
    `;

    if (attempts.length === 0) {
      html += `
        <div style="text-align: center; padding: 40px 20px; color: #64748B;">
          <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
          <div style="font-size: 14.5px; font-weight: 700; color: #1E293B;">ผู้ใช้นี้ยังไม่มีประวัติการทำข้อสอบในระบบ</div>
          <div style="font-size: 12.5px; margin-top: 2px;">เมื่อผู้ใช้เริ่มทำข้อสอบ สถิติและประวัติจะปรากฏที่นี่อัตโนมัติ</div>
        </div>
      `;
    } else {
      html += `
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                <th style="padding: 12px 16px; font-size: 11.5px; font-weight: 700; color: #64748B; text-align: left; width: 50px;">#</th>
                <th style="padding: 12px 16px; font-size: 11.5px; font-weight: 700; color: #64748B; text-align: left;">วันที่ / เวลา</th>
                <th style="padding: 12px 16px; font-size: 11.5px; font-weight: 700; color: #64748B; text-align: left;">หมวดวิชา</th>
                <th style="padding: 12px 16px; font-size: 11.5px; font-weight: 700; color: #64748B; text-align: left;">ชุดข้อสอบ</th>
                <th style="padding: 12px 16px; font-size: 11.5px; font-weight: 700; color: #64748B; text-align: center;">ข้อที่ถูก</th>
                <th style="padding: 12px 16px; font-size: 11.5px; font-weight: 700; color: #64748B; text-align: right;">ผลคะแนน / สถานะ</th>
              </tr>
            </thead>
            <tbody>
      `;

      attempts.forEach((att, idx) => {
        const icon = getSubjectIcon(att.subject);
        const isPassed = att.passed || (att.scorePct >= 60);
        const statusBadge = isPassed
          ? `<span class="badge" style="background: #ECFDF5; color: #059669; font-weight: 800; border: 1px solid #A7F3D0;">✅ ผ่าน (${att.scorePct}%)</span>`
          : `<span class="badge" style="background: #FEF2F2; color: #DC2626; font-weight: 800; border: 1px solid #FECACA;">❌ ไม่ผ่าน (${att.scorePct}%)</span>`;

        html += `
          <tr style="border-bottom: 1px solid #F1F5F9;">
            <td style="padding: 12px 16px; font-size: 12px; color: #64748B; font-weight: 600;">${idx + 1}</td>
            <td style="padding: 12px 16px; font-size: 12.5px; color: #475569; white-space: nowrap;">
              ${formatThaiDateTime(att.createdAt)}
            </td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #1E293B; white-space: nowrap;">
              ${icon} ${escapeHtml(att.subject || '-')}
            </td>
            <td style="padding: 12px 16px; font-size: 13px; color: #334155;">
              <div style="font-weight: 600;">${escapeHtml(att.setTitle || 'แบบทดสอบ')}</div>
              ${att.setId ? `<div style="font-size: 11px; color: #94A3B8;">รหัสชุด: ${escapeHtml(att.setId)}</div>` : ''}
            </td>
            <td style="padding: 12px 16px; font-size: 13px; text-align: center; font-weight: 700; color: #0F172A; white-space: nowrap;">
              ${att.correctCount} / ${att.totalQuestions}
            </td>
            <td style="padding: 12px 16px; text-align: right; white-space: nowrap;">
              ${statusBadge}
            </td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    html += `</div>`;

    body.innerHTML = html;

  } catch (err) {
    console.error('Failed to load user stats:', err);
    body.innerHTML = `<div style="text-align: center; padding: 40px; color: #EF4444; font-weight: 700;">เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์</div>`;
  }
};

window.closeUserStatsModal = function() {
  const modal = document.getElementById('adminUserStatsModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// ==========================================
// Exams View (Filtered by Subject & Chapter + Auto Set Numbering)
// ==========================================
let allLoadedExams = [];
let currentExamFilterSubject = 'ALL';
let currentExamFilterChapter = 'ALL';
let currentExamFilterSearch = '';

async function loadExams() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/exams`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      allLoadedExams = await res.json();
      updateFilterChapterDropdown();
      renderExamsWithFilters();
    }
  } catch (err) {
    console.error('Exams load error:', err);
  }
}

function updateFilterChapterDropdown() {
  const chapterSelect = document.getElementById('filterExamChapter');
  if (!chapterSelect) return;

  const subject = currentExamFilterSubject;
  chapterSelect.innerHTML = '<option value="ALL">ทุกหมวดหมู่ (All Chapters)</option>';

  if (subject !== 'ALL') {
    const chapters = SUBJECT_CHAPTERS[subject] || [];
    chapters.forEach(ch => {
      if (ch.value !== 'ALL') {
        chapterSelect.innerHTML += `<option value="${ch.value}">${ch.label}</option>`;
      }
    });
  } else {
    // Collect all unique subcategories from loaded exams
    const allSubcats = Array.from(new Set(allLoadedExams.map(e => e.subcategory).filter(Boolean)));
    allSubcats.forEach(sub => {
      chapterSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
  }
}

function renderExamsWithFilters() {
  const tbody = document.getElementById('examsTableBody');
  const summaryEl = document.getElementById('examsCountSummary');
  if (!tbody) return;

  tbody.innerHTML = '';

  const filtered = allLoadedExams.filter(ex => {
    // 1. Subject Filter
    if (currentExamFilterSubject !== 'ALL') {
      const isSubMatch = ex.category === currentExamFilterSubject || 
        (currentExamFilterSubject.includes('สารบรรณ') && ex.category && ex.category.includes('สารบรรณ')) ||
        (currentExamFilterSubject === 'งานสารบรรณ_๒๕๒๖' && ex.category && (ex.category.includes('๒๕๒๖') || ex.category === 'งานสารบรรณ')) ||
        (currentExamFilterSubject === 'สารบรรณตำรวจ_๕๔' && ex.category && (ex.category.includes('๕๔') || ex.category === 'ลักษณะที่54'));
      if (!isSubMatch) return false;
    }

    // 2. Chapter Filter
    if (currentExamFilterChapter !== 'ALL') {
      const cleanFilter = currentExamFilterChapter.replace(/บทที่\s*\d+\s*/, '').trim();
      const matchSubcat = ex.subcategory && (ex.subcategory === currentExamFilterChapter || ex.subcategory.includes(cleanFilter));
      const matchTitle = ex.title && cleanFilter && ex.title.includes(cleanFilter);
      if (!matchSubcat && !matchTitle) return false;
    }

    // 3. Search Filter
    if (currentExamFilterSearch) {
      const q = currentExamFilterSearch.toLowerCase();
      const matchText = (ex.title && ex.title.toLowerCase().includes(q)) ||
        (ex.subcategory && ex.subcategory.toLowerCase().includes(q)) ||
        (ex.category && ex.category.toLowerCase().includes(q)) ||
        (String(ex.id).includes(q));
      if (!matchText) return false;
    }

    return true;
  });

  if (summaryEl) {
    summaryEl.textContent = `พบทั้งหมด ${filtered.length} ชุดข้อสอบ (จากคลังทั้งหมด ${allLoadedExams.length} ชุด)`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 32px; color: #94A3B8;">
          <div style="font-size: 28px; margin-bottom: 8px;">📂</div>
          <div style="font-weight: 600; font-size: 14px;">ไม่พบชุดข้อสอบตามเงื่อนไขที่เลือก</div>
          <button onclick="resetExamFilters()" class="btn btn-outline" style="margin-top: 10px; font-size: 12px;">ล้างตัวกรองทั้งหมด</button>
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(ex => {
    const tr = document.createElement('tr');
    
    // Subject badge styling
    let subjectBadgeStyle = 'background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;';
    if (ex.category && (ex.category.includes('สารบรรณ') || ex.category.includes('๒๕๒๖'))) {
      subjectBadgeStyle = 'background: #FEF2F2; color: #BD1B0B; border: 1px solid #FECACA;';
    } else if (ex.category && (ex.category.includes('๕๔') || ex.category.includes('ตำรวจ'))) {
      subjectBadgeStyle = 'background: #FDF4FF; color: #86198F; border: 1px solid #F5D0FE;';
    } else if (ex.category && ex.category.includes('กฎหมาย')) {
      subjectBadgeStyle = 'background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0;';
    }

    const subcatText = ex.subcategory || 'รวมทุกหมวด';

    tr.innerHTML = `
      <td style="font-weight: 700; color: #64748B;">#${ex.id}</td>
      <td style="font-weight: 700; color: #0F172A; max-width: 260px;">
        <div style="line-height: 1.4;">${escapeHTML(ex.title)}</div>
      </td>
      <td>
        <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; ${subjectBadgeStyle}">
          ${escapeHTML(ex.category || 'ทั่วไป')}
        </span>
      </td>
      <td>
        <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1;">
          ${escapeHTML(subcatText)}
        </span>
      </td>
      <td style="text-align: center; font-weight: 700; color: #0F172A;">
        ${ex.totalCount || 0} ข้อ
      </td>
      <td style="text-align: center;">
        <span class="badge ${ex.status === 'PUBLISHED' ? 'badge-user' : 'badge-admin'}" style="${ex.status === 'PUBLISHED' ? 'background: #ECFDF5; color: #059669;' : 'background: #FFFBEB; color: #D97706;'}">
          ${ex.status === 'PUBLISHED' ? 'เปิดสอบ' : 'ฉบับร่าง'}
        </span>
      </td>
      <td class="action-buttons" style="text-align: right; white-space: nowrap;">
        <button class="btn btn-outline" style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; padding: 6px 10px; font-size: 11.5px; font-weight: 700;" onclick="openEditExamModal(${ex.id})">✏️ แก้ไขเนื้อหา</button>
        <button class="btn btn-outline" style="background: #EEF2FF; color: #4F46E5; border: 1px solid #C7D2FE; padding: 6px 10px; font-size: 11.5px;" onclick="openAppendModal(${ex.id}, '${escapeHTML(ex.title)}', ${ex.totalCount})">➕ เพิ่มข้อสอบ</button>
        <button class="btn btn-danger" style="padding: 6px 10px; font-size: 11.5px;" onclick="confirmDelete('exam', ${ex.id})">🗑️ ลบ</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.onFilterExamSubjectChange = function() {
  const select = document.getElementById('filterExamSubject');
  currentExamFilterSubject = select ? select.value : 'ALL';
  currentExamFilterChapter = 'ALL';
  updateFilterChapterDropdown();
  renderExamsWithFilters();
};

window.onFilterExamChapterChange = function() {
  const select = document.getElementById('filterExamChapter');
  currentExamFilterChapter = select ? select.value : 'ALL';
  renderExamsWithFilters();
};

window.onFilterExamSearchChange = function() {
  const input = document.getElementById('filterExamSearch');
  currentExamFilterSearch = input ? input.value.trim() : '';
  renderExamsWithFilters();
};

window.resetExamFilters = function() {
  currentExamFilterSubject = 'ALL';
  currentExamFilterChapter = 'ALL';
  currentExamFilterSearch = '';
  
  const subSelect = document.getElementById('filterExamSubject');
  const chSelect = document.getElementById('filterExamChapter');
  const searchInput = document.getElementById('filterExamSearch');

  if (subSelect) subSelect.value = 'ALL';
  if (chSelect) chSelect.value = 'ALL';
  if (searchInput) searchInput.value = '';

  updateFilterChapterDropdown();
  renderExamsWithFilters();
};

// ==========================================
// Clear All Exams Feature
// ==========================================
window.clearAllExams = async function() {
  const confirmFirst = confirm('⚠️ คำเตือนสำคัญ!\n\nคุณต้องการ "ลบข้อสอบทั้งหมดทุกวิชาและทุกคำถาม" ในระบบใช่หรือไม่?\n\nข้อสอบที่เคยเจนไว้ทั้งหมดจะถูกลบทิ้งอย่างถาวรเพื่อให้คุณเริ่มต้นสร้างใหม่ได้');
  if (!confirmFirst) return;

  const confirmSecond = confirm('ยืนยันครั้งสุดท้าย: ลบชุดข้อสอบทั้งหมดในฐานข้อมูลใช่หรือไม่?');
  if (!confirmSecond) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/exams/all`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (res.ok) {
      alert(`🎉 ${data.message || 'ลบข้อสอบทั้งหมดเรียบร้อยแล้ว'}`);
      loadExams();
    } else {
      alert('เกิดข้อผิดพลาดในการลบข้อสอบ: ' + (data.error || 'ไม่สามารถลบได้'));
    }
  } catch (err) {
    console.error('Clear all exams error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  }
};

// ==========================================
// Edit Exam Set & Questions Content Logic
// ==========================================
let currentEditExamId = null;
let currentEditQuestions = [];

window.openEditExamModal = async function(examId) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/exams/${examId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      alert('ไม่สามารถโหลดข้อมูลชุดข้อสอบนี้ได้: ' + (errData.error || res.statusText || 'รหัสข้อผิดพลาด ' + res.status));
      return;
    }

    const exam = await res.json();
    currentEditExamId = exam.id;
    currentEditQuestions = (exam.questions || []).map(q => ({
      id: q.id || null,
      questionText: q.questionText || '',
      choice1: q.choice1 || '',
      choice2: q.choice2 || '',
      choice3: q.choice3 || '',
      choice4: q.choice4 || '',
      correctAnswer: parseInt(q.correctAnswer) || 1,
      explanation: q.explanation || ''
    }));

    document.getElementById('editExamId').value = exam.id;
    document.getElementById('editExamTitle').value = exam.title || '';
    document.getElementById('editExamCategory').value = exam.category || 'งานสารบรรณ_๒๕๒๖';
    document.getElementById('editExamSubcategory').value = exam.subcategory || '';
    document.getElementById('editExamStatus').value = exam.status || 'PUBLISHED';
    document.getElementById('editExamModalSubtitle').textContent = `แก้ไขชุด ID #${exam.id}: ${exam.title || ''}`;

    renderEditQuestionsList();
    document.getElementById('editExamModal').style.display = 'flex';

  } catch (err) {
    console.error('Open edit exam error:', err);
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
  }
};

window.closeEditExamModal = function() {
  document.getElementById('editExamModal').style.display = 'none';
  currentEditExamId = null;
  currentEditQuestions = [];
};

function syncEditQuestionsFromDOM() {
  currentEditQuestions.forEach((q, idx) => {
    const textEl = document.getElementById(`edit_q_text_${idx}`);
    const c1El = document.getElementById(`edit_q_c1_${idx}`);
    const c2El = document.getElementById(`edit_q_c2_${idx}`);
    const c3El = document.getElementById(`edit_q_c3_${idx}`);
    const c4El = document.getElementById(`edit_q_c4_${idx}`);
    const ansEl = document.getElementById(`edit_q_ans_${idx}`);
    const expEl = document.getElementById(`edit_q_exp_${idx}`);

    if (textEl) q.questionText = textEl.value;
    if (c1El) q.choice1 = c1El.value;
    if (c2El) q.choice2 = c2El.value;
    if (c3El) q.choice3 = c3El.value;
    if (c4El) q.choice4 = c4El.value;
    if (ansEl) q.correctAnswer = parseInt(ansEl.value) || 1;
    if (expEl) q.explanation = expEl.value;
  });
}

function renderEditQuestionsList() {
  const container = document.getElementById('editQuestionsContainer');
  const badge = document.getElementById('editExamQuestionBadge');
  if (!container) return;

  if (badge) badge.textContent = `${currentEditQuestions.length} ข้อ`;
  container.innerHTML = '';

  if (currentEditQuestions.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 32px 16px; background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 16px; color: #64748B;">
        <div style="font-size: 28px; margin-bottom: 8px;">📝</div>
        <div style="font-weight: 700; margin-bottom: 4px;">ยังไม่มีข้อสอบในชุดนี้</div>
        <p style="font-size: 13px; margin: 0 0 12px 0;">คุณสามารถกดปุ่มด้านล่างเพื่อเพิ่มข้อสอบใหม่ได้เลย</p>
        <button type="button" onclick="addNewQuestionToEditList()" class="btn btn-outline" style="border: 1.5px solid #4F46E5; color: #4F46E5; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 10px;">+ เพิ่มข้อสอบข้อแรก</button>
      </div>
    `;
    return;
  }

  currentEditQuestions.forEach((q, idx) => {
    const conflict = clientDetectConflict(q);
    const card = document.createElement('div');
    card.style.cssText = conflict.hasConflict
      ? 'background: #FFF5F5; border: 1.5px solid #F87171; border-radius: 16px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);'
      : 'background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);';

    const conflictHTML = conflict.hasConflict ? `
      <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 7px 10px; margin-bottom: 10px; font-size: 12px; color: #991B1B; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
        <span style="font-weight: 700;">⚠️ ${escapeHTML(conflict.reason)}</span>
        <button type="button" onclick="editQuickFixChoice(${idx}, ${conflict.detectedAnswer})" style="background: #DC2626; color: white; border: none; padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 11px; cursor: pointer;">
          สลับเป็นข้อ ${conflict.detectedAnswerLabel} ทันที
        </button>
      </div>
    ` : '';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: #EEF2FF; color: #4F46E5; font-weight: 800; font-size: 12.5px;">
            ${idx + 1}
          </span>
          <span style="font-weight: 800; color: #1E293B; font-size: 13.5px;">ข้อที่ ${idx + 1}</span>
          ${q.id ? `<span style="font-size: 11px; color: #94A3B8; font-family: monospace;">(ID: ${q.id})</span>` : '<span style="font-size: 11px; color: #059669; font-weight: 700; background: #ECFDF5; padding: 1px 6px; border-radius: 6px;">(ข้อใหม่)</span>'}
          ${conflict.hasConflict ? '<span style="background: #FEE2E2; color: #DC2626; font-size: 10.5px; font-weight: 800; padding: 1px 6px; border-radius: 6px;">เฉลยขัดแย้ง</span>' : ''}
        </div>
        <button type="button" onclick="removeQuestionFromEditList(${idx})" style="background: #FEF2F2; border: 1px solid #FECACA; color: #EF4444; padding: 4px 10px; border-radius: 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
          🗑️ ลบข้อนี้
        </button>
      </div>

      ${conflictHTML}

      <!-- โจทย์ / คำถาม -->
      <div style="margin-bottom: 14px;">
        <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px;">โจทย์คำถาม (Question Text):</label>
        <textarea id="edit_q_text_${idx}" class="form-input" rows="2" style="width: 100%; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #CBD5E1; font-size: 13px; font-family: inherit; box-sizing: border-box; resize: vertical;" placeholder="พิมพ์โจทย์คำถามข้อสอบ...">${escapeHTML(q.questionText)}</textarea>
      </div>

      <!-- ตัวเลือก 4 ข้อ -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 14px;">
        <div>
          <label style="display: block; font-size: 11.5px; font-weight: 700; color: #475569; margin-bottom: 4px;">ก. (Choice 1):</label>
          <input type="text" id="edit_q_c1_${idx}" value="${escapeHTML(q.choice1)}" placeholder="ตัวเลือก ก" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #CBD5E1; font-size: 12.5px; box-sizing: border-box;">
        </div>
        <div>
          <label style="display: block; font-size: 11.5px; font-weight: 700; color: #475569; margin-bottom: 4px;">ข. (Choice 2):</label>
          <input type="text" id="edit_q_c2_${idx}" value="${escapeHTML(q.choice2)}" placeholder="ตัวเลือก ข" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #CBD5E1; font-size: 12.5px; box-sizing: border-box;">
        </div>
        <div>
          <label style="display: block; font-size: 11.5px; font-weight: 700; color: #475569; margin-bottom: 4px;">ค. (Choice 3):</label>
          <input type="text" id="edit_q_c3_${idx}" value="${escapeHTML(q.choice3)}" placeholder="ตัวเลือก ค" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #CBD5E1; font-size: 12.5px; box-sizing: border-box;">
        </div>
        <div>
          <label style="display: block; font-size: 11.5px; font-weight: 700; color: #475569; margin-bottom: 4px;">ง. (Choice 4):</label>
          <input type="text" id="edit_q_c4_${idx}" value="${escapeHTML(q.choice4)}" placeholder="ตัวเลือก ง" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #CBD5E1; font-size: 12.5px; box-sizing: border-box;">
        </div>
      </div>

      <!-- เฉลย & คำอธิบาย -->
      <div style="display: grid; grid-template-columns: 180px 1fr; gap: 12px; background: #F8FAFC; padding: 12px; border-radius: 12px; border: 1px solid #E2E8F0;">
        <div>
          <label style="display: block; font-size: 12px; font-weight: 800; color: #059669; margin-bottom: 4px;">✅ เฉลยข้อที่ถูก:</label>
          <select id="edit_q_ans_${idx}" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #10B981; font-size: 12.5px; font-weight: 800; color: #047857; background: white;">
            <option value="1" ${q.correctAnswer === 1 ? 'selected' : ''}>ข้อ 1 (ก)</option>
            <option value="2" ${q.correctAnswer === 2 ? 'selected' : ''}>ข้อ 2 (ข)</option>
            <option value="3" ${q.correctAnswer === 3 ? 'selected' : ''}>ข้อ 3 (ค)</option>
            <option value="4" ${q.correctAnswer === 4 ? 'selected' : ''}>ข้อ 4 (ง)</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 4px;">💡 คำอธิบายเฉลยละเอียด:</label>
          <textarea id="edit_q_exp_${idx}" rows="1" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #CBD5E1; font-size: 12.5px; font-family: inherit; box-sizing: border-box; resize: vertical;" placeholder="ใส่เหตุผลหรือคำอธิบายเฉลย...">${escapeHTML(q.explanation || '')}</textarea>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

window.addNewQuestionToEditList = function() {
  syncEditQuestionsFromDOM();
  currentEditQuestions.push({
    id: null,
    questionText: '',
    choice1: '',
    choice2: '',
    choice3: '',
    choice4: '',
    correctAnswer: 1,
    explanation: ''
  });
  renderEditQuestionsList();
  
  // Auto scroll to bottom
  const container = document.getElementById('editQuestionsContainer');
  if (container && container.lastElementChild) {
    container.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.removeQuestionFromEditList = function(index) {
  syncEditQuestionsFromDOM();
  currentEditQuestions.splice(index, 1);
  renderEditQuestionsList();
};

window.saveEditExam = async function() {
  if (!currentEditExamId) return;

  syncEditQuestionsFromDOM();

  const title = document.getElementById('editExamTitle').value.trim();
  const category = document.getElementById('editExamCategory').value;
  const subcategory = document.getElementById('editExamSubcategory').value.trim();
  const status = document.getElementById('editExamStatus').value;

  if (!title) {
    alert('กรุณากรอกชื่อชุดข้อสอบ');
    return;
  }

  // Validate questions
  for (let i = 0; i < currentEditQuestions.length; i++) {
    const q = currentEditQuestions[i];
    if (!q.questionText.trim()) {
      alert(`กรุณากรอกโจทย์คำถามในข้อที่ ${i + 1}`);
      return;
    }
    if (!q.choice1.trim() || !q.choice2.trim()) {
      alert(`กรุณากรอกตัวเลือกอย่างน้อย ก และ ข ในข้อที่ ${i + 1}`);
      return;
    }
  }

  const btn = document.getElementById('btnSaveEditExam');
  try {
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.6';
    }

    const payload = {
      title,
      category,
      subcategory,
      status,
      questions: currentEditQuestions.map((q, idx) => ({
        id: q.id || null,
        questionText: q.questionText,
        choice1: q.choice1,
        choice2: q.choice2,
        choice3: q.choice3,
        choice4: q.choice4,
        correctAnswer: parseInt(q.correctAnswer) || 1,
        explanation: q.explanation || '',
        sortOrder: idx + 1
      }))
    };

    const res = await fetch(`${API_BASE}/api/admin/exams/${currentEditExamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + (data.error || 'ไม่สามารถบันทึกได้'));
      return;
    }

    alert(`🎉 ${data.message || 'บันทึกการแก้ไขชุดข้อสอบเรียบร้อยแล้ว'}`);
    closeEditExamModal();
    loadExams();

  } catch (err) {
    console.error('Save edit exam error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }
};

// ==========================================
// Cascading Dropdowns & AI Exam Generator Logic
// ==========================================
let cachedKnowledgeDocs = [];
let previewExamQuestions = [];
let appendTargetExamId = null;
let appendTargetCurrentCount = 0;

async function fetchKnowledgeDocs() {
  if (cachedKnowledgeDocs.length > 0) return cachedKnowledgeDocs;
  try {
    const res = await fetch(`${API_BASE}/api/admin/knowledge-topics`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      cachedKnowledgeDocs = await res.json();
    }
  } catch (err) {
    console.error('Fetch knowledge docs error:', err);
  }
  return cachedKnowledgeDocs;
}

async function showAddExamModal() {
  await fetchKnowledgeDocs();
  
  document.getElementById('examSubject').value = 'งานสารบรรณ';
  document.getElementById('examTitle').value = '';
  document.getElementById('examNumQuestions').value = '10';
  document.getElementById('examStatus').value = 'PUBLISHED';
  document.getElementById('aiProgressInfo').style.display = 'none';

  onSubjectChange();

  const savedKey = localStorage.getItem('admin_gemini_key') || '';
  const keyInput = document.getElementById('adminGeminiApiKey');
  if (keyInput) keyInput.value = savedKey;

  document.getElementById('addExamModal').style.display = 'flex';
}

function closeAddExamModal() {
  document.getElementById('addExamModal').style.display = 'none';
}

const SUBJECT_CHAPTERS = {
  'งานสารบรรณ_๒๕๒๖': [
    { value: 'ALL', label: '📚 รวมทุกบท (ระเบียบสารบรรณ ๒๕๒๖ และแก้ไขเพิ่มเติม)' },
    { value: 'บทที่ 1 บทนำและนิยาม', label: 'บทที่ 1 บทนำและนิยาม' },
    { value: 'บทที่ 2 มาตรฐานแบบพิมพ์ ตราครุฑ', label: 'บทที่ 2 มาตรฐานแบบพิมพ์ ตราครุฑ' },
    { value: 'บทที่ 3 หนังสือภายนอก หนังสือภายใน หนังสือประทับตรา', label: 'บทที่ 3 หนังสือภายนอก หนังสือภายใน หนังสือประทับตรา' },
    { value: 'บทที่ 4 หนังสือสั่งการ', label: 'บทที่ 4 หนังสือสั่งการ (คำสั่ง ข้อบังคับ ระเบียบ)' },
    { value: 'บทที่ 5 หนังสือประชาสัมพันธ์', label: 'บทที่ 5 หนังสือประชาสัมพันธ์ (ประกาศ แถลงการณ์ ข่าว)' },
    { value: 'บทที่ 6 หนังสือที่เจ้าหน้าที่จัดทำขึ้นหรือรับไว้เป็นหลักฐาน', label: 'บทที่ 6 หนังสือที่เจ้าหน้าที่จัดทำขึ้นหรือรับไว้เป็นหลักฐาน' },
    { value: 'บทที่ 7 เบ็ดเตล็ด สำเนา สำเนาคู่ฉบับ หนังสือเวียน', label: 'บทที่ 7 เบ็ดเตล็ด สำเนา สำเนาคู่ฉบับ หนังสือเวียน' },
    { value: 'บทที่ 8 การรับส่งหนังสือ', label: 'บทที่ 8 การรับและส่งหนังสือ' },
    { value: 'บทที่ 9 การเก็บรักษา', label: 'บทที่ 9 การเก็บรักษาหนังสือราชการ' },
    { value: 'บทที่ 10 การยืม', label: 'บทที่ 10 การยืมหนังสือราชการ' },
    { value: 'บทที่ 11 การทำลาย', label: 'บทที่ 11 การทำลายหนังสือราชการ' },
    { value: 'บทที่ 12 ระบบสารบรรณอิเล็กทรอนิกส์', label: 'บทที่ 12 ระบบสารบรรณอิเล็กทรอนิกส์ (e-Saraban)' },
    { value: 'บทที่ 13 รหัสพยัญชนะประจำส่วนราชการ', label: 'บทที่ 13 รหัสพยัญชนะประจำส่วนราชการ' }
  ],
  'สารบรรณตำรวจ_๕๔': [
    { value: 'ALL', label: '📚 รวมทุกบท (ประมวลระเบียบการตำรวจ ลักษณะที่ ๕๔)' },
    { value: 'บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ', label: 'บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ' },
    { value: 'บทที่ ๑-๒: การลงชื่อ การสั่งการ และการใช้บันทึกข้อความ', label: 'บทที่ ๑-๒: การลงชื่อ การสั่งการ และการใช้บันทึกข้อความ' },
    { value: 'บทที่ ๒-๓: เลขที่คำสั่งในบันทึกข้อความ และการเสนอ ผบ.ตร. (๕ หัวข้อ)', label: 'บทที่ ๒-๓: เลขที่คำสั่งในบันทึกข้อความ และการเสนอ ผบ.ตร. (๕ หัวข้อ)' },
    { value: 'บทที่ ๔-๖: ศูนย์รับส่งหนังสือ ตร. และการรับรองสำเนา (ร.ต.ต.ขึ้นไป)', label: 'บทที่ ๔-๖: ศูนย์รับส่งหนังสือ ตร. และการรับรองสำเนา (ร.ต.ต.ขึ้นไป)' },
    { value: 'บทที่ ๗: เลขที่หนังสือออก และรหัสประจำหน่วยงาน ตร (ตร ๐๐๐๑-๐๐๓๖)', label: 'บทที่ ๗: เลขที่หนังสือออก และรหัสประจำหน่วยงาน ตร (ตร ๐๐๐๑-๐๐๓๖)' },
    { value: 'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (ไทย)', label: 'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (ไทย)' },
    { value: 'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (English Abbreviations)', label: 'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (English Abbreviations)' },
    { value: 'บทที่ ๑๐-๑๑: ประกาศเจ้าพนักงานจราจร และไปรษณีย์สนามตำรวจชายแดน', label: 'บทที่ ๑๐-๑๑: ประกาศเจ้าพนักงานจราจร และไปรษณีย์สนามตำรวจชายแดน' }
  ],
  'ทั่วไป': [
    { value: 'ALL', label: '📚 รวมทุกหมวดความสามารถทั่วไป' },
    { value: 'บทที่ 1 อนุกรม', label: 'บทที่ 1 อนุกรม' },
    { value: 'บทที่ 2 อุปมา-อุปไมย', label: 'บทที่ 2 อุปมา-อุปไมย' },
    { value: 'บทที่ 3 IQ (โอเปเรชั่น และฝึกการคิดทั่วไป)', label: 'บทที่ 3 IQ (โอเปเรชั่น และฝึกการคิดทั่วไป)' },
    { value: 'บทที่ 4 เลขพื้นฐาน (กฎของเลขทั่วไป บวก ลบ คูณ หาร)', label: 'บทที่ 4 เลขพื้นฐาน (กฎของเลขทั่วไป บวก ลบ คูณ หาร)' },
    { value: 'บทที่ 5 ห.ร.ม และ ค.ร.น', label: 'บทที่ 5 ห.ร.ม และ ค.ร.น' },
    { value: 'บทที่ 6 อัตราส่วน', label: 'บทที่ 6 อัตราส่วน' },
    { value: 'บทที่ 7 ร้อยละ', label: 'บทที่ 7 ร้อยละ' },
    { value: 'บทที่ 8 สมการ', label: 'บทที่ 8 สมการ' },
    { value: 'บทที่ 9 เลขยกกำลังและพหุนาม', label: 'บทที่ 9 เลขยกกำลังและพหุนาม' },
    { value: 'บทที่ 10 อสมการ', label: 'บทที่ 10 อสมการ' },
    { value: 'บทที่ 11 ความน่าจะเป็น', label: 'บทที่ 11 ความน่าจะเป็น' },
    { value: 'บทที่ 12 เลขคณิตและเรขาคณิต', label: 'บทที่ 12 เลขคณิตและเรขาคณิต' },
    { value: 'บทที่ 13 พื้นที่และปริมาตร', label: 'บทที่ 13 พื้นที่และปริมาตร' },
    { value: 'บทที่ 14 สามเหลี่ยม', label: 'บทที่ 14 สามเหลี่ยม' },
    { value: 'บทที่ 15 เลขฐาน', label: 'บทที่ 15 เลขฐาน' },
    { value: 'บทที่ 16 เลข สถิติ', label: 'บทที่ 16 เลข สถิติ' },
    { value: 'บทที่ 17 เลข เซต', label: 'บทที่ 17 เลข เซต' },
    { value: 'บทที่ 18 ตรรกศาสตร์', label: 'บทที่ 18 ตรรกศาสตร์' },
    { value: 'บทที่ 19 การให้เหตุผล', label: 'บทที่ 19 การให้เหตุผล' }
  ],
  'สังคม': [
    { value: 'ALL', label: '📚 รวมทุกหมวดสังคมและจริยธรรม' },
    { value: 'บทที่ 1 สังคมวิทยา', label: 'บทที่ 1 สังคมวิทยา' },
    { value: 'บทที่ 2 วัฒนธรรม ประเพณี และสังคมไทย', label: 'บทที่ 2 วัฒนธรรม ประเพณี และสังคมไทย' },
    { value: 'บทที่ 3 หลักธรรมาภิบาล', label: 'บทที่ 3 หลักธรรมาภิบาล' },
    { value: 'บทที่ 4 ศาสนา', label: 'บทที่ 4 ศาสนา' },
    { value: 'บทที่ 5 Thailand ยุทธศาสตร์ แผนพัฒนาเศรษฐกิจ', label: 'บทที่ 5 Thailand ยุทธศาสตร์ แผนพัฒนาเศรษฐกิจ' },
    { value: 'บทที่ 6 เศรษฐกิจพอเพียง', label: 'บทที่ 6 เศรษฐกิจพอเพียง' },
    { value: 'บทที่ 7 ประวัติศาสตร์ และบุคคลสำคัญ', label: 'บทที่ 7 ประวัติศาสตร์ และบุคคลสำคัญ' },
    { value: 'บทที่ 8 ภูมิศาสตร์', label: 'บทที่ 8 ภูมิศาสตร์' },
    { value: 'บทที่ 9 เศรษฐศาสตร์พื้นฐาน', label: 'บทที่ 9 เศรษฐศาสตร์พื้นฐาน' },
    { value: 'บทที่ 10 อาเซียน', label: 'บทที่ 10 อาเซียน' }
  ],
  'สังคมและวัฒนธรรม': [
    { value: 'ALL', label: '📚 รวมทุกหมวดสังคมและจริยธรรม' },
    { value: 'บทที่ 1 สังคมวิทยา', label: 'บทที่ 1 สังคมวิทยา' },
    { value: 'บทที่ 2 วัฒนธรรม ประเพณี และสังคมไทย', label: 'บทที่ 2 วัฒนธรรม ประเพณี และสังคมไทย' },
    { value: 'บทที่ 3 หลักธรรมาภิบาล', label: 'บทที่ 3 หลักธรรมาภิบาล' },
    { value: 'บทที่ 4 ศาสนา', label: 'บทที่ 4 ศาสนา' },
    { value: 'บทที่ 5 Thailand ยุทธศาสตร์ แผนพัฒนาเศรษฐกิจ', label: 'บทที่ 5 Thailand ยุทธศาสตร์ แผนพัฒนาเศรษฐกิจ' },
    { value: 'บทที่ 6 เศรษฐกิจพอเพียง', label: 'บทที่ 6 เศรษฐกิจพอเพียง' },
    { value: 'บทที่ 7 ประวัติศาสตร์ และบุคคลสำคัญ', label: 'บทที่ 7 ประวัติศาสตร์ และบุคคลสำคัญ' },
    { value: 'บทที่ 8 ภูมิศาสตร์', label: 'บทที่ 8 ภูมิศาสตร์' },
    { value: 'บทที่ 9 เศรษฐศาสตร์พื้นฐาน', label: 'บทที่ 9 เศรษฐศาสตร์พื้นฐาน' },
    { value: 'บทที่ 10 อาเซียน', label: 'บทที่ 10 อาเซียน' }
  ],
  'กฏหมาย': [
    { value: 'ALL', label: '📚 รวมทุกหมวดกฎหมายที่ประชาชนควรรู้' },
    { value: 'บทที่ 1 ความรู้ทั่วไปเกี่ยวกับกฎหมาย', label: 'บทที่ 1 ความรู้ทั่วไปเกี่ยวกับกฎหมาย' },
    { value: 'บทที่ 2 ความรู้ทั่วไปเกี่ยวกับรัฐ', label: 'บทที่ 2 ความรู้ทั่วไปเกี่ยวกับรัฐ' },
    { value: 'บทที่ 3 ประวัติศาสตร์กฎหมายไทย', label: 'บทที่ 3 ประวัติศาสตร์กฎหมายไทย' },
    { value: 'บทที่ 4 รัฐธรรมนูญ (กฎหมายสูงสุด)', label: 'บทที่ 4 รัฐธรรมนูญ (กฎหมายสูงสุด)' },
    { value: 'บทที่ 5 กฎหมายปกครอง (กฎหมายมหาชน)', label: 'บทที่ 5 กฎหมายปกครอง (กฎหมายมหาชน)' },
    { value: 'บทที่ 6 กฎหมายแพ่ง — บุคคล', label: 'บทที่ 6 กฎหมายแพ่ง — บุคคล' },
    { value: 'บทที่ 7 กฎหมายแพ่ง — ทรัพย์', label: 'บทที่ 7 กฎหมายแพ่ง — ทรัพย์' },
    { value: 'บทที่ 8 กฎหมายแพ่ง — นิติกรรมและสัญญา', label: 'บทที่ 8 กฎหมายแพ่ง — นิติกรรมและสัญญา' },
    { value: 'บทที่ 9 กฎหมายแพ่ง — หนี้', label: 'บทที่ 9 กฎหมายแพ่ง — หนี้' },
    { value: 'บทที่ 10 กฎหมายแพ่ง — ครอบครัว', label: 'บทที่ 10 กฎหมายแพ่ง — ครอบครัว' },
    { value: 'บทที่ 11 กฎหมายแพ่ง — มรดกและพินัยกรรม', label: 'บทที่ 11 กฎหมายแพ่ง — มรดกและพินัยกรรม' },
    { value: 'บทที่ 12 กฎหมายอาญา — หลักทั่วไป', label: 'บทที่ 12 กฎหมายอาญา — หลักทั่วไป' },
    { value: 'บทที่ 13 กฎหมายอาญา — โครงสร้างความรับผิดทางอาญา', label: 'บทที่ 13 กฎหมายอาญา — โครงสร้างความรับผิดทางอาญา' },
    { value: 'บทที่ 14 กฎหมายอาญา — เหตุยกเว้นความผิด/โทษ และบทลงโทษ', label: 'บทที่ 14 กฎหมายอาญา — เหตุยกเว้นความผิด/โทษ และบทลงโทษ' },
    { value: 'บทที่ 15 กฎหมายอาญา — ตัวการ ผู้ใช้ ผู้สนับสนุน', label: 'บทที่ 15 กฎหมายอาญา — ตัวการ ผู้ใช้ ผู้สนับสนุน' },
    { value: 'บทที่ 16 ความผิดเกี่ยวกับทรัพย์ (อาญา)', label: 'บทที่ 16 ความผิดเกี่ยวกับทรัพย์ (อาญา)' },
    { value: 'บทที่ 17 ทรัพย์สินทางปัญญา', label: 'บทที่ 17 ทรัพย์สินทางปัญญา' },
    { value: 'บทที่ 18 กฎหมายคุ้มครองผู้บริโภคและ PDPA', label: 'บทที่ 18 กฎหมายคุ้มครองผู้บริโภคและ PDPA' },
    { value: 'บทที่ 19 กฎหมายแรงงาน', label: 'บทที่ 19 กฎหมายแรงงาน' },
    { value: 'บทที่ 20 กฎหมายภาษี', label: 'บทที่ 20 กฎหมายภาษี' },
    { value: 'บทที่ 21 กฎหมายทั่วไปเกี่ยวกับทะเบียนราษฎร์และสิทธิพลเมือง', label: 'บทที่ 21 กฎหมายทั่วไปเกี่ยวกับทะเบียนราษฎร์และสิทธิพลเมือง' },
    { value: 'บทที่ 22 กฎหมายเฉพาะเรื่องอื่นๆ', label: 'บทที่ 22 กฎหมายเฉพาะเรื่องอื่นๆ' }
  ],
  'คอม': [
    { value: 'ALL', label: '📚 รวมทุกหมวดคอมพิวเตอร์และสารสนเทศ' },
    { value: 'บทที่ 1 ความรู้พื้นฐานและประวัติคอมพิวเตอร์', label: 'บทที่ 1 ความรู้พื้นฐานและประวัติคอมพิวเตอร์' },
    { value: 'บทที่ 2 ข้อมูลและสารสนเทศ', label: 'บทที่ 2 ข้อมูลและสารสนเทศ' },
    { value: 'บทที่ 3 IPOS และหน่วยประมวลผล', label: 'บทที่ 3 IPOS และหน่วยประมวลผล' },
    { value: 'บทที่ 4 ซอฟต์แวร์', label: 'บทที่ 4 ซอฟต์แวร์' },
    { value: 'บทที่ 5 ชนิดข้อมูลและรหัสแทนข้อมูล', label: 'บทที่ 5 ชนิดข้อมูลและรหัสแทนข้อมูล' },
    { value: 'บทที่ 6 Procedure และผังงาน (Flowchart)', label: 'บทที่ 6 Procedure และผังงาน (Flowchart)' },
    { value: 'บทที่ 7 ระบบเครือข่ายคอมพิวเตอร์', label: 'บทที่ 7 ระบบเครือข่ายคอมพิวเตอร์' },
    { value: 'บทที่ 8 Internet', label: 'บทที่ 8 Internet' },
    { value: 'บทที่ 9 E-commerce', label: 'บทที่ 9 E-commerce' },
    { value: 'บทที่ 10 ความปลอดภัยของคอมพิวเตอร์', label: 'บทที่ 10 ความปลอดภัยของคอมพิวเตอร์' },
    { value: 'บทที่ 11 Social Media และ Cloud', label: 'บทที่ 11 Social Media และ Cloud' },
    { value: 'บทที่ 12 Microsoft Word', label: 'บทที่ 12 Microsoft Word' },
    { value: 'บทที่ 13 Microsoft Excel', label: 'บทที่ 13 Microsoft Excel' },
    { value: 'บทที่ 14 PowerPoint (คำสั่งลัด)', label: 'บทที่ 14 PowerPoint (คำสั่งลัด)' }
  ],
  'ภาษาไทย': [
    { value: 'ALL', label: '📚 รวมทุกหมวดภาษาไทย' },
    { value: 'บทที่ 1 วิเคราะห์บทความ', label: 'บทที่ 1 วิเคราะห์บทความ' },
    { value: 'บทที่ 2 โวหารการเขียน', label: 'บทที่ 2 โวหารการเขียน' },
    { value: 'บทที่ 3 โวหารภาพพจน์', label: 'บทที่ 3 โวหารภาพพจน์' },
    { value: 'บทที่ 4 ระดับภาษา', label: 'บทที่ 4 ระดับภาษา' },
    { value: 'บทที่ 5 การใช้คำตรงความหมาย', label: 'บทที่ 5 การใช้คำตรงความหมาย' },
    { value: 'บทที่ 6 สำนวน สุภาษิต', label: 'บทที่ 6 สำนวน สุภาษิต' },
    { value: 'บทที่ 7 อุดมคติ คำคม คำขวัญ คติพจน์', label: 'บทที่ 7 อุดมคติ คำคม คำขวัญ คติพจน์' },
    { value: 'บทที่ 8 สะกดคำและคำทับศัพท์', label: 'บทที่ 8 สะกดคำและคำทับศัพท์' },
    { value: 'บทที่ 9 คำราชาศัพท์', label: 'บทที่ 9 คำราชาศัพท์' },
    { value: 'บทที่ 10 การใช้ภาษาไทยในชีวิตประจำวัน', label: 'บทที่ 10 การใช้ภาษาไทยในชีวิตประจำวัน' },
    { value: 'บทที่ 11 ข้อบกพร่องทางภาษา', label: 'บทที่ 11 ข้อบกพร่องทางภาษา' },
    { value: 'บทที่ 12 คำสุภาพและคำไวพจน์', label: 'บทที่ 12 คำสุภาพและคำไวพจน์' },
    { value: 'บทที่ 13 หลักภาษาอื่นๆ 1', label: 'บทที่ 13 หลักภาษาอื่นๆ 1' },
    { value: 'บทที่ 14 หลักภาษาอื่นๆ 2', label: 'บทที่ 14 หลักภาษาอื่นๆ 2' }
  ],
  'ไทย': [
    { value: 'ALL', label: '📚 รวมทุกหมวดภาษาไทย' },
    { value: 'บทที่ 1 วิเคราะห์บทความ', label: 'บทที่ 1 วิเคราะห์บทความ' },
    { value: 'บทที่ 2 โวหารการเขียน', label: 'บทที่ 2 โวหารการเขียน' },
    { value: 'บทที่ 3 โวหารภาพพจน์', label: 'บทที่ 3 โวหารภาพพจน์' },
    { value: 'บทที่ 4 ระดับภาษา', label: 'บทที่ 4 ระดับภาษา' },
    { value: 'บทที่ 5 การใช้คำตรงความหมาย', label: 'บทที่ 5 การใช้คำตรงความหมาย' },
    { value: 'บทที่ 6 สำนวน สุภาษิต', label: 'บทที่ 6 สำนวน สุภาษิต' },
    { value: 'บทที่ 7 อุดมคติ คำคม คำขวัญ คติพจน์', label: 'บทที่ 7 อุดมคติ คำคม คำขวัญ คติพจน์' },
    { value: 'บทที่ 8 สะกดคำและคำทับศัพท์', label: 'บทที่ 8 สะกดคำและคำทับศัพท์' },
    { value: 'บทที่ 9 คำราชาศัพท์', label: 'บทที่ 9 คำราชาศัพท์' },
    { value: 'บทที่ 10 การใช้ภาษาไทยในชีวิตประจำวัน', label: 'บทที่ 10 การใช้ภาษาไทยในชีวิตประจำวัน' },
    { value: 'บทที่ 11 ข้อบกพร่องทางภาษา', label: 'บทที่ 11 ข้อบกพร่องทางภาษา' },
    { value: 'บทที่ 12 คำสุภาพและคำไวพจน์', label: 'บทที่ 12 คำสุภาพและคำไวพจน์' },
    { value: 'บทที่ 13 หลักภาษาอื่นๆ 1', label: 'บทที่ 13 หลักภาษาอื่นๆ 1' },
    { value: 'บทที่ 14 หลักภาษาอื่นๆ 2', label: 'บทที่ 14 หลักภาษาอื่นๆ 2' }
  ],
  'ภาษาอังกฤษ': [
    { value: 'ALL', label: '📚 รวมทุกหมวดภาษาอังกฤษ' },
    { value: 'บทที่ 1 Conversation', label: 'บทที่ 1 Conversation' },
    { value: 'บทที่ 2 Vocabulary', label: 'บทที่ 2 Vocabulary' },
    { value: 'บทที่ 3 Reading', label: 'บทที่ 3 Reading' },
    { value: 'บทที่ 4 Grammar 1', label: 'บทที่ 4 Grammar 1' },
    { value: 'บทที่ 5 Grammar 2', label: 'บทที่ 5 Grammar 2' },
    { value: 'บทที่ 6 Grammar 3', label: 'บทที่ 6 Grammar 3' },
    { value: 'บทที่ 7 Grammar 4', label: 'บทที่ 7 Grammar 4' },
    { value: 'บทที่ 8 Grammar 5', label: 'บทที่ 8 Grammar 5' }
  ],
  'อังกฤษ': [
    { value: 'ALL', label: '📚 รวมทุกหมวดภาษาอังกฤษ' },
    { value: 'บทที่ 1 Conversation', label: 'บทที่ 1 Conversation' },
    { value: 'บทที่ 2 Vocabulary', label: 'บทที่ 2 Vocabulary' },
    { value: 'บทที่ 3 Reading', label: 'บทที่ 3 Reading' },
    { value: 'บทที่ 4 Grammar 1', label: 'บทที่ 4 Grammar 1' },
    { value: 'บทที่ 5 Grammar 2', label: 'บทที่ 5 Grammar 2' },
    { value: 'บทที่ 6 Grammar 3', label: 'บทที่ 6 Grammar 3' },
    { value: 'บทที่ 7 Grammar 4', label: 'บทที่ 7 Grammar 4' },
    { value: 'บทที่ 8 Grammar 5', label: 'บทที่ 8 Grammar 5' }
  ]
};

function getSubjectDisplayName(subject) {
  if (subject === 'งานสารบรรณ_๒๕๒๖') return 'ระเบียบสารบรรณ (๒๕๒๖)';
  if (subject === 'สารบรรณตำรวจ_๕๔') return 'สารบรรณตำรวจ ลักษณะที่ ๕๔';
  return subject;
}

function getStoredCustomChapters(subject) {
  try {
    const raw = localStorage.getItem(`admin_custom_chapters_${subject}`);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function storeCustomChapter(subject, chapterName) {
  try {
    const list = getStoredCustomChapters(subject);
    if (!list.includes(chapterName)) {
      list.push(chapterName);
      localStorage.setItem(`admin_custom_chapters_${subject}`, JSON.stringify(list));
    }
  } catch (e) {}
}

window.toggleCustomChapterInput = function() {
  const box = document.getElementById('customChapterBox');
  const input = document.getElementById('customChapterInput');
  if (!box) return;
  const isHidden = box.style.display === 'none' || !box.style.display;
  box.style.display = isHidden ? 'block' : 'none';
  if (isHidden && input) {
    input.value = '';
    input.focus();
  }
};

window.saveNewCustomChapter = function() {
  const input = document.getElementById('customChapterInput');
  const subjectSelect = document.getElementById('examSubject');
  const chapterSelect = document.getElementById('sarabanChapterSelect');
  const subject = subjectSelect ? subjectSelect.value : 'ทั่วไป';
  const newChapter = input ? input.value.trim() : '';

  if (!newChapter) {
    alert('กรุณากรอกชื่อหมวดหมู่ใหม่ที่ต้องการสร้าง');
    return;
  }

  // Save to persistent storage
  storeCustomChapter(subject, newChapter);

  // Add to in-memory SUBJECT_CHAPTERS
  if (!SUBJECT_CHAPTERS[subject]) {
    SUBJECT_CHAPTERS[subject] = [{ value: 'ALL', label: `📚 รวมทุกหมวดในวิชา${subject}` }];
  }
  if (!SUBJECT_CHAPTERS[subject].some(ch => ch.value === newChapter)) {
    SUBJECT_CHAPTERS[subject].push({ value: newChapter, label: `✨ ${newChapter} (สร้างใหม่)` });
  }

  // Re-populate dropdown and select this new chapter
  onSubjectChange();
  if (chapterSelect) {
    chapterSelect.value = newChapter;
    onSarabanChapterChange();
  }

  // Hide custom input box
  const box = document.getElementById('customChapterBox');
  if (box) box.style.display = 'none';

  alert(`✅ บันทึกหมวดหมู่ "${newChapter}" เรียบร้อยแล้ว! หมวดนี้จะถูกจดจำไว้ในระบบสำหรับการสร้างข้อสอบทุกครั้ง`);
};

function onSubjectChange() {
  const subjectSelect = document.getElementById('examSubject');
  const subject = subjectSelect ? subjectSelect.value : 'งานสารบรรณ_๒๕๒๖';
  const chapterSelect = document.getElementById('sarabanChapterSelect');
  const chapterLabel = document.getElementById('chapterSelectLabel');
  const kbSelect = document.getElementById('knowledgeBaseSelect');

  if (chapterLabel) {
    if (subject === 'งานสารบรรณ_๒๕๒๖') {
      chapterLabel.textContent = '2. เลือกหมวดหมู่ระเบียบสารบรรณ ๒๕๒๖ (12 บท)';
    } else if (subject === 'สารบรรณตำรวจ_๕๔') {
      chapterLabel.textContent = '2. เลือกบทเรียนสารบรรณตำรวจ ลักษณะที่ ๕๔';
    } else {
      chapterLabel.textContent = `2. เลือกหมวดหมู่ / บทเรียนวิชา${subject}`;
    }
  }

  // Collect all chapters (Preset + Stored Custom + DB Subcategories)
  const presetChapters = SUBJECT_CHAPTERS[subject] || [
    { value: 'ALL', label: `📚 รวมทุกหมวดในวิชา${subject}` }
  ];
  const customList = getStoredCustomChapters(subject);
  
  // Also collect subcategories from loaded exams
  const dbSubcats = allLoadedExams
    .filter(e => e.category === subject || (subject.includes('สารบรรณ') && e.category && e.category.includes('สารบรรณ')))
    .map(e => e.subcategory)
    .filter(Boolean);

  const mergedMap = new Map();
  presetChapters.forEach(ch => mergedMap.set(ch.value, ch.label));
  
  customList.forEach(customCh => {
    if (!mergedMap.has(customCh)) {
      mergedMap.set(customCh, `✨ ${customCh} (หมวดที่คุณสร้าง)`);
    }
  });

  dbSubcats.forEach(dbCh => {
    if (!mergedMap.has(dbCh)) {
      mergedMap.set(dbCh, `📂 ${dbCh}`);
    }
  });

  if (chapterSelect) {
    chapterSelect.innerHTML = '';
    mergedMap.forEach((label, val) => {
      chapterSelect.innerHTML += `<option value="${escapeHTML(val)}">${escapeHTML(label)}</option>`;
    });
  }

  if (kbSelect) {
    kbSelect.innerHTML = '';
    if (subject === 'งานสารบรรณ_๒๕๒๖') {
      kbSelect.innerHTML = `<option value="สารบรรณ_๒๕๒๖">📖 ระเบียบสำนักนายกฯ งานสารบรรณ พ.ศ. ๒๕๒๖</option>`;
    } else if (subject === 'สารบรรณตำรวจ_๕๔') {
      kbSelect.innerHTML = `<option value="สารบรรณ_๕๔">👮 ประมวลระเบียบการตำรวจ ลักษณะที่ ๕๔</option>`;
    } else {
      kbSelect.innerHTML = `<option value="GENERAL">⚖️ คลังข้อสอบวิชา ${subject}</option>`;
    }
  }

  onSarabanChapterChange();
}

window.selectQuestionCount = function(count) {
  const input = document.getElementById('examNumQuestions');
  if (input) input.value = count;
  ['10', '20', '30', '40', '50'].forEach(c => {
    const btn = document.getElementById(`btnCount${c}`);
    if (btn) {
      if (parseInt(c) === count) {
        btn.style.borderColor = '#BD1B0B';
        btn.style.backgroundColor = '#FEF2F2';
        btn.style.color = '#BD1B0B';
      } else {
        btn.style.borderColor = '#E2E8F0';
        btn.style.backgroundColor = '#F8FAFC';
        btn.style.color = '#475569';
      }
    }
  });
};

function isSameSubjectCategory(cat1, cat2) {
  if (!cat1 || !cat2) return false;
  const c1 = String(cat1).toLowerCase().replace(/[\s_]/g, '').replace('กฏ', 'กฎ');
  const c2 = String(cat2).toLowerCase().replace(/[\s_]/g, '').replace('กฏ', 'กฎ');
  if (c1 === c2) return true;

  if ((c1.includes('๕๔') || c1.includes('54')) && (c2.includes('๕๔') || c2.includes('54'))) return true;
  if ((c1.includes('๒๕๒๖') || c1.includes('2526')) && (c2.includes('๒๕๒๖') || c2.includes('2526'))) return true;
  if (c1.includes('สารบรรณ') && c2.includes('สารบรรณ') && !c1.includes('๕๔') && !c2.includes('๕๔') && !c1.includes('54') && !c2.includes('54')) return true;

  if (c1.includes('คอม') && c2.includes('คอม')) return true;
  if (c1.includes('สารสนเทศ') && c2.includes('สารสนเทศ')) return true;
  if (c1.includes('กฎหมาย') && c2.includes('กฎหมาย')) return true;
  if (c1.includes('ไทย') && c2.includes('ไทย') && !c1.includes('๕๔') && !c2.includes('๕๔')) return true;
  if ((c1.includes('อังกฤษ') || c1.includes('english')) && (c2.includes('อังกฤษ') || c2.includes('english'))) return true;
  if (c1.includes('สังคม') && c2.includes('สังคม')) return true;
  if ((c1.includes('ทั่วไป') || c1.includes('คำนวณ')) && (c2.includes('ทั่วไป') || c2.includes('คำนวณ'))) return true;

  return false;
}

function extractSetNumberFromTitle(title) {
  if (!title) return 0;
  const thaiNumerals = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];
  let s = String(title).replace(/[๐-๙]/g, d => thaiNumerals.indexOf(d));
  const m = s.match(/ชุดที่\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
}

function onSarabanChapterChange() {
  const subjectSelect = document.getElementById('examSubject');
  const subject = subjectSelect ? subjectSelect.value : 'งานสารบรรณ_๒๕๒๖';
  const chapterSelect = document.getElementById('sarabanChapterSelect');
  const titleInput = document.getElementById('examTitle');
  const subcatInput = document.getElementById('examSubcategory');
  
  if (!chapterSelect) return;
  const val = chapterSelect.value;
  const displayName = getSubjectDisplayName(subject);

  // Calculate automatic set number (ชุดที่ 1, ชุดที่ 2...) for the same subject & category/chapter
  const matchingExistingSets = allLoadedExams.filter(ex => {
    if (!isSameSubjectCategory(ex.category, subject)) return false;

    if (val === 'ALL') {
      return !ex.subcategory || ex.subcategory.includes('รวมทุก') || ex.title.includes('รวมทุก');
    }

    const cleanVal = val.replace(/บทที่\s*[๐-๙\d]+[:\-\s]*/g, '').trim();
    if (ex.subcategory && (ex.subcategory === val || ex.subcategory.includes(cleanVal))) return true;
    if (ex.title && cleanVal && ex.title.includes(cleanVal)) return true;
    return false;
  });

  let maxSetNum = 0;
  matchingExistingSets.forEach(ex => {
    const num = extractSetNumberFromTitle(ex.title);
    if (num > maxSetNum) maxSetNum = num;
  });
  const nextSetNum = Math.max(matchingExistingSets.length + 1, maxSetNum + 1);

  if (val === 'ALL') {
    if (subcatInput) subcatInput.value = `รวมทุกหมวด ${displayName}`;
    if (titleInput) {
      titleInput.value = `แบบทดสอบ${displayName} (รวมทุกหมวด) (ชุดที่ ${nextSetNum})`;
    }
  } else {
    if (subcatInput) subcatInput.value = val;
    if (titleInput) {
      titleInput.value = `แบบทดสอบ${displayName}: ${val} (ชุดที่ ${nextSetNum})`;
    }
  }
}

function onKnowledgeBaseChange() {
  const kb = document.getElementById('knowledgeBaseSelect').value;
  const docSelect = document.getElementById('knowledgeDocSelect');

  docSelect.innerHTML = '';

  if (kb === 'ALL_SARABAN') {
    docSelect.innerHTML = '<option value="ALL">รวมทุกบท/ทุกภาคผนวกในคลังสารบรรณ</option>';
  } else if (kb === 'สารบรรณ_๒๕๒๖') {
    docSelect.innerHTML = '<option value="ALL_2526">รวมทุกหมวดในระเบียบสารบรรณ ๒๕๒๖</option>';
    const filtered = cachedKnowledgeDocs.filter(d => d.category.includes('ระเบียบสำนักนายก'));
    filtered.forEach(d => {
      docSelect.innerHTML += `<option value="${d.id}">${d.title}</option>`;
    });
  } else if (kb === 'สารบรรณ_๕๔') {
    docSelect.innerHTML = '<option value="ALL_54">รวมทุกบทในระเบียบตำรวจ ลักษณะ ๕๔</option>';
    const filtered = cachedKnowledgeDocs.filter(d => d.category.includes('ลักษณะที่ ๕๔'));
    filtered.forEach(d => {
      docSelect.innerHTML += `<option value="${d.id}">${d.title}</option>`;
    });
  } else {
    docSelect.innerHTML = '<option value="ALL">ออกครอบคลุมทุกหัวข้อในวิชานี้</option>';
  }
}

async function generateAIExamPreview() {
  const subject = document.getElementById('examSubject').value;
  const knowledgeBase = document.getElementById('knowledgeBaseSelect').value;
  const docId = document.getElementById('knowledgeDocSelect').value;
  let title = document.getElementById('examTitle').value.trim();
  const numQuestions = document.getElementById('examNumQuestions').value;
  const apiKey = document.getElementById('adminGeminiApiKey')?.value.trim() || localStorage.getItem('admin_gemini_key') || '';

  if (apiKey) {
    localStorage.setItem('admin_gemini_key', apiKey);
  }

  if (!title) {
    title = `ชุดข้อสอบ${subject} (${numQuestions} ข้อ)`;
  }

  const btn = document.getElementById('btnSubmitGenerateExam');
  const progressInfo = document.getElementById('aiProgressInfo');

  try {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    progressInfo.style.display = 'block';

    const subcategory = document.getElementById('examSubcategory')?.value.trim() || '';

    const res = await fetch(`${API_BASE}/api/admin/exams/preview-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        subject,
        knowledgeBase,
        docId,
        title,
        subcategory,
        numQuestions: parseInt(numQuestions) || 10,
        apiKey
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถออกข้อสอบได้'));
      return;
    }

    previewExamQuestions = data.questions || [];
    closeAddExamModal();
    renderExamPreviewModal(title, subject, knowledgeBase);

  } catch (err) {
    console.error('Preview AI Exam Error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.style.opacity = '1';
    progressInfo.style.display = 'none';
  }
}

function renderExamPreviewModal(title, subject, knowledgeBase) {
  document.getElementById('previewSummaryBadge').textContent = `รวม ${previewExamQuestions.length} ข้อ`;
  const container = document.getElementById('previewQuestionsContainer');
  const banner = document.getElementById('previewAiRecheckBanner');
  const titleEl = document.getElementById('previewAiRecheckTitle');
  const descEl = document.getElementById('previewAiRecheckDesc');
  container.innerHTML = '';

  let conflictCount = 0;

  previewExamQuestions.forEach((q, idx) => {
    const conflict = clientDetectConflict(q);
    if (conflict.hasConflict) conflictCount++;

    const card = document.createElement('div');
    card.className = 'stat-card';
    card.style.cssText = conflict.hasConflict
      ? 'padding: 16px; border: 1.5px solid #F87171; border-radius: 14px; background: #FFF5F5; text-align: left; position: relative;'
      : 'padding: 16px; border: 1px solid #E2E8F0; border-radius: 12px; background: #F8FAFC; text-align: left;';

    const conflictHTML = conflict.hasConflict ? `
      <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 7px 10px; margin-bottom: 10px; font-size: 12px; color: #991B1B; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
        <span style="font-weight: 700;">⚠️ ${escapeHTML(conflict.reason)}</span>
        <button type="button" onclick="previewQuickFixChoice(${idx}, '${conflict.detectedOptionLetter}')" style="background: #DC2626; color: white; border: none; padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 11px; cursor: pointer;">
          สลับเป็นข้อ ${conflict.detectedAnswerLabel} ทันที
        </button>
      </div>
    ` : '';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-weight: 800; color: #BD1B0B; font-size: 14px;">ข้อที่ ${idx + 1}</span>
          ${conflict.hasConflict ? '<span style="background: #FEE2E2; color: #DC2626; font-size: 10.5px; font-weight: 800; padding: 1px 6px; border-radius: 6px;">เฉลยขัดแย้ง</span>' : ''}
        </div>
        <button type="button" onclick="removePreviewQuestion(${idx})" style="background: none; border: none; color: #EF4444; font-size: 12px; font-weight: 600; cursor: pointer;">🗑️ ลบข้อนี้</button>
      </div>

      ${conflictHTML}

      <div class="form-group" style="margin-bottom: 10px;">
        <label style="font-size: 12px; font-weight: 700;">คำถาม</label>
        <textarea id="q_text_${idx}" class="form-input" rows="2" style="font-size: 13px;">${escapeHTML(q.questionText)}</textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
        <div>
          <label style="font-size: 11px; font-weight: 600;">ตัวเลือก ก (Option A)</label>
          <input type="text" id="q_a_${idx}" class="form-input" value="${escapeHTML(q.optionA)}" style="font-size: 12px;">
        </div>
        <div>
          <label style="font-size: 11px; font-weight: 600;">ตัวเลือก ข (Option B)</label>
          <input type="text" id="q_b_${idx}" class="form-input" value="${escapeHTML(q.optionB)}" style="font-size: 12px;">
        </div>
        <div>
          <label style="font-size: 11px; font-weight: 600;">ตัวเลือก ค (Option C)</label>
          <input type="text" id="q_c_${idx}" class="form-input" value="${escapeHTML(q.optionC)}" style="font-size: 12px;">
        </div>
        <div>
          <label style="font-size: 11px; font-weight: 600;">ตัวเลือก ง (Option D)</label>
          <input type="text" id="q_d_${idx}" class="form-input" value="${escapeHTML(q.optionD)}" style="font-size: 12px;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
        <div>
          <label style="font-size: 11px; color: #10B981; font-weight: 800;">ข้อที่ถูกต้อง (Correct Option)</label>
          <select id="q_correct_${idx}" class="form-input" style="font-size: 12px; font-weight: 700; color: #10B981;">
            <option value="A" ${q.correctOption === 'A' ? 'selected' : ''}>ก (A)</option>
            <option value="B" ${q.correctOption === 'B' ? 'selected' : ''}>ข (B)</option>
            <option value="C" ${q.correctOption === 'C' ? 'selected' : ''}>ค (C)</option>
            <option value="D" ${q.correctOption === 'D' ? 'selected' : ''}>ง (D)</option>
          </select>
        </div>
        <div>
          <label style="font-size: 11px; font-weight: 700;">คำอธิบายเฉลย</label>
          <textarea id="q_exp_${idx}" class="form-input" rows="1" style="font-size: 12px;">${escapeHTML(q.explanation || '')}</textarea>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  if (conflictCount > 0 && banner) {
    banner.style.display = 'flex';
    banner.style.background = '#FEF2F2';
    banner.style.borderColor = '#FECACA';
    if (titleEl) titleEl.textContent = `⚠️ ตรวจพบเฉลยขัดแย้งกับคำอธิบาย ${conflictCount} ข้อ!`;
    if (descEl) descEl.textContent = `คำอธิบายเฉลยระบุข้อหนึ่งแต่ระบบเลือกอีกข้อ กดปุ่มด้านขวาเพื่อสลับเฉลยให้ถูกต้องออโต้ทันที`;
  }

  document.getElementById('examPreviewModal').style.display = 'flex';
}

window.previewQuickFixChoice = function(idx, correctLetter) {
  if (previewExamQuestions[idx]) {
    previewExamQuestions[idx].correctOption = correctLetter;
    const selectEl = document.getElementById(`q_correct_${idx}`);
    if (selectEl) selectEl.value = correctLetter;
    const title = document.getElementById('examTitle') ? document.getElementById('examTitle').value : '';
    const subject = document.getElementById('examSubject') ? document.getElementById('examSubject').value : '';
    const knowledgeBase = document.getElementById('knowledgeBaseSelect') ? document.getElementById('knowledgeBaseSelect').value : '';
    renderExamPreviewModal(title, subject, knowledgeBase);
  }
};

function removePreviewQuestion(index) {
  previewExamQuestions.splice(index, 1);
  const title = document.getElementById('examTitle').value;
  const subject = document.getElementById('examSubject').value;
  const knowledgeBase = document.getElementById('knowledgeBaseSelect').value;
  renderExamPreviewModal(title, subject, knowledgeBase);
}

function addCustomQuestionToPreview() {
  previewExamQuestions.push({
    questionText: 'คำถามข้อสอบใหม่ที่เพิ่มเอง...',
    optionA: 'ตัวเลือก ก',
    optionB: 'ตัวเลือก ข',
    optionC: 'ตัวเลือก ค',
    optionD: 'ตัวเลือก ง',
    correctOption: 'A',
    explanation: 'คำอธิบายเฉลยข้อสอบ...'
  });
  const title = document.getElementById('examTitle').value;
  const subject = document.getElementById('examSubject').value;
  const knowledgeBase = document.getElementById('knowledgeBaseSelect').value;
  renderExamPreviewModal(title, subject, knowledgeBase);
}

async function saveVerifiedExamSet(status) {
  previewExamQuestions.forEach((q, idx) => {
    const textEl = document.getElementById(`q_text_${idx}`);
    const aEl = document.getElementById(`q_a_${idx}`);
    const bEl = document.getElementById(`q_b_${idx}`);
    const cEl = document.getElementById(`q_c_${idx}`);
    const dEl = document.getElementById(`q_d_${idx}`);
    const corrEl = document.getElementById(`q_correct_${idx}`);
    const expEl = document.getElementById(`q_exp_${idx}`);

    if (textEl) q.questionText = textEl.value;
    if (aEl) q.optionA = aEl.value;
    if (bEl) q.optionB = bEl.value;
    if (cEl) q.optionC = cEl.value;
    if (dEl) q.optionD = dEl.value;
    if (corrEl) q.correctOption = corrEl.value;
    if (expEl) q.explanation = expEl.value;
  });

  const title = document.getElementById('examTitle').value.trim() || 'ชุดข้อสอบใหม่';
  const category = document.getElementById('examSubject').value;
  const customSubcategory = document.getElementById('examSubcategory')?.value.trim();
  const subcategory = customSubcategory || document.getElementById('knowledgeBaseSelect').value;

  try {
    const res = await fetch(`${API_BASE}/api/admin/exams/save-set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title,
        category,
        subcategory,
        status,
        questions: previewExamQuestions
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + (data.error || 'ไม่สามารถบันทึกชุดข้อสอบได้'));
      return;
    }

    alert(`🎉 ${data.message}`);
    document.getElementById('examPreviewModal').style.display = 'none';
    loadExams();

  } catch (err) {
    console.error('Save exam set error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  }
}

// ==========================================
// CSV Utilities and Processing
// ==========================================
let parsedCsvQuestions = [];
let appendParsedCsvQuestions = [];

function parseCSV(text) {
  if (!text) return [];
  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  const lines = [];
  let row = [''];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    
    if (ch === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      row.push('');
    } else if ((ch === '\r' || ch === '\n') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
        lines.push(row.map(cell => cell.trim()));
      }
      row = [''];
    } else {
      row[row.length - 1] += ch;
    }
  }
  if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
    lines.push(row.map(cell => cell.trim()));
  }
  return lines;
}

function normalizeCorrectAnswer(val) {
  if (val === undefined || val === null) return 1;
  const clean = String(val).trim().toUpperCase();
  if (clean === '2' || clean === 'B' || clean === 'ข' || clean.includes('2') || clean.includes('ข')) return 2;
  if (clean === '3' || clean === 'C' || clean === 'ค' || clean.includes('3') || clean.includes('ค')) return 3;
  if (clean === '4' || clean === 'D' || clean === 'ง' || clean.includes('4') || clean.includes('ง')) return 4;
  return 1;
}

function processParsedCSVQuestions(rows) {
  if (!rows || rows.length === 0) return [];
  
  let headerRowIndex = -1;
  let qIdx = -1, c1Idx = -1, c2Idx = -1, c3Idx = -1, c4Idx = -1, ansIdx = -1, expIdx = -1;

  // Check first few rows for header keywords
  for (let r = 0; r < Math.min(3, rows.length); r++) {
    const row = rows[r].map(c => (c || '').toLowerCase().trim());
    let foundKeywords = 0;
    
    row.forEach((cell, idx) => {
      if (cell.includes('โจทย์') || cell.includes('คำถาม') || cell.includes('question') || cell.includes('ข้อสอบ') || cell === 'ข้อ') {
        qIdx = idx; foundKeywords++;
      } else if (cell.includes('ตัวเลือก ก') || cell.includes('ตัวเลือก 1') || cell === 'ก' || cell === 'ข้อ1' || cell.includes('choice1') || cell.includes('optiona')) {
        c1Idx = idx; foundKeywords++;
      } else if (cell.includes('ตัวเลือก ข') || cell.includes('ตัวเลือก 2') || cell === 'ข' || cell === 'ข้อ2' || cell.includes('choice2') || cell.includes('optionb')) {
        c2Idx = idx; foundKeywords++;
      } else if (cell.includes('ตัวเลือก ค') || cell.includes('ตัวเลือก 3') || cell === 'ค' || cell === 'ข้อ3' || cell.includes('choice3') || cell.includes('optionc')) {
        c3Idx = idx; foundKeywords++;
      } else if (cell.includes('ตัวเลือก ง') || cell.includes('ตัวเลือก 4') || cell === 'ง' || cell === 'ข้อ4' || cell.includes('choice4') || cell.includes('optiond')) {
        c4Idx = idx; foundKeywords++;
      } else if (cell.includes('เฉลย') || cell.includes('คำตอบ') || cell.includes('answer') || cell.includes('correct')) {
        ansIdx = idx; foundKeywords++;
      } else if (cell.includes('คำอธิบาย') || cell.includes('เหตุผล') || cell.includes('explanation') || cell.includes('reason')) {
        expIdx = idx; foundKeywords++;
      }
    });

    if (foundKeywords >= 3) {
      headerRowIndex = r;
      break;
    }
  }

  // Fallback to positional columns if headers not clearly identified
  if (headerRowIndex === -1) {
    qIdx = 0; c1Idx = 1; c2Idx = 2; c3Idx = 3; c4Idx = 4; ansIdx = 5; expIdx = 6;
  }

  const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;
  const questions = [];

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const questionText = (qIdx !== -1 && row[qIdx]) ? row[qIdx].trim() : (row[0] || '').trim();
    if (!questionText) continue;

    const choice1 = (c1Idx !== -1 && row[c1Idx]) ? row[c1Idx].trim() : (row[1] || '').trim();
    const choice2 = (c2Idx !== -1 && row[c2Idx]) ? row[c2Idx].trim() : (row[2] || '').trim();
    const choice3 = (c3Idx !== -1 && row[c3Idx]) ? row[c3Idx].trim() : (row[3] || '').trim();
    const choice4 = (c4Idx !== -1 && row[c4Idx]) ? row[c4Idx].trim() : (row[4] || '').trim();
    const rawAnswer = (ansIdx !== -1 && row[ansIdx]) ? row[ansIdx].trim() : (row[5] || '1').trim();
    const explanation = (expIdx !== -1 && row[expIdx]) ? row[expIdx].trim() : (row[6] || '').trim();

    if (choice1 || choice2) {
      questions.push({
        questionText,
        choice1: choice1 || 'ตัวเลือก ก',
        choice2: choice2 || 'ตัวเลือก ข',
        choice3: choice3 || 'ตัวเลือก ค',
        choice4: choice4 || 'ตัวเลือก ง',
        correctAnswer: normalizeCorrectAnswer(rawAnswer),
        explanation: explanation || ''
      });
    }
  }

  return questions;
}

window.downloadSampleExamCsv = function() {
  const sampleData = [
    ['โจทย์', 'ตัวเลือก ก', 'ตัวเลือก ข', 'ตัวเลือก ค', 'ตัวเลือก ง', 'เฉลย', 'คำอธิบาย'],
    [
      'ข้อใดคือหนังสือราชการภายนอก?',
      'หนังสือติดต่อระหว่างส่วนราชการด้วยกัน หรือส่วนราชการมีถึงหน่วยงานอื่น',
      'หนังสือติดต่อภายในกระทรวง ทบวง กรม เดียวกัน',
      'หนังสือที่หัวหน้าส่วนราชการสั่งการ',
      'หนังสือที่เจ้าหน้าที่ทำขึ้นเป็นหลักฐาน',
      '1',
      'หนังสือภายนอก คือ หนังสือติดต่อราชการที่เป็นแบบพิธี โดยใช้กระดาษตราครุฑ เป็นหนังสือติดต่อระหว่างส่วนราชการ หรือส่วนราชการมีถึงบุคคลภายนอก'
    ],
    [
      'ตราครุฑสำหรับแบบพิมพ์หนังสือราชการ ตามระเบียบสำนักนายกรัฐมนตรีฯ มีกี่ขนาด?',
      '1 ขนาด',
      '2 ขนาด (3 ซม. และ 1.5 ซม.)',
      '3 ขนาด',
      '4 ขนาด',
      '2',
      'ตามระเบียบสารบรรณ พ.ศ. ๒๕๒๖ ตราครุฑมี 2 ขนาด คือ ขนาดตัวครุฑสูง 3 เซนติเมตร และขนาดตัวครุฑสูง 1.5 เซนติเมตร'
    ],
    [
      'บันทึกข้อความ ให้ใช้ตราครุฑขนาดเท่าใด และอยู่ที่ตำแหน่งใด?',
      'ขนาดสูง 3 ซม. กลางหน้ากระดาษ',
      'ขนาดสูง 1.5 ซม. ที่มุมบนด้านซ้าย',
      'ขนาดสูง 1.5 ซม. ที่มุมบนด้านขวา',
      'ไม่ต้องมีตราครุฑ',
      '2',
      'หนังสือภายใน (บันทึกข้อความ) ให้ใช้กระดาษบันทึกข้อความ มีตราครุฑขนาดสูง 1.5 เซนติเมตร ที่มุมบนด้านซ้าย'
    ]
  ];

  const csvRows = sampleData.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  );
  const csvContent = csvRows.join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'police_exam_sample_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ==========================================
// CSV Exam Set Import Modal Logic
// ==========================================
window.openCsvExamModal = function() {
  parsedCsvQuestions = [];
  const modal = document.getElementById('csvExamImportModal');
  if (!modal) return;

  const subSelect = document.getElementById('csvExamSubject');
  if (subSelect) subSelect.value = 'งานสารบรรณ';
  
  onCsvSubjectChange();
  clearCsvPreview();

  modal.style.display = 'flex';
};

window.closeCsvExamModal = function() {
  const modal = document.getElementById('csvExamImportModal');
  if (modal) modal.style.display = 'none';
};

window.onCsvSubjectChange = function() {
  const subSelect = document.getElementById('csvExamSubject');
  const chSelect = document.getElementById('csvExamChapter');
  if (!subSelect || !chSelect) return;

  const subject = subSelect.value;
  chSelect.innerHTML = '<option value="รวมทุกบท">📚 รวมทุกบท</option>';

  const chapters = SUBJECT_CHAPTERS[subject] || [];
  chapters.forEach(ch => {
    if (ch.value !== 'ALL') {
      chSelect.innerHTML += `<option value="${ch.value}">${ch.label}</option>`;
    }
  });

  autoSuggestCsvExamTitle();
};

window.onCsvChapterChange = function() {
  autoSuggestCsvExamTitle();
};

function autoSuggestCsvExamTitle() {
  const titleInput = document.getElementById('csvExamTitle');
  const subSelect = document.getElementById('csvExamSubject');
  const chSelect = document.getElementById('csvExamChapter');
  if (!titleInput || !subSelect) return;

  const subject = subSelect.options[subSelect.selectedIndex]?.text || subSelect.value;
  const chapter = chSelect ? chSelect.value : 'รวมทุกบท';
  const cleanSubject = subject.replace(/^[^\wก-๙]+/, '').trim();

  const existingSetsCount = allLoadedExams.filter(e => e.category === subSelect.value || (e.category && e.category.includes(subSelect.value))).length;
  const setNum = existingSetsCount + 1;

  titleInput.value = `แบบทดสอบ${cleanSubject}: ${chapter} (ชุดที่ ${setNum})`;
}

window.handleCsvFileSelected = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  readFileForCsvExam(file);
};

window.handleCsvDragOver = function(event) {
  event.preventDefault();
  event.stopPropagation();
  const zone = document.getElementById('csvDropZone');
  if (zone) zone.style.borderColor = '#0284C7';
};

window.handleCsvDragLeave = function(event) {
  event.preventDefault();
  event.stopPropagation();
  const zone = document.getElementById('csvDropZone');
  if (zone) zone.style.borderColor = '#94A3B8';
};

window.handleCsvDrop = function(event) {
  event.preventDefault();
  event.stopPropagation();
  const zone = document.getElementById('csvDropZone');
  if (zone) zone.style.borderColor = '#94A3B8';

  const file = event.dataTransfer.files && event.dataTransfer.files[0];
  if (file) {
    readFileForCsvExam(file);
  }
};

function readFileForCsvExam(file) {
  const statusMsg = document.getElementById('csvImportStatusMsg');
  if (statusMsg) statusMsg.textContent = `กำลังอ่านไฟล์: ${file.name}...`;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const rows = parseCSV(text);
    parsedCsvQuestions = processParsedCSVQuestions(rows);
    renderCsvPreview();
  };
  reader.onerror = function() {
    alert('ไม่สามารถอ่านไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
  };
  reader.readAsText(file, 'utf-8');
}

function renderCsvPreview() {
  const container = document.getElementById('csvQuestionsPreviewContainer');
  const badge = document.getElementById('csvParsedCountBadge');
  const list = document.getElementById('csvQuestionsList');
  const saveBtn = document.getElementById('btnSaveCsvExamSet');
  const statusMsg = document.getElementById('csvImportStatusMsg');

  if (!container || !list) return;

  if (parsedCsvQuestions.length === 0) {
    container.style.display = 'none';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.style.cursor = 'not-allowed';
      saveBtn.style.opacity = '0.6';
      saveBtn.innerHTML = `<span>💾 บันทึกชุดข้อสอบ (0 ข้อ)</span>`;
    }
    if (statusMsg) statusMsg.textContent = 'ไม่พบข้อสอบในไฟล์ กรุณาตรวจสอบหัวตารางและเนื้อหาตามตัวอย่าง';
    return;
  }

  container.style.display = 'block';
  if (badge) badge.textContent = `${parsedCsvQuestions.length} ข้อ`;
  if (statusMsg) statusMsg.textContent = `ตรวจพบ ${parsedCsvQuestions.length} ข้อ พร้อมบันทึกเข้าสู่ระบบ`;

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.opacity = '1';
    saveBtn.innerHTML = `<span>💾 บันทึกชุดข้อสอบ (${parsedCsvQuestions.length} ข้อ)</span>`;
  }

  list.innerHTML = '';
  parsedCsvQuestions.forEach((q, idx) => {
    const card = document.createElement('div');
    card.style.cssText = 'background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 14px;';
    
    const choiceLabels = ['ก', 'ข', 'ค', 'ง'];
    const choices = [q.choice1, q.choice2, q.choice3, q.choice4];

    let choicesHtml = choices.map((c, cIdx) => {
      const isCorrect = (q.correctAnswer === cIdx + 1);
      const border = isCorrect ? 'border: 1.5px solid #10B981; background: #ECFDF5;' : 'border: 1px solid #E2E8F0; background: white;';
      const mark = isCorrect ? '<span style="color: #059669; font-weight: 800; margin-left: auto;">✓ ข้อที่ถูก</span>' : '';
      return `
        <div style="display: flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 8px; ${border} font-size: 12.5px;">
          <b style="color: ${isCorrect ? '#059669' : '#475569'};">${choiceLabels[cIdx]}.</b>
          <span style="color: #1E293B;">${escapeHtml(c)}</span>
          ${mark}
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div style="font-size: 13.5px; font-weight: 800; color: #0F172A; display: flex; gap: 8px;">
          <span style="color: #0284C7;">ข้อ ${idx + 1}.</span>
          <span>${escapeHtml(q.questionText)}</span>
        </div>
        <button type="button" onclick="removeCsvQuestionRow(${idx})" style="background: none; border: none; color: #EF4444; font-size: 13px; cursor: pointer; padding: 2px 6px;">✕ ลบ</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
        ${choicesHtml}
      </div>
      ${q.explanation ? `
        <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 6px 10px; font-size: 12px; color: #92400E;">
          💡 <b>คำอธิบายเฉลย:</b> ${escapeHtml(q.explanation)}
        </div>
      ` : ''}
    `;
    list.appendChild(card);
  });
}

window.removeCsvQuestionRow = function(idx) {
  parsedCsvQuestions.splice(idx, 1);
  renderCsvPreview();
};

window.clearCsvPreview = function() {
  parsedCsvQuestions = [];
  const fileInput = document.getElementById('csvFileInput');
  if (fileInput) fileInput.value = '';
  renderCsvPreview();
};

window.saveCsvExamSet = async function() {
  if (!parsedCsvQuestions || parsedCsvQuestions.length === 0) {
    alert('กรุณาเลือกไฟล์ CSV ที่มีข้อสอบอย่างน้อย 1 ข้อ');
    return;
  }

  const title = (document.getElementById('csvExamTitle')?.value || '').trim() || 'ชุดข้อสอบนำเข้าจาก CSV';
  const category = document.getElementById('csvExamSubject')?.value || 'งานสารบรรณ';
  const subcategory = document.getElementById('csvExamChapter')?.value || null;
  const status = document.getElementById('csvExamStatus')?.value || 'PUBLISHED';
  const saveBtn = document.getElementById('btnSaveCsvExamSet');

  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span>⏳ กำลังบันทึกข้อสอบ...</span>`;
    }

    const res = await fetch(`${API_BASE}/api/admin/exams/save-set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title,
        category,
        subcategory,
        status,
        questions: parsedCsvQuestions
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + (data.error || 'ไม่สามารถบันทึกได้'));
      return;
    }

    alert(`🎉 ${data.message || 'บันทึกชุดข้อสอบสำเร็จเรียบร้อย!'}`);
    closeCsvExamModal();
    loadExams();

  } catch (err) {
    console.error('Save CSV Exam error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>💾 บันทึกชุดข้อสอบ (${parsedCsvQuestions.length} ข้อ)</span>`;
    }
  }
};

// ==========================================
// Append Questions Modal (AI vs CSV)
// ==========================================
window.switchAppendTab = function(tab) {
  const aiContent = document.getElementById('appendAiTabContent');
  const csvContent = document.getElementById('appendCsvTabContent');
  const btnAi = document.getElementById('btnTabAppendAi');
  const btnCsv = document.getElementById('btnTabAppendCsv');

  if (tab === 'csv') {
    if (aiContent) aiContent.style.display = 'none';
    if (csvContent) csvContent.style.display = 'block';
    if (btnAi) {
      btnAi.style.background = 'transparent';
      btnAi.style.color = '#64748B';
      btnAi.style.boxShadow = 'none';
    }
    if (btnCsv) {
      btnCsv.style.background = 'white';
      btnCsv.style.color = '#0F172A';
      btnCsv.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }
  } else {
    if (aiContent) aiContent.style.display = 'block';
    if (csvContent) csvContent.style.display = 'none';
    if (btnAi) {
      btnAi.style.background = 'white';
      btnAi.style.color = '#0F172A';
      btnAi.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }
    if (btnCsv) {
      btnCsv.style.background = 'transparent';
      btnCsv.style.color = '#64748B';
      btnCsv.style.boxShadow = 'none';
    }
  }
};

function openAppendModal(examId, title, currentCount) {
  appendTargetExamId = examId;
  appendTargetCurrentCount = currentCount;
  appendParsedCsvQuestions = [];

  const labelEl = document.getElementById('appendExamTitleLabel');
  if (labelEl) {
    labelEl.textContent = `"${title}" (ชุดเดิมมีอยู่แล้ว ${currentCount} ข้อ)`;
  }
  
  const countInput = document.getElementById('appendCount');
  if (countInput) countInput.value = '10';

  const pInfo = document.getElementById('appendProgressInfo');
  if (pInfo) pInfo.style.display = 'none';

  const btnAi = document.getElementById('btnSubmitAppend');
  if (btnAi) btnAi.disabled = false;

  const btnCsv = document.getElementById('btnSubmitAppendCsv');
  if (btnCsv) {
    btnCsv.disabled = true;
    btnCsv.style.opacity = '0.6';
    btnCsv.style.cursor = 'not-allowed';
    btnCsv.textContent = '➕ นำเข้าเพิ่มเข้าไปในชุดเดิม';
  }

  const pBox = document.getElementById('appendCsvPreviewBox');
  if (pBox) pBox.style.display = 'none';

  const fileInput = document.getElementById('appendCsvFileInput');
  if (fileInput) fileInput.value = '';

  switchAppendTab('ai');
  document.getElementById('appendQuestionsModal').style.display = 'flex';
}

function closeAppendModal() {
  const modal = document.getElementById('appendQuestionsModal');
  if (modal) modal.style.display = 'none';
}

window.handleAppendCsvFileSelected = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const rows = parseCSV(text);
    appendParsedCsvQuestions = processParsedCSVQuestions(rows);

    const pBox = document.getElementById('appendCsvPreviewBox');
    const summaryEl = document.getElementById('appendCsvPreviewSummary');
    const rangeEl = document.getElementById('appendCsvOrderRangeText');
    const btnSubmit = document.getElementById('btnSubmitAppendCsv');

    if (appendParsedCsvQuestions.length === 0) {
      if (pBox) pBox.style.display = 'none';
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = '0.6';
        btnSubmit.style.cursor = 'not-allowed';
      }
      alert('ไม่พบข้อสอบในไฟล์ CSV กรุณาตรวจสอบหัวตารางและข้อมูล');
      return;
    }

    if (pBox) pBox.style.display = 'block';
    if (summaryEl) summaryEl.textContent = `ตรวจพบ ${appendParsedCsvQuestions.length} ข้อ พร้อมนำเข้า`;
    if (rangeEl) {
      const startNo = appendTargetCurrentCount + 1;
      const endNo = appendTargetCurrentCount + appendParsedCsvQuestions.length;
      rangeEl.textContent = `ข้อสอบใหม่จะถูกเพิ่มเป็นข้อที่ ${startNo} ถึงข้อที่ ${endNo} ของชุดนี้`;
    }
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.style.opacity = '1';
      btnSubmit.style.cursor = 'pointer';
      btnSubmit.textContent = `➕ นำเข้าเพิ่ม ${appendParsedCsvQuestions.length} ข้อเข้าไปในชุดเดิม`;
    }
  };
  reader.readAsText(file, 'utf-8');
};

window.submitAppendCsvQuestions = async function() {
  if (!appendParsedCsvQuestions || appendParsedCsvQuestions.length === 0) {
    alert('กรุณาเลือกไฟล์ CSV ที่มีข้อสอบ');
    return;
  }

  const btn = document.getElementById('btnSubmitAppendCsv');
  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ กำลังบันทึกข้อสอบ...';
    }

    const res = await fetch(`${API_BASE}/api/admin/exams/${appendTargetExamId}/append-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ questions: appendParsedCsvQuestions })
    });

    const data = await res.json();
    if (!res.ok) {
      alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถเพิ่มข้อสอบได้'));
      return;
    }

    alert(`🎉 ${data.message || 'เพิ่มข้อสอบลงในชุดเดิมสำเร็จ!'}`);
    closeAppendModal();
    loadExams();

  } catch (err) {
    console.error('Append CSV error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '➕ นำเข้าเพิ่มเข้าไปในชุดเดิม';
    }
  }
};

async function submitAppendQuestions() {
  const numQuestions = parseInt(document.getElementById('appendCount').value) || 10;
  const btn = document.getElementById('btnSubmitAppend');
  const progressInfo = document.getElementById('appendProgressInfo');

  try {
    btn.disabled = true;
    progressInfo.style.display = 'block';

    const res = await fetch(`${API_BASE}/api/admin/exams/${appendTargetExamId}/append-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ numQuestions })
    });

    const data = await res.json();
    if (!res.ok) {
      alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถเพิ่มข้อสอบได้'));
      return;
    }

    alert(`🎉 ${data.message}`);
    closeAppendModal();
    loadExams();

  } catch (err) {
    console.error('Append questions error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  } finally {
    btn.disabled = false;
    progressInfo.style.display = 'none';
  }
}

async function generateAIExamSet() {
  const title = document.getElementById('examTitle').value.trim();
  const category = document.getElementById('examCategory').value;
  const knowledgeCategory = document.getElementById('knowledgeCategory').value;
  const numQuestions = document.getElementById('examNumQuestions').value;
  const status = document.getElementById('examStatus').value;

  const btn = document.getElementById('btnSubmitGenerateExam');
  const progressInfo = document.getElementById('aiProgressInfo');

  try {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    progressInfo.style.display = 'block';

    const res = await fetch(`${API_BASE}/api/admin/exams/generate-ai-set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title,
        category,
        knowledgeCategory,
        numQuestions: parseInt(numQuestions) || 5,
        status
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถสร้างข้อสอบได้'));
      return;
    }

    alert(`🎉 ${data.message}`);
    closeAddExamModal();
    loadExams();

  } catch (err) {
    console.error('Generate AI Exam Set JS error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.style.opacity = '1';
    progressInfo.style.display = 'none';
  }
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


// ==========================================
// KNOWLEDGE BASE (AI GENERATOR)
// ==========================================

async function loadKnowledgeDocs() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/knowledge`, {
      headers: { 'Authorization': `Bearer ${adminAuthToken}` }
    });
    if (!res.ok) throw new Error('Failed to fetch knowledge docs');
    const docs = await res.json();
    
    const tbody = document.getElementById('knowledgeTableBody');
    if (!tbody) return;
    
    let html = '';
    docs.forEach(d => {
      const dateStr = new Date(d.createdAt).toLocaleString('th-TH');
      html += `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 12px;">${d.id}</td>
          <td style="padding: 12px; font-weight: 500;">${d.title}</td>
          <td style="padding: 12px;">${d.category}</td>
          <td style="padding: 12px;">${dateStr}</td>
          <td style="padding: 12px; display: flex; gap: 8px;">
            <button onclick="openAiGenerateModal(${d.id}, '${d.title}')" style="background: #8B5CF6; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer;">✨ ให้ AI ออกข้อสอบ</button>
            <button onclick="deleteKnowledgeDoc(${d.id})" style="background: #EF4444; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer;">ลบ</button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html || '<tr><td colspan="5" style="text-align:center; padding: 20px;">ยังไม่มีข้อมูลคลังความรู้</td></tr>';
  } catch (err) {
    console.error(err);
  }
}

window.openAddKnowledgeModal = function() {
  document.getElementById('txtKnowledgeTitle').value = '';
  document.getElementById('txtKnowledgeCategory').value = '';
  document.getElementById('txtKnowledgeContent').value = '';
  document.getElementById('addKnowledgeModal').style.display = 'flex';
};

window.submitKnowledge = async function() {
  const title = document.getElementById('txtKnowledgeTitle').value.trim();
  const category = document.getElementById('txtKnowledgeCategory').value.trim();
  const content = document.getElementById('txtKnowledgeContent').value.trim();
  
  if (!title || !content) return alert('กรุณากรอกชื่อและเนื้อหาเอกสาร');
  
  try {
    const res = await fetch(`${API_BASE}/api/admin/knowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminAuthToken}`
      },
      body: JSON.stringify({ title, category, content })
    });
    
    if (res.ok) {
      document.getElementById('addKnowledgeModal').style.display = 'none';
      loadKnowledgeDocs();
    } else {
      alert('Failed to save document');
    }
  } catch (err) {
    alert(err.message);
  }
};

window.deleteKnowledgeDoc = async function(id) {
  if (!confirm('ยืนยันการลบเอกสารนี้?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/admin/knowledge/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminAuthToken}` }
    });
    if (res.ok) loadKnowledgeDocs();
  } catch (err) {
    alert(err.message);
  }
};

window.openAiGenerateModal = function(id, title) {
  document.getElementById('hdnGenerateDocId').value = id;
  document.getElementById('txtGenerateTitle').value = `แบบทดสอบ: ${title}`;
  document.getElementById('numGenerateCount').value = 10;
  document.getElementById('generateAiExamModal').style.display = 'flex';
};

window.submitAiGenerate = async function() {
  const id = document.getElementById('hdnGenerateDocId').value;
  const examTitle = document.getElementById('txtGenerateTitle').value;
  const questionCount = parseInt(document.getElementById('numGenerateCount').value);
  
  const btnSubmit = document.getElementById('btnSubmitGenerate');
  const btnCancel = document.getElementById('btnCancelGenerate');
  
  btnSubmit.disabled = true;
  btnCancel.disabled = true;
  btnSubmit.textContent = '⏳ กำลังให้ AI ประมวลผลและสร้างข้อสอบ... (อาจใช้เวลา 10-30 วินาที)';
  
  try {
    const res = await fetch(`${API_BASE}/api/admin/knowledge/${id}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminAuthToken}`
      },
      body: JSON.stringify({ examTitle, questionCount })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate');
    
    alert(`✨ สร้างข้อสอบสำเร็จแล้ว! จำนวน ${data.count} ข้อ ไปดูได้ที่แท็บ 'จัดการข้อสอบ'`);
    document.getElementById('generateAiExamModal').style.display = 'none';
    loadExamsList(); // refresh exams list
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btnSubmit.disabled = false;
    btnCancel.disabled = false;
    btnSubmit.textContent = '✨ สร้างข้อสอบด้วย AI';
  }
};

// Mobile Sidebar Toggle
window.addEventListener('DOMContentLoaded', () => {
  const adminMobileMenuToggle = document.getElementById('adminMobileMenuToggle');
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (adminMobileMenuToggle && sidebar && sidebarOverlay) {
    adminMobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });

    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      item.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
      });
    });
  }
});

// =========================================================
// BATCH AI EXAM GENERATOR (สร้างยกชุดทุกหมวดพร้อมหลบ Rate Limit)
// =========================================================
let batchState = {
  isRunning: false,
  isPaused: false,
  shouldStop: false,
  subject: '',
  chapters: [],
  questionsPerChapter: 10,
  delayMs: 3500,
  currentIndex: 0,
  successCount: 0,
  failCount: 0
};

window.switchGenMode = function(mode) {
  const tabSingle = document.getElementById('tabGenSingle');
  const tabBatch = document.getElementById('tabGenBatch');
  const singleForm = document.getElementById('addExamForm');
  const batchSection = document.getElementById('batchGenSection');

  if (mode === 'batch') {
    if (tabSingle) {
      tabSingle.style.background = 'transparent';
      tabSingle.style.color = '#64748B';
      tabSingle.style.boxShadow = 'none';
    }
    if (tabBatch) {
      tabBatch.style.background = 'white';
      tabBatch.style.color = '#0F172A';
      tabBatch.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
    }
    if (singleForm) singleForm.style.display = 'none';
    if (batchSection) batchSection.style.display = 'block';
    onBatchSubjectChange();
  } else {
    if (tabSingle) {
      tabSingle.style.background = 'white';
      tabSingle.style.color = '#0F172A';
      tabSingle.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
    }
    if (tabBatch) {
      tabBatch.style.background = 'transparent';
      tabBatch.style.color = '#64748B';
      tabBatch.style.boxShadow = 'none';
    }
    if (singleForm) singleForm.style.display = 'block';
    if (batchSection) batchSection.style.display = 'none';
  }
};

window.onBatchSubjectChange = function() {
  const select = document.getElementById('batchSubjectSelect');
  const subject = select ? select.value : 'กฏหมาย';
  const container = document.getElementById('batchChaptersChecklist');
  const countText = document.getElementById('batchSelectedCountText');
  if (!container) return;

  const chapters = (SUBJECT_CHAPTERS[subject] || [])
    .filter(ch => ch.value !== 'ALL' && !ch.label.includes('รวมทุกหมวด'));

  container.innerHTML = chapters.map((ch, idx) => `
    <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1E293B; cursor: pointer; padding: 4px 0;">
      <input type="checkbox" class="batch-chapter-checkbox" value="${escapeHTML(ch.value)}" checked onchange="updateBatchSelectedCount()" style="width: 16px; height: 16px; accent-color: #059669; cursor: pointer;">
      <span>${escapeHTML(ch.label)}</span>
    </label>
  `).join('');

  if (countText) countText.textContent = `${chapters.length} หมวด`;
};

window.toggleBatchSelectAll = function() {
  const checkboxes = document.querySelectorAll('.batch-chapter-checkbox');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach(cb => cb.checked = !allChecked);
  const btn = document.getElementById('btnToggleBatchSelectAll');
  if (btn) btn.textContent = !allChecked ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด';
  updateBatchSelectedCount();
};

window.updateBatchSelectedCount = function() {
  const checkboxes = document.querySelectorAll('.batch-chapter-checkbox:checked');
  const countText = document.getElementById('batchSelectedCountText');
  if (countText) countText.textContent = `${checkboxes.length} หมวด`;
};

window.selectBatchCount = function(count) {
  const input = document.getElementById('batchQuestionsPerChapter');
  if (input) input.value = count;
  [5, 10, 15, 20].forEach(c => {
    const btn = document.getElementById(`btnBatch${c}`);
    if (btn) {
      if (c === count) {
        btn.style.borderColor = '#BD1B0B';
        btn.style.backgroundColor = '#FEF2F2';
        btn.style.color = '#BD1B0B';
      } else {
        btn.style.borderColor = '#E2E8F0';
        btn.style.backgroundColor = '#F8FAFC';
        btn.style.color = '#475569';
      }
    }
  });
};

window.selectBatchDelay = function(ms) {
  const input = document.getElementById('batchDelayMs');
  if (input) input.value = ms;
  [2500, 3500, 5000].forEach(d => {
    const btn = document.getElementById(`btnDelay${d}`);
    if (btn) {
      if (d === ms) {
        btn.style.borderColor = '#059669';
        btn.style.backgroundColor = '#ECFDF5';
        btn.style.color = '#059669';
      } else {
        btn.style.borderColor = '#E2E8F0';
        btn.style.backgroundColor = '#F8FAFC';
        btn.style.color = '#475569';
      }
    }
  });
};

window.togglePauseBatch = function() {
  batchState.isPaused = !batchState.isPaused;
  const btn = document.getElementById('btnPauseBatch');
  if (btn) {
    btn.textContent = batchState.isPaused ? '▶️ ทำต่อ' : '⏸️ พักชั่วคราว';
    btn.style.background = batchState.isPaused ? '#FEF3C7' : 'white';
    btn.style.color = batchState.isPaused ? '#92400E' : '#475569';
  }
};

window.stopBatchGeneration = function() {
  if (confirm('คุณต้องการยุติการสร้างข้อสอบอัตโนมัติใช่หรือไม่? (ข้อสอบหมวดที่สร้างสำเร็จแล้วจะไม่สูญหายและถูกบันทึกไว้ในระบบแล้ว)')) {
    batchState.shouldStop = true;
  }
};

function appendBatchLog(msg, color = '#E2E8F0') {
  const consoleEl = document.getElementById('batchLogsConsole');
  if (!consoleEl) return;
  const div = document.createElement('div');
  div.style.color = color;
  div.style.marginBottom = '4px';
  div.textContent = `> ${msg}`;
  consoleEl.appendChild(div);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function delayWithCountdown(ms, text = 'หน่วงเวลาหลบ API Limit...') {
  return new Promise(resolve => {
    const box = document.getElementById('batchCountdownBox');
    const textEl = document.getElementById('batchCountdownText');
    const secEl = document.getElementById('batchCountdownSeconds');

    if (box) box.style.display = 'flex';
    if (textEl) textEl.textContent = text;

    let remaining = ms;
    const step = 100;

    const interval = setInterval(() => {
      remaining -= step;
      if (secEl) secEl.textContent = `${(Math.max(remaining, 0) / 1000).toFixed(1)}s`;

      if (remaining <= 0 || batchState.shouldStop) {
        clearInterval(interval);
        if (box) box.style.display = 'none';
        resolve();
      }
    }, step);
  });
}

window.startBatchAutoExamGeneration = async function() {
  const subjectSelect = document.getElementById('batchSubjectSelect');
  const subject = subjectSelect ? subjectSelect.value : 'กฏหมาย';
  const displayName = getSubjectDisplayName(subject);

  const checkedBoxes = Array.from(document.querySelectorAll('.batch-chapter-checkbox:checked'));
  const selectedChapters = checkedBoxes.map(cb => cb.value);

  if (selectedChapters.length === 0) {
    alert('กรุณาเลือกหมวดหมู่ที่ต้องการสร้างอย่างน้อย 1 หมวด');
    return;
  }

  const numQuestions = parseInt(document.getElementById('batchQuestionsPerChapter')?.value) || 10;
  const delayMs = parseInt(document.getElementById('batchDelayMs')?.value) || 3500;
  const apiKey = document.getElementById('adminGeminiApiKey')?.value.trim() || localStorage.getItem('admin_gemini_key') || '';

  // Initialize batch state
  batchState = {
    isRunning: true,
    isPaused: false,
    shouldStop: false,
    subject,
    chapters: selectedChapters,
    questionsPerChapter: numQuestions,
    delayMs,
    currentIndex: 0,
    successCount: 0,
    failCount: 0
  };

  // Setup Progress Modal
  const progressModal = document.getElementById('batchProgressModal');
  const subTitleEl = document.getElementById('batchProgressSubjectSubtitle');
  const consoleEl = document.getElementById('batchLogsConsole');
  const progressBar = document.getElementById('batchProgressBar');
  const percentText = document.getElementById('batchProgressPercentText');
  const countBadge = document.getElementById('batchCountBadge');
  const statusEl = document.getElementById('batchCurrentChapterStatus');
  const btnPause = document.getElementById('btnPauseBatch');

  if (progressModal) progressModal.style.display = 'flex';
  if (subTitleEl) subTitleEl.textContent = `วิชา ${displayName} (${selectedChapters.length} หมวด)`;
  if (consoleEl) consoleEl.innerHTML = `<div style="color: #94A3B8;">> เริ่มต้นระบบ Batch AI Generator: วิชา ${displayName} จำนวน ${selectedChapters.length} หมวด (หมวดละ ${numQuestions} ข้อ)</div>`;
  if (progressBar) progressBar.style.width = '0%';
  if (percentText) percentText.textContent = '0%';
  if (countBadge) countBadge.textContent = `0 / ${selectedChapters.length} หมวด`;
  if (btnPause) {
    btnPause.textContent = '⏸️ พักชั่วคราว';
    btnPause.style.background = 'white';
    btnPause.style.color = '#475569';
  }

  closeAddExamModal();

  for (let i = 0; i < selectedChapters.length; i++) {
    if (batchState.shouldStop) {
      appendBatchLog('⏹️ ผู้ใช้ได้ทำการยุติการสร้างข้อสอบ', '#EF4444');
      break;
    }

    // Handle pause
    while (batchState.isPaused && !batchState.shouldStop) {
      if (statusEl) statusEl.textContent = '⏸️ พักการสร้างชั่วคราว...';
      await new Promise(r => setTimeout(r, 500));
    }

    if (batchState.shouldStop) break;

    const chapterName = selectedChapters[i];
    const chapterNum = i + 1;
    const progressPct = Math.round(((i) / selectedChapters.length) * 100);

    if (progressBar) progressBar.style.width = `${progressPct}%`;
    if (percentText) percentText.textContent = `${progressPct}%`;
    if (countBadge) countBadge.textContent = `${i + 1} / ${selectedChapters.length} หมวด`;
    if (statusEl) statusEl.textContent = `กำลังสร้าง [${chapterNum}/${selectedChapters.length}]: ${chapterName}...`;

    appendBatchLog(`[${chapterNum}/${selectedChapters.length}] กำลังสั่ง Gemini AI เจนข้อสอบ "${chapterName}"...`, '#60A5FA');

    let success = false;
    let retries = 0;
    const maxRetries = 2;

    while (!success && retries <= maxRetries && !batchState.shouldStop) {
      try {
        // Calculate automatic set number (ชุดที่ 1, ชุดที่ 2...) for this specific chapter
        const existingSetsForChapter = allLoadedExams.filter(ex => {
          if (!isSameSubjectCategory(ex.category, subject)) return false;

          const cleanCh = chapterName.replace(/บทที่\s*[๐-๙\d]+[:\-\s]*/g, '').trim();
          if (ex.subcategory && (ex.subcategory === chapterName || ex.subcategory.includes(cleanCh))) return true;
          if (ex.title && cleanCh && ex.title.includes(cleanCh)) return true;
          return false;
        });

        let maxBatchSetNum = 0;
        existingSetsForChapter.forEach(ex => {
          const num = extractSetNumberFromTitle(ex.title);
          if (num > maxBatchSetNum) maxBatchSetNum = num;
        });
        const nextSetNum = Math.max(existingSetsForChapter.length + 1, maxBatchSetNum + 1);
        const title = `แบบทดสอบ${displayName}: ${chapterName} (ชุดที่ ${nextSetNum})`;
        
        // 1. Generate via Preview-AI
        const res = await fetch(`${API_BASE}/api/admin/exams/preview-ai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            subject,
            knowledgeBase: 'GENERAL',
            docId: 'ALL',
            title,
            subcategory: chapterName,
            numQuestions,
            apiKey
          })
        });

        const data = await res.json();

        if (res.status === 429 || (data.error && data.error.includes('429'))) {
          retries++;
          appendBatchLog(`⚠️ ติด Rate Limit (429) รอ 8 วินาทีก่อนลองใหม่ (ครั้งที่ ${retries}/${maxRetries})...`, '#F59E0B');
          await delayWithCountdown(8000, '⏳ Gemini Rate Limit! กำลังรอถอยระยะห่าง 8s...');
          continue;
        }

        if (!res.ok || !data.questions || data.questions.length === 0) {
          throw new Error(data.error || 'ไม่มีคำถามถูกสร้าง');
        }

        // 2. Auto-save directly into Database
        const saveRes = await fetch(`${API_BASE}/api/admin/exams/save-set`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            title,
            category: subject,
            subcategory: chapterName,
            status: 'PUBLISHED',
            questions: data.questions
          })
        });

        const saveData = await saveRes.json();
        if (!saveRes.ok) {
          throw new Error(saveData.error || 'บันทึกเข้าฐานข้อมูลไม่สำเร็จ');
        }

        // Add to local loaded exams cache so subsequent runs know set numbers
        allLoadedExams.push({
          id: saveData.id || Date.now(),
          title,
          category: subject,
          subcategory: chapterName,
          questionsCount: data.questions.length
        });

        success = true;
        batchState.successCount++;
        appendBatchLog(`✅ [${chapterNum}/${selectedChapters.length}] "${title}" สำเร็จ ${data.questions.length} ข้อ (บันทึกเรียบร้อย)`, '#34D399');

      } catch (err) {
        retries++;
        if (retries <= maxRetries) {
          appendBatchLog(`⚠️ ข้อผิดพลาด: ${err.message} -> กำลังลองใหม่ใน 4 วินาที...`, '#F59E0B');
          await delayWithCountdown(4000, '⏳ กำลังลองใหม่...');
        } else {
          batchState.failCount++;
          appendBatchLog(`❌ [${chapterNum}/${selectedChapters.length}] ข้าม "${chapterName}": ${err.message}`, '#EF4444');
        }
      }
    }

    // Delay before next chapter to safely avoid Rate Limit
    if (i < selectedChapters.length - 1 && !batchState.shouldStop) {
      await delayWithCountdown(delayMs, `⏳ หน่วงเวลา ${delayMs/1000}s เพื่อหลบ Rate Limit ก่อนเริ่มหมวดถัดไป...`);
    }
  }

  // Completed All
  if (progressBar) progressBar.style.width = '100%';
  if (percentText) percentText.textContent = '100%';
  if (statusEl) statusEl.textContent = `🎉 สร้างเสร็จสิ้น! (สำเร็จ ${batchState.successCount} หมวด, พลาด ${batchState.failCount} หมวด)`;

  appendBatchLog(`🎉 การทำงานเสร็จสิ้นทั้งหมด! สำเร็จ ${batchState.successCount}/${selectedChapters.length} หมวด`, '#34D399');

  const btnPauseEl = document.getElementById('btnPauseBatch');
  if (btnPauseEl) {
    btnPauseEl.textContent = '✓ ปิดหน้าต่างนี้';
    btnPauseEl.onclick = () => {
      progressModal.style.display = 'none';
      loadExamsList(); // Refresh admin exams table
    };
  }
};

// ==========================================
// Reported Questions View & Management
// ==========================================
let allLoadedReports = [];

async function updateReportsCount() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/reports`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const reports = await res.json();
      const badge = document.getElementById('reportsBadge');
      const headerBadge = document.getElementById('reportsHeaderBadge');
      if (badge) {
        if (reports.length > 0) {
          badge.textContent = reports.length;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
      if (headerBadge) {
        headerBadge.textContent = `${reports.length} รายการ`;
      }
    }
  } catch (e) {
    console.warn('Update reports badge error:', e);
  }
}

window.loadAdminReports = async function() {
  try {
    const tbody = document.getElementById('reportsTableBody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: #64748B;">⏳ กำลังโหลดรายการข้อสอบที่ถูกรายงาน...</td></tr>`;
    }

    const res = await fetch(`${API_BASE}/api/admin/reports`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #EF4444; padding: 20px;">ไม่สามารถโหลดรายงานได้: ${err.error || res.statusText}</td></tr>`;
      return;
    }

    const reports = await res.json();
    allLoadedReports = reports;

    const badge = document.getElementById('reportsBadge');
    const headerBadge = document.getElementById('reportsHeaderBadge');
    if (badge) {
      if (reports.length > 0) {
        badge.textContent = reports.length;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
    if (headerBadge) headerBadge.textContent = `${reports.length} รายการ`;

    if (!tbody) return;
    tbody.innerHTML = '';

    if (reports.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px 20px; color: #64748B;">
            <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
            <div style="font-weight: 700; font-size: 15px; color: #1E293B;">ไม่มีข้อสอบที่ถูกแจ้งผิดพลาด</div>
            <div style="font-size: 12.5px; color: #94A3B8; margin-top: 4px;">เมื่อมีนักเรียนกดแจ้งข้อสอบผิด ข้อมูลจะปรากฏที่นี่ทันที</div>
          </td>
        </tr>
      `;
      return;
    }

    reports.forEach((rep, idx) => {
      let reasonData = {};
      try {
        reasonData = JSON.parse(rep.reason);
      } catch (e) {
        reasonData = { reasonType: rep.reason, details: '' };
      }

      // Resolve subject intelligently from server-calculated rep.subject or heuristic
      let subject = rep.subject || reasonData.subject || '';
      let chapter = rep.chapter || reasonData.chapter || '-';

      if (!subject || subject === 'ทั่วไป' || subject === 'ความสามารถทั่วไป') {
        const txt = ((chapter !== '-' ? chapter : '') + ' ' + (rep.questionText || '')).toLowerCase();
        if (txt.includes('สะกดคำ') || txt.includes('คำทับศัพท์') || txt.includes('ราชาศัพท์') || txt.includes('ภาษาไทย') || txt.includes('สำนวน') || txt.includes('ประโยค')) {
          subject = 'ภาษาไทย';
        } else if (txt.includes('คอมพิวเตอร์') || txt.includes('เครือข่าย') || txt.includes('สารสนเทศ') || txt.includes('ซอฟต์แวร์') || txt.includes('ฮาร์ดแวร์')) {
          subject = 'เทคโนโลยีสารสนเทศ';
        } else if (txt.includes('สารบรรณ') || txt.includes('ระเบียบ') || txt.includes('๕๔') || txt.includes('54')) {
          subject = 'งานสารบรรณ';
        } else if (txt.includes('กฎหมาย') || txt.includes('วิ.อาญา') || txt.includes('อาญา') || txt.includes('พ.ร.บ.')) {
          subject = 'กฎหมายที่ประชาชนควรรู้';
        } else if (txt.includes('อังกฤษ') || txt.includes('english')) {
          subject = 'ภาษาอังกฤษ';
        } else if (txt.includes('อัตราส่วน') || txt.includes('ร้อยละ') || txt.includes('อนุกรม') || txt.includes('ความน่าจะเป็น') || txt.includes('คณิต')) {
          subject = 'ความสามารถทั่วไป (คณิต/คำนวณ)';
        } else {
          subject = 'ความสามารถทั่วไป';
        }
      }

      const qNum = reasonData.questionNumber ? `ข้อที่ ${reasonData.questionNumber}` : 'ข้อสอบ';
      const reasonType = reasonData.reasonType || 'เฉลยคำตอบผิด';
      const details = reasonData.details || '';
      const reporterName = rep.user ? (rep.user.fullName || rep.user.username || rep.user.name || rep.user.email || `User #${rep.user.id}`) : `User #${rep.userId}`;
      const dateStr = rep.createdAt ? new Date(rep.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center; font-weight: 700; color: #64748B;">#${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: #0F172A; font-size: 13.5px;">${escapeHTML(subject)}</div>
          <div style="font-size: 11.5px; color: #64748B;">${escapeHTML(chapter)}</div>
        </td>
        <td style="text-align: center;">
          <span class="badge" style="background: #EFF6FF; color: #1D4ED8; font-weight: 800; font-size: 12px; padding: 4px 8px; border-radius: 8px;">
            ${escapeHTML(qNum)}
          </span>
        </td>
        <td>
          <div style="font-weight: 600; color: #1E293B; margin-bottom: 4px; line-height: 1.4; font-size: 13px;">
            ${escapeHTML(rep.questionText || 'ไม่มีข้อความคำถาม')}
          </div>
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span class="badge" style="background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; font-weight: 700; font-size: 11px;">
              ⚠️ ${escapeHTML(reasonType)}
            </span>
            ${details ? `<span style="font-size: 12px; color: #475569; background: #F1F5F9; padding: 2px 8px; border-radius: 6px;">💬 "${escapeHTML(details)}"</span>` : ''}
          </div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 12.5px; color: #334155;">${escapeHTML(reporterName)}</div>
          <div style="font-size: 11px; color: #94A3B8;">${dateStr}</div>
        </td>
        <td style="text-align: right; white-space: nowrap; display: flex; gap: 6px; justify-content: flex-end;">
          <button class="btn btn-outline" style="background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; padding: 6px 11px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" onclick="openReportAiAuditModal(${rep.id})">
            🤖 AI Audit
          </button>
          <button class="btn btn-outline" style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; padding: 6px 10px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer;" onclick="openEditSingleQuestionModal('${rep.questionId}', ${rep.id}, ${idx})">
            ✏️ แก้ไขข้อนี้
          </button>
          <button class="btn btn-outline" style="background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; padding: 6px 10px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer;" onclick="resolveReport(${rep.id})">
            ✓ จัดการแล้ว
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Load admin reports error:', err);
    alert('เกิดข้อผิดพลาดในการโหลดรายงาน: ' + err.message);
  }
};

window.openEditSingleQuestionModal = async function(questionId, reportId, reportIndex) {
  try {
    const rep = (reportIndex !== undefined && allLoadedReports[reportIndex]) ? allLoadedReports[reportIndex] : null;
    let reasonData = {};
    if (rep && rep.reason) {
      try { reasonData = JSON.parse(rep.reason); } catch (e) {}
    }

    document.getElementById('editSingleQuestionId').value = questionId || '';
    document.getElementById('editSingleReportId').value = reportId || '';

    // Default values from report
    let qText = (rep && rep.questionText) ? rep.questionText : '';
    let c1 = (reasonData.choices && reasonData.choices[0]) || '';
    let c2 = (reasonData.choices && reasonData.choices[1]) || '';
    let c3 = (reasonData.choices && reasonData.choices[2]) || '';
    let c4 = (reasonData.choices && reasonData.choices[3]) || '';
    let ans = reasonData.correctAnswer || 1;
    let exp = reasonData.explanation || '';

    // If questionId is numeric, try fetching real DB question record
    const numId = parseInt(questionId);
    if (!isNaN(numId) && numId > 0) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/questions/${numId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const dbQ = await res.json();
          qText = dbQ.questionText || qText;
          c1 = dbQ.choice1 || c1;
          c2 = dbQ.choice2 || c2;
          c3 = dbQ.choice3 || c3;
          c4 = dbQ.choice4 || c4;
          ans = dbQ.correctAnswer || ans;
          exp = dbQ.explanation || exp;
        }
      } catch (e) {
        console.warn('Fetch DB question fallback to report data:', e);
      }
    }

    const titleEl = document.getElementById('singleQuestionModalTitle');
    const subEl = document.getElementById('singleQuestionModalSubtitle');
    if (titleEl) titleEl.textContent = `แก้ไขข้อสอบ (ID: ${questionId})`;
    if (subEl) {
      subEl.textContent = `วิชา: ${reasonData.subject || 'ทั่วไป'} | ${reasonData.chapter || ''} (${reasonData.questionNumber ? 'ข้อที่ ' + reasonData.questionNumber : ''})`;
    }

    document.getElementById('editSingleQuestionText').value = qText;
    document.getElementById('editSingleChoice1').value = c1;
    document.getElementById('editSingleChoice2').value = c2;
    document.getElementById('editSingleChoice3').value = c3;
    document.getElementById('editSingleChoice4').value = c4;
    document.getElementById('editSingleCorrectAnswer').value = String(ans || '1');
    document.getElementById('editSingleExplanation').value = exp;

    document.getElementById('editSingleQuestionModal').style.display = 'flex';
  } catch (err) {
    console.error('Open edit single question modal error:', err);
    alert('เกิดข้อผิดพลาด: ' + err.message);
  }
};

window.closeEditSingleQuestionModal = function() {
  const modal = document.getElementById('editSingleQuestionModal');
  if (modal) modal.style.display = 'none';
};

window.saveSingleQuestionEdit = async function() {
  const questionId = document.getElementById('editSingleQuestionId').value;
  const reportId = document.getElementById('editSingleReportId').value;
  const questionText = document.getElementById('editSingleQuestionText').value.trim();
  const choice1 = document.getElementById('editSingleChoice1').value.trim();
  const choice2 = document.getElementById('editSingleChoice2').value.trim();
  const choice3 = document.getElementById('editSingleChoice3').value.trim();
  const choice4 = document.getElementById('editSingleChoice4').value.trim();
  const correctAnswer = parseInt(document.getElementById('editSingleCorrectAnswer').value) || 1;
  const explanation = document.getElementById('editSingleExplanation').value.trim();

  if (!questionText) {
    alert('กรุณากรอกข้อความโจทย์คำถาม');
    return;
  }

  const btn = document.getElementById('btnSaveSingleQuestion');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'กำลังบันทึก... ⏳';
  }

  try {
    const numId = parseInt(questionId);
    let updatedInDb = false;

    if (!isNaN(numId) && numId > 0) {
      const res = await fetch(`${API_BASE}/api/admin/questions/${numId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          questionText,
          choice1,
          choice2,
          choice3,
          choice4,
          correctAnswer,
          explanation
        })
      });

      if (res.ok) {
        updatedInDb = true;
      }
    }

    // Auto-resolve / delete the report if reportId is present
    if (reportId) {
      await fetch(`${API_BASE}/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      }).catch(() => {});
    }

    alert('✅ บันทึกการแก้ไขข้อสอบเรียบร้อยแล้ว' + (updatedInDb ? ' และอัปเดตลงฐานข้อมูลสำเร็จ' : ''));
    closeEditSingleQuestionModal();
    loadAdminReports();

  } catch (err) {
    console.error('Save single question error:', err);
    alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>💾 บันทึกการแก้ไขข้อนี้</span>';
    }
  }
};

window.resolveReport = async function(reportId) {
  if (!confirm('ต้องการทำเครื่องหมายว่าจัดการรายงานนี้เรียบร้อยแล้ว และลบออกจากรายการใช่หรือไม่?')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/reports/${reportId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.ok) {
      loadAdminReports();
    } else {
      const data = await res.json().catch(() => ({}));
      alert('ไม่สามารถลบรายงานได้: ' + (data.error || 'เกิดข้อผิดพลาด'));
    }
  } catch (err) {
    console.error('Resolve report error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message);
  }
};

window.editQuickFixChoice = function(idx, ansNum) {
  if (currentEditQuestions[idx]) {
    currentEditQuestions[idx].correctAnswer = ansNum;
    const sel = document.getElementById(`edit_q_ans_${idx}`);
    if (sel) sel.value = String(ansNum);
    renderEditQuestionsList();
  }
};

// =======================================================
// 🤖 AI 3-PASS RE-CHECK & REPORT AUDITOR CLIENT FUNCTIONS
// =======================================================

let pendingAiFixedPreviewQuestions = null;
let currentAuditReportData = null;

// Client-side rule-based conflict detector
function clientDetectConflict(q) {
  const exp = (q.explanation || '').trim();
  if (!exp) return { hasConflict: false };

  let currentAns = 1;
  const rawAns = String(q.correctAnswer !== undefined ? q.correctAnswer : (q.correctOption || '1')).trim().toUpperCase();
  if (rawAns === '2' || rawAns === 'B' || rawAns === 'ข') currentAns = 2;
  else if (rawAns === '3' || rawAns === 'C' || rawAns === 'ค') currentAns = 3;
  else if (rawAns === '4' || rawAns === 'D' || rawAns === 'ง') currentAns = 4;
  else {
    const num = parseInt(rawAns);
    if (!isNaN(num) && num >= 1 && num <= 4) currentAns = num;
  }

  const mapChoice = {
    'ก': 1, '1': 1, 'A': 1,
    'ข': 2, '2': 2, 'B': 2,
    'ค': 3, '3': 3, 'C': 3,
    'ง': 4, '4': 4, 'D': 4
  };

  const pat1 = /(?:ข้อ|ตัวเลือกที่?)\s*([1-4ก-งA-D])[.)]?\s*(?:จึง|เป็น|คือ)?\s*(?:ถูกต้อง|ถูก|คำตอบ|เฉลย)/i;
  const pat2 = /(?:ตอบ|เฉลย|คำตอบคือ|คำตอบที่ถูกต้องคือ|ดังนั้น)\s*(?:ข้อ|ตัวเลือกที่?)?\s*([1-4ก-งA-D])[.)]?/i;
  const pat3 = /ถูกต้องคือ\s*(?:ข้อ|ตัวเลือก)?\s*([1-4ก-งA-D])[.)]?/i;

  let detectedAns = null;
  let matchSnippet = '';

  const m1 = exp.match(pat1);
  if (m1 && m1[1] && mapChoice[m1[1].toUpperCase()]) {
    detectedAns = mapChoice[m1[1].toUpperCase()];
    matchSnippet = m1[0];
  } else {
    const m2 = exp.match(pat2);
    if (m2 && m2[1] && mapChoice[m2[1].toUpperCase()]) {
      detectedAns = mapChoice[m2[1].toUpperCase()];
      matchSnippet = m2[0];
    } else {
      const m3 = exp.match(pat3);
      if (m3 && m3[1] && mapChoice[m3[1].toUpperCase()]) {
        detectedAns = mapChoice[m3[1].toUpperCase()];
        matchSnippet = m3[0];
      }
    }
  }

  if (detectedAns !== null && detectedAns !== currentAns) {
    const thaiChoiceNames = ['', 'ก (1)', 'ข (2)', 'ค (3)', 'ง (4)'];
    const optLetters = ['', 'A', 'B', 'C', 'D'];
    return {
      hasConflict: true,
      currentAnswer: currentAns,
      currentAnswerLabel: thaiChoiceNames[currentAns],
      detectedAnswer: detectedAns,
      detectedAnswerLabel: thaiChoiceNames[detectedAns],
      detectedOptionLetter: optLetters[detectedAns],
      matchSnippet,
      reason: `คำอธิบายระบุว่า "${matchSnippet}" แต่ระบบเลือกข้อ ${thaiChoiceNames[currentAns]}`
    };
  }

  return { hasConflict: false, currentAnswer: currentAns };
}

// 1. Run 3-Pass AI Recheck on Preview Modal
window.runAi3PassRecheckOnPreview = async function() {
  if (!previewExamQuestions || previewExamQuestions.length === 0) {
    alert('ไม่มีข้อสอบให้ตรวจสอบ');
    return;
  }

  // Sync inputs from DOM
  previewExamQuestions.forEach((q, idx) => {
    const t = document.getElementById(`q_text_${idx}`);
    const a = document.getElementById(`q_a_${idx}`);
    const b = document.getElementById(`q_b_${idx}`);
    const c = document.getElementById(`q_c_${idx}`);
    const d = document.getElementById(`q_d_${idx}`);
    const cor = document.getElementById(`q_correct_${idx}`);
    const exp = document.getElementById(`q_exp_${idx}`);
    if (t) q.questionText = t.value;
    if (a) q.optionA = a.value;
    if (b) q.optionB = b.value;
    if (c) q.optionC = c.value;
    if (d) q.optionD = d.value;
    if (cor) q.correctOption = cor.value;
    if (exp) q.explanation = exp.value;
  });

  const btn = document.getElementById('btnRunAiRecheckPreview');
  const banner = document.getElementById('previewAiRecheckBanner');
  const titleEl = document.getElementById('previewAiRecheckTitle');
  const descEl = document.getElementById('previewAiRecheckDesc');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ AI กำลังรีเช็ค 3 รอบ...</span>';
  }

  try {
    const title = document.getElementById('examTitle') ? document.getElementById('examTitle').value : '';
    const subject = document.getElementById('examSubject') ? document.getElementById('examSubject').value : '';

    const res = await fetch(`${API_BASE}/api/admin/exams/recheck-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        questions: previewExamQuestions,
        subject,
        title
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Server error: ' + res.statusText);
    }

    const data = await res.json();
    if (data.issuesCount > 0) {
      pendingAiFixedPreviewQuestions = data.fixedQuestions.map(fq => ({
        questionText: fq.questionText,
        optionA: fq.choice1 || fq.optionA,
        optionB: fq.choice2 || fq.optionB,
        optionC: fq.choice3 || fq.optionC,
        optionD: fq.choice4 || fq.optionD,
        correctOption: fq.correctAnswer === 2 ? 'B' : fq.correctAnswer === 3 ? 'C' : fq.correctAnswer === 4 ? 'D' : 'A',
        explanation: fq.explanation
      }));

      if (banner) {
        banner.style.display = 'flex';
        banner.style.background = '#FEF2F2';
        banner.style.borderColor = '#FECACA';
        if (titleEl) titleEl.textContent = `🤖 AI ตรวจพบจุดที่ควรแก้ไข ${data.issuesCount} ข้อ (จาก ${data.totalAudited} ข้อ)`;
        if (descEl) descEl.textContent = `พบข้อที่เฉลยไม่ตรงกับตัวเลือก หรือคำอธิบายยาว/แปลก AI ได้เตรียมเฉลยและขัดเกลาคำอธิบายใหม่ให้เรียบร้อยแล้ว`;
      }
    } else {
      if (banner) {
        banner.style.display = 'flex';
        banner.style.background = '#ECFDF5';
        banner.style.borderColor = '#A7F3D0';
        if (titleEl) titleEl.innerHTML = `✅ ผลการรีเช็ค 3 รอบ: ข้อสอบทั้ง ${data.totalAudited} ข้อ ถูกต้องสมบูรณ์ 100%`;
        if (descEl) descEl.textContent = `ไม่พบข้อขัดแย้ง ตัวเลือกและคำอธิบายสอดคล้องกันตามหลักวิชาการตำรวจ`;
      }
    }

  } catch (err) {
    console.error('AI Recheck error:', err);
    alert('เกิดข้อผิดพลาดในการตรวจสอบด้วย AI: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>🤖 AI 3-Pass รีเช็ค & แก้ไขออโต้</span>';
    }
  }
};

// 2. Apply AI Fixes to Preview Questions
window.applyAi3PassFixesToPreview = function() {
  if (!pendingAiFixedPreviewQuestions || pendingAiFixedPreviewQuestions.length === 0) {
    alert('ไม่มีข้อมูลการแก้ไขของ AI');
    return;
  }

  previewExamQuestions = pendingAiFixedPreviewQuestions;
  pendingAiFixedPreviewQuestions = null;

  const banner = document.getElementById('previewAiRecheckBanner');
  if (banner) {
    banner.style.background = '#ECFDF5';
    banner.style.borderColor = '#A7F3D0';
    const titleEl = document.getElementById('previewAiRecheckTitle');
    const descEl = document.getElementById('previewAiRecheckDesc');
    if (titleEl) titleEl.textContent = `✨ นำการแก้ไขของ AI ไปใช้เรียบร้อยแล้วทุกข้อ!`;
    if (descEl) descEl.textContent = `ปรับปรุงตัวเลือกที่ถูกต้องและขัดเกลาคำอธิบายให้กระชับ ชัดเจนแล้ว`;
  }

  const title = document.getElementById('examTitle') ? document.getElementById('examTitle').value : '';
  const subject = document.getElementById('examSubject') ? document.getElementById('examSubject').value : '';
  const knowledgeBase = document.getElementById('knowledgeBaseSelect') ? document.getElementById('knowledgeBaseSelect').value : '';
  renderExamPreviewModal(title, subject, knowledgeBase);
};

// 3. Run AI 3-Pass Recheck on Edit Exam Modal
window.runAi3PassRecheckOnEditModal = async function() {
  syncEditQuestionsFromDOM();
  if (!currentEditQuestions || currentEditQuestions.length === 0) {
    alert('ไม่มีข้อสอบในชุดนี้');
    return;
  }

  const btn = document.getElementById('btnEditExamAiRecheck');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ AI กำลังรีเช็ค...</span>';
  }

  try {
    const subject = document.getElementById('editExamCategory') ? document.getElementById('editExamCategory').value : '';
    const title = document.getElementById('editExamTitle') ? document.getElementById('editExamTitle').value : '';

    const res = await fetch(`${API_BASE}/api/admin/exams/recheck-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        questions: currentEditQuestions,
        subject,
        title
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText);
    }

    const data = await res.json();
    if (data.issuesCount > 0) {
      const issuesSummary = data.issues.map(i => `• ข้อที่ ${i.questionNumber}: ${i.title} (${i.description})`).join('\n');
      if (confirm(`🤖 AI ตรวจสอบพบจุดที่ควรปรับปรุง ${data.issuesCount} ข้อ:\n\n${issuesSummary}\n\nต้องการให้ AI แก้ไขออโต้ทันทีหรือไม่?`)) {
        currentEditQuestions = data.fixedQuestions;
        renderEditQuestionsList();
        alert(`✅ นำการแก้ไขออโต้ของ AI ไปปรับใช้เรียบร้อยแล้ว ${data.issuesCount} ข้อ! (อย่าลืมกดปุ่มบันทึกทั้งหมด)`);
      }
    } else {
      alert(`🎉 ตรวจสอบสมบูรณ์: ข้อสอบทั้ง ${data.totalAudited} ข้อ ถูกต้อง สอดคล้องกับเฉลย และคำอธิบายชัดเจน 100%!`);
    }

  } catch (err) {
    console.error('Run AI Recheck on edit modal error:', err);
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>🤖 AI 3-Pass รีเช็คชุดนี้</span>';
    }
  }
};

// 4. Open AI Report Auditor Modal
window.openReportAiAuditModal = async function(reportId) {
  const modal = document.getElementById('reportAiAuditModal');
  const body = document.getElementById('reportAuditModalBody');
  const badge = document.getElementById('reportAuditVerdictBadge');
  const subtitle = document.getElementById('reportAuditMetaSubtitle');

  if (!modal) return;
  modal.style.display = 'flex';
  badge.textContent = 'กำลังประมวลผล...';
  badge.style.background = '#FEF3C7';
  badge.style.color = '#B45309';

  body.innerHTML = `
    <div style="text-align: center; padding: 48px 20px; color: #64748B;">
      <div style="font-size: 36px; margin-bottom: 12px;">🤖</div>
      <div style="font-weight: 800; font-size: 16px; color: #0F172A; margin-bottom: 6px;">Gemini AI กำลังวิเคราะห์รายงานข้อสอบ...</div>
      <div style="font-size: 13px; color: #64748B;">อ่านข้อสอบ เปรียบเทียบกับเหตุผลและเฉลยที่ผู้เข้าสอบพิมพ์ทักท้วง ตรวจสอบตัวบทกฎหมายและหลักวิชาการ</div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/admin/reports/${reportId}/ai-audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText);
    }

    const data = await res.json();
    currentAuditReportData = data;

    const q = data.question;
    const audit = data.aiAudit || {};
    const feedback = data.studentFeedback || {};
    const reporterName = data.reporter ? data.reporter.name : 'ผู้เข้าสอบ';

    if (subtitle) {
      subtitle.textContent = `วิชา: ${data.subject} | หมวด: ${data.chapter} | ผู้แจ้ง: ${reporterName}`;
    }

    // Verdict Badge
    let badgeBg = '#FEF3C7';
    let badgeColor = '#B45309';
    let badgeText = audit.verdictTitle || 'ผลการตรวจสอบ';
    if (audit.verdict === 'VALID_REPORT') {
      badgeBg = '#FEF2F2';
      badgeColor = '#DC2626';
    } else if (audit.verdict === 'FALSE_ALARM') {
      badgeBg = '#ECFDF5';
      badgeColor = '#059669';
    } else if (audit.verdict === 'AMBIGUOUS') {
      badgeBg = '#FFFBEB';
      badgeColor = '#D97706';
    }
    badge.textContent = badgeText;
    badge.style.background = badgeBg;
    badge.style.color = badgeColor;

    const thaiChoices = ['', 'ก', 'ข', 'ค', 'ง'];
    const currentAnsChar = thaiChoices[q.correctAnswer] || q.correctAnswer;
    const suggestedAnsChar = thaiChoices[audit.suggestedCorrectAnswer] || audit.suggestedCorrectAnswer;

    body.innerHTML = `
      <!-- 1. รายงานของผู้เข้าสอบ -->
      <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 800; font-size: 13.5px; color: #DC2626; display: flex; align-items: center; gap: 6px;">
            🚩 รายงานที่ผู้สอบส่งเข้ามา: ${escapeHTML(feedback.reasonType || 'เฉลยคำตอบผิด')}
          </span>
          <span style="font-size: 11.5px; color: #94A3B8;">โดย ${escapeHTML(reporterName)}</span>
        </div>
        ${feedback.details ? `
          <div style="background: #F8FAFC; border-left: 3px solid #DC2626; padding: 10px 14px; border-radius: 0 10px 10px 0; font-size: 13px; color: #334155; font-style: italic;">
            "${escapeHTML(feedback.details)}"
          </div>
        ` : '<div style="font-size: 12px; color: #94A3B8;">(ผู้สอบไม่ได้พิมพ์รายละเอียดข้อความเพิ่มเติม)</div>'}
      </div>

      <!-- 2. AI Verdict & Analysis Box -->
      <div style="background: ${audit.verdict === 'VALID_REPORT' ? '#FFF1F2' : audit.verdict === 'FALSE_ALARM' ? '#F0FDF4' : '#FFFBEB'}; border: 1.5px solid ${audit.verdict === 'VALID_REPORT' ? '#FECACA' : audit.verdict === 'FALSE_ALARM' ? '#BBF7D0' : '#FDE68A'}; border-radius: 16px; padding: 18px; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <span style="font-size: 22px;">${audit.verdict === 'VALID_REPORT' ? '🎯' : audit.verdict === 'FALSE_ALARM' ? '🛡️' : '⚖️'}</span>
          <div>
            <div style="font-weight: 900; font-size: 15px; color: ${audit.verdict === 'VALID_REPORT' ? '#991B1B' : audit.verdict === 'FALSE_ALARM' ? '#166534' : '#92400E'};">
              ${escapeHTML(audit.verdictTitle || 'ผลการวินิจฉัย')}
            </div>
            <div style="font-size: 11.5px; color: #64748B;">ความมั่นใจของ AI: ${audit.confidenceScore || 95}%</div>
          </div>
        </div>

        <div style="font-size: 13px; color: #1E293B; line-height: 1.5; margin-bottom: 12px;">
          <strong>บทวิเคราะห์:</strong> ${escapeHTML(audit.analysis || '')}
        </div>

        ${audit.studentFeedbackEvaluation ? `
          <div style="font-size: 12.5px; color: #475569; background: rgba(255,255,255,0.7); padding: 8px 12px; border-radius: 10px;">
            <strong>ประเมินความเห็นนักเรียน:</strong> ${escapeHTML(audit.studentFeedbackEvaluation)}
          </div>
        ` : ''}
      </div>

      <!-- 3. เปรียบเทียบข้อสอบปัจจุบัน vs เฉลยที่ถูกต้องที่ AI แนะนำ -->
      <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 18px; margin-bottom: 16px;">
        <div style="font-size: 13.5px; font-weight: 800; color: #0F172A; margin-bottom: 10px;">
          โจทย์: ${escapeHTML(q.questionText)}
        </div>

        <!-- ตัวเลือก 1-4 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
          <div style="padding: 8px 12px; border-radius: 10px; font-size: 12.5px; ${q.correctAnswer === 1 ? 'background: #F1F5F9; border: 1.5px solid #CBD5E1; font-weight: 700;' : 'background: #F8FAFC; border: 1px solid #E2E8F0;'} ${audit.suggestedCorrectAnswer === 1 ? 'border: 2px solid #059669; background: #ECFDF5; color: #059669; font-weight: 800;' : ''}">
            ก. ${escapeHTML(q.choice1)} ${audit.suggestedCorrectAnswer === 1 ? '✨ (AI แนะนำ)' : ''}
          </div>
          <div style="padding: 8px 12px; border-radius: 10px; font-size: 12.5px; ${q.correctAnswer === 2 ? 'background: #F1F5F9; border: 1.5px solid #CBD5E1; font-weight: 700;' : 'background: #F8FAFC; border: 1px solid #E2E8F0;'} ${audit.suggestedCorrectAnswer === 2 ? 'border: 2px solid #059669; background: #ECFDF5; color: #059669; font-weight: 800;' : ''}">
            ข. ${escapeHTML(q.choice2)} ${audit.suggestedCorrectAnswer === 2 ? '✨ (AI แนะนำ)' : ''}
          </div>
          <div style="padding: 8px 12px; border-radius: 10px; font-size: 12.5px; ${q.correctAnswer === 3 ? 'background: #F1F5F9; border: 1.5px solid #CBD5E1; font-weight: 700;' : 'background: #F8FAFC; border: 1px solid #E2E8F0;'} ${audit.suggestedCorrectAnswer === 3 ? 'border: 2px solid #059669; background: #ECFDF5; color: #059669; font-weight: 800;' : ''}">
            ค. ${escapeHTML(q.choice3)} ${audit.suggestedCorrectAnswer === 3 ? '✨ (AI แนะนำ)' : ''}
          </div>
          <div style="padding: 8px 12px; border-radius: 10px; font-size: 12.5px; ${q.correctAnswer === 4 ? 'background: #F1F5F9; border: 1.5px solid #CBD5E1; font-weight: 700;' : 'background: #F8FAFC; border: 1px solid #E2E8F0;'} ${audit.suggestedCorrectAnswer === 4 ? 'border: 2px solid #059669; background: #ECFDF5; color: #059669; font-weight: 800;' : ''}">
            ง. ${escapeHTML(q.choice4)} ${audit.suggestedCorrectAnswer === 4 ? '✨ (AI แนะนำ)' : ''}
          </div>
        </div>

        <!-- เปรียบเทียบคำตอบและคำอธิบายเฉลย -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <!-- เดิม -->
          <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 12px; padding: 12px;">
            <div style="font-size: 11.5px; font-weight: 800; color: #64748B; margin-bottom: 4px;">เฉลยเดิมในระบบ:</div>
            <div style="font-size: 13.5px; font-weight: 800; color: #DC2626; margin-bottom: 6px;">
              ข้อ ${currentAnsChar} (${q.correctAnswer})
            </div>
            <div style="font-size: 12px; color: #475569; line-height: 1.4;">
              ${escapeHTML(q.explanation || 'ไม่มีคำอธิบายเดิม')}
            </div>
          </div>

          <!-- AI แนะนำใหม่ -->
          <div style="background: #ECFDF5; border: 1.5px solid #6EE7B7; border-radius: 12px; padding: 12px;">
            <div style="font-size: 11.5px; font-weight: 800; color: #059669; margin-bottom: 4px;">เฉลยใหม่ที่ AI แนะนำ:</div>
            <div style="font-size: 13.5px; font-weight: 900; color: #059669; margin-bottom: 6px;">
              ข้อ ${suggestedAnsChar} (${audit.suggestedCorrectAnswer}) ✨
            </div>
            <div style="font-size: 12.5px; color: #065F46; line-height: 1.4; font-weight: 500;">
              ${escapeHTML(audit.suggestedExplanation || q.explanation || '')}
            </div>
          </div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error('Open Report AI Audit error:', err);
    body.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #DC2626;">
        <div style="font-size: 32px; margin-bottom: 8px;">⚠️</div>
        <div style="font-weight: 700;">เกิดข้อผิดพลาดในการตรวจสอบด้วย AI: ${escapeHTML(err.message)}</div>
      </div>
    `;
  }
};

window.closeReportAiAuditModal = function() {
  const modal = document.getElementById('reportAiAuditModal');
  if (modal) modal.style.display = 'none';
  currentAuditReportData = null;
};

// 5. Apply AI Fix to DB & Resolve Report
window.applyReportAiFix = async function() {
  if (!currentAuditReportData) {
    alert('ไม่พบข้อมูลการตรวจสอบ');
    return;
  }

  const btn = document.getElementById('btnApplyReportAiFix');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>กำลังบันทึกและปรับปรุงเฉลย... ⏳</span>';
  }

  try {
    const q = currentAuditReportData.question;
    const audit = currentAuditReportData.aiAudit || {};

    const res = await fetch(`${API_BASE}/api/admin/reports/${currentAuditReportData.reportId}/ai-apply-fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        questionId: currentAuditReportData.questionId,
        questionText: q.questionText,
        choice1: q.choice1,
        choice2: q.choice2,
        choice3: q.choice3,
        choice4: q.choice4,
        correctAnswer: audit.suggestedCorrectAnswer || q.correctAnswer,
        explanation: audit.suggestedExplanation || q.explanation,
        auditNote: audit.verdictTitle || 'ปรับปรุงเฉลยตามที่ AI ตรวจสอบ'
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText);
    }

    alert('✅ ปรับปรุงเฉลยข้อสอบ อัปเดตประวัติ และปิดรายงานเรียบร้อยแล้ว!');
    closeReportAiAuditModal();
    loadAdminReports();

  } catch (err) {
    console.error('Apply Report AI Fix error:', err);
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>✨ ปรับปรุงเฉลยตามที่ AI แนะนำ & ปิดรายงาน</span>';
    }
  }
};

// 6. Open Manual Edit Form from AI Audit
window.openManualEditFromAudit = function() {
  if (!currentAuditReportData) return;
  const q = currentAuditReportData.question;
  const audit = currentAuditReportData.aiAudit || {};
  const reportId = currentAuditReportData.reportId;
  const questionId = currentAuditReportData.questionId;

  closeReportAiAuditModal();

  document.getElementById('editSingleQuestionId').value = questionId || '';
  document.getElementById('editSingleReportId').value = reportId || '';
  document.getElementById('editSingleQuestionText').value = q.questionText || '';
  document.getElementById('editSingleChoice1').value = q.choice1 || '';
  document.getElementById('editSingleChoice2').value = q.choice2 || '';
  document.getElementById('editSingleChoice3').value = q.choice3 || '';
  document.getElementById('editSingleChoice4').value = q.choice4 || '';
  document.getElementById('editSingleCorrectAnswer').value = String(audit.suggestedCorrectAnswer || q.correctAnswer || 1);
  document.getElementById('editSingleExplanation').value = audit.suggestedExplanation || q.explanation || '';

  const titleEl = document.getElementById('singleQuestionModalTitle');
  const subEl = document.getElementById('singleQuestionModalSubtitle');
  if (titleEl) titleEl.textContent = `แก้ไขข้อสอบ (ID: ${questionId})`;
  if (subEl) subEl.textContent = `วิชา: ${currentAuditReportData.subject || 'ทั่วไป'} (นำเข้าข้อมูลจากผล AI Audit แล้ว)`;

  document.getElementById('editSingleQuestionModal').style.display = 'flex';
};

// 7. AI Check for Single Question Modal
window.runAiCheckOnSingleModal = async function() {
  const qText = document.getElementById('editSingleQuestionText').value.trim();
  const c1 = document.getElementById('editSingleChoice1').value.trim();
  const c2 = document.getElementById('editSingleChoice2').value.trim();
  const c3 = document.getElementById('editSingleChoice3').value.trim();
  const c4 = document.getElementById('editSingleChoice4').value.trim();
  const ans = parseInt(document.getElementById('editSingleCorrectAnswer').value) || 1;
  const exp = document.getElementById('editSingleExplanation').value.trim();

  if (!qText) {
    alert('กรุณากรอกโจทย์คำถาม');
    return;
  }

  const btn = document.getElementById('btnAiCheckSingle');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>กำลังตรวจ... ⏳</span>';
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/exams/recheck-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        questions: [{
          questionText: qText,
          choice1: c1, choice2: c2, choice3: c3, choice4: c4,
          correctAnswer: ans,
          explanation: exp
        }]
      })
    });

    if (!res.ok) throw new Error('AI Check failed');
    const data = await res.json();
    if (data.fixedQuestions && data.fixedQuestions[0]) {
      const fixed = data.fixedQuestions[0];
      document.getElementById('editSingleCorrectAnswer').value = String(fixed.correctAnswer);
      document.getElementById('editSingleExplanation').value = fixed.explanation;
      alert(`✨ AI ตรวจสอบและปรับปรุงให้เรียบร้อยแล้ว:\n• เฉลยเป็นข้อ: ${fixed.correctAnswer}\n• ปรับปรุงคำอธิบายให้กระชับ ชัดเจน`);
    }

  } catch (err) {
    console.error('Run single AI check error:', err);
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>🤖 AI ตรวจสอบข้อนี้</span>';
    }
  }
};

// 8. Batch AI Audit Modal
window.openBatchAiAuditModal = async function() {
  const modal = document.getElementById('batchAiAuditModal');
  const body = document.getElementById('batchAuditModalBody');
  if (!modal) return;
  modal.style.display = 'flex';

  body.innerHTML = `
    <div style="text-align: center; padding: 48px 20px; color: #64748B;">
      <div style="font-size: 36px; margin-bottom: 12px;">⚡</div>
      <div style="font-weight: 800; font-size: 16px; color: #0F172A; margin-bottom: 6px;">กำลังรันระบบ AI ตรวจสอบรายงานข้อสอบทุกข้อ...</div>
      <div style="font-size: 13px; color: #64748B;">สแกนความขัดแย้งของเฉลยและข้อกฎหมายพร้อมกัน</div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/admin/reports/batch-ai-audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText);
    }

    const data = await res.json();
    if (data.count === 0) {
      body.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #64748B;">
          <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
          <div style="font-weight: 700; font-size: 15px; color: #1E293B;">ไม่มีรายงานข้อสอบคงค้าง</div>
        </div>
      `;
      return;
    }

    body.innerHTML = '';
    data.audits.forEach((item, idx) => {
      const card = document.createElement('div');
      card.style.cssText = 'background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 16px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);';

      const thaiChoices = ['', 'ก', 'ข', 'ค', 'ง'];
      const curChar = thaiChoices[item.currentAnswer] || item.currentAnswer;
      const sugChar = thaiChoices[item.suggestedAnswer] || item.suggestedAnswer;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 800; font-size: 13.5px; color: #0F172A;">รายงาน #${idx + 1} (ข้อสอบ ID: ${item.questionId})</span>
            ${item.hasConflict ? '<span style="background: #FEE2E2; color: #DC2626; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">⚠️ เฉลยขัดแย้ง</span>' : '<span style="background: #F0FDF4; color: #15803D; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">เฉลยตรงกัน</span>'}
          </div>
          <button type="button" class="btn btn-outline" style="background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer;" onclick="closeBatchAiAuditModal(); openReportAiAuditModal(${item.reportId});">
            🤖 เปิดดู AI Audit ละเอียด
          </button>
        </div>

        <div style="font-size: 13px; font-weight: 600; color: #1E293B; margin-bottom: 6px;">
          ${escapeHTML(item.questionText || 'ไม่มีโจทย์')}
        </div>

        <div style="background: #F8FAFC; border-radius: 10px; padding: 10px 12px; font-size: 12px; margin-bottom: 8px; color: #475569;">
          <div style="margin-bottom: 4px;"><strong>ผู้แจ้ง:</strong> ${escapeHTML(item.reporterName)} (ประเภท: ${escapeHTML(item.reasonType)})</div>
          ${item.details ? `<div><strong>ข้อความที่แจ้ง:</strong> "${escapeHTML(item.details)}"</div>` : ''}
          ${item.conflictReason ? `<div style="color: #DC2626; margin-top: 4px; font-weight: 700;">⚠️ ${escapeHTML(item.conflictReason)}</div>` : ''}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748B;">
          <div>เฉลยปัจจุบัน: <strong>ข้อ ${curChar}</strong> ${item.hasConflict ? `→ แนะนำเปลี่ยนเป็น: <strong style="color: #059669;">ข้อ ${sugChar}</strong>` : ''}</div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline" style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 8px; cursor: pointer;" onclick="closeBatchAiAuditModal(); openEditSingleQuestionModal('${item.questionId}', ${item.reportId});">
              ✏️ แก้ไขข้อนี้
            </button>
            <button class="btn btn-outline" style="background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 8px; cursor: pointer;" onclick="resolveReport(${item.reportId}); closeBatchAiAuditModal();">
              ✓ ปิดรายงาน
            </button>
          </div>
        </div>
      `;
      body.appendChild(card);
    });

  } catch (err) {
    console.error('Batch AI Audit error:', err);
    body.innerHTML = `<div style="color: #DC2626; text-align: center; padding: 30px;">เกิดข้อผิดพลาด: ${escapeHTML(err.message)}</div>`;
  }
};

window.closeBatchAiAuditModal = function() {
  const modal = document.getElementById('batchAiAuditModal');
  if (modal) modal.style.display = 'none';
};



