import type { Config } from 'jest'

const config: Config = {
	verbose: true,
	preset: 'ts-jest/presets/js-with-ts',
	testEnvironment: 'jest-environment-jsdom',
	modulePaths: ['<rootDir>/src'],
}

export default config
