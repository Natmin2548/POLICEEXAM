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

const API_BASE = getApiBase();

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
