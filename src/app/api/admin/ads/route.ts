// 광고 API 라우트 — GET: 활성 광고 목록, POST/PUT/DELETE: 관리자 전용
// 인증된 관리자만 변경 가능, 조회는 공개

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminFromRequest } from "@/lib/admin-auth";

// 광고 데이터 구조
export interface Ad {
  id: string;
  title: string;
  hospitalName: string;
  description: string;
  linkUrl: string;
  imageUrl: string;
  active: boolean;
  createdAt: string;
}

// 광고 데이터 저장 파일 경로
const ADS_FILE = path.join(process.cwd(), "data", "ads.json");

// 더미 초기 광고 데이터
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

function readAds(): Ad[] {
  try {
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
    return DEFAULT_ADS;
  }
}

function writeAds(ads: Ad[]): void {
  const dir = path.dirname(ADS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(ADS_FILE, JSON.stringify(ads, null, 2), "utf-8");
}

// GET — 활성 광고 목록 (공개), ?all=true면 전체 (관리자용)
export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";

  if (all) {
    const adminEmail = await verifyAdminFromRequest();
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const ads = readAds();
  const result = all ? ads : ads.filter((ad) => ad.active);
  return NextResponse.json({ ads: result });
}

// POST — 광고 등록 (관리자 전용)
export async function POST(req: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      active: body.active !== false,
      createdAt: new Date().toISOString().split("T")[0],
    };

    ads.push(newAd);
    writeAds(ads);

    return NextResponse.json({ ad: newAd }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// PUT — 광고 수정 (관리자 전용)
export async function PUT(req: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    ads[idx] = { ...ads[idx], ...body };
    writeAds(ads);

    return NextResponse.json({ ad: ads[idx] });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE — 광고 삭제 (관리자 전용)
export async function DELETE(req: NextRequest) {
  const adminEmail = await verifyAdminFromRequest();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
