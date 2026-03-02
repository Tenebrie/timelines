import DescriptionIcon from '@mui/icons-material/Description'
import PaletteIcon from '@mui/icons-material/Palette'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import useEvent from 'react-use-event-hook'

import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

type Props = {
	contentTab: React.ReactNode
	illustrationTab: React.ReactNode
}

export function EntityEditorTabs({ contentTab, illustrationTab }: Props) {
	const { tab: defaultTab } = useSearch({ from: '/world/$worldId/_world' })
	const [tab, setTab] = useState(defaultTab)
	const [mountedTabs, setMountedTabs] = useState<Set<number>>(new Set([defaultTab]))
	const navigate = useStableNavigate({ from: '/world/$worldId' })

	const handleChange = useEvent((tab: number) => {
		setTab(tab)
		navigate({
			search: (prev) => ({ ...prev, tab }),
		})
	})

	// Track which tabs have been visited to mount them
	useEffect(() => {
		setMountedTabs((prev) => new Set(prev).add(tab))
	}, [tab])

	return (
		<Stack direction="row" width="100%" height="100%" gap={1} sx={{ flex: 1 }}>
			<Box sx={{ height: '100%', width: '100%', display: tab === 0 ? 'block' : 'none' }}>
				{mountedTabs.has(0) && contentTab}
			</Box>
			<Box sx={{ height: '100%', width: '100%', display: tab === 1 ? 'block' : 'none', marginLeft: -1 }}>
				{mountedTabs.has(1) && illustrationTab}
			</Box>
			{tab !== 0 && <Divider orientation="vertical" />}
			<Tabs
				orientation="vertical"
				value={tab}
				onChange={(_, newValue) => handleChange(newValue)}
				sx={{ marginTop: 0 }}
			>
				<Tab
					value={0}
					icon={<DescriptionIcon />}
					sx={{
						width: '100%',
						borderRadius: 0.75,
						'&:hover': {
							backgroundColor: 'action.hover',
						},
					}}
				/>
				<Tab
					value={1}
					icon={<PaletteIcon />}
					sx={{
						width: '100%',
						borderRadius: 0.75,
						'&:hover': {
							backgroundColor: 'action.hover',
						},
					}}
				/>
			</Tabs>
		</Stack>
	)
}
