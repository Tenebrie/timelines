import { baseApi as api } from './baseApi'
export const addTagTypes = ['worldDetails', 'auth', 'worldList'] as const
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
			checkAuthentication: build.query<CheckAuthenticationApiResponse, CheckAuthenticationApiArg>({
				query: () => ({ url: `/api/auth` }),
				providesTags: ['auth'],
			}),
			createAccount: build.mutation<CreateAccountApiResponse, CreateAccountApiArg>({
				query: (queryArg) => ({ url: `/api/auth`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails'],
			}),
			postLogin: build.mutation<PostLoginApiResponse, PostLoginApiArg>({
				query: (queryArg) => ({ url: `/api/auth/login`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails'],
			}),
			postLogout: build.mutation<PostLogoutApiResponse, PostLogoutApiArg>({
				query: () => ({ url: `/api/auth/logout`, method: 'POST' }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails'],
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
			issueWorldStatement: build.mutation<IssueWorldStatementApiResponse, IssueWorldStatementApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/statement`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
			updateWorldStatement: build.mutation<UpdateWorldStatementApiResponse, UpdateWorldStatementApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/statement/${queryArg.statementId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
			deleteWorldStatement: build.mutation<DeleteWorldStatementApiResponse, DeleteWorldStatementApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/statement/${queryArg.statementId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldDetails'],
			}),
			revokeWorldStatement: build.mutation<RevokeWorldStatementApiResponse, RevokeWorldStatementApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/statement/${queryArg.statementId}/revoke`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
			unrevokeWorldStatement: build.mutation<UnrevokeWorldStatementApiResponse, UnrevokeWorldStatementApiArg>(
				{
					query: (queryArg) => ({
						url: `/api/world/${queryArg.worldId}/statement/${queryArg.statementId}/unrevoke`,
						method: 'POST',
					}),
					invalidatesTags: ['worldDetails'],
				}
			),
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
	worldId: string
}
export type DeleteActorApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
}
export type CheckAuthenticationApiResponse =
	/** status 200  */
	| {
			authenticated: boolean
			user: {
				id: string
				email: string
				username: string
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
}
export type PostLoginApiArg = {
	body: {
		email: string
		password: string
	}
}
export type PostLogoutApiResponse = unknown
export type PostLogoutApiArg = void
export type GetWorldsApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	name: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD'
	timeOrigin: string
	ownerId: string
}[]
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
		description: string
		worldId: string
		issuedStatements: {
			id: string
			createdAt: string
			updatedAt: string
			title: string
			text: string
			issuedByEventId: string
			revokedByEventId?: string
			replacedStatementId?: string
			replacedByStatementId?: string
		}[]
		revokedStatements: {
			id: string
			createdAt: string
			updatedAt: string
			title: string
			text: string
			issuedByEventId: string
			revokedByEventId?: string
			replacedStatementId?: string
			replacedByStatementId?: string
		}[]
	}[]
}
export type GetWorldInfoApiArg = {
	/** Any string value */
	worldId: string
}
export type CreateWorldEventApiResponse = /** status 200  */ {
	id: string
}
export type CreateWorldEventApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
		type: 'SCENE' | 'OTHER'
		timestamp: any
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
	description: string
	worldId: string
}
export type UpdateWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	body: {
		name?: string
		icon?: string
		timestamp?: any
		description?: string
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
	description: string
	worldId: string
}
export type DeleteWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
}
export type IssueWorldStatementApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	title: string
	text: string
	issuedByEventId: string
	revokedByEventId?: string
	replacedStatementId?: string
	replacedByStatementId?: string
}
export type IssueWorldStatementApiArg = {
	/** Any string value */
	worldId: string
	body: {
		eventId: string
		title: string
		content?: string
	}
}
export type UpdateWorldStatementApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	title: string
	text: string
	issuedByEventId: string
	revokedByEventId?: string
	replacedStatementId?: string
	replacedByStatementId?: string
}
export type UpdateWorldStatementApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	statementId: string
	body: {
		title?: string
		text?: string
	}
}
export type DeleteWorldStatementApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	title: string
	text: string
	issuedByEventId: string
	revokedByEventId?: string
	replacedStatementId?: string
	replacedByStatementId?: string
}
export type DeleteWorldStatementApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	statementId: string
}
export type RevokeWorldStatementApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	title: string
	text: string
	issuedByEventId: string
	revokedByEventId?: string
	replacedStatementId?: string
	replacedByStatementId?: string
}
export type RevokeWorldStatementApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	statementId: string
	body: {
		eventId: string
	}
}
export type UnrevokeWorldStatementApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	title: string
	text: string
	issuedByEventId: string
	revokedByEventId?: string
	replacedStatementId?: string
	replacedByStatementId?: string
}
export type UnrevokeWorldStatementApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	statementId: string
}
export const {
	useCreateActorMutation,
	useUpdateActorMutation,
	useDeleteActorMutation,
	useCheckAuthenticationQuery,
	useLazyCheckAuthenticationQuery,
	useCreateAccountMutation,
	usePostLoginMutation,
	usePostLogoutMutation,
	useGetWorldsQuery,
	useLazyGetWorldsQuery,
	useCreateWorldMutation,
	useDeleteWorldMutation,
	useGetWorldInfoQuery,
	useLazyGetWorldInfoQuery,
	useCreateWorldEventMutation,
	useUpdateWorldEventMutation,
	useDeleteWorldEventMutation,
	useIssueWorldStatementMutation,
	useUpdateWorldStatementMutation,
	useDeleteWorldStatementMutation,
	useRevokeWorldStatementMutation,
	useUnrevokeWorldStatementMutation,
} = injectedRtkApi
