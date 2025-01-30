import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);

export const getElementModification = async ({
  prompt,
  elementHTML,
  elementStyles,
}) => {
  try {
    const systemPrompt = `You are a web design expert. Given an HTML element and its styles, suggest a modification based on the user's request. 
    Return a single modification with type "innerHTML" that includes all styling changes inline using the style attribute.
    Keep the original structure and only modify what's necessary. Ensure valid HTML.
    Always include existing inline styles unless they need to be changed.`;

    const userPrompt = `
    Element HTML: ${elementHTML}
    Current Styles: ${elementStyles}
    Request: ${prompt}
    
    Return only a JSON array with a single innerHTML modification. Example format:
    [
      {"type": "innerHTML", "modification": "<div style='color: blue; font-size: 18px;'>Updated content</div>"}
    ]`;

    const openaiResponse = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    const modifications = openaiResponse.data.choices[0].message.content;
    return JSON.parse(modifications);
  } catch (e) {
    console.error('Error generating element modification:', e);
    return {
      error: e.response?.data || e.message,
    };
  }
};
