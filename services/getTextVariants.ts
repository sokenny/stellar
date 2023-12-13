import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);

export const generateAiTextResponse = async ({
  model = 'gpt-3.5-turbo',
  prompt,
}) => {

  try {
    const MAX_TOKENS = 50; 

    const openaiResponse = await openai.createChatCompletion({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: MAX_TOKENS,
      temperature: 0.8,
    });

    const res = {
      body: openaiResponse.data,
    };
    return res;
  } catch (e) {
    return {
      error: e.response.data,
    };
  }
};
