import { HttpsError, onCall } from "firebase-functions/v2/https";
import { createDefaultChat, postMessageToChat } from "./chat.service";
import { getChatRecordFromFirestore, getDefaultChatRecordFromFirestore } from "./chat.repository";
import { withMiddleware } from "../../shared/middleware/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { AddMessageDto } from "./chat.dto";
import { user } from "firebase-functions/v1/auth";
import { logger } from "firebase-functions/v2";

exports.createDefaultChat = user().onCreate(async (user) => {
  logger.info("New user detected. Creating default chat", user.uid);
  const userId = user.uid;
  const defaultChat = await getDefaultChatRecordFromFirestore(userId);
  if (defaultChat.empty) {
    const chatRef = await createDefaultChat(userId);
    return { chatId: chatRef.id };
  } else {
    return { chatId: defaultChat.docs[0].id };
  }
});

exports.postMessage = onCall(withMiddleware<AddMessageDto>([authenticate], async ({ data, auth }) => {
  const userId = auth!.uid;
  const { chatId, message } = data;

  if (!chatId || !message) {
    throw new HttpsError("invalid-argument", "The function must be called with chat ID and message.");
  }

  logger.info("Posting new message.", "User:", userId);

  const chatDoc = await getChatRecordFromFirestore(chatId);

  if (!chatDoc.exists || chatDoc.data()?.userId !== userId) {
    throw new HttpsError("not-found", "Chat not found or you do not have access to it.");
  }

  await postMessageToChat(chatDoc, message);

  return { success: true };
}));
