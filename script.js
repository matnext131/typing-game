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

    if (uniqueByLabel(topicObj.terms).length < 4) {
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

  // 全単元の用語をまとめてシャッフル → 先頭N個を選ぶ（同じ語句は1回だけ）
  const allTerms = uniqueByLabel(topics.flatMap(t => t.terms));
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
  const termCount = uniqueByLabel(topicObj.terms).length;

  if (termCount < 4) {
    alert(`「${topicObj.topic}」の用語が${termCount}個しかありません。\n4択クイズには最低4つの用語が必要です。`);
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
// 問題セットを生成（全用語を1回ずつ出す。同じ語句が複数あっても1回だけ）
// =============================================
function buildQuestions(topicObj) {
  const pool = uniqueByLabel(topicObj.terms);
  const terms = [...pool];
  shuffle(terms);
  return terms.map(t => ({
    correct: t,
    choices: buildChoices(t, pool)
  }));
}

// 選択肢に同じ語句が2つ以上並ばないよう、表示名が重ならない用語から選ぶ
function buildChoices(correct, allTerms) {
  const correctLabel = termLabel(correct);
  const others = uniqueByLabel(allTerms).filter(t => termLabel(t) !== correctLabel);
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
    btn.textContent = termLabel(choice);
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

  const correctLabel = termLabel(correct);
  const isCorrect = termLabel(selected) === correctLabel;
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
      if (b.textContent === correctLabel) b.classList.add('choice-correct');
    });
    feedbackText.textContent = '❌ 不正解';
    feedbackText.className = 'feedback-wrong';
    feedbackAnswer.textContent = `正解：${correctLabel}`;
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
      li.innerHTML = `<strong>${termLabel(m)}</strong><br><span class="mistake-desc">${m.description}</span>`;
      mistakesList.appendChild(li);
    });
  }

  showScreen('screen-result');
}

// =============================================
// ユーティリティ
// =============================================

// 画面に出す用語名。label の指定があればそれを使い、なければ丸括弧（全角・半角）とその中身を除く
// 例：三権分立（権力分立） → 三権分立
function termLabel(t) {
  if (t.label) return t.label;
  let label = t.term;
  let prev;
  do {
    prev = label;
    label = label.replace(/[（(][^（）()]*[）)]/g, '');
  } while (label !== prev);
  label = label.trim();
  return label || t.term;
}

// 表示名が同じ用語は最初の1つだけ残す
function uniqueByLabel(terms) {
  const seen = new Set();
  return terms.filter(t => {
    const label = termLabel(t);
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}

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
