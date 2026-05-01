import { BadRequestError } from 'moonflower'
import z from 'zod'

import { TransactionClient } from '../../prisma/client/internal/prismaNamespace.js'
import { exportedUserDataSchema } from './DataMigrationService.schema.js'
import { getPrismaClient } from './dbClients/DatabaseClient.js'

const CURRENT_VERSION = 1

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
const BIGINT_FIELDS = new Set(['duration', 'originTime', 'timestamp', 'revokedAt', 'timeOrigin'])

/**
 * JSON reviver that restores Date objects and BigInt values from their string representations.
 * Needed because JSON.stringify serializes Dates as ISO strings and BigInts as plain number strings.
 */
function jsonReviver(key: string, value: unknown): unknown {
	if (typeof value === 'string') {
		if (ISO_DATE_REGEX.test(value)) {
			const date = new Date(value)
			if (!isNaN(date.getTime())) {
				return date
			}
		}
		if (BIGINT_FIELDS.has(key) && /^-?\d+$/.test(value)) {
			return BigInt(value)
		}
	}
	return value
}

function parseExportedJson(json: string): unknown {
	return JSON.parse(json, jsonReviver)
}

export const DataMigrationService = {
	exportUserData: async (ctx: { user: { id: string } }) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const user = await prisma.user.findUnique({
				where: { id: ctx.user.id },
				include: {
					calendars: {
						include: {
							presentations: {
								include: {
									units: true,
								},
							},
							seasons: {
								include: {
									intervals: true,
								},
							},
							units: {
								include: {
									children: true,
								},
							},
						},
					},
					worlds: {
						include: {
							actors: {
								omit: {
									descriptionYjs: true,
								},
								include: {
									mentions: true,
								},
							},
							events: {
								omit: {
									descriptionYjs: true,
								},
								include: {
									mentions: true,
								},
							},
							articles: {
								omit: {
									contentYjs: true,
								},
								include: {
									mentions: true,
									pages: {
										omit: {
											descriptionYjs: true,
										},
									},
								},
							},
							tags: {
								include: {
									mentions: true,
								},
							},
							savedColors: true,
							mindmapNodes: {
								include: {
									links: true,
								},
							},
							worldCommonIconSets: true,
							worldEventTracks: true,
						},
					},
				},
			})

			if (!user) {
				throw new BadRequestError('No user found')
			}

			return {
				version: 1,
				user: {
					id: user.id,
					calendars: user.calendars,
					worlds: user.worlds,
				},
			}
		})
	},

	validateUserData: async (ctx: { user: { id: string } }, json: string, prisma: TransactionClient) => {
		const parsedJson = exportedUserDataSchema.safeParse(parseExportedJson(json))
		if (!parsedJson.success) {
			return {
				isValid: false,
				error: parsedJson.error.message,
			}
		}
		if (parsedJson.data.version !== CURRENT_VERSION) {
			return {
				isValid: false,
				error: `Unsupported version: ${parsedJson.data.version}. Expected: ${CURRENT_VERSION}`,
			}
		}

		try {
			await DataMigrationService.validateOwnership(ctx, parsedJson.data, prisma)
		} catch (error) {
			return {
				isValid: false,
				error: (error as Error).message,
			}
		}
		return {
			isValid: true,
			error: null,
		}
	},

	validateOwnership: async (
		ctx: { user: { id: string } },
		data: z.infer<typeof exportedUserDataSchema>,
		prisma: TransactionClient,
	) => {
		const userId = data.user.id
		const { worlds, calendars } = data.user

		if (data.user.id !== ctx.user.id) {
			throw new BadRequestError('User ID mismatch')
		}

		const [foreignWorlds, foreignCalendars] = await Promise.all([
			prisma.world.findMany({
				where: { id: { in: worlds.map((w) => w.id) }, ownerId: { not: userId } },
				select: { id: true },
			}),
			prisma.calendar.findMany({
				where: { id: { in: calendars.map((c) => c.id) }, ownerId: { not: userId } },
				select: { id: true },
			}),
		])
		if (foreignWorlds.length > 0 || foreignCalendars.length > 0) {
			throw new BadRequestError('Import contains IDs owned by another user')
		}

		for (const world of worlds) {
			if (world.ownerId !== userId) {
				throw new BadRequestError(`World ${world.id} has ownerId set to a different user`)
			}
		}

		for (const world of worlds) {
			const childrenWithWrongWorld = [
				...world.actors,
				...world.events,
				...world.articles,
				...world.tags,
				...world.savedColors,
				...world.worldCommonIconSets,
				...world.worldEventTracks,
				...world.mindmapNodes,
			].filter((entity) => entity.worldId !== world.id)

			if (childrenWithWrongWorld.length > 0) {
				throw new BadRequestError(`World ${world.id} contains children with mismatched worldId`)
			}
		}

		for (const calendar of calendars) {
			const childrenWithWrongCalendar = [
				...calendar.units,
				...calendar.seasons,
				...calendar.presentations,
				...calendar.units.flatMap((u) => u.children),
				...calendar.seasons.flatMap((s) => s.intervals),
				...calendar.presentations.flatMap((p) => p.units),
			].filter((entity) => entity.calendarId !== calendar.id)

			if (childrenWithWrongCalendar.length > 0) {
				throw new BadRequestError(`Calendar ${calendar.id} contains children with mismatched calendarId`)
			}
		}

		for (const world of worlds) {
			const validIds = new Set<string>([
				...world.actors.map((a) => a.id),
				...world.events.map((e) => e.id),
				...world.articles.map((a) => a.id),
				...world.tags.map((t) => t.id),
			])
			const validPageIds = new Set<string>(world.articles.flatMap((a) => a.pages.map((p) => p.id)))

			const allWorldMentions = [
				...world.actors.flatMap((a) => a.mentions),
				...world.events.flatMap((e) => e.mentions),
				...world.articles.flatMap((a) => a.mentions),
				...world.tags.flatMap((t) => t.mentions),
			]

			for (const m of allWorldMentions) {
				const refs = [
					m.sourceId,
					m.targetId,
					m.sourceActorId,
					m.sourceEventId,
					m.sourceArticleId,
					m.sourceTagId,
					m.targetActorId,
					m.targetEventId,
					m.targetArticleId,
					m.targetTagId,
				].filter((id): id is string => id !== null && id !== undefined)

				if (refs.some((id) => !validIds.has(id))) {
					throw new BadRequestError(
						`Mention ${m.sourceId}->${m.targetId} references entity outside the world`,
					)
				}
				if (m.pageId && !validPageIds.has(m.pageId)) {
					throw new BadRequestError(
						`Mention ${m.sourceId}->${m.targetId} references a page outside the world`,
					)
				}
			}
		}

		for (const world of worlds) {
			const nodeIds = new Set(world.mindmapNodes.map((n) => n.id))
			for (const node of world.mindmapNodes) {
				for (const link of node.links) {
					const refs = [link.sourceNodeId, link.targetNodeId].filter((id): id is string => id != null)
					if (refs.some((id) => !nodeIds.has(id))) {
						throw new BadRequestError(`Mindmap link in world ${world.id} references a node outside the world`)
					}
				}
			}
		}

		for (const world of worlds) {
			const articleIds = new Set(world.articles.map((a) => a.id))
			for (const article of world.articles) {
				if (article.parentId && !articleIds.has(article.parentId)) {
					throw new BadRequestError(`Article ${article.id} has a parent outside its world`)
				}
			}
		}

		for (const world of worlds) {
			const actorIds = new Set(world.actors.map((a) => a.id))
			const eventIds = new Set(world.events.map((e) => e.id))
			const articleIds = new Set(world.articles.map((a) => a.id))
			for (const article of world.articles) {
				for (const page of article.pages) {
					if (page.parentActorId && !actorIds.has(page.parentActorId)) {
						throw new BadRequestError(`Page ${page.id} references an actor outside its world`)
					}
					if (page.parentEventId && !eventIds.has(page.parentEventId)) {
						throw new BadRequestError(`Page ${page.id} references an event outside its world`)
					}
					if (page.parentArticleId && !articleIds.has(page.parentArticleId)) {
						throw new BadRequestError(`Page ${page.id} references an article outside its world`)
					}
				}
			}
		}

		for (const world of worlds) {
			const trackIds = new Set(world.worldEventTracks.map((t) => t.id))
			for (const event of world.events) {
				if (event.worldEventTrackId && !trackIds.has(event.worldEventTrackId)) {
					throw new BadRequestError(`Event ${event.id} references a track outside its world`)
				}
			}
		}

		for (const world of worlds) {
			const actorIds = new Set(world.actors.map((a) => a.id))
			for (const node of world.mindmapNodes) {
				if (node.parentActorId && !actorIds.has(node.parentActorId)) {
					throw new BadRequestError(`MindmapNode ${node.id} references an actor outside its world`)
				}
			}
		}

		for (const calendar of calendars) {
			const hasWorld = calendar.worldId != null
			const hasOwner = calendar.ownerId != null

			if (hasWorld === hasOwner) {
				throw new BadRequestError(
					`Calendar ${calendar.id} must be owned by either a world or a user, not both or neither`,
				)
			}

			if (hasOwner && calendar.ownerId !== userId) {
				throw new BadRequestError(`Calendar ${calendar.id} has ownerId set to a different user`)
			}

			if (hasWorld && !worlds.some((w) => w.id === calendar.worldId)) {
				throw new BadRequestError(
					`Calendar ${calendar.id} references world ${calendar.worldId}, which is not in the import`,
				)
			}
		}
	},

	importUserData: async (ctx: { user: { id: string } }, json: string) => {
		await getPrismaClient().$transaction(async (prisma) => {
			const validationResult = await DataMigrationService.validateUserData(ctx, json, prisma)
			if (!validationResult.isValid) {
				throw new BadRequestError(`Invalid user data: ${validationResult.error}`)
			}
			const userId = ctx.user.id
			const userData = exportedUserDataSchema.parse(parseExportedJson(json)).user

			const { worlds, calendars } = userData

			await prisma.calendar.deleteMany({
				where: { ownerId: userId, id: { in: calendars.map((c) => c.id) } },
			})
			await prisma.world.deleteMany({
				where: { ownerId: userId, id: { in: worlds.map((w) => w.id) } },
			})

			const allMentions = worlds.flatMap((w) => [
				...w.actors.flatMap((a) => a.mentions),
				...w.events.flatMap((e) => e.mentions),
				...w.articles.flatMap((a) => a.mentions),
				...w.tags.flatMap((t) => t.mentions),
			])
			const allArticles = worlds.flatMap((w) => w.articles)

			await prisma.user.update({
				where: { id: userId },
				data: {
					calendars: {
						create: strip(calendars).map(({ units, seasons, presentations, ...cal }) => ({
							...cal,
							units: {
								create: strip(units).map((unit) => ({
									...unit,
									children: {
										create: strip(unit.children),
									},
								})),
							},
							seasons: {
								create: strip(seasons).map((season) => ({
									...season,
									intervals: {
										create: strip(season.intervals),
									},
								})),
							},
							presentations: {
								create: strip(presentations).map(({ units: pUnits, ...p }) => ({
									...p,
									units: {
										create: pUnits.map((u) => ({
											...u,
											calendarId: undefined,
											presentationId: undefined,
										})),
									},
								})),
							},
						})),
					},
					worlds: {
						create: strip(worlds).map(
							({
								tags,
								savedColors,
								worldCommonIconSets,
								worldEventTracks,
								actors,
								events,
								articles: _articles,
								mindmapNodes,
								...world
							}) => ({
								...world,
								tags: { create: strip(tags) },
								savedColors: {
									create: strip(savedColors),
								},
								worldCommonIconSets: {
									create: strip(worldCommonIconSets),
								},
								worldEventTracks: { create: strip(worldEventTracks) },
								actors: {
									create: strip(actors),
								},
								events: {
									create: strip(events),
								},
								mindmapNodes: {
									create: strip(mindmapNodes).map((node) => ({
										...node,
										links: {
											create: strip(node.links).map((link) => ({
												...link,
											})),
										},
									})),
								},
							}),
						),
					},
				},
			})

			await prisma.wikiArticle.createMany({
				data: allArticles.map(({ mentions: _m, pages: _p, ...a }) => a),
			})
			await prisma.contentPage.createMany({
				data: allArticles.flatMap((a) => a.pages),
			})

			await prisma.mention.createMany({ data: allMentions })
		})
	},
}

function strip<T extends object[]>(arr: T): Omit<T[number], 'mentions'>[] {
	return arr.map((item) => {
		const copy = { ...item }
		if ('ownerId' in copy) delete copy.ownerId
		if ('worldId' in copy) delete copy.worldId
		if ('calendarId' in copy) delete copy.calendarId
		if ('seasonId' in copy) delete copy.seasonId
		if ('intervals' in copy) delete copy.intervals
		if ('presentationId' in copy) delete copy.presentationId
		if ('actorId' in copy) delete copy.actorId
		if ('parentUnitId' in copy) delete copy.parentUnitId
		if ('sourceNodeId' in copy) delete copy.sourceNodeId
		if ('targetNodeId' in copy) delete copy.targetNodeId
		if ('mentions' in copy) delete copy.mentions
		return copy as Omit<T[number], 'mentions'>
	})
}
