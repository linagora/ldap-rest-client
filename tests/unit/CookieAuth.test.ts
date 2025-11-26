import { HttpClient } from '../../src/lib/HttpClient';
import { Logger } from 'tslog';

describe('Cookie-based authentication', () => {
  it('should include credentials in fetch requests when no auth provided', async () => {
    const logger = new Logger({ minLevel: 6 });
    const http = new HttpClient(
      { baseUrl: 'https://api.example.com', timeout: 30000 },
      undefined,
      logger
    );

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true }),
    } as Response);

    await http.get('/api/v1/users');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/users',
      expect.objectContaining({
        credentials: 'include',
      })
    );
  });

  it('should not set Authorization header when no auth provided', async () => {
    const logger = new Logger({ minLevel: 6 });
    const http = new HttpClient(
      { baseUrl: 'https://api.example.com', timeout: 30000 },
      undefined,
      logger
    );

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true }),
    } as Response);

    await http.get('/api/v1/users');

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const headers = fetchCall[1].headers;

    expect(headers.Authorization).toBeUndefined();
  });
});
