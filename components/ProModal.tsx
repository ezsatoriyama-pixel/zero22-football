'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { submitPendingActivation, isApproved, isPending } from '@/lib/activationCodes';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProModal({ open, onClose }: Props) {
  const { isLoggedIn, isPro, user, completePaidUpgrade } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const close = () => { setSubmitting(false); setSubmitted(false); onClose(); };

  // Check if user was approved since last page load
  if (user?.phone && isApproved(user.phone) && !isPro) {
    completePaidUpgrade(user.phone);
  }

  const handleSubmit = () => {
    if (!isLoggedIn || !user?.phone) { toast.error('请先登录'); return; }
    if (isPro) { toast.success('您已是 Pro 永久会员'); close(); return; }
    if (isApproved(user.phone)) {
      completePaidUpgrade(user.phone);
      toast.success('您的申请已通过，Pro 已激活 🎉', { duration: 3000 });
      setTimeout(close, 800);
      return;
    }
    if (isPending(user.phone)) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    const result = submitPendingActivation(user.phone);
    if (result.ok) {
      setSubmitted(true);
      toast.success(result.message, { duration: 4000 });
    } else {
      toast.error(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-white rounded-card md:rounded-card shadow-card-hover p-5 md:p-8 max-w-md w-full mx-2 md:mx-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        <button onClick={close} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary text-xl transition-colors">✕</button>

        <div className="text-center space-y-5">
          <div className="w-16 h-16 mx-auto bg-pro-bg rounded-full flex items-center justify-center text-2xl">⚽</div>
          <h3 className="text-xl font-bold text-text-primary">升级 Pro 永久会员</h3>

          <div className="bg-bg rounded-2xl p-5 space-y-2">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-text-primary">¥29.9</span>
              <span className="text-text-tertiary text-sm">永久</span>
            </div>
            <ul className="text-sm text-text-secondary space-y-1.5 text-left">
              <li>✓ 完整比分概率矩阵</li>
              <li>✓ 双方进球概率分布</li>
              <li>✓ 500字深度战术推演报告</li>
              <li>✓ 爆冷指数 & 风险评级</li>
              <li>✓ 永久有效，无需续费</li>
            </ul>
          </div>

          {/* Payment QR codes */}
          {!submitted && (
            <div>
              <p className="text-sm font-semibold text-text-primary mb-3">扫码支付 ¥29.9</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg rounded-2xl p-3 text-center">
                  <img src="/qr-1.jpg" alt="收款码" className="w-full rounded-xl mb-2" />
                  <span className="text-xs text-text-tertiary">微信 / 支付宝</span>
                </div>
                <div className="bg-bg rounded-2xl p-3 text-center">
                  <img src="/qr-2.jpg" alt="收款码" className="w-full rounded-xl mb-2" />
                  <span className="text-xs text-text-tertiary">微信 / 支付宝</span>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3 text-left">
                <p className="text-xs font-semibold text-amber-800 mb-0.5">⚠️ 支付时请备注您的手机号</p>
                <p className="text-xs text-amber-700">微信/支付宝转账时，在「添加备注」中填写 <span className="font-bold text-amber-900">{user?.maskedPhone || '您的手机号'}</span>，方便管理员核对收款。</p>
              </div>
              <p className="text-xs text-text-tertiary">任选其一扫码支付 ¥29.9</p>
            </div>
          )}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-accent text-white font-semibold py-3 rounded-full hover:bg-accent-hover transition-colors btn-press disabled:opacity-60"
            >
              {isPro ? '已是 Pro 永久会员' : submitting ? '提交中...' : '我已完成支付，提交激活申请'}
            </button>
          ) : (
            <div className="bg-green-50 rounded-2xl p-5 text-center space-y-2">
              <div className="text-2xl">📩</div>
              <p className="text-sm font-semibold text-green-800">申请已提交</p>
              <p className="text-xs text-green-700">管理员确认收款后将自动激活您的 Pro 会员，请稍后刷新页面查看。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
