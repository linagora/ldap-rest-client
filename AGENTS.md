# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript API client library for LDAP-REST with dual authentication support (HMAC-SHA256 for backend services, SSO cookies for browsers). Built using `tsup` for bundling with dual CJS/ESM output.

## Commands

### Build and Development
- `npm run build` - Build library (CJS + ESM + types)
- `npm run dev` - Watch mode with auto-rebuild
- `npm run typecheck` - Run TypeScript compiler checks

### Testing
- `npm test` - Run all tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

### Code Quality
- `npm run lint` - Lint TypeScript files with ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without writing

### Publishing
- `npm run prepublishOnly` - Pre-publish checks (typecheck + test + build)
- `npm run release` - Full release workflow with publish

## Architecture

### Core Structure

The client follows a resource-based architecture pattern:

```
LdapRestClient (main entry)
  ├── HttpClient (handles all HTTP + authentication)
  │   └── Auth interface (HMAC or cookie-based)
  ├── UsersResource (B2C user operations)
  ├── OrganizationsResource (org + B2B user operations)
  └── GroupsResource (group operations within orgs)
```

### Key Design Patterns

**Resource Pattern**: Each API domain (users, organizations, groups) is encapsulated in a `*Resource` class that extends `BaseResource`. Resources receive the `HttpClient` instance and make authenticated requests.

**Dual Authentication**:
- `HmacAuth` class implements HMAC-SHA256 signing per ADR-024 (signature format: `METHOD|PATH|timestamp|body-hash`)
- Cookie auth uses browser credentials with `credentials: 'include'`
- Auth is injected into `HttpClient`, which applies it transparently to all requests

**Error Mapping**: `HttpClient.handleResponse()` maps HTTP status codes to specific error types (`ValidationError`, `ConflictError`, `NotFoundError`, etc.). All errors extend `LdapRestError` base class.

**Configuration**: `ConfigValidator` validates and normalizes config with defaults. Separate config types exist for client-level (`ClientConfig`) vs HTTP-level (`HttpConfig`) concerns.

### Authentication Flow

HMAC requests generate signature on each call:
1. Hash request body with SHA256 (empty for GET/DELETE)
2. Build signing string: `METHOD|PATH|timestamp|body-hash`
3. Compute HMAC-SHA256 signature
4. Send as header: `Authorization: HMAC-SHA256 serviceId:timestamp:signature`

Cookie auth simply includes credentials in fetch requests; no custom signing logic.

### B2C vs B2B Users

**B2C Users**: Managed via `client.users.*` methods. Top-level users without organization context.

**B2B Users**: Managed via `client.organizations.*User()` methods. Users belonging to a specific organization with roles (owner, admin, moderator, member) and optional `invited` status for pending invitations.

### Testing Approach

Jest with `ts-jest` preset. Tests located in `tests/unit/` directory. Each resource and authentication class has dedicated test file. Coverage excludes type definitions and index files.

## Important Implementation Notes

- All API responses are typed with TypeScript interfaces in `src/models/`
- HTTP client uses native `fetch` API with AbortController for timeouts
- Logger uses `tslog` library; configurable via client options
- Request timeout defaults to 30 seconds
- HMAC secrets should be minimum 32 characters (warning logged if shorter)
- The client supports both Node.js (18+) and browser environments

## Core Workflow: Research → Plan → Implement → Validate

**Start every feature with:** "Let me research the codebase and create a plan before implementing."

1. **Research** - Understand existing patterns and architecture
2. **Plan** - Propose approach and verify with user
3. **Implement** - Build with tests and error handling
4. **Validate** - ALWAYS run formatters, linters, and tests after implementation

## Code Organization Principles

**Keep functions small and focused:**

- If you need comments to explain sections, split into functions
- Group related functionality into clear modules
- Prefer many small files over few large ones
- Each class/function should have a single, clear responsibility

**Type Organization:**

- All TypeScript types and interfaces are defined in `src/models/`
- Each domain has its own model file (User, Organization, Group)
- Export types from model files and import where needed
- Use TypeScript's strict mode for maximum type safety

**Follow the resource pattern:**

- Resources extend `BaseResource` and encapsulate domain logic
- Resources receive `HttpClient` instance for making authenticated requests
- Resources should be stateless - all state managed by client
- Each resource has dedicated test coverage

## Architecture Principles

**This is always a feature branch:**

- Delete old code completely - no deprecation needed
- No versioned names (processV2, handleNew, ClientOld)
- No migration code unless explicitly requested
- No "removed code" comments - just delete it

**Prefer explicit over implicit:**

- Clear function names over clever abstractions
- Obvious data flow over hidden magic
- Direct dependencies over service locators
- Type everything explicitly - avoid `any`

**Security first:**

- Validate all configuration at client initialization
- Use crypto for security-sensitive operations (HMAC signing)
- Never log sensitive data (secrets, tokens, passwords)
- All user input in query strings must be URL-encoded

**Dual environment support:**

- Code must work in both Node.js and browser environments
- Use native `fetch` API (available in Node 18+)
- Use standard crypto APIs compatible with both environments
- No Node.js-specific APIs in client code (except where necessary in auth)

## Design Patterns

Always use established design patterns appropriate to the problem:

**Resource Pattern:**

- Each API domain (users, organizations, groups) is a separate resource class
- Resources extend `BaseResource` for shared functionality
- Clear separation of concerns between domains
- Example: `UsersResource`, `OrganizationsResource`, `GroupsResource`

**Provider Pattern:**

- Abstract interfaces with multiple implementations
- Strategy pattern for runtime selection
- Example: `Auth` interface with `HmacAuth` implementation and cookie fallback

**Factory Pattern:**

- Object creation abstraction
- Used in client initialization and auth selection
- Example: `LdapRestClient` constructor creates appropriate auth handler

**Builder Pattern:**

- `ConfigValidator` validates and normalizes configuration
- Applies defaults and transforms config for internal use
- Separates public API (`ClientConfig`) from internal concerns (`HttpConfig`)

**Error Hierarchy:**

- Base `LdapRestError` class with specific error types
- HTTP status codes mapped to semantic error classes
- Errors carry context (status code, error code, message)
- Example: `ValidationError`, `NotFoundError`, `ConflictError`

## Testing Strategy

**Match testing approach to code complexity:**

- Authentication logic: Test signature generation, header format, edge cases
- HTTP client: Mock fetch, test error handling, status code mapping
- Resources: Test request construction, response parsing, error handling
- Configuration: Test validation, normalization, defaults

**Test organization:**

- Each module has dedicated test file in `tests/unit/`
- Tests use Jest with `ts-jest` for TypeScript support
- Mock external dependencies (HTTP, crypto when needed)
- Test both success and error paths

**Coverage goals:**

- All error handling paths must be tested
- All configuration validation must be tested
- All authentication logic must be tested
- Resource methods test request/response handling

**Performance considerations:**

- Library is synchronous except for HTTP calls
- No benchmarking needed unless performance issues reported
- Focus on correctness over premature optimization

## Problem Solving

**When stuck:** Stop. The simple solution is usually correct.

**When uncertain:** "Let me think about this architecture."

**When choosing:** "I see approach A (simple) vs B (flexible). Which do you prefer?"

Avoid over-engineering. When uncertain about implementation, stop and ask for guidance.

## Maximize Efficiency

**Parallel operations:** Run multiple searches, reads, and greps in single messages

**Batch similar work:** Group related file edits together

**Run validation after implementation:**
```bash
npm run typecheck && npm run lint && npm test
```

## Progress Tracking

- Use **TodoWrite** for task management on complex features
- Write **clear, descriptive commit messages** following repository style
- **Update version** in package.json following semver
- **Update README.md** when adding new features or changing public API

Focus on maintainable solutions over clever abstractions.
