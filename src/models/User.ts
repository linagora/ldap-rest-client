/**
 * Email address with optional type and label
 */
export interface EmailAddress {
  /** Email address */
  address: string;
  /** Type of email (e.g., 'work', 'personal') */
  type?: string;
  /** Custom label for the email */
  label?: string;
  /** Whether this is the primary email */
  primary?: string;
}

/**
 * Instant messaging contact information
 */
export interface InstantMessaging {
  /** IM protocol URI (e.g., 'xmpp:user@example.com', 'skype:username') */
  uri: string;
  /** Protocol name (e.g., 'xmpp', 'skype', 'slack') */
  protocol?: string;
  /** Custom label for the IM account */
  label?: string;
  /** Whether this is the primary IM contact */
  primary?: string;
}

/**
 * Phone number with optional type and label
 */
export interface PhoneNumber {
  /** Phone number (preferably in international format, e.g., '+33612345678') */
  number: string;
  /** Type of phone (e.g., 'mobile', 'home', 'work', 'fax') */
  type?: string;
  /** Custom label for the phone number */
  label?: string;
  /** Whether this is the primary phone number */
  primary?: boolean;
}

/**
 * Extended address details for buildings and apartments
 */
export interface ExtendedAddress {
  /** Locality or neighborhood name */
  locality?: string;
  /** Building name or number */
  building?: string;
  /** Staircase identifier */
  stairs?: string;
  /** Floor number */
  floor?: string;
  /** Apartment number */
  apartment?: string;
  /** Entry code or access code */
  entrycode?: string;
}

/**
 * Geographic location with coordinates
 */
export interface GeoLocation {
  /** Geographic coordinates as [latitude, longitude] */
  geo?: [number, number];
  /** Category for Cozy Cloud integration */
  cozyCategory?: string;
}

/**
 * Physical address with comprehensive location details
 */
export interface Address {
  /** Unique identifier for the address */
  id?: string;
  /** Street name */
  street?: string;
  /** Post office box number */
  pobox?: string;
  /** City name */
  city?: string;
  /** State, province, or region */
  region?: string;
  /** Street number */
  number?: string;
  /** Postal or ZIP code */
  code?: string;
  /** Country name or code */
  country?: string;
  /** Type of address (e.g., 'home', 'work', 'billing') */
  type?: string;
  /** Custom label for the address */
  label?: string;
  /** Whether this is the primary address */
  primary?: boolean;
  /** Extended address details (building, floor, apartment, etc.) */
  extendedAddress?: ExtendedAddress;
  /** Single-line formatted address string */
  formattedAddress?: string;
  /** Geographic location with coordinates */
  geo?: GeoLocation;
}

/**
 * Structured name components for a user
 */
export interface UserName {
  /** Family name or last name */
  familyName?: string;
  /** Given name or first name */
  givenName?: string;
  /** Middle name or additional names */
  additionalName?: string;
  /** Name prefix (e.g., 'Dr.', 'Mr.', 'Ms.') */
  namePrefix?: string;
  /** Name suffix (e.g., 'Jr.', 'Sr.', 'III') */
  nameSuffix?: string;
  /** Surname (alternative to familyName) */
  surname?: string;
}

/**
 * Complete user model with all profile fields, credentials, and encryption keys
 */
export interface User {
  /** Unique user identifier (mapped from LDAP entryUUID) */
  _id?: string;
  /** Common name (username) */
  cn: string;
  /** Surname or last name */
  sn: string;
  /** Given name or first name */
  givenName: string;
  /** Display name shown in UI */
  displayName: string;
  /** Primary email address */
  mail: string;
  /** Primary mobile phone number */
  mobile: string;
  /** Encrypted user password */
  userPassword: string;
  /** Scrypt parameter: block size */
  scryptR: number;
  /** Scrypt parameter: CPU/memory cost */
  scryptN: number;
  /** Scrypt parameter: parallelization */
  scryptP: number;
  /** Salt for password encryption */
  scryptSalt: string;
  /** Derived key length for scrypt */
  scryptDKLength: number;
  /** Number of iterations for key derivation */
  iterations: number;
  /** User's domain */
  domain: string;
  /** User's public encryption key */
  publicKey: string;
  /** User's private encryption key */
  privateKey: string;
  /** Protected encryption key */
  protectedKey: string;
  /** Whether two-factor authentication is enabled */
  twoFactorEnabled?: string;
  /** URL of user's workspace */
  workspaceUrl?: string;
  /** Recovery email for account recovery */
  recoveryEmail?: string;
  /** Timestamp when password account was locked */
  pwdAccountLockedTime?: string;
  /** Organization ID for B2B users */
  organizationId?: string;
  /** User's role in organization ('owner', 'admin', 'moderator', 'member') */
  organizationRole?: string;
  /** Full name as a single string */
  fullname?: string;
  /** Structured name components */
  name?: UserName;
  /** Birthday in ISO 8601 format (YYYY-MM-DD) */
  birthday?: string;
  /** Gender */
  gender?: string;
  /** Personal note or description */
  note?: string;
  /** Array of email addresses */
  email?: EmailAddress[];
  /** Array of instant messaging contacts */
  impp?: InstantMessaging[];
  /** Place of birth */
  birthplace?: string;
  /** Job title or position */
  jobTitle?: string;
  /** Company or organization name */
  company?: string;
  /** Array of phone numbers */
  phone?: PhoneNumber[];
  /** Array of physical addresses */
  address?: Address[];
  /** Whether this is a technical/service account */
  isTechnical?: boolean;
}

/**
 * User password credentials with scrypt encryption parameters
 */
export interface UserCredentials {
  /** Encrypted password */
  userPassword: string;
  /** Scrypt CPU/memory cost parameter (power of 2, e.g., 16384) */
  scryptN: number;
  /** Scrypt parallelization parameter (typically 1) */
  scryptP: number;
  /** Scrypt block size parameter (typically 8) */
  scryptR: number;
  /** Random salt for password hashing */
  scryptSalt: string;
  /** Derived key length in bytes (typically 32) */
  scryptDKLength: number;
  /** Number of PBKDF2 iterations */
  iterations: number;
}

/**
 * User's cryptographic keys for end-to-end encryption
 */
export interface UserKeys {
  /** User's private encryption key */
  privateKey: string;
  /** User's public encryption key */
  publicKey: string;
  /** Password-protected version of the private key */
  protectedKey: string;
}

/**
 * User account status
 */
export type UserStatus = 'active' | 'disabled';

/**
 * Fields that can be used to search for users
 */
export type UserSearchField = 'username' | 'phone' | 'email' | 'recoveryEmail';

/**
 * Request payload for creating a new B2C user
 * Includes all required fields plus optional profile information
 */
export interface CreateUserRequest extends UserCredentials, UserKeys {
  cn: string;
  uid: string;
  givenName: string;
  sn: string;
  displayName: string;
  mobile: string;
  mail: string;
  domain: string;
  workspaceUrl?: string;
  twoFactorEnabled?: string;
  recoveryEmail?: string;
  pwdAccountLockedTime?: string;
  organizationRole?: string;
  fullname?: string;
  name?: UserName;
  birthday?: string;
  gender?: string;
  note?: string;
  email?: EmailAddress[];
  impp?: InstantMessaging[];
  birthplace?: string;
  jobTitle?: string;
  company?: string;
  phone?: PhoneNumber[];
  address?: Address[];
  isTechnical?: boolean;
}

/**
 * Request payload for updating a user's profile
 * All fields are optional and only provided fields will be updated
 */
export interface UpdateUserRequest {
  mobile?: string;
  userPassword?: string;
  protectedKey?: string;
  twoFactorEnabled?: string | null;
  recoveryEmail?: string;
  displayName?: string;
  pwdAccountLockedTime?: string;
  organizationRole?: string;
  fullname?: string;
  name?: UserName;
  birthday?: string;
  gender?: string;
  note?: string;
  email?: EmailAddress[];
  impp?: InstantMessaging[];
  birthplace?: string;
  jobTitle?: string;
  company?: string;
  phone?: PhoneNumber[];
  address?: Address[];
  isTechnical?: boolean;
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | UserName
    | EmailAddress[]
    | InstantMessaging[]
    | PhoneNumber[]
    | Address[];
}

/**
 * Request parameters for fetching a user
 */
export interface FetchUserRequest extends Record<string, string | undefined> {
  by: UserSearchField;
  value: string;
  fields?: string;
}

/**
 * Parameters for checking availability of username, email, or phone
 */
export interface CheckAvailabilityParams extends Record<string, string> {
  field: string;
  value: string;
}

/**
 * Response from availability check
 */
export interface CheckAvailabilityResponse {
  available: boolean;
}

/**
 * Parameters for listing users in an organization with pagination and filtering
 */
export interface ListUsersParams {
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 20, max: 100) */
  limit?: number;
  /** Filter by status ('active' or 'disabled') */
  status?: UserStatus;
  /** Search by username, email, or name (min 2 characters) */
  search?: string;
  /** Field to sort by ('username', 'createdAt', 'mail') */
  sortBy?: string;
  /** Sort order ('asc' or 'desc') */
  sortOrder?: 'asc' | 'desc';
  /** Filter by technical account status (true: only technical users, undefined: only non-technical users) */
  isTechnical?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Response from listing users in an organization
 */
export interface ListUsersResponse {
  /** Array of users */
  users: User[];
  /** Pagination information */
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
 * Response from creating a B2B user in an organization
 * Returns the full user object with all fields populated
 */
export type CreateB2BUserResponse = User;

/**
 * Parameters for searching users across all branches
 */
export interface SearchUsersParams {
  /** Search field (username, email, phone, recoveryEmail) */
  by: UserSearchField | 'recoveryEmail';
  /** Search value */
  value: string;
  /** Optional comma-separated list of fields to return */
  fields?: string;
  [key: string]: string | undefined;
}
