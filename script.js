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

    // Game state variables
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let time = 60;
    let timerInterval;
    let totalTypedChars = 0;
    let consecutiveCorrect = 0;
    let currentMode = null;
    let currentTypingCategory = null;
    let currentQuizCategory = null;
    let selectedTopicText = '';
    let isHardMode = false;

    const CORRECT_PASSWORD = "shakai131";

    function getGameElements() {
        return {
            selectionScreen: document.getElementById('selection-screen'),
            gameScreen: document.getElementById('game-screen'),
            topicList: document.getElementById('topic-list'),
            questionElement: document.getElementById('question'),
            inputElement: document.getElementById('input'),
            timerElement: document.getElementById('timer'),
            scoreElement: document.getElementById('score'),
            wpmElement: document.getElementById('wpm'),
            consecutiveCorrectElement: document.getElementById('consecutive-correct'),
            messageElement: document.getElementById('message'),
            startButton: document.getElementById('start-button'),
            backButton: document.getElementById('back-to-selection'),
            modeSelectionDiv: document.getElementById('mode-selection'),
            easyModeButton: document.getElementById('easy-mode-button'),
            hardModeButton: document.getElementById('hard-mode-button'),
            wpmContainer: document.getElementById('wpm-container'),
            consecutiveContainer: document.getElementById('consecutive-container')
        };
    }

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
            '地理モード': {
                '第１編世界と日本の姿': `
アジア州(あじあしゅう)
アフリカ州(あふりかしゅう)
アフリカ大陸(あふりかたいりく)
緯線(いせん)
緯度(id)
インド洋(indoyou)
択捉島(etoro-fu-tou)
オーストラリア大陸(o-sutoraria-tairiku)
沖ノ鳥島(okinotori-shima)
オセアニア州(oseania-shuu)
海洋(kaiyou)
北アメリカ州(kita-amerika-shuu)
北アメリカ大陸(kita-amerika-tairiku)
北回帰線(kita-kaikisen)
北半球(kita-hankyuu)
旧グリニッジ天文台(kyuu-gurinnijji-tenmondai)
極夜(kyokuya)
経線(keisen)
経度(keido)
県庁所在地(kenchou-shozaichi)
公海(koukai)
国境(kokkyou)
三大洋(san-taiyou)
時差(jisa)
州(shuu)
人口密度(jinkou-mitsudo)
正距方位図法(seikyo-houi-zuhou)
世界地図(sekai-chizu)
赤道(sekidou)
接続水域(setsuzoku-suiiki)
尖閣諸島(senkaku-shotou)
大西洋(taiseiyou)
対せき点(taisekiten)
太平洋(taiheiyou)
大陸(tairiku)
竹島(takeshima)
地球儀(chikyuugi)
中華人民共和国(chuuka-jinmin-kyouwakoku)
都道府県(todoufuken)
内陸国(nairikukoku)
南極大陸(nankyoku-tairiku)
日本列島(nihon-rettou)
排他的経済水域(haitateki-keizai-suiiki)
バチカン市国(bachikan-shikoku)
白夜(byakuya)
標準時(hyoujunji)
標準時子午線(hyoujunji-shigosen)
北方領土(hoppou-ryoudo)
本初子午線(honsho-shigosen)
南アメリカ州(minami-amerika-shuu)
南アメリカ大陸(minami-ame-rika-tairiku)
南回帰線(minami-kaikisen)
南鳥島(minami-torishima)
南半球(minami-hankyuu)
メルカトル図法(merukatoru-zuhou)
モルワイデ図法(moruwaide-zuhou)
ユーラシア大陸(yu-rashia-tairiku)
ヨーロッパ州(yo-roppa-shuu)
与那国島(yonaguni-jima)
陸地(rikuchi)
領域(ryouiki)
領海(ryoukai)
領空(ryoukuu)
領土(ryoudo)
六大陸(roku-tairiku)
ロシア連邦(roshia-renpou)`,
                '日本の地理': `北海道(hokkaidou)
本州(honshuu)
四国(shikoku)
九州(kyuushuu)
沖縄(okinawa)
富士山(fujisan)
琵琶湖(biwako)
利根川(tonegawa)
石狩平野(ishikari-heiya)
関東平野(kantou-heiya)`,
                '第２編世界のさまざまな地域第１章世界各地の人々の生活と環境':`
寒帯(kantai)
カリブー(karibu-)
イヌイット(inuitto)
イグルー(iguru-)
亜寒帯（冷帯）(akan-tai-reitai)
針葉樹(shin-youju)
タイガ(taiga)
広葉樹(kouyouju)
ダーチャ(da-cha)
温帯(ontai)
地中海性気候(chichuukai-sei-kikou)
温暖湿潤気候(ondan-shitsujun-kikou)
西岸海洋性気候(seigan-kaiyou-sei-kikou)
乾燥帯(kansoutai)
オアシス(oashisu)
サヘル(saheru)
遊牧(yuuboku)
砂漠化(sabakuka)
焼畑農業(yakihata-nougyou)
熱帯(nettai)
熱帯雨林(nettai-urin)
マングローブ(manguro-bu)
さんご礁(sango-shou)
持続可能な開発(jizoku-kanou-na-kaihatsu)
標高(hyoukou)
放牧(houboku)
高山気候(kouzan-kikou)
リャマ(ryama)
アルパカ(arupaka)
ポンチョ(poncho)
マチュピチュ(machupichu)
気候帯(kikoutai)
気候区(kikouku)
氷雪気候(hyousetsu-kikou)
ツンドラ気候(tsundora-kikou)
砂漠気候(sabaku-kikou)
ステップ気候(suteppu-kikou)
熱帯雨林気候(nettai-urin-kikou)
サバナ気候(sabana-kikou)
仏教(bukkyou)
大乗仏教(daijou-bukkyou)
上座部仏教(jouzabu-bukkyou)
キリスト教(kirisuto-kyou)
イスラーム(isura-mu)
ハラル(hararu)
ヒンドゥー教(hindu-kyou)
ユダヤ教(yudaya-kyou)
ムスリム(musurimu)`,
                'アジア州':`
ヒマラヤ山脈(himaraya-sanmyaku)
稲作(inasaku)
季節風(kisetsufuu)
雨季(uki)
乾季(kanki)
華人(kajin)
ヒンドゥー教(hindu-kyou)
イスラム教(isuramu-kyou)
植民地(shokuminchi)
キリスト教(kirisuto-kyou)
アジアNIES(ajia-ni-zu)
ハイテク産業(haiteku-sangyou)
ニュータウン(nyu-taun)
漢族(kanzoku)
華北(kahoku)
華中(kachuu)
華南(kanan)
東北地方(touhoku-chihou)
経済特区(keizai-tokku)
世界の工場(sekai-no-koujou)
西部大開発(seibu-daikaihatsu)
経済格差(keizai-kakusa)
ハングル(hanguru)
二期作(nisaku)
プランテーション(purante-shon)
マングローブ(manguro-bu)
東南アジア諸国連合(tounan-ajia-shokoku-rengou)
ASEAN(asean)
スラム(suramu)
パーム油(pa-mu-yu)
再生可能エネルギー(saisei-kanou-enerugi-)
ICT産業(ai-shi-ti-sangyou)
コーラン(ko-ran)
食料自給率(shokuryou-jikyuu-ritsu)
石油輸出国機構(sekiyu-yushutsu-kikou)
OPEC(opekku)
乾燥帯(kansoutai)
メッカ(mekka)
レアメタル(reametaru)
人工知能(jinkou-chinou)`,
                'ヨーロッパ州': `
暖流(danryuu)
北大西洋海流(kita-taiseiyou-kairyuu)
偏西風(henseifuu)
フィヨルド(fiyorudo)
民族(minzoku)
キリスト教(kirisuto-kyou)
ヨーロッパ連合(yo-roppa-rengou)
EU(i-yu-)
ゲルマン系言語(geruman-kei-gengo)
ラテン系言語(raten-kei-gengo)
スラブ系言語(surabu-kei-gengo)
ユーロ(yu-ro)
バカンス(bakansu)
ヨーロッパ共同体(yo-roppa-kyoudoutai)
ユーロスター(yu-ro-suta-)
酸性雨(sanseiu)
ライン川(rain-gawa)
国際河川(kokusai-kasen)
脱炭素社会(datsutanso-shakai)
地球温暖化(chikyuu-ondanka)
再生可能エネルギー(saisei-kanou-enerugi-)
持続可能な社会(jizoku-kanou-na-shakai)
ルーラル・ツーリズム(ru-raru-tsu-rizumu)
エコツーリズム(ekotsu-rizumu)
オーバーツーリズム(o-ba-tsu-rizumu)
パークアンドライド(pa-ku-ando-raido)
経済格差(keizai-kakusa)
国民総所得(kokumin-soushotoku)
ハイテク産業(haiteku-sangyou)
外国人労働者(gaikokujin-roudousha)
植民地(shokuminchi)
公用語(kouyougo)
移民(imin)`
            },
            '歴史モード': {
                '世界の古代文明と宗教のおこり': `
猿人(enjin)
氷河時代(hyougajidai)
打製石器(daseisekki)
原人(genjin)
新人(shinjin)
クロマニョン人(kuromanyonjin)
旧石器時代(kyuusekkijidai)
岩宿遺跡(iwajuku-iseki)
土器(doki)
磨製石器(maseisekki)
新石器時代(shinsekkijidai)
農耕(noukou)
牧畜(bokuchiku)
青銅器(seidouki)
鉄器(tekki)
文明(bunmei)
エジプト文明(ejiputo-bunmei)
太陽暦(taiyoureki)
象形文字(shoukeimoji)
メソポタミア文明(mesopotamia-bunmei)
くさび形文字(kusabigata-moji)
太陰暦(taiinreki)
60進法(rokujusshin-hou)
七曜制(shichiyousei)
オリエント(oriento)
ハンムラビ法典(hanmurabi-houtenn)
インダス文明(indasu-bunmei)
モヘンジョ・ダロ(mohenjo-daro)
カースト制(ka-suto-sei)
中国文明(chuugoku-bunmei)
殷(in)
甲骨文字(koukotsu-moji)
春秋・戦国時代(shunjuu-sengoku-jidai)
孔子(koushi)
儒学(jugaku)
秦(shin)
始皇帝(shikoutei)
万里の長城(banri-no-choujou)
漢(kan)
シルクロード(shirukuro-do)
ポリス(porisu)
民主政(minshusei)
ギリシャ文明(girisha-bunmei)
アレクサンドロス大王(arekusan-dorosu-daiou)
パルテノン神殿(parutenon-shinden)
ヘレニズム(herenizumu)
共和政(kyouwasei)
帝政(teisei)
ローマ帝国(ro-ma-teikoku)
シャカ(shaka)
仏教(bukkyou)
ユダヤ教(yudaya-kyou)
イエス(iesu)
キリスト教(kirisuto-kyou)
ムハンマド(muhanmado)
イスラーム(isura-mu)
エルサレム(erusaremu)`,
                '日本列島の誕生と大陸との交流': `
岩宿遺跡(iwajuku-iseki)
黒曜石(kokuyouseki)
縄文土器(joumon-doki)
縄文時代(joumon-jidai)
三内丸山遺跡(sannai-maruyama-iseki)
貝塚(kaizuka)
たて穴住居(tateana-juukyo)
土偶(doguu)
屈葬(kussou)
稲作(inasaku)
高床倉庫(takayuka-souko)
弥生土器(yayoi-doki)
弥生時代(yayoi-jidai)
銅鐸(doutaku)
「漢書」地理志(kansho-chirishi)
「後漢書」東夷伝(gokansho-touiden)
漢委奴国王(kan-no-wa-no-na-no-kokuou)
邪馬台国(yamatai-koku)
魏志倭人伝(gishi-wajinden)
卑弥呼(himiko)
朝貢(choukou)
親魏倭王(shin-gi-wa-ou)
吉野ヶ里遺跡(yoshinogari-iseki)
登呂遺跡(toro-iseki)
豪族(gou-zoku)
大和政権(yamato-seiken)
古墳(kofun)
古墳時代(kofun-jidai)
大王(ookimi)
大仙古墳(daisen-kofun)
埴輪(haniwa)
前方後円墳(zenpou-kouen-fun)
稲荷山古墳(inari-yama-kofun)
江田船山古墳(etafunayama-kofun)
高句麗(koukuri)
百済(kudara)
新羅(shiragi)
伽耶地域(kaya-chiiki)
「宋書」倭国伝(sousho-wakokuden)
渡来人(toraijin)
須恵器(sueki)`
            }
        }
    };

    function loadTopics() {
        const { topicList, messageElement } = getGameElements();
        if (!topicList) {
            console.error("topicList element not found.");
            return;
        }
        topicList.innerHTML = '';
        let currentSelection = topics;
        let backFunction = null;
        let message = 'モードを選択してください。';

        if (currentMode) {
            currentSelection = topics[currentMode];
            message = 'カテゴリを選択してください。';
            backFunction = () => {
                currentMode = null;
                loadTopics();
            };
        }

        if (currentMode === 'タイピングモード' && currentTypingCategory) {
            currentSelection = topics[currentMode][currentTypingCategory];
            message = 'トピックを選択してください。';
            backFunction = () => {
                currentTypingCategory = null;
                loadTopics();
            };
        }

        if (currentMode === 'クイズモード' && currentQuizCategory) {
            currentSelection = topics[currentMode][currentQuizCategory];
            message = 'トピックを選択してください。';
            backFunction = () => {
                currentQuizCategory = null;
                loadTopics();
            };
        }

        messageElement.textContent = message;

        Object.keys(currentSelection).forEach(name => {
            const button = document.createElement('a');
            button.className = 'list-group-item list-group-item-action topic-button';
            button.textContent = name;
            button.onclick = () => {
                if (!currentMode) {
                    selectMode(name);
                } else if (currentMode === 'タイピングモード' && !currentTypingCategory) {
                    selectTypingCategory(name);
                } else if (currentMode === 'クイズモード' && !currentQuizCategory) {
                    selectQuizCategory(name);
                } else {
                    selectTopic(name);
                }
            };
            topicList.appendChild(button);
        });

        if (backFunction) {
            const backButton = document.createElement('button');
            backButton.className = 'btn btn-secondary btn-block mt-3';
            backButton.textContent = '戻る';
            backButton.onclick = backFunction;
            topicList.appendChild(backButton);
        }
    }

    function selectMode(modeName) {
        currentMode = modeName;
        loadTopics();
    }

    function selectTypingCategory(categoryName) {
        currentTypingCategory = categoryName;
        loadTopics();
    }

    function selectQuizCategory(categoryName) {
        currentQuizCategory = categoryName;
        loadTopics();
    }

    function selectTopic(topicName) {
        console.log(`トピック選択: ${topicName}`);
        const { selectionScreen, gameScreen } = getGameElements();

        let text;
        if (currentMode === 'タイピングモード') {
            text = topics[currentMode][currentTypingCategory][topicName];
        } else if (currentMode === 'クイズモード') {
            text = topics[currentMode][currentQuizCategory][topicName];
        }

        if (typeof text === 'string') {
            selectedTopicText = text;
            parseQuestions(text);
            if (selectionScreen) selectionScreen.classList.add('hidden');
            if (gameScreen) gameScreen.classList.remove('hidden');
            resetGame();
        } else {
            console.error('Selected topic not found or is not a string:', topicName);
            if (currentMode === 'タイピングモード') {
                currentTypingCategory = topicName;
            }
            loadTopics();
        }
    }

    function parseQuestions(text) {
        console.log("問題の解析を開始");
        questions = text.split('\n').filter(line => line.trim() !== '').map(line => {
            const match = line.match(/(.*)(?:（|\()([^）)]+)(?:）|\))$/);
            if (match) {
                const display = match[1].trim();
                const answer = match[2].trim();
                return { display: display, answer: answer };
            }
            return null;
        }).filter(q => q && q.display && q.answer);
        console.log(`解析後の問題数: ${questions.length}`);
    }

    function resetGame() {
        console.log("resetGame function entered");
        const { inputElement, messageElement, backButton, scoreElement, timerElement, wpmElement, consecutiveCorrectElement, questionElement, modeSelectionDiv, wpmContainer, consecutiveContainer, easyModeButton, hardModeButton, startButton } = getGameElements();

        if (inputElement) {
            inputElement.disabled = true;
            inputElement.value = '';
            inputElement.classList.remove('is-invalid');
        }
        if (messageElement) messageElement.className = 'alert alert-info mt-4';
        if (backButton) backButton.classList.add('hidden');
        score = 0;
        time = 60;
        totalTypedChars = 0;
        consecutiveCorrect = 0;
        currentQuestionIndex = 0;
        if (scoreElement) scoreElement.textContent = score;
        if (timerElement) timerElement.textContent = time;
        if (wpmElement) wpmElement.textContent = 0;
        if (consecutiveCorrectElement) consecutiveCorrectElement.textContent = 0;
        if (questionElement) questionElement.textContent = '準備完了';
        if (modeSelectionDiv) modeSelectionDiv.classList.remove('hidden');

        if (currentMode === 'タイピングモード') {
            if (wpmContainer) wpmContainer.style.display = 'block';
            if (consecutiveContainer) consecutiveContainer.style.display = 'none';
            if (easyModeButton) easyModeButton.style.display = 'inline-block';
            if (hardModeButton) hardModeButton.style.display = 'inline-block';
            if (startButton) startButton.style.display = 'none';
            if (messageElement) messageElement.textContent = '難易度を選択してください';
        } else if (currentMode === 'クイズモード') {
            if (wpmContainer) wpmContainer.style.display = 'none';
            if (consecutiveContainer) consecutiveContainer.style.display = 'block';
            if (easyModeButton) easyModeButton.style.display = 'inline-block';
            if (hardModeButton) hardModeButton.style.display = 'inline-block';
            if (startButton) startButton.style.display = 'none';
            if (messageElement) messageElement.textContent = '難易度を選択してください';
        }
        console.log("ゲームのリセット完了");
        attachGameEventListeners();
    }

    function attachGameEventListeners() {
        const { inputElement, backButton, easyModeButton, hardModeButton, startButton } = getGameElements();

        const replaceWithClone = (element) => {
            if (element && element.parentNode) {
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                return newElement;
            }
            return null;
        };

        const newBackButton = replaceWithClone(backButton);
        if (newBackButton) newBackButton.addEventListener('click', goBackToSelection);

        const newEasyButton = replaceWithClone(easyModeButton);
        if (newEasyButton) newEasyButton.addEventListener('click', () => startGame(false));

        const newHardButton = replaceWithClone(hardModeButton);
        if (newHardButton) newHardButton.addEventListener('click', () => startGame(true));

        const newStartButton = replaceWithClone(startButton);
        if (newStartButton) newStartButton.addEventListener('click', () => startGame(false));

        const newInputElement = replaceWithClone(inputElement);
        if (newInputElement) {
            newInputElement.addEventListener('input', () => {
                if (currentMode === 'タイピングモード') {
                    checkTypingInput();
                }
            });
            newInputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && currentMode === 'クイズモード') {
                    checkQuizInput();
                }
            });
        }
    }

    function startGame(hardMode) {
        isHardMode = hardMode;
        console.log(`ゲーム開始！ ハードモード: ${isHardMode}`);
        const { inputElement, messageElement, startButton, backButton, modeSelectionDiv, scoreElement, timerElement, wpmElement, consecutiveCorrectElement } = getGameElements();

        if (questions.length === 0) {
            alert('問題がありません。');
            console.error("startGameが呼び出されましたが、問題がありませんでした。");
            return;
        }

        if (isHardMode) {
            console.log("問題をシャッフルします");
            for (let i = questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questions[i], questions[j]] = [questions[j], questions[i]];
            }
        }
        console.log("シャッフル後の問題:", questions.map(q => q.display));

        if (inputElement) {
            inputElement.disabled = false;
            inputElement.value = '';
            inputElement.focus();
        }
        if (messageElement) messageElement.textContent = 'がんばれ！';
        if (startButton) startButton.style.display = 'none';
        if (backButton) backButton.classList.add('hidden');
        if (modeSelectionDiv) modeSelectionDiv.classList.add('hidden');
        time = 60;
        score = 0;
        totalTypedChars = 0;
        consecutiveCorrect = 0;
        if (scoreElement) scoreElement.textContent = score;
        if (timerElement) timerElement.textContent = time;
        if (wpmElement) wpmElement.textContent = 0;
        if (consecutiveCorrectElement) consecutiveCorrectElement.textContent = 0;
        
        console.log("次の問題を設定します");
        setNextQuestion();
        console.log("タイマーを開始します");
        startTimer();
        console.log("ゲーム開始処理完了");
    }

    function setNextQuestion() {
        const { questionElement, inputElement } = getGameElements();
        if (currentQuestionIndex >= questions.length) {
            if (isHardMode) {
                for (let i = questions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [questions[i], questions[j]] = [questions[j], questions[i]];
                }
                console.log("問題を再シャッフルしました。");
            }
            currentQuestionIndex = 0;
            console.log("問題が尽きたため、最初に戻ります。\n");
        }

        const currentQuestion = questions[currentQuestionIndex];
        if (questionElement) {
            if (currentMode === 'タイピングモード') {
                questionElement.textContent = currentQuestion.display; // Display kanji for typing
            } else {
                questionElement.textContent = currentQuestion.display; // Display kanji for quiz
            }
            questionElement.classList.remove('incorrect');
        }
        if (inputElement) {
            inputElement.value = '';
            inputElement.classList.remove('is-invalid');
            inputElement.focus();
            console.log("setNextQuestion: Input element value after clearing:", inputElement.value);
            console.log("setNextQuestion: Question element textContent:", questionElement.textContent);
        }
    }

    function startTimer() {
        const { timerElement } = getGameElements();
        stopTimer();
        timerInterval = setInterval(() => {
            time--;
            if (timerElement) timerElement.textContent = time;
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
        const { wpmElement } = getGameElements();
        const elapsedTime = 60 - time;
        if (elapsedTime === 0) {
            if (wpmElement) wpmElement.textContent = 0;
            return;
        }
        const wpm = Math.round((totalTypedChars / 5) / (elapsedTime / 60));
        if (wpmElement) wpmElement.textContent = wpm;
    }

    function checkTypingInput() {
        const { inputElement, scoreElement, questionElement } = getGameElements();
        if (currentQuestionIndex >= questions.length) return;

        const currentQuestion = questions[currentQuestionIndex];
        const inputText = inputElement ? inputElement.value : '';
        const targetAnswer = (currentMode === 'タイピングモード') ? currentQuestion.display : currentQuestion.answer; // Typing mode: compare with kanji, Quiz mode: compare with hiragana

        // Visual feedback for current question
        let html = '';
        let allCorrect = true;
        for (let i = 0; i < targetAnswer.length; i++) {
            if (i < inputText.length) {
                if (inputText[i] === targetAnswer[i]) {
                    html += `<span class="correct">${targetAnswer[i]}</span>`;
                } else {
                    html += `<span class="incorrect">${targetAnswer[i]}</span>`;
                    allCorrect = false;
                }
            }
            else {
                html += `<span>${targetAnswer[i]}</span>`;
                allCorrect = false;
            }
        }
        questionElement.innerHTML = html; // Update question display with colored characters

        if (inputText === targetAnswer) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => {});
            score++;
            totalTypedChars += targetAnswer.length;
            if (scoreElement) scoreElement.textContent = score;
            
            if (inputElement) {
                inputElement.value = ''; // Clear input
                inputElement.classList.remove('is-invalid');
                console.log("checkTypingInput: Input cleared after correct answer:", inputElement.value);
            }
            currentQuestionIndex++;
            setNextQuestion(); // Move to next question
        } else {
            console.log(`checkTypingInput: Mismatch - Input: "${inputText}", Expected Answer: "${targetAnswer}"`);
            if (!targetAnswer.startsWith(inputText)) {
                inputElement.classList.add('is-invalid');
            } else {
                inputElement.classList.remove('is-invalid');
            }
        }
    }

    function checkQuizInput() {
        const { inputElement, scoreElement, consecutiveCorrectElement, questionElement } = getGameElements();
        if (currentQuestionIndex >= questions.length) return;
        const currentQuestion = questions[currentQuestionIndex];
        const inputText = inputElement ? inputElement.value : '';

        if (inputText.trim() === currentQuestion.answer) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => {});
            score++;
            consecutiveCorrect++;
            if (scoreElement) scoreElement.textContent = score;
            if (consecutiveCorrectElement) consecutiveCorrectElement.textContent = consecutiveCorrect;
            currentQuestionIndex++;
            setNextQuestion();
        } else {
            incorrectSound.currentTime = 0;
            incorrectSound.play().catch(e => {});
            consecutiveCorrect = 0;
            if (consecutiveCorrectElement) consecutiveCorrectElement.textContent = consecutiveCorrect;
            if (questionElement) questionElement.classList.add('incorrect');
            setTimeout(() => {
                if (questionElement) questionElement.classList.remove('incorrect');
            }, 300);
        }
    }

    function endGame() {
        const { inputElement, messageElement, wpmElement, backButton, modeSelectionDiv } = getGameElements();
        stopTimer();
        if (inputElement) {
            inputElement.disabled = true;
            inputElement.classList.remove('is-invalid');
        }
        let endMessage = `ゲーム終了！ スコア: ${score}`;
        if (currentMode === 'タイピングモード') {
            const finalWPM = wpmElement ? wpmElement.textContent : '0';
            endMessage += `, 毎分入力文字数: ${finalWPM}`;
        }
        if (messageElement) {
            messageElement.textContent = endMessage;
            messageElement.className = 'alert alert-success mt-4';
        }
        if (backButton) backButton.classList.remove('hidden');
        if (modeSelectionDiv) modeSelectionDiv.classList.remove('hidden');

        // Wallpaper reward logic
        const easyThreshold = 20;
        const hardThreshold = 30;
        let wallpapers = [];

        if (currentMode === 'タイピングモード') {
            const threshold = isHardMode ? hardThreshold : easyThreshold;
            if (score >= threshold) {
                if (currentTypingCategory === '地理モード') {
                    if (isHardMode) {
                        wallpapers = ['wallpapers/typing_hard/typing_hard_01.jpg', 'wallpapers/typing_hard/typing_hard_02.jpg'];
                    } else {
                        wallpapers = ['wallpapers/typing_easy/typing_easy_01.jpg', 'wallpapers/typing_easy/typing_easy_02.jpg'];
                    }
                } else if (currentTypingCategory === '歴史モード') {
                    if (isHardMode) {
                        wallpapers = ['wallpapers/typing_hard/typing_hard_01.jpg', 'wallpapers/typing_hard/typing_hard_02.jpg'];
                    } else {
                        wallpapers = ['wallpapers/typing_easy/typing_easy_01.jpg', 'wallpapers/typing_easy/typing_easy_02.jpg'];
                    }
                }
            }
        } else if (currentMode === 'クイズモード') {
            const threshold = isHardMode ? hardThreshold : easyThreshold;
            if (consecutiveCorrect >= threshold) {
                if (isHardMode) {
                    wallpapers = ['wallpapers/quiz_hard/quiz_hard_01.jpg', 'wallpapers/quiz_hard/quiz_hard_02.jpg'];
                } else {
                    wallpapers = ['wallpapers/quiz_easy/quiz_easy_01.jpg', 'wallpapers/quiz_easy/quiz_easy_02.jpg'];
                }
            }
        }

        if (wallpapers.length > 0) {
            const randomIndex = Math.floor(Math.random() * wallpapers.length);
            const selectedWallpaper = wallpapers[randomIndex];
            showWallpaperModal(selectedWallpaper);
        }
    }

    function showWallpaperModal(wallpaperUrl) {
        const wallpaperModal = document.getElementById('wallpaper-modal');
        const rewardWallpaper = document.getElementById('reward-wallpaper');
        const downloadLink = document.getElementById('download-link');

        rewardWallpaper.src = wallpaperUrl;
        downloadLink.href = wallpaperUrl;

        const filename = wallpaperUrl.split('/').pop();
        const lastDotIndex = filename.lastIndexOf('.');
        const filenameWithoutExt = lastDotIndex > -1 ? filename.substring(0, lastDotIndex) : filename;
        downloadLink.download = filenameWithoutExt + '.jpg';
        
        $(wallpaperModal).modal('show');
    }

    function goBackToSelection() {
        const { gameScreen, selectionScreen, modeSelectionDiv } = getGameElements();
        if (gameScreen) gameScreen.classList.add('hidden');
        if (selectionScreen) selectionScreen.classList.remove('hidden');
        currentMode = null;
        currentTypingCategory = null;
        currentQuizCategory = null;
        loadTopics();
        if (modeSelectionDiv) modeSelectionDiv.classList.add('hidden');
    }

    // --- Event Listeners ---
    passwordSubmit.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
});