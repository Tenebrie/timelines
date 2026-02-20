import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import CalendarMonth from '@mui/icons-material/CalendarMonth'
import Home from '@mui/icons-material/Home'
import Public from '@mui/icons-material/Public'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useRef, useState } from 'react'

import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

type Props = {
	disabled?: boolean
}

export function HomeNavigatorButton({ disabled }: Props) {
	const navigate = useStableNavigate()
	const [menuOpen, setMenuOpen] = useState(false)
	const anchorRef = useRef<HTMLButtonElement>(null)

	const isHomeMatching = useCheckRouteMatch('/home')
	const isWorldMatching = useCheckRouteMatch('/world/')
	const isCalendarMatching = useCheckRouteMatch('/calendar/')

	const isAnyMatching = isHomeMatching || isWorldMatching || isCalendarMatching

	const handleHomeClick = () => {
		navigate({ to: '/home' })
	}

	const handleMenuOpen = () => {
		setMenuOpen(true)
	}

	const handleMenuClose = () => {
		setMenuOpen(false)
	}

	const handleNavigate = (route: '/home' | '/world' | '/calendar') => {
		navigate({ to: route })
		setMenuOpen(false)
	}

	return (
		<>
			<ButtonGroup variant={isAnyMatching ? 'contained' : 'text'} disabled={disabled} disableElevation>
				<Button
					aria-label="Navigate to home"
					onClick={handleHomeClick}
					sx={{
						gap: 0.5,
						padding: '8px 15px',
					}}
				>
					<Home /> Home
				</Button>
				<Button
					ref={anchorRef}
					aria-label="Home navigation menu"
					onClick={handleMenuOpen}
					sx={{
						padding: '8px 4px',
					}}
				>
					<ArrowDropDown />
				</Button>
			</ButtonGroup>
			<Menu
				anchorEl={anchorRef.current}
				open={menuOpen}
				onClose={handleMenuClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				<MenuItem
					aria-label="Navigate to worlds"
					onClick={() => handleNavigate('/world')}
					selected={isWorldMatching}
				>
					<ListItemIcon>
						<Public fontSize="small" />
					</ListItemIcon>
					<ListItemText>Worlds</ListItemText>
				</MenuItem>
				<MenuItem
					aria-label="Navigate to calendars"
					onClick={() => handleNavigate('/calendar')}
					selected={isCalendarMatching}
				>
					<ListItemIcon>
						<CalendarMonth fontSize="small" />
					</ListItemIcon>
					<ListItemText>Calendars</ListItemText>
				</MenuItem>
			</Menu>
		</>
	)
}
