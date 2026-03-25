import type { Metadata } from "next";
import { SafeArea } from "./components/SafeArea";
import { Providers } from "./providers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Asteroids",
    description:
      "Blast asteroids, avoid collisions, and beat the high score in this classic arcade mini app on Base.",
    other: {
      "base:app_id": "697cb90477db5d481cffc876",
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
