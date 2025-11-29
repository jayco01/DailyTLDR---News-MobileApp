const { GoogleGenAI, Type } = require("@google/genai");
const logger = require("firebase-functions/logger");

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

// keep it generic so it does not conflict with user settings
const digestSchema = {
  type: Type.OBJECT,
  properties: {
    headline: {
      type: Type.STRING,
      description: "A short, catchy headline for the article.",
    },
    key_takeaway: {
      type: Type.STRING,
      description: "The single most important fact or insight (1 sentence).",
    },
    synopsis: {
      type: Type.STRING,
      description: "The main body/summary of the article.",
    },
    sentiment: { // this is different from tone
      type: Type.STRING,
      description: "The sentiment classification.",
      enum: ["Positive", "Neutral", "Negative", "Controversial"],
    },
  },
  required: ["headline", "key_takeaway", "synopsis", "sentiment"],
};

const generateSummary = async (markdownContent, tone = "Informative", format = "A concise summary") => {
  if (!markdownContent) return null;

  try {
    const result = await genAI.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-lite",
      contents: `
        You are an expert news editor. Summarize the following article text.
        
        USER PREFERENCES:
        - Tone: ${tone}
        - Format Instructions: ${format}
        
        ARTICLE TEXT:
        ${markdownContent.slice(0, 10000)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: digestSchema,
        temperature: 0.2,
      },
    });

    const responseText = result.text;

    if (!responseText) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(responseText);

  } catch (error) {
    logger.error("Gemini Summarization Failed:", error);
    return null;
  }
};

module.exports = { generateSummary };