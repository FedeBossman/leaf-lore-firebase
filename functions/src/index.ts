// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

import {HttpsError, onCall} from "firebase-functions/v1/https";
import {
  mapChatCompletionMessageToChatMessage,
  mapChatMessageToChatCompletionMessageParam,
  mapStringToUserChatMessage} from "./mappers/chat.mapper";
import { createGptJson } from "./client/openai-gpt.client";
import { createPlantChat, createDefaultChat, getHpiIndicatorMessage } from "./processors/chat.processor";
import { getDefaultChatRecordFromFirestore, getChatRecordFromFirestore, saveChatMessageToFirestore } from "./repository/chat.repository";
import { getHomePageInfoRecordFromFirestore } from "./repository/home-page-info.repository";
import { updateHomePageInfo } from "./processors/home-page-info.processor";
import { ChatCompletionMessageParam } from "openai/resources";
import { logger } from "firebase-functions/v1";
import { ChatResponse } from "./models/domain/chat.model";
import { getDailyTip, getSeasonalTip } from "./repository/tip.repository";
import { createDailyTip, createSeasonalTip } from "./processors/tip.processor";


exports.createChat = onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = context.auth.uid;

  const chatRef = await createPlantChat(userId);

  return {chatId: chatRef.id};
});

exports.getDefaultChat = onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = context.auth.uid;

  const defaultChat = await getDefaultChatRecordFromFirestore(userId);
  if (defaultChat.empty) {
    const chatRef = await createDefaultChat(userId);
    return {chatId: chatRef.id};
  } else {
    return {chatId: defaultChat.docs[0].id};
  }
});

exports.postMessage = onCall(async (data, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userId = context.auth.uid;
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
});

exports.getHomePageInfo = onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = context.auth.uid;

  await updateHomePageInfo(userId);

  const homePageInfo = await getHomePageInfoRecordFromFirestore(userId);

  return homePageInfo;
});

exports.getDailyTip = onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = context.auth.uid;
  let dailyTip = await getDailyTip(userId);

  if (!dailyTip) {
      dailyTip = await createDailyTip(userId);
  }

  return dailyTip;
});


exports.getSeasonalTip = onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = context.auth.uid;
  let dailyTip = await getSeasonalTip(userId);

  if (!dailyTip) {
      dailyTip = await createSeasonalTip(userId);
  }

  return dailyTip;
});