# AgentGo Biz Front

가맹점 운영을 위한 AI 기반 멀티에이전트 운영 허브 프론트엔드입니다. 현재 버전은 React + TypeScript 기반 SPA이며, 점주(Owner) / 슈퍼바이저(SV) / 본사(HQ) / 마케팅 역할별 운영 화면과 백엔드 API 연동 레이어를 함께 포함합니다.

## 개요

- Frontend: React 19 + TypeScript + Vite
- Routing: `react-router-dom`
- Styling: Tailwind CSS v4
- API 통신: `src/lib/apiClient.ts` 기반 fetch wrapper
- 인증: JWT access / refresh token 저장, `/users/me` 기반 세션 복원
- 데이터 소스: 목업 데이터 + 실제 API 연동 혼합

## 시작하기

### 요구사항

- Node.js 20+
- npm

### 실행

```bash
npm install
npm run dev
```

### 환경변수

`.env.example`

```env
VITE_API_URL=http://localhost:8001
```

백엔드 기본 prefix는 `/api/v1` 입니다.

## 현재 구현 범위

### 공통

- 로그인 화면과 토큰 기반 보호 라우트
- `AuthProvider` 기반 사용자 세션 복원
- 역할별 레이아웃, 사이드바, 헤더
- 공통 API 클라이언트, 에러 처리, 파일 업로드/다운로드 유틸

### 점주 / 운영

- 점주 대시보드
- 월말 재고 실사
- 인력 리소스 최적화
- 자연어 POS 시뮬레이션용 서비스 레이어

### 슈퍼바이저

- SV 대시보드
- 매장 비교 분석
- 액션 추적 / 에스컬레이션
- 방문 기록 조회 및 생성

### 본사 / 마케팅 / 분석

- HQ 컨트롤타워
- 공지 OCR / 배포
- RFM 세그먼트
- 프로모션 ROI
- 캠페인 / 성과용 서비스 레이어

### 데이터 / 설정 / 리포트

- 데이터 업로드와 업로드 이력 조회
- 리포트 생성 / 목록 조회 / 다운로드
- 사용자 활성화 제어
- 매장 기본 정보 조회 / 수정

## API 연동 현황

현재 프론트에는 아래 도메인 서비스가 정리되어 있습니다.

- `src/services/auth.ts`
- `src/services/data.ts`
- `src/services/owner.ts`
- `src/services/supervisor.ts`
- `src/services/hq.ts`
- `src/services/marketing.ts`
- `src/services/analysis.ts`
- `src/services/inventory.ts`
- `src/services/labor.ts`
- `src/services/reports.ts`
- `src/services/settings.ts`

공유 타입은 `src/types/api.ts` 에서 관리합니다.

## 주요 디렉토리

```text
src/
├── components/
├── contexts/
├── data/
├── lib/
├── pages/
├── services/
└── types/
```

## Feature List

기능 명세는 아래 CSV로 관리합니다.

- `feature list/agentgo_biz_front.csv`
- `feature list/agentgo_biz_backend.csv`
- `feature list/agentgo_biz_ai.csv`

컬럼 구조:
`대분류,중분류,소분류,기능,설명,작업상태,우선순위,전제조건,인수조건`
