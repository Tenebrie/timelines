import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Editor } from '@tiptap/react'

import {
	DARK_LUMINANCE_THRESHOLD,
	getColorLuminance,
	LIGHT_LUMINANCE_THRESHOLD,
} from '@/app/utils/colors/getColorLuminance'
import { PopoverButton } from '@/ui-lib/components/PopoverButton/PopoverButton'

import { useCustomTheme } from '../../theming/hooks/useCustomTheme'
import { TextColorPickerBody } from './TextColorPickerBody'

type Props = {
	editor: Editor
}

export function TextColorButton({ editor }: Props) {
	const currentColor = (editor.getAttributes('textStyle').color as string | undefined) ?? null

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
			icon={
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
