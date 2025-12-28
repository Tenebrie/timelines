import { AssetType } from '@prisma/client'
import { RequiredParam } from 'moonflower/validators/ParamWrappers'
import { z } from 'zod'

const zodSchema = z.nativeEnum(AssetType)
const enumValues = Object.values(zodSchema.enum)

export const AssetTypeValidator = RequiredParam({
	parse: (v) => zodSchema.parse(v),
	description: 'Type of the asset, must be one of the following: ' + enumValues.join(', '),
	errorMessage: 'Invalid asset type, must be one of the following: ' + enumValues.join(', '),
})
