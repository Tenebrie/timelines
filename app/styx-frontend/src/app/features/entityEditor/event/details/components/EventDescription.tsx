import { WorldEvent } from '@api/types/worldTypes'
import debounce from 'lodash.debounce'
import { useRef } from 'react'
import { useDispatch } from 'react-redux'

import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { worldSlice } from '@/app/views/world/WorldSlice'

type Props = {
	event: WorldEvent
	autoFocus?: boolean
	surface?: string
}

export const EventDescription = ({ event, autoFocus, surface }: Props) => {
	const { updateEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const debouncedUpdate = useRef(
		debounce((eventId: string, plainText: string, richText: string) => {
			dispatch(
				updateEvent({
					id: eventId,
					description: plainText,
					descriptionRich: richText,
				}),
			)
		}, 500),
	)

	return (
		<RichTextEditorSummoner
			value={event.descriptionRich}
			onChange={({ plainText, richText }) => {
				debouncedUpdate.current(event.id, plainText, richText)
			}}
			autoFocus={autoFocus}
			surface={surface}
			collaboration={{
				documentId: event.id,
				entityType: 'event',
			}}
		/>
	)
}
