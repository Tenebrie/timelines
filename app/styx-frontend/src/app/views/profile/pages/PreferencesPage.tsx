import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import {
	getGlobalPreferences,
	getTimelinePreferences,
} from '@/app/features/preferences/PreferencesSliceSelectors'

export function PreferencesPage() {
	const dispatch = useDispatch()
	const { animatedBackground } = useSelector(
		getGlobalPreferences,
		(a, b) => a.animatedBackground === b.animatedBackground,
	)
	const { reduceAnimations } = useSelector(
		getTimelinePreferences,
		(a, b) => a.reduceAnimations === b.reduceAnimations,
	)
	const { setAnimatedBackground, setReduceAnimations } = preferencesSlice.actions

	return (
		<Stack gap={3}>
			<Stack gap={2}>
				<Typography variant="h6" sx={{ fontFamily: 'Inter', fontWeight: 500 }}>
					Preferences
				</Typography>
				<Divider />
			</Stack>
			<Stack gap={1}>
				<FormControlLabel
					control={
						<Checkbox
							checked={animatedBackground}
							onChange={(e) => dispatch(setAnimatedBackground(e.target.checked))}
						/>
					}
					label="Animated background"
				/>
				<Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
					Enables the animated gradient background on most pages. Disable this if you prefer a static
					background or want to reduce GPU usage.
				</Typography>
			</Stack>
			<Stack gap={1}>
				<FormControlLabel
					control={
						<Checkbox
							checked={reduceAnimations}
							onChange={(e) => dispatch(setReduceAnimations(e.target.checked))}
						/>
					}
					label="Reduce animations"
				/>
				<Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
					Reduces all transition animations across the app. Useful for accessibility or if you prefer snappier
					interactions.
				</Typography>
			</Stack>
		</Stack>
	)
}
