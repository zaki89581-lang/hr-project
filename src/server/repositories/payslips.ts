import { getInitialState, saveState } from "../dataStore";
import { Payslip } from "../../types";

export function listPayslips(): Payslip[] {
  const db = getInitialState();
  return db.payslips;
}

export function findPayslipsByEmployee(empId: string): Payslip[] {
  const db = getInitialState();
  return db.payslips.filter(p => p.employee_id === empId);
}

export function createPayslip(payslipData: Omit<Payslip, "id" | "net_salary">): Payslip {
  const db = getInitialState();
  const nextId = `PAY${String(db.payslips.length + 1).padStart(3, "0")}`;
  const net_salary = Number(payslipData.basic_salary) + Number(payslipData.allowances) - Number(payslipData.deductions);
  
  const newSlip: Payslip = {
    ...payslipData,
    id: nextId,
    net_salary
  };
  db.payslips.push(newSlip);
  saveState(db);
  return newSlip;
}

export function updatePayslipStatus(id: string, status: "paid" | "pending"): Payslip | undefined {
  const db = getInitialState();
  const index = db.payslips.findIndex(p => p.id === id);
  if (index === -1) return undefined;

  db.payslips[index].status = status;
  saveState(db);
  return db.payslips[index];
}
