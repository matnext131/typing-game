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
    let currentMode = null; // 'タイピングモード' or 'クイズモード'
    let selectedTopicText = '';

    const CORRECT_PASSWORD = "shakai131";

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

    const topics = {
        'タイピングモード': {
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
熱帯雨林気候(ne
ttaiu
rin
kikou)
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
            'アジア州':`
ヒマラヤ山脈(ひまらやさんみゃく)
稲作(いなさく)
季節風(きせつふう)
雨季(うき)
乾季(かんき)
華人(かじん)
ヒンドゥー教(ひんどぅーきょう)
イスラム教(いすらむきょう)
植民地(しょくみんち)
キリスト教(きりすときょう)
アジアNISE(あじあにーず)
ハイテク産業(はいてくさんぎょう)
ニュータウン(にゅーたうん)
漢族(かんぞく)
華北(かほく)
華中(かちゅう)
華南(かなん)
東北地方(とうほくちほう)
経済特区(けいざいとっく)
世界の工場(せかいのこうじょう)
西部大開発(せいぶだいかいはつ)
経済格差(けいざいかくさ)
ハングル(はんぐる)
二期作(にきさく)
プランテーション(ぷらんてーしょん)
マングローブ(まんぐろーぶ)
東南アジア諸国連合(とうなんあじあしょこくれんごう)
ASEAN(あせあん)
スラム(すらむ)
パーム油(ぱーむゆ)
再生可能エネルギー(さいせいかのうえねるぎー)
ICT産業(あいしーてぃーさんぎょう)
コーラン(こーらん)
食料自給率(しょくりょうじきゅうりつ)
石油輸出国機構(せきゆゆしゅつこくきこう)
OPEC(おぺっく)
乾燥帯(かんそうたい)
メッカ(めっか)
レアメタル(れあめたる)
人工知能(じんこうちのう)`,
            'ヨーロッパ州': `
暖流(だんりゅう)
北大西洋海流(きたたいせいようかいりゅう)
偏西風(へんせいふう)
フィヨルド(ふぃよるど)
民族(みんぞく)
キリスト教(きりすときょう)
ヨーロッパ連合(よーろっぱれんごう)
EU(いーゆー)
ゲルマン系言語(げるまんけいげんご)
ラテン系言語(らてんけいげんご)
スラブ系言語(すらぶけいげんご)
ユーロ(ゆーろ)
バカンス(ばかんす)
ヨーロッパ共同体(よーろっぱきょうどうたい)
ユーロスター(ゆーろすたー)
酸性雨(さんせいう)
ライン川(らいんがわ)
国際河川(こくさいかせん)
脱炭素社会(だつたんそしゃかい)
地球温暖化(ちきゅうおんだんか)
再生可能エネルギー(さいせいかのうえねるぎー)
持続可能な社会(じぞくかのうなしゃかい)
ルーラル・ツーリズム(るーらる・つーりずむ)
エコツーリズム(えこつーりずむ)
オーバーツーリズム(おーばーつーりずむ)
パークアンドライド(ぱーくあんどらいど)
経済格差(けいざいかくさ)
国民総所得(こくみんそうしょとく)
ハイテク産業(はいてくさんぎょう)
外国人労働者(がいこくじんろうどうしゃ)
植民地(しょくみんち)
公用語(こうようご)
移民(いみん)`
        },
        'クイズモード': {
            '地理クイズ': `
世界の大州の１つ。ユーラシア大陸のヨーロッパ以外の地域の州(アジア州)
六大州の１つ。地中海を挟んでヨーロッパの南に位置する。赤道を挟んで南北双方に広い面積をもつ唯一の大陸。(アフリカ州)
六大陸の１つ。スエズ地峡の西側の部分を占める大陸。(アフリカ大陸)
同じ緯度どうしを結んだ横の線のこと。(緯線)
地球上の地点の位置を表す座標の１つ。赤道を0度とし、北極・南極を９０度とする。(緯度)
三大洋の一つ。三大洋中最も小さい。(インド洋)
北海道千島列島南部に位置する同列島内で面積が最大の島。(択捉島)
六大陸の１つ。面積では最小の大陸。(オーストラリア大陸)
東京都小笠原村に属する、北緯20度25分、東経136度04分に位置する日本最南端の島。(沖ノ鳥島)
六大州の最小の州。別名大洋州。(オセアニア州)
地球の表面上の、海水におおわれた部分のこと。海洋の面積は約３億６千万平方kmで、およそ７割をしめる。(海洋)
六大州の一つ。カナダ、アメリカ合衆国、メキシコからパナマにいたる北アメリカ大陸の国と、キューバなどカリブ海の国からなる。(北アメリカ州)
六大陸の１つ。パナマ地峡より北側の部分のこと。(北アメリカ大陸)
北緯約23.4度の緯線のこと。(北回帰線)
赤道を境とする地球の北側の半分。(北半球)
子午線決定のために1675年に設置された天文台のこと。(旧グリニッジ天文台)
北極圏の北緯66.6度より北で、冬至の期間、全く太陽が昇らず昼でも薄暗い現象のこと。(極夜)
同じ経度どうしを結んだたての線のこと。(経線)
地球上の位置を表す座標。ある地点を通る子午線と本初子午線との間の角度。(経度)
都道府県にある行政機関の本庁舎が置かれている都市のこと。(県庁所在地)
どの国の領海でもない海のこと。(公海)
国と国との境目のこと。(国境)
太平洋、大西洋、インド洋のこと。大洋は「大きな海」という意味。(三大洋)
地球上の二地点間の各標準時の差。東京都ロンドンでは15時間違う。(時差)
大陸の中で文化的にとらえた区分のこと。(州)
人口統計において、単位面積である1平方キロメートルあたりに居住する人の数により定義される数値。人口÷面積で求める(人口密度)
中心からの距離と方位が正しい。地球全体が真円で表される図法。航空図に利用される。(正距方位図法)
地球全体や諸外国の地理を示した地図。(世界地図)
北極と南極の中間にあたる点を結んだ線。緯度０度を示す。(赤道)
領海の外側に接している水域。(接続水域)
沖縄県石垣市に所在する、魚釣島などからなる島々の総称。(尖閣諸島)
三大洋の１つ。西にある大きな海。(大西洋)
ある地点から地球の中心に引いた線をのばして、地球上の正反対にあたった地点のこと。(対せき点（対蹠点）)
三大洋の１つ。世界最大の海洋。横断したマゼランが、「静かな海」と名付けたことが語源。(太平洋)
海面上に広がる大きな陸地のこと。陸地のなかでも大きさ６番目までをさす。(大陸)
日本の隠岐諸島と韓国の鬱陵島の間に位置する岩山からなる島。 韓国が不法占拠している。(竹島)
地球をそのままの形で縮めた模型。面積・形・距離・方位などを同時に、ほぼ正しく表す。(地球儀)
東アジアに位置する社会主義共和制国家。首都は北京。人口世界２位。(中華人民共和国)
日本の地方公共団体である「都」「道」「府」「県」の総称。(都道府県)
陸地に囲まれて海に面していない国のこと。(内陸国)
六大陸の１つ。ほとんどが氷におおわれていて、人間は定住していない。(南極大陸)
ユーラシア大陸東端の沿岸沖、東アジアに位置、また太平洋北西の沿海部に位置する弧状列島の一つ。(日本列島)
領海の基線からその外側２００海里の線までの海域とその海底及びその下。(排他的経済水域)
南ヨーロッパに位置する国家で、その領域はローマ市内にある。国土面積は世界最小。(バチカン市国)
北極圏の北緯66.6度より北で、夏至の期間、全く太陽が沈まず夜でも完全に暗くならい現象のこと。(白夜)
世界の基準になる時刻のこと。(標準時)
別名は本初子午線。国や地域の時刻の基準となる子午線のこと。(標準時子午線)
択捉島、国後島、色丹島、歯舞群島のこと。ロシアに不法に占拠されている。(北方領土)
経度0度の基準となる経線。世界標準時の基準でイギリスのロンドンを通る。(本初子午線)
六大州の一つ。全体が西半球にあり、大部分が南半球にある。国の数は、12 カ国である。(南アメリカ州)
六大陸の１つ。パナマ地峡より南側の部分のこと。(南アメリカ大陸)
南緯約23.4度の緯線のこと。(南回帰線)
東京より南東に約1、860kmに位置し、航空機では片道約4時間を要す日本の最東端の島。(南鳥島)
赤道を境とする地球の南側の半分。(南半球)
角度が正しく、海図に使わる図法。(メルカトル図法)
面積だけが正しく距離は正しくない地図に使われる。(モルワイデ図法)
六大陸の１つで、世界最大の１つで世界最大の大陸。(ユーラシア大陸)
六大州の一つ。面積から見ると世界で２番目に小さな大州。(ヨーロッパ州)
南西諸島八重山列島の島。日本の最西端に位置する島。(与那国島)
地球の表面で、水におおわれていない部分。(陸地)
領有している区域。領土・領海・領空からなる。(領域)
沿岸国の主権がおよぶ海域のこと。(領海)
「領土」と「領空」の上空のこと。(領空)
国家が領有する陸地のこと。(領土)
ユーラシア、アフリカ、北アメリカ、南アメリカ、南極、オーストラリアの６つの大陸のこと。(六大陸)
ユーラシア大陸北部に位置する連邦共和制国家。面積世界１位。首都はモスクワ。(ロシア連邦)
`
        },
    };

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

        const text = topics[currentMode][topicName];
        if (text) {
            selectedTopicText = text;
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
        questions = text.split('\n').filter(line => line.trim() !== '').map(line => {
            const match = line.match(/(.+?)(?:（|\()(.+?)(?:）|\))/);
            if (match) {
                const answer = currentMode === 'タイピングモード' ? match[1].trim() : match[2].trim();
                return { display: match[1].trim(), answer: answer };
            }
            return null;
        }).filter(q => q);
    }

    function resetGame() {
        inputElement.disabled = true;
        inputElement.value = '';
        messageElement.className = 'alert alert-info mt-4';
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

        if (currentMode === 'タイピングモード') {
            timerElement.parentElement.style.display = 'block';
            wpmElement.parentElement.style.display = 'block';
            easyModeButton.style.display = 'inline-block';
            hardModeButton.style.display = 'inline-block';
            startButton.style.display = 'none';
            messageElement.textContent = '難易度を選択してください';
        } else if (currentMode === 'クイズモード') {
            timerElement.parentElement.style.display = 'block';
            wpmElement.parentElement.style.display = 'none';
            easyModeButton.style.display = 'none';
            hardModeButton.style.display = 'none';
            startButton.style.display = 'inline-block';
            messageElement.textContent = '下のボタンを押してクイズを開始';
        }
    }

    function startGame() {
        if (questions.length === 0) {
            alert('問題がありません。');
            return;
        }

        inputElement.disabled = false;
        inputElement.value = '';
        inputElement.focus();
        messageElement.textContent = 'がんばれ！';
        startButton.style.display = 'none';
        backButton.classList.add('hidden');
        modeSelectionDiv.classList.add('hidden');
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
            if (currentMode === 'タイピングモード') {
                calculateWPM();
            }
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

    function checkTypingInput() {
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
            setTimeout(setNextQuestion, 100);
        } else if (answer.startsWith(inputText)) {
            questionElement.innerHTML = `<span>${currentQuestion.display}</span>`;
        } else {
            questionElement.innerHTML = `<span class="incorrect">${currentQuestion.display}</span>`;
        }
    }

    function checkQuizInput() {
        if (currentQuestionIndex >= questions.length) return;
        const currentQuestion = questions[currentQuestionIndex];
        const inputText = inputElement.value;

        if (inputText.trim() === currentQuestion.answer) {
            correctSound.currentTime = 0;
            correctSound.play();
            score++;
            scoreElement.textContent = score;
            currentQuestionIndex++;
            inputElement.value = '';
            setTimeout(setNextQuestion, 100);
        } else {
            incorrectSound.currentTime = 0;
            incorrectSound.play();
            questionElement.classList.add('incorrect');
            setTimeout(() => {
                questionElement.classList.remove('incorrect');
            }, 300);
        }
    }

    function endGame() {
        stopTimer();
        inputElement.disabled = true;
        let endMessage = `ゲーム終了！ スコア: ${score}`;
        if (currentMode === 'タイピングモード') {
            const finalWPM = wpmElement.textContent;
            endMessage += `, WPM: ${finalWPM}`;
        }
        messageElement.textContent = endMessage;
        messageElement.className = 'alert alert-success mt-4';
        backButton.classList.remove('hidden');
        modeSelectionDiv.classList.remove('hidden');
    }

    function goBackToSelection() {
        gameScreen.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
        currentMode = null;
        loadTopics();
        modeSelectionDiv.classList.add('hidden');
    }

    // --- Event Listeners ---
    passwordSubmit.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });

    inputElement.addEventListener('input', () => {
        if (currentMode === 'タイピングモード') {
            checkTypingInput();
        }
    });
    inputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && currentMode === 'クイズモード') {
            checkQuizInput();
        }
    });

    backButton.addEventListener('click', goBackToSelection);

    easyModeButton.addEventListener('click', () => {
        parseQuestions(selectedTopicText);
        startGame();
    });

    hardModeButton.addEventListener('click', () => {
        parseQuestions(selectedTopicText);
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        startGame();
    });

    startButton.addEventListener('click', startGame);
});
