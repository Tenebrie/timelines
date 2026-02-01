import { Calendar, CalendarUnit } from '@api/types/calendarTypes'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'

import { usePreviewCalendar } from '../../hooks/usePreviewCalendar'

export function CalendarTimestampPreview() {
	const [sliderValue, setSliderValue] = useState(0)
	const previewCalendar = usePreviewCalendar()

	const formatTimestamp = useFormatTimestamp({ calendar: previewCalendar })

	return (
		<Stack>
			<Typography>Timestamp: {sliderValue}</Typography>
			<Slider value={sliderValue} min={0} max={160000} onChange={(e, val) => setSliderValue(val as number)} />
			<Paper variant="outlined" sx={{ p: '12px', width: 'calc(100% - 24px)', bgcolor: 'background.default' }}>
				{previewCalendar && formatTimestamp({ timestamp: sliderValue })}
			</Paper>
		</Stack>
	)
}

type ParsedTimestamp = Map<string, ParsedTimestampEntry>
type ParsedTimestampEntry = {
	value: number
	customLabel?: string
}

function useFormatTimestamp({ calendar }: { calendar?: Calendar }) {
	return useMemo(() => {
		if (!calendar) {
			return () => ''
		}

		const sumNonHiddenChildren = (unit: CalendarUnit) => {
			let sum = 0
			for (const childRelation of unit.children) {
				const childUnit = calendar.units.find((u) => u.id === childRelation.childUnitId)!
				if (childUnit.displayFormat !== 'Hidden') {
					sum += childRelation.repeats
				} else {
					sum += sumNonHiddenChildren(childUnit) * childRelation.repeats
				}
			}
			return sum
		}

		const parseTimestamp = ({
			outputMap,
			unit,
			customLabel,
			timestamp,
			extraDuration,
		}: {
			outputMap?: ParsedTimestamp
			unit: CalendarUnit
			customLabel?: string
			timestamp: number
			extraDuration: number
		}) => {
			outputMap =
				outputMap ??
				new Map<
					string,
					{
						value: number
						customLabel?: string
					}
				>()
			const index = Math.floor(timestamp / unit.duration)
			let remainder = timestamp % unit.duration

			let myExtraDuration = 0
			if (unit.displayFormat === 'Hidden') {
				myExtraDuration += sumNonHiddenChildren(unit) * index
				myExtraDuration += extraDuration
			}

			outputMap.set(unit.id, {
				value: index + (unit.displayFormat === 'Hidden' ? 0 : extraDuration),
				customLabel,
			})

			if (unit.children.length === 0) {
				return outputMap
			}

			for (const childRelation of unit.children) {
				const childUnit = calendar.units.find((u) => u.id === childRelation.childUnitId)!
				if (remainder < childUnit.duration * childRelation.repeats) {
					return parseTimestamp({
						outputMap,
						unit: childUnit,
						timestamp: remainder,
						extraDuration: myExtraDuration,
						customLabel: childRelation.label ?? undefined,
					})
				}
				remainder -= childUnit.duration * childRelation.repeats
				if (childUnit.displayFormat !== 'Hidden') {
					myExtraDuration += childRelation.repeats
				} else {
					myExtraDuration += childRelation.repeats * sumNonHiddenChildren(childUnit)
				}
			}
			console.error('No child unit matched for remainder', remainder)
			return outputMap
		}

		const formatParsed = (parsed: ParsedTimestamp) => {
			if (calendar.dateFormat?.trim().length === 0) {
				return 'No date format specified'
			}

			const current = {
				symbol: '' as string,
				count: 0,

				result: '',
			}

			const flushCurrent = () => {
				if (current.symbol.length > 0) {
					const unit = calendar.units.find(
						(u) => u.dateFormatShorthand === current.symbol && parsed.get(u.id),
					)
					if (unit) {
						const entry = parsed.get(unit.id)
						if (entry) {
							current.result += formatUnit(unit, entry, current.count)
						}
					} else {
						current.result += current.symbol.repeat(current.count)
					}
				}
			}

			const dateFormat = calendar.dateFormat ?? ''
			for (const char of dateFormat) {
				if (char === current.symbol) {
					current.count += 1
				} else {
					flushCurrent()
					current.symbol = char
					current.count = 1
				}
			}
			flushCurrent()

			function formatUnit(unit: CalendarUnit, entry: ParsedTimestampEntry, symbolCount: number) {
				const value =
					unit.displayFormat === 'NameOneIndexed' || unit.displayFormat === 'NumericOneIndexed'
						? entry.value + 1
						: entry.value
				const paddedValue = value.toString().padStart(symbolCount, '0')

				const isNumeric = unit.displayFormat === 'Numeric' || unit.displayFormat === 'NumericOneIndexed'
				const isSymbolic = unit.displayFormat === 'Name' || unit.displayFormat === 'NameOneIndexed'

				if (entry.customLabel && symbolCount === 1) {
					// TODO: Short label
					return entry.customLabel
				} else if (entry.customLabel && symbolCount > 1) {
					return entry.customLabel
				} else if (isSymbolic && symbolCount === 1) {
					return unit.displayNameShort + ' ' + paddedValue
				} else if (isSymbolic && symbolCount > 1) {
					return unit.displayName + ' ' + paddedValue
				} else if (isNumeric) {
					return paddedValue
				}
				return ''
			}

			return current.result
		}

		const format = ({ timestamp }: { timestamp: number }) => {
			const roots = calendar.units
				.filter((u) => u.parents.length === 0)
				.map((rootUnit) => {
					const parsed = parseTimestamp({
						unit: rootUnit,
						timestamp,
						extraDuration: 0,
					})
					return {
						unit: rootUnit,
						parsed,
					}
				})
				.sort((a, b) => a.unit.position - b.unit.position)

			const combinedTimeMap: ParsedTimestamp = new Map()
			for (const root of roots) {
				for (const [key, value] of root.parsed.entries()) {
					if (!combinedTimeMap.has(key)) {
						combinedTimeMap.set(key, value)
					}
				}
			}
			return formatParsed(combinedTimeMap)
		}

		return format
	}, [calendar])
}
