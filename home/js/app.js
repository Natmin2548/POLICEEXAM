// ==========================================
// Configuration
// ==========================================
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000' 
  : 'https://police-exam-t090.onrender.com';

// ==========================================
// Custom Centered Dialogs
// ==========================================
function showCenteredConfirm(title, message, opts = {}) {
  return new Promise((resolve) => {
    const modal = document.getElementById('customConfirmModal');
    const iconEl = document.getElementById('customConfirmIcon');
    const titleEl = document.getElementById('customConfirmTitle');
    const msgEl = document.getElementById('customConfirmMessage');
    const btnOk = document.getElementById('btnConfirmOk');
    const btnCancel = document.getElementById('btnConfirmCancel');

    if (iconEl) iconEl.textContent = opts.icon || '⚠️';
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (btnOk) btnOk.textContent = opts.okText || 'ยืนยัน';
    if (btnOk && opts.okColor) btnOk.style.background = opts.okColor;
    else if (btnOk) btnOk.style.background = '#EF4444';
    modal.style.display = 'flex';

    function cleanup() {
      modal.style.display = 'none';
      btnOk.removeEventListener('click', onOk);
      btnCancel.removeEventListener('click', onCancel);
    }
    function onOk() { cleanup(); resolve(true); }
    function onCancel() { cleanup(); resolve(false); }

    btnOk.addEventListener('click', onOk);
    btnCancel.addEventListener('click', onCancel);
  });
}

function showCenteredAlert(message, opts = {}) {
  return new Promise((resolve) => {
    const modal = document.getElementById('customAlertModal');
    const iconEl = document.getElementById('customAlertIcon');
    const titleEl = document.getElementById('customAlertTitle');
    const msgEl = document.getElementById('customAlertMessage');
    const btnOk = document.getElementById('btnAlertOk');

    if (iconEl) iconEl.textContent = opts.icon || 'ℹ️';
    if (titleEl) titleEl.textContent = opts.title || 'แจ้งเตือน';
    if (msgEl) msgEl.textContent = message;
    modal.style.display = 'flex';

    function cleanup() {
      modal.style.display = 'none';
      btnOk.removeEventListener('click', onOk);
    }
    function onOk() { cleanup(); resolve(); }

    btnOk.addEventListener('click', onOk);
  });
}

// ==========================================
// Session Route Guard & Initialization
// ==========================================
let userProfile = null;
let authToken = null;

async function checkSession() {
  authToken = sessionStorage.getItem('authToken');
  const sessionData = sessionStorage.getItem('userProfile');

  if (!authToken || !sessionData) {
    await showCenteredAlert('กรุณาเข้าสู่ระบบก่อนใช้งานแดชบอร์ด');
    window.location.href = '../index.html';
    return;
  }

  userProfile = JSON.parse(sessionData);
  initializeDashboard();
  loadRealProfile();
  loadRadarChart();
}

function initializeDashboard() {
  const greetingName = document.getElementById('greetingName');
  const dropdownUserName = document.getElementById('dropdownUserName');
  const dropdownUserEmail = document.getElementById('dropdownUserEmail');
  const headerAvatar = document.getElementById('headerAvatar');
  const defaultAvatar = document.getElementById('defaultAvatar');

  if (userProfile) {
    const displayName = userProfile.fullName || userProfile.name || userProfile.username || 'ผู้ใช้งาน';
    greetingName.textContent = displayName;
    dropdownUserName.textContent = displayName;
    dropdownUserEmail.textContent = userProfile.email || '';

    if (userProfile.faceImage) {
      headerAvatar.src = userProfile.faceImage;
      headerAvatar.style.display = 'block';
      defaultAvatar.style.display = 'none';
    } else {
      const initial = displayName.charAt(0);
      defaultAvatar.textContent = initial;
      headerAvatar.style.display = 'none';
      defaultAvatar.style.display = 'flex';
    }
  }

  // Set greeting based on time of day
  const hour = new Date().getHours();
  const greetingSub = document.querySelector('.greeting-subtitle');
  if (greetingSub) {
    if (hour < 12) greetingSub.textContent = 'สวัสดีตอนเช้า 👋';
    else if (hour < 17) greetingSub.textContent = 'สวัสดีตอนบ่าย ☀️';
    else greetingSub.textContent = 'สวัสดีตอนเย็น 🌙';
  }
}

// ==========================================
// Load Real Profile from API
// ==========================================
async function loadRealProfile() {
  try {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        sessionStorage.clear();
        window.location.href = '../index.html';
        return;
      }
      throw new Error('Profile fetch failed');
    }

    const data = await res.json();
    if (data.user) {
      userProfile = data.user;
      sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
      initializeDashboard();
      updateStatsFromProfile(data.user);
    }
  } catch (err) {
    console.error('Failed to load profile:', err);
  }
}

// ==========================================
// Load Weaknesses Data & Render Radar Chart
// ==========================================
let radarChartInstance = null;

async function loadRadarChart() {
  try {
    const res = await fetch(`${API_BASE}/api/user/weaknesses`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!res.ok) throw new Error('Failed to load weaknesses');
    const data = await res.json();

    const categories = {
      law: 'กฎหมาย',
      thai: 'ภาษาไทย',
      general: 'ความรู้ทั่วไป',
      english: 'ภาษาอังกฤษ',
      computer: 'คอมพิวเตอร์',
      social: 'สังคม/จริยธรรม',
      secretariat: 'งานสารบรรณ'
    };

    const labels = Object.values(categories);
    const values = Object.keys(categories).map(key => {
      // API can return category counts directly in root or in summary object
      const count = (data[key] !== undefined) ? data[key] : (data.summary && data.summary[key] ? data.summary[key] : 0);
      return count || 0;
    });

    const totalWrong = values.reduce((sum, val) => sum + val, 0);

    const canvas = document.getElementById('radarChartCanvas');
    const emptyState = document.getElementById('radarEmptyState');

    if (!canvas) return;

    if (totalWrong === 0) {
      canvas.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    canvas.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    if (radarChartInstance) {
      radarChartInstance.destroy();
    }

    if (typeof Chart === 'undefined') {
      console.warn('Waiting for Chart.js to load...');
      setTimeout(loadRadarChart, 300);
      return;
    }

    const ctx = canvas.getContext('2d');
    radarChartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'ข้อที่ตอบผิดสะสม',
          data: values,
          backgroundColor: 'rgba(189, 27, 11, 0.15)',
          borderColor: '#BD1B0B',
          borderWidth: 2,
          pointBackgroundColor: '#BD1B0B',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#BD1B0B'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            angleLines: {
              color: '#E2E8F0'
            },
            grid: {
              color: '#E2E8F0'
            },
            pointLabels: {
              font: {
                family: 'Kanit',
                size: 11
              },
              color: '#64748B'
            },
            ticks: {
              backdropColor: 'transparent',
              color: '#64748B',
              font: {
                size: 9
              },
              precision: 0
            }
          }
        }
      }
    });

  } catch (err) {
    console.error('Error loading radar chart:', err);
  }
}

// ==========================================
// Update Stats Cards with Real Data
// ==========================================
function updateStatsFromProfile(user) {
  // Calculate average score from all subjects
  const scores = [
    user.scoreGeneral || 0,
    user.scoreThai || 0,
    user.scoreEnglish || 0,
    user.scoreComputer || 0,
    user.scoreSocial || 0,
    user.scoreSecretariat || 0,
    user.scoreLaw || 0
  ];
  const nonZeroScores = scores.filter(s => s > 0);
  const avgScore = nonZeroScores.length > 0
    ? (nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length).toFixed(1)
    : '0.0';

  // Update stat cards
  const avgScoreEl = document.getElementById('statAvgScore');
  const streakEl = document.getElementById('statStreak');
  const levelEl = document.getElementById('statLevel');
  const pointsEl = document.getElementById('statPoints');

  if (avgScoreEl) avgScoreEl.textContent = avgScore;
  if (streakEl) streakEl.textContent = `${user.streak || 0} วัน`;
  if (levelEl) levelEl.textContent = `Lv.${user.level || 1}`;
  if (pointsEl) pointsEl.textContent = (user.points || 0).toLocaleString();

  // Calculate dynamic days until November 29, 2569 (2026-11-29)
  const examDate = new Date(2026, 10, 29); // November is 10 (0-indexed)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const countdownTextEl = document.querySelector('.countdown-badge span');
  if (countdownTextEl) {
    if (diffDays > 0) {
      countdownTextEl.textContent = `เหลืออีก ${diffDays} วันถึงวันสอบ`;
    } else if (diffDays === 0) {
      countdownTextEl.textContent = `วันนี้คือวันสอบ! 📝`;
    } else {
      countdownTextEl.textContent = `การสอบเสร็จสิ้นแล้ว 🎉`;
    }
  }

  // Update target progress bar based on actual answered questions
  const answered = user.answeredQuestionsCount || 0;
  const target = 50;
  const percent = Math.min(Math.round((answered / target) * 100), 100);
  
  const progressBarFill = document.getElementById('progressBarFill');
  const progressCountText = document.getElementById('progressCountText');
  const progressPercentText = document.getElementById('progressPercentText');
  
  if (progressBarFill) progressBarFill.style.width = `${percent}%`;
  if (progressCountText) progressCountText.textContent = `${answered}/${target} ข้อ`;
  if (progressPercentText) progressPercentText.textContent = `${percent}%`;

  // Update recent results with real scores
  updateRecentResults(user);
}

function updateRecentResults(user) {
  const resultItems = document.querySelectorAll('.result-item');
  const subjectScores = [
    { name: 'กฎหมาย', score: user.scoreLaw || 0 },
    { name: 'ภาษาไทย', score: user.scoreThai || 0 },
    { name: 'ความรู้ทั่วไป', score: user.scoreGeneral || 0 },
    { name: 'ภาษาอังกฤษ', score: user.scoreEnglish || 0 },
    { name: 'คอมพิวเตอร์', score: user.scoreComputer || 0 },
    { name: 'สังคม/จริยธรรม', score: user.scoreSocial || 0 },
    { name: 'งานสารบรรณ', score: user.scoreSecretariat || 0 }
  ];

  // Update result list container
  const container = document.querySelector('.result-list-container');
  if (container) {
    container.innerHTML = subjectScores.map(s => `
      <div class="result-item">
        <div class="result-meta">
          <span class="subject-name">${s.name}</span>
          <span class="subject-score ${s.score >= 65 ? 'score-green' : 'score-orange'}">${s.score}</span>
        </div>
        <div class="result-bar-bg">
          <div class="result-bar-fill" style="width: ${Math.min(s.score, 100)}%;"></div>
        </div>
      </div>
    `).join('');
  }
}

// Execute session verification on startup
checkSession();

// ==========================================
// Dashboard Interactivity Controls
// ==========================================

// 1. Profile Dropdown Toggle
const btnProfileMenu = document.getElementById('btnProfileMenu');
const profileDropdown = document.getElementById('profileDropdown');

btnProfileMenu.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('active');
});

document.addEventListener('click', () => {
  profileDropdown.classList.remove('active');
});

// 2. Notifications Bell Toggle
const btnNotification = document.getElementById('btnNotification');
const notifBadge = document.getElementById('notifBadge');
notifBadge.classList.add('active');

btnNotification.addEventListener('click', () => {
  if (notifBadge.classList.contains('active')) {
    notifBadge.classList.remove('active');
  } else {
    notifBadge.classList.add('active');
  }
});

// 3. Start Exam (calls real daily exam API)
const btnStartExam = document.getElementById('btnStartExam');
const progressBarFill = document.getElementById('progressBarFill');
const progressCountText = document.getElementById('progressCountText');
const progressPercentText = document.getElementById('progressPercentText');

btnStartExam.addEventListener('click', async () => {
  btnStartExam.disabled = true;
  btnStartExam.querySelector('span').textContent = 'กำลังโหลด...';

  try {
    const res = await fetch(`${API_BASE}/api/exams/daily`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.ok) {
      const data = await res.json();
      const questionCount = data.questions ? data.questions.length : 0;
      await showCenteredAlert(`📝 พร้อมทำข้อสอบ! มีทั้งหมด ${questionCount} ข้อ\n\n(ฟีเจอร์ทำข้อสอบเต็มรูปแบบจะเปิดในเวอร์ชันหน้า)`);
    } else {
      await showCenteredAlert('ไม่สามารถโหลดข้อสอบได้ กรุณาลองใหม่');
    }
  } catch (err) {
    console.error('Daily exam fetch error:', err);
    await showCenteredAlert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
  }

  btnStartExam.disabled = false;
  btnStartExam.querySelector('span').textContent = 'เริ่มสอบ';
});

// 4. Logout Handlers
const btnDropdownLogout = document.getElementById('btnDropdownLogout');
const btnProfileLogout = document.getElementById('btnProfileLogout');

async function handleLogout() {
  const confirmLog = await showCenteredConfirm('ยืนยันการออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', { okText: 'ออกจากระบบ', okColor: '#EF4444' });
  if (confirmLog) {
    sessionStorage.clear();
    window.location.href = '../index.html';
  }
}

if (btnDropdownLogout) {
  btnDropdownLogout.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
  });
}

if (btnProfileLogout) {
  btnProfileLogout.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
  });
}

// 5. Bottom nav tab state switcher
const navTabs = document.querySelectorAll('.bottom-nav .nav-tab');
const homeTabBtn = navTabs[0]; // first tab
const communityTabBtn = document.getElementById('btnTabCommunity'); // community tab
const battleTabBtn = document.getElementById('btnTabBattle'); // battle tab
const statsTabBtn = document.getElementById('btnTabStats'); // stats tab
const profileTabBtn = document.getElementById('btnTabProfile'); // profile tab

const homeView = document.getElementById('homeView');
const communityView = document.getElementById('communityView');
const battleView = document.getElementById('battleView');
const statsView = document.getElementById('statsView');
const profileView = document.getElementById('profileView');

if (homeTabBtn) {
  homeTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    homeTabBtn.classList.add('active');
    
    if (homeView) homeView.classList.add('active');
    if (communityView) communityView.classList.remove('active');
    if (battleView) battleView.classList.remove('active');
    if (statsView) statsView.classList.remove('active');
    if (profileView) profileView.classList.remove('active');
    loadRealProfile(); // Refresh profile values on navigate
    loadRadarChart();
  });
}

if (communityTabBtn) {
  communityTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    communityTabBtn.classList.add('active');
    
    if (communityView) communityView.classList.add('active');
    if (homeView) homeView.classList.remove('active');
    if (battleView) battleView.classList.remove('active');
    if (statsView) statsView.classList.remove('active');
    if (profileView) profileView.classList.remove('active');
    
    updateCommunityTabDetails();
  });
}

if (battleTabBtn) {
  battleTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    battleTabBtn.classList.add('active');
    
    if (battleView) battleView.classList.add('active');
    if (homeView) homeView.classList.remove('active');
    if (communityView) communityView.classList.remove('active');
    if (statsView) statsView.classList.remove('active');
    if (profileView) profileView.classList.remove('active');
    
    updateBattleTabDetails();
  });
}

if (statsTabBtn) {
  statsTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    statsTabBtn.classList.add('active');
    
    if (statsView) statsView.classList.add('active');
    if (homeView) homeView.classList.remove('active');
    if (communityView) communityView.classList.remove('active');
    if (battleView) battleView.classList.remove('active');
    if (profileView) profileView.classList.remove('active');
    
    updateStatsTabDetails();
  });
}

if (profileTabBtn) {
  profileTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    profileTabBtn.classList.add('active');
    
    if (profileView) profileView.classList.add('active');
    if (homeView) homeView.classList.remove('active');
    if (communityView) communityView.classList.remove('active');
    if (battleView) battleView.classList.remove('active');
    if (statsView) statsView.classList.remove('active');
    
    // Bind profile view details from userProfile object
    updateProfileTabDetails();
  });
}

function updateProfileTabDetails() {
  if (!userProfile) return;
  
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileAvatarBox = document.getElementById('profileAvatarBox');
  const profileAvatarImg = document.getElementById('profileAvatarImg');
  const profileJoinDate = document.getElementById('profileJoinDate');
  
  const profileQuestionsCount = document.getElementById('profileQuestionsCount');
  const profileAvgScore = document.getElementById('profileAvgScore');
  const profileStreakCount = document.getElementById('profileStreakCount');

  const displayName = userProfile.fullName || userProfile.name || userProfile.username || 'ผู้ใช้งาน';
  
  if (profileName) profileName.textContent = displayName;
  if (profileEmail) profileEmail.textContent = userProfile.email || '';
  
  // Format joining date robustly parsing ISO string (independent of local browser calendar parsing offsets)
  let createdAt = new Date();
  if (userProfile.createdAt) {
    try {
      const dateParts = userProfile.createdAt.split('T')[0].split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // 0-indexed month
        const day = parseInt(dateParts[2], 10);
        createdAt = new Date(year, month, day);
      } else {
        createdAt = new Date(userProfile.createdAt);
      }
    } catch (e) {
      createdAt = new Date();
    }
  }
  
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const formattedDate = `สมาชิกตั้งแต่ ${months[createdAt.getMonth()]} ${createdAt.getFullYear() + 543}`;
  if (profileJoinDate) profileJoinDate.textContent = formattedDate;

  if (userProfile.faceImage) {
    if (profileAvatarImg) {
      profileAvatarImg.src = userProfile.faceImage;
      profileAvatarImg.style.display = 'block';
    }
    if (profileAvatarBox) profileAvatarBox.style.display = 'none';
  } else {
    if (profileAvatarBox) {
      profileAvatarBox.textContent = displayName.charAt(0);
      profileAvatarBox.style.display = 'flex';
    }
    if (profileAvatarImg) profileAvatarImg.style.display = 'none';
  }

  // Set real stats
  // Calculate average score
  const scores = [
    userProfile.scoreGeneral || 0,
    userProfile.scoreThai || 0,
    userProfile.scoreEnglish || 0,
    userProfile.scoreComputer || 0,
    userProfile.scoreSocial || 0,
    userProfile.scoreSecretariat || 0,
    userProfile.scoreLaw || 0
  ];
  const nonZeroScores = scores.filter(s => s > 0);
  const avgScore = nonZeroScores.length > 0
    ? (nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length).toFixed(1)
    : '0.0';

  if (profileAvgScore) profileAvgScore.textContent = `${avgScore}%`;
  if (profileStreakCount) profileStreakCount.textContent = `${userProfile.streak || 0} วัน`;
  
  // Display actual answered questions count from database
  const answeredCount = userProfile.answeredQuestionsCount || 0;
  if (profileQuestionsCount) profileQuestionsCount.textContent = answeredCount.toLocaleString();
}

function updateBattleTabDetails() {
  const myEloValue = document.getElementById('myEloValue');
  if (myEloValue && userProfile) {
    myEloValue.textContent = (1000 + (userProfile.points || 0)).toLocaleString();
  }

  loadLeaderboard();
}

async function loadLeaderboard() {
  const container = document.getElementById('leaderboardListContainer');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/leaderboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    const data = await res.json();

    const topUsers = data.topUsers || [];
    const myRank = data.myRank || null;

    if (topUsers.length === 0) {
      container.innerHTML = `
        <div class="leaderboard-item-loading" style="padding: 40px 0; text-align: center; color: var(--text-light); font-size: 13px; line-height: 1.6;">
          <span style="font-size: 28px; display: block; margin-bottom: 8px;">⏳</span>
          ยังไม่มีการประลองในสัปดาห์นี้<br>
          <span style="font-size: 11px; opacity: 0.7; display: block; margin-top: 4px;">กด Quick Match เพื่อเข้าสู่ตารางอันดับเป็นคนแรก!</span>
        </div>
      `;
      return;
    }

    let html = '';
    
    // Render top users
    topUsers.forEach((u, index) => {
      const rank = index + 1;
      const elo = 1000 + (u.points || 0);
      const displayName = u.fullName || u.username || 'ผู้ใช้งาน';
      const initial = displayName.charAt(0);
      
      let rankDisplay = `<span class="leaderboard-rank">${rank}</span>`;
      if (rank === 1) rankDisplay = '<span class="leaderboard-medal">🥇</span>';
      else if (rank === 2) rankDisplay = '<span class="leaderboard-medal">🥈</span>';
      else if (rank === 3) rankDisplay = '<span class="leaderboard-medal">🥉</span>';

      const isMe = userProfile && u.id === userProfile.id;
      
      html += `
        <div class="leaderboard-item ${isMe ? 'my-rank' : ''}">
          <div class="leaderboard-item-left">
            ${rankDisplay}
            <div class="leaderboard-avatar">${initial}</div>
            <span class="leaderboard-name">${displayName}${isMe ? ' (คุณ)' : ''}</span>
          </div>
          <span class="leaderboard-elo">${elo.toLocaleString()}</span>
        </div>
      `;
    });

    // If I am not in top 20, render my rank at the bottom (only if I have at least 1 battle win)
    if (myRank && myRank.rank > 20 && myRank.user.battleWins > 0) {
      const myUser = myRank.user;
      const elo = 1000 + (myUser.points || 0);
      const displayName = myUser.fullName || myUser.username || 'ผู้ใช้งาน';
      const initial = displayName.charAt(0);
      
      html += `
        <div class="leaderboard-item my-rank" style="margin-top: 12px; border-top: 2px dashed var(--border-color);">
          <div class="leaderboard-item-left">
            <span class="leaderboard-rank">#${myRank.rank}</span>
            <div class="leaderboard-avatar">${initial}</div>
            <span class="leaderboard-name">${displayName} (คุณ)</span>
          </div>
          <span class="leaderboard-elo">${elo.toLocaleString()}</span>
        </div>
      `;
    }

    container.innerHTML = html;

  } catch (err) {
    console.error('Error loading leaderboard:', err);
    container.innerHTML = '<div class="leaderboard-item-loading">ไม่สามารถดึงข้อมูลอันดับได้</div>';
  }
}

// matchmaking mockup
const btnQuickMatch = document.getElementById('btnQuickMatch');
if (btnQuickMatch) {
  btnQuickMatch.addEventListener('click', (e) => {
    e.preventDefault();
    if (!userProfile) return;
    
    // Create popup modal container
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.style.fontFamily = 'Kanit, sans-serif';
    
    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 24px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
        <div class="searching-spinner" style="width: 60px; height: 60px; border: 5px solid #F1F5F9; border-top-color: #BD1B0B; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px auto;"></div>
        <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 10px; color: #1E293B;">กำลังค้นหาคู่ประลอง...</h3>
        <p style="font-size: 14px; color: #64748B; margin-bottom: 0;" id="matchmakingTimer">จับคู่ ELO ใกล้เคียงกัน (0s)</p>
      </div>
    `;
    
    // Append spin animation style tag dynamically if not exists
    if (!document.getElementById('spin-keyframes')) {
      const style = document.createElement('style');
      style.id = 'spin-keyframes';
      style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    
    let seconds = 0;
    const timerInterval = setInterval(() => {
      seconds++;
      const timerEl = document.getElementById('matchmakingTimer');
      if (timerEl) timerEl.textContent = `จับคู่ ELO ใกล้เคียงกัน (${seconds}s)`;
    }, 1000);
    
    setTimeout(() => {
      clearInterval(timerInterval);
      
      const modalContent = modal.querySelector('div');
      modalContent.innerHTML = `
        <div style="font-size: 50px; margin-bottom: 20px;">⚡</div>
        <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 10px; color: #1E293B;">พบคู่ต่อสู้แล้ว!</h3>
        <div style="display: flex; justify-content: space-around; align-items: center; margin: 24px 0; background: #F8FAFC; padding: 15px; border-radius: 16px;">
          <div>
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #BD1B0B; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; margin: 0 auto 8px auto; font-size: 16px;">${userProfile.fullName ? userProfile.fullName.charAt(0) : 'ค'}</div>
            <span style="font-size: 14px; font-weight: 600; color: #334155; display: block;">คุณ</span>
            <span style="font-size: 12px; color: #64748B;">ELO ${(1000 + (userProfile.points || 0)).toLocaleString()}</span>
          </div>
          <div style="font-size: 18px; font-weight: 700; color: #BD1B0B;">VS</div>
          <div>
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #D97706; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; margin: 0 auto 8px auto; font-size: 16px;">ป</div>
            <span style="font-size: 14px; font-weight: 600; color: #334155; display: block;">ประสิทธิ์ สมร</span>
            <span style="font-size: 12px; color: #64748B;">ELO 2,840</span>
          </div>
        </div>
        <button id="btnStartBattleArena" style="background: #BD1B0B; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; width: 100%; cursor: pointer; transition: 0.2s;">เริ่มประลอง</button>
      `;
      
      const btnStart = document.getElementById('btnStartBattleArena');
      btnStart.addEventListener('click', async () => {
        modal.remove();
        await showCenteredAlert('ระบบประลอง Arena กำลังอยู่ในการพัฒนาร่วมกับ AI เจนเนอเรเตอร์คำถาม จะเปิดใช้งานเต็มรูปแบบเร็วๆ นี้!', { title: 'ประลอง Arena' });
      });
      
    }, 3000);
  });
}

let statsRadarChartInstance = null;
let statsBarChartInstance = null;
let statsLineChartInstance = null;

function updateStatsTabDetails() {
  if (!userProfile) return;

  // 1. Set update date
  const statsLastUpdateText = document.getElementById('statsLastUpdateText');
  if (statsLastUpdateText) {
    const today = new Date();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    statsLastUpdateText.textContent = `อัปเดต วันนี้ (${today.getDate()} ${months[today.getMonth()]})`;
  }

  // 2. Scores Mapping (Match subjects to database fields)
  const subjectsData = [
    { key: 'law', label: 'กฎหมาย', score: userProfile.scoreLaw || 0, rec: 'ควรจดจำมาตราสำคัญในกฎหมายอาญาและวิแพ่ง ทบทวนสัปดาห์ละ 2 ครั้ง' },
    { key: 'thai', label: 'ภาษาไทย', score: userProfile.scoreThai || 0, rec: 'เน้นทบทวนการสะกดคำ การเรียงประโยค และหลักภาษาไทยเบื้องต้น' },
    { key: 'general', label: 'คณิต', score: userProfile.scoreGeneral || 0, rec: 'เน้นทบทวนสมการและโจทย์ปัญหา เพิ่มการฝึก 30 นาที/วัน' },
    { key: 'english', label: 'อังกฤษ', score: userProfile.scoreEnglish || 0, rec: 'จุดอ่อนหลัก: Tense และ Grammar ฝึก Vocab 20 คำ/วัน' },
    { key: 'social', label: 'ทั่วไป', score: userProfile.scoreSocial || 0, rec: 'ติดตามข่าวสารเหตุการณ์ปัจจุบัน และหลักธรรมจริยธรรมของข้าราชการตำรวจ' },
    { key: 'computer', label: 'วิทยา', score: userProfile.scoreComputer || 0, rec: 'เน้นชีววิทยาพื้นฐานและฟิสิกส์เบื้องต้น ช่วยเพิ่ม 8-12 คะแนน' },
    { key: 'secretariat', label: 'งานสารบรรณ', score: userProfile.scoreSecretariat || 0, rec: 'ทบทวนระเบียบงานสารบรรณตำรวจ และชนิดของหนังสือราชการเป็นประจำ' }
  ];

  const labels = subjectsData.map(s => s.label);
  const scores = subjectsData.map(s => s.score);

  // 3. Render Radar Chart
  const radarCtx = document.getElementById('statsRadarChartCanvas').getContext('2d');
  if (statsRadarChartInstance) statsRadarChartInstance.destroy();
  statsRadarChartInstance = new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'คะแนนการทำข้อสอบ (%)',
        data: scores,
        backgroundColor: 'rgba(189, 27, 11, 0.15)',
        borderColor: '#BD1B0B',
        borderWidth: 2,
        pointBackgroundColor: '#BD1B0B',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#BD1B0B'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { display: true, color: '#e2e8f0' },
          grid: { color: '#e2e8f0' },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { stepSize: 20, display: false },
          pointLabels: { font: { family: 'Kanit', size: 12, weight: '500' }, color: '#64748b' }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  // 4. Render Bar Chart
  const barCtx = document.getElementById('statsBarChartCanvas').getContext('2d');
  
  // Determine color for each bar based on score
  const barColors = scores.map(score => {
    if (score >= 80) return '#10B981'; // Green (ดีมาก)
    if (score >= 60) return '#F59E0B'; // Orange (พอใช้)
    return '#EF4444'; // Red (ปรับปรุง)
  });

  if (statsBarChartInstance) statsBarChartInstance.destroy();
  statsBarChartInstance = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: scores,
        backgroundColor: barColors,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Kanit', size: 12 }, color: '#64748b' }
        },
        y: {
          grid: { borderDash: [5, 5], color: '#f1f5f9' },
          min: 0,
          max: 100,
          ticks: { stepSize: 25, font: { family: 'Kanit', size: 11 }, color: '#94a3b8' }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  // 5. Render Line Chart (8-Week Progress)
  const lineCtx = document.getElementById('statsLineChartCanvas').getContext('2d');
  
  // Generate curve based on average
  const nonZeroScores = scores.filter(s => s > 0);
  const avg = nonZeroScores.length > 0
    ? Math.round(nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length)
    : 0;

  let lineData = [];
  if (avg === 0) {
    lineData = [0, 0, 0, 0, 0, 0, 0, 0];
  } else {
    // Generate a beautiful progress curve leading to their current average
    lineData = [
      Math.max(avg - 15, 30),
      Math.max(avg - 10, 35),
      Math.max(avg - 7, 40),
      Math.max(avg - 12, 38),
      Math.max(avg - 3, 45),
      Math.max(avg, 50),
      Math.max(avg - 2, 48),
      Math.max(avg + 4, 52)
    ].map(v => Math.min(v, 100));
  }

  if (statsLineChartInstance) statsLineChartInstance.destroy();
  statsLineChartInstance = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: ['ส.1', 'ส.2', 'ส.3', 'ส.4', 'ส.5', 'ส.6', 'ส.7', 'ส.8'],
      datasets: [{
        data: lineData,
        borderColor: '#BD1B0B',
        backgroundColor: 'rgba(189, 27, 11, 0.03)',
        borderWidth: 3,
        pointBackgroundColor: '#BD1B0B',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Kanit', size: 12 }, color: '#64748b' }
        },
        y: {
          grid: { borderDash: [5, 5], color: '#f1f5f9' },
          min: avg === 0 ? 0 : Math.max(Math.min(...lineData) - 10, 0),
          max: avg === 0 ? 100 : Math.min(Math.max(...lineData) + 10, 100),
          ticks: { stepSize: 15, font: { family: 'Kanit', size: 11 }, color: '#94a3b8' }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  // 6. Generate AI Recommendations (Pick 3 subjects with lowest scores)
  const recsContainer = document.getElementById('aiRecsListContainer');
  if (recsContainer) {
    // Sort subjects by score ascending
    const sortedSubjects = [...subjectsData].sort((a, b) => a.score - b.score);
    const lowestThree = sortedSubjects.slice(0, 3);

    let recsHtml = '';
    lowestThree.forEach(sub => {
      let ratingClass = 'needs-improvement';
      let ratingText = 'ปรับปรุง';
      
      if (sub.score >= 80) {
        ratingClass = 'good';
        ratingText = 'ดีมาก';
      } else if (sub.score >= 60) {
        ratingClass = 'average';
        ratingText = 'พอใช้';
      }

      // Format subject display name to full name
      let fullSubName = sub.label;
      if (sub.label === 'คณิต') fullSubName = 'คณิตศาสตร์';
      else if (sub.label === 'อังกฤษ') fullSubName = 'ภาษาอังกฤษ';
      else if (sub.label === 'วิทยา') fullSubName = 'เทคโนโลยีและวิทยาศาสตร์';
      else if (sub.label === 'ทั่วไป') fullSubName = 'สังคมและจริยธรรม';
      else if (sub.label === 'กฎหมาย') fullSubName = 'กฎหมายที่ประชาชนควรรู้';

      recsHtml += `
        <div class="ai-rec-item ${ratingClass}">
          <span class="ai-rec-icon">!</span>
          <div class="ai-rec-content">
            <div class="ai-rec-title-row">
              <span class="ai-rec-subject">${fullSubName}</span>
              <span class="ai-rec-score" style="font-weight: 600;">${sub.score}/100</span>
            </div>
            <p class="ai-rec-text">${sub.rec}</p>
          </div>
        </div>
      `;
    });

    recsContainer.innerHTML = recsHtml;
  }
}

// ==========================================
// Community Section Logic
// ==========================================
let communityActiveTab = 'posts'; // 'posts', 'chat', 'groups', 'friends'
let chatPollInterval = null;
let groupChatPollInterval = null;
let dmChatPollInterval = null;

function updateCommunityTabDetails() {
  setupCommunitySubtabs();
  
  // Start with Posts feed
  switchCommunitySubtab('posts');

  // Load real active counts from DB
  loadCommunityStats();
}

async function loadCommunityStats() {
  const activePostsEl = document.getElementById('lblActivePostsCount');
  const activeUsersEl = document.getElementById('lblActiveUsersCount');

  try {
    const res = await fetch(`${API_BASE}/api/community/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();

    if (activePostsEl) activePostsEl.textContent = data.activePostsCount;
    if (activeUsersEl) activeUsersEl.textContent = data.activeUsersCount;
  } catch (err) {
    console.error('Load community stats error:', err);
  }
}

function setupCommunitySubtabs() {
  const btnSubtabPosts = document.getElementById('btnSubtabPosts');
  const btnSubtabChat = document.getElementById('btnSubtabChat');
  const btnSubtabGroups = document.getElementById('btnSubtabGroups');
  const btnSubtabFriends = document.getElementById('btnSubtabFriends');

  if (btnSubtabPosts) {
    btnSubtabPosts.onclick = (e) => {
      e.preventDefault();
      switchCommunitySubtab('posts');
    };
  }

  if (btnSubtabChat) {
    btnSubtabChat.onclick = (e) => {
      e.preventDefault();
      switchCommunitySubtab('chat');
    };
  }

  if (btnSubtabGroups) {
    btnSubtabGroups.onclick = (e) => {
      e.preventDefault();
      switchCommunitySubtab('groups');
    };
  }

  if (btnSubtabFriends) {
    btnSubtabFriends.onclick = (e) => {
      e.preventDefault();
      switchCommunitySubtab('friends');
    };
  }
}

function switchCommunitySubtab(tab) {
  communityActiveTab = tab;
  
  const btnSubtabPosts = document.getElementById('btnSubtabPosts');
  const btnSubtabChat = document.getElementById('btnSubtabChat');
  const btnSubtabGroups = document.getElementById('btnSubtabGroups');
  const btnSubtabFriends = document.getElementById('btnSubtabFriends');

  const contentPosts = document.getElementById('subtabContentPosts');
  const contentChat = document.getElementById('subtabContentChat');
  const contentGroups = document.getElementById('subtabContentGroups');
  const contentFriends = document.getElementById('subtabContentFriends');

  // Toggle active class on buttons
  if (btnSubtabPosts) btnSubtabPosts.classList.toggle('active', tab === 'posts');
  if (btnSubtabChat) btnSubtabChat.classList.toggle('active', tab === 'chat');
  if (btnSubtabGroups) btnSubtabGroups.classList.toggle('active', tab === 'groups');
  if (btnSubtabFriends) btnSubtabFriends.classList.toggle('active', tab === 'friends');

  // Toggle active class on content panels
  if (contentPosts) contentPosts.classList.toggle('active', tab === 'posts');
  if (contentChat) contentChat.classList.toggle('active', tab === 'chat');
  if (contentGroups) contentGroups.classList.toggle('active', tab === 'groups');
  if (contentFriends) contentFriends.classList.toggle('active', tab === 'friends');

  // Clear all polling intervals
  if (chatPollInterval) { clearInterval(chatPollInterval); chatPollInterval = null; }
  if (groupChatPollInterval) { clearInterval(groupChatPollInterval); groupChatPollInterval = null; }
  if (dmChatPollInterval) { clearInterval(dmChatPollInterval); dmChatPollInterval = null; }

  // Reset panels view states
  const groupListMainPanel = document.getElementById('groupListMainPanel');
  const groupChatScreenPanel = document.getElementById('groupChatScreenPanel');
  if (groupListMainPanel) groupListMainPanel.style.display = 'block';
  if (groupChatScreenPanel) groupChatScreenPanel.style.display = 'none';

  const friendsMainPanel = document.getElementById('friendsMainPanel');
  const dmChatScreenPanel = document.getElementById('dmChatScreenPanel');
  if (friendsMainPanel) friendsMainPanel.style.display = 'block';
  if (dmChatScreenPanel) dmChatScreenPanel.style.display = 'none';

  if (tab === 'posts') {
    loadCommunityPosts();
  } else if (tab === 'chat') {
    loadChatMessages();
    // Poll chat messages every 3 seconds
    chatPollInterval = setInterval(loadChatMessages, 3000);
  } else if (tab === 'groups') {
    loadGroupsList();
  } else if (tab === 'friends') {
    loadFriendsList();
    loadBlockedList();
    loadFriendRequests();
  }
  
  loadCommunityStats();
}

async function loadCommunityPosts() {
  const container = document.getElementById('postsFeedContainer');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/community/posts`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error('Failed to load posts');
    const posts = await res.json();

    if (posts.length === 0) {
      container.innerHTML = `
        <div style="background-color: var(--bg-card); border: 1px dashed var(--border-color); border-radius: 20px; padding: 40px; text-align: center; color: var(--text-light); font-size: 14px; width: 100%;">
          <span style="font-size: 32px; display: block; margin-bottom: 8px;">📝</span>
          ยังไม่มีโพสต์พูดคุยในขณะนี้<br>
          <span style="font-size: 11px; opacity: 0.7;">เขียนโพสต์ด้านบนเพื่อเริ่มแชร์ข้อมูลคนแรก!</span>
        </div>
      `;
      return;
    }

    let html = '';
    posts.forEach(p => {
      const displayName = p.user.fullName || p.user.username || 'ผู้ใช้งาน';
      const initial = displayName.charAt(0);
      const postDate = new Date(p.createdAt);
      
      const timeStr = formatPostTime(postDate);

      // Render Edit & Delete actions for own posts
      const isMyPost = userProfile && p.userId === userProfile.id;
      let actionsHtml = '';
      if (isMyPost) {
        actionsHtml = `
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <span class="post-action-btn edit" onclick="startEditPost(${p.id})">แก้ไข</span>
            <span class="post-action-btn delete" onclick="deletePost(${p.id})">ลบ</span>
          </div>
        `;
      }
      
      // Comments markup
      let commentsHtml = '';
      if (p.comments && p.comments.length > 0) {
        commentsHtml += `<div class="comments-section">`;
        p.comments.forEach(c => {
          const cName = c.user.fullName || c.user.username || 'ผู้ใช้งาน';
          const cInitial = cName.charAt(0);
          const cDate = new Date(c.createdAt);
          commentsHtml += `
            <div class="comment-item">
              <div class="comment-avatar">${cInitial}</div>
              <div class="comment-content-box">
                <span class="comment-author-name">${cName}</span>
                <span class="comment-text">${escapeHTML(c.content)}</span>
                <span class="comment-time">${formatPostTime(cDate)}</span>
              </div>
            </div>
          `;
        });
        commentsHtml += `</div>`;
      }

      html += `
        <div class="post-card" style="margin-bottom: 16px;">
          <div class="post-header">
            <div class="post-author-info">
              <div class="post-author-avatar">${initial}</div>
              <div>
                <span class="post-author-name" style="display: block;">${displayName}</span>
                <span class="post-time">${timeStr}</span>
                ${actionsHtml}
              </div>
            </div>
          </div>
          <p class="post-body" id="postBodyText-${p.id}">${escapeHTML(p.content)}</p>
          
          <!-- Comments List Area -->
          ${commentsHtml}

          <!-- Add Comment Input Area -->
          <div class="comment-input-row">
            <input type="text" placeholder="เขียนความคิดเห็น..." class="txt-comment-input" id="txtCommentForPost-${p.id}">
            <button class="btn-submit-comment" onclick="submitComment(${p.id})">ส่ง</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (err) {
    console.error('Load posts error:', err);
    container.innerHTML = '<div class="leaderboard-item-loading">ไม่สามารถโหลดฟีดโพสต์ได้</div>';
  }
}

// Submit Post
const btnCreatePost = document.getElementById('btnCreatePost');
if (btnCreatePost) {
  btnCreatePost.onclick = async (e) => {
    e.preventDefault();
    const txtPostContent = document.getElementById('txtPostContent');
    if (!txtPostContent) return;

    const content = txtPostContent.value.trim();
    if (!content) {
      await showCenteredAlert('กรุณากรอกข้อความโพสต์');
      return;
    }

    btnCreatePost.disabled = true;
    btnCreatePost.textContent = 'กำลังโพสต์...';

    try {
      const res = await fetch(`${API_BASE}/api/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ content })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to post');
      }

      txtPostContent.value = '';
      loadCommunityPosts(); // Reload posts
    } catch (err) {
      console.error('Create post error:', err);
      await showCenteredAlert(err.message);
    } finally {
      btnCreatePost.disabled = false;
      btnCreatePost.textContent = 'โพสต์';
    }
  };
}

// Submit Comment
async function submitComment(postId) {
  const input = document.getElementById(`txtCommentForPost-${postId}`);
  if (!input) return;

  const content = input.value.trim();
  if (!content) {
    await showCenteredAlert('กรุณากรอกความคิดเห็น');
    return;
  }

  const btn = input.nextElementSibling;
  if (btn) btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send comment');
    }

    input.value = '';
    loadCommunityPosts(); // Reload posts to show comment
  } catch (err) {
    console.error('Submit comment error:', err);
    await showCenteredAlert(err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// Global Chat Messages
async function loadChatMessages() {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/community/chat`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error('Failed to load chat');
    const messages = await res.json();

    if (messages.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-light); font-size: 13px; padding-top: 40px;">
          💬 เริ่มพิมพ์ข้อความแชทเพื่อพูดคุยในกลุ่มแชทรวมวันนี้
        </div>
      `;
      return;
    }

    let html = '';
    messages.forEach(m => {
      const isMe = userProfile && m.userId === userProfile.id;
      const displayName = m.user.fullName || m.user.username || 'ผู้ใช้งาน';
      const timeStr = new Date(m.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const initial = displayName.charAt(0);

      const avatarHtml = `
        <div onclick="showUserProfile(${m.userId})" class="friend-user-avatar" style="width: 32px; height: 32px; font-size: 13px; cursor: pointer; flex-shrink: 0; background-color: ${isMe ? 'var(--primary-color)' : '#BD1B0B'}; display: flex; align-items: center; justify-content: center; color: white; border-radius: 50%; font-weight: 600; margin-right: 8px;">
          ${escapeHTML(initial)}
        </div>
      `;

      html += `
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px; justify-content: ${isMe ? 'flex-end' : 'flex-start'};">
          ${isMe ? '' : avatarHtml}
          <div class="chat-bubble ${isMe ? 'me' : ''}" style="margin: 0;">
            <span class="chat-sender" onclick="showUserProfile(${m.userId})" style="cursor: pointer; font-weight: 600;">${isMe ? 'คุณ' : displayName}</span>
            <div class="chat-message-box">
              ${escapeHTML(m.content)}
            </div>
            <span class="chat-timestamp">${timeStr}</span>
          </div>
          ${isMe ? avatarHtml.replace('margin-right: 8px;', 'margin-left: 8px;') : ''}
        </div>
      `;
    });

    // Check if user is scrolled to the bottom before rendering new messages
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 60;
    
    container.innerHTML = html;

    // Auto scroll to bottom on new messages or if already at bottom
    if (isAtBottom || container.getAttribute('data-first-load') !== 'false') {
      container.scrollTop = container.scrollHeight;
      container.setAttribute('data-first-load', 'false');
    }

  } catch (err) {
    console.error('Load chat error:', err);
  }
}

// Send Chat message
const btnSendChat = document.getElementById('btnSendChat');
const txtChatInput = document.getElementById('txtChatInput');
if (btnSendChat && txtChatInput) {
  const handleSendChat = async () => {
    const content = txtChatInput.value.trim();
    if (!content) return;

    txtChatInput.value = '';
    btnSendChat.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/community/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ content })
      });

      if (!res.ok) throw new Error('Send failed');
      loadChatMessages();
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      btnSendChat.disabled = false;
      txtChatInput.focus();
    }
  };

  btnSendChat.onclick = (e) => {
    e.preventDefault();
    handleSendChat();
  };

  txtChatInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendChat();
    }
  };
}

// Utility to format date strings
function formatPostTime(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMin < 1) return 'เมื่อสักครู่';
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
  
  const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${date.getDate()} ${months[date.getMonth()]} (${days[date.getDay()]})`;
}

// Utility to escape HTML
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Expose functions globally for HTML inline event listeners
window.submitComment = submitComment;

window.startEditPost = function(postId) {
  const bodyTextEl = document.getElementById(`postBodyText-${postId}`);
  if (!bodyTextEl) return;

  // Retrieve current content and store backup
  const currentContent = bodyTextEl.getAttribute('data-original-content') || bodyTextEl.textContent;
  bodyTextEl.setAttribute('data-original-content', currentContent);

  bodyTextEl.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 8px;">
      <textarea id="txtEditPostContent-${postId}" style="width: 100%; height: 70px; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; font-family: 'Kanit', sans-serif; font-size: 13px; resize: none; outline: none; background-color: white;" onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='var(--border-color)'">${currentContent}</textarea>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button class="btn-submit-comment" style="background-color: #F1F5F9; color: var(--text-dark);" onclick="cancelEditPost(${postId})">ยกเลิก</button>
        <button class="btn-submit-comment" style="background-color: var(--primary-color); color: white;" onclick="saveEditPost(${postId})">บันทึก</button>
      </div>
    </div>
  `;
};

window.cancelEditPost = function(postId) {
  const bodyTextEl = document.getElementById(`postBodyText-${postId}`);
  if (!bodyTextEl) return;
  const original = bodyTextEl.getAttribute('data-original-content') || '';
  bodyTextEl.innerHTML = escapeHTML(original);
};

window.saveEditPost = async function(postId) {
  const input = document.getElementById(`txtEditPostContent-${postId}`);
  if (!input) return;

  const content = input.value.trim();
  if (!content) {
    await showCenteredAlert('กรุณากรอกข้อความโพสต์');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/community/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update post');
    }

    loadCommunityPosts();
  } catch (err) {
    console.error('Save post error:', err);
    await showCenteredAlert(err.message);
  }
};

// Delete a post (only owner)
window.deletePost = async function(postId) {
  const confirmed = await showCenteredConfirm('ยืนยันการลบ', 'คุณต้องการลบโพสต์นี้หรือไม่?');
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/api/community/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete post');
    }

    loadCommunityPosts();
  } catch (err) {
    console.error('Delete post error:', err);
    await showCenteredAlert(err.message);
  }
};

// ==========================================
// Study Groups Logic
// ==========================================
let activeGroupId = null;

async function loadGroupsList(searchVal = '') {
  const container = document.getElementById('groupsListContainer');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/community/groups?search=${encodeURIComponent(searchVal)}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error('Failed to load groups');
    const groups = await res.json();

    if (groups.length === 0) {
      container.innerHTML = `
        <div style="background-color: var(--bg-card); border: 1px dashed var(--border-color); border-radius: 20px; padding: 40px; text-align: center; color: var(--text-light); font-size: 14px; grid-column: 1 / 3; width: 100%;">
          <span style="font-size: 32px; display: block; margin-bottom: 8px;">👥</span>
          ไม่พบกลุ่มติวที่ค้นหา<br>
          <span style="font-size: 11px; opacity: 0.7;">คลิก "สร้างกลุ่ม" ขวาบนเพื่อตั้งกลุ่มแรกของคุณ!</span>
        </div>
      `;
      return;
    }

    let html = '';
    groups.forEach(g => {
      // Creator options
      const isCreator = userProfile && g.createdById === userProfile.id;
      let actionBtnHtml = '';
      if (g.membershipStatus === 'ACCEPTED') {
        actionBtnHtml = `
          <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
            <button class="btn-quick-match" style="padding: 6px 14px; font-size: 12px; border-radius: 8px; width: auto; box-shadow: none; display: block;" onclick="enterGroupChat(${g.id}, '${escapeHTML(g.name)}', ${g.memberCount}, ${g.createdById})">แชทกลุ่ม</button>
            ${isCreator ? '' : `<button class="post-action-btn delete" style="font-size: 11px; margin-right: 0;" onclick="leaveGroup(${g.id})">ออกจากกลุ่ม</button>`}
          </div>
        `;
      } else if (g.membershipStatus === 'PENDING') {
        actionBtnHtml = `
          <button class="btn-quick-match" style="padding: 6px 14px; font-size: 12px; border-radius: 8px; width: auto; box-shadow: none; background-color: #64748B; cursor: not-allowed;" disabled>รออนุมัติ</button>
        `;
      } else {
        actionBtnHtml = `
          <button class="btn-quick-match" style="padding: 6px 14px; font-size: 12px; border-radius: 8px; width: auto; box-shadow: none;" onclick="joinGroup(${g.id})">เข้าร่วม</button>
        `;
      }

      let deleteBtnHtml = '';
      if (isCreator) {
        deleteBtnHtml = `<span class="post-action-btn delete" style="font-size: 11px; margin-left: 8px;" onclick="deleteGroup(${g.id})">ลบกลุ่ม</span>`;
      }

      html += `
        <div class="battle-mode-item" style="cursor: default; padding: 14px 18px; margin-bottom: 12px;">
          <div class="mode-item-left" style="text-align: left;">
            <div class="mode-icon-wrapper ranked-icon" style="background-color: #F1F5F9; color: var(--text-dark); font-size: 18px;">👮</div>
            <div class="mode-info">
              <span class="mode-title" style="font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; color: var(--text-dark); flex-wrap: wrap;">
                ${escapeHTML(g.name)}
                <span style="font-size: 10px; background-color: #E2E8F0; color: #64748B; padding: 2px 6px; border-radius: 4px;">ID: #${g.id}</span>
                <span style="font-size: 10px; background-color: ${g.isPrivate ? '#FEE2E2' : '#D1FAE5'}; color: ${g.isPrivate ? '#991B1B' : '#065F46'}; padding: 2px 6px; border-radius: 4px;">
                  ${g.isPrivate ? '🔒 ส่วนตัว' : '🔓 สาธารณะ'}
                </span>
              </span>
              <span class="mode-subtitle" style="font-size: 12px; display: block; margin-top: 4px;">
                สมาชิก ${g.memberCount} คน • สร้างโดย ${escapeHTML(g.creatorName)} ${deleteBtnHtml}
              </span>
              ${g.description ? `<p style="font-size: 12px; color: var(--text-light); margin: 6px 0 0 0; line-height: 1.4;">${escapeHTML(g.description)}</p>` : ''}
            </div>
          </div>
          ${actionBtnHtml}
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (err) {
    console.error('Load groups error:', err);
    container.innerHTML = '<div class="leaderboard-item-loading">ไม่สามารถโหลดกลุ่มได้</div>';
  }
}

// Modal open/close handlers
const btnOpenCreateGroupModal = document.getElementById('btnOpenCreateGroupModal');
const createGroupModal = document.getElementById('createGroupModal');
const btnCancelCreateGroup = document.getElementById('btnCancelCreateGroup');
const btnSubmitCreateGroup = document.getElementById('btnSubmitCreateGroup');

if (btnOpenCreateGroupModal && createGroupModal) {
  btnOpenCreateGroupModal.onclick = () => {
    createGroupModal.style.display = 'flex';
    document.getElementById('txtCreateGroupName').value = '';
    document.getElementById('txtCreateGroupDesc').value = '';
    const publicRadio = document.querySelector('input[name="optGroupPrivacy"][value="public"]');
    if (publicRadio) publicRadio.checked = true;
  };
}

if (btnCancelCreateGroup && createGroupModal) {
  btnCancelCreateGroup.onclick = () => {
    createGroupModal.style.display = 'none';
  };
}

if (btnSubmitCreateGroup && createGroupModal) {
  btnSubmitCreateGroup.onclick = async () => {
    const nameInput = document.getElementById('txtCreateGroupName');
    const descInput = document.getElementById('txtCreateGroupDesc');
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const optPrivacy = document.querySelector('input[name="optGroupPrivacy"]:checked');
    const isPrivate = optPrivacy ? optPrivacy.value === 'private' : false;

    if (!name) {
      await showCenteredAlert('กรุณากรอกชื่อกลุ่ม');
      return;
    }

    btnSubmitCreateGroup.disabled = true;
    btnSubmitCreateGroup.textContent = 'กำลังสร้าง...';

    try {
      const res = await fetch(`${API_BASE}/api/community/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ name, description, isPrivate })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create group');
      }

      createGroupModal.style.display = 'none';
      loadGroupsList(); // Reload feed
    } catch (err) {
      console.error('Create group error:', err);
      await showCenteredAlert(err.message);
    } finally {
      btnSubmitCreateGroup.disabled = false;
      btnSubmitCreateGroup.textContent = 'สร้างกลุ่ม';
    }
  };
}

// Search groups input listener
const txtGroupSearch = document.getElementById('txtGroupSearch');
if (txtGroupSearch) {
  let searchTimeout = null;
  txtGroupSearch.oninput = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadGroupsList(txtGroupSearch.value.trim());
    }, 400);
  };
}

// Join Group action
window.joinGroup = async function(groupId) {
  try {
    const res = await fetch(`${API_BASE}/api/community/groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Join failed');
    }
    const data = await res.json();
    await showCenteredAlert(data.message);
    loadGroupsList(txtGroupSearch ? txtGroupSearch.value.trim() : '');
  } catch (err) {
    await showCenteredAlert(err.message || 'ไม่สามารถเข้าร่วมกลุ่มได้');
  }
};

// Leave Group action
window.leaveGroup = async function(groupId) {
  const confirmed = await showCenteredConfirm('ออกจากกลุ่ม', 'คุณแน่ใจว่าต้องการออกจากกลุ่มนี้ใช่หรือไม่?', { okText: 'ออกจากกลุ่ม', okColor: '#EF4444' });
  if (!confirmed) return;
  try {
    const res = await fetch(`${API_BASE}/api/community/groups/${groupId}/leave`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error('Leave failed');
    loadGroupsList(txtGroupSearch ? txtGroupSearch.value.trim() : '');
  } catch (err) {
    await showCenteredAlert('ไม่สามารถออกจากกลุ่มได้');
  }
};

// Delete Group action
window.deleteGroup = async function(groupId) {
  const confirmed = await showCenteredConfirm('ลบกลุ่มติว', 'คุณต้องการลบกลุ่มติวนี้ใช่หรือไม่? ข้อมูลสมาชิกและข้อความทั้งหมดจะถูกลบถาวร', { okText: 'ลบกลุ่ม', okColor: '#EF4444' });
  if (!confirmed) return;
  try {
    const res = await fetch(`${API_BASE}/api/community/groups/${groupId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    loadGroupsList(txtGroupSearch ? txtGroupSearch.value.trim() : '');
  } catch (err) {
    await showCenteredAlert(err.message || 'ไม่สามารถลบกลุ่มได้');
  }
};

// --- Group Chat View Handlers ---
window.enterGroupChat = function(groupId, groupName, memberCount, createdById) {
  activeGroupId = groupId;
  document.getElementById('groupListMainPanel').style.display = 'none';
  
  const screen = document.getElementById('groupChatScreenPanel');
  screen.style.display = 'flex';

  document.getElementById('lblChatGroupName').textContent = groupName;
  document.getElementById('lblChatGroupMeta').textContent = `ID: #${groupId} • สมาชิก ${memberCount} คน`;

  // Creator options inside header
  const isCreator = userProfile && createdById === userProfile.id;
  const btnDelete = document.getElementById('btnDeleteGroup');
  const btnLeave = document.getElementById('btnLeaveGroup');

  if (btnDelete) btnDelete.style.display = isCreator ? 'block' : 'none';
  if (btnLeave) btnLeave.style.display = isCreator ? 'none' : 'block';

  // Set event handlers for header buttons
  if (btnLeave) {
    btnLeave.onclick = async () => {
      await leaveGroup(groupId);
      exitGroupChat();
    };
  }
  if (btnDelete) {
    btnDelete.onclick = async () => {
      await deleteGroup(groupId);
      exitGroupChat();
    };
  }

  // Load join requests if creator
  const requestsPanel = document.getElementById('groupJoinRequestsPanel');
  if (isCreator) {
    loadJoinRequests(groupId);
  } else {
    if (requestsPanel) requestsPanel.style.display = 'none';
  }

  // Load and start polling
  loadGroupChatMessages(groupId);
  if (groupChatPollInterval) clearInterval(groupChatPollInterval);
  groupChatPollInterval = setInterval(() => {
    loadGroupChatMessages(groupId);
    if (isCreator) {
      loadJoinRequests(groupId);
    }
  }, 3000);
};

window.exitGroupChat = function() {
  activeGroupId = null;
  if (groupChatPollInterval) {
    clearInterval(groupChatPollInterval);
    groupChatPollInterval = null;
  }
  const requestsPanel = document.getElementById('groupJoinRequestsPanel');
  if (requestsPanel) requestsPanel.style.display = 'none';

  document.getElementById('groupChatScreenPanel').style.display = 'none';
  document.getElementById('groupListMainPanel').style.display = 'block';
  loadGroupsList(txtGroupSearch ? txtGroupSearch.value.trim() : '');
};

async function loadJoinRequests(groupId) {
  const panel = document.getElementById('groupJoinRequestsPanel');
  const container = document.getElementById('groupJoinRequestsContainer');
  const countEl = document.getElementById('lblGroupJoinRequestsCount');
  
  if (!panel || !container || activeGroupId !== groupId) return;

  try {
    const res = await fetch(`${API_BASE}/api/community/groups/${groupId}/requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    const requests = await res.json();

    if (requests.length === 0) {
      panel.style.display = 'none';
      return;
    }

    if (countEl) countEl.textContent = `📬 คำขอเข้าร่วมกลุ่ม (${requests.length})`;

    let html = '';
    requests.forEach(r => {
      const displayName = r.user.fullName || r.user.username;
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 8px 12px; border-radius: 8px; border: 1px solid #FDE68A;">
          <span style="font-size: 13px; font-weight: 500; color: var(--text-dark);">${escapeHTML(displayName)} (@${escapeHTML(r.user.username)})</span>
          <div style="display: flex; gap: 6px;">
            <button onclick="approveJoinRequest(${groupId}, ${r.user.id})" class="btn-quick-match" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; width: auto; box-shadow: none; background-color: #10B981; color: white;">อนุมัติ</button>
            <button onclick="declineJoinRequest(${groupId}, ${r.user.id})" class="post-action-btn delete" style="font-size: 11px; border: 1px solid #EF4444; border-radius: 6px; padding: 4px 10px; background: none; margin-right: 0;">ปฏิเสธ</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    panel.style.display = 'block';

  } catch (err) {
    console.error('Load requests error:', err);
  }
}

window.approveJoinRequest = async function(groupId, userId) {
  try {
    const res = await fetch(`${API_BASE}/api/community/groups/${groupId}/requests/${userId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    loadJoinRequests(groupId);
    loadGroupsList(txtGroupSearch ? txtGroupSearch.value.trim() : '');
  } catch (err) {
    await showCenteredAlert('ไม่สามารถอนุมัติคำขอได้');
  }
};

window.declineJoinRequest = async function(groupId, userId) {
  const confirmed = await showCenteredConfirm('ปฏิเสธคำขอ', 'ปฏิเสธคำขอเข้าร่วมกลุ่มของบุคคลนี้ใช่หรือไม่?', { okText: 'ปฏิเสธ', okColor: '#EF4444' });
  if (!confirmed) return;
  try {
    const res = await fetch(`${API_BASE}/api/community/groups/${groupId}/requests/${userId}/decline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    loadJoinRequests(groupId);
  } catch (err) {
    await showCenteredAlert('ไม่สามารถปฏิเสธคำขอได้');
  }
};

const btnBackToGroups = document.getElementById('btnBackToGroups');
if (btnBackToGroups) {
  btnBackToGroups.onclick = () => {
    exitGroupChat();
  };
}

async function loadGroupChatMessages(groupId) {
  const container = document.getElementById('groupChatMessagesContainer');
  if (!container || activeGroupId !== groupId) return;

  try {
    const res = await fetch(`${API_BASE}/api/community/groups/${groupId}/chat`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    const messages = await res.json();

    if (messages.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-light); font-size: 13px; padding-top: 40px;">
          💬 เริ่มพิมพ์ข้อความแชทเพื่อพูดคุยในกลุ่มติววันนี้
        </div>
      `;
      return;
    }

    let html = '';
    messages.forEach(m => {
      const isMe = userProfile && m.userId === userProfile.id;
      const displayName = m.user.fullName || m.user.username || 'ผู้ใช้งาน';
      const timeStr = new Date(m.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const initial = displayName.charAt(0);

      const avatarHtml = `
        <div onclick="showUserProfile(${m.userId})" class="friend-user-avatar" style="width: 32px; height: 32px; font-size: 13px; cursor: pointer; flex-shrink: 0; background-color: ${isMe ? 'var(--primary-color)' : '#BD1B0B'}; display: flex; align-items: center; justify-content: center; color: white; border-radius: 50%; font-weight: 600; margin-right: 8px;">
          ${escapeHTML(initial)}
        </div>
      `;

      html += `
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px; justify-content: ${isMe ? 'flex-end' : 'flex-start'};">
          ${isMe ? '' : avatarHtml}
          <div class="chat-bubble ${isMe ? 'me' : ''}" style="margin: 0;">
            <span class="chat-sender" onclick="showUserProfile(${m.userId})" style="cursor: pointer; font-weight: 600;">${isMe ? 'คุณ' : displayName}</span>
            <div class="chat-message-box">
              ${escapeHTML(m.content)}
            </div>
            <span class="chat-timestamp">${timeStr}</span>
          </div>
          ${isMe ? avatarHtml.replace('margin-right: 8px;', 'margin-left: 8px;') : ''}
        </div>
      `;
    });

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 60;
    container.innerHTML = html;

    if (isAtBottom || container.getAttribute('data-first-load') !== 'false') {
      container.scrollTop = container.scrollHeight;
      container.setAttribute('data-first-load', 'false');
    }
  } catch (err) {
    console.error(err);
  }
}

// Send group chat message
const btnSendGroupChat = document.getElementById('btnSendGroupChat');
const txtGroupChatInput = document.getElementById('txtGroupChatInput');
if (btnSendGroupChat && txtGroupChatInput) {
  const handleSendGroupChat = async () => {
    if (!activeGroupId) return;
    const content = txtGroupChatInput.value.trim();
    if (!content) return;

    txtGroupChatInput.value = '';
    btnSendGroupChat.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/community/groups/${activeGroupId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error();
      loadGroupChatMessages(activeGroupId);
    } catch (err) {
      console.error(err);
    } finally {
      btnSendGroupChat.disabled = false;
      txtGroupChatInput.focus();
    }
  };

  btnSendGroupChat.onclick = (e) => {
    e.preventDefault();
    handleSendGroupChat();
  };

  txtGroupChatInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendGroupChat();
    }
  };
}

// ==========================================
// Friends, Blocks & Direct Chat Logic
// ==========================================
let activeFriendId = null;

// Search other users to add as friends
const txtFriendUserSearch = document.getElementById('txtFriendUserSearch');
const friendUserSearchResultsContainer = document.getElementById('friendUserSearchResultsContainer');

if (txtFriendUserSearch && friendUserSearchResultsContainer) {
  txtFriendUserSearch.oninput = async () => {
    const val = txtFriendUserSearch.value.trim();
    if (!val) {
      friendUserSearchResultsContainer.style.display = 'none';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/friends/search?search=${encodeURIComponent(val)}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error();
      const users = await res.json();

      if (users.length === 0) {
        friendUserSearchResultsContainer.innerHTML = '<div style="padding: 10px 16px; font-size: 13px; color: var(--text-light); text-align: center;">ไม่พบผู้ใช้งาน</div>';
        friendUserSearchResultsContainer.style.display = 'block';
        return;
      }

      let html = '';
      users.forEach(u => {
        let actionBtn = '';
        if (u.friendStatus === 'NONE') {
          actionBtn = `<button class="btn-quick-match" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; width: auto; box-shadow: none;" onclick="addFriend(${u.id})">เพิ่มเพื่อน</button>`;
        } else if (u.friendStatus === 'ACCEPTED') {
          actionBtn = `<span style="font-size: 11px; color: #10B981; font-weight: 500;">เป็นเพื่อนแล้ว</span>`;
        } else if (u.friendStatus === 'PENDING_SENT') {
          actionBtn = `<span style="font-size: 11px; color: #64748B; font-weight: 500;">รอรับแอด</span>`;
        } else if (u.friendStatus === 'PENDING_RECEIVED') {
          actionBtn = `<button class="btn-quick-match" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; width: auto; box-shadow: none; background-color: #10B981;" onclick="acceptFriendRequest(${u.id})">รับแอด</button>`;
        }

        html += `
          <div class="search-result-item" style="cursor: pointer;" onclick="showUserProfile(${u.id})">
            <div style="display: flex; align-items: center; gap: 8px; text-align: left;">
              <div class="friend-user-avatar">${escapeHTML(u.fullName || u.username).charAt(0)}</div>
              <div>
                <span class="friend-user-name" style="display: block;">${escapeHTML(u.fullName || u.username)}</span>
                <span style="font-size: 10px; color: var(--text-light);">@${escapeHTML(u.username)}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;" onclick="event.stopPropagation()">
              ${actionBtn}
              <span class="post-action-btn delete" style="font-size: 11px; margin-right: 0;" onclick="blockUser(${u.id})">บล็อก</span>
            </div>
          </div>
        `;
      });

      friendUserSearchResultsContainer.innerHTML = html;
      friendUserSearchResultsContainer.style.display = 'block';
    } catch (err) {
      console.error(err);
    }
  };
}

// Add Friend action
window.addFriend = async function(friendId) {
  try {
    const res = await fetch(`${API_BASE}/api/friends/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ friendId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    const data = await res.json();
    await showCenteredAlert(data.message);
    
    if (txtFriendUserSearch) txtFriendUserSearch.value = '';
    if (friendUserSearchResultsContainer) friendUserSearchResultsContainer.style.display = 'none';
    
    loadFriendsList();
  } catch (err) {
    await showCenteredAlert(err.message || 'ไม่สามารถเพิ่มเพื่อนได้');
  }
};

// Block User action
window.blockUser = async function(blockedId) {
  const confirmed = await showCenteredConfirm('บล็อกผู้ใช้งาน', 'คุณแน่ใจว่าต้องการบล็อกผู้ใช้งานรายนี้ใช่หรือไม่? ความสัมพันธ์ความเป็นเพื่อนและแชททั้งหมดจะถูกซ่อนไว้', { okText: 'บล็อก', okColor: '#EF4444' });
  if (!confirmed) return;
  try {
    const res = await fetch(`${API_BASE}/api/friends/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ blockedId })
    });
    if (!res.ok) throw new Error();

    if (txtFriendUserSearch) txtFriendUserSearch.value = '';
    if (friendUserSearchResultsContainer) friendUserSearchResultsContainer.style.display = 'none';

    loadFriendsList();
    loadBlockedList();
  } catch (err) {
    await showCenteredAlert('ไม่สามารถบล็อกผู้ใช้งานได้');
  }
};

// Load friends list
async function loadFriendsList() {
  const container = document.getElementById('friendsListContainer');
  const countEl = document.getElementById('lblFriendsCount');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/friends`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    const friends = await res.json();

    if (countEl) countEl.textContent = `${friends.length} คน`;

    if (friends.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-light); font-size: 12px; padding: 20px 0; width: 100%;">
          ยังไม่มีเพื่อนในขณะนี้<br>
          <span style="font-size: 10px; opacity: 0.7;">พิมพ์ค้นหาชื่อเพื่อนด้านบนเพื่อกดเพิ่มเพื่อน</span>
        </div>
      `;
      return;
    }

    let html = '';
    friends.forEach(f => {
      const displayName = f.fullName || f.username;
      const initial = displayName.charAt(0);

      html += `
        <div class="friend-item-row" style="cursor: default;">
          <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="showUserProfile(${f.id})">
            <div class="friend-user-avatar" style="background-color: #BD1B0B;">${initial}</div>
            <div style="text-align: left;">
              <span class="friend-user-name" style="display: block;">${escapeHTML(displayName)}</span>
              <span style="font-size: 11px; color: var(--text-light);">แชทส่วนตัว</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-quick-match" style="padding: 6px 12px; font-size: 11px; border-radius: 8px; width: auto; box-shadow: none;" onclick="enterDmChat(${f.id}, '${escapeHTML(displayName)}')">แชท</button>
            <button class="post-action-btn delete" style="border: 1px solid #EF4444; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 600; background: none; margin-right: 0;" onclick="unfriend(${f.id})">ลบเพื่อน</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

// Load blocked list
async function loadBlockedList() {
  const container = document.getElementById('blockedUsersListContainer');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/friends/blocked`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    const blocked = await res.json();

    if (blocked.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-light); font-size: 12px; padding: 10px 0; width: 100%;">
          ไม่มีรายชื่อที่บล็อก
        </div>
      `;
      return;
    }

    let html = '';
    blocked.forEach(u => {
      const displayName = u.fullName || u.username;
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); width: 100%;">
          <div style="display: flex; align-items: center; gap: 8px; text-align: left; cursor: pointer;" onclick="showUserProfile(${u.id})">
            <div class="friend-user-avatar" style="background-color: #64748B; width: 26px; height: 26px; font-size: 11px;">${displayName.charAt(0)}</div>
            <div>
              <span style="font-size: 12px; font-weight: 600; color: var(--text-dark); display: block;">${escapeHTML(displayName)}</span>
              <span style="font-size: 9px; color: var(--text-light);">@${escapeHTML(u.username)}</span>
            </div>
          </div>
          <button class="post-action-btn edit" style="font-size: 11px; margin-right: 0;" onclick="unblockUser(${u.id})">ปลดบล็อก</button>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

// Unblock User action
window.unblockUser = async function(blockedId) {
  try {
    const res = await fetch(`${API_BASE}/api/friends/unblock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ blockedId })
    });
    if (!res.ok) throw new Error();

    loadBlockedList();
    loadFriendsList();
  } catch (err) {
    await showCenteredAlert('ไม่สามารถปลดบล็อกผู้ใช้งานได้');
  }
};

// Fetch pending incoming friend requests
async function loadFriendRequests() {
  const panel = document.getElementById('friendRequestsPanel');
  const container = document.getElementById('friendRequestsContainer');
  if (!panel || !container) return;

  try {
    const res = await fetch(`${API_BASE}/api/friends/requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    const requests = await res.json();

    if (requests.length === 0) {
      panel.style.display = 'none';
      return;
    }

    let html = '';
    requests.forEach(r => {
      const displayName = r.fullName || r.username;
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 8px 12px; border-radius: 8px; border: 1px solid #FDE68A;">
          <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;" onclick="showUserProfile(${r.senderId})">
            <div class="friend-user-avatar" style="width: 28px; height: 28px; font-size: 11px; background-color: #BD1B0B; display: flex; align-items: center; justify-content: center; color: white; border-radius: 50%;">${displayName.charAt(0)}</div>
            <div style="text-align: left;">
              <span style="font-size: 12px; font-weight: 600; color: var(--text-dark); display: block;">${escapeHTML(displayName)}</span>
              <span style="font-size: 9px; color: var(--text-light);">@${escapeHTML(r.username)}</span>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button onclick="acceptFriendRequest(${r.senderId})" class="btn-quick-match" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; width: auto; box-shadow: none; background-color: #10B981; color: white;">รับแอด</button>
            <button onclick="declineFriendRequest(${r.senderId})" class="post-action-btn delete" style="font-size: 11px; border: 1px solid #EF4444; border-radius: 6px; padding: 4px 10px; background: none; margin-right: 0;">ปฏิเสธ</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    panel.style.display = 'block';

  } catch (err) {
    console.error('Load friend requests error:', err);
  }
}

window.acceptFriendRequest = async function(friendId) {
  try {
    const res = await fetch(`${API_BASE}/api/friends/request/${friendId}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    loadFriendRequests();
    loadFriendsList();
  } catch (err) {
    await showCenteredAlert('ไม่สามารถตอบรับเป็นเพื่อนได้');
  }
};

window.declineFriendRequest = async function(friendId) {
  try {
    const res = await fetch(`${API_BASE}/api/friends/request/${friendId}/decline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    loadFriendRequests();
  } catch (err) {
    await showCenteredAlert('ไม่สามารถปฏิเสธคำขอได้');
  }
};

window.unfriend = async function(friendId) {
  const confirmed = await showCenteredConfirm('ลบเพื่อน', 'คุณต้องการลบเพื่อนคนนี้ใช่หรือไม่? แชทส่วนตัวจะถูกปิดตัวลง', { okText: 'ลบเพื่อน', okColor: '#EF4444' });
  if (!confirmed) return;
  try {
    const res = await fetch(`${API_BASE}/api/friends/${friendId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    loadFriendsList();
  } catch (err) {
    await showCenteredAlert('ไม่สามารถลบเพื่อนได้');
  }
};

// --- Show User Profile Preview Card ---
window.showUserProfile = async function(userId) {
  const modal = document.getElementById('userProfileModal');
  const avatar = document.getElementById('userProfileModalAvatar');
  const fullName = document.getElementById('lblUserProfileModalFullName');
  const username = document.getElementById('lblUserProfileModalUsername');
  const level = document.getElementById('lblUserProfileModalLevel');
  const points = document.getElementById('lblUserProfileModalPoints');
  const streak = document.getElementById('lblUserProfileModalStreak');
  const wins = document.getElementById('lblUserProfileModalWins');
  const actions = document.getElementById('userProfileModalActions');

  if (!modal) return;

  // Render loading state
  if (avatar) avatar.textContent = '...';
  if (fullName) fullName.textContent = 'กำลังโหลดโปรไฟล์...';
  if (username) username.textContent = '';
  if (level) level.textContent = '-';
  if (points) points.textContent = '-';
  if (streak) streak.textContent = '-';
  if (wins) wins.textContent = '-';
  if (actions) actions.innerHTML = '';

  modal.style.display = 'flex';

  try {
    const res = await fetch(`${API_BASE}/api/user/${userId}/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error('Failed to load profile');
    const u = await res.json();

    const nameStr = u.fullName || u.username;
    if (avatar) avatar.textContent = nameStr.charAt(0);
    if (fullName) fullName.textContent = nameStr;
    if (username) username.textContent = `@${u.username}`;
    if (level) level.textContent = `Lv.${u.level || 1}`;
    if (points) points.textContent = `${u.points || 0} พ้อยต์`;
    if (streak) streak.textContent = `${u.streak || 0} วัน`;
    if (wins) wins.textContent = `${u.battleWins || 0} ครั้ง`;

    // Render action buttons based on relationStatus
    let buttonsHtml = '';
    const isMe = userProfile && u.id === userProfile.id;

    if (isMe) {
      buttonsHtml = `
        <button class="btn-quick-match" style="width: 100%; box-shadow: none; background-color: #64748B;" onclick="closeUserProfileModal()">นี่คือโปรไฟล์ของคุณ</button>
      `;
    } else {
      if (u.relationStatus === 'ACCEPTED') {
        buttonsHtml = `
          <button class="btn-quick-match" style="width: 100%; box-shadow: none;" onclick="enterDmChat(${u.id}, '${escapeHTML(nameStr)}'); closeUserProfileModal();">💬 ส่งข้อความส่วนตัว</button>
          <button class="post-action-btn delete" style="width: 100%; border: 1px solid #EF4444; border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 600; background: none; margin-right: 0;" onclick="unfriend(${u.id}); closeUserProfileModal();">👥 ลบเพื่อน</button>
        `;
      } else if (u.relationStatus === 'PENDING_SENT') {
        buttonsHtml = `
          <button class="btn-quick-match" style="width: 100%; box-shadow: none; background-color: #64748B; cursor: not-allowed;" disabled>รอการตอบรับคำขอเพื่อน</button>
        `;
      } else if (u.relationStatus === 'PENDING_RECEIVED') {
        buttonsHtml = `
          <button class="btn-quick-match" style="width: 100%; box-shadow: none; background-color: #10B981;" onclick="acceptFriendRequest(${u.id}); closeUserProfileModal();">👥 ยอมรับเป็นเพื่อน</button>
          <button class="post-action-btn delete" style="width: 100%; border: 1px solid #EF4444; border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 600; background: none; margin-right: 0;" onclick="declineFriendRequest(${u.id}); closeUserProfileModal();">ปฏิเสธคำขอ</button>
        `;
      } else if (u.relationStatus === 'BLOCKED') {
        buttonsHtml = `
          <button class="btn-quick-match" style="width: 100%; box-shadow: none; background-color: #EF4444;" onclick="unblockUser(${u.id}); closeUserProfileModal();">ปลดบล็อก</button>
        `;
      } else {
        buttonsHtml = `
          <button class="btn-quick-match" style="width: 100%; box-shadow: none;" onclick="addFriend(${u.id}); closeUserProfileModal();">👥 เพิ่มเพื่อน</button>
        `;
      }

      if (u.relationStatus !== 'BLOCKED') {
        buttonsHtml += `
          <button class="post-action-btn delete" style="width: 100%; border: 1px solid #EF4444; border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 600; background: none; margin-right: 0; margin-top: 4px;" onclick="blockUser(${u.id}); closeUserProfileModal();">🚫 บล็อกผู้ใช้งาน</button>
        `;
      }
    }

    if (actions) actions.innerHTML = buttonsHtml;

    // Load post history
    loadUserPostHistory(userId);

  } catch (err) {
    console.error('Load public profile error:', err);
    if (fullName) fullName.textContent = 'โหลดโปรไฟล์ล้มเหลว';
  }
};

window.closeUserProfileModal = function() {
  const modal = document.getElementById('userProfileModal');
  if (modal) modal.style.display = 'none';
};

const btnCloseUserProfileModal = document.getElementById('btnCloseUserProfileModal');
if (btnCloseUserProfileModal) {
  btnCloseUserProfileModal.onclick = () => {
    closeUserProfileModal();
  };
}

async function loadUserPostHistory(userId) {
  const container = document.getElementById('userProfileModalPostsContainer');
  if (!container) return;

  container.innerHTML = '<div style="text-align: center; color: var(--text-light); font-size: 12px; padding: 12px 0;">กำลังโหลดโพสต์...</div>';

  try {
    const res = await fetch(`${API_BASE}/api/user/${userId}/posts`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    const posts = await res.json();

    if (posts.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: var(--text-light); font-size: 12px; padding: 12px 0;">ยังไม่มีโพสต์</div>';
      return;
    }

    let html = '';
    posts.forEach(p => {
      const timeStr = formatPostTime(new Date(p.createdAt));
      const commentCount = p.comments ? p.comments.length : 0;

      html += `
        <div style="background: #F8FAFC; border: 1px solid var(--border-color); border-radius: 12px; padding: 12px;">
          <p style="font-size: 13px; color: var(--text-dark); margin: 0 0 6px 0; line-height: 1.5; word-break: break-word;">${escapeHTML(p.content)}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: var(--text-light);">${timeStr}</span>
            <span style="font-size: 10px; color: var(--text-light);">💬 ${commentCount} ความคิดเห็น</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    console.error('Load user posts error:', err);
    container.innerHTML = '<div style="text-align: center; color: var(--text-light); font-size: 12px; padding: 12px 0;">ไม่สามารถโหลดโพสต์ได้</div>';
  }
}

// --- Direct Message Chat View Handlers ---
window.enterDmChat = function(friendId, friendName) {
  activeFriendId = friendId;
  document.getElementById('friendsMainPanel').style.display = 'none';
  
  const screen = document.getElementById('dmChatScreenPanel');
  screen.style.display = 'flex';

  document.getElementById('lblDmChatFriendName').textContent = friendName;

  // Block handler inside direct messages header
  const btnBlock = document.getElementById('btnBlockCurrentFriend');
  if (btnBlock) {
    btnBlock.onclick = async () => {
      await blockUser(friendId);
      exitDmChat();
    };
  }

  // Load and poll DM messages
  loadDmChatMessages(friendId);
  if (dmChatPollInterval) clearInterval(dmChatPollInterval);
  dmChatPollInterval = setInterval(() => loadDmChatMessages(friendId), 3000);
};

window.exitDmChat = function() {
  activeFriendId = null;
  if (dmChatPollInterval) {
    clearInterval(dmChatPollInterval);
    dmChatPollInterval = null;
  }
  document.getElementById('dmChatScreenPanel').style.display = 'none';
  document.getElementById('friendsMainPanel').style.display = 'block';
  loadFriendsList();
};

const btnBackToFriends = document.getElementById('btnBackToFriends');
if (btnBackToFriends) {
  btnBackToFriends.onclick = () => {
    exitDmChat();
  };
}

async function loadDmChatMessages(friendId) {
  const container = document.getElementById('dmChatMessagesContainer');
  if (!container || activeFriendId !== friendId) return;

  try {
    const res = await fetch(`${API_BASE}/api/friends/chat/${friendId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    const messages = await res.json();

    if (messages.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-light); font-size: 13px; padding-top: 40px;">
          💬 เริ่มพิมพ์ข้อความแชทส่วนตัวกับเพื่อนได้แล้ววันนี้
        </div>
      `;
      return;
    }

    let html = '';
    messages.forEach(m => {
      const isMe = userProfile && m.senderId === userProfile.id;
      const timeStr = new Date(m.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

      html += `
        <div class="chat-bubble ${isMe ? 'me' : ''}">
          <div class="chat-message-box">
            ${escapeHTML(m.content)}
          </div>
          <span class="chat-timestamp">${timeStr}</span>
        </div>
      `;
    });

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 60;
    container.innerHTML = html;

    if (isAtBottom || container.getAttribute('data-first-load') !== 'false') {
      container.scrollTop = container.scrollHeight;
      container.setAttribute('data-first-load', 'false');
    }
  } catch (err) {
    // If blocked or request fails, exit DM chat
    console.error(err);
    exitDmChat();
  }
}

// Send Direct Message
const btnSendDmChat = document.getElementById('btnSendDmChat');
const txtDmChatInput = document.getElementById('txtDmChatInput');
if (btnSendDmChat && txtDmChatInput) {
  const handleSendDmChat = async () => {
    if (!activeFriendId) return;
    const content = txtDmChatInput.value.trim();
    if (!content) return;

    txtDmChatInput.value = '';
    btnSendDmChat.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/friends/chat/${activeFriendId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error();
      loadDmChatMessages(activeFriendId);
    } catch (err) {
      console.error(err);
    } finally {
      btnSendDmChat.disabled = false;
      txtDmChatInput.focus();
    }
  };

  btnSendDmChat.onclick = (e) => {
    e.preventDefault();
    handleSendDmChat();
  };

  txtDmChatInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendDmChat();
    }
  };
}

// ==========================================
// Vocab Mini-Game Logic
// ==========================================
let currentLevel = 'B1';
let currentSessionQuestions = [];
let vocabSessionWordCount = 10;
let wrongAnswers = [];

let vocabIdx = 0;
let vocabScore = 0;
let vocabStreak = 0;
let vocabCompletedInRound = 0;
let isVocabFeedbackActive = false;

window.openVocabArena = function() {
  const modal = document.getElementById('vocabArenaModal');
  if (modal) {
    // Show level selection screen, hide gameplay and summary
    const lvlSelection = document.getElementById('vocabLevelSelection');
    const gameplaySec = document.getElementById('vocabGameplaySection');
    const summarySec = document.getElementById('vocabSummarySection');
    if (lvlSelection) lvlSelection.style.display = 'block';
    if (gameplaySec) gameplaySec.style.display = 'none';
    if (summarySec) summarySec.style.display = 'none';

    // Synchronize UI active-count class with current setting
    window.setVocabWordCount(vocabSessionWordCount);

    modal.style.display = 'flex';
  }
};

window.closeVocabArena = function() {
  const modal = document.getElementById('vocabArenaModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// Bind close button
const btnCloseVocabArena = document.getElementById('btnCloseVocabArena');
if (btnCloseVocabArena) {
  btnCloseVocabArena.onclick = () => {
    closeVocabArena();
  };
}

window.setVocabWordCount = function(count) {
  vocabSessionWordCount = count;
  
  // Update active classes on buttons
  document.querySelectorAll('.vocab-count-btn').forEach(btn => {
    btn.classList.remove('active-count');
  });
  
  const activeBtn = document.getElementById(`btnVocabCount${count}`);
  if (activeBtn) {
    activeBtn.classList.add('active-count');
  }
};

window.startVocabSession = function(level) {
  currentLevel = level;
  vocabIdx = 0;
  vocabScore = 0;
  window.vocabCorrectCount = 0;
  vocabStreak = 0;
  vocabCompletedInRound = 0;
  isVocabFeedbackActive = false;
  wrongAnswers = [];

  const allWords = (window.VOCAB_DATA && window.VOCAB_DATA[level]) || [];
  if (allWords.length < vocabSessionWordCount) {
    showCenteredAlert('ข้อมูลคำศัพท์ไม่เพียงพอ');
    return;
  }

  // Pick N unique random indices
  const selectedIndices = new Set();
  while (selectedIndices.size < vocabSessionWordCount) {
    selectedIndices.add(Math.floor(Math.random() * allWords.length));
  }

  currentSessionQuestions = Array.from(selectedIndices).map(idx => {
    const wObj = allWords[idx];
    
    // Pick 3 random distractor meanings from same level
    const otherMeanings = allWords
      .filter(w => w.word !== wObj.word)
      .map(w => w.meaning);
    
    const shuffledOthers = otherMeanings.sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3);
    
    const options = [wObj.meaning, ...distractors].sort(() => 0.5 - Math.random());
    
    return {
      word: wObj.word,
      meaning: wObj.meaning,
      options: options
    };
  });

  // Switch display sections
  const lvlSelection = document.getElementById('vocabLevelSelection');
  const gameplaySec = document.getElementById('vocabGameplaySection');
  const summarySec = document.getElementById('vocabSummarySection');
  if (lvlSelection) lvlSelection.style.display = 'none';
  if (gameplaySec) gameplaySec.style.display = 'block';
  if (summarySec) summarySec.style.display = 'none';

  renderVocabQuestion();
};

window.playVocabAudio = function(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
};

function renderVocabQuestion() {
  if (vocabCompletedInRound >= vocabSessionWordCount) {
    completeVocabSession();
    return;
  }

  isVocabFeedbackActive = false;
  const wordObj = currentSessionQuestions[vocabCompletedInRound];

  // UI elements
  document.getElementById('vocabGameScore').textContent = `${window.vocabCorrectCount || 0}/${vocabSessionWordCount}`;
  document.getElementById('vocabGameStreak').textContent = `${vocabStreak} 🔥`;
  document.getElementById('vocabGameCount').textContent = `${vocabCompletedInRound + 1}/${vocabSessionWordCount}`;

  const streakAlert = document.getElementById('vocabStreakAlert');
  const streakCount = document.getElementById('vocabStreakCount');
  if (vocabStreak >= 3) {
    streakCount.textContent = vocabStreak;
    streakAlert.style.display = 'block';
  } else {
    streakAlert.style.display = 'none';
  }

  const wordCard = document.getElementById('vocabWordCard');
  wordCard.style.borderColor = '#E2E8F0';
  wordCard.style.backgroundColor = 'white';

  document.getElementById('lblVocabWord').textContent = wordObj.word;
  
  if (typeof window.playVocabAudio === 'function') {
    window.playVocabAudio(wordObj.word);
  }

  const feedbackEl = document.getElementById('vocabFeedbackMessage');
  feedbackEl.style.display = 'none';

  const choicesGrid = document.getElementById('vocabChoicesGrid');
  choicesGrid.innerHTML = '';

  wordObj.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.style.cssText = 'height: 60px; background: white; border: 2px solid #E2E8F0; border-radius: 16px; font-size: 13px; font-weight: 700; color: #1E293B; cursor: pointer; transition: all 0.2s;';
    btn.textContent = opt;
    btn.onclick = () => handleVocabAnswer(opt, btn);
    choicesGrid.appendChild(btn);
  });
}

async function handleVocabAnswer(selectedOpt, btnElement) {
  if (isVocabFeedbackActive) return;
  isVocabFeedbackActive = true;

  const wordObj = currentSessionQuestions[vocabCompletedInRound];
  const wordCard = document.getElementById('vocabWordCard');
  const feedbackEl = document.getElementById('vocabFeedbackMessage');
  
  // Disable all choice buttons
  const buttons = document.querySelectorAll('#vocabChoicesGrid button');
  buttons.forEach(b => {
    b.disabled = true;
    b.style.cursor = 'not-allowed';
  });

  const isCorrect = selectedOpt === wordObj.meaning;
  if (isCorrect) {
    window.vocabCorrectCount++;
    vocabScore += (10 + vocabStreak * 2);
    vocabStreak++;
    vocabCompletedInRound++;

    btnElement.style.borderColor = '#10B981';
    btnElement.style.backgroundColor = '#ECFDF5';
    btnElement.style.color = '#065F46';

    wordCard.style.borderColor = '#34D399';
    wordCard.style.backgroundColor = '#ECFDF5';

    feedbackEl.textContent = '✓ ถูกต้อง! ยอดเยี่ยมมาก';
    feedbackEl.style.color = '#059669';
    feedbackEl.style.display = 'block';

  } else {
    wrongAnswers.push({
      word: wordObj.word,
      correctMeaning: wordObj.meaning,
      userMeaning: selectedOpt
    });

    vocabStreak = 0;
    vocabCompletedInRound++;

    btnElement.style.borderColor = '#EF4444';
    btnElement.style.backgroundColor = '#FEF2F2';
    btnElement.style.color = '#991B1B';

    wordCard.style.borderColor = '#FCA5A5';
    wordCard.style.backgroundColor = '#FEF2F2';

    // Highlight correct choice
    buttons.forEach(b => {
      if (b.textContent === wordObj.meaning) {
        b.style.borderColor = '#10B981';
        b.style.backgroundColor = '#ECFDF5';
        b.style.color = '#065F46';
      }
    });

    feedbackEl.textContent = `✗ ผิด — คำแปลที่ถูกต้องคือ: ${wordObj.meaning}`;
    feedbackEl.style.color = '#DC2626';
    feedbackEl.style.display = 'block';
  }

  // Next word after 1.5 seconds
  setTimeout(() => {
    renderVocabQuestion();
  }, 1500);
}

async function completeVocabSession() {
  // Show ELO/XP/Points loading indicator or summary screen
  const lvlSelection = document.getElementById('vocabLevelSelection');
  const gameplaySec = document.getElementById('vocabGameplaySection');
  const summarySec = document.getElementById('vocabSummarySection');

  if (lvlSelection) lvlSelection.style.display = 'none';
  if (gameplaySec) gameplaySec.style.display = 'none';
  if (summarySec) summarySec.style.display = 'block';

  // Compute final statistics
  const totalQuestions = vocabCompletedInRound;
  const correctCount = totalQuestions - wrongAnswers.length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  // Set text labels
  document.getElementById('lblVocabSummaryMeta').textContent = `ระดับ ${currentLevel} | จำนวน ${totalQuestions} คำ`;
  document.getElementById('vocabSummaryScore').textContent = `${correctCount}/${totalQuestions}`;
  document.getElementById('vocabSummaryAccuracy').textContent = `${accuracy}%`;

  // Render wrong answers list
  const container = document.getElementById('vocabWrongAnswersList');
  const wrongContainer = document.getElementById('vocabWrongAnswersContainer');
  if (container && wrongContainer) {
    container.innerHTML = '';
    if (wrongAnswers.length === 0) {
      wrongContainer.style.display = 'none';
      
      const successDiv = document.createElement('div');
      successDiv.style.cssText = 'text-align: center; color: #10B981; font-weight: 700; font-size: 14px; padding: 20px 0;';
      successDiv.innerHTML = '🎉 ยอดเยี่ยมมาก! คุณตอบถูกทุกข้อ';
      container.appendChild(successDiv);
      wrongContainer.style.display = 'block';
    } else {
      wrongAnswers.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = 'background: #FFF1F2; border: 1px solid #FFE4E6; border-radius: 12px; padding: 10px 12px; font-size: 12px;';
        div.innerHTML = `
          <div style="font-weight: 700; color: #9F1239;">${item.word}</div>
          <div style="color: #475569; margin-top: 2px;">
            แปลว่า: <span style="font-weight: 600; color: #10B981;">${item.correctMeaning}</span> 
            (คุณตอบ: <span style="font-weight: 600; color: #EF4444;">${item.userMeaning}</span>)
          </div>
        `;
        container.appendChild(div);
      });
      wrongContainer.style.display = 'block';
    }
  }

  try {
    const res = await fetch(`${API_BASE}/api/user/vocab-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        level: currentLevel,
        matchedPairs: totalQuestions,
        timeSeconds: totalQuestions * 6,
        mode: 'sentence'
      })
    });

    if (res.ok) {
      loadRealProfile(); // Refresh ELO, XP, level on dashboard
    }
  } catch (err) {
    console.error('Error saving vocab session:', err);
  }
}

let currentCropper = null;

window.handleProfileImageUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const imageToCrop = document.getElementById('imageToCrop');
    imageToCrop.src = e.target.result;
    document.getElementById('cropModal').style.display = 'flex';
    
    if (currentCropper) {
      currentCropper.destroy();
    }
    
    currentCropper = new Cropper(imageToCrop, {
      aspectRatio: 1,
      viewMode: 1,
    });
  };
  reader.readAsDataURL(file);
  
  // clear input so same file can be selected again if needed
  event.target.value = '';
};

window.cancelCrop = function() {
  document.getElementById('cropModal').style.display = 'none';
  if (currentCropper) {
    currentCropper.destroy();
    currentCropper = null;
  }
};

window.confirmCrop = async function() {
  if (!currentCropper) return;
  
  // Get cropped canvas with fixed max size
  const canvas = currentCropper.getCroppedCanvas({
    width: 500,
    height: 500,
  });
  
  if (!canvas) return;
  
  const base64Image = canvas.toDataURL('image/jpeg', 0.8);
  cancelCrop();
  
  try {
    const res = await fetch(`${API_BASE}/api/user/profile/upload-face`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ faceImage: base64Image })
    });
    
    if (res.ok) {
      const data = await res.json();
      userProfile.faceImage = base64Image;
      sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      const headerAvatar = document.getElementById('headerAvatar');
      const profileAvatarImg = document.getElementById('profileAvatarImg');
      const profileAvatarBox = document.getElementById('profileAvatarBox');
      
      if (headerAvatar) {
        headerAvatar.src = base64Image;
        headerAvatar.style.display = 'block';
      }
      if (profileAvatarImg) {
        profileAvatarImg.src = base64Image;
        profileAvatarImg.style.display = 'block';
      }
      if (profileAvatarBox) {
        profileAvatarBox.style.display = 'none';
      }
      
      showCenteredAlert('อัปเดตรูปโปรไฟล์สำเร็จ');
    } else {
      showCenteredAlert('เกิดข้อผิดพลาดในการอัปโหลด');
    }
  } catch (err) {
    console.error('Upload Error:', err);
    showCenteredAlert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
  }
};
