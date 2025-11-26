import { createHmac, createHash } from 'crypto';
import type { HmacAuthConfig } from '../config';
import type { Auth } from './Auth';

/**
 * Parameters for request signature generation
 */
export interface SignatureParams {
  /** HTTP method (GET, POST, PATCH, DELETE) */
  method: string;
  /** Request path with query string */
  path: string;
  /** Request body as string (for POST/PATCH) */
  body?: string;
}

/**
 * HMAC signature components
 */
export interface HmacSignature {
  /** Service identifier */
  serviceId: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** HMAC-SHA256 signature as hex string */
  signature: string;
}

/**
 * HMAC-SHA256 authentication handler
 *
 * Implements request signing per ADR-024 specification:
 * - Signature format: HMAC-SHA256(secret, "METHOD|PATH|timestamp|body-hash")
 * - Header format: Authorization: HMAC-SHA256 service-id:timestamp:signature
 *
 * @example
 * ```typescript
 * const auth = new HmacAuth({
 *   type: 'hmac',
 *   serviceId: 'my-service',
 *   secret: 'my-secret-key'
 * });
 *
 * const authHeader = auth.sign({
 *   method: 'POST',
 *   path: '/api/v1/users',
 *   body: JSON.stringify(data)
 * });
 * ```
 */
export class HmacAuth implements Auth {
  /**
   * Creates an HMAC authentication handler
   *
   * @param {HmacAuthConfig} config - HMAC authentication configuration containing serviceId and secret
   */
  constructor(private readonly config: HmacAuthConfig) {}

  /**
   * Generates authorization header for a request
   *
   * @param {SignatureParams} params - Request parameters to sign
   * @returns {string} Authorization header value in format "HMAC-SHA256 service-id:timestamp:signature"
   */
  sign = (params: SignatureParams): string => {
    const signature = this.generateSignature(params);
    return `HMAC-SHA256 ${signature.serviceId}:${signature.timestamp}:${signature.signature}`;
  };

  /**
   * Generates HMAC signature components
   *
   * @param {SignatureParams} params - Request parameters
   * @returns {HmacSignature} Signature components including service ID, timestamp, and signature
   * @private
   */
  private generateSignature = (params: SignatureParams): HmacSignature => {
    const timestamp = Date.now();
    const bodyHash = this.hashBody(params.method, params.body);
    const signingString = `${params.method.toUpperCase()}|${params.path}|${timestamp}|${bodyHash}`;
    const signature = this.computeHmac(signingString);

    return {
      serviceId: this.config.serviceId,
      timestamp,
      signature,
    };
  };

  /**
   * Computes SHA256 hash of request body
   *
   * For GET/DELETE/HEAD requests, returns empty string.
   * For other methods, returns SHA256 hash of body if provided.
   *
   * @param {string} method - HTTP method
   * @param {string} [body] - Request body
   * @returns {string} SHA256 hash as hex string or empty string
   * @private
   */
  private hashBody = (method: string, body?: string): string => {
    const upperMethod = method.toUpperCase();

    if (upperMethod === 'GET' || upperMethod === 'DELETE' || upperMethod === 'HEAD') {
      return '';
    }

    if (!body || body.trim().length === 0) {
      return '';
    }

    return createHash('sha256').update(body, 'utf8').digest('hex');
  };

  /**
   * Computes HMAC-SHA256 signature
   *
   * @param {string} data - Data to sign
   * @returns {string} HMAC-SHA256 signature as hex string
   * @private
   */
  private computeHmac = (data: string): string => {
    return createHmac('sha256', this.config.secret).update(data, 'utf8').digest('hex');
  };
}
