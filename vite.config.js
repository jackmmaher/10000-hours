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
                name: '10,000 Hours',
                short_name: '10K Hours',
                description: 'Meditation timer with insights and community wisdom',
                theme_color: '#1a1a2e',
                background_color: '#F7F5F2',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                icons: [
                    {
                        src: 'icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                // Force new service worker to activate immediately
                skipWaiting: true,
                // Take control of all clients immediately
                clientsClaim: true,
                // Don't cache-bust URLs with hashes (Vite already does this)
                dontCacheBustURLsMatching: /\.[a-f0-9]{8}\./
            }
        })
    ]
});
