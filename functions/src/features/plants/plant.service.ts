import { createGptJson } from "../../clients/openai-gpt.client";
import { mapChatCompletionToJson, mapSystemRulesToChatCompletionSystemMessageParam } from "../../shared/openai-gpt.mapper";
import { createPlantChat } from "../chats/chat.service";
import { Plant } from "./plant.model";
import { addPlantRecordToFirestore, getPlantsCountByUserId } from "./plant.repository";

export const addPlantByName = async (userId: string, plantName: string) => {
  const systemRules = [
    `Return a json object with plant information for the plant '${plantName}'`,
    "Return all and only the following fields: name, official species name, nickname, careLevel, sunlightRequirement, wateringFrequency, fertilizationFrequency, soilType, potSize, humidityRequirement, notes",
    "Do not return any false or unverified information, its preferred to return no information than to return false information",
    "The plant name should be the same as the plant name in the request",
    "To make an accurate decision, assume the user is a beginner gardener unless otherwise specified",
    "For example, if the plant can be small to big, assume the user will choose smaller to start",
    "careLevel must always be one of the following: 'low', 'medium', 'high'",
    "sunlightRequirement must always be one of the following: 'fullSun', 'partialShade', 'fullShade'",
    "wateringFrequency must always be one of the following: 'daily', 'weekly', 'biweekly', 'monthly'",
    "fertilizationFrequency must always be one of the following: 'weekly', 'monthly', 'quarterly', 'yearly'",
    "soilType must always be one of the following: 'loamy', 'sandy', 'clay', 'peaty', 'chalky', 'wellDraining'",
    "potSize must always be one of the following: 'small', 'medium', 'large', 'extraLarge'",
    "humidityRequirement must always be one of the following: 'low', 'medium', 'high'",
  ];

  const systemMessage = mapSystemRulesToChatCompletionSystemMessageParam(systemRules);
  const gptResponse = await createGptJson([systemMessage]);
  const plant: Plant = mapChatCompletionToJson<Plant>(gptResponse);
  plant.userId = userId;
  const ref = await addPlantRecordToFirestore(plant);

  createPlantChat(userId, plant);

  return ref;
};

export const getPlantsCount = async (userId: string) => {
  return getPlantsCountByUserId(userId);
}


