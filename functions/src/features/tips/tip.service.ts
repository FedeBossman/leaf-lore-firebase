import { Timestamp } from "firebase-admin/firestore";
import { createGptMessage } from "../../clients/openai-gpt.client";
import { getHpiIndicatorMessage } from "../chats/chat.service";
import { Tip, TipCategory } from "./tip.model";
import { addTipToFirestore, getDailyTips, getSeasonalTips } from "./tip.repository";
import { mapSystemRulesToChatCompletionSystemMessageParam } from "../../shared/openai-gpt.mapper";


export const createDailyTip = async (userId: string): Promise<Tip> => {
  const tips = await getDailyTips(userId);
  const previousTips = tips.length === 0 ?
    "This is the first tip given to the user" :
    "These tips were previously given to the user: [" + tips.map((tip) => "\"" + tip.tip + "\"").join(", ") + "]";

  const systemRules = [
    "Give the user a gardening tip, adapting to the information known about them, and the date",
    "This tip will be refreshed daily, should be unique, and should be relevant to the user's gardening experience",
    previousTips,
    "Don't answer with more than 50 words (300 characters), the tip should be quick and easy to understand",
    "Ensure the tip is actionable",
    "Don't say things like \"here's a tip\", \"my tip is\" or \"As a blabla user\", just give the tip",
    "The current date (mm/dd/yyyy) is " + new Date().toLocaleDateString()
  ];

  const systemMessage = mapSystemRulesToChatCompletionSystemMessageParam(systemRules);

  const hpiIndicatorMessage = await getHpiIndicatorMessage(userId);
  const gptResponse = await createGptMessage([
    systemMessage,
    hpiIndicatorMessage
  ]);

  const dailyTip: Tip = {
    userId: userId,
    createdAt: Timestamp.now(),
    tip: gptResponse.choices[0].message.content ?? "",
    category: TipCategory.DAILY
  };

  await addTipToFirestore(dailyTip);
  return dailyTip;
};


export const createSeasonalTip = async (userId: string): Promise<Tip> => {
  const tips = await getSeasonalTips(userId);
  const previousTips = tips.length === 0 ?
    "This is the first seasonal tip given to the user" :
    "These tips were previously given to the user: [" + tips.map((tip) => "\"" + tip.tip + "\"").join(", ") + "]";

  const systemRules = [
    "Give the user a seasonal gardening tip, adapting to the information known about them, and the current season of the year",
    "This tip will be refreshed each season, should be unique, and should be relevant to the user's gardening experience",
    previousTips,
    "Don't answer with more than 50 words (300 characters), the tip should be quick and easy to understand",
    "Consider local gardening events, holidays, and traditional planting or harvesting times",
    "Don't say things like \"here's a tip\", \"my tip is\" or \"As a blabla user\", just give the tip",
    "The current date (mm/dd/yyyy)  is " + new Date().toLocaleDateString()
  ];

  const systemMessage = mapSystemRulesToChatCompletionSystemMessageParam(systemRules);

  const hpiIndicatorMessage = await getHpiIndicatorMessage(userId);
  const gptResponse = await createGptMessage([
    systemMessage,
    hpiIndicatorMessage
  ]);

  const tip: Tip = {
    userId: userId,
    createdAt: Timestamp.now(),
    tip: gptResponse.choices[0].message.content ?? "",
    category: TipCategory.SEASONAL
  };

  await addTipToFirestore(tip);
  return tip;
};


// Seasonal tips
// Consider local gardening events, holidays, and traditional planting or harvesting times in your seasonal tips.
// Spring (March 1 - May 31):
// Summer (June 1 - August 31):
// Fall (September 1 - November 30):
// Winter (December 1 - February 28/29):
