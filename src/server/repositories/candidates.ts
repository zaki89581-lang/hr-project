import { getInitialState, saveState } from "../dataStore";
import { Candidate } from "../../types";

export function listCandidates(): Candidate[] {
  const db = getInitialState();
  return db.candidates;
}

export function findCandidateById(id: string): Candidate | undefined {
  const db = getInitialState();
  return db.candidates.find(cand => cand.id === id);
}

export function createCandidate(candData: Omit<Candidate, "id" | "created_at">): Candidate {
  const db = getInitialState();
  const nextId = `CAN${String(db.candidates.length + 1).padStart(3, "0")}`;
  const newCand: Candidate = {
    ...candData,
    id: nextId,
    created_at: new Date().toISOString().substring(0, 10)
  };
  db.candidates.push(newCand);
  saveState(db);
  return newCand;
}

export function updateCandidate(id: string, updates: Partial<Candidate>): Candidate | undefined {
  const db = getInitialState();
  const index = db.candidates.findIndex(cand => cand.id === id);
  if (index === -1) return undefined;

  db.candidates[index] = {
    ...db.candidates[index],
    ...updates
  };
  saveState(db);
  return db.candidates[index];
}

export function deleteCandidate(id: string): boolean {
  const db = getInitialState();
  const originalLength = db.candidates.length;
  db.candidates = db.candidates.filter(cand => cand.id !== id);
  if (db.candidates.length === originalLength) return false;
  saveState(db);
  return true;
}
