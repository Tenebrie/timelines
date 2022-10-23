import * as Router from '@koa/router'
import { UserService } from '../services/UserService'
import { useRequestBody } from '../framework'
import { BadRequestError, UnauthorizedError } from '../framework/errors/HttpError'
import { TokenService } from '../services/TokenService'

const router = new Router()

router.post('/auth', async (ctx) => {
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
})

router.post('/auth/login', async (ctx) => {
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

export const AuthRouter = router
