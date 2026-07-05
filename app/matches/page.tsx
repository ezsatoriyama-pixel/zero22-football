'use client';

import Link from 'next/link';
import { allWorldCupMatches } from '@/lib/worldCupSchedule';

export default function MatchesPage() {
  return (
    <div>
      <section className="text-center pt-28 pb-24 px-6">
        <div className="max-w-page mx-auto">
          <h1 className="text-[76px] font-bold text-text-primary tracking-tight leading-[0.95]">
            璧涗簨涓績
          </h1>
          <p className="mt-7 text-2xl text-text-secondary max-w-3xl mx-auto leading-snug">
            鎸夎禌绋嬮『搴忔祻瑙?2026 涓栫晫鏉畬鏁磋禌绋嬶紱灏忕粍璧涘凡褰曞叆鐞冮槦锛屾窐姹拌禌鍏堟寜鏅嬬骇甯綅灞曠ず锛屽悗缁細閫愬満鏇挎崲鎴愮湡瀹炲闃?
          </p>
        </div>
      </section>

      <section className="max-w-page mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 gap-6">
          {allWorldCupMatches.map((m) => (
            <Link key={m.id} href={`/matches/${m.id}`} className="bg-white rounded-card p-8 shadow-card card-hover block">
              <div className="flex items-center justify-between mb-8">
                <span className="text-base text-text-tertiary bg-bg px-4 py-2 rounded-full">
                  {m.tournament} 路 {m.stage}
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

