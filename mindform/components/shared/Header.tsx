import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto max-w-[1280px] px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-semibold tracking-tight text-[24px]"
          style={{ color: "var(--fg-marketing)" }}
        >
          MINDFORM
        </Link>
        <nav className="flex items-center gap-6 text-[15px]">
          <Link href="/cast" className="hover:text-tomato transition-colors">
            Cast
          </Link>
          <Link href="/docs" className="hover:text-tomato transition-colors">
            Docs
          </Link>
          <Link href="/pricing" className="hover:text-tomato transition-colors">
            Pricing
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
