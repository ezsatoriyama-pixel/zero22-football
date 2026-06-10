'use client';

import { statsSummary, historyRecords } from '@/lib/mockData';
import { useState } from 'react';

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(historyRecords.length / PAGE_SIZE);
  const paginated = historyRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-page mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-16 md:pb-20">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">历史战绩</h1>
        <p className="text-text-secondary text-sm mt-2">
          Zero22 AI Football Lab · 基于 {statsSummary.totalAnalyzed.toLocaleString()} 场比赛训练的预测模型
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-8 md:mb-10">
        {[
          { v: statsSummary.totalAnalyzed.toLocaleString(), l: '累计分析场次' },
          { v: statsSummary.totalHit.toLocaleString(), l: '累计命中场次' },
          { v: statsSummary.totalAccuracy + '%', l: '总命中率' },
          { v: statsSummary.recent30Accuracy + '%', l: '近30天命中率' },
          { v: statsSummary.recent100Accuracy + '%', l: '最近100场命中率' },
        ].map((s) => (
          <div key={s.l} className="bg-white rounded-xl p-3 md:p-4 shadow-card text-center">
            <div className="text-lg md:text-2xl font-bold text-text-primary">{s.v}</div>
            <div className="text-[10px] md:text-xs text-text-tertiary mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-xs md:text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-3 md:px-6 py-3 md:py-4 text-text-tertiary font-medium">日期</th>
                <th className="text-left px-3 md:px-6 py-3 md:py-4 text-text-tertiary font-medium">比赛</th>
                <th className="text-center px-3 md:px-6 py-3 md:py-4 text-text-tertiary font-medium">预测</th>
                <th className="text-center px-3 md:px-6 py-3 md:py-4 text-text-tertiary font-medium">实际</th>
                <th className="text-center px-3 md:px-6 py-3 md:py-4 text-text-tertiary font-medium">结果</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, i) => (
                <tr key={i} className="border-b border-border-light last:border-0 hover:bg-bg/50 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4 text-text-secondary whitespace-nowrap">{r.date}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-text-primary">{r.match}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center font-mono text-text-secondary">
                    {r.predictedScore}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center font-mono text-text-primary font-semibold">
                    {r.actualScore}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        r.isCorrect
                          ? 'bg-win-home/10 text-win-home'
                          : 'bg-win-away/10 text-win-away'
                      }`}
                    >
                      {r.isCorrect ? '命中 ✓' : '未中 ✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
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
                n === page ? 'bg-text-primary text-white' : 'text-text-secondary hover:bg-gray-100'
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
