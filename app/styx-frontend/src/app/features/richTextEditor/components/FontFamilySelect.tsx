import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

type Props = {
	editor: Editor
}

const FONTS = [
	{ label: 'Roboto', value: '' },
	{ label: 'Inter', value: 'Inter, sans-serif' },
] as const

export function FontFamilySelect({ editor }: Props) {
	const currentFont = (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? ''

	const onChange = useCallback(
		(event: SelectChangeEvent) => {
			const value = event.target.value
			if (value === '') {
				editor.chain().focus().unsetFontFamily().run()
			} else {
				editor.chain().focus().setFontFamily(value).run()
			}
		},
		[editor],
	)

	return (
		<Select
			value={currentFont}
			onChange={onChange}
			size="small"
			variant="standard"
			disableUnderline
			displayEmpty
			sx={{
				minWidth: 90,
				height: '44px',
				px: 1,
				fontSize: '0.875rem',
				'& .MuiSelect-select': { paddingTop: 0, paddingBottom: 0 },
			}}
		>
			{FONTS.map(({ label, value }) => (
				<MenuItem key={label} value={value} sx={{ fontFamily: value || 'inherit' }}>
					{label}
				</MenuItem>
			))}
		</Select>
	)
}
