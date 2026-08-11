const fs = require('fs');
const file = 'home/js/app.js';
let content = fs.readFileSync(file, 'utf8');

const target1 = `// Handle subject selection from Question Bank
window.startBankSubject = function(subjectName) {
  showCenteredAlert(\`เลือกทำข้อสอบวิชา: \${subjectName}\\n\\n(ระบบคลังข้อสอบกำลังพัฒนา)\`);
};`;

const replacement1 = `// State for question bank view
let currentBankState = 'subjects'; // 'subjects' or 'sets'

// Handle subject selection from Question Bank
window.startBankSubject = function(subjectName) {
  currentBankState = 'sets';
  document.getElementById('questionBankSubjectsList').style.display = 'none';
  document.getElementById('questionBankExamSetsList').style.display = 'block';
  document.querySelector('#questionBankView .profile-header-title').textContent = \`วิชา: \${subjectName}\`;
  document.getElementById('btnBackFromBank').textContent = 'กลับไปเลือกวิชา';
  
  const container = document.getElementById('examSetsContainer');
  let html = '';
  // Generate mock exam sets
  for(let i=1; i<=5; i++) {
    html += \`
      <div style="background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 12px;">
        <div>
          <div style="font-weight: 700; color: #1E293B; font-size: 16px;">ชุดข้อสอบที่ \${i}</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 4px;">จำนวน 20 ข้อ • \${subjectName}</div>
        </div>
        <button onclick="startSpecificExam('\${subjectName}', \${i})" style="background: #0F172A; color: white; border: none; padding: 8px 16px; border-radius: 12px; font-weight: 700; cursor: pointer; font-family: inherit;">เริ่มทำ</button>
      </div>
    \`;
  }
  container.innerHTML = html;
};

// Handle exam set start
window.startSpecificExam = function(subject, setNum) {
  showCenteredAlert(\`กำลังเริ่มทำข้อสอบ\\nวิชา: \${subject}\\nชุดที่: \${setNum}\\n\\n(ระบบข้อสอบกำลังพัฒนา)\`);
};`;

const target2 = `if (btnBackFromBank) {
  btnBackFromBank.addEventListener('click', () => {
    if (questionBankView) questionBankView.classList.remove('active');
    if (homeView) homeView.classList.add('active');
    
    navTabs.forEach(t => t.classList.remove('active'));
    if (homeTabBtn) homeTabBtn.classList.add('active');
  });
}`;

const replacement2 = `if (btnBackFromBank) {
  btnBackFromBank.addEventListener('click', () => {
    if (currentBankState === 'sets') {
      // Go back to subjects grid
      document.getElementById('questionBankExamSetsList').style.display = 'none';
      document.getElementById('questionBankSubjectsList').style.display = 'block';
      document.querySelector('#questionBankView .profile-header-title').textContent = 'คลังข้อสอบ';
      document.getElementById('btnBackFromBank').textContent = 'กลับหน้าหลัก';
      currentBankState = 'subjects';
    } else {
      // Close question bank and return to home
      if (questionBankView) questionBankView.classList.remove('active');
      if (homeView) homeView.classList.add('active');
      
      navTabs.forEach(t => t.classList.remove('active'));
      if (homeTabBtn) homeTabBtn.classList.add('active');
    }
  });
}`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated app.js using write_to_file script');
