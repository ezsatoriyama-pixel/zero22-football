'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { allWorldCupMatches } from '@/lib/worldCupSchedule';
import { useAuth } from '@/lib/auth';
import WinRateBar from '@/components/WinRateBar';
import ScoreProbability from '@/components/ScoreProbability';
import ScoreMatrix from '@/components/ScoreMatrix';
import GoalProbability from '@/components/GoalProbability';
import DeepTacticalReport from '@/components/DeepTacticalReport';
import ProModal from '@/components/ProModal';

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const { isPro, isLoggedIn } = useAuth();
  const [showProModal, setShowProModal] = useState(false);

  const match = allWorldCupMatches.find((m) => m.id === params.id);
  if (!match) notFound();

  const { deepAnalysis } = match;
  const summaryText = isPro
    ? match.aiSummary
    : '免费版展示核心结论、风险等级和简版战术摘要，完整分析可升级 Pro 查看。';

  const handleUnlock = () => {
    if (!isLoggedIn || !isPro) {
      setShowProModal(true);
    }
  };

  return (
    <div className="max-w-page mx-auto px-6 pt-10 pb-20">
      <div className="bg-white rounded-card p-8 shadow-card mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs text-text-tertiary bg-bg px-3 py-1 rounded-full">{match.tournament}</span>
          <span className="text-xs text-text-tertiary bg-bg px-3 py-1 rounded-full">{match.stage}</span>
        </div>
        <div className="flex items-center justify-center gap-12">
          <div className="text-center">
            <span className="text-5xl">{match.homeFlag}</span>
            <h2 className="text-xl font-bold text-text-primary mt-2">{match.homeTeam}</h2>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold text-text-tertiary">VS</span>
            <p className="text-sm text-text-tertiary mt-1">{match.date} {match.time}</p>
          </div>
          <div className="text-center">
            <span className="text-5xl">{match.awayFlag}</span>
            <h2 className="text-xl font-bold text-text-primary mt-2">{match.awayTeam}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-bold text-text-primary mb-4">AI 胜率预测</h3>
          <p className="text-xs text-text-tertiary mb-3">基于 Zero22 Net v4.1 双模型融合的赛前概率分布。</p>
          <WinRateBar home={match.winRate.home} draw={match.winRate.draw} away={match.winRate.away} />
        </section>

        <section className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-bold text-text-primary mb-2">推荐比分 TOP5</h3>
          <p className="text-xs text-text-tertiary mb-4">免费版只展示概率最高的两个比分，Pro 可查看完整矩阵。</p>
          <ScoreProbability scores={match.topScores} isPro={isPro} />
          {!isPro && (
            <button onClick={() => setShowProModal(true)} className="mt-3 text-sm text-pro-gold font-medium hover:underline flex items-center gap-1">
              升级 Pro 查看完整比分矩阵
            </button>
          )}
        </section>

        <section className="bg-white rounded-card p-6 shadow-card">
          <h3 className="text-lg font-bold text-text-primary mb-4">AI 分析摘要</h3>
          <p className="text-text-secondary leading-relaxed text-sm">{summaryText}</p>
        </section>

        <section className="bg-white rounded-card p-6 shadow-card relative overflow-hidden">
          <h3 className="text-lg font-bold text-text-primary mb-4">深度数据概览</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-tertiary font-medium mb-2">控球率预估</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary w-16">{match.homeTeam}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${deepAnalysis.possession.home}%` }} />
                </div>
                <span className="text-sm font-semibold">{deepAnalysis.possession.home}%</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-text-secondary w-16">{match.awayTeam}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-text-tertiary rounded-full" style={{ width: `${deepAnalysis.possession.away}%` }} />
                </div>
                <span className="text-sm font-semibold">{deepAnalysis.possession.away}%</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-text-tertiary font-medium mb-2">射门预测</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg rounded-xl p-3">
                  <div className="text-xs text-text-tertiary">{match.homeTeam}</div>
                  <div className="text-lg font-bold text-text-primary">{deepAnalysis.shots.home}</div>
                  <div className="text-xs text-text-tertiary">射正 {deepAnalysis.shotsOnTarget.home}</div>
                </div>
                <div className="bg-bg rounded-xl p-3">
                  <div className="text-xs text-text-tertiary">{match.awayTeam}</div>
                  <div className="text-lg font-bold text-text-primary">{deepAnalysis.shots.away}</div>
                  <div className="text-xs text-text-tertiary">射正 {deepAnalysis.shotsOnTarget.away}</div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-text-tertiary font-medium mb-1">战术分析</p>
              <p className="text-sm text-text-secondary leading-relaxed">{deepAnalysis.tacticalNote}</p>
            </div>

            <div>
              <p className="text-xs text-text-tertiary font-medium mb-1">关键球员</p>
              <p className="text-sm text-text-secondary">{deepAnalysis.keyPlayer}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg rounded-xl p-3">
                <div className="text-xs text-text-tertiary mb-1">爆冷指数</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${deepAnalysis.upsetIndex > 30 ? 'bg-win-away' : 'bg-win-draw'}`}
                      style={{ width: `${deepAnalysis.upsetIndex}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-text-primary">{deepAnalysis.upsetIndex}</span>
                </div>
              </div>
              <div className="bg-bg rounded-xl p-3">
                <div className="text-xs text-text-tertiary mb-1">风险等级</div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-win-draw/10 text-win-draw">
                  {deepAnalysis.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 bg-white rounded-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">完整比分概率矩阵</h3>
          {!isPro && <span className="text-xs font-semibold text-pro-gold bg-pro-bg px-3 py-1 rounded-full">PRO</span>}
        </div>
        <p className="text-xs text-text-tertiary mb-4">完整比分分布仅对 Pro 会员开放。</p>
        {isPro ? (
          <ScoreMatrix matrix={match.scoreMatrix} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
        ) : (
          <div className="relative">
            <div className="blur-mask">
              <ScoreMatrix matrix={match.scoreMatrix} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={handleUnlock} className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg text-sm font-semibold text-accent hover:bg-white transition-colors btn-press">
                升级 Pro 解锁完整矩阵
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 bg-white rounded-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">双方进球概率分布</h3>
          {!isPro && <span className="text-xs font-semibold text-pro-gold bg-pro-bg px-3 py-1 rounded-full">PRO</span>}
        </div>
        <p className="text-xs text-text-tertiary mb-4">展示双方各自进球数的独立概率估计。</p>
        {isPro ? (
          <GoalProbability homeProb={match.homeGoalProb} awayProb={match.awayGoalProb} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
        ) : (
          <div className="relative">
            <div className="blur-mask">
              <GoalProbability homeProb={match.homeGoalProb} awayProb={match.awayGoalProb} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={handleUnlock} className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg text-sm font-semibold text-accent hover:bg-white transition-colors btn-press">
                升级 Pro 解锁进球概率
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 bg-white rounded-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">深度战术推演报告</h3>
          {!isPro && <span className="text-xs font-semibold text-pro-gold bg-pro-bg px-3 py-1 rounded-full">PRO</span>}
        </div>
        <p className="text-xs text-text-tertiary mb-4">完整战术报告仅对 Pro 开放。</p>
        <DeepTacticalReport report={match.deepTacticalReport} isPro={isPro} onUnlock={handleUnlock} />
      </section>

      {!isPro && (
        <div className="mt-8 bg-white rounded-card p-8 shadow-card text-center">
          <h3 className="text-xl font-bold text-text-primary mb-2">升级 Zero22 Pro，解锁全部 AI 分析</h3>
          <p className="text-text-secondary text-sm mb-4 max-w-md mx-auto">
            解锁完整比分矩阵、双方进球概率分布和深度战术报告。
          </p>
          <button onClick={() => setShowProModal(true)} className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-8 py-3 rounded-full hover:bg-accent-hover transition-colors btn-press">
            立即升级 Pro
          </button>
        </div>
      )}

      <ProModal open={showProModal} onClose={() => setShowProModal(false)} />
    </div>
  );
}
