"use client";

import { useState } from "react";

// 문의 유형 선택지 목록
const INQUIRY_TYPES = ["병원 정보 문의", "광고/파트너십", "서비스 오류 신고", "개인정보 관련", "기타"];

// 문의 폼 페이지 — 클라이언트 컴포넌트 (폼 상태 관리 필요)
export default function ContactPage() {
  // 폼 필드 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  // 제출 완료 여부 — true 시 감사 메시지 표시
  const [submitted, setSubmitted] = useState(false);

  // 필수 필드 모두 입력된 경우에만 제출 버튼 활성화
  const isValid = name.trim() && email.trim() && type && message.trim();

  // 폼 제출 처리 — 실제 이메일 발송 API 연동 전 로컬 상태만 업데이트
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    // TODO: 이메일 발송 API 또는 Supabase insert 호출
    setSubmitted(true);
  }

  // 제출 완료 후 감사 메시지 화면
  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">✅</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">문의가 접수되었습니다</h2>
          <p className="mt-2 text-gray-500">
            영업일 기준 1~2일 내로{" "}
            <strong>help@2bstory.com</strong>에서 답변드립니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-14">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-gray-900">문의하기</h1>
        <p className="mt-2 text-gray-500">
          궁금한 점이 있으시면 아래 양식을 작성해 주세요.
          <br />
          이메일 문의:{" "}
          <a href="mailto:help@2bstory.com" className="text-pink-500 hover:underline">
            help@2bstory.com
          </a>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* 이름 입력 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              이름 <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

          {/* 이메일 입력 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              이메일 <span className="text-pink-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

          {/* 문의 유형 선택 드롭다운 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              문의 유형 <span className="text-pink-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
            >
              <option value="">선택해 주세요</option>
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 메시지 본문 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              메시지 <span className="text-pink-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="문의 내용을 자세히 작성해 주세요."
              rows={6}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

          {/* 제출 버튼 — 유효성 검사 통과 전 비활성화 */}
          <button
            type="submit"
            disabled={!isValid}
            className="w-full rounded-xl bg-pink-500 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-pink-200 hover:bg-pink-600"
          >
            문의 보내기
          </button>
        </form>
      </div>
    </main>
  );
}
