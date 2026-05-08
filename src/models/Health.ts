/**
 * Reachability state of a single dependency.
 */
export type DependencyStatus = 'healthy' | 'unhealthy';

/**
 * Aggregated service status.
 *
 * - `healthy` - all dependencies reachable and responsive
 * - `degraded` - service is up but at least one dependency is unhealthy
 * - `unhealthy` - service cannot serve requests; HTTP 503 is returned
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Per-dependency health snapshot. ldap-rest currently only reports on its
 * LDAP backend; new dependencies will be added as required fields in a
 * minor SDK release (additive change, non-breaking for consumers).
 */
export interface HealthDependencies {
  /** LDAP backend reachability */
  ldap: DependencyStatus;
}

/**
 * Response body of `GET /api/health`.
 */
export interface Health {
  status: HealthStatus;
  /** ISO-8601 timestamp of the check */
  timestamp: string;
  dependencies: HealthDependencies;
}
