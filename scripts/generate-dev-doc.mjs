#!/usr/bin/env node
// 개발 문서 Word 파일 생성 스크립트
// 실행: node scripts/generate-dev-doc.mjs
// 결과: D:\backup\01.kbbg\docs\KBBG_개발문서_YYYYMMDD_HHMMSS.docx

import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from "docx";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const PROJECT_DIR = "/home/jbshi/kbbg-app";
const BACKUP_DIR = "/mnt/d/backup/01.kbbg/docs";
const now = new Date();
const KST = new Date(now.getTime() + 9 * 60 * 60 * 1000);
const timestamp = KST.toISOString().replace(/[-:T]/g, "").slice(0, 15).replace(/(\d{8})(\d{6})/, "$1_$2");

// 폴더 생성
if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });

// 1. DEV_LOG.md 읽기
let devLog = "";
try { devLog = readFileSync(join(PROJECT_DIR, "docs/DEV_LOG.md"), "utf-8"); } catch { devLog = "(DEV_LOG.md 없음)"; }

// 2. IMPLEMENTATION_PLAN.md 읽기
let implPlan = "";
try { implPlan = readFileSync(join(PROJECT_DIR, "docs/IMPLEMENTATION_PLAN.md"), "utf-8"); } catch { implPlan = "(IMPLEMENTATION_PLAN.md 없음)"; }

// 3. Git 최근 커밋 50개
let gitLog = "";
try { gitLog = execSync("git log --oneline -50", { cwd: PROJECT_DIR, encoding: "utf-8" }); } catch { gitLog = "(git log 실패)"; }

// 4. 프로젝트 구조
let tree = "";
try { tree = execSync("find src -type f -name '*.tsx' -o -name '*.ts' | sort | head -80", { cwd: PROJECT_DIR, encoding: "utf-8" }); } catch { tree = "(구조 조회 실패)"; }

// 5. 환경변수 목록 (값 제외, 키만)
let envKeys = "";
try {
  const envFile = readFileSync(join(PROJECT_DIR, ".env.local"), "utf-8");
  envKeys = envFile.split("\n").filter(l => l.includes("=")).map(l => l.split("=")[0]).join("\n");
} catch { envKeys = "(env 조회 실패)"; }

// 6. package.json 의존성
let deps = "";
try {
  const pkg = JSON.parse(readFileSync(join(PROJECT_DIR, "package.json"), "utf-8"));
  deps = Object.entries({ ...pkg.dependencies, ...pkg.devDependencies }).map(([k, v]) => `${k}: ${v}`).join("\n");
} catch { deps = "(package.json 조회 실패)"; }

// MD 텍스트를 Paragraph 배열로 변환
function mdToParagraphs(md) {
  return md.split("\n").map(line => {
    if (line.startsWith("# ")) return new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 });
    if (line.startsWith("## ")) return new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 });
    if (line.startsWith("### ")) return new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3 });
    if (line.startsWith("---")) return new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 1 } }, text: "" });
    if (line.startsWith("- ") || line.startsWith("* ")) return new Paragraph({ text: line, bullet: { level: 0 } });
    if (line.startsWith("| ")) return new Paragraph({ children: [new TextRun({ text: line, font: "Consolas", size: 18 })] });
    return new Paragraph({ text: line });
  });
}

// Word 문서 생성
const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: "K-Beauty Buyers Guide — 개발 문서", bold: true, size: 36, font: "맑은 고딕" })], heading: HeadingLevel.TITLE }),
        new Paragraph({ text: `생성일시: ${KST.toISOString().slice(0, 19).replace("T", " ")} (KST)` }),
        new Paragraph({ text: `이 문서를 읽으면 프로젝트의 전체 작업 히스토리를 파악하고 복구할 수 있습니다.` }),
        new Paragraph({ text: "" }),

        // 섹션 1: 작업 기록
        new Paragraph({ text: "1. 작업 기록 (Development Log)", heading: HeadingLevel.HEADING_1 }),
        ...mdToParagraphs(devLog),
        new Paragraph({ text: "" }),

        // 섹션 2: 구현 계획
        new Paragraph({ text: "2. 구현 계획서 (Implementation Plan)", heading: HeadingLevel.HEADING_1 }),
        ...mdToParagraphs(implPlan),
        new Paragraph({ text: "" }),

        // 섹션 3: Git 히스토리
        new Paragraph({ text: "3. Git 커밋 히스토리 (최근 50개)", heading: HeadingLevel.HEADING_1 }),
        ...gitLog.split("\n").map(l => new Paragraph({ children: [new TextRun({ text: l, font: "Consolas", size: 18 })] })),
        new Paragraph({ text: "" }),

        // 섹션 4: 프로젝트 구조
        new Paragraph({ text: "4. 프로젝트 소스 파일 구조", heading: HeadingLevel.HEADING_1 }),
        ...tree.split("\n").map(l => new Paragraph({ children: [new TextRun({ text: l, font: "Consolas", size: 18 })] })),
        new Paragraph({ text: "" }),

        // 섹션 5: 환경변수 키 목록
        new Paragraph({ text: "5. 환경변수 키 목록 (값은 보안상 제외)", heading: HeadingLevel.HEADING_1 }),
        ...envKeys.split("\n").map(l => new Paragraph({ children: [new TextRun({ text: l, font: "Consolas", size: 18 })] })),
        new Paragraph({ text: "" }),

        // 섹션 6: 의존성
        new Paragraph({ text: "6. 패키지 의존성", heading: HeadingLevel.HEADING_1 }),
        ...deps.split("\n").map(l => new Paragraph({ children: [new TextRun({ text: l, font: "Consolas", size: 18 })] })),
      ],
    },
  ],
});

const filePath = join(BACKUP_DIR, `KBBG_개발문서_${timestamp}.docx`);
const buffer = await Packer.toBuffer(doc);
writeFileSync(filePath, buffer);
console.log(`[doc] 개발 문서 생성 완료: ${filePath}`);
