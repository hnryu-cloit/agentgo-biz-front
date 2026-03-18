import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, Bot, CircleHelp, MousePointerClick, Sparkles, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Favicon from "/favicon.svg";

type AssistantMessage = {
  id: number;
  type: "system" | "action" | "assistant";
  title: string;
  content: string;
  timestamp: string;
  evidence?: { label: string; value: string }[];
  actionItems?: string[];
};

type QuickAction = {
  id: string;
  label: string;
  prompt: string;
};

type RouteGuide = {
  title: string;
  subtitle: string;
  storeLabel: string;
  quickActions: QuickAction[];
};

type FloatingIntent = "summary" | "action";

type FloatingContext = {
  x: number;
  y: number;
  text: string;
};

type AssistDetail = {
  label: string;
  prompt: string;
  intent?: FloatingIntent;
  contextText?: string;
};

const routeGuides: Array<{ match: (pathname: string) => boolean; guide: RouteGuide }> = [
  {
    match: (pathname) => pathname.startsWith("/owner"),
    guide: {
      title: "점주 화면 해설",
      subtitle: "카드와 표를 누르면 현재 화면 기준 해설과 추천 조치를 보여줍니다.",
      storeLabel: "[CJ]광화문점",
      quickActions: [
        { id: "owner-1", label: "매출 해설", prompt: "오늘 매출 흐름을 해설해줘" },
        { id: "owner-2", label: "추천 조치", prompt: "지금 점주가 바로 해야 할 일을 알려줘" },
        { id: "owner-3", label: "점심 피크 대응", prompt: "점심 피크 시간 운영을 어떻게 조정할지 알려줘" },
        { id: "owner-4", label: "재방문 조치", prompt: "재방문율을 높일 쿠폰 액션을 추천해줘" },
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/marketing"),
    guide: {
      title: "마케팅 화면 해설",
      subtitle: "세그먼트와 캠페인 결과를 해설 중심으로 보고 바로 다음 조치를 확인합니다.",
      storeLabel: "[CJ]광화문점",
      quickActions: [
        { id: "marketing-1", label: "세그먼트 해설", prompt: "현재 세그먼트를 해설해줘" },
        { id: "marketing-2", label: "추천 채널", prompt: "어떤 채널로 보내는 게 좋은지 알려줘" },
        { id: "marketing-3", label: "BEP 해설", prompt: "손익분기 계산 결과를 해설해줘" },
        { id: "marketing-4", label: "추천 조치", prompt: "지금 실행할 캠페인을 제안해줘" },
      ],
    },
  },
  {
    match: (pathname) => pathname.startsWith("/hq") || pathname.startsWith("/reports") || pathname.startsWith("/data"),
    guide: {
      title: "본사 화면 해설",
      subtitle: "리포트와 업로드 현황을 해설 중심으로 보고 바로 후속 조치를 확인합니다.",
      storeLabel: "크리스탈제이드",
      quickActions: [
        { id: "hq-1", label: "리스크 해설", prompt: "지금 가장 중요한 리스크를 요약해줘" },
        { id: "hq-2", label: "업로드 점검", prompt: "데이터 업로드에서 확인할 문제를 알려줘" },
        { id: "hq-3", label: "추천 조치", prompt: "본사에서 오늘 해야 할 일을 알려줘" },
        { id: "hq-4", label: "보고용 요약", prompt: "임원에게 보고할 한 줄 요약을 만들어줘" },
      ],
    },
  },
];

const fallbackGuide: RouteGuide = {
  title: "화면 해설",
  subtitle: "블록을 선택하거나 우클릭하면 현재 화면 기준 해설을 보여드립니다.",
  storeLabel: "[CJ]광화문점",
  quickActions: [
    { id: "common-1", label: "화면 해설", prompt: "이 화면을 해설해줘" },
    { id: "common-2", label: "핵심만 보기", prompt: "핵심만 3줄로 정리해줘" },
    { id: "common-3", label: "추천 조치", prompt: "지금 해야 할 일을 알려줘" },
    { id: "common-4", label: "비교 보기", prompt: "비교해서 볼 포인트를 알려줘" },
  ],
};

function nowLabel() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function trimText(text: string, limit = 72) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit)}...`;
}

function resolveRouteGuide(pathname: string) {
  return routeGuides.find((item) => item.match(pathname))?.guide ?? fallbackGuide;
}

function buildAssistantReply(prompt: string, pathname: string, storeLabel: string, contextText?: string) {
  const focus = contextText ? `선택한 항목 "${trimText(contextText, 28)}"` : "현재 보고 있는 카드";

  if (pathname.startsWith("/marketing")) {
    return {
      title: "캠페인 해설",
      content: `${focus} 기준으로 보면 ${storeLabel}는 타이핑형 질문보다 세그먼트 선택과 채널 추천을 바로 보여주는 흐름이 더 적합합니다. 지금은 카카오 복귀 쿠폰과 점심 재방문 액션을 우선 검토하는 편이 맞습니다.`,
      evidence: [
        { label: "기준 매장", value: storeLabel },
        { label: "추천 채널", value: "KAKAO / PUSH" },
        { label: "추천 방식", value: "세그먼트 선택 -> 설계 -> 성과 확인" },
      ],
      actionItems: [
        "세그먼트 카드를 누르면 바로 캠페인 설계로 이동하게 유지",
        "BEP와 uplift는 문장보다 큰 숫자 카드로 먼저 보여주기",
        "타이핑 입력은 숨기고 추천 질문 버튼만 남기기",
      ],
    };
  }

  if (pathname.startsWith("/hq") || pathname.startsWith("/reports") || pathname.startsWith("/data")) {
    return {
      title: "본사 해설",
      content: `${focus}을 기준으로 보면 본사 사용자는 긴 대화보다 요약과 후속 조치가 먼저 보여야 합니다. 업로드 상태, 주요 리스크, 보고 문구를 한 화면에서 눌러 확인하는 구조가 더 이해하기 쉽습니다.`,
      evidence: [
        { label: "기준 브랜드", value: "크리스탈제이드" },
        { label: "우선 확인", value: "업로드 실패, 매출 하락, 경보" },
        { label: "권장 UX", value: "요약 카드 + 후속 조치 버튼" },
      ],
      actionItems: [
        "보고용 한 줄 요약 버튼 제공",
        "업로드 실패 원인과 재시도 버튼을 같은 박스에 배치",
        "경보 카드에서 바로 액션 보드로 이동",
      ],
    };
  }

  return {
    title: "점주 해설",
    content: `${focus}에 대해 점주가 가장 궁금한 것은 "그래서 지금 뭘 해야 하나"입니다. ${storeLabel} 기준으로는 수치 설명보다 오늘 할 일, 점심 피크 대응, 재방문 액션을 큰 버튼으로 제공하는 편이 훨씬 직관적입니다.`,
    evidence: [
      { label: "기준 매장", value: storeLabel },
      { label: "추천 UX", value: "버튼형 설명 + 카드 우클릭 액션" },
      { label: "입력 방식", value: "키보드 입력 최소화" },
    ],
    actionItems: [
      "매출 카드에 '왜 줄었지?' 버튼 추가",
      "객단가/재방문율 카드에 '지금 할 일' 버튼 추가",
      "표나 문장을 선택하면 '이 항목 해설' 말풍선 표시",
    ],
  };
}

export const FloatingAiChat: React.FC = () => {
  const location = useLocation();
  const guide = useMemo(() => resolveRouteGuide(location.pathname), [location.pathname]);
  const nextId = useRef(2);
  const [isOpen, setIsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<FloatingContext | null>(null);
  const [selectionBubble, setSelectionBubble] = useState<FloatingContext | null>(null);
  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 1,
      type: "system",
      title: guide.title,
      content: guide.subtitle,
      timestamp: nowLabel(),
      actionItems: ["카드를 클릭하거나 표의 문장을 선택하면 현재 화면 기준 해설을 바로 보여줍니다."],
    },
  ]);
  const currentAction = messages.find((message) => message.type === "action") ?? messages[0];
  const currentGuide = messages.find((message) => message.type === "assistant") ?? messages[0];

  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: "system",
        title: guide.title,
        content: guide.subtitle,
        timestamp: nowLabel(),
        actionItems: ["카드를 클릭하거나 표의 문장을 선택하면 현재 화면 기준 해설을 바로 보여줍니다."],
      },
    ]);
    setRecentTopics([]);
    nextId.current = 2;
  }, [guide]);

  useEffect(() => {
    const handleAssistEvent = (event: Event) => {
      const customEvent = event as CustomEvent<AssistDetail>;
      if (!customEvent.detail) return;
      pushInteraction(
        customEvent.detail.label,
        customEvent.detail.prompt,
        customEvent.detail.intent ?? "summary",
        customEvent.detail.contextText,
      );
    };

    window.addEventListener("agentgo-ai-assist", handleAssistEvent as EventListener);
    return () => {
      window.removeEventListener("agentgo-ai-assist", handleAssistEvent as EventListener);
    };
  }, [guide, location.pathname]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";
      if (!text || text.length < 3 || selection?.rangeCount === 0) {
        setSelectionBubble(null);
        return;
      }

      if (!selection) {
        setSelectionBubble(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) {
        setSelectionBubble(null);
        return;
      }

      setSelectionBubble({
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 12,
        text: trimText(text, 80),
      });
    };

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const container = target?.closest("main");
      if (!container) {
        setContextMenu(null);
        return;
      }
      if (target?.closest("input, textarea, [contenteditable='true']")) return;

      const text = trimText(target?.innerText ?? "", 80);
      if (!text) {
        setContextMenu(null);
        return;
      }

      event.preventDefault();
      setSelectionBubble(null);
      setContextMenu({
        x: event.clientX + window.scrollX,
        y: event.clientY + window.scrollY,
        text,
      });
    };

    const handleCloseFloatingMenus = () => {
      setContextMenu(null);
      setSelectionBubble(null);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("scroll", handleCloseFloatingMenus, true);
    document.addEventListener("click", handleCloseFloatingMenus);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("scroll", handleCloseFloatingMenus, true);
      document.removeEventListener("click", handleCloseFloatingMenus);
    };
  }, []);

  const pushInteraction = (label: string, prompt: string, intent: FloatingIntent, contextText?: string) => {
    const reply = buildAssistantReply(prompt, location.pathname, guide.storeLabel, contextText);
    setIsOpen(true);
    setRecentTopics((prev) => [label, ...prev.filter((item) => item !== label)].slice(0, 4));
    setMessages((prev) => [
      prev[0],
      {
        id: nextId.current++,
        type: "action",
        title: label,
        content: contextText ? `"${trimText(contextText, 56)}" 항목을 기준으로 해설을 엽니다.` : prompt,
        timestamp: nowLabel(),
      },
      {
        id: nextId.current++,
        type: "assistant",
        title: intent === "summary" ? reply.title : "추천 조치",
        content: reply.content,
        timestamp: nowLabel(),
        evidence: reply.evidence,
        actionItems: intent === "action" ? reply.actionItems : reply.actionItems?.slice(0, 2),
      },
    ]);
  };

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {selectionBubble && (
        <div
          className="pointer-events-auto absolute rounded-full border border-[#c9d8ff] bg-white px-3 py-2 shadow-xl"
          style={{ left: selectionBubble.x - 78, top: selectionBubble.y - 48 }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={() => pushInteraction("선택 항목 해설", "선택한 내용을 해설해줘", "summary", selectionBubble.text)}
            className="flex items-center gap-1.5 text-xs font-bold text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            이 항목 해설
          </button>
        </div>
      )}

      {contextMenu && (
        <div
          className="pointer-events-auto absolute w-56 overflow-hidden rounded-2xl border border-[#d5deec] bg-white shadow-2xl"
          style={{ left: contextMenu.x - 16, top: contextMenu.y - 16 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="border-b border-[#eef3ff] bg-[#f7faff] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-primary">AI 빠른 메뉴</p>
            <p className="mt-1 text-xs font-medium text-slate-600">{trimText(contextMenu.text, 52)}</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => pushInteraction("해설 보기", "이 블록을 해설해줘", "summary", contextMenu.text)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-[#f4f7ff]"
            >
              해설 보기
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={() => pushInteraction("추천 조치", "이 블록 기준으로 바로 할 일을 알려줘", "action", contextMenu.text)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-[#f4f7ff]"
            >
              추천 조치
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="pointer-events-auto mb-4 flex h-[580px] w-[400px] flex-col overflow-hidden rounded-[28px] border border-[#d5deec] bg-white shadow-2xl">
          <div className="border-b border-[#e7eefb] bg-[linear-gradient(135deg,#eef3ff_0%,#f8fbff_100%)] px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white bg-white shadow-sm">
                  <img src={Favicon} alt="AI" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{guide.title}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{guide.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-[#d5deec] bg-white p-2 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {guide.quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => pushInteraction(action.label, action.prompt, "summary")}
                  className="rounded-2xl border border-[#d5deec] bg-white px-3 py-3 text-left shadow-sm transition-colors hover:bg-[#f4f7ff]"
                >
                  <p className="text-xs font-black text-slate-900">{action.label}</p>
                  <p className="mt-1 text-[11px] font-medium leading-4 text-slate-500">{action.prompt}</p>
                </button>
              ))}
            </div>
            {recentTopics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {recentTopics.map((topic) => (
                  <span key={topic} className="rounded-full border border-[#d5deec] bg-white px-3 py-1 text-[10px] font-black text-slate-500">
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-[#f7faff] px-4 py-4">
            <div className="space-y-4">
              <article className="rounded-2xl border border-[#d5deec] bg-[#eef3ff] px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#d5deec] bg-white text-primary">
                    <MousePointerClick className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">현재 선택 항목</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{currentAction.timestamp}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">{currentAction.title}</p>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-700">{currentAction.content}</p>
              </article>

              <article className="rounded-2xl border border-[#c9d8ff] bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">{currentGuide.title}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{currentGuide.timestamp}</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium leading-6 text-slate-700">{currentGuide.content}</p>

                {currentGuide.evidence && currentGuide.evidence.length > 0 && (
                  <div className="mt-4 grid gap-2">
                    {currentGuide.evidence.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#eef3ff] bg-[#f7faff] px-3 py-2">
                        <span className="text-[11px] font-bold text-slate-400">{item.label}</span>
                        <span className="text-[11px] font-semibold text-slate-700">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {currentGuide.actionItems && currentGuide.actionItems.length > 0 && (
                  <div className="mt-4 space-y-2 rounded-2xl border border-[#eef3ff] bg-[#f7faff] p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-primary">추천 조치</p>
                    {currentGuide.actionItems.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                        <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              {recentTopics.length > 0 && (
                <article className="rounded-2xl border border-[#e7eefb] bg-white px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">최근 본 항목</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recentTopics.map((topic) => (
                      <span key={topic} className="rounded-full border border-[#d5deec] bg-[#f7faff] px-3 py-1 text-[10px] font-black text-slate-500">
                        {topic}
                      </span>
                    ))}
                  </div>
                </article>
              )}
            </div>
          </div>

          <div className="border-t border-[#e7eefb] bg-white px-4 py-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[#d5deec] bg-[#f7faff] px-3 py-3">
              <CircleHelp className="h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs font-medium leading-5 text-slate-600">
                키보드 입력 대신 화면의 카드, 문장, 표를 눌러 해설을 확인하세요. 이 패널은 대화창이 아니라 현재 화면을 설명하는 해설판처럼 동작합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen ? "border-slate-800 bg-slate-800 text-white" : "border-[#c9d8ff] bg-white text-primary",
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative h-8 w-8">
            <img src={Favicon} alt="AI" className="h-full w-full object-contain" />
            <span className="absolute -right-3 -top-3 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-black text-white">
              AI
            </span>
          </div>
        )}
      </button>
    </div>
  );
};
