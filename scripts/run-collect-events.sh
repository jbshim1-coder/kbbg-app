#!/bin/bash
# 이벤트 자동 수집 + git commit + push (매주 월요일 cron)
cd /home/ubuntu/kbbg-app
export $(grep -v '^#' .env.local | xargs)

echo "=== $(date) 이벤트 수집 시작 ==="
node scripts/collect-events.mjs >> /tmp/kbbg-collect-events.log 2>&1

# 변경사항 있으면 커밋+푸시
if git diff --quiet src/data/events-data.json; then
  echo "변경 없음" >> /tmp/kbbg-collect-events.log
else
  git add src/data/events-data.json
  git commit -m "chore: 이벤트 데이터 자동 갱신 $(date +%Y-%m-%d)"
  git push
  echo "커밋+푸시 완료" >> /tmp/kbbg-collect-events.log
fi
