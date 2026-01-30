"use client";

import { useMiniApp } from "./providers/MiniAppProvider";
import { AsteroidsGame } from "./components/AsteroidsGame";

export default function Home() {
  const { context, isReady } = useMiniApp();
  const displayName = context?.user?.displayName ?? null;

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col">
      {isReady && displayName && (
        <header className="flex items-center gap-2 border-b border-[var(--foreground)]/10 px-4 py-3">
          <span className="text-sm text-[var(--muted)]">Playing as</span>
          <span className="font-medium">{displayName}</span>
        </header>
      )}
      <section className="flex min-h-0 flex-1 flex-col">
        <AsteroidsGame />
      </section>
    </main>
  );
}
