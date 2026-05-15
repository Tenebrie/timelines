import { Editor } from '@tiptap/react'
import { useCallback } from 'react'
import styled from 'styled-components'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { PopoverButton } from '@/ui-lib/components/PopoverButton/PopoverButton'

type Props = {
	editor: Editor
}

export function TextColorButton({ editor }: Props) {
	const currentColor = (editor.getAttributes('textStyle').color as string | undefined) ?? null

	const onChangeHex = useCallback(
		(hex: string) => {
			editor.chain().focus().setColor(hex).run()
		},
		[editor],
	)

	return (
		<PopoverButton
			icon={<ColorCircle $color={currentColor} />}
			tooltip="Text color"
			size="medium"
			popoverBody={() => <ColorPicker initialValue={currentColor ?? undefined} onChangeHex={onChangeHex} />}
			popoverAction={() => null}
			popoverSx={{ padding: 2 }}
		/>
	)
}

const ColorCircle = styled.span<{ $color: string | null }>`
	display: block;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background-color: ${({ $color }) => $color ?? 'transparent'};
	border: 2px solid currentColor;
	flex-shrink: 0;
`
