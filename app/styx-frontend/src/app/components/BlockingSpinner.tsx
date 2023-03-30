import styled from 'styled-components'

import { LoadingSpinner } from './LoadingSpinner'

const SmokeScreen = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	overflow: hidden;
	background: rgba(0, 0, 0, 0.5);
	opacity: 0;
	transition: opacity 0.3s;
	pointer-events: none;

	&.visible {
		opacity: 1;
		pointer-events: all;
	}
`

const Container = styled.div`
	max-width: 256px;
`

type Props = {
	visible: boolean
}

export const BlockingSpinner = ({ visible }: Props) => {
	return (
		<SmokeScreen className={`${visible ? 'visible' : ''}`}>
			<Container>
				<LoadingSpinner />
			</Container>
		</SmokeScreen>
	)
}
