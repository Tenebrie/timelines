import { useCallback, useRef, useState } from 'react'

type Props = {
	value: number
	stagger: number
}

export function useStaggeredValue({ value: initialValue, stagger }: Props) {
	const [value, setValueInstant] = useState(initialValue)
	const lastSeenValue = useRef(initialValue)

	const setValue = useCallback(
		(newValue: number) => {
			if (Math.abs(newValue - lastSeenValue.current) < stagger) {
				return
			}

			setValueInstant(newValue)
			lastSeenValue.current = newValue
		},
		[stagger],
	)

	const forceSetValue = useCallback((newValue: number) => {
		setValueInstant(newValue)
		lastSeenValue.current = newValue
	}, [])

	return [value, setValue, forceSetValue] as const
}
