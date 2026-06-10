'use client';

interface Props {
  report: string;
  isPro: boolean;
  onUnlock: () => void;
}

export default function DeepTacticalReport({ report, isPro, onUnlock }: Props) {
  if (!isPro) {
    return (
      <div className="relative">
        <div className="blur-mask">
          <div className="text-sm text-text-secondary leading-relaxed space-y-3 max-h-48 overflow-hidden">
            {report.split('\n').slice(0, 8).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <p className="text-text-tertiary">...</p>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary mb-2">
              🔒 Pro 专属内容
            </p>
            <p className="text-xs text-text-tertiary mb-3">
              AI 基于 10,000 场比赛训练的深度战术推演
            </p>
            <button
              onClick={onUnlock}
              className="bg-accent text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-accent-hover transition-colors btn-press"
            >
              升级 Pro 解锁 — ¥29.9 永久
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-text-secondary leading-relaxed space-y-3 max-h-96 overflow-y-auto pr-2">
      {report.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;
        // 章节标题
        if (/^[一二三四五]、/.test(trimmed)) {
          return (
            <h4 key={i} className="text-base font-bold text-text-primary mt-4 mb-2">
              {trimmed}
            </h4>
          );
        }
        // 报告标题
        if (trimmed.startsWith('【')) {
          return (
            <h4 key={i} className="text-sm font-semibold text-accent mb-1">
              {trimmed}
            </h4>
          );
        }
        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
}
