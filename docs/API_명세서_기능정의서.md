# AgentGo Biz API 명세서 / 기능정의서

## 공통
- 인증: `Authorization: Bearer <JWT>`
- 권한: `hq_admin`, `marketer`, `supervisor`, `store_owner`
- 응답 공통: `requestId`, `timestamp`, `result`
- 모든 실행 API는 `dryRun` 지원 (실제 반영 전 시뮬레이션)
- 승인 필요한 액션은 `pending_approval` 상태로 저장 후 승인 워크플로우 진입
- 에이전트 추론 결과는 반드시 근거 데이터(`evidence`)를 포함

---

## 1. Raw 데이터 업로드 및 파이프라인

### POST `/api/v1/data/upload`
- 설명: CSV/Excel Raw 파일을 업로드하고 처리 파이프라인을 트리거
- 입력: `multipart/form-data`
  - `file`: CSV/Excel 파일
  - `dataType`: `sales` | `cost_menu` | `customer_point` | `review`
  - `storeId`: 매장 ID (전체 업로드 시 `ALL`)
  - `periodStart`: 데이터 시작일 (`YYYY-MM-DD`)
  - `periodEnd`: 데이터 종료일 (`YYYY-MM-DD`)
- 응답
```json
{
  "jobId": "UPLOAD-20260305-0042",
  "dataType": "sales",
  "storeId": "S001",
  "period": { "start": "2026-03-01", "end": "2026-03-05" },
  "status": "processing",
  "estimatedMinutes": 2
}
```

### GET `/api/v1/data/upload/{jobId}/status`
- 설명: 업로드 처리 상태 및 데이터 품질 결과 조회
- 응답
```json
{
  "jobId": "UPLOAD-20260305-0042",
  "status": "completed",
  "rowsTotal": 1240,
  "rowsParsed": 1235,
  "rowsRejected": 5,
  "qualityScore": 87,
  "errors": [
    { "row": 42, "field": "amount", "reason": "missing_value" }
  ],
  "previewRows": [...]
}
```

### GET `/api/v1/data/upload/history`
- 설명: 조직/매장 기준 업로드 이력 조회
- 권한: `hq_admin`, `supervisor` (담당 매장 범위), `store_owner` (본인 매장)
- 쿼리: `storeId`, `dataType`, `status`, `from`, `to`
- 응답: `uploads[]` (jobId, dataType, storeId, period, status, uploadedBy, createdAt)

### POST `/api/v1/data/upload/{jobId}/retry`
- 설명: 오류 발생 업로드 재처리 트리거
- 응답: `{ "jobId": "...", "status": "processing" }`

---

## 2. 워크플로우 실행

### POST `/api/v1/agents/workflows/run`
- 설명: 분석→전략→실행 에이전트 연쇄 실행
- 요청
```json
{
  "storeId": "S001",
  "scenario": "rain_promo",
  "inputs": {
    "dateRange": ["2026-03-01", "2026-03-05"],
    "budget": 300000
  },
  "dryRun": true
}
```
- 응답
```json
{
  "workflowId": "WF-20260305-001",
  "status": "running",
  "steps": ["analysis", "strategy", "execution"]
}
```

---

## 3. 점주 액션 카드

### GET `/api/v1/stores/{storeId}/actions/today`
- 설명: 점주용 오늘의 핵심 액션 3개 반환
- 권한: `store_owner` (본인 매장), `supervisor` (담당 매장), `hq_admin`
- 응답
```json
{
  "storeId": "S001",
  "generatedAt": "2026-03-05T07:00:00+09:00",
  "actions": [
    {
      "type": "promo",
      "title": "세트A 10% 프로모션",
      "priority": "P0",
      "evidence": {
        "metric": "비피크 회전율",
        "value": "14:00~17:00 객수 -32% vs 피크",
        "period": "최근 2주"
      },
      "expectedEffect": "객단가 +8%, 예상 매출 +120,000원"
    },
    {
      "type": "retention",
      "title": "이탈고객 42명 쿠폰",
      "priority": "P0",
      "evidence": { "metric": "방문주기 지연", "value": "평균 18일 → 현재 32일" }
    },
    {
      "type": "margin",
      "title": "메뉴B 가격조정 시뮬레이션",
      "priority": "P1",
      "evidence": { "metric": "마진율", "value": "-4.2%p (원가 상승 반영)" }
    }
  ]
}
```

### POST `/api/v1/stores/{storeId}/actions/{actionId}/status`
- 설명: 액션 실행/보류/무시 상태 변경
- 요청: `{ "status": "executed" | "deferred" | "dismissed", "reason": "..." }`
- 응답: `{ "actionId": "...", "status": "executed", "updatedAt": "..." }`

---

## 4. 공지 OCR

### POST `/api/v1/notices/ocr`
- 설명: 공지 이미지 OCR + 요약 + 체크리스트 추출
- 입력: `multipart/form-data` (`file`, `storeScope`: `all` | `store_id`)
- 응답
```json
{
  "noticeId": "N-1002",
  "summary": "신메뉴 프로모션 3월 10일 시작, POS 메뉴 반영 필수",
  "requiredActions": [
    { "item": "POS 메뉴 배너 반영", "deadline": "2026-03-09", "assignee": "store_owner" },
    { "item": "포인트 2배 적립 룰 적용", "deadline": "2026-03-10", "assignee": "store_owner" }
  ],
  "ocrConfidence": 0.94,
  "rawText": "..."
}
```

### GET `/api/v1/notices/{noticeId}/compliance`
- 설명: 공지 이행 현황 조회 (체크리스트 완료율)
- 권한: `hq_admin` (전체), `supervisor` (담당 구역)
- 응답: `storeCompliance[]` (storeId, completedItems, totalItems, completionRate)

---

## 5. POS 변경 시뮬레이션 (MVP)

### POST `/api/v1/pos/commands/simulate`
- 설명: 자연어 POS 변경 명령을 구조화하고 마진/매출 영향 시뮬레이션 제공 (MVP 단계, 실제 POS 적용 없음)
- 요청
```json
{
  "storeId": "S001",
  "command": "내일부터 A세트 가격 500원 인상",
  "simulationPeriodDays": 30
}
```
- 응답
```json
{
  "simId": "SIM-9901",
  "parsedIntent": {
    "menu": "A세트",
    "changeType": "price_increase",
    "amount": 500,
    "effectiveAt": "2026-03-06"
  },
  "simulation": {
    "currentPrice": 8500,
    "newPrice": 9000,
    "currentMarginRate": 22.4,
    "newMarginRate": 27.1,
    "estimatedDemandChange": -3.2,
    "netRevenueImpact": "+180,000원/월 (예상)"
  },
  "recommendation": "가격 인상 긍정적. 수요 탄력성 -3.2% 예상으로 순수익 개선.",
  "note": "MVP 단계: 실제 POS 적용은 수동 처리 필요. Phase 2에서 자동 반영 지원 예정."
}
```

---

## 6. 마진 가드

### GET `/api/v1/profit/margin-guard?storeId=S001`
- 설명: 메뉴별 실질 마진율 하락 경고
- 응답: `menuId`, `menuName`, `currentMargin`, `marginDelta`, `riskLevel`, `recommendedPrice`, `evidence`

---

## 7. 프로모션 ROI 검증

### GET `/api/v1/insights/promotion-roi?storeId=S001&promotionId=P100`
- 설명: 전후 매출/순이익/객수/PQ 변화 및 유의성 결과 반환
- 응답: `beforePeriod`, `afterPeriod`, `netProfitDelta`, `roi`, `confidence`, `breakdown`

---

## 8. 이상 알림

### GET `/api/v1/alerts/anomalies?storeId=S001`
- 설명: 비정상 취소/할인/포인트 누수 탐지 결과
- 응답: `alertType`, `score`, `detectedAt`, `recommendedAction`, `evidence`

---

## 9. 슈퍼바이저 전용 API

### GET `/api/v1/sv/stores/overview`
- 설명: SV 담당 매장 전체 성과 현황 조회 (한눈 비교판)
- 권한: `supervisor` (담당 구역만), `hq_admin`
- 쿼리: `svId`, `period`, `sortBy` (riskScore | revenue | marginDelta)
- 응답
```json
{
  "svId": "SV001",
  "period": "2026-W10",
  "stores": [
    {
      "storeId": "S001",
      "storeName": "A매장",
      "revenueDelta": -0.12,
      "marginAlert": "danger",
      "churnRisk": "high",
      "noticeComplianceRate": 0.6,
      "riskScore": 82,
      "topIssue": "취소율 급증 (+180%)"
    }
  ],
  "summary": {
    "totalStores": 15,
    "dangerCount": 3,
    "warningCount": 5,
    "normalCount": 7
  }
}
```

### GET `/api/v1/sv/stores/{storeId}/visit-report`
- 설명: 특정 매장 방문 전 AI 요약 분석 리포트 생성
- 권한: `supervisor` (담당 매장), `hq_admin`
- 응답
```json
{
  "storeId": "S001",
  "generatedAt": "2026-03-05T09:00:00+09:00",
  "topIssues": [
    { "priority": 1, "issue": "주말 저녁 객수 -28% (3주 연속)", "metric": "객수", "evidence": "..." },
    { "priority": 2, "issue": "메뉴B 마진율 -4.2%p", "metric": "마진가드", "evidence": "..." }
  ],
  "coachingPoints": [
    "피크 타임 메뉴 서빙 속도 확인 (테이블 체류시간 평균 72분)",
    "교차 판매 적용 여부 점검 (추천 미적용 상태)"
  ],
  "pendingActions": [
    { "actionId": "ACT-042", "title": "이탈고객 쿠폰 발송", "status": "deferred", "age": 3 }
  ],
  "suggestedTopics": ["최근 매출 하락 원인 점주 의견 청취", "공지 이행 체크리스트 현황 확인"]
}
```

### GET `/api/v1/sv/stores/ranking`
- 설명: 담당 구역 매장 성과 순위
- 쿼리: `svId`, `period`, `metric` (revenue | growth | margin)
- 응답: `ranking[]` (rank, storeId, storeName, value, delta, trend)

### GET `/api/v1/sv/actions/compliance`
- 설명: 담당 매장 점주들의 권장 액션 이행률 집계
- 응답: `stores[]` (storeId, totalActions, executedActions, complianceRate, pendingActions[])

### POST `/api/v1/sv/escalations`
- 설명: SV가 특정 매장 리스크를 본사에 에스컬레이션 보고
- 요청: `{ "storeId": "S001", "severity": "high", "summary": "...", "attachedAlerts": ["ALT-001"] }`
- 응답: `{ "escalationId": "ESC-001", "notifiedTo": ["hq_admin"], "status": "sent" }`

---

## 10. 자연어 질의(QnA)

### POST `/api/v1/qna/query`
- 설명: 점주/SV/본사 담당자의 자연어 분석 질의 처리
- 요청
```json
{
  "storeId": "S001",
  "sessionId": "SESSION-001",
  "question": "이번 달 주말 저녁 매출이 떨어진 이유 알려줘",
  "userRole": "store_owner"
}
```
- 응답
```json
{
  "answer": "3월 주말 저녁(18~21시) 매출이 전월 대비 15% 하락했습니다. 주요 원인은 ...",
  "evidence": [
    { "metric": "객수", "value": "-18%", "period": "3월 주말 저녁", "source": "sales_upload_20260305" },
    { "metric": "객단가", "value": "+3%", "period": "동기간", "source": "sales_upload_20260305" }
  ],
  "confidence": 0.87,
  "sessionId": "SESSION-001",
  "followUpSuggestions": ["피크 타임 회전율은 어때?", "경쟁 매장과 비교하면?"]
}
```
