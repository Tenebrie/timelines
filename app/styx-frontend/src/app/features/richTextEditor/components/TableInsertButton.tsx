import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import BorderAllIcon from '@mui/icons-material/BorderAll'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { Editor } from '@tiptap/react'
import { useCallback, useRef, useState } from 'react'

import { Button } from '@/ui-lib/components/Button/Button'
import { PopoverButton } from '@/ui-lib/components/PopoverButton/PopoverButton'

type Props = {
	editor: Editor
}

const GRID_ROWS = 6
const GRID_COLS = 8

export function TableInsertButton({ editor }: Props) {
	const isInTable = editor.isActive('table')
	return isInTable ? <TableOptionsButton editor={editor} /> : <TableGridButton editor={editor} />
}

function TableGridButton({ editor }: Props) {
	return (
		<PopoverButton
			icon={<BorderAllIcon sx={{ fontSize: 18 }} />}
			tooltip="Insert table"
			color="secondary"
			size="medium"
			rippleVariant="button"
			buttonSx={{ minWidth: '40px', minHeight: '44px' }}
			popoverBody={({ close }) => <TableGridPicker editor={editor} onClose={close} />}
			popoverAction={() => null}
			popoverSx={{ padding: 1.5 }}
			popoverAlign={{ vertical: 'bottom', horizontal: 'left' }}
		/>
	)
}

function TableOptionsButton({ editor }: Props) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
	const savedSelection = useRef({ from: 0, to: 0 })

	const handleOpen = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.preventDefault()
			e.stopPropagation()
			savedSelection.current = { from: editor.state.selection.from, to: editor.state.selection.to }
			setAnchorEl(e.currentTarget)
		},
		[editor],
	)

	const handleClose = useCallback(() => setAnchorEl(null), [])

	const run = useCallback(
		(cmd: () => boolean) => {
			cmd()
			handleClose()
		},
		[handleClose],
	)

	return (
		<>
			<Button
				color="secondary"
				endIcon={<ArrowDropDownIcon />}
				onClick={handleOpen}
				onMouseDown={(e) => e.stopPropagation()}
				sx={{ minHeight: 44, minWidth: 40, padding: '0 4px 0 8px', fontSize: '0.875rem' }}
			>
				Table
			</Button>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				onMouseDown={(e) => e.stopPropagation()}
				onClick={(e) => e.stopPropagation()}
				slotProps={{ paper: { sx: { minWidth: 180 } } }}
			>
				<MenuItem onClick={() => run(() => editor.chain().focus().addRowBefore().run())}>
					Insert row above
				</MenuItem>
				<MenuItem onClick={() => run(() => editor.chain().focus().addRowAfter().run())}>
					Insert row below
				</MenuItem>
				<MenuItem onClick={() => run(() => editor.chain().focus().deleteRow().run())}>Delete row</MenuItem>
				<Divider />
				<MenuItem onClick={() => run(() => editor.chain().focus().addColumnBefore().run())}>
					Insert column before
				</MenuItem>
				<MenuItem onClick={() => run(() => editor.chain().focus().addColumnAfter().run())}>
					Insert column after
				</MenuItem>
				<MenuItem onClick={() => run(() => editor.chain().focus().deleteColumn().run())}>
					Delete column
				</MenuItem>
				<Divider />
				<MenuItem
					onClick={() => run(() => editor.chain().focus().deleteTable().run())}
					sx={{ color: 'error.main' }}
				>
					Delete table
				</MenuItem>
			</Menu>
		</>
	)
}

function TableGridPicker({ editor, onClose }: { editor: Editor; onClose: () => void }) {
	const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null)

	const handleClick = (row: number, col: number) => {
		editor.chain().focus().insertTable({ rows: row, cols: col, withHeaderRow: true }).run()
		onClose()
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: `repeat(${GRID_COLS}, 18px)`,
					gap: '2px',
					cursor: 'pointer',
				}}
				onMouseLeave={() => setHovered(null)}
			>
				{Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => {
					const row = Math.floor(i / GRID_COLS) + 1
					const col = (i % GRID_COLS) + 1
					const isActive = hovered !== null && row <= hovered.row && col <= hovered.col
					return (
						<Box
							key={i}
							onMouseEnter={() => setHovered({ row, col })}
							onClick={() => handleClick(row, col)}
							sx={{
								width: 18,
								height: 18,
								border: '1px solid',
								borderColor: isActive ? 'primary.main' : 'divider',
								bgcolor: isActive ? 'primary.main' : 'transparent',
								opacity: isActive ? 0.45 : 1,
								borderRadius: '2px',
							}}
						/>
					)
				})}
			</Box>
			<Typography variant="caption" color="text.secondary" align="center">
				{hovered ? `${hovered.row} × ${hovered.col} table` : 'Select size'}
			</Typography>
		</Box>
	)
}
