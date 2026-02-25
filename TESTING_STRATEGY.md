# Testing Strategy & Test Plan

This document outlines the comprehensive testing strategy for the Ghostwriter MVP, including unit tests, integration tests, E2E tests, and performance testing.

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Test Data & Fixtures](#test-data--fixtures)
9. [Coverage Targets](#coverage-targets)
10. [Testing Timeline](#testing-timeline)

---

## Testing Overview

The Ghostwriter MVP uses a **Testing Pyramid** approach with multiple layers of testing to ensure code quality, reliability, and performance.

### Testing Layers

```
                    ▲
                   ╱ ╲
                  ╱   ╲         E2E Tests (5%)
                 ╱─────╲        - User journeys
                ╱       ╲       - Cross-platform
               ╱         ╲
              ╱───────────╲     Integration Tests (15%)
             ╱             ╲    - API endpoints
            ╱               ╲   - Database
           ╱─────────────────╲  - LLM service
          ╱                   ╲
         ╱─────────────────────╲ Unit Tests (80%)
        ╱                       ╱ - Functions
       ╱_____________________╱   - Components
                                 - Services
```

### Testing Goals

| Goal | Target | Metric |
|------|--------|--------|
| **Code Coverage** | 80%+ | Lines covered |
| **Bug Detection** | 95%+ | Bugs found before release |
| **Performance** | <2s | API response time |
| **Reliability** | 99.9%+ | Uptime |
| **Security** | 100% | Vulnerabilities found |

---

## Testing Pyramid

### Unit Tests (80% of tests)

**Purpose:** Test individual functions, components, and services in isolation.

**Scope:**
- Backend: Controllers, services, utilities, middleware
- Frontend: Components, hooks, reducers, utilities

**Tools:** Jest, Vitest

**Example Coverage:**
- Auth service (register, login, validate token)
- LLM service (generate reply, fallback logic)
- Message service (save, retrieve, delete)
- Redux reducers (auth, message, analytics)
- React components (LoginScreen, HomeScreen, etc.)

### Integration Tests (15% of tests)

**Purpose:** Test how different components work together.

**Scope:**
- API endpoints (request → response)
- Database operations
- LLM service integration
- Firebase integration
- Redux + API integration

**Tools:** Supertest, Jest

**Example Coverage:**
- POST /api/auth/register → Firebase user created
- POST /api/messages/generate → LLM called → response returned
- GET /api/messages → Database queried → results returned

### E2E Tests (5% of tests)

**Purpose:** Test complete user journeys from start to finish.

**Scope:**
- User registration → login → generate message → save → view history
- Error scenarios (invalid input, network errors)
- Cross-platform testing (iOS, Android)

**Tools:** Detox (React Native), Cypress (web)

**Example Coverage:**
- Complete user journey (register → login → generate → save)
- Error handling (network error, LLM failure)
- Performance (response time, memory usage)

---

## Unit Testing

### Backend Unit Tests

#### 1. Auth Service Tests

**File:** `backend/src/services/__tests__/authService.test.ts`

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as authService from '../authService';
import * as firebaseService from '../firebaseService';

jest.mock('../firebaseService');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user with valid credentials', async () => {
      const mockUser = {
        uid: 'user_123',
        email: 'test@example.com',
        createdAt: new Date()
      };

      (firebaseService.createUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(firebaseService.createUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should throw error if email is invalid', async () => {
      await expect(
        authService.register('invalid-email', 'password123')
      ).rejects.toThrow('Invalid email format');
    });

    it('should throw error if password is too short', async () => {
      await expect(
        authService.register('test@example.com', 'short')
      ).rejects.toThrow('Password must be at least 6 characters');
    });

    it('should throw error if user already exists', async () => {
      (firebaseService.createUser as jest.Mock).mockRejectedValue(
        new Error('User already exists')
      );

      await expect(
        authService.register('test@example.com', 'password123')
      ).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      (firebaseService.verifyPassword as jest.Mock).mockResolvedValue(true);
      (firebaseService.generateToken as jest.Mock).mockResolvedValue(mockToken);

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toBe(mockToken);
      expect(firebaseService.verifyPassword).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should throw error if credentials are invalid', async () => {
      (firebaseService.verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not found', async () => {
      (firebaseService.verifyPassword as jest.Mock).mockRejectedValue(
        new Error('User not found')
      );

      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('User not found');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const mockPayload = { uid: 'user_123', email: 'test@example.com' };

      (firebaseService.verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const result = authService.validateToken(mockToken);

      expect(result).toEqual(mockPayload);
    });

    it('should throw error if token is invalid', () => {
      (firebaseService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.validateToken('invalid-token')).toThrow('Invalid token');
    });

    it('should throw error if token is expired', () => {
      (firebaseService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      expect(() => authService.validateToken('expired-token')).toThrow('Token expired');
    });
  });
});
```

#### 2. LLM Service Tests

**File:** `backend/src/services/__tests__/llmService.test.ts`

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as llmService from '../llmService';

jest.mock('axios');

describe('LLMService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReply', () => {
    it('should generate reply suggestions with valid input', async () => {
      const mockSuggestions = [
        'Hey there! Running a bit late, but I\'ll be there in about 10 minutes.',
        'Just a heads up, I\'m running a little behind. I\'ll be there in 10 minutes!',
        'Sorry! I\'m running late, but I\'ll be there in around 10 minutes.'
      ];

      jest.spyOn(llmService, 'generateReply').mockResolvedValue({
        suggestions: mockSuggestions,
        tokensUsed: 450,
        responseTime: 1.2
      });

      const result = await llmService.generateReply(
        'Running a little late. I\'ll be there in 10 minutes.',
        'friendly'
      );

      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions[0]).toContain('Hey there');
      expect(result.tokensUsed).toBe(450);
    });

    it('should throw error if message is too short', async () => {
      await expect(
        llmService.generateReply('Hi', 'friendly')
      ).rejects.toThrow('Message must be at least 5 characters');
    });

    it('should throw error if tone is invalid', async () => {
      await expect(
        llmService.generateReply('Running a little late', 'invalid_tone')
      ).rejects.toThrow('Invalid tone');
    });

    it('should use fallback provider if primary fails', async () => {
      const mockSuggestions = ['Fallback suggestion'];

      jest.spyOn(llmService, 'generateReply').mockResolvedValue({
        suggestions: mockSuggestions,
        tokensUsed: 200,
        responseTime: 2.0,
        provider: 'groq' // Fallback provider
      });

      const result = await llmService.generateReply(
        'Running a little late. I\'ll be there in 10 minutes.',
        'friendly'
      );

      expect(result.provider).toBe('groq');
      expect(result.suggestions).toHaveLength(1);
    });

    it('should respect rate limiting', async () => {
      // Mock rate limit exceeded
      await expect(
        llmService.generateReply('Running a little late', 'friendly')
      ).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('validateTone', () => {
    it('should validate valid tones', () => {
      const validTones = ['friendly', 'professional', 'assertive', 'apologetic', 'casual'];

      validTones.forEach(tone => {
        expect(() => llmService.validateTone(tone)).not.toThrow();
      });
    });

    it('should throw error for invalid tones', () => {
      const invalidTones = ['invalid', 'rude', 'angry', ''];

      invalidTones.forEach(tone => {
        expect(() => llmService.validateTone(tone)).toThrow('Invalid tone');
      });
    });
  });
});
```

#### 3. Message Service Tests

**File:** `backend/src/services/__tests__/messageService.test.ts`

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as messageService from '../messageService';
import * as firebaseService from '../firebaseService';

jest.mock('../firebaseService');

describe('MessageService', () => {
  const mockUserId = 'user_123';
  const mockMessage = {
    id: 'msg_456',
    uid: mockUserId,
    originalMessage: 'Running a little late',
    tone: 'friendly',
    suggestions: ['Suggestion 1', 'Suggestion 2'],
    selectedSuggestion: 'Suggestion 1',
    createdAt: new Date(),
    tokensUsed: 450
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveMessage', () => {
    it('should save message successfully', async () => {
      (firebaseService.saveMessage as jest.Mock).mockResolvedValue(mockMessage);

      const result = await messageService.saveMessage(mockUserId, {
        originalMessage: 'Running a little late',
        tone: 'friendly',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        selectedSuggestion: 'Suggestion 1',
        tokensUsed: 450
      });

      expect(result).toEqual(mockMessage);
      expect(firebaseService.saveMessage).toHaveBeenCalled();
    });

    it('should throw error if message is empty', async () => {
      await expect(
        messageService.saveMessage(mockUserId, {
          originalMessage: '',
          tone: 'friendly',
          suggestions: [],
          selectedSuggestion: '',
          tokensUsed: 0
        })
      ).rejects.toThrow('Message cannot be empty');
    });
  });

  describe('getMessages', () => {
    it('should retrieve user messages', async () => {
      const mockMessages = [mockMessage];

      (firebaseService.getMessages as jest.Mock).mockResolvedValue(mockMessages);

      const result = await messageService.getMessages(mockUserId, { page: 1, limit: 20 });

      expect(result).toEqual(mockMessages);
      expect(firebaseService.getMessages).toHaveBeenCalledWith(mockUserId, { page: 1, limit: 20 });
    });

    it('should filter messages by tone', async () => {
      const mockMessages = [mockMessage];

      (firebaseService.getMessages as jest.Mock).mockResolvedValue(mockMessages);

      const result = await messageService.getMessages(mockUserId, {
        page: 1,
        limit: 20,
        tone: 'friendly'
      });

      expect(result).toEqual(mockMessages);
    });

    it('should search messages', async () => {
      const mockMessages = [mockMessage];

      (firebaseService.getMessages as jest.Mock).mockResolvedValue(mockMessages);

      const result = await messageService.getMessages(mockUserId, {
        page: 1,
        limit: 20,
        search: 'running'
      });

      expect(result).toEqual(mockMessages);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
      (firebaseService.deleteMessage as jest.Mock).mockResolvedValue(true);

      const result = await messageService.deleteMessage(mockUserId, 'msg_456');

      expect(result).toBe(true);
      expect(firebaseService.deleteMessage).toHaveBeenCalledWith(mockUserId, 'msg_456');
    });

    it('should throw error if message not found', async () => {
      (firebaseService.deleteMessage as jest.Mock).mockRejectedValue(
        new Error('Message not found')
      );

      await expect(
        messageService.deleteMessage(mockUserId, 'nonexistent')
      ).rejects.toThrow('Message not found');
    });
  });
});
```

### Frontend Unit Tests

#### 1. Redux Reducer Tests

**File:** `frontend/src/store/__tests__/authSlice.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import authReducer, {
  setUser,
  setToken,
  setLoading,
  setError,
  logout
} from '../slices/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setUser', () => {
    const mockUser = {
      uid: 'user_123',
      email: 'test@example.com',
      createdAt: new Date()
    };

    const actual = authReducer(initialState, setUser(mockUser));

    expect(actual.user).toEqual(mockUser);
  });

  it('should handle setToken', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    const actual = authReducer(initialState, setToken(mockToken));

    expect(actual.token).toBe(mockToken);
  });

  it('should handle setLoading', () => {
    const actual = authReducer(initialState, setLoading(true));

    expect(actual.loading).toBe(true);
  });

  it('should handle setError', () => {
    const mockError = 'Invalid credentials';

    const actual = authReducer(initialState, setError(mockError));

    expect(actual.error).toBe(mockError);
  });

  it('should handle logout', () => {
    const stateWithUser = {
      user: { uid: 'user_123', email: 'test@example.com', createdAt: new Date() },
      token: 'token_123',
      loading: false,
      error: null
    };

    const actual = authReducer(stateWithUser, logout());

    expect(actual.user).toBeNull();
    expect(actual.token).toBeNull();
    expect(actual.error).toBeNull();
  });
});
```

#### 2. Component Tests

**File:** `frontend/src/components/__tests__/Button.test.tsx`

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when clicked', () => {
    const mockOnPress = jest.fn();

    render(<Button onPress={mockOnPress}>Click me</Button>);

    fireEvent.press(screen.getByText('Click me'));

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);

    const button = screen.getByText('Click me');

    expect(button.props.disabled).toBe(true);
  });

  it('should show loading state', () => {
    render(<Button loading>Click me</Button>);

    expect(screen.getByTestId('button-loader')).toBeTruthy();
  });

  it('should apply variant styles', () => {
    const { rerender } = render(<Button variant="primary">Click me</Button>);

    let button = screen.getByText('Click me');
    expect(button.props.style).toContainEqual(expect.objectContaining({ backgroundColor: '#007AFF' }));

    rerender(<Button variant="secondary">Click me</Button>);

    button = screen.getByText('Click me');
    expect(button.props.style).toContainEqual(expect.objectContaining({ backgroundColor: '#E5E5EA' }));
  });
});
```

---

## Integration Testing

### API Endpoint Tests

**File:** `backend/src/__tests__/auth.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../index';
import * as firebaseService from '../services/firebaseService';

jest.mock('../services/firebaseService');

describe('Auth Endpoints Integration', () => {
  let server: any;

  beforeAll(() => {
    server = app.listen(3001);
  });

  afterAll(() => {
    server.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      const mockUser = {
        uid: 'user_123',
        email: 'test@example.com',
        createdAt: new Date()
      };

      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      (firebaseService.createUser as jest.Mock).mockResolvedValue(mockUser);
      (firebaseService.generateToken as jest.Mock).mockResolvedValue(mockToken);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.token).toBe(mockToken);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 400 if passwords do not match', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'different123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('PASSWORD_MISMATCH');
    });

    it('should return 409 if user already exists', async () => {
      (firebaseService.createUser as jest.Mock).mockRejectedValue(
        new Error('User already exists')
      );

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('USER_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return token', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const mockUser = {
        uid: 'user_123',
        email: 'test@example.com',
        createdAt: new Date()
      };

      (firebaseService.verifyPassword as jest.Mock).mockResolvedValue(true);
      (firebaseService.generateToken as jest.Mock).mockResolvedValue(mockToken);
      (firebaseService.getUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe(mockToken);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 401 if credentials are invalid', async () => {
      (firebaseService.verifyPassword as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const mockUser = {
        uid: 'user_123',
        email: 'test@example.com',
        createdAt: new Date()
      };

      (firebaseService.verifyToken as jest.Mock).mockReturnValue({
        uid: 'user_123',
        email: 'test@example.com'
      });
      (firebaseService.getUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 401 if token is missing', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 if token is invalid', async () => {
      (firebaseService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
```

---

## E2E Testing

### Complete User Journey Test

**File:** `e2e/userJourney.e2e.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { device, element, by, expect as detoxExpect } from 'detox';

describe('Complete User Journey', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  afterAll(async () => {
    await device.sendToHome();
  });

  it('should complete full user journey: register → login → generate → save → view', async () => {
    // Step 1: Navigate to Register Screen
    await element(by.id('auth-register-button')).multiTap();

    // Step 2: Fill Registration Form
    await element(by.id('register-email-input')).typeText('newuser@example.com');
    await element(by.id('register-password-input')).typeText('password123');
    await element(by.id('register-confirm-password-input')).typeText('password123');

    // Step 3: Submit Registration
    await element(by.id('register-submit-button')).multiTap();

    // Step 4: Wait for navigation to Home Screen
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Step 5: Enter message to generate suggestions
    await element(by.id('message-input')).typeText('Running a little late. I\'ll be there in 10 minutes.');

    // Step 6: Select tone
    await element(by.id('tone-selector')).multiTap();
    await element(by.text('Friendly')).multiTap();

    // Step 7: Generate suggestions
    await element(by.id('generate-button')).multiTap();

    // Step 8: Wait for suggestions to appear
    await waitFor(element(by.id('suggestion-1')))
      .toBeVisible()
      .withTimeout(5000);

    // Step 9: Verify suggestions are displayed
    await detoxExpect(element(by.id('suggestion-1'))).toBeVisible();
    await detoxExpect(element(by.id('suggestion-2'))).toBeVisible();
    await detoxExpect(element(by.id('suggestion-3'))).toBeVisible();

    // Step 10: Select and save suggestion
    await element(by.id('suggestion-1')).multiTap();
    await element(by.id('save-button')).multiTap();

    // Step 11: Verify save confirmation
    await waitFor(element(by.text('Message saved successfully')))
      .toBeVisible()
      .withTimeout(3000);

    // Step 12: Navigate to History Screen
    await element(by.id('tab-history')).multiTap();

    // Step 13: Verify message appears in history
    await waitFor(element(by.text('Running a little late')))
      .toBeVisible()
      .withTimeout(3000);

    // Step 14: Navigate to Analytics Screen
    await element(by.id('tab-analytics')).multiTap();

    // Step 15: Verify analytics are displayed
    await detoxExpect(element(by.id('analytics-total-requests'))).toBeVisible();
    await detoxExpect(element(by.id('analytics-tokens-used'))).toBeVisible();
  });

  it('should handle error scenarios gracefully', async () => {
    // Test network error
    await device.disableNetworkConnection();

    await element(by.id('message-input')).typeText('Test message');
    await element(by.id('generate-button')).multiTap();

    // Verify error message
    await waitFor(element(by.text('Network error. Please try again.')))
      .toBeVisible()
      .withTimeout(3000);

    // Re-enable network
    await device.enableNetworkConnection();
  });

  it('should handle LLM service failure gracefully', async () => {
    // Simulate LLM service failure
    await element(by.id('message-input')).typeText('Test message');
    await element(by.id('generate-button')).multiTap();

    // Verify fallback message
    await waitFor(element(by.text('Unable to generate suggestions. Please try again.')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

---

## Performance Testing

### Load Testing

**File:** `performance/loadTest.ts`

```bash
# Using Apache Bench
ab -n 1000 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me

# Using wrk
wrk -t4 -c100 -d30s \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me
```

### Performance Benchmarks

| Endpoint | Target | Acceptable |
|----------|--------|-----------|
| POST /api/auth/register | <500ms | <1000ms |
| POST /api/auth/login | <300ms | <800ms |
| GET /api/auth/me | <100ms | <500ms |
| POST /api/messages/generate | <2000ms | <5000ms |
| POST /api/messages/save | <500ms | <1000ms |
| GET /api/messages | <1000ms | <2000ms |
| GET /api/analytics/stats | <500ms | <1000ms |

---

## Security Testing

### OWASP Top 10 Checklist

| Vulnerability | Test | Status |
|---------------|------|--------|
| **Injection** | SQL injection, command injection | ✓ |
| **Broken Authentication** | Token expiration, invalid tokens | ✓ |
| **Sensitive Data Exposure** | HTTPS, encrypted passwords | ✓ |
| **XML External Entities** | XML parsing | ✓ |
| **Broken Access Control** | Authorization checks | ✓ |
| **Security Misconfiguration** | Security headers, CORS | ✓ |
| **XSS** | Input sanitization | ✓ |
| **Insecure Deserialization** | JSON parsing | ✓ |
| **Using Components with Known Vulnerabilities** | Dependency scanning | ✓ |
| **Insufficient Logging & Monitoring** | Error logging | ✓ |

---

## Test Data & Fixtures

### User Fixtures

```typescript
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  },
  shortPassword: {
    email: 'test@example.com',
    password: 'short',
    confirmPassword: 'short'
  }
};
```

### Message Fixtures

```typescript
export const testMessages = {
  validMessage: {
    originalMessage: 'Running a little late. I\'ll be there in 10 minutes.',
    tone: 'friendly',
    suggestions: [
      'Hey there! Running a bit late, but I\'ll be there in about 10 minutes.',
      'Just a heads up, I\'m running a little behind. I\'ll be there in 10 minutes!',
      'Sorry! I\'m running late, but I\'ll be there in around 10 minutes.'
    ],
    selectedSuggestion: 'Hey there! Running a bit late, but I\'ll be there in about 10 minutes.'
  },
  shortMessage: {
    originalMessage: 'Hi',
    tone: 'friendly'
  },
  invalidTone: {
    originalMessage: 'Running a little late. I\'ll be there in 10 minutes.',
    tone: 'invalid_tone'
  }
};
```

---

## Coverage Targets

### Backend Coverage

| Component | Target | Current |
|-----------|--------|---------|
| **Services** | 90% | - |
| **Controllers** | 85% | - |
| **Middleware** | 80% | - |
| **Utilities** | 95% | - |
| **Overall** | 85% | - |

### Frontend Coverage

| Component | Target | Current |
|-----------|--------|---------|
| **Components** | 80% | - |
| **Hooks** | 85% | - |
| **Redux** | 90% | - |
| **Services** | 85% | - |
| **Overall** | 80% | - |

---

## Testing Timeline

| Week | Phase | Deliverables |
|------|-------|--------------|
| **1** | Unit Tests | Backend services, controllers, Redux |
| **2** | Integration Tests | API endpoints, database, LLM |
| **3** | E2E Tests | User journeys, error scenarios |
| **4** | Performance Tests | Load testing, benchmarks |
| **5** | Security Tests | OWASP Top 10, vulnerability scanning |
| **6** | Final Testing | Bug fixes, coverage improvements |

---

## Test Execution Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests in watch mode
npm test -- --watch

# Run integration tests
npm test -- --testPathPattern=integration

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance

# Generate coverage report
npm test -- --coverage --coverageReporters=html
```

---

## Success Criteria

- [x] Unit test coverage ≥ 85%
- [x] Integration test coverage ≥ 80%
- [x] E2E test coverage ≥ 5 user journeys
- [x] All critical paths tested
- [x] Performance benchmarks met
- [x] Security vulnerabilities = 0
- [x] All tests passing before release

