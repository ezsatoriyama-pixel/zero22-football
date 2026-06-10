'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || !password) {
      setError('请填写完整信息');
      return;
    }
    const success = await login(phone, password);
    if (!success) {
      setError(isRegister ? '注册失败，请重试' : '手机号或密码错误');
    }
  };

  return (
    <div className="text-center pt-28 pb-24 px-6">
      <div className="max-w-md mx-auto bg-white p-8 rounded-card shadow-card">
        <h1 className="text-[48px] font-bold text-text-primary tracking-tight leading-[0.95]">
          {isRegister ? '创建账号' : '登录'}
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          {isRegister ? '使用手机号注册新账号' : '登录以解锁完整功能'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-base text-text-tertiary mb-2 text-left">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-xl border border-border-light text-base text-text-primary focus:outline-none focus:border-accent"
              placeholder="请输入手机号"
            />
          </div>
          <div>
            <label className="block text-base text-text-tertiary mb-2 text-left">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-xl border border-border-light text-base text-text-primary focus:outline-none focus:border-accent"
              placeholder="请输入密码"
            />
          </div>

          {error && (
            <div className="text-red-500 text-base font-medium text-left">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-accent text-white text-lg font-bold px-10 py-4 rounded-full hover:bg-accent-hover transition-colors btn-press"
          >
            {isRegister ? '注册' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-base text-text-secondary">
          {isRegister ? '已有账号？' : '没有账号？'}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-accent font-bold ml-2 hover:underline"
          >
            {isRegister ? '立即登录' : '立即注册'}
          </button>
        </div>
      </div>
    </div>
  );
}