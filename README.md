# ReachInbox - AI-Powered Email Management System

A full-stack email management application with AI categorization, multi-folder sync, and intelligent reply suggestions using RAG (Retrieval-Augmented Generation).

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [AI Features](#ai-features)

---

## Features

### Email Management
- Multi-account email support with IMAP synchronization
- Real-time email monitoring with IMAP IDLE
- Multi-folder support (INBOX, Sent, Drafts, Spam, Trash)
- Advanced search and filtering capabilities
- Gmail-like user interface

### AI-Powered Features
- **Automatic Email Categorization** using GROQ AI (Llama models)
  - Categories: Interested, Not Interested, Meeting Booked, Follow-up, Spam, Out of Office
- **AI Reply Suggestions** using RAG with OpenAI
  - Context-aware reply generation
  - MongoDB vector store for training data
  - Semantic similarity search using embeddings

### Notifications
- Slack webhook integration for "Interested" emails
- Custom webhook support for external integrations

### User Interface
- Modern, responsive Gmail-like layout
- Account management dashboard
- Real-time email updates
- Professional Material Design icons (react-icons)

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ GmailLayout│  │ Email List   │  │ Email Details    │   │
│  │            │  │              │  │ + AI Suggestions │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Node.js/Express)                │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Email    │  │     AI       │  │   Account        │   │
│  │   Routes   │  │   Routes     │  │   Management     │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   IMAP     │  │ AI Services  │  │  Notifications   │   │
│  │  Service   │  │ (RAG/Categorize)│  │   (Slack)      │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                │                    │
         ▼                ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│ Elasticsearch│  │   MongoDB    │  │  OpenAI API      │
│ (Email Index)│  │ (Accounts,   │  │  GROQ API        │
│              │  │  Training,   │  │                  │
│              │  │  Sync State) │  │                  │
└──────────────┘  └──────────────┘  └──────────────────┘
         ▲
         │
┌──────────────┐
│  IMAP Server │
│  (Gmail)     │
└──────────────┘
```

### Data Flow

1. **Email Synchronization**
   - IMAP connection established for each account
   - Initial 30-day sync for all folders
   - Real-time monitoring via IMAP IDLE (INBOX only)
   - Emails parsed and indexed in Elasticsearch

2. **AI Processing Pipeline**
   ```
   Email Received
        ↓
   Extract Text Content
        ↓
   AI Categorization (GROQ)
        ↓
   Generate Embedding (OpenAI)
        ↓
   Retrieve Similar Training Data (MongoDB)
        ↓
   Generate Reply Suggestion (OpenAI GPT-4o-mini)
        ↓
   Store in Elasticsearch
   ```

3. **Search & Retrieval**
   - User searches via frontend
   - Backend queries Elasticsearch
   - Results filtered by account, folder, and search terms
   - Sorted by date (newest first)

---

## Technology Stack

### Frontend
- **React** 18 with TypeScript
- **Tailwind CSS** for styling
- **React Icons** (Material Design) for UI icons
- **Vite** as build tool

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **ImapFlow** for IMAP email synchronization
- **Mailparser** for email parsing

### Databases & Search
- **Elasticsearch** for email indexing and search
- **MongoDB** for account management, sync state, and vector storage

### AI & ML
- **GROQ API** (Llama 3.1 70B) for email categorization
- **OpenAI API**
  - `text-embedding-3-small` for vector embeddings
  - `gpt-4o-mini` for reply generation

### Integrations
- **Slack Webhooks** for notifications
- **Gmail IMAP** for email access

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Elasticsearch (v8.x)
- Gmail account with App Password
- OpenAI API key
- GROQ API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Reachinbox-onebox
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3000
ES_NODE=http://localhost:9200
MONGO_URI=mongodb://localhost:27017/reachinbox
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# Gmail IMAP Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-password

# Notifications (Optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url
WEBHOOK_URL=your_custom_webhook_url
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Start Services

#### Start Elasticsearch
```bash
# Docker
docker run -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0

# Or use local installation
```

#### Start MongoDB
```bash
# Docker
docker run -d -p 27017:27017 mongo:latest

# Or use local installation
```

#### Start Backend
```bash
cd backend
npm run dev
```

The backend will:
- Connect to MongoDB and Elasticsearch
- Create necessary indexes
- Start IMAP listeners for configured accounts

#### Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 5. Initialize AI Training Data

Send a POST request to initialize sample training data:

```bash
curl -X POST http://localhost:3000/ai/initialize
```

This populates MongoDB with sample email reply patterns for the RAG system.

---

## API Documentation

### Email Endpoints

#### GET `/emails`
Fetch emails with optional filters

**Query Parameters:**
- `q` - Search query (searches subject, sender, content)
- `folder` - Filter by folder (INBOX, Sent, etc.)
- `accountId` - Filter by account email

**Example:**
```bash
GET /emails?q=meeting&folder=INBOX&accountId=user@gmail.com
```

**Response:**
```json
[
  {
    "id": "...",
    "accountId": "user@gmail.com",
    "folder": "INBOX",
    "from": "sender@example.com",
    "to": "user@gmail.com",
    "subject": "Meeting Request",
    "text": "Email content...",
    "date": "2025-01-09T...",
    "label": "Interested",
    "suggestedReply": "Thank you for reaching out..."
  }
]
```

### AI Endpoints

#### GET `/ai/suggest`
Generate AI-powered reply suggestion

**Query Parameters:**
- `q` - Email text to generate reply for

**Example:**
```bash
GET /ai/suggest?q=Are you available for interview tomorrow?
```

**Response:**
```json
{
  "success": true,
  "reply": "I appreciate your interest! I am available for an interview next week. Could you please share some available time slots?",
  "emailText": "Are you available for interview tomorrow?"
}
```

#### POST `/ai/train`
Add custom training data for RAG

**Body:**
```json
{
  "texts": [
    "When asked about pricing: Our rates start at $50/hour...",
    "When asked about availability: I'm available Mon-Fri 9-5..."
  ]
}
```

#### POST `/ai/initialize`
Load sample training data into MongoDB

### Account Endpoints

#### GET `/accounts`
List all configured email accounts

#### POST `/accounts`
Add a new email account

**Body:**
```json
{
  "email": "newuser@gmail.com",
  "imapUser": "newuser@gmail.com",
  "imapPass": "app-password",
  "imapHost": "imap.gmail.com",
  "imapPort": 993
}
```

#### DELETE `/accounts/:id`
Remove an email account

---

## Project Structure

```
Reachinbox-onebox/
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Express server entry point
│   │   ├── models/
│   │   │   ├── account.model.ts     # Account schema
│   │   │   ├── syncState.model.ts   # Sync state tracking
│   │   │   └── trainingKnowledge.model.ts  # RAG training data
│   │   ├── routes/
│   │   │   ├── accounts.ts          # Account management routes
│   │   │   ├── emails.ts            # Email search routes
│   │   │   ├── ai.ts                # AI reply routes
│   │   │   └── reply.ts             # Manual reply routes
│   │   ├── services/
│   │   │   ├── accountManager.ts    # Multi-account handling
│   │   │   ├── imapService.ts       # IMAP sync & monitoring
│   │   │   ├── elasticsearch.ts     # Email indexing
│   │   │   ├── aiCategoriser.ts     # Email categorization
│   │   │   ├── aiReplyService.ts    # RAG implementation
│   │   │   └── notificationService.ts  # Slack/webhook notifications
│   │   └── utils/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Main app component
│   │   ├── components/
│   │   │   ├── GmailLayout.tsx      # Gmail-like layout
│   │   │   ├── EmailList.tsx        # Email list view
│   │   │   ├── EmailDetails.tsx     # Email detail view with AI
│   │   │   ├── AccountManagement.tsx # Account settings
│   │   │   └── Onebox.tsx           # Alternative inbox view
│   │   ├── api/
│   │   │   ├── emailApi.ts          # Email API client
│   │   │   ├── accountApi.ts        # Account API client
│   │   │   └── replyApi.ts          # AI reply API client
│   │   └── main.tsx
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## AI Features

### Email Categorization

Uses GROQ's Llama 3.1 70B model to automatically categorize emails into:

- **Interested** - Positive responses, opportunities
- **Not Interested** - Rejections, no interest
- **Meeting Booked** - Calendar invites, confirmations
- **Follow-up** - Requires response or action
- **Spam** - Promotional, unwanted emails
- **Out of Office** - Auto-replies

**Implementation:**
```typescript
// services/aiCategoriser.ts
const categorizeEmail(emailText: string) => {
  // Sends email text to GROQ API
  // Returns category label
}
```

### AI Reply Suggestions (RAG)

Implements Retrieval-Augmented Generation for context-aware replies:

1. **Embedding Generation**
   - Converts email text to 1536-dimensional vector
   - Uses OpenAI `text-embedding-3-small`

2. **Similarity Search**
   - Retrieves top 3 most similar training examples from MongoDB
   - Uses cosine similarity calculation

3. **Reply Generation**
   - Sends email + relevant context to GPT-4o-mini
   - Generates professional, contextual reply (2-4 sentences)

**Training Data Format:**
```
"When asked about interview availability: I appreciate your interest! 
I am available for an interview next week. Could you please share 
some available time slots? I am flexible with my schedule."
```

**Vector Storage:**
- MongoDB stores text + 1536-dim embedding array
- Efficient similarity search via cosine similarity
- Scalable to thousands of training examples

---

## Configuration

### Gmail Setup

1. Enable 2-Factor Authentication in Gmail
2. Generate App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"
3. Use generated password in `.env` as `IMAP_PASS`

### Elasticsearch Configuration

Default configuration works for local development. For production:

```typescript
// backend/src/services/elasticsearch.ts
const es = new Client({
  node: process.env.ES_NODE,
  auth: {
    username: 'elastic',
    password: 'your-password'
  }
});
```

### MongoDB Configuration

Supports both local and Atlas:

```env
# Local
MONGO_URI=mongodb://localhost:27017/reachinbox

# Atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/reachinbox
```

---

## Development

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

---

## Performance Considerations

- **IMAP**: Real-time monitoring limited to INBOX only to prevent connection timeouts
- **Search**: Elasticsearch provides sub-second search results
- **AI**: Reply generation typically completes in 2-3 seconds
- **Caching**: Consider implementing Redis for frequently accessed data

---

## Security

- Environment variables for sensitive data
- MongoDB connection string encryption
- IMAP credentials stored securely
- API keys never committed to repository
- CORS configured for frontend domain

---

## Future Enhancements

- Email composition and sending
- Email threading and conversations
- Calendar integration
- Multiple language support
- Fine-tuned AI models
- Email templates
- Advanced analytics dashboard
- Mobile application

---

## License

MIT License

---

## Contributors

Assignment submission for ReachInbox

---

## Support

For issues or questions, please refer to the API documentation above or check the inline code comments.
