'use client';

import { useState, useEffect } from 'react';
import { getAvailableCodes, getUsedCodesList } from '@/lib/activationCodes';
import { worldCupMatches } from '@/lib/mockData';
import { loadResultSnapshot, saveMatchResult, deleteMatchResult, buildHistoryRecords, percentage, type ResultMap, type ResultSource } from '@/lib/results';
import toast from 'react-hot-toast';

type Tab = 'results' | 'available' | 'used';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [availableCodes, setAvailableCodes] = useState<string[]>([]);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>('results');
  const [copied, setCopied] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [resultMap, setResultMap] = useState<ResultMap>({});
  const [localStats, setLocalStats] = useState({ totalUsers: 0, proUsers: 0 });
  const [resultCount, setResultCount] = useState(0);
  const [historyStats, setHistoryStats] = useState({ exact: '待更新', top5: '待更新', outcome: '待更新' });
  const [resultSource, setResultSource] = useState<ResultSource>('static');
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);

  const refresh = (results: ResultMap = resultMap) => {
    setAvailableCodes(getAvailableCodes());
    setUsedCodes(getUsedCodesList());
    setResultMap(results);
    setResultCount(Object.keys(results).length);
    const records = buildHistoryRecords(worldCupMatches, results);
    setHistoryStats({
      exact: percentage(records.filter((r) => r.isExact).length, records.length),
      top5: percentage(records.filter((r) => r.isTop5).length, records.length),
      outcome: percentage(records.filter((r) => r.isOutcomeCorrect).length, records.length),
    });
    const nextScores: Record<string, string> = {};
    worldCupMatches.forEach((m) => { nextScores[m.id] = results[m.id]?.actualScore || ''; });
    setScores(nextScores);
    try {
      const accounts = JSON.parse(localStorage.getItem('zero22-accounts') || '[]');
      setLocalStats({ totalUsers: accounts.length, proUsers: accounts.filter((a: any) => a.isPro).length });
    } catch {}
  };

  useEffect(() => {
    if (!authed) return;

    let mounted = true;
    loadResultSnapshot().then((snapshot) => {
      if (!mounted) return;
      setResultSource(snapshot.source);
      refresh(snapshot.results);
    });

    return () => { mounted = false; };
  }, [authed]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('adminPassword') as HTMLInputElement | null;
    const value = (input?.value || password).trim();
    if (value === 'zero22admin') setAuthed(true);
    else toast.error('密码错误');
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success('已复制');
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSaveScore = async (matchId: string) => {
    setSavingMatchId(matchId);
    const res = await saveMatchResult(matchId, scores[matchId]);
    setSavingMatchId(null);
    if (!res.ok) return toast.error(res.message);
    toast.success(res.message);
    if (res.source) setResultSource(res.source);
    refresh(res.results || resultMap);
  };

  const handleDeleteScore = async (matchId: string) => {
    setSavingMatchId(matchId);
    const res = await deleteMatchResult(matchId);
    setSavingMatchId(null);
    if (!res.ok) return toast.error(res.message);
    toast.success(res.message);
    if (res.source) setResultSource(res.source);
    refresh(res.results || resultMap);
  };

  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="bg-white rounded-card p-8 shadow-card max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold text-text-primary text-center">Zero22 管理后台</h2>
          <input name="adminPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="管理员密码"
            className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm" />
          <button type="submit" className="w-full bg-accent text-white font-semibold py-3 rounded-full hover:bg-accent-hover transition-colors">进入后台</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-page mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Zero22 管理后台</h1>
      <p className="text-text-tertiary mb-8">赛后比分录入 · 历史统计闭环 · 激活码管理</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Stat label="已录入赛果" value={resultCount} />
        <Stat label="主推命中" value={historyStats.exact} />
        <Stat label="TOP5 覆盖" value={historyStats.top5} />
        <Stat label="胜平负方向" value={historyStats.outcome} />
        <Stat label="可用激活码" value={availableCodes.length} />
        <Stat label="已使用激活码" value={usedCodes.length} />
        <Stat label="注册用户" value={localStats.totalUsers} />
        <Stat label="Pro 会员" value={localStats.proUsers} />
      </div>

      <div className="flex bg-bg rounded-full p-1 mb-6 max-w-xl">
        <TabBtn active={tab === 'results'} onClick={() => setTab('results')}>赛果录入</TabBtn>
        <TabBtn active={tab === 'available'} onClick={() => setTab('available')}>可用码</TabBtn>
        <TabBtn active={tab === 'used'} onClick={() => setTab('used')}>已用码</TabBtn>
      </div>

      {tab === 'results' && (
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="p-5 border-b border-border-light">
            <h2 className="font-bold text-text-primary">赛后比分录入</h2>
            <p className="text-sm text-text-tertiary mt-1">静态站模式下，赛果需要通过 GitHub Actions 固化到代码并重新发布；若接入共享 API，可在这里直接保存。</p>
            <p className="text-xs text-text-tertiary mt-2">当前赛果源：{sourceLabel(resultSource)}</p>
          </div>
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm min-w-[880px]">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-border-light">
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">时间</th>
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">比赛</th>
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">主推</th>
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">实际比分</th>
                  <th className="text-center px-6 py-3 text-text-tertiary font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {worldCupMatches.map((m) => (
                  <tr key={m.id} className="border-b border-border-light last:border-0 hover:bg-bg/50">
                    <td className="px-6 py-3 text-text-tertiary">{m.date} {m.time}</td>
                    <td className="px-6 py-3 text-text-primary font-medium">{m.homeTeam} vs {m.awayTeam}<div className="text-xs text-text-tertiary mt-1">{m.stage}</div></td>
                    <td className="px-6 py-3 font-mono">{m.predictedScore}</td>
                    <td className="px-6 py-3">
                      <input value={scores[m.id] || ''} onChange={(e) => setScores((prev) => ({ ...prev, [m.id]: e.target.value }))} placeholder="如 2:1"
                        className="w-24 px-3 py-2 rounded-xl border border-border-light bg-bg focus:outline-none focus:ring-2 focus:ring-accent/20" />
                    </td>
                    <td className="px-6 py-3 text-center space-x-2">
                      <button disabled={savingMatchId === m.id} onClick={() => handleSaveScore(m.id)} className="text-xs text-white bg-accent hover:bg-accent-hover disabled:opacity-60 px-3 py-1.5 rounded-full font-medium">{savingMatchId === m.id ? '处理中' : '保存'}</button>
                      {resultMap[m.id] && <button disabled={savingMatchId === m.id} onClick={() => handleDeleteScore(m.id)} className="text-xs text-red-600 bg-red-50 disabled:opacity-60 px-3 py-1.5 rounded-full font-medium">删除</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'available' && <CodeTable codes={availableCodes} copied={copied} onCopy={handleCopy} empty="所有激活码已用完" />}
      {tab === 'used' && <CodeTable codes={usedCodes} copied={copied} onCopy={handleCopy} used empty="暂无已使用的激活码" />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="bg-white rounded-card p-4 shadow-card"><p className="text-xs text-text-tertiary mb-1">{label}</p><p className="text-xl font-bold text-text-primary">{value}</p></div>;
}

function sourceLabel(source: ResultSource) {
  if (source === 'remote') return '共享 API';
  if (source === 'static') return '每日自动赛果';
  return '每日自动赛果';
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${active ? 'bg-white text-text-primary shadow-sm' : 'text-text-tertiary'}`}>{children}</button>;
}

function CodeTable({ codes, copied, onCopy, used, empty }: { codes: string[]; copied: string; onCopy: (code: string) => void; used?: boolean; empty: string }) {
  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      {codes.length === 0 ? <div className="text-center py-16"><p className="text-text-tertiary">{empty}</p></div> : (
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white"><tr className="border-b border-border-light"><th className="text-left px-6 py-3 text-text-tertiary font-medium">#</th><th className="text-left px-6 py-3 text-text-tertiary font-medium">激活码</th><th className="text-center px-6 py-3 text-text-tertiary font-medium">操作</th></tr></thead>
            <tbody>{codes.map((code, i) => <tr key={code} className="border-b border-border-light last:border-0 hover:bg-bg/50"><td className="px-6 py-3 text-text-tertiary">{i + 1}</td><td className={`px-6 py-3 font-mono ${used ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>{code}</td><td className="px-6 py-3 text-center">{used ? <span className="text-xs text-text-tertiary bg-gray-100 px-2 py-1 rounded-full">已使用</span> : <button onClick={() => onCopy(code)} className="text-xs text-accent hover:text-accent-hover font-medium bg-accent/5 px-3 py-1.5 rounded-full">{copied === code ? '已复制 ✓' : '复制发用户'}</button>}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
