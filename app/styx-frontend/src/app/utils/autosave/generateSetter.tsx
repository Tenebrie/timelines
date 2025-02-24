import { Dispatch } from 'react'

type SetterArgs = {
	cleanSet?: boolean
}

const areEqual = <T,>(a: T, b: T): boolean => {
	if (a === b) {
		return true
	}
	if (typeof a === 'string' && typeof b === 'string' && a.trim() === b.trim()) {
		return true
	}
	if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
		return a.every((val, index) => areEqual(val, b[index]))
	}
	return false
}

export const generateSetter = <T,>(setter: Dispatch<React.SetStateAction<T>>, makeDirty: () => void) => {
	return (val: T, args?: SetterArgs) => {
		setter((oldVal) => {
			if (args?.cleanSet) {
				return val
			}
			if (!areEqual(oldVal, val) && !args?.cleanSet) {
				makeDirty()
			}

			return val
		})
	}
}
