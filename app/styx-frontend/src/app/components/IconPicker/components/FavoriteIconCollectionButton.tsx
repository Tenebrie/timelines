import { useGetFavoriteIconsQuery } from '@api/favoriteIconsApi'
import { useAddFavoriteIconSet } from '@api/hooks/useAddFavoriteIconSet'
import { useRemoveFavoriteIconSet } from '@api/hooks/useRemoveFavoriteIconSet'
import type { IconCollection } from '@api/types/iconTypes'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import Button from '@mui/material/Button'
import { useLayoutEffect, useState } from 'react'

type Props = {
	collection: IconCollection
}

export function FavoriteIconCollectionButton({ collection }: Props) {
	const { data: favorites } = useGetFavoriteIconsQuery()
	const [addFavorite] = useAddFavoriteIconSet()
	const [removeFavorite] = useRemoveFavoriteIconSet()

	const [favorite, setFavorite] = useState(false)

	useLayoutEffect(() => {
		setFavorite(favorites?.iconSets.some((fav) => fav.id === collection.id) ?? false)
	}, [favorites, collection.id])

	const handleToggleFavorite = () => {
		setFavorite(!favorite)
		if (favorite) {
			removeFavorite(collection.id)
		} else {
			addFavorite(collection.id)
		}
	}

	return (
		<>
			{!collection.procedural && (
				<Button
					color="secondary"
					sx={{ p: 0.25, minWidth: 0, marginLeft: 0.25 }}
					onClick={() => handleToggleFavorite()}
				>
					{favorite && <FavoriteIcon />}
					{!favorite && <FavoriteBorderIcon />}
				</Button>
			)}
		</>
	)
}
