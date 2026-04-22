// =============================================
// 社会用語データ
// 用語を追加するには topics 配列にオブジェクトを追加してください
// 各 topic には最低4つの terms が必要です（4択クイズのため）
// =============================================

const topics = [
  // ========== 地理 ==========
  {
    topic: "地理：世界と日本の姿",
    terms: [
      { term: "アジア州", reading: "あじあしゅう", description: "世界の大州の１つ。ユーラシア大陸のヨーロッパ以外の地域の州" },
      { term: "アフリカ州", reading: "あふりかしゅう", description: "六大州の１つ。地中海を挟んでヨーロッパの南に位置する" },
      { term: "ヨーロッパ州", reading: "よーろっぱしゅう", description: "六大州の一つ。面積から見ると世界で２番目に小さな大州" },
      { term: "北アメリカ州", reading: "きたあめりかしゅう", description: "六大州の一つ。カナダ・アメリカ・メキシコなどからなる" },
      { term: "南アメリカ州", reading: "みなみあめりかしゅう", description: "六大州の一つ。全体が西半球にあり、大部分が南半球にある" },
      { term: "オセアニア州", reading: "おせあにあしゅう", description: "六大州の最小の州。別名大洋州" },
      { term: "ユーラシア大陸", reading: "ゆーらしあたいりく", description: "六大陸の１つで、世界最大の大陸" },
      { term: "アフリカ大陸", reading: "あふりかたいりく", description: "六大陸の１つ。スエズ地峡の西側の部分を占める大陸" },
      { term: "北アメリカ大陸", reading: "きたあめりかたいりく", description: "六大陸の１つ。パナマ地峡より北側の部分のこと" },
      { term: "南アメリカ大陸", reading: "みなみあめりかたいりく", description: "六大陸の１つ。パナマ地峡より南側の部分のこと" },
      { term: "南極大陸", reading: "なんきょくたいりく", description: "六大陸の１つ。ほとんどが氷におおわれていて、人間は定住していない" },
      { term: "オーストラリア大陸", reading: "おーすとらりあたいりく", description: "六大陸の１つ。面積では最小の大陸" },
      { term: "六大陸", reading: "ろくたいりく", description: "ユーラシア・アフリカ・北アメリカ・南アメリカ・南極・オーストラリアの６つの大陸のこと" },
      { term: "三大洋", reading: "さんたいよう", description: "太平洋・大西洋・インド洋のこと" },
      { term: "太平洋", reading: "たいへいよう", description: "三大洋の１つ。世界最大の海洋" },
      { term: "大西洋", reading: "たいせいよう", description: "三大洋の１つ。西にある大きな海" },
      { term: "インド洋", reading: "いんどよう", description: "三大洋の一つ。三大洋中最も小さい" },
      { term: "赤道", reading: "せきどう", description: "北極と南極の中間にあたる点を結んだ線。緯度０度を示す" },
      { term: "緯線", reading: "いせん", description: "同じ緯度どうしを結んだ横の線のこと" },
      { term: "経線", reading: "けいせん", description: "同じ経度どうしを結んだたての線のこと" },
      { term: "緯度", reading: "いど", description: "地球上の地点の位置を表す座標の１つ。赤道を0度とし、北極・南極を90度とする" },
      { term: "経度", reading: "けいど", description: "地球上の位置を表す座標。ある地点を通る子午線と本初子午線との間の角度" },
      { term: "本初子午線", reading: "ほんしょしごせん", description: "経度0度の基準となる経線。イギリスのロンドンを通る" },
      { term: "標準時", reading: "ひょうじゅんじ", description: "世界の基準になる時刻のこと" },
      { term: "時差", reading: "じさ", description: "地球上の二地点間の各標準時の差" },
      { term: "領土", reading: "りょうど", description: "国家が領有する陸地のこと" },
      { term: "領海", reading: "りょうかい", description: "沿岸国の主権がおよぶ海域のこと" },
      { term: "領空", reading: "りょうくう", description: "「領土」と「領海」の上空のこと" },
      { term: "排他的経済水域", reading: "はいたてきけいざいすいいき", description: "領海の基線からその外側200海里の線までの海域とその海底及びその下" },
      { term: "北方領土", reading: "ほっぽうりょうど", description: "択捉島・国後島・色丹島・歯舞群島のこと。ロシアに不法に占拠されている" },
      { term: "竹島", reading: "たけしま", description: "日本の隠岐諸島と韓国の鬱陵島の間に位置する島。韓国が不法占拠している" },
      { term: "尖閣諸島", reading: "せんかくしょとう", description: "沖縄県石垣市に所在する、魚釣島などからなる島々の総称" },
      { term: "地球儀", reading: "ちきゅうぎ", description: "地球をそのままの形で縮めた模型。面積・形・距離・方位などをほぼ正しく表す" },
      { term: "メルカトル図法", reading: "めるかとるずほう", description: "角度が正しく、海図に使われる図法" },
      { term: "正距方位図法", reading: "せいきょほういずほう", description: "中心からの距離と方位が正しい。航空図に利用される" },
      { term: "人口密度", reading: "じんこうみつど", description: "単位面積（1km²）あたりに居住する人の数。人口÷面積で求める" },
      { term: "都道府県", reading: "とどうふけん", description: "日本の地方公共団体である「都」「道」「府」「県」の総称" }
    ]
  },
  {
    topic: "地理：世界各地の人々の生活と環境",
    terms: [
      { term: "熱帯", reading: "ねったい", description: "地球上で緯度が低く年中温暖な地域のこと。一年中、暑くて雨が多い" },
      { term: "乾燥帯", reading: "かんそうたい", description: "一般に1年間の降水量が蒸発量よりも少ない地域" },
      { term: "温帯", reading: "おんたい", description: "年間を通して温暖な気候の地域" },
      { term: "亜寒帯", reading: "あかんたい", description: "主にロシアのシベリア地方・カナダ・北欧などが属する気候帯" },
      { term: "寒帯", reading: "かんたい", description: "北半球の北極に近い地域でほぼ一年中氷や雪に覆われた気候帯" },
      { term: "熱帯雨林", reading: "ねったいうりん", description: "年間を通じて温暖で雨量の多い地域に形成される植生、またはその地域のこと" },
      { term: "地中海性気候", reading: "ちちゅうかいせいきこう", description: "地中海沿岸などのように夏に乾燥し、冬に雨が降る地域の気候名" },
      { term: "西岸海洋性気候", reading: "せいがんかいようせいきこう", description: "ヨーロッパの大西洋沿岸で、北大西洋海流と偏西風の影響で一年を通して雨が降る気候名" },
      { term: "砂漠気候", reading: "さばくきこう", description: "一年を通して雨がとても少ない地域の気候名" },
      { term: "ステップ気候", reading: "すてっぷきこう", description: "わずかに雨が降る季節があり、短い草原が広がる地域の気候名" },
      { term: "ツンドラ気候", reading: "つんどらきこう", description: "短い夏に雪や氷が解けて、わずかに草やこけが生える地域の気候名" },
      { term: "氷雪気候", reading: "ひょうせつきこう", description: "南極などの一年中、雪や氷でおおわれている地域の気候名" },
      { term: "熱帯雨林気候", reading: "ねったいうりんきこう", description: "一年中雨が降り、うっそうとした森林が広がる地域の気候名" },
      { term: "サバナ気候", reading: "さばなきこう", description: "乾季と雨季とがはっきりしていてまばらな樹木と草原が広がる地域の気候名" },
      { term: "オアシス", reading: "おあしす", description: "乾燥帯のほとんどの場所は砂漠であり、例外的に水の出る場所のこと" },
      { term: "サヘル", reading: "さへる", description: "アフリカ北部にあるサハラ砂漠の南に広がる半乾燥地域のこと" },
      { term: "砂漠化", reading: "さばくか", description: "気候変動や人間の活動などによって植物が生育できにくくなること" },
      { term: "遊牧", reading: "ゆうぼく", description: "水と草をもとめて、家畜とともに広大な地域を移動する牧畜形態のこと" },
      { term: "焼畑農業", reading: "やきはたのうぎょう", description: "森林などに火を入れて焼きはらい、草木灰を肥料として作物を栽培する農業" },
      { term: "イヌイット", reading: "いぬいっと", description: "カナダ北部などの氷雪地帯に住む先住民族" },
      { term: "タイガ", reading: "たいが", description: "ロシア語でシベリア地方の針葉樹林の意味" },
      { term: "針葉樹", reading: "しんようじゅ", description: "針のように細長く、堅い葉をつける樹木の総称" },
      { term: "持続可能な開発", reading: "じぞくかのうなかいはつ", description: "将来の世代の欲求を満たしつつ、現在の世代の欲求も満足させるような開発" },
      { term: "放牧", reading: "ほうぼく", description: "牛や馬などの家畜を、牧草地などで飼うこと" },
      { term: "高山気候", reading: "こうざんきこう", description: "標高が高いため一年中気温が低く、森林が形成されない地域の気候名" },
      { term: "仏教", reading: "ぶっきょう", description: "釈迦が広めた宗教。教典は「経」" },
      { term: "キリスト教", reading: "きりすときょう", description: "イエスが広めた宗教。聖地はエルサレムなど。教典は「聖書」" },
      { term: "イスラーム", reading: "いすらーむ", description: "ムハンマドが広めた宗教。聖地はエルサレムなど。教典は「コーラン」" },
      { term: "ヒンドゥー教", reading: "ひんどぅーきょう", description: "インドで主に信仰されている宗教。牛は神の使いで牛肉は食べない" },
      { term: "ユダヤ教", reading: "ゆだやきょう", description: "唯一絶対の神ヤハウェを信仰するユダヤ人の民族宗教のこと" }
    ]
  },
  {
    topic: "地理：アジア州",
    terms: [
      { term: "ヒマラヤ山脈", reading: "ひまらやさんみゃく", description: "高い標高とアジア大陸の中央に位置していることから「世界の屋根」と呼ばれる" },
      { term: "稲作", reading: "いなさく", description: "イネ（稲）を栽培して米を収穫すること" },
      { term: "季節風", reading: "きせつふう", description: "日本では夏は南東の方向から、冬は北西の方向から吹く漢字３文字の風のこと" },
      { term: "雨季", reading: "うき", description: "1年の中で降水量の多い時期のこと" },
      { term: "乾季", reading: "かんき", description: "1年の内降水量の少ない時期のこと" },
      { term: "植民地", reading: "しょくみんち", description: "他国に支配され、その国の領土として支配される地域" },
      { term: "アジアNIES", reading: "あじあにーず", description: "経済発展をとげた韓国・台湾・香港・シンガポールの4つの国・地域のこと" },
      { term: "経済特区", reading: "けいざいとっく", description: "中国が外国への投資を呼び込むために設けた特別な地域" },
      { term: "漢族", reading: "かんぞく", description: "中国の人口の9割以上を占める民族" },
      { term: "世界の工場", reading: "せかいのこうじょう", description: "多くの工場が、世界中の製品を生産している中国のこと" },
      { term: "ハングル", reading: "はんぐる", description: "朝鮮語（韓国語）を表記する表音文字。1443年につくられた" },
      { term: "プランテーション", reading: "ぷらんてーしょん", description: "大規模な農園のこと" },
      { term: "ASEAN", reading: "あせあん", description: "東南アジア10カ国で作られた地域協力機構" },
      { term: "パーム油", reading: "ぱーむゆ", description: "あぶらやしから得られる食用油。マーガリンやせっけんの材料に使われる" },
      { term: "再生可能エネルギー", reading: "さいせいかのうえねるぎー", description: "太陽光や風力など、使っても無くならないエネルギー源" },
      { term: "ICT産業", reading: "あいしーてぃーさんぎょう", description: "コンピューターやインターネットを使った技術産業" },
      { term: "石油輸出機構", reading: "せきゆゆしゅつこくきこう", description: "1960年9月に設立された国際機関で、主要な石油輸出国によって構成されている組織（OPEC）" },
      { term: "食料自給率", reading: "しょくりょうじきゅうりつ", description: "国内で消費する食料のうち、国内で生産された割合を示す指標のこと" },
      { term: "二期作", reading: "にきさく", description: "1年に2回作物を収穫すること。暖かい地域で行われる" },
      { term: "経済格差", reading: "けいざいかくさ", description: "国や地域・個人などにおける経済力の差のこと" }
    ]
  },
  {
    topic: "地理：ヨーロッパ州",
    terms: [
      { term: "偏西風", reading: "へんせいふう", description: "中緯度地域で西から東へ吹く風。天候に大きな影響を与える" },
      { term: "北大西洋海流", reading: "きたたいせいようかいりゅう", description: "メキシコ湾流が大西洋を横断し、ヨーロッパに暖かさを運ぶ海流" },
      { term: "フィヨルド", reading: "ふぃよるど", description: "氷河が削った谷に海水が入り込んでできた細長い入り江" },
      { term: "EU", reading: "いーゆー", description: "ヨーロッパの国々が経済や政治で協力する組織。1993年設立。本部はベルギーのブリュッセル" },
      { term: "ユーロ", reading: "ゆーろ", description: "EUの多くの国で使われている共通通貨" },
      { term: "酸性雨", reading: "さんせいう", description: "大気汚染によって引き起こされる酸性の強い雨。森林などに被害をもたらす" },
      { term: "脱炭素社会", reading: "だつたんそしゃかい", description: "二酸化炭素などの温室効果ガスの排出量を実質的にゼロにすることを目指す社会" },
      { term: "地球温暖化", reading: "ちきゅうおんだんか", description: "人間の活動で地球の平均気温が上昇する現象。環境問題の一つ" },
      { term: "オーバーツーリズム", reading: "おーばーつーりずむ", description: "観光客が多すぎて、地域の環境や生活に悪影響を与える問題" },
      { term: "エコツーリズム", reading: "えこつーりずむ", description: "自然環境を大切にしながら行う観光" },
      { term: "外国人労働者", reading: "がいこくじんろうどうしゃ", description: "他国から来て働く人々。労働力不足を補う" },
      { term: "移民", reading: "いみん", description: "本来の居住地を離れて移動する人のこと" },
      { term: "民族", reading: "みんぞく", description: "言語や文化・歴史を共有する人々のまとまり" },
      { term: "公用語", reading: "こうようご", description: "国が公的に使うと決めた言語。書類や教育で使われる" },
      { term: "国際河川", reading: "こくさいかせん", description: "複数の国を流れる川。利用には国際的なルールが必要" }
    ]
  },
  {
    topic: "地理：アフリカ州",
    terms: [
      { term: "サハラ砂漠", reading: "さはらさばく", description: "アフリカ北部に広がる世界最大の砂漠" },
      { term: "ナイル川", reading: "ないるがわ", description: "アフリカを流れる世界最長の川。エジプト文明の発祥地" },
      { term: "サヘル", reading: "さへる", description: "サハラ砂漠南縁部に広がる半乾燥地域" },
      { term: "モノカルチャー経済", reading: "ものかるちゃーけいざい", description: "一つの作物や資源に依存する経済。価格変動に弱い" },
      { term: "レアメタル", reading: "れあめたる", description: "産出が少なく、工業に欠かせない貴重な金属" },
      { term: "鉱産資源", reading: "こうさんしげん", description: "地下に埋蔵されている鉱物や岩石の総称のこと" },
      { term: "アフリカ連合", reading: "あふりかれんごう", description: "アフリカ諸国が協力して平和や経済発展を目指す組織。別名AU" },
      { term: "非政府組織", reading: "ひせいふそしき", description: "政府とは関係なく、社会問題の解決を目指す団体。別名NGO" },
      { term: "プランテーション農業", reading: "ぷらんてーしょんのうぎょう", description: "大規模な農園でいとなまれる農業のこと" },
      { term: "スラム", reading: "すらむ", description: "都市の中で貧困層が住む地域。生活環境が悪い" }
    ]
  },
  {
    topic: "地理：北アメリカ州",
    terms: [
      { term: "ロッキー山脈", reading: "ろっきーさんみゃく", description: "北アメリカ大陸西部に連なる山脈" },
      { term: "先住民", reading: "せんじゅうみん", description: "その土地にもともと住んでいた人々" },
      { term: "適地適作", reading: "てきちてきさく", description: "その土地の気候・土壌に合った作物を栽培すること" },
      { term: "企業的な農業", reading: "きぎょうてきなのうぎょう", description: "大規模な機械を使い、少ない人手で効率よく生産する農業" },
      { term: "サンベルト", reading: "さんべると", description: "アメリカの北緯37度以南の温暖な地域。先端産業が発展" },
      { term: "シリコンバレー", reading: "しりこんばれー", description: "アメリカのサンフランシスコ近郊にあるIT産業の集積地" },
      { term: "ヒスパニック", reading: "ひすぱにっく", description: "アメリカに住むスペイン語を話す中南米系の人々" },
      { term: "穀物メジャー", reading: "こくもつめじゃー", description: "世界の穀物流通を支配する大企業のこと" },
      { term: "センターピボット", reading: "せんたーぴぼっと", description: "中心の井戸から放射状にスプリンクラーを設置した灌漑方法" },
      { term: "北米自由貿易協定", reading: "ほくべいじゆうぼうえききょうてい", description: "アメリカ・カナダ・メキシコで結ばれた自由貿易協定（NAFTA）" }
    ]
  },
  {
    topic: "地理：南アメリカ州",
    terms: [
      { term: "アンデス山脈", reading: "あんですさんみゃく", description: "南アメリカ大陸西部に連なる世界最長の山脈" },
      { term: "アマゾン川", reading: "あまぞんがわ", description: "南アメリカを流れる世界最大流域の川" },
      { term: "パンパ", reading: "ぱんぱ", description: "アルゼンチンに広がる肥沃な草原地帯" },
      { term: "インカ帝国", reading: "いんかていこく", description: "15〜16世紀にアンデス山脈を中心に栄えた先住民の帝国" },
      { term: "バイオエタノール", reading: "ばいおえたのーる", description: "さとうきびやとうもろこしなどを原料にした燃料" },
      { term: "持続可能な開発", reading: "じぞくかのうなかいはつ", description: "将来の世代の欲求を満たしつつ、現在の世代の欲求も満足させるような開発" },
      { term: "エコツーリズム", reading: "えこつーりずむ", description: "自然環境を大切にしながら行う観光" },
      { term: "マチュピチュ", reading: "まちゅぴちゅ", description: "ペルーのアンデス山脈、標高約2450mに位置する古代インカ帝国の遺跡" }
    ]
  },
  {
    topic: "地理：オセアニア州",
    terms: [
      { term: "アボリジニ", reading: "あぼりじに", description: "オーストラリアの先住民族" },
      { term: "マオリ", reading: "まおり", description: "ニュージーランドの先住民族" },
      { term: "白豪主義", reading: "はくごうしゅぎ", description: "オーストラリアがかつてとっていた白人優先の移民政策" },
      { term: "多文化社会", reading: "たぶんかしゃかい", description: "異なる文化や民族が共存する社会" },
      { term: "露天掘り", reading: "ろてんぼり", description: "地表を掘り開いて鉱物を採掘する方法" },
      { term: "アジア太平洋経済協力", reading: "あじあたいへいようけいざいきょうりょく", description: "アジア太平洋地域の経済協力を進める組織（APEC）" },
      { term: "さんご礁", reading: "さんごしょう", description: "さんごがつくった石灰質の骨格が積み重なった地形" },
      { term: "華人", reading: "かじん", description: "中国以外の国に住む中国系の人々のこと" }
    ]
  },

  // ========== 歴史 ==========
  {
    topic: "歴史：世界の古代文明",
    terms: [
      { term: "猿人", reading: "えんじん", description: "約700万年から600万年前にアフリカに出現した、現在知られている最古の人類" },
      { term: "原人", reading: "げんじん", description: "今から200万年ほど前に出現した人類で、打製石器や火を使用していた" },
      { term: "新人", reading: "しんじん", description: "20万年ほど前に出現した人類で、現在の人類の直接の祖先" },
      { term: "打製石器", reading: "だせいせっき", description: "石を打ち欠いてつくった石器のこと" },
      { term: "磨製石器", reading: "ませいせっき", description: "石の表面をみがいてつくった石器のこと" },
      { term: "旧石器時代", reading: "きゅうせっきじだい", description: "人類が打製石器を使い、狩りや採集、漁で生活をしていた時代" },
      { term: "新石器時代", reading: "しんせっきじだい", description: "石器と土器が使われ、農耕と牧畜がはじまった時代" },
      { term: "エジプト文明", reading: "えじぷとぶんめい", description: "ナイル川流域に発展した古代文明" },
      { term: "メソポタミア文明", reading: "めそぽたみあぶんめい", description: "今のイラク付近のチグリス川とユーフラテス川のほとりに生まれた文明" },
      { term: "インダス文明", reading: "いんだすぶんめい", description: "今のパキスタンの付近にあるインダス川流域で生まれた文明" },
      { term: "中国文明", reading: "ちゅうごくぶんめい", description: "黄河の中・下流域と長江の下流域で稲を栽培した農耕文明" },
      { term: "象形文字", reading: "しょうけいもじ", description: "ものの形をかたどった文字。エジプト文明で使われた" },
      { term: "くさび形文字", reading: "くさびがたもじ", description: "古代メソポタミアの文字。粘土板に葦の茎のペンを使って刻みこんだもの" },
      { term: "甲骨文字", reading: "こうこつもじ", description: "亀の甲や牛の骨に刻まれた文字。占いに使われ、漢字のもとになっている" },
      { term: "ハンムラビ法典", reading: "はんむらびほうてん", description: "紀元前1792年から1750年にバビロニアを統治したハンムラビ王が発布した法典" },
      { term: "カースト制", reading: "かーすとせい", description: "インドで行われている身分制度。ヒンドゥー教と結びついた制度" },
      { term: "ポリス", reading: "ぽりす", description: "古代ギリシャに成立した都市国家。アテネ、スパルタなど" },
      { term: "民主政", reading: "みんしゅせい", description: "人民が主権を持ち、人民の手で、人民のために政治が行われること" },
      { term: "アレクサンドロス大王", reading: "あれくさんどろすだいおう", description: "東方遠征によって大帝国を建設したマケドニアの王" },
      { term: "ヘレニズム", reading: "へれにずむ", description: "ギリシャとオリエント（東方）の文化が結びついた文化のこと" },
      { term: "ローマ帝国", reading: "ろーまていこく", description: "ローマを首都とする古代の帝国。王政→共和政→帝政と変化した" },
      { term: "シルクロード", reading: "しるくろーど", description: "中央アジアを通って中国とヨーロッパを結びつけた、古代の交易路" },
      { term: "万里の長城", reading: "ばんりのちょうじょう", description: "中国で、北方の遊牧民族の侵入を防ぐために築かれた城壁。世界遺産" },
      { term: "始皇帝", reading: "しこうてい", description: "秦の初代皇帝。中国を初めて統一した" },
      { term: "孔子", reading: "こうし", description: "紀元前5世紀頃の古代中国の思想家。儒学を広めた" },
      { term: "イエス", reading: "いえす", description: "紀元前後にキリスト教を開いた人物" },
      { term: "ムハンマド", reading: "むはんまど", description: "アラビア半島のメッカに生まれ、イスラームを開いた預言者" },
      { term: "エルサレム", reading: "えるされむ", description: "ユダヤ教・キリスト教・イスラム教の聖地" }
    ]
  },
  {
    topic: "歴史：日本の成り立ち（縄文〜古墳）",
    terms: [
      { term: "縄文土器", reading: "じょうもんどき", description: "表面に縄目のような文様がつけられ、低温で焼かれた赤褐色の土器" },
      { term: "縄文時代", reading: "じょうもんじだい", description: "縄文土器と磨製石器が使われた時代で、人々はおもに狩りや漁、木の実の採集で生活" },
      { term: "弥生土器", reading: "やよいどき", description: "高温で焼かれた、赤褐色の薄手でかための土器" },
      { term: "弥生時代", reading: "やよいじだい", description: "弥生土器と金属器が使われ、稲作が広まった時代" },
      { term: "三内丸山遺跡", reading: "さんないまるやまいせき", description: "青森県にある縄文時代最大級の遺跡" },
      { term: "貝塚", reading: "かいづか", description: "縄文時代の人々が食べ物の残りかすなどをすてた場所" },
      { term: "土偶", reading: "どぐう", description: "土で形をつくり焼き上げたもの。女性像が多く、祈りに使われたと考えられる" },
      { term: "銅鐸", reading: "どうたく", description: "弥生時代に製造された釣鐘型の青銅器" },
      { term: "邪馬台国", reading: "やまたいこく", description: "3世紀の倭にあった国家。国の位置は九州説と近畿説がある" },
      { term: "卑弥呼", reading: "ひみこ", description: "邪馬台国の女王。魏に使いを送り「親魏倭王」の称号を授けられた" },
      { term: "大和政権", reading: "やまとせいけん", description: "4世紀頃に大和地方（奈良県）に成立した政権" },
      { term: "古墳", reading: "こふん", description: "土を高く盛り上げてつくった、古代の墓のこと" },
      { term: "古墳時代", reading: "こふんじだい", description: "3世紀後半からはじまる、日本で古墳がさかんにつくられた時代のこと" },
      { term: "大仙古墳", reading: "だいせんこふん", description: "大阪府にある日本最大の前方後円墳。世界遺産の一つ" },
      { term: "埴輪", reading: "はにわ", description: "古墳の頂上やまわりに並べられた、素焼きの土製品" },
      { term: "前方後円墳", reading: "ぜんぽうこうえんふん", description: "円と四角形を組み合わせた墳墓" },
      { term: "渡来人", reading: "とらいじん", description: "4世紀から7世紀にかけて、中国や朝鮮半島から日本に移り住んだ人々のこと" },
      { term: "高床倉庫", reading: "たかゆかそうこ", description: "湿気対策やネズミを防ぐために床が高くなっている稲などを納める倉庫" },
      { term: "魏志倭人伝", reading: "ぎしわじんでん", description: "239年に邪馬台国の女王卑弥呼が魏に使いを送ったという内容が書かれている書" },
      { term: "岩宿遺跡", reading: "いわじゅくいせき", description: "群馬県の遺跡。日本にも旧石器時代のあったことが確かめられた" }
    ]
  }
];
