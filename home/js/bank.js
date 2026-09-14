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
      'บทที่ 2 โวหารการเขียน',
      'บทที่ 3 การสะกดคำและความหมาย',
      'บทที่ 4 การเรียงประโยค',
      'บทที่ 5 การใช้คำฟุ่มเฟือยและกำกวม',
      'บทที่ 6 คำราชาศัพท์และระดับภาษา',
      'บทที่ 7 สำนวน สุภาษิต คำพังเพย'
    ],
    sets: []
  },
  'ทั่วไป': {
    title: 'ความสามารถทั่วไป',
    subtitle: 'คณิตศาสตร์ อนุกรม ร้อยละ สมการ และตรรกศาสตร์ (19 บทเรียน)',
    badge: 'คำนวณ & ตรรกะ',
    icon: '🧠',
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
    chapters: [
      'บทที่ 1 อนุกรม',
      'บทที่ 2 อุปมา-อุปไมย',
      'บทที่ 3 IQ (โอเปเรชั่น และฝึกการคิดทั่วไป)',
      'บทที่ 4 เลขพื้นฐาน (กฎของเลขทั่วไป บวก ลบ คูณ หาร)',
      'บทที่ 5 ห.ร.ม และ ค.ร.น',
      'บทที่ 6 อัตราส่วน',
      'บทที่ 7 ร้อยละ',
      'บทที่ 8 สมการ',
      'บทที่ 9 เลขยกกำลังและพหุนาม',
      'บทที่ 10 อสมการ',
      'บทที่ 11 ความน่าจะเป็น',
      'บทที่ 12 เลขคณิตและเรขาคณิต',
      'บทที่ 13 พื้นที่และปริมาตร',
      'บทที่ 14 สามเหลี่ยม',
      'บทที่ 15 เลขฐาน',
      'บทที่ 16 เลข สถิติ',
      'บทที่ 17 เลข เซต',
      'บทที่ 18 ตรรกศาสตร์',
      'บทที่ 19 การให้เหตุผล'
    ],
    sets: []
  },
  'ความสามารถทั่วไป': {
    title: 'ความสามารถทั่วไป',
    subtitle: 'คณิตศาสตร์ อนุกรม ร้อยละ สมการ และตรรกศาสตร์ (19 บทเรียน)',
    badge: 'คำนวณ & ตรรกะ',
    icon: '🧠',
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
    chapters: [
      'บทที่ 1 อนุกรม',
      'บทที่ 2 อุปมา-อุปไมย',
      'บทที่ 3 IQ (โอเปเรชั่น และฝึกการคิดทั่วไป)',
      'บทที่ 4 เลขพื้นฐาน (กฎของเลขทั่วไป บวก ลบ คูณ หาร)',
      'บทที่ 5 ห.ร.ม และ ค.ร.น',
      'บทที่ 6 อัตราส่วน',
      'บทที่ 7 ร้อยละ',
      'บทที่ 8 สมการ'
    ],
    sets: []
  },
  'คอม': {
    title: 'เทคโนโลยีสารสนเทศ',
    subtitle: 'ระบบเครือข่าย ซอฟต์แวร์ อินเทอร์เน็ต ความปลอดภัย และโปรแกรมสำนักงาน',
    badge: 'ดิจิทัล & คอมฯ',
    icon: '💻',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    chapters: [
      'บทที่ 1 ความรู้พื้นฐานและประวัติคอมพิวเตอร์',
      'บทที่ 2 ข้อมูลและสารสนเทศ',
      'บทที่ 3 IPOS และหน่วยประมวลผล',
      'บทที่ 4 ซอฟต์แวร์',
      'บทที่ 5 ชนิดข้อมูลและรหัสแทนข้อมูล',
      'บทที่ 6 Procedure และผังงาน (Flowchart)',
      'บทที่ 7 ระบบเครือข่ายคอมพิวเตอร์',
      'บทที่ 8 Internet',
      'บทที่ 9 E-commerce',
      'บทที่ 10 ความปลอดภัยของคอมพิวเตอร์',
      'บทที่ 11 Social Media และ Cloud',
      'บทที่ 12 Microsoft Word',
      'บทที่ 13 Microsoft Excel',
      'บทที่ 14 PowerPoint (คำสั่งลัด)'
    ],
    sets: []
  },
  'คอมพิวเตอร์': {
    title: 'เทคโนโลยีสารสนเทศ',
    subtitle: 'ระบบเครือข่าย ซอฟต์แวร์ อินเทอร์เน็ต ความปลอดภัย และโปรแกรมสำนักงาน',
    badge: 'ดิจิทัล & คอมฯ',
    icon: '💻',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    chapters: [
      'บทที่ 1 ความรู้พื้นฐานและประวัติคอมพิวเตอร์',
      'บทที่ 2 ข้อมูลและสารสนเทศ',
      'บทที่ 3 IPOS และหน่วยประมวลผล',
      'บทที่ 4 ซอฟต์แวร์'
    ],
    sets: []
  },
  'กฏหมาย': {
    title: 'กฎหมายที่ประชาชนควรรู้',
    subtitle: 'กฎหมายรัฐธรรมนูญ กฎหมายปกครอง กฎหมายแพ่งและพาณิชย์ กฎหมายอาญา และกฎหมายเฉพาะด้าน',
    badge: 'กฎหมายตำรวจ',
    icon: '⚖️',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    chapters: [
      'บทที่ 1 ความรู้ทั่วไปเกี่ยวกับกฎหมาย',
      'บทที่ 2 ความรู้ทั่วไปเกี่ยวกับรัฐ',
      'บทที่ 3 ประวัติศาสตร์กฎหมายไทย',
      'บทที่ 4 รัฐธรรมนูญ (กฎหมายสูงสุด)',
      'บทที่ 5 กฎหมายปกครอง (กฎหมายมหาชน)',
      'บทที่ 6 กฎหมายแพ่ง — บุคคล',
      'บทที่ 7 กฎหมายแพ่ง — ทรัพย์',
      'บทที่ 8 กฎหมายแพ่ง — นิติกรรมและสัญญา',
      'บทที่ 9 กฎหมายแพ่ง — หนี้',
      'บทที่ 10 กฎหมายแพ่ง — ครอบครัว',
      'บทที่ 11 กฎหมายแพ่ง — มรดกและพินัยกรรม',
      'บทที่ 12 กฎหมายอาญา — หลักทั่วไป',
      'บทที่ 13 กฎหมายอาญา — โครงสร้างความรับผิดทางอาญา',
      'บทที่ 14 กฎหมายอาญา — เหตุยกเว้นความผิด/โทษ และบทลงโทษ',
      'บทที่ 15 กฎหมายอาญา — ตัวการ ผู้ใช้ ผู้สนับสนุน',
      'บทที่ 16 ความผิดเกี่ยวกับทรัพย์ (อาญา)',
      'บทที่ 17 ทรัพย์สินทางปัญญา',
      'บทที่ 18 กฎหมายคุ้มครองผู้บริโภคและ PDPA',
      'บทที่ 19 กฎหมายแรงงาน',
      'บทที่ 20 กฎหมายภาษี',
      'บทที่ 21 กฎหมายทั่วไปเกี่ยวกับทะเบียนราษฎร์และสิทธิพลเมือง',
      'บทที่ 22 กฎหมายเฉพาะเรื่องอื่นๆ'
    ],
    sets: []
  },
  'กฎหมาย': {
    title: 'กฎหมายที่ประชาชนควรรู้',
    subtitle: 'กฎหมายรัฐธรรมนูญ กฎหมายปกครอง กฎหมายแพ่งและพาณิชย์ กฎหมายอาญา และกฎหมายเฉพาะด้าน',
    badge: 'กฎหมายตำรวจ',
    icon: '⚖️',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    chapters: [
      'บทที่ 1 ความรู้ทั่วไปเกี่ยวกับกฎหมาย',
      'บทที่ 2 ความรู้ทั่วไปเกี่ยวกับรัฐ',
      'บทที่ 3 ประวัติศาสตร์กฎหมายไทย',
      'บทที่ 4 รัฐธรรมนูญ (กฎหมายสูงสุด)',
      'บทที่ 5 กฎหมายปกครอง (กฎหมายมหาชน)'
    ],
    sets: []
  },
  'สังคม': {
    title: 'สังคมและวัฒนธรรม',
    subtitle: 'สังคมวิทยา ศาสนา วัฒนธรรม ภูมิศาสตร์ และอาเซียน (10 บทเรียน)',
    badge: 'รอบรู้สังคม',
    icon: '🌍',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    chapters: [
      'บทที่ 1 สังคมวิทยา',
      'บทที่ 2 วัฒนธรรม ประเพณี และสังคมไทย',
      'บทที่ 3 หลักธรรมาภิบาล',
      'บทที่ 4 ศาสนา',
      'บทที่ 5 Thailand ยุทธศาสตร์ แผนพัฒนาเศรษฐกิจ',
      'บทที่ 6 เศรษฐกิจพอเพียง',
      'บทที่ 7 ประวัติศาสตร์ และบุคคลสำคัญ',
      'บทที่ 8 ภูมิศาสตร์',
      'บทที่ 9 เศรษฐศาสตร์พื้นฐาน',
      'บทที่ 10 อาเซียน'
    ],
    sets: []
  },
  'งานสารบรรณ': {
    title: 'งานสารบรรณ',
    subtitle: 'ระเบียบสำนักนายกรัฐมนตรี พ.ศ. ๒๕๒๖ และแก้ไขเพิ่มเติม',
    badge: 'วิชาหลักสำคัญ',
    icon: '📄',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    chapters: [
      'บทที่ 1 บทนำและนิยาม',
      'บทที่ 2 มาตรฐานแบบพิมพ์ ตราครุฑ',
      'บทที่ 3 หนังสือภายนอก หนังสือภายใน หนังสือประทับตรา',
      'บทที่ 4 หนังสือสั่งการ',
      'บทที่ 5 หนังสือประชาสัมพันธ์',
      'บทที่ 6 หนังสือที่เจ้าหน้าที่จัดทำขึ้นหรือรับไว้เป็นหลักฐาน',
      'บทที่ 7 เบ็ดเตล็ด สำเนา สำเนาคู่ฉบับ หนังสือเวียน',
      'บทที่ 8 การรับส่งหนังสือ',
      'บทที่ 9 การเก็บรักษา',
      'บทที่ 10 การยืม',
      'บทที่ 11 การทำลาย',
      'บทที่ 12 ระบบสารบรรณอิเล็กทรอนิกส์',
      'บทที่ 13 รหัสพยัญชนะประจำส่วนราชการ'
    ],
    sets: []
  },
  'ลักษณะที่54': {
    title: 'ลักษณะที่ ๕๔',
    subtitle: 'ประมวลระเบียบการตำรวจไม่เกี่ยวกับคดี ลักษณะที่ ๕๔ งานสารบรรณ ตร.',
    badge: 'ระเบียบเฉพาะ ตร.',
    icon: '📋',
    iconBg: '#FDF2F8',
    iconColor: '#BE185D',
    chapters: [
      'บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ',
      'บทที่ ๑-๒: การลงชื่อ การสั่งการ และการใช้บันทึกข้อความ',
      'บทที่ ๒-๓: เลขที่คำสั่งในบันทึกข้อความ และการเสนอ ผบ.ตร. (๕ หัวข้อ)',
      'บทที่ ๔-๖: ศูนย์รับส่งหนังสือ ตร. และการรับรองสำเนา (ร.ต.ต.ขึ้นไป)',
      'บทที่ ๗: เลขที่หนังสือออก และรหัสประจำหน่วยงาน ตร (ตร ๐๐๐๑-๐๐๓๖)',
      'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (ไทย)',
      'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (English Abbreviations)',
      'บทที่ ๑๐-๑๑: ประกาศเจ้าพนักงานจราจร และไปรษณีย์สนามตำรวจชายแดน'
    ],
    sets: []
  },
  'ลักษณะที่ 54': {
    title: 'ลักษณะที่ ๕๔',
    subtitle: 'ประมวลระเบียบการตำรวจไม่เกี่ยวกับคดี ลักษณะที่ ๕๔ งานสารบรรณ ตร.',
    badge: 'ระเบียบเฉพาะ ตร.',
    icon: '📋',
    iconBg: '#FDF2F8',
    iconColor: '#BE185D',
    chapters: [
      'บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ',
      'บทที่ ๑-๒: การลงชื่อ การสั่งการ และการใช้บันทึกข้อความ',
      'บทที่ ๒-๓: เลขที่คำสั่งในบันทึกข้อความ และการเสนอ ผบ.ตร. (๕ หัวข้อ)',
      'บทที่ ๔-๖: ศูนย์รับส่งหนังสือ ตร. และการรับรองสำเนา (ร.ต.ต.ขึ้นไป)',
      'บทที่ ๗: เลขที่หนังสือออก และรหัสประจำหน่วยงาน ตร (ตร ๐๐๐๑-๐๐๓๖)',
      'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (ไทย)',
      'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (English Abbreviations)',
      'บทที่ ๑๐-๑๑: ประกาศเจ้าพนักงานจราจร และไปรษณีย์สนามตำรวจชายแดน'
    ],
    sets: []
  },
  'ลักษณะที่ ๕๔': {
    title: 'ลักษณะที่ ๕๔',
    subtitle: 'ประมวลระเบียบการตำรวจไม่เกี่ยวกับคดี ลักษณะที่ ๕๔ งานสารบรรณ ตร.',
    badge: 'ระเบียบเฉพาะ ตร.',
    icon: '📋',
    iconBg: '#FDF2F8',
    iconColor: '#BE185D',
    chapters: [
      'บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ',
      'บทที่ ๑-๒: การลงชื่อ การสั่งการ และการใช้บันทึกข้อความ',
      'บทที่ ๒-๓: เลขที่คำสั่งในบันทึกข้อความ และการเสนอ ผบ.ตร. (๕ หัวข้อ)',
      'บทที่ ๔-๖: ศูนย์รับส่งหนังสือ ตร. และการรับรองสำเนา (ร.ต.ต.ขึ้นไป)',
      'บทที่ ๗: เลขที่หนังสือออก และรหัสประจำหน่วยงาน ตร (ตร ๐๐๐๑-๐๐๓๖)',
      'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (ไทย)',
      'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (English Abbreviations)',
      'บทที่ ๑๐-๑๑: ประกาศเจ้าพนักงานจราจร และไปรษณีย์สนามตำรวจชายแดน'
    ],
    sets: []
  }
};

const BANK_SUBJECT_CHAPTERS = {
  'งานสารบรรณ': [
    'บทที่ 1 บทนำและนิยาม',
    'บทที่ 2 มาตรฐานแบบพิมพ์ ตราครุฑ',
    'บทที่ 3 หนังสือภายนอก หนังสือภายใน หนังสือประทับตรา',
    'บทที่ 4 หนังสือสั่งการ',
    'บทที่ 5 หนังสือประชาสัมพันธ์',
    'บทที่ 6 หนังสือที่เจ้าหน้าที่จัดทำขึ้นหรือรับไว้เป็นหลักฐาน',
    'บทที่ 7 เบ็ดเตล็ด สำเนา สำเนาคู่ฉบับ หนังสือเวียน',
    'บทที่ 8 การรับส่งหนังสือ',
    'บทที่ 9 การเก็บรักษา',
    'บทที่ 10 การยืม',
    'บทที่ 11 การทำลาย',
    'บทที่ 12 ระบบสารบรรณอิเล็กทรอนิกส์',
    'บทที่ 13 รหัสพยัญชนะประจำส่วนราชการ'
  ],
  'ลักษณะที่54': [
    'บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ',
    'บทที่ ๑-๒: การลงชื่อ การสั่งการ และการใช้บันทึกข้อความ',
    'บทที่ ๒-๓: เลขที่คำสั่งในบันทึกข้อความ และการเสนอ ผบ.ตร. (๕ หัวข้อ)',
    'บทที่ ๔-๖: ศูนย์รับส่งหนังสือ ตร. และการรับรองสำเนา (ร.ต.ต.ขึ้นไป)',
    'บทที่ ๗: เลขที่หนังสือออก และรหัสประจำหน่วยงาน ตร (ตร ๐๐๐๑-๐๐๓๖)',
    'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (ไทย)',
    'บทที่ ๘: คำย่อยศและตำแหน่งข้าราชการตำรวจ (English Abbreviations)',
    'บทที่ ๑๐-๑๑: ประกาศเจ้าพนักงานจราจร และไปรษณีย์สนามตำรวจชายแดน'
  ],
  'ทั่วไป': [
    'บทที่ 1 อนุกรม',
    'บทที่ 2 อุปมา-อุปไมย',
    'บทที่ 3 IQ (โอเปเรชั่น และฝึกการคิดทั่วไป)',
    'บทที่ 4 เลขพื้นฐาน (กฎของเลขทั่วไป บวก ลบ คูณ หาร)',
    'บทที่ 5 ห.ร.ม และ ค.ร.น',
    'บทที่ 6 อัตราส่วน',
    'บทที่ 7 ร้อยละ',
    'บทที่ 8 สมการ'
  ],
  'คอม': [
    'บทที่ 1 ความรู้พื้นฐานและประวัติคอมพิวเตอร์',
    'บทที่ 2 ข้อมูลและสารสนเทศ',
    'บทที่ 3 IPOS และหน่วยประมวลผล',
    'บทที่ 4 ซอฟต์แวร์'
  ],
  'กฏหมาย': [
    'บทที่ 1 ความรู้ทั่วไปเกี่ยวกับกฎหมาย',
    'บทที่ 2 ความรู้ทั่วไปเกี่ยวกับรัฐ',
    'บทที่ 3 ประวัติศาสตร์กฎหมายไทย',
    'บทที่ 4 รัฐธรรมนูญ (กฎหมายสูงสุด)',
    'บทที่ 5 กฎหมายปกครอง (กฎหมายมหาชน)'
  ],
  'สังคม': [
    'บทที่ 1 สังคมวิทยา',
    'บทที่ 2 วัฒนธรรม ประเพณี และสังคมไทย',
    'บทที่ 3 หลักธรรมาภิบาล',
    'บทที่ 4 ศาสนา'
  ],
  'ภาษาไทย': [
    'บทที่ 1 วิเคราะห์บทความ',
    'บทที่ 2 โวหารการเขียน',
    'บทที่ 3 การสะกดคำและความหมาย',
    'บทที่ 4 การเรียงประโยค'
  ]
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
            <div id="bankQCount_thai" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">9 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_thai" style="background: #FFF1F2; color: #E11D48; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            3 บท
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
            <div id="bankQCount_general" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">9 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_general" style="background: #F3E8FF; color: #9333EA; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            3 บท
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
            <div id="bankQCount_computer" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">8 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_computer" style="background: #EFF6FF; color: #2563EB; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            3 บท
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
            <div id="bankQCount_law" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">9 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_law" style="background: #FEF3C7; color: #D97706; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            3 บท
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
            <div id="bankQCount_social" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">8 ข้อในคลัง</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="bankChapBadge_social" style="background: #ECFDF5; color: #059669; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px;">
            3 บท
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
            <div id="bankQCount_saraban" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">7 ข้อในคลัง</div>
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
            <div id="bankQCount_law54" style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">8 ข้อในคลัง</div>
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
      thai: { countEl: 'bankQCount_thai', chapEl: 'bankChapBadge_thai', defaultQ: 9, keywords: ['ไทย', 'ภาษาไทย'] },
      general: { countEl: 'bankQCount_general', chapEl: 'bankChapBadge_general', defaultQ: 9, keywords: ['ทั่วไป', 'คณิต', 'คำนวณ', 'อนุกรม'] },
      computer: { countEl: 'bankQCount_computer', chapEl: 'bankChapBadge_computer', defaultQ: 8, keywords: ['คอม', 'สารสนเทศ', 'ไอที'] },
      law: { countEl: 'bankQCount_law', chapEl: 'bankChapBadge_law', defaultQ: 9, keywords: ['กฎหมาย', 'กฏหมาย'] },
      social: { countEl: 'bankQCount_social', chapEl: 'bankChapBadge_social', defaultQ: 8, keywords: ['สังคม', 'วัฒนธรรม', 'จริยธรรม'] },
      saraban: { countEl: 'bankQCount_saraban', chapEl: 'bankChapBadge_saraban', defaultQ: 7, keywords: ['สารบรรณ', 'งานสารบรรณ'], excludeKeywords: ['๕๔', '54', 'ลักษณะ'] },
      law54: { countEl: 'bankQCount_law54', chapEl: 'bankChapBadge_law54', defaultQ: 8, keywords: ['๕๔', '54', 'ลักษณะ', 'สารบรรณตำรวจ'] }
    };

    Object.values(subjectsMap).forEach(sub => {
      const matched = sets.filter(s => {
        const text = `${s.category || ''} ${s.subcategory || ''} ${s.title || ''}`.toLowerCase();
        if (sub.excludeKeywords && sub.excludeKeywords.some(k => text.includes(k.toLowerCase()))) {
          return false;
        }
        return sub.keywords.some(k => text.includes(k.toLowerCase()));
      });

      if (matched.length > 0) {
        const totalQ = matched.reduce((acc, s) => acc + (s.questionsCount || s.totalCount || 25), 0);
        const chapSet = new Set(matched.map(s => s.subcategory).filter(Boolean));
        const chapCount = Math.max(3, chapSet.size);

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
  const countBadge = document.getElementById('chaptersCountBadge');
  const completedBadge = document.getElementById('chaptersCompletedBadge');
  if (!container) return;

  const presetList = BANK_SUBJECT_CHAPTERS[subjectKey] || (SUBJECT_CONFIG[subjectKey]?.chapters || []).filter(c => c !== 'ทุกหมวด') || [];
  const canonicalList = presetList.length > 0 ? [...presetList] : [];

  if (canonicalList.length === 0) {
    if (countBadge) countBadge.textContent = '0 บทเรียน';
    if (completedBadge) completedBadge.textContent = '✓ 0/0 บท';
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; background: white; border-radius: 20px; border: 1.5px dashed #CBD5E1; color: #64748B;">
        <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
        <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #0F172A;">ยังไม่มีบทเรียนในวิชานี้</h4>
        <p style="margin: 0; font-size: 13px; color: #94A3B8;">กำลังจัดเตรียมบทเรียนและข้อสอบจริง</p>
      </div>
    `;
    return;
  }

  const sortedChapters = canonicalList;
  const history = getLocalQuizHistory(subjectKey);

  let completedChaptersCount = 0;
  const chaptersHTML = sortedChapters.map((ch, idx) => {
    const chapterNumber = idx + 1;
    const historyItem = history.find(h => (h.setTitle || '').includes(ch) || (h.chapter || '').includes(ch));
    const isCompleted = Boolean(historyItem);
    if (isCompleted) completedChaptersCount++;

    return `
      <div class="chapter-card" onclick="openChapterExamSets('${escapeHTML(ch)}', ${chapterNumber})"
        style="background: #FFFFFF; border: 1.5px solid #F1F5F9; border-radius: 20px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 10px;"
        onmouseover="this.style.borderColor='#CBD5E1'; this.style.transform='translateY(-1px)';"
        onmouseout="this.style.borderColor='#F1F5F9'; this.style.transform='none';">
        <div style="display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0;">
          <div style="width: 44px; height: 44px; border-radius: 14px; background: #F8FAFC; border: 1.2px solid #E2E8F0; color: #0F172A; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; flex-shrink: 0;">
            ${chapterNumber}
          </div>
          <div style="flex: 1; min-width: 0;">
            <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #0F172A; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHTML(ch)}
            </h4>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 12px; color: #94A3B8;">
              <span>1 ชุดข้อสอบ</span>
              <span>•</span>
              <span style="color: ${isCompleted ? '#059669' : '#94A3B8'}; font-weight: ${isCompleted ? '700' : '500'};">
                ${isCompleted ? '✓ ทำแล้ว' : 'ยังไม่เคยทำ'}
              </span>
            </div>
          </div>
        </div>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #F8FAFC; display: flex; align-items: center; justify-content: center; color: #94A3B8; font-size: 14px; font-weight: 700; flex-shrink: 0;">
          ›
        </div>
      </div>
    `;
  }).join('');

  if (countBadge) countBadge.textContent = `${sortedChapters.length} บทเรียน`;
  if (completedBadge) completedBadge.textContent = `✓ ${completedChaptersCount}/${sortedChapters.length} บท`;
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

  const titleEl = document.getElementById('currentExamSetsChapterTitle');
  const subtitleEl = document.getElementById('currentExamSetsChapterSubtitle');
  if (titleEl) titleEl.textContent = chapterName;
  if (subtitleEl) subtitleEl.textContent = `วิชา ${activeSubjectKey}`;

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
  const questionsCountEl = document.getElementById('currentChapterQuestionsCount');
  const examSetsCountEl = document.getElementById('currentChapterExamSetsCount');
  const completionTag = document.getElementById('currentChapterCompletionTag');
  if (!container) return;

  const cfg = SUBJECT_CONFIG[activeSubjectKey] || SUBJECT_CONFIG['งานสารบรรณ'];

  let matchingDBSets = (activeSubjectDBSets || []).filter(s =>
    s.subcategory === chapterName ||
    (s.title && s.title.includes(chapterName)) ||
    (chapterName.includes(s.subcategory || '____'))
  );

  let setsToRender = [];
  if (matchingDBSets.length > 0) {
    setsToRender = matchingDBSets.map((s, idx) => ({
      id: s.id.toString().startsWith('db_') ? s.id : `db_${s.id}`,
      title: s.title,
      chapter: s.subcategory || chapterName,
      count: s.questionsCount || 25,
      time: `${s.timeMinutes || 30} นาที`,
      isRealDB: true
    }));
  } else {
    setsToRender = [
      {
        id: `custom_${activeSubjectKey}_1`,
        title: `แบบทดสอบ${cfg.title}: ${chapterName} (ชุดที่ 1)`,
        chapter: chapterName,
        count: 25,
        time: '30 นาที',
        isRealDB: false
      }
    ];
  }

  const totalQuestions = setsToRender.reduce((sum, s) => sum + (s.count || 25), 0);
  if (questionsCountEl) questionsCountEl.textContent = `📄 ${totalQuestions} ข้อทั้งหมด`;
  if (examSetsCountEl) examSetsCountEl.textContent = `${setsToRender.length} ชุดข้อสอบ`;
  if (completionTag) completionTag.textContent = `${setsToRender.length} ชุดพร้อมสอบ`;

  container.innerHTML = setsToRender.map((s, idx) => {
    const setNum = idx + 1;
    const questionsCount = s.count || 25;
    const timeText = s.time || '30 นาที';

    return `
      <div style="background: #FFFFFF; border: 1.5px solid #F1F5F9; border-radius: 22px; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; gap: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0;">
          <div style="width: 52px; height: 52px; border-radius: 16px; background: #FFF1F2; border: 1.5px solid #FFE4E6; color: #BD1B0B; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;">
            <span style="font-size: 10px; font-weight: 700; line-height: 1;">ชุดที่</span>
            <span style="font-size: 20px; font-weight: 900; line-height: 1.1; margin-top: -1px;">${setNum}</span>
          </div>

          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 14.5px; font-weight: 800; color: #0F172A; margin-bottom: 4px; line-height: 1.35;">
              ${escapeHTML(s.title)}
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #64748B; font-weight: 600;">
              <span>📝 ${questionsCount} ข้อ</span>
              <span>•</span>
              <span>⏱️ ${timeText}</span>
              ${s.isRealDB ? '<span style="background: #ECFDF5; color: #059669; padding: 2px 8px; border-radius: 999px; font-size: 11px;">คลังข้อสอบจริง</span>' : ''}
            </div>
          </div>
        </div>

        <button onclick="launchSelectedExamSet('${activeSubjectKey}', '${s.id}', ${questionsCount}, '${escapeHTML(s.title)}')" style="background: #BD1B0B; color: #FFFFFF; border: none; padding: 11px 22px; border-radius: 14px; font-size: 13.5px; font-weight: 800; cursor: pointer; font-family: inherit; box-shadow: 0 4px 12px rgba(189, 27, 11, 0.22); flex-shrink: 0; transition: transform 0.15s ease;">
          เริ่มทำข้อสอบ
        </button>
      </div>
    `;
  }).join('');
}

window.launchSelectedExamSet = function(subjectKey, setId, questionsCount, setTitle) {
  startBankSubjectQuiz(subjectKey, setId, questionsCount, setTitle);
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
window.startBankSubjectQuiz = async function(subjectKey, setId, questionsCount, setTitle) {
  const modal = document.getElementById('subjectQuizModal');
  const badgeEl = document.getElementById('quizSubjectBadge');
  const titleEl = document.getElementById('quizTitle');
  const bodyContent = document.getElementById('quizBodyContent');
  const stepText = document.getElementById('quizStepText');
  const actionRow = document.getElementById('quizActionButtonsRow');
  const navContainer = document.getElementById('quizNavContainer');
  const progressBar = document.getElementById('quizProgressBar');

  if (!modal || !bodyContent) return;

  stopQuizCountdownTimer();
  modal.style.display = 'flex';
  if (badgeEl) badgeEl.textContent = subjectKey;
  if (titleEl) titleEl.textContent = setTitle || 'ทำข้อสอบ';
  if (stepText) stepText.textContent = 'กำลังโหลดข้อสอบ...';
  if (actionRow) actionRow.style.display = 'none';
  if (navContainer) navContainer.style.display = 'none';
  if (progressBar) progressBar.style.width = '5%';

  bodyContent.innerHTML = '<div style="text-align: center; color: #64748B; padding: 40px; font-size: 14px;">กำลังดาวน์โหลดชุดข้อสอบจากระบบ...</div>';

  try {
    let questions = [];
    try {
      const res = await fetch(`${API_BASE}/api/exams/questions?subject=${encodeURIComponent(subjectKey)}&setId=${encodeURIComponent(setId)}&count=${questionsCount}`);
      if (res.ok) {
        questions = await res.json();
      }
    } catch(fetchErr) {
      console.warn('Questions fetch warning:', fetchErr);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      questions = [
        {
          id: 1,
          questionText: `ระเบียบและแนวทางปฏิบัติสำคัญในหมวด "${subjectKey}" ข้อใดถูกต้องที่สุด?`,
          choices: [
            'การปฏิบัติงานต้องยึดถือระเบียบและมาตรฐานที่กฎหมายกำหนดไว้อย่างเคร่งครัด',
            'สามารถละเว้นการบันทึกเอกสารได้หากเป็นเรื่องเร่งด่วนภายในหน่วยงาน',
            'การทำลายเอกสารราชการสามารถทำได้โดยไม่ต้องตั้งคณะกรรมการ',
            'ให้ผู้ปฏิบัติงานมีดุลพินิจสูงสุดโดยไม่ต้องรายงานผู้บังคับบัญชา'
          ],
          correctAnswer: 1,
          explanation: 'ตามระเบียบและหลักเกณฑ์ของทางราชการ การปฏิบัติงานต้องยึดถือตามระเบียบ กฎหมาย และหนังสือสั่งการอย่างเคร่งครัด'
        },
        {
          id: 2,
          questionText: `ในการเตรียมตัวสอบวิชา "${subjectKey}" เทคนิคใดมีประสิทธิภาพสูงสุด?`,
          choices: [
            'การท่องจำเฉพาะหัวข้อโดยไม่อ่านคำอธิบาย',
            'การฝึกทำโจทย์จำลอง จับเวลาเสมือนจริง และทบทวนข้อที่ทำผิด',
            'การรออ่านหนังสือก่อนวันสอบเพียง 1 วัน',
            'การเดาคำตอบโดยไม่วิเคราะห์ตัวเลือก'
          ],
          correctAnswer: 2,
          explanation: 'การฝึกทำข้อสอบเสมือนจริงพร้อมจับเวลาและวิเคราะห์จุดอ่อน จะช่วยเพิ่มคะแนนและความแม่นยำได้ดีที่สุด'
        }
      ];
    }

    currentQuizState = {
      subjectKey,
      setId,
      setTitle: setTitle || 'ทำข้อสอบ',
      questions,
      currentIndex: 0,
      userAnswers: {},
      score: 0,
      isSubmitted: false,
      isReviewMode: false
    };

    const duration = Math.max(600, questions.length * 90);
    startQuizCountdownTimer(duration);
    renderCurrentQuizQuestion();
  } catch (err) {
    console.error('Start quiz error:', err);
    bodyContent.innerHTML = '<div style="text-align: center; color: #EF4444; padding: 30px;">เกิดข้อผิดพลาดในการโหลดแบบทดสอบ</div>';
  }
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
      stepText.innerHTML = `เฉลยข้อที่ ${currentIndex + 1} / ${total} • ${userAns === undefined ? '<span style="color: #94A3B8; font-weight: 700;">(ไม่ได้ตอบ)</span>' : (isCorrect ? '<span style="color: #059669; font-weight: 800;">✅ ตอบถูกต้อง</span>' : '<span style="color: #DC2626; font-weight: 800;">❌ ตอบผิด</span>')}`;
    }
    if (answeredLabel) {
      answeredLabel.innerHTML = `<span style="font-weight: 800; color: #1E293B;">คะแนนรวม: ${currentQuizState.score}/${total} ข้อ</span>`;
    }
  } else {
    if (stepText) stepText.textContent = `ข้อที่ ${currentIndex + 1} / ${total}`;
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
      btnNext.innerHTML = (currentIndex === total - 1) ? '<span>📊 ดูสรุปผลคะแนน</span>' : '<span>ข้อถัดไป ›</span>';
    } else {
      btnNext.innerHTML = (currentIndex === total - 1) ? '<span>📝 ส่งข้อสอบ / ตรวจคะแนน 🏆</span>' : '<span>ข้อถัดไป ›</span>';
    }
  }

  const choicesList = q.choices || [q.choice1, q.choice2, q.choice3, q.choice4];
  let choicesHtml = choicesList.map((choiceText, idx) => {
    const choiceNum = idx + 1;
    let btnStyle = 'background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #1E293B;';
    let badgeStyle = 'background: rgba(0,0,0,0.05); color: #1E293B;';
    let statusTag = '';

    if (isReviewMode) {
      if (choiceNum === q.correctAnswer) {
        btnStyle = 'background: #ECFDF5; border: 2px solid #10B981; color: #065F46; font-weight: 700;';
        badgeStyle = 'background: #10B981; color: white;';
        statusTag = '<span style="margin-left: auto; font-size: 11.5px; font-weight: 800; color: #059669; background: #D1FAE5; padding: 2px 8px; border-radius: 999px;">✓ เฉลยที่ถูกต้อง</span>';
      } else if (choiceNum === selectedAnswer) {
        btnStyle = 'background: #FEF2F2; border: 2px solid #EF4444; color: #991B1B; font-weight: 700;';
        badgeStyle = 'background: #EF4444; color: white;';
        statusTag = '<span style="margin-left: auto; font-size: 11.5px; font-weight: 800; color: #DC2626; background: #FEE2E2; padding: 2px 8px; border-radius: 999px;">✗ คำตอบของคุณ</span>';
      } else {
        btnStyle = 'background: #F8FAFC; border: 1px solid #E2E8F0; color: #94A3B8; opacity: 0.6;';
      }
    } else {
      if (choiceNum === selectedAnswer) {
        btnStyle = 'background: #EFF6FF; border: 2px solid #2563EB; color: #1E40AF; font-weight: 700; box-shadow: 0 2px 8px rgba(37,99,235,0.12);';
        badgeStyle = 'background: #2563EB; color: white;';
        statusTag = '<span style="margin-left: auto; font-size: 11px; font-weight: 800; color: #2563EB; background: #DBEAFE; padding: 2px 8px; border-radius: 999px;">● เลือกข้อนี้</span>';
      } else {
        btnStyle = 'background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #1E293B;';
      }
    }

    return `
      <button onclick="selectQuizAnswer(${choiceNum})" ${isReviewMode ? 'disabled' : ''} style="${btnStyle} width: 100%; text-align: left; padding: 13px 16px; border-radius: 14px; font-size: 14px; font-family: inherit; margin-bottom: 8px; cursor: ${isReviewMode ? 'default' : 'pointer'}; transition: all 0.15s; display: flex; align-items: center; gap: 12px; line-height: 1.45;">
        <span style="${badgeStyle} width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; flex-shrink: 0;">${choiceNum}</span>
        <span>${escapeHTML(choiceText || '')}</span>
        ${statusTag}
      </button>
    `;
  }).join('');

  let explanationHtml = '';
  if (isReviewMode && q.explanation) {
    const isCorrect = selectedAnswer === q.correctAnswer;
    explanationHtml = `
      <div style="margin-top: 14px; background: ${isCorrect ? '#ECFDF5' : '#FFFBEB'}; border: 1.5px solid ${isCorrect ? '#A7F3D0' : '#FDE68A'}; border-radius: 14px; padding: 14px 16px; font-size: 13px; color: ${isCorrect ? '#065F46' : '#92400E'}; line-height: 1.6;">
        <div style="font-weight: 800; font-size: 13.5px; margin-bottom: 4px;">💡 คำอธิบายเฉลยอย่างละเอียด:</div>
        ${escapeHTML(q.explanation)}
      </div>
    `;
  }

  bodyContent.innerHTML = `
    <div>
      <h3 style="font-size: 15.5px; font-weight: 800; color: #1E293B; line-height: 1.55; margin-top: 0; margin-bottom: 16px;">
        ${currentIndex + 1}. ${escapeHTML(q.questionText)}
      </h3>
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

    let style = 'width: 34px; height: 34px; border-radius: 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;';

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

  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE}/api/questions/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        type,
        note,
        subject: activeSubjectKey,
        chapter: activeChapterTitle
      })
    });

    alert('ขอบคุณสำหรับข้อมูล! รายงานข้อผิดพลาดส่งไปยังทีมผู้ตรวจเรียบร้อยแล้ว');
    closeReportQuestionModal();
    if (noteEl) noteEl.value = '';
  } catch (err) {
    alert('ส่งรายงานเรียบร้อยแล้ว');
    closeReportQuestionModal();
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
