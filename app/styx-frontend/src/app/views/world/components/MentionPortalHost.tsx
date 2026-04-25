import { memo, useEffect, useReducer, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Provider as ReduxProvider, useSelector } from 'react-redux'

import { ActorMentionChip } from '@/app/features/richTextEditor/extensions/mentions/components/chips/ActorMentionChip'
import { ArticleMentionChip } from '@/app/features/richTextEditor/extensions/mentions/components/chips/ArticleMentionChip'
import { EventMentionChip } from '@/app/features/richTextEditor/extensions/mentions/components/chips/EventMentionChip'
import { TagMentionChip } from '@/app/features/richTextEditor/extensions/mentions/components/chips/TagMentionChip'
import { CustomThemeProvider } from '@/app/features/theming/context/CustomThemeProvider'
import { store } from '@/app/store'

import { getWorldIdState } from '../WorldSliceSelectors'

type MentionMount = {
	id: string
	element: HTMLElement
	actorId?: string
	eventId?: string
	articleId?: string
	tagId?: string
	fallbackName: string | undefined
}

const mounts = new Map<string, MentionMount>()
let forceUpdate: (() => void) | null = null

const PROGRESSIVE_BATCH_SIZE = 25
const PROGRESSIVE_THRESHOLD = 5

const pendingRegistrations: MentionMount[] = []
let registrationFlushScheduled = false
let progressiveRafId = 0

const flushRegistrations = () => {
	registrationFlushScheduled = false

	if (pendingRegistrations.length === 0) return

	if (progressiveRafId !== 0) {
		// Progressive rendering already in flight; new items will be picked up by the next batch
		return
	}

	if (pendingRegistrations.length <= PROGRESSIVE_THRESHOLD) {
		for (const mount of pendingRegistrations.splice(0)) {
			mounts.set(mount.id, mount)
		}
		forceUpdate?.()
		return
	}

	// Large batch — render progressively across frames
	const processNextBatch = () => {
		const batch = pendingRegistrations.splice(0, PROGRESSIVE_BATCH_SIZE)
		for (const mount of batch) {
			mounts.set(mount.id, mount)
		}
		forceUpdate?.()
		if (pendingRegistrations.length > 0) {
			progressiveRafId = requestAnimationFrame(processNextBatch)
		} else {
			progressiveRafId = 0
		}
	}
	processNextBatch()
}

const scheduleRegistrationFlush = () => {
	if (registrationFlushScheduled) return
	registrationFlushScheduled = true
	queueMicrotask(flushRegistrations)
}

export const registerMentionMount = (mount: MentionMount) => {
	pendingRegistrations.push(mount)
	scheduleRegistrationFlush()
}

export const updateMentionMount = (mount: MentionMount) => {
	const pendingIdx = pendingRegistrations.findIndex((m) => m.id === mount.id)
	if (pendingIdx !== -1) {
		pendingRegistrations[pendingIdx] = mount
		return
	}
	mounts.set(mount.id, mount)
	forceUpdate?.()
}

export const unregisterMentionMount = (id: string) => {
	mounts.delete(id)
	const idx = pendingRegistrations.findIndex((m) => m.id === id)
	if (idx !== -1) pendingRegistrations.splice(idx, 1)
	forceUpdate?.()
}

const MentionChipResolver = memo(function MentionChipResolver({ mount }: { mount: MentionMount }) {
	const worldId = useSelector(getWorldIdState)
	const { actorId, eventId, articleId, tagId, fallbackName } = mount

	if (actorId) {
		return <ActorMentionChip worldId={worldId} actorId={actorId} fallbackName={fallbackName} />
	}
	if (eventId) {
		return <EventMentionChip worldId={worldId} eventId={eventId} fallbackName={fallbackName} />
	}
	if (articleId) {
		return <ArticleMentionChip worldId={worldId} articleId={articleId} fallbackName={fallbackName} />
	}
	if (tagId) {
		return <TagMentionChip worldId={worldId} tagId={tagId} fallbackName={fallbackName} />
	}
	return null
})

const MentionPortalHostInner = () => {
	const [, tick] = useReducer((x: number) => x + 1, 0)
	const tickRef = useRef(tick)
	tickRef.current = tick

	useEffect(() => {
		forceUpdate = () => tickRef.current()
		return () => {
			forceUpdate = null
		}
	}, [])

	return (
		<>
			{Array.from(mounts.values()).map((mount) =>
				createPortal(<MentionChipResolver mount={mount} />, mount.element, mount.id),
			)}
		</>
	)
}

export const MentionPortalHost = () => {
	return (
		<ReduxProvider store={store}>
			<CustomThemeProvider colorMode={store.getState().preferences.colorMode}>
				<MentionPortalHostInner />
			</CustomThemeProvider>
		</ReduxProvider>
	)
}
