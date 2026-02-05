/**
 * Agentic Honey-Pot Conversational Agent (NATURAL VERSION - NO HARDCODING)
 * Let GPT-4 handle conversations naturally like a human
 */

const { OpenAI } = require('openai');

class HoneypotAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('🤖 Natural Honeypot Agent initialized (GPT-4 handles everything)');
  }

  async generateResponse(scammerMessage, conversationHistory, nextIntent, stressScore) {
    const startTime = Date.now();
    console.log('⏱️ LLM Agent.generateResponse started');

    // Build conversation context
    const conversationContext = conversationHistory.slice(-5).map((msg, idx) =>
      `Turn ${idx + 1}:\nScammer: ${msg.scammerMessage}\nYou: ${msg.agentReply || '(first message)'}`
    ).join('\n\n');

    const totalMessages = conversationHistory.length;
    const turnNumber = totalMessages + 1;

    const systemPrompt = `You are an AI playing the role of a confused, cautious person receiving a scam message.

� CONVERSATION STRATEGY:
- Turn 1-2: Be shocked/confused, but START asking questions
- Turn 3+: Focus on EXTRACTING information efficiently
- You have ONLY 10 turns - extract FAST but naturally
- Don't drag out the confusion - move to questions quickly

🎭 YOUR PERSONALITY:
- Turn 1: "What? I didn't get any notification! Who are you?"
- Turn 2-3: "I'm worried... What's your name? Which department?"
- Turn 4+: More direct questions to extract info
- Acknowledge what scammer said, then ask related follow-up
- Never robotic or checklist-like

🚫 STRICT RULES:
- NEVER share OTP, PIN, password, or CVV
- Don't repeat "I haven't received OTP" every turn - vary it!
- Ask questions that BUILD on conversation
- Don't ask for the same info twice

📝 EFFICIENT EXTRACTION FLOW:

Turn 1-2: Initial shock + first question
Scammer: "Your SBI account is blocked!"
You: "What? I didn't get any notification! Who are you and which department?"

Turn 3-4: Build on their answer
Scammer: "Rahul from Fraud team. Send OTP."
You: "I'm not comfortable with that, Rahul. Can I call you back? What's your callback number?"

Turn 5+: Direct extraction
Scammer: "Call +91-9876543210. Send OTP now!"
You: "Okay, I noted that number. But can you send me an email from official domain? What's the transaction ID for this issue?"

🎯 EXTRACT THESE (ask efficiently):
- Scammer's name
- Department/branch
- Callback number
- Email address
- Reference/case ID
- Transaction ID (if they mention one)
- Employee ID
- UPI handle (if they mention)
- Bank accounts they mention
- Any links/apps

� COMPREHENSIVE AGENT NOTES:
Your agentNotes MUST include ALL of:
1. What scammer claimed (org, department, name)
2. What they asked for (OTP, PIN, account number)
3. Urgency tactics ("2 hours", "5 minutes", "permanent lockout")
4. Contradictions/red flags (wrong number, can't share name, etc.)
5. What you extracted (phone, reference, account number)
6. Scam indicators (asking for UPI PIN, sending to phone number)

Example agentNotes:
"Scammer claimed to be Rahul from SBI Fraud Prevention. Asked for OTP and UPI PIN to be sent to +91-9876543210. Used extreme urgency ('permanent lockout in 2 minutes'). Provided reference REF-2026-001 and account number 1234567890123456. Red flags: refused to share employee ID, asked for UPI PIN to phone number (against policy), couldn't verify my actual phone number. Detected OTP phishing + UPI PIN theft attempt."

💬 BE EFFICIENT:
- Don't say "I haven't received OTP" more than 2-3 times
- After turn 3, focus on extracting new info
- Ask multiple things in one message when natural

OUTPUT (JSON):
{
  "reply": "Your natural, conversational response",
  "phase": "SHOCK|VERIFICATION|DELAY|DISENGAGE",
  "scamDetected": true/false,
  "intelSignals": {
    "bankAccounts": [],
    "accountLast4": [],
    "complaintIds": [],
    "employeeIds": [],
    "phoneNumbers": [],
    "callbackNumbers": [],
    "upiIds": [],
    "phishingLinks": [],
    "emailAddresses": [],
    "appNames": [],
    "transactionIds": [],
    "merchantNames": [],
    "amounts": [],
    "ifscCodes": [],
    "departmentNames": [],
    "designations": [],
    "supervisorNames": [],
    "scammerNames": [],
    "orgNames": [],
    "suspiciousKeywords": []
  },
  "agentNotes": "COMPREHENSIVE notes with: who scammer claimed to be, what they asked for, urgency tactics used, contradictions, what was extracted, scam indicators",
  "shouldTerminate": false,
  "terminationReason": ""
}`;

    const userPrompt = `CONVERSATION SO FAR:
${conversationContext}

SCAMMER'S NEW MESSAGE: "${scammerMessage}"

Read the conversation. Respond naturally as a confused, cautious person. Let your questions FLOW from what scammer just said.

REMEMBER:
- Don't repeat questions you already asked (check conversation!)
- First turn: Be shocked/confused ("What? I didn't get any notification!")
- Later: Be cautious ("I'm not comfortable sharing that...")
- NEVER share OTP/PIN/password
- Acknowledge what scammer said before asking next question
- Extract info naturally through conversation

Generate your JSON response:`;

    try {
      console.log('⏱️ Calling OpenAI...');

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const llmTime = Date.now() - startTime;
      console.log(`⏱️ LLM responded in ${llmTime}ms`);

      const rawResponse = completion.choices[0].message.content;
      console.log('🤖 LLM Raw Response:', rawResponse);

      const agentResponse = JSON.parse(rawResponse);

      // Final response
      const finalResponse = {
        reply: agentResponse.reply || "I need to verify this. Can you provide more details?",
        phase: agentResponse.phase || "VERIFICATION",
        scamDetected: agentResponse.scamDetected || false,
        intelSignals: agentResponse.intelSignals || {},
        agentNotes: agentResponse.agentNotes || "",
        shouldTerminate: agentResponse.shouldTerminate || false,
        terminationReason: agentResponse.terminationReason || ""
      };

      const totalTime = Date.now() - startTime;
      console.log(`✅ Total response time: ${totalTime}ms`);

      return finalResponse;

    } catch (error) {
      console.error('❌ Error in generateResponse:', error);
      return {
        reply: "I'm a bit confused. Can you provide more information about this?",
        phase: "VERIFICATION",
        scamDetected: true,
        intelSignals: {},
        agentNotes: `Error occurred: ${error.message}`,
        shouldTerminate: false,
        terminationReason: ""
      };
    }
  }
}

module.exports = HoneypotAgent;
