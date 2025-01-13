import TextField from '@mui/material/TextField'

import { isRunningInTest } from '@/jest/isRunningInTest'

import { RichTextEditor } from './RichTextEditor'

type Props = {
	value: string
	onChange: (params: { plainText: string; richText: string; mentions: string[] }) => void
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
