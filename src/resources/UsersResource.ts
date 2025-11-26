import { BaseResource } from './BaseResource';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  FetchUserRequest,
  CheckAvailabilityParams,
  CheckAvailabilityResponse,
} from '../models';

/**
 * Users resource - Manages B2C users in main LDAP branch
 *
 * Provides methods for creating, updating, deleting, and querying users
 * in the main LDAP branch (B2C users). All operations require HMAC authentication.
 *
 * @example
 * ```typescript
 * const client = new LdapRestClient(config);
 *
 * // Create user
 * await client.users.create({
 *   cn: 'johndoe',
 *   uid: 'johndoe',
 *   // ... other fields
 * });
 *
 * // Check availability
 * const { available } = await client.users.checkAvailability({
 *   field: 'username',
 *   value: 'johndoe'
 * });
 * ```
 */
export class UsersResource extends BaseResource {
  /**
   * Creates a new user in the main LDAP branch
   *
   * @param {CreateUserRequest} data - User data including credentials and profile
   * @returns {Promise<{ success: true }>} Success response
   * @throws {ConflictError} When username/email/phone already exists
   * @throws {ApiError} On other API errors
   */
  create = async (data: CreateUserRequest): Promise<{ success: true }> => {
    return this.http.post('/api/v1/users', data);
  };

  /**
   * Updates an existing user
   *
   * @param {string} userId - User identifier (username)
   * @param {UpdateUserRequest} data - Fields to update
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When user is not found
   * @throws {ApiError} On other API errors
   */
  update = async (userId: string, data: UpdateUserRequest): Promise<{ success: true }> => {
    return this.http.patch(`/api/v1/users/${encodeURIComponent(userId)}`, data);
  };

  /**
   * Disables a user account
   *
   * Sets pwdAccountLockedTime to lock the account using LDAP PPolicy.
   *
   * @param {string} userId - User identifier (username)
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When user is not found
   * @throws {ApiError} On other API errors
   */
  disable = async (userId: string): Promise<{ success: true }> => {
    return this.http.post(`/api/v1/users/${encodeURIComponent(userId)}/disable`);
  };

  /**
   * Deletes a user
   *
   * Permanently removes the user from LDAP.
   *
   * @param {string} userId - User identifier (username)
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When user is not found
   * @throws {ApiError} On other API errors
   */
  delete = async (userId: string): Promise<{ success: true }> => {
    return this.http.delete(`/api/v1/users/${encodeURIComponent(userId)}`);
  };

  /**
   * Checks if a username, phone, or email is available
   *
   * @param {CheckAvailabilityParams} params - Field and value to check
   * @returns {Promise<CheckAvailabilityResponse>} Availability status
   * @throws {ApiError} On API errors
   *
   * @example
   * ```typescript
   * const result = await client.users.checkAvailability({
   *   field: 'username',
   *   value: 'johndoe'
   * });
   *
   * ```
   */
  checkAvailability = async (
    params: CheckAvailabilityParams
  ): Promise<CheckAvailabilityResponse> => {
    const query = this.buildQueryString(params);
    return this.http.get(`/api/v1/users/check${query}`);
  };

  /**
   * Fetches a user by identifier
   *
   * @param {FetchUserRequest} params - Fetch parameters (by, value, fields)
   * @returns {Promise<User>} User data
   * @throws {NotFoundError} When user is not found
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * const user = await client.users.fetch({
   *   by: 'username',
   *   value: 'johndoe',
   *   fields: 'cn,mail,mobile'
   * });
   * ```
   */
  fetch = async (params: FetchUserRequest): Promise<User> => {
    const query = this.buildQueryString(params);
    return this.http.get(`/api/v1/users${query}`);
  };
}
