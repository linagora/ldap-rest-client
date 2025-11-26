import type { SignatureParams } from './HmacAuth';

/**
 * Base authentication interface
 *
 * All authentication implementations must provide a sign method
 * that returns an authorization header value or empty string.
 */
export interface Auth {
  /**
   * Generates authorization header for a request
   *
   * @param {SignatureParams} params - Request parameters to sign
   * @returns {string} Authorization header value or empty string if no header needed
   */
  sign(params: SignatureParams): string;
}
