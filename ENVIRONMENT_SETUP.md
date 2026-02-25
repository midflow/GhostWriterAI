# Environment Configuration & Setup Guide

This document provides complete environment setup instructions for Ghostwriter MVP development.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Firebase Project Setup](#firebase-project-setup)
4. [LLM API Setup](#llm-api-setup)
5. [Local Development Setup](#local-development-setup)
6. [Database Initialization](#database-initialization)
7. [Secrets Management](#secrets-management)
8. [Development vs Production](#development-vs-production)
9. [Troubleshooting](#troubleshooting)
10. [Quick Start Checklist](#quick-start-checklist)

---

## Prerequisites

### System Requirements

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | 18+ | Backend & frontend runtime |
| **npm** | 9+ | Package manager |
| **Git** | 2.40+ | Version control |
| **Docker** | 24+ | Containerization (optional) |
| **Firebase CLI** | 13+ | Firebase management |

### Install Prerequisites

**macOS:**

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Firebase CLI
npm install -g firebase-tools

# Install Git
brew install git
```

**Ubuntu/Debian:**

```bash
# Update package manager
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Firebase CLI
sudo npm install -g firebase-tools

# Install Git
sudo apt install -y git
```

**Windows:**

```powershell
# Install Chocolatey (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs

# Install Firebase CLI
npm install -g firebase-tools

# Install Git
choco install git
```

### Verify Installation

```bash
node --version      # Should be v18+
npm --version       # Should be 9+
git --version       # Should be 2.40+
firebase --version  # Should be 13+
```

---

## Environment Variables

### Backend Environment Variables

**File:** `backend/.env`

```bash
# ============================================
# NODE ENVIRONMENT
# ============================================
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# ============================================
# FIREBASE CONFIGURATION
# ============================================
FIREBASE_PROJECT_ID=ghostwriter-dev
FIREBASE_PRIVATE_KEY=your_private_key_here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@ghostwriter-dev.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://ghostwriter-dev.firebaseio.com
FIREBASE_STORAGE_BUCKET=ghostwriter-dev.appspot.com

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_REFRESH_EXPIRATION=7d

# ============================================
# LLM CONFIGURATION
# ============================================
# Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct

# Groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# Together AI
TOGETHER_API_KEY=your_together_api_key
TOGETHER_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo

# Qwen (Optional)
QWEN_API_KEY=your_qwen_api_key
QWEN_MODEL=qwen-max

# ============================================
# LLM SETTINGS
# ============================================
LLM_TIMEOUT=30000
LLM_MAX_RETRIES=3
LLM_CACHE_TTL=2592000  # 30 days in seconds
LLM_RATE_LIMIT=100     # requests per minute

# ============================================
# STRIPE CONFIGURATION (Optional)
# ============================================
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ============================================
# EMAIL CONFIGURATION (Optional)
# ============================================
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@ghostwriter.app

# ============================================
# SLACK NOTIFICATIONS (Optional)
# ============================================
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
SLACK_BOT_TOKEN=xoxb-your-bot-token

# ============================================
# MONITORING & LOGGING
# ============================================
SENTRY_DSN=https://your_sentry_dsn
DATADOG_API_KEY=your_datadog_api_key
DATADOG_SITE=datadoghq.com

# ============================================
# CORS & SECURITY
# ============================================
CORS_ORIGIN=http://localhost:8081,https://ghostwriter.app
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# DATABASE
# ============================================
FIRESTORE_EMULATOR_HOST=localhost:8080  # For local development
```

### Frontend Environment Variables

**File:** `frontend/.env`

```bash
# ============================================
# ENVIRONMENT
# ============================================
REACT_NATIVE_ENV=development
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000

# ============================================
# FIREBASE CONFIGURATION
# ============================================
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=ghostwriter-dev.firebaseapp.com
FIREBASE_PROJECT_ID=ghostwriter-dev
FIREBASE_STORAGE_BUCKET=ghostwriter-dev.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# ============================================
# APP CONFIGURATION
# ============================================
APP_NAME=Ghostwriter
APP_VERSION=1.0.0
APP_ENVIRONMENT=development

# ============================================
# FEATURE FLAGS
# ============================================
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_STRIPE=false
ENABLE_NOTIFICATIONS=false

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=debug
ENABLE_CONSOLE_LOGS=true
ENABLE_SENTRY=false
SENTRY_DSN=

# ============================================
# ANALYTICS
# ============================================
GOOGLE_ANALYTICS_ID=UA-your-id
MIXPANEL_TOKEN=your_mixpanel_token

# ============================================
# DEVELOPMENT ONLY
# ============================================
ENABLE_REDUX_DEVTOOLS=true
ENABLE_REACT_NATIVE_DEBUGGER=true
MOCK_API=false
```

### Environment Template Files

**Backend:** `backend/.env.example`

```bash
NODE_ENV=development
PORT=3000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
JWT_SECRET=your_jwt_secret_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
GROQ_API_KEY=your_groq_api_key
TOGETHER_API_KEY=your_together_api_key
```

**Frontend:** `frontend/.env.example`

```bash
REACT_NATIVE_ENV=development
API_BASE_URL=http://localhost:3000/api
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
APP_NAME=Ghostwriter
```

---

## Firebase Project Setup

### Step 1: Create Firebase Project

```bash
# Login to Firebase
firebase login

# Create new project
firebase projects:create ghostwriter-dev --display-name="Ghostwriter Dev"

# Set default project
firebase use ghostwriter-dev
```

### Step 2: Initialize Firebase Services

```bash
# Initialize Firebase in project
firebase init firestore
firebase init auth
firebase init storage
firebase init functions

# Select options:
# - Use default settings for Firestore
# - Enable anonymous auth
# - Use default settings for storage
# - Use TypeScript for functions
```

### Step 3: Configure Authentication

```bash
# Enable email/password authentication
firebase auth:enable-provider password

# Enable anonymous authentication
firebase auth:enable-provider anonymous
```

### Step 4: Create Service Account

```bash
# Go to Firebase Console → Project Settings → Service Accounts
# Click "Generate New Private Key"
# Save as backend/firebase-key.json
```

**File:** `backend/firebase-key.json`

```json
{
  "type": "service_account",
  "project_id": "ghostwriter-dev",
  "private_key_id": "your_private_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@ghostwriter-dev.iam.gserviceaccount.com",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Step 5: Deploy Firestore Rules

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

---

## LLM API Setup

### Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create new API key
4. Copy and add to `.env`:

```bash
GEMINI_API_KEY=your_key_here
```

### OpenRouter

1. Go to [OpenRouter](https://openrouter.ai)
2. Sign up for account
3. Go to Keys section
4. Create new API key
5. Add to `.env`:

```bash
OPENROUTER_API_KEY=your_key_here
```

### Groq

1. Go to [Groq Console](https://console.groq.com)
2. Sign up for account
3. Go to API Keys
4. Create new API key
5. Add to `.env`:

```bash
GROQ_API_KEY=your_key_here
```

### Together AI

1. Go to [Together AI](https://www.together.ai)
2. Sign up for account
3. Go to API Keys
4. Create new API key
5. Add to `.env`:

```bash
TOGETHER_API_KEY=your_key_here
```

### Qwen (Optional)

1. Go to [Alibaba Cloud](https://www.aliyun.com)
2. Sign up for account
3. Go to API Keys
4. Create new API key
5. Add to `.env`:

```bash
QWEN_API_KEY=your_key_here
```

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/midflow/GhostWriterAI.git
cd GhostWriterAI
```

### Step 2: Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### Step 3: Setup Environment Files

**Backend:**

```bash
cd backend
cp .env.example .env
# Edit .env with your values
nano .env
```

**Frontend:**

```bash
cd frontend
cp .env.example .env
# Edit .env with your values
nano .env
```

### Step 4: Start Firebase Emulator

```bash
# Install emulator
firebase emulators:install

# Start emulator
firebase emulators:start
```

### Step 5: Start Backend

```bash
cd backend
npm run dev
# Should see: Server running on http://localhost:3000
```

### Step 6: Start Frontend

```bash
cd frontend
npm run dev
# Should see: Metro bundler ready
```

---

## Database Initialization

### Initialize Firestore Collections

**File:** `backend/scripts/init-db.ts`

```typescript
import * as admin from 'firebase-admin';
import * as serviceAccount from '../firebase-key.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

const db = admin.firestore();

async function initializeDatabase() {
  console.log('Initializing Firestore database...');

  try {
    // Create default tone profiles
    const tones = [
      {
        toneName: 'Friendly',
        toneDescription: 'Warm and approachable tone',
        customInstructions: 'Use casual language with emojis'
      },
      {
        toneName: 'Professional',
        toneDescription: 'Formal and business-like tone',
        customInstructions: 'Use formal language without emojis'
      },
      {
        toneName: 'Casual',
        toneDescription: 'Relaxed and informal tone',
        customInstructions: 'Use slang and abbreviations'
      },
      {
        toneName: 'Formal',
        toneDescription: 'Very formal and respectful tone',
        customInstructions: 'Use formal grammar and structure'
      },
      {
        toneName: 'Empathetic',
        toneDescription: 'Compassionate and understanding tone',
        customInstructions: 'Show understanding and support'
      }
    ];

    // Create tone profiles collection
    for (const tone of tones) {
      await db.collection('tone_profiles').add({
        ...tone,
        isDefault: true,
        isActive: true,
        usageCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log('✓ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
```

**Run initialization:**

```bash
cd backend
npx ts-node scripts/init-db.ts
```

---

## Secrets Management

### GitHub Secrets

Store sensitive data in GitHub repository settings:

1. Go to Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:

| Secret | Value |
|--------|-------|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Your Firebase private key |
| `FIREBASE_CLIENT_EMAIL` | Your Firebase client email |
| `JWT_SECRET` | Your JWT secret (min 32 chars) |
| `GEMINI_API_KEY` | Your Gemini API key |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `GROQ_API_KEY` | Your Groq API key |
| `TOGETHER_API_KEY` | Your Together AI API key |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `SENDGRID_API_KEY` | Your SendGrid API key |

### Firebase Secrets Manager

Store secrets in Firebase:

```bash
# Set secret
firebase functions:secrets:set GEMINI_API_KEY

# Access in Cloud Functions
const geminiKey = process.env.GEMINI_API_KEY;
```

### Local Secrets (.env.local)

For local development, use `.env.local` (not committed to git):

```bash
# Create .env.local
cp .env .env.local

# Edit with sensitive values
nano .env.local

# Add to .gitignore
echo ".env.local" >> .gitignore
```

---

## Development vs Production

### Development Configuration

**Backend:**

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
FIRESTORE_EMULATOR_HOST=localhost:8080
ENABLE_CONSOLE_LOGS=true
```

**Frontend:**

```bash
REACT_NATIVE_ENV=development
API_BASE_URL=http://localhost:3000/api
ENABLE_REDUX_DEVTOOLS=true
MOCK_API=false
```

### Production Configuration

**Backend:**

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
ENABLE_CONSOLE_LOGS=false
RATE_LIMIT_MAX_REQUESTS=1000
```

**Frontend:**

```bash
REACT_NATIVE_ENV=production
API_BASE_URL=https://api.ghostwriter.app
ENABLE_REDUX_DEVTOOLS=false
ENABLE_SENTRY=true
```

### Environment-Specific Setup

```bash
# Development
npm run dev:backend
npm run dev:frontend

# Production
npm run build:backend
npm run build:frontend
npm start:backend
npm start:frontend
```

---

## Troubleshooting

### Firebase Emulator Issues

**Issue:** "Port 8080 already in use"

**Solution:**

```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or use different port
firebase emulators:start --firestore-port 9000
```

### LLM API Errors

**Issue:** "API key invalid"

**Solution:**

```bash
# Verify API key
curl -X POST https://api.openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer YOUR_KEY"

# Check quota
firebase functions:log
```

### Database Connection Errors

**Issue:** "Cannot connect to Firestore"

**Solution:**

```bash
# Check Firebase credentials
firebase auth:list

# Verify service account
firebase projects:list

# Check Firestore rules
firebase firestore:rules:status
```

### Node.js Version Issues

**Issue:** "Unsupported Node.js version"

**Solution:**

```bash
# Check Node version
node --version

# Update Node.js
nvm install 18
nvm use 18

# Or update via Homebrew
brew upgrade node
```

---

## Quick Start Checklist

### Pre-Development

- [ ] Install Node.js 18+
- [ ] Install Firebase CLI
- [ ] Clone repository
- [ ] Create Firebase project
- [ ] Create service account key
- [ ] Get API keys (Gemini, OpenRouter, Groq, Together)
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in environment variables
- [ ] Install backend dependencies
- [ ] Install frontend dependencies

### Local Setup

- [ ] Start Firebase emulator
- [ ] Initialize database
- [ ] Start backend server
- [ ] Start frontend app
- [ ] Test API endpoints
- [ ] Test authentication
- [ ] Test LLM integration

### Before Deployment

- [ ] Run all tests
- [ ] Check code coverage
- [ ] Run linter
- [ ] Build backend
- [ ] Build frontend
- [ ] Test production build locally
- [ ] Review security rules
- [ ] Setup monitoring
- [ ] Configure CI/CD

### Deployment

- [ ] Deploy backend to Railway
- [ ] Deploy frontend to EAS
- [ ] Verify production environment
- [ ] Monitor logs
- [ ] Test all features
- [ ] Setup alerts

---

## Next Steps

1. **Complete Quick Start Checklist** - Ensure all prerequisites are met
2. **Setup Firebase Project** - Create and configure Firebase
3. **Get API Keys** - Register for LLM services
4. **Initialize Local Environment** - Setup `.env` files
5. **Start Development** - Begin implementing backend endpoints

