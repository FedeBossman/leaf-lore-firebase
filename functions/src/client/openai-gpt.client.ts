import { OpenAI } from "openai";
import * as functions from "firebase-functions";
import { ChatCompletionMessageParam } from "openai/resources";

const openai = new OpenAI({ apiKey: functions.config().openai.key });

export const createGptChat = async (messages: ChatCompletionMessageParam[]) => 
  openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 100,
  });
