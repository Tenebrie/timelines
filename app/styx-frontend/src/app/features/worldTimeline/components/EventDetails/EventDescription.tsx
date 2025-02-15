import { useCallback } from 'react'

import { RichTextEditorPortalSlot } from '@/app/features/richTextEditor/portals/RichTextEditorPortalSlot'
import { RichTextEditorProps } from '@/app/features/richTextEditor/RichTextEditor'

import { EventDraft } from '../EventEditor/components/EventDetailsEditor/useEventFields'

type Props = {
	id: string
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
		<RichTextEditorPortalSlot
			softKey={`${id}/${key}`}
			value={descriptionRich}
			onChange={onDescriptionChange}
		/>
	)
}
