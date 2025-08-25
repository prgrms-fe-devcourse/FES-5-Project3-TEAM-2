export function createJitter(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`; // 3자리 지터
}