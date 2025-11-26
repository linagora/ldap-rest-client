import { ConfigValidator, type ClientConfig, type NormalizedClientConfig } from './config';
import { HmacAuth, HttpClient } from './lib';
import type { Auth } from './lib/Auth';
import { Logger } from 'tslog';
import { UsersResource, OrganizationsResource, GroupsResource } from './resources';

/**
 * LDAP-REST API Client
 *
 * Main client class for interacting with the LDAP-REST API.
 * Provides access to Users, Organizations, and Groups resources with HMAC or Cookie authentication.
 *
 * @example
 * ```typescript
 * // HMAC authentication for backend services
 * const client = new LdapRestClient({
 *   baseUrl: 'https://ldap-rest.example.com',
 *   auth: {
 *     type: 'hmac',
 *     serviceId: 'my-service',
 *     secret: 'my-secret-key-at-least-32-chars',
 *   }
 * });
 *
 * // Cookie authentication for browser (SSO)
 * const browserClient = new LdapRestClient({
 *   baseUrl: 'https://ldap-rest.example.com'
 * });
 *
 * await client.users.create({ ... });
 * await client.groups.create('org_abc123', { name: 'engineering' });
 * ```
 */
export class LdapRestClient {
  public readonly users: UsersResource;
  public readonly organizations: OrganizationsResource;
  public readonly groups: GroupsResource;
  private readonly config: NormalizedClientConfig;

  /**
   * Creates a new LDAP-REST client instance
   *
   * @param {ClientConfig} config - Client configuration
   * @throws {Error} When configuration is invalid
   */
  constructor(config: ClientConfig) {
    ConfigValidator.validate(config);
    this.config = ConfigValidator.normalize(config);

    const logger = new Logger({
      name: 'LDAP-REST-CLIENT',
      minLevel: 0,
      ...this.config.logger,
    });

    logger.info('Initializing LDAP-REST client', {
      baseUrl: this.config.baseUrl,
      authType: this.config.auth.type,
    });

    const auth: Auth | undefined =
      this.config.auth.type === 'hmac' ? new HmacAuth(this.config.auth) : undefined;

    const http = new HttpClient(ConfigValidator.toHttpConfig(this.config), auth, logger);

    this.users = new UsersResource(http);
    this.organizations = new OrganizationsResource(http);
    this.groups = new GroupsResource(http);
  }

  /**
   * Gets the configured base URL
   *
   * @returns {string} The base URL of the LDAP-REST API
   */
  getBaseUrl = (): string => {
    return this.config.baseUrl;
  };
}
