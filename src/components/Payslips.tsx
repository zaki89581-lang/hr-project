import { useState, useEffect, FormEvent } from "react";
import { 
  CreditCard, 
  FileText, 
  Download, 
  Printer, 
  Clock, 
  CheckCircle, 
  Sparkles,
  QrCode,
  AlertCircle
} from "lucide-react";

interface PayslipsProps {
  user: { role: string; employee_id: string; name: string; nameAr: string };
}

interface Payslip {
  id: string;
  employee_id: string;
  month: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: "paid" | "pending";
}

interface HRRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  type: string;
  details: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function Payslips({ user }: PayslipsProps) {
  const [slips, setSlips] = useState<Payslip[]>([]);
  const [requests, setRequests] = useState<HRRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selSlip, setSelSlip] = useState<Payslip | null>(null);
  
  // Salary certificate generation states
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [certType, setCertType] = useState("salary_declaration");
  const [certDirectedTo, setCertDirectedTo] = useState("البنك الأهلي السعودي (SNB)");
  const [certReason, setCertReason] = useState("طلب تمويل عقاري واستكمال المستندات");
  const [certRequestSubmitting, setCertRequestSubmitting] = useState(false);
  const [certMsg, setCertMsg] = useState("");

  const isAdmin = user.role === "hr_admin";

  const fetchPayslipData = async () => {
    try {
      setLoading(true);
      // Fetch slips
      const slipRes = await fetch("/api/payslips", {
        headers: { "x-user-role": user.role, "x-employee-id": user.employee_id }
      });
      const slipData = await slipRes.json();
      setSlips(slipData);

      // Fetch general HR document requests
      const reqRes = await fetch("/api/requests", {
        headers: { "x-user-role": user.role, "x-employee-id": user.employee_id }
      });
      const reqData = await reqRes.json();
      setRequests(reqData);
    } catch (e) {
      console.error("Error reading payslip elements:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslipData();
  }, [user]);

  const handleRequestCertificate = async (e: FormEvent) => {
    e.preventDefault();
    setCertRequestSubmitting(true);
    setCertMsg("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-employee-id": user.employee_id
        },
        body: JSON.stringify({
          type: "salary_certificate",
          details: `شهادة تعريف بالراتب موجهة إلى (${certDirectedTo}) لغرض: ${certReason}.`
        })
      });

      if (res.ok) {
        setCertMsg("تم تقديم طلب إصدار شهادة التعريف بالراتب بالرقم الوظيفي بنجاح! للإدارات مراجعته حالياً.");
        fetchPayslipData();
        setTimeout(() => {
          setIsCertOpen(false);
          setCertMsg("");
        }, 1500);
      } else {
        setCertMsg("حدث خطأ أثناء الاتصال بالإدارة مع هذا الطلب.");
      }
    } catch (err) {
      setCertMsg("خطأ في الاتصال بالشبكة.");
    } finally {
      setCertRequestSubmitting(false);
    }
  };

  const handleApproveRequest = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-employee-id": user.employee_id
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchPayslipData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // Pre-configured allowances mock formula details
  const getBreakdown = (slip: Payslip) => {
    return {
      basic: slip.basic_salary,
      housing: Number((slip.basic_salary * 0.25).toFixed(0)), // 25% housing allowance
      transport: Number((slip.basic_salary * 0.1).toFixed(0)), // 10% transport allowance
      deductionsSocial: Number((slip.basic_salary * 0.09).toFixed(0)), // 9% GOSI social security deduction
    };
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Upper controls Banner */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">مسيرات الرواتب وشهادات التعريف</h2>
          <p className="text-xs text-slate-500 mt-1">عرض تفاصيل البدلات والاستقطاعات لشهور السنة الحالية وتقديم طلبات التعريف بالراتب الفورية.</p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setIsCertOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-start md:self-auto shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>طلب شهادة تعريف بالراتب</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
          <p className="text-xs font-bold text-slate-500">جاري مراجعة المسيرات والتعاريف البنكية...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main List */}
          <div className="xl:col-span-2 space-y-4">
            
            {/* Payslips grid */}
            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">كشوفات رواتب الموظفين (المسيرات)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slips.map((slip) => (
                  <div
                    key={slip.id}
                    onClick={() => setSelSlip(slip)}
                    className={`p-4 border rounded-xl hover:shadow transition cursor-pointer flex justify-between items-center ${
                      selSlip?.id === slip.id 
                        ? "border-sky-500 bg-sky-50/10 shadow-sm"
                        : "border-slate-200"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border">
                        مسير: {slip.month}
                      </span>
                      <p className="text-sm font-black text-slate-900 mt-2">{slip.net_salary.toLocaleString()} ريال سـعـودي</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">كود الموظف: {slip.employee_id}</p>
                    </div>

                    <div className="text-left shrink-0">
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md flex items-center gap-1 ${
                        slip.status === "paid" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                      }`}>
                        {slip.status === "paid" ? "تم الإيداع بنجاح" : "بانتظار الإيداع البنكي"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General defined Definitions Requests logs */}
            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">طلبات التعريف بالراتب والمصادقات</h3>
              
              {requests.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">لا تتوفر طلبات ومستندات تعريف تابعة لك حالياً.</div>
              ) : (
                <div className="space-y-2.5">
                  {requests.map((r) => (
                    <div key={r.id} className="p-3.5 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 text-[8px] font-bold bg-sky-50 text-sky-700 border border-sky-100 rounded">DEFINITION</span>
                          <h4 className="text-xs font-bold text-slate-900">{r.employee_name} ({r.employee_id})</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">{r.details}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">تاريخ الطلب: {r.created_at}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {r.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold rounded">
                            <CheckCircle className="w-3 h-3" />
                            <span>متاح للطباعة الفورية</span>
                          </span>
                        ) : r.status === "rejected" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] bg-rose-50 text-rose-700 border border-rose-100 font-extrabold rounded">
                            <span>مرفوض</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] bg-amber-50 text-amber-700 border border-amber-100 font-extrabold rounded">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>بانتظار اعتماد التوقيع</span>
                          </span>
                        )}

                        {/* If approved, we can print it right away! */}
                        {r.status === "approved" && (
                          <button
                            onClick={() => {
                              // We simulate printing a formal certificate based on logged in employee or request info
                              setIsCertOpen(false);
                              // We can open a beautiful generated formal printable modal!
                              alert(`سيتم فتح نافذة الطباعة الرسمية للتعريف بالراتب المعلق للرقم ${r.employee_id}.`);
                              window.print();
                            }}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] rounded-md transition flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3 h-3" />
                            <span>طباعة الشهادة الرسمية</span>
                          </button>
                        )}

                        {isAdmin && r.status === "pending" && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApproveRequest(r.id, "approved")}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] rounded"
                            >
                              موافقة وتوقيع
                            </button>
                            <button
                              onClick={() => handleApproveRequest(r.id, "rejected")}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] rounded"
                            >
                              رفض
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>


          {/* Detailed breakdown sidebar */}
          <div className="xl:col-span-1">
            {selSlip ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black text-slate-800">بيانات كشف راتب {selSlip.month} التفصيلية</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">{selSlip.id}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center">
                  <CreditCard className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <span className="text-[11px] text-slate-400">صافي المبلّغ المحوّل للبنك (Net Salary)</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{selSlip.net_salary.toLocaleString()} ريال</p>
                </div>

                {/* Breakdown elements fields */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-400">الراتب الأساسي (Basic)</span>
                    <span className="font-bold text-slate-800">{getBreakdown(selSlip).basic.toLocaleString()} ريال</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-400">بدل سكن مستحق (25%)</span>
                    <span className="font-bold text-emerald-600">+{getBreakdown(selSlip).housing.toLocaleString()} ريال</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-400">بدل نقل سيارة مستحق (10%)</span>
                    <span className="font-bold text-emerald-600">+{getBreakdown(selSlip).transport.toLocaleString()} ريال</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-semibold text-rose-600">استقطاع التأمينات والتقاعد (GOSI 9%)</span>
                    <span className="font-bold text-rose-600">-{getBreakdown(selSlip).deductionsSocial.toLocaleString()} ريال</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                    <span className="font-black text-slate-800">إجمالي الرواتب والبدلات</span>
                    <span className="font-black text-indigo-700">{(selSlip.basic_salary + getBreakdown(selSlip).housing + getBreakdown(selSlip).transport).toLocaleString()} ريال</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      alert("تم حفظ نسخة الـ PDF التفاعلية لكشف الراتب في التنزيلات.");
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تنزيل مسير الراتب PDF</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-6 text-center text-slate-400 text-xs">
                انقر فوق أي شهر راتب من اليمين لاستعراض الفاتورة والبدلات التفصيلية للراتب وتحميلها.
              </div>
            )}
          </div>

        </div>
      )}


      {/* Requesting definition certificate form */}
      {isCertOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>طلب شهادة تعريف بالراتب موثقة</span>
              </h3>
              <button 
                onClick={() => setIsCertOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded bg-white border"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestCertificate} className="p-6 space-y-4 text-xs text-right">
              {certMsg && (
                <div className="p-3 bg-sky-50 text-sky-800 text-xs font-bold rounded-xl border border-sky-100 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{certMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-bold mb-1">الجهة الموجه إليها التعريف بالراتب *</label>
                <input
                  type="text"
                  value={certDirectedTo}
                  onChange={(e) => setCertDirectedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl"
                  placeholder="مثال: البنك الأهلي، السفارة الفرنسية، لمن يهمه الأمر"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">الغرض من طلب المستند الموثق *</label>
                <input
                  type="text"
                  value={certReason}
                  onChange={(e) => setCertReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl"
                  placeholder="مثال: التقديم على توريد شقة، تمويل سيارات"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 text-slate-500 rounded-xl leading-relaxed text-[11px] border border-dashed border-slate-200">
                ⚠️ يتم إصدار الشهادة آلياً بالتوقيع الرقمي للمدير الموارد البشرية وصاحب الموقع محمد زكي بعد مراجعة بياناتك بنجاح.
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCertOpen(false)}
                  className="px-3.5 py-1.5 hover:bg-slate-50 text-slate-500 border border-slate-200 font-bold rounded-lg transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={certRequestSubmitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
                >
                  تقديم الطلب للإصدار
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Embedded printable block designed for window.print() and invisible/custom display */}
      <div className="hidden print:block font-serif text-slate-900 bg-white p-12 text-right text-xs space-y-8" dir="rtl">
        <div className="flex justify-between items-start border-b-2 border-slate-850 pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-[#1e1b4b]">مؤسسة بوابه الموارد المتكاملة للبرمجيات</h1>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">المركز الرئيسي - الرياض | ص.ب 45311</p>
          </div>
          <p className="font-sans text-[10px] text-slate-400">التاريخ: {new Date().toLocaleDateString("en-US")} | الرقم: SR-94021</p>
        </div>

        <div className="text-center py-4">
          <h2 className="text-lg font-black underline underline-offset-8 text-black">شهادة تعريف وخطاب إثبات راتب رسمي</h2>
        </div>

        <p className="leading-loose">
          تشهد شركة بوابه الموارد لتقنية المعلومات بأن الموظف / الموظفة <strong className="text-black">{user.nameAr}</strong> حامل الرقم الوظيفي <strong className="font-sans text-black">{user.employee_id}</strong> يعمل لدينا وتحت كفالتنا على رأس العمل، حيث نوضح أدناه تفاصيل راتبه وبدلات معيشته الأساسية بناءً على طلبه ومسيراته البنكية المعتمدة لدينا:
        </p>

        <div className="border border-black rounded p-3 bg-slate-50 space-y-2">
          <div className="flex justify-between font-bold py-1 border-b">
            <span>البند التفصيلي للمسير</span>
            <span>القيمة المعتمدة بالريال السعودي</span>
          </div>
          <div className="flex justify-between">
            <span>إجمالي البدلات والمستقطع</span>
            <span>بناءً على طلب العميل المرفق</span>
          </div>
          <div className="flex justify-between font-black text-black pt-1">
            <span>الصافي التراكمي المحوّل بنكياً</span>
            <span>المرجع: SA-HR-PORTAL-CERT</span>
          </div>
        </div>

        <p className="leading-loose">
          وقد أُعطي خطابه هذا بناءً على طلبه لتقديمه لـ <strong className="text-black">{certDirectedTo || "البنك الأهلي وباقي المصارف"}</strong> دون أي مسؤولية أو كفالة بنكية تقع على عاتق الشركة.
        </p>

        <div className="flex justify-between items-end pt-12">
          <div className="text-center space-y-1">
            <QrCode className="w-16 h-16 mx-auto mb-1 border p-1" />
            <span className="text-[10px] text-slate-400 font-sans">تأكيد شهادة التعريف الرقمية</span>
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold">مدير إدارة الموارد الكلية والتوظيف</p>
            <p className="text-slate-500 mt-4 leading-none font-bold text-slate-800">محمد زكي (Mohamed Zaki)</p>
            <span className="text-[9px] text-slate-400">[توقيع رقمي معتمد]</span>
          </div>
        </div>
      </div>

    </div>
  );
}
