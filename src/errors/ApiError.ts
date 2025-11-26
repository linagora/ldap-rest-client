import { LdapRestError } from './LdapRestError';

/**
 * Error thrown when the API returns an error response
 *
 * Generic API error for non-specific HTTP errors that don't fall
 * into other specialized error categories.
 */
export class ApiError extends LdapRestError {
  /**
   * Creates a new API error
   *
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Machine-readable error code
   */
  constructor(message: string, statusCode: number, code: string) {
    super(message, statusCode, code);
  }

  /**
   * Creates an ApiError from an API response body
   *
   * @param {number} statusCode - HTTP status code from response
   * @param {{ error: string; code: string }} body - Response body containing error details
   * @returns {ApiError} New ApiError instance
   */
  static fromResponse(statusCode: number, body: { error: string; code: string }): ApiError {
    return new ApiError(body.error, statusCode, body.code);
  }
}

/**
 * Error thrown when request validation fails (HTTP 400)
 *
 * Indicates that the request parameters or body failed validation
 * before being sent to the server, or the server rejected the request
 * due to invalid data.
 */
export class ValidationError extends LdapRestError {
  /**
   * Creates a new validation error
   *
   * @param {string} message - Description of what validation failed
   */
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Error thrown when authentication fails (HTTP 401)
 *
 * Indicates that the HMAC signature is invalid or the request
 * lacks proper authentication credentials.
 */
export class AuthenticationError extends LdapRestError {
  /**
   * Creates a new authentication error
   *
   * @param {string} message - Authentication failure reason
   */
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Error thrown when authorization fails (HTTP 403)
 *
 * Indicates that the authenticated service lacks permission
 * to perform the requested operation.
 */
export class AuthorizationError extends LdapRestError {
  /**
   * Creates a new authorization error
   *
   * @param {string} message - Authorization failure reason
   */
  constructor(message: string) {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Error thrown when a resource is not found (HTTP 404)
 *
 * Indicates that the requested user, organization, or other
 * resource does not exist in the LDAP directory.
 */
export class NotFoundError extends LdapRestError {
  /**
   * Creates a new not found error
   *
   * @param {string} message - Description of what was not found
   * @param {string} [code] - Optional specific error code (defaults to 'NOT_FOUND')
   */
  constructor(message: string, code?: string) {
    super(message, 404, code || 'NOT_FOUND');
  }
}

/**
 * Error thrown when a resource conflict occurs (HTTP 409)
 *
 * Indicates that the operation conflicts with existing data,
 * such as attempting to create a user with a duplicate username,
 * email, or phone number.
 */
export class ConflictError extends LdapRestError {
  /**
   * Creates a new conflict error
   *
   * @param {string} message - Description of the conflict
   * @param {string} [code] - Optional specific error code (e.g., 'USERNAME_EXISTS', 'EMAIL_EXISTS')
   */
  constructor(message: string, code?: string) {
    super(message, 409, code || 'CONFLICT');
  }
}

/**
 * Error thrown when rate limit is exceeded (HTTP 429)
 *
 * Indicates that too many requests have been sent in a given
 * time period. The client should wait before retrying.
 */
export class RateLimitError extends LdapRestError {
  /** Number of seconds to wait before retrying (from Retry-After header) */
  public readonly retryAfter?: number;

  /**
   * Creates a new rate limit error
   *
   * @param {string} message - Rate limit error message
   * @param {number} [retryAfter] - Seconds to wait before retrying
   */
  constructor(message: string, retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when a network request fails
 *
 * Indicates connection failures, timeouts, or other network-level
 * errors that prevent the request from reaching the server.
 */
export class NetworkError extends LdapRestError {
  /** Original error that caused the network failure */
  public readonly cause?: Error;

  /**
   * Creates a new network error
   *
   * @param {string} message - Network error description
   * @param {Error} [cause] - Original error that caused the failure
   */
  constructor(message: string, cause?: Error) {
    super(message);
    this.cause = cause;
  }
}
