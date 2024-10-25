import { AdminAuthenticator } from '@src/auth/AdminAuthenticator'
import { AdminService } from '@src/services/AdminService'
import {
	NonEmptyStringValidator,
	Router,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useRequestBody,
} from 'tenebrie-framework'

import { UserLevelValidator } from './validators/UserLevelValidator'

const router = new Router().with(async (ctx) => {
	const user = await useAuth(ctx, AdminAuthenticator)
	return {
		user,
	}
})

export const adminUsersTag = 'adminUsers'

router.get('/api/admin/levels', async () => {
	useApiEndpoint({
		name: 'adminGetUserLevels',
		description: 'Get all available user levels',
		tags: [],
	})

	return ['Free', 'Premium', 'Admin'] as const
})

router.get('/api/admin/users', async () => {
	useApiEndpoint({
		name: 'adminGetUsers',
		description: 'Gets list of all registered users',
		tags: [adminUsersTag],
	})

	const users = await AdminService.listUsers()

	return users
})

router.post('/api/admin/users/:userId/level', async (ctx) => {
	useApiEndpoint({
		name: 'adminSetUserLevel',
		description: 'Sets the user level for the given user',
		tags: [adminUsersTag],
	})

	const { userId } = usePathParams(ctx, {
		userId: NonEmptyStringValidator,
	})

	const { level } = useRequestBody(ctx, {
		level: UserLevelValidator,
	})

	return await AdminService.setUserLevel(userId, level)
})

router.delete('/api/admin/users/:userId', async (ctx) => {
	useApiEndpoint({
		name: 'adminDeleteUser',
		description: 'Deletes the user with the given ID',
		tags: [adminUsersTag],
	})

	const { userId } = usePathParams(ctx, {
		userId: NonEmptyStringValidator,
	})

	return await AdminService.deleteUser(userId)
})

export const AdminRouter = router
