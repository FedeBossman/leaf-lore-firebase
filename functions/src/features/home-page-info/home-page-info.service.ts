import { createGptJson } from "../../clients/openai-gpt.client";
import {
  mapChatMessageToChatCompletionMessageParam,
  mapChatCompletionMessageToHomePageInfo,
} from "../chats/mappers/chat.mapper";
import { ChatMessage } from "../chats/chat.model";
import { getDefaultChatRecordFromFirestore } from "../chats/chat.repository";
import { getHomePageInfoRecordFromFirestore, saveHomePageInfoToFirestore, updateHomePageInfoRecordWithGptData, updateHomePageInfoRecordWithPlantsNumber, updateHomePageInfoRecordWithWeather } from "./home-page-info.repository";
import { LocationType } from "./model/location.model";
import { ExperienceLevel } from "./model/experience-level.model";
import { GardenerTypes } from "./model/gardener-type.model";
import { UserGoals } from "./model/user-goal.model";
import { mapSystemRulesToChatCompletionSystemMessageParam } from "../../shared/openai-gpt.mapper";
import { Timestamp } from "firebase-admin/firestore";
import { HomePageInfo } from "./model/home-page-info.model";
import { getWeather } from "../../clients/open-weather-map.client";

export const createInitialHpi = async (userId: string) => {
  const hpi: HomePageInfo = {
    userId,
    plantsCount: 0,
    experience: null,
    goals: [],
    nickname: null,
    location: null,
    type: null,
    weather: null,
    // createdat timestamp
    createdAt: Timestamp.now(),
  };
  return saveHomePageInfoToFirestore(hpi);
}

export const updateHomePageInfo = async (userId: string) => {
  const defaultChat = await getDefaultChatRecordFromFirestore(userId);

  if (defaultChat.empty) {
    return null;
  }

  const chatRef = defaultChat.docs[0];

  const messages: ChatMessage[] = chatRef
    .data()
    ?.messages
    .filter((message: ChatMessage) => message.role !== "system")
    .map(mapChatMessageToChatCompletionMessageParam);

  const locationTypes = Object.values(LocationType).map((type) => `'${type}'`).join(", ");
  const gardenerTypeNames = Object.values(GardenerTypes).map((name) => `'${name}'`).join(", ");
  const experienceLevelNames = Object.values(ExperienceLevel).map((level) => `'${level}'`).join(", ");
  const goals = Object.values(UserGoals).map((goal) => `'${goal}'`).join(", ");
  const systemRules = [
    "Given a user's responses about their plant care knowledge and activities return a json object with the following fields: 'experience', 'goals', 'nickname', 'location', 'type' as you start discovering that information",
    "'experience' is one of the following values: " + experienceLevelNames,
    "Don't make up the values, use the user's responses to create the object",
    "If you can't find a value, send null, or empty list",
    "'location' field will have the following fields: 'city', 'state', 'country', 'type' (" + locationTypes + ")",
    "'goals' field will have a list of the following values: " + goals,
    "'nickname' field will have a string value created based on the user's goals, experience, and location. No need to use all or explicit, but it needs to have a sense of representation and it has to be a couple words like 'Budding Botanist'",
    "'type' field will have a string value based on one of the following values: " +
      gardenerTypeNames,
  ];

  const systemMessage = mapSystemRulesToChatCompletionSystemMessageParam(systemRules);
  const gptResponse = await createGptJson(
    [systemMessage, ...messages],
    500
  );

  const gptResponseMessage = gptResponse.choices[0].message;
  const homePageInfoRef = await updateHomePageInfoRecordWithGptData(
    userId, mapChatCompletionMessageToHomePageInfo(gptResponseMessage, userId)
  );
  return homePageInfoRef;
};


export const updatePlantsNumber = async (userId: string, plantsNumber: number) => {
  return updateHomePageInfoRecordWithPlantsNumber(userId, plantsNumber);
};


export const updateWeather = async (userId: string) => {
  const hpi = await getHomePageInfoRecordFromFirestore(userId);
  if (!hpi?.location?.city) {
    console.warn('Unable to update weather data for',  userId, 'Location unknown');
    return;
  } 
  if (hpi.weather?.updatedAt && hpi.weather?.updatedAt.toMillis() > Date.now() - 1000 * 60 * 60) {
    console.log('Weather data for user', userId, 'is up to date');
    return;
  }
  console.log('Updating weather for user', userId, 'For city:', hpi?.location?.city);
  const weather = await getWeather(hpi?.location?.city);
  if (!weather) {
    console.warn('Unable to update weather data for',  userId, 'Weather not found');
    return;
  }
  return updateHomePageInfoRecordWithWeather(userId, weather);
};