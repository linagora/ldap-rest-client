import { BaseResource } from './BaseResource';
import type { HttpClient } from '../lib';
import type {
  ScimUser,
  ScimUserInput,
  ScimPatchRequest,
  ListScimUsersParams,
  ScimListResponse,
} from '../models/Scim';

/** Default SCIM endpoint prefix (server default `DM_SCIM_PREFIX`). */
export const DEFAULT_SCIM_PREFIX = '/scim/v2';

/**
 * SCIM 2.0 Users resource (RFC 7643 / RFC 7644).
 *
 * A thin, generic wrapper over the server's `/scim/v2/Users` endpoints. It does
 * not embed any deployment-specific provisioning convention: when a deployment
 * needs extra request headers (for example multi-tenant base resolution or
 * cloudery provisioning), pass them through the optional `headers` argument on
 * each method. The HMAC signature is computed over method, path and body only,
 * so additional headers never affect authentication.
 *
 * @example
 * ```typescript
 * // Generic SCIM create
 * const user = await client.scim.users.create({
 *   schemas: [SCIM_USER_SCHEMA],
 *   userName: 'jane.doe',
 *   name: { familyName: 'Doe', givenName: 'Jane' },
 *   emails: [{ value: 'jane.doe@acme.example.com', primary: true }],
 *   active: true,
 * });
 *
 * // With deployment-specific provisioning headers
 * await client.scim.users.create(scimUser, {
 *   'x-cloudery-org-id': 'acme.example.com',
 *   'x-scim-user-base': 'ou=users,ou=acme.example.com,ou=b2b,dc=twake,dc=app',
 * });
 * ```
 */
export class ScimUsersResource extends BaseResource {
  private readonly prefix: string;

  /**
   * Creates a SCIM Users resource.
   *
   * @param {HttpClient} http - HTTP client for making requests
   * @param {string} [prefix=DEFAULT_SCIM_PREFIX] - SCIM endpoint prefix, to match a non-default `DM_SCIM_PREFIX`
   */
  constructor(http: HttpClient, prefix: string = DEFAULT_SCIM_PREFIX) {
    super(http);
    // Strip a trailing slash so a prefix like '/scim/v2/' does not yield '//Users'.
    this.prefix = prefix.replace(/\/$/, '');
  }

  /**
   * Creates a SCIM User.
   *
   * @param {ScimUserInput} user - The SCIM User payload (must include `schemas` and `userName`)
   * @param {Record<string, string>} [headers] - Optional per-request headers (e.g. provisioning/base-resolution)
   * @returns {Promise<ScimUser>} The created User, including the server-assigned `id` and `meta`
   * @throws {ValidationError} When the payload is invalid (400)
   * @throws {ConflictError} When the user already exists (409)
   * @throws {ApiError} On other API errors
   */
  create = async (user: ScimUserInput, headers?: Record<string, string>): Promise<ScimUser> => {
    return this.http.post(`${this.prefix}/Users`, user, headers);
  };

  /**
   * Retrieves a SCIM User by id.
   *
   * @param {string} id - The SCIM resource id
   * @param {Record<string, string>} [headers] - Optional per-request headers
   * @returns {Promise<ScimUser>} The User resource
   * @throws {NotFoundError} When the user does not exist (404)
   * @throws {ApiError} On other API errors
   */
  get = async (id: string, headers?: Record<string, string>): Promise<ScimUser> => {
    return this.http.get(`${this.prefix}/Users/${encodeURIComponent(id)}`, headers);
  };

  /**
   * Lists SCIM Users with optional filtering, pagination and sorting.
   *
   * @param {ListScimUsersParams} [params] - Query parameters (filter, startIndex, count, sortBy, ...)
   * @param {Record<string, string>} [headers] - Optional per-request headers
   * @returns {Promise<ScimListResponse<ScimUser>>} The SCIM ListResponse envelope
   * @throws {ApiError} On API errors
   */
  list = async (
    params?: ListScimUsersParams,
    headers?: Record<string, string>
  ): Promise<ScimListResponse<ScimUser>> => {
    const query = params ? this.buildQueryString(params) : '';
    return this.http.get(`${this.prefix}/Users${query}`, headers);
  };

  /**
   * Replaces a SCIM User (full update, RFC 7644 §3.5.1).
   *
   * @param {string} id - The SCIM resource id
   * @param {ScimUserInput} user - The full replacement payload
   * @param {Record<string, string>} [headers] - Optional per-request headers
   * @returns {Promise<ScimUser>} The updated User
   * @throws {NotFoundError} When the user does not exist (404)
   * @throws {ApiError} On other API errors
   */
  replace = async (
    id: string,
    user: ScimUserInput,
    headers?: Record<string, string>
  ): Promise<ScimUser> => {
    return this.http.put(`${this.prefix}/Users/${encodeURIComponent(id)}`, user, headers);
  };

  /**
   * Partially updates a SCIM User (RFC 7644 §3.5.2 PATCH).
   *
   * @param {string} id - The SCIM resource id
   * @param {ScimPatchRequest} patch - The PatchOp body (`schemas` + `Operations`)
   * @param {Record<string, string>} [headers] - Optional per-request headers
   * @returns {Promise<ScimUser>} The updated User
   * @throws {NotFoundError} When the user does not exist (404)
   * @throws {ApiError} On other API errors
   */
  patch = async (
    id: string,
    patch: ScimPatchRequest,
    headers?: Record<string, string>
  ): Promise<ScimUser> => {
    return this.http.patch(`${this.prefix}/Users/${encodeURIComponent(id)}`, patch, headers);
  };

  /**
   * Deletes a SCIM User.
   *
   * @param {string} id - The SCIM resource id
   * @param {Record<string, string>} [headers] - Optional per-request headers
   * @returns {Promise<{ success: true }>} Success response (server returns 204 No Content)
   * @throws {NotFoundError} When the user does not exist (404)
   * @throws {ApiError} On other API errors
   */
  delete = async (id: string, headers?: Record<string, string>): Promise<{ success: true }> => {
    return this.http.delete(`${this.prefix}/Users/${encodeURIComponent(id)}`, headers);
  };
}
