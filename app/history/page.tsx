'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { worldCupMatches } from '@/lib/worldCupSchedule';
import { buildHistoryRecords, loadResultSnapshot, percentage, type HistoryStatRecord, type ResultSource } from '@/lib/results';

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryStatRecord[]>([]);
  const [source, setSource] = useState<ResultSource>('static');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadResultSnapshot().then((snapshot) => {
      if (!mounted) return;
      setRecords(buildHistoryRecords(worldCupMatches, snapshot.results));
      setSource(snapshot.source);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const total = records.length;
  const exact = records.filter((m) => m.isExact).length;
  const top5 = records.filter((m) => m.isTop5).length;
  const outcome = records.filter((m) => m.isOutcomeCorrect).length;

  return (
    <div>
      <section className="text-center pt-28 pb-20 px-6">
        <div className="max-w-page mx-auto">
          <h1 className="text-[76px] font-bold text-text-primary tracking-tight leading-[0.95]">
            历史战绩
          </h1>
          <p className="mt-7 text-2xl text-text-secondary max-w-3xl mx-auto leading-snug">
            这里只统计已经结束且已录入真实比分的比赛，不再提前显示假赛果或错误命中状态。
          </p>
        </div>
      </section>

      <section className="max-w-page mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="text-3xl font-bold text-text-primary">{total}</div>
            <div className="text-base text-text-tertiary mt-2">已录入赛果</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="text-3xl font-bold text-text-primary">{percentage(exact, total)}</div>
            <div className="text-base text-text-tertiary mt-2">主推比分命中</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="text-3xl font-bold text-text-primary">{percentage(top5, total)}</div>
            <div className="text-base text-text-tertiary mt-2">TOP5 覆盖</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="text-3xl font-bold text-text-primary">{percentage(outcome, total)}</div>
            <div className="text-base text-text-tertiary mt-2">胜平负方向</div>
          </div>
        </div>

        <div className="bg-white rounded-card p-6 shadow-card">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-2xl font-bold text-text-primary mb-3">正在读取赛果...</div>
              <p className="text-lg text-text-secondary">稍等一下，正在同步最新录入结果。</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-text-primary mb-3">暂无已确认历史战绩</h3>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                录入真实比分后，这里会自动计算主推比分、TOP5 和胜平负方向命中率。
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/matches" className="bg-accent text-white text-base font-bold px-6 py-3 rounded-full hover:bg-accent-hover transition-colors">
                  查看赛程
                </Link>
                <Link href="/admin" className="bg-white text-text-primary text-base font-bold px-6 py-3 rounded-full border border-border-light hover:bg-gray-50 transition-colors">
                  录入赛果
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[860px]">
                <thead>
                  <tr className="text-base text-text-tertiary border-b border-border-light">
                    <th className="p-4">比赛</th>
                    <th className="p-4">主推比分</th>
                    <th className="p-4">实际比分</th>
                    <th className="p-4">精确命中</th>
                    <th className="p-4">TOP5</th>
                    <th className="p-4">胜平负</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((m) => (
                    <tr key={m.matchId} className="text-base text-text-primary border-b border-border-light hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-semibold">{m.match}</div>
                        <div className="text-sm text-text-tertiary mt-1">{m.date} · {m.stage}</div>
                      </td>
                      <td className="p-4 font-semibold">{m.predictedScore}</td>
                      <td className="p-4 font-semibold">{m.actualScore}</td>
                      <td className="p-4"><Badge ok={m.isExact} /></td>
                      <td className="p-4"><Badge ok={m.isTop5} /></td>
                      <td className="p-4"><Badge ok={m.isOutcomeCorrect} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-sm text-text-tertiary mt-5 leading-relaxed">
          当前赛果来源：{sourceLabel(source)}。静态部署下默认读取固化赛果文件；如果后续接入共享 API，则优先读取共享结果。
        </p>
      </section>
    </div>
  );
}

function sourceLabel(source: ResultSource) {
  if (source === 'remote') return '共享 API';
  return '每日自动赛果';
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold ${ok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
      {ok ? '命中' : '未中'}
    </span>
  );
}
