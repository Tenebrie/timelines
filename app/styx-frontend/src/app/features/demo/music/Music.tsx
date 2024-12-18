import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useRef, useState } from 'react'
import styled from 'styled-components'

const dataSource: { title: string; playlistPath: string }[] = [
	{
		title: 'Ambient: Cavern',
		playlistPath: '7cgECSzxFYwjHugNdbur1O',
	},
	{
		title: 'Ambient: Forest',
		playlistPath: '5ayvxbK8CveLIj4llcibs2',
	},
	{
		title: 'Ambient: Mystical',
		playlistPath: '47JbzbE2fpng1VU0VeufGU',
	},
	{
		title: 'Ambient: Ocean',
		playlistPath: '0czhzWKJ1qoC9iHH5yN93a',
	},
]

export const Music = () => {
	const [currentTab, setCurrentTab] = useState<number>(0)
	const currentPlaylist = dataSource[currentTab]

	const iframeRef = useRef<HTMLIFrameElement | null>(null)

	return (
		<>
			<Stack justifyContent="space-between">
				<Stack direction="row" gap={10} height="100vh">
					<Stack justifyContent="space-between">
						<StyledTabs
							orientation="vertical"
							variant="scrollable"
							value={currentTab}
							onChange={(_, index) => setCurrentTab(index)}
						>
							{dataSource.map((playlist) => (
								<Tab
									key={playlist.title}
									label={playlist.title}
									sx={{ alignItems: 'start', minWidth: 500 }}
								/>
							))}
						</StyledTabs>
						<Typography variant="caption">
							Playlists by{' '}
							<a href="https://www.reddit.com/r/DnD/comments/788wbn/update_my_curated_spotify_playlists_i_use_for_dd/">
								u/bezoing
							</a>
						</Typography>
					</Stack>
					<Stack minWidth="1000px" height="98%" marginTop="1%">
						{
							<iframe
								ref={iframeRef}
								title={currentPlaylist.title}
								style={{ borderRadius: '12px' }}
								src={`https://open.spotify.com/embed/playlist/${currentPlaylist.playlistPath}?utm_source=generator`}
								width="100%"
								height="99%"
								allowFullScreen={false}
								allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
								loading="lazy"
							></iframe>
						}
					</Stack>
				</Stack>
			</Stack>
		</>
	)
}

const StyledTabs = styled(Tabs)`
	height: 100%;
	padding-top: 8px;
	padding-right: 8px;
	border-right: 1px solid gray;
	& span.MuiTabs-indicator {
		border-radius: 3px;
	}
`
