'use client';

interface Props {
  matrix: number[][];
  homeTeam: string;
  awayTeam: string;
}

const heatColors = [
  'bg-blue-50', 'bg-blue-100', 'bg-blue-200',
  'bg-blue-300', 'bg-blue-400', 'bg-blue-500',
];

export default function ScoreMatrix({ matrix, homeTeam, awayTeam }: Props) {
  const maxVal = Math.max(...matrix.flat());

  const getIntensity = (v: number) => {
    const ratio = maxVal > 0 ? v / maxVal : 0;
    const idx = Math.min(Math.floor(ratio * 5), 5);
    return heatColors[idx];
  };

  return (
    <div>
      <p className="text-xs text-text-tertiary text-center mb-2">
        {awayTeam} 进球数 →
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs">
          <thead>
            <tr>
              <th className="p-1 text-text-tertiary font-normal"></th>
              {[0, 1, 2, 3, 4].map((j) => (
                <th key={j} className="p-1 text-text-tertiary font-normal">{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="p-1 text-text-tertiary font-normal">{i}</td>
                {row.map((val, j) => (
                  <td
                    key={j}
                    className={`p-2 rounded-md font-mono font-medium text-text-primary ${getIntensity(val)}`}
                    style={{ minWidth: '48px' }}
                  >
                    {val}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-text-tertiary text-center mt-2">
        ← {homeTeam} 进球数
      </p>
    </div>
  );
}
