import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg'],
            manifest: {
                name: 'Still Hours',
                short_name: 'Still Hours',
                description: 'Meditation timer with insights and community wisdom',
                theme_color: '#EA6512',
                background_color: '#F6F2EC',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                icons: [
                    {
                        src: 'icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                // Force new service worker to activate immediately
                skipWaiting: true,
                // Take control of all clients immediately
                clientsClaim: true,
                // Don't cache-bust URLs with hashes (Vite already does this)
                dontCacheBustURLsMatching: /\.[a-f0-9]{8}\./,
                // Allow large bundles to be precached (default 2MB, bundle is ~3.7MB)
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
            },
        }),
    ],
});
