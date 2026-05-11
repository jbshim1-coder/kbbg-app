// 해시태그 일괄 번역 스크립트 — Claude API 사용
// 실행: cd /home/ubuntu/kbbg-app && node scripts/translate-hashtags.js

const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LANGS = {
  zh: '중국어 간체 (中文简体)',
  ja: '일본어 (日本語)',
  vi: '베트남어 (Tiếng Việt)',
  th: '태국어 (ภาษาไทย)',
  ru: '러시아어 (Русский)',
  mn: '몽골어 (Монгол)',
};

async function translateHashtags(hashtags, langCode, langName) {
  const hashtagList = hashtags.join('\n');
  const msg = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `다음 영어 해시태그들을 ${langName}로 번역해주세요.
- 해시태그 형식 유지 (#로 시작, 공백 없음)
- 의미를 살려 자연스럽게 번역
- 각 줄에 하나씩, 원본과 동일한 순서로

${hashtagList}

번역 결과만 출력 (설명 없이):`,
    }],
  });

  const lines = msg.content[0].text.trim().split('\n').map(l => l.trim()).filter(l => l.startsWith('#'));
  const result = {};
  hashtags.forEach((tag, i) => {
    result[tag] = lines[i] || tag; // 번역 실패 시 원본 유지
  });
  return result;
}

async function main() {
  console.log('1. DB에서 모든 해시태그 수집...');
  const { data } = await sb.from('blog_posts').select('hashtags').eq('is_published', true);
  const allTags = new Set();
  data?.forEach(p => p.hashtags?.forEach(t => allTags.add(t)));
  const hashtagList = [...allTags];
  console.log(`   고유 해시태그: ${hashtagList.length}개`);

  const translations = { en: {} };
  hashtagList.forEach(t => (translations.en[t] = t));

  console.log('2. 언어별 번역 시작...');
  for (const [langCode, langName] of Object.entries(LANGS)) {
    process.stdout.write(`   ${langCode} (${langName}) 번역 중...`);
    translations[langCode] = await translateHashtags(hashtagList, langCode, langName);
    console.log(' 완료');
  }

  console.log('3. 번역 파일 저장...');
  // 3개 블로그 모두에 저장
  const outputContent = `// 자동 생성 — scripts/translate-hashtags.js로 재생성 가능
// ${new Date().toISOString()}

export const HASHTAG_TRANSLATIONS: Record<string, Record<string, string>> = ${JSON.stringify(translations, null, 2)};

export function localizeHashtags(hashtags: string[], lang: string): string[] {
  const map = HASHTAG_TRANSLATIONS[lang] || HASHTAG_TRANSLATIONS.en;
  return hashtags.map(tag => map[tag] || tag);
}
`;

  const dirs = [
    '/home/ubuntu/kskindaily/app/lib',
    '/home/ubuntu/dailyhallyuwave/app/lib',
    '/home/ubuntu/koreatravel365/app/lib',
  ];
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, 'hashtag-translations.ts'), outputContent);
      console.log(`   저장: ${dir}/hashtag-translations.ts`);
    }
  }
  console.log('완료!');
}

main().catch(console.error);
