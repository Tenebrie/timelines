import { ParameterizedContext } from 'koa'

import { ValidationError } from './errors/HttpError'
import { SplitStringBy } from './TypeUtils'

type ValidatedData<T extends Record<string, (val: any) => any>> = {
	[K in keyof T]: Parameters<T[K]>[0]
}

type RemoveLeadingColon<S extends string> = S['length'] extends 0 ? never : SplitStringBy<S, ':'>[1]

export const useRequestParams = <
	ParamsT extends string[],
	ValidatorsT extends Record<RemoveLeadingColon<ParamsT[number]>, (val: string | number) => any>
>(
	ctx: ParameterizedContext & { parsedPathParams: ParamsT },
	validators: ValidatorsT
): ValidatedData<ValidatorsT> => {
	console.log(ctx.params)

	const params = ctx.params
	const expectedParams = Object.keys(validators)

	const missingParams = expectedParams.filter((param) => !params || params[param] === undefined)

	if (missingParams.length > 0) {
		throw new ValidationError(
			`Missing route params: ${missingParams.map((param) => `'${param}'`).join(', ')}`
		)
	}

	const returnValue = {}
	expectedParams.forEach((param) => {
		returnValue[param] = params[param]
	})

	return returnValue as ValidatedData<ValidatorsT>
}
