import debounce from 'lodash.debounce'
import { useCallback, useMemo, useState } from 'react'

type Props<T> = {
	initialValue: T
	onDebounce?: (value: T) => void
	delay?: number
}

export const useDebouncedState = <T,>({ initialValue, onDebounce, delay }: Props<T>) => {
	const [value, setValue] = useState(initialValue)
	const [nextValue, setNextValue] = useState(initialValue)

	const emitPageDebounced = useMemo(
		() =>
			debounce((newValue: T) => {
				setValue(newValue)
				onDebounce?.(newValue)
			}, delay ?? 500),
		[delay, onDebounce],
	)

	const setValueExternal = useCallback(
		(newValue: T) => {
			setNextValue(newValue)
			emitPageDebounced(newValue)
		},
		[emitPageDebounced],
	)

	const setValueInstant = useCallback(
		(newValue: T) => {
			setValue(newValue)
			setNextValue(newValue)
			emitPageDebounced.cancel()
		},
		[emitPageDebounced],
	)

	return [value, nextValue, setValueExternal, setValueInstant] as const
}
