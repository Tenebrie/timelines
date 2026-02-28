import LeftIcon from '@mui/icons-material/PlayArrow'
import RightIcon from '@mui/icons-material/Stop'
import Button from '@mui/material/Button'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Popover from '@mui/material/Popover'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { worldSlice } from '@/app/views/world/WorldSlice'

import { EventDraft } from '../draft/useEventDraft'

type Props = {
	draft: EventDraft
}

export function EventTimePopover({ draft }: Props) {
	const { open: openTimeTravelModal } = useModal('timeTravelModal')

	const { timeToLabel } = useWorldTime()
	const timestampLabel = useMemo(() => {
		if (!draft) {
			return ''
		}
		return timeToLabel(draft.timestamp)
	}, [timeToLabel, draft])
	const revokedAtLabel = useMemo(() => {
		if (!draft || !draft.revokedAt) {
			return ''
		}
		return timeToLabel(draft.revokedAt)
	}, [draft, timeToLabel])

	const popupState = usePopupState({ variant: 'popover', popupId: 'event-time-popover' })

	const { setTimelineMarkerSelection } = worldSlice.actions
	const dispatch = useDispatch()

	if (!draft.revokedAt) {
		return (
			<Button sx={{ padding: '4px 12px', textWrap: 'nowrap', flexShrink: 0 }} onClick={openTimeTravelModal}>
				{timestampLabel}
			</Button>
		)
	}

	return (
		<>
			<Button sx={{ padding: '4px 12px', textWrap: 'nowrap', flexShrink: 0 }} {...bindTrigger(popupState)}>
				Multiple dates
			</Button>
			<Popover
				{...bindPopover(popupState)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				<MenuList>
					<MenuItem
						onClick={() => {
							dispatch(setTimelineMarkerSelection([{ key: `issuedAt-${draft.id}`, eventId: draft.id }]))
							openTimeTravelModal({})
							popupState.close()
						}}
					>
						<ListItemIcon>
							<LeftIcon />
						</ListItemIcon>
						<ListItemText>{timestampLabel}</ListItemText>
					</MenuItem>
					<MenuItem
						onClick={() => {
							dispatch(setTimelineMarkerSelection([{ key: `revokedAt-${draft.id}`, eventId: draft.id }]))
							openTimeTravelModal({})
							popupState.close()
						}}
					>
						<ListItemIcon>
							<RightIcon />
						</ListItemIcon>
						<ListItemText>{revokedAtLabel}</ListItemText>
					</MenuItem>
				</MenuList>
			</Popover>
		</>
	)
}
