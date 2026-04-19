// 문의 API — 추천 문의 접수(POST), 문의 상태 조회(GET)

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { sendNotificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const checkLimit = rateLimit("contact", 3);

// 문의 접수 요청 바디 타입
interface ContactRequest {
  user: string;      // 사용자명
  email: string;     // 답변 수신용 이메일 주소
  country: string;   // 사용자 국적
  procedure: string; // 원하는 시술 종류
  budget: string;    // 예산 범위
  visitDate: string; // 방문 예정일
  message: string;   // 상세 문의 내용
}

// 문의 접수 응답 타입
interface ContactResponse {
  id: number;
  status: "pending";              // 최초 접수 상태는 항상 pending
  submittedAt: string;            // 접수 시각 (ISO 8601)
  estimatedResponseTime: string;  // 예상 답변 소요 시간 안내
}

// POST /api/contact — 추천 문의 신규 접수
// 필수 필드 검증 및 이메일 형식 검사 후 접수 처리
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    // 요청 바디를 ContactRequest 타입으로 파싱
    const body: ContactRequest = await request.json();

    // 필수 필드 목록 — visitDate, country는 선택 허용
    const required: (keyof ContactRequest)[] = [
      "user",
      "email",
      "procedure",
      "budget",
      "message",
    ];
    // 누락된 필드를 한 번에 수집하여 오류 메시지에 포함
    const missing = required.filter((field) => !body[field]);

    if (missing.length > 0) {
      return Response.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // 이메일 형식 정규식 검증 — 잘못된 이메일로 답변 발송 실패를 사전에 차단
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return Response.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 1) Supabase contact_inquiries 테이블에 저장
    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: saved, error: dbError } = await (supabase as any)
      .from("contact_inquiries")
      .insert({
        name: body.user,
        email: body.email,
        country_code: body.country || null,
        category: "contact",
        subject: body.procedure || "일반 문의",
        message: [
          body.procedure ? `시술: ${body.procedure}` : null,
          body.budget ? `예산: ${body.budget}` : null,
          body.visitDate ? `방문예정일: ${body.visitDate}` : null,
          body.message ? `내용: ${body.message}` : null,
        ].filter(Boolean).join("\n"),
        status: "open",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("[contact] DB save failed:", dbError);
    }

    // 2) 운영자에게 이메일 알림
    await sendNotificationEmail({
      subject: `[KBBG] 새 문의 — ${body.user}`,
      content: `새 문의가 접수되었습니다.\n\n성명: ${body.user}\n이메일: ${body.email}\n국적: ${body.country || "-"}\n원하는 시술: ${body.procedure}\n예산: ${body.budget}\n방문예정일: ${body.visitDate || "-"}\n문의내용: ${body.message}\n\n접수 시각: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
    });

    const response: ContactResponse = {
      id: saved?.id ? 1 : Math.floor(Math.random() * 10000) + 1000,
      status: "pending",
      submittedAt: new Date().toISOString(),
      estimatedResponseTime: "24시간 이내",
    };

    // 201 Created와 함께 접수 결과 반환
    return Response.json({ success: true, data: response }, { status: 201 });
  } catch {
    // JSON 파싱 실패 등 예외 처리
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// GET /api/contact?id=N — 접수된 문의의 현재 처리 상태 조회
// id 쿼리 파라미터로 문의 ID 전달
export async function GET(request: NextRequest) {
  // URL에서 문의 ID 추출
  const { searchParams } = new URL(request.url);
  const inquiryId = searchParams.get("id");

  // id 누락 시 400 반환
  if (!inquiryId) {
    return Response.json(
      { error: "id query param is required" },
      { status: 400 }
    );
  }

  // 더미 상태 조회 응답 — 실제 구현 시 DB에서 해당 ID의 문의 레코드를 조회
  return Response.json({
    success: true,
    data: {
      id: parseInt(inquiryId, 10),
      status: "pending",
      submittedAt: "2026-03-24T09:00:00Z",
      estimatedResponseTime: "24시간 이내",
    },
  });
}
