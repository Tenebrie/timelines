import { useCallback } from 'react'

import { RichTextEditorPortalSlot } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { RichTextEditorProps } from '@/app/features/richTextEditor/RichTextEditor'

import { ActorDraft } from '../draft/useActorDraft'

type Props = {
	id?: string
	draft: ActorDraft
}

export const ActorDescription = ({ id, draft }: Props) => {
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
			softKey={`${id ?? 'no-key'}/${key}`}
			value={descriptionRich}
			onChange={onDescriptionChange}
		/>
	)
}
