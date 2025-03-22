import { useCallback } from 'react'

import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { RichTextEditorProps } from '@/app/features/richTextEditor/RichTextEditor'

import { EventDraft } from '../draft/useEventDraft'

type Props = {
	id?: string
	draft: EventDraft
}

export const EventDescription = ({ id, draft }: Props) => {
	const { key, descriptionRich, setDescription, setDescriptionRich, setMentions } = draft

	const onDescriptionChange = useCallback(
		(params: Parameters<RichTextEditorProps['onChange']>[0]) => {
			setDescription(params.plainText)
			setDescriptionRich(params.richText)
			setMentions(params.mentions)
		},
		[setDescription, setDescriptionRich, setMentions],
	)

	return (
		<RichTextEditorSummoner
			softKey={`${id ?? 'no-key'}/${key}`}
			value={descriptionRich}
			onChange={onDescriptionChange}
		/>
	)
}
