import { WorldEvent } from '@api/types/worldTypes'
import debounce from 'lodash.debounce'
import { useRef } from 'react'
import { useDispatch } from 'react-redux'

import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { worldSlice } from '@/app/views/world/WorldSlice'

type Props = {
	event: WorldEvent
	autoFocus?: boolean
}

export const EventDescription = ({ event, autoFocus }: Props) => {
	const theme = useCustomTheme()

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

	console.log(event.descriptionRich)

	return (
		<RichTextEditorSummoner
			softKey={event.id}
			value={''}
			onChange={({ plainText, richText }) => {
				debouncedUpdate.current(event.id, plainText, richText)
			}}
			autoFocus={autoFocus}
			fadeInOverlayColor={theme.custom.palette.background.textEditor}
			collaboration={{
				documentId: event.id,
				entityType: 'event',
			}}
		/>
	)
}
