import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Editor } from '@tiptap/react'
import debounce from 'lodash.debounce'
import { useCallback, useMemo, useRef } from 'react'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'

type Props = {
	editor: Editor
	currentColor: string | null
	onClose: () => void
}

export function TextColorPickerBody({ editor, currentColor, onClose }: Props) {
	const openedRef = useRef(true)
	const savedSelection = useRef({ from: editor.state.selection.from, to: editor.state.selection.to })

	const applyColor = useMemo(
		() =>
			debounce((hex: string) => {
				if (!openedRef.current) {
					return
				}
				editor.chain().focus().setColor(hex).run()
			}, 250),
		[editor],
	)

	const onChangeHex = useCallback(
		(hex: string) => {
			if (!openedRef.current) {
				return
			}
			applyColor(hex)
		},
		[applyColor],
	)

	const onClearColor = useCallback(() => {
		applyColor.cancel()
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
		openedRef.current = false
	}, [editor, onClose, applyColor])

	return (
		<Stack direction="column" gap={1} sx={{ minWidth: 600 }}>
			<ColorPicker initialValue={currentColor ?? undefined} onChangeHex={onChangeHex} />
			<Button
				variant="text"
				color="secondary"
				size="small"
				onClick={onClearColor}
				sx={{ alignSelf: 'flex-end' }}
			>
				Clear color
			</Button>
		</Stack>
	)
}
