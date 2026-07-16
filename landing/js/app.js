// ==========================================
// Configuration
// ==========================================
const API_BASE = 'http://localhost:3000';

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

    // Save JWT token and user data to sessionStorage
    sessionStorage.setItem('authToken', data.token);
    sessionStorage.setItem('userProfile', JSON.stringify(data.user));

    hideModal(loginModal);
    window.location.href = '../home/index.html';

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
let googleClientId = '';

window.addEventListener('DOMContentLoaded', () => {
  // Fetch Google Client ID from API server
  fetch(`${API_BASE}/api/auth/config`)
    .then(res => res.json())
    .then(data => {
      googleClientId = data.googleClientId || '';
      initGoogleIdentity();
    })
    .catch(err => {
      console.error('Failed to fetch auth config:', err);
      // Fallback: try reading from .env
      fetch('../.env')
        .then(res => res.ok ? res.text() : fetch('.env').then(r => r.text()))
        .then(text => {
          const lines = text.split('\n');
          for (let line of lines) {
            const parts = line.split('=');
            if (parts[0] && parts[0].trim() === 'GOOGLE_CLIENT_ID') {
              googleClientId = parts[1].trim().replace(/"/g, '');
              break;
            }
          }
          initGoogleIdentity();
        })
        .catch(() => {
          googleClientId = '848275108419-q0171b1bmm4l29lp9blgpin3fl4p1fnh.apps.googleusercontent.com';
          initGoogleIdentity();
        });
    });
});

function initGoogleIdentity() {
  if (!googleClientId) return;
  if (typeof google === 'undefined') {
    setTimeout(initGoogleIdentity, 300);
    return;
  }

  // Use Google Identity Services ID token flow (for server verification)
  google.accounts.id.initialize({
    client_id: googleClientId,
    callback: handleGoogleCredential,
    auto_select: false,
  });

  // Bind all Google buttons to prompt picker
  document.querySelectorAll('.btn-modal-google').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      google.accounts.id.prompt();
    });
  });
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

    // Save JWT token and user data
    sessionStorage.setItem('authToken', data.token);
    sessionStorage.setItem('userProfile', JSON.stringify(data.user));

    hideModal(loginModal);
    hideModal(registerModal);

    window.location.href = '../home/index.html';

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
