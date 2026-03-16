import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Bot, Copy, RotateCcw, Send, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { getQnaSuggestions, parseCommand, simulateCommand, validateCommand } from "@/services/owner";

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
    content: "안녕하세요. 현재 DB에 적재된 실데이터 기준으로 매출, 취소율, 메뉴 마진, 가격 시뮬레이션을 답변합니다.",
    timestamp: "07:00",
  },
];

const MAX_CHARS = 500;

function formatAssistantMessage(
  intent: string,
  details: Record<string, unknown>,
  recommendation: string,
  confidence: number,
): Pick<Message, "content" | "evidence" | "confidence"> {
  if (intent === "query_sales") {
    return {
      content: `${String(details.store_name ?? "매장")}의 최신 매출은 ${Number(details.today_revenue ?? 0).toLocaleString()}원이며, 전일 대비 ${Number(details.revenue_vs_yesterday ?? 0).toLocaleString()}원 변화했습니다.`,
      evidence: [
        { label: "기준 일자", value: String(details.latest_date ?? "-") },
        { label: "결제건수", value: `${Number(details.transaction_count ?? 0).toLocaleString()}건` },
        { label: "평균 객단가", value: `${Number(details.avg_order_value ?? 0).toLocaleString()}원` },
        { label: "권장 해석", value: recommendation },
      ],
      confidence,
    };
  }

  if (intent === "query_cancel_rate") {
    return {
      content: `${String(details.store_name ?? "매장")}의 최신 취소율은 ${(Number(details.cancel_rate ?? 0) * 100).toFixed(2)}%입니다.`,
      evidence: [
        { label: "기준 일자", value: String(details.latest_date ?? "-") },
        { label: "매출", value: `${Number(details.today_revenue ?? 0).toLocaleString()}원` },
        { label: "결제건수", value: `${Number(details.transaction_count ?? 0).toLocaleString()}건` },
        { label: "권장 해석", value: recommendation },
      ],
      confidence,
    };
  }

  if (intent === "query_menu_margin") {
    return {
      content: `${String(details.menu_name ?? "메뉴")}의 원가율은 ${(Number(details.cost_rate ?? 0) * 100).toFixed(2)}%이며, 판매가는 ${Number(details.sales_price ?? 0).toLocaleString()}원입니다.`,
      evidence: [
        { label: "원가", value: `${Number(details.cost_amount ?? 0).toLocaleString()}원` },
        { label: "판매가", value: `${Number(details.sales_price ?? 0).toLocaleString()}원` },
        { label: "원가율", value: `${(Number(details.cost_rate ?? 0) * 100).toFixed(2)}%` },
        { label: "권장 해석", value: recommendation },
      ],
      confidence,
    };
  }

  if (intent === "simulate_price_update") {
    return {
      content: `${String(details.menu_name ?? "메뉴")} 가격을 ${Number(details.target_price ?? 0).toLocaleString()}원으로 조정하면 예상 마진 변화는 ${(Number(details.predicted_margin_rate ?? 0) * 100).toFixed(2)}% 수준입니다.`,
      evidence: [
        { label: "현재 가격", value: `${Number(details.current_price ?? 0).toLocaleString()}원` },
        { label: "목표 가격", value: `${Number(details.target_price ?? 0).toLocaleString()}원` },
        { label: "현재 마진율", value: `${(Number(details.current_margin_rate ?? 0) * 100).toFixed(2)}%` },
        { label: "예상 마진율", value: `${(Number(details.predicted_margin_rate ?? 0) * 100).toFixed(2)}%` },
        { label: "권장 해석", value: recommendation },
      ],
      confidence,
    };
  }

  return {
    content: recommendation,
    evidence: [],
    confidence,
  };
}

export const QnaPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([
    "어제 매출 왜 줄었어?",
    "취소율이 얼마나 돼?",
    "마진이 가장 낮은 메뉴는?",
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    let alive = true;
    getQnaSuggestions()
      .then((response) => {
        if (!alive || response.questions.length === 0) return;
        setSuggestions(response.questions);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const send = async () => {
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

    try {
      const parsed = await parseCommand({ command: text });
      const validation = await validateCommand({
        intent: parsed.intent,
        entities: parsed.entities,
      });

      let assistantMessage: Message;
      if (!validation.is_valid) {
        assistantMessage = {
          id: nextId.current++,
          role: "assistant",
          content: validation.errors.join(" "),
          evidence: validation.warnings.map((warning, index) => ({
            label: `주의 ${index + 1}`,
            value: warning,
          })),
          confidence: Math.round(parsed.confidence * 100),
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        };
      } else {
        const simulation = await simulateCommand({
          intent: parsed.intent,
          entities: parsed.entities,
        });
        const formatted = formatAssistantMessage(
          parsed.intent,
          simulation.details,
          simulation.recommendation,
          Math.round(parsed.confidence * 100),
        );
        assistantMessage = {
          id: nextId.current++,
          role: "assistant",
          content: formatted.content,
          evidence: formatted.evidence,
          confidence: formatted.confidence,
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          content: "현재 실데이터 답변을 생성하지 못했습니다. DB 적재 상태와 API 연결을 확인하세요.",
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI QnA</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">AgentGo Biz에게 질문하면 DB 적재 실데이터 기준으로 답변합니다.</p>
        </div>
        <button
          onClick={resetSession}
          className="flex items-center gap-1.5 rounded-lg border border-[#d5deec] bg-card px-3 py-2 text-sm text-[#4a5568] hover:bg-[#f4f7ff]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          새 세션
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-border/90 bg-card">
        <div className="space-y-1 p-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "assistant" ? "bg-[#eef3ff]" : "bg-[var(--muted)]"}`}>
                {msg.role === "assistant" ? <Bot className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
              </div>

              <div className={`flex max-w-[75%] flex-col space-y-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`rounded-2xl px-4 py-3 ${msg.role === "user" ? "rounded-tr-sm bg-primary text-white" : "rounded-tl-sm border border-[#d5deec] bg-[#f4f7ff] text-[#1a2138]"}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>

                {msg.evidence && msg.evidence.length > 0 && (
                  <div className="w-full rounded-xl border border-[#d5deec] bg-card p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--subtle-foreground)]">근거 데이터</p>
                    <div className="space-y-1.5">
                      {msg.evidence.map((ev) => (
                        <div key={ev.label} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{ev.label}</span>
                          <span className="font-medium text-[#34415b]">{ev.value}</span>
                        </div>
                      ))}
                    </div>
                    {msg.confidence !== undefined && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#d5deec]">
                          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${msg.confidence}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">신뢰도 {msg.confidence}%</span>
                      </div>
                    )}
                  </div>
                )}

                {msg.role === "assistant" && msg.id !== 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyText(msg.id, msg.content)}
                      className="flex items-center gap-1 rounded border border-[#d5deec] bg-card px-2 py-1 text-[10px] text-muted-foreground hover:bg-[#f4f7ff]"
                    >
                      <Copy className="h-3 w-3" />
                      {copiedId === msg.id ? "복사됨" : "복사"}
                    </button>
                    <button className="flex h-6 w-6 items-center justify-center rounded border border-[#d5deec] bg-card text-[var(--subtle-foreground)] hover:bg-[#f4f7ff]">
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button className="flex h-6 w-6 items-center justify-center rounded border border-[#d5deec] bg-card text-[var(--subtle-foreground)] hover:bg-[#f4f7ff]">
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <span className="text-[10px] text-[#b0bdd4]">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef3ff]">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-[#d5deec] bg-[#f4f7ff] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-[#d5deec] bg-card p-3">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요 (Enter로 전송, Shift+Enter 줄바꿈)"
              rows={2}
              className="w-full resize-none text-sm text-[#1a2138] placeholder-slate-300 focus:outline-none"
            />
            <div className="mt-1 text-right text-[10px] text-[#b0bdd4]">{input.length}/{MAX_CHARS}</div>
          </div>
          <button
            onClick={() => void send()}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((question) => (
            <button
              key={question}
              onClick={() => setInput(question)}
              className="rounded-full border border-[#d5deec] bg-[#f4f7ff] px-3 py-1 text-xs text-[#4a5568] hover:border-[#b8ccff] hover:text-primary"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
