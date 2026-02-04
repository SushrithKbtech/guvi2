# 🚀 RAILWAY DEPLOYMENT - FINAL STEPS

## ✅ **What's Ready:**

- ✅ Code pushed to GitHub: `https://github.com/SushrithKbtech/guvi2.git`
- ✅ OpenAI integration added (optional, currently disabled)
- ✅ Template-based responses working (free mode)
- ✅ API tested locally and working
- ✅ Server running on port 3000

---

## 🎯 **YOUR API KEY (IMPORTANT!):**

**API Key:** `honeypot-guvi-2026-secure-key`

You will need this key for:
1. ✅ Testing locally (already set in `.env`)
2. ✅ Railway environment variables (you'll set this)
3. ✅ GUVI platform submission (you'll enter this)

---

## 📋 **DEPLOYMENT STEPS:**

### **STEP 1: Deploy to Railway**

1. **Go to Railway:**
   - Open: https://railway.app/
   - Click **"Login"** → **"Login with GitHub"**

2. **Create New Project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repo: **`SushrithKbtech/guvi2`**

3. **Configure Environment Variables:**
   
   Click **"Variables"** tab and add these 3 variables:
   
   ```
   Variable 1:
   Name:  API_KEY
   Value: honeypot-guvi-2026-secure-key
   
   Variable 2:
   Name:  NODE_ENV
   Value: production
   
   Variable 3:
   Name:  USE_OPENAI
   Value: false
   ```
   
   ⚠️ **MUST SET ALL 3!** Railway won't work without them.

4. **Generate Domain:**
   
   - Go to **"Settings"** tab
   - Scroll to **"Domains"** section
   - Click **"Generate Domain"**
   - Your URL will be like: `https://guvi2-production.up.railway.app`
   - **SAVE THIS URL!** You'll need it for GUVI

5. **Wait for Deployment:**
   
   - Go to **"Deployments"** tab
   - Wait for status: ✅ **"SUCCESS"**
   - Takes ~2-3 minutes

---

### **STEP 2: Test Your Deployed API**

**Health Check:**
```powershell
Invoke-RestMethod -Uri "https://YOUR-RAILWAY-URL.up.railway.app/health"
```

Should return:
```json
{
  "status": "healthy",
  "uptime": 12.5,
  "timestamp": "2026-02-04T..."
}
```

**Test Conversation:**
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "honeypot-guvi-2026-secure-key"
}

$body = @{
    scammerMessage = "Your HDFC account is blocked. Share OTP immediately!"
    stressScore = 7
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://YOUR-RAILWAY-URL.up.railway.app/api/conversation" `
  -Method Post -Headers $headers -Body $body | ConvertTo-Json
```

Should return JSON with agent response!

---

### **STEP 3: Submit to GUVI Platform**

1. **Go to GUVI Hackathon:**
   - Navigate to: Timeline → API Endpoint Submission
   - Click **"Test Honeypot Endpoint"**

2. **Enter Your Details:**
   ```
   x-api-key: honeypot-guvi-2026-secure-key
   
   Honeypot API Endpoint URL:
   https://YOUR-RAILWAY-URL.up.railway.app/api/conversation
   ```
   
   **Example:**
   ```
   x-api-key: honeypot-guvi-2026-secure-key
   
   Honeypot API Endpoint URL:
   https://guvi2-production.up.railway.app/api/conversation
   ```

3. **Click "Test Honeypot Endpoint"**

4. **Verify:**
   - Status should show: ✅ **"Active"**
   - If it shows error, check:
     - Railways environment variables are set
     - URL ends with `/api/conversation`
     - API key matches exactly

---

## 📝 **SUBMISSION DETAILS TO SAVE:**

Once deployed, save these for your records:

```
✅ GitHub Repo: https://github.com/SushrithKbtech/guvi2
✅ Railway URL: https://YOUR-APP.up.railway.app
✅ API Endpoint: https://YOUR-APP.up.railway.app/api/conversation
✅ API Key: honeypot-guvi-2026-secure-key
✅ Health Check: https://YOUR-APP.up.railway.app/health
```

---

## 🔍 **Troubleshooting:**

### **Issue: "Application failed to respond"**
- **Check:** Environment variables are set in Railway
- **Fix:** Go to Variables tab, ensure API_KEY, NODE_ENV, USE_OPENAI are all set

### **Issue: "401 Unauthorized"**
- **Check:** API key matches between Railway and GUVI submission
- **Fix:** Verify `x-api-key: honeypot-guvi-2026-secure-key` exactly

### **Issue: "Build failed"**
- **Check:** Deployment logs in Railway
- **Fix:** Usually auto-fixes on redeploy (click "Redeploy")

### **Issue: "Cannot find module"**
- **Check:** package.json has all dependencies
- **Fix:** Should not happen (we have all deps), but redeploy if it does

---

## 📊 **Expected Response from GUVI Test:**

When GUVI tests your endpoint, it will send something like:

**Request:**
```json
{
  "scammerMessage": "Your account is suspended. Verify now.",
  "stressScore": 5
}
```

**Your API Response:**
```json
{
  "conversationId": "a1b2c3d4-...",
  "reply": "Sir what happened? I don't understand",
  "phase": "SHOCK",
  "scamDetected": true,
  "intelSignals": {
    "bankAccounts": [],
    "upiIds": [],
    "phishingLinks": [],
    "phoneNumbers": [],
    "employeeIds": [],
    "orgNames": [],
    "suspiciousKeywords": ["suspended", "verify"]
  },
  "agentNotes": "Phase: SHOCK. Maintained conversation flow.",
  "shouldTerminate": false,
  "terminationReason": ""
}
```

This is EXACTLY what GUVI expects! ✅

---

## ✅ **FINAL CHECKLIST:**

Before submitting to GUVI, verify:

- [ ] Code pushed to GitHub: `https://github.com/SushrithKbtech/guvi2`
- [ ] Railway project created
- [ ] Environment variables set (API_KEY, NODE_ENV, USE_OPENAI)
- [ ] Domain generated in Railway
- [ ] Health check working (`/health` returns 200)
- [ ] Conversation endpoint tested with PowerShell
- [ ] API key saved: `honeypot-guvi-2026-secure-key`
- [ ] Ready to submit to GUVI! 🎉

---

## 🚀 **NEXT ACTIONS:**

1. **Deploy to Railway** (5 minutes)
   - https://railway.app/
   - Deploy from `SushrithKbtech/guvi2` repo
   - Set 3 environment variables
   - Generate domain

2. **Test deployment** (2 minutes)
   - Health check
   - Conversation endpoint test

3. **Submit to GUVI** (1 minute)
   - Enter API key and URL
   - Verify "Active" status

**Total time: ~10 minutes** ⏱️

---

## 💡 **Pro Tips:**

1. **Keep Railway dashboard open** to monitor logs during GUVI testing
2. **Save your Railway URL** immediately after generating domain
3. **Test locally first** before deploying to catch any issues
4. **Use exact API key** - even one character difference will fail

---

## 🎓 **What Your API Does:**

When GUVI (or a scammer) sends a message:
1. ✅ Extracts intelligence (phone numbers, links, keywords)
2. ✅ Responds like a stressed Indian user
3. ✅ Uses safe delays (never shares real OTP/PIN)
4. ✅ Returns JSON with scam detection results
5. ✅ Terminates when enough intel gathered

**Perfect for scam detection hackathon!** 🎯

---

**Good luck! Let me know when you're ready to deploy to Railway!** 🚀
