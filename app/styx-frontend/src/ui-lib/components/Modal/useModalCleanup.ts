import { useEffect, useRef } from 'react'

type Props = {
	isOpen: boolean
	onCleanup: () => void
}

export const useModalCleanup = ({ isOpen, onCleanup }: Props) => {
	const previousOpenState = useRef(isOpen)

	useEffect(() => {
		if (isOpen && !previousOpenState.current) {
			onCleanup()
			previousOpenState.current = true
			return
		}
		previousOpenState.current = isOpen
	}, [isOpen, onCleanup])
}
