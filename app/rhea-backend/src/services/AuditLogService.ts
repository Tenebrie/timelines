import { AuditAction, User } from '@prisma/client'
import { DefaultContext, DefaultState, ParameterizedContext } from 'koa'

import { AuditLogUncheckedCreateInput, AuditLogWhereInput } from '../../prisma/client/models.js'
import { getPrismaClient } from './dbClients/DatabaseClient.js'

export const AuditLogService = {
	getStats: async ({ days }: { days: number }) => {
		const since = new Date()
		since.setDate(since.getDate() - days)

		const prisma = getPrismaClient()

		const actionCounts = await prisma.auditLog.groupBy({
			by: ['action'],
			where: { createdAt: { gte: since } },
			_count: { id: true },
		})

		const uniqueUserLogins = await prisma.auditLog.groupBy({
			by: ['userId'],
			where: {
				createdAt: { gte: since },
				action: { in: ['UserLoginWithPassword', 'UserLoginWithGoogle'] },
				userId: { not: null },
			},
		})

		const toCount = (action: AuditAction) => actionCounts.find((a) => a.action === action)?._count.id ?? 0

		return {
			userAuthEvents: toCount('UserAuth'),
			guestAccountsCreated: toCount('GuestCreateAccount'),
			userAccountsCreated: toCount('UserCreateAccount'),
			passwordLogins: toCount('UserLoginWithPassword'),
			googleLogins: toCount('UserLoginWithGoogle'),
			failedLogins: toCount('UserLoginFailed'),
			accountsDeleted: toCount('UserDeleteAccount'),
			adminImpersonations: toCount('AdminImpersonateUser'),
			uniqueUserLogins: uniqueUserLogins.length,
			totalEvents: actionCounts.reduce((sum, a) => sum + a._count.id, 0),
		}
	},

	append: async (
		ctx: ParameterizedContext<DefaultState, DefaultContext & { user?: User }>,
		params: Omit<AuditLogUncheckedCreateInput, 'requestIp' | 'id' | 'createdAt' | 'data'> & {
			data?: AuditLogUncheckedCreateInput['data']
		},
		options: {
			minimalGapSeconds?: number
		} = {},
	) => {
		const requestIp = ctx.request.ip
		const userId = params.userId ?? ctx.user?.id

		if (userId && options.minimalGapSeconds) {
			const lastEvent = await getPrismaClient().auditLog.findFirst({
				where: {
					userId,
					action: params.action,
					createdAt: {
						gte: new Date(Date.now() - options.minimalGapSeconds * 1000),
					},
				},
				select: {
					id: true,
				},
			})
			if (lastEvent) {
				return
			}
		}

		await getPrismaClient().auditLog.create({
			data: {
				...params,
				data: params.data ?? {},
				userId,
				requestIp,
			},
		})
	},

	getLogs: async ({ page, size, query }: { page?: number; size?: number; query?: string }) => {
		const actualPage = page ?? 0
		const actualSize = Math.min(size ?? 20, 100)
		const allActions = Object.values(AuditAction)
		const matchingActions = query
			? allActions.filter((a) => a.toLowerCase().includes(query.toLowerCase()))
			: []
		const whereClause: AuditLogWhereInput = query
			? {
					OR: [
						{
							user: {
								id: { contains: query, mode: 'insensitive' },
								email: { contains: query, mode: 'insensitive' },
							},
						},
						{ requestIp: { contains: query, mode: 'insensitive' } },
						...(matchingActions.length > 0 ? [{ action: { in: matchingActions } }] : []),
					],
				}
			: {}
		const result = await getPrismaClient().auditLog.findMany({
			where: whereClause,
			orderBy: [{ createdAt: 'desc' }],
			skip: actualPage * actualSize,
			take: actualSize,
			include: {
				user: {
					select: {
						id: true,
						username: true,
						email: true,
					},
				},
			},
		})
		const rowCount = await getPrismaClient().auditLog.aggregate({
			_count: { _all: true },
			where: whereClause,
		})
		return {
			logs: result.map((log) => ({
				...log,
				data: JSON.stringify(log.data),
			})),
			page: actualPage,
			size: actualSize,
			pageCount: Math.ceil(rowCount._count._all / actualSize),
		}
	},
}
