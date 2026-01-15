import MuiPagination from '@mui/material/Pagination'

import { useStateWithDebounceCallback } from '@/app/hooks/useStateWithDebounceCallback'

type Props = {
	initialPage: number
	pageCount: number
	onChange: (page: number) => void
}

export const Pagination = ({ initialPage, pageCount, onChange }: Props) => {
	const [page, setPage] = useStateWithDebounceCallback({
		initialValue: initialPage,
		onDebounce: onChange,
	})

	return <MuiPagination count={pageCount} page={page + 1} onChange={(_, page) => setPage(page - 1)} />
}
