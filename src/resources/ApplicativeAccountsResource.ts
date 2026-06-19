import { BaseResource } from './BaseResource';
import type {
  ApplicativeAccount,
  CreateApplicativeAccountRequest,
  ApplicativeAccountCreated,
  DeleteApplicativeAccountResponse,
} from '../models';

/**
 * Applicative Accounts resource - manages per-device app accounts for a user
 *
 * App accounts let a single user authenticate to password-based protocols
 * (IMAP, SMTP, CalDAV, CardDAV) with dedicated, revocable credentials instead
 * of their primary password. Backed by the `core/twake/appAccountsApi` plugin;
 * all operations require HMAC authentication and are keyed by username (the
 * same path works for B2C and B2B users).
 *
 * @example
 * ```typescript
 * const client = new LdapRestClient(config);
 *
 * // List a user's app accounts
 * const accounts = await client.applicativeAccounts.list('johndoe');
 *
 * // Create one (the one-time password is returned only here)
 * const { uid, pwd } = await client.applicativeAccounts.create('johndoe', {
 *   name: 'Work laptop',
 * });
 *
 * // Revoke one
 * await client.applicativeAccounts.delete('johndoe', uid);
 * ```
 */
export class ApplicativeAccountsResource extends BaseResource {
  /**
   * Lists the app accounts belonging to a user
   *
   * The principal account is excluded; only per-device accounts are returned,
   * sorted alphabetically by `uid`.
   *
   * @param {string} username - User identifier (username)
   * @returns {Promise<ApplicativeAccount[]>} The user's app accounts
   * @throws {NotFoundError} When the user is not found
   * @throws {ApiError} On other API errors
   */
  list = async (username: string): Promise<ApplicativeAccount[]> => {
    return this.http.get(`/api/v1/users/${encodeURIComponent(username)}/app-accounts`);
  };

  /**
   * Creates a new app account for a user
   *
   * The server generates the `uid` and a one-time password. The cleartext
   * password is returned only in this response and never again.
   *
   * @param {string} username - User identifier (username)
   * @param {CreateApplicativeAccountRequest} [data] - Optional label for the account
   * @returns {Promise<ApplicativeAccountCreated>} The new account and its one-time password
   * @throws {ValidationError} When the user has no mail or the per-user limit is reached
   * @throws {NotFoundError} When the user is not found
   * @throws {ApiError} On other API errors
   */
  create = async (
    username: string,
    data: CreateApplicativeAccountRequest = {}
  ): Promise<ApplicativeAccountCreated> => {
    return this.http.post(`/api/v1/users/${encodeURIComponent(username)}/app-accounts`, data);
  };

  /**
   * Deletes an app account
   *
   * Idempotent: deleting an account that no longer exists still succeeds and
   * echoes the `uid` back.
   *
   * @param {string} username - User identifier (username)
   * @param {string} uid - Identifier of the app account to delete
   * @returns {Promise<DeleteApplicativeAccountResponse>} The deleted account's uid
   * @throws {ApiError} When the uid does not belong to the user, or on other API errors
   */
  delete = async (username: string, uid: string): Promise<DeleteApplicativeAccountResponse> => {
    return this.http.delete(
      `/api/v1/users/${encodeURIComponent(username)}/app-accounts/${encodeURIComponent(uid)}`
    );
  };
}
