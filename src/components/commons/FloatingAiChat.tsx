import type React from "react";
import { useRef, useState, useEffect } from "react";
import { Send, Bot, User, X, MessageSquare, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
    content: "안녕하세요! AgentGo AI 매니저입니다. 현재 페이지의 데이터나 매장 운영에 대해 궁금한 점을 질문해 주세요.",
    timestamp: "오전 07:00",
  },
];

const mockResponses: Record<string, Message> = {
  default: {
    id: 0,
    role: "assistant",
    content: "현재 분석 결과, 비피크 시간대 매출 보완을 위한 타임 프로모션 실행을 권장합니다. 특히 14시~16시 사이의 객수 유입이 전주 대비 낮게 나타나고 있습니다.",
    evidence: [
      { label: "신뢰도", value: "91%" },
      { label: "분석 기준", value: "실시간 POS 데이터" },
    ],
    confidence: 91,
    timestamp: "",
  },
  매출: {
    id: 0,
    role: "assistant",
    content: "이번 주 누적 매출은 870,000원으로 전주 대비 -12%입니다. 객수(-18%) 감소가 주 원인으로 파악됩니다.",
    evidence: [
      { label: "분석 기간", value: "최근 7일" },
      { label: "객단가", value: "7,016원 (+2.3%)" },
    ],
    confidence: 94,
    timestamp: "",
  },
};

export const FloatingAiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [isOpen, messages]);

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
      const res = text.includes("매출") ? mockResponses["매출"] : mockResponses["default"];
      const aiMsg: Message = {
        ...res,
        id: nextId.current++,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">AgentGo AI 어시스턴트</p>
                <p className="text-[10px] opacity-80">실시간 매장 운영 분석 중</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setMessages(initialMessages)}
                className="rounded p-1 hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-[#F8FAFF] p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                    msg.role === "assistant" ? "bg-primary shadow-sm" : "bg-slate-400 shadow-sm"
                  )}>
                    {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={cn("flex max-w-[80%] flex-col gap-1.5", msg.role === "user" ? "items-end" : "items-start")}>
                    <div className={cn(
                      "rounded-2xl px-3 py-2 text-sm shadow-sm",
                      msg.role === "user" 
                        ? "rounded-tr-sm bg-primary text-white" 
                        : "rounded-tl-sm border border-[#DCE4F3] bg-white text-slate-800"
                    )}>
                      {msg.content}
                    </div>
                    {msg.evidence && (
                      <div className="w-full rounded-xl border border-[#DCE4F3] bg-white/50 p-2.5 shadow-sm">
                        <p className="mb-1.5 text-[10px] font-bold text-primary">ANALYSIS BASIS</p>
                        <div className="space-y-1">
                          {msg.evidence.map((ev) => (
                            <div key={ev.label} className="flex justify-between text-[11px]">
                              <span className="text-slate-400">{ev.label}</span>
                              <span className="font-semibold text-slate-600">{ev.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-[#DCE4F3] bg-white px-3 py-2 shadow-sm">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#DCE4F3] bg-[#F8FAFF] px-3 py-1.5 transition-all focus-within:border-primary/50 focus-within:bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="질문을 입력하세요..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button 
                onClick={send}
                disabled={!input.trim() || loading}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex gap-1.5">
              {["매출 분석", "이탈 징후"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setInput(tag)}
                  className="rounded-full border border-[#DCE4F3] bg-white px-2 py-0.5 text-[10px] text-slate-500 hover:border-primary/50 hover:text-primary"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen ? "bg-slate-800 text-white" : "bg-primary text-white"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
            1
          </span>
        )}
      </button>
    </div>
  );
};
