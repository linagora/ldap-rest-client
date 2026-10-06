/**
 * Role of a user or a linked group in a space
 */
export type SpaceRole = 'viewer' | 'editor' | 'admin';

/**
 * Space domain model
 */
export interface Space {
  /** Space identifier (a UUID) */
  id: string;
  /** Display name */
  name: string;
  /** Organization ID this space belongs to */
  organizationId: string;
  /** Users of the space, strongest role first */
  members: { username: string; role: SpaceRole }[];
  /** Groups linked to the space, strongest role first */
  groups: { id: string; role: SpaceRole }[];
}

/**
 * A space as listed for a user, with that user's role in it
 */
export interface UserSpace extends Space {
  role?: SpaceRole;
}

/**
 * Request parameters for creating a space
 */
export interface CreateSpaceRequest {
  name: string;
  /** At least one admin */
  members: { username: string; role: SpaceRole }[];
  groups?: { id: string; role: SpaceRole }[];
}

/**
 * Parameters for listing spaces
 */
export interface ListSpacesParams {
  page?: number;
  limit?: number;
  /** Substring match on the name (min 2 characters) */
  search?: string;
  sortBy?: 'name';
  sortOrder?: 'asc' | 'desc';
  /** Only the spaces this user is in, directly or through a linked group */
  user?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Response from listing spaces
 */
export interface ListSpacesResponse {
  organizationId: string;
  spaces: UserSpace[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Parameters for listing the members of a space
 */
export interface ListSpaceMembersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'uid' | 'displayName' | 'mail' | 'jobTitle' | 'role';
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

/**
 * A member's public profile with its role; a member that cannot be read is
 * `{ uid, role }`
 */
export interface SpaceMember {
  uid: string;
  role: SpaceRole;
  [key: string]: unknown;
}

/**
 * Response from listing the members of a space
 */
export interface ListSpaceMembersResponse {
  organizationId: string;
  id: string;
  members: SpaceMember[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Response from listing the groups linked to a space, by name
 */
export interface ListSpaceGroupsResponse {
  organizationId: string;
  id: string;
  groups: { id: string; name: string; role: SpaceRole }[];
}
