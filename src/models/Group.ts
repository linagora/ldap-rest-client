/**
 * Group domain model representing a group within a B2B organization
 *
 * Groups allow organizing users within an organization for access control
 * and team management.
 */
export interface Group {
  /** Unique group identifier */
  id: string;
  /** Group common name */
  cn: string;
  /** Group description */
  description?: string;
  /** Organization ID this group belongs to */
  organizationId: string;
  /** LDAP base DN for this group */
  baseDN: string;
  /** Array of usernames that are members of this group */
  members: string[];
  /** Group creation timestamp */
  createdAt: string;
}

/**
 * Request parameters for creating a group
 */
export interface CreateGroupRequest {
  /** Group common name (unique within organization) */
  name: string;
  /** Optional group description */
  description?: string;
}

/**
 * Request parameters for updating a group
 */
export interface UpdateGroupRequest {
  /** Group description */
  description?: string;
  /** Group common name */
  name?: string;
}

/**
 * Request parameters for adding members to a group
 */
export interface AddGroupMembersRequest {
  /** Array of usernames to add to the group */
  usernames: string[];
}

/**
 * Parameters for listing groups with pagination
 */
export interface ListGroupsParams {
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 20, max: 100) */
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Response from listing groups
 */
export interface ListGroupsResponse {
  /** Organization identifier */
  organizationId: string;
  /** Array of groups */
  groups: Group[];
  /** Pagination information */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
