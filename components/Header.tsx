'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const pathname = usePathname();
  const { isLoggedIn, isPro, user, logout } = useAuth();

  const links = [
    { href: '/', label: '首页' },
    { href: '/matches', label: '赛事中心' },
    { href: '/history', label: '历史战绩' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-light">
      <div className="max-w-page mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <span className="text-2xl font-bold text-text-primary tracking-tight">Zero22 AI</span>
        </Link>

        <nav className="flex items-center gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-5 py-3 rounded-full text-base font-semibold transition-colors ${
                pathname === l.href
                  ? 'bg-text-primary text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          {isLoggedIn ? (
            <>
              {isPro && (
                <span className="text-sm font-bold text-pro-gold bg-pro-bg px-4 py-1.5 rounded-full">PRO</span>
              )}
              <span className="text-base text-text-secondary">
                {user?.maskedPhone || user?.phone}
              </span>
              <button
                onClick={logout}
                className="text-base text-text-tertiary hover:text-text-primary transition-colors"
              >
                退出
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-accent text-white text-base font-semibold px-6 py-2.5 rounded-full hover:bg-accent-hover transition-colors"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}