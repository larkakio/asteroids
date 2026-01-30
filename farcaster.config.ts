const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://asteroids-vert.vercel.app");

/**
 * MiniApp configuration for Base.app & Farcaster.
 * @see https://docs.base.org/mini-apps/quickstart/create-new-miniapp
 */
export const farcasterConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "Asteroids",
    subtitle: "Classic arcade shooter in space",
    description:
      "Blast asteroids, avoid collisions, and beat the high score in this classic arcade mini app on Base.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/hero-image.png`,
    splashBackgroundColor: "#0a0a0f",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["game", "arcade", "asteroids", "retro", "space"],
    heroImageUrl: `${ROOT_URL}/hero-image.png`,
    tagline: "Classic arcade shooter in space",
    ogTitle: "Asteroids – Mini App on Base",
    ogDescription: "Blast asteroids and set the high score. Play in Base app.",
    ogImageUrl: `${ROOT_URL}/hero-image.png`,
  },
} as const;
