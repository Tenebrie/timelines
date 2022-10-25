import { UserService } from '../services/UserService'
import { useRequestBody } from '../framework'
import { BadRequestError, UnauthorizedError } from '../framework/errors/HttpError'
import { TokenService } from '../services/TokenService'
import { Router } from '../framework/Router'
import { useApiDocs } from '../framework/useApiDocs'

const router = new Router()

router.post('/auth', async (ctx) => {
	useApiDocs({
		name: 'createAccount',
		summary: 'Registration endpoint',
		description: 'Creates a new user account with provided credentials',
	})

	const body = useRequestBody(ctx, {
		email: (val: string) => !!val,
		username: (val: string) => !!val,
		password: (val: string) => !!val,
	})

	const existingUser = await UserService.findByEmail(body.email)
	if (existingUser) {
		throw new BadRequestError('User already exists')
	}

	const user = await UserService.register(body.email, body.username, body.password)
	const token = TokenService.generateJwtToken(user)

	ctx.body = {
		accessToken: token,
	}

	return {
		a: 'asd',
	}
})

router.post('/auth/login', async (ctx) => {
	// useApiDocs({
	// 	name: 'postLogin',
	// 	summary: 'Login endpoint',
	// 	description: 'Exchanges user credentials for a JWT token',
	// })

	const body = useRequestBody(ctx, {
		email: (val: string) => !!val,
		password: (val: string) => !!val,
	})

	const user = await UserService.login(body.email, body.password)
	if (!user) {
		throw new UnauthorizedError('Email or password do not match')
	}

	const token = TokenService.generateJwtToken(user)

	ctx.body = {
		accessToken: token,
	}
})

router.get('/profile', async (ctx) => {
	ctx.body = {
		params: 'test',
	}
})

export const AuthRouter = router
