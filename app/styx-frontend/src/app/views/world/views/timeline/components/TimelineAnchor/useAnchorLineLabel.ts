import { useCallback, useRef, useState } from 'react'

import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'

type Props = {
	labelSize: 'large' | 'medium' | 'small' | null
	timestamp: number
	formatString: string
}

export function useAnchorLineLabel({ labelSize, timestamp, formatString }: Props) {
	const { timeToLabel } = useWorldTime()
	const getLabel = useCallback(() => {
		if (!labelSize) {
			return null
		}
		if (!formatString) {
			return ' '
		}
		return timeToLabel(timestamp, formatString)
	}, [labelSize, timeToLabel, timestamp, formatString])

	const [displayedLabel, setDisplayedLabel] = useState<string | null>(getLabel())
	const displayedLabelRef = useRef(displayedLabel)

	const refreshLabel = useCallback(() => {
		const newValue = getLabel()
		if (newValue === displayedLabelRef.current) {
			return
		}
		setDisplayedLabel(newValue)
		displayedLabelRef.current = newValue
	}, [getLabel])

	return {
		label: displayedLabel,
		refreshLabel,
	}
}
