from pathlib import Path
p=Path(r'C:\Users\83668\.qwenpaw\workspaces\default\football-predict\lib\mockData.ts')
text=p.read_text(encoding='utf-8')
old = """  // 模型C：双模型融合。风险越高，越听风险模型；风险越低，越保留旧算法优势。\n  const disagreement = baseScore === riskScore ? 0 : 1;\n  const riskWeight = clamp(0.30 + upsetIndex / 140 + (volatility - 1) * 0.25 + disagreement * 0.06, 0.34, 0.68);\n  const baseWeight = 1 - riskWeight;\n  const finalH = clamp(baseH * baseWeight + riskH * riskWeight, 0.35, 2.75);\n  const finalA = clamp(baseA * baseWeight + riskA * riskWeight, 0.35, 2.55);\n  const finalScore = topScoreFromGoals(finalH, finalA);\n  const confidence = confidenceLabel(baseScore, riskScore, upsetIndex, volatility);\n\n  if (baseScore !== riskScore) notes.push(`基础模型 ${baseScore} 与风险模型 ${riskScore} 存在分歧，最终采用融合权重`);\n  else notes.push(`基础模型与风险模型共同指向 ${baseScore}`);\n"""
new = """  // 模型C：发布稳定融合。\n  // 重要：主推比分优先保留基础模型，避免算法升级后把已经公开展示过的预测全部改掉。\n  // 风险模型用于调低置信度、提示防冷比分、修正胜率和概率分布；只有极高风险且强烈分歧时才允许改主推。\n  const disagreement = baseScore === riskScore ? 0 : 1;\n  const extremeRisk = upsetIndex >= 62 && volatility >= 1.45 && disagreement === 1;\n  const riskWeight = extremeRisk\n    ? clamp(0.58 + (volatility - 1.4) * 0.2, 0.58, 0.70)\n    : clamp(0.18 + upsetIndex / 260 + (volatility - 1) * 0.12, 0.22, 0.42);\n  const baseWeight = 1 - riskWeight;\n  const finalH = clamp(baseH * baseWeight + riskH * riskWeight, 0.35, 2.75);\n  const finalA = clamp(baseA * baseWeight + riskA * riskWeight, 0.35, 2.55);\n  const blendedScore = topScoreFromGoals(finalH, finalA);\n  const finalScore = extremeRisk ? blendedScore : baseScore;\n  const confidence = confidenceLabel(baseScore, riskScore, upsetIndex, volatility);\n\n  if (baseScore !== riskScore) {\n    notes.push(`基础模型 ${baseScore} 与风险模型 ${riskScore} 存在分歧，主推保留基础模型，风险模型作为防冷参考`);\n  } else {\n    notes.push(`基础模型与风险模型共同指向 ${baseScore}`);\n  }\n"""
if old not in text:
    raise SystemExit('target block not found')
text=text.replace(old,new)
# Update summary wording to avoid saying final uses fusion if primary preserved
text=text.replace('基础模型比分：${model.baseScore}；风险修正比分：${model.riskScore}；融合最终最高概率比分：${model.finalScore}。置信度：${model.confidence}，风险评级：${model.riskLevel}。', '基础模型主推：${model.baseScore}；风险修正参考：${model.riskScore}；当前发布主推比分：${model.finalScore}。置信度：${model.confidence}，风险评级：${model.riskLevel}。')
text=text.replace('当前输出为融合后的最高概率比分。', '当前主推优先保持基础模型稳定性，风险模型用于防冷和置信度修正。')
p.write_text(text, encoding='utf-8')
print('stable fusion updated')
