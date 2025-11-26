/**
 * Base error class for all LDAP-REST client errors
 *
 * All errors thrown by the client extend from this base class,
 * providing consistent error handling with status codes and error codes.
 */
export class LdapRestError extends Error {
  /** Error class name (automatically set to constructor name) */
  public readonly name: string;
  /** HTTP status code associated with the error (if applicable) */
  public readonly statusCode?: number;
  /** Machine-readable error code for programmatic handling */
  public readonly code?: string;

  /**
   * Creates a new LDAP-REST error
   *
   * @param {string} message - Human-readable error message
   * @param {number} [statusCode] - HTTP status code
   * @param {string} [code] - Machine-readable error code
   */
  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
