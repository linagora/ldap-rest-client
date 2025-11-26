import { OrganizationsResource } from '../../src/resources/OrganizationsResource';
import { HttpClient } from '../../src/lib/HttpClient';
import type {
  Organization,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  UpdateOrganizationRequest,
  ChangeUserRoleRequest,
} from '../../src/models/Organization';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ListUsersResponse,
  CreateB2BUserResponse,
} from '../../src/models/User';

describe('OrganizationsResource', () => {
  let organizations: OrganizationsResource;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    organizations = new OrganizationsResource(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an organization', async () => {
      const request: CreateOrganizationRequest = {
        id: 'org_abc123',
        name: 'Acme Corp',
        domain: 'acme.example.com',
        metadata: { industry: 'Technology' },
      };

      const response: CreateOrganizationResponse = {
        success: true,
        organization: {
          id: 'org_abc123',
          name: 'Acme Corp',
          domain: 'acme.example.com',
          baseDN: 'o=acme-corp,dc=example,dc=com',
          status: 'active',
          createdAt: new Date('2025-01-23T10:30:00Z'),
          metadata: { industry: 'Technology' },
        },
      };

      mockHttpClient.post.mockResolvedValue(response);

      const result = await organizations.create(request);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/organizations', request);
      expect(result).toEqual(response);
    });
  });

  describe('checkAvailability', () => {
    it('should check organization availability', async () => {
      const response = { available: true };
      mockHttpClient.get.mockResolvedValue(response);

      const result = await organizations.checkAvailability({
        field: 'domain',
        value: 'acme.example.com',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/organizations/check?field=domain&value=acme.example.com'
      );
      expect(result).toEqual(response);
    });
  });

  describe('createAdmin', () => {
    it('should link admin user to organization', async () => {
      const response = { success: true };
      mockHttpClient.post.mockResolvedValue(response);

      const result = await organizations.createAdmin('org_abc123', {
        username: 'john.doe',
        mail: 'john.doe@acme.example.com',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/organizations/org_abc123/admin', {
        username: 'john.doe',
        mail: 'john.doe@acme.example.com',
      });
      expect(result).toEqual(response);
    });
  });

  describe('list', () => {
    it('should get list of organizations', async () => {
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

      const result = await organizations.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/organizations');
      expect(result).toEqual(response);
    });
  });

  describe('get', () => {
    it('should get organization details', async () => {
      const response: Organization = {
        id: 'org_abc123',
        name: 'Acme Corp',
        domain: 'acme.example.com',
        baseDN: 'o=acme-corp,dc=example,dc=com',
        status: 'active',
        createdAt: new Date('2025-01-23T10:30:00Z'),
      };
      mockHttpClient.get.mockResolvedValue(response);

      const result = await organizations.get('org_abc123');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/organizations/org_abc123');
      expect(result).toEqual(response);
    });
  });

  describe('update', () => {
    it('should update organization', async () => {
      const request: UpdateOrganizationRequest = {
        name: 'New Acme Corp',
        status: 'active',
      };
      const response = { success: true };
      mockHttpClient.patch.mockResolvedValue(response);

      const result = await organizations.update('org_abc123', request);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123',
        request
      );
      expect(result).toEqual(response);
    });
  });

  describe('B2B User Management', () => {
    describe('createUser', () => {
      it('should create user in organization', async () => {
        const userData: CreateUserRequest = {
          cn: 'john.doe',
          uid: 'john.doe',
          givenName: 'John',
          sn: 'Doe',
          displayName: 'John Doe',
          mobile: '+33612345678',
          mail: 'john.doe@acme.example.com',
          domain: 'acme.example.com',
          userPassword: '$2a$10$...',
          scryptN: 16384,
          scryptP: 1,
          scryptR: 8,
          scryptSalt: 'salt123',
          scryptDKLength: 64,
          iterations: 10000,
          publicKey: 'pubkey',
          privateKey: 'privkey',
          protectedKey: 'protkey',
        };

        const response: CreateB2BUserResponse = {
          baseDN: 'uid=john.doe,o=acme-corp,dc=example,dc=com',
        };
        mockHttpClient.post.mockResolvedValue(response);

        const result = await organizations.createUser('org_abc123', userData);

        expect(mockHttpClient.post).toHaveBeenCalledWith(
          '/api/v1/organizations/org_abc123/users',
          userData
        );
        expect(result).toEqual(response);
      });
    });

    describe('updateUser', () => {
      it('should update user in organization', async () => {
        const updates: UpdateUserRequest = {
          mobile: '+33687654321',
        };
        const response = { success: true };
        mockHttpClient.patch.mockResolvedValue(response);

        const result = await organizations.updateUser('org_abc123', 'john.doe', updates);

        expect(mockHttpClient.patch).toHaveBeenCalledWith(
          '/api/v1/organizations/org_abc123/users/john.doe',
          updates
        );
        expect(result).toEqual(response);
      });

      it('should handle special characters in userId', async () => {
        const updates: UpdateUserRequest = { mobile: '+33687654321' };
        const response = { success: true };
        mockHttpClient.patch.mockResolvedValue(response);

        await organizations.updateUser('org_abc123', 'john+doe@example.com', updates);

        expect(mockHttpClient.patch).toHaveBeenCalledWith(
          '/api/v1/organizations/org_abc123/users/john%2Bdoe%40example.com',
          updates
        );
      });
    });

    describe('disableUser', () => {
      it('should disable user in organization', async () => {
        const response = { success: true };
        mockHttpClient.post.mockResolvedValue(response);

        const result = await organizations.disableUser('org_abc123', 'john.doe');

        expect(mockHttpClient.post).toHaveBeenCalledWith(
          '/api/v1/organizations/org_abc123/users/john.doe/disable'
        );
        expect(result).toEqual(response);
      });
    });

    describe('deleteUser', () => {
      it('should delete user from organization', async () => {
        const response = { success: true };
        mockHttpClient.delete.mockResolvedValue(response);

        const result = await organizations.deleteUser('org_abc123', 'john.doe');

        expect(mockHttpClient.delete).toHaveBeenCalledWith(
          '/api/v1/organizations/org_abc123/users/john.doe'
        );
        expect(result).toEqual(response);
      });
    });

    describe('getUser', () => {
      it('should get user from organization by username', async () => {
        const response: User = {
          cn: 'john.doe',
          sn: 'Doe',
          givenName: 'John',
          displayName: 'John Doe',
          mail: 'john.doe@acme.example.com',
          mobile: '+33612345678',
          userPassword: '$2a$10$...',
          scryptN: 16384,
          scryptP: 1,
          scryptR: 8,
          scryptSalt: 'salt123',
          scryptDKLength: 64,
          iterations: 10000,
          domain: 'acme.example.com',
          publicKey: 'pubkey',
          privateKey: 'privkey',
          protectedKey: 'protkey',
        };
        mockHttpClient.get.mockResolvedValue(response);

        const result = await organizations.getUser('org_abc123', {
          by: 'username',
          value: 'john.doe',
          fields: 'cn,mail,mobile',
        });

        expect(mockHttpClient.get).toHaveBeenCalledWith(
          '/api/v1/organizations/org_abc123/users?by=username&value=john.doe&fields=cn%2Cmail%2Cmobile'
        );
        expect(result).toEqual(response);
      });
    });

    describe('listUsers', () => {
      it('should list users in organization with default params', async () => {
        const response: ListUsersResponse = {
          users: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
        mockHttpClient.get.mockResolvedValue(response);

        const result = await organizations.listUsers('org_abc123');

        expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/organizations/org_abc123/users');
        expect(result).toEqual(response);
      });

      it('should list users with pagination and filters', async () => {
        const response: ListUsersResponse = {
          users: [
            {
              cn: 'john.doe',
              sn: 'Doe',
              givenName: 'John',
              displayName: 'John Doe',
              mail: 'john.doe@acme.example.com',
              mobile: '+33612345678',
              userPassword: '$2a$10$...',
              scryptN: 16384,
              scryptP: 1,
              scryptR: 8,
              scryptSalt: 'salt123',
              scryptDKLength: 64,
              iterations: 10000,
              domain: 'acme.example.com',
              publicKey: 'pubkey',
              privateKey: 'privkey',
              protectedKey: 'protkey',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
        mockHttpClient.get.mockResolvedValue(response);

        const result = await organizations.listUsers('org_abc123', {
          page: 1,
          limit: 20,
          status: 'active',
          search: 'john',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        expect(mockHttpClient.get).toHaveBeenCalledWith(
          '/api/v1/organizations/org_abc123/users?page=1&limit=20&status=active&search=john&sortBy=createdAt&sortOrder=desc'
        );
        expect(result).toEqual(response);
      });
    });

    describe('checkUserAvailability', () => {
      it('should check user availability in organization', async () => {
        const response = { available: true };
        mockHttpClient.get.mockResolvedValue(response);

        const result = await organizations.checkUserAvailability('org_abc123', {
          field: 'username',
          value: 'john.doe',
        });

        expect(mockHttpClient.get).toHaveBeenCalledWith(
          '/api/v1/organizations/org_abc123/users/check?field=username&value=john.doe'
        );
        expect(result).toEqual(response);
      });
    });

    describe('changeUserRole', () => {
      it('should change user role in organization', async () => {
        const roleData: ChangeUserRoleRequest = { role: 'moderator' };
        const response = { success: true };
        mockHttpClient.patch.mockResolvedValue(response);

        const result = await organizations.changeUserRole('org_abc123', 'john.doe', roleData);

        expect(mockHttpClient.patch).toHaveBeenCalledWith(
          '/api/v1/organizations/org_abc123/users/john.doe/role',
          roleData
        );
        expect(result).toEqual(response);
      });

      it('should handle all valid roles', async () => {
        const roles: Array<'admin' | 'moderator' | 'member'> = ['admin', 'moderator', 'member'];
        mockHttpClient.patch.mockResolvedValue({ success: true });

        for (const role of roles) {
          await organizations.changeUserRole('org_abc123', 'john.doe', { role });

          expect(mockHttpClient.patch).toHaveBeenCalledWith(
            '/api/v1/organizations/org_abc123/users/john.doe/role',
            { role }
          );
        }
      });
    });
  });
});
