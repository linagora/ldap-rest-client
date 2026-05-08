import { BaseResource } from './BaseResource';
import type { Health } from '../models/Health';

/**
 * Health resource - Service liveness and dependency health probes.
 *
 * Wraps ldap-rest's `GET /api/health` endpoint. The endpoint reports the
 * service's aggregate status and per-dependency breakdown (currently only
 * LDAP backend reachability).
 *
 * Note: ldap-rest returns HTTP 503 with a fully-formed `Health` body when
 * the service is unhealthy. The HTTP client raises an error in that case;
 * callers that want to surface a "degraded/unhealthy" state without an
 * exception should catch and inspect.
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
   * @throws {ApiError} When the service is unhealthy (HTTP 503) or unreachable
   */
  check = async (): Promise<Health> => {
    return this.http.get('/api/health');
  };
}
