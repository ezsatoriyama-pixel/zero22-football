'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const pathname = usePathname();
  const { isLoggedIn, isPro, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: '首页' },
    { href: '/matches', label: '赛事中心' },
    { href: '/history', label: '历史战绩' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-light">
      <div className="max-w-page mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg md:text-xl font-bold text-text-primary tracking-tight">
            Zero22 AI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-text-primary text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2 md:gap-3">
              {isPro && (
                <span className="text-[10px] md:text-xs font-semibold text-pro-gold bg-pro-bg px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                  PRO
                </span>
              )}
              <span className="text-xs md:text-sm text-text-secondary hidden sm:inline">
                {user?.maskedPhone || user?.phone}
              </span>
              <button
                onClick={logout}
                className="text-xs md:text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-accent text-white text-xs md:text-sm font-medium px-4 md:px-5 py-1.5 md:py-2 rounded-full hover:bg-accent-hover transition-colors"
            >
              登录
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1 p-2"
            aria-label="菜单"
          >
            <span className={`block w-5 h-0.5 bg-text-primary transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-5 h-0.5 bg-text-primary transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-text-primary transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t border-border-light px-4 py-3 space-y-1 animate-fade-in">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-text-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
