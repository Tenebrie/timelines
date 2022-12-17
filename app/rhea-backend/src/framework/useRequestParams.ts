/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ParameterizedContext } from 'koa'

import { ValidationError } from './errors/HttpError'
import { SplitStringBy } from './TypeUtils'

type Please<T, B extends string> = B extends `${string}?` ? T | undefined : T

type ValidatedData<
	ParamsT extends string[],
	TestTemplate extends {
		[K in keyof ParamsT]: {
			original: ParamsT[K]
			cleaned: CleanUpPathParam<ParamsT[K]>
			callback: ValidatorsT[CleanUpPathParam<ParamsT[K]>]
		}
	},
	ValidatorsT extends Record<TestTemplate[number]['cleaned'], (val: any) => any>
> = {
	[K in keyof TestTemplate as K extends `${number}` ? TestTemplate[K]['cleaned'] : never]: Please<
		Parameters<TestTemplate[K]['callback']>[0],
		TestTemplate[K]['original']
	>
}

type RemoveLeadingColon<S extends string> = S['length'] extends 0 ? never : SplitStringBy<S, ':'>[1]
type RemoveTrailingQuestion<S extends string> = S['length'] extends 0 ? never : SplitStringBy<S, '?'>[0]
type CleanUpPathParam<S extends string> = RemoveLeadingColon<RemoveTrailingQuestion<S>> extends string
	? RemoveLeadingColon<RemoveTrailingQuestion<S>>
	: ''

export const useRequestParams = <
	ParamsT extends string[],
	TestTemplate extends {
		[K in keyof ParamsT]: {
			original: ParamsT[K]
			cleaned: CleanUpPathParam<ParamsT[K]>
			callback: ValidatorsT[CleanUpPathParam<ParamsT[K]>]
		}
	},
	ValidatorsT extends Record<CleanUpPathParam<ParamsT[number]>, (val: any) => any>
>(
	ctx: ParameterizedContext & { parsedPathParams: ParamsT },
	validators: ValidatorsT
): ValidatedData<ParamsT, TestTemplate, ValidatorsT> => {
	const params = ctx.params
	const expectedParams = Object.keys(validators)

	const failedValidations = expectedParams.filter((param) => {
		try {
			return params[param] !== undefined && !validators[param](params[param])
		} catch (error) {
			return true
		}
	})

	if (failedValidations.length > 0) {
		throw new ValidationError(
			`Failed route param validation: ${failedValidations.map((param) => `'${param}'`).join(', ')}`
		)
	}

	const returnValue = {}
	expectedParams.forEach((param) => {
		returnValue[param] = params[param]
	})

	return returnValue as ValidatedData<ParamsT, TestTemplate, ValidatorsT>
}
