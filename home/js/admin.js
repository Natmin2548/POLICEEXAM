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
const API_BASE = '';

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
        try { currentUserProfile = JSON.parse(cachedProfileStr); } catch (e) {}
      }
    }

    if (!currentUserProfile) {
      alert('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      window.location.href = '/index.html';
      return;
    }

    currentUser = currentUserProfile;
    document.getElementById('adminUserInfo').textContent = `Admin: ${currentUser.username || currentUser.fullName || currentUser.email || 'Admin'}`;
    
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
// Exams View (Filtered by Subject & Chapter + Auto Set Numbering)
// ==========================================
let allLoadedExams = [];
let currentExamFilterSubject = 'ALL';
let currentExamFilterChapter = 'ALL';
let currentExamFilterSearch = '';

async function loadExams() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/exams`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      allLoadedExams = await res.json();
      updateFilterChapterDropdown();
      renderExamsWithFilters();
    }
  } catch (err) {
    console.error('Exams load error:', err);
  }
}

function updateFilterChapterDropdown() {
  const chapterSelect = document.getElementById('filterExamChapter');
  if (!chapterSelect) return;

  const subject = currentExamFilterSubject;
  chapterSelect.innerHTML = '<option value="ALL">ทุกหมวดหมู่ (All Chapters)</option>';

  if (subject !== 'ALL') {
    const chapters = SUBJECT_CHAPTERS[subject] || [];
    chapters.forEach(ch => {
      if (ch.value !== 'ALL') {
        chapterSelect.innerHTML += `<option value="${ch.value}">${ch.label}</option>`;
      }
    });
  } else {
    // Collect all unique subcategories from loaded exams
    const allSubcats = Array.from(new Set(allLoadedExams.map(e => e.subcategory).filter(Boolean)));
    allSubcats.forEach(sub => {
      chapterSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
  }
}

function renderExamsWithFilters() {
  const tbody = document.getElementById('examsTableBody');
  const summaryEl = document.getElementById('examsCountSummary');
  if (!tbody) return;

  tbody.innerHTML = '';

  const filtered = allLoadedExams.filter(ex => {
    // 1. Subject Filter
    if (currentExamFilterSubject !== 'ALL') {
      const isSubMatch = ex.category === currentExamFilterSubject || 
        (currentExamFilterSubject.includes('สารบรรณ') && ex.category && ex.category.includes('สารบรรณ')) ||
        (currentExamFilterSubject === 'งานสารบรรณ_๒๕๒๖' && ex.category && (ex.category.includes('๒๕๒๖') || ex.category === 'งานสารบรรณ')) ||
        (currentExamFilterSubject === 'สารบรรณตำรวจ_๕๔' && ex.category && (ex.category.includes('๕๔') || ex.category === 'ลักษณะที่54'));
      if (!isSubMatch) return false;
    }

    // 2. Chapter Filter
    if (currentExamFilterChapter !== 'ALL') {
      const cleanFilter = currentExamFilterChapter.replace(/บทที่\s*\d+\s*/, '').trim();
      const matchSubcat = ex.subcategory && (ex.subcategory === currentExamFilterChapter || ex.subcategory.includes(cleanFilter));
      const matchTitle = ex.title && cleanFilter && ex.title.includes(cleanFilter);
      if (!matchSubcat && !matchTitle) return false;
    }

    // 3. Search Filter
    if (currentExamFilterSearch) {
      const q = currentExamFilterSearch.toLowerCase();
      const matchText = (ex.title && ex.title.toLowerCase().includes(q)) ||
        (ex.subcategory && ex.subcategory.toLowerCase().includes(q)) ||
        (ex.category && ex.category.toLowerCase().includes(q)) ||
        (String(ex.id).includes(q));
      if (!matchText) return false;
    }

    return true;
  });

  if (summaryEl) {
    summaryEl.textContent = `พบทั้งหมด ${filtered.length} ชุดข้อสอบ (จากคลังทั้งหมด ${allLoadedExams.length} ชุด)`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 32px; color: #94A3B8;">
          <div style="font-size: 28px; margin-bottom: 8px;">📂</div>
          <div style="font-weight: 600; font-size: 14px;">ไม่พบชุดข้อสอบตามเงื่อนไขที่เลือก</div>
          <button onclick="resetExamFilters()" class="btn btn-outline" style="margin-top: 10px; font-size: 12px;">ล้างตัวกรองทั้งหมด</button>
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(ex => {
    const tr = document.createElement('tr');
    
    // Subject badge styling
    let subjectBadgeStyle = 'background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;';
    if (ex.category && (ex.category.includes('สารบรรณ') || ex.category.includes('๒๕๒๖'))) {
      subjectBadgeStyle = 'background: #FEF2F2; color: #BD1B0B; border: 1px solid #FECACA;';
    } else if (ex.category && (ex.category.includes('๕๔') || ex.category.includes('ตำรวจ'))) {
      subjectBadgeStyle = 'background: #FDF4FF; color: #86198F; border: 1px solid #F5D0FE;';
    } else if (ex.category && ex.category.includes('กฎหมาย')) {
      subjectBadgeStyle = 'background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0;';
    }

    const subcatText = ex.subcategory || 'รวมทุกหมวด';

    tr.innerHTML = `
      <td style="font-weight: 700; color: #64748B;">#${ex.id}</td>
      <td style="font-weight: 700; color: #0F172A; max-width: 260px;">
        <div style="line-height: 1.4;">${escapeHTML(ex.title)}</div>
      </td>
      <td>
        <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; ${subjectBadgeStyle}">
          ${escapeHTML(ex.category || 'ทั่วไป')}
        </span>
      </td>
      <td>
        <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1;">
          ${escapeHTML(subcatText)}
        </span>
      </td>
      <td style="text-align: center; font-weight: 700; color: #0F172A;">
        ${ex.totalCount || 0} ข้อ
      </td>
      <td style="text-align: center;">
        <span class="badge ${ex.status === 'PUBLISHED' ? 'badge-user' : 'badge-admin'}" style="${ex.status === 'PUBLISHED' ? 'background: #ECFDF5; color: #059669;' : 'background: #FFFBEB; color: #D97706;'}">
          ${ex.status === 'PUBLISHED' ? 'เปิดสอบ' : 'ฉบับร่าง'}
        </span>
      </td>
      <td class="action-buttons" style="text-align: right;">
        <button class="btn btn-outline" style="background: #EEF2FF; color: #4F46E5; border: 1px solid #C7D2FE; padding: 6px 10px; font-size: 11.5px;" onclick="openAppendModal(${ex.id}, '${escapeHTML(ex.title)}', ${ex.totalCount})">➕ เพิ่มข้อสอบ</button>
        <button class="btn btn-danger" style="padding: 6px 10px; font-size: 11.5px;" onclick="confirmDelete('exam', ${ex.id})">🗑️ ลบ</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.onFilterExamSubjectChange = function() {
  const select = document.getElementById('filterExamSubject');
  currentExamFilterSubject = select ? select.value : 'ALL';
  currentExamFilterChapter = 'ALL';
  updateFilterChapterDropdown();
  renderExamsWithFilters();
};

window.onFilterExamChapterChange = function() {
  const select = document.getElementById('filterExamChapter');
  currentExamFilterChapter = select ? select.value : 'ALL';
  renderExamsWithFilters();
};

window.onFilterExamSearchChange = function() {
  const input = document.getElementById('filterExamSearch');
  currentExamFilterSearch = input ? input.value.trim() : '';
  renderExamsWithFilters();
};

window.resetExamFilters = function() {
  currentExamFilterSubject = 'ALL';
  currentExamFilterChapter = 'ALL';
  currentExamFilterSearch = '';
  
  const subSelect = document.getElementById('filterExamSubject');
  const chSelect = document.getElementById('filterExamChapter');
  const searchInput = document.getElementById('filterExamSearch');

  if (subSelect) subSelect.value = 'ALL';
  if (chSelect) chSelect.value = 'ALL';
  if (searchInput) searchInput.value = '';

  updateFilterChapterDropdown();
  renderExamsWithFilters();
};

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

const SUBJECT_CHAPTERS = {
  'งานสารบรรณ_๒๕๒๖': [
    { value: 'ALL', label: '📚 รวมทุกบท (ระเบียบสารบรรณ ๒๕๒๖ และแก้ไขเพิ่มเติม)' },
    { value: 'บทที่ 1 บทนำและนิยาม', label: 'บทที่ 1 บทนำและนิยาม' },
    { value: 'บทที่ 2 มาตรฐานแบบพิมพ์ ตราครุฑ', label: 'บทที่ 2 มาตรฐานแบบพิมพ์ ตราครุฑ' },
    { value: 'บทที่ 3 หนังสือภายนอก หนังสือภายใน หนังสือประทับตรา', label: 'บทที่ 3 หนังสือภายนอก หนังสือภายใน หนังสือประทับตรา' },
    { value: 'บทที่ 4 หนังสือสั่งการ', label: 'บทที่ 4 หนังสือสั่งการ (คำสั่ง ข้อบังคับ ระเบียบ)' },
    { value: 'บทที่ 5 หนังสือประชาสัมพันธ์', label: 'บทที่ 5 หนังสือประชาสัมพันธ์ (ประกาศ แถลงการณ์ ข่าว)' },
    { value: 'บทที่ 6 หนังสือที่เจ้าหน้าที่จัดทำขึ้นหรือรับไว้เป็นหลักฐาน', label: 'บทที่ 6 หนังสือที่เจ้าหน้าที่จัดทำขึ้นหรือรับไว้เป็นหลักฐาน' },
    { value: 'บทที่ 7 เบ็ดเตล็ด สำเนา สำเนาคู่ฉบับ หนังสือเวียน', label: 'บทที่ 7 เบ็ดเตล็ด สำเนา สำเนาคู่ฉบับ หนังสือเวียน' },
    { value: 'บทที่ 8 การรับส่งหนังสือ', label: 'บทที่ 8 การรับและส่งหนังสือ' },
    { value: 'บทที่ 9 การเก็บรักษา', label: 'บทที่ 9 การเก็บรักษาหนังสือราชการ' },
    { value: 'บทที่ 10 การยืม', label: 'บทที่ 10 การยืมหนังสือราชการ' },
    { value: 'บทที่ 11 การทำลาย', label: 'บทที่ 11 การทำลายหนังสือราชการ' },
    { value: 'บทที่ 12 ระบบสารบรรณอิเล็กทรอนิกส์', label: 'บทที่ 12 ระบบสารบรรณอิเล็กทรอนิกส์ (e-Saraban)' }
  ],
  'สารบรรณตำรวจ_๕๔': [
    { value: 'ALL', label: '📚 รวมทุกบท (ประมวลระเบียบการตำรวจ ลักษณะที่ ๕๔)' },
    { value: 'บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ', label: 'บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ' },
    { value: 'บทที่ ๑-๒: การลงชื่อ การสั่งการ และการใช้บันทึกข้อความ', label: 'บทที่ ๑-๒: การลงชื่อ การสั่งการ และการใช้บันทึกข้อความ' },
    { value: 'บทที่ ๒-๓: เลขที่คำสั่งในบันทึกข้อความ และการเสนอ ผบ.ตร. (๕ หัวข้อ)', label: 'บทที่ ๒-๓: เลขที่คำสั่งในบันทึกข้อความ และการเสนอ ผบ.ตร. (๕ หัวข้อ)' },
    { value: 'บทที่ ๔-๖: ศูนย์รับส่งหนังสือ ตร. และการรับรองสำเนา (ร.ต.ต.ขึ้นไป)', label: 'บทที่ ๔-๖: ศูนย์รับส่งหนังสือ ตร. และการรับรองสำเนา (ร.ต.ต.ขึ้นไป)' },
    { value: 'บทที่ ๗: เลขที่หนังสือออก และรหัสประจำหน่วยงาน ตร (ตร ๐๐๐๑-๐๐๓๖)', label: 'บทที่ ๗: เลขที่หนังสือออก และรหัสประจำหน่วยงาน ตร (ตร ๐๐๐๑-๐๐๓๖)' },
    { value: 'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (ไทย)', label: 'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (ไทย)' },
    { value: 'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (English Abbreviations)', label: 'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (English Abbreviations)' },
    { value: 'บทที่ ๑๐-๑๑: ประกาศเจ้าพนักงานจราจร และไปรษณีย์สนามตำรวจชายแดน', label: 'บทที่ ๑๐-๑๑: ประกาศเจ้าพนักงานจราจร และไปรษณีย์สนามตำรวจชายแดน' }
  ],
  'ทั่วไป': [
    { value: 'ALL', label: '📚 รวมทุกหมวดความสามารถทั่วไป' },
    { value: 'อนุกรมและมิติสัมพันธ์ตัวเลข', label: 'อนุกรมและมิติสัมพันธ์ตัวเลข' },
    { value: 'ร้อยละ กำไรขาดทุน และโจทย์คำนวณ', label: 'ร้อยละ กำไรขาดทุน และโจทย์คำนวณ' },
    { value: 'ตรรกศาสตร์และเงื่อนไขภาษา / สัญลักษณ์', label: 'ตรรกศาสตร์และเงื่อนไขภาษา / สัญลักษณ์' },
    { value: 'ความน่าจะเป็นและสถิติพื้นฐาน', label: 'ความน่าจะเป็นและสถิติพื้นฐาน' }
  ],
  'สังคม': [
    { value: 'ALL', label: '📚 รวมทุกหมวดสังคมและจริยธรรม' },
    { value: 'ประชาคมอาเซียน (AEC)', label: 'ประชาคมอาเซียน (AEC)' },
    { value: 'ศาสนา วัฒนธรรม และเศรษฐกิจพอเพียง', label: 'ศาสนา วัฒนธรรม และเศรษฐกิจพอเพียง' },
    { value: 'ข่าวสารและเหตุการณ์สำคัญปัจจุบัน', label: 'ข่าวสารและเหตุการณ์สำคัญปัจจุบัน' }
  ],
  'กฏหมาย': [
    { value: 'ALL', label: '📚 รวมทุกหมวดกฎหมายตำรวจ' },
    { value: 'พ.ร.บ.ตำรวจแห่งชาติ พ.ศ. ๒๕๖๕', label: 'พ.ร.บ.ตำรวจแห่งชาติ พ.ศ. ๒๕๖๕' },
    { value: 'กฎหมายวิธีพิจารณาความอาญา (ป.วิ.อ.)', label: 'กฎหมายวิธีพิจารณาความอาญา (ป.วิ.อ.)' },
    { value: 'กฎหมายอาญาและสิทธิมนุษยชน', label: 'กฎหมายอาญาและสิทธิมนุษยชน' }
  ],
  'คอม': [
    { value: 'ALL', label: '📚 รวมทุกหมวดคอมพิวเตอร์และสารสนเทศ' },
    { value: 'บทที่ 1 ความรู้พื้นฐานและประวัติคอมพิวเตอร์', label: 'บทที่ 1 ความรู้พื้นฐานและประวัติคอมพิวเตอร์' },
    { value: 'บทที่ 2 ข้อมูลและสารสนเทศ', label: 'บทที่ 2 ข้อมูลและสารสนเทศ' },
    { value: 'บทที่ 3 IPOS และหน่วยประมวลผล', label: 'บทที่ 3 IPOS และหน่วยประมวลผล' },
    { value: 'บทที่ 4 ซอฟต์แวร์', label: 'บทที่ 4 ซอฟต์แวร์' },
    { value: 'บทที่ 5 ชนิดข้อมูลและรหัสแทนข้อมูล', label: 'บทที่ 5 ชนิดข้อมูลและรหัสแทนข้อมูล' },
    { value: 'บทที่ 6 Procedure และผังงาน (Flowchart)', label: 'บทที่ 6 Procedure และผังงาน (Flowchart)' },
    { value: 'บทที่ 7 ระบบเครือข่ายคอมพิวเตอร์', label: 'บทที่ 7 ระบบเครือข่ายคอมพิวเตอร์' },
    { value: 'บทที่ 8 Internet', label: 'บทที่ 8 Internet' },
    { value: 'บทที่ 9 E-commerce', label: 'บทที่ 9 E-commerce' },
    { value: 'บทที่ 10 ความปลอดภัยของคอมพิวเตอร์', label: 'บทที่ 10 ความปลอดภัยของคอมพิวเตอร์' },
    { value: 'บทที่ 11 Social Media และ Cloud', label: 'บทที่ 11 Social Media และ Cloud' },
    { value: 'บทที่ 12 Microsoft Word', label: 'บทที่ 12 Microsoft Word' },
    { value: 'บทที่ 13 Microsoft Excel', label: 'บทที่ 13 Microsoft Excel' },
    { value: 'บทที่ 14 PowerPoint (คำสั่งลัด)', label: 'บทที่ 14 PowerPoint (คำสั่งลัด)' }
  ],
  'ภาษาไทย': [
    { value: 'ALL', label: '📚 รวมทุกหมวดภาษาไทย' },
    { value: 'การใช้คำ ความหมาย และคำราชาศัพท์', label: 'การใช้คำ ความหมาย และคำราชาศัพท์' },
    { value: 'การสะกดคำ การแต่งประโยค และสำนวนไทย', label: 'การสะกดคำ การแต่งประโยค และสำนวนไทย' },
    { value: 'การอ่านจับใจความและบทความ', label: 'การอ่านจับใจความและบทความ' }
  ],
  'ภาษาอังกฤษ': [
    { value: 'ALL', label: '📚 รวมทุกหมวดภาษาอังกฤษ' },
    { value: 'Vocabulary (คำศัพท์ตำรวจและทั่วไป)', label: 'Vocabulary (คำศัพท์ตำรวจและทั่วไป)' },
    { value: 'Grammar & Structure (ไวยากรณ์และโครงสร้าง)', label: 'Grammar & Structure (ไวยากรณ์และโครงสร้าง)' },
    { value: 'Conversation & Reading (บทสนทนาและการอ่าน)', label: 'Conversation & Reading (บทสนทนาและการอ่าน)' }
  ]
};

function getSubjectDisplayName(subject) {
  if (subject === 'งานสารบรรณ_๒๕๒๖') return 'ระเบียบสารบรรณ (๒๕๒๖)';
  if (subject === 'สารบรรณตำรวจ_๕๔') return 'สารบรรณตำรวจ ลักษณะที่ ๕๔';
  return subject;
}

function getStoredCustomChapters(subject) {
  try {
    const raw = localStorage.getItem(`admin_custom_chapters_${subject}`);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function storeCustomChapter(subject, chapterName) {
  try {
    const list = getStoredCustomChapters(subject);
    if (!list.includes(chapterName)) {
      list.push(chapterName);
      localStorage.setItem(`admin_custom_chapters_${subject}`, JSON.stringify(list));
    }
  } catch (e) {}
}

window.toggleCustomChapterInput = function() {
  const box = document.getElementById('customChapterBox');
  const input = document.getElementById('customChapterInput');
  if (!box) return;
  const isHidden = box.style.display === 'none' || !box.style.display;
  box.style.display = isHidden ? 'block' : 'none';
  if (isHidden && input) {
    input.value = '';
    input.focus();
  }
};

window.saveNewCustomChapter = function() {
  const input = document.getElementById('customChapterInput');
  const subjectSelect = document.getElementById('examSubject');
  const chapterSelect = document.getElementById('sarabanChapterSelect');
  const subject = subjectSelect ? subjectSelect.value : 'ทั่วไป';
  const newChapter = input ? input.value.trim() : '';

  if (!newChapter) {
    alert('กรุณากรอกชื่อหมวดหมู่ใหม่ที่ต้องการสร้าง');
    return;
  }

  // Save to persistent storage
  storeCustomChapter(subject, newChapter);

  // Add to in-memory SUBJECT_CHAPTERS
  if (!SUBJECT_CHAPTERS[subject]) {
    SUBJECT_CHAPTERS[subject] = [{ value: 'ALL', label: `📚 รวมทุกหมวดในวิชา${subject}` }];
  }
  if (!SUBJECT_CHAPTERS[subject].some(ch => ch.value === newChapter)) {
    SUBJECT_CHAPTERS[subject].push({ value: newChapter, label: `✨ ${newChapter} (สร้างใหม่)` });
  }

  // Re-populate dropdown and select this new chapter
  onSubjectChange();
  if (chapterSelect) {
    chapterSelect.value = newChapter;
    onSarabanChapterChange();
  }

  // Hide custom input box
  const box = document.getElementById('customChapterBox');
  if (box) box.style.display = 'none';

  alert(`✅ บันทึกหมวดหมู่ "${newChapter}" เรียบร้อยแล้ว! หมวดนี้จะถูกจดจำไว้ในระบบสำหรับการสร้างข้อสอบทุกครั้ง`);
};

function onSubjectChange() {
  const subjectSelect = document.getElementById('examSubject');
  const subject = subjectSelect ? subjectSelect.value : 'งานสารบรรณ_๒๕๒๖';
  const chapterSelect = document.getElementById('sarabanChapterSelect');
  const chapterLabel = document.getElementById('chapterSelectLabel');
  const kbSelect = document.getElementById('knowledgeBaseSelect');

  if (chapterLabel) {
    if (subject === 'งานสารบรรณ_๒๕๒๖') {
      chapterLabel.textContent = '2. เลือกหมวดหมู่ระเบียบสารบรรณ ๒๕๒๖ (12 บท)';
    } else if (subject === 'สารบรรณตำรวจ_๕๔') {
      chapterLabel.textContent = '2. เลือกบทเรียนสารบรรณตำรวจ ลักษณะที่ ๕๔';
    } else {
      chapterLabel.textContent = `2. เลือกหมวดหมู่ / บทเรียนวิชา${subject}`;
    }
  }

  // Collect all chapters (Preset + Stored Custom + DB Subcategories)
  const presetChapters = SUBJECT_CHAPTERS[subject] || [
    { value: 'ALL', label: `📚 รวมทุกหมวดในวิชา${subject}` }
  ];
  const customList = getStoredCustomChapters(subject);
  
  // Also collect subcategories from loaded exams
  const dbSubcats = allLoadedExams
    .filter(e => e.category === subject || (subject.includes('สารบรรณ') && e.category && e.category.includes('สารบรรณ')))
    .map(e => e.subcategory)
    .filter(Boolean);

  const mergedMap = new Map();
  presetChapters.forEach(ch => mergedMap.set(ch.value, ch.label));
  
  customList.forEach(customCh => {
    if (!mergedMap.has(customCh)) {
      mergedMap.set(customCh, `✨ ${customCh} (หมวดที่คุณสร้าง)`);
    }
  });

  dbSubcats.forEach(dbCh => {
    if (!mergedMap.has(dbCh)) {
      mergedMap.set(dbCh, `📂 ${dbCh}`);
    }
  });

  if (chapterSelect) {
    chapterSelect.innerHTML = '';
    mergedMap.forEach((label, val) => {
      chapterSelect.innerHTML += `<option value="${escapeHTML(val)}">${escapeHTML(label)}</option>`;
    });
  }

  if (kbSelect) {
    kbSelect.innerHTML = '';
    if (subject === 'งานสารบรรณ_๒๕๒๖') {
      kbSelect.innerHTML = `<option value="สารบรรณ_๒๕๒๖">📖 ระเบียบสำนักนายกฯ งานสารบรรณ พ.ศ. ๒๕๒๖</option>`;
    } else if (subject === 'สารบรรณตำรวจ_๕๔') {
      kbSelect.innerHTML = `<option value="สารบรรณ_๕๔">👮 ประมวลระเบียบการตำรวจ ลักษณะที่ ๕๔</option>`;
    } else {
      kbSelect.innerHTML = `<option value="GENERAL">⚖️ คลังข้อสอบวิชา ${subject}</option>`;
    }
  }

  onSarabanChapterChange();
}

window.selectQuestionCount = function(count) {
  const input = document.getElementById('examNumQuestions');
  if (input) input.value = count;
  ['10', '20', '30', '40', '50'].forEach(c => {
    const btn = document.getElementById(`btnCount${c}`);
    if (btn) {
      if (parseInt(c) === count) {
        btn.style.borderColor = '#BD1B0B';
        btn.style.backgroundColor = '#FEF2F2';
        btn.style.color = '#BD1B0B';
      } else {
        btn.style.borderColor = '#E2E8F0';
        btn.style.backgroundColor = '#F8FAFC';
        btn.style.color = '#475569';
      }
    }
  });
};

function onSarabanChapterChange() {
  const subjectSelect = document.getElementById('examSubject');
  const subject = subjectSelect ? subjectSelect.value : 'งานสารบรรณ_๒๕๒๖';
  const chapterSelect = document.getElementById('sarabanChapterSelect');
  const titleInput = document.getElementById('examTitle');
  const subcatInput = document.getElementById('examSubcategory');
  
  if (!chapterSelect) return;
  const val = chapterSelect.value;
  const displayName = getSubjectDisplayName(subject);

  // Calculate automatic set number (ชุดที่ 1, ชุดที่ 2...) for the same subject & category/chapter
  const matchingExistingSets = allLoadedExams.filter(ex => {
    const isSameSubject = ex.category === subject || 
      (subject.includes('สารบรรณ') && ex.category && ex.category.includes('สารบรรณ')) ||
      (subject === 'งานสารบรรณ_๒๕๒๖' && ex.category && (ex.category.includes('๒๕๒๖') || ex.category === 'งานสารบรรณ')) ||
      (subject === 'สารบรรณตำรวจ_๕๔' && ex.category && (ex.category.includes('๕๔') || ex.category === 'ลักษณะที่54'));
    if (!isSameSubject) return false;

    if (val === 'ALL') {
      return !ex.subcategory || ex.subcategory.includes('รวมทุก') || ex.title.includes('รวมทุก');
    }

    const cleanVal = val.replace(/บทที่\s*\d+\s*/, '').trim();
    if (ex.subcategory && (ex.subcategory === val || ex.subcategory.includes(cleanVal))) return true;
    if (ex.title && cleanVal && ex.title.includes(cleanVal)) return true;
    return false;
  });

  const nextSetNum = matchingExistingSets.length + 1;

  if (val === 'ALL') {
    if (subcatInput) subcatInput.value = `รวมทุกหมวด ${displayName}`;
    if (titleInput) {
      titleInput.value = `แบบทดสอบ${displayName} (รวมทุกหมวด) (ชุดที่ ${nextSetNum})`;
    }
  } else {
    if (subcatInput) subcatInput.value = val;
    if (titleInput) {
      titleInput.value = `แบบทดสอบ${displayName}: ${val} (ชุดที่ ${nextSetNum})`;
    }
  }
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

    const subcategory = document.getElementById('examSubcategory')?.value.trim() || '';

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
        title,
        subcategory,
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
  const customSubcategory = document.getElementById('examSubcategory')?.value.trim();
  const subcategory = customSubcategory || document.getElementById('knowledgeBaseSelect').value;

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
