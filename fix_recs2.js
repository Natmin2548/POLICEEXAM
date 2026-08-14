const fs = require('fs');

let appJs = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', 'utf8');

const target = `  const recsContainer = document.getElementById('aiRecsListContainer');
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

      recsHtml += \`
        <div class="ai-rec-item \${ratingClass}">
          <span class="ai-rec-icon">!</span>
          <div class="ai-rec-content">
            <div class="ai-rec-title-row">
              <span class="ai-rec-subject">\${fullSubName}</span>
              <span class="ai-rec-score" style="font-weight: 600;">\${sub.score}/100</span>
            </div>
            <p class="ai-rec-text">\${sub.rec}</p>
          </div>
        </div>
      \`;
    });

    recsContainer.innerHTML = recsHtml;
  }`;

const replacement = `  const recsContainer = document.getElementById('aiRecsListContainer');
  if (recsContainer) {
    recsContainer.innerHTML = '<div style="text-align: center; color: var(--text-light); padding: 20px; font-size: 13px;">คำแนะนำกำลังจะมาในเร็วๆ นี้...</div>';
  }`;

if (appJs.includes("const recsContainer = document.getElementById('aiRecsListContainer');")) {
  appJs = appJs.replace(target, replacement);
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/app.js', appJs);
  console.log('app.js updated successfully');
} else {
  console.log('Target not found');
}
