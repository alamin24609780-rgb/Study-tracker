import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface StudyInsight {
  recommendation: string;
  suggestedSubject: string;
  reason: string;
}

export async function getStudyInsights(sessions: any[], subjects: any[]): Promise<StudyInsight> {
  const sessionSummary = sessions.slice(0, 20).map(s => ({
    subject: s.subject_name,
    duration: Math.round(s.duration_seconds / 60) + " mins",
    date: s.created_at
  }));

  const subjectList = subjects.map(s => s.name).join(", ");

  const prompt = `Analyze these study sessions: ${JSON.stringify(sessionSummary)}. 
  Available subjects: ${subjectList}.
  Provide a smart study recommendation. Which subject is being neglected? What should the user focus on next?
  Return a JSON object with: recommendation (string), suggestedSubject (string), reason (string).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: { type: Type.STRING },
            suggestedSubject: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["recommendation", "suggestedSubject", "reason"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Insight Error:", error);
    return {
      recommendation: "Keep up the consistent work! Try to balance your subjects.",
      suggestedSubject: subjects[0]?.name || "General",
      reason: "Not enough data for deep analysis yet."
    };
  }
}
