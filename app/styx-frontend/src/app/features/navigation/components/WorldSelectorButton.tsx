import MenuIcon from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { memo, useState } from 'react'
import { useSelector } from 'react-redux'

import { NavigationLink } from '@/app/components/NavigationLink'
import { TrunkatedSpan } from '@/app/components/TrunkatedTypography'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'
import { useWorldListData } from '@/app/views/worldManagement/hooks/useWorldListData'

import { getAuthState } from '../../auth/AuthSliceSelectors'

export const WorldSelectorButton = memo(WorldSelectorButtonComponent)

function WorldSelectorButtonComponent() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const open = Boolean(anchorEl)

	const { user } = useSelector(getAuthState)
	const currentWorldId = useSelector(getWorldIdState)
	const { ownedWorlds, contributableWorlds, visibleWorlds } = useWorldListData()

	const allWorlds = [...ownedWorlds, ...contributableWorlds, ...visibleWorlds]
	const hasWorlds = allWorlds.length > 0

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	const handleWorldSelect = () => {
		handleClose()
	}

	return (
		<>
			<Button
				aria-label="Select world"
				onClick={handleClick}
				disabled={!hasWorlds || !user}
				sx={{
					padding: '8px 15px',
				}}
			>
				<MenuIcon />
			</Button>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				slotProps={{
					paper: {
						sx: {
							marginTop: '6px',
							maxHeight: 400,
							minWidth: 250,
							zIndex: 25,
						},
					},
				}}
			>
				{ownedWorlds.length > 0 && (
					<div>
						<MenuItem disabled sx={{ opacity: '1 !important' }}>
							<Typography variant="caption" color="text.secondary">
								Your worlds
							</Typography>
						</MenuItem>
						{ownedWorlds.map((world) => (
							<NavigationLink to="/world/$worldId/timeline" params={{ worldId: world.id }} key={world.id}>
								<MenuItem onClick={handleWorldSelect} selected={currentWorldId === world.id}>
									<TrunkatedSpan $lines={1}>{world.name}</TrunkatedSpan>
								</MenuItem>
							</NavigationLink>
						))}
					</div>
				)}
				{contributableWorlds.length > 0 && (
					<div>
						<MenuItem disabled sx={{ opacity: '1 !important' }}>
							<Typography variant="caption" color="text.secondary">
								Shared worlds
							</Typography>
						</MenuItem>
						{contributableWorlds.map((world) => (
							<NavigationLink to="/world/$worldId/timeline" params={{ worldId: world.id }} key={world.id}>
								<MenuItem onClick={handleWorldSelect} selected={currentWorldId === world.id} data-hj-suppress>
									<TrunkatedSpan $lines={1}>{world.name}</TrunkatedSpan>
								</MenuItem>
							</NavigationLink>
						))}
					</div>
				)}
				{visibleWorlds.length > 0 && (
					<div>
						<MenuItem disabled sx={{ opacity: '1 !important' }}>
							<Typography variant="caption" color="text.secondary">
								Guest worlds
							</Typography>
						</MenuItem>
						{visibleWorlds.map((world) => (
							<NavigationLink to="/world/$worldId/timeline" params={{ worldId: world.id }} key={world.id}>
								<MenuItem onClick={handleWorldSelect} selected={currentWorldId === world.id} data-hj-suppress>
									<TrunkatedSpan $lines={1}>{world.name}</TrunkatedSpan>
								</MenuItem>
							</NavigationLink>
						))}
					</div>
				)}
			</Menu>
		</>
	)
}
