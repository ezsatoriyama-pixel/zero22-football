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
      <section className="text-center pt-28 pb-24 px-6">
        <div className="max-w-page mx-auto">
          <h1 className="text-[76px] font-bold text-text-primary tracking-tight leading-[0.95]">
            Zero22 AI Football Lab
          </h1>
          <p className="mt-7 text-2xl text-text-secondary max-w-3xl mx-auto leading-snug">
            基于万场历史比赛的深度学习模型，探索足球比赛趋势与精准预测
          </p>
          <div className="mt-12 flex items-center justify-center gap-5">
            <Link href="/matches" className="bg-accent text-white text-lg font-bold px-10 py-4 rounded-full hover:bg-accent-hover transition-colors btn-press">
              浏览赛事
            </Link>
            <Link href="/history" className="bg-white text-text-primary text-lg font-bold px-10 py-4 rounded-full border border-border-light hover:bg-gray-50 transition-colors btn-press">
              历史战绩
            </Link>
          </div>
          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-4 gap-5 max-w-4xl mx-auto">
            {[
              { v: statsSummary.totalAnalyzed.toLocaleString(), l: 'AI训练场次' },
              { v: statsSummary.totalHit.toLocaleString(), l: '累计命中' },
              { v: statsSummary.totalAccuracy + '%', l: '总命中率' },
              { v: statsSummary.recent30Accuracy + '%', l: '近30天命中率' },
            ].map((s) => (
              <div key={s.l} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="text-3xl font-bold text-text-primary">{s.v}</div>
                <div className="text-base text-text-tertiary mt-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 今日焦点战 */}
      <section className="max-w-page mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-text-primary">今日焦点战</h2>
          <Link href="/matches" className="text-base text-accent hover:text-accent-hover font-bold transition-colors">
            查看全部 →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {featuredMatches.map((m) => (
            <Link key={m.id} href={`/matches/${m.id}`} className="bg-white rounded-card p-8 shadow-card card-hover block">
              <div className="flex items-center justify-between mb-8">
                <span className="text-base text-text-tertiary bg-bg px-4 py-2 rounded-full">
                  {m.tournament} · {m.stage}
                </span>
                <span className="text-base text-text-tertiary">{m.date} {m.time}</span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 mb-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-text-primary mt-1">{m.homeTeam}</h3>
                </div>
                <div className="text-text-tertiary text-lg font-medium px-4">VS</div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-text-primary mt-1">{m.awayTeam}</h3>
                </div>
              </div>

              <div className="mb-8">
                <StrengthBar home={m.homeStrength} away={m.awayStrength} />
              </div>

              <div>
                <p className="text-base text-text-tertiary mb-3 font-bold">比分概率</p>
                <ScoreProbability scores={m.topScores} isPro={isPro} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}