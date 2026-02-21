import { useCallback, useMemo } from 'react'

import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'

type Props = {
	timestamp: number
}

export function usePresentationUnit({ timestamp }: Props) {
	const { parseTime, units, presentation, originTime } = useWorldTime()
	const parsedTime = parseTime({ timestamp: timestamp + originTime })

	const obtainUnit = useCallback(
		(index: number) => {
			if (presentation.units.length <= index) {
				return null
			}
			return {
				...presentation.units[index],
				duration: units.find((u) => u.id === presentation.units[index].unitId)?.duration ?? 1,
				bucket: units.find((u) => u.id === presentation.units[index].unitId)?.displayName ?? '',
			}
		},
		[presentation.units, units],
	)

	const matchUnit = useCallback(
		(index: number) => {
			const unit = obtainUnit(index)
			if (!unit) {
				return { formatString: '', matchesExactly: false, matchesSubdivided: false }
			}
			const value = parsedTime.values().find((e) => e.unit.displayName === unit.bucket)?.value ?? -1
			const isMatchingSubdivided = (() => {
				if (unit.labeledIndices.length > 0) {
					return unit.labeledIndices.includes(value)
				}
				return value % unit.subdivision === 0
			})()
			return {
				value,
				formatString: unit.formatString,
				matchesExactly: value === 0,
				matchesSubdivided: isMatchingSubdivided,
			}
		},
		[obtainUnit, parsedTime],
	)

	const largeUnit = useMemo(() => matchUnit(0), [matchUnit])
	const mediumUnit = useMemo(() => matchUnit(1), [matchUnit])
	const smallUnit = useMemo(() => matchUnit(2), [matchUnit])

	const isSmallGroup = smallUnit.matchesSubdivided
	const isMediumGroup = mediumUnit.matchesSubdivided && smallUnit.matchesExactly
	const isLargeGroup = largeUnit.matchesSubdivided && mediumUnit.matchesExactly && smallUnit.matchesExactly

	const labelSize = (() => {
		if (isLargeGroup) {
			return 'large' as const
		}
		if (isMediumGroup) {
			return 'medium' as const
		}
		if (isSmallGroup) {
			return 'small' as const
		}

		return null
	})()

	const formatString = useMemo(() => {
		if (isLargeGroup) {
			return largeUnit.formatString
		}
		if (isMediumGroup) {
			return mediumUnit.formatString
		}
		if (isSmallGroup) {
			return smallUnit.formatString
		}

		return ''
	}, [
		isLargeGroup,
		isMediumGroup,
		isSmallGroup,
		largeUnit.formatString,
		mediumUnit.formatString,
		smallUnit.formatString,
	])

	return { labelSize, formatString }
}
