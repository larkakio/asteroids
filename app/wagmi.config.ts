import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { mainnet } from "wagmi/chains";
import { baseAccount, injected, walletConnect } from "wagmi/connectors";

import { getTargetChain } from "@/lib/publicEnv";

const target = getTargetChain();
const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [target, mainnet],
  connectors: [
    injected(),
    baseAccount({
      appName: "Asteroids",
    }),
    ...(wcProjectId
      ? [
          walletConnect({
            projectId: wcProjectId,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [target.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
