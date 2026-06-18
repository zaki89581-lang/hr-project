import { useState, useEffect } from "react";
import { Users, User, GitFork, ArrowDown, MapPin, Building, ShieldCheck } from "lucide-react";
import { Employee } from "../types";

export default function OrgChart() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmps = async () => {
      try {
        const res = await fetch("/api/employees", {
          headers: { "x-user-role": "hr_admin" } // use admin mock so we fetch all details
        });
        const data = await res.json();
        setEmployees(data);
      } catch (e) {
        console.error("Error reading hierarchy:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEmps();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500">جاري بناء الهيكل التنظيمي للشركة...</p>
      </div>
    );
  }

  // Structuring clean tree hierarchy.
  // CEO/ Mohamed Zaki is level 0 (reports_to is null or empty)
  // Khalid Al-Otaibi is level 1 (reports_to is Mohamed Zaki / m.zaki or admin)
  // Engineers Ahmed, Omar report to Khalid Al-Otaibi / m.zaki / etc.
  // Let's list cards by hierarchy level or draw them using pure, majestic styled nodes!
  
  const hqAdmin = employees.filter(e => e.employee_id === "EMP002" || e.job_title_en.toLowerCase().includes("director") || e.job_title_en.toLowerCase().includes("manager"));
  const subKhalid = employees.filter(e => e.employee_id === "EMP001" || e.reports_to === "EMP002" || e.reports_to === "m.zaki" || e.reports_to === "sara.khalid");
  const engineers = employees.filter(e => e.employee_id !== "EMP002" && e.employee_id !== "EMP001" && (e.reports_to === "EMP001" || e.reports_to === "m.zaki"));

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Overview Banner Header */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
        <h2 className="text-lg font-black text-slate-900">الهيكل التنظيمي للمؤسسة (Organization Chart)</h2>
        <p className="text-xs text-slate-500 mt-1">
          رسم بياني يبين مستويات القيادة الوظيفية والمسؤولين وأقسام وخطوط التقارير المباشرة في الشركة.
        </p>
      </div>

      {/* Structured visual Tree Hierarchy */}
      <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center text-center space-y-8 overflow-x-auto min-w-full">
        
        {/* Tier 1: Execs / HR Director */}
        <div className="space-y-3 flex flex-col items-center">
          <span className="text-[9px] bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
            الإدارة العليا والقيادة
          </span>
          <div className="grid grid-cols-1 gap-4">
            {hqAdmin.map(admin => (
              <div key={admin.employee_id} className="min-w-[260px] p-4 bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl shadow-md text-white">
                <div className="flex items-center gap-3 text-right">
                  <img
                    src={admin.photo_url}
                    alt={admin.employee_name_en}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                    }}
                    className="w-10 h-10 rounded-full border border-indigo-500 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-black">{admin.employee_name_ar}</h4>
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-300 font-bold mt-0.5">{admin.job_title_ar}</p>
                    <p className="text-[9px] text-[#818cf8] font-mono mt-0.5">{admin.department_ar}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical Separator Line */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="w-0.5 h-8 bg-slate-200" />
          <ArrowDown className="w-4 h-4 text-slate-400 -mt-1" />
        </div>

        {/* Tier 2: Leads / Managers */}
        <div className="space-y-3 flex flex-col items-center">
          <span className="text-[9px] bg-violet-100 text-[#5b21b6] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest border border-violet-200">
            رؤساء الأقسام والأدوار الإشرافية
          </span>
          <div className="flex flex-wrap justify-center gap-6">
            {subKhalid.map(lead => (
              <div key={lead.employee_id} className="min-w-[240px] p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm text-slate-900">
                <div className="flex items-center gap-3 text-right">
                  <img
                    src={lead.photo_url}
                    alt={lead.employee_name_en}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                    }}
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-black">{lead.employee_name_ar}</h4>
                    <p className="text-[10px] text-sky-700 font-bold mt-0.5">{lead.job_title_ar}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">يرفع تقريره إلى: محمد زكي</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical Separator Line */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="w-0.5 h-8 bg-slate-200" />
          <ArrowDown className="w-4 h-4 text-slate-400 -mt-1" />
        </div>

        {/* Tier 3: Engineers & Contributors */}
        <div className="space-y-3 flex flex-col items-center">
          <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">
            الكادر التنفيذي والتقني المباشر
          </span>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
            {engineers.map(eng => {
              const directLead = subKhalid.find(l => eng.reports_to === l.employee_id || l.employee_id === "EMP001")?.employee_id;
              return (
                <div key={eng.employee_id} className="min-w-[200px] p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 hover:border-sky-500 transition">
                  <div className="flex items-center gap-2.5 text-right">
                    <img
                      src={eng.photo_url}
                      alt={eng.employee_name_en}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                      }}
                      className="w-9 h-9 rounded-full border object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-[11px] font-black">{eng.employee_name_ar}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{eng.job_title_ar}</p>
                      <p className="text-[9px] text-sky-600 font-bold mt-0.5">الرئيس: {directLead || "EMP001"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
