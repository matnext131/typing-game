// =============================================
// 社会科クエスト（アーケード×RPGモード 第1弾）
// 通常クイズ（index.html / script.js）とは独立して動く。
// data.js の topics を読むだけで、データの書き換えや保存は行わない。
// =============================================

const QUESTIONS_PER_PLAY = 10;
const BASE_POINTS = 100;
// 連続正解数に応じた倍率（大きい順に判定）
const COMBO_STEPS = [
  { combo: 10, multiplier: 3 },
  { combo: 5, multiplier: 2 },
  { combo: 3, multiplier: 1.5 }
];
const SUBJECTS = ['地理', '歴史', '公民'];

// =============================================
// 状態管理
// =============================================
const units = buildUnits();
let currentSubject = SUBJECTS[0];
let currentUnit = null;
let questions = [];
let currentIndex = 0;
let score = 0;
let combo = 0;
let maxCombo = 0;
let correctCount = 0;
let mistakes = [];
let results = [];      // 各問の正誤（true / false）
let answered = false;

// =============================================
// 画面切り替え
// =============================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo(0, 0);
}

// =============================================
// 起動
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  buildSubjectTabs();
  renderUnitList();
  showScreen('screen-select');

  document.getElementById('btn-next').addEventListener('click', nextQuestion);
  document.getElementById('btn-quit').addEventListener('click', backToSelect);
  document.getElementById('btn-retry').addEventListener('click', () => startQuest(currentUnit));
  document.getElementById('btn-back').addEventListener('click', backToSelect);
  document.addEventListener('keydown', handleKey);
});

// =============================================
// 単元データの準備
// =============================================
function buildUnits() {
  const list = [];
  SUBJECTS.forEach(subject => {
    const subjectTopics = topics.filter(t => subjectOf(t) === subject);
    subjectTopics.forEach(t => {
      list.push({ subject, name: t.topic.slice(subject.length + 1), terms: playableTerms(t.terms) });
    });
    // 分野の全単元から出題する「ミックス」
    list.push({
      subject,
      name: '全単元ミックス',
      terms: playableTerms(subjectTopics.flatMap(t => t.terms)),
      isMix: true
    });
  });
  return list.filter(u => u.terms.length >= 4);
}

function subjectOf(topicObj) {
  return topicObj.topic.split('：')[0];
}

// 出題できる用語だけを、表示名の重複を除いて返す
// （Excelの見出し行が用語として混ざっている単元があるため、説明のない行と「語句／意味」の行は除く）
function playableTerms(terms) {
  return uniqueByLabel(terms.filter(t =>
    t.description && t.description.trim() !== '' &&
    !(t.term === '語句' && t.description === '意味')
  ));
}

// =============================================
// 単元選択画面
// =============================================
function buildSubjectTabs() {
  const tabs = document.getElementById('subject-tabs');
  SUBJECTS.forEach(subject => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'subject-tab';
    tab.setAttribute('role', 'tab');
    tab.textContent = subject;
    tab.addEventListener('click', () => {
      currentSubject = subject;
      renderUnitList();
    });
    tabs.appendChild(tab);
  });
}

function renderUnitList() {
  document.querySelectorAll('.subject-tab').forEach(tab => {
    tab.setAttribute('aria-selected', String(tab.textContent === currentSubject));
  });

  const list = document.getElementById('unit-list');
  list.innerHTML = '';
  units.filter(u => u.subject === currentSubject).forEach(unit => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'unit-btn' + (unit.isMix ? ' unit-btn-mix' : '');

    const name = document.createElement('span');
    name.textContent = unit.name;
    const count = document.createElement('span');
    count.className = 'unit-count';
    count.textContent = `全${questionCount(unit)}問`;

    btn.append(name, count);
    btn.addEventListener('click', () => startQuest(unit));
    list.appendChild(btn);
  });
}

function questionCount(unit) {
  return Math.min(QUESTIONS_PER_PLAY, unit.terms.length);
}

function backToSelect() {
  currentSubject = currentUnit ? currentUnit.subject : currentSubject;
  renderUnitList();
  showScreen('screen-select');
}

// =============================================
// クエスト開始
// =============================================
function startQuest(unit) {
  currentUnit = unit;

  // 出題順はランダム、1プレイの中で同じ用語は出さない
  const pool = [...unit.terms];
  shuffle(pool);
  questions = pool.slice(0, questionCount(unit)).map(t => ({
    correct: t,
    choices: buildChoices(t, unit.terms)
  }));

  currentIndex = 0;
  score = 0;
  combo = 0;
  maxCombo = 0;
  correctCount = 0;
  mistakes = [];
  results = [];

  document.getElementById('hud-unit').textContent = `${unit.subject}：${unit.name}`;
  updateHud();
  showScreen('screen-battle');
  showQuestion();
}

function buildChoices(correct, allTerms) {
  const correctLabel = termLabel(correct);
  const others = uniqueByLabel(allTerms).filter(t => termLabel(t) !== correctLabel);
  shuffle(others);
  const choices = [correct, ...others.slice(0, 3)];
  shuffle(choices);
  return choices;
}

// =============================================
// 問題表示
// =============================================
function showQuestion() {
  answered = false;
  const q = questions[currentIndex];

  document.getElementById('question-number').textContent = `Q${currentIndex + 1}/${questions.length}`;
  document.getElementById('question-text').textContent = q.correct.description;

  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice';

    const key = document.createElement('span');
    key.className = 'choice-key';
    key.textContent = i + 1;
    const label = document.createElement('span');
    label.className = 'choice-label';
    label.textContent = termLabel(choice);

    btn.append(key, label);
    btn.addEventListener('click', () => selectAnswer(btn, choice));
    choicesDiv.appendChild(btn);
  });

  document.getElementById('feedback').classList.add('hidden');
  renderPips();
}

// =============================================
// 回答処理
// =============================================
function selectAnswer(btn, selected) {
  if (answered) return;
  answered = true;

  const q = questions[currentIndex];
  const correctLabel = termLabel(q.correct);
  const isCorrect = termLabel(selected) === correctLabel;
  const buttons = [...document.querySelectorAll('.choice')];
  buttons.forEach(b => b.disabled = true);

  const feedbackText = document.getElementById('feedback-text');
  const feedbackDetail = document.getElementById('feedback-detail');

  if (isCorrect) {
    combo++;
    maxCombo = Math.max(maxCombo, combo);
    correctCount++;
    const multiplier = comboMultiplier(combo);
    const points = Math.round(BASE_POINTS * multiplier);
    score += points;

    btn.classList.add('correct', 'hit');
    feedbackText.textContent = '⭕ 正解！';
    feedbackText.className = 'feedback-text good';
    feedbackDetail.textContent = multiplier > 1
      ? `${combo}コンボ！ ×${multiplier} で +${points}点`
      : `+${points}点`;
    showScorePop(`+${points}`);
    bump('hud-score');
    bump('hud-combo');
    playSound('snd-correct');
  } else {
    const lostCombo = combo;
    combo = 0;
    mistakes.push(q.correct);

    btn.classList.add('wrong', 'miss');
    buttons.forEach(b => {
      if (b.querySelector('.choice-label').textContent === correctLabel) b.classList.add('correct');
    });
    feedbackText.textContent = '❌ 不正解';
    feedbackText.className = 'feedback-text bad';
    feedbackDetail.textContent = `正解：${correctLabel}` + (lostCombo >= 2 ? `（${lostCombo}コンボが途切れた…）` : '');
    playSound('snd-incorrect');
  }

  results.push(isCorrect);
  updateHud();
  renderPips();

  const btnNext = document.getElementById('btn-next');
  btnNext.textContent = currentIndex + 1 < questions.length ? '次へ' : '結果を見る';
  document.getElementById('feedback').classList.remove('hidden');
  btnNext.focus({ preventScroll: true });
}

function comboMultiplier(count) {
  const step = COMBO_STEPS.find(s => count >= s.combo);
  return step ? step.multiplier : 1;
}

function nextQuestion() {
  if (!answered) return;
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

// キーボードでも遊べるように1〜4で選択（回答後は「次へ」にフォーカスが移るのでEnterで進める）
function handleKey(e) {
  if (document.getElementById('screen-battle').classList.contains('hidden')) return;
  if (!answered && ['1', '2', '3', '4'].includes(e.key)) {
    const btn = document.querySelectorAll('.choice')[Number(e.key) - 1];
    if (btn) btn.click();
  }
}

// =============================================
// HUD（スコア・コンボ・進み具合）
// =============================================
function updateHud() {
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-combo').textContent = combo;
  document.getElementById('hud-multiplier').textContent = `×${comboMultiplier(combo)}`;
  document.getElementById('hud-combo').closest('.hud-box').classList.toggle('combo-hot', combo >= 3);
}

function renderPips() {
  const pips = document.getElementById('hud-pips');
  pips.innerHTML = '';
  questions.forEach((_, i) => {
    const pip = document.createElement('li');
    pip.className = 'pip';
    if (i < results.length) pip.classList.add(results[i] ? 'good' : 'bad');
    else if (i === currentIndex) pip.classList.add('current');
    pips.appendChild(pip);
  });
}

function bump(id) {
  const el = document.getElementById(id);
  el.classList.remove('bump');
  void el.offsetWidth; // アニメーションを最初から再生するため
  el.classList.add('bump');
}

function showScorePop(text) {
  const pop = document.getElementById('score-pop');
  pop.textContent = text;
  pop.classList.remove('show');
  void pop.offsetWidth;
  pop.classList.add('show');
}

// =============================================
// 結果表示
// =============================================
function showResult() {
  document.getElementById('result-unit').textContent = `${currentUnit.subject}：${currentUnit.name}`;
  document.getElementById('result-score').textContent = score;
  document.getElementById('result-correct').textContent = `${correctCount}/${questions.length}`;
  document.getElementById('result-max-combo').textContent = maxCombo;

  const title = document.getElementById('mistakes-title');
  const list = document.getElementById('mistakes-list');
  list.innerHTML = '';

  if (mistakes.length === 0) {
    title.textContent = '全問正解！パーフェクト！';
  } else {
    title.textContent = `間違えた用語（${mistakes.length}問）`;
    mistakes.forEach(m => {
      const li = document.createElement('li');
      const term = document.createElement('span');
      term.className = 'mistake-term';
      term.textContent = termLabel(m);
      const desc = document.createElement('span');
      desc.className = 'mistake-desc';
      desc.textContent = m.description;
      li.append(term, desc);
      list.appendChild(li);
    });
  }

  showScreen('screen-result');
}

// =============================================
// ユーティリティ
// termLabel / uniqueByLabel は通常クイズ（script.js）と同じ仕様
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
