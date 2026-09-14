// ==========================================
// bank.js - Dedicated Logic for Question Bank & Exam Runner
// ==========================================

let activeSubjectKey = 'ภาษาไทย';
let activeChapterTitle = '';
let activeSubjectDBSets = [];
let currentSelectedBankSubject = 'ภาษาไทย';
let currentSelectedChapter = '';
let currentFetchedExamSets = [];
let currentQuizState = null;
let quizTimerInterval = null;
let quizRemainingSeconds = 0;
let userDbQuizHistory = [];

// ==========================================
// Subject & Chapter Configurations
// ==========================================
const SUBJECT_CONFIG = {
  'ภาษาไทย': {
    title: 'ภาษาไทย',
    subtitle: 'หลักภาษา การใช้คำ การอ่านจับใจความ และโวหารภาพพจน์',
    badge: 'วิชาหลัก',
    icon: 'TH',
    iconBg: '#FFF1F2',
    iconColor: '#E11D48',
    chapters: [
      'บทที่ 1 วิเคราะห์บทความ',
      'บทที่ 2 โวหารการเขียน'
    ],
    sets: []
  },
  'ทั่วไป': {
    title: 'ความสามารถทั่วไป',
    subtitle: 'คณิตศาสตร์ อนุกรม ร้อยละ สมการ และตรรกศาสตร์',
    badge: 'คำนวณ & ตรรกะ',
    icon: '🧠',
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
    chapters: [
      'บทที่ 1 อนุกรม',
      'บทที่ 2 อุปมา-อุปไมย'
    ],
    sets: []
  },
  'ความสามารถทั่วไป': {
    title: 'ความสามารถทั่วไป',
    subtitle: 'คณิตศาสตร์ อนุกรม ร้อยละ สมการ และตรรกศาสตร์',
    badge: 'คำนวณ & ตรรกะ',
    icon: '🧠',
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
    chapters: [
      'บทที่ 1 อนุกรม',
      'บทที่ 2 อุปมา-อุปไมย'
    ],
    sets: []
  },
  'คอม': {
    title: 'คอมพิวเตอร์',
    subtitle: 'ระบบเครือข่าย ซอฟต์แวร์ อินเทอร์เน็ต ความปลอดภัย และเทคโนโลยีสารสนเทศ',
    badge: 'ดิจิทัล & คอมฯ',
    icon: '💻',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    chapters: [
      'บทที่ 1 ความรู้พื้นฐานและประวัติคอมพิวเตอร์',
      'บทที่ 2 ข้อมูลและสารสนเทศ'
    ],
    sets: []
  },
  'คอมพิวเตอร์': {
    title: 'คอมพิวเตอร์',
    subtitle: 'ระบบเครือข่าย ซอฟต์แวร์ อินเทอร์เน็ต ความปลอดภัย และเทคโนโลยีสารสนเทศ',
    badge: 'ดิจิทัล & คอมฯ',
    icon: '💻',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    chapters: [
      'บทที่ 1 ความรู้พื้นฐานและประวัติคอมพิวเตอร์',
      'บทที่ 2 ข้อมูลและสารสนเทศ'
    ],
    sets: []
  },
  'กฏหมาย': {
    title: 'กฎหมาย',
    subtitle: 'กฎหมายที่ประชาชนควรรู้ ประมวลกฎหมาย และแนวทางปฏิบัติราชการ',
    badge: 'นิติศาสตร์',
    icon: '⚖️',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    chapters: [
      'บทที่ 2 ความรู้ทั่วไปเกี่ยวกับรัฐ'
    ],
    sets: []
  },
  'กฎหมาย': {
    title: 'กฎหมาย',
    subtitle: 'กฎหมายที่ประชาชนควรรู้ ประมวลกฎหมาย และแนวทางปฏิบัติราชการ',
    badge: 'นิติศาสตร์',
    icon: '⚖️',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    chapters: [
      'บทที่ 2 ความรู้ทั่วไปเกี่ยวกับรัฐ'
    ],
    sets: []
  },
  'สังคม': {
    title: 'สังคม',
    subtitle: 'สังคม วัฒนธรรม จริยธรรม สิทธิมนุษยชน และความรู้เกี่ยวกับอาเซียน',
    badge: 'สังคม & จริยธรรม',
    icon: '🌍',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    chapters: [
      'บทที่ 1 สังคมวิทยา',
      'บทที่ 2 วัฒนธรรม ประเพณี และสังคมไทย'
    ],
    sets: []
  },
  'งานสารบรรณ': {
    title: 'งานสารบรรณ',
    subtitle: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ และแก้ไขเพิ่มเติม',
    badge: 'งานสารบรรณ',
    icon: '📄',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    chapters: [
      'บทที่ 1 บทนำและนิยาม',
      'บทที่ 2 มาตรฐานแบบพิมพ์ ตราครุฑ',
      'บทที่ 3 หนังสือภายนอก หนังสือภายใน หนังสือประทับตรา'
    ],
    sets: []
  },
  'ลักษณะที่54': {
    title: 'ลักษณะที่ 54',
    subtitle: 'ประมวลระเบียบการตำรวจไม่เกี่ยวกับคดี ลักษณะที่ ๕๔ งานสารบรรณ (พ.ศ. ๒๕๕๖)',
    badge: 'สารบรรณตำรวจ',
    icon: '📋',
    iconBg: '#FDF2F8',
    iconColor: '#BE185D',
    chapters: [
      'บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ',
      'บทที่ ๑-๒: การลงชื่อ การสั่งการ และการใช้บันทึกข้อความ',
      'บทที่ ๒-๓: เลขที่คำสั่งในบันทึกข้อความ และการเสนอ ผบ.ตร. (๕ หัวข้อ)'
    ],
    sets: []
  },
  'ลักษณะที่ 54': {
    title: 'ลักษณะที่ 54',
    subtitle: 'ประมวลระเบียบการตำรวจไม่เกี่ยวกับคดี ลักษณะที่ ๕๔ งานสารบรรณ (พ.ศ. ๒๕๕๖)',
    badge: 'สารบรรณตำรวจ',
    icon: '📋',
    iconBg: '#FDF2F8',
    iconColor: '#BE185D',
    chapters: [
      'บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ',
      'บทที่ ๑-๒: การลงชื่อ การสั่งการ และการใช้บันทึกข้อความ',
      'บทที่ ๒-๓: เลขที่คำสั่งในบันทึกข้อความ และการเสนอ ผบ.ตร. (๕ หัวข้อ)'
    ],
    sets: []
  }
};

// ==========================================
// Screen 1: Subject Categories
// ==========================================
window.renderExamBankList = function() {
  const container = document.getElementById('questionBankSubjectsList');
  if (!container) return;

  container.style.maxWidth = '480px';
  container.style.margin = '0 auto';
  container.style.padding = '6px 4px';
  container.innerHTML = `
    <!-- Top Nav Bar: Title -->
    <div style="margin-bottom: 22px; padding: 4px 0;">
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px;">คลังข้อสอบรายบท</h2>
    </div>

    <!-- Section Label -->
    <div style="font-size: 13.5px; font-weight: 500; color: #94A3B8; margin-top: 14px; margin-bottom: 12px; padding-left: 2px;">
      เลือกวิชา
    </div>

    <!-- Subject List Items -->
    <div class="bank-subjects-list" style="display: flex; flex-direction: column;">

      <!-- 1. ภาษาไทย -->
      <div class="subject-card-item" onclick="startBankSubject('ภาษาไทย')"
        style="display: flex; align-items: center; justify-content: space-between; padding: 16px 6px; border-bottom: 1px solid #F1F5F9; cursor: pointer; transition: all 0.15s ease; border-radius: 12px;"
        onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; color: #334155; flex-shrink: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            TH
          </div>
          <div>
            <div style="font-size: 15.5px; font-weight: 700; color: #0F172A; line-height: 1.35;">ภาษาไทย</div>
            <div id="bankQCount_thai" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">60 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_thai" style="background: #FFF1F2; color: #E11D48; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            2 บท
          </span>
          <span style="color: #CBD5E1; font-size: 16px; font-weight: 600;">›</span>
        </div>
      </div>

      <!-- 2. ความสามารถทั่วไป -->
      <div class="subject-card-item" onclick="startBankSubject('ทั่วไป')"
        style="display: flex; align-items: center; justify-content: space-between; padding: 16px 6px; border-bottom: 1px solid #F1F5F9; cursor: pointer; transition: all 0.15s ease; border-radius: 12px;"
        onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
            🧠
          </div>
          <div>
            <div style="font-size: 15.5px; font-weight: 700; color: #0F172A; line-height: 1.35;">ความสามารถทั่วไป</div>
            <div id="bankQCount_general" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">60 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_general" style="background: #F3E8FF; color: #9333EA; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            2 บท
          </span>
          <span style="color: #CBD5E1; font-size: 16px; font-weight: 600;">›</span>
        </div>
      </div>

      <!-- 3. คอมพิวเตอร์ -->
      <div class="subject-card-item" onclick="startBankSubject('คอม')"
        style="display: flex; align-items: center; justify-content: space-between; padding: 16px 6px; border-bottom: 1px solid #F1F5F9; cursor: pointer; transition: all 0.15s ease; border-radius: 12px;"
        onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
            💻
          </div>
          <div>
            <div style="font-size: 15.5px; font-weight: 700; color: #0F172A; line-height: 1.35;">คอมพิวเตอร์</div>
            <div id="bankQCount_computer" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">60 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_computer" style="background: #EFF6FF; color: #2563EB; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            2 บท
          </span>
          <span style="color: #CBD5E1; font-size: 16px; font-weight: 600;">›</span>
        </div>
      </div>

      <!-- 4. กฎหมาย -->
      <div class="subject-card-item" onclick="startBankSubject('กฏหมาย')"
        style="display: flex; align-items: center; justify-content: space-between; padding: 16px 6px; border-bottom: 1px solid #F1F5F9; cursor: pointer; transition: all 0.15s ease; border-radius: 12px;"
        onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
            ⚖️
          </div>
          <div>
            <div style="font-size: 15.5px; font-weight: 700; color: #0F172A; line-height: 1.35;">กฎหมาย</div>
            <div id="bankQCount_law" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">30 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_law" style="background: #FEF3C7; color: #D97706; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            1 บท
          </span>
          <span style="color: #CBD5E1; font-size: 16px; font-weight: 600;">›</span>
        </div>
      </div>

      <!-- 5. สังคม -->
      <div class="subject-card-item" onclick="startBankSubject('สังคม')"
        style="display: flex; align-items: center; justify-content: space-between; padding: 16px 6px; border-bottom: 1px solid #F1F5F9; cursor: pointer; transition: all 0.15s ease; border-radius: 12px;"
        onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
            🌍
          </div>
          <div>
            <div style="font-size: 15.5px; font-weight: 700; color: #0F172A; line-height: 1.35;">สังคม</div>
            <div id="bankQCount_social" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">60 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_social" style="background: #ECFDF5; color: #059669; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            2 บท
          </span>
          <span style="color: #CBD5E1; font-size: 16px; font-weight: 600;">›</span>
        </div>
      </div>

      <!-- 6. งานสารบรรณ -->
      <div class="subject-card-item" onclick="startBankSubject('งานสารบรรณ')"
        style="display: flex; align-items: center; justify-content: space-between; padding: 16px 6px; border-bottom: 1px solid #F1F5F9; cursor: pointer; transition: all 0.15s ease; border-radius: 12px;"
        onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
            📄
          </div>
          <div>
            <div style="font-size: 15.5px; font-weight: 700; color: #0F172A; line-height: 1.35;">งานสารบรรณ</div>
            <div id="bankQCount_saraban" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">90 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_saraban" style="background: #FFF7ED; color: #EA580C; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            3 บท
          </span>
          <span style="color: #CBD5E1; font-size: 16px; font-weight: 600;">›</span>
        </div>
      </div>

      <!-- 7. ลักษณะที่ 54 -->
      <div class="subject-card-item" onclick="startBankSubject('ลักษณะที่54')"
        style="display: flex; align-items: center; justify-content: space-between; padding: 16px 6px; border-bottom: 1px solid #F1F5F9; cursor: pointer; transition: all 0.15s ease; border-radius: 12px;"
        onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
            📋
          </div>
          <div>
            <div style="font-size: 15.5px; font-weight: 700; color: #0F172A; line-height: 1.35;">ลักษณะที่ 54</div>
            <div id="bankQCount_law54" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">90 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_law54" style="background: #FDF2F8; color: #BE185D; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            3 บท
          </span>
          <span style="color: #CBD5E1; font-size: 16px; font-weight: 600;">›</span>
        </div>
      </div>

    </div>

    <!-- Back to Home Button at Bottom -->
    <button type="button" onclick="goBackToHome()"
      style="width: 100%; margin-top: 28px; padding: 13px 20px; background: #FFFFFF; border: 1.5px solid #BD1B0B; border-radius: 14px; color: #BD1B0B; font-size: 15px; font-weight: 700; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s ease;"
      onmouseover="this.style.backgroundColor='#FFF1F2'" onmouseout="this.style.backgroundColor='#FFFFFF'">
      <span style="font-size: 16px; font-weight: 700;">←</span> <span>กลับหน้าหลัก</span>
    </button>
  `;
};

window.goBackToHome = function() {
  if (typeof switchTabToHome === 'function') {
    switchTabToHome();
  } else {
    window.location.href = 'index.html';
  }
};

window.updateBankSubjectCounts = async function() {
  try {
    const res = await fetch(`${API_BASE}/api/exams/sets`);
    if (!res.ok) return;
    const sets = await res.json();
    if (!Array.isArray(sets) || sets.length === 0) return;

    const subjectsMap = {
      thai: {
        countEl: 'bankQCount_thai',
        chapEl: 'bankChapBadge_thai',
        match: s => {
          const cat = s.category || '';
          const title = s.title || '';
          return (cat === 'ภาษาไทย' || cat === 'ไทย' || title.includes('แบบทดสอบภาษาไทย')) && !cat.includes('สังคม') && !title.includes('สังคม');
        }
      },
      general: {
        countEl: 'bankQCount_general',
        chapEl: 'bankChapBadge_general',
        match: s => {
          const cat = s.category || '';
          const title = s.title || '';
          return (cat === 'ทั่วไป' || cat === 'ความสามารถทั่วไป' || title.includes('แบบทดสอบทั่วไป')) && !cat.includes('กฏหมาย') && !cat.includes('กฎหมาย') && !title.includes('กฏหมาย') && !title.includes('กฎหมาย');
        }
      },
      computer: {
        countEl: 'bankQCount_computer',
        chapEl: 'bankChapBadge_computer',
        match: s => {
          const cat = s.category || '';
          const title = s.title || '';
          return cat === 'คอม' || cat === 'คอมพิวเตอร์' || cat === 'เทคโนโลยีสารสนเทศ' || title.includes('แบบทดสอบคอม');
        }
      },
      law: {
        countEl: 'bankQCount_law',
        chapEl: 'bankChapBadge_law',
        match: s => {
          const cat = s.category || '';
          const title = s.title || '';
          return cat === 'กฏหมาย' || cat === 'กฎหมาย' || title.includes('แบบทดสอบกฏหมาย') || title.includes('แบบทดสอบกฎหมาย');
        }
      },
      social: {
        countEl: 'bankQCount_social',
        chapEl: 'bankChapBadge_social',
        match: s => {
          const cat = s.category || '';
          const title = s.title || '';
          return cat === 'สังคม' || cat === 'สังคมและวัฒนธรรม' || title.includes('แบบทดสอบสังคม');
        }
      },
      saraban: {
        countEl: 'bankQCount_saraban',
        chapEl: 'bankChapBadge_saraban',
        match: s => {
          const cat = s.category || '';
          const title = s.title || '';
          const isLaw54 = cat.includes('๕๔') || cat.includes('54') || cat.includes('สารบรรณตำรวจ') || title.includes('๕๔') || title.includes('54') || title.includes('สารบรรณตำรวจ');
          return (cat.includes('สารบรรณ') || cat.includes('งานสารบรรณ') || title.includes('ระเบียบสารบรรณ')) && !isLaw54;
        }
      },
      law54: {
        countEl: 'bankQCount_law54',
        chapEl: 'bankChapBadge_law54',
        match: s => {
          const cat = s.category || '';
          const title = s.title || '';
          return cat.includes('๕๔') || cat.includes('54') || cat.includes('สารบรรณตำรวจ') || cat.includes('ลักษณะ') || title.includes('๕๔') || title.includes('54') || title.includes('สารบรรณตำรวจ');
        }
      }
    };

    Object.values(subjectsMap).forEach(sub => {
      const matched = sets.filter(sub.match);

      if (matched.length > 0) {
        const totalQ = matched.reduce((acc, s) => acc + (s.questionsCount || s.totalCount || 30), 0);
        const chapSet = new Set(matched.map(s => s.subcategory).filter(Boolean));
        const chapCount = chapSet.size;

        const countEl = document.getElementById(sub.countEl);
        const chapEl = document.getElementById(sub.chapEl);
        if (countEl) countEl.textContent = `${totalQ} ข้อในคลัง`;
        if (chapEl) chapEl.textContent = `${chapCount} บท`;
      }
    });
  } catch (e) {
    console.warn('Update bank subject counts warning:', e);
  }
};

// ==========================================
// Screen 2: Chapter Directory Panel
// ==========================================
window.startBankSubject = async function(subjectKey) {
  activeSubjectKey = subjectKey;
  currentSelectedBankSubject = subjectKey;

  const subjectsList = document.getElementById('questionBankSubjectsList');
  const chaptersList = document.getElementById('questionBankChaptersList');
  const examSetsList = document.getElementById('questionBankExamSetsList');

  if (subjectsList) subjectsList.style.display = 'none';
  if (examSetsList) examSetsList.style.display = 'none';
  if (chaptersList) chaptersList.style.display = 'block';

  const cfg = SUBJECT_CONFIG[subjectKey] || SUBJECT_CONFIG['งานสารบรรณ'];
  const titleEl = document.getElementById('currentSubjectChapterTitle');
  const subEl = document.getElementById('currentSubjectChapterSubtitle');
  const iconEl = document.getElementById('currentSubjectChapterIcon');

  if (titleEl) titleEl.textContent = cfg.title;
  if (subEl) subEl.textContent = cfg.subtitle;
  if (iconEl) iconEl.textContent = cfg.icon;

  try {
    const res = await fetch(`${API_BASE}/api/exams/sets?category=${encodeURIComponent(subjectKey)}&_t=${Date.now()}`);
    const sets = res.ok ? await res.json() : [];
    currentFetchedExamSets = Array.isArray(sets) ? sets : [];
    activeSubjectDBSets = currentFetchedExamSets;
  } catch (err) {
    currentFetchedExamSets = [];
    activeSubjectDBSets = [];
  }

  switchSubjectSubtab('examSets');
  renderSubjectChaptersGrid(subjectKey);
  updateSubjectStatsView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.backToBankSubjects = function() {
  const subjectsList = document.getElementById('questionBankSubjectsList');
  const chaptersList = document.getElementById('questionBankChaptersList');
  const examSetsList = document.getElementById('questionBankExamSetsList');

  if (chaptersList) chaptersList.style.display = 'none';
  if (examSetsList) examSetsList.style.display = 'none';
  if (subjectsList) subjectsList.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.switchSubjectSubtab = function(tabName) {
  const tabExamSets = document.getElementById('tabSubjectExamSets');
  const tabStats = document.getElementById('tabSubjectStats');
  const contentExamSets = document.getElementById('contentSubjectExamSets');
  const contentStats = document.getElementById('contentSubjectStats');

  if (tabName === 'examSets') {
    if (tabExamSets) tabExamSets.classList.add('active');
    if (tabStats) tabStats.classList.remove('active');
    if (contentExamSets) contentExamSets.style.display = 'block';
    if (contentStats) contentStats.style.display = 'none';
  } else {
    if (tabExamSets) tabExamSets.classList.remove('active');
    if (tabStats) tabStats.classList.add('active');
    if (contentExamSets) contentExamSets.style.display = 'none';
    if (contentStats) contentStats.style.display = 'block';
    updateSubjectStatsView();
  }
};

function renderSubjectChaptersGrid(subjectKey) {
  const container = document.getElementById('chaptersContainer');
  if (!container) return;

  // Build chapters list: Prefer real subcategories from activeSubjectDBSets if available, otherwise use BANK_SUBJECT_CHAPTERS or SUBJECT_CONFIG
  let chaptersList = [];
  if (Array.isArray(activeSubjectDBSets) && activeSubjectDBSets.length > 0) {
    const subcats = activeSubjectDBSets
      .map(s => (s.subcategory || s.title || '').trim())
      .filter(s => Boolean(s) && !s.includes('รวมทุก'));
    chaptersList = Array.from(new Set(subcats));
  }

  if (chaptersList.length === 0) {
    chaptersList = (typeof BANK_SUBJECT_CHAPTERS !== 'undefined' && BANK_SUBJECT_CHAPTERS[subjectKey]) || (SUBJECT_CONFIG[subjectKey]?.chapters || []).filter(c => c !== 'ทุกหมวด') || [];
  }

  if (chaptersList.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; background: white; border-radius: 20px; border: 1.5px dashed #CBD5E1; color: #64748B;">
        <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
        <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #0F172A;">ยังไม่มีบทเรียนในวิชานี้</h4>
        <p style="margin: 0; font-size: 13px; color: #94A3B8;">กำลังจัดเตรียมบทเรียนและข้อสอบจริง</p>
      </div>
    `;
    return;
  }

  const chaptersHTML = chaptersList.map((rawTitle, idx) => {
    const chapterNumber = idx + 1;
    // Clean display title: remove redundant prefix if present like 'บทที่ 1 '
    let displayTitle = rawTitle.replace(/^บทที่\s*[\d๑-๙]+[\s:\-\.]*/i, '').trim();
    if (!displayTitle) displayTitle = rawTitle;

    // Count matching questions/sets
    const matchingSets = (activeSubjectDBSets || []).filter(s =>
      s.subcategory === rawTitle ||
      (s.title && s.title.includes(rawTitle)) ||
      (rawTitle.includes(s.subcategory || '___xyz___'))
    );
    const qCount = matchingSets.reduce((sum, s) => sum + (s.questionsCount || 30), 0) || 30;

    return `
      <div class="chapter-card" onclick="openChapterExamSets('${escapeHTML(rawTitle)}', ${chapterNumber})"
        style="background: #FFFFFF; border-bottom: 1px solid #F1F5F9; padding: 18px 8px; display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; transition: all 0.15s ease;">
        <div style="display: flex; align-items: center; gap: 18px; flex: 1; min-width: 0;">
          <div style="font-size: 18px; font-weight: 800; color: #DC2626; width: 22px; text-align: center; flex-shrink: 0; font-family: inherit;">
            ${chapterNumber}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: -0.01em; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHTML(displayTitle)}
            </div>
            <div style="margin-top: 3px; font-size: 12.5px; color: #94A3B8; font-weight: 500;">
              ${qCount} ข้อ
            </div>
          </div>
        </div>
        <div style="color: #CBD5E1; font-size: 18px; font-weight: 600; flex-shrink: 0; padding-right: 4px;">
          ›
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = chaptersHTML;
}

// ==========================================
// Screen 3: Exam Sets List for Selected Chapter
// ==========================================
window.openChapterExamSets = function(chapterName, chapterIdx) {
  activeChapterTitle = chapterName;
  currentSelectedChapter = chapterName;

  const chaptersPanel = document.getElementById('questionBankChaptersList');
  const examSetsPanel = document.getElementById('questionBankExamSetsList');

  if (chaptersPanel) chaptersPanel.style.display = 'none';
  if (examSetsPanel) examSetsPanel.style.display = 'block';

  let cleanChapterName = chapterName.replace(/^บทที่\s*[\d๑-๙]+[\s:\-\.]*/i, '').trim();
  if (!cleanChapterName) cleanChapterName = chapterName;

  const titleEl = document.getElementById('currentExamSetsChapterTitle');
  const subtitleEl = document.getElementById('currentExamSetsChapterSubtitle');
  if (titleEl) titleEl.textContent = cleanChapterName;
  if (subtitleEl) subtitleEl.textContent = `วิชา${activeSubjectKey}`;

  renderExamSetsList(chapterName);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.backToChaptersList = function() {
  const chaptersPanel = document.getElementById('questionBankChaptersList');
  const examSetsPanel = document.getElementById('questionBankExamSetsList');

  if (examSetsPanel) examSetsPanel.style.display = 'none';
  if (chaptersPanel) chaptersPanel.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function renderExamSetsList(chapterName) {
  const container = document.getElementById('examSetsContainer');
  if (!container) return;

  const cfg = SUBJECT_CONFIG[activeSubjectKey] || SUBJECT_CONFIG['งานสารบรรณ'];

  let matchingDBSets = (activeSubjectDBSets || []).filter(s =>
    s.subcategory === chapterName ||
    (s.title && s.title.includes(chapterName)) ||
    (chapterName.includes(s.subcategory || '___xyz___'))
  );

  let setsToRender = [];
  if (matchingDBSets.length > 0) {
    setsToRender = matchingDBSets.map((s, idx) => ({
      id: s.id.toString().startsWith('db_') ? s.id : `db_${s.id}`,
      title: s.title,
      chapter: s.subcategory || chapterName,
      count: s.questionsCount || 30,
      time: `${s.timeMinutes || 30} นาที`,
      isRealDB: true
    }));
  } else {
    let cleanChapter = chapterName.replace(/^บทที่\s*[\d๑-๙]+[\s:\-\.]*/i, '').trim();
    if (!cleanChapter) cleanChapter = chapterName;
    setsToRender = [
      {
        id: `custom_${activeSubjectKey}_1`,
        title: `แบบทดสอบ: ${cleanChapter} (ชุดที่ 1)`,
        chapter: chapterName,
        count: 30,
        time: '30 นาที',
        isRealDB: false
      }
    ];
  }

  container.innerHTML = setsToRender.map((s, idx) => {
    const setNum = idx + 1;
    const questionsCount = s.count || 30;

    let cleanTitle = s.title.replace(/^แบบทดสอบ[^:]*:\s*/i, '').trim();
    if (!cleanTitle) cleanTitle = s.title;

    return `
      <div class="chapter-card" onclick="launchSelectedExamSet('${activeSubjectKey}', '${s.id}', ${questionsCount}, '${escapeHTML(s.title)}')"
        style="background: #FFFFFF; border-bottom: 1px solid #F1F5F9; padding: 18px 8px; display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; transition: all 0.15s ease;">
        <div style="display: flex; align-items: center; gap: 18px; flex: 1; min-width: 0;">
          <div style="font-size: 18px; font-weight: 800; color: #DC2626; width: 22px; text-align: center; flex-shrink: 0; font-family: inherit;">
            ${setNum}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: -0.01em; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHTML(cleanTitle)}
            </div>
            <div style="margin-top: 3px; font-size: 12.5px; color: #94A3B8; font-weight: 500;">
              ${questionsCount} ข้อ
            </div>
          </div>
        </div>
        <div style="color: #CBD5E1; font-size: 18px; font-weight: 600; flex-shrink: 0; padding-right: 4px;">
          ›
        </div>
      </div>
    `;
  }).join('');
}

window.launchSelectedExamSet = function(subjectKey, setId, questionsCount, setTitle) {
  const chapterName = activeChapterTitle || setTitle || '';
  const url = `exam.html?subject=${encodeURIComponent(subjectKey)}&setId=${encodeURIComponent(setId)}&count=${questionsCount || 30}&chapter=${encodeURIComponent(chapterName)}&title=${encodeURIComponent(setTitle || '')}&source=bank.html`;
  window.location.href = url;
};

// ==========================================
// Subject Stats Helper
// ==========================================
function updateSubjectStatsView() {
  const attemptsEl = document.getElementById('subjStatAttempts');
  const avgEl = document.getElementById('subjStatAvgScore');
  const bestEl = document.getElementById('subjStatBestScore');
  const bestBar = document.getElementById('subjStatBestBar');
  const avgBar = document.getElementById('subjStatAvgBar');
  const masteryEl = document.getElementById('subjStatMastery');

  const history = getLocalQuizHistory(activeSubjectKey);
  const allScores = history
    .map(h => typeof h.scorePct === 'number' ? h.scorePct : Math.round(((h.correctCount || h.score || 0) / (h.totalQuestions || h.total || 25)) * 100))
    .filter(s => !isNaN(s) && s >= 0);

  if (allScores.length > 0) {
    const totalAttempts = allScores.length;
    const bestScore = Math.max(...allScores);
    const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / totalAttempts);

    if (attemptsEl) attemptsEl.textContent = `${totalAttempts}`;
    if (bestEl) bestEl.textContent = `${bestScore}`;
    if (avgEl) avgEl.textContent = `${avgScore}`;
    if (bestBar) bestBar.style.width = `${Math.min(bestScore, 100)}%`;
    if (avgBar) avgBar.style.width = `${Math.min(avgScore, 100)}%`;

    if (masteryEl) {
      if (avgScore >= 80) {
        masteryEl.textContent = 'ดีมาก';
        masteryEl.style.color = '#16A34A';
      } else if (avgScore >= 60) {
        masteryEl.textContent = 'ปานกลาง';
        masteryEl.style.color = '#2563EB';
      } else if (avgScore >= 40) {
        masteryEl.textContent = 'พอใช้';
        masteryEl.style.color = '#EA580C';
      } else {
        masteryEl.textContent = 'เริ่มต้น';
        masteryEl.style.color = '#64748B';
      }
    }
  } else {
    if (attemptsEl) attemptsEl.textContent = '0';
    if (bestEl) bestEl.textContent = '0';
    if (avgEl) avgEl.textContent = '0';
    if (bestBar) bestBar.style.width = '0%';
    if (avgBar) avgBar.style.width = '0%';
    if (masteryEl) {
      masteryEl.textContent = 'ยังไม่เริ่ม';
      masteryEl.style.color = '#94A3B8';
    }
  }
}

// ==========================================
// Quiz Countdown Timer
// ==========================================
function startQuizCountdownTimer(durationSeconds) {
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
    quizTimerInterval = null;
  }

  const timerBadge = document.getElementById('quizTimerBadge');
  const timerText = document.getElementById('quizTimerText');
  if (!timerBadge || !timerText) return;

  quizRemainingSeconds = durationSeconds;
  timerBadge.style.display = 'inline-flex';
  timerBadge.style.background = '#FFF1F2';
  timerBadge.style.borderColor = '#FDA4AF';
  timerBadge.style.color = '#E11D48';

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  timerText.textContent = formatTime(quizRemainingSeconds);

  quizTimerInterval = setInterval(() => {
    quizRemainingSeconds--;
    if (quizRemainingSeconds <= 0) {
      clearInterval(quizTimerInterval);
      quizTimerInterval = null;
      timerText.textContent = '00:00:00';
      alert('⏰ หมดเวลาการทำข้อสอบแล้ว! ระบบจะสรุปผลคะแนนให้ทันที');
      renderQuizResults();
      return;
    }

    timerText.textContent = formatTime(quizRemainingSeconds);
    if (quizRemainingSeconds <= 600) {
      timerBadge.style.background = '#FEF2F2';
      timerBadge.style.borderColor = '#EF4444';
      timerBadge.style.color = '#DC2626';
    }
  }, 1000);
}

function stopQuizCountdownTimer() {
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
    quizTimerInterval = null;
  }
  const timerBadge = document.getElementById('quizTimerBadge');
  if (timerBadge) timerBadge.style.display = 'none';
}

// ==========================================
// Exam Runner (Modal & Questions Engine)
// ==========================================
window.startBankSubjectQuiz = function(subjectKey, setId, questionsCount, setTitle) {
  const chapterName = activeChapterTitle || setTitle || '';
  const url = `exam.html?subject=${encodeURIComponent(subjectKey)}&setId=${encodeURIComponent(setId)}&count=${questionsCount || 30}&chapter=${encodeURIComponent(chapterName)}&title=${encodeURIComponent(setTitle || '')}&source=bank.html`;
  window.location.href = url;
};


window.closeSubjectQuiz = function() {
  if (currentQuizState && !currentQuizState.isSubmitted && currentQuizState.questions && currentQuizState.questions.length > 0 && Object.keys(currentQuizState.userAnswers || {}).length > 0) {
    if (!confirm('คุณกำลังทำข้อสอบอยู่ หากปิดหน้านี้ ข้อสอบจะไม่ถูกบันทึกคะแนน\nคุณต้องการปิดหรือไม่?')) {
      return;
    }
  }
  stopQuizCountdownTimer();
  const modal = document.getElementById('subjectQuizModal');
  if (modal) modal.style.display = 'none';
  if (currentSelectedBankSubject) {
    renderSubjectChaptersGrid(currentSelectedBankSubject);
  }
};

function renderCurrentQuizQuestion() {
  const { questions, currentIndex, userAnswers, isReviewMode } = currentQuizState;
  const bodyContent = document.getElementById('quizBodyContent');
  const stepText = document.getElementById('quizStepText');
  const answeredLabel = document.getElementById('quizAnsweredCountLabel');
  const btnPrev = document.getElementById('btnPrevQuiz');
  const btnNext = document.getElementById('btnNextQuiz');
  const progressBar = document.getElementById('quizProgressBar');

  if (!questions || questions.length === 0 || currentIndex >= questions.length) {
    renderQuizResults();
    return;
  }

  const q = questions[currentIndex];
  const total = questions.length;
  const answeredCount = Object.keys(userAnswers || {}).length;
  const progressPct = Math.round(((currentIndex + 1) / total) * 100);

  if (progressBar) progressBar.style.width = `${progressPct}%`;
  
  if (isReviewMode) {
    const userAns = userAnswers[currentIndex];
    const isCorrect = userAns === q.correctAnswer;
    if (stepText) {
      stepText.textContent = `${currentIndex + 1} / ${total}`;
    }
    const scoreTextEl = document.getElementById('quizScoreText');
    if (scoreTextEl) {
      scoreTextEl.textContent = `${currentQuizState.score || 0} ถูก`;
    }
    if (answeredLabel) {
      answeredLabel.textContent = `คะแนนรวม: ${currentQuizState.score || 0}/${total} ข้อ`;
    }
  } else {
    if (stepText) stepText.textContent = `${currentIndex + 1} / ${total}`;
    const scoreTextEl = document.getElementById('quizScoreText');
    if (scoreTextEl) {
      scoreTextEl.textContent = `0 ถูก`;
    }
    if (answeredLabel) answeredLabel.textContent = `ทำแล้ว ${answeredCount}/${total} ข้อ`;
  }

  const selectedAnswer = userAnswers[currentIndex];
  const actionRow = document.getElementById('quizActionButtonsRow');
  const navContainer = document.getElementById('quizNavContainer');
  if (actionRow) actionRow.style.display = 'flex';
  if (navContainer) navContainer.style.display = 'block';

  if (btnPrev) {
    btnPrev.style.display = 'flex';
    btnPrev.disabled = currentIndex === 0;
    btnPrev.style.opacity = currentIndex === 0 ? '0.35' : '1';
    btnPrev.style.cursor = currentIndex === 0 ? 'not-allowed' : 'pointer';
    btnPrev.innerHTML = '<span>‹ ข้อก่อนหน้า</span>';
  }

  if (btnNext) {
    btnNext.style.display = 'flex';
    if (isReviewMode) {
      btnNext.innerHTML = (currentIndex === total - 1) ? '<span>📊 ดูสรุปผลคะแนน</span>' : '<span>ข้อถัดไป →</span>';
    } else {
      btnNext.innerHTML = (currentIndex === total - 1) ? '<span>ส่งข้อสอบ</span>' : '<span>ข้อถัดไป →</span>';
    }
  }

  const thaiLetters = ['ก', 'ข', 'ค', 'ง'];
  const choicesList = q.choices || [q.choice1, q.choice2, q.choice3, q.choice4];
  let choicesHtml = choicesList.map((choiceText, idx) => {
    const choiceNum = idx + 1;
    const thaiLetter = thaiLetters[idx] || `${choiceNum}`;

    let containerStyle = 'background: #FFFFFF; border: 1.5px solid #E2E8F0; color: #64748B;';
    let badgeStyle = 'background: #F1F5F9; color: #94A3B8;';

    if (isReviewMode) {
      if (choiceNum === q.correctAnswer) {
        containerStyle = 'background: #ECFDF5; border: 2px solid #059669; color: #065F46; font-weight: 700;';
        badgeStyle = 'background: #059669; color: #FFFFFF; font-weight: 800;';
      } else if (choiceNum === selectedAnswer) {
        containerStyle = 'background: #FEF2F2; border: 2px solid #DC2626; color: #991B1B; font-weight: 700;';
        badgeStyle = 'background: #DC2626; color: #FFFFFF; font-weight: 800;';
      } else {
        containerStyle = 'background: #FFFFFF; border: 1.5px solid #E2E8F0; color: #94A3B8; opacity: 0.6;';
        badgeStyle = 'background: #F1F5F9; color: #94A3B8;';
      }
    } else {
      if (choiceNum === selectedAnswer) {
        containerStyle = 'background: #FEF2F2; border: 2px solid #C62828; color: #991B1B; font-weight: 700; box-shadow: 0 2px 8px rgba(198, 40, 40, 0.1);';
        badgeStyle = 'background: #C62828; color: #FFFFFF; font-weight: 800;';
      } else {
        containerStyle = 'background: #FFFFFF; border: 1.5px solid #E2E8F0; color: #64748B;';
        badgeStyle = 'background: #F1F5F9; color: #94A3B8; font-weight: 700;';
      }
    }

    return `
      <button onclick="selectQuizAnswer(${choiceNum})" ${isReviewMode ? 'disabled' : ''} style="${containerStyle} width: 100%; text-align: left; padding: 13px 14px; border-radius: 18px; font-size: 14.5px; font-family: inherit; margin-bottom: 10px; cursor: ${isReviewMode ? 'default' : 'pointer'}; transition: all 0.15s ease; display: flex; align-items: center; gap: 14px; line-height: 1.45;">
        <span style="${badgeStyle} width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;">${thaiLetter}</span>
        <span style="flex: 1; font-weight: inherit;">${escapeHTML(choiceText || '')}</span>
      </button>
    `;
  }).join('');

  let explanationHtml = '';
  if (isReviewMode && q.explanation) {
    const isCorrect = selectedAnswer === q.correctAnswer;
    explanationHtml = `
      <div style="margin-top: 14px; background: ${isCorrect ? '#ECFDF5' : '#FFFBEB'}; border: 1.5px solid ${isCorrect ? '#A7F3D0' : '#FDE68A'}; border-radius: 16px; padding: 14px 16px; font-size: 13px; color: ${isCorrect ? '#065F46' : '#92400E'}; line-height: 1.6;">
        <div style="font-weight: 800; font-size: 13.5px; margin-bottom: 4px;">💡 คำอธิบายเฉลยอย่างละเอียด:</div>
        ${escapeHTML(q.explanation)}
      </div>
    `;
  }

  bodyContent.innerHTML = `
    <div>
      <div class="question-title" style="font-size: 15.5px; font-weight: 500; color: #1E293B; line-height: 1.68; margin-top: 0; margin-bottom: 18px;">
        ${typeof formatQuestionTextHtml === 'function' ? formatQuestionTextHtml(q.questionText) : escapeHTML(q.questionText)}
      </div>
      <div>${choicesHtml}</div>
      ${explanationHtml}
    </div>
  `;

  renderQuizQuestionNavGrid();
}

function renderQuizQuestionNavGrid() {
  const { questions, currentIndex, userAnswers, isReviewMode } = currentQuizState;
  const navGrid = document.getElementById('quizQuestionNavGrid');
  const navHint = document.getElementById('quizSummaryNavHint');
  if (!navGrid || !questions) return;

  if (navHint) {
    navHint.innerHTML = isReviewMode
      ? '<span style="color: #10B981; font-weight: 800;">● เขียว = ถูก</span> <span style="color: #EF4444; font-weight: 800; margin-left: 6px;">● แดง = ผิด</span>'
      : 'เลือกข้ามได้อิสระ';
  }

  navGrid.innerHTML = questions.map((q, idx) => {
    const qNum = idx + 1;
    const isCurrent = idx === currentIndex;
    const ans = userAnswers[idx];
    const isAnswered = ans !== undefined;

    let style = 'width: 100%; aspect-ratio: 1; border-radius: 9px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit; padding: 0;';

    if (isReviewMode) {
      const isCorrect = ans === q.correctAnswer;
      if (isCurrent) {
        style += isCorrect ? 'border: 2px solid #059669; background: #10B981; color: white;' : 'border: 2px solid #DC2626; background: #EF4444; color: white;';
      } else if (isCorrect) {
        style += 'border: 1.5px solid #10B981; background: #ECFDF5; color: #059669;';
      } else {
        style += 'border: 1.5px solid #EF4444; background: #FEF2F2; color: #DC2626;';
      }
    } else {
      if (isCurrent) {
        style += 'border: 2px solid #BD1B0B; background: #FEF2F2; color: #BD1B0B; font-weight: 800;';
      } else if (isAnswered) {
        style += 'border: 1.5px solid #3B82F6; background: #EFF6FF; color: #1D4ED8; font-weight: 700;';
      } else {
        style += 'border: 1.5px solid #E2E8F0; background: #FFFFFF; color: #64748B;';
      }
    }

    return `<button onclick="goToQuizQuestion(${idx})" style="${style}">${qNum}</button>`;
  }).join('');
}

window.goToQuizQuestion = function(index) {
  if (!currentQuizState.questions || index < 0 || index >= currentQuizState.questions.length) return;
  currentQuizState.currentIndex = index;
  renderCurrentQuizQuestion();
};

window.selectQuizAnswer = function(choiceNum) {
  if (currentQuizState.isReviewMode || currentQuizState.isSubmitted) return;
  currentQuizState.userAnswers[currentQuizState.currentIndex] = choiceNum;
  renderCurrentQuizQuestion();
};

window.prevQuizQuestion = function() {
  if (currentQuizState.currentIndex > 0) {
    currentQuizState.currentIndex--;
    renderCurrentQuizQuestion();
  }
};

window.nextQuizQuestion = function() {
  if (currentQuizState.isReviewMode) {
    if (currentQuizState.currentIndex < currentQuizState.questions.length - 1) {
      currentQuizState.currentIndex++;
      renderCurrentQuizQuestion();
    } else {
      renderQuizResults();
    }
    return;
  }

  if (currentQuizState.currentIndex < currentQuizState.questions.length - 1) {
    currentQuizState.currentIndex++;
    renderCurrentQuizQuestion();
  } else {
    submitQuizExam();
  }
};

window.submitQuizExam = function() {
  const { questions, userAnswers } = currentQuizState;
  const total = questions ? questions.length : 0;
  const answeredCount = Object.keys(userAnswers || {}).length;

  if (answeredCount < total) {
    const unans = total - answeredCount;
    if (!confirm(`⚠️ คุณยังไม่ได้ตอบอีก ${unans} ข้อ (ทำไปแล้ว ${answeredCount}/${total} ข้อ)\n\nคุณแน่ใจหรือไม่ว่าต้องการส่งข้อสอบเพื่อตรวจคะแนนและดูเฉลย?`)) {
      return;
    }
  }

  currentQuizState.isSubmitted = true;
  currentQuizState.isReviewMode = false;
  renderQuizResults();
};

window.startQuizReviewMode = function() {
  if (!currentQuizState || !currentQuizState.questions) return;
  currentQuizState.isReviewMode = true;
  currentQuizState.currentIndex = 0;

  const actionRow = document.getElementById('quizActionButtonsRow');
  const navContainer = document.getElementById('quizNavContainer');
  if (actionRow) actionRow.style.display = 'flex';
  if (navContainer) navContainer.style.display = 'block';

  renderCurrentQuizQuestion();
};

function renderQuizResults() {
  stopQuizCountdownTimer();
  currentQuizState.isSubmitted = true;
  currentQuizState.isReviewMode = false;

  const { subjectKey, setId, setTitle, questions } = currentQuizState;
  const bodyContent = document.getElementById('quizBodyContent');
  const stepText = document.getElementById('quizStepText');
  const progressBar = document.getElementById('quizProgressBar');

  if (!bodyContent) return;

  const total = questions ? questions.length : 0;
  let correctCount = 0;
  if (questions && questions.length > 0) {
    questions.forEach((q, idx) => {
      if (currentQuizState.userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
  }
  currentQuizState.score = correctCount;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const actionRow = document.getElementById('quizActionButtonsRow');
  const navContainer = document.getElementById('quizNavContainer');
  if (actionRow) actionRow.style.display = 'none';
  if (navContainer) navContainer.style.display = 'none';
  if (stepText) stepText.textContent = 'สรุปผลสอบ';
  if (progressBar) progressBar.style.width = '100%';

  const finishIso = new Date().toISOString();
  saveQuizHistoryRecord({
    subject: subjectKey,
    setId,
    setTitle,
    scorePct: pct,
    correctCount,
    totalQuestions: total,
    createdAt: finishIso,
    timestamp: Date.now(),
    date: finishIso
  });

  const pass = pct >= 60;

  bodyContent.innerHTML = `
    <div style="text-align: center; padding: 20px 10px;">
      <div style="font-size: 56px; margin-bottom: 12px;">${pass ? '🎉' : '💪'}</div>
      <h3 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0;">
        ${pass ? 'ยินดีด้วย! คุณผ่านเกณฑ์ทดสอบ' : 'พยายามอีกนิด ทบทวนและฝึกฝนใหม่'}
      </h3>
      <p style="font-size: 13.5px; color: #64748B; margin: 0 0 24px 0;">${escapeHTML(setTitle)}</p>

      <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 20px; padding: 22px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div style="text-align: center;">
          <div style="font-size: 28px; font-weight: 900; color: ${pass ? '#059669' : '#DC2626'};">${correctCount}/${total}</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 4px; font-weight: 600;">คะแนนที่ได้</div>
        </div>
        <div style="text-align: center; border-left: 1.5px solid #E2E8F0;">
          <div style="font-size: 28px; font-weight: 900; color: ${pass ? '#059669' : '#DC2626'};">${pct}%</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 4px; font-weight: 600;">คิดเป็นร้อยละ</div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: center;">
        <button onclick="startQuizReviewMode()" style="flex: 1; background: #BD1B0B; color: white; border: none; padding: 13px 16px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit;">
          📖 ตรวจเฉลยละเอียด
        </button>
        <button onclick="closeSubjectQuiz()" style="flex: 1; background: #F1F5F9; color: #334155; border: 1.5px solid #CBD5E1; padding: 13px 16px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit;">
          ✕ ปิดหน้าต่าง
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// Report Question Modal
// ==========================================
window.openReportCurrentQuestionModal = function() {
  const modal = document.getElementById('reportQuestionModal');
  if (modal) modal.style.display = 'flex';
};

window.closeReportQuestionModal = function() {
  const modal = document.getElementById('reportQuestionModal');
  if (modal) modal.style.display = 'none';
};

window.submitQuestionReport = async function() {
  const noteEl = document.getElementById('reportQuestionNote');
  const typeEl = document.getElementById('reportQuestionType');
  const note = noteEl ? noteEl.value.trim() : '';
  const type = typeEl ? typeEl.value : 'WRONG_ANSWER';

  if (!note) {
    alert('กรุณากรอกรายละเอียดข้อผิดพลาด');
    return;
  }

  const q = (currentQuizState && currentQuizState.questions && currentQuizState.questions[currentQuizState.currentIndex]) || {};
  const questionId = String(q.id || `bank_${Date.now()}`);
  const questionText = q.questionText || q.question || 'ข้อสอบจากคลังข้อสอบ';
  const qNum = (currentQuizState && currentQuizState.currentIndex !== undefined) ? currentQuizState.currentIndex + 1 : 1;

  const payloadReason = {
    subject: activeSubjectKey || 'หมวดคลังข้อสอบ',
    chapter: activeChapterTitle || '-',
    questionNumber: qNum,
    reasonType: type === 'WRONG_ANSWER' ? 'เฉลยคำตอบผิดพลาด' : (type === 'TYPO_ERROR' ? 'พิมพ์ผิด / ข้อความตกหล่น' : (type === 'AMBIGUOUS' ? 'โจทย์กำกวม' : type)),
    details: note,
    choices: q.choices || [q.choice1, q.choice2, q.choice3, q.choice4],
    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 1,
    explanation: q.explanation || ''
  };

  try {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/user/reports`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        questionId,
        questionText,
        reason: JSON.stringify(payloadReason)
      })
    });

    if (res.ok) {
      alert('✅ ขอบคุณสำหรับข้อมูล! รายงานข้อผิดพลาดส่งไปยังทีมผู้ตรวจเรียบร้อยแล้ว');
      closeReportQuestionModal();
      if (noteEl) noteEl.value = '';
    } else {
      const data = await res.json().catch(() => ({}));
      alert('❌ ไม่สามารถส่งรายงานได้: ' + (data.error || 'เกิดข้อผิดพลาด'));
    }
  } catch (err) {
    console.error('Submit report question error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message);
  }
};

// ==========================================
// Local History Helpers
// ==========================================
function getLocalQuizHistory(subjectKey) {
  try {
    const raw = localStorage.getItem('userQuizHistory');
    let localList = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(localList)) localList = [];

    const sNorm = (subjectKey || '').replace(/[\s_]/g, '').replace('กฏ', 'กฎ');
    return localList.filter(h => {
      const hSub = (h.subject || '').replace(/[\s_]/g, '').replace('กฏ', 'กฎ');
      const hTitle = (h.setTitle || '').replace(/[\s_]/g, '').replace('กฏ', 'กฎ');
      if (hSub === sNorm || hSub.includes(sNorm) || sNorm.includes(hSub)) return true;
      if (hTitle.includes(sNorm)) return true;
      return false;
    });
  } catch (e) {
    return [];
  }
}

async function saveQuizHistoryRecord(record) {
  try {
    const token = localStorage.getItem('authToken');
    const raw = localStorage.getItem('userQuizHistory');
    let list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    list.unshift(record);
    localStorage.setItem('userQuizHistory', JSON.stringify(list.slice(0, 100)));

    if (token) {
      fetch(`${API_BASE}/api/user/record-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(record)
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Save quiz history error:', e);
  }
}

// ==========================================
// Initialize on page load
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  window.renderExamBankList();
  window.updateBankSubjectCounts();
});
