import type { HttpClient } from '../lib';

/**
 * Base class for all API resources
 *
 * Provides common functionality for resource classes including
 * HTTP client access and query string building.
 */
export abstract class BaseResource {
  /**
   * Creates a base resource instance
   *
   * @param {HttpClient} http - HTTP client for making requests
   * @protected
   */
  constructor(protected readonly http: HttpClient) {}

  /**
   * Builds a query string from parameters
   *
   * Filters out undefined and null values, and properly encodes
   * parameter names and values for URL use.
   *
   * @param {Record<string, string | number | boolean | undefined>} params - Query parameters
   * @returns {string} Formatted query string with leading '?' or empty string
   * @protected
   *
   * @example
   * ```typescript
   * buildQueryString({ field: 'username', value: 'john' })
   * // Returns: "?field=username&value=john"
   * ```
   */
  protected buildQueryString = (
    params: Record<string, string | number | boolean | undefined>
  ): string => {
    const entries = Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null
    );

    if (entries.length === 0) {
      return '';
    }

    const queryParams = entries.map(
      ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    );

    return `?${queryParams.join('&')}`;
  };
}
