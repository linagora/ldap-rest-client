import { BaseResource } from './BaseResource';
import type {
  Group,
  CreateGroupRequest,
  UpdateGroupRequest,
  AddGroupMembersRequest,
  ListGroupsParams,
  ListGroupsResponse,
} from '../models/Group';

/**
 * Groups resource - Manages groups within B2B organizations
 *
 * Provides methods for creating, updating, deleting groups and managing
 * group memberships. All operations require SSO cookie authentication
 * and admin role in the target organization.
 *
 * @example
 * ```typescript
 * const client = new LdapRestClient(config);
 *
 * // Create group
 * const group = await client.groups.create('org_abc123', {
 *   name: 'engineering',
 *   description: 'Engineering team'
 * });
 *
 * // Add members
 * await client.groups.addMembers('org_abc123', 'grp_xyz789', {
 *   usernames: ['john.doe', 'jane.smith']
 * });
 * ```
 */
export class GroupsResource extends BaseResource {
  /**
   * Creates a new group in an organization
   *
   * Requires SSO cookie authentication and admin role in the target organization.
   *
   * @param {string} organizationId - Organization identifier
   * @param {CreateGroupRequest} data - Group data (name and optional description)
   * @returns {Promise<Group>} Created group object
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {NotFoundError} When organization is not found
   * @throws {ConflictError} When group name already exists
   * @throws {ApiError} On other API errors
   *
   * @examples
   * ```typescript
   * const group = await client.groups.create('org_abc123', {
   *   name: 'engineering',
   *   description: 'Engineering team'
   * });
   * ```
   */
  create = async (
    organizationId: string,
    data: CreateGroupRequest
  ): Promise<Group> => {
    return this.http.post(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/groups`,
      data
    );
  };

  /**
   * Lists all groups in an organization with pagination
   *
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {ListGroupsParams} params - Pagination parameters (page, limit)
   * @returns {Promise<ListGroupsResponse>} Paginated list of groups
   * @throws {NotFoundError} When organization is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * const result = await client.groups.list('org_abc123', {
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  list = async (organizationId: string, params?: ListGroupsParams): Promise<ListGroupsResponse> => {
    const query = params ? this.buildQueryString(params) : '';
    return this.http.get(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/groups${query}`
    );
  };

  /**
   * Gets details of a specific group
   *
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {string} groupId - Group identifier
   * @returns {Promise<Group>} Group details including members
   * @throws {NotFoundError} When organization or group is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * const group = await client.groups.get('org_abc123', 'grp_xyz789');
   * ```
   */
  get = async (organizationId: string, groupId: string): Promise<Group> => {
    return this.http.get(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/groups/${encodeURIComponent(groupId)}`
    );
  };

  /**
   * Updates a group's properties
   *
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {string} groupId - Group identifier
   * @param {UpdateGroupRequest} data - Fields to update (name, description)
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When organization or group is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ConflictError} When new group name already exists
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.groups.update('org_abc123', 'grp_xyz789', {
   *   description: 'Updated description'
   * });
   * ```
   */
  update = async (
    organizationId: string,
    groupId: string,
    data: UpdateGroupRequest
  ): Promise<{ success: true }> => {
    return this.http.patch(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/groups/${encodeURIComponent(groupId)}`,
      data
    );
  };

  /**
   * Deletes a group from an organization
   *
   * Permanently removes the group. Members are not deleted, only the group itself.
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {string} groupId - Group identifier
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When organization or group is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.groups.delete('org_abc123', 'grp_xyz789');
   * ```
   */
  delete = async (organizationId: string, groupId: string): Promise<{ success: true }> => {
    return this.http.delete(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/groups/${encodeURIComponent(groupId)}`
    );
  };

  /**
   * Adds users to a group
   *
   * Adds one or more users to the group's member list.
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {string} groupId - Group identifier
   * @param {AddGroupMembersRequest} data - Usernames to add
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When organization, group, or users are not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.groups.addMembers('org_abc123', 'grp_xyz789', {
   *   usernames: ['alice.johnson', 'bob.wilson']
   * });
   * ```
   */
  addMembers = async (
    organizationId: string,
    groupId: string,
    data: AddGroupMembersRequest
  ): Promise<{ success: true }> => {
    return this.http.post(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/groups/${encodeURIComponent(groupId)}/members`,
      data
    );
  };

  /**
   * Removes a user from a group
   *
   * Removes a specific user from the group's member list.
   * Requires SSO cookie authentication and admin role.
   *
   * @param {string} organizationId - Organization identifier
   * @param {string} groupId - Group identifier
   * @param {string} userId - User identifier (username) to remove
   * @returns {Promise<{ success: true }>} Success response
   * @throws {NotFoundError} When organization, group, or user is not found
   * @throws {ForbiddenError} When user lacks admin privileges
   * @throws {ApiError} On other API errors
   *
   * @example
   * ```typescript
   * await client.groups.removeMember('org_abc123', 'grp_xyz789', 'bob.wilson');
   * ```
   */
  removeMember = async (
    organizationId: string,
    groupId: string,
    userId: string
  ): Promise<{ success: true }> => {
    return this.http.delete(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(userId)}`
    );
  };
}
