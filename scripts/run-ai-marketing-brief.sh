#!/bin/bash
# AI 마케팅 브리핑 cron 래퍼 (매일 새벽 5시 KST = 20:00 UTC)
set -e
cd /home/ubuntu/kbbg-app
set -a; source .env.local; set +a
node scripts/ai-marketing-brief.mjs >> /tmp/kbbg-ai-brief.log 2>&1
