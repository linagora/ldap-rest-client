/**
 * Organization domain model representing a B2B organization
 *
 * Organizations have dedicated LDAP branches (baseDN) for managing
 * B2B users separately from B2C users in the main branch.
 */
export interface Organization {
  /** Unique organization identifier (must start with 'org_') */
  id: string;
  /** Organization display name */
  name: string;
  /** Organization domain (e.g., 'acme.example.com') */
  domain: string;
  /** LDAP base DN for this organization's branch (e.g., 'ou=org_abc123,dc=example,dc=com') */
  baseDN: string;
  /** Organization status (active or suspended) */
  status: OrganizationStatus;
  /** Organization creation timestamp */
  createdAt: Date;
  /** Optional metadata for custom organization properties */
  metadata?: OrganizationMetadata;
}

/**
 * Organization status
 *
 * - active: Organization is operational and users can authenticate
 * - suspended: Organization is temporarily disabled
 */
export type OrganizationStatus = 'active' | 'suspended';

/**
 * Optional metadata for organization customization
 *
 * Allows storing custom properties like industry, company size,
 * contact information, or any other organization-specific data.
 */
export interface OrganizationMetadata {
  /** Industry/sector (e.g., 'Technology', 'Healthcare') */
  industry?: string;
  /** Organization size (e.g., '1-10', '11-50', '51-200') */
  size?: string;
  /** Primary contact information */
  contact?: string;
  /** Additional custom fields as key-value pairs */
  [key: string]: string | undefined;
}

/**
 * Request parameters for creating an organization
 */
export interface CreateOrganizationRequest {
  id: string;
  name: string;
  domain: string;
  metadata?: OrganizationMetadata;
}

/**
 * Response from creating an organization
 */
export interface CreateOrganizationResponse {
  success: true;
  organization: Organization;
}

/**
 * Request parameters for linking an admin user to an organization
 */
export interface CreateAdminRequest {
  username: string;
  mail: string;
}

/**
 * Request parameters for updating an organization
 */
export interface UpdateOrganizationRequest {
  /** Organization display name */
  name?: string;
  /** Organization status */
  status?: OrganizationStatus;
  /** Optional metadata updates */
  metadata?: OrganizationMetadata;
}

/**
 * User role within an organization
 */
export type OrganizationRole = 'owner' | 'admin' | 'moderator' | 'member';

/**
 * Request parameters for changing a user's role in an organization
 */
export interface ChangeUserRoleRequest {
  /** New role for the user */
  role: OrganizationRole;
}

/**
 * Organization owner information
 */
export interface OrganizationOwner {
  /** Owner username */
  username: string;
  /** Owner email address */
  mail?: string;
  /** Owner display name */
  displayName?: string;
}

/**
 * Response from getting organization owner
 */
export interface GetOwnerResponse {
  /** Current owner (null if no owner set) */
  owner: OrganizationOwner | null;
}

/**
 * Request parameters for setting organization owner
 */
export interface SetOwnerRequest {
  /** Username of the user to set as owner */
  username: string;
  /** Email address of the user */
  mail: string;
}

/**
 * Request parameters for transferring organization ownership
 */
export interface TransferOwnershipRequest {
  /** Username of the new owner */
  newOwnerUsername: string;
}

/**
 * Fields that can be used to search for organizations
 */
export type OrganizationSearchField = 'id' | 'domain';

/**
 * Parameters for checking availability of organization id or domain
 */
export interface CheckOrganizationAvailabilityParams extends Record<string, string> {
  field: OrganizationSearchField;
  value: string;
}
