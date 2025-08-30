const COLORS = [
  "text-pink-300",
  "text-blue-300",
  "text-green-300",
  "text-yellow-300",
  "text-purple-300",
  "text-indigo-300",
  "text-red-300",
  "text-teal-300",
  "text-orange-300",
  "text-cyan-300",
];

export function getColorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}