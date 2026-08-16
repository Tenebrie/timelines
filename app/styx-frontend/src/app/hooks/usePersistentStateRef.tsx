import { useCallback, useRef } from 'react'
import { ZodSchema } from 'zod'

function usePersistentStateRef<T>(
	key: string,
	schema: ZodSchema<T>,
	initialValue: T,
	storage: Storage = localStorage,
): [React.RefObject<T>, (value: T | ((prev: T) => T)) => void] {
	const value = useRef<T>(
		(() => {
			const storedValue = storage.getItem(`userPreferences/${key}`)
			if (!storedValue) {
				return initialValue
			}
			try {
				return schema.parse(JSON.parse(storedValue))
			} catch (error) {
				console.error(error)
				storage.removeItem(`userPreferences/${key}`)
			}
			return initialValue
		})(),
	)

	const setValue = useCallback(
		(newValue: T | ((prev: T) => T)) => {
			if (isFunction(newValue)) {
				value.current = newValue(value.current)
			} else {
				value.current = newValue
			}
			storage.setItem(`userPreferences/${key}`, JSON.stringify(value.current))
		},
		[key, storage],
	)

	return [value, setValue] as const
}

function isFunction<T>(value: T | ((prev: T) => T)): value is (prev: T) => T {
	return typeof value === 'function'
}

export default usePersistentStateRef
