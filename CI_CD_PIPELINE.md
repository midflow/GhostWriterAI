# CI/CD Pipeline Configuration

This document provides complete CI/CD pipeline setup using GitHub Actions for automated testing, building, and deployment.

---

## Table of Contents

1. [Pipeline Overview](#pipeline-overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Testing Pipeline](#testing-pipeline)
4. [Build Pipeline](#build-pipeline)
5. [Deployment Pipeline](#deployment-pipeline)
6. [Monitoring & Alerts](#monitoring--alerts)

---

## Pipeline Overview

The Ghostwriter MVP uses GitHub Actions for continuous integration and deployment:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Push to GitHub                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Trigger GitHub Actions                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ Lint   │  │ Test   │  │ Build  │
    └────────┘  └────────┘  └────────┘
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ All checks passed?     │
        └────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
       YES                        NO
        │                         │
        ▼                         ▼
    ┌────────┐              ┌──────────┐
    │ Deploy │              │ Notify   │
    │        │              │ Developer│
    └────────┘              └──────────┘
        │
        ▼
    ┌────────────┐
    │ Production │
    └────────────┘
```

---

## GitHub Actions Workflows

### 1. Main CI Workflow

**File:** `.github/workflows/ci.yml`

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Backend Tests
  backend-tests:
    runs-on: ubuntu-latest
    name: Backend Tests
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'backend/package-lock.json'
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Lint code
        run: cd backend && npm run lint
      
      - name: Run tests
        run: cd backend && npm test -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend
          name: backend-coverage
      
      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./backend/coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}

  # Frontend Tests
  frontend-tests:
    runs-on: ubuntu-latest
    name: Frontend Tests
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Lint code
        run: cd frontend && npm run lint
      
      - name: Run tests
        run: cd frontend && npm test -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend
          name: frontend-coverage

  # Security Scanning
  security-scan:
    runs-on: ubuntu-latest
    name: Security Scan
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # Dependency Check
  dependency-check:
    runs-on: ubuntu-latest
    name: Dependency Check
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Check backend dependencies
        run: cd backend && npm audit --audit-level=moderate
      
      - name: Check frontend dependencies
        run: cd frontend && npm audit --audit-level=moderate

  # Build Check
  build-check:
    runs-on: ubuntu-latest
    name: Build Check
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build backend
        run: cd backend && npm run build
      
      - name: Build frontend
        run: cd frontend && npm run build
```

### 2. Deployment Workflow

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy Pipeline

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  # Deploy Backend
  deploy-backend:
    runs-on: ubuntu-latest
    name: Deploy Backend
    needs: [backend-tests, security-scan]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --service backend
      
      - name: Verify deployment
        run: |
          sleep 10
          curl -f https://ghostwriter-api.railway.app/api/health || exit 1
      
      - name: Notify Slack
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ Backend deployed successfully",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Backend Deployment Successful* 🚀\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}"
                  }
                }
              ]
            }

  # Deploy Frontend
  deploy-frontend:
    runs-on: ubuntu-latest
    name: Deploy Frontend
    needs: [frontend-tests, security-scan]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Build app
        run: cd frontend && npm run build
      
      - name: Deploy to EAS
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
        run: |
          npm install -g eas-cli
          cd frontend
          eas build --platform all --non-interactive
          eas submit --platform all --non-interactive
      
      - name: Notify Slack
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ Frontend deployed successfully",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Frontend Deployment Successful* 🚀\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}"
                  }
                }
              ]
            }
```

### 3. Performance Testing Workflow

**File:** `.github/workflows/performance.yml`

```yaml
name: Performance Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  performance-tests:
    runs-on: ubuntu-latest
    name: Performance Tests
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Start backend
        run: cd backend && npm start &
      
      - name: Wait for backend
        run: sleep 10
      
      - name: Run performance tests
        run: cd backend && npm run test:performance
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: backend/performance-results.json
      
      - name: Comment PR with results
        if: always()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('backend/performance-results.json', 'utf8'));
            
            const comment = `## Performance Test Results\n\n${JSON.stringify(results, null, 2)}`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## Testing Pipeline

### Test Stages

**Stage 1: Lint**

```yaml
- name: Lint backend
  run: cd backend && npm run lint

- name: Lint frontend
  run: cd frontend && npm run lint
```

**Stage 2: Unit Tests**

```yaml
- name: Backend unit tests
  run: cd backend && npm test -- --testPathPattern=unit

- name: Frontend unit tests
  run: cd frontend && npm test -- --testPathPattern=unit
```

**Stage 3: Integration Tests**

```yaml
- name: Backend integration tests
  run: cd backend && npm test -- --testPathPattern=integration

- name: Frontend integration tests
  run: cd frontend && npm test -- --testPathPattern=integration
```

**Stage 4: E2E Tests**

```yaml
- name: E2E tests
  run: npm run test:e2e
```

---

## Build Pipeline

### Backend Build

```yaml
- name: Build backend
  run: cd backend && npm run build

- name: Create Docker image
  run: |
    docker build -t ghostwriter-api:${{ github.sha }} .
    docker tag ghostwriter-api:${{ github.sha }} ghostwriter-api:latest

- name: Push to Docker Hub
  run: |
    echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
    docker push ghostwriter-api:${{ github.sha }}
    docker push ghostwriter-api:latest
```

### Frontend Build

```yaml
- name: Build frontend
  run: cd frontend && npm run build

- name: Create APK
  run: cd frontend && eas build --platform android --non-interactive

- name: Create IPA
  run: cd frontend && eas build --platform ios --non-interactive
```

---

## Deployment Pipeline

### Staging Deployment

```yaml
deploy-staging:
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/develop'
  
  steps:
    - name: Deploy to staging
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      run: railway up --service backend --environment staging
```

### Production Deployment

```yaml
deploy-production:
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  
  steps:
    - name: Deploy to production
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      run: railway up --service backend --environment production
```

---

## Monitoring & Alerts

### Health Check

```yaml
- name: Health check
  run: |
    for i in {1..30}; do
      if curl -f https://ghostwriter-api.railway.app/api/health; then
        echo "Health check passed"
        exit 0
      fi
      sleep 2
    done
    echo "Health check failed"
    exit 1
```

### Slack Notifications

```yaml
- name: Notify on success
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "✅ Deployment successful",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Deployment Successful* 🚀\n*Branch:* ${{ github.ref }}\n*Commit:* ${{ github.sha }}"
            }
          }
        ]
      }

- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "❌ Deployment failed",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Deployment Failed* ❌\n*Branch:* ${{ github.ref }}\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}"
            }
          }
        ]
      }
```

---

## GitHub Secrets Configuration

Store these secrets in GitHub repository settings:

| Secret | Value |
|--------|-------|
| `RAILWAY_TOKEN` | Railway API token |
| `EXPO_TOKEN` | Expo API token |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password |
| `SLACK_WEBHOOK` | Slack webhook URL |
| `CODECOV_TOKEN` | Codecov token |

---

## Branch Protection Rules

Configure branch protection in GitHub repository settings:

1. **Require status checks to pass before merging:**
   - backend-tests
   - frontend-tests
   - security-scan
   - build-check

2. **Require code reviews before merging:**
   - Minimum 1 review
   - Dismiss stale reviews

3. **Require branches to be up to date before merging:**
   - Enabled

---

## Monitoring Dashboard

### GitHub Actions Dashboard

- View all workflows: https://github.com/midflow/GhostWriterAI/actions
- View specific workflow: https://github.com/midflow/GhostWriterAI/actions/workflows/ci.yml

### Codecov Dashboard

- View coverage: https://codecov.io/gh/midflow/GhostWriterAI

### Railway Dashboard

- View deployments: https://railway.app/project/ghostwriter

---

## Troubleshooting

### Workflow Failures

**Check logs:**

```bash
# View workflow logs
gh run view <run-id> --log

# List recent runs
gh run list
```

**Common issues:**

1. **Timeout:** Increase timeout in workflow
2. **Permission denied:** Check GitHub token permissions
3. **Dependency issues:** Clear cache and retry

### Manual Workflow Trigger

```bash
# Trigger workflow manually
gh workflow run ci.yml --ref main

# Trigger specific job
gh workflow run deploy.yml --ref main
```

---

## Best Practices

1. **Keep workflows simple** - Each workflow should have a single responsibility
2. **Use caching** - Cache dependencies to speed up workflows
3. **Parallel jobs** - Run independent jobs in parallel
4. **Notifications** - Alert team on failures
5. **Monitoring** - Track workflow performance metrics
6. **Documentation** - Document all secrets and configurations
7. **Testing** - Test workflows locally before pushing
8. **Security** - Use GitHub Secrets for sensitive data

