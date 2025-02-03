import { WorldEventField } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf'
import { RequiredParam } from 'moonflower'

export const WorldEventFieldValidator = RequiredParam({
	prevalidate: (v) => {
		if (v === null) {
			return false
		}
		const parsedJson = JSON.parse(v)
		if (!Array.isArray(parsedJson)) {
			return false
		}
		const inputArray = parsedJson as unknown[]
		return inputArray.every((value) => keysOf(WorldEventField).some((enumEntry) => enumEntry === value))
	},
	parse: (v) => JSON.parse(v ?? '') as WorldEventField[],
	description: `Should be an array of the following: ${keysOf(WorldEventField)
		.map((type) => `'${type}'`)
		.join(', ')}`,
})
