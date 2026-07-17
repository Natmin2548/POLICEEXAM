import pptxgen from 'pptxgenjs';

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
      desc: 'สะสมคลังคำศัพท์ภาษาอังกฤษตามระดับความยากง่าย (Vocab Arena) ช่วยยกระดับคะแนนที่ได้เปรียบ'
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
