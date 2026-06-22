'use client';

import { useEffect, useState } from 'react';

interface Score {
  score: string;
  probability: number;
}

interface Props {
  scores: Score[];
  isPro: boolean;
}

export default function ScoreProbability({ scores, isPro }: Props) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { setAnimate(true); }, []);

  const maxProb = Math.max(...scores.map((s) => s.probability));
  const previewScores = isPro ? scores : scores.slice(0, 3);

  return (
    <div className="space-y-4">
      {previewScores.map((s, i) => {
        const isLocked = !isPro;
        return (
          <div key={i} className="relative">
            {isLocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/92 backdrop-blur-xl">
                <span className="text-base font-bold text-pro-gold flex items-center gap-1">🔒 Pro 解锁具体比分</span>
              </div>
            )}
            <div className={`flex items-center gap-4 p-3 rounded-xl ${i === 0 ? 'bg-win-home/5' : i === 1 ? 'bg-win-draw/5' : 'bg-win-away/5'}`}>
              <span className="text-2xl font-bold text-text-primary w-20 text-center">{isPro ? s.score : '••:••'}</span>
              <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-1000 ease-out"
                  style={{ width: animate ? `${(s.probability / maxProb) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-base font-bold text-text-secondary w-16 text-right">{isPro ? `${s.probability}%` : i === 0 ? '高' : i === 1 ? '中' : '备选'}</span>
            </div>
          </div>
        );
      })}
      {!isPro && (
        <p className="text-xs text-text-tertiary px-1">
          免费版仅显示概率强弱区间，精确比分与完整概率排序需升级 Pro 查看。
        </p>
      )}
    </div>
  );
}
