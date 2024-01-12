import { baseApi as api } from './baseApi'
export const addTagTypes = [
	'worldDetails',
	'adminUsers',
	'announcementList',
	'auth',
	'worldList',
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
				query: () => ({ url: `/api/admin/users` }),
				providesTags: ['adminUsers'],
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
				invalidatesTags: ['auth', 'worldList', 'worldDetails', 'announcementList'],
			}),
			postLogout: build.mutation<PostLogoutApiResponse, PostLogoutApiArg>({
				query: () => ({ url: `/api/auth/logout`, method: 'POST' }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails', 'announcementList'],
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
				invalidatesTags: ['worldDetails'],
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
	id: string
	createdAt: string
	updatedAt: string
	name: string
	title: string
	description: string
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
	id: string
	createdAt: string
	updatedAt: string
	name: string
	title: string
	description: string
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
	id: string
	email: string
	username: string
	password: string
	level: 'Free' | 'Premium' | 'Admin'
}[]
export type AdminGetUsersApiArg = void
export type GetAnnouncementsApiResponse = /** status 200  */ {
	id: string
	timestamp: string
	isUnread: boolean
	type: 'Info' | 'Welcome' | 'WorldShared'
	title: string
	description: string
	userId: string
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
			user: {
				id: string
				email: string
				username: string
				level: 'Free' | 'Premium' | 'Admin'
			}
	  }
	| {
			authenticated: boolean
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
export type CreateWorldEventApiResponse = /** status 200  */ {
	id: string
}
export type CreateWorldEventApiArg = {
	/** Any string value */
	worldId: string
	body: {
		type: 'SCENE' | 'OTHER'
		modules: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors')[]
		name: string
		icon: string
		description: string
		timestamp: string
		revokedAt: null | string
		targetActorIds: string[]
		mentionedActorIds: string[]
		customNameEnabled: boolean
	}
}
export type UpdateWorldEventApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	type: 'SCENE' | 'OTHER'
	icon: string
	name: string
	timestamp: string
	revokedAt?: null | string
	description: string
	customName: boolean
	extraFields: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors')[]
	worldId: string
	targetActors: {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		title: string
		description: string
		color: string
		worldId: string
	}[]
	mentionedActors: {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		title: string
		description: string
		color: string
		worldId: string
	}[]
	deltaStates: {
		id: string
		createdAt: string
		updatedAt: string
		timestamp: string
		name?: null | string
		description?: null | string
		worldEventId: string
	}[]
}
export type UpdateWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	body: {
		modules?: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors')[]
		name?: string
		icon?: string
		timestamp?: string
		revokedAt?: null | string
		description?: string
		targetActorIds?: string[]
		mentionedActorIds?: string[]
		customNameEnabled?: boolean
	}
}
export type DeleteWorldEventApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	type: 'SCENE' | 'OTHER'
	icon: string
	name: string
	timestamp: string
	revokedAt?: null | string
	description: string
	customName: boolean
	extraFields: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors')[]
	worldId: string
}
export type DeleteWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
}
export type RevokeWorldEventApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	type: 'SCENE' | 'OTHER'
	icon: string
	name: string
	timestamp: string
	revokedAt?: null | string
	description: string
	customName: boolean
	extraFields: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors')[]
	worldId: string
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
	id: string
	createdAt: string
	updatedAt: string
	type: 'SCENE' | 'OTHER'
	icon: string
	name: string
	timestamp: string
	revokedAt?: null | string
	description: string
	customName: boolean
	extraFields: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors')[]
	worldId: string
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
	id: string
	createdAt: string
	updatedAt: string
	timestamp: string
	name?: null | string
	description?: null | string
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
	}
}
export type DeleteWorldEventDeltaApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	timestamp: string
	name?: null | string
	description?: null | string
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
export type GetWorldsApiResponse = /** status 200  */ {
	ownedWorlds: {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD'
		timeOrigin: string
		ownerId: string
		collaborators: {
			access: 'ReadOnly' | 'Editing'
			userId: string
			worldId: string
		}[]
	}[]
	contributableWorlds: {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD'
		timeOrigin: string
		ownerId: string
		collaborators: {
			access: 'ReadOnly' | 'Editing'
			userId: string
			worldId: string
		}[]
	}[]
	visibleWorlds: {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD'
		timeOrigin: string
		ownerId: string
		collaborators: {
			access: 'ReadOnly' | 'Editing'
			userId: string
			worldId: string
		}[]
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
		calendar?: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD'
		timeOrigin?: number
	}
}
export type DeleteWorldApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	name: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD'
	timeOrigin: string
	ownerId: string
}
export type DeleteWorldApiArg = {
	/** Any string value */
	worldId: string
}
export type GetWorldInfoApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	name: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD'
	timeOrigin: string
	ownerId: string
	actors: {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		title: string
		description: string
		color: string
		worldId: string
		statements: {
			id: string
		}[]
		relationships: {
			originId: string
			receiverId: string
			name: string
		}[]
		receivedRelationships: {
			originId: string
			receiverId: string
			name: string
		}[]
	}[]
	events: {
		id: string
		createdAt: string
		updatedAt: string
		type: 'SCENE' | 'OTHER'
		icon: string
		name: string
		timestamp: string
		revokedAt?: null | string
		description: string
		customName: boolean
		extraFields: ('RevokedAt' | 'EventIcon' | 'TargetActors' | 'MentionedActors')[]
		worldId: string
		targetActors: {
			id: string
			createdAt: string
			updatedAt: string
			name: string
			title: string
			description: string
			color: string
			worldId: string
		}[]
		mentionedActors: {
			id: string
			createdAt: string
			updatedAt: string
			name: string
			title: string
			description: string
			color: string
			worldId: string
		}[]
		introducedActors: {
			id: string
			createdAt: string
			updatedAt: string
			name: string
			title: string
			description: string
			color: string
			worldId: string
		}[]
		terminatedActors: {
			id: string
			createdAt: string
			updatedAt: string
			name: string
			title: string
			description: string
			color: string
			worldId: string
		}[]
		deltaStates: {
			id: string
			createdAt: string
			updatedAt: string
			timestamp: string
			name?: null | string
			description?: null | string
			worldEventId: string
		}[]
	}[]
}
export type GetWorldInfoApiArg = {
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
	useGetAnnouncementsQuery,
	useLazyGetAnnouncementsQuery,
	useDismissAnnouncementMutation,
	useCheckAuthenticationQuery,
	useLazyCheckAuthenticationQuery,
	useCreateAccountMutation,
	usePostLoginMutation,
	usePostLogoutMutation,
	useCreateWorldEventMutation,
	useUpdateWorldEventMutation,
	useDeleteWorldEventMutation,
	useRevokeWorldEventMutation,
	useUnrevokeWorldEventMutation,
	useCreateWorldEventDeltaMutation,
	useUpdateWorldEventDeltaMutation,
	useDeleteWorldEventDeltaMutation,
	useGetWorldsQuery,
	useLazyGetWorldsQuery,
	useCreateWorldMutation,
	useDeleteWorldMutation,
	useGetWorldInfoQuery,
	useLazyGetWorldInfoQuery,
	useGetWorldCollaboratorsQuery,
	useLazyGetWorldCollaboratorsQuery,
	useShareWorldMutation,
	useUnshareWorldMutation,
} = injectedRtkApi
