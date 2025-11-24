// Task definitions (hardcoded, not in DB)
export const TASKS = [
  {
    id: "follow",
    title: "Follow @basedlimbo",
    description: "Get updates on new features",
    points: 100,
    icon: "👤",
    action: "https://warpcast.com/basedlimbo",
  },
  {
    id: "cast",
    title: "Cast about Limbo",
    description: "Share with your friends",
    points: 150,
    icon: "📢",
    action:
      "https://warpcast.com/~/compose?text=Just found Based Limbo - the ultimate multiplier game on Farcaster! 🎲",
  },
  {
    id: "join",
    title: "Join our channel",
    description: "Connect with the community",
    points: 100,
    icon: "💬",
    action: "https://warpcast.com/~/channel/limbo",
  },
  {
    id: "add_miniapp",
    title: "Add Mini App",
    description: "Quick access from home",
    points: 200,
    icon: "/fc.png",
    action: "sdk",
  },
  {
    id: "referral",
    title: "Invite Friends",
    description: "Get 50 points per referral (max 50)",
    points: 50,
    icon: "🎁",
    action: "referral",
  },
];
