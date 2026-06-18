import { useState, useEffect, FormEvent } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Users, 
  Briefcase, 
  Building, 
  X, 
  Edit, 
  Trash2,
  AlertCircle,
  FileBadge2,
  CheckCircle,
  Camera
} from "lucide-react";
import { Employee } from "../types";

interface EmployeeDirectoryProps {
  user: { role: string; employee_id: string; name: string; nameAr: string };
}

export default function EmployeeDirectory({ user }: EmployeeDirectoryProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selDept, setSelDept] = useState("all");
  const [selBranch, setSelBranch] = useState("all");
  
  // Selected Employee Details Modal
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  
  // Add/Edit Employee Form Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formEmpId, setFormEmpId] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Input states for Add/Edit
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [deptEn, setDeptEn] = useState("Engineering");
  const [deptAr, setDeptAr] = useState("الهندسة والتقنية");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [emailStr, setEmailStr] = useState("");
  const [phoneStr, setPhoneStr] = useState("");
  const [addressStr, setAddressStr] = useState("");
  const [joinDateStr, setJoinDateStr] = useState("");
  const [salaryNum, setSalaryNum] = useState(6000);
  const [statusVal, setStatusVal] = useState<"active" | "inactive">("active");
  const [branchVal, setBranchVal] = useState("Riyadh HQ");
  const [degreeVal, setDegreeVal] = useState("");
  const [fieldVal, setFieldVal] = useState("");
  const [uniVal, setUniVal] = useState("");
  const [gradVal, setGradVal] = useState("");
  const [bankName, setBankName] = useState("");
  const [accNum, setAccNum] = useState("");
  const [ibanVal, setIbanVal] = useState("");
  const [reportsTo, setReportsTo] = useState("");

  // Relatives Contacts State (Exactly 3 relatives)
  const [rel1_Name, setRel1_Name] = useState("");
  const [rel1_Phone, setRel1_Phone] = useState("");
  const [rel1_Relation, setRel1_Relation] = useState("");
  const [rel1_Job, setRel1_Job] = useState("");

  const [rel2_Name, setRel2_Name] = useState("");
  const [rel2_Phone, setRel2_Phone] = useState("");
  const [rel2_Relation, setRel2_Relation] = useState("");
  const [rel2_Job, setRel2_Job] = useState("");

  const [rel3_Name, setRel3_Name] = useState("");
  const [rel3_Phone, setRel3_Phone] = useState("");
  const [rel3_Relation, setRel3_Relation] = useState("");
  const [rel3_Job, setRel3_Job] = useState("");

  const isAdmin = user.role === "hr_admin";

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees", {
        headers: { "x-user-role": user.role, "x-employee-id": user.employee_id }
      });
      const data = await res.json();
      setEmployees(data);
    } catch (e) {
      console.error("Error fetching employees:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user]);

  // Deep auto syncing departments
  const handleDeptChange = (enName: string) => {
    setDeptEn(enName);
    if (enName === "Engineering") setDeptAr("الهندسة والتقنية");
    else if (enName === "Human Resources") setDeptAr("الموارد البشرية");
    else if (enName === "Marketing") setDeptAr("التسويق والاتصال");
    else if (enName === "Sales") setDeptAr("المبيعات وخدمة العملاء");
    else if (enName === "Finance") setDeptAr("المالية والمحاسبة");
    else setDeptAr(enName);
  };

  const handleOpenAddForm = () => {
    setEditMode(false);
    setFormEmpId("");
    setFormError("");
    setFormSuccess("");
    
    // Default values
    setNameEn("");
    setNameAr("");
    setNationalId("");
    handleDeptChange("Engineering");
    setTitleEn("");
    setTitleAr("");
    setEmailStr("");
    setPhoneStr("");
    setAddressStr("");
    setJoinDateStr(new Date().toISOString().substring(0, 10));
    setSalaryNum(8000);
    setStatusVal("active");
    setBranchVal("Riyadh HQ");
    setDegreeVal("");
    setFieldVal("");
    setUniVal("");
    setGradVal("");
    setBankName("");
    setAccNum("");
    setIbanVal("");
    setReportsTo("");

    // Exactly 3 contacts placeholders
    setRel1_Name(""); setRel1_Phone(""); setRel1_Relation(""); setRel1_Job("");
    setRel2_Name(""); setRel2_Phone(""); setRel2_Relation(""); setRel2_Job("");
    setRel3_Name(""); setRel3_Phone(""); setRel3_Relation(""); setRel3_Job("");

    setIsFormOpen(true);
  };

  const handleOpenEditForm = (emp: Employee) => {
    setEditMode(true);
    setFormEmpId(emp.employee_id);
    setFormError("");
    setFormSuccess("");

    setNameEn(emp.employee_name_en);
    setNameAr(emp.employee_name_ar);
    setNationalId(emp.national_id);
    setDeptEn(emp.department_en);
    setDeptAr(emp.department_ar);
    setTitleEn(emp.job_title_en);
    setTitleAr(emp.job_title_ar);
    setEmailStr(emp.email);
    setPhoneStr(emp.phone);
    setAddressStr(emp.address);
    setJoinDateStr(emp.join_date);
    setSalaryNum(emp.basic_salary);
    setStatusVal(emp.status);
    setBranchVal(emp.branch);
    setDegreeVal(emp.education?.degree || "");
    setFieldVal(emp.education?.field_of_study || "");
    setUniVal(emp.education?.university || "");
    setGradVal(emp.education?.graduation_date || "");
    setBankName(emp.bank?.bank_name || "");
    setAccNum(emp.bank?.account_number || "");
    setIbanVal(emp.bank?.iban || "");
    setReportsTo(emp.reports_to || "");

    // Prepare exactly 3 relatives fields
    const r1 = emp.relatives?.[0] || { name: "", phone: "", relationship: "", job: "" };
    const r2 = emp.relatives?.[1] || { name: "", phone: "", relationship: "", job: "" };
    const r3 = emp.relatives?.[2] || { name: "", phone: "", relationship: "", job: "" };

    setRel1_Name(r1.name); setRel1_Phone(r1.phone); setRel1_Relation(r1.relationship); setRel1_Job(r1.job);
    setRel2_Name(r2.name); setRel2_Phone(r2.phone); setRel2_Relation(r2.relationship); setRel2_Job(r2.job);
    setRel3_Name(r3.name); setRel3_Phone(r3.phone); setRel3_Relation(r3.relationship); setRel3_Job(r3.job);

    setIsFormOpen(true);
  };

  const handleSaveForm = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!nameAr || !nameEn || !nationalId || !titleAr || !phoneStr) {
      setFormError("يرجى ملء جميع الحقول المطلوبة الأساسية (الاسم، الهوية، المسمى، الهاتف)");
      return;
    }

    const payload = {
      employee_name_en: nameEn,
      employee_name_ar: nameAr,
      national_id: nationalId,
      department_en: deptEn,
      department_ar: deptAr,
      job_title_en: titleEn,
      job_title_ar: titleAr,
      email: emailStr || `${nameEn.toLowerCase().replace(/ /g, ".")}@company.com`,
      phone: phoneStr,
      work_email: `${nameEn.toLowerCase().charAt(0)}.${nameEn.split(" ")[1]?.toLowerCase() || "emp"}@hrportal.internal`,
      work_phone: String(Math.floor(100 + Math.random() * 900)),
      address: addressStr || "Riyadh, Saudi Arabia",
      join_date: joinDateStr,
      basic_salary: Number(salaryNum),
      status: statusVal,
      branch: branchVal,
      education: { degree: degreeVal, field_of_study: fieldVal, university: uniVal, graduation_date: gradVal },
      bank: { bank_name: bankName, account_number: accNum, iban: ibanVal },
      relatives: [
        { name: rel1_Name, phone: rel1_Phone, relationship: rel1_Relation, job: rel1_Job },
        { name: rel2_Name, phone: rel2_Phone, relationship: rel2_Relation, job: rel2_Job },
        { name: rel3_Name, phone: rel3_Phone, relationship: rel3_Relation, job: rel3_Job }
      ].filter(r => r.name !== ""), // keep valid ones
      reports_to: reportsTo,
      is_lead: false
    };

    try {
      const url = editMode ? `/api/employees/${formEmpId}` : "/api/employees";
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": user.role, 
          "x-employee-id": user.employee_id 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormSuccess(editMode ? "تم تحديث بيانات الموظف بنجاح!" : "تم إضافة موظف جديد وتوليد الكود الوظيفي والمستندات تلقائياً!");
        fetchEmployees();
        setTimeout(() => {
          setIsFormOpen(false);
          // If editing active profile view, update modal look also
          if (editMode && selectedEmp?.employee_id === formEmpId) {
            setSelectedEmp({ ...selectedEmp, ...payload, employee_id: formEmpId } as any);
          }
        }, 1200);
      } else {
        const err = await res.json();
        setFormError(err.error || "حدث خطأ أثناء الاتصال بالخادم.");
      }
    } catch (e) {
      setFormError("فشل إرسال الطلب. تأكد من تفعيل السيرفر.");
    }
  };

  const handleDelete = async (empId: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا الموظف نهائياً وإلغاء أرشيفه؟")) return;

    try {
      const res = await fetch(`/api/employees/${empId}`, {
        method: "DELETE",
        headers: { 
          "x-user-role": user.role, 
          "x-employee-id": user.employee_id 
        }
      });

      if (res.ok) {
        setSelectedEmp(null);
        fetchEmployees();
      } else {
        const err = await res.json();
        alert(err.error || "فشل الحذف");
      }
    } catch (e) {
      alert("خطأ في الشبكة");
    }
  };

  const handleRandomizePhoto = async (empId: string) => {
    try {
      const res = await fetch(`/api/employees/${empId}/photo`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": user.role, 
          "x-employee-id": user.employee_id 
        },
        body: JSON.stringify({}) // generates fresh photolink
      });
      if (res.ok) {
        const data = await res.json();
        fetchEmployees();
        if (selectedEmp && selectedEmp.employee_id === empId) {
          setSelectedEmp({ ...selectedEmp, photo_url: data.photo_url });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = 
      emp.employee_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_name_ar.includes(searchTerm) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_title_ar.includes(searchTerm) ||
      emp.job_title_en.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDept = selDept === "all" || emp.department_en === selDept;
    const matchBranch = selBranch === "all" || emp.branch === selBranch;

    return matchSearch && matchDept && matchBranch;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search and Quick Filters Banner */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isAdmin ? "دليل الموظفين وعقود الكفاءات" : "ملفي الوظيفي"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">عرض، بحث، وفلترة تفاصيل الموظفين وبيانات الرواتب وعناوين الاتصال ومستندات العمل.</p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddForm}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-start md:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موظف جديد</span>
            </button>
          )}
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-xs"
              placeholder="ابحث بالاسم، الكود (EMP001)، أو المسمى الوظيفي..."
            />
          </div>

          {/* Department Select */}
          <div className="relative">
            <select
              value={selDept}
              onChange={(e) => setSelDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none appearance-none"
            >
              <option value="all">كل الأقسام</option>
              <option value="Engineering">الهندسة والتقنية (Engineering)</option>
              <option value="Human Resources">الموارد البشرية (HR)</option>
              <option value="Marketing">التسويق والاتصال</option>
              <option value="Sales">المبيعات والخدمة</option>
              <option value="Finance">المالية والمحاسبة</option>
            </select>
          </div>

          {/* Branch Select */}
          <div className="relative">
            <select
              value={selBranch}
              onChange={(e) => setSelBranch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none appearance-none"
            >
              <option value="all">كل الفروع</option>
              <option value="Riyadh HQ">المركز الرئيسي - الرياض</option>
              <option value="Jeddah Office">فرع جدة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Main List and details sidebar split */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
          <p className="text-xs font-bold text-slate-500">جاري تجميع دليل الكفاءات...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 text-xs border border-slate-200 rounded-2xl">
          لم يتم العثور على أي موظف مطابق لمعايير البحث الحالية.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="xl:col-span-2 space-y-2.5">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.employee_id}
                onClick={() => setSelectedEmp(emp)}
                className={`p-4 bg-white border rounded-xl hover:shadow-md transition cursor-pointer flex items-center justify-between gap-4 ${
                  selectedEmp?.employee_id === emp.employee_id 
                    ? "border-sky-500/80 ring-2 ring-sky-500/10 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={emp.photo_url}
                    alt={emp.employee_name_en}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                    }}
                    className="w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black text-slate-900">{emp.employee_name_ar}</h3>
                      <span className="text-[10px] font-mono font-bold text-slate-400">({emp.employee_id})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">{emp.job_title_ar} - {emp.department_ar}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold mt-1.5">
                      <span className="inline-flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        <span>{emp.branch}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>تعيين: {emp.join_date}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 text-left">
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${
                    emp.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {emp.status === "active" ? "نشط" : "موقوف مؤقتاً"}
                  </span>
                  
                  {isAdmin && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditForm(emp)}
                        className="p-1 text-slate-400 hover:text-sky-600 rounded hover:bg-slate-50 transition cursor-pointer"
                        title="تعديل"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.employee_id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 transition cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Details Panel view */}
          <div className="xl:col-span-1">
            {selectedEmp ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6 sticky top-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">تفاصيل ملف الموظف الكاملة</h3>
                  <button 
                    onClick={() => setSelectedEmp(null)} 
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Header Block */}
                <div className="text-center pb-4 border-b border-slate-100 relative">
                  <div className="inline-block relative">
                    <img
                      src={selectedEmp.photo_url}
                      alt={selectedEmp.employee_name_en}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                      }}
                      className="w-20 h-20 rounded-full object-cover mx-auto bg-slate-100 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => handleRandomizePhoto(selectedEmp.employee_id)}
                      className="absolute bottom-0 left-0 p-1.5 bg-slate-900 border border-slate-800 text-white rounded-full hover:bg-slate-800 transition shadow cursor-pointer text-xs"
                      title="تغيير الصورة تلقائياً"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 mt-3">{selectedEmp.employee_name_ar}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedEmp.employee_name_en}</p>
                  <p className="text-xs text-sky-600 font-bold mt-1">{selectedEmp.job_title_ar}</p>

                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-extrabold border border-slate-200">
                      رقم الكود: {selectedEmp.employee_id}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold border border-slate-200">
                      الرقم التسلسلي: {selectedEmp.id_number}
                    </span>
                  </div>
                </div>

                {/* Personal & Work Specific Details */}
                <div className="space-y-3.5 text-xs text-slate-700">
                  <h4 className="font-bold text-slate-400 text-[10px] tracking-wider uppercase">البيانات الوظيفية والمعيشية</h4>
                  
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">الرقم الوطني / الهوية</span>
                      <span className="font-mono font-bold text-slate-900">{selectedEmp.national_id}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">القسم الوظيفي</span>
                      <span className="font-bold text-slate-900">{selectedEmp.department_ar}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">البريد الإلكتروني للعمل</span>
                      <span className="font-mono text-slate-900">{selectedEmp.work_email}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">جوال الاتصال</span>
                      <span className="font-mono text-slate-900">{selectedEmp.phone}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">الراتب الأساسي</span>
                      <span className="font-bold text-slate-900">{selectedEmp.basic_salary.toLocaleString()} ريال</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-400">رصيد الإجازة السنوية المستحق حالياً</span>
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded-md font-mono font-black text-[10px]">
                        {(selectedEmp as any).calculated_vacation_credit || 21} يوم
                      </span>
                    </div>

                    {selectedEmp.reports_to && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="text-slate-400">يرفع تقاريره إلى Lead</span>
                        <span className="font-bold text-slate-900">{selectedEmp.reports_to}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Education Block info */}
                {selectedEmp.education && (
                  <div className="space-y-3.5 text-xs text-slate-700">
                    <h4 className="font-bold text-slate-400 text-[10px] tracking-wider uppercase flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>المؤهل العلمي والدراسي</span>
                    </h4>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="font-bold text-slate-800">{selectedEmp.education.degree} - {selectedEmp.education.field_of_study}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{selectedEmp.education.university}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">سنة التخرج: {selectedEmp.education.graduation_date}</p>
                    </div>
                  </div>
                )}

                {/* Bank Details Block info */}
                {selectedEmp.bank && (
                  <div className="space-y-3.5 text-xs text-slate-700">
                    <h4 className="font-bold text-slate-400 text-[10px] tracking-wider uppercase flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>معلومات الحساب البنكي الرئيسي</span>
                    </h4>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="font-bold text-slate-800">{selectedEmp.bank.bank_name}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">حساب: {selectedEmp.bank.account_number}</p>
                      <p className="text-[11px] text-sky-700 mt-0.5 font-mono">IBAN: {selectedEmp.bank.iban}</p>
                    </div>
                  </div>
                )}

                {/* Relatives Contacts Block info */}
                {selectedEmp.relatives && selectedEmp.relatives.length > 0 && (
                  <div className="space-y-3.5 text-xs text-slate-700">
                    <h4 className="font-bold text-slate-400 text-[10px] tracking-wider uppercase flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>الاتصال في الطوارئ (جهات عائلية)</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedEmp.relatives.map((rel, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px]">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{rel.name}</span>
                            <span className="text-sky-700">{rel.relationship}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 mt-1 font-mono">
                            <span>جوال: {rel.phone}</span>
                            {rel.job && <span>وظيفة: {rel.job}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-400 text-xs">
                انقر فوق أي موظف من القائمة لاستعراض ملفه الشخصي التفصيلي ومستنداته وعقده وحسابه البنكي.
              </div>
            )}
          </div>
        </div>
      )}


      {/* Form Dialog Popup Modal (Add/Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-md font-black text-slate-900">
                {editMode ? `تعديل بيانات الموظف - ${formEmpId}` : "إضافة موظف جديد وتوليد الكود الوظيفي"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body ScrollArea */}
            <form onSubmit={handleSaveForm} className="flex-grow overflow-y-auto p-6 space-y-6 text-xs text-right">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Section 1: Basic personal & role */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-sky-600 text-xs border-b border-slate-100 pb-1">البيانات الشخصية والمهنية الأساسية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">الاسم الكامل (بالإنجليزية) *</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="e.g. Ahmed Mansour"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">الاسم الكامل (بالعربية) *</label>
                    <input
                      type="text"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="e.g. أحمد منصور"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">الهوية الوطنية / الإقامة *</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="أدخل 10 أرقام"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">جوال الاتصال الشخصي *</label>
                    <input
                      type="text"
                      value={phoneStr}
                      onChange={(e) => setPhoneStr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="+966 ..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">المسمى الوظيفي (بالإنجليزية) *</label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="e.g. Senior Software Engineer"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">المسمى الوظيفي (بالعربية) *</label>
                    <input
                      type="text"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="e.g. مهندس برمجيات أول"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">القسم الوظيفي *</label>
                    <select
                      value={deptEn}
                      onChange={(e) => handleDeptChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="Engineering">الهندسة والتقنية (Engineering)</option>
                      <option value="Human Resources">الموارد البشرية (Human Resources)</option>
                      <option value="Marketing">التسويق والاتصال (Marketing)</option>
                      <option value="Sales">المبيعات وخدمة العملاء (Sales)</option>
                      <option value="Finance">المالية والمحاسبة (Finance)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">فرع التعيين *</label>
                    <select
                      value={branchVal}
                      onChange={(e) => setBranchVal(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="Riyadh HQ">المركز الرئيسي - الرياض</option>
                      <option value="Jeddah Office">فرع جدة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">تاريخ مباشرة العمل *</label>
                    <input
                      type="date"
                      value={joinDateStr}
                      onChange={(e) => setJoinDateStr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">الراتب الأساسي (ريال شهرياً) *</label>
                    <input
                      type="number"
                      value={salaryNum}
                      onChange={(e) => setSalaryNum(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">البريد الإلكتروني الشخصي</label>
                    <input
                      type="email"
                      value={emailStr}
                      onChange={(e) => setEmailStr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">عنوان المراسلة الشخصي</label>
                    <input
                      type="text"
                      value={addressStr}
                      onChange={(e) => setAddressStr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="المدينة والحي..."
                    />
                  </div>
                </div>
              </div>


              {/* Section 2: Education & Bank */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic credentials */}
                <div className="space-y-3.5 bg-slate-50/55 p-3.5 border border-slate-100 rounded-xl">
                  <h4 className="font-extrabold text-slate-700 flex items-center gap-1 mb-1">
                    <BookOpen className="w-4 h-4 text-sky-500" />
                    <span>المستوى التعليمي</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-slate-500">اسم الشهادة (e.g. بكالوريوس)</label>
                      <input type="text" value={degreeVal} onChange={(e) => setDegreeVal(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-slate-500">التخصص الدراسي الدقيق</label>
                      <input type="text" value={fieldVal} onChange={(e) => setFieldVal(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-slate-500">اسم الجامعة</label>
                      <input type="text" value={uniVal} onChange={(e) => setUniVal(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-slate-500">تاريخ التخرج</label>
                      <input type="date" value={gradVal} onChange={(e) => setGradVal(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Bank credentials */}
                <div className="space-y-3.5 bg-slate-50/55 p-3.5 border border-slate-100 rounded-xl">
                  <h4 className="font-extrabold text-slate-700 flex items-center gap-1 mb-1">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>البيانات البنكية لتحويل الرواتب</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-slate-500">اسم البنك</label>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-slate-500">رقم الحساب</label>
                      <input type="text" value={accNum} onChange={(e) => setAccNum(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-slate-500">الآيبان الدولي (IBAN)</label>
                      <input type="text" value={ibanVal} onChange={(e) => setIbanVal(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg" placeholder="SA..." />
                    </div>
                  </div>
                </div>
              </div>


              {/* Section 3: Exact 3 contacts relatives detailed fields */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-[#7c3aed] text-xs border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#7c3aed]" />
                  <span>الاتصال في الطوارئ (الالتزام بـ 3 جهات اتصال عائلية بالتفصيل)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Contact 1 */}
                  <div className="p-3 bg-violet-50/40 border border-violet-100 rounded-xl space-y-2">
                    <p className="font-black text-slate-700 text-[10px] text-center mb-1">جهة اتصال تفصيلية 1</p>
                    <input type="text" value={rel1_Name} onChange={(e) => setRel1_Name(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="الاسم الكامل" />
                    <input type="text" value={rel1_Phone} onChange={(e) => setRel1_Phone(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="الجوال (مثلاً +966)" />
                    <input type="text" value={rel1_Relation} onChange={(e) => setRel1_Relation(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="صلة القرابة (مثلاً الزوجة/الأب)" />
                    <input type="text" value={rel1_Job} onChange={(e) => setRel1_Job(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="المهنة للاتصال" />
                  </div>

                  {/* Contact 2 */}
                  <div className="p-3 bg-violet-50/40 border border-violet-100 rounded-xl space-y-2">
                    <p className="font-black text-slate-700 text-[10px] text-center mb-1">جهة اتصال تفصيلية 2</p>
                    <input type="text" value={rel2_Name} onChange={(e) => setRel2_Name(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="الاسم الكامل" />
                    <input type="text" value={rel2_Phone} onChange={(e) => setRel2_Phone(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="الجوال (مثلاً +966)" />
                    <input type="text" value={rel2_Relation} onChange={(e) => setRel2_Relation(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="صلة القرابة (الأخ/الأم)" />
                    <input type="text" value={rel2_Job} onChange={(e) => setRel2_Job(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="المهنة للاتصال" />
                  </div>

                  {/* Contact 3 */}
                  <div className="p-3 bg-violet-50/40 border border-violet-100 rounded-xl space-y-2">
                    <p className="font-black text-slate-700 text-[10px] text-center mb-1">جهة اتصال تفصيلية 3</p>
                    <input type="text" value={rel3_Name} onChange={(e) => setRel3_Name(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="الاسم الكامل" />
                    <input type="text" value={rel3_Phone} onChange={(e) => setRel3_Phone(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="الجوال (مثلاً +966)" />
                    <input type="text" value={rel3_Relation} onChange={(e) => setRel3_Relation(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="صلة القرابة (الأب/الصديق)" />
                    <input type="text" value={rel3_Job} onChange={(e) => setRel3_Job(e.target.value)} className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[11px]" placeholder="المهنة للاتصال" />
                  </div>
                </div>
              </div>

              {/* Extra leads inputs */}
              <div className="space-y-2 pt-2">
                <label className="block text-slate-600 font-bold">يرفع تقاريره إلى Code Lead (مثل EMP002, s.khalid)</label>
                <input
                  type="text"
                  value={reportsTo}
                  onChange={(e) => setReportsTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="EMP002"
                />
              </div>

              {/* Modal action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4.5 py-2 hover:bg-slate-50 text-slate-500 border border-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  حفظ البيانات والترقية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
