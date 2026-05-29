import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

import { ModalHeaderNative } from './styles'

type Props = {
	children: ReactElement | ReactElement[] | ReactNode | ReactNode[]
	action?: ReactElement | ReactElement[] | ReactNode | ReactNode[]
}

export const ModalHeader = ({ children, action }: Props) => {
	return (
		<ModalHeaderNative>
			<Stack direction="row" justifyContent="space-between">
				{children}
				{action}
			</Stack>
		</ModalHeaderNative>
	)
}
