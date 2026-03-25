"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

/** Legacy mini-app context shape; wallet identity comes from wagmi in Base App. */
interface MiniAppContextValue {
  context: null;
  isReady: boolean;
}

export const MiniAppContext = createContext<MiniAppContextValue | null>(null);

export function useMiniApp() {
  const ctx = useContext(MiniAppContext);
  if (!ctx) {
    throw new Error("useMiniApp must be used within MiniAppProvider");
  }
  return ctx;
}

export function MiniAppProvider({ children }: { children: ReactNode }) {
  return (
    <MiniAppContext.Provider value={{ context: null, isReady: true }}>
      {children}
    </MiniAppContext.Provider>
  );
}
