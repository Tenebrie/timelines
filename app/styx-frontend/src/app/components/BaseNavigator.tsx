import { Stack, useTheme } from '@mui/material'
import React, { ReactElement } from 'react'
import styled from 'styled-components'

import { Announcements } from '../features/announcements/Announcements'
import { SmallProfile } from '../features/auth/smallProfile/SmallProfile'
import { ThemeModeToggle } from '../features/theming/ThemeModeToggle'

const Container = styled.div`
	width: 100%;
	background: ${(props) => (props.theme.palette.mode === 'light' ? '#c2e0ff' : '#07121e')};
	box-shadow: 0 4px 2px -2px ${(props) => (props.theme.palette.mode === 'light' ? '#d8d8d8' : '#214f81')};
	display: flex;
	justify-content: space-between;
	z-index: 2;
	padding-top: 2px;
	padding-bottom: 2px;
`

type Props = {
	children?: ReactElement | ReactElement[]
}

export const BaseNavigator = ({ children }: Props) => {
	const theme = useTheme()

	return (
		<Container theme={theme}>
			<div>{children}</div>
			<Stack direction="row" gap={2}>
				<ThemeModeToggle />
				<Announcements />
				<SmallProfile />
			</Stack>
		</Container>
	)
}
