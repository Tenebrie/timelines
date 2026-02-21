import { RequiredParam } from 'moonflower'
import { z } from 'zod'

export const THE_END = BigInt(8640000000000000) // The end of time

const timestampShape = z.bigint({ coerce: true }).min(-THE_END).max(THE_END)

export const TimestampValidator = RequiredParam<bigint>({
	parse: timestampShape.parse,
	description: 'Any numeric value',
	errorMessage: 'Must be a valid number between -8640000000000000 and 8640000000000000',
})
export const NullableTimestampValidator = RequiredParam<bigint | null>({
	parse: (v) => {
		if (v === null) {
			return null
		}
		return timestampShape.parse(v)
	},
	description: 'Any numeric value',
	errorMessage: 'Must be null, or a valid number between -8640000000000000 and 8640000000000000',
})
