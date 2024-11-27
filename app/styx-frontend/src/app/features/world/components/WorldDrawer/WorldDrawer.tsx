import { Event, Help, Home, Person, Settings } from '@mui/icons-material'
import { Button, Divider, Paper, Stack, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { TenebrieLogo } from '@/app/components/TenebrieLogo'
import { getOverviewPreferences } from '@/app/features/preferences/selectors'

export const WorldDrawer = () => {
	const { panelOpen } = useSelector(getOverviewPreferences)

	return (
		<Paper
			style={{
				borderRadius: 0,
				width: '384px',
				marginLeft: `${panelOpen ? 0 : -384}px`,
				boxSizing: 'border-box',
				overflowX: 'hidden',
				overflowY: 'scroll',
				transition: 'margin-left 0.3s',
				display: 'flex',
				flexDirection: 'column',
				gap: 16,
				padding: 16,
			}}
			elevation={2}
		>
			<Typography variant="h4">
				<Stack alignItems="center" direction="row" width="100%" justifyContent="center" gap={2}>
					<TenebrieLogo sizeScalar={0.5} />
					Timelines
				</Stack>
			</Typography>
			<Divider />
			<StyledButton variant="contained">
				<Home /> Timeline
			</StyledButton>
			<StyledButton>
				<Event /> Events
			</StyledButton>
			<StyledButton>
				<Person /> Actors
			</StyledButton>
			<Divider />
			<StyledButton>
				<Settings /> Settings
			</StyledButton>
			<StyledButton>
				<Help /> Help
			</StyledButton>
		</Paper>
	)
}

const StyledButton = styled(Button)`
	gap: 6px;
	font-size: 18px !important;
	justify-content: flex-start !important;
	padding: 8px 16px !important;
`
