import { BaseResource } from '../../src/resources/BaseResource';
import type { HttpClient } from '../../src/lib/HttpClient';

class TestResource extends BaseResource {
  testBuildQueryString(params: Record<string, string | number | boolean | undefined>): string {
    return this.buildQueryString(params);
  }
}

describe('BaseResource', () => {
  let resource: TestResource;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    resource = new TestResource(mockHttpClient);
  });

  describe('buildQueryString', () => {
    it('should build query string from params', () => {
      const result = resource.testBuildQueryString({
        field: 'username',
        value: 'johndoe',
      });

      expect(result).toBe('?field=username&value=johndoe');
    });

    it('should encode special characters', () => {
      const result = resource.testBuildQueryString({
        email: 'john+doe@example.com',
        fields: 'cn,mail',
      });

      expect(result).toBe('?email=john%2Bdoe%40example.com&fields=cn%2Cmail');
    });

    it('should handle numbers and booleans', () => {
      const result = resource.testBuildQueryString({
        page: 1,
        limit: 10,
        active: true,
      });

      expect(result).toBe('?page=1&limit=10&active=true');
    });

    it('should filter out undefined values', () => {
      const result = resource.testBuildQueryString({
        field: 'username',
        value: 'johndoe',
        optional: undefined,
      });

      expect(result).toBe('?field=username&value=johndoe');
    });

    it('should return empty string when all params are undefined', () => {
      const result = resource.testBuildQueryString({
        param1: undefined,
        param2: undefined,
      });

      expect(result).toBe('');
    });

    it('should return empty string for empty params object', () => {
      const result = resource.testBuildQueryString({});

      expect(result).toBe('');
    });

    it('should handle mixed defined and undefined values', () => {
      const result = resource.testBuildQueryString({
        defined1: 'value1',
        undefined1: undefined,
        defined2: 'value2',
        undefined2: undefined,
      });

      expect(result).toBe('?defined1=value1&defined2=value2');
    });

    it('should encode spaces correctly', () => {
      const result = resource.testBuildQueryString({
        name: 'John Doe',
      });

      expect(result).toBe('?name=John%20Doe');
    });

    it('should handle zero as a valid value', () => {
      const result = resource.testBuildQueryString({
        count: 0,
        page: 1,
      });

      expect(result).toBe('?count=0&page=1');
    });

    it('should handle false as a valid value', () => {
      const result = resource.testBuildQueryString({
        active: false,
        verified: true,
      });

      expect(result).toBe('?active=false&verified=true');
    });

    it('should handle empty string as a valid value', () => {
      const result = resource.testBuildQueryString({
        query: '',
        page: 1,
      });

      expect(result).toBe('?query=&page=1');
    });
  });
});
