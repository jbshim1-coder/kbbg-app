#!/bin/bash
# KBBG 프로젝트 완전 복구 스크립트
# 백업 폴더(D:\backup\01.kbbg)에서 프로젝트를 완전 복구합니다.
# 사용법: bash scripts/restore-from-backup.sh [백업_타임스탬프]
# 예시: bash scripts/restore-from-backup.sh 20260329_100000

BACKUP_DIR="/mnt/d/backup/01.kbbg"
RESTORE_DIR="/home/jbshi"
PROJECT_DIR="/home/jbshi/kbbg-app"

echo "=========================================="
echo "  KBBG 프로젝트 완전 복구 스크립트"
echo "=========================================="
echo ""

# 1. 사용 가능한 백업 목록 표시
echo "[1단계] 사용 가능한 백업 목록:"
echo "---"
ls -lt "${BACKUP_DIR}"/code_*.tar.gz 2>/dev/null | head -10 | awk '{print NR". "$NF" ("$6,$7,$8")"}'
echo ""

# 타임스탬프 파라미터 또는 최신 백업 사용
if [ -n "$1" ]; then
  TIMESTAMP="$1"
  BACKUP_FILE="${BACKUP_DIR}/code_${TIMESTAMP}.tar.gz"
else
  BACKUP_FILE=$(ls -t "${BACKUP_DIR}"/code_*.tar.gz 2>/dev/null | head -1)
  TIMESTAMP=$(basename "$BACKUP_FILE" | sed 's/code_//;s/.tar.gz//')
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ 백업 파일을 찾을 수 없습니다: $BACKUP_FILE"
  echo "사용 가능한 백업:"
  ls "${BACKUP_DIR}"/code_*.tar.gz 2>/dev/null
  exit 1
fi

echo "[2단계] 복구할 백업: $BACKUP_FILE"
echo ""

# 2. 기존 프로젝트 백업 (안전장치)
if [ -d "$PROJECT_DIR" ]; then
  SAFETY_TS=$(date +"%Y%m%d_%H%M%S")
  echo "[3단계] 현재 프로젝트를 안전 백업 중..."
  tar czf "${BACKUP_DIR}/pre_restore_${SAFETY_TS}.tar.gz" \
    --exclude='node_modules' --exclude='.next' --exclude='.git' \
    -C /home/jbshi kbbg-app 2>/dev/null
  echo "  → 안전 백업 완료: pre_restore_${SAFETY_TS}.tar.gz"
fi

# 3. 코드 복구
echo "[4단계] 코드 복구 중..."
cd "$RESTORE_DIR"
tar xzf "$BACKUP_FILE"
echo "  → 코드 복구 완료"

# 4. 의존성 설치
echo "[5단계] 패키지 의존성 설치 중..."
cd "$PROJECT_DIR"
npm install --silent 2>/dev/null
echo "  → npm install 완료"

# 5. 환경변수 확인
echo "[6단계] 환경변수 확인..."
if [ -f "${PROJECT_DIR}/.env.local" ]; then
  echo "  → .env.local 존재 확인 ✅"
  ENVCOUNT=$(grep -c "=" "${PROJECT_DIR}/.env.local")
  echo "  → 환경변수 ${ENVCOUNT}개 설정됨"
else
  echo "  → ⚠️ .env.local 없음! 수동 복구 필요"
  echo "  → 종합기술문서(Word)의 '4. 환경변수' 섹션 참조"
fi

# 6. DB 데이터 복구 안내
echo ""
echo "[7단계] DB 데이터 복구"
DB_DIR=$(ls -dt "${BACKUP_DIR}"/db_* 2>/dev/null | head -1)
if [ -n "$DB_DIR" ]; then
  echo "  → DB 백업 위치: $DB_DIR"
  echo "  → 포함된 테이블:"
  ls "$DB_DIR"/*.json 2>/dev/null | xargs -I{} basename {} .json | sed 's/^/    - /'
  echo ""
  echo "  ⚠️ DB 복구는 Supabase 대시보드에서 수동으로 진행해야 합니다."
  echo "  → Supabase SQL Editor에서 각 JSON 파일의 데이터를 INSERT"
  echo "  → 또는 Supabase CLI 사용: supabase db push"
else
  echo "  → ⚠️ DB 백업을 찾을 수 없습니다"
fi

# 7. Git 연결 확인
echo ""
echo "[8단계] Git 연결 확인..."
cd "$PROJECT_DIR"
if [ -d ".git" ]; then
  echo "  → Git 저장소 확인 ✅"
  git remote -v 2>/dev/null | head -2
else
  echo "  → Git 초기화 필요..."
  git init
  git remote add origin https://github.com/jbshim1-coder/kbbg-app.git
  echo "  → Git 원격 저장소 연결 완료"
fi

# 8. 복구 완료
echo ""
echo "=========================================="
echo "  ✅ 복구 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo "  1. npm run dev  → 개발 서버 실행"
echo "  2. 브라우저에서 http://localhost:3000 확인"
echo "  3. .env.local 환경변수 확인"
echo "  4. Supabase 대시보드에서 DB 상태 확인"
echo "  5. git push 로 GitHub/Vercel 동기화"
echo ""
echo "문제 발생 시:"
echo "  → D:\\backup\\01.kbbg\\docs\\KBBG_종합기술문서_*.docx 참조"
echo "  → 모든 환경변수, 비밀키, 설정 정보가 포함되어 있습니다"
