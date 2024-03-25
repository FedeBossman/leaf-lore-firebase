import {Timestamp} from "firebase-admin/firestore";
import {ChatRole} from "./chat.enums";

export interface ChatResponse {
    userMessage: string;
    isNewHPIAvailable: boolean;
}


export interface ChatRecord {
    id?: string,
    userId: string,
    createdAt: Timestamp,
    defaultChat: boolean,
    name: string,
    messages: ChatMessage[],
}

export interface ChatMessage {
    id?: string,
    role: ChatRole,
    content: string,
    timestamp: Timestamp
}

export interface MessageDto {
    chatId: string;
    message: string;
}