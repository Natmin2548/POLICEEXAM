
function formatMessageContent(content) {
  if (!content) return '';
  if (content.startsWith('data:image/') || content.match(/^https?:\/\/.*\.(gif|png|jpg|jpeg|webp)(\?.*)?$/i)) {
    return `<img src="${content}" style="max-width: 250px; width: 100%; border-radius: 8px; margin-top: 4px;">`;
  }
  return escapeHTML(content);
}

function renderAvatarHtml(user, classNames, inlineStyles = '', defaultBgColor = '#64748B') {
  if (!user) return '';
  const name = user.fullName || user.username || 'ผู้ใช้งาน';
  const initial = typeof escapeHTML === 'function' ? escapeHTML(name.charAt(0)) : name.charAt(0);
  const clickAction = user.id ? `onclick="event.stopPropagation(); if(window.showUserProfileModal) showUserProfileModal(${user.id});" style="cursor: pointer;"` : '';
  
  if (user.faceImage) {
    return `<div class="${classNames}" ${clickAction} style="${inlineStyles}; background-color: transparent; overflow: hidden; padding: 0; display: flex; align-items: center; justify-content: center;"><img src="${user.faceImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>`;
  }
  return `<div class="${classNames}" ${clickAction} style="${inlineStyles}; background-color: ${defaultBgColor}; display: flex; align-items: center; justify-content: center; color: white;">${initial}</div>`;
}
function getApiBase() {
  if (window.CUSTOM_API_BASE) return window.CUSTOM_API_BASE;
  if (window.location.protocol === 'file:') return 'http://localhost:3000';

  const host = window.location.hostname;
  const port = window.location.port;

  if (host === 'localhost' || host === '127.0.0.1') {
    if (port && port !== '3000') {
      return 'http://localhost:3000';
    }
    return '';
  }
  return '';
}

const API_BASE = getApiBase();

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

    if (iconEl) iconEl.textContent = opts.icon || '';
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (btnOk) btnOk.textContent = opts.okText || 'ยืนยัน';
    if (btnOk && opts.okColor) btnOk.style.background = opts.okColor;
    else if (btnOk) btnOk.style.background = '#EF4444';
    modal.style.display = 'flex';

    function cleanup() {
      if (modal) modal.style.display = 'none';
      if (btnOk) btnOk.removeEventListener('click', onOk);
      if (btnCancel) btnCancel.removeEventListener('click', onCancel);
    }
    function onOk() { cleanup(); resolve(true); }
    function onCancel() { cleanup(); resolve(false); }

    if (btnOk) btnOk.addEventListener('click', onOk);
    if (btnCancel) btnCancel.addEventListener('click', onCancel);
  });
}

function showCenteredAlert(message, opts = {}) {
  return new Promise((resolve) => {
    const modal = document.getElementById('customAlertModal');
    const iconEl = document.getElementById('customAlertIcon');
    const titleEl = document.getElementById('customAlertTitle');
    const msgEl = document.getElementById('customAlertMessage');
    const btnOk = document.getElementById('btnAlertOk');

    if (iconEl) {
      if (opts.icon) {
        iconEl.textContent = opts.icon;
        iconEl.style.display = 'block';
      } else {
        iconEl.style.display = 'none';
      }
    }
    if (titleEl) titleEl.textContent = opts.title || 'แจ้งเตือน';
    if (msgEl) msgEl.textContent = message;
    modal.style.display = 'flex';

    function cleanup() {
      if (modal) modal.style.display = 'none';
      if (btnOk) btnOk.removeEventListener('click', onOk);
    }
    function onOk() { cleanup(); resolve(); }

    if (btnOk) btnOk.addEventListener('click', onOk);
  });
}

// Override standard browser alert with modern centered dialog
window.alert = function(msg) {
  showCenteredAlert(msg);
};

// ==========================================
// Session Route Guard & Initialization
// ==========================================
let userProfile = null;
let authToken = null;

async function checkSession() {
  authToken = localStorage.getItem('authToken');
  const sessionData = localStorage.getItem('userProfile');

  if (!authToken || !sessionData) {
    await showCenteredAlert('กรุณาเข้าสู่ระบบก่อนใช้งานแดชบอร์ด');
    window.location.href = '/';
    return;
  }

  userProfile = JSON.parse(sessionData);
  if (typeof initializeDashboard === 'function') initializeDashboard();
  if (typeof loadRealProfile === 'function') loadRealProfile();
  if (typeof updateStatsTabDetails === 'function') updateStatsTabDetails();
}

function initializeDashboard() {
  
  const greetingStreakTitle = document.getElementById('greetingStreakTitle');
  const greetingStreakSubtitle = document.getElementById('greetingStreakSubtitle');
  
  if (userProfile) {
    if (greetingStreakTitle) {
      greetingStreakTitle.innerHTML = `${userProfile.streak || 0} วันติดต่อกัน! 🔥`;
    }
    if (greetingStreakSubtitle) {
      if ((userProfile.streak || 0) > 0) {
        greetingStreakSubtitle.textContent = 'ทำข้อสอบวันนี้เพื่อรักษา streak';
      } else {
        greetingStreakSubtitle.textContent = 'เริ่มทำข้อสอบเพื่อสะสม streak เลย!';
      }
    }
  }
  
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
    if (hour < 12) greetingSub.textContent = 'สวัสดีตอนเช้า ';
    else if (hour < 17) greetingSub.textContent = 'สวัสดีตอนบ่าย ';
    else greetingSub.textContent = 'สวัสดีตอนเย็น ';
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        alert('เซสชันการใช้งานของคุณหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        window.location.replace(window.location.origin + '/?session_expired=1');
        return;
      }
      throw new Error('Profile fetch failed with status ' + res.status);
    }

    const data = await res.json();
    if (data.user) {
      userProfile = data.user;
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      initializeDashboard();
      updateStatsFromProfile(data.user);
      
      // Admin Panel Check
      const btnAdminPanel = document.getElementById('btnAdminPanel');
      const dropdownAdminPanel = document.getElementById('dropdownAdminPanel');
      
      if (userProfile.role === 'ADMIN' || userProfile.role === 'OWNER') {
        if (btnAdminPanel) btnAdminPanel.style.display = 'flex';
        if (dropdownAdminPanel) dropdownAdminPanel.style.display = 'flex';
      }
    }
  } catch (err) {
    console.error('Failed to load profile from API, trying local cache:', err);
    const cached = localStorage.getItem('userProfile');
    if (cached) {
      try {
        userProfile = JSON.parse(cached);
        initializeDashboard();
        updateStatsFromProfile(userProfile);
      } catch (e) {}
    }
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
      countdownTextEl.textContent = `วันนี้คือวันสอบ! `;
    } else {
      countdownTextEl.textContent = `การสอบเสร็จสิ้นแล้ว `;
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

if (btnProfileMenu && profileDropdown) {
  btnProfileMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    profileDropdown.classList.remove('active');
  });
}

// 2. Notifications Bell Toggle
const btnNotification = document.getElementById('btnNotification');
const notifBadge = document.getElementById('notifBadge');

if (btnNotification && notifBadge) {
  notifBadge.classList.add('active');
  
  btnNotification.addEventListener('click', () => {
    if (notifBadge.classList.contains('active')) {
      notifBadge.classList.remove('active');
    } else {
      notifBadge.classList.add('active');
    }
  });
}

// 3. Start Exam (calls real daily exam API)
const btnStartExam = document.getElementById('btnStartExam');
const examModeModal = document.getElementById('examModeModal');
const btnCloseExamMode = document.getElementById('btnCloseExamMode');
const btnExamModeBank = document.getElementById('btnExamModeBank');
const btnExamModePretest = document.getElementById('btnExamModePretest');
const progressBarFill = document.getElementById('progressBarFill');
const progressCountText = document.getElementById('progressCountText');
const progressPercentText = document.getElementById('progressPercentText');

if (btnStartExam) {
  btnStartExam.addEventListener('click', () => {
    if (examModeModal) examModeModal.style.display = 'flex';
  });
}

if (btnCloseExamMode) {
  btnCloseExamMode.addEventListener('click', () => {
    if (examModeModal) examModeModal.style.display = 'none';
  });
}

async function handleStartExam(mode) {
  if (examModeModal) examModeModal.style.display = 'none';
  if (btnStartExam) {
    btnStartExam.disabled = true;
    btnStartExam.textContent = 'กำลังโหลด...';
  }

  try {
    const res = await fetch(`${API_BASE}/api/exams/daily?mode=${mode}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.ok) {
      const data = await res.json();
      const questionCount = data.questions ? data.questions.length : 0;
      await showCenteredAlert(`🎯 พร้อมทำข้อสอบ! มีทั้งหมด ${questionCount} ข้อ\n\n(เข้าสู่โหมดทำข้อสอบ)`);
    } else {
      await showCenteredAlert('ไม่สามารถโหลดข้อสอบได้ กรุณาลองใหม่');
    }
  } catch (err) {
    console.error('Daily exam fetch error:', err);
    await showCenteredAlert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
  }
  if (btnStartExam) {
    btnStartExam.disabled = false;
    btnStartExam.textContent = 'ทำเลย';
  }
}

if (btnExamModeBank) {
  btnExamModeBank.addEventListener('click', () => {
    if (examModeModal) examModeModal.style.display = 'none';
    
    // Hide other views
    if (homeView) homeView.classList.remove('active');
    if (communityView) communityView.classList.remove('active');
    if (battleView) battleView.classList.remove('active');
    if (statsView) statsView.classList.remove('active');
    if (profileView) profileView.classList.remove('active');
    if (questionBankView) questionBankView.classList.remove('active');
    
    // Show Question Bank view
    if (questionBankView) questionBankView.classList.add('active');
    
    // Deselect bottom tabs
    navTabs.forEach(t => t.classList.remove('active'));
  });
}

// Handle subject selection from Question Bank

// ==========================================
// Question Bank Real Interactive Quiz Runner
// ==========================================
let currentQuizQuestions = [];
let currentQuizIndex = 0;
let currentQuizScore = 0;
let currentQuizSubject = '';
let currentQuizAnswered = false;

window.startBankSubject = async function(subjectName) {
  currentQuizSubject = subjectName;
  currentQuizQuestions = [];
  currentQuizIndex = 0;
  currentQuizScore = 0;
  currentQuizAnswered = false;

  const modal = document.getElementById('subjectQuizModal');
  const bodyContent = document.getElementById('quizBodyContent');
  const badge = document.getElementById('quizSubjectBadge');
  const title = document.getElementById('quizTitle');
  const stepText = document.getElementById('quizStepText');
  const btnNext = document.getElementById('btnNextQuiz');

  if (!modal) return;

  badge.textContent = `วิชา: ${subjectName}`;
  title.textContent = `กำลังโหลดข้อสอบวิชา ${subjectName}...`;
  bodyContent.innerHTML = `<div style="text-align: center; padding: 40px; color: #64748B;"><div class="leaderboard-item-loading">⏳ กำลังดึงคลังข้อสอบวิชา ${subjectName}...</div></div>`;
  modal.style.display = 'flex';
  btnNext.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/api/exams/subject-questions?subject=${encodeURIComponent(subjectName)}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await res.json();
    if (!res.ok || !data.questions || data.questions.length === 0) {
      bodyContent.innerHTML = `<div style="text-align: center; padding: 40px; color: #EF4444;">❌ ไม่พบข้อสอบในวิชานี้ กรุณาแจ้งแอดมินสร้างข้อสอบเพิ่ม</div>`;
      return;
    }

    currentQuizQuestions = data.questions;
    title.textContent = `คลังข้อสอบวิชา ${subjectName}`;
    renderCurrentQuizQuestion();

  } catch (err) {
    console.error('Fetch subject questions error:', err);
    bodyContent.innerHTML = `<div style="text-align: center; padding: 40px; color: #EF4444;">❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์</div>`;
  }
};

window.closeSubjectQuiz = function() {
  const modal = document.getElementById('subjectQuizModal');
  if (modal) modal.style.display = 'none';
};

function renderCurrentQuizQuestion() {
  const q = currentQuizQuestions[currentQuizIndex];
  const total = currentQuizQuestions.length;
  currentQuizAnswered = false;

  const progressBar = document.getElementById('quizProgressBar');
  const stepText = document.getElementById('quizStepText');
  const btnNext = document.getElementById('btnNextQuiz');
  const bodyContent = document.getElementById('quizBodyContent');

  progressBar.style.width = `${((currentQuizIndex + 1) / total) * 100}%`;
  stepText.textContent = `ข้อที่ ${currentQuizIndex + 1} / ${total}`;
  btnNext.style.display = 'none';

  bodyContent.innerHTML = `
    <div style="font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 20px; line-height: 1.6;">
      <span style="color: #BD1B0B;">ข้อที่ ${currentQuizIndex + 1}:</span> ${q.questionText}
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px;" id="choicesContainer">
      <button class="choice-btn" onclick="selectQuizAnswer('A')" id="choice_A" style="padding: 16px; border: 1px solid #E2E8F0; border-radius: 16px; background: white; text-align: left; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit; font-weight: 500; display: flex; align-items: center; gap: 12px;">
        <span style="background: #F1F5F9; color: #475569; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">ก</span>
        <span>${q.optionA}</span>
      </button>

      <button class="choice-btn" onclick="selectQuizAnswer('B')" id="choice_B" style="padding: 16px; border: 1px solid #E2E8F0; border-radius: 16px; background: white; text-align: left; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit; font-weight: 500; display: flex; align-items: center; gap: 12px;">
        <span style="background: #F1F5F9; color: #475569; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">ข</span>
        <span>${q.optionB}</span>
      </button>

      <button class="choice-btn" onclick="selectQuizAnswer('C')" id="choice_C" style="padding: 16px; border: 1px solid #E2E8F0; border-radius: 16px; background: white; text-align: left; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit; font-weight: 500; display: flex; align-items: center; gap: 12px;">
        <span style="background: #F1F5F9; color: #475569; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">ค</span>
        <span>${q.optionC}</span>
      </button>

      <button class="choice-btn" onclick="selectQuizAnswer('D')" id="choice_D" style="padding: 16px; border: 1px solid #E2E8F0; border-radius: 16px; background: white; text-align: left; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit; font-weight: 500; display: flex; align-items: center; gap: 12px;">
        <span style="background: #F1F5F9; color: #475569; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">ง</span>
        <span>${q.optionD}</span>
      </button>
    </div>

    <div id="quizExplanationBox" style="display: none; margin-top: 20px; padding: 16px; border-radius: 16px; background: #F8FAFC; border: 1px solid #CBD5E1; font-size: 13px; line-height: 1.6;">
    </div>
  `;
}

window.selectQuizAnswer = function(selectedOption) {
  if (currentQuizAnswered) return;
  currentQuizAnswered = true;

  const q = currentQuizQuestions[currentQuizIndex];
  const isCorrect = selectedOption.toUpperCase() === String(q.correctOption).toUpperCase();

  if (isCorrect) {
    currentQuizScore++;
  }

  const options = ['A', 'B', 'C', 'D'];
  options.forEach(opt => {
    const btn = document.getElementById(`choice_${opt}`);
    if (!btn) return;
    btn.style.pointerEvents = 'none';

    if (opt === String(q.correctOption).toUpperCase()) {
      btn.style.background = '#ECFDF5';
      btn.style.borderColor = '#10B981';
      btn.style.color = '#065F46';
      btn.querySelector('span').style.background = '#10B981';
      btn.querySelector('span').style.color = 'white';
    } else if (opt === selectedOption.toUpperCase() && !isCorrect) {
      btn.style.background = '#FEF2F2';
      btn.style.borderColor = '#EF4444';
      btn.style.color = '#991B1B';
      btn.querySelector('span').style.background = '#EF4444';
      btn.querySelector('span').style.color = 'white';
    } else {
      btn.style.opacity = '0.5';
    }
  });

  const expBox = document.getElementById('quizExplanationBox');
  if (expBox) {
    expBox.style.display = 'block';
    expBox.style.background = isCorrect ? '#F0FDF4' : '#FEF2F2';
    expBox.style.borderColor = isCorrect ? '#BBF7D0' : '#FECACA';
    expBox.innerHTML = `
      <div style="font-weight: 700; color: ${isCorrect ? '#166534' : '#991B1B'}; margin-bottom: 4px;">
        ${isCorrect ? '✅ ถูกต้อง!' : '❌ ยังไม่ถูกต้อง (เฉลยข้อ ' + q.correctOption + ')'}
      </div>
      <div style="color: #334155;">${q.explanation || 'ไม่มีคำอธิบายเฉลยเพิ่มเติม'}</div>
    `;
  }

  const btnNext = document.getElementById('btnNextQuiz');
  if (btnNext) {
    btnNext.style.display = 'block';
    btnNext.textContent = currentQuizIndex === currentQuizQuestions.length - 1 ? 'ดูสรุปผลคะแนน 🎉' : 'ข้อถัดไป ➔';
  }
};

window.nextQuizQuestion = function() {
  if (currentQuizIndex < currentQuizQuestions.length - 1) {
    currentQuizIndex++;
    renderCurrentQuizQuestion();
  } else {
    finishQuiz();
  }
};

async function finishQuiz() {
  const bodyContent = document.getElementById('quizBodyContent');
  const stepText = document.getElementById('quizStepText');
  const btnNext = document.getElementById('btnNextQuiz');
  const total = currentQuizQuestions.length;

  stepText.textContent = 'เสร็จสิ้นการทำข้อสอบ';
  btnNext.style.display = 'none';

  const percent = Math.round((currentQuizScore / total) * 100);

  bodyContent.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
      <h3 style="font-size: 22px; font-weight: 800; color: #1E293B; margin-bottom: 8px;">สรุปผลการทำข้อสอบ</h3>
      <p style="color: #64748B; font-size: 14px; margin-bottom: 24px;">วิชา ${currentQuizSubject}</p>

      <div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 20px; padding: 24px; max-width: 320px; margin: 0 auto 24px auto;">
        <div style="font-size: 36px; font-weight: 800; color: ${percent >= 60 ? '#10B981' : '#EF4444'};">
          ${currentQuizScore} / ${total}
        </div>
        <div style="font-size: 14px; font-weight: 600; color: #64748B; margin-top: 4px;">
          คิดเป็น ${percent}% (${percent >= 60 ? 'ผ่านเกณฑ์ 👏' : 'ควรทบทวนเพิ่ม 📖'})
        </div>
      </div>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button onclick="startBankSubject('${currentQuizSubject}')" style="padding: 12px 20px; border-radius: 12px; border: 1px solid #CBD5E1; background: white; font-weight: 700; cursor: pointer; font-family: inherit;">🔄 ทำซ้ำวิชานี้</button>
        <button onclick="closeSubjectQuiz()" style="padding: 12px 20px; border-radius: 12px; border: none; background: #BD1B0B; color: white; font-weight: 700; cursor: pointer; font-family: inherit;">🏠 กลับคลังข้อสอบ</button>
      </div>
    </div>
  `;

  // Submit score to backend
  try {
    await fetch(`${API_BASE}/api/user/record-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        score: currentQuizScore,
        totalCount: total,
        subject: currentQuizSubject
      })
    });
    if (typeof checkSession === 'function') checkSession();
  } catch (err) {
    console.error('Record quiz score error:', err);
  }
}


if (btnExamModePretest) {
  btnExamModePretest.addEventListener('click', () => handleStartExam('pretest'));
}
// 4. Logout Handlers
const btnDropdownLogout = document.getElementById('btnDropdownLogout');
const btnProfileLogout = document.getElementById('btnProfileLogout');

async function handleLogout() {
  const confirmLog = await showCenteredConfirm('ยืนยันการออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', { okText: 'ออกจากระบบ', okColor: '#EF4444' });
  if (confirmLog) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('loginProvider');
    window.location.replace('/?login=1');
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
const bankTabBtn = document.getElementById('btnTabBank'); // bank tab
const communityTabBtn = document.getElementById('btnTabCommunity'); // community tab
const battleTabBtn = document.getElementById('btnTabBattle'); // battle tab
const statsTabBtn = document.getElementById('btnTabStats'); // stats tab
const profileTabBtn = document.getElementById('btnTabProfile'); // profile tab

const homeView = document.getElementById('homeView');
const communityView = document.getElementById('communityView');
const battleView = document.getElementById('battleView');
const statsView = document.getElementById('statsView');
const profileView = document.getElementById('profileView');
const questionBankView = document.getElementById('questionBankView');
window.switchTabToHome = function(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  
  const navTabs = document.querySelectorAll('.bottom-nav .nav-tab');
  const homeTabBtn = navTabs[0];
  const homeView = document.getElementById('homeView');
  const communityView = document.getElementById('communityView');
  const battleView = document.getElementById('battleView');
  const statsView = document.getElementById('statsView');
  const profileView = document.getElementById('profileView');
  const questionBankView = document.getElementById('questionBankView');

  navTabs.forEach(t => t.classList.remove('active'));
  if (homeTabBtn) homeTabBtn.classList.add('active');

  if (homeView) homeView.classList.add('active');
  if (communityView) communityView.classList.remove('active');
  if (battleView) battleView.classList.remove('active');
  if (statsView) statsView.classList.remove('active');
  if (profileView) profileView.classList.remove('active');
  if (questionBankView) questionBankView.classList.remove('active');

  if (typeof loadRealProfile === 'function') loadRealProfile();
  if (typeof loadRadarChart === 'function') loadRadarChart();
  if (typeof updateStatsTabDetails === 'function') updateStatsTabDetails();

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

if (btnBackFromBank) {
  btnBackFromBank.addEventListener('click', (e) => {
    switchTabToHome(e);
  });
}

if (bankTabBtn) {
  bankTabBtn.addEventListener('click', (e) => {
    if (e) e.preventDefault();
    navTabs.forEach(t => t.classList.remove('active'));
    bankTabBtn.classList.add('active');
    
    if (questionBankView) questionBankView.classList.add('active');
    if (homeView) homeView.classList.remove('active');
    if (communityView) communityView.classList.remove('active');
    if (battleView) battleView.classList.remove('active');
    if (statsView) statsView.classList.remove('active');
    if (profileView) profileView.classList.remove('active');
  });
}

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
    if (questionBankView) questionBankView.classList.remove('active');
    loadRealProfile(); // Refresh profile values on navigate
    loadRadarChart();
    updateStatsTabDetails();
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
    if (questionBankView) questionBankView.classList.remove('active');
    
    updateCommunityTabDetails();
  });
}

window.showBattleMaintenanceAlert = function(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const modal = document.getElementById('maintenanceModal');
  if (modal) modal.style.display = 'flex';
};

window.closeMaintenanceModal = function() {
  const modal = document.getElementById('maintenanceModal');
  if (modal) modal.style.display = 'none';
};

if (battleTabBtn) {
  battleTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showBattleMaintenanceAlert(e);
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
    if (questionBankView) questionBankView.classList.remove('active');
    
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

function updateAllMyAvatars(faceImage, fullName) {
  const imgIds = ['defaultAvatarImg', 'profileAvatarImg', 'editProfileAvatarImg', 'composePostAvatarImg', ];
  const boxIds = ['defaultAvatar', 'profileAvatarBox', 'editProfileAvatarBox', 'composePostAvatarBox', ];
  
  const displayName = fullName || (window.userProfile && (window.userProfile.fullName || window.userProfile.username)) || 'ผู้ใช้งาน';
  const letter = displayName.charAt(0);
  
  if (faceImage) {
    imgIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.src = faceImage; el.style.display = 'block'; }
    });
    boxIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // For default avatar in header (it has a text box defaultAvatar, but wait, does it have an img element? Let's assume headerAvatar is the img)
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) { headerAvatar.src = faceImage; headerAvatar.style.display = 'block'; }
    const defaultAvatar = document.getElementById('defaultAvatar');
    if (defaultAvatar) defaultAvatar.style.display = 'none';
  } else {
    imgIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    boxIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = letter; el.style.display = 'flex'; }
    });
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) headerAvatar.style.display = 'none';
  }
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

  updateAllMyAvatars(userProfile.faceImage, displayName);

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
      if (rank === 1) rankDisplay = '<span class="leaderboard-medal"></span>';
      else if (rank === 2) rankDisplay = '<span class="leaderboard-medal"></span>';
      else if (rank === 3) rankDisplay = '<span class="leaderboard-medal"></span>';

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

// --- BATTLE ARENA ENGINE & WHEEL OF FORTUNE ---

window.openBattleHub = function() {
  const modal = document.getElementById('battleHubModal');
  if (modal) modal.style.display = 'flex';
};

window.closeBattleHub = function() {
  const modal = document.getElementById('battleHubModal');
  if (modal) modal.style.display = 'none';
};

const btnQuickMatch = document.getElementById('btnQuickMatch');
if (btnQuickMatch) {
  btnQuickMatch.addEventListener('click', (e) => {
    e.preventDefault();
    startNormalBattle1v1();
  });
}

// 1. Wheel of Fortune Canvas & Spin
const SUBJECT_WHEEL_SECTORS = [
  { name: 'งานสารบรรณ', color: '#BD1B0B' },
  { name: 'ความสามารถทั่วไป', color: '#2563EB' },
  { name: 'ภาษาไทย', color: '#059669' },
  { name: 'ภาษาอังกฤษ', color: '#7E22CE' },
  { name: 'ความรู้สังคมฯ', color: '#D97706' },
  { name: 'กฎหมายตำรวจ', color: '#DC2626' },
  { name: 'คอมพิวเตอร์', color: '#0284C7' }
];

let wheelCurrentAngle = 0;
let wheelSpinning = false;
let wheelSelectedSubject = '';
let wheelOnFinishCallback = null;

function drawRouletteWheel() {
  const canvas = document.getElementById('rouletteCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const numSectors = SUBJECT_WHEEL_SECTORS.length;
  const arc = (Math.PI * 2) / numSectors;
  const radius = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numSectors; i++) {
    const angle = wheelCurrentAngle + i * arc;
    ctx.fillStyle = SUBJECT_WHEEL_SECTORS[i].color;
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 6, angle, angle + arc, false);
    ctx.lineTo(radius, radius);
    ctx.fill();

    // Draw text label
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Kanit, sans-serif';
    ctx.translate(
      radius + Math.cos(angle + arc / 2) * (radius - 50),
      radius + Math.sin(angle + arc / 2) * (radius - 50)
    );
    ctx.rotate(angle + arc / 2 + Math.PI / 2);
    ctx.fillText(SUBJECT_WHEEL_SECTORS[i].name, -ctx.measureText(SUBJECT_WHEEL_SECTORS[i].name).width / 2, 0);
    ctx.restore();
  }

  // Draw Center Circle Cap
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(radius, radius, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#BD1B0B';
  ctx.font = 'bold 14px Kanit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VS', radius, radius);
}

window.openRouletteWheelModal = function(callback) {
  wheelOnFinishCallback = callback;
  const modal = document.getElementById('rouletteWheelModal');
  const resBox = document.getElementById('rouletteResultBox');
  const btnSpin = document.getElementById('btnStartWheelSpin');
  if (modal) modal.style.display = 'flex';
  if (resBox) resBox.style.display = 'none';
  if (btnSpin) {
    btnSpin.style.display = 'block';
    btnSpin.disabled = false;
    btnSpin.textContent = '🎰 กดเพื่อหมุนวงล้อสุ่มวิชา!';
  }
  wheelCurrentAngle = 0;
  drawRouletteWheel();
};

window.triggerWheelSpin = function() {
  if (wheelSpinning) return;
  wheelSpinning = true;
  const btnSpin = document.getElementById('btnStartWheelSpin');
  if (btnSpin) {
    btnSpin.disabled = true;
    btnSpin.textContent = '🔄 กำลังหมุนเสี่ยงโชควิชา...';
  }

  const randIdx = Math.floor(Math.random() * SUBJECT_WHEEL_SECTORS.length);
  wheelSelectedSubject = SUBJECT_WHEEL_SECTORS[randIdx].name;

  const numSectors = SUBJECT_WHEEL_SECTORS.length;
  const arc = (Math.PI * 2) / numSectors;
  const targetAngle = (Math.PI * 3 / 2) - (randIdx * arc + arc / 2) + (Math.PI * 10);

  const startAngle = wheelCurrentAngle;
  const duration = 3500;
  const startTime = Date.now();

  function animateWheel() {
    const now = Date.now();
    const elapsed = now - startTime;
    if (elapsed >= duration) {
      wheelCurrentAngle = targetAngle % (Math.PI * 2);
      drawRouletteWheel();
      wheelSpinning = false;

      const resBox = document.getElementById('rouletteResultBox');
      const lblRes = document.getElementById('lblSelectedSubjectResult');
      if (resBox) resBox.style.display = 'block';
      if (lblRes) lblRes.textContent = wheelSelectedSubject;

      setTimeout(() => {
        const modal = document.getElementById('rouletteWheelModal');
        if (modal) modal.style.display = 'none';
        if (typeof wheelOnFinishCallback === 'function') {
          wheelOnFinishCallback(wheelSelectedSubject);
        }
      }, 1500);
      return;
    }

    const t = elapsed / duration;
    const easeOut = 1 - Math.pow(1 - t, 3);
    wheelCurrentAngle = startAngle + (targetAngle - startAngle) * easeOut;
    drawRouletteWheel();
    requestAnimationFrame(animateWheel);
  }

  requestAnimationFrame(animateWheel);
};

// Auto-random subject selector (for Quick Match 1v1)
const BATTLE_SUBJECT_LIST = [
  'งานสารบรรณ',
  'ความสามารถทั่วไป',
  'ภาษาไทย',
  'ภาษาอังกฤษ',
  'ความรู้สังคมฯ',
  'กฎหมายตำรวจ',
  'คอมพิวเตอร์'
];

function getRandomBattleSubject() {
  const randIdx = Math.floor(Math.random() * BATTLE_SUBJECT_LIST.length);
  return BATTLE_SUBJECT_LIST[randIdx];
}

// Real-Time Matchmaking Engine (No Demo / No Bots)
let realMatchPollInterval = null;
let searchingSubject = '';
let searchingIsRanked = false;

window.startRealMatchmakingPoll = function(subjectName, isRanked = false) {
  searchingSubject = subjectName;
  searchingIsRanked = isRanked;

  // Show Searching Modal
  const modal = document.createElement('div');
  modal.id = 'realMatchSearchingModal';
  modal.style.position = 'fixed';
  modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100vw'; modal.style.height = '100vh';
  modal.style.background = 'rgba(15, 23, 42, 0.85)'; modal.style.zIndex = '9999'; modal.style.display = 'flex';
  modal.style.alignItems = 'center'; modal.style.justifyContent = 'center'; modal.style.fontFamily = 'Kanit, sans-serif';

  modal.innerHTML = `
    <div style="background: white; border-radius: 28px; padding: 32px 24px; text-align: center; max-width: 440px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);">
      <div class="searching-spinner" style="width: 64px; height: 64px; border: 5px solid #F1F5F9; border-top-color: #BD1B0B; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px auto;"></div>
      <span style="background: #FEF2F2; color: #BD1B0B; font-weight: 800; padding: 4px 12px; border-radius: 999px; font-size: 12px;">Real Online Players Only</span>
      <h3 style="font-size: 20px; font-weight: 800; margin: 10px 0 6px 0; color: #1E293B;">กำลังรอคู่ต่อสู้ตัวจริงเข้ามา...</h3>
      <p style="font-size: 13px; color: #64748B; margin-bottom: 16px;" id="lblRealSearchSubtext">วิชาประลอง: <strong style="color: #BD1B0B;">${escapeHTML(subjectName)}</strong> ${isRanked ? '(โหมด Ranked ±200 แต้ม)' : ''}</p>
      
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 12px; margin-bottom: 20px; font-size: 13px; color: #475569;">
        ⏱️ เวลาที่รอ: <strong id="lblRealSearchTimer" style="color: #BD1B0B; font-size: 15px;">0 วินาที</strong>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #94A3B8;">(ระบบจับคู่เฉพาะผู้เล่นจริงออนไลน์เท่านั้น ไม่มีบอท หากยังไม่มีผู้เล่นเข้ามา จะรอต่อไปเรื่อยๆ)</p>
      </div>

      <button onclick="cancelRealMatchmakingPoll()" style="background: #F1F5F9; color: #64748B; border: 1px solid #CBD5E1; padding: 12px 24px; border-radius: 14px; font-weight: 700; font-size: 14px; width: 100%; cursor: pointer; font-family: inherit;">
        ❌ ยกเลิกการค้นหา
      </button>
    </div>
  `;

  if (!document.getElementById('spin-keyframes')) {
    const style = document.createElement('style');
    style.id = 'spin-keyframes';
    style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  document.body.appendChild(modal);

  let searchSeconds = 0;
  if (realMatchPollInterval) clearInterval(realMatchPollInterval);

  async function poll() {
    searchSeconds += 2;
    const timerEl = document.getElementById('lblRealSearchTimer');
    if (timerEl) timerEl.textContent = `${searchSeconds} วินาที`;

    try {
      const res = await fetch(`${API_BASE}/api/exams/battle/poll-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ subject: subjectName, isRanked })
      });
      const data = await res.json();

      if (data.status === 'matched') {
        clearInterval(realMatchPollInterval);
        currentMatchId = data.matchId;
        const searchModal = document.getElementById('realMatchSearchingModal');
        if (searchModal) searchModal.remove();

        showMatchFoundModal(data.subject || subjectName, data.opponent, data.questions);
      }
    } catch (err) {
      console.error('Poll match error:', err);
    }
  }

  poll(); // Initial poll
  realMatchPollInterval = setInterval(poll, 2000);
};

window.cancelRealMatchmakingPoll = async function() {
  if (realMatchPollInterval) clearInterval(realMatchPollInterval);
  const modal = document.getElementById('realMatchSearchingModal');
  if (modal) modal.remove();

  try {
    await fetch(`${API_BASE}/api/exams/battle/leave-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
    });
  } catch (e) {
    console.error('Leave queue error:', e);
  }
};

function showMatchFoundModal(subjectName, opponent, questions) {
  const modal = document.createElement('div');
  modal.id = 'realMatchFoundModal';
  modal.style.position = 'fixed';
  modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100vw'; modal.style.height = '100vh';
  modal.style.background = 'rgba(15, 23, 42, 0.9)'; modal.style.zIndex = '9999'; modal.style.display = 'flex';
  modal.style.alignItems = 'center'; modal.style.justifyContent = 'center'; modal.style.fontFamily = 'Kanit, sans-serif';

  const userInitial = userProfile ? (userProfile.fullName || 'คุณ').charAt(0) : 'ค';
  const userPts = userProfile ? (userProfile.points || 0) : 0;
  const oppName = opponent ? (opponent.fullName || opponent.username || 'ผู้เล่นตัวจริง') : 'ผู้เล่นตัวจริง';
  const oppInitial = oppName.charAt(0);
  const oppPts = opponent ? (opponent.points || 0) : 0;

  modal.innerHTML = `
    <div style="background: white; border-radius: 28px; padding: 32px 24px; text-align: center; max-width: 480px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);">
      <span style="background: #ECFDF5; color: #059669; font-weight: 800; padding: 4px 14px; border-radius: 999px; font-size: 12px;">🎉 พบคู่ต่อสู้ตัวจริงแล้ว!</span>
      
      <div style="margin: 14px 0 18px 0; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 16px; padding: 12px;">
        <span style="font-size: 12px; color: #991B1B; font-weight: 700; display: block;">วิชาที่จับคู่ประลอง:</span>
        <h3 style="margin: 2px 0 0 0; font-size: 18px; font-weight: 900; color: #BD1B0B;">${escapeHTML(subjectName)}</h3>
      </div>

      <!-- VS Card -->
      <div style="display: flex; justify-content: space-around; align-items: center; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px 14px; border-radius: 20px; margin-bottom: 24px;">
        <!-- Player 1 -->
        <div style="text-align: center; flex: 1;">
          <div style="width: 54px; height: 54px; border-radius: 50%; background: #BD1B0B; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; margin: 0 auto 8px auto; font-size: 20px; box-shadow: 0 4px 12px rgba(189,27,11,0.3);">${userInitial}</div>
          <span style="font-size: 14px; font-weight: 800; color: #1E293B; display: block;">${escapeHTML(userProfile ? (userProfile.fullName || 'คุณ') : 'คุณ')}</span>
          <span style="font-size: 12px; color: #64748B; font-weight: 600;">คะแนน ${userPts} แต้ม</span>
        </div>

        <div style="font-size: 22px; font-weight: 900; color: #BD1B0B; font-style: italic; padding: 0 10px;">VS</div>

        <!-- Player 2 (Opponent) -->
        <div style="text-align: center; flex: 1;">
          <div style="width: 54px; height: 54px; border-radius: 50%; background: #D97706; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; margin: 0 auto 8px auto; font-size: 20px; box-shadow: 0 4px 12px rgba(217,119,6,0.3);">${oppInitial}</div>
          <span style="font-size: 14px; font-weight: 800; color: #1E293B; display: block;">${escapeHTML(oppName)}</span>
          <span style="font-size: 12px; color: #64748B; font-weight: 600;">คะแนน ${oppPts} แต้ม</span>
        </div>
      </div>

      <button id="btnStartRealDuel" style="background: #BD1B0B; color: white; border: none; padding: 14px 28px; border-radius: 14px; font-weight: 800; font-size: 16px; width: 100%; cursor: pointer; font-family: inherit; box-shadow: 0 4px 12px rgba(189,27,11,0.3);">
        ⚔️ เริ่มประลองดวลเดี่ยว (10 ข้อ)
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const btnStart = document.getElementById('btnStartRealDuel');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      modal.remove();
      startLiveBattleArenaWithQuestions(subjectName, opponent, questions, { matchId: currentMatchId || null });
    });
  }
}



window.confirmSubjectSelection = function(subjectName) {
  closeBattleSubjectSelectModal();
  startRealMatchmakingPoll(subjectName, pendingSubjectMode === 'ranked');
};

// 2. Battle Modes
// Quick Match: Auto-random subject (1v1)
window.startNormalBattle1v1 = function() {
  closeBattleHub();
  const selectedSubject = getRandomBattleSubject();
  startRealMatchmakingPoll(selectedSubject, false);
};

// Ranked Battle: User selects subject manually
window.startRankedBattle = function() {
  closeBattleHub();
  openBattleSubjectSelectModal('ranked', '🏆 ประลองจัดอันดับ (±200 แต้ม)');
};

// Tournament Battle: Open 8-player room for real users
window.startTournamentBattle = function() {
  closeBattleHub();
  openCustomRoomSetup();
  const maxSel = document.getElementById('selMaxRoomPlayers');
  if (maxSel) maxSel.value = '8';
};

// 3. Custom Room Links
let currentRoomCode = '';

// Custom Battle Room Arena System
let lobbyPollInterval = null;
let currentRoomData = null;

// 1. Fetch Active Public Rooms
window.fetchActiveBattleRooms = async function() {
  const container = document.getElementById('activeRoomsListContainer');
  if (!container) return;

  try {
    const token = authToken || localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE}/api/battle/rooms`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = res.ok ? await res.json() : { rooms: [] };
    const rooms = data.rooms || [];

    if (rooms.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px 12px; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 16px;">
          <p style="margin: 0 0 6px 0; font-weight: 700; color: #475569; font-size: 14px;">ยังไม่มีห้องสาธารณะเปิดอยู่ขณะนี้</p>
          <span style="font-size: 12px; color: #94A3B8;">กดปุ่ม "สร้างห้องประลอง" ด้านบนเพื่อเปิดห้องประลองของคุณได้เลย</span>
        </div>
      `;
      return;
    }

    container.innerHTML = rooms.map(r => `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="background: #FEF2F2; color: #BD1B0B; font-weight: 800; padding: 2px 10px; border-radius: 999px; font-size: 11px;">วิชา: ${escapeHTML(r.subject)}</span>
            <span style="background: #EFF6FF; color: #2563EB; font-weight: 700; padding: 2px 10px; border-radius: 999px; font-size: 11px;">ผู้เล่น ${r.currentPlayers}/${r.maxPlayers} คน</span>
          </div>
          <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #1E293B;">หัวหน้าห้อง: ${escapeHTML(r.hostName)} (${r.roomCode})</h4>
        </div>
        <button onclick="submitDirectJoinRoom('${r.roomCode}')" style="background: #10B981; color: white; border: none; padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; font-family: inherit; box-shadow: 0 2px 6px rgba(16,185,129,0.3);">
          เข้าประลอง
        </button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Fetch Active Rooms Error:', err);
  }
};

window.openCustomRoomModal = function() {
  const modal = document.getElementById('customRoomModal');
  if (modal) modal.style.display = 'flex';
};

window.openCustomRoomSetup = function() {
  openCustomRoomModal();
};

window.submitCreateCustomRoom = async function() {
  const subject = document.getElementById('selRoomSubject') ? document.getElementById('selRoomSubject').value : 'งานสารบรรณ';
  const privacy = document.getElementById('selRoomPrivacy') ? document.getElementById('selRoomPrivacy').value : 'public';
  const maxPlayers = document.getElementById('selMaxRoomPlayers') ? document.getElementById('selMaxRoomPlayers').value : 8;

  try {
    const token = authToken || localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE}/api/battle/room/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ subject, isPrivate: privacy === 'private', maxPlayers })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ไม่สามารถสร้างห้องได้');

    document.getElementById('customRoomModal').style.display = 'none';
    enterRoomLobby(data.roomCode, data.room);
    fetchActiveBattleRooms();
  } catch (err) {
    showCenteredAlert(err.message, { title: 'เกิดข้อผิดพลาด' });
  }
};

window.submitDirectJoinRoom = function(codeFromList) {
  const codeInput = document.getElementById('txtDirectJoinRoomCode');
  const code = codeFromList || (codeInput ? codeInput.value : '').trim();

  if (!code) {
    showCenteredAlert('กรุณากรอกรหัสห้องประลอง', { title: 'แจ้งเตือน' });
    return;
  }
  submitJoinCustomRoomByCode(code);
};

window.submitJoinCustomRoom = function() {
  const code = (document.getElementById('txtJoinRoomCode') ? document.getElementById('txtJoinRoomCode').value : '').trim();
  submitJoinCustomRoomByCode(code);
};

async function submitJoinCustomRoomByCode(code) {
  try {
    const token = authToken || localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE}/api/battle/room/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ roomCode: code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ไม่สามารถเข้าห้องได้');

    const modal = document.getElementById('customRoomModal');
    if (modal) modal.style.display = 'none';
    enterRoomLobby(data.roomCode, data.room);
  } catch (err) {
    showCenteredAlert(err.message, { title: 'เกิดข้อผิดพลาด' });
  }
}

function enterRoomLobby(code, roomData) {
  currentRoomCode = code;
  currentRoomData = roomData;
  const modal = document.getElementById('roomLobbyDialog');
  const lblCode = document.getElementById('lblLobbyRoomCode');
  const lblUrl = document.getElementById('lblRoomShareUrl');
  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${code}`;

  if (modal) modal.style.display = 'flex';
  if (lblCode) lblCode.textContent = `ห้องประลอง: ${code}`;
  if (lblUrl) lblUrl.textContent = shareUrl;

  updateLobbyUI(roomData);

  // Poll lobby status every 2 seconds
  if (lobbyPollInterval) clearInterval(lobbyPollInterval);
  lobbyPollInterval = setInterval(async () => {
    try {
      const token = authToken || localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/battle/room/status?roomCode=${code}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.room) {
          currentRoomData = data.room;
          updateLobbyUI(data.room);

          if (data.room.status === 'SPINNING') {
            clearInterval(lobbyPollInterval);
            modal.style.display = 'none';
            showExamSetWheelSpinAnimation(data.room.subject, data.room.selectedSetTitle, data.room.questions, data.room.players);
          }
        }
      } else {
        // Room was closed or deleted (host left)
        clearInterval(lobbyPollInterval);
        if (modal) modal.style.display = 'none';
        currentRoomCode = null;
        currentRoomData = null;
        showCenteredAlert('ห้องประลองนี้ถูกปิดแล้วหรือหัวหน้าห้องออกจากห้องแล้ว', { title: 'แจ้งเตือน' });
        fetchActiveBattleRooms();
      }
    } catch (e) {
      console.error('Lobby status poll error:', e);
    }
  }, 2000);
}

function updateLobbyUI(roomData) {
  if (!roomData) return;
  const countLabel = document.getElementById('lblLobbyPlayersCount');
  const container = document.getElementById('lobbyPlayersContainer');
  const btnStart = document.getElementById('btnHostStartDuel');

  const players = roomData.players || [];
  if (countLabel) countLabel.textContent = `${players.length}/${roomData.maxPlayers}`;

  if (container) {
    container.innerHTML = players.map(p => `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 10px 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 34px; height: 34px; border-radius: 50%; background: ${p.isHost ? '#BD1B0B' : '#059669'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">${escapeHTML((p.fullName || 'P').charAt(0))}</div>
          <div>
            <span style="font-size: 14px; font-weight: 800; color: #1E293B; display: block;">${escapeHTML(p.fullName || p.username || 'ผู้เล่น')}</span>
            <span style="font-size: 11px; color: #64748B;">คะแนน ${p.points || 0} แต้ม</span>
          </div>
        </div>
        ${p.isHost ? '<span style="font-size: 11px; background: #FEF2F2; color: #BD1B0B; font-weight: 800; padding: 4px 10px; border-radius: 999px;">หัวหน้าห้อง</span>' : '<span style="font-size: 11px; background: #ECFDF5; color: #059669; font-weight: 700; padding: 4px 10px; border-radius: 999px;">พร้อมแล้ว</span>'}
      </div>
    `).join('');
  }

  const isHost = userProfile && String(roomData.hostUserId) === String(userProfile.id);
  if (btnStart) {
    if (isHost) {
      if (players.length < 2) {
        btnStart.style.display = 'block';
        btnStart.style.background = '#94A3B8';
        btnStart.style.cursor = 'not-allowed';
        btnStart.style.boxShadow = 'none';
        btnStart.innerHTML = `⏳ รอผู้เล่นเข้าร่วมห้อง... (อย่างน้อย 2 คน)`;
        btnStart.onclick = function() {
          showCenteredAlert('ต้องรอให้มีผู้เล่นเข้าร่วมห้องอย่างน้อย 2 คนก่อน จึงจะเริ่มประลองได้ครับ', { title: 'ยังไม่สามารถเริ่มได้' });
        };
      } else {
        btnStart.style.display = 'block';
        btnStart.style.background = '#10B981';
        btnStart.style.cursor = 'pointer';
        btnStart.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
        btnStart.innerHTML = `⚔️ กดเริ่มประลอง (ผู้เล่นพร้อมแล้ว ${players.length} คน)`;
        btnStart.onclick = hostTriggerStartDuel;
      }
    } else {
      btnStart.style.display = 'block';
      btnStart.style.background = '#94A3B8';
      btnStart.style.cursor = 'not-allowed';
      btnStart.style.boxShadow = 'none';
      btnStart.innerHTML = `รอหัวหน้าห้องกดเริ่มประลอง...`;
      btnStart.onclick = null;
    }
  }
}

window.leaveRoomLobby = async function() {
  if (lobbyPollInterval) clearInterval(lobbyPollInterval);
  const code = currentRoomCode;
  currentRoomCode = null;
  currentRoomData = null;

  const modal = document.getElementById('roomLobbyDialog');
  if (modal) modal.style.display = 'none';

  if (code) {
    try {
      const token = authToken || localStorage.getItem('authToken');
      await fetch(`${API_BASE}/api/battle/room/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ roomCode: code })
      });
    } catch (e) {
      console.error('Leave room error:', e);
    }
  }

  fetchActiveBattleRooms();
};

window.hostTriggerStartDuel = async function() {
  if (!currentRoomCode) return;
  if (!currentRoomData || !currentRoomData.players || currentRoomData.players.length < 2) {
    showCenteredAlert('ต้องรอให้มีผู้เล่นเข้าร่วมห้องอย่างน้อย 2 คนก่อน จึงจะเริ่มประลองได้ครับ', { title: 'ยังไม่สามารถเริ่มได้' });
    return;
  }
  try {
    const token = authToken || localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE}/api/battle/room/start-spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ roomCode: currentRoomCode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ไม่สามารถเริ่มการสุ่มได้');
  } catch (err) {
    showCenteredAlert(err.message, { title: 'เกิดข้อผิดพลาด' });
  }
};

// Exam Set Wheel Spin Animation
function showExamSetWheelSpinAnimation(subjectName, selectedSetTitle, questions, players) {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100vw'; modal.style.height = '100vh';
  modal.style.background = 'rgba(15, 23, 42, 0.9)'; modal.style.zIndex = '9999'; modal.style.display = 'flex';
  modal.style.alignItems = 'center'; modal.style.justifyContent = 'center'; modal.style.fontFamily = 'Kanit, sans-serif';

  modal.innerHTML = `
    <div style="background: white; border-radius: 28px; padding: 32px 24px; text-align: center; max-width: 440px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);">
      <span style="background: #FEF2F2; color: #BD1B0B; font-weight: 800; padding: 4px 12px; border-radius: 999px; font-size: 12px;">กำลังสุ่มชุดข้อสอบ</span>
      <h3 style="margin: 10px 0 4px 0; font-size: 20px; font-weight: 800; color: #1E293B;">วิชา: ${escapeHTML(subjectName)}</h3>
      <p style="font-size: 13px; color: #64748B; margin-bottom: 20px;">หมุนวงล้อเพื่อเลือกชุดข้อสอบทำข้อสอบ 10 ข้อ...</p>

      <div style="position: relative; width: 220px; height: 220px; margin: 0 auto 20px auto;">
        <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 20px solid #BD1B0B; z-index: 10;"></div>
        <div id="examWheelSpinner" style="width: 220px; height: 220px; border-radius: 50%; border: 6px solid #BD1B0B; background: conic-gradient(#BD1B0B 0 60deg, #2563EB 60deg 120deg, #059669 120deg 180deg, #7E22CE 180deg 240deg, #D97706 240deg 300deg, #0284C7 300deg 360deg); transition: transform 3s cubic-bezier(0.15, 0.9, 0.3, 1);"></div>
      </div>

      <div id="spinResultBox" style="display: none; background: #FEF2F2; border: 2px solid #FECACA; border-radius: 16px; padding: 14px; margin-top: 10px;">
        <span style="font-size: 12px; color: #991B1B; font-weight: 700; display: block;">สุ่มได้ชุดข้อสอบ:</span>
        <h4 style="margin: 4px 0 0 0; font-size: 17px; font-weight: 900; color: #BD1B0B;">${escapeHTML(selectedSetTitle)}</h4>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  setTimeout(() => {
    const wheel = document.getElementById('examWheelSpinner');
    if (wheel) wheel.style.transform = 'rotate(1800deg)';
  }, 100);

  setTimeout(() => {
    const resBox = document.getElementById('spinResultBox');
    if (resBox) resBox.style.display = 'block';
  }, 3000);

  setTimeout(() => {
    modal.remove();
    const opp = (Array.isArray(players) && players.length > 1) ? players.find(p => String(p.userId) !== String(userProfile ? userProfile.id : '')) : null;
    startLiveBattleArenaWithQuestions(subjectName, opp, questions, { roomCode: currentRoomCode });
  }, 4200);
}

// Check if loaded with ?room=CODE
function checkRoomShareUrlOnLoad() {
  const params = new URLSearchParams(window.location.search);
  const roomCode = params.get('room');
  if (roomCode) {
    setTimeout(async () => {
      try {
        const token = authToken || localStorage.getItem('authToken') || userToken;
        const res = await fetch(`${API_BASE}/api/battle/room/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ roomCode })
        });
        if (res.ok) {
          enterRoomLobby(roomCode);
        }
      } catch (e) {
        console.error('URL Room Join Error:', e);
      }
    }, 1500);
  }
}

// 4. Live Battle Duel Runner (100% Real Users / No Bots)
let currentMatchId = null;
let battleLiveScoreInterval = null;
let currentBattleState = {
  subject: '',
  questions: [],
  currentIndex: 0,
  playerScore: 0,
  opponentScore: 0,
  roomCode: null,
  matchId: null,
  mode: ''
};

function startLiveBattleArenaWithQuestions(subjectName, opponent, questions, battleContext = {}) {
  if (battleLiveScoreInterval) clearInterval(battleLiveScoreInterval);

  currentBattleState = {
    subject: subjectName,
    questions,
    currentIndex: 0,
    playerScore: 0,
    opponentScore: 0,
    opponentInfo: opponent,
    roomCode: battleContext.roomCode || currentRoomCode || null,
    matchId: battleContext.matchId || currentMatchId || null,
    mode: 'real_match'
  };

  const modal = document.getElementById('liveBattleArenaModal');
  if (modal) modal.style.display = 'flex';

  const pName = document.getElementById('arenaPlayerName');
  const oName = document.getElementById('arenaOpponentName');
  const oAvatar = document.getElementById('arenaOpponentAvatar');
  const subjTag = document.getElementById('arenaSubjectTag');

  const oppName = opponent ? (opponent.fullName || opponent.username || 'ผู้เล่นตัวจริง') : 'ผู้เล่นตัวจริง';
  const oppInitial = oppName.charAt(0);

  if (pName) pName.textContent = userProfile ? (userProfile.fullName || 'คุณ') : 'คุณ';
  if (oName) oName.textContent = oppName;
  if (oAvatar) oAvatar.textContent = oppInitial;
  if (subjTag) subjTag.textContent = `วิชา: ${subjectName}`;

  renderCurrentBattleQuestion();

  // Real-time live score sync between real players (No bots)
  const oppUserId = opponent ? String(opponent.userId) : null;
  battleLiveScoreInterval = setInterval(async () => {
    try {
      const token = authToken || localStorage.getItem('authToken') || userToken;
      if (currentBattleState.roomCode) {
        const res = await fetch(`${API_BASE}/api/battle/room/live-score?roomCode=${currentBattleState.roomCode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.scores) {
            const myId = userProfile ? String(userProfile.id) : null;
            if (oppUserId && data.scores[oppUserId]) {
              currentBattleState.opponentScore = data.scores[oppUserId].score || 0;
            } else {
              for (const [uId, sc] of Object.entries(data.scores)) {
                if (String(uId) !== myId) {
                  currentBattleState.opponentScore = sc.score || 0;
                  break;
                }
              }
            }
            const oScore = document.getElementById('arenaOpponentScore');
            if (oScore) oScore.textContent = `คะแนน: ${currentBattleState.opponentScore} ข้อ`;
          }
        }
      } else if (currentBattleState.matchId) {
        const res = await fetch(`${API_BASE}/api/exams/battle/match-status?matchId=${currentBattleState.matchId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.scores) {
            const myId = userProfile ? String(userProfile.id) : null;
            for (const [uId, sc] of Object.entries(data.scores)) {
              if (String(uId) !== myId) {
                currentBattleState.opponentScore = sc.score || 0;
                break;
              }
            }
            const oScore = document.getElementById('arenaOpponentScore');
            if (oScore) oScore.textContent = `คะแนน: ${currentBattleState.opponentScore} ข้อ`;
          }
        }
      }
    } catch (e) {
      console.error('Live score poll error:', e);
    }
  }, 1000);
}

function renderCurrentBattleQuestion() {
  const { questions, currentIndex, playerScore, opponentScore } = currentBattleState;
  const container = document.getElementById('arenaBodyContent');
  const stepText = document.getElementById('arenaStepText');
  const btnNext = document.getElementById('btnArenaNext');
  const pScore = document.getElementById('arenaPlayerScore');
  const oScore = document.getElementById('arenaOpponentScore');

  if (pScore) pScore.textContent = `คะแนน: ${playerScore} ข้อ`;
  if (oScore) oScore.textContent = `คะแนน: ${opponentScore} ข้อ`;

  if (currentIndex >= questions.length) {
    finishLiveBattleDuel();
    return;
  }

  if (btnNext) btnNext.style.display = 'none';
  if (stepText) stepText.textContent = `ข้อที่ ${currentIndex + 1} / ${questions.length}`;

  const q = questions[currentIndex];

  if (container) {
    container.innerHTML = `
      <div>
        <h3 style="font-size: 16px; font-weight: 800; color: #1E293B; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">
          ${currentIndex + 1}. ${escapeHTML(q.questionText)}
        </h3>
        <div>
          ${q.choices.map((choiceText, idx) => `
            <button onclick="selectArenaAnswer(${idx + 1})" style="width: 100%; text-align: left; padding: 14px 18px; border-radius: 14px; font-size: 14px; font-family: inherit; margin-bottom: 10px; cursor: pointer; background: #F8FAFC; border: 1px solid #E2E8F0; color: #1E293B; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
              <span style="width: 28px; height: 28px; border-radius: 50%; background: #E2E8F0; color: #475569; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; flex-shrink: 0;">${idx + 1}</span>
              <span>${escapeHTML(choiceText)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
}

window.selectArenaAnswer = function(choiceNum) {
  const { questions, currentIndex } = currentBattleState;
  const q = questions[currentIndex];

  if (choiceNum === q.correctAnswer) {
    currentBattleState.playerScore++;
  }

  // Pure real user gameplay: No bot simulation
  currentBattleState.currentIndex++;
  renderCurrentBattleQuestion();

  // Send real score live to server
  syncMyLiveBattleScore(false);
};

async function syncMyLiveBattleScore(isFinished = false) {
  try {
    const token = authToken || localStorage.getItem('authToken') || userToken;
    const body = {
      score: currentBattleState.playerScore,
      currentIndex: currentBattleState.currentIndex,
      isFinished
    };

    if (currentBattleState.roomCode) {
      body.roomCode = currentBattleState.roomCode;
      await fetch(`${API_BASE}/api/battle/room/update-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
    } else if (currentBattleState.matchId) {
      body.matchId = currentBattleState.matchId;
      await fetch(`${API_BASE}/api/exams/battle/match-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
    }
  } catch (e) {
    console.error('Sync live score error:', e);
  }
}

async function finishLiveBattleDuel() {
  if (battleLiveScoreInterval) clearInterval(battleLiveScoreInterval);

  // Submit final finished score
  await syncMyLiveBattleScore(true);

  // Fetch final real opponent score from server
  try {
    const token = authToken || localStorage.getItem('authToken') || userToken;
    if (currentBattleState.roomCode) {
      const res = await fetch(`${API_BASE}/api/battle/room/live-score?roomCode=${currentBattleState.roomCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const myId = userProfile ? String(userProfile.id) : null;
        for (const [uId, sc] of Object.entries(data.scores || {})) {
          if (String(uId) !== myId) {
            currentBattleState.opponentScore = sc.score || 0;
            break;
          }
        }
      }
    } else if (currentBattleState.matchId) {
      const res = await fetch(`${API_BASE}/api/exams/battle/match-status?matchId=${currentBattleState.matchId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const myId = userProfile ? String(userProfile.id) : null;
        for (const [uId, sc] of Object.entries(data.scores || {})) {
          if (String(uId) !== myId) {
            currentBattleState.opponentScore = sc.score || 0;
            break;
          }
        }
      }
    }
  } catch (e) {}

  const { playerScore, opponentScore, subject } = currentBattleState;
  const isWinner = playerScore >= opponentScore;
  const modal = document.getElementById('liveBattleArenaModal');

  if (modal) modal.style.display = 'none';

  try {
    const token = authToken || localStorage.getItem('authToken') || userToken;
    const res = await fetch(`${API_BASE}/api/user/battle-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ winner: isWinner, subject })
    });
    const data = await res.json();

    if (userProfile && data.user) {
      userProfile.points = data.user.points;
      userProfile.level = data.user.level;
      userProfile.xp = data.user.xp;
      userProfile.battleWins = data.user.battleWins;
      updateUserProfileUI();
    }

    const titleMsg = isWinner ? '🎉 ชนะการประลองยุทธ์!' : '😢 แพ้การประลอง!';
    const ptsMsg = isWinner ? '+30 แต้ม' : '-30 แต้ม (ไม่ติดลบ)';

    showCenteredAlert(`
      <div style="text-align: center; padding: 10px;">
        <div style="font-size: 50px; margin-bottom: 8px;">${isWinner ? '🏆' : '💀'}</div>
        <h3 style="font-size: 20px; font-weight: 900; margin: 0 0 10px 0; color: ${isWinner ? '#10B981' : '#EF4444'};">${titleMsg}</h3>
        <p style="font-size: 14px; color: #475569; margin-bottom: 12px;">คุณทำได้ <strong>${playerScore}</strong> ข้อ | คู่ต่อสู้ทำได้ <strong>${opponentScore}</strong> ข้อ</p>
        <div style="background: ${isWinner ? '#ECFDF5' : '#FEF2F2'}; color: ${isWinner ? '#059669' : '#991B1B'}; padding: 10px; border-radius: 12px; font-weight: 800; font-size: 15px;">
          ผลการปรับแต้ม: ${ptsMsg} (คะแนนปัจจุบัน: ${userProfile ? userProfile.points : 0} แต้ม)
        </div>
      </div>
    `, { title: 'สรุปการประลอง' });
  } catch (err) {
    console.error('Complete Duel Error:', err);
  }
}

// Automatically check room parameter on initialization
checkRoomShareUrlOnLoad();

  var statsRadarChartInstance = null;
  var statsBarChartInstance = null;
  var statsLineChartInstance = null;

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
  if (typeof Chart !== 'undefined') {
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
  } // End of Chart check

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

    // recsContainer.innerHTML = recsHtml;
    recsContainer.innerHTML = '<div style="text-align: center; color: var(--text-light); padding: 20px; font-size: 13px;">คำแนะนำกำลังจะมาในเร็วๆ นี้...</div>';
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
          <span style="font-size: 32px; display: block; margin-bottom: 8px;"></span>
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
              ${renderAvatarHtml(c.user, 'comment-avatar', '', '#94A3B8')}
              <div class="comment-content-box">
                <span class="comment-author-name">${cName}</span>
                <span class="comment-text">${formatMessageContent(c.content)}</span>
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
              ${renderAvatarHtml(p.user, 'post-author-avatar', '', '#CBD5E1')}
              <div>
                <span class="post-author-name" style="display: block;">${displayName}</span>
                <span class="post-time">${timeStr}</span>
                ${actionsHtml}
              </div>
            </div>
          </div>
          <p class="post-body" id="postBodyText-${p.id}">${formatMessageContent(p.content)}</p>
          
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
           เริ่มพิมพ์ข้อความแชทเพื่อพูดคุยในกลุ่มแชทรวมวันนี้
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

      const avatarHtml = renderAvatarHtml(m.user, 'friend-user-avatar', 'width: 32px; height: 32px; font-size: 13px; cursor: pointer; flex-shrink: 0; border-radius: 50%; font-weight: 600; margin-right: 8px;', isMe ? 'var(--primary-color)' : '#BD1B0B').replace('<div ', '<div onclick="showUserProfile(${m.userId})" ');

      html += `
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px; justify-content: ${isMe ? 'flex-end' : 'flex-start'};">
          ${isMe ? '' : avatarHtml}
          <div class="chat-bubble ${isMe ? 'me' : ''}" style="margin: 0;">
            <span class="chat-sender" onclick="showUserProfile(${m.userId})" style="cursor: pointer; font-weight: 600;">${isMe ? 'คุณ' : displayName}</span>
            <div class="chat-message-box">
              ${formatMessageContent(m.content)}
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
          <span style="font-size: 32px; display: block; margin-bottom: 8px;"></span>
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
            <button class="btn-quick-match" style="padding: 6px 14px; font-size: 12px; border-radius: 8px; width: auto; box-shadow: none; display: block;" onclick="enterGroupChat(${g.id}, '${escapeHTML(g.name)}', ${g.memberCount}, ${g.createdById}, '${g.image || ''}')">แชทกลุ่ม</button>
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
            ${g.image 
              ? `<img src="${g.image}" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover; margin-right: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">` 
              : `<div class="mode-icon-wrapper ranked-icon" style="background-color: #F1F5F9; color: var(--text-dark); font-size: 18px;"></div>`
            }
            <div class="mode-info">
              <span class="mode-title" style="font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; color: var(--text-dark); flex-wrap: wrap;">
                ${escapeHTML(g.name)}
                <span style="font-size: 10px; background-color: #E2E8F0; color: #64748B; padding: 2px 6px; border-radius: 4px;">ID: #${g.id}</span>
                <span style="font-size: 10px; background-color: ${g.isPrivate ? '#FEE2E2' : '#D1FAE5'}; color: ${g.isPrivate ? '#991B1B' : '#065F46'}; padding: 2px 6px; border-radius: 4px;">
                  ${g.isPrivate ? ' ส่วนตัว' : ' สาธารณะ'}
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
    const fileInput = document.getElementById('fileCreateGroupImage');
    if (fileInput) fileInput.value = '';
    const imgPreview = document.getElementById('createGroupImagePreview');
    if (imgPreview) imgPreview.style.display = 'none';
    const publicRadio = document.querySelector('input[name="optGroupPrivacy"][value="public"]');
    if (publicRadio) publicRadio.checked = true;
  };
}

const fileCreateGroupImage = document.getElementById('fileCreateGroupImage');
const createGroupImagePreview = document.getElementById('createGroupImagePreview');
let pendingGroupImageBase64 = null;

if (fileCreateGroupImage) {
  fileCreateGroupImage.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        pendingGroupImageBase64 = e.target.result;
        if (createGroupImagePreview) {
          createGroupImagePreview.src = pendingGroupImageBase64;
          createGroupImagePreview.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    } else {
      pendingGroupImageBase64 = null;
      if (createGroupImagePreview) createGroupImagePreview.style.display = 'none';
    }
  };
}

if (btnCancelCreateGroup && createGroupModal) {
  btnCancelCreateGroup.onclick = () => {
    createGroupModal.style.display = 'none';
    pendingGroupImageBase64 = null;
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
        body: JSON.stringify({ name, description, isPrivate, image: pendingGroupImageBase64 })
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
window.enterGroupChat = function(groupId, groupName, memberCount, createdById, groupImage) {
  activeGroupId = groupId;
  document.getElementById('groupListMainPanel').style.display = 'none';
  
  const screen = document.getElementById('groupChatScreenPanel');
  screen.style.display = 'flex';

  document.getElementById('lblChatGroupName').textContent = groupName;
  document.getElementById('lblChatGroupMeta').textContent = `ID: #${groupId} • สมาชิก ${memberCount} คน`;

  const headerImg = document.getElementById('groupChatHeaderImage');
  if (headerImg) {
    if (groupImage && groupImage !== 'undefined') {
      headerImg.src = groupImage;
      headerImg.style.display = 'block';
    } else {
      headerImg.style.display = 'none';
    }
  }

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

    if (countEl) countEl.textContent = ` คำขอเข้าร่วมกลุ่ม (${requests.length})`;

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
           เริ่มพิมพ์ข้อความแชทเพื่อพูดคุยในกลุ่มติววันนี้
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

      const avatarHtml = renderAvatarHtml(m.user, 'friend-user-avatar', 'width: 32px; height: 32px; font-size: 13px; cursor: pointer; flex-shrink: 0; border-radius: 50%; font-weight: 600; margin-right: 8px;', isMe ? 'var(--primary-color)' : '#BD1B0B').replace('<div ', '<div onclick="showUserProfile(${m.userId})" ');

      html += `
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px; justify-content: ${isMe ? 'flex-end' : 'flex-start'};">
          ${isMe ? '' : avatarHtml}
          <div class="chat-bubble ${isMe ? 'me' : ''}" style="margin: 0;">
            <span class="chat-sender" onclick="showUserProfile(${m.userId})" style="cursor: pointer; font-weight: 600;">${isMe ? 'คุณ' : displayName}</span>
            <div class="chat-message-box">
              ${formatMessageContent(m.content)}
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
            ${f.faceImage ? `<img src="${f.faceImage}" class="friend-user-avatar" style="object-fit: cover; border-radius: 50%;" />` : `<div class="friend-user-avatar" style="background-color: #BD1B0B;">${initial}</div>`}
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
            ${u.faceImage ? `<img src="${u.faceImage}" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover;" />` : `<div class="friend-user-avatar" style="background-color: #64748B; width: 26px; height: 26px; font-size: 11px;">${displayName.charAt(0)}</div>`}
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
            ${r.faceImage ? `<img src="${r.faceImage}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />` : `<div class="friend-user-avatar" style="width: 28px; height: 28px; font-size: 11px; background-color: #BD1B0B; display: flex; align-items: center; justify-content: center; color: white; border-radius: 50%;">${displayName.charAt(0)}</div>`}
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
    if (avatar) {
      if (u.faceImage) {
        avatar.innerHTML = `<img src="${u.faceImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" alt="avatar" />`;
      } else {
        avatar.textContent = nameStr.charAt(0);
      }
    }
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
          <button class="btn-quick-match" style="width: 100%; box-shadow: none;" onclick="enterDmChat(${u.id}, '${escapeHTML(nameStr)}'); closeUserProfileModal();"> ส่งข้อความส่วนตัว</button>
          <button class="post-action-btn delete" style="width: 100%; border: 1px solid #EF4444; border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 600; background: none; margin-right: 0;" onclick="unfriend(${u.id}); closeUserProfileModal();"> ลบเพื่อน</button>
        `;
      } else if (u.relationStatus === 'PENDING_SENT') {
        buttonsHtml = `
          <button class="btn-quick-match" style="width: 100%; box-shadow: none; background-color: #64748B; cursor: not-allowed;" disabled>รอการตอบรับคำขอเพื่อน</button>
        `;
      } else if (u.relationStatus === 'PENDING_RECEIVED') {
        buttonsHtml = `
          <button class="btn-quick-match" style="width: 100%; box-shadow: none; background-color: #10B981;" onclick="acceptFriendRequest(${u.id}); closeUserProfileModal();"> ยอมรับเป็นเพื่อน</button>
          <button class="post-action-btn delete" style="width: 100%; border: 1px solid #EF4444; border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 600; background: none; margin-right: 0;" onclick="declineFriendRequest(${u.id}); closeUserProfileModal();">ปฏิเสธคำขอ</button>
        `;
      } else if (u.relationStatus === 'BLOCKED') {
        buttonsHtml = `
          <button class="btn-quick-match" style="width: 100%; box-shadow: none; background-color: #EF4444;" onclick="unblockUser(${u.id}); closeUserProfileModal();">ปลดบล็อก</button>
        `;
      } else {
        buttonsHtml = `
          <button class="btn-quick-match" style="width: 100%; box-shadow: none;" onclick="addFriend(${u.id}); closeUserProfileModal();"> เพิ่มเพื่อน</button>
        `;
      }

      if (u.relationStatus !== 'BLOCKED') {
        buttonsHtml += `
          <button class="post-action-btn delete" style="width: 100%; border: 1px solid #EF4444; border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 600; background: none; margin-right: 0; margin-top: 4px;" onclick="blockUser(${u.id}); closeUserProfileModal();"> บล็อกผู้ใช้งาน</button>
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

const userProfileModalElem = document.getElementById('userProfileModal');
if (userProfileModalElem) {
  userProfileModalElem.addEventListener('click', (e) => {
    if (e.target === userProfileModalElem) closeUserProfileModal();
  });
}

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
          <p style="font-size: 13px; color: var(--text-dark); margin: 0 0 6px 0; line-height: 1.5; word-break: break-word;">${formatMessageContent(p.content)}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: var(--text-light);">${timeStr}</span>
            <span style="font-size: 10px; color: var(--text-light);"> ${commentCount} ความคิดเห็น</span>
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
           เริ่มพิมพ์ข้อความแชทส่วนตัวกับเพื่อนได้แล้ววันนี้
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
            ${formatMessageContent(m.content)}
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
  document.getElementById('vocabGameStreak').textContent = `${vocabStreak} `;
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

    feedbackEl.textContent = ' ถูกต้อง! ยอดเยี่ยมมาก';
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

    feedbackEl.textContent = ` ผิด — คำแปลที่ถูกต้องคือ: ${wordObj.meaning}`;
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
      successDiv.innerHTML = ' ยอดเยี่ยมมาก! คุณตอบถูกทุกข้อ';
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
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      updateAllMyAvatars(base64Image, userProfile.fullName);

      
      showCenteredAlert('อัปเดตรูปโปรไฟล์สำเร็จ');
    } else {
      showCenteredAlert('เกิดข้อผิดพลาดในการอัปโหลด');
    }
  } catch (err) {
    console.error('Upload Error:', err);
    showCenteredAlert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
  }
};

// ==========================================
// Profile Menu Features (Modals & Toggles)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Hide Change Password if Google Login
  const loginProvider = localStorage.getItem('loginProvider');
  if (loginProvider === 'google') {
    const cpMenu = document.getElementById('menuChangePassword');
    if (cpMenu) cpMenu.style.display = 'none';
  }

  // 2. Notification Toggle
  const notifToggle = document.getElementById('notificationToggle');
  if (notifToggle) {
    const savedNotif = localStorage.getItem('notificationsEnabled');
    if (savedNotif !== null) {
      notifToggle.checked = savedNotif === 'true';
    }
    notifToggle.addEventListener('change', (e) => {
      localStorage.setItem('notificationsEnabled', e.target.checked);
      showCenteredAlert(e.target.checked ? 'เปิดการแจ้งเตือนแล้ว' : 'ปิดการแจ้งเตือนแล้ว');
    });
  }

  // 3. Dark Mode Initialization
  const darkModeToggle = document.getElementById('darkModeToggle');
  const savedDark = localStorage.getItem('darkMode');
  if (savedDark === 'true') {
    document.body.classList.add('dark-mode');
    if (darkModeToggle) darkModeToggle.checked = true;
  }
});

window.toggleDarkMode = function(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'true');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'false');
  }
};

// --- Modals Logic ---

// Change Password
window.openChangePasswordModal = function() {
  document.getElementById('changePasswordModal').style.display = 'flex';
};
window.closeChangePasswordModal = function() {
  document.getElementById('changePasswordModal').style.display = 'none';
};
window.submitChangePassword = function() {
  alert('ฟีเจอร์เปลี่ยนรหัสผ่าน กำลังอยู่ในช่วงพัฒนาครับ!');
  closeChangePasswordModal();
};

// Help / FAQ
window.openHelpModal = function() {
  document.getElementById('helpModal').style.display = 'flex';
  fetchSupportTickets();
};
window.closeHelpModal = function() {
  document.getElementById('helpModal').style.display = 'none';
};
window.submitSupportTicket = async function() {
  const msg = document.getElementById('supportMessage').value.trim();
  if (!msg) return showCenteredAlert('กรุณากรอกข้อความก่อนส่ง');
  try {
    const res = await fetch(`${API_BASE}/api/support/ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    if (res.ok) {
      showCenteredAlert('ส่งปัญหาเรียบร้อยแล้ว');
      document.getElementById('supportMessage').value = '';
      fetchSupportTickets();
    } else {
      showCenteredAlert(data.error || 'เกิดข้อผิดพลาด');
    }
  } catch (err) {
    showCenteredAlert('ไม่สามารถเชื่อมต่อได้');
  }
};
window.fetchSupportTickets = async function() {
  const list = document.getElementById('supportTicketsList');
  if (!list) return;
  list.innerHTML = '<div style="text-align: center; color: #94A3B8; font-size: 14px; padding: 20px 0;">กำลังโหลด...</div>';
  try {
    const res = await fetch(`${API_BASE}/api/support/tickets`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (!data.tickets || data.tickets.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: #94A3B8; font-size: 14px; padding: 20px 0;">ไม่มีประวัติการแจ้งปัญหา</div>';
        return;
      }
      list.innerHTML = data.tickets.map(t => {
        const date = new Date(t.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
        const statusColor = t.status === 'PENDING' ? '#F59E0B' : '#10B981';
        const statusText = t.status === 'PENDING' ? 'รอดำเนินการ' : 'เรียบร้อยแล้ว';
        return `<div style="background: var(--bg-gray, #F8FAFC); border: 1px solid var(--border-color, #E2E8F0); padding: 12px; border-radius: 12px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748B;">${date}</span>
            <span style="color: ${statusColor}; font-weight: 700;">${statusText}</span>
          </div>
          <div style="color: var(--text-dark, #1E293B); font-weight: 500;">${escapeHTML(t.message)}</div>
        </div>`;
      }).join('');
    }
  } catch (err) {
    list.innerHTML = '<div style="text-align: center; color: #EF4444; font-size: 14px; padding: 20px 0;">โหลดข้อมูลล้มเหลว</div>';
  }
};

// Settings
window.openSettingsModal = function() {
  document.getElementById('settingsModal').style.display = 'flex';
};
window.closeSettingsModal = function() {
  document.getElementById('settingsModal').style.display = 'none';
};

// Exam History
window.openExamHistoryModal = function() {
  document.getElementById('examHistoryModal').style.display = 'flex';
  const countEl = document.getElementById('examHistoryCount');
  if (countEl) {
    // Count from userProfile.stageProgress
    const progress = userProfile?.stageProgress || [];
    const completedStages = progress.filter(p => p.completed).length;
    countEl.textContent = completedStages;
  }
};
window.closeExamHistoryModal = function() {
  document.getElementById('examHistoryModal').style.display = 'none';
};

// Edit Profile
window.openEditProfileModal = function() {
  document.getElementById('editProfileModal').style.display = 'flex';
  const nameInput = document.getElementById('editProfileNameInput');
  if (nameInput) nameInput.value = userProfile?.fullName || '';

  const editAvatarImg = document.getElementById('editProfileAvatarImg');
  const editAvatarBox = document.getElementById('editProfileAvatarBox');
  if (userProfile?.faceImage) {
    if (editAvatarImg) {
      editAvatarImg.src = userProfile.faceImage;
      editAvatarImg.style.display = 'block';
    }
    if (editAvatarBox) editAvatarBox.style.display = 'none';
  } else {
    if (editAvatarImg) editAvatarImg.style.display = 'none';
    if (editAvatarBox) {
      editAvatarBox.style.display = 'flex';
      editAvatarBox.textContent = userProfile?.fullName ? userProfile.fullName.charAt(0) : 'ส';
    }
  }
};
window.closeEditProfileModal = function() {
  document.getElementById('editProfileModal').style.display = 'none';
};
window.submitEditProfile = async function() {
  const nameInput = document.getElementById('editProfileNameInput');
  const newName = nameInput ? nameInput.value.trim() : '';
  if (!newName) return showCenteredAlert('กรุณากรอกชื่อ-นามสกุล');

  const btn = document.getElementById('btnSubmitEditProfile');
  if (btn) btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ fullName: newName })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      // Update local storage and UI
      userProfile.fullName = newName;
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      const profileName = document.getElementById('profileName');
      const dropdownName = document.getElementById('dropdownUserName');
      if (profileName) profileName.textContent = newName;
      if (dropdownName) dropdownName.textContent = newName;
      
      // Update avatar letter if no image
      if (!userProfile.faceImage) {
        updateAllMyAvatars(null, newName);
      }

      showCenteredAlert('อัปเดตโปรไฟล์เรียบร้อยแล้ว');
      closeEditProfileModal();
    } else {
      showCenteredAlert(data.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  } catch (err) {
    showCenteredAlert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
  } finally {
    if (btn) btn.disabled = false;
  }
};

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
      const res = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
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
    const res = await fetch(`${API_BASE}/api/community/groups/${groupId}/members`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
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
          actionBtns += `<button onclick="updateMemberRole(${m.userId}, 'ADMIN')" style="font-size:11px; padding:4px 8px; border-radius:4px; background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; cursor:pointer;">ตั้งแอดมิน</button>`;
        } else if (creatorId === userProfile.id) {
          // Only creator can demote admins
          actionBtns += `<button onclick="updateMemberRole(${m.userId}, 'MEMBER')" style="font-size:11px; padding:4px 8px; border-radius:4px; background:#FFF1F2; color:#E11D48; border:1px solid #FECDD3; cursor:pointer;">ปลดแอดมิน</button>`;
        }
        actionBtns += `<button onclick="kickMember(${m.userId})" style="font-size:11px; padding:4px 8px; border-radius:4px; background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; cursor:pointer; margin-left:6px;">เตะออก</button>`;
      }

      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px; border:1px solid var(--border-color); border-radius:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div onclick="showUserProfileModal(${m.userId})" style="cursor:pointer;">
              ${renderAvatarHtml(m.user, '', 'width:36px; height:36px; border-radius:50%;', '#64748B')}
            </div>
            <div>
              <div style="font-size:14px; font-weight:600; color:var(--text-dark); display:flex; align-items:center;">
                ${escapeHTML(m.user.fullName || m.user.username || 'ผู้ใช้งาน')} ${roleBadge}
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center;">${actionBtns}</div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="text-align:center; padding: 20px; color: #EF4444;">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>';
  }
};

window.updateMemberRole = async function(userId, newRole) {
  if (!confirm(`ยืนยันการ${newRole === 'ADMIN' ? 'ตั้ง' : 'ปลด'}แอดมิน?`)) return;
  try {
    const res = await fetch(`${API_BASE}/api/community/groups/${currentManageGroupId}/members/${userId}/role`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
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
    const res = await fetch(`${API_BASE}/api/community/groups/${currentManageGroupId}/members/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
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
    const res = await fetch(`${API_BASE}/api/community/groups`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
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
      const res = await fetch(`${API_BASE}/api/community/groups/${currentEditingGroupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
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


// ==========================================
// IMAGE COMPRESSOR SYSTEM
// ==========================================
let compressedImageBlob = null;
let originalFileName = 'compressed_image.jpg';

window.openImageCompressorModal = function() {
  document.getElementById('imageCompressorModal').style.display = 'flex';
  document.getElementById('compressImageInput').value = '';
  document.getElementById('compressorResultContainer').style.display = 'none';
  document.getElementById('btnDownloadCompressed').style.display = 'none';
};

window.handleImageCompressSelect = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  originalFileName = file.name;
  
  // Show original size
  document.getElementById('compressOriginalSize').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
  document.getElementById('compressNewSize').textContent = 'กำลังประมวลผล...';
  document.getElementById('compressorResultContainer').style.display = 'block';
  document.getElementById('btnDownloadCompressed').style.display = 'none';
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      compressImage(img, file.size);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

function compressImage(img, originalSize) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  let width = img.width;
  let height = img.height;
  
  // Calculate Target MB
  const TARGET_SIZE_MB = 0.95; // slightly under 1MB
  const MAX_DIMENSION = 1920;
  
  // Step 1: Resize if too large
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      height = Math.round(height * (MAX_DIMENSION / width));
      width = MAX_DIMENSION;
    } else {
      width = Math.round(width * (MAX_DIMENSION / height));
      height = MAX_DIMENSION;
    }
  }
  
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  
  // Step 2: Iterative Compression
  let quality = 0.9;
  
  const originalSizeMB = originalSize / 1024 / 1024;

  function attemptCompression() {
    canvas.toBlob((blob) => {
      const sizeMB = blob.size / 1024 / 1024;
      
      if (sizeMB > TARGET_SIZE_MB && quality > 0.1) {
        quality -= 0.1;
        attemptCompression(); // Try again with lower quality
      } else {
        // If compressed is larger than original AND original is already < 1MB, just use original
        let finalBlob = blob;
        let finalSizeMB = sizeMB;
        
        if (sizeMB > originalSizeMB && originalSizeMB < TARGET_SIZE_MB) {
            // We can't easily turn the original 'file' into the blob here unless we pass it,
            // but we can just tell the user it doesn't need compression.
            document.getElementById('compressNewSize').textContent = 'เล็กอยู่แล้ว ไม่ต้องบีบอัด';
            document.getElementById('btnDownloadCompressed').style.display = 'none';
            // Show preview anyway
            const url = URL.createObjectURL(blob);
            document.getElementById('compressPreviewImage').src = url;
            return;
        }

        // Success
        compressedImageBlob = finalBlob;
        document.getElementById('compressNewSize').textContent = finalSizeMB.toFixed(2) + ' MB';
        
        // Show Preview
        const url = URL.createObjectURL(finalBlob);
        document.getElementById('compressPreviewImage').src = url;
        
        // Setup Download
        const btn = document.getElementById('btnDownloadCompressed');
        btn.style.display = 'block';
        btn.onclick = () => {
          const a = document.createElement('a');
          a.href = url;
          // create a safe filename
          const nameParts = originalFileName.split('.');
          nameParts.pop(); // remove extension
          a.download = nameParts.join('.') + '_compressed.jpg';
          a.click();
        };
      }
    }, 'image/jpeg', quality);
  }
  attemptCompression();
}

// ==========================================
// Question Bank Subject & Exam Sets Selection Logic
// ==========================================
let currentSelectedBankSubject = null;

window.startBankSubject = function(subjectKey) {
  currentSelectedBankSubject = subjectKey;
  
  const bankMainHeader = document.getElementById('bankMainHeader');
  const subjectsGridPanel = document.getElementById('questionBankSubjectsList');
  const examSetsPanel = document.getElementById('questionBankExamSetsList');
  const titleEl = document.getElementById('currentSubjectTitle');
  const subtitleEl = document.getElementById('currentSubjectSubtitle');
  const badgeEl = document.getElementById('currentSubjectBadge');
  const iconEl = document.getElementById('currentSubjectIcon');

  if (bankMainHeader) bankMainHeader.style.display = 'none';
  if (subjectsGridPanel) subjectsGridPanel.style.display = 'none';
  if (examSetsPanel) examSetsPanel.style.display = 'block';

  // Format Subject Details
  const subjectMetadata = {
    'งานสารบรรณ': {
      title: 'งานสารบรรณ',
      subtitle: 'ระเบียบสำนักนายกรัฐมนตรี (พ.ศ. ๒๕๒๖ และที่แก้ไขเพิ่มเติม)',
      badge: 'วิชาหลักสำคัญ',
      icon: '📜',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB'
    },
    'ลักษณะที่54': {
      title: 'ลักษณะที่ ๕๔',
      subtitle: 'งานสารบรรณตำรวจ (พ.ศ. ๒๕๕๖)',
      badge: 'วิชาเฉพาะ ตร.',
      icon: '📑',
      iconBg: '#FDF2F8',
      iconColor: '#BE185D'
    },
    'ทั่วไป': {
      title: 'ความสามารถทั่วไป',
      subtitle: 'คณิตศาสตร์ การคิดคำนวณ และการใช้เหตุผล',
      badge: 'วิชาหลักสำคัญ',
      icon: '🧠',
      iconBg: '#ECFDF5',
      iconColor: '#059669'
    },
    'คณิต': {
      title: 'คณิตศาสตร์ตำรวจ',
      subtitle: 'การวิเคราะห์ตัวเลข อนุกรม และตรรกศาสตร์',
      badge: 'วิชาหลักสำคัญ',
      icon: '🔢',
      iconBg: '#ECFDF5',
      iconColor: '#059669'
    },
    'สังคม': {
      title: 'สังคมและวัฒนธรรม',
      subtitle: 'ความรู้รอบตัว ปรัชญาเศรษฐกิจพอเพียง และอาเซียน',
      badge: 'วิชาความรู้ทั่วไป',
      icon: '🏛️',
      iconBg: '#F5F3FF',
      iconColor: '#7C3AED'
    },
    'กฏหมาย': {
      title: 'กฎหมายที่ประชาชนควรรู้',
      subtitle: 'กฎหมายการปฏิบัติงานตำรวจและวิธีพิจารณาความอาญา',
      badge: 'วิชากฎหมาย',
      icon: '⚖️',
      iconBg: '#FEF2F2',
      iconColor: '#DC2626'
    },
    'คอม': {
      title: 'เทคโนโลยีสารสนเทศ',
      subtitle: 'คอมพิวเตอร์และระบบสารสนเทศเพื่อการสอบ',
      badge: 'วิชาเทคโนโลยี',
      icon: '💻',
      iconBg: '#ECFEFF',
      iconColor: '#0891B2'
    }
  };

  const meta = subjectMetadata[subjectKey] || {
    title: subjectKey,
    subtitle: 'แนวข้อสอบตำรวจ',
    badge: 'วิชาเตรียมสอบ',
    icon: '📚',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB'
  };

  if (titleEl) titleEl.textContent = meta.title;
  if (subtitleEl) subtitleEl.textContent = meta.subtitle;
  if (badgeEl) badgeEl.textContent = meta.badge;
  if (iconEl) {
    iconEl.textContent = meta.icon;
    iconEl.style.background = meta.iconBg;
    iconEl.style.color = meta.iconColor;
  }

  // Reset to Exam Sets tab by default
  switchSubjectSubtab('examSets');

  renderSubjectExamSets(subjectKey);
  renderSubjectStatistics(subjectKey);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.switchSubjectSubtab = function(tabName) {
  const btnExamSets = document.getElementById('btnSubjectSubtabExamSets');
  const btnStats = document.getElementById('btnSubjectSubtabStats');
  const viewExamSets = document.getElementById('subjectSubtabExamSetsView');
  const viewStats = document.getElementById('subjectSubtabStatsView');

  if (tabName === 'examSets') {
    if (viewExamSets) viewExamSets.style.display = 'block';
    if (viewStats) viewStats.style.display = 'none';
    if (btnExamSets) btnExamSets.classList.add('active');
    if (btnStats) btnStats.classList.remove('active');
  } else if (tabName === 'stats') {
    if (viewExamSets) viewExamSets.style.display = 'none';
    if (viewStats) viewStats.style.display = 'block';
    if (btnExamSets) btnExamSets.classList.remove('active');
    if (btnStats) btnStats.classList.add('active');
  }
};

window.backToBankSubjects = function() {
  const bankMainHeader = document.getElementById('bankMainHeader');
  const subjectsGridPanel = document.getElementById('questionBankSubjectsList');
  const examSetsPanel = document.getElementById('questionBankExamSetsList');

  if (bankMainHeader) bankMainHeader.style.display = 'flex';
  if (subjectsGridPanel) subjectsGridPanel.style.display = 'block';
  if (examSetsPanel) examSetsPanel.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

let currentFetchedExamSets = [];
let activeSubcategoryFilter = 'ALL';
let currentExamSearchQuery = '';

window.onSearchExamSets = function(query) {
  currentExamSearchQuery = (query || '').trim().toLowerCase();
  renderFilteredExamSets(currentSelectedBankSubject);
};

async function renderSubjectExamSets(subjectKey) {
  const container = document.getElementById('examSetsContainer');
  const countTag = document.getElementById('examSetsCountTag');
  const searchInput = document.getElementById('txtExamSetSearch');
  if (searchInput) searchInput.value = '';
  currentExamSearchQuery = '';

  if (!container) return;

  container.innerHTML = '<div style="text-align: center; color: #64748B; padding: 36px; font-size: 14px;"><div class="leaderboard-item-loading">กำลังโหลดข้อมูลชุดข้อสอบ... ⏳</div></div>';

  try {
    const res = await fetch(`${API_BASE}/api/exams/sets?category=${encodeURIComponent(subjectKey)}`);
    const sets = res.ok ? await res.json() : [];

    currentFetchedExamSets = Array.isArray(sets) ? sets : [];
    activeSubcategoryFilter = 'ALL';

    renderSubcategoryFilterPills(subjectKey, currentFetchedExamSets);
    renderFilteredExamSets(subjectKey);

  } catch (err) {
    console.error('Render exam sets error:', err);
    container.innerHTML = '<div style="text-align: center; color: #EF4444; padding: 24px; font-size: 13px;">เกิดข้อผิดพลาดในการโหลดชุดข้อสอบ</div>';
  }
}

function renderSubcategoryFilterPills(subjectKey, sets) {
  const subcatFilterContainer = document.getElementById('subcategoryFilterContainer');
  if (!subcatFilterContainer) return;

  const subcats = Array.from(new Set(sets.map(s => s.subcategory).filter(Boolean)));

  if (subcats.length === 0) {
    subcatFilterContainer.style.display = 'none';
    subcatFilterContainer.innerHTML = '';
    return;
  }

  subcatFilterContainer.style.display = 'flex';
  
  let pillsHtml = `
    <button onclick="filterExamSetsBySubcategory('ALL')" id="subcatPill_ALL" class="filter-pill-btn active">
      ทั้งหมด (${sets.length})
    </button>
  `;

  subcats.forEach(sc => {
    const safeSc = escapeHTML(sc);
    const count = sets.filter(s => s.subcategory === sc).length;
    pillsHtml += `
      <button onclick="filterExamSetsBySubcategory('${safeSc}')" id="subcatPill_${safeSc}" class="filter-pill-btn">
        ${safeSc} (${count})
      </button>
    `;
  });

  subcatFilterContainer.innerHTML = pillsHtml;
}

window.filterExamSetsBySubcategory = function(subcat) {
  activeSubcategoryFilter = subcat;

  const subcatFilterContainer = document.getElementById('subcategoryFilterContainer');
  if (subcatFilterContainer) {
    const buttons = subcatFilterContainer.querySelectorAll('.filter-pill-btn');
    buttons.forEach(btn => {
      if (btn.id === `subcatPill_${subcat}`) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  renderFilteredExamSets(currentSelectedBankSubject);
};

function renderFilteredExamSets(subjectKey) {
  const container = document.getElementById('examSetsContainer');
  const countTag = document.getElementById('examSetsCountTag');
  const progressBar = document.getElementById('subjectProgressBar');
  const progressLabel = document.getElementById('subjectProgressLabel');

  if (!container) return;

  const history = getLocalQuizHistory(subjectKey);

  // Calculate Overall Progress across all fetched sets in this subject
  if (Array.isArray(currentFetchedExamSets) && currentFetchedExamSets.length > 0) {
    let completedCount = 0;
    currentFetchedExamSets.forEach(s => {
      const hasRecord = history.some(h => {
        if (!h) return false;
        if (h.setId && String(h.setId) === String(s.id)) return true;
        if (h.setType && String(h.setType) === String(s.id)) return true;
        if (h.setTitle && s.title && h.setTitle.trim().toLowerCase() === s.title.trim().toLowerCase()) return true;
        return false;
      });
      if (hasRecord) completedCount++;
    });

    const total = currentFetchedExamSets.length;
    const pct = Math.round((completedCount / total) * 100);

    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressLabel) progressLabel.textContent = `${completedCount} / ${total} ชุด (${pct}%)`;
  } else {
    if (progressBar) progressBar.style.width = '0%';
    if (progressLabel) progressLabel.textContent = '0 / 0 ชุด (0%)';
  }

  // Filter by Subcategory
  let sets = currentFetchedExamSets;
  if (activeSubcategoryFilter !== 'ALL') {
    sets = sets.filter(s => s.subcategory === activeSubcategoryFilter);
  }

  // Filter by Search Query
  if (currentExamSearchQuery) {
    sets = sets.filter(s => {
      const titleMatch = (s.title || '').toLowerCase().includes(currentExamSearchQuery);
      const subcatMatch = (s.subcategory || '').toLowerCase().includes(currentExamSearchQuery);
      const descMatch = (s.desc || '').toLowerCase().includes(currentExamSearchQuery);
      return titleMatch || subcatMatch || descMatch;
    });
  }

  if (countTag) countTag.textContent = `${sets.length} ชุดข้อสอบ`;

  if (!Array.isArray(sets) || sets.length === 0) {
    container.innerHTML = `
      <div style="background: white; border: 1px dashed #CBD5E1; border-radius: 20px; padding: 36px 20px; text-align: center; grid-column: 1 / -1;">
        <div style="font-size: 28px; margin-bottom: 8px;">🔍</div>
        <div style="font-size: 15px; font-weight: 800; color: #475569; margin-bottom: 4px;">ไม่พบชุดข้อสอบที่ตรงกับการค้นหา</div>
        <p style="font-size: 13px; color: #94A3B8; margin: 0;">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
      </div>
    `;
    return;
  }

  container.innerHTML = sets.map(s => {
    const setRecords = history.filter(h => {
      if (!h) return false;
      if (h.setId && String(h.setId) === String(s.id)) return true;
      if (h.setType && String(h.setType) === String(s.id)) return true;
      if (h.setTitle && s.title) {
        const hTitle = h.setTitle.trim().toLowerCase();
        const sTitle = s.title.trim().toLowerCase();
        if (hTitle === sTitle) return true;
      }
      return false;
    });

    let statusBadge = `<span class="exam-status-badge new">✨ ยังไม่ได้ทำ</span>`;
    let btnLabel = 'เริ่มทำข้อสอบ';
    let isRetake = false;
    
    if (setRecords.length > 0) {
      const maxScore = Math.max(...setRecords.map(r => r.scorePct || 0));
      statusBadge = `<span class="exam-status-badge done">🏆 สูงสุด ${maxScore}%</span>`;
      btnLabel = 'ทำอีกครั้ง';
      isRetake = true;
    }

    const subcatTag = s.subcategory ? `<span class="exam-tag-pill exam-tag-subcat">${escapeHTML(s.subcategory)}</span>` : '';

    return `
      <div class="exam-set-card">
        <div>
          <div class="exam-card-header">
            <div class="exam-card-tags">
              <span class="exam-tag-pill exam-tag-primary">${escapeHTML(s.tag || 'ชุดข้อสอบจริง')}</span>
              ${subcatTag}
            </div>
            ${statusBadge}
          </div>
          
          <h4 class="exam-card-title">${escapeHTML(s.title)}</h4>
          <p class="exam-card-desc">${escapeHTML(s.desc || 'ชุดข้อสอบมาตรฐานพร้อมเฉลยละเอียดและคำอธิบาย')}</p>
        </div>
        
        <div class="exam-card-footer">
          <div class="exam-meta-info">
            <span>⏱️ ${s.timeMinutes || 30} นาที</span>
            <span>📝 ${s.questionsCount || 30} ข้อ</span>
          </div>
          <button onclick="launchSelectedExamSet('${subjectKey}', '${s.id}', ${s.questionsCount || 10}, '${escapeHTML(s.title)}')" class="btn-exam-action ${isRetake ? 'retake' : ''}">
            <span>${btnLabel}</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getLocalQuizHistory(subjectKey) {
  try {
    const raw = localStorage.getItem('userQuizHistory');
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(h => h.subject === subjectKey || (subjectKey.includes('สารบรรณ') && h.subject && h.subject.includes('สารบรรณ')));
  } catch (e) {
    return [];
  }
}

function renderSubjectStatistics(subjectKey) {
  const history = getLocalQuizHistory(subjectKey);

  const bestScoreEl = document.getElementById('subjStatBestScore');
  const attemptsEl = document.getElementById('subjStatAttempts');
  const avgScoreEl = document.getElementById('subjStatAvgScore');
  const masteryEl = document.getElementById('subjStatMastery');
  const historyContainer = document.getElementById('subjHistoryListContainer');

  if (history.length === 0) {
    if (bestScoreEl) bestScoreEl.textContent = '0%';
    if (attemptsEl) attemptsEl.textContent = '0 ครั้ง';
    if (avgScoreEl) avgScoreEl.textContent = '0%';
    if (masteryEl) masteryEl.textContent = 'มือใหม่';
    if (historyContainer) {
      historyContainer.innerHTML = '<div style="text-align: center; color: #94A3B8; font-size: 13px; padding: 16px 0;">ยังไม่มีประวัติการทำข้อสอบในวิชานี้</div>';
    }
    return;
  }

  const scores = history.map(h => h.scorePct || 0);
  const maxScore = Math.max(...scores);
  const totalAttempts = history.length;
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalAttempts);

  let mastery = 'มือใหม่';
  if (avgScore >= 85) mastery = 'ระดับเซียน';
  else if (avgScore >= 70) mastery = 'ชำนาญ';
  else if (avgScore >= 50) mastery = 'ปานกลาง';

  if (bestScoreEl) bestScoreEl.textContent = `${maxScore}%`;
  if (attemptsEl) attemptsEl.textContent = `${totalAttempts} ครั้ง`;
  if (avgScoreEl) avgScoreEl.textContent = `${avgScore}%`;
  if (masteryEl) masteryEl.textContent = mastery;

  if (historyContainer) {
    historyContainer.innerHTML = history.slice(0, 10).map(h => `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border-radius: 12px; padding: 10px 14px; border: 1px solid #E2E8F0; font-size: 13px;">
        <div>
          <span style="font-weight: 700; color: #1E293B; display: block;">${escapeHTML(h.setTitle || 'แบบทดสอบประเมิน')}</span>
          <span style="font-size: 11px; color: #64748B;">${h.date || 'เมื่อสักครู่'} • ${h.correctCount || 0}/${h.totalQuestions || 10} ข้อ</span>
        </div>
        <span style="font-weight: 800; font-size: 15px; color: ${h.scorePct >= 70 ? '#10B981' : (h.scorePct >= 50 ? '#F59E0B' : '#EF4444')};">
          ${h.scorePct}%
        </span>
      </div>
    `).join('');
  }
}

window.launchSelectedExamSet = function(subjectKey, setId, questionsCount, setTitle) {
  startBankSubjectQuiz(subjectKey, setId, questionsCount, setTitle);
};

let currentQuizState = {
  subjectKey: '',
  setId: '',
  setTitle: '',
  questions: [],
  currentIndex: 0,
  userAnswers: {},
  score: 0
};

window.startBankSubjectQuiz = async function(subjectKey, setId, questionsCount, setTitle) {
  const modal = document.getElementById('subjectQuizModal');
  const badgeEl = document.getElementById('quizSubjectBadge');
  const titleEl = document.getElementById('quizTitle');
  const bodyContent = document.getElementById('quizBodyContent');
  const stepText = document.getElementById('quizStepText');
  const btnNext = document.getElementById('btnNextQuiz');
  const progressBar = document.getElementById('quizProgressBar');

  if (!modal || !bodyContent) return;

  modal.style.display = 'flex';
  if (badgeEl) badgeEl.textContent = subjectKey;
  if (titleEl) titleEl.textContent = setTitle || 'ทำข้อสอบ';
  if (stepText) stepText.textContent = 'กำลังโหลดข้อสอบ...';
  if (btnNext) btnNext.style.display = 'none';
  if (progressBar) progressBar.style.width = '5%';

  bodyContent.innerHTML = '<div style="text-align: center; color: #64748B; padding: 40px; font-size: 14px;">กำลังดาวน์โหลดชุดข้อสอบจากระบบ...</div>';

  try {
    let questions = [];
    try {
      const res = await fetch(`${API_BASE}/api/exams/questions?subject=${encodeURIComponent(subjectKey)}&setId=${encodeURIComponent(setId)}&count=${questionsCount}`);
      if (res.ok) {
        questions = await res.json();
      }
    } catch(fetchErr) {
      console.warn('Questions fetch error, generating local questions:', fetchErr);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      // Fallback curated subject questions
      questions = [
        {
          id: 1,
          questionText: `ระเบียบและแนวทางปฏิบัติสำคัญในหมวด "${subjectKey}" ข้อใดถูกต้องที่สุด?`,
          choices: [
            'การปฏิบัติงานต้องยึดถือระเบียบและมาตรฐานที่กฎหมายกำหนดไว้อย่างเคร่งครัด',
            'สามารถละเว้นการบันทึกเอกสารได้หากเป็นเรื่องเร่งด่วนภายในหน่วยงาน',
            'การทำลายเอกสารราชการสามารถทำได้โดยไม่ต้องตั้งคณะกรรมการ',
            'ให้ผู้ปฏิบัติงานมีดุลพินิจสูงสุดโดยไม่ต้องรายงานผู้บังคับบัญชา'
          ],
          correctAnswer: 1,
          explanation: 'ตามระเบียบและหลักเกณฑ์ของทางราชการ การปฏิบัติงานต้องยึดถือตามระเบียบ กฎหมาย และหนังสือสั่งการอย่างเคร่งครัด'
        },
        {
          id: 2,
          questionText: `ในการเตรียมตัวสอบวิชา "${subjectKey}" เทคนิคใดมีประสิทธิภาพสูงสุด?`,
          choices: [
            'การท่องจำเฉพาะหัวข้อโดยไม่อ่านคำอธิบาย',
            'การฝึกทำโจทย์จำลอง จับเวลาเสมือนจริง และทบทวนข้อที่ทำผิด',
            'การรออ่านหนังสือก่อนวันสอบเพียง 1 วัน',
            'การเดาคำตอบโดยไม่วิเคราะห์ตัวเลือก'
          ],
          correctAnswer: 2,
          explanation: 'การฝึกทำข้อสอบเสมือนจริงพร้อมจับเวลาและวิเคราะห์จุดอ่อน จะช่วยเพิ่มคะแนนและความแม่นยำได้ดีที่สุด'
        },
        {
          id: 3,
          questionText: `ความรู้พื้นฐานและหลักการสำคัญของ "${subjectKey}" มีเป้าหมายหลักเพื่ออะไร?`,
          choices: [
            'เพื่อความถูกต้อง รวดเร็ว และเป็นมาตรฐานเดียวกันในองค์กร',
            'เพื่อเพิ่มขั้นตอนความซับซ้อนในการทำงาน',
            'เพื่อให้มีเอกสารจำนวนมากที่สุดในหน่วยงาน',
            'ไม่มีข้อใดถูกต้อง'
          ],
          correctAnswer: 1,
          explanation: 'หลักการสำคัญคือเพื่อสร้างมาตรฐาน ความถูกต้อง โปร่งใส และประสิทธิภาพสูงสุดในการปฏิบัติหน้าที่'
        }
      ];
    }

    currentQuizState = {
      subjectKey,
      setId,
      setTitle: setTitle || 'ทำข้อสอบ',
      questions,
      currentIndex: 0,
      userAnswers: {},
      score: 0
    };

    renderCurrentQuizQuestion();
  } catch (err) {
    console.error('Start quiz error:', err);
    bodyContent.innerHTML = '<div style="text-align: center; color: #EF4444; padding: 30px;">เกิดข้อผิดพลาดในการโหลดแบบทดสอบ</div>';
  }
};

window.closeSubjectQuiz = function() {
  const modal = document.getElementById('subjectQuizModal');
  if (modal) modal.style.display = 'none';
  if (currentSelectedBankSubject) {
    renderSubjectExamSets(currentSelectedBankSubject);
    renderSubjectStatistics(currentSelectedBankSubject);
  }
};

function renderCurrentQuizQuestion() {
  const { questions, currentIndex, userAnswers } = currentQuizState;
  const bodyContent = document.getElementById('quizBodyContent');
  const stepText = document.getElementById('quizStepText');
  const btnNext = document.getElementById('btnNextQuiz');
  const progressBar = document.getElementById('quizProgressBar');

  if (!questions || questions.length === 0 || currentIndex >= questions.length) {
    renderQuizResults();
    return;
  }

  const q = questions[currentIndex];
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);
  if (progressBar) progressBar.style.width = `${progressPct}%`;
  if (stepText) stepText.textContent = `ข้อที่ ${currentIndex + 1} / ${questions.length}`;

  const selectedAnswer = userAnswers[currentIndex];
  const isAnswered = selectedAnswer !== undefined;

  if (btnNext) {
    btnNext.style.display = isAnswered ? 'block' : 'none';
    btnNext.textContent = (currentIndex === questions.length - 1) ? 'ดูสรุปผลคะแนน' : 'ข้อถัดไป ➔';
  }

  let choicesHtml = q.choices.map((choiceText, idx) => {
    const choiceNum = idx + 1;
    let btnStyle = 'background: #F8FAFC; border: 1px solid #E2E8F0; color: #1E293B;';
    
    if (isAnswered) {
      if (choiceNum === q.correctAnswer) {
        btnStyle = 'background: #ECFDF5; border: 2px solid #10B981; color: #065F46; font-weight: 700;';
      } else if (choiceNum === selectedAnswer) {
        btnStyle = 'background: #FEF2F2; border: 2px solid #EF4444; color: #991B1B; font-weight: 700;';
      } else {
        btnStyle = 'background: #F8FAFC; border: 1px solid #E2E8F0; color: #94A3B8; opacity: 0.6;';
      }
    }

    return `
      <button onclick="selectQuizAnswer(${choiceNum})" ${isAnswered ? 'disabled' : ''} style="${btnStyle} width: 100%; text-align: left; padding: 14px 18px; border-radius: 14px; font-size: 14px; font-family: inherit; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 12px; line-height: 1.5;">
        <span style="width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; flex-shrink: 0;">${choiceNum}</span>
        <span>${escapeHTML(choiceText)}</span>
      </button>
    `;
  }).join('');

  let explanationHtml = '';
  if (isAnswered && q.explanation) {
    const isCorrect = selectedAnswer === q.correctAnswer;
    explanationHtml = `
      <div style="margin-top: 16px; background: ${isCorrect ? '#EFF6FF' : '#FFFBEB'}; border: 1px solid ${isCorrect ? '#BFDBFE' : '#FDE68A'}; border-radius: 14px; padding: 16px; font-size: 13px; color: ${isCorrect ? '#1E40AF' : '#92400E'};">
        <strong style="display: block; margin-bottom: 4px;">เฉลยคำอธิบาย:</strong>
        ${escapeHTML(q.explanation)}
      </div>
    `;
  }

  bodyContent.innerHTML = `
    <div>
      <h3 style="font-size: 16px; font-weight: 800; color: #1E293B; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">
        ${currentIndex + 1}. ${escapeHTML(q.questionText)}
      </h3>
      <div>
        ${choicesHtml}
      </div>
      ${explanationHtml}
    </div>
  `;
}

window.selectQuizAnswer = function(choiceNum) {
  const { currentIndex, questions } = currentQuizState;
  currentQuizState.userAnswers[currentIndex] = choiceNum;

  if (choiceNum === questions[currentIndex].correctAnswer) {
    currentQuizState.score++;
  }

  renderCurrentQuizQuestion();
};

window.nextQuizQuestion = function() {
  currentQuizState.currentIndex++;
  renderCurrentQuizQuestion();
};

function renderQuizResults() {
  const { subjectKey, setId, setTitle, questions, score } = currentQuizState;
  const bodyContent = document.getElementById('quizBodyContent');
  const stepText = document.getElementById('quizStepText');
  const btnNext = document.getElementById('btnNextQuiz');
  const progressBar = document.getElementById('quizProgressBar');

  if (btnNext) btnNext.style.display = 'none';
  if (stepText) stepText.textContent = 'สรุปผลสอบ';
  if (progressBar) progressBar.style.width = '100%';

  const total = questions.length;
  const pct = Math.round((score / total) * 100);

  saveQuizHistoryRecord({
    subject: subjectKey,
    setId,
    setTitle,
    scorePct: pct,
    correctCount: score,
    totalQuestions: total,
    date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  });

  bodyContent.innerHTML = `
    <div style="text-align: center; padding: 20px 10px;">
      <div style="font-size: 44px; font-weight: 900; color: ${pct >= 70 ? '#10B981' : (pct >= 50 ? '#F59E0B' : '#EF4444')}; line-height: 1; margin-bottom: 8px;">
        ${pct}%
      </div>
      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 800; color: #1E293B;">
        ${pct >= 80 ? 'ดีเยี่ยม! ผ่านเกณฑ์ระดับสูง' : (pct >= 60 ? 'ผ่านเกณฑ์ทดสอบ' : 'ควรทบทวนเนื้อหาเพิ่มเติม')}
      </h3>
      <p style="font-size: 14px; color: #64748B; margin-bottom: 24px;">
        ตอบถูกต้อง ${score} จากทั้งหมด ${total} ข้อ
      </p>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button onclick="startBankSubjectQuiz('${subjectKey}', '${setId}', ${total}, '${escapeHTML(setTitle)}')" style="flex: 1; max-width: 200px; padding: 12px; border-radius: 12px; background: #BD1B0B; color: white; border: none; font-weight: 700; font-family: inherit; cursor: pointer;">
          ทำอีกครั้ง
        </button>
        <button onclick="closeSubjectQuiz(); renderSubjectStatistics('${subjectKey}'); switchSubjectSubtab('stats');" style="flex: 1; max-width: 200px; padding: 12px; border-radius: 12px; background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; font-weight: 700; font-family: inherit; cursor: pointer;">
          ดูสถิติคะแนน
        </button>
      </div>
    </div>
  `;
}

function saveQuizHistoryRecord(record) {
  try {
    const raw = localStorage.getItem('userQuizHistory');
    let list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    list.unshift(record);
    localStorage.setItem('userQuizHistory', JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.error('Save quiz record error:', e);
  }
}

// Auto-fetch active rooms on load
setTimeout(() => {
  if (typeof fetchActiveBattleRooms === 'function') {
    fetchActiveBattleRooms();
  }
}, 1000);
