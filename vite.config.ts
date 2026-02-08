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
			'@/assets': resolve(__dirname, 'src/ui/assets'),
			'@': resolve(__dirname, 'src'),
			'@core': resolve(__dirname, 'src/core'),
			'@habbo': resolve(__dirname, 'src/habbo'),
			'@room': resolve(__dirname, 'src/room'),
			'@iid': resolve(__dirname, 'src/iid'),
			'@ui': resolve(__dirname, 'src/ui'),
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
