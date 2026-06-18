import React, { useState } from "react";
import { Shield, Users, Lock, LogIn, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onLoginSuccess: (session: { role: string; employee_id: string; name: string; nameAr: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess({
          role: data.role,
          employee_id: data.employee_id,
          name: data.name,
          nameAr: data.nameAr
        });
      } else {
        setError(data.error || "خطأ في تسجيل الدخول. يرجى تجربة بيانات الدخول الافتراضية.");
      }
    } catch (err) {
      setError("فشل الاتصال بالخادم. تأكد من تفعيل الخادم.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (type: "admin" | "employee") => {
    if (type === "admin") {
      setUsername("hr_admin");
      setPassword("hr_admin");
    } else {
      setUsername("employee");
      setPassword("employee");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4" dir="rtl">
      {/* Dynamic abstract grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

      {/* Main card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden p-8 z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-sky-50 text-sky-600 rounded-2xl mb-4 border border-sky-100">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">بوابة الموارد البشرية</h1>
          <p className="text-sm text-slate-500 mt-1">HR Portal — نظام متكامل لإدارة الكفاءات والموظفين</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2.5 p-3.5 bg-rose-50 text-rose-700 text-xs rounded-xl mb-6 border border-rose-100"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">اسم المستخدم (Username)</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <Users className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-sm"
                placeholder="أدخل اسم المستخدم..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">كلمة المرور (Password)</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-slate-400">حسابات تجريبية سريعة</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDemoLogin("admin")}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl cursor-pointer transition"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            مدير (HR Admin)
          </button>
          <button
            onClick={() => handleDemoLogin("employee")}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl cursor-pointer transition"
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            موظف (Employee)
          </button>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-400">
          اسم المستخدم وكلمة المرور الافتراضية:{" "}
          <span className="font-mono text-slate-500 bg-slate-100 px-1 border border-slate-200 rounded">hr_admin</span> أو{" "}
          <span className="font-mono text-slate-500 bg-slate-100 px-1 border border-slate-200 rounded">employee</span>
        </div>
      </motion.div>
    </div>
  );
}
