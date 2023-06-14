import { QuestionMark } from '@mui/icons-material'
import { IconButton, Popover, Stack, Typography } from '@mui/material'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'

export const WorldListEmptyState = () => {
	const tooltipPopoverState = usePopupState({ variant: 'popover', popupId: 'createHerePopover' })

	return (
		<Stack direction="row" alignItems="center" gap={1} justifyContent="center">
			Nothing has been created yet!{' '}
			<IconButton color="primary" {...bindTrigger(tooltipPopoverState)}>
				<QuestionMark />
			</IconButton>
			<Popover
				{...bindPopover(tooltipPopoverState)}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
			>
				<Typography sx={{ p: 2 }} variant="body2">
					A world is just a project, a container for your events and characters.
					<br />
					Click the button below to create your first one!
				</Typography>
			</Popover>
		</Stack>
	)
}
