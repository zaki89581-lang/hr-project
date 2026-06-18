/**
 * HR Portal Joint Type Declarations
 */

export interface Employee {
  employee_id: string; // EMP001...
  id_number: string; // "0001", "0002"
  employee_name_en: string;
  employee_name_ar: string;
  national_id: string;
  department_en: string;
  department_ar: string;
  job_title_en: string;
  job_title_ar: string;
  email: string;
  phone: string;
  work_email: string;
  work_phone: string;
  address: string;
  join_date: string;
  basic_salary: number;
  status: "active" | "inactive";
  branch: string;
  photo_url: string;
  education: {
    degree: string;
    field_of_study: string;
    university: string;
    graduation_date: string;
  };
  bank: {
    bank_name: string;
    account_number: string;
    iban: string;
  };
  relatives: Array<{
    name: string;
    phone: string;
    relationship: string;
    job: string;
  }>;
  reports_to: string;
  is_lead: boolean;
}

export interface Candidate {
  id: string; // internal tracking ID
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

export interface Job {
  job_id: string; // JOB001...
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

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  type: "annual" | "sick" | "emergency";
  start_date: string;
  end_date: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
  created_at: string;
}

export interface Payslip {
  id: string;
  employee_id: string;
  month: string; // "2026-01"
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: "paid" | "pending";
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string; // "General" | "HR" | "Event" | "Urgent"
  priority: "low" | "medium" | "high";
  created_by: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string; // "2026-06-16"
  clock_in: string; // "09:00:15"
  clock_out: string | null; // "17:05:00"
  status: "present" | "absent" | "late" | "leave";
}

export interface RequestItem {
  id: string;
  employee_id: string;
  employee_name: string;
  type: "salary_certificate" | "official_letter" | "reimbursement";
  details: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}
