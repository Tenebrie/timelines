import { createRef, Ref } from 'react'
import { useLocation } from 'react-router-dom'

const refs: Record<string, Ref<any>> = {}

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
