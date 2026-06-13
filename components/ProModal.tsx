'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { validateActivationCode, consumeActivationCode } from '@/lib/activationCodes';
import toast from 'react-hot-toast';

const BASE_PATH = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH
  ? process.env.NEXT_PUBLIC_BASE_PATH
  : '';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProModal({ open, onClose }: Props) {
  const { isLoggedIn, user, isPro, upgradeToPro, register, login } = useAuth();
  const [code, setCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  if (!open) return null;

  const close = () => { setCode(''); setActivating(false); setShowCodeInput(false); onClose(); };

  const handleActivate = async () => {
    if (!isLoggedIn || !user?.phone) {
      toast.error('请先登录');
      return;
    }
    if (isPro) {
      toast.success('您已是 Pro 永久会员 🎉');
      close();
      return;
    }

    const validation = validateActivationCode(code);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    setActivating(true);
    // 标记激活码已使用 + 升级用户
    consumeActivationCode(code);
    upgradeToPro();
    toast.success('Pro 会员已激活！🎉', { duration: 3000 });
    setTimeout(close, 1000);
    setActivating(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-white rounded-card shadow-card-hover p-8 max-w-md w-full mx-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        <button onClick={close} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary text-xl transition-colors">✕</button>

        {isPro ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-bold text-text-primary">Pro 永久会员</h3>
            <p className="text-text-secondary">您已解锁全部高级功能</p>
            <button onClick={close} className="text-accent hover:underline">返回</button>
          </div>
        ) : (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 mx-auto bg-pro-bg rounded-full flex items-center justify-center text-2xl">⚽</div>
            <h3 className="text-xl font-bold text-text-primary">升级 Pro 永久会员</h3>

            {/* 价格卡片 */}
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

            {/* 付款码 */}
            <div>
              <p className="text-sm text-text-secondary mb-3">扫码支付 29.9 元</p>
              <div className="flex gap-4 justify-center">
                <div className="text-center">
                  <img src={`${BASE_PATH}/qr-1.jpg`} alt="支付宝" className="w-32 h-32 object-cover rounded-xl border" />
                  <p className="text-xs text-text-tertiary mt-1">支付宝</p>
                </div>
                <div className="text-center">
                  <img src={`${BASE_PATH}/qr-2.jpg`} alt="微信支付" className="w-32 h-32 object-cover rounded-xl border" />
                  <p className="text-xs text-text-tertiary mt-1">微信支付</p>
                </div>
              </div>
            </div>

            {/* 微信联系 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
              <p className="text-sm font-bold text-green-800 mb-1">📱 付款后加微信获取激活码</p>
              <p className="text-base font-mono font-bold text-green-900">微信号：HJ0626139</p>
              <p className="text-xs text-green-700 mt-1">付款后添加微信，发送付款截图即可获取 Pro 激活码</p>
            </div>

            {/* 分隔线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-light"></div></div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-text-tertiary">已有激活码？</span>
              </div>
            </div>

            {/* 激活码输入 */}
            <div className="space-y-3">
              <button
                onClick={() => setShowCodeInput(!showCodeInput)}
                className="text-sm text-accent hover:underline"
              >
                {showCodeInput ? '收起' : '点击输入激活码'}
              </button>

              {showCodeInput && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="输入 Pro 激活码"
                    className="w-full px-4 py-3 border border-border-light rounded-xl text-center text-lg font-mono tracking-widest focus:outline-none focus:border-accent"
                    autoFocus
                  />
                  <button
                    onClick={handleActivate}
                    disabled={activating || !code.trim()}
                    className="w-full py-3 rounded-xl bg-accent text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {activating ? '激活中...' : '激活 Pro 会员'}
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-text-tertiary">
              如未登录请先登录/注册后再激活
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
