import { WorldBrief } from '@api/types/worldTypes'
import MenuIcon from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { memo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { TrunkatedSpan } from '@/app/components/TrunkatedTypography'
import { useWorldListData } from '@/app/views/home/hooks/useWorldListData'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export const WorldSelectorButton = memo(WorldSelectorButtonComponent)

function WorldSelectorButtonComponent() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const open = Boolean(anchorEl)
	const navigate = useStableNavigate()
	const dispatch = useDispatch()
	const { unloadWorld } = worldSlice.actions

	const currentWorld = useSelector(getWorldState)
	const { ownedWorlds, contributableWorlds, visibleWorlds } = useWorldListData()

	const allWorlds = [...ownedWorlds, ...contributableWorlds, ...visibleWorlds]
	const hasWorlds = allWorlds.length > 0

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	const handleWorldSelect = (world: WorldBrief) => {
		if (world.id === currentWorld.id) {
			handleClose()
			return
		}

		dispatch(unloadWorld())
		navigate({
			to: '/world/$worldId/timeline',
			params: {
				worldId: world.id,
			},
			search: (prev) => ({
				...prev,
				time: parseInt(world.timeOrigin),
			}),
		})
		handleClose()
	}

	return (
		<>
			<Button
				aria-label="Select world"
				onClick={handleClick}
				disabled={!hasWorlds}
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
							minWidth: 200,
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
							<MenuItem
								key={world.id}
								onClick={() => handleWorldSelect(world)}
								selected={currentWorld.id === world.id}
								data-hj-suppress
							>
								<TrunkatedSpan $lines={1}>{world.name}</TrunkatedSpan>
							</MenuItem>
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
							<MenuItem
								key={world.id}
								onClick={() => handleWorldSelect(world)}
								selected={currentWorld.id === world.id}
								data-hj-suppress
							>
								<TrunkatedSpan $lines={1}>{world.name}</TrunkatedSpan>
							</MenuItem>
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
							<MenuItem
								key={world.id}
								onClick={() => handleWorldSelect(world)}
								selected={currentWorld.id === world.id}
								data-hj-suppress
							>
								<TrunkatedSpan $lines={1}>{world.name}</TrunkatedSpan>
							</MenuItem>
						))}
					</div>
				)}
			</Menu>
		</>
	)
}
