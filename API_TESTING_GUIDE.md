# API Testing Guide

This guide provides comprehensive instructions for testing the Ghostwriter API using cURL commands and Postman.

---

## Table of Contents

1. [Setup](#setup)
2. [Testing with cURL](#testing-with-curl)
3. [Testing with Postman](#testing-with-postman)
4. [Test Scenarios](#test-scenarios)
5. [Debugging Tips](#debugging-tips)

---

## Setup

### Prerequisites

- **cURL** - Command-line tool for making HTTP requests (pre-installed on macOS/Linux)
- **Postman** - API testing tool (download from https://www.postman.com/downloads/)
- **Backend running** - Ensure backend is running on `http://localhost:3000`

### Environment Variables

Create a `.env.test` file for storing test credentials:

```bash
# .env.test
BASE_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="testPassword123"
```

Load environment variables:

```bash
export $(cat .env.test | xargs)
```

---

## Testing with cURL

### Basic cURL Syntax

```bash
curl -X METHOD \
  -H "Header-Name: Header-Value" \
  -d '{"key": "value"}' \
  "http://localhost:3000/api/endpoint"
```

### Common cURL Flags

| Flag | Description |
|------|-------------|
| `-X METHOD` | HTTP method (GET, POST, PUT, DELETE) |
| `-H "Header"` | Add header |
| `-d '{"data"}'` | Request body (JSON) |
| `-i` | Include response headers |
| `-v` | Verbose (show request/response details) |
| `-w "%{http_code}"` | Show HTTP status code |
| `-o filename` | Save response to file |
| `-s` | Silent mode (no progress bar) |

### Test 1: Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123",
    "confirmPassword": "testPassword123"
  }' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (201):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "user_123abc",
    "email": "test@example.com",
    "createdAt": "2026-02-24T10:30:00Z",
    "tokensUsedThisMonth": 0,
    "messagesGeneratedThisMonth": 0
  }
}
```

**Save token for next requests:**

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123",
    "confirmPassword": "testPassword123"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

### Test 2: Login User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123"
  }' \
  -w "\nStatus: %{http_code}\n"
```

**Save token:**

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

### Test 3: Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (200):**

```json
{
  "uid": "user_123abc",
  "email": "test@example.com",
  "createdAt": "2026-02-24T10:30:00Z",
  "tokensUsedThisMonth": 0,
  "messagesGeneratedThisMonth": 0
}
```

### Test 4: Generate Reply Suggestions

```bash
curl -X POST http://localhost:3000/api/messages/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Running a little late. I'\''ll be there in 10 minutes.",
    "tone": "friendly"
  }' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (200):**

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

**Save suggestions for next request:**

```bash
RESPONSE=$(curl -s -X POST http://localhost:3000/api/messages/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Running a little late. I'\''ll be there in 10 minutes.",
    "tone": "friendly"
  }')

SUGGESTIONS=$(echo $RESPONSE | jq -r '.suggestions')
echo "Suggestions: $SUGGESTIONS"
```

### Test 5: Save Message

```bash
curl -X POST http://localhost:3000/api/messages/save \
  -H "Authorization: Bearer $TOKEN" \
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
  }' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (201):**

```json
{
  "id": "msg_456def",
  "uid": "user_123abc",
  "originalMessage": "Running a little late. I'll be there in 10 minutes.",
  "tone": "friendly",
  "suggestions": [...],
  "selectedSuggestion": "Hey there! Running a bit late, but I'll be there in about 10 minutes.",
  "tokensUsed": 450,
  "createdAt": "2026-02-24T10:35:00Z"
}
```

**Save message ID:**

```bash
MESSAGE_ID=$(curl -s -X POST http://localhost:3000/api/messages/save \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}' | jq -r '.id')

echo "Message ID: $MESSAGE_ID"
```

### Test 6: Get User Messages

```bash
curl -X GET "http://localhost:3000/api/messages?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n"
```

**With filtering:**

```bash
curl -X GET "http://localhost:3000/api/messages?page=1&limit=20&tone=friendly" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n"
```

**With search:**

```bash
curl -X GET "http://localhost:3000/api/messages?page=1&limit=20&search=running" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n"
```

### Test 7: Get Single Message

```bash
curl -X GET http://localhost:3000/api/messages/$MESSAGE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n"
```

### Test 8: Delete Message

```bash
curl -X DELETE http://localhost:3000/api/messages/$MESSAGE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (200):**

```json
{
  "message": "Message deleted successfully"
}
```

### Test 9: Get Analytics Stats

```bash
curl -X GET "http://localhost:3000/api/analytics/stats?period=7days" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (200):**

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

### Test 10: Get Daily Analytics

```bash
curl -X GET "http://localhost:3000/api/analytics/daily?period=7days" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n"
```

---

## Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import** button
3. Select **File** tab
4. Choose `api/Ghostwriter.postman_collection.json`
5. Click **Import**

### Setup Environment

1. Click **Environments** in left sidebar
2. Click **Create New Environment**
3. Name it "Ghostwriter Development"
4. Add variables:

```
base_url: http://localhost:3000
token: (leave empty, will be filled after login)
message_id: (leave empty, will be filled after saving message)
```

5. Click **Save**

### Select Environment

1. Click environment dropdown (top-right)
2. Select "Ghostwriter Development"

### Test Workflow

**Step 1: Register User**
- Open "Authentication" folder
- Click "Register User"
- Click **Send**
- Copy token from response
- Paste into environment variable `token`

**Step 2: Generate Suggestions**
- Open "Messages" folder
- Click "Generate Reply Suggestions"
- Click **Send**
- Verify response has suggestions

**Step 3: Save Message**
- Click "Save Message"
- Click **Send**
- Copy message ID from response
- Paste into environment variable `message_id`

**Step 4: Get Messages**
- Click "Get User Messages"
- Click **Send**
- Verify message appears in list

**Step 5: Get Analytics**
- Open "Analytics" folder
- Click "Get Usage Statistics"
- Click **Send**
- Verify stats are displayed

### Postman Tips

**View Response in Pretty Format:**
- Click **Pretty** tab below response
- Select **JSON** format

**View Response Headers:**
- Click **Headers** tab below response
- Check rate limit headers

**Save Response to File:**
- Click **Save Response** button
- Select **Save as example**

**Run Collection:**
- Right-click collection name
- Select **Run collection**
- Configure test settings
- Click **Run**

---

## Test Scenarios

### Scenario 1: Complete User Journey

```bash
#!/bin/bash

# 1. Register
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123",
    "confirmPassword": "testPassword123"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# 2. Generate suggestions
echo -e "\n2. Generating suggestions..."
GENERATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/messages/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Running a little late. I'\''ll be there in 10 minutes.",
    "tone": "friendly"
  }')

SUGGESTIONS=$(echo $GENERATE_RESPONSE | jq -r '.suggestions')
echo "Suggestions: $SUGGESTIONS"

# 3. Save message
echo -e "\n3. Saving message..."
SAVE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/messages/save \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"originalMessage\": \"Running a little late. I'll be there in 10 minutes.\",
    \"tone\": \"friendly\",
    \"suggestions\": $SUGGESTIONS,
    \"selectedSuggestion\": \"$(echo $SUGGESTIONS | jq -r '.[0]')\"
  }")

MESSAGE_ID=$(echo $SAVE_RESPONSE | jq -r '.id')
echo "Message ID: $MESSAGE_ID"

# 4. Get analytics
echo -e "\n4. Getting analytics..."
curl -s -X GET "http://localhost:3000/api/analytics/stats?period=7days" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n✓ Complete user journey test passed!"
```

Save as `test_journey.sh` and run:

```bash
chmod +x test_journey.sh
./test_journey.sh
```

### Scenario 2: Error Handling

**Test invalid tone:**

```bash
curl -X POST http://localhost:3000/api/messages/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Running a little late.",
    "tone": "invalid_tone"
  }' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (400):**

```json
{
  "error": {
    "code": "INVALID_TONE",
    "message": "Invalid tone. Must be one of: friendly, professional, assertive, apologetic, casual"
  }
}
```

**Test message too short:**

```bash
curl -X POST http://localhost:3000/api/messages/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hi",
    "tone": "friendly"
  }' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (400):**

```json
{
  "error": {
    "code": "MESSAGE_TOO_SHORT",
    "message": "Message must be at least 5 characters"
  }
}
```

**Test unauthorized:**

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer invalid_token" \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (401):**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

---

## Debugging Tips

### Enable Verbose Mode

Show all request/response details:

```bash
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Save Request/Response to Files

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -D response_headers.txt \
  -o response_body.json
```

### Pretty Print JSON Response

```bash
curl -s -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Check Response Headers

```bash
curl -i -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Check Rate Limit Headers

```bash
curl -i -X POST http://localhost:3000/api/messages/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}' | grep -i "X-RateLimit"
```

### Measure Response Time

```bash
curl -w "Time: %{time_total}s\n" \
  -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test with Different Content Types

```bash
# JSON
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{...}'

# Form data
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=testPassword123"
```

---

## Automated Testing

### Create Test Suite

Create `tests/api.test.sh`:

```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local headers=$4
  local data=$5
  local expected_status=$6

  echo -n "Testing: $name... "

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X $method \
    $headers \
    -d "$data" \
    "http://localhost:3000$endpoint")

  if [ "$STATUS" = "$expected_status" ]; then
    echo -e "${GREEN}PASSED${NC} (Status: $STATUS)"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}FAILED${NC} (Expected: $expected_status, Got: $STATUS)"
    ((TESTS_FAILED++))
  fi
}

# Run tests
echo "Running API tests..."
echo ""

# Register test
test_endpoint "Register User" "POST" "/api/auth/register" \
  '-H "Content-Type: application/json"' \
  '{"email":"test@example.com","password":"testPassword123","confirmPassword":"testPassword123"}' \
  "201"

# Summary
echo ""
echo "Tests passed: $TESTS_PASSED"
echo "Tests failed: $TESTS_FAILED"

if [ $TESTS_FAILED -eq 0 ]; then
  exit 0
else
  exit 1
fi
```

Run tests:

```bash
chmod +x tests/api.test.sh
./tests/api.test.sh
```

---

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/api-tests.yml`:

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Start backend
        run: |
          cd backend
          npm install
          npm start &
          sleep 5
      
      - name: Run API tests
        run: |
          chmod +x tests/api.test.sh
          ./tests/api.test.sh
```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Install: brew install httpd (macOS) or apt-get install apache2-utils (Linux)

# Test endpoint with 100 requests, 10 concurrent
ab -n 100 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me
```

### Load Testing with wrk

```bash
# Install: brew install wrk (macOS) or build from source

# Test endpoint for 30 seconds with 4 threads and 100 connections
wrk -t4 -c100 -d30s \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me
```

