import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';

import devRoutes from "./routes/dev";
import emailRoutes from "./routes/emails";
import replyRoutes from "./routes/reply";
import accountRoutes from "./routes/accounts";
import aiRoutes from "./routes/ai";
import { startAllAccounts } from "./services/accountManager";

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/reachinbox", {
  autoIndex: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/dev', devRoutes);
app.use('/emails', emailRoutes);
app.use('/reply', replyRoutes);
app.use('/accounts', accountRoutes);
app.use('/ai', aiRoutes);
app.get('/health', (_req, res) => res.json({ ok: true }));

// Serve static files from dist folder in production
app.use(express.static(path.join(__dirname, '../../dist')));

// SPA fallback - catch all other routes
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server started on port ${PORT}`);
    setTimeout(async () => {
      await startAllAccounts();
    }, 1000);
});
