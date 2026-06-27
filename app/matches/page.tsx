'use client';

import Link from 'next/link';
import { worldCupMatches } from '@/lib/mockData';

export default function MatchesPage() {
  return (
    <div>
      <section className="text-center pt-28 pb-24 px-6">
        <div className="max-w-page mx-auto">
          <h1 className="text-[76px] font-bold text-text-primary tracking-tight leading-[0.95]">
            赛事中心
          </h1>
          <p className="mt-7 text-2xl text-text-secondary max-w-3xl mx-auto leading-snug">
            按赛程顺序浏览 2026 世界杯完整赛程；小组赛已录入球队，淘汰赛先按晋级席位展示，后续会逐场替换成真实对阵
          </p>
        </div>
      </section>

      <section className="max-w-page mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 gap-6">
          {worldCupMatches.map((m) => (
            <Link key={m.id} href={`/matches/${m.id}`} className="bg-white rounded-card p-8 shadow-card card-hover block">
              <div className="flex items-center justify-between mb-8">
                <span className="text-base text-text-tertiary bg-bg px-4 py-2 rounded-full">
                  {m.tournament} · {m.stage}
                </span>
                <span className="text-base text-text-tertiary">{m.date} {m.time}</span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-text-primary mt-1">{m.homeTeam}</h3>
                </div>
                <div className="text-text-tertiary text-lg font-medium px-4">VS</div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-text-primary mt-1">{m.awayTeam}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
