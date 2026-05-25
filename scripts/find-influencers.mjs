#!/usr/bin/env node
// YouTube Data API로 뷰티 인플루언서 수집 (구독자 수 검증)
// 기준: 구독자 10,000명 이상 + 채널 설명에 공개 이메일
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

const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!YOUTUBE_KEY) {
  console.error('❌ YOUTUBE_API_KEY 환경변수 없음');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 최소 구독자 수 기준
const MIN_SUBSCRIBERS = 1000;

// 국가별 검색 설정
const TARGETS = [
  { country: 'JP', language: 'ja', queries: ['k-beauty Japan', 'korean skincare Japan', 'k뷰티 일본'] },
  { country: 'TH', language: 'th', queries: ['k-beauty Thailand', 'korean skincare Thailand', 'เคบิวตี้'] },
  { country: 'VN', language: 'vi', queries: ['k-beauty Vietnam', 'korean skincare Vietnam', 'làm đẹp Hàn Quốc'] },
  { country: 'US', language: 'en', queries: ['k-beauty USA', 'korean skincare routine', 'korean beauty review'] },
  { country: 'GB', language: 'en', queries: ['k-beauty UK', 'korean skincare UK', 'korean beauty blogger UK'] },
  { country: 'ID', language: 'id', queries: ['k-beauty Indonesia', 'skincare korea Indonesia', 'kecantikan korea'] },
  { country: 'MY', language: 'ms', queries: ['k-beauty Malaysia', 'skincare korea Malaysia', 'kecantikan Korea'] },
  { country: 'PH', language: 'en', queries: ['k-beauty Philippines', 'korean skincare Philippines'] },
  { country: 'AU', language: 'en', queries: ['k-beauty Australia', 'korean skincare Australia'] },
  { country: 'FR', language: 'fr', queries: ['k-beauty France', 'soin coréen', 'beauté coréenne'] },
  { country: 'DE', language: 'de', queries: ['k-beauty Deutschland', 'koreanische Hautpflege'] },
  { country: 'BR', language: 'pt', queries: ['k-beauty Brasil', 'skincare coreano', 'beleza coreana'] },
];

const EMAIL_RE = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
const SKIP_DOMAINS = new Set(['example.com','gmail.com','youtube.com','google.com','noreply.com']);
const SKIP_PREFIXES = new Set(['noreply','no-reply','donotreply','support','info','hello','contact','team']);

function extractEmails(text) {
  if (!text) return [];
  return [...new Set(
    [...text.matchAll(EMAIL_RE)]
      .map(m => m[0].toLowerCase())
      .filter(email => {
        const [prefix, domain] = email.split('@');
        // 개인 연락처 이메일만 (info@, support@ 등도 허용 - 협업 문의는 이런 주소로)
        if (SKIP_DOMAINS.has(domain)) return false;
        if (['noreply','no-reply','donotreply','postmaster','abuse','mailer'].includes(prefix)) return false;
        return true;
      })
  )];
}

function formatSubscribers(count) {
  if (count >= 1000000) return `${(count/1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count/1000).toFixed(0)}K`;
  return String(count);
}

// YouTube 채널 검색
async function searchChannels(query, maxResults = 20) {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_KEY}&q=${encodeURIComponent(query)}&type=channel&part=snippet&maxResults=${maxResults}&relevanceLanguage=en`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return (json.items || []).map(item => item.snippet.channelId).filter(Boolean);
}

// 채널 상세 정보 (구독자 수 + 설명 포함)
async function getChannelDetails(channelIds) {
  if (!channelIds.length) return [];
  const ids = channelIds.slice(0, 50).join(',');
  const url = `https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_KEY}&id=${ids}&part=snippet,statistics,brandingSettings&maxResults=50`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return json.items || [];
}

async function saveProspect({ name, email, channelUrl, countryCode, language, subscribers, channelId }) {
  const { error } = await supabase
    .from('influencer_outreach')
    .upsert(
      {
        name,
        email,
        platform: 'youtube',
        channel_url: channelUrl,
        subscribers: subscribers,
        country_code: countryCode,
        language,
        source_url: channelUrl,
        niche: 'k-beauty',
        status: 'found',
      },
      { onConflict: 'email', ignoreDuplicates: true }
    );
  if (error && !error.message?.includes('duplicate') && !error.message?.includes('unique')) {
    console.warn(`  저장 오류 (${email}):`, error.message);
    return false;
  }
  return true;
}

async function processTarget(target) {
  console.log(`\n🔍 [${target.country}] YouTube 인플루언서 검색`);

  const allChannelIds = new Set();

  for (const query of target.queries) {
    try {
      const ids = await searchChannels(query);
      ids.forEach(id => allChannelIds.add(id));
      await new Promise(r => setTimeout(r, 3000)); // 분당 할당량 방지
    } catch (err) {
      console.warn(`  검색 실패 (${query}): ${err.message}`);
    }
  }

  console.log(`  채널 ${allChannelIds.size}개 발견, 상세 조회 중...`);

  const channels = await getChannelDetails([...allChannelIds]);
  let saved = 0;

  for (const ch of channels) {
    const subscriberCount = parseInt(ch.statistics?.subscriberCount || '0');
    const isHidden = ch.statistics?.hiddenSubscriberCount;

    // 구독자 수 기준 미달 스킵
    if (!isHidden && subscriberCount < MIN_SUBSCRIBERS) continue;

    const name = ch.snippet?.title || '';
    const description = ch.snippet?.description || '';
    const channelUrl = `https://www.youtube.com/channel/${ch.id}`;
    const subLabel = isHidden ? '비공개' : formatSubscribers(subscriberCount);

    // 채널 설명에서 이메일 추출
    const emails = extractEmails(description);

    if (!emails.length) continue;

    console.log(`  ✓ ${name} (구독자 ${subLabel})`);

    for (const email of emails) {
      const ok = await saveProspect({
        name,
        email,
        channelUrl,
        countryCode: target.country,
        language: target.language,
        subscribers: subLabel,
        channelId: ch.id,
      });
      if (ok) {
        saved++;
        console.log(`    📧 ${email}`);
      }
    }
  }

  return saved;
}

async function main() {
  console.log(`🎥 YouTube 인플루언서 이메일 수집 시작 (구독자 ${formatSubscribers(MIN_SUBSCRIBERS)} 이상)\n`);

  const countryArg = process.argv[2]?.toUpperCase();
  const targets = countryArg ? TARGETS.filter(t => t.country === countryArg) : TARGETS;

  if (!targets.length) {
    console.error(`국가 코드 없음. 가능: ${TARGETS.map(t => t.country).join(', ')}`);
    process.exit(1);
  }

  let total = 0;
  for (const target of targets) {
    total += await processTarget(target);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n🎉 완료: 총 ${total}개 저장 (구독자 ${formatSubscribers(MIN_SUBSCRIBERS)} 이상 + 이메일 공개)`);
}

main().catch(err => { console.error(err); process.exit(1); });
