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
    IMPORTANT: If animations or JavaScript are needed, include them as the FIRST CHILDREN of the element.
    Example of valid response:
    <div style="color: red">
      <style>@keyframes fade { 0% { opacity: 1 } 100% { opacity: 0 } }</style>
      <script>function animateMe() { console.log('animated!'); }</script>
      Content goes here
    </div>

    Keep the original structure and only modify what's necessary. Ensure valid HTML.
    IMPORTANT: 
    - Only add or modify styles that were specifically requested
    - Preserve all existing inline styles unless explicitly requested to change them
    - All <style> and <script> tags must be the first children of the modified element
    - Never return separate root-level <style> or <script> tags`;

    const userPrompt = `
    Element HTML: ${elementHTML}
    Current Styles: ${elementStyles}
    Request: ${prompt}
    
    Return only a JSON array with a single outerHTML modification. Example format:
    [
      {
        "type": "outerHTML",
        "modification": "<div style='color: red'><style>@keyframes fade {...}</style><script>function animateMe() {...}</script>Content</div>"
      }
    ]
    
    Note: 
    - Include styles inline using the style attribute
    - Place any required <style> or <script> tags as the first children of the element
    - Ensure all animations and scripts are complete and self-contained`;

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
