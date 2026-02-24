# Ghostwriter API Documentation

## Overview

The Ghostwriter API provides endpoints for user authentication, message generation, and analytics. All endpoints require authentication via JWT tokens (except login/register endpoints).

**Base URL:** `https://api.ghostwriter.app` (Production) | `http://localhost:3000` (Development)

**API Version:** 1.0.0

**Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Messages](#messages)
3. [Analytics](#analytics)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

---

## Authentication

### Overview

The Ghostwriter API uses JWT (JSON Web Tokens) for authentication. Users must obtain a token via the login endpoint and include it in the `Authorization` header for all subsequent requests.

### Token Format

```
Authorization: Bearer <JWT_TOKEN>
```

### Token Expiration

- **Access Token Lifetime:** 24 hours
- **Refresh Token Lifetime:** 30 days
- **Token Type:** HS256 (HMAC with SHA-256)

### Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Validation Rules:**

| Field | Rule | Error Code |
|-------|------|-----------|
| **email** | Valid email format (RFC 5322) | `INVALID_EMAIL` |
| **password** | Minimum 6 characters | `PASSWORD_TOO_SHORT` |
| **confirmPassword** | Must match password | `PASSWORD_MISMATCH` |
| **email** | Must not exist in database | `USER_EXISTS` |

**Success Response (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c2VyXzEyM2FiYyIsImlhdCI6MTY0NTY0MDIwMCwiZXhwIjoxNjQ1NzI2NjAwfQ.signature",
  "user": {
    "uid": "user_123abc",
    "email": "user@example.com",
    "createdAt": "2026-02-24T10:30:00Z",
    "tokensUsedThisMonth": 0,
    "messagesGeneratedThisMonth": 0
  }
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 400 | `INVALID_EMAIL` | Invalid email format |
| 400 | `PASSWORD_TOO_SHORT` | Password must be at least 6 characters |
| 400 | `PASSWORD_MISMATCH` | Passwords do not match |
| 409 | `USER_EXISTS` | User with this email already exists |

### Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c2VyXzEyM2FiYyIsImlhdCI6MTY0NTY0MDIwMCwiZXhwIjoxNjQ1NzI2NjAwfQ.signature",
  "user": {
    "uid": "user_123abc",
    "email": "user@example.com",
    "createdAt": "2026-02-24T10:30:00Z",
    "tokensUsedThisMonth": 45000,
    "messagesGeneratedThisMonth": 150
  }
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 400 | `INVALID_CREDENTIALS` | Invalid email or password |
| 404 | `USER_NOT_FOUND` | User with this email does not exist |

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Get authenticated user's profile information.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200 OK):**

```json
{
  "uid": "user_123abc",
  "email": "user@example.com",
  "createdAt": "2026-02-24T10:30:00Z",
  "tokensUsedThisMonth": 45000,
  "messagesGeneratedThisMonth": 150
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 401 | `UNAUTHORIZED` | Invalid or missing authentication token |

### Logout User

**Endpoint:** `POST /api/auth/logout`

**Description:** Invalidate user's authentication token.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 401 | `UNAUTHORIZED` | Invalid or missing authentication token |

---

## Messages

### Generate Reply Suggestions

**Endpoint:** `POST /api/messages/generate`

**Description:** Generate 3 AI-powered reply suggestions for a given message and tone.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "Running a little late. I'll be there in 10 minutes.",
  "tone": "friendly",
  "recentMessages": [
    "Hey, how are you?",
    "I'm good, you?"
  ]
}
```

**Request Parameters:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| **message** | string | Yes | 5-2000 chars | The message to generate replies for |
| **tone** | string | Yes | friendly, professional, assertive, apologetic, casual | Desired tone for the reply |
| **recentMessages** | array | No | Max 10 items | Recent conversation context for better suggestions |

**Success Response (200 OK):**

```json
{
  "suggestions": [
    "Hey there! Running a bit late, but I'll be there in about 10 minutes.",
    "Just a heads up, I'm running a little behind. I'll be there in 10 minutes!",
    "Sorry! I'm running late, but I'll be there in around 10 minutes."
  ],
  "tokensUsed": 450,
  "responseTime": 1.2
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 400 | `INVALID_TONE` | Invalid tone. Must be one of: friendly, professional, assertive, apologetic, casual |
| 400 | `MESSAGE_TOO_SHORT` | Message must be at least 5 characters |
| 400 | `MESSAGE_TOO_LONG` | Message must be less than 2000 characters |
| 401 | `UNAUTHORIZED` | Invalid or missing authentication token |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests. Please try again later. |
| 500 | `LLM_SERVICE_ERROR` | Failed to generate suggestions. Please try again. |

**Response Time:** 1-3 seconds (depends on LLM provider)

**Token Usage:** ~300-600 tokens per request (depends on message length)

### Save Message

**Endpoint:** `POST /api/messages/save`

**Description:** Save a message and its selected suggestion to user's history.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "originalMessage": "Running a little late. I'll be there in 10 minutes.",
  "tone": "friendly",
  "suggestions": [
    "Hey there! Running a bit late, but I'll be there in about 10 minutes.",
    "Just a heads up, I'm running a little behind. I'll be there in 10 minutes!",
    "Sorry! I'm running late, but I'll be there in around 10 minutes."
  ],
  "selectedSuggestion": "Hey there! Running a bit late, but I'll be there in about 10 minutes."
}
```

**Success Response (201 Created):**

```json
{
  "id": "msg_456def",
  "uid": "user_123abc",
  "originalMessage": "Running a little late. I'll be there in 10 minutes.",
  "tone": "friendly",
  "suggestions": [
    "Hey there! Running a bit late, but I'll be there in about 10 minutes.",
    "Just a heads up, I'm running a little behind. I'll be there in 10 minutes!",
    "Sorry! I'm running late, but I'll be there in around 10 minutes."
  ],
  "selectedSuggestion": "Hey there! Running a bit late, but I'll be there in about 10 minutes.",
  "tokensUsed": 450,
  "createdAt": "2026-02-24T10:35:00Z"
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 400 | `INVALID_TONE` | Invalid tone |
| 400 | `INVALID_MESSAGE` | Invalid message format |
| 401 | `UNAUTHORIZED` | Invalid or missing authentication token |

### Get User Messages

**Endpoint:** `GET /api/messages`

**Description:** Retrieve paginated list of user's saved messages.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **page** | integer | 1 | Page number (1-indexed) |
| **limit** | integer | 20 | Messages per page (1-100) |
| **search** | string | - | Search messages by content |
| **tone** | string | - | Filter by tone (friendly, professional, etc.) |

**Example Request:**

```
GET /api/messages?page=1&limit=20&tone=friendly
```

**Success Response (200 OK):**

```json
{
  "messages": [
    {
      "id": "msg_456def",
      "uid": "user_123abc",
      "originalMessage": "Running a little late. I'll be there in 10 minutes.",
      "tone": "friendly",
      "suggestions": [...],
      "selectedSuggestion": "Hey there! Running a bit late, but I'll be there in about 10 minutes.",
      "tokensUsed": 450,
      "createdAt": "2026-02-24T10:35:00Z"
    },
    {
      "id": "msg_789ghi",
      "uid": "user_123abc",
      "originalMessage": "Please review the attached report and let me know your thoughts.",
      "tone": "professional",
      "suggestions": [...],
      "selectedSuggestion": "I've reviewed the attached report and would like to share my thoughts.",
      "tokensUsed": 520,
      "createdAt": "2026-02-24T11:20:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 401 | `UNAUTHORIZED` | Invalid or missing authentication token |

### Get Single Message

**Endpoint:** `GET /api/messages/{messageId}`

**Description:** Retrieve a single message by ID.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| **messageId** | string | Message ID (e.g., msg_456def) |

**Success Response (200 OK):**

```json
{
  "id": "msg_456def",
  "uid": "user_123abc",
  "originalMessage": "Running a little late. I'll be there in 10 minutes.",
  "tone": "friendly",
  "suggestions": [
    "Hey there! Running a bit late, but I'll be there in about 10 minutes.",
    "Just a heads up, I'm running a little behind. I'll be there in 10 minutes!",
    "Sorry! I'm running late, but I'll be there in around 10 minutes."
  ],
  "selectedSuggestion": "Hey there! Running a bit late, but I'll be there in about 10 minutes.",
  "tokensUsed": 450,
  "createdAt": "2026-02-24T10:35:00Z"
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 401 | `UNAUTHORIZED` | Invalid or missing authentication token |
| 404 | `MESSAGE_NOT_FOUND` | Message with ID msg_456def not found |

### Delete Message

**Endpoint:** `DELETE /api/messages/{messageId}`

**Description:** Delete a message from user's history.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| **messageId** | string | Message ID to delete |

**Success Response (200 OK):**

```json
{
  "message": "Message deleted successfully"
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 401 | `UNAUTHORIZED` | Invalid or missing authentication token |
| 404 | `MESSAGE_NOT_FOUND` | Message with ID msg_456def not found |

---

## Analytics

### Get Usage Statistics

**Endpoint:** `GET /api/analytics/stats`

**Description:** Get user's usage statistics for a given time period.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **period** | string | 7days | Time period: 7days, 30days, 90days, all |

**Example Request:**

```
GET /api/analytics/stats?period=7days
```

**Success Response (200 OK):**

```json
{
  "totalRequests": 42,
  "totalTokensUsed": 12450,
  "avgResponseTime": 1.2,
  "estimatedCost": 0.15,
  "toneBreakdown": {
    "friendly": 17,
    "professional": 13,
    "assertive": 3,
    "apologetic": 6,
    "casual": 3
  }
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 401 | `UNAUTHORIZED` | Invalid or missing authentication token |

### Get Daily Analytics

**Endpoint:** `GET /api/analytics/daily`

**Description:** Get daily breakdown of usage statistics.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **period** | string | 7days | Time period: 7days, 30days, 90days |

**Example Request:**

```
GET /api/analytics/daily?period=7days
```

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "date": "2026-02-24",
      "requests": 6,
      "tokensUsed": 1800,
      "cost": 0.027
    },
    {
      "date": "2026-02-23",
      "requests": 8,
      "tokensUsed": 2400,
      "cost": 0.036
    },
    {
      "date": "2026-02-22",
      "requests": 5,
      "tokensUsed": 1500,
      "cost": 0.023
    },
    {
      "date": "2026-02-21",
      "requests": 7,
      "tokensUsed": 2100,
      "cost": 0.032
    },
    {
      "date": "2026-02-20",
      "requests": 9,
      "tokensUsed": 2700,
      "cost": 0.041
    },
    {
      "date": "2026-02-19",
      "requests": 4,
      "tokensUsed": 1200,
      "cost": 0.018
    },
    {
      "date": "2026-02-18",
      "requests": 3,
      "tokensUsed": 900,
      "cost": 0.014
    }
  ]
}
```

**Error Responses:**

| Status | Error Code | Message |
|--------|-----------|---------|
| 401 | `UNAUTHORIZED` | Invalid or missing authentication token |

---

## Error Handling

### Error Response Format

All error responses follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "fieldName",
      "value": "invalidValue"
    }
  }
}
```

### HTTP Status Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| **200** | OK | Request successful |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid input, validation error |
| **401** | Unauthorized | Missing or invalid token |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Resource already exists |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Server Error | Internal server error, LLM service error |

### Common Error Codes

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `INVALID_EMAIL` | 400 | Email format is invalid | Check email format (user@domain.com) |
| `PASSWORD_TOO_SHORT` | 400 | Password less than 6 chars | Use at least 6 characters |
| `PASSWORD_MISMATCH` | 400 | Passwords don't match | Ensure both passwords are identical |
| `USER_EXISTS` | 409 | User already registered | Use different email or login |
| `INVALID_CREDENTIALS` | 400 | Wrong email or password | Check credentials and try again |
| `USER_NOT_FOUND` | 404 | User doesn't exist | Register first or check email |
| `UNAUTHORIZED` | 401 | Missing or invalid token | Login again to get new token |
| `INVALID_TONE` | 400 | Invalid tone value | Use: friendly, professional, assertive, apologetic, casual |
| `MESSAGE_TOO_SHORT` | 400 | Message < 5 characters | Provide longer message |
| `MESSAGE_TOO_LONG` | 400 | Message > 2000 characters | Shorten message |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait before making new requests |
| `LLM_SERVICE_ERROR` | 500 | LLM provider failed | Retry after a few seconds |
| `MESSAGE_NOT_FOUND` | 404 | Message ID doesn't exist | Check message ID |

---

## Rate Limiting

### Rate Limit Rules

The API implements rate limiting to prevent abuse and ensure fair usage:

| Endpoint | Limit | Window | Error Code |
|----------|-------|--------|-----------|
| `/api/messages/generate` | 30 requests | 1 hour | `RATE_LIMIT_EXCEEDED` |
| `/api/messages/save` | 100 requests | 1 hour | `RATE_LIMIT_EXCEEDED` |
| `/api/messages` | 100 requests | 1 hour | `RATE_LIMIT_EXCEEDED` |
| `/api/analytics/*` | 100 requests | 1 hour | `RATE_LIMIT_EXCEEDED` |

### Rate Limit Headers

All responses include rate limit information in headers:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1645640400
```

**Header Descriptions:**

- `X-RateLimit-Limit`: Maximum requests allowed in the window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

### Handling Rate Limits

When you receive a 429 response:

1. Check `X-RateLimit-Reset` header
2. Wait until that timestamp
3. Retry the request

**Example:**

```javascript
const resetTime = parseInt(response.headers['X-RateLimit-Reset']) * 1000;
const waitTime = resetTime - Date.now();
console.log(`Rate limited. Retry after ${waitTime}ms`);
```

---

## Examples

### Complete Flow: Register → Generate → Save

**1. Register User**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "confirmPassword": "securePassword123"
  }'
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "user_123abc",
    "email": "user@example.com",
    "createdAt": "2026-02-24T10:30:00Z",
    "tokensUsedThisMonth": 0,
    "messagesGeneratedThisMonth": 0
  }
}
```

**2. Generate Suggestions**

```bash
curl -X POST http://localhost:3000/api/messages/generate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Running a little late. I'\''ll be there in 10 minutes.",
    "tone": "friendly"
  }'
```

**Response:**

```json
{
  "suggestions": [
    "Hey there! Running a bit late, but I'\''ll be there in about 10 minutes.",
    "Just a heads up, I'\''m running a little behind. I'\''ll be there in 10 minutes!",
    "Sorry! I'\''m running late, but I'\''ll be there in around 10 minutes."
  ],
  "tokensUsed": 450,
  "responseTime": 1.2
}
```

**3. Save Message**

```bash
curl -X POST http://localhost:3000/api/messages/save \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "originalMessage": "Running a little late. I'\''ll be there in 10 minutes.",
    "tone": "friendly",
    "suggestions": [
      "Hey there! Running a bit late, but I'\''ll be there in about 10 minutes.",
      "Just a heads up, I'\''m running a little behind. I'\''ll be there in 10 minutes!",
      "Sorry! I'\''m running late, but I'\''ll be there in around 10 minutes."
    ],
    "selectedSuggestion": "Hey there! Running a bit late, but I'\''ll be there in about 10 minutes."
  }'
```

**Response:**

```json
{
  "id": "msg_456def",
  "uid": "user_123abc",
  "originalMessage": "Running a little late. I'\''ll be there in 10 minutes.",
  "tone": "friendly",
  "suggestions": [...],
  "selectedSuggestion": "Hey there! Running a bit late, but I'\''ll be there in about 10 minutes.",
  "tokensUsed": 450,
  "createdAt": "2026-02-24T10:35:00Z"
}
```

**4. Get Analytics**

```bash
curl -X GET "http://localhost:3000/api/analytics/stats?period=7days" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "totalRequests": 42,
  "totalTokensUsed": 12450,
  "avgResponseTime": 1.2,
  "estimatedCost": 0.15,
  "toneBreakdown": {
    "friendly": 17,
    "professional": 13,
    "assertive": 3,
    "apologetic": 6,
    "casual": 3
  }
}
```

---

## Best Practices

### Authentication

- **Store tokens securely** - Use secure storage (Keychain on iOS, Keystore on Android)
- **Refresh tokens** - Implement token refresh mechanism for long sessions
- **Logout properly** - Call logout endpoint to invalidate token
- **Handle token expiration** - Catch 401 errors and redirect to login

### Error Handling

- **Check error codes** - Use error codes for programmatic handling
- **Show user-friendly messages** - Display error messages from API
- **Implement retry logic** - Retry on 5xx errors with exponential backoff
- **Log errors** - Log errors for debugging and monitoring

### Performance

- **Cache responses** - Cache message history and analytics locally
- **Batch requests** - Combine multiple requests when possible
- **Implement pagination** - Use limit/page for large datasets
- **Monitor response times** - Track API performance metrics

### Security

- **Use HTTPS only** - Always use HTTPS in production
- **Validate input** - Validate all user input before sending
- **Sanitize output** - Sanitize API responses before displaying
- **Implement CORS** - Configure CORS properly for web clients

---

## Support

For API support, issues, or questions:

- **Email:** support@ghostwriter.app
- **Documentation:** https://docs.ghostwriter.app
- **Status Page:** https://status.ghostwriter.app
- **GitHub Issues:** https://github.com/ghostwriter/api/issues

