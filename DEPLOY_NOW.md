# 🎯 QUICK START - DEPLOY IN 10 MINUTES

## ✅ **CURRENT STATUS:**

- ✅ GitHub: `https://github.com/SushrithKbtech/guvi2` (code pushed!)
- ✅ Local server: Running on port 3000
- ✅ API Key: `honeypot-guvi-2026-secure-key`
- ✅ OpenAI: Optional (currently using free template mode)

---

## 🚀 **3 SIMPLE STEPS TO DEPLOY:**

### **1️⃣ Deploy to Railway (5 min)**

1. Go to: **https://railway.app/**
2. Login with GitHub
3. Click **"New Project" → "Deploy from GitHub repo"**
4. Select: **`SushrithKbtech/guvi2`**
5. Click **"Variables"** → Add these 3:
   - `API_KEY` = `honeypot-guvi-2026-secure-key`
   - `NODE_ENV` = `production`
   - `USE_OPENAI` = `false`
6. Click **"Settings" → "Domains" → "Generate Domain"**
7. Save your URL (example: `https://guvi2-production.up.railway.app`)

### **2️⃣ Test Your API (2 min)**

PowerShell test:
```powershell
# Health check
Invoke-RestMethod -Uri "https://YOUR-URL.up.railway.app/health"

# Conversation test
$headers = @{"Content-Type" = "application/json"; "x-api-key" = "honeypot-guvi-2026-secure-key"}
$body = @{scammerMessage = "Your account blocked!"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://YOUR-URL.up.railway.app/api/conversation" -Method Post -Headers $headers -Body $body | ConvertTo-Json
```

### **3️⃣ Submit to GUVI (1 min)**

1. Go to GUVI Timeline → Test Honeypot Endpoint
2. Enter:
   - **x-api-key:** `honeypot-guvi-2026-secure-key`
   - **URL:** `https://YOUR-URL.up.railway.app/api/conversation`
3. Click "Test Honeypot Endpoint"
4. ✅ Should show **"Active"**

---

## 🔑 **IMPORTANT INFO:**

**Your API Key:** `honeypot-guvi-2026-secure-key`

**GitHub Repo:** `https://github.com/SushrithKbtech/guvi2`

**What Your API Does:**
- Pretends to be a stressed Indian user
- Extracts scammer intelligence (phones, UPI, links)
- Never shares real OTP/PIN
- Returns JSON response

---

## 📚 **Full Documentation:**

- **Railway Guide:** See `RAILWAY_DEPLOY.md`
- **OpenAI Guide:** See `OPENAI_GUIDE.md` (optional)
- **API Reference:** See `REFERENCE.md`
- **Complete Docs:** See `README.md`

---

## ❓ **FAQs:**

**Q: Do I need OpenAI?**
A: No! It's optional. Free template mode works great.

**Q: What's my API key?**
A: `honeypot-guvi-2026-secure-key`

**Q: Where do I deploy?**
A: Railway.app (free tier, easy setup)

**Q: How much does it cost?**
A: $0 with template mode (500 hours/month free on Railway)

---

**🎉 READY TO DEPLOY! Follow the 3 steps above!**
