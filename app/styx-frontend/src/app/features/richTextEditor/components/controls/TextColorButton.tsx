import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Editor, useEditorState } from '@tiptap/react'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import {
	DARK_LUMINANCE_THRESHOLD,
	getColorLuminance,
	LIGHT_LUMINANCE_THRESHOLD,
} from '@/app/utils/colors/getColorLuminance'
import { PopoverButton } from '@/ui-lib/components/PopoverButton/PopoverButton'

import { TextColorPickerBody } from './TextColorPickerBody'

type Props = {
	editor: Editor
}

export function TextColorButton({ editor }: Props) {
	const currentColor = useEditorState({
		editor,
		selector: (ctx) => (ctx.editor.getAttributes('textStyle').color as string | undefined) ?? null,
	})

	const theme = useCustomTheme()
	const defaultColor = theme.material.palette.text.primary
	const isDark = theme.material.palette.mode === 'dark'

	const activeColor = currentColor ?? defaultColor
	const luminance = currentColor ? getColorLuminance(currentColor) : null
	const needsInversion =
		(luminance !== null && luminance < DARK_LUMINANCE_THRESHOLD && isDark) ||
		(luminance !== null && luminance > LIGHT_LUMINANCE_THRESHOLD && !isDark)
	const displayColor = needsInversion ? 'oklch(from var(--text-color) calc(1 - l) c h)' : activeColor

	return (
		<PopoverButton
			content={
				<Stack alignItems="center" justifyContent="center">
					<Box sx={{ fontSize: 13 }}>A</Box>
					<Box
						sx={{
							width: '16px',
							height: '4px',
							marginTop: '-2px',
							paddingLeft: '4px',
							paddingRight: '4px',
							'--text-color': activeColor,
							background: displayColor,
						}}
					/>
				</Stack>
			}
			tooltip="Text color"
			color="secondary"
			size="medium"
			buttonVariant="text"
			buttonSx={{ minWidth: '40px', height: 1 }}
			popoverBody={({ close }) => (
				<TextColorPickerBody editor={editor} currentColor={currentColor} onClose={close} />
			)}
			popoverAction={() => null}
			popoverSx={{ padding: 2 }}
			popoverAlign={{ vertical: 'bottom', horizontal: 'left' }}
		/>
	)
}
