import { OpenAI } from "openai";
import * as functions from "firebase-functions";
import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";
import * as logger from "firebase-functions/logger";

const openai = new OpenAI({ apiKey: functions.config().openai.key });

export const createGptMessage = async (messages: ChatCompletionMessageParam[], max_tokens = 500): Promise<ChatCompletion> => {
  const gptResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens,
  });

  logger.info(`GPT-3.5-turbo token usage:`, gptResponse.usage);

  return gptResponse;
}


export const createGptJson = async (messages: ChatCompletionMessageParam[], max_tokens = 500): Promise<ChatCompletion> => {
  const gptResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens,
    response_format: {type: "json_object"},
  });

  logger.info(`GPT-3.5-turbo token usage:`, gptResponse.usage);

  return gptResponse;
}
  
