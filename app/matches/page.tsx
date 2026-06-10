'use client';

import { useState } from 'react';
import Link from 'next/link';
import { worldCupMatches } from '@/lib/mockData';
import { useAuth } from '@/lib/auth';
import WinRateBar from '@/components/WinRateBar';
import ScoreProbability from '@/components/ScoreProbability';

const PAGE_SIZE = 6;

export default function MatchesPage() {
  const { isPro } = useAuth();
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(worldCupMatches.length / PAGE_SIZE);
  const paginated = worldCupMatches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-page mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-16 md:pb-20">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">赛事中心</h1>
        <p className="text-text-secondary text-sm mt-2">2026 FIFA 世界杯 + 国际友谊赛 · 全部比赛预测</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3 md:gap-4">
        {paginated.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-card p-4 md:p-6 shadow-card card-hover animate-fade-in"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <span className="text-[10px] md:text-xs text-text-tertiary bg-bg px-2 md:px-3 py-1 rounded-full">
                {m.stage}
              </span>
              <span className="text-[10px] md:text-xs text-text-tertiary">
                {m.date} {m.time}
              </span>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <div className="text-center flex-1">
                <span className="text-2xl md:text-3xl">{m.homeFlag}</span>
                <h3 className="text-sm md:text-base font-semibold text-text-primary mt-1">{m.homeTeam}</h3>
              </div>
              <div className="text-text-tertiary text-xs md:text-sm font-medium px-2 md:px-4">VS</div>
              <div className="text-center flex-1">
                <span className="text-2xl md:text-3xl">{m.awayFlag}</span>
                <h3 className="text-sm md:text-base font-semibold text-text-primary mt-1">{m.awayTeam}</h3>
              </div>
            </div>

            {/* AI 胜率 */}
            <div className="mb-4">
              <p className="text-xs text-text-tertiary mb-2 font-medium">AI 胜率预测</p>
              <WinRateBar home={m.winRate.home} draw={m.winRate.draw} away={m.winRate.away} />
            </div>

            {/* 推荐比分 */}
            <div className="mb-4">
              <p className="text-xs text-text-tertiary mb-2 font-medium">推荐比分 TOP3</p>
              <ScoreProbability scores={m.topScores} isPro={isPro} />
            </div>

            {/* CTA */}
            <Link
              href={`/matches/${m.id}`}
              className="block text-center text-sm text-accent font-medium hover:text-accent-hover transition-colors mt-2 pt-3 border-t border-border-light"
            >
              查看完整分析 →
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-full text-sm font-medium border border-border-light disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            上一页
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                n === page
                  ? 'bg-text-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-full text-sm font-medium border border-border-light disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
