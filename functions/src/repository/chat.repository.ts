import { DocumentData, DocumentSnapshot, FieldValue, QuerySnapshot, Timestamp } from "firebase-admin/firestore";
import { ChatMessage } from "../models/domain/chat.model";
import { db } from "./firestore";


export const getChatRecordFromFirestore = async (chatId: string): Promise<DocumentSnapshot<DocumentData>> => {
  const chatRef = db.collection("chats").doc(chatId);
  return chatRef.get();
};

export const getDefaultChatRecordFromFirestore = async (userId: string): Promise<QuerySnapshot<DocumentData>> => {
  return db.collection("chats")
    .where("userId", "==", userId)
    .where("defaultChat", "==", true)
    .get();
}

export const addDefaultChatRecordToFirestore = async (userId: string, name: string, messages: ChatMessage[]) => {
  const timestamp = Timestamp.now();
  return await db.collection("chats").add({
    userId: userId,
    createdAt: timestamp,
    messages: messages,
    defaultChat: true,
    name: name,
  });
};

export const addChatRecordToFirestore = async (userId: string, name: string, messages: ChatMessage[]) => {
  const timestamp = Timestamp.now();
  return await db.collection("chats").add({
    userId: userId,
    createdAt: timestamp,
    messages: messages,
    defaultChat: false,
    name: name,
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
