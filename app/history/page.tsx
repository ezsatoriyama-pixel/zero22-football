'use client';

import Link from 'next/link';
import { historyRecords } from '@/lib/mockData';

export default function HistoryPage() {
  return (
    <div>
      <section className="text-center pt-28 pb-24 px-6">
        <div className="max-w-page mx-auto">
          <h1 className="text-[76px] font-bold text-text-primary tracking-tight leading-[0.95]">
            历史战绩
          </h1>
          <p className="mt-7 text-2xl text-text-secondary max-w-3xl mx-auto leading-snug">
            回顾过去 30 天的 AI 预测战绩
          </p>
        </div>
      </section>

      <section className="max-w-page mx-auto px-6 pb-24">
        <div className="bg-white rounded-card p-6 shadow-card">
          <table className="w-full text-left">
            <thead>
              <tr className="text-base text-text-tertiary border-b border-border-light">
                <th className="p-4">比赛</th>
                <th className="p-4">预测</th>
                <th className="p-4">结果</th>
                <th className="p-4">判定</th>
              </tr>
            </thead>
            <tbody>
              {historyRecords.map((m, i) => (
                <tr key={i} className="text-base text-text-primary border-b border-border-light hover:bg-gray-50">
                  <td className="p-4">
                    <div>{m.match}</div>
                    <div className="text-sm text-text-tertiary mt-1">{m.date}</div>
                  </td>
                  <td className="p-4">{m.predictedScore}</td>
                  <td className="p-4">{m.actualScore}</td>
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
      </section>
    </div>
  );
}