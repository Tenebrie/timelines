import TextField from '@mui/material/TextField'

import { isRunningInTest } from '@/jest/isRunningInTest'

import { OnChangeParams, RichTextEditor } from './RichTextEditor'

type Props = {
	value: string
	onChange: (params: OnChangeParams) => void
}

export const RichTextEditorWithFallback = ({ value, onChange }: Props) => {
	if (isRunningInTest()) {
		return (
			<TextField
				value={value}
				placeholder="Content"
				onChange={(e) => onChange({ plainText: e.target.value, richText: e.target.value, mentions: [] })}
			/>
		)
	}

	return <RichTextEditor value={value} onChange={onChange} />
}
