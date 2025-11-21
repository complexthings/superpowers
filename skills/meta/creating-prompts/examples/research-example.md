---
number: 001
topic: auth
purpose: research
dependencies: []
created: 2025-11-21
---

# Auth - Research

<objective>
Research JWT authentication approaches for Node.js Express API to inform implementation decision
</objective>

<focus_areas>
- Compare JWT libraries: jsonwebtoken vs jose vs paseto
- httpOnly cookies vs localStorage for token storage
- Refresh token patterns and rotation strategies
- Security best practices (OWASP recommendations)
</focus_areas>

<sources>
OWASP JWT Cheat Sheet
NPM package comparisons (downloads, maintenance, TypeScript support)
Existing code: @src/server.js, @src/routes/
Security advisories for JWT libraries
</sources>

<output_requirements>
Provide research findings with:

## Key Findings
- jose library: Better TypeScript support, actively maintained, smaller bundle
- jsonwebtoken: More popular but older patterns, maintenance concerns
- httpOnly cookies required (localStorage vulnerable to XSS)
- Refresh rotation is OWASP standard (invalidate old tokens on refresh)

## Confidence Level
High - Multiple authoritative sources agree on best practices
Medium - jose vs jsonwebtoken (both work, jose has better DX)

## Recommendations
- Use jose library for JWT operations
- Store tokens in httpOnly cookies (never localStorage)
- Implement refresh token rotation
- Use short access token expiry (15min recommended by OWASP)

## Open Questions
- Where to store refresh tokens server-side? (DB vs Redis vs memory)
- Token expiry times: strict (15min) vs convenient (1hr)?

## Assumptions
- Express API will continue using cookies (not going full SPA)
- PostgreSQL available for refresh token storage if needed
</output_requirements>

<summary_requirements>
Create `SUMMARY.md` with:
- One-liner: JWT with jose library and httpOnly cookies recommended
- Key Findings: jose outperforms, cookies required, rotation is standard
- Decisions Needed: None - clear recommendation
- Next Step: Create implementation plan
</summary_requirements>
