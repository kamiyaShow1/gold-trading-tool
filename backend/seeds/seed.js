const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const chapters = [
  {
    chapterId: 'chapter-1',
    title: 'FXの基本概念',
    category: 'fx_basics',
    difficulty: 'easy',
    estimatedTime: 20,
    order: 1,
    content:
      'FX（外国為替証拠金取引）とは、異なる通貨を交換する取引のことです。例えば米ドルを売って日本円を買う、といった形で通貨ペアの値動きから利益を狙います。\n' +
      'FXの大きな特徴はレバレッジです。証拠金の何倍もの金額を取引できるため、少ない資金で大きな利益を狙える一方、損失も同様に拡大します。\n' +
      'また、FX市場は世界のどこかの市場が必ず開いているため、平日はほぼ24時間取引が可能です。ただし、取引が集中する時間帯とそうでない時間帯では値動きの性質が大きく異なります。\n' +
      '初心者が最初に身につけるべきは「リスク管理」です。1回の取引で口座資金の何%を失う可能性があるかを常に把握し、損切りルールを事前に決めておくことが、生き残るための大前提になります。',
    keyPoints: [
      'レバレッジで少ない資金でも大きな金額を取引できる（ただしリスクも拡大する）',
      '平日はほぼ24時間取引可能だが、時間帯によって値動きの性質が異なる',
      'リスク管理（損切りルールの事前設定）が最重要',
    ],
    examples: [
      'レバレッジ25倍の場合、証拠金4万円で約100万円分の取引が可能',
      'USD/JPYが150.00円のとき買い、150.50円で売ると+50pipsの利益',
    ],
  },
  {
    chapterId: 'chapter-2',
    title: 'ゴールドの特性',
    category: 'gold_characteristics',
    difficulty: 'medium',
    estimatedTime: 25,
    order: 2,
    content:
      '金（ゴールド、XAUUSD）は「安全資産」として知られ、株式市場が不安定な時期や地政学リスクが高まった局面で買われやすい特性があります。\n' +
      '金価格はドルの強さと逆相関になりやすいという特徴があります。ドルが弱くなると、ドル建てで取引される金は相対的に割安になり買われやすくなります。逆にドルが強くなると金は売られやすくなります。\n' +
      'また、各国の中央銀行は外貨準備の一部として金を保有・買い増しする動きがあり、この買い動向も中長期的な価格トレンドに影響します。\n' +
      '金利動向も重要です。金は金利を生まない資産のため、金利が上昇する局面では金利のつく資産（債券など）に資金が流れ、金は相対的に不利になりやすい傾向があります。',
    keyPoints: [
      '金は「安全資産」として、リスクオフの局面で買われやすい',
      'ドル指数と逆相関になりやすい（ドル安→金高、ドル高→金安の傾向）',
      '金利が生まれない資産のため、金利上昇局面では相対的に不利になりやすい',
    ],
    examples: [
      'ドル指数が1日で-1%下落した日は金が上昇しやすい傾向がある',
      'FOMCで利上げが決定されると、金が短期的に売られることが多い',
    ],
  },
  {
    chapterId: 'chapter-3',
    title: 'テクニカル分析基礎',
    category: 'technical_analysis',
    difficulty: 'medium',
    estimatedTime: 30,
    order: 3,
    content:
      '移動平均線（EMA）は一定期間の価格の平均を線で表したもので、トレンドの方向性を把握するのに使われます。EMA20（短期）、EMA75（中期）、EMA200（長期）を組み合わせて使うのが一般的です。\n' +
      '価格がEMAより上にあれば上昇トレンド、下にあれば下降トレンドの可能性が高いと判断されます。また、短期EMAが長期EMAを上抜けする「ゴールデンクロス」は買いシグナル、逆は「デッドクロス」と呼ばれ売りシグナルとされます。\n' +
      'RSI（相対力指数）は0〜100の範囲で相場の過熱感を示す指標で、一般的に70以上は買われすぎ、30以下は売られすぎと判断されます。\n' +
      'ATR（Average True Range）は値動きの大きさ（ボラティリティ）を数値化した指標で、損切り幅やポジションサイズを決める際の目安になります。',
    keyPoints: [
      'EMA（移動平均線）でトレンドの方向性を判断する',
      'RSIで相場の過熱感（買われすぎ・売られすぎ）を判断する',
      'ATRでボラティリティを把握し、損切り幅の目安にする',
    ],
    examples: [
      'EMA20がEMA75を上抜けたらゴールデンクロス（買いシグナルの一つ）',
      'RSIが75まで上昇したら「買われすぎ」の可能性を警戒する',
    ],
  },
  {
    chapterId: 'chapter-4',
    title: '時間軸と市場構造',
    category: 'time_zones',
    difficulty: 'medium',
    estimatedTime: 20,
    order: 4,
    content:
      '為替・金相場は主に東京市場、ロンドン市場、ニューヨーク市場の3つの主要市場で取引されており、それぞれ開いている時間帯が異なります。\n' +
      '日本時間で見ると、東京市場は9時頃、ロンドン市場は16〜17時頃（サマータイムにより変動）、ニューヨーク市場は21〜22時頃に始まります。\n' +
      'ロンドン市場とニューヨーク市場が重なる時間帯（日本時間21時〜24時頃）は、取引参加者が最も多く流動性が高いため、値動きが大きくなりやすい時間帯です。\n' +
      '逆に東京市場のみが開いている時間帯（早朝〜午前中）は流動性が低く、スプレッドが広がったり、突発的な値動きに対してスリッページが発生しやすい傾向があります。',
    keyPoints: [
      '主要市場は東京・ロンドン・ニューヨークの3つ',
      'ロンドン・ニューヨークの重複時間帯は流動性が高く値動きが大きい',
      '流動性が低い時間帯はスプレッド拡大・スリッページに注意',
    ],
    examples: [
      '日本時間21:30の米経済指標発表直後はボラティリティが急上昇しやすい',
      '早朝の閑散時間帯にエントリーすると想定外のスリッページが起きやすい',
    ],
  },
  {
    chapterId: 'chapter-5',
    title: 'ファンダメンタル分析',
    category: 'fundamental_analysis',
    difficulty: 'hard',
    estimatedTime: 30,
    order: 5,
    content:
      'FOMC（連邦公開市場委員会）はアメリカの金融政策を決定する会合で、政策金利の変更は為替・金相場に大きな影響を与えます。利上げはドル高・金安、利下げはドル安・金高に働きやすい傾向があります。\n' +
      'NFP（非農業部門雇用者数）は毎月発表される米雇用統計の中心的な指標で、市場予想との乖離が大きいほど値動きが激しくなります。\n' +
      'CPI（消費者物価指数）はインフレ動向を示す指標で、インフレが高いほど利上げ観測が強まりドル高要因になりやすい一方、金は「インフレヘッジ資産」としての側面もあるため、状況によって反応が変わります。\n' +
      'ドル指数（DXY）は主要通貨に対するドルの相対的な強さを示す指数で、金相場との逆相関を確認する際によく参照されます。VIX（恐怖指数）はリスク回避度合いを示し、VIXが急上昇する局面では金が買われやすくなります。',
    keyPoints: [
      'FOMCの金利政策はドル・金相場に大きな影響を与える',
      'NFP・CPIなどの経済指標発表時はボラティリティが急上昇しやすい',
      'ドル指数（DXY）とVIX（恐怖指数）は金相場分析の重要な補助指標',
    ],
    examples: [
      'CPIが市場予想を上回ると、利上げ観測が強まりドル高・金安に振れやすい',
      'VIXが急騰する局面（株式市場の急落時など）は金が買われやすい',
    ],
  },
];

function buildQuiz(chapter) {
  const base = {
    'chapter-1': [
      {
        question: 'FXにおけるレバレッジの説明として正しいものはどれ？',
        options: [
          '証拠金と同額しか取引できない仕組み',
          '証拠金の何倍もの金額を取引できる仕組み',
          '損失を必ず限定できる仕組み',
          '取引手数料を割り引く仕組み',
        ],
        correctIndex: 1,
      },
      {
        question: 'FX市場の取引可能時間について正しいものはどれ？',
        options: [
          '日本時間の日中のみ取引可能',
          '土日を含め24時間365日取引可能',
          '平日はほぼ24時間取引可能',
          '各国市場が開く数時間のみ取引可能',
        ],
        correctIndex: 2,
      },
      {
        question: '初心者が最初に身につけるべきと説明されているものは？',
        options: ['高レバレッジ取引', 'リスク管理（損切りルール）', 'ニュースの暗記', '複数口座の開設'],
        correctIndex: 1,
      },
      {
        question: 'レバレッジ25倍・証拠金4万円で取引できる金額の目安は？',
        options: ['4万円', '10万円', '約40万円', '約100万円'],
        correctIndex: 3,
      },
      {
        question: 'レバレッジが上がると何が拡大する？',
        options: ['利益のみ', '損失のみ', '利益と損失の両方', 'スプレッドのみ'],
        correctIndex: 2,
      },
    ],
    'chapter-2': [
      {
        question: '金（ゴールド）が買われやすいのはどのような局面？',
        options: ['株式市場が絶好調な時', 'リスクオフ（不安が高まる）局面', '金利が急上昇している時', 'ドルが急騰している時'],
        correctIndex: 1,
      },
      {
        question: 'ドル指数が上昇すると、金相場はどうなりやすい？',
        options: ['上昇しやすい', '下降しやすい', '必ず変わらない', '取引停止になる'],
        correctIndex: 1,
      },
      {
        question: '金が「金利を生まない資産」であることの影響として正しいものは？',
        options: [
          '金利上昇局面で相対的に不利になりやすい',
          '金利上昇局面で必ず値上がりする',
          '金利とは無関係に常に一定',
          '金利が上がると取引できなくなる',
        ],
        correctIndex: 0,
      },
      {
        question: '中央銀行の金保有・買い増しが与える影響は？',
        options: ['短期の値動きのみに影響する', '中長期的な価格トレンドに影響しうる', '金価格には一切影響しない', '為替レートのみに影響する'],
        correctIndex: 1,
      },
      {
        question: 'FOMCで利上げが決定されたときに金が短期的にどうなりやすいか？',
        options: ['急騰しやすい', '売られやすい', '変化しない', '取引が停止する'],
        correctIndex: 1,
      },
    ],
    'chapter-3': [
      {
        question: '価格がEMAより上にある場合、一般的にどう判断される？',
        options: ['下降トレンドの可能性が高い', '上昇トレンドの可能性が高い', 'トレンドは判断できない', '取引すべきでない'],
        correctIndex: 1,
      },
      {
        question: '短期EMAが長期EMAを上抜けする現象の名称は？',
        options: ['デッドクロス', 'ゴールデンクロス', 'ダブルトップ', 'ダイバージェンス'],
        correctIndex: 1,
      },
      {
        question: 'RSIが70以上のとき、一般的にどう判断される？',
        options: ['売られすぎ', '買われすぎ', '中立', 'トレンド転換確定'],
        correctIndex: 1,
      },
      {
        question: 'ATRが示しているものは何？',
        options: ['トレンドの方向性', '相場の過熱感', '値動きの大きさ（ボラティリティ）', '出来高'],
        correctIndex: 2,
      },
      {
        question: 'RSIが25まで低下した場合、一般的にどう判断される？',
        options: ['買われすぎ', '売られすぎ', 'ボラティリティ拡大確定', '判断材料にならない'],
        correctIndex: 1,
      },
    ],
    'chapter-4': [
      {
        question: '為替・金相場の3大市場に含まれないのはどれ？',
        options: ['東京市場', 'ロンドン市場', 'ニューヨーク市場', 'シドニー市場'],
        correctIndex: 3,
      },
      {
        question: '最も流動性が高くなりやすい時間帯はどれ？',
        options: [
          '東京市場のみが開いている早朝',
          'ロンドンとニューヨークが重なる時間帯',
          '全市場が閉じている深夜',
          '東京市場の昼休み時間帯',
        ],
        correctIndex: 1,
      },
      {
        question: '流動性が低い時間帯に起きやすい現象はどれ？',
        options: ['スプレッド縮小', 'スリッページの減少', 'スプレッド拡大・スリッページ増加', '取引の完全停止'],
        correctIndex: 2,
      },
      {
        question: '日本時間でロンドン市場が始まる目安の時間帯は？',
        options: ['朝6時頃', '9時頃', '16〜17時頃', '深夜2時頃'],
        correctIndex: 2,
      },
      {
        question: '米経済指標発表直後（日本時間21:30頃）に起きやすいことは？',
        options: ['ボラティリティの急上昇', '完全に値動きが止まる', '取引所が休場になる', 'スプレッドが必ず縮小する'],
        correctIndex: 0,
      },
    ],
    'chapter-5': [
      {
        question: 'FOMCで利上げが行われた場合、一般的な傾向はどれ？',
        options: ['ドル安・金高になりやすい', 'ドル高・金安になりやすい', '為替相場に影響しない', '金相場のみ無関係'],
        correctIndex: 1,
      },
      {
        question: 'NFP（非農業部門雇用者数）の特徴として正しいものは？',
        options: [
          '市場予想との乖離が大きいほど値動きが激しくなる',
          '株式市場にのみ影響する指標',
          '毎日発表される指標',
          '為替相場には無関係の指標',
        ],
        correctIndex: 0,
      },
      {
        question: 'CPIが市場予想を上回った場合の一般的な傾向はどれ？',
        options: ['利下げ観測が強まる', '利上げ観測が強まりやすい', '相場に一切影響しない', '取引が停止される'],
        correctIndex: 1,
      },
      {
        question: 'ドル指数（DXY）の役割として正しいものはどれ？',
        options: [
          '金相場との逆相関を確認する補助指標になる',
          '日本の株価指数を表す',
          '仮想通貨の価格指数を表す',
          '金利政策そのものを決定する指標'
        ],
        correctIndex: 0,
      },
      {
        question: 'VIX（恐怖指数）が急騰する局面で金相場はどうなりやすい？',
        options: ['売られやすい', '買われやすい', '取引停止になる', '変化しない'],
        correctIndex: 1,
      },
    ],
  };

  const questions = base[chapter.chapterId].map((q, index) => ({
    questionId: `${chapter.chapterId}-q${index + 1}`,
    question: q.question,
    options: q.options,
    correctAnswer: q.options[q.correctIndex],
  }));

  return {
    title: `${chapter.title} 確認テスト`,
    description: `${chapter.title}の理解度を確認する5問のテストです。`,
    questionsJson: { questions },
    passingScore: 80,
  };
}

// MarketData: 直近5日間 x 7時間足のテストデータ(docs/PHASE2.mdのチャートAPI疎通確認用)
const MARKET_DATES = ['2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07', '2026-09-08'];
const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function buildMarketDataRecord(dateStr, dayIndex, timeframe) {
  const open = 2520 + (dayIndex * 10 + randomBetween(-5, 5));
  const high = open + randomBetween(50, 150);
  const low = open - randomBetween(50, 150);
  const close = low + randomBetween(0, high - low);

  return {
    symbol: 'XAUUSD',
    timeframe,
    timestamp: new Date(`${dateStr}T00:00:00.000Z`),
    open,
    high,
    low,
    close,
    // ema20/75/200はcloseからの簡易オフセットで生成(実際のEMA計算ではないテスト用データ)
    ema20: close - randomBetween(0, 5),
    ema75: close - randomBetween(5, 15),
    ema200: close - randomBetween(15, 30),
    rsi: randomBetween(30, 70),
    atr: randomBetween(5, 20),
    fomc: false,
    nfp: false,
    cpi: null,
    dollarIndex: randomBetween(104.0, 105.0),
    vix: randomBetween(15, 25),
  };
}

async function seedMarketData() {
  let count = 0;
  for (let dayIndex = 0; dayIndex < MARKET_DATES.length; dayIndex += 1) {
    const dateStr = MARKET_DATES[dayIndex];
    for (const timeframe of TIMEFRAMES) {
      const record = buildMarketDataRecord(dateStr, dayIndex, timeframe);
      await prisma.marketData.upsert({
        where: {
          symbol_timeframe_timestamp: {
            symbol: record.symbol,
            timeframe: record.timeframe,
            timestamp: record.timestamp,
          },
        },
        update: record,
        create: record,
      });
      count += 1;
    }
  }
  console.log(`[seed] MarketData を ${count} 件投入しました`);
}

async function main() {
  for (const chapter of chapters) {
    const { chapterId, keyPoints, examples, ...rest } = chapter;

    const content = await prisma.learningContent.upsert({
      where: { chapterId },
      update: { ...rest, keyPoints, examples },
      create: { chapterId, ...rest, keyPoints, examples },
    });

    const quizData = buildQuiz(chapter);
    const existingQuiz = await prisma.quiz.findFirst({ where: { contentId: content.id } });
    if (existingQuiz) {
      await prisma.quiz.update({ where: { id: existingQuiz.id }, data: quizData });
    } else {
      await prisma.quiz.create({ data: { contentId: content.id, ...quizData } });
    }

    console.log(`[seed] ${chapterId}: ${chapter.title} を投入しました`);
  }

  await seedMarketData();
}

main()
  .catch((err) => {
    console.error('[seed] エラーが発生しました', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
