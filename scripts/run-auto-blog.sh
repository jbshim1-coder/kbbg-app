#!/bin/bash
# 자동 블로그 포스팅 cron 래퍼 (매일 1회)
set -e
cd /home/ubuntu/kbbg-app
set -a; source .env.local; set +a
node scripts/auto-blog.mjs >> /tmp/kbbg-auto-blog.log 2>&1
node scripts/auto-blogger.mjs kbbg >> /tmp/kbbg-auto-blog.log 2>&1 || true
