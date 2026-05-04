import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SLUG = 'botox-injections-korea-guide';
const TITLE_LANGUAGES = ['ko', 'ja', 'zh', 'vi', 'th', 'ru', 'mn'];
const CONTENT_LANGUAGES = ['ko', 'ja', 'zh', 'vi', 'th', 'ru', 'mn'];

const LANGUAGE_NAMES = {
  ko: '한국어 (Korean)',
  ja: '일본어 (Japanese)',
  zh: '중국어 간체 (Simplified Chinese)',
  vi: '베트남어 (Vietnamese)',
  th: '태국어 (Thai)',
  ru: '러시아어 (Russian)',
  mn: '몽골어 (Mongolian)',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

async function translateTitle(titleEn, lang) {
  const langName = LANGUAGE_NAMES[lang];
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Translate the following blog post title into ${langName}. Return ONLY the translated title, no explanations or quotes.\n\nTitle: ${titleEn}`,
      },
    ],
  });
  return message.content[0].text.trim();
}

async function translateContent(contentEn, lang) {
  const langName = LANGUAGE_NAMES[lang];
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `Translate the following blog post content into ${langName}. Preserve all HTML tags, markdown formatting, and structure exactly. Return ONLY the translated content.\n\n${contentEn}`,
      },
    ],
  });
  return message.content[0].text.trim();
}

async function main() {
  // 1. 현재 데이터 조회
  console.log(`[1/3] slug="${SLUG}" 조회 중...`);
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title_en, content_en')
    .eq('slug', SLUG)
    .single();

  if (error || !data) {
    console.error('조회 실패:', error);
    process.exit(1);
  }

  console.log(`조회 성공 — id: ${data.id}`);
  console.log(`title_en: ${data.title_en}`);
  console.log(`content_en 길이: ${data.content_en?.length ?? 0}자\n`);

  // 2. 제목 번역 (haiku)
  console.log('[2/3] 제목 번역 시작 (claude-haiku-4-5)...');
  const titleUpdates = {};
  for (const lang of TITLE_LANGUAGES) {
    process.stdout.write(`  title_${lang} 번역 중... `);
    const translated = await translateTitle(data.title_en, lang);
    titleUpdates[`title_${lang}`] = translated;
    console.log(`완료 → ${translated}`);
  }

  // 3. 본문 번역 (sonnet)
  console.log('\n[3/3] 본문 번역 시작 (claude-sonnet-4-5)...');
  const contentUpdates = {};
  for (const lang of CONTENT_LANGUAGES) {
    process.stdout.write(`  content_${lang} 번역 중... `);
    const translated = await translateContent(data.content_en, lang);
    contentUpdates[`content_${lang}`] = translated;
    console.log(`완료 (${translated.length}자)`);
  }

  // 4. Supabase UPDATE
  console.log('\n[UPDATE] Supabase 저장 중...');
  const { error: updateError } = await supabase
    .from('blog_posts')
    .update({ ...titleUpdates, ...contentUpdates })
    .eq('id', data.id);

  if (updateError) {
    console.error('UPDATE 실패:', updateError);
    process.exit(1);
  }

  console.log('\n모든 번역 저장 완료!');

  // 5. 결과 확인
  const { data: result } = await supabase
    .from('blog_posts')
    .select('title_ko, title_ja, title_zh, title_vi, title_th, title_ru, title_mn')
    .eq('id', data.id)
    .single();

  console.log('\n[결과 확인]');
  for (const lang of TITLE_LANGUAGES) {
    console.log(`  title_${lang}: ${result[`title_${lang}`]}`);
  }
}

main().catch((err) => {
  console.error('오류 발생:', err);
  process.exit(1);
});
