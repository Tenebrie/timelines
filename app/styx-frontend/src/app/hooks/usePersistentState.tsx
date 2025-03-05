import { useEffect, useState } from 'react'
import { ZodSchema } from 'zod'

function usePersistentState<T>(
	key: string,
	schema: ZodSchema<T>,
	initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [value, setValue] = useState<T>(() => {
		const storedValue = localStorage.getItem(`userPreferences/${key}`)
		if (!storedValue) {
			return initialValue
		}
		try {
			return schema.parse(JSON.parse(storedValue))
		} catch (error) {
			console.error(error)
			localStorage.removeItem(`userPreferences/${key}`)
		}
		return initialValue
	})

	useEffect(() => {
		localStorage.setItem(`userPreferences/${key}`, JSON.stringify(value))
	}, [key, value])

	return [value, setValue] as const
}

export default usePersistentState
