#!/bin/bash
# Reddit 키워드 모니터링 cron 래퍼 (매일 1회)
set -e
cd /home/ubuntu/kbbg-app
set -a; source .env.local; set +a
node scripts/reddit-monitor.mjs >> /tmp/reddit-monitor.log 2>&1
