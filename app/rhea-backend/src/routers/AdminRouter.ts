import { AdminAuthenticator } from '@src/auth/AdminAuthenticator'
import { AdminService } from '@src/services/AdminService'
import { Router, useApiEndpoint, useAuth } from 'tenebrie-framework'

const router = new Router()

export const adminUsersTag = 'adminUsers'

router.get('/api/admin/users', async (ctx) => {
	useApiEndpoint({
		name: 'adminGetUsers',
		description: 'Gets list of all registered users',
		tags: [adminUsersTag],
	})

	await useAuth(ctx, AdminAuthenticator)

	const users = await AdminService.listUsers()

	return users
})

export const AdminRouter = router
