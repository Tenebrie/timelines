import { UserService } from '../services/UserService'
import { useRequestBody } from '../framework'
import { BadRequestError, UnauthorizedError, ValidationError } from '../framework/errors/HttpError'
import { TokenService } from '../services/TokenService'
import { Router } from '../framework/Router'
import { useApiDocs } from '../framework/useApiDocs'
import { NonEmptyString } from '../framework/validators/Validators'

const router = new Router()

router.post('/auth', async (ctx) => {
	useApiDocs({
		name: 'createAccount',
		summary: 'Registration endpoint',
		description: 'Creates a new user account with provided credentials',
	})

	const body = useRequestBody(ctx, {
		email: NonEmptyString,
		username: NonEmptyString,
		password: NonEmptyString,
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
	useApiDocs({
		name: 'postLogin',
		summary: 'Login endpoint',
		description: 'Exchanges user credentials for a JWT token',
	})
	const body = useRequestBody(ctx, {
		email: NonEmptyString,
		password: NonEmptyString,
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

	throw new ValidationError('Message')

	if (Math.random() <= 0.5) {
		return {
			myVal: 121,
		}
	}

	return {
		myVal: '12121',
	}
})

export const AuthRouter = router
