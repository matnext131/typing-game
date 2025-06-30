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

    // Game state variables
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let time = 60;
    let timerInterval;
    let totalTypedChars = 0;
    let currentMode = null; // 現在選択されているモードを保持する変数

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
            '第１編世界と日本の姿': `\\nアジア州(あじあしゅう)\\nアフリカ州(あふりかしゅう)\\nアフリカ大陸(あふりかたいりく)\\n緯線(いせん)\\n緯度(いど)\\nインド洋(いんどよう)\\n択捉島(えとろふとう)\\nオーストラリア大陸(おーすとらりあたいりく)\\n沖ノ鳥島(おきのとりしま)\\nオセアニア州(おせあにあしゅう)\\n海洋(かいよう)\\n北アメリカ州(きたあめりかしゅう)\\n北アメリカ大陸(きたあめりかたいりく)\\n北回帰線(きたかいきせん)\\n北半球(きたはんきゅう)\\n旧グリニッジ天文台(きゅうぐりにっじてんもんだい)\\n極夜(きょくや)\\n経線(けいせん)\\n経度(けいど)\\n県庁所在地(けんちょうしょざ)\\n公海(こうかい)\\n国境(こっきょう)\\n三大洋(さんたいよう)\\n時差(じさ)\\n州(しゅう)\\n人口密度(じんこうみつど)\\n正距方位図法(せいきょほういずほう)\\n世界地図(せかいちず)\\n赤道(せきどう)\\n接続水域(せつぞくすいいき)\\n尖閣諸島(せんかくしょ)\\n大西洋(たいせいよう)\\n対せき点(たいせきてん)\\n太平洋(たいへいよう)\\n大陸(たいりく)\\n竹島(たけしま)\\n地球儀(ちきゅうぎ)\\n中華人民共和国(ちゅうかじんみんきょうわこく)\\n都道府県(とどうふけん)\\n内陸国(ないりくこく)\\n南極大陸(なんきょくたいりく)\\n日本列島(にほんれっとう)\\n排他的経済水域(はいたてきけいざいすいいき)\\nバチカン市国(ばちかんしこく)\\n白夜(びゃくや)\\n標準時(ひょうじゅんじ)\\n標準時子午線(ひょうじゅんじしごせん)\\n北方領土(ほっぽうりょうど)\\n本初子午線(ほんしょしごせん)\\n南アメリカ州(みなみあめりかしゅう)\\n南アメリカ大陸(みなみあめりかたいりく)\\n南回帰線(みなみかいきせん)\\n南鳥島(みなみとりしま)\\n南半球(みなみはんきゅう)\\nメルカトル図法(めるかとるずほう)\\nモルワイデ図法(もるわいで図法)\\nユーラシア大陸(ゆーらしあたいりく)\\nヨーロッパ州(よーろっぱしゅう)\\n与那国島(よなぐにじま)\\n陸地(りくち)\\n領域(りょういき)\\n領海(りょうかい)
\\n領空(りょうくう)\\n領土(りょうど)\\n六大陸(ろくたいりく)\\nロシア連邦(ろしあれんぽう)`,
            '日本の地理': `北海道(ほっかいどう)\n本州(ほんしゅう)\n四国(しこく)\n九州(きゅうしゅう)\n沖縄(おきなわ)\n富士山(ふじさん)\n琵琶湖(びわこ)\n利根川(とねがわ)\n石狩平野(いしかりへいや)\n関東平野(かんとうへいや)`,
            '第２編世界のさまざまな地域第１章世界各地の人々の生活と環境':`\\n寒帯(かんたい)\\nカリブー(かりぶー)\\nイヌイット(いぬいっと)\\nイグルー(いぐるー)\\n亜寒帯(あかんたい)\\n針葉樹(しんようじゅ)\\nタイガ(たいが)\\n広葉樹(こうようじゅ)\\nダーチャ(だーちゃ)\\n温帯(おんたい)\\n地中海性気候(ちちゅうかいせいきこう)\\n温暖湿潤気候(おんだんしつじゅんきこう)\\n西岸海洋性気候(せいがんかいようせいきこう)\\n乾燥帯(かんそうたい)\\nオアシス(おあしす)\\nサヘル(さへる)\\n遊牧(ゆうぼく)\\n砂漠化(さばくか)\\n焼畑農業(やきはたのうぎょう)\\n熱帯(ねったい)\\n熱帯雨林(ねったいうりん)\\nマングローブ(まんぐろーぶ)\\nさんご礁(さんごしょう)\\n持続可能な開発(じぞくかのうなかいはつ)\\n標高(ひょうこう)\\n放牧(ほうぼく)\\n高山気候(こうざんきこう)\\nリャマ(りゃま)\\nアルパカ(あるぱか)\\nポンチョ(ぽんちょ)\\nマチュピチュ(まちゅぴちゅ)\\n気候帯(きこうたい)\\n気候区(きこうく)\\n氷雪気候(ひょうせつきこう)\\nツンドラ気候(つんどらきこう)\\n砂漠気候(さばくきこう)\\nステップ気候(すてっぷきこう)\\n熱帯雨林気候(ねったいうりんきこう)\\nサバナ気候(さばなきこう)\\n仏教(ぶっきょう)\\n大乗仏教(だいじょうぶっきょう)\\n上座部仏教(じょうざぶぶっきょう)\\nキリスト教(きりすときょう)\\nイスラーム(いすらーむ)\\nハラル(はらる)\\nヒンドゥー教(ひんどぅーきょう)\\nユダヤ教(ゆだやきょう)\\nムスリム(むすりむ) `,
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
    }

    function goBackToSelection() {
        gameScreen.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
        currentMode = null; // モードをリセットして、モード選択画面に戻る
        loadTopics();
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

    // --- Initial Load ---
    // DOMContentLoaded イベントリスナー内で、パスワードチェック後に loadTopics() を呼び出す部分は
    // checkPassword 関数内で呼び出されるため、ここでは不要
});