import {
	BooleanValidator,
	FooBarObjectValidator,
	OptionalParam,
	RequiredParam,
	Router,
	StringValidator,
	usePathParams,
	useQueryParams,
	useRequestBody,
	useRequestHeaders,
	useRequestRawBody,
} from 'tenebrie-framework'

const router = new Router()

// router.post('/users', (ctx) => {
// 	useApiEndpoint({
// 		name: 'createUser',
// 		description: 'Creates a user',
// 		summary: 'Short summary',
// 	})

// 	const body = useRequestBody(ctx, {
// 		email: NonEmptyString,
// 		username: NonEmptyString,
// 		password: NonEmptyString,
// 	})

// 	body.password

// 	return body
// })

router.get('/test', (ctx) => {
	useRequestHeaders(ctx, {
		Authorization: RequiredParam({
			rehydrate: (v) => v,
		}),
	})
})

export const UserRouter = router
