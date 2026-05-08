import { HealthResource } from '../../src/resources/HealthResource';
import { HttpClient } from '../../src/lib/HttpClient';
import type { Health } from '../../src/models/Health';

describe('HealthResource', () => {
  let health: HealthResource;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    health = new HealthResource(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create health resource', () => {
    expect(health).toBeInstanceOf(HealthResource);
  });

  describe('check', () => {
    it('should request /api/health and return the parsed body', async () => {
      const response: Health = {
        status: 'healthy',
        timestamp: '2026-05-08T09:00:00.000Z',
        dependencies: { ldap: 'healthy' },
      };
      mockHttpClient.get.mockResolvedValue(response);

      const result = await health.check();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/health');
      expect(result).toEqual(response);
    });

    it('should pass through degraded responses unchanged', async () => {
      const response: Health = {
        status: 'degraded',
        timestamp: '2026-05-08T09:01:00.000Z',
        dependencies: { ldap: 'unhealthy' },
      };
      mockHttpClient.get.mockResolvedValue(response);

      const result = await health.check();

      expect(result.status).toBe('degraded');
      expect(result.dependencies.ldap).toBe('unhealthy');
    });

    it('should propagate errors from the HTTP client', async () => {
      const error = new Error('Service unavailable');
      mockHttpClient.get.mockRejectedValue(error);

      await expect(health.check()).rejects.toThrow('Service unavailable');
    });
  });
});
