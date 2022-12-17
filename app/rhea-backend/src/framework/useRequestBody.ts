/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ParameterizedContext } from 'koa'

import { ValidationError } from '../framework/errors/HttpError'

type ValidatedData<T extends Record<string, (val: any) => any>> = {
	[K in keyof T]: Parameters<T[K]>[0]
}

export const useRequestBody = <
	ValidatorsT extends Record<string, ((val: any) => any) | ((val?: any) => any)>
>(
	ctx: ParameterizedContext,
	validators: ValidatorsT
): ValidatedData<ValidatorsT> => {
	const body = ctx.request.body
	const expectedParams = Object.keys(validators)

	const missingParams = expectedParams.filter((param) => !body || body[param] === undefined)

	if (missingParams.length > 0) {
		throw new ValidationError(`Missing body params: ${missingParams.map((param) => `'${param}'`).join(', ')}`)
	}

	const invalidParams = expectedParams.filter((param) => {
		const validator = validators[param]
		// @ts-ignore
		const paramValue = body[param] as string
		const validationResult = validator(paramValue)
		return validationResult !== undefined && !validationResult
	})

	if (invalidParams.length > 0) {
		throw new ValidationError(`Invalid body params: ${invalidParams.map((param) => `'${param}'`).join(', ')}`)
	}

	const returnValue = {}
	expectedParams.forEach((param) => {
		// @ts-ignore
		returnValue[param] = body[param]
	})

	return returnValue as ValidatedData<ValidatorsT>
}
