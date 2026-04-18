// XSS/링크 인젝션 방지 — https/http 프로토콜만 허용
export function safeUrl(url: string): string {
  try {
    const u = new URL(url);
    return ["https:", "http:"].includes(u.protocol) ? url : "#";
  } catch {
    return "#";
  }
}
