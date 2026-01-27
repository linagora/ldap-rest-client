# ldap-rest-client

TypeScript client library for LDAP-REST API with dual authentication support (HMAC-SHA256 for backend services, SSO cookies for browsers).

## Features

- **Dual Authentication**: HMAC-SHA256 for backend services, SSO cookies for browsers
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Resource-Based API**: Clean, intuitive interface for users, organizations, and groups
- **Error Handling**: Semantic error types mapped to HTTP status codes
- **Cross-Platform**: Works in Node.js (18+) and browser environments

## Installation

```bash
npm install @linagora/ldap-rest-client
```

## Quick Start

### Backend (HMAC Authentication)

```typescript
import { LdapRestClient } from '@linagora/ldap-rest-client';

const client = new LdapRestClient({
  baseUrl: 'https://ldap-rest.example.com',
  auth: {
    type: 'hmac',
    serviceId: 'registration-service',
    secret: 'your-secret-key-at-least-32-chars-long',
  },
});

// Create B2C user
await client.users.create({
  username: 'johndoe',
  mail: 'john@example.com',
  givenName: 'John',
  cn: 'John Doe',
  sn: 'Doe',
  userPassword: 'secure-password',
});

// Create organization
await client.organizations.create({
  id: 'acme-corp',
  name: 'Acme Corporation',
  domain: 'acme.com',
});

// Create B2B user in organization
const user = await client.organizations.createUser('acme-corp', {
  username: 'employee',
  mail: 'employee@acme.com',
  givenName: 'Jane',
  cn: 'Jane Smith',
  sn: 'Smith',
});
```

### Browser (SSO Cookie)

```typescript
const client = new LdapRestClient({
  baseUrl: 'https://ldap-rest.example.com',
  // auth defaults to browser cookie-based authentication
});

// List users in organization
const result = await client.organizations.listUsers('acme-corp', {
  page: 1,
  limit: 20,
});

// Create and manage groups
const group = await client.groups.create('acme-corp', {
  name: 'engineering',
  description: 'Engineering team',
});

await client.groups.addMembers('acme-corp', group._id, {
  usernames: ['user1', 'user2'],
});
```

## API Overview

The client provides three main resource interfaces:

- **`client.users`** - B2C user management (top-level users)
- **`client.organizations`** - Organization and B2B user management
- **`client.groups`** - Group management within organizations

For complete API documentation, see **[API.md](./API.md)**.

### Key Concepts

**Authentication:**
- **HMAC-SHA256**: For server-to-server communication
- **Cookie/SSO**: For browser-based applications

## Configuration

```typescript
const client = new LdapRestClient({
  baseUrl: 'https://ldap-rest.example.com', // Required
  auth: {
    type: 'hmac', // or 'cookie'
    serviceId: 'my-service',
    secret: 'your-secret-key-at-least-32-chars-long',
  },
  timeout: 30000, // Optional, default: 30000ms
  logger: {
    minLevel: 'info', // Optional, tslog configuration
  },
});
```

See **[API.md - Configuration](./API.md#configuration)** for detailed options.

## Error Handling

All errors extend `LdapRestError` and map to specific HTTP status codes:

```typescript
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '@linagora/ldap-rest-client';

try {
  await client.users.create(userData);
} catch (error) {
  if (error instanceof ConflictError) {
    console.error('User already exists');
  } else if (error instanceof ValidationError) {
    console.error('Invalid data:', error.message);
  }
}
```

**Available error types:** `ValidationError` (400), `AuthenticationError` (401), `AuthorizationError` (403), `NotFoundError` (404), `ConflictError` (409), `RateLimitError` (429), `NetworkError`, `ApiError`.

See **[API.md - Error Handling](./API.md#error-handling)** for complete documentation.

## Documentation

- **[API Reference](./API.md)** - Complete API documentation

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build library
npm run build

# Type checking
npm run typecheck

# Linting and formatting
npm run lint
npm run format
```

## Requirements

- Node.js 18+
- TypeScript 5+

## License

MIT
