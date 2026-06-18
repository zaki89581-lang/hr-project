import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Trash2, 
  User, 
  Clock, 
  Bot, 
  HelpCircle,
  CornerDownRight,
  ArrowLeft
} from "lucide-react";
import { motion } from "motion/react";

interface HRAssistantProps {
  user: { role: string; employee_id: string; name: string; nameAr: string };
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export default function HRAssistant({ user }: HRAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: `أهلاً بك يا ${user.nameAr} في المساعد الذكي لبوابة الموارد البشرية HR Portal! 🤖✨\n\nأنا هنا لمساعدتك في الاستفسار عن لوائح العمل، ومواعيد الدوام، وحساب رصيد الإجازات السنوية المستحقة والإجراءات البنكية. كيف يمكنني مساعدتك اليوم؟`,
      timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg("");
    setSending(true);

    // Context preparation for history parameter in Gemini
    const historyPayload = messages.map(m => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    try {
      const res = await fetch("/api/chat/hr-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-employee-id": user.employee_id
        },
        body: JSON.stringify({
          message: messageText,
          history: historyPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: "a-" + Date.now(),
          sender: "assistant",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          id: "err-" + Date.now(),
          sender: "assistant",
          text: "عذراً، أواجه صعوبة مؤقتة في الاتصال بنموذج الذكاء الاصطناعي. يرجى مراجعة إعدادات مفتاح API الخاص بك في لوحة السرية بالمنصة.",
          timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (e) {
      console.error(e);
      const assistantMsg: ChatMessage = {
        id: "err-net-" + Date.now(),
        sender: "assistant",
        text: "فشل الاتصال بالخادم الرئيسي للمساعد الذكي. تفقّد تفعيل السيرفر.",
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("هل ترغب في مسح سجل المحادثة الفعال للبدء من جديد؟")) {
      setMessages([
        {
          id: "init",
          sender: "assistant",
          text: `مرحباً مجدداً! تم تصفية السجل لمساعدتك. اسألني عن الرصيد، والمستندات، أو الهيكل الإداري للشركة.`,
          timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  const quickPrompts = [
    "كيف يمكنني حساب رصيد إجازاتي حالياً؟",
    "ماهي الخطوات والمستندات لإثبات شهادة تعريف راتب للبنك؟",
    "احسب بدل السكن والنقل لموظف براتب أساسي 10000 ريال",
    "من هو الأستاذ محمد زكي وما دوره؟"
  ];

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-180px)]" dir="rtl">
      
      {/* Upper header controls */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>مستشارك الذكي والمساعد الافتراضي (Bilingual AI)</span>
          </h2>
          <p className="text-[11px] text-slate-500">تم تدريبه للإجابة على جميع الأسئلة المهنية والتنظيمية للبوابة على مدار الساعة.</p>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border text-slate-600 rounded-xl font-bold flex items-center gap-1 text-[11px]"
          title="تصفية السجل"
        >
          <Trash2 className="w-4 h-4 text-slate-400" />
          <span>تصفية الشات</span>
        </button>
      </div>

      {/* Main chat output & right quick shortcuts split */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Chat window column */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm">
          
          {/* Chat scrolling feed */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((m) => {
              const isAssistant = m.sender === "assistant";
              return (
                <div key={m.id} className={`flex gap-3 max-w-[85%] ${isAssistant ? "mr-0 mr-auto flex-row text-right" : "ml-0 ml-auto flex-row-reverse text-right"}`}>
                  <div className={`p-2 rounded-full shrink-0 flex items-center justify-center w-8 h-8 h-fit ${
                    isAssistant ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-100 text-slate-600"
                  }`}>
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed font-bold ${
                    isAssistant 
                      ? "bg-slate-50 border-slate-100 text-slate-800 rounded-tr-none" 
                      : "bg-indigo-600 border-indigo-500 text-white rounded-tl-none font-semibold"
                  }`}>
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span className={`block text-[8px] mt-2 text-left ${isAssistant ? "text-slate-400" : "text-white/70"}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex gap-3 max-w-[80%] mr-0 mr-auto">
                <div className="p-2 rounded-full bg-indigo-50 text-indigo-600 w-8 h-8 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl rounded-tr-none text-xs text-slate-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce delay-200" />
                  <span>جاري صياغة الاستشارة الموثقة...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Form Message entry bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputMsg);
            }} 
            className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2shrink-0"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-grow pl-3 pr-4 py-2 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-xl text-xs"
              placeholder="اكتب استشارتك للمستشار الذكي (مثلاً: كيف أقدم إجازة مرضية؟)..."
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !inputMsg.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white rounded-xl transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>

        </div>

        {/* Right quick shortcut helper tags */}
        <div className="lg:col-span-1 bg-white p-4 border border-slate-200 rounded-2xl shrink-0 flex flex-col justify-start">
          <h4 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>أسئلة شائعة فـورية المقترحة</span>
          </h4>

          <div className="space-y-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="w-full text-right p-3 border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl text-[11px] font-black leading-snug text-slate-600 transition cursor-pointer flex items-center justify-between gap-1"
              >
                <span>{qp}</span>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed mt-6 text-center select-none bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
            🤖 يستقي المساعد الافتراضي الردود المطابقة فورياً من كشوفات وسجلات البوابة ودليل الموظفين.
          </p>
        </div>

      </div>

    </div>
  );
}
