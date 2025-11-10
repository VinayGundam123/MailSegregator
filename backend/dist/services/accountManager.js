"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAllAccounts = startAllAccounts;
exports.startAccountById = startAccountById;
const account_model_1 = require("../models/account.model");
const imapService_1 = require("./imapService");
/**
 * Start IMAP listeners for all active accounts in the database
 */
async function startAllAccounts() {
    try {
        const accounts = await account_model_1.Account.find({ isActive: true });
        if (accounts.length === 0) {
            console.log("No active accounts found in database.");
            // Try to start the default account from env if it exists
            if (process.env.IMAP_USER && process.env.IMAP_PASS) {
                console.log("Starting default account from environment variables...");
                (0, imapService_1.startImapListener)().catch((err) => {
                    console.error("Failed to start default account:", err.message);
                });
            }
            return;
        }
        console.log(`Starting IMAP listeners for ${accounts.length} active account(s)...`);
        for (const account of accounts) {
            console.log(`Starting listener for: ${account.email}`);
            (0, imapService_1.startImapListener)({
                user: account.email,
                pass: account.password,
                host: account.imapHost,
                port: account.imapPort,
            }).catch((err) => {
                console.error(`Failed to start listener for ${account.email}:`, err.message);
            });
        }
    }
    catch (error) {
        console.error("Error starting accounts:", error.message);
    }
}
/**
 * Start a single account by ID
 */
async function startAccountById(accountId) {
    try {
        const account = await account_model_1.Account.findById(accountId);
        if (!account) {
            throw new Error("Account not found");
        }
        if (!account.isActive) {
            throw new Error("Account is not active");
        }
        console.log(`Starting listener for: ${account.email}`);
        await (0, imapService_1.startImapListener)({
            user: account.email,
            pass: account.password,
            host: account.imapHost,
            port: account.imapPort,
        });
    }
    catch (error) {
        console.error(`Failed to start account ${accountId}:`, error.message);
        throw error;
    }
}
