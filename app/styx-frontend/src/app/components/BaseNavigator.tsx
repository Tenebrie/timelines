import React, { ReactElement } from 'react'
import styled from 'styled-components'

import { SmallProfile } from '../features/auth/smallProfile/SmallProfile'

const Container = styled.div`
	width: 100%;
	background: #07121e;
	box-shadow: 0 4px 2px -2px #214f81;
	display: flex;
	justify-content: space-between;
	z-index: 2;
`

type Props = {
	children?: ReactElement | ReactElement[]
}

export const BaseNavigator = ({ children }: Props) => {
	return (
		<Container>
			<div>{children}</div>
			<SmallProfile />
		</Container>
	)
}
