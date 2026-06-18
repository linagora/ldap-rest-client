import type { HttpClient } from '../lib';
import { ScimUsersResource, DEFAULT_SCIM_PREFIX } from './ScimUsersResource';

/**
 * SCIM 2.0 resource namespace.
 *
 * Groups the SCIM sub-resources exposed by the LDAP-REST server. Currently only
 * `users` is implemented; `groups` can be added here without changing the public
 * client shape.
 *
 * @example
 * ```typescript
 * await client.scim.users.create({ schemas: [SCIM_USER_SCHEMA], userName: 'jane' });
 * ```
 */
export class ScimResource {
  /** SCIM Users sub-resource. */
  public readonly users: ScimUsersResource;

  /**
   * Creates the SCIM resource namespace.
   *
   * @param {HttpClient} http - HTTP client for making requests
   * @param {string} [prefix=DEFAULT_SCIM_PREFIX] - SCIM endpoint prefix, to match a non-default `DM_SCIM_PREFIX`
   */
  constructor(http: HttpClient, prefix: string = DEFAULT_SCIM_PREFIX) {
    this.users = new ScimUsersResource(http, prefix);
  }
}
