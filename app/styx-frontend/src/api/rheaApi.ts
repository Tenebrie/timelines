import { baseApi as api } from './baseApi'
const injectedRtkApi = api.injectEndpoints({
	endpoints: (build) => ({
		authControllerRegister: build.mutation<AuthControllerRegisterApiResponse, AuthControllerRegisterApiArg>({
			query: (queryArg) => ({ url: `/auth`, method: 'POST', body: queryArg.registerDto }),
		}),
		authControllerLogin: build.mutation<AuthControllerLoginApiResponse, AuthControllerLoginApiArg>({
			query: (queryArg) => ({ url: `/auth/login`, method: 'POST', body: queryArg.loginDto }),
		}),
		userControllerGetProfile: build.query<
			UserControllerGetProfileApiResponse,
			UserControllerGetProfileApiArg
		>({
			query: () => ({ url: `/user/profile` }),
		}),
	}),
	overrideExisting: false,
})
export { injectedRtkApi as rheaApi }
export type AuthControllerRegisterApiResponse = /** status 201  */ AccessTokenDto
export type AuthControllerRegisterApiArg = {
	registerDto: RegisterDto
}
export type AuthControllerLoginApiResponse = /** status 201  */ AccessTokenDto
export type AuthControllerLoginApiArg = {
	loginDto: LoginDto
}
export type UserControllerGetProfileApiResponse = unknown
export type UserControllerGetProfileApiArg = void
export type AccessTokenDto = {
	accessToken: string
}
export type RegisterDto = {
	email: string
	username: string
	password: string
}
export type LoginDto = {
	email: string
	password: string
}
export const {
	useAuthControllerRegisterMutation,
	useAuthControllerLoginMutation,
	useUserControllerGetProfileQuery,
	useLazyUserControllerGetProfileQuery,
} = injectedRtkApi
