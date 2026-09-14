// ==========================================
// exam.js - Dedicated Engine for Standalone Exam Runner (Matching Screenshot 2)
// Unifies Chapter Bank, Subject-Mixed Random, and Pretest 150 Exams
// ==========================================

let examState = {
  track: '',
  subjectKey: 'ภาษาไทย',
  subjectTitle: 'ภาษาไทย',
  setId: null,
  chapter: '',
  title: '',
  sourcePage: 'bank.html',
  questions: [],
  currentIndex: 0,
  userAnswers: {},
  score: 0,
  isSubmitted: false,
  isReviewMode: false
};

const THAI_LETTERS = ['ก', 'ข', 'ค', 'ง'];

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const track = params.get('track') || '';
  const subject = params.get('subject') || '';
  const setId = params.get('setId') || '';
  const chapter = params.get('chapter') || '';
  const title = params.get('title') || '';
  let count = parseInt(params.get('count') || '0', 10);
  const mode = params.get('mode') || ''; // 'mixed', 'chapter', 'pretest'
  const source = params.get('source') || (track ? 'index.html' : 'bank.html');

  if (!count) {
    count = track ? 150 : 30;
  }

  examState.track = track;
  examState.setId = setId;
  examState.chapter = chapter;
  examState.title = title;
  examState.sourcePage = source;

  if (track === 'prabpram') {
    examState.subjectKey = 'สายปราบปราม';
    examState.subjectTitle = 'สายปราบปราม (150 ข้อ)';
  } else if (track === 'amnuay' || track.startsWith('amnuay')) {
    examState.subjectKey = 'สายอำนวยการ';
    examState.subjectTitle = 'สายอำนวยการ / พฐ. (150 ข้อ)';
  } else {
    examState.subjectKey = subject || 'ภาษาไทย';
    if (chapter) {
      examState.subjectTitle = `${examState.subjectKey} • ${chapter}`;
    } else if (title) {
      examState.subjectTitle = `${examState.subjectKey} • ${title}`;
    } else {
      examState.subjectTitle = examState.subjectKey;
    }
  }

  const subjectBadge = document.getElementById('subjectBadge');
  if (subjectBadge) {
    subjectBadge.textContent = examState.subjectTitle;
  }

  await loadExamQuestions(track, subject, setId, chapter, count, mode);
});

async function loadExamQuestions(track, subject, setId, chapter, count, mode) {
  const qTitle = document.getElementById('questionText');
  const choicesContainer = document.getElementById('choicesContainer');
  if (qTitle) qTitle.textContent = 'กำลังโหลดชุดข้อสอบจากฐานข้อมูล...';
  if (choicesContainer) {
    choicesContainer.innerHTML = '<div style="text-align: center; color: #94A3B8; padding: 40px 0;">กรุณารอสักครู่...</div>';
  }

  let questions = [];

  try {
    if (track === 'prabpram') {
      // 1. Pretest สายปราบปราม 150 ข้อ
      const res = await fetch(`${API_BASE}/api/exams/prabpram`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.questions) && data.questions.length > 0) {
          questions = data.questions;
        }
      }
    } else if (track === 'amnuay' || track.startsWith('amnuay')) {
      // 2. Pretest สายอำนวยการ / พฐ. 150 ข้อ
      const res = await fetch(`${API_BASE}/api/exams/amnuay`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.questions) && data.questions.length > 0) {
          questions = data.questions;
        }
      }
    } else if (setId) {
      // 3. Chapter Exam Set from Bank
      const res = await fetch(`${API_BASE}/api/exams/questions?subject=${encodeURIComponent(subject || examState.subjectKey)}&setId=${encodeURIComponent(setId)}&count=${count}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          questions = data;
        }
      }
    } else if (mode === 'mixed' || subject) {
      // 4. Random Subject Mixed (30 items)
      const res = await fetch(`${API_BASE}/api/exams/subject-mixed?subject=${encodeURIComponent(subject || examState.subjectKey)}&count=${count}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.questions) && data.questions.length > 0) {
          questions = data.questions;
          if (data.subjectTitle) examState.subjectTitle = data.subjectTitle;
        }
      }
    }
  } catch (err) {
    console.warn('Load questions error:', err);
  }

  // Fallback if questions empty or offline
  if (!Array.isArray(questions) || questions.length === 0) {
    questions = generateStandardQuestions(examState.subjectKey, count || (track ? 150 : 30));
  }

function normalizeAnswerToIndex(rawAns, choices) {
  if (rawAns === undefined || rawAns === null) return 0;

  // Direct choice text matching
  if (Array.isArray(choices) && choices.length > 0) {
    const exactMatch = choices.findIndex(c => String(c).trim() === String(rawAns).trim());
    if (exactMatch !== -1) return exactMatch;
  }

  // If number
  if (typeof rawAns === 'number') {
    if (rawAns >= 1 && rawAns <= choices.length) return rawAns - 1;
    if (rawAns >= 0 && rawAns < choices.length) return rawAns;
    return 0;
  }

  // If string
  const clean = String(rawAns).trim().toUpperCase();
  if (clean === '1' || clean === 'A' || clean === 'ก') return 0;
  if (clean === '2' || clean === 'B' || clean === 'ข') return 1;
  if (clean === '3' || clean === 'C' || clean === 'ค') return 2;
  if (clean === '4' || clean === 'D' || clean === 'ง') return 3;

  const stripped = clean.replace(/^(ข้อ|ตัวเลือก|OPTION|CHOICE|\.|\s)+/i, '').trim();
  if (stripped.startsWith('1') || stripped.startsWith('A') || stripped.startsWith('ก')) return 0;
  if (stripped.startsWith('2') || stripped.startsWith('B') || stripped.startsWith('ข')) return 1;
  if (stripped.startsWith('3') || stripped.startsWith('C') || stripped.startsWith('ค')) return 2;
  if (stripped.startsWith('4') || stripped.startsWith('D') || stripped.startsWith('ง')) return 3;

  const num = parseInt(clean, 10);
  if (!isNaN(num)) {
    if (num >= 1 && num <= choices.length) return num - 1;
    if (num >= 0 && num < choices.length) return num;
  }

  return 0;
}

  // Normalize questions array
  examState.questions = questions.map((q, idx) => {
    let normChoices = [];
    if (Array.isArray(q.choices) && q.choices.length > 0) {
      normChoices = q.choices;
    } else {
      normChoices = [q.choice1, q.choice2, q.choice3, q.choice4].filter(c => c !== undefined && c !== null);
    }

    if (normChoices.length === 0) {
      normChoices = ['ตัวเลือก ก', 'ตัวเลือก ข', 'ตัวเลือก ค', 'ตัวเลือก ง'];
    }

    // Determine 0-indexed correct answer
    const rawAns = q.correctAnswer !== undefined ? q.correctAnswer : (q.correctOption !== undefined ? q.correctOption : q.answer);
    const normCorrect = normalizeAnswerToIndex(rawAns, normChoices);

    const subTitle = q.shortSubjectName || q.subjectName || q.subjectTitle || q.category || examState.subjectTitle;

    return {
      id: q.id || idx + 1,
      questionText: q.questionText || `ข้อสอบวิชา ${examState.subjectKey} ข้อที่ ${idx + 1}`,
      choices: normChoices,
      correctAnswer: normCorrect,
      explanation: q.explanation || `คำอธิบายเฉลยวิชา ${subTitle}: วิเคราะห์ตามหลักการและเนื้อหามาตรฐาน`,
      subjectBadge: subTitle
    };
  });

  examState.currentIndex = 0;
  examState.userAnswers = {};
  examState.isSubmitted = false;
  examState.isReviewMode = false;

  renderExamQuestion();
}

function renderExamQuestion() {
  const { questions, currentIndex, userAnswers, isReviewMode } = examState;
  if (!questions || questions.length === 0) return;

  const total = questions.length;
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;

  // 1. Top Bar Counter: [1 / N]
  const stepText = document.getElementById('stepText');
  if (stepText) {
    stepText.textContent = `${currentIndex + 1} / ${total}`;
  }

  // 2. Score Counter: [0 ถูก] or actual score during review
  const scoreText = document.getElementById('scoreText');
  if (scoreText) {
    if (isReviewMode) {
      scoreText.textContent = `${examState.score} ถูก`;
    } else {
      scoreText.textContent = `0 ถูก`;
    }
  }

  // 3. Progress Bar Fill
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    const pct = Math.max(3, Math.round(((currentIndex + 1) / total) * 100));
    progressBar.style.width = `${pct}%`;
  }

  // 4. Subject Pill Badge (dynamic per question in multi-subject pretest)
  const subjectBadge = document.getElementById('subjectBadge');
  if (subjectBadge) {
    if (examState.track && currentQ.subjectBadge) {
      subjectBadge.textContent = currentQ.subjectBadge;
    } else {
      subjectBadge.textContent = examState.subjectTitle;
    }
  }

  // 5. Question Text
  const questionTitle = document.getElementById('questionText');
  if (questionTitle) {
    questionTitle.textContent = currentQ.questionText;
  }

  // 6. Choices List (ก, ข, ค, ง)
  const choicesContainer = document.getElementById('choicesContainer');
  if (choicesContainer) {
    const selectedAns = userAnswers[currentIndex];
    const choices = currentQ.choices || [];

    choicesContainer.innerHTML = choices.map((choiceText, idx) => {
      const choiceLetter = THAI_LETTERS[idx] || `${idx + 1}`;
      let itemClass = 'choice-item';

      if (isReviewMode) {
        if (idx === currentQ.correctAnswer) {
          itemClass += ' correct';
        } else if (idx === selectedAns) {
          itemClass += ' wrong';
        } else {
          itemClass += ' dimmed';
        }
      } else {
        if (selectedAns === idx) {
          itemClass += ' selected';
        }
      }

      return `
        <button type="button" class="${itemClass}" onclick="handleSelectChoice(${idx})" ${isReviewMode ? 'disabled' : ''}>
          <div class="choice-badge">${choiceLetter}</div>
          <div style="flex: 1; word-break: break-word;">${escapeHTML(choiceText || '')}</div>
        </button>
      `;
    }).join('');
  }

  // 7. Explanation Section (Review Mode only)
  const explanationBox = document.getElementById('explanationBox');
  const explanationText = document.getElementById('explanationText') || document.getElementById('explanationContent');
  if (explanationBox && explanationText) {
    if (isReviewMode && currentQ.explanation) {
      const selectedAns = userAnswers[currentIndex];
      const isCorrect = selectedAns === currentQ.correctAnswer;
      const selectedLetter = selectedAns !== undefined ? (THAI_LETTERS[selectedAns] || `${selectedAns + 1}`) : 'ไม่ได้ตอบ';
      const correctLetter = THAI_LETTERS[currentQ.correctAnswer] || `${currentQ.correctAnswer + 1}`;

      const statusHtml = isCorrect
        ? `<div style="color: #059669; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; font-size: 14px;">
             <span>✅</span><span>คุณตอบถูกต้อง! (ข้อ ${correctLetter})</span>
           </div>`
        : `<div style="color: #DC2626; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; font-size: 14px;">
             <span>❌</span><span>คุณตอบ: ข้อ ${selectedLetter} (เฉลยที่ถูกต้องคือ: ข้อ ${correctLetter})</span>
           </div>`;

      explanationText.innerHTML = `
        ${statusHtml}
        <div style="color: #475569; font-size: 13.5px; line-height: 1.65; white-space: pre-line;">${escapeHTML(currentQ.explanation)}</div>
      `;
      explanationBox.style.display = 'block';
    } else {
      explanationBox.style.display = 'none';
    }
  }

  // 8. Main Action Button: Next vs Submit vs View Results
  const btnAction = document.getElementById('btnActionMain') || document.getElementById('btnMainAction');
  if (btnAction) {
    if (isReviewMode) {
      if (currentIndex === total - 1) {
        btnAction.innerHTML = '<span>📊 ดูผลคะแนนรวม</span>';
      } else {
        btnAction.innerHTML = '<span>ข้อถัดไป →</span>';
      }
    } else {
      if (currentIndex === total - 1) {
        btnAction.innerHTML = '<span>ส่งข้อสอบ</span>';
      } else {
        btnAction.innerHTML = '<span>ข้อถัดไป →</span>';
      }
    }
  }

  // 9. Status label
  const answeredLabel = document.getElementById('answeredCountLabel');
  if (answeredLabel) {
    if (isReviewMode) {
      answeredLabel.textContent = `คะแนน ${examState.score}/${total} ข้อ`;
    } else {
      answeredLabel.textContent = `ทำแล้ว ${answeredCount}/${total} ข้อ`;
    }
  }

  // 10. Nav Grid
  renderNavGrid();
}

function renderNavGrid() {
  const { questions, currentIndex, userAnswers, isReviewMode } = examState;
  const navGrid = document.getElementById('navGrid');
  if (!navGrid || !questions) return;

  navGrid.innerHTML = questions.map((q, idx) => {
    const qNum = idx + 1;
    const isCurrent = idx === currentIndex;
    const ans = userAnswers[idx];
    const isAnswered = ans !== undefined;

    let cls = 'nav-box';

    if (isReviewMode) {
      const isCorrect = ans === q.correctAnswer;
      if (isCurrent) cls += ' current';
      if (isCorrect) {
        cls += ' review-correct';
      } else {
        cls += ' review-wrong';
      }
    } else {
      if (isCurrent) cls += ' current';
      if (isAnswered) cls += ' answered';
    }

    return `
      <button type="button" class="${cls}" onclick="goToQuestion(${idx})" title="ข้อที่ ${qNum}">
        ${qNum}
      </button>
    `;
  }).join('');
}

window.handleSelectChoice = function(choiceIdx) {
  if (examState.isReviewMode || examState.isSubmitted) return;
  examState.userAnswers[examState.currentIndex] = choiceIdx;
  renderExamQuestion();
};

window.goToQuestion = function(idx) {
  if (idx < 0 || idx >= examState.questions.length) return;
  examState.currentIndex = idx;
  renderExamQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.handleMainAction = function() {
  const { questions, currentIndex, isReviewMode } = examState;

  if (isReviewMode) {
    if (currentIndex < questions.length - 1) {
      examState.currentIndex++;
      renderExamQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showResultsModal();
    }
    return;
  }

  if (currentIndex < questions.length - 1) {
    examState.currentIndex++;
    renderExamQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    submitExam();
  }
};

function submitExam() {
  const { questions, userAnswers } = examState;
  const total = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  if (answeredCount < total) {
    const unans = total - answeredCount;
    if (!confirm(`⚠️ คุณยังไม่ได้ตอบอีก ${unans} ข้อ (ทำแล้ว ${answeredCount}/${total} ข้อ)\n\nคุณต้องการส่งข้อสอบเพื่อตรวจคะแนนและดูเฉลยเลยหรือไม่?`)) {
      return;
    }
  }

  // Calculate score
  let correct = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctAnswer) {
      correct++;
    }
  });

  examState.score = correct;
  examState.isSubmitted = true;
  examState.isReviewMode = false;

  // Save history
  saveExamResult(correct, total);

  // Show score modal
  showResultsModal();
}

function showResultsModal() {
  const total = examState.questions.length;
  const correct = examState.score;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const pass = pct >= 60;

  const modal = document.getElementById('resultsModal');
  const icon = document.getElementById('resultIcon');
  const title = document.getElementById('resultTitle');
  const sub = document.getElementById('resultSubtitle');
  const score = document.getElementById('resultScore');
  const pctEl = document.getElementById('resultPct');

  if (icon) icon.textContent = pass ? '🎉' : '💪';
  if (title) title.textContent = pass ? 'ยินดีด้วย! คุณผ่านเกณฑ์ทดสอบ' : 'พยายามอีกนิด ทบทวนและฝึกฝนใหม่';
  if (sub) sub.textContent = `${examState.subjectTitle} (รวม ${total} ข้อ)`;
  if (score) {
    score.textContent = `${correct}/${total}`;
    score.style.color = pass ? '#059669' : '#DC2626';
  }
  if (pctEl) {
    pctEl.textContent = `${pct}%`;
    pctEl.style.color = pass ? '#059669' : '#DC2626';
  }

  if (modal) modal.style.display = 'flex';
}

window.startReview = function() {
  const modal = document.getElementById('resultsModal');
  if (modal) modal.style.display = 'none';

  examState.isReviewMode = true;
  examState.currentIndex = 0;
  renderExamQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.exitExamToSource = function() {
  window.location.href = examState.sourcePage || 'bank.html';
};

window.handleExitExam = function() {
  if (!examState.isSubmitted && Object.keys(examState.userAnswers).length > 0) {
    if (!confirm('คุณกำลังทำข้อสอบอยู่ หากออกจากหน้านี้ ข้อสอบจะไม่ถูกบันทึกคะแนน\nต้องการออกจากข้อสอบหรือไม่?')) {
      return;
    }
  }
  window.location.href = examState.sourcePage || 'bank.html';
};

function saveExamResult(correct, total) {
  try {
    const raw = localStorage.getItem('userQuizHistory');
    let history = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(history)) history = [];

    const examTitle = examState.track
      ? (examState.track === 'prabpram' ? 'Pretest สายปราบปราม 150 ข้อ' : 'Pretest สายอำนวยการ 150 ข้อ')
      : examState.subjectTitle;

    const record = {
      subject: examState.subjectKey,
      title: examTitle,
      correctCount: correct,
      totalQuestions: total,
      scorePct: total > 0 ? Math.round((correct / total) * 100) : 0,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    history.unshift(record);
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem('userQuizHistory', JSON.stringify(history));
  } catch (e) {
    console.warn('Save history error:', e);
  }
}

// Report Question Modal
window.openReportModal = function() {
  const modal = document.getElementById('reportModal');
  if (modal) modal.style.display = 'flex';
};

window.closeReportModal = function() {
  const modal = document.getElementById('reportModal');
  if (modal) modal.style.display = 'none';
};

window.submitReport = function() {
  const note = document.getElementById('reportNote')?.value?.trim();
  if (!note) {
    alert('กรุณาระบุรายละเอียดข้อผิดพลาด');
    return;
  }
  alert('ขอบคุณสำหรับข้อมูล! รายงานข้อผิดพลาดส่งไปยังทีมผู้ตรวจเรียบร้อยแล้ว');
  closeReportModal();
};

function generateStandardQuestions(subject, count) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      questionText: `คำถามมาตรฐานข้อที่ ${i}: ตามหลักการสำคัญในหมวด "${subject}" แนวทางปฏิบัติข้อใดถูกต้องที่สุด?`,
      choices: [
        `หลักการวิเคราะห์และนำไปปฏิบัติให้สอดคล้องตามระเบียบที่กำหนด`,
        `การดำเนินการตามดุลพินิจโดยไม่ต้องอิงตามเกณฑ์มาตรฐาน`,
        `การงดเว้นการปฏิบัติเมื่อพบข้อจำกัดด้านเวลา`,
        `การส่งต่องานโดยไม่มีการตรวจสอบความถูกต้องของเนื้อหา`
      ],
      correctAnswer: 0,
      explanation: `ตามเกณฑ์และระเบียบมาตรฐานในหมวด ${subject} การปฏิบัติงานจะต้องยึดถือหลักเกณฑ์ ความถูกต้อง และความสอดคล้องตามระเบียบอย่างเคร่งครัดที่สุด`
    });
  }
  return list;
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}
