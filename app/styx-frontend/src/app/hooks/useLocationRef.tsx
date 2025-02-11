import { useLocation } from '@tanstack/react-router'
import { createRef, Ref } from 'react'

const refs: Record<string, Ref<never>> = {}

export const useLocationRef = () => {
	const location = useLocation()

	const ref = (() => {
		const oldRef = refs[location.pathname]
		if (oldRef) {
			return oldRef
		}
		refs[location.pathname] = createRef()
		return refs[location.pathname]
	})()

	return {
		key: location.pathname,
		nodeRef: ref,
	}
}
