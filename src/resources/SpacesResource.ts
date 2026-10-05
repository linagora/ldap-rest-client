import { BaseResource } from './BaseResource';
import type {
  Space,
  SpaceRole,
  CreateSpaceRequest,
  ListSpacesParams,
  ListSpacesResponse,
  ListSpaceMembersParams,
  ListSpaceMembersResponse,
  ListSpaceGroupsResponse,
} from '../models/Space';

/**
 * Spaces resource - Manages the spaces of B2B organizations
 *
 * A space gathers users and groups of an organization, each with a role in
 * it: `viewer`, `editor` or `admin`. A space keeps at least one admin among
 * its users: a request that would remove the last one answers 409
 * `LAST_ADMIN`.
 *
 * @example
 * ```typescript
 * const space = await client.spaces.create('org_abc123', {
 *   name: 'Design Sprint',
 *   members: [{ username: 'jsmith', role: 'admin' }],
 * });
 *
 * await client.spaces.addMembers('org_abc123', space.id, {
 *   usernames: ['jdoe'],
 *   role: 'editor',
 * });
 * ```
 */
export class SpacesResource extends BaseResource {
  private path = (organizationId: string, ...rest: string[]): string =>
    [
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/spaces`,
      ...rest.map(encodeURIComponent),
    ].join('/');

  /**
   * Creates a space
   *
   * @throws {ValidationError} When `members` holds no admin (`ADMIN_REQUIRED`)
   * @throws {NotFoundError} When a user or group is not in the organization
   */
  create = async (organizationId: string, data: CreateSpaceRequest): Promise<Space> => {
    return this.http.post(this.path(organizationId), data);
  };

  /**
   * Lists the spaces of an organization, or with `user` the spaces that user
   * is in, each with the user's role
   */
  list = async (organizationId: string, params?: ListSpacesParams): Promise<ListSpacesResponse> => {
    const query = params ? this.buildQueryString(params) : '';
    return this.http.get(`${this.path(organizationId)}${query}`);
  };

  /**
   * Gets a space
   *
   * @throws {NotFoundError} When the space is not found (`SPACE_NOT_FOUND`)
   */
  get = async (organizationId: string, spaceId: string): Promise<Space> => {
    return this.http.get(this.path(organizationId, spaceId));
  };

  /**
   * Renames a space
   */
  rename = async (
    organizationId: string,
    spaceId: string,
    name: string
  ): Promise<{ success: true }> => {
    return this.http.patch(this.path(organizationId, spaceId), { name });
  };

  /**
   * Deletes a space
   */
  delete = async (organizationId: string, spaceId: string): Promise<{ success: true }> => {
    return this.http.delete(this.path(organizationId, spaceId));
  };

  /**
   * Lists the members' public profiles, each with its role
   */
  listMembers = async (
    organizationId: string,
    spaceId: string,
    params?: ListSpaceMembersParams
  ): Promise<ListSpaceMembersResponse> => {
    const query = params ? this.buildQueryString(params) : '';
    return this.http.get(`${this.path(organizationId, spaceId, 'members')}${query}`);
  };

  /**
   * Adds users with one role
   *
   * @throws {ConflictError} When a user holds another role (`MEMBER_EXISTS`)
   */
  addMembers = async (
    organizationId: string,
    spaceId: string,
    data: { usernames: string[]; role: SpaceRole }
  ): Promise<{ success: true }> => {
    return this.http.post(this.path(organizationId, spaceId, 'members'), data);
  };

  /**
   * Changes a member's role
   *
   * @throws {ConflictError} When it demotes the last admin (`LAST_ADMIN`)
   */
  setMemberRole = async (
    organizationId: string,
    spaceId: string,
    username: string,
    role: SpaceRole
  ): Promise<{ success: true }> => {
    return this.http.patch(this.path(organizationId, spaceId, 'members', username), { role });
  };

  /**
   * Removes a member
   *
   * @throws {ConflictError} When it removes the last admin (`LAST_ADMIN`)
   */
  removeMember = async (
    organizationId: string,
    spaceId: string,
    username: string
  ): Promise<{ success: true }> => {
    return this.http.delete(this.path(organizationId, spaceId, 'members', username));
  };

  /**
   * Lists the groups linked to a space, by name
   */
  listGroups = async (
    organizationId: string,
    spaceId: string
  ): Promise<ListSpaceGroupsResponse> => {
    return this.http.get(this.path(organizationId, spaceId, 'groups'));
  };

  /**
   * Links groups with one role
   *
   * @throws {ConflictError} When a group is linked with another role (`GROUP_ALREADY_LINKED`)
   */
  linkGroups = async (
    organizationId: string,
    spaceId: string,
    data: { groupIds: string[]; role: SpaceRole }
  ): Promise<{ success: true }> => {
    return this.http.post(this.path(organizationId, spaceId, 'groups'), data);
  };

  /**
   * Changes a linked group's role
   */
  setGroupRole = async (
    organizationId: string,
    spaceId: string,
    groupId: string,
    role: SpaceRole
  ): Promise<{ success: true }> => {
    return this.http.patch(this.path(organizationId, spaceId, 'groups', groupId), { role });
  };

  /**
   * Unlinks a group
   */
  unlinkGroup = async (
    organizationId: string,
    spaceId: string,
    groupId: string
  ): Promise<{ success: true }> => {
    return this.http.delete(this.path(organizationId, spaceId, 'groups', groupId));
  };
}
