// =============================================
// 社会科クエスト（アーケード×RPGモード 第1弾）
// 通常クイズ（index.html / script.js）とは独立して動く。
// data.js の topics は読むだけで書き換えない。
// レベル・XP・自己ベストはこの端末の localStorage にだけ保存する（通信はしない）。
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

// 経験値とレベル（第2弾）
const XP_PER_CORRECT = 10;
// レベルLからL+1に上がるのに必要なXP（Lv.1→2が50XP、以後1レベルごとに25XPずつ増える）
const LEVEL_BASE_XP = 50;
const LEVEL_STEP_XP = 25;
const STORAGE_KEY = 'shakai-quest-record-v1';
const MAX_COUNT = 1e9; // 壊れたデータで極端な値が入っていた場合の上限

// ランクは間違えた数で決める（10問なら S:全問正解 A:9問 B:7〜8問 C:5〜6問 D:4問以下）
const RANKS = ['S', 'A', 'B', 'C', 'D'];
// コンボ数に応じた演出の段階（0〜3）と、正解時のほめ言葉
const PRAISES = ['GOOD', 'NICE', 'GREAT', 'PERFECT'];
const PARTICLE_COLORS = ['#ffd54f', '#4fc3f7', '#66bb6a', '#ef5350', '#ba68c8', '#ffffff'];

// 苦手克服クエスト：別々に最後まで解いた復習プレイで、この回数だけ正解すると克服
const REVIEW_CLEAR_COUNT = 2;
const REVIEW_NAME = '苦手克服クエスト';

// ボス戦（characters.js の歴史人物）：10問中この数以上正解で撃破。初めて撃破した人物はお供として選べるようになる
const BOSS_QUESTIONS = 10;
const BOSS_CLEAR_COUNT = 8;
// お供の能力（ボス戦では使えない）
const ABILITIES = {
  comboGuard: {
    name: 'コンボ守り',
    text: '1プレイに1回、2コンボ以上で不正解になってもコンボを維持する',
    minCombo: 2
  }
};

// =============================================
// 状態管理
// =============================================
const units = buildUnits();
const termIndex = buildTermIndex();
const bosses = buildBosses();
let storageAvailable = true;
let record = loadRecord();
let playRecorded = false; // 今のプレイの記録を保存済みか（二重加算の防止）
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
let effectTimers = []; // 演出用のタイマー（画面を移るときにまとめて止める）
let companion = null;  // 今のプレイで能力を使うお供（ボス戦では null）
let guardUsed = false; // 今のプレイで「コンボ守り」を使ったか

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
  renderHome();
  showScreen('screen-select');

  document.getElementById('btn-next').addEventListener('click', nextQuestion);
  document.getElementById('btn-quit').addEventListener('click', backToMenu);
  document.getElementById('btn-retry').addEventListener('click', () => {
    // 苦手克服は、前回の結果を反映した最新の苦手リストから出題し直す
    if (currentUnit.isReview) startReview(currentUnit.subject);
    else startQuest(currentUnit);
  });
  document.getElementById('btn-back').addEventListener('click', backToMenu);
  document.getElementById('btn-review').addEventListener('click', openReview);
  document.getElementById('btn-review-home').addEventListener('click', backToSelect);
  document.getElementById('btn-last-played').addEventListener('click', () => {
    const unit = lastPlayedUnit();
    if (unit) startQuest(unit);
  });
  document.getElementById('btn-reset').addEventListener('click', openResetDialog);
  document.getElementById('btn-reset-cancel').addEventListener('click', closeResetDialog);
  document.getElementById('btn-reset-confirm').addEventListener('click', resetRecord);
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

// 苦手リストで使う用語ID：「元の単元名::元の用語」
// 表示名が同じでも単元が違えば別の用語カードとして扱う（ミックスで出た用語も元の単元のIDになる）
function buildTermIndex() {
  const byId = new Map();
  const idOf = new Map();
  topics.forEach(t => {
    const subject = subjectOf(t);
    if (!SUBJECTS.includes(subject)) return;
    playableTerms(t.terms).forEach(term => {
      const id = `${t.topic}::${term.term}`;
      byId.set(id, { term, subject });
      idOf.set(term, id);
    });
  });
  return { byId, idOf };
}

// ボス戦：人物ごとに、対象単元の用語から出題する（10問出せない単元の人物は出さない）
function buildBosses() {
  return characters
    .map(character => ({ character, unit: units.find(u => !u.isMix && unitKey(u) === character.unit) }))
    .filter(b => b.unit && b.unit.terms.length >= BOSS_QUESTIONS);
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
    const meta = document.createElement('span');
    meta.className = 'unit-meta';
    const count = document.createElement('span');
    count.className = 'unit-count';
    count.textContent = `全${questionCount(unit)}問`;
    meta.appendChild(count);

    const best = record.bestScores[unitKey(unit)];
    if (best !== undefined) {
      const bestEl = document.createElement('span');
      bestEl.className = 'unit-best';
      bestEl.textContent = `ベスト ${best}`;
      const rank = record.bestRanks[unitKey(unit)];
      if (rank) bestEl.appendChild(rankChip(rank));
      meta.appendChild(bestEl);
    }

    btn.append(name, meta);
    btn.addEventListener('click', () => startQuest(unit));
    list.appendChild(btn);

    const boss = bosses.find(b => b.unit === unit);
    if (boss) list.appendChild(bossButton(boss));
  });
}

// 対象単元のすぐ下に出す「ボスに挑戦」ボタン
function bossButton(boss) {
  const { character } = boss;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'unit-btn unit-btn-boss';

  const name = document.createElement('span');
  name.textContent = `⚔ ボスに挑戦：${character.name}`;
  const meta = document.createElement('span');
  meta.className = 'unit-meta';
  const condition = document.createElement('span');
  condition.className = 'unit-count';
  condition.textContent = record.bossDefeated[character.id] ? '撃破済み' : `${BOSS_CLEAR_COUNT}問正解で撃破`;
  meta.appendChild(condition);

  const best = record.bossBest[character.id];
  if (best !== undefined) {
    const bestEl = document.createElement('span');
    bestEl.className = 'unit-best';
    bestEl.textContent = `ベスト ${best}`;
    meta.appendChild(bestEl);
  }

  btn.append(name, meta);
  btn.addEventListener('click', () => startBoss(boss));
  return btn;
}

function questionCount(unit) {
  return Math.min(QUESTIONS_PER_PLAY, unit.terms.length);
}

// 自己ベストを記録するときの単元名（例：「地理：アジア州」「公民：全単元ミックス」）
function unitKey(unit) {
  return `${unit.subject}：${unit.name}`;
}

// ホーム画面のレベル・XP・プレイ記録と単元一覧
function renderHome() {
  const info = levelInfo(record.totalXp);
  document.getElementById('home-level').textContent = info.level;
  document.getElementById('home-total-xp').textContent = record.totalXp;
  document.getElementById('home-next-xp').textContent = `次のレベルまで あと ${info.xpToNextLevel} XP`;
  document.getElementById('home-plays').textContent = record.totalPlays;
  document.getElementById('home-correct').textContent = record.totalCorrect;
  setGauge('home-xp-fill', info);
  document.getElementById('storage-warning').classList.toggle('hidden', storageAvailable);
  renderCompanionPanel();
  renderLastPlayed();
  renderReviewEntry();
  renderUnitList();
}

// 前回最後まで遊んだ単元（データが変わって見つからない場合は表示しない）
function lastPlayedUnit() {
  return units.find(u => unitKey(u) === record.lastUnit) || null;
}

function renderLastPlayed() {
  const box = document.getElementById('last-played');
  const unit = lastPlayedUnit();
  box.classList.toggle('hidden', !unit);
  if (!unit) return;

  const key = unitKey(unit);
  document.getElementById('last-played-name').textContent = key;
  const bestEl = document.getElementById('last-played-best');
  bestEl.textContent = record.bestScores[key] !== undefined ? `ベスト ${record.bestScores[key]}` : '';
  if (record.bestRanks[key]) bestEl.appendChild(rankChip(record.bestRanks[key]));
}

function rankChip(rank) {
  const chip = document.createElement('span');
  chip.className = `rank-chip rank-${rank}`;
  chip.textContent = rank;
  return chip;
}

// =============================================
// お供（同時に1体まで。ボスを初めて撃破すると選べるようになる）
// =============================================
function companionById(id) {
  const character = characters.find(c => c.id === id);
  return character && ABILITIES[character.ability] ? character : null;
}

function unlockedCompanions() {
  return characters.filter(c => record.bossDefeated[c.id] && ABILITIES[c.ability]);
}

function selectedCompanion() {
  return record.companion && record.bossDefeated[record.companion] ? companionById(record.companion) : null;
}

function renderCompanionPanel() {
  const selected = selectedCompanion();
  const ability = selected ? ABILITIES[selected.ability] : null;
  document.getElementById('companion-ability').textContent = ability ? `${ability.name}：${ability.text}` : '';

  const list = document.getElementById('companion-list');
  list.innerHTML = '';
  const owned = unlockedCompanions();
  if (owned.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'companion-empty';
    empty.textContent = 'ボスを初めて倒すと、その人物がお供になります';
    list.appendChild(empty);
    return;
  }

  // 「なし」と、解放済みのお供から1つ選ぶ
  [null, ...owned].forEach(character => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'companion-option';
    btn.setAttribute('aria-pressed', String(selected === character));
    if (character) {
      const face = document.createElement('span');
      face.className = 'portrait companion-face';
      btn.appendChild(fillPortrait(face, character, character.companionImage));
    }
    const label = document.createElement('span');
    label.textContent = character ? character.name : 'なし';
    btn.appendChild(label);
    btn.addEventListener('click', () => selectCompanion(character ? character.id : null));
    list.appendChild(btn);
  });
}

function selectCompanion(id) {
  record.companion = id;
  saveRecord();
  renderHome();
}

// 人物の画像を入れる。画像がまだない・読めないときは名前を文字で表示したままにする
function fillPortrait(box, character, src) {
  box.classList.remove('has-image');
  const name = document.createElement('span');
  name.className = 'portrait-name';
  name.textContent = character.name;
  const img = document.createElement('img');
  img.className = 'portrait-img';
  // お供の小さな顔はすぐ横に名前が出るので、読み上げが重ならないよう代替テキストを空にする
  img.alt = box.classList.contains('companion-face') ? '' : character.name;
  img.addEventListener('load', () => {
    if (img.parentNode === box) box.classList.add('has-image');
  });
  img.addEventListener('error', () => img.remove());
  img.src = src;
  box.replaceChildren(name, img);
  return box;
}

function setGauge(fillId, info) {
  const fill = document.getElementById(fillId);
  fill.style.width = `${(info.xpInLevel / info.xpForNext) * 100}%`;
  const gauge = fill.parentElement;
  gauge.setAttribute('aria-valuemax', info.xpForNext);
  gauge.setAttribute('aria-valuenow', info.xpInLevel);
}

function backToSelect() {
  clearEffects();
  currentSubject = currentUnit ? currentUnit.subject : currentSubject;
  renderHome();
  showScreen('screen-select');
}

// プレイ画面・結果画面から戻る先（苦手克服なら分野選択、通常なら単元選択）
function backToMenu() {
  if (currentUnit && currentUnit.isReview) {
    clearEffects();
    openReview();
  } else {
    backToSelect();
  }
}

// =============================================
// 苦手克服クエスト
// =============================================
// 苦手リストのキー：「分野::表示名」。同じ分野で表示名が同じ用語は1件として扱い、分野が違えば別の件にする
function weakKey(subject, label) {
  return `${subject}::${label}`;
}

// 苦手1件から出題する用語カード。最初に苦手登録された問題（source）を使い、
// 問題データが変わって見つからない場合だけ、同じ分野で同じ表示名の用語を使う
function resolveWeak(key, entry) {
  if (entry.source && termIndex.byId.has(entry.source)) return termIndex.byId.get(entry.source).term;
  const label = key.slice(entry.subject.length + 2);
  const mix = units.find(u => u.subject === entry.subject && u.isMix);
  return (mix && mix.terms.find(t => termLabel(t) === label)) || null;
}

function weakEntries(subject) {
  return Object.keys(record.weak)
    .filter(key => key.startsWith(`${subject}::`) && record.weak[key].subject === subject)
    .map(key => ({ key, term: resolveWeak(key, record.weak[key]), ...record.weak[key] }))
    .filter(e => e.term);
}

// 克服していない苦手用語（同じ表示名が並ばないよう1つにまとめる）
function weakPool(subject) {
  return uniqueByLabel(weakEntries(subject).filter(e => !e.mastered).map(e => e.term));
}

function weakCounts(subject) {
  const entries = weakEntries(subject);
  const mastered = entries.filter(e => e.mastered).length;
  return { weak: entries.length - mastered, mastered };
}

function renderReviewEntry() {
  const weak = SUBJECTS.reduce((sum, s) => sum + weakCounts(s).weak, 0);
  const mastered = SUBJECTS.reduce((sum, s) => sum + weakCounts(s).mastered, 0);
  document.getElementById('review-entry-count').textContent = weak > 0
    ? `苦手 ${weak}語 ／ 克服 ${mastered}語`
    : mastered > 0 ? `苦手用語なし ／ 克服 ${mastered}語` : '間違えた用語がここに集まります';
}

function openReview() {
  renderReview();
  showScreen('screen-review');
}

function renderReview() {
  const list = document.getElementById('review-list');
  list.innerHTML = '';
  SUBJECTS.forEach(subject => {
    const counts = weakCounts(subject);
    const pool = weakPool(subject);
    const card = document.createElement('div');
    card.className = 'review-card';

    const head = document.createElement('div');
    head.className = 'review-card-head';
    const name = document.createElement('span');
    name.className = 'review-subject';
    name.textContent = subject;
    const stats = document.createElement('span');
    stats.className = 'review-stats';
    stats.textContent = `苦手 ${counts.weak}語 ／ 克服 ${counts.mastered}語`;
    head.append(name, stats);
    card.appendChild(head);

    const best = record.reviewBest[subject];
    if (best !== undefined) {
      const bestEl = document.createElement('span');
      bestEl.className = 'review-best';
      bestEl.textContent = `復習ベスト ${best}`;
      card.appendChild(bestEl);
    }

    if (pool.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'review-empty';
      empty.textContent = '現在、苦手用語はありません';
      card.appendChild(empty);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary review-start';
      btn.textContent = `復習する（全${Math.min(QUESTIONS_PER_PLAY, pool.length)}問）`;
      btn.addEventListener('click', () => startReview(subject));
      card.appendChild(btn);
    }
    list.appendChild(card);
  });
}

function startReview(subject) {
  const pool = weakPool(subject);
  if (pool.length === 0) {
    clearEffects();
    openReview();
    return;
  }
  const mix = units.find(u => u.subject === subject && u.isMix);
  startQuest({
    subject,
    name: REVIEW_NAME,
    terms: pool,
    choicePool: mix.terms, // 誤答の候補は同じ分野の全用語から選ぶ（苦手が少なくても4択になる）
    isReview: true
  });
}

// 通常クエストで間違えた用語を苦手リストへ登録する（克服済みでも再登録し、正解回数は0に戻す）
// 同じ分野の別単元で同じ表示名の用語を間違えても件数は増やさず、最初に登録した問題を出題し続ける
function registerMistakes(terms) {
  terms.forEach(term => {
    const id = termIndex.idOf.get(term);
    if (!id) return;
    const subject = termIndex.byId.get(id).subject;
    const key = weakKey(subject, termLabel(term));
    const prev = record.weak[key];
    const source = prev && termIndex.byId.has(prev.source) ? prev.source : id;
    record.weak[key] = { subject, source, streak: 0, mastered: false };
  });
}

// 復習プレイの結果を苦手リストへ反映し、結果画面用の一覧を返す
function applyReviewResults() {
  return questions.map((q, i) => {
    const key = weakKey(currentUnit.subject, termLabel(q.correct));
    const entry = record.weak[key] ||
      { subject: currentUnit.subject, source: termIndex.idOf.get(q.correct), streak: 0, mastered: false };
    let status;
    if (results[i]) {
      entry.streak = Math.min(entry.streak + 1, REVIEW_CLEAR_COUNT);
      entry.mastered = entry.streak >= REVIEW_CLEAR_COUNT;
      status = entry.mastered ? 'mastered' : 'progress';
    } else {
      entry.streak = 0;
      entry.mastered = false;
      status = 'reset';
    }
    record.weak[key] = entry;
    return { term: q.correct, status, streak: entry.streak };
  });
}

// =============================================
// ボス戦（対象単元の用語から10問。時間制限なし）
// =============================================
function startBoss(boss) {
  startQuest({
    subject: boss.unit.subject,
    name: `ボス戦 ${boss.character.name}`,
    terms: boss.unit.terms,
    boss: boss.character
  });
}

// プレイ画面のボス表示とお供表示（画像はプレイの最初に1回だけ入れる）
function setupBattleCharacters() {
  const boss = currentUnit.boss;
  document.getElementById('boss-stage').classList.toggle('hidden', !boss);
  if (boss) {
    fillPortrait(document.getElementById('boss-portrait'), boss, boss.bossImage);
    document.getElementById('boss-name').textContent = boss.name;
    // お供を選んでいても、ボス戦では能力を使えないことを伝える
    const selected = selectedCompanion();
    const note = document.getElementById('boss-note');
    note.textContent = selected ? `ボス戦ではお供（${selected.name}）の能力は使えません` : '';
    note.classList.toggle('hidden', !selected);
  }

  document.getElementById('companion-hud').classList.toggle('hidden', !companion);
  if (companion) {
    fillPortrait(document.getElementById('companion-hud-face'), companion, companion.companionImage);
    document.getElementById('companion-hud-name').textContent = companion.name;
  }
}

// ボスの体力：撃破に必要な正解数から、これまでの正解数を引いた残り
function updateBossHp() {
  const remaining = Math.max(BOSS_CLEAR_COUNT - correctCount, 0);
  const fill = document.getElementById('boss-hp-fill');
  fill.style.width = `${(remaining / BOSS_CLEAR_COUNT) * 100}%`;
  const gauge = fill.parentElement;
  gauge.setAttribute('aria-valuemax', BOSS_CLEAR_COUNT);
  gauge.setAttribute('aria-valuenow', remaining);

  const left = questions.length - results.length;
  document.getElementById('boss-hint').textContent = remaining === 0 ? '撃破条件クリア！最後まで解こう'
    : remaining > left ? '今回は撃破できないけど、最後まで挑もう'
    : `あと${remaining}問正解で撃破`;
}

function updateCompanionHud() {
  const ability = ABILITIES[companion.ability];
  const status = document.getElementById('companion-hud-status');
  status.textContent = `${ability.name}：${guardUsed ? '使用済み' : '待機中'}`;
  status.classList.toggle('used', guardUsed);
}

// お供の「コンボ守り」：1プレイに1回だけ、2コンボ以上つながっていたときに使う
function canGuardCombo(lostCombo) {
  return !!companion && companion.ability === 'comboGuard' && !guardUsed &&
    lostCombo >= ABILITIES.comboGuard.minCombo;
}

// =============================================
// クエスト開始
// =============================================
function startQuest(unit) {
  clearEffects();
  currentUnit = unit;
  // お供の能力はボス戦では使わない（撃破条件を公平にするため）
  companion = unit.boss ? null : selectedCompanion();
  guardUsed = false;

  // 出題順はランダム、1プレイの中で同じ用語は出さない
  const pool = [...unit.terms];
  shuffle(pool);
  questions = pool.slice(0, questionCount(unit)).map(t => ({
    correct: t,
    choices: buildChoices(t, unit.choicePool || unit.terms)
  }));

  currentIndex = 0;
  score = 0;
  combo = 0;
  maxCombo = 0;
  correctCount = 0;
  mistakes = [];
  results = [];
  playRecorded = false;

  document.getElementById('hud-unit').textContent = `${unit.subject}：${unit.name}`;
  setupBattleCharacters();
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

    const tier = comboTier(combo);
    btn.classList.add('correct', 'hit');
    feedbackText.textContent = `⭕ ${PRAISES[tier]}!`;
    feedbackText.className = `feedback-text good tier-${tier}`;
    feedbackDetail.textContent = multiplier > 1
      ? `${combo}コンボ！ ×${multiplier} で +${points}点`
      : `+${points}点`;
    showScorePop(`+${points}`, tier);
    replayAnimation(document.getElementById('choices'), 'pulse');
    bump('hud-score');
    bump('hud-combo');
    if (combo === 3) showComboBanner('3 COMBO', 'tier-1');
    if (combo === 5) showComboBanner('5 COMBO ×2', 'tier-2');
    if (combo === 10) showComboBanner('10 COMBO ×3', 'tier-3');
    if (currentUnit.boss) replayAnimation(document.getElementById('boss-portrait'), 'damage');
    playSound('snd-correct');
  } else {
    const lostCombo = combo;
    // コンボ守りが発動したときはコンボだけを残す（不正解・苦手登録・ランクの扱いは通常どおり）
    const guarded = canGuardCombo(lostCombo);
    if (guarded) guardUsed = true;
    else combo = 0;
    mistakes.push(q.correct);

    btn.classList.add('wrong', 'miss');
    buttons.forEach(b => {
      if (b.querySelector('.choice-label').textContent === correctLabel) b.classList.add('correct');
    });
    feedbackText.textContent = '❌ 不正解';
    feedbackText.className = 'feedback-text bad';
    feedbackDetail.textContent = `正解：${correctLabel}` + (guarded ? `（${companion.name}が${lostCombo}コンボを守った！）`
      : lostCombo >= 2 ? `（${lostCombo}コンボが途切れた…）` : '');
    // コンボがつながっていたときだけ、控えめに知らせる
    if (guarded) showComboBanner('COMBO GUARD', 'guard');
    else if (lostCombo >= 2) showComboBanner('COMBO BREAK', 'break');
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
  if (e.key === 'Escape' && isResetDialogOpen()) {
    closeResetDialog();
    return;
  }
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
  // コンボ数に応じてHUDの色を段階的に変える（3・5・10コンボ）
  const box = document.getElementById('hud-combo').closest('.hud-box');
  const tier = comboTier(combo);
  [1, 2, 3].forEach(t => box.classList.toggle(`combo-tier-${t}`, tier === t));
  if (currentUnit.boss) updateBossHp();
  if (companion) updateCompanionHud();
}

// コンボ数 → 演出の段階（1〜2:0, 3〜4:1, 5〜9:2, 10以上:3）
function comboTier(count) {
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  if (count >= 3) return 1;
  return 0;
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
  replayAnimation(document.getElementById(id), 'bump');
}

function showScorePop(text, tier) {
  const pop = document.getElementById('score-pop');
  pop.textContent = text;
  pop.className = `score-pop tier-${tier}`;
  replayAnimation(pop, 'show');
}

// 画面中央に短時間だけ出すコンボ表示（操作の邪魔にならないようクリックは素通りさせる）
function showComboBanner(text, variant) {
  const banner = document.getElementById('combo-banner');
  banner.textContent = text;
  banner.className = `combo-banner ${variant}`;
  replayAnimation(banner, 'show');
}

// クラスを付け直して、CSSアニメーションを最初から再生する
function replayAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

// =============================================
// 結果表示
// =============================================
function showResult() {
  // 最後まで解いたプレイだけを記録する（「やめる」で中断したプレイはここに来ない）
  const outcome = recordPlay();

  const bossDefeated = !!(outcome && outcome.boss && outcome.boss.defeated);
  document.getElementById('result-kicker').textContent = !currentUnit.boss ? 'QUEST CLEAR'
    : bossDefeated ? 'BOSS DEFEATED' : 'BOSS BATTLE';
  document.getElementById('result-unit').textContent = `${currentUnit.subject}：${currentUnit.name}`;
  document.getElementById('result-score').textContent = score;
  document.getElementById('result-correct').textContent = `${correctCount}/${questions.length}`;
  document.getElementById('result-max-combo').textContent = maxCombo;
  document.getElementById('btn-back').textContent = currentUnit.isReview ? '苦手克服メニューへ戻る' : '単元選択へ戻る';
  if (outcome) renderOutcome(outcome);

  const title = document.getElementById('mistakes-title');
  const list = document.getElementById('mistakes-list');
  list.innerHTML = '';
  const note = document.getElementById('mistakes-note');
  note.textContent = currentUnit.isReview ? '' : '苦手克服クエストに登録しました';
  note.classList.toggle('hidden', currentUnit.isReview || mistakes.length === 0);

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

// ランク・自己ベスト・獲得XP・レベルアップの表示
function renderOutcome(o) {
  const rankEl = document.getElementById('result-rank');
  rankEl.textContent = o.rank;
  rankEl.className = `rank-badge rank-${o.rank}`;
  replayAnimation(rankEl, 'stamp');

  const misses = questions.length - correctCount;
  const cheer = document.getElementById('result-cheer');
  cheer.textContent = misses === 0 ? 'PERFECT CLEAR!' : misses === 1 ? 'あと1問でパーフェクト！' : '';
  cheer.classList.toggle('hidden', misses > 1);

  const best = document.getElementById('result-best');
  best.className = 'result-best';
  best.textContent = '';
  if (o.isNewBest) {
    const title = document.createElement('span');
    title.className = 'new-record';
    title.textContent = 'NEW RECORD';
    const sub = document.createElement('span');
    sub.className = 'new-record-sub';
    const firstText = currentUnit.isReview ? 'この分野の苦手克服で初記録！'
      : currentUnit.boss ? 'このボス戦の初記録！' : 'この単元の初記録！';
    sub.textContent = o.isFirst ? firstText : `自己ベスト更新（これまで ${o.prevBest}）`;
    best.append(title, sub);
    best.classList.add('new');
  } else {
    best.textContent = `自己ベスト ${o.prevBest}`;
  }

  document.getElementById('result-next-xp').textContent =
    `累計 ${record.totalXp} XP ／ 次のレベルまで あと ${o.after.xpToNextLevel} XP`;
  document.getElementById('result-save-warning').classList.toggle('hidden', o.saved);
  renderReviewProgress(o.review);
  renderBossResult(o.boss);
  playXpAnimation(o);
}

// ボス戦の結果：撃破できたか、初撃破でお供が解放されたか
function renderBossResult(boss) {
  const box = document.getElementById('boss-result');
  box.classList.toggle('hidden', !boss);
  if (!boss) return;
  const { character } = boss;
  box.classList.toggle('defeated', boss.defeated);
  fillPortrait(document.getElementById('boss-result-portrait'), character, character.bossImage);
  document.getElementById('boss-result-title').textContent = boss.defeated ? `${character.name}を撃破！` : '撃破ならず…';
  document.getElementById('boss-result-detail').textContent = boss.firstDefeat
    ? `${character.name}がお供になった！ホーム画面でお供に選べます`
    : boss.defeated ? `${questions.length}問中${correctCount}問正解で勝利`
    : `あと${BOSS_CLEAR_COUNT - correctCount}問正解で撃破。もう一度挑戦しよう`;
}

// 苦手克服クエストの結果：用語ごとに「克服」「あと1回」「やり直し」を表示
function renderReviewProgress(review) {
  const box = document.getElementById('review-result');
  box.classList.toggle('hidden', !review);
  if (!review) return;
  const list = document.getElementById('review-progress');
  list.innerHTML = '';
  review.forEach(r => {
    const li = document.createElement('li');
    li.className = `review-item ${r.status}`;
    const term = document.createElement('span');
    term.className = 'review-item-term';
    term.textContent = termLabel(r.term);
    const status = document.createElement('span');
    status.className = 'review-item-status';
    status.textContent = r.status === 'mastered' ? '✨ 克服達成！'
      : r.status === 'progress' ? `あと${REVIEW_CLEAR_COUNT - r.streak}回正解で克服`
      : 'もう一度練習しよう';
    li.append(term, status);
    list.appendChild(li);
  });
}

// 獲得XPのカウントアップ → ゲージが伸びる → レベルアップ表示、の順に見せる
function playXpAnimation(o) {
  const gained = document.getElementById('result-xp-gained');
  const levelEl = document.getElementById('result-level');
  const levelUp = document.getElementById('level-up');
  const leveledUp = o.after.level > o.before.level;

  const showLevelUp = () => {
    levelEl.textContent = `Lv.${o.after.level}`;
    if (!leveledUp) return;
    document.getElementById('level-up-detail').textContent = `Lv.${o.before.level} → Lv.${o.after.level}`;
    levelUp.classList.remove('hidden');
    replayAnimation(levelUp, 'play');
    if (!prefersReducedMotion()) burstParticles();
  };

  levelUp.classList.add('hidden');
  if (prefersReducedMotion()) {
    gained.textContent = `+${o.xpGained}`;
    setGauge('result-xp-fill', o.after);
    showLevelUp();
    return;
  }

  levelEl.textContent = `Lv.${o.before.level}`;
  countUp(gained, o.xpGained, 700);

  // ゲージはプレイ前の位置から始める
  const fill = document.getElementById('result-xp-fill');
  setGaugeInstant(fill, o.before);
  if (!leveledUp) {
    later(() => setGauge('result-xp-fill', o.after), 100);
    return;
  }
  // レベルが上がるときは、いったん満タンにしてから新しいレベルのゲージを伸ばす
  later(() => { fill.style.width = '100%'; }, 100);
  later(() => {
    setGaugeInstant(fill, { xpInLevel: 0, xpForNext: 1 });
    showLevelUp();
    later(() => setGauge('result-xp-fill', o.after), 100);
  }, 1000);
}

function setGaugeInstant(fill, info) {
  fill.style.transition = 'none';
  fill.style.width = `${(info.xpInLevel / info.xpForNext) * 100}%`;
  void fill.offsetWidth;
  fill.style.transition = '';
}

// 獲得XPを0から数え上げる（タイマーで進めるので、最後は必ず目標の数字になる）
function countUp(el, target, duration) {
  const steps = 20;
  el.textContent = '+0';
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    later(() => {
      el.textContent = `+${Math.round(target * (1 - Math.pow(1 - t, 3)))}`;
    }, duration * t);
  }
}

// ピクセル風の紙吹雪（数十個の小さな四角を飛ばし、終わったら消す）
function burstParticles() {
  const box = document.getElementById('particles');
  box.innerHTML = '';
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 90;
    p.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * distance - 30}px`);
    p.style.setProperty('--delay', `${Math.random() * 120}ms`);
    p.style.background = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
    box.appendChild(p);
  }
  later(() => { box.innerHTML = ''; }, 1500);
}

function later(fn, ms) {
  effectTimers.push({ timeout: setTimeout(fn, ms) });
}

function clearEffects() {
  effectTimers.forEach(t => clearTimeout(t.timeout));
  effectTimers = [];
  document.getElementById('particles').innerHTML = '';
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 間違えた数からランクを決める
// 苦手克服のように問題数が少ないときも妥当になるよう、正答率の目安と比べて低い方のランクにする
// （10問・8問の単元はこれまでと同じ結果になる）
function rankFor(correct, total) {
  const misses = total - correct;
  const byMisses = misses === 0 ? 'S' : misses === 1 ? 'A' : misses <= 3 ? 'B' : misses <= 5 ? 'C' : 'D';
  const ratio = total > 0 ? correct / total : 0;
  const byRatio = ratio === 1 ? 'S' : ratio >= 0.85 ? 'A' : ratio >= 0.6 ? 'B' : ratio >= 0.375 ? 'C' : 'D';
  return RANKS[Math.max(RANKS.indexOf(byMisses), RANKS.indexOf(byRatio))];
}

// =============================================
// 記録（レベル・XP・自己ベスト）
// =============================================
function defaultRecord() {
  return {
    version: 1, totalXp: 0, totalPlays: 0, totalCorrect: 0, bestScores: {}, bestRanks: {}, lastUnit: null,
    // 苦手克服：weak は { "分野::表示名": { subject, source（最初に登録した問題のID「単元名::用語」）,
    //   streak（復習の連続正解回数）, mastered（克服済み） } }
    weak: {}, reviewBest: {},
    // ボス戦：bossBest は { 人物ID: 自己ベスト }、bossDefeated は { 人物ID: true }（撃破済み＝お供として解放済み）
    // companion は選んでいるお供の人物ID（なしは null）
    bossBest: {}, bossDefeated: {}, companion: null
  };
}

// 保存データがない・壊れている・読めない場合は、初期状態で始める
function loadRecord() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    storageAvailable = false;
    return defaultRecord();
  }
  if (!raw) return defaultRecord();
  try {
    return sanitizeRecord(JSON.parse(raw));
  } catch (e) {
    return defaultRecord();
  }
}

// 読み込んだデータのうち、正しい形の値だけを使う
function sanitizeRecord(data) {
  const rec = defaultRecord();
  if (!data || typeof data !== 'object') return rec;
  rec.totalXp = toCount(data.totalXp);
  rec.totalPlays = toCount(data.totalPlays);
  rec.totalCorrect = toCount(data.totalCorrect);
  if (data.bestScores && typeof data.bestScores === 'object' && !Array.isArray(data.bestScores)) {
    Object.keys(data.bestScores).forEach(key => {
      const value = data.bestScores[key];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
        rec.bestScores[key] = Math.min(Math.floor(value), MAX_COUNT);
      }
    });
  }
  if (data.bestRanks && typeof data.bestRanks === 'object' && !Array.isArray(data.bestRanks)) {
    Object.keys(data.bestRanks).forEach(key => {
      if (RANKS.includes(data.bestRanks[key])) rec.bestRanks[key] = data.bestRanks[key];
    });
  }
  if (typeof data.lastUnit === 'string') rec.lastUnit = data.lastUnit;
  if (isPlainObject(data.weak)) rec.weak = migrateWeak(data.weak);
  if (isPlainObject(data.reviewBest)) {
    SUBJECTS.forEach(s => {
      const v = data.reviewBest[s];
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) rec.reviewBest[s] = Math.min(Math.floor(v), MAX_COUNT);
    });
  }
  // ボス戦の記録（この項目がない以前の保存データでは、初期状態のまま）
  if (isPlainObject(data.bossBest)) {
    Object.keys(data.bossBest).forEach(id => {
      const v = data.bossBest[id];
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) rec.bossBest[id] = Math.min(Math.floor(v), MAX_COUNT);
    });
  }
  if (isPlainObject(data.bossDefeated)) {
    Object.keys(data.bossDefeated).forEach(id => {
      if (data.bossDefeated[id] === true) rec.bossDefeated[id] = true;
    });
  }
  // 選んでいたお供は、撃破済みで今も能力のある人物のときだけ使う
  if (typeof data.companion === 'string' && rec.bossDefeated[data.companion] && companionById(data.companion)) {
    rec.companion = data.companion;
  }
  return rec;
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

// 苦手リストを「分野::表示名」のキーに揃える。
// 以前の方式（キーが「単元名::用語」）で保存されたデータもここで変換する。
// 同じキーにまとまる件が複数あるときの統合ルール：
// - 出題する問題（source）は、先に登録された件（保存データで前にある件）のものを使う
// - 克服済みになるのは、まとめた件がすべて克服済みのときだけ
// - 克服前の連続正解回数は、克服していない件のうち少ない方に合わせる（早すぎる克服を防ぐ）
function migrateWeak(raw) {
  const result = {};
  Object.keys(raw).forEach(oldKey => {
    const e = raw[oldKey];
    if (!isPlainObject(e)) return;

    let key;
    let subject;
    let source = typeof e.source === 'string' ? e.source : null;
    const head = oldKey.split('::')[0];
    if (SUBJECTS.includes(head)) {
      // 新しい方式
      key = oldKey;
      subject = head;
    } else if (termIndex.byId.has(oldKey)) {
      // 以前の方式：単元ごとの用語ID
      const info = termIndex.byId.get(oldKey);
      subject = info.subject;
      key = weakKey(subject, termLabel(info.term));
      source = oldKey;
    } else {
      // 今の問題データにない用語：消さずに残しておく（画面には出さない）
      if (SUBJECTS.includes(e.subject)) result[oldKey] = cleanWeakEntry(e, e.subject, source);
      return;
    }

    const entry = cleanWeakEntry(e, subject, source);
    result[key] = result[key] ? mergeWeakEntries(result[key], entry) : entry;
  });
  return result;
}

function cleanWeakEntry(e, subject, source) {
  // 克服前の連続正解回数は「克服に必要な回数 − 1」までに収める
  const mastered = e.mastered === true;
  const streak = Math.min(toCount(e.streak), mastered ? REVIEW_CLEAR_COUNT : REVIEW_CLEAR_COUNT - 1);
  return { subject, source, streak, mastered };
}

function mergeWeakEntries(first, second) {
  const source = first.source && termIndex.byId.has(first.source) ? first.source : (second.source || first.source);
  const mastered = first.mastered && second.mastered;
  const streak = mastered
    ? REVIEW_CLEAR_COUNT
    : Math.min(first.mastered ? Infinity : first.streak, second.mastered ? Infinity : second.streak);
  return { subject: first.subject, source, streak, mastered };
}

function toCount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.min(Math.floor(value), MAX_COUNT)
    : 0;
}

function saveRecord() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    storageAvailable = true;
    return true;
  } catch (e) {
    storageAvailable = false;
    return false;
  }
}

// 1プレイ分を記録する。同じプレイで2回呼ばれても1回分しか加算しない
function recordPlay() {
  if (playRecorded) return null;
  playRecorded = true;

  // 自己ベストは、苦手克服は分野ごと、ボス戦は人物ごとに、通常の単元別自己ベストとは別に記録する
  const isReview = !!currentUnit.isReview;
  const boss = currentUnit.boss || null;
  const bestTable = isReview ? record.reviewBest : boss ? record.bossBest : record.bestScores;
  const key = isReview ? currentUnit.subject : boss ? boss.id : unitKey(currentUnit);
  const prevBest = bestTable[key];
  const before = levelInfo(record.totalXp);
  const xpGained = correctCount * XP_PER_CORRECT;

  record.totalXp = Math.min(record.totalXp + xpGained, MAX_COUNT);
  record.totalPlays = Math.min(record.totalPlays + 1, MAX_COUNT);
  record.totalCorrect = Math.min(record.totalCorrect + correctCount, MAX_COUNT);
  const isFirst = prevBest === undefined;
  const isNewBest = isFirst || score > prevBest;
  if (isNewBest) bestTable[key] = score;

  const rank = rankFor(correctCount, questions.length);
  let review = null;
  let bossOutcome = null;
  if (isReview) {
    review = applyReviewResults();
  } else if (boss) {
    // ボス戦は「前回の単元」と単元ボタンのランクを変えない。間違えた用語は通常どおり苦手リストへ登録する
    const defeated = correctCount >= BOSS_CLEAR_COUNT;
    const firstDefeat = defeated && !record.bossDefeated[boss.id];
    if (defeated) record.bossDefeated[boss.id] = true;
    registerMistakes(mistakes);
    bossOutcome = { character: boss, defeated, firstDefeat };
  } else {
    // 単元ボタンに出すランクは、その単元でこれまでに取った一番よいランク
    const prevRank = record.bestRanks[key];
    if (!prevRank || RANKS.indexOf(rank) < RANKS.indexOf(prevRank)) record.bestRanks[key] = rank;
    record.lastUnit = key;
    registerMistakes(mistakes);
  }

  const saved = saveRecord();
  return {
    xpGained, before, after: levelInfo(record.totalXp), prevBest, isFirst, isNewBest, rank, review, boss: bossOutcome, saved
  };
}

// レベルLからL+1に上がるのに必要なXP
function xpForLevel(level) {
  return LEVEL_BASE_XP + (level - 1) * LEVEL_STEP_XP;
}

// 累計XPから、現在のレベルとレベル内の進み具合を求める
function levelInfo(totalXp) {
  let level = 1;
  let rest = totalXp;
  while (rest >= xpForLevel(level)) {
    rest -= xpForLevel(level);
    level++;
  }
  const xpForNext = xpForLevel(level);
  return { level, xpInLevel: rest, xpForNext, xpToNextLevel: xpForNext - rest };
}

// =============================================
// 記録のリセット（確認画面つき）
// =============================================
function openResetDialog() {
  document.getElementById('reset-dialog').classList.remove('hidden');
  document.getElementById('btn-reset-cancel').focus();
}

function closeResetDialog() {
  document.getElementById('reset-dialog').classList.add('hidden');
  document.getElementById('btn-reset').focus();
}

function isResetDialogOpen() {
  return !document.getElementById('reset-dialog').classList.contains('hidden');
}

function resetRecord() {
  record = defaultRecord();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // 保存できない環境では、画面上の記録を初期状態に戻すだけ
  }
  closeResetDialog();
  renderHome();
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
