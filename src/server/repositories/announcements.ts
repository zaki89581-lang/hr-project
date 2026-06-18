import { getInitialState, saveState } from "../dataStore";
import { Announcement } from "../../types";

export function listAnnouncements(): Announcement[] {
  const db = getInitialState();
  // Return announcements sorted by date descending optionally
  return [...db.announcements].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createAnnouncement(data: Omit<Announcement, "id" | "created_at">): Announcement {
  const db = getInitialState();
  const nextId = `ANN${String(db.announcements.length + 1).padStart(3, "0")}`;
  const newAnn: Announcement = {
    ...data,
    id: nextId,
    created_at: new Date().toISOString().substring(0, 10)
  };
  db.announcements.push(newAnn);
  saveState(db);
  return newAnn;
}

export function deleteAnnouncement(id: string): boolean {
  const db = getInitialState();
  const originalLength = db.announcements.length;
  db.announcements = db.announcements.filter(ann => ann.id !== id);
  if (db.announcements.length === originalLength) return false;
  saveState(db);
  return true;
}
