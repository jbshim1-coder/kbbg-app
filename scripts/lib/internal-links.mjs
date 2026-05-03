// 내부 링크 자동 삽입 유틸리티
// 새 글의 본문에서 기존 발행 글의 제목/슬러그와 매칭되는 키워드를 찾아 링크로 교체
// 최대 3~5개, 동일 포스트 중복 링크 없음

const MAX_LINKS = 5;
const MIN_LINKS = 3;

/**
 * HTML 태그 내부의 텍스트인지 확인하기 위해 간단한 오프셋 체크는 생략하고,
 * 이미 <a> 태그 안에 있는 텍스트는 교체하지 않도록 처리함
 *
 * @param {string} contentHtml - 현재 생성된 글의 HTML 본문
 * @param {string} currentSlug - 현재 글의 slug (자기 자신 링크 방지)
 * @param {string} site - 사이트 ID (kbbg | kskindaily | koreatravel365 | dailyhallyuwave)
 * @param {object} supabaseClient - 이미 초기화된 Supabase 클라이언트
 * @returns {Promise<string>} - 내부 링크가 삽입된 HTML
 */
export async function insertInternalLinks(contentHtml, currentSlug, site, supabaseClient) {
  try {
    // 동일 사이트의 발행된 다른 글 조회 (slug, title_en만 가져와 비용 절감)
    const { data: posts, error } = await supabaseClient
      .from("blog_posts")
      .select("slug, title_en")
      .eq("site", site)
      .eq("is_published", true)
      .neq("slug", currentSlug);

    if (error || !posts || posts.length === 0) {
      console.log("Internal links: 참조할 기존 글 없음, 건너뜀");
      return contentHtml;
    }

    // 매칭 후보 생성: title_en → 링크 대상 slug
    // 짧은 단어(3자 미만)는 오탐이 많으므로 제외
    const candidates = posts
      .filter((p) => p.title_en && p.title_en.length >= 3)
      .map((p) => ({
        slug: p.slug,
        // 제목에서 관사/전치사 제거 후 핵심 구문만 매칭 키워드로 사용
        keyword: extractKeyword(p.title_en),
        original: p.title_en,
      }))
      .filter((c) => c.keyword.length >= 4); // 너무 짧은 키워드 제외

    if (candidates.length === 0) {
      return contentHtml;
    }

    // 매칭 점수 기준으로 정렬: 긴 키워드가 더 구체적이므로 우선 처리
    candidates.sort((a, b) => b.keyword.length - a.keyword.length);

    let result = contentHtml;
    let linksInserted = 0;
    const linkedSlugs = new Set();

    for (const candidate of candidates) {
      if (linksInserted >= MAX_LINKS) break;
      if (linkedSlugs.has(candidate.slug)) continue;

      // 이미 <a> 태그 안에 있는 텍스트는 건너뜀 (정규식으로 컨텍스트 확인)
      // 첫 번째 출현만 교체, HTML 태그 내부는 제외
      const replaced = replaceFirstOccurrence(result, candidate.keyword, candidate.slug, site);

      if (replaced !== result) {
        result = replaced;
        linkedSlugs.add(candidate.slug);
        linksInserted++;
      }
    }

    if (linksInserted > 0) {
      console.log(`Internal links: ${linksInserted}개 내부 링크 삽입됨`);
    }

    return result;
  } catch (e) {
    // 내부 링크 삽입 실패해도 원본 콘텐츠 반환 (핵심 기능 보호)
    console.log("Internal links error (non-fatal):", e.message);
    return contentHtml;
  }
}

/**
 * 제목에서 매칭에 사용할 핵심 키워드 추출
 * 예: "Best Korean Skincare Clinics in Seoul" → "Korean Skincare Clinics"
 */
function extractKeyword(title) {
  // 앞뒤 공백 제거 후 관사/전치사/숫자로만 된 단어 제거
  const stopWords = new Set(["a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "by", "with", "how", "what", "why", "when", "where", "is", "are", "do", "does", "guide", "best", "top"]);
  const words = title
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, "") // 특수문자 제거
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w.toLowerCase()));

  // 연속된 의미 있는 단어 2~4개를 키워드로 사용
  if (words.length === 0) return title.trim();
  if (words.length <= 3) return words.join(" ");

  // 중간 부분 최대 4단어를 핵심 구문으로 사용 (앞/뒤 관사 제외 효과)
  return words.slice(0, 4).join(" ");
}

/**
 * HTML 본문에서 키워드의 첫 번째 출현을 <a> 태그로 교체
 * - HTML 태그 속성 내부 제외
 * - 이미 <a> 태그 안에 있는 텍스트 제외
 * - 대소문자 무시 매칭
 */
function replaceFirstOccurrence(html, keyword, slug, site) {
  // 링크 경로: 모든 사이트가 /en/blog/{slug} 구조 사용
  const href = `/en/blog/${slug}`;

  // 키워드를 정규식 특수문자로부터 이스케이프
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // 단어 경계 매칭 + 대소문자 무시
  // (?!([^<]*>)) 로 태그 속성 내부 제외
  // 앞뒤로 이미 <a 태그가 감싸고 있는지 확인하기 위해 lookahead/lookbehind 활용은
  // 복잡하므로, 단순히 </a> split 방식으로 처리
  const regex = new RegExp(`(?<![\\w-])(${escaped})(?![\\w-])`, "i");

  // HTML을 <a ...>...</a> 블록 기준으로 분리해서 링크 바깥 텍스트에만 적용
  let found = false;
  const parts = splitByAnchors(html);
  const processed = parts.map((part) => {
    if (found || part.isAnchor) return part.text;
    // HTML 태그 내부(속성 값)는 건너뜀: 태그 문자열 자체인지 확인
    if (part.text.startsWith("<") && part.text.endsWith(">")) return part.text;

    const match = part.text.match(regex);
    if (match) {
      found = true;
      const linkHtml = `<a href="${href}" style="color:#0070f3;text-decoration:underline">${match[1]}</a>`;
      return part.text.replace(regex, linkHtml);
    }
    return part.text;
  });

  return processed.join("");
}

/**
 * HTML 문자열을 <a> 태그 내부 / 외부 세그먼트로 분리
 * isAnchor=true인 세그먼트는 링크 교체 대상에서 제외
 */
function splitByAnchors(html) {
  const parts = [];
  // <a ...>...</a> 패턴으로 분리 (중첩 없음 가정, 블로그 본문 기준)
  const anchorRegex = /(<a\b[^>]*>[\s\S]*?<\/a>)/gi;
  let lastIndex = 0;
  let match;

  while ((match = anchorRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      // <a> 바깥 텍스트: HTML 태그 단위로 추가 분리
      splitByTags(html.slice(lastIndex, match.index)).forEach((p) => parts.push(p));
    }
    // <a> 블록 자체
    parts.push({ text: match[0], isAnchor: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    splitByTags(html.slice(lastIndex)).forEach((p) => parts.push(p));
  }

  return parts;
}

/**
 * HTML 태그와 텍스트 노드를 분리
 * 태그 자체(isAnchor=false지만 text가 <...>)는 교체 시 건너뜀
 */
function splitByTags(html) {
  const parts = [];
  const tagRegex = /(<[^>]+>)/g;
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: html.slice(lastIndex, match.index), isAnchor: false });
    }
    parts.push({ text: match[0], isAnchor: false }); // 태그 자체는 isAnchor=false지만 < 로 시작하므로 replaceFirstOccurrence에서 건너뜀
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    parts.push({ text: html.slice(lastIndex), isAnchor: false });
  }

  return parts;
}
