import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import styled from 'styled-components'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

const CodeButton = styled(Button)`
	font-family: 'Roboto Mono', monospace;
	margin: 0;
`

export const TimeTravelModalInfo = () => {
	const theme = useCustomTheme()
	const [infoOpen, setInfoOpen] = useState(false)

	return (
		<>
			<Button variant="outlined" onClick={() => setInfoOpen(!infoOpen)}>
				{infoOpen ? 'Hide' : 'Show'} tutorial
			</Button>
			<Collapse in={infoOpen} sx={{ maxHeight: 350, overflow: 'auto' }}>
				<Typography sx={{ marginTop: theme.material.spacing(1) }}>
					Write a selector to move to a specific time. Examples:
				</Typography>
				<Table
					size="small"
					sx={{
						marginTop: theme.material.spacing(1),
						marginBottom: theme.material.spacing(2),
					}}
				>
					<TableHead>
						<TableRow>
							<TableCell>Absolute time</TableCell>
							<TableCell> </TableCell>
							<TableCell>Relative time</TableCell>
							<TableCell> </TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell>Specific date</TableCell>
							<TableCell>
								<CodeButton>2030-06-20</CodeButton>
							</TableCell>
							<TableCell></TableCell>
							<TableCell></TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Specific time</TableCell>
							<TableCell>
								<CodeButton>14:23</CodeButton>
							</TableCell>
							<TableCell></TableCell>
							<TableCell></TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Set to xx:15</TableCell>
							<TableCell>
								<CodeButton>xx:15</CodeButton>
								<CodeButton>m15</CodeButton>
							</TableCell>
							<TableCell>15 minutes forward:</TableCell>
							<TableCell>
								<CodeButton>15m</CodeButton>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Set to 06:xx</TableCell>
							<TableCell>
								<CodeButton>06:xx</CodeButton>
								<CodeButton>h6</CodeButton>
							</TableCell>
							<TableCell>6 hours forward:</TableCell>
							<TableCell>
								<CodeButton>6h</CodeButton>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Day 3 of the current month:</TableCell>
							<TableCell>
								<CodeButton>d3</CodeButton>
							</TableCell>
							<TableCell>3 days forward:</TableCell>
							<TableCell>
								<CodeButton>3d</CodeButton>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell></TableCell>
							<TableCell></TableCell>
							<TableCell>1 week forward:</TableCell>
							<TableCell>
								<CodeButton>1w</CodeButton>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>March of the current year:</TableCell>
							<TableCell>
								<CodeButton>M3</CodeButton>
							</TableCell>
							<TableCell>3 months forward:</TableCell>
							<TableCell>
								<CodeButton>3M</CodeButton>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Year 2000:</TableCell>
							<TableCell>
								<CodeButton>y2000</CodeButton>
							</TableCell>
							<TableCell>1 year forward:</TableCell>
							<TableCell>
								<CodeButton>1y</CodeButton>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell></TableCell>
							<TableCell></TableCell>
							<TableCell>10 years back:</TableCell>
							<TableCell>
								<CodeButton>-10y</CodeButton>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>00:00 on 2000-01-01:</TableCell>
							<TableCell>
								<CodeButton>y2000!</CodeButton>
							</TableCell>
							<TableCell></TableCell>
							<TableCell></TableCell>
						</TableRow>
						<TableRow>
							<TableCell colSpan={2}>
								Exclamation mark after the selector sets time <i>exactly</i>.
							</TableCell>
							<TableCell></TableCell>
							<TableCell></TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</Collapse>
		</>
	)
}
