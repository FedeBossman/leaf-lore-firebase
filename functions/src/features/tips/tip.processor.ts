import { Timestamp } from "firebase-admin/firestore";
import { ChatMessage } from "../chats/chat.model";
import { createGptMessage } from "../../clients/openai-gpt.client";
import { mapChatMessageToChatCompletionMessageParam } from "../chats/mappers/chat.mapper";
import { getHpiIndicatorMessage } from "../chats/chat.processor";
import { Tip } from "./tip.model";
import { addTipToFirestore } from "./tip.repository";

export const createDailyTip = async (userId: string): Promise<Tip> => {
    const systemRules = [
      "Give the user a gardening tip, adapting to the information known about them, and the date",
      "This tip will be refreshed daily, should be unique, and should be relevant to the user's gardening experience",
      "Don't answer with more than 50 words (300 characters), the tip should be quick and easy to understand",
      "Ensure the tip is actionable",
      "Don't say things like \"here's a tip\" or \"my tip is\", just give the tip",
      "The date is " + new Date().toLocaleDateString(),
    ];

    // TODO: previous tips
  
    const systemMessage: ChatMessage = {
      role: "system",
      content: systemRules.join(". "),
      timestamp: Timestamp.now(),
    };

    const hpiIndicatorMessage = await getHpiIndicatorMessage(userId);
    const gptResponse = await createGptMessage([
      mapChatMessageToChatCompletionMessageParam(systemMessage),
      hpiIndicatorMessage,
    ]);

    const dailyTip: Tip = {
        userId: userId,
        createdAt: Timestamp.now(),
        tip: gptResponse.choices[0].message.content ?? "",
        category: "daily",
    };
    
    await addTipToFirestore(dailyTip);
    return dailyTip;
  };


export const createSeasonalTip = async (userId: string): Promise<Tip> => {
  const systemRules = [
    "Give the user a seasonal gardening tip, adapting to the information known about them, and the current season of the year",
    "This tip will be refreshed each season, should be unique, and should be relevant to the user's gardening experience",
    "Don't answer with more than 50 words (300 characters), the tip should be quick and easy to understand",
    "Consider local gardening events, holidays, and traditional planting or harvesting times",
    "The date is " + new Date().toLocaleDateString(),
  ];

  // TODO: previous tips

  const systemMessage: ChatMessage = {
    role: "system",
    content: systemRules.join(". "),
    timestamp: Timestamp.now(),
  };

  const hpiIndicatorMessage = await getHpiIndicatorMessage(userId);
  const gptResponse = await createGptMessage([
    mapChatMessageToChatCompletionMessageParam(systemMessage),
    hpiIndicatorMessage,
  ]);

  const dailyTip: Tip = {
      userId: userId,
      createdAt: Timestamp.now(),
      tip: gptResponse.choices[0].message.content ?? "",
      category: "seasonal",
  };
  
  await addTipToFirestore(dailyTip);
  return dailyTip;
};


  // Seasonal tips
  // Consider local gardening events, holidays, and traditional planting or harvesting times in your seasonal tips.
  // Spring (March 1 - May 31):
  // Summer (June 1 - August 31):
  // Fall (September 1 - November 30):
  // Winter (December 1 - February 28/29):