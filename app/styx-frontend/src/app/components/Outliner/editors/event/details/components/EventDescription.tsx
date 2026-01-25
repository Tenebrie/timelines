import { useCallback, useEffect } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { RichTextEditorProps } from '@/app/features/richTextEditor/RichTextEditor'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { EventDraft } from '../draft/useEventDraft'

type Props = {
	id?: string
	draft: EventDraft
	autoFocus?: boolean
}

export const EventDescription = ({ id, draft, autoFocus }: Props) => {
	const { key, descriptionRich, setDescription, setDescriptionRich, setMentions } = draft
	const requestFocus = useEventBusDispatch['richEditor/requestFocus']()
	const theme = useCustomTheme()

	const onDescriptionChange = useCallback(
		(params: Parameters<RichTextEditorProps['onChange']>[0]) => {
			setDescription(params.plainText)
			setDescriptionRich(params.richText)
			setMentions(params.mentions)
		},
		[setDescription, setDescriptionRich, setMentions],
	)

	useEffect(() => {
		if (autoFocus) {
			// Small delay to ensure the editor is mounted
			setTimeout(() => {
				requestFocus()
			}, 1)
		}
	}, [autoFocus, requestFocus])

	return (
		<RichTextEditorSummoner
			softKey={`${id ?? 'no-key'}/${key}`}
			value={descriptionRich}
			onChange={onDescriptionChange}
			fadeInOverlayColor={theme.custom.palette.background.textEditor}
		/>
	)
}
