import { getInitialState, saveState } from "../dataStore";
import { Job } from "../../types";

export function listJobs(): Job[] {
  const db = getInitialState();
  return db.jobs;
}

export function findJobById(id: string): Job | undefined {
  const db = getInitialState();
  return db.jobs.find(job => job.job_id === id);
}

export function createJob(jobData: Omit<Job, "job_id" | "created_at">): Job {
  const db = getInitialState();
  const nextId = `JOB${String(db.jobs.length + 1).padStart(3, "0")}`;
  const newJob: Job = {
    ...jobData,
    job_id: nextId,
    created_at: new Date().toISOString().substring(0, 10)
  };
  db.jobs.push(newJob);
  saveState(db);
  return newJob;
}

export function updateJob(id: string, updates: Partial<Job>): Job | undefined {
  const db = getInitialState();
  const index = db.jobs.findIndex(job => job.job_id === id);
  if (index === -1) return undefined;

  db.jobs[index] = {
    ...db.jobs[index],
    ...updates
  };
  saveState(db);
  return db.jobs[index];
}

export function deleteJob(id: string): boolean {
  const db = getInitialState();
  const originalLength = db.jobs.length;
  db.jobs = db.jobs.filter(job => job.job_id !== id);
  if (db.jobs.length === originalLength) return false;
  saveState(db);
  return true;
}
