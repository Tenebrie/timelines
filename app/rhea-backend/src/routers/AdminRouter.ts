import { AdminAuthenticator } from '@src/middleware/auth/AdminAuthenticator.js'
import { AdminService } from '@src/services/AdminService.js'
import {
	EmailValidator,
	NonEmptyStringValidator,
	NumberValidator,
	OptionalParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useQueryParams,
	useRequestBody,
} from 'moonflower'

import { adminUsersTag } from './utils/tags.js'
import { UserLevelValidator } from './validators/UserLevelValidator.js'

const router = new Router().with(async (ctx) => {
	const user = await useAuth(ctx, AdminAuthenticator)
	return {
		user,
	}
})

router.get('/api/admin/users', async (ctx) => {
	useApiEndpoint({
		name: 'adminGetUsers',
		description: 'Gets list of all registered users',
		tags: [adminUsersTag],
	})

	const { page, size, query } = useQueryParams(ctx, {
		page: OptionalParam(NumberValidator),
		size: OptionalParam(NumberValidator),
		query: OptionalParam(StringValidator),
	})

	const users = await AdminService.listUsers({
		page,
		size,
		query,
	})

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

router.patch('/api/admin/users/:userId/password', async (ctx) => {
	useApiEndpoint({
		name: 'adminUpdateUser',
		description: 'Updates the user information for the given user',
		tags: [adminUsersTag],
	})

	const { userId } = usePathParams(ctx, {
		userId: NonEmptyStringValidator,
	})

	const { email, username, bio } = useRequestBody(ctx, {
		email: OptionalParam(EmailValidator),
		username: OptionalParam(StringValidator),
		bio: OptionalParam(StringValidator),
	})

	return await AdminService.updateUser(userId, { email, username, bio })
})

router.post('/api/admin/users/:userId/password', async (ctx) => {
	useApiEndpoint({
		name: 'adminSetUserPassword',
		description: 'Sets the password for the given user',
		tags: [adminUsersTag],
	})

	const { userId } = usePathParams(ctx, {
		userId: NonEmptyStringValidator,
	})

	const { password } = useRequestBody(ctx, {
		password: NonEmptyStringValidator,
	})

	return await AdminService.setUserPassword(userId, password)
})

export const AdminRouter = router
