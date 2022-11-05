import { useRequestParams } from '../framework/useRequestParams'
import { NonEmptyString } from '../framework/validators/Validators'
import { useRequestBody } from '../framework'
import { Router } from '../framework/Router'
import { useApiEndpoint } from '../framework/useApiEndpoint'

const router = new Router()

router.post('/users', (ctx) => {
	useApiEndpoint({
		name: 'createUser',
		description: 'Creates a user',
		summary: 'Short summary',
	})

	const body = useRequestBody(ctx, {
		email: NonEmptyString,
		username: NonEmptyString,
		password: NonEmptyString,
	})

	return body
})

router.get('/user/:userId', (ctx) => {
	const params = useRequestParams(ctx, {
		userId: NonEmptyString,
	})

	return {
		username: 'test',
	}
})

export const UserRouter = router
