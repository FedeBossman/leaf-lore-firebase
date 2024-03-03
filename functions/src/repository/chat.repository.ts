import * as admin from "firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { ChatMessage } from "../models/domain/chat.model";

admin.initializeApp();

const db = admin.firestore();


export const getChatRecordFromFirestore = async (chatId: string) => {
  const chatRef = db.collection("chats").doc(chatId);
  return chatRef.get();
};

export const addChatRecordToFirestore = async (userId: string, messages: ChatMessage[]) => {
  const timestamp = Timestamp.now();
  return await db.collection("chats").add({
    userId: userId,
    createdAt: timestamp,
    messages: messages,
  });
};

export const saveChatMessageToFirestore = async (chatId: string, message: ChatMessage) => {
  const chatRef = db.collection("chats").doc(chatId);
  return chatRef.update({
    messages: FieldValue.arrayUnion(
      message
    ),
  });
};

