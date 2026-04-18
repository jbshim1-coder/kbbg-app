// IP 기반 인메모리 rate limiter
// 서버리스 환경(Vercel)에서는 프로세스 재시작 시 초기화됨 — 기본적인 남용 방지용
const limiters = new Map<string, Map<string, { count: number; resetAt: number }>>();

export function rateLimit(name: string, maxPerMinute: number) {
  if (!limiters.has(name)) limiters.set(name, new Map());
  const map = limiters.get(name)!;

  return (ip: string): boolean => {
    const now = Date.now();
    const record = map.get(ip);
    if (!record || now > record.resetAt) {
      map.set(ip, { count: 1, resetAt: now + 60000 });
      return true;
    }
    if (record.count >= maxPerMinute) return false;
    record.count++;
    return true;
  };
}
