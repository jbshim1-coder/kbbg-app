#!/bin/bash
# 자동 글쓰기 cron 래퍼
cd /home/ubuntu/kbbg-app
export $(grep -v '^#' .env.local | xargs)
node scripts/auto-post.mjs >> /tmp/kbbg-auto-post.log 2>&1
