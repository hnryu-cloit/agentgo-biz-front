# AgentGo Biz Front

가맹점 운영을 위한 AI 기반 대시보드 프론트엔드입니다.  
현재 버전은 React + TypeScript 기반의 **UI/UX 스켈레톤(MVP 화면)** 으로, Owner/Supervisor/HQ/Marketing 시나리오를 목업 데이터로 제공합니다.

---

## 전체 시스템 구조

```text
[Frontend (본 레포)]  ->  [Mock Data]
     :5173                   (src/data)
```

- **Frontend** (본 레포): React SPA
- **Data Source**: `src/data` 하드코딩 목업 데이터 기반
- **Backend/API 연동**: 현재 미연동

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

현재 코드에서는 `import.meta.env` 사용이 없어 **필수 환경변수가 없습니다**.

---

## 화면 구성

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 운영 허브 개요, 빠른 이동, KPI/활동/에이전트 상태 |
| `/overview` | HomePage | `/`와 동일 |
| `/owner/dashboard` | OwnerDashboardPage | 점주 관점 KPI, 액션보드, 매출 추이, 매장 정보 |
| `/supervisor/dashboard` | SupervisorDashboardPage | 구역 매장 위험 분석 테이블, 방문/리포트 모달 |
| `/hq/control-tower` | HqControlTowerPage | HQ 통합 관제, 에이전트 상태 탭, 권역 예측/인프라 상태 |
| `/hq/notices` | NoticeOcrPage | 공지 OCR 플로우(업로드, OCR 결과, 체크리스트, 배포 현황) |
| `/marketing/campaigns` | CampaignDesignerPage | 세그먼트 기반 캠페인 설계 UI |
| `/hq/alerts/detail` | AlertDetailPage | 이상 경보 상세(원인, 조치, 타임라인) |
| `/data/upload` | DataUploadPage | 데이터 업로드 유형 선택/파일 업로드 UI |
| `*` | Redirect | 미정의 경로는 `/`로 리다이렉트 |

---

## 주요 기능

### 공통 레이아웃
- 좌측 고정 사이드바 + 상단 헤더 + 글로벌 필터바
- 현재 경로 기반 페이지 타이틀 표시
- 세션 유저 카드(목업) 표시

### 대시보드/업무 화면
- 역할별(점주/SV/HQ/마케팅) 운영 화면 제공
- KPI 카드, 진행률 바, 상태 배지, 액션 버튼 중심 UI
- 일부 화면에서 모달/탭/체크리스트 인터랙션 제공

### 데이터 기반 동작
- `src/data/mockStoreResource.ts` 기반 매장 리소스 렌더링
- `src/data/sessionUser.ts` 기반 사용자 정보 렌더링
- API 호출 없이 프론트 단 동작만 제공

---

## 프로젝트 구조

```text
src/
├── assets/                    # 로고/파비콘
├── components/
│   ├── commons/               # Layout, Header, Sidebar, GlobalFilterBar
│   └── ui/                    # Radix 기반 Select 컴포넌트
├── data/                      # 목업 데이터 (매장/세션 유저)
├── lib/                       # 공용 유틸 (cn)
├── pages/                     # 라우트 페이지
│   ├── HomePage.tsx
│   ├── OwnerDashboardPage.tsx
│   ├── SupervisorDashboardPage.tsx
│   ├── HqControlTowerPage.tsx
│   ├── NoticeOcrPage.tsx
│   ├── CampaignDesignerPage.tsx
│   ├── AlertDetailPage.tsx
│   └── DataUploadPage.tsx
├── App.tsx                    # 라우팅 정의
├── main.tsx                   # 엔트리 포인트
├── index.css                  # 글로벌 스타일/테마 토큰
└── types.d.ts
```

---

## 아키텍처

### 라우팅
- `react-router-dom v7` 사용
- `Layout` 하위에 업무 페이지 라우트 구성
- 미정의 라우트는 `/`로 리다이렉트

### 상태 관리
- 전역 상태 라이브러리(Zustand 등) 없이 `useState`/`useMemo` 중심
- 페이지 단위 로컬 상태로 모달/탭/체크리스트 제어

### UI 시스템
- Tailwind CSS v4 + CSS 변수 토큰(`index.css`)
- `radix-ui` Select 프리미티브를 `components/ui/select.tsx`에서 래핑
- `cn()` 유틸로 `clsx` + `tailwind-merge` 조합

---

## 개발 현황

| 항목 | 상태 |
|------|------|
| 공통 레이아웃 (Sidebar/Header/FilterBar) | 완료 |
| 역할별 대시보드 라우트 구성 | 완료 |
| 화면 인터랙션(모달/탭/체크리스트) | 완료 |
| 백엔드 API 연동 | 미구현 |
| 테스트 코드 | 미구현 |

---

## 참고 문서

- `docs/TONE_AND_MANNER.md`
- `docs/COPY_MAPPING.md`

