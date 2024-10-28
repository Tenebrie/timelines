import { Avatar, Stack } from '@mui/material'
import { blueGrey, brown, deepPurple, green, grey, lime, pink, red } from '@mui/material/colors'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import { useCallback, useMemo } from 'react'

export const useActorColors = () => {
	const availableColors: { value: string; name: string }[] = useMemo(
		() => [
			{ value: '#008080', name: 'Teal' },
			{ value: blueGrey[200], name: 'Blue gray' },
			{ value: brown[200], name: 'Brown' },
			{ value: deepPurple[200], name: 'Purple' },
			{ value: green[200], name: 'Green' },
			{ value: grey[200], name: 'Gray' },
			{ value: lime[200], name: 'Lime' },
			{ value: pink[200], name: 'Pink' },
			{ value: red[200], name: 'Red' },
		],
		[],
	)

	const listAllColors = useCallback(() => {
		return availableColors
	}, [availableColors])

	const renderOption = useCallback(
		(option: (typeof availableColors)[number]) => (
			<MenuItem key={option.value} value={option.value} selected={false}>
				<Stack direction="row" alignItems="center" gap={1}>
					<Avatar sx={{ bgcolor: option.value }}> </Avatar>
					<ListItemText primary={option.name} secondary={option.value} />
				</Stack>
			</MenuItem>
		),
		[],
	)

	const valueToName = useCallback(
		(value: string) => availableColors.find((color) => color.value === value)?.name ?? value,
		[availableColors],
	)

	const renderValue = useCallback(
		(value: string) => (
			<Stack direction="row" alignItems="center" gap={1}>
				<Avatar sx={{ bgcolor: value }}> </Avatar>
				<ListItemText style={{ margin: 0 }} primary={valueToName(value)} secondary={value} />
			</Stack>
		),
		[valueToName],
	)

	const getColorOptions = useCallback(() => {
		return availableColors.map((color) => ({
			...color,
			option: renderOption(color),
		}))
	}, [availableColors, renderOption])

	const getColorIndex = useCallback(
		(colorValue: string) => {
			return availableColors.findIndex((color) => color.value === colorValue)
		},
		[availableColors],
	)

	return {
		listAllColors,
		getColorOptions,
		renderOption,
		renderValue,
		getColorIndex,
	}
}
