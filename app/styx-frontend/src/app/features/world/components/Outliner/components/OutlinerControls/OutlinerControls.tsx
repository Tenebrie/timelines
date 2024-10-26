import { Filter } from '@mui/icons-material'
import { Button, Checkbox, Divider, FormControlLabel, FormGroup, Popover, Slider, Stack } from '@mui/material'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useDispatch, useSelector } from 'react-redux'

import { useIsReadOnly } from '../../../../../../../hooks/useIsReadOnly'
import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { preferencesSlice } from '../../../../../preferences/reducer'
import { getOutlinerPreferences, getTimelinePreferences } from '../../../../../preferences/selectors'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { getWorldState } from '../../../../selectors'
import { CreateHerePopover } from '../CreateHerePopover/CreateHerePopover'
import { useTimelineSpacingSlider } from './useTimelineSpacingSlider'

export const OutlinerControls = () => {
	const { timeToLabel } = useWorldTime()
	const { selectedTimeOrNull } = useWorldRouter()

	const dispatch = useDispatch()
	const { events } = useSelector(getWorldState)
	const { useCustomLineSpacing } = useSelector(getTimelinePreferences)
	const { showInactiveStatements } = useSelector(getOutlinerPreferences)
	const { setUseCustomTimelineSpacing, setShowInactiveStatements } = preferencesSlice.actions

	const { isReadOnly } = useIsReadOnly()
	const { timelineSpacing, setTimelineSpacing } = useTimelineSpacingSlider()

	const popupState = usePopupState({ variant: 'popover', popupId: 'outlinerFilters' })
	const createHerePopupState = usePopupState({ variant: 'popover', popupId: 'createHerePopover' })

	const latestTime = [...events].sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp ?? 0

	const label =
		selectedTimeOrNull === null ? `Latest (${timeToLabel(latestTime)})` : timeToLabel(selectedTimeOrNull)

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
								<Divider />
								<FormControlLabel
									control={
										<Checkbox
											onChange={(event) => dispatch(setUseCustomTimelineSpacing(event.target.checked))}
										/>
									}
									label="Custom timeline spacing"
									checked={useCustomLineSpacing}
								/>
								<Slider
									disabled={!useCustomLineSpacing}
									aria-label="Spacing"
									getAriaValueText={() => `Spacing = ${timelineSpacing}`}
									valueLabelDisplay="auto"
									step={0.1}
									value={timelineSpacing}
									min={0.5}
									max={5}
									onChange={(_, value) => setTimelineSpacing(value)}
								/>
							</FormGroup>
						</Stack>
					</Popover>
					{!isReadOnly && (
						<Button
							disabled={selectedTimeOrNull === null}
							variant="contained"
							{...bindTrigger(createHerePopupState)}
						>
							Create new
						</Button>
					)}
					<CreateHerePopover state={createHerePopupState} timestamp={selectedTimeOrNull ?? 0} />
				</Stack>
			</Stack>
		</Stack>
	)
}
