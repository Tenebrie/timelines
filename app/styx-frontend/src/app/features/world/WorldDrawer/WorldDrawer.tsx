import { Home, Person, Settings, ViewList } from '@mui/icons-material'
import { Box, Button, Divider, Paper } from '@mui/material'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { getOverviewPreferences } from '@/app/features/preferences/selectors'
import { useWorldRouter, worldRoutes } from '@/router/routes/worldRoutes'
import { useWorldTimelineRouter } from '@/router/routes/worldTimelineRoutes'

import { getWorldIdState } from '../../worldTimeline/selectors'
import { WorldHeader } from './components/WorldHeader'

export const WorldDrawer = () => {
	const worldId = useSelector(getWorldIdState)

	const { panelOpen } = useSelector(getOverviewPreferences)
	const { navigateTo, isLocationChildOf } = useWorldRouter()
	const { navigateToOutliner } = useWorldTimelineRouter()

	const onTimelineClick = () => {
		navigateToOutliner()
	}

	const onOverviewClick = () => {
		navigateTo({
			target: worldRoutes.overview,
			args: {
				worldId,
			},
		})
	}

	const onActorsClick = () => {
		navigateTo({
			target: worldRoutes.actors,
			args: {
				worldId,
			},
		})
	}

	const onSettingsClick = () => {
		navigateTo({
			target: worldRoutes.settings,
			args: {
				worldId,
			},
		})
	}

	const getButtonStyle = useCallback(
		(route: (typeof worldRoutes)[keyof typeof worldRoutes]) => {
			if (isLocationChildOf(route)) {
				return 'contained'
			}
			return 'text'
		},
		[isLocationChildOf],
	)

	return (
		<>
			<Box
				sx={{
					height: '100%',
					position: 'relative',
					width: panelOpen ? '300px' : '72px',
					flexShrink: 0,
					transition: 'width 0.3s',
				}}
			>
				<Paper
					style={{
						position: 'absolute',
						borderRadius: 0,
						width: '72px',
						height: '100%',
						left: `${panelOpen ? -72 : 0}px`,
						boxSizing: 'border-box',
						transition: 'left 0.3s',
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
						padding: '16px 4px',
					}}
					elevation={2}
				>
					<StyledSmallButton variant={getButtonStyle(worldRoutes.timeline)} onClick={onTimelineClick}>
						<Home />
					</StyledSmallButton>
					<StyledSmallButton variant={getButtonStyle(worldRoutes.overview)} onClick={onOverviewClick}>
						<ViewList />
					</StyledSmallButton>
					<StyledSmallButton variant={getButtonStyle(worldRoutes.actors)} onClick={onActorsClick}>
						<Person />
					</StyledSmallButton>
					<Divider />
					<StyledSmallButton variant={getButtonStyle(worldRoutes.settings)} onClick={onSettingsClick}>
						<Settings />
					</StyledSmallButton>
					{/* <StyledSmallButton> */}
					{/* <Help /> */}
					{/* </StyledSmallButton> */}
				</Paper>
				<Paper
					style={{
						zIndex: 1,
						position: 'absolute',
						borderRadius: 0,
						width: '300px',
						height: '100%',
						left: `${panelOpen ? 0 : -300}px`,
						boxSizing: 'border-box',
						transition: 'left 0.3s',
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
						padding: 16,
					}}
					elevation={2}
				>
					<WorldHeader />
					<Divider />
					<StyledButton variant={getButtonStyle(worldRoutes.timeline)} onClick={onTimelineClick}>
						<Home /> Timeline
					</StyledButton>
					<StyledButton variant={getButtonStyle(worldRoutes.overview)} onClick={onOverviewClick}>
						<ViewList /> Overview
					</StyledButton>
					<StyledButton variant={getButtonStyle(worldRoutes.actors)} onClick={onActorsClick}>
						<Person /> Actors
					</StyledButton>
					<Divider />
					<StyledButton variant={getButtonStyle(worldRoutes.settings)} onClick={onSettingsClick}>
						<Settings /> Settings
					</StyledButton>
					{/* <StyledButton> */}
					{/* <Help /> Help */}
					{/* </StyledButton> */}
				</Paper>
			</Box>
		</>
	)
}

const StyledButton = styled(Button)`
	gap: 6px;
	justify-content: flex-start !important;
	padding: 8px 16px !important;
`

const StyledSmallButton = styled(Button)`
	gap: 6px;
	padding: 8px 16px !important;
`