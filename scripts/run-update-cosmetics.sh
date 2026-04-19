#!/bin/bash
# 화장품 순위 자동 수집 cron 래퍼
cd /home/ubuntu/kbbg-app
node scripts/update-cosmetics.mjs >> /tmp/kbbg-cosmetics.log 2>&1
