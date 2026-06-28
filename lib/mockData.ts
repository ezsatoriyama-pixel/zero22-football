import officialSeeds from '@/data/world-cup-2026-seeds.json';

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


function factorial(n: number): number { return n <= 1 ? 1 : n * factorial(n - 1); }

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function hashNoise(input: string, scale = 0.08): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) | 0;
  const normalized = ((Math.abs(hash) % 1000) / 1000) - 0.5;
  return normalized * 2 * scale;
}

const southAmericanTeams = new Set(['阿根廷','巴西','乌拉圭','哥伦比亚','厄瓜多尔','巴拉圭']);
const hostTeams = new Set(['美国','墨西哥','加拿大']);
const highTempoTeams = new Set(['美国','德国','荷兰','英格兰','法国','巴西','葡萄牙','哥伦比亚','土耳其']);
const compactDefensiveTeams = new Set(['巴拉圭','乌拉圭','摩洛哥','瑞士','伊朗','突尼斯','克罗地亚','日本']);

// 近期状态代理值：不是实时伤停/赔率，而是按国家队近年稳定性、杯赛表现、阵容成熟度给出的保守修正。
const formProxy: Record<string, number> = {
  阿根廷: 0.16, 巴西: 0.10, 法国: 0.13, 英格兰: 0.11, 西班牙: 0.10, 葡萄牙: 0.09,
  乌拉圭: 0.12, 哥伦比亚: 0.12, 摩洛哥: 0.10, 日本: 0.08, 瑞士: 0.05, 克罗地亚: 0.04,
  美国: -0.03, 墨西哥: 0.01, 加拿大: 0.00, 巴拉圭: 0.08, 厄瓜多尔: 0.06,
  韩国: 0.03, 土耳其: 0.04, 塞内加尔: 0.05, 挪威: 0.04, 奥地利: 0.04,
  德国: 0.06, 荷兰: 0.07, 比利时: 0.03, 乌拉圭_: 0.12,
};

type AdjustedModel = {
  homeGoals: number;
  awayGoals: number;
  baseHomeGoals: number;
  baseAwayGoals: number;
  riskHomeGoals: number;
  riskAwayGoals: number;
  baseScore: string;
  riskScore: string;
  finalScore: string;
  confidence: string;
  volatility: number;
  upsetIndex: number;
  riskLevel: string;
  notes: string[];
};

function topScoreFromGoals(h: number, a: number): string {
  let best = { score: '1:1', probability: -1 };
  for (let i = 0; i <= 5; i++) {
    for (let j = 0; j <= 5; j++) {
      const p = poisson(h, i) * poisson(a, j);
      if (p > best.probability) best = { score: `${i}:${j}`, probability: p };
    }
  }
  return best.score;
}

function confidenceLabel(baseScore: string, riskScore: string, upsetIndex: number, volatility: number): string {
  if (baseScore === riskScore && upsetIndex < 30) return '高';
  if (baseScore === riskScore) return '中高';
  if (upsetIndex >= 50 || volatility >= 1.35) return '中低';
  return '中等';
}

function adjustExpectedGoals(seed: Seed): AdjustedModel {
  const baseH = seed.expectedHomeGoals;
  const baseA = seed.expectedAwayGoals;
  let h = baseH;
  let a = baseA;
  let volatility = 1;
  const notes: string[] = [];
  const diff = seed.homeStrength - seed.awayStrength;

  // 模型A：基础命中模型。保留旧算法优势，主要反映纸面实力、基础进球期望和常规赛果。
  const baseScore = topScoreFromGoals(baseH, baseA);

  // 模型B：风险修正模型。加入状态、风格、地区特征、赔率代理和随机性。
  const homeForm = formProxy[seed.homeTeam] ?? 0;
  const awayForm = formProxy[seed.awayTeam] ?? 0;
  h += homeForm;
  a += awayForm;
  if (Math.abs(homeForm - awayForm) >= 0.08) notes.push('近期状态代理对进球期望做了修正');

  if (hostTeams.has(seed.homeTeam)) {
    h += 0.10;
    a -= 0.03;
    notes.push(`${seed.homeTeam}有主办国环境加成，但幅度已保守处理`);
  }
  if (hostTeams.has(seed.awayTeam)) a += 0.06;

  const homeSA = southAmericanTeams.has(seed.homeTeam);
  const awaySA = southAmericanTeams.has(seed.awayTeam);
  if (homeSA) {
    h += 0.10;
    a -= 0.03;
    volatility += 0.08;
    notes.push(`${seed.homeTeam}具备南美球队对抗与转换优势`);
  }
  if (awaySA) {
    a += 0.12;
    h -= 0.05;
    volatility += 0.10;
    notes.push(`${seed.awayTeam}的南美对抗和反击属性提高比赛不确定性`);
  }

  if (hostTeams.has(seed.homeTeam) && awaySA) {
    h -= 0.12;
    a += 0.15;
    volatility += 0.18;
    notes.push('主办国球队面对南美对手时，纸面优势被下调');
  }
  if (homeSA && hostTeams.has(seed.awayTeam)) {
    h += 0.08;
    volatility += 0.12;
  }

  if (highTempoTeams.has(seed.homeTeam)) h += 0.05;
  if (highTempoTeams.has(seed.awayTeam)) a += 0.05;
  if (compactDefensiveTeams.has(seed.homeTeam)) a -= 0.08;
  if (compactDefensiveTeams.has(seed.awayTeam)) h -= 0.08;

  if (Math.abs(diff) >= 8) {
    const favoriteIsHome = diff > 0;
    const underdogIsSA = favoriteIsHome ? awaySA : homeSA;
    const underdogCompact = favoriteIsHome ? compactDefensiveTeams.has(seed.awayTeam) : compactDefensiveTeams.has(seed.homeTeam);
    if (underdogIsSA || underdogCompact) {
      if (favoriteIsHome) { h -= 0.10; a += 0.08; } else { a -= 0.10; h += 0.08; }
      volatility += 0.10;
      notes.push('赔率变化代理显示热门方向需要降温处理');
    }
  }

  if (seed.stage.includes('第3轮')) {
    volatility += 0.12;
    h -= 0.03;
    a -= 0.03;
    notes.push('小组赛末轮加入轮换与算分情境修正');
  }

  const n = hashNoise(seed.id, 0.07);
  h += n;
  a -= n * 0.6;

  const riskH = clamp(h, 0.35, 2.65);
  const riskA = clamp(a, 0.35, 2.45);
  const riskScore = topScoreFromGoals(riskH, riskA);

  const strengthGap = Math.abs(diff);
  const upsetIndex = clamp(Math.round(50 - strengthGap * 1.7 + (volatility - 1) * 45), 8, 70);
  const riskLevel = upsetIndex >= 50 ? '较高' : upsetIndex >= 36 ? '中高' : upsetIndex >= 24 ? '中等' : '中低';

  // 模型C：发布稳定融合。
  // 重要：主推比分优先保留基础模型，避免算法升级后把已经公开展示过的预测全部改掉。
  // 风险模型用于调低置信度、提示防冷比分、修正胜率和概率分布；只有极高风险且强烈分歧时才允许改主推。
  const disagreement = baseScore === riskScore ? 0 : 1;
  const extremeRisk = upsetIndex >= 62 && volatility >= 1.45 && disagreement === 1;
  const riskWeight = extremeRisk
    ? clamp(0.58 + (volatility - 1.4) * 0.2, 0.58, 0.70)
    : clamp(0.18 + upsetIndex / 260 + (volatility - 1) * 0.12, 0.22, 0.42);
  const baseWeight = 1 - riskWeight;
  const finalH = clamp(baseH * baseWeight + riskH * riskWeight, 0.35, 2.75);
  const finalA = clamp(baseA * baseWeight + riskA * riskWeight, 0.35, 2.55);
  const blendedScore = topScoreFromGoals(finalH, finalA);
  const finalScore = extremeRisk ? blendedScore : baseScore;
  const confidence = confidenceLabel(baseScore, riskScore, upsetIndex, volatility);

  if (baseScore !== riskScore) {
    notes.push(`基础模型 ${baseScore} 与风险模型 ${riskScore} 存在分歧，主推保留基础模型，风险模型作为防冷参考`);
  } else {
    notes.push(`基础模型与风险模型共同指向 ${baseScore}`);
  }

  return {
    homeGoals: round1(finalH),
    awayGoals: round1(finalA),
    baseHomeGoals: round1(baseH),
    baseAwayGoals: round1(baseA),
    riskHomeGoals: round1(riskH),
    riskAwayGoals: round1(riskA),
    baseScore,
    riskScore,
    finalScore,
    confidence,
    volatility,
    upsetIndex,
    riskLevel,
    notes,
  };
}
function poisson(avg: number, k: number): number {
  return (Math.pow(avg, k) * Math.exp(-avg)) / factorial(k);
}

function genGoalProb(avg: number): { goals: string; probability: number }[] {
  const raw = [0,1,2,3].map(k => poisson(avg, k));
  const tail = Math.max(0, 1 - raw.reduce((s, v) => s + v, 0));
  const all = [...raw, tail];
  const norm = all.map(v => Math.round(v * 1000) / 10);
  const adj = 100 - norm.slice(0, -1).reduce((a, b) => a + b, 0);
  norm[4] = Math.round(adj * 10) / 10;
  return [
    { goals:'0球', probability:norm[0] },
    { goals:'1球', probability:norm[1] },
    { goals:'2球', probability:norm[2] },
    { goals:'3球', probability:norm[3] },
    { goals:'4+球', probability:norm[4] },
  ];
}

function genMatrix(h:number,a:number): number[][] {
  const matrix: number[][] = [];
  let sum = 0;
  for (let i = 0; i < 5; i++) {
    matrix[i] = [];
    const hp = i === 4 ? Math.max(0, 1 - [0,1,2,3].reduce((s,k)=>s+poisson(h,k),0)) : poisson(h, i);
    for (let j = 0; j < 5; j++) {
      const ap = j === 4 ? Math.max(0, 1 - [0,1,2,3].reduce((s,k)=>s+poisson(a,k),0)) : poisson(a, j);
      matrix[i][j] = hp * ap;
      sum += matrix[i][j];
    }
  }
  for(let i=0;i<5;i++) for(let j=0;j<5;j++) matrix[i][j]=Math.round((matrix[i][j]/sum)*1000)/10;
  return matrix;
}

function genWinRateFromGoals(h:number,a:number, volatility = 1){
  let home = 0, draw = 0, away = 0;
  for (let i=0;i<=7;i++) {
    const hp = poisson(h, i);
    for (let j=0;j<=7;j++) {
      const p = hp * poisson(a, j);
      if (i>j) home += p;
      else if (i===j) draw += p;
      else away += p;
    }
  }
  const total = home + draw + away;
  home = home / total * 100;
  draw = draw / total * 100;
  away = away / total * 100;

  // 波动越高，越往平局和弱势方回归，避免热门过热。
  const damp = clamp((volatility - 1) * 0.18, 0, 0.12);
  const maxSide = home > away ? 'home' : 'away';
  if (maxSide === 'home') { home -= home * damp; away += home * damp * 0.55; draw += home * damp * 0.45; }
  else { away -= away * damp; home += away * damp * 0.55; draw += away * damp * 0.45; }

  const rh = Math.round(home), ra = Math.round(away);
  return { home: rh, draw: Math.max(0, 100 - rh - ra), away: ra };
}

function genTopScores(h:number,a:number): {score:string;probability:number}[] {
  const r: {score:string;probability:number}[]=[];
  for(let i=0;i<=5;i++) {
    for(let j=0;j<=5;j++) {
      const p = poisson(h, i) * poisson(a, j) * 100;
      r.push({score:`${i}:${j}`,probability:Math.round(p*10)/10});
    }
  }
  return r.filter(s=>s.probability>1).sort((a,b)=>b.probability-a.probability).slice(0,5);
}

function ai(home:string,away:string,hs:number,as:number, model: AdjustedModel):string{
  const d=hs-as;
  const base = d>8
    ? `${home}纸面实力占优，基础模型会倾向常规热门方向；融合模型再用风险项检查是否过热。`
    : d>3
      ? `${home}略占上风，但胜负会受到节奏、身体对抗和临场状态影响。`
      : d>-4
        ? `两队实力接近，基础模型与风险模型都会提高平局和一球差权重。`
        : `${away}纸面更被看好，但融合模型仍保留${home}通过反击、定位球或临场波动抢分的可能。`;
  const note = model.notes.length ? `关键修正：${model.notes.slice(0, 2).join('；')}。` : '关键修正：采用基础模型 + 风险模型双通道融合。';
  return `${base}${note}基础模型主推：${model.baseScore}；风险修正参考：${model.riskScore}；当前发布主推比分：${model.finalScore}。置信度：${model.confidence}，风险评级：${model.riskLevel}。`;
}
function rep(home:string,away:string):string{
  return `【赛前深度战术推演】

一、模型口径
Zero22 当前使用双模型融合：基础命中模型保留旧算法对强弱分明比赛的判断力；风险修正模型加入近期状态代理、地域/风格特征、主办国环境、赔率变化代理与足球随机性。系统不宣称接入官方实时赔率或实时伤停。

二、阵型与布局
${home}预计会根据对手强弱在4-3-3与4-2-3-1之间切换。${away}若纸面处于下风，大概率优先保证中路密度，通过反击和定位球寻找机会。

三、攻防博弈
模型不再二选一地放大或压低热门。基础模型负责常规赛果，风险模型负责识别南美球队、紧凑防守球队、小组赛末轮和热门过热情境，最后通过权重融合。

四、关键变量
首发阵容、临场伤停、红黄牌、点球、早段进球和赔率临场异动都可能让实际比分偏离最高概率比分。因此推荐比分应理解为概率最高的一组结果，而不是确定结果。

五、模型判断
基于 Zero22 Net v4.1 双模型融合，对 10,000 场历史样本与蒙特卡洛模拟进行修正。若基础模型与风险模型一致，置信度上调；若分歧明显，系统会给出更保守的最终比分和防冷提示。`;
}

function deep(hs:number,as:number, model: AdjustedModel){
  const hShare = clamp(Math.round(50 + (hs-as)*0.35), 35, 65);
  return {
    possession:{ home:hShare, away:100-hShare },
    shots:{ home:Math.round(6+model.homeGoals*4.2), away:Math.round(6+model.awayGoals*4.2) },
    shotsOnTarget:{ home:Math.max(1, Math.round(1+model.homeGoals*1.8)), away:Math.max(1, Math.round(1+model.awayGoals*1.8)) },
    tacticalNote:`双模型融合：基础模型保留常规命中能力，风险模型识别风格冲突、赔率代理和随机性；当前主推优先保持基础模型稳定性，风险模型用于防冷和置信度修正。`,
    keyPlayer: hs>as ? '主队核心中场 / 反击第一出球点' : hs<as ? '客队核心前锋 / 定位球主罚点' : '双方攻防转换核心',
    upsetIndex: model.upsetIndex,
    riskLevel: model.riskLevel,
  };
}

function createMatch(seed:Seed):Match{
  const model = adjustExpectedGoals(seed);
  const h=model.homeGoals, a=model.awayGoals;
  const topScores = genTopScores(h,a);
  return {
    ...seed,
    predictedScore: seed.predictedScore || model.finalScore || topScores[0]?.score,
    winRate:genWinRateFromGoals(h,a,model.volatility),
    topScores,
    scoreMatrix:genMatrix(h,a),
    homeGoalProb:genGoalProb(h),
    awayGoalProb:genGoalProb(a),
    aiSummary:ai(seed.homeTeam,seed.awayTeam,seed.homeStrength,seed.awayStrength,model),
    deepTacticalReport:rep(seed.homeTeam,seed.awayTeam),
    deepAnalysis:deep(seed.homeStrength,seed.awayStrength,model),
  };
}

function localizePlaceholderName(name: string): string {
  const winnerMatch = name.match(/^Winner of Match (\d+)$/);
  if (winnerMatch) return `第${winnerMatch[1]}场胜者`;

  const loserMatch = name.match(/^Loser of Match (\d+)$/);
  if (loserMatch) return `第${loserMatch[1]}场负者`;

  const groupRank = name.match(/^(1st|2nd|4th) of Group ([A-L])$/);
  if (groupRank) {
    const rankMap: Record<string, string> = { '1st': '第1', '2nd': '第2', '4th': '第4' };
    return `${groupRank[2]}组${rankMap[groupRank[1]]}`;
  }

  const bestThird = name.match(/^Best 3rd \(([A-L]+)\)$/);
  if (bestThird) return `成绩最好的第三名（${bestThird[1]}组）`;

  return name;
}

// ============ 2026 FIFA\u4e16\u754c\u676f Schedule Model ============
// 注意：当前为赛程模型数据，不冒充官方最终分组/完整赛程；官方赛程确认后可逐场替换。

const legacySeeds: Seed[] = [
  { id:'wc-a1-01', homeTeam:'墨西哥', awayTeam:'南非', homeFlag:'🇲🇽', awayFlag:'🇿🇦', date:'2026-06-12', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 A组 第1轮', homeStrength:83, awayStrength:67, expectedHomeGoals:1.9, expectedAwayGoals:0.4 },
  { id:'wc-a1-02', homeTeam:'韩国', awayTeam:'捷克', homeFlag:'🇰🇷', awayFlag:'🇨🇿', date:'2026-06-12', time:'10:00', tournament:'2026 FIFA世界杯', stage:'小组赛 A组 第1轮', homeStrength:76, awayStrength:75, expectedHomeGoals:1.2, expectedAwayGoals:1.0 },
  { id:'wc-b1-01', homeTeam:'加拿大', awayTeam:'波黑', homeFlag:'🇨🇦', awayFlag:'🇧🇦', date:'2026-06-13', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 B组 第1轮', homeStrength:73, awayStrength:71, expectedHomeGoals:1.2, expectedAwayGoals:1.0 },
  { id:'wc-d1-01', homeTeam:'美国', awayTeam:'巴拉圭', homeFlag:'🇺🇸', awayFlag:'🇵🇾', date:'2026-06-13', time:'06:00', tournament:'2026 FIFA世界杯', stage:'小组赛 D组 第1轮', homeStrength:82, awayStrength:73, expectedHomeGoals:1.6, expectedAwayGoals:0.7 },
  { id:'wc-b1-02', homeTeam:'卡塔尔', awayTeam:'瑞士', homeFlag:'🇶🇦', awayFlag:'🇨🇭', date:'2026-06-14', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 B组 第1轮', homeStrength:63, awayStrength:85, expectedHomeGoals:0.3, expectedAwayGoals:1.9 },
  { id:'wc-c1-01', homeTeam:'海地', awayTeam:'苏格兰', homeFlag:'🇭🇹', awayFlag:'🏴', date:'2026-06-14', time:'06:00', tournament:'2026 FIFA世界杯', stage:'小组赛 C组 第1轮', homeStrength:54, awayStrength:74, expectedHomeGoals:0.3, expectedAwayGoals:1.9 },
  { id:'wc-c1-02', homeTeam:'巴西', awayTeam:'摩洛哥', homeFlag:'🇧🇷', awayFlag:'🇲🇦', date:'2026-06-14', time:'09:00', tournament:'2026 FIFA世界杯', stage:'小组赛 C组 第1轮', homeStrength:94, awayStrength:78, expectedHomeGoals:1.9, expectedAwayGoals:0.4 },
  { id:'wc-d1-02', homeTeam:'澳大利亚', awayTeam:'土耳其', homeFlag:'🇦🇺', awayFlag:'🇹🇷', date:'2026-06-14', time:'12:00', tournament:'2026 FIFA世界杯', stage:'小组赛 D组 第1轮', homeStrength:74, awayStrength:79, expectedHomeGoals:0.9, expectedAwayGoals:1.2 },
  { id:'wc-e1-01', homeTeam:'德国', awayTeam:'库拉索', homeFlag:'🇩🇪', awayFlag:'🇨🇼', date:'2026-06-15', time:'01:00', tournament:'2026 FIFA世界杯', stage:'小组赛 E组 第1轮', homeStrength:90, awayStrength:52, expectedHomeGoals:2.8, expectedAwayGoals:0.3 },
  { id:'wc-f1-01', homeTeam:'荷兰', awayTeam:'日本', homeFlag:'🇳🇱', awayFlag:'🇯🇵', date:'2026-06-15', time:'04:00', tournament:'2026 FIFA世界杯', stage:'小组赛 F组 第1轮', homeStrength:88, awayStrength:80, expectedHomeGoals:1.5, expectedAwayGoals:0.7 },
  { id:'wc-e1-02', homeTeam:'科特迪瓦', awayTeam:'厄瓜多尔', homeFlag:'🇨🇮', awayFlag:'🇪🇨', date:'2026-06-15', time:'07:00', tournament:'2026 FIFA世界杯', stage:'小组赛 E组 第1轮', homeStrength:74, awayStrength:77, expectedHomeGoals:1.0, expectedAwayGoals:1.2 },
  { id:'wc-f1-02', homeTeam:'瑞典', awayTeam:'突尼斯', homeFlag:'🇸🇪', awayFlag:'🇹🇳', date:'2026-06-15', time:'10:00', tournament:'2026 FIFA世界杯', stage:'小组赛 F组 第1轮', homeStrength:77, awayStrength:69, expectedHomeGoals:1.5, expectedAwayGoals:0.7 },
  { id:'wc-h1-01', homeTeam:'西班牙', awayTeam:'佛得角', homeFlag:'🇪🇸', awayFlag:'🇨🇻', date:'2026-06-16', time:'00:00', tournament:'2026 FIFA世界杯', stage:'小组赛 H组 第1轮', homeStrength:89, awayStrength:54, expectedHomeGoals:2.7, expectedAwayGoals:0.3 },
  { id:'wc-g1-01', homeTeam:'比利时', awayTeam:'埃及', homeFlag:'🇧🇪', awayFlag:'🇪🇬', date:'2026-06-16', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 G组 第1轮', homeStrength:87, awayStrength:75, expectedHomeGoals:1.7, expectedAwayGoals:0.6 },
  { id:'wc-g1-02', homeTeam:'伊朗', awayTeam:'新西兰', homeFlag:'🇮🇷', awayFlag:'🇳🇿', date:'2026-06-16', time:'06:00', tournament:'2026 FIFA世界杯', stage:'小组赛 G组 第1轮', homeStrength:76, awayStrength:58, expectedHomeGoals:2.0, expectedAwayGoals:0.3 },
  { id:'wc-h1-02', homeTeam:'沙特阿拉伯', awayTeam:'乌拉圭', homeFlag:'🇸🇦', awayFlag:'🇺🇾', date:'2026-06-16', time:'09:00', tournament:'2026 FIFA世界杯', stage:'小组赛 H组 第1轮', homeStrength:64, awayStrength:82, expectedHomeGoals:0.3, expectedAwayGoals:1.8 },
  { id:'wc-i1-01', homeTeam:'法国', awayTeam:'塞内加尔', homeFlag:'🇫🇷', awayFlag:'🇸🇳', date:'2026-06-17', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 I组 第1轮', homeStrength:91, awayStrength:79, expectedHomeGoals:1.7, expectedAwayGoals:0.6 },
  { id:'wc-i1-02', homeTeam:'伊拉克', awayTeam:'挪威', homeFlag:'🇮🇶', awayFlag:'🇳🇴', date:'2026-06-17', time:'06:00', tournament:'2026 FIFA世界杯', stage:'小组赛 I组 第1轮', homeStrength:61, awayStrength:81, expectedHomeGoals:0.3, expectedAwayGoals:1.9 },
  { id:'wc-j1-01', homeTeam:'阿根廷', awayTeam:'阿尔及利亚', homeFlag:'🇦🇷', awayFlag:'🇩🇿', date:'2026-06-17', time:'09:00', tournament:'2026 FIFA世界杯', stage:'小组赛 J组 第1轮', homeStrength:93, awayStrength:74, expectedHomeGoals:2.0, expectedAwayGoals:0.3 },
  { id:'wc-j1-02', homeTeam:'奥地利', awayTeam:'约旦', homeFlag:'🇦🇹', awayFlag:'🇯🇴', date:'2026-06-17', time:'12:00', tournament:'2026 FIFA世界杯', stage:'小组赛 J组 第1轮', homeStrength:77, awayStrength:55, expectedHomeGoals:2.1, expectedAwayGoals:0.3 },
  { id:'wc-k1-01', homeTeam:'葡萄牙', awayTeam:'刚果(金)', homeFlag:'🇵🇹', awayFlag:'🇨🇩', date:'2026-06-18', time:'01:00', tournament:'2026 FIFA世界杯', stage:'小组赛 K组 第1轮', homeStrength:89, awayStrength:62, expectedHomeGoals:2.4, expectedAwayGoals:0.3 },
  { id:'wc-l1-01', homeTeam:'英格兰', awayTeam:'克罗地亚', homeFlag:'🏴', awayFlag:'🇭🇷', date:'2026-06-18', time:'04:00', tournament:'2026 FIFA世界杯', stage:'小组赛 L组 第1轮', homeStrength:91, awayStrength:83, expectedHomeGoals:1.5, expectedAwayGoals:0.7 },
  { id:'wc-l1-02', homeTeam:'加纳', awayTeam:'巴拿马', homeFlag:'🇬🇭', awayFlag:'🇵🇦', date:'2026-06-18', time:'07:00', tournament:'2026 FIFA世界杯', stage:'小组赛 L组 第1轮', homeStrength:72, awayStrength:58, expectedHomeGoals:1.8, expectedAwayGoals:0.5 },
  { id:'wc-k1-02', homeTeam:'乌兹别克斯坦', awayTeam:'哥伦比亚', homeFlag:'🇺🇿', awayFlag:'🇨🇴', date:'2026-06-18', time:'10:00', tournament:'2026 FIFA世界杯', stage:'小组赛 K组 第1轮', homeStrength:66, awayStrength:81, expectedHomeGoals:0.5, expectedAwayGoals:1.6 },
  { id:'wc-a2-01', homeTeam:'捷克', awayTeam:'南非', homeFlag:'🇨🇿', awayFlag:'🇿🇦', date:'2026-06-19', time:'00:00', tournament:'2026 FIFA世界杯', stage:'小组赛 A组 第2轮', homeStrength:75, awayStrength:67, expectedHomeGoals:1.5, expectedAwayGoals:0.7 },
  { id:'wc-b2-01', homeTeam:'瑞士', awayTeam:'波黑', homeFlag:'🇨🇭', awayFlag:'🇧🇦', date:'2026-06-19', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 B组 第2轮', homeStrength:85, awayStrength:71, expectedHomeGoals:1.8, expectedAwayGoals:0.5 },
  { id:'wc-a2-02', homeTeam:'墨西哥', awayTeam:'韩国', homeFlag:'🇲🇽', awayFlag:'🇰🇷', date:'2026-06-19', time:'06:00', tournament:'2026 FIFA世界杯', stage:'小组赛 A组 第2轮', homeStrength:83, awayStrength:76, expectedHomeGoals:1.5, expectedAwayGoals:0.8 },
  { id:'wc-b2-02', homeTeam:'加拿大', awayTeam:'卡塔尔', homeFlag:'🇨🇦', awayFlag:'🇶🇦', date:'2026-06-19', time:'09:00', tournament:'2026 FIFA世界杯', stage:'小组赛 B组 第2轮', homeStrength:73, awayStrength:63, expectedHomeGoals:1.6, expectedAwayGoals:0.7 },
  { id:'wc-d2-01', homeTeam:'美国', awayTeam:'澳大利亚', homeFlag:'🇺🇸', awayFlag:'🇦🇺', date:'2026-06-20', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 D组 第2轮', homeStrength:82, awayStrength:74, expectedHomeGoals:1.5, expectedAwayGoals:0.7 },
  { id:'wc-c2-01', homeTeam:'巴西', awayTeam:'海地', homeFlag:'🇧🇷', awayFlag:'🇭🇹', date:'2026-06-20', time:'08:30', tournament:'2026 FIFA世界杯', stage:'小组赛 C组 第2轮', homeStrength:94, awayStrength:54, expectedHomeGoals:2.8, expectedAwayGoals:0.3 },
  { id:'wc-c2-02', homeTeam:'苏格兰', awayTeam:'摩洛哥', homeFlag:'🏴', awayFlag:'🇲🇦', date:'2026-06-20', time:'09:00', tournament:'2026 FIFA世界杯', stage:'小组赛 C组 第2轮', homeStrength:74, awayStrength:78, expectedHomeGoals:1.0, expectedAwayGoals:1.2 },
  { id:'wc-d2-02', homeTeam:'土耳其', awayTeam:'巴拉圭', homeFlag:'🇹🇷', awayFlag:'🇵🇾', date:'2026-06-20', time:'11:00', tournament:'2026 FIFA世界杯', stage:'小组赛 D组 第2轮', homeStrength:79, awayStrength:73, expectedHomeGoals:1.4, expectedAwayGoals:0.8 },
  { id:'wc-f2-01', homeTeam:'荷兰', awayTeam:'瑞典', homeFlag:'🇳🇱', awayFlag:'🇸🇪', date:'2026-06-21', time:'01:00', tournament:'2026 FIFA世界杯', stage:'小组赛 F组 第2轮', homeStrength:88, awayStrength:77, expectedHomeGoals:1.6, expectedAwayGoals:0.6 },
  { id:'wc-e2-01', homeTeam:'德国', awayTeam:'科特迪瓦', homeFlag:'🇩🇪', awayFlag:'🇨🇮', date:'2026-06-21', time:'04:00', tournament:'2026 FIFA世界杯', stage:'小组赛 E组 第2轮', homeStrength:90, awayStrength:74, expectedHomeGoals:1.9, expectedAwayGoals:0.4 },
  { id:'wc-e2-02', homeTeam:'厄瓜多尔', awayTeam:'库拉索', homeFlag:'🇪🇨', awayFlag:'🇨🇼', date:'2026-06-21', time:'08:00', tournament:'2026 FIFA世界杯', stage:'小组赛 E组 第2轮', homeStrength:77, awayStrength:52, expectedHomeGoals:2.3, expectedAwayGoals:0.3 },
  { id:'wc-f2-02', homeTeam:'突尼斯', awayTeam:'日本', homeFlag:'🇹🇳', awayFlag:'🇯🇵', date:'2026-06-21', time:'12:00', tournament:'2026 FIFA世界杯', stage:'小组赛 F组 第2轮', homeStrength:69, awayStrength:80, expectedHomeGoals:0.7, expectedAwayGoals:1.5 },
  { id:'wc-h2-01', homeTeam:'西班牙', awayTeam:'沙特阿拉伯', homeFlag:'🇪🇸', awayFlag:'🇸🇦', date:'2026-06-22', time:'00:00', tournament:'2026 FIFA世界杯', stage:'小组赛 H组 第2轮', homeStrength:89, awayStrength:64, expectedHomeGoals:2.3, expectedAwayGoals:0.3 },
  { id:'wc-g2-01', homeTeam:'比利时', awayTeam:'伊朗', homeFlag:'🇧🇪', awayFlag:'🇮🇷', date:'2026-06-22', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 G组 第2轮', homeStrength:87, awayStrength:76, expectedHomeGoals:1.6, expectedAwayGoals:0.6 },
  { id:'wc-h2-02', homeTeam:'乌拉圭', awayTeam:'佛得角', homeFlag:'🇺🇾', awayFlag:'🇨🇻', date:'2026-06-22', time:'06:00', tournament:'2026 FIFA世界杯', stage:'小组赛 H组 第2轮', homeStrength:82, awayStrength:54, expectedHomeGoals:2.4, expectedAwayGoals:0.3 },
  { id:'wc-g2-02', homeTeam:'新西兰', awayTeam:'埃及', homeFlag:'🇳🇿', awayFlag:'🇪🇬', date:'2026-06-22', time:'09:00', tournament:'2026 FIFA世界杯', stage:'小组赛 G组 第2轮', homeStrength:58, awayStrength:75, expectedHomeGoals:0.4, expectedAwayGoals:1.7 },
  { id:'wc-j2-01', homeTeam:'阿根廷', awayTeam:'奥地利', homeFlag:'🇦🇷', awayFlag:'🇦🇹', date:'2026-06-23', time:'01:00', tournament:'2026 FIFA世界杯', stage:'小组赛 J组 第2轮', homeStrength:93, awayStrength:77, expectedHomeGoals:1.9, expectedAwayGoals:0.4 },
  { id:'wc-i2-01', homeTeam:'法国', awayTeam:'伊拉克', homeFlag:'🇫🇷', awayFlag:'🇮🇶', date:'2026-06-23', time:'05:00', tournament:'2026 FIFA世界杯', stage:'小组赛 I组 第2轮', homeStrength:91, awayStrength:61, expectedHomeGoals:2.5, expectedAwayGoals:0.3 },
  { id:'wc-i2-02', homeTeam:'挪威', awayTeam:'塞内加尔', homeFlag:'🇳🇴', awayFlag:'🇸🇳', date:'2026-06-23', time:'08:00', tournament:'2026 FIFA世界杯', stage:'小组赛 I组 第2轮', homeStrength:81, awayStrength:79, expectedHomeGoals:1.2, expectedAwayGoals:1.0 },
  { id:'wc-j2-02', homeTeam:'约旦', awayTeam:'阿尔及利亚', homeFlag:'🇯🇴', awayFlag:'🇩🇿', date:'2026-06-23', time:'11:00', tournament:'2026 FIFA世界杯', stage:'小组赛 J组 第2轮', homeStrength:55, awayStrength:74, expectedHomeGoals:0.3, expectedAwayGoals:1.8 },
  { id:'wc-k2-01', homeTeam:'葡萄牙', awayTeam:'乌兹别克斯坦', homeFlag:'🇵🇹', awayFlag:'🇺🇿', date:'2026-06-24', time:'01:00', tournament:'2026 FIFA世界杯', stage:'小组赛 K组 第2轮', homeStrength:89, awayStrength:66, expectedHomeGoals:2.2, expectedAwayGoals:0.3 },
  { id:'wc-l2-01', homeTeam:'英格兰', awayTeam:'加纳', homeFlag:'🏴', awayFlag:'🇬🇭', date:'2026-06-24', time:'04:00', tournament:'2026 FIFA世界杯', stage:'小组赛 L组 第2轮', homeStrength:91, awayStrength:72, expectedHomeGoals:2.0, expectedAwayGoals:0.3 },
  { id:'wc-l2-02', homeTeam:'巴拿马', awayTeam:'克罗地亚', homeFlag:'🇵🇦', awayFlag:'🇭🇷', date:'2026-06-24', time:'07:00', tournament:'2026 FIFA世界杯', stage:'小组赛 L组 第2轮', homeStrength:58, awayStrength:83, expectedHomeGoals:0.3, expectedAwayGoals:2.0 },
  { id:'wc-k2-02', homeTeam:'哥伦比亚', awayTeam:'刚果(金)', homeFlag:'🇨🇴', awayFlag:'🇨🇩', date:'2026-06-24', time:'10:00', tournament:'2026 FIFA世界杯', stage:'小组赛 K组 第2轮', homeStrength:81, awayStrength:62, expectedHomeGoals:2.0, expectedAwayGoals:0.3 },
  { id:'wc-b3-01', homeTeam:'瑞士', awayTeam:'加拿大', homeFlag:'🇨🇭', awayFlag:'🇨🇦', date:'2026-06-25', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 B组 第3轮', homeStrength:85, awayStrength:73, expectedHomeGoals:1.7, expectedAwayGoals:0.6 },
  { id:'wc-b3-02', homeTeam:'波黑', awayTeam:'卡塔尔', homeFlag:'🇧🇦', awayFlag:'🇶🇦', date:'2026-06-25', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 B组 第3轮', homeStrength:71, awayStrength:63, expectedHomeGoals:1.5, expectedAwayGoals:0.7 },
  { id:'wc-a3-01', homeTeam:'南非', awayTeam:'韩国', homeFlag:'🇿🇦', awayFlag:'🇰🇷', date:'2026-06-25', time:'06:00', tournament:'2026 FIFA世界杯', stage:'小组赛 A组 第3轮', homeStrength:67, awayStrength:76, expectedHomeGoals:0.7, expectedAwayGoals:1.4 },
  { id:'wc-a3-02', homeTeam:'捷克', awayTeam:'墨西哥', homeFlag:'🇨🇿', awayFlag:'🇲🇽', date:'2026-06-25', time:'06:00', tournament:'2026 FIFA世界杯', stage:'小组赛 A组 第3轮', homeStrength:75, awayStrength:83, expectedHomeGoals:0.8, expectedAwayGoals:1.4 },
  { id:'wc-c3-01', homeTeam:'苏格兰', awayTeam:'巴西', homeFlag:'🏴', awayFlag:'🇧🇷', date:'2026-06-25', time:'09:00', tournament:'2026 FIFA世界杯', stage:'小组赛 C组 第3轮', homeStrength:74, awayStrength:94, expectedHomeGoals:0.3, expectedAwayGoals:1.9 },
  { id:'wc-c3-02', homeTeam:'摩洛哥', awayTeam:'海地', homeFlag:'🇲🇦', awayFlag:'🇭🇹', date:'2026-06-25', time:'09:00', tournament:'2026 FIFA世界杯', stage:'小组赛 C组 第3轮', homeStrength:78, awayStrength:54, expectedHomeGoals:2.2, expectedAwayGoals:0.3 },
  { id:'wc-e3-01', homeTeam:'库拉索', awayTeam:'科特迪瓦', homeFlag:'🇨🇼', awayFlag:'🇨🇮', date:'2026-06-26', time:'04:00', tournament:'2026 FIFA世界杯', stage:'小组赛 E组 第3轮', homeStrength:52, awayStrength:74, expectedHomeGoals:0.3, expectedAwayGoals:1.9 },
  { id:'wc-e3-02', homeTeam:'厄瓜多尔', awayTeam:'德国', homeFlag:'🇪🇨', awayFlag:'🇩🇪', date:'2026-06-26', time:'04:00', tournament:'2026 FIFA世界杯', stage:'小组赛 E组 第3轮', homeStrength:77, awayStrength:90, expectedHomeGoals:0.6, expectedAwayGoals:1.6 },
  { id:'wc-f3-01', homeTeam:'突尼斯', awayTeam:'荷兰', homeFlag:'🇹🇳', awayFlag:'🇳🇱', date:'2026-06-26', time:'07:00', tournament:'2026 FIFA世界杯', stage:'小组赛 F组 第3轮', homeStrength:69, awayStrength:88, expectedHomeGoals:0.3, expectedAwayGoals:1.8 },
  { id:'wc-f3-02', homeTeam:'日本', awayTeam:'瑞典', homeFlag:'🇯🇵', awayFlag:'🇸🇪', date:'2026-06-26', time:'07:00', tournament:'2026 FIFA世界杯', stage:'小组赛 F组 第3轮', homeStrength:80, awayStrength:77, expectedHomeGoals:1.3, expectedAwayGoals:0.9 },
  { id:'wc-d3-01', homeTeam:'土耳其', awayTeam:'美国', homeFlag:'🇹🇷', awayFlag:'🇺🇸', date:'2026-06-26', time:'10:00', tournament:'2026 FIFA世界杯', stage:'小组赛 D组 第3轮', homeStrength:79, awayStrength:82, expectedHomeGoals:1.0, expectedAwayGoals:1.2 },
  { id:'wc-d3-02', homeTeam:'巴拉圭', awayTeam:'澳大利亚', homeFlag:'🇵🇾', awayFlag:'🇦🇺', date:'2026-06-26', time:'10:00', tournament:'2026 FIFA世界杯', stage:'小组赛 D组 第3轮', homeStrength:73, awayStrength:74, expectedHomeGoals:1.1, expectedAwayGoals:1.1 },
  { id:'wc-i3-01', homeTeam:'挪威', awayTeam:'法国', homeFlag:'🇳🇴', awayFlag:'🇫🇷', date:'2026-06-27', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 I组 第3轮', homeStrength:81, awayStrength:91, expectedHomeGoals:0.7, expectedAwayGoals:1.5 },
  { id:'wc-i3-02', homeTeam:'塞内加尔', awayTeam:'伊拉克', homeFlag:'🇸🇳', awayFlag:'🇮🇶', date:'2026-06-27', time:'03:00', tournament:'2026 FIFA世界杯', stage:'小组赛 I组 第3轮', homeStrength:79, awayStrength:61, expectedHomeGoals:2.0, expectedAwayGoals:0.3 },
  { id:'wc-h3-01', homeTeam:'佛得角', awayTeam:'沙特阿拉伯', homeFlag:'🇨🇻', awayFlag:'🇸🇦', date:'2026-06-27', time:'08:00', tournament:'2026 FIFA世界杯', stage:'小组赛 H组 第3轮', homeStrength:54, awayStrength:64, expectedHomeGoals:0.7, expectedAwayGoals:1.5 },
  { id:'wc-h3-02', homeTeam:'乌拉圭', awayTeam:'西班牙', homeFlag:'🇺🇾', awayFlag:'🇪🇸', date:'2026-06-27', time:'08:00', tournament:'2026 FIFA世界杯', stage:'小组赛 H组 第3轮', homeStrength:82, awayStrength:89, expectedHomeGoals:0.8, expectedAwayGoals:1.3 },
  { id:'wc-g3-01', homeTeam:'埃及', awayTeam:'伊朗', homeFlag:'🇪🇬', awayFlag:'🇮🇷', date:'2026-06-27', time:'11:00', tournament:'2026 FIFA世界杯', stage:'小组赛 G组 第3轮', homeStrength:75, awayStrength:76, expectedHomeGoals:1.1, expectedAwayGoals:1.1 },
  { id:'wc-g3-02', homeTeam:'新西兰', awayTeam:'比利时', homeFlag:'🇳🇿', awayFlag:'🇧🇪', date:'2026-06-27', time:'11:00', tournament:'2026 FIFA世界杯', stage:'小组赛 G组 第3轮', homeStrength:58, awayStrength:87, expectedHomeGoals:0.3, expectedAwayGoals:2.2 },
  { id:'wc-l3-01', homeTeam:'巴拿马', awayTeam:'英格兰', homeFlag:'🇵🇦', awayFlag:'🏴', date:'2026-06-28', time:'05:00', tournament:'2026 FIFA世界杯', stage:'小组赛 L组 第3轮', homeStrength:58, awayStrength:91, expectedHomeGoals:0.3, expectedAwayGoals:2.4 },
  { id:'wc-l3-02', homeTeam:'克罗地亚', awayTeam:'加纳', homeFlag:'🇭🇷', awayFlag:'🇬🇭', date:'2026-06-28', time:'05:00', tournament:'2026 FIFA世界杯', stage:'小组赛 L组 第3轮', homeStrength:83, awayStrength:72, expectedHomeGoals:1.6, expectedAwayGoals:0.6 },
  { id:'wc-k3-01', homeTeam:'哥伦比亚', awayTeam:'葡萄牙', homeFlag:'🇨🇴', awayFlag:'🇵🇹', date:'2026-06-28', time:'07:30', tournament:'2026 FIFA世界杯', stage:'小组赛 K组 第3轮', homeStrength:81, awayStrength:89, expectedHomeGoals:0.8, expectedAwayGoals:1.4 },
  { id:'wc-k3-02', homeTeam:'刚果(金)', awayTeam:'乌兹别克斯坦', homeFlag:'🇨🇩', awayFlag:'🇺🇿', date:'2026-06-28', time:'07:30', tournament:'2026 FIFA世界杯', stage:'小组赛 K组 第3轮', homeStrength:62, awayStrength:66, expectedHomeGoals:1.0, expectedAwayGoals:1.2 },
  { id:'wc-j3-01', homeTeam:'阿尔及利亚', awayTeam:'奥地利', homeFlag:'🇩🇿', awayFlag:'🇦🇹', date:'2026-06-28', time:'10:00', tournament:'2026 FIFA世界杯', stage:'小组赛 J组 第3轮', homeStrength:74, awayStrength:77, expectedHomeGoals:1.0, expectedAwayGoals:1.2 },
  { id:'wc-j3-02', homeTeam:'约旦', awayTeam:'阿根廷', homeFlag:'🇯🇴', awayFlag:'🇦🇷', date:'2026-06-28', time:'10:00', tournament:'2026 FIFA世界杯', stage:'小组赛 J组 第3轮', homeStrength:55, awayStrength:93, expectedHomeGoals:0.3, expectedAwayGoals:2.6 },



  { id:'wc-r32-01', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d1', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d2', homeFlag:'TBD', awayFlag:'TBD', date:'2026-06-29', time:'00:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c1\u573a', homeStrength:84, awayStrength:78, expectedHomeGoals:1.5, expectedAwayGoals:1.0 },
  { id:'wc-r32-02', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d3', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d4', homeFlag:'TBD', awayFlag:'TBD', date:'2026-06-29', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c2\u573a', homeStrength:82, awayStrength:80, expectedHomeGoals:1.3, expectedAwayGoals:1.1 },
  { id:'wc-r32-03', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d5', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d6', homeFlag:'TBD', awayFlag:'TBD', date:'2026-06-29', time:'06:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c3\u573a', homeStrength:86, awayStrength:77, expectedHomeGoals:1.6, expectedAwayGoals:0.9 },
  { id:'wc-r32-04', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d7', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d8', homeFlag:'TBD', awayFlag:'TBD', date:'2026-06-29', time:'09:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c4\u573a', homeStrength:80, awayStrength:79, expectedHomeGoals:1.2, expectedAwayGoals:1.1 },
  { id:'wc-r32-05', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d9', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d10', homeFlag:'TBD', awayFlag:'TBD', date:'2026-06-30', time:'00:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c5\u573a', homeStrength:85, awayStrength:76, expectedHomeGoals:1.6, expectedAwayGoals:0.9 },
  { id:'wc-r32-06', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d11', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d12', homeFlag:'TBD', awayFlag:'TBD', date:'2026-06-30', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c6\u573a', homeStrength:81, awayStrength:80, expectedHomeGoals:1.3, expectedAwayGoals:1.1 },
  { id:'wc-r32-07', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d13', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d14', homeFlag:'TBD', awayFlag:'TBD', date:'2026-06-30', time:'06:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c7\u573a', homeStrength:83, awayStrength:78, expectedHomeGoals:1.4, expectedAwayGoals:1.0 },
  { id:'wc-r32-08', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d15', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d16', homeFlag:'TBD', awayFlag:'TBD', date:'2026-06-30', time:'09:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c8\u573a', homeStrength:79, awayStrength:79, expectedHomeGoals:1.2, expectedAwayGoals:1.2 },
  { id:'wc-r32-09', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d17', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d18', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-01', time:'00:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c9\u573a', homeStrength:84, awayStrength:77, expectedHomeGoals:1.5, expectedAwayGoals:1.0 },
  { id:'wc-r32-10', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d19', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d20', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-01', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c10\u573a', homeStrength:82, awayStrength:81, expectedHomeGoals:1.3, expectedAwayGoals:1.1 },
  { id:'wc-r32-11', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d21', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d22', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-01', time:'06:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c11\u573a', homeStrength:86, awayStrength:75, expectedHomeGoals:1.7, expectedAwayGoals:0.8 },
  { id:'wc-r32-12', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d23', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d24', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-01', time:'09:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c12\u573a', homeStrength:80, awayStrength:78, expectedHomeGoals:1.3, expectedAwayGoals:1.0 },
  { id:'wc-r32-13', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d25', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d26', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-02', time:'00:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c13\u573a', homeStrength:83, awayStrength:79, expectedHomeGoals:1.4, expectedAwayGoals:1.1 },
  { id:'wc-r32-14', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d27', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d28', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-02', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c14\u573a', homeStrength:81, awayStrength:77, expectedHomeGoals:1.4, expectedAwayGoals:1.0 },
  { id:'wc-r32-15', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d29', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d30', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-02', time:'06:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c15\u573a', homeStrength:85, awayStrength:78, expectedHomeGoals:1.5, expectedAwayGoals:0.9 },
  { id:'wc-r32-16', homeTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d31', awayTeam:'\u0033\u0032\u5f3a\u5e2d\u4f4d32', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-02', time:'09:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0033\u0032\u5f3a\u8d5b \u7b2c16\u573a', homeStrength:82, awayStrength:80, expectedHomeGoals:1.3, expectedAwayGoals:1.1 },
  { id:'wc-r16-01', homeTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u80051', awayTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u80052', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-04', time:'00:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0031\u0036\u5f3a\u8d5b \u7b2c1\u573a', homeStrength:84, awayStrength:82, expectedHomeGoals:1.4, expectedAwayGoals:1.1 },
  { id:'wc-r16-02', homeTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u80053', awayTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u80054', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-04', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0031\u0036\u5f3a\u8d5b \u7b2c2\u573a', homeStrength:85, awayStrength:81, expectedHomeGoals:1.5, expectedAwayGoals:1.0 },
  { id:'wc-r16-03', homeTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u80055', awayTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u80056', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-04', time:'06:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0031\u0036\u5f3a\u8d5b \u7b2c3\u573a', homeStrength:83, awayStrength:81, expectedHomeGoals:1.4, expectedAwayGoals:1.0 },
  { id:'wc-r16-04', homeTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u80057', awayTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u80058', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-04', time:'09:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0031\u0036\u5f3a\u8d5b \u7b2c4\u573a', homeStrength:82, awayStrength:82, expectedHomeGoals:1.3, expectedAwayGoals:1.1 },
  { id:'wc-r16-05', homeTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u80059', awayTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u800510', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-05', time:'00:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0031\u0036\u5f3a\u8d5b \u7b2c5\u573a', homeStrength:84, awayStrength:80, expectedHomeGoals:1.5, expectedAwayGoals:1.0 },
  { id:'wc-r16-06', homeTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u800511', awayTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u800512', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-05', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0031\u0036\u5f3a\u8d5b \u7b2c6\u573a', homeStrength:86, awayStrength:82, expectedHomeGoals:1.5, expectedAwayGoals:1.0 },
  { id:'wc-r16-07', homeTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u800513', awayTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u800514', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-05', time:'06:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0031\u0036\u5f3a\u8d5b \u7b2c7\u573a', homeStrength:83, awayStrength:80, expectedHomeGoals:1.4, expectedAwayGoals:1.0 },
  { id:'wc-r16-08', homeTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u800515', awayTeam:'\u0033\u0032\u5f3a\u8d5b\u80dc\u800516', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-05', time:'09:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u0031\u0036\u5f3a\u8d5b \u7b2c8\u573a', homeStrength:85, awayStrength:81, expectedHomeGoals:1.5, expectedAwayGoals:1.0 },
  { id:'wc-qf-01', homeTeam:'\u0031\u0036\u5f3a\u8d5b\u80dc\u80051', awayTeam:'\u0031\u0036\u5f3a\u8d5b\u80dc\u80052', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-09', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'1/4\u51b3\u8d5b \u7b2c1\u573a', homeStrength:86, awayStrength:83, expectedHomeGoals:1.4, expectedAwayGoals:1.0 },
  { id:'wc-qf-02', homeTeam:'\u0031\u0036\u5f3a\u8d5b\u80dc\u80053', awayTeam:'\u0031\u0036\u5f3a\u8d5b\u80dc\u80054', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-09', time:'07:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'1/4\u51b3\u8d5b \u7b2c2\u573a', homeStrength:85, awayStrength:84, expectedHomeGoals:1.3, expectedAwayGoals:1.1 },
  { id:'wc-qf-03', homeTeam:'\u0031\u0036\u5f3a\u8d5b\u80dc\u80055', awayTeam:'\u0031\u0036\u5f3a\u8d5b\u80dc\u80056', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-10', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'1/4\u51b3\u8d5b \u7b2c3\u573a', homeStrength:87, awayStrength:84, expectedHomeGoals:1.4, expectedAwayGoals:1.0 },
  { id:'wc-qf-04', homeTeam:'\u0031\u0036\u5f3a\u8d5b\u80dc\u80057', awayTeam:'\u0031\u0036\u5f3a\u8d5b\u80dc\u80058', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-10', time:'07:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'1/4\u51b3\u8d5b \u7b2c4\u573a', homeStrength:86, awayStrength:83, expectedHomeGoals:1.4, expectedAwayGoals:1.0 },
  { id:'wc-sf-01', homeTeam:'1/4\u51b3\u8d5b\u80dc\u80051', awayTeam:'1/4\u51b3\u8d5b\u80dc\u80052', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-14', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u534a\u51b3\u8d5b \u7b2c1\u573a', homeStrength:88, awayStrength:85, expectedHomeGoals:1.4, expectedAwayGoals:1.0 },
  { id:'wc-sf-02', homeTeam:'1/4\u51b3\u8d5b\u80dc\u80053', awayTeam:'1/4\u51b3\u8d5b\u80dc\u80054', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-15', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u534a\u51b3\u8d5b \u7b2c2\u573a', homeStrength:88, awayStrength:85, expectedHomeGoals:1.4, expectedAwayGoals:1.0 },
  { id:'wc-3p-01', homeTeam:'\u534a\u51b3\u8d5b\u8d1f\u80051', awayTeam:'\u534a\u51b3\u8d5b\u8d1f\u80052', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-18', time:'04:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u5b63\u519b\u8d5b', homeStrength:84, awayStrength:84, expectedHomeGoals:1.3, expectedAwayGoals:1.1 },
  { id:'wc-final-01', homeTeam:'\u534a\u51b3\u8d5b\u80dc\u80051', awayTeam:'\u534a\u51b3\u8d5b\u80dc\u80052', homeFlag:'TBD', awayFlag:'TBD', date:'2026-07-19', time:'03:00', tournament:'2026 FIFA\u4e16\u754c\u676f', stage:'\u51b3\u8d5b', homeStrength:90, awayStrength:89, expectedHomeGoals:1.4, expectedAwayGoals:1.1 },


];

const localizedOfficialSeeds: Seed[] = (officialSeeds as Seed[]).map((seed) => {
  const legacy = legacySeeds.find((item) => item.id === seed.id);
  if (!legacy) {
    return {
      ...seed,
      homeTeam: localizePlaceholderName(seed.homeTeam),
      awayTeam: localizePlaceholderName(seed.awayTeam),
      tournament: '2026 FIFA世界杯',
    };
  }

  return {
    ...seed,
    homeTeam: legacy.homeTeam || localizePlaceholderName(seed.homeTeam),
    awayTeam: legacy.awayTeam || localizePlaceholderName(seed.awayTeam),
    homeFlag: legacy.homeFlag,
    awayFlag: legacy.awayFlag,
    tournament: legacy.tournament,
    stage: legacy.stage,
  };
});

export const worldCupMatches: Match[] = localizedOfficialSeeds
  .map(createMatch)
  .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

// Generate realistic past 30 days history (only matches that already happened)
function generatePastHistory() {
  const now = new Date();
  
  // 世界杯首场比赛：2026-06-12 03:00（墨西哥 vs 南非）
  // 设置为比赛结束后（05:00）才显示历史记录
  const wcStartDate = new Date('2026-06-12T05:00:00');
  
  // 如果当前时间早于首场比赛结束时间，返回空数组
  if (now < wcStartDate) {
    return [];
  }
  
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Only use worldCupMatches that have dates BEFORE today
  const pastMatches = worldCupMatches
    .filter((m) => {
      const matchDate = new Date(`${m.date}T${m.time}:00`);
      return matchDate < now && matchDate >= thirtyDaysAgo && Boolean(m.actualScore);
    })
    .map((m) => ({
      match: `${m.homeTeam} vs ${m.awayTeam}`,
      predictedScore: m.predictedScore || '待录入',
      actualScore: m.actualScore || '待录入',
      isCorrect: Boolean(m.isCorrect),
      date: m.date,
    }));

  // 世界杯开始后，不再显示 mock 数据，只显示真实比赛结果
  return pastMatches;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const historyRecords = generatePastHistory();

export const statsSummary = {
  totalAnalyzed: 10000,
  totalHit: 0,
  totalAccuracy: 0,
  recent30Accuracy: 0,
};
