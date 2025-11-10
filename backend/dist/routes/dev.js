"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const elasticsearch_1 = require("../services/elasticsearch");
const aiCategoriser_1 = require("../services/aiCategoriser");
const router = (0, express_1.Router)();
router.post("/mock-email", async (req, res) => {
    try {
        const doc = req.body;
        if (!doc.subject || !doc.from) {
            return res.status(400).json({ error: "subject and from are required" });
        }
        doc.date = new Date();
        // 👇 Call AI to categorize the email
        const category = await (0, aiCategoriser_1.categorizeEmail)(`${doc.subject}\n${doc.text}`);
        doc.label = category;
        const id = await (0, elasticsearch_1.indexEmail)(doc);
        res.json({ success: true, id, label: category });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
