import { getInitialState, saveState } from "../dataStore";
import { AttendanceRecord } from "../../types";

export function listAttendance(): AttendanceRecord[] {
  const db = getInitialState();
  return db.attendance;
}

export function findAttendanceByEmployeeAndDate(empId: string, date: string): AttendanceRecord | undefined {
  const db = getInitialState();
  return db.attendance.find(rec => rec.employee_id === empId && rec.date === date);
}

export function clockInEmployee(empId: string): AttendanceRecord {
  const db = getInitialState();
  const todayStr = new Date().toISOString().substring(0, 10);
  const existing = findAttendanceByEmployeeAndDate(empId, todayStr);
  if (existing) return existing;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  
  // Decide if present or late based on 9 AM grace time
  let status: "present" | "late" = "present";
  if (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)) {
    status = "late";
  }

  const nextId = `ATT${String(db.attendance.length + 1).padStart(3, "0")}`;
  const newRecord: AttendanceRecord = {
    id: nextId,
    employee_id: empId,
    date: todayStr,
    clock_in: timeStr,
    clock_out: null,
    status
  };

  db.attendance.push(newRecord);
  saveState(db);
  return newRecord;
}

export function clockOutEmployee(empId: string): AttendanceRecord | undefined {
  const db = getInitialState();
  const todayStr = new Date().toISOString().substring(0, 10);
  const index = db.attendance.findIndex(rec => rec.employee_id === empId && rec.date === todayStr);
  if (index === -1) return undefined;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  
  db.attendance[index].clock_out = timeStr;
  saveState(db);
  return db.attendance[index];
}
