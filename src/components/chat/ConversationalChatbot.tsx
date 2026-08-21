"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Star, 
  Calendar, 
  UploadCloud, 
  CheckCircle2, 
  RotateCcw, 
  Loader2, 
  FileCheck,
  ChevronRight,
  MessageSquareQuote
} from "lucide-react";
import { FormFieldType } from "@/lib/validations/form";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  fieldId?: string | null;
  options?: string[];
  type?: string;
}

interface ConversationalChatbotProps {
  form: {
    id: string;
    title: string;
    description?: string | null;
    fieldsJson: FormFieldType[];
    themeColor?: string;
    botName?: string;
    botAvatar?: string;
  };
  isEmbed?: boolean;
}

export function ConversationalChatbot({ form, isEmbed = false }: ConversationalChatbotProps) {
  const fields = form.fieldsJson || [];
  const accent = form.themeColor || "#4f46e5";
  const botName = form.botName || "FormAI Assistant";
  const botAvatar = form.botAvatar || "🤖";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Scroll the thread container directly after paint — scrollIntoView with
  // smooth behavior gets interrupted while new content is still rendering,
  // leaving the latest message clipped at the bottom.
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = threadRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, isCompleted]);

  // Initial greeting
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const startChat = async () => {
      setLoading(true);
      const initialUserPrompt = "Hello! I am ready to start.";

      try {
        const res = await fetch(`/api/forms/${form.id}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: initialUserPrompt }],
            collectedData: {},
          }),
        });

        const data = await res.json();
        if (data.conversationId) setConversationId(data.conversationId);
        if (data.reply) {
          const activeField = fields.find((f) => f.id === data.nextActiveFieldId);
          setMessages([
            {
              id: "msg_init",
              role: "assistant",
              content: data.reply,
              timestamp: new Date(),
              fieldId: data.nextActiveFieldId,
              options: activeField?.options,
              type: activeField?.type,
            },
          ]);
          setCurrentFieldId(data.nextActiveFieldId);
          setCollectedData(data.updatedData || {});
        }
      } catch (err) {
        console.error("Initial chat greeting error:", err);
        setMessages([
          {
            id: "msg_fallback",
            role: "assistant",
            content: `Hi there! 👋 Welcome to ${form.title}. Let's get started! What is your ${fields[0]?.label || "name"}?`,
            timestamp: new Date(),
            fieldId: fields[0]?.id,
            options: fields[0]?.options,
            type: fields[0]?.type,
          },
        ]);
        setCurrentFieldId(fields[0]?.id || null);
      } finally {
        setLoading(false);
      }
    };

    startChat();
  }, [form.id, form.title, fields, sessionKey]);

  const handleSendMessage = async (customContent?: string, fieldAnswerKey?: string, fieldAnswerValue?: any) => {
    const textToSend = customContent !== undefined ? customContent : input;
    if (!textToSend.trim() || loading || isCompleted) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const updatedClientData = { ...collectedData };
    if (fieldAnswerKey && fieldAnswerValue !== undefined) {
      updatedClientData[fieldAnswerKey] = fieldAnswerValue;
      setCollectedData(updatedClientData);
    }

    try {
      const res = await fetch(`/api/forms/${form.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          collectedData: updatedClientData,
          conversationId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      if (data.conversationId) setConversationId(data.conversationId);

      const nextField = fields.find((f) => f.id === data.nextActiveFieldId);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
          fieldId: data.nextActiveFieldId,
          options: nextField?.options,
          type: nextField?.type,
        },
      ]);

      setCollectedData(data.updatedData || {});
      setCurrentFieldId(data.nextActiveFieldId || null);

      if (data.isComplete) {
        setIsCompleted(true);
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: "assistant",
          content: "Sorry, I had trouble processing that. Could you please try again?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // In-place restart: clear state and re-run the greeting, no page reload
  const handleResetChat = () => {
    hasInitialized.current = false;
    setMessages([]);
    setInput("");
    setCollectedData({});
    setIsCompleted(false);
    setCurrentFieldId(null);
    setConversationId(null); // a restart begins a fresh transcript
    setSessionKey((k) => k + 1);
  };

  // Calculate progress
  const answeredCount = Object.keys(collectedData).filter(
    (k) => collectedData[k] !== undefined && collectedData[k] !== null && collectedData[k] !== ""
  ).length;
  const progressPercent = Math.min(100, Math.round((answeredCount / Math.max(1, fields.length)) * 100));

  const activeField = fields.find((f) => f.id === currentFieldId);

  return (
    <div className={`flex flex-col h-full bg-white ${isEmbed ? "rounded-none" : "rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden max-w-3xl mx-auto"} min-h-[580px] max-h-[85vh]`}>
      {/* Bot Header */}
      <header
        className="text-white p-4 sm:p-5 flex items-center justify-between shadow-md"
        style={{ background: `linear-gradient(120deg, #0f172a 0%, ${accent} 130%)` }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md bg-white/15 border border-white/20"
              aria-hidden="true"
            >
              {botAvatar}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base tracking-tight line-clamp-1">{botName}</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-white/15 border border-white/20 text-white/90 rounded-full">
                AI Agent
              </span>
            </div>
            <p className="text-xs text-white/70 line-clamp-1">{form.title}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition text-xs flex items-center gap-1"
          title="Restart Conversation"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Restart</span>
        </button>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%`, backgroundColor: accent }}
        ></div>
      </div>

      {/* Messages Thread */}
      <div ref={threadRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50">
        {messages.map((msg, msgIdx) => {
          const isBot = msg.role === "assistant";
          // Interactive widgets only stay live on the latest message —
          // answering an old question again would corrupt collected data
          const isLatest = msgIdx === messages.length - 1;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isBot ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              {isBot && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base shadow-sm bg-white border border-slate-200"
                  aria-hidden="true"
                >
                  {botAvatar}
                </div>
              )}

              <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isBot
                      ? "bg-white text-slate-900 border border-slate-200/90 shadow-sm rounded-bl-sm"
                      : "text-white shadow-md rounded-br-sm font-medium"
                  }`}
                  style={isBot ? undefined : { backgroundColor: accent }}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Inline Rating Widget inside Bot Message */}
                  {isBot && isLatest && msg.type === "rating" && !isCompleted && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Tap a star to rate:</p>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleSendMessage(`${star} Stars`, msg.fieldId || undefined, star)}
                            className="p-1.5 rounded-lg hover:scale-125 transition focus:outline-none"
                          >
                            <Star className="w-6 h-6 text-amber-400 fill-amber-400 hover:text-amber-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Options Pills */}
                  {isBot && isLatest && msg.options && msg.options.length > 0 && !isCompleted && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(opt, msg.fieldId || undefined, opt)}
                          className="text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 px-3 py-1.5 rounded-xl transition shadow-sm hover:shadow active:scale-95"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Inline Date Shortcut */}
                  {isBot && isLatest && msg.type === "date" && !isCompleted && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <input
                        type="date"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleSendMessage(e.target.value, msg.fieldId || undefined, e.target.value);
                          }
                        }}
                        className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 px-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 bg-white rounded-xl border border-slate-100 max-w-[160px] shadow-sm animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>AI is replying...</span>
          </div>
        )}

        {isCompleted && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in zoom-in-95 duration-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-emerald-950">Submission Complete!</h3>
            <p className="text-xs text-emerald-700 max-w-sm mx-auto">
              Your answers have been stored securely. Thank you for completing this form.
            </p>
            <button
              type="button"
              onClick={handleResetChat}
              className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              Submit Another Response
            </button>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Composer */}
      {!isCompleted ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={
              activeField
                ? `Answer for "${activeField.label}" or ask anything...`
                : "Type your message or answer here..."
            }
            className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{ backgroundColor: accent }}
            className="w-11 h-11 rounded-2xl hover:opacity-90 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Conversation concluded.
        </div>
      )}
    </div>
  );
}
