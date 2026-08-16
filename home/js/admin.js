function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000' 
  : window.location.origin;

const authToken = localStorage.getItem('authToken');
let currentUser = null;

// Initialization
async function initAdmin() {
  if (!authToken) {
    alert('ไม่พบ Token สำหรับยืนยันตัวตน (Session ว่างเปล่า) กรุณาล็อกอินใหม่');
    window.location.href = '/';
    return;
  }

  try {
    // Verify user role
    let currentUserProfile = null;
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        currentUserProfile = data.user;
        localStorage.setItem('userProfile', JSON.stringify(currentUserProfile));
      }
    } catch (fetchErr) {
      console.warn('Backend fetch failed, falling back to cached profile:', fetchErr);
    }

    // Fallback to cache if API failed
    if (!currentUserProfile) {
      const cachedProfileStr = localStorage.getItem('userProfile');
      if (cachedProfileStr) {
        currentUserProfile = JSON.parse(cachedProfileStr);
      }
    }

    if (!currentUserProfile || (currentUserProfile.role !== 'ADMIN' && currentUserProfile.role !== 'OWNER')) {
      alert('คุณไม่มีสิทธิเข้าถึงหน้านี้ หรือไม่พบข้อมูลโปรไฟล์');
      window.location.href = 'index.html'; // Kick out to dashboard
      return;
    }
    
    currentUser = currentUserProfile;
    document.getElementById('adminUserInfo').textContent = `Admin: ${currentUser.username}`;
    
    // Setup Navigation
    setupTabs();
    
    // Load Dashboard by default
    loadDashboard();
    
  } catch (err) {
    console.error('Init Admin error:', err);
    alert('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ: ' + err.message + '\nกรุณาล็อกเอาท์และล็อกอินใหม่');
    window.location.href = 'index.html';
  }
}

// Tab Navigation
function setupTabs() {
  const tabs = [
    { id: 'tabDashboard', view: 'viewDashboard', loadFn: loadDashboard },
    { id: 'tabUsers', view: 'viewUsers', loadFn: loadUsers },
    { id: 'tabExams', view: 'viewExams', loadFn: loadExams },
    { id: 'tabAnnouncements', view: 'viewAnnouncements', loadFn: loadAnnouncements }
  ];

  tabs.forEach(tab => {
    document.getElementById(tab.id).addEventListener('click', () => {
      // Remove active classes
      tabs.forEach(t => {
        document.getElementById(t.id).classList.remove('active');
        document.getElementById(t.view).classList.remove('active');
      });
      // Set active
      document.getElementById(tab.id).classList.add('active');
      document.getElementById(tab.view).classList.add('active');
      
      // Update Title & Load data
      document.getElementById('pageTitle').textContent = document.getElementById(tab.id).textContent.trim();
      tab.loadFn();
    });
  });
}

// ==========================================
// Dashboard View
// ==========================================
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const stats = await res.json();
      document.getElementById('statUsers').textContent = stats.totalUsers || 0;
      document.getElementById('statExams').textContent = stats.totalExams || 0;
      document.getElementById('statPremium').textContent = stats.pendingPremiumRequests || 0;
    }
    
    // Announcements count doesn't come from stats, fetch manually
    const resAnn = await fetch(`${API_BASE}/api/announcements`);
    if (resAnn.ok) {
      const announcements = await resAnn.json();
      document.getElementById('statAnnouncements').textContent = announcements.length || 0;
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

// ==========================================
// Users View
// ==========================================
async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const users = await res.json();
      const tbody = document.getElementById('usersTableBody');
      tbody.innerHTML = '';
      
      users.forEach(u => {
        const tr = document.createElement('tr');
        const roleBadge = u.role === 'ADMIN' ? 'badge-admin' : 'badge-user';
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${u.username}</td>
          <td>Lv ${u.level || 1}</td>
          <td>${u.points || 0}</td>
          <td><span class="badge ${roleBadge}">${u.role}</span></td>
          <td class="action-buttons">
            <button class="btn btn-outline" onclick="toggleUserRole(${u.id}, '${u.role}')">สลับสิทธิ</button>
            <button class="btn btn-danger" onclick="confirmDelete('user', ${u.id})">ลบ</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Users load error:', err);
  }
}

async function toggleUserRole(id, currentRole) {
  const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      loadUsers();
    } else {
      alert('ไม่สามารถเปลี่ยนสิทธิได้');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// Exams View
// ==========================================
async function loadExams() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/exams`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const exams = await res.json();
      const tbody = document.getElementById('examsTableBody');
      tbody.innerHTML = '';
      
      exams.forEach(ex => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${ex.id}</td>
          <td>${ex.title}</td>
          <td>${ex.category}</td>
          <td>${ex.totalCount}</td>
          <td><span class="badge badge-user">${ex.status}</span></td>
          <td class="action-buttons">
            <button class="btn btn-outline" style="background: #EEF2FF; color: #4F46E5; border: 1px solid #C7D2FE;" onclick="openAppendModal(${ex.id}, '${escapeHTML(ex.title)}', ${ex.totalCount})">➕ เพิ่มข้อสอบ</button>
            <button class="btn btn-danger" onclick="confirmDelete('exam', ${ex.id})">ลบ</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Exams load error:', err);
  }
}

// ==========================================
// Cascading Dropdowns & AI Exam Generator Logic
// ==========================================
let cachedKnowledgeDocs = [];
let previewExamQuestions = [];
let appendTargetExamId = null;
let appendTargetCurrentCount = 0;

async function fetchKnowledgeDocs() {
  if (cachedKnowledgeDocs.length > 0) return cachedKnowledgeDocs;
  try {
    const res = await fetch(`${API_BASE}/api/admin/knowledge-topics`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      cachedKnowledgeDocs = await res.json();
    }
  } catch (err) {
    console.error('Fetch knowledge docs error:', err);
  }
  return cachedKnowledgeDocs;
}

async function showAddExamModal() {
  await fetchKnowledgeDocs();
  
  document.getElementById('examSubject').value = 'งานสารบรรณ';
  document.getElementById('examTitle').value = '';
  document.getElementById('examNumQuestions').value = '10';
  document.getElementById('examStatus').value = 'PUBLISHED';
  document.getElementById('aiProgressInfo').style.display = 'none';

  onSubjectChange();

  const savedKey = localStorage.getItem('admin_gemini_key') || '';
  const keyInput = document.getElementById('adminGeminiApiKey');
  if (keyInput) keyInput.value = savedKey;

  document.getElementById('addExamModal').style.display = 'flex';
}

function closeAddExamModal() {
  document.getElementById('addExamModal').style.display = 'none';
}

function onSubjectChange() {
  const subject = document.getElementById('examSubject').value;
  const kbSelect = document.getElementById('knowledgeBaseSelect');

  kbSelect.innerHTML = '';

  if (subject === 'งานสารบรรณ') {
    kbSelect.innerHTML = `
      <option value="ALL_SARABAN">📚 ดึงจากคลังงานสารบรรณทั้งหมด (๒๕๒๖ + ๕๔)</option>
      <option value="สารบรรณ_๒๕๒๖">📖 ระเบียบสำนักนายกฯ งานสารบรรณ พ.ศ. ๒๕๒๖</option>
      <option value="สารบรรณ_๕๔">👮 ประมวลระเบียบการตำรวจ ลักษณะที่ ๕๔ (พ.ศ. ๒๕๕๖)</option>
    `;
  } else {
    kbSelect.innerHTML = `
      <option value="GENERAL">⚖️ คลังข้อสอบตามมาตรฐานวิชา ${subject}</option>
      <option value="NONE">⚙️ ไม่อ้างอิงคลังระเบียบเฉพาะ</option>
    `;
  }

  onKnowledgeBaseChange();
}

function onKnowledgeBaseChange() {
  const kb = document.getElementById('knowledgeBaseSelect').value;
  const docSelect = document.getElementById('knowledgeDocSelect');

  docSelect.innerHTML = '';

  if (kb === 'ALL_SARABAN') {
    docSelect.innerHTML = '<option value="ALL">รวมทุกบท/ทุกภาคผนวกในคลังสารบรรณ</option>';
  } else if (kb === 'สารบรรณ_๒๕๒๖') {
    docSelect.innerHTML = '<option value="ALL_2526">รวมทุกหมวดในระเบียบสารบรรณ ๒๕๒๖</option>';
    const filtered = cachedKnowledgeDocs.filter(d => d.category.includes('ระเบียบสำนักนายก'));
    filtered.forEach(d => {
      docSelect.innerHTML += `<option value="${d.id}">${d.title}</option>`;
    });
  } else if (kb === 'สารบรรณ_๕๔') {
    docSelect.innerHTML = '<option value="ALL_54">รวมทุกบทในระเบียบตำรวจ ลักษณะ ๕๔</option>';
    const filtered = cachedKnowledgeDocs.filter(d => d.category.includes('ลักษณะที่ ๕๔'));
    filtered.forEach(d => {
      docSelect.innerHTML += `<option value="${d.id}">${d.title}</option>`;
    });
  } else {
    docSelect.innerHTML = '<option value="ALL">ออกครอบคลุมทุกหัวข้อในวิชานี้</option>';
  }
}

async function generateAIExamPreview() {
  const subject = document.getElementById('examSubject').value;
  const knowledgeBase = document.getElementById('knowledgeBaseSelect').value;
  const docId = document.getElementById('knowledgeDocSelect').value;
  let title = document.getElementById('examTitle').value.trim();
  const numQuestions = document.getElementById('examNumQuestions').value;
  const apiKey = document.getElementById('adminGeminiApiKey')?.value.trim() || localStorage.getItem('admin_gemini_key') || '';

  if (apiKey) {
    localStorage.setItem('admin_gemini_key', apiKey);
  }

  if (!title) {
    title = `ชุดข้อสอบ${subject} (${numQuestions} ข้อ)`;
  }

  const btn = document.getElementById('btnSubmitGenerateExam');
  const progressInfo = document.getElementById('aiProgressInfo');

  try {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    progressInfo.style.display = 'block';

    const res = await fetch(`${API_BASE}/api/admin/exams/preview-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        subject,
        knowledgeBase,
        docId,
        numQuestions: parseInt(numQuestions) || 10,
        apiKey
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถออกข้อสอบได้'));
      return;
    }

    previewExamQuestions = data.questions || [];
    closeAddExamModal();
    renderExamPreviewModal(title, subject, knowledgeBase);

  } catch (err) {
    console.error('Preview AI Exam Error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.style.opacity = '1';
    progressInfo.style.display = 'none';
  }
}

function renderExamPreviewModal(title, subject, knowledgeBase) {
  document.getElementById('previewSummaryBadge').textContent = `รวม ${previewExamQuestions.length} ข้อ`;
  const container = document.getElementById('previewQuestionsContainer');
  container.innerHTML = '';

  previewExamQuestions.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.style.cssText = 'padding: 16px; border: 1px solid #E2E8F0; border-radius: 12px; background: #F8FAFC; text-align: left;';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 700; color: #BD1B0B; font-size: 14px;">ข้อที่ ${idx + 1}</span>
        <button type="button" onclick="removePreviewQuestion(${idx})" style="background: none; border: none; color: #EF4444; font-size: 12px; font-weight: 600; cursor: pointer;">🗑️ ลบข้อนี้</button>
      </div>

      <div class="form-group" style="margin-bottom: 10px;">
        <label style="font-size: 12px;">คำถาม</label>
        <textarea id="q_text_${idx}" class="form-input" rows="2" style="font-size: 13px;">${escapeHTML(q.questionText)}</textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
        <div>
          <label style="font-size: 11px;">ตัวเลือก ก (Option A)</label>
          <input type="text" id="q_a_${idx}" class="form-input" value="${escapeHTML(q.optionA)}" style="font-size: 12px;">
        </div>
        <div>
          <label style="font-size: 11px;">ตัวเลือก ข (Option B)</label>
          <input type="text" id="q_b_${idx}" class="form-input" value="${escapeHTML(q.optionB)}" style="font-size: 12px;">
        </div>
        <div>
          <label style="font-size: 11px;">ตัวเลือก ค (Option C)</label>
          <input type="text" id="q_c_${idx}" class="form-input" value="${escapeHTML(q.optionC)}" style="font-size: 12px;">
        </div>
        <div>
          <label style="font-size: 11px;">ตัวเลือก ง (Option D)</label>
          <input type="text" id="q_d_${idx}" class="form-input" value="${escapeHTML(q.optionD)}" style="font-size: 12px;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
        <div>
          <label style="font-size: 11px; color: #10B981; font-weight: 700;">ข้อที่ถูกต้อง (Correct Option)</label>
          <select id="q_correct_${idx}" class="form-input" style="font-size: 12px; font-weight: 700; color: #10B981;">
            <option value="A" ${q.correctOption === 'A' ? 'selected' : ''}>ก (A)</option>
            <option value="B" ${q.correctOption === 'B' ? 'selected' : ''}>ข (B)</option>
            <option value="C" ${q.correctOption === 'C' ? 'selected' : ''}>ค (C)</option>
            <option value="D" ${q.correctOption === 'D' ? 'selected' : ''}>ง (D)</option>
          </select>
        </div>
        <div>
          <label style="font-size: 11px;">คำอธิบายเฉลย</label>
          <textarea id="q_exp_${idx}" class="form-input" rows="1" style="font-size: 12px;">${escapeHTML(q.explanation || '')}</textarea>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  document.getElementById('examPreviewModal').style.display = 'flex';
}

function removePreviewQuestion(index) {
  previewExamQuestions.splice(index, 1);
  const title = document.getElementById('examTitle').value;
  const subject = document.getElementById('examSubject').value;
  const knowledgeBase = document.getElementById('knowledgeBaseSelect').value;
  renderExamPreviewModal(title, subject, knowledgeBase);
}

function addCustomQuestionToPreview() {
  previewExamQuestions.push({
    questionText: 'คำถามข้อสอบใหม่ที่เพิ่มเอง...',
    optionA: 'ตัวเลือก ก',
    optionB: 'ตัวเลือก ข',
    optionC: 'ตัวเลือก ค',
    optionD: 'ตัวเลือก ง',
    correctOption: 'A',
    explanation: 'คำอธิบายเฉลยข้อสอบ...'
  });
  const title = document.getElementById('examTitle').value;
  const subject = document.getElementById('examSubject').value;
  const knowledgeBase = document.getElementById('knowledgeBaseSelect').value;
  renderExamPreviewModal(title, subject, knowledgeBase);
}

async function saveVerifiedExamSet(status) {
  previewExamQuestions.forEach((q, idx) => {
    const textEl = document.getElementById(`q_text_${idx}`);
    const aEl = document.getElementById(`q_a_${idx}`);
    const bEl = document.getElementById(`q_b_${idx}`);
    const cEl = document.getElementById(`q_c_${idx}`);
    const dEl = document.getElementById(`q_d_${idx}`);
    const corrEl = document.getElementById(`q_correct_${idx}`);
    const expEl = document.getElementById(`q_exp_${idx}`);

    if (textEl) q.questionText = textEl.value;
    if (aEl) q.optionA = aEl.value;
    if (bEl) q.optionB = bEl.value;
    if (cEl) q.optionC = cEl.value;
    if (dEl) q.optionD = dEl.value;
    if (corrEl) q.correctOption = corrEl.value;
    if (expEl) q.explanation = expEl.value;
  });

  const title = document.getElementById('examTitle').value.trim() || 'ชุดข้อสอบใหม่';
  const category = document.getElementById('examSubject').value;
  const subcategory = document.getElementById('knowledgeBaseSelect').value;

  try {
    const res = await fetch(`${API_BASE}/api/admin/exams/save-set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title,
        category,
        subcategory,
        status,
        questions: previewExamQuestions
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + (data.error || 'ไม่สามารถบันทึกชุดข้อสอบได้'));
      return;
    }

    alert(`🎉 ${data.message}`);
    document.getElementById('examPreviewModal').style.display = 'none';
    loadExams();

  } catch (err) {
    console.error('Save exam set error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  }
}

function openAppendModal(examId, title, currentCount) {
  appendTargetExamId = examId;
  appendTargetCurrentCount = currentCount;
  document.getElementById('appendExamTitleLabel').textContent = `ชุดเดิมมีอยู่แล้ว ${currentCount} ข้อ (ข้อสอบใหม่จะเริ่มนับข้อที่ ${currentCount + 1})`;
  document.getElementById('appendCount').value = '10';
  document.getElementById('appendProgressInfo').style.display = 'none';
  document.getElementById('btnSubmitAppend').disabled = false;
  document.getElementById('appendQuestionsModal').style.display = 'flex';
}

function closeAppendModal() {
  document.getElementById('appendQuestionsModal').style.display = 'none';
}

async function submitAppendQuestions() {
  const numQuestions = parseInt(document.getElementById('appendCount').value) || 10;
  const btn = document.getElementById('btnSubmitAppend');
  const progressInfo = document.getElementById('appendProgressInfo');

  try {
    btn.disabled = true;
    progressInfo.style.display = 'block';

    const res = await fetch(`${API_BASE}/api/admin/exams/${appendTargetExamId}/append-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ numQuestions })
    });

    const data = await res.json();
    if (!res.ok) {
      alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถเพิ่มข้อสอบได้'));
      return;
    }

    alert(`🎉 ${data.message}`);
    closeAppendModal();
    loadExams();

  } catch (err) {
    console.error('Append questions error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  } finally {
    btn.disabled = false;
    progressInfo.style.display = 'none';
  }
}

async function generateAIExamSet() {
  const title = document.getElementById('examTitle').value.trim();
  const category = document.getElementById('examCategory').value;
  const knowledgeCategory = document.getElementById('knowledgeCategory').value;
  const numQuestions = document.getElementById('examNumQuestions').value;
  const status = document.getElementById('examStatus').value;

  const btn = document.getElementById('btnSubmitGenerateExam');
  const progressInfo = document.getElementById('aiProgressInfo');

  try {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    progressInfo.style.display = 'block';

    const res = await fetch(`${API_BASE}/api/admin/exams/generate-ai-set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title,
        category,
        knowledgeCategory,
        numQuestions: parseInt(numQuestions) || 5,
        status
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถสร้างข้อสอบได้'));
      return;
    }

    alert(`🎉 ${data.message}`);
    closeAddExamModal();
    loadExams();

  } catch (err) {
    console.error('Generate AI Exam Set JS error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.style.opacity = '1';
    progressInfo.style.display = 'none';
  }
}

// ==========================================
// Announcements View
// ==========================================
let editAnnouncementId = null;

async function loadAnnouncements() {
  try {
    const res = await fetch(`${API_BASE}/api/announcements`);
    if (res.ok) {
      const announcements = await res.json();
      const tbody = document.getElementById('announcementsTableBody');
      tbody.innerHTML = '';
      
      announcements.forEach(ann => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${ann.id}</td>
          <td>${ann.orgAbbr}</td>
          <td>${ann.jobTitle}</td>
          <td>${ann.positionsCount}</td>
          <td><span class="badge badge-user">${ann.status}</span></td>
          <td class="action-buttons">
            <button class="btn btn-outline" onclick="editAnnouncement(${ann.id})">แก้ไข</button>
            <button class="btn btn-danger" onclick="confirmDelete('announcement', ${ann.id})">ลบ</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Announcements load error:', err);
  }
}

function showAddAnnouncementModal() {
  editAnnouncementId = null;
  document.getElementById('announcementModalTitle').textContent = 'เพิ่มประกาศรับสมัคร';
  document.getElementById('annOrgName').value = '';
  document.getElementById('annOrgAbbr').value = '';
  document.getElementById('annJobTitle').value = '';
  document.getElementById('annPositions').value = '';
  document.getElementById('annYear').value = '';
  document.getElementById('annLink').value = '';
  
  document.getElementById('announcementModal').style.display = 'flex';
}

async function editAnnouncement(id) {
  try {
    const res = await fetch(`${API_BASE}/api/announcements`);
    if (res.ok) {
      const announcements = await res.json();
      const ann = announcements.find(a => a.id === id);
      if (ann) {
        editAnnouncementId = id;
        document.getElementById('announcementModalTitle').textContent = 'แก้ไขประกาศ';
        document.getElementById('annOrgName').value = ann.orgName;
        document.getElementById('annOrgAbbr').value = ann.orgAbbr;
        document.getElementById('annJobTitle').value = ann.jobTitle;
        document.getElementById('annPositions').value = ann.positionsCount;
        document.getElementById('annYear').value = ann.year;
        document.getElementById('annLink').value = ann.link || '';
        
        document.getElementById('announcementModal').style.display = 'flex';
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function saveAnnouncement() {
  const payload = {
    orgName: document.getElementById('annOrgName').value,
    orgAbbr: document.getElementById('annOrgAbbr').value,
    jobTitle: document.getElementById('annJobTitle').value,
    positionsCount: parseInt(document.getElementById('annPositions').value) || 0,
    year: parseInt(document.getElementById('annYear').value) || new Date().getFullYear(),
    link: document.getElementById('annLink').value
  };

  const method = editAnnouncementId ? 'PUT' : 'POST';
  const url = editAnnouncementId 
    ? `${API_BASE}/api/announcements/${editAnnouncementId}`
    : `${API_BASE}/api/announcements`;

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      closeModal('announcementModal');
      loadAnnouncements();
    } else {
      alert('บันทึกข้อมูลล้มเหลว');
    }
  } catch (err) {
    console.error('Save announcement error:', err);
  }
}

// ==========================================
// Global Modals & Helpers
// ==========================================
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

let deleteTarget = null;
let deleteId = null;

function confirmDelete(target, id) {
  deleteTarget = target;
  deleteId = id;
  document.getElementById('confirmModal').style.display = 'flex';
}

document.getElementById('btnConfirmDelete').addEventListener('click', async () => {
  if (!deleteTarget || !deleteId) return;
  
  let url = '';
  if (deleteTarget === 'user') url = `${API_BASE}/api/admin/users/${deleteId}`;
  if (deleteTarget === 'exam') url = `${API_BASE}/api/admin/exams/${deleteId}`;
  if (deleteTarget === 'announcement') url = `${API_BASE}/api/announcements/${deleteId}`;

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      closeModal('confirmModal');
      if (deleteTarget === 'user') loadUsers();
      if (deleteTarget === 'exam') loadExams();
      if (deleteTarget === 'announcement') loadAnnouncements();
    } else {
      alert('ไม่สามารถลบข้อมูลได้');
    }
  } catch (err) {
    console.error('Delete error:', err);
  }
});

// Run Init
window.addEventListener('DOMContentLoaded', initAdmin);


// ==========================================
// KNOWLEDGE BASE (AI GENERATOR)
// ==========================================

async function loadKnowledgeDocs() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/knowledge`, {
      headers: { 'Authorization': `Bearer ${adminAuthToken}` }
    });
    if (!res.ok) throw new Error('Failed to fetch knowledge docs');
    const docs = await res.json();
    
    const tbody = document.getElementById('knowledgeTableBody');
    if (!tbody) return;
    
    let html = '';
    docs.forEach(d => {
      const dateStr = new Date(d.createdAt).toLocaleString('th-TH');
      html += `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 12px;">${d.id}</td>
          <td style="padding: 12px; font-weight: 500;">${d.title}</td>
          <td style="padding: 12px;">${d.category}</td>
          <td style="padding: 12px;">${dateStr}</td>
          <td style="padding: 12px; display: flex; gap: 8px;">
            <button onclick="openAiGenerateModal(${d.id}, '${d.title}')" style="background: #8B5CF6; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer;">✨ ให้ AI ออกข้อสอบ</button>
            <button onclick="deleteKnowledgeDoc(${d.id})" style="background: #EF4444; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer;">ลบ</button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html || '<tr><td colspan="5" style="text-align:center; padding: 20px;">ยังไม่มีข้อมูลคลังความรู้</td></tr>';
  } catch (err) {
    console.error(err);
  }
}

window.openAddKnowledgeModal = function() {
  document.getElementById('txtKnowledgeTitle').value = '';
  document.getElementById('txtKnowledgeCategory').value = '';
  document.getElementById('txtKnowledgeContent').value = '';
  document.getElementById('addKnowledgeModal').style.display = 'flex';
};

window.submitKnowledge = async function() {
  const title = document.getElementById('txtKnowledgeTitle').value.trim();
  const category = document.getElementById('txtKnowledgeCategory').value.trim();
  const content = document.getElementById('txtKnowledgeContent').value.trim();
  
  if (!title || !content) return alert('กรุณากรอกชื่อและเนื้อหาเอกสาร');
  
  try {
    const res = await fetch(`${API_BASE}/api/admin/knowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminAuthToken}`
      },
      body: JSON.stringify({ title, category, content })
    });
    
    if (res.ok) {
      document.getElementById('addKnowledgeModal').style.display = 'none';
      loadKnowledgeDocs();
    } else {
      alert('Failed to save document');
    }
  } catch (err) {
    alert(err.message);
  }
};

window.deleteKnowledgeDoc = async function(id) {
  if (!confirm('ยืนยันการลบเอกสารนี้?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/admin/knowledge/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminAuthToken}` }
    });
    if (res.ok) loadKnowledgeDocs();
  } catch (err) {
    alert(err.message);
  }
};

window.openAiGenerateModal = function(id, title) {
  document.getElementById('hdnGenerateDocId').value = id;
  document.getElementById('txtGenerateTitle').value = `แบบทดสอบ: ${title}`;
  document.getElementById('numGenerateCount').value = 10;
  document.getElementById('generateAiExamModal').style.display = 'flex';
};

window.submitAiGenerate = async function() {
  const id = document.getElementById('hdnGenerateDocId').value;
  const examTitle = document.getElementById('txtGenerateTitle').value;
  const questionCount = parseInt(document.getElementById('numGenerateCount').value);
  
  const btnSubmit = document.getElementById('btnSubmitGenerate');
  const btnCancel = document.getElementById('btnCancelGenerate');
  
  btnSubmit.disabled = true;
  btnCancel.disabled = true;
  btnSubmit.textContent = '⏳ กำลังให้ AI ประมวลผลและสร้างข้อสอบ... (อาจใช้เวลา 10-30 วินาที)';
  
  try {
    const res = await fetch(`${API_BASE}/api/admin/knowledge/${id}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminAuthToken}`
      },
      body: JSON.stringify({ examTitle, questionCount })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate');
    
    alert(`✨ สร้างข้อสอบสำเร็จแล้ว! จำนวน ${data.count} ข้อ ไปดูได้ที่แท็บ 'จัดการข้อสอบ'`);
    document.getElementById('generateAiExamModal').style.display = 'none';
    loadExamsList(); // refresh exams list
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btnSubmit.disabled = false;
    btnCancel.disabled = false;
    btnSubmit.textContent = '✨ สร้างข้อสอบด้วย AI';
  }
};

// Mobile Sidebar Toggle
window.addEventListener('DOMContentLoaded', () => {
  const adminMobileMenuToggle = document.getElementById('adminMobileMenuToggle');
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (adminMobileMenuToggle && sidebar && sidebarOverlay) {
    adminMobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });

    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      item.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
      });
    });
  }
});
