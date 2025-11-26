export interface EmailAddress {
  address: string;
  type?: string;
  label?: string;
  primary?: string;
}

export interface InstantMessaging {
  uri: string;
  protocol?: string;
  label?: string;
  primary?: string;
}

export interface PhoneNumber {
  number: string;
  type?: string;
  label?: string;
  primary?: boolean;
}

export interface ExtendedAddress {
  locality?: string;
  building?: string;
  stairs?: string;
  floor?: string;
  apartment?: string;
  entrycode?: string;
}

export interface GeoLocation {
  geo?: [number, number];
  cozyCategory?: string;
}

export interface Address {
  id?: string;
  street?: string;
  pobox?: string;
  city?: string;
  region?: string;
  number?: string;
  code?: string;
  country?: string;
  type?: string;
  label?: string;
  primary?: boolean;
  extendedAddress?: ExtendedAddress;
  formattedAddress?: string;
  geo?: GeoLocation;
}

export interface UserName {
  familyName?: string;
  givenName?: string;
  additionalName?: string;
  namePrefix?: string;
  nameSuffix?: string;
  surname?: string;
}

export interface User {
  cn: string;
  sn: string;
  givenName: string;
  displayName: string;
  mail: string;
  mobile: string;
  userPassword: string;
  scryptR: number;
  scryptN: number;
  scryptP: number;
  scryptSalt: string;
  scryptDKLength: number;
  iterations: number;
  domain: string;
  publicKey: string;
  privateKey: string;
  protectedKey: string;
  twoFactorEnabled?: string;
  workspaceUrl?: string;
  recoveryEmail?: string;
  pwdAccountLockedTime?: string;
  twakeOrganizationRole?: string;
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
}

export interface UserCredentials {
  userPassword: string;
  scryptN: number;
  scryptP: number;
  scryptR: number;
  scryptSalt: string;
  scryptDKLength: number;
  iterations: number;
}

export interface UserKeys {
  privateKey: string;
  publicKey: string;
  protectedKey: string;
}

export type UserStatus = 'active' | 'disabled';

export type UserSearchField = 'username' | 'phone' | 'email' | 'recoveryEmail';

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
  twakeOrganizationRole?: string;
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
}

export interface UpdateUserRequest {
  mobile?: string;
  userPassword?: string;
  protectedKey?: string;
  twoFactorEnabled?: string | null;
  recoveryEmail?: string;
  displayName?: string;
  pwdAccountLockedTime?: string;
  twakeOrganizationRole?: string;
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
  [key: string]: string | number | boolean | null | undefined | UserName | EmailAddress[] | InstantMessaging[] | PhoneNumber[] | Address[];
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
 */
export interface CreateB2BUserResponse {
  /** Base DN of the created user */
  baseDN: string;
}
