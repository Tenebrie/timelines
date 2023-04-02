import { useRef } from 'react'

import { useEffectOnce } from './useEffectOnce'

export const useIsFirstRender = () => {
	const isFirstRenderRef = useRef(true)

	useEffectOnce(() => {
		isFirstRenderRef.current = false
	})

	return { isFirstRender: isFirstRenderRef.current }
}
