// 레벨별 필요 포인트 임계값
export const LEVEL_THRESHOLDS = [
  { level: 0, points: 0 },
  { level: 1, points: 10 },
  { level: 2, points: 30 },
  { level: 3, points: 100 },
  { level: 4, points: 250 },
  { level: 5, points: 500 },
  { level: 6, points: 800 },
  { level: 7, points: 1200 },
  { level: 8, points: 1800 },
  { level: 9, points: 2400 },
  { level: 10, points: 3000 },
  { level: 11, points: 4000 },
  { level: 12, points: 5000 },
  { level: 13, points: 6500 },
  { level: 14, points: 8000 },
  { level: 15, points: 10000 },
  { level: 16, points: 13000 },
  { level: 17, points: 16000 },
  { level: 18, points: 20000 },
  { level: 19, points: 25000 },
  { level: 20, points: 30000 },
  { level: 21, points: 38000 },
  { level: 22, points: 47000 },
  { level: 23, points: 57000 },
  { level: 24, points: 68000 },
  { level: 25, points: 80000 },
  { level: 26, points: 100000 },
  { level: 27, points: 130000 },
  { level: 28, points: 160000 },
  { level: 29, points: 180000 },
  { level: 30, points: 200000 },
];

// 포인트 획득 액션별 지급량
export const POINT_ACTIONS = {
  POST_WRITE: 5,
  COMMENT_WRITE: 2,
  POST_UPVOTE_RECEIVED: 3,
  COMMENT_UPVOTE_RECEIVED: 1,
  DAILY_CHECK: 1,
  AI_RECOMMEND_USE: 2,
  REVIEW_WITH_PHOTO: 10,
};

// 마스터 여부 확인 — 서버 전용 환경변수(ADMIN_EMAILS)에서만 읽음
export function isMaster(email: string): boolean {
  const envEmails = typeof process !== "undefined" && process.env?.ADMIN_EMAILS;
  if (!envEmails) return false;
  const adminList = envEmails.split(",").map(e => e.trim());
  return adminList.includes(email);
}

// 포인트 → 레벨 변환 (1~30, 마스터는 "M")
export function getLevel(points: number): number {
  let level = 0;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (points >= threshold.points) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
}

// 현재 레벨에서 다음 레벨까지 남은 포인트 계산
export function getPointsToNextLevel(points: number): { current: number; next: number; remaining: number } | null {
  const currentLevel = getLevel(points);
  if (currentLevel >= 30) return null;

  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);
  if (!nextThreshold) return null;

  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel);
  return {
    current: currentThreshold?.points ?? 0,
    next: nextThreshold.points,
    remaining: nextThreshold.points - points,
  };
}

// 레벨별 배경색·텍스트 색상 (Tailwind 클래스)
export function getLevelColor(level: number | "M"): string {
  if (level === "M") return "bg-red-600 text-white";
  if (level >= 25) return "bg-purple-600 text-white";
  if (level >= 20) return "bg-yellow-500 text-white";
  if (level >= 15) return "bg-blue-600 text-white";
  if (level >= 10) return "bg-green-600 text-white";
  if (level >= 5) return "bg-teal-500 text-white";
  return "bg-gray-200 text-gray-600";
}
