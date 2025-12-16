import { BaseResource } from './BaseResource';
import type {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  CreateAdminRequest,
  Organization,
  UpdateOrganizationRequest,
  ChangeUserRoleRequest,
  GetOwnerResponse,
  SetOwnerRequest,
  TransferOwnershipRequest,
  CheckOrganizationAvailabilityParams,
} from '../models/Organization';
import type {
  CheckAvailabilityParams,
  CheckAvailabilityResponse,
  CreateUserRequest,
  UpdateUserRequest,
  User,
  FetchUserRequest,
  ListUsersParams,
  ListUsersResponse,
  CreateB2BUserResponse,
} from '../models/User';

/**
 * Organizations resource - Manages organizations for B2B
 *
 * Provides methods for creating organizations and managing organization admins.
 * Organizations have dedicated LDAP branches for B2B users.
 *
 * @example
 * ```typescript
 * const client = new LdapRestClient(config);
 *
 * // Create organization
 * const org = await client.organizations.create({
 *   id: 'org_abc123',
 *   name: 'Acme Corp',
 *   domain: 'acme.example.com',
 *   metadata: { industry: 'Technology' }
 * });
 *
 * // Link admin user
 * await client.organizations.createAdmin('org_abc123', {
 *   username: 'admin',
 *   mail: 'admin@acme.example.com'
 * });
 * ```
 */
export class OrganizationsResource extends BaseResource {
  /**
   * Creates a new organization with dedicated LDAP branch
   *
   * @param {CreateOrganizationRequest} data - Organization data
   * @returns {Promise<CreateOrganizationResponse>} Organization details including baseDN
   * @throws {ConflictError} When organization already exists
   * @throws {ApiError} On other API errors
   */
  create = async (data: CreateOrganizationRequest): Promise<CreateOrganizationResponse> => {
    return this.http.post('/api/v1/organizations', data);
  };

  /**
   * Checks if an organization identifier is available
   *
   * @param {CheckOrganizationAvailabilityParams} params - Field and value to check
   * @returns {Promise<CheckAvailabilityResponse>} Availability status
   * @throws {ApiError} On API errors
   *
   * @example
   * ```typescript
   * const result = await client.organizations.checkAvailability({
   *   field: 'domain',
   *   value: 'acme.example.com'
   * });
   * ```
   */
  checkAvailability = async (
    params: CheckOrganizationAvailabilityParams
  ): Promise<CheckAvailabilityResponse> => {
    const query = this.buildQueryString(params);
    return this.http.get(`/api/v1/organizations/check${query}`);
  };

  /**
   * Links a user as the first admin of an organization
   *
   * Associates an existing user account with an organization and grants
   * admin privileges. Typically called after organization creation.
   *
   * @param {string} organizationId - Organization identifier
   * @param {CreateAdminRequest} data - Admin user details (username and email)
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When organization or user is not found
   * @throws {ConflictError} When user is already an admin
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.organizations.createAdmin('org_abc123', {
   *   username: 'john.doe',
   *   mail: 'john.doe@acme.example.com'
   * });
   * ```
   */
  createAdmin = async (
    organizationId: string,
    data: CreateAdminRequest
  ): Promise<{ success: true }> => {
    return this.http.post(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/admin`,
      data
    );
  };

  /**
   * Gets a list of organizations for the authenticated user
   *
   * Requires SSO cookie authentication. Returns organizations where the
   * authenticated user has admin role.
   *
   * @returns {Promise<Organization[]>} Array of organizations
   * @throws {ApiError} On API errors
   *
   * @example
   * ```typescript
   * const organizations = await client.organizations.list();
   * ```
   */
  list = async (): Promise<Organization[]> => {
    return this.http.get('/api/v1/organizations');
  };

  /**
   * Gets details of a specific organization
   *
   * Requires SSO cookie authentication.
   *
   * @param {string} organizationId - Organization identifier
   * @returns {Promise<Organization>} Organization details
   * @throws {NotFoundError} When organization is not found
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * const org = await client.organizations.get('org_abc123');
   * ```
   */
  get = async (organizationId: string): Promise<Organization> => {
    return this.http.get(`/api/v1/organizations/${encodeURIComponent(organizationId)}`);
  };

  /**
   * Updates an organization
   *
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {UpdateOrganizationRequest} data - Fields to update
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When organization is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.organizations.update('org_abc123', {
   *   name: 'New Organization Name',
   *   status: 'active'
   * });
   * ```
   */
  update = async (
    organizationId: string,
    data: UpdateOrganizationRequest
  ): Promise<{ success: true }> => {
    return this.http.patch(`/api/v1/organizations/${encodeURIComponent(organizationId)}`, data);
  };

  /**
   * Gets the current owner of an organization
   *
   * Returns the owner information including username, email, and display name.
   * Returns null if no owner is set.
   *
   * @param {string} organizationId - Organization identifier
   * @returns {Promise<GetOwnerResponse>} Owner information or null
   * @throws {NotFoundError} When organization is not found
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * const response = await client.organizations.getOwner('org_abc123');
   * if (response.owner) {
   *   console.log(`Owner: ${response.owner.username}`);
   * }
   * ```
   */
  getOwner = async (organizationId: string): Promise<GetOwnerResponse> => {
    return this.http.get(`/api/v1/organizations/${encodeURIComponent(organizationId)}/owner`);
  };

  /**
   * Sets the initial owner of an organization
   *
   * Can only be used when the organization has no owner. To transfer ownership
   * from an existing owner, use transferOwnership instead.
   * Typically used by SaaS tools during organization setup.
   *
   * @param {string} organizationId - Organization identifier
   * @param {SetOwnerRequest} data - Owner details (username and email)
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When organization or user is not found
   * @throws {ConflictError} When organization already has an owner
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.organizations.setOwner('org_abc123', {
   *   username: 'john.doe',
   *   mail: 'john.doe@acme.example.com'
   * });
   * ```
   */
  setOwner = async (organizationId: string, data: SetOwnerRequest): Promise<{ success: true }> => {
    return this.http.post(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/owner`,
      data
    );
  };

  /**
   * Transfers organization ownership to another user
   *
   * Must be called by the current owner or by SaaS tools (with HMAC auth).
   * The current owner will be demoted to admin role.
   * The new owner must be an existing user.
   *
   * @param {string} organizationId - Organization identifier
   * @param {TransferOwnershipRequest} data - New owner username
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When organization or new owner user is not found
   * @throws {ForbiddenError} When caller is not the current owner or SaaS tool
   * @throws {ConflictError} When ownership changed by another request (race condition)
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.organizations.transferOwnership('org_abc123', {
   *   newOwnerUsername: 'jane.doe'
   * });
   * ```
   */
  transferOwnership = async (
    organizationId: string,
    data: TransferOwnershipRequest
  ): Promise<{ success: true }> => {
    return this.http.put(`/api/v1/organizations/${encodeURIComponent(organizationId)}/owner`, data);
  };

  /**
   * Deletes an organization
   *
   * Permanently removes the organization and all its data.
   * Can only be called by the organization owner or SaaS tools (with HMAC auth).
   *
   * @param {string} organizationId - Organization identifier
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When organization is not found
   * @throws {ForbiddenError} When caller is not the organization owner
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.organizations.delete('org_abc123');
   * ```
   */
  delete = async (organizationId: string): Promise<{ success: true }> => {
    return this.http.delete(`/api/v1/organizations/${encodeURIComponent(organizationId)}`);
  };

  // ===== B2B User Management Methods =====

  /**
   * Creates a new user in an organization's LDAP branch
   *
   * Requires SSO cookie authentication and admin role in the target organization.
   *
   * @param {string} organizationId - Organization identifier
   * @param {CreateUserRequest} data - User data including credentials and profile
   * @returns {Promise<CreateB2BUserResponse>} Response with user's baseDN
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {NotFoundError} When organization is not found
   * @throws {ConflictError} When username/email/phone already exists
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * const result = await client.organizations.createUser('org_abc123', {
   *   cn: 'john.doe',
   *   uid: 'john.doe',
   *   // ... other user fields
   * });
   * ```
   */
  createUser = async (
    organizationId: string,
    data: CreateUserRequest
  ): Promise<CreateB2BUserResponse> => {
    return this.http.post(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/users`,
      data
    );
  };

  /**
   * Updates a user in an organization
   *
   * Requires SSO cookie authentication and admin role in the target organization.
   *
   * @param {string} organizationId - Organization identifier
   * @param {string} userId - User identifier (username)
   * @param {UpdateUserRequest} data - Fields to update
   * @returns {Promise<User | { success: true }>} Updated user object or success response
   * @throws {NotFoundError} When user or organization is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * const result = await client.organizations.updateUser('org_abc123', 'john.doe', {
   *   mobile: '+33687654321'
   * });
   * ```
   */
  updateUser = async (
    organizationId: string,
    userId: string,
    data: UpdateUserRequest
  ): Promise<User | { success: true }> => {
    return this.http.patch(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/users/${encodeURIComponent(userId)}`,
      data
    );
  };

  /**
   * Disables a user in an organization
   *
   * Locks the account by setting pwdAccountLockedTime using LDAP PPolicy.
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {string} userId - User identifier (username)
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When user or organization is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.organizations.disableUser('org_abc123', 'john.doe');
   * ```
   */
  disableUser = async (organizationId: string, userId: string): Promise<{ success: true }> => {
    return this.http.post(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/users/${encodeURIComponent(userId)}/disable`
    );
  };

  /**
   * Deletes a user from an organization
   *
   * Permanently removes the user from the organization's LDAP branch.
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {string} userId - User identifier (username)
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When user or organization is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.organizations.deleteUser('org_abc123', 'john.doe');
   * ```
   */
  deleteUser = async (organizationId: string, userId: string): Promise<{ success: true }> => {
    return this.http.delete(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/users/${encodeURIComponent(userId)}`
    );
  };

  /**
   * Fetches a user from an organization by identifier
   *
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {FetchUserRequest} params - Fetch parameters (by, value, fields)
   * @returns {Promise<User>} User data
   * @throws {NotFoundError} When user or organization is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * const user = await client.organizations.getUser('org_abc123', {
   *   by: 'username',
   *   value: 'john.doe',
   *   fields: 'cn,mail,mobile'
   * });
   * ```
   */
  getUser = async (organizationId: string, params: FetchUserRequest): Promise<User> => {
    const query = this.buildQueryString(params);
    return this.http.get(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/users${query}`
    );
  };

  /**
   * Lists users in an organization with pagination and filtering
   *
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {ListUsersParams} params - Pagination and filter parameters
   * @returns {Promise<ListUsersResponse>} Paginated list of users
   * @throws {NotFoundError} When organization is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * const result = await client.organizations.listUsers('org_abc123', {
   *   page: 1,
   *   limit: 20,
   *   status: 'active',
   *   search: 'john',
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  listUsers = async (
    organizationId: string,
    params?: ListUsersParams
  ): Promise<ListUsersResponse> => {
    const query = params ? this.buildQueryString(params) : '';
    return this.http.get(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/users${query}`
    );
  };

  /**
   * Checks if a username, phone, or email is available in an organization
   *
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {CheckAvailabilityParams} params - Field and value to check
   * @returns {Promise<CheckAvailabilityResponse>} Availability status
   * @throws {NotFoundError} When organization is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * const result = await client.organizations.checkUserAvailability('org_abc123', {
   *   field: 'username',
   *   value: 'john.doe'
   * });
   * ```
   */
  checkUserAvailability = async (
    organizationId: string,
    params: CheckAvailabilityParams
  ): Promise<CheckAvailabilityResponse> => {
    const query = this.buildQueryString(params);
    return this.http.get(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/users/check${query}`
    );
  };

  /**
   * Changes a user's role in an organization
   *
   * Available roles: admin, moderator, member.
   * Requires SSO cookie authentication and admin role.
   * Cannot change your own role or remove the last admin.
   *
   * @param {string} organizationId - Organization identifier
   * @param {string} userId - User identifier (username)
   * @param {ChangeUserRoleRequest} data - New role
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When user or organization is not found
   * @throws {ForbiddenError} When attempting self-demotion or removing last admin
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.organizations.changeUserRole('org_abc123', 'john.doe', {
   *   role: 'moderator'
   * });
   * ```
   */
  changeUserRole = async (
    organizationId: string,
    userId: string,
    data: ChangeUserRoleRequest
  ): Promise<{ success: true }> => {
    return this.http.patch(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/users/${encodeURIComponent(userId)}/role`,
      data
    );
  };
}
