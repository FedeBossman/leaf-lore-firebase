import { Timestamp } from "firebase-admin/firestore";

export interface Tip {
  id?: string;
  userId: string;
  createdAt: Timestamp;
  tip: string;
  category: string;
}

export enum TipCategory {
  DAILY = "daily",
  SEASONAL = "seasonal",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
  SPECIAL = "special"
}
