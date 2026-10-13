#!/usr/bin/env bash
# ==========================================================
# 운세방앗간 — 2026 디자인 리뉴얼 배포 스크립트
# 사용법:  bash DEPLOY.sh
# ==========================================================
set -e
cd "$(dirname "$0")"

echo "▶ 1/4  저장소 상태 확인"
git status --short

echo
echo "▶ 2/4  변경 파일 스테이징"
git add -A

echo
echo "▶ 3/4  커밋"
git commit -m "design: 2026 Celestial Mill Classic 리뉴얼 (전 페이지 리스킨 + 골드 톤 v2 + OG/아이콘/404)"

echo
echo "▶ 4/4  GitHub Pages 배포 (push)"
git push origin main

echo
echo "✅ 완료! 1~2분 뒤 https://www.unsemill.com 에 반영됩니다."
echo "   · 캐시 갱신이 필요하면 index.html 상단 APP_VERSION 값을 새 숫자로 올려 주세요."
