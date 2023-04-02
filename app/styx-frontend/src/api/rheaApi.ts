import { baseApi as api } from './baseApi'
export const addTagTypes = ['auth', 'world'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			checkAuthentication: build.query<CheckAuthenticationApiResponse, CheckAuthenticationApiArg>({
				query: () => ({ url: `/api/auth` }),
				providesTags: ['auth'],
			}),
			createAccount: build.mutation<CreateAccountApiResponse, CreateAccountApiArg>({
				query: (queryArg) => ({ url: `/api/auth`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['auth'],
			}),
			postLogin: build.mutation<PostLoginApiResponse, PostLoginApiArg>({
				query: (queryArg) => ({ url: `/api/auth/login`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['auth'],
			}),
			postLogout: build.mutation<PostLogoutApiResponse, PostLogoutApiArg>({
				query: (queryArg) => ({ url: `/api/auth/logout`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['auth'],
			}),
			getWorlds: build.query<GetWorldsApiResponse, GetWorldsApiArg>({
				query: () => ({ url: `/api/worlds` }),
				providesTags: ['world'],
			}),
			createWorld: build.mutation<CreateWorldApiResponse, CreateWorldApiArg>({
				query: (queryArg) => ({ url: `/api/world`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['world'],
			}),
			getWorldInfo: build.query<GetWorldInfoApiResponse, GetWorldInfoApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}` }),
				providesTags: ['world'],
			}),
			deleteWorld: build.mutation<DeleteWorldApiResponse, DeleteWorldApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}`, method: 'DELETE' }),
				invalidatesTags: ['world'],
			}),
			createWorldEvent: build.mutation<CreateWorldEventApiResponse, CreateWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['world'],
			}),
			updateWorldEvent: build.mutation<UpdateWorldEventApiResponse, UpdateWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['world'],
			}),
			deleteWorldEvent: build.mutation<DeleteWorldEventApiResponse, DeleteWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['world'],
			}),
			issueWorldStatement: build.mutation<IssueWorldStatementApiResponse, IssueWorldStatementApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/statement`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['world'],
			}),
			deleteWorldStatement: build.mutation<DeleteWorldStatementApiResponse, DeleteWorldStatementApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/statement/${queryArg.statementId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['world'],
			}),
			revokeWorldStatement: build.mutation<RevokeWorldStatementApiResponse, RevokeWorldStatementApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/statement/${queryArg.statementId}/revoke`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['world'],
			}),
			unrevokeWorldStatement: build.mutation<UnrevokeWorldStatementApiResponse, UnrevokeWorldStatementApiArg>(
				{
					query: (queryArg) => ({
						url: `/api/world/${queryArg.worldId}/statement/${queryArg.statementId}/unrevoke`,
						method: 'POST',
						body: queryArg.body,
					}),
					invalidatesTags: ['world'],
				}
			),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as rheaApi }
export type CheckAuthenticationApiResponse = /** status 200  */ {
	authenticated: boolean
}
export type CheckAuthenticationApiArg = void
export type CreateAccountApiResponse = unknown
export type CreateAccountApiArg = {
	body: {
		email: string
		username: string
		password: string
	}
}
export type PostLoginApiResponse = unknown
export type PostLoginApiArg = {
	body: {
		email: string
		password: string
	}
}
export type PostLogoutApiResponse = unknown
export type PostLogoutApiArg = {
	body: string
}
export type GetWorldsApiResponse = /** status 200  */ {
	id: string
	name: string
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
	}
}
export type GetWorldInfoApiResponse = /** status 200  */ {
	id: string
	name: string
	ownerId: string
	events: {
		id: string
		type: 'SCENE' | 'OTHER'
		name: string
		timestamp: number
		description: string
		worldId: string
		issuedStatements: {
			id: string
			title: string
			text: string
			issuedByEventId?: string
			revokedByEventId?: string
		}[]
		revokedStatements: {
			id: string
			title: string
			text: string
			issuedByEventId?: string
			revokedByEventId?: string
		}[]
	}[]
}
export type GetWorldInfoApiArg = {
	/** Any string value */
	worldId: string
}
export type DeleteWorldApiResponse = unknown
export type DeleteWorldApiArg = {
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
		timestamp: number
	}
}
export type UpdateWorldEventApiResponse = /** status 200  */ {
	id: string
	type: 'SCENE' | 'OTHER'
	name: string
	timestamp: number
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
		timestamp?: number
		description?: string
	}
}
export type DeleteWorldEventApiResponse = /** status 200  */ {
	id: string
	type: 'SCENE' | 'OTHER'
	name: string
	timestamp: number
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
export type DeleteWorldStatementApiResponse = /** status 200  */ {
	id: string
	title: string
	text: string
	issuedByEventId?: string
	revokedByEventId?: string
}
export type DeleteWorldStatementApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	statementId: string
}
export type RevokeWorldStatementApiResponse = /** status 200  */ {
	id: string
	title: string
	text: string
	issuedByEventId?: string
	revokedByEventId?: string
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
	title: string
	text: string
	issuedByEventId?: string
	revokedByEventId?: string
}
export type UnrevokeWorldStatementApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	statementId: string
	body: string
}
export const {
	useCheckAuthenticationQuery,
	useLazyCheckAuthenticationQuery,
	useCreateAccountMutation,
	usePostLoginMutation,
	usePostLogoutMutation,
	useGetWorldsQuery,
	useLazyGetWorldsQuery,
	useCreateWorldMutation,
	useGetWorldInfoQuery,
	useLazyGetWorldInfoQuery,
	useDeleteWorldMutation,
	useCreateWorldEventMutation,
	useUpdateWorldEventMutation,
	useDeleteWorldEventMutation,
	useIssueWorldStatementMutation,
	useDeleteWorldStatementMutation,
	useRevokeWorldStatementMutation,
	useUnrevokeWorldStatementMutation,
} = injectedRtkApi
