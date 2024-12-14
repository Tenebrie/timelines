import { Divider, Paper, Stack, Typography } from '@mui/material'
import React, { ReactNode } from 'react'

type Props = {
	label?: string
	secondaryLabel?: ReactNode
	children?: ReactNode | ReactNode[]
	style?: React.CSSProperties
	fullHeight?: boolean
	gap?: number
}

export const OutlinedContainer = ({ label, secondaryLabel, children, style, fullHeight, gap }: Props) => {
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
						<Stack width="100%" justifyContent="space-between" direction="row" alignContent="center">
							<Typography variant="h6" marginLeft={1}>
								{label}
							</Typography>
							{secondaryLabel && (
								<Typography variant="body2" marginRight={1} display="flex" alignItems="center">
									{secondaryLabel}
								</Typography>
							)}
						</Stack>
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
