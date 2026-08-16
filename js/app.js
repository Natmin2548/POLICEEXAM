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
// Configuration
// ==========================================
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000' 
  : window.location.origin;

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
  const activeClientId = googleClientId || FALLBACK_GOOGLE_CLIENT_ID;
  if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.access_token) {
            try {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const googleUser = await userRes.json();
              
              const res = await fetch(`${API_BASE}/api/auth/google-user-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: googleUser.email,
                  name: googleUser.name || googleUser.email.split('@')[0],
                  picture: googleUser.picture
                })
              });
              const data = await res.json();
              if (res.ok && data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userProfile', JSON.stringify(data.user));
                window.location.href = 'home/index.html';
              } else {
                alert(data.error || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
              }
            } catch (err) {
              console.error('Google oauth fetch error:', err);
              alert('⏳ เซิร์ฟเวอร์กำลังเริ่มต้นการทำงาน (Render Cold Start)... กรุณารอประมาณ 5-10 วินาที แล้วลองกดเข้าสู่ระบบอีกครั้งครับ');
            }
          }
        }
      });
      client.requestAccessToken();
      return;
    } catch (e) {
      console.error('Token client error:', e);
    }
  }

  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.prompt();
  } else {
    alert('ระบบกำลังดาวน์โหลดบริการ Google Sign-In กรุณาลองใหม่อีกครั้ง');
  }
};

function renderGoogleButtons() {
  const loginContainer = document.getElementById('googleSignInButtonLogin');
  const registerContainer = document.getElementById('googleSignInButtonRegister');

  const customBtnHtml = `
    <button type="button" onclick="window.triggerGoogleLogin()" style="width: 100%; max-width: 280px; height: 46px; background: white; border: 1px solid #DADCE0; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 12px; font-family: 'Kanit', sans-serif; font-weight: 600; font-size: 15px; color: #3C4043; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.06); margin: 0 auto; transition: all 0.2s;">
      <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"/>
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.2.01 10.05.01 12c0 1.95.45 3.8 1.27 5.42l4-3.15z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
      </svg>
      <span>เข้าสู่ระบบด้วย Google</span>
    </button>
  `;

  if (loginContainer && (!loginContainer.children || loginContainer.children.length === 0)) {
    loginContainer.innerHTML = customBtnHtml;
  }
  if (registerContainer && (!registerContainer.children || registerContainer.children.length === 0)) {
    registerContainer.innerHTML = customBtnHtml;
  }

  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    if (loginContainer) {
      try {
        google.accounts.id.renderButton(loginContainer, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 280
        });
      } catch (e) {}
    }
    if (registerContainer) {
      try {
        google.accounts.id.renderButton(registerContainer, {
          theme: 'outline',
          size: 'large',
          text: 'signup_with',
          shape: 'rectangular',
          width: 280
        });
      } catch (e) {}
    }
  }
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

closeLogin.addEventListener('click', () => hideModal(loginModal));
closeRegister.addEventListener('click', () => hideModal(registerModal));

[loginModal, registerModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal(modal);
  });
});

linkToRegister.addEventListener('click', (e) => {
  e.preventDefault();
  hideModal(loginModal);
  setTimeout(() => showModal(registerModal), 150);
});

linkToLogin.addEventListener('click', (e) => {
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

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const emailInput = loginForm.querySelector('input[type="email"]');
  const passwordInput = loginForm.querySelector('input[type="password"]');
  const submitBtn = loginForm.querySelector('.btn-modal-submit');

  const usernameOrEmail = emailInput.value.trim();
  const password = passwordInput.value;

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

    // Save JWT token and user data to localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userProfile', JSON.stringify(data.user));
    localStorage.setItem('loginProvider', 'local');

    hideModal(loginModal);
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

registerForm.addEventListener('submit', async (e) => {
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

  // Validation
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
  if (!termsCheck.checked) {
    showError(registerForm, 'กรุณายอมรับข้อกำหนดการใช้งาน');
    return;
  }

  // Generate a username from email prefix
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

    // Registration requires email verification
    hideModal(registerModal);
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
  // Warmup backend on Render if sleeping
  fetch(`${API_BASE}/api/health`).catch(() => {});

  // Auto-redirect to dashboard if token exists on this device
  const existingToken = localStorage.getItem('authToken');
  const existingProfile = localStorage.getItem('userProfile');
  if (existingToken && existingProfile) {
    window.location.href = 'home/index.html';
    return;
  }
  // Try to fetch Client ID from API, but use fallback immediately
  fetch(`${API_BASE}/api/auth/config`)
    .then(res => res.json())
    .then(data => {
      if (data.googleClientId) googleClientId = data.googleClientId;
    })
    .catch(() => {})
    .finally(() => {
      initGoogleIdentity();
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
  if (!response.credential) return;

  try {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: response.credential })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
      return;
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userProfile', JSON.stringify(data.user));
    localStorage.setItem('loginProvider', 'google');

    hideModal(loginModal);
    hideModal(registerModal);

    window.location.href = 'home/index.html';

  } catch (err) {
    console.error('Google auth fetch error:', err);
    alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่');
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
})();
