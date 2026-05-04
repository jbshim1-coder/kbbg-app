#!/bin/bash
# Pinterest 자동 핀 생성 cron 래퍼 (매일 1회)
set -e
cd /home/ubuntu/kbbg-app
set -a; source .env.local; set +a
node scripts/auto-pinterest.mjs >> /tmp/kbbg-auto-pinterest.log 2>&1
