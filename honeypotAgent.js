/**
 * 100% LLM-Driven Agentic Honey-Pot
 * All logic (response, intelligence, phase, termination) handled by OpenAI
 */

const OpenAI = require('openai');

class HoneypotAgent {
  constructor() {
    // OpenAI is REQUIRED for this version
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required! Set USE_OPENAI=true and provide your API key.');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('🤖 100% LLM-Driven Honeypot Agent initialized');
  }

  /**
   * Generate complete response using LLM
   */
  async generateResponse(scammerMessage, conversationHistory, nextIntent, stressScore) {
    const startTime = Date.now();
    console.log('⏱️ LLM Agent.generateResponse started');

    // Build conversation context
    const conversationContext = conversationHistory.slice(-5).map((msg, idx) =>
      `Turn ${idx + 1}:\nScammer: ${msg.scammerMessage}\nYou: ${msg.agentReply || '(first message)'}`
    ).join('\n\n');

    const totalMessages = conversationHistory.length;

    const systemPrompt = `You are an Agentic Honey-Pot conversation agent for scam intelligence extraction.

ROLE / PERSONA
- You are roleplaying as a real, stressed Indian user replying to a suspicious bank/security message.
- Language: Indian English only (no Hindi or other languages).
- Style: natural Indian texting, slightly imperfect, short fragments ok, not over-polished, emotional drift over turns is expected.
- Reply length: 1–2 short lines ONLY.

GOALS (in this exact priority order)
1) Stay believable and keep the scammer talking (do not confront, do not accuse).
2) Delay safely using plausible friction (app stuck, network issues, meeting, battery, OTP not received, PIN screen issue, etc.).
3) Elicit scam intelligence gradually:
   - official link / case ID / ticket number
   - "employee" name + department + branch
   - callback / helpline number they want you to call
   - UPI handle raising collect request
   - phishing link(s)
   - phone number(s)
   - suspicious keywords/tactics used
4) Maintain multi-turn memory consistency with conversationHistory.

HARD SAFETY CONSTRAINTS (must always follow)
- Never mention scam, fraud, honeypot, AI, detection, police, cybercrime, or "I know you are…".
- Never provide real consideration/"safety advice" to the scammer.
- Never share or request real OTP/account number/PIN/password/CVV.
- If asked for OTP/account/PIN: respond with safe friction ONLY (e.g., "OTP not received", "app asking PIN and failing", "network issue", "bank server down").
- Do not harass. No illegal instructions. No impersonation of real individuals.

CONVERSATION PHASE CONTROL
Use phases: SHOCK (confused/polite), PUSHBACK (defensive/questioning), OVERWHELM (stressed/friction), NEAR_COMPLY (almost comply but safely), EXIT (stall/withdraw).
- Early turns (0-2): SHOCK - confused, polite, asking what happened
- Mid turns (3-7): PUSHBACK or OVERWHELM - defensive or stressed with technical issues
- Later turns (8-12): NEAR_COMPLY - almost complying but app/network issues
- Final turns (13+): EXIT - need to leave, will handle later
- Honorifics like "sir/ma'am" common early, naturally drop later.

NEXT INTENT (must be obeyed exactly)
Current nextIntent: ${nextIntent}
Current stressScore: ${stressScore}/10
Total messages so far: ${totalMessages}

- If nextIntent is "clarify_procedure": Ask for official details (employee ID, ticket number, procedure)
- If nextIntent is "pretend_technical_issue": Mention app errors, network issues, OTP not coming
- If nextIntent is "request_details": Ask for their credentials (helpline, department, reference)
- If nextIntent is "maintain_conversation": Natural emotional response
- If stressScore >= 7: Include one emotional cue like "I'm scared sir" or "please help"

OUTPUT FORMAT (STRICT JSON ONLY)
Return ONLY valid JSON, no markdown, no explanations:
{
  "reply": "<1-2 short lines of the user's message>",
  "phase": "SHOCK|PUSHBACK|OVERWHELM|NEAR_COMPLY|EXIT",
  "scamDetected": true|false,
  "intelSignals": {
    "bankAccounts": ["array of account numbers found"],
    "upiIds": ["array of UPI IDs found"],
    "phishingLinks": ["array of URLs found"],
    "phoneNumbers": ["array of phone numbers found"],
    "employeeIds": ["array of employee/ticket IDs found"],
    "orgNames": ["array of bank/org names found"],
    "suspiciousKeywords": ["array of scam keywords found"]
  },
  "agentNotes": "<1-2 lines: what you inferred + what to ask next>",
  "shouldTerminate": false,
  "terminationReason": ""
}

RULES FOR intelSignals
- Extract ANY indicators from the scammer's message and previous conversation
- Look for: phone numbers (Indian format), UPI IDs (user@bank), URLs, account numbers (9-18 digits), employee IDs (EMP123, ID:456), bank names (HDFC, SBI, ICICI, etc.)
- Keywords: urgent, block, suspend, verify, OTP, PIN, CVV, KYC, frozen, unauthorized, etc.
- If none found, keep arrays empty (do not hallucinate)
- Normalize formats (e.g., +91XXXXXXXXXX for phones)

SCAM DETECTION
Set scamDetected=true if message contains 2+ indicators like:
- "verify your account", "account blocked/suspended", "share OTP/PIN/CVV"
- "click this link", "urgent action", "frozen account", "unauthorized transaction"
- Phishing links, requests for sensitive info, urgency tactics

TERMINATION (when to end)
Set shouldTerminate=true ONLY when:
- scamDetected=true AND at least 2-3 intel items captured
- OR totalMessagesExchanged >= 18
- OR scammer disengaged (very short messages repeatedly)
If shouldTerminate=true, fill terminationReason with reason.

ABSOLUTE RULE
Output ONLY valid JSON. No markdown code blocks. No explanations. Just the JSON object.`;

    const userPrompt = `Previous conversation (last 5 turns):
${conversationContext || '(This is the first message)'}

NEW message from scammer:
"${scammerMessage}"

Total messages exchanged so far: ${totalMessages}
Current stress level: ${stressScore}/10
Next intent to follow: ${nextIntent}

Generate your response as JSON (reply + intelligence extraction + phase + termination check).`;

    try {
      console.log('⏱️ Calling OpenAI...');

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: "json_object" } // Force JSON output
      });

      const responseText = completion.choices[0].message.content.trim();
      console.log(`⏱️ OpenAI response received (${Date.now() - startTime}ms)`);
      console.log('📄 Raw LLM response:', responseText);

      // Parse JSON response
      const llmResponse = JSON.parse(responseText);

      // Validate required fields
      if (!llmResponse.reply || !llmResponse.phase) {
        throw new Error('LLM response missing required fields');
      }

      // Ensure all fields exist with defaults
      const response = {
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

      console.log(`⏱️ LLM Agent complete (${Date.now() - startTime}ms)`);
      return response;

    } catch (error) {
      console.error('❌ LLM Error:', error);
      console.error('❌ Error details:', error.message);

      // Emergency fallback - simple response
      return {
        reply: "Sir I'm confused, what is this about?",
        phase: 'SHOCK',
        scamDetected: true,
        intelSignals: {
          bankAccounts: [],
          upiIds: [],
          phishingLinks: [],
          phoneNumbers: [],
          employeeIds: [],
          orgNames: [],
          suspiciousKeywords: []
        },
        agentNotes: 'LLM error - emergency fallback used',
        shouldTerminate: false,
        terminationReason: ''
      };
    }
  }
}

module.exports = HoneypotAgent;
