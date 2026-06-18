import { useState, useEffect, FormEvent } from "react";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  User, 
  X,
  CheckCircle,
  Tag
} from "lucide-react";

interface AnnouncementsProps {
  user: { role: string; employee_id: string; name: string; nameAr: string };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "high";
  category: string;
  author: string;
  created_at: string;
}

export default function Announcements({ user }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Input states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "high">("normal");
  const [category, setCategory] = useState("تعميم عام");

  const isAdmin = user.role === "hr_admin";

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !content || !category) {
      setError("الرجاء تعبئة العنوان والمحتوى بالكامل لتجنب الأخطاء.");
      return;
    }

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-employee-id": user.employee_id
        },
        body: JSON.stringify({
          title,
          content,
          priority,
          category,
          author: user.nameAr
        })
      });

      if (res.ok) {
        setSuccess("تم نشر وإذاعة التعميم الجديد بنجاح في جميع لوحات الموظفين!");
        fetchAnnouncements();
        setTimeout(() => {
          setShowAddModal(false);
          setTitle("");
          setContent("");
          setPriority("normal");
          setCategory("تعميم عام");
        }, 1200);
      } else {
        setError("فشل نشر التعميم الرئاسي.");
      }
    } catch (err) {
      setError("خطأ في الاتصال بالشبكة.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل ترغب في سحب هذا التعميم وحذفه نهائياً من اللوحة القيادية؟")) return;

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": user.role,
          "x-employee-id": user.employee_id
        }
      });

      if (res.ok) {
        fetchAnnouncements();
      } else {
        alert("فشل في حذف التعميم.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Upper header controls */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
            <Megaphone className="w-5 h-5 text-indigo-500" />
            <span>التعاميم واللوحة الإخبارية للشركة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">تنبيهات وأخبار الموارد البشرية الرسمية وتوجيهات السلامة والقرارات الرئاسية الفورية.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>نشر تعميم رسمي عاجل</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
          <p className="text-xs font-bold text-slate-500">جاري قراءة لوحة الإعلانات والتعاميم...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 text-xs border border-slate-200 rounded-2xl">
          لا توجد أي إعادات أو أخبار منشورة على الجدار الإخباري حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div 
              key={ann.id} 
              className={`p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between ${
                ann.priority === "high" ? "border-rose-300 ring-2 ring-rose-500/5 bg-rose-50/10" : ""
              }`}
            >
              {/* Top Priority Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-md flex items-center gap-1 border ${
                  ann.priority === "high" 
                    ? "bg-rose-50 text-rose-700 border-rose-100" 
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  <Tag className="w-3 h-3" />
                  <span>{ann.category}</span>
                </span>
                
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ann.created_at}</span>
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-900">{ann.title}</h3>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pb-2">{ann.content}</p>
              </div>

              {/* Extra details (by mohamed zaki) and actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold bg-slate-50/40 p-2 rounded-xl mt-3 shrink-0">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>المرسل: {ann.author}</span>
                </span>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-500 rounded transition flex items-center gap-1 cursor-pointer font-bold shrink-0 text-[10px]"
                    title="حذف الإعلان"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إلغاء الإذاعة</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Broadcaster announcement Form popup modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl w-full max-w-md overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Megaphone className="w-5 h-5 text-indigo-500" />
                <span>إذاعة ونشر قرار تعميم رسمي</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 bg-white border border-slate-200 hover:text-slate-600 rounded">✕</button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs text-right">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-100 flex gap-2">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100 flex gap-1.5">
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-bold mb-1">عنوان التعميم الرئيسي *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="مثال: تغيير مواقيت الدوام لعام 2026..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">المجال / الفئة *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="تعميم عام">تعميم عام (HR Notice)</option>
                    <option value="توجيهات سلامة">تحديثات اللوائح والنظام</option>
                    <option value="مواعيد العمل">مواعيد الدوام والعطل</option>
                    <option value="رئاسي عاجل">قرارات قيادية رئاسية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">مستوى الأولوية والتنبيه *</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="normal">عادي (Normal Feed)</option>
                    <option value="high">هام وعاجل جداً (High Alert)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">محتوى الإعلان والقرار بالتفصيل *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  placeholder="اكتب التوجيهات بالتفصيل لموظفي الشركة والمقر الرئيسي..."
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 select-none text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 hover:bg-slate-50 text-slate-500 border border-slate-200 font-bold rounded-lg transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
                >
                  نشر وإذاعة التعميم
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
