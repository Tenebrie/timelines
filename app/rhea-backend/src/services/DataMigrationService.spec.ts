import { describe, expect, it, vi } from 'vitest'

import { DataMigrationService } from './DataMigrationService.js'

const now = new Date()

const makeMention = (sourceId: string, targetId: string, overrides: Record<string, unknown> = {}) => ({
	sourceType: 'Actor' as const,
	targetType: 'Event' as const,
	sourceId,
	targetId,
	sourceActorId: sourceId,
	sourceEventId: null,
	sourceArticleId: null,
	sourceTagId: null,
	targetActorId: null,
	targetEventId: targetId,
	targetArticleId: null,
	targetTagId: null,
	pageId: null,
	...overrides,
})

const makeActor = (worldId: string, id = 'actor-1', mentions: ReturnType<typeof makeMention>[] = []) => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'Actor',
	description: '',
	worldId,
	title: '',
	icon: '',
	color: '',
	descriptionRich: '',
	mentions,
})

const makeEvent = (worldId: string, id = 'event-1', mentions: ReturnType<typeof makeMention>[] = []) => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'Event',
	description: '',
	worldId,
	icon: '',
	color: '',
	descriptionRich: '',
	timestamp: BigInt(0),
	revokedAt: null as bigint | null,
	worldEventTrackId: null as string | null,
	mentions,
})

const makeTag = (worldId: string, id = 'tag-1', mentions: ReturnType<typeof makeMention>[] = []) => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'Tag',
	description: '',
	worldId,
	mentions,
})

const makeArticle = (
	worldId: string,
	id = 'article-1',
	{
		parentId = null as string | null,
		mentions = [] as ReturnType<typeof makeMention>[],
		pages = [] as Array<{
			id: string
			createdAt: Date
			updatedAt: Date
			name: string
			description: string
			descriptionRich: string
			parentActorId: string | null
			parentEventId: string | null
			parentArticleId: string | null
		}>,
	} = {},
) => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'Article',
	worldId,
	position: 0,
	icon: '',
	color: '',
	contentRich: '',
	parentId,
	mentions,
	pages,
})

const makePage = (id = 'page-1') => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'Page',
	description: '',
	descriptionRich: '',
	parentActorId: null as string | null,
	parentEventId: null as string | null,
	parentArticleId: null as string | null,
})

const makeMindmapNode = (
	worldId: string,
	id = 'node-1',
	links: ReturnType<typeof makeMindmapLink>[] = [],
) => ({
	id,
	createdAt: now,
	updatedAt: now,
	worldId,
	parentActorId: null as string | null,
	positionX: 0,
	positionY: 0,
	links,
})

const makeMindmapLink = (sourceNodeId: string, targetNodeId: string, id = 'link-1') => ({
	id,
	createdAt: now,
	updatedAt: now,
	direction: 'Normal' as const,
	sourceNodeId,
	targetNodeId,
	content: '',
})

const makeTrack = (worldId: string, id = 'track-1') => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'Track',
	worldId,
	position: 0,
	visible: true,
})

const makeSavedColor = (worldId: string, id = 'color-1') => ({
	id,
	createdAt: now,
	updatedAt: now,
	worldId,
	label: null,
	value: '#000',
})

const makeIconSet = (worldId: string, id = 'iconset-1') => ({
	id,
	worldId,
	iconSet: 'default',
})

const makeWorld = (ownerId: string, id = 'world-1', overrides: Partial<Record<string, unknown>> = {}) => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'World',
	description: '',
	accessMode: 'Private' as const,
	calendar: null,
	ownerId,
	timeOrigin: BigInt(0),
	actors: [] as ReturnType<typeof makeActor>[],
	events: [] as ReturnType<typeof makeEvent>[],
	articles: [] as ReturnType<typeof makeArticle>[],
	tags: [] as ReturnType<typeof makeTag>[],
	savedColors: [] as ReturnType<typeof makeSavedColor>[],
	worldCommonIconSets: [] as ReturnType<typeof makeIconSet>[],
	worldEventTracks: [] as ReturnType<typeof makeTrack>[],
	mindmapNodes: [] as ReturnType<typeof makeMindmapNode>[],
	...overrides,
})

const makeCalendarUnit = (calendarId: string, id = 'unit-1') => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'Unit',
	position: 0,
	calendarId,
	formatMode: 'Numeric' as const,
	negativeFormat: 'MinusSign' as const,
	displayName: null,
	displayNameShort: null,
	displayNamePlural: null,
	formatShorthand: null,
	duration: BigInt(1),
	treeDepth: 0,
	children: [] as Array<{
		id: string
		createdAt: Date
		updatedAt: Date
		label: string | null
		position: number
		calendarId: string
		shortLabel: string | null
		repeats: number
		parentUnitId: string
		childUnitId: string
	}>,
})

const makeCalendarSeason = (calendarId: string, id = 'season-1') => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'Season',
	position: 0,
	calendarId,
	formatShorthand: null,
	intervals: [] as Array<{
		id: string
		createdAt: Date
		updatedAt: Date
		calendarId: string
		leftIndex: number
		rightIndex: number
		seasonId: string
	}>,
})

const makeCalendarPresentation = (calendarId: string, id = 'pres-1') => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'Presentation',
	calendarId,
	compression: 1,
	scaleFactor: 1,
	baselineUnitId: null,
	units: [] as Array<{
		id: string
		createdAt: Date
		updatedAt: Date
		name: string
		position: number
		calendarId: string
		formatString: string
		subdivision: number
		labeledIndices: number[]
		unitId: string
		presentationId: string
	}>,
})

const makeCalendar = (
	{ ownerId = null as string | null, worldId = null as string | null } = {},
	id = 'cal-1',
) => ({
	id,
	createdAt: now,
	updatedAt: now,
	name: 'Calendar',
	description: '',
	worldId,
	position: 0,
	ownerId,
	originTime: BigInt(0),
	dateFormat: null,
	units: [] as ReturnType<typeof makeCalendarUnit>[],
	seasons: [] as ReturnType<typeof makeCalendarSeason>[],
	presentations: [] as ReturnType<typeof makeCalendarPresentation>[],
})

const makeExportData = (
	userId: string,
	worlds = [makeWorld(userId)],
	calendars = [makeCalendar({ ownerId: userId })],
) => ({
	version: 1 as const,
	user: { id: userId, worlds, calendars },
})

const makePrisma = ({
	foreignWorlds = [] as { id: string }[],
	foreignCalendars = [] as { id: string }[],
} = {}) =>
	({
		world: {
			findMany: vi.fn().mockResolvedValue(foreignWorlds),
		},
		calendar: {
			findMany: vi.fn().mockResolvedValue(foreignCalendars),
		},
	}) as unknown as ReturnType<typeof makePrisma>

vi.mock('./dbClients/DatabaseClient.js', () => ({
	getPrismaClient: vi.fn(() => ({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		$transaction: vi.fn(async (fn: (prisma: any) => Promise<any>) =>
			fn({
				world: { findMany: vi.fn().mockResolvedValue([]), deleteMany: vi.fn() },
				calendar: { findMany: vi.fn().mockResolvedValue([]), deleteMany: vi.fn() },
				user: { findUnique: vi.fn(), update: vi.fn() },
				mention: { createMany: vi.fn() },
				wikiArticle: { createMany: vi.fn() },
				contentPage: { createMany: vi.fn() },
			}),
		),
	})),
}))

describe('DataMigrationService', () => {
	const userId = 'user-1'
	const ctx = { user: { id: userId } }

	describe('validateOwnership', () => {
		it('rejects import when a world is owned by another user', async () => {
			const data = makeExportData(userId)
			const prisma = makePrisma({ foreignWorlds: [{ id: 'world-1' }] })
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'Import contains IDs owned by another user',
			)
		})

		it('rejects import when a calendar is owned by another user', async () => {
			const data = makeExportData(userId)
			const prisma = makePrisma({ foreignCalendars: [{ id: 'cal-1' }] })
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'Import contains IDs owned by another user',
			)
		})

		it('rejects world whose ownerId does not match the importing user', async () => {
			const world = makeWorld('other-user', 'world-1')
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow('ownerId')
		})

		it('passes when no foreign ownership is found', async () => {
			const data = makeExportData(userId)
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).resolves.not.toThrow()
		})

		it('rejects actor with wrong worldId', async () => {
			const world = makeWorld(userId)
			world.actors = [makeActor('wrong-world-id')]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched worldId',
			)
		})

		it('rejects event with wrong worldId', async () => {
			const world = makeWorld(userId)
			world.events = [makeEvent('wrong-world-id')]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched worldId',
			)
		})

		it('rejects article with wrong worldId', async () => {
			const world = makeWorld(userId)
			world.articles = [makeArticle('wrong-world-id')]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched worldId',
			)
		})

		it('rejects tag with wrong worldId', async () => {
			const world = makeWorld(userId)
			world.tags = [makeTag('wrong-world-id')]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched worldId',
			)
		})

		it('rejects savedColor with wrong worldId', async () => {
			const world = makeWorld(userId)
			world.savedColors = [makeSavedColor('wrong-world-id')]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched worldId',
			)
		})

		it('rejects worldEventTrack with wrong worldId', async () => {
			const world = makeWorld(userId)
			world.worldEventTracks = [makeTrack('wrong-world-id')]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched worldId',
			)
		})

		it('rejects mindmapNode with wrong worldId', async () => {
			const world = makeWorld(userId)
			world.mindmapNodes = [makeMindmapNode('wrong-world-id')]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched worldId',
			)
		})

		it('rejects worldCommonIconSet with wrong worldId', async () => {
			const world = makeWorld(userId)
			world.worldCommonIconSets = [makeIconSet('wrong-world-id')]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched worldId',
			)
		})

		it('rejects calendar unit with wrong calendarId', async () => {
			const cal = makeCalendar({ ownerId: userId })
			cal.units = [makeCalendarUnit('wrong-cal')]
			const data = makeExportData(userId, [makeWorld(userId)], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched calendarId',
			)
		})

		it('rejects calendar season with wrong calendarId', async () => {
			const cal = makeCalendar({ ownerId: userId })
			cal.seasons = [makeCalendarSeason('wrong-cal')]
			const data = makeExportData(userId, [makeWorld(userId)], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched calendarId',
			)
		})

		it('rejects calendar presentation with wrong calendarId', async () => {
			const cal = makeCalendar({ ownerId: userId })
			cal.presentations = [makeCalendarPresentation('wrong-cal')]
			const data = makeExportData(userId, [makeWorld(userId)], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched calendarId',
			)
		})

		it('rejects calendar unit child with wrong calendarId', async () => {
			const cal = makeCalendar({ ownerId: userId })
			const unit = makeCalendarUnit(cal.id)
			unit.children = [
				{
					id: 'child-1',
					createdAt: now,
					updatedAt: now,
					label: null,
					position: 0,
					calendarId: 'wrong-cal',
					shortLabel: null,
					repeats: 1,
					parentUnitId: unit.id,
					childUnitId: 'other',
				},
			]
			cal.units = [unit]
			const data = makeExportData(userId, [makeWorld(userId)], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched calendarId',
			)
		})

		it('rejects season interval with wrong calendarId', async () => {
			const cal = makeCalendar({ ownerId: userId })
			const season = makeCalendarSeason(cal.id)
			season.intervals = [
				{
					id: 'interval-1',
					createdAt: now,
					updatedAt: now,
					calendarId: 'wrong-cal',
					leftIndex: 0,
					rightIndex: 1,
					seasonId: season.id,
				},
			]
			cal.seasons = [season]
			const data = makeExportData(userId, [makeWorld(userId)], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'contains children with mismatched calendarId',
			)
		})

		it('rejects mention with sourceActorId pointing outside the world', async () => {
			const world = makeWorld(userId)
			const actor = makeActor(world.id, 'actor-1')
			const event = makeEvent(world.id, 'event-1')
			actor.mentions = [makeMention('actor-1', 'event-1', { sourceActorId: 'nonexistent' })]
			world.actors = [actor]
			world.events = [event]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'references entity outside the world',
			)
		})

		it('rejects mention with targetEventId pointing outside the world', async () => {
			const world = makeWorld(userId)
			const actor = makeActor(world.id, 'actor-1')
			actor.mentions = [makeMention('actor-1', 'event-1', { targetEventId: 'nonexistent' })]
			world.actors = [actor]
			world.events = [makeEvent(world.id, 'event-1')]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'references entity outside the world',
			)
		})

		it('accepts valid mention within the same world', async () => {
			const world = makeWorld(userId)
			const actor = makeActor(world.id, 'actor-1')
			const event = makeEvent(world.id, 'event-1')
			actor.mentions = [makeMention('actor-1', 'event-1')]
			world.actors = [actor]
			world.events = [event]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).resolves.not.toThrow()
		})

		it('rejects mention with pageId pointing outside the world', async () => {
			const world = makeWorld(userId)
			const actor = makeActor(world.id, 'actor-1')
			const event = makeEvent(world.id, 'event-1')
			actor.mentions = [makeMention('actor-1', 'event-1', { pageId: 'nonexistent-page' })]
			world.actors = [actor]
			world.events = [event]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'references a page outside the world',
			)
		})

		it('accepts mention with valid pageId', async () => {
			const world = makeWorld(userId)
			const page = makePage('page-1')
			const article = makeArticle(world.id, 'article-1', { pages: [page] })
			const actor = makeActor(world.id, 'actor-1')
			actor.mentions = [
				makeMention('actor-1', 'article-1', {
					targetEventId: null,
					targetArticleId: 'article-1',
					pageId: 'page-1',
				}),
			]
			world.actors = [actor]
			world.articles = [article]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).resolves.not.toThrow()
		})

		it('rejects mention with sourceId/targetId pointing outside the world even when typed fields are valid', async () => {
			const world = makeWorld(userId)
			const actor = makeActor(world.id, 'actor-1')
			const event = makeEvent(world.id, 'event-1')
			actor.mentions = [
				makeMention('nonexistent-source', 'nonexistent-target', {
					sourceActorId: 'actor-1',
					targetEventId: 'event-1',
				}),
			]
			world.actors = [actor]
			world.events = [event]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'references entity outside the world',
			)
		})

		it('rejects tag mention with invalid target', async () => {
			const world = makeWorld(userId)
			const tag = makeTag(world.id, 'tag-1')
			tag.mentions = [
				makeMention('tag-1', 'nonexistent', {
					sourceType: 'Tag',
					sourceActorId: null,
					sourceTagId: 'tag-1',
					targetEventId: 'nonexistent',
				}),
			]
			world.tags = [tag]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'references entity outside the world',
			)
		})

		it('rejects mindmap link with sourceNodeId outside the world', async () => {
			const world = makeWorld(userId)
			const node = makeMindmapNode(world.id, 'node-1', [makeMindmapLink('nonexistent', 'node-1')])
			world.mindmapNodes = [node]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'references a node outside the world',
			)
		})

		it('rejects mindmap link with targetNodeId outside the world', async () => {
			const world = makeWorld(userId)
			const node = makeMindmapNode(world.id, 'node-1', [makeMindmapLink('node-1', 'nonexistent')])
			world.mindmapNodes = [node]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'references a node outside the world',
			)
		})

		it('accepts mindmap link between two valid nodes', async () => {
			const world = makeWorld(userId)
			const node1 = makeMindmapNode(world.id, 'node-1', [makeMindmapLink('node-1', 'node-2')])
			const node2 = makeMindmapNode(world.id, 'node-2')
			world.mindmapNodes = [node1, node2]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).resolves.not.toThrow()
		})

		it('rejects article with parentId outside its world', async () => {
			const world = makeWorld(userId)
			world.articles = [makeArticle(world.id, 'art-1', { parentId: 'nonexistent' })]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'has a parent outside its world',
			)
		})

		it('accepts article with valid parentId', async () => {
			const world = makeWorld(userId)
			world.articles = [
				makeArticle(world.id, 'art-parent'),
				makeArticle(world.id, 'art-child', { parentId: 'art-parent' }),
			]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).resolves.not.toThrow()
		})

		it('accepts article with null parentId', async () => {
			const world = makeWorld(userId)
			world.articles = [makeArticle(world.id, 'art-1')]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).resolves.not.toThrow()
		})

		it('rejects calendar with both worldId and ownerId', async () => {
			const cal = makeCalendar({ ownerId: userId, worldId: 'world-1' })
			const data = makeExportData(userId, [makeWorld(userId)], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'must be owned by either a world or a user, not both or neither',
			)
		})

		it('rejects calendar with neither worldId nor ownerId', async () => {
			const cal = makeCalendar({ ownerId: null, worldId: null })
			const data = makeExportData(userId, [makeWorld(userId)], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'must be owned by either a world or a user, not both or neither',
			)
		})

		it('rejects calendar with ownerId set to a different user', async () => {
			const cal = makeCalendar({ ownerId: 'other-user' })
			const data = makeExportData(userId, [makeWorld(userId)], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'has ownerId set to a different user',
			)
		})

		it('rejects world-owned calendar whose world is not in the import', async () => {
			const cal = makeCalendar({ worldId: 'missing-world' })
			const data = makeExportData(userId, [makeWorld(userId)], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'references world missing-world, which is not in the import',
			)
		})

		it('accepts world-owned calendar whose world IS in the import', async () => {
			const world = makeWorld(userId, 'world-1')
			const cal = makeCalendar({ worldId: 'world-1' })
			const data = makeExportData(userId, [world], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).resolves.not.toThrow()
		})

		it('accepts user-owned calendar with correct ownerId', async () => {
			const cal = makeCalendar({ ownerId: userId })
			const data = makeExportData(userId, [makeWorld(userId)], [cal])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).resolves.not.toThrow()
		})

		it('rejects mention referencing entity in a different world', async () => {
			const world1 = makeWorld(userId, 'world-1')
			const world2 = makeWorld(userId, 'world-2')
			const actor1 = makeActor('world-1', 'actor-in-w1')
			const actor2 = makeActor('world-2', 'actor-in-w2')
			actor1.mentions = [
				makeMention('actor-in-w1', 'actor-in-w2', {
					targetEventId: null,
					targetActorId: 'actor-in-w2',
				}),
			]
			world1.actors = [actor1]
			world2.actors = [actor2]
			const data = makeExportData(userId, [world1, world2])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow(
				'references entity outside the world',
			)
		})

		it('handles empty worlds and calendars', async () => {
			const data = makeExportData(userId, [], [])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).resolves.not.toThrow()
		})

		it('handles world with all empty entity arrays', async () => {
			const data = makeExportData(userId, [makeWorld(userId)])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).resolves.not.toThrow()
		})

		it('rejects content page with parentActorId pointing outside the world', async () => {
			const world = makeWorld(userId)
			const page = makePage('page-1')
			page.parentActorId = 'nonexistent-actor'
			const article = makeArticle(world.id, 'article-1', { pages: [page] })
			world.articles = [article]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow()
		})

		it('rejects event with worldEventTrackId pointing outside the world', async () => {
			const world = makeWorld(userId)
			world.events = [makeEvent(world.id, 'event-1')]
			world.events[0].worldEventTrackId = 'nonexistent-track'
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow()
		})

		it('rejects mindmapNode with parentActorId pointing outside the world', async () => {
			const world = makeWorld(userId)
			const node = makeMindmapNode(world.id, 'node-1')
			node.parentActorId = 'nonexistent-actor'
			world.mindmapNodes = [node]
			const data = makeExportData(userId, [world])
			const prisma = makePrisma()
			await expect(DataMigrationService.validateOwnership(ctx, data, prisma)).rejects.toThrow()
		})
	})

	describe('validateUserData', () => {
		it('returns invalid for wrong version', async () => {
			const prisma = makePrisma()
			const result = await DataMigrationService.validateUserData(
				ctx,
				JSON.stringify({
					version: 999,
					user: { id: userId, worlds: [], calendars: [] },
				}),
				prisma,
			)
			expect(result.isValid).toBe(false)
		})

		it('returns invalid for completely wrong structure', async () => {
			const prisma = makePrisma()
			const result = await DataMigrationService.validateUserData(ctx, JSON.stringify({ foo: 'bar' }), prisma)
			expect(result.isValid).toBe(false)
			expect(result.error).toBeTruthy()
		})

		it('returns invalid for empty object', async () => {
			const prisma = makePrisma()
			const result = await DataMigrationService.validateUserData(ctx, JSON.stringify({}), prisma)
			expect(result.isValid).toBe(false)
		})

		it('returns invalid for missing user field', async () => {
			const prisma = makePrisma()
			const result = await DataMigrationService.validateUserData(ctx, JSON.stringify({ version: 1 }), prisma)
			expect(result.isValid).toBe(false)
		})

		it('version check in code is unreachable because schema enforces version: 1', async () => {
			const prisma = makePrisma()
			const result = await DataMigrationService.validateUserData(
				ctx,
				JSON.stringify({
					version: 2,
					user: { id: 'u', worlds: [], calendars: [] },
				}),
				prisma,
			)
			expect(result.isValid).toBe(false)
			expect(result.error).not.toContain('Unsupported version')
		})
	})

	describe('importUserData', () => {
		it('throws on invalid data', async () => {
			await expect(DataMigrationService.importUserData(ctx, JSON.stringify({ bad: true }))).rejects.toThrow(
				'Invalid user data',
			)
		})

		it('rejects import when data user id does not match the calling user', async () => {
			const data = makeExportData('different-user-id')
			const prisma = makePrisma()
			const result = await DataMigrationService.validateUserData(
				ctx,
				JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
				prisma,
			)
			expect(result.isValid).toBe(false)
			expect(result.error).toBeTruthy()
		})
	})
})
