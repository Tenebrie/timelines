import { useState } from 'react'

type Props = {
	isOpen: boolean
	onPrefill: () => void
}

export const useModalPrefill = ({ isOpen, onPrefill }: Props) => {
	const [wasOpen, setWasOpen] = useState(isOpen)

	if (isOpen !== wasOpen) {
		setWasOpen(isOpen)
		if (isOpen) {
			onPrefill()
		}
	}
}
