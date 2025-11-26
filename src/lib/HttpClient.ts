import type { HttpConfig } from '../config';
import type { Auth } from './Auth';
import type { Logger } from 'tslog';
import {
  ApiError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ValidationError,
} from '../errors';

/**
 * HTTP request options
 */
export interface RequestOptions {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Request path (relative to base URL) */
  path: string;
  /** Request body (will be JSON stringified) */
  body?: unknown;
  /** Additional headers to include */
  headers?: Record<string, string>;
}

/**
 * HTTP client with authentication and error handling
 *
 * Handles all HTTP communication with the LDAP-REST API including:
 * - Optional HMAC authentication or cookie-based SSO
 * - Error mapping and handling
 * - Request timeouts
 *
 * @example
 * ```typescript
 * const client = new HttpClient(config, auth);
 * const response = await client.get('/api/v1/users');
 * ```
 */
export class HttpClient {
  /**
   * Creates an HTTP client instance
   *
   * @param {HttpConfig} config - HTTP configuration (baseUrl, timeout)
   * @param {Auth | undefined} auth - Optional authentication handler (HMAC). If undefined, uses cookies.
   * @param {Logger<unknown>} logger - Logger instance
   */
  constructor(
    private readonly config: HttpConfig,
    private readonly auth: Auth | undefined,
    private readonly logger: Logger<unknown>
  ) {}

  /**
   * Makes an authenticated HTTP request
   *
   * @template T - Response type
   * @param {RequestOptions} options - Request options
   * @returns {Promise<T>} Parsed response body
   * @throws {ApiError} When API returns an error
   * @throws {NetworkError} When network request fails
   */
  request = async <T>(options: RequestOptions): Promise<T> => {
    const url = `${this.config.baseUrl}${options.path}`;
    const bodyString = options.body ? JSON.stringify(options.body) : undefined;

    this.logger.debug('Sending request', {
      method: options.method,
      url,
      hasBody: !!bodyString,
    });

    const authHeader = this.auth?.sign({
      method: options.method,
      path: options.path,
      body: bodyString,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: bodyString,
        signal: controller.signal,
        credentials: authHeader ? undefined : 'include',
      });

      clearTimeout(timeoutId);

      this.logger.info('Request completed', {
        method: options.method,
        path: options.path,
        status: response.status,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error('Request timeout', {
          method: options.method,
          path: options.path,
          timeoutMs: this.config.timeout,
        });
        throw new NetworkError(`Request timeout after ${this.config.timeout}ms`);
      }

      if (error instanceof NetworkError || error instanceof ApiError) {
        throw error;
      }

      this.logger.error('Network request failed', {
        method: options.method,
        path: options.path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new NetworkError(
        `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  };

  /**
   * Handles HTTP response
   *
   * Maps HTTP status codes to specific error types and parses response body.
   *
   * @template T - Response type
   * @param {Response} response - Fetch API response
   * @returns {Promise<T>} Parsed response body
   * @throws {ApiError} When API returns an error status
   * @private
   */
  private handleResponse = async <T>(response: Response): Promise<T> => {
    if (response.ok) {
      if (response.status === 204) {
        return { success: true } as T;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new ApiError('Expected JSON response', response.status, 'INVALID_RESPONSE');
      }

      return response.json() as Promise<T>;
    }

    let errorBody: { error: string; code: string } | undefined;

    try {
      const json = await response.json();
      errorBody = json as { error: string; code: string };
    } catch {
      // Ignore parse errors
    }

    const message = errorBody?.error ?? `HTTP ${response.status}: ${response.statusText}`;
    const code = errorBody?.code ?? 'UNKNOWN_ERROR';
    switch (response.status) {
      case 400:
        throw new ValidationError(message);
      case 401:
        throw new AuthenticationError(message);
      case 403:
        throw new AuthorizationError(message);
      case 404:
        throw new NotFoundError(message, code);
      case 409:
        throw new ConflictError(message, code);
      case 429: {
        const retryAfter = response.headers.get('retry-after');
        throw new RateLimitError(message, retryAfter ? parseInt(retryAfter, 10) : undefined);
      }
      default:
        if (errorBody) {
          throw ApiError.fromResponse(response.status, errorBody);
        }
        throw new ApiError(message, response.status, code);
    }
  };

  /**
   * Performs a GET request
   *
   * @template T - Response type
   * @param {string} path - Request path
   * @param {Record<string, string>} [headers] - Additional headers
   * @returns {Promise<T>} Parsed response body
   */
  get = <T>(path: string, headers?: Record<string, string>): Promise<T> => {
    return this.request<T>({ method: 'GET', path, headers });
  };

  /**
   * Performs a POST request
   *
   * @template T - Response type
   * @param {string} path - Request path
   * @param {unknown} [body] - Request body
   * @param {Record<string, string>} [headers] - Additional headers
   * @returns {Promise<T>} Parsed response body
   */
  post = <T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> => {
    return this.request<T>({ method: 'POST', path, body, headers });
  };

  /**
   * Performs a PATCH request
   *
   * @template T - Response type
   * @param {string} path - Request path
   * @param {unknown} [body] - Request body
   * @param {Record<string, string>} [headers] - Additional headers
   * @returns {Promise<T>} Parsed response body
   */
  patch = <T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> => {
    return this.request<T>({ method: 'PATCH', path, body, headers });
  };

  /**
   * Performs a DELETE request
   *
   * @template T - Response type
   * @param {string} path - Request path
   * @param {Record<string, string>} [headers] - Additional headers
   * @returns {Promise<T>} Parsed response body
   */
  delete = <T>(path: string, headers?: Record<string, string>): Promise<T> => {
    return this.request<T>({ method: 'DELETE', path, headers });
  };
}
