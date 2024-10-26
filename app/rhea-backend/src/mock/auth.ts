import type { User } from '@prisma/client'
import * as moonflower from 'moonflower'

import { mockUser } from './mock'
import { requestBuilder } from './requestBuilder'

export const withUserAuth = (user?: Partial<User>) => {
	jest.spyOn(moonflower, 'useAuth').mockImplementation(async () => {
		return mockUser({
			...user,
			level: 'Free',
		})
	})
	jest.spyOn(moonflower, 'useOptionalAuth').mockImplementation(async () => {
		return mockUser({
			...user,
			level: 'Free',
		})
	})

	return requestBuilder
}

export const withAdminAuth = (user?: Partial<User>) => {
	jest.spyOn(moonflower, 'useAuth').mockImplementation(async () => {
		return mockUser({
			...user,
			level: 'Admin',
		})
	})
	jest.spyOn(moonflower, 'useOptionalAuth').mockImplementation(async () => {
		return mockUser({
			...user,
			level: 'Admin',
		})
	})

	return requestBuilder
}
