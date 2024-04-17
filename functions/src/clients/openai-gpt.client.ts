import { OpenAI } from "openai";
import * as functions from "firebase-functions";
import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";
import { logger } from "firebase-functions/v2";

const openai = new OpenAI({ apiKey: functions.config().openai.key });
const openAiModel = "gpt-4-turbo";

export const createGptMessage = async (messages: ChatCompletionMessageParam[], max_tokens = 1000): Promise<ChatCompletion> => {
  logger.info('Calling GPT', "model", openAiModel);

  const gptResponse = await openai.chat.completions.create({
    model: openAiModel,
    messages: messages,
    max_tokens,
  });

  logger.info('GPT call complete', "model", openAiModel, "usage", gptResponse.usage);

  return gptResponse;
}


export const createGptJson = async (messages: ChatCompletionMessageParam[], max_tokens = 1000): Promise<ChatCompletion> => {
  logger.info('Calling GPT', "model", openAiModel);

  const gptResponse = await openai.chat.completions.create({
    model: openAiModel,
    messages: messages,
    max_tokens,
    response_format: {type: "json_object"},
  });

  logger.info('GPT call complete', "model", openAiModel, "usage", gptResponse.usage);

  return gptResponse;
}
  
