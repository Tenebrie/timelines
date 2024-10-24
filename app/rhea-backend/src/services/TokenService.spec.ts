import { TokenService } from './TokenService'

describe('TokenService', () => {
	beforeAll(() => {
		process.env = {
			...process.env,
			JWT_SECRET: 'secret',
		}
	})
	it('creates a valid token', () => {
		const token = TokenService.generateJwtToken({
			id: '1111-2222-3333-4444',
			email: 'admin@localhost',
		})
		expect(token.startsWith('eyJ')).toBeTruthy()
		expect(token.charAt(36)).toEqual('.')
	})

	it('validates tokens it creates', () => {
		const token = TokenService.generateJwtToken({
			id: '1111-2222-3333-4444',
			email: 'admin@localhost',
		})
		const result = TokenService.decodeJwtToken(token)
		expect(result).toEqual(
			expect.objectContaining({
				id: '1111-2222-3333-4444',
				email: 'admin@localhost',
			})
		)
	})

	it('verifies valid token', () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExMTEtMjIyMi0zMzMzLTQ0NDQiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsImlhdCI6MTcyOTc3NzIwMX0.gi7JbN4y3lH49vFJf_Z_3RoH9HPhZJVs6kznBobq0fY'
		const result = TokenService.decodeJwtToken(token)
		expect(result).toEqual(
			expect.objectContaining({
				id: '1111-2222-3333-4444',
				email: 'admin@localhost',
			})
		)
	})

	it('does not verify token with invalid key', () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExMTEtMjIyMi0zMzMzLTQ0NDQiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsImlhdCI6MTY4MDAzOTM1NX0.X2Xpm7MC4VShyZ7uiFi1IK2w1hPxCVTJSJp7NTsymVs'
		expect(() => TokenService.decodeJwtToken(token)).toThrow()
	})

	it('does not verify malformed token', () => {
		expect(() => TokenService.decodeJwtToken('malformed')).toThrow()
	})
})
