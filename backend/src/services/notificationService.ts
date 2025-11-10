import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * Notify Slack and Webhook when a lead is marked as "Interested"
 * @param data Email object containing from, subject, text, etc.
 */
export async function notifyInterested(data: any) {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  const externalWebhook = process.env.WEBHOOK_URL;

  try {
    // ----------------- Slack Notification -----------------
    if (slackWebhook) {
      const slackMessage = {
        text: `*New Interested Lead Found!*\n\n*From:* ${data.from}\n*To:* ${data.to}\n*Subject:* ${data.subject}\n\n*Snippet:* ${data.text?.slice(0, 200) || "No content"}\n\n📅 ${new Date().toLocaleString()}`,
      };

      await axios.post(slackWebhook, slackMessage);
      console.log("Slack notification sent");
    } else {
      console.warn("Slack webhook URL missing in .env file");
    }

    // ----------------- Webhook Notification -----------------
    if (externalWebhook) {
      await axios.post(externalWebhook, data);
      console.log("External webhook triggered");
    } else {
      console.warn("Webhook URL missing in .env file");
    }

  } catch (err: any) {
    console.error("Notification sending failed:", err.message);
  }
}
