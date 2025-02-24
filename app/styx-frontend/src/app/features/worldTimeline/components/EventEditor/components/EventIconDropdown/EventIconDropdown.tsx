import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useMemo } from 'react'

import { EventIcon } from '@/app/components/EventIcon'
import { useEventIcons } from '@/app/features/worldTimeline/hooks/useEventIcons'

type Props = {
	icon: string
	onChange: (value: string) => void
}

export const EventIconDropdown = ({ icon, onChange }: Props) => {
	const { listAllIcons } = useEventIcons()
	const allIcons = useMemo(listAllIcons, [listAllIcons])

	const displayedIcon = useMemo(
		() => (allIcons.some((allowedIcon) => allowedIcon.name === icon) ? icon : 'leaf'),
		[icon, allIcons],
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
						<EventIcon name={renderedIcon.name} height={48} />
					</MenuItem>
				))}
			</Select>
		</FormControl>
	)
}
