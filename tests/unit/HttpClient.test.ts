import { HttpClient } from '../../src/lib/HttpClient';
import type { HttpConfig } from '../../src/config';
import type { Auth } from '../../src/lib/Auth';
import { Logger } from 'tslog';
import {
  ApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from '../../src/errors';

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockAuth: jest.Mocked<Auth>;
  let mockLogger: jest.Mocked<Logger<unknown>>;
  let mockFetch: jest.Mock;
  const baseConfig: HttpConfig = {
    baseUrl: 'https://api.example.com',
    timeout: 30000,
  };

  beforeEach(() => {
    mockAuth = {
      sign: jest.fn(),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger<unknown>>;

    mockFetch = jest.fn();
    global.fetch = mockFetch;

    httpClient = new HttpClient(baseConfig, mockAuth, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('request', () => {
    it('should make GET request successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      const result = await httpClient.get('/api/v1/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'HMAC auth-header',
          }),
        })
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('should make POST request successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      const body = { name: 'test' };
      const result = await httpClient.post('/api/v1/test', body);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should make PUT request successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      const body = { name: 'updated' };
      const result = await httpClient.put('/api/v1/test/1', body);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should make PATCH request successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      const body = { name: 'patched' };
      const result = await httpClient.patch('/api/v1/test/1', body);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should make DELETE request successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        headers: new Headers({ 'content-type': 'application/json' }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      const result = await httpClient.delete('/api/v1/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should include cookies when no auth is provided', async () => {
      const clientWithoutAuth = new HttpClient(baseConfig, undefined, mockLogger);
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await clientWithoutAuth.get('/api/v1/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test',
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should handle 204 No Content response', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        headers: new Headers(),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      const result = await httpClient.delete('/api/v1/test/1');

      expect(result).toEqual({ success: true });
    });

    it('should throw error for non-JSON response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(ApiError);
      await expect(httpClient.get('/api/v1/test')).rejects.toThrow('Expected JSON response');
    });

    it('should handle request timeout', async () => {
      jest.useFakeTimers();

      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(abortError), 100);
          })
      );

      const promise = httpClient.get('/api/v1/test');

      jest.advanceTimersByTime(30000);

      await expect(promise).rejects.toThrow(NetworkError);
      await expect(promise).rejects.toThrow('Request timeout after 30000ms');

      jest.useRealTimers();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network failure');
      mockFetch.mockRejectedValue(networkError);

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(NetworkError);
      await expect(httpClient.get('/api/v1/test')).rejects.toThrow('Network request failed');
    });

    it('should rethrow ApiError and NetworkError without wrapping', async () => {
      const apiError = new ApiError('API Error', 500, 'ERROR_CODE');
      mockFetch.mockRejectedValue(apiError);

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(apiError);
    });
  });

  describe('handleResponse', () => {
    it('should throw ValidationError for 400 status', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({
          error: 'Invalid input',
          code: 'VALIDATION_ERROR',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(ValidationError);
      await expect(httpClient.get('/api/v1/test')).rejects.toThrow('Invalid input');
    });

    it('should throw AuthenticationError for 401 status', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({
          error: 'Invalid credentials',
          code: 'AUTHENTICATION_ERROR',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(AuthenticationError);
      await expect(httpClient.get('/api/v1/test')).rejects.toThrow('Invalid credentials');
    });

    it('should throw AuthorizationError for 403 status', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue({
          error: 'Access denied',
          code: 'AUTHORIZATION_ERROR',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(AuthorizationError);
      await expect(httpClient.get('/api/v1/test')).rejects.toThrow('Access denied');
    });

    it('should throw NotFoundError for 404 status', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(NotFoundError);
      await expect(httpClient.get('/api/v1/test')).rejects.toThrow('User not found');
    });

    it('should throw ConflictError for 409 status', async () => {
      const mockResponse = {
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: jest.fn().mockResolvedValue({
          error: 'Username already exists',
          code: 'USERNAME_EXISTS',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(ConflictError);
      await expect(httpClient.get('/api/v1/test')).rejects.toThrow('Username already exists');
    });

    it('should throw RateLimitError for 429 status', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'retry-after': '60' }),
        json: jest.fn().mockResolvedValue({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(RateLimitError);
      const error = await httpClient.get('/api/v1/test').catch((e) => e);
      expect(error.retryAfter).toBe(60);
    });

    it('should throw RateLimitError without retry-after header', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      const error = await httpClient.get('/api/v1/test').catch((e) => e);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.retryAfter).toBeUndefined();
    });

    it('should throw ApiError for other error status codes', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({
          error: 'Server error',
          code: 'INTERNAL_ERROR',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(ApiError);
      const error = await httpClient.get('/api/v1/test').catch((e) => e);
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });

    it('should handle error response without JSON body', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(ApiError);
      const error = await httpClient.get('/api/v1/test').catch((e) => e);
      expect(error.message).toContain('HTTP 500');
      expect(error.code).toBe('UNKNOWN_ERROR');
    });

    it('should use ApiError.fromResponse for status with error body', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: jest.fn().mockResolvedValue({
          error: 'Service temporarily unavailable',
          code: 'SERVICE_UNAVAILABLE',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      const error = await httpClient.get('/api/v1/test').catch((e) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Service temporarily unavailable');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });
  });

  describe('HTTP method convenience functions', () => {
    it('should support custom headers in GET', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await httpClient.get('/api/v1/test', { 'X-Custom': 'header' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'header',
          }),
        })
      );
    });

    it('should support custom headers in POST', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await httpClient.post('/api/v1/test', { data: 'test' }, { 'X-Custom': 'header' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'header',
          }),
        })
      );
    });

    it('should support custom headers in PUT', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await httpClient.put('/api/v1/test', { data: 'test' }, { 'X-Custom': 'header' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'header',
          }),
        })
      );
    });

    it('should support custom headers in PATCH', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await httpClient.patch('/api/v1/test', { data: 'test' }, { 'X-Custom': 'header' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'header',
          }),
        })
      );
    });

    it('should support custom headers in DELETE', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        headers: new Headers(),
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockAuth.sign.mockReturnValue('HMAC auth-header');

      await httpClient.delete('/api/v1/test', { 'X-Custom': 'header' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'header',
          }),
        })
      );
    });
  });
});
