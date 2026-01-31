import {defineConfig} from 'vite';
import {resolve} from 'path';
import babel from 'vite-plugin-babel';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        babel({
            babelConfig: {
                plugins: [
                    ['@babel/plugin-proposal-decorators', {legacy: true}],
                    ['@babel/plugin-transform-class-properties', {loose: true}],
                ],
            },
        }),
        solidPlugin({
            include: [/\.tsx$/, /\.jsx$/],
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@core': resolve(__dirname, 'src/core'),
            '@habbo': resolve(__dirname, 'src/habbo'),
            '@room': resolve(__dirname, 'src/room'),
            '@iid': resolve(__dirname, 'src/iid'),
            '@ui': resolve(__dirname, 'src/ui'),
        },
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
