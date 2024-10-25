import type { User } from '@prisma/client'
import * as UserAuthenticatorModule from '@src/auth/UserAuthenticator'

import { mockUser } from './mock'
import { requestBuilder } from './requestBuilder'

let mockUserAuth: User | null = null

jest.spyOn(UserAuthenticatorModule, 'UserAuthenticator').mockImplementation(async () => {
	if (mockUserAuth) {
		return mockUserAuth
	}
	throw new Error('User not authenticated')
})

export const withUserAuth = (user?: Partial<User>) => {
	mockUserAuth = mockUser(user)

	return requestBuilder
}
