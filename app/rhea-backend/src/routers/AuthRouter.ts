import { AUTH_COOKIE_NAME, UserAuthenticator } from '@src/auth/UserAuthenticator'
import {
	BadRequestError,
	EmailValidator,
	NonEmptyStringValidator,
	Router,
	UnauthorizedError,
	useApiEndpoint,
	useOptionalAuth,
	useRequestBody,
} from 'tenebrie-framework'

import { TokenService } from '../services/TokenService'
import { UserService } from '../services/UserService'

const router = new Router()

const authTag = 'auth'

router.get('/auth', async (ctx) => {
	useApiEndpoint({
		name: 'checkAuthentication',
		description: 'Checks if the user has a valid login credentials',
		tags: [authTag],
	})

	const user = await useOptionalAuth(ctx, UserAuthenticator)

	return {
		authenticated: !!user,
	}
})

router.post('/auth', async (ctx) => {
	useApiEndpoint({
		name: 'createAccount',
		summary: 'Registration endpoint',
		description: 'Creates a new user account with provided credentials',
		tags: [authTag],
	})

	const body = useRequestBody(ctx, {
		email: EmailValidator,
		username: NonEmptyStringValidator,
		password: NonEmptyStringValidator,
	})

	const existingUser = await UserService.findByEmail(body.email)
	if (existingUser) {
		throw new BadRequestError('User already exists')
	}

	const user = await UserService.register(body.email, body.username, body.password)
	const token = TokenService.generateJwtToken(user)

	ctx.cookies.set(AUTH_COOKIE_NAME, token, {
		path: '/',
		expires: new Date(new Date().getTime() + 365 * 24 * 3600 * 1000),
	})
})

router.post('/auth/login', async (ctx) => {
	useApiEndpoint({
		name: 'postLogin',
		summary: 'Login endpoint',
		description: 'Exchanges user credentials for a JWT token',
		tags: [authTag],
	})

	const body = useRequestBody(ctx, {
		email: EmailValidator,
		password: NonEmptyStringValidator,
	})

	const user = await UserService.login(body.email, body.password)
	if (!user) {
		throw new UnauthorizedError('Email or password do not match')
	}

	const token = TokenService.generateJwtToken(user)

	ctx.cookies.set(AUTH_COOKIE_NAME, token, {
		path: '/',
		expires: new Date(new Date().getTime() + 365 * 24 * 3600 * 1000),
	})
})

export const AuthRouter = router
