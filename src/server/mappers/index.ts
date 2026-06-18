import { Employee, Candidate, Job, LeaveRequest, Payslip, Announcement } from "../../types";

export function mapEmployee(emp: Employee) {
  return {
    employee_id: emp.employee_id,
    id_number: emp.id_number,
    employee_name_en: emp.employee_name_en,
    employee_name_ar: emp.employee_name_ar,
    national_id: emp.national_id,
    department_en: emp.department_en,
    department_ar: emp.department_ar,
    job_title_en: emp.job_title_en,
    job_title_ar: emp.job_title_ar,
    email: emp.email,
    phone: emp.phone,
    work_email: emp.work_email,
    work_phone: emp.work_phone,
    address: emp.address,
    join_date: emp.join_date,
    basic_salary: emp.basic_salary,
    status: emp.status,
    branch: emp.branch,
    photo_url: emp.photo_url,
    education: emp.education,
    bank: emp.bank,
    relatives: emp.relatives,
    reports_to: emp.reports_to,
    is_lead: emp.is_lead,
    // Add custom helper fields like vacation days credit (1.75 days per month of service!)
    calculated_vacation_credit: calculateVacationCredit(emp.join_date)
  };
}

export function mapCandidate(c: Candidate) {
  return { ...c };
}

export function mapJob(j: Job) {
  return { ...j };
}

export function mapLeaveRequest(l: LeaveRequest) {
  return { ...l };
}

export function mapPayslip(p: Payslip) {
  return { ...p };
}

export function mapAnnouncement(a: Announcement) {
  return { ...a };
}

// Calculate 1.75 days per month since join date
export function calculateVacationCredit(joinDateStr: string): number {
  try {
    const joinDate = new Date(joinDateStr);
    const now = new Date();
    
    let months = (now.getFullYear() - joinDate.getFullYear()) * 12;
    months -= joinDate.getMonth();
    months += now.getMonth();
    
    const countMonths = Math.max(0, months);
    // Calculated standard accrual
    const credit = Number((countMonths * 1.75).toFixed(2));
    return credit;
  } catch (e) {
    return 21; // fallback standard 21 days
  }
}
