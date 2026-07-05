import { allWorldCupMatches } from '@/lib/worldCupSchedule';

export function generateStaticParams() {
  return allWorldCupMatches.map((m) => ({ id: m.id }));
}

export default function MatchDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

