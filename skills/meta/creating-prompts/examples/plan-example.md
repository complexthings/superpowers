---
number: 002
topic: auth
purpose: plan
dependencies: [001]
created: 2025-11-21
---

# Auth - Plan

<objective>
Create implementation plan for JWT authentication system based on research findings
</objective>

<context>
Research findings: @.agents/prompts/001-auth-research/auth-research-output.md

Recommendation: jose library with httpOnly cookies
Current state: No authentication, all routes publicly accessible
Constraints: Must work with existing Express API, minimal breaking changes
</context>

<requirements>
Plan must address:
- JWT generation and verification
- Refresh token rotation
- Cookie configuration (httpOnly, secure, sameSite)
- Error handling for expired/invalid tokens
- Migration path from no-auth to auth
- Testing strategy

Decision points to resolve:
- Token expiry times (access vs refresh)
- Where to store refresh tokens (DB vs memory)
</requirements>

<output_structure>
Create plan with:

## Phases
- Phase 1: Core JWT utilities (jose integration, token generation/verification)
- Phase 2: Authentication middleware (verify tokens, attach user to request)
- Phase 3: Refresh token system (rotation, secure storage)
- Phase 4: Route protection (apply middleware, update tests)

## Dependencies
- Phase 2 needs Phase 1 JWT utilities
- Phase 3 needs Phase 2 middleware
- Phase 4 needs all previous phases

## Decision Points
- **Token expiry**: Access 15min, Refresh 7 days (OWASP standard) vs Access 1hr, Refresh 30 days (more convenient)
  - Recommendation: Start with OWASP standard, gather feedback
  
- **Refresh storage**: PostgreSQL table vs Redis
  - Recommendation: PostgreSQL for simplicity (already in stack)

## Risk Assessment
- Breaking existing clients: Gradual rollout, auth optional initially
- Token compromise: Short expiry + rotation mitigates
- Performance: JWT verification is fast, minimal impact

## Success Metrics
- All protected routes return 401 without valid token
- Refresh rotation working (old tokens invalidated)
- Zero security warnings from npm audit
</output_structure>

<summary_requirements>
Create `SUMMARY.md` with:
- One-liner: 4-phase implementation plan with OWASP-compliant token expiry
- Key Findings: Critical insights about approach
- Decisions Needed: Approve token expiry times
- Next Step: Implement Phase 1
</summary_requirements>
