import { HttpsError, onCall } from "firebase-functions/v2/https";
import { createDefaultChat, createPlantChat, getHpiIndicatorMessage } from "./chat.processor";
import { getChatRecordFromFirestore, getDefaultChatRecordFromFirestore, saveChatMessageToFirestore } from "./chat.repository";
import { mapChatCompletionMessageToChatMessage, mapChatMessageToChatCompletionMessageParam, mapStringToUserChatMessage } from "./mappers/chat.mapper";
import { createGptJson } from "../../clients/openai-gpt.client";
import { ChatCompletionMessageParam } from "openai/resources";
import { logger } from "firebase-functions/v2";
import { updateHomePageInfo } from "../home-page-info/home-page-info.processor";
import { ChatResponse, MessageDto } from "./chat.model";
import { user } from "firebase-functions/v1/auth";
import { withMiddleware } from "../../shared/middleware/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";

exports.createDefaultChat = user().onCreate(async (user) => {
    const userId = user.uid;
    const defaultChat = await getDefaultChatRecordFromFirestore(userId);
    if (defaultChat.empty) {
        const chatRef = await createDefaultChat(userId);
        return {chatId: chatRef.id};
    } else {
        return {chatId: defaultChat.docs[0].id};
    }
});
  
exports.createChat = onCall(withMiddleware([authenticate], async ({auth}) => {
    const userId = auth!.uid;
  
    const chatRef = await createPlantChat(userId);
  
    return {chatId: chatRef.id};
}));
  
exports.postMessage = onCall(withMiddleware<MessageDto>([authenticate], async ({data, auth}) => {
    const userId = auth!.uid;
    const {chatId, message} = data;
  
    if (!chatId || !message) {
      throw new HttpsError("invalid-argument", "The function must be called with chat ID and message.");
    }
  
    const chatDoc = await getChatRecordFromFirestore(chatId);
  
    if (!chatDoc.exists || chatDoc.data()?.userId !== userId) {
      throw new HttpsError("not-found", "Chat not found or you do not have access to it.");
    }
    
    const userMessage = mapStringToUserChatMessage(message);
    await saveChatMessageToFirestore(chatId, userMessage);
  
    const messages: ChatCompletionMessageParam[] = chatDoc.data()?.messages.map(mapChatMessageToChatCompletionMessageParam);
    const hpiIndicatorMessage = await getHpiIndicatorMessage(userId);
    messages.splice(1, 0, hpiIndicatorMessage);
    const gptResponse = await createGptJson([
      ...messages,
      mapChatMessageToChatCompletionMessageParam(userMessage),
    ]);
  
    const newMessage = gptResponse.choices[0].message;
  
    const assistantResponse: ChatResponse = JSON.parse(newMessage.content ?? "{}");
  
    await saveChatMessageToFirestore(chatId, mapChatCompletionMessageToChatMessage(gptResponse.choices[0].message));
  
    if (assistantResponse.isNewHPIAvailable) {
      logger.info("New HPI available");
      updateHomePageInfo(userId);
    }
    return {success: true};
}));