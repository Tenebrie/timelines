import TextField from '@mui/material/TextField'

import { isRunningInTest } from '@/test-utils/isRunningInTest'

import { RichTextEditor, RichTextEditorProps } from './RichTextEditor'

export const RichTextEditorWithFallback = (props: RichTextEditorProps) => {
	if (isRunningInTest()) {
		return (
			<TextField
				{...props}
				placeholder="Content"
				onChange={(e) =>
					props.onChange({ plainText: e.target.value, richText: e.target.value, mentions: [] })
				}
			/>
		)
	}

	return <RichTextEditor {...props} />
}
