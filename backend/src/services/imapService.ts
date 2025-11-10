import { ImapFlow, FetchMessageObject } from "imapflow";
import { simpleParser, AddressObject } from "mailparser";
import { indexEmail } from "./elasticsearch";
import { categorizeEmail } from "./aiCategoriser";
import { suggestReply } from "./aiReplyService";
import { notifyInterested } from "./notificationService";
import { SyncState } from "../models/syncState.model";

const getAddressText = (addr?: AddressObject | AddressObject[]) => {
  if (!addr) return "";
  if (Array.isArray(addr)) return addr.map((a) => a.text).join(", ");
  return addr.text;
};

const getThirtyDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
};

const FOLDERS_TO_MONITOR = ["INBOX", "[Gmail]/Sent Mail", "[Gmail]/Drafts", "[Gmail]/Spam", "[Gmail]/Trash"];

async function processEmail(msg: any, accountId: string, folderName: string) {
  if (!msg.source) return;

  const parsed = await simpleParser(msg.source as Buffer);
  const textContent = parsed.text || parsed.html || parsed.subject || "No content";

  const label = await categorizeEmail(textContent);
  const fromText = getAddressText(parsed.from);
  const toText = getAddressText(parsed.to);

  let suggestedReply = '';
  try {
    suggestedReply = await suggestReply(textContent);
  } catch (error: any) {
    console.error('Failed to generate AI reply:', error.message);
  }

  await indexEmail({
    accountId,
    folder: folderName,
    from: fromText,
    to: toText,
    subject: parsed.subject,
    text: parsed.text,
    date: parsed.date || new Date(),
    label,
    suggestedReply,
  });

  return { parsed, label, fromText, toText, suggestedReply };
}

export async function startImapListener(accountConfig?: {
  user: string;
  pass: string;
  host?: string;
  port?: number;
}) {
  const user = accountConfig?.user || process.env.IMAP_USER!;
  const pass = accountConfig?.pass || process.env.IMAP_PASS!;
  const host = accountConfig?.host || process.env.IMAP_HOST!;
  const port = accountConfig?.port || Number(process.env.IMAP_PORT!) || 993;

  const accountId = user;

  let state = await SyncState.findOne({ accountId });

  if (!state) {
    state = await SyncState.create({
      accountId,
      initialSyncDone: false,
      folders: {},
    });
    console.log(`Created new sync state for ${accountId}`);
  }

  const client = new ImapFlow({
    host,
    port,
    secure: true,
    auth: { user, pass },
  });

  try {
    await client.connect();
    console.log(`Connected to IMAP: ${user}`);

    if (!state.initialSyncDone) {
      console.log(`Performing initial 30-day sync for ${accountId} across all folders`);

      const sinceDate = getThirtyDaysAgo();
      let totalSynced = 0;

      for (const folderName of FOLDERS_TO_MONITOR) {
        try {
          const lock = await client.getMailboxLock(folderName);
          console.log(`Syncing folder: ${folderName}`);

          let folderCount = 0;
          for await (const msg of client.fetch({ since: sinceDate }, { source: true })) {
            await processEmail(msg, accountId, folderName);
            folderCount++;
            totalSynced++;
          }

          console.log(`${folderName}: ${folderCount} emails synced`);
          lock.release();
        } catch (err: any) {
          console.log(`Could not access ${folderName}: ${err.message}`);
        }
      }

      state.initialSyncDone = true;
      state.lastSyncedAt = new Date();
      await state.save();

      console.log(`Initial sync completed for ${accountId}. Total: ${totalSynced} emails`);
    } else {
      console.log(`${accountId} already synced. Starting real-time listener`);
    }

    console.log(`Starting real-time monitoring for INBOX`);

    const lock = await client.getMailboxLock("INBOX");

    client.on("exists", async () => {
      try {
        const message = await client.fetchOne("*", { source: true }) as FetchMessageObject | false;
        if (!message || !message.source) return;

        const result = await processEmail(message, accountId, "INBOX");
        if (!result) return;

        state!.lastSyncedAt = new Date();
        await state!.save();

        if (result.label.toLowerCase() === "interested") {
          console.log("Sending notification for interested email");
          await notifyInterested({
            accountId,
            from: result.fromText,
            to: result.toText,
            subject: result.parsed.subject,
            text: result.parsed.text,
            date: result.parsed.date || new Date(),
            label: result.label,
          });
        }

        console.log(`[INBOX] New email: ${result.parsed.subject} - ${result.label}`);
      } catch (err: any) {
        console.error(`Error processing INBOX:`, err.message);
      }
    });

    lock.release();

  } catch (error: any) {
    console.error(`IMAP connection error for ${user}:`, error.message);
  }
}
