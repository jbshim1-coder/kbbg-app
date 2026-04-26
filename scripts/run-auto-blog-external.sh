#!/bin/bash
# 외부 블로그 자동 포스팅 cron 래퍼
# 사용법: run-auto-blog-external.sh <siteId>
cd /home/ubuntu/kbbg-app
export $(grep -v '^#' .env.local | xargs)
node scripts/auto-blog-external.mjs "$1" >> /tmp/kbbg-auto-blog-$1.log 2>&1
