import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);

export const MAX_TOKENS = 200;

export const getTextVariants = async ({ prompt }) => {
  try {
    const openaiResponse = await openai.createChatCompletion({
      // model: 'gpt-3.5-turbo-0125', use 4o instead
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: MAX_TOKENS,
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
