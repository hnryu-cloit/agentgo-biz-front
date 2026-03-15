# AgentGo Biz Front

가맹점 운영을 위한 AI 기반 멀티에이전트 운영 허브 프론트엔드입니다.
현재 버전은 React + TypeScript 기반의 **UI/UX 스켈레톤(MVP 화면)** 으로, 점주(Owner) / 슈퍼바이저(SV) / 본사(HQ) / 마케팅 역할별 시나리오를 목업 데이터로 제공합니다.

---

## 전체 시스템 구조

```text
[Frontend (본 레포)]  →  [Mock Data]
     :5173                (src/data)
```

- **Frontend** (본 레포): React SPA
- **Data Source**: `src/data` 하드코딩 목업 데이터 기반
- **Backend / API 연동**: 현재 미연동 (Phase 2 예정)

---

## 기술 스택

| 분류 | 라이브러리 | 버전 |
|------|-----------|------|
| Framework | React | 19.2.0 |
| Language | TypeScript | 5.9.3 |
| Build Tool | Vite | 7.3.1 |
| Routing | react-router-dom | 7.13.0 |
| Styling | Tailwind CSS | 4.1.18 |
| UI Primitive | Radix UI (`radix-ui`) | 1.4.3 |
| Utility | clsx + tailwind-merge | 2.1.1 / 3.4.0 |
| Icons | Lucide React + Material Symbols | 0.468.0 / Google Fonts |

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트
npm run lint
```

### 환경변수 (`.env`)

현재 `import.meta.env` 사용이 없어 **필수 환경변수가 없습니다**.

---

## 화면 구성

### 공통

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/login` | LoginPage | 역할 선택, 이메일/PW 로그인, 5회 실패 잠금, 데모 계정 |
| `/` | HomePage | 운영 허브 개요, 빠른 이동 링크, KPI 요약, 에이전트 상태 |
| `/overview` | HomePage | `/`와 동일 |
| `/admin/settings` | AdminSettingsPage | 내 계정·보안·알림·시스템·감사 로그 관리자 설정 |

### 점주 (Owner)

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/owner/dashboard` | OwnerDashboardPage | KPI 카드, 핵심 액션보드(실행/보류/근거 모달), 시간대별 매출, 마진 경보, 리뷰 감성 |
| `/owner/qna` | QnaPage | 대화형 AI QnA, 근거 데이터, 신뢰도, 세션 초기화 |
| `/owner/stock-take` | StockTakePage | 월말 식자재 재고 실사, AI 이상 감지, 카테고리별 실재고 입력, 실사 이력 |
| `/owner/labor` | LaborOptimizationPage | 인시당 매출 KPI, 시간대별 투입/권장 인원 비교, AI 인력 권고, 직원 시간표 |

### 슈퍼바이저 (SV)

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/supervisor/dashboard` | SupervisorDashboardPage | 리스크 KPI, 담당 매장 위험도 테이블, 방문 리포트 모달 |
| `/supervisor/analysis` | SvAnalysisPage | KPI 비교 차트, 매장 랭킹(순위 변동), 격차 분석 AI |
| `/supervisor/actions` | SvActionsPage | 액션 이행률, 이력 테이블, 본사 에스컬레이션 모달 |
| `/supervisor/visit-log` | SvVisitLogPage | 방문 기록 목록, 신규 기록 추가 폼, 후속 액션 |

### 본사 (HQ)

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/hq/control-tower` | HqControlTowerPage | 4탭 구조, 에이전트 헬스보드(30초 갱신), 권역별 예측 |
| `/hq/notices` | NoticeOcrPage | OCR 4단계 워크플로우, 체크리스트 UI, 배포 현황 |
| `/hq/alerts/detail` | AlertDetailPage | 원인 분석, 권고 조치, 처리 타임라인 |

### 마케팅

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/marketing/campaigns` | CampaignDesignerPage | 세그먼트 선택, 오퍼 설계(메뉴별 BEP 계산기), 예상 성과 요약 |
| `/marketing/rfm` | RfmSegmentPage | RFM 4세그먼트 KPI, 이탈 고객 리스트, 오퍼 발송 |
| `/marketing/performance` | CampaignPerformancePage | 채널별 성과, 오픈/사용/재방문/매출 기여 테이블 |

### 분석

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/analysis/roi` | PromoRoiPage | 프로모션 전/중/후 비교 테이블, ROI, 기여 요인 분해 |
| `/analysis/benchmark` | BenchmarkPage | 유사 매장 선택, KPI 비교 차트, 개선 액션 추천 |

### 리포트 / 설정

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/reports` | ReportsPage | 일간/주간 리포트 생성·다운로드·재시도 |
| `/settings/users` | SettingsUsersPage | 사용자 초대/비활성화, SV 담당 매장 배정 |
| `/settings/stores` | SettingsStoresPage | 매장별 영업시간/좌석/서비스 유형 설정 |

### 데이터

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/data/upload` | DataUploadPage | 4탭(매출/원가/고객/리뷰), 파일 업로드, 이력, 파이프라인 시각화 |

---

## 주요 기능

### 공통 레이아웃

- 좌측 고정 사이드바 + 상단 헤더 + 글로벌 필터바
- 헤더 유저 카드 우상단 3점 메뉴 → **설정(AdminSettingsPage) / 로그아웃** 드롭다운
- 현재 경로 기반 브레드크럼 표시
- 알림 인박스 (유형별 아이콘, 읽음 처리)

### 역할별 대시보드

- 점주 / SV / 본사 / 마케팅 시나리오별 전용 화면 제공
- KPI 카드, 진행률 바, 상태 배지, 액션 버튼 중심 UI
- 모달 / 탭 / 체크리스트 / 드롭다운 인터랙션

### 운영 특화 기능

| 기능 | 위치 |
|------|------|
| 월말 식자재 재고 실사 + AI 이상 감지 | `/owner/stock-take` |
| 인시당 매출 KPI + 시간대별 인력 최적화 | `/owner/labor` |
| 프로모션 BEP(손익분기점) 실시간 계산기 | `/marketing/campaigns` |
| 관리자 설정 (계정·보안·알림·시스템·감사 로그) | `/admin/settings` |
| 에이전트 헬스보드 30초 자동 갱신 | `/hq/control-tower` |

### 데이터 기반 동작

- `src/data/mockStoreResource.ts` — 매장 리소스 목업
- `src/data/sessionUser.ts` — 로그인 세션 사용자 목업
- API 호출 없이 프론트 단 동작만 제공

---

## 프로젝트 구조

```text
src/
├── assets/                      # 로고, 파비콘
├── components/
│   ├── commons/                 # Layout, Header, Sidebar, GlobalFilterBar, FloatingAiChat
│   └── ui/                      # Radix 기반 Select 컴포넌트
├── data/                        # 목업 데이터
│   ├── mockStoreResource.ts     # 매장 목업
│   └── sessionUser.ts           # 세션 유저 목업
├── lib/
│   └── utils.ts                 # cn() 유틸 (clsx + tailwind-merge)
├── pages/
│   ├── LoginPage.tsx
│   ├── HomePage.tsx
│   │
│   ├── OwnerDashboardPage.tsx   # 점주 홈
│   ├── QnaPage.tsx              # AI QnA
│   ├── StockTakePage.tsx        # 월말 재고 실사
│   ├── LaborOptimizationPage.tsx# 인력 리소스 최적화
│   │
│   ├── SupervisorDashboardPage.tsx
│   ├── SvAnalysisPage.tsx
│   ├── SvActionsPage.tsx
│   ├── SvVisitLogPage.tsx
│   │
│   ├── HqControlTowerPage.tsx
│   ├── NoticeOcrPage.tsx
│   ├── AlertDetailPage.tsx
│   │
│   ├── CampaignDesignerPage.tsx # BEP 계산기 포함
│   ├── RfmSegmentPage.tsx
│   ├── CampaignPerformancePage.tsx
│   │
│   ├── PromoRoiPage.tsx
│   ├── BenchmarkPage.tsx
│   │
│   ├── DataUploadPage.tsx
│   ├── ReportsPage.tsx
│   ├── SettingsUsersPage.tsx
│   ├── SettingsStoresPage.tsx
│   │
│   └── AdminSettingsPage.tsx    # 관리자 설정 (헤더 3점 메뉴 진입)
│
├── App.tsx                      # 라우팅 정의
├── main.tsx                     # 엔트리 포인트
├── index.css                    # 글로벌 스타일 / CSS 변수 토큰
└── types.d.ts
```

---

## 아키텍처

### 라우팅

- `react-router-dom v7` 사용
- `/login` — Layout 외부 독립 라우트
- 나머지 — `<Layout />` 하위에서 `<Outlet />` 렌더링
- 미정의 경로는 `/`로 리다이렉트

### 상태 관리

- 전역 상태 라이브러리 없이 `useState` / `useMemo` 중심
- 페이지 단위 로컬 상태로 모달·탭·폼·토글 제어

### UI 시스템

- Tailwind CSS v4 + CSS 변수 토큰 (`index.css`)
- `radix-ui` Select 프리미티브 래핑 (`components/ui/select.tsx`)
- `cn()` 유틸로 `clsx` + `tailwind-merge` 조합
- Material Symbols Outlined (Google Fonts CDN) 아이콘

---

## Feature List

피처 목록은 `feature list/` 디렉토리 CSV 파일로 관리합니다.

| 파일 | 인코딩 | 항목 수 |
|------|--------|---------|
| `agentgo_biz_front.csv` | UTF-8 BOM + QUOTE_ALL | 80개 |
| `agentgo_biz_backend.csv` | UTF-8 QUOTE_MINIMAL | 69개 |
| `agentgo_biz_ai.csv` | UTF-8 QUOTE_MINIMAL | 56개 |

컬럼 구조: `대분류, 중분류, 소분류, 기능, 설명, 작업상태, 우선순위, 전제조건, 인수조건`

---

## 개발 현황

| 항목 | 상태 |
|------|------|
| 공통 레이아웃 (Sidebar / Header / FilterBar) | 완료 |
| 역할별 대시보드 전체 라우트 구성 (23페이지) | 완료 |
| 화면 인터랙션 (모달 / 탭 / 폼 / 토글 / BEP 계산기) | 완료 |
| 헤더 유저카드 3점 메뉴 (설정 / 로그아웃) | 완료 |
| 관리자 설정 페이지 | 완료 |
| 월말 재고 실사 페이지 | 완료 |
| 인력 리소스 최적화 페이지 | 완료 |
| 백엔드 API 연동 | 미구현 (Phase 2) |
| 테스트 코드 | 미구현 |

---

## 참고 문서

- `docs/TONE_AND_MANNER.md`
- `docs/COPY_MAPPING.md`
- `feature list/agentgo_biz_front.csv`
- `feature list/agentgo_biz_backend.csv`
- `feature list/agentgo_biz_ai.csv`