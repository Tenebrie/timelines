import Input from '@mui/material/Input'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { memo } from 'react'

import { useDebouncedState } from '@/app/hooks/useDebouncedState'

export const IconSearchInput = memo(IconSearchInputComponent)

type Props = {
	onQueryChange: (query: string) => void
}

export function IconSearchInputComponent({ onQueryChange }: Props) {
	const navigate = useNavigate({ from: '/world/$worldId' })
	const { iq } = useSearch({ from: '/world/$worldId/_world' })

	const [, currentQuery, setQuery] = useDebouncedState({
		initialValue: iq ?? '',
		onDebounce: (value) => {
			navigate({
				search: (prev) => ({ ...prev, iq: value || undefined }),
			})
			onQueryChange(value)
		},
	})

	return (
		<Input
			type="search"
			value={currentQuery}
			onChange={(e) => setQuery(e.target.value)}
			placeholder="Search icons..."
		/>
	)
}
