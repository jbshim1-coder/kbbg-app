// 클리닉 데이터 정비 스크립트
// 1. 진료과목 자동 분류 (이름 기반)
// 2. 영어지원 여부 마킹 (위치 기반)
// 3. 영어 이름 번역 (Claude API)

import Anthropic from "@anthropic-ai/sdk";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SPECIALTY_RULES = [
  { keywords: ["성형"], specialty: "Plastic Surgery", specialty_ko: "성형외과" },
  { keywords: ["피부"], specialty: "Dermatology", specialty_ko: "피부과" },
  { keywords: ["라식", "라섹", "안과"], specialty: "Ophthalmology", specialty_ko: "안과" },
  { keywords: ["치과", "임플란트", "교정"], specialty: "Dental", specialty_ko: "치과" },
  { keywords: ["탈모", "모발", "발모"], specialty: "Hair Clinic", specialty_ko: "모발클리닉" },
  { keywords: ["비만", "다이어트"], specialty: "Weight Loss", specialty_ko: "비만클리닉" },
];

const ENGLISH_DISTRICTS = ["강남구", "서초구", "마포구", "종로구", "중구", "용산구", "송파구"];

function detectSpecialty(name) {
  for (const rule of SPECIALTY_RULES) {
    if (rule.keywords.some(k => name.includes(k))) return rule;
  }
  return null;
}

function shouldSupportEnglish(sido, sggu) {
  if (sido !== "서울" && sido !== "부산") return false;
  return ENGLISH_DISTRICTS.some(d => (sggu || "").includes(d));
}

async function translateNames(clinics) {
  const names = clinics.map(c => c.name).join("\n");
  const prompt = `Translate these Korean clinic names to natural English. Keep the clinic type (e.g., "Clinic", "Hospital"). Return only translations, one per line, same order.

${names}`;

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content[0].text.trim().split("\n");
}

async function sbUpdate(id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clinics?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function fetchBatch(offset, limit = 100) {
  const keywords = ["성형", "피부"];
  const orFilter = keywords.map(k => `name.like.*${k}*`).join(",");
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/clinics?select=id,name,sido_cd_nm,sggu_cd_nm&is_active=eq.true&or=(${encodeURIComponent(orFilter)})&limit=${limit}&offset=${offset}`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function main() {
  console.log("클리닉 데이터 정비 시작...");

  let offset = 0;
  let totalUpdated = 0;
  const BATCH = 30; // Claude 번역 배치 크기

  while (true) {
    const clinics = await fetchBatch(offset, BATCH);
    if (!Array.isArray(clinics) || clinics.length === 0) break;

    console.log(`\n[${offset}~${offset + clinics.length}] 처리 중...`);

    // 1. 영어 이름 번역
    let translations = [];
    try {
      translations = await translateNames(clinics);
    } catch (e) {
      console.warn("번역 실패, 원본 이름 사용:", e.message);
      translations = clinics.map(c => c.name);
    }

    // 2. 각 클리닉 업데이트
    for (let i = 0; i < clinics.length; i++) {
      const c = clinics[i];
      const specialty = detectSpecialty(c.name);
      const supportsEnglish = shouldSupportEnglish(c.sido_cd_nm, c.sggu_cd_nm);
      const nameEn = (translations[i] || c.name).trim();

      const updateData = {
        name_en: nameEn,
        supports_english: supportsEnglish,
        dgsbjt_cd_nm: specialty?.specialty_ko || null,
      };

      try {
        await sbUpdate(c.id, updateData);
        totalUpdated++;
        if (totalUpdated % 10 === 0) process.stdout.write(`\r  업데이트: ${totalUpdated}개`);
      } catch (e) {
        console.warn(`\n  실패 (${c.name}):`, e.message);
      }
    }

    if (clinics.length < BATCH) break;
    offset += BATCH;
    // API 과부하 방지
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n\n✅ 완료! 총 ${totalUpdated}개 클리닉 정비됨`);
}

main().catch(e => { console.error("오류:", e.message); process.exit(1); });
