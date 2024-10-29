import { z } from 'zod'

const PreferencesStateSchema = z.object({
	colorMode: z.union([z.literal('light'), z.literal('dark')]).default('dark'),
	timeline: z
		.object({
			useCustomLineSpacing: z.boolean().default(false),
			lineSpacing: z.number().default(10),
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
})

export const loadPreferences = () => {
	const value = window.localStorage.getItem('userPreferences/v1')
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
