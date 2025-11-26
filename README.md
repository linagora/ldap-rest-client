# ldap-rest-client

TypeScript client for LDAP-REST API with HMAC-SHA256 and SSO cookie authentication.

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

// Create user
await client.users.create(userData);

// Create organization
await client.organizations.create({ id, name, domain });
```

### Browser (SSO Cookie)

```typescript
const client = new LdapRestClient({
  baseUrl: 'https://ldap-rest.example.com',
});

// Manage users in organization
await client.organizations.createUser(orgId, userData);
await client.organizations.listUsers(orgId, { page: 1, limit: 20 });

// Manage groups
await client.groups.create(orgId, { name: 'engineering' });
await client.groups.addMembers(orgId, groupId, { usernames: ['user1'] });
```

## API Reference

### Users (B2C)
```typescript
client.users.create(userData)
client.users.update(username, updates)
client.users.disable(username)
client.users.delete(username)
client.users.checkAvailability({ field, value })
client.users.fetch({ by, value, fields })
```

### Organizations
```typescript
client.organizations.create({ id, name, domain })
client.organizations.createAdmin(orgId, { username, mail })
client.organizations.list()
client.organizations.get(orgId)
client.organizations.update(orgId, updates)
```

### B2B Users (within Organizations)
```typescript
client.organizations.createUser(orgId, userData)
client.organizations.updateUser(orgId, userId, updates)
client.organizations.disableUser(orgId, userId)
client.organizations.deleteUser(orgId, userId)
client.organizations.getUser(orgId, { by, value })
client.organizations.listUsers(orgId, { page, limit, status, search })
client.organizations.checkUserAvailability(orgId, { field, value })
client.organizations.changeUserRole(orgId, userId, { role })
```

### Groups
```typescript
client.groups.create(orgId, { name, description })
client.groups.list(orgId, { page, limit })
client.groups.get(orgId, groupId)
client.groups.update(orgId, groupId, updates)
client.groups.delete(orgId, groupId)
client.groups.addMembers(orgId, groupId, { usernames })
client.groups.removeMember(orgId, groupId, userId)
```

## Error Handling

```typescript
import { ConflictError, NotFoundError } from '@linagora/ldap-rest-client';

try {
  await client.users.create(userData);
} catch (error) {
  if (error instanceof ConflictError) {
    // Handle conflict (409)
  } else if (error instanceof NotFoundError) {
    // Handle not found (404)
  }
}
```

Available errors: `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ConflictError`, `RateLimitError`, `NetworkError`, `ApiError`

## Development

```bash
npm install
npm test
npm run build
```

## License

MIT
