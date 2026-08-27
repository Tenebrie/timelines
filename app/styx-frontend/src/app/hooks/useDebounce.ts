import { useCallback, useRef } from 'react'

export function useDebounce<T extends (...args: never[]) => unknown>(
	fn: T,
	delay: number,
): (...args: Parameters<T>) => void {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const debouncedFn = useCallback(
		(...args: Parameters<T>) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			timeoutRef.current = setTimeout(() => {
				fn(...args)
			}, delay)
		},
		[fn, delay],
	)

	return debouncedFn
}
