import { baseApi as api } from './baseApi'
const injectedRtkApi = api.injectEndpoints({
	endpoints: (build) => ({
		appControllerGetHello: build.query<AppControllerGetHelloApiResponse, AppControllerGetHelloApiArg>({
			query: () => ({ url: `/` }),
		}),
		appControllerGetTestData: build.query<
			AppControllerGetTestDataApiResponse,
			AppControllerGetTestDataApiArg
		>({
			query: () => ({ url: `/test/data` }),
		}),
		userControllerGetUser: build.query<UserControllerGetUserApiResponse, UserControllerGetUserApiArg>({
			query: () => ({ url: `/user` }),
		}),
		userControllerGetTestData: build.query<
			UserControllerGetTestDataApiResponse,
			UserControllerGetTestDataApiArg
		>({
			query: (queryArg) => ({ url: `/user/${queryArg.id}` }),
		}),
	}),
	overrideExisting: false,
})
export { injectedRtkApi as rheaApi }
export type AppControllerGetHelloApiResponse = unknown
export type AppControllerGetHelloApiArg = void
export type AppControllerGetTestDataApiResponse = unknown
export type AppControllerGetTestDataApiArg = void
export type UserControllerGetUserApiResponse = unknown
export type UserControllerGetUserApiArg = void
export type UserControllerGetTestDataApiResponse = /** status 200  */ Cat
export type UserControllerGetTestDataApiArg = {
	id: number
}
export type Cat = {
	age: number
	breed: string
}
export const {
	useAppControllerGetHelloQuery,
	useLazyAppControllerGetHelloQuery,
	useAppControllerGetTestDataQuery,
	useLazyAppControllerGetTestDataQuery,
	useUserControllerGetUserQuery,
	useLazyUserControllerGetUserQuery,
	useUserControllerGetTestDataQuery,
	useLazyUserControllerGetTestDataQuery,
} = injectedRtkApi
