import { GroupsResource } from '../../src/resources/GroupsResource';
import { HttpClient } from '../../src/lib/HttpClient';
import type {
  Group,
  CreateGroupRequest,
  UpdateGroupRequest,
  AddGroupMembersRequest,
  ListGroupsResponse,
} from '../../src/models/Group';

describe('GroupsResource', () => {
  let groups: GroupsResource;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    groups = new GroupsResource(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a group in organization', async () => {
      const request: CreateGroupRequest = {
        name: 'engineering',
        description: 'Engineering team',
      };

      const response: Group = {
        id: 'grp_xyz789',
        cn: 'engineering',
        description: 'Engineering team',
        organizationId: 'org_abc123',
        baseDN: 'cn=engineering,o=acme-corp,dc=example,dc=com',
        members: [],
        createdAt: '2025-01-23T11:00:00Z',
      };

      mockHttpClient.post.mockResolvedValue(response);

      const result = await groups.create('org_abc123', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups',
        request
      );
      expect(result).toEqual(response);
    });

    it('should create a group without description', async () => {
      const request: CreateGroupRequest = {
        name: 'sales',
      };

      const response: Group = {
        id: 'grp_abc456',
        cn: 'sales',
        organizationId: 'org_abc123',
        baseDN: 'cn=sales,o=acme-corp,dc=example,dc=com',
        members: [],
        createdAt: '2025-01-23T11:00:00Z',
      };

      mockHttpClient.post.mockResolvedValue(response);

      const result = await groups.create('org_abc123', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups',
        request
      );
      expect(result).toEqual(response);
    });

    it('should handle special characters in organization ID', async () => {
      const request: CreateGroupRequest = {
        name: 'engineering',
        description: 'Engineering team',
      };

      const response: Group = {
        id: 'grp_xyz789',
        cn: 'engineering',
        description: 'Engineering team',
        organizationId: 'org_abc+123',
        baseDN: 'cn=engineering,o=acme-corp,dc=example,dc=com',
        members: [],
        createdAt: '2025-01-23T11:00:00Z',
      };

      mockHttpClient.post.mockResolvedValue(response);

      await groups.create('org_abc+123', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc%2B123/groups',
        request
      );
    });
  });

  describe('list', () => {
    it('should list groups without pagination params', async () => {
      const response: ListGroupsResponse = {
        organizationId: 'org_abc123',
        groups: [
          {
            id: 'grp_xyz789',
            cn: 'engineering',
            description: 'Engineering team',
            organizationId: 'org_abc123',
            baseDN: 'cn=engineering,o=acme-corp,dc=example,dc=com',
            members: ['john.doe', 'jane.smith'],
            createdAt: '2025-01-23T11:00:00Z',
          },
          {
            id: 'grp_abc456',
            cn: 'sales',
            description: 'Sales team',
            organizationId: 'org_abc123',
            baseDN: 'cn=sales,o=acme-corp,dc=example,dc=com',
            members: ['bob.wilson'],
            createdAt: '2025-01-23T11:30:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      };

      mockHttpClient.get.mockResolvedValue(response);

      const result = await groups.list('org_abc123');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/organizations/org_abc123/groups');
      expect(result).toEqual(response);
    });

    it('should list groups with pagination params', async () => {
      const response: ListGroupsResponse = {
        organizationId: 'org_abc123',
        groups: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 15,
          totalPages: 2,
        },
      };

      mockHttpClient.get.mockResolvedValue(response);

      const result = await groups.list('org_abc123', {
        page: 2,
        limit: 10,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups?page=2&limit=10'
      );
      expect(result).toEqual(response);
    });
  });

  describe('get', () => {
    it('should get group details', async () => {
      const response: Group = {
        id: 'grp_xyz789',
        cn: 'engineering',
        description: 'Engineering team',
        organizationId: 'org_abc123',
        baseDN: 'cn=engineering,o=acme-corp,dc=example,dc=com',
        members: ['john.doe', 'jane.smith', 'alice.johnson'],
        createdAt: '2025-01-23T11:00:00Z',
      };

      mockHttpClient.get.mockResolvedValue(response);

      const result = await groups.get('org_abc123', 'grp_xyz789');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups/grp_xyz789'
      );
      expect(result).toEqual(response);
    });

    it('should handle special characters in IDs', async () => {
      const response: Group = {
        id: 'grp_xyz789',
        cn: 'engineering',
        organizationId: 'org_abc123',
        baseDN: 'cn=engineering,o=acme-corp,dc=example,dc=com',
        members: [],
        createdAt: '2025-01-23T11:00:00Z',
      };

      mockHttpClient.get.mockResolvedValue(response);

      await groups.get('org_abc+123', 'grp_xyz+789');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc%2B123/groups/grp_xyz%2B789'
      );
    });
  });

  describe('update', () => {
    it('should update group description', async () => {
      const updates: UpdateGroupRequest = {
        description: 'Updated description for engineering team',
      };

      const response = { success: true };
      mockHttpClient.patch.mockResolvedValue(response);

      const result = await groups.update('org_abc123', 'grp_xyz789', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups/grp_xyz789',
        updates
      );
      expect(result).toEqual(response);
    });

    it('should update group name', async () => {
      const updates: UpdateGroupRequest = {
        name: 'senior-engineering',
      };

      const response = { success: true };
      mockHttpClient.patch.mockResolvedValue(response);

      const result = await groups.update('org_abc123', 'grp_xyz789', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups/grp_xyz789',
        updates
      );
      expect(result).toEqual(response);
    });

    it('should update both name and description', async () => {
      const updates: UpdateGroupRequest = {
        name: 'senior-engineering',
        description: 'Senior Engineering team',
      };

      const response = { success: true };
      mockHttpClient.patch.mockResolvedValue(response);

      const result = await groups.update('org_abc123', 'grp_xyz789', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups/grp_xyz789',
        updates
      );
      expect(result).toEqual(response);
    });
  });

  describe('delete', () => {
    it('should delete a group', async () => {
      const response = { success: true };
      mockHttpClient.delete.mockResolvedValue(response);

      const result = await groups.delete('org_abc123', 'grp_xyz789');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups/grp_xyz789'
      );
      expect(result).toEqual(response);
    });

    it('should handle special characters in IDs when deleting', async () => {
      const response = { success: true };
      mockHttpClient.delete.mockResolvedValue(response);

      await groups.delete('org_abc+123', 'grp_xyz+789');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc%2B123/groups/grp_xyz%2B789'
      );
    });
  });

  describe('addMembers', () => {
    it('should add single member to group', async () => {
      const request: AddGroupMembersRequest = {
        usernames: ['alice.johnson'],
      };

      const response = { success: true };
      mockHttpClient.post.mockResolvedValue(response);

      const result = await groups.addMembers('org_abc123', 'grp_xyz789', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups/grp_xyz789/members',
        request
      );
      expect(result).toEqual(response);
    });

    it('should add multiple members to group', async () => {
      const request: AddGroupMembersRequest = {
        usernames: ['alice.johnson', 'bob.wilson', 'charlie.brown'],
      };

      const response = { success: true };
      mockHttpClient.post.mockResolvedValue(response);

      const result = await groups.addMembers('org_abc123', 'grp_xyz789', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups/grp_xyz789/members',
        request
      );
      expect(result).toEqual(response);
    });

    it('should handle empty usernames array', async () => {
      const request: AddGroupMembersRequest = {
        usernames: [],
      };

      const response = { success: true };
      mockHttpClient.post.mockResolvedValue(response);

      const result = await groups.addMembers('org_abc123', 'grp_xyz789', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups/grp_xyz789/members',
        request
      );
      expect(result).toEqual(response);
    });
  });

  describe('removeMember', () => {
    it('should remove member from group', async () => {
      const response = { success: true };
      mockHttpClient.delete.mockResolvedValue(response);

      const result = await groups.removeMember('org_abc123', 'grp_xyz789', 'bob.wilson');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc123/groups/grp_xyz789/members/bob.wilson'
      );
      expect(result).toEqual(response);
    });

    it('should handle special characters in all IDs', async () => {
      const response = { success: true };
      mockHttpClient.delete.mockResolvedValue(response);

      await groups.removeMember('org_abc+123', 'grp_xyz+789', 'user+test@example.com');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/api/v1/organizations/org_abc%2B123/groups/grp_xyz%2B789/members/user%2Btest%40example.com'
      );
    });
  });

  describe('URL encoding', () => {
    it('should properly encode organization IDs in all methods', async () => {
      const orgId = 'org with spaces';
      mockHttpClient.post.mockResolvedValue({} as Group);
      mockHttpClient.get.mockResolvedValue({});
      mockHttpClient.patch.mockResolvedValue({ success: true });
      mockHttpClient.delete.mockResolvedValue({ success: true });

      await groups.create(orgId, { name: 'test' });
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/organizations/org%20with%20spaces/groups',
        expect.anything()
      );

      await groups.list(orgId);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/organizations/org%20with%20spaces/groups'
      );

      await groups.get(orgId, 'grp_123');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/organizations/org%20with%20spaces/groups/grp_123'
      );

      await groups.update(orgId, 'grp_123', { description: 'test' });
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/api/v1/organizations/org%20with%20spaces/groups/grp_123',
        expect.anything()
      );

      await groups.delete(orgId, 'grp_123');
      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/api/v1/organizations/org%20with%20spaces/groups/grp_123'
      );
    });

    it('should properly encode group IDs', async () => {
      const groupId = 'grp/with/slashes';
      mockHttpClient.get.mockResolvedValue({});
      mockHttpClient.patch.mockResolvedValue({ success: true });
      mockHttpClient.delete.mockResolvedValue({ success: true });

      await groups.get('org_123', groupId);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/organizations/org_123/groups/grp%2Fwith%2Fslashes'
      );

      await groups.update('org_123', groupId, { description: 'test' });
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/api/v1/organizations/org_123/groups/grp%2Fwith%2Fslashes',
        expect.anything()
      );

      await groups.delete('org_123', groupId);
      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/api/v1/organizations/org_123/groups/grp%2Fwith%2Fslashes'
      );
    });

    it('should properly encode user IDs in member operations', async () => {
      const userId = 'user@example.com';
      mockHttpClient.delete.mockResolvedValue({ success: true });

      await groups.removeMember('org_123', 'grp_456', userId);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/api/v1/organizations/org_123/groups/grp_456/members/user%40example.com'
      );
    });
  });

  describe('error scenarios', () => {
    it('should propagate errors from HTTP client on create', async () => {
      const error = new Error('Network error');
      mockHttpClient.post.mockRejectedValue(error);

      await expect(groups.create('org_abc123', { name: 'engineering' })).rejects.toThrow(
        'Network error'
      );
    });

    it('should propagate errors from HTTP client on list', async () => {
      const error = new Error('Not authorized');
      mockHttpClient.get.mockRejectedValue(error);

      await expect(groups.list('org_abc123')).rejects.toThrow('Not authorized');
    });

    it('should propagate errors from HTTP client on get', async () => {
      const error = new Error('Not found');
      mockHttpClient.get.mockRejectedValue(error);

      await expect(groups.get('org_abc123', 'grp_xyz789')).rejects.toThrow('Not found');
    });

    it('should propagate errors from HTTP client on update', async () => {
      const error = new Error('Conflict');
      mockHttpClient.patch.mockRejectedValue(error);

      await expect(groups.update('org_abc123', 'grp_xyz789', { name: 'new-name' })).rejects.toThrow(
        'Conflict'
      );
    });

    it('should propagate errors from HTTP client on delete', async () => {
      const error = new Error('Forbidden');
      mockHttpClient.delete.mockRejectedValue(error);

      await expect(groups.delete('org_abc123', 'grp_xyz789')).rejects.toThrow('Forbidden');
    });

    it('should propagate errors from HTTP client on addMembers', async () => {
      const error = new Error('User not found');
      mockHttpClient.post.mockRejectedValue(error);

      await expect(
        groups.addMembers('org_abc123', 'grp_xyz789', { usernames: ['invalid'] })
      ).rejects.toThrow('User not found');
    });

    it('should propagate errors from HTTP client on removeMember', async () => {
      const error = new Error('Member not in group');
      mockHttpClient.delete.mockRejectedValue(error);

      await expect(groups.removeMember('org_abc123', 'grp_xyz789', 'bob.wilson')).rejects.toThrow(
        'Member not in group'
      );
    });
  });
});
