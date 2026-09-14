// ==========================================
// shared.js - Shared Core Utilities for Police Exam
// ==========================================

function checkAuth() {
  try {
    const token = localStorage.getItem('authToken');
    const profile = localStorage.getItem('userProfile');
    if (!token || !profile || token.startsWith('test_dev_') || token.startsWith('dev_')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      window.location.replace('/index.html');
      return null;
    }
    return JSON.parse(profile);
  } catch (e) {
    window.location.replace('/index.html');
    return null;
  }
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
  if (host.includes('onrender.com')) {
    if (host.includes('backend')) return '';
    return 'https://police-exam-backend.onrender.com';
  }
  return '';
}

window.API_BASE = window.API_BASE || getApiBase();

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatInlineHighlights(str) {
  let escaped = escapeHTML(str);
  // Highlight markdown bold **word** -> strong
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 700; color: #0F172A;">$1</strong>');
  // Highlight short quoted terms "..." or “...” (up to 40 chars)
  escaped = escaped.replace(/(?:&quot;|“)([^"”\n]{1,40}?)(?:&quot;|”)/g, '<strong style="font-weight: 700; color: #0F172A;">“$1”</strong>');
  return escaped;
}

function formatQuestionTextHtml(rawText) {
  if (!rawText) return '';
  let text = String(rawText).trim();

  // Strip whole-text wrapping bold if someone wrapped the entire question in **...**
  if (/^\*\*[\s\S]+\*\*$/.test(text) && (text.match(/\*\*/g) || []).length === 2) {
    text = text.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
  }

  // Check for reading comprehension pattern with long quotes (>= 30 chars):
  // Intro (optional) + "Long Passage" + Prompt (optional)
  const longQuoteRegex = /^(.*?)["“]([\s\S]{30,}?)["”]\s*([\s\S]*)$/;
  const match = text.match(longQuoteRegex);

  if (match) {
    const intro = (match[1] || '').trim();
    const passage = match[2].trim();
    const question = (match[3] || '').trim();

    let html = '';
    if (intro) {
      html += `<div class="question-intro-lead" style="font-size: 13.5px; font-weight: 600; color: #64748B; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
        <span>📖</span><span>${escapeHTML(intro)}</span>
      </div>`;
    }
    html += `<div class="question-passage-card" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #3B82F6; border-radius: 10px; padding: 12px 16px; margin: 6px 0 14px 0; font-size: 14.5px; font-weight: 400; color: #334155; line-height: 1.75; letter-spacing: 0.01em;">
      “${escapeHTML(passage)}”
    </div>`;
    if (question) {
      html += `<div class="question-prompt-text" style="font-size: 15.5px; font-weight: 700; color: #0F172A; line-height: 1.55;">
        ${formatInlineHighlights(question)}
      </div>`;
    }
    return html;
  }

  // If not a quote passage, check if text has newlines with a passage-like block
  const lines = text.split(/\n\s*\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length >= 2 && lines.some(l => l.length > 50)) {
    return lines.map((block, idx) => {
      // If it's a long middle block (passage)
      if (block.length > 50 && idx < lines.length - 1) {
        return `<div class="question-passage-card" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #3B82F6; border-radius: 10px; padding: 12px 16px; margin: 8px 0 12px 0; font-size: 14.5px; font-weight: 400; color: #334155; line-height: 1.75;">${escapeHTML(block)}</div>`;
      }
      // If it's the final line (question prompt)
      if (idx === lines.length - 1) {
        return `<div class="question-prompt-text" style="font-size: 15.5px; font-weight: 700; color: #0F172A; line-height: 1.55; margin-top: 6px;">${formatInlineHighlights(block)}</div>`;
      }
      // Intro line
      return `<div class="question-intro-lead" style="font-size: 13.5px; font-weight: 600; color: #64748B; margin-bottom: 6px;">${escapeHTML(block)}</div>`;
    }).join('');
  }

  // Standard question: regular weight with emphasized keywords (quotes or markdown)
  return `<span style="font-size: 15.5px; font-weight: 500; color: #1E293B; line-height: 1.65;">${formatInlineHighlights(text)}</span>`;
}

window.escapeHTML = escapeHTML;
window.formatInlineHighlights = formatInlineHighlights;
window.formatQuestionTextHtml = formatQuestionTextHtml;

function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userProfile');
  window.location.href = '/index.html';
}

function initNavbarUser() {
  try {
    const userStr = localStorage.getItem('userProfile');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const greetingEl = document.getElementById('greetingName');
    const dropdownNameEl = document.getElementById('dropdownUserName');
    const dropdownEmailEl = document.getElementById('dropdownUserEmail');
    const avatarEl = document.getElementById('headerAvatar');
    const defaultAvatarEl = document.getElementById('defaultAvatar');
    const adminPanelEl = document.getElementById('dropdownAdminPanel');

    const name = user.fullName || user.username || 'ผู้ใช้';
    if (greetingEl) greetingEl.textContent = name;
    if (dropdownNameEl) dropdownNameEl.textContent = name;
    if (dropdownEmailEl) dropdownEmailEl.textContent = user.email || '';

    if (user.faceImage && avatarEl && defaultAvatarEl) {
      avatarEl.src = user.faceImage;
      avatarEl.style.display = 'block';
      defaultAvatarEl.style.display = 'none';
    } else if (defaultAvatarEl) {
      defaultAvatarEl.textContent = name.charAt(0);
    }

    if (adminPanelEl && (user.role === 'ADMIN' || user.role === 'OWNER')) {
      adminPanelEl.style.display = 'flex';
    }
  } catch (e) {
    console.warn('Navbar user init error:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbarUser();
});

// ==========================================
// Client Activity & Online Status Heartbeat
// ==========================================
(function initClientHeartbeat() {
  if (window.__POLICE_EXAM_HEARTBEAT_INITED) return;
  window.__POLICE_EXAM_HEARTBEAT_INITED = true;

  function sendHeartbeat() {
    try {
      const token = localStorage.getItem('authToken');
      const api = window.API_BASE || (typeof getApiBase === 'function' ? getApiBase() : '');
      const path = window.location.pathname.split('/').pop() || 'index.html';
      const pageTitle = document.title || 'Police Exam';

      fetch(`${api}/api/user/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPath: path,
          pageTitle: pageTitle
        })
      }).catch(() => {});
    } catch (_) {}
  }

  // Send first heartbeat when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sendHeartbeat);
  } else {
    sendHeartbeat();
  }

  // Ping every 45 seconds to keep online status active
  setInterval(sendHeartbeat, 45000);

  // Instant heartbeat when tab becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      sendHeartbeat();
    }
  });
})();

