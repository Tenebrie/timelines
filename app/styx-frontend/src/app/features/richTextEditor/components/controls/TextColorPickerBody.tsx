import Add from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Editor } from '@tiptap/react'
import { useCallback, useRef } from 'react'

import { SavedColors } from '@/app/components/ColorPicker/SavedColors'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Header } from '@/ui-lib/components/Header/Header'

type Props = {
	editor: Editor
	currentColor: string | null
	onClose: () => void
}

export function TextColorPickerBody({ editor, currentColor, onClose }: Props) {
	const savedSelection = useRef({ from: editor.state.selection.from, to: editor.state.selection.to })
	const { open: openCreateColorModal } = useModal('createColorModal')

	const onSelectColor = useCallback(
		(hex: string) => {
			editor.chain().focus().setColor(hex).run()
			onClose()
		},
		[editor, onClose],
	)

	const onClearColor = useCallback(() => {
		const { from, to } = savedSelection.current
		const { tr, schema } = editor.state
		const textStyleType = schema.marks.textStyle

		if (textStyleType) {
			editor.state.doc.nodesBetween(from, to, (node, pos) => {
				if (!node.isText) return true
				const textStyleMark = node.marks.find((m) => m.type === textStyleType)
				if (!textStyleMark) return
				const trimFrom = Math.max(pos, from)
				const trimTo = Math.min(pos + node.nodeSize, to)
				tr.removeMark(trimFrom, trimTo, textStyleType)
				const newAttrs = { ...textStyleMark.attrs, color: null }
				if (Object.values(newAttrs).some((v) => v !== null && v !== '')) {
					tr.addMark(trimFrom, trimTo, textStyleType.create(newAttrs))
				}
			})
		}

		editor.view.dispatch(tr)
		onClose()
	}, [editor, onClose])

	return (
		<Stack direction="column" gap={1.5} sx={{ padding: '6px 12px', width: 280 }}>
			<Header
				endAdornment={
					<Button
						size="small"
						sx={{ minWidth: 0, borderRadius: '50%', padding: 0.35, margin: 0 }}
						color="secondary"
						onClick={() => {
							openCreateColorModal({})
							onClose()
						}}
					>
						<Add />
					</Button>
				}
				variant="h3"
			>
				Text color
			</Header>
			<Stack direction="row" gap={1} flexWrap="wrap" sx={{ maxWidth: 312 }}>
				<SavedColors currentColor={currentColor ?? undefined} onSelectColor={onSelectColor} size={24} />
			</Stack>
			<Stack justifyContent="space-between" alignItems="center" gap={1}>
				<Button
					variant="text"
					color="secondary"
					size="small"
					onClick={onClearColor}
					sx={{ alignSelf: 'flex-end' }}
				>
					Clear color
				</Button>
				<Typography variant="body2" color="text.secondary">
					Colors may change to stay readable in light and dark modes.
				</Typography>
			</Stack>
		</Stack>
	)
}
