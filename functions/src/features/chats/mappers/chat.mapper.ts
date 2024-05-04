import { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources";
import { ChatMessage, ChatResponse } from "../chat.model";
import { Timestamp } from "firebase-admin/firestore";
import { HomePageInfo } from "../../home-page-info/model/home-page-info.model";


export const mapStringToUserChatMessage = (message: string): ChatMessage => ({
  role: "user",
  content: message,
  timestamp: Timestamp.now()
});

export const mapChatMessageToChatCompletionMessageParam = (message: ChatMessage): ChatCompletionMessageParam => ({
  role: message.role,
  content: message.content
});

export const mapChatCompletionMessageToChatMessage =
(message: ChatCompletionMessage): ChatMessage => {
  const assistantResponse: ChatResponse = JSON.parse(message.content ?? "{}");

  return {
    role: message.role,
    content: assistantResponse.userMessage?.trim() ?? "",
    timestamp: Timestamp.now()
  };
};

export const mapChatCompletionMessageToHomePageInfo = (message: ChatCompletionMessage, userId: string): HomePageInfo => {
  const content = message.content?.trim() ?? "";
  const homePageInfo: HomePageInfo = JSON.parse(content);
  homePageInfo.userId = userId;
  homePageInfo.createdAt = Timestamp.now();
  return homePageInfo;
};
