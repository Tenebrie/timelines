import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Button from '@mui/material/Button'
import styled from 'styled-components'

export function FilePickerButton() {
	return (
		<Button
			component="label"
			role={undefined}
			variant="contained"
			tabIndex={-1}
			startIcon={<CloudUploadIcon />}
		>
			Upload files
			<VisuallyHiddenInput type="file" onChange={(event) => console.log(event.target.files)} multiple />
		</Button>
	)
}

const VisuallyHiddenInput = styled('input')({
	clip: 'rect(0 0 0 0)',
	clipPath: 'inset(50%)',
	height: 1,
	overflow: 'hidden',
	position: 'absolute',
	bottom: 0,
	left: 0,
	whiteSpace: 'nowrap',
	width: 1,
})
