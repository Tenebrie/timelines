import Box from '@mui/material/Box'

import { researchSummonable } from '@/app/features/summonable/researchSummonable'

const { Summonable, Summoner } = researchSummonable({ family: 'markerTooltip' })
export const MarkerTooltipSummonable = Summonable

export function MarkerTooltipSummoner() {
	return (
		<Box
			sx={{
				position: 'absolute',
				zIndex: 100,
				top: 0,
				left: 0,
			}}
		>
			{Array(8)
				.fill(0)
				.map((_, index) => (
					<Summoner key={index} />
				))}
		</Box>
	)
}
