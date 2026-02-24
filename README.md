# Ghostwriter MVP - Starter Kit

A complete, production-ready starter kit for building Ghostwriter - an AI-powered reply suggestion app for mobile devices.

## What's Included

✅ **Backend (Express.js + TypeScript)**
- Firebase authentication and database integration
- LLM service with hybrid strategy (Gemini, OpenRouter, Groq, Qwen)
- Message generation and management endpoints
- Analytics and usage tracking
- Caching layer for performance
- Error handling and middleware

✅ **Frontend (React Native + Redux)**
- Redux store with auth, messages, and analytics slices
- API service with axios and token management
- Secure storage for auth tokens
- TypeScript types for all data structures
- Ready-to-implement screen templates

✅ **Configuration**
- Environment templates for backend and frontend
- Firebase configuration
- LLM API setup
- CORS and rate limiting

✅ **Documentation**
- Quick start guide
- API endpoint documentation
- Setup instructions
- Troubleshooting guide

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- LLM API keys (Gemini, OpenRouter, Groq)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### 3. Create Screens

Implement the following screens in `frontend/src/screens/`:
- `LoginScreen.tsx` - User authentication
- `HomeScreen.tsx` - Message input and tone selection
- `ResultScreen.tsx` - Display suggestions
- `HistoryScreen.tsx` - View saved messages
- `AnalyticsScreen.tsx` - Usage statistics

See `QUICK_START.md` for detailed examples.

## Project Structure

```
ghostwriter-starter/
├── backend/
│   ├── src/
│   │   ├── config/       # Firebase setup
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, errors
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # LLM, Firebase, cache
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # Server entry
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── screens/      # App screens (to create)
│   │   ├── components/   # Reusable UI (to create)
│   │   ├── services/     # API, storage
│   │   ├── store/        # Redux store
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # App entry (to create)
│   ├── app.json
│   ├── package.json
│   └── .env.example
│
├── QUICK_START.md        # Detailed setup guide
└── README.md             # This file
```

## Features

### Backend
- **Authentication**: Firebase Auth + JWT tokens
- **LLM Integration**: Gemini, OpenRouter, Groq, Qwen with fallback
- **Message Management**: Generate, save, retrieve, delete messages
- **Analytics**: Track usage, tone breakdown, cost estimation
- **Caching**: In-memory cache with TTL for performance
- **Error Handling**: Global error handler with proper HTTP status codes
- **Rate Limiting**: Prevent abuse with configurable limits

### Frontend
- **Redux State Management**: Auth, messages, analytics
- **API Service**: Axios client with token management
- **Secure Storage**: Encrypted token storage
- **TypeScript**: Full type safety
- **Responsive Design**: Mobile-first approach

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Messages
- `POST /api/messages/generate-reply` - Generate suggestions
- `POST /api/messages` - Save message
- `GET /api/messages` - Get messages (paginated)
- `DELETE /api/messages/:id` - Delete message
- `GET /api/messages/search` - Search messages

### Analytics
- `GET /api/analytics` - Get usage stats
- `GET /api/analytics/tone-breakdown` - Tone usage
- `GET /api/analytics/cost` - Cost estimation
- `GET /api/analytics/daily` - Daily stats

## Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_DB_URL=https://your-project.firebaseio.com
GEMINI_API_KEY=your-gemini-key
OPENROUTER_API_KEY=your-openrouter-key
GROQ_API_KEY=your-groq-key
JWT_SECRET=your-secret
```

**Frontend (.env)**
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_TIMEOUT=10000
```

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend Development
```bash
cd frontend
npm start            # Start Expo dev server
npm run android      # Run on Android emulator
npm run ios          # Run on iOS simulator
npm run web          # Run in web browser
```

## Deployment

### Backend
```bash
# Using Railway
railway link
railway up

# Or using Render
# Connect GitHub repo and deploy
```

### Frontend
```bash
# Build for iOS
eas build --platform ios --profile preview

# Build for Android
eas build --platform android --profile preview

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## Cost Estimation

### Development
- Google Play Store: $25 (one-time)
- Apple Developer: $99/year (optional for MVP)
- Domain: $10/year (optional)
- **Total: $35-135**

### Monthly Operations
- LLM API: $0-5 (using free tier or Qwen)
- Firebase: $0-5 (free tier)
- Hosting: $0 (Railway/Render free tier)
- **Total: $0-10/month**

## Troubleshooting

### Backend Issues
- Check Node.js version: `node --version`
- Check Firebase credentials
- Check port 3000 availability
- Check API keys in .env

### Frontend Issues
- Check API URL in .env
- Verify backend is running
- Check CORS configuration
- Clear node_modules: `rm -rf node_modules && npm install`

### LLM Issues
- Verify API keys are correct
- Check API rate limits
- Check internet connection
- Check API status pages

## Next Steps

1. **Implement screens** - Create all 5 screens (see QUICK_START.md)
2. **Add styling** - Professional design system
3. **Add animations** - Smooth transitions
4. **Test thoroughly** - Manual and automated testing
5. **Submit to stores** - Google Play and TestFlight
6. **Launch** - Product Hunt, Reddit, Twitter
7. **Iterate** - Based on user feedback

## Resources

- [Express.js Docs](https://expressjs.com/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Expo Docs](https://docs.expo.dev/)

## License

MIT

## Support

For help:
1. Check QUICK_START.md for detailed setup
2. Check troubleshooting section
3. Review API documentation
4. Check Firebase console for errors

---

**Ready to build? Start with `QUICK_START.md`!** 🚀
