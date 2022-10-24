import { baseApi as api } from './baseApi'
const injectedRtkApi = api.injectEndpoints({
	endpoints: (build) => ({
		postAuth: build.mutation<PostAuthApiResponse, PostAuthApiArg>({
			query: (queryArg) => ({ url: `/auth`, method: 'POST', body: queryArg.body }),
		}),
		postAuthLogin: build.mutation<PostAuthLoginApiResponse, PostAuthLoginApiArg>({
			query: (queryArg) => ({ url: `/auth/login`, method: 'POST', body: queryArg.body }),
		}),
		getAuthByUsernameAndBadpassword: build.query<
			GetAuthByUsernameAndBadpasswordApiResponse,
			GetAuthByUsernameAndBadpasswordApiArg
		>({
			query: (queryArg) => ({ url: `/auth/${queryArg.username}/${queryArg.badpassword}` }),
		}),
	}),
	overrideExisting: false,
})
export { injectedRtkApi as rheaApi }
export type PostAuthApiResponse = unknown
export type PostAuthApiArg = {
	body: {
		email?: string
		username?: string
		password?: string
	}
}
export type PostAuthLoginApiResponse = unknown
export type PostAuthLoginApiArg = {
	body: {
		email?: string
		password?: string
	}
}
export type GetAuthByUsernameAndBadpasswordApiResponse = unknown
export type GetAuthByUsernameAndBadpasswordApiArg = {
	username: Username
	badpassword: Badpassword
}
export type Username = string
export type Badpassword = {
	a?: number
}
export const {
	usePostAuthMutation,
	usePostAuthLoginMutation,
	useGetAuthByUsernameAndBadpasswordQuery,
	useLazyGetAuthByUsernameAndBadpasswordQuery,
} = injectedRtkApi
