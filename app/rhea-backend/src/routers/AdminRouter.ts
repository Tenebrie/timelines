import { AdminAuthenticator } from '@src/auth/AdminAuthenticator'
import { AdminService } from '@src/services/AdminService'
import { Router, useApiEndpoint, useAuth } from 'tenebrie-framework'

const router = new Router().with(async (ctx) => {
	const user = await useAuth(ctx, AdminAuthenticator)
	return {
		user,
	}
})

export const adminUsersTag = 'adminUsers'

router.get('/api/admin/users', async () => {
	useApiEndpoint({
		name: 'adminGetUsers',
		description: 'Gets list of all registered users',
		tags: [adminUsersTag],
	})

	const users = await AdminService.listUsers()

	return users
})

export const AdminRouter = router
