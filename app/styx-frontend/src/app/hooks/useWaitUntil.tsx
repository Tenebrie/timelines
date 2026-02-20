import { useCallback, useRef } from 'react'

export function useWaitUntil() {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const waitUntil = useCallback(
		(condition: () => boolean, { timeout = 5000 }: { timeout?: number } = {}): Promise<void> => {
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}

			return new Promise<void>((resolve, reject) => {
				const start = Date.now()
				const check = () => {
					if (condition()) {
						timeoutRef.current = null
						resolve()
					} else if (Date.now() - start >= timeout) {
						timeoutRef.current = null
						reject(new Error(`useWaitUntil timed out after ${timeout}ms`))
					} else {
						timeoutRef.current = setTimeout(check, 5)
					}
				}
				check()
			})
		},
		[],
	)

	return waitUntil
}
