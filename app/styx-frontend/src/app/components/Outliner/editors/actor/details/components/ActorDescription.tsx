import { useCallback } from 'react'

import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { RichTextEditorProps } from '@/app/features/richTextEditor/RichTextEditor'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { ActorDraft } from '../draft/useActorDraft'

type Props = {
	id?: string
	draft: ActorDraft
}

export const ActorDescription = ({ id, draft }: Props) => {
	const { key, descriptionRich, setDescription, setDescriptionRich, setMentions } = draft
	const theme = useCustomTheme()

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
			fadeInOverlayColor={theme.custom.palette.background.textEditor}
		/>
	)
}
