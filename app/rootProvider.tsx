"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { WrongNetworkBanner } from "@/components/WrongNetworkBanner";
import { MiniAppProvider } from "./providers/MiniAppProvider";
import { wagmiConfig } from "./wagmi.config";

export function RootProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniAppProvider>
        <WrongNetworkBanner />
        {children}
        <DailyCheckIn />
      </MiniAppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
