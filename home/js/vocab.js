
let vocabIdx = 0;
let vocabScore = 0;
let vocabStreak = 0;
let vocabCompletedInRound = 0;
let isVocabFeedbackActive = false;

window.openVocabArena = function() {
  vocabIdx = 0;
  vocabScore = 0;
  vocabStreak = 0;
  vocabCompletedInRound = 0;
  isVocabFeedbackActive = false;
  
  const modal = document.getElementById('vocabArenaModal');
  if (modal) {
    modal.style.display = 'flex';
    renderVocabQuestion();
  }
};

window.closeVocabArena = function() {
  const modal = document.getElementById('vocabArenaModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// Bind close button
const btnCloseVocabArena = document.getElementById('btnCloseVocabArena');
if (btnCloseVocabArena) {
  btnCloseVocabArena.onclick = () => {
    closeVocabArena();
  };
}

function renderVocabQuestion() {
  if (vocabCompletedInRound >= 5) {
    completeVocabSession();
    return;
  }

  isVocabFeedbackActive = false;
  const wordObj = vocabWords[vocabIdx % vocabWords.length];

  // UI elements
  document.getElementById('vocabGameScore').textContent = vocabScore;
  document.getElementById('vocabGameStreak').textContent = `${vocabStreak} ๐”ฅ`;
  document.getElementById('vocabGameCount').textContent = `${vocabCompletedInRound + 1}/5`;

  const streakAlert = document.getElementById('vocabStreakAlert');
  const streakCount = document.getElementById('vocabStreakCount');
  if (vocabStreak >= 3) {
    streakCount.textContent = vocabStreak;
    streakAlert.style.display = 'block';
  } else {
    streakAlert.style.display = 'none';
  }

  const wordCard = document.getElementById('vocabWordCard');
  wordCard.style.borderColor = '#E2E8F0';
  wordCard.style.backgroundColor = 'white';

  document.getElementById('lblVocabWord').textContent = wordObj.word;

  const feedbackEl = document.getElementById('vocabFeedbackMessage');
  feedbackEl.style.display = 'none';

  const choicesGrid = document.getElementById('vocabChoicesGrid');
  choicesGrid.innerHTML = '';

  wordObj.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.style.cssText = 'height: 60px; background: white; border: 2px solid #E2E8F0; border-radius: 16px; font-size: 13px; font-weight: 700; color: #1E293B; cursor: pointer; transition: all 0.2s;';
    btn.textContent = opt;
    btn.onclick = () => handleVocabAnswer(opt, btn);
    choicesGrid.appendChild(btn);
  });
}

async function handleVocabAnswer(selectedOpt, btnElement) {
  if (isVocabFeedbackActive) return;
  isVocabFeedbackActive = true;

  const wordObj = vocabWords[vocabIdx % vocabWords.length];
  const wordCard = document.getElementById('vocabWordCard');
  const feedbackEl = document.getElementById('vocabFeedbackMessage');
  
  // Disable all choice buttons
  const buttons = document.querySelectorAll('#vocabChoicesGrid button');
  buttons.forEach(b => {
    b.disabled = true;
    b.style.cursor = 'not-allowed';
  });

  const isCorrect = selectedOpt === wordObj.meaning;
  if (isCorrect) {
    vocabScore += (10 + vocabStreak * 2);
    vocabStreak++;
    vocabCompletedInRound++;

    btnElement.style.borderColor = '#10B981';
    btnElement.style.backgroundColor = '#ECFDF5';
    btnElement.style.color = '#065F46';

    wordCard.style.borderColor = '#34D399';
    wordCard.style.backgroundColor = '#ECFDF5';

    feedbackEl.textContent = 'โ“ เธ–เธนเธเธ•เนเธญเธ! เธขเธญเธ”เน€เธขเธตเนเธขเธกเธกเธฒเธ';
    feedbackEl.style.color = '#059669';
    feedbackEl.style.display = 'block';

  } else {
    vocabStreak = 0;
    vocabCompletedInRound++;

    btnElement.style.borderColor = '#EF4444';
    btnElement.style.backgroundColor = '#FEF2F2';
    btnElement.style.color = '#991B1B';

    wordCard.style.borderColor = '#FCA5A5';
    wordCard.style.backgroundColor = '#FEF2F2';

    // Highlight correct choice
    buttons.forEach(b => {
      if (b.textContent === wordObj.meaning) {
        b.style.borderColor = '#10B981';
        b.style.backgroundColor = '#ECFDF5';
        b.style.color = '#065F46';
      }
    });

    feedbackEl.textContent = `โ— เธเธดเธ” โ€” เธเธณเนเธเธฅเธ—เธตเนเธ–เธนเธเธ•เนเธญเธเธเธทเธญ: ${wordObj.meaning}`;
    feedbackEl.style.color = '#DC2626';
    feedbackEl.style.display = 'block';
  }

  // Next word after 1.5 seconds
  setTimeout(() => {
    vocabIdx++;
    renderVocabQuestion();
  }, 1500);
}

async function completeVocabSession() {
  closeVocabArena();

  try {
    const res = await fetch(`${API_BASE}/api/user/vocab-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        level: 'B1',
        matchedPairs: 5,
        timeSeconds: 30,
        mode: 'sentence'
      })
    });

    if (!res.ok) throw new Error();
    const data = await res.json();

    await showCenteredAlert(
      `๐ เธชเธณเน€เธฃเนเธ! เธเธธเธ“เน€เธฅเนเธเธฃเธญเธเธเธตเนเน€เธชเธฃเนเธเธชเธดเนเธ\nเธเธฐเนเธเธเธ—เธตเนเนเธ”เน: ${vocabScore} PTS\n${data.message}`,
      { title: 'เธชเธณเน€เธฃเนเธเธเธฒเธฃเธเธถเธเธเธ', icon: '๐' }
    );

    loadRealProfile(); // Refresh ELO, XP, level on dashboard
  } catch (err) {
    console.error('Error saving vocab session:', err);
    await showCenteredAlert('เธชเธณเน€เธฃเนเธเธกเธดเธเธดเน€เธเธกเธเธณเธจเธฑเธเธ—เนเนเธฅเนเธง! เนเธ•เนเนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธเธฑเธเธ—เธถเธเธเธฐเนเธเธเน€เธเนเธฒเน€เธเธดเธฃเนเธเน€เธงเธญเธฃเนเนเธ”เน');
  }
}



