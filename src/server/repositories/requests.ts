import { getInitialState, saveState } from "../dataStore";
import { LeaveRequest, RequestItem } from "../../types";

// --- Leave Requests ---

export function listLeaveRequests(): LeaveRequest[] {
  const db = getInitialState();
  return db.leave_requests;
}

export function findLeavesByEmployee(empId: string): LeaveRequest[] {
  const db = getInitialState();
  return db.leave_requests.filter(req => req.employee_id === empId);
}

export function createLeaveRequest(data: Omit<LeaveRequest, "id" | "status" | "created_at">): LeaveRequest {
  const db = getInitialState();
  const nextId = `LV${String(db.leave_requests.length + 1).padStart(3, "0")}`;
  
  const newLeave: LeaveRequest = {
    ...data,
    id: nextId,
    status: "pending",
    created_at: new Date().toISOString().substring(0, 10)
  };

  db.leave_requests.push(newLeave);
  saveState(db);
  return newLeave;
}

export function updateLeaveStatus(id: string, status: "approved" | "rejected"): LeaveRequest | undefined {
  const db = getInitialState();
  const index = db.leave_requests.findIndex(req => req.id === id);
  if (index === -1) return undefined;

  db.leave_requests[index].status = status;
  saveState(db);
  return db.leave_requests[index];
}


// --- General HR Requests (salary certificate, reimbursements, etc.) ---

export function listGeneralRequests(): RequestItem[] {
  const db = getInitialState();
  return db.requests;
}

export function createGeneralRequest(data: Omit<RequestItem, "id" | "status" | "created_at">): RequestItem {
  const db = getInitialState();
  const nextId = `REQ${String(db.requests.length + 1).padStart(3, "0")}`;

  const newReq: RequestItem = {
    ...data,
    id: nextId,
    status: "pending",
    created_at: new Date().toISOString().substring(0, 10)
  };

  db.requests.push(newReq);
  saveState(db);
  return newReq;
}

export function updateGeneralRequestStatus(id: string, status: "approved" | "rejected"): RequestItem | undefined {
  const db = getInitialState();
  const index = db.requests.findIndex(req => req.id === id);
  if (index === -1) return undefined;

  db.requests[index].status = status;
  saveState(db);
  return db.requests[index];
}
