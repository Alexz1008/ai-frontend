import plugin from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    base: './',
    server: {
        port: 57357,
    },
    build: {
        target: 'esnext',
    },
})