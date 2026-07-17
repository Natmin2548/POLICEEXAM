import fs from 'fs';

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
