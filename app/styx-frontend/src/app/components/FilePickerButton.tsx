import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Button from '@mui/material/Button'
import styled from 'styled-components'

type Props = {
	onSelect: (fileList: FileList) => void
	multiple?: boolean
}

export function FilePickerButton({ onSelect, multiple }: Props) {
	return (
		<Button
			component="label"
			role={undefined}
			variant="contained"
			tabIndex={-1}
			startIcon={<CloudUploadIcon />}
		>
			Upload files
			<VisuallyHiddenInput
				type="file"
				onChange={(event) => {
					if (event.target.files) {
						onSelect(event.target.files!)
					}
				}}
				multiple={multiple}
			/>
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
