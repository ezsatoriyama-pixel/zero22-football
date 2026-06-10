export default function Footer() {
  return (
    <footer className="border-t border-border-light mt-12 md:mt-20">
      <div className="max-w-page mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        <span className="text-xs md:text-sm text-text-tertiary">
          © 2026 Zero22 AI Football Lab. 数据仅供参考。
        </span>
        <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-text-tertiary">
          <a href="/admin" className="hover:text-text-primary transition-colors opacity-40">⚙</a>
          <a href="#" className="hover:text-text-primary transition-colors">关于我们</a>
          <a href="#" className="hover:text-text-primary transition-colors">隐私政策</a>
          <a href="#" className="hover:text-text-primary transition-colors">使用条款</a>
        </div>
      </div>
    </footer>
  );
}
