import { CalendarDraftUnit } from '@api/types/calendarTypes'
import Box from '@mui/material/Box'

import { NewEntityAutocomplete } from '@/ui-lib/components/Autocomplete/NewEntityAutocomplete'

import { NewUnitData } from './CalendarPresentationEditorPanel'

type Props = {
	options: CalendarDraftUnit[]
	limitReached: boolean
	onAddUnit: (unit: NewUnitData) => void
}

export function CalendarPresentationAddUnitForm({ options, limitReached, onAddUnit }: Props) {
	if (options.length === 0) {
		return null
	}

	return (
		<Box sx={{ mt: 1 }}>
			<NewEntityAutocomplete
				placeholder={limitReached ? 'Maximum 3 units' : 'Add unit...'}
				disabled={limitReached}
				options={options}
				getOptionLabel={(option) => {
					const name = option.displayName || option.name
					return name.charAt(0).toUpperCase() + name.slice(1)
				}}
				onAdd={(unit) => {
					if (!unit) {
						return
					}
					onAddUnit({
						unitId: unit.id,
						formatString: '',
					})
				}}
			/>
		</Box>
	)
}
