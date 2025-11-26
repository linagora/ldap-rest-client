import type { ISettingsParam } from 'tslog';

/**
 * HMAC authentication configuration for backend services
 */
export interface HmacAuthConfig {
  type: 'hmac';
  serviceId: string;
  secret: string;
}

/**
 * SSO Cookie authentication configuration for browser requests
 */
export interface CookieAuthConfig {
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
  baseUrl: string;
  auth?: AuthConfig;
  timeout?: number;
  logger?: ISettingsParam<unknown>;
}

/**
 * Normalized client configuration with defaults applied
 */
export interface NormalizedClientConfig {
  baseUrl: string;
  auth: AuthConfig;
  timeout: number;
  logger?: ISettingsParam<unknown>;
}

/**
 * HTTP client configuration
 */
export interface HttpConfig {
  baseUrl: string;
  timeout: number;
}

export class ConfigValidator {
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

  static normalize(config: ClientConfig): NormalizedClientConfig {
    return {
      baseUrl: config.baseUrl.replace(/\/$/, ''),
      auth: config.auth ?? { type: 'cookie' },
      timeout: config.timeout ?? 30000,
      logger: config.logger,
    };
  }

  static toHttpConfig(config: NormalizedClientConfig): HttpConfig {
    return {
      baseUrl: config.baseUrl,
      timeout: config.timeout,
    };
  }
}
