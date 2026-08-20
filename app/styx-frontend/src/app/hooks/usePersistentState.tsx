import { useEffect, useState } from 'react'
import { ZodSchema } from 'zod'

function usePersistentState<T>(
	key: string,
	schema: ZodSchema<T>,
	initialValue: T,
	storage: Storage = localStorage,
): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [value, setValue] = useState<T>(() => {
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
	})

	useEffect(() => {
		storage.setItem(`userPreferences/${key}`, JSON.stringify(value))
	}, [key, storage, value])

	return [value, setValue] as const
}

export default usePersistentState
