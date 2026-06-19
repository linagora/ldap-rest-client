import { ApplicativeAccountsResource } from '../../src/resources/ApplicativeAccountsResource';
import { HttpClient } from '../../src/lib/HttpClient';
import type {
  ApplicativeAccount,
  ApplicativeAccountCreated,
  DeleteApplicativeAccountResponse,
} from '../../src/models/ApplicativeAccount';

describe('ApplicativeAccountsResource', () => {
  let applicativeAccounts: ApplicativeAccountsResource;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    applicativeAccounts = new ApplicativeAccountsResource(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create applicative accounts resource', () => {
    expect(applicativeAccounts).toBeInstanceOf(ApplicativeAccountsResource);
  });

  describe('list', () => {
    it("should request the user's app-accounts and return the parsed body", async () => {
      const response: ApplicativeAccount[] = [
        { uid: 'alice_c04729183', name: 'Work laptop' },
        { uid: 'alice_c09812345' },
      ];
      mockHttpClient.get.mockResolvedValue(response);

      const result = await applicativeAccounts.list('alice');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/users/alice/app-accounts');
      expect(result).toEqual(response);
    });

    it('should encode the username in the path', async () => {
      mockHttpClient.get.mockResolvedValue([]);

      await applicativeAccounts.list('a li/ce');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/users/a%20li%2Fce/app-accounts');
    });

    it('should propagate errors from the HTTP client', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('User alice not found'));

      await expect(applicativeAccounts.list('alice')).rejects.toThrow('User alice not found');
    });
  });

  describe('create', () => {
    it('should post the label and return the one-time credential', async () => {
      const response: ApplicativeAccountCreated = {
        uid: 'alice_c04729183',
        pwd: 'Ab3@-xYz!-9pQ#-Sv4$-mN8!-pQ5@',
        mail: 'alice@example.com',
      };
      mockHttpClient.post.mockResolvedValue(response);

      const result = await applicativeAccounts.create('alice', { name: 'Work laptop' });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/users/alice/app-accounts', {
        name: 'Work laptop',
      });
      expect(result).toEqual(response);
    });

    it('should default to an empty body when no data is given', async () => {
      mockHttpClient.post.mockResolvedValue({
        uid: 'alice_c1',
        pwd: 'x',
        mail: 'alice@example.com',
      });

      await applicativeAccounts.create('alice');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/users/alice/app-accounts', {});
    });

    it('should propagate errors from the HTTP client', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Maximum number of accounts (5) reached'));

      await expect(applicativeAccounts.create('alice')).rejects.toThrow(
        'Maximum number of accounts (5) reached'
      );
    });
  });

  describe('delete', () => {
    it('should delete the account and return its uid', async () => {
      const response: DeleteApplicativeAccountResponse = { uid: 'alice_c04729183' };
      mockHttpClient.delete.mockResolvedValue(response);

      const result = await applicativeAccounts.delete('alice', 'alice_c04729183');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/api/v1/users/alice/app-accounts/alice_c04729183'
      );
      expect(result).toEqual(response);
    });

    it('should encode both the username and the uid in the path', async () => {
      mockHttpClient.delete.mockResolvedValue({ uid: 'a_c#1' });

      await applicativeAccounts.delete('a/lice', 'a_c#1');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/api/v1/users/a%2Flice/app-accounts/a_c%231'
      );
    });

    it('should propagate errors from the HTTP client', async () => {
      mockHttpClient.delete.mockRejectedValue(new Error('does not belong to user'));

      await expect(applicativeAccounts.delete('alice', 'bob_c1')).rejects.toThrow(
        'does not belong to user'
      );
    });
  });
});
