import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Modal from '../../../../../ui-lib/components/Modal/Modal'
import { worldSlice } from '../../reducer'
import { getWorldState } from '../../selectors'
import { StoryEvent } from '../../types'
import { EventEditor } from '../EventEditor/EventEditor'

const EventEditorModal = () => {
	const [currentEvent, setCurrentEvent] = useState<StoryEvent | null>()

	const { editorEvent } = useSelector(getWorldState)

	const dispatch = useDispatch()
	const { updateEditorEvent, flushEditorEvent } = worldSlice.actions

	useEffect(() => {
		if (editorEvent) {
			setCurrentEvent(editorEvent)
		}
	}, [setCurrentEvent, editorEvent])

	return (
		<Modal visible={!!editorEvent} onClose={() => dispatch(flushEditorEvent())}>
			{currentEvent && (
				<EventEditor event={currentEvent} onUpdate={(event) => dispatch(updateEditorEvent(event))} />
			)}
		</Modal>
	)
}

export default EventEditorModal
