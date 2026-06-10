'use client';

import { useEffect, useState } from 'react';

interface Props {
  home: number;
  draw: number;
  away: number;
}

const colors = ['bg-win-home', 'bg-win-draw', 'bg-win-away'];
const labels = ['主胜', '平局', '客胜'];

export default function WinRateBar({ home, draw, away }: Props) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { setAnimate(true); }, []);

  const values = [home, draw, away];

  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">{labels[i]}</span>
            <span className="font-semibold text-text-primary">{v}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${colors[i]} transition-all duration-1000 ease-out`}
              style={{ width: animate ? `${v}%` : '0%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
