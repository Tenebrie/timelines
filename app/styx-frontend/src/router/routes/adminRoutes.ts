import { useBaseRouter } from '../useBaseRouter'

export const adminRoutes = {
	root: '/admin',
	users: '/admin/users',
	userEditor: '/admin/users/:userId',
} as const

export const adminQueryParams = {
	[adminRoutes.root]: undefined,
	[adminRoutes.users]: undefined,
	[adminRoutes.userEditor]: undefined,
}

export const useAdminRouter = () => useBaseRouter(adminRoutes, adminQueryParams)
