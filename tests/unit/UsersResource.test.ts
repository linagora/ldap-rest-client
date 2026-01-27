import { UsersResource } from '../../src/resources/UsersResource';
import { HttpClient } from '../../src/lib/HttpClient';
import type { Organization } from '../../src/models/Organization';
import type { User } from '../../src/models/User';

describe('UsersResource', () => {
  let users: UsersResource;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    users = new UsersResource(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create users resource', () => {
    expect(users).toBeInstanceOf(UsersResource);
  });

  describe('getUserOrganizations', () => {
    it('should get all organizations for a user', async () => {
      const response: Organization[] = [
        {
          id: 'org_abc123',
          name: 'Acme Corp',
          domain: 'acme.example.com',
          baseDN: 'o=acme-corp,dc=example,dc=com',
          status: 'active',
          createdAt: new Date('2025-01-23T10:30:00Z'),
        },
        {
          id: 'org_xyz789',
          name: 'Tech Inc',
          domain: 'tech.example.com',
          baseDN: 'o=tech-inc,dc=example,dc=com',
          status: 'active',
          createdAt: new Date('2025-01-20T09:00:00Z'),
        },
      ];
      mockHttpClient.get.mockResolvedValue(response);

      const result = await users.getUserOrganizations('john.doe');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/users/john.doe/organizations');
      expect(result).toEqual(response);
    });

    it('should filter organizations by role', async () => {
      const response: Organization[] = [
        {
          id: 'org_abc123',
          name: 'Acme Corp',
          domain: 'acme.example.com',
          baseDN: 'o=acme-corp,dc=example,dc=com',
          status: 'active',
          createdAt: new Date('2025-01-23T10:30:00Z'),
        },
      ];
      mockHttpClient.get.mockResolvedValue(response);

      const result = await users.getUserOrganizations('john.doe', 'owner');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/users/john.doe/organizations?role=owner'
      );
      expect(result).toEqual(response);
    });

    it('should handle special characters in userId', async () => {
      const response: Organization[] = [];
      mockHttpClient.get.mockResolvedValue(response);

      await users.getUserOrganizations('john+doe@example.com');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/users/john%2Bdoe%40example.com/organizations'
      );
    });

    it('should handle all valid roles', async () => {
      const roles = ['owner', 'admin', 'moderator', 'member'];
      mockHttpClient.get.mockResolvedValue([]);

      for (const role of roles) {
        await users.getUserOrganizations('john.doe', role);

        expect(mockHttpClient.get).toHaveBeenCalledWith(
          `/api/v1/users/john.doe/organizations?role=${role}`
        );
      }
    });

    it('should return empty array when user has no organizations', async () => {
      mockHttpClient.get.mockResolvedValue([]);

      const result = await users.getUserOrganizations('new.user');

      expect(result).toEqual([]);
    });
  });

  describe('search', () => {
    it('should search users by username', async () => {
      const response: User[] = [
        {
          cn: 'johndoe',
          sn: 'Doe',
          givenName: 'John',
          displayName: 'John Doe',
          mail: 'john@example.com',
          mobile: '+1234567890',
          userPassword: 'encrypted',
          scryptR: 8,
          scryptN: 16384,
          scryptP: 1,
          scryptSalt: 'salt',
          scryptDKLength: 32,
          iterations: 10000,
          domain: 'example.com',
          publicKey: 'pub',
          privateKey: 'priv',
          protectedKey: 'protected',
        },
      ];
      mockHttpClient.get.mockResolvedValue(response);

      const result = await users.search({
        by: 'username',
        value: 'johndoe',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/users/search?by=username&value=johndoe'
      );
      expect(result).toEqual(response);
    });

    it('should search users by email', async () => {
      const response: User[] = [
        {
          cn: 'johndoe',
          sn: 'Doe',
          givenName: 'John',
          displayName: 'John Doe',
          mail: 'john@example.com',
          mobile: '+1234567890',
          userPassword: 'encrypted',
          scryptR: 8,
          scryptN: 16384,
          scryptP: 1,
          scryptSalt: 'salt',
          scryptDKLength: 32,
          iterations: 10000,
          domain: 'example.com',
          publicKey: 'pub',
          privateKey: 'priv',
          protectedKey: 'protected',
        },
      ];
      mockHttpClient.get.mockResolvedValue(response);

      const result = await users.search({
        by: 'email',
        value: 'john@example.com',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/users/search?by=email&value=john%40example.com'
      );
      expect(result).toEqual(response);
    });

    it('should search users with field filtering', async () => {
      const response: User[] = [
        {
          cn: 'johndoe',
          mail: 'john@example.com',
        } as User,
      ];
      mockHttpClient.get.mockResolvedValue(response);

      const result = await users.search({
        by: 'username',
        value: 'johndoe',
        fields: 'cn,mail',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/users/search?by=username&value=johndoe&fields=cn%2Cmail'
      );
      expect(result).toEqual(response);
    });

    it('should return empty array when no users match', async () => {
      mockHttpClient.get.mockResolvedValue([]);

      const result = await users.search({
        by: 'username',
        value: 'nonexistent',
      });

      expect(result).toEqual([]);
    });

    it('should search by phone number', async () => {
      const response: User[] = [
        {
          cn: 'johndoe',
          sn: 'Doe',
          givenName: 'John',
          displayName: 'John Doe',
          mail: 'john@example.com',
          mobile: '+1234567890',
          userPassword: 'encrypted',
          scryptR: 8,
          scryptN: 16384,
          scryptP: 1,
          scryptSalt: 'salt',
          scryptDKLength: 32,
          iterations: 10000,
          domain: 'example.com',
          publicKey: 'pub',
          privateKey: 'priv',
          protectedKey: 'protected',
        },
      ];
      mockHttpClient.get.mockResolvedValue(response);

      const result = await users.search({
        by: 'phone',
        value: '+1234567890',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/users/search?by=phone&value=%2B1234567890'
      );
      expect(result).toEqual(response);
    });

    it('should return multiple users from different branches', async () => {
      const response: User[] = [
        {
          cn: 'johndoe',
          sn: 'Doe',
          givenName: 'John',
          displayName: 'John Doe',
          mail: 'john@b2c.com',
          mobile: '+1234567890',
          userPassword: 'encrypted',
          scryptR: 8,
          scryptN: 16384,
          scryptP: 1,
          scryptSalt: 'salt',
          scryptDKLength: 32,
          iterations: 10000,
          domain: 'example.com',
          publicKey: 'pub',
          privateKey: 'priv',
          protectedKey: 'protected',
        },
        {
          cn: 'johndoe',
          sn: 'Doe',
          givenName: 'John',
          displayName: 'John Doe',
          mail: 'john@org.com',
          mobile: '+1234567890',
          userPassword: 'encrypted',
          scryptR: 8,
          scryptN: 16384,
          scryptP: 1,
          scryptSalt: 'salt',
          scryptDKLength: 32,
          iterations: 10000,
          domain: 'example.com',
          publicKey: 'pub',
          privateKey: 'priv',
          protectedKey: 'protected',
          organizationId: 'org_123',
        },
      ];
      mockHttpClient.get.mockResolvedValue(response);

      const result = await users.search({
        by: 'username',
        value: 'johndoe',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('organizationId');
      expect(result[1]).toHaveProperty('organizationId', 'org_123');
    });
  });
});
