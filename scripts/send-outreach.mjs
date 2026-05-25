#!/usr/bin/env node
// 발견된 인플루언서에게 Claude로 개인화 이메일 생성 + Resend 발송
// 사용: node scripts/send-outreach.mjs [최대발송수 기본20]

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const MAX_PER_RUN = parseInt(process.argv[2] || '20');

// Resend 도메인 인증 전: onboarding@resend.dev 사용
// 도메인 인증 후: outreach@kbeautybuyersguide.com 으로 변경
const FROM_EMAIL = 'KBBG Team <onboarding@resend.dev>';

const LANG_NAMES = {
  ja: '日本語', th: 'ภาษาไทย', vi: 'Tiếng Việt', zh: '中文(简体)',
  en: 'English', id: 'Bahasa Indonesia', ms: 'Bahasa Melayu',
  fr: 'Français', de: 'Deutsch', pt: 'Português', es: 'Español',
  ru: 'Русский', ko: '한국어',
};

const PLATFORM_LABELS = { youtube: 'YouTube channel', instagram: 'Instagram', blog: 'blog', tiktok: 'TikTok' };

async function generateEmail(prospect) {
  const lang = prospect.language || 'en';
  const langName = LANG_NAMES[lang] || 'English';
  const platformLabel = PLATFORM_LABELS[prospect.platform] || 'content';

  const prompt = `You are writing a collaboration outreach email for KBBG (K-Beauty Buyers Guide) — a platform that helps international visitors find trusted Korean beauty clinics and medical tourism services.

Write a personalized outreach email in ${langName} to this beauty influencer:
- Name: ${prospect.name || 'Beauty Creator'}
- Platform: ${prospect.platform || 'blog'}
- Country: ${prospect.country_code || ''}

The collaboration offer from KBBG:
- We offer FREE Korean beauty treatments in Seoul (options: skincare, laser treatment, fillers, or minor cosmetic procedures at top-rated clinics)
- All travel/accommodation not included, but the treatment itself is fully covered
- In return: one honest post/video about their experience (any platform)
- No script, genuine experience only

Email requirements:
- Write entirely in ${langName}
- Tone: warm, genuine, peer-to-peer (not corporate or pushy)
- Mention you discovered their ${platformLabel} and were impressed
- Keep it brief (150–200 words max)
- End with a clear invitation to reply if interested

Return ONLY valid JSON (no markdown):
{"subject":"...","body":"..."}`;

  const resp = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 700,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = resp.content[0].text.trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Claude 응답 파싱 실패: ${text.slice(0, 100)}`);
  return JSON.parse(match[0]);
}

function buildHtml(body) {
  const paragraphs = body
    .split('\n')
    .filter(l => l.trim())
    .map(l => `<p style="margin:0 0 14px">${l}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html><body style="font-family:sans-serif;font-size:15px;color:#222;max-width:600px;margin:0 auto;padding:24px;line-height:1.7">
${paragraphs}
<hr style="border:none;border-top:1px solid #eee;margin:28px 0"/>
<p style="font-size:12px;color:#999;margin:0">
  KBBG · <a href="https://kbeautybuyersguide.com" style="color:#999">kbeautybuyersguide.com</a><br/>
  To unsubscribe, reply with "unsubscribe"
</p>
</body></html>`;
}

async function main() {
  console.log(`📧 아웃리치 이메일 발송 시작 (최대 ${MAX_PER_RUN}건)\n`);

  const { data: prospects, error } = await supabase
    .from('influencer_outreach')
    .select('*')
    .eq('status', 'found')
    .is('email_sent_at', null)
    .limit(MAX_PER_RUN);

  if (error) { console.error('DB 조회 실패:', error.message); process.exit(1); }
  if (!prospects?.length) { console.log('발송 대상 없음 (status=found 레코드 없음)'); return; }

  console.log(`발송 대상: ${prospects.length}명\n`);

  let sent = 0, failed = 0;
  for (const p of prospects) {
    try {
      process.stdout.write(`[${p.country_code || '??'}] ${p.email} ... `);

      const { subject, body } = await generateEmail(p);
      const { data, error: sendErr } = await resend.emails.send({
        from: FROM_EMAIL,
        to: p.email,
        reply_to: 'jbshim1@gmail.com',
        subject,
        html: buildHtml(body),
      });

      if (sendErr) throw new Error(sendErr.message);

      await supabase
        .from('influencer_outreach')
        .update({
          status: 'emailed',
          email_sent_at: new Date().toISOString(),
          email_subject: subject,
          email_body: body,
          resend_email_id: data.id,
        })
        .eq('id', p.id);

      console.log(`✅ ${subject.slice(0, 50)}`);
      sent++;
      await new Promise(r => setTimeout(r, 2500));
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 완료: ${sent}건 발송, ${failed}건 실패`);
}

main().catch(err => { console.error(err); process.exit(1); });
