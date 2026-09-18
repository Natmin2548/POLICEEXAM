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

    const adminUserInfoEl = document.getElementById('adminUserInfo');
    if (adminUserInfoEl) {
      adminUserInfoEl.textContent = `Admin: ${currentUser.username || currentUser.fullName || currentUser.email || 'Admin'}`;
    }
    
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
const ADMIN_TABS = [
  { id: 'tabDashboard', view: 'viewDashboard', loadFn: () => loadDashboard() },
  { id: 'tabUsers', view: 'viewUsers', loadFn: () => loadUsers() },
  { id: 'tabExams', view: 'viewExams', loadFn: () => { switchExamsSubtab('bank', false); loadExams(); } },
  { id: 'tabAnnouncements', view: 'viewAnnouncements', loadFn: () => loadAnnouncements() },
  { id: 'tabReports', view: 'viewExams', loadFn: () => { switchExamsSubtab('reports', false); loadAdminReports(); } }
];

window.switchExamsSubtab = function(subtab, triggerLoad = true) {
  const bankBtn = document.getElementById('subtabExamBankBtn');
  const reportsBtn = document.getElementById('subtabReportsBtn');
  const bankContent = document.getElementById('subtabExamBankContent');
  const reportsContent = document.getElementById('subtabReportsContent');
  const bottomExamsTab = document.getElementById('mTabExams');
  const bottomApprovalsTab = document.getElementById('mTabApprovals');

  if (subtab === 'reports') {
    if (bankBtn) bankBtn.classList.remove('active');
    if (reportsBtn) reportsBtn.classList.add('active');
    if (bankContent) bankContent.classList.remove('active');
    if (reportsContent) reportsContent.classList.add('active');

    if (bottomExamsTab) bottomExamsTab.classList.remove('active');
    if (bottomApprovalsTab) bottomApprovalsTab.classList.add('active');

    if (triggerLoad && typeof loadAdminReports === 'function') {
      loadAdminReports();
    }
  } else {
    if (bankBtn) bankBtn.classList.add('active');
    if (reportsBtn) reportsBtn.classList.remove('active');
    if (bankContent) bankContent.classList.add('active');
    if (reportsContent) reportsContent.classList.remove('active');

    if (bottomExamsTab) bottomExamsTab.classList.add('active');
    if (bottomApprovalsTab) bottomApprovalsTab.classList.remove('active');

    if (triggerLoad && typeof loadExams === 'function') {
      loadExams();
    }
  }
};

function switchTab(tabId) {
  let target = ADMIN_TABS.find(t => t.id === tabId || t.view === tabId);
  if (!target && tabId === 'tabReports') {
    target = ADMIN_TABS.find(t => t.id === 'tabReports');
  }
  if (!target) return;

  ADMIN_TABS.forEach(t => {
    const el = document.getElementById(t.id);
    const vEl = document.getElementById(t.view);
    if (el) el.classList.remove('active');
    if (vEl) vEl.classList.remove('active');
  });

  const tabEl = document.getElementById(target.id);
  const targetView = document.getElementById(target.view);
  if (tabEl) tabEl.classList.add('active');
  if (targetView) targetView.classList.add('active');

  // Handle Exams vs Reports subtabs
  if (tabId === 'tabReports' || target.id === 'tabReports') {
    switchExamsSubtab('reports', false);
  } else if (tabId === 'tabExams' || target.id === 'tabExams') {
    switchExamsSubtab('bank', false);
  }

  // Sync Mobile Bottom Navigation Bar (Figma Design)
  const bottomTabsMap = {
    tabDashboard: 'mTabDashboard',
    tabUsers: 'mTabUsers',
    tabExams: 'mTabExams',
    tabReports: 'mTabApprovals',
    tabAnnouncements: 'mTabApprovals'
  };
  document.querySelectorAll('.admin-bottom-tab').forEach(t => t.classList.remove('active'));
  const activeMTabId = bottomTabsMap[target.id];
  if (activeMTabId) {
    const activeMTab = document.getElementById(activeMTabId);
    if (activeMTab) activeMTab.classList.add('active');
  }

  const pageTitleEl = document.getElementById('pageTitle');
  if (pageTitleEl && tabEl) {
    pageTitleEl.textContent = tabEl.textContent.trim();
  }

  if (typeof target.loadFn === 'function') {
    target.loadFn();
  }
}
window.switchTab = switchTab;

function setupTabs() {
  ADMIN_TABS.forEach(tab => {
    const tabEl = document.getElementById(tab.id);
    if (!tabEl) return;
    tabEl.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(tab.id);
    });
  });
}

// ==========================================
// Dashboard View & Real-time Analytics
// ==========================================
let currentDashboardStats = null;
let currentOnlineUsers = [];
let dashboardAutoRefreshTimer = null;

async function loadDashboard(isManual = false) {
  const refreshIcon = document.getElementById('refreshIcon');
  if (isManual && refreshIcon) {
    refreshIcon.style.transform = 'rotate(360deg)';
    setTimeout(() => { refreshIcon.style.transform = 'rotate(0deg)'; }, 400);
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const stats = await res.json();
      currentDashboardStats = stats;
      currentOnlineUsers = (stats.online && stats.online.users) ? stats.online.users : [];

      // Standard stats
      const elUsers = document.getElementById('statUsers');
      const elExams = document.getElementById('statExams');
      const elPrem = document.getElementById('statPremium');
      if (elUsers) elUsers.textContent = (stats.totalUsers || 0).toLocaleString();
      if (elExams) elExams.textContent = (stats.totalExams || 0).toLocaleString();
      if (elPrem) elPrem.textContent = (stats.pendingPremiumCount ?? stats.pendingPremiumRequests ?? 0).toLocaleString();

      // Real-time Online Users Stats
      const onlineInfo = stats.online || {};
      const totalOnline = onlineInfo.totalOnline ?? 0;
      const membersCount = onlineInfo.membersCount ?? 0;
      const guestsCount = onlineInfo.guestsCount ?? 0;

      const elOnlineTotal = document.getElementById('statOnlineTotal');
      const elOnlineMembers = document.getElementById('statOnlineMembers');
      const elOnlineGuests = document.getElementById('statOnlineGuests');
      const elTopOnlineBadge = document.getElementById('topOnlineBadge');

      if (elOnlineTotal) elOnlineTotal.innerHTML = `${totalOnline.toLocaleString()} <span style="font-size: 16px; font-weight: 600; color: #059669;">คน</span>`;
      if (elOnlineMembers) elOnlineMembers.textContent = membersCount.toLocaleString();
      if (elOnlineGuests) elOnlineGuests.textContent = guestsCount.toLocaleString();
      if (elTopOnlineBadge) elTopOnlineBadge.textContent = totalOnline.toLocaleString();

      // Hourly Usage & Average Stats
      const hourlyInfo = stats.hourlyUsage || {};
      const avgUsers = typeof hourlyInfo.avgUsersPerHour === 'number' ? hourlyInfo.avgUsersPerHour.toFixed(1) : (hourlyInfo.avgUsersPerHour || '0.0');
      const avgActions = typeof hourlyInfo.avgActionsPerHour === 'number' ? hourlyInfo.avgActionsPerHour.toFixed(1) : (hourlyInfo.avgActionsPerHour || '0.0');
      const peakHour = hourlyInfo.peakHour || '-';
      const peakCount = hourlyInfo.peakCount ?? 0;

      const elAvgUsers = document.getElementById('statAvgUsersPerHour');
      const elAvgActions = document.getElementById('statAvgActionsPerHour');
      const elPeakHour = document.getElementById('statPeakHour');
      const elPeakBadge = document.getElementById('statPeakBadge');

      if (elAvgUsers) elAvgUsers.innerHTML = `${avgUsers} <span style="font-size: 16px; font-weight: 600; color: #2563EB;">คน/ชม.</span>`;
      if (elAvgActions) elAvgActions.textContent = avgActions;
      if (elPeakHour) elPeakHour.textContent = peakHour;
      if (elPeakBadge) elPeakBadge.textContent = peakCount > 0 ? `(${peakCount} คน)` : '(0 คน)';

      // 24-Hour Summary Footer
      const totalUsers24h = hourlyInfo.totalUsersIn24h ?? 0;
      const breakdown = hourlyInfo.hourlyBreakdown || [];
      const totalActions24h = breakdown.reduce((sum, h) => sum + (h.actions || 0), 0);

      const elSumUsers = document.getElementById('statSummaryTotalUsers24h');
      const elSumCurrent = document.getElementById('statSummaryCurrent');
      const elSumActions = document.getElementById('statSummaryTotalActions24h');
      const elSumPeak = document.getElementById('statSummaryPeakHour');
      const elSumAvg = document.getElementById('statSummaryAvgPerHour');
      const elTime = document.getElementById('dashboardLastUpdatedTime');

      if (elSumUsers) elSumUsers.textContent = (totalUsers24h || 0).toLocaleString();
      if (elSumCurrent) elSumCurrent.textContent = (totalOnline || currentOnlineUsers.length || 0).toLocaleString();
      if (elSumActions) elSumActions.textContent = `${totalActions24h.toLocaleString()} ครั้ง`;
      if (elSumPeak) elSumPeak.textContent = peakHour !== '-' ? peakHour : '-';
      if (elSumAvg) elSumAvg.textContent = typeof avgUsers === 'number' ? avgUsers.toFixed(1) : avgUsers;
      if (elTime) {
        const nowStr = new Date().toLocaleTimeString('th-TH', { hour12: false });
        elTime.textContent = `อัปเดตล่าสุด: ${nowStr} น.`;
      }

      // Render 24-hour visual bar chart
      renderHourlyBarChart(breakdown);

      // If modal is currently open, update it
      const modal = document.getElementById('onlineUsersModal');
      if (modal && modal.style.display === 'flex') {
        renderOnlineUsersTable(currentOnlineUsers);
      }
    }
    
    // Announcements count
    const resAnn = await fetch(`${API_BASE}/api/announcements`);
    if (resAnn.ok) {
      const announcements = await resAnn.json();
      const elAnn = document.getElementById('statAnnouncements');
      if (elAnn) elAnn.textContent = (announcements.length || 0).toLocaleString();
    }

    // Update pending reports badge count
    if (typeof updateReportsCount === 'function') {
      updateReportsCount();
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }

  // Setup auto-refresh every 25 seconds when on Dashboard tab
  if (!dashboardAutoRefreshTimer) {
    dashboardAutoRefreshTimer = setInterval(() => {
      const tab = document.getElementById('tabDashboard');
      if (tab && tab.classList.contains('active')) {
        loadDashboard();
      }
    }, 25000);
  }
}

// Render 24-Hour Visual Activity Bar Chart
function renderHourlyBarChart(breakdown = []) {
  const container = document.getElementById('hourlyChartContainer');
  if (!container) return;

  if (!breakdown || breakdown.length === 0) {
    container.innerHTML = `<div style="width: 100%; text-align: center; color: #64748B; font-size: 14px; font-weight: 600; margin: auto;">ยังไม่มีข้อมูลการใช้งานย้อนหลัง 24 ชั่วโมง</div>`;
    return;
  }

  const maxUsers = Math.max(1, ...breakdown.map(b => b.users || 0));
  const peakItem = breakdown.reduce((max, b) => ((b.users || 0) > (max.users || 0) ? b : max), breakdown[0] || {});

  let chartHtml = '';
  breakdown.forEach((item, idx) => {
    const users = item.users || 0;
    const actions = item.actions || 0;
    const attempts = item.attempts || 0;
    const hourLabel = item.hour || '00:00';
    const hourNum = parseInt(hourLabel.split(':')[0], 10) || 0;
    const nextHourStr = (hourNum + 1).toString().padStart(2, '0');

    // Height percentage (reserve space at top for value badge)
    const pct = users === 0 ? 3 : Math.max(12, Math.round((users / maxUsers) * 75));

    // Colors matching Figma design
    let fillBg = '#DCE4EC';
    if (item.isCurrent) {
      fillBg = '#10B981';
    } else if (users > 0 && users === peakItem.users && peakItem.users > 0) {
      fillBg = '#F59E0B';
    }

    // Visible Value Badge directly on top of bar (matching Figma mockup)
    let valueBadgeHtml = '';
    if (users > 0) {
      const isPeak = users === peakItem.users && peakItem.users > 0;
      const isCur = item.isCurrent;
      if (isPeak) {
        valueBadgeHtml = `<div class="hourly-bar-val-badge peak" style="font-size: 10px; font-weight: 800; color: #B45309; line-height: 1; margin-bottom: 3px;">${users}</div>`;
      } else if (isCur) {
        valueBadgeHtml = `<div class="hourly-bar-val-badge current" style="font-size: 10px; font-weight: 800; color: #059669; line-height: 1; margin-bottom: 3px;">🔥 ${users}</div>`;
      } else {
        valueBadgeHtml = `<div class="hourly-bar-val-badge" style="font-size: 9.5px; font-weight: 700; color: #64748B; line-height: 1; margin-bottom: 3px;">${users}</div>`;
      }
    }

    // Tooltip Content on hover
    const statusTag = item.isCurrent 
      ? '<span style="color: #34D399; font-weight: 800;">● ชั่วโมงปัจจุบัน</span><br>'
      : (users > 0 && users === peakItem.users)
      ? '<span style="color: #FBBF24; font-weight: 800;">★ ชั่วโมงพีคสุด (Peak)</span><br>'
      : '';

    const tooltip = `
      <div class="hourly-bar-tooltip">
        ${statusTag}
        <strong>เวลา ${escapeHTML(hourLabel)} - ${nextHourStr}:00 น.</strong><br>
        👥 ผู้ใช้งาน: <strong>${users.toLocaleString()}</strong> คน<br>
        ⚡ คำขอ/การเข้าชม: <strong>${actions.toLocaleString()}</strong> ครั้ง<br>
        📝 การทำข้อสอบ: <strong>${attempts.toLocaleString()}</strong> ชุด
      </div>
    `;

    // Clear hour labels: every 2 hours or current hour, no ugly dots
    const showLabel = (idx % 2 === 0 || item.isCurrent);
    const displayLabel = item.isCurrent ? `<b>${escapeHTML(hourLabel)}</b>` : (showLabel ? escapeHTML(hourLabel) : '');
    const labelStyle = item.isCurrent ? 'color: #047857; font-weight: 900; background: #D1FAE5; padding: 1px 4px; border-radius: 4px;' : '';

    chartHtml += `
      <div class="hourly-bar-col" tabindex="0" role="button" aria-label="${escapeHTML(hourLabel)}: ${users} คน" title="${escapeHTML(hourLabel)}: ${users} คน">
        ${tooltip}
        ${valueBadgeHtml}
        <div class="hourly-bar-fill" style="height: ${pct}%; background: ${fillBg};"></div>
        <div class="hourly-bar-label" style="${labelStyle}">
          ${displayLabel}
        </div>
      </div>
    `;
  });

  container.innerHTML = chartHtml;

  // Auto-scroll to the current hour (right side) on mobile/touch screens
  const chartWrapper = document.getElementById('hourlyChartWrapper');
  if (chartWrapper) {
    setTimeout(() => {
      chartWrapper.scrollLeft = chartWrapper.scrollWidth;
    }, 60);
  }
}

// ==========================================
// Online Users Modal Management
// ==========================================
let currentOnlineFilter = 'all'; // 'all' | 'members' | 'guests'

function setOnlineUsersFilter(filter = 'all') {
  currentOnlineFilter = filter;

  // Update tab buttons
  const tabAll = document.getElementById('tabFilterAll');
  const tabMembers = document.getElementById('tabFilterMembers');
  const tabGuests = document.getElementById('tabFilterGuests');

  if (tabAll) tabAll.classList.toggle('active', filter === 'all');
  if (tabMembers) tabMembers.classList.toggle('active', filter === 'members');
  if (tabGuests) tabGuests.classList.toggle('active', filter === 'guests');

  filterOnlineUsersList();
}

function openOnlineUsersModal() {
  const modal = document.getElementById('onlineUsersModal');
  if (!modal) return;

  const onlineInfo = currentDashboardStats?.online || {};
  const total = onlineInfo.totalOnline ?? currentOnlineUsers.length;
  const members = onlineInfo.membersCount ?? currentOnlineUsers.filter(u => u.role !== 'GUEST').length;
  const guests = onlineInfo.guestsCount ?? currentOnlineUsers.filter(u => u.role === 'GUEST').length;

  const elTotalBadge = document.getElementById('modalOnlineTotalBadge');
  const elFilterAll = document.getElementById('modalOnlineFilterAllCount');
  const elFilterMembers = document.getElementById('modalOnlineFilterMembersCount');
  const elFilterGuests = document.getElementById('modalOnlineFilterGuestsCount');

  if (elTotalBadge) elTotalBadge.textContent = `${total.toLocaleString()} คน`;
  if (elFilterAll) elFilterAll.textContent = total.toLocaleString();
  if (elFilterMembers) elFilterMembers.textContent = members.toLocaleString();
  if (elFilterGuests) elFilterGuests.textContent = guests.toLocaleString();

  filterOnlineUsersList();
  modal.style.display = 'flex';
}

function closeOnlineUsersModal() {
  const modal = document.getElementById('onlineUsersModal');
  if (modal) modal.style.display = 'none';
}

async function refreshOnlineUsersModal() {
  await loadDashboard(true);
  openOnlineUsersModal();
}

function filterOnlineUsersList() {
  const input = document.getElementById('onlineUserSearchInput');
  const query = (input ? input.value : '').toLowerCase().trim();

  let list = currentOnlineUsers || [];

  // Filter by category
  if (currentOnlineFilter === 'members') {
    list = list.filter(u => u.role !== 'GUEST');
  } else if (currentOnlineFilter === 'guests') {
    list = list.filter(u => u.role === 'GUEST');
  }

  // Filter by search query
  if (query) {
    list = list.filter(u => {
      const uname = (u.username || '').toLowerCase();
      const fname = (u.fullName || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      return uname.includes(query) || fname.includes(query) || role.includes(query);
    });
  }

  renderOnlineUsersTable(list);
}

function renderOnlineUsersTable(usersList = []) {
  const tbody = document.getElementById('onlineUsersTableBody');
  const emptyState = document.getElementById('onlineUsersEmptyState');
  const tableWrapper = document.getElementById('onlineUsersTableWrapper');
  const guestsNotice = document.getElementById('onlineGuestsNotice');
  const emptyTitle = document.getElementById('onlineEmptyTitle');

  if (!tbody) return;

  const guestsCount = currentDashboardStats?.online?.guestsCount ?? 0;
  const membersCount = currentDashboardStats?.online?.membersCount ?? 0;

  if (!usersList || usersList.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      if (emptyTitle) {
        if (currentOnlineFilter === 'guests') {
          emptyTitle.textContent = 'ขณะนี้ไม่มีผู้เยี่ยมชมทั่วไป (Guest)';
        } else if (currentOnlineFilter === 'members') {
          emptyTitle.textContent = 'ยังไม่มีสมาชิกเข้าสู่ระบบออนไลน์ในขณะนี้';
        } else {
          emptyTitle.textContent = 'ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา';
        }
      }
      if (guestsNotice) {
        if (currentOnlineFilter === 'members') {
          guestsNotice.textContent = `มีผู้เยี่ยมชมทั่วไป (Guest) ${guestsCount.toLocaleString()} คน กำลังเปิดดูหน้าเว็บ`;
        } else if (currentOnlineFilter === 'guests') {
          guestsNotice.textContent = `มีสมาชิกที่ล็อกอินอยู่ ${membersCount.toLocaleString()} คน`;
        } else {
          guestsNotice.textContent = 'ลองสลับตัวกรองหรือกดรีเฟรชเพื่ออัปเดตข้อมูลใหม่';
        }
      }
    }
    return;
  }

  if (tableWrapper) tableWrapper.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  let html = '';
  usersList.forEach(u => {
    const isGuest = u.role === 'GUEST';

    // Role badge
    let roleBadge = '<span style="background: #F1F5F9; color: #475569; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 11.5px; border: 1px solid #E2E8F0;">👤 สมาชิก</span>';
    if (isGuest) {
      roleBadge = '<span style="background: #F8FAFC; color: #64748B; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 11.5px; border: 1px solid #CBD5E1;">🌐 Guest (ยังไม่ล็อกอิน)</span>';
    } else if (u.role === 'OWNER') {
      roleBadge = '<span style="background: linear-gradient(135deg, #F59E0B, #B45309); color: white; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 11.5px; box-shadow: 0 2px 6px rgba(180, 83, 9, 0.25);">👑 OWNER</span>';
    } else if (u.role === 'ADMIN') {
      roleBadge = '<span style="background: #7C3AED; color: white; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 11.5px;">🛡️ ADMIN</span>';
    } else if (u.role === 'PREMIUM') {
      roleBadge = '<span style="background: #FEF3C7; color: #B45309; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 11.5px; border: 1px solid #FDE68A;">⭐ PREMIUM</span>';
    }

    // Clean Path / Activity Label
    let pathLabel = u.lastPath || '/';
    if (pathLabel.includes('exam.html') || pathLabel.includes('/stages/')) {
      pathLabel = '📝 กำลังทำข้อสอบ';
    } else if (pathLabel.includes('bank.html')) {
      pathLabel = '📚 กำลังดูคลังข้อสอบ';
    } else if (pathLabel.includes('admin')) {
      pathLabel = '⚙️ หน้าแอดมิน (Admin Panel)';
    } else if (pathLabel.includes('profile')) {
      pathLabel = '👤 กำลังดูโปรไฟล์';
    } else if (pathLabel.includes('heartbeat') || pathLabel === '/' || pathLabel.includes('index')) {
      pathLabel = '🏠 หน้าแรก / แดชบอร์ด';
    }

    const firstChar = isGuest ? '🌐' : (u.fullName || u.username || 'U').charAt(0).toUpperCase();
    const avatarBg = isGuest ? '#EFF6FF' : '#EEF2F6';
    const avatarColor = isGuest ? '#2563EB' : '#1E293B';
    const avatarBorder = isGuest ? '#BFDBFE' : '#CBD5E1';
    const subLabel = isGuest ? '@ยังไม่เข้าสู่ระบบ' : `@${escapeHTML(u.username)}`;

    html += `
      <tr class="online-table-row" style="border-bottom: 1px solid #F1F5F9; transition: background 0.15s ease;">
        <!-- Col 1: User Info (Desktop Table Cell / Mobile Card Header) -->
        <td class="col-user-info" style="padding: 12px 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${avatarBg}; color: ${avatarColor}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: ${isGuest ? '16px' : '14px'}; border: 1.5px solid ${avatarBorder}; flex-shrink: 0;">
              ${escapeHTML(firstChar)}
            </div>
            <div>
              <div style="font-weight: 700; color: #0F172A; font-size: 13.5px; line-height: 1.25;">${escapeHTML(u.fullName || u.username)}</div>
              <div style="font-size: 11.5px; color: #64748B;">${subLabel}</div>
            </div>
          </div>
          <!-- Visible on Mobile Card Top-Right -->
          <div class="mobile-role-container">
            ${roleBadge}
          </div>
        </td>

        <!-- Col 2: Role Badge (Desktop only) -->
        <td class="col-role-desktop" style="padding: 12px 16px;">
          ${roleBadge}
        </td>

        <!-- Col 3: Time Ago (Desktop only) -->
        <td class="col-time-desktop" style="padding: 12px 16px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="live-dot-pulse"></span>
            <span style="font-weight: 600; color: #0F172A;">${escapeHTML(u.timeAgo || 'เมื่อสักครู่')}</span>
          </div>
        </td>

        <!-- Col 4: Activity (Desktop only) -->
        <td class="col-activity-desktop" style="padding: 12px 16px; color: #475569; font-size: 12.5px;">
          <span style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 4px 10px; border-radius: 8px; font-weight: 500; display: inline-block;">
            ${escapeHTML(pathLabel)}
          </span>
        </td>

        <!-- Mobile Meta Row: Time Ago (Left) + Activity (Right) -->
        <td class="mobile-meta-row">
          <div class="mobile-card-meta">
            <div style="display: flex; align-items: center; gap: 5px;">
              <span class="live-dot-pulse" style="width: 6px; height: 6px;"></span>
              <span style="font-weight: 600; color: #0F172A; font-size: 11.5px;">${escapeHTML(u.timeAgo || 'เมื่อสักครู่')}</span>
            </div>
            <div>
              <span style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 3px 8px; border-radius: 6px; font-weight: 500; font-size: 11.5px; color: #475569;">
                ${escapeHTML(pathLabel)}
              </span>
            </div>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Global modal handlers
window.openOnlineUsersModal = openOnlineUsersModal;
window.closeOnlineUsersModal = closeOnlineUsersModal;
window.refreshOnlineUsersModal = refreshOnlineUsersModal;
window.filterOnlineUsersList = filterOnlineUsersList;
window.setOnlineUsersFilter = setOnlineUsersFilter;
window.loadDashboard = loadDashboard;
window.loadUsers = loadUsers;

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

function getUserInitials(u) {
  const clean = (u.fullName || u.username || 'User')
    .replace(/^(นาย|นางสาว|นาง|ด\.ต\.|พ\.ต\.ท\.|พ\.ต\.อ\.|ร\.ต\.อ\.|ร\.ต\.ท\.|ร\.ต\.ต\.|ส\.ต\.ต\.|ส\.ต\.ท\.|ส\.ต\.อ\.)\s*/, '')
    .trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function getRelativeTimeThai(dateStr) {
  if (!dateStr) return 'เมื่อสักครู่';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'เมื่อสักครู่';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 30) return `${diffDays} วันที่แล้ว`;
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
}

function formatExamDateThai(dateStr) {
  if (!dateStr) return 'อัปเดต 12 ก.ย. 2566';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'อัปเดตล่าสุด';
  return 'อัปเดต ' + d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

window.setUserFilterStatus = function(status, btn) {
  currentUserFilterStatus = status;
  document.querySelectorAll('.admin-filter-pills-row .admin-pill-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderUsersWithFilters();
};

function renderUsersWithFilters() {
  const cardsContainer = document.getElementById('usersCardsContainer');
  const tbody = document.getElementById('usersTableBody');
  const totalBadge = document.getElementById('usersTotalCountBadge');

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
  if (totalBadge) {
    totalBadge.textContent = `${filtered.length} คน`;
  }

  // 1. Render Cards (Figma Image 1 Spec)
  if (cardsContainer) {
    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div style="background: white; border: 1.5px dashed #CBD5E1; border-radius: 18px; padding: 40px 16px; text-align: center; color: #64748B;">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <div style="font-size: 15px; font-weight: 800; color: #1E293B;">ไม่พบข้อมูลผู้ใช้ที่ค้นหา</div>
          <div style="font-size: 12.5px; color: #94A3B8; margin-top: 4px;">ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเป็น "All"</div>
        </div>
      `;
    } else {
      cardsContainer.innerHTML = filtered.map(u => {
        const initial = getUserInitials(u);
        const fullName = u.fullName || u.username || `User #${u.id}`;
        const email = u.email || `${u.username || 'user'}@police.go.th`;
        const isAdmin = u.role === 'ADMIN' || u.role === 'OWNER';
        const isPremium = !isAdmin && ((u.quizCount || 0) >= 3 || (u.streak || 0) >= 7 || u.role === 'PREMIUM');
        
        let roleBadgeClass = 'free';
        let roleBadgeText = 'Free';
        if (isAdmin) {
          roleBadgeClass = 'admin';
          roleBadgeText = 'Admin';
        } else if (isPremium) {
          roleBadgeClass = 'premium';
          roleBadgeText = 'Premium';
        }

        const streak = u.streak !== undefined ? u.streak : (isAdmin ? 31 : ((u.quizCount || 0) > 0 ? 14 : 0));

        return `
          <div class="admin-user-card" onclick="openUserStatsModal(${u.id})">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
              <div class="admin-user-avatar">${escapeHtml(initial)}</div>
              <div class="admin-user-info">
                <div class="admin-user-name">${escapeHtml(fullName)}</div>
                <div class="admin-user-email">${escapeHtml(email)}</div>
                <div class="admin-user-tags">
                  <span class="admin-chip-role ${roleBadgeClass}">${roleBadgeText}</span>
                  <span class="admin-chip-streak">🔥 ${streak} day streak</span>
                </div>
              </div>
            </div>
            <button type="button" class="admin-btn-insights" onclick="openUserStatsModal(${u.id}); event.stopPropagation();">
              Exam Insights
            </button>
          </div>
        `;
      }).join('');
    }
  }

  // 2. Render Fallback Table (if table body exists)
  if (tbody) {
    tbody.innerHTML = '';
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 48px 16px; color: #64748B;">
            <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
            <div style="font-size: 15px; font-weight: 700; color: #1E293B;">ไม่พบข้อมูลผู้ใช้ที่ค้นหา</div>
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(u => {
      const tr = document.createElement('tr');
      const roleBadge = u.role === 'ADMIN' || u.role === 'OWNER' ? 'badge-admin' : 'badge-user';
      const initial = getUserInitials(u);
      const examCount = u.quizCount || 0;
      const examBadgeHtml = examCount > 0 
        ? `<span class="badge" style="background: #EFF6FF; color: #1D4ED8; font-weight: 700; font-size: 12.5px; border: 1px solid #BFDBFE;">📝 ${examCount} ชุด</span>`
        : `<span style="color: #94A3B8; font-size: 12.5px;">-</span>`;

      tr.innerHTML = `
        <td style="font-weight: 700; color: #64748B;">#${u.id}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #A3180D; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0;">
              ${initial}
            </div>
            <div>
              <div style="font-weight: 700; color: #0F172A; font-size: 14px;">${escapeHtml(u.fullName || u.username)}</div>
              <div style="font-size: 12px; color: #64748B; margin-top: 1px;">@${escapeHtml(u.username)} • ${escapeHtml(u.email || '-')}</div>
            </div>
          </div>
        </td>
        <td style="text-align: center;">${examBadgeHtml}</td>
        <td style="text-align: center;"><span class="badge ${roleBadge}">${u.role}</span></td>
        <td style="text-align: right;">
          <button class="btn" onclick="openUserStatsModal(${u.id})" style="background: #BD1B0B; color: white; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 12px; border: none; cursor: pointer;">Exam Insights</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
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
// Exams View (Organized by Subject Banks & Chapters + Flat Table View)
// ==========================================
const ADMIN_SUBJECT_BANKS = [
  {
    key: 'ALL',
    name: 'ทุกวิชา (All Subjects)',
    shortName: 'ทุกวิชา',
    icon: '📚',
    color: '#BD1B0B',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  {
    key: 'ทั่วไป',
    name: 'ความสามารถทั่วไป (คณิตศาสตร์และเหตุผล)',
    shortName: 'ทั่วไป (คณิต)',
    icon: '🧠',
    color: '#9333EA',
    bgColor: '#F3E8FF',
    borderColor: '#E9D5FF'
  },
  {
    key: 'ภาษาไทย',
    name: 'ภาษาไทย',
    shortName: 'ภาษาไทย',
    icon: '🇹🇭',
    color: '#E11D48',
    bgColor: '#FFF1F2',
    borderColor: '#FECDD3'
  },
  {
    key: 'คอม',
    name: 'คอมพิวเตอร์และสารสนเทศ (IT)',
    shortName: 'คอมพิวเตอร์',
    icon: '💻',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE'
  },
  {
    key: 'กฏหมาย',
    name: 'กฎหมายที่ประชาชนควรรู้',
    shortName: 'กฎหมาย',
    icon: '⚖️',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A'
  },
  {
    key: 'สังคม',
    name: 'สังคม วัฒนธรรม และจริยธรรม',
    shortName: 'สังคมและวัฒนธรรม',
    icon: '🏛️',
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  {
    key: 'งานสารบรรณ_๒๕๒๖',
    name: 'ระเบียบสารบรรณ (๒๕๒๖)',
    shortName: 'สารบรรณ ๒๕๒๖',
    icon: '📜',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA'
  },
  {
    key: 'สารบรรณตำรวจ_๕๔',
    name: 'สารบรรณตำรวจ ลักษณะที่ ๕๔',
    shortName: 'สารบรรณตำรวจ ๕๔',
    icon: '📑',
    color: '#BE185D',
    bgColor: '#FDF2F8',
    borderColor: '#FBCFE8'
  },
  {
    key: 'ภาษาอังกฤษ',
    name: 'ภาษาอังกฤษ',
    shortName: 'ภาษาอังกฤษ',
    icon: '🇬🇧',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#C7D2FE'
  }
];

function matchExamToSubject(ex, subjectKey) {
  if (!subjectKey || subjectKey === 'ALL') return true;
  const cat = (ex.category || '').trim();
  if (subjectKey === 'ทั่วไป') {
    return cat === 'ทั่วไป' || cat.includes('คณิต') || cat.includes('ความสามารถทั่วไป');
  }
  if (subjectKey === 'ภาษาไทย') {
    return cat === 'ภาษาไทย' || cat === 'ไทย' || cat.includes('ไทย');
  }
  if (subjectKey === 'คอม') {
    return cat === 'คอม' || cat === 'คอมพิวเตอร์' || cat.includes('คอม');
  }
  if (subjectKey === 'กฏหมาย') {
    return cat === 'กฏหมาย' || cat === 'กฎหมาย' || cat.includes('กฎหมาย') || cat.includes('กฏหมาย');
  }
  if (subjectKey === 'สังคม') {
    return cat === 'สังคม' || cat.includes('สังคม');
  }
  if (subjectKey === 'งานสารบรรณ_๒๕๒๖' || subjectKey === 'งานสารบรรณ') {
    return cat === 'งานสารบรรณ_๒๕๒๖' || cat === 'งานสารบรรณ' || (cat.includes('สารบรรณ') && (cat.includes('๒๕๒๖') || !cat.includes('๕๔')));
  }
  if (subjectKey === 'สารบรรณตำรวจ_๕๔' || subjectKey === 'ลักษณะที่54') {
    return cat === 'สารบรรณตำรวจ_๕๔' || cat === 'ลักษณะที่54' || cat === 'ลักษณะที่ 54' || cat.includes('๕๔') || cat.includes('ตำรวจ');
  }
  if (subjectKey === 'ภาษาอังกฤษ') {
    return cat === 'ภาษาอังกฤษ' || cat === 'อังกฤษ' || cat.includes('อังกฤษ');
  }
  return cat === subjectKey;
}

function getSubjectBankMeta(catOrKey) {
  const c = (catOrKey || '').trim();
  for (const b of ADMIN_SUBJECT_BANKS) {
    if (b.key === 'ALL') continue;
    if (matchExamToSubject({ category: c }, b.key)) {
      return b;
    }
  }
  return {
    key: c || 'ทั่วไป',
    name: c || 'ทั่วไป',
    shortName: c || 'ทั่วไป',
    icon: '📝',
    color: '#64748B',
    bgColor: '#F1F5F9',
    borderColor: '#CBD5E1'
  };
}

let allLoadedExams = [];
window.allLoadedExams = allLoadedExams;
let currentExamFilterSubject = 'ALL';
let currentExamFilterChapter = 'ALL';
let currentExamFilterSearch = '';
let currentExamViewMode = 'bank'; // 'bank' or 'table'

window.toggleExamViewMode = function(mode) {
  currentExamViewMode = mode;
  const bankView = document.getElementById('adminBankChapterView');
  const tableView = document.getElementById('adminFlatTableView');
  const btnBank = document.getElementById('btnViewModeBank');
  const btnTable = document.getElementById('btnViewModeTable');

  if (mode === 'bank') {
    if (bankView) bankView.style.display = 'flex';
    if (tableView) tableView.style.display = 'none';
    if (btnBank) {
      btnBank.style.background = '#BD1B0B';
      btnBank.style.color = 'white';
      btnBank.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      btnBank.style.fontWeight = '800';
    }
    if (btnTable) {
      btnTable.style.background = 'transparent';
      btnTable.style.color = '#475569';
      btnTable.style.boxShadow = 'none';
      btnTable.style.fontWeight = '700';
    }
  } else {
    if (bankView) bankView.style.display = 'none';
    if (tableView) tableView.style.display = 'block';
    if (btnBank) {
      btnBank.style.background = 'transparent';
      btnBank.style.color = '#475569';
      btnBank.style.boxShadow = 'none';
      btnBank.style.fontWeight = '700';
    }
    if (btnTable) {
      btnTable.style.background = '#BD1B0B';
      btnTable.style.color = 'white';
      btnTable.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      btnTable.style.fontWeight = '800';
    }
  }
};

async function loadExams() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/exams`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const exams = await res.json();
      allLoadedExams = exams.map(e => ({
        ...e,
        totalCount: (typeof e.totalCount === 'number' && e.totalCount > 0) ? e.totalCount : (e._count?.questions || e.questionsCount || 0)
      }));
      window.allLoadedExams = allLoadedExams;
      updateFilterChapterDropdown();
      renderAdminSubjectBanksNav();
      renderExamsWithFilters();
    }
  } catch (err) {
    console.error('Exams load error:', err);
  }
}

function renderAdminSubjectBanksNav() {
  const container = document.getElementById('adminSubjectBanksNav');
  if (!container) return;

  container.innerHTML = ADMIN_SUBJECT_BANKS.map(bank => {
    const isAll = bank.key === 'ALL';
    const matchingExams = isAll ? allLoadedExams : allLoadedExams.filter(e => matchExamToSubject(e, bank.key));
    const setsCount = matchingExams.length;
    const qCount = matchingExams.reduce((sum, e) => sum + (e.totalCount || (e._count && e._count.questions) || e.questionsCount || 0), 0);
    const isActive = currentExamFilterSubject === bank.key;

    const activeStyle = isActive 
      ? `background: ${bank.bgColor}; color: ${bank.color}; border: 2px solid ${bank.color}; box-shadow: 0 4px 12px rgba(0,0,0,0.08);`
      : 'background: white; color: #475569; border: 1.5px solid #E2E8F0;';

    return `
      <button type="button" onclick="switchAdminBankSubject('${bank.key}')" 
        style="padding: 8px 14px; border-radius: 12px; font-family: inherit; cursor: pointer; transition: all 0.15s ease; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; ${activeStyle}">
        <span style="font-size: 17px;">${bank.icon}</span>
        <span>${bank.shortName}</span>
        <span style="background: ${isActive ? bank.color : '#F1F5F9'}; color: ${isActive ? 'white' : '#64748B'}; font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 800;">
          ${setsCount} ชุด (${qCount} ข้อ)
        </span>
      </button>
    `;
  }).join('');
}

window.switchAdminBankSubject = function(subjectKey) {
  currentExamFilterSubject = subjectKey;
  currentExamFilterChapter = 'ALL';
  const subSelect = document.getElementById('filterExamSubject');
  if (subSelect) subSelect.value = subjectKey;
  updateFilterChapterDropdown();
  renderAdminSubjectBanksNav();
  renderExamsWithFilters();
};

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
    // Also include any subcategories from loaded exams for this subject
    const subjectSubcats = Array.from(new Set(
      allLoadedExams.filter(e => matchExamToSubject(e, subject)).map(e => e.subcategory).filter(Boolean)
    ));
    subjectSubcats.forEach(sub => {
      if (!chapters.some(c => c.value === sub)) {
        chapterSelect.innerHTML += `<option value="${sub}">📂 ${sub}</option>`;
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
  const bankContainer = document.getElementById('adminBankChapterView');
  const summaryEl = document.getElementById('examsCountSummary');
  const activeSubjectBadge = document.getElementById('examsActiveSubjectBadge');

  const filtered = allLoadedExams.filter(ex => {
    // 1. Subject Filter
    if (currentExamFilterSubject !== 'ALL') {
      if (!matchExamToSubject(ex, currentExamFilterSubject)) return false;
    }

    // 2. Chapter Filter
    if (currentExamFilterChapter !== 'ALL') {
      const cleanFilter = currentExamFilterChapter.replace(/บทที่\s*[\d๑-๙]+\s*[:\-]?\s*/, '').trim();
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

  const totalFilteredQuestions = filtered.reduce((sum, e) => sum + (e.totalCount || 0), 0);
  const totalAllQuestions = allLoadedExams.reduce((sum, e) => sum + (e.totalCount || 0), 0);

  if (summaryEl) {
    summaryEl.textContent = `พบทั้งหมด ${filtered.length} ชุดข้อสอบ (${totalFilteredQuestions} ข้อ) จากคลังทั้งหมด ${allLoadedExams.length} ชุด (${totalAllQuestions} ข้อ)`;
  }

  if (activeSubjectBadge) {
    const activeBank = ADMIN_SUBJECT_BANKS.find(b => b.key === currentExamFilterSubject);
    activeSubjectBadge.textContent = activeBank ? `${activeBank.icon} ${activeBank.name}` : 'แสดงทุกวิชา';
  }

  // ----------------------------------------------------
  // 0. RENDER CARDS VIEW (Figma Image 2 Spec)
  // ----------------------------------------------------
  const cardsContainer = document.getElementById('examsCardsContainer');
  if (cardsContainer) {
    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div style="background: white; border: 1.5px dashed #CBD5E1; border-radius: 18px; padding: 40px 16px; text-align: center; color: #64748B;">
          <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
          <div style="font-size: 15px; font-weight: 800; color: #1E293B;">ไม่พบชุดข้อสอบตามเงื่อนไขที่เลือก</div>
          <div style="font-size: 12.5px; color: #94A3B8; margin-top: 4px; margin-bottom: 14px;">ลองเปลี่ยนตัวกรอง หรือสร้างชุดข้อสอบใหม่ด้วย AI</div>
          <button type="button" class="btn btn-primary" onclick="showAddExamModal()" style="background: #BD1B0B; border: none; padding: 9px 18px; border-radius: 12px; font-weight: 700; color: white; cursor: pointer;">
            + สร้างข้อสอบด้วย AI
          </button>
        </div>
      `;
    } else {
      cardsContainer.innerHTML = filtered.map((ex, idx) => {
        const meta = getSubjectBankMeta(ex.category);
        const subjName = meta ? meta.name : (ex.category || 'Thai Law');
        const qCount = ex.totalCount || (ex._count && ex._count.questions) || ex.questionsCount || 0;
        const dateText = formatExamDateThai(ex.updatedAt || ex.createdAt);
        const setBadge = `SET-${String(ex.id || (idx + 1)).padStart(3, '0')}`;

        return `
          <div class="admin-exam-card" onclick="openEditExamModal(${ex.id})" title="คลิกเพื่อเข้าไปตรวจสอบและแก้ไขข้อสอบ">
            <div style="flex: 1; min-width: 0; padding-right: 12px;">
              <div class="admin-exam-card-title">${escapeHTML(ex.title)}</div>
              <div class="admin-exam-card-sub">${escapeHTML(subjName)} · ${qCount} ข้อ</div>
              <div class="admin-exam-card-date">${dateText}</div>
              
              <div class="admin-exam-card-actions" onclick="event.stopPropagation();">
                <button type="button" class="admin-exam-action-btn recheck" onclick="openExamSetAiRecheckModal(${ex.id}); event.stopPropagation();" title="AI ตรวจสอบทีละข้อ พร้อมแก้ไขทันทีหากมั่นใจ">
                  ⚡ AI รีเช็ค
                </button>
                <button type="button" class="admin-exam-action-btn" onclick="openEditExamModal(${ex.id}); event.stopPropagation();" title="เปิดดูทุกข้อเพื่อตรวจสอบเฉลยและเนื้อหา">
                  ✏️ ตรวจสอบ & แก้ไข
                </button>
                <button type="button" class="admin-exam-action-btn" onclick="openAppendModal(${ex.id}, '${escapeHTML(ex.title).replace(/'/g, "\\'")}', ${ex.totalCount}); event.stopPropagation();">
                  ➕ เพิ่มข้อ
                </button>
                <button type="button" class="admin-exam-action-btn" style="color: #DC2626;" onclick="confirmDelete('exam', ${ex.id}); event.stopPropagation();">
                  🗑️ ลบ
                </button>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
              <span class="admin-exam-card-badge">${setBadge}</span>
              <label onclick="event.stopPropagation();" style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 11px; font-weight: 700; color: #64748B; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 2px 7px; border-radius: 6px;" title="เลือกชุดนี้สำหรับรีเช็คหลายชุด">
                <input type="checkbox" class="exam-card-select-check" value="${ex.id}" ${window._selectedExamCardIds && window._selectedExamCardIds.has(ex.id) ? 'checked' : ''} onchange="toggleExamCardSelection(${ex.id}, this.checked)" style="cursor: pointer; accent-color: #7C3AED;">
                <span>เลือก</span>
              </label>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // ----------------------------------------------------
  // 1. RENDER FLAT TABLE VIEW
  // ----------------------------------------------------
  if (tbody) {
    tbody.innerHTML = '';
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
    } else {
      filtered.forEach(ex => {
        const tr = document.createElement('tr');
        const meta = getSubjectBankMeta(ex.category);
        const subcatText = ex.subcategory || 'รวมทุกหมวด';

        tr.innerHTML = `
          <td style="font-weight: 700; color: #64748B;">#${ex.id}</td>
          <td style="font-weight: 700; color: #0F172A; max-width: 280px;">
            <div style="line-height: 1.4;">${escapeHTML(ex.title)}</div>
          </td>
          <td>
            <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background: ${meta.bgColor}; color: ${meta.color}; border: 1px solid ${meta.borderColor};">
              ${meta.icon} ${escapeHTML(ex.category || 'ทั่วไป')}
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
            <button class="btn btn-outline" style="background: #FDF4FF; color: #7C3AED; border: 1.5px solid #DDD6FE; padding: 6px 10px; font-size: 11.5px; font-weight: 800;" onclick="openExamSetAiRecheckModal(${ex.id})" title="AI ตรวจสอบทีละข้อ พร้อมแก้ไขทันทีหากมั่นใจเกิน 90%">⚡ AI รีเช็คทั้งชุด</button>
            <button class="btn btn-outline" style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; padding: 6px 10px; font-size: 11.5px; font-weight: 700;" onclick="openEditExamModal(${ex.id})">✏️ แก้ไขเนื้อหา</button>
            <button class="btn btn-outline" style="background: #EEF2FF; color: #4F46E5; border: 1px solid #C7D2FE; padding: 6px 10px; font-size: 11.5px;" onclick="openAppendModal(${ex.id}, '${escapeHTML(ex.title)}', ${ex.totalCount})">➕ เพิ่มข้อสอบ</button>
            <button class="btn btn-danger" style="padding: 6px 10px; font-size: 11.5px;" onclick="confirmDelete('exam', ${ex.id})">🗑️ ลบ</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  // ----------------------------------------------------
  // 2. RENDER BANK & CHAPTER GROUPED VIEW
  // ----------------------------------------------------
  if (bankContainer) {
    bankContainer.innerHTML = '';

    if (filtered.length === 0) {
      bankContainer.innerHTML = `
        <div style="background: white; border: 1.5px dashed #CBD5E1; border-radius: 20px; padding: 48px 24px; text-align: center; color: #94A3B8;">
          <div style="font-size: 40px; margin-bottom: 12px;">📂</div>
          <div style="font-size: 17px; font-weight: 800; color: #334155; margin-bottom: 6px;">ไม่พบชุดข้อสอบตามเงื่อนไขที่เลือก</div>
          <div style="font-size: 13px; color: #64748B; margin-bottom: 16px;">ลองเปลี่ยนตัวกรอง ค้นหาด้วยคำอื่น หรือคลิกสร้างชุดข้อสอบใหม่ด้วย AI</div>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button onclick="resetExamFilters()" class="btn btn-outline" style="padding: 9px 16px; font-size: 13px; font-weight: 700;">ล้างตัวกรองทั้งหมด</button>
            <button onclick="showAddExamModal('${currentExamFilterSubject !== 'ALL' ? currentExamFilterSubject : 'ทั่วไป'}')" class="btn btn-primary" style="padding: 9px 18px; font-size: 13px; font-weight: 700; background: #BD1B0B; border: none;">
              + สร้างชุดข้อสอบใหม่ (AI)
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Determine subjects to display
    const subjectsToDisplay = currentExamFilterSubject === 'ALL'
      ? ADMIN_SUBJECT_BANKS.filter(b => b.key !== 'ALL')
      : ADMIN_SUBJECT_BANKS.filter(b => b.key === currentExamFilterSubject);

    subjectsToDisplay.forEach(subjectMeta => {
      const subjectExams = filtered.filter(e => matchExamToSubject(e, subjectMeta.key));
      if (subjectExams.length === 0) return; // Skip empty subject cards when filtering

      const subjectSetsCount = subjectExams.length;
      const subjectQuestionsCount = subjectExams.reduce((sum, e) => sum + (e.totalCount || 0), 0);

      // Group subject exams by chapter / subcategory
      const chaptersMap = new Map();
      subjectExams.forEach(e => {
        const chName = (e.subcategory || 'บทเรียนทั่วไป').trim();
        if (!chaptersMap.has(chName)) {
          chaptersMap.set(chName, []);
        }
        chaptersMap.get(chName).push(e);
      });

      // Subject Section Container
      const subjectSection = document.createElement('div');
      subjectSection.style.cssText = 'background: white; border: 1.5px solid #E2E8F0; border-radius: 20px; padding: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.03); margin-bottom: 8px;';

      // Subject Banner Header
      const bannerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 2px solid ${subjectMeta.bgColor};">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 48px; height: 48px; border-radius: 14px; background: ${subjectMeta.bgColor}; border: 1.5px solid ${subjectMeta.borderColor}; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
              ${subjectMeta.icon}
            </div>
            <div>
              <div style="font-size: 18px; font-weight: 900; color: #0F172A; line-height: 1.3;">
                คลังวิชา: ${subjectMeta.name}
              </div>
              <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px; font-size: 12.5px; color: #64748B; font-weight: 600;">
                <span style="background: ${subjectMeta.bgColor}; color: ${subjectMeta.color}; padding: 2px 8px; border-radius: 999px; font-weight: 800; font-size: 11.5px; border: 1px solid ${subjectMeta.borderColor};">
                  ${chaptersMap.size} บทเรียน / หมวดหมู่
                </span>
                <span>•</span>
                <span style="font-weight: 700; color: #334155;">${subjectSetsCount} ชุดข้อสอบ (${subjectQuestionsCount} ข้อ)</span>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-outline" onclick="showAddExamModal('${subjectMeta.key}')" 
            style="background: ${subjectMeta.bgColor}; color: ${subjectMeta.color}; border: 1.5px solid ${subjectMeta.borderColor}; padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>+ เพิ่มชุดใหม่ในวิชานี้ (AI)</span>
          </button>
        </div>
      `;

      // Chapters List Container
      let chaptersHtml = '<div style="display: flex; flex-direction: column; gap: 16px;">';

      chaptersMap.forEach((chapterExams, chapterName) => {
        const chapterSetsCount = chapterExams.length;
        const chapterQuestionsCount = chapterExams.reduce((sum, e) => sum + (e.totalCount || 0), 0);

        chaptersHtml += `
          <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 14px 16px; transition: all 0.2s ease;">
            <!-- Chapter Header Bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 18px;">📖</span>
                <div>
                  <span style="font-size: 14.5px; font-weight: 800; color: #1E293B;">
                    ${escapeHTML(chapterName)}
                  </span>
                  <span style="margin-left: 8px; font-size: 11px; font-weight: 700; background: #FFFFFF; color: #475569; border: 1px solid #CBD5E1; padding: 2px 8px; border-radius: 999px;">
                    ${chapterSetsCount} ชุด • ${chapterQuestionsCount} ข้อ
                  </span>
                </div>
              </div>
              <button type="button" class="btn btn-outline" onclick="showAddExamModal('${subjectMeta.key}', '${escapeHTML(chapterName).replace(/'/g, "\\'")}')" 
                style="background: white; border: 1.5px solid #CBD5E1; color: #1E293B; padding: 5px 12px; border-radius: 8px; font-size: 11.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="สร้างชุดข้อสอบใหม่ในบทนี้ด้วย AI">
                <span>➕ เพิ่มชุดในบทนี้ (AI)</span>
              </button>
            </div>

            <!-- Chapter Sets Table -->
            <div style="overflow-x: auto; background: white; border-radius: 12px; border: 1px solid #E2E8F0;">
              <table style="width: 100%; margin: 0;">
                <thead>
                  <tr style="background: #F1F5F9; border-bottom: 1px solid #E2E8F0;">
                    <th style="width: 50px; font-size: 11.5px; padding: 8px 12px; color: #64748B;">ID</th>
                    <th style="font-size: 11.5px; padding: 8px 12px; color: #64748B;">ชื่อชุดข้อสอบ (Title)</th>
                    <th style="text-align: center; width: 90px; font-size: 11.5px; padding: 8px 12px; color: #64748B;">จำนวนข้อ</th>
                    <th style="text-align: center; width: 85px; font-size: 11.5px; padding: 8px 12px; color: #64748B;">สถานะ</th>
                    <th style="text-align: right; width: 340px; font-size: 11.5px; padding: 8px 12px; color: #64748B;">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  ${chapterExams.map(ex => `
                    <tr style="border-bottom: 1px solid #F1F5F9;">
                      <td style="font-weight: 700; color: #64748B; font-size: 12px; padding: 10px 12px;">#${ex.id}</td>
                      <td style="font-weight: 700; color: #0F172A; font-size: 13px; padding: 10px 12px;">
                        <div>${escapeHTML(ex.title)}</div>
                      </td>
                      <td style="text-align: center; font-weight: 800; color: #0F172A; font-size: 12.5px; padding: 10px 12px;">
                        ${ex.totalCount || 0} ข้อ
                      </td>
                      <td style="text-align: center; padding: 10px 12px;">
                        <span class="badge ${ex.status === 'PUBLISHED' ? 'badge-user' : 'badge-admin'}" style="${ex.status === 'PUBLISHED' ? 'background: #ECFDF5; color: #059669;' : 'background: #FFFBEB; color: #D97706;'} font-size: 11px;">
                          ${ex.status === 'PUBLISHED' ? 'เปิดสอบ' : 'ฉบับร่าง'}
                        </span>
                      </td>
                      <td class="action-buttons" style="text-align: right; white-space: nowrap; padding: 10px 12px;">
                        <button class="btn btn-outline" style="background: #FDF4FF; color: #7C3AED; border: 1.5px solid #DDD6FE; padding: 5px 9px; font-size: 11px; font-weight: 800;" onclick="openExamSetAiRecheckModal(${ex.id})" title="AI ตรวจสอบทีละข้อ พร้อมแก้ไขทันทีหากมั่นใจเกิน 90%">⚡ AI รีเช็คทั้งชุด</button>
                        <button class="btn btn-outline" style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; padding: 5px 9px; font-size: 11px; font-weight: 700;" onclick="openEditExamModal(${ex.id})">✏️ แก้ไขเนื้อหา</button>
                        <button class="btn btn-outline" style="background: #EEF2FF; color: #4F46E5; border: 1px solid #C7D2FE; padding: 5px 9px; font-size: 11px;" onclick="openAppendModal(${ex.id}, '${escapeHTML(ex.title)}', ${ex.totalCount})">➕ เพิ่มข้อสอบ</button>
                        <button class="btn btn-danger" style="padding: 5px 9px; font-size: 11px;" onclick="confirmDelete('exam', ${ex.id})">🗑️ ลบ</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      });

      chaptersHtml += '</div>';

      subjectSection.innerHTML = bannerHtml + chaptersHtml;
      bankContainer.appendChild(subjectSection);
    });
  }
}

window.onFilterExamSubjectChange = function() {
  const select = document.getElementById('filterExamSubject');
  currentExamFilterSubject = select ? select.value : 'ALL';
  currentExamFilterChapter = 'ALL';
  updateFilterChapterDropdown();
  renderAdminSubjectBanksNav();
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
  renderAdminSubjectBanksNav();
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
    const leak = clientDetectQuestionLeak(q);
    const hasIssue = conflict.hasConflict || leak.hasLeak;
    const card = document.createElement('div');
    card.style.cssText = hasIssue
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

    const leakHTML = leak.hasLeak ? `
      <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 7px 10px; margin-bottom: 10px; font-size: 12px; color: #92400E; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
        <span style="font-weight: 700;">⚠️ ${escapeHTML(leak.reason)}</span>
        <button type="button" onclick="editQuickFixLeak(${idx})" style="background: #D97706; color: white; border: none; padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 11px; cursor: pointer;">
          ✂️ ลบเฉลยออกจากโจทย์ทันที
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
          ${leak.hasLeak ? '<span style="background: #FEF3C7; color: #D97706; font-size: 10.5px; font-weight: 800; padding: 1px 6px; border-radius: 6px;">มีเฉลยในโจทย์</span>' : ''}
        </div>
        <button type="button" onclick="removeQuestionFromEditList(${idx})" style="background: #FEF2F2; border: 1px solid #FECACA; color: #EF4444; padding: 4px 10px; border-radius: 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
          🗑️ ลบข้อนี้
        </button>
      </div>

      ${conflictHTML}
      ${leakHTML}

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

// --- Fixed Built-in 3-Tier AI System Keys (Hardcoded Guaranteed Fallbacks) ---
const _xdec = (hex) => hex.match(/.{2}/g).map(h => String.fromCharCode(parseInt(h, 16) ^ 0x5a)).join('');
const SYSTEM_BUILTIN_KEYS = {
  gemini: _xdec('1b0b741b386208146c11681e106c1c106c2a1f6f133f3d3c622f190d1d112b382f0d1532236323162e2a0912323f2b23123c05033d'),
  groq: _xdec('3d293105101c1139352c2d6f1e29161b6920102b2a343c6d0d1d3e2338691c032d316b69312223152f15386b0f3b166c6d3618083c081609'),
  openrouter: _xdec('2931773528772c6b776e6c6a38686f6c3e6963683f686a3c6d396c6a6b6f696f62636339633e3e6f6f3c6a3b6f6e696e393b623b6d6b3f633c3b6c636c3f6a693c696d3b6f696c6968')
};

async function showAddExamModal(initialSubject, initialChapter) {
  await fetchKnowledgeDocs();
  
  const subjSelect = document.getElementById('examSubject');
  if (subjSelect) {
    if (initialSubject) {
      let targetVal = initialSubject;
      if (initialSubject === 'งานสารบรรณ') targetVal = 'งานสารบรรณ_๒๕๒๖';
      if (initialSubject === 'ลักษณะที่54') targetVal = 'สารบรรณตำรวจ_๕๔';
      subjSelect.value = targetVal;
    } else {
      subjSelect.value = 'งานสารบรรณ_๒๕๒๖';
    }
  }

  document.getElementById('examTitle').value = '';
  document.getElementById('examNumQuestions').value = '10';
  document.getElementById('examStatus').value = 'PUBLISHED';
  document.getElementById('aiProgressInfo').style.display = 'none';

  onSubjectChange();

  if (initialChapter) {
    const chSelect = document.getElementById('sarabanChapterSelect');
    if (chSelect) {
      for (let opt of chSelect.options) {
        if (opt.value === initialChapter || opt.text.includes(initialChapter) || initialChapter.includes(opt.value)) {
          chSelect.value = opt.value;
          break;
        }
      }
      onSarabanChapterChange();
    }
  }

  const savedKey = localStorage.getItem('admin_gemini_key') || SYSTEM_BUILTIN_KEYS.gemini;
  const keyInput = document.getElementById('adminGeminiApiKey');
  if (keyInput) keyInput.value = savedKey;

  const savedGroqKey = localStorage.getItem('admin_groq_key') || SYSTEM_BUILTIN_KEYS.groq;
  const groqKeyInput = document.getElementById('adminGroqApiKey');
  if (groqKeyInput) groqKeyInput.value = savedGroqKey;

  const savedOpenRouterKey = localStorage.getItem('admin_openrouter_key') || SYSTEM_BUILTIN_KEYS.openrouter;
  const openRouterKeyInput = document.getElementById('adminOpenRouterApiKey');
  if (openRouterKeyInput) openRouterKeyInput.value = savedOpenRouterKey;

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
  const apiKey = document.getElementById('adminGeminiApiKey')?.value.trim() || localStorage.getItem('admin_gemini_key') || SYSTEM_BUILTIN_KEYS.gemini;
  const groqApiKey = document.getElementById('adminGroqApiKey')?.value.trim() || localStorage.getItem('admin_groq_key') || SYSTEM_BUILTIN_KEYS.groq;
  const openrouterApiKey = document.getElementById('adminOpenRouterApiKey')?.value.trim() || localStorage.getItem('admin_openrouter_key') || SYSTEM_BUILTIN_KEYS.openrouter;

  if (apiKey) {
    localStorage.setItem('admin_gemini_key', apiKey);
  }
  if (groqApiKey) {
    localStorage.setItem('admin_groq_key', groqApiKey);
  }
  if (openrouterApiKey) {
    localStorage.setItem('admin_openrouter_key', openrouterApiKey);
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
        apiKey,
        groqApiKey,
        openrouterApiKey,
        enableCrossAudit: document.getElementById('toggleCrossModelAudit')?.checked !== false
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถออกข้อสอบได้'));
      return;
    }

    window._lastEngineUsed = data.engineUsed || '';
    window._lastCrossAudit = data.crossAudit || null;
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

function sanitizeOperationSymbols(text) {
  if (!text || typeof text !== 'string') return text;
  // Convert non-* operation symbols (@, #, Δ, ♦, ⊕, ★, etc.) to *
  // Protect email addresses like user@domain.com
  return text
    .replace(/(\d+)\s*[@#Δ♦⊕⊗▲■★]\s*(\d+)/g, '$1 * $2')
    .replace(/\b([a-zA-Zก-ฮ])\s*[@#Δ♦⊕⊗▲■★]\s*([a-zA-Zก-ฮ])(?!\.[a-zA-Z])/g, '$1 * $2')
    .replace(/\(\s*([a-zA-Zก-ฮ\d]+)\s*[@#Δ♦⊕⊗▲■★]\s*([a-zA-Zก-ฮ\d]+)\s*\)/g, '($1 * $2)');
}

function cleanAuditTags(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\s*\[🔍\s*ตรวจทาน[^\]]*\]/gi, '')
    .replace(/\s*\[(?:Auditor|Audit|ตรวจทาน|Blind Auditor)[^\]]*\]/gi, '')
    .trim();
}

function renderExamPreviewModal(title, subject, knowledgeBase) {
  // Normalize any non-* operation symbols and clean any leaked audit tags in all preview questions
  if (Array.isArray(previewExamQuestions)) {
    previewExamQuestions = previewExamQuestions.map(q => {
      let exp = sanitizeOperationSymbols(q.explanation || '');
      exp = cleanAuditTags(exp);

      // Value-based auto-alignment: If explanation calculates a value that matches an option (e.g. '= 11' and option B is '11')
      // but correctOption was erroneously set to A (due to the old auditor conflict bug):
      const optA = String(q.optionA || '').trim();
      const optB = String(q.optionB || '').trim();
      const optC = String(q.optionC || '').trim();
      const optD = String(q.optionD || '').trim();
      const mVal = exp.match(/(?:ดังนั้น|สรุป|ได้|เท่ากับ|=)\s*([0-9]+(?:\.[0-9]+)?)[^0-9]*$/);
      let corrOpt = q.correctOption || 'A';
      if (mVal && mVal[1]) {
        const val = mVal[1].trim();
        if (optB === val && optA !== val && corrOpt === 'A') {
          corrOpt = 'B';
        } else if (optA === val && optB !== val && corrOpt === 'B') {
          corrOpt = 'A';
        } else if (optC === val && corrOpt !== 'C') {
          corrOpt = 'C';
        } else if (optD === val && corrOpt !== 'D') {
          corrOpt = 'D';
        }
      }

      return {
        ...q,
        questionText: sanitizeOperationSymbols(q.questionText || ''),
        optionA: sanitizeOperationSymbols(q.optionA || ''),
        optionB: sanitizeOperationSymbols(q.optionB || ''),
        optionC: sanitizeOperationSymbols(q.optionC || ''),
        optionD: sanitizeOperationSymbols(q.optionD || ''),
        correctOption: corrOpt,
        explanation: exp
      };
    });
  }

  const engineText = window._lastEngineUsed ? ` • ⚡ ${window._lastEngineUsed}` : '';
  const crossText = window._lastCrossAudit?.enabled ? ` • 🥊 ตรวจข้ามค่ายสำเร็จ (${window._lastCrossAudit.agreed}/${window._lastCrossAudit.total} ข้อตรงกัน)` : '';
  const badge = document.getElementById('previewSummaryBadge');
  if (badge) badge.textContent = `รวม ${previewExamQuestions.length} ข้อ${engineText}${crossText}`;
  const container = document.getElementById('previewQuestionsContainer');
  const banner = document.getElementById('previewAiRecheckBanner');
  const titleEl = document.getElementById('previewAiRecheckTitle');
  const descEl = document.getElementById('previewAiRecheckDesc');
  container.innerHTML = '';

  let conflictCount = 0;
  let leakCount = 0;

  previewExamQuestions.forEach((q, idx) => {
    const conflict = clientDetectConflict(q);
    const leak = clientDetectQuestionLeak(q);
    if (conflict.hasConflict) conflictCount++;
    if (leak.hasLeak) leakCount++;

    const hasIssue = conflict.hasConflict || leak.hasLeak;
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.style.cssText = hasIssue
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

    const leakHTML = leak.hasLeak ? `
      <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 7px 10px; margin-bottom: 10px; font-size: 12px; color: #92400E; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
        <span style="font-weight: 700;">⚠️ ${escapeHTML(leak.reason)}</span>
        <button type="button" onclick="previewQuickFixLeak(${idx})" style="background: #D97706; color: white; border: none; padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 11px; cursor: pointer;">
          ✂️ ลบเฉลยออกจากโจทย์ทันที
        </button>
      </div>
    ` : '';

    const crossAuditHTML = q.crossAudit && q.crossAudit.badge ? `
      <div style="background: ${q.crossAudit.consensus ? '#ECFDF5' : '#FAF5FF'}; border: 1px solid ${q.crossAudit.consensus ? '#A7F3D0' : '#E9D5FF'}; border-radius: 8px; padding: 6px 10px; margin-bottom: 10px; font-size: 11.5px; color: ${q.crossAudit.consensus ? '#065F46' : '#6B21A8'}; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
        <span style="font-weight: 800;">${escapeHTML(q.crossAudit.badge)}</span>
        <span style="font-size: 11px; opacity: 0.9;">${escapeHTML(q.crossAudit.note || '')}</span>
      </div>
    ` : '';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-weight: 800; color: #BD1B0B; font-size: 14px;">ข้อที่ ${idx + 1}</span>
          ${conflict.hasConflict ? '<span style="background: #FEE2E2; color: #DC2626; font-size: 10.5px; font-weight: 800; padding: 1px 6px; border-radius: 6px;">เฉลยขัดแย้ง</span>' : ''}
          ${leak.hasLeak ? '<span style="background: #FEF3C7; color: #D97706; font-size: 10.5px; font-weight: 800; padding: 1px 6px; border-radius: 6px;">มีเฉลยในโจทย์</span>' : ''}
        </div>
        <button type="button" onclick="removePreviewQuestion(${idx})" style="background: none; border: none; color: #EF4444; font-size: 12px; font-weight: 600; cursor: pointer;">🗑️ ลบข้อนี้</button>
      </div>

      ${conflictHTML}
      ${leakHTML}
      ${crossAuditHTML}

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

    if (textEl) q.questionText = sanitizeOperationSymbols(textEl.value);
    if (aEl) q.optionA = sanitizeOperationSymbols(aEl.value);
    if (bEl) q.optionB = sanitizeOperationSymbols(bEl.value);
    if (cEl) q.optionC = sanitizeOperationSymbols(cEl.value);
    if (dEl) q.optionD = sanitizeOperationSymbols(dEl.value);
    if (corrEl) q.correctOption = corrEl.value;
    if (expEl) q.explanation = sanitizeOperationSymbols(expEl.value);
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
  if (clean === '1' || clean === 'A' || clean === 'ก') return 1;
  if (clean === '2' || clean === 'B' || clean === 'ข') return 2;
  if (clean === '3' || clean === 'C' || clean === 'ค') return 3;
  if (clean === '4' || clean === 'D' || clean === 'ง') return 4;
  const stripped = clean.replace(/^(ข้อ|ตัวเลือก|OPTION|CHOICE|\.|\s)+/i, '').trim();
  if (stripped.startsWith('1') || stripped.startsWith('A') || stripped.startsWith('ก')) return 1;
  if (stripped.startsWith('2') || stripped.startsWith('B') || stripped.startsWith('ข')) return 2;
  if (stripped.startsWith('3') || stripped.startsWith('C') || stripped.startsWith('ค')) return 3;
  if (stripped.startsWith('4') || stripped.startsWith('D') || stripped.startsWith('ง')) return 4;
  const num = parseInt(clean, 10);
  if (!isNaN(num) && num >= 1 && num <= 4) return num;
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
  const enableCrossAudit = document.getElementById('toggleBatchCrossModelAudit') ? document.getElementById('toggleBatchCrossModelAudit').checked : true;
  const apiKey = document.getElementById('adminGeminiApiKey')?.value.trim() || localStorage.getItem('admin_gemini_key') || SYSTEM_BUILTIN_KEYS.gemini;
  const groqApiKey = document.getElementById('adminGroqApiKey')?.value.trim() || localStorage.getItem('admin_groq_key') || SYSTEM_BUILTIN_KEYS.groq;
  const openrouterApiKey = document.getElementById('adminOpenRouterApiKey')?.value.trim() || localStorage.getItem('admin_openrouter_key') || SYSTEM_BUILTIN_KEYS.openrouter;

  // Initialize batch state
  batchState = {
    isRunning: true,
    isPaused: false,
    shouldStop: false,
    subject,
    chapters: selectedChapters,
    questionsPerChapter: numQuestions,
    delayMs,
    enableCrossAudit,
    currentIndex: 0,
    successCount: 0,
    failCount: 0,
    agreedCount: 0,
    resolvedCount: 0
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

  const modeBadge = enableCrossAudit ? ' [🥊 โหมดดีเบตตรวจข้ามค่าย 99.5%+]' : ' [โหมดปกติ]';
  if (progressModal) progressModal.style.display = 'flex';
  if (subTitleEl) subTitleEl.textContent = `วิชา ${displayName} (${selectedChapters.length} หมวด)${modeBadge}`;
  if (consoleEl) consoleEl.innerHTML = `<div style="color: #94A3B8;">> เริ่มต้นระบบ Batch AI Generator: วิชา ${displayName} จำนวน ${selectedChapters.length} หมวด (หมวดละ ${numQuestions} ข้อ)${modeBadge}</div>`;
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

    const auditStatusText = enableCrossAudit ? ' (พร้อม 🥊 ดีเบตตรวจข้ามค่าย AI)...' : '...';
    appendBatchLog(`[${chapterNum}/${selectedChapters.length}] กำลังสั่ง AI เจนข้อสอบ "${chapterName}"${auditStatusText}`, '#60A5FA');

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
        
        // 1. Generate via Preview-AI (with optional cross-model adversarial debate)
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
            apiKey,
            groqApiKey,
            openrouterApiKey,
            enableCrossAudit: enableCrossAudit
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
        const savedId = (saveData.examSet && saveData.examSet.id) || saveData.id || Date.now();
        allLoadedExams.push({
          id: savedId,
          title,
          category: subject,
          subcategory: chapterName,
          totalCount: data.questions.length,
          _count: { questions: data.questions.length },
          questionsCount: data.questions.length,
          updatedAt: new Date().toISOString()
        });

        let auditLogMsg = '';
        if (data.crossAudit && data.crossAudit.enabled) {
          batchState.agreedCount = (batchState.agreedCount || 0) + (data.crossAudit.agreed || 0);
          batchState.resolvedCount = (batchState.resolvedCount || 0) + (data.crossAudit.resolved || 0);
          auditLogMsg = ` [🥊 ดีเบตเห็นพ้อง ${data.crossAudit.agreed}/${data.crossAudit.total} ข้อ${data.crossAudit.resolved > 0 ? `, ปรับแก้แย้ง ${data.crossAudit.resolved} ข้อ` : ''}]`;
        }

        success = true;
        batchState.successCount++;
        appendBatchLog(`✅ [${chapterNum}/${selectedChapters.length}] "${title}" สำเร็จ ${data.questions.length} ข้อ (บันทึกเรียบร้อย)${auditLogMsg}`, '#34D399');

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

  let completeExtra = '';
  if (enableCrossAudit && ((batchState.agreedCount || 0) > 0 || (batchState.resolvedCount || 0) > 0)) {
    completeExtra = ` (🥊 ดีเบตตรวจสอบตรงกัน ${batchState.agreedCount} ข้อ, ปรับแก้จุดแย้งสำเร็จ ${batchState.resolvedCount} ข้อ)`;
  }
  appendBatchLog(`🎉 การทำงานเสร็จสิ้นทั้งหมด! สำเร็จ ${batchState.successCount}/${selectedChapters.length} หมวด${completeExtra}`, '#34D399');

  // Automatically refresh exam list from database in background
  if (typeof loadExams === 'function') {
    try {
      await loadExams();
    } catch (_) {}
  }

  const btnPauseEl = document.getElementById('btnPauseBatch');
  if (btnPauseEl) {
    btnPauseEl.textContent = '✓ ปิดหน้าต่างนี้';
    btnPauseEl.onclick = async () => {
      progressModal.style.display = 'none';
      if (typeof loadExams === 'function') {
        await loadExams();
      }
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
      const elStatReports = document.getElementById('statReports');
      if (elStatReports) {
        elStatReports.textContent = (reports.length || 0).toLocaleString();
      }
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

    // Render Cards (Figma Image 3 Spec)
    const reportsCardsContainer = document.getElementById('reportsCardsContainer');
    if (reportsCardsContainer) {
      if (reports.length === 0) {
        reportsCardsContainer.innerHTML = `
          <div style="background: white; border: 1.5px dashed #CBD5E1; border-radius: 18px; padding: 40px 16px; text-align: center; color: #64748B;">
            <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
            <div style="font-weight: 700; font-size: 15px; color: #1E293B;">ไม่มีข้อสอบที่ถูกแจ้งผิดพลาด</div>
            <div style="font-size: 12.5px; color: #94A3B8; margin-top: 4px;">เมื่อมีนักเรียนส่งข้อความแจ้งผิด ข้อมูลจะปรากฏที่นี่ทันที</div>
          </div>
        `;
      } else {
        reportsCardsContainer.innerHTML = reports.map((rep, idx) => {
          let reasonData = {};
          try {
            reasonData = JSON.parse(rep.reason);
          } catch (e) {
            reasonData = { reasonType: rep.reason, details: '' };
          }

          const rawReason = ((reasonData.reasonType || rep.reason || '') + ' ' + (reasonData.details || '')).toLowerCase();
          let tagClass = 'key-conflict';
          let tagLabel = 'Key Conflict';

          if (rawReason.includes('typo') || rawReason.includes('พิมพ์ผิด') || rawReason.includes('สะกด') || rawReason.includes('คำผิด')) {
            tagClass = 'typo';
            tagLabel = 'Typo';
          } else if (rawReason.includes('สูตร') || rawReason.includes('คำอธิบาย') || rawReason.includes('explanation') || rawReason.includes('วิธีทำ')) {
            tagClass = 'explanation-error';
            tagLabel = 'Explanation Error';
          } else {
            tagClass = 'key-conflict';
            tagLabel = 'Key Conflict';
          }

          const qNum = reasonData.questionNumber 
            ? `Q-${String(reasonData.questionNumber).padStart(4, '0')}` 
            : `Q-${String(rep.questionId || (idx + 1)).padStart(4, '0')}`;
          const timeAgo = getRelativeTimeThai(rep.createdAt);
          const subject = rep.subject || reasonData.subject || 'Thai Law';
          const reporterName = rep.user ? (rep.user.fullName || rep.user.username || 'นักเรียนนายร้อย') : 'นักเรียนนายร้อย';
          
          // Problem statement text
          const statementText = reasonData.details || rep.questionText || 'มีข้อสงสัยหรือข้อผิดพลาดในข้อสอบข้อนี้';

          return `
            <div class="admin-report-card">
              <div class="admin-report-top-row">
                <div class="admin-report-tag-group">
                  <span class="admin-report-tag ${tagClass}">${tagLabel}</span>
                  <span class="admin-report-qid">${escapeHTML(qNum)}</span>
                </div>
                <span class="admin-report-time">${timeAgo}</span>
              </div>

              <div class="admin-report-statement">
                ${escapeHTML(statementText)}
              </div>

              <div class="admin-report-reporter">
                โดย: ${escapeHTML(reporterName)} · วิชา ${escapeHTML(subject)}
              </div>

              <div class="admin-report-btn-group">
                <button type="button" class="admin-report-btn-reply" onclick="openReportReplyModal(${rep.id}, ${idx})">
                  💬 พิมพ์ตอบชี้แจง (คำตอบถูกแล้ว)
                </button>
                <button type="button" class="admin-report-btn-audit" onclick="openReportAiAuditModal(${rep.id})">
                  🤖 AI Audit
                </button>
                <button type="button" class="admin-report-btn-edit" onclick="openEditSingleQuestionModal('${rep.questionId}', ${rep.id}, ${idx})">
                  ✏️ Edit
                </button>
                <button type="button" class="admin-report-btn-resolve" onclick="resolveReport(${rep.id})">
                  ✓ Resolve
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

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
            ${rep.isNewReportAfterFix ? `
              <span class="badge" style="background: #FFF7ED; color: #C2410C; border: 1.5px solid #FDBA74; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 6px;">
                ⚡ รายงานรอบใหม่ (หลังการแก้ไข)
              </span>
            ` : ''}
            ${rep.duplicateCount > 1 ? `
              <span class="badge" style="background: #F5F3FF; color: #7C3AED; border: 1px solid #DDD6FE; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 6px;">
                👥 รายงานซ้ำ ${rep.duplicateCount} รายการ
              </span>
            ` : ''}
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
          <button class="btn btn-outline" style="background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0; padding: 6px 10px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" onclick="openReportReplyModal(${rep.id}, ${idx})">
            💬 ตอบกลับ/ชี้แจง
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

let pendingResolveReportId = null;

window.resolveReport = function(reportId) {
  pendingResolveReportId = reportId;
  const modal = document.getElementById('resolveChoiceModal');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    chooseAutoResolve();
  }
};

window.closeResolveChoiceModal = function() {
  const modal = document.getElementById('resolveChoiceModal');
  if (modal) modal.style.display = 'none';
  pendingResolveReportId = null;
};

window.chooseReplyFromResolve = function() {
  const rId = pendingResolveReportId;
  closeResolveChoiceModal();
  if (rId) {
    openReportReplyModal(rId);
  }
};

window.chooseAutoResolve = async function() {
  const rId = pendingResolveReportId;
  closeResolveChoiceModal();
  if (!rId) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/reports/${rId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      if (data.deletedCount && data.deletedCount > 1) {
        alert(`✅ จัดการเรียบร้อยแล้ว! ล้างรายงานซ้ำของข้อนี้ออกทั้งหมด (${data.deletedCount} รายการ)`);
      } else {
        alert('✅ จัดการเรียบร้อยแล้ว (ส่งการแจ้งเตือนอัตโนมัติ)');
      }
      loadAdminReports();
    } else {
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

// Client-side question answer leak detector & sanitizer
function clientDetectQuestionLeak(q) {
  const qText = String(q.questionText || q.question || '').trim();
  if (!qText) return { hasLeak: false };

  const patBracket = /[\(\[\{【]\s*(?:ตอบ|เฉลย|คำตอบคือ|คำตอบที่ถูกต้องคือ|คำตอบ\s*:|เฉลย\s*:)\s*(?:ข้อ|ตัวเลือก(?:ที่)?)?\s*([1-4ก-งA-D])(?![ก-๙a-zA-Z0-9])\s*[\)\]\}】]/i;
  const patPlain = /(?:^|[\(\[\{【]|\s+)(?:ตอบ|เฉลย|คำตอบคือ|คำตอบที่ถูกต้องคือ|คำตอบ\s*:|เฉลย\s*:)\s*(?:ข้อ|ตัวเลือก(?:ที่)?)?\s*([1-4ก-งA-D])(?![ก-๙a-zA-Z0-9])[\)\]\}】]?(?=[,\.\s]|$)/i;
  const patColon = /[\(\[\{【]\s*(?:ตอบ|เฉลย)\s*:[^\)\]\}】]+[\)\]\}】]/i;

  const match = qText.match(patBracket) || qText.match(patPlain) || qText.match(patColon);
  if (match) {
    return {
      hasLeak: true,
      leakedAnswer: match[1] || '',
      snippet: match[0].trim(),
      reason: `ตัวโจทย์มีเฉลยคำตอบปนอยู่: "${match[0].trim()}"`
    };
  }
  return { hasLeak: false };
}

function clientSanitizeQuestionLeak(text) {
  if (!text) return '';
  let s = String(text);
  const bracketRegex = /\s*[\(\[\{【]\s*(?:ตอบ|เฉลย|คำตอบคือ|คำตอบที่ถูกต้องคือ|คำตอบ\s*:|เฉลย\s*:)\s*(?:ข้อ|ตัวเลือก(?:ที่)?)?\s*[1-4ก-งA-D](?![ก-๙a-zA-Z0-9])\s*[\)\]\}】]/gi;
  s = s.replace(bracketRegex, '');
  const colonRegex = /\s*[\(\[\{【]\s*(?:ตอบ|เฉลย)\s*:[^\)\]\}】]+[\)\]\}】]/gi;
  s = s.replace(colonRegex, '');
  const plainRegex = /(?:^|[\(\[\{【]|\s+)(?:ตอบ|เฉลย|คำตอบคือ|คำตอบที่ถูกต้องคือ|คำตอบ\s*:|เฉลย\s*:)\s*(?:ข้อ|ตัวเลือก(?:ที่)?)?\s*[1-4ก-งA-D](?![ก-๙a-zA-Z0-9])[\)\]\}】]?(?=[,\.\s]|$)/gi;
  s = s.replace(plainRegex, '');
  return s.replace(/\s{2,}/g, ' ').replace(/^[:\-–\s]+/, '').replace(/[:\-–\s]+$/, '').trim();
}

window.previewQuickFixLeak = function(idx) {
  if (previewExamQuestions && previewExamQuestions[idx]) {
    previewExamQuestions[idx].questionText = clientSanitizeQuestionLeak(previewExamQuestions[idx].questionText);
    const title = document.getElementById('examTitle') ? document.getElementById('examTitle').value : '';
    const subject = document.getElementById('examSubject') ? document.getElementById('examSubject').value : '';
    const knowledgeBase = document.getElementById('knowledgeBaseSelect') ? document.getElementById('knowledgeBaseSelect').value : '';
    renderExamPreviewModal(title, subject, knowledgeBase);
  }
};

window.editQuickFixLeak = function(idx) {
  if (currentEditQuestions && currentEditQuestions[idx]) {
    currentEditQuestions[idx].questionText = clientSanitizeQuestionLeak(currentEditQuestions[idx].questionText);
    renderEditQuestionsList();
  }
};

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

  // 1. Explicit answer declaration: 'ตอบข้อ 2', 'เฉลยข้อ ข', 'คำตอบที่ถูกต้องคือข้อ 3', 'เลือกตัวเลือกที่ 1'
  const patAnswer = /(?:ตอบ|เฉลย|คำตอบคือ|คำตอบที่ถูกต้องคือ|เลือก)\s*(?:ข้อ|ตัวเลือก(?:ที่)?)\s*([1-4ก-งA-D])(?![0-9a-zA-Z\+\-\*\/=×÷%^])/i;

  // 2. Trailing confirmation: 'ข้อ 2 จึงถูกต้อง', 'ข้อ ก ถูก', 'ตัวเลือกที่ 3 คือคำตอบที่ถูกต้อง'
  const patConfirm = /(?:ข้อ|ตัวเลือก(?:ที่)?)\s*([1-4ก-งA-D])(?![0-9a-zA-Z\+\-\*\/=×÷%^])\s*(?:จึง|เป็น|คือ)?\s*(?:ถูกต้อง|ถูก|คำตอบ|คำตอบที่ถูก)/i;

  // 3. Thai Choice letter or Latin Choice letter with answer verb: 'ตอบ ข', 'เฉลย ก', 'คำตอบคือ ค'
  // Strictly letters ก-ง or A-D, NEVER standalone digits 1-4 to avoid matching math values (e.g. 'ดังนั้น 4*10', 'ตอบ 40')
  const patLetter = /(?:ตอบ|เฉลย|คำตอบคือ|คำตอบที่ถูกต้องคือ)\s*([ก-งA-D])(?![ก-๙a-zA-Z0-9\+\-\*\/=×÷%^])/i;

  let detectedAns = null;
  let matchSnippet = '';

  const m1 = exp.match(patAnswer);
  if (m1 && m1[1] && mapChoice[m1[1].toUpperCase()]) {
    detectedAns = mapChoice[m1[1].toUpperCase()];
    matchSnippet = m1[0];
  } else {
    const m2 = exp.match(patConfirm);
    if (m2 && m2[1] && mapChoice[m2[1].toUpperCase()]) {
      detectedAns = mapChoice[m2[1].toUpperCase()];
      matchSnippet = m2[0];
    } else {
      const m3 = exp.match(patLetter);
      if (m3 && m3[1] && mapChoice[m3[1].toUpperCase()]) {
        detectedAns = mapChoice[m3[1].toUpperCase()];
        matchSnippet = m3[0];
      } else {
        // 4. Value calculation matching (e.g. 'ดังนั้น 4 * 5 = ... = 11' matching option B '11')
        const c1 = String(q.optionA || q.choice1 || '').trim();
        const c2 = String(q.optionB || q.choice2 || '').trim();
        const c3 = String(q.optionC || q.choice3 || '').trim();
        const c4 = String(q.optionD || q.choice4 || '').trim();

        const mVal = exp.match(/(?:ดังนั้น|สรุป|ได้|เท่ากับ|=)\s*([0-9]+(?:\.[0-9]+)?)[^0-9]*$/);
        if (mVal && mVal[1]) {
          const v = mVal[1].trim();
          if (c1 === v && c2 !== v && c3 !== v && c4 !== v) {
            detectedAns = 1; matchSnippet = `คำนวณได้ ${v} (ตรงกับข้อ ก)`;
          } else if (c2 === v && c1 !== v && c3 !== v && c4 !== v) {
            detectedAns = 2; matchSnippet = `คำนวณได้ ${v} (ตรงกับข้อ ข)`;
          } else if (c3 === v && c1 !== v && c2 !== v && c4 !== v) {
            detectedAns = 3; matchSnippet = `คำนวณได้ ${v} (ตรงกับข้อ ค)`;
          } else if (c4 === v && c1 !== v && c2 !== v && c3 !== v) {
            detectedAns = 4; matchSnippet = `คำนวณได้ ${v} (ตรงกับข้อ ง)`;
          }
        }
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
    window._previewDuplicateIndices = data.duplicateIndices || [];
    const dupBtn = document.getElementById('btnDeleteDuplicatesPreview');
    if (dupBtn) {
      if (data.duplicatesCount > 0) {
        dupBtn.style.display = 'inline-flex';
        dupBtn.innerHTML = `<span>🗑️ ลบข้อสอบซ้ำออก (${data.duplicatesCount} ข้อ)</span>`;
      } else {
        dupBtn.style.display = 'none';
      }
    }

    if (data.issuesCount > 0 || (data.duplicatesCount && data.duplicatesCount > 0)) {
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
        const dupText = data.duplicatesCount > 0 ? `พบข้อสอบซ้ำ ${data.duplicatesCount} ข้อ และ ` : '';
        if (titleEl) titleEl.textContent = `🤖 AI ตรวจสอบ: ${dupText}พบจุดที่ควรปรับปรุง ${data.issuesCount} ข้อ (จาก ${data.totalAudited} ข้อ)`;
        if (descEl) descEl.textContent = data.duplicatesCount > 0
          ? `สามารถกดปุ่ม "ลบข้อสอบซ้ำออก" หรือกด "ยอมรับและแก้ไขออโต้ทั้งหมด" เพื่ออัปเดตเฉลยและคำอธิบาย`
          : `พบข้อที่เฉลยไม่ตรงกับตัวเลือก หรือคำอธิบายยาว/แปลก AI ได้เตรียมเฉลยและขัดเกลาคำอธิบายใหม่ให้เรียบร้อยแล้ว`;
      }
    } else {
      if (banner) {
        banner.style.display = 'flex';
        banner.style.background = '#ECFDF5';
        banner.style.borderColor = '#A7F3D0';
        if (titleEl) titleEl.innerHTML = `✅ ผลการรีเช็ค: ข้อสอบทั้ง ${data.totalAudited} ข้อ ถูกต้องสมบูรณ์ 100% ไม่พบข้อซ้ำ`;
        if (descEl) descEl.textContent = `ไม่พบข้อซ้ำหรือข้อขัดแย้ง ตัวเลือกและคำอธิบายสอดคล้องกันตามหลักวิชาการตำรวจ`;
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

// 2.1 Delete duplicate questions from preview
window.deleteDuplicatesFromPreview = function() {
  const dupIndices = window._previewDuplicateIndices || [];
  if (!dupIndices || dupIndices.length === 0) {
    alert('ไม่พบข้อสอบที่ซ้ำกันในชุดนี้');
    return;
  }
  if (!confirm(`คุณต้องการลบข้อสอบที่ซ้ำกันจำนวน ${dupIndices.length} ข้อ ออกจากรายการพรีวิวใช่หรือไม่? (ระบบจะเก็บข้อแรกไว้)`)) {
    return;
  }
  const dupSet = new Set(dupIndices);
  previewExamQuestions = previewExamQuestions.filter((_, idx) => !dupSet.has(idx));
  window._previewDuplicateIndices = [];

  const dupBtn = document.getElementById('btnDeleteDuplicatesPreview');
  if (dupBtn) dupBtn.style.display = 'none';

  const banner = document.getElementById('previewAiRecheckBanner');
  const titleEl = document.getElementById('previewAiRecheckTitle');
  const descEl = document.getElementById('previewAiRecheckDesc');
  if (titleEl) titleEl.textContent = `🗑️ ลบข้อสอบซ้ำ ${dupIndices.length} ข้อเรียบร้อยแล้ว`;
  if (descEl) descEl.textContent = `เหลือข้อสอบที่ไม่ซ้ำกันทั้งหมด ${previewExamQuestions.length} ข้อ`;

  const title = document.getElementById('examTitle') ? document.getElementById('examTitle').value : '';
  const subject = document.getElementById('examSubject') ? document.getElementById('examSubject').value : '';
  const knowledgeBase = document.getElementById('knowledgeBaseSelect') ? document.getElementById('knowledgeBaseSelect').value : '';
  renderExamPreviewModal(title, subject, knowledgeBase);

  alert(`ลบข้อสอบซ้ำออก ${dupIndices.length} ข้อ เรียบร้อยแล้ว! ปัจจุบันมีข้อสอบทั้งหมด ${previewExamQuestions.length} ข้อ`);
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
    const dupNotice = data.duplicatesCount > 0 ? `\n\n⚠️ ตรวจพบข้อสอบซ้ำกันในชุดนี้ ${data.duplicatesCount} ข้อ (สามารถกดปุ่ม "สแกน & ลบข้อซ้ำ" ได้)` : '';
    if (data.issuesCount > 0) {
      const issuesSummary = data.issues.map(i => `• ข้อที่ ${i.questionNumber}: ${i.title} (${i.description})`).join('\n');
      if (confirm(`🤖 AI ตรวจสอบพบจุดที่ควรปรับปรุง ${data.issuesCount} ข้อ:${dupNotice}\n\n${issuesSummary}\n\nต้องการให้ AI แก้ไขออโต้ทันทีหรือไม่?`)) {
        currentEditQuestions = data.fixedQuestions;
        renderEditQuestionsList();
        alert(`✅ นำการแก้ไขออโต้ของ AI ไปปรับใช้เรียบร้อยแล้ว ${data.issuesCount} ข้อ! (อย่าลืมกดปุ่มบันทึกทั้งหมด)`);
      }
    } else if (data.duplicatesCount > 0) {
      if (confirm(`⚠️ ตรวจพบข้อสอบซ้ำกันในชุดนี้ ${data.duplicatesCount} ข้อ!\nต้องการลบข้อสอบที่ซ้ำออกทันทีหรือไม่? (ระบบจะเก็บข้อแรกไว้และลบข้อที่ซ้ำออก)`)) {
        await scanAndDeleteDuplicatesInCurrentExam();
      }
    } else {
      alert(`🎉 ตรวจสอบสมบูรณ์: ข้อสอบทั้ง ${data.totalAudited} ข้อ ถูกต้อง ไม่พบข้อซ้ำ สอดคล้องกับเฉลย และคำอธิบายชัดเจน 100%!`);
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

// 4. Dedicated Scan & Delete Duplicates in current exam
window.scanAndDeleteDuplicatesInCurrentExam = async function() {
  if (!currentEditExamId) {
    alert('ไม่พบรหัสชุดข้อสอบที่กำลังแก้ไข');
    return;
  }
  if (!confirm('คุณต้องการสแกนหาข้อสอบที่ซ้ำกันในชุดนี้ และลบข้อที่ซ้ำออกทั้งหมดโดยเก็บข้อแรกไว้ใช่หรือไม่?')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/exams/${currentEditExamId}/delete-duplicates`, {
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
    if (data.deletedCount === 0) {
      alert('🎉 ยอดเยี่ยม! ชุดข้อสอบนี้ไม่มีข้อสอบที่ซ้ำกันเลยแม้แต่ข้อเดียว');
      return;
    }

    alert(`🗑️ ลบข้อสอบซ้ำสำเร็จ ${data.deletedCount} ข้อ!\nคงเหลือข้อสอบที่ไม่ซ้ำกันทั้งหมด ${data.remainingCount} ข้อ`);
    
    // Reload questions into edit modal
    await openEditExamModal(currentEditExamId);
    loadExams();
  } catch (err) {
    console.error('Scan and delete duplicates error:', err);
    alert('เกิดข้อผิดพลาดในการลบข้อสอบซ้ำ: ' + err.message);
  }
};

// =========================================================================
// Full Exam Set AI Re-check & Auto-Repair Controller (Question-by-Question)
// =========================================================================
window.openExamSetAiRecheckModal = async function(examId) {
  const modal = document.getElementById('examSetAiRecheckModal');
  const body = document.getElementById('examSetRecheckDetailsList');
  const subtitle = document.getElementById('examSetRecheckSubtitle');
  const titleEl = document.getElementById('examSetRecheckProgressTitle');
  const bar = document.getElementById('examSetRecheckProgressBar');
  const percentEl = document.getElementById('examSetRecheckPercent');
  const totalEl = document.getElementById('statTotalExamQuestions');
  const fixedEl = document.getElementById('statFixedExamQuestions');
  const passedEl = document.getElementById('statPassedExamQuestions');
  const deletedDupEl = document.getElementById('statDeletedDuplicatesExamQuestions');

  if (!modal) return;
  modal.style.display = 'flex';

  // Reset UI State
  if (subtitle) subtitle.textContent = `กำลังโหลดข้อมูลและเชื่อมต่อ AI สำหรับชุดข้อสอบ #${examId}...`;
  if (titleEl) titleEl.textContent = '🤖 AI กำลังตรวจสอบทีละข้อและสแกนหาข้อซ้ำ...';
  if (bar) bar.style.width = '20%';
  if (percentEl) percentEl.textContent = 'ประมวลผล...';
  if (totalEl) totalEl.textContent = '-';
  if (fixedEl) fixedEl.textContent = '0';
  if (passedEl) passedEl.textContent = '0';
  if (deletedDupEl) deletedDupEl.textContent = '0';

  if (body) {
    body.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; color: #64748B;">
        <div style="font-size: 36px; margin-bottom: 12px; animation: pulse 1.5s infinite;">⚡</div>
        <div style="font-weight: 800; font-size: 15px; color: #1E293B; margin-bottom: 6px;">ระบบกำลังสแกนและรีเช็คข้อสอบทีละข้อด้วย AI ผู้เชี่ยวชาญ...</div>
        <div style="font-size: 12.5px; color: #64748B;">หากความมั่นใจเกิน 90% หรือโจทย์ไม่สมเหตุสมผล ระบบจะปรับแก้และบันทึกลงฐานข้อมูลทันที</div>
      </div>
    `;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/exams/${examId}/recheck-full-set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText || 'Server error');
    }

    const data = await res.json();

    if (bar) bar.style.width = '100%';
    if (percentEl) percentEl.textContent = '100%';
    const dupSummary = (data.deletedDuplicatesCount && data.deletedDuplicatesCount > 0) ? `ลบข้อซ้ำ ${data.deletedDuplicatesCount} ข้อ, ` : '';
    if (titleEl) titleEl.textContent = `🎉 ตรวจสอบเสร็จสมบูรณ์! (${dupSummary}แก้ไขออโต้ ${data.fixedCount} ข้อ จากทั้งหมด ${data.totalCount} ข้อ)`;
    if (subtitle) subtitle.textContent = `ชุดข้อสอบ #${data.examId}: ${data.examTitle || ''}`;
    if (totalEl) totalEl.textContent = data.totalCount;
    if (fixedEl) fixedEl.textContent = data.fixedCount;
    if (passedEl) passedEl.textContent = data.passedCount;
    if (deletedDupEl) deletedDupEl.textContent = data.deletedDuplicatesCount || 0;

    // Render results
    if (body) {
      body.innerHTML = '';

      if (!data.results || data.results.length === 0) {
        body.innerHTML = `<div style="text-align: center; padding: 32px; color: #64748B;">ไม่พบรายการข้อสอบในชุดนี้</div>`;
        return;
      }

      data.results.forEach((r) => {
        const card = document.createElement('div');
        const isDupDeleted = r.status === 'DUPLICATE_DELETED';
        const isFixed = r.status === 'FIXED';

        card.style.cssText = isDupDeleted
          ? 'background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 16px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);'
          : isFixed
            ? 'background: white; border: 1.5px solid #FBCFE8; border-radius: 16px; padding: 18px; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.06);'
            : 'background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);';

        const statusBadge = isDupDeleted
          ? `<span style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; font-size: 11.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">🗑️ ข้อสอบซ้ำ (ลบออกจากฐานข้อมูลแล้ว)</span>`
          : isFixed
            ? `<span style="background: #FDF2F8; color: #DB2777; border: 1px solid #FBCFE8; font-size: 11.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">⚡ แก้ไขอัตโนมัติแล้ว (มั่นใจ ${r.confidenceScore}%)</span>`
            : `<span style="background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; font-size: 11.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">✅ ผ่านการตรวจ (สมบูรณ์แล้ว)</span>`;

        let diffContent = '';
        if (isDupDeleted) {
          diffContent = `
            <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 12px; padding: 10px 14px; margin: 12px 0; font-size: 12.5px; color: #92400E;">
              <span style="font-weight: 800;">🗑️ รายละเอียดข้อสอบซ้ำ:</span> ${escapeHTML(r.reason)}
            </div>
            <div style="background: white; border: 1px solid #FDE68A; border-radius: 12px; padding: 12px; font-size: 12px; color: #78350F;">
              <div style="font-weight: 700; margin-bottom: 4px;">${escapeHTML(r.before.questionText)}</div>
              <div style="color: #92400E; font-size: 11.5px;">ก. ${escapeHTML(r.before.choice1)} | ข. ${escapeHTML(r.before.choice2)} | ค. ${escapeHTML(r.before.choice3)} | ง. ${escapeHTML(r.before.choice4)}</div>
              <div style="margin-top: 4px; font-weight: 800;">เฉลยเดิม: ข้อ ${r.before.correctAnswer}</div>
            </div>
          `;
        } else if (isFixed) {
          diffContent = `
            <div style="background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 12px; padding: 10px 14px; margin: 12px 0; font-size: 12.5px; color: #9F1239;">
              <span style="font-weight: 800;">🛠️ เหตุผลที่ AI ทำการแก้ไข:</span> ${escapeHTML(r.reason)}
            </div>

            <!-- Comparison Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
              <!-- Before -->
              <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 12px; font-size: 12px;">
                <div style="font-weight: 800; color: #64748B; margin-bottom: 6px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">❌ ข้อมูลก่อนแก้ไข:</div>
                <div style="font-weight: 700; color: #1E293B; margin-bottom: 6px;">${escapeHTML(r.before.questionText)}</div>
                <div style="color: #475569; line-height: 1.5;">
                  <div>ก. ${escapeHTML(r.before.choice1)}</div>
                  <div>ข. ${escapeHTML(r.before.choice2)}</div>
                  <div>ค. ${escapeHTML(r.before.choice3)}</div>
                  <div>ง. ${escapeHTML(r.before.choice4)}</div>
                </div>
                <div style="margin-top: 6px; font-weight: 800; color: #BD1B0B;">เฉลยเดิม: ข้อ ${r.before.correctAnswer}</div>
                <div style="font-size: 11px; color: #64748B; margin-top: 2px;">คำอธิบาย: ${escapeHTML(r.before.explanation || '-')}</div>
              </div>

              <!-- After -->
              <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 12px; padding: 12px; font-size: 12px;">
                <div style="font-weight: 800; color: #15803D; margin-bottom: 6px; border-bottom: 1px solid #BBF7D0; padding-bottom: 4px;">✨ ข้อมูลหลังซ่อมแซม (บันทึกลง DB แล้ว):</div>
                <div style="font-weight: 800; color: #0F172A; margin-bottom: 6px;">${escapeHTML(r.after.questionText)}</div>
                <div style="color: #166534; line-height: 1.5;">
                  <div style="${r.after.correctAnswer === 1 ? 'font-weight: 800; color: #047857;' : ''}">ก. ${escapeHTML(r.after.choice1)}</div>
                  <div style="${r.after.correctAnswer === 2 ? 'font-weight: 800; color: #047857;' : ''}">ข. ${escapeHTML(r.after.choice2)}</div>
                  <div style="${r.after.correctAnswer === 3 ? 'font-weight: 800; color: #047857;' : ''}">ค. ${escapeHTML(r.after.choice3)}</div>
                  <div style="${r.after.correctAnswer === 4 ? 'font-weight: 800; color: #047857;' : ''}">ง. ${escapeHTML(r.after.choice4)}</div>
                </div>
                <div style="margin-top: 6px; font-weight: 800; color: #059669;">เฉลยใหม่: ข้อ ${r.after.correctAnswer}</div>
                <div style="font-size: 11px; color: #15803D; margin-top: 2px;">คำอธิบาย: ${escapeHTML(r.after.explanation || '-')}</div>
              </div>
            </div>
          `;
        } else {
          diffContent = `
            <div style="margin-top: 8px; font-size: 12.5px; color: #334155;">
              <div style="font-weight: 700; margin-bottom: 4px;">${escapeHTML(r.after.questionText)}</div>
              <div style="font-size: 11.5px; color: #64748B;">เฉลยข้อ ${r.after.correctAnswer} • คำอธิบาย: ${escapeHTML(r.after.explanation || '-')}</div>
            </div>
          `;
        }

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: #F3E8FF; color: #7C3AED; font-weight: 800; font-size: 12.5px;">
                ${r.questionNumber}
              </span>
              <span style="font-weight: 800; color: #1E293B; font-size: 13.5px;">ข้อที่ ${r.questionNumber}</span>
              <span style="font-size: 11px; color: #94A3B8; font-family: monospace;">(ID: ${r.questionId})</span>
            </div>
            ${statusBadge}
          </div>

          ${diffContent}
        `;

        body.appendChild(card);
      });
    }

    // Refresh exams table in background to update counts if any
    loadExams();

  } catch (err) {
    console.error('Open exam set AI recheck error:', err);
    if (bar) {
      bar.style.background = '#EF4444';
      bar.style.width = '100%';
    }
    if (titleEl) titleEl.textContent = '❌ เกิดข้อผิดพลาดในการตรวจสอบ';
    if (body) {
      body.innerHTML = `
        <div style="text-align: center; padding: 36px 16px; background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 16px; color: #991B1B;">
          <div style="font-size: 32px; margin-bottom: 8px;">⚠️</div>
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px;">ไม่สามารถรีเช็คข้อสอบทั้งชุดได้</div>
          <div style="font-size: 12.5px;">${escapeHTML(err.message)}</div>
          <button class="btn btn-outline" style="margin-top: 14px; font-size: 12px; color: #991B1B; border-color: #FECACA;" onclick="openExamSetAiRecheckModal(${examId})">🔄 ลองใหม่อีกครั้ง</button>
        </div>
      `;
    }
  }
};

window.closeExamSetAiRecheckModal = function() {
  const modal = document.getElementById('examSetAiRecheckModal');
  if (modal) modal.style.display = 'none';
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
    const rp = audit.repairProposal || {
      action: audit.suggestedCorrectAnswer && audit.suggestedCorrectAnswer !== q.correctAnswer ? 'FIX_ANSWER' : 'KEEP_ORIGINAL',
      actionTitle: 'ปรับปรุงเฉลยให้ถูกต้อง',
      highlightChanges: audit.suggestedCorrectAnswer && audit.suggestedCorrectAnswer !== q.correctAnswer ? `เปลี่ยนเฉลยเป็นข้อ ${thaiChoices[audit.suggestedCorrectAnswer] || audit.suggestedCorrectAnswer}` : '',
      repairedQuestionText: q.questionText,
      repairedChoice1: q.choice1,
      repairedChoice2: q.choice2,
      repairedChoice3: q.choice3,
      repairedChoice4: q.choice4,
      repairedCorrectAnswer: audit.suggestedCorrectAnswer || q.correctAnswer,
      repairedExplanation: audit.suggestedExplanation || q.explanation
    };

    const repairedAnsChar = thaiChoices[rp.repairedCorrectAnswer] || rp.repairedCorrectAnswer;
    const isChoice1Changed = (rp.repairedChoice1 || '').trim() !== (q.choice1 || '').trim();
    const isChoice2Changed = (rp.repairedChoice2 || '').trim() !== (q.choice2 || '').trim();
    const isChoice3Changed = (rp.repairedChoice3 || '').trim() !== (q.choice3 || '').trim();
    const isChoice4Changed = (rp.repairedChoice4 || '').trim() !== (q.choice4 || '').trim();
    const isQuestionChanged = (rp.repairedQuestionText || '').trim() !== (q.questionText || '').trim();
    const hasAnyChoiceRepair = isChoice1Changed || isChoice2Changed || isChoice3Changed || isChoice4Changed || isQuestionChanged;

    let actionBadgeColor = '#2563EB';
    let actionBadgeBg = '#EFF6FF';
    let actionBadgeText = '⚖️ ปรับแก้เฉลยและคำอธิบาย';
    if (rp.action === 'FIX_CHOICES') {
      actionBadgeColor = '#059669';
      actionBadgeBg = '#ECFDF5';
      actionBadgeText = '🛠️ ซ่อมคำในตัวเลือกให้มีข้อผิดจริงตามโจทย์';
    } else if (rp.action === 'REPLACE_QUESTION') {
      actionBadgeColor = '#7C3AED';
      actionBadgeBg = '#F5F3FF';
      actionBadgeText = '🔄 สร้างข้อสอบใหม่ทดแทนทั้งข้อ';
    } else if (rp.action === 'KEEP_ORIGINAL') {
      actionBadgeColor = '#475569';
      actionBadgeBg = '#F1F5F9';
      actionBadgeText = '🛡️ ข้อสอบเดิมถูกต้องแล้ว';
    }

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
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 22px;">${audit.verdict === 'VALID_REPORT' ? '🎯' : audit.verdict === 'FALSE_ALARM' ? '🛡️' : '⚖️'}</span>
            <div>
              <div style="font-weight: 900; font-size: 15px; color: ${audit.verdict === 'VALID_REPORT' ? '#991B1B' : audit.verdict === 'FALSE_ALARM' ? '#166534' : '#92400E'};">
                ${escapeHTML(audit.verdictTitle || 'ผลการวินิจฉัย')}
              </div>
              <div style="font-size: 11.5px; color: #64748B;">ความมั่นใจของ AI: ${audit.confidenceScore || 95}%</div>
            </div>
          </div>
          <span style="font-size: 11.5px; font-weight: 800; padding: 4px 10px; border-radius: 999px; background: ${actionBadgeBg}; color: ${actionBadgeColor}; border: 1px solid ${actionBadgeColor}33;">
            ${actionBadgeText}
          </span>
        </div>

        <div style="font-size: 13px; color: #1E293B; line-height: 1.5; margin-bottom: 10px;">
          <strong>บทวิเคราะห์:</strong> ${escapeHTML(audit.analysis || '')}
        </div>

        ${audit.studentFeedbackEvaluation ? `
          <div style="font-size: 12.5px; color: #475569; background: rgba(255,255,255,0.7); padding: 8px 12px; border-radius: 10px; margin-bottom: 8px;">
            <strong>ประเมินความเห็นนักเรียน:</strong> ${escapeHTML(audit.studentFeedbackEvaluation)}
          </div>
        ` : ''}

        ${rp.highlightChanges ? `
          <div style="font-size: 12.5px; color: #065F46; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 8px 12px; border-radius: 10px; font-weight: 600;">
            💡 <strong>การซ่อมแซมโดย AI:</strong> ${escapeHTML(rp.highlightChanges)}
          </div>
        ` : ''}
      </div>

      <!-- กล่องชี้แจงผู้สอบ: กรณีคำตอบถูกต้องแล้ว หรือผู้สอบเข้าใจผิด -->
      <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 16px; padding: 14px 18px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(37,99,235,0.05);">
        <div style="flex: 1; min-width: 260px;">
          <div style="font-weight: 800; font-size: 13.5px; color: #1E40AF; display: flex; align-items: center; gap: 6px;">
            <span>💬 คำตอบถูกต้องแล้ว หรือต้องการชี้แจงผู้สอบ?</span>
            ${audit.verdict === 'FALSE_ALARM' ? '<span style="font-size: 11px; background: #DCFCE7; color: #15803D; padding: 2px 8px; border-radius: 999px; font-weight: 800;">ข้อสอบถูกต้องแล้ว</span>' : ''}
          </div>
          <div style="font-size: 12px; color: #475569; margin-top: 3px; line-height: 1.4;">
            แอดมินสามารถพิมพ์คำชี้แจง หรือดึงบทวิเคราะห์ของ AI ส่งแจ้งเตือนไปยังกระดิ่งของผู้สอบได้โดยตรง
          </div>
        </div>
        <button type="button" class="btn btn-primary" onclick="openReportReplyFromAudit()" style="background: #2563EB; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; color: white; box-shadow: 0 3px 10px rgba(37,99,235,0.25);">
          💬 พิมพ์ตอบชี้แจงผู้สอบ
        </button>
      </div>

      <!-- 3. เปรียบเทียบข้อสอบเดิม vs ข้อสอบฉบับซ่อมแซมสมบูรณ์โดย AI -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
        <!-- ข้อสอบเดิม -->
        <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 16px; display: flex; flex-direction: column;">
          <div style="font-size: 12px; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>📄 ข้อสอบเดิมในระบบ</span>
            <span style="color: #DC2626; font-weight: 900;">เฉลยเดิม: ข้อ ${currentAnsChar} (${q.correctAnswer})</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #1E293B; margin-bottom: 12px; min-height: 38px;">
            โจทย์: ${escapeHTML(q.questionText)}
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; flex: 1;">
            <div style="padding: 7px 10px; border-radius: 8px; font-size: 12px; ${q.correctAnswer === 1 ? 'background: #FEE2E2; border: 1px solid #FCA5A5; font-weight: 700; color: #991B1B;' : 'background: #F8FAFC; border: 1px solid #E2E8F0; color: #475569;'}">
              ก. ${escapeHTML(q.choice1)} ${q.correctAnswer === 1 ? ' (เฉลยเดิม)' : ''}
            </div>
            <div style="padding: 7px 10px; border-radius: 8px; font-size: 12px; ${q.correctAnswer === 2 ? 'background: #FEE2E2; border: 1px solid #FCA5A5; font-weight: 700; color: #991B1B;' : 'background: #F8FAFC; border: 1px solid #E2E8F0; color: #475569;'}">
              ข. ${escapeHTML(q.choice2)} ${q.correctAnswer === 2 ? ' (เฉลยเดิม)' : ''}
            </div>
            <div style="padding: 7px 10px; border-radius: 8px; font-size: 12px; ${q.correctAnswer === 3 ? 'background: #FEE2E2; border: 1px solid #FCA5A5; font-weight: 700; color: #991B1B;' : 'background: #F8FAFC; border: 1px solid #E2E8F0; color: #475569;'}">
              ค. ${escapeHTML(q.choice3)} ${q.correctAnswer === 3 ? ' (เฉลยเดิม)' : ''}
            </div>
            <div style="padding: 7px 10px; border-radius: 8px; font-size: 12px; ${q.correctAnswer === 4 ? 'background: #FEE2E2; border: 1px solid #FCA5A5; font-weight: 700; color: #991B1B;' : 'background: #F8FAFC; border: 1px solid #E2E8F0; color: #475569;'}">
              ง. ${escapeHTML(q.choice4)} ${q.correctAnswer === 4 ? ' (เฉลยเดิม)' : ''}
            </div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px; font-size: 11.5px; color: #64748B;">
            <strong>คำอธิบายเดิม:</strong> ${escapeHTML(q.explanation || 'ไม่มีคำอธิบายเดิม')}
          </div>
        </div>

        <!-- ข้อสอบฉบับซ่อมแซมสมบูรณ์โดย AI -->
        <div style="background: #F0FDF4; border: 2px solid #34D399; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; box-shadow: 0 4px 14px rgba(5,150,105,0.1);">
          <div style="font-size: 12px; font-weight: 800; color: #059669; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>✨ ฉบับที่ AI ซ่อมแซมสมบูรณ์</span>
            <span style="color: #059669; font-weight: 900; background: #D1FAE5; padding: 2px 8px; border-radius: 6px;">เฉลยใหม่: ข้อ ${repairedAnsChar} (${rp.repairedCorrectAnswer})</span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #064E3B; margin-bottom: 12px; min-height: 38px;">
            โจทย์: ${escapeHTML(rp.repairedQuestionText)} ${isQuestionChanged ? '<span style="font-size: 10.5px; background: #FEF3C7; color: #92400E; padding: 1px 6px; border-radius: 4px; font-weight: 700;">(โจทย์ปรับปรุง)</span>' : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; flex: 1;">
            <div style="padding: 7px 10px; border-radius: 8px; font-size: 12px; ${rp.repairedCorrectAnswer === 1 ? 'border: 2px solid #059669; background: white; color: #059669; font-weight: 800;' : isChoice1Changed ? 'border: 1.5px solid #F59E0B; background: #FFFBEB; color: #92400E;' : 'background: white; border: 1px solid #D1FAE5; color: #064E3B;'}">
              ก. ${escapeHTML(rp.repairedChoice1)} ${rp.repairedCorrectAnswer === 1 ? ' ✨ (ข้อที่ถูกต้อง)' : ''} ${isChoice1Changed ? ' <span style="font-size: 10px; background: #FEF3C7; color: #92400E; padding: 1px 4px; border-radius: 3px;">(ซ่อมแล้ว)</span>' : ''}
            </div>
            <div style="padding: 7px 10px; border-radius: 8px; font-size: 12px; ${rp.repairedCorrectAnswer === 2 ? 'border: 2px solid #059669; background: white; color: #059669; font-weight: 800;' : isChoice2Changed ? 'border: 1.5px solid #F59E0B; background: #FFFBEB; color: #92400E;' : 'background: white; border: 1px solid #D1FAE5; color: #064E3B;'}">
              ข. ${escapeHTML(rp.repairedChoice2)} ${rp.repairedCorrectAnswer === 2 ? ' ✨ (ข้อที่ถูกต้อง)' : ''} ${isChoice2Changed ? ' <span style="font-size: 10px; background: #FEF3C7; color: #92400E; padding: 1px 4px; border-radius: 3px;">(ซ่อมแล้ว)</span>' : ''}
            </div>
            <div style="padding: 7px 10px; border-radius: 8px; font-size: 12px; ${rp.repairedCorrectAnswer === 3 ? 'border: 2px solid #059669; background: white; color: #059669; font-weight: 800;' : isChoice3Changed ? 'border: 1.5px solid #F59E0B; background: #FFFBEB; color: #92400E;' : 'background: white; border: 1px solid #D1FAE5; color: #064E3B;'}">
              ค. ${escapeHTML(rp.repairedChoice3)} ${rp.repairedCorrectAnswer === 3 ? ' ✨ (ข้อที่ถูกต้อง)' : ''} ${isChoice3Changed ? ' <span style="font-size: 10px; background: #FEF3C7; color: #92400E; padding: 1px 4px; border-radius: 3px;">(ซ่อมแล้ว)</span>' : ''}
            </div>
            <div style="padding: 7px 10px; border-radius: 8px; font-size: 12px; ${rp.repairedCorrectAnswer === 4 ? 'border: 2px solid #059669; background: white; color: #059669; font-weight: 800;' : isChoice4Changed ? 'border: 1.5px solid #F59E0B; background: #FFFBEB; color: #92400E;' : 'background: white; border: 1px solid #D1FAE5; color: #064E3B;'}">
              ง. ${escapeHTML(rp.repairedChoice4)} ${rp.repairedCorrectAnswer === 4 ? ' ✨ (ข้อที่ถูกต้อง)' : ''} ${isChoice4Changed ? ' <span style="font-size: 10px; background: #FEF3C7; color: #92400E; padding: 1px 4px; border-radius: 3px;">(ซ่อมแล้ว)</span>' : ''}
            </div>
          </div>
          <div style="background: white; border: 1.5px solid #A7F3D0; border-radius: 10px; padding: 10px; font-size: 12px; color: #065F46; font-weight: 500;">
            <strong>คำอธิบายใหม่ที่ AI เตรียมให้:</strong> ${escapeHTML(rp.repairedExplanation || rp.explanation || '')}
          </div>
        </div>
      </div>
    `;

    // Update the apply button label
    const btnApply = document.getElementById('btnApplyReportAiFix');
    if (btnApply) {
      btnApply.innerHTML = `<span>✨ อนุมัติการซ่อมแซมของ AI & บันทึกทันที (1-Click)</span>`;
    }

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
    btn.innerHTML = '<span>กำลังบันทึกการซ่อมแซม... ⏳</span>';
  }

  try {
    const q = currentAuditReportData.question;
    const audit = currentAuditReportData.aiAudit || {};
    const rp = audit.repairProposal || {};

    const questionText = rp.repairedQuestionText || q.questionText;
    const choice1 = rp.repairedChoice1 || q.choice1;
    const choice2 = rp.repairedChoice2 || q.choice2;
    const choice3 = rp.repairedChoice3 || q.choice3;
    const choice4 = rp.repairedChoice4 || q.choice4;
    const correctAnswer = rp.repairedCorrectAnswer || audit.suggestedCorrectAnswer || q.correctAnswer;
    const explanation = rp.repairedExplanation || audit.suggestedExplanation || q.explanation;
    const auditNote = rp.actionTitle || audit.verdictTitle || 'ซ่อมแซมและปรับปรุงข้อสอบโดย AI';

    const res = await fetch(`${API_BASE}/api/admin/reports/${currentAuditReportData.reportId}/ai-apply-fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        questionId: currentAuditReportData.questionId,
        questionText,
        choice1,
        choice2,
        choice3,
        choice4,
        correctAnswer,
        explanation,
        auditNote
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText);
    }

    alert('✅ อนุมัติการซ่อมแซมสำเร็จ! ข้อสอบได้รับการแก้ไข บันทึกประวัติ และปิดรายงานเรียบร้อยแล้ว');
    closeReportAiAuditModal();
    loadAdminReports();

  } catch (err) {
    console.error('Apply Report AI Fix error:', err);
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>✨ อนุมัติการซ่อมแซมของ AI & บันทึกทันที (1-Click)</span>';
    }
  }
};

// 6. Open Manual Edit Form from AI Audit
window.openManualEditFromAudit = function() {
  if (!currentAuditReportData) return;
  const q = currentAuditReportData.question;
  const audit = currentAuditReportData.aiAudit || {};
  const rp = audit.repairProposal || {};
  const reportId = currentAuditReportData.reportId;
  const questionId = currentAuditReportData.questionId;

  closeReportAiAuditModal();

  document.getElementById('editSingleQuestionId').value = questionId || '';
  document.getElementById('editSingleReportId').value = reportId || '';
  document.getElementById('editSingleQuestionText').value = rp.repairedQuestionText || q.questionText || '';
  document.getElementById('editSingleChoice1').value = rp.repairedChoice1 || q.choice1 || '';
  document.getElementById('editSingleChoice2').value = rp.repairedChoice2 || q.choice2 || '';
  document.getElementById('editSingleChoice3').value = rp.repairedChoice3 || q.choice3 || '';
  document.getElementById('editSingleChoice4').value = rp.repairedChoice4 || q.choice4 || '';
  document.getElementById('editSingleCorrectAnswer').value = String(rp.repairedCorrectAnswer || audit.suggestedCorrectAnswer || q.correctAnswer || 1);
  document.getElementById('editSingleExplanation').value = rp.repairedExplanation || audit.suggestedExplanation || q.explanation || '';

  const titleEl = document.getElementById('singleQuestionModalTitle');
  const subEl = document.getElementById('singleQuestionModalSubtitle');
  if (titleEl) titleEl.textContent = `แก้ไขข้อสอบ (ID: ${questionId})`;
  if (subEl) subEl.textContent = `วิชา: ${currentAuditReportData.subject || 'ทั่วไป'} (นำเข้าข้อมูลจากผล AI Audit/Repair แล้ว)`;

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
      if (fixed.questionText) document.getElementById('editSingleQuestionText').value = fixed.questionText;
      if (fixed.choice1) document.getElementById('editSingleChoice1').value = fixed.choice1;
      if (fixed.choice2) document.getElementById('editSingleChoice2').value = fixed.choice2;
      if (fixed.choice3) document.getElementById('editSingleChoice3').value = fixed.choice3;
      if (fixed.choice4) document.getElementById('editSingleChoice4').value = fixed.choice4;
      document.getElementById('editSingleCorrectAnswer').value = String(fixed.correctAnswer);
      document.getElementById('editSingleExplanation').value = fixed.explanation;
      alert(`✨ AI ตรวจสอบและปรับปรุงข้อสอบให้เรียบร้อยแล้ว:\n• ปรับปรุงโจทย์และตัวเลือกให้สอดคล้องกัน 100%\n• เฉลยเป็นข้อ: ${fixed.correctAnswer}\n• ปรับปรุงคำอธิบายให้กระชับ ชัดเจน`);
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

// =======================================================
// 💬 REPORT REPLY & CLARIFICATION FUNCTIONS
// =======================================================
let currentReplyReportData = null;

window.openReportReplyModal = function(reportId, reportIndex, prefillData = {}) {
  const rep = (reportIndex !== undefined && allLoadedReports[reportIndex]) ? allLoadedReports[reportIndex] : null;
  let reasonData = {};
  if (rep && rep.reason) {
    try { reasonData = JSON.parse(rep.reason); } catch (_) {}
  }

  const reporterName = rep && rep.user ? (rep.user.fullName || rep.user.username || rep.user.email || `User #${rep.user.id}`) : (prefillData.reporterName || 'ผู้เข้าสอบ');
  const subject = (rep && (rep.subject || reasonData.subject)) || prefillData.subject || 'ทั่วไป';
  const qNum = (reasonData.questionNumber ? `ข้อที่ ${reasonData.questionNumber}` : '') || (prefillData.questionNumber || '');
  const qText = (rep && rep.questionText) || prefillData.questionText || '';
  const reasonType = reasonData.reasonType || prefillData.reasonType || 'เฉลยคำตอบผิด';
  const studentDetails = reasonData.details || prefillData.studentDetails || '';

  currentReplyReportData = {
    reportId: reportId || (rep && rep.id) || prefillData.reportId,
    questionId: (rep && rep.questionId) || prefillData.questionId,
    userId: (rep && rep.userId) || prefillData.userId,
    reporterName,
    subject,
    qNum,
    questionText: qText,
    reasonType,
    studentDetails,
    aiAnalysis: prefillData.aiAnalysis || '',
    aiEvaluation: prefillData.aiEvaluation || '',
    suggestedAnswer: prefillData.suggestedAnswer || ''
  };

  const idEl = document.getElementById('reportReplyReportId');
  const qIdEl = document.getElementById('reportReplyQuestionId');
  const uIdEl = document.getElementById('reportReplyUserId');
  if (idEl) idEl.value = currentReplyReportData.reportId || '';
  if (qIdEl) qIdEl.value = currentReplyReportData.questionId || '';
  if (uIdEl) uIdEl.value = currentReplyReportData.userId || '';

  const repNameEl = document.getElementById('replyModalReporterName');
  const subQEl = document.getElementById('replyModalSubjectQNum');
  const qSnipEl = document.getElementById('replyModalQuestionSnippet');
  const fbTextEl = document.getElementById('replyModalStudentFeedbackText');

  if (repNameEl) repNameEl.textContent = reporterName;
  if (subQEl) subQEl.textContent = `วิชา: ${subject} ${qNum ? ' • ' + qNum : ''}`;
  if (qSnipEl) qSnipEl.textContent = `โจทย์: ${qText ? (qText.length > 95 ? qText.substring(0, 95) + '...' : qText) : '-'}`;
  
  const fbText = studentDetails ? `"${studentDetails}" (หัวข้อ: ${reasonType})` : reasonType;
  if (fbTextEl) fbTextEl.textContent = fbText;

  // Show or hide AI template chip
  const btnAi = document.getElementById('btnReplyAiTemplate');
  if (btnAi) {
    btnAi.style.display = (currentReplyReportData.aiAnalysis || currentReplyReportData.aiEvaluation) ? 'inline-block' : 'none';
  }

  // Pre-fill message
  if (prefillData.initialMessage) {
    const msgEl = document.getElementById('reportReplyMessage');
    if (msgEl) msgEl.value = prefillData.initialMessage;
  } else if (prefillData.aiAnalysis || prefillData.aiEvaluation) {
    applyReplyTemplate('AI_ANALYSIS');
  } else {
    applyReplyTemplate('CORRECT_ANSWER');
  }

  const modal = document.getElementById('reportReplyModal');
  if (modal) modal.style.display = 'flex';
};

window.openReportReplyFromAudit = function() {
  if (!currentAuditReportData) return;
  const audit = currentAuditReportData.aiAudit || {};
  const feedback = currentAuditReportData.studentFeedback || {};
  const q = currentAuditReportData.question || {};
  const reporterName = currentAuditReportData.reporter ? currentAuditReportData.reporter.name : 'ผู้เข้าสอบ';

  openReportReplyModal(currentAuditReportData.reportId, undefined, {
    reportId: currentAuditReportData.reportId,
    questionId: currentAuditReportData.questionId,
    userId: (currentAuditReportData.reporter && currentAuditReportData.reporter.id) || null,
    reporterName,
    subject: currentAuditReportData.subject,
    questionText: q.questionText,
    reasonType: feedback.reasonType,
    studentDetails: feedback.details,
    aiAnalysis: audit.analysis || '',
    aiEvaluation: audit.studentFeedbackEvaluation || '',
    suggestedAnswer: audit.suggestedCorrectAnswer || q.correctAnswer
  });
};

window.closeReportReplyModal = function() {
  const modal = document.getElementById('reportReplyModal');
  if (modal) modal.style.display = 'none';
};

window.applyReplyTemplate = function(templateType) {
  const msgInput = document.getElementById('reportReplyMessage');
  const titleInput = document.getElementById('reportReplyTitle');
  if (!msgInput) return;

  const data = currentReplyReportData || {};
  const subject = data.subject || 'ข้อสอบ';

  if (templateType === 'CORRECT_ANSWER') {
    if (titleInput) titleInput.value = '💡 คำชี้แจงจากแอดมิน: ข้อสอบและเฉลยข้อนี้ถูกต้องแล้ว';
    msgInput.value = `สวัสดีครับทีมงานได้ตรวจสอบข้อสอบข้อนี้ในวิชา "${subject}" แล้ว พบว่าเฉลยและตัวเลือกเดิมถูกต้องสมบูรณ์ตามหลักวิชาการ/ระเบียบข้อสอบแล้วครับ\n\nสาเหตุที่ตอบข้อนี้ เนื่องจากข้อสอบมีจุดสังเกตสำคัญตามหลักเกณฑ์ที่กำหนดไว้ ผู้สอบอาจเข้าใจผิดหรือสับสนในประเด็นดังกล่าว ขอให้ทบทวนจุดนี้เพิ่มเติมเพื่อความแม่นยำในการสอบจริงนะครับ เป็นกำลังใจให้ครับ! ✨`;
  } else if (templateType === 'AI_ANALYSIS') {
    if (titleInput) titleInput.value = '💡 ชี้แจงข้อสงสัยข้อสอบ (ผลการตรวจทานละเอียด)';
    let text = `สวัสดีครับ ทีมงานได้นำข้อสอบและข้อความทักท้วงของคุณเข้าสู่ระบบตรวจทานวิชาการอย่างละเอียด:\n\n`;
    if (data.aiEvaluation) {
      text += `📌 ข้อชี้แจงต่อประเด็นที่ทักท้วง: ${data.aiEvaluation}\n\n`;
    }
    if (data.aiAnalysis) {
      text += `📖 คำอธิบายข้อเท็จจริง: ${data.aiAnalysis}\n\n`;
    }
    text += `ข้อสอบข้อนี้จึงเฉลยถูกต้องตามหลักการแล้วครับ ขอบคุณที่ร่วมฝึกทำข้อสอบและช่วยตั้งข้อสังเกตเข้ามานะครับ!`;
    msgInput.value = text;
  } else if (templateType === 'LAW_CITATION') {
    if (titleInput) titleInput.value = '⚖️ คำชี้แจงตามระเบียบ/ข้อกฎหมายที่ถูกต้อง';
    msgInput.value = `จากการตรวจสอบตามระเบียบและตัวบทกฎหมายที่เกี่ยวข้องกับข้อสอบข้อนี้ พบว่าเฉลยเดิมในระบบสอดคล้องกับหลักเกณฑ์และข้อกฎหมายอย่างถูกต้องแล้วครับ\n\nจุดที่อาจทำให้เข้าใจผิดมักเกิดจากคำสำคัญ (Keyword) ในโจทย์ ขอแนะนำให้อ่านทบทวนตัวบทและเงื่อนไขข้อยกเว้นอย่างละเอียดนะครับ ขอบคุณสำหรับการรายงานครับ`;
  } else if (templateType === 'RESOLVED_THANKS') {
    if (titleInput) titleInput.value = '🙏 ขอบคุณสำหรับการช่วยรายงานข้อสอบ!';
    msgInput.value = `แอดมินได้ทำการตรวจสอบข้อสอบตามที่คุณแจ้งเข้ามาเรียบร้อยแล้วครับ ทีมงานขอขอบคุณเป็นอย่างยิ่งที่ช่วยสอดส่องและร่วมพัฒนาคลังข้อสอบให้สมบูรณ์ยิ่งขึ้นครับ ✨`;
  } else if (templateType === 'CUSTOM') {
    msgInput.value = '';
    msgInput.focus();
  }
};

window.submitReportReply = async function() {
  if (!currentReplyReportData || !currentReplyReportData.reportId) {
    alert('ไม่พบข้อมูลรายงานข้อสอบ');
    return;
  }

  const title = (document.getElementById('reportReplyTitle').value || '').trim();
  const message = (document.getElementById('reportReplyMessage').value || '').trim();
  const resolveAfterReply = document.getElementById('reportReplyResolveCheckbox') ? document.getElementById('reportReplyResolveCheckbox').checked : true;
  const notifyAllDuplicates = document.getElementById('reportReplyAllDuplicatesCheckbox') ? document.getElementById('reportReplyAllDuplicatesCheckbox').checked : false;

  if (!message) {
    alert('กรุณากรอกข้อความคำชี้แจงที่ต้องการส่งถึงผู้สอบ');
    const msgEl = document.getElementById('reportReplyMessage');
    if (msgEl) msgEl.focus();
    return;
  }

  const btn = document.getElementById('btnSubmitReportReply');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>กำลังส่งคำชี้แจง... ⏳</span>';
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/reports/${currentReplyReportData.reportId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        replyTitle: title,
        replyMessage: message,
        replyType: 'ADMIN_EXPLANATION',
        resolveAfterReply,
        notifyAllDuplicates
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'เกิดข้อผิดพลาดในการส่งข้อความ');
    }

    alert('✅ ' + (data.message || 'ส่งคำชี้แจงไปยังการแจ้งเตือนของผู้สอบเรียบร้อยแล้ว!'));
    closeReportReplyModal();
    closeReportAiAuditModal();
    loadAdminReports();

  } catch (err) {
    console.error('Submit report reply error:', err);
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>📨 ส่งคำชี้แจงไปยังผู้สอบ</span>';
    }
  }
};


// =========================================================================
// Batch AI Recheck Controller (รีเช็คหลายชุด & ยืนยันทีละชุด)
// =========================================================================
window._selectedExamCardIds = window._selectedExamCardIds || new Set();
let _batchSelectionListItems = [];
let _batchSelectedIds = new Set();
let _batchRecheckQueue = [];
let _batchCurrentQueueIndex = 0;
let _batchRecheckResultsHistory = [];

window.toggleExamCardSelection = function(id, isChecked) {
  const numId = Number(id);
  if (isChecked) {
    window._selectedExamCardIds.add(numId);
  } else {
    window._selectedExamCardIds.delete(numId);
  }
  updateFloatingSelectionBar();
};

window.updateFloatingSelectionBar = function() {
  const bar = document.getElementById('batchExamFloatingBar');
  const text = document.getElementById('batchFloatingSelectedText');
  if (!bar) return;
  const count = window._selectedExamCardIds.size;
  if (count > 0) {
    bar.style.display = 'flex';
    if (text) text.textContent = `เลือกแล้ว ${count} ชุด`;
  } else {
    bar.style.display = 'none';
  }
};

window.clearSelectedExamCards = function() {
  window._selectedExamCardIds.clear();
  document.querySelectorAll('.exam-card-select-check').forEach(cb => cb.checked = false);
  updateFloatingSelectionBar();
};

window.startBatchRecheckFromSelectedCards = function() {
  const ids = Array.from(window._selectedExamCardIds);
  if (ids.length === 0) {
    alert('กรุณาเลือกชุดข้อสอบอย่างน้อย 1 ชุด');
    return;
  }
  startBatchAiRecheckQueue(ids);
};

window.openBatchAiRecheckSelectionModal = async function() {
  const modal = document.getElementById('batchAiRecheckSelectionModal');
  if (!modal) return;
  modal.style.display = 'flex';

  let pool = (typeof allLoadedExams !== 'undefined' && allLoadedExams.length > 0)
    ? allLoadedExams
    : (window.allLoadedExams || []);

  if (!pool || pool.length === 0) {
    await loadExams();
    pool = (typeof allLoadedExams !== 'undefined' && allLoadedExams.length > 0)
      ? allLoadedExams
      : (window.allLoadedExams || []);
  }

  _batchSelectionListItems = [...pool];
  _batchSelectedIds = new Set(Array.from(window._selectedExamCardIds || []).map(Number));

  renderBatchSelectionList();
};

window.closeBatchAiRecheckSelectionModal = function() {
  const modal = document.getElementById('batchAiRecheckSelectionModal');
  if (modal) modal.style.display = 'none';
};

window.filterBatchRecheckList = function() {
  renderBatchSelectionList();
};

window.selectAllBatchExams = function(selectAll) {
  const search = (document.getElementById('batchSelectSearchInput')?.value || '').toLowerCase().trim();
  const subject = document.getElementById('batchSelectSubjectFilter')?.value || 'ALL';

  const filtered = _batchSelectionListItems.filter(ex => {
    if (subject !== 'ALL') {
      const cleanFilter = cleanCategoryName(subject);
      const exCat = cleanCategoryName(ex.category || '');
      if (exCat !== cleanFilter && !exCat.includes(cleanFilter)) return false;
    }
    if (search) {
      const titleMatch = (ex.title || '').toLowerCase().includes(search);
      const subMatch = (ex.subcategory || '').toLowerCase().includes(search);
      const catMatch = (ex.category || '').toLowerCase().includes(search);
      if (!titleMatch && !subMatch && !catMatch) return false;
    }
    return true;
  });

  if (selectAll) {
    filtered.forEach(ex => _batchSelectedIds.add(ex.id));
  } else {
    filtered.forEach(ex => _batchSelectedIds.delete(ex.id));
  }
  renderBatchSelectionList();
};

window.renderBatchSelectionList = function() {
  const container = document.getElementById('batchRecheckSelectionList');
  const countBadge = document.getElementById('batchSelectCountBadge');
  const startBtn = document.getElementById('btnStartBatchRecheck');
  if (!container) return;

  const search = (document.getElementById('batchSelectSearchInput')?.value || '').toLowerCase().trim();
  const subject = document.getElementById('batchSelectSubjectFilter')?.value || 'ALL';

  const filtered = _batchSelectionListItems.filter(ex => {
    if (subject !== 'ALL') {
      const cleanFilter = cleanCategoryName(subject);
      const exCat = cleanCategoryName(ex.category || '');
      if (exCat !== cleanFilter && !exCat.includes(cleanFilter)) return false;
    }
    if (search) {
      const titleMatch = (ex.title || '').toLowerCase().includes(search);
      const subMatch = (ex.subcategory || '').toLowerCase().includes(search);
      const catMatch = (ex.category || '').toLowerCase().includes(search);
      if (!titleMatch && !subMatch && !catMatch) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 16px; color: #94A3B8;">
        <div style="font-size: 28px; margin-bottom: 8px;">🔍</div>
        <div style="font-weight: 700;">ไม่พบชุดข้อสอบตามตัวกรอง</div>
      </div>
    `;
  } else {
    container.innerHTML = filtered.map(ex => {
      const meta = getSubjectBankMeta(ex.category);
      const isChecked = _batchSelectedIds.has(ex.id);
      const qCount = ex.totalCount || 0;

      return `
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1.5px solid ${isChecked ? '#7C3AED' : '#E2E8F0'}; background: ${isChecked ? '#FAF5FF' : 'white'}; border-radius: 14px; cursor: pointer; transition: all 0.2s ease;">
          <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
            <input type="checkbox" value="${ex.id}" ${isChecked ? 'checked' : ''} onchange="toggleBatchSelectItem(${ex.id}, this.checked)" style="width: 18px; height: 18px; accent-color: #7C3AED; cursor: pointer;">
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 800; font-size: 13.5px; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${escapeHTML(ex.title)}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 3px; font-size: 11.5px; color: #64748B;">
                <span style="background: ${meta.bgColor}; color: ${meta.color}; border: 1px solid ${meta.borderColor}; padding: 1px 7px; border-radius: 999px; font-weight: 700;">
                  ${meta.icon} ${escapeHTML(ex.category || 'ทั่วไป')}
                </span>
                <span>• ${ex.subcategory || 'รวมทุกหมวด'}</span>
              </div>
            </div>
          </div>
          <div style="text-align: right; padding-left: 12px;">
            <span style="font-weight: 800; font-size: 13px; color: #1E293B;">${qCount} ข้อ</span>
            <div style="font-size: 10.5px; color: #94A3B8; font-family: monospace;">#${ex.id}</div>
          </div>
        </label>
      `;
    }).join('');
  }

  const selectedCount = _batchSelectedIds.size;
  const selectedQuestionsCount = _batchSelectionListItems
    .filter(ex => _batchSelectedIds.has(ex.id))
    .reduce((sum, ex) => sum + (ex.totalCount || 0), 0);

  if (countBadge) countBadge.textContent = `เลือกแล้ว ${selectedCount} ชุด (${selectedQuestionsCount} ข้อ)`;
  if (startBtn) {
    startBtn.disabled = selectedCount === 0;
    startBtn.textContent = `🚀 เริ่มรีเช็คทีละชุด (${selectedCount} ชุด)`;
  }
};

window.toggleBatchSelectItem = function(id, isChecked) {
  const numId = Number(id);
  if (isChecked) {
    _batchSelectedIds.add(numId);
  } else {
    _batchSelectedIds.delete(numId);
  }
  renderBatchSelectionList();
};

window.startBatchAiRecheckQueue = async function(customIds) {
  const rawIds = customIds || Array.from(_batchSelectedIds);
  const idsToRun = rawIds.map(Number).filter(n => !isNaN(n) && n > 0);
  if (!idsToRun || idsToRun.length === 0) {
    alert('กรุณาเลือกชุดข้อสอบที่ต้องการรีเช็คอย่างน้อย 1 ชุด');
    return;
  }

  let pool = (typeof allLoadedExams !== 'undefined' && allLoadedExams.length > 0)
    ? allLoadedExams
    : (window.allLoadedExams || []);

  if (!pool || pool.length === 0) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/exams`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        pool = await res.json();
        allLoadedExams = pool;
        window.allLoadedExams = pool;
      }
    } catch (e) {
      console.error('Fetch exams fallback error:', e);
    }
  }

  _batchRecheckQueue = idsToRun.map(id => {
    return pool.find(ex => Number(ex.id) === Number(id));
  }).filter(Boolean);

  // If still not found in pool, fallback to fetch each by ID
  if (_batchRecheckQueue.length === 0) {
    try {
      const fetchedQueue = [];
      for (const eid of idsToRun) {
        const res = await fetch(`${API_BASE}/api/admin/exams/${eid}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const exData = await res.json();
          fetchedQueue.push(exData);
        }
      }
      if (fetchedQueue.length > 0) {
        _batchRecheckQueue = fetchedQueue;
      }
    } catch (fetchErr) {
      console.error('Fetch individual exam fallback error:', fetchErr);
    }
  }

  if (_batchRecheckQueue.length === 0) {
    alert('ไม่พบข้อมูลชุดข้อสอบที่เลือก');
    return;
  }

  _batchCurrentQueueIndex = 0;
  _batchRecheckResultsHistory = [];

  closeBatchAiRecheckSelectionModal();
  clearSelectedExamCards();

  const wizard = document.getElementById('batchAiRecheckWizardModal');
  if (wizard) wizard.style.display = 'flex';

  runBatchRecheckCurrentStep();
};

window.runBatchRecheckCurrentStep = async function() {
  const total = _batchRecheckQueue.length;
  const current = _batchCurrentQueueIndex;
  const exam = _batchRecheckQueue[current];
  if (!exam) return;

  const stepBadge = document.getElementById('batchWizardStepBadge');
  const queueBar = document.getElementById('batchWizardQueueProgressBar');
  const titleEl = document.getElementById('batchWizardHeaderTitle');
  const subEl = document.getElementById('batchWizardHeaderSub');

  if (stepBadge) stepBadge.textContent = `ชุดที่ ${current + 1} จาก ${total}`;
  if (queueBar) queueBar.style.width = `${Math.round(((current) / total) * 100)}%`;
  if (titleEl) titleEl.textContent = `⚡ AI รีเช็คหลายชุด (ชุดที่ ${current + 1}/${total})`;
  if (subEl) subEl.textContent = `กำลังประมวลผล: "${exam.title}"`;

  const badge = document.getElementById('batchCurrentExamBadge');
  const catEl = document.getElementById('batchCurrentExamCategory');
  const currentTitleEl = document.getElementById('batchCurrentExamTitle');
  const statusPill = document.getElementById('batchCurrentStatusPill');
  const statusText = document.getElementById('batchCurrentStatusText');
  const statusDot = document.getElementById('batchCurrentStatusDot');

  if (badge) badge.textContent = `SET-${String(exam.id).padStart(3, '0')}`;
  if (catEl) catEl.textContent = `${exam.category || 'ทั่วไป'} • ${exam.subcategory || 'รวมทุกหมวด'}`;
  if (currentTitleEl) currentTitleEl.textContent = exam.title;

  if (statusPill) {
    statusPill.style.background = '#FFFBEB';
    statusPill.style.borderColor = '#FDE68A';
    statusPill.style.color = '#B45309';
  }
  if (statusDot) {
    statusDot.style.background = '#F59E0B';
    statusDot.style.display = 'inline-block';
  }
  if (statusText) statusText.textContent = 'กำลังสแกนข้อซ้ำ & รีเช็คด้วย AI ทีละข้อ...';

  const statTotal = document.getElementById('statBatchCurrentTotal');
  const statDup = document.getElementById('statBatchCurrentDup');
  const statFixed = document.getElementById('statBatchCurrentFixed');
  const statPassed = document.getElementById('statBatchCurrentPassed');

  if (statTotal) statTotal.textContent = exam.totalCount || '-';
  if (statDup) statDup.textContent = '0';
  if (statFixed) statFixed.textContent = '0';
  if (statPassed) statPassed.textContent = '0';

  const bodyList = document.getElementById('batchCurrentDetailsList');
  if (bodyList) {
    bodyList.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; color: #64748B;">
        <div style="font-size: 38px; margin-bottom: 12px; animation: pulse 1.2s infinite;">⚡</div>
        <div style="font-weight: 800; font-size: 15px; color: #1E293B; margin-bottom: 6px;">AI กำลังตรวจสอบข้อสอบในชุดนี้อย่างละเอียด...</div>
        <div style="font-size: 12.5px; color: #64748B;">หากพบข้อซ้ำจะลบทันที และหากมั่นใจ ≥ 90% จะปรับแก้ลงฐานข้อมูลให้อัตโนมัติ</div>
      </div>
    `;
  }

  const footerTip = document.getElementById('batchWizardFooterTip');
  const actionBtns = document.getElementById('batchWizardActionButtons');
  if (footerTip) footerTip.textContent = '⏳ กรุณารอสักครู่ AI กำลังประมวลผลข้อสอบในชุดนี้...';
  if (actionBtns) {
    actionBtns.innerHTML = `
      <button type="button" class="btn btn-outline" onclick="pauseOrStopBatchQueue()" style="padding: 9px 16px; border-radius: 12px; font-weight: 700; color: #64748B;">
        ✕ ยกเลิกคิวที่เหลือ
      </button>
    `;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/exams/${exam.id}/recheck-full-set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText || 'Server error');
    }

    const data = await res.json();
    _batchRecheckResultsHistory.push(data);

    if (queueBar) queueBar.style.width = `${Math.round(((current + 1) / total) * 100)}%`;

    if (statTotal) statTotal.textContent = data.totalCount;
    if (statDup) statDup.textContent = data.deletedDuplicatesCount || 0;
    if (statFixed) statFixed.textContent = data.fixedCount;
    if (statPassed) statPassed.textContent = data.passedCount;

    if (statusPill) {
      statusPill.style.background = '#ECFDF5';
      statusPill.style.borderColor = '#A7F3D0';
      statusPill.style.color = '#047857';
    }
    if (statusDot) {
      statusDot.style.background = '#10B981';
      statusDot.style.animation = 'none';
    }
    if (statusText) statusText.textContent = '✅ ตรวจสอบชุดนี้เสร็จสิ้น! โปรดยืนยันผล';

    renderBatchCurrentSetResults(data);

    const hasNext = (current + 1) < total;
    const nextExam = hasNext ? _batchRecheckQueue[current + 1] : null;

    if (footerTip) {
      footerTip.innerHTML = `
        <span style="font-weight: 800; color: #15803D;">✅ ตรวจสอบชุดที่ ${current + 1}/${total} สำเร็จ</span>: 
        ลบข้อซ้ำ <strong>${data.deletedDuplicatesCount || 0}</strong> ข้อ, 
        แก้ไขออโต้ <strong>${data.fixedCount}</strong> ข้อ
      `;
    }

    if (actionBtns) {
      if (hasNext) {
        actionBtns.innerHTML = `
          <button type="button" class="btn btn-outline" onclick="openEditExamModal(${exam.id})" style="padding: 9px 14px; border-radius: 12px; font-weight: 700; font-size: 12.5px;" title="เปิดดูชุดนี้ในหน้าต่างแก้ไข">
            ✏️ ตรวจสอบชุดนี้
          </button>
          <button type="button" class="btn btn-outline" onclick="pauseOrStopBatchQueue()" style="padding: 9px 14px; border-radius: 12px; font-weight: 700; font-size: 12.5px; color: #991B1B; border-color: #FECACA;">
            ⏸️ หยุดแค่นี้
          </button>
          <button type="button" class="btn btn-primary" onclick="confirmAndProceedNextBatchStep()" style="background: linear-gradient(135deg, #059669, #10B981); border: none; padding: 10px 22px; border-radius: 12px; font-weight: 800; font-size: 13.5px; box-shadow: 0 4px 14px rgba(5,150,105,0.3); cursor: pointer;">
            <span>✅ ยืนยันผลชุดนี้ & ไปชุดถัดไป (${current + 2}/${total}) ➔</span>
          </button>
        `;
      } else {
        actionBtns.innerHTML = `
          <button type="button" class="btn btn-outline" onclick="openEditExamModal(${exam.id})" style="padding: 9px 14px; border-radius: 12px; font-weight: 700; font-size: 12.5px;">
            ✏️ ตรวจสอบชุดนี้
          </button>
          <button type="button" class="btn btn-primary" onclick="finishAllBatchRecheckQueue()" style="background: linear-gradient(135deg, #059669, #10B981); border: none; padding: 10px 24px; border-radius: 12px; font-weight: 800; font-size: 13.5px; box-shadow: 0 4px 14px rgba(5,150,105,0.3); cursor: pointer;">
            <span>🎉 ยืนยัน & เสร็จสิ้นการรีเช็คครบทุกชุด (${total} ชุด)</span>
          </button>
        `;
      }
    }

  } catch (err) {
    console.error(`Batch recheck error on exam #${exam.id}:`, err);
    if (statusPill) {
      statusPill.style.background = '#FEF2F2';
      statusPill.style.borderColor = '#FECACA';
      statusPill.style.color = '#DC2626';
    }
    if (statusText) statusText.textContent = '❌ เกิดข้อผิดพลาดในชุดนี้';
    if (bodyList) {
      bodyList.innerHTML = `
        <div style="background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 16px; padding: 24px; text-align: center; color: #991B1B;">
          <div style="font-size: 32px; margin-bottom: 8px;">⚠️</div>
          <div style="font-weight: 800; font-size: 15px; margin-bottom: 6px;">เกิดข้อผิดพลาดในการรีเช็คชุดนี้</div>
          <div style="font-size: 12.5px;">${escapeHTML(err.message)}</div>
        </div>
      `;
    }
    if (actionBtns) {
      actionBtns.innerHTML = `
        <button type="button" class="btn btn-outline" onclick="runBatchRecheckCurrentStep()" style="padding: 9px 16px; border-radius: 12px; font-weight: 700;">
          🔄 ลองใหม่อีกครั้ง
        </button>
        <button type="button" class="btn btn-outline" onclick="confirmAndProceedNextBatchStep()" style="padding: 9px 16px; border-radius: 12px; font-weight: 700;">
          ข้ามไปชุดถัดไป ➔
        </button>
        <button type="button" class="btn btn-outline" onclick="pauseOrStopBatchQueue()" style="padding: 9px 16px; border-radius: 12px; font-weight: 700; color: #991B1B;">
          ยุติคิว
        </button>
      `;
    }
  }
};

window.renderBatchCurrentSetResults = function(data) {
  const body = document.getElementById('batchCurrentDetailsList');
  if (!body) return;
  body.innerHTML = '';

  if (!data.results || data.results.length === 0) {
    body.innerHTML = `<div style="text-align: center; padding: 32px; color: #64748B;">ไม่พบรายการข้อสอบในชุดนี้</div>`;
    return;
  }

  data.results.forEach((r) => {
    const card = document.createElement('div');
    const isDupDeleted = r.status === 'DUPLICATE_DELETED';
    const isFixed = r.status === 'FIXED';

    card.style.cssText = isDupDeleted
      ? 'background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);'
      : isFixed
        ? 'background: white; border: 1.5px solid #FBCFE8; border-radius: 16px; padding: 16px; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.06);'
        : 'background: white; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);';

    const statusBadge = isDupDeleted
      ? `<span style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; font-size: 11.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">🗑️ ข้อสอบซ้ำ (ลบออกจากฐานข้อมูลแล้ว)</span>`
      : isFixed
        ? `<span style="background: #FDF2F8; color: #DB2777; border: 1px solid #FBCFE8; font-size: 11.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">⚡ แก้ไขอัตโนมัติแล้ว (มั่นใจ ${r.confidenceScore}%)</span>`
        : `<span style="background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; font-size: 11.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">✅ ผ่านการตรวจ (สมบูรณ์แล้ว)</span>`;

    let diffContent = '';
    if (isDupDeleted) {
      diffContent = `
        <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 12px; padding: 10px 14px; margin: 10px 0; font-size: 12.5px; color: #92400E;">
          <span style="font-weight: 800;">🗑️ ข้อสอบซ้ำ:</span> ${escapeHTML(r.reason)}
        </div>
        <div style="background: white; border: 1px solid #FDE68A; border-radius: 12px; padding: 12px; font-size: 12px; color: #78350F;">
          <div style="font-weight: 700; margin-bottom: 4px;">${escapeHTML(r.before.questionText)}</div>
          <div style="color: #92400E; font-size: 11.5px;">ก. ${escapeHTML(r.before.choice1)} | ข. ${escapeHTML(r.before.choice2)} | ค. ${escapeHTML(r.before.choice3)} | ง. ${escapeHTML(r.before.choice4)}</div>
          <div style="margin-top: 4px; font-weight: 800;">เฉลยเดิม: ข้อ ${r.before.correctAnswer}</div>
        </div>
      `;
    } else if (isFixed) {
      diffContent = `
        <div style="background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 12px; padding: 10px 14px; margin: 10px 0; font-size: 12.5px; color: #9F1239;">
          <span style="font-weight: 800;">🛠️ AI ปรับปรุงแก้ไข:</span> ${escapeHTML(r.reason)}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
          <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 10px; font-size: 11.5px;">
            <div style="font-weight: 800; color: #64748B; margin-bottom: 4px;">❌ ก่อนแก้ไข:</div>
            <div style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">${escapeHTML(r.before.questionText)}</div>
            <div style="color: #475569; font-size: 11px;">ก. ${escapeHTML(r.before.choice1)} | ข. ${escapeHTML(r.before.choice2)} | ค. ${escapeHTML(r.before.choice3)} | ง. ${escapeHTML(r.before.choice4)}</div>
            <div style="margin-top: 4px; font-weight: 800; color: #BD1B0B;">เฉลย: ข้อ ${r.before.correctAnswer}</div>
          </div>
          <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 10px; font-size: 11.5px;">
            <div style="font-weight: 800; color: #15803D; margin-bottom: 4px;">✨ หลังแก้ไข (ลง DB):</div>
            <div style="font-weight: 800; color: #0F172A; margin-bottom: 4px;">${escapeHTML(r.after.questionText)}</div>
            <div style="color: #166534; font-size: 11px;">ก. ${escapeHTML(r.after.choice1)} | ข. ${escapeHTML(r.after.choice2)} | ค. ${escapeHTML(r.after.choice3)} | ง. ${escapeHTML(r.after.choice4)}</div>
            <div style="margin-top: 4px; font-weight: 800; color: #059669;">เฉลยใหม่: ข้อ ${r.after.correctAnswer}</div>
          </div>
        </div>
      `;
    } else {
      diffContent = `
        <div style="margin-top: 8px; font-size: 12.5px; color: #334155;">
          <div style="font-weight: 700; margin-bottom: 4px;">${escapeHTML(r.after.questionText)}</div>
          <div style="font-size: 11.5px; color: #64748B;">เฉลยข้อ ${r.after.correctAnswer} • คำอธิบาย: ${escapeHTML(r.after.explanation || '-')}</div>
        </div>
      `;
    }

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #F3E8FF; color: #7C3AED; font-weight: 800; font-size: 12px;">
            ${r.questionNumber}
          </span>
          <span style="font-weight: 800; color: #1E293B; font-size: 13px;">ข้อที่ ${r.questionNumber}</span>
          <span style="font-size: 11px; color: #94A3B8; font-family: monospace;">(ID: ${r.questionId})</span>
        </div>
        ${statusBadge}
      </div>
      ${diffContent}
    `;

    body.appendChild(card);
  });
};

window.confirmAndProceedNextBatchStep = function() {
  _batchCurrentQueueIndex++;
  if (_batchCurrentQueueIndex < _batchRecheckQueue.length) {
    runBatchRecheckCurrentStep();
  } else {
    finishAllBatchRecheckQueue();
  }
};

window.pauseOrStopBatchQueue = function() {
  if (!confirm('คุณต้องการหยุดการรีเช็คคิวที่เหลือใช่หรือไม่? (ชุดที่ตรวจสอบและยืนยันไปแล้วได้รับการบันทึกเรียบร้อย)')) {
    return;
  }
  closeBatchAiRecheckWizardModal();
  loadExams();
};

window.finishAllBatchRecheckQueue = function() {
  const total = _batchRecheckQueue.length;
  const totalFixed = _batchRecheckResultsHistory.reduce((sum, r) => sum + (r.fixedCount || 0), 0);
  const totalDup = _batchRecheckResultsHistory.reduce((sum, r) => sum + (r.deletedDuplicatesCount || 0), 0);

  closeBatchAiRecheckWizardModal();
  loadExams();

  alert(`🎉 รีเช็คและยืนยันข้อสอบครบทั้ง ${total} ชุดเรียบร้อยแล้ว!\n\n• ลบข้อสอบซ้ำรวม: ${totalDup} ข้อ\n• แก้ไขข้อสอบอัตโนมัติรวม: ${totalFixed} ข้อ\n\nฐานข้อมูลได้รับการปรับปรุงสมบูรณ์แล้ว!`);
};

window.closeBatchAiRecheckWizardModal = function() {
  const wizard = document.getElementById('batchAiRecheckWizardModal');
  if (wizard) wizard.style.display = 'none';
};
