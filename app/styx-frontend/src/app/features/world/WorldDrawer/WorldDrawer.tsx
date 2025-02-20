import AutoStories from '@mui/icons-material/AutoStories'
import Home from '@mui/icons-material/Home'
import Person from '@mui/icons-material/Person'
import Settings from '@mui/icons-material/Settings'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { getOverviewPreferences } from '@/app/features/preferences/selectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

import { getWorldState } from '../selectors'
import { WorldHeader } from './WorldHeader'

export const WorldDrawer = () => {
	const { isReadOnly } = useSelector(getWorldState, (a, b) => a.isReadOnly === b.isReadOnly)
	const { panelOpen } = useSelector(getOverviewPreferences)

	const navigate = useNavigate({ from: '/world/$worldId' })

	const matchesTimeline = useCheckRouteMatch('/world/$worldId/timeline')
	const onTimelineClick = () => {
		navigate({ to: '/world/$worldId/timeline', search: true })
	}

	const matchesOverview = useCheckRouteMatch('/world/$worldId/overview')
	const onOverviewClick = () => {
		navigate({
			to: '/world/$worldId/overview',
			search: true,
		})
	}

	const matchesMindmap = useCheckRouteMatch('/world/$worldId/mindmap')
	const onMindmapClick = () => {
		navigate({
			to: '/world/$worldId/mindmap',
			search: true,
		})
	}

	const matchesWiki = useCheckRouteMatch('/world/$worldId/wiki')
	const onWikiClick = () => {
		navigate({
			to: '/world/$worldId/wiki',
			search: true,
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

	const matchesSettings = useCheckRouteMatch('/world/$worldId/settings')
	const onSettingsClick = () => {
		navigate({
			to: '/world/$worldId/settings',
			search: true,
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
						zIndex: 3,
						position: 'absolute',
						borderRadius: 0,
						width: '72px',
						height: '100%',
						left: `${panelOpen ? -72 : 0}px`,
						boxSizing: 'border-box',
						transition: 'left 0.3s',
						display: 'flex',
						flexDirection: 'column',
						padding: '16px 4px',
						justifyContent: 'space-between',
					}}
					elevation={2}
				>
					<Stack sx={{ gap: '8px', flexDirection: 'column' }}>
						<StyledSmallButton variant={getButtonStyle(matchesTimeline)} onClick={onTimelineClick}>
							<Home />
						</StyledSmallButton>
						{/* <StyledSmallButton variant={getButtonStyle(matchesOverview)} onClick={onOverviewClick}> 
							<ViewList />
						</StyledSmallButton> */}
						<StyledSmallButton variant={getButtonStyle(matchesMindmap)} onClick={onMindmapClick}>
							<Person />
						</StyledSmallButton>
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
					</Stack>
				</Paper>
				<Paper
					style={{
						zIndex: 3,
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
					{/* <StyledButton variant={getButtonStyle(matchesOverview)} onClick={onOverviewClick}>
						<ViewList /> Overview
					</StyledButton> */}
					<StyledButton variant={getButtonStyle(matchesMindmap)} onClick={onMindmapClick}>
						<Person /> Actors
					</StyledButton>
					<StyledButton variant={getButtonStyle(matchesWiki)} onClick={onWikiClick}>
						<AutoStories /> Wiki
					</StyledButton>
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
