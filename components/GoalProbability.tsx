'use client';

import { useEffect, useState } from 'react';

interface GoalProb {
  goals: string;
  probability: number;
}

interface Props {
  homeProb: GoalProb[];
  awayProb: GoalProb[];
  homeTeam: string;
  awayTeam: string;
}

export default function GoalProbability({ homeProb, awayProb, homeTeam, awayTeam }: Props) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { setAnimate(true); }, []);

  const maxP = Math.max(
    ...homeProb.map((g) => g.probability),
    ...awayProb.map((g) => g.probability)
  );

  const renderBars = (data: GoalProb[], label: string, color: string) => (
    <div className="space-y-1.5">
      <p className="text-xs text-text-tertiary font-medium">{label}</p>
      {data.map((g, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-text-secondary w-8 text-right">{g.goals}</span>
          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
            <div
              className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: animate ? `${(g.probability / maxP) * 100}%` : '0%' }}
            />
            <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-text-primary">
              {g.probability}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6">
      {renderBars(homeProb, `${homeTeam} 进球概率`, 'bg-win-home/40')}
      {renderBars(awayProb, `${awayTeam} 进球概率`, 'bg-win-away/40')}
    </div>
  );
}
