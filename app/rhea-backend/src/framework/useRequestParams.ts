import { ParameterizedContext } from 'koa'

import { ValidationError } from './errors/HttpError'
import { SplitStringBy } from './TypeUtils'
import { Validator } from './validators/Validators'

type CheckIfOptional<T, B extends string> = B extends `${string}?` ? T | undefined : T

type ValidatedData<
	ParamsT extends string[],
	TestTemplate extends {
		[K in keyof ParamsT]: {
			original: ParamsT[K]
			cleaned: CleanUpPathParam<ParamsT[K]>
			callback: ValidatorsT[CleanUpPathParam<ParamsT[K]>]
		}
	},
	ValidatorsT extends Record<TestTemplate[number]['cleaned'], Omit<Validator<any>, 'optional'>>
> = {
	[K in keyof TestTemplate as K extends `${number}` ? TestTemplate[K]['cleaned'] : never]: CheckIfOptional<
		ReturnType<TestTemplate[K]['callback']['rehydrate']>,
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
	ValidatorsT extends Record<CleanUpPathParam<ParamsT[number]>, Omit<Validator<any>, 'optional'>>
>(
	ctx: ParameterizedContext & { parsedPathParams: ParamsT },
	validators: ValidatorsT
): ValidatedData<ParamsT, TestTemplate, ValidatorsT> => {
	const params = ctx.params
	const expectedParams = Object.keys(validators)

	const validationResults = expectedParams.map((paramName) => {
		const paramValue = params[paramName] as string

		// Param is optional and is not provided - skip validation
		if (paramValue === undefined) {
			return { paramName, validated: true }
		}

		try {
			const validatorObject = validators[paramName] as Omit<Validator<any>, 'optional'>
			const prevalidatorSuccess = !validatorObject.prevalidate || validatorObject.prevalidate(paramValue)
			const rehydratedValue = validatorObject.rehydrate(paramValue)
			const validatorSuccess = !validatorObject.validate || validatorObject.validate(rehydratedValue)
			return {
				paramName,
				validated: prevalidatorSuccess && validatorSuccess,
				rehydratedValue,
			}
		} catch (error) {
			return { paramName, validated: false }
		}
	})

	const failedValidations = validationResults.filter((result) => !result.validated)

	if (failedValidations.length > 0) {
		throw new ValidationError(
			`Failed route param validation: ${failedValidations
				.map((result) => `'${result.paramName}'`)
				.join(', ')}`
		)
	}

	const successfulValidations = validationResults.filter((result) => result.validated)

	const returnValue = {}
	successfulValidations.forEach((result) => {
		returnValue[result.paramName] = result.rehydratedValue
	})

	return returnValue as ValidatedData<ParamsT, TestTemplate, ValidatorsT>
}
