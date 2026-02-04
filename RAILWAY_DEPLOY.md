# 🚂 RAILWAY DEPLOYMENT - STEP BY STEP

## ✅ Git Setup Complete!

Your code is committed and ready to push to GitHub.

---

## 📋 **DEPLOYMENT STEPS**

### **STEP 1: Create GitHub Repository**

1. **Go to GitHub:**
   - Open: https://github.com/new
   
2. **Create New Repository:**
   - **Repository name**: `honeypot-api`
   - **Description**: `Agentic Honey-Pot API for Scam Detection`
   - **Visibility**: **Public** (required for free Railway deployment)
   - **DO NOT** initialize with README (we already have code)
   - Click **"Create repository"**

3. **Push Your Code:**
   
   Copy the commands GitHub shows you, or use these:
   
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/honeypot-api.git
   git push -u origin main
   ```
   
   Replace `YOUR_USERNAME` with your actual GitHub username.

---

### **STEP 2: Deploy to Railway**

1. **Go to Railway:**
   - Open: https://railway.app/
   - Click **"Login"** (Sign in with GitHub for easiest setup)

2. **Create New Project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - If first time: Click **"Configure GitHub App"** to connect your repos
   - Select your **`honeypot-api`** repository

3. **Railway Auto-Detects:**
   - ✅ Runtime: Node.js (detected from package.json)
   - ✅ Build Command: `npm install`
   - ✅ Start Command: `npm start`
   - ✅ No additional configuration needed!

4. **Add Environment Variables:**
   
   IMPORTANT: You MUST add these before deployment works!
   
   - In Railway dashboard, go to your project
   - Click **"Variables"** tab
   - Click **"New Variable"**
   - Add these two variables:
   
   ```
   Variable 1:
   Name:  API_KEY
   Value: honeypot-guvi-2026-secure-railway-key
   
   Variable 2:
   Name:  NODE_ENV
   Value: production
   ```
   
   ⚠️ **IMPORTANT**: Choose a strong API key! This is what you'll use to authenticate with GUVI.
   
   Suggested format: `honeypot-guvi-2026-[your-name]-[random-numbers]`
   
   Example: `honeypot-guvi-2026-sushrith-98765`

5. **Get Your Deployment URL:**
   
   - Railway will automatically deploy
   - Go to **"Settings"** tab
   - Scroll to **"Domains"**
   - Click **"Generate Domain"**
   - Your URL will be: `https://honeypot-api-production.up.railway.app`
   - Or you can customize it!

6. **Wait for Deployment:**
   - Check the **"Deployments"** tab
   - Wait for status: ✅ **"Active"**
   - Takes about 2-3 minutes

---

### **STEP 3: Test Your Deployed API**

1. **Health Check:**
   
   ```powershell
   Invoke-RestMethod -Uri "https://YOUR-RAILWAY-URL.up.railway.app/health"
   ```
   
   Should return:
   ```json
   {
     "status": "healthy",
     "uptime": 10.5,
     "timestamp": "2026-02-04T..."
   }
   ```

2. **Test Conversation Endpoint:**
   
   ```powershell
   $headers = @{
       "Content-Type" = "application/json"
       "x-api-key" = "honeypot-guvi-2026-YOUR-KEY"
   }
   
   $body = @{
       scammerMessage = "Your HDFC account is blocked. Share OTP now!"
       stressScore = 7
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "https://YOUR-RAILWAY-URL.up.railway.app/api/conversation" `
     -Method Post -Headers $headers -Body $body | ConvertTo-Json
   ```

---

### **STEP 4: Submit to GUVI Platform**

1. **Go to GUVI Hackathon Timeline**
   
2. **Click "Test Honeypot Endpoint"**

3. **Enter Your Details:**
   ```
   x-api-key: honeypot-guvi-2026-YOUR-KEY
   
   Honeypot API Endpoint URL: 
   https://YOUR-RAILWAY-URL.up.railway.app/api/conversation
   ```

4. **Click "Test Honeypot Endpoint"**

5. **Verify Status Shows: ✅ Active**

---

## 🎯 **YOUR CREDENTIALS TO SAVE**

After deployment, save these somewhere safe:

```
✅ GitHub Repo: https://github.com/YOUR_USERNAME/honeypot-api
✅ Railway URL: https://<your-app>.up.railway.app
✅ API Endpoint: https://<your-app>.up.railway.app/api/conversation
✅ API Key: honeypot-guvi-2026-YOUR-KEY
✅ Health Check: https://<your-app>.up.railway.app/health
```

---

## 📊 **Railway Dashboard - What to Monitor**

In your Railway dashboard you can see:

- 📈 **Metrics**: CPU, Memory, Network usage
- 📜 **Logs**: Real-time application logs
- 🔄 **Deployments**: Build history and status
- ⚙️ **Variables**: Environment variables
- 🌐 **Domains**: Your public URLs

---

## 💡 **Railway Tips**

1. **Free Tier Limits:**
   - 500 hours/month (about 21 days)
   - If you run out, service pauses until next month
   - More than enough for hackathon!

2. **Keep Service Active:**
   - Railway doesn't auto-sleep like Render
   - Your API stays running 24/7

3. **View Logs:**
   - Click your project → "Deployments" → Latest deployment
   - Click "View Logs" to see real-time activity
   - Great for debugging!

4. **Custom Domain (Optional):**
   - You can add a custom domain in Settings
   - Not required for hackathon

---

## ⚠️ **Troubleshooting**

### **Problem: Build Failed**
- **Solution**: Check "Deployments" logs for error details
- Usually means missing dependencies or syntax error

### **Problem: 401 Unauthorized when testing**
- **Solution**: Verify API_KEY in Railway Variables matches your request header

### **Problem: Can't connect to repo**
- **Solution**: Make sure GitHub repo is Public and Railway app is authorized

### **Problem: App crashes on startup**
- **Solution**: Check logs, ensure environment variables are set correctly

---

## ✅ **Final Checklist**

Before submitting to GUVI:

- [ ] Code pushed to GitHub (public repo)
- [ ] Railway project created and deployed
- [ ] Environment variables set (API_KEY, NODE_ENV)
- [ ] Domain generated in Railway
- [ ] Health check working (`/health` returns 200)
- [ ] Conversation endpoint tested with PowerShell
- [ ] API key saved somewhere safe
- [ ] Ready to submit to GUVI! 🎉

---

## 🚀 **Ready? Let's Deploy!**

**Current Status:**
✅ Git initialized
✅ Files committed
✅ Ready to push to GitHub

**Next Action:**
1. Create GitHub repo: https://github.com/new
2. Push your code (see STEP 1)
3. Deploy on Railway (see STEP 2)

---

**Need help?** Check Railway docs: https://docs.railway.app/

**Good luck! 🎯**
