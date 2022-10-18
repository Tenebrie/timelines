import React, { useState } from 'react'

import Modal from '../../../../../ui-lib/components/Modal/Modal'
import { StoryEvent } from '../../types'
import { EventEditor } from '../EventEditor/EventEditor'
import { MarkerContainer, MarkerLabel } from './styles'

type Props = {
	event: StoryEvent
}

export const TimelineMarkerInfo = ({ event }: Props) => {
	const [modalVisible, setModalVisible] = useState(false)

	const onClick = () => {
		setModalVisible(true)
	}

	return (
		<div>
			<MarkerContainer>
				<MarkerLabel onClick={onClick}>{event.name}</MarkerLabel>
			</MarkerContainer>

			<Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
				<EventEditor event={event} />
			</Modal>
		</div>
	)
}
