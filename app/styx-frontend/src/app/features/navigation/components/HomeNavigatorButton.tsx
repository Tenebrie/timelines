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

import { NavigationLink } from '@/app/components/NavigationLink'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

type Props = {
	disabled?: boolean
}

export function HomeNavigatorButton({ disabled }: Props) {
	const [menuOpen, setMenuOpen] = useState(false)
	const anchorRef = useRef<HTMLButtonElement>(null)

	const isHomeMatching = useCheckRouteMatch('/home')
	const isWorldMatching = useCheckRouteMatch('/world/')
	const isCalendarMatching = useCheckRouteMatch('/calendar/')

	const isAnyMatching = isHomeMatching || isWorldMatching || isCalendarMatching

	const handleMenuOpen = () => {
		setMenuOpen(true)
	}

	const handleMenuClose = () => {
		setMenuOpen(false)
	}

	return (
		<>
			<ButtonGroup variant={isAnyMatching ? 'contained' : 'text'} disabled={disabled} disableElevation>
				<NavigationLink to="/home">
					<Button
						aria-label="Navigate to home"
						sx={{
							gap: 0.5,
							padding: '8px 15px',
						}}
					>
						<Home /> Home
					</Button>
				</NavigationLink>

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
				<NavigationLink to="/world">
					<MenuItem aria-label="Navigate to worlds" onClick={handleMenuClose} selected={isWorldMatching}>
						<ListItemIcon>
							<Public fontSize="small" />
						</ListItemIcon>
						<ListItemText>Worlds</ListItemText>
					</MenuItem>
				</NavigationLink>
				<NavigationLink to="/calendar">
					<MenuItem
						aria-label="Navigate to calendars"
						onClick={handleMenuClose}
						selected={isCalendarMatching}
					>
						<ListItemIcon>
							<CalendarMonth fontSize="small" />
						</ListItemIcon>
						<ListItemText>Calendars</ListItemText>
					</MenuItem>
				</NavigationLink>
			</Menu>
		</>
	)
}
