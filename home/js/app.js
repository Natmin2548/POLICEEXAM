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
const battleTabBtn = document.getElementById('btnTabBattle'); // battle tab
const profileTabBtn = document.getElementById('btnTabProfile'); // profile tab

const homeView = document.getElementById('homeView');
const battleView = document.getElementById('battleView');
const profileView = document.getElementById('profileView');

if (homeTabBtn) {
  homeTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    homeTabBtn.classList.add('active');
    
    if (homeView) homeView.classList.add('active');
    if (battleView) battleView.classList.remove('active');
    if (profileView) profileView.classList.remove('active');
    loadRealProfile(); // Refresh profile values on navigate
    loadRadarChart();
  });
}

if (battleTabBtn) {
  battleTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    battleTabBtn.classList.add('active');
    
    if (battleView) battleView.classList.add('active');
    if (homeView) homeView.classList.remove('active');
    if (profileView) profileView.classList.remove('active');
    
    updateBattleTabDetails();
  });
}

if (profileTabBtn) {
  profileTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    profileTabBtn.classList.add('active');
    
    if (profileView) profileView.classList.add('active');
    if (homeView) homeView.classList.remove('active');
    if (battleView) battleView.classList.remove('active');
    
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
      container.innerHTML = '<div class="leaderboard-item-loading">ไม่มีข้อมูลอันดับ</div>';
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

    // If I am not in top 20, render my rank at the bottom
    if (myRank && myRank.rank > 20) {
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
      btnStart.addEventListener('click', () => {
        modal.remove();
        alert('ระบบประลอง Arena กำลังอยู่ในการพัฒนาร่วมกับ AI เจนเนอเรเตอร์คำถาม จะเปิดใช้งานเต็มรูปแบบเร็วๆ นี้!');
      });
      
    }, 3000);
  });
}
