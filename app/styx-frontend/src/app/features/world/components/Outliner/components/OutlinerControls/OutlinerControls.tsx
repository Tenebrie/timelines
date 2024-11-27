import { Filter } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, FormGroup, Popover, Stack } from '@mui/material'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '@/app/features/preferences/reducer'
import { getOutlinerPreferences } from '@/app/features/preferences/selectors'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { getWorldState } from '@/app/features/world/selectors'
import { useIsReadOnly } from '@/hooks/useIsReadOnly'

import { CreateHerePopover } from '../CreateHerePopover/CreateHerePopover'

export const OutlinerControls = () => {
	const { timeToLabel } = useWorldTime()

	const dispatch = useDispatch()
	const { selectedTime } = useSelector(getWorldState)
	const { showInactiveStatements } = useSelector(getOutlinerPreferences)
	const { setShowInactiveStatements } = preferencesSlice.actions

	const { isReadOnly } = useIsReadOnly()

	const popupState = usePopupState({ variant: 'popover', popupId: 'outlinerFilters' })
	const createHerePopupState = usePopupState({ variant: 'popover', popupId: 'createHerePopover' })

	const label = timeToLabel(selectedTime)

	return (
		<Stack>
			<Stack justifyContent="space-between" alignItems="center" direction="row">
				<div>{label}</div>
				<Stack direction="row" gap={2}>
					<Button startIcon={<Filter />} {...bindTrigger(popupState)}>
						Options
					</Button>
					<Popover
						{...bindPopover(popupState)}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'center',
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'center',
						}}
					>
						<Stack
							sx={{ paddingTop: 1, paddingLeft: 2, paddingBottom: 1, paddingRight: 2, userSelect: 'none' }}
						>
							<FormGroup>
								<FormControlLabel
									control={
										<Checkbox
											onChange={(event) => dispatch(setShowInactiveStatements(event.target.checked))}
										/>
									}
									label="Include revoked statements"
									checked={showInactiveStatements}
								/>
							</FormGroup>
						</Stack>
					</Popover>
					{!isReadOnly && (
						<Button variant="contained" {...bindTrigger(createHerePopupState)}>
							Create new
						</Button>
					)}
					<CreateHerePopover state={createHerePopupState} timestamp={selectedTime} />
				</Stack>
			</Stack>
		</Stack>
	)
}
