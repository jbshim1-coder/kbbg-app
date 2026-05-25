#!/usr/bin/env node
// 구글 Custom Search로 뷰티 인플루언서 공개 이메일 수집
// 사용: node scripts/find-influencers.mjs [국가코드 예: JP]

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const content = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
    for (const line of content.split('\n')) {
      const eq = line.indexOf('=');
      if (eq > 0) process.env[line.slice(0, eq).trim()] ??= line.slice(eq + 1).trim();
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX;

if (!GOOGLE_KEY || !GOOGLE_CX) {
  console.error('❌ GOOGLE_SEARCH_API_KEY 또는 GOOGLE_SEARCH_CX 환경변수 없음');
  console.error('   .env.local에 추가 후 다시 실행하세요');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 국가별 검색 대상
const TARGETS = [
  { country: 'JP', language: 'ja', query: 'k-beauty blogger japan contact email' },
  { country: 'TH', language: 'th', query: 'k-beauty blogger thailand contact email' },
  { country: 'VN', language: 'vi', query: '"korean beauty" blogger vietnam contact email' },
  { country: 'CN', language: 'zh', query: 'k-beauty blogger china contact email' },
  { country: 'US', language: 'en', query: 'k-beauty influencer usa contact email' },
  { country: 'GB', language: 'en', query: 'k-beauty blogger uk contact email' },
  { country: 'AU', language: 'en', query: 'k-beauty blogger australia contact email' },
  { country: 'PH', language: 'en', query: '"korean beauty" blogger philippines contact email' },
  { country: 'ID', language: 'id', query: '"korean beauty" blogger indonesia contact email' },
  { country: 'MY', language: 'ms', query: 'k-beauty blogger malaysia contact email' },
  { country: 'SG', language: 'en', query: 'k-beauty blogger singapore contact email' },
  { country: 'FR', language: 'fr', query: 'k-beauty blogger france contact email' },
  { country: 'DE', language: 'de', query: 'k-beauty blogger germany contact email' },
  { country: 'BR', language: 'pt', query: '"korean beauty" blogger brasil contato email' },
  { country: 'MX', language: 'es', query: 'k-beauty blogger mexico contacto email' },
  { country: 'RU', language: 'ru', query: 'k-beauty blogger russia contact email' },
];

const EMAIL_RE = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
const SKIP_DOMAINS = new Set(['example.com','test.com','domain.com','sentry.io','github.com','cloudflare.com','w3schools.com','schema.org']);
const SKIP_PREFIXES = new Set(['noreply','no-reply','donotreply','unsubscribe','bounce','postmaster','abuse','webmaster','mailer-daemon']);

function isValidEmail(email) {
  const at = email.lastIndexOf('@');
  const domain = email.slice(at + 1).toLowerCase();
  const prefix = email.slice(0, at).toLowerCase();
  if (SKIP_DOMAINS.has(domain)) return false;
  if (SKIP_PREFIXES.has(prefix)) return false;
  if (!domain.includes('.')) return false;
  return true;
}

async function googleSearch(query) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=10`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.items || [];
}

async function fetchPage(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KBBGBot/1.0; +https://kbeautybuyersguide.com)' },
    });
    clearTimeout(t);
    if (!res.ok) return '';
    const text = await res.text();
    return text.slice(0, 80000);
  } catch {
    return '';
  }
}

async function saveProspect({ name, email, platform, channelUrl, countryCode, language, sourceUrl }) {
  const { error } = await supabase
    .from('influencer_outreach')
    .upsert(
      { name: name || email.split('@')[0], email, platform: platform || 'blog', channel_url: channelUrl || sourceUrl, country_code: countryCode, language, source_url: sourceUrl, status: 'found' },
      { onConflict: 'email', ignoreDuplicates: true }
    );
  if (error && !error.message?.includes('duplicate') && !error.message?.includes('unique')) {
    console.warn(`  저장 오류 (${email}):`, error.message);
    return false;
  }
  return true;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function processTarget(target) {
  console.log(`\n🔍 [${target.country}] ${target.query}`);

  let items;
  try {
    items = await googleSearch(target.query);
  } catch (err) {
    console.error(`  검색 실패: ${err.message}`);
    return 0;
  }
  console.log(`  ${items.length}개 페이지 발견`);

  let saved = 0;
  for (const item of items) {
    await sleep(2500);
    console.log(`  📄 ${item.link.slice(0, 70)}`);

    const html = await fetchPage(item.link);
    if (!html) continue;

    const emails = [...new Set(
      [...html.matchAll(EMAIL_RE)]
        .map(m => m[0].toLowerCase())
        .filter(isValidEmail)
    )];

    for (const email of emails) {
      const ok = await saveProspect({
        name: (item.title || '').split(/[-|·]/)[0].trim().slice(0, 80),
        email,
        platform: 'blog',
        channelUrl: item.link,
        countryCode: target.country,
        language: target.language,
        sourceUrl: item.link,
      });
      if (ok) {
        saved++;
        console.log(`  ✅ ${email}`);
      }
    }
  }
  return saved;
}

async function main() {
  console.log('🌏 인플루언서 이메일 수집 시작\n');
  const countryArg = process.argv[2]?.toUpperCase();
  const targets = countryArg ? TARGETS.filter(t => t.country === countryArg) : TARGETS;

  if (!targets.length) {
    console.error(`국가 코드 없음. 가능: ${TARGETS.map(t => t.country).join(', ')}`);
    process.exit(1);
  }

  let total = 0;
  for (const target of targets) {
    total += await processTarget(target);
    await sleep(3000);
  }
  console.log(`\n🎉 완료: 총 ${total}개 저장`);
}

main().catch(err => { console.error(err); process.exit(1); });
