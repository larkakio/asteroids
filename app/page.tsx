"use client";

import { useAccount } from "wagmi";
import { useMiniApp } from "./providers/MiniAppProvider";
import { AsteroidsGame } from "./components/AsteroidsGame";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Home() {
  const { isReady } = useMiniApp();
  const { address } = useAccount();
  const displayName = address ? truncateAddress(address) : null;

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col">
      {isReady && displayName && (
        <header className="flex items-center gap-2 border-b border-[var(--foreground)]/10 px-4 py-3">
          <span className="text-sm text-[var(--muted)]">Connected</span>
          <span className="font-medium">{displayName}</span>
        </header>
      )}
      <section className="flex min-h-0 flex-1 flex-col">
        <AsteroidsGame />
      </section>
    </main>
  );
}
