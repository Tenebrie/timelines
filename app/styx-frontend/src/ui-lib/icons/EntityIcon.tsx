import Article from '@mui/icons-material/ArticleOutlined'
import Event from '@mui/icons-material/Event'
import LabelIcon from '@mui/icons-material/LocalOfferOutlined'
import Person from '@mui/icons-material/Person'

type Props = {
	variant: 'actor' | 'event' | 'article' | 'tag' | 'Actor' | 'Event' | 'Article' | 'Tag'
	height?: number
}

export function EntityIcon({ variant, height }: Props) {
	switch (variant) {
		case 'actor':
		case 'Actor':
			return <Person sx={{ height: height ?? 'unset' }} />
		case 'event':
		case 'Event':
			return <Event sx={{ height: height ?? 'unset' }} />
		case 'article':
		case 'Article':
			return <Article sx={{ height: height ?? 'unset' }} />
		case 'tag':
		case 'Tag':
			return <LabelIcon sx={{ height: height ?? 'unset' }} />
		default:
			return null
	}
}

export function ActorIcon({ height }: { height?: number }) {
	return <Person sx={{ height: height ?? 'unset' }} />
}

export function EventIcon({ height }: { height?: number }) {
	return <Event sx={{ height: height ?? 'unset' }} />
}

export function ArticleIcon({ height }: { height?: number }) {
	return <Article sx={{ height: height ?? 'unset' }} />
}

export function TagIcon({ height }: { height?: number }) {
	return <LabelIcon sx={{ height: height ?? 'unset' }} />
}
