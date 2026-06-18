import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

export async function askHRAssistant(prompt: string, employeeName: string, role: string, chatHistory: { role: string; text: string }[]): Promise<string> {
  try {
    const ai = getGeminiClient();
    
    // Construct chat structure or full context for generation
    const systemInstruction = `You are a helpful, extremely professional, and warm Arabic/English bilingual Human Resources assistant bot named "HR Bot" (مساعد الموارد البشرية).
You are assisting employee "${employeeName}" with role "${role}" in the HR Portal system of the company.
Follow these rules:
1. Speak clearly, politely, and maintain absolute confidentiality.
2. Rely on the company policies:
   - Annual leave request rate is 1.75 days per month of service (رصيد الإجازات السنوية هو 1.75 يوم لكل شهر خدمة).
   - Core working hours are 9:00 AM to 5:00 PM (أوقات العمل الرسمية من 9 صباحاً لـ 5 مساءً). Clock-in after 9:15 AM is counted "Late" (الحضور بعد 9:15 يعتبر متأخراً).
   - Employees are entitled to requesting Salary Certificates (شهادة تعريف بالراتب), Annual Leve (إجازة سنوية), Sick Leave (إجازة مرضية), and emergency leaves.
3. Be bilingual: support both Arabic (primarily, as the user speaks Arabic) and English. Respond in the language of the prompt.
4. If asked generic HR questions, give compliant and encouraging answers. Use structured formatting or bullet points if appropriate.
5. If the Gemini API key is missing or encounters any other problem, explain that nicely.`;

    // Map history to the format expected by the SDK
    const contents = chatHistory.map(h => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "لم أتمكن من استخلاص إجابة في الوقت الحالي.";
  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    return `مرحباً، أواجه مشكلة في الاتصال بمحرك الذكاء الاصطناعي حالياً. يرجى التحقق من مفتاح GEMINI_API_KEY في الإعدادات. (الخطأ: ${error.message || error})`;
  }
}
