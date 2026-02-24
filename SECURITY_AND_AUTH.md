# Security & Authentication Guidelines

This document outlines security best practices and authentication mechanisms for the Ghostwriter API.

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [JWT Tokens](#jwt-tokens)
3. [Password Security](#password-security)
4. [API Security](#api-security)
5. [Data Protection](#data-protection)
6. [Security Checklist](#security-checklist)

---

## Authentication Overview

The Ghostwriter API uses **JWT (JSON Web Tokens)** for stateless authentication. This approach provides security, scalability, and simplicity compared to session-based authentication.

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User Registration/Login                              │
│    POST /api/auth/register or /api/auth/login           │
│    Request: { email, password }                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Server Validates Credentials                         │
│    - Check email format                                 │
│    - Verify password strength (registration only)       │
│    - Check if user exists (login only)                  │
│    - Hash password with bcrypt                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Generate JWT Token                                   │
│    - Payload: { uid, email, iat, exp }                 │
│    - Algorithm: HS256                                   │
│    - Secret: Environment variable (JWT_SECRET)          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Return Token to Client                               │
│    Response: { token, user }                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Client Stores Token Securely                         │
│    iOS: Keychain                                        │
│    Android: Keystore                                    │
│    Web: Secure HTTP-only cookie                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Client Includes Token in Requests                    │
│    Header: Authorization: Bearer <token>                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Server Validates Token                               │
│    - Verify signature                                   │
│    - Check expiration                                   │
│    - Extract user ID                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Process Request                                      │
│    - Execute endpoint logic                             │
│    - Return response                                    │
└─────────────────────────────────────────────────────────┘
```

---

## JWT Tokens

### Token Structure

JWT tokens consist of three parts separated by dots: `header.payload.signature`

**Example:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c2VyXzEyM2FiYyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTY0NTY0MDIwMCwiZXhwIjoxNjQ1NzI2NjAwfQ.signature
```

### Token Components

**1. Header (Base64 encoded)**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**2. Payload (Base64 encoded)**

```json
{
  "uid": "user_123abc",
  "email": "user@example.com",
  "iat": 1645640200,
  "exp": 1645726600
}
```

**3. Signature (HMAC-SHA256)**

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### Token Lifetime

| Token Type | Lifetime | Use Case |
|-----------|----------|----------|
| **Access Token** | 24 hours | API requests |
| **Refresh Token** | 30 days | Obtain new access token |

### Token Validation

The server validates tokens by:

1. **Verify Signature** - Ensure token wasn't tampered with
2. **Check Expiration** - Ensure token is still valid
3. **Extract Claims** - Get user ID and other data

**Validation Code Example (Node.js):**

```typescript
import jwt from 'jsonwebtoken';

function validateToken(token: string): { uid: string; email: string } {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as { uid: string; email: string };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}
```

### Token Refresh Flow

When access token expires, client should use refresh token to get new access token:

```
Client                          Server
  │                               │
  ├─ POST /api/auth/refresh ─────>│
  │  { refreshToken }             │
  │                               │
  │<──── { accessToken } ────────┤
  │                               │
```

**Implementation (Backend):**

```typescript
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
    const newAccessToken = jwt.sign(
      { uid: decoded.uid, email: decoded.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: { code: 'INVALID_REFRESH_TOKEN' } });
  }
});
```

---

## Password Security

### Password Requirements

| Requirement | Rule | Reason |
|-------------|------|--------|
| **Minimum Length** | 6 characters | Prevents weak passwords |
| **Character Types** | No specific requirement | Allows flexibility |
| **Expiration** | No forced expiration | User-friendly |
| **History** | No reuse restriction | User-friendly |

### Password Hashing

Passwords are hashed using **bcrypt** with a salt factor of 10:

```typescript
import bcrypt from 'bcrypt';

// Hash password during registration
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password during login
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Password Storage

- **Never store plain text passwords** - Always hash before storing
- **Use bcrypt** - Provides salt and multiple rounds of hashing
- **Use environment variables** - Store JWT_SECRET securely
- **Use HTTPS** - Encrypt passwords in transit

### Password Reset Flow

**Future implementation (not in MVP):**

```
User                            Server
  │                               │
  ├─ POST /api/auth/forgot ─────>│
  │  { email }                    │
  │                               │
  │<──── { message } ────────────┤
  │  "Check your email"           │
  │                               │
  │  (User receives email with    │
  │   reset link)                 │
  │                               │
  ├─ POST /api/auth/reset ──────>│
  │  { token, newPassword }       │
  │                               │
  │<──── { token } ───────────────┤
  │  New access token             │
  │                               │
```

---

## API Security

### HTTPS/TLS

**Requirement:** All API requests must use HTTPS in production.

**Benefits:**
- Encrypts data in transit
- Prevents man-in-the-middle attacks
- Protects authentication tokens

**Implementation:**
```typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### CORS (Cross-Origin Resource Sharing)

**Configuration:**

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://ghostwriter.app',
    'https://www.ghostwriter.app',
    'http://localhost:3000' // Development only
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Rate Limiting

**Purpose:** Prevent abuse and brute force attacks.

**Implementation:**

```typescript
import rateLimit from 'express-rate-limit';

// Limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  // Login logic
});

// Limit API requests
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests
  message: 'Too many requests, please try again later'
});

app.use('/api/', apiLimiter);
```

### Input Validation

**Always validate and sanitize user input:**

```typescript
import { body, validationResult } from 'express-validator';

app.post('/api/auth/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process registration
  }
);
```

### SQL Injection Prevention

**Use parameterized queries:**

```typescript
// ❌ Bad - vulnerable to SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Good - parameterized query
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);
```

### XSS (Cross-Site Scripting) Prevention

**Sanitize output:**

```typescript
import DOMPurify from 'dompurify';

// Sanitize user-generated content before storing
const cleanContent = DOMPurify.sanitize(userContent);
```

### CSRF (Cross-Site Request Forgery) Protection

**Use CSRF tokens for state-changing operations:**

```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.post('/api/messages/save', csrfProtection, (req, res) => {
  // Verify CSRF token
  // Process request
});
```

---

## Data Protection

### Encryption at Rest

**Sensitive data should be encrypted:**

```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const [iv, encrypted] = text.split(':');
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]).toString();
}
```

### Data Retention

**Delete data according to policy:**

| Data Type | Retention | Action |
|-----------|-----------|--------|
| **User Account** | Until deletion | Keep indefinitely |
| **Messages** | 1 year | Auto-delete after 1 year |
| **Logs** | 90 days | Auto-delete after 90 days |
| **Backups** | 30 days | Keep for disaster recovery |

### Privacy Compliance

**GDPR Compliance:**
- Provide data export endpoint
- Implement right to be forgotten
- Obtain explicit consent
- Document data processing

**Implementation:**

```typescript
// Export user data
app.get('/api/user/export', authenticate, async (req, res) => {
  const userData = await getUserData(req.user.uid);
  res.json(userData);
});

// Delete user account
app.delete('/api/user/account', authenticate, async (req, res) => {
  await deleteUserData(req.user.uid);
  res.json({ message: 'Account deleted' });
});
```

---

## Security Checklist

### Development

- [ ] Use environment variables for secrets
- [ ] Never commit secrets to version control
- [ ] Use `.env.example` as template
- [ ] Enable HTTPS in development
- [ ] Use HTTPS-only cookies
- [ ] Implement CORS properly
- [ ] Validate all user input
- [ ] Sanitize all output
- [ ] Use parameterized queries
- [ ] Implement rate limiting
- [ ] Log security events
- [ ] Use security headers

### Deployment

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Use strong database passwords
- [ ] Enable HTTPS with valid certificate
- [ ] Configure firewall rules
- [ ] Enable DDoS protection
- [ ] Monitor for suspicious activity
- [ ] Implement Web Application Firewall (WAF)
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Incident response plan
- [ ] Security incident logging
- [ ] Regular backups

### Third-Party Services

- [ ] Verify LLM provider security
- [ ] Use API keys with minimal permissions
- [ ] Rotate API keys regularly
- [ ] Monitor API usage
- [ ] Implement fallback providers
- [ ] Audit third-party access logs

### Client-Side Security

- [ ] Store tokens securely (Keychain/Keystore)
- [ ] Use HTTPS for all requests
- [ ] Implement certificate pinning
- [ ] Validate SSL certificates
- [ ] Clear sensitive data on logout
- [ ] Implement auto-logout on inactivity
- [ ] Use secure random number generation
- [ ] Implement app signing/notarization

---

## Security Headers

**Add security headers to all responses:**

```typescript
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  // Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
});
```

---

## Incident Response

### Security Incident Procedure

1. **Detect** - Monitor logs and alerts
2. **Contain** - Isolate affected systems
3. **Investigate** - Determine scope and impact
4. **Remediate** - Fix the vulnerability
5. **Recover** - Restore normal operations
6. **Review** - Document lessons learned

### Reporting Security Issues

**Do not open public issues for security vulnerabilities.**

Instead, email: `security@ghostwriter.app`

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [GDPR Compliance Guide](https://gdpr-info.eu/)

