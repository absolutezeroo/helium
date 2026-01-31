import {defineConfig} from 'vite';
import {resolve} from 'path';
import solidPlugin from 'vite-plugin-solid';
import solidDevtools from 'solid-devtools/vite';

export default defineConfig({
    plugins: [
        solidDevtools({
            autoname: true,
        }),
        solidPlugin({
            extensions: ['.tsx', '.jsx'],
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
