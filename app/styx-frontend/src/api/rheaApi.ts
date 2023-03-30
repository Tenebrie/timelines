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
			issueWorldStatement: build.mutation<IssueWorldStatementApiResponse, IssueWorldStatementApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/statement/issue`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['world'],
			}),
			revokeWorldStatement: build.mutation<RevokeWorldStatementApiResponse, RevokeWorldStatementApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/statement/revoke`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['world'],
			}),
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
export type GetWorldsApiResponse = /** status 200  */ World[]
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
export type GetWorldInfoApiResponse = /** status 200  */ World
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
		type: WorldEventType
		timestamp: number
	}
}
export type IssueWorldStatementApiResponse = /** status 200  */ {
	id: string
}
export type IssueWorldStatementApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	body: {
		title: string
	}
}
export type RevokeWorldStatementApiResponse = /** status 200  */ WorldStatement
export type RevokeWorldStatementApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	body: {
		statementId: string
	}
}
export type World = {
	id: string
	name: string
	ownerId: string
}
export type WorldEventType = 'SCENE' | 'OTHER'
export type WorldStatement = {
	id: string
	title: string
	text: string
	issuedByEventId?: string
	revokedByEventId?: string
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
	useIssueWorldStatementMutation,
	useRevokeWorldStatementMutation,
} = injectedRtkApi
