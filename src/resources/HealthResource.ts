import { BaseResource } from './BaseResource';
import type { Health } from '../models/Health';

/**
 * Health resource - Service liveness and dependency health probes.
 *
 * Wraps ldap-rest's `GET /api/health` endpoint. The endpoint reports the
 * service's aggregate status and per-dependency breakdown (currently only
 * LDAP backend reachability).
 *
 * Note: ldap-rest returns HTTP 503 when the service cannot serve requests.
 * The HTTP client maps that to `ApiError` and the structured `Health` body
 * is not preserved on the thrown error - only `error`/`code` survive. To
 * surface a `degraded` state without raising, rely on the 200-with-`degraded`
 * response shape; to detect `unhealthy`, catch the `ApiError`.
 *
 * @example
 * ```typescript
 * const client = new LdapRestClient(config);
 * const health = await client.health.check();
 * if (health.status !== 'healthy') {
 *   console.warn('LDAP-REST is', health.status, health.dependencies);
 * }
 * ```
 */
export class HealthResource extends BaseResource {
  /**
   * Retrieves the current health status of the LDAP-REST service.
   *
   * @returns {Promise<Health>} Service health summary including dependency statuses
   * @throws {ApiError} When the service is unhealthy (HTTP 503) or returns a non-2xx
   * @throws {NetworkError} When the request times out or the network fails
   */
  check = async (): Promise<Health> => {
    return this.http.get('/api/health');
  };
}
