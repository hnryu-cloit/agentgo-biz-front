# AgentGo Biz Tone and Manner

`AgentGo-Creative-Front/figma` 시안을 기준으로 `agentgo-biz-front`에 적용한 공통 UI 기준입니다.

## 1) Color
- Primary: `hsl(213 90% 55%)`
- Background: `hsl(220 33% 97%)`
- Card: `#FFFFFF`
- Soft Surface: `#F7FAFF`
- Border: `hsl(220 32% 88%)` + 강조 보더 `#D6E0F0`
- Focus Ring: `#95B4EB/25`

## 2) Radius and Shadow
- Base radius: `0.72rem`
- Section/Card: `rounded-2xl`
- Soft panel/input: `rounded-xl`
- Elevation: `0 6px 18px rgba(30, 59, 109, 0.08)`

## 3) Layout Structure
- Sidebar: 밝은 화이트 톤 + 얇은 보더 + 활성 메뉴 연한 블루 배경
- Header: 높이 `68px`, 얇은 보더, 저채도 텍스트 계층
- Global Filter Bar: 헤더 아래 `52px`, 반투명 화이트
- Main content top spacing: `pt-[132px]`

## 4) Reusable Pattern (Inline)
- Section card: `rounded-2xl border border-border/90 bg-card p-5 md:p-6`
- Soft panel: `rounded-xl border border-[#DCE4F3] bg-[#F7FAFF]`
- Primary button: `rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1E5BE9]`
- Ghost button: `rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F8FAFF]`
- Blue chip: `rounded-full border border-[#CFE0FF] bg-[#EEF4FF] px-2.5 py-1 text-xs font-semibold text-[#2454C8]`
- Table head: `bg-[#F7FAFF] text-slate-600`

## 5) Component Policy
- 입력/셀렉트/팝오버는 `rounded-xl`, 연한 보더, 화이트 배경 유지
- 상태 색(위험/주의/정상)은 의미 전달용으로만 사용하고, 기본 프레임은 블루/뉴트럴 톤 유지
- 페이지별 공통 패턴은 인라인 유틸 클래스로 반복 적용
