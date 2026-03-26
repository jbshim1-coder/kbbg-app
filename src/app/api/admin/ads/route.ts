// 광고 API 라우트 — GET: 활성 광고 목록, POST: 광고 등록
// 임시로 파일 기반 저장 (data/ads.json) 또는 메모리 더미 데이터 사용
// 추후 Supabase ads 테이블로 이관 가능

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 광고 데이터 구조
export interface Ad {
  id: string;
  title: string;       // 광고 제목
  hospitalName: string; // 병원명
  description: string; // 광고 설명
  linkUrl: string;     // 클릭 시 이동할 링크 URL
  imageUrl: string;    // 광고 이미지 URL (없으면 빈 문자열)
  active: boolean;     // 활성 여부 — false이면 검색 결과에 노출하지 않음
  createdAt: string;   // 등록일
}

// 광고 데이터 저장 파일 경로 — 프로젝트 루트 기준
const ADS_FILE = path.join(process.cwd(), "data", "ads.json");

// 더미 초기 광고 데이터 — 파일이 없을 때 사용
const DEFAULT_ADS: Ad[] = [
  {
    id: "ad_001",
    title: "강남뷰티성형외과 봄 이벤트",
    hospitalName: "강남뷰티성형외과",
    description: "쌍꺼풀, 코수술, 지방흡입 전문. 외국인 환자 통역 서비스 제공.",
    linkUrl: "https://example.com/gangnam-beauty",
    imageUrl: "",
    active: true,
    createdAt: "2026-03-01",
  },
];

// 광고 데이터 파일 읽기 — 없으면 더미 데이터 반환
function readAds(): Ad[] {
  try {
    // data 디렉토리가 없으면 생성
    const dir = path.dirname(ADS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(ADS_FILE)) {
      fs.writeFileSync(ADS_FILE, JSON.stringify(DEFAULT_ADS, null, 2), "utf-8");
      return DEFAULT_ADS;
    }
    const raw = fs.readFileSync(ADS_FILE, "utf-8");
    return JSON.parse(raw) as Ad[];
  } catch {
    // 파일 읽기 실패 시 더미 데이터로 폴백
    return DEFAULT_ADS;
  }
}

// 광고 데이터 파일 쓰기
function writeAds(ads: Ad[]): void {
  const dir = path.dirname(ADS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(ADS_FILE, JSON.stringify(ads, null, 2), "utf-8");
}

// GET /api/admin/ads — 활성 광고 목록 반환
// ?all=true 이면 비활성 광고 포함 전체 반환 (관리자용)
export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";
  const ads = readAds();
  const result = all ? ads : ads.filter((ad) => ad.active);
  return NextResponse.json({ ads: result });
}

// POST /api/admin/ads — 광고 등록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ads = readAds();

    const newAd: Ad = {
      id: `ad_${Date.now()}`,
      title: body.title || "",
      hospitalName: body.hospitalName || "",
      description: body.description || "",
      linkUrl: body.linkUrl || "",
      imageUrl: body.imageUrl || "",
      active: body.active !== false, // 기본값 true
      createdAt: new Date().toISOString().split("T")[0],
    };

    ads.push(newAd);
    writeAds(ads);

    return NextResponse.json({ ad: newAd }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// PUT /api/admin/ads — 광고 수정
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const ads = readAds();
    const idx = ads.findIndex((a) => a.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    // 기존 데이터에 변경 필드만 덮어씀
    ads[idx] = { ...ads[idx], ...body };
    writeAds(ads);

    return NextResponse.json({ ad: ads[idx] });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE /api/admin/ads?id=xxx — 광고 삭제
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const ads = readAds();
  const filtered = ads.filter((a) => a.id !== id);
  if (filtered.length === ads.length) {
    return NextResponse.json({ error: "Ad not found" }, { status: 404 });
  }

  writeAds(filtered);
  return NextResponse.json({ success: true });
}
