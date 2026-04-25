import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'

type Props = {
	label: string
	mentionCount?: number
	disableGutter?: boolean
}

export function MentionsListSectionHeader({ label, mentionCount, disableGutter }: Props) {
	return (
		<MenuItem key={label} disabled sx={{ marginTop: disableGutter ? 0.25 : 1, paddingBottom: 0 }}>
			<ListItemText>
				<Stack
					direction="row"
					justifyContent={'space-between'}
					sx={{ textTransform: 'uppercase', fontFamily: 'Inter', fontSize: '0.8em' }}
				>
					<span>{label}</span> {mentionCount !== undefined ? <span>{mentionCount}</span> : null}
				</Stack>
			</ListItemText>
		</MenuItem>
	)
}
