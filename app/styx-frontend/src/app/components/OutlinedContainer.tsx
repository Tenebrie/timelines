import { Divider, Paper, Stack, Typography } from '@mui/material'
import React, { ReactNode } from 'react'

type Props = {
	label?: string
	children?: ReactNode | ReactNode[]
	style?: React.CSSProperties
	fullHeight?: boolean
	gap?: number
}

export const OutlinedContainer = ({ label, children, style, fullHeight, gap }: Props) => {
	return (
		<Paper
			sx={{
				padding: 2,
				paddingTop: 3,
				height: fullHeight ? 'calc(100% - 16px)' : 'unset',
				maxHeight: 'calc(100% - 16px)',
				overflowY: 'auto',
			}}
			elevation={2}
			style={style}
		>
			<Stack gap={gap ?? 1} sx={{ height: fullHeight ? '100%' : 'unset' }}>
				{label && (
					<Stack gap={1}>
						<Typography variant="h6" marginLeft={1}>
							{label}
						</Typography>
						<Divider />
					</Stack>
				)}
				<Stack gap={1} sx={{ height: fullHeight ? '100%' : 'unset' }}>
					{children}
				</Stack>
			</Stack>
		</Paper>
	)
}
