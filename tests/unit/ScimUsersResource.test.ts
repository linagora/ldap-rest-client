import { ScimUsersResource } from '../../src/resources/ScimUsersResource';
import { HttpClient } from '../../src/lib/HttpClient';
import {
  SCIM_USER_SCHEMA,
  SCIM_PATCH_OP_SCHEMA,
  type ScimUser,
  type ScimUserInput,
  type ScimPatchRequest,
  type ScimListResponse,
} from '../../src/models/Scim';

describe('ScimUsersResource', () => {
  let scim: ScimUsersResource;
  let mockHttpClient: jest.Mocked<HttpClient>;

  const sampleInput: ScimUserInput = {
    schemas: [SCIM_USER_SCHEMA],
    userName: 'jane.doe',
    name: { familyName: 'Doe', givenName: 'Jane' },
    emails: [{ value: 'jane.doe@acme.example.com', primary: true }],
    active: true,
  };

  const sampleUser: ScimUser = {
    ...sampleInput,
    id: 'jane.doe',
    meta: { resourceType: 'User', created: '2025-01-23T11:00:00Z' },
  };

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    scim = new ScimUsersResource(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should POST to /scim/v2/Users', async () => {
      mockHttpClient.post.mockResolvedValue(sampleUser);

      const result = await scim.create(sampleInput);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/scim/v2/Users', sampleInput, undefined);
      expect(result).toEqual(sampleUser);
    });

    it('should forward per-request headers', async () => {
      mockHttpClient.post.mockResolvedValue(sampleUser);

      const headers = {
        'x-cloudery-org-id': 'acme.example.com',
        'x-scim-user-base': 'ou=users,ou=acme.example.com,ou=b2b,dc=twake,dc=app',
      };
      await scim.create(sampleInput, headers);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/scim/v2/Users', sampleInput, headers);
    });

    it('should honor a custom SCIM prefix', async () => {
      const custom = new ScimUsersResource(mockHttpClient, '/scim');
      mockHttpClient.post.mockResolvedValue(sampleUser);

      await custom.create(sampleInput);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/scim/Users', sampleInput, undefined);
    });

    it('should strip a trailing slash from a custom prefix', async () => {
      const custom = new ScimUsersResource(mockHttpClient, '/scim/v2/');
      mockHttpClient.post.mockResolvedValue(sampleUser);

      await custom.create(sampleInput);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/scim/v2/Users', sampleInput, undefined);
    });
  });

  describe('input typing', () => {
    it('rejects an input missing required fields at compile time', () => {
      // @ts-expect-error - schemas and userName are required on ScimUserInput
      const bad: ScimUserInput = {};
      expect(bad).toBeDefined();
    });
  });

  describe('get', () => {
    it('should GET a user by id with encoding', async () => {
      mockHttpClient.get.mockResolvedValue(sampleUser);

      const result = await scim.get('jane doe');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/scim/v2/Users/jane%20doe', undefined);
      expect(result).toEqual(sampleUser);
    });
  });

  describe('list', () => {
    it('should GET with a built query string', async () => {
      const response: ScimListResponse<ScimUser> = {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 1,
        startIndex: 1,
        itemsPerPage: 1,
        Resources: [sampleUser],
      };
      mockHttpClient.get.mockResolvedValue(response);

      const result = await scim.list({ filter: 'userName eq "jane.doe"', count: 10 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/scim/v2/Users?filter=userName%20eq%20%22jane.doe%22&count=10',
        undefined
      );
      expect(result).toEqual(response);
    });

    it('should GET without query string when no params', async () => {
      mockHttpClient.get.mockResolvedValue({
        schemas: [],
        totalResults: 0,
        Resources: [],
      });

      await scim.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/scim/v2/Users', undefined);
    });
  });

  describe('replace', () => {
    it('should PUT the full payload', async () => {
      mockHttpClient.put.mockResolvedValue(sampleUser);

      const result = await scim.replace('jane.doe', sampleInput);

      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/scim/v2/Users/jane.doe',
        sampleInput,
        undefined
      );
      expect(result).toEqual(sampleUser);
    });
  });

  describe('patch', () => {
    it('should PATCH with a PatchOp body', async () => {
      const patch: ScimPatchRequest = {
        schemas: [SCIM_PATCH_OP_SCHEMA],
        Operations: [{ op: 'replace', path: 'active', value: false }],
      };
      mockHttpClient.patch.mockResolvedValue({ ...sampleUser, active: false });

      const result = await scim.patch('jane.doe', patch);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/scim/v2/Users/jane.doe',
        patch,
        undefined
      );
      expect(result.active).toBe(false);
    });
  });

  describe('delete', () => {
    it('should DELETE a user by id', async () => {
      mockHttpClient.delete.mockResolvedValue({ success: true });

      const result = await scim.delete('jane.doe');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/scim/v2/Users/jane.doe', undefined);
      expect(result).toEqual({ success: true });
    });

    it('should forward headers on delete', async () => {
      mockHttpClient.delete.mockResolvedValue({ success: true });

      await scim.delete('jane.doe', { 'x-scim-user-base': 'ou=users,dc=twake,dc=app' });

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/scim/v2/Users/jane.doe', {
        'x-scim-user-base': 'ou=users,dc=twake,dc=app',
      });
    });
  });
});
