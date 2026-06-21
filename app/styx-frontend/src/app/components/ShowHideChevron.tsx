import ChevronLeft from '@mui/icons-material/ChevronLeft'

export const ShowHideChevron = ({ collapsed }: { collapsed: boolean }) => {
	return (
		<ChevronLeft
			sx={{ transform: collapsed ? 'rotate(270deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }}
		/>
	)
}
