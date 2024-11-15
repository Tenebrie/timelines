import { baseApi as api } from './baseApi'
export const addTagTypes = [
	'worldDetails',
	'adminUsers',
	'announcementList',
	'auth',
	'worldList',
	'worldEventTracks',
	'worldCollaborators',
] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			createActor: build.mutation<CreateActorApiResponse, CreateActorApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actors`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
			updateActor: build.mutation<UpdateActorApiResponse, UpdateActorApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
			deleteActor: build.mutation<DeleteActorApiResponse, DeleteActorApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldDetails'],
			}),
			adminGetUsers: build.query<AdminGetUsersApiResponse, AdminGetUsersApiArg>({
				query: (queryArg) => ({
					url: `/api/admin/users`,
					params: { page: queryArg.page, size: queryArg.size, query: queryArg.query },
				}),
				providesTags: ['adminUsers'],
			}),
			adminSetUserLevel: build.mutation<AdminSetUserLevelApiResponse, AdminSetUserLevelApiArg>({
				query: (queryArg) => ({
					url: `/api/admin/users/${queryArg.userId}/level`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['adminUsers'],
			}),
			adminDeleteUser: build.mutation<AdminDeleteUserApiResponse, AdminDeleteUserApiArg>({
				query: (queryArg) => ({ url: `/api/admin/users/${queryArg.userId}`, method: 'DELETE' }),
				invalidatesTags: ['adminUsers'],
			}),
			getAnnouncements: build.query<GetAnnouncementsApiResponse, GetAnnouncementsApiArg>({
				query: () => ({ url: `/api/announcements` }),
				providesTags: ['announcementList'],
			}),
			dismissAnnouncement: build.mutation<DismissAnnouncementApiResponse, DismissAnnouncementApiArg>({
				query: (queryArg) => ({ url: `/api/announcements/${queryArg.id}`, method: 'DELETE' }),
				invalidatesTags: ['announcementList'],
			}),
			checkAuthentication: build.query<CheckAuthenticationApiResponse, CheckAuthenticationApiArg>({
				query: () => ({ url: `/api/auth` }),
				providesTags: ['auth'],
			}),
			createAccount: build.mutation<CreateAccountApiResponse, CreateAccountApiArg>({
				query: (queryArg) => ({ url: `/api/auth`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails', 'announcementList'],
			}),
			postLogin: build.mutation<PostLoginApiResponse, PostLoginApiArg>({
				query: (queryArg) => ({ url: `/api/auth/login`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails', 'announcementList', 'adminUsers'],
			}),
			postLogout: build.mutation<PostLogoutApiResponse, PostLogoutApiArg>({
				query: () => ({ url: `/api/auth/logout`, method: 'POST' }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails', 'announcementList'],
			}),
			adminGetUserLevels: build.query<AdminGetUserLevelsApiResponse, AdminGetUserLevelsApiArg>({
				query: () => ({ url: `/api/constants/admin-levels` }),
			}),
			listWorldAccessModes: build.query<ListWorldAccessModesApiResponse, ListWorldAccessModesApiArg>({
				query: () => ({ url: `/api/constants/world-access-modes` }),
			}),
			getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
				query: () => ({ url: `/health` }),
			}),
			createWorldEvent: build.mutation<CreateWorldEventApiResponse, CreateWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
			updateWorldEvent: build.mutation<UpdateWorldEventApiResponse, UpdateWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
			}),
			deleteWorldEvent: build.mutation<DeleteWorldEventApiResponse, DeleteWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldDetails'],
			}),
			revokeWorldEvent: build.mutation<RevokeWorldEventApiResponse, RevokeWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/revoke`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
			unrevokeWorldEvent: build.mutation<UnrevokeWorldEventApiResponse, UnrevokeWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/unrevoke`,
					method: 'POST',
				}),
				invalidatesTags: ['worldDetails'],
			}),
			createWorldEventDelta: build.mutation<CreateWorldEventDeltaApiResponse, CreateWorldEventDeltaApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/delta`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
			updateWorldEventDelta: build.mutation<UpdateWorldEventDeltaApiResponse, UpdateWorldEventDeltaApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/delta/${queryArg.deltaId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
			deleteWorldEventDelta: build.mutation<DeleteWorldEventDeltaApiResponse, DeleteWorldEventDeltaApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/delta/${queryArg.deltaId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldDetails'],
			}),
			getWorldEventTracks: build.query<GetWorldEventTracksApiResponse, GetWorldEventTracksApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/event-tracks` }),
				providesTags: ['worldEventTracks'],
			}),
			createWorldEventTrack: build.mutation<CreateWorldEventTrackApiResponse, CreateWorldEventTrackApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event-track`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEventTracks'],
			}),
			updateWorldEventTrack: build.mutation<UpdateWorldEventTrackApiResponse, UpdateWorldEventTrackApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event-track/${queryArg.trackId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEventTracks'],
			}),
			deleteWorldEventTrack: build.mutation<DeleteWorldEventTrackApiResponse, DeleteWorldEventTrackApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event-track/${queryArg.trackId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldEventTracks'],
			}),
			swapWorldEventTracks: build.mutation<SwapWorldEventTracksApiResponse, SwapWorldEventTracksApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event-track/swap`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEventTracks'],
			}),
			getWorlds: build.query<GetWorldsApiResponse, GetWorldsApiArg>({
				query: () => ({ url: `/api/worlds` }),
				providesTags: ['worldList'],
			}),
			createWorld: build.mutation<CreateWorldApiResponse, CreateWorldApiArg>({
				query: (queryArg) => ({ url: `/api/world`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['worldList'],
			}),
			deleteWorld: build.mutation<DeleteWorldApiResponse, DeleteWorldApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}`, method: 'DELETE' }),
				invalidatesTags: ['worldList'],
			}),
			getWorldInfo: build.query<GetWorldInfoApiResponse, GetWorldInfoApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}` }),
				providesTags: ['worldDetails'],
			}),
			getWorldBrief: build.query<GetWorldBriefApiResponse, GetWorldBriefApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/brief` }),
				providesTags: ['worldDetails'],
			}),
			getWorldCollaborators: build.query<GetWorldCollaboratorsApiResponse, GetWorldCollaboratorsApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/collaborators` }),
				providesTags: ['worldCollaborators'],
			}),
			shareWorld: build.mutation<ShareWorldApiResponse, ShareWorldApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/share`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldCollaborators'],
			}),
			setWorldAccessMode: build.mutation<SetWorldAccessModeApiResponse, SetWorldAccessModeApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/access`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
			unshareWorld: build.mutation<UnshareWorldApiResponse, UnshareWorldApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/share/${queryArg.userId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldCollaborators'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as rheaApi }
export type CreateActorApiResponse = /** status 200  */ {
	id: string
}
export type CreateActorApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
		title?: string
		color?: string
		description?: string
	}
}
export type UpdateActorApiResponse = /** status 200  */ {
	description: string
	name: string
	id: string
	createdAt: string
	updatedAt: string
	title: string
	color: string
	worldId: string
}
export type UpdateActorApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
	body: {
		name?: string
		title?: string
		color?: string
		description?: string
	}
}
export type DeleteActorApiResponse = /** status 200  */ {
	description: string
	name: string
	id: string
	createdAt: string
	updatedAt: string
	title: string
	color: string
	worldId: string
}
export type DeleteActorApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
}
export type AdminGetUsersApiResponse = /** status 200  */ {
	users: {
		id: string
		createdAt: string
		updatedAt: string
		email: string
		username: string
		level: 'Free' | 'Premium' | 'Admin'
	}[]
	page: number
	size: number
	pageCount: number
}
export type AdminGetUsersApiArg = {
	/** Any numeric value */
	page?: number
	/** Any numeric value */
	size?: number
	/** Any string value */
	query?: string
}
export type AdminSetUserLevelApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	email: string
	username: string
	password: string
	level: 'Free' | 'Premium' | 'Admin'
}
export type AdminSetUserLevelApiArg = {
	/** Any string value with at least one character */
	userId: string
	body: {
		level: 'Free' | 'Premium' | 'Admin'
	}
}
export type AdminDeleteUserApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	email: string
	username: string
	password: string
	level: 'Free' | 'Premium' | 'Admin'
}
export type AdminDeleteUserApiArg = {
	/** Any string value with at least one character */
	userId: string
}
export type GetAnnouncementsApiResponse = /** status 200  */ {
	description: string
	id: string
	title: string
	type: 'Info' | 'Welcome' | 'WorldShared'
	timestamp: string
	userId: string
	isUnread: boolean
}[]
export type GetAnnouncementsApiArg = void
export type DismissAnnouncementApiResponse = unknown
export type DismissAnnouncementApiArg = {
	/** Any string value */
	id: string
}
export type CheckAuthenticationApiResponse =
	/** status 200  */
	| {
			authenticated: boolean
	  }
	| {
			authenticated: boolean
			user: {
				id: string
				email: string
				username: string
				level: 'Free' | 'Premium' | 'Admin'
			}
	  }
export type CheckAuthenticationApiArg = void
export type CreateAccountApiResponse = /** status 200  */ {
	id: string
	email: string
	username: string
	level: 'Free' | 'Premium' | 'Admin'
}
export type CreateAccountApiArg = {
	body: {
		email: string
		username: string
		password: string
	}
}
export type PostLoginApiResponse = /** status 200  */ {
	id: string
	email: string
	username: string
	level: 'Free' | 'Premium' | 'Admin'
}
export type PostLoginApiArg = {
	body: {
		email: string
		password: string
	}
}
export type PostLogoutApiResponse = unknown
export type PostLogoutApiArg = void
export type AdminGetUserLevelsApiResponse = /** status 200  */ ('Free' | 'Premium' | 'Admin')[]
export type AdminGetUserLevelsApiArg = void
export type ListWorldAccessModesApiResponse = /** status 200  */ ('Private' | 'PublicRead' | 'PublicEdit')[]
export type ListWorldAccessModesApiArg = void
export type GetHealthApiResponse = /** status 200  */ string
export type GetHealthApiArg = void
export type CreateWorldEventApiResponse = /** status 200  */ {
	id: string
}
export type CreateWorldEventApiArg = {
	/** Any string value */
	worldId: string
	body: {
		type: 'SCENE' | 'OTHER'
		modules: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
		name: string
		icon: string
		description: string
		timestamp: string
		revokedAt: null | string
		targetActorIds: string[]
		mentionedActorIds: string[]
		customNameEnabled: boolean
		externalLink: string
		worldEventTrackId?: string
	}
}
export type UpdateWorldEventApiResponse = /** status 200  */ {
	targetActors: {
		description: string
		name: string
		id: string
		createdAt: string
		updatedAt: string
		title: string
		color: string
		worldId: string
	}[]
	mentionedActors: {
		description: string
		name: string
		id: string
		createdAt: string
		updatedAt: string
		title: string
		color: string
		worldId: string
	}[]
	deltaStates: {
		description: null | string
		name: null | string
		id: string
		createdAt: string
		updatedAt: string
		timestamp: string
		worldEventId: string
	}[]
	description: string
	name: string
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	type: 'SCENE' | 'OTHER'
	icon: string
	timestamp: string
	revokedAt: null | string
	customName: boolean
	externalLink: string
	extraFields: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
	worldEventTrackId: null | string
}
export type UpdateWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	body: {
		modules?: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
		name?: string
		icon?: string
		timestamp?: string
		revokedAt?: null | string
		description?: string
		targetActorIds?: string[]
		mentionedActorIds?: string[]
		customNameEnabled?: boolean
		externalLink?: string
		worldEventTrackId?: null | string
	}
}
export type DeleteWorldEventApiResponse = /** status 200  */ {
	description: string
	name: string
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	type: 'SCENE' | 'OTHER'
	icon: string
	timestamp: string
	revokedAt: null | string
	customName: boolean
	externalLink: string
	extraFields: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
	worldEventTrackId: null | string
}
export type DeleteWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
}
export type RevokeWorldEventApiResponse = /** status 200  */ {
	description: string
	name: string
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	type: 'SCENE' | 'OTHER'
	icon: string
	timestamp: string
	revokedAt: null | string
	customName: boolean
	externalLink: string
	extraFields: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
	worldEventTrackId: null | string
}
export type RevokeWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	body: {
		revokedAt: string
	}
}
export type UnrevokeWorldEventApiResponse = /** status 200  */ {
	description: string
	name: string
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	type: 'SCENE' | 'OTHER'
	icon: string
	timestamp: string
	revokedAt: null | string
	customName: boolean
	externalLink: string
	extraFields: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
	worldEventTrackId: null | string
}
export type UnrevokeWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
}
export type CreateWorldEventDeltaApiResponse = /** status 200  */ {
	id: string
}
export type CreateWorldEventDeltaApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	body: {
		timestamp: string
		name: null | string
		description: null | string
	}
}
export type UpdateWorldEventDeltaApiResponse = /** status 200  */ {
	description: null | string
	name: null | string
	id: string
	createdAt: string
	updatedAt: string
	timestamp: string
	worldEventId: string
}
export type UpdateWorldEventDeltaApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	/** Any string value */
	deltaId: string
	body: {
		timestamp?: string
		name?: null | string
		description?: null | string
		worldEventTrackId?: null | string
	}
}
export type DeleteWorldEventDeltaApiResponse = /** status 200  */ {
	description: null | string
	name: null | string
	id: string
	createdAt: string
	updatedAt: string
	timestamp: string
	worldEventId: string
}
export type DeleteWorldEventDeltaApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	/** Any string value */
	deltaId: string
}
export type GetWorldEventTracksApiResponse = /** status 200  */ {
	name: string
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	position: number
	visible: boolean
}[]
export type GetWorldEventTracksApiArg = {
	/** Any string value */
	worldId: string
}
export type CreateWorldEventTrackApiResponse = /** status 200  */ {
	id: string
}
export type CreateWorldEventTrackApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
		position?: number
		assignOrphans: boolean
	}
}
export type UpdateWorldEventTrackApiResponse = /** status 200  */ {
	id: string
}
export type UpdateWorldEventTrackApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	trackId: string
	body: {
		name?: string
		position?: number
		visible?: boolean
	}
}
export type DeleteWorldEventTrackApiResponse = /** status 200  */ {
	name: string
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	position: number
	visible: boolean
}
export type DeleteWorldEventTrackApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	trackId: string
}
export type SwapWorldEventTracksApiResponse = unknown
export type SwapWorldEventTracksApiArg = {
	/** Any string value */
	worldId: string
	body: {
		trackA: string
		trackB: string
	}
}
export type GetWorldsApiResponse = /** status 200  */ {
	ownedWorlds: {
		collaborators: {
			worldId: string
			userId: string
			access: 'ReadOnly' | 'Editing'
		}[]
		name: string
		id: string
		createdAt: string
		updatedAt: string
		calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin: string
		ownerId: string
		accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
	}[]
	contributableWorlds: {
		collaborators: {
			worldId: string
			userId: string
			access: 'ReadOnly' | 'Editing'
		}[]
		name: string
		id: string
		createdAt: string
		updatedAt: string
		calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin: string
		ownerId: string
		accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
	}[]
	visibleWorlds: {
		collaborators: {
			worldId: string
			userId: string
			access: 'ReadOnly' | 'Editing'
		}[]
		name: string
		id: string
		createdAt: string
		updatedAt: string
		calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin: string
		ownerId: string
		accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
	}[]
}
export type GetWorldsApiArg = void
export type CreateWorldApiResponse = /** status 200  */ {
	name: string
	id: string
}
export type CreateWorldApiArg = {
	body: {
		name: string
		calendar?: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin?: number
	}
}
export type DeleteWorldApiResponse = /** status 200  */ {
	name: string
	id: string
	createdAt: string
	updatedAt: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
	timeOrigin: string
	ownerId: string
	accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
}
export type DeleteWorldApiArg = {
	/** Any string value */
	worldId: string
}
export type GetWorldInfoApiResponse = /** status 200  */ {
	isReadOnly: boolean
	actors: {
		statements: {
			id: string
		}[]
		relationships: {
			name: string
			receiverId: string
			originId: string
		}[]
		receivedRelationships: {
			name: string
			receiverId: string
			originId: string
		}[]
		description: string
		name: string
		id: string
		createdAt: string
		updatedAt: string
		title: string
		color: string
		worldId: string
	}[]
	events: {
		targetActors: {
			description: string
			name: string
			id: string
			createdAt: string
			updatedAt: string
			title: string
			color: string
			worldId: string
		}[]
		mentionedActors: {
			description: string
			name: string
			id: string
			createdAt: string
			updatedAt: string
			title: string
			color: string
			worldId: string
		}[]
		introducedActors: {
			description: string
			name: string
			id: string
			createdAt: string
			updatedAt: string
			title: string
			color: string
			worldId: string
		}[]
		terminatedActors: {
			description: string
			name: string
			id: string
			createdAt: string
			updatedAt: string
			title: string
			color: string
			worldId: string
		}[]
		deltaStates: {
			description: null | string
			name: null | string
			id: string
			createdAt: string
			updatedAt: string
			timestamp: string
			worldEventId: string
		}[]
		description: string
		name: string
		id: string
		createdAt: string
		updatedAt: string
		worldId: string
		type: 'SCENE' | 'OTHER'
		icon: string
		timestamp: string
		revokedAt: null | string
		customName: boolean
		externalLink: string
		extraFields: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
		worldEventTrackId: null | string
	}[]
	name: string
	id: string
	createdAt: string
	updatedAt: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
	timeOrigin: string
	ownerId: string
	accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
}
export type GetWorldInfoApiArg = {
	/** Any string value */
	worldId: string
}
export type GetWorldBriefApiResponse = /** status 200  */ {
	name: string
	id: string
	createdAt: string
	updatedAt: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
	timeOrigin: string
	ownerId: string
	accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
}
export type GetWorldBriefApiArg = {
	/** Any string value */
	worldId: string
}
export type GetWorldCollaboratorsApiResponse = /** status 200  */ {
	worldId: string
	user: {
		id: string
		email: string
	}
	access: 'ReadOnly' | 'Editing'
}[]
export type GetWorldCollaboratorsApiArg = {
	/** Any string value */
	worldId: string
}
export type ShareWorldApiResponse = unknown
export type ShareWorldApiArg = {
	/** Any string value */
	worldId: string
	body: {
		userEmails: string[]
		access: 'ReadOnly' | 'Editing'
	}
}
export type SetWorldAccessModeApiResponse = unknown
export type SetWorldAccessModeApiArg = {
	/** Any string value */
	worldId: string
	body: {
		access: 'Private' | 'PublicRead' | 'PublicEdit'
	}
}
export type UnshareWorldApiResponse = unknown
export type UnshareWorldApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	userId: string
}
export const {
	useCreateActorMutation,
	useUpdateActorMutation,
	useDeleteActorMutation,
	useAdminGetUsersQuery,
	useLazyAdminGetUsersQuery,
	useAdminSetUserLevelMutation,
	useAdminDeleteUserMutation,
	useGetAnnouncementsQuery,
	useLazyGetAnnouncementsQuery,
	useDismissAnnouncementMutation,
	useCheckAuthenticationQuery,
	useLazyCheckAuthenticationQuery,
	useCreateAccountMutation,
	usePostLoginMutation,
	usePostLogoutMutation,
	useAdminGetUserLevelsQuery,
	useLazyAdminGetUserLevelsQuery,
	useListWorldAccessModesQuery,
	useLazyListWorldAccessModesQuery,
	useGetHealthQuery,
	useLazyGetHealthQuery,
	useCreateWorldEventMutation,
	useUpdateWorldEventMutation,
	useDeleteWorldEventMutation,
	useRevokeWorldEventMutation,
	useUnrevokeWorldEventMutation,
	useCreateWorldEventDeltaMutation,
	useUpdateWorldEventDeltaMutation,
	useDeleteWorldEventDeltaMutation,
	useGetWorldEventTracksQuery,
	useLazyGetWorldEventTracksQuery,
	useCreateWorldEventTrackMutation,
	useUpdateWorldEventTrackMutation,
	useDeleteWorldEventTrackMutation,
	useSwapWorldEventTracksMutation,
	useGetWorldsQuery,
	useLazyGetWorldsQuery,
	useCreateWorldMutation,
	useDeleteWorldMutation,
	useGetWorldInfoQuery,
	useLazyGetWorldInfoQuery,
	useGetWorldBriefQuery,
	useLazyGetWorldBriefQuery,
	useGetWorldCollaboratorsQuery,
	useLazyGetWorldCollaboratorsQuery,
	useShareWorldMutation,
	useSetWorldAccessModeMutation,
	useUnshareWorldMutation,
} = injectedRtkApi
