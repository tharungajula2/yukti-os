import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// Vercel / Next.js App Router Config
export const maxDuration = 60; // Request max duration (Hobby plan is limited to 10s-30s, Pro is 300s)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const clinicalContext = formData.get("clinicalContext") as string || "No clinical profile available.";
    const historyContext = formData.get("historyContext") as string || "No previous reports.";
    const mode = formData.get("mode") as string;

    // --- MODE 1: HOLISTIC SUMMARY ---
    if (mode === "summary") {
       let modelString = "gemini-2.5-flash"; // Primary: 2.5 Flash
       let model = genAI.getGenerativeModel({ model: modelString });
       
       const summaryPrompt = `You are "Yukti AI", a senior medical data analyst.
       
       OBJECTIVE: Generate a "Holistic Health Summary" for a patient based on their Clinical Profile and Report History.
       
       TONE: 
       - Beginner Friendly (Explain simple medical terms in brackets).
       - Reassuring but Objective.
       - Use Simple English (ELI5 style).
       
       INPUTS:
       1. Clinical Profile (Assessment Scores & Answers):
       ${clinicalContext}
       
       2. Report History (Past Lab/Rx Analysis):
       ${historyContext}
       
       TASKS:
       1. **Synthesize:** Combine the clinical profile risks with the findings from the report history.
       2. **Filter Noise:** If the history contains reports that seem completely unrelated, IMPLICITLY IGNORE THEM.
       3. **Connect the Dots:** Highlight how the reports confirm or contradict the clinical assessment scores.
       
       OUTPUT FORMAT (JSON):
       \`\`\`json
       {
         "title": "Holistic Health Summary",
         "patientRiskProfile": "Summary of their risk level (e.g. 'High Risk Diabetic')",
         "keyFindings": [
           "**Finding 1**: Explanation in simple english.",
           "**Finding 2**: Another finding."
         ],
         "trendAnalysis": "A nicely spaced paragraph describing the health trajectory. Use bold text for emphasis.",
         "recommendation": "One clear, high-level medical recommendation based on the synthesis."
       }
       \`\`\`
       `;

       let result;
       try {
           result = await model.generateContent(summaryPrompt);
       } catch (error: any) {
           console.warn(`Summary with ${modelString} failed: ${error.message}. Warning: Fallback to gemini-2.5-flash-lite.`);
           // Fallback System
           modelString = "gemini-2.5-flash-lite";
           model = genAI.getGenerativeModel({ model: modelString });
           result = await model.generateContent(summaryPrompt);
       }

       const text = result.response.text();
       
       // Clean JSON
       let jsonString = text;
       const codeBlockMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(text);
       if (codeBlockMatch) {
            jsonString = codeBlockMatch[1];
       } else {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonString = text.substring(firstBrace, lastBrace + 1);
            }
       }
       
       try {
           return NextResponse.json({ result: JSON.parse(jsonString), modelUsed: modelString });
       } catch (e) {
           return NextResponse.json({ error: "Failed to parse Summary JSON", raw: text }, { status: 500 });
       }
    }

    // --- MODE 2: DOCUMENT ANALYSIS ---
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert File to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/png";

    console.log(`Analyzing file: ${file.name} (${mimeType})`);

    // Primary Model: Gemini 2.5 Flash
    let modelString = "gemini-2.5-flash"; 
    let model = genAI.getGenerativeModel({ model: modelString });

    const prompt = `You are "Yukti AI", an automated health data analyst.
    Your Tone: Empathetic, Reassuring, Beginner-Friendly (Explain medical terms).
    
    Patient Clinical Context (Profile):
    ${clinicalContext}

    Medical History (Past Reports Summary):
    ${historyContext}

    TASKS:
    1.  **Classify:** Is this a "Lab Report", "Prescription", or "Scan"?
    2.  **Analyze (Deep Read):** Read every single page. Extract all abnormal values.
    3.  **Explain:** For every abnormal finding, explain WHAT it means in simple English.
    4.  **Medicines:** Extract detailed medicine info.
        -   **Type:** "Chronic" (Long-term, e.g. Diabetes/BP) OR "Acute" (Short-term, e.g. Antibiotics/Painkillers).
        -   **Duration:** Look for keywords like "for 5 days", "1 month". Default to "Ongoing" if Chronic.
    5.  **Context:** Connect findings to the Patient Clinical Profile.
    
    CRITICAL: Output must be in strict JSON.
    
    \`\`\`json
    {
      "meta": { "reportDate": "YYYY-MM-DD", "reportType": "Lab/Rx/Scan", "pageCount": "estimated pages" },
      "summary": "High-level summary in simple, non-jargon language.",
      "clinicalCorrelation": "How this report relates to the patient's history (e.g. 'This confirms the diabetes risk').",
      "biomarkers": [
          { "name": "Test Name", "value": "120", "unit": "mg/dL", "status": "High/Low/Normal", "trend": "Rising/Falling/Stable/New" }
      ],
      "analysis": "Detailed findings in MARKDOWN. Use bullet points, **Bold** text, and short paragraphs. Explain complex terms.",
      "medicines": [ 
        { 
          "name": "Augmentin 625", 
          "type": "Acute", 
          "strength": "625mg", 
          "dosage": "1 tablet twice daily", 
          "timing": "After food",
          "duration": "5 days"
        },
        { 
          "name": "Glycomet", 
          "type": "Chronic", 
          "strength": "500mg", 
          "dosage": "1 tablet daily", 
          "timing": "Before food",
          "duration": "Ongoing"
        } 
      ],
      "disclaimer": "Generated by AI. Verify with a specialist."
    }
    \`\`\`
    
    Ensure the JSON is valid and the only output.`;

    const analyzeImage = async (sclectedModel: any) => {
        return await sclectedModel.generateContent([
            prompt,
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
        ]);
    };

    let result;
    try {
        result = await analyzeImage(model);
    } catch (modelError: any) {
        console.warn(`Primary model ${modelString} failed (${modelError.message}), attempting fallback to gemini-2.5-flash-lite`);
        modelString = "gemini-2.5-flash-lite";
        model = genAI.getGenerativeModel({ model: modelString });
        result = await analyzeImage(model);
    }

    const responseText = result.response.text();
    
    // Clean and Parse JSON
    let jsonString = responseText;
    
    // 1. Try extracting code block (case insensitive, optional 'json' tag)
    const codeBlockMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(responseText);
    if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
    } else {
        // 2. If no code block, try finding the outer braces
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonString = responseText.substring(firstBrace, lastBrace + 1);
        }
    }
    
    let parsedResult;
    try {
        parsedResult = JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON from AI", responseText);
        // Fallback: Try to sanitize newlines in strings if that's the issue
        try {
            // Very basic sanitize for common JSON multiline string issues
            const sanitized = jsonString.replace(/\n/g, "\\n");
            parsedResult = JSON.parse(sanitized);
        } catch (e2) {
             parsedResult = {
                docType: "Unknown",
                summary: "Analysis completed but format was unstructured. See raw details below.",
                analysis: responseText, // Ensure user sees the raw text
                medicines: [],
                disclaimer: "AI Parsing Error. Raw output shown."
            };
        }
    }

    return NextResponse.json({ result: parsedResult, modelUsed: modelString });

  } catch (error: any) {
    console.error("Yukti AI Analysis Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze the report.", 
        details: error.message || String(error) 
      },
      { status: 500 }
    );
  }
}
