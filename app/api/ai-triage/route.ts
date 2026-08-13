import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { description } = await request.json();

        if (!description) {
            return Response.json(
                { error: "Description is required" },
                { status: 400 }
            );
        }

        const prompt = `
You are an IT support ticket triage assistant.

Analyze the following IT support ticket.

Classify it into ONE of these categories:
- Email
- Network
- Software
- Hardware
- Other

Classify priority as:
- High
- Medium
- Low

Return ONLY valid JSON in this exact format:

{
  "category": "Network",
  "priority": "High",
  "confidence": 95,
  "reasoning": "Brief explanation of why the ticket was classified this way."
}

Ticket description:
${description}
`;

        const result = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
        });

        const response = result.text || "";

        const cleanedResponse = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const aiResult = JSON.parse(cleanedResponse);

        return Response.json(aiResult);

    } catch (error) {
        console.error("AI triage error:", error);

        return Response.json(
            { error: "Failed to process AI triage" },
            { status: 500 }
        );
    }
}