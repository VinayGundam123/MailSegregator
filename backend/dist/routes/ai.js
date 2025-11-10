"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiReplyService_1 = require("../services/aiReplyService");
const router = (0, express_1.Router)();
router.get('/suggest', async (req, res) => {
    try {
        const emailText = req.query.q;
        if (!emailText) {
            return res.status(400).json({
                error: 'Missing query parameter "q"',
                usage: 'GET /ai/suggest?q=Your email text here'
            });
        }
        const reply = await (0, aiReplyService_1.suggestReply)(emailText);
        res.json({
            success: true,
            reply,
            emailText: emailText.substring(0, 100) + (emailText.length > 100 ? '...' : ''),
        });
    }
    catch (error) {
        console.error('AI suggest error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to generate AI reply',
            message: error.message,
        });
    }
});
router.post('/train', async (req, res) => {
    try {
        const { texts } = req.body;
        if (!texts || !Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({
                error: 'Invalid request body',
                expected: '{ texts: string[] }',
            });
        }
        await (0, aiReplyService_1.storeTrainingData)(texts);
        res.json({
            success: true,
            message: `Successfully stored ${texts.length} training texts`,
        });
    }
    catch (error) {
        console.error('AI train error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to store training data',
            message: error.message,
        });
    }
});
router.post('/initialize', async (req, res) => {
    try {
        await (0, aiReplyService_1.initializeTrainingData)();
        res.json({
            success: true,
            message: 'Training data initialized with sample data',
        });
    }
    catch (error) {
        console.error('AI initialize error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to initialize training data',
            message: error.message,
        });
    }
});
exports.default = router;
