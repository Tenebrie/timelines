/**
 * Vitest global setup for orpheus-mcp.
 *
 * Provide a JWT secret so TokenService.produceServiceToken() works in tests
 * without needing Docker secrets or env files.
 */
process.env['jwt_secret'] = 'test-secret'
