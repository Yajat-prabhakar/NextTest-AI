export function StitchFooter() {
  return (
    <footer className="bg-surface-container-low w-full py-8 mt-20 border-t-4 border-on-surface border-dashed">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-10 gap-4 max-w-[1280px] mx-auto w-full">
        <div
          className="font-semibold text-[18px] text-secondary"
          style={{ fontFamily: "var(--font-quicksand)" }}
        >
          © 2024 AI Element Detective. Stay Curious, Stay Safe!
        </div>
        <nav className="flex gap-6 font-bold text-sm">
          <a href="#" className="hover:text-primary transition-colors">
            Safety First
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Parents Guide
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </a>
        </nav>
      </div>
    </footer>
  );
}
