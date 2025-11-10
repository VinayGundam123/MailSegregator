"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const elasticsearch_1 = require("../services/elasticsearch");
const router = (0, express_1.Router)();
// GET /emails?q=keyword&accountId=email@gmail.com&folder=INBOX
router.get("/", async (req, res) => {
    try {
        const query = req.query.q || "";
        const folder = req.query.folder;
        const accountId = req.query.accountId;
        // Pass all filters to searchEmails
        const results = await (0, elasticsearch_1.searchEmails)(query, { folder, accountId });
        // Return array directly for frontend compatibility
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
