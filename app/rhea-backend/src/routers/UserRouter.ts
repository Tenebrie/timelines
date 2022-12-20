import { useRequestParams } from '../framework/useRequestParams'
import {
	BooleanValidator,
	EmailString,
	FooBarObjectValidator,
	NonEmptyString,
	NumberValidator,
	OptionalParam,
	PathParam,
	RequiredParam,
	StringValidator,
	StringWithFiveCharactersOrMore,
	Validator,
} from '../framework/validators/Validators'
import { useRequestJsonBody } from '../framework'
import { Router } from '../framework/Router'
import { useApiEndpoint } from '../framework/useApiEndpoint'
import { useRequestQuery } from '../framework/useRequestQuery'
import { useRequestRawBody } from '@src/framework/useRequestRawBody'
import { TokenService } from '@src/services/TokenService'
import { UserService } from '@src/services/UserService'
import { UnauthorizedError } from '@src/framework/errors/HttpError'
import { User } from '@prisma/client'

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

router.post('/user/:userId?/:username?', (ctx) => {
	const params = useRequestParams(ctx, {
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

	const body = useRequestRawBody(
		ctx,
		OptionalParam<{ foo: string }>({
			rehydrate: (v) => JSON.parse(v),
		})
	)

	// const body = useRequestJsonBody(ctx, {
	// 	addDragons: BooleanValidator,
	// 	addGriffins: OptionalParam<{ foo: string }>({
	// 		rehydrate: (v) => JSON.parse(v),
	// 	}),
	// })

	// if (1 > 2) {
	// 	return {
	// 		test: false,
	// 	}
	// }

	// return {
	// 	test: true,
	// 	// addDragons: query.addDragons,
	// 	// addGriffins: query.addGriffins,
	// 	// addBloopers: query.addBloopers,
	// }
})

export const UserRouter = router
