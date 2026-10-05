import { SpacesResource } from '../../src/resources/SpacesResource';
import { HttpClient } from '../../src/lib/HttpClient';
import type { Space } from '../../src/models/Space';

describe('SpacesResource', () => {
  let spaces: SpacesResource;
  let mockHttpClient: jest.Mocked<HttpClient>;
  const base = '/api/v1/organizations/acme/spaces';
  const space: Space = {
    id: '3b9e2c71-5d4a-4f0e-9c8b-1a2d6e7f8091',
    name: 'Design Sprint',
    organizationId: 'acme',
    members: [{ username: 'jsmith', role: 'admin' }],
    groups: [],
  };
  const done = { success: true as const };

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    spaces = new SpacesResource(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a space', async () => {
    const request = {
      name: 'Design Sprint',
      members: [{ username: 'jsmith', role: 'admin' as const }],
    };
    mockHttpClient.post.mockResolvedValue(space);

    const result = await spaces.create('acme', request);

    expect(mockHttpClient.post).toHaveBeenCalledWith(base, request);
    expect(result).toEqual(space);
  });

  it('lists the spaces of a user', async () => {
    mockHttpClient.get.mockResolvedValue({ organizationId: 'acme', spaces: [], pagination: {} });

    await spaces.list('acme', { user: 'jsmith', page: 2 });

    expect(mockHttpClient.get).toHaveBeenCalledWith(`${base}?user=jsmith&page=2`);
  });

  it('lists spaces without parameters', async () => {
    mockHttpClient.get.mockResolvedValue({ organizationId: 'acme', spaces: [], pagination: {} });

    await spaces.list('acme');

    expect(mockHttpClient.get).toHaveBeenCalledWith(base);
  });

  it('gets, renames and deletes a space', async () => {
    mockHttpClient.get.mockResolvedValue(space);
    mockHttpClient.patch.mockResolvedValue(done);
    mockHttpClient.delete.mockResolvedValue(done);

    expect(await spaces.get('acme', space.id)).toEqual(space);
    await spaces.rename('acme', space.id, 'Design');
    await spaces.delete('acme', space.id);

    expect(mockHttpClient.get).toHaveBeenCalledWith(`${base}/${space.id}`);
    expect(mockHttpClient.patch).toHaveBeenCalledWith(`${base}/${space.id}`, { name: 'Design' });
    expect(mockHttpClient.delete).toHaveBeenCalledWith(`${base}/${space.id}`);
  });

  it('manages members', async () => {
    mockHttpClient.get.mockResolvedValue({});
    mockHttpClient.post.mockResolvedValue(done);
    mockHttpClient.patch.mockResolvedValue(done);
    mockHttpClient.delete.mockResolvedValue(done);

    await spaces.listMembers('acme', 's1', { sortBy: 'role' });
    await spaces.addMembers('acme', 's1', { usernames: ['jdoe'], role: 'editor' });
    await spaces.setMemberRole('acme', 's1', 'j doe', 'viewer');
    await spaces.removeMember('acme', 's1', 'jdoe');

    expect(mockHttpClient.get).toHaveBeenCalledWith(`${base}/s1/members?sortBy=role`);
    expect(mockHttpClient.post).toHaveBeenCalledWith(`${base}/s1/members`, {
      usernames: ['jdoe'],
      role: 'editor',
    });
    expect(mockHttpClient.patch).toHaveBeenCalledWith(`${base}/s1/members/j%20doe`, {
      role: 'viewer',
    });
    expect(mockHttpClient.delete).toHaveBeenCalledWith(`${base}/s1/members/jdoe`);
  });

  it('manages linked groups', async () => {
    mockHttpClient.get.mockResolvedValue({});
    mockHttpClient.post.mockResolvedValue(done);
    mockHttpClient.patch.mockResolvedValue(done);
    mockHttpClient.delete.mockResolvedValue(done);

    await spaces.listGroups('acme', 's1');
    await spaces.linkGroups('acme', 's1', { groupIds: ['g1'], role: 'viewer' });
    await spaces.setGroupRole('acme', 's1', 'g1', 'editor');
    await spaces.unlinkGroup('acme', 's1', 'g1');

    expect(mockHttpClient.get).toHaveBeenCalledWith(`${base}/s1/groups`);
    expect(mockHttpClient.post).toHaveBeenCalledWith(`${base}/s1/groups`, {
      groupIds: ['g1'],
      role: 'viewer',
    });
    expect(mockHttpClient.patch).toHaveBeenCalledWith(`${base}/s1/groups/g1`, { role: 'editor' });
    expect(mockHttpClient.delete).toHaveBeenCalledWith(`${base}/s1/groups/g1`);
  });

  it('encodes the organization id', async () => {
    mockHttpClient.get.mockResolvedValue(space);

    await spaces.get('a/b', 's1');

    expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/organizations/a%2Fb/spaces/s1');
  });
});
