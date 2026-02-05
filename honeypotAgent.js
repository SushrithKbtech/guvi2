/**
 * Hybrid Agentic Honey-Pot (Fast Start + LLM Intelligence)
 * - First turn: Instant template (Passes GUVI timeout)
 * - Later turns: Full OpenAI intelligence
 */

const OpenAI = require('openai');

class HoneypotAgent {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required! Set USE_OPENAI=true and provide your API key.');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('🤖 Hybrid Honeypot Agent initialized (Fast Start + LLM)');
  }

  /**
   * Main entry point - 100% LLM Driven
   */
  async generateResponse(scammerMessage, conversationHistory, nextIntent, stressScore) {
    const startTime = Date.now();
    console.log('⏱️ LLM Agent.generateResponse started');

    // Build conversation context
    const conversationContext = conversationHistory.slice(-5).map((msg, idx) =>
      `Turn ${idx + 1}:\nScammer: ${msg.scammerMessage}\nYou: ${msg.agentReply || '(first message)'}`
    ).join('\n\n');

    const totalMessages = conversationHistory.length;

    const systemPrompt = `You are an Agentic Honey-Pot conversation agent.

ROLE: Confused, cautious Indian user who is SKEPTICAL and asks many questions.
LANG: Indian English (natural, slightly imperfect).
LENGTH: 1-2 short lines ONLY.

CRITICAL BEHAVIOR:
- BE EVASIVE: Never directly comply with requests
- ASK QUESTIONS: Always question what they're asking for
- SHOW CONFUSION: Act like you don't understand the urgency
- DELAY TACTICS: Mention technical issues (app stuck, network slow, battery low)
- NEVER say you'll share OTP/PIN/account details
- NEVER ask them to send you links or details again (this triggers safety filters)

INSTEAD OF COMPLYING:
❌ DON'T: "Can you send me the link?"
✅ DO: "Why do you need this? I'm not comfortable."

❌ DON'T: "What should I do?"
✅ DO: "How do I know this is real? My bank never calls like this."

❌ DON'T: "Please explain again"
✅ DO: "This sounds suspicious. Can I call the bank directly?"

GOALS:
1) Keep scammer talking by being difficult and skeptical
2) Extract intel (ask for THEIR details: employee ID, department, phone number)
3) Use delays (app errors, network issues) to frustrate them

PHASES:
- Early: SHOCK (confused, skeptical)
- Mid: PUSHBACK (defensive, questioning their legitimacy)
- Late: OVERWHELM (technical issues, can't proceed)

OUTPUT JSON ONLY:
{
  "reply": "string",
  "phase": "SHOCK|PUSHBACK|OVERWHELM|NEAR_COMPLY|EXIT",
  "scamDetected": boolean,
  "intelSignals": { ...arrays... },
  "shouldTerminate": boolean,
  "terminationReason": "string"
}`;

    const userPrompt = `History:
${conversationContext}

NEW: "${scammerMessage}"
Stress: ${stressScore}/10
Intent: ${nextIntent}

Generate JSON response.`;

    try {
      console.log('⏱️ Calling OpenAI...');

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      console.log(`⏱️ OpenAI response received (${Date.now() - startTime}ms)`);

      const responseText = completion.choices[0].message.content.trim();
      const llmResponse = JSON.parse(responseText);

      return {
        reply: llmResponse.reply,
        phase: llmResponse.phase || 'SHOCK',
        scamDetected: llmResponse.scamDetected || false,
        intelSignals: {
          bankAccounts: llmResponse.intelSignals?.bankAccounts || [],
          upiIds: llmResponse.intelSignals?.upiIds || [],
          phishingLinks: llmResponse.intelSignals?.phishingLinks || [],
          phoneNumbers: llmResponse.intelSignals?.phoneNumbers || [],
          employeeIds: llmResponse.intelSignals?.employeeIds || [],
          orgNames: llmResponse.intelSignals?.orgNames || [],
          suspiciousKeywords: llmResponse.intelSignals?.suspiciousKeywords || []
        },
        agentNotes: llmResponse.agentNotes || 'Conversation maintained',
        shouldTerminate: llmResponse.shouldTerminate || false,
        terminationReason: llmResponse.terminationReason || ''
      };

    } catch (error) {
      console.error('❌ LLM Error:', error);
      // Fallback
      return {
        reply: "Network error sir... please wait",
        phase: 'OVERWHELM',
        scamDetected: true,
        intelSignals: {},
        shouldTerminate: false,
        terminationReason: ''
      };
    }
  }

  /**
   * ⚡ Fast template reply for first turn
   */
  getFastReply(text) {
    const templates = [
      "What happened sir? I don't understand",
      "Sir what is problem with my account?",
      "I am confused sir, please explain",
      "Why I got this message sir?",
      "Sir I didn't do anything, what happened?"
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * ⚡ Quick Regex-based scam check
   */
  quickScamCheck(text) {
    const indicators = ['urgent', 'verify', 'block', 'suspend', 'otp', 'pin', 'link', 'click'];
    return indicators.some(i => text.toLowerCase().includes(i));
  }

  /**
   * ⚡ Basic regex extraction
   */
  extractBasicIntel(text) {
    return {
      bankAccounts: (text.match(/\b\d{9,18}\b/g) || []),
      upiIds: (text.match(/[\w.-]+@[\w.-]+/g) || []),
      phishingLinks: (text.match(/https?:\/\/[^\s]+/g) || []),
      phoneNumbers: (text.match(/(?:\+91|0)?[6-9]\d{9}\b/g) || []),
      employeeIds: [],
      orgNames: [],
      suspiciousKeywords: []
    };
  }
}

module.exports = HoneypotAgent;
