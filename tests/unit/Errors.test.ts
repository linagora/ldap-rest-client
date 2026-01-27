import {
  LdapRestError,
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  NetworkError,
} from '../../src/errors';

describe('Error Classes', () => {
  describe('LdapRestError', () => {
    it('should create base error with all properties', () => {
      const error = new LdapRestError('Test message', 500, 'TEST_CODE');

      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('LdapRestError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LdapRestError);
    });

    it('should create error without status code and code', () => {
      const error = new LdapRestError('Test message');

      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBeUndefined();
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('LdapRestError');
    });

    it('should capture stack trace', () => {
      const error = new LdapRestError('Test message');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('LdapRestError');
    });
  });

  describe('ApiError', () => {
    it('should create API error with all properties', () => {
      const error = new ApiError('API failed', 500, 'INTERNAL_ERROR');

      expect(error.message).toBe('API failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.name).toBe('ApiError');
      expect(error).toBeInstanceOf(LdapRestError);
      expect(error).toBeInstanceOf(ApiError);
    });

    it('should create from response body', () => {
      const responseBody = {
        error: 'Something went wrong',
        code: 'SERVER_ERROR',
      };

      const error = ApiError.fromResponse(500, responseBody);

      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('SERVER_ERROR');
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(LdapRestError);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError('Invalid credentials');

      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.name).toBe('AuthenticationError');
      expect(error).toBeInstanceOf(LdapRestError);
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error', () => {
      const error = new AuthorizationError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.name).toBe('AuthorizationError');
      expect(error).toBeInstanceOf(LdapRestError);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with default code', () => {
      const error = new NotFoundError('User not found');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
      expect(error).toBeInstanceOf(LdapRestError);
    });

    it('should create not found error with custom code', () => {
      const error = new NotFoundError('User not found', 'USER_NOT_FOUND');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('USER_NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with default code', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.name).toBe('ConflictError');
      expect(error).toBeInstanceOf(LdapRestError);
    });

    it('should create conflict error with custom code', () => {
      const error = new ConflictError('Username already exists', 'USERNAME_EXISTS');

      expect(error.message).toBe('Username already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('USERNAME_EXISTS');
      expect(error.name).toBe('ConflictError');
    });

    it('should create conflict error with email exists code', () => {
      const error = new ConflictError('Email already exists', 'EMAIL_EXISTS');

      expect(error.message).toBe('Email already exists');
      expect(error.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error without retryAfter', () => {
      const error = new RateLimitError('Too many requests');

      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.retryAfter).toBeUndefined();
      expect(error.name).toBe('RateLimitError');
      expect(error).toBeInstanceOf(LdapRestError);
    });

    it('should create rate limit error with retryAfter', () => {
      const error = new RateLimitError('Too many requests', 60);

      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.retryAfter).toBe(60);
      expect(error.name).toBe('RateLimitError');
    });
  });

  describe('NetworkError', () => {
    it('should create network error without cause', () => {
      const error = new NetworkError('Connection failed');

      expect(error.message).toBe('Connection failed');
      expect(error.statusCode).toBeUndefined();
      expect(error.code).toBeUndefined();
      expect(error.cause).toBeUndefined();
      expect(error.name).toBe('NetworkError');
      expect(error).toBeInstanceOf(LdapRestError);
    });

    it('should create network error with cause', () => {
      const cause = new Error('Socket timeout');
      const error = new NetworkError('Connection failed', cause);

      expect(error.message).toBe('Connection failed');
      expect(error.cause).toBe(cause);
      expect(error.cause?.message).toBe('Socket timeout');
      expect(error.name).toBe('NetworkError');
    });

    it('should preserve cause error stack', () => {
      const cause = new Error('Original error');
      const error = new NetworkError('Wrapped error', cause);

      expect(error.cause?.stack).toBeDefined();
      expect(error.stack).toBeDefined();
    });
  });
});
