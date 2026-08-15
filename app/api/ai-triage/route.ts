import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const ALLOWED_CATEGORIES = [
    "Email",
    "Network",
    "Software",
    "Hardware",
    "Other",
];

const ALLOWED_PRIORITIES = [
    "High",
    "Medium",
    "Low",
];

export async function POST(request: Request) {
    try {
        const { title, description } = await request.json();

        if (!description?.trim()) {
            return Response.json(
                { error: "Description is required" },
                { status: 400 }
            );
        }

        const prompt = `
You are an IT support ticket triage assistant.

Your job is to analyze an employee's IT support request and determine
the most appropriate category and priority.

Allowed categories:
- Email
- Network
- Software
- Hardware
- Other

Allowed priorities:
- High
- Medium
- Low

Priority guidelines:
- High: The issue significantly prevents the employee from working,
  affects critical systems, or blocks an important business function.
- Medium: The issue affects the employee's work but there is a workaround
  or the impact is limited.
- Low: Minor issue, inconvenience, cosmetic issue, or issue with minimal
  impact on productivity.

Rules:
1. Choose exactly ONE category.
2. Choose exactly ONE priority.
3. Confidence must be a number between 0 and 100.
4. Base the decision only on the information provided.
5. Do not invent technical details.
6. Keep the reasoning brief and specific.
7. Return ONLY valid JSON.
8. Do not use markdown or code fences.

Return exactly this structure:

{
  "category": "Network",
  "priority": "High",
  "confidence": 95,
  "reasoning": "Brief explanation based on the ticket information."
}

Ticket title:
${title || "No title provided"}

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

        let aiResult;

        try {
            aiResult = JSON.parse(cleanedResponse);
        } catch {
            console.error(
                "Invalid JSON returned by Gemini:",
                response
            );

            return Response.json(
                { error: "AI returned an invalid response" },
                { status: 502 }
            );
        }

        // Validate category
        if (!ALLOWED_CATEGORIES.includes(aiResult.category)) {
            return Response.json(
                { error: "AI returned an invalid category" },
                { status: 502 }
            );
        }

        // Validate priority
        if (!ALLOWED_PRIORITIES.includes(aiResult.priority)) {
            return Response.json(
                { error: "AI returned an invalid priority" },
                { status: 502 }
            );
        }

        // Validate confidence
        const confidence = Number(aiResult.confidence);

        if (
            !Number.isFinite(confidence) ||
            confidence < 0 ||
            confidence > 100
        ) {
            return Response.json(
                { error: "AI returned an invalid confidence score" },
                { status: 502 }
            );
        }

        // Validate reasoning
        if (
            typeof aiResult.reasoning !== "string" ||
            !aiResult.reasoning.trim()
        ) {
            return Response.json(
                { error: "AI returned invalid reasoning" },
                { status: 502 }
            );
        }

        return Response.json({
            category: aiResult.category,
            priority: aiResult.priority,
            confidence: Math.round(confidence),
            reasoning: aiResult.reasoning.trim(),
        });

    } catch (error) {
        console.error("AI triage error:", error);

        return Response.json(
            { error: "Failed to process AI triage" },
            { status: 500 }
        );
    }
}