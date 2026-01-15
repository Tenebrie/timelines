import debounce from 'lodash.debounce'
import { useCallback, useRef, useState } from 'react'

type Props<T> = {
	initialValue: T
	onDebounce: (value: T) => void
	debounceTimeout?: number
}

export const useStateWithDebounceCallback = <T,>({ initialValue, onDebounce, debounceTimeout }: Props<T>) => {
	const [value, setValue] = useState(initialValue)
	const [debouncedValue, setDebouncedValue] = useState(initialValue)

	const setValueExternal = useCallback((newValue: T) => {
		setValue(newValue)
		emitPageDebounced.current(newValue)
	}, [])

	const setValueInstant = useCallback(
		(newValue: T) => {
			setValue(newValue)
			setDebouncedValue(newValue)
			onDebounce(newValue)
			emitPageDebounced.current.cancel()
		},
		[onDebounce],
	)

	const emitPageDebounced = useRef(
		debounce((newValue: T) => {
			setDebouncedValue(newValue)
			onDebounce(newValue)
		}, debounceTimeout ?? 500),
	)

	return [value, setValueExternal, setValueInstant] as const
}
