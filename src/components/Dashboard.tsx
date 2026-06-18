import { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  MapPin, 
  Briefcase, 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  ChevronLeft,
  CalendarDays,
  Play,
  SquareCheck
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  user: { role: string; employee_id: string; name: string; nameAr: string };
  setCurrentTab: (tab: string) => void;
}

interface StatsData {
  totalEmployees: number;
  totalCandidates: number;
  activeJobs: number;
  pendingLeaves: number;
  recentAnnouncementsCount: number;
  attendanceTodayCount: number;
  departmentDistribution: Record<string, number>;
}

export default function Dashboard({ user, setCurrentTab }: DashboardProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceToday, setAttendanceToday] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const isAdmin = user.role === "hr_admin";

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Stats
      const statsRes = await fetch("/api/dashboard/stats", {
        headers: { "x-user-role": user.role, "x-employee-id": user.employee_id }
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch Attendance for active user
      const attendRes = await fetch("/api/attendance", {
        headers: { "x-user-role": user.role, "x-employee-id": user.employee_id }
      });
      const attendData = await attendRes.json();
      const todayStr = new Date().toISOString().substring(0, 10);
      const todayRecord = attendData.find((rec: any) => rec.date === todayStr);
      setAttendanceToday(todayRecord || null);

      // 3. Fetch announcements
      const annRes = await fetch("/api/announcements");
      const annData = await annRes.json();
      setAnnouncements(annData.slice(0, 3)); // Top 3
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleClockIn = async () => {
    setActionLoading(true);
    setActionMsg("");
    try {
      const res = await fetch("/api/attendance/clock-in", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": user.role, 
          "x-employee-id": user.employee_id 
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceToday(data);
        setActionMsg("تم تسجيل حضورك بنجاح! طاب يومك.");
        fetchDashboardData();
      } else {
        const err = await res.json();
        setActionMsg(err.error || "خطأ غير متوقع");
      }
    } catch (e) {
      setActionMsg("خطأ في الاتصال بالشبكة");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setActionMsg("");
    try {
      const res = await fetch("/api/attendance/clock-out", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": user.role, 
          "x-employee-id": user.employee_id 
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceToday(data);
        setActionMsg("تم تسجيل انصرافك بنجاح. نراك غداً على خير!");
        fetchDashboardData();
      } else {
        const err = await res.json();
        setActionMsg(err.error || "خطأ غير متوقع");
      }
    } catch (e) {
      setActionMsg("خطأ في الاتصال بالشبكة");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500">جاري تحميل بيانات البوابة...</p>
      </div>
    );
  }

  // Attendance status configs
  const getAttendanceStatusBadge = () => {
    if (!attendanceToday) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-extrabold rounded-md">
          لم تسجل دخولك اليوم
        </span>
      );
    }
    if (attendanceToday.clock_out) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-sky-50 text-sky-600 border border-sky-100 font-extrabold rounded-md">
          منصرف ({attendanceToday.clock_out})
        </span>
      );
    }
    if (attendanceToday.status === "late") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 font-extrabold rounded-md">
          حاضر (متأخر)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold rounded-md">
        على رأس العمل (دخول {attendanceToday.clock_in})
      </span>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-extrabold">بوابة الخدمة الذاتية دائمًا في خدمتك</span>
          <h2 className="text-xl font-black text-slate-900 mt-1">مرحباً بك، {user.nameAr}</h2>
          <p className="text-xs text-slate-500 mt-1">
            اليوم هو {new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Attendance interactive tool */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
          <div className="text-right">
            <span className="block text-[10px] font-bold text-slate-400">حالة حضورك اليوم</span>
            <div className="mt-0.5">{getAttendanceStatusBadge()}</div>
          </div>
          <div className="flex gap-2">
            {!attendanceToday ? (
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-400 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 rotate-180" />
                <span>حضور</span>
              </button>
            ) : !attendanceToday.clock_out ? (
              <button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-400 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>انصراف</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {actionMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 text-xs font-bold text-sky-800 bg-sky-50 border border-sky-100 rounded-xl"
        >
          {actionMsg}
        </motion.div>
      )}

      {/* Grid statistics highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin ? (
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400">الموظفين الفعّالين</span>
              <span className="text-2xl font-black text-slate-900">{stats?.totalEmployees || 0}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400">الرقم الوظيفي</span>
              <span className="text-lg font-black text-slate-900 font-mono mt-0.5">{user.employee_id}</span>
            </div>
          </div>
        )}

        {isAdmin ? (
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400">الوظائف النشطة</span>
              <span className="text-2xl font-black text-slate-900">{stats?.activeJobs || 0}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400">طلب إجازة معلّق</span>
              <span className="text-2xl font-black text-slate-900">{stats?.pendingLeaves || 0}</span>
            </div>
          </div>
        )}

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400">الإجازات المعلّقة</span>
            <span className="text-2xl font-black text-slate-900">{stats?.pendingLeaves || 0}</span>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400">الإعلانات النشطة</span>
            <span className="text-2xl font-black text-slate-900">{stats?.recentAnnouncementsCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Main dashboard widgets splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Shortcuts */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">روابط سريعة للخدمات</h3>
            <div className="grid grid-cols-1 gap-2.5">
              <button 
                onClick={() => setCurrentTab("leave")}
                className="flex items-center justify-between p-3 border border-slate-200 hover:border-sky-500 hover:bg-sky-50/20 rounded-xl text-right text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                <span>تقديم طلب إجازة بالثواني</span>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <button 
                onClick={() => setCurrentTab("payslips")}
                className="flex items-center justify-between p-3 border border-slate-200 hover:border-sky-500 hover:bg-sky-50/20 rounded-xl text-right text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                <span>طباعة شهادة التعريف بالراتب</span>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <button 
                onClick={() => setCurrentTab("ai-assistant")}
                className="flex items-center justify-between p-3 border border-slate-200 hover:border-sky-500 hover:bg-sky-50/20 rounded-xl text-right text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                <span>الحديث مع ذكاء مساعد الموارد البشرية</span>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-500">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>رصيدك الإجازاتي يتراكم تلقائياً بمقدار 1.75 يوماً شهرياً.</span>
          </div>
        </div>

        {/* Recent Announcements feed widget */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">أهم الإعلانات والتعاميم</h3>
            <button 
              onClick={() => setCurrentTab("announcements")} 
              className="text-[10px] font-bold text-sky-600 hover:underline cursor-pointer"
            >
              عرض الكل ({stats?.recentAnnouncementsCount || 0})
            </button>
          </div>
          {announcements.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">لا تتوفر إعلانات منشورة حديثاً.</div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div 
                  key={ann.id} 
                  onClick={() => setCurrentTab("announcements")}
                  className="p-3.5 border border-slate-100 hover:bg-slate-50 rounded-xl transition cursor-pointer flex justify-between items-start gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded ${
                        ann.priority === "high" 
                          ? "bg-rose-50 text-rose-700 border border-rose-100" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {ann.priority === "high" ? "هام وعاجل" : ann.category}
                      </span>
                      <h4 className="text-xs font-black text-slate-900">{ann.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5">{ann.content}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-bold">{ann.created_at}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Distribution block */}
      {isAdmin && stats?.departmentDistribution && (
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">توزيع الموظفين حسب الأقسام</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.departmentDistribution).map(([dept, count]: [string, any]) => {
              const max = Math.max(...(Object.values(stats.departmentDistribution) as number[]));
              const percent = max > 0 ? (count / max) * 100 : 0;
              return (
                <div key={dept} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-700">{dept}</span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      {count} {count === 1 ? "موظف" : "موظفين"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-2">
                    <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
