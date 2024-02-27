import {Timestamp} from "firebase-admin/firestore";
import {ChatRole} from "../enums";

export interface ChatMessage {
    role: ChatRole,
    content: string,
    timestamp: Timestamp
}
