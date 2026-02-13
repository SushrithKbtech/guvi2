/**
 * Agentic Honey-Pot API Server - GUVI Format
 * Handles conversation requests matching GUVI requirements
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const HoneypotAgent = require('./honeypotAgent');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'honeypot-guvi-2026-secure-key';

// Default fallback callback (used only if metadata.callbackUrl is not provided)
const GUVI_CALLBACK_URL = process.env.GUVI_CALLBACK_URL || 'https://guvi-honeypot-tester.onrender.com/callback';
const CALLBACK_MAX_RETRIES = 3;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendFinalResultToCallback = async (callbackUrl, payload) => {
    if (!callbackUrl) {
        console.warn('⚠️ No callback URL provided; skipping callback.');
        return false;
    }

    for (let attempt = 1; attempt <= CALLBACK_MAX_RETRIES; attempt++) {
        try {
            await axios.post(callbackUrl, payload, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY
                }
            });
            console.log(`✅ Successfully sent final result to callback (attempt ${attempt})`);
            return true;
        } catch (error) {
            const status = error.response?.status;
            const body = error.response?.data;
            console.error(`❌ Callback failed (attempt ${attempt}/${CALLBACK_MAX_RETRIES})`, {
                status: status || 'no-status',
                body: body || 'no-body',
                message: error.message
            });

            if (attempt < CALLBACK_MAX_RETRIES) {
                await sleep(300 * attempt);
            }
        }
    }

    return false;
};

// Middleware
app.use(cors());
app.use(express.json());

// API Key authentication middleware
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            error: 'Missing API key',
            message: 'Please provide x-api-key header'
        });
    }

    if (apiKey !== API_KEY) {
        return res.status(403).json({
            error: 'Invalid API key',
            message: 'The provided API key is invalid'
        });
    }

    next();
};

// In-memory conversation storage (sessionId -> conversation data)
const sessions = new Map();

// Initialize agent
const agent = new HoneypotAgent();

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Agentic Honey-Pot API (GUVI Format)',
        status: 'active',
        version: '2.0.0',
        endpoints: {
            conversation: 'POST /api/conversation',
            health: 'GET /health'
        },
        documentation: 'GUVI Hackathon - Agentic Honeypot for Scam Detection'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

/**
 * Main honeypot conversation endpoint (GUVI Format)
 * POST /api/conversation
 */
app.post('/api/conversation', authenticateApiKey, async (req, res) => {
    try {
        console.log('📥 Incoming GUVI request:', JSON.stringify(req.body, null, 2));

        const {
            sessionId = `generated-${Date.now()}`,
            message = { text: "Hello", sender: "scammer" },
            conversationHistory = [],
            metadata = {}
        } = req.body || {};

        console.log('✅ Step 1: Request parsed. SessionId:', sessionId);

        if (!req.body.sessionId) console.log('⚠️ Warning: sessionId was missing, auto-generated.');
        if (!req.body.message) console.log('⚠️ Warning: message was missing, using default.');

        let sessionData = sessions.get(sessionId) || {
            sessionId,
            messages: [],
            scamDetected: false,
            intelligence: {
                bankAccounts: [],
                upiIds: [],
                phishingLinks: [],
                phoneNumbers: [],
                employeeIds: [],
                orgNames: [],
                suspiciousKeywords: []
            }
        };

        const agentHistory = conversationHistory.map(msg => ({
            timestamp: msg.timestamp,
            scammerMessage: msg.sender === 'scammer' ? msg.text : '',
            agentReply: msg.sender === 'user' ? msg.text : '',
            stressScore: 5
        }));

        const computedStressScore = Math.min(10, 5 + Math.floor(agentHistory.length / 2));
        const incomingStressScore = req.body?.stressScore ?? metadata?.stressScore;
        const stressScore = incomingStressScore ?? computedStressScore;

        const computedNextIntent = agentHistory.length === 0 ? 'clarify_procedure' :
            agentHistory.length < 3 ? 'request_details' :
                agentHistory.length < 6 ? 'pretend_technical_issue' :
                    'maintain_conversation';
        const incomingNextIntent = req.body?.nextIntent ?? metadata?.nextIntent;
        const nextIntent = incomingNextIntent || computedNextIntent;

        console.log('🤖 Calling agent.generateResponse with:', { text: message.text, historyLength: agentHistory.length, nextIntent, stressScore });
        const response = await agent.generateResponse(
            message.text,
            agentHistory,
            nextIntent,
            stressScore
        );
        console.log('✅ Agent response received:', response.reply);

        if (response.intelSignals) {
            Object.keys(response.intelSignals).forEach(key => {
                if (Array.isArray(response.intelSignals[key])) {
                    sessionData.intelligence[key] = [
                        ...new Set([
                            ...sessionData.intelligence[key] || [],
                            ...response.intelSignals[key]
                        ])
                    ];
                }
            });
        }

        if (response.scamDetected) {
            sessionData.scamDetected = true;
        }

        sessionData.messages.push({
            scammer: message.text,
            agent: response.reply,
            timestamp: message.timestamp || new Date().toISOString()
        });

        sessions.set(sessionId, sessionData);

        // Final callback
        if (response.shouldTerminate || sessionData.messages.length >= 10) {
            console.log('🎯 Conversation ending, sending final result to callback...');

            try {
                const finalPayload = {
                    sessionId: sessionId,
                    scamDetected: sessionData.scamDetected,
                    totalMessagesExchanged: sessionData.messages.length,
                    extractedIntelligence: sessionData.intelligence,
                    agentNotes: response.agentNotes || 'Conversation completed'
                };

                // Use tester callback if provided, else fallback
                const callbackUrlFromRequest = metadata?.callbackUrl;
                const finalCallbackUrl = callbackUrlFromRequest || GUVI_CALLBACK_URL;

                console.log('📤 Sending to callback:', finalCallbackUrl);
                console.log('📤 Payload:', JSON.stringify(finalPayload, null, 2));

                await sendFinalResultToCallback(finalCallbackUrl, finalPayload);
            } catch (callbackError) {
                console.error('❌ Failed to send callback:', callbackError.message);
            }

            setTimeout(() => sessions.delete(sessionId), 60000);
        }

        res.json({
            status: 'success',
            reply: response.reply
        });
        console.log('✅ Response sent successfully!');

    } catch (error) {
        console.error('❌ ERROR in conversation handler:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process conversation request'
        });
    }
});

/**
 * Get session data (for debugging)
 */
app.get('/api/session/:sessionId', authenticateApiKey, (req, res) => {
    const { sessionId } = req.params;
    const sessionData = sessions.get(sessionId);

    if (!sessionData) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Session not found'
        });
    }

    res.json(sessionData);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🍯 Agentic Honey-Pot API (GUVI Format) running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔑 API Key authentication: ${API_KEY ? 'ENABLED' : 'DISABLED'}`);
    console.log(`\n✅ Server ready to receive GUVI requests`);
});

module.exports = app;
