# API Documentation

Complete API reference for the LDAP-REST client library.

## Table of Contents

- [Users (B2C)](#users-b2c)
- [Organizations](#organizations)
- [B2B Users](#b2b-users)
- [Groups](#groups)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## Users (B2C)

B2C users are top-level users without organization context. Managed via `client.users.*` methods.

### `create(userData)`

Create a new B2C user.

```typescript
await client.users.create({
  username: 'johndoe',
  mail: 'john@example.com',
  givenName: 'John',
  cn: 'John Doe',
  sn: 'Doe',
  userPassword: 'securePassword123',
});
```

**Technical accounts:**
```typescript
await client.users.create({
  username: 'service-account',
  mail: 'service@example.com',
  isTechnical: true, // Mark as technical/service account
  // ... other fields
});
```

### `update(username, updates)`

Update an existing B2C user.

```typescript
await client.users.update('johndoe', {
  mail: 'newemail@example.com',
  givenName: 'Jonathan',
});
```

**Convert to technical account:**
```typescript
await client.users.update('johndoe', {
  isTechnical: true,
});
```

### `disable(username)`

Disable a B2C user account.

```typescript
await client.users.disable('johndoe');
```

### `delete(username)`

Permanently delete a B2C user.

```typescript
await client.users.delete('johndoe');
```

### `checkAvailability(params)`

Check if a username or email is available.

```typescript
const available = await client.users.checkAvailability({
  field: 'username',
  value: 'johndoe',
});
// Returns: { available: true } or { available: false }
```

**Parameters:**
- `field`: `'username'` or `'mail'`
- `value`: Value to check

### `fetch(params)`

Fetch a single user by username, email, or phone.

```typescript
const user = await client.users.fetch({
  by: 'username',
  value: 'johndoe',
});

// With specific fields
const user = await client.users.fetch({
  by: 'email',
  value: 'john@example.com',
  fields: 'cn,mail,username',
});
```

**Parameters:**
- `by`: `'username'` | `'email'` | `'phone'`
- `value`: Value to search for
- `fields` (optional): Comma-separated list of fields to return

### `search(params)`

Search for users across all branches (both B2C and B2B users).

```typescript
// Search by username
const users = await client.users.search({
  by: 'username',
  value: 'johndoe',
});

// Search by email
const users = await client.users.search({
  by: 'email',
  value: 'john@example.com',
});

// Search by phone with specific fields
const users = await client.users.search({
  by: 'phone',
  value: '+1234567890',
  fields: 'cn,mail,username',
});
```

**Parameters:**
- `by`: `'username'` | `'email'` | `'phone'`
- `value`: Value to search for
- `fields` (optional): Comma-separated list of fields to return

**Returns:** Array of users matching the search criteria.

### `getUserOrganizations(userId, role?)`

Get all organizations a user belongs to, optionally filtered by role.

```typescript
// Get all organizations
const orgs = await client.users.getUserOrganizations('user123');

// Get only organizations where user is admin
const adminOrgs = await client.users.getUserOrganizations('user123', 'admin');
```

**Parameters:**
- `userId`: User identifier
- `role` (optional): Filter by role (`'owner'` | `'admin'` | `'moderator'` | `'member'`)

**Returns:** Array of Organization objects.

## Organizations

Manage organizations and their settings.

### `create(params)`

Create a new organization.

```typescript
await client.organizations.create({
  id: 'acme-corp',
  name: 'Acme Corporation',
  domain: 'acme.com',
});
```

**Parameters:**
- `id`: Organization identifier
- `name`: Organization display name
- `domain`: Organization domain

### `createAdmin(orgId, params)`

Create an admin user for an organization.

```typescript
await client.organizations.createAdmin('acme-corp', {
  username: 'admin',
  mail: 'admin@acme.com',
});
```

**Parameters:**
- `orgId`: Organization identifier
- `username`: Admin username
- `mail`: Admin email

### `list()`

List all organizations.

```typescript
const orgs = await client.organizations.list();
```

**Returns:** Array of Organization objects.

### `get(orgId)`

Get a specific organization.

```typescript
const org = await client.organizations.get('acme-corp');
```

### `update(orgId, updates)`

Update organization details.

```typescript
await client.organizations.update('acme-corp', {
  name: 'Acme Corporation Inc.',
});
```

### `getOwner(orgId)`

Get the current owner of an organization.

```typescript
const owner = await client.organizations.getOwner('acme-corp');
```

### `setOwner(orgId, params)`

Set the owner of an organization.

```typescript
await client.organizations.setOwner('acme-corp', {
  username: 'newowner',
  mail: 'owner@acme.com',
});
```

### `transferOwnership(orgId, params)`

Transfer ownership to an existing organization member.

```typescript
await client.organizations.transferOwnership('acme-corp', {
  newOwnerUsername: 'existingmember',
});
```

## B2B Users

B2B users belong to specific organizations. Managed via `client.organizations.*User()` methods.

### `createUser(orgId, userData)`

Create a new user within an organization.

```typescript
const user = await client.organizations.createUser('acme-corp', {
  username: 'johndoe',
  mail: 'john@acme.com',
  givenName: 'John',
  cn: 'John Doe',
  sn: 'Doe',
  userPassword: 'securePassword123',
});

console.log(user._id); // User's unique identifier
console.log(user.organizationId); // Organization ID
```

**Technical accounts in organizations:**
```typescript
const techUser = await client.organizations.createUser('acme-corp', {
  username: 'service-bot',
  mail: 'bot@acme.com',
  isTechnical: true,
  // ... other fields
});
```

**Invited users (pending invitation):**
```typescript
const invitedUser = await client.organizations.createUser('acme-corp', {
  username: 'newuser',
  mail: 'newuser@acme.com',
  invited: true, // Marks user as pending invitation
  // ... other fields
});
```

**Returns:** Full User object with `_id` and `organizationId`.

### `updateUser(orgId, userId, updates)`

Update a user within an organization.

```typescript
const updatedUser = await client.organizations.updateUser(
  'acme-corp',
  'user123',
  {
    mail: 'newemail@acme.com',
    givenName: 'Jonathan',
  }
);
```

**Convert to technical account:**
```typescript
await client.organizations.updateUser('acme-corp', 'user123', {
  isTechnical: true,
});
```

**Update invitation status:**
```typescript
await client.organizations.updateUser('acme-corp', 'user123', {
  invited: false, // Accept invitation
});
```

**Returns:** Updated User object or `{ success: true }`.

### `disableUser(orgId, userId)`

Disable a user within an organization.

```typescript
await client.organizations.disableUser('acme-corp', 'user123');
```

### `deleteUser(orgId, userId)`

Delete a user from an organization.

```typescript
await client.organizations.deleteUser('acme-corp', 'user123');
```

### `getUser(orgId, params)`

Get a specific user within an organization.

```typescript
const user = await client.organizations.getUser('acme-corp', {
  by: 'username',
  value: 'johndoe',
});
```

**Parameters:**
- `by`: `'username'` | `'email'` | `'id'`
- `value`: Value to search for

### `listUsers(orgId, params)`

List users within an organization with pagination and filters.

```typescript
const result = await client.organizations.listUsers('acme-corp', {
  page: 1,
  limit: 20,
  status: 'active',
  search: 'john',
  sortBy: 'username',
  sortOrder: 'asc',
});

// List only technical users
const techUsers = await client.organizations.listUsers('acme-corp', {
  isTechnical: true,
});
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `search` (optional): Search term
- `sortBy` (optional): Sort field
- `sortOrder` (optional): `'asc'` or `'desc'`
- `isTechnical` (optional): Filter technical accounts (true/false)

### `checkUserAvailability(orgId, params)`

Check if a username or email is available within an organization.

```typescript
const available = await client.organizations.checkUserAvailability('acme-corp', {
  field: 'username',
  value: 'johndoe',
});
```

**Parameters:**
- `field`: `'username'` or `'mail'`
- `value`: Value to check

### `changeUserRole(orgId, userId, params)`

Change a user's role within an organization.

```typescript
const result = await client.organizations.changeUserRole('acme-corp', 'user123', {
  role: 'admin',
});

console.log(`Changed from ${result.previousRole} to ${result.role}`);
```

**Parameters:**
- `role`: `'owner'` | `'admin'` | `'moderator'` | `'member'`

**Returns:** `{ role: string, previousRole: string }`

## Groups

Manage groups within organizations.

### `create(orgId, params)`

Create a new group within an organization.

```typescript
const group = await client.groups.create('acme-corp', {
  name: 'engineering',
  description: 'Engineering team members',
});

console.log(group._id); // Group identifier
```

**Returns:** Group object.

### `list(orgId, params)`

List groups within an organization.

```typescript
const result = await client.groups.list('acme-corp', {
  page: 1,
  limit: 20,
});
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### `get(orgId, groupId)`

Get a specific group.

```typescript
const group = await client.groups.get('acme-corp', 'group123');
```

### `update(orgId, groupId, updates)`

Update group details.

```typescript
await client.groups.update('acme-corp', 'group123', {
  name: 'engineering-team',
  description: 'Updated description',
});
```

### `delete(orgId, groupId)`

Delete a group.

```typescript
await client.groups.delete('acme-corp', 'group123');
```

### `addMembers(orgId, groupId, params)`

Add users to a group.

```typescript
await client.groups.addMembers('acme-corp', 'group123', {
  usernames: ['user1', 'user2', 'user3'],
});
```

**Parameters:**
- `usernames`: Array of usernames to add

### `removeMember(orgId, groupId, userId)`

Remove a user from a group.

```typescript
await client.groups.removeMember('acme-corp', 'group123', 'user123');
```

## Configuration

### Client Options

```typescript
import { LdapRestClient } from '@linagora/ldap-rest-client';

const client = new LdapRestClient({
  baseUrl: 'https://ldap-rest.example.com',
  auth: {
    type: 'hmac',
    serviceId: 'my-service',
    secret: 'your-secret-key-at-least-32-chars-long',
  },
  timeout: 30000, // Request timeout in milliseconds (default: 30000)
  logger: {
    minLevel: 'info', // Optional tslog configuration
    // See: https://tslog.js.org/
  },
});
```

**Configuration options:**

- `baseUrl` (required): LDAP-REST API base URL
- `auth` (optional): Authentication configuration (defaults to cookie auth if omitted)
- `timeout` (optional): Request timeout in milliseconds (default: 30000)
- `logger` (optional): Custom tslog configuration for logging

## Authentication

The client supports two authentication methods:

### HMAC-SHA256 (Backend Services)

For server-to-server communication. Uses HMAC-SHA256 signing per ADR-024 specification.

```typescript
const client = new LdapRestClient({
  baseUrl: 'https://ldap-rest.example.com',
  auth: {
    type: 'hmac',
    serviceId: 'registration-service',
    secret: 'your-secret-key-at-least-32-chars-long',
  },
});
```

**Configuration:**
- `type`: Must be `'hmac'`
- `serviceId`: Service identifier registered with LDAP-REST
- `secret`: Shared secret key (minimum 32 characters recommended)

**How it works:**
1. Request body is hashed with SHA256
2. Signing string is built: `METHOD|PATH|timestamp|body-hash`
3. HMAC-SHA256 signature is computed
4. Sent as header: `Authorization: HMAC-SHA256 serviceId:timestamp:signature`

### Cookie/SSO (Browser)

For browser-based applications using existing SSO cookies.

```typescript
const client = new LdapRestClient({
  baseUrl: 'https://ldap-rest.example.com',
  auth: {
    type: 'cookie',
  },
});

// Or omit auth entirely (defaults to cookie)
const client = new LdapRestClient({
  baseUrl: 'https://ldap-rest.example.com',
});
```

Uses credentials included in browser requests. No custom signing logic required.

## Error Handling

All errors extend the `LdapRestError` base class and map to specific HTTP status codes.

### Error Types

```typescript
import {
  ValidationError,      // 400 - Invalid request data
  AuthenticationError,  // 401 - Authentication failed
  AuthorizationError,   // 403 - Insufficient permissions
  NotFoundError,        // 404 - Resource not found
  ConflictError,        // 409 - Resource already exists
  RateLimitError,       // 429 - Rate limit exceeded
  NetworkError,         // Network/timeout errors
  ApiError,             // Other API errors
} from '@linagora/ldap-rest-client';
```

### Error Handling Example

```typescript
try {
  await client.users.create({
    username: 'johndoe',
    mail: 'john@example.com',
    // ... other fields
  });
} catch (error) {
  if (error instanceof ConflictError) {
    console.error('User already exists');
  } else if (error instanceof ValidationError) {
    console.error('Invalid user data:', error.message);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed');
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Error Properties

All error objects contain:
- `message`: Human-readable error description
- `statusCode`: HTTP status code (if applicable)
- `errorCode`: API error code (if provided by server)
- `details`: Additional error details (if provided by server)

```typescript
catch (error) {
  if (error instanceof LdapRestError) {
    console.log(error.message);
    console.log(error.statusCode);
    console.log(error.errorCode);
    console.log(error.details);
  }
}
```
