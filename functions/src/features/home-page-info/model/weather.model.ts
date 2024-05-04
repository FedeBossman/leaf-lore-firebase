import { Timestamp } from "firebase-admin/firestore";

export interface Weather {
  temperature: number;
  humidity: number;
  description: string;
  updatedAt?: Timestamp;
}
