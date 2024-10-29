import { AUTH_COOKIE_NAME, UserAuthenticator } from '@src/auth/UserAuthenticator'
import { AnnouncementService } from '@src/services/AnnouncementService'
import {
	BadRequestError,
	EmailValidator,
	NonEmptyStringValidator,
	Router,
	UnauthorizedError,
	useApiEndpoint,
	useOptionalAuth,
	useRequestBody,
} from 'moonflower'

import { TokenService } from '../services/TokenService'
import { UserService } from '../services/UserService'
import { adminUsersTag } from './AdminRouter'
import { announcementListTag } from './AnnouncementRouter'
import { worldDetailsTag, worldListTag } from './WorldRouter'

const router = new Router()

export const authTag = 'auth'

router.get('/api/auth', async (ctx) => {
	useApiEndpoint({
		name: 'checkAuthentication',
		description: 'Checks if the user has a valid login credentials',
		tags: [authTag],
	})

	const user = await useOptionalAuth(ctx, UserAuthenticator)

	if (!user) {
		return {
			authenticated: false,
		}
	}

	UserService.touchUser(user.id)

	return {
		authenticated: true,
		user: {
			id: user.id,
			email: user.email,
			username: user.username,
			level: user.level,
		},
	}
})

router.post('/api/auth', async (ctx) => {
	useApiEndpoint({
		name: 'createAccount',
		summary: 'Registration endpoint',
		description: 'Creates a new user account with provided credentials',
		tags: [authTag, worldListTag, worldDetailsTag, announcementListTag],
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

	AnnouncementService.notify({
		type: 'Welcome',
		userId: user.id,
		title: 'Welcome!',
		description: 'Welcome to Timelines!',
	})

	return user
})

router.post('/api/auth/login', async (ctx) => {
	useApiEndpoint({
		name: 'postLogin',
		summary: 'Login endpoint',
		description: 'Exchanges user credentials for a JWT token',
		tags: [authTag, worldListTag, worldDetailsTag, announcementListTag, adminUsersTag],
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

	return user
})

router.post('/api/auth/logout', async (ctx) => {
	useApiEndpoint({
		name: 'postLogout',
		summary: 'Logout endpoint',
		description: "Clears the current user's auth cookie",
		tags: [authTag, worldListTag, worldDetailsTag, announcementListTag],
	})

	ctx.cookies.set(AUTH_COOKIE_NAME, '', {
		path: '/',
		expires: new Date(),
	})
})

export const AuthRouter = router
