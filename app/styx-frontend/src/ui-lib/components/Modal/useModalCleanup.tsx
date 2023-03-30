import { useEffect } from 'react'

type Props = {
	isOpen: boolean
	onCleanup: () => void
}

export const useModalCleanup = ({ isOpen, onCleanup }: Props) => {
	useEffect(() => {
		if (!isOpen) {
			return
		}

		onCleanup()
	}, [isOpen, onCleanup])
}
