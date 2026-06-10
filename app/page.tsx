'use client';

import Link from 'next/link';
import { worldCupMatches, statsSummary } from '@/lib/mockData';
import { useAuth } from '@/lib/auth';
import StrengthBar from '@/components/StrengthBar';
import ScoreProbability from '@/components/ScoreProbability';

export default function HomePage() {
  const { isPro } = useAuth();
  const featuredMatches = worldCupMatches.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-page mx-auto">
          <h1 className="text-3xl md:text-6xl font-bold text-text-primary tracking-tight leading-tight">
            Zero22 AI<br className="md:hidden" /> Football Lab
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed px-2">
            基于万场历史比赛的深度学习模型，探索足球比赛趋势与精准预测
          </p>
          <div className="mt-6 md:mt-8 flex items-center justify-center gap-3 md:gap-4">
            <Link
              href="/matches"
              className="bg-accent text-white text-sm md:text-base font-medium px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-accent-hover transition-colors btn-press"
            >
              浏览赛事
            </Link>
            <Link
              href="/history"
              className="bg-white text-text-primary text-sm md:text-base font-medium px-6 md:px-8 py-2.5 md:py-3 rounded-full border border-border-light hover:bg-gray-50 transition-colors btn-press"
            >
              历史战绩
            </Link>
          </div>
          {/* Stats strip */}
          <div className="mt-10 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 max-w-2xl mx-auto">
            {[
              { v: statsSummary.totalAnalyzed.toLocaleString(), l: 'AI训练场次' },
              { v: statsSummary.totalHit.toLocaleString(), l: '累计命中' },
              { v: statsSummary.totalAccuracy + '%', l: '总命中率' },
              { v: statsSummary.recent30Accuracy + '%', l: '近30天命中率' },
            ].map((s) => (
              <div key={s.l} className="bg-white rounded-xl p-3 md:p-4 shadow-card">
                <div className="text-lg md:text-2xl font-bold text-text-primary">{s.v}</div>
                <div className="text-[10px] md:text-xs text-text-tertiary mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 今日焦点战 */}
      <section className="max-w-page mx-auto px-4 md:px-6 pb-12 md:pb-20">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary">今日焦点战</h2>
          <Link
            href="/matches"
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            查看全部 →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {featuredMatches.map((m) => (
            <Link
              key={m.id}
              href={`/matches/${m.id}`}
              className="bg-white rounded-card p-4 md:p-6 shadow-card card-hover block"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="text-[10px] md:text-xs text-text-tertiary bg-bg px-2 md:px-3 py-1 rounded-full">
                  {m.tournament} · {m.stage}
                </span>
                <span className="text-[10px] md:text-xs text-text-tertiary">
                  {m.date} {m.time}
                </span>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <div className="text-center flex-1">
                  <span className="text-2xl md:text-3xl">{m.homeFlag}</span>
                  <h3 className="text-sm md:text-base font-semibold text-text-primary mt-1">
                    {m.homeTeam}
                  </h3>
                </div>
                <div className="text-text-tertiary text-xs md:text-sm font-medium px-2 md:px-4">VS</div>
                <div className="text-center flex-1">
                  <span className="text-2xl md:text-3xl">{m.awayFlag}</span>
                  <h3 className="text-sm md:text-base font-semibold text-text-primary mt-1">
                    {m.awayTeam}
                  </h3>
                </div>
              </div>

              {/* Strength */}
              <div className="mb-4">
                <StrengthBar home={m.homeStrength} away={m.awayStrength} />
              </div>

              {/* Score probability */}
              <div>
                <p className="text-xs text-text-tertiary mb-2 font-medium">比分概率</p>
                <ScoreProbability scores={m.topScores} isPro={isPro} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
