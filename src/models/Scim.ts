/**
 * SCIM 2.0 domain models (RFC 7643 / RFC 7644)
 *
 * The LDAP-REST server exposes a SCIM 2.0 endpoint at `/scim/v2` (configurable
 * via `DM_SCIM_PREFIX`). These types describe the User resource and the
 * request/response envelopes used by {@link ScimUsersResource}. They are a
 * generic SCIM surface: any deployment-specific behaviour (for example the
 * cloudery provisioning headers) is supplied by the caller via per-request
 * headers, not baked into these types.
 */

/** Core User schema URN (RFC 7643 §4.1). */
export const SCIM_USER_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:User';

/** PatchOp message schema URN (RFC 7644 §3.5.2). */
export const SCIM_PATCH_OP_SCHEMA = 'urn:ietf:params:scim:api:messages:2.0:PatchOp';

/** ListResponse message schema URN (RFC 7644 §3.4.2). */
export const SCIM_LIST_RESPONSE_SCHEMA = 'urn:ietf:params:scim:api:messages:2.0:ListResponse';

/**
 * SCIM complex `name` attribute (RFC 7643 §4.1.1).
 */
export interface ScimName {
  /** Full name, formatted for display. */
  formatted?: string;
  /** Family name (surname). */
  familyName?: string;
  /** Given name (first name). */
  givenName?: string;
  /** Middle name. */
  middleName?: string;
  /** Honorific prefix, e.g. "Ms.". */
  honorificPrefix?: string;
  /** Honorific suffix, e.g. "III". */
  honorificSuffix?: string;
}

/**
 * SCIM multi-valued attribute entry (RFC 7643 §2.4), used for `emails`,
 * `phoneNumbers`, etc.
 */
export interface ScimMultiValuedAttribute {
  /** The attribute value (the email address, phone number, ...). */
  value: string;
  /** Optional type label, e.g. "work" or "home". */
  type?: string;
  /** Whether this is the primary value among the set. */
  primary?: boolean;
  /** Human-readable display value. */
  display?: string;
}

/**
 * SCIM resource metadata (RFC 7643 §3.1).
 */
export interface ScimMeta {
  resourceType?: string;
  created?: string;
  lastModified?: string;
  location?: string;
  version?: string;
}

/**
 * SCIM User resource (RFC 7643 §4.1).
 *
 * Only the core attributes are typed. Extension-schema attributes (keyed by
 * their URN) are not modelled here: a broad `[key: string]` index signature
 * would erase the required/typed core attributes (it also collapses
 * {@link ScimUserInput} via `Omit`), defeating the SDK's type-safety. Callers
 * needing extension attributes can intersect with `Record<string, unknown>` at
 * the call site.
 */
export interface ScimUser {
  /** Schema URNs declared by this resource. */
  schemas: string[];
  /** Server-assigned unique identifier (present on read). */
  id?: string;
  /** Identifier from the provisioning client. */
  externalId?: string;
  /** Unique username (maps to `uid`). */
  userName: string;
  /** Structured name. */
  name?: ScimName;
  /** Display name. */
  displayName?: string;
  /** Job title. */
  title?: string;
  /** Preferred language (BCP 47). */
  preferredLanguage?: string;
  /** Whether the account is active. */
  active?: boolean;
  /** Email addresses. */
  emails?: ScimMultiValuedAttribute[];
  /** Phone numbers. */
  phoneNumbers?: ScimMultiValuedAttribute[];
  /** Resource metadata (present on read). */
  meta?: ScimMeta;
}

/**
 * Payload for creating or replacing a User. `id` and `meta` are server-managed
 * and therefore omitted from the input.
 */
export type ScimUserInput = Omit<ScimUser, 'id' | 'meta'>;

/**
 * A single PATCH operation (RFC 7644 §3.5.2).
 */
export interface ScimPatchOperation {
  /** Operation kind. */
  op: 'add' | 'remove' | 'replace';
  /** Attribute path the operation targets. */
  path?: string;
  /** Value to add or replace (omitted for `remove`). */
  value?: unknown;
}

/**
 * PATCH request body (RFC 7644 §3.5.2).
 */
export interface ScimPatchRequest {
  /** Must contain {@link SCIM_PATCH_OP_SCHEMA}. */
  schemas: string[];
  /** Ordered list of operations. */
  Operations: ScimPatchOperation[];
}

/**
 * Query parameters for listing Users (RFC 7644 §3.4.2).
 */
export interface ListScimUsersParams {
  /** SCIM filter expression. */
  filter?: string;
  /** 1-based index of the first result. */
  startIndex?: number;
  /** Maximum number of results to return. */
  count?: number;
  /** Attribute to sort by. */
  sortBy?: string;
  /** Sort direction. */
  sortOrder?: 'ascending' | 'descending';
  /** Comma-separated attributes to include. */
  attributes?: string;
  /** Comma-separated attributes to exclude. */
  excludedAttributes?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * SCIM ListResponse envelope (RFC 7644 §3.4.2).
 */
export interface ScimListResponse<T> {
  /** Contains {@link SCIM_LIST_RESPONSE_SCHEMA}. */
  schemas: string[];
  /** Total number of results matching the query. */
  totalResults: number;
  /** 1-based index of the first returned result. */
  startIndex?: number;
  /** Number of results in this page. */
  itemsPerPage?: number;
  /** The returned resources. */
  Resources: T[];
}
