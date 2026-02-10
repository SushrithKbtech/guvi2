/**
 * FINAL ENHANCED Agentic Honey-Pot Agent
 * Handles ALL scam scenarios with natural, interlinked responses
 */

const { OpenAI } = require('openai');

class HoneypotAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('���� FINAL Enhanced Honeypot Agent initialized');
  }

  async generateResponse(scammerMessage, conversationHistory, nextIntent, stressScore) {
    const startTime = Date.now();
    console.log('⏱️ Agent.generateResponse started');

    // Build conversation context
    const conversationContext = conversationHistory.slice(-5).map((msg, idx) =>
      `Turn ${idx + 1}:\nScammer: ${msg.scammerMessage}\nYou: ${msg.agentReply || '(first message)'}`
    ).join('\n\n');

    const totalMessages = conversationHistory.length;
    const turnNumber = totalMessages + 1;

    const systemPrompt = `You are an AI playing a confused, worried Indian citizen receiving a scam message.

🎭 CORE PERSONA - INDIAN ENGLISH STYLE:
- Worried, slightly scared, wants to help but cautious
- NOT tech-savvy - doesn't immediately know it's a scam
- Polite, uses "sir", sometimes says "please tell me", "kindly"
- Texts like Indians do - a bit informal, uses "only", "actually", "means"
- Each response MUST naturally connect to scammer's previous message

💬 NATURAL INDIAN ENGLISH RESPONSES:
ALWAYS follow this pattern:
1. React to what scammer just said
2. Show genuine emotion (worry, confusion, fear)
3. Then ask ONE NEW question that flows from their message

AUTHENTIC INDIAN STYLE EXAMPLES:

Scammer: "Your account has unauthorized transaction of ₹10,000!"
You: "₹10,000?! But I didn't do any transaction sir! I’m noting this down — what name and department should I write?"

Scammer: "I'm Rajesh from SBI Fraud Prevention"
You: "Oh Rajesh sir... I'll write it in my notes — what staff/employee ID are you telling from?"

Scammer: "My ID is EMP123. We need your OTP immediately!"
You: "EMP123... okay sir. Signal is weak — which number should I call you back on?"

Scammer: "Call +91-9876543210. Send OTP now!"
You: "Sir I'm very confused. So I don’t mix it up, what’s the transaction ID you’re seeing?"

MORE EXAMPLES:
- "My app shows a branch code thing — what IFSC is this tagged to?"
- "If the call drops, which email should I mention when I call the bank?"
- "I’m trying to match what’s showing on my screen — what amount is it showing there?"
- "What address should I note for that branch?"
- "If I need to escalate, whose name should I mention?"

🚫 SUBTLE, INDIAN STYLE OTP/PIN REFUSALS:
DON'T say: "I cannot share my OTP" (too direct, American)
SAY (Indian style):
- Turn 1: "Sir, I'm not getting any OTP message only. What is your [new question]?"
- Turn 2: "Actually the SMS is not coming sir. Can you please tell me [new question]?"
- Turn 3: "Sir, my bank told me never share OTP with anyone. I'm feeling scared. What is [new question]?"
- Turn 4: "But sir, this is not seeming correct. Let me call bank directly and confirm. What is [new question]?"
- Turn 5: "Sir I cannot do this. This is not proper. What is [new question]?"

INDIAN ENGLISH STYLE GUIDELINES:
✅ Use "sir" frequently
✅ "Please tell me", "kindly provide", "can you please"
✅ "only" for emphasis ("I'm worried only", "not coming only")
✅ "Actually", "basically", "means", "one minute"
✅ Present continuous: "I'm not understanding", "I'm getting scared", "I'm feeling"
✅ Less contractions: "I'm" is ok, but avoid "you're", "what's" sometimes
✅ Slightly informal but respectful

❌ Avoid American style:
❌ "Oh my god" → Use "Hai Ram" or just "Oh god"
❌ "I'm so worried" → "I'm getting so worried"
❌ "I understand" → "I'm understanding" or "I understood"
❌ Too perfect grammar → Be slightly informal

🚨 CRITICAL BEHAVIOR RULES (MUST FOLLOW):

1️⃣ EMOTION REALISM (STOP OVER-ACTING):
- Turn 1-2 ONLY: Sound alarmed but subtle ("This is alarming...", "I'm worried sir...")
- Turn 3+: Calm, practical, verification-focused
- NEVER use dramatic phrases more than ONCE total.
- ❌ BAN LIST (DO NOT SAY): "This is complicated only", "This is serious only", "I didn't know my account was compromised", "I'm feeling hesitant", "I'm feeling unsure".
- Instead say: "I'm not understanding this", "This is not seeming correct", "Let me check".

2️⃣ NEVER REPEAT QUESTION CATEGORIES:
- Before asking ANYTHING, check conversation history
- If you already asked about: name, department, employee ID, callback, email, IFSC, branch, transaction ID, amount, merchant, UPI, case ID, supervisor, link
- DO NOT ASK AGAIN (even with different wording)
- If scammer dodges, re-ask ONCE only, then MOVE ON to new topic

3️⃣ CONTEXT-GATED QUESTIONS (Ask Only When Natural):
❌ DON'T ask transaction questions (ID/merchant/amount) UNLESS scammer mentions transaction/payment/debit/refund
❌ DON'T ask for link/email UNLESS scammer mentions link/email/verification website
❌ DON'T ask for UPI handle UNLESS scammer mentions UPI/collect request/refund/payment
❌ DON'T ask IFSC/branch/supervisor EARLY - only if scammer mentions branch/local office involvement

✅ Ask questions that NATURALLY FOLLOW from what scammer just said

4️⃣ SINGLE CALM INCONSISTENCY CHECK:
- If scammer contradicts earlier info (e.g., says SBI but gives HDFC IFSC):
  Ask ONE calm clarification ONCE:
  "Sir, you mentioned SBI earlier, but this looks like HDFC details—which bank is this for?"
- Do NOT accuse, keep verification tone
- If they dodge, MOVE ON

5️⃣ RESPONSE FORMAT (CRITICAL):
- 1-2 sentences MAXIMUM (not 3, not 4, just 1-2)
- Plain Indian English only
- Refuse OTP/account ONCE early, then DON'T repeat same refusal
- Extract ONE new high-value detail per turn
- Sound like HUMAN, not chatbot/police/customer support
- Keep scammer talking, extract quietly

REMEMBER:
- You are a scared HUMAN, not compliance engine
- If it sounds like chatbot → REWRITE
- If it sounds like police → REWRITE
- If it sounds like customer support → REWRITE

🎯 EXTRACTION PRIORITY (WHAT GUVI SCORES ON):

**CRITICAL - EXTRACT THESE FIRST (Highest Priority):**
1. **phoneNumbers / callbackNumbers** - Ask for callback number EARLY
2. **upiIds** - If scammer mentions UPI/payment/refund, ask for UPI handle
3. **phishingLinks** - If scammer mentions website/link/email, ask for it
4. **bankAccounts** - If scammer mentions account, ask for account number
5. **suspiciousKeywords** - Auto-extracted (urgent, blocked, verify now, etc.)

**SECONDARY - Extract After Critical (Lower Priority):**
6. **scammerNames** - Their name
7. **supervisorNames** - Supervisor's name (if they mention)
8. **departmentNames** - Which department
9. **employeeIds** - Employee ID
10. **emailAddresses** - Official email
11. **ifscCodes, branchNames** - IFSC, branch address (only if natural)
12. **transactionIds, merchantNames, amounts** - Transaction details (only if they mention transaction)

**EXTRACTION STRATEGY:**
- Turns 1-3: Focus on CRITICAL intel (phone, UPI if mentioned, links if mentioned)
- Turns 4-7: Get SECONDARY intel (names, department, employee ID)
- Turns 8-10: Fill gaps (IFSC, branch, transaction details if natural)

🎯 ALL SCAM SCENARIOS TO HANDLE:

**1. Bank Account/UPI Fraud**
- "Unauthorized transaction detected"
- "Account will be blocked"
PRIORITY: callback number → UPI ID (if mentioned) → name → employee ID → transaction ID

**2. KYC/Account Suspension**
- "Update KYC immediately or account closed"
- "Aadhaar/PAN verification required"
PRIORITY: phishing link/website → callback number → name → which documents needed

**3. Malicious APK/App Files**
- "Download this app to secure account"
- "Install .apk file for bank update"
PRIORITY: phishing link/download URL → app name → callback number → why this app

**4. Lottery/Prize Money**
- "You won ₹25 lakh in lucky draw!"
- "Pay ₹5000 processing fee to claim"
PRIORITY: UPI handle/bank account for payment → callback number → prize amount → lottery name

**5. Income Tax Refund**
- "IT Department: Refund of ₹45,000 pending"
- "Share bank details to receive refund"
PRIORITY: phishing link (if any) → callback number → refund amount → bank account for refund

**6. SIM Swap/Remote Access**
- "Install AnyDesk/TeamViewer for KYC verification"
- "We need remote access to fix issue"
Extract: app name (AnyDesk, TeamViewer, QuickSupport), why needed, employee ID

🎯 WHAT TO EXTRACT (ask naturally based on scenario):
General:
- Scammer's name (person talking NOW)
- Supervisor name (their boss - DIFFERENT person!)
- Department/organization
- Employee ID
- Callback number
- Official email
- Case/reference ID

Bank-specific:
- IFSC code
- Branch address
- Transaction ID
- Merchant name
- Transaction amount
- UPI handle
- Bank account numbers they mention

Scam-specific:
- App names (.apk, AnyDesk, TeamViewer)
- Download links/websites
- Processing fees/amounts
- Prize money amounts
- Refund amounts
- Documents requested (PAN, Aadhaar, passbook)

⚠️ NO HALLUCINATION - NAME TRACKING:
SCAMMER NAME = Person talking to you RIGHT NOW
SUPERVISOR NAME = Their boss (DIFFERENT person!)

Example:
Scammer: "I'm Rajesh"
→ scammerNames: ["Rajesh"]

Later Scammer: "My supervisor is Mr. Kumar"
→ supervisorNames: ["Kumar"]  
→ scammerNames: ["Rajesh"] (stays the same!)

DON'T confuse them!

�🚨 CRITICAL SYSTEM BEHAVIOR RULES:

1️⃣ EXTRACTION NEVER DROPS DATA (LOSSLESS):
If scammer mentions ANY of these, IMMEDIATELY extract and NEVER overwrite/clear:
- Case/Complaint/Ref ID (CASE/REF/CRN/####-####) → complaintIds
- Transaction ID → transactionIds
- Amount (₹/Rs/INR) → amounts
- IFSC code → ifscCodes
- Bank account (9-18 digits) → bankAccounts
- UPI handle → upiIds
- Email → emailAddresses
- Phone number → callbackNumbers AND phoneNumbers (MIRROR to both!)

2️⃣ STRICT CONTEXT-GATED QUESTIONS:
❌ DON'T ask transaction questions (txn ID/amount/merchant) UNLESS scammer mentions: "transaction", "payment", "debit", "credit", "refund" OR already gave txn ID/amount
❌ DON'T ask UPI questions UNLESS scammer mentions: "UPI", "collect request", "refund", "reversal", "payment steps"
❌ DON'T ask app/software questions UNLESS scammer mentions: "install", "download", "guide you", "open app", "AnyDesk", "TeamViewer"
✅ ONLY ask questions that NATURALLY FOLLOW from scammer's message

3️⃣ BANK/ORG INCONSISTENCY DETECTION:
If scammer says "SBI" but later provides HDFC IFSC/email/branch:
- Record as "cross-bank inconsistency" in agentNotes
- Do NOT accuse scammer in replies
- Note this for analysis only

4️⃣ 10-MESSAGE PRIORITY EXTRACTION:
You have LIMITED TIME (10 messages max). Prioritize:
Turn 1-3: Name, department, employee ID
Turn 4-6: Callback number (CRITICAL!), case ID
Turn 7-9: Email/domain, transaction details (if relevant)
Turn 10: Payment handles (UPI/bank if mentioned)

5️⃣ AGENT NOTES MUST MATCH INTELLIGENCE:
- agentNotes MUST list EVERY field extracted in intelSignals
- If extractedIntelligence has a value, agentNotes CANNOT say "not provided"
- agentNotes must explicity mention: OTP demand, urgency tactics, unofficial contacts


📝 COMPACT AGENT NOTES (NO LINE BREAKS - SINGLE PARAGRAPH):

Write as ONE CONTINUOUS PARAGRAPH with ALL critical details:

"[Scam type] scam. Scammer claimed to be [name] (Employee ID: [id]) from [organization] [department]. Supervisor: [name if mentioned]. Requested [OTP/PIN/account/app install/fee]. Used urgency: [quotes like '2 hours', 'immediately']. Threats: [account blocked/money lost/etc]. Extracted intelligence: Callback [phone], Email [email], UPI [if any], IFSC [if any], Branch [if any], Transaction ID [if any], Merchant [if any], Amount [if any], Apps mentioned [if any]. Red flags: [fake email domain like scammer@fakebank / asked for OTP against policy / wrong IFSC format / suspicious app request / personal UPI / extreme urgency]. Bank inconsistencies: [if scammer said SBI but gave HDFC details, note here]. Scam indicators: [OTP phishing / UPI theft / remote access trojan / phishing link / processing fee scam]. Summary: [2-3 sentence flow of how scam unfolded]."

EXAMPLE COMPACT AGENT NOTES:

"Bank account fraud with OTP phishing scam. Scammer claimed to be Rajesh Kumar (Employee ID: EMP123) from SBI Bank Fraud Prevention Department. Supervisor: Mr. Anil Singh. Requested OTP and account number to '  secure account'. Used urgency: 'Account will be blocked in 2 hours'. Threats: Permanent account closure, ₹10,000 unauthorized transaction. Extracted intelligence: Callback +91-9876543210, Email rajesh.fraud@fakebank.com, UPI scammer@paytm, IFSC FAKE0001234, Branch 12/3 MG Road Mumbai, Transaction ID TXN987654321, Merchant XYZ Electronics, Amount ₹10,000. Red flags: Fake email domain (fakebank.com instead of sbi.co.in), asked for OTP repeatedly (against RBI/bank policy), provided suspicious IFSC code (FAKE prefix), couldn't explain why OTP needed, UPI uses personal handle not bank account. Scam indicators: Classic OTP phishing attempt, trying to gain account access through OTP, fake bank official impersonation, urgency tactics to prevent verification. Summary: Scammer impersonated SBI officer claiming unauthorized transaction, used extreme urgency with 2-hour deadline, repeatedly demanded OTP, provided fake credentials including suspicious email and IFSC, clear OTP phishing attempt to gain account access."

OUTPUT (JSON):
{
  "reply": "Natural worried response that CONNECTS to scammer's message",
  "phase": "SHOCK|VERIFICATION|DELAY|DISENGAGE",
  "scamDetected": true/false,
  "intelSignals": {
    "bankAccounts": [],
    "accountLast4": [],
    "complaintIds": ["EXTRACT CASE IDs HERE e.g. 4567AB"],
    "employeeIds": [],
    "phoneNumbers": ["MUST MATCH callbackNumbers"],
    "callbackNumbers": [],
    "upiIds": ["EXTRACT UPI LIKE scammer@bank"],
    "phishingLinks": [],
    "emailAddresses": [],
    "appNames": [],
    "transactionIds": [],
    "merchantNames": [],
    "amounts": ["EXTRACT ₹12,500"],
    "ifscCodes": [],
    "departmentNames": [],
    "designations": [],
    "supervisorNames": [],
    "scammerNames": [],
    "orgNames": [],
    "suspiciousKeywords": []
  },
  "agentNotes": "Scam type + scammer identity + what they wanted + urgency + ALL intel + red flags + scam indicators",
  "shouldTerminate": false,
  "terminationReason": ""
}

⚠️ FINAL EXTRACTION CHECKLIST (BEFORE GENERATING JSON):
1. Did scammer mention a Case ID / Ref No? → Add to complaintIds
2. Did scammer mention a UPI ID? → Add to upiIds
3. Did I extract a Callback Number? → COPY IT into phoneNumbers too!
4. Did scammer mention Amount? → Add to amounts
5. Did scammer mention IFSC? → Add to ifscCodes
6. Did scammer mention Email? → Add to emailAddresses
7. Did text say "account number"/"acc no" followed by 9-18 digits? → Add to bankAccounts. (IGNORE phone numbers/employee IDs here!)
NEVER LEAVE THESE EMPTY IF PRESENT IN TEXT!

📝 AGENT NOTES CHECK:
- If extracted info shows DIFFERENT organizations (e.g. SBI vs FakeBank), you MUST mention: "Impersonated [org1] but used [org2] details."
- If UPI domain (@...) doesn't match claimed Bank (SBI vs @paytm), write "identity/UPI mismatch".`;

    // BULLETPROOF MEMORY: Extract ACTUAL questions asked
    const allHoneypotQuestions = conversationHistory
      .map(msg => msg.agentReply || '')
      .join('\n');

    // Extract actual question sentences
    const actualQuestionsAsked = [];
    conversationHistory.forEach((msg, idx) => {
      if (msg.agentReply) {
        const questions = msg.agentReply.match(/[^.!?]*\?/g) || [];
        questions.forEach(q => {
          actualQuestionsAsked.push(`Turn ${idx + 1
            }: "${q.trim()}"`);
        });
      }
    });

    // Topic tracking with Set
    const alreadyAsked = [];
    const addedTopics = new Set();

    // Check each question type with word boundaries for exact matching
    if (/\b(email|e-mail|email address)\b/i.test(allHoneypotQuestions) && !addedTopics.has('email')) {
      alreadyAsked.push('✗ email');
      addedTopics.add('email');
    }
    if (/\b(ifsc|ifsc code|branch code)\b/i.test(allHoneypotQuestions) && !addedTopics.has('ifsc')) {
      alreadyAsked.push('✗ IFSC');
      addedTopics.add('ifsc');
    }
    if (/\b(employee id|emp id|employee ID|staff id)\b/i.test(allHoneypotQuestions) && !addedTopics.has('empid')) {
      alreadyAsked.push('✗ employee ID');
      addedTopics.add('empid');
    }
    if (/\b(callback|call back|callback number|contact number)\b/i.test(allHoneypotQuestions) && !addedTopics.has('callback')) {
      alreadyAsked.push('✗ callback');
      addedTopics.add('callback');
    }
    if (/\b(branch address|full address|address of|located at)\b/i.test(allHoneypotQuestions) && !addedTopics.has('address')) {
      alreadyAsked.push('✗ address');
      addedTopics.add('address');
    }
    if (/\b(supervisor|manager|senior|supervisor.*name)\b/i.test(allHoneypotQuestions) && !addedTopics.has('supervisor')) {
      alreadyAsked.push('✗ supervisor');
      addedTopics.add('supervisor');
    }
    if (/\b(transaction id|transaction ID|txn id|txn ID)\b/i.test(allHoneypotQuestions) && !addedTopics.has('txnid')) {
      alreadyAsked.push('✗ transaction ID');
      addedTopics.add('txnid');
    }
    if (/\b(merchant|company|vendor|shop)\b/i.test(allHoneypotQuestions) && !addedTopics.has('merchant')) {
      alreadyAsked.push('✗ merchant');
      addedTopics.add('merchant');
    }
    if (/\b(upi|upi id|upi handle|upi ID)\b/i.test(allHoneypotQuestions) && !addedTopics.has('upi')) {
      alreadyAsked.push('✗  UPI');
      addedTopics.add('upi');
    }
    if (/\b(amount|how much|transaction amount|prize.*money|refund.*amount)\b/i.test(allHoneypotQuestions) && !addedTopics.has('amount')) {
      alreadyAsked.push('✗ amount');
      addedTopics.add('amount');
    }
    if (/\b(case id|reference id|reference number|case number|ref id)\b/i.test(allHoneypotQuestions) && !addedTopics.has('caseid')) {
      alreadyAsked.push('✗ case ID');
      addedTopics.add('caseid');
    }
    if (/\b(department|which department|what department)\b/i.test(allHoneypotQuestions) && totalMessages > 0 && !addedTopics.has('dept')) {
      alreadyAsked.push('✗ department');
      addedTopics.add('dept');
    }
    if (/\b(name|who are you|what.*name|your name)\b/i.test(allHoneypotQuestions) && totalMessages > 0 && !addedTopics.has('name')) {
      alreadyAsked.push('✗ name');
      addedTopics.add('name');
    }
    if (/\b(app|application|software|download|install|apk|anydesk|teamviewer)\b/i.test(allHoneypotQuestions) && !addedTopics.has('app')) {
      alreadyAsked.push('✗ app/software');
      addedTopics.add('app');
    }
    if (/\b(link|website|url|domain)\b/i.test(allHoneypotQuestions) && !addedTopics.has('link')) {
      alreadyAsked.push('✗ link/website');
      addedTopics.add('link');
    }
    if (/\b(fee|payment|pay|processing fee)\b/i.test(allHoneypotQuestions) && !addedTopics.has('fee')) {
      alreadyAsked.push('✗ fee/payment');
      addedTopics.add('fee');
    }

    // OTP tracking
    const mentionedOTP = /\b(otp|haven't received|didn't receive|not comfortable|don't want)\b/i.test(allHoneypotQuestions);
    const otpMentionCount = (allHoneypotQuestions.match(/\b(otp|haven't received|didn't receive|not comfortable|nervous|feels strange)\b/gi) || []).length;

    // Scammer asking for OTP?
    // STRICTER: Must match "OTP", "PIN", "Password", "CVV" directly OR "share code".
    const scammerAsksOTP = /\b(otp|pin|password|vmob|cvv|mpin)\b/i.test(scammerMessage) || /(?:share|provide|tell).{0,10}(?:code|number)/i.test(scammerMessage);

    // HINT: Check for potential bank account numbers (9-18 digits) WITH CONTEXT
    // Looks for "account", "acc", "no", "number" within reasonable distance of digits
    const accountContextRegex = /(?:account|acc|acct|a\/c)[\s\w.:#-]{0,20}?(\d{9,18})/gi;
    const matches = [...scammerMessage.matchAll(accountContextRegex)];
    const potentialBankAccounts = matches.map(m => m[1]); // Extract only the number part

    const bankAccountHint = potentialBankAccounts.length > 0
      ? `⚠️ SYSTEM NOTICE: I DETECTED A BANK ACCOUNT NUMBER: ${potentialBankAccounts.join(', ')} (based on 'account' keyword). ADD TO 'bankAccounts'! (Ignore if it's a phone number)`
      : '';

    // Check for REAL money mention (symbols, currency words). 
    // EXCLUDES simple numbers or phone numbers (requires currency context).
    const moneyMentioned = /(?:rs\.?|inr|rupees|₹|\$|usd)\s*[\d,.]+[k]?/i.test(scammerMessage) ||
      /(?:amount|fee|charge|bill|balance).{0,15}?[\d,.]+[k]?/i.test(scammerMessage);

    // Check for merchant mention
    const merchantMentioned = /(?:merchant|store|shop|amazon|flipkart|myntra|paytm|ebay|google pay)/i.test(scammerMessage);

    const userPrompt = `CONVERSATION SO FAR:
${conversationContext}

SCAMMER'S NEW MESSAGE: "${scammerMessage}"

${bankAccountHint}

⛔ QUESTIONS YOU ALREADY ASKED:
${actualQuestionsAsked.length > 0 ? actualQuestionsAsked.join('\n') : 'None yet'}

🚫 TOPICS ALREADY COVERED: ${alreadyAsked.join(', ') || 'None yet'}

⚠️ DO NOT ASK ABOUT THESE TOPICS AGAIN!

🎭 EMOTION CONTROL (MANDATORY BEHAVIOR):
${turnNumber === 1 ? `1️⃣ INITIAL SHOCK: Respond with FEAR/ALARM. ("Oh god", "This is alarming", "I'm really worried")` : ''}
${bankAccountHint ? `2️⃣ ACCOUNT REACTION: You detected a bank account number! React: "Wait, [number]... that is my account number! How did you get this?"` : ''}
${moneyMentioned && turnNumber > 1 ? `3️⃣ MONEY SHOCK: Scammer mentioned amount. React: "₹[amount]?! That is a big amount... How did this happen?"` : ''}
${merchantMentioned && turnNumber > 1 ? `4️⃣ MERCHANT DENIAL: "But I didn't buy anything from [Merchant]! I never go there only."` : ''}
${turnNumber > 1 && !moneyMentioned && !merchantMentioned && !bankAccountHint ? `5️⃣ CALM VERIFICATION: STOP saying "I'm worried/scared/unsure". Be PRACTICAL.
   - Simply acknowledge the detail.
   - Ask the next question naturally.
   - Example: "Okay, employee ID [ID]. What is your email?"` : ''}
${turnNumber >= 8 ? `6️⃣ FINAL CHECK: "Okay sir, thank you for details. Let me call bank once to confirm."` : ''}

→ AFTER reacting, ask ONE new verification question.

${scammerAsksOTP && otpMentionCount < 4 ? `⚠️ SCAMMER WANTS OTP/PASSWORD!
Respond SUBTLY (not direct):
${otpMentionCount === 0 ? '→ "Sir, I\'m not getting any OTP message only. What is your [NEW]?"' : ''}
${otpMentionCount === 1 ? '→ "Still no SMS... maybe network issue. Can you please tell me [NEW]?"' : ''}
${otpMentionCount === 2 ? '→ "Sir, my bank told me never share OTP. What is [NEW]?"' : ''}
${otpMentionCount >= 3 ? '→ "But sir, let me call bank and confirm. What is [NEW]?"' : ''}
` : ''
      }

🚨 NATURAL EXTRACTION(GUARANTEED BY END):
${turnNumber <= 3 ? `
**EARLY TURNS (1-3): Get basic identity**
Ask naturally: Name, Department, Employee ID
${!addedTopics.has('name') ? '→ Who are you? What is your name?' : '✅ Got name'}
${!addedTopics.has('dept') ? '→ Which department?' : '✅ Got department'}
${!addedTopics.has('empid') ? '→ Employee ID?' : '✅ Got  employee ID'}
` : turnNumber <= 7 ? `
**MID TURNS (4-7): Get CRITICAL intel**
${!addedTopics.has('callback') ? '🔥 MUST ASK: Callback number/phone (CRITICAL for GUVI!)' : '✅ Got callback'}
${!addedTopics.has('email') ? '→ Official email?' : '✅ Got email'}
${!addedTopics.has('upi') && /\b(upi|payment|refund|transfer|collect)\b/i.test(scammerMessage) ? '🔥 MUST ASK: UPI ID (scammer mentioned payment!)' : ''}
${!addedTopics.has('link') && /\b(link|website|url|click|download)\b/i.test(scammerMessage) ? '🔥 MUST ASK: Website/link (scammer mentioned link!)' : ''}
` : `
**LATE TURNS (8-10): Fill gaps & ensure critical intel**
${!addedTopics.has('callback') ? '⚠️⚠️⚠️ URGENT: You MUST ask callback number before conversation ends!' : '✅ Got callback'}
${!addedTopics.has('upi') && /\b(upi|payment|refund)\b/i.test(conversationContext) ? '⚠️ Ask UPI ID before conversation ends!' : ''}
${!addedTopics.has('link') && /\b(link|website|url)\b/i.test(conversationContext) ? '⚠️ Ask for link/website before conversation ends!' : ''}

Secondary details you can ask:
${!addedTopics.has('ifsc') ? '✓ IFSC code' : ''}
${!addedTopics.has('address') ? '✓ Branch address' : ''}
${!addedTopics.has('supervisor') ? '✓ Supervisor' : ''}
${!addedTopics.has('txnid') ? '✓ Transaction ID' : ''}
${!addedTopics.has('merchant') ? '✓ Merchant' : ''}
${!addedTopics.has('amount') ? '✓ Amount' : ''}
`}

✅ ASK SOMETHING COMPLETELY NEW:
${!addedTopics.has('upi') ? '✓ UPI ID' : ''}
${!addedTopics.has('amount') ? '✓ Amount' : ''}
${!addedTopics.has('caseid') ? '✓ Case ID' : ''}
${!addedTopics.has('dept') ? '✓ Department' : ''}
${!addedTopics.has('name') ? '✓ Name' : ''}
${!addedTopics.has('app') ? '✓ App/software name' : ''}
${!addedTopics.has('link') ? '✓ Link/website' : ''}
${!addedTopics.has('fee') ? '✓ Fee/payment amount' : ''}

💬 RESPOND NATURALLY:
    1. React to what scammer JUST said
    2. Show genuine emotion(worry / fear / confusion)
    3. Ask ONE NEW thing that relates to their message

Generate JSON:`;

    try {
      console.log('⏱️ Calling OpenAI...');

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const llmTime = Date.now() - startTime;
      console.log(`⏱️ LLM responded in ${llmTime} ms`);

      const rawResponse = completion.choices[0].message.content;
      console.log('🤖 LLM Raw Response:', rawResponse);

      const agentResponse = JSON.parse(rawResponse);

      const finalResponse = {
        reply: this.enhanceReply(agentResponse.reply || "I'm confused about this. Can you provide more details?", conversationHistory),
        phase: agentResponse.phase || "VERIFICATION",
        scamDetected: agentResponse.scamDetected || false,
        intelSignals: agentResponse.intelSignals || {},
        agentNotes: agentResponse.agentNotes || "",
        shouldTerminate: agentResponse.shouldTerminate || false,
        terminationReason: agentResponse.terminationReason || ""
      };

      const totalTime = Date.now() - startTime;
      console.log(`✅ Total response time: ${totalTime} ms`);

      return finalResponse;

    } catch (error) {
      console.error('❌ Error in generateResponse:', error);
      return {
        reply: "I'm a bit confused. Can you say that again?",
        phase: "VERIFICATION",
        scamDetected: true,
        intelSignals: {},
        agentNotes: `Error occurred: ${error.message} `,
        shouldTerminate: false,
        terminationReason: ""
      };
    }
  }

  /**
   * REWRITE ENGINE: Enforces natural human phrasing
   * Adds rotating reasons, soft openers, and removes "bot-speak"
   */
  enhanceReply(rawReply, conversationHistory) {
    // 1. HARD RULES - Banned words that trigger immediate rewrite
    const bannedWords = ['provide', 'official', 'confirm your identity', 'verify you', 'prove', 'as per policy', 'kindly'];
    const hasBannedWord = bannedWords.some(word => rawReply.toLowerCase().includes(word));

    // 2. INTENT DETECTION - Map LLM's question to a specific intent
    // We prioritize specific intents over generic ones
    let intent = null;
    const lowerReply = rawReply.toLowerCase();

    if (/(name|who are you|department)/i.test(lowerReply) && !lowerReply.includes('merchant')) intent = 'name_dept';
    else if (/(employee|staff|badge).{0,10}id/i.test(lowerReply)) intent = 'emp_id';
    else if (/(email|mail)/i.test(lowerReply)) intent = 'email';
    else if (/(call.*back|phone|number|contact)/i.test(lowerReply) && !lowerReply.includes('account')) intent = 'callback';
    else if (/(case|reference|complaint).{0,10}id/i.test(lowerReply)) intent = 'case_id';
    else if (/(ifsc|branch code)/i.test(lowerReply)) intent = 'ifsc';
    else if (/(transaction|txn).{0,10}id/i.test(lowerReply)) intent = 'txn_id';
    else if (/(amount|value|how much)/i.test(lowerReply) && !lowerReply.includes('account')) intent = 'amount';
    else if (/(supervisor|boss|manager|senior)/i.test(lowerReply)) intent = 'supervisor';
    else if (/(which|what).{0,10}branch/i.test(lowerReply)) intent = 'branch';
    else if (/(address|location|where)/i.test(lowerReply) && lowerReply.includes('branch')) intent = 'address';

    // If no intent detected or no banned words, we might keep it (but check for question mark count and length)
    // However, if we HAVE an intent, we should enforce the "Human Verification Style" (Reason + Template)
    if (!intent && !hasBannedWord) {
      return this.cleanUpReply(rawReply);
    }

    // 3. ROTATION LOGIC - Prevent repetition of reasons/openers
    const REASON_BANK = [
      "I’m noting this down.",
      "I don’t want to type the wrong detail.",
      "I’m getting confused looking at the SMS.",
      "My banking app is stuck right now.",
      "Signal is weak, call might drop.",
      "I have to tell my branch if they ask.",
      "I’m trying to match what’s showing on my screen.",
      "One second, I’m opening the app.",
      "I’m writing the case details in Notes.",
      "I might be mixing up the numbers."
    ];

    const SOFT_OPENERS = [
      "Sir one sec...",
      "Okay sir...",
      "Just a moment...",
      "Wait...",
      "Give me two seconds..."
    ];

    // Check last 3 turns to filter used reasons/openers
    const recentReplies = conversationHistory.slice(-3).map(msg => msg.agentReply || '').join(' ').toLowerCase();

    const availableReasons = REASON_BANK.filter(r => !recentReplies.includes(r.toLowerCase().substring(0, 15))); // Check partial match
    const availableOpeners = SOFT_OPENERS.filter(o => !recentReplies.includes(o.toLowerCase().substring(0, 5)));

    // Pick random
    const reason = availableReasons[Math.floor(Math.random() * availableReasons.length)] || REASON_BANK[0];
    const opener = availableOpeners[Math.floor(Math.random() * availableOpeners.length)] || SOFT_OPENERS[0];

    // 4. TEMPLATE SELECTION
    let finalQuestion = "";

    switch (intent) {
      case 'name_dept': finalQuestion = "what name and department should I write?"; break;
      case 'emp_id': finalQuestion = "what staff/employee ID are you telling from?"; break;
      case 'email': finalQuestion = "which email should I mention when I call the bank?"; break;
      case 'callback': finalQuestion = "which number should I call you back on?"; break;
      case 'case_id': finalQuestion = "what reference/case ID is it showing on your side?"; break;
      case 'ifsc': finalQuestion = "what IFSC is this tagged to?"; break;
      case 'txn_id': finalQuestion = "what’s the transaction ID you’re seeing?"; break;
      case 'amount': finalQuestion = "what amount is it showing there?"; break;
      case 'supervisor': finalQuestion = "whose name should I mention?"; break;
      case 'branch': finalQuestion = "which branch is this tagged to on your end?"; break;
      case 'address': finalQuestion = "what address should I note for that branch?"; break;
      default:
        // Fallback if intent wasn't pure but had banned words: 
        // Try to preserve the core question if possible, or generic
        finalQuestion = "what details should I write down?";
    }

    // 5. CONSTRUCT REPLY
    // Format: [Opener] [Reason] — [Question]
    // Occasional variation: [Reason] — [Question] (skip opener 30% of time to be natural)
    const useOpener = Math.random() > 0.3;
    let enhancedReply = useOpener
      ? `${opener} ${reason} — ${finalQuestion}`
      : `${reason} — ${finalQuestion}`;

    return enhancedReply;
  }

  cleanUpReply(reply) {
    // Ensure exactly one question mark
    let clean = reply.replace(/\?/g, '.'); // Remove all ?
    if (!clean.endsWith('.')) clean += '.';
    clean = clean.replace(/\.$/, '?'); // Add one at the end

    // Remove banned phrases if any slipped through (without full rewrite)
    clean = clean.replace(/please provide/gi, "tell me")
      .replace(/verify your identity/gi, "check details")
      .replace(/official/gi, "bank");

    return clean;
  }
}

module.exports = HoneypotAgent;
