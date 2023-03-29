import { Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material'
import { ChangeEvent } from 'react'
import { useDispatch } from 'react-redux'

import { spinnySlice } from '../reducer'

export const SpinnySettings = {
	colors: false,
}

export const SpinnyControls = () => {
	const { setColors, setMultiSpinny, setExtraSpinny } = spinnySlice.actions
	const dispatch = useDispatch()
	const onChangeColors = (event: ChangeEvent<HTMLInputElement>) => {
		dispatch(setColors(event.target.checked))
	}
	const onChangeMultiSpinny = (event: ChangeEvent<HTMLInputElement>) => {
		dispatch(setMultiSpinny(event.target.checked))
	}
	const onChangeExtraSpinny = (event: ChangeEvent<HTMLInputElement>) => {
		dispatch(setExtraSpinny(event.target.checked))
	}
	return (
		<Stack position="absolute" left={32} bottom={16}>
			<FormGroup>
				<FormControlLabel control={<Checkbox onChange={onChangeColors} />} label="Colors" />
				<FormControlLabel control={<Checkbox onChange={onChangeMultiSpinny} />} label="Multi Spinny" />
				<FormControlLabel control={<Checkbox onChange={onChangeExtraSpinny} />} label="Extra Spinny" />
			</FormGroup>
		</Stack>
	)
}
