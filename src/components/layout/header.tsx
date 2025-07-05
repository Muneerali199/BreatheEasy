import Link from 'next/link';
import { Wind } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b h-16 border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-full max-w-screen-2xl items-center px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Wind className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg font-headline">BreatheEasy</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Dashboard
          </Link>
          <Link
            href="/notifications"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Notifications
          </Link>
        </nav>
      </div>
    </header>
  );
}
