import { useRequestParams } from '../framework/useRequestParams'
import { NonEmptyString, StringWithFiveCharactersOrMore } from '../framework/validators/Validators'
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

	body.password

	return body
})

const Validator = (left: any, right: (v: string) => any) => {
	return right(left)
}

router.get('/user/:userId/:username?', (ctx) => {
	const params = useRequestParams(ctx, {
		userId: StringWithFiveCharactersOrMore,
		username: (val: { foo: string; bar: string }) =>
			Validator(val, (v) => 'foo' in JSON.parse(v) && 'bar' in JSON.parse(v)),
	})

	params.userId
	params.username

	params.username

	return {
		userId: params.userId,
		username: params.username ?? 'Undefined',
	}
})

export const UserRouter = router
