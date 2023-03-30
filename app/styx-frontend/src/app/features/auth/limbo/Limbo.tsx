import React, { useEffect } from 'react'
import styled from 'styled-components'

import { useCheckAuthenticationQuery } from '../../../../api/rheaApi'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { useAppRouter } from '../../world/router'

const LimboPageContainer = styled.div`
	display: flex;
	width: 25%;
	height: 25%;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`

export const Limbo = () => {
	const { data } = useCheckAuthenticationQuery()
	const { navigateToHomeWithoutHistory, navigateToLoginWithoutHistory } = useAppRouter()

	useEffect(() => {
		if (!data) {
			return
		}

		if (data.authenticated) {
			navigateToHomeWithoutHistory()
		} else {
			navigateToLoginWithoutHistory()
		}
	}, [data, navigateToHomeWithoutHistory, navigateToLoginWithoutHistory])

	return (
		<LimboPageContainer>
			<LoadingSpinner />
		</LimboPageContainer>
	)
}
