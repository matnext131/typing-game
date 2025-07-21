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
県庁所在地(けんちょうしょざ)
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
尖閣諸島(せんかくしょとう)
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
モルワイデ図法(もるわいでずほう)
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
亜寒帯(あかんたい)
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
ムスリム(むすりむ)`,
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
アジアNIES(あじあNIES)
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
スラム(すらむ)
パーム油(ぱーむゆ)
再生可能エネルギー(さいせいかのうえねるぎー)
ICT産業(ICTさんぎょう)
コーラン(こーらん)
食料自給率(しょくりょうじきゅうりつ)
石油輸出機構(せきゆゆしゅつこくきこう)
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
EU(EU)
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
            '歴史モード': {
                '世界の古代文明と宗教のおこり': `
猿人(えんじん)
氷河時代(ひょうがじだい)
打製石器(だせいせっき)
原人(げんじん)
新人(しんじん)
クロマニョン人(くろまにょんじん)
旧石器時代(きゅうせっきじだい)
岩宿遺跡(いわじゅくいせき)
土器(どき)
磨製石器(ませいせっき)
新石器時代(しんせっきじだい)
農耕(のうこう)
牧畜(ぼくちく)
青銅器(せいどうき)
鉄器(てっき)
文明(ぶんめい)
エジプト文明(えじぷとぶんめい)
太陽暦(たいようれき)
象形文字(しょうけいもじ)
メソポタミア文明(めそぽたみあぶんめい)
くさび形文字(くさびがたもじ)
太陰暦(たいいんれき)
60進法(60しんほう)
七曜制(しちようせい)
オリエント(おりえんと)
ハンムラビ法典(はんむらびほうてん)
インダス文明(いんだすぶんめい)
モヘンジョ・ダロ(もへんじょ・だろ)
カースト制(かーすとせい)
中国文明(ちゅうごくぶんめい)
殷(いん)
甲骨文字(こうこつもじ)
春秋・戦国時代(しゅんじゅう・せんごくじだい)
孔子(こうし)
儒学(じゅがく)
秦(しん)
始皇帝(しこうてい)
万里の長城(ばんりのちょうじょう)
漢(かん)
シルクロード(しるくろーど)
ポリス(ぽりす)
民主政(みんしゅせい)
ギリシャ文明(ぎりしゃぶんめい)
アレクサンドロス大王(あれくさんどろすだいおう)
パルテノン神殿(ぱるてのんしんでん)
ヘレニズム(へれにずむ)
共和政(きょうわせい)
帝政(ていせい)
ローマ帝国(ろーまていこく)
シャカ(しゃか)
仏教(ぶっきょう)
ユダヤ教(ゆだやきょう)
イエス(いえす)
キリスト教(きりすときょう)
ムハンマド(むはんまど)
イスラーム(いすらーむ)
エルサレム(えるされむ)`,
                '日本列島の誕生と大陸との交流': `
岩宿遺跡(いわじゅくいせき)
黒曜石(こくようせき)
縄文土器(じょうもんどき)
縄文時代(じょうもんじだい)
三内丸山遺跡(さんないまるやまいせき)
貝塚(かいづか)
たて穴住居(たてあなじゅうきょ)
土偶(どぐう)
屈葬(くっそう)
稲作(いなさく)
高床倉庫(たかゆかそうこ)
弥生土器(やよいどき)
弥生時代(やよいじだい)
銅鐸(どうたく)
「漢書」地理志(「かんじょ」ちりし)
「後漢書」東夷伝(「ごかんじょ」とういでん)
漢委奴国王(かんのわのなのこくおう)
邪馬台国(やまたいこく)
魏志倭人伝(ぎしわじんでん)
卑弥呼(ひみこ)
朝貢(ちょうこう)
親魏倭王(しんぎわおう)
吉野ヶ里遺跡(よしのがりいせき)
登呂遺跡(とろいせき)
豪族(ごうぞく)
大和政権(やまとせいけん)
古墳(こふん)
古墳時代(こふんじだい)
大王(おおきみ)
大仙古墳(だいせんこふん)
埴輪(はにわ)
前方後円墳(ぜんぽうこうえんふん)
稲荷山古墳(いなりやまこふん)
江田船山古墳(えたふなやまこふん)
高句麗(こうくり)
百済(くだら)
新羅(しらぎ)
伽耶地域(かやちいき)
「宋書」倭国伝(「そうしょ」わこくでん)
渡来人(とらいじん)
須恵器(すえき)`
            }
        },
        'クイズモード': {
            '地理クイズ': {
                '第１編世界と日本の姿': `
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
ユーラシア大陸北部に位置する連邦共和制国家。面積世界１位。首都はモスクワ。(ロシア連邦)`
            },
            '歴史クイズ': {
                '世界の古代文明と宗教のおこり': `
約７００万年から６００万年前にアフリカに出現した、現在知られている最古の人類。(猿人)
およそ２６０万年前、地球の気温が低く、厚い氷におおわれていた時代のこと。　(氷河時代)
石を打ち欠いてつくった石器のこと。(打製石器)
今から２００万年ほど前に出現した人類で、かなり進化していて、打製石器や火を使用していたことが分かっている。(原人)
２０万年ほど前に出現した人類で、現在の人類の直接の祖先と考えられている。(新人)
約４万年から１万年前にヨーロッパに分布していた人類でラスコー洞窟、アルタミラ洞窟の壁画で知られる。(クロマニョン人)
人類が打製石器を使い、狩りや採集、漁で生活をしていた時代。(旧石器時代)
群馬県の遺跡。相沢忠洋が黒曜石の打製石器を発見し、日本にも旧石器時代のあったことが確かめられた。(岩宿遺跡)
粘土を焼いてつくった容器。新石器時代からつくられはじめたもの。(土器)
石の表面をみがいてつくった石器のこと。(磨製石器)
石器と土器が使われ、農耕と牧畜がはじまった時代。(新石器時代)
田畑を耕して作物をつくることで、世界的には新石器時代のころにはじまった。(農耕)
牛、馬、豚、羊などの家畜を飼育し、その数をふやすこと。(牧畜)
おもに古代につくられた金属器。青銅は銅とすずを混ぜ合わせてできるかたい金属。(青銅器)
鉄製の道具。かたくて熱に強いという利点がある。(鉄器)
人間が作り出した高度な文化や社会のこと。(文明)
ナイル川流域に発展した古代文明。(エジプト文明)
太陽の動きにもとづく暦。(太陽暦)
ものの形をかたどった文字で、パピルスという一種の紙に書かれた。(象形文字)
今のイラク付近のチグリス川とユーフラテス川のほとりに生まれた文明(メソポタミア文明)
古代メソポタミアの文字。粘土板に葦の茎のペンを使って刻みこんだもの。(くさび形文字)
月の満ち欠けにもとづく暦。(太陰暦)
現在でも１時間＝６０分、１分＝６０秒のように用いられている。(60進法)
1週7日制。 7日を単位として生活習慣のサイクルとする暦法。(七曜制)
ヨーロッパから見て東方の地域のこと。(オリエント)
紀元前1792年から1750年にバビロニアを統治したハンムラビ王が発布した法典。(ハンムラビ法典)
今のパキスタンの付近にあるインダス川流域で生まれた文明。都市遺跡のモヘンジョ・ダロが有名(インダス文明)
インダス文明最大級の都市遺跡。1980年世界遺産(モヘンジョ・ダロ)
インドで行われている身分制度。ヒンドゥー教と結びついた制度。(カースト制)
黄河の中・下流域と長江の下流域で稲を栽培した農耕文明(中国文明)
紀元前１６世紀？〜紀元前１１世紀頃？　実在が確認されている中国の最古の王朝。(殷)
亀の甲や牛の骨に刻まれた文字。占いに使われたもので、漢字のもとになっている。(甲骨文字)
紀元前770年に周が都を移してから、紀元前221年に秦が中国を統一するまでの時代。(春秋・戦国時代)
紀元前５５２年〜紀元前４７９年　古代中国の思想家。(孔子)
古代中国の思想家孔子が主張した政治道徳思想の学問のこと。(儒学)
紀元前７７８年〜紀元前２０６年　中国の最初の統一王朝。　(秦)
紀元前２５９年〜紀元前２１０年　秦の初代皇帝。(始皇帝)
中国で、北方の遊牧民族の侵入を防ぐために築かれた城壁のこと。世界遺産。(万里の長城)
紀元前２０２年〜２２０年　秦に続く中国の統一王朝。　(漢)
中央アジアを通って中国とヨーロッパを結びつけた、古代の交易路（カタカナ名）。(シルクロード)
古代ギリシャに成立した都市国家。アテネ、スパルタ、コリントなどの都市国家が成立。(ポリス)
人民が主権を持ち、人民の手で、人民のために政治が行われること。(民主政)
古代ギリシャで発達した文明。パルテノン神殿が有名。他にはオリンピックもひらかれた。(ギリシャ文明)
紀元前３５６年〜紀元前３２３年　東方遠征によって大帝国を建設した王（ギリシャ北方のマケドニアの王）(アレクサンドロス大王)
古代ギリシア時代にギリシア神話の女神アテーナーを祀る神殿。(パルテノン神殿)
ギリシャとオリエント（東方）の文化が結びついた文化のこと。ミロのビーナスなど有名。(ヘレニズム)
国民が共同して政治を行うこと。一般に、君主のいない政治。(共和政)
皇帝が国の政治を独自に行う政治体制のこと。(帝政)
ローマ（イタリア）を首都とする古代の帝国。紀元前8世紀頃から王政→共和政→帝政と変化した。(ローマ帝国)
紀元前４６３年？〜紀元前３８３年？　インドの元王子でインドの宗教家で、仏教を開いた。(シャカ)
紀元前５世紀頃にインドでシャカが開いた宗教。日本には５３８年（５５２年とする説もある）に百済から伝わった。(仏教)
ヤハウェを唯一神とし、聖書（旧約聖書）を経典とする宗教。(ユダヤ教)
紀元前５年？〜紀元３０年？　元ユダヤ教徒でキリスト教を開いた人物。(イエス)
紀元１世紀にイエスが開いた宗教。(キリスト教)
アラビア半島のメッカに生まれ、商人として活動し、６１０年洞窟で神の啓示から預言者として活躍した。(ムハンマド)
７世紀にムハンマドが開いた宗教。唯一神アラーを信仰する一神教で、コーランを聖典とする。酒を飲まず、豚肉を食べない。(イスラーム)
イスラエルにある都市。エルサレムは世界最古の都市の一つであり、ユダヤ教、キリスト教、イスラム教の聖地。(エルサレム)`
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
                        wallpapers = ['./wallpapers/typing_hard/typing_hard_01.jpg', './wallpapers/typing_hard/typing_hard_02.jpg'];
                    } else {
                        wallpapers = ['./wallpapers/typing_easy/typing_easy_01.jpg', './wallpapers/typing_easy/typing_easy_02.jpg'];
                    }
                } else if (currentTypingCategory === '歴史モード') {
                    if (isHardMode) {
                        wallpapers = ['./wallpapers/typing_hard/typing_hard_01.jpg', './wallpapers/typing_hard/typing_hard_02.jpg'];
                    } else {
                        wallpapers = ['./wallpapers/typing_easy/typing_easy_01.jpg', './wallpapers/typing_easy/typing_easy_02.jpg'];
                    }
                }
            }
        } else if (currentMode === 'クイズモード') {
            const threshold = isHardMode ? hardThreshold : easyThreshold;
            if (consecutiveCorrect >= threshold) {
                if (isHardMode) {
                    wallpapers = ['./wallpapers/quiz_hard/quiz_hard_01.jpg', './wallpapers/quiz_hard/quiz_hard_02.jpg'];
                } else {
                    wallpapers = ['./wallpapers/quiz_easy/quiz_easy_01.jpg', './wallpapers/quiz_easy/quiz_easy_02.jpg'];
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