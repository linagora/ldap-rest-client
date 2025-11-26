import { LdapRestClient } from '../../src/LdapRestClient';

describe('LdapRestClient', () => {
  const validConfig = {
    baseUrl: 'https://ldap-rest.example.com',
    auth: {
      type: 'hmac' as const,
      serviceId: 'test-service',
      secret: 'test-secret-at-least-32-characters-long',
    },
    logger: { minLevel: 6 },
  };

  const validCookieConfig = {
    baseUrl: 'https://ldap-rest.example.com',
    auth: {
      type: 'cookie' as const,
    },
    logger: { minLevel: 6 },
  };

  const minimalConfig = {
    baseUrl: 'https://ldap-rest.example.com',
    logger: { minLevel: 6 },
  };

  it('should throw error for missing baseUrl', () => {
    expect(() => new LdapRestClient({ ...validConfig, baseUrl: '' })).toThrow(
      'baseUrl is required'
    );
  });

  it('should throw error for missing serviceId in HMAC mode', () => {
    expect(
      () =>
        new LdapRestClient({
          ...validConfig,
          auth: { type: 'hmac', serviceId: '', secret: 'test-secret-at-least-32-characters-long' },
        })
    ).toThrow('serviceId is required for HMAC authentication');
  });

  it('should throw error for missing secret in HMAC mode', () => {
    expect(
      () =>
        new LdapRestClient({
          ...validConfig,
          auth: { type: 'hmac', serviceId: 'test-service', secret: '' },
        })
    ).toThrow('secret is required for HMAC authentication');
  });

  it('should throw error for invalid URL', () => {
    expect(() => new LdapRestClient({ ...validConfig, baseUrl: 'not-a-url' })).toThrow(
      'baseUrl must be a valid URL'
    );
  });

  it('should throw error for invalid timeout', () => {
    expect(() => new LdapRestClient({ ...validConfig, timeout: -1 })).toThrow(
      'timeout must be a positive number'
    );
  });

  it('should normalize baseUrl by removing trailing slash', () => {
    const client = new LdapRestClient({
      ...validConfig,
      baseUrl: 'https://ldap-rest.example.com/',
    });

    expect(client.getBaseUrl()).toBe('https://ldap-rest.example.com');
  });

  it('should create client with HMAC auth', () => {
    const client = new LdapRestClient(validConfig);
    expect(client).toBeInstanceOf(LdapRestClient);
    expect(client.users).toBeDefined();
    expect(client.organizations).toBeDefined();
  });

  it('should create client with Cookie auth', () => {
    const client = new LdapRestClient(validCookieConfig);
    expect(client).toBeInstanceOf(LdapRestClient);
    expect(client.users).toBeDefined();
    expect(client.organizations).toBeDefined();
  });

  it('should default to Cookie auth when no auth config provided', () => {
    const client = new LdapRestClient(minimalConfig);
    expect(client).toBeInstanceOf(LdapRestClient);
    expect(client.users).toBeDefined();
    expect(client.organizations).toBeDefined();
  });
});
