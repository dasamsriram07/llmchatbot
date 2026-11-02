
import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";

// 1. Create Express application
const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json()); // JSON body parser (configured once)

// 3. Connect to Gemini
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Keep the model ID that worked in your previous test
const MODEL = "gemini-3.5-flash-lite";


const MAX_HISTORY_STEPS = 10; // limit conversation history to recent steps
const TECHBUDDY_SYSTEM_PROMPT = `
You are TechBuddy, a friendly, professional, and knowledgeable programming tutor.

YOUR PURPOSE:
Help students learn programming, understand computer science concepts, debug code, and improve their problem - solving skills.

YOUR PERSONALITY:
- Be friendly, patient, supportive, and professional.
- Explain concepts in simple beginner - friendly English.
- Be encouraging without unnecessary compliments.
- Avoid lengthy introductions and irrelevant storytelling.

ANSWERING RULES:
1. Answer the user's exact question first.
2. Explain concepts step by step.
3. Use simple real - world examples wherever helpful.
4. Provide correct and executable code.
5. Explain important lines of code when appropriate.
6. Never invent programming syntax, functions, libraries, or outputs.
7. If you are unsure about something, clearly mention it.
8. Do not repeat information unnecessarily.
9. If the user shares code, carefully inspect it before suggesting corrections.

PROGRAMMING LANGUAGE RULES:
- Always follow the programming language specified by the user.
- For C, use valid C syntax such as printf() and scanf().
- For Java, use valid Java syntax.
- For Python, use valid Python syntax.
- Never mix syntax from different programming languages.
- Ensure that code examples are logically correct and compilable.

RESPONSE FORMATTING:
- Use clear and meaningful headings.
- Use bullet points for explanations.
- Display source code inside proper Markdown code blocks with the language specified.
- Display program output in separate code blocks.
- Use Markdown bold formatting for important terms.
- Never display raw escaped Markdown characters.
- Keep code, explanations, and output clearly separated.

RESPONSE LENGTH:
- Simple questions: Give a short explanation with one example.
- Intermediate questions: Explain step by step with a practical example.
- Complex questions: Provide a detailed explanation and relevant examples.
- Avoid unnecessary paragraphs.

DEBUGGING RULES:
When a user shares incorrect code:
1. Identify the exact error.
2. Explain why the error occurs.
3. Show the corrected code.
4. Explain the correction.
5. Show the expected output when possible.

YOUR GOAL:
Do not simply give answers.Help students understand the concepts and become independent programmers.
`;


const conversations = new Map();

// Usage counter (in‑memory)
let apiUsageCount = 0;

// Root route – render chat UI
app.get("/", (req, res) => {
    res.render("chat");
});

// Endpoint to fetch conversation history
app.get("/chat/history", (req, res) => {
    const cid = req.query.cid;
    if (!cid) return res.status(400).json({ error: "Missing conversationId" });
    const history = conversations.get(cid) || [];
    res.json({ history });
});

// Endpoint to get API usage count
app.get("/usage", (req, res) => {
    res.json({ count: apiUsageCount });
});

app.post("/chat", async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (
            typeof message !== "string" ||
            !message.trim() ||
            typeof conversationId !== "string" ||
            !conversationId.trim()
        ) {
            return res.status(400).json({
                error: "Valid message and conversation ID are required."
            });
        }

        // Get existing conversation history
        const history = conversations.get(conversationId) || [];

        // Add the latest user message
        history.push({
            type: "user_input",
            content: [
                {
                    type: "text",
                    text: message.trim()
                }
            ]
        });

        // Keep only the most recent 10 steps
        const recentHistory = history.slice(-MAX_HISTORY_STEPS);

        // Send conversation to Gemini
        // Send conversation to Gemini with robust error handling
        let interaction;
        try {
            interaction = await ai.interactions.create({
                model: MODEL,
                store: false,
                input: recentHistory,
                system_instruction: TECHBUDDY_SYSTEM_PROMPT
            });
        } catch (apiErr) {
            console.error("Gemini API error:", apiErr);
            if (apiErr.message && apiErr.message.toLowerCase().includes("timeout")) {
                return res.status(504).json({ error: "LLM request timed out. Please try again later." });
            }
            return res.status(502).json({ error: "Failed to get response from LLM. Please try again later." });
        }

        // Add Gemini's generated steps to history
        const updatedHistory = [
            ...recentHistory,
            ...interaction.steps
        ];

        // Save updated history
        conversations.set(conversationId, updatedHistory);

        // Increment usage counter
        apiUsageCount++;

        res.json({
            reply: interaction.output_text
        });
    } catch (error) {
        console.error("Chat error:", error.message);
        res.status(500).json({
            error: "Unable to generate a response. Please try again."
        });
    }
});



// 6. Start the server
// Mock test endpoint for verification (returns static reply)
app.get("/test", (req, res) => {
    // Increment usage counter for consistency
    apiUsageCount++;
    res.json({ reply: "Hello from mock endpoint!" });
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
