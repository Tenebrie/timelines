import { z } from 'zod'

import { ScaleLevelSchema } from '../worldTimeline/components/Timeline/types'

export const PreferencesKey = 'userPreferences/v2'

const defaultTheme = ((): 'light' | 'dark' => {
	if (window.matchMedia) {
		const query = window.matchMedia('(prefers-color-scheme:dark)')
		return query.matches ? 'dark' : 'light'
	}
	return 'light'
})()

export const PreferencesStateSchema = z.object({
	colorMode: z.union([z.literal('light'), z.literal('dark')]).default(defaultTheme),
	timeline: z
		.object({
			containerHeight: z.number().default(232),
			scaleLevel: ScaleLevelSchema.default(0),
		})
		.default({}),
	outliner: z
		.object({
			tabIndex: z.number().default(0),
			showInactiveStatements: z.boolean().default(false),
			expandedActors: z.array(z.string()).default([]),
			expandedEvents: z.array(z.string()).default([]),
		})
		.default({}),
	overview: z
		.object({
			panelOpen: z.boolean().default(true),
			actorsOpen: z.boolean().default(true),
			actorsReversed: z.boolean().default(false),
			eventsOpen: z.boolean().default(true),
			eventsReversed: z.boolean().default(false),
		})
		.default({}),
	wiki: z
		.object({
			readModeEnabled: z.boolean().default(false),
		})
		.default({}),
})

export const loadPreferences = () => {
	const value = window.localStorage.getItem(PreferencesKey)
	if (!value) {
		return DefaultPreferencesValue
	}

	try {
		return PreferencesStateSchema.parse(JSON.parse(value))
	} catch (error) {
		console.warn('Failed to load preferences from local storage:', error)
	}
	return DefaultPreferencesValue
}

export type SavedPreferencesShape = z.infer<typeof PreferencesStateSchema>
export const DefaultPreferencesValue = PreferencesStateSchema.parse({})
