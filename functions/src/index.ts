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

// Initialize Firebase Admin and OpenAI SDK
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {OpenAI} from "openai";
import {ChatMessage} from "./models/domain/chat.model";
import {
  mapChatCompletionMessageToChatMessage,
  mapChatMessageToChatCompletionMessageParam,
  mapStringToUserChatMessage} from "./mappers/chat.mapper";
import {FieldValue, Timestamp} from "firebase-admin/firestore";

admin.initializeApp();

const db = admin.firestore();

const openai = new OpenAI({apiKey: functions.config().openai.key});

exports.createChat = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = context.auth.uid;

  const systemMessage: ChatMessage = {
    role: "system",
    // eslint-disable-next-line max-len
    content: "Don't answer with more than 80 words. Max 300 characters per response. You are a helpful gardening assistant. Be cheerful and green, gardening puns are nice. Introduce yourself and explain how you can assist with gardening.",
    timestamp: Timestamp.now(),
  };
  // Call GPT to get an introduction message
  const gptResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      mapChatMessageToChatCompletionMessageParam(systemMessage),
    ],
    max_tokens: 100,
  });

  const gptResponseMessage = gptResponse.choices[0].message;
  const timestamp = Timestamp.now();
  const chatRef = await db.collection("chats").add({
    userId: userId,
    createdAt: timestamp,
    messages: [
      systemMessage,
      mapChatCompletionMessageToChatMessage(gptResponseMessage),
    ],
  });

  return {chatId: chatRef.id};
});

exports.postMessage = functions.https.onCall(async (data, context) => {
  // Authenticate the user
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userId = context.auth.uid;
  const {chatId, message} = data;

  if (!chatId || !message) {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with chat ID and message.");
  }

  // Retrieve the chat from Firestore
  const chatRef = db.collection("chats").doc(chatId);
  const chatDoc = await chatRef.get();

  if (!chatDoc.exists || chatDoc.data()?.userId !== userId) {
    throw new functions.https.HttpsError("not-found", "Chat not found or you do not have access to it.");
  }

  const userMessage = mapStringToUserChatMessage(message);
  const messages: ChatMessage[] = chatDoc.data()?.messages.map(mapChatMessageToChatCompletionMessageParam);

  // Call GPT with the conversation and the new user message
  const gptResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      ...messages,
      mapChatMessageToChatCompletionMessageParam(userMessage),
    ],
    max_tokens: 100,
  });

  // Update the chat with the new user message and GPT's response
  await chatRef.update({
    messages: FieldValue.arrayUnion(
      userMessage,
      mapChatCompletionMessageToChatMessage(gptResponse.choices[0].message),
    ),
  });

  return {success: true};
});

