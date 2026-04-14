// 기존 게시글의 title_en을 백필하는 일회성 스크립트
// 실행: npx tsx scripts/backfill-title-en.ts

import { readFileSync } from 'fs';
import { resolve } from 'path';

// .env.local에서 환경변수 로드
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.+)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_KEY = process.env.OPENAI_API_KEY!;

async function supabaseFetch(path: string, options?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: options?.method === 'PATCH' ? 'return=minimal' : 'return=representation',
      ...options?.headers,
    },
  });
}

async function translateToEnglish(text: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 256,
        messages: [
          { role: 'user', content: `Translate the following text to English. Return only the translated text, no explanations.\n\n${text}` },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

// 영어 감지 (라틴 문자만으로 구성)
function isEnglish(text: string): boolean {
  return !/[\uAC00-\uD7AF\u3040-\u30FF\u4E00-\u9FFF\u0E00-\u0E7F\u0400-\u04FF\u1800-\u18AF]/.test(text)
    && !/[ăơưđĂƠƯĐ]/.test(text);
}

async function main() {
  // title_en이 NULL인 게시글만 조회
  const res = await supabaseFetch('posts?title_en=is.null&select=id,title&order=created_at.desc');
  const posts = await res.json();

  if (!Array.isArray(posts) || posts.length === 0) {
    console.log('번역할 게시글 없음');
    return;
  }

  console.log(`${posts.length}개 게시글 번역 시작...`);

  for (const post of posts) {
    let titleEn: string;

    if (isEnglish(post.title)) {
      titleEn = post.title;
    } else {
      const translated = await translateToEnglish(post.title);
      if (!translated) {
        console.log(`  ❌ 번역 실패: ${post.id} — ${post.title}`);
        continue;
      }
      titleEn = translated;
    }

    // update
    const upRes = await supabaseFetch(`posts?id=eq.${post.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title_en: titleEn }),
    });

    if (upRes.ok) {
      console.log(`  ✅ ${post.title} → ${titleEn}`);
    } else {
      console.log(`  ❌ 업데이트 실패: ${post.id}`);
    }
  }

  console.log('완료!');
}

main();
