import { ParameterizedContext } from 'koa'

import { ValidationError } from '../framework/errors/HttpError'

type ValidatedData<T extends Record<string, (val: any) => boolean>> = {
	[K in keyof T]: Parameters<T[K]>[0]
}

export const useRequestBody = <T extends Record<string, (val: any) => boolean>>(
	ctx: ParameterizedContext,
	validators: T
): ValidatedData<T> => {
	const body = ctx.request.body
	const expectedParams = Object.keys(validators)

	const missingParams = expectedParams.filter((param) => !body || body[param] === undefined)
	if (missingParams.length > 0) {
		throw new ValidationError(`Missing body params: ${missingParams.map((param) => `'${param}'`).join(', ')}`)
	}

	const returnValue = {}
	expectedParams.forEach((param) => {
		returnValue[param] = body[param]
	})

	return returnValue as ValidatedData<T>
}
