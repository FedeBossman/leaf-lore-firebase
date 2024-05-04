import { ChatCompletion, ChatCompletionSystemMessageParam } from "openai/resources/chat";

export function mapChatCompletionToJson<T>(chatCompletion: ChatCompletion): T {
  const content = chatCompletion.choices[0]?.message?.content?.trim() ?? "";
  return JSON.parse(content);
}

export function mapSystemRulesToChatCompletionSystemMessageParam(systemRules: string[]): ChatCompletionSystemMessageParam {
  return {
    role: "system",
    content: systemRules.join(". ")
  };
}
