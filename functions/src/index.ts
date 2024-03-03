/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

import * as functions from "firebase-functions";
import {ChatMessage} from "./models/domain/chat.model";
import {
  mapChatCompletionMessageToChatMessage,
  mapChatMessageToChatCompletionMessageParam,
  mapStringToUserChatMessage} from "./mappers/chat.mapper";
import { addChatRecordToFirestore, getChatRecordFromFirestore, saveChatMessageToFirestore } from "./repository/chat.repository";
import { Timestamp } from "firebase-admin/firestore";
import { createGptChat } from "./client/openai-gpt.client";



exports.createChat = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = context.auth.uid;

  const systemMessage: ChatMessage = {
    role: "system",
    // eslint-disable-next-line max-len
    content: "Don't answer with more than 80 words. Max 300 characters per response. You are a helpful gardening assistant. Be cheerful and green, gardening puns are nice. Introduce yourself and explain how you can assist with gardening.",
    timestamp: Timestamp.now(),
  };
  const gptResponse = await createGptChat([
    mapChatMessageToChatCompletionMessageParam(systemMessage),
  ]);

  const gptResponseMessage = gptResponse.choices[0].message;
  const chatRef = await addChatRecordToFirestore(userId, [
    systemMessage,
    mapChatCompletionMessageToChatMessage(gptResponseMessage),
  ]);

  return {chatId: chatRef.id};
});

exports.postMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userId = context.auth.uid;
  const {chatId, message} = data;

  if (!chatId || !message) {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with chat ID and message.");
  }

  const chatDoc = await getChatRecordFromFirestore(chatId);

  if (!chatDoc.exists || chatDoc.data()?.userId !== userId) {
    throw new functions.https.HttpsError("not-found", "Chat not found or you do not have access to it.");
  }
  
  const userMessage = mapStringToUserChatMessage(message);
  await saveChatMessageToFirestore(chatId, userMessage);

  const messages: ChatMessage[] = chatDoc.data()?.messages.map(mapChatMessageToChatCompletionMessageParam);

  // Call GPT with the conversation and the new user message
  const gptResponse = await createGptChat([
    ...messages,
    mapChatMessageToChatCompletionMessageParam(userMessage),
  ]);

  await saveChatMessageToFirestore(chatId, mapChatCompletionMessageToChatMessage(gptResponse.choices[0].message));

  return {success: true};
});



