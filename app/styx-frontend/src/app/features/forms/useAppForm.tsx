import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import { BoundTextField } from './components/BoundTextField'

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

export const { useAppForm } = createFormHook({
	fieldComponents: {
		BoundTextField,
	},
	formComponents: {},
	fieldContext,
	formContext,
})
