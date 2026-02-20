import debounce from 'lodash.debounce'
import { useCallback, useRef, useState } from 'react'

type Props<T> = {
	initialValue: T
	onDebounce?: (value: T) => void
	delay?: number
}

export const useDebouncedState = <T,>({ initialValue, onDebounce, delay }: Props<T>) => {
	const [value, setValue] = useState(initialValue)
	const [nextValue, setNextValue] = useState(initialValue)

	const setValueExternal = useCallback((newValue: T) => {
		setNextValue(newValue)
		emitPageDebounced.current(newValue)
	}, [])

	const setValueInstant = useCallback((newValue: T) => {
		setValue(newValue)
		setNextValue(newValue)
		emitPageDebounced.current.cancel()
	}, [])

	const emitPageDebounced = useRef(
		debounce((newValue: T) => {
			setValue(newValue)
			onDebounce?.(newValue)
		}, delay ?? 500),
	)

	return [value, nextValue, setValueExternal, setValueInstant] as const
}
