import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Editor } from '@tiptap/react'
import { useCallback, useRef, useState } from 'react'

import { Button } from '@/ui-lib/components/Button/Button'

type Props = {
	editor: Editor
}

const AvailableFonts = [
	{ label: 'Roboto', value: '' },
	{ label: 'Inter', value: 'Inter, sans-serif' },
	{ label: 'Georgia', value: 'Georgia, serif' },
	{ label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
	{ label: 'Palatino', value: "'Palatino Linotype', Palatino, serif" },
	{ label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
	{ label: 'Verdana', value: 'Verdana, Geneva, Tahoma, sans-serif' },
	{ label: 'Trebuchet MS', value: "'Trebuchet MS', Helvetica, sans-serif" },
	{ label: 'Courier New', value: "'Courier New', Courier, monospace" },
] as const

function primaryFontName(fontStack: string): string {
	return fontStack
		.split(',')[0]
		.trim()
		.replace(/^['"]|['"]$/g, '')
}

function matchFont(currentFont: string) {
	if (!currentFont) return AvailableFonts[0]
	const exact = AvailableFonts.find((f) => f.value === currentFont)
	if (exact) return exact
	const currentPrimary = primaryFontName(currentFont).toLowerCase()
	return (
		AvailableFonts.find((f) => f.value && primaryFontName(f.value).toLowerCase() === currentPrimary) ?? null
	)
}

export function FontFamilySelect({ editor }: Props) {
	const currentFont = (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? ''
	const matched = matchFont(currentFont)
	const currentLabel = matched?.label ?? primaryFontName(currentFont)
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
		(value: string) => {
			const { from, to } = savedSelection.current

			if (value === '') {
				const { tr, schema, selection } = editor.state
				const textStyleType = schema.marks.textStyle
				if (textStyleType) {
					if (from !== to) {
						editor.state.doc.nodesBetween(from, to, (node, pos) => {
							if (!node.isText) return true
							const textStyleMark = node.marks.find((m) => m.type === textStyleType)
							if (!textStyleMark) return
							const trimFrom = Math.max(pos, from)
							const trimTo = Math.min(pos + node.nodeSize, to)
							tr.removeMark(trimFrom, trimTo, textStyleType)
							const newAttrs = { ...textStyleMark.attrs, fontFamily: null }
							if (Object.values(newAttrs).some((v) => v !== null && v !== '')) {
								tr.addMark(trimFrom, trimTo, textStyleType.create(newAttrs))
							}
						})
					} else {
						// Collapsed cursor: clear fontFamily from the stored/inherited mark
						const storedMark = tr.storedMarks?.find((m) => m.type === textStyleType)
						const docMark = selection.$from.marks().find((m) => m.type === textStyleType)
						const currentAttrs = storedMark?.attrs ?? docMark?.attrs ?? {}
						const newAttrs = { ...currentAttrs, fontFamily: null }
						tr.removeStoredMark(textStyleType)
						if (Object.values(newAttrs).some((v) => v !== null && v !== '')) {
							tr.addStoredMark(textStyleType.create(newAttrs))
						}
					}
				}
				editor.view.dispatch(tr)
			} else {
				editor.chain().focus().setTextSelection({ from, to }).setFontFamily(value).run()
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
					minWidth: 40,
					padding: '0 4px 0 8px',
					fontSize: '0.875rem',
				}}
			>
				{currentLabel}
			</Button>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				onMouseDown={(e) => e.stopPropagation()}
				onClick={(e) => e.stopPropagation()}
				slotProps={{ paper: { sx: { minWidth: 160 } } }}
			>
				{AvailableFonts.map(({ label, value }) => (
					<MenuItem
						key={label}
						selected={value === (matched?.value ?? '')}
						onClick={() => handleSelect(value)}
						sx={{ fontFamily: value || 'Roboto, sans-serif', fontSize: '1rem' }}
					>
						{label}
					</MenuItem>
				))}
			</Menu>
		</>
	)
}
