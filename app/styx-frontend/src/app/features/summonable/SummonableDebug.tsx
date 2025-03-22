import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

import { invokeSummonRepository, invokeSummonWaitingList } from './SummonAuthority'

type DebugInfo = {
	repository: Record<string, { target: HTMLElement | null; status: 'busy' | 'parked' }[]>
	waitingList: Record<string, { target: HTMLElement; props: unknown }[]>
}

function ElementInfo({ element }: { element: HTMLElement | null }) {
	if (!element) return null

	return (
		<Box sx={{ ml: 2, fontSize: '0.8em', color: 'text.secondary' }}>
			<Typography variant="caption" component="div">
				Tag: {element.tagName.toLowerCase()}
			</Typography>
			<Typography variant="caption" component="div">
				ID: {element.id || 'none'}
			</Typography>
			<Typography variant="caption" component="div">
				Classes: {element.className || 'none'}
			</Typography>
		</Box>
	)
}

function StatusChip({ status }: { status: 'busy' | 'parked' }) {
	return <Chip label={status} size="small" color={status === 'busy' ? 'primary' : 'default'} sx={{ ml: 1 }} />
}

export function SummonableDebug() {
	const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)

	useEffect(() => {
		if (process.env.NODE_ENV !== 'development') {
			return
		}

		const updateDebugInfo = () => {
			const repository = invokeSummonRepository()
			const waitingList = invokeSummonWaitingList()

			setDebugInfo({
				repository,
				waitingList,
			})
		}

		// Update initially
		updateDebugInfo()

		// Update on any changes to the document
		const observer = new MutationObserver(updateDebugInfo)
		observer.observe(document.body, { childList: true, subtree: true })

		return () => observer.disconnect()
	}, [])

	if (!debugInfo || process.env.NODE_ENV !== 'development') {
		return null
	}

	return (
		<Paper
			sx={{
				position: 'fixed',
				bottom: 16,
				right: 16,
				p: 2,
				maxWidth: 400,
				maxHeight: 400,
				overflow: 'auto',
				zIndex: 9999,
			}}
		>
			<Box sx={{ mb: 2 }}>
				<Typography variant="subtitle2" gutterBottom sx={{ fontSize: '1.0em' }}>
					Active Summonables
				</Typography>
				{Object.entries(debugInfo.repository).map(([family, items]) => (
					<Box key={family} sx={{ mb: 2 }}>
						<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
							{family}
						</Typography>
						{items.map((item, index) => (
							<Box key={index} sx={{ ml: 2, mb: 1 }}>
								<Box sx={{ display: 'flex', alignItems: 'center' }}>
									<Typography variant="body2">Summonable {index}</Typography>
									<StatusChip status={item.status} />
								</Box>
								<ElementInfo element={item.target} />
							</Box>
						))}
					</Box>
				))}
			</Box>

			<Box>
				<Typography variant="subtitle2" gutterBottom sx={{ fontSize: '1.0em' }}>
					Waiting List
				</Typography>
				{Object.entries(debugInfo.waitingList)
					.filter(([_, items]) => items.length > 0)
					.map(([family, items]) => (
						<Box key={family} sx={{ mb: 2 }}>
							<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
								{family}
							</Typography>
							{items.map((item, index) => (
								<Box key={index} sx={{ ml: 2, mb: 1 }}>
									<Typography variant="body2">Waiting Summoner {index}</Typography>
									<ElementInfo element={item.target} />
								</Box>
							))}
						</Box>
					))}
			</Box>
		</Paper>
	)
}
