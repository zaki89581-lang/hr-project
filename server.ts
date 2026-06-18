import express from "express";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Repositories
import {
  listEmployees,
  findEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from "./src/server/repositories/employees";

import {
  listCandidates,
  findCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate
} from "./src/server/repositories/candidates";

import {
  listJobs,
  findJobById,
  createJob,
  updateJob,
  deleteJob
} from "./src/server/repositories/jobs";

import {
  listPayslips,
  findPayslipsByEmployee,
  createPayslip,
  updatePayslipStatus
} from "./src/server/repositories/payslips";

import {
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} from "./src/server/repositories/announcements";

import {
  listLeaveRequests,
  findLeavesByEmployee,
  createLeaveRequest,
  updateLeaveStatus,
  listGeneralRequests,
  createGeneralRequest,
  updateGeneralRequestStatus
} from "./src/server/repositories/requests";

import {
  listAttendance,
  clockInEmployee,
  clockOutEmployee
} from "./src/server/repositories/attendance";

import { mapEmployee } from "./src/server/mappers";
import { askHRAssistant } from "./src/server/gemini";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Demo auth validation helper
const getClientUser = (req: express.Request) => {
  const role = (req.headers["x-user-role"] as string) || "employee";
  const employeeId = (req.headers["x-employee-id"] as string) || "EMP001";
  return { role, employeeId };
};

// ==========================================
// API ROUTES
// ==========================================

// Authenticated Login simulation
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Define simple demo credentials matching specification
  if (username === "hr_admin" && password === "hr_admin") {
    const adminUser = listEmployees().find(e => e.employee_id === "EMP002") || listEmployees()[0];
    return res.json({
      success: true,
      role: "hr_admin",
      employee_id: adminUser?.employee_id || "EMP002",
      name: adminUser?.employee_name_en || "Mohamed Zaki",
      nameAr: adminUser?.employee_name_ar || "محمد زكي"
    });
  } else if (username === "employee" && password === "employee") {
    const regularUser = listEmployees().find(e => e.employee_id === "EMP001") || listEmployees()[0];
    return res.json({
      success: true,
      role: "employee",
      employee_id: regularUser?.employee_id || "EMP001",
      name: regularUser?.employee_name_en || "Ahmed Mansour",
      nameAr: regularUser?.employee_name_ar || "أحمد منصور"
    });
  }

  return res.status(401).json({ error: "خطأ في اسم المستخدم أو كلمة المرور (Invalid credentials)" });
});

// --- EMPLOYEES ---
app.get("/api/employees", (req, res) => {
  const { role, employeeId } = getClientUser(req);
  const emps = listEmployees();

  if (role === "hr_admin") {
    return res.json(emps.map(mapEmployee));
  } else {
    // Regular employees see only their own record or active listing without wage specifics if needed, but per prompt instruction:
    // "employee → يشوف بياناته بس"
    const myEmp = emps.filter(e => e.employee_id === employeeId);
    return res.json(myEmp.map(mapEmployee));
  }
});

app.get("/api/employees/:id", (req, res) => {
  const { role, employeeId } = getClientUser(req);
  const { id } = req.params;

  if (role !== "hr_admin" && employeeId !== id) {
    return res.status(403).json({ error: "غير مصرح لك باستعراض بيانات هذا الموظف." });
  }

  const emp = findEmployeeById(id);
  if (!emp) return res.status(404).json({ error: "الموظف غير موجود" });

  res.json(mapEmployee(emp));
});

app.post("/api/employees", (req, res) => {
  const { role } = getClientUser(req);
  if (role !== "hr_admin") {
    return res.status(403).json({ error: "هذا الإجراء متاح فقط لمدراء النظام." });
  }

  try {
    const newEmp = createEmployee(req.body);
    res.status(201).json(mapEmployee(newEmp));
  } catch (e: any) {
    res.status(400).json({ error: e.message || "خطأ في معالجة الطلب" });
  }
});

app.put("/api/employees/:id", (req, res) => {
  const { role, employeeId } = getClientUser(req);
  const { id } = req.params;

  // Let employee edit some personal details of their own profile, but only hr_admin can edit salaries/etc
  if (role !== "hr_admin" && employeeId !== id) {
    return res.status(403).json({ error: "غير مصرح لك بتعديل هذه البيانات." });
  }

  const updated = updateEmployee(id, req.body);
  if (!updated) return res.status(404).json({ error: "الموظف غير موجود" });

  res.json(mapEmployee(updated));
});

app.delete("/api/employees/:id", (req, res) => {
  const { role } = getClientUser(req);
  if (role !== "hr_admin") {
    return res.status(403).json({ error: "غير مصرح بحذف موظفين." });
  }

  const success = deleteEmployee(req.params.id);
  if (!success) return res.status(404).json({ error: "الموظف غير موجود" });

  res.json({ success: true, message: "تم حذف الموظف بنجاح" });
});

// Mock photo upload
app.post("/api/employees/:id/photo", (req, res) => {
  const { role, employeeId } = getClientUser(req);
  const { id } = req.params;

  if (role !== "hr_admin" && employeeId !== id) {
    return res.status(403).json({ error: "غير مصرح بتعديل الصورة." });
  }

  // In this playground, we return a nice random placeholder photo url based on gender/avatar
  const photo_url = req.body.photo_url || `https://images.unsplash.com/photo-${Math.random() > 0.5 ? "1534528741775-53994a69daeb" : "1539571696357-5a69c17a67c6"}?w=150`;
  const updated = updateEmployee(id, { photo_url });

  if (!updated) return res.status(404).json({ error: "الموظف غير موجود" });
  res.json({ success: true, photo_url: updated.photo_url });
});


// --- JOBS ---
app.get("/api/jobs", (req, res) => {
  res.json(listJobs());
});

app.post("/api/jobs", (req, res) => {
  const { role } = getClientUser(req);
  if (role !== "hr_admin") return res.status(403).json({ error: "إجراء غير متاح" });

  const newJob = createJob(req.body);
  res.status(201).json(newJob);
});

app.put("/api/jobs/:id", (req, res) => {
  const { role } = getClientUser(req);
  if (role !== "hr_admin") return res.status(403).json({ error: "إجراء غير متاح" });

  const updated = updateJob(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "الوظيفة غير موجودة" });
  res.json(updated);
});


// --- CANDIDATES ---
app.get("/api/candidates", (req, res) => {
  const { role } = getClientUser(req);
  if (role !== "hr_admin") return res.status(403).json({ error: "هذه الصفحة متاحة فقط للمسؤولين." });
  res.json(listCandidates());
});

app.post("/api/candidates", (req, res) => {
  const { role } = getClientUser(req);
  if (role !== "hr_admin") return res.status(403).json({ error: "إجراء غير متاح" });

  const newCand = createCandidate(req.body);
  res.status(201).json(newCand);
});

app.put("/api/candidates/:id", (req, res) => {
  const { role } = getClientUser(req);
  if (role !== "hr_admin") return res.status(403).json({ error: "إجراء غير متاح" });

  const updated = updateCandidate(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "المرشح غير موجود" });
  res.json(updated);
});


// --- LEAVE REQUESTS ---
app.get("/api/leave", (req, res) => {
  const { role, employeeId } = getClientUser(req);
  if (role === "hr_admin") {
    res.json(listLeaveRequests());
  } else {
    res.json(findLeavesByEmployee(employeeId));
  }
});

app.post("/api/leave", (req, res) => {
  const { employeeId } = getClientUser(req);
  // Get active user name
  const emp = findEmployeeById(employeeId);
  const employee_name = emp ? (emp.employee_name_en) : "Employee";

  const newLeave = createLeaveRequest({
    ...req.body,
    employee_id: employeeId,
    employee_name
  });
  res.status(201).json(newLeave);
});

app.put("/api/leave/:id", (req, res) => {
  const { role } = getClientUser(req);
  if (role !== "hr_admin") return res.status(403).json({ error: "الموافقة والرفض متاحة فقط للمدراء." });

  const { status } = req.body;
  if (status !== "approved" && status !== "rejected") {
    return res.status(400).json({ error: "حالة غير صالحة" });
  }

  const updated = updateLeaveStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: "طلب الإجازة غير موجود" });

  res.json(updated);
});


// --- PAYSLIPS ---
app.get("/api/payslips", (req, res) => {
  const { role, employeeId } = getClientUser(req);
  if (role === "hr_admin") {
    res.json(listPayslips());
  } else {
    res.json(findPayslipsByEmployee(employeeId));
  }
});


// --- ANNOUNCEMENTS ---
app.get("/api/announcements", (req, res) => {
  res.json(listAnnouncements());
});

app.post("/api/announcements", (req, res) => {
  const { role } = getClientUser(req);
  if (role !== "hr_admin") return res.status(403).json({ error: "غير مصرح بإرسال إعلانات." });

  const newAnn = createAnnouncement({
    ...req.body,
    created_by: req.body.created_by || "HR Department Manager"
  });
  res.status(201).json(newAnn);
});


// --- ATTENDANCE ---
app.get("/api/attendance", (req, res) => {
  const { role, employeeId } = getClientUser(req);
  const list = listAttendance();
  if (role === "hr_admin") {
    res.json(list);
  } else {
    res.json(list.filter(rec => rec.employee_id === employeeId));
  }
});

app.post("/api/attendance/clock-in", (req, res) => {
  const { employeeId } = getClientUser(req);
  const record = clockInEmployee(employeeId);
  res.json(record);
});

app.post("/api/attendance/clock-out", (req, res) => {
  const { employeeId } = getClientUser(req);
  const record = clockOutEmployee(employeeId);
  if (!record) return res.status(404).json({ error: "لم يتم العثور على تسجيل دخول لهذا اليوم لتسجيل الانصراف." });
  res.json(record);
});


// --- GENERAL REQUESTS & SALARY CERTIFICATES ---
app.get("/api/requests", (req, res) => {
  const { role, employeeId } = getClientUser(req);
  const allReqs = listGeneralRequests();
  if (role === "hr_admin") {
    res.json(allReqs);
  } else {
    res.json(allReqs.filter(r => r.employee_id === employeeId));
  }
});

app.post("/api/requests", (req, res) => {
  const { employeeId } = getClientUser(req);
  const emp = findEmployeeById(employeeId);
  const employee_name = emp ? emp.employee_name_en : "Employee";

  const newReq = createGeneralRequest({
    ...req.body,
    employee_id: employeeId,
    employee_name
  });
  res.status(201).json(newReq);
});

app.put("/api/requests/:id", (req, res) => {
  const { role } = getClientUser(req);
  if (role !== "hr_admin") return res.status(403).json({ error: "صلاحية التعديل للمسؤولين فقط" });

  const { status } = req.body;
  const updated = updateGeneralRequestStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: "الطلب غير موجود" });
  res.json(updated);
});


// --- AI HR ASSISTANT BOT ---
app.post("/api/chat/hr-assistant", async (req, res) => {
  const { role, employeeId } = getClientUser(req);
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message content is required" });
  }

  const activeEmp = findEmployeeById(employeeId);
  const empName = activeEmp ? `${activeEmp.employee_name_ar} (${activeEmp.employee_name_en})` : "موظف";
  
  const botReply = await askHRAssistant(message, empName, role, history || []);
  res.json({ reply: botReply });
});


// Stat highlights for Dashboard
app.get("/api/dashboard/stats", (req, res) => {
  const emps = listEmployees();
  const cands = listCandidates();
  const jobs = listJobs();
  const leaves = listLeaveRequests();
  const announcements = listAnnouncements();
  const attendance = listAttendance();

  res.json({
    totalEmployees: emps.filter(e => e.status === "active").length,
    totalCandidates: cands.length,
    activeJobs: jobs.filter(j => j.status === "active").length,
    pendingLeaves: leaves.filter(l => l.status === "pending").length,
    recentAnnouncementsCount: announcements.length,
    attendanceTodayCount: attendance.filter(a => a.date === new Date().toISOString().substring(0, 10)).length,
    departmentDistribution: emps.reduce((acc: any, curr) => {
      const dept = curr.department_ar;
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {})
  });
});

// ==========================================
// VITE AND STATIC ASSETS SERVING MIDDLEWARE
// ==========================================

async function setupFrontend() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server mounted as middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static assets from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HR Portal server running at http://0.0.0.0:${PORT} in env: ${process.env.NODE_ENV || "development"}`);
  });
}

setupFrontend().catch((err) => {
  console.error("Failed to start server:", err);
});
