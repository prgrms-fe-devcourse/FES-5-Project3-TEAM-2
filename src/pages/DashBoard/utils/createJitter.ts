export function createJitter(): string {
  return Math.random().toString(36).substring(2, 4); // 2자리 랜덤 문자열 = 지터
}