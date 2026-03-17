# AgentGo Biz Design System (Tone and Manner)

본 문서는 AgentGo Biz 프로젝트의 **Premium Light** 테마와 데이터 중심 지능형 인터페이스 가이드를 정의합니다.

## 1. 핵심 키워드
- **Premium Light**: 밝고 정갈한 화이트/블루 톤의 고급스러운 전문성.
- **Data-Driven Intelligence**: 단순 조회가 아닌, 분석과 통찰(AI Insight)이 강조되는 시각적 구성.
- **Action-Oriented**: 인사이트가 즉각적인 운영 액션으로 이어지도록 설계된 워크플로우.

## 2. Color System
- **Primary**: `#2F66FF` (브랜드 프라이머리 블루) - 핵심 액션 및 강조.
- **Background**: 
  - Main: `#FFFFFF` (카드 및 주요 영역)
  - Sub: `#F4F7FF` (콘텐츠 배경 및 섹션 구분)
- **Status & Feedback**:
  - Success/Normal: `#10B981` (Emerald 500)
  - Warning/Attention: `#F59E0B` (Amber 500)
  - Danger/Risk: `#EF4444` (Red 500)
  - Info/AI: `#EEF4FF` (Light Blue 배경) / `#BFD4FF` (Border)
- **Border**: `#D5DEEC` (기본 보더), `#E8EDF5` (연한 구분선)

## 3. UI Components & Patterns
### 3.1 Elevation & Radius
- **Shadow-elevated**: `0 10px 25px -3px rgba(30, 59, 109, 0.05), 0 4px 6px -2px rgba(30, 59, 109, 0.03)`
- **Radius**: `rounded-2xl` (1rem / 16px)를 섹션 카드의 표준으로 사용. 버튼은 `rounded-lg`.

### 3.2 Dynamic Elements
- **Live-Point**: 실시간 관제 중임을 나타내는 `animate-pulse` 효과가 적용된 소형 점.
- **AI Insight Panel**: `Sparkles` 아이콘 + `#EEF4FF` 배경 + `#C9D8FF` 보더로 구성된 분석 요약 박스.
- **Progress Gauge**: 핵심 지표(헬스 지수, 위험도 등)를 시각화하는 1.5~2px 높이의 둥근 막대 그래프.

## 4. Typography
- **Title**: `font-bold text-slate-900` - 명확한 위계 구분.
- **Sub-Title**: `text-[11px] font-bold uppercase tracking-wider text-primary` - 섹션 레이블 및 카테고리 강조.
- **Body**: `text-sm font-medium text-[#4a5568]` - 가독성 중심의 본문 텍스트.
- **Mono**: `tabular-nums` - 숫자 데이터의 정렬을 위해 적극 활용.

## 5. Layout Architecture
- **Sidebar**: 화이트 배경 + 정교한 아이콘 + 활성 메뉴의 미세한 블루 그라데이션.
- **Header**: 스텝 인디케이터(Progress step) 통합 및 글로벌 필터바와의 유기적 연결.
- **Grid System**: 12컬럼 그리드를 기본으로 하며, 대시보드에서는 `gap-6`를 표준 간격으로 사용.

## 6. Page-Specific Tone
- **HQ Control Tower**: 전사 통합 관제인 만큼 가장 보수적이고 신뢰감 있는 블루 톤 중심.
- **Marketing (RFM)**: 고객 중심 분석으로 퍼플/블루 톤을 믹스하여 심리적 리워드 강조.
- **Owner Dashboard**: 점주가 즉각적으로 이해할 수 있는 요약 카드와 에스컬레이션 가이드 강조.
