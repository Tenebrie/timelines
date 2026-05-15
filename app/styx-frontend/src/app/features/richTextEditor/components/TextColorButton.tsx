import { Editor } from '@tiptap/react'

import { PopoverButton } from '@/ui-lib/components/PopoverButton/PopoverButton'

import { TextColorPickerBody } from './TextColorPickerBody'

type Props = {
	editor: Editor
}

export function TextColorButton({ editor }: Props) {
	const currentColor = (editor.getAttributes('textStyle').color as string | undefined) ?? null

	return (
		<PopoverButton
			icon={<ColorCircle color={currentColor} />}
			tooltip="Text color"
			color="secondary"
			size="medium"
			rippleVariant="button"
			buttonSx={{ minWidth: '40px' }}
			popoverBody={({ close }) => (
				<TextColorPickerBody editor={editor} currentColor={currentColor} onClose={close} />
			)}
			popoverAction={() => null}
			popoverSx={{ padding: 2 }}
			popoverAlign={{ vertical: 'bottom', horizontal: 'left' }}
		/>
	)
}

function ColorCircle({ color }: { color: string | null }) {
	return (
		<svg width="18" height="18" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
			<circle cx="8" cy="8" r="4" fill={color ?? 'transparent'} />
			<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
		</svg>
	)
}
