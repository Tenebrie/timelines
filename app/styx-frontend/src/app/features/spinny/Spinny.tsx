import styled from 'styled-components'

import { LoadingSpinner } from '../../components/LoadingSpinner'
import { SpinnyControls } from './components/SpinnyControls'

const SpinnyPageContainer = styled.div`
	display: flex;
	width: 50%;
	height: 50%;
	align-items: center;
	justify-content: center;
`

export const Spinny = () => {
	return (
		<SpinnyPageContainer>
			<LoadingSpinner />
			<SpinnyControls />
		</SpinnyPageContainer>
	)
}
