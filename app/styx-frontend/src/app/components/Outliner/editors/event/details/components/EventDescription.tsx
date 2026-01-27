import { useGetWorldEventContentQuery } from '@api/worldEventApi'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { EventDraft } from '../draft/useEventDraft'

type Props = {
	id?: string
	draft: EventDraft
	autoFocus?: boolean
}

export const EventDescription = ({ id, draft, autoFocus }: Props) => {
	const { key } = draft
	const worldId = useSelector(getWorldIdState)
	const requestFocus = useEventBusDispatch['richEditor/requestFocus']()
	const { data, isLoading } = useGetWorldEventContentQuery(
		{
			worldId,
			eventId: id ?? '',
		},
		{
			skip: !id,
		},
	)
	const theme = useCustomTheme()

	useEffect(() => {
		if (autoFocus) {
			// Small delay to ensure the editor is mounted
			setTimeout(() => {
				requestFocus()
			}, 1)
		}
	}, [autoFocus, requestFocus])

	if (!id) {
		return null
	}

	return (
		<RichTextEditorSummoner
			softKey={`${id ?? 'no-key'}/${key}`}
			value={data?.contentRich ?? ''}
			onChange={() => {}}
			fadeInOverlayColor={theme.custom.palette.background.textEditor}
			collaboration={{
				worldId,
				entityType: 'event',
				documentId: id ?? '',
			}}
			isLoading={isLoading}
		/>
	)
}
