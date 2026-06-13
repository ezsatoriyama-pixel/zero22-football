from pathlib import Path
p=Path(r'C:\Users\83668\.qwenpaw\workspaces\default\football-predict\app\history\page.tsx')
p.write_text(r'''import Link from 'next/link';
import { historyRecords } from '@/lib/mockData';

export default function HistoryPage() {
  const total = historyRecords.length;
  const correct = historyRecords.filter((m) => m.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div>
      <section className="text-center pt-28 pb-20 px-6">
        <div className="max-w-page mx-auto">
          <h1 className="text-[76px] font-bold text-text-primary tracking-tight leading-[0.95]">
            历史战绩
          </h1>
          <p className="mt-7 text-2xl text-text-secondary max-w-3xl mx-auto leading-snug">
            只记录已完赛并录入真实比分的比赛，不用模拟比分冒充战绩
          </p>
        </div>
      </section>

      <section className="max-w-page mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="text-3xl font-bold text-text-primary">{total}</div>
            <div className="text-base text-text-tertiary mt-2">已录入赛果</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="text-3xl font-bold text-text-primary">{correct}</div>
            <div className="text-base text-text-tertiary mt-2">比分命中</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="text-3xl font-bold text-text-primary">{total > 0 ? `${accuracy}%` : '待更新'}</div>
            <div className="text-base text-text-tertiary mt-2">命中率</div>
          </div>
        </div>

        <div className="bg-white rounded-card p-6 shadow-card">
          {historyRecords.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">⚽</div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                暂无已确认历史战绩
              </h3>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                这里不会再显示假的“中 / 不中”。只有比赛结束、实际比分被录入后，才会生成历史战绩和命中率。
              </p>
              <p className="text-base text-text-tertiary mt-4">
                首场比赛：墨西哥 vs 南非<br />
                时间：2026-06-12 03:00<br />
                赛果录入后本页会自动展示预测比分、实际比分和判定
              </p>
              <div className="mt-8">
                <Link href="/matches" className="bg-accent text-white text-base font-bold px-6 py-3 rounded-full hover:bg-accent-hover transition-colors">
                  查看赛程
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[720px]">
                <thead>
                  <tr className="text-base text-text-tertiary border-b border-border-light">
                    <th className="p-4">比赛</th>
                    <th className="p-4">预测比分</th>
                    <th className="p-4">实际比分</th>
                    <th className="p-4">判定</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.map((m, i) => (
                    <tr key={i} className="text-base text-text-primary border-b border-border-light hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-semibold">{m.match}</div>
                        <div className="text-sm text-text-tertiary mt-1">{m.date}</div>
                      </td>
                      <td className="p-4 font-semibold">{m.predictedScore}</td>
                      <td className="p-4 font-semibold">{m.actualScore}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${m.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {m.isCorrect ? '命中' : '未中'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-sm text-text-tertiary mt-5 leading-relaxed">
          说明：GitHub Pages 为静态网站，无法自动抓取官方实时赛果。历史战绩需要在赛后录入真实比分后发布；未录入真实比分的比赛不会计入命中率。
        </p>
      </section>
    </div>
  );
}
''', encoding='utf-8')
print('history rewritten')
