import type { Metadata } from "next";
import { SafeArea } from "./components/SafeArea";
import { farcasterConfig } from "../farcaster.config";
import { Providers } from "./providers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: farcasterConfig.miniapp.name,
    description: farcasterConfig.miniapp.description,
    other: {
      "fc:frame": JSON.stringify({
        version: farcasterConfig.miniapp.version,
        imageUrl: farcasterConfig.miniapp.heroImageUrl,
        button: {
          title: `Play ${farcasterConfig.miniapp.name}`,
          action: {
            name: `Launch ${farcasterConfig.miniapp.name}`,
            type: "launch_frame",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <Providers>
          <SafeArea>{children}</SafeArea>
        </Providers>
      </body>
    </html>
  );
}
