# AgentGo Biz API 명세서 및 풀스택 기능정의서

본 문서는 PostgreSQL 실데이터와 AI 모델링이 통합된 AgentGo Biz 시스템의 API 및 데이터 흐름을 정의합니다.

## 1. 시스템 공통 아키텍처
- **데이터 저장소**: PostgreSQL (SQLAlchemy AsyncSession 사용)
- **AI 엔진**: 별도 AI 서버 (FastAPI) 연동, ML 모델(Churn, Sales, ABC) 기반 추론
- **오케스트레이션**: 백엔드가 DB 데이터를 집계하여 AI 서버에 분석 요청 후 최종 결과(Insight)를 프론트에 전달

---

## 2. 데이터 적재 및 관리 (Resource Pipeline)

### 2.1 리소스 카탈로그 조회
- **GET** `/api/v1/data/resource/catalog`
- **설명**: `resource/` 디렉토리 내의 엑셀/CSV 파일 인벤토리와 DB 적재 현황 조회
- **구분 (Source Kind)**:
  - `pos_daily_sales`: POS 일자별 매출
  - `bo_point_usage`: BO 기준 포인트/결제 수단
  - `dodo_point`: 도도포인트 적립/사용 로그
  - `receipt_listing`: 영수증 단위 상세 거래
  - `menu_lineup`: 전점 메뉴 구성 및 원가표

### 2.2 실데이터 적재 (Import)
- **POST** `/api/v1/data/resource/import`
- **설명**: 원천 파일을 파싱하여 PostgreSQL Snapshot 테이블로 이관
- **파라미터**: `source_kind` (필수), `store_key` (선택)
- **결과**: `imported_count`, `message`

### 2.3 데이터셋 미리보기
- **GET** `/api/v1/data/resource/datasets/{source_kind}/{store_key}`
- **설명**: DB에 적재된 원천 데이터의 상위 N개 행 조회

---

## 3. 마케팅 분석 (Marketing Intelligence)

### 3.1 RFM 세그먼트 분석
- **GET** `/api/v1/marketing/rfm/segments`
- **설명**: 도도포인트 데이터를 기반으로 AI가 고객을 4개 그룹(Champions, Loyal, At Risk, Lost)으로 분류
- **응답**: `segment`, `count`, `revenue_share`, `avg_visit_frequency`

### 3.2 이탈 위험 고객 탐지
- **GET** `/api/v1/marketing/rfm/churn-risks`
- **설명**: ML 모델(`build_churn_score`)을 통해 이탈 확률이 높은 고객 리스트 산출
- **응답**: `customer_id`, `churn_probability`, `segment`, `recommended_offer`

---

## 4. 본사 및 슈퍼바이저 관제 (HQ & SV)

### 4.1 전사 통합 관제 오버뷰
- **GET** `/api/v1/hq/control-tower/overview`
- **설명**: 전국 총 매출, 가맹점 현황, 활성 에이전트 상태 등 핵심 KPI 요약

### 4.2 매장별 위험도 분석
- **GET** `/api/v1/supervisor/stores`
- **설명**: 실데이터 기반 리스크 점수, 매출 증감률, 취소율 등을 매장별로 집계
- **응답**: `id`, `name`, `risk_score`, `sales_total`, `cancel_rate`

### 4.3 사전 방문 분석 리포트 (F3)
- **GET** `/api/v1/supervisor/stores/{store_id}/visit-report`
- **설명**: 특정 매장 방문 전 AI가 생성한 이슈, 코칭 포인트, 면담 주제 요약 결과

---

## 5. 분석 및 수익성 (Financial Analysis)

### 5.1 프로모션 ROI 검증 (E2)
- **GET** `/api/v1/analysis/roi`
- **설명**: 프로모션 전후 데이터를 비교하여 증분 매출 및 ROI 계산
- **응답**: `roi_rate`, `incremental_revenue`, `contributing_factors` (객수, 객단가, 취소율 등)

---

## 6. AI 에이전트 상태 (Agent Orchestration)

### 6.1 에이전트 헬스 모니터링
- **GET** `/api/v1/agents/status`
- **설명**: 분석, 전략, 실행, OCR 등 각 에이전트의 에러율 및 하트비트 상태 조회
- **응답**: `agent_name`, `status` (healthy, degraded, down), `error_rate`
