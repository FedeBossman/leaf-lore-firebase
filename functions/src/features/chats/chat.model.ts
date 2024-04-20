import { Timestamp } from "firebase-admin/firestore";
import { ChatRole } from "./chat.enums";

export interface ChatResponse {
  userMessage: string;
  isNewHPIAvailable: boolean;
  newPlantAcquired: string;
}

export interface ChatRecord {
  id?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  defaultChat: boolean;
  name: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id?: string;
  role: ChatRole;
  content: string;
  timestamp: Timestamp;
}
