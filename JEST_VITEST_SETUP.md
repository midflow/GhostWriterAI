# Jest & Vitest Configuration Guide

This document provides complete Jest and Vitest configuration for backend and frontend testing.

---

## Table of Contents

1. [Backend Jest Setup](#backend-jest-setup)
2. [Frontend Vitest Setup](#frontend-vitest-setup)
3. [Configuration Files](#configuration-files)
4. [Running Tests](#running-tests)
5. [Coverage Reports](#coverage-reports)

---

## Backend Jest Setup

### Installation

```bash
cd backend

npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Jest Configuration

**File:** `backend/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/config/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 10000,
  verbose: true,
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }
  }
};
```

### Jest Setup File

**File:** `backend/src/__tests__/setup.ts`

```typescript
// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_PRIVATE_KEY = 'test-key';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: jest.fn(() => ({
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    getUser: jest.fn(),
    verifyIdToken: jest.fn()
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn()
  }))
}));

// Global test utilities
global.testUtils = {
  generateTestToken: (uid: string, email: string) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { uid, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
};
```

### Package.json Scripts

**File:** `backend/package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

---

## Frontend Vitest Setup

### Installation

```bash
cd frontend

npm install --save-dev vitest @vitest/ui @testing-library/react-native @testing-library/jest-native
```

### Vitest Configuration

**File:** `frontend/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Vitest Setup File

**File:** `frontend/src/__tests__/setup.ts`

```typescript
import '@testing-library/jest-native/extend-expect';
import { expect, afterEach, vi } from 'vitest';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn()
  }),
  useRoute: () => ({
    params: {}
  })
}));

// Mock Redux
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector: any) => selector({
    auth: { user: null, token: null },
    message: { messages: [], current: null },
    analytics: { stats: null }
  })
}));

// Setup global test utilities
global.testUtils = {
  createMockUser: () => ({
    uid: 'user_123',
    email: 'test@example.com',
    createdAt: new Date()
  }),
  createMockMessage: () => ({
    id: 'msg_456',
    uid: 'user_123',
    originalMessage: 'Running a little late',
    tone: 'friendly',
    suggestions: ['Suggestion 1', 'Suggestion 2'],
    selectedSuggestion: 'Suggestion 1',
    createdAt: new Date(),
    tokensUsed: 450
  })
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
```

### Package.json Scripts

**File:** `frontend/package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:debug": "vitest --inspect-brk --inspect --single-thread"
  }
}
```

---

## Configuration Files

### Backend tsconfig.json for Tests

**File:** `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["jest", "node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Frontend tsconfig.json for Tests

**File:** `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vitest/globals", "@testing-library/jest-native"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Running Tests

### Backend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/__tests__/auth.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="register"

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Debug tests
npm run test:debug
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/__tests__/Button.test.tsx

# Run tests matching pattern
npm test -- --grep "Button"

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Debug tests
npm run test:debug
```

---

## Coverage Reports

### Generate Coverage Report

```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

### View Coverage Report

```bash
# Backend
open coverage/index.html

# Frontend
open coverage/index.html
```

### Coverage Thresholds

**Backend:** `backend/jest.config.js`

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/services/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

**Frontend:** `frontend/vitest.config.ts`

```typescript
coverage: {
  lines: 80,
  functions: 80,
  branches: 80,
  statements: 80
}
```

---

## Test Examples

### Backend Unit Test Example

**File:** `backend/src/__tests__/services/authService.test.ts`

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as authService from '../../services/authService';
import * as firebaseService from '../../services/firebaseService';

jest.mock('../../services/firebaseService');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    const mockUser = {
      uid: 'user_123',
      email: 'test@example.com'
    };

    (firebaseService.createUser as jest.Mock).mockResolvedValue(mockUser);

    const result = await authService.register('test@example.com', 'password123');

    expect(result).toEqual(mockUser);
    expect(firebaseService.createUser).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
```

### Frontend Component Test Example

**File:** `frontend/src/__tests__/components/Button.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Button from '../../components/Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when clicked', () => {
    const mockOnPress = vi.fn();

    render(<Button onPress={mockOnPress}>Click me</Button>);

    fireEvent.press(screen.getByText('Click me'));

    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm install
      
      - name: Run tests
        run: cd backend && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Run tests
        run: cd frontend && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
```

---

## Troubleshooting

### Common Issues

**Issue:** Tests timeout

**Solution:** Increase timeout in jest.config.js or vitest.config.ts:

```javascript
testTimeout: 10000 // 10 seconds
```

**Issue:** Module not found errors

**Solution:** Check path aliases in tsconfig.json and jest/vitest config

**Issue:** Mocks not working

**Solution:** Ensure jest.mock() is called before imports:

```typescript
jest.mock('../service');
import * as service from '../service';
```

**Issue:** Coverage not generated

**Solution:** Check collectCoverageFrom pattern in jest.config.js

