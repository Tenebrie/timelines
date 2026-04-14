import {
	Actor,
	Calendar,
	Mention,
	MindmapNode,
	User,
	WikiArticle,
	WorldEvent,
	WorldEventDelta,
} from '@prisma/client'
import { ParameterizedContext } from 'koa'

import {
	RedisChannel,
	RheaToCalliopeMessage,
	RheaToCalliopeMessageType,
} from '../ts-shared/RheaToCalliopeMessage.js'
import { getRedisClient, openRedisChannel } from './dbClients/RedisClient.js'
import { TagService } from './TagService.js'
import { BaselineTag } from './types.js'

const calliope = openRedisChannel<RheaToCalliopeMessage>(RedisChannel.RHEA_TO_CALLIOPE)

type ContextWithSessionId = ParameterizedContext & { sessionId: string | undefined }

export const RedisService = {
	initRedisConnection: async () => {
		await getRedisClient().connect()
	},

	notifyAboutNewAnnouncement: ({ userId }: { userId: string }) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.ANNOUNCEMENT,
			messageSourceSessionId: undefined,
			data: {
				userId,
			},
		})
	},

	notifyAboutWorldUpdate: (
		ctx: ContextWithSessionId,
		{ worldId, timestamp }: { worldId: string; timestamp: Date },
	) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_UPDATED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
				timestamp: timestamp.toISOString(),
			},
		})
	},

	notifyAboutWorldEventUpdate: (
		ctx: ContextWithSessionId,
		{ worldId, event }: { worldId: string; event: Omit<WorldEvent, 'descriptionYjs'> },
	) => {
		const eventToSend = {
			...event,
			descriptionRich: undefined,
		}
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_EVENT_UPDATED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
				event: JSON.stringify(eventToSend, (_, value) =>
					typeof value === 'bigint' ? value.toString() : value,
				),
			},
		})
	},

	notifyAboutUpdatedMentions: (
		ctx: ContextWithSessionId,
		{ worldId, mentions }: { worldId: string; mentions: Mention[] },
	) => {
		mentions
			.filter((mention) => mention.targetType === 'Tag')
			.forEach(async (mention) => {
				RedisService.notifyAboutTagUpdate(ctx, {
					worldId,
					tag: await TagService.findTagOrThrow({ worldId, tagId: mention.targetId }),
				})
			})
	},

	notifyAboutWorldEventDeltaUpdate: (
		ctx: ContextWithSessionId,
		{ worldId, delta }: { worldId: string; delta: WorldEventDelta },
	) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_EVENT_DELTA_UPDATED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
				eventDelta: JSON.stringify(delta, (_, value) =>
					typeof value === 'bigint' ? value.toString() : value,
				),
			},
		})
	},

	notifyAboutActorUpdate: (
		ctx: ContextWithSessionId,
		{ worldId, actor }: { worldId: string; actor: Omit<Actor, 'descriptionYjs'> },
	) => {
		const actorToSend = {
			...actor,
			descriptionRich: undefined,
		}
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.ACTOR_UPDATED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
				actor: JSON.stringify(actorToSend),
			},
		})
	},

	notifyAboutCalendarUpdate: (
		ctx: ContextWithSessionId,
		{ worldId, calendar }: { worldId: string; calendar: Calendar },
	) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.CALENDAR_UPDATED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
				calendar: JSON.stringify(calendar),
			},
		})
	},

	notifyAboutMindmapNodeUpdate: (
		ctx: ContextWithSessionId,
		{ worldId, node }: { worldId: string; node: MindmapNode },
	) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.MINDMAP_NODE_UPDATED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
				node: JSON.stringify(node),
			},
		})
	},

	notifyAboutTagUpdate: (
		ctx: ContextWithSessionId,
		{ worldId, tag }: { worldId: string; tag: BaselineTag },
	) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.TAG_UPDATED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
				tag: JSON.stringify(tag),
			},
		})
	},

	notifyAboutWorldTracksUpdate: (
		ctx: ContextWithSessionId,
		{ worldId, timestamp }: { worldId: string; timestamp: Date },
	) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_TRACKS_UPDATED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
				timestamp: timestamp.toISOString(),
			},
		})
	},

	notifyAboutWorldShared: (ctx: ContextWithSessionId, { users }: { users: User[] }) => {
		users.forEach((user) => {
			calliope.sendMessage({
				type: RheaToCalliopeMessageType.WORLD_SHARED,
				messageSourceSessionId: ctx.sessionId,
				data: {
					userId: user.id,
				},
			})
		})
	},

	notifyAboutWorldUnshared: (ctx: ContextWithSessionId, { userId }: { userId: string }) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_UNSHARED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				userId,
			},
		})
	},

	notifyAboutWikiArticleUpdate: (
		ctx: ContextWithSessionId,
		{ worldId, article }: { worldId: string; article: Omit<WikiArticle, 'contentYjs'> },
	) => {
		const articleToSend = {
			...article,
			contentRich: undefined,
		}
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WIKI_ARTICLE_UPDATED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
				article: JSON.stringify(articleToSend),
			},
		})
	},

	notifyAboutWikiArticleDeletion: (ctx: ContextWithSessionId, { worldId }: { worldId: string }) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WIKI_ARTICLE_DELETED,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
			},
		})
	},

	notifyAboutDocumentReset: (
		ctx: ContextWithSessionId,
		{ worldId, entityId }: { worldId: string; entityId: string },
	) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.DOCUMENT_RESET,
			messageSourceSessionId: ctx.sessionId,
			data: {
				worldId,
				entityId,
			},
		})
	},

	notifyAboutImageGeneration: ({
		userId,
		assetId,
		status,
	}: {
		userId: string
		assetId: string
		status: string
	}) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.IMAGE_GENERATION_UPDATED,
			messageSourceSessionId: undefined,
			data: {
				userId,
				assetId,
				status,
			},
		})
	},
}
