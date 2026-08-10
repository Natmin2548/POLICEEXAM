# Project Context Export

## File: .env

\\n# Database Connection (PgBouncer Transaction Mode)
DATABASE_URL="postgresql://postgres.fwigijxqyabcnblnqkec:Natse2005%40A4@52.74.252.201:6543/postgres?pgbouncer=true"

# Database Connection (Direct / Session Mode)
DIRECT_URL="postgresql://postgres.fwigijxqyabcnblnqkec:Natse2005%40A4@52.74.252.201:5432/postgres"

# JWT Secret
JWT_SECRET="police_exam_jwt_secret_key_2026_secure"

# API Server Port
API_PORT=3000

# Google Authentication Client ID
GOOGLE_CLIENT_ID="848275108419-q0171b1bmm4l29lp9blgpin3fl4p1fnh.apps.googleusercontent.com"

\\n
## File: .gitignore

\\n# Environment variables (contains secrets)
.env
.env.local
.env.production

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Node
node_modules/
dist/

\\n
## File: build-frontend.js

\\nconst fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Ensure dist directory exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });

// Copy static files/folders
console.log('Building frontend to dist folder...');
if (fs.existsSync(path.join(__dirname, 'index.html'))) {
  fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distPath, 'index.html'));
  console.log('Copied index.html');
}

const foldersToCopy = ['css', 'js', 'home'];
foldersToCopy.forEach(folder => {
  const src = path.join(__dirname, folder);
  const dest = path.join(distPath, folder);
  if (fs.existsSync(src)) {
    copyDirSync(src, dest);
    console.log(`Copied directory: ${folder}`);
  }
});

console.log('Frontend build completed successfully.');

\\n
## File: css\style.css

\\n/* ==========================================
   Design Tokens & CSS Variables
   ========================================== */
:root {
  /* Colors */
  --primary-color: #BD1B0B;
  --primary-hover: #9E1307;
  --primary-light: #FFF1F2;
  --primary-light-hover: #FFE4E6;
  
  --text-dark: #0F172A;
  --text-medium: #334155;
  --text-light: #64748B;
  --text-white: #FFFFFF;
  
  --bg-main: #FFFFFF;
  --bg-secondary: #F8FAFC;
  
  --border-color: #E2E8F0;
  --border-hover: #CBD5E1;
  
  /* Badge Colors */
  --badge-green-bg: #E6F4EA;
  --badge-green-text: #137333;
  --badge-blue-bg: #E8F0FE;
  --badge-blue-text: #1A73E8;

  /* Typography */
  --font-family: 'Kanit', sans-serif;
  
  /* Transitions */
  --transition-fast: all 0.2s ease;
  --transition-normal: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
}

/* ==========================================
   Reset & Global Styles
   ========================================== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-main);
  color: var(--text-dark);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

a {
  text-decoration: none;
  color: inherit;
  transition: var(--transition-fast);
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  outline: none;
}

/* Layout Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ==========================================
   Navigation Bar Component
   ========================================== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  padding: 12px 0;
  transition: var(--transition-fast);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 2px 4px rgba(189, 27, 11, 0.15));
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  letter-spacing: -0.5px;
}

.logo-highlight {
  color: var(--primary-color);
}

/* Hamburger Menu Icon */
.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: var(--text-medium);
  transition: var(--transition-fast);
}

.menu-toggle:hover {
  background-color: var(--bg-secondary);
}

.hamburger-icon {
  width: 24px;
  height: 24px;
}

/* Nav Links & Buttons */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-auth-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-medium);
}

.nav-link:hover {
  color: var(--primary-color);
}

.btn-register {
  background-color: var(--primary-color);
  color: var(--text-white);
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 15px;
  box-shadow: var(--shadow-sm);
  border: 1px solid transparent;
}

.btn-register:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

/* Authenticated User Profile in Navbar */
.nav-profile-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  object-fit: cover;
  box-shadow: var(--shadow-sm);
}

.user-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-dark);
}

.btn-logout {
  padding: 6px 14px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  border: 1px solid rgba(189, 27, 11, 0.1);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition-fast);
}

.btn-logout:hover {
  background-color: var(--primary-color);
  color: var(--text-white);
  border-color: var(--primary-color);
}

/* ==========================================
   Hero Section
   ========================================== */
.hero-section {
  padding: 48px 0 32px 0;
  background-color: var(--bg-main);
  text-align: left;
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Gemini Badge */
.gemini-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
  border: 1px solid rgba(189, 27, 11, 0.1);
  animation: pulse 2s infinite alternate;
}

.sparkle-icon {
  width: 16px;
  height: 16px;
}

/* Titles */
.hero-title {
  font-size: 44px;
  line-height: 1.15;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.text-primary {
  color: var(--primary-color);
}

.hero-subtitle {
  font-size: 17px;
  color: var(--text-medium);
  line-height: 1.6;
  max-width: 600px;
  margin-bottom: 32px;
}

/* Hero CTA Buttons */
.hero-actions {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  margin-bottom: 40px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  transition: var(--transition-normal);
  width: 100%;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--text-white);
  gap: 8px;
  border: 1px solid var(--primary-color);
  box-shadow: 0 4px 14px rgba(189, 27, 11, 0.2);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  box-shadow: 0 6px 20px rgba(189, 27, 11, 0.3);
}

.btn-primary:hover .arrow-icon {
  transform: translateX(4px);
}

.arrow-icon {
  width: 18px;
  height: 18px;
  transition: var(--transition-fast);
}

.btn-secondary {
  background-color: var(--bg-main);
  color: var(--text-medium);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--bg-secondary);
  border-color: var(--border-hover);
  color: var(--text-dark);
}

/* Stats Section */
.stats-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin-top: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-number {
  font-size: 26px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background-color: var(--border-color);
}

/* ==========================================
   Features Section
   ========================================== */
.features-section {
  padding: 48px 0;
  background-color: var(--bg-secondary);
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 24px;
}

.features-grid {
  display: grid;
  /* Keep 3 columns on mobile as mockups show, but adjust gracefully */
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.feature-card {
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-lg);
}

.feature-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: var(--transition-fast);
}

.feature-card:hover .feature-icon-wrapper {
  background-color: var(--primary-light-hover);
  transform: scale(1.05);
}

.feature-icon-wrapper svg {
  width: 24px;
  height: 24px;
}

.feature-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-medium);
}

/* ==========================================
   Announcements Section
   ========================================== */
.announcements-section {
  padding: 48px 0 64px 0;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 15px;
}

.view-all-link:hover {
  color: var(--primary-hover);
}

.view-all-link:hover .chevron-icon {
  transform: translateX(2px);
}

.chevron-icon {
  width: 16px;
  height: 16px;
  transition: var(--transition-fast);
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-card {
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  transition: var(--transition-normal);
}

.announcement-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.announcement-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge-green {
  background-color: var(--badge-green-bg);
  color: var(--badge-green-text);
}

.badge-green .badge-dot {
  background-color: var(--badge-green-text);
}

.badge-blue {
  background-color: var(--badge-blue-bg);
  color: var(--badge-blue-text);
}

.badge-blue .badge-dot {
  background-color: var(--badge-blue-text);
}

.announcement-date {
  font-size: 13px;
  color: var(--text-light);
}

.announcement-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-dark);
  line-height: 1.5;
  transition: var(--transition-fast);
}

.announcement-card:hover .announcement-title {
  color: var(--primary-color);
}

/* ==========================================
   Interactive Modals Section
   ========================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.modal-card {
  background-color: var(--bg-main);
  width: 92%;
  max-width: 440px;
  border-radius: 24px;
  padding: 36px 28px;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(20px) scale(0.96);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-height: 92vh;
  overflow-y: auto;
}

.modal-overlay.active .modal-card {
  transform: translateY(0) scale(1);
}

/* Custom Scrollbar for Modal Card */
.modal-card::-webkit-scrollbar {
  width: 6px;
}
.modal-card::-webkit-scrollbar-track {
  background: transparent;
}
.modal-card::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}
.modal-card::-webkit-scrollbar-thumb:hover {
  background: var(--text-light);
}

/* Modal Close Button */
.modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  background-color: var(--bg-secondary);
  border-radius: 50%;
  transition: var(--transition-fast);
}

.modal-close:hover {
  color: var(--text-dark);
  background-color: var(--border-color);
  transform: rotate(90deg);
}

.modal-close svg {
  width: 16px;
  height: 16px;
}

/* Header Inside Modal */
.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 24px;
}

.modal-logo-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background-color: var(--primary-color);
  border-radius: 18px;
  margin-bottom: 16px;
  box-shadow: 0 6px 16px rgba(189, 27, 11, 0.18);
}

.modal-logo-icon {
  width: 32px;
  height: 32px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.modal-subtitle {
  font-size: 14px;
  color: var(--text-light);
}

/* Modal Forms */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-medium);
}

.form-input-field {
  width: 100%;
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-family: var(--font-family);
  font-size: 15px;
  color: var(--text-dark);
  transition: var(--transition-fast);
}

.form-input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: var(--bg-main);
  box-shadow: 0 0 0 3px rgba(189, 27, 11, 0.08);
}

.form-input-field::placeholder {
  color: #94A3B8;
  font-weight: 300;
}

/* Two columns inputs (First & Last name) */
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Password Row Layout */
.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--primary-color);
}

.forgot-password-link:hover {
  text-decoration: underline;
}

/* Terms Checkbox styling */
.form-group-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  margin-top: 4px;
}

.form-group-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1.5px solid var(--border-color);
  accent-color: var(--primary-color);
  cursor: pointer;
  margin-top: 3px;
}

.checkbox-label {
  font-size: 13px;
  color: var(--text-medium);
  line-height: 1.5;
  user-select: none;
}

/* Buttons inside Modals */
.btn-modal-submit {
  width: 100%;
  padding: 13px;
  background-color: var(--primary-color);
  color: var(--text-white);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 12px rgba(189, 27, 11, 0.15);
  transition: var(--transition-fast);
  margin-top: 8px;
}

.btn-modal-submit:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(189, 27, 11, 0.25);
}

/* Divider "OR" */
.modal-or-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 18px 0;
  color: var(--text-light);
  font-size: 14px;
}

.modal-or-divider::before,
.modal-or-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background-color: var(--border-color);
}

.modal-or-divider::before {
  margin-right: 12px;
}

.modal-or-divider::after {
  margin-left: 12px;
}

/* Google Sign-in/Signup button */
.btn-modal-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--bg-main);
  color: var(--text-medium);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  transition: var(--transition-fast);
}

.btn-modal-google:hover {
  background-color: var(--bg-secondary);
  border-color: var(--border-hover);
  color: var(--text-dark);
}

.google-logo {
  width: 18px;
  height: 18px;
}

/* Modal Footer Switch link text */
.modal-footer-text {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-medium);
}

.red-link {
  color: var(--primary-color);
  font-weight: 600;
}

.red-link:hover {
  text-decoration: underline;
  color: var(--primary-hover);
}

/* ==========================================
   Animations
   ========================================== */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(189, 27, 11, 0.2);
  }
  100% {
    box-shadow: 0 0 0 6px rgba(189, 27, 11, 0);
  }
}

/* ==========================================
   Responsive Breakpoints
   ========================================== */

/* Tablet Screens (min-width: 768px) */
@media (min-width: 768px) {
  .navbar {
    padding: 16px 0;
  }
  
  .menu-toggle {
    display: none;
  }
  
  .hero-section {
    padding: 80px 0 48px 0;
  }
  
  .hero-title {
    font-size: 56px;
    margin-bottom: 24px;
  }
  
  .hero-subtitle {
    font-size: 19px;
    margin-bottom: 40px;
  }
  
  .hero-actions {
    flex-direction: row;
    width: auto;
    gap: 16px;
    margin-bottom: 64px;
  }
  
  .btn {
    width: auto;
    padding: 14px 36px;
  }
  
  .stats-grid {
    width: 100%;
    max-width: 600px;
    padding: 24px 0;
  }
  
  .stat-number {
    font-size: 32px;
  }
  
  .stat-label {
    font-size: 14px;
  }
  
  .features-section {
    padding: 64px 0;
  }
  
  .section-title {
    font-size: 26px;
    margin-bottom: 32px;
  }
  
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .feature-card {
    padding: 24px 16px;
  }
  
  .feature-icon-wrapper {
    width: 56px;
    height: 56px;
    margin-bottom: 16px;
  }
  
  .feature-icon-wrapper svg {
    width: 28px;
    height: 28px;
  }
  
  .feature-name {
    font-size: 15px;
  }
  
  .announcements-section {
    padding: 64px 0 80px 0;
  }
  
  .announcement-card {
    padding: 24px;
  }
  
  .announcement-title {
    font-size: 18px;
  }
  
  /* Modals sizing on tablet */
  .modal-card {
    padding: 40px 32px;
  }
}

/* PC/Desktop Screens (min-width: 1024px) */
@media (min-width: 1024px) {
  .hero-section {
    padding: 110px 0 64px 0;
  }
  
  .hero-title {
    font-size: 64px;
    line-height: 1.1;
  }
  
  .features-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
  }
  
  .announcement-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  .announcement-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

/* Mobile responsive menu logic */
@media (max-width: 767px) {
  .menu-toggle {
    display: flex;
  }
  
  .nav-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: var(--bg-main);
    flex-direction: column;
    padding: 20px;
    gap: 16px;
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
  }
  
  .nav-menu.active {
    display: flex;
    animation: slideDown 0.3s ease forwards;
  }
  
  .nav-link {
    width: 100%;
    text-align: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--bg-secondary);
  }
  
  .btn-register {
    width: 100%;
    text-align: center;
    padding: 12px 0;
  }

  /* Stack Name field grid columns on Mobile */
  .form-row-2 {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* Profile inside mobile menu drawer */
  .nav-profile-container {
    width: 100%;
    flex-direction: column;
    padding: 16px 0;
    gap: 12px;
    align-items: center;
    border-bottom: 1px solid var(--bg-secondary);
  }

  .btn-logout {
    width: 100%;
    text-align: center;
    padding: 10px 0;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

\\n
## File: home\css\style.css

\\n/* ==========================================
   Design Tokens & CSS Variables
   ========================================== */
:root {
  /* Colors */
  --primary-color: #BD1B0B;
  --primary-hover: #9E1307;
  --primary-light: #FFF1F2;
  --primary-light-hover: #FFE4E6;
  
  --text-dark: #0F172A;
  --text-medium: #334155;
  --text-light: #64748B;
  --text-white: #FFFFFF;
  
  --bg-main: #F8FAFC; /* iOS-style soft gray background */
  --bg-card: #FFFFFF;
  
  --border-color: #E2E8F0;
  --border-hover: #CBD5E1;
  
  /* Badge Colors */
  --badge-green-bg: #E6F4EA;
  --badge-green-text: #137333;
  --badge-blue-bg: #E8F0FE;
  --badge-blue-text: #1A73E8;

  /* Typography */
  --font-family: 'Kanit', sans-serif;
  
  /* Transitions */
  --transition-fast: all 0.2s ease;
  --transition-normal: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
}

/* ==========================================
   Reset & Global Styles
   ========================================== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-main);
  color: var(--text-dark);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  padding-bottom: 90px; /* Spacing for sticky bottom nav */
}

a {
  text-decoration: none;
  color: inherit;
  transition: var(--transition-fast);
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  outline: none;
}

/* Layout Container */
.container {
  width: 100%;
  max-width: 600px; /* Mobile dashboard focus */
  margin: 0 auto;
  padding: 0 16px;
}

/* ==========================================
   Top Header Component
   ========================================== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: 14px 0;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 24px;
  height: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
  letter-spacing: -0.5px;
}

.logo-highlight {
  color: var(--primary-color);
}

/* Header Actions (Notification + Profile) */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-notification {
  position: relative;
  color: var(--text-medium);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: var(--transition-fast);
}

.btn-notification:hover {
  background-color: var(--bg-main);
  color: var(--primary-color);
}

.btn-notification svg {
  width: 22px;
  height: 22px;
}

/* Notification red badge dot */
.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background-color: var(--primary-color);
  border-radius: 50%;
  border: 1.5px solid var(--bg-card);
  display: none; /* Toggled via JS */
}

.notification-badge.active {
  display: block;
  animation: scalePop 0.3s ease;
}

/* Profile menu */
.profile-menu-container {
  position: relative;
}

.btn-profile-menu {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  background-color: var(--primary-color);
  color: var(--text-white);
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dropdown Menu */
.profile-dropdown {
  position: absolute;
  top: 48px;
  right: 0;
  width: 220px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 12px;
  display: none;
  z-index: 200;
  animation: slideIn 0.2s ease forwards;
}

.profile-dropdown.active {
  display: block;
}

.dropdown-header {
  display: flex;
  flex-direction: column;
  padding: 4px 8px 8px 8px;
  text-align: left;
}

.dropdown-user-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-dark);
}

.dropdown-user-email {
  font-size: 12px;
  color: var(--text-light);
  word-break: break-all;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  font-size: 14px;
  color: var(--text-medium);
  border-radius: 8px;
  transition: var(--transition-fast);
  text-align: left;
}

.dropdown-item:hover {
  background-color: var(--bg-main);
  color: var(--primary-color);
}

.dropdown-item svg {
  width: 18px;
  height: 18px;
}

/* ==========================================
   Greeting Section
   ========================================== */
.greeting-section {
  padding: 24px 0 16px 0;
  text-align: left;
}

.greeting-subtitle {
  font-size: 14px;
  color: var(--text-light);
}

.greeting-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-dark);
  margin-top: 2px;
  margin-bottom: 12px;
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
}

.clock-icon {
  width: 15px;
  height: 15px;
}

/* ==========================================
   Daily Target Banner
   ========================================== */
.target-card {
  background-color: var(--primary-color);
  border-radius: 20px;
  padding: 20px;
  color: var(--text-white);
  box-shadow: 0 10px 20px -5px rgba(189, 27, 11, 0.15);
  margin-bottom: 20px;
  text-align: left;
}

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.target-subtitle {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 300;
}

.target-title {
  font-size: 20px;
  font-weight: 600;
  margin-top: 2px;
}

/* Play/Start Exam Button */
.btn-start-exam {
  background-color: var(--bg-card);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
}

.btn-start-exam:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.btn-start-exam:active {
  transform: scale(0.95);
}

.play-icon {
  width: 12px;
  height: 12px;
}

/* Target Progress Bar */
.target-progress-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--text-white);
  border-radius: 99px;
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.9;
}

/* ==========================================
   Stats Grid (2x2 Mobile Layout)
   ========================================== */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: var(--transition-fast);
  text-align: left;
}

.stat-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-sm);
}

.stat-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrapper svg {
  width: 20px;
  height: 20px;
}

/* Custom icon themes */
.stat-red {
  background-color: #FFF1F2;
  color: var(--primary-color);
}
.stat-blue {
  background-color: #EFF6FF;
  color: #2563EB;
}
.stat-yellow {
  background-color: #FEF3C7;
  color: #D97706;
}
.stat-green {
  background-color: #ECFDF5;
  color: #059669;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: var(--text-light);
}

.stat-number {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-dark);
  line-height: 1.2;
}

/* ==========================================
   Recent Results Section
   ========================================== */
.recent-results {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  text-align: left;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-dark);
}

.report-link {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 500;
}

.report-link:hover {
  text-decoration: underline;
}

.report-link svg {
  width: 14px;
  height: 14px;
}

/* Weakness Radar Section */
.weakness-radar-section {
  margin-bottom: 24px;
  text-align: left;
}
.radar-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  position: relative;
}
.radar-card canvas {
  max-width: 100%;
  max-height: 280px;
}
.radar-card .empty-state {
  font-size: 13px;
  color: var(--text-light);
  text-align: center;
  padding: 40px 0;
  font-weight: 500;
}

/* Result List Card */
.result-list-container {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 6px 16px;
}

.result-item {
  padding: 14px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid #F1F5F9;
}

.result-item:last-child {
  border-bottom: none;
}

.result-meta {
  display: flex;
  align-items: center;
  text-align: left;
}

.subject-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-dark);
  flex: 1;
}

.subject-score {
  font-size: 15px;
  font-weight: 600;
  margin-right: 16px;
}

.score-green {
  color: #16A34A;
}

.score-orange {
  color: #EA580C;
}

.exam-date {
  font-size: 12px;
  color: var(--text-light);
  min-width: 45px;
  text-align: right;
}

/* Mini Bar inside item */
.result-bar-bg {
  width: 100%;
  height: 5px;
  background-color: #E2E8F0;
  border-radius: 99px;
  overflow: hidden;
}

.result-bar-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 99px;
}

/* ==========================================
   Other Features Scrollable Section
   ========================================== */
.other-features {
  margin-bottom: 24px;
  text-align: left;
}

.other-features .section-title {
  margin-bottom: 12px;
}

.features-scroll-wrapper {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.features-scroll-wrapper::-webkit-scrollbar {
  display: none;
}

.scroll-card {
  min-width: 110px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: var(--transition-fast);
}

.scroll-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.scroll-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-icon-wrapper svg {
  width: 18px;
  height: 18px;
}

.scroll-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-medium);
}

/* ==========================================
   Sticky Bottom Navigation
   ========================================== */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 10px 0 20px 0; /* Padding bottom for phone safe-area */
  z-index: 500;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.02);
}

.bottom-nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-light);
  transition: var(--transition-fast);
  flex: 1;
}

.nav-tab:hover {
  color: var(--text-medium);
}

.nav-tab.active {
  color: var(--primary-color);
}

.tab-icon {
  width: 22px;
  height: 22px;
  transition: var(--transition-fast);
}

.nav-tab.active .tab-icon {
  transform: scale(1.05);
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
}

/* ==========================================
   Keyframes
   ========================================== */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scalePop {
  0% {
    transform: scale(0);
  }
  80% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* ==========================================
   PC/Tablet Breakpoints
   ========================================== */
@media (min-width: 768px) {
  body {
    padding-bottom: 90px; /* Keep spacing for standard bottom floating nav */
  }

  .container {
    max-width: 960px;
  }

  #homeView.active {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  .navbar .nav-container {
    max-width: 960px;
  }

  .greeting-section {
    grid-column: 1 / 3;
  }

  .target-card {
    grid-column: 1 / 3;
  }

  /* Stat cards 4 columns instead of 2 */
  .stats-grid {
    grid-column: 1 / 3;
    grid-template-columns: repeat(4, 1fr);
  }

  .weakness-radar-section {
    grid-column: 1 / 2;
    margin-bottom: 0;
  }

  .recent-results {
    grid-column: 2 / 3;
    margin-bottom: 0;
  }

  .other-features {
    grid-column: 1 / 3;
  }

  .bottom-nav {
    max-width: 600px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1140px;
  }
  .navbar .nav-container {
    max-width: 1140px;
  }
}

/* ==========================================
   Tab View Visibility Controls
   ========================================== */
.tab-view {
  display: none;
}
.tab-view.active {
  display: block;
}

/* ==========================================
   Profile View Styles
   ========================================== */
.profile-header-title-section {
  padding: 24px 0 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-header-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-dark);
}

.profile-user-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  text-align: left;
}

.profile-avatar-container {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
}

.profile-avatar-box {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background-color: var(--primary-color);
  color: var(--text-white);
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(189, 27, 11, 0.15);
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.btn-avatar-camera {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background-color: #1E293B;
  border: 2px solid var(--bg-card);
  color: var(--text-white);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-fast);
}

.btn-avatar-camera:hover {
  background-color: #0F172A;
}

.btn-avatar-camera svg {
  width: 14px;
  height: 14px;
}

.profile-user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-user-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-dark);
}

.profile-user-email {
  font-size: 13px;
  color: var(--text-light);
}

.profile-badge-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
}

.profile-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 999px;
}

.badge-free {
  background-color: #F1F5F9;
  color: var(--text-light);
}

.badge-date {
  background-color: #F8FAFC;
  color: var(--text-light);
  border: 1px solid var(--border-color);
}

/* Metric Row */
.profile-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.profile-stat-item-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: var(--shadow-sm);
}

.profile-stat-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
}

.profile-stat-label {
  font-size: 11px;
  color: var(--text-light);
  font-weight: 500;
}

/* Premium Banner */
.premium-banner-card {
  background-color: #1E293B;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-white);
  margin-bottom: 20px;
  box-shadow: 0 10px 20px -5px rgba(30, 41, 59, 0.1);
}

.premium-banner-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.premium-star-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F59E0B;
  background-color: rgba(245, 158, 11, 0.05);
}

.premium-star-icon-wrapper svg {
  width: 20px;
  height: 20px;
}

.premium-banner-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.premium-banner-title {
  font-size: 15px;
  font-weight: 600;
}

.premium-banner-price {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 300;
}

.btn-premium-action {
  background-color: var(--primary-color);
  color: var(--text-white);
  border-radius: 999px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  transition: var(--transition-normal);
  box-shadow: 0 4px 6px -1px rgba(189, 27, 11, 0.2);
}

.btn-premium-action:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

/* Settings list card */
.profile-menu-container-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 6px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.profile-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #F1F5F9;
  cursor: pointer;
  transition: var(--transition-fast);
}

.profile-menu-item:last-child {
  border-bottom: none;
}

.profile-menu-item:hover {
  opacity: 0.8;
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-item-icon {
  width: 20px;
  height: 20px;
  color: var(--text-light);
}

.menu-item-text {
  font-size: 14px;
  color: var(--text-medium);
  font-weight: 400;
}

.menu-item-arrow {
  width: 16px;
  height: 16px;
  color: #CBD5E1;
}

/* Logout Button */
.btn-profile-logout {
  width: 100%;
  background-color: #FEF2F2;
  border: 1px solid #FEE2E2;
  color: var(--primary-color);
  border-radius: 16px;
  padding: 15px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 30px;
  transition: var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.btn-profile-logout:hover {
  background-color: #FFE4E6;
  border-color: #FCA5A5;
}

.btn-profile-logout svg {
  width: 18px;
  height: 18px;
}

/* Desktop profile grid overrides */
@media (min-width: 768px) {
  #profileView.active,
  #battleView.active,
  #statsView.active,
  #communityView.active {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    grid-column: 1 / 3;
    align-items: start;
  }
  
  .profile-header-title-section {
    grid-column: 1 / 3;
  }
  
  .profile-left-column {
    grid-column: 1 / 2;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .profile-right-column {
    grid-column: 2 / 3;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .profile-user-card {
    margin-bottom: 0;
  }
  
  .profile-stats-row {
    margin-bottom: 0;
  }
  
  .profile-menu-container-card {
    margin-bottom: 0;
  }
  
  .btn-profile-logout {
    margin-bottom: 0;
  }
}

/* ==========================================
   Battle Arena Style Sheet Rules
   ========================================== */
.battle-elo-card {
  background-color: #1E293B;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--text-white);
  margin-bottom: 20px;
  box-shadow: 0 10px 20px -5px rgba(30, 41, 59, 0.15);
}

.battle-elo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.elo-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.elo-label {
  font-size: 13px;
  color: #94A3B8;
  font-weight: 500;
}

.elo-value {
  font-size: 32px;
  font-weight: 700;
  color: #FFFFFF;
}

.elo-live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10B981;
  animation: elo-pulse 1.5s infinite;
}

.live-text {
  font-size: 11px;
  font-weight: 600;
  color: #10B981;
}

@keyframes elo-pulse {
  0% { opacity: 0.3; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.3; transform: scale(0.9); }
}

.btn-quick-match {
  background-color: var(--primary-color);
  color: var(--text-white);
  border-radius: 16px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: var(--transition-fast);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(189, 27, 11, 0.25);
}

.btn-quick-match:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-quick-match svg {
  width: 18px;
  height: 18px;
}

.battle-modes-list {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
}

.battle-mode-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition-fast);
}

.battle-mode-item:last-child {
  border-bottom: none;
}

.battle-mode-item:hover {
  opacity: 0.8;
}

.mode-item-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mode-icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ranked-icon {
  background-color: #FFF1F2;
  color: var(--primary-color);
}

.tournament-icon {
  background-color: #FFFBEB;
  color: #D97706;
}

.challenge-icon {
  background-color: #F0FDF4;
  color: #16A34A;
}

.mode-icon-wrapper svg {
  width: 20px;
  height: 20px;
}

.mode-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.mode-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-dark);
}

.mode-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}

.badge-ranked {
  background-color: #FFF1F2;
  color: var(--primary-color);
}

.badge-popular {
  background-color: #FEF3C7;
  color: #D97706;
}

.mode-subtitle {
  font-size: 12px;
  color: var(--text-light);
}

/* Leaderboard */
.leaderboard-section-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--shadow-sm);
}

.leaderboard-header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-dark);
  text-align: left;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
}

.leaderboard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.leaderboard-item:last-child {
  border-bottom: none;
}

.leaderboard-item.my-rank {
  background-color: #FFF1F2;
  border-radius: 12px;
  padding: 12px 10px;
  margin: 4px -10px;
  border-bottom: none;
}

.leaderboard-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.leaderboard-rank {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-light);
  width: 24px;
  text-align: center;
}

.leaderboard-medal {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.leaderboard-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #F1F5F9;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.leaderboard-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-dark);
}

.leaderboard-item.my-rank .leaderboard-name {
  font-weight: 600;
  color: var(--primary-color);
}

.leaderboard-elo {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dark);
}

.leaderboard-item-loading {
  padding: 20px 0;
  text-align: center;
  color: var(--text-light);
  font-size: 14px;
}

/* ==========================================
   Stats (Weakness Report) Style Sheet Rules
   ========================================== */
.stats-card-box {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.stats-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-dark);
  text-align: left;
  margin-bottom: 8px;
}

.ai-recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.ai-rec-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  text-align: left;
}

.ai-rec-item.good {
  background-color: #ECFDF5;
  border: 1px solid #D1FAE5;
}

.ai-rec-item.average {
  background-color: #FFFBEB;
  border: 1px solid #FEF3C7;
}

.ai-rec-item.needs-improvement {
  background-color: #FFF5F5;
  border: 1px solid #FFE3E3;
}

.ai-rec-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
  flex-shrink: 0;
}

.ai-rec-item.good .ai-rec-icon {
  background-color: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.ai-rec-item.average .ai-rec-icon {
  background-color: rgba(245, 158, 11, 0.15);
  color: #D97706;
}

.ai-rec-item.needs-improvement .ai-rec-icon {
  background-color: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.ai-rec-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-rec-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-rec-subject {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.ai-rec-score {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
}

.ai-rec-item.good .ai-rec-score {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.ai-rec-item.average .ai-rec-score {
  background-color: rgba(245, 158, 11, 0.1);
  color: #D97706;
}

.ai-rec-item.needs-improvement .ai-rec-score {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.ai-rec-text {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.4;
}

/* ==========================================
   Community (Posts & Comments) Style Sheet Rules
   ========================================== */
.community-subtabs-bar .subtab-btn {
  background: none;
  border: none;
  font-family: 'Kanit', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-light);
  padding: 6px 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: var(--transition-fast);
}

.community-subtabs-bar .subtab-btn:hover {
  background-color: #F1F5F9;
  color: var(--text-dark);
}

.community-subtabs-bar .subtab-btn.active {
  background-color: var(--primary-color);
  color: var(--text-white);
}

.subtab-content {
  display: none;
}

.subtab-content.active {
  display: block;
}

/* Post Cards */
.post-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #BD1B0B;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.post-author-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.post-time {
  font-size: 11px;
  color: var(--text-light);
}

.post-body {
  font-size: 14px;
  color: var(--text-dark);
  line-height: 1.5;
  white-space: pre-wrap;
}

/* Comments Section */
.comments-section {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.comment-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #64748B;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.comment-content-box {
  background-color: #F8FAFC;
  padding: 8px 12px;
  border-radius: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-author-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dark);
}

.comment-text {
  font-size: 13px;
  color: var(--text-dark);
  line-height: 1.4;
}

.comment-time {
  font-size: 9px;
  color: var(--text-light);
  margin-top: 2px;
  align-self: flex-end;
}

.comment-input-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.txt-comment-input {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 6px 12px;
  font-family: 'Kanit', sans-serif;
  font-size: 13px;
  outline: none;
  background-color: #F8FAFC;
}

.txt-comment-input:focus {
  border-color: var(--primary-color);
  background-color: white;
}

.btn-submit-comment {
  background-color: #E2E8F0;
  color: var(--text-dark);
  border: none;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-submit-comment:hover {
  background-color: #CBD5E1;
}

/* Chat styles */
.chat-bubble {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  align-self: flex-start;
}

.chat-bubble.me {
  align-self: flex-end;
}

.chat-sender {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-light);
  margin-bottom: 2px;
  margin-left: 4px;
}

.chat-bubble.me .chat-sender {
  text-align: right;
  margin-right: 4px;
  margin-left: 0;
}

.chat-message-box {
  background-color: white;
  border: 1px solid var(--border-color);
  padding: 10px 14px;
  border-radius: 16px;
  border-top-left-radius: 4px;
  font-size: 13px;
  color: var(--text-dark);
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  text-align: left;
}

.chat-bubble.me .chat-message-box {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  border-radius: 16px;
  border-top-right-radius: 4px;
}

.chat-timestamp {
  font-size: 9px;
  color: #94A3B8;
  margin-top: 2px;
  text-align: right;
  padding-right: 4px;
}

.chat-bubble.me .chat-timestamp {
  color: #94A3B8;
  text-align: right;
}

/* Post Actions (Edit / Delete buttons) */
.post-action-btn {
  font-size: 11px;
  color: var(--text-light);
  cursor: pointer;
  margin-right: 8px;
  transition: var(--transition-fast);
  user-select: none;
}

.post-action-btn:hover {
  text-decoration: underline;
}

.post-action-btn.edit:hover {
  color: #D97706;
}

.post-action-btn.delete:hover {
  color: #EF4444;
}

/* Friend list rows and search results list styling */
.friend-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F8FAFC;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition-fast);
}

.friend-item-row:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
}

.friend-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.friend-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dark);
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #F1F5F9;
  cursor: default;
  transition: var(--transition-fast);
}

.search-result-item:hover {
  background-color: #F8FAFC;
}

.search-result-item:last-child {
  border-bottom: none;
}




\\n
## File: home\index.html

\\n<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>แดชบอร์ด - POLICE EXAM</title>
  <!-- Google Fonts: Kanit -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- Stylesheet -->
  <link rel="stylesheet" href="css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" defer></script>
  <!-- Cropper.js -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js" defer></script>
  <!-- External Application Script -->
  <style>
    .vocab-lvl-btn {
      background: white;
      border: 2px solid #E2E8F0;
      border-radius: 16px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      width: 100%;
      font-family: inherit;
    }
    .vocab-lvl-btn:hover {
      border-color: #CBD5E1;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .vocab-lvl-btn:active {
      transform: translateY(0);
    }
    .vocab-count-btn {
      background: transparent;
      color: #64748B;
    }
    .vocab-count-btn.active-count {
      background: white;
      color: #BD1B0B;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
  </style>
  <script src="vocab-data.js" defer></script>
  <script src="js/app.js" defer></script>
</head>
<body>

  <!-- Top Navigation Header -->
  <header class="navbar">
    <div class="nav-container">
      <a href="#" class="logo">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#BD1B0B" stroke="#BD1B0B" stroke-width="2" stroke-linejoin="round"/>
          <path d="M9 11L11 13L15 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">POLICE<span class="logo-highlight">EXAM</span></span>
      </a>

      <!-- Right Header Actions -->
      <div class="header-actions">
        <!-- Notification Bell -->
        <button class="btn-notification" id="btnNotification" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="notification-badge" id="notifBadge"></span>
        </button>

        <!-- User Profile Dropdown Anchor -->
        <div class="profile-menu-container">
          <button class="btn-profile-menu" id="btnProfileMenu" aria-label="Profile Menu">
            <img src="" alt="Google Avatar" class="header-avatar" id="headerAvatar" style="display: none;">
            <div class="default-avatar" id="defaultAvatar">ส</div>
          </button>
          
          <!-- Dropdown Options -->
          <div class="profile-dropdown" id="profileDropdown">
            <div class="dropdown-header">
              <span class="dropdown-user-name" id="dropdownUserName">สมชาย ใจดี</span>
              <span class="dropdown-user-email" id="dropdownUserEmail">somchai@email.com</span>
            </div>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" id="btnDropdownLogout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              <span>ออกจากระบบ</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Dashboard Content -->
  <main class="dashboard-main">
    <div class="container">
      
      <div id="homeView" class="tab-view active">
        <!-- Greeting Header -->
        <section class="greeting-section">
          <span class="greeting-subtitle">สวัสดีตอนเช้า 👋</span>
          <h1 class="greeting-title" id="greetingName">สมชาย ใจดี</h1>
        <div class="countdown-badge">
          <!-- Small Red Clock Icon -->
          <svg class="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>เหลืออีก 47 วันถึงวันสอบ</span>
        </div>
      </section>

      <!-- Daily Target Red Box -->
      <section class="target-card">
        <div class="target-header">
          <div class="target-text-wrapper">
            <span class="target-subtitle">เป้าหมายวันนี้</span>
            <h2 class="target-title">ทำข้อสอบ 50 ข้อ</h2>
          </div>
          <!-- Clickable Start Exam Button -->
          <button class="btn-start-exam" id="btnStartExam">
            <!-- Play Icon -->
            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>เริ่มสอบ</span>
          </button>
        </div>

        <!-- Target Progress Bar -->
        <div class="target-progress-wrapper">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" id="progressBarFill" style="width: 62%;"></div>
          </div>
          <div class="progress-labels">
            <span class="progress-count" id="progressCountText">31/50 ข้อ</span>
            <span class="progress-percent" id="progressPercentText">62%</span>
          </div>
        </div>
      </section>

      <!-- Stats Grid -->
      <section class="stats-grid">
        <!-- Stat Card 1: Average Score -->
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-red">
            <!-- Trophy Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
              <path d="M12 2a4 4 0 0 1 4 4v7c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1V6a4 4 0 0 1 4-4z"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">คะแนนเฉลี่ย</span>
            <span class="stat-number" id="statAvgScore">—</span>
          </div>
        </div>

        <!-- Stat Card 2: Done Questions -->
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-blue">
            <!-- Document Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">พ้อยต์</span>
            <span class="stat-number" id="statPoints">—</span>
          </div>
        </div>

        <!-- Stat Card 3: Streak -->
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-yellow">
            <!-- Flame Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Streak</span>
            <span class="stat-number" id="statStreak">—</span>
          </div>
        </div>

        <!-- Stat Card 4: Rank -->
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-green">
            <!-- Ribbon Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="7"/>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">เลเวล</span>
            <span class="stat-number" id="statLevel">—</span>
          </div>
        </div>
      </section>

      <!-- Radar Chart Section -->
      <section class="weakness-radar-section">
        <h3 class="section-title">ภาพรวมข้อที่ตอบผิดสะสม</h3>
        <div class="radar-card">
          <canvas id="radarChartCanvas"></canvas>
          <div id="radarEmptyState" class="empty-state" style="display: none;">
            <p>ทำข้อสอบเพิ่มเติมเพื่อสะสมสถิติจุดอ่อน</p>
          </div>
        </div>
      </section>

      <!-- Recent Results Section -->
      <section class="recent-results">
        <div class="section-header">
          <h3 class="section-title">ผลล่าสุด</h3>
          <a href="#" class="report-link" onclick="alert('ฟีเจอร์รายงานสรุปทั้งหมดจะเปิดในเวอร์ชันหน้าครับ');">
            <span>ดูรายงาน</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </div>

        <div class="result-list-container">
          <!-- Results will be populated from real API data -->
          <div style="text-align:center;padding:24px;color:#64748B;font-size:13px;">
            กำลังโหลดข้อมูลคะแนน...
          </div>
        </div>
      </section>

      <!-- Other Features Section -->
      <section class="other-features">
        <h3 class="section-title">ฟีเจอร์อื่นๆ</h3>
        <div class="features-scroll-wrapper">
          <div class="scroll-card" style="cursor: pointer;" onclick="document.getElementById('btnTabBattle').click();">
            <div class="scroll-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
                <line x1="13" y1="19" x2="19" y2="13"/>
              </svg>
            </div>
            <span class="scroll-name">Battle Arena</span>
          </div>

          <div class="scroll-card" style="cursor: pointer;" onclick="openVocabArena();">
            <div class="scroll-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            </div>
            <span class="scroll-name">Vocab</span>
          </div>

          <div class="scroll-card">
            <div class="scroll-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span class="scroll-name">Bookmark</span>
          </div>
        </div>
      </section>
      </div> <!-- Close homeView -->

      <!-- Community View Content -->
      <div id="communityView" class="tab-view">
        <!-- Header title -->
        <section class="profile-header-title-section" style="flex-direction: column; align-items: flex-start; gap: 16px; width: 100%;">
          <h1 class="profile-header-title">ชุมชนเตรียมสอบ</h1>
        </section>

        <!-- Left Pane: Posts (Always Visible) -->
        <div class="profile-left-column">
            <h3 class="stats-card-title" style="margin-bottom: 12px; margin-top: 0;">โพสต์</h3>
            <!-- SUBTAB 1: Posts list & compose -->
            <div id="subtabContentPosts" style="display: block;">
            <!-- Create Post Box -->
            <div class="stats-card-box" style="padding: 16px; margin-bottom: 16px; gap: 12px;">
              <textarea id="txtPostContent" placeholder="แบ่งปันแนวข้อสอบ หรือพูดคุยเตรียมสอบกับเพื่อนๆ..." style="width: 100%; height: 80px; border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; font-family: 'Kanit', sans-serif; font-size: 14px; resize: none; outline: none; transition: 0.2s;" onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='var(--border-color)'"></textarea>
              <div style="display: flex; justify-content: flex-end;">
                <button id="btnCreatePost" class="btn-quick-match" style="padding: 8px 20px; font-size: 13px; border-radius: 8px; box-shadow: none;">โพสต์</button>
              </div>
            </div>

            <!-- Posts Feed Container -->
            <div id="postsFeedContainer" class="ai-recommendations-list" style="max-height: 500px; overflow-y: auto; padding-right: 4px;">
              <div class="leaderboard-item-loading">กำลังโหลดฟีดโพสต์...</div>
            </div>
          </div>
        </div>

        <!-- Right Pane: Chat, Groups, Friends -->
        <div class="profile-right-column">
            <!-- Sub Tabs Bar (Right Pane) -->
            <div class="community-subtabs-bar" style="display: flex; gap: 8px; width: 100%; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; flex-wrap: wrap; margin-bottom: 16px;">
              <button class="subtab-btn active" id="btnSubtabChat">ช่องแชทรวม</button>
              <button class="subtab-btn" id="btnSubtabGroups">กลุ่ม</button>
              <button class="subtab-btn" id="btnSubtabFriends">เพื่อน & แชทส่วนตัว</button>
            </div>

            <!-- SUBTAB 2: Global Chat View -->
            <div id="subtabContentChat" class="subtab-content active">
              <div class="stats-card-box" style="padding: 0; overflow: hidden; height: 480px; display: flex; flex-direction: column; justify-content: space-between; border-radius: 20px;">
              <!-- Chat Messages Panel -->
              <div id="chatMessagesContainer" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background-color: #F8FAFC;">
                <div class="leaderboard-item-loading">กำลังโหลดข้อความ...</div>
              </div>
              <!-- Chat Input Panel -->
              <div style="display: flex; align-items: center; padding: 12px; border-top: 1px solid var(--border-color); gap: 8px; background-color: white;">
                <input type="text" id="txtChatInput" placeholder="พิมพ์ข้อความคุยแชทรวม..." style="flex: 1; border: 1px solid var(--border-color); border-radius: 12px; padding: 10px 14px; font-family: 'Kanit', sans-serif; font-size: 14px; outline: none;" onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='var(--border-color)'">
                <button id="btnSendChat" class="btn-quick-match" style="padding: 10px 16px; border-radius: 12px; box-shadow: none; flex-shrink: 0; width: auto;">ส่ง</button>
              </div>
            </div>
          </div>

          <!-- SUBTAB 3: Groups View -->
          <div id="subtabContentGroups" class="subtab-content">
            <!-- Group List Main Panel -->
            <div id="groupListMainPanel">
              <div style="display: flex; gap: 12px; margin-bottom: 16px; align-items: center;">
                <input type="text" id="txtGroupSearch" placeholder="🔍 ค้นหาชื่อกลุ่มติว..." style="flex: 1; border: 1px solid var(--border-color); border-radius: 12px; padding: 10px 14px; font-family: 'Kanit', sans-serif; font-size: 14px; outline: none;">
                <button id="btnOpenCreateGroupModal" class="btn-quick-match" style="padding: 10px 16px; border-radius: 12px; font-size: 13px; box-shadow: none; width: auto; flex-shrink: 0;">สร้างกลุ่ม</button>
              </div>
              
              <!-- Dynamic list -->
              <div id="groupsListContainer" class="battle-modes-list">
                <div class="leaderboard-item-loading">กำลังโหลดกลุ่มติว...</div>
              </div>
            </div>

            <!-- Group Chat Screen (Initially Hidden) -->
            <div id="groupChatScreenPanel" style="display: none; flex-direction: column; height: 480px; background-color: white; border: 1px solid var(--border-color); border-radius: 20px; overflow: hidden;">
              <!-- Header -->
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: #F8FAFC;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button id="btnBackToGroups" style="background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-dark);">⬅️</button>
                  <div style="text-align: left;">
                    <span id="lblChatGroupName" style="font-weight: 600; display: block; font-size: 14px; color: var(--text-dark);">ชื่อกลุ่ม</span>
                    <span id="lblChatGroupMeta" style="font-size: 11px; color: var(--text-light); display: block;">ID: #1 • สมาชิก 1 คน</span>
                  </div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button id="btnLeaveGroup" class="post-action-btn delete" style="font-weight: 600; font-size: 12px; border: 1px solid #EF4444; padding: 4px 10px; border-radius: 6px; background: none; margin-right: 0;">ออกจากกลุ่ม</button>
                  <button id="btnDeleteGroup" class="post-action-btn delete" style="font-weight: 600; font-size: 12px; border: 1px solid #EF4444; padding: 4px 10px; border-radius: 6px; background: #EF4444; color: white; display: none; margin-right: 0;">ลบกลุ่ม</button>
                </div>
              </div>
              
              <!-- Requests approval panel (Creator only, dynamic display) -->
              <div id="groupJoinRequestsPanel" style="display: none; background: #FFFBEB; border-bottom: 1px solid #FEF3C7; padding: 12px 16px; text-align: left;">
                <span id="lblGroupJoinRequestsCount" style="font-size: 12px; font-weight: 600; color: #B45309; display: block; margin-bottom: 8px;">📬 คำขอเข้าร่วมกลุ่ม (0)</span>
                <div id="groupJoinRequestsContainer" style="display: flex; flex-direction: column; gap: 8px; max-height: 120px; overflow-y: auto;">
                  <!-- pending requests -->
                </div>
              </div>
              
              <!-- Message feed -->
              <div id="groupChatMessagesContainer" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background-color: #F8FAFC;">
                <div class="leaderboard-item-loading">กำลังโหลดข้อความ...</div>
              </div>
              
              <!-- Input -->
              <div style="display: flex; align-items: center; padding: 12px; border-top: 1px solid var(--border-color); gap: 8px; background-color: white;">
                <input type="text" id="txtGroupChatInput" placeholder="พิมพ์ข้อความแชทคุยในกลุ่ม..." style="flex: 1; border: 1px solid var(--border-color); border-radius: 12px; padding: 10px 14px; font-family: 'Kanit', sans-serif; font-size: 14px; outline: none;">
                <button id="btnSendGroupChat" class="btn-quick-match" style="padding: 10px 16px; border-radius: 12px; box-shadow: none; flex-shrink: 0; width: auto;">ส่ง</button>
              </div>
            </div>
          </div>

          <!-- SUBTAB 4: Friends & Direct Chat -->
          <div id="subtabContentFriends" class="subtab-content">
            <!-- Active Chat Panel & Friends list -->
            <div id="friendsMainPanel">
              <!-- Friend Requests List -->
              <div class="stats-card-box" id="friendRequestsPanel" style="padding: 16px; display: none; margin-bottom: 16px; background-color: #FFFBEB; border: 1px solid #FDE68A;">
                <h3 class="stats-card-title" style="font-size: 14px; margin-bottom: 12px; color: #B45309; display: flex; justify-content: space-between; align-items: center;">
                  <span>📬 คำขอเป็นเพื่อนใหม่</span>
                </h3>
                <div id="friendRequestsContainer" style="display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto;">
                  <!-- pending requests -->
                </div>
              </div>

              <!-- Search Friends Input -->
              <div style="margin-bottom: 16px; position: relative;">
                <input type="text" id="txtFriendUserSearch" placeholder="🔍 ค้นหาชื่อเพื่อเพิ่มเพื่อน..." style="width: 100%; border: 1px solid var(--border-color); border-radius: 12px; padding: 10px 14px; font-family: 'Kanit', sans-serif; font-size: 14px; outline: none;">
                <!-- Search results list -->
                <div id="friendUserSearchResultsContainer" style="position: absolute; left: 0; right: 0; top: 100%; margin-top: 4px; max-height: 180px; overflow-y: auto; display: none; background: white; border: 1px solid var(--border-color); border-radius: 12px; box-shadow: var(--shadow-sm); z-index: 50; padding: 6px 0;">
                  <!-- results -->
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 16px;">
                <!-- Friends List -->
                <div class="stats-card-box" style="padding: 16px;">
                  <h3 class="stats-card-title" style="font-size: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span>👥 รายชื่อเพื่อนของคุณ (คลิกเพื่อแชทส่วนตัว)</span>
                    <span id="lblFriendsCount" style="font-size: 11px; font-weight: normal; color: var(--text-light);">0 คน</span>
                  </h3>
                  <div id="friendsListContainer" style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
                    <div class="leaderboard-item-loading" style="font-size: 12px;">กำลังโหลดรายชื่อเพื่อน...</div>
                  </div>
                </div>

                <!-- Blocked List -->
                <div class="stats-card-box" style="padding: 16px;">
                  <h3 class="stats-card-title" style="font-size: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span>🚫 รายชื่อที่คุณบล็อก</span>
                  </h3>
                  <div id="blockedUsersListContainer" style="display: flex; flex-direction: column; gap: 8px; max-height: 150px; overflow-y: auto;">
                    <div class="leaderboard-item-loading" style="font-size: 12px;">ไม่มีรายชื่อที่บล็อก</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Direct Message Chat Panel (Initially Hidden) -->
            <div id="dmChatScreenPanel" style="display: none; flex-direction: column; height: 480px; background-color: white; border: 1px solid var(--border-color); border-radius: 20px; overflow: hidden;">
              <!-- Header -->
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: #F8FAFC;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button id="btnBackToFriends" style="background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-dark);">⬅️</button>
                  <div style="text-align: left;">
                    <span id="lblDmChatFriendName" style="font-weight: 600; display: block; font-size: 14px; color: var(--text-dark);">ชื่อเพื่อน</span>
                    <span style="font-size: 11px; color: var(--text-light); display: block;">แชทส่วนตัว</span>
                  </div>
                </div>
                <button id="btnBlockCurrentFriend" class="post-action-btn delete" style="font-weight: 600; font-size: 12px; border: 1px solid #EF4444; padding: 4px 10px; border-radius: 6px; background: none; margin-right: 0;">บล็อก</button>
              </div>
              
              <!-- Message panel -->
              <div id="dmChatMessagesContainer" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background-color: #F8FAFC;">
                <div class="leaderboard-item-loading">กำลังโหลดข้อความ...</div>
              </div>
              
              <!-- Input panel -->
              <div style="display: flex; align-items: center; padding: 12px; border-top: 1px solid var(--border-color); gap: 8px; background-color: white;">
                <input type="text" id="txtDmChatInput" placeholder="พิมพ์ข้อความคุยแชทส่วนตัว..." style="flex: 1; border: 1px solid var(--border-color); border-radius: 12px; padding: 10px 14px; font-family: 'Kanit', sans-serif; font-size: 14px; outline: none;">
                <button id="btnSendDmChat" class="btn-quick-match" style="padding: 10px 16px; border-radius: 12px; box-shadow: none; flex-shrink: 0; width: auto;">ส่ง</button>
              </div>
            </div>
          </div>

        </div> <!-- End of Right Column -->

      </div>


      <!-- Profile View Content -->
      <div id="profileView" class="tab-view">
        <!-- Header title -->
        <section class="profile-header-title-section">
          <h1 class="profile-header-title">โปรไฟล์</h1>
        </section>

        <!-- Left Column Wrapper -->
        <div class="profile-left-column">
          <!-- Profile card -->
          <section class="profile-user-card">
            <div class="profile-avatar-container">
              <div class="profile-avatar-box" id="profileAvatarBox">ส</div>
              <img src="" alt="Avatar" class="profile-avatar-img" id="profileAvatarImg" style="display: none;">
              <input type="file" id="profileImageInput" accept="image/*" style="display: none;" onchange="handleProfileImageUpload(event)">
              <button class="btn-avatar-camera" aria-label="Change Avatar" onclick="document.getElementById('profileImageInput').click();">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
            <div class="profile-user-info">
              <h2 class="profile-user-name" id="profileName">สมชาย ใจดี</h2>
              <p class="profile-user-email" id="profileEmail">somchai@email.com</p>
              <div class="profile-badge-row">
                <span class="profile-badge badge-free">Free</span>
                <span class="profile-badge badge-date" id="profileJoinDate">สมาชิกตั้งแต่ ม.ค. 2568</span>
              </div>
            </div>
          </section>

          <!-- Stats Metric Row -->
          <section class="profile-stats-row">
            <div class="profile-stat-item-card">
              <span class="profile-stat-number" id="profileQuestionsCount">1,248</span>
              <span class="profile-stat-label">ข้อที่ทำ</span>
            </div>
            <div class="profile-stat-item-card">
              <span class="profile-stat-number" id="profileAvgScore">72.4%</span>
              <span class="profile-stat-label">คะแนนเฉลี่ย</span>
            </div>
            <div class="profile-stat-item-card">
              <span class="profile-stat-number" id="profileStreakCount">14 วัน</span>
              <span class="profile-stat-label">Streak</span>
            </div>
          </section>
        </div>

        <!-- Right Column Wrapper -->
        <div class="profile-right-column">
          <!-- Menu Settings List -->
          <section class="profile-menu-container-card">
            <div class="profile-menu-item" onclick="alert('แก้ไขโปรไฟล์จะเปิดเร็วๆ นี้');">
              <div class="menu-item-left">
                <svg class="menu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span class="menu-item-text">แก้ไขโปรไฟล์</span>
              </div>
              <svg class="menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>

            <div class="profile-menu-item" onclick="alert('การแจ้งเตือนจะเปิดเร็วๆ นี้');">
              <div class="menu-item-left">
                <svg class="menu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span class="menu-item-text">การแจ้งเตือน</span>
              </div>
              <svg class="menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>

            <div class="profile-menu-item" onclick="alert('เปลี่ยนรหัสผ่านจะเปิดเร็วๆ นี้');">
              <div class="menu-item-left">
                <svg class="menu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span class="menu-item-text">เปลี่ยนรหัสผ่าน</span>
              </div>
              <svg class="menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>

            <div class="profile-menu-item" onclick="alert('ประวัติการสอบจะเปิดเร็วๆ นี้');">
              <div class="menu-item-left">
                <svg class="menu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <span class="menu-item-text">ประวัติการสอบ</span>
              </div>
              <svg class="menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>

            <div class="profile-menu-item" onclick="alert('ข้อสอบที่บันทึกจะเปิดเร็วๆ นี้');">
              <div class="menu-item-left">
                <svg class="menu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <span class="menu-item-text">ข้อสอบที่บันทึก</span>
              </div>
              <svg class="menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>

            <div class="profile-menu-item" onclick="alert('ช่วยเหลือ / FAQ จะเปิดเร็วๆ นี้');">
              <div class="menu-item-left">
                <svg class="menu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span class="menu-item-text">ช่วยเหลือ / FAQ</span>
              </div>
              <svg class="menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>

            <div class="profile-menu-item" onclick="alert('ตั้งค่าจะเปิดเร็วๆ นี้');">
              <div class="menu-item-left">
                <svg class="menu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span class="menu-item-text">ตั้งค่า</span>
              </div>
              <svg class="menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </section>

          <!-- Logout Button -->
          <button class="btn-profile-logout" id="btnProfileLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      <!-- Battle View Content -->
      <div id="battleView" class="tab-view">
        <!-- Header title -->
        <section class="profile-header-title-section">
          <h1 class="profile-header-title">Battle Arena</h1>
          <svg class="header-trophy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #BD1B0B; width: 24px; height: 24px;">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
            <path d="M12 2a6 6 0 0 1 6 6v1H6V8a6 6 0 0 1 6-6z"/>
          </svg>
        </section>

        <!-- Left Column Wrapper -->
        <div class="profile-left-column">
          <!-- ELO card -->
          <section class="battle-elo-card">
            <div class="battle-elo-header">
              <div class="elo-info">
                <span class="elo-label">คะแนน ELO ของคุณ</span>
                <span class="elo-value" id="myEloValue">1,000</span>
              </div>
              <div class="elo-live-indicator">
                <span class="live-dot"></span>
                <span class="live-text">Live</span>
              </div>
            </div>
            <!-- Quick Match Button -->
            <button class="btn-quick-match" id="btnQuickMatch">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>Quick Match</span>
            </button>
          </section>

          <!-- Modes List Card -->
          <section class="battle-modes-list">
            <!-- Mode 1: Ranked Match -->
            <div class="battle-mode-item" onclick="alert('Ranked Match จะพร้อมใช้งานเร็วๆ นี้');">
              <div class="mode-item-left">
                <div class="mode-icon-wrapper ranked-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div class="mode-info">
                  <div class="mode-title-row">
                    <span class="mode-title">Ranked Match</span>
                    <span class="mode-badge badge-ranked">Ranked</span>
                  </div>
                  <span class="mode-subtitle">แข่งระดับ ELO เดียวกัน</span>
                </div>
              </div>
              <svg class="menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>

            <!-- Mode 2: Tournament -->
            <div class="battle-mode-item" onclick="alert('Tournament จะพร้อมใช้งานเร็วๆ นี้');">
              <div class="mode-item-left">
                <div class="mode-icon-wrapper tournament-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                    <path d="M4 22h16"/>
                    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
                    <path d="M12 2a6 6 0 0 1 6 6v1H6V8a6 6 0 0 1 6-6z"/>
                  </svg>
                </div>
                <div class="mode-info">
                  <div class="mode-title-row">
                    <span class="mode-title">Tournament</span>
                    <span class="mode-badge badge-popular">Popular</span>
                  </div>
                  <span class="mode-subtitle">8 คน รางวัลพิเศษทุกสัปดาห์</span>
                </div>
              </div>
              <svg class="menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>

            <!-- Mode 3: Invite Friend -->
            <div class="battle-mode-item" onclick="alert('ท้าทายเพื่อนจะพร้อมใช้งานเร็วๆ นี้');">
              <div class="mode-item-left">
                <div class="mode-icon-wrapper challenge-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div class="mode-info">
                  <span class="mode-title">ท้าเพื่อน</span>
                  <span class="mode-subtitle">สร้างห้องและส่งลิงก์</span>
                </div>
              </div>
              <svg class="menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </section>
        </div>

        <!-- Right Column Wrapper -->
        <div class="profile-right-column">
          <!-- Leaderboard Card -->
          <section class="leaderboard-section-card">
            <h3 class="leaderboard-header-title">Leaderboard สัปดาห์นี้</h3>
            <div class="leaderboard-list" id="leaderboardListContainer">
              <div class="leaderboard-item-loading">กำลังโหลดอันดับ...</div>
            </div>
          </section>
        </div>
      </div>

      <!-- Stats View Content -->
      <div id="statsView" class="tab-view">
        <!-- Header title -->
        <section class="profile-header-title-section">
          <h1 class="profile-header-title">รายงานจุดอ่อน</h1>
          <span style="font-size: 12px; color: var(--text-light); text-align: right;" id="statsLastUpdateText">อัปเดต วันนี้</span>
        </section>

        <!-- Left Column Wrapper -->
        <div class="profile-left-column">
          <!-- Card 1: Radar Chart -->
          <section class="stats-card-box">
            <h3 class="stats-card-title">ภาพรวมรายวิชา</h3>
            <div class="chart-container" style="position: relative; height: 260px; margin-top: 10px;">
              <canvas id="statsRadarChartCanvas"></canvas>
            </div>
          </section>

          <!-- Card 2: Bar Chart -->
          <section class="stats-card-box">
            <h3 class="stats-card-title">คะแนนแยกวิชา</h3>
            <div class="chart-container" style="position: relative; height: 240px; margin-top: 10px;">
              <canvas id="statsBarChartCanvas"></canvas>
            </div>
            <!-- Legend -->
            <div class="bar-chart-legend" style="display: flex; justify-content: center; gap: 16px; margin-top: 12px; font-size: 12px;">
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; border-radius: 3px; background-color: #10B981;"></span>ดีมาก</span>
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; border-radius: 3px; background-color: #F59E0B;"></span>พอใช้</span>
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; border-radius: 3px; background-color: #EF4444;"></span>ปรับปรุง</span>
            </div>
          </section>
        </div>

        <!-- Right Column Wrapper -->
        <div class="profile-right-column">
          <!-- Card 3: Line Chart (8-Week Progress) -->
          <section class="stats-card-box">
            <h3 class="stats-card-title">พัฒนาการ 8 สัปดาห์</h3>
            <div class="chart-container" style="position: relative; height: 200px; margin-top: 10px;">
              <canvas id="statsLineChartCanvas"></canvas>
            </div>
          </section>

          <!-- Card 4: AI Recommendations -->
          <section class="stats-card-box">
            <h3 class="stats-card-title" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">🧠</span> คำแนะนำจาก AI
            </h3>
            <div class="ai-recommendations-list" id="aiRecsListContainer">
              <div class="leaderboard-item-loading">กำลังวิเคราะห์คะแนน...</div>
            </div>
          </section>
        </div>
      </div>



    </div>
  </main>

  <!-- Sticky Bottom Navigation for Mobile -->
  <nav class="bottom-nav">
    <div class="bottom-nav-container">
      <a href="#" class="nav-tab active">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span class="tab-label">หน้าแรก</span>
      </a>

      <a href="#" class="nav-tab" id="btnTabCommunity">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span class="tab-label">ชุมชน</span>
      </a>

      <a href="#" class="nav-tab" id="btnTabBattle">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
          <line x1="13" y1="19" x2="19" y2="13"/>
          <line x1="16" y1="20" x2="20" y2="16"/>
        </svg>
        <span class="tab-label">Battle</span>
      </a>

      <a href="#" class="nav-tab" id="btnTabStats">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <span class="tab-label">สถิติ</span>
      </a>

      <a href="#" class="nav-tab" id="btnTabProfile">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span class="tab-label">โปรไฟล์</span>
      </a>
    </div>
  </nav>

  <!-- Create Group Modal -->
  <div class="modal-overlay" id="createGroupModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); align-items: center; justify-content: center; z-index: 100;">
    <div class="modal-card" style="background: white; max-width: 400px; width: 90%; padding: 24px; border-radius: 20px; text-align: left; box-shadow: var(--shadow-lg);">
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1E293B;">สร้างกลุ่มติวใหม่</h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="font-size: 13px; font-weight: 500; color: #64748B; display: block; margin-bottom: 4px;">ชื่อกลุ่ม</label>
          <input type="text" id="txtCreateGroupName" placeholder="เช่น ตะลุยโจทย์อังกฤษ นายสิบตำรวจ" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; font-family: 'Kanit'; font-size: 14px; outline: none;">
        </div>
        <div>
          <label style="font-size: 13px; font-weight: 500; color: #64748B; display: block; margin-bottom: 4px;">รายละเอียดกลุ่ม (ไม่บังคับ)</label>
          <textarea id="txtCreateGroupDesc" placeholder="อธิบายวัตถุประสงค์ หรือแนวข้อสอบในกลุ่ม..." style="width: 100%; height: 60px; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; font-family: 'Kanit'; font-size: 14px; outline: none; resize: none;"></textarea>
        </div>
        <div>
          <label style="font-size: 13px; font-weight: 500; color: #64748B; display: block; margin-bottom: 4px;">ประเภทกลุ่ม</label>
          <div style="display: flex; gap: 16px; margin-top: 4px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; color: var(--text-dark);">
              <input type="radio" name="optGroupPrivacy" value="public" checked style="accent-color: var(--primary-color);"> 🔓 สาธารณะ (Public)
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; color: var(--text-dark);">
              <input type="radio" name="optGroupPrivacy" value="private" style="accent-color: var(--primary-color);"> 🔒 ส่วนตัว (Private)
            </label>
          </div>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
        <button id="btnCancelCreateGroup" style="background: #F1F5F9; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">ยกเลิก</button>
        <button id="btnSubmitCreateGroup" style="background: var(--primary-color); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">สร้างกลุ่ม</button>
      </div>
    </div>
  </div>

  <!-- User Profile Modal -->
  <div class="modal-overlay" id="userProfileModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); align-items: center; justify-content: center; z-index: 120;">
    <div class="modal-card" style="background: white; max-width: 420px; width: 92%; padding: 24px; border-radius: 20px; text-align: center; box-shadow: var(--shadow-lg); position: relative; max-height: 85vh; overflow-y: auto;">
      <!-- Close btn -->
      <button id="btnCloseUserProfileModal" style="position: absolute; right: 16px; top: 16px; background: none; border: none; font-size: 16px; cursor: pointer; color: var(--text-light);">❌</button>
      
      <!-- Avatar -->
      <div id="userProfileModalAvatar" style="width: 72px; height: 72px; border-radius: 50%; background-color: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; margin: 12px auto;">ส</div>
      
      <!-- Names -->
      <h3 id="lblUserProfileModalFullName" style="font-size: 18px; font-weight: 600; color: #1E293B; margin-bottom: 2px;">ชื่อผู้ใช้</h3>
      <span id="lblUserProfileModalUsername" style="font-size: 13px; color: var(--text-light); display: block; margin-bottom: 16px;">@username</span>
      
      <!-- Stats grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px;">
        <div style="background-color: #F8FAFC; padding: 10px; border-radius: 12px;">
          <span style="font-size: 11px; color: #64748B; display: block;">เลเวล</span>
          <span id="lblUserProfileModalLevel" style="font-size: 15px; font-weight: 700; color: var(--primary-color);">Lv.1</span>
        </div>
        <div style="background-color: #F8FAFC; padding: 10px; border-radius: 12px;">
          <span style="font-size: 11px; color: #64748B; display: block;">คะแนนรวม</span>
          <span id="lblUserProfileModalPoints" style="font-size: 15px; font-weight: 700; color: #10B981;">0 พ้อยต์</span>
        </div>
        <div style="background-color: #F8FAFC; padding: 10px; border-radius: 12px;">
          <span style="font-size: 11px; color: #64748B; display: block;">Streak วัน</span>
          <span id="lblUserProfileModalStreak" style="font-size: 15px; font-weight: 700; color: #F59E0B;">0 วัน</span>
        </div>
        <div style="background-color: #F8FAFC; padding: 10px; border-radius: 12px;">
          <span style="font-size: 11px; color: #64748B; display: block;">ชนะศึก Battle</span>
          <span id="lblUserProfileModalWins" style="font-size: 15px; font-weight: 700; color: #6366F1;">0 ครั้ง</span>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div id="userProfileModalActions" style="display: flex; flex-direction: column; gap: 8px;">
        <!-- dynamic action buttons -->
      </div>

      <!-- Post History Section -->
      <div style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 16px; text-align: left;">
        <h4 style="font-size: 14px; font-weight: 600; color: #1E293B; margin-bottom: 12px;">📝 ประวัติการโพสต์</h4>
        <div id="userProfileModalPostsContainer" style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto;">
          <div style="text-align: center; color: var(--text-light); font-size: 12px; padding: 12px 0;">กำลังโหลด...</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Custom Confirm Modal (Centered) -->
  <div id="customConfirmModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;">
    <div style="background: white; border-radius: 16px; padding: 28px 24px; max-width: 340px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: modalPop 0.2s ease;">
      <div id="customConfirmIcon" style="font-size: 36px; margin-bottom: 12px;">⚠️</div>
      <h3 id="customConfirmTitle" style="font-size: 16px; font-weight: 600; color: #1E293B; margin-bottom: 8px;">ยืนยัน</h3>
      <p id="customConfirmMessage" style="font-size: 13px; color: #64748B; margin-bottom: 20px; line-height: 1.5;"></p>
      <div style="display: flex; gap: 10px;">
        <button id="btnConfirmCancel" style="flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #E2E8F0; background: #F8FAFC; color: #64748B; font-size: 14px; font-weight: 600; cursor: pointer;">ยกเลิก</button>
        <button id="btnConfirmOk" style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: #EF4444; color: white; font-size: 14px; font-weight: 600; cursor: pointer;">ยืนยัน</button>
      </div>
    </div>
  </div>

  <!-- Custom Alert Modal (Centered) -->
  <div id="customAlertModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;">
    <div style="background: white; border-radius: 16px; padding: 28px 24px; max-width: 340px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: modalPop 0.2s ease;">
      <div id="customAlertIcon" style="font-size: 36px; margin-bottom: 12px;">ℹ️</div>
      <h3 id="customAlertTitle" style="font-size: 16px; font-weight: 600; color: #1E293B; margin-bottom: 8px;">แจ้งเตือน</h3>
      <p id="customAlertMessage" style="font-size: 13px; color: #64748B; margin-bottom: 20px; line-height: 1.5;"></p>
      <button id="btnAlertOk" style="width: 100%; padding: 12px; border-radius: 10px; border: none; background: var(--primary-color); color: white; font-size: 14px; font-weight: 600; cursor: pointer;">ตกลง</button>
    </div>
  </div>

  <!-- Vocab Game Modal -->
  <div id="vocabArenaModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center;">
    <div class="modal-card" style="background: #F8FAFC; max-width: 440px; width: 94%; padding: 24px; border-radius: 24px; text-align: center; box-shadow: var(--shadow-xl); position: relative; animation: modalPop 0.25s ease;">
      <!-- Close button -->
      <button id="btnCloseVocabArena" style="position: absolute; right: 20px; top: 20px; background: #E2E8F0; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; color: var(--text-dark); transition: all 0.2s;">❌</button>

      <!-- Title / Header -->
      <div style="margin-bottom: 20px;">
        <span style="font-size: 24px; display: block; margin-bottom: 4px;">📖</span>
        <h2 style="font-size: 18px; font-weight: 800; color: #1E293B; margin: 0;">Vocab</h2>
        <span style="font-size: 12px; color: #64748B;">มินิเกมฝึกคำศัพท์ภาษาอังกฤษสอบตำรวจ</span>
      </div>

      <!-- Level Selection Section -->
      <div id="vocabLevelSelection" style="display: block; margin-top: 10px;">
        <!-- Question Count Selector -->
        <div style="margin-bottom: 20px; text-align: left;">
          <p style="font-size: 13px; color: #64748B; font-weight: 600; margin-bottom: 8px;">จำนวนคำศัพท์ที่ต้องการฝึกฝน</p>
          <div style="display: flex; background: #E2E8F0; border-radius: 12px; padding: 4px; gap: 4px;">
            <button onclick="setVocabWordCount(10)" id="btnVocabCount10" class="vocab-count-btn active-count" style="flex: 1; border: none; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit;">10 คำ</button>
            <button onclick="setVocabWordCount(20)" id="btnVocabCount20" class="vocab-count-btn" style="flex: 1; border: none; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit;">20 คำ</button>
            <button onclick="setVocabWordCount(30)" id="btnVocabCount30" class="vocab-count-btn" style="flex: 1; border: none; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit;">30 คำ</button>
          </div>
        </div>

        <p style="font-size: 13px; color: #64748B; font-weight: 600; margin-bottom: 16px; text-align: left;">เลือกความยากของคำศัพท์ภาษาอังกฤษ (CEFR)</p>
        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 260px; overflow-y: auto; padding-right: 4px;">
          <button onclick="startVocabSession('A1')" class="vocab-lvl-btn">
            <span style="font-size: 24px; padding: 8px; background: #ECFDF5; border-radius: 12px; color: #22C55E; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">🌱</span>
            <div style="flex: 1;">
              <div style="font-weight: 800; color: #1E293B; font-size: 14px;">A1 — เบื้องต้น</div>
              <div style="font-size: 11px; color: #64748B; font-weight: 500;">คำศัพท์พื้นฐานที่ใช้ในชีวิตประจำวัน</div>
            </div>
            <span style="background: #F1F5F9; color: #475569; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 10px; white-space: nowrap;">600 คำ</span>
          </button>
          <button onclick="startVocabSession('A2')" class="vocab-lvl-btn">
            <span style="font-size: 24px; padding: 8px; background: #EFF6FF; border-radius: 12px; color: #3B82F6; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">📗</span>
            <div style="flex: 1;">
              <div style="font-weight: 800; color: #1E293B; font-size: 14px;">A2 — ก่อนกลาง</div>
              <div style="font-size: 11px; color: #64748B; font-weight: 500;">คำศัพท์ที่ใช้สื่อสารทั่วไป</div>
            </div>
            <span style="background: #F1F5F9; color: #475569; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 10px; white-space: nowrap;">600 คำ</span>
          </button>
          <button onclick="startVocabSession('B1')" class="vocab-lvl-btn">
            <span style="font-size: 24px; padding: 8px; background: #FFFBEB; border-radius: 12px; color: #F59E0B; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">📘</span>
            <div style="flex: 1;">
              <div style="font-weight: 800; color: #1E293B; font-size: 14px;">B1 — กลาง</div>
              <div style="font-size: 11px; color: #64748B; font-weight: 500;">คำศัพท์เชิงวิชาการและธุรกิจ</div>
            </div>
            <span style="background: #F1F5F9; color: #475569; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 10px; white-space: nowrap;">600 คำ</span>
          </button>
          <button onclick="startVocabSession('B2')" class="vocab-lvl-btn">
            <span style="font-size: 24px; padding: 8px; background: #FEF2F2; border-radius: 12px; color: #EF4444; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">📕</span>
            <div style="flex: 1;">
              <div style="font-weight: 800; color: #1E293B; font-size: 14px;">B2 — สูงกว่ากลาง</div>
              <div style="font-size: 11px; color: #64748B; font-weight: 500;">คำศัพท์ขั้นสูงสำหรับข้อสอบ</div>
            </div>
            <span style="background: #F1F5F9; color: #475569; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 10px; white-space: nowrap;">600 คำ</span>
          </button>
          <button onclick="startVocabSession('C1')" class="vocab-lvl-btn">
            <span style="font-size: 24px; padding: 8px; background: #F5F3FF; border-radius: 12px; color: #8B5CF6; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">🎓</span>
            <div style="flex: 1;">
              <div style="font-weight: 800; color: #1E293B; font-size: 14px;">C1 — ขั้นสูง</div>
              <div style="font-size: 11px; color: #64748B; font-weight: 500;">คำศัพท์ระดับผู้เชี่ยวชาญ</div>
            </div>
            <span style="background: #F1F5F9; color: #475569; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 10px; white-space: nowrap;">600 คำ</span>
          </button>
        </div>
      </div>

      <!-- Gameplay Section -->
      <div id="vocabGameplaySection" style="display: none;">
        <!-- Stats row -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; background: white; padding: 14px 10px; border-radius: 16px; border: 1px solid #E2E8F0; margin-bottom: 20px; box-shadow: var(--shadow-sm);">
          <div style="text-align: center;">
            <p id="vocabGameScore" style="font-size: 18px; font-weight: 800; color: #BD1B0B; margin: 0;">0</p>
            <p style="font-size: 10px; color: #94A3B8; margin: 2px 0 0 0; font-weight: 600;">ทำถูก</p>
          </div>
          <div style="text-align: center; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
            <p id="vocabGameStreak" style="font-size: 18px; font-weight: 800; color: #D97706; margin: 0;">0 🔥</p>
            <p style="font-size: 10px; color: #94A3B8; margin: 2px 0 0 0; font-weight: 600;">Streak</p>
          </div>
          <div style="text-align: center;">
            <p id="vocabGameCount" style="font-size: 18px; font-weight: 800; color: #1E293B; margin: 0;">1/5</p>
            <p style="font-size: 10px; color: #94A3B8; margin: 2px 0 0 0; font-weight: 600;">คำศัพท์ที่ทำ</p>
          </div>
        </div>

        <!-- Word display card -->
        <div id="vocabWordCard" style="background: white; border-radius: 20px; border: 2px solid #E2E8F0; padding: 32px 16px; margin-bottom: 20px; transition: all 0.2s; position: relative;">
          <div id="vocabStreakAlert" style="display: none; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #F59E0B; color: white; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; box-shadow: var(--shadow-sm); animation: bounce 1s infinite;">
            🔥 <span id="vocabStreakCount">0</span> STREAK!
          </div>
          <p id="lblVocabWord" style="font-size: 32px; font-weight: 900; color: #1E293B; margin: 0 0 6px 0; letter-spacing: -0.5px;"></p>
          <p style="font-size: 12px; color: #94A3B8; margin: 0; font-weight: 500;">เลือกคำแปลภาษาไทยที่ถูกต้อง</p>
          
          <!-- Feedback placeholder -->
          <div id="vocabFeedbackMessage" style="margin-top: 14px; font-size: 13px; font-weight: 700; display: none;"></div>
        </div>

        <!-- Choices 2x2 grid -->
        <div id="vocabChoicesGrid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
          <!-- Dynamic options -->
        </div>
      </div>

      <!-- Summary Section -->
      <div id="vocabSummarySection" style="display: none; text-align: left; margin-top: 10px;">
        <h3 style="font-size: 16px; font-weight: 800; color: #1E293B; margin: 0 0 4px 0; text-align: center;">📊 สรุปผลการฝึกฝน</h3>
        <p style="font-size: 12px; color: #64748B; margin: 0 0 16px 0; text-align: center;" id="lblVocabSummaryMeta">ระดับ A2 | 10 คำ</p>
        
        <div style="background: white; border-radius: 16px; border: 1px solid #E2E8F0; padding: 16px; margin-bottom: 20px; box-shadow: var(--shadow-sm); display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: center;">
          <div>
            <span style="font-size: 20px; font-weight: 800; color: #BD1B0B;" id="vocabSummaryScore">0</span>
            <p style="font-size: 10px; color: #94A3B8; margin: 2px 0 0 0; font-weight: 600;">ทำถูก</p>
          </div>
          <div>
            <span style="font-size: 20px; font-weight: 800; color: #10B981;" id="vocabSummaryAccuracy">0%</span>
            <p style="font-size: 10px; color: #94A3B8; margin: 2px 0 0 0; font-weight: 600;">ความถูกต้อง</p>
          </div>
        </div>

        <div id="vocabWrongAnswersContainer" style="display: block; margin-bottom: 20px;">
          <p style="font-size: 12px; color: #E11D48; font-weight: 700; margin-bottom: 8px;">❌ คำศัพท์ที่ตอบผิด:</p>
          <div id="vocabWrongAnswersList" style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
            <!-- Wrong answers list -->
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 15px;">
          <button onclick="openVocabArena()" style="flex: 1; padding: 12px; border-radius: 14px; border: none; background: #BD1B0B; color: white; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit;">เล่นอีกครั้ง</button>
          <button onclick="closeVocabArena()" style="flex: 1; padding: 12px; border-radius: 14px; border: 1px solid #E2E8F0; background: white; color: #475569; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit;">ปิด</button>
        </div>
      </div>
    </div>
  </div>


  <!-- Image Crop Modal -->
  <div id="cropModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.85); z-index: 2000; align-items: center; justify-content: center;">
    <div style="background: white; border-radius: 20px; width: 90%; max-width: 500px; padding: 20px; text-align: center;">
      <h3 style="margin-top: 0; color: #1E293B; font-weight: 700;">ครอบตัดรูปโปรไฟล์</h3>
      <div style="width: 100%; max-height: 400px; margin-bottom: 20px; overflow: hidden; background: #f8fafc; border-radius: 10px;">
        <img id="imageToCrop" src="" style="max-width: 100%; display: block;" alt="Image to crop">
      </div>
      <div style="display: flex; gap: 10px;">
        <button onclick="confirmCrop()" style="flex: 1; padding: 12px; border-radius: 10px; background: #10B981; color: white; border: none; font-weight: 700; cursor: pointer;">ยืนยัน</button>
        <button onclick="cancelCrop()" style="flex: 1; padding: 12px; border-radius: 10px; background: #EF4444; color: white; border: none; font-weight: 700; cursor: pointer;">ยกเลิก</button>
      </div>
    </div>
  </div>


</body>
</html>

\\n
## File: home\js\app.js

\\n// ==========================================
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
  switchCommunitySubtab('chat');

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
  const btnSubtabChat = document.getElementById('btnSubtabChat');
  const btnSubtabGroups = document.getElementById('btnSubtabGroups');
  const btnSubtabFriends = document.getElementById('btnSubtabFriends');

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
  
  const btnSubtabChat = document.getElementById('btnSubtabChat');
  const btnSubtabGroups = document.getElementById('btnSubtabGroups');
  const btnSubtabFriends = document.getElementById('btnSubtabFriends');

  const contentChat = document.getElementById('subtabContentChat');
  const contentGroups = document.getElementById('subtabContentGroups');
  const contentFriends = document.getElementById('subtabContentFriends');

  // Toggle active class on buttons
  if (btnSubtabChat) btnSubtabChat.classList.toggle('active', tab === 'chat');
  if (btnSubtabGroups) btnSubtabGroups.classList.toggle('active', tab === 'groups');
  if (btnSubtabFriends) btnSubtabFriends.classList.toggle('active', tab === 'friends');

  // Toggle active class on content panels
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

\\n
## File: index.html

\\n<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POLICE EXAM - เตรียมพร้อมสู่เครื่องแบบ</title>
  <!-- Google Fonts: Kanit -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- Stylesheet -->
  <link rel="stylesheet" href="css/style.css">
  <!-- Google Identity Services SDK -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <!-- External Application Script -->
  <script src="js/app.js" defer></script>
</head>
<body>

  <!-- Navigation Bar -->
  <header class="navbar">
    <div class="nav-container">
      <a href="#" class="logo">
        <!-- Red Shield Icon -->
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#BD1B0B" stroke="#BD1B0B" stroke-width="2" stroke-linejoin="round"/>
          <path d="M9 11L11 13L15 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">POLICE<span class="logo-highlight">EXAM</span></span>
      </a>
      
      <!-- Hamburger Menu for Mobile -->
      <button class="menu-toggle" id="menuToggle" aria-label="Toggle Navigation Menu">
        <svg class="hamburger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" y1="6" x2="20" y2="6" stroke-linecap="round"/>
          <line x1="4" y1="12" x2="20" y2="12" stroke-linecap="round"/>
          <line x1="4" y1="18" x2="20" y2="18" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Nav Links & Auth States -->
      <nav class="nav-menu" id="navMenu">
        <!-- Default State: Log In & Register Links -->
        <div class="nav-auth-links" id="navAuthLinks">
          <a href="#" class="nav-link open-login-btn">เข้าสู่ระบบ</a>
          <a href="#" class="btn-register open-register-btn">สมัครสมาชิก</a>
        </div>
        
        <!-- Authenticated State: Profile Details -->
        <div class="nav-profile-container" id="navProfile" style="display: none;">
          <img src="" alt="User Avatar" class="user-avatar" id="userAvatar">
          <span class="user-name" id="userName"></span>
          <button class="btn-logout" id="btnLogout">ออกจากระบบ</button>
        </div>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="container hero-container">
      
      <!-- AI Powered Badge -->
      <div class="gemini-badge">
        <svg class="sparkle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3V6M12 18V21M3 12H6M18 12H21M5.63604 5.63604L7.75736 7.75736M16.2426 16.2426L18.364 18.364M18.364 5.63604L16.2426 7.75736M7.75736 16.2426L5.63604 18.364M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" stroke="#BD1B0B" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>ขับเคลื่อนด้วย Gemini AI</span>
      </div>

      <!-- Main Heading -->
      <h1 class="hero-title">
        เตรียมพร้อม<br>
        <span class="text-primary">สู่เครื่องแบบ</span>
      </h1>

      <!-- Hero Subtitle -->
      <p class="hero-subtitle">
        แพลตฟอร์มเตรียมสอบนายสิบตำรวจที่ครบวงจร ข้อสอบกว่า 50,000 ข้อ AI วิเคราะห์จุดอ่อน และ Battle Arena
      </p>

      <!-- CTA Buttons -->
      <div class="hero-actions">
        <a href="#" class="btn btn-primary open-register-btn">
          <span>เริ่มต้นฟรี</span>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12" stroke-linecap="round"/>
            <polyline points="12 5 19 12 12 19" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <a href="#" class="btn btn-secondary open-login-btn">เข้าสู่ระบบ</a>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">15K+</span>
          <span class="stat-label">ผู้ใช้งาน</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">50K+</span>
          <span class="stat-label">ข้อสอบ</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">92%</span>
          <span class="stat-label">ผ่านสอบ</span>
        </div>
      </div>

    </div>
  </section>

  <!-- Features Grid Section -->
  <section class="features-section">
    <div class="container">
      <h2 class="section-title">ฟีเจอร์ครบครัน</h2>
      
      <div class="features-grid">
        <!-- Feature 1: AI สร้างข้อสอบ -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <!-- Brain Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M12 6v12M8 10h8M9 14h6"/>
            </svg>
          </div>
          <h3 class="feature-name">AI สร้างข้อสอบ</h3>
        </div>

        <!-- Feature 2: วิเคราะห์จุดอ่อน -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <!-- Target Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <h3 class="feature-name">วิเคราะห์จุดอ่อน</h3>
        </div>

        <!-- Feature 3: Battle Arena -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <!-- Sword Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
              <line x1="13" y1="19" x2="19" y2="13"/>
              <line x1="16" y1="20" x2="20" y2="16"/>
              <line x1="19" y1="21" x2="21" y2="19"/>
            </svg>
          </div>
          <h3 class="feature-name">Battle Arena</h3>
        </div>

        <!-- Feature 4: Vocab Arena -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <!-- Speaker Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </div>
          <h3 class="feature-name">Vocab Arena</h3>
        </div>

        <!-- Feature 5: Bookmark -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <!-- Bookmark Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 class="feature-name">Bookmark</h3>
        </div>

        <!-- Feature 6: Leaderboard -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <!-- Trophy Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
              <path d="M12 2a4 4 0 0 1 4 4v7c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1V6a4 4 0 0 1 4-4z"/>
            </svg>
          </div>
          <h3 class="feature-name">Leaderboard</h3>
        </div>
      </div>
    </div>
  </section>

  <!-- Announcements Section -->
  <section class="announcements-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">ประกาศล่าสุด</h2>
        <a href="#" class="view-all-link">
          <span>ทั้งหมด</span>
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
      </div>

      <div class="announcement-list" id="announcementList">
        <!-- Announcements will be loaded from database via API -->
        <div class="announcement-loading" style="text-align:center;padding:32px;color:#64748B;font-size:14px;">
          กำลังโหลดข้อมูลประกาศ...
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================
       Log In Modal (เข้าสู่ระบบ)
       ========================================== -->
  <div class="modal-overlay" id="loginModal">
    <div class="modal-card">
      <button class="modal-close" id="closeLogin" aria-label="ปิด">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <div class="modal-header">
        <div class="modal-logo-wrapper">
          <!-- Red Shield Outline on red box -->
          <svg class="modal-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="modal-title">เข้าสู่ระบบ</h2>
        <p class="modal-subtitle">ยินดีต้อนรับกลับมา</p>
      </div>

      <form class="modal-form" id="loginForm">
        <div class="form-group">
          <label class="form-label">อีเมล</label>
          <input type="email" class="form-input-field" placeholder="example@email.com" required>
        </div>
        
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">รหัสผ่าน</label>
            <a href="#" class="forgot-password-link" onclick="alert('ฟีเจอร์กู้คืนรหัสผ่านจะพร้อมใช้งานเร็วๆ นี้');">ลืมรหัสผ่าน?</a>
          </div>
          <input type="password" class="form-input-field" placeholder="........" required>
        </div>

        <button type="submit" class="btn-modal-submit">เข้าสู่ระบบ</button>
      </form>

      <div class="modal-or-divider">
        <span>หรือ</span>
      </div>

      <div id="googleSignInButtonLogin" class="google-signin-container" style="display: flex; justify-content: center; margin-top: 8px;"></div>

      <div class="modal-footer-text">
        ยังไม่มีบัญชี? <a href="#" class="red-link" id="linkToRegister">สมัครสมาชิก</a>
      </div>
    </div>
  </div>

  <!-- ==========================================
       Register Modal (สมัครสมาชิก)
       ========================================== -->
  <div class="modal-overlay" id="registerModal">
    <div class="modal-card">
      <button class="modal-close" id="closeRegister" aria-label="ปิด">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <div class="modal-header">
        <div class="modal-logo-wrapper">
          <!-- Red Shield Outline on red box -->
          <svg class="modal-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="modal-title">สมัครสมาชิก</h2>
        <p class="modal-subtitle">เริ่มต้นเตรียมสอบ ฟรี!</p>
      </div>

      <form class="modal-form" id="registerForm">
        <!-- Multi-column First/Last Name -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">ชื่อ</label>
            <input type="text" class="form-input-field" placeholder="สมชาย" required>
          </div>
          <div class="form-group">
            <label class="form-label">นามสกุล</label>
            <input type="text" class="form-input-field" placeholder="ใจดี" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">อีเมล</label>
          <input type="email" class="form-input-field" placeholder="example@email.com" required>
        </div>

        <div class="form-group">
          <label class="form-label">เบอร์โทรศัพท์</label>
          <input type="tel" class="form-input-field" placeholder="08X-XXX-XXXX" required>
        </div>

        <div class="form-group">
          <label class="form-label">รหัสผ่าน</label>
          <input type="password" class="form-input-field" placeholder="อย่างน้อย 8 ตัวอักษร" required minlength="8">
        </div>

        <div class="form-group">
          <label class="form-label">ยืนยันรหัสผ่าน</label>
          <input type="password" class="form-input-field" placeholder="........" required minlength="8">
        </div>

        <!-- Checkbox with styled terms link -->
        <div class="form-group-checkbox">
          <input type="checkbox" id="termsCheck" required>
          <label for="termsCheck" class="checkbox-label">
            ฉันยอมรับ <a href="#" class="red-link" onclick="alert('ข้อกำหนดการใช้งาน'); event.stopPropagation();">ข้อกำหนดการใช้งาน</a> และ <a href="#" class="red-link" onclick="alert('นโยบายความเป็นส่วนตัว'); event.stopPropagation();">นโยบายความเป็นส่วนตัว</a>
          </label>
        </div>

        <button type="submit" class="btn-modal-submit">สมัครสมาชิก</button>
      </form>

      <div class="modal-or-divider">
        <span>หรือ</span>
      </div>

      <div id="googleSignInButtonRegister" class="google-signin-container" style="display: flex; justify-content: center; margin-top: 8px;"></div>

      <div class="modal-footer-text">
        มีบัญชีแล้ว? <a href="#" class="red-link" id="linkToLogin">เข้าสู่ระบบ</a>
      </div>
    </div>
  </div>

</body>
</html>

\\n
## File: js\app.js

\\n// ==========================================
// Configuration
// ==========================================
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000' 
  : 'https://police-exam-t090.onrender.com';

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
    window.location.href = 'home/index.html';

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
const FALLBACK_GOOGLE_CLIENT_ID = '848275108419-q0171b1bmm4l29lp9blgpin3fl4p1fnh.apps.googleusercontent.com';
let googleClientId = FALLBACK_GOOGLE_CLIENT_ID;

window.addEventListener('DOMContentLoaded', () => {
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
});

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

    sessionStorage.setItem('authToken', data.token);
    sessionStorage.setItem('userProfile', JSON.stringify(data.user));

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

\\n
## File: package.json

\\n{
  "name": "police-exam-root",
  "version": "1.0.0",
  "description": "Root package proxy for Render deployment",
  "main": "server/index.js",
  "scripts": {
    "build": "cd server && npm install && npx prisma generate && cd .. && node build-frontend.js",
    "start": "cd server && npm start"
  },
  "dependencies": {}
}

\\n
## File: render.yaml

\\nservices:
  # 1. Backend Web Service (Express + Prisma)
  - type: web
    name: police-exam-backend
    runtime: node
    buildCommand: "cd server && npm install && npx prisma generate"
    startCommand: "cd server && npm start"
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: DIRECT_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: PORT
        value: 3000
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASS
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false

  # 2. Frontend Static Site
  - type: web
    name: police-exam-frontend
    runtime: static
    buildCommand: "" # No build command required for pure static HTML/CSS/JS files
    publishPath: "." # Publish the root directory containing /landing and /home

\\n
## File: server\.env

\\n# Database Connection (PgBouncer Transaction Mode)
DATABASE_URL="postgresql://postgres.fwigijxqyabcnblnqkec:Natse2005%40A4@52.74.252.201:6543/postgres?pgbouncer=true"

# Database Connection (Direct / Session Mode)
DIRECT_URL="postgresql://postgres.fwigijxqyabcnblnqkec:Natse2005%40A4@52.74.252.201:5432/postgres"

# JWT Secret
JWT_SECRET="police_exam_jwt_secret_key_2026_secure"

# API Server Port
API_PORT=3000

# Google Authentication Client ID
GOOGLE_CLIENT_ID="848275108419-q0171b1bmm4l29lp9blgpin3fl4p1fnh.apps.googleusercontent.com"

\\n
## File: server\check_admin_syntax.js

\\nimport fs from 'fs';
import { Parser } from 'acorn';

const html = fs.readFileSync('../admin-dashboard/index.html', 'utf8');

// Find all script blocks
let idx = 0;
let count = 0;
while (true) {
  idx = html.indexOf('<script', idx);
  if (idx === -1) break;
  const startTagEnd = html.indexOf('>', idx) + 1;
  const endTag = html.indexOf('</script>', startTagEnd);
  if (endTag === -1) break;

  const scriptContent = html.substring(startTagEnd, endTag);
  const isModule = html.substring(idx, startTagEnd).includes('type="module"');
  const src = html.substring(idx, startTagEnd).match(/src="([^"]+)"/);

  if (!src) {
    console.log(`Script block ${count} (start index ${startTagEnd}):`);
    try {
      Parser.parse(scriptContent, {
        ecmaVersion: 'latest',
        sourceType: isModule ? 'module' : 'script'
      });
      console.log('-> Syntax OK!');
    } catch (err) {
      console.error('-> Syntax ERROR:', err.message);
      const lineNum = scriptContent.substring(0, err.pos).split('\n').length;
      console.error(`Error line: ${lineNum}`);
      const lines = scriptContent.split('\n');
      console.error(lines.slice(Math.max(0, lineNum - 5), Math.min(lines.length, lineNum + 5)).join('\n'));
      process.exit(1);
    }
  }

  idx = endTag + 9;
  count++;
}

\\n
## File: server\clear-db-custom.js

\\nimport { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function run() {
  try {
    console.log('--- Database Reset Starting ---');

    // 1. Delete all dependent tables to avoid constraint violations
    console.log('Deleting incorrect questions...');
    await prisma.incorrectQuestion.deleteMany();

    console.log('Deleting vocab records...');
    await prisma.vocabRecord.deleteMany();

    console.log('Deleting premium requests...');
    await prisma.premiumRequest.deleteMany();

    console.log('Deleting stage progress...');
    await prisma.userStageProgress.deleteMany();

    console.log('Deleting password resets...');
    await prisma.passwordReset.deleteMany();

    console.log('Deleting questions...');
    await prisma.question.deleteMany();

    console.log('Deleting exam sets...');
    await prisma.examSet.deleteMany();

    // 2. Delete all users except 'Roblox_manface'
    console.log('Deleting all users except Roblox_manface...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        username: {
          not: 'Roblox_manface'
        }
      }
    });
    console.log(`Deleted ${deletedUsers.count} users.`);

    // 3. Check if Roblox_manface exists, if not, create it
    let robloxUser = await prisma.user.findUnique({
      where: { username: 'Roblox_manface' }
    });
    if (!robloxUser) {
      console.log('Roblox_manface not found, creating it...');
      const robloxHash = await bcrypt.hash('123456', 10);
      robloxUser = await prisma.user.create({
        data: {
          username: 'Roblox_manface',
          email: 'roblox@example.com',
          password: robloxHash,
          fullName: 'Roblox Manface',
          role: 'USER',
          emailVerified: true
        }
      });
      console.log('Created Roblox_manface user.');
    }

    // 4. Create new Admin user
    console.log('Creating Admin user...');
    const adminHash = await bcrypt.hash('Natse2005', 10);
    const adminUser = await prisma.user.create({
      data: {
        username: 'Admin',
        email: 'admin@example.com',
        password: adminHash,
        fullName: 'Admin System',
        role: 'ADMIN',
        emailVerified: true
      }
    });
    console.log('Created Admin user successfully.');

    console.log('--- Database Reset Completed Successfully ---');
  } catch (err) {
    console.error('Error resetting database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();

\\n
## File: server\clear-exams.js

\\nimport { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('กำลังลบข้อสอบและชุดข้อสอบทั้งหมดในระบบ...');
    
    // Delete all questions
    const deletedQuestions = await prisma.question.deleteMany({});
    console.log(`- ลบข้อถามทั้งหมดเรียบร้อยแล้ว: ${deletedQuestions.count} ข้อ`);
    
    // Delete all exam sets
    const deletedExams = await prisma.examSet.deleteMany({});
    console.log(`- ลบชุดข้อสอบทั้งหมดเรียบร้อยแล้ว: ${deletedExams.count} ชุด`);
    
    console.log('✨ ลบข้อสอบเดโม่และข้อสอบเดิมในระบบทั้งหมดสำเร็จ!');
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

\\n
## File: server\clear-users.js

\\nimport { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
  // Delete in correct order to respect foreign keys
  console.log('Deleting incorrect questions...');
  await p.incorrectQuestion.deleteMany();
  
  console.log('Deleting questions...');
  await p.question.deleteMany();
  
  console.log('Deleting exam sets...');
  await p.examSet.deleteMany();
  
  console.log('Deleting vocab records...');
  await p.vocabRecord.deleteMany();
  
  console.log('Deleting premium requests...');
  await p.premiumRequest.deleteMany();
  
  console.log('Deleting stage progress...');
  await p.userStageProgress.deleteMany();
  
  console.log('Deleting password resets...');
  await p.passwordReset.deleteMany();
  
  console.log('Deleting users...');
  const u = await p.user.deleteMany();
  console.log('✅ Deleted', u.count, 'users and ALL related data');
  
  await p.$disconnect();
}

run();

\\n
## File: server\clear_stats.js

\\nimport { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find user MIN2909
  const user = await prisma.user.findUnique({
    where: { username: 'MIN2909' }
  });

  if (!user) {
    console.log('User MIN2909 not found');
    return;
  }

  console.log(`Found user: ${user.username} (ID: ${user.id})`);

  // Delete UserStageProgress records for this user
  const deleteProgress = await prisma.userStageProgress.deleteMany({
    where: { userId: user.id }
  });

  console.log(`Successfully deleted ${deleteProgress.count} stage progress stats/records for user MIN2909.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

\\n
## File: server\delete-demo.js

\\nimport { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting deletion of demo exam data...');

    // 1. Delete all Questions
    const deleteQuestions = await prisma.question.deleteMany({});
    console.log(`Deleted ${deleteQuestions.count} questions.`);

    // 2. Delete all ExamSets
    const deleteExams = await prisma.examSet.deleteMany({});
    console.log(`Deleted ${deleteExams.count} exam sets.`);

    // 3. Reset user stage progress
    const deleteProgress = await prisma.userStageProgress.deleteMany({});
    console.log(`Deleted ${deleteProgress.count} user stage progress entries.`);

    console.log('Successfully cleared all demo/mock exam data from database!');
  } catch (error) {
    console.error('Error deleting demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

\\n
## File: server\delete-user.js

\\nimport { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const username = process.argv[2];

if (!username) {
  console.log('กรุณาระบุ username เช่น: node server/delete-user.js myusername');
  process.exit(1);
}

async function main() {
  try {
    const user = await prisma.user.delete({
      where: { username: username },
    });
    console.log(`ลบผู้ใช้ ${user.username} ออกจากฐานข้อมูลเรียบร้อยแล้ว!`);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบผู้ใช้:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

\\n
## File: server\generate-pptx.js

\\nimport pptxgen from 'pptxgenjs';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Define theme colors (Light Red UI/UX Theme matching the dashboard)
const bgLight = 'F8FAFC';       // Soft slate background
const bgCard = 'FFFFFF';        // Pure white card background
const borderLight = 'E2E8F0';   // Thin border color
const accentRed = 'C21807';     // Primary Crimson Red
const softRed = 'FFE3E3';       // Soft red background accent
const textDark = '1E293B';      // Dark Slate for headings
const textMuted = '475569';     // Medium Slate for body text
const textLight = 'FFFFFF';     // White text

// 1. MASTER SLIDE / DEFAULT TEMPLATE
pptx.defineSlideMaster({
  title: 'LIGHT_THEME',
  background: { color: bgLight },
  slideNumber: { x: '90%', y: '93%', fontFace: 'Tahoma', fontSize: 9, color: textMuted }
});

// Helper: Add common header to standard content slides
function addSlideHeader(slide, category, title) {
  // Category Label (Uppercase, red, small font)
  slide.addText(category.toUpperCase(), {
    x: 0.6,
    y: 0.4,
    w: 8.8,
    h: 0.3,
    fontSize: 9,
    fontFace: 'Tahoma',
    bold: true,
    color: accentRed,
    charSpacing: 1
  });

  // Slide Title (Slate-900, Tahoma, large bold)
  slide.addText(title, {
    x: 0.6,
    y: 0.65,
    w: 8.8,
    h: 0.5,
    fontSize: 20,
    fontFace: 'Tahoma',
    bold: true,
    color: textDark
  });

  // Underline bar (Crimson accent)
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6,
    y: 1.15,
    w: 0.8,
    h: 0.04,
    fill: { color: accentRed },
    line: { color: accentRed, width: 1 }
  });
}

// ==================== SLIDE 1: หน้าแรก (Title Slide) ====================
{
  const slide = pptx.addSlide({ masterName: 'LIGHT_THEME' });

  // Right-side red decorative triangle/polygon gradient effect
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 8.5,
    y: 0,
    w: 1.5,
    h: 5.625,
    fill: { color: 'FEE2E2' }, // Soft red decorative bar
    line: { color: 'FEE2E2', width: 1 }
  });

  // Vertical border accent
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 8.45,
    y: 0,
    w: 0.05,
    h: 5.625,
    fill: { color: accentRed },
    line: { color: accentRed, width: 1 }
  });

  // Project Tag
  slide.addText('✨ โครงการเตรียมตัวสอบข้าราชการตำรวจ', {
    x: 0.8,
    y: 1.3,
    w: 7.0,
    h: 0.4,
    fontSize: 10,
    fontFace: 'Tahoma',
    bold: true,
    color: accentRed,
    fill: { color: 'FFF5F5' },
    align: 'left',
    margin: [6, 12, 6, 12]
  });

  // Main Title
  slide.addText('แอปพลิเคชัน\nเตรียมสอบนายสิบตำรวจ', {
    x: 0.8,
    y: 1.8,
    w: 7.0,
    h: 1.4,
    fontSize: 34,
    fontFace: 'Tahoma',
    bold: true,
    color: textDark,
    lineSpacing: 40
  });

  // Description
  slide.addText('ระบบช่วยทำข้อสอบเสมือนจริง วิเคราะห์สถิติจุดอ่อนเพื่อเตรียมความพร้อมสู่สนามสอบตำรวจยุคใหม่ ด้วยระบบคลังข้อสอบและตัวควบคุมจำลองเวลาสมบูรณ์แบบ', {
    x: 0.8,
    y: 3.3,
    w: 6.8,
    h: 0.7,
    fontSize: 11,
    fontFace: 'Tahoma',
    color: textMuted,
    lineSpacing: 16
  });

  // Divider Line
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 4.2,
    w: 6.8,
    fill: { color: 'E2E8F0' },
    line: { color: 'E2E8F0', width: 1 }
  });

  // Author details (Styled like a clean widget)
  slide.addText('ผู้พัฒนาโครงการ: นายณัฐพงษ์ เสนาจันทร์\nอาจารย์ที่ปรึกษา: อาจารย์ ดร.ทศพร จูฉิม', {
    x: 0.8,
    y: 4.35,
    w: 5.0,
    h: 0.6,
    fontSize: 9.5,
    fontFace: 'Tahoma',
    color: textMuted,
    bold: true,
    lineSpacing: 14
  });
}

// ==================== SLIDE 2: ที่มาและความสำคัญ (Grid Layout) ====================
{
  const slide = pptx.addSlide({ masterName: 'LIGHT_THEME' });
  addSlideHeader(slide, 'Background & Rationale', 'ที่มาและความสำคัญ');

  // Define 2x2 grid of cards
  const cardData = [
    {
      icon: '👮',
      title: 'ผู้พัฒนาเป็นผู้เตรียมสอบจริง',
      desc: 'เนื่องจากเป็นผู้ที่กำลังอ่านหนังสือเตรียมสอบข้าราชการตำรวจด้วยตนเอง จึงเข้าใจความต้องการอย่างชัดเจน'
    },
    {
      icon: '💸',
      title: 'ข้อสอบมีราคาแพงและหาซื้อยาก',
      desc: 'หนังสือข้อสอบย้อนหลังที่มีการอธิบายเฉลยที่ถูกต้องค่อนข้างหาได้ยากตามร้านทั่วไป และมีราคาเล่มที่สูงมาก'
    },
    {
      icon: '📂',
      title: 'คลังข้อสอบฟรีไม่เป็นระบบ',
      desc: 'แหล่งข้อสอบแจกฟรีบนอินเทอร์เน็ตส่วนใหญ่จะกระจัดกระจาย ไม่แบ่งหมวดหมู่วิชา ขาดความต่อเนื่อง และไม่มีระบบประเมินผล'
    },
    {
      icon: '💳',
      title: 'ค่าบริการจำลองสอบค่อนข้างสูง',
      desc: 'การลงทะเบียนจำลองสอบออนไลน์ของสถาบันกวดวิชา มักมีค่าธรรมเนียมรายครั้งที่ค่อนข้างสูงและซ้ำซ้อน'
    }
  ];

  const colWidth = 4.15;
  const colHeight = 1.6;
  const positions = [
    { x: 0.6, y: 1.5 },
    { x: 4.95, y: 1.5 },
    { x: 0.6, y: 3.3 },
    { x: 4.95, y: 3.3 }
  ];

  cardData.forEach((data, index) => {
    const pos = positions[index];

    // Card background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: pos.x,
      y: pos.y,
      w: colWidth,
      h: colHeight,
      fill: { color: bgCard },
      line: { color: borderLight, width: 1 },
      radius: 0.1
    });

    // Icon Circle
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: pos.x + 0.2,
      y: pos.y + 0.2,
      w: 0.6,
      h: 0.6,
      fill: { color: 'FFF5F5' },
      line: { color: 'FFC9C9', width: 1 },
      radius: 0.15
    });

    // Icon emoji
    slide.addText(data.icon, {
      x: pos.x + 0.2,
      y: pos.y + 0.2,
      w: 0.6,
      h: 0.6,
      fontSize: 16,
      align: 'center',
      valign: 'middle'
    });

    // Card Title
    slide.addText(data.title, {
      x: pos.x + 0.95,
      y: pos.y + 0.2,
      w: colWidth - 1.15,
      h: 0.35,
      fontSize: 11.5,
      fontFace: 'Tahoma',
      bold: true,
      color: textDark
    });

    // Card Description
    slide.addText(data.desc, {
      x: pos.x + 0.95,
      y: pos.y + 0.55,
      w: colWidth - 1.15,
      h: 0.85,
      fontSize: 9,
      fontFace: 'Tahoma',
      color: textMuted,
      lineSpacing: 13
    });
  });
}

// ==================== SLIDE 3: วัตถุประสงค์ของโครงการ (4 Columns) ====================
{
  const slide = pptx.addSlide({ masterName: 'LIGHT_THEME' });
  addSlideHeader(slide, 'Project Objectives', 'วัตถุประสงค์ของโครงการ');

  const colData = [
    {
      icon: '📅',
      accent: accentRed,
      title: 'เตรียมสอบ 29 พ.ย. นี้',
      desc: 'สร้างขึ้นเพื่อช่วยพัฒนาทักษะตนเองสำหรับการสอบตำรวจที่จะถึงในวันที่ 29 พฤศจิกายน 2569 นี้'
    },
    {
      icon: '🎯',
      accent: 'D97706', // Amber-600
      title: 'วิเคราะห์ปิดจุดอ่อน',
      desc: 'บันทึกข้อมูลสถิติเพื่อระบุหัวข้อวิชาที่ทำผิดบ่อยๆ ทำให้สามารถอ่านทบทวนเนื้อหาได้ตรงเป้า'
    },
    {
      icon: '⚡',
      accent: '0284C7', // Sky-600
      title: 'พัฒนาความเร็ว',
      desc: 'จำลองควบคุมเวลาในการทำข้อสอบเสมือนจริง เพื่อฝึกฝนความเร็วและไม่ตื่นเต้นเมื่อลงสนามสอบ'
    },
    {
      icon: '📖',
      accent: '059669', // Emerald-600
      title: 'เสริมทักษะอังกฤษ',
      desc: 'สะสมคลังคำศัพท์ภาษาอังกฤษตามระดับความยากง่าย (Vocab) ช่วยยกระดับคะแนนที่ได้เปรียบ'
    }
  ];

  const w = 2.0;
  const h = 3.3;
  const gap = 0.27;
  const startX = 0.6;
  const startY = 1.6;

  colData.forEach((data, index) => {
    const x = startX + index * (w + gap);

    // Card background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: startY,
      w: w,
      h: h,
      fill: { color: bgCard },
      line: { color: borderLight, width: 1 },
      radius: 0.1
    });

    // Top border colored line (UI/UX indicator)
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x,
      y: startY,
      w: w,
      h: 0.08,
      fill: { color: data.accent },
      line: { color: data.accent, width: 1 }
    });

    // Icon emoji
    slide.addText(data.icon, {
      x: x + 0.2,
      y: startY + 0.3,
      w: 1.6,
      h: 0.5,
      fontSize: 22,
      align: 'left'
    });

    // Card title
    slide.addText(data.title, {
      x: x + 0.2,
      y: startY + 1.0,
      w: w - 0.4,
      h: 0.5,
      fontSize: 12,
      fontFace: 'Tahoma',
      bold: true,
      color: textDark
    });

    // Card body
    slide.addText(data.desc, {
      x: x + 0.2,
      y: startY + 1.6,
      w: w - 0.4,
      h: 1.4,
      fontSize: 8.5,
      fontFace: 'Tahoma',
      color: textMuted,
      lineSpacing: 13
    });
  });
}

// ==================== SLIDE 4: ประโยชน์ที่คาดว่าจะได้รับ (3 Columns) ====================
{
  const slide = pptx.addSlide({ masterName: 'LIGHT_THEME' });
  addSlideHeader(slide, 'Expected Benefits', 'ประโยชน์ที่คาดว่าจะได้รับ');

  const cardData = [
    {
      icon: '💡',
      title: 'วิเคราะห์ปิดจุดอ่อนอัตโนมัติ',
      desc: 'ระบุหัวข้อที่ตอบผิดสะสม แล้วดึง Gemini AI มาสร้างคำถามจำลองขยายความช่วยให้ผู้สอบทำความเข้าใจจุดอ่อนได้ทันทีโดยไม่ต้องคาดเดาด้วยตนเอง'
    },
    {
      icon: '💸',
      title: 'ประหยัดค่าใช้จ่ายการติว',
      desc: 'ทดแทนหนังสือข้อสอบราคาแพง และบริการจำลองสอบรายครั้ง ของสถาบันกวดวิชาด้วยแอปพลิเคชันส่วนตัวที่อัปโหลดและทำได้ฟรีไม่จำกัดจำนวนครั้ง'
    },
    {
      icon: '⚔️',
      title: 'กระตุ้นกระบวนการเรียนรู้',
      desc: 'โหมดต่อสู้แข่งขันทำข้อสอบจับเวลาแบบเรียลไทม์ (Battle Arena) สร้างความสนุกสนานตื่นเต้น และสร้างสมาธิความกดดันให้ชินกับห้องสอบจริง'
    }
  ];

  const w = 2.75;
  const h = 3.3;
  const gap = 0.28;
  const startX = 0.6;
  const startY = 1.6;

  cardData.forEach((data, index) => {
    const x = startX + index * (w + gap);

    // Card background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: startY,
      w: w,
      h: h,
      fill: { color: bgCard },
      line: { color: borderLight, width: 1 },
      radius: 0.1
    });

    // Icon circle
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25,
      y: startY + 0.3,
      w: 0.7,
      h: 0.7,
      fill: { color: 'FFF5F5' },
      line: { color: 'FFC9C9', width: 1 },
      radius: 0.15
    });

    // Icon emoji text
    slide.addText(data.icon, {
      x: x + 0.25,
      y: startY + 0.3,
      w: 0.7,
      h: 0.7,
      fontSize: 18,
      align: 'center',
      valign: 'middle'
    });

    // Card title
    slide.addText(data.title, {
      x: x + 0.25,
      y: startY + 1.2,
      w: w - 0.5,
      h: 0.45,
      fontSize: 12.5,
      fontFace: 'Tahoma',
      bold: true,
      color: textDark
    });

    // Card description
    slide.addText(data.desc, {
      x: x + 0.25,
      y: startY + 1.7,
      w: w - 0.5,
      h: 1.4,
      fontSize: 9,
      fontFace: 'Tahoma',
      color: textMuted,
      lineSpacing: 13
    });
  });
}

// ==================== SLIDE 5: เปรียบเทียบกับซอฟต์แวร์เดิม (Side by Side) ====================
{
  const slide = pptx.addSlide({ masterName: 'LIGHT_THEME' });
  addSlideHeader(slide, 'Competitor Comparison', 'การเปรียบเทียบกับซอฟต์แวร์ในท้องตลาด');

  // Competitor Card (Neutral Slate styling)
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.6,
    y: 1.5,
    w: 4.25,
    h: 3.4,
    fill: { color: bgCard },
    line: { color: borderLight, width: 1 },
    radius: 0.1
  });

  slide.addText('แอปอื่นๆ ในตลาด', {
    x: 3.1,
    y: 1.65,
    w: 1.5,
    h: 0.3,
    fontSize: 8,
    fontFace: 'Tahoma',
    bold: true,
    color: '64748B',
    fill: { color: 'F1F5F9' },
    align: 'center',
    margin: [4, 8, 4, 8]
  });

  slide.addText('📲 แอปพลิเคชันเดิมในตลาด', {
    x: 0.85,
    y: 1.9,
    w: 3.8,
    h: 0.4,
    fontSize: 14,
    fontFace: 'Tahoma',
    bold: true,
    color: '64748B'
  });

  const compList = [
    '❌ มีตัวเลือกน้อย (ส่วนใหญ่มีผู้ทำระบบเพียง 1-2 ราย)',
    '❌ คิดค่าบริการรายปีต่อเนื่องเฉลี่ย 159 บาทขึ้นไป',
    '❌ ปริมาณข้อสอบมีจำกัดและไม่มีระบบขยายคำถามอัตโนมัติ',
    '❌ ขาดฟังก์ชันกระตุ้นและระบบต่อสู้วิเคราะห์จุดอ่อนเฉพาะจุด'
  ];
  slide.addText(compList.join('\n\n'), {
    x: 0.85,
    y: 2.45,
    w: 3.8,
    h: 2.2,
    fontSize: 9.5,
    fontFace: 'Tahoma',
    color: textMuted,
    lineSpacing: 10
  });

  // POLICEEXAM Card (Highly highlighted in soft brand theme)
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.15,
    y: 1.5,
    w: 4.25,
    h: 3.4,
    fill: { color: bgCard },
    line: { color: 'FFC9C9', width: 2 },
    radius: 0.1
  });

  slide.addText('แอปของเรา (POLICEEXAM)', {
    x: 7.2,
    y: 1.65,
    w: 2.0,
    h: 0.3,
    fontSize: 8,
    fontFace: 'Tahoma',
    bold: true,
    color: accentRed,
    fill: { color: 'FFF5F5' },
    align: 'center',
    margin: [4, 8, 4, 8]
  });

  slide.addText('⭐ แอปพลิเคชัน POLICEEXAM', {
    x: 5.4,
    y: 1.9,
    w: 3.8,
    h: 0.4,
    fontSize: 14,
    fontFace: 'Tahoma',
    bold: true,
    color: accentRed
  });

  const ourList = [
    '✅ อัปเดตขยายคำถามต่อเนื่องด้วยปัญญาประดิษฐ์ (Gemini AI API)',
    '✅ ให้บริการใช้งานฟรี ไม่มีระบบสมัครสมาชิกหรือเก็บค่าบริการแฝง',
    '✅ มีวิเคราะห์จุดอ่อน (Weakness Review) โหมด Vocab และ Battle',
    '✅ แยกสิทธิ์ความปลอดภัยหลังบ้าน (Admin, Owner, User) ชัดเจน'
  ];
  slide.addText(ourList.join('\n\n'), {
    x: 5.4,
    y: 2.45,
    w: 3.8,
    h: 2.2,
    fontSize: 9.5,
    fontFace: 'Tahoma',
    color: textDark,
    bold: true,
    lineSpacing: 10
  });
}

// ==================== SLIDE 6: ฟังก์ชันการใช้งานแยกตามสิทธิ์ (3 Roles) ====================
{
  const slide = pptx.addSlide({ masterName: 'LIGHT_THEME' });
  addSlideHeader(slide, 'Functional Requirements', 'ฟังก์ชันระบบแยกตามสิทธิ์การใช้งาน (Roles)');

  const roleData = [
    {
      num: '1',
      accent: accentRed,
      bg: 'FFF5F5',
      border: 'FFC9C9',
      title: 'User (ผู้สมัครสอบทั่วไป)',
      desc: 'ฟังก์ชันสำหรับการเรียนรู้และเก็บสถิติความพร้อม:',
      list: [
        '• ทำข้อสอบเสมือนจริง และข้อสอบประจำวัน',
        '• บันทึกข้อสอบ (Bookmarks) เพื่อมาดูย้อนหลัง',
        '• ตรวจสอบจุดอ่อนสะสมรายวิชา (Weakness)',
        '• โหมดดวลจับคู่แข่งเวลาข้อสอบ (Battle Arena)',
        '• โหมดฝึกสะสมท่องศัพท์ภาษาอังกฤษ (Vocab)'
      ]
    },
    {
      num: '2',
      accent: 'D97706',
      bg: 'FEF3C7',
      border: 'FDE68A',
      title: 'Admin (ผู้ดูแลระบบ)',
      desc: 'ฟังก์ชันสำหรับบริหารความเคลื่อนไหวทั่วไป:',
      list: [
        '• สร้าง แก้ไข และจัดหมวดข่าวสารประกาศสอบ',
        '• ตรวจสอบอนุมัติโพสต์แผงสมัครรับสมัครงาน',
        '• อ่านและรวบรวมฟีดแบ็กและรีวิวจากผู้ใช้',
        '• ตรวจสอบข้อสอบที่ผู้ใช้รายงานความผิดพลาดเข้ามา'
      ]
    },
    {
      num: '3',
      accent: '0284C7',
      bg: 'E0F2FE',
      border: 'BAE6FD',
      title: 'Owner (เจ้าของระบบ)',
      desc: 'ฟังก์ชันการดูแลความปลอดภัยภาพรวมสูงสุด:',
      list: [
        '• ตรวจสอบและอนุมัติหลักฐานสลิปการสมัครพรีเมียม',
        '• เข้าถึงหน้าสถิติตรวจสอบ Logs สรุปความล้มเหลว',
        '• ดำเนินการอัปเดตและปรับปรุงฐานข้อมูลคลังข้อสอบ',
        '• ควบคุมระบบหลังบ้านแอดมิน (Admin Dashboard)'
      ]
    }
  ];

  const w = 2.75;
  const h = 3.3;
  const gap = 0.28;
  const startX = 0.6;
  const startY = 1.6;

  roleData.forEach((data, index) => {
    const x = startX + index * (w + gap);

    // Card background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: startY,
      w: w,
      h: h,
      fill: { color: bgCard },
      line: { color: borderLight, width: 1 },
      radius: 0.1
    });

    // Top role number pill
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2,
      y: startY + 0.2,
      w: 0.5,
      h: 0.5,
      fill: { color: data.bg },
      line: { color: data.border, width: 1 },
      radius: 0.1
    });

    slide.addText(data.num, {
      x: x + 0.2,
      y: startY + 0.2,
      w: 0.5,
      h: 0.5,
      fontSize: 11,
      fontFace: 'Tahoma',
      bold: true,
      color: data.accent,
      align: 'center',
      valign: 'middle'
    });

    // Card title
    slide.addText(data.title, {
      x: x + 0.8,
      y: startY + 0.2,
      w: w - 0.95,
      h: 0.5,
      fontSize: 10.5,
      fontFace: 'Tahoma',
      bold: true,
      color: textDark,
      valign: 'middle'
    });

    // Desc
    slide.addText(data.desc, {
      x: x + 0.2,
      y: startY + 0.85,
      w: w - 0.4,
      h: 0.35,
      fontSize: 8,
      fontFace: 'Tahoma',
      bold: true,
      color: '64748B'
    });

    // Bullet list
    slide.addText(data.list.join('\n'), {
      x: x + 0.2,
      y: startY + 1.25,
      w: w - 0.4,
      h: 1.9,
      fontSize: 8,
      fontFace: 'Tahoma',
      color: textMuted,
      lineSpacing: 10
    });
  });
}

// ==================== SLIDE 7: เทคโนโลยีที่ใช้ (Tech Stack) ====================
{
  const slide = pptx.addSlide({ masterName: 'LIGHT_THEME' });
  addSlideHeader(slide, 'System Architecture & Tech Stack', 'เทคโนโลยีและสถาปัตยกรรมระบบ');

  const techData = [
    {
      icon: '🎨',
      title: 'Frontend Layer',
      desc: 'พัฒนา UI คล่องตัวสูง สไตล์ขาวขอบแดง โหลดเร็วและเบาสบาย',
      tags: ['HTML5 / Vanilla CSS3', 'TailwindCSS / Icons', 'Vite Bundle Tool']
    },
    {
      icon: '⚙️',
      title: 'Backend Layer',
      desc: 'API ควบคุมคำขอของเบราว์เซอร์ การเชื่อมต่อ และจัดการสิทธิ์',
      tags: ['Node.js Runtime', 'Express.js Framework', 'Prisma Schema ORM']
    },
    {
      icon: '🛡️',
      title: 'Database & AI Integration',
      desc: 'เก็บประวัติอย่างมั่นคง และวิเคราะห์ขยายโจทย์ผ่าน AI ล่าสุด',
      tags: ['PostgreSQL DB', 'Gemini AI API', 'RESTful API Concept']
    }
  ];

  const w = 2.75;
  const h = 3.3;
  const gap = 0.28;
  const startX = 0.6;
  const startY = 1.6;

  techData.forEach((data, index) => {
    const x = startX + index * (w + gap);

    // Card background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: startY,
      w: w,
      h: h,
      fill: { color: bgCard },
      line: { color: borderLight, width: 1 },
      radius: 0.1
    });

    // Icon Circle
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.9,
      y: startY + 0.3,
      w: 0.9,
      h: 0.9,
      fill: { color: 'FFF5F5' },
      line: { color: 'FFC9C9', width: 1 },
      radius: 0.22
    });

    slide.addText(data.icon, {
      x: x + 0.9,
      y: startY + 0.3,
      w: 0.9,
      h: 0.9,
      fontSize: 24,
      align: 'center',
      valign: 'middle'
    });

    // Title
    slide.addText(data.title, {
      x: x + 0.2,
      y: startY + 1.35,
      w: w - 0.4,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Tahoma',
      bold: true,
      color: textDark,
      align: 'center'
    });

    // Description
    slide.addText(data.desc, {
      x: x + 0.2,
      y: startY + 1.8,
      w: w - 0.4,
      h: 0.6,
      fontSize: 8.5,
      fontFace: 'Tahoma',
      color: textMuted,
      align: 'center',
      lineSpacing: 13
    });

    // Tags list
    slide.addText(data.tags.map(t => `• ${t}`).join('\n'), {
      x: x + 0.2,
      y: startY + 2.5,
      w: w - 0.4,
      h: 0.7,
      fontSize: 8,
      fontFace: 'Tahoma',
      bold: true,
      color: accentRed,
      align: 'center',
      lineSpacing: 8
    });
  });
}

// ==================== SLIDE 8: ต้นแบบโครงสร้างและรูปภาพระบบจริง (Prototypes) ====================
{
  const slide = pptx.addSlide({ masterName: 'LIGHT_THEME' });
  addSlideHeader(slide, 'Application Prototype', 'ต้นแบบโครงสร้างและหน้าตาแอปพลิเคชัน (Prototypes)');

  const protoData = [
    {
      label: '📱 Dashboard หน้าหลัก',
      title: 'หน้า Dashboard หลัก (ขาวขอบแดง)',
      desc: 'แผงรวบรวมข้อมูลสถิติจุดอ่อนรายวิชา และคลังหัวข้อสอบ'
    },
    {
      label: '⚔️ ลานดวลประลองข้อสอบ',
      title: 'ลานดวลประลองจับคู่ (Battle)',
      desc: 'ระบบต่อสู้เพื่อหาคำตอบแข่งเวลา แสดงหลอดระดับพลังชีวิตของผู้ใช้'
    },
    {
      label: '📝 คลังคำศัพท์อังกฤษ',
      title: 'คลังฝึกจำศัพท์ภาษาอังกฤษ (Vocab)',
      desc: 'ระบบสุ่มคำศัพท์ตามความยากง่ายเพื่อเน้นย้ำวิชาภาษาอังกฤษ'
    }
  ];

  const w = 2.75;
  const h = 3.3;
  const gap = 0.28;
  const startX = 0.6;
  const startY = 1.6;

  protoData.forEach((data, index) => {
    const x = startX + index * (w + gap);

    // Card background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: startY,
      w: w,
      h: h,
      fill: { color: bgCard },
      line: { color: borderLight, width: 1 },
      radius: 0.1
    });

    // Mock image shape
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2,
      y: startY + 0.25,
      w: w - 0.4,
      h: 1.4,
      fill: { color: 'F1F5F9' },
      line: { color: 'CBD5E1', width: 1 },
      radius: 0.08
    });

    // Mock text
    slide.addText(data.label, {
      x: x + 0.2,
      y: startY + 0.25,
      w: w - 0.4,
      h: 1.4,
      fontSize: 10,
      fontFace: 'Tahoma',
      bold: true,
      color: accentRed,
      align: 'center',
      valign: 'middle'
    });

    // Card title
    slide.addText(data.title, {
      x: x + 0.2,
      y: startY + 1.8,
      w: w - 0.4,
      h: 0.4,
      fontSize: 10,
      fontFace: 'Tahoma',
      bold: true,
      color: textDark
    });

    // Card description
    slide.addText(data.desc, {
      x: x + 0.2,
      y: startY + 2.2,
      w: w - 0.4,
      h: 0.9,
      fontSize: 8.5,
      fontFace: 'Tahoma',
      color: textMuted,
      lineSpacing: 13
    });
  });
}

// Generate the PPTX presentation file
pptx.writeFile({ fileName: 'presentation.pptx' })
  .then(fileName => {
    console.log(`Successfully generated PowerPoint slides deck: ${fileName}`);
  })
  .catch(err => {
    console.error('Error generating PowerPoint slides:', err);
  });

\\n
## File: server\import-dbexam.js

\\nimport { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING DBEXAM QUESTION BANK IMPORT ---');
  
  // Find creator admin ID
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    admin = await prisma.user.findFirst();
  }
  const creatorId = admin ? admin.id : 1;
  console.log(`Using creator ID: ${creatorId}`);

  const qbDir = 'c:\\Users\\minam\\.gemini\\antigravity-ide\\scratch\\police-exam\\DBEXAM\\question_bank';
  if (!fs.existsSync(qbDir)) {
    console.error(`Question bank directory not found at: ${qbDir}`);
    process.exit(1);
  }

  // Delete existing secretariat exam sets in the database to prevent duplicate sets on re-runs
  console.log('Cleaning up existing secretariat exam sets...');
  await prisma.examSet.deleteMany({
    where: { category: 'secretariat' }
  });

  const files = fs.readdirSync(qbDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON files in question bank:`, files);

  for (const file of files) {
    const filePath = path.join(qbDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const examTitle = file.replace('.json', '');
    const entries = data.entries || [];
    if (entries.length === 0) {
      console.log(`Skipping empty file: ${file}`);
      continue;
    }

    console.log(`Importing set: "${examTitle}" with ${entries.length} questions...`);

    await prisma.examSet.create({
      data: {
        title: `งานสารบรรณ - ${examTitle}`,
        category: 'secretariat',
        subcategory: 'งานสารบรรณ',
        totalCount: entries.length,
        createdById: creatorId,
        questions: {
          create: entries.map((entry, idx) => {
            const choices = entry.choices || [];
            
            // Map letter answers (A, B, C, D) to numbers (0, 1, 2, 3)
            let correctAnswer = 0;
            if (entry.answer === 'A') correctAnswer = 0;
            else if (entry.answer === 'B') correctAnswer = 1;
            else if (entry.answer === 'C') correctAnswer = 2;
            else if (entry.answer === 'D') correctAnswer = 3;
            else if (typeof entry.answer === 'number') correctAnswer = entry.answer;

            return {
              questionText: entry.question,
              choice1: choices[0] || 'ตัวเลือก ก',
              choice2: choices[1] || 'ตัวเลือก ข',
              choice3: choices[2] || 'ตัวเลือก ค',
              choice4: choices[3] || 'ตัวเลือก ง',
              correctAnswer: correctAnswer,
              explanation: entry.explanation || 'คำอธิบายของข้อนี้...',
              sortOrder: idx
            };
          })
        }
      }
    });
  }

  console.log('--- IMPORT COMPLETED SUCCESSFULLY ---');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Import script failed:', err);
  process.exit(1);
});

\\n
## File: server\index.js

\\nimport express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load environment variables from the server folder's .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// --- Email Transporter (Nodemailer) ---
const isResend = process.env.EMAIL_USER === 'resend';
const emailTransporter = nodemailer.createTransport({
  host: isResend ? 'smtp.resend.com' : 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, '')
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds connection timeout
  socketTimeout: 10000      // 10 seconds socket timeout
});

const getSenderEmail = () => {
  if (isResend) {
    return `"เตรียมสอบนายสิบ" <onboarding@resend.dev>`;
  }
  return `"เตรียมสอบนายสิบ" <${process.env.EMAIL_USER}>`;
};

const getFrontendUrl = (req) => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  const host = req.get('host') || 'localhost:3000';
  const hostname = host.split(':')[0];
  return `http://${hostname}:5173`;
};
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:5173`;

const defaultQuestions = [
  // 1. ความรู้ความสามารถทั่วไป (general)
  {
    category: 'general',
    title: 'ความรู้ความสามารถทั่วไป ชุดที่ 1',
    questions: [
      {
        questionText: 'ถ้า A > B และ B = C ข้อใดถูกต้องที่สุด?',
        choice1: 'A = C',
        choice2: 'A > C',
        choice3: 'A < C',
        choice4: 'สรุปไม่ได้',
        correctAnswer: 1
      },
      {
        questionText: 'ผลรวมของเลขจำนวนเต็มตั้งแต่ 1 ถึง 100 เท่ากับเท่าใด?',
        choice1: '5050',
        choice2: '5000',
        choice3: '5100',
        choice4: '4950',
        correctAnswer: 0
      },
      {
        questionText: 'นายดำอายุมากกว่านายแดง 5 ปี อีก 3 ปีข้างหน้าผลรวมอายุทั้งสองคนเป็น 45 ปี ปัจจุบันนายแดงอายุเท่าใด?',
        choice1: '17 ปี',
        choice2: '22 ปี',
        choice3: '15 ปี',
        choice4: '20 ปี',
        correctAnswer: 0
      }
    ]
  },
  // 2. ภาษาไทย (thai)
  {
    category: 'thai',
    title: 'ภาษาไทย ชุดที่ 1',
    questions: [
      {
        questionText: 'ข้อใดเขียนตัวสะกดการันต์ได้ถูกต้องทุกคำ?',
        choice1: 'อนุญาต, ปรากฏ, สังเกต',
        choice2: 'อนุญาติ, ปรากฎ, สังเกตุ',
        choice3: 'อนุญาต, ปรากฎ, สังเกตุ',
        choice4: 'อนุญาติ, ปรากฏ, สังเกต',
        correctAnswer: 0
      },
      {
        questionText: 'คำในข้อใดใช้ลักษณนามว่า "เล่ม" ทุกคำ?',
        choice1: 'หนังสือ, สมุด, ดาบ, เข็ม',
        choice2: 'หนังสือ, ดินสอ, เกวียน, ร่ม',
        choice3: 'ตะปู, ดาบ, เลื่อย, เทียน',
        choice4: 'สมุด, ไม้บรรทัด, ปากกา, ปืน',
        correctAnswer: 0
      },
      {
        questionText: 'สำนวนในข้อใดมีความหมายตรงกับคำว่า "ทำอะไรย่อมได้รับผลเช่นนั้น"?',
        choice1: 'หว่านพืชเช่นไร ย่อมได้ผลเช่นนั้น',
        choice2: 'กงเกวียนกำเกวียน',
        choice3: 'ทำดีได้ดี ทำชั่วได้ชั่ว',
        choice4: 'ปลูกบ้านตามใจผู้อยู่',
        correctAnswer: 0
      }
    ]
  },
  // 3. ภาษาอังกฤษ (english)
  {
    category: 'english',
    title: 'ภาษาอังกฤษ ชุดที่ 1',
    questions: [
      {
        questionText: 'Choose the correct word: The police officer asked the driver to ______ his driver\'s license.',
        choice1: 'show',
        choice2: 'showing',
        choice3: 'shown',
        choice4: 'shows',
        correctAnswer: 0
      },
      {
        questionText: 'Which sentence is grammatically correct?',
        choice1: 'He don\'t like coffee.',
        choice2: 'She doesn\'t likes coffee.',
        choice3: 'They doesn\'t like coffee.',
        choice4: 'He doesn\'t like coffee.',
        correctAnswer: 3
      },
      {
        questionText: 'The synonym of the word "ASSIST" is ______.',
        choice1: 'hinder',
        choice2: 'help',
        choice3: 'ignore',
        choice4: 'prevent',
        correctAnswer: 1
      }
    ]
  },
  // 4. คอมพิวเตอร์และเทคโนโลยี (computer)
  {
    category: 'computer',
    title: 'เทคโนโลยีสารสนเทศ ชุดที่ 1',
    questions: [
      {
        questionText: 'ปุ่มคีย์ลัดใดใช้ในการคัดลอก (Copy) ข้อความหรือไฟล์ในระบบปฏิบัติการ Windows?',
        choice1: 'Ctrl + X',
        choice2: 'Ctrl + C',
        choice3: 'Ctrl + V',
        choice4: 'Ctrl + Z',
        correctAnswer: 1
      },
      {
        questionText: 'ข้อใดคือหน่วยความจำหลักของคอมพิวเตอร์ที่ข้อมูลจะหายไปเมื่อปิดเครื่อง?',
        choice1: 'ROM',
        choice2: 'Hard Disk',
        choice3: 'RAM',
        choice4: 'Flash Drive',
        correctAnswer: 2
      },
      {
        questionText: 'โปรโตคอลใดใช้ในการส่งและรับข้อมูลหน้าเว็บไซต์ทั่วไปอย่างปลอดภัย?',
        choice1: 'HTTP',
        choice2: 'FTP',
        choice3: 'HTTPS',
        choice4: 'SMTP',
        correctAnswer: 2
      }
    ]
  },
  // 5. สังคม วัฒนธรรม จริยธรรม และประชาคมอาเซียน (social)
  {
    category: 'social',
    title: 'สังคมและวัฒนธรรม ชุดที่ 1',
    questions: [
      {
        questionText: 'ประเทศใดไม่ได้อยู่ในผู้ก่อตั้งสมาคมประชาชาติแห่งเอเชียตะวันออกเฉียงใต้ (ASEAN) ในปี พ.ศ. 2510?',
        choice1: 'ไทย',
        choice2: 'อินโดนีเซีย',
        choice3: 'เวียดนาม',
        choice4: 'ฟิลิปปินส์',
        correctAnswer: 2
      },
      {
        questionText: 'วันสำคัญทางพระพุทธศาสนาวันใดที่มีเหตุการณ์สำคัญคือ พระสงฆ์ 1,250 รูปมาประชุมกันโดยมิได้นัดหมาย?',
        choice1: 'วันมาฆบูชา',
        choice2: 'วันวิสาขบูชา',
        choice3: 'วันอาสาฬหบูชา',
        choice4: 'วันอัฐมีบูชา',
        correctAnswer: 0
      },
      {
        questionText: 'ข้อใดคือเป้าหมายหลักของการพัฒนาที่ยั่งยืน (SDGs) ขององค์การสหประชาชาติ?',
        choice1: 'การพัฒนาด้านอุตสาหกรรมหนักเท่านั้น',
        choice2: 'การพัฒนาเศรษฐกิจ สังคม และสิ่งแวดล้อมอย่างสมดุล',
        choice3: 'การเพิ่มจีดีพีของประเทศกำลังพัฒนาเป็นสองเท่า',
        choice4: 'การเน้นใช้ทรัพยากรธรรมชาติให้หมดไปโดยเร็ว',
        correctAnswer: 1
      }
    ]
  },
  // 6. งานสารบรรณ (secretariat)
  {
    category: 'secretariat',
    title: 'งานสารบรรณ ชุดที่ 1',
    questions: [
      {
        questionText: 'ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ หนังสือประทับตราใช้กระดาษชนิดใดและประทับตราแทนการลงชื่อของใคร?',
        choice1: 'กระดาษตราครุฑ / หัวหน้าส่วนราชการระดับกองขึ้นไป',
        choice2: 'กระดาษบันทึกข้อความ / หัวหน้าส่วนราชการระดับแผนก',
        choice3: 'กระดาษธรรมดา / เจ้าหน้าที่ผู้รับผิดชอบ',
        choice4: 'กระดาษตราครุฑ / เจ้าหน้าที่ระดับปฏิบัติการ',
        correctAnswer: 0
      },
      {
        questionText: 'หนังสือราชการภายนอก ใช้กระดาษตราครุฑและเป็นหนังสือติดต่อระหว่างส่วนราชการกับข้อใด?',
        choice1: 'ระหว่างส่วนราชการด้วยกัน หรือ ส่วนราชการกับหน่วยงานภายนอก/บุคคลภายนอก',
        choice2: 'ภายในหน่วยงานระดับกองเดียวกันเท่านั้น',
        choice3: 'เฉพาะติดต่อกับบริษัทเอกชนต่างประเทศ',
        choice4: 'ใช้ส่งถึงนายกรัฐมนตรีโดยเฉพาะเท่านั้น',
        correctAnswer: 0
      },
      {
        questionText: 'หนังสือราชการมีกี่ชนิด ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526?',
        choice1: '4 ชนิด',
        choice2: '5 ชนิด',
        choice3: '6 ชนิด',
        choice4: '7 ชนิด',
        correctAnswer: 2
      }
    ]
  },
  // 7. กฎหมายเบื้องต้น (law)
  {
    category: 'law',
    title: 'กฎหมายเบื้องต้น ชุดที่ 1',
    questions: [
      {
        questionText: 'กฎหมายสูงสุดในการปกครองประเทศไทยคืออะไร?',
        choice1: 'ประมวลกฎหมายอาญา',
        choice2: 'รัฐธรรมนูญแห่งราชอาณาจักรไทย',
        choice3: 'พระราชบัญญัติตำรวจแห่งชาติ',
        choice4: 'ประมวลกฎหมายแพ่งและพาณิชย์',
        correctAnswer: 1
      },
      {
        questionText: 'การกระทำในข้อใดที่กฎหมายบัญญัติว่าเป็นความผิดทางอาญาและต้องได้รับโทษ?',
        choice1: 'การกู้ยืมเงินแล้วไม่ชำระคืนตามกำหนด',
        choice2: 'การลักทรัพย์ผู้อื่นโดยเจตนา',
        choice3: 'การผิดสัญญาซื้อขายที่ดิน',
        choice4: 'การจอดรถในที่ห้ามจอดโดยไม่มีป้ายเตือน',
        correctAnswer: 1
      },
      {
        questionText: 'ผู้ใดกระทำความผิดอาญาขณะอายุไม่เกินกี่ปี กฎหมายยกเว้นโทษให้ตามประมวลกฎหมายอาญาปัจจุบัน (แก้ไขเพิ่มเติมล่าสุด)?',
        choice1: 'ไม่เกิน 10 ปี',
        choice2: 'ไม่เกิน 12 ปี',
        choice3: 'ไม่เกิน 15 ปี',
        choice4: 'ไม่เกิน 18 ปี',
        correctAnswer: 1
      }
    ]
  }
];

const ensureDefaultQuestions = async () => {
  try {
    const count = await prisma.question.count();
    if (count > 0) return;

    console.log('[Auto-Seed] Database has 0 questions. Automatically seeding default questions...');
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      admin = await prisma.user.findFirst();
    }
    const creatorId = admin ? admin.id : 1;

    for (const group of defaultQuestions) {
      await prisma.examSet.create({
        data: {
          title: group.title,
          category: group.category,
          subcategory: 'ทั่วไป',
          totalCount: group.questions.length,
          createdById: creatorId,
          questions: {
            create: group.questions.map((q, idx) => ({
              questionText: q.questionText,
              choice1: q.choice1,
              choice2: q.choice2,
              choice3: q.choice3,
              choice4: q.choice4,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || `เฉลยคำตอบคือข้อ ${idx + 1} ตามรายละเอียดของข้อสอบ`,
              sortOrder: idx
            }))
          }
        }
      });
    }
    console.log('[Auto-Seed] Seeded default questions successfully.');
  } catch (err) {
    console.error('[Auto-Seed] Auto seeding failed:', err);
  }
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// --- Health Check Route ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth server is running.' });
});

// --- Register Route ---
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, fullName } = req.body;

  // Simple validation
  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง' });
  }

  // Type validation
  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof fullName !== 'string'
  ) {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
      }
    }

    // Hash the password securely with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');

    // Save user to MySQL using Prisma ORM
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName,
        emailVerified: false,
        emailVerifyToken: verifyToken
      }
    });

    // Send verification email
    const verifyLink = `${getFrontendUrl(req)}/verify-email.html?token=${verifyToken}`;

    try {
      await emailTransporter.sendMail({
        from: getSenderEmail(),
        to: email,
        subject: '✉️ ยืนยันอีเมล - เตรียมสอบนายสิบพิชิตข้อสอบ',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
              <h1 style="color: #d6af37; margin: 0; font-size: 24px;">เตรียมสอบนายสิบพิชิตข้อสอบ</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #1a1a2e; margin-bottom: 16px;">ยืนยันอีเมลของคุณ</h2>
              <p style="color: #555; font-size: 15px; line-height: 1.6;">สวัสดีคุณ <strong>${fullName}</strong>,</p>
              <p style="color: #555; font-size: 15px; line-height: 1.6;">ขอบคุณที่สมัครสมาชิก! กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${verifyLink}" style="display: inline-block; background: linear-gradient(135deg, #d6af37, #f0c850); color: #1a1a2e; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 16px;">ยืนยันอีเมล</a>
              </div>
              <p style="color: #888; font-size: 13px;">หากคุณไม่ได้สมัครสมาชิก กรุณาเพิกเฉยอีเมลนี้</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
              <p style="color: #aaa; font-size: 12px; text-align: center;">© 2026 เตรียมสอบนายสิบพิชิตข้อสอบ</p>
            </div>
          </div>
        `
      });
    } catch (mailErr) {
      console.error('Verification email send error:', mailErr);
    }

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ',
      needsVerification: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากทางเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งภายหลัง' });
  }
});

// --- Verify Email Route ---
app.get('/api/auth/verify-email', async (req, res) => {
  const { token } = req.query;
  const tokenStr = Array.isArray(token) ? token[0] : token;

  if (!tokenStr || typeof tokenStr !== 'string') {
    return res.status(400).json({ error: 'ไม่พบ token สำหรับยืนยัน หรือ token ไม่ถูกต้อง' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: tokenStr }
    });

    if (!user) {
      return res.status(400).json({ error: 'ลิงก์ยืนยันไม่ถูกต้องหรือถูกใช้ไปแล้ว' });
    }

    if (user.emailVerified) {
      return res.json({ message: 'อีเมลนี้ได้รับการยืนยันแล้ว', alreadyVerified: true });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null
      }
    });

    res.json({ message: 'ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว' });
  } catch (err) {
    console.error('Email verify error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// --- Resend Verification Email Route ---
app.post('/api/auth/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมล' });
  }

  if (typeof email !== 'string') {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  try {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      return res.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์ยืนยันไปแล้ว' });
    }

    if (user.emailVerified) {
      return res.json({ message: 'อีเมลนี้ได้รับการยืนยันแล้ว สามารถเข้าสู่ระบบได้เลย', alreadyVerified: true });
    }

    // Generate new token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: verifyToken }
    });

    const verifyLink = `${getFrontendUrl(req)}/verify-email.html?token=${verifyToken}`;

    await emailTransporter.sendMail({
      from: getSenderEmail(),
      to: email,
      subject: '✉️ ยืนยันอีเมล - เตรียมสอบนายสิบพิชิตข้อสอบ',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
            <h1 style="color: #d6af37; margin: 0; font-size: 24px;">เตรียมสอบนายสิบพิชิตข้อสอบ</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1a1a2e; margin-bottom: 16px;">ยืนยันอีเมลของคุณ</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">สวัสดีคุณ <strong>${user.fullName || user.username}</strong>,</p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${verifyLink}" style="display: inline-block; background: linear-gradient(135deg, #d6af37, #f0c850); color: #1a1a2e; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 16px;">ยืนยันอีเมล</a>
            </div>
            <p style="color: #888; font-size: 13px;">หากคุณไม่ได้สมัครสมาชิก กรุณาเพิกเฉยอีเมลนี้</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #aaa; font-size: 12px; text-align: center;">© 2026 เตรียมสอบนายสิบพิชิตข้อสอบ</p>
          </div>
        </div>
      `
    });

    res.json({ message: 'ส่งลิงก์ยืนยันอีเมลไปแล้ว กรุณาตรวจสอบอีเมลของคุณ' });
  } catch (err) {
    console.error('Resend verification error:', err);
    if (err.code === 'EAUTH') {
      return res.status(500).json({ error: 'ไม่สามารถส่งอีเมลได้เนื่องจากรหัสผ่านแอป Gmail ของผู้ส่งไม่ถูกต้อง (SMTP Auth Error) กรุณาตรวจสอบการตั้งค่า .env' });
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ในการส่งอีเมล กรุณาลองใหม่อีกครั้ง' });
  }
});

// --- Login Route ---
app.post('/api/auth/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  // Simple validation
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน' });
  }

  if (typeof usernameOrEmail !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  try {
    // Find user by username OR email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ ตรวจสอบกล่องจดหมายของคุณ',
        needsVerification: true,
        email: user.email
      });
    }

    // Verify password with bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const redirectTo = (user.role === 'ADMIN' || user.role === 'OWNER') ? '/admin-dashboard/' : '/home/';

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ!',
      token,
      redirectTo,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        points: user.points,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        scoreGeneral: user.scoreGeneral,
        scoreThai: user.scoreThai,
        scoreEnglish: user.scoreEnglish,
        scoreComputer: user.scoreComputer,
        scoreSocial: user.scoreSocial,
        scoreSecretariat: user.scoreSecretariat,
        scoreLaw: user.scoreLaw,
        premiumUntil: user.premiumUntil,
        pigName: user.pigName,
        pigLevel: user.pigLevel,
        pigXp: user.pigXp,
        pigHunger: user.pigHunger,
        pigThirst: user.pigThirst,
        pigSkin: user.pigSkin,
        pigWeapon: user.pigWeapon,
        pigPenLevel: user.pigPenLevel,
        pigUnlockedSkins: user.pigUnlockedSkins,
        pigUnlockedWeapons: user.pigUnlockedWeapons
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากทางเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งภายหลัง' });
  }
});

// --- Google Auth Configuration & Verification Routes ---
app.get('/api/auth/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null
  });
});

app.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'ไม่พบรหัส Token ของ Google' });
  }

  try {
    const googleUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const response = await fetch(googleUrl);
    if (!response.ok) {
      return res.status(400).json({ error: 'รหัส Token ของ Google ไม่ถูกต้องหรือหมดอายุ' });
    }

    const tokenInfo = await response.json();

    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && tokenInfo.aud !== expectedClientId) {
      return res.status(400).json({ error: 'รหัส Token ไม่ปลอดภัย (aud mismatch)' });
    }

    const email = tokenInfo.email;
    const name = tokenInfo.name || tokenInfo.given_name || 'ผู้ใช้งาน Google';

    if (!email) {
      return res.status(400).json({ error: 'บัญชี Google ของคุณไม่ได้เปิดเผยอีเมล' });
    }

    let user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      const username = email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);
      const randomPass = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPass, 10);

      user = await prisma.user.create({
        data: {
          username,
          fullName: name,
          email,
          password: hashedPassword,
          emailVerified: true,
          role: 'USER',
          points: 0,
          xp: 0,
          level: 1,
          streak: 0,
          pigLevel: 1,
          pigXp: 0,
          scoreGeneral: 0,
          scoreThai: 0,
          scoreEnglish: 0,
          scoreComputer: 0,
          scoreSocial: 0,
          scoreSecretariat: 0,
          scoreLaw: 0
        }
      });
    } else {
      if (!user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true }
        });
      }
    }

    const jwtToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    let redirectTo = '/home/';
    if (user.role === 'ADMIN' || user.role === 'OWNER') {
      redirectTo = '/admin-dashboard/';
    }

    res.json({
      message: 'เข้าสู่ระบบด้วย Google สำเร็จ!',
      token: jwtToken,
      user: userWithoutPassword,
      redirectTo
    });

  } catch (err) {
    console.error('Google verification error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์กับ Google' });
  }
});

// --- Google Auth Code Exchange Route (OAuth2 Code Flow) ---
app.post('/api/auth/google-code', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'ไม่พบรหัส Authorization Code' });
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.id_token) {
      // Fallback: try to get user info from access_token
      if (tokenData.access_token) {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        });
        const userInfo = await userInfoRes.json();

        if (!userInfo.email) {
          return res.status(400).json({ error: 'ไม่สามารถดึงข้อมูลจาก Google ได้' });
        }

        // Find or create user
        let user = await prisma.user.findFirst({ where: { email: userInfo.email } });

        if (!user) {
          const username = userInfo.email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);
          const randomPass = crypto.randomBytes(16).toString('hex');
          const hashedPassword = await bcrypt.hash(randomPass, 10);

          user = await prisma.user.create({
            data: {
              username,
              fullName: userInfo.name || 'ผู้ใช้งาน Google',
              email: userInfo.email,
              password: hashedPassword,
              emailVerified: true,
              role: 'USER',
              points: 0, xp: 0, level: 1, streak: 0,
              pigLevel: 1, pigXp: 0,
              scoreGeneral: 0, scoreThai: 0, scoreEnglish: 0,
              scoreComputer: 0, scoreSocial: 0, scoreSecretariat: 0, scoreLaw: 0
            }
          });
        }

        const jwtToken = jwt.sign(
          { userId: user.id, username: user.username, role: user.role },
          JWT_SECRET, { expiresIn: '30d' }
        );
        const { password: _, ...userWithoutPassword } = user;

        return res.json({
          message: 'เข้าสู่ระบบด้วย Google สำเร็จ!',
          token: jwtToken,
          user: userWithoutPassword,
          redirectTo: (user.role === 'ADMIN' || user.role === 'OWNER') ? '/admin-dashboard/' : '/home/'
        });
      }

      return res.status(400).json({ error: 'การแลกเปลี่ยน Authorization Code ล้มเหลว' });
    }

    // Verify the id_token
    const googleUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`;
    const verifyRes = await fetch(googleUrl);
    if (!verifyRes.ok) {
      return res.status(400).json({ error: 'ID Token ไม่ถูกต้อง' });
    }
    const tokenInfo = await verifyRes.json();

    const email = tokenInfo.email;
    const name = tokenInfo.name || tokenInfo.given_name || 'ผู้ใช้งาน Google';

    if (!email) {
      return res.status(400).json({ error: 'บัญชี Google ไม่ได้เปิดเผยอีเมล' });
    }

    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      const username = email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);
      const randomPass = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPass, 10);

      user = await prisma.user.create({
        data: {
          username, fullName: name, email, password: hashedPassword,
          emailVerified: true, role: 'USER',
          points: 0, xp: 0, level: 1, streak: 0,
          pigLevel: 1, pigXp: 0,
          scoreGeneral: 0, scoreThai: 0, scoreEnglish: 0,
          scoreComputer: 0, scoreSocial: 0, scoreSecretariat: 0, scoreLaw: 0
        }
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true }
      });
    }

    const jwtToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET, { expiresIn: '30d' }
    );
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'เข้าสู่ระบบด้วย Google สำเร็จ!',
      token: jwtToken,
      user: userWithoutPassword,
      redirectTo: (user.role === 'ADMIN' || user.role === 'OWNER') ? '/admin-dashboard/' : '/home/'
    });

  } catch (err) {
    console.error('Google code exchange error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์กับ Google' });
  }
});

// --- Forgot Password Route ---
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมล' });
  }

  if (typeof email !== 'string') {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  try {
    // Check if user exists
    const user = await prisma.user.findFirst({ where: { email } });
    
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปแล้ว กรุณาตรวจสอบอีเมลของคุณ' });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Invalidate any previous unused tokens for this email
    await prisma.passwordReset.updateMany({
      where: { email, used: false },
      data: { used: true }
    });

    // Save token to DB
    await prisma.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expiresAt
      }
    });

    // Build reset link
    const resetLink = `${getFrontendUrl(req)}/reset-password.html?token=${resetToken}`;

    // Send email
    try {
      await emailTransporter.sendMail({
        from: getSenderEmail(),
        to: email,
        subject: '🔐 รีเซ็ตรหัสผ่าน - เตรียมสอบนายสิบพิชิตข้อสอบ',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
              <h1 style="color: #d6af37; margin: 0; font-size: 24px;">เตรียมสอบนายสิบพิชิตข้อสอบ</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #1a1a2e; margin-bottom: 16px;">รีเซ็ตรหัสผ่าน</h2>
              <p style="color: #555; font-size: 15px; line-height: 1.6;">สวัสดีคุณ <strong>${user.fullName || user.username}</strong>,</p>
              <p style="color: #555; font-size: 15px; line-height: 1.6;">เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #d6af37, #f0c850); color: #1a1a2e; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 16px;">ตั้งรหัสผ่านใหม่</a>
              </div>
              <p style="color: #888; font-size: 13px;">ลิงก์นี้จะหมดอายุภายใน 30 นาที หากคุณไม่ได้ร้องขอ กรุณาเพิกเฉยอีเมลนี้</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
              <p style="color: #aaa; font-size: 12px; text-align: center;">© 2026 เตรียมสอบนายสิบพิชิตข้อสอบ</p>
            </div>
          </div>
        `
      });
    } catch (mailErr) {
      console.error('Email send error:', mailErr);
      return res.status(500).json({ error: 'ไม่สามารถส่งอีเมลได้ กรุณาตรวจสอบการตั้งค่าอีเมลของเซิร์ฟเวอร์' });
    }

    res.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปแล้ว กรุณาตรวจสอบอีเมลของคุณ' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// --- Reset Password Route ---
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  if (typeof token !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
  }

  try {
    // Find the reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่' });
    }

    // Find the user
    const user = await prisma.user.findFirst({ where: { email: resetRecord.email } });
    if (!user) {
      return res.status(400).json({ error: 'ไม่พบบัญชีผู้ใช้' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true }
    });

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง' });
    }
    req.user = decoded;
    next();
  });
};

// --- requireAdmin Middleware ---
const requireAdmin = async (req, res, next) => {
  authenticateToken(req, res, async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true }
      });
      if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
        return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้ (สำหรับแอดมินหรือเจ้าของเท่านั้น)' });
      }
      next();
    } catch (err) {
      console.error('requireAdmin error:', err);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' });
    }
  });
};

// --- Get User Profile Route ---
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' });
    }

    // Calculate actual answered questions count from completed stages
    const completedProgress = await prisma.userStageProgress.findMany({
      where: { userId: req.user.userId, completed: true },
      include: { stage: true }
    });

    let answeredQuestionsCount = 0;
    if (completedProgress.length > 0) {
      const stageTitles = completedProgress.map(p => p.stage.title);
      const matchingExamSets = await prisma.examSet.findMany({
        where: { title: { in: stageTitles } },
        select: { totalCount: true }
      });
      answeredQuestionsCount = matchingExamSets.reduce((sum, es) => sum + es.totalCount, 0);
    }

    const { password, ...safeUser } = user;
    res.json({
      user: {
        ...safeUser,
        answeredQuestionsCount
      }
    });
  } catch (err) {
    console.error('Fetch Profile Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้' });
  }
});

// --- Upload Profile Face Image ---
app.post('/api/user/profile/upload-face', authenticateToken, async (req, res) => {
  const { faceImage } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { faceImage }
    });
    const { password, ...safeUser } = updatedUser;
    res.json({ user: safeUser });
  } catch (err) {
    console.error('Upload face error:', err);
    res.status(500).json({ error: 'ไม่สามารถอัปโหลดรูปภาพใบหน้าได้' });
  }
});

// --- Student Exam Endpoints ---

// Get daily random exam (10 questions, 1 or 2 from each subject)
app.get('/api/exams/daily', authenticateToken, async (req, res) => {
  const categories = ['general', 'thai', 'english', 'computer', 'social', 'secretariat', 'law'];
  try {
    await ensureDefaultQuestions();
    const selectedIds = [];
    const categoryQuestions = {};
    const pool = [];

    // Fetch all question IDs for each category
    for (const cat of categories) {
      const list = await prisma.question.findMany({
        where: { examSet: { category: cat } },
        select: { id: true }
      });
      const ids = list.map(q => q.id);
      
      // Shuffle individual category IDs
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      categoryQuestions[cat] = ids;
    }

    // Shuffle the categories to decide which 3 categories get 2 questions
    const shuffledCats = [...categories];
    for (let i = shuffledCats.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCats[i], shuffledCats[j]] = [shuffledCats[j], shuffledCats[i]];
    }

    const twoQuestionCats = shuffledCats.slice(0, 3);

    // Pick 1 or 2 questions from each category
    categories.forEach(cat => {
      const ids = categoryQuestions[cat] || [];
      const countToPick = twoQuestionCats.includes(cat) ? 2 : 1;
      
      const picked = ids.slice(0, countToPick);
      selectedIds.push(...picked);

      // Add remaining category questions to a global fallback pool
      const remaining = ids.slice(countToPick);
      pool.push(...remaining);
    });

    // Shuffle the global fallback pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Fill from pool if total is under 10 (due to empty categories in DB)
    while (selectedIds.length < 10 && pool.length > 0) {
      selectedIds.push(pool.pop());
    }

    if (selectedIds.length === 0) {
      return res.status(404).json({ error: 'ไม่พบคำถามในระบบ' });
    }

    // Fetch full questions
    const questions = await prisma.question.findMany({
      where: { id: { in: selectedIds } },
      include: {
        examSet: {
          select: { category: true, subcategory: true }
        }
      }
    });

    // Group/Sort questions by category order to prevent mixing them up
    questions.sort((a, b) => {
      const catA = a.examSet?.category || '';
      const catB = b.examSet?.category || '';
      return categories.indexOf(catA) - categories.indexOf(catB);
    });

    res.json(questions);
  } catch (err) {
    console.error('Fetch Daily Exam Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อสอบประจำวันได้' });
  }
});

// Helper to retrieve and rotate Gemini API Keys from DB settings
async function getGeminiApiKey() {
  let dbKey = null;
  try {
    const keySetting = await prisma.systemSetting.findUnique({
      where: { key: 'settings_gemini_key' }
    });
    if (keySetting && keySetting.value && keySetting.value.trim() !== '') {
      dbKey = keySetting.value.trim();
    }
  } catch (err) {
    console.error('Error fetching gemini key from DB:', err);
  }

  if (dbKey) {
    const keys = dbKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
    if (keys.length > 0) {
      // Pick a random key from the comma-separated pool
      return keys[Math.floor(Math.random() * keys.length)];
    }
  }

  return process.env.GEMINI_API_KEY || 'AIzaSyDDBylXqV9akHtd5hBVEFSuoAM795on7Rc';
}

// Helper to verify a batch of generated questions using Gemini (replicates verifier.py logic)
async function verifyQuestionsBatch(questions, terms, apiKey) {
  const model = 'gemini-2.5-flash';
  const systemPrompt = `คุณคือผู้เชี่ยวชาญตรวจคุณภาพข้อสอบราชการของไทย
หน้าที่ของคุณคือตรวจ "ความถูกต้องของเนื้อหา" และคุณภาพของข้อสอบแต่ละข้อตามเกณฑ์ต่อไปนี้

=== เกณฑ์ที่ต้องตรวจสอบ ===
1. ความถูกต้องของคำตอบ: ตัวเลือกที่ระบุว่าเป็นคำตอบที่ถูก มีความถูกต้องตามข้อเท็จจริง (และตรงกับข้อมูลต้นฉบับที่แนบไป ถ้ามี)
2. ความเป็นเอกลักษณ์ของคำตอบ: ต้องมีตัวเลือกที่ถูกต้องที่สุดเพียงข้อเดียวเท่านั้น ห้ามมีตัวเลือกอื่นที่ถูกพอๆ กัน
3. ความสมเหตุสมผลของตัวเลือกผิด: ตัวเลือกผิดต้องไม่เดาง่ายหรือผิดชัดเจนเกินไป
4. ความชัดเจนของคำถาม: คำถามไม่กำกวม ตีความได้หลายแบบ
5. การอ้างอิงข้อมูล: ข้อสอบไม่อ้างอิงหรือทึกทักข้อมูลภายนอกที่ไม่มีระบุในข้อมูลต้นฉบับ

ตอบกลับเป็น JSON Array ของการตรวจสอบข้อสอบแต่ละข้อตามลำดับของอินพุต ห้ามมีคำอธิบายอื่นนอกเหนือจาก JSON นี้เท่านั้น:
[
  {
    "pass": true, // หรือ false หากไม่ผ่านเกณฑ์การตรวจสอบอย่างร้ายแรง
    "score": 90, // คะแนนคุณภาพ (0-100)
    "reason": "สรุปผลการตรวจสอบเนื้อหาข้อนี้",
    "issues": [] // รายการปัญหาที่พบ (ถ้ามี)
  }
]`;

  const payload = {
    "ฐานข้อมูลต้นฉบับ": terms ? { "records": terms } : "ไม่มี (ใช้ความรู้ทั่วไปของวิชาดังกล่าว)",
    "ข้อสอบที่ต้องตรวจ": questions.map((q, idx) => ({
      "ลำดับ": idx,
      "คำถาม": q.questionText || q.question,
      "ตัวเลือกทั้งหมด": [q.choice1 || q.choices?.[0], q.choice2 || q.choices?.[1], q.choice3 || q.choices?.[2], q.choice4 || q.choices?.[3]].filter(Boolean),
      "เนื้อหาของคำตอบที่ถูก": q.choices ? q.choices[q.correctAnswer || 0] : [q.choice1, q.choice2, q.choice3, q.choice4][q.correctAnswer || 0],
      "คำอธิบาย": q.explanation
    }))
  };

  const userMessage = `จงตรวจสอบคุณภาพของข้อสอบตามข้อมูลต่อไปนี้:\n\n${JSON.stringify(payload, null, 2)}`;

  try {
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      throw new Error(`HTTP ${apiRes.status}: ${text}`);
    }

    const resJson = await apiRes.json();
    const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No verification text returned');

    const parsed = JSON.parse(rawText.trim());
    return parsed;
  } catch (err) {
    console.error('Batch verification error:', err.message);
    return null;
  }
}

// Helper to generate a question from a raw database Term using Gemini
async function generateQuestionFromTerm(term, apiKey) {
  const model = 'gemini-2.5-flash';
  const systemPrompt = `คุณคือผู้ออกข้อสอบราชการระดับมืออาชีพ

กฎที่ต้องปฏิบัติอย่างเคร่งครัด:
1. อ้างอิงเฉพาะข้อมูลที่ได้รับเท่านั้น ห้ามใช้ความรู้ภายนอก
2. ห้ามแต่งข้อมูลหรือสร้างข้อเท็จจริงใหม่ที่ไม่มีในข้อมูล
3. คำถามต้องไม่คัดลอก definition ตรงๆ แต่สามารถสร้างสถานการณ์สมมุติได้
4. ตัวเลือกผิดต้องสมเหตุสมผล ดูน่าเชื่อถือ ไม่ชัดเจนเกินไป — ถ้า record มี "confused_with" หรือ "non_examples" ให้ใช้เป็นแนวทางสร้างตัวเลือกผิดที่ดี
5. ต้องมีคำตอบที่ถูกต้องเพียงข้อเดียวเท่านั้น
6. ถ้า record มี "question_types" ให้พยายามเลือกออกข้อสอบในรูปแบบที่ระบุไว้
7. document ใน "source" ต้องตรงกับ document_name หรือ source ของ record ที่ใช้ และ section ต้องตรงกับ section หรือ category ของ record นั้น
8. source_line ต้องตรงกับ source_line ของ record ที่ใช้เป๊ะๆ

ตอบเป็น JSON เท่านั้น ห้ามมี text อื่นนอกจาก JSON:
{
  "question": "คำถาม",
  "choices": ["ก. ...", "ข. ...", "ค. ...", "ง. ..."],
  "answer": "A",
  "explanation": "อธิบายเหตุผลที่คำตอบถูกต้องและทำไมตัวเลือกอื่นผิด",
  "difficulty": "easy"
}
หมายเหตุ: answer ต้องเป็น "A", "B", "C" หรือ "D" ตรงกับลำดับ choices`;

  const record = {
    term: term.term,
    definition: term.definition,
    document_name: term.source || term.document_name || 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖',
    section: term.section || term.category || 'งานสารบรรณ',
    source_line: term.source_line || term.chapter || '',
  };
  const optionalFields = ['category', 'chapter', 'keywords', 'synonyms', 'examples', 'non_examples', 'confused_with', 'learning_objective', 'cognitive_level', 'difficulty_hint'];
  optionalFields.forEach(f => {
    if (term[f]) record[f] = term[f];
  });

  const userMessage = `จงสร้างข้อสอบ 1 ข้อจากข้อมูลต่อไปนี้:\n\n${JSON.stringify({ records: [record] }, null, 2)}`;

  try {
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      throw new Error(`HTTP ${apiRes.status}: ${text}`);
    }

    const resJson = await apiRes.json();
    const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No text');

    const parsed = JSON.parse(rawText.trim());
    return {
      questionText: parsed.question || 'คำถามสารบรรณ',
      choices: parsed.choices || [],
      answer: parsed.answer || 'A',
      explanation: parsed.explanation || 'คำอธิบายเฉลย...',
      difficulty: parsed.difficulty || 'easy',
      subcategory: record.section,
      document: record.document_name,
      source_line: record.source_line
    };
  } catch (err) {
    console.error(`Error generating from term ${term.term}:`, err.message);
    return null;
  }
}

// Generate dynamic exam questions using Gemini API (Mode 1: AI Generated)
app.get('/api/exams/generate-ai', authenticateToken, async (req, res) => {
  const { subject } = req.query;
  if (!subject) {
    return res.status(400).json({ error: 'กรุณาระบุหมวดวิชาที่ต้องการ' });
  }

  const apiKey = await getGeminiApiKey();
  const model = 'gemini-2.5-flash';

  const subjectMeta = {
    general: { name: 'ความรู้ทั่วไป (คณิตศาสตร์ ตรรกศาสตร์ มิติสัมพันธ์ อนุกรม และการแก้โจทย์เลข)' },
    thai: { name: 'ภาษาไทย (หลักการใช้ภาษา ความเข้าใจภาษา การสะกดคำ และการเรียงประโยค)' },
    english: { name: 'ภาษาอังกฤษ (Grammar, Vocabulary, Conversation, Reading Comprehension)' },
    computer: { name: 'คอมพิวเตอร์และเทคโนโลยีสารสนเทศ (Hardware, Software, Internet, Cyber Security และโปรแกรมสำนักงาน)' },
    social: { name: 'สังคม วัฒนธรรม จริยธรรม และอาเซียน (ศีลธรรม ความเป็นพลเมือง และข้อมูลอาเซียน)' },
    secretariat: { name: 'งานสารบรรณ (ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ และที่แก้ไขเพิ่มเติม)' },
    law: { name: 'กฎหมายเบื้องต้นที่เกี่ยวข้องกับตำรวจ (กฎหมายรัฐธรรมนูญ, กฎหมายวิธีพิจารณาความอาญา, กฎหมายแพ่งและพาณิชย์ และกฎหมายอาญา)' }
  };
  const catName = subjectMeta[subject]?.name || subject;

  const systemPrompt = `คุณคืออาจารย์ผู้ออกข้อสอบสำหรับเตรียมสอบนายสิบตำรวจของไทย
กรุณาสร้างข้อสอบแบบปรนัย (4 ตัวเลือก ก, ข, ค, ง) จำนวน 10 ข้อสำหรับวิชา: "${catName}"
ระดับความยาก: ปานกลางถึงยาก (ใกล้เคียงกับข้อสอบจริงของสำนักงานตำรวจแห่งชาติ)

ผลลัพธ์ที่คุณส่งกลับต้องเป็น JSON Array ของข้อสอบ 10 ข้อนี้เท่านั้น ห้ามมี markdown (เช่น \`\`\`json) หรือข้อความอธิบายใดๆ ทั้งสิ้น ตอบเฉพาะ JSON เท่านั้น โครงสร้าง JSON ของแต่ละข้อมีรูปแบบดังนี้:
[
  {
    "questionText": "โจทย์คำถามวิชา ${catName} ...",
    "choice1": "ตัวเลือก ก...",
    "choice2": "ตัวเลือก ข...",
    "choice3": "ตัวเลือก ค...",
    "choice4": "ตัวเลือก ง...",
    "correctAnswer": 0, // ดัชนีคำตอบที่ถูกต้องเป็นตัวเลข (0 = ตัวเลือก 1, 1 = ตัวเลือก 2, 2 = ตัวเลือก 3, 3 = ตัวเลือก 4)
    "explanation": "อธิบายเฉลยอย่างละเอียดเชิงข้อกฎหมายหรือหลักการคิด..."
  }
]`;

  try {
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`Gemini API HTTP ${apiRes.status}: ${errText}`);
    }

    const data = await apiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No content returned from Gemini');

    const parsed = JSON.parse(rawText.trim());
    if (!Array.isArray(parsed)) {
      throw new Error('Parsed response is not a JSON Array');
    }

    // Map into standard structure with mock IDs
    const questions = parsed.slice(0, 10).map((q, idx) => ({
      id: `ai-gen-${subject}-${idx}-${Date.now()}`,
      questionText: q.questionText || q.question || 'ข้อคำถามจำลอง',
      choice1: q.choice1 || q.choices?.[0] || 'ตัวเลือก ก',
      choice2: q.choice2 || q.choices?.[1] || 'ตัวเลือก ข',
      choice3: q.choice3 || q.choices?.[2] || 'ตัวเลือก ค',
      choice4: q.choice4 || q.choices?.[3] || 'ตัวเลือก ง',
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || 'เฉลยรายละเอียด...',
      examSet: {
        category: subject,
        subcategory: 'AI เจนเนอเรต'
      }
    }));

    // Run batch verification on the generated questions
    console.log(`[AI Verifier] Running verification for ${questions.length} questions...`);
    const verResults = await verifyQuestionsBatch(questions, null, apiKey);

    // Process verification results
    const verifiedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const result = verResults && verResults[i];

      if (!result || result.pass === true || (result.score && result.score >= 70)) {
        verifiedQuestions.push(q);
      } else {
        console.log(`[AI Verifier] Question ${i} failed. Score: ${result.score}, Reason: ${result.reason}`);
        
        // Fallback: fetch a random pre-saved question from our DB for this subject
        const fallbackQ = await prisma.question.findFirst({
          where: { examSet: { category: subject } },
          include: { examSet: true },
          skip: Math.floor(Math.random() * 5) // Skip randomly to get variation
        });

        if (fallbackQ) {
          verifiedQuestions.push({
            id: `ai-fallback-${subject}-${i}-${Date.now()}`,
            questionText: fallbackQ.questionText,
            choice1: fallbackQ.choice1,
            choice2: fallbackQ.choice2,
            choice3: fallbackQ.choice3,
            choice4: fallbackQ.choice4,
            correctAnswer: fallbackQ.correctAnswer,
            explanation: fallbackQ.explanation || 'เฉลยรายละเอียด...',
            examSet: {
              category: subject,
              subcategory: 'AI เจนเนอเรต (คลังสลับ)'
            }
          });
        } else {
          // If no fallback in DB, keep the AI question to avoid returning an incomplete list
          verifiedQuestions.push(q);
        }
      }
    }

    res.json(verifiedQuestions);
  } catch (err) {
    console.error('Error generating AI questions:', err);
    res.status(500).json({ error: 'ไม่สามารถสร้างข้อสอบจาก AI ได้ กรุณาลองใหม่อีกครั้ง' });
  }
});

// Generate dynamic exam questions using DBEXAM JSON files + Gemini API (Mode 2: DBEXAM)
app.get('/api/exams/generate-dbexam', authenticateToken, async (req, res) => {
  const { subject, count, subcategories } = req.query;
  if (!subject) {
    return res.status(400).json({ error: 'กรุณาระบุหมวดวิชาที่ต้องการ' });
  }
  const numCount = parseInt(count) || 10;
  const categoryFilter = subcategories ? subcategories : subject;

  const absoluteCwd = path.resolve(path.join(__dirname, '..', 'DBEXAM'));
  
  // Subcategory mapping
  const subcategoryMap = {
    // Secretariat
    "secretariat_general": "บททั่วไป",
    "secretariat_types": "หมวด ๑ ชนิดของหนังสือ",
    "secretariat_receiving": "หมวด ๒ การรับและส่งหนังสือ",
    "secretariat_keeping": "หมวด ๓ การเก็บรักษา ยืม และทำลายหนังสือ",
    "secretariat_standards": "หมวด ๔ มาตรฐานตรา แบบพิมพ์ และซอง",
    "secretariat_e_sarabarn": "หมวด ๕ ระบบสารบรรณอิเล็กทรอนิกส์",
    "secretariat_appendix": "ภาคผนวก",

    // Law
    "general_law_state": ["ความรู้ทั่วไปเกี่ยวกับกฎหมาย", "ความรู้ทั่วไปเกี่ยวกับรัฐ"],
    "history_hierarchy": ["ประวัติศาสตร์กฎหมายไทย", "ลำดับศักดิ์ของกฎหมาย"],
    "constitution": "รัฐธรรมนูญ (กฎหมายสูงสุด)",
    "administrative": "กฎหมายปกครอง (กฎหมายมหาชน)",
    "civil_person": "กฎหมายแพ่ง — บุคคล",
    "civil_juristic_debt": ["กฎหมายแพ่ง — นิติกรรมและสัญญา", "กฎหมายแพ่ง — หนี้"],
    "civil_property": "กฎหมายแพ่ง — ทรัพย์",
    "civil_family": "กฎหมายแพ่ง — ครอบครัว",
    "civil_inheritance": "กฎหมายแพ่ง — มรดกและพินัยกรรม",
    "criminal_general": ["กฎหมายอาญา — หลักทั่วไป", "กฎหมายอาญา — โครงสร้างความรับผิดทางอาญา", "กฎหมายอาญา — เหตุยกเว้นความผิด/โทษ และบทลงโทษ", "กฎหมายอาญา — ตัวการ ผู้ใช้ ผู้สนับสนุน"],
    "criminal_offense": "ความผิดเกี่ยวกับทรัพย์ (อาญา)",
    "consumer_protection": "กฎหมายคุ้มครองผู้บริโภค",
    "intellectual_property": "ทรัพย์สินทางปัญญา",
    "labor": "กฎหมายแรงงาน",
    "tax": "กฎหมายภาษี",
    "registration_id_military": "กฎหมายทั่วไปเกี่ยวกับทะเบียนราษฎร์และสิทธิพลเมือง",
    "narcotics": "กฎหมายเฉพาะเรื่องอื่นๆ",
    "daily_life": "กฎหมายเฉพาะเรื่องอื่นๆ"
  };

  const apiKey = await getGeminiApiKey();

  try {
    let allEntries = [];

    // Load raw terms from DB directory (restrict by subject filename to prevent mixing)
    const dbDir = path.join(absoluteCwd, 'db');
    if (fs.existsSync(dbDir)) {
      const dbFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'));
      for (const filename of dbFiles) {
        // Enforce strict subject boundary
        if (subject === 'law' && !filename.includes('law')) continue;
        if (subject === 'secretariat' && !filename.includes('sarabarn')) continue;

        const filePath = path.join(dbDir, filename);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(fileContent);
          const entries = data.entries || (data.knowledge_database && data.knowledge_database.entries) || [];
          allEntries = allEntries.concat(entries);
        } catch (err) {
          console.error(`Error reading/parsing db ${filename}:`, err);
        }
      }
    }

    // Filter by subcategories if specified
    if (subcategories) {
      const subKeys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
      let targetCategoryNames = [];
      for (const key of subKeys) {
        const mapped = subcategoryMap[key];
        if (mapped) {
          if (Array.isArray(mapped)) {
            targetCategoryNames = targetCategoryNames.concat(mapped);
          } else {
            targetCategoryNames.push(mapped);
          }
        }
      }
      if (targetCategoryNames.length > 0) {
        allEntries = allEntries.filter(entry => 
          targetCategoryNames.includes(entry.category) || 
          targetCategoryNames.includes(entry.section)
        );
      }
    } else {
      const targetCategoryName = subcategoryMap[subject];
      if (targetCategoryName) {
        if (Array.isArray(targetCategoryName)) {
          allEntries = allEntries.filter(entry => 
            targetCategoryName.includes(entry.category) || 
            targetCategoryName.includes(entry.section)
          );
        } else {
          allEntries = allEntries.filter(entry => 
            entry.category === targetCategoryName || 
            entry.section === targetCategoryName
          );
        }
      }
    }

    if (allEntries.length === 0) {
      return res.status(404).json({ error: 'ไม่พบฐานข้อมูลข้อความรู้สำหรับหมวดวิชาที่ต้องการ' });
    }

    // Shuffle and pick terms
    const shuffledTerms = allEntries.sort(() => 0.5 - Math.random());
    const selectedTerms = shuffledTerms.slice(0, numCount);

    // Call Gemini API in sequence (with a tiny delay to avoid rate limits)
    const generatedQuestions = [];
    for (let i = 0; i < selectedTerms.length; i++) {
      const term = selectedTerms[i];
      let genQ = await generateQuestionFromTerm(term, apiKey);
      
      if (genQ) {
        generatedQuestions.push(genQ);
      } else {
        // Fallback: If Gemini failed to generate, pull a pre-saved question from question_bank files
        console.log(`[DBEXAM Fallback] Fetching pre-saved question for term: ${term.term}`);
        const qbDir = path.join(absoluteCwd, 'question_bank');
        
        // Find which question bank files map to this category
        const subcategoryFiles = {
          "secretariat_general": ["บททั่วไป.json", "นิยาม.json"],
          "secretariat_types": ["ชนิดของหนังสือ.json", "หมวด_๑_ชนิดของหนังสือ.json"],
          "secretariat_receiving": ["หมวด_๒_การรับและส่งหนังสือ.json"],
          "secretariat_keeping": ["หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json"],
          "secretariat_standards": ["หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json"],
          "secretariat_e_sarabarn": ["หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json"],
          "secretariat_appendix": ["ภาคผนวก.json"],
          
          // Law subcategories
          "general_law_state": ["กฎหมายเบื้องต้น.json"],
          "history_hierarchy": ["กฎหมายเบื้องต้น.json"],
          "constitution": ["กฎหมายเบื้องต้น.json"],
          "administrative": ["กฎหมายเบื้องต้น.json"],
          "civil_person": ["กฎหมายเบื้องต้น.json"],
          "civil_juristic_debt": ["กฎหมายเบื้องต้น.json"],
          "civil_property": ["กฎหมายเบื้องต้น.json"],
          "civil_family": ["กฎหมายเบื้องต้น.json"],
          "civil_inheritance": ["กฎหมายเบื้องต้น.json"],
          "criminal_general": ["กฎหมายเบื้องต้น.json"],
          "criminal_offense": ["กฎหมายเบื้องต้น.json"],
          "consumer_protection": ["กฎหมายเบื้องต้น.json"],
          "intellectual_property": ["กฎหมายเบื้องต้น.json"],
          "labor": ["กฎหมายเบื้องต้น.json"],
          "tax": ["กฎหมายเบื้องต้น.json"],
          "registration_id_military": ["กฎหมายเบื้องต้น.json"],
          "narcotics": ["กฎหมายเบื้องต้น.json"],
          "daily_life": ["กฎหมายเบื้องต้น.json"]
        };

        let mappedFiles = [];
        if (subcategories) {
          const keys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
          for (const key of keys) {
            if (subcategoryFiles[key]) {
              mappedFiles = mappedFiles.concat(subcategoryFiles[key]);
            }
          }
        }
        if (mappedFiles.length === 0) {
          if (subject === 'law') {
            mappedFiles = ["กฎหมายเบื้องต้น.json"];
          } else {
            mappedFiles = [
              "บททั่วไป.json", "นิยาม.json", "ชนิดของหนังสือ.json", 
              "หมวด_๑_ชนิดของหนังสือ.json", "หมวด_๒_การรับและส่งหนังสือ.json", 
              "หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json", 
              "หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json", 
              "หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json", "ภาคผนวก.json"
            ];
          }
        }
        mappedFiles = [...new Set(mappedFiles)];

        let fallbackBank = [];
        for (const file of mappedFiles) {
          const filePath = path.join(qbDir, file);
          if (fs.existsSync(filePath)) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              const data = JSON.parse(content);
              fallbackBank = fallbackBank.concat(data.entries || []);
            } catch (e) {}
          }
        }

        if (fallbackBank.length > 0) {
          const randomSaved = fallbackBank[Math.floor(Math.random() * fallbackBank.length)];
          const choices = randomSaved.choices || [randomSaved.choice1, randomSaved.choice2, randomSaved.choice3, randomSaved.choice4];
          generatedQuestions.push({
            questionText: randomSaved.question || randomSaved.questionText || 'ข้อคำถามจากคลังข้อสอบ',
            choices: choices,
            answer: randomSaved.answer || 'A',
            explanation: randomSaved.explanation || 'คำอธิบายเฉลย...',
            subcategory: randomSaved.subcategory || randomSaved.section || 'งานสารบรรณ',
            document: randomSaved.document || 'งานสารบรรณ',
            source_line: randomSaved.source_line || ''
          });
        }
      }

      // Add a 300ms delay between Gemini API calls to respect rate limits
      if (i < selectedTerms.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Run batch verification on the generated DB questions against the source terms
    console.log(`[DBEXAM Verifier] Running verification for ${generatedQuestions.length} questions...`);
    const verResults = await verifyQuestionsBatch(generatedQuestions, selectedTerms, apiKey);

    // Process verification results
    const verifiedQuestions = [];
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      const result = verResults && verResults[i];

      if (!result || result.pass === true || (result.score && result.score >= 70)) {
        verifiedQuestions.push(q);
      } else {
        console.log(`[DBEXAM Verifier] Question ${i} failed. Score: ${result.score}, Reason: ${result.reason}`);
        
        // Fallback: Pull a pre-saved question from question_bank files
        const qbDir = path.join(absoluteCwd, 'question_bank');
        const subcategoryFiles = {
          "secretariat_general": ["บททั่วไป.json", "นิยาม.json"],
          "secretariat_types": ["ชนิดของหนังสือ.json", "หมวด_๑_ชนิดของหนังสือ.json"],
          "secretariat_receiving": ["หมวด_๒_การรับและส่งหนังสือ.json"],
          "secretariat_keeping": ["หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json"],
          "secretariat_standards": ["หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json"],
          "secretariat_e_sarabarn": ["หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json"],
          "secretariat_appendix": ["ภาคผนวก.json"],
          
          // Law subcategories
          "general_law_state": ["กฎหมายเบื้องต้น.json"],
          "history_hierarchy": ["กฎหมายเบื้องต้น.json"],
          "constitution": ["กฎหมายเบื้องต้น.json"],
          "administrative": ["กฎหมายเบื้องต้น.json"],
          "civil_person": ["กฎหมายเบื้องต้น.json"],
          "civil_juristic_debt": ["กฎหมายเบื้องต้น.json"],
          "civil_property": ["กฎหมายเบื้องต้น.json"],
          "civil_family": ["กฎหมายเบื้องต้น.json"],
          "civil_inheritance": ["กฎหมายเบื้องต้น.json"],
          "criminal_general": ["กฎหมายเบื้องต้น.json"],
          "criminal_offense": ["กฎหมายเบื้องต้น.json"],
          "consumer_protection": ["กฎหมายเบื้องต้น.json"],
          "intellectual_property": ["กฎหมายเบื้องต้น.json"],
          "labor": ["กฎหมายเบื้องต้น.json"],
          "tax": ["กฎหมายเบื้องต้น.json"],
          "registration_id_military": ["กฎหมายเบื้องต้น.json"],
          "narcotics": ["กฎหมายเบื้องต้น.json"],
          "daily_life": ["กฎหมายเบื้องต้น.json"]
        };

        let mappedFiles = [];
        if (subcategories) {
          const keys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
          for (const key of keys) {
            if (subcategoryFiles[key]) {
              mappedFiles = mappedFiles.concat(subcategoryFiles[key]);
            }
          }
        }
        if (mappedFiles.length === 0) {
          if (subject === 'law') {
            mappedFiles = ["กฎหมายเบื้องต้น.json"];
          } else {
            mappedFiles = [
              "บททั่วไป.json", "นิยาม.json", "ชนิดของหนังสือ.json", 
              "หมวด_๑_ชนิดของหนังสือ.json", "หมวด_๒_การรับและส่งหนังสือ.json", 
              "หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json", 
              "หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json", 
              "หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json", "ภาคผนวก.json"
            ];
          }
        }
        mappedFiles = [...new Set(mappedFiles)];

        let fallbackBank = [];
        for (const file of mappedFiles) {
          const filePath = path.join(qbDir, file);
          if (fs.existsSync(filePath)) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              const data = JSON.parse(content);
              fallbackBank = fallbackBank.concat(data.entries || []);
            } catch (e) {}
          }
        }

        if (fallbackBank.length > 0) {
          const randomSaved = fallbackBank[Math.floor(Math.random() * fallbackBank.length)];
          const choices = randomSaved.choices || [randomSaved.choice1, randomSaved.choice2, randomSaved.choice3, randomSaved.choice4];
          verifiedQuestions.push({
            questionText: randomSaved.question || randomSaved.questionText || 'ข้อคำถามจากคลังข้อสอบ',
            choices: choices,
            answer: randomSaved.answer || 'A',
            explanation: randomSaved.explanation || 'คำอธิบายเฉลย...',
            subcategory: randomSaved.subcategory || randomSaved.section || 'งานสารบรรณ',
            document: randomSaved.document || 'งานสารบรรณ',
            source_line: randomSaved.source_line || ''
          });
        } else {
          // Keep it as a last resort
          verifiedQuestions.push(q);
        }
      }
    }

    // Map into standard structure with mock IDs
    const processed = verifiedQuestions.map((q, idx) => {
      const choices = q.choices || [];
      const charMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      const correctAnsIdx = charMap[q.answer.toUpperCase()] !== undefined ? charMap[q.answer.toUpperCase()] : 0;

      return {
        id: `dbexam-gen-${subject}-${idx}-${Date.now()}`,
        questionText: q.questionText,
        choice1: choices[0] || 'ตัวเลือก ก',
        choice2: choices[1] || 'ตัวเลือก ข',
        choice3: choices[2] || 'ตัวเลือก ค',
        choice4: choices[3] || 'ตัวเลือก ง',
        correctAnswer: correctAnsIdx,
        explanation: q.explanation || 'เฉลยรายละเอียด...',
        subcategory: q.subcategory || 'งานสารบรรณ',
        examSet: {
          category: subject,
          subcategory: q.subcategory || 'งานสารบรรณ'
        }
      };
    });

    res.json(processed);
  } catch (err) {
    console.error('Failed to generate DBEXAM questions directly:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อสอบจากระบบคลังข้อสอบ' });
  }
});

// Get mock exam (150 questions grouped by subject)
app.get('/api/exams/mock', authenticateToken, async (req, res) => {
  const { track } = req.query;
  if (!track || !['suppression', 'forensics', 'administrative'].includes(track)) {
    return res.status(400).json({ error: 'กรุณาระบุสายงานที่ต้องการสอบจำลองให้ถูกต้อง' });
  }

  // Distribution for suppression
  const suppressionDist = {
    general: 30,
    english: 30,
    thai: 25,
    computer: 25,
    law: 20,
    social: 20
  };

  // Distribution for forensics and administrative
  const forensicsDist = {
    general: 20,
    thai: 20,
    english: 15,
    computer: 40,
    law: 25,
    secretariat: 30
  };

  const dist = track === 'suppression' ? suppressionDist : forensicsDist;
  const categoriesOrder = ['general', 'thai', 'english', 'computer', 'social', 'secretariat', 'law'];

  try {
    await ensureDefaultQuestions();
    const selectedIds = [];

    for (const [cat, count] of Object.entries(dist)) {
      const list = await prisma.question.findMany({
        where: { examSet: { category: cat } },
        select: { id: true }
      });
      const ids = list.map(q => q.id);

      // Shuffle
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }

      const picked = ids.slice(0, count);
      selectedIds.push(...picked);
    }

    if (selectedIds.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อสอบจำลองในระบบ' });
    }

    // Fetch full questions
    const questions = await prisma.question.findMany({
      where: { id: { in: selectedIds } },
      include: {
        examSet: {
          select: { category: true, subcategory: true }
        }
      }
    });

    // Group/Sort questions by category order to prevent mixing them up
    questions.sort((a, b) => {
      const catA = a.examSet?.category || '';
      const catB = b.examSet?.category || '';
      return categoriesOrder.indexOf(catA) - categoriesOrder.indexOf(catB);
    });

    res.json(questions);
  } catch (err) {
    console.error('Fetch Mock Exam Error:', err);
    res.status(500).json({ error: 'ไม่สามารถสร้างข้อสอบจำลองเสมือนจริงได้' });
  }
});

async function generateSimilarQuestion(q) {
  const apiKey = await getGeminiApiKey();
  const model = 'gemini-2.5-flash';
  const subjectMeta = {
    general: { name: 'ความรู้ทั่วไป' },
    thai: { name: 'ภาษาไทย' },
    english: { name: 'ภาษาอังกฤษ' },
    computer: { name: 'คอมพิวเตอร์' },
    social: { name: 'สังคมและจริยธรรม' },
    secretariat: { name: 'งานสารบรรณ' },
    law: { name: 'กฎหมายเบื้องต้น' }
  };
  const catName = subjectMeta[q.examSet?.category]?.name || q.examSet?.category || 'ทั่วไป';
  const subName = q.examSet?.subcategory || 'ทั่วไป';

  const systemPrompt = `คุณคืออาจารย์ผู้เชี่ยวชาญการออกข้อสอบสำหรับการสอบนายสิบตำรวจของไทย
กรุณาสร้างข้อสอบที่มีความคล้ายคลึงกัน (โจทย์แนวเดียวกัน เพื่อวัดความเข้าใจ) จำนวน 1 ข้อ โดยอ้างอิงจากข้อสอบต้นแบบดังนี้:

ข้อสอบต้นแบบ:
- หมวดวิชา: ${catName}
- เรื่อง: ${subName}
- โจทย์: ${q.questionText}
- ตัวเลือก ก (0): ${q.choice1}
- ตัวเลือก ข (1): ${q.choice2}
- ตัวเลือก ค (2): ${q.choice3}
- ตัวเลือก ง (3): ${q.choice4}
- เฉลยที่ถูกต้อง: ตัวเลือกดัชนีที่ ${q.correctAnswer}

กรุณาสร้างข้อสอบข้อใหม่ 1 ข้อที่เป็นเรื่องเดียวกัน มีแนวคิดหรือจุดประสงค์ประเมินความรู้คล้ายกับข้อต้นแบบ แต่เปลี่ยนโจทย์และตัวเลือกไม่ให้ซ้ำกัน (เช่น เปลี่ยนตัวละคร สถานการณ์ ตัวเลข หรือการหลอกในเนื้อหา)
ผลลัพธ์ที่คุณต้องตอบกลับคือ JSON Object เพียงตัวเดียวเท่านั้น โดยมีโครงสร้างดังนี้:
{
  "questionText": "โจทย์คำถามใหม่...",
  "choice1": "ตัวเลือก ก...",
  "choice2": "ตัวเลือก ข...",
  "choice3": "ตัวเลือก ค...",
  "choice4": "ตัวเลือก ง...",
  "correctAnswer": 0
}
หมายเหตุ: "correctAnswer" จะต้องเป็นจำนวนเต็มดัชนี (0, 1, 2, หรือ 3) เท่านั้น ซึ่งตรงกับตัวเลือกที่ถูกต้อง`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No content returned');

    const parsed = JSON.parse(rawText.trim());
    return {
      id: `ai-${q.id}`,
      examSetId: q.examSetId,
      questionText: parsed.questionText || parsed.question || 'คำถามที่คล้ายกัน',
      choice1: parsed.choice1 || parsed.choices?.[0] || 'ตัวเลือก ก',
      choice2: parsed.choice2 || parsed.choices?.[1] || 'ตัวเลือก ข',
      choice3: parsed.choice3 || parsed.choices?.[2] || 'ตัวเลือก ค',
      choice4: parsed.choice4 || parsed.choices?.[3] || 'ตัวเลือก ง',
      correctAnswer: typeof parsed.correctAnswer === 'number' ? parsed.correctAnswer : 0,
      examSet: {
        category: q.examSet?.category,
        subcategory: `${q.examSet?.subcategory || 'ทั่วไป'} (โจทย์คล้ายกัน)`
      }
    };
  } catch (err) {
    console.error(`Error generating similar question for Q#${q.id}:`, err);
    return null;
  }
}

// Get weakness questions
app.get('/api/exams/weakness-questions', authenticateToken, async (req, res) => {
  const { subject } = req.query;
  try {
    const userId = req.user.userId;
    const whereClause = { userId };
    
    if (subject) {
      whereClause.question = {
        examSet: { category: subject }
      };
    }

    const incorrect = await prisma.incorrectQuestion.findMany({
      where: whereClause,
      include: {
        question: {
          include: {
            examSet: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let originalQuestions = incorrect.map(item => item.question).filter(Boolean);

    if (originalQuestions.length === 0 && subject) {
      // Fallback: Fetch standard questions of this category if no incorrect questions exist
      originalQuestions = await prisma.question.findMany({
        where: {
          examSet: { category: subject }
        },
        take: 5,
        include: { examSet: true }
      });
    }

    // Limit to top 8 to prevent rate limits and excessively long practice sets
    const limitedQuestions = originalQuestions.slice(0, 8);

    // Call Gemini API in parallel to generate similar questions for each incorrect question
    const similarPromises = limitedQuestions.map(q => generateSimilarQuestion(q));
    const similarResults = await Promise.all(similarPromises);

    // Interleave the original and similar questions
    const combinedQuestions = [];
    limitedQuestions.forEach((q, idx) => {
      combinedQuestions.push(q);
      const similarQ = similarResults[idx];
      if (similarQ) {
        combinedQuestions.push(similarQ);
      }
    });

    res.json(combinedQuestions);
  } catch (err) {
    console.error('Fetch Weakness Questions Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อสอบจุดอ่อนได้' });
  }
});

// Get user weaknesses count summary
app.get('/api/user/weaknesses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const incorrect = await prisma.incorrectQuestion.findMany({
      where: { userId },
      include: {
        question: {
          include: { examSet: true }
        }
      }
    });

    const summary = {
      general: 0,
      thai: 0,
      english: 0,
      computer: 0,
      social: 0,
      secretariat: 0,
      law: 0
    };

    const breakdownMap = {};

    incorrect.forEach(item => {
      const q = item.question;
      if (!q || !q.examSet) return;
      const cat = q.examSet.category;
      const sub = q.examSet.subcategory || 'ทั่วไป';

      if (cat && summary[cat] !== undefined) {
        summary[cat]++;
      }

      const key = `${cat}::${sub}`;
      if (!breakdownMap[key]) {
        breakdownMap[key] = {
          category: cat,
          subcategory: sub,
          wrongCount: 0
        };
      }
      breakdownMap[key].wrongCount++;
    });

    res.json({
      ...summary,
      summary,
      breakdown: Object.values(breakdownMap)
    });
  } catch (err) {
    console.error('Fetch Weaknesses Summary Error:', err);
    res.status(500).json({ error: 'ไม่สามารถคำนวณจุดอ่อนได้' });
  }
});

// Get queue status for a specific pending exam
app.get('/api/exams/user-queue-status/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const examSet = await prisma.examSet.findUnique({
      where: { id: parseInt(id) }
    });
    if (!examSet) {
      return res.status(404).json({ error: 'ไม่พบชุดข้อสอบนี้' });
    }

    if (examSet.status === 'COMPLETED') {
      return res.json({ status: 'COMPLETED', examSetId: examSet.id });
    }
    if (examSet.status === 'FAILED') {
      return res.json({ status: 'FAILED', error: 'การสร้างข้อสอบล้มเหลว' });
    }

    const queuePosition = await prisma.examSet.count({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
        createdAt: { lt: examSet.createdAt }
      }
    }) + 1;

    res.json({
      status: examSet.status,
      queuePosition
    });
  } catch (err) {
    console.error('Queue Status Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถานะคิวได้' });
  }
});

// API for user to generate AI exam set
app.post('/api/exams/user-generate', authenticateToken, async (req, res) => {
  const { subject, count, subcategories, isPublic, title } = req.body;
  if (!subject) {
    return res.status(400).json({ error: 'กรุณาระบุหมวดวิชาที่ต้องการ' });
  }

  const numCount = Math.min(30, Math.max(5, parseInt(count) || 10));

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
    }

    // Check daily limit (5 sets per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentGenCount = user.aiGenCount;
    if (user.aiGenLastDate) {
      const lastDate = new Date(user.aiGenLastDate);
      lastDate.setHours(0, 0, 0, 0);
      if (lastDate.getTime() !== today.getTime()) {
        currentGenCount = 0;
      }
    } else {
      currentGenCount = 0;
    }

    if (currentGenCount >= 5) {
      return res.status(400).json({ error: 'คุณสร้างข้อสอบครบกำหนด 5 ชุดในวันนี้แล้ว' });
    }

    // Update user daily limit counter
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        aiGenCount: currentGenCount + 1,
        aiGenLastDate: new Date()
      }
    });

    // Create pending exam set
    const subString = Array.isArray(subcategories) ? subcategories.join(',') : (subcategories || '');
    const newExamSet = await prisma.examSet.create({
      data: {
        title: title || `ข้อสอบ AI - ${subject === 'law' ? 'กฎหมาย' : 'งานสารบรรณ'} (${numCount} ข้อ)`,
        category: subject,
        subcategory: subString || null,
        totalCount: numCount,
        isPublic: isPublic !== false,
        status: 'PENDING',
        createdById: req.user.userId
      }
    });

    // Calculate queue position
    const queuePosition = await prisma.examSet.count({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
        createdAt: { lt: newExamSet.createdAt }
      }
    }) + 1;

    res.json({
      message: 'กำลังอยู่ในคิวสร้างข้อสอบ...',
      examSetId: newExamSet.id,
      queuePosition,
      status: 'PENDING'
    });
  } catch (err) {
    console.error('User Generate Exam Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสั่งสร้างข้อสอบ' });
  }
});

// Get all available exams for students (with public/private and queue status logic)
app.get('/api/exams', authenticateToken, async (req, res) => {
  try {
    await ensureDefaultQuestions();
    
    // Check user role
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'OWNER');
    
    let whereClause = {};
    if (!isAdmin) {
      whereClause = {
        OR: [
          // Public, completed exams from anyone
          { isPublic: true, status: 'COMPLETED' },
          // Any exam (pending, processing, completed) created by the user themselves
          { createdById: req.user.userId }
        ]
      };
    }
    
    const exams = await prisma.examSet.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
    res.json(exams);
  } catch (err) {
    console.error('Fetch Student Exams Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงรายชื่อชุดข้อสอบได้' });
  }
});

// Get questions of a specific exam set (with security boundaries)
app.get('/api/exams/:id/questions', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const examSet = await prisma.examSet.findUnique({
      where: { id: parseInt(id) }
    });

    if (!examSet) {
      return res.status(404).json({ error: 'ไม่พบชุดข้อสอบนี้' });
    }

    if (examSet.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'ข้อสอบชุดนี้ยังสร้างไม่เสร็จ กรุณารอข้อสอบสักครู่...' });
    }

    // Check user roles
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'OWNER');

    if (!examSet.isPublic && examSet.createdById !== req.user.userId && !isAdmin) {
      return res.status(403).json({ error: 'ชุดข้อสอบนี้ถูกตั้งค่าเป็นส่วนตัว' });
    }

    const questions = await prisma.question.findMany({
      where: { examSetId: parseInt(id) },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(questions);
  } catch (err) {
    console.error('Fetch Student Questions Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงคำถามของชุดข้อสอบได้' });
  }
});

// --- Simulate/Submit Exam Completion Route ---
app.post('/api/user/simulate-exam', authenticateToken, async (req, res) => {
  const { subject, isWeaknessFix, examSetId, score, questions } = req.body;

  const validSubjects = {
    general: 'scoreGeneral',
    thai: 'scoreThai',
    english: 'scoreEnglish',
    computer: 'scoreComputer',
    social: 'scoreSocial',
    secretariat: 'scoreSecretariat',
    law: 'scoreLaw'
  };

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    let resolvedSubject = subject;
    let examTitle = '';

    // If examSetId is provided, get the real category and title
    if (examSetId) {
      const examSet = await prisma.examSet.findUnique({
        where: { id: parseInt(examSetId) }
      });
      if (examSet) {
        resolvedSubject = examSet.category;
        examTitle = examSet.title;
        
        // Find or create Stage record matching this examSet title
        let stage = await prisma.stage.findFirst({
          where: { title: examSet.title }
        });
        if (!stage) {
          stage = await prisma.stage.create({
            data: {
              title: examSet.title,
              icon: '📝',
              sortOrder: 0
            }
          });
        }

        // Upsert user stage progress
        await prisma.userStageProgress.upsert({
          where: {
            userId_stageId: {
              userId: req.user.userId,
              stageId: stage.id
            }
          },
          update: {
            completed: true,
            score: Math.round(score),
            completedAt: new Date()
          },
          create: {
            userId: req.user.userId,
            stageId: stage.id,
            completed: true,
            score: Math.round(score),
            completedAt: new Date()
          }
        });
      }
    }

    const subjectField = validSubjects[resolvedSubject];
    if (!subjectField && (!questions || !Array.isArray(questions))) {
      return res.status(400).json({ error: 'ไม่พบหมวดวิชาดังกล่าว' });
    }

    // Determine score: if real score is provided, use it. Otherwise do a random score (legacy fallback)
    let finalScore = score !== undefined ? Math.round(score) : null;
    if (finalScore === null) {
      if (isWeaknessFix) {
        finalScore = 80;
      } else {
        finalScore = Math.floor(Math.random() * 21) + 75; // 75 - 95 (mock)
      }
    }

    // Process incorrect questions database if questions array is provided
    if (questions && Array.isArray(questions)) {
      // Record wrong categories for incorrect answers
      for (const q of questions) {
        const isQuestionCorrect = q.isCorrect === true || q.isCorrect === 'true';
        if (!isQuestionCorrect) {
          let catToRecord = q.category;
          if (!catToRecord) {
            const qId = parseInt(q.id);
            if (!isNaN(qId)) {
              try {
                const dbQ = await prisma.question.findUnique({
                  where: { id: qId },
                  include: { examSet: true }
                });
                catToRecord = dbQ?.examSet?.category;
              } catch (e) {}
            }
          }
          if (!catToRecord) {
            catToRecord = resolvedSubject;
          }
          if (catToRecord) {
            try {
              await prisma.wrongCategory.upsert({
                where: {
                  userId_category: {
                    userId: req.user.userId,
                    category: catToRecord
                  }
                },
                update: {
                  count: { increment: 1 }
                },
                create: {
                  userId: req.user.userId,
                  category: catToRecord,
                  count: 1
                }
              });
            } catch (e) {
              console.error('Error recording wrong category:', e);
            }
          }
        }
      }

      if (isWeaknessFix) {
        // Group results of weakness practice
        const originalResults = {}; // { [questionId]: { originalCorrect: null, similarCorrect: null } }

        for (const q of questions) {
          const idStr = String(q.id);
          const isCorrectVal = q.isCorrect === true || q.isCorrect === 'true';
          if (idStr.startsWith('ai-')) {
            const parentId = parseInt(idStr.replace('ai-', ''));
            if (!isNaN(parentId)) {
              if (!originalResults[parentId]) {
                originalResults[parentId] = { originalCorrect: null, similarCorrect: null };
              }
              originalResults[parentId].similarCorrect = isCorrectVal;
            }
          } else {
            const originalId = parseInt(idStr);
            if (!isNaN(originalId)) {
              if (!originalResults[originalId]) {
                originalResults[originalId] = { originalCorrect: null, similarCorrect: null };
              }
              originalResults[originalId].originalCorrect = isCorrectVal;
            }
          }
        }

        // Now process each original question
        for (const [qIdStr, result] of Object.entries(originalResults)) {
          const qId = parseInt(qIdStr);
          // If user got both the original question and the similar question correct, remove it from IncorrectQuestion.
          // Otherwise, we keep/upsert it in the database.
          const isCorrect = (result.similarCorrect !== null)
            ? (result.originalCorrect === true && result.similarCorrect === true)
            : (result.originalCorrect === true);

          if (isCorrect) {
            try {
              await prisma.incorrectQuestion.deleteMany({
                where: {
                  userId: req.user.userId,
                  questionId: qId
                }
              });
            } catch (e) {
              console.error('Error deleting correct question:', e);
            }
          } else {
            try {
              await prisma.incorrectQuestion.upsert({
                where: {
                  userId_questionId: {
                    userId: req.user.userId,
                    questionId: qId
                  }
                },
                update: {},
                create: {
                  userId: req.user.userId,
                  questionId: qId
                }
              });
            } catch (e) {
              console.error('Error upserting incorrect question:', e);
            }
          }
        }
      } else {
        // Normal exam: simple delete/upsert per question ID
        for (const q of questions) {
          const qId = parseInt(q.id);
          if (isNaN(qId)) continue; // skip AI questions if sent somehow

          const isQuestionCorrect = q.isCorrect === true || q.isCorrect === 'true';
          if (isQuestionCorrect) {
            try {
              await prisma.incorrectQuestion.deleteMany({
                where: {
                  userId: req.user.userId,
                  questionId: qId
                }
              });
            } catch (e) {
              console.error('Error deleting correct question:', e);
            }
          } else {
            try {
              await prisma.incorrectQuestion.upsert({
                where: {
                  userId_questionId: {
                    userId: req.user.userId,
                    questionId: qId
                  }
                },
                update: {},
                create: {
                  userId: req.user.userId,
                  questionId: qId
                }
              });
            } catch (e) {
              console.error('Error upserting incorrect question:', e);
            }
          }
        }
      }
    }

    // If questions are provided, calculate running average updates for all categories present (only for Daily/Mock/Weakness exams, i.e., no single examSetId)
    if (questions && Array.isArray(questions) && questions.length > 0 && !examSetId) {
      const dbIds = questions.map(q => {
        const idStr = String(q.id);
        if (idStr.startsWith('ai-')) {
          return parseInt(idStr.replace('ai-', ''));
        }
        return parseInt(idStr);
      }).filter(id => !isNaN(id));

      const questionDbRecords = await prisma.question.findMany({
        where: { id: { in: dbIds } },
        include: { examSet: true }
      });

      const categoryResults = {};
      questions.forEach(q => {
        const idStr = String(q.id);
        const qId = idStr.startsWith('ai-') ? parseInt(idStr.replace('ai-', '')) : parseInt(idStr);
        
        const dbQ = questionDbRecords.find(item => item.id === qId);
        const cat = dbQ?.examSet?.category;
        if (cat) {
          if (!categoryResults[cat]) {
            categoryResults[cat] = { total: 0, correct: 0 };
          }
          categoryResults[cat].total++;
          const isCorrectVal = q.isCorrect === true || q.isCorrect === 'true';
          if (isCorrectVal) {
            categoryResults[cat].correct++;
          }
        }
      });

      const updateData = {};
      for (const [cat, res] of Object.entries(categoryResults)) {
        const fieldName = validSubjects[cat];
        if (fieldName) {
          const catPercent = Math.round((res.correct / res.total) * 100);
          const currentScore = currentUser[fieldName] || 0;
          // Use running average
          const newAvg = currentScore > 0 ? Math.round((currentScore + catPercent) / 2) : catPercent;
          updateData[fieldName] = newAvg;
        }
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: updateData
        });
      }
    }

    // Average score updating: calculate the average score of all completed sets in this category for single subject exams
    let newScore = finalScore;
    if (subjectField && examSetId) {
      const userProgress = await prisma.userStageProgress.findMany({
        where: {
          userId: req.user.userId,
          completed: true
        },
        include: { stage: true }
      });

      // Find all exam sets in this category
      const categoryExamSets = await prisma.examSet.findMany({
        where: { category: resolvedSubject },
        select: { title: true }
      });
      const categoryTitles = categoryExamSets.map(es => es.title);

      // Filter to only include completed stages that match exam sets in this category
      const categoryProgress = userProgress.filter(up => categoryTitles.includes(up.stage.title));

      if (categoryProgress.length > 0) {
        const total = categoryProgress.reduce((sum, p) => sum + p.score, 0);
        newScore = Math.round(total / categoryProgress.length);
      }
    }

    const newPoints = currentUser.points + 1;
    const newXp = currentUser.xp + 40;
    let newLevel = currentUser.level;

    let levelUp = false;
    let tempXp = newXp;
    while (tempXp >= 100) {
      tempXp = tempXp - 100;
      newLevel += 1;
      levelUp = true;
    }

    // Update streak if completed exam today
    const newStreak = currentUser.streak === 0 ? 1 : currentUser.streak; // simple streak increment placeholder or retain

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(subjectField && examSetId ? { [subjectField]: newScore } : {}),
        points: newPoints,
        xp: tempXp,
        level: newLevel,
        pigLevel: newLevel,
        pigXp: tempXp,
        streak: newStreak
      }
    });

    let message = `ทำข้อสอบสำเร็จ! คะแนนวิชา${examTitle || resolvedSubject}เฉลี่ยอัปเดตเป็น ${newScore}%`;
    if (isWeaknessFix) {
      message = 'ติวกลบจุดอ่อนสำเร็จ! คะแนนวิชานี้เพิ่มขึ้นแล้ว';
    } else if (score !== undefined) {
      message = `สอบเสร็จสิ้น! ได้คะแนน ${finalScore}% อัปเดตข้อมูลความพร้อมแล้ว`;
    }

    res.json({
      message,
      levelUp,
      user: {
        points: updatedUser.points,
        level: updatedUser.level,
        xp: updatedUser.xp,
        scoreGeneral: updatedUser.scoreGeneral,
        scoreThai: updatedUser.scoreThai,
        scoreEnglish: updatedUser.scoreEnglish,
        scoreComputer: updatedUser.scoreComputer,
        scoreSocial: updatedUser.scoreSocial,
        scoreSecretariat: updatedUser.scoreSecretariat,
        scoreLaw: updatedUser.scoreLaw
      }
    });
  } catch (err) {
    console.error('Submit Exam Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลสอบเข้าระบบ' });
  }
});

// --- Wrong Categories, Bookmarks, and Reports Routes ---

// GET stats of wrong categories
app.get('/api/user/wrong-categories', authenticateToken, async (req, res) => {
  try {
    const stats = await prisma.wrongCategory.findMany({
      where: { userId: req.user.userId },
      orderBy: { count: 'desc' }
    });
    res.json(stats);
  } catch (err) {
    console.error('Error fetching wrong categories:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถิติข้อผิดพลาดได้' });
  }
});

// GET all bookmarks
app.get('/api/user/bookmarks', authenticateToken, async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookmarks);
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อสอบที่บันทึกไว้ได้' });
  }
});

// POST to add/update a bookmark
app.post('/api/user/bookmarks', authenticateToken, async (req, res) => {
  const { questionId, questionText, choice1, choice2, choice3, choice4, correctAnswer, explanation, category, subcategory } = req.body;
  if (!questionId || !questionText) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_questionId: {
          userId: req.user.userId,
          questionId: String(questionId)
        }
      },
      update: {
        questionText,
        choice1,
        choice2,
        choice3,
        choice4,
        correctAnswer: parseInt(correctAnswer),
        explanation,
        category,
        subcategory
      },
      create: {
        userId: req.user.userId,
        questionId: String(questionId),
        questionText,
        choice1,
        choice2,
        choice3,
        choice4,
        correctAnswer: parseInt(correctAnswer),
        explanation,
        category,
        subcategory
      }
    });
    res.json({ message: 'บันทึกข้อสอบเรียบร้อยแล้ว', bookmark });
  } catch (err) {
    console.error('Error adding bookmark:', err);
    res.status(500).json({ error: 'ไม่สามารถบันทึกข้อสอบได้' });
  }
});

// DELETE to remove a bookmark
app.delete('/api/user/bookmarks/:questionId', authenticateToken, async (req, res) => {
  const { questionId } = req.params;
  try {
    await prisma.bookmark.deleteMany({
      where: {
        userId: req.user.userId,
        questionId: String(questionId)
      }
    });
    res.json({ message: 'ยกเลิกการบันทึกข้อสอบเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error deleting bookmark:', err);
    res.status(500).json({ error: 'ไม่สามารถยกเลิกการบันทึกข้อสอบได้' });
  }
});

// POST to report a question
app.post('/api/user/reports', authenticateToken, async (req, res) => {
  const { questionId, questionText, reason } = req.body;
  if (!questionId || !questionText || !reason) {
    return res.status(400).json({ error: 'กรุณากรอกเหตุผลและข้อมูลข้อสอบที่ต้องการรายงาน' });
  }

  try {
    const report = await prisma.reportedQuestion.create({
      data: {
        userId: req.user.userId,
        questionId: String(questionId),
        questionText,
        reason
      }
    });
    res.json({ message: 'ส่งรายงานข้อสอบเรียบร้อยแล้ว ขอบคุณสำหรับการแจ้งข้อมูล' });
  } catch (err) {
    console.error('Error reporting question:', err);
    res.status(500).json({ error: 'ไม่สามารถส่งรายงานข้อสอบได้' });
  }
});

// --- Admin API Routes (Implementation located below) ---

// --- Announcements Routes ---

// Get all announcements, seed 2 real ones if database is empty
app.get('/api/announcements', async (req, res) => {
  try {
    let announcements = await prisma.announcement.findMany({
      orderBy: { id: 'asc' }
    });

    // Seed default data if empty
    if (announcements.length === 0) {
      const defaultAnnouncements = [
        {
          orgName: 'กองบัญชาการศึกษา',
          orgAbbr: 'บช.ศ.',
          jobTitle: 'กลุ่มสายงานอำนวยการและสนับสนุน ม.6/ปวช.',
          positionsCount: 800,
          year: 2569,
          announcementDate: 'วันที่ 26 พ.ค. 69',
          registerDate: 'รับสมัครตั้งแต่วันที่ 2 - 24 มิ.ย. 69',
          seatSelectDate: 'วันที่ 2 - 25 ก.ค. 69',
          photoEditDate: 'กรณีผลตรวจรูปถ่ายไม่ถูกต้อง (วันที่ 17 - 23 ก.ค. 69)',
          printCardDate: 'ตั้งแต่วันที่ 13 พ.ย. 69 เป็นต้นไป',
          examDate: 'วันที่ 29 พ.ย. 69',
          status: 'เปิดรับสมัครล่าสุด',
          link: 'https://policeadmission.jobthaigov.com/PEBRegisterWeb/'
        },
        {
          orgName: 'สำนักงานพิสูจน์หลักฐานตำรวจ',
          orgAbbr: 'สพฐ.ตร.',
          jobTitle: 'กลุ่มสายงานอำนวยการและสนับสนุน สายงานวิทยาการ',
          positionsCount: 100,
          year: 2569,
          announcementDate: 'วันที่ 26 พ.ค. 69',
          registerDate: 'รับสมัครตั้งแต่วันที่ 2 - 24 มิ.ย. 69',
          seatSelectDate: 'วันที่ 2 - 25 ก.ค. 69',
          photoEditDate: 'กรณีผลตรวจรูปถ่ายไม่ถูกต้อง (วันที่ 17 - 23 ก.ค. 69)',
          printCardDate: 'ตั้งแต่วันที่ 13 พ.ย. 69 เป็นต้นไป',
          examDate: 'วันที่ 29 พ.ย. 69',
          status: 'เปิดรับสมัครล่าสุด',
          link: 'https://policeadmission.jobthaigov.com/PEBRegisterWeb/'
        }
      ];

      await prisma.announcement.createMany({
        data: defaultAnnouncements
      });

      announcements = await prisma.announcement.findMany({
        orderBy: { id: 'asc' }
      });
    }

    res.json(announcements);
  } catch (err) {
    console.error('Fetch Announcements Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลประกาศได้' });
  }
});

// Create new announcement with duplicate checks
app.post('/api/announcements', requireAdmin, async (req, res) => {
  const {
    orgName, orgAbbr, jobTitle, positionsCount, year,
    announcementDate, registerDate, seatSelectDate, photoEditDate, printCardDate, examDate,
    status, link
  } = req.body;

  if (!orgName || !orgAbbr || !jobTitle || !positionsCount || !year) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (หน่วยงาน, ตัวย่อ, สายงาน, จำนวนอัตรา, ปี พ.ศ.)' });
  }

  try {
    // Exact duplicate check: same orgName, year, AND jobTitle
    const exactDuplicate = await prisma.announcement.findFirst({
      where: {
        orgName,
        year: parseInt(year),
        jobTitle
      }
    });

    if (exactDuplicate) {
      return res.status(400).json({
        error: 'พบประกาศหน่วยงานเดียวกัน ปีเดียวกัน และสายงานเดียวกันในระบบอยู่แล้ว (ห้ามบันทึกซ้ำ)',
        code: 'EXACT_DUPLICATE'
      });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        orgName,
        orgAbbr,
        jobTitle,
        positionsCount: parseInt(positionsCount),
        year: parseInt(year),
        announcementDate: announcementDate || '',
        registerDate: registerDate || '',
        seatSelectDate: seatSelectDate || '',
        photoEditDate: photoEditDate || '',
        printCardDate: printCardDate || '',
        examDate: examDate || '',
        status: status || 'เปิดรับสมัครล่าสุด',
        link: link || ''
      }
    });

    res.status(201).json({
      message: 'เพิ่มประกาศใหม่สำเร็จแล้ว!',
      announcement: newAnnouncement
    });
  } catch (err) {
    console.error('Create Announcement Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างประกาศใหม่' });
  }
});

// Update announcement
app.put('/api/announcements/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    orgName, orgAbbr, jobTitle, positionsCount, year,
    announcementDate, registerDate, seatSelectDate, photoEditDate, printCardDate, examDate,
    status, link
  } = req.body;

  if (!orgName || !orgAbbr || !jobTitle || !positionsCount || !year) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
  }

  try {
    const annId = parseInt(id);

    // Exact duplicate check for another record
    const exactDuplicate = await prisma.announcement.findFirst({
      where: {
        orgName,
        year: parseInt(year),
        jobTitle,
        NOT: { id: annId }
      }
    });

    if (exactDuplicate) {
      return res.status(400).json({
        error: 'พบประกาศหน่วยงานเดียวกัน ปีเดียวกัน และสายงานเดียวกันในระบบอยู่แล้ว',
        code: 'EXACT_DUPLICATE'
      });
    }

    const updated = await prisma.announcement.update({
      where: { id: annId },
      data: {
        orgName,
        orgAbbr,
        jobTitle,
        positionsCount: parseInt(positionsCount),
        year: parseInt(year),
        announcementDate: announcementDate || '',
        registerDate: registerDate || '',
        seatSelectDate: seatSelectDate || '',
        photoEditDate: photoEditDate || '',
        printCardDate: printCardDate || '',
        examDate: examDate || '',
        status: status || 'เปิดรับสมัครล่าสุด',
        link: link || ''
      }
    });

    res.json({
      message: 'แก้ไขประกาศสำเร็จเรียบร้อยแล้ว!',
      announcement: updated
    });
  } catch (err) {
    console.error('Update Announcement Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขประกาศ' });
  }
});

// Delete announcement
app.delete('/api/announcements/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.announcement.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'ลบประกาศสำเร็จเรียบร้อยแล้ว!' });
  } catch (err) {
    console.error('Delete Announcement Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบประกาศ' });
  }
});

// --- Feedback Routes ---

// Get all feedback, seed if empty
app.get('/api/admin/feedback', requireAdmin, async (req, res) => {
  try {
    let feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (feedback.length === 0) {
      const defaultFeedback = [
        { sender: 'สมชาย ใจดี', email: 'somchai@email.com', type: 'รายงานปัญหา', message: 'ข้อสอบหมวดวิชากฎหมายชุดที่ 3 ข้อที่ 8 เฉลยข้อ ง. แต่จริง ๆ ต้องตอบข้อ ก. รบกวนตรวจสอบด้วยครับ', read: false },
        { sender: 'สุดา แสนสุข', email: 'suda@email.com', type: 'คำแนะนำ/ขอฟีเจอร์', message: 'อยากให้เพิ่มฟังก์ชันโหมดทดลองสอบแบบจับเวลาเสมือนจริง 150 ข้อเต็มของสายสนับสนุนค่ะ จะได้ฝึกทำเร็วขึ้น', read: true },
        { sender: 'วิภา ศรีสง่า', email: 'wipa@email.com', type: 'ข้อเสนอแนะทั่วไป', message: 'ชอบระบบวิเคราะห์จุดเด่นจุดด้อยมากค่ะ ช่วยชี้แนะแนวทางติวได้ตรงประเด็นดีมาก แนะนำเพื่อน ๆ มาใช้เพียบเลย', read: true }
      ];
      await prisma.feedback.createMany({ data: defaultFeedback });
      feedback = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } });
    }
    res.json(feedback);
  } catch (err) {
    console.error('Fetch Feedback Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลข้อเสนอแนะได้' });
  }
});

// Create feedback
app.post('/api/feedback', async (req, res) => {
  const { sender, email, type, message } = req.body;
  if (!sender || !email || !type || !message) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  try {
    const feedback = await prisma.feedback.create({
      data: { sender, email, type, message }
    });
    res.status(201).json({ message: 'ส่งข้อเสนอแนะสำเร็จเรียบร้อยแล้ว!', feedback });
  } catch (err) {
    console.error('Create Feedback Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งข้อเสนอแนะ' });
  }
});

// Toggle read state
app.put('/api/admin/feedback/:id/toggle-read', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const fb = await prisma.feedback.findUnique({
      where: { id: parseInt(id) }
    });
    if (!fb) return res.status(404).json({ error: 'ไม่พบข้อความข้อเสนอแนะ' });
    
    const updated = await prisma.feedback.update({
      where: { id: parseInt(id) },
      data: { read: !fb.read }
    });
    res.json({ message: 'อัปเดตสถานะการอ่านสำเร็จ', feedback: updated });
  } catch (err) {
    console.error('Toggle Feedback Read Error:', err);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะข้อความได้' });
  }
});

// Delete feedback
app.delete('/api/admin/feedback/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.feedback.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'ลบข้อเสนอแนะสำเร็จแล้ว' });
  } catch (err) {
    console.error('Delete Feedback Error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบข้อเสนอแนะได้' });
  }
});

// =============================================
// ========== ADMIN API ROUTES =================
// =============================================

// --- Admin Stats Dashboard ---
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalExams = await prisma.examSet.count();
    const pendingPremiumCount = await prisma.premiumRequest.count({ where: { status: 'PENDING' } });
    const unreadFeedbackCount = await prisma.feedback.count({ where: { read: false } });
    
    const allProgress = await prisma.userStageProgress.findMany({
      where: { completed: true }
    });
    const totalCompletions = allProgress.length;
    const avgScore = totalCompletions > 0 
      ? Math.round(allProgress.reduce((sum, p) => sum + p.score, 0) / totalCompletions) 
      : 0;

    // Recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        level: true,
        xp: true,
        points: true,
        createdAt: true,
        stageProgress: {
          where: { completed: true }
        }
      }
    });

    const formattedRecentUsers = recentUsers.map(u => {
      const completions = u.stageProgress.filter(p => p.completed);
      const avg = completions.length > 0 
        ? Math.round(completions.reduce((s, p) => s + p.score, 0) / completions.length) 
        : 0;
      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        level: u.level,
        completionsCount: completions.length,
        avgScore: avg,
        createdAt: u.createdAt
      };
    });

    // Recent activity (last 10 stage completions + last 5 new users + last 5 exams created)
    const recentCompletions = await prisma.userStageProgress.findMany({
      where: { completed: true },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        user: { select: { fullName: true, username: true } },
        stage: { select: { title: true } }
      }
    });

    const recentNewUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { fullName: true, username: true, createdAt: true }
    });

    const recentExams = await prisma.examSet.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { title: true, createdAt: true }
    });

    // Build unified activity feed
    const activities = [];
    
    recentCompletions.forEach(c => {
      activities.push({
        type: 'completion',
        text: `<strong>${c.user.fullName || c.user.username}</strong> ทำข้อสอบ ${c.stage.title} ได้ ${c.score}%`,
        time: c.completedAt || c.stage?.createdAt,
        color: c.score >= 60 ? 'green' : 'red'
      });
    });

    recentNewUsers.forEach(u => {
      activities.push({
        type: 'new_user',
        text: `<strong>${u.fullName || u.username}</strong> สมัครสมาชิกใหม่`,
        time: u.createdAt,
        color: 'gold'
      });
    });

    recentExams.forEach(e => {
      activities.push({
        type: 'new_exam',
        text: `เพิ่มข้อสอบใหม่ <strong>${e.title}</strong>`,
        time: e.createdAt,
        color: 'blue'
      });
    });

    // Sort by time descending, take top 8
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const topActivities = activities.slice(0, 8);

    // Average user activity density by time periods (2-hour blocks)
    const completions = await prisma.userStageProgress.findMany({
      where: {
        completed: true,
        completedAt: { not: null }
      },
      select: { completedAt: true }
    });

    const uniqueDays = new Set();
    const hourlyCounts = Array(12).fill(0);

    completions.forEach(c => {
      const date = new Date(c.completedAt);
      const dayStr = date.toISOString().split('T')[0];
      uniqueDays.add(dayStr);

      const localHourStr = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', timeZone: 'Asia/Bangkok' });
      const localHour = parseInt(localHourStr, 10) || 0;
      
      const blockIndex = Math.floor(localHour / 2) % 12;
      hourlyCounts[blockIndex]++;
    });

    const totalDays = uniqueDays.size || 1;
    const weeklyData = [];
    const labels = [
      '00-02', '02-04', '04-06', '06-08', '08-10', '10-12',
      '12-14', '14-16', '16-18', '18-20', '20-22', '22-24'
    ];

    for (let i = 0; i < 12; i++) {
      const avgVal = parseFloat((hourlyCounts[i] / totalDays).toFixed(1));
      weeklyData.push({
        label: labels[i],
        count: avgVal
      });
    }

    res.json({
      totalUsers,
      totalExams,
      totalCompletions,
      avgScore,
      recentUsers: formattedRecentUsers,
      recentActivity: topActivities,
      weeklyChart: weeklyData,
      pendingPremiumCount,
      unreadFeedbackCount
    });
  } catch (err) {
    console.error('Admin Stats Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงสถิติได้' });
  }
});

// --- Admin Users List ---
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        level: true,
        xp: true,
        points: true,
        streak: true,
        premiumUntil: true,
        createdAt: true,
        stageProgress: {
          where: { completed: true }
        }
      }
    });

    const formatted = users.map(u => {
      const completions = u.stageProgress.filter(p => p.completed);
      const avg = completions.length > 0 
        ? Math.round(completions.reduce((s, p) => s + p.score, 0) / completions.length) 
        : 0;
      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        level: u.level,
        xp: u.xp,
        points: u.points,
        streak: u.streak,
        completionsCount: completions.length,
        avgScore: avg,
        createdAt: u.createdAt
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Admin Users Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงรายชื่อผู้ใช้ได้' });
  }
});

// --- Admin Toggle User Role ---
app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

    if (user.role === 'OWNER') {
      return res.status(400).json({ error: 'ไม่สามารถเปลี่ยนสิทธิ์ของเจ้าของระบบ (OWNER) ได้' });
    }

    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    res.json({ message: `เปลี่ยนสิทธิ์เป็น ${newRole} สำเร็จ` });
  } catch (err) {
    console.error('Toggle Role Error:', err);
    res.status(500).json({ error: 'ไม่สามารถเปลี่ยนสิทธิ์ได้' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

    if (targetUser.role === 'OWNER') {
      return res.status(400).json({ error: 'ไม่สามารถลบผู้ใช้อาวุโสสูงสุด (OWNER) ได้' });
    }
    
    // Find a fallback user to re-assign exams to (if any)
    const fallbackUser = await prisma.user.findFirst({
      where: {
        role: { in: ['ADMIN', 'OWNER'] },
        NOT: { id: userId }
      }
    }) || await prisma.user.findFirst({
      where: {
        NOT: { id: userId }
      }
    });

    if (fallbackUser) {
      // Re-assign exams created by this user
      await prisma.examSet.updateMany({
        where: { createdById: userId },
        data: { createdById: fallbackUser.id }
      });
    } else {
      // If no other user exists, delete the exam sets created by this user first
      await prisma.question.deleteMany({
        where: { examSet: { createdById: userId } }
      });
      await prisma.examSet.deleteMany({
        where: { createdById: userId }
      });
    }

    // Delete related stage progress first
    await prisma.userStageProgress.deleteMany({ where: { userId } });
    
    // Delete user
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้ได้: ' + err.message });
  }
});

// --- Admin Exams List ---
app.get('/api/admin/exams', requireAdmin, async (req, res) => {
  try {
    const exams = await prisma.examSet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { questions: true } }
      }
    });
    res.json(exams);
  } catch (err) {
    console.error('Admin Exams Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงรายการข้อสอบได้' });
  }
});

// --- Admin Create Exam (from AI generator) ---
app.post('/api/admin/exams', requireAdmin, async (req, res) => {
  const { title, category, subcategory, questions } = req.body;

  if (!title || !category || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    const creatorId = req.user.userId;

    const examSet = await prisma.examSet.create({
      data: {
        title,
        category,
        subcategory: subcategory || null,
        totalCount: questions.length,
        createdById: creatorId,
        questions: {
          create: questions.map((q, idx) => ({
            questionText: q.question,
            choice1: q.choices[0] || '',
            choice2: q.choices[1] || '',
            choice3: q.choices[2] || '',
            choice4: q.choices[3] || '',
            correctAnswer: q.correctAnswer || 0,
            explanation: q.explanation || null,
            sortOrder: idx
          }))
        }
      },
      include: {
        _count: { select: { questions: true } }
      }
    });

    res.status(201).json({
      message: `สร้างชุดข้อสอบ "${title}" สำเร็จ (${questions.length} ข้อ)`,
      examSet
    });
  } catch (err) {
    console.error('Create Exam Error:', err);
    res.status(500).json({ error: 'ไม่สามารถสร้างชุดข้อสอบได้: ' + err.message });
  }
});

// --- Admin Delete Exam ---
app.delete('/api/admin/exams/:id', requireAdmin, async (req, res) => {
  try {
    const examId = parseInt(req.params.id);
    
    // Questions are cascade-deleted via Prisma schema
    await prisma.examSet.delete({ where: { id: examId } });

    res.json({ message: 'ลบชุดข้อสอบสำเร็จ' });
  } catch (err) {
    console.error('Delete Exam Error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบชุดข้อสอบได้' });
  }
});

// --- Admin Questions by ExamSet ---
app.get('/api/admin/questions', requireAdmin, async (req, res) => {
  const { examSetId } = req.query;
  if (!examSetId) return res.status(400).json({ error: 'กรุณาระบุ examSetId' });

  try {
    const questions = await prisma.question.findMany({
      where: { examSetId: parseInt(examSetId) },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(questions);
  } catch (err) {
    console.error('Admin Questions Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงคำถามได้' });
  }
});

// --- Admin Update Question ---
app.put('/api/admin/questions/:id', requireAdmin, async (req, res) => {
  const { questionText, choice1, choice2, choice3, choice4, correctAnswer, explanation } = req.body;
  
  try {
    const updated = await prisma.question.update({
      where: { id: parseInt(req.params.id) },
      data: { questionText, choice1, choice2, choice3, choice4, correctAnswer, explanation }
    });
    res.json({ message: 'แก้ไขคำถามสำเร็จ', question: updated });
  } catch (err) {
    console.error('Update Question Error:', err);
    res.status(500).json({ error: 'ไม่สามารถแก้ไขคำถามได้' });
  }
});

// --- Admin Delete Question ---
app.delete('/api/admin/questions/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.question.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'ลบคำถามสำเร็จ' });
  } catch (err) {
    console.error('Delete Question Error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบคำถามได้' });
  }
});

// --- Admin Scores History ---
app.get('/api/admin/scores', requireAdmin, async (req, res) => {
  try {
    const scores = await prisma.userStageProgress.findMany({
      where: { completed: true },
      orderBy: { completedAt: 'desc' },
      take: 100,
      include: {
        user: { select: { fullName: true, username: true, email: true } },
        stage: { select: { title: true } }
      }
    });
    res.json(scores);
  } catch (err) {
    console.error('Admin Scores Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงประวัติคะแนนได้' });
  }
});

// --- Admin Feedback List Duplicate Removed ---

// --- Leaderboard Route ---
app.get('/api/leaderboard', async (req, res) => {
  try {
    // Query users who have won at least 1 battle (battleWins > 0)
    const allUsers = await prisma.user.findMany({
      where: {
        battleWins: {
          gt: 0
        }
      },
      orderBy: [
        { battleWins: 'desc' },
        { points: 'desc' }
      ],
      select: {
        id: true,
        username: true,
        fullName: true,
        level: true,
        xp: true,
        points: true,
        streak: true,
        battleWins: true
      }
    });

    const topUsers = allUsers.slice(0, 20);

    // Try to find the calling user's rank
    let myRank = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const myIndex = allUsers.findIndex(u => u.id === decoded.userId);
        if (myIndex !== -1) {
          myRank = {
            rank: myIndex + 1,
            user: allUsers[myIndex]
          };
        }
      } catch (e) {
        // Ignore token errors
      }
    }

    res.json({
      topUsers,
      myRank
    });
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลจัดอันดับได้' });
  }
});

// --- Community (Posts, Comments, Chat) Routes ---

// Get all posts (latest first)
app.get('/api/community/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, username: true, fullName: true, faceImage: true }
            }
          }
        }
      }
    });
    res.json(posts);
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดโพสต์ได้' });
  }
});

// Create a new post
app.post('/api/community/posts', authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความโพสต์' });
  }
  try {
    const post = await prisma.post.create({
      data: {
        content,
        userId: req.user.userId
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        },
        comments: true
      }
    });
    res.json(post);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'ไม่สามารถโพสต์ได้' });
  }
});

// Edit a post (only owner)
app.put('/api/community/posts/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความโพสต์' });
  }
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });
    if (!post) {
      return res.status(404).json({ error: 'ไม่พบโพสต์ที่ต้องการแก้ไข' });
    }
    if (post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์แก้ไขโพสต์นี้' });
    }
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(postId) },
      data: { content },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });
    res.json(updatedPost);
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ error: 'ไม่สามารถแก้ไขโพสต์ได้' });
  }
});

// Delete a post (only owner)
app.delete('/api/community/posts/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });
    if (!post) {
      return res.status(404).json({ error: 'ไม่พบโพสต์ที่ต้องการลบ' });
    }
    if (post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบโพสต์นี้' });
    }

    // Delete comments first, then the post (transaction)
    await prisma.$transaction([
      prisma.comment.deleteMany({
        where: { postId: parseInt(postId) }
      }),
      prisma.post.delete({
        where: { id: parseInt(postId) }
      })
    ]);

    res.json({ message: 'ลบโพสต์สำเร็จ' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบโพสต์ได้' });
  }
});

// Add a comment to a post
app.post('/api/community/posts/:postId/comments', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความแสดงความคิดเห็น' });
  }
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        userId: req.user.userId
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });
    res.json(comment);
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'ไม่สามารถส่งความคิดเห็นได้' });
  }
});

// Get chat messages (last 100 messages)
app.get('/api/community/chat', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      take: 100,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });
    res.json(messages);
  } catch (err) {
    console.error('Fetch chat messages error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดข้อความแชทได้' });
  }
});

// Send a chat message
app.post('/api/community/chat', authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความแชท' });
  }
  try {
    const message = await prisma.chatMessage.create({
      data: {
        content,
        userId: req.user.userId
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });
    res.json(message);
  } catch (err) {
    console.error('Send chat message error:', err);
    res.status(500).json({ error: 'ไม่สามารถส่งข้อความแชทได้' });
  }
});

// Get community activity stats (real values)
app.get('/api/community/stats', authenticateToken, async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Update current user's updatedAt to keep active status real
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { updatedAt: new Date() }
    });

    const activePostsCount = await prisma.post.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });

    const activeUsersCount = await prisma.user.count({
      where: {
        updatedAt: {
          gte: fifteenMinsAgo
        }
      }
    });

    res.json({
      activePostsCount,
      activeUsersCount: Math.max(1, activeUsersCount)
    });
  } catch (err) {
    console.error('Fetch community stats error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลความเคลื่อนไหวได้' });
  }
});

// --- Study Groups API Routes ---

// Create a new study group
app.post('/api/community/groups', authenticateToken, async (req, res) => {
  const { name, description, isPrivate } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อกลุ่ม' });
  }
  try {
    // Create group and automatically add creator as a member in a transaction
    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name: name.trim(),
          description: description ? description.trim() : '',
          isPrivate: !!isPrivate,
          createdById: req.user.userId
        }
      });
      // Add creator as member
      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: req.user.userId,
          status: 'ACCEPTED'
        }
      });
      return newGroup;
    });

    res.json(group);
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'ไม่สามารถสร้างกลุ่มได้' });
  }
});

// Search and list groups
app.get('/api/community/groups', authenticateToken, async (req, res) => {
  const { search } = req.query;
  try {
    const groups = await prisma.group.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, username: true, fullName: true }
        },
        members: {
          select: { userId: true, status: true }
        }
      }
    });

    // Format output to include members count and membership flag
    const formatted = groups.map(g => {
      const membership = g.members.find(m => m.userId === req.user.userId);
      return {
        id: g.id,
        name: g.name,
        description: g.description,
        isPrivate: g.isPrivate,
        createdAt: g.createdAt,
        createdById: g.createdById,
        creatorName: g.createdBy.fullName || g.createdBy.username,
        memberCount: g.members.filter(m => m.status === 'ACCEPTED').length,
        membershipStatus: membership ? membership.status : 'NONE'
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('List groups error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลกลุ่มได้' });
  }
});

// Delete group (creator only)
app.delete('/api/community/groups/:groupId', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) {
      return res.status(404).json({ error: 'ไม่พบกลุ่มที่ต้องการลบ' });
    }
    if (group.createdById !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบกลุ่มนี้ (เฉพาะผู้สร้างกลุ่มเท่านั้น)' });
    }

    await prisma.group.delete({
      where: { id: parseInt(groupId) }
    });

    res.json({ message: 'ลบกลุ่มสำเร็จ' });
  } catch (err) {
    console.error('Delete group error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบกลุ่มได้' });
  }
});

// Join group (or request to join if private)
app.post('/api/community/groups/:groupId/join', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) {
      return res.status(404).json({ error: 'ไม่พบกลุ่มที่ต้องการเข้าร่วม' });
    }

    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (existing) {
      return res.status(400).json({ error: 'คุณมีสถานะสมาชิกหรือรอการอนุมัติในกลุ่มนี้อยู่แล้ว' });
    }

    const status = group.isPrivate ? 'PENDING' : 'ACCEPTED';

    await prisma.groupMember.create({
      data: {
        groupId: parseInt(groupId),
        userId: req.user.userId,
        status
      }
    });

    res.json({
      message: group.isPrivate ? 'ส่งคำขอเข้าร่วมกลุ่มแล้ว รอผู้สร้างอนุมัติ' : 'เข้าร่วมกลุ่มสำเร็จ',
      status
    });
  } catch (err) {
    console.error('Join group error:', err);
    res.status(500).json({ error: 'ไม่สามารถเข้าร่วมกลุ่มได้' });
  }
});

// Leave group
app.post('/api/community/groups/:groupId/leave', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (!member) {
      return res.status(400).json({ error: 'คุณไม่ได้เป็นสมาชิกกลุ่มนี้' });
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });

    res.json({ message: 'ออกจากกลุ่มสำเร็จ' });
  } catch (err) {
    console.error('Leave group error:', err);
    res.status(500).json({ error: 'ไม่สามารถออกจากกลุ่มได้' });
  }
});

// Get group chat messages
app.get('/api/community/groups/:groupId/chat', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    // Verify membership status is ACCEPTED
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (!member || member.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'กรุณาเข้าร่วมกลุ่ม (และได้รับการอนุมัติ) ก่อนเข้าอ่านแชท' });
    }

    const messages = await prisma.groupChatMessage.findMany({
      where: { groupId: parseInt(groupId) },
      take: 100,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    res.json(messages);
  } catch (err) {
    console.error('Get group chat error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดข้อความแชทกลุ่มได้' });
  }
});

// Send message to group chat
app.post('/api/community/groups/:groupId/chat', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความแชท' });
  }
  try {
    // Verify membership status is ACCEPTED
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (!member || member.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'คุณไม่ได้เป็นสมาชิก (หรือยังไม่ได้รับการอนุมัติ) ในกลุ่มนี้' });
    }

    const message = await prisma.groupChatMessage.create({
      data: {
        content: content.trim(),
        groupId: parseInt(groupId),
        userId: req.user.userId
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    res.json(message);
  } catch (err) {
    console.error('Send group chat message error:', err);
    res.status(500).json({ error: 'ไม่สามารถส่งข้อความแชทกลุ่มได้' });
  }
});

// Get join requests (creator only)
app.get('/api/community/groups/:groupId/requests', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) return res.status(404).json({ error: 'ไม่พบกลุ่ม' });
    if (group.createdById !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง (เฉพาะผู้สร้างกลุ่มเท่านั้น)' });
    }

    const requests = await prisma.groupMember.findMany({
      where: {
        groupId: parseInt(groupId),
        status: 'PENDING'
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    res.json(requests);
  } catch (err) {
    console.error('Fetch group requests error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดคำขอเข้าร่วมได้' });
  }
});

// Approve join request (creator only)
app.post('/api/community/groups/:groupId/requests/:userId/approve', authenticateToken, async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) return res.status(404).json({ error: 'ไม่พบกลุ่ม' });
    if (group.createdById !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์อนุมัติ (เฉพาะผู้สร้างกลุ่มเท่านั้น)' });
    }

    await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: parseInt(userId)
        }
      },
      data: { status: 'ACCEPTED' }
    });

    res.json({ message: 'อนุมัติผู้ใช้งานเข้าร่วมกลุ่มเรียบร้อย' });
  } catch (err) {
    console.error('Approve group request error:', err);
    res.status(500).json({ error: 'ไม่สามารถอนุมัติคำขอได้' });
  }
});

// Decline join request (creator only)
app.post('/api/community/groups/:groupId/requests/:userId/decline', authenticateToken, async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) return res.status(404).json({ error: 'ไม่พบกลุ่ม' });
    if (group.createdById !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ปฏิเสธ (เฉพาะผู้สร้างกลุ่มเท่านั้น)' });
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: parseInt(userId)
        }
      }
    });

    res.json({ message: 'ปฏิเสธคำขอเข้าร่วมกลุ่มเรียบร้อย' });
  } catch (err) {
    console.error('Decline group request error:', err);
    res.status(500).json({ error: 'ไม่สามารถปฏิเสธคำขอได้' });
  }
});

// --- Friends, Blocks & Direct Messages API ---

// Search for other users to add as friends
app.get('/api/friends/search', authenticateToken, async (req, res) => {
  const { search } = req.query;
  if (!search || !search.trim()) {
    return res.json([]);
  }
  try {
    // Fetch users except current user, who are not blocked by current user and who haven't blocked current user
    const blockedIds = (await prisma.block.findMany({
      where: {
        OR: [
          { userId: req.user.userId },
          { blockedId: req.user.userId }
        ]
      }
    })).map(b => b.userId === req.user.userId ? b.blockedId : b.userId);

    const users = await prisma.user.findMany({
      where: {
        id: {
          notIn: [req.user.userId, ...blockedIds]
        },
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        faceImage: true
      },
      take: 20
    });

    // Check relationship status for each user
    const relationships = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: req.user.userId, friendId: { in: users.map(u => u.id) } },
          { userId: { in: users.map(u => u.id) }, friendId: req.user.userId }
        ]
      }
    });

    const formatted = users.map(u => {
      const rel = relationships.find(r => r.userId === u.id || r.friendId === u.id);
      let status = 'NONE';
      if (rel) {
        if (rel.status === 'ACCEPTED') {
          status = 'ACCEPTED';
        } else if (rel.status === 'PENDING') {
          status = rel.userId === req.user.userId ? 'PENDING_SENT' : 'PENDING_RECEIVED';
        }
      }
      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        faceImage: u.faceImage,
        friendStatus: status
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Search friends error:', err);
    res.status(500).json({ error: 'ไม่สามารถค้นหาผู้ใช้งานได้' });
  }
});

// Get accepted friends list
app.get('/api/friends', authenticateToken, async (req, res) => {
  try {
    const friendRelations = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: req.user.userId },
          { friendId: req.user.userId }
        ],
        status: 'ACCEPTED'
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        },
        friend: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    const friendsList = friendRelations.map(rel => {
      const isUser = rel.userId === req.user.userId;
      const targetUser = isUser ? rel.friend : rel.user;
      return {
        id: targetUser.id,
        username: targetUser.username,
        fullName: targetUser.fullName,
        faceImage: targetUser.faceImage
      };
    });

    res.json(friendsList);
  } catch (err) {
    console.error('List friends error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงรายชื่อเพื่อนได้' });
  }
});

// Send friend request (saves as PENDING, or auto-accepts if opposite request exists)
app.post('/api/friends/request', authenticateToken, async (req, res) => {
  const { friendId } = req.body;
  if (!friendId || parseInt(friendId) === req.user.userId) {
    return res.status(400).json({ error: 'รหัสเพื่อนไม่ถูกต้อง' });
  }
  const fId = parseInt(friendId);

  try {
    // Check if blocked
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, blockedId: fId },
          { userId: fId, blockedId: req.user.userId }
        ]
      }
    });
    if (isBlocked) {
      return res.status(400).json({ error: 'ไม่สามารถเพิ่มเพื่อนได้เนื่องจากถูกบล็อก' });
    }

    const existingRelation = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, friendId: fId },
          { userId: fId, friendId: req.user.userId }
        ]
      }
    });

    if (existingRelation) {
      if (existingRelation.status === 'ACCEPTED') {
        return res.status(400).json({ error: 'คุณและผู้ใช้งานรายนี้เป็นเพื่อนกันอยู่แล้ว' });
      }
      
      // If a request from them to us is PENDING, we accept it
      if (existingRelation.userId === fId) {
        await prisma.friend.update({
          where: { id: existingRelation.id },
          data: { status: 'ACCEPTED' }
        });
        return res.json({ message: 'ยอมรับคำขอเป็นเพื่อนเรียบร้อยแล้ว', status: 'ACCEPTED' });
      } else {
        return res.status(400).json({ error: 'คุณได้ส่งคำขอเป็นเพื่อนไปแล้ว รอการตอบรับ' });
      }
    } else {
      // Create new pending friend request
      await prisma.friend.create({
        data: {
          userId: req.user.userId,
          friendId: fId,
          status: 'PENDING'
        }
      });
      res.json({ message: 'ส่งคำขอเป็นเพื่อนแล้ว รอการตอบรับ', status: 'PENDING' });
    }
  } catch (err) {
    console.error('Add friend request error:', err);
    res.status(500).json({ error: 'ไม่สามารถเพิ่มเพื่อนได้' });
  }
});

// Fetch pending incoming friend requests
app.get('/api/friends/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await prisma.friend.findMany({
      where: {
        friendId: req.user.userId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });
    const formatted = requests.map(r => ({
      id: r.id,
      senderId: r.userId,
      username: r.user.username,
      fullName: r.user.fullName,
      faceImage: r.user.faceImage
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Fetch friend requests error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดคำขอเป็นเพื่อนได้' });
  }
});

// Accept a friend request
app.post('/api/friends/request/:friendId/accept', authenticateToken, async (req, res) => {
  const fId = parseInt(req.params.friendId);
  try {
    const request = await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: fId,
          friendId: req.user.userId
        }
      }
    });
    if (!request || request.status !== 'PENDING') {
      return res.status(404).json({ error: 'ไม่พบคำขอเป็นเพื่อนดังกล่าว' });
    }

    await prisma.friend.update({
      where: { id: request.id },
      data: { status: 'ACCEPTED' }
    });

    res.json({ message: 'รับแอดเป็นเพื่อนสำเร็จ' });
  } catch (err) {
    console.error('Accept friend error:', err);
    res.status(500).json({ error: 'ไม่สามารถตอบรับเป็นเพื่อนได้' });
  }
});

// Decline/Delete a friend request
app.post('/api/friends/request/:friendId/decline', authenticateToken, async (req, res) => {
  const fId = parseInt(req.params.friendId);
  try {
    const request = await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: fId,
          friendId: req.user.userId
        }
      }
    });
    if (!request) {
      return res.status(404).json({ error: 'ไม่พบคำขอเป็นเพื่อนดังกล่าว' });
    }

    await prisma.friend.delete({
      where: { id: request.id }
    });

    res.json({ message: 'ปฏิเสธคำขอเป็นเพื่อนสำเร็จ' });
  } catch (err) {
    console.error('Decline friend error:', err);
    res.status(500).json({ error: 'ไม่สามารถปฏิเสธคำขอเป็นเพื่อนได้' });
  }
});

// Delete a friend / Unfriend
app.delete('/api/friends/:friendId', authenticateToken, async (req, res) => {
  const fId = parseInt(req.params.friendId);
  try {
    const friendRelation = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, friendId: fId },
          { userId: fId, friendId: req.user.userId }
        ],
        status: 'ACCEPTED'
      }
    });

    if (!friendRelation) {
      return res.status(404).json({ error: 'ไม่พบความสัมพันธ์เพื่อนดังกล่าว' });
    }

    await prisma.friend.delete({
      where: { id: friendRelation.id }
    });

    res.json({ message: 'ลบเพื่อนสำเร็จ' });
  } catch (err) {
    console.error('Unfriend error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบเพื่อนได้' });
  }
});

// Get another user's public profile and relation status
app.get('/api/user/:userId/profile', authenticateToken, async (req, res) => {
  const targetId = parseInt(req.params.userId);
  try {
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        username: true,
        fullName: true,
        faceImage: true,
        level: true,
        points: true,
        streak: true,
        battleWins: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    // Check relationship status
    const rel = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, friendId: targetId },
          { userId: targetId, friendId: req.user.userId }
        ]
      }
    });

    // Check if blocked by either
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, blockedId: targetId },
          { userId: targetId, blockedId: req.user.userId }
        ]
      }
    });

    let relationStatus = 'NONE'; // NONE, ACCEPTED, PENDING_SENT, PENDING_RECEIVED, BLOCKED
    if (block) {
      relationStatus = 'BLOCKED';
    } else if (rel) {
      if (rel.status === 'ACCEPTED') {
        relationStatus = 'ACCEPTED';
      } else if (rel.status === 'PENDING') {
        relationStatus = rel.userId === req.user.userId ? 'PENDING_SENT' : 'PENDING_RECEIVED';
      }
    }

    res.json({
      ...user,
      relationStatus
    });
  } catch (err) {
    console.error('Fetch public profile error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดโปรไฟล์ผู้ใช้งานได้' });
  }
});

// Get another user's post history
app.get('/api/user/:userId/posts', authenticateToken, async (req, res) => {
  const targetId = parseInt(req.params.userId);
  try {
    const posts = await prisma.post.findMany({
      where: { userId: targetId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, username: true, fullName: true, faceImage: true }
            }
          }
        }
      }
    });
    res.json(posts);
  } catch (err) {
    console.error('Fetch user posts error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดประวัติการโพสต์ได้' });
  }
});

// Block a user
app.post('/api/friends/block', authenticateToken, async (req, res) => {
  const { blockedId } = req.body;
  if (!blockedId || parseInt(blockedId) === req.user.userId) {
    return res.status(400).json({ error: 'รหัสบล็อกไม่ถูกต้อง' });
  }
  const bId = parseInt(blockedId);

  try {
    // Add to block list in transaction
    await prisma.$transaction(async (tx) => {
      // Create block
      const existingBlock = await tx.block.findUnique({
        where: {
          userId_blockedId: {
            userId: req.user.userId,
            blockedId: bId
          }
        }
      });
      if (!existingBlock) {
        await tx.block.create({
          data: {
            userId: req.user.userId,
            blockedId: bId
          }
        });
      }

      // Remove friend relationship if it exists
      const existingFriend = await tx.friend.findFirst({
        where: {
          OR: [
            { userId: req.user.userId, friendId: bId },
            { userId: bId, friendId: req.user.userId }
          ]
        }
      });
      if (existingFriend) {
        await tx.friend.delete({
          where: { id: existingFriend.id }
        });
      }
    });

    res.json({ message: 'บล็อกผู้ใช้งานสำเร็จ' });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ error: 'ไม่สามารถบล็อกผู้ใช้งานได้' });
  }
});

// Get blocked users list
app.get('/api/friends/blocked', authenticateToken, async (req, res) => {
  try {
    const blockedList = await prisma.block.findMany({
      where: { userId: req.user.userId },
      include: {
        blockedUser: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    const formatted = blockedList.map(b => ({
      id: b.blockedUser.id,
      username: b.blockedUser.username,
      fullName: b.blockedUser.fullName,
      faceImage: b.blockedUser.faceImage
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Fetch blocked list error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดรายชื่อที่บล็อกได้' });
  }
});

// Unblock a user
app.post('/api/friends/unblock', authenticateToken, async (req, res) => {
  const { blockedId } = req.body;
  if (!blockedId) return res.status(400).json({ error: 'รหัสผู้ใช้งานไม่ถูกต้อง' });
  const bId = parseInt(blockedId);

  try {
    await prisma.block.delete({
      where: {
        userId_blockedId: {
          userId: req.user.userId,
          blockedId: bId
        }
      }
    });
    res.json({ message: 'ปลดบล็อกผู้ใช้งานสำเร็จ' });
  } catch (err) {
    console.error('Unblock user error:', err);
    res.status(500).json({ error: 'ไม่สามารถปลดบล็อกได้' });
  }
});

// Fetch private messages with a specific friend
app.get('/api/friends/chat/:friendId', authenticateToken, async (req, res) => {
  const fId = parseInt(req.params.friendId);
  try {
    // Check if either user has blocked the other
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, blockedId: fId },
          { userId: fId, blockedId: req.user.userId }
        ]
      }
    });
    if (isBlocked) {
      return res.status(403).json({ error: 'ไม่สามารถแชทส่วนตัวกับผู้ใช้งานรายนี้ได้' });
    }

    const messages = await prisma.privateChatMessage.findMany({
      where: {
        OR: [
          { senderId: req.user.userId, receiverId: fId },
          { senderId: fId, receiverId: req.user.userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    res.json(messages);
  } catch (err) {
    console.error('Fetch private chat error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดแชทส่วนตัวได้' });
  }
});

// Send a private message
app.post('/api/friends/chat/:friendId', authenticateToken, async (req, res) => {
  const fId = parseInt(req.params.friendId);
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความแชท' });
  }
  try {
    // Check if blocked
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, blockedId: fId },
          { userId: fId, blockedId: req.user.userId }
        ]
      }
    });
    if (isBlocked) {
      return res.status(403).json({ error: 'ไม่สามารถส่งข้อความได้เนื่องจากถูกบล็อก' });
    }

    const message = await prisma.privateChatMessage.create({
      data: {
        content: content.trim(),
        senderId: req.user.userId,
        receiverId: fId
      },
      include: {
        sender: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    res.json(message);
  } catch (err) {
    console.error('Send private message error:', err);
    res.status(500).json({ error: 'ไม่สามารถส่งข้อความแชทส่วนตัวได้' });
  }
});

// --- Points & Premium Status Route ---
app.get('/api/user/points', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        points: true,
        premiumUntil: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    const isPremium = user.premiumUntil && new Date(user.premiumUntil) > new Date();
    const premiumDaysLeft = isPremium
      ? Math.ceil((new Date(user.premiumUntil) - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      points: user.points,
      isPremium,
      premiumUntil: user.premiumUntil,
      premiumDaysLeft
    });
  } catch (err) {
    console.error('Points Status Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลพ้อยต์ได้' });
  }
});

// --- Redeem Points for Premium Route ---
app.post('/api/user/redeem-premium', authenticateToken, async (req, res) => {
  const { package: pkg } = req.body; // 'weekly' or 'monthly'

  const packages = {
    weekly: { cost: 500, days: 7, name: 'Premium 7 วัน' },
    monthly: { cost: 1200, days: 30, name: 'Premium 30 วัน' }
  };

  const selectedPkg = packages[pkg];
  if (!selectedPkg) {
    return res.status(400).json({ error: 'แพ็กเกจไม่ถูกต้อง' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    if (user.points < selectedPkg.cost) {
      return res.status(400).json({
        error: `พ้อยต์ไม่เพียงพอ (ต้องการ ${selectedPkg.cost} PTS, มี ${user.points} PTS)`
      });
    }

    // Calculate new premium end date
    const now = new Date();
    let newPremiumUntil;

    if (user.premiumUntil && new Date(user.premiumUntil) > now) {
      // Extend existing premium
      newPremiumUntil = new Date(user.premiumUntil);
      newPremiumUntil.setDate(newPremiumUntil.getDate() + selectedPkg.days);
    } else {
      // Start new premium period
      newPremiumUntil = new Date(now);
      newPremiumUntil.setDate(newPremiumUntil.getDate() + selectedPkg.days);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: user.points - selectedPkg.cost,
        premiumUntil: newPremiumUntil
      }
    });

    const premiumDaysLeft = Math.ceil((newPremiumUntil - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      message: `แลก ${selectedPkg.name} สำเร็จ! Premium เหลืออีก ${premiumDaysLeft} วัน`,
      points: updatedUser.points,
      premiumUntil: newPremiumUntil,
      premiumDaysLeft
    });
  } catch (err) {
    console.error('Redeem Premium Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแลก Premium' });
  }
});

// --- Vocab Generate Sentence Route (for Duolingo-style sentence builder) ---
app.get('/api/vocab/generate-sentence', authenticateToken, async (req, res) => {
  const { word1, word2, level } = req.query;

  if (!word1 || !word2 || !level) {
    return res.status(400).json({ error: 'กรุณาระบุคำศัพท์และระดับความยาก' });
  }

  const apiKey = await getGeminiApiKey();
  const model = 'gemini-2.5-flash';

  const systemPrompt = `คุณคืออาจารย์สอนภาษาอังกฤษมืออาชีพ
กรุณาแต่งประโยคภาษาอังกฤษ 1 ประโยคที่เป็นธรรมชาติและเรียบง่าย เหมาะสมกับผู้เรียนระดับภาษาอังกฤษระดับ ${level}
โดยในประโยคจะต้องประกอบด้วยหรือเกี่ยวข้องกับคำศัพท์ภาษาอังกฤษ 2 คำนี้: "${word1}" และ "${word2}" (สามารถผันกริยา เติม s/es/ed หรือใช้รูปพหุพจน์ได้)
จากนั้นให้แปลประโยคภาษาอังกฤษนี้เป็นประโยคภาษาไทยที่แปลได้ใจความสมบูรณ์และถูกต้อง

ผลลัพธ์ที่คุณต้องตอบกลับคือ JSON Object เพียงตัวเดียวเท่านั้น โดยมีโครงสร้างดังนี้:
{
  "thaiSentence": "ประโยคแปลภาษาไทย...",
  "englishSentence": "ประโยคภาษาอังกฤษที่สมบูรณ์...",
  "distractors": ["คำลวง1", "คำลวง2", "คำลวง3", "คำลวง4"]
}
หมายเหตุ:
1. ประโยคภาษาอังกฤษควรมีความยาวประมาณ 5-8 คำ และห้ามยาวจนเกินไป
2. "distractors" คือคำลวงภาษาอังกฤษอื่นๆ 3-4 คำ ที่มีระดับความยากใกล้เคียงกัน แต่ไม่ได้อยู่ในประโยคนี้ เพื่อให้ผู้เรียนนำไปสับสนในการประกอบประโยค`;

  try {
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`Gemini API HTTP ${apiRes.status}: ${errText}`);
    }

    const data = await apiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No content returned from Gemini');

    const result = JSON.parse(rawText.trim());
    res.json(result);
  } catch (err) {
    console.error('Error generating vocab sentence:', err);
    // Provide a nice fallback sentence so the game doesn't crash if Gemini fails or is offline
    const fallbackThai = `ฉันสามารถค้นหาความหมายของคำว่า ${word1} และ ${word2} ได้`;
    const fallbackEnglish = `I can find the meaning of ${word1} and ${word2}.`;
    res.json({
      thaiSentence: fallbackThai,
      englishSentence: fallbackEnglish,
      distractors: ["search", "write", "speak", "read"]
    });
  }
});

// --- Vocab Complete Route (awards points for vocabulary practice) ---
app.post('/api/user/vocab-complete', authenticateToken, async (req, res) => {
  const { level, matchedPairs, timeSeconds, mode } = req.body;

  if (!level || !matchedPairs) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    // Save to VocabRecord if game was fully completed (8 matched pairs, or 5 rounds for sentence mode)
    const requiredCompletions = mode === 'sentence' ? 5 : 8;
    if (matchedPairs >= requiredCompletions && timeSeconds) {
      await prisma.vocabRecord.create({
        data: {
          userId: req.user.userId,
          level,
          mode: mode || 'same',
          timeSeconds: parseInt(timeSeconds)
        }
      });
    }

    // Award points based on performance (disabled - 0 points)
    const totalPointsAwarded = 0;

    const newXp = user.xp + 20;
    let newLevel = user.level;
    let tempXp = newXp;
    let levelUp = false;

    while (tempXp >= 100) {
      tempXp -= 100;
      newLevel += 1;
      levelUp = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: user.points + totalPointsAwarded,
        xp: tempXp,
        level: newLevel,
        pigLevel: newLevel,
        pigXp: tempXp,
        pigLevel: newLevel,
        pigXp: tempXp
      }
    });

    res.json({
      message: `เรียนคำศัพท์ระดับ ${level} สำเร็จ! ได้รับ ${totalPointsAwarded} PTS`,
      pointsAwarded: totalPointsAwarded,
      levelUp,
      user: {
        points: updatedUser.points,
        level: updatedUser.level,
        xp: updatedUser.xp,
        scoreEnglish: updatedUser.scoreEnglish
      }
    });
  } catch (err) {
    console.error('Vocab Complete Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลเรียนคำศัพท์' });
  }
});

// --- Battle Matchmaking Questions Endpoint ---
app.get('/api/exams/battle-questions', authenticateToken, async (req, res) => {
  const { subject } = req.query;
  try {
    await ensureDefaultQuestions();
    
    let dbQuestions = [];
    if (subject && subject !== 'all') {
      dbQuestions = await prisma.question.findMany({
        where: { examSet: { category: subject } },
        include: { examSet: { select: { category: true, subcategory: true } } }
      });
    } else {
      dbQuestions = await prisma.question.findMany({
        include: { examSet: { select: { category: true, subcategory: true } } }
      });
    }

    // Shuffle questions function
    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    if (dbQuestions.length > 0) {
      return res.json(shuffle(dbQuestions));
    }

    // Fallback: If DB questions are empty, construct from defaultQuestions in server/index.js
    let fallbackPool = [];
    defaultQuestions.forEach((eqSet) => {
      if (!subject || subject === 'all' || eqSet.category === subject) {
        eqSet.questions.forEach((q, idx) => {
          fallbackPool.push({
            id: `fallback-${eqSet.category}-${idx}`,
            questionText: q.questionText,
            choice1: q.choice1,
            choice2: q.choice2,
            choice3: q.choice3,
            choice4: q.choice4,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || 'เฉลยรายละเอียด...',
            examSet: { category: eqSet.category, subcategory: eqSet.title }
          });
        });
      }
    });

    res.json(shuffle(fallbackPool));
  } catch (err) {
    console.error('Fetch Battle Questions Error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดคำถามประลองได้' });
  }
});

// Global Matchmaking States
const battleQueue = [];
const activeMatches = new Map();

// Helper to shuffle questions
function localShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// GET a random opponent (real user from database)
app.get('/api/exams/battle-opponent', authenticateToken, async (req, res) => {
  try {
    const otherUsers = await prisma.user.findMany({
      where: {
        id: { not: req.user.userId }
      },
      select: {
        username: true,
        fullName: true,
        level: true,
        faceImage: true,
        battleWins: true
      }
    });

    if (otherUsers.length === 0) {
      return res.json({ username: 'general_user', fullName: 'ผู้สอบทั่วไป', level: 1, faceImage: null });
    }

    const randomIndex = Math.floor(Math.random() * otherUsers.length);
    const opponent = otherUsers[randomIndex];
    res.json(opponent);
  } catch (err) {
    console.error('Error fetching battle opponent:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคู่ต่อสู้ได้' });
  }
});

// POST to join and poll matchmaking queue
app.post('/api/exams/battle/poll-match', authenticateToken, async (req, res) => {
  const { subject } = req.body;
  const now = Date.now();

  try {
    // 1. Clean up stale users in queue (no poll for > 6 seconds)
    const activeQueue = battleQueue.filter(u => now - u.lastPoll < 6000);
    battleQueue.length = 0;
    battleQueue.push(...activeQueue);

    // 2. Check if this user is already in an active match
    let existingMatch = null;
    for (const m of activeMatches.values()) {
      if (m.player1.userId === req.user.userId || m.player2.userId === req.user.userId) {
        existingMatch = m;
        break;
      }
    }

    if (existingMatch) {
      const opponent = existingMatch.player1.userId === req.user.userId ? existingMatch.player2 : existingMatch.player1;
      return res.json({
        status: 'matched',
        matchId: existingMatch.matchId,
        opponent,
        questions: existingMatch.questions
      });
    }

    // 3. Update or add self to the queue
    let selfInQueue = battleQueue.find(u => u.userId === req.user.userId);
    if (selfInQueue) {
      selfInQueue.lastPoll = now;
      selfInQueue.subject = subject;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });
      if (user) {
        selfInQueue = {
          userId: user.id,
          username: user.username,
          fullName: user.fullName || user.username,
          level: user.level || 1,
          faceImage: user.faceImage,
          subject,
          lastPoll: now
        };
        battleQueue.push(selfInQueue);
      }
    }

    // 4. Try to find another active user in queue for the same subject
    const partner = battleQueue.find(u => u.userId !== req.user.userId && u.subject === subject);
    if (partner) {
      // Remove both from queue
      const idx1 = battleQueue.findIndex(u => u.userId === req.user.userId);
      if (idx1 !== -1) battleQueue.splice(idx1, 1);
      const idx2 = battleQueue.findIndex(u => u.userId === partner.userId);
      if (idx2 !== -1) battleQueue.splice(idx2, 1);

      // Fetch questions
      const sets = await prisma.examSet.findMany({
        where: { category: subject },
        select: { id: true }
      });
      const setIds = sets.map(s => s.id);
      let qList = await prisma.question.findMany({
        where: { examSetId: { in: setIds } },
        include: { examSet: true }
      });
      qList = localShuffle(qList).slice(0, 10);

      const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newMatch = {
        matchId,
        player1: {
          userId: req.user.userId,
          username: selfInQueue.username,
          fullName: selfInQueue.fullName,
          level: selfInQueue.level,
          faceImage: selfInQueue.faceImage
        },
        player2: partner,
        subject,
        questions: qList,
        createdAt: now
      };

      activeMatches.set(matchId, newMatch);

      // Clean up old matches (> 15 minutes)
      for (const [mId, m] of activeMatches.entries()) {
        if (now - m.createdAt > 15 * 60 * 1000) {
          activeMatches.delete(mId);
        }
      }

      return res.json({
        status: 'matched',
        matchId,
        opponent: partner,
        questions: qList
      });
    }

    res.json({ status: 'searching' });
  } catch (err) {
    console.error('Matchmaking Poll Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหาคู่ต่อสู้' });
  }
});

// POST to match instantly (matches with queue if someone is waiting, or grabs random real user offline)
app.post('/api/exams/battle/match-instant', authenticateToken, async (req, res) => {
  const { subject } = req.body;
  const now = Date.now();

  try {
    // 1. Clean up stale users in queue (no poll for > 6 seconds)
    const activeQueue = battleQueue.filter(u => now - u.lastPoll < 6000);
    battleQueue.length = 0;
    battleQueue.push(...activeQueue);

    // 2. Check if this user is already in an active match
    let existingMatch = null;
    for (const m of activeMatches.values()) {
      if (m.player1.userId === req.user.userId || m.player2.userId === req.user.userId) {
        existingMatch = m;
        break;
      }
    }

    if (existingMatch) {
      const opponent = existingMatch.player1.userId === req.user.userId ? existingMatch.player2 : existingMatch.player1;
      return res.json({
        status: 'matched',
        matchId: existingMatch.matchId,
        opponent,
        questions: existingMatch.questions
      });
    }

    // 3. Check if anyone else is waiting in queue (ignoring subject, excluding self)
    const partner = battleQueue.find(u => u.userId !== req.user.userId);
    if (partner) {
      // Match with them!
      const idx2 = battleQueue.findIndex(u => u.userId === partner.userId);
      if (idx2 !== -1) battleQueue.splice(idx2, 1);
      
      // Also remove self from queue if present
      const idxSelf = battleQueue.findIndex(u => u.userId === req.user.userId);
      if (idxSelf !== -1) battleQueue.splice(idxSelf, 1);

      // Fetch questions for the subject requested by the matcher
      const sets = await prisma.examSet.findMany({
        where: { category: subject },
        select: { id: true }
      });
      const setIds = sets.map(s => s.id);
      let qList = await prisma.question.findMany({
        where: { examSetId: { in: setIds } },
        include: { examSet: true }
      });
      qList = localShuffle(qList).slice(0, 10);

      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newMatch = {
        matchId,
        player1: {
          userId: req.user.userId,
          username: user.username,
          fullName: user.fullName || user.username,
          level: user.level || 1,
          faceImage: user.faceImage
        },
        player2: partner,
        subject,
        questions: qList,
        createdAt: now
      };

      activeMatches.set(matchId, newMatch);

      return res.json({
        status: 'matched',
        matchId,
        opponent: partner,
        questions: qList
      });
    }

    // 4. No one is waiting in the queue, return waiting status so they keep waiting as normal
    res.json({
      status: 'waiting'
    });
  } catch (err) {
    console.error('Match Instant Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการจับคู่ทันที' });
  }
});

// POST to leave matchmaking queue
app.post('/api/exams/battle/leave-queue', authenticateToken, async (req, res) => {
  try {
    const idx = battleQueue.findIndex(u => u.userId === req.user.userId);
    if (idx !== -1) {
      battleQueue.splice(idx, 1);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Leave Queue Error:', err);
    res.status(500).json({ error: 'Error leaving queue' });
  }
});


// --- Battle Complete Route (awards points for combat resolution) ---
app.post('/api/user/battle-complete', authenticateToken, async (req, res) => {
  const { winner, subject } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    const pointsAwarded = 0;
    const xpAwarded = winner ? 50 : 10;

    const newXp = user.xp + xpAwarded;
    let newLevel = user.level;
    let tempXp = newXp;
    let levelUp = false;

    while (tempXp >= 100) {
      tempXp -= 100;
      newLevel += 1;
      levelUp = true;
    }

    // Optionally bump the score in the chosen subject on victory
    const updateData = {
      points: user.points + pointsAwarded,
      xp: tempXp,
      level: newLevel,
      pigLevel: newLevel,
      pigXp: tempXp
    };

    if (winner) {
      updateData.battleWins = (user.battleWins || 0) + 1;
    }

    const subjectMetaKeys = {
      general: 'scoreGeneral',
      thai: 'scoreThai',
      english: 'scoreEnglish',
      computer: 'scoreComputer',
      social: 'scoreSocial',
      secretariat: 'scoreSecretariat',
      law: 'scoreLaw'
    };

    if (winner && subject && subjectMetaKeys[subject]) {
      const field = subjectMetaKeys[subject];
      updateData[field] = Math.min(100, user[field] + 2); // award 2% on victory, cap at 100
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData
    });

    res.json({
      message: winner ? '🎉 ชนะการประลองสำเร็จ!' : '😢 แพ้การประลอง (พยายามใหม่อีกครั้ง)',
      pointsAwarded,
      xpAwarded,
      levelUp,
      user: {
        points: updatedUser.points,
        level: updatedUser.level,
        xp: updatedUser.xp,
        scoreGeneral: updatedUser.scoreGeneral,
        scoreThai: updatedUser.scoreThai,
        scoreEnglish: updatedUser.scoreEnglish,
        scoreComputer: updatedUser.scoreComputer,
        scoreSocial: updatedUser.scoreSocial,
        scoreSecretariat: updatedUser.scoreSecretariat,
        scoreLaw: updatedUser.scoreLaw
      }
    });
  } catch (err) {
    console.error('Battle Complete Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลการประลอง' });
  }
});

// --- Vocab Leaderboard Route (Top 10 best times) ---
app.get('/api/vocab/leaderboard', async (req, res) => {
  const { level, mode } = req.query;
  if (!level || !mode) {
    return res.status(400).json({ error: 'กรุณาระบุ level และ mode' });
  }

  try {
    const records = await prisma.vocabRecord.findMany({
      where: {
        level,
        mode
      },
      orderBy: {
        timeSeconds: 'asc'
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true }
        }
      },
      take: 100
    });

    const uniqueUsers = [];
    const seenUsers = new Set();
    for (const r of records) {
      if (!seenUsers.has(r.userId)) {
        seenUsers.add(r.userId);
        uniqueUsers.push({
          id: r.id,
          userId: r.userId,
          username: r.user.username,
          fullName: r.user.fullName || r.user.username,
          timeSeconds: r.timeSeconds,
          createdAt: r.createdAt
        });
      }
      if (uniqueUsers.length >= 10) break;
    }

    res.json(uniqueUsers);
  } catch (err) {
    console.error('Fetch Vocab Leaderboard Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลตารางอันดับได้' });
  }
});


// --- Premium Slip Upload (PromptPay Payment) ---
app.post('/api/user/premium-request', authenticateToken, async (req, res) => {
  const { slipImage } = req.body;
  if (!slipImage) {
    return res.status(400).json({ error: 'กรุณาอัปโหลดรูปภาพสลิปการโอนเงิน' });
  }

  try {
    const existingPending = await prisma.premiumRequest.findFirst({
      where: {
        userId: req.user.userId,
        status: 'PENDING'
      }
    });

    if (existingPending) {
      return res.status(400).json({ error: 'คุณมีรายการที่อยู่ระหว่างรอยืนยันอยู่แล้ว กรุณารอแอดมินดำเนินการตรวจสอบ' });
    }

    const premiumReq = await prisma.premiumRequest.create({
      data: {
        userId: req.user.userId,
        slipImage,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'ส่งหลักฐานสลิปเรียบร้อยแล้ว สถานะคือรอยืนยันการอนุมัติ',
      premiumReq
    });
  } catch (err) {
    console.error('Premium Request Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งหลักฐานสลิป' });
  }
});

// --- Get Current User's Premium Request Status ---
app.get('/api/user/premium-status', authenticateToken, async (req, res) => {
  try {
    const latestRequest = await prisma.premiumRequest.findFirst({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ latestRequest });
  } catch (err) {
    console.error('Fetch Premium Status Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถานะพรีเมียมได้' });
  }
});

// --- Admin Endpoints for Premium Requests ---

// Get all premium requests (for admin)
app.get('/api/admin/premium-requests', requireAdmin, async (req, res) => {
  try {
    const requests = await prisma.premiumRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, email: true }
        }
      }
    });
    res.json(requests);
  } catch (err) {
    console.error('Fetch Admin Premium Requests Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคำขอพรีเมียมได้' });
  }
});

// Approve a request
app.put('/api/admin/premium-requests/:id/approve', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const request = await prisma.premiumRequest.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });
    if (!request) {
      return res.status(404).json({ error: 'ไม่พบรายการคำขอนี้' });
    }

    // Update request status
    await prisma.premiumRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'APPROVED' }
    });

    // Update user premium duration (extend by 30 days)
    const now = new Date();
    let newPremiumUntil = new Date(now);
    if (request.user.premiumUntil && request.user.premiumUntil > now) {
      newPremiumUntil = new Date(request.user.premiumUntil);
    }
    newPremiumUntil.setDate(newPremiumUntil.getDate() + 30);

    const updatedUser = await prisma.user.update({
      where: { id: request.userId },
      data: { premiumUntil: newPremiumUntil }
    });

    res.json({ message: 'อนุมัติพรีเมียมสำเร็จเรียบร้อย!', premiumUntil: newPremiumUntil });
  } catch (err) {
    console.error('Approve Premium Request Error:', err);
    res.status(500).json({ error: 'ไม่สามารถอนุมัติรายการพรีเมียมได้' });
  }
});

// Revoke or Reject a request (or clear user's premium)
app.put('/api/admin/premium-requests/:id/revoke', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const request = await prisma.premiumRequest.findUnique({
      where: { id: parseInt(id) }
    });
    if (!request) {
      return res.status(404).json({ error: 'ไม่พบรายการคำขอนี้' });
    }

    // Set request status to REJECTED / REVOKED
    await prisma.premiumRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' }
    });

    // Revoke the user's premium completely
    await prisma.user.update({
      where: { id: request.userId },
      data: { premiumUntil: null }
    });

    res.json({ message: 'เพิกถอนสิทธิ์พรีเมียมของผู้ใช้นี้เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Revoke Premium Request Error:', err);
    res.status(500).json({ error: 'ไม่สามารถเพิกถอนสิทธิ์พรีเมียมได้' });
  }
});

// --- Global Settings Routes ---

// Get global settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const result = {
      settings_sys_name: 'เตรียมสอบนายสิบตำรวจออนไลน์',
      settings_pass_score: '60',
      settings_maintenance: 'false',
      settings_exam_mode: 'dynamic',
      settings_gemini_key: 'AIzaSyDDBylXqV9akHtd5hBVEFSuoAM795on7Rc'
    };

    settings.forEach(s => {
      result[s.key] = s.value;
    });

    res.json(result);
  } catch (err) {
    console.error('Get Settings Error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดการตั้งค่าระบบได้' });
  }
});

// Update global settings (for Admins / Owners)
app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  const newSettings = req.body;
  try {
    for (const [key, value] of Object.entries(newSettings)) {
      if (typeof key === 'string' && typeof value === 'string') {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        });
      }
    }
    res.json({ message: 'บันทึกการตั้งค่าระบบสำเร็จ' });
  } catch (err) {
    console.error('Update Settings Error:', err);
    res.status(500).json({ error: 'ไม่สามารถบันทึกการตั้งค่าระบบได้' });
  }
});

// --- Pig Farm Game Routes ---

// Get current user's pig stats
app.get('/api/user/pig', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        pigName: true,
        pigLevel: true,
        pigXp: true,
        pigHunger: true,
        pigThirst: true,
        pigSkin: true,
        pigWeapon: true,
        pigPenLevel: true,
        pigUnlockedSkins: true,
        pigUnlockedWeapons: true,
        points: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    res.json(user);
  } catch (err) {
    console.error('Fetch Pig Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสัตว์เลี้ยงได้' });
  }
});

// Care for pig (feed, water, vitamin)
app.post('/api/user/pig/care', authenticateToken, async (req, res) => {
  const { type } = req.body; // 'food', 'water', 'vitamin'
  
  const careTypes = {
    food: { cost: 50, hunger: 40, thirst: 0, exp: 20, msg: 'ให้อาหารหมูสำเร็จ!' },
    water: { cost: 30, hunger: 0, thirst: 40, exp: 10, msg: 'ให้น้ำหมูสำเร็จ!' },
    vitamin: { cost: 100, hunger: 20, thirst: 20, exp: 50, msg: 'ให้วิตามินบำรุงสำเร็จ!' }
  };

  const selectedCare = careTypes[type];
  if (!selectedCare) {
    return res.status(400).json({ error: 'ประเภทการดูแลไม่ถูกต้อง' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    if (user.points < selectedCare.cost) {
      return res.status(400).json({ error: `พ้อยต์ไม่เพียงพอ (ต้องการ ${selectedCare.cost} PTS, คุณมี ${user.points} PTS)` });
    }

    // Calculate new stats
    const newHunger = Math.min(100, user.pigHunger + selectedCare.hunger);
    const newThirst = Math.min(100, user.pigThirst + selectedCare.thirst);
    let newXp = user.pigXp + selectedCare.exp;
    let newLevel = user.pigLevel;
    let levelUp = false;

    while (newXp >= 100) {
      newXp -= 100;
      newLevel += 1;
      levelUp = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: user.points - selectedCare.cost,
        pigHunger: newHunger,
        pigThirst: newThirst,
        pigXp: newXp,
        pigLevel: newLevel
      }
    });

    res.json({
      message: selectedCare.msg + (levelUp ? ` 🎉 น้องหมูเลเวลอัปเป็น เลเวล ${newLevel}!` : ''),
      points: updatedUser.points,
      levelUp,
      pig: {
        pigName: updatedUser.pigName,
        pigLevel: updatedUser.pigLevel,
        pigXp: updatedUser.pigXp,
        pigHunger: updatedUser.pigHunger,
        pigThirst: updatedUser.pigThirst,
        pigSkin: updatedUser.pigSkin,
        pigWeapon: updatedUser.pigWeapon,
        pigPenLevel: updatedUser.pigPenLevel
      }
    });
  } catch (err) {
    console.error('Pig Care Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดูแลหมู' });
  }
});

// Upgrade pig pen
app.post('/api/user/pig/upgrade-pen', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    const currentPenLevel = user.pigPenLevel;
    if (currentPenLevel >= 4) {
      return res.status(400).json({ error: 'คอกหมูของคุณอัปเกรดถึงระดับสูงสุดแล้ว!' });
    }

    const penUpgrades = {
      1: { cost: 500, nextLevel: 2, name: 'คอกไม้สนตกแต่งสวยงาม' },
      2: { cost: 1000, nextLevel: 3, name: 'คอกเหล็กหุ้มเกราะ' },
      3: { cost: 2000, nextLevel: 4, name: 'วิมานหมูระดับสวรรค์' }
    };

    const upgrade = penUpgrades[currentPenLevel];
    if (user.points < upgrade.cost) {
      return res.status(400).json({ error: `พ้อยต์ไม่เพียงพอ (ต้องการ ${upgrade.cost} PTS, คุณมี ${user.points} PTS)` });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: user.points - upgrade.cost,
        pigPenLevel: upgrade.nextLevel
      }
    });

    res.json({
      message: `🔨 อัปเกรดคอกหมูเป็น "${upgrade.name}" สำเร็จ!`,
      points: updatedUser.points,
      pigPenLevel: updatedUser.pigPenLevel
    });
  } catch (err) {
    console.error('Upgrade Pen Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเกรดคอกหมู' });
  }
});

// Buy unlockable pig item (skin / weapon)
app.post('/api/user/pig/buy-item', authenticateToken, async (req, res) => {
  const { category, itemId } = req.body; // category = 'skin' or 'weapon'
  
  const skins = {
    armour: { cost: 500, name: 'ชุดเกราะเหล็กอัศวิน' },
    gold: { cost: 1500, name: 'ชุดกษัตริย์ทองคำ' },
    roblox: { cost: 800, name: 'หน้ากาก Roblox Manface' },
    ninja: { cost: 1000, name: 'ชุดนินจาเงาเกล็ดปลา' },
    banana_suit: { cost: 750, name: 'ชุดมาสคอตกล้วยเหลือง' },
    wood_armor: { cost: 350, name: 'ชุดเกราะไม้ป่าดงดิบ' },
    police_suit: { cost: 900, name: 'ชุดเครื่องแบบตำรวจปราบจลาจล' },
    knight_cape: { cost: 600, name: 'ผ้าคลุมนักรบผู้พิทักษ์' },
    stone_golem: { cost: 850, name: 'ผิวหินแกรนิตโบราณ' },
    superman: { cost: 1100, name: 'ชุดซูเปอร์ฮีโร่สีแดงน้ำเงิน' },
    astronaut: { cost: 1300, name: 'ชุดนักบินอวกาศไซไฟ' },
    samurai: { cost: 1250, name: 'ชุดเกราะซามูไรสีชาด' },
    dinosaur: { cost: 700, name: 'ชุดแฟนซีไดโนเสาร์เขียว' },
    pirate: { cost: 950, name: 'ชุดกัปตันโจรสลัดตาเดียว' },
    chef: { cost: 400, name: 'ชุดเชฟยอดนักปรุงอาหาร' },
    detective: { cost: 800, name: 'ชุดโค้ทนักสืบเชอร์ล็อก' },
    cyberpunk: { cost: 1400, name: 'ชุดแจ็คเก็ตนีออนอนาคต' },
    pharaoh: { cost: 1600, name: 'ชุดฟาโรห์ทองคำอียิปต์' },
    ghost: { cost: 300, name: 'ชุดผ้าคลุมผีขาวสุดหลอน' }
  };

  const weapons = {
    sword: { cost: 300, name: 'ดาบเหล็กผู้กล้า' },
    wand: { cost: 600, name: 'คทาดาวนำโชค' },
    lollipop: { cost: 400, name: 'อมยิ้มแคนดี้สีชมพู' },
    roblox_shield: { cost: 500, name: 'โล่บล็อกเหลืองฟ้า' },
    banana: { cost: 250, name: 'กล้วยหอมจอมพลัง' },
    wooden_club: { cost: 200, name: 'กระบองไม้สนคู่ใจ' },
    laser_gun: { cost: 1200, name: 'ปืนเลเซอร์อวกาศ' },
    battle_axe: { cost: 700, name: 'ขวานศึกเหล็กกล้า' },
    throwing_rock: { cost: 150, name: 'ก้อนหินดินระเบิด' },
    slingshot: { cost: 180, name: 'หนังสติ๊กยิงเป้า' },
    carrot: { cost: 220, name: 'แครอทสีส้มแหลมคม' },
    magic_book: { cost: 850, name: 'ตำราเวทมนตร์โบราณ' },
    guitar: { cost: 650, name: 'กีตาร์ร็อกเกอร์ขับกล่อม' },
    frying_pan: { cost: 350, name: 'กระทะเหล็กกันกระสุน' },
    police_baton: { cost: 500, name: 'กระบองตำรวจรักษาการณ์' },
    water_gun: { cost: 300, name: 'ปืนฉีดน้ำสงกรานต์' },
    boxing_glove: { cost: 450, name: 'นวมชกมวยสีแดงแรงฤทธิ์' },
    ninja_star: { cost: 400, name: 'ดาวกระจายวายุหมุน' },
    lightsaber: { cost: 1500, name: 'ดาบแสงเจไดพลังวิเศษ' }
  };

  let selectedItem = null;
  if (category === 'skin') selectedItem = skins[itemId];
  else if (category === 'weapon') selectedItem = weapons[itemId];

  if (!selectedItem) {
    return res.status(400).json({ error: 'ไอเทมที่ต้องการซื้อไม่ถูกต้อง' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    if (user.points < selectedItem.cost) {
      return res.status(400).json({ error: `พ้อยต์ไม่เพียงพอ (ต้องการ ${selectedItem.cost} PTS, คุณมี ${user.points} PTS)` });
    }

    let unlockedListStr = category === 'skin' ? user.pigUnlockedSkins : user.pigUnlockedWeapons;
    let list = unlockedListStr.split(',').map(s => s.trim());

    if (list.includes(itemId)) {
      return res.status(400).json({ error: 'คุณปลดล็อกไอเทมชิ้นนี้เรียบร้อยแล้ว' });
    }

    list.push(itemId);
    const newListStr = list.join(',');

    const updateField = category === 'skin' ? 'pigUnlockedSkins' : 'pigUnlockedWeapons';

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: user.points - selectedItem.cost,
        [updateField]: newListStr
      }
    });

    res.json({
      message: `🎉 ปลดล็อก "${selectedItem.name}" สำเร็จ!`,
      points: updatedUser.points,
      unlockedItems: newListStr
    });
  } catch (err) {
    console.error('Buy Pig Item Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการซื้อไอเทม' });
  }
});

// Equip pig skin or weapon
app.post('/api/user/pig/equip', authenticateToken, async (req, res) => {
  const { category, itemId } = req.body; // category = 'skin' or 'weapon'

  if (itemId !== 'default') {
    const validSkins = ['armour', 'gold', 'roblox', 'ninja', 'banana_suit', 'wood_armor', 'police_suit', 'knight_cape', 'stone_golem', 'superman', 'astronaut', 'samurai', 'dinosaur', 'pirate', 'chef', 'detective', 'cyberpunk', 'pharaoh', 'ghost'];
    const validWeapons = ['sword', 'wand', 'lollipop', 'roblox_shield', 'banana', 'wooden_club', 'laser_gun', 'battle_axe', 'throwing_rock', 'slingshot', 'carrot', 'magic_book', 'guitar', 'frying_pan', 'police_baton', 'water_gun', 'boxing_glove', 'ninja_star', 'lightsaber'];
    
    if (category === 'skin' && !validSkins.includes(itemId)) {
      return res.status(400).json({ error: 'สกินไม่ถูกต้อง' });
    }
    if (category === 'weapon' && !validWeapons.includes(itemId)) {
      return res.status(400).json({ error: 'อาวุธไม่ถูกต้อง' });
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    // Check if unlocked
    let unlockedListStr = category === 'skin' ? user.pigUnlockedSkins : user.pigUnlockedWeapons;
    let list = unlockedListStr.split(',').map(s => s.trim());

    if (itemId !== 'default' && !list.includes(itemId)) {
      return res.status(400).json({ error: 'คุณต้องซื้อปลดล็อกไอเทมชิ้นนี้ก่อนสวมใส่' });
    }

    const updateField = category === 'skin' ? 'pigSkin' : 'pigWeapon';

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        [updateField]: itemId
      }
    });

    res.json({
      message: 'ติดตั้งไอเทมเรียบร้อยแล้ว!',
      pigSkin: updatedUser.pigSkin,
      pigWeapon: updatedUser.pigWeapon
    });
  } catch (err) {
    console.error('Equip Pig Item Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสวมใส่ไอเทม' });
  }
});

// Background queue worker for AI generation
async function startExamGenerationWorker() {
  console.log('[Queue Worker] Background exam generator worker started.');
  setInterval(async () => {
    try {
      // Find the next PENDING exam set
      const pendingSet = await prisma.examSet.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' }
      });
      
      if (!pendingSet) return;
      
      console.log(`[Queue Worker] Processing ExamSet ID: ${pendingSet.id} in background...`);
      
      // Update status to PROCESSING
      await prisma.examSet.update({
        where: { id: pendingSet.id },
        data: { status: 'PROCESSING' }
      });
      
      // Perform generation
      const subject = pendingSet.category;
      const count = pendingSet.totalCount;
      const subcategories = pendingSet.subcategory; // comma separated string or null
      
      // Load raw terms from DB directory
      const absoluteCwd = path.resolve(path.join(__dirname, '..', 'DBEXAM'));
      const dbDir = path.join(absoluteCwd, 'db');
      let allEntries = [];
      
      if (fs.existsSync(dbDir)) {
        const dbFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'));
        for (const filename of dbFiles) {
          if (subject === 'law' && !filename.includes('law')) continue;
          if (subject === 'secretariat' && !filename.includes('sarabarn')) continue;
          
          const filePath = path.join(dbDir, filename);
          try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);
            const entries = data.entries || (data.knowledge_database && data.knowledge_database.entries) || [];
            allEntries = allEntries.concat(entries);
          } catch (err) {
            console.error(`Error reading/parsing db ${filename}:`, err);
          }
        }
      }
      
      // Subcategory mapping
      const subcategoryMap = {
        // Secretariat
        "secretariat_general": "บททั่วไป",
        "secretariat_types": "หมวด ๑ ชนิดของหนังสือ",
        "secretariat_receiving": "หมวด ๒ การรับและส่งหนังสือ",
        "secretariat_keeping": "หมวด ๓ การเก็บรักษา ยืม และทำลายหนังสือ",
        "secretariat_standards": "หมวด ๔ มาตรฐานตรา แบบพิมพ์ และซอง",
        "secretariat_e_sarabarn": "หมวด ๕ ระบบสารบรรณอิเล็กทรอนิกส์",
        "secretariat_appendix": "ภาคผนวก",
        
        // Law
        "general_law_state": ["ความรู้ทั่วไปเกี่ยวกับกฎหมาย", "ความรู้ทั่วไปเกี่ยวกับรัฐ"],
        "history_hierarchy": ["ประวัติศาสตร์กฎหมายไทย", "ลำดับศักดิ์ของกฎหมาย"],
        "constitution": "รัฐธรรมนูญ (กฎหมายสูงสุด)",
        "administrative": "กฎหมายปกครอง (กฎหมายมหาชน)",
        "civil_person": "กฎหมายแพ่ง — บุคคล",
        "civil_juristic_debt": ["กฎหมายแพ่ง — นิติกรรมและสัญญา", "กฎหมายแพ่ง — หนี้"],
        "civil_property": "กฎหมายแพ่ง — ทรัพย์",
        "civil_family": "กฎหมายแพ่ง — ครอบครัว",
        "civil_inheritance": "กฎหมายแพ่ง — มรดกและพินัยกรรม",
        "criminal_general": ["กฎหมายอาญา — หลักทั่วไป", "กฎหมายอาญา — โครงสร้างความรับผิดทางอาญา", "กฎหมายอาญา — เหตุยกเว้นความผิด/โทษ และบทลงโทษ", "กฎหมายอาญา — ตัวการ ผู้ใช้ ผู้สนับสนุน"],
        "criminal_offense": "ความผิดเกี่ยวกับทรัพย์ (อาญา)",
        "consumer_protection": "กฎหมายคุ้มครองผู้บริโภค",
        "intellectual_property": "ทรัพย์สินทางปัญญา",
        "labor": "กฎหมายแรงงาน",
        "tax": "กฎหมายภาษี",
        "registration_id_military": "กฎหมายทั่วไปเกี่ยวกับทะเบียนราษฎร์และสิทธิพลเมือง",
        "narcotics": "กฎหมายเฉพาะเรื่องอื่นๆ",
        "daily_life": "กฎหมายเฉพาะเรื่องอื่นๆ"
      };
      
      // Filter by subcategories if specified
      if (subcategories) {
        const subKeys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
        let targetCategoryNames = [];
        for (const key of subKeys) {
          const mapped = subcategoryMap[key];
          if (mapped) {
            if (Array.isArray(mapped)) {
              targetCategoryNames = targetCategoryNames.concat(mapped);
            } else {
              targetCategoryNames.push(mapped);
            }
          }
        }
        if (targetCategoryNames.length > 0) {
          allEntries = allEntries.filter(entry => 
            targetCategoryNames.includes(entry.category) || 
            targetCategoryNames.includes(entry.section)
          );
        }
      } else {
        const targetCategoryName = subcategoryMap[subject];
        if (targetCategoryName) {
          if (Array.isArray(targetCategoryName)) {
            allEntries = allEntries.filter(entry => 
              targetCategoryName.includes(entry.category) || 
              targetCategoryName.includes(entry.section)
            );
          } else {
            allEntries = allEntries.filter(entry => 
              entry.category === targetCategoryName || 
              entry.section === targetCategoryName
            );
          }
        }
      }
      
      if (allEntries.length === 0) {
        throw new Error('ไม่พบข้อมูลเนื้อหาดิบในระบบสำหรับวิชา/หมวดที่เลือก');
      }
      
      // Shuffle and pick terms
      const shuffledTerms = allEntries.sort(() => 0.5 - Math.random());
      const selectedTerms = shuffledTerms.slice(0, count);
      
      const apiKey = await getGeminiApiKey();
      const generatedQuestions = [];
      
      // Subcategory fallback files map
      const subcategoryFiles = {
        "secretariat_general": ["บททั่วไป.json", "นิยาม.json"],
        "secretariat_types": ["ชนิดของหนังสือ.json", "หมวด_๑_ชนิดของหนังสือ.json"],
        "secretariat_receiving": ["หมวด_๒_การรับและส่งหนังสือ.json"],
        "secretariat_keeping": ["หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json"],
        "secretariat_standards": ["หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json"],
        "secretariat_e_sarabarn": ["หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json"],
        "secretariat_appendix": ["ภาคผนวก.json"],
        
        // Law subcategories
        "general_law_state": ["กฎหมายเบื้องต้น.json"],
        "history_hierarchy": ["กฎหมายเบื้องต้น.json"],
        "constitution": ["กฎหมายเบื้องต้น.json"],
        "administrative": ["กฎหมายเบื้องต้น.json"],
        "civil_person": ["กฎหมายเบื้องต้น.json"],
        "civil_juristic_debt": ["กฎหมายเบื้องต้น.json"],
        "civil_property": ["กฎหมายเบื้องต้น.json"],
        "civil_family": ["กฎหมายเบื้องต้น.json"],
        "civil_inheritance": ["กฎหมายเบื้องต้น.json"],
        "criminal_general": ["กฎหมายเบื้องต้น.json"],
        "criminal_offense": ["กฎหมายเบื้องต้น.json"],
        "consumer_protection": ["กฎหมายเบื้องต้น.json"],
        "intellectual_property": ["กฎหมายเบื้องต้น.json"],
        "labor": ["กฎหมายเบื้องต้น.json"],
        "tax": ["กฎหมายเบื้องต้น.json"],
        "registration_id_military": ["กฎหมายเบื้องต้น.json"],
        "narcotics": ["กฎหมายเบื้องต้น.json"],
        "daily_life": ["กฎหมายเบื้องต้น.json"]
      };
      
      for (let i = 0; i < selectedTerms.length; i++) {
        const term = selectedTerms[i];
        let genQ = await generateQuestionFromTerm(term, apiKey);
        
        if (genQ) {
          generatedQuestions.push(genQ);
        } else {
          // Fallback: If Gemini failed to generate, pull a pre-saved question from question_bank files
          const qbDir = path.join(absoluteCwd, 'question_bank');
          let mappedFiles = [];
          if (subcategories) {
            const keys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
            for (const key of keys) {
              if (subcategoryFiles[key]) {
                mappedFiles = mappedFiles.concat(subcategoryFiles[key]);
              }
            }
          }
          if (mappedFiles.length === 0) {
            if (subject === 'law') {
              mappedFiles = ["กฎหมายเบื้องต้น.json"];
            } else {
              mappedFiles = [
                "บททั่วไป.json", "นิยาม.json", "ชนิดของหนังสือ.json", 
                "หมวด_๑_ชนิดของหนังสือ.json", "หมวด_๒_การรับและส่งหนังสือ.json", 
                "หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json", 
                "หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json", 
                "หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json", "ภาคผนวก.json"
              ];
            }
          }
          mappedFiles = [...new Set(mappedFiles)];
          
          let fallbackBank = [];
          for (const file of mappedFiles) {
            const filePath = path.join(qbDir, file);
            if (fs.existsSync(filePath)) {
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);
                fallbackBank = fallbackBank.concat(data.entries || []);
              } catch (e) {}
            }
          }
          
          if (fallbackBank.length > 0) {
            const randomSaved = fallbackBank[Math.floor(Math.random() * fallbackBank.length)];
            const choices = randomSaved.choices || [randomSaved.choice1, randomSaved.choice2, randomSaved.choice3, randomSaved.choice4];
            generatedQuestions.push({
              questionText: randomSaved.question || randomSaved.questionText || 'ข้อคำถามจากคลังข้อสอบ',
              choices: choices,
              answer: randomSaved.answer || 'A',
              explanation: randomSaved.explanation || 'คำอธิบายเฉลย...',
              subcategory: randomSaved.subcategory || randomSaved.section || 'ทั่วไป',
              document: randomSaved.document || 'ทั่วไป',
              source_line: randomSaved.source_line || ''
            });
          }
        }
        
        // Delay to avoid rate limit
        if (i < selectedTerms.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Batch verification
      console.log(`[Queue Worker] Running verification for ${generatedQuestions.length} questions...`);
      const verResults = await verifyQuestionsBatch(generatedQuestions, selectedTerms, apiKey);
      
      // Process questions and write to DB
      const dbQuestionsData = [];
      for (let i = 0; i < generatedQuestions.length; i++) {
        let q = generatedQuestions[i];
        const result = verResults && verResults[i];
        
        if (result && result.pass === false && (result.score && result.score < 70)) {
          // Replace with fallback
          const qbDir = path.join(absoluteCwd, 'question_bank');
          let mappedFiles = [];
          if (subcategories) {
            const keys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
            for (const key of keys) {
              if (subcategoryFiles[key]) {
                mappedFiles = mappedFiles.concat(subcategoryFiles[key]);
              }
            }
          }
          if (mappedFiles.length === 0) {
            if (subject === 'law') {
              mappedFiles = ["กฎหมายเบื้องต้น.json"];
            } else {
              mappedFiles = [
                "บททั่วไป.json", "นิยาม.json", "ชนิดของหนังสือ.json", 
                "หมวด_๑_ชนิดของหนังสือ.json", "หมวด_๒_การรับและส่งหนังสือ.json", 
                "หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json", 
                "หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json", 
                "หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json", "ภาคผนวก.json"
              ];
            }
          }
          mappedFiles = [...new Set(mappedFiles)];
          
          let fallbackBank = [];
          for (const file of mappedFiles) {
            const filePath = path.join(qbDir, file);
            if (fs.existsSync(filePath)) {
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);
                fallbackBank = fallbackBank.concat(data.entries || []);
              } catch (e) {}
            }
          }
          
          if (fallbackBank.length > 0) {
            const randomSaved = fallbackBank[Math.floor(Math.random() * fallbackBank.length)];
            const choices = randomSaved.choices || [randomSaved.choice1, randomSaved.choice2, randomSaved.choice3, randomSaved.choice4];
            q = {
              questionText: randomSaved.question || randomSaved.questionText || 'ข้อคำถามจากคลังข้อสอบ',
              choices: choices,
              answer: randomSaved.answer || 'A',
              explanation: randomSaved.explanation || 'คำอธิบายเฉลย...',
              subcategory: randomSaved.subcategory || randomSaved.section || 'ทั่วไป'
            };
          }
        }
        
        // Format to db question
        const choices = q.choices || [q.choice1, q.choice2, q.choice3, q.choice4];
        let correctAnsIdx = 0;
        const ans = q.answer || 'A';
        if (ans === 'B' || ans === '2') correctAnsIdx = 1;
        else if (ans === 'C' || ans === '3') correctAnsIdx = 2;
        else if (ans === 'D' || ans === '4') correctAnsIdx = 3;
        
        dbQuestionsData.push({
          questionText: q.questionText,
          choice1: choices[0] || 'ตัวเลือก ก',
          choice2: choices[1] || 'ตัวเลือก ข',
          choice3: choices[2] || 'ตัวเลือก ค',
          choice4: choices[3] || 'ตัวเลือก ง',
          correctAnswer: correctAnsIdx,
          explanation: q.explanation || 'คำอธิบายเฉลย...',
          sortOrder: i
        });
      }
      
      // Save all questions in a transaction/Prisma write
      await prisma.$transaction(async (tx) => {
        for (const qData of dbQuestionsData) {
          await tx.question.create({
            data: {
              examSetId: pendingSet.id,
              ...qData
            }
          });
        }
      });
      
      // Set status to COMPLETED
      await prisma.examSet.update({
        where: { id: pendingSet.id },
        data: {
          status: 'COMPLETED',
          totalCount: dbQuestionsData.length
        }
      });
      
      console.log(`[Queue Worker] Successfully processed ExamSet ID: ${pendingSet.id}`);
      
    } catch (err) {
      console.error('[Queue Worker] Error processing pending exam:', err);
      try {
        const failedSet = await prisma.examSet.findFirst({
          where: { status: 'PROCESSING' }
        });
        if (failedSet) {
          await prisma.examSet.update({
            where: { id: failedSet.id },
            data: { status: 'FAILED' }
          });
        }
      } catch (e) {
        console.error('[Queue Worker] Failed to mark as FAILED:', e);
      }
    }
  }, 5000); // Check every 5 seconds
}

// Start express server
app.listen(PORT, async () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  await ensureDefaultQuestions();
  await startExamGenerationWorker();

  // Chat cleanup worker (runs every 15 mins to delete messages older than 3 hours)
  setInterval(async () => {
    try {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const res = await prisma.chatMessage.deleteMany({
        where: {
          createdAt: { lt: threeHoursAgo }
        }
      });
      if (res.count > 0) {
        console.log(`[Chat Cleanup] Deleted ${res.count} messages older than 3 hours.`);
      }
    } catch (e) {
      console.error('[Chat Cleanup] Error:', e);
    }
  }, 15 * 60 * 1000);
});

\\n
## File: server\inject-frontend-js.js

\\nimport fs from 'fs';

const filePath = 'c:\\\\Users\\\\minam\\\\Downloads\\\\police-exam\\\\home\\\\index.html';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Insert new global variables
const oldGlobals = `let currentExam = null;
let currentQuestions = [];
let currentQuestionIdx = 0;`;

const newGlobals = `let currentExam = null;
let currentQuestions = [];
let currentQuestionIdx = 0;
let userBookmarks = [];
let userWrongCategories = [];`;

content = content.replace(oldGlobals, newGlobals);

// 2. Fetch bookmarks when opening exam modal
const oldOpenExamModalStart = `async function openExamModal(preselectedSubject = null) {`;
const newOpenExamModalStart = `async function openExamModal(preselectedSubject = null) {
  // Load user bookmarks
  try {
    const response = await fetch(\`\${API_BASE_URL}/user/bookmarks\`, {
      headers: { 'Authorization': \`Bearer \${token}\` }
    });
    if (response.ok) {
      userBookmarks = await response.json();
    }
  } catch (err) {
    console.error('Error loading bookmarks:', err);
  }
  // Load user wrong categories stats
  try {
    const response = await fetch(\`\${API_BASE_URL}/user/wrong-categories\`, {
      headers: { 'Authorization': \`Bearer \${token}\` }
    });
    if (response.ok) {
      userWrongCategories = await response.json();
      renderWrongCategoriesStats();
    }
  } catch (err) {
    console.error('Error loading wrong categories:', err);
  }
`;

content = content.replace(oldOpenExamModalStart, newOpenExamModalStart);

// 3. Replace renderExamQuestion function block
const renderExamQuestionStartStr = 'function renderExamQuestion() {';
const renderExamQuestionEndStr = 'function selectChoice(choiceIdx) {';

const renderStartIndex = content.indexOf(renderExamQuestionStartStr);
const renderEndIndex = content.indexOf(renderExamQuestionEndStr);

if (renderStartIndex === -1 || renderEndIndex === -1) {
  console.error('ERROR: Could not locate renderExamQuestion boundaries!', renderStartIndex, renderEndIndex);
  process.exit(1);
}

const newRenderExamQuestion = `function renderExamQuestion() {
      if (currentQuestions.length === 0) return;

      const q = currentQuestions[currentQuestionIdx];
      
      const progressPercent = Math.round(((currentQuestionIdx + 1) / currentQuestions.length) * 100);
      document.getElementById('test-progress-bar').style.width = \`\${progressPercent}%\`;
      document.getElementById('test-progress-text').textContent = \`ข้อที่ \${currentQuestionIdx + 1} / \${currentQuestions.length}\`;
      document.getElementById('test-question-text').textContent = q.questionText;

      const container = document.getElementById('test-choices-list');
      container.innerHTML = '';

      const choices = [q.choice1, q.choice2, q.choice3, q.choice4];
      const labels = ['ก', 'ข', 'ค', 'ง'];

      choices.forEach((choiceText, idx) => {
        const btn = document.createElement('button');
        const isSelected = userAnswers[currentQuestionIdx] === idx;
        btn.className = \`w-full p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all \${
          isSelected
            ? 'border-amber-400 bg-amber-50/50 text-slate-900 font-extrabold shadow-sm'
            : 'border-slate-200 hover:border-amber-200 bg-white hover:bg-slate-50 text-slate-700 font-medium'
        }\`;
        btn.onclick = () => selectChoice(idx);
        btn.innerHTML = \`
          <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-sm \${isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-500'
          }\">\${labels[idx]}</div>
          <div class="text-sm leading-relaxed">\${choiceText}</div>
        \`;
        container.appendChild(btn);
      });

      // Update Bookmark UI state
      const isBookmarked = userBookmarks.some(b => String(b.questionId) === String(q.id));
      const bookmarkIcon = document.getElementById('bookmark-icon');
      const bookmarkText = document.getElementById('bookmark-text');
      if (bookmarkIcon && bookmarkText) {
        if (isBookmarked) {
          bookmarkIcon.textContent = '★';
          bookmarkIcon.className = 'text-sm text-amber-500';
          bookmarkText.textContent = 'บันทึกข้อสอบแล้ว';
          bookmarkText.className = 'text-amber-500 font-extrabold';
        } else {
          bookmarkIcon.textContent = '☆';
          bookmarkIcon.className = 'text-sm text-slate-500';
          bookmarkText.textContent = 'บันทึกข้อสอบ';
          bookmarkText.className = 'text-slate-500 font-extrabold';
        }
      }

      // Render Question Navigation Grid
      const navGrid = document.getElementById('test-navigation-grid');
      const answeredRatio = document.getElementById('test-answered-ratio');
      const totalCount = currentQuestions.length;
      const answeredCount = userAnswers.filter(a => a !== undefined).length;
      
      if (answeredRatio) {
        answeredRatio.textContent = \`\${answeredCount} / \${totalCount} ข้อ\`;
      }

      if (navGrid) {
        navGrid.innerHTML = '';
        currentQuestions.forEach((_, idx) => {
          const gridBtn = document.createElement('button');
          const isCurrent = idx === currentQuestionIdx;
          const isAnswered = userAnswers[idx] !== undefined;
          
          gridBtn.className = \`w-10 h-10 text-xs font-black rounded-xl border-2 flex items-center justify-center transition-all shadow-sm \${
            isCurrent
              ? 'bg-amber-400 border-amber-500 text-slate-900 ring-2 ring-amber-300 ring-offset-2 scale-105'
              : isAnswered
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }\`;
          gridBtn.textContent = idx + 1;
          gridBtn.onclick = () => {
            currentQuestionIdx = idx;
            renderExamQuestion();
          };
          navGrid.appendChild(gridBtn);
        });
      }

      const btnPrev = document.getElementById('test-btn-prev');
      const btnNext = document.getElementById('test-btn-next');

      btnPrev.style.display = currentQuestionIdx === 0 ? 'none' : 'flex';

      if (currentQuestionIdx === currentQuestions.length - 1) {
        if (answeredCount < totalCount) {
          btnNext.innerHTML = \`<span>ส่งข้อสอบ (ยังทำไม่ครบ)</span> <span>🔒</span>\`;
          btnNext.className = "px-6 py-3 bg-slate-200 border-2 border-slate-300 text-slate-400 text-xs font-extrabold rounded-2xl flex items-center gap-1.5 cursor-not-allowed shadow-none";
        } else {
          btnNext.innerHTML = \`<span>ส่งข้อสอบ</span> <span>ส่งคำตอบ 🏁</span>\`;
          btnNext.className = "px-6 py-3 btn-3d-yellow text-xs font-extrabold rounded-2xl text-slate-950 flex items-center gap-1.5 shadow-[0_4px_0_#d97706]";
        }
      } else {
        btnNext.innerHTML = \`<span>ข้อถัดไป</span> <span>→</span>\`;
        btnNext.className = "px-6 py-3 btn-3d-slate text-xs font-extrabold rounded-2xl text-slate-700 flex items-center gap-1.5";
      }
    }

`;

content = content.substring(0, renderStartIndex) + newRenderExamQuestion + content.substring(renderEndIndex);

// 4. Replace examNextQuestion function block
const nextQuestionStartStr = 'function examNextQuestion() {';
const nextQuestionEndStr = 'async function saveAndSubmitExam(isExit) {';

// We must find nextQuestionStartStr and nextQuestionEndStr in the updated content
const nextStartIndex = content.indexOf(nextQuestionStartStr);
const nextEndIndex = content.indexOf(nextQuestionEndStr);

if (nextStartIndex === -1 || nextEndIndex === -1) {
  console.error('ERROR: Could not locate examNextQuestion boundaries!', nextStartIndex, nextEndIndex);
  process.exit(1);
}

const newExamNextQuestion = `function examNextQuestion() {
      if (currentQuestionIdx < currentQuestions.length - 1) {
        currentQuestionIdx++;
        renderExamQuestion();
      } else {
        const total = currentQuestions.length;
        const answered = userAnswers.filter(a => a !== undefined).length;
        if (answered < total) {
          alert(\`กรุณาตอบคำถามให้ครบถ้วนก่อนส่งข้อสอบ (ตอบแล้ว \${answered} จากทั้งหมด \${total} ข้อ)\`);
          return;
        }
        submitExamAnswers();
      }
    }

`;

content = content.substring(0, nextStartIndex) + newExamNextQuestion + content.substring(nextEndIndex);

// 5. Add Bookmark and Report logic helper functions
const bookmarkAndReportHelpers = `
    // --- Bookmark & Report Client logic ---
    async function toggleBookmarkCurrentQuestion() {
      if (currentQuestions.length === 0) return;
      const q = currentQuestions[currentQuestionIdx];
      const isBookmarked = userBookmarks.some(b => String(b.questionId) === String(q.id));
      
      const endpoint = \`\${API_BASE_URL}/user/bookmarks\`;
      
      try {
        if (isBookmarked) {
          // DELETE
          const response = await fetch(\`\${endpoint}/\${q.id}\`, {
            method: 'DELETE',
            headers: { 'Authorization': \`Bearer \${token}\` }
          });
          if (response.ok) {
            userBookmarks = userBookmarks.filter(b => String(b.questionId) !== String(q.id));
            renderExamQuestion();
            alert('ยกเลิกการบันทึกข้อสอบเรียบร้อยแล้ว');
          }
        } else {
          // POST
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': \`Bearer \${token}\`
            },
            body: JSON.stringify({
              questionId: String(q.id),
              questionText: q.questionText,
              choice1: q.choice1,
              choice2: q.choice2,
              choice3: q.choice3,
              choice4: q.choice4,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || 'เฉลยรายละเอียด...',
              category: q.examSet?.category || currentExam.category || 'general',
              subcategory: q.subcategory || q.examSet?.subcategory || ''
            })
          });
          if (response.ok) {
            const data = await response.json();
            userBookmarks.push(data.bookmark);
            renderExamQuestion();
            alert('บันทึกข้อสอบเรียบร้อยแล้ว! สามารถเปิดดูได้ที่แถบสถิติ/ทบทวน');
          }
        }
        renderBookmarkedQuestionsList();
      } catch (err) {
        console.error('Bookmark toggle error:', err);
        alert('ไม่สามารถประมวลผลการบันทึกได้');
      }
    }

    function openReportCurrentQuestionModal() {
      if (currentQuestions.length === 0) return;
      document.getElementById('report-reason').value = '';
      const modal = document.getElementById('report-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeReportModal() {
      const modal = document.getElementById('report-modal');
      if (modal) modal.classList.add('hidden');
    }

    async function submitQuestionReport() {
      const q = currentQuestions[currentQuestionIdx];
      const reason = document.getElementById('report-reason').value.trim();
      if (!reason) {
        alert('กรุณากรอกเหตุผลหรือรายละเอียดปัญหาที่พบ');
        return;
      }

      try {
        const response = await fetch(\`\${API_BASE_URL}/user/reports\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify({
            questionId: String(q.id),
            questionText: q.questionText,
            reason: reason
          })
        });
        if (response.ok) {
          alert('ส่งรายงานข้อสอบเรียบร้อยแล้ว ขอบคุณสำหรับการแจ้งข้อมูล!');
          closeReportModal();
        } else {
          const errData = await response.json();
          alert(errData.error || 'เกิดข้อผิดพลาดในการส่งรายงาน');
        }
      } catch (err) {
        console.error('Report submission error:', err);
        alert('ไม่สามารถส่งรายงานได้ในขณะนี้');
      }
    }
`;

// Insert the helpers right before saveAndSubmitExam function
const insertTarget = 'async function saveAndSubmitExam(isExit) {';
const insertIndex = content.indexOf(insertTarget);

if (insertIndex === -1) {
  console.error('Could not find saveAndSubmitExam insert target!');
  process.exit(1);
}

content = content.substring(0, insertIndex) + bookmarkAndReportHelpers + content.substring(insertIndex);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected frontend JavaScript actions into home/index.html!');

\\n
## File: server\list_users.js

\\nimport { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      level: true,
      pigLevel: true
    }
  });
  console.log("Users in DB:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());

\\n
## File: server\package.json

\\n{
  "name": "police-exam-server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^9.0.1",
    "pptxgenjs": "^4.0.1"
  },
  "devDependencies": {
    "acorn": "^8.17.0",
    "nodemon": "^3.1.0",
    "prisma": "^6.0.0"
  }
}

\\n
## File: server\print-exam-functions.js

\\nimport fs from 'fs';

const content = fs.readFileSync('c:\\Users\\minam\\Downloads\\police-exam\\home\\index.html', 'utf8');
const lines = content.split('\n');

console.log('Printing exam functions in home/index.html...');
for (let i = 1650; i <= 1860; i++) {
  if (lines[i]) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}

\\n
## File: server\prisma\schema.prisma

\\ndatasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  fullName  String   @default("")
  role             String   @default("USER")
  emailVerified    Boolean  @default(false)
  emailVerifyToken String?
  points           Int      @default(0)
  level            Int      @default(1)
  xp               Int      @default(0)
  streak           Int      @default(0)
  battleWins       Int      @default(0)
  scoreGeneral     Int      @default(0)
  scoreThai        Int      @default(0)
  scoreEnglish     Int      @default(0)
  scoreComputer    Int      @default(0)
  scoreSocial      Int      @default(0)
  scoreSecretariat Int      @default(0)
  scoreLaw         Int      @default(0)
  pigName          String   @default("น้องหมูนำโชค")
  pigLevel         Int      @default(1)
  pigXp            Int      @default(0)
  pigHunger        Int      @default(80)
  pigThirst        Int      @default(80)
  pigSkin          String   @default("default")
  pigWeapon        String   @default("default")
  pigPenLevel      Int      @default(1)
  pigUnlockedSkins String   @default("default")
  pigUnlockedWeapons String @default("default")
  faceImage        String?  @db.Text
  premiumUntil     DateTime?
  aiGenCount       Int      @default(0)
  aiGenLastDate    DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  stageProgress    UserStageProgress[]
  examSets         ExamSet[]
  premiumRequests  PremiumRequest[]
  vocabRecords     VocabRecord[]
  incorrectQuestions IncorrectQuestion[]
  wrongCategories   WrongCategory[]
  bookmarks         Bookmark[]
  reportedQuestions ReportedQuestion[]
  posts             Post[]
  comments          Comment[]
  chatMessages      ChatMessage[]
  createdGroups           Group[]              @relation("CreatedGroups")
  groupMemberships        GroupMember[]
  groupMessages           GroupChatMessage[]
  friendsAsUser           Friend[]             @relation("UserFriends")
  friendsAsFriend         Friend[]             @relation("FriendUsers")
  blockedUsers            Block[]              @relation("BlockedByUser")
  blockedBy               Block[]              @relation("BlockedUserUsers")
  sentPrivateMessages     PrivateChatMessage[] @relation("SentPrivateMessages")
  receivedPrivateMessages PrivateChatMessage[] @relation("ReceivedPrivateMessages")
}

model Stage {
  id        Int      @id @default(autoincrement())
  title     String
  icon      String   @default("📝")
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  progress  UserStageProgress[]
}

model UserStageProgress {
  id          Int      @id @default(autoincrement())
  userId      Int
  stageId     Int
  completed   Boolean  @default(false)
  score       Int      @default(0)
  completedAt DateTime?
  user        User     @relation(fields: [userId], references: [id])
  stage       Stage    @relation(fields: [stageId], references: [id])
  @@unique([userId, stageId])
}

model ExamSet {
  id          Int        @id @default(autoincrement())
  title       String
  category    String
  subcategory String?
  totalCount  Int        @default(0)
  isPublic    Boolean    @default(true)
  status      String     @default("COMPLETED")
  createdById Int
  createdBy   User       @relation(fields: [createdById], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  questions   Question[]
}

model Question {
  id            Int      @id @default(autoincrement())
  examSetId     Int
  examSet       ExamSet  @relation(fields: [examSetId], references: [id], onDelete: Cascade)
  questionText  String   @db.Text
  choice1       String   @db.Text
  choice2       String   @db.Text
  choice3       String   @db.Text
  choice4       String   @db.Text
  correctAnswer Int
  explanation   String?  @db.Text
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  incorrectQuestions IncorrectQuestion[]
}

model Announcement {
  id               Int      @id @default(autoincrement())
  orgName          String   // ชื่อหน่วยงานเต็ม เช่น กองบัญชาการศึกษา
  orgAbbr          String   // ตัวย่อหน่วยงาน เช่น บช.ศ.
  jobTitle         String   // สายงาน/รายละเอียดงาน เช่น กลุ่มสายงานอำนวยการและสนับสนุน ม.6/ปวช.
  positionsCount   Int      // จำนวนอัตรา เช่น 800
  year             Int      // ปี พ.ศ. เช่น 2569
  announcementDate String   @default("") // วันที่ประกาศ
  registerDate     String   @default("") // วันที่รับสมัคร
  seatSelectDate   String   @default("") // วันที่เลือกที่นั่งสอบ
  photoEditDate    String   @default("") // วันที่ให้แก้ไขรูปถ่าย
  printCardDate    String   @default("") // วันพิมพ์บัตรประจำตัวสอบ
  examDate         String   @default("") // วันสอบ
  status           String   @default("เปิดรับสมัครล่าสุด") // สถานะประกาศ
  link             String   @default("") // ลิงก์ต้นทางสมัครสอบ
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Feedback {
  id        Int      @id @default(autoincrement())
  sender    String
  email     String
  type      String
  message   String   @db.Text
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model PremiumRequest {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  slipImage String   @db.Text
  status    String   @default("PENDING") // PENDING, APPROVED, REJECTED
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VocabRecord {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  level       String   // A1, A2, B1, B2, C1
  mode        String   // same, trans
  timeSeconds Int
  createdAt   DateTime @default(now())
}

model IncorrectQuestion {
  id         Int      @id @default(autoincrement())
  userId     Int
  questionId Int
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@unique([userId, questionId])
}

model PasswordReset {
  id        Int      @id @default(autoincrement())
  email     String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model SystemSetting {
  key   String @id
  value String @db.Text
}

model WrongCategory {
  id        Int      @id @default(autoincrement())
  userId    Int
  category  String   // e.g. "general", "thai", "english", "computer", "social", "secretariat", "law"
  count     Int      @default(0)
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, category])
}

model Bookmark {
  id            Int      @id @default(autoincrement())
  userId        Int
  questionId    String   // 'ai-gen-...' or numeric string
  questionText  String   @db.Text
  choice1       String   @db.Text
  choice2       String   @db.Text
  choice3       String   @db.Text
  choice4       String   @db.Text
  correctAnswer Int
  explanation   String?  @db.Text
  category      String
  subcategory   String?
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
}

model ReportedQuestion {
  id           Int      @id @default(autoincrement())
  userId       Int
  questionId   String
  questionText String   @db.Text
  reason       String   @db.Text
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Post {
  id        Int       @id @default(autoincrement())
  content   String    @db.Text
  userId    Int
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
  comments  Comment[]
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  postId    Int
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model ChatMessage {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model Group {
  id          Int                @id @default(autoincrement())
  name        String
  description String?            @db.Text
  isPrivate   Boolean            @default(false)
  createdById Int
  createdBy   User               @relation("CreatedGroups", fields: [createdById], references: [id], onDelete: Cascade)
  createdAt   DateTime           @default(now())
  members     GroupMember[]
  messages    GroupChatMessage[]
}

model GroupMember {
  id        Int      @id @default(autoincrement())
  groupId   Int
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  status    String   @default("ACCEPTED")
  createdAt DateTime @default(now())
  @@unique([groupId, userId])
}

model GroupChatMessage {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  groupId   Int
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model Friend {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation("UserFriends", fields: [userId], references: [id], onDelete: Cascade)
  friendId  Int
  friend    User     @relation("FriendUsers", fields: [friendId], references: [id], onDelete: Cascade)
  status    String   @default("ACCEPTED")
  createdAt DateTime @default(now())
  @@unique([userId, friendId])
}

model Block {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation("BlockedByUser", fields: [userId], references: [id], onDelete: Cascade)
  blockedId Int
  blockedUser User   @relation("BlockedUserUsers", fields: [blockedId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, blockedId])
}

model PrivateChatMessage {
  id         Int      @id @default(autoincrement())
  content    String   @db.Text
  senderId   Int
  sender     User     @relation("SentPrivateMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiverId Int
  receiver   User     @relation("ReceivedPrivateMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
}

\\n
## File: server\reset-scores.js

\\nimport dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Reset user statistics to defaults
    const result = await prisma.user.updateMany({
      data: {
        points: 0,
        level: 1,
        xp: 0,
        pigLevel: 1,
        pigXp: 0,
        streak: 0,
        scoreGeneral: 0,
        scoreThai: 0,
        scoreEnglish: 0,
        scoreComputer: 0,
        scoreSocial: 0,
        scoreSecretariat: 0,
        scoreLaw: 0
      }
    });
    console.log(`Successfully reset points, levels, XP, and scores to default values for all users (Total: ${result.count} accounts).`);

    // 2. Clear exam completion progress statistics (UserStageProgress)
    const progressCount = await prisma.userStageProgress.deleteMany({});
    console.log(`Successfully cleared all exam completion records (Total: ${progressCount.count} records).`);

    // 3. Clear incorrect question tracking records (IncorrectQuestion)
    const incorrectCount = await prisma.incorrectQuestion.deleteMany({});
    console.log(`Successfully cleared all incorrect questions records (Total: ${incorrectCount.count} records).`);

    // 4. Clear vocabulary practice history records (VocabRecord)
    const vocabCount = await prisma.vocabRecord.deleteMany({});
    console.log(`Successfully cleared all vocab practice records (Total: ${vocabCount.count} records).`);

    console.log('✨ All user statistics, points, and completion progress records have been completely cleared and reset to 0.');
  } catch (error) {
    console.error('Error during statistics reset:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

\\n
## File: server\reset_users.js

\\nimport { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetAllUsers() {
  console.log("Starting reset of all user accounts (retaining their admin privileges)...");
  
  // Find all users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true
    }
  });

  const userIds = allUsers.map(u => u.id);
  console.log(`Found ${userIds.length} user accounts to reset.`);

  // 1. Delete all stage progress
  const deleteProgress = await prisma.userStageProgress.deleteMany({
    where: {
      userId: { in: userIds }
    }
  });
  console.log(`Deleted ${deleteProgress.count} stage progress records.`);

  // 2. Reset user attributes (points, level, xp, streak, subject scores) but leave role untouched
  const resetUsersResult = await prisma.user.updateMany({
    data: {
      level: 1,
      pigLevel: 1,
      xp: 0,
      pigXp: 0,
      points: 0,
      streak: 0,
      scoreGeneral: 0,
      scoreThai: 0,
      scoreEnglish: 0,
      scoreComputer: 0,
      scoreSocial: 0,
      scoreSecretariat: 0,
      scoreLaw: 0,
      pigHunger: 80,
      pigThirst: 80
    }
  });
  console.log(`Successfully reset points, levels, XP, and scores for ${resetUsersResult.count} users.`);
}

resetAllUsers()
  .catch(e => {
    console.error("Reset script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

\\n
## File: server\search-navigation-tabs.js

\\nimport fs from 'fs';

const content = fs.readFileSync('c:\\Users\\minam\\Downloads\\police-exam\\home\\index.html', 'utf8');
const lines = content.split('\n');

console.log('Searching for dashboard tabs in home/index.html...');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('nav-') || line.includes('switchTab') || line.includes('class="sidebar') || line.includes('menu-item') || line.includes('sidebar-menu')) {
    console.log(`L${i+1}: ${line.trim()}`);
  }
}

\\n
## File: server\seed-law-questions.js

\\nimport { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const lawQuestions = [
  {
    question: "บิดาแห่งกฎหมายไทย คือบุคคลใด?",
    choices: [
      "ก. พระเจ้าบรมวงศ์เธอ กรมหลวงราชบุรีดิเรกฤทธิ์ (พระองค์เจ้ารพีพัฒนศักดิ์)",
      "ข. สมเด็จพระเจ้าบรมวงศ์เธอ กรมพระยาดำรงราชานุภาพ",
      "ค. พ่อขุนรามคำแหงมหาราช",
      "ง. พระยาแมนปกรณ์นิติธาดา"
    ],
    answer: 0,
    explanation: "พระเจ้าบรมวงศ์เธอ กรมหลวงราชบุรีดิเรกฤทธิ์ (พระองค์เจ้ารพีพัฒนศักดิ์) ทรงเป็นผู้วางรากฐานระบบกฎหมายและการศาลยุติธรรมสมัยใหม่ของประเทศไทย จึงได้รับเทิดทูนเป็นบิดาแห่งกฎหมายไทย"
  },
  {
    question: "ข้อใดกล่าวถึงลักษณะของระบบกฎหมายลายลักษณ์อักษร (Civil Law) ได้ถูกต้องที่สุด?",
    choices: [
      "ก. ยึดจารีตประเพณีและคำพิพากษาของศาลในอดีตเป็นหลักในการตัดสิน",
      "ข. ยึดถือบทบัญญัติที่บันทึกเป็นลายลักษณ์อักษรหรือเป็นประมวลกฎหมายที่ตราขึ้นโดยฝ่ายนิติบัญญัติเป็นหลักในการตัดสิน",
      "ค. เป็นระบบกฎหมายที่ไม่มีการตรากฎหมายแม่บทขึ้นใช้บังคับเลย",
      "ง. ใช้กับประเทศแถบยุโรปเหนือและเอเชียกลางเท่านั้น"
    ],
    answer: 1,
    explanation: "ระบบกฎหมายลายลักษณ์อักษร (Civil Law) หรือระบบประมวลกฎหมาย จะยึดบทบัญญัติที่เป็นลายลักษณ์อักษรที่ผ่านกระบวนการนิติบัญญัติเป็นเกณฑ์หลักในการตัดสินคดีความ เช่น ประเทศไทย ญี่ปุ่น ฝรั่งเศส"
  },
  {
    question: "ประเทศในข้อใดที่ใช้ระบบกฎหมายไม่เป็นลายลักษณ์อักษร (Common Law) ทั้งหมด?",
    choices: [
      "ก. ไทย ญี่ปุ่น ฝรั่งเศส",
      "ข. อังกฤษ สหรัฐอเมริกา ออสเตรเลีย นิวซีแลนด์",
      "ค. สเปน เยอรมนี อิตาลี",
      "ง. จีน รัสเซีย เวียดนาม"
    ],
    answer: 1,
    explanation: "ระบบกฎหมายไม่เป็นลายลักษณ์อักษร (Common Law) หรือระบบจารีตประเพณี ใช้ในประเทศกลุ่มเครือจักรภพและผู้รับอิทธิพล เช่น อังกฤษ สหรัฐอเมริกา ออสเตรเลีย นิวซีแลนด์ และมาเลเซีย"
  },
  {
    question: "ข้อใดจัดเป็น กฎหมายสารบัญญัติ (Substantive Law)?",
    choices: [
      "ก. ประมวลกฎหมายวิธีพิจารณาความอาญา (ป.วิ.อ.)",
      "ข. ประมวลกฎหมายวิธีพิจารณาความแพ่ง (ป.วิ.พ.)",
      "ค. ประมวลกฎหมายอาญา และประมวลกฎหมายแพ่งและพาณิชย์",
      "ง. พระราชบัญญัติจัดตั้งศาลปกครองและวิธีพิจารณาคดีปกครอง"
    ],
    answer: 2,
    explanation: "กฎหมายสารบัญญัติ (Substantive Law) คือกฎหมายที่บัญญัติถึงสิทธิ หน้าที่ ความรับผิดชอบ และความผิด/โทษทางกฎหมายโดยตรง เช่น ประมวลกฎหมายอาญา และประมวลกฎหมายแพ่งและพาณิชย์"
  },
  {
    question: "กฎหมายในข้อใดจัดเป็น กฎหมายวิธีสบัญญัติ (Adjective Law / Procedural Law)?",
    choices: [
      "ก. ประมวลกฎหมายวิธีพิจารณาความอาญา",
      "ข. ประมวลกฎหมายอาญา",
      "ค. ประมวลกฎหมายแพ่งและพาณิชย์",
      "ง. พระราชบัญญัติตำรวจแห่งชาติ"
    ],
    answer: 0,
    explanation: "กฎหมายวิธีสบัญญัติ (Adjective Law) คือกฎหมายที่กำหนดหลักเกณฑ์และกระบวนการนำกฎหมายสารบัญญัติไปใช้บังคับ เช่น ประมวลกฎหมายวิธีพิจารณาความแพ่ง และวิธีพิจารณาความอาญา"
  },
  {
    question: "หลักเกณฑ์สำคัญที่สุดเกี่ยวกับลำดับศักดิ์ของกฎหมาย (Hierarchy of Law) คืออะไร?",
    choices: [
      "ก. กฎหมายที่มีศักดิ์ต่ำกว่าสามารถแก้ไขกฎหมายที่มีศักดิ์สูงกว่าได้",
      "ข. กฎหมายที่มีศักดิ์ต่ำกว่าจะขัดหรือแย้งกับกฎหมายที่มีศักดิ์สูงกว่าไม่ได้ หากขัดแย้งกันจะไม่มีผลบังคับใช้",
      "ค. กฎหมายทุกฉบับมีศักดิ์เท่ากันหมดขึ้นอยู่กับเจตนาของคณะรัฐมนตรี",
      "ง. กฎกระทรวงมีศักดิ์สูงกว่าพระราชกำหนด"
    ],
    answer: 1,
    explanation: "หัวใจของลำดับศักดิ์กฎหมายคือ กฎหมายลำดับรอง (ศักดิ์ต่ำกว่า) จะขัดหรือแย้งกับกฎหมายลำดับสูงกว่า (เช่น รัฐธรรมนูญ หรือ พ.ร.บ.) ไม่ได้ หากขัดหรือแย้งกัน กฎหมายที่มีศักดิ์ต่ำกว่านั้นจะตกเป็นโมฆะและใช้บังคับไม่ได้"
  },
  {
    question: "พระราชกำหนด (พ.ร.ก.) ตราขึ้นโดยฝ่ายใด และใช้ในสถานการณ์ใด?",
    choices: [
      "ก. ตราโดยฝ่ายนิติบัญญัติ (รัฐสภา) ในสถานการณ์ปกติ",
      "ข. ตราโดยฝ่ายบริหาร (คณะรัฐมนตรี) ในสถานการณ์พิเศษเพื่อประโยชน์ในความมั่นคงหรือความปลอดภัยของประเทศ",
      "ค. ตราโดยฝ่ายตุลาการ (ศาล) เมื่อต้องการตัดสินคดีเร่งด่วน",
      "ง. ตราโดยอธิบดีกรมต่างๆ เพื่อจัดระเบียบข้าราชการ"
    ],
    answer: 1,
    explanation: "พระราชกำหนด (พ.ร.ก.) ตราขึ้นโดยฝ่ายบริหาร (ครม.) ในสถานการณ์เร่งด่วนฉุกเฉินที่มีความจำเป็นเพื่อรักษาความปลอดภัยหรือความมั่นคงทางเศรษฐกิจของประเทศ โดยมีลำดับศักดิ์เทียบเท่าพระราชบัญญัติ"
  },
  {
    question: "ข้อใดจัดอยู่ในกลุ่ม กฎหมายอนุบัญญัติ?",
    choices: [
      "ก. พระราชบัญญัติ (พ.ร.บ.)",
      "ข. พระราชกำหนด (พ.ร.ก.)",
      "ค. พระราชกฤษฎีกา กฎกระทรวง และประกาศกระทรวง",
      "ง. รัฐธรรมนูญ"
    ],
    answer: 2,
    explanation: "กฎหมายอนุบัญญัติ (กฎหมายลำดับรอง) คือกฎหมายที่ตราขึ้นโดยองค์กรฝ่ายบริหารหรือหน่วยงานรัฐ เช่น พระราชกฤษฎีกา (ครม. ตราโดยคำแนะนำ), กฎกระทรวง (รัฐมนตรีเจ้าสังกัดตรา), และประกาศกระทรวง"
  },
  {
    question: "ข้อใดกล่าวถึงลักษณะของรัฐเดี่ยว (Unitary State) ได้ถูกต้องที่สุด?",
    choices: [
      "ก. มีรัฐบาลกลางและรัฐบาลมลรัฐปกครองแยกจากกัน",
      "ข. มีศูนย์กลางอำนาจปกครองและรัฐบาลเพียงชุดเดียวในการบริหารแผ่นดิน เช่น ประเทศไทย ญี่ปุ่น ฝรั่งเศส",
      "ค. เป็นรัฐที่ไม่มีอำนาจอธิปไตยเป็นของตนเอง",
      "ง. สามารถแบ่งแยกดินแดนออกเป็นรัฐย่อยๆ ได้เสรี"
    ],
    answer: 1,
    explanation: "รัฐเดี่ยว (Unitary State) คือรัฐที่มีการปกครองรวมศูนย์ มีรัฐบาลเดียวในการบริหารแผ่นดินทั้งหมด และดินแดนจะแบ่งแยกมิได้ตามรัฐธรรมนูญ เช่น ประเทศไทย ฝรั่งเศส และญี่ปุ่น"
  },
  {
    question: "ประเทศใดจัดอยู่ในรูปแบบของรัฐรวม (Federal State)?",
    choices: [
      "ก. ประเทศไทย ฝรั่งเศส บรูไน",
      "ข. ประเทศสหรัฐอเมริกา แคนาดา มาเลเซีย เยอรมนี",
      "ค. ประเทศญี่ปุ่น อังกฤษ สเปน",
      "ง. ประเทศสิงคโปร์ ลาว เวียดนาม"
    ],
    answer: 1,
    explanation: "รัฐรวม (Federal State) ประกอบด้วยมลรัฐย่อยๆ ที่มารวมกัน โดยแบ่งแยกอำนาจปกครองระหว่างรัฐบาลกลางและรัฐบาลท้องถิ่น/มลรัฐ เช่น สหรัฐอเมริกา แคนาดา มาเลเซีย และสวิตเซอร์แลนด์"
  },
  {
    question: "ข้อใดคือองค์ประกอบหลัก 4 ประการของรัฐที่ถูกต้องที่สุด?",
    choices: [
      "ก. ประชากร, ทรัพยากรธรรมชาติ, เงินตรา, กองทัพ",
      "ข. ประชากร, ดินแดน, รัฐบาล, อำนาจอธิปไตย",
      "ค. นายกรัฐมนตรี, รัฐสภา, ศาล, ข้าราชการ",
      "ง. ดินแดน, ชายฝั่งทะเล, รัฐธรรมนูญ, ประชาชน"
    ],
    answer: 1,
    explanation: "องค์ประกอบของรัฐตามกฎหมายระหว่างประเทศมี 4 ประการ ได้แก่ 1. ประชากร 2. ดินแดนที่มีอาณาเขตแน่นอน 3. รัฐบาลที่มีอำนาจปกครอง และ 4. อำนาจอธิปไตยที่เป็นอิสระ"
  },
  {
    question: "ทะเลอาณาเขต (Territorial Sea) ของรัฐชายฝั่งมีระยะกว้างเท่าใดนับจากเส้นฐาน?",
    choices: [
      "ก. ไม่เกิน 12 ไมล์ทะเล",
      "ข. ไม่เกิน 24 ไมล์ทะเล",
      "ค. ไม่เกิน 200 ไมล์ทะเล",
      "ง. ไม่จำกัดระยะทางขึ้นอยู่กับกองทัพเรือ"
    ],
    answer: 0,
    explanation: "ทะเลอาณาเขต (Territorial Sea) ตามอนุสัญญากฎหมายทะเล (UNCLOS) มีความกว้างไม่เกิน 12 ไมล์ทะเลนับจากเส้นฐาน โดยรัฐชายฝั่งมีอธิปไตยสมบูรณ์เหนือน่านน้ำและห้วงอากาศ"
  },
  {
    question: "เขตต่อเนื่อง (Contiguous Zone) มีระยะกว้างไม่เกินเท่าใดนับจากเส้นฐาน?",
    choices: [
      "ก. ไม่เกิน 12 ไมล์ทะเล",
      "ข. ไม่เกิน 24 ไมล์ทะเล",
      "ค. ไม่เกิน 200 ไมล์ทะเล",
      "ง. ไม่เกิน 350 ไมล์ทะเล"
    ],
    answer: 1,
    explanation: "เขตต่อเนื่อง (Contiguous Zone) มีขอบเขตกว้างไม่เกิน 24 ไมล์ทะเลนับจากเส้นฐาน (หรือเพิ่มอีก 12 ไมล์ทะเลถัดจากทะเลอาณาเขต) รัฐมีอำนาจตรวจศุลกากร คนเข้าเมือง สุขาภิบาล และภาษี"
  },
  {
    question: "ข้อใดคือสิทธิของรัฐชายฝั่งใน เขตเศรษฐกิจจำเพาะ (EEZ) ที่กว้าง 200 ไมล์ทะเล?",
    choices: [
      "ก. มีสิทธิ์อธิปไตยเหนือห้วงอากาศโดยสมบูรณ์ ห้ามรัฐอื่นบินผ่าน",
      "ข. มีสิทธิอธิปไตยในการสำรวจ อนุรักษ์ และจัดการทรัพยากรธรรมชาติทั้งในน้ำและใต้พื้นดิน",
      "ค. มีสิทธิ์ห้ามไม่ให้เรือของรัฐอื่นแล่นผ่านโดยเด็ดขาด",
      "ง. มีอำนาจจับกุมคดีอาญาทั่วไปของรัฐอื่นได้ทั้งหมดเสมือนเป็นดินแดนของตนเอง"
    ],
    answer: 1,
    explanation: "เขตเศรษฐกิจจำเพาะ (EEZ) กว้างไม่เกิน 200 ไมล์ทะเล รัฐไม่มีสิทธิ์อธิปไตยเหนือห้วงอากาศ แต่มีสิทธิอธิปไตยในการสำรวจและจัดการทรัพยากรธรรมชาติในทะเลและใต้ดินทะเลเท่านั้น"
  },
  {
    question: "ตราสามดวงที่ใช้ประทับบนกฎหมายตราสามดวงชำระใหม่ในสมัยรัชกาลที่ 1 ประกอบด้วยตราใดบ้าง?",
    choices: [
      "ก. ตราพระคชสีห์, ตราหนุมาน, ตราบัวแก้ว",
      "ข. ตราพระราชสีห์, ตราพระคชสีห์, ตราบัวแก้ว",
      "ค. ตราจักร, ตราตรี, ตราพระมหาพิชัยมงกุฎ",
      "ง. ตรากริช, ตราดาบ, ตราโล่"
    ],
    answer: 1,
    explanation: "กฎหมายตราสามดวงชำระในสมัยรัชกาลที่ 1 ประทับตราสำคัญ 3 ดวง ได้แก่ ตราพระราชสีห์ (มหาดไทย), ตราพระคชสีห์ (กลาโหม), และตราบัวแก้ว (คลัง/ต่างประเทศ)"
  },
  {
    question: "ประมวลกฎหมายลักษณะอาญา ร.ศ. 127 ตราขึ้นในรัชสมัยใด และมีส่วนสำคัญอย่างไร?",
    choices: [
      "ก. ตราขึ้นในสมัยรัชกาลที่ 1 เพื่อปราบกบฏ",
      "ข. ตราขึ้นในสมัยรัชกาลที่ 5 เป็นประมวลกฎหมายฉบับแรกตามแบบสากลและช่วยยกเลิกสิทธิสภาพนอกอาณาเขต",
      "ค. ตราขึ้นในสมัยรัชกาลที่ 9 เพื่อปรับปรุงระบบตำรวจ",
      "ง. ตราขึ้นในสมัยรัชกาลที่ 7 หลังการเปลี่ยนแปลงการปกครอง"
    ],
    answer: 1,
    explanation: "ประมวลกฎหมายลักษณะอาญา ร.ศ. 127 ตราขึ้นในปี พ.ศ. 2508 สมัยรัชกาลที่ 5 เป็นประมวลกฎหมายฉบับแรกของไทยที่ทำตามสากล เพื่อนำไปสู่การยกเลิกสิทธิสภาพนอกอาณาเขตของมหาอำนาจตะวันตก"
  },
  {
    question: "รัฐธรรมนูญแห่งราชอาณาจักรไทย พ.ศ. 2560 มีจำนวนกี่หมวด กี่มาตรา และเป็นฉบับที่เท่าใด?",
    choices: [
      "ก. 15 หมวด 200 มาตรา เป็นฉบับที่ 16",
      "ข. 16 หมวด 279 มาตรา เป็นฉบับที่ 20",
      "ค. 20 หมวด 300 มาตรา เป็นฉบับที่ 19",
      "ง. 10 หมวด 150 มาตรา เป็นฉบับที่ 12"
    ],
    answer: 1,
    explanation: "รัฐธรรมนูญแห่งราชอาณาจักรไทย พ.ศ. 2560 ได้รับฉายาว่า 'ฉบับปราบโกง' เป็นรัฐธรรมนูญฉบับที่ 20 มีโครงสร้างหลักประกอบด้วย 16 หมวด และมีมาตรารวมทั้งสิ้น 279 มาตรา"
  },
  {
    question: "ตามรัฐธรรมนูญ พ.ศ. 2560 สภาผู้แทนราษฎร (ส.ส.) ประกอบด้วยสมาชิกกี่คน และมีวาระกี่ปี?",
    choices: [
      "ก. 500 คน วาระ 4 ปี (แบ่งเขต 400 คน + บัญชีรายชื่อ 100 คน)",
      "ข. 200 คน วาระ 5 ปี มาจากการสรรหาทั้งหมด",
      "ค. 350 คน วาระ 4 ปี มาจากการเลือกตั้งแบบสัดส่วน",
      "ง. 700 คน วาระ 4 ปี มาจากการแบ่งเขตทั้งหมด"
    ],
    answer: 0,
    explanation: "สภาผู้แทนราษฎร (ส.ส.) มีจำนวนสมาชิก 500 คน ดำรงตำแหน่งวาระละ 4 ปี มาจากการเลือกตั้งแบบแบ่งเขตเลือกตั้ง 400 คน และแบบบัญชีรายชื่อของพรรคการเมืองอีก 100 คน"
  },
  {
    question: "คุณสมบัติเบื้องต้นของผู้สมัครสมาชิกวุฒิสภา (ส.ว.) ตามระบบปกติของรัฐธรรมนูญ 2560 คืออะไร?",
    choices: [
      "ก. อายุไม่ต่ำกว่า 25 ปีบริบูรณ์",
      "ข. อายุไม่ต่ำกว่า 40 ปีบริบูรณ์ และมีประสบการณ์ทำงานในกลุ่มวิชาชีพไม่น้อยกว่า 10 ปี",
      "ค. ต้องเคยดำรงตำแหน่ง ส.ส. มาก่อนอย่างน้อย 1 สมัย",
      "ง. ต้องสำเร็จการศึกษาระดับปริญญาโทขึ้นไป"
    ],
    answer: 1,
    explanation: "ผู้สมัครสมาชิกวุฒิสภา (ส.ว.) ตามรัฐธรรมนูญ 2560 ต้องมีอายุไม่ต่ำกว่า 40 ปีบริบูรณ์ มีความรู้ ความเชี่ยวชาญ หรือประสบการณ์ในกลุ่มวิชาชีพที่สมัครไม่น้อยกว่า 10 ปี"
  },
  {
    question: "ตุลาการศาลรัฐธรรมนูญมีจำนวนกี่คน และมีวาระการดำรงตำแหน่งกี่ปี?",
    choices: [
      "ก. 9 คน วาระ 7 ปี ดำรงตำแหน่งได้วาระเดียว",
      "ข. 15 คน วาระ 9 ปี ดำรงตำแหน่งได้สองวาระ",
      "ค. 7 คน วาระ 5 ปี ดำรงตำแหน่งได้จนถึงอายุ 70 ปี",
      "ง. 11 คน วาระ 6 ปี ดำรงตำแหน่งได้วาระเดียว"
    ],
    answer: 0,
    explanation: "ศาลรัฐธรรมนูญประกอบด้วยตุลาการศาลรัฐธรรมนูญจำนวน 9 คน ดำรงตำแหน่งวาระละ 7 ปีนับแต่วันที่พระมหากษัตริย์ทรงแต่งตั้ง และให้ดำรงตำแหน่งได้เพียงวาระเดียว"
  },
  {
    question: "ศาลปกครองของประเทศไทยมีโครงสร้างกี่ชั้น และพิจารณาคดีประเภทใด?",
    choices: [
      "ก. มี 3 ชั้น (ต้น อุทธรณ์ ฎีกา) พิจารณาคดีแพ่งทั่วไป",
      "ข. มี 2 ชั้น (ชั้นต้น และสูงสุด) พิจารณาคดีพิพาทระหว่างหน่วยงานรัฐ/เจ้าหน้าที่รัฐ กับเอกชนหรือหน่วยงานรัฐด้วยกัน",
      "ค. มีชั้นเดียว พิจารณาคดีวินิจฉัยรัฐธรรมนูญ",
      "ง. มี 2 ชั้น พิจารณาคดีอาญาของข้าราชการทหาร"
    ],
    answer: 1,
    explanation: "ศาลปกครองมีระบบศาล 2 ชั้น คือ ศาลปกครองชั้นต้น และศาลปกครองสูงสุด ทำหน้าที่พิจารณาคดีพิพาททางปกครองที่เป็นการใช้อำนาจของรัฐหรือหน่วยงานรัฐกับประชาชน"
  },
  {
    question: "การกระทำในข้อใดจัดเป็น คำสั่งทางปกครอง?",
    choices: [
      "ก. การประกาศใช้พระราชกฤษฎีกายุบสภา",
      "ข. คำสั่งลงโทษวินัยข้าราชการ หรือการสั่งไม่อนุมัติใบอนุญาตมีอาวุธปืนเฉพาะบุคคล",
      "ค. การเซ็นสัญญาซื้อขายกระดาษของที่ทำการอำเภอ",
      "ง. การรื้อถอนอาคารที่กีดขวางทางน้ำไหลตามข้อเท็จจริงโดยไม่มีคำสั่งใดๆ"
    ],
    answer: 1,
    explanation: "คำสั่งทางปกครองเป็นการใช้อำนาจตามกฎหมายของเจ้าหน้าที่ที่มีผลบังคับเฉพาะเจาะจงบุคคลในเรื่องใดเรื่องหนึ่ง เช่น การอนุญาต การอนุมัติ การสั่งการ หรือคำสั่งลงโทษทางวินัย"
  },
  {
    question: "ตามประมวลกฎหมายแพ่งและพาณิชย์ มาตรา 15 สภาพบุคคลเริ่มต้นเมื่อใด?",
    choices: [
      "ก. เมื่ออยู่ในครรภ์มารดาครบ 9 เดือน",
      "ข. เมื่อคลอดและอยู่รอดเป็นทารก (พ้นจากครรภ์มารดาทั้งตัวและหายใจได้)",
      "ค. เมื่อบิดามารดาจดทะเบียนแจ้งเกิด ณ ที่ว่าการอำเภอ",
      "ง. เมื่อแพทย์ตัดสายสะดือเด็กทารกเรียบร้อยแล้ว"
    ],
    answer: 1,
    explanation: "สภาพบุคคลตามกฎหมายแพ่งมาตรา 15 เริ่มต้นเมื่อคลอดและอยู่รอดเป็นทารก (พ้นจากครรภ์โดยสิ้นเชิงและหายใจเองได้ แม้สายสะดือจะยังไม่ตัดก็ตาม) และสิ้นสุดลงเมื่อตาย"
  },
  {
    question: "บุคคลจะพ้นจากภาวะผู้เยาว์และบรรลุนิติภาวะได้เมื่อใด?",
    choices: [
      "ก. เมื่ออายุครบ 18 ปีบริบูรณ์",
      "ข. เมื่ออายุครบ 20 ปีบริบูรณ์ หรือจดทะเบียนสมรสโดยชอบด้วยกฎหมาย (อายุไม่ต่ำกว่า 17 ปีหรือตามศาลอนุญาต)",
      "ค. เมื่อสำเร็จการศึกษาระดับชั้นมัธยมศึกษาปีที่ 6",
      "ง. เมื่อเริ่มทำงานและมีรายได้เป็นของตัวเอง"
    ],
    answer: 1,
    explanation: "บุคคลบรรลุนิติภาวะพ้นจากภาวะผู้เยาว์ได้ 2 ทาง คือ 1. เมื่ออายุครบ 20 ปีบริบูรณ์ หรือ 2. การจดทะเบียนสมรสที่ถูกต้องตามกฎหมาย (อายุ 17 ปีขึ้นไปและผู้ปกครองยินยอม หรือตามที่ศาลอนุญาต)"
  },
  {
    question: "นิติกรรมที่ทำโดย คนไร้ความสามารถ (วิกลจริตเป็นประจำที่ศาลสั่ง) จะมีผลอย่างไรทางกฎหมาย?",
    choices: [
      "ก. ตกเป็นโมฆียะ สามารถบอกล้างได้ภายหลัง",
      "ข. ตกเป็นโมฆะ (เสียเปล่าไม่มีผลผูกพันตั้งแต่ต้น) และต้องมีผู้อนุบาลทำแทน",
      "ค. มีผลสมบูรณ์ทุกประการหากผู้อนุบาลให้สัตยาบันล่วงหน้าทางวาจา",
      "ง. มีผลสมบูรณ์ตราบใดที่คนไร้ความสามารถทำขึ้นในขณะที่ไม่มีอาการหลอน"
    ],
    answer: 1,
    explanation: "คนไร้ความสามารถไม่สามารถทำนิติกรรมใดๆ ได้เอง นิติกรรมที่ทำจะตกเป็นโมฆะ (เสียเปล่าทางกฎหมาย) ทั้งสิ้น โดยต้องให้ผู้อนุบาล (Guardian) เป็นผู้ดำเนินการแทนเท่านั้น"
  },
  {
    question: "คนเสมือนไร้ความสามารถ แตกต่างจากคนไร้ความสามารถในเรื่องการทำนิติกรรมอย่างไร?",
    choices: [
      "ก. คนเสมือนฯ ต้องมีผู้อนุบาลทำแทนทุกอย่าง ส่วนคนไร้ความสามารถมีผู้พิทักษ์",
      "ข. คนเสมือนฯ ยังสามารถทำนิติกรรมทั่วไปได้เอง ยกเว้นนิติกรรมสำคัญบางอย่างที่กฎหมายกำหนดต้องได้รับความยินยอมจากผู้พิทักษ์",
      "ค. นิติกรรมของคนเสมือนฯ ตกเป็นโมฆะทั้งหมดเหมือนคนไร้ความสามารถ",
      "ง. คนเสมือนฯ ทำนิติกรรมทุกอย่างได้เองตามกฎหมายโดยไม่ต้องมีผู้ดูแล"
    ],
    answer: 1,
    explanation: "คนเสมือนไร้ความสามารถยังมีความสามารถในการทำนิติกรรมทั่วไปได้ด้วยตนเอง ยกเว้นนิติกรรมสำคัญที่ส่งผลต่อทรัพย์สินมากๆ (เช่น กู้เงิน ค้ำประกัน โอนขายที่ดิน) ซึ่งต้องได้รับความยินยอมจากผู้พิทักษ์ (Custodian)"
  },
  {
    question: "ข้อใดจัดเป็น อสังหาริมทรัพย์ ตามประมวลกฎหมายแพ่งและพาณิชย์?",
    choices: [
      "ก. ที่ดิน, บ้านเรือน, สะพาน, ต้นไม้ยืนต้น",
      "ข. รถยนต์, ทองคำแท่ง, สิทธิในสิทธิบัตร",
      "ค. สัตว์พาหนะ (ช้าง ม้า โค กระบือ), แพอยู่อาศัย",
      "ง. ข้าวโพดและมันสำปะหลังที่ยังเก็บเกี่ยวไม่หมด"
    ],
    answer: 0,
    explanation: "อสังหาริมทรัพย์คือที่ดินและทรัพย์สินที่ติดตรึงอยู่กับที่ดินมีลักษณะเป็นการถาวร เช่น อาคาร บ้านเรือน สะพาน หรือต้นไม้ยืนต้นที่มีอายุเกิน 3 ปีขึ้นไป"
  },
  {
    question: "ข้อใดจัดเป็น สังหาริมทรัพย์ ตามกฎหมาย?",
    choices: [
      "ก. โฉนดที่ดินและสิทธิเก็บกินบนที่ดิน",
      "ข. ทองคำ, โทรศัพท์มือถือ, รถยนต์, กระแสไฟฟ้า, ลิขสิทธิ์",
      "ค. บ้านตึกแถวสามชั้น",
      "ง. สะพานลอยคนข้ามถนน"
    ],
    answer: 1,
    explanation: "สังหาริมทรัพย์คือทรัพย์สินที่สามารถเคลื่อนย้ายหรือขนส่งไปมาได้ รวมถึงสิทธิในสังหาริมทรัพย์ และกระแสพลังงานธรรมชาติต่างๆ เช่น กระแสไฟฟ้าด้วย"
  },
  {
    question: "สังหาริมทรัพย์พิเศษในข้อใดที่โอนกรรมสิทธิ์ต้องจดทะเบียนต่อพนักงานเจ้าหน้าที่คล้ายอสังหาริมทรัพย์?",
    choices: [
      "ก. รถยนต์หรู, รถจักรยานยนต์บิ๊กไบค์, เครื่องบินเจ็ต",
      "ข. เรือมีระวางตั้งแต่ 5 ตันขึ้นไป, แพอยู่อาศัย, สัตว์พาหนะ (ช้าง ม้า โค กระบือ ล่อ ลา)",
      "ค. ปืนเถื่อน, สุนัขราคาแพง, พระเครื่องโบราณ",
      "ง. บ้านทาวน์เฮ้าส์, ที่ดินสวนปาล์ม"
    ],
    answer: 1,
    explanation: "สังหาริมทรัพย์พิเศษตาม ป.พ.พ. ประกอบด้วย 3 ประเภทหลัก คือ 1. เรือมีระวางตั้งแต่ 5 ตันขึ้นไป 2. แพสำหรับอยู่อาศัย และ 3. สัตว์พาหนะที่เป็นช้าง ม้า โค กระบือ ล่อ ลา เท่านั้น"
  },
  {
    question: "การครอบครองปรปักษ์เพื่อให้ได้กรรมสิทธิ์ใน อสังหาริมทรัพย์ ต้องครอบครองอย่างสงบ เปิดเผย และเจตนาเป็นเจ้าของติดต่อกันเป็นเวลากี่ปี?",
    choices: [
      "ก. 5 ปี",
      "ข. 10 ปี",
      "ค. 15 ปี",
      "ง. 20 ปี"
    ],
    answer: 1,
    explanation: "การครอบครองปรปักษ์เพื่อให้ได้กรรมสิทธิ์ในทรัพย์สินผู้อื่น กำหนดเวลาสะสมกรรมสิทธิ์คือ 10 ปีสำหรับอสังหาริมทรัพย์ และ 5 ปีสำหรับสังหาริมทรัพย์ทั่วไป"
  },
  {
    question: "ตามมาตรา 149 การใดที่จัดเป็น นิติกรรม ที่ชอบด้วยกฎหมาย?",
    choices: [
      "ก. การพูดชวนเพื่อนไปดูภาพยนตร์",
      "ข. การทำสัญญาซื้อขายบ้านและที่ดินด้วยความสมัครใจและทำตามแบบที่กฎหมายกำหนด",
      "ค. การตกลงว่าจ้างขนยาเสพติดข้ามจังหวัด",
      "ง. การขับรถชนคนเดินถนนโดยไม่เจตนา"
    ],
    answer: 1,
    explanation: "นิติกรรมคือการกระทำที่ชอบด้วยกฎหมายและสมัครใจ เพื่อสร้างความผูกพันทางกฎหมายระหว่างบุคคลในการจัดตั้งหรือโอนสิทธิ การซื้อขายที่ดินจึงจัดเป็นนิติกรรมสมบูรณ์"
  },
  {
    question: "ข้อใดเป็นผลของนิติกรรมที่เป็น โมฆะ (Void)?",
    choices: [
      "ก. มีผลสมบูรณ์จนกว่าจะมีผู้บอกล้าง",
      "ข. เสียเปล่าและไม่มีผลผูกพันทางกฎหมายมาตั้งแต่เริ่มต้น เสมือนไม่เคยมีนิติกรรมนั้นเกิดขึ้นเลย",
      "ค. สามารถให้สัตยาบันเพื่อให้กลับมาสมบูรณ์ได้",
      "ง. ผู้มีส่วนได้เสียฟ้องร้องขอให้มีผลผูกพันย้อนหลังได้"
    ],
    answer: 1,
    explanation: "โมฆะคือเสียเปล่าตั้งแต่ต้นทางกฎหมาย ไม่มีผลให้เกิดสิทธิหรือหน้าที่ใดๆ เลย และไม่สามารถรับรองหรือให้สัตยาบันภายหลังให้กลับมามีผลได้"
  },
  {
    question: "ข้อใดไม่ใช่สาเหตุที่ทำให้หนี้ระงับลงตามกฎหมาย?",
    choices: [
      "ก. การชำระหนี้, การปลดหนี้",
      "ข. การหักกลบลบหนี้, การแปลงหนี้ใหม่, หนี้เกลื่อนกลืนกัน",
      "ค. หนี้ขาดอายุความฟ้องร้อง",
      "ง. ลูกหนี้นำเงินมาชำระครบถ้วน"
    ],
    answer: 2,
    explanation: "หนี้ขาดอายุความฟ้องร้องไม่ได้ทำให้หนี้ระงับลง หนี้ยังมีอยู่ตามกฎหมาย แต่กฎหมายเพียงแค่ตัดสิทธิของเจ้าหนี้ในการฟ้องคดีผ่านศาลเพื่อบังคับชำระหนี้เท่านั้น"
  },
  {
    question: "ทรัพย์สินใดต่อไปนี้จัดเป็น สินสมรส?",
    choices: [
      "ก. เงินเดือนที่สามีได้รับมาระหว่างจดทะเบียนสมรส และดอกผลจากเงินฝากสินส่วนตัวของภรรยาที่ได้มาระหว่างสมรส",
      "ข. แหวนหมั้นที่ภรรยาได้รับก่อนจดทะเบียนสมรส",
      "ค. บ้านมรดกตกทอดที่ภรรยาได้รับจากบิดาโดยพินัยกรรมระบุยกให้เป็นของภรรยาผู้เดียว",
      "ง. เครื่องมือแต่งผมสำหรับสามีใช้ทำกิน"
    ],
    answer: 0,
    explanation: "สินสมรสคือทรัพย์สินที่ได้มาระหว่างสมรส เช่น รายได้ เงินเดือน โบนัส รวมถึงดอกผลของสินส่วนตัว (เช่น เงินปันผลหรือดอกเบี้ยธนาคารของสินส่วนตัว) ที่เกิดขึ้นระหว่างสมรส"
  },
  {
    question: "ข้อใดจัดเป็น สินส่วนตัว ของสามีหรือภรรยา?",
    choices: [
      "ก. เงินโบนัสที่ภรรยาได้รับระหว่างสมรส",
      "ข. ของใช้สัญญาส่วนตัวตามควรแก่ฐานะ หรือทรัพย์สินที่ฝ่ายใดฝ่ายหนึ่งมีอยู่ก่อนสมรส",
      "ค. ดอกผลที่เกิดขึ้นจากที่ดินที่เป็นมรดกของสามีในระหว่างสมรส",
      "ง. รถยนต์ที่ซื้อร่วมกันหลังจดทะเบียนสมรส"
    ],
    answer: 1,
    explanation: "สินส่วนตัวคือทรัพย์สินที่มีอยู่ก่อนจดทะเบียนสมรส หรือของใช้ส่วนตัวที่จำเป็นแก่ร่างกาย เครื่องประดับสมควรแก่ฐานะ และเครื่องมือทำกินสำหรับประกอบวิชาชีพเฉพาะตน"
  },
  {
    question: "ทายาทโดยธรรมที่เป็นญาติสืบสายโลหิตตามกฎหมายแบ่งออกเป็นกี่ลำดับชั้น?",
    choices: [
      "ก. 3 ลำดับชั้น",
      "ข. 6 ลำดับชั้น",
      "ค. 5 ลำดับชั้น",
      "ง. 4 ลำดับชั้น"
    ],
    answer: 1,
    explanation: "ทายาทโดยธรรมสายโลหิตแบ่งออกเป็น 6 ลำดับ ได้แก่ 1. ผู้สืบสันดาน 2. บิดามารดา 3. พี่น้องร่วมบิดามารดา 4. พี่น้องร่วมบิดาหรือร่วมมารดา 5. ปู่ย่าตายาย 6. ลุงป้าน้าอา"
  },
  {
    question: "พินัยกรรมแบบเขียนเองทั้งฉบับ มีข้อกำหนดที่สำคัญอย่างไรเพื่อความสมบูรณ์?",
    choices: [
      "ก. ต้องทำต่อหน้านายอำเภอเท่านั้น",
      "ข. ต้องเขียนด้วยลายมือของตนเองทั้งหมด ลงวันเดือนปี และลงลายมือชื่อตนเอง (ไม่ต้องมีพยานก็ได้)",
      "ค. ต้องมีพยานรับรองอย่างน้อย 3 คนพร้อมกัน",
      "ง. ต้องพิมพ์ในกระดาษครุฑและให้นายทะเบียนลงลายมือชื่อกำกับ"
    ],
    answer: 1,
    explanation: "พินัยกรรมเขียนเองทั้งฉบับ ผู้ทำพินัยกรรมต้องเขียนข้อความ วันที่ และชื่อของตนด้วยลายมือตนเองทั้งฉบับ ห้ามใช้วิธีพิมพ์เด็ดขาด และกฎหมายอนุญาตให้ไม่ต้องมีพยานเซ็นรับรองก็มีผลสมบูรณ์"
  },
  {
    question: "โทษอาญาประเภทลหุโทษมีอัตราโทษสูงสุดอย่างไร?",
    choices: [
      "ก. จำคุกไม่เกิน 1 เดือน หรือปรับไม่เกิน 10,000 บาท หรือทั้งจำทั้งปรับ",
      "ข. จำคุกไม่เกิน 6 เดือน หรือปรับไม่เกิน 50,000 บาท",
      "ค. ปรับไม่เกิน 1,000 บาทเท่านั้น ไม่มีโทษจำคุก",
      "ง. จำคุกไม่เกิน 1 ปี หรือปรับไม่เกิน 100,000 บาท"
    ],
    answer: 0,
    explanation: "ความผิดลหุโทษคือความผิดอาญาประเภทลหันเบาสุดตาม ป.อ. มาตรา 102 มีเกณฑ์กำหนดโทษสูงสุดจำคุกไม่เกิน 1 เดือน หรือปรับไม่เกิน 10,000 บาท หรือทั้งจำทั้งปรับ"
  },
  {
    question: "ข้อใดคือการเรียงลำดับโทษทางอาญา 5 สถาน จากเบาไปหาหนักที่ถูกต้องที่สุด?",
    choices: [
      "ก. ปรับ, กักขัง, จำคุก, กักกัน, ประหารชีวิต",
      "ข. ริบทรัพย์สิน, ปรับ, กักขัง, จำคุก, ประหารชีวิต",
      "ค. ริบทรัพย์สิน, กักขัง, ปรับ, จำคุก, ประหารชีวิต",
      "ง. ปรับ, ริบทรัพย์สิน, จำคุก, กักขัง, ประหารชีวิต"
    ],
    answer: 1,
    explanation: "โทษทางอาญาของไทยเรียงลำดับความเบาไปหนักที่สุดตามมาตรา 18 ได้แก่ 1. ริบทรัพย์สิน 2. ปรับ 3. กักขัง (ควบคุมในสถานที่อื่น) 4. จำคุก และ 5. ประหารชีวิต"
  },
  {
    question: "นิติกรรมที่เป็น โมฆียะ จะมีผลสมบูรณ์อยู่จนกว่าจะถูกดำเนินการอย่างไร?",
    choices: [
      "ก. ถูกทำลายทันทีโดยเจ้าหน้าที่รัฐ",
      "ข. ถูกบอกล้างโดยผู้มีสิทธิตามกฎหมายภายในกำหนดระยะเวลา",
      "ค. มีคู่กรณีคนใดคนหนึ่งเสียชีวิต",
      "ง. ครบกำหนดเวลา 1 ปีนับจากทำสัญญาโดยไม่มีการให้สัตยาบัน"
    ],
    answer: 1,
    explanation: "โมฆียะกรรมจะมีผลสมบูรณ์ทางกฎหมายบังคับกันได้ทุกประการ จนกว่าจะมีการใช้สิทธิ์บอกล้างโดยบุคคลที่มีสิทธิ์บอกล้างตามกฎหมาย (เช่น ผู้ปกครองของผู้เยาว์) ทำให้สัญญานั้นกลายเป็นโมฆะย้อนหลังไปตั้งแต่เริ่มต้น"
  }
];

async function seed() {
  console.log('--- STARTING LAW QUESTIONS SEEDING ---');
  try {
    // 1. Find creator admin user
    let admin = await prisma.user.findFirst({ where: { role: 'OWNER' } }) || 
                  await prisma.user.findFirst({ where: { role: 'ADMIN' } }) ||
                  await prisma.user.findFirst();
    const creatorId = admin ? admin.id : 1;
    console.log(`Using creator ID: ${creatorId} (${admin ? admin.username : 'Default'})`);

    // 2. Clean up any existing law category exam set
    console.log('Cleaning up existing Law exam sets...');
    await prisma.examSet.deleteMany({
      where: { category: 'law' }
    });

    // 3. Create a brand new Law exam set containing all 40 questions
    console.log(`Creating exam set: "กฎหมายเบื้องต้น ชุดที่ 1" with ${lawQuestions.length} questions...`);
    const newSet = await prisma.examSet.create({
      data: {
        title: "กฎหมายเบื้องต้น ชุดที่ 1",
        category: "law",
        subcategory: "กฎหมายเบื้องต้น",
        totalCount: lawQuestions.length,
        createdById: creatorId,
        questions: {
          create: lawQuestions.map((q, idx) => ({
            questionText: q.question,
            choice1: q.choices[0],
            choice2: q.choices[1],
            choice3: q.choices[2],
            choice4: q.choices[3],
            correctAnswer: q.answer,
            explanation: q.explanation,
            sortOrder: idx
          }))
        }
      }
    });

    console.log(`✅ SUCCESSFULLY SEEDED EXAM SET ID: ${newSet.id} WITH ${lawQuestions.length} QUESTIONS!`);
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

\\n
## File: server\seed-questions.js

\\nimport { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const defaultQuestions = [
  // 1. ความรู้ความสามารถทั่วไป (general)
  {
    category: 'general',
    title: 'ความรู้ความสามารถทั่วไป ชุดที่ 1',
    questions: [
      {
        questionText: 'ถ้า A > B และ B = C ข้อใดถูกต้องที่สุด?',
        choice1: 'A = C',
        choice2: 'A > C',
        choice3: 'A < C',
        choice4: 'สรุปไม่ได้',
        correctAnswer: 1
      },
      {
        questionText: 'ผลรวมของเลขจำนวนเต็มตั้งแต่ 1 ถึง 100 เท่ากับเท่าใด?',
        choice1: '5050',
        choice2: '5000',
        choice3: '5100',
        choice4: '4950',
        correctAnswer: 0
      },
      {
        questionText: 'นายดำอายุมากกว่านายแดง 5 ปี อีก 3 ปีข้างหน้าผลรวมอายุทั้งสองคนเป็น 45 ปี ปัจจุบันนายแดงอายุเท่าใด?',
        choice1: '17 ปี',
        choice2: '22 ปี',
        choice3: '15 ปี',
        choice4: '20 ปี',
        correctAnswer: 0
      }
    ]
  },
  // 2. ภาษาไทย (thai)
  {
    category: 'thai',
    title: 'ภาษาไทย ชุดที่ 1',
    questions: [
      {
        questionText: 'ข้อใดเขียนตัวสะกดการันต์ได้ถูกต้องทุกคำ?',
        choice1: 'อนุญาต, ปรากฏ, สังเกต',
        choice2: 'อนุญาติ, ปรากฎ, สังเกตุ',
        choice3: 'อนุญาต, ปรากฎ, สังเกตุ',
        choice4: 'อนุญาติ, ปรากฏ, สังเกต',
        correctAnswer: 0
      },
      {
        questionText: 'คำในข้อใดใช้ลักษณนามว่า "เล่ม" ทุกคำ?',
        choice1: 'หนังสือ, สมุด, ดาบ, เข็ม',
        choice2: 'หนังสือ, ดินสอ, เกวียน, ร่ม',
        choice3: 'ตะปู, ดาบ, เลื่อย, เทียน',
        choice4: 'สมุด, ไม้บรรทัด, ปากกา, ปืน',
        correctAnswer: 0
      },
      {
        questionText: 'สำนวนในข้อใดมีความหมายตรงกับคำว่า "ทำอะไรย่อมได้รับผลเช่นนั้น"?',
        choice1: 'หว่านพืชเช่นไร ย่อมได้ผลเช่นนั้น',
        choice2: 'กงเกวียนกำเกวียน',
        choice3: 'ทำดีได้ดี ทำชั่วได้ชั่ว',
        choice4: 'ปลูกบ้านตามใจผู้อยู่',
        correctAnswer: 0
      }
    ]
  },
  // 3. ภาษาอังกฤษ (english)
  {
    category: 'english',
    title: 'ภาษาอังกฤษ ชุดที่ 1',
    questions: [
      {
        questionText: 'Choose the correct word: The police officer asked the driver to ______ his driver\'s license.',
        choice1: 'show',
        choice2: 'showing',
        choice3: 'shown',
        choice4: 'shows',
        correctAnswer: 0
      },
      {
        questionText: 'Which sentence is grammatically correct?',
        choice1: 'He don\'t like coffee.',
        choice2: 'She doesn\'t likes coffee.',
        choice3: 'They doesn\'t like coffee.',
        choice4: 'He doesn\'t like coffee.',
        correctAnswer: 3
      },
      {
        questionText: 'The synonym of the word "ASSIST" is ______.',
        choice1: 'hinder',
        choice2: 'help',
        choice3: 'ignore',
        choice4: 'prevent',
        correctAnswer: 1
      }
    ]
  },
  // 4. คอมพิวเตอร์และเทคโนโลยี (computer)
  {
    category: 'computer',
    title: 'เทคโนโลยีสารสนเทศ ชุดที่ 1',
    questions: [
      {
        questionText: 'ปุ่มคีย์ลัดใดใช้ในการคัดลอก (Copy) ข้อความหรือไฟล์ในระบบปฏิบัติการ Windows?',
        choice1: 'Ctrl + X',
        choice2: 'Ctrl + C',
        choice3: 'Ctrl + V',
        choice4: 'Ctrl + Z',
        correctAnswer: 1
      },
      {
        questionText: 'ข้อใดคือหน่วยความจำหลักของคอมพิวเตอร์ที่ข้อมูลจะหายไปเมื่อปิดเครื่อง?',
        choice1: 'ROM',
        choice2: 'Hard Disk',
        choice3: 'RAM',
        choice4: 'Flash Drive',
        correctAnswer: 2
      },
      {
        questionText: 'โปรโตคอลใดใช้ในการส่งและรับข้อมูลหน้าเว็บไซต์ทั่วไปอย่างปลอดภัย?',
        choice1: 'HTTP',
        choice2: 'FTP',
        choice3: 'HTTPS',
        choice4: 'SMTP',
        correctAnswer: 2
      }
    ]
  },
  // 5. สังคม วัฒนธรรม จริยธรรม และประชาคมอาเซียน (social)
  {
    category: 'social',
    title: 'สังคมและวัฒนธรรม ชุดที่ 1',
    questions: [
      {
        questionText: 'ประเทศใดไม่ได้อยู่ในผู้ก่อตั้งสมาคมประชาชาติแห่งเอเชันตะวันออกเฉียงใต้ (ASEAN) ในปี พ.ศ. 2510?',
        choice1: 'ไทย',
        choice2: 'อินโดนีเซีย',
        choice3: 'เวียดนาม',
        choice4: 'ฟิลิปปินส์',
        correctAnswer: 2
      },
      {
        questionText: 'วันสำคัญทางพระพุทธศาสนาวันใดที่มีเหตุการณ์สำคัญคือ พระสงฆ์ 1,250 รูปมาประชุมกันโดยมิได้นัดหมาย?',
        choice1: 'วันมาฆบูชา',
        choice2: 'วันวิสาขบูชา',
        choice3: 'วันอาสาฬหบูชา',
        choice4: 'วันอัฐมีบูชา',
        correctAnswer: 0
      },
      {
        questionText: 'ข้อใดคือเป้าหมายหลักของการพัฒนาที่ยั่งยืน (SDGs) ขององค์การสหประชาชาติ?',
        choice1: 'การพัฒนาด้านอุตสาหกรรมหนักเท่านั้น',
        choice2: 'การพัฒนาเศรษฐกิจ สังคม และสิ่งแวดล้อมอย่างสมดุล',
        choice3: 'การเพิ่มจีดีพีของประเทศกำลังพัฒนาเป็นสองเท่า',
        choice4: 'การเน้นใช้ทรัพยากรธรรมชาติให้หมดไปโดยเร็ว',
        correctAnswer: 1
      }
    ]
  },
  // 6. งานสารบรรณ (secretariat)
  {
    category: 'secretariat',
    title: 'งานสารบรรณ ชุดที่ 1',
    questions: [
      {
        questionText: 'ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ หนังสือประทับตราใช้กระดาษชนิดใดและประทับตราแทนการลงชื่อของใคร?',
        choice1: 'กระดาษตราครุฑ / หัวหน้าส่วนราชการระดับกองขึ้นไป',
        choice2: 'กระดาษบันทึกข้อความ / หัวหน้าส่วนราชการระดับแผนก',
        choice3: 'กระดาษธรรมดา / เจ้าหน้าที่ผู้รับผิดชอบ',
        choice4: 'กระดาษตราครุฑ / เจ้าหน้าที่ระดับปฏิบัติการ',
        correctAnswer: 0
      },
      {
        questionText: 'หนังสือราชการภายนอก ใช้กระดาษตราครุฑและเป็นหนังสือติดต่อระหว่างส่วนราชการกับข้อใด?',
        choice1: 'ระหว่างส่วนราชการด้วยกัน หรือ ส่วนราชการกับหน่วยงานภายนอก/บุคคลภายนอก',
        choice2: 'ภายในหน่วยงานระดับกองเดียวกันเท่านั้น',
        choice3: 'เฉพาะติดต่อกับบริษัทเอกชนต่างประเทศ',
        choice4: 'ใช้ส่งถึงนายกรัฐมนตรีโดยเฉพาะเท่านั้น',
        correctAnswer: 0
      },
      {
        questionText: 'หนังสือราชการมีกี่ชนิด ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526?',
        choice1: '4 ชนิด',
        choice2: '5 ชนิด',
        choice3: '6 ชนิด',
        choice4: '7 ชนิด',
        correctAnswer: 2
      }
    ]
  },
  // 7. กฎหมายเบื้องต้น (law)
  {
    category: 'law',
    title: 'กฎหมายเบื้องต้น ชุดที่ 1',
    questions: [
      {
        questionText: 'กฎหมายสูงสุดในการปกครองประเทศไทยคืออะไร?',
        choice1: 'ประมวลกฎหมายอาญา',
        choice2: 'รัฐธรรมนูญแห่งราชอาณาจักรไทย',
        choice3: 'พระราชบัญญัติตำรวจแห่งชาติ',
        choice4: 'ประมวลกฎหมายแพ่งและพาณิชย์',
        correctAnswer: 1
      },
      {
        questionText: 'การกระทำในข้อใดที่กฎหมายบัญญัติว่าเป็นความผิดทางอาญาและต้องได้รับโทษ?',
        choice1: 'การกู้ยืมเงินแล้วไม่ชำระคืนตามกำหนด',
        choice2: 'การลักทรัพย์ผู้อื่นโดยเจตนา',
        choice3: 'การผิดสัญญาซื้อขายที่ดิน',
        choice4: 'การจอดรถในที่ห้ามจอดโดยไม่มีป้ายเตือน',
        correctAnswer: 1
      },
      {
        questionText: 'ผู้ใดกระทำความผิดอาญาขณะอายุไม่เกินกี่ปี กฎหมายยกเว้นโทษให้ตามประมวลกฎหมายอาญาปัจจุบัน (แก้ไขเพิ่มเติมล่าสุด)?',
        choice1: 'ไม่เกิน 10 ปี',
        choice2: 'ไม่เกิน 12 ปี',
        choice3: 'ไม่เกิน 15 ปี',
        choice4: 'ไม่เกิน 18 ปี',
        correctAnswer: 1
      }
    ]
  }
];

async function seed() {
  try {
    console.log('Starting custom questions seeding...');

    // Find any admin/owner user or just the first user to set as creator
    let admin = await prisma.user.findFirst({ where: { role: { in: ['ADMIN', 'OWNER'] } } });
    if (!admin) {
      admin = await prisma.user.findFirst();
    }
    const creatorId = admin ? admin.id : 1;

    for (const group of defaultQuestions) {
      // Check if this exam set already exists
      let examSet = await prisma.examSet.findFirst({
        where: { title: group.title, category: group.category }
      });

      if (!examSet) {
        examSet = await prisma.examSet.create({
          data: {
            title: group.title,
            category: group.category,
            subcategory: 'ทั่วไป',
            totalCount: group.questions.length,
            createdById: creatorId,
            questions: {
              create: group.questions.map((q, idx) => ({
                questionText: q.questionText,
                choice1: q.choice1,
                choice2: q.choice2,
                choice3: q.choice3,
                choice4: q.choice4,
                correctAnswer: q.correctAnswer,
                sortOrder: idx
              }))
            }
          }
        });
        console.log(`Created exam set "${group.title}" with ${group.questions.length} questions.`);
      } else {
        console.log(`Exam set "${group.title}" already exists, skipping.`);
      }
    }

    console.log('Seeding finished successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

\\n
## File: server\set-admin.js

\\nimport { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const username = process.argv[2];

if (!username) {
  console.log('กรุณาระบุ username เช่น: node set-admin.js myusername');
  process.exit(1);
}

async function main() {
  try {
    const user = await prisma.user.update({
      where: { username: username },
      data: { role: 'ADMIN' },
    });
    console.log(`อัปเดตผู้ใช้ ${user.username} เป็นบทบาท ADMIN เรียบร้อยแล้ว!`);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปเดต:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

\\n
## File: server\update_admin.js

\\nimport { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const targetUsername = 'MIN2909';
  const targetPassword = 'min0123';
  const targetEmail = 'min2909@example.com';

  console.log(`Starting admin user recreation for: ${targetUsername}...`);

  try {
    // 1. Delete if exists
    const existing = await prisma.user.findUnique({
      where: { username: targetUsername }
    });

    if (existing) {
      console.log(`Found existing user ${targetUsername}. Deleting...`);
      await prisma.user.delete({
        where: { id: existing.id }
      });
      console.log('Existing user deleted successfully.');
    }

    // Also delete by email if exists (to prevent unique constraint error)
    const existingEmail = await prisma.user.findUnique({
      where: { email: targetEmail }
    });

    if (existingEmail) {
      console.log(`Found existing user with email ${targetEmail}. Deleting...`);
      await prisma.user.delete({
        where: { id: existingEmail.id }
      });
      console.log('Existing email user deleted successfully.');
    }

    // 2. Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(targetPassword, salt);

    // 3. Create new user
    const newUser = await prisma.user.create({
      data: {
        username: targetUsername,
        email: targetEmail,
        password: hashedPassword,
        fullName: 'Admin Min',
        role: 'ADMIN',
        emailVerified: true,
        points: 9999,
        level: 5,
        xp: 0
      }
    });

    console.log('=== Success! ===');
    console.log(`Created admin user successfully:`);
    console.log(`ID: ${newUser.id}`);
    console.log(`Username: ${newUser.username}`);
    console.log(`Role: ${newUser.role}`);
    console.log(`Email Verified: ${newUser.emailVerified}`);

  } catch (error) {
    console.error('An error occurred during admin update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

\\n
