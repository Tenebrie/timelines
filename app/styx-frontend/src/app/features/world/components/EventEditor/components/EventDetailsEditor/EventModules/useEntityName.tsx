import { useCallback, useEffect, useMemo } from 'react'

type Props = {
	textSource: string
	customName: string
	customNameEnabled: boolean
	onChange: (value: string) => void
}

export const useEntityName = ({ textSource, customName, customNameEnabled, onChange }: Props) => {
	const generateName = useCallback((source: string) => {
		const allowedRegex = /^[^.!?;()[\]|/]+/iu
		const regexResult = allowedRegex.exec(source)
		if (regexResult) {
			return regexResult[0].trim().slice(0, 256).trim()
		}
		return ''
	}, [])

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
