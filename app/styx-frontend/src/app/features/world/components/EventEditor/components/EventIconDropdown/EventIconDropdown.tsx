import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useMemo } from 'react'

import { useEventIcons } from '../../../../hooks/useEventIcons'

type Props = {
	icon: string
	onChange: (value: string) => void
}

export const EventIconDropdown = ({ icon, onChange }: Props) => {
	const { listAllIcons } = useEventIcons()
	const allIcons = useMemo(listAllIcons, [listAllIcons])

	const displayedIcon = useMemo(
		() => (allIcons.some((allowedIcon) => allowedIcon.name === icon) ? icon : 'leaf'),
		[icon, allIcons]
	)

	return (
		<FormControl style={{ minWidth: '96px' }}>
			<InputLabel id="demo-simple-select-label">Icon</InputLabel>
			<Select
				labelId="demo-simple-select-label"
				label="Icon"
				value={displayedIcon}
				onChange={(event) => onChange(event.target.value)}
			>
				{allIcons.map((renderedIcon) => (
					<MenuItem key={renderedIcon.name} value={renderedIcon.name}>
						<img src={renderedIcon.path} alt={`${renderedIcon.name} icon`} style={{ maxHeight: '48px' }} />
					</MenuItem>
				))}
			</Select>
		</FormControl>
	)
}
