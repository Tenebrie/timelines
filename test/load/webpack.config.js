import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
	mode: 'production',
	entry: {
		smoke: './src/smoke.ts',
		load: './src/load.ts',
		stress: './src/stress.ts',
		websocket: './src/websocket.ts',
		soak: './src/soak.ts',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		libraryTarget: 'commonjs',
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	target: 'web',
	externals: /^(k6|https?:\/\/)(\/.*)?/,
	stats: {
		colors: true,
	},
	optimization: {
		minimize: false,
	},
}
