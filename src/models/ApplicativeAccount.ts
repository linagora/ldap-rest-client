/**
 * An application-specific identity attached to a user. App accounts let a single
 * principal user authenticate to password-based protocols (IMAP, SMTP, CalDAV,
 * CardDAV) with dedicated, per-device credentials while sharing one mail address.
 */
export interface ApplicativeAccount {
  /** Identifier of the app account, formatted as `<username>_c<8-digits>`. */
  uid: string;
  /** Human-readable label (stored as the LDAP `description`); omitted when unset. */
  name?: string;
}

/**
 * Request body for creating a new app account. The credential is generated
 * server-side, so the only client-supplied field is the optional label.
 */
export interface CreateApplicativeAccountRequest {
  /** Optional human-readable label for the new account. */
  name?: string;
}

/**
 * Response returned when a new app account is created. The cleartext password
 * is included here and never returned again, so it must be stored immediately.
 */
export interface ApplicativeAccountCreated {
  /** Identifier of the newly created app account. */
  uid: string;
  /** One-time cleartext password; six blocks of four characters separated by `-`. */
  pwd: string;
  /** Mail address of the principal account this app account belongs to. */
  mail: string;
}

/**
 * Response returned when an app account is deleted. The operation is idempotent,
 * so the deleted `uid` is echoed back even when the account was already absent.
 */
export interface DeleteApplicativeAccountResponse {
  /** Identifier of the deleted app account. */
  uid: string;
}
