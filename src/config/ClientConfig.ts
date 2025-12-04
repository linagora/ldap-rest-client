import type { ISettingsParam } from 'tslog';

/**
 * HMAC authentication configuration for backend services
 * Uses HMAC-SHA256 signatures as per ADR-024
 */
export interface HmacAuthConfig {
  /** Authentication type */
  type: 'hmac';
  /** Service identifier (e.g., 'registration-service') */
  serviceId: string;
  /** Shared secret key (minimum 32 characters recommended) */
  secret: string;
}

/**
 * SSO Cookie authentication configuration for browser requests
 * Relies on cookies set by the authentication service
 */
export interface CookieAuthConfig {
  /** Authentication type */
  type: 'cookie';
}

/**
 * Authentication configuration union type
 */
export type AuthConfig = HmacAuthConfig | CookieAuthConfig;

/**
 * Configuration for LDAP-REST client
 */
export interface ClientConfig {
  /** Base URL of the LDAP-REST API (e.g., 'https://ldap-rest.example.com') */
  baseUrl: string;
  /** Authentication configuration (defaults to cookie auth if not provided) */
  auth?: AuthConfig;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** tslog logger configuration for custom logging */
  logger?: ISettingsParam<unknown>;
}

/**
 * Normalized client configuration with defaults applied
 * Used internally after validation and normalization
 */
export interface NormalizedClientConfig {
  /** Base URL with trailing slash removed */
  baseUrl: string;
  /** Authentication configuration (cookie auth if not provided) */
  auth: AuthConfig;
  /** Request timeout in milliseconds */
  timeout: number;
  /** tslog logger configuration */
  logger?: ISettingsParam<unknown>;
}

/**
 * HTTP client configuration
 * Subset of configuration passed to the HTTP client
 */
export interface HttpConfig {
  /** Base URL of the API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
}

/**
 * Validates and normalizes client configuration
 */
export class ConfigValidator {
  /**
   * Validates the client configuration
   * @param {ClientConfig} config - Configuration to validate
   * @throws {Error} If configuration is invalid
   */
  static validate(config: ClientConfig): void {
    if (!config.baseUrl || config.baseUrl.trim().length === 0) {
      throw new Error('baseUrl is required');
    }

    if (config.auth?.type === 'hmac') {
      if (!config.auth.serviceId || config.auth.serviceId.trim().length === 0) {
        throw new Error('serviceId is required for HMAC authentication');
      }

      if (!config.auth.secret || config.auth.secret.trim().length === 0) {
        throw new Error('secret is required for HMAC authentication');
      }

      if (config.auth.secret.length < 32) {
        console.warn(
          `[LDAP-REST Client] Secret should be at least 32 characters (current: ${config.auth.secret.length})`
        );
      }
    }

    try {
      new URL(config.baseUrl);
    } catch {
      throw new Error('baseUrl must be a valid URL');
    }

    if (config.timeout !== undefined && (config.timeout <= 0 || !Number.isFinite(config.timeout))) {
      throw new Error('timeout must be a positive number');
    }
  }

  /**
   * Normalizes the client configuration by applying defaults
   * @param {ClientConfig} config - Configuration to normalize
   * @returns {NormalizedClientConfig} Normalized configuration with defaults applied
   */
  static normalize(config: ClientConfig): NormalizedClientConfig {
    return {
      baseUrl: config.baseUrl.replace(/\/$/, ''),
      auth: config.auth ?? { type: 'cookie' },
      timeout: config.timeout ?? 30000,
      logger: config.logger,
    };
  }

  /**
   * Extracts HTTP-specific configuration from normalized config
   * @param {NormalizedClientConfig} config - Normalized configuration
   * @returns {HttpConfig} HTTP client configuration
   */
  static toHttpConfig(config: NormalizedClientConfig): HttpConfig {
    return {
      baseUrl: config.baseUrl,
      timeout: config.timeout,
    };
  }
}
