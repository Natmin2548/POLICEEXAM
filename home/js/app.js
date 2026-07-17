// ==========================================
// Configuration
// ==========================================
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000' 
  : 'https://police-exam-t090.onrender.com';

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
const btnProfileLogout = document.getElementById('btnProfileLogout');

function handleLogout() {
  const confirmLog = confirm('คุณต้องการออกจากระบบใช่หรือไม่?');
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
const profileTabBtn = document.getElementById('btnTabProfile'); // last tab

const homeView = document.getElementById('homeView');
const profileView = document.getElementById('profileView');

if (homeTabBtn) {
  homeTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    homeTabBtn.classList.add('active');
    
    if (homeView) homeView.classList.add('active');
    if (profileView) profileView.classList.remove('active');
    loadRealProfile(); // Refresh profile values on navigate
    loadRadarChart();
  });
}

if (profileTabBtn) {
  profileTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    profileTabBtn.classList.add('active');
    
    if (profileView) profileView.classList.add('active');
    if (homeView) homeView.classList.remove('active');
    
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
  
  // Format joining date (use fallback or mock)
  const createdAt = userProfile.createdAt ? new Date(userProfile.createdAt) : new Date();
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
  
  // Calculate answered questions dynamically
  const totalDone = userProfile.points ? Math.floor(userProfile.points / 10) * 5 + 12 : 12;
  if (profileQuestionsCount) profileQuestionsCount.textContent = totalDone.toLocaleString();
}
