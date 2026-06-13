from pathlib import Path
p=Path(r'C:\Users\83668\.qwenpaw\workspaces\default\football-predict\app\page.tsx')
text=p.read_text(encoding='utf-8')
old="""export default function HomePage() {
  const { isPro } = useAuth();
  const featuredMatches = worldCupMatches.slice(0, 4);

  return (
"""
new="""function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDailyMatches() {
  const today = toLocalDateString(new Date());
  const todayMatches = worldCupMatches.filter((m) => m.date === today);
  if (todayMatches.length > 0) {
    return { title: '今日赛事', subtitle: `${today} 今日自动更新`, matches: todayMatches.slice(0, 4) };
  }

  const nextDate = worldCupMatches.find((m) => m.date > today)?.date;
  if (nextDate) {
    return {
      title: '下一比赛日',
      subtitle: `${nextDate} 暂无今日比赛，自动展示下一比赛日`,
      matches: worldCupMatches.filter((m) => m.date === nextDate).slice(0, 4),
    };
  }

  return { title: '近期赛事', subtitle: '赛程已结束，显示最后比赛日', matches: worldCupMatches.slice(-4) };
}

export default function HomePage() {
  const { isPro } = useAuth();
  const daily = getDailyMatches();
  const featuredMatches = daily.matches;

  return (
"""
if old not in text: raise SystemExit('home block not found')
text=text.replace(old,new)
text=text.replace('<h2 className="text-3xl font-bold text-text-primary">今日焦点战</h2>', '<div>\n            <h2 className="text-3xl font-bold text-text-primary">{daily.title}</h2>\n            <p className="text-sm text-text-tertiary mt-2">{daily.subtitle}</p>\n          </div>')
text=text.replace('<div className="grid grid-cols-2 gap-6">', '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">')
p.write_text(text, encoding='utf-8')
print('home updated')
