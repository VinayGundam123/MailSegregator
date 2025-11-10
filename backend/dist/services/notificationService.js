"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyInterested = notifyInterested;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Notify Slack and Webhook when a lead is marked as "Interested"
 * @param data Email object containing from, subject, text, etc.
 */
async function notifyInterested(data) {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    const externalWebhook = process.env.WEBHOOK_URL;
    try {
        // ----------------- Slack Notification -----------------
        if (slackWebhook) {
            const slackMessage = {
                text: `*New Interested Lead Found!*\n\n*From:* ${data.from}\n*To:* ${data.to}\n*Subject:* ${data.subject}\n\n*Snippet:* ${data.text?.slice(0, 200) || "No content"}\n\n📅 ${new Date().toLocaleString()}`,
            };
            await axios_1.default.post(slackWebhook, slackMessage);
            console.log("Slack notification sent");
        }
        else {
            console.warn("Slack webhook URL missing in .env file");
        }
        // ----------------- Webhook Notification -----------------
        if (externalWebhook) {
            await axios_1.default.post(externalWebhook, data);
            console.log("External webhook triggered");
        }
        else {
            console.warn("Webhook URL missing in .env file");
        }
    }
    catch (err) {
        console.error("Notification sending failed:", err.message);
    }
}
