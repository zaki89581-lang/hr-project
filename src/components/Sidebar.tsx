import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Files, 
  TrendingUp, 
  Network, 
  MessageSquare, 
  Bell, 
  LogOut,
  CalendarCheck,
  UserCheck
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: { role: string; employee_id: string; name: string; nameAr: string };
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout }: SidebarProps) {
  const isAdmin = user.role === "hr_admin";

  const navigationItems = [
    { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, adminOnly: false },
    { id: "employees", label: isAdmin ? "إدارة الموظفين" : "بياناتي الشخصية", icon: Users, adminOnly: false },
    { id: "leave", label: "طلبات الإجازات", icon: Calendar, adminOnly: false },
    { id: "payslips", label: "الرواتب والتعريفات", icon: Files, adminOnly: false },
    { id: "announcements", label: "الإعلانات والتعاميم", icon: Bell, adminOnly: false },
    { id: "recruitment", label: "التوظيف واستقطاب الكفاءات", icon: TrendingUp, adminOnly: true },
    { id: "org-chart", label: "الهيكل التنظيمي", icon: Network, adminOnly: false },
    { id: "ai-assistant", label: "المساعد الذكي (AI)", icon: MessageSquare, adminOnly: false },
  ];

  return (
    <aside className="w-68 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen border-l border-slate-800" dir="rtl">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-md font-extrabold text-white tracking-tight">HR Portal</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">نظام الكفاءات المتكامل</p>
          </div>
        </div>
      </div>

      {/* User Status Profile */}
      <div className="p-4 mx-3 my-4 bg-slate-800/50 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 font-black text-white flex items-center justify-center border border-slate-600">
            {user.nameAr.charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-slate-100 truncate">{user.nameAr}</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.employee_id}</p>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400">الصفة:</span>
          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md ${
            isAdmin 
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}>
            {isAdmin ? "مدير النظام" : "موظف"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                isActive 
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" 
                  : "hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer log-out info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>يونيو 2026</span>
          </span>
          <span className="font-mono">v1.2.5</span>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold bg-slate-800/40 hover:bg-rose-950/30 hover:text-rose-400 text-slate-400 border border-slate-800 hover:border-rose-900/30 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
