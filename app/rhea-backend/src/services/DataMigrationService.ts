import { BadRequestError } from 'moonflower'
import z from 'zod'

import { TransactionClient } from '../../prisma/client/internal/prismaNamespace.js'
import { exportedUserDataSchema } from './DataMigrationService.schema.js'
import { getPrismaClient } from './dbClients/DatabaseClient.js'

const CURRENT_VERSION = 1

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

		const warnings: string[] = []

		if (data.user.id !== ctx.user.id) {
			warnings.push(
				`This data is exported from a different user. Data will be imported for the current user.`,
			)
		}

		const [foreignWorlds, foreignCalendars] = await Promise.all([
			prisma.world.findMany({
				where: { id: { in: worlds.map((w) => w.id) }, ownerId: { not: ctx.user.id } },
				select: { id: true },
			}),
			prisma.calendar.findMany({
				where: { id: { in: calendars.map((c) => c.id) }, ownerId: { not: ctx.user.id } },
				select: { id: true },
			}),
		])
		if (foreignWorlds.length > 0 || foreignCalendars.length > 0) {
			throw new BadRequestError('Import contains IDs owned by another user')
		}

		for (const world of worlds) {
			if (world.ownerId !== data.user.id) {
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
				...world.calendars,
			].filter((entity) => entity.worldId !== world.id)

			if (childrenWithWrongWorld.length > 0) {
				throw new BadRequestError(`World ${world.id} contains children with mismatched worldId`)
			}
		}

		const allCalendars = [...calendars, ...worlds.flatMap((w) => w.calendars)]
		for (const calendar of allCalendars) {
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

		for (const calendar of allCalendars) {
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

		return warnings
	},

	importUserData: async (ctx: { user: { id: string } }, json: string, options: { dryRun: boolean }) => {
		await getPrismaClient().$transaction(
			async (prisma) => {
				const validationResult = await DataMigrationService.validateUserData(ctx, json, prisma)
				if (!validationResult.isValid) {
					throw new BadRequestError(`Invalid user data: ${validationResult.error}`)
				}
				const currentUserId = ctx.user.id
				const userData = exportedUserDataSchema.parse(parseExportedJson(json)).user

				const { worlds, calendars } = userData

				const importedWorldIds = worlds.map((w) => w.id)
				await prisma.world.deleteMany({
					where: { ownerId: currentUserId, id: { in: importedWorldIds } },
				})
				await prisma.calendar.deleteMany({
					where: {
						ownerId: currentUserId,
						id: { in: calendars.map((c) => c.id) },
					},
				})

				const allMentions = worlds.flatMap((w) => [
					...w.actors.flatMap((a) => a.mentions),
					...w.events.flatMap((e) => e.mentions),
					...w.articles.flatMap((a) => a.mentions),
					...w.tags.flatMap((t) => t.mentions),
				])
				const allArticles = worlds.flatMap((w) => w.articles)
				const allMindmapLinks = worlds.flatMap((w) => w.mindmapNodes.flatMap((n) => n.links))
				const allCalendarUnitRelations = [
					...calendars.flatMap((c) => c.units.flatMap((u) => u.children)),
					...worlds.flatMap((w) => w.calendars.flatMap((c) => c.units.flatMap((u) => u.children))),
				]

				await prisma.user.update({
					where: { id: currentUserId },
					data: {
						calendars: {
							create: strip(calendars).map(({ units, seasons, presentations, ...cal }) => ({
								...cal,
								units: {
									create: strip(units).map(({ children: _c, ...unit }) => unit),
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
											create: strip(pUnits),
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
									calendars: worldCalendars,
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
										create: strip(mindmapNodes).map(({ links: _l, ...node }) => node),
									},
									calendars: {
										create: strip(worldCalendars).map(({ units, seasons, presentations, ...cal }) => ({
											...cal,
											units: {
												create: strip(units).map(({ children: _c, ...unit }) => unit),
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
														create: strip(pUnits),
													},
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

				await prisma.mindmapLink.createMany({ data: allMindmapLinks })
				await prisma.calendarUnitRelation.createMany({ data: allCalendarUnitRelations })

				await prisma.mention.createMany({ data: allMentions })

				if (options.dryRun) {
					throw new DryRunSuccess()
				}
			},
			{
				timeout: 30000,
				isolationLevel: 'Serializable',
			},
		)
	},

	isImportValid: async (ctx: { user: { id: string } }, json: string) => {
		try {
			await DataMigrationService.importUserData(ctx, json, { dryRun: true })
		} catch (error) {
			if (error instanceof DryRunSuccess) {
				return null
			}
			console.error('Import validation failed:', error)
			throw new BadRequestError(`Invalid user data: ${(error as Error).message}`)
		}
		return null
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
		if ('mentions' in copy) delete copy.mentions
		return copy as Omit<T[number], 'mentions'>
	})
}

export class DryRunSuccess extends Error {
	constructor() {
		super('Dry run - rolling back transaction')
	}
}

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
