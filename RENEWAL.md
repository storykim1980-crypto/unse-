# 운세방앗간 — 2026 디자인 리뉴얼 (Celestial Mill Classic)

기능(정밀 만세력 엔진)은 그대로 두고 **디자인 레이어만 전면 교체**한 버전입니다.
배포 주소: https://www.unsemill.com (GitHub: storykim1980-crypto/unse-)

## 1. 변경 요약

| 구분 | 내용 |
| --- | --- |
| 디자인 시스템 | 딥 미드나이트 남색 + **샴페인 골드(#E9C167)** + 청옥(비취) + 라피스 아주르 |
| 신규 파일 | `css/redesign.css` (디자인 시스템·컴포넌트), `js/redesign.js` (UI 컨트롤러) |
| index.html | 새 셸(헤더·히어로·만세력 콘솔·4대 성전 바로가기·데일리 라운지·30대 대궐 디렉터리·오행/FAQ·신뢰 보증·푸터) + 기존 기능 블록 그대로 이식 |
| 보조 페이지 6종 | about · privacy · terms · cookie · contact · ad-policy **완전 리디자인**(공통 헤더/푸터/CTA 적용) |
| 브랜드 자산 | `assets/og-image.png`(1200×630 공유 썸네일) · `icon-512/192` · `apple-touch-icon` · `favicon-32` **신규 생성** |
| 404 페이지 | `404.html` 신규 — 새 디자인 + 인기 운세 바로가기 4종 |
| 인쇄/PDF | 다크 테마 → **종이용 흑백 리포트로 자동 전환** (리포트 본문만 출력 · 게이지/표/오행칩 무채색 · 빈 페이지 제거 · 화면 UI 완전 숨김) |
| SEO | JSON-LD 5종(WebSite·Organization·**FAQPage(6문)**·**SoftwareApplication**·**BreadcrumbList**) |
| 접근성 | 본문 건너뛰기 링크 · FAQ `aria-expanded` 동기화 · 모바일 메뉴 포커스 이동 · `aria-live` 알림 |
| 서비스워커 | `service-worker.js` 2026 리뉴얼판(핵심 문서만 캐싱 · HTML/JS/CSS 네트워크 우선) |
| 모바일 헤더 | 320~414px 가로 넘침 제거 — 좁은 화면에서 공유 아이콘·버전칩 자동 정리, CTA 100% 노출 (§23) |
| 스타일 복원 | 누락 Tailwind 유틸리티 25종 복원 (§24) · 카드 '무료' 배지 스타일 누락 보정 (§25) |
| 로딩 속도 | lucide(아이콘) 스크립트 `defer` 전환 + `preconnect` 추가 → 렌더링 차단 제거 |
| 기타 | `sitemap.xml`(7개 URL·lastmod 갱신) · `manifest.json`(로컬 아이콘·테마색 #0B0F19) · `DEPLOY.sh`(원클릭 배포) |
| 캐시 무효화 | `APP_VERSION = 20261013-1300` — 배포할 때 이 값만 올리면 전 기기 즉시 반영 |

## 2. 기능 보존 · 검증 결과

- `js/app.js` 만세력 엔진은 로직 변경 없음. 화면 조작 훅(id · class · onclick) 100% 유지.
- 헤드리스 크롬 실전 테스트 통과 (콘솔 에러 0건)
  - 30개 리포트 전체 열림 ✅ / 4대 성전 탭 ✅ / 30대 운세 검색·초기화 ✅
  - 타로 플립·리셋 ✅ / 띠별 툴팁 ✅ / FAQ 아코디언 ✅
  - 음력·윤달·출생시간 모름 토글 ✅ / 리포트 요약 복사·인쇄 버튼 ✅
  - 모바일 메뉴 ✅ / 보조 페이지 6종 렌더 ✅

### app.js 에서 손댄 2곳 (버그 픽스)
1. `renderTojungBigyeol(CURRENT_SAJU)` → `renderTojungBigyeol(saju)`
   *초기 샘플 렌더 시 null 참조로 렌더 체인이 끊기던 콘솔 에러 수정*
2. 초기화 순서 정리 (`selectSajuMenu('oheng')` → 화면 숨김 처리 순서)

## 3. 디자인 토큰

```
배경 #0B0F19 / 표면 #111827 / 상승 #1A2234
골드 #E9C167 · 라이트골드 #FDEDB4 · 딥골드 #CFA043   (v2: 한 단계 밝고 따뜻하게)
청옥 #10B981 · 라피스 #38BDF8 · 플래티넘 #E2E8F0
금색 보더 rgba(233,193,103,.22) · 유리 블러 18~20px · 라운드 8/12/16/24px
```

## 4. 파일 지도

```
css/redesign.css   디자인 시스템(§1~§16 토큰·컴포넌트·재스킨 / §17 유틸리티 자동매핑 / §18~§21 리포트·문서 / §23 모바일 헤더 / §24 유틸리티 복원 / §25 무료 배지)
js/redesign.js     성전 탭·검색·FAQ·타로·띠운세·모바일 메뉴·공유
index.html         새 메인 셸 + 기존 30대 리포트/데일리 광장 이식
about/privacy/terms/cookie/contact/ad-policy.html   문서형 리뉴얼
service-worker.js  2026 리뉴얼판 (등록은 하지 않음 → 캐시 사고 방지, 필요 시 재활성화 가능)
DEPLOY.sh          원클릭 배포 스크립트
RENEWAL.md         이 문서

※ 서비스워커는 안전을 위해 페이지에서 등록하지 않고 있습니다(기존 캐시 문제 재발 방지).
   오프라인 지원이 필요하면 js/redesign.js 하단에 아래 한 줄을 추가하세요.
   navigator.serviceWorker.register('./service-worker.js');
```

## 5. 배포 전 체크리스트

- [x] 30개 리포트 · 4대 성전 · 검색 · 라운지 · FAQ 정상 동작 (콘솔 에러 0건)
- [x] 보조 페이지 6종 + 404 페이지 렌더 정상
- [x] OG 공유 썸네일(1200×630) · 아이콘 4종 · 매니페스트 200 응답
- [x] 인쇄(PDF) 스타일 — 헤더/푸터/광고 숨김, 리포트 본문 6p 출력 확인
- [x] 리포트 요약 복사 · 인쇄 버튼 동작
- [x] 인쇄 PDF 실제 렌더 검증 (흑백 리포트 · 강제 빈 페이지 제거)
- [x] 접근성: 키보드 Tab 첫 포커스 = 건너뛰기 링크, FAQ/모바일 메뉴 aria 상태 동기화
- [x] JSON-LD 5블록 파싱 정상 · 중복 id 0개 · 인라인 핸들러 누락 0개
- [x] 가로 오버플로 0건 — 8개 페이지 × 7개 폭(320/360/414/768/1024/1440/1920px) 전수 검사
- [x] 깨진 내부 링크·자원 0건 (8개 페이지 전수 HEAD 검사)
- [x] 화면 사용 클래스 160개 중 CSS 미정의 = 무해한 훅(hall-1~4)만 남음

## 6. 로컬 확인 · 배포

```bash
# 로컬 확인
python3 -m http.server 8080

# GitHub Pages 배포 (원클릭)
bash DEPLOY.sh

# 또는 직접
git add -A
git commit -m "design: 2026 Celestial Mill Classic 리뉴얼"
git push origin main
```
