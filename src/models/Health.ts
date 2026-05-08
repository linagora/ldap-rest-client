/**
 * Service-level health summary returned by `GET /api/health`.
 *
 * `status` aggregates the dependency statuses:
 * - `healthy` - all dependencies reachable and responsive
 * - `degraded` - service is up but at least one dependency is unhealthy
 * - `unhealthy` - service cannot serve requests; HTTP 503 is returned
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Per-dependency health snapshot.
 *
 * Currently ldap-rest only reports on its LDAP backend. The shape is a
 * map so additional dependencies can be added without breaking changes.
 */
export interface HealthDependencies {
  /** LDAP backend reachability */
  ldap: 'healthy' | 'unhealthy';
  /** Forward-compatible: future dependencies may be reported here */
  [key: string]: 'healthy' | 'unhealthy';
}

/**
 * Response body of `GET /api/health`.
 */
export interface Health {
  /** Aggregated service status */
  status: HealthStatus;
  /** ISO-8601 timestamp of the check */
  timestamp: string;
  /** Per-dependency status */
  dependencies: HealthDependencies;
}
