#!/bin/bash
# Medium 자동 교차게시 cron 래퍼 (매일 1회, auto-blog 30분 후)
set -e
cd /home/ubuntu/kbbg-app
set -a; source .env.local; set +a
node scripts/auto-medium.mjs >> /tmp/kbbg-auto-medium.log 2>&1
