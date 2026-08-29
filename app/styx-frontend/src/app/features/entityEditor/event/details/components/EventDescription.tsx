import debounce from 'lodash.debounce'
import { useRef } from 'react'
import { useDispatch } from 'react-redux'

import { WorldEvent } from '@/api/types/worldTypes'
import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { worldSlice } from '@/app/views/world/WorldSlice'

type Props = {
	event: WorldEvent
	surface?: string
}

export const EventDescription = ({ event, surface }: Props) => {
	const { updateEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const debouncedUpdate = useRef(
		debounce((eventId: string, plainText: string, richText: string) => {
			dispatch(
				updateEvent({
					id: eventId,
					content: plainText,
					contentRich: richText,
				}),
			)
		}, 500),
	)

	return (
		<RichTextEditorSummoner
			value={event.contentRich}
			onChange={({ plainText, richText }) => {
				debouncedUpdate.current(event.id, plainText, richText)
			}}
			surface={surface}
			collaboration={{
				documentId: event.id,
				entityType: 'event',
			}}
		/>
	)
}
