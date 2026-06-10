import { worldCupMatches } from '@/lib/mockData';

export function generateStaticParams() {
  return worldCupMatches.map((m) => ({ id: m.id }));
}

export default function MatchDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
