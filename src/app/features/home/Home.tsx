import React from 'react'
import styled from 'styled-components'

import EventEditorModal from '../world/components/EventEditorModal/EventEditorModal'
import { Timeline } from '../world/components/Timeline/Timeline'
import { Sidebar } from './components/sidebar/Sidebar'

const HomePageContainer = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
	align-items: center;
	justify-content: center;
	gap: 64px;
	flex-direction: column;
`

export const Home = () => {
	return (
		<HomePageContainer>
			<Timeline />
			<Sidebar />
			<EventEditorModal />
		</HomePageContainer>
	)
}
