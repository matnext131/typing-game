document.addEventListener('DOMContentLoaded', () => {
    // Sound elements
    const correctSound = document.getElementById('correct-sound');
    const incorrectSound = document.getElementById('incorrect-sound');

    // Screen elements
    const passwordScreen = document.getElementById('password-screen');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordMessage = document.getElementById('password-message');
    const mainContent = document.getElementById('main-content');

    const selectionScreen = document.getElementById('selection-screen');
    const gameScreen = document.getElementById('game-screen');
    const topicList = document.getElementById('topic-list');
    const questionElement = document.getElementById('question');
    const inputElement = document.getElementById('input');
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const wpmElement = document.getElementById('wpm');
    const messageElement = document.getElementById('message');
    const startButton = document.getElementById('start-button');
    const backButton = document.getElementById('back-to-selection');
    const modeSelectionDiv = document.getElementById('mode-selection');
    const easyModeButton = document.getElementById('easy-mode-button');
    const hardModeButton = document.getElementById('hard-mode-button');

    // Game state variables
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let time = 60;
    let timerInterval;
    let totalTypedChars = 0;
    let currentMode = null; // 現在選択されているモードを保持する変数
    let selectedTopicText = ''; // 選択されたトピックの原文を保持する変数

    // --- Password Configuration ---
    const CORRECT_PASSWORD = "shakai131"; // ここに設定したいパスワードを入力してください

    // --- Password Check Function ---
    function checkPassword() {
        if (passwordInput.value === CORRECT_PASSWORD) {
            passwordScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            loadTopics(); // パスワードが正しければトピックをロード
        } else {
            passwordMessage.textContent = 'パスワードが間違っています。';
            passwordMessage.classList.remove('hidden');
        }
    }

    // --- Topic Data (Embedded to avoid fetch issues) ---
    const topics = {
        '社会科モード': {
            '第１編世界と日本の姿': `
アジア州(あじあしゅう)
アフリカ州(あふりかしゅう)
アフリカ大陸(あふりかたいりく)
緯線(いせん)
緯度(いど)
インド洋(いんどよう)
択捉島(えとろふとう)
オーストラリア大陸(おーすとらりあたいりく)
沖ノ鳥島(おきのとりしま)
オセアニア州(おせあにあしゅう)
海洋(かいよう)
北アメリカ州(きたあめりかしゅう)
北アメリカ大陸(きたあめりかたいりく)
北回帰線(きたかいきせん)
北半球(きたはんきゅう)
旧グリニッジ天文台(きゅうぐりにっじてんもんだい)
極夜(きょくや)
経線(けいせん)
経度(けいど)
県庁所在地(けんちょうしょざいち)
公海(こうかい)
国境(こっきょう)
三大洋(さんたいよう)
時差(じさ)
州(しゅう)
人口密度(じんこうみつど)
正距方位図法(せいきょほういずほう)
世界地図(せかいちず)
赤道(せきどう)
接続水域(せつぞくすいいき)
尖閣諸島(せんかくしょ)
大西洋(たいせいよう)
対せき点(たいせきてん)
太平洋(たいへいよう)
大陸(たいりく)
竹島(たけしま)
地球儀(ちきゅうぎ)
中華人民共和国(ちゅうかじんみんきょうわこく)
都道府県(とどうふけん)
内陸国(ないりくこく)
南極大陸(なんきょくたいりく)
日本列島(にほんれっとう)
排他的経済水域(はいたてきけいざいすいいき)
バチカン市国(ばちかんしこく)
白夜(びゃくや)
標準時(ひょうじゅんじ)
標準時子午線(ひょうじゅんじしごせん)
北方領土(ほっぽうりょうど)
本初子午線(ほんしょしごせん)
南アメリカ州(みなみあめりかしゅう)
南アメリカ大陸(みなみあめりかたいりく)
南回帰線(みなみかいきせん)
南鳥島(みなみとりしま)
南半球(みなみはんきゅう)
メルカトル図法(めるかとるずほう)
モルワイデ図法(もるわいで図法)
ユーラシア大陸(ゆーらしあたいりく)
ヨーロッパ州(よーろっぱしゅう)
与那国島(よなぐにじま)
陸地(りくち)
領域(りょういき)
領海(りょうかい)
領空(りょうくう)
領土(りょうど)
六大陸(ろくたいりく)
ロシア連邦(ろしあれんぽう)`,
            '日本の地理': `北海道(ほっかいどう)
本州(ほんしゅう)
四国(しこく)
九州(きゅうしゅう)
沖縄(おきなわ)
富士山(ふじさん)
琵琶湖(びわこ)
利根川(とねがわ)
石狩平野(いしかりへいや)
関東平野(かんとうへいや)`,
            '第２編世界のさまざまな地域第１章世界各地の人々の生活と環境':`
寒帯(かんたい)
カリブー(かりぶー)
イヌイット(いぬいっと)
イグルー(いぐるー)
亜寒帯（冷帯）(あかんたい（れいたい）)
針葉樹(しんようじゅ)
タイガ(たいが)
広葉樹(こうようじゅ)
ダーチャ(だーちゃ)
温帯(おんたい)
地中海性気候(ちちゅうかいせいきこう)
温暖湿潤気候(おんだんしつじゅんきこう)
西岸海洋性気候(せいがんかいようせいきこう)
乾燥帯(かんそうたい)
オアシス(おあしす)
サヘル(さへる)
遊牧(ゆうぼく)
砂漠化(さばくか)
焼畑農業(やきはたのうぎょう)
砂漠化(さばくか)
熱帯(ねったい)
熱帯雨林(ねったいうりん)
マングローブ(まんぐろーぶ)
さんご礁(さんごしょう)
持続可能な開発(じぞくかのうなかいはつ)
標高(ひょうこう)
放牧(ほうぼく)
高山気候(こうざんきこう)
リャマ(りゃま)
アルパカ(あるぱか)
ポンチョ(ぽんちょ)
マチュピチュ(まちゅぴちゅ)
気候帯(きこうたい)
気候区(きこうく)
氷雪気候(ひょうせつきこう)
ツンドラ気候(つんどらきこう)
砂漠気候(さばくきこう)
ステップ気候(すてっぷきこう)
熱帯雨林気候(ねったいうりんきこう)
サバナ気候(さばなきこう)
仏教(ぶっきょう)
大乗仏教(だいじょうぶっきょう)
上座部仏教(じょうざぶぶっきょう)
キリスト教(きりすときょう)
イスラーム(いすらーむ)
ハラル(はらる)
ヒンドゥー教(ひんどぅーきょう)
ユダヤ教(ゆだやきょう)
ムスリム(むすりむ) `,
        }
    };

    // --- Topic Loading ---
    function loadTopics() {
        topicList.innerHTML = ''; // Clear existing topics
        messageElement.textContent = 'モードを選択してください。'; // メッセージ変更

        // モード選択画面
        if (currentMode === null) {
            Object.keys(topics).forEach(modeName => {
                const button = document.createElement('a');
                button.className = 'list-group-item list-group-item-action topic-button';
                button.textContent = modeName;
                button.onclick = () => selectMode(modeName); // selectMode関数を呼び出す
                topicList.appendChild(button);
            });
        } else { // トピック選択画面
            Object.keys(topics[currentMode]).forEach(topicName => {
                const button = document.createElement('a');
                button.className = 'list-group-item list-group-item-action topic-button';
                button.textContent = topicName;
                button.onclick = () => selectTopic(topicName); // selectTopic関数を呼び出す
                topicList.appendChild(button);
            });
            // トピック選択画面では「モード選択に戻る」ボタンを表示
            const backToModeButton = document.createElement('button');
            backToModeButton.className = 'btn btn-secondary btn-block mt-3';
            backToModeButton.textContent = 'モード選択に戻る';
            backToModeButton.onclick = () => {
                currentMode = null; // モードをリセット
                loadTopics(); // モード選択画面に戻る
            };
            topicList.appendChild(backToModeButton);
        }
    }

    // 新しい関数：モード選択
    function selectMode(modeName) {
        currentMode = modeName;
        loadTopics(); // 選択されたモードのトピックをロード
    }

    // 既存のselectTopic関数を修正
    function selectTopic(topicName) {
        // --- Audio Unlock Workaround ---
        correctSound.play();
        correctSound.pause();
        incorrectSound.play();
        incorrectSound.pause();
        // --------------------------------

        // 選択されたモード内のトピックを取得
        const text = topics[currentMode][topicName];
        if (text) {
            selectedTopicText = text; // Store the original text
            parseQuestions(text);
            selectionScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            resetGame();
        } else {
            console.error('Selected topic not found:', topicName);
            alert('選択されたトピックが見つかりませんでした。');
        }
    }

    function parseQuestions(text) {
        questions = text.split('\n').map(line => {
            const match = line.match(/(.+?)(?:（|\()(.+?)(?:）|\))/);
            if (match) {
                return { display: match[1].trim(), answer: match[2].trim() };
            }
            return null;
        }).filter(q => q && q.display && q.answer);
    }

     // --- Game Logic ---
     function resetGame() {
         inputElement.disabled = true;
         inputElement.value = '';
         messageElement.textContent = '「ゲーム開始」ボタンを押してスタート！';
         messageElement.className = 'alert alert-info mt-4';
         startButton.style.display = 'block';
         startButton.textContent = 'ゲーム開始';
         backButton.classList.add('hidden');
         score = 0;
         time = 60;
         totalTypedChars = 0;
         currentQuestionIndex = 0;
         scoreElement.textContent = score;
         timerElement.textContent = time;
         wpmElement.textContent = 0;
         questionElement.textContent = '準備完了';
         modeSelectionDiv.classList.remove('hidden');
     }

     function startGame() {
         if (questions.length === 0) {
             alert('問題がありません。');
             return;
         }

         inputElement.disabled = false;
         inputElement.value = '';
         inputElement.focus();
         messageElement.textContent = 'タイピングを開始してください。';
         startButton.style.display = 'none';
         backButton.classList.add('hidden');
         modeSelectionDiv.classList.add('hidden'); // モード選択ボタンを隠す
         time = 60;
         score = 0;
         totalTypedChars = 0;
         currentQuestionIndex = 0;
         scoreElement.textContent = score;
         timerElement.textContent = time;
         wpmElement.textContent = 0;
         setNextQuestion();
         startTimer();
     }

     function setNextQuestion() {
         if (currentQuestionIndex >= questions.length) {
             endGame();
             return;
         }
         questionElement.textContent = questions[currentQuestionIndex].display;
         inputElement.value = '';
     }

     function startTimer() {
         stopTimer();
         timerInterval = setInterval(() => {
             time--;
             timerElement.textContent = time;
             calculateWPM();
             if (time <= 0) {
                 endGame();
             }
         }, 1000);
     }

     function stopTimer() {
         clearInterval(timerInterval);
     }

     function calculateWPM() {
         const elapsedTime = 60 - time;
         if (elapsedTime === 0) {
             wpmElement.textContent = 0;
             return;
         }
         const wpm = Math.round((totalTypedChars / 5) / (elapsedTime / 60));
         wpmElement.textContent = wpm;
     }

     function checkInput() {
         if (currentQuestionIndex >= questions.length) return;

         const currentQuestion = questions[currentQuestionIndex];
         const inputText = inputElement.value;
         const answer = currentQuestion.answer;

         if (inputText === answer) {
             correctSound.currentTime = 0;
             correctSound.play();
             score++;
             totalTypedChars += answer.length;
             scoreElement.textContent = score;
             currentQuestionIndex++;
             inputElement.value = '';
             inputElement.focus();
              setTimeout(setNextQuestion, 100);
         } else if (answer.startsWith(inputText)) {
             questionElement.innerHTML = `<span>${currentQuestion.display}</span>`;
         } else {
             questionElement.innerHTML = `<span class="incorrect">${currentQuestion.display}</span>`;
         }
     }

     function endGame() {
         stopTimer();
         inputElement.disabled = true;
         const finalWPM = wpmElement.textContent;
         messageElement.textContent = `ゲーム終了！スコア: ${score}, WPM: ${finalWPM}`;
         messageElement.className = 'alert alert-success mt-4';
         startButton.textContent = 'もう一度プレイ';
         startButton.style.display = 'block';
         backButton.classList.remove('hidden');
         modeSelectionDiv.classList.remove('hidden'); // モード選択ボタンを再表示
     }

     function goBackToSelection() {
         gameScreen.classList.add('hidden');
         selectionScreen.classList.remove('hidden');
         currentMode = null;
         loadTopics();
         modeSelectionDiv.classList.add('hidden'); // モード選択ボタンを隠す
     }

    // --- Event Listeners ---
    passwordSubmit.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });

    startButton.addEventListener('click', startGame);
    inputElement.addEventListener('input', checkInput);
    backButton.addEventListener('click', goBackToSelection);
    inputElement.addEventListener('focus', () => {
        setTimeout(() => {
            inputElement.value = '';
        }, 0);
    });

    easyModeButton.addEventListener('click', () => {
        parseQuestions(selectedTopicText); // 元の問題順に戻す
        startGame();
    });

    hardModeButton.addEventListener('click', () => {
        parseQuestions(selectedTopicText); // 元の問題をロード
        // 問題をシャッフル
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        startGame();
    });
});

// --- Helper Functions ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}