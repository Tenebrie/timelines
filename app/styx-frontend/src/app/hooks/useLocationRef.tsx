import { useLocation } from '@tanstack/react-router'
import { createRef, Ref } from 'react'

const refs: Record<string, Ref<never>> = {}

let i = 0
export const useLocationRef = () => {
	const location = useLocation()

	const ref = (() => {
		refs[i] = createRef()
		return refs[i++]
	})()

	return {
		key: i - 1,
		nodeRef: ref,
	}
}
