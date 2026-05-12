import plugin from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        plugin(),
        {
            name: 'copy-startup',
            closeBundle() {
                copyFileSync('startup.sh', 'dist/startup.sh');
            },
        },
    ],
    base: './',
    server: {
        port: 57357,
    },
    build: {
        target: 'esnext',
    },
})