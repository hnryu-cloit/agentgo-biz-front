import type React from "react";
import { useRef, useState } from "react";
import { Send, Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  evidence?: { label: string; value: string }[];
  confidence?: number;
  timestamp: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "안녕하세요! AI 매니저입니다. 매장 운영에 관해 궁금한 것을 자유롭게 질문해 주세요. 매출, 고객, 마진, 캠페인 등 다양한 주제를 분석해 드립니다.",
    timestamp: "07:00",
  },
];

const mockResponses: Record<string, Message> = {
  default: {
    id: 0,
    role: "assistant",
    content:
      "지난주 대비 매출이 12% 감소했습니다. 주요 원인은 비피크 시간대(14~17시) 객수 감소(-31%)와 우천 영향입니다. 금일 배달 주문이 +23% 예상되므로 세트A 타임 프로모션을 권장드립니다.",
    evidence: [
      { label: "분석 기간", value: "2026-02-28 ~ 2026-03-07" },
      { label: "비교 기준", value: "전주 동요일 평균" },
      { label: "신뢰도 기반 데이터", value: "POS 매출 + 날씨 API" },
    ],
    confidence: 91,
    timestamp: "",
  },
  매출: {
    id: 0,
    role: "assistant",
    content:
      "이번 주 누적 매출은 870,000원으로 전주 대비 -12%입니다. 객수(-18%)가 주 원인이며 객단가는 +2.3% 개선되었습니다. 피크타임(12~13시)은 전주 수준을 유지하고 있으나 오후 슬롯이 취약합니다.",
    evidence: [
      { label: "분석 기간", value: "2026-03-01 ~ 2026-03-07" },
      { label: "피크타임 매출 비중", value: "34%" },
      { label: "객단가 추이", value: "7,016원 (+2.3%)" },
    ],
    confidence: 94,
    timestamp: "",
  },
  이탈: {
    id: 0,
    role: "assistant",
    content:
      "이탈 징후 고객이 42명 탐지되었습니다. 평균 미방문 기간이 34일로 증가했으며, 이 중 60일 이상 미방문 고객이 18명입니다. 유사 캠페인 복귀율 24% 기준으로 쿠폰 발송 시 약 12명 복귀가 예상됩니다.",
    evidence: [
      { label: "이탈 기준", value: "30일 이상 미방문" },
      { label: "탐지 고객 수", value: "42명" },
      { label: "예상 ROI", value: "3.8x" },
    ],
    confidence: 87,
    timestamp: "",
  },
};

function getResponse(input: string): Message {
  const lower = input.toLowerCase();
  if (lower.includes("매출") || lower.includes("실적")) return mockResponses["매출"];
  if (lower.includes("이탈") || lower.includes("고객")) return mockResponses["이탈"];
  return mockResponses["default"];
}

const MAX_CHARS = 500;

export const QnaPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: nextId.current++,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const res = getResponse(text);
      const aiMsg: Message = {
        ...res,
        id: nextId.current++,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 1400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const copyText = (id: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const resetSession = () => {
    setMessages(initialMessages);
    setInput("");
    nextId.current = 2;
  };

  return (
    <div className="flex h-[calc(100vh-68px-48px)] flex-col gap-0">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI QnA</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            AI 매니저에게 자유롭게 질문하세요. 근거 데이터와 함께 답변드립니다.
          </p>
        </div>
        <button
          onClick={resetSession}
          className="flex items-center gap-1.5 rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-600 hover:bg-[#F8FAFF]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          새 세션
        </button>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border/90 bg-card">
        <div className="space-y-1 p-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "assistant" ? "bg-[#EEF4FF]" : "bg-slate-100"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-slate-500" />
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-primary text-white"
                      : "rounded-tl-sm border border-[#DCE4F3] bg-[#F7FAFF] text-slate-800"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>

                {/* Evidence */}
                {msg.evidence && (
                  <div className="w-full rounded-xl border border-[#DCE4F3] bg-white p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      근거 데이터
                    </p>
                    <div className="space-y-1.5">
                      {msg.evidence.map((ev) => (
                        <div key={ev.label} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{ev.label}</span>
                          <span className="font-medium text-slate-700">{ev.value}</span>
                        </div>
                      ))}
                    </div>
                    {msg.confidence !== undefined && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#DCE4F3]">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${msg.confidence}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">신뢰도 {msg.confidence}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {msg.role === "assistant" && msg.id !== 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyText(msg.id, msg.content)}
                      className="flex items-center gap-1 rounded border border-[#DCE4F3] bg-white px-2 py-1 text-[10px] text-slate-500 hover:bg-[#F8FAFF]"
                    >
                      <Copy className="h-3 w-3" />
                      {copiedId === msg.id ? "복사됨" : "복사"}
                    </button>
                    <button className="flex h-6 w-6 items-center justify-center rounded border border-[#DCE4F3] bg-white text-slate-400 hover:bg-[#F8FAFF]">
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button className="flex h-6 w-6 items-center justify-center rounded border border-[#DCE4F3] bg-white text-slate-400 hover:bg-[#F8FAFF]">
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <span className="text-[10px] text-slate-300">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="mt-3 rounded-2xl border border-[#DCE4F3] bg-white p-3">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요 (Enter로 전송, Shift+Enter 줄바꿈)"
              rows={2}
              className="w-full resize-none text-sm text-slate-800 placeholder-slate-300 focus:outline-none"
            />
            <div className="mt-1 text-right text-[10px] text-slate-300">
              {input.length}/{MAX_CHARS}
            </div>
          </div>
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Suggestion chips */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["어제 매출 왜 줄었어?", "이탈 고객은 몇 명이야?", "마진이 가장 낮은 메뉴는?"].map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="rounded-full border border-[#DCE4F3] bg-[#F7FAFF] px-3 py-1 text-xs text-slate-600 hover:border-[#BFD4FF] hover:text-primary"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};