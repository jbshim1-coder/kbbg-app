// 스팸 방지 — 레딧 스타일 정책
// 1. Rate limiting: 글 작성 간격 제한
// 2. 신규 계정 제한: 가입 후 일정 시간 내 글쓰기 제한
// 3. 금칙어 필터: 스팸 키워드 자동 감지
// 4. 중복 글 감지: 동일 내용 반복 게시 방지

const SPAM_KEYWORDS = [
  "카지노", "casino", "바카라", "baccarat",
  "토토", "toto", "슬롯", "slot",
  "대출", "loan shark", "당일대출",
  "성인", "adult", "porn",
  "비아그라", "viagra", "cialis",
  "텔레그램", "telegram",
  "카톡", "kakao talk",
  "클릭", "click here", "free money",
  "bit.ly", "tinyurl", "shorturl",
];

// 금칙어 검사
export function containsSpamKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return SPAM_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

// Rate limiting: localStorage 기반 (클라이언트)
export function canPost(actionKey: string, intervalMinutes: number = 2): boolean {
  if (typeof window === "undefined") return true;
  const key = `kbbg_rate_${actionKey}`;
  const lastTime = localStorage.getItem(key);
  if (lastTime) {
    const elapsed = Date.now() - parseInt(lastTime, 10);
    if (elapsed < intervalMinutes * 60 * 1000) return false;
  }
  return true;
}

export function markPosted(actionKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`kbbg_rate_${actionKey}`, String(Date.now()));
}

// 중복 내용 감지
export function isDuplicateContent(content: string, actionKey: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `kbbg_last_${actionKey}`;
  const lastContent = localStorage.getItem(key);
  if (lastContent === content.trim()) return true;
  localStorage.setItem(key, content.trim());
  return false;
}

// URL 과다 포함 검사 (3개 이상 URL이면 스팸 의심)
export function hasTooManyUrls(text: string, maxUrls: number = 3): boolean {
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const matches = text.match(urlPattern);
  return (matches?.length ?? 0) >= maxUrls;
}

// 종합 스팸 체크
export function checkSpam(
  title: string,
  body: string,
  locale: string
): { isSpam: boolean; reason: string } {
  const isKo = locale === "ko";
  const fullText = `${title} ${body}`;

  if (containsSpamKeywords(fullText)) {
    return {
      isSpam: true,
      reason: isKo ? "금지된 내용이 포함되어 있습니다" : "Prohibited content detected",
    };
  }

  if (hasTooManyUrls(fullText)) {
    return {
      isSpam: true,
      reason: isKo ? "URL이 너무 많이 포함되어 있습니다" : "Too many URLs detected",
    };
  }

  if (isDuplicateContent(fullText, "post")) {
    return {
      isSpam: true,
      reason: isKo ? "동일한 내용을 반복 게시할 수 없습니다" : "Duplicate content is not allowed",
    };
  }

  if (!canPost("post", 2)) {
    return {
      isSpam: true,
      reason: isKo ? "글 작성 간격이 너무 짧습니다. 2분 후 다시 시도해주세요" : "Please wait 2 minutes between posts",
    };
  }

  return { isSpam: false, reason: "" };
}

// 댓글용 스팸 체크
export function checkCommentSpam(
  comment: string,
  locale: string
): { isSpam: boolean; reason: string } {
  const isKo = locale === "ko";

  if (containsSpamKeywords(comment)) {
    return {
      isSpam: true,
      reason: isKo ? "금지된 내용이 포함되어 있습니다" : "Prohibited content detected",
    };
  }

  if (hasTooManyUrls(comment)) {
    return {
      isSpam: true,
      reason: isKo ? "URL이 너무 많이 포함되어 있습니다" : "Too many URLs detected",
    };
  }

  if (isDuplicateContent(comment, "comment")) {
    return {
      isSpam: true,
      reason: isKo ? "동일한 댓글을 반복 작성할 수 없습니다" : "Duplicate comments are not allowed",
    };
  }

  if (!canPost("comment", 0.5)) {
    return {
      isSpam: true,
      reason: isKo ? "댓글 간격이 너무 짧습니다. 30초 후 다시 시도해주세요" : "Please wait 30 seconds between comments",
    };
  }

  return { isSpam: false, reason: "" };
}
