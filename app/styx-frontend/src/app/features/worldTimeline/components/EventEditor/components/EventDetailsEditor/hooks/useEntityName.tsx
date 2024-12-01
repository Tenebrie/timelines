import { useCallback, useEffect, useMemo } from 'react'

import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'

type Props = {
	textSource: string
	entityClassName: string
	timestamp: number
	customName: string
	customNameEnabled: boolean
	onChange: (value: string) => void
}

export const useEntityName = ({
	textSource,
	entityClassName,
	timestamp,
	customName,
	customNameEnabled,
	onChange,
}: Props) => {
	const { timeToLabel } = useWorldTime()

	const generateName = useCallback(
		(source: string) => {
			const allowedRegex = /^[^.!?;()[\]|/\n]+/iu
			const regexResult = allowedRegex.exec(source)
			if (regexResult) {
				return regexResult[0].trim().slice(0, 256).trim()
			}
			return `Unnamed ${entityClassName} at ${timeToLabel(timestamp)}`
		},
		[entityClassName, timeToLabel, timestamp],
	)

	const outputName = useMemo(() => {
		if (customNameEnabled) {
			return customName
		}
		return generateName(textSource)
	}, [customNameEnabled, customName, generateName, textSource])

	useEffect(() => {
		if (!customNameEnabled) {
			onChange(outputName)
		}
	}, [outputName, onChange, customNameEnabled])

	return {
		name: outputName,
	}
}
