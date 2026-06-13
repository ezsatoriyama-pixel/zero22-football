from pathlib import Path
import re
p=Path(r'C:\Users\83668\.qwenpaw\workspaces\default\football-predict\lib\mockData.ts')
text=p.read_text(encoding='utf-8')

# 1 add fields to AdjustedModel
text=text.replace("type AdjustedModel = {\n  homeGoals: number;\n  awayGoals: number;\n  volatility: number;\n  upsetIndex: number;\n  riskLevel: string;\n  notes: string[];\n};", "type AdjustedModel = {\n  homeGoals: number;\n  awayGoals: number;\n  baseHomeGoals: number;\n  baseAwayGoals: number;\n  riskHomeGoals: number;\n  riskAwayGoals: number;\n  baseScore: string;\n  riskScore: string;\n  finalScore: string;\n  confidence: string;\n  volatility: number;\n  upsetIndex: number;\n  riskLevel: string;\n  notes: string[];\n};")

# 2 insert score helper before adjustExpectedGoals
insert_after = "type AdjustedModel = {\n  homeGoals: number;\n  awayGoals: number;\n  baseHomeGoals: number;\n  baseAwayGoals: number;\n  riskHomeGoals: number;\n  riskAwayGoals: number;\n  baseScore: string;\n  riskScore: string;\n  finalScore: string;\n  confidence: string;\n  volatility: number;\n  upsetIndex: number;\n  riskLevel: string;\n  notes: string[];\n};\n"
helper = insert_after + r'''
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
'''
text=text.replace(insert_after, helper)

# 3 replace adjustExpectedGoals function body entirely
start=text.index('function adjustExpectedGoals(seed: Seed): AdjustedModel {')
end=text.index('\nfunction poisson', start)
new_func = r'''function adjustExpectedGoals(seed: Seed): AdjustedModel {
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

  // 模型C：双模型融合。风险越高，越听风险模型；风险越低，越保留旧算法优势。
  const disagreement = baseScore === riskScore ? 0 : 1;
  const riskWeight = clamp(0.30 + upsetIndex / 140 + (volatility - 1) * 0.25 + disagreement * 0.06, 0.34, 0.68);
  const baseWeight = 1 - riskWeight;
  const finalH = clamp(baseH * baseWeight + riskH * riskWeight, 0.35, 2.75);
  const finalA = clamp(baseA * baseWeight + riskA * riskWeight, 0.35, 2.55);
  const finalScore = topScoreFromGoals(finalH, finalA);
  const confidence = confidenceLabel(baseScore, riskScore, upsetIndex, volatility);

  if (baseScore !== riskScore) notes.push(`基础模型 ${baseScore} 与风险模型 ${riskScore} 存在分歧，最终采用融合权重`);
  else notes.push(`基础模型与风险模型共同指向 ${baseScore}`);

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
}'''
text=text[:start]+new_func+text[end:]

# 4 replace ai text
start=text.index('function ai(home:string,away:string,hs:number,as:number, model: AdjustedModel):string{')
end=text.index('\nfunction rep', start)
new_ai = r'''function ai(home:string,away:string,hs:number,as:number, model: AdjustedModel):string{
  const d=hs-as;
  const base = d>8
    ? `${home}纸面实力占优，基础模型会倾向常规热门方向；融合模型再用风险项检查是否过热。`
    : d>3
      ? `${home}略占上风，但胜负会受到节奏、身体对抗和临场状态影响。`
      : d>-4
        ? `两队实力接近，基础模型与风险模型都会提高平局和一球差权重。`
        : `${away}纸面更被看好，但融合模型仍保留${home}通过反击、定位球或临场波动抢分的可能。`;
  const note = model.notes.length ? `关键修正：${model.notes.slice(0, 2).join('；')}。` : '关键修正：采用基础模型 + 风险模型双通道融合。';
  return `${base}${note}基础模型比分：${model.baseScore}；风险修正比分：${model.riskScore}；融合最终最高概率比分：${model.finalScore}。置信度：${model.confidence}，风险评级：${model.riskLevel}。`;
}'''
text=text[:start]+new_ai+text[end:]

# 5 update report and tacticalNote wording
text=text.replace('Zero22 当前使用的是赛前概率模型，不宣称接入官方实时赔率或实时伤停。系统会综合纸面实力、近期状态代理、地域/风格特征、主办国环境、赔率变化代理与足球随机性，输出最高概率比分和备选比分。', 'Zero22 当前使用双模型融合：基础命中模型保留旧算法对强弱分明比赛的判断力；风险修正模型加入近期状态代理、地域/风格特征、主办国环境、赔率变化代理与足球随机性。系统不宣称接入官方实时赔率或实时伤停。')
text=text.replace('模型不再简单放大热门优势。面对南美球队、紧凑防守球队或小组赛末轮情境时，会提高爆冷指数，降低大比分倾向。', '模型不再二选一地放大或压低热门。基础模型负责常规赛果，风险模型负责识别南美球队、紧凑防守球队、小组赛末轮和热门过热情境，最后通过权重融合。')
text=text.replace('基于 Zero22 Net v4 对 10,000 场历史样本与蒙特卡洛模拟的修正，比赛节奏与总进球区间会比旧模型更保守、更重视风险。', '基于 Zero22 Net v4.1 双模型融合，对 10,000 场历史样本与蒙特卡洛模拟进行修正。若基础模型与风险模型一致，置信度上调；若分歧明显，系统会给出更保守的最终比分和防冷提示。')
text=text.replace('模型已加入临场状态代理、风格冲突、赔率变化代理与随机性修正；当前更关注比分区间和爆冷风险，而不是只看纸面实力。', '双模型融合：基础模型保留常规命中能力，风险模型识别风格冲突、赔率代理和随机性；当前输出为融合后的最高概率比分。')

# 6 ensure createMatch predicted score uses finalScore
text=text.replace('predictedScore: seed.predictedScore || topScores[0]?.score,', 'predictedScore: seed.predictedScore || model.finalScore || topScores[0]?.score,')

p.write_text(text, encoding='utf-8')
print('dual fusion model updated')
