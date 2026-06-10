'use client';

import { useState, useEffect } from 'react';
import { generateCodes, listCodes, verifyAdmin, getUnusedCount, listPending, approveActivation, rejectActivation, getActivated } from '@/lib/activationCodes';
import type { ActivationCode, PendingActivation, ActivatedRecord } from '@/lib/activationCodes';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [pending, setPending] = useState<PendingActivation[]>([]);
  const [activated, setActivated] = useState<ActivatedRecord[]>([]);
  const [genCount, setGenCount] = useState(20);
  const [copied, setCopied] = useState('');
  const [tab, setTab] = useState<'pending' | 'codes' | 'history'>('pending');

  const refresh = () => {
    setCodes(listCodes());
    setPending(listPending());
    setActivated(getActivated());
  };

  useEffect(() => { if (authed) refresh(); }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdmin(password)) setAuthed(true);
    else alert('密码错误');
  };

  const handleGenerate = () => {
    generateCodes(Math.min(Math.max(genCount, 1), 100));
    refresh();
  };

  const handleCopy = (code: string) => { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(''), 2000); };

  const handleApprove = (id: string) => {
    const result = approveActivation(id);
    if (result.ok) toast.success(`${result.message} — ${result.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`);
    else toast.error(result.message);
    refresh();
  };

  const handleReject = (id: string) => {
    rejectActivation(id);
    toast.success('已拒绝');
    refresh();
  };

  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="bg-white rounded-card p-8 shadow-card max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold text-text-primary text-center">Zero22 管理后台</h2>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="管理员密码"
            className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm" />
          <button type="submit" className="w-full bg-accent text-white font-semibold py-3 rounded-full hover:bg-accent-hover transition-colors">进入后台</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-page mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Zero22 管理后台</h1>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {pending.length > 0 && (
          <span className="bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">{pending.length} 个待确认</span>
        )}
        <span className="text-sm text-text-tertiary">可用码：{getUnusedCount()} · 已激活：{activated.length}</span>
      </div>

      {/* Tabs */}
      <div className="flex bg-bg rounded-full p-1 mb-6 max-w-xs">
        {[
          { key: 'pending' as const, label: `待确认${pending.length ? ` (${pending.length})` : ''}` },
          { key: 'codes' as const, label: '激活码' },
          { key: 'history' as const, label: '激活记录' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${tab === t.key ? 'bg-white text-text-primary shadow-sm' : 'text-text-tertiary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Pending Tab */}
      {tab === 'pending' && (
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          {pending.length === 0 ? (
            <div className="text-center py-10 text-text-tertiary text-sm">暂无待确认的激活申请</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border-light">
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">手机号</th>
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">申请时间</th>
                  <th className="text-center px-6 py-3 text-text-tertiary font-medium">操作</th>
                </tr></thead>
                <tbody>
                  {pending.map((p) => (
                    <tr key={p.id} className="border-b border-border-light last:border-0">
                      <td className="px-6 py-4 text-text-primary">{p.maskedPhone}</td>
                      <td className="px-6 py-4 text-text-tertiary text-xs">{new Date(p.createdAt).toLocaleString('zh-CN')}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleApprove(p.id)} className="bg-green-50 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-green-100 transition-colors">确认收款</button>
                          <button onClick={() => handleReject(p.id)} className="bg-gray-100 text-text-tertiary text-xs px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors">拒绝</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Codes Tab */}
      {tab === 'codes' && (
        <>
          <div className="bg-white rounded-card p-6 shadow-card mb-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">生成激活码（手动发码用）</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <input type="number" min={1} max={100} value={genCount} onChange={(e) => setGenCount(Number(e.target.value))}
                className="w-20 px-3 py-2 rounded-xl border border-border-light bg-bg text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-accent/20" />
              <span className="text-sm text-text-tertiary">个</span>
              <button onClick={handleGenerate} className="bg-accent text-white text-sm font-medium px-6 py-2 rounded-full hover:bg-accent-hover transition-colors">立即生成</button>
            </div>
          </div>
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white"><tr className="border-b border-border-light">
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">激活码</th>
                  <th className="text-center px-6 py-3 text-text-tertiary font-medium">状态</th>
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">使用者</th>
                  <th className="text-center px-6 py-3 text-text-tertiary font-medium">操作</th>
                </tr></thead>
                <tbody>
                  {codes.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-text-tertiary">暂无激活码</td></tr>}
                  {codes.map((c) => (
                    <tr key={c.code} className="border-b border-border-light last:border-0 hover:bg-bg/50">
                      <td className="px-6 py-3 font-mono text-text-primary">{c.code}</td>
                      <td className="px-6 py-3 text-center">{c.used ? <span className="text-xs text-text-tertiary bg-gray-100 px-2 py-1 rounded-full">已用</span> : <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">可用</span>}</td>
                      <td className="px-6 py-3 text-text-secondary">{c.usedBy || '-'}</td>
                      <td className="px-6 py-3 text-center">{!c.used && <button onClick={() => handleCopy(c.code)} className="text-xs text-accent hover:text-accent-hover font-medium">{copied === c.code ? '已复制 ✓' : '复制'}</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          {activated.length === 0 ? (
            <div className="text-center py-10 text-text-tertiary text-sm">暂无激活记录</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border-light">
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">手机号</th>
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">激活码</th>
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">申请时间</th>
                  <th className="text-left px-6 py-3 text-text-tertiary font-medium">确认时间</th>
                </tr></thead>
                <tbody>
                  {activated.map((a) => (
                    <tr key={a.phone + a.approvedAt} className="border-b border-border-light last:border-0">
                      <td className="px-6 py-4 text-text-primary">{a.maskedPhone}</td>
                      <td className="px-6 py-4 font-mono text-text-secondary text-xs">{a.code}</td>
                      <td className="px-6 py-4 text-text-tertiary text-xs">{new Date(a.createdAt).toLocaleString('zh-CN')}</td>
                      <td className="px-6 py-4 text-text-tertiary text-xs">{new Date(a.approvedAt).toLocaleString('zh-CN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
