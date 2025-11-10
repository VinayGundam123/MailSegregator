import express from "express";
import { Account } from "../models/account.model";
import { startImapListener } from "../services/imapService";

const router = express.Router();

// 📝 Get all accounts
router.get("/", async (_req, res) => {
  try {
    const accounts = await Account.find().select("-password");
    res.json({ success: true, accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔍 Get single account by ID
router.get("/:id", async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).select("-password");
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }
    res.json({ success: true, account });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ➕ Add new account
router.post("/", async (req, res) => {
  try {
    const { email, password, imapHost, imapPort, smtpHost, smtpPort, name } = req.body;

    if (!email || !password || !imapHost) {
      return res.status(400).json({ 
        success: false, 
        error: "Email, password, and IMAP host are required" 
      });
    }

    // Check if account already exists
    const existing = await Account.findOne({ email });
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: "Account with this email already exists" 
      });
    }

    // Create new account
    const account = await Account.create({
      email,
      password,
      imapHost,
      imapPort: imapPort || 993,
      smtpHost,
      smtpPort: smtpPort || 587,
      name,
      isActive: true,
    });

    // Start IMAP listener for this account
    console.log(`🚀 Starting IMAP listener for ${email}...`);
    startImapListener({
      user: email,
      pass: password,
      host: imapHost,
      port: imapPort || 993,
    }).catch((err) => {
      console.error(`❌ Failed to start IMAP listener for ${email}:`, err.message);
    });

    res.status(201).json({ 
      success: true, 
      account: { ...account.toObject(), password: undefined } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✏️ Update account
router.put("/:id", async (req, res) => {
  try {
    const { email, password, imapHost, imapPort, smtpHost, smtpPort, name, isActive } = req.body;

    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { email, password, imapHost, imapPort, smtpHost, smtpPort, name, isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    res.json({ success: true, account });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🗑️ Delete account
router.delete("/:id", async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔄 Toggle account active status
router.patch("/:id/toggle", async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    account.isActive = !account.isActive;
    await account.save();

    res.json({ 
      success: true, 
      account: { ...account.toObject(), password: undefined } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
