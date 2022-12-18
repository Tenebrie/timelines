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
import { useRequestBody } from '../framework'
import { Router } from '../framework/Router'
import * as KoaRouter from '@koa/router'
import { useApiEndpoint } from '../framework/useApiEndpoint'
import { useRequestQuery } from '../framework/useRequestQuery'

export const myKoaRouter = new KoaRouter()

const router = new Router()

const myFunction = (a: number) => {
	return a + 2
}

myFunction(7)

router.get('/cards/:cardName', (ctx) => {
	const params = useRequestParams(ctx, {
		cardName: NumberValidator,
	})

	if (params.cardName === undefined) {
		Math.pow(1, 2)
	} else {
		Math.pow(params.cardName, 2)
	}

	return {
		value: '123',
		cardName: params.cardName,
	}
})

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

router.get('/user/:userId/:username', (ctx) => {
	const params = useRequestParams(ctx, {
		username: BooleanValidator,
		userId: StringValidator,
	})

	params.userId

	const query = useRequestQuery(ctx, {
		addDragons: RequiredParam({
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

	return {
		addDragons: 'q',
	}
})

export const UserRouter = router
