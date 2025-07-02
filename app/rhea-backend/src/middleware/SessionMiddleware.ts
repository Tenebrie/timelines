import { useHeaderParams } from 'moonflower/hooks/useHeaderParams'
import { Router } from 'moonflower/router/Router'
import { NonEmptyStringValidator } from 'moonflower/validators/BuiltInValidators'
import { OptionalParam } from 'moonflower/validators/ParamWrappers'

import { SESSION_HEADER_NAME } from '../ts-shared/const/constants.js'

export const uncapitalize = (value: string) => `${value.substring(0, 1).toLowerCase()}${value.substring(1)}`

export const snakeToCamelCase = (value: string) => {
	return uncapitalize(value).replace(/(?!^)_(.)/g, (_, char) => char.toUpperCase())
}

export const kebabToCamelCase = (value: string) => {
	return uncapitalize(value).replace(/(?!^)-(.)/g, (_, char) => char.toUpperCase())
}

export const camelToSnakeCase = (value: string) => {
	return uncapitalize(value).replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)
}

export const camelToKebabCase = (value: string) => {
	return uncapitalize(value).replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
}

export const SessionMiddleware = async (
	ctx: Parameters<Parameters<InstanceType<typeof Router>['with']>[0]>[0],
) => {
	const { sessionId } = useHeaderParams(ctx, {
		[SESSION_HEADER_NAME]: OptionalParam(NonEmptyStringValidator),
	})

	return {
		sessionId,
	}
}
