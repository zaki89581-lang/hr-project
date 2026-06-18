import { getInitialState, saveState } from "../dataStore";
import { Employee } from "../../types";

export function listEmployees(): Employee[] {
  const db = getInitialState();
  return db.employees;
}

export function findEmployeeById(id: string): Employee | undefined {
  const db = getInitialState();
  return db.employees.find(emp => emp.employee_id === id);
}

export function generateNextEmployeeId(): { employee_id: string; id_number: string } {
  const db = getInitialState();
  const count = db.employees.length;
  const nextNum = count + 1;
  const id_number = String(nextNum).padStart(4, "0"); // e.g. "0004"
  const employee_id = `EMP${String(nextNum).padStart(3, "0")}`; // e.g. "EMP004"
  return { employee_id, id_number };
}

export function createEmployee(empData: Omit<Employee, "employee_id" | "id_number">): Employee {
  const db = getInitialState();
  const { employee_id, id_number } = generateNextEmployeeId();
  
  const newEmp: Employee = {
    ...empData,
    employee_id,
    id_number,
    status: empData.status || "active",
    photo_url: empData.photo_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  };

  db.employees.push(newEmp);
  saveState(db);
  return newEmp;
}

export function updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
  const db = getInitialState();
  const index = db.employees.findIndex(emp => emp.employee_id === id);
  if (index === -1) return undefined;

  // Prevent overriding the ids
  const { employee_id, id_number, ...editableUpdates } = updates;

  db.employees[index] = {
    ...db.employees[index],
    ...editableUpdates,
    // Safely deep merge complex objects if present
    education: {
      ...db.employees[index].education,
      ...(editableUpdates.education || {})
    },
    bank: {
      ...db.employees[index].bank,
      ...(editableUpdates.bank || {})
    }
  };

  saveState(db);
  return db.employees[index];
}

export function deleteEmployee(id: string): boolean {
  const db = getInitialState();
  const originalLength = db.employees.length;
  db.employees = db.employees.filter(emp => emp.employee_id !== id);
  if (db.employees.length === originalLength) return false;
  saveState(db);
  return true;
}
