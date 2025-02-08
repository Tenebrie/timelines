import AutoStories from '@mui/icons-material/AutoStories'
import Home from '@mui/icons-material/Home'
import Settings from '@mui/icons-material/Settings'
import ViewList from '@mui/icons-material/ViewList'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { getOverviewPreferences } from '@/app/features/preferences/selectors'

import { getWorldState } from '../selectors'
import { WorldHeader } from './components/WorldHeader'

export const WorldDrawer = () => {
	const { id: worldId, isReadOnly } = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.isReadOnly === b.isReadOnly,
	)
	const { panelOpen } = useSelector(getOverviewPreferences)
	const navigate = useNavigate()

	const matchesTimeline = !!useMatch({ from: '/world/$worldId/_world/timeline', shouldThrow: false })
	const onTimelineClick = () => {
		navigate({
			to: '/world/$worldId/timeline/outliner',
			params: {
				worldId,
			},
		})
		// navigateToOutliner(store.getState().world.selectedTime, true)
	}

	const matchesOverview = !!useMatch({ from: '/world/$worldId/_world/overview', shouldThrow: false })
	const onOverviewClick = () => {
		navigate({
			to: '/world/$worldId/overview',
			params: {
				worldId,
			},
		})
	}

	const matchesWiki = !!useMatch({ from: '/world/$worldId/_world/wiki', shouldThrow: false })
	const onWikiClick = () => {
		navigate({
			to: '/world/$worldId/wiki',
			params: {
				worldId,
			},
		})
	}

	// const onActorsClick = () => {
	// 	navigateTo({
	// 		target: worldRoutes.actors,
	// 		args: {
	// 			worldId,
	// 		},
	// 	})
	// }

	const matchesSettings = !!useMatch({ from: '/world/$worldId/_world/settings', shouldThrow: false })
	const onSettingsClick = () => {
		navigate({
			to: '/world/$worldId/settings',
			params: {
				worldId,
			},
		})
	}

	const getButtonStyle = useCallback((matches: boolean) => {
		return matches ? 'contained' : 'text'
	}, [])

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
					<StyledSmallButton variant={getButtonStyle(matchesTimeline)} onClick={onTimelineClick}>
						<Home />
					</StyledSmallButton>
					<StyledSmallButton variant={getButtonStyle(matchesOverview)} onClick={onOverviewClick}>
						<ViewList />
					</StyledSmallButton>
					{/* <StyledSmallButton variant={getButtonStyle(worldRoutes.actors)} onClick={onActorsClick}>
						<Person />
					</StyledSmallButton> */}
					<StyledSmallButton variant={getButtonStyle(matchesWiki)} onClick={onWikiClick}>
						<AutoStories />
					</StyledSmallButton>
					{!isReadOnly && (
						<>
							<Divider />
							<StyledSmallButton variant={getButtonStyle(matchesSettings)} onClick={onSettingsClick}>
								<Settings />
							</StyledSmallButton>
						</>
					)}
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
					<StyledButton variant={getButtonStyle(matchesTimeline)} onClick={onTimelineClick}>
						<Home /> Timeline
					</StyledButton>
					<StyledButton variant={getButtonStyle(matchesOverview)} onClick={onOverviewClick}>
						<ViewList /> Overview
					</StyledButton>
					<StyledButton variant={getButtonStyle(matchesWiki)} onClick={onWikiClick}>
						<AutoStories /> Wiki
					</StyledButton>
					{/* <StyledButton variant={getButtonStyle(worldRoutes.actors)} onClick={onActorsClick}>
						<Person /> Actors
					</StyledButton> */}
					{!isReadOnly && (
						<>
							<Divider />
							<StyledButton variant={getButtonStyle(matchesSettings)} onClick={onSettingsClick}>
								<Settings /> Settings
							</StyledButton>
						</>
					)}
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
