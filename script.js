// パスワード設定
const USE_PASSWORD = false;
const APP_PASSWORD = "shakai131";

// ランダム問題の出題数
const RANDOM_QUIZ_COUNT = 50;

// =============================================
// 状態管理
// =============================================
let currentTopic = null;
let isRandomMode = false;
let quizQuestions = [];
let currentIndex = 0;
let correctCount = 0;
let mistakes = [];

// =============================================
// 画面切り替え
// =============================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// =============================================
// 起動
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  if (USE_PASSWORD) {
    showScreen('screen-password');
    document.getElementById('btn-password').addEventListener('click', checkPassword);
    document.getElementById('password-input').addEventListener('keypress', e => {
      if (e.key === 'Enter') checkPassword();
    });
  } else {
    showScreen('screen-select');
    buildTopicList();
  }

  document.getElementById('btn-back-select').addEventListener('click', () => {
    showScreen('screen-select');
  });

  document.getElementById('btn-retry').addEventListener('click', () => {
    if (isRandomMode) startRandomQuiz();
    else startQuiz(currentTopic);
  });
});

// =============================================
// パスワード確認
// =============================================
function checkPassword() {
  const val = document.getElementById('password-input').value;
  if (val === APP_PASSWORD) {
    showScreen('screen-select');
    buildTopicList();
  } else {
    document.getElementById('password-error').classList.remove('hidden');
  }
}

// =============================================
// トピック一覧を構築
// =============================================
function buildTopicList() {
  const list = document.getElementById('topic-list');
  list.innerHTML = '';

  topics.forEach((topicObj, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-topic';
    btn.textContent = topicObj.topic;

    if (topicObj.terms.length < 4) {
      btn.textContent += ' ⚠ 用語が少ない';
      btn.classList.add('btn-warning');
    }

    btn.addEventListener('click', () => startQuiz(i));
    list.appendChild(btn);
  });

  // ランダム問題ボタン（一番下に追加）
  const allTerms = topics.flatMap(t => t.terms);
  const separator = document.createElement('hr');
  separator.style.borderColor = 'rgba(255,255,255,0.2)';
  separator.style.margin = '8px 0';
  list.appendChild(separator);

  const randomBtn = document.createElement('button');
  randomBtn.className = 'btn btn-random';
  randomBtn.innerHTML = '🎲 ランダム問題（全単元から' + RANDOM_QUIZ_COUNT + '問）';
  randomBtn.addEventListener('click', startRandomQuiz);
  list.appendChild(randomBtn);
}

// =============================================
// ランダムクイズ開始
// =============================================
function startRandomQuiz() {
  isRandomMode = true;
  currentTopic = null;

  // 全単元の用語をまとめてシャッフル → 先頭N個を選ぶ
  const allTerms = topics.flatMap(t => t.terms);
  shuffle(allTerms);
  const picked = allTerms.slice(0, RANDOM_QUIZ_COUNT);

  // 選択肢は全用語プールから選ぶ
  quizQuestions = picked.map(t => ({
    correct: t,
    choices: buildChoices(t, allTerms)
  }));

  currentIndex = 0;
  correctCount = 0;
  mistakes = [];

  document.getElementById('quiz-topic-name').textContent = '🎲 ランダム問題';
  showScreen('screen-quiz');
  showQuestion();
}

// =============================================
// クイズ開始
// =============================================
function startQuiz(topicIndex) {
  isRandomMode = false;
  currentTopic = topicIndex;
  const topicObj = topics[topicIndex];

  if (topicObj.terms.length < 4) {
    alert(`「${topicObj.topic}」の用語が${topicObj.terms.length}個しかありません。\n4択クイズには最低4つの用語が必要です。`);
    return;
  }

  quizQuestions = buildQuestions(topicObj);
  currentIndex = 0;
  correctCount = 0;
  mistakes = [];

  document.getElementById('quiz-topic-name').textContent = topicObj.topic;
  showScreen('screen-quiz');
  showQuestion();
}

// =============================================
// 問題セットを生成（全用語を1回ずつ出す）
// =============================================
function buildQuestions(topicObj) {
  const terms = [...topicObj.terms];
  shuffle(terms);
  return terms.map(t => ({
    correct: t,
    choices: buildChoices(t, topicObj.terms)
  }));
}

function buildChoices(correct, allTerms) {
  const others = allTerms.filter(t => t.term !== correct.term);
  shuffle(others);
  const wrong = others.slice(0, 3);
  const choices = [correct, ...wrong];
  shuffle(choices);
  return choices;
}

// =============================================
// 問題表示
// =============================================
function showQuestion() {
  const total = quizQuestions.length;
  document.getElementById('quiz-progress').textContent = `${currentIndex + 1} / ${total}`;

  const q = quizQuestions[currentIndex];
  document.getElementById('question-text').textContent = q.correct.description;

  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';

  q.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-choice';
    btn.textContent = choice.term;
    btn.addEventListener('click', () => selectAnswer(btn, choice, q.correct));
    choicesDiv.appendChild(btn);
  });

  document.getElementById('feedback').classList.add('hidden');
}

// =============================================
// 回答処理
// =============================================
function selectAnswer(btn, selected, correct) {
  // ボタンを全部無効化
  document.querySelectorAll('.btn-choice').forEach(b => b.disabled = true);

  const isCorrect = selected.term === correct.term;
  const feedback = document.getElementById('feedback');
  const feedbackText = document.getElementById('feedback-text');
  const feedbackAnswer = document.getElementById('feedback-answer');

  if (isCorrect) {
    btn.classList.add('choice-correct');
    feedbackText.textContent = '⭕ 正解！';
    feedbackText.className = 'feedback-correct';
    feedbackAnswer.textContent = '';
    correctCount++;
    playSound('snd-correct');
  } else {
    btn.classList.add('choice-wrong');
    // 正解ボタンを緑にする
    document.querySelectorAll('.btn-choice').forEach(b => {
      if (b.textContent === correct.term) b.classList.add('choice-correct');
    });
    feedbackText.textContent = '❌ 不正解';
    feedbackText.className = 'feedback-wrong';
    feedbackAnswer.textContent = `正解：${correct.term}（${correct.reading}）`;
    mistakes.push(correct);
    playSound('snd-incorrect');
  }

  feedback.classList.remove('hidden');

  const btnNext = document.getElementById('btn-next');
  btnNext.onclick = () => {
    currentIndex++;
    if (currentIndex < quizQuestions.length) {
      showQuestion();
    } else {
      showResult();
    }
  };
}

// =============================================
// 結果表示
// =============================================
function showResult() {
  const total = quizQuestions.length;
  const rate = Math.round((correctCount / total) * 100);

  document.getElementById('result-correct').textContent = correctCount;
  document.getElementById('result-total').textContent = total;
  document.getElementById('result-rate').textContent = rate + '%';

  const mistakesList = document.getElementById('mistakes-list');
  const mistakesTitle = document.getElementById('mistakes-title');
  mistakesList.innerHTML = '';

  if (mistakes.length === 0) {
    mistakesTitle.textContent = '全問正解！すばらしい！';
  } else {
    mistakesTitle.textContent = `間違えた問題（${mistakes.length}問）`;
    mistakes.forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${m.term}</strong>（${m.reading}）<br><span class="mistake-desc">${m.description}</span>`;
      mistakesList.appendChild(li);
    });
  }

  showScreen('screen-result');
}

// =============================================
// ユーティリティ
// =============================================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function playSound(id) {
  const el = document.getElementById(id);
  if (el) {
    el.currentTime = 0;
    el.play().catch(() => {});
  }
}
