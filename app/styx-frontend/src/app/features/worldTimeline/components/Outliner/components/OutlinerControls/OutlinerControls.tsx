import Add from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/features/world/selectors'
import { useIsReadOnly } from '@/app/hooks/useIsReadOnly'

import { CreateHerePopover } from '../CreateHerePopover/CreateHerePopover'

export const OutlinerControls = () => {
	const { selectedTime } = useSelector(getWorldState)
	const { isReadOnly } = useIsReadOnly()

	const createHerePopupState = usePopupState({ variant: 'popover', popupId: 'createHerePopover' })

	return (
		<Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000, pointerEvents: 'auto' }}>
			{!isReadOnly && (
				<Fab color="primary" {...bindTrigger(createHerePopupState)}>
					<Add />{' '}
				</Fab>
			)}
			<CreateHerePopover state={createHerePopupState} timestamp={selectedTime} />
		</Box>
	)
}
