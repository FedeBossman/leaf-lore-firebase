import {ChatCompletionMessage, ChatCompletionMessageParam} from "openai/resources";
import {ChatMessage} from "../models/domain/chat.model";
import {Timestamp} from "firebase-admin/firestore";


export const mapStringToUserChatMessage = (message: string): ChatMessage => ({
  role: "user",
  content: message,
  timestamp: Timestamp.now(),
});

export const mapChatMessageToChatCompletionMessageParam = (message: ChatMessage): ChatCompletionMessageParam => ({
  role: message.role,
  content: message.content,
});

export const mapChatCompletionMessageToChatMessage =
(message: ChatCompletionMessage): ChatMessage => ({
  role: message.role,
  content: message.content?.trim() ?? "",
  timestamp: Timestamp.now(),
});
