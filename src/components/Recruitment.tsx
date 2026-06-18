import { useState, useEffect, FormEvent } from "react";
import { 
  Briefcase, 
  Users, 
  Plus, 
  CheckCircle, 
  Clock, 
  X, 
  AlertCircle, 
  FileText, 
  FileCode, 
  ChevronRight,
  TrendingUp,
  Mail,
  Phone,
  Sparkles
} from "lucide-react";

interface RecruitmentProps {
  user: { role: string; employee_id: string; name: string; nameAr: string };
}

interface Job {
  job_id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  status: "active" | "closed" | "draft";
  description: string;
  requirements: string;
  work_role_id: string;
  created_at: string;
}

interface Candidate {
  id: string;
  candidate_name: string;
  candidate_email: string;
  phone: string;
  job_id: string;
  status: "new" | "reviewed" | "interviewed" | "hired" | "rejected";
  cv_url: string;
  notes: string;
  ai_position_title: string;
  created_at: string;
}

export default function Recruitment({ user }: RecruitmentProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"jobs" | "candidates">("jobs");

  // Job Modal form
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("Engineering");
  const [jobLoc, setJobLoc] = useState("Riyadh HQ / Hybrid");
  const [jobType, setJobType] = useState<"full-time" | "part-time" | "contract">("full-time");
  const [jobDesc, setJobDesc] = useState("");
  const [jobReqs, setJobReqs] = useState("");
  const [jobRoleId, setJobRoleId] = useState("WR" + Math.floor(100 + Math.random() * 900));

  // Candidate evaluation states
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [statusVal, setStatusVal] = useState<Candidate["status"]>("new");
  const [notesVal, setNotesVal] = useState("");
  const [evalLoading, setEvalLoading] = useState(false);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      // Fetch Jobs
      const jobsRes = await fetch("/api/jobs");
      const jobsData = await jobsRes.json();
      setJobs(jobsData);

      // Fetch Candidates
      const candRes = await fetch("/api/candidates", {
        headers: { "x-user-role": user.role, "x-employee-id": user.employee_id }
      });
      const candData = await candRes.json();
      setCandidates(candData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitmentData();
  }, [user]);

  const handleCreateJob = async (e: FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDesc || !jobReqs) {
      alert("الرجاء تعبئة بيانات المسمى وتفاصيل الوصف والمتطلبات.");
      return;
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-employee-id": user.employee_id
        },
        body: JSON.stringify({
          title: jobTitle,
          department: jobDept,
          location: jobLoc,
          type: jobType,
          status: "active",
          description: jobDesc,
          requirements: jobReqs,
          work_role_id: jobRoleId
        })
      });

      if (res.ok) {
        setIsJobModalOpen(false);
        setJobTitle("");
        setJobDesc("");
        setJobReqs("");
        setJobRoleId("WR" + Math.floor(100 + Math.random() * 900));
        fetchRecruitmentData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCandidateStatusAndNotes = async (candId: string) => {
    try {
      const res = await fetch(`/api/candidates/${candId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-employee-id": user.employee_id
        },
        body: JSON.stringify({
          status: statusVal,
          notes: notesVal
        })
      });

      if (res.ok) {
        const updated = await res.json();
        // Update local arrays
        setCandidates(candidates.map(c => c.id === candId ? updated : c));
        setSelectedCandidate(updated);
        alert("تم تحديث حالة وثيقة المرشح وملاحظات التوظيف بنجاح!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run mock AI Resume Evaluation matchmaking
  const handleTriggerAIEval = async (cand: Candidate) => {
    setEvalLoading(true);
    try {
      // Find the associated job title
      const jobObj = jobs.find(j => j.job_id === cand.job_id);
      const targetTitle = jobObj ? jobObj.title : "المسمى المستهدف";

      // Call express assistant logic to perform a small automated parse
      const mockAIPayload = {
        message: `Please evaluate this candidate resume against Job "${targetTitle}":
- Candidate name: ${cand.candidate_name}
- Candidate email: ${cand.candidate_email}
- Previous Candidate Notes: ${cand.notes}
Give a 1-sentence analytical AI Match score (e.g. 92%) and list 2 key strengths based on the prompt. Standalone output format please.`,
        history: []
      };

      const res = await fetch("/api/chat/hr-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-employee-id": user.employee_id
        },
        body: JSON.stringify(mockAIPayload)
      });

      if (res.ok) {
        const data = await res.json();
        
        // Save back to server
        const updatedRes = await fetch(`/api/candidates/${cand.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": user.role,
            "x-employee-id": user.employee_id
          },
          body: JSON.stringify({
            ai_position_title: data.reply
          })
        });

        if (updatedRes.ok) {
          const finishedCand = await updatedRes.json();
          setCandidates(candidates.map(c => c.id === cand.id ? finishedCand : c));
          setSelectedCandidate(finishedCand);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvalLoading(false);
    }
  };

  const getCandidateStatusLabel = (s: Candidate["status"]) => {
    switch (s) {
      case "new": return "انتظار التصفية";
      case "reviewed": return "تمت المراجعة";
      case "interviewed": return "أجرى المقابلة";
      case "hired": return "تم التعيين والقبول 🎉";
      case "rejected": return "غير مجاز";
      default: return s;
    }
  };

  const getJobTypeLabel = (t: Job["type"]) => {
    switch (t) {
      case "full-time": return "دوام كامل";
      case "part-time": return "دوام جزئي";
      case "contract": return "عقد مؤقت";
      default: return t;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Tab controls */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex gap-2.5">
          <button
            onClick={() => setActiveSubTab("jobs")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeSubTab === "jobs"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            الفرص والوظائف المعروضة ({jobs.length})
          </button>
          <button
            onClick={() => setActiveSubTab("candidates")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeSubTab === "candidates"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            طلبات ترشيح الموظفين والمقابلة ({candidates.length})
          </button>
        </div>

        {activeSubTab === "jobs" && (
          <button
            onClick={() => setIsJobModalOpen(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>نشر فرصة عمل (إعلان توظيف)</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
          <p className="text-xs font-bold text-slate-500">جاري مسح عقود التوظيف والمتقدمين...</p>
        </div>
      ) : activeSubTab === "jobs" ? (
        
        /* -- Jobs List tab -- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job.job_id} className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] bg-slate-100 border text-slate-500 px-2 py-0.5 rounded-md font-mono font-bold">
                    {job.work_role_id}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md ${
                    job.status === "active" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {job.status === "active" ? "مفتوح فوري" : "مغلق"}
                  </span>
                </div>

                <h3 className="text-xs font-black text-slate-900 leading-snug">{job.title}</h3>
                <p className="text-[11px] text-slate-500 font-bold mt-1">{job.department} · {job.location}</p>
                
                <p className="text-[11px] text-slate-600 mt-3 line-clamp-3 leading-relaxed">{job.description}</p>
                
                {job.requirements && (
                  <div className="mt-4 pt-3 border-t border-slate-50 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold">شروط التقديم الأساسية:</span>
                    <p className="text-[11px] text-slate-500 whitespace-pre-line line-clamp-2 leading-relaxed">{job.requirements}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-50">
                <span>تعاقد: {getJobTypeLabel(job.type)}</span>
                <span>تاريخ النشر: {job.created_at}</span>
              </div>
            </div>
          ))}
        </div>

      ) : (

        /* -- Candidates Tab -- */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Candidates column list */}
          <div className="xl:col-span-2 space-y-2.5">
            {candidates.map((cand) => {
              const connectedJob = jobs.find(j => j.job_id === cand.job_id);
              return (
                <div
                  key={cand.id}
                  onClick={() => {
                    setSelectedCandidate(cand);
                    setStatusVal(cand.status);
                    setNotesVal(cand.notes);
                  }}
                  className={`p-4 bg-white border rounded-xl hover:shadow-md transition cursor-pointer flex items-center justify-between gap-4 ${
                    selectedCandidate?.id === cand.id 
                      ? "border-sky-500 bg-sky-50/10 shadow-sm"
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900">{cand.candidate_name}</h4>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">{cand.id}</span>
                    </div>
                    <p className="text-[11px] text-sky-700 font-bold mt-1">الفرصة المستهدفة: {connectedJob ? connectedJob.title : cand.job_id}</p>
                    
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold mt-2">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{cand.candidate_email}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{cand.phone}</span>
                      </span>
                    </div>

                    {/* AI short rating indicator */}
                    {cand.ai_position_title && (
                      <div className="mt-2.5 flex items-start gap-1 p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] text-indigo-800">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-violet-600 mt-0.5 animate-pulse" />
                        <span className="font-bold line-clamp-1">{cand.ai_position_title}</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-left">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 border text-slate-600 font-extrabold rounded">
                      {getCandidateStatusLabel(cand.status)}
                    </span>
                    <p className="text-[9px] text-slate-400 font-mono mt-1.5">تاريخ التقديم: {cand.created_at}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details sidebar evaluate column panel */}
          <div className="xl:col-span-1">
            {selectedCandidate ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 sticky top-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black text-slate-800">تقييم ومصادقة وثيقة المرشح</h4>
                  <button onClick={() => setSelectedCandidate(null)} className="p-1 text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div>
                  <h5 className="text-xs font-black text-slate-900">{selectedCandidate.candidate_name}</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">البريد: {selectedCandidate.candidate_email} | هاتف: {selectedCandidate.phone}</p>
                </div>

                {/* AI Screening Actions */}
                <div className="space-y-2.5 bg-gradient-to-br from-[#faf5ff] to-[#f3e8ff] p-4 border border-[#e9d5ff] rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-black text-violet-700 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                      <span>محرك التصفية والمطابقة بالذكاء الاصطناعي</span>
                    </h5>
                    <span className="text-[8px] bg-violet-600 text-white font-extrabold px-1.5 py-0.5 rounded">AI POWERED</span>
                  </div>

                  {selectedCandidate.ai_position_title ? (
                    <p className="text-[11px] text-violet-950 leading-relaxed font-bold bg-white p-2.5 border border-purple-200/50 rounded-xl">
                      {selectedCandidate.ai_position_title}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#581c87] leading-relaxed">
                      لم نقم بإخضاع السيرة الذاتية لمرشحنا لمطابقة معقدة بالذكاء الاصطناعي لوظيفة هذا الموعد بعد.
                    </p>
                  )}

                  <button
                    onClick={() => handleTriggerAIEval(selectedCandidate)}
                    disabled={evalLoading}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-300 text-white font-black text-[10px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    {evalLoading ? "جاري مطابقة وقراءة السيرة بالـ LLM..." : "تشغيل مطابقة السيرة الذاتية والمهنية بالذكاء الاصطناعي"}
                  </button>
                </div>

                {/* Status adjustment */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">تحديث حالة التوظيف</label>
                  <select
                    value={statusVal}
                    onChange={(e: any) => setStatusVal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="new">انتظار التصفية والفرز (New)</option>
                    <option value="reviewed">تمت المراجعة والتدقيق (Reviewed)</option>
                    <option value="interviewed">أجرى المقابلة المبدئية (Interviewed)</option>
                    <option value="hired">تم اعتماده للتعيين والقبول 🎉 (Hired)</option>
                    <option value="rejected">غير ملائم حالياً (Rejected)</option>
                  </select>
                </div>

                {/* Notes modification */}
                <div className="space-y-1.5 text-xs">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">ملاحظات وقدرات المقابل الرئيسي</label>
                  <textarea
                    value={notesVal}
                    onChange={(e) => setNotesVal(e.target.value)}
                    className="w-full h-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl tracking-tight focus:outline-none focus:ring-1 text-[11px]"
                    placeholder="مستواه التقني والخبرات والمبررات..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleUpdateCandidateStatusAndNotes(selectedCandidate.id)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    حفظ التغييرات وملاحظات المقابلة
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-6 text-center text-slate-400 text-xs">
                انقر فوق أي طلب ترشيح في القائمة للمراجعة وتحديث حالة معالجته والتصفية بالذكاء الاصطناعي.
              </div>
            )}
          </div>

        </div>
      )}


      {/* Job creation Popup Modal */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl w-full max-w-lg overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-5 h-5 text-sky-500" />
                <span>نشر فرصة عمل (إعلان توظيف)</span>
              </h3>
              <button onClick={() => setIsJobModalOpen(false)} className="p-1.5 text-slate-400 bg-white border border-slate-200 hover:text-slate-600 rounded">✕</button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4 text-xs text-right">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">المسمى الوظيفي المتاح *</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="مطور شاد سين وبايثون..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">القسم المستهدف *</label>
                  <select
                    value={jobDept}
                    onChange={(e) => setJobDept(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Engineering">الهندسة والتقنية (Engineering)</option>
                    <option value="Human Resources">الموارد البشرية (HR)</option>
                    <option value="Marketing">التسويق والمبيعات (Marketing)</option>
                    <option value="Design">التصميم والواجهات</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">المقر والاتصال *</label>
                  <input
                    type="text"
                    value={jobLoc}
                    onChange={(e) => setJobLoc(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="مثال الرياض / عن بعد"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">نوع العقد والتوظيف *</label>
                  <select
                    value={jobType}
                    onChange={(e: any) => setJobType(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="full-time">دوام كامل (Full-time)</option>
                    <option value="part-time">دوام جزئي (Part-time)</option>
                    <option value="contract">عقد مستقل استشاري (Contract)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">تفاصيل وصف الدور المهني والمهام *</label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full h-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  placeholder="وصف ملخص للوظيفة وأبرز المهام المطلوبة يومياً..."
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">الشروط وسنوات الخبرة والمتطلبات *</label>
                <textarea
                  value={jobReqs}
                  onChange={(e) => setJobReqs(e.target.value)}
                  className="w-full h-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  placeholder="أكثر من سنتين خبرة، إتقان شادسين، هندسة كود..."
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-3.5 py-1.5 hover:bg-slate-50 text-slate-500 border border-slate-200 font-bold rounded-lg transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
                >
                  نشر فرصة التوظيف فوراً
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
