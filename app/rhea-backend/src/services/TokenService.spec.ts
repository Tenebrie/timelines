import fs from 'fs'
const originalExistsSync = fs.existsSync
vi.spyOn(fs, 'existsSync').mockImplementation((...arg) => {
	if (arg[0] === '/run/secrets/jwt-secret') {
		return true
	}
	return originalExistsSync(...arg)
})
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { TokenService } from './TokenService.js'

describe('TokenService', () => {
	describe("With token in '/run/secrets/jwt-secret'", () => {
		beforeEach(() => {
			const originalExistsSync = fs.existsSync
			const originalReadFileSync = fs.readFileSync
			vi.spyOn(fs, 'existsSync').mockImplementation((...arg) => {
				if (arg[0] === '/run/secrets/jwt-secret') {
					return true
				}
				return originalExistsSync(...arg)
			})
			vi.spyOn(fs, 'readFileSync').mockImplementation((...arg) => {
				if (arg[0] === '/run/secrets/jwt-secret') {
					return 'secret'
				}
				return originalReadFileSync(...arg)
			})
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
			const result = TokenService.decodeUserToken(token)
			expect(result).toEqual(
				expect.objectContaining({
					id: '1111-2222-3333-4444',
					email: 'admin@localhost',
				}),
			)
		})

		it('verifies valid token', () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExMTEtMjIyMi0zMzMzLTQ0NDQiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsImlhdCI6MTcyOTc3NzIwMX0.gi7JbN4y3lH49vFJf_Z_3RoH9HPhZJVs6kznBobq0fY'
			const result = TokenService.decodeUserToken(token)
			expect(result).toEqual(
				expect.objectContaining({
					id: '1111-2222-3333-4444',
					email: 'admin@localhost',
				}),
			)
		})

		it('does not verify token with invalid key', () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExMTEtMjIyMi0zMzMzLTQ0NDQiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsImlhdCI6MTY4MDAzOTM1NX0.X2Xpm7MC4VShyZ7uiFi1IK2w1hPxCVTJSJp7NTsymVs'
			expect(() => TokenService.decodeUserToken(token)).toThrow()
		})

		it('does not verify malformed token', () => {
			expect(() => TokenService.decodeUserToken('malformed')).toThrow()
		})
	})

	describe("With token in '/run/secrets/jwt-secret' with newline", () => {
		beforeEach(() => {
			const originalExistsSync = fs.existsSync
			const originalReadFileSync = fs.readFileSync
			vi.spyOn(fs, 'existsSync').mockImplementation((...arg) => {
				if (arg[0] === '/run/secrets/jwt-secret') {
					return true
				}
				return originalExistsSync(...arg)
			})
			vi.spyOn(fs, 'readFileSync').mockImplementation((...arg) => {
				if (arg[0] === '/run/secrets/jwt-secret') {
					return 'secret\n'
				}
				return originalReadFileSync(...arg)
			})
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
			const result = TokenService.decodeUserToken(token)
			expect(result).toEqual(
				expect.objectContaining({
					id: '1111-2222-3333-4444',
					email: 'admin@localhost',
				}),
			)
		})

		it('verifies valid token', () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExMTEtMjIyMi0zMzMzLTQ0NDQiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsImlhdCI6MTcyOTc3NzIwMX0.gi7JbN4y3lH49vFJf_Z_3RoH9HPhZJVs6kznBobq0fY'
			const result = TokenService.decodeUserToken(token)
			expect(result).toEqual(
				expect.objectContaining({
					id: '1111-2222-3333-4444',
					email: 'admin@localhost',
				}),
			)
		})

		it('does not verify token with invalid key', () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExMTEtMjIyMi0zMzMzLTQ0NDQiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsImlhdCI6MTY4MDAzOTM1NX0.X2Xpm7MC4VShyZ7uiFi1IK2w1hPxCVTJSJp7NTsymVs'
			expect(() => TokenService.decodeUserToken(token)).toThrow()
		})

		it('does not verify malformed token', () => {
			expect(() => TokenService.decodeUserToken('malformed')).toThrow()
		})
	})

	describe('With token in environment variable', () => {
		let originalEnv: typeof process.env

		beforeEach(() => {
			originalEnv = process.env
			process.env = {
				...process.env,
				['jwt-secret']: 'secret',
			}
		})
		afterAll(() => {
			process.env = originalEnv
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
			const result = TokenService.decodeUserToken(token)
			expect(result).toEqual(
				expect.objectContaining({
					id: '1111-2222-3333-4444',
					email: 'admin@localhost',
				}),
			)
		})

		it('verifies valid token', () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExMTEtMjIyMi0zMzMzLTQ0NDQiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsImlhdCI6MTcyOTc3NzIwMX0.gi7JbN4y3lH49vFJf_Z_3RoH9HPhZJVs6kznBobq0fY'
			const result = TokenService.decodeUserToken(token)
			expect(result).toEqual(
				expect.objectContaining({
					id: '1111-2222-3333-4444',
					email: 'admin@localhost',
				}),
			)
		})

		it('does not verify token with invalid key', () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExMTEtMjIyMi0zMzMzLTQ0NDQiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsImlhdCI6MTY4MDAzOTM1NX0.X2Xpm7MC4VShyZ7uiFi1IK2w1hPxCVTJSJp7NTsymVs'
			expect(() => TokenService.decodeUserToken(token)).toThrow()
		})

		it('does not verify malformed token', () => {
			expect(() => TokenService.decodeUserToken('malformed')).toThrow()
		})
	})
})
