import {defineConfig} from 'vite';
import {resolve} from 'path';
import babel from 'vite-plugin-babel';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
	plugins: [
		babel({
			babelConfig: {
				plugins: [
					['@babel/plugin-proposal-decorators', {legacy: true}],
					['@babel/plugin-transform-class-properties', {loose: true}],
				],
			},
			exclude: /node_modules/,
		}),
		solidPlugin({
			include: [/\.tsx$/, /\.jsx$/],
		}),
	],
	resolve: {
		alias: {
			'@/assets': resolve(__dirname, 'src/assets'),
			'@': resolve(__dirname, 'src'),
			'@core': resolve(__dirname, '../helium-engine/src/core'),
			'@habbo': resolve(__dirname, '../helium-engine/src/habbo'),
			'@room': resolve(__dirname, '../helium-engine/src/room'),
			'@iid': resolve(__dirname, '../helium-engine/src/iid'),
			'@ui': resolve(__dirname, 'src'),
		},
	},
	optimizeDeps: {
		exclude: ['solid-icons'],
	},
	build: {
		target: 'ES2022',
		sourcemap: true,
	},
	esbuild: {
		tsconfigRaw: {
			compilerOptions: {
				experimentalDecorators: true,
			},
		},
	},
});
