import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { MouseEvent, useState } from 'react'
import { useSelector } from 'react-redux'

import {
	useCreateWorldColorMutation,
	useDeleteWorldColorMutation,
	useGetWorldColorsQuery,
} from '@/api/worldColorApi'
import { colorStringToHsl } from '@/app/utils/colors/colorStringToHsl'
import { hslToHex } from '@/app/utils/colors/hslToHex'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	currentColor: string
	onSelectColor: (color: string) => void
}

const getContrastingBorderColor = (
	color: string,
	isSelected: boolean,
	isHover: boolean,
	isDarkMode: boolean,
) => {
	try {
		const hsl = colorStringToHsl(color)

		// Exception: if lightness > 80%, reverse the logic
		const shouldGoLighter = hsl.l > 0.8 ? !isDarkMode : isDarkMode

		// For selected state, create strong contrast
		if (isSelected) {
			const adjustment = isHover ? (shouldGoLighter ? 0.5 : -0.5) : shouldGoLighter ? 0.4 : -0.4
			const newL = Math.max(0, Math.min(1, hsl.l + adjustment))
			return hslToHex(hsl.h, Math.max(0.3, hsl.s), newL)
		}

		// For hover on non-selected, moderate contrast
		if (isHover) {
			const adjustment = shouldGoLighter ? 0.35 : -0.35
			const newL = Math.max(0, Math.min(1, hsl.l + adjustment))
			return hslToHex(hsl.h, Math.max(0.3, hsl.s), newL)
		}

		return 'transparent'
	} catch {
		return isSelected ? (isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)') : 'transparent'
	}
}

export function SavedColors({ currentColor, onSelectColor }: Props) {
	const theme = useTheme()
	const isDarkMode = theme.palette.mode === 'dark'
	const worldId = useSelector(getWorldIdState)
	const { data: savedColors = [] } = useGetWorldColorsQuery({ worldId })
	const [createColor] = useCreateWorldColorMutation()
	const [deleteColor] = useDeleteWorldColorMutation()

	const [contextMenu, setContextMenu] = useState<{
		mouseX: number
		mouseY: number
		colorId: string
	} | null>(null)

	const [labelPopover, setLabelPopover] = useState<{ anchorEl: HTMLElement } | null>(null)
	const [labelInput, setLabelInput] = useState('')

	const handleContextMenu = (event: MouseEvent, colorId: string) => {
		event.preventDefault()
		setContextMenu({
			mouseX: event.clientX + 2,
			mouseY: event.clientY - 6,
			colorId,
		})
	}

	const handleCloseContextMenu = () => {
		setContextMenu(null)
	}

	const handleDeleteColor = () => {
		if (contextMenu) {
			deleteColor({ worldId, colorId: contextMenu.colorId })
		}
		handleCloseContextMenu()
	}

	const handleAddColor = (event: MouseEvent<HTMLButtonElement>) => {
		setLabelPopover({ anchorEl: event.currentTarget })
	}

	const handleCloseLabelPopover = () => {
		setLabelPopover(null)
		setLabelInput('')
	}

	const handleSaveColor = () => {
		createColor({ worldId, body: { value: currentColor, label: labelInput || undefined } })
		handleCloseLabelPopover()
	}

	return (
		<>
			<Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
				{savedColors.map((savedColor) => {
					const isSelected = savedColor.value === currentColor
					const tooltipTitle = savedColor.label ? (
						<>
							{savedColor.label}
							<br />
							{savedColor.value}
						</>
					) : (
						savedColor.value
					)
					return (
						<Tooltip key={savedColor.id} title={tooltipTitle}>
							<Box
								onClick={() => onSelectColor(savedColor.value)}
								onContextMenu={(e) => handleContextMenu(e, savedColor.id)}
								sx={{
									width: 32,
									height: 32,
									backgroundColor: savedColor.value,
									borderRadius: '6px',
									cursor: 'pointer',
									border: '3px solid',
									borderColor: getContrastingBorderColor(savedColor.value, isSelected, false, isDarkMode),
									transition: 'border-color 0.2s ease',
									'&:hover': {
										borderColor: getContrastingBorderColor(savedColor.value, isSelected, true, isDarkMode),
									},
								}}
							/>
						</Tooltip>
					)
				})}
				<Tooltip title="Save current color">
					<Button size="small" onClick={handleAddColor} sx={{ width: 30, height: 30, minWidth: 'unset' }}>
						<AddIcon />
					</Button>
				</Tooltip>
			</Stack>
			<Menu
				open={contextMenu !== null}
				onClose={handleCloseContextMenu}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
				}
			>
				<MenuItem onClick={handleDeleteColor}>Delete</MenuItem>
			</Menu>
			<Popover
				open={Boolean(labelPopover)}
				anchorEl={labelPopover?.anchorEl}
				onClose={handleCloseLabelPopover}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
			>
				<Stack p={2} gap={1.5}>
					<TextField
						autoFocus
						size="small"
						label="Color label (optional)"
						value={labelInput}
						onChange={(e) => setLabelInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleSaveColor()
							} else if (e.key === 'Escape') {
								handleCloseLabelPopover()
							}
						}}
					/>
					<Stack direction="row" gap={1} justifyContent="flex-end">
						<Button size="small" onClick={handleCloseLabelPopover}>
							Cancel
						</Button>
						<Button size="small" variant="contained" onClick={handleSaveColor}>
							Save
						</Button>
					</Stack>
				</Stack>
			</Popover>
			<Popover
				open={Boolean(labelPopover)}
				anchorEl={labelPopover?.anchorEl}
				onClose={handleCloseLabelPopover}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
			>
				<Stack p={2} gap={1.5}>
					<TextField
						autoFocus
						size="small"
						label="Color label (optional)"
						value={labelInput}
						onChange={(e) => setLabelInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleSaveColor()
							} else if (e.key === 'Escape') {
								handleCloseLabelPopover()
							}
						}}
					/>
					<Stack direction="row" gap={1} justifyContent="flex-end">
						<Button size="small" onClick={handleCloseLabelPopover}>
							Cancel
						</Button>
						<Button size="small" variant="contained" onClick={handleSaveColor}>
							Save
						</Button>
					</Stack>
				</Stack>
			</Popover>
		</>
	)
}
