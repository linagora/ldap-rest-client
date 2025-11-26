import { createHmac, createHash } from 'crypto';
import { HmacAuth } from '../../src/lib/HmacAuth';

describe('HmacAuth', () => {
  const config = {
    type: 'hmac' as const,
    serviceId: 'test-service',
    secret: 'test-secret-at-least-32-characters-long',
  };

  let auth: HmacAuth;

  beforeEach(() => {
    auth = new HmacAuth(config);
  });

  describe('sign', () => {
    it('should generate valid authorization header', () => {
      const header = auth.sign({
        method: 'GET',
        path: '/api/v1/users',
      });

      expect(header).toMatch(/^HMAC-SHA256 test-service:\d+:[a-f0-9]{64}$/);
    });

    it('should generate different signatures for different methods', () => {
      const header1 = auth.sign({ method: 'GET', path: '/api/v1/users' });
      const header2 = auth.sign({ method: 'POST', path: '/api/v1/users' });

      const sig1 = header1.split(':')[2];
      const sig2 = header2.split(':')[2];

      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for different paths', () => {
      const header1 = auth.sign({ method: 'GET', path: '/api/v1/users' });
      const header2 = auth.sign({ method: 'GET', path: '/api/v1/organizations' });

      const sig1 = header1.split(':')[2];
      const sig2 = header2.split(':')[2];

      expect(sig1).not.toBe(sig2);
    });

    it('should include body hash in signature for POST requests', () => {
      const body = JSON.stringify({ username: 'test' });
      const header = auth.sign({
        method: 'POST',
        path: '/api/v1/users',
        body,
      });

      const match = header.match(/^HMAC-SHA256 ([^:]+):(\d+):([a-f0-9]{64})$/);
      expect(match).not.toBeNull();

      const [, serviceId, timestamp, signature] = match!;

      const bodyHash = createHash('sha256').update(body).digest('hex');
      const signingString = `POST|/api/v1/users|${timestamp}|${bodyHash}`;
      const expectedSignature = createHmac('sha256', config.secret)
        .update(signingString)
        .digest('hex');

      expect(signature).toBe(expectedSignature);
      expect(serviceId).toBe('test-service');
    });

    it('should not include body hash for GET requests', () => {
      const header = auth.sign({
        method: 'GET',
        path: '/api/v1/users',
      });

      const match = header.match(/^HMAC-SHA256 ([^:]+):(\d+):([a-f0-9]{64})$/);
      expect(match).not.toBeNull();

      const [, , timestamp, signature] = match!;

      const signingString = `GET|/api/v1/users|${timestamp}|`;
      const expectedSignature = createHmac('sha256', config.secret)
        .update(signingString)
        .digest('hex');

      expect(signature).toBe(expectedSignature);
    });

    it('should normalize method to uppercase', () => {
      const header1 = auth.sign({ method: 'post', path: '/api/v1/users' });
      const header2 = auth.sign({ method: 'POST', path: '/api/v1/users' });

      expect(header1).toMatch(/^HMAC-SHA256 test-service:\d+:[a-f0-9]{64}$/);
      expect(header2).toMatch(/^HMAC-SHA256 test-service:\d+:[a-f0-9]{64}$/);
    });

    it('should handle empty body string', () => {
      const header = auth.sign({
        method: 'POST',
        path: '/api/v1/users',
        body: '',
      });

      expect(header).toMatch(/^HMAC-SHA256 test-service:\d+:[a-f0-9]{64}$/);
    });

    it('should handle paths with query parameters', () => {
      const header = auth.sign({
        method: 'GET',
        path: '/api/v1/users?page=1&limit=20',
      });

      expect(header).toMatch(/^HMAC-SHA256 test-service:\d+:[a-f0-9]{64}$/);
    });
  });

  it('should not include credentials in fetch requests', async () => {
    const { HttpClient } = await import('../../src/lib/HttpClient');
    const { Logger } = await import('tslog');

    const logger = new Logger({ minLevel: 6 });
    const http = new HttpClient(
      { baseUrl: 'https://api.example.com', timeout: 30000 },
      auth,
      logger
    );

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true }),
    } as Response);

    await http.get('/api/v1/users');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/users',
      expect.objectContaining({
        credentials: undefined,
      })
    );
  });
});
