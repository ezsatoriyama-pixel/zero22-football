'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const resetForm = (nextRegister: boolean) => {
    setIsRegister(nextRegister);
    setPhone('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error('请填写手机号和密码');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      toast.error('请输入正确的手机号');
      return;
    }
    if (password.length < 4) {
      toast.error('密码至少4位');
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        toast.error('两次输入密码不一致');
        return;
      }
      const result = register(phone, password);
      if (result.ok) {
        toast.success(result.message);
        router.push('/');
      } else {
        toast.error(result.message);
      }
    } else {
      const result = login(phone, password);
      if (result.ok) {
        toast.success(result.message);
        router.push('/');
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 md:px-6">
      <div className="bg-white rounded-card p-6 md:p-8 shadow-card w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6 md:mb-8">
          <div className="text-2xl md:text-3xl mb-3">⚽</div>
          <h2 className="text-lg md:text-xl font-bold text-text-primary">
            {isRegister ? '注册 Zero22' : '登录 Zero22'}
          </h2>
          <p className="text-sm text-text-tertiary mt-1">
            {isRegister ? '创建账号，开启智能预测' : '欢迎回来，继续你的足球分析'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="请输入手机号"
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-accent text-white font-semibold py-3 rounded-full hover:bg-accent-hover transition-colors btn-press mt-2"
          >
            {isRegister ? '注册' : '登录'}
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-text-secondary">
          {isRegister ? '已有账号？' : '没有账号？'}
          <button
            type="button"
            onClick={() => resetForm(!isRegister)}
            className="text-accent font-medium hover:underline ml-1"
          >
            {isRegister ? '去登录' : '去注册'}
          </button>
        </p>

        <p className="text-xs text-text-tertiary text-center mt-4">
          登录即表示同意
          <a href="#" className="text-accent hover:underline"> 服务条款 </a>
          和
          <a href="#" className="text-accent hover:underline"> 隐私政策</a>
        </p>
      </div>
    </div>
  );
}
