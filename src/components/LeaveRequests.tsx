import { useState, useEffect, FormEvent } from "react";
import { 
  Plus, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText,
  User,
  Heart,
  HelpCircle
} from "lucide-react";

interface LeaveRequestsProps {
  user: { role: string; employee_id: string; name: string; nameAr: string };
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  type: "annual" | "sick" | "emergency";
  start_date: string;
  end_date: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
  created_at: string;
}

export default function LeaveRequests({ user }: LeaveRequestsProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Input states
  const [type, setType] = useState<"annual" | "sick" | "emergency">("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const isAdmin = user.role === "hr_admin";

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leave", {
        headers: { "x-user-role": user.role, "x-employee-id": user.employee_id }
      });
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error("Error reading leave requests:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const sDate = new Date(start);
    const eDate = new Date(end);
    const difference = eDate.getTime() - sDate.getTime();
    if (difference < 0) return 0;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!startDate || !endDate || !reason) {
      setError("الرجاء تحديد التواريخ وكتابة سبب الإجازة.");
      return;
    }

    const calcDays = calculateDays(startDate, endDate);
    if (calcDays <= 0) {
      setError("تاريخ نهاية الإجازة يجب أن يكون في نفس يوم المباشرة أو بعده.");
      return;
    }

    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-employee-id": user.employee_id
        },
        body: JSON.stringify({
          type,
          start_date: startDate,
          end_date: endDate,
          days: calcDays,
          reason
        })
      });

      if (res.ok) {
        setSuccess("تم تقديم طلب الإجازة بنجاح مع إحالة إشعار للقسم للمصادقة!");
        fetchRequests();
        setTimeout(() => {
          setShowApplyModal(false);
          setReason("");
          setStartDate("");
          setEndDate("");
        }, 1200);
      } else {
        const data = await res.json();
        setError(data.error || "فشل تقديم طلب الإجازة.");
      }
    } catch (err) {
      setError("خطأ في الشبكة");
    }
  };

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/leave/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-employee-id": user.employee_id
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchRequests();
      } else {
        const err = await res.json();
        alert(err.error || "خطأ غير متوقع");
      }
    } catch (e) {
      alert("خطأ في الاتصال بالخادم");
    }
  };

  const getLeaveTypeLabel = (t: "annual" | "sick" | "emergency") => {
    switch (t) {
      case "annual": return "إجازة سنوية (Annual)";
      case "sick": return "إجازة مرضية (Sick)";
      case "emergency": return "إجازة اضطرارية طارئة";
      default: return t;
    }
  };

  const getStatusBadge = (s: "pending" | "approved" | "rejected") => {
    switch (s) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold rounded-md">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>معتمدة ومصادقة</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-rose-50 text-rose-700 border border-rose-100 font-extrabold rounded-md">
            <XCircle className="w-3.5 h-3.5" />
            <span>مرفوضة من الإدارة</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 font-extrabold rounded-md">
            <Clock className="w-3.5 h-3.5" />
            <span>قيد المراجعة والاعتماد</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Upper banner controls */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">إدارة الإجازات والأعطال السنوية</h2>
          <p className="text-xs text-slate-500 mt-1">تقديم ومتابعة طلبات الإجازات السنوية، المرضية، والطارئة مع الحساب التلقائي للأيام والمصادقة.</p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setShowApplyModal(true);
            }}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>طلب إجازة جديدة</span>
          </button>
        )}
      </div>

      {/* Main requests queue */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
          <p className="text-xs font-bold text-slate-500">جاري مسح طلبات الإجازات...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 text-xs border border-slate-200 rounded-2xl">
          لا توجد طلبات إجازة نشطة في السجلات حالياً.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold">
                <tr>
                  <th className="p-4">اسم الموظف</th>
                  <th className="p-4">نوع الإجازة</th>
                  <th className="p-4">تاريخ الابتداء</th>
                  <th className="p-4">تاريخ المباشرة/التنتهي</th>
                  <th className="p-4 text-center">عدد الأيام</th>
                  <th className="p-4">السبب الأساسي</th>
                  <th className="p-4">الحالة الأمنية للطلب</th>
                  {isAdmin && <th className="p-4 text-center">إجراءات الموارد البشرية</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <p className="font-bold text-slate-900">{req.employee_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{req.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold">{getLeaveTypeLabel(req.type)}</td>
                    <td className="p-4 font-mono text-slate-600">{req.start_date}</td>
                    <td className="p-4 font-mono text-slate-600">{req.end_date}</td>
                    <td className="p-4 text-center font-black text-slate-900 font-mono bg-slate-50/40">{req.days} {req.days === 1 ? "يوم" : "أيام"}</td>
                    <td className="p-4 max-w-xs truncate text-[11px] text-slate-500" title={req.reason}>{req.reason}</td>
                    <td className="p-4">{getStatusBadge(req.status)}</td>
                    
                    {isAdmin && (
                      <td className="p-4 text-center">
                        {req.status === "pending" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(req.id, "approved")}
                              className="px-2.5 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-md transition cursor-pointer"
                            >
                              مصادقة
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.id, "rejected")}
                              className="px-2.5 py-1 text-[10px] bg-rose-600 hover:bg-rose-500 font-bold text-white rounded-md transition cursor-pointer"
                            >
                              رفض الطلب
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">مكتمل ومؤرشف</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Apply Modal popup */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-sky-500" />
                <span>تقديم طلب إجازة رسمي</span>
              </h3>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-200"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleApply} className="p-6 space-y-4 text-xs text-right">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-100 flex gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100 flex gap-1">
                  <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Leave Type Select */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5">نوع الإجازة المطلوبة *</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`p-2.5 border rounded-xl text-center cursor-pointer transition flex flex-col items-center gap-1.5 ${
                    type === "annual" ? "border-sky-500 bg-sky-50 text-sky-700 font-black" : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}>
                    <FileText className="w-4.5 h-4.5" />
                    <span>سنوية</span>
                    <input type="radio" name="leavetype" checked={type === "annual"} onChange={() => setType("annual")} className="sr-only" />
                  </label>

                  <label className={`p-2.5 border rounded-xl text-center cursor-pointer transition flex flex-col items-center gap-1.5 ${
                    type === "sick" ? "border-amber-500 bg-amber-50/40 text-amber-700 font-black" : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}>
                    <Heart className="w-4.5 h-4.5" />
                    <span>مرضية</span>
                    <input type="radio" name="leavetype" checked={type === "sick"} onChange={() => setType("sick")} className="sr-only" />
                  </label>

                  <label className={`p-2.5 border rounded-xl text-center cursor-pointer transition flex flex-col items-center gap-1.5 ${
                    type === "emergency" ? "border-rose-500 bg-rose-50 text-rose-700 font-black" : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}>
                    <HelpCircle className="w-4.5 h-4.5" />
                    <span>اضطرارية</span>
                    <input type="radio" name="leavetype" checked={type === "emergency"} onChange={() => setType("emergency")} className="sr-only" />
                  </label>
                </div>
              </div>

              {/* Start and end dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">تاريخ من (ابتداءً من) *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">تاريخ نهاية الإجازة *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold flex justify-between items-center text-[11px] border border-slate-200 border-dashed">
                  <span>مدة الإجازة المحسوبة:</span>
                  <span className="text-slate-900 font-extrabold">{calculateDays(startDate, endDate)} يوم خدمي</span>
                </div>
              )}

              {/* Reason box description */}
              <div>
                <label className="block text-slate-600 font-bold mb-1">سبب ومبررات الإجازة بالتفصيل *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  placeholder="يرجى كتابة سبب الإيجاد بالتفصيل لمراجعة المسؤول..."
                  required
                />
              </div>

              {/* Modal controls actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-3 py-1.5 hover:bg-slate-50 text-slate-500 border border-slate-200 font-bold rounded-lg transition"
                >
                  إلغاء المعالجة
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
                >
                  تقديم الطلب للمصادقة
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
