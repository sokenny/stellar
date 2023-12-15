import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);

export const getTextVariants = async ({ model = 'gpt-3.5-turbo', prompt }) => {
  try {
    const MAX_TOKENS = 50;

    const openaiResponse = await openai.createChatCompletion({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: MAX_TOKENS,
      temperature: 0.8,
    });

    const stringifiedVariants = openaiResponse.data.choices[0].message.content;

    return JSON.parse(stringifiedVariants);
  } catch (e) {
    console.log('error! ', e);
    return {
      error: e.response.data,
    };
  }
};
