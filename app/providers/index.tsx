"use client";

import { RootProvider } from "../rootProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <RootProvider>{children}</RootProvider>;
}
