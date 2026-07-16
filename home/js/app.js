// ==========================================
// Configuration
// ==========================================
const API_BASE = 'http://localhost:3000';

// ==========================================
// Session Route Guard & Initialization
// ==========================================
let userProfile = null;
let authToken = null;

function checkSession() {
  authToken = sessionStorage.getItem('authToken');
  const sessionData = sessionStorage.getItem('userProfile');

  if (!authToken || !sessionData) {
    alert('กรุณาเข้าสู่ระบบก่อนใช้งานแดชบอร์ด');
    window.location.href = '../landing/index.html';
    return;
  }

  userProfile = JSON.parse(sessionData);
  initializeDashboard();
  loadRealProfile();
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
        window.location.href = '../landing/index.html';
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
      alert(`📝 พร้อมทำข้อสอบ! มีทั้งหมด ${questionCount} ข้อ\n\n(ฟีเจอร์ทำข้อสอบเต็มรูปแบบจะเปิดในเวอร์ชันหน้า)`);
    } else {
      alert('ไม่สามารถโหลดข้อสอบได้ กรุณาลองใหม่');
    }
  } catch (err) {
    console.error('Daily exam fetch error:', err);
    alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
  }

  btnStartExam.disabled = false;
  btnStartExam.querySelector('span').textContent = 'เริ่มสอบ';
});

// 4. Logout Handlers
const btnDropdownLogout = document.getElementById('btnDropdownLogout');
const btnTabProfile = document.getElementById('btnTabProfile');

function handleLogout() {
  const confirmLog = confirm('คุณต้องการออกจากระบบใช่หรือไม่?');
  if (confirmLog) {
    sessionStorage.clear();
    window.location.href = '../landing/index.html';
  }
}

btnDropdownLogout.addEventListener('click', (e) => {
  e.preventDefault();
  handleLogout();
});

btnTabProfile.addEventListener('click', (e) => {
  e.preventDefault();
  handleLogout();
});

// 5. Bottom nav tab state switcher
const navTabs = document.querySelectorAll('.bottom-nav .nav-tab');
navTabs.forEach(tab => {
  if (tab.id !== 'btnTabProfile') {
    tab.addEventListener('click', (e) => {
      if (tab.getAttribute('onclick')) return;
      e.preventDefault();
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  }
});
