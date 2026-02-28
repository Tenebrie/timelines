import AutoStories from '@mui/icons-material/AutoStories'
import Home from '@mui/icons-material/Home'
import Person from '@mui/icons-material/Person'
import Settings from '@mui/icons-material/Settings'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { NavigationLink } from '@/app/components/NavigationLink'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

export const WorldSidebar = () => {
	const { isReadOnly } = useSelector(getWorldState, (a, b) => a.isReadOnly === b.isReadOnly)

	const matchesTimeline = useCheckRouteMatch('/world/$worldId/timeline')
	const matchesMindmap = useCheckRouteMatch('/world/$worldId/mindmap')
	const matchesWiki = useCheckRouteMatch('/world/$worldId/wiki')
	const matchesSettings = useCheckRouteMatch('/world/$worldId/settings')

	const getButtonStyle = useCallback((matches: boolean) => {
		return matches ? 'contained' : 'text'
	}, [])

	return (
		<>
			<Box
				sx={{
					height: '100%',
					position: 'relative',
					width: '72px',
					flexShrink: 0,
					transition: 'width 0.3s',
				}}
			>
				<Paper
					style={{
						zIndex: 7,
						position: 'absolute',
						borderRadius: 0,
						width: '72px',
						height: '100%',
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
						<NavigationLink to="/world/$worldId/timeline" search={true} from="/world/$worldId">
							<StyledSmallButton variant={getButtonStyle(matchesTimeline)}>
								<Home />
							</StyledSmallButton>
						</NavigationLink>
						{/* <StyledSmallButton variant={getButtonStyle(matchesOverview)} onClick={onOverviewClick}> 
							<ViewList />
						</StyledSmallButton> */}
						<NavigationLink to="/world/$worldId/mindmap" search={true} from="/world/$worldId">
							<StyledSmallButton variant={getButtonStyle(matchesMindmap)}>
								<Person />
							</StyledSmallButton>
						</NavigationLink>
						<NavigationLink to="/world/$worldId/wiki" search={true} from="/world/$worldId">
							<StyledSmallButton variant={getButtonStyle(matchesWiki)}>
								<AutoStories />
							</StyledSmallButton>
						</NavigationLink>
						{!isReadOnly && (
							<>
								<Divider />
								<NavigationLink to="/world/$worldId/settings" search={true} from="/world/$worldId">
									<StyledSmallButton variant={getButtonStyle(matchesSettings)}>
										<Settings />
									</StyledSmallButton>
								</NavigationLink>
							</>
						)}
						{/* <StyledSmallButton> */}
						{/* <Help /> */}
						{/* </StyledSmallButton> */}
					</Stack>
				</Paper>
			</Box>
		</>
	)
}

const StyledSmallButton = styled(Button)`
	gap: 6px;
	padding: 8px 16px !important;
`
