import { UsersResource } from '../../src/resources/UsersResource';
import { HttpClient } from '../../src/lib/HttpClient';
import { HmacAuth } from '../../src/lib/HmacAuth';
import { Logger } from 'tslog';

describe('UsersResource', () => {
  let users: UsersResource;

  beforeEach(() => {
    const auth = new HmacAuth({
      type: 'hmac',
      serviceId: 'test',
      secret: 'test-secret-at-least-32-characters-long',
    });

    const logger = new Logger({ minLevel: 6 });

    const http = new HttpClient(
      {
        baseUrl: 'https://api.example.com',
        timeout: 30000,
      },
      auth,
      logger
    );

    users = new UsersResource(http);
  });

  it('should create users resource', () => {
    expect(users).toBeInstanceOf(UsersResource);
  });
});
