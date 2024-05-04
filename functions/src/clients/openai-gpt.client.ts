import { OpenAI } from "openai";
import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";
import { logger, onInit } from "firebase-functions/v2";
// import { defineSecret } from "firebase-functions/params";

// const openaiKey = defineSecret('OPENAPI_KEY');

let openai: OpenAI;
onInit(() => {
  const k = process.env.OPENAPI_KEY!;
  console.log('Initializing OpenAI client.');
  openai = new OpenAI({ apiKey: k });
})
const openAiModel = "gpt-3.5-turbo";

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
  
