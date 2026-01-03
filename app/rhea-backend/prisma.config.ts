import { defineConfig } from 'prisma/config'
import { env } from 'process'

export default defineConfig({
	schema: 'prisma/',
	migrations: {
		path: 'prisma/migrations',
		seed: 'yarn prisma db seed',
	},
	datasource: {
		url: env.DATABASE_URL || 'postgresql://docker:docker@localhost:5432/db?schema=public',
	},
})
