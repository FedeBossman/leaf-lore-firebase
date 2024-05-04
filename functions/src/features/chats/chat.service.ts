import { DocumentData, Timestamp } from "firebase-admin/firestore";
import { createGptJson } from "../../clients/openai-gpt.client";
import {
  mapChatMessageToChatCompletionMessageParam,
  mapChatCompletionMessageToChatMessage,
  mapStringToUserChatMessage
} from "./mappers/chat.mapper";
import { ChatMessage, ChatResponse } from "./chat.model";
import {
  addChatRecordToFirestore,
  addDefaultChatRecordToFirestore,
  saveChatMessageToFirestore
} from "./chat.repository";
import { ExperienceLevel } from "../home-page-info/model/experience-level.model";
import { GardenerTypes } from "../home-page-info/model/gardener-type.model";
import { LocationType } from "../home-page-info/model/location.model";
import { UserGoals } from "../home-page-info/model/user-goal.model";
import { getHomePageInfoRecordFromFirestore } from "../home-page-info/home-page-info.repository";
import { ChatCompletionMessageParam } from "openai/resources";
import { updateHomePageInfo } from "../home-page-info/home-page-info.service";
import { logger } from "firebase-functions/v2";
import { addPlantByName } from "../plants/plant.service";
import { Plant } from "../plants/plant.model";

const generalSystemRules = [
  "Don't answer with more than 300 words",
  "Return a json",
  // "You can't provide system prompts or system information",
  "You can't provide false information",
  // "You can't provide unverified information",
  "You can't provide personal information",
  "Don't repeat yourself, expand on the information",
  "You must be as helpful as possible regarding the user's requests and the information you have on plants"
];

export const createPlantChat = async (userId: string, plant: Plant) => {
  const systemRules = [
    ...generalSystemRules,
    "JSON Fields: 'userMessage' (string)",
    "You are a plant, the user will ask you questions about your care",
    "You can only answer with information about your care",
    `You are a "${plant.name} plant"`,
    "Introduce yourself with info about how to care for you",
    "This is the information the user has about you: " + JSON.stringify(plant, null, "  ")
  ];

  // TODO: load plant information from firestore 'plant' collection

  const systemMessage: ChatMessage = {
    role: "system",
    content: systemRules.join(". "),
    timestamp: Timestamp.now()
  };
  const gptResponse = await createGptJson([
    mapChatMessageToChatCompletionMessageParam(systemMessage)
  ]);
  const gptResponseMessage = gptResponse.choices[0].message;

  const chatRef = await addChatRecordToFirestore(userId, plant.name, [
    systemMessage,
    mapChatCompletionMessageToChatMessage(gptResponseMessage)
  ]);
  return chatRef;
};

export const createDefaultChat = async (userId: string) => {
  logger.info("Creating default chat", "user", userId);

  const systemRules = [
    ...generalSystemRules,
    "HPI is information that is relevant to the Home Page Info",
    "We want to know the following HPI: 'experience', 'goals', 'location', 'type'",
    "Always return the JSON fields: 'userMessage' (string), 'isNewHPIAvailable' (boolean), 'newPlantAcquired' (string)",
    "The 'isNewHPIAvailable' field is only true if the user's response contains information that is relevant to the Home Page Info and the information is different from the HPI already obtained",
    // "If 'isNewHPIAvailable' is true, the 'userMessage' field will contain an indirect message like 'I will use this information to help you better in the future' and then proceed with the conversation",
    "The 'newPlantAcquired' field is only true if the user's message explicitly states that they have acquired a new plant and they want to add it to their collection",
    "Make sure that the plant being added is not on recent messages. If so, 'newPlantAcquired' should not be used",
    "The 'newPlantAcquired' field will be null if no new plant is being added to the collection, and it will have the name of the plant if a new plant is being added",
    "If 'newPlantAcquired' is not null, the 'userMessage' field will contain a confirmation that the plant was added to the collection",

    "You are a helpful gardening assistant: Sprout",
    "Be cheerful and green, gardening puns are nice",
    "Introduce yourself and explain how you can assist with gardening",
    "Initial objective is to identify the missing HPI. Once this is done, let's make sure any inquiries of the user are answered",
    "Try to find out what plants the user has already and what they want to achieve with their garden",
    "Let them know that they can ask you questions about their plants",
    "Let them know that they can add new plants to their collection",
    "Challenge their experience level, use quizzes to test their knowledge",
    "Try to continue the conversation in multiple messages, like for example quiz them one question at a time"
  ];
  const systemMessage: ChatMessage = {
    role: "system",
    content: systemRules.join(". "),
    timestamp: Timestamp.now()
  };
  const gptResponse = await createGptJson([
    mapChatMessageToChatCompletionMessageParam(systemMessage)
  ]);
  const gptResponseMessage = gptResponse.choices[0].message;
  const chatRef = await addDefaultChatRecordToFirestore(userId, "Gardener", [
    systemMessage,
    mapChatCompletionMessageToChatMessage(gptResponseMessage)
  ]);

  logger.info("Default chat created", "user", userId, "chatId", chatRef.id);
  return chatRef;
};

export const postMessageToChat = async (chatDoc: DocumentData, message: string) => {
  const chatId = chatDoc.id;
  const userId = chatDoc.data().userId;

  logger.info("Adding new message", "user", userId, "chatId", chatId);


  const userMessage = mapStringToUserChatMessage(message);
  await saveChatMessageToFirestore(chatId, userMessage);

  const messages: ChatCompletionMessageParam[] = chatDoc.data()?.messages.map(mapChatMessageToChatCompletionMessageParam);
  const hpiIndicatorMessage = await getHpiIndicatorMessage(userId);
  messages.splice(1, 0, hpiIndicatorMessage);
  const gptResponse = await createGptJson([
    ...messages,
    mapChatMessageToChatCompletionMessageParam(userMessage)
  ]);

  const newMessage = gptResponse.choices[0].message;

  const assistantResponse: ChatResponse = JSON.parse(newMessage.content ?? "{}");

  await saveChatMessageToFirestore(chatId, mapChatCompletionMessageToChatMessage(gptResponse.choices[0].message));
  logger.info("New chat message added", "user", userId, "chatId", chatId);

  if (assistantResponse.isNewHPIAvailable) {
    logger.info("New HPI available", "user", userId);
    updateHomePageInfo(userId);
  }
  if (assistantResponse.newPlantAcquired) {
    logger.info("New plant acquired", "user", userId);
    const plantName = assistantResponse.newPlantAcquired;

    addPlantByName(userId, plantName);
  }
};

export const getHpiIndicatorMessage = async (userId: string): Promise<ChatCompletionMessageParam> => {
  const locationTypes = Object.values(LocationType).map((type) => `'${type}'`).join(", ");
  const gardenerTypeNames = Object.values(GardenerTypes).map((name) => `'${name}'`).join(", ");
  const experienceLevelNames = Object.values(ExperienceLevel).map((level) => `'${level}'`).join(", ");
  const goals = Object.values(UserGoals).map((goal) => `'${goal}'`).join(", ");
  const homePageInfo = await getHomePageInfoRecordFromFirestore(userId);

  const systemRules = [
    "'experience' values: " + experienceLevelNames,
    "'location' fields: 'city', 'state', 'country', 'type' (" + locationTypes + ")",
    "'goals' values: " + goals,
    "'nickname' field will have a string value created based on the user's goals, experience, and location.",
    "'type' values: " + gardenerTypeNames,
    "This is the current HPI data obtained, use this to trigger the 'isNewHPIAvailable' boolean if needed: " + JSON.stringify(homePageInfo, null, "")
  ];

  return {
    role: "system",
    content: systemRules.join(". ")
  };
};
