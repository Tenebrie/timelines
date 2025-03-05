import { useEffect, useMemo } from 'react'

export const useAutoRef = <T,>(value: T) => {
	const ref = useMemo(
		() => ({
			current: value,
			previous: null as T | null,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)

	useEffect(() => {
		if (value === ref.current) {
			return
		}
		ref.previous = ref.current
		ref.current = value
	}, [ref, value])

	return ref
}
