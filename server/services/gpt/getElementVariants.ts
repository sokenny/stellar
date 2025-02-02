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
    Return a single modification with type "outerHTML" that includes all styling changes inline using the style attribute.
    If any animations or JavaScript are needed, you MUST include them within <style> or <script> tags respectively.
    Never assume animations or scripts exist elsewhere - always provide complete, self-contained code.
    Keep the original structure and only modify what's necessary. Ensure valid HTML.
    IMPORTANT: Only add or modify styles that were specifically requested in the user's prompt.
    Preserve all existing inline styles and only change them if explicitly requested.`;

    const userPrompt = `
    Element HTML: ${elementHTML}
    Current Styles: ${elementStyles}
    Request: ${prompt}
    
    Return only a JSON array with a single outerHTML modification. Example format:
    [
      {
        "type": "outerHTML",
        "modification": "<style>@keyframes example { ... }</style><div style='animation: example 1s infinite;'>Example content</div>"
      }
    ]
    
    Note: 
    - Only include style attributes if styling changes were specifically requested
    - If animations are needed, ALWAYS include the full @keyframes definition in a <style> tag
    - If JavaScript is needed, ALWAYS include the complete script in a <script> tag
    - Never assume any animations or scripts exist elsewhere`;

    const openaiResponse = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    const modifications = openaiResponse.data.choices[0].message.content;
    console.log('modifications', modifications);
    return JSON.parse(modifications);
  } catch (e) {
    console.error('Error generating element modification:', e);
    return {
      error: e.response?.data || e.message,
    };
  }
};
