import { Router } from "express";
import { indexEmail } from "../services/elasticsearch";
import { categorizeEmail } from "../services/aiCategoriser";

const router = Router();

router.post("/mock-email", async (req, res) => {
  try {
    const doc = req.body;
    if (!doc.subject || !doc.from) {
      return res.status(400).json({ error: "subject and from are required" });
    }

    doc.date = new Date();

    // 👇 Call AI to categorize the email
    const category = await categorizeEmail(`${doc.subject}\n${doc.text}`);
    doc.label = category;

    const id = await indexEmail(doc);
    res.json({ success: true, id, label: category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
