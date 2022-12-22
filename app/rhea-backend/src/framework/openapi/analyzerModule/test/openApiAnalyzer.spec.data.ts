import { useApiEndpoint } from '../../../hooks/useApiEndpoint'
import {
	useRequestObjectBody,
	useRequestJsonBody,
	useRequestFormBody,
} from '../../../hooks/useRequestObjectBody'
import { useRequestParams } from '../../../hooks/useRequestParams'
import { useRequestQuery } from '../../../hooks/useRequestQuery'
import { useRequestRawBody } from '../../../hooks/useRequestRawBody'
import { Router } from '../../../router/Router'
import { StringValidator, BooleanValidator, NumberValidator } from '../../../validators/BuiltInValidators'
import { PathParam, RequiredParam, OptionalParam } from '../../../validators/ParamWrappers'

const router = new Router()

router.get('/test/908c3e74-cf67-4ec7-a281-66a79f95d44d', () => {
	useApiEndpoint({
		name: 'Test endpoint name',
		summary: 'Test endpoint summary',
		description: 'Test endpoint description',
	})
})

router.get('/test/bf6147f2-a1dc-4cc2-8327-e6f041f828bf/:firstParam/:secondParam/:optionalParam?', (ctx) => {
	useRequestParams(ctx, {
		firstParam: PathParam({
			rehydrate: (v) => v,
		}),
		secondParam: PathParam({
			rehydrate: (v) => v === '1',
		}),
		optionalParam: PathParam({
			rehydrate: (v) => Number(v),
		}),
	})
})

router.get('/test/ef25ef5e-0f8f-4732-bf59-8825f94a5287/:firstParam/:secondParam/:optionalParam?', (ctx) => {
	useRequestParams(ctx, {
		firstParam: StringValidator,
		secondParam: PathParam(BooleanValidator),
		optionalParam: NumberValidator,
	})
})

router.get('/test/5ab5dd0d-b241-4378-bea1-a2dd696d699a/:firstParam/:secondParam', (ctx) => {
	useRequestParams(ctx, {
		firstParam: PathParam({
			rehydrate: (v) => JSON.parse(v) as { foo: string; bar: string },
		}),
		secondParam: PathParam<{ foo: string; bar: string }>({
			rehydrate: (v) => JSON.parse(v),
		}),
	})
})

router.get('/test/209df2a1-55f9-4859-bc31-3277547c7d88/:firstParam/:secondParam', (ctx) => {
	useRequestParams(ctx, {
		firstParam: PathParam({
			rehydrate: (v) => JSON.parse(v) as { foo?: string },
		}),
		secondParam: PathParam<{ foo: string | undefined }>({
			rehydrate: (v) => JSON.parse(v),
		}),
	})
})

router.get('/test/89d961f1-7d36-4271-8bd3-665ee0992590/:firstParam/:secondParam', (ctx) => {
	useRequestParams(ctx, {
		firstParam: PathParam({
			rehydrate: (v) => JSON.parse(v) as { foo: string | number },
		}),
		secondParam: PathParam<{ foo: string | number }>({
			rehydrate: (v) => JSON.parse(v),
		}),
	})
})

router.get('/test/f89310d9-25ac-4005-93e4-614179d3bbd4', (ctx) => {
	useRequestQuery(ctx, {
		firstParam: RequiredParam({
			rehydrate: (v) => v,
		}),
		secondParam: OptionalParam({
			rehydrate: (v) => v === '1',
		}),
		thirdParam: OptionalParam({
			rehydrate: (v) => Number(v),
		}),
	})
})

router.get('/test/6040cd01-a0c6-4b70-9901-b647f19b19a7', (ctx) => {
	useRequestRawBody(
		ctx,
		RequiredParam<{ foo: string; bar?: number }>({
			rehydrate: (v) => JSON.parse(v),
		})
	)
})

router.get('/test/f3754325-6d9c-42b6-becf-4a9e72bd2c4e', (ctx) => {
	useRequestRawBody(
		ctx,
		RequiredParam({
			rehydrate: (v) => JSON.parse(v) as { foo: string; bar?: number },
		})
	)
})

router.get('/test/1ab973ff-9937-4e2d-b432-ff43a9df42cb', (ctx) => {
	useRequestRawBody(
		ctx,
		OptionalParam({
			rehydrate: (v) => JSON.parse(v) as { foo: string; bar?: number },
		})
	)
})

router.get('/test/f74f6003-2aba-4f8c-855e-c0149f4217b7', (ctx) => {
	useRequestRawBody(ctx, OptionalParam(BooleanValidator))
})

router.get('/test/e8e5496b-11a0-41e3-a68d-f03d524e413c', (ctx) => {
	useRequestObjectBody(ctx, {
		firstParam: RequiredParam({
			rehydrate: (v) => v,
		}),
		secondParam: OptionalParam({
			rehydrate: (v) => v === '1',
		}),
		thirdParam: OptionalParam({
			rehydrate: (v) => Number(v),
		}),
	})
})

router.get('/test/7268be93-ce90-44b1-9a2f-8b286d7aae67', (ctx) => {
	useRequestJsonBody(ctx, {
		firstParam: RequiredParam({
			rehydrate: (v) => v,
		}),
		secondParam: OptionalParam({
			rehydrate: (v) => v === '1',
		}),
		thirdParam: OptionalParam({
			rehydrate: (v) => Number(v),
		}),
	})
})

router.get('/test/185c6075-a0f4-4607-af81-b51923f5866f', (ctx) => {
	useRequestFormBody(ctx, {
		firstParam: RequiredParam({
			rehydrate: (v) => v,
		}),
		secondParam: OptionalParam({
			rehydrate: (v) => v === '1',
		}),
		thirdParam: OptionalParam({
			rehydrate: (v) => Number(v),
		}),
	})
})

router.get('/test/e1bedf55-6d3a-4c01-9c66-6ec74cc66c3b', () => {
	return 'Hello world'
})

router.get('/test/78ad5fba-f4e2-4924-b28a-23e39dd146f7', () => {
	const random = Math.random()
	if (random < 0.33) {
		return 100
	} else if (random < 0.67) {
		return true
	} else {
		return 'Hello world'
	}
})

router.get('/test/c542cb10-538c-44eb-8d13-5111e273ead0', () => {
	return {
		foo: 'test',
		bar: 12,
	}
})

router.get('/test/03888127-6b97-42df-b429-87a6588ab2a4', () => {
	return {} as {
		foo: string | undefined
		bar?: number
	}
})

router.get('/test/b73347dc-c16f-4272-95b4-bf1716bf9c14', () => {
	return {
		foo: 123,
	} as {
		foo: string | number | boolean
	}
})

router.get('/test/666b9ed1-62db-447a-80a7-8f35ec50ab02', async () => {
	return {
		foo: 123,
	}
})

router.get('/test/97bb5db8-1871-4c1d-998e-a724c04c5741', (ctx) => {
	const query = useRequestQuery(ctx, {
		firstParam: RequiredParam({
			rehydrate: (v) => v,
		}),
		secondParam: OptionalParam({
			rehydrate: (v) => v === '1',
		}),
		thirdParam: OptionalParam({
			rehydrate: (v) => Number(v),
		}),
	})

	return {
		foo: query.firstParam,
		bar: query.secondParam,
		baz: query.thirdParam,
	}
})

router.get('/test/4188ebf2-eae6-4994-8732-c7f43d4da861', (ctx) => {
	const query = useRequestQuery(ctx, {
		firstParam: RequiredParam({
			rehydrate: (v) => v,
		}),
		secondParam: OptionalParam({
			rehydrate: (v) => v === '1',
		}),
		thirdParam: OptionalParam({
			rehydrate: (v) => Number(v),
		}),
	})

	if (Math.random() > 0.5) {
		return {
			test: 'value',
		}
	}

	return {
		foo: query.firstParam,
		bar: query.secondParam,
		baz: query.thirdParam,
	}
})

router.get('/test/32f18a25-2408-46cf-9519-f9a8d855bf84', () => {
	return {} as Record<string, any>
})

router.get('/test/196f2937-e369-435f-b239-62eaacaa6fbd', () => {
	/* Empty */
})
