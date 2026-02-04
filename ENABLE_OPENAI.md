# 🤖 ENABLE OPENAI CHATGPT - STEP BY STEP

## ✅ **YOU HAVE AN OPENAI API KEY!**

Great! Here's how to enable ChatGPT mode for smarter responses.

---

## 📝 **STEP 1: Update `.env` File**

Open your `.env` file and change it to:

```bash
PORT=3000
API_KEY=honeypot-guvi-2026-secure-key
NODE_ENV=development
OPENAI_API_KEY=YOUR-ACTUAL-OPENAI-KEY-HERE
USE_OPENAI=true
```

**Replace `YOUR-ACTUAL-OPENAI-KEY-HERE` with your real OpenAI key!**

Your OpenAI key looks like:
- `sk-proj-abc123...` (newer format)
- OR `sk-abc123...` (older format)

### **Example:**
```bash
PORT=3000
API_KEY=honeypot-guvi-2026-secure-key
NODE_ENV=development
OPENAI_API_KEY=sk-proj-a1b2c3d4e5f6g7h8i9j0
USE_OPENAI=true
```

---

## 🔄 **STEP 2: Restart Server**

After saving `.env`:

1. **Stop current server:** Press `Ctrl+C` in the terminal
2. **Start again:** Run `npm start`

You should see:
```
🤖 OpenAI ChatGPT enabled for intelligent responses
```

If you see `📝 Using template-based responses` instead, OpenAI is NOT enabled (check your `.env` again).

---

## 🧪 **STEP 3: Test ChatGPT Mode**

Test with PowerShell:

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "honeypot-guvi-2026-secure-key"
}

$body = @{
    scammerMessage = "Your HDFC account is frozen. Share your OTP to unblock it immediately!"
    stressScore = 8
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/conversation" `
  -Method Post -Headers $headers -Body $body | ConvertTo-Json
```

**With ChatGPT enabled, you'll get more natural responses like:**
```
"Oh god sir, my account is frozen? But I never got any message from HDFC bank. 
Sir are you sure this is official helpline?"
```

**vs Template mode:**
```
"What happened sir? Sir what is the procedure?"
```

---

## 🚀 **STEP 4: Deploy to Railway with OpenAI**

When deploying to Railway, add **4 environment variables** (instead of 3):

```
Variable 1:
Name:  API_KEY
Value: honeypot-guvi-2026-secure-key

Variable 2:
Name:  NODE_ENV
Value: production

Variable 3:
Name:  OPENAI_API_KEY
Value: YOUR-ACTUAL-OPENAI-KEY

Variable 4:
Name:  USE_OPENAI
Value: true
```

---

## 💰 **Cost:**

**With your OpenAI key:**
- Model: GPT-4o-mini (fast & cheap)
- Cost: ~$0.0001 per conversation turn
- Example: 1000 messages = $0.10
- **For hackathon:** Even with 100 test conversations = ~$0.01-$0.02

Very cheap! 💸

---

## 🔍 **How to Tell Which Mode is Running:**

Check the console when server starts:

**ChatGPT Mode:**
```
🤖 OpenAI ChatGPT enabled for intelligent responses
🍯 Agentic Honey-Pot API running on port 3000
```

**Template Mode:**
```
📝 Using template-based responses (OpenAI disabled)
🍯 Agentic Honey-Pot API running on port 3000
```

---

## ⚠️ **Troubleshooting:**

### **Error: "OpenAI API key not found"**
- **Fix:** Check `.env` has `OPENAI_API_KEY=sk-...` (no quotes)

### **Error: "Incorrect API key"**
- **Fix:** Verify your OpenAI key at https://platform.openai.com/api-keys

### **Error: "Insufficient credits"**
- **Fix:** Add billing at https://platform.openai.com/account/billing

### **Still using template mode?**
- **Check:** `USE_OPENAI=true` (not `false`)
- **Check:** OpenAI key is valid
- **Restart:** Server after changing `.env`

---

## ✅ **CHECKLIST:**

**Local (with OpenAI):**
- [ ] `.env` has `OPENAI_API_KEY=sk-...`
- [ ] `.env` has `USE_OPENAI=true`
- [ ] Server restarted
- [ ] Console shows: "🤖 OpenAI ChatGPT enabled"
- [ ] Test conversation works
- [ ] Responses look natural and unique

**Railway (with OpenAI):**
- [ ] 4 environment variables set (including OPENAI_API_KEY and USE_OPENAI=true)
- [ ] Deployed successfully
- [ ] Logs show: "🤖 OpenAI ChatGPT enabled"

---

## 🎯 **COMPARISON:**

| Feature | Template Mode | ChatGPT Mode |
|---------|---------------|--------------|
| **Cost** | Free | ~$0.0001/msg |
| **Speed** | Instant | 1-2 sec |
| **Quality** | Good | Excellent |
| **Setup** | None | Need API key |
| **Responses** | Pre-written | AI-generated |
| **Hackathon** | ✅ Perfect | ⭐ Even Better |

---

## 💡 **RECOMMENDATION:**

**If you have an OpenAI key:**
- ✅ Use ChatGPT mode for **better quality**
- ✅ More believable responses
- ✅ Worth the minimal cost for hackathon demo

**If you don't have one or want to save money:**
- ✅ Template mode is **completely fine**
- ✅ Free and works great
- ✅ Good enough for hackathon submission

**Both modes work perfectly with GUVI!** 🎉

---

## 📋 **QUICK REFERENCE:**

**Enable ChatGPT:**
```bash
# In .env:
OPENAI_API_KEY=sk-proj-your-key
USE_OPENAI=true
```

**Disable ChatGPT (use templates):**
```bash
# In .env:
USE_OPENAI=false
```

---

**Ready to enable ChatGPT? Just update your `.env` file and restart! 🚀**
