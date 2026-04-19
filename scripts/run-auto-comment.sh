#!/bin/bash
# 자동 댓글 cron 래퍼
cd /home/ubuntu/kbbg-app
export $(grep -v '^#' .env.local | xargs)
node scripts/auto-comment.mjs --daily >> /tmp/kbbg-auto-comment.log 2>&1
