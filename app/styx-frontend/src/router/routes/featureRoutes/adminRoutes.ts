import { useBaseRouter } from '../../useBaseRouter'

export const adminRoutes = {
	adminRoot: '/admin',
	users: '/admin/users',
	userEditor: '/admin/users/:userId',
} as const

export const adminQueryParams = {
	[adminRoutes.adminRoot]: undefined,
	[adminRoutes.users]: undefined,
	[adminRoutes.userEditor]: undefined,
}

export const useAdminRouter = () => useBaseRouter(adminRoutes, adminQueryParams)
