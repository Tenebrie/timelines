import { useRequestParams } from '../framework/useRequestParams'
import {
	BooleanValidator,
	FooBarObjectValidator,
	NonEmptyString,
	NumberValidator,
	OptionalParam,
	RequestParam,
	RequiredParam,
	StringValidator,
	StringWithFiveCharactersOrMore,
	Validator,
} from '../framework/validators/Validators'
import { useRequestJsonBody } from '../framework'
import { Router } from '../framework/Router'
import * as KoaRouter from '@koa/router'
import { useApiEndpoint } from '../framework/useApiEndpoint'
import { useRequestQuery } from '../framework/useRequestQuery'
import { useRequestTextBody } from '@src/framework/useRequestTextBody'

export const myKoaRouter = new KoaRouter()

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
		addDragons: OptionalParam({
			prevalidate: (v) => v === '0' || v === '1',
			rehydrate: (v) => v === '1',
		}),
		addGriffins: {
			prevalidate: (v) => v === '0' || v === '1',
			rehydrate: (v) => v === '1',
			validate: (v) => v === true,
			optional: true,
		},
		addBloopers: OptionalParam(BooleanValidator),
	})

	const otherbody = useRequestTextBody(
		ctx,
		RequiredParam({
			rehydrate: (v) => JSON.parse(v) as { foo: string; bar: string },
			validate: (v) => !!v.foo && !!v.bar,
		})
	)
	otherbody

	return {
		addDragons: query.addDragons,
		addGriffins: query.addGriffins,
		addBloopers: query.addBloopers,
		isYes: otherbody,
	}
})

export const UserRouter = router
