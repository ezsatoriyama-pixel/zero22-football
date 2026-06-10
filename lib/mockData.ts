export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  date: string;
  time: string;
  tournament: string;
  stage: string;
  homeStrength: number;
  awayStrength: number;
  winRate: { home: number; draw: number; away: number };
  topScores: { score: string; probability: number }[];
  scoreMatrix: number[][];
  homeGoalProb: { goals: string; probability: number }[];
  awayGoalProb: { goals: string; probability: number }[];
  aiSummary: string;
  deepTacticalReport: string;
  deepAnalysis: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    tacticalNote: string;
    keyPlayer: string;
    upsetIndex: number;
    riskLevel: string;
  };
  actualScore?: string;
  predictedScore?: string;
  isCorrect?: boolean;
}

type Seed = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  date: string;
  time: string;
  tournament: string;
  stage: string;
  homeStrength: number;
  awayStrength: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  actualScore?: string;
  predictedScore?: string;
  isCorrect?: boolean;
};

function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

function genGoalProb(avg: number): { goals: string; probability: number }[] {
  const raw = [0, 1, 2, 3, 4].map((k) =>
    Math.round((Math.pow(avg, k) * Math.exp(-avg)) / factorial(k) * 1000) / 10,
  );
  const sum = raw.reduce((a, b) => a + b, 0);
  const norm = raw.map((v) => Math.round((v / sum) * 1000) / 10);
  const adj = 100 - norm.slice(0, -1).reduce((a, b) => a + b, 0);
  norm[4] = Math.round(adj * 10) / 10;
  return [
    { goals: '0球', probability: norm[0] },
    { goals: '1球', probability: norm[1] },
    { goals: '2球', probability: norm[2] },
    { goals: '3球', probability: norm[3] },
    { goals: '4+球', probability: norm[4] },
  ];
}

function genMatrix(h: number, a: number): number[][] {
  const matrix: number[][] = [];
  let sum = 0;
  for (let i = 0; i < 5; i++) {
    matrix[i] = [];
    for (let j = 0; j < 5; j++) {
      const base = Math.exp(-((i - h) ** 2) / 2.8 - ((j - a) ** 2) / 2.8) * 20;
      matrix[i][j] = Math.round(base * 10) / 10;
      sum += matrix[i][j];
    }
  }
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      matrix[i][j] = Math.round((matrix[i][j] / sum) * 1000) / 10;
    }
  }
  return matrix;
}

function genWinRate(homeStrength: number, awayStrength: number) {
  const diff = homeStrength - awayStrength;
  let home = Math.max(18, Math.min(62, 38 + diff * 1.8));
  let away = Math.max(18, Math.min(62, 38 - diff * 1.8));
  let draw = 100 - home - away;
  if (draw < 18) {
    const need = 18 - draw;
    home -= need / 2;
    away -= need / 2;
    draw = 18;
  }
  const roundHome = Math.round(home);
  const roundAway = Math.round(away);
  const roundDraw = 100 - roundHome - roundAway;
  return { home: roundHome, draw: roundDraw, away: roundAway };
}

function genTopScores(matrix: number[][]) {
  const scores: { score: string; probability: number }[] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      scores.push({ score: `${i}:${j}`, probability: matrix[i][j] });
    }
  }
  return scores.sort((a, b) => b.probability - a.probability).slice(0, 3);
}

function genSummary(homeTeam: string, awayTeam: string, homeStrength: number, awayStrength: number) {
  const stronger = homeStrength >= awayStrength ? homeTeam : awayTeam;
  const weaker = homeStrength >= awayStrength ? awayTeam : homeTeam;
  return `${stronger}整体实力略占上风，但${weaker}并非没有机会。模型认为这场比赛的关键在于中场控制、边路推进效率以及定位球质量。若强势一方能率先建立控球优势，比赛节奏将更有利；若弱势一方在防守反击中抓住转换机会，结果仍存在波动空间。`;
}

function genReport(seed: Seed) {
  const stronger = seed.homeStrength >= seed.awayStrength ? seed.homeTeam : seed.awayTeam;
  return `【Zero22 AI 万场模拟深度推演报告】
比赛编号：${seed.id.toUpperCase()} | ${seed.homeTeam} vs ${seed.awayTeam} | ${seed.date}

一、模型基础与数据来源
Zero22 AI Football Lab 的 Z22-Net v3 模型基于 10,000 场国际赛事样本、球员俱乐部数据、国家队近两年比赛表现与战术风格标签，对本场比赛进行了 10,000 次蒙特卡洛模拟推演。模型重点评估了两队的进攻转化率、控球稳定性、防线压迫质量与阵地战效率。

二、比赛全景推演
本场比赛中，${stronger}被模型识别为相对更占优的一方，但整体差距并非无法逆转。Zero22 模型认为，比赛胜负并不只取决于纸面实力，还取决于开局 20 分钟的节奏掌控、边后卫压上后的回防速度以及禁区内二点球保护能力。若强势一方顺利建立中场优势，比赛会进入其熟悉节奏；若对手成功拖慢比赛并提高对抗密度，平局概率将明显提升。

三、战术博弈核心
预计双方都会围绕中场控制展开博弈。${seed.homeTeam}更可能通过边路推进与二次转移寻找肋部空间，${seed.awayTeam}则更依赖反击效率与局部压迫。模型预测，能否在由守转攻的前三脚传递中完成有效推进，将是这场比赛最重要的战术变量之一。若一方边锋能够持续制造 1v1 优势，比分上限会明显提升。

四、关键变量与风险提示
模型识别到三类关键风险：第一，定位球攻防的单次高价值事件；第二，比赛末段体能下降导致的中后场失误；第三，领先后节奏切换是否及时。若出现早早进球，后续比赛结构会被显著改写，尤其是落后方的压上会进一步放大对攻与爆冷概率。

五、结论
综合 10,000 次模拟，本场更可能呈现中低比分格局，推荐重点关注胜平负概率最高的一侧以及前 3 个最有可能出现的比分组合。总体来看，这是一场可预期但并非无风险的比赛，适合参考完整比分矩阵与双方进球概率后再做判断。`;
}

function createMatch(seed: Seed): Match {
  const scoreMatrix = genMatrix(seed.expectedHomeGoals, seed.expectedAwayGoals);
  const topScores = genTopScores(scoreMatrix);
  const topScore = topScores[0]?.score ?? '1:1';
  const winRate = genWinRate(seed.homeStrength, seed.awayStrength);
  const homeShots = Math.max(6, Math.round(seed.expectedHomeGoals * 7 + seed.homeStrength / 14));
  const awayShots = Math.max(6, Math.round(seed.expectedAwayGoals * 7 + seed.awayStrength / 14));
  const homeOn = Math.max(2, Math.round(homeShots * 0.38));
  const awayOn = Math.max(2, Math.round(awayShots * 0.38));
  const homePoss = Math.max(35, Math.min(65, Math.round(50 + (seed.homeStrength - seed.awayStrength) * 0.8)));
  const awayPoss = 100 - homePoss;
  const upsetIndex = Math.max(12, Math.min(45, Math.round(30 - (seed.homeStrength - seed.awayStrength))));
  const riskLevel = upsetIndex >= 36 ? '高' : upsetIndex >= 28 ? '中等' : upsetIndex >= 22 ? '中低' : '低';
  return {
    ...seed,
    winRate,
    topScores,
    scoreMatrix,
    homeGoalProb: genGoalProb(seed.expectedHomeGoals),
    awayGoalProb: genGoalProb(seed.expectedAwayGoals),
    aiSummary: genSummary(seed.homeTeam, seed.awayTeam, seed.homeStrength, seed.awayStrength),
    deepTacticalReport: genReport(seed),
    deepAnalysis: {
      possession: { home: homePoss, away: awayPoss },
      shots: { home: homeShots, away: awayShots },
      shotsOnTarget: { home: homeOn, away: awayOn },
      tacticalNote: `${seed.homeTeam}预计通过中前场传导和边路推进创造机会，${seed.awayTeam}更重视反击效率、禁区前沿压迫与转换速度。`,
      keyPlayer: `${seed.homeTeam}与${seed.awayTeam}的核心中前场球员将直接决定比赛上限，模型建议重点关注开局 30 分钟的触球质量与推进节奏。`,
      upsetIndex,
      riskLevel,
    },
    predictedScore: seed.predictedScore ?? topScore,
    actualScore: seed.actualScore,
    isCorrect: seed.isCorrect,
  };
}

const seeds: Seed[] = [
  { id: 'wc-001', homeTeam: '美国', awayTeam: '英格兰', homeFlag: '🇺🇸', awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', date: '2026-06-11', time: '21:00', tournament: '2026 FIFA世界杯', stage: '小组赛 B组', homeStrength: 82, awayStrength: 91, expectedHomeGoals: 0.8, expectedAwayGoals: 1.7, actualScore: '0:2', predictedScore: '1:2', isCorrect: false },
  { id: 'wc-002', homeTeam: '阿根廷', awayTeam: '巴西', homeFlag: '🇦🇷', awayFlag: '🇧🇷', date: '2026-06-12', time: '18:00', tournament: '2026 FIFA世界杯', stage: '小组赛 C组', homeStrength: 93, awayStrength: 94, expectedHomeGoals: 1.3, expectedAwayGoals: 1.2 },
  { id: 'wc-003', homeTeam: '法国', awayTeam: '德国', homeFlag: '🇫🇷', awayFlag: '🇩🇪', date: '2026-06-13', time: '21:00', tournament: '2026 FIFA世界杯', stage: '小组赛 D组', homeStrength: 90, awayStrength: 85, expectedHomeGoals: 1.6, expectedAwayGoals: 0.9 },
  { id: 'wc-004', homeTeam: '西班牙', awayTeam: '荷兰', homeFlag: '🇪🇸', awayFlag: '🇳🇱', date: '2026-06-14', time: '18:00', tournament: '2026 FIFA世界杯', stage: '小组赛 E组', homeStrength: 87, awayStrength: 84, expectedHomeGoals: 1.5, expectedAwayGoals: 0.9, actualScore: '1:1', predictedScore: '2:1', isCorrect: false },
  { id: 'wc-005', homeTeam: '日本', awayTeam: '克罗地亚', homeFlag: '🇯🇵', awayFlag: '🇭🇷', date: '2026-06-14', time: '21:00', tournament: '2026 FIFA世界杯', stage: '小组赛 F组', homeStrength: 80, awayStrength: 83, expectedHomeGoals: 1.0, expectedAwayGoals: 1.1 },
  { id: 'wc-006', homeTeam: '葡萄牙', awayTeam: '乌拉圭', homeFlag: '🇵🇹', awayFlag: '🇺🇾', date: '2026-06-15', time: '18:00', tournament: '2026 FIFA世界杯', stage: '小组赛 H组', homeStrength: 88, awayStrength: 81, expectedHomeGoals: 1.8, expectedAwayGoals: 0.6, actualScore: '2:0', predictedScore: '2:0', isCorrect: true },
  { id: 'wc-007', homeTeam: '摩洛哥', awayTeam: '塞内加尔', homeFlag: '🇲🇦', awayFlag: '🇸🇳', date: '2026-06-15', time: '21:00', tournament: '2026 FIFA世界杯', stage: '小组赛 A组', homeStrength: 78, awayStrength: 79, expectedHomeGoals: 0.9, expectedAwayGoals: 1.0 },
  { id: 'wc-008', homeTeam: '中国', awayTeam: '墨西哥', homeFlag: '🇨🇳', awayFlag: '🇲🇽', date: '2026-06-16', time: '21:00', tournament: '2026 FIFA世界杯', stage: '小组赛 G组', homeStrength: 68, awayStrength: 80, expectedHomeGoals: 0.6, expectedAwayGoals: 1.8 },
  { id: 'fr-201', homeTeam: '葡萄牙', awayTeam: '尼日利亚', homeFlag: '🇵🇹', awayFlag: '🇳🇬', date: '2026-06-11', time: '03:45', tournament: '国际友谊赛', stage: '周三201', homeStrength: 88, awayStrength: 76, expectedHomeGoals: 2.0, expectedAwayGoals: 0.8 },
  { id: 'fr-202', homeTeam: '德国', awayTeam: '乌克兰', homeFlag: '🇩🇪', awayFlag: '🇺🇦', date: '2026-06-11', time: '02:45', tournament: '国际友谊赛', stage: '周三202', homeStrength: 85, awayStrength: 74, expectedHomeGoals: 1.9, expectedAwayGoals: 0.9 },
  { id: 'fr-203', homeTeam: '巴西', awayTeam: '厄瓜多尔', homeFlag: '🇧🇷', awayFlag: '🇪🇨', date: '2026-06-11', time: '08:00', tournament: '国际友谊赛', stage: '周三203', homeStrength: 94, awayStrength: 78, expectedHomeGoals: 2.2, expectedAwayGoals: 0.8 },
  { id: 'wc-a1-01', homeTeam: '墨西哥', awayTeam: '南非', homeFlag: '🇲🇽', awayFlag: '🇿🇦', date: '2026-06-12', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 A组第1轮', homeStrength: 80, awayStrength: 73, expectedHomeGoals: 1.7, expectedAwayGoals: 0.8 },
  { id: 'wc-a1-02', homeTeam: '韩国', awayTeam: '捷克', homeFlag: '🇰🇷', awayFlag: '🇨🇿', date: '2026-06-12', time: '10:00', tournament: '2026 FIFA世界杯', stage: '小组赛 A组第1轮', homeStrength: 77, awayStrength: 76, expectedHomeGoals: 1.2, expectedAwayGoals: 1.1 },
  { id: 'wc-b1-01', homeTeam: '加拿大', awayTeam: '波黑', homeFlag: '🇨🇦', awayFlag: '🇧🇦', date: '2026-06-13', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 B组第1轮', homeStrength: 75, awayStrength: 74, expectedHomeGoals: 1.2, expectedAwayGoals: 1.0 },
  { id: 'wc-d1-01', homeTeam: '美国', awayTeam: '巴拉圭', homeFlag: '🇺🇸', awayFlag: '🇵🇾', date: '2026-06-13', time: '09:00', tournament: '2026 FIFA世界杯', stage: '小组赛 D组第1轮', homeStrength: 82, awayStrength: 75, expectedHomeGoals: 1.5, expectedAwayGoals: 0.9 },
  { id: 'wc-b1-02', homeTeam: '卡塔尔', awayTeam: '瑞士', homeFlag: '🇶🇦', awayFlag: '🇨🇭', date: '2026-06-14', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 B组第1轮', homeStrength: 73, awayStrength: 81, expectedHomeGoals: 0.8, expectedAwayGoals: 1.5 },
  { id: 'wc-c1-01', homeTeam: '巴西', awayTeam: '摩洛哥', homeFlag: '🇧🇷', awayFlag: '🇲🇦', date: '2026-06-14', time: '06:00', tournament: '2026 FIFA世界杯', stage: '小组赛 C组第1轮', homeStrength: 94, awayStrength: 78, expectedHomeGoals: 2.0, expectedAwayGoals: 0.8 },
  { id: 'wc-c1-02', homeTeam: '海地', awayTeam: '苏格兰', homeFlag: '🇭🇹', awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', date: '2026-06-14', time: '09:00', tournament: '2026 FIFA世界杯', stage: '小组赛 C组第1轮', homeStrength: 66, awayStrength: 77, expectedHomeGoals: 0.7, expectedAwayGoals: 1.5 },
  { id: 'wc-d1-02', homeTeam: '澳大利亚', awayTeam: '土耳其', homeFlag: '🇦🇺', awayFlag: '🇹🇷', date: '2026-06-14', time: '12:00', tournament: '2026 FIFA世界杯', stage: '小组赛 D组第1轮', homeStrength: 74, awayStrength: 78, expectedHomeGoals: 1.0, expectedAwayGoals: 1.3 },
  { id: 'wc-e1-01', homeTeam: '德国', awayTeam: '库拉索', homeFlag: '🇩🇪', awayFlag: '🇨🇼', date: '2026-06-15', time: '01:00', tournament: '2026 FIFA世界杯', stage: '小组赛 E组第1轮', homeStrength: 85, awayStrength: 62, expectedHomeGoals: 2.4, expectedAwayGoals: 0.5 },
  { id: 'wc-f1-01', homeTeam: '荷兰', awayTeam: '日本', homeFlag: '🇳🇱', awayFlag: '🇯🇵', date: '2026-06-15', time: '04:00', tournament: '2026 FIFA世界杯', stage: '小组赛 F组第1轮', homeStrength: 84, awayStrength: 80, expectedHomeGoals: 1.4, expectedAwayGoals: 1.0 },
  { id: 'wc-e1-02', homeTeam: '科特迪瓦', awayTeam: '厄瓜多尔', homeFlag: '🇨🇮', awayFlag: '🇪🇨', date: '2026-06-15', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 E组第1轮', homeStrength: 75, awayStrength: 78, expectedHomeGoals: 1.0, expectedAwayGoals: 1.2 },
  { id: 'wc-f1-02', homeTeam: '瑞典', awayTeam: '突尼斯', homeFlag: '🇸🇪', awayFlag: '🇹🇳', date: '2026-06-15', time: '10:00', tournament: '2026 FIFA世界杯', stage: '小组赛 F组第1轮', homeStrength: 77, awayStrength: 73, expectedHomeGoals: 1.3, expectedAwayGoals: 0.9 },
  { id: 'wc-h1-01', homeTeam: '西班牙', awayTeam: '佛得角', homeFlag: '🇪🇸', awayFlag: '🇨🇻', date: '2026-06-16', time: '00:00', tournament: '2026 FIFA世界杯', stage: '小组赛 H组第1轮', homeStrength: 87, awayStrength: 64, expectedHomeGoals: 2.3, expectedAwayGoals: 0.5 },
  { id: 'wc-g1-01', homeTeam: '比利时', awayTeam: '埃及', homeFlag: '🇧🇪', awayFlag: '🇪🇬', date: '2026-06-16', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 G组第1轮', homeStrength: 86, awayStrength: 72, expectedHomeGoals: 1.9, expectedAwayGoals: 0.7 },
  { id: 'wc-h1-02', homeTeam: '沙特阿拉伯', awayTeam: '乌拉圭', homeFlag: '🇸🇦', awayFlag: '🇺🇾', date: '2026-06-16', time: '06:00', tournament: '2026 FIFA世界杯', stage: '小组赛 H组第1轮', homeStrength: 70, awayStrength: 81, expectedHomeGoals: 0.8, expectedAwayGoals: 1.6 },
  { id: 'wc-g1-02', homeTeam: '伊朗', awayTeam: '新西兰', homeFlag: '🇮🇷', awayFlag: '🇳🇿', date: '2026-06-16', time: '09:00', tournament: '2026 FIFA世界杯', stage: '小组赛 G组第1轮', homeStrength: 74, awayStrength: 69, expectedHomeGoals: 1.2, expectedAwayGoals: 0.8 },
  { id: 'wc-i1-01', homeTeam: '法国', awayTeam: '塞内加尔', homeFlag: '🇫🇷', awayFlag: '🇸🇳', date: '2026-06-17', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 I组第1轮', homeStrength: 90, awayStrength: 79, expectedHomeGoals: 1.8, expectedAwayGoals: 0.9 },
  { id: 'wc-i1-02', homeTeam: '伊拉克', awayTeam: '挪威', homeFlag: '🇮🇶', awayFlag: '🇳🇴', date: '2026-06-17', time: '06:00', tournament: '2026 FIFA世界杯', stage: '小组赛 I组第1轮', homeStrength: 68, awayStrength: 79, expectedHomeGoals: 0.7, expectedAwayGoals: 1.5 },
  { id: 'wc-j1-01', homeTeam: '阿根廷', awayTeam: '阿尔及利亚', homeFlag: '🇦🇷', awayFlag: '🇩🇿', date: '2026-06-17', time: '09:00', tournament: '2026 FIFA世界杯', stage: '小组赛 J组第1轮', homeStrength: 93, awayStrength: 74, expectedHomeGoals: 2.2, expectedAwayGoals: 0.7 },
  { id: 'wc-j1-02', homeTeam: '奥地利', awayTeam: '约旦', homeFlag: '🇦🇹', awayFlag: '🇯🇴', date: '2026-06-17', time: '12:00', tournament: '2026 FIFA世界杯', stage: '小组赛 J组第1轮', homeStrength: 78, awayStrength: 67, expectedHomeGoals: 1.7, expectedAwayGoals: 0.8 },
  { id: 'wc-k1-01', homeTeam: '葡萄牙', awayTeam: '刚果(金)', homeFlag: '🇵🇹', awayFlag: '🇨🇩', date: '2026-06-18', time: '01:00', tournament: '2026 FIFA世界杯', stage: '小组赛 K组第1轮', homeStrength: 88, awayStrength: 70, expectedHomeGoals: 2.1, expectedAwayGoals: 0.7 },
  { id: 'wc-l1-01', homeTeam: '英格兰', awayTeam: '克罗地亚', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag: '🇭🇷', date: '2026-06-18', time: '04:00', tournament: '2026 FIFA世界杯', stage: '小组赛 L组第1轮', homeStrength: 91, awayStrength: 83, expectedHomeGoals: 1.8, expectedAwayGoals: 0.9 },
  { id: 'wc-l1-02', homeTeam: '加纳', awayTeam: '巴拿马', homeFlag: '🇬🇭', awayFlag: '🇵🇦', date: '2026-06-18', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 L组第1轮', homeStrength: 73, awayStrength: 71, expectedHomeGoals: 1.2, expectedAwayGoals: 1.0 },
  { id: 'wc-k1-02', homeTeam: '乌兹别克斯坦', awayTeam: '哥伦比亚', homeFlag: '🇺🇿', awayFlag: '🇨🇴', date: '2026-06-18', time: '10:00', tournament: '2026 FIFA世界杯', stage: '小组赛 K组第1轮', homeStrength: 69, awayStrength: 82, expectedHomeGoals: 0.7, expectedAwayGoals: 1.7 },
  { id: 'wc-a2-01', homeTeam: '捷克', awayTeam: '南非', homeFlag: '🇨🇿', awayFlag: '🇿🇦', date: '2026-06-19', time: '00:00', tournament: '2026 FIFA世界杯', stage: '小组赛 A组第2轮', homeStrength: 76, awayStrength: 73, expectedHomeGoals: 1.2, expectedAwayGoals: 0.9 },
  { id: 'wc-b2-01', homeTeam: '瑞士', awayTeam: '波黑', homeFlag: '🇨🇭', awayFlag: '🇧🇦', date: '2026-06-19', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 B组第2轮', homeStrength: 81, awayStrength: 74, expectedHomeGoals: 1.5, expectedAwayGoals: 0.8 },
  { id: 'wc-b2-02', homeTeam: '加拿大', awayTeam: '卡塔尔', homeFlag: '🇨🇦', awayFlag: '🇶🇦', date: '2026-06-19', time: '06:00', tournament: '2026 FIFA世界杯', stage: '小组赛 B组第2轮', homeStrength: 75, awayStrength: 73, expectedHomeGoals: 1.2, expectedAwayGoals: 1.0 },
  { id: 'wc-a2-02', homeTeam: '墨西哥', awayTeam: '韩国', homeFlag: '🇲🇽', awayFlag: '🇰🇷', date: '2026-06-19', time: '09:00', tournament: '2026 FIFA世界杯', stage: '小组赛 A组第2轮', homeStrength: 80, awayStrength: 77, expectedHomeGoals: 1.3, expectedAwayGoals: 1.0 },
  { id: 'wc-d2-01', homeTeam: '美国', awayTeam: '澳大利亚', homeFlag: '🇺🇸', awayFlag: '🇦🇺', date: '2026-06-20', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 D组第2轮', homeStrength: 82, awayStrength: 74, expectedHomeGoals: 1.6, expectedAwayGoals: 0.8 },
  { id: 'wc-c2-01', homeTeam: '苏格兰', awayTeam: '摩洛哥', homeFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', awayFlag: '🇲🇦', date: '2026-06-20', time: '06:00', tournament: '2026 FIFA世界杯', stage: '小组赛 C组第2轮', homeStrength: 77, awayStrength: 78, expectedHomeGoals: 1.1, expectedAwayGoals: 1.1 },
  { id: 'wc-c2-02', homeTeam: '巴西', awayTeam: '海地', homeFlag: '🇧🇷', awayFlag: '🇭🇹', date: '2026-06-20', time: '08:30', tournament: '2026 FIFA世界杯', stage: '小组赛 C组第2轮', homeStrength: 94, awayStrength: 66, expectedHomeGoals: 2.7, expectedAwayGoals: 0.4 },
  { id: 'wc-d2-02', homeTeam: '土耳其', awayTeam: '巴拉圭', homeFlag: '🇹🇷', awayFlag: '🇵🇾', date: '2026-06-20', time: '11:00', tournament: '2026 FIFA世界杯', stage: '小组赛 D组第2轮', homeStrength: 78, awayStrength: 75, expectedHomeGoals: 1.2, expectedAwayGoals: 1.0 },
  { id: 'wc-f2-01', homeTeam: '荷兰', awayTeam: '瑞典', homeFlag: '🇳🇱', awayFlag: '🇸🇪', date: '2026-06-21', time: '01:00', tournament: '2026 FIFA世界杯', stage: '小组赛 F组第2轮', homeStrength: 84, awayStrength: 77, expectedHomeGoals: 1.5, expectedAwayGoals: 0.8 },
  { id: 'wc-e2-01', homeTeam: '德国', awayTeam: '科特迪瓦', homeFlag: '🇩🇪', awayFlag: '🇨🇮', date: '2026-06-21', time: '04:00', tournament: '2026 FIFA世界杯', stage: '小组赛 E组第2轮', homeStrength: 85, awayStrength: 75, expectedHomeGoals: 1.8, expectedAwayGoals: 0.8 },
  { id: 'wc-e2-02', homeTeam: '厄瓜多尔', awayTeam: '库拉索', homeFlag: '🇪🇨', awayFlag: '🇨🇼', date: '2026-06-21', time: '08:00', tournament: '2026 FIFA世界杯', stage: '小组赛 E组第2轮', homeStrength: 78, awayStrength: 62, expectedHomeGoals: 2.0, expectedAwayGoals: 0.5 },
  { id: 'wc-f2-02', homeTeam: '突尼斯', awayTeam: '日本', homeFlag: '🇹🇳', awayFlag: '🇯🇵', date: '2026-06-21', time: '12:00', tournament: '2026 FIFA世界杯', stage: '小组赛 F组第2轮', homeStrength: 73, awayStrength: 80, expectedHomeGoals: 0.8, expectedAwayGoals: 1.4 },
  { id: 'wc-j2-01', homeTeam: '阿根廷', awayTeam: '奥地利', homeFlag: '🇦🇷', awayFlag: '🇦🇹', date: '2026-06-23', time: '01:00', tournament: '2026 FIFA世界杯', stage: '小组赛 J组第2轮', homeStrength: 93, awayStrength: 78, expectedHomeGoals: 2.0, expectedAwayGoals: 0.8 },
  { id: 'wc-i2-01', homeTeam: '法国', awayTeam: '伊拉克', homeFlag: '🇫🇷', awayFlag: '🇮🇶', date: '2026-06-23', time: '05:00', tournament: '2026 FIFA世界杯', stage: '小组赛 I组第2轮', homeStrength: 90, awayStrength: 68, expectedHomeGoals: 2.4, expectedAwayGoals: 0.5 },
  { id: 'wc-i2-02', homeTeam: '挪威', awayTeam: '塞内加尔', homeFlag: '🇳🇴', awayFlag: '🇸🇳', date: '2026-06-23', time: '08:00', tournament: '2026 FIFA世界杯', stage: '小组赛 I组第2轮', homeStrength: 79, awayStrength: 79, expectedHomeGoals: 1.2, expectedAwayGoals: 1.2 },
  { id: 'wc-j2-02', homeTeam: '约旦', awayTeam: '阿尔及利亚', homeFlag: '🇯🇴', awayFlag: '🇩🇿', date: '2026-06-23', time: '11:00', tournament: '2026 FIFA世界杯', stage: '小组赛 J组第2轮', homeStrength: 67, awayStrength: 74, expectedHomeGoals: 0.8, expectedAwayGoals: 1.4 },
  { id: 'wc-k2-01', homeTeam: '葡萄牙', awayTeam: '乌兹别克斯坦', homeFlag: '🇵🇹', awayFlag: '🇺🇿', date: '2026-06-24', time: '01:00', tournament: '2026 FIFA世界杯', stage: '小组赛 K组第2轮', homeStrength: 88, awayStrength: 69, expectedHomeGoals: 2.2, expectedAwayGoals: 0.6 },
  { id: 'wc-l2-01', homeTeam: '英格兰', awayTeam: '加纳', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag: '🇬🇭', date: '2026-06-24', time: '04:00', tournament: '2026 FIFA世界杯', stage: '小组赛 L组第2轮', homeStrength: 91, awayStrength: 73, expectedHomeGoals: 2.3, expectedAwayGoals: 0.6 },
  { id: 'wc-l2-02', homeTeam: '巴拿马', awayTeam: '克罗地亚', homeFlag: '🇵🇦', awayFlag: '🇭🇷', date: '2026-06-24', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 L组第2轮', homeStrength: 71, awayStrength: 83, expectedHomeGoals: 0.7, expectedAwayGoals: 1.7 },
  { id: 'wc-k2-02', homeTeam: '哥伦比亚', awayTeam: '刚果(金)', homeFlag: '🇨🇴', awayFlag: '🇨🇩', date: '2026-06-24', time: '10:00', tournament: '2026 FIFA世界杯', stage: '小组赛 K组第2轮', homeStrength: 82, awayStrength: 70, expectedHomeGoals: 1.8, expectedAwayGoals: 0.7 },

  { id: 'wc-a3-01', homeTeam: '墨西哥', awayTeam: '捷克', homeFlag: '🇲🇽', awayFlag: '🇨🇿', date: '2026-06-26', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 A组第3轮', homeStrength: 80, awayStrength: 76, expectedHomeGoals: 1.4, expectedAwayGoals: 1.0 },
  { id: 'wc-a3-02', homeTeam: '韩国', awayTeam: '南非', homeFlag: '🇰🇷', awayFlag: '🇿🇦', date: '2026-06-26', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 A组第3轮', homeStrength: 77, awayStrength: 73, expectedHomeGoals: 1.4, expectedAwayGoals: 0.9 },
  { id: 'wc-b3-01', homeTeam: '瑞士', awayTeam: '加拿大', homeFlag: '🇨🇭', awayFlag: '🇨🇦', date: '2026-06-26', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 B组第3轮', homeStrength: 81, awayStrength: 75, expectedHomeGoals: 1.5, expectedAwayGoals: 0.9 },
  { id: 'wc-b3-02', homeTeam: '卡塔尔', awayTeam: '波黑', homeFlag: '🇶🇦', awayFlag: '🇧🇦', date: '2026-06-26', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 B组第3轮', homeStrength: 73, awayStrength: 74, expectedHomeGoals: 1.0, expectedAwayGoals: 1.1 },
  { id: 'wc-c3-01', homeTeam: '巴西', awayTeam: '苏格兰', homeFlag: '🇧🇷', awayFlag: '🏴', date: '2026-06-27', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 C组第3轮', homeStrength: 94, awayStrength: 77, expectedHomeGoals: 2.1, expectedAwayGoals: 0.7 },
  { id: 'wc-c3-02', homeTeam: '摩洛哥', awayTeam: '海地', homeFlag: '🇲🇦', awayFlag: '🇭🇹', date: '2026-06-27', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 C组第3轮', homeStrength: 78, awayStrength: 66, expectedHomeGoals: 1.7, expectedAwayGoals: 0.6 },
  { id: 'wc-d3-01', homeTeam: '美国', awayTeam: '土耳其', homeFlag: '🇺🇸', awayFlag: '🇹🇷', date: '2026-06-27', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 D组第3轮', homeStrength: 82, awayStrength: 78, expectedHomeGoals: 1.4, expectedAwayGoals: 1.0 },
  { id: 'wc-d3-02', homeTeam: '澳大利亚', awayTeam: '巴拉圭', homeFlag: '🇦🇺', awayFlag: '🇵🇾', date: '2026-06-27', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 D组第3轮', homeStrength: 74, awayStrength: 75, expectedHomeGoals: 1.0, expectedAwayGoals: 1.1 },
  { id: 'wc-e3-01', homeTeam: '德国', awayTeam: '厄瓜多尔', homeFlag: '🇩🇪', awayFlag: '🇪🇨', date: '2026-06-28', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 E组第3轮', homeStrength: 85, awayStrength: 78, expectedHomeGoals: 1.6, expectedAwayGoals: 0.9 },
  { id: 'wc-e3-02', homeTeam: '科特迪瓦', awayTeam: '库拉索', homeFlag: '🇨🇮', awayFlag: '🇨🇼', date: '2026-06-28', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 E组第3轮', homeStrength: 75, awayStrength: 62, expectedHomeGoals: 1.8, expectedAwayGoals: 0.5 },
  { id: 'wc-f3-01', homeTeam: '荷兰', awayTeam: '突尼斯', homeFlag: '🇳🇱', awayFlag: '🇹🇳', date: '2026-06-28', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 F组第3轮', homeStrength: 84, awayStrength: 73, expectedHomeGoals: 1.8, expectedAwayGoals: 0.7 },
  { id: 'wc-f3-02', homeTeam: '瑞典', awayTeam: '日本', homeFlag: '🇸🇪', awayFlag: '🇯🇵', date: '2026-06-28', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 F组第3轮', homeStrength: 77, awayStrength: 80, expectedHomeGoals: 1.0, expectedAwayGoals: 1.2 },
  { id: 'wc-g3-01', homeTeam: '比利时', awayTeam: '伊朗', homeFlag: '🇧🇪', awayFlag: '🇮🇷', date: '2026-06-29', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 G组第3轮', homeStrength: 86, awayStrength: 74, expectedHomeGoals: 1.8, expectedAwayGoals: 0.7 },
  { id: 'wc-g3-02', homeTeam: '埃及', awayTeam: '新西兰', homeFlag: '🇪🇬', awayFlag: '🇳🇿', date: '2026-06-29', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 G组第3轮', homeStrength: 72, awayStrength: 69, expectedHomeGoals: 1.2, expectedAwayGoals: 0.9 },
  { id: 'wc-h3-01', homeTeam: '西班牙', awayTeam: '沙特阿拉伯', homeFlag: '🇪🇸', awayFlag: '🇸🇦', date: '2026-06-29', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 H组第3轮', homeStrength: 87, awayStrength: 70, expectedHomeGoals: 2.1, expectedAwayGoals: 0.6 },
  { id: 'wc-h3-02', homeTeam: '佛得角', awayTeam: '乌拉圭', homeFlag: '🇨🇻', awayFlag: '🇺🇾', date: '2026-06-29', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 H组第3轮', homeStrength: 64, awayStrength: 81, expectedHomeGoals: 0.5, expectedAwayGoals: 1.8 },
  { id: 'wc-i3-01', homeTeam: '法国', awayTeam: '挪威', homeFlag: '🇫🇷', awayFlag: '🇳🇴', date: '2026-06-30', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 I组第3轮', homeStrength: 90, awayStrength: 79, expectedHomeGoals: 1.8, expectedAwayGoals: 0.9 },
  { id: 'wc-i3-02', homeTeam: '伊拉克', awayTeam: '塞内加尔', homeFlag: '🇮🇶', awayFlag: '🇸🇳', date: '2026-06-30', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 I组第3轮', homeStrength: 68, awayStrength: 79, expectedHomeGoals: 0.7, expectedAwayGoals: 1.5 },
  { id: 'wc-j3-01', homeTeam: '阿根廷', awayTeam: '约旦', homeFlag: '🇦🇷', awayFlag: '🇯🇴', date: '2026-06-30', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 J组第3轮', homeStrength: 93, awayStrength: 67, expectedHomeGoals: 2.4, expectedAwayGoals: 0.4 },
  { id: 'wc-j3-02', homeTeam: '奥地利', awayTeam: '阿尔及利亚', homeFlag: '🇦🇹', awayFlag: '🇩🇿', date: '2026-06-30', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 J组第3轮', homeStrength: 78, awayStrength: 74, expectedHomeGoals: 1.3, expectedAwayGoals: 1.0 },
  { id: 'wc-k3-01', homeTeam: '葡萄牙', awayTeam: '哥伦比亚', homeFlag: '🇵🇹', awayFlag: '🇨🇴', date: '2026-07-01', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 K组第3轮', homeStrength: 88, awayStrength: 82, expectedHomeGoals: 1.6, expectedAwayGoals: 1.0 },
  { id: 'wc-k3-02', homeTeam: '乌兹别克斯坦', awayTeam: '刚果(金)', homeFlag: '🇺🇿', awayFlag: '🇨🇩', date: '2026-07-01', time: '03:00', tournament: '2026 FIFA世界杯', stage: '小组赛 K组第3轮', homeStrength: 69, awayStrength: 70, expectedHomeGoals: 1.0, expectedAwayGoals: 1.0 },
  { id: 'wc-l3-01', homeTeam: '英格兰', awayTeam: '巴拿马', homeFlag: '🏴', awayFlag: '🇵🇦', date: '2026-07-01', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 L组第3轮', homeStrength: 91, awayStrength: 71, expectedHomeGoals: 2.2, expectedAwayGoals: 0.5 },
  { id: 'wc-l3-02', homeTeam: '加纳', awayTeam: '克罗地亚', homeFlag: '🇬🇭', awayFlag: '🇭🇷', date: '2026-07-01', time: '07:00', tournament: '2026 FIFA世界杯', stage: '小组赛 L组第3轮', homeStrength: 73, awayStrength: 83, expectedHomeGoals: 0.8, expectedAwayGoals: 1.5 },

  { id: 'ko-r16-01', homeTeam: '墨西哥', awayTeam: '瑞士', homeFlag: '🇲🇽', awayFlag: '🇨🇭', date: '2026-07-04', time: '01:00', tournament: '2026 FIFA世界杯', stage: '1/8决赛', homeStrength: 80, awayStrength: 81, expectedHomeGoals: 1.1, expectedAwayGoals: 1.1 },
  { id: 'ko-r16-02', homeTeam: '巴西', awayTeam: '土耳其', homeFlag: '🇧🇷', awayFlag: '🇹🇷', date: '2026-07-04', time: '05:00', tournament: '2026 FIFA世界杯', stage: '1/8决赛', homeStrength: 94, awayStrength: 78, expectedHomeGoals: 2.0, expectedAwayGoals: 0.8 },
  { id: 'ko-r16-03', homeTeam: '德国', awayTeam: '日本', homeFlag: '🇩🇪', awayFlag: '🇯🇵', date: '2026-07-05', time: '01:00', tournament: '2026 FIFA世界杯', stage: '1/8决赛', homeStrength: 85, awayStrength: 80, expectedHomeGoals: 1.4, expectedAwayGoals: 1.0 },
  { id: 'ko-r16-04', homeTeam: '比利时', awayTeam: '乌拉圭', homeFlag: '🇧🇪', awayFlag: '🇺🇾', date: '2026-07-05', time: '05:00', tournament: '2026 FIFA世界杯', stage: '1/8决赛', homeStrength: 86, awayStrength: 81, expectedHomeGoals: 1.5, expectedAwayGoals: 1.0 },
  { id: 'ko-r16-05', homeTeam: '法国', awayTeam: '奥地利', homeFlag: '🇫🇷', awayFlag: '🇦🇹', date: '2026-07-06', time: '01:00', tournament: '2026 FIFA世界杯', stage: '1/8决赛', homeStrength: 90, awayStrength: 78, expectedHomeGoals: 1.9, expectedAwayGoals: 0.8 },
  { id: 'ko-r16-06', homeTeam: '葡萄牙', awayTeam: '英格兰', homeFlag: '🇵🇹', awayFlag: '🏴', date: '2026-07-06', time: '05:00', tournament: '2026 FIFA世界杯', stage: '1/8决赛', homeStrength: 88, awayStrength: 91, expectedHomeGoals: 1.1, expectedAwayGoals: 1.3 },
  { id: 'ko-r16-07', homeTeam: '阿根廷', awayTeam: '塞内加尔', homeFlag: '🇦🇷', awayFlag: '🇸🇳', date: '2026-07-07', time: '01:00', tournament: '2026 FIFA世界杯', stage: '1/8决赛', homeStrength: 93, awayStrength: 79, expectedHomeGoals: 2.0, expectedAwayGoals: 0.8 },
  { id: 'ko-r16-08', homeTeam: '哥伦比亚', awayTeam: '克罗地亚', homeFlag: '🇨🇴', awayFlag: '🇭🇷', date: '2026-07-07', time: '05:00', tournament: '2026 FIFA世界杯', stage: '1/8决赛', homeStrength: 82, awayStrength: 83, expectedHomeGoals: 1.1, expectedAwayGoals: 1.2 },

  { id: 'ko-qf-01', homeTeam: '巴西', awayTeam: '墨西哥', homeFlag: '🇧🇷', awayFlag: '🇲🇽', date: '2026-07-10', time: '03:00', tournament: '2026 FIFA世界杯', stage: '1/4决赛', homeStrength: 94, awayStrength: 80, expectedHomeGoals: 1.9, expectedAwayGoals: 0.8 },
  { id: 'ko-qf-02', homeTeam: '德国', awayTeam: '比利时', homeFlag: '🇩🇪', awayFlag: '🇧🇪', date: '2026-07-10', time: '09:00', tournament: '2026 FIFA世界杯', stage: '1/4决赛', homeStrength: 85, awayStrength: 86, expectedHomeGoals: 1.2, expectedAwayGoals: 1.2 },
  { id: 'ko-qf-03', homeTeam: '法国', awayTeam: '英格兰', homeFlag: '🇫🇷', awayFlag: '🏴', date: '2026-07-11', time: '03:00', tournament: '2026 FIFA世界杯', stage: '1/4决赛', homeStrength: 90, awayStrength: 91, expectedHomeGoals: 1.2, expectedAwayGoals: 1.2 },
  { id: 'ko-qf-04', homeTeam: '阿根廷', awayTeam: '克罗地亚', homeFlag: '🇦🇷', awayFlag: '🇭🇷', date: '2026-07-11', time: '09:00', tournament: '2026 FIFA世界杯', stage: '1/4决赛', homeStrength: 93, awayStrength: 83, expectedHomeGoals: 1.8, expectedAwayGoals: 0.9 },

  { id: 'ko-sf-01', homeTeam: '巴西', awayTeam: '德国', homeFlag: '🇧🇷', awayFlag: '🇩🇪', date: '2026-07-15', time: '03:00', tournament: '2026 FIFA世界杯', stage: '半决赛', homeStrength: 94, awayStrength: 85, expectedHomeGoals: 1.7, expectedAwayGoals: 1.0 },
  { id: 'ko-sf-02', homeTeam: '法国', awayTeam: '阿根廷', homeFlag: '🇫🇷', awayFlag: '🇦🇷', date: '2026-07-16', time: '03:00', tournament: '2026 FIFA世界杯', stage: '半决赛', homeStrength: 90, awayStrength: 93, expectedHomeGoals: 1.2, expectedAwayGoals: 1.3 },

  { id: 'ko-3rd-01', homeTeam: '德国', awayTeam: '法国', homeFlag: '🇩🇪', awayFlag: '🇫🇷', date: '2026-07-19', time: '00:00', tournament: '2026 FIFA世界杯', stage: '季军赛', homeStrength: 85, awayStrength: 90, expectedHomeGoals: 1.1, expectedAwayGoals: 1.4 },
  { id: 'ko-final-01', homeTeam: '巴西', awayTeam: '阿根廷', homeFlag: '🇧🇷', awayFlag: '🇦🇷', date: '2026-07-20', time: '03:00', tournament: '2026 FIFA世界杯', stage: '决赛', homeStrength: 94, awayStrength: 93, expectedHomeGoals: 1.3, expectedAwayGoals: 1.2 },
];

export const worldCupMatches: Match[] = seeds.map(createMatch);

export const historyRecords = [
  ...worldCupMatches
    .filter((m) => m.actualScore)
    .map((m) => ({
      match: `${m.homeTeam} vs ${m.awayTeam}`,
      predictedScore: m.predictedScore || '-',
      actualScore: m.actualScore || '-',
      isCorrect: m.isCorrect ?? false,
      date: m.date,
    })),
  { match: '意大利 vs 比利时', predictedScore: '2:1', actualScore: '2:1', isCorrect: true, date: '2026-06-08' },
  { match: '韩国 vs 波兰', predictedScore: '1:1', actualScore: '1:2', isCorrect: false, date: '2026-06-08' },
  { match: '哥伦比亚 vs 埃及', predictedScore: '2:0', actualScore: '3:1', isCorrect: false, date: '2026-06-07' },
  { match: '加拿大 vs 瑞士', predictedScore: '0:1', actualScore: '0:0', isCorrect: false, date: '2026-06-07' },
  { match: '丹麦 vs 秘鲁', predictedScore: '2:0', actualScore: '2:0', isCorrect: true, date: '2026-06-06' },
];

export const statsSummary = {
  totalAnalyzed: 10000,
  totalHit: 7160,
  totalAccuracy: 71.6,
  recent30Accuracy: 74.2,
  recent100Accuracy: 72.8,
};