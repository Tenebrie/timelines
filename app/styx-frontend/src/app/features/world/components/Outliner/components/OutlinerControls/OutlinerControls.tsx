import { Filter } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, FormGroup, Popover, Stack } from '@mui/material'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '../../../../../preferences/reducer'
import { getOutlinerPreferences } from '../../../../../preferences/selectors'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { CreateHerePopover } from '../CreateHerePopover/CreateHerePopover'

export const OutlinerControls = () => {
	const { timeToLabel } = useWorldTime()
	const { outlinerParams } = useWorldRouter()
	const selectedTime = Number(outlinerParams.timestamp)

	const dispatch = useDispatch()
	const { openEventWizard } = worldSlice.actions
	const { showEmptyEvents, showInactiveStatements } = useSelector(getOutlinerPreferences)
	const { setShowEmptyEvents, setShowInactiveStatements } = preferencesSlice.actions

	const onCreateEvent = () => {
		dispatch(openEventWizard({ timestamp: selectedTime }))
	}

	const popupState = usePopupState({ variant: 'popover', popupId: 'outlinerFilters' })
	const createHerePopupState = usePopupState({ variant: 'popover', popupId: 'createHerePopover' })

	return (
		<Stack justifyContent="space-between" alignItems="center" direction="row">
			<div>{timeToLabel(selectedTime)}</div>
			<Stack direction="row" gap={2}>
				<Button startIcon={<Filter />} {...bindTrigger(popupState)}>
					Filters
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
									<Checkbox onChange={(event) => dispatch(setShowEmptyEvents(event.target.checked))} />
								}
								label="Show empty events"
								checked={showEmptyEvents}
							/>
							<FormControlLabel
								control={
									<Checkbox onChange={(event) => dispatch(setShowInactiveStatements(event.target.checked))} />
								}
								label="Show revoked statements"
								checked={showInactiveStatements}
							/>
						</FormGroup>
					</Stack>
				</Popover>
				<Button variant="contained" {...bindTrigger(createHerePopupState)}>
					Create new
				</Button>
				<CreateHerePopover state={createHerePopupState} timestamp={selectedTime} />
			</Stack>
		</Stack>
	)
}
