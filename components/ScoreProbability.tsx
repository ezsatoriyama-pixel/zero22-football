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

  return (
    <div className="space-y-4">
      {scores.map((s, i) => {
        const isLocked = i >= 2 && !isPro;
        return (
          <div key={i} className="relative">
            {isLocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-xl">
                <span className="text-base font-bold text-pro-gold flex items-center gap-1">🔒 Pro 解锁</span>
              </div>
            )}
            <div className={`flex items-center gap-4 p-3 rounded-xl ${i === 0 ? 'bg-win-home/5' : i === 1 ? 'bg-win-draw/5' : 'bg-win-away/5'}`}>
              <span className="text-2xl font-bold text-text-primary w-20 text-center">{s.score}</span>
              <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-1000 ease-out"
                  style={{ width: animate ? `${(s.probability / maxProb) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-base font-bold text-text-secondary w-16 text-right">{s.probability}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}