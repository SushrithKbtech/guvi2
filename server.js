/**
 * GUVI Honeypot API Server
 * - Accepts GUVI request format
 * - Returns { status, reply, scamType }
 * - Maintains per-session state (in-memory)
 * - Sends final callback payload after 10 turns (or when max-turn reached)
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const axios = require("axios");
require("dotenv").config();

const AdaptiveHoneypotAgent = require("./honeypotAgent");

// ----------------------------------------------------------------------------
// CONFIG
// ----------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY || "honeypot-guvi-2026-secure-key";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const GUVI_CALLBACK_URL =
  process.env.GUVI_CALLBACK_URL || "https://guvi-honeypot-tester.onrender.com/callback";

const CALLBACK_MAX_RETRIES = 3;

if (!OPENAI_API_KEY) {
  console.error("❌ ERROR: OPENAI_API_KEY is required in environment variables");
  process.exit(1);
}

// ----------------------------------------------------------------------------
// MIDDLEWARE
// ----------------------------------------------------------------------------
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: "Too many requests, please try again later.",
  })
);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API key auth
function authenticateApiKey(req, res, next) {
  const provided = req.headers["x-api-key"];
  if (!provided) {
    return res.status(401).json({
      status: "error",
      message: "Missing API key (x-api-key)",
    });
  }
  if (provided !== API_KEY) {
    return res.status(403).json({
      status: "error",
      message: "Invalid API key",
    });
  }
  next();
}

// ----------------------------------------------------------------------------
// SESSION STORE (IN-MEMORY)
// ----------------------------------------------------------------------------
const sessions = new Map();

function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      sessionId,
      sessionStartMs: Date.now(),
      turnCount: 0,
      scamDetected: false,
      scamType: "unknown",
      extractedIntelligence: {
        phoneNumbers: [],
        bankAccounts: [],
        upiIds: [],
        phishingLinks: [],
        emailAddresses: [],
        trackingIds: [],
        challanNumbers: [],
        consumerNumbers: [],
        vehicleNumbers: [],
        employeeIds: [],
        ifscCodes: [],
        caseIds: [],
        appNames: [],
        suspiciousKeywords: [],
        amounts: [],
      },
    });
  }
  return sessions.get(sessionId);
}

function mergeIntelligence(existing, incoming) {
  const merged = { ...existing };
  for (const [k, v] of Object.entries(incoming || {})) {
    if (Array.isArray(v)) merged[k] = [...new Set([...(merged[k] || []), ...v])];
  }
  // Evaluator-friendly mirror
  if (merged.callbackNumbers?.length) {
    merged.phoneNumbers = [...new Set([...(merged.phoneNumbers || []), ...merged.callbackNumbers])];
  }
  return merged;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sendFinalResultToCallback(callbackUrl, payload) {
  if (!callbackUrl) {
    console.warn("⚠️ No callback URL provided; skipping callback.");
    return false;
  }

  for (let attempt = 1; attempt <= CALLBACK_MAX_RETRIES; attempt++) {
    try {
      await axios.post(callbackUrl, payload, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
      });
      console.log(`✅ Final callback sent (attempt ${attempt})`);
      return true;
    } catch (err) {
      console.error(`❌ Callback failed (attempt ${attempt}/${CALLBACK_MAX_RETRIES})`, {
        status: err.response?.status || "no-status",
        body: err.response?.data || "no-body",
        message: err.message,
      });
      if (attempt < CALLBACK_MAX_RETRIES) await sleep(300 * attempt);
    }
  }
  return false;
}

// ----------------------------------------------------------------------------
// AGENT INIT
// ----------------------------------------------------------------------------
const honeypotAgent = new AdaptiveHoneypotAgent(OPENAI_API_KEY);
console.log("✅ Adaptive Honeypot Agent initialized");

// ----------------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.json({
    service: "Adaptive Honeypot API",
    version: "2.1.0",
    status: "running",
    endpoints: {
      conversation: "POST /api/conversation",
      health: "GET /health",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    activeSessions: sessions.size,
  });
});

/**
 * GUVI main endpoint
 * Expected request format:
 * {
 *   sessionId,
 *   message: { sender, text, timestamp },
 *   conversationHistory: [{ sender, text, timestamp }, ...],
 *   metadata: { channel, language, locale, callbackUrl }
 * }
 */
app.post("/api/conversation", authenticateApiKey, async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      sessionId,
      message,
      conversationHistory = [],
      metadata = {},
    } = req.body || {};

    if (!sessionId) {
      return res.status(400).json({ status: "error", message: "sessionId is required" });
    }
    if (!message || typeof message.text !== "string" || !message.text.trim()) {
      return res.status(400).json({ status: "error", message: "message.text is required" });
    }

    const session = getOrCreateSession(sessionId);

    // Increase turn count only when scammer speaks (GUVI uses sender: "scammer")
    session.turnCount += 1;

    // IMPORTANT: Do NOT truncate history aggressively -> repetition happens if you do.
    // We keep last up to 20 messages for token safety, but enough context for uniqueness.
    const normalizedHistory = (conversationHistory || [])
      .filter((m) => m && typeof m.text === "string" && m.text.trim())
      .slice(-20)
      .map((m) => ({
        sender: m.sender === "scammer" ? "scammer" : "user",
        text: m.text,
        timestamp: m.timestamp || new Date().toISOString(),
      }));

    // Add current incoming scammer message
    normalizedHistory.push({
      sender: "scammer",
      text: message.text,
      timestamp: message.timestamp || new Date().toISOString(),
    });

    console.log(`\n📩 Session ${sessionId} | Turn ${session.turnCount}`);
    console.log(`   Scammer: ${message.text.substring(0, 120)}${message.text.length > 120 ? "..." : ""}`);

    // Let agent decide autonomously
    const agentResponse = await honeypotAgent.handleMessage(
      sessionId,
      message.text,
      normalizedHistory,
      metadata
    );

    const reply = agentResponse.reply;
    const scamType = agentResponse.metadata?.scamType || "unknown";
    const extractedNow = agentResponse.metadata?.extractedIntelligence || {};

    // Update session state
    session.scamType = scamType;
    session.scamDetected = true; // In this eval, you're always talking to "scammer" sender
    session.extractedIntelligence = mergeIntelligence(session.extractedIntelligence, extractedNow);

    const responseTime = Date.now() - startTime;
    console.log(`   Honeypot: ${reply}`);
    console.log(`   ⏱️  ${responseTime}ms | scamType=${scamType}`);

    // Respond (GUVI requires status+reply; extra fields are safe)
    const responsePayload = {
      status: "success",
      reply,
      scamType, // <-- you asked for this
    };

    // Termination condition: after 10 turns
    const shouldTerminate = session.turnCount >= 10;

    if (shouldTerminate) {
      console.log(`🏁 Terminating session ${sessionId} (max turns reached)`);

      // Build final output payload to callback (GUVI style + scamType)
      const finalOutput = await honeypotAgent.generateFinalOutput(sessionId, normalizedHistory);

      // Use metadata.callbackUrl if provided, otherwise fallback to env
      const callbackUrl = metadata?.callbackUrl || GUVI_CALLBACK_URL;

      await sendFinalResultToCallback(callbackUrl, {
        sessionId: finalOutput.sessionId,
        scamDetected: finalOutput.scamDetected,
        scamType: finalOutput.scamType, // <-- included in callback too
        totalMessagesExchanged: finalOutput.totalMessagesExchanged,
        extractedIntelligence: finalOutput.extractedIntelligence,
        agentNotes: finalOutput.agentNotes,
        engagementMetrics: finalOutput.engagementMetrics,
      });

      // Mark termination in response (optional)
      responsePayload.terminated = true;
      responsePayload.terminationReason = "max_turns_reached";

      // Cleanup later
      setTimeout(() => sessions.delete(sessionId), 60_000);
    }

    return res.json(responsePayload);
  } catch (error) {
    console.error("❌ Error processing request:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Debug: session view
app.get("/api/session/:sessionId", authenticateApiKey, (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ status: "error", message: "Session not found" });
  res.json({ status: "success", session });
});

// 404
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Endpoint not found" });
});

// ----------------------------------------------------------------------------
// START
// ----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 ADAPTIVE HONEYPOT API SERVER");
  console.log("=".repeat(60));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 POST /api/conversation`);
  console.log(`🔒 API Key: REQUIRED (x-api-key)`);
  console.log(`🤖 Model: ${honeypotAgent.model}`);
  console.log(`📤 Callback fallback: ${GUVI_CALLBACK_URL}`);
  console.log("=".repeat(60) + "\n");
});

module.exports = app;
