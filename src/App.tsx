import { useState, useEffect } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import EmployeeDirectory from "./components/EmployeeDirectory";
import LeaveRequests from "./components/LeaveRequests";
import Payslips from "./components/Payslips";
import Recruitment from "./components/Recruitment";
import OrgChart from "./components/OrgChart";
import Announcements from "./components/Announcements";
import HRAssistant from "./components/HRAssistant";

interface LocalUser {
  employee_id: string;
  role: string;
  name: string;
  nameAr: string;
}

export default function App() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [checkingSession, setCheckingSession] = useState(true);

  // Auto restore sessions on initial load
  useEffect(() => {
    const saved = localStorage.getItem("hr_user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.employee_id === "EMP002" && (parsed.name === "Sarah Khalid" || parsed.nameAr === "سارة خالد")) {
          parsed.name = "Mohamed Zaki";
          parsed.nameAr = "محمد زكي";
          localStorage.setItem("hr_user_session", JSON.stringify(parsed));
        }
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem("hr_user_session");
      }
    }
    setCheckingSession(false);
  }, []);

  const handleLoginSuccess = (userData: LocalUser) => {
    setUser(userData);
    localStorage.setItem("hr_user_session", JSON.stringify(userData));
    setCurrentTab("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("hr_user_session");
  };

  if (checkingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500">جاري التحقق من أمن الجلسة...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render main screen component based on active tab
  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <Dashboard user={user} setCurrentTab={setCurrentTab} />;
      case "employees":
        return <EmployeeDirectory user={user} />;
      case "leave":
        return <LeaveRequests user={user} />;
      case "payslips":
        return <Payslips user={user} />;
      case "recruitment":
        return <Recruitment user={user} />;
      case "org-chart":
        return <OrgChart />;
      case "announcements":
        return <Announcements user={user} />;
      case "ai-assistant":
        return <HRAssistant user={user} />;
      default:
        return <Dashboard user={user} setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-slate-800" dir="rtl">
      {/* Sidebar Navigation */}
      <Sidebar 
        user={user} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onLogout={handleLogout} 
      />

      {/* Main Container view */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}
