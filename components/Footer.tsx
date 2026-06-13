'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-bg py-20 border-t border-border-light">
      <div className="max-w-page mx-auto px-6 text-center">
        <p className="text-2xl font-bold text-text-primary tracking-tight">
          Zero22 AI Football Lab
        </p>
        <p className="mt-6 text-base text-text-tertiary">
          © 2026 Zero22 AI Football Lab. All rights reserved.
        </p>
        <div className="mt-6 flex justify-center gap-8 text-base text-text-secondary">
          <Link href="/disclaimer" className="hover:text-accent">免责声明</Link>
          <Link href="/pro-terms" className="hover:text-accent">Pro 会员条款</Link>
          <Link href="/admin" className="hover:text-accent">管理后台</Link>
          <a href="https://github.com/ezsatoriyama-pixel/zero22-football" target="_blank" rel="noopener noreferrer" className="hover:text-accent">GitHub</a>
        </div>
      </div>
    </footer>
  );
}