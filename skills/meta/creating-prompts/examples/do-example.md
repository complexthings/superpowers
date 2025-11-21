---
number: 003
topic: auth-middleware
purpose: do
dependencies: [002]
created: 2025-11-21
---

# Auth Middleware - Do

<objective>
Implement JWT authentication middleware for Express API

Purpose: Protect API routes from unauthorized access, enable user authentication
Output: Express middleware function with error handling
</objective>

<context>
Based on plan: @.agents/prompts/002-auth-plan/auth-plan-output.md

Current API structure:
- Express app in src/server.js
- Routes in src/routes/
- Using jose library for JWT (from research)
</context>

<requirements>
- Verify JWT token from Authorization header
- Extract user ID from token payload
- Attach user to request object
- Return 401 for missing/invalid tokens
- Return 403 for expired tokens
- Log authentication failures
</requirements>

<implementation>
Use jose library for verification (don't use jsonwebtoken)
Load JWT secret from environment variable
Handle all error cases explicitly
Don't catch generic errors - let Express error handler manage them

Integration: Apply to protected routes in src/routes/api.js
</implementation>

<output>
Create files:
- `src/middleware/auth.js` - Main middleware function
- `src/middleware/auth.test.js` - Unit tests

Modify:
- `src/routes/api.js` - Apply middleware to protected routes
</output>

<verification>
Before declaring complete:
- Run: `npm test src/middleware/auth.test.js` - all tests pass
- Test invalid token returns 401
- Test expired token returns 403
- Test valid token attaches user to req.user
- Start server and hit /api/protected with curl - verify 401 without token
</verification>

<summary_requirements>
Create `SUMMARY.md` in same directory with outcome, files created, any decisions needed, and next steps.
</summary_requirements>
