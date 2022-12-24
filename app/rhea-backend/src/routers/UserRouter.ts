import {
	BooleanValidator,
	FooBarObjectValidator,
	OptionalParam,
	Router,
	StringValidator,
	usePathParams,
	useQueryParams,
	useRequestBody,
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

router.post('/user/:userId/:username?', (ctx) => {
	usePathParams(ctx, {
		username: BooleanValidator,
		userId: StringValidator,
	})

	const query = useQueryParams(ctx, {
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

	useRequestBody(ctx, {
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
