import {
	BooleanValidator,
	FooBarObjectValidator,
	OptionalParam,
	Router,
	StringValidator,
	useRequestJsonBody,
	useRequestParams,
	useRequestQuery,
	useRequestRawBody,
} from '../framework'

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

router.post('/user/:userId/:username?', (ctx) => {
	useRequestParams(ctx, {
		username: BooleanValidator,
		userId: StringValidator,
	})

	const query = useRequestQuery(ctx, {
		addDragons: OptionalParam(FooBarObjectValidator),
		addGriffins: OptionalParam({
			prevalidate: (v) => v === '0' || v === '1',
			rehydrate: (v) => v === '1',
			validate: (v) => v === true,
		}),
		addBloopers: OptionalParam(BooleanValidator),
	})

	useRequestRawBody(
		ctx,
		OptionalParam<{ foo: string }>({
			rehydrate: (v) => JSON.parse(v),
		})
	)

	useRequestJsonBody(ctx, {
		addDragons: BooleanValidator,
		addGriffins: OptionalParam<{ foo: string }>({
			rehydrate: (v) => JSON.parse(v),
		}),
	})

	if (1 > 2) {
		return {
			test: false,
		}
	}

	return {
		test: true,
		addDragons: query.addDragons,
		addGriffins: query.addGriffins,
		addBloopers: query.addBloopers,
	}
})

export const UserRouter = router
