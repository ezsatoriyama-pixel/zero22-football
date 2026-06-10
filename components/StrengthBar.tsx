'use client';

import { useEffect, useState } from 'react';

interface Props {
  home: number;
  away: number;
}

export default function StrengthBar({ home, away }: Props) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { setAnimate(true); }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span className="font-medium">实力指数</span>
        <span>{home} vs {away}</span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all duration-1000 ease-out"
          style={{ width: animate ? `${home}%` : '0%' }}
        />
      </div>
      <div className="flex justify-between text-xs text-text-tertiary">
        <span>主队</span>
        <span>客队</span>
      </div>
    </div>
  );
}
