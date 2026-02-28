import { CollaboratorAccess } from '@prisma/client'
import { BadRequestError } from 'moonflower'
import { WorldShareLinkUncheckedCreateInput } from 'prisma/client/models.js'

import { AnnouncementService } from './AnnouncementService.js'
import { getPrismaClient } from './dbClients/DatabaseClient.js'

export const WorldShareService = {
	listCollaborators: async ({ worldId }: { worldId: string }) => {
		return getPrismaClient().collaboratingUser.findMany({
			where: {
				worldId,
			},
			select: {
				user: {
					select: {
						id: true,
						email: true,
					},
				},
				worldId: true,
				access: true,
			},
		})
	},

	addCollaborators: async ({
		worldId,
		userEmails,
		access,
	}: {
		worldId: string
		userEmails: string[]
		access: CollaboratorAccess
	}) => {
		const world = await getPrismaClient().world.findFirst({
			where: {
				id: worldId,
			},
		})

		if (!world) {
			throw new BadRequestError(`Unable to find world.`)
		}

		const userResults = await Promise.allSettled(
			userEmails.map((email) =>
				getPrismaClient().user.findFirst({
					where: {
						email,
						deletedAt: null,
					},
				}),
			),
		)

		const users = userResults.flatMap((user) => {
			if (user.status === 'rejected' || user.value === null) {
				return []
			}
			return user.value
		})

		if (users.length === 0) {
			return { users }
		}

		await getPrismaClient().$transaction([
			getPrismaClient().collaboratingUser.deleteMany(
				...users.map((user) => ({
					where: {
						AND: {
							userId: user.id,
							worldId: worldId,
						},
					},
				})),
			),
			getPrismaClient().collaboratingUser.createMany(
				...users.map((user) => ({
					data: {
						userId: user.id,
						worldId,
						access,
					},
				})),
			),
		])

		await AnnouncementService.notifyMany(
			users.map((user) => ({
				type: 'WorldShared',
				userId: user.id,
				title: 'Collaboration invite',
				description: 'Someone has shared their World with you!',
			})),
		)

		return { users }
	},

	removeCollaborator: async ({ worldId, userId }: { worldId: string; userId: string }) => {
		const world = await getPrismaClient().world.findFirst({
			where: {
				id: worldId,
			},
		})

		if (!world) {
			throw new BadRequestError(`Unable to find world.`)
		}

		await getPrismaClient().collaboratingUser.delete({
			where: {
				userId_worldId: {
					userId,
					worldId,
				},
			},
		})
	},

	generateRandomSlug: async ({ preferredSlug }: { preferredSlug?: string }) => {
		if (preferredSlug) {
			const existingLink = await getPrismaClient().worldShareLink.findFirst({
				where: {
					slug: preferredSlug,
				},
			})
			if (!existingLink) {
				return {
					slug: preferredSlug,
					preferredSlugFree: true,
				}
			}
		}

		const maxIterations = 10
		for (let i = 0; i < maxIterations; i++) {
			const slug = Math.random().toString(36).slice(2, 10)

			const existingLink = await getPrismaClient().worldShareLink.findFirst({
				where: {
					slug,
				},
			})

			if (!existingLink) {
				return {
					slug,
					preferredSlugFree: false,
				}
			}
		}
		throw new BadRequestError('Unable to generate a unique slug for the share link. Please try again.')
	},

	listShareLinks: async (worldId: string) => {
		return getPrismaClient().worldShareLink.findMany({
			where: {
				worldId,
			},
			select: {
				id: true,
				worldId: true,
				slug: true,
				label: true,
				expiresAt: true,
				accessMode: true,
				createdAt: true,
				usageCount: true,
			},
		})
	},

	createShareLink: async ({
		worldId,
		body,
	}: {
		worldId: string
		body: Omit<WorldShareLinkUncheckedCreateInput, 'slug' | 'worldId'> & { slug?: string }
	}) => {
		const slug = body.slug ?? crypto.randomUUID()

		const shareLink = await getPrismaClient().worldShareLink.create({
			data: {
				...body,
				worldId,
				slug,
			},
		})

		return shareLink
	},

	revokeShareLink: async (shareLinkId: string) => {
		await getPrismaClient().worldShareLink.update({
			where: {
				id: shareLinkId,
			},
			data: {
				expiresAt: new Date(),
			},
		})
	},

	deleteShareLink: async (shareLinkId: string) => {
		await getPrismaClient().worldShareLink.delete({
			where: {
				id: shareLinkId,
			},
		})
	},
}
