import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Editor } from '@tiptap/react'
import { useCallback, useRef, useState } from 'react'

import { Button } from '@/ui-lib/components/Button/Button'

type Props = {
	editor: Editor
}

type HeadingOption = {
	label: string
	level: 1 | 2 | 3 | null
	fontSize: string
}

const HeadingOptions: HeadingOption[] = [
	{ label: 'Normal text', level: null, fontSize: '0.875rem' },
	{ label: 'Heading 1', level: 1, fontSize: '1.4rem' },
	{ label: 'Heading 2', level: 2, fontSize: '1.15rem' },
	{ label: 'Heading 3', level: 3, fontSize: '1rem' },
] as const

export function HeadingSelect({ editor }: Props) {
	const activeLevel = ([1, 2, 3] as const).find((level) => editor.isActive('heading', { level })) ?? null
	const activeOption = HeadingOptions.find((o) => o.level === activeLevel) ?? HeadingOptions[0]

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

	const handleClose = useCallback(() => {
		setAnchorEl(null)
	}, [])

	const handleSelect = useCallback(
		(option: HeadingOption) => {
			const { from, to } = savedSelection.current
			editor.chain().focus().setTextSelection({ from, to }).run()
			if (option.level === null) {
				editor.chain().focus().setParagraph().run()
			} else {
				editor.chain().focus().toggleHeading({ level: option.level }).run()
			}
			handleClose()
		},
		[editor, handleClose],
	)

	return (
		<>
			<Button
				color="secondary"
				endIcon={<ArrowDropDownIcon />}
				onClick={handleOpen}
				onMouseDown={(e) => e.stopPropagation()}
				sx={{
					minHeight: 44,
					width: 116,
					padding: '0 4px 0 8px',
					fontSize: '0.875rem',
					justifyContent: 'space-between',
				}}
			>
				{activeOption.label}
			</Button>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				onMouseDown={(e) => e.stopPropagation()}
				onClick={(e) => e.stopPropagation()}
				slotProps={{ paper: { sx: { minWidth: 140 } } }}
			>
				{HeadingOptions.map((option) => (
					<MenuItem
						key={option.label}
						selected={option.level === activeLevel}
						onClick={() => handleSelect(option)}
						sx={{ fontSize: option.fontSize, fontWeight: option.level ? 'bold' : 'normal' }}
					>
						{option.label}
					</MenuItem>
				))}
			</Menu>
		</>
	)
}
