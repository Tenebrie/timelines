import { Stack } from '@mui/material'
import { ReactElement } from 'react'

type Props = {
	children: ReactElement | ReactElement[]
}

export const ModalFooter = ({ children }: Props) => {
	return (
		<Stack direction="row-reverse" spacing={2}>
			{children}
		</Stack>
	)
}
