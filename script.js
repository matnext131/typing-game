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

    // New mode selection elements
    const modeSelectionDiv = document.getElementById('mode-selection');
    const easyModeButton = document.getElementById('easy-mode-button');
    const hardModeButton = document.getElementById('hard-mode-button');

    // Game state variables
    let questions = [];
    let originalQuestions = []; // 順番通りモード用に元の問題を保持
    let currentQuestionIndex = 0;
    let score = 0;
    let time = 60;
    let timerInterval;
    let totalTypedChars = 0;
    let currentMode = null;
    let selectedTopicText = ''; // 選択されたトピックの問題文を保持

    // --- Password Configuration ---
    const CORRECT_PASSWORD = "shakai131"; // ここに設定したいパスワードを入力してください

    // --- Password Check Function ---
    function checkPassword() {
        if (passwordInput.value === CORRECT_PASSWORD) {
            passwordScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            loadTopics();
        } else {
            passwordMessage.textContent = 'パスワードが間違っています。';
            passwordMessage.classList.remove('hidden');
        }
    }

    // --- Topic Data (Embedded to avoid fetch issues) ---
    const topics = {
        '社会科モード': {
            '第１編世界と日本の姿': `緯度(いど)\n経度(けいど)\n標準時子午線(ひょうじゅんじしごせん)\n兵庫県明石市(ひょうごけんあかしし)\n日付変更線(ひづけへんこうせん)\n排他的経済水域(はいたてきけいざいすいいき)\n北方領土(ほっぽうりょうど)\n竹島(たけしま)\n尖閣諸島(せんかくしょとう)\n領土(りょうど)\n領空(りょうくう)\n領海(りょうかい)\n都道府県(とどうふけん)\n県庁所在地(けんちょうしょざいち)\n地方区分(ちほうくぶん)\n六大陸(ろくたいりく)\n三大洋(さんたいよう)\n気候帯(きこうたい)\n熱帯(ねったい)\n乾燥帯(かんそうたい)\n温帯(おんたい)\n冷帯（亜寒帯）(れいたい（あかんたい）)\n寒帯(かんたい)`,
            '日本の地理': `北海道(ほっかいどう)\n本州(ほんしゅう)\n四国(しこく)\n九州(きゅうしゅう)\n沖縄(おきなわ)\n富士山(ふじさん)\n琵琶湖(びわこ)\n利根川(とねがわ)\n石狩平野(いしかりへいや)\n関東平野(かんとうへいや)`,
            '第２編世界のさまざまな地域第１章世界各地の人々の生活と環境': ``
        }
    };

    // --- Topic Loading ---
    function loadTopics() {
        topicList.innerHTML = '';
        messageElement.textContent = 'モードを選択してください。';

        if (currentMode === null) {
            Object.keys(topics).forEach(modeName => {
                const button = document.createElement('a');
                button.className = 'list-group-item list-group-item-action topic-button';
                button.textContent = modeName;
                button.onclick = () => selectMode(modeName);
                topicList.appendChild(button);
            });
        } else {
            Object.keys(topics[currentMode]).forEach(topicName => {
                const button = document.createElement('a');
                button.className = 'list-group-item list-group-item-action topic-button';
                button.textContent = topicName;
                button.onclick = () => selectTopic(topicName);
                topicList.appendChild(button);
            });
            const backToModeButton = document.createElement('button');
            backToModeButton.className = 'btn btn-secondary btn-block mt-3';
            backToModeButton.textContent = 'モード選択に戻る';
            backToModeButton.onclick = () => {
                currentMode = null;
                loadTopics();
            };
            topicList.appendChild(backToModeButton);
        }
    }

    function selectMode(modeName) {
        currentMode = modeName;
        loadTopics();
    }

    function selectTopic(topicName) {
        correctSound.play();
        correctSound.pause();
        incorrectSound.play();
        incorrectSound.pause();

        selectedTopicText = topics[currentMode][topicName]; // 選択されたトピックの問題文を保存

        if (selectedTopicText) {
            selectionScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            modeSelectionDiv.classList.remove('hidden'); // モード選択ボタンを表示
            startButton.classList.add('hidden'); // ゲーム開始ボタンを隠す
            resetGame();
            questionElement.textContent = 'モードを選択してください'; // モード選択を促すメッセージ
        } else {
            console.error('Selected topic not found:', topicName);
            alert('選択されたトピックが見つかりませんでした。');
        }
    }

    function parseQuestions(text) {
        originalQuestions = text.split('\n').map(line => {
            const match = line.match(/(.+?)(?:（|\()(.+?)(?:）|\))/);
            if (match) {
                return { display: match[1].trim(), answer: match[2].trim() };
            }
            return null;
        }).filter(q => q && q.display && q.answer);
        questions = [...originalQuestions]; // 初期状態は順番通り
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
        // questionElement.textContent = '準備完了'; // モード選択を促すためコメントアウト
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

    // --- Mode Selection Logic ---
    easyModeButton.addEventListener('click', () => {
        parseQuestions(selectedTopicText); // 元の問題順に戻す
        startButton.classList.remove('hidden'); // ゲーム開始ボタンを表示
        questionElement.textContent = '準備完了'; // 準備完了メッセージ
        modeSelectionDiv.classList.add('hidden'); // モード選択ボタンを隠す
        resetGame();
    });

    hardModeButton.addEventListener('click', () => {
        parseQuestions(selectedTopicText); // 元の問題をロード
        // 問題をシャッフル
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        startButton.classList.remove('hidden'); // ゲーム開始ボタンを表示
        questionElement.textContent = '準備完了'; // 準備完了メッセージ
        modeSelectionDiv.classList.add('hidden'); // モード選択ボタンを隠す
        resetGame();
    });

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
});