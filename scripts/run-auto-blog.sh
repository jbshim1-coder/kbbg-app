#!/bin/bash
# 자동 블로그 포스팅 cron 래퍼 (매일 1회)
cd /home/ubuntu/kbbg-app
export $(grep -v '^#' .env.local | xargs)
node scripts/auto-blog.mjs >> /tmp/kbbg-auto-blog.log 2>&1
