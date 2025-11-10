"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const dev_1 = __importDefault(require("./routes/dev"));
const emails_1 = __importDefault(require("./routes/emails"));
const reply_1 = __importDefault(require("./routes/reply"));
const accounts_1 = __importDefault(require("./routes/accounts"));
const ai_1 = __importDefault(require("./routes/ai"));
const accountManager_1 = require("./services/accountManager");
mongoose_1.default.connect(process.env.MONGO_URI || "mongodb://localhost:27017/reachinbox", {
    autoIndex: true,
})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use('/dev', dev_1.default);
app.use('/emails', emails_1.default);
app.use('/reply', reply_1.default);
app.use('/accounts', accounts_1.default);
app.use('/ai', ai_1.default);
app.get('/health', (_req, res) => res.json({ ok: true }));
// Serve static files from frontend dist folder
// __dirname will be backend/dist after compilation, so we go up to backend/src/dist
const distPath = path_1.default.join(__dirname, "../src/dist");
app.use(express_1.default.static(distPath));
// SPA fallback - catch all other routes (Express 5 compatible)
app.use((_req, res) => {
    res.sendFile(path_1.default.join(distPath, 'index.html'));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server started on port ${PORT}`);
    setTimeout(async () => {
        await (0, accountManager_1.startAllAccounts)();
    }, 1000);
});
