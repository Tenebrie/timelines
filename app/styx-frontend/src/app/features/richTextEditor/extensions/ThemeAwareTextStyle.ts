import { mergeAttributes } from '@tiptap/core'
import { TextStyle } from '@tiptap/extension-text-style'

import {
	DARK_LUMINANCE_THRESHOLD,
	getColorLuminance,
	LIGHT_LUMINANCE_THRESHOLD,
} from '@/app/utils/colors/getColorLuminance'

export const ThemeAwareTextStyle = TextStyle.extend({
	renderHTML({ mark, HTMLAttributes }) {
		const color = mark.attrs.color as string | null

		if (!color) {
			return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
		}

		const luminance = getColorLuminance(color)
		if (
			luminance === null ||
			(luminance >= DARK_LUMINANCE_THRESHOLD && luminance <= LIGHT_LUMINANCE_THRESHOLD)
		) {
			return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
		}

		return [
			'span',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				style: `--text-color: ${color}`,
				'data-luminance': luminance < DARK_LUMINANCE_THRESHOLD ? 'dark' : 'light',
			}),
			0,
		]
	},
})
