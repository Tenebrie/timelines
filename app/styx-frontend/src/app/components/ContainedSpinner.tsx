import styled from 'styled-components'

import { LoadingSpinner } from './LoadingSpinner'

const SmokeScreen = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	border-radius: 8px;
	justify-content: center;
	flex-wrap: wrap;
	overflow: hidden;
	opacity: 0;
	transition: opacity 0.3s;
	transition-delay: 0;
	pointer-events: none;
	z-index: 1;

	&.visible {
		opacity: 1;
		pointer-events: all;
		transition-delay: 0.3s;
	}
`

const Container = styled.div`
	max-width: 256px;
`

type Props = {
	visible: boolean
}

export const ContainedSpinner = ({ visible }: Props) => {
	return (
		<SmokeScreen className={`${visible ? 'visible' : ''}`}>
			<Container>
				<LoadingSpinner />
			</Container>
		</SmokeScreen>
	)
}
