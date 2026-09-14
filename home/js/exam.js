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
      subjectBadge: subTitle,
      subjectKey: q.subjectKey || examState.subjectKey,
      subjectName: q.shortSubjectName || q.subjectName || subTitle
    };
  });

  examState.currentIndex = 0;
  examState.userAnswers = {};
  examState.isSubmitted = false;
  examState.isReviewMode = false;
  examState.startTime = Date.now();

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
    if (typeof formatQuestionTextHtml === 'function') {
      questionTitle.innerHTML = formatQuestionTextHtml(currentQ.questionText);
    } else {
      questionTitle.textContent = currentQ.questionText;
    }
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

async function submitExam() {
  const { questions, userAnswers } = examState;
  const total = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  if (answeredCount < total) {
    const unans = total - answeredCount;
    if (!confirm(`⚠️ คุณยังไม่ได้ตอบอีก ${unans} ข้อ (ทำแล้ว ${answeredCount}/${total} ข้อ)\n\nคุณต้องการส่งข้อสอบเพื่อตรวจคะแนนและดูเฉลยเลยหรือไม่?`)) {
      return;
    }
  }

  // Calculate score and subject breakdown
  let correct = 0;
  const subjectMap = {};

  questions.forEach((q, idx) => {
    const isCorrect = userAnswers[idx] === q.correctAnswer;
    if (isCorrect) correct++;

    const sKey = q.subjectKey || examState.subjectKey || 'general';
    const sName = q.subjectName || q.subjectBadge || sKey;

    if (!subjectMap[sKey]) {
      subjectMap[sKey] = {
        key: sKey,
        name: sName,
        correct: 0,
        total: 0
      };
    }
    subjectMap[sKey].total++;
    if (isCorrect) {
      subjectMap[sKey].correct++;
    }
  });

  const subjectStats = Object.values(subjectMap);

  examState.score = correct;
  examState.isSubmitted = true;
  examState.isReviewMode = false;
  examState.subjectStats = subjectStats;

  const timeSpentSeconds = Math.max(1, Math.round((Date.now() - (examState.startTime || Date.now())) / 1000));
  examState.timeSpentSeconds = timeSpentSeconds;

  // Show score modal immediately
  showResultsModal(subjectStats);

  // Save history & sync with server
  saveExamResult(correct, total, subjectStats, timeSpentSeconds);
}

function showResultsModal(subjectStats) {
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
  const breakdownEl = document.getElementById('resultSubjectBreakdown');

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

  // Render per-subject breakdown if there are multiple subjects (e.g. Pretest)
  const stats = subjectStats || examState.subjectStats || [];
  if (breakdownEl) {
    if (stats.length > 1) {
      breakdownEl.style.display = 'block';
      breakdownEl.innerHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #1E293B; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <span>📊</span>
          <span>ผลคะแนนแยกตามรายวิชา</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${stats.map(s => {
            const sPct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            const sPass = sPct >= 60;
            const sColor = sPass ? '#059669' : '#DC2626';
            const sBadgeBg = sPass ? '#ECFDF5' : '#FEF2F2';
            const sBadgeBorder = sPass ? '#A7F3D0' : '#FECACA';
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; background: white; padding: 7px 12px; border-radius: 10px; border: 1px solid #E2E8F0;">
                <span style="font-weight: 600; color: #334155; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.name}</span>
                <span style="background: ${sBadgeBg}; border: 1px solid ${sBadgeBorder}; color: ${sColor}; font-weight: 800; padding: 2px 8px; border-radius: 6px;">${s.correct}/${s.total} (${sPct}%)</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      breakdownEl.style.display = 'none';
    }
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

async function saveExamResult(correct, total, subjectStats, timeSpentSeconds) {
  try {
    let userProfile = null;
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) userProfile = JSON.parse(stored);
    } catch (e) {}

    const userId = userProfile?.id || 'guest';
    const userKey = 'userQuizHistory_' + userId;
    const token = localStorage.getItem('authToken');
    const duration = timeSpentSeconds || examState.timeSpentSeconds || 0;

    const isPretest = !!examState.track;
    const examTitle = isPretest
      ? (examState.track === 'prabpram' ? 'Pretest สายปราบปราม 150 ข้อ' : 'Pretest สายอำนวยการ 150 ข้อ')
      : examState.subjectTitle;

    const mainSubject = isPretest
      ? (examState.track === 'prabpram' ? 'Pretest สายปราบปราม' : 'Pretest สายอำนวยการ')
      : (examState.subjectTitle || examState.subjectKey || 'ทั่วไป');

    const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

    const mainRecord = {
      id: (isPretest ? 'pretest_' : 'quiz_') + Date.now(),
      subject: mainSubject,
      title: examTitle,
      setTitle: examTitle,
      setId: isPretest ? `pretest_${examState.track}` : (examState.setId || `mixed_${examState.subjectKey || 'sub'}`),
      correctCount: correct,
      score: correct,
      totalQuestions: total,
      totalCount: total,
      total: total,
      scorePct: scorePct,
      timeSpentSeconds: duration,
      durationSeconds: duration,
      date: formattedDate,
      createdAt: nowIso,
      timestamp: Date.now(),
      breakdown: subjectStats || []
    };

    // 1. Cache to local storage for user profile and global fallback
    const saveList = (key) => {
      try {
        const raw = localStorage.getItem(key);
        let list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
        list.unshift(mainRecord);
        localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
      } catch (err) {}
    };

    saveList(userKey);
    saveList('userQuizHistory');

    // 2. If authenticated, record to backend DB so stats and subject scores update!
    if (token && userId !== 'guest') {
      const apiEndpoint = `${API_BASE}/api/user/record-quiz`;

      // If pretest with multiple subjects, record each subject's performance
      // so recalculateUserSubjectScores() computes accurate averages for each subject
      if (Array.isArray(subjectStats) && subjectStats.length > 1) {
        for (const sub of subjectStats) {
          try {
            const subPct = sub.total > 0 ? Math.round((sub.correct / sub.total) * 100) : 0;
            await fetch(apiEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                score: sub.correct,
                correctCount: sub.correct,
                total: sub.total,
                totalCount: sub.total,
                totalQuestions: sub.total,
                scorePct: subPct,
                subject: sub.name,
                setId: `pretest_${examState.track}_${sub.key}`,
                setTitle: `${examTitle} • ${sub.name}`,
                createdAt: nowIso
              })
            });
          } catch (subErr) {
            console.warn('Record subject quiz error:', subErr);
          }
        }
      }

      // Record the main overall exam attempt
      try {
        const titleWithTime = isPretest ? `${examTitle} [time:${duration}]` : examTitle;
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            score: correct,
            correctCount: correct,
            total: total,
            totalCount: total,
            totalQuestions: total,
            scorePct: scorePct,
            subject: isPretest ? (examState.track === 'prabpram' ? 'ข้อสอบจำลอง สายปราบปราม' : 'ข้อสอบจำลอง สายอำนวยการ') : mainSubject,
            setId: isPretest ? `pretest_${examState.track}` : (examState.setId || `mixed_${examState.subjectKey || 'sub'}`),
            setTitle: titleWithTime,
            timeSpentSeconds: duration,
            durationSeconds: duration,
            createdAt: nowIso
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            localStorage.setItem('userProfile', JSON.stringify(data.user));
          }
        }
      } catch (mainErr) {
        console.warn('Record main quiz error:', mainErr);
      }

      // Refresh full profile to ensure all updated subject averages & XP are synchronized
      try {
        const profRes = await fetch(`${API_BASE}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData && profData.user) {
            localStorage.setItem('userProfile', JSON.stringify(profData.user));
          }
        }
      } catch (profErr) {}
    }
  } catch (e) {
    console.warn('Save exam result error:', e);
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

window.submitReport = async function() {
  const note = document.getElementById('reportNote')?.value?.trim();
  const type = document.getElementById('reportType')?.value || 'WRONG_ANSWER';
  if (!note) {
    alert('กรุณาระบุรายละเอียดข้อผิดพลาด');
    return;
  }

  const q = (examState && examState.questions && examState.questions[examState.currentIndex]) || {};
  const questionId = String(q.id || `exam_${Date.now()}`);
  const questionText = q.questionText || q.question || 'ข้อสอบจากสนามสอบจำลอง';
  const qNum = (examState && examState.currentIndex !== undefined) ? examState.currentIndex + 1 : 1;

  const payloadReason = {
    subject: examState.subjectKey || examState.subject || 'สนามสอบจำลอง',
    chapter: examState.chapter || '-',
    questionNumber: qNum,
    reasonType: type === 'WRONG_ANSWER' ? 'เฉลยคำตอบไม่ถูกต้อง' : (type === 'TYPO_ERROR' ? 'พิมพ์ผิด / ข้อความตกหล่น' : (type === 'AMBIGUOUS' ? 'โจทย์กำกวม' : type)),
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
      closeReportModal();
      const noteInput = document.getElementById('reportNote');
      if (noteInput) noteInput.value = '';
    } else {
      const data = await res.json().catch(() => ({}));
      alert('❌ ไม่สามารถส่งรายงานได้: ' + (data.error || 'เกิดข้อผิดพลาด'));
    }
  } catch (err) {
    console.error('Submit report error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message);
  }
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
