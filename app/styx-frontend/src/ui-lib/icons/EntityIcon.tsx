import Article from '@mui/icons-material/ArticleOutlined'
import Event from '@mui/icons-material/Event'
import Folder from '@mui/icons-material/Folder'
import LabelIcon from '@mui/icons-material/LocalOfferOutlined'
import Person from '@mui/icons-material/Person'
import { SxProps } from '@mui/material'

type Props = {
	variant: 'actor' | 'event' | 'article' | 'tag' | 'folder' | 'Actor' | 'Event' | 'Article' | 'Tag' | 'Folder'
	height?: number
	color?: string
}

export function EntityIcon({ variant, height, color }: Props) {
	const overrides: SxProps = {
		color: color ?? 'unset',
		width: height ?? undefined,
		height: height ?? undefined,
	}
	switch (variant) {
		case 'actor':
		case 'Actor':
			return <Person sx={overrides} />
		case 'event':
		case 'Event':
			return <Event sx={overrides} />
		case 'article':
		case 'Article':
			return <Article sx={overrides} />
		case 'tag':
		case 'Tag':
			return <LabelIcon sx={overrides} />
		case 'folder':
		case 'Folder':
			return <Folder sx={overrides} />
		default:
			return null
	}
}
