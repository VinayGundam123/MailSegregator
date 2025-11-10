import { Router } from "express";
import { searchEmails } from "../services/elasticsearch";

const router = Router();

// GET /emails?q=keyword&accountId=email@gmail.com&folder=INBOX
router.get("/", async (req, res) => {
  try {
    const query = (req.query.q as string) || "";
    const folder = req.query.folder as string;
    const accountId = req.query.accountId as string;
    
    // Pass all filters to searchEmails
    const results = await searchEmails(query, { folder, accountId });
    
    // Return array directly for frontend compatibility
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
