# Ghostwriter MVP - Quick Start Guide

This is a complete, production-ready starter kit for the Ghostwriter app. Follow these steps to get started.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn
- Firebase account ([Create free account](https://firebase.google.com/))
- LLM API keys:
  - Google Gemini (free) - [Get key](https://ai.google.dev/)
  - OpenRouter (free) - [Get key](https://openrouter.ai/)
  - Groq (free) - [Get key](https://console.groq.com/)

## Project Structure

```
ghostwriter-starter/
├── backend/              # Express.js API
│   ├── src/
│   │   ├── config/       # Firebase configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, error handling
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # LLM, Firebase, cache
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/             # React Native app
│   ├── src/
│   │   ├── screens/      # App screens (to be created)
│   │   ├── components/   # Reusable components (to be created)
│   │   ├── services/     # API client, storage
│   │   ├── store/        # Redux store
│   │   └── types/        # TypeScript types
│   ├── app.json
│   ├── package.json
│   └── .env.example
│
└── QUICK_START.md        # This file
```

## Step 1: Backend Setup

### 1.1 Install dependencies

```bash
cd backend
npm install
```

### 1.2 Configure Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Create a service account:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file

3. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

4. Update `.env` with your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_DB_URL=https://your-project.firebaseio.com

GEMINI_API_KEY=your-gemini-key
OPENROUTER_API_KEY=your-openrouter-key
GROQ_API_KEY=your-groq-key
```

### 1.3 Start development server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
```

### 1.4 Test the API

```bash
# Health check
curl http://localhost:3000/health

# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Generate reply
curl -X POST http://localhost:3000/api/messages/generate-reply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message":"Hey, how are you?",
    "tone":"friendly",
    "recentMessages":[]
  }'
```

## Step 2: Frontend Setup

### 2.1 Install dependencies

```bash
cd frontend
npm install
```

### 2.2 Configure environment

```bash
cp .env.example .env
```

Update `.env` with your API URL:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 2.3 Start development server

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser

## Step 3: Create Frontend Screens

The frontend structure is ready, but you need to create the screens. Here's what to create:

### 3.1 Login Screen (`src/screens/LoginScreen.tsx`)

```typescript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import apiService from '../services/api';
import storageService from '../services/storage';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      const { token, uid } = response.data;

      // Save token and user info
      await storageService.saveAuthToken(token);
      await storageService.saveUserInfo(uid, email);

      // Update Redux state
      dispatch(setUser({ user: { uid, email }, token }));

      navigation.replace('Home');
    } catch (error: any) {
      alert('Login failed: ' + error.response?.data?.error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ghostwriter</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15,
  },
});
```

### 3.2 Home Screen (`src/screens/HomeScreen.tsx`)

```typescript
import React, { useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import apiService from '../services/api';
import { TONES, TONE_DESCRIPTIONS } from '../types/index';

export default function HomeScreen({ navigation }: any) {
  const [message, setMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState('friendly');
  const [loading, setLoading] = useState(false);
  const { recentMessages } = useSelector((state: any) => state.messages);

  const handleGenerateReply = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.generateReply(
        message,
        selectedTone,
        recentMessages
      );

      navigation.navigate('Result', {
        suggestions: response.data.suggestions,
        originalMessage: message,
        tone: selectedTone,
      });
    } catch (error: any) {
      alert('Error: ' + error.response?.data?.error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>What do you need to reply to?</Text>

      <TextInput
        style={styles.messageInput}
        placeholder="Paste the message here..."
        multiline
        numberOfLines={4}
        value={message}
        onChangeText={setMessage}
        editable={!loading}
      />

      <Text style={styles.sectionTitle}>Choose a tone:</Text>
      <View style={styles.toneContainer}>
        {TONES.map(tone => (
          <TouchableOpacity
            key={tone}
            style={[
              styles.toneButton,
              selectedTone === tone && styles.toneButtonActive,
            ]}
            onPress={() => setSelectedTone(tone)}
            disabled={loading}
          >
            <Text style={styles.toneButtonText}>
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </Text>
            <Text style={styles.toneDescription}>
              {TONE_DESCRIPTIONS[tone as any]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.generateButton, loading && styles.generateButtonDisabled]}
        onPress={handleGenerateReply}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.generateButtonText}>Generate Suggestions</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  toneContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  toneButton: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  toneButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toneButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toneDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## Step 4: Build & Deploy

### 4.1 Build for iOS

```bash
cd frontend
eas build --platform ios --profile preview
```

### 4.2 Build for Android

```bash
cd frontend
eas build --platform android --profile preview
```

### 4.3 Deploy backend

```bash
# Using Railway
railway link
railway up

# Or using Render
# Deploy from GitHub
```

## API Endpoints

### Auth

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Messages

- `POST /api/messages/generate-reply` - Generate reply suggestions
- `POST /api/messages` - Save a message
- `GET /api/messages` - Get user messages
- `DELETE /api/messages/:messageId` - Delete a message
- `GET /api/messages/search` - Search messages

### Analytics

- `GET /api/analytics` - Get user analytics
- `GET /api/analytics/tone-breakdown` - Get tone breakdown
- `GET /api/analytics/cost` - Get cost estimation
- `GET /api/analytics/daily` - Get daily stats

## Troubleshooting

### Backend won't start

1. Check Node.js version: `node --version` (should be 18+)
2. Check Firebase credentials in `.env`
3. Check port 3000 is not in use: `lsof -i :3000`

### Frontend won't connect to backend

1. Check API URL in `.env`: `EXPO_PUBLIC_API_URL=http://localhost:3000`
2. Check backend is running: `curl http://localhost:3000/health`
3. Check CORS settings in backend

### LLM API errors

1. Check API keys in `.env`
2. Check API rate limits
3. Check internet connection

## Next Steps

1. **Complete frontend screens** - Create all 5 screens (Login, Home, Result, History, Analytics)
2. **Add styling** - Implement professional design
3. **Add animations** - Smooth transitions and loading states
4. **Test thoroughly** - Manual testing on iOS/Android
5. **Submit to app stores** - Google Play and TestFlight
6. **Launch and market** - Product Hunt, Reddit, Twitter

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Check API logs: `npm run dev` (backend)
3. Check console logs: `npm start` (frontend)
4. Check Firebase console for database errors

Good luck! 🚀
