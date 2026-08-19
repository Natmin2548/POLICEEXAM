// Session Helper (If user is logged in, change button text from 'เข้าสู่ระบบ' to 'เข้าสู่หน้าหลัก')
(function checkExistingSession() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('session_expired') === '1' || urlParams.get('reset') === '1') {
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  const updateButtons = () => {
    const token = localStorage.getItem('authToken');
    const profile = localStorage.getItem('userProfile');

    if (token && profile) {
      const navLoginBtn = document.getElementById('navLoginBtn');
      const heroLoginBtn = document.getElementById('heroLoginBtn');

      if (navLoginBtn) {
        navLoginBtn.textContent = 'เข้าสู่หน้าหลัก';
        navLoginBtn.href = '/home/index.html';
        navLoginBtn.classList.remove('open-login-btn');
        navLoginBtn.style.background = '#10B981';
      }

      if (heroLoginBtn) {
        const span = heroLoginBtn.querySelector('span');
        if (span) span.textContent = '🚀 เข้าสู่หน้าหลัก (Dashboard)';
        heroLoginBtn.href = '/home/index.html';
        heroLoginBtn.classList.remove('open-login-btn');
        heroLoginBtn.style.background = '#10B981';
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateButtons);
  } else {
    updateButtons();
  }
})();

window.resetGoogleSession = function() {
  localStorage.clear();
  sessionStorage.clear();
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  alert('ล้างข้อมูลเข้าสู่ระบบเดิมในเครื่องเรียบร้อยแล้ว กรุณากดลงชื่อเข้าใช้ด้วยบัญชี Google ใหม่');
  window.location.replace(window.location.origin + '/?reset=1');
};

// ==========================================
// Custom Centered Dialog Modal
// ==========================================
function showCenteredAlert(message, opts = {}) {
  return new Promise((resolve) => {
    let modal = document.getElementById('customAlertModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'customAlertModal';
      modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); z-index: 99999; align-items: center; justify-content: center; padding: 16px;';
      modal.innerHTML = `
        <div style="background: white; border-radius: 24px; padding: 28px 24px; max-width: 380px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); font-family: 'Kanit', sans-serif; animation: modalPop 0.25s ease;">
          <div id="customAlertIcon" style="font-size: 40px; margin-bottom: 12px; display: none;"></div>
          <h3 id="customAlertTitle" style="font-size: 18px; font-weight: 700; color: #1E293B; margin: 0 0 10px 0;">แจ้งเตือน</h3>
          <p id="customAlertMessage" style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6; word-break: break-word;"></p>
          <button id="btnAlertOk" style="width: 100%; padding: 14px; border-radius: 14px; border: none; background: #BD1B0B; color: white; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit;">ตกลง</button>
        </div>
      `;
      document.body.appendChild(modal);
    }

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
// Configuration
// ==========================================
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

const FALLBACK_GOOGLE_CLIENT_ID = '848275108419-q0171b1bmm4l29lp9blgpin3fl4p1fnh.apps.googleusercontent.com';
let googleClientId = FALLBACK_GOOGLE_CLIENT_ID;

// ==========================================
// UI Layout Controls (Navbar menu / Modal toggles)
// ==========================================
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  menuToggle.classList.toggle('active');
});

const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

const openLoginButtons = document.querySelectorAll('.open-login-btn');
const openRegisterButtons = document.querySelectorAll('.open-register-btn');

const closeLogin = document.getElementById('closeLogin');
const closeRegister = document.getElementById('closeRegister');

const linkToRegister = document.getElementById('linkToRegister');
const linkToLogin = document.getElementById('linkToLogin');

function showModal(modal) {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  navMenu.classList.remove('active');
  menuToggle.classList.remove('active');
  clearErrors();
  renderGoogleButtons();
}

window.triggerGoogleLogin = function() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.prompt();
  } else {
    alert('ระบบกำลังดาวน์โหลดบริการ Google Sign-In กรุณาลองใหม่อีกครั้ง');
  }
};

function renderGoogleButtons() {
  initGoogleIdentity();
}

function hideModal(modal) {
  modal.classList.remove('active');
  if (!loginModal.classList.contains('active') && !registerModal.classList.contains('active')) {
    document.body.style.overflow = '';
  }
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.remove());
}

function showError(form, message) {
  clearErrors();
  const errorEl = document.createElement('div');
  errorEl.className = 'form-error';
  errorEl.textContent = message;
  errorEl.style.cssText = 'color:#BD1B0B;font-size:13px;text-align:center;padding:8px;background:#FFF1F2;border-radius:8px;margin-bottom:8px;';
  form.prepend(errorEl);
}

function setLoading(button, isLoading) {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = 'กำลังดำเนินการ...';
    button.disabled = true;
    button.style.opacity = '0.7';
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
    button.style.opacity = '1';
  }
}

openLoginButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    showModal(loginModal);
  });
});

openRegisterButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    showModal(registerModal);
  });
});

if (closeLogin) closeLogin.addEventListener('click', () => hideModal(loginModal));
if (closeRegister) closeRegister.addEventListener('click', () => hideModal(registerModal));

[loginModal, registerModal].filter(Boolean).forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal(modal);
  });
});

if (linkToRegister) linkToRegister.addEventListener('click', (e) => {
  e.preventDefault();
  hideModal(loginModal);
  setTimeout(() => showModal(registerModal), 150);
});

if (linkToLogin) linkToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  hideModal(registerModal);
  setTimeout(() => showModal(loginModal), 150);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideModal(loginModal);
    hideModal(registerModal);
  }
});

// ==========================================
// Real Login via API (POST /api/auth/login)
// ==========================================
const loginForm = document.getElementById('loginForm');

if (loginForm) loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const emailInput = loginForm.querySelector('input[type="email"]');
  const passwordInput = loginForm.querySelector('input[type="password"]');
  const submitBtn = loginForm.querySelector('.btn-modal-submit');

  const usernameOrEmail = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!usernameOrEmail || !password) {
    showError(loginForm, 'กรุณากรอกอีเมลและรหัสผ่าน');
    return;
  }

  setLoading(submitBtn, true);

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(loginForm, data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      setLoading(submitBtn, false);
      return;
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userProfile', JSON.stringify(data.user));
    localStorage.setItem('loginProvider', 'local');

    if (loginModal) hideModal(loginModal);
    window.location.replace(window.location.origin + '/home/index.html');

  } catch (err) {
    console.error('Login fetch error:', err);
    showError(loginForm, 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่');
    setLoading(submitBtn, false);
  }
});

// ==========================================
// Real Register via API (POST /api/auth/register)
// ==========================================
const registerForm = document.getElementById('registerForm');

if (registerForm) registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const inputs = registerForm.querySelectorAll('.form-row-2 input');
  const firstName = inputs[0] ? inputs[0].value.trim() : '';
  const lastName = inputs[1] ? inputs[1].value.trim() : '';
  const emailInput = registerForm.querySelector('input[type="email"]');
  const phoneInput = registerForm.querySelector('input[type="tel"]');
  const passwordInputs = registerForm.querySelectorAll('input[type="password"]');
  const password = passwordInputs[0] ? passwordInputs[0].value : '';
  const confirmPassword = passwordInputs[1] ? passwordInputs[1].value : '';
  const termsCheck = document.getElementById('termsCheck');
  const submitBtn = registerForm.querySelector('.btn-modal-submit');

  const fullName = `${firstName} ${lastName}`.trim();
  const email = emailInput ? emailInput.value.trim() : '';

  if (!firstName || !lastName) {
    showError(registerForm, 'กรุณากรอกชื่อและนามสกุล');
    return;
  }
  if (!email) {
    showError(registerForm, 'กรุณากรอกอีเมล');
    return;
  }
  if (password.length < 8) {
    showError(registerForm, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    return;
  }
  if (password !== confirmPassword) {
    showError(registerForm, 'รหัสผ่านไม่ตรงกัน');
    return;
  }
  if (termsCheck && !termsCheck.checked) {
    showError(registerForm, 'กรุณายอมรับข้อกำหนดการใช้งาน');
    return;
  }

  const username = email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);

  setLoading(submitBtn, true);

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, fullName })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(registerForm, data.error || 'สมัครสมาชิกไม่สำเร็จ');
      setLoading(submitBtn, false);
      return;
    }

    if (registerModal) hideModal(registerModal);
    alert('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณก่อนเข้าสู่ระบบ');

  } catch (err) {
    console.error('Register fetch error:', err);
    showError(registerForm, 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่');
    setLoading(submitBtn, false);
  }
});

// ==========================================
// Real Google Sign-In via API (POST /api/auth/google)
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
  // Warmup Render backend - retry until server is ready
  async function warmupServer(retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        if (res.ok) {
          console.log('[Warmup] Server is ready');
          break;
        }
      } catch(e) {}
      await new Promise(r => setTimeout(r, 2000)); // wait 2s between retries
    }
  }

  warmupServer().then(() => {
    // Load Client ID from API after server is ready
    fetch(`${API_BASE}/api/auth/config`)
      .then(res => res.ok ? res.json() : {})
      .then(data => {
        if (data && data.googleClientId) googleClientId = data.googleClientId;
      })
      .catch(() => {})
      .finally(() => {
        initGoogleIdentity();
      });
  });

  // Load public stats for landing page
  loadPublicStats();
});

async function loadPublicStats() {
  const elUsers = document.getElementById('publicStatUsers');
  const elExams = document.getElementById('publicStatExams');
  const elPass = document.getElementById('publicStatPass');
  
  if (!elUsers || !elExams || !elPass) return; // Not on landing page

  try {
    const res = await fetch(`${API_BASE}/api/public/stats`);
    if (res.ok) {
      const data = await res.json();
      // Format numbers with K+ if > 1000
      const formatNum = (num) => {
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K+';
        return num;
      };
      elUsers.textContent = formatNum(data.users);
      elExams.textContent = formatNum(data.exams);
      elPass.textContent = data.passRate + '%';
    } else {
      // Fallbacks
      elUsers.textContent = '15K+';
      elExams.textContent = '50K+';
      elPass.textContent = '92%';
    }
  } catch (err) {
    // Fallbacks on network error
    elUsers.textContent = '15K+';
    elExams.textContent = '50K+';
    elPass.textContent = '92%';
  }
}

function initGoogleIdentity() {
  if (!googleClientId) return;
  if (typeof google === 'undefined' || !google.accounts) {
    setTimeout(initGoogleIdentity, 300);
    return;
  }

  google.accounts.id.initialize({
    client_id: googleClientId,
    callback: handleGoogleCredential,
    auto_select: false,
  });

  // Render official Google button for Login modal
  const loginBtnContainer = document.getElementById('googleSignInButtonLogin');
  if (loginBtnContainer) {
    google.accounts.id.renderButton(loginBtnContainer, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 320
    });
  }

  // Render official Google button for Register modal
  const registerBtnContainer = document.getElementById('googleSignInButtonRegister');
  if (registerBtnContainer) {
    google.accounts.id.renderButton(registerBtnContainer, {
      theme: 'outline',
      size: 'large',
      text: 'signup_with',
      shape: 'rectangular',
      width: 320
    });
  }
}

async function handleGoogleCredential(response) {
  if (!response || !response.credential) return;

  // Show loading indicator
  const btn = document.querySelector('.open-login-btn');
  if (btn) { btn.textContent = 'กำลังเชื่อมต่อ...'; btn.disabled = true; }

  try {
    let res, data = {};

    // Retry up to 3 times to handle Render cold start (404)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: response.credential })
        });

        // If server returned 404 (cold start), wait and retry
        if (res.status === 404 && attempt < 2) {
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        break;
      } catch(fetchErr) {
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        throw fetchErr;
      }
    }

    // Guard against empty response body
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try { data = await res.json(); } catch(e) { data = {}; }
    } else {
      const text = await res.text();
      if (text) { try { data = JSON.parse(text); } catch(e) {} }
    }

    if (!res.ok) {
      alert(data.error || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่');
      return;
    }

    if (!data.token) {
      alert('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
      return;
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userProfile', JSON.stringify(data.user));
    localStorage.setItem('loginProvider', 'google');

    if (loginModal) hideModal(loginModal);
    if (registerModal) hideModal(registerModal);

    window.location.href = 'home/index.html';

  } catch (err) {
    console.error('Google auth fetch error:', err);
    alert('เซิร์ฟเวอร์อาจกำลังเริ่มต้น กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
  } finally {
    if (btn) { btn.textContent = 'เข้าสู่ระบบด้วย Google'; btn.disabled = false; }
  }
}

// ==========================================
// Load Real Announcements from API
// ==========================================
(function loadAnnouncements() {
  const container = document.getElementById('announcementList');
  if (!container) return;

  fetch(`${API_BASE}/api/announcements`)
    .then(res => res.json())
    .then(announcements => {
      if (!Array.isArray(announcements) || announcements.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:24px;color:#64748B;font-size:14px;">ยังไม่มีประกาศในขณะนี้</p>';
        return;
      }

      container.innerHTML = announcements.map(a => {
        const statusMap = {
          'เปิดรับสมัครล่าสุด': { badge: 'badge-green', label: 'เปิดรับสมัคร' },
          'เปิดรับสมัคร': { badge: 'badge-green', label: 'เปิดรับสมัคร' },
          'ประกาศผล': { badge: 'badge-blue', label: 'ประกาศผล' },
          'ปิดรับสมัคร': { badge: 'badge-blue', label: 'ปิดรับสมัคร' },
        };
        const st = statusMap[a.status] || { badge: 'badge-green', label: a.status };

        return `
          <article class="announcement-card">
            <div class="announcement-meta">
              <span class="badge ${st.badge}">
                <span class="badge-dot"></span>
                ${st.label}
              </span>
              <time class="announcement-date">${a.announcementDate || ''}</time>
            </div>
            <h3 class="announcement-title">
              ${a.orgAbbr} ${a.jobTitle} ${a.positionsCount ? `(${a.positionsCount.toLocaleString()} อัตรา)` : ''} ปี ${a.year}
            </h3>
          </article>
        `;
      }).join('');
    })
    .catch(err => {
      console.error('Failed to load announcements:', err);
      container.innerHTML = '<p style="text-align:center;padding:24px;color:#64748B;font-size:14px;">ไม่สามารถโหลดข้อมูลประกาศได้</p>';
    });

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('login') === '1' && typeof openLoginModal === 'function') {
    setTimeout(() => openLoginModal(), 100);
  }
})();
