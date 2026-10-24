// =============================================
// 社会科クエストの歴史人物（ボス・お供）
// 人物を追加するには characters 配列にオブジェクトを追加してください
// - unit：ボス戦で出題する単元（data.js の topic と同じ名前）
// - 画像は assets/quest/characters/<id>/ に置く。ファイルがない間は名前を文字で表示する
// - ability：お供になったときの能力（rpg.js の ABILITIES にある名前）
// =============================================

const characters = [
  {
    id: 'oda-nobunaga',
    name: '織田信長',
    unit: '歴史：ヨーロッパ人との出会いと全国統一',
    unlock: { subject: '歴史', units: 10 },
    bossImage: 'assets/quest/characters/oda-nobunaga/boss.webp',
    companionImage: 'assets/quest/characters/oda-nobunaga/companion.webp',
    ability: 'comboGuard'
  }
];
