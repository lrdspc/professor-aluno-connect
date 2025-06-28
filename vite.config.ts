import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer'; // Import visualizer

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png', // Consider creating this if it doesn't exist
        'manifest.webmanifest', // Add manifest to included assets for precaching
        'icons/pwa-192x192.png',
        'icons/pwa-512x512.png'
      ],
      manifest: {
        name: 'FitCoach Pro',
        short_name: 'FitCoach',
        description: 'Plataforma completa para personal trainers gerenciarem alunos, treinos e progresso. Funciona offline e é instalável!',
        theme_color: '#8b5cf6', // Violet color from login page
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['education', 'fitness', 'health', 'sports'],
        shortcuts: [
          {
            name: 'Criar Novo Treino',
            short_name: 'Novo Treino',
            description: 'Abrir a página para criar um novo plano de treino.',
            url: '/trainer/create-workout', // Assuming this is the route for creating workouts
            icons: [{ src: 'icons/pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Ver Meus Alunos',
            short_name: 'Alunos',
            description: 'Visualizar e gerenciar sua lista de alunos.',
            url: '/trainer/students', // Assuming this is the route for the students list
            icons: [{ src: 'icons/pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Meu Progresso',
            short_name: 'Progresso',
            description: 'Acompanhar seu progresso nos treinos.',
            url: '/student/progress', // Assuming this is the route for student progress
            icons: [{ src: 'icons/pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        icons: [
          {
            src: 'icons/pwa-192x192.png', // Updated path
            sizes: '192x192',
            type: 'image/png' // Will be SVG, but type is for browser hint
          },
          {
            src: 'icons/pwa-512x512.png', // Updated path
            sizes: '512x512',
            type: 'image/png' // Will be SVG
          },
          {
            src: 'icons/pwa-512x512.png', // Updated path for maskable
            sizes: '512x512',
            type: 'image/png', // Will be SVG
            purpose: 'any maskable'
          }
        ]
      },
      // Switch to injectManifest strategy
      strategies: 'injectManifest',
      srcDir: 'src', // Directory where your custom SW is located
      filename: 'sw.ts', // Your custom SW file name
      // The workbox options like globPatterns, runtimeCaching are now handled in sw.ts
      // However, you might still need to configure some workbox options here if the plugin requires them for injection.
      // For `injectManifest`, VitePWA will primarily just build your sw.ts and inject the precache manifest.
      injectManifest: {
        // You can pass options to workbox-build's injectManifest function here if needed
        // For example, to include additional assets in the precache manifest not caught by globPatterns in sw.ts
        // injectionPoint: 'self.__WB_MANIFEST', // This is usually the default
      },
      devOptions: {
        enabled: true, // Keep SW enabled in dev for testing
        navigateFallback: 'index.html', // Fallback for SPA in dev
        // navigateFallbackAllowlist: [/^index.html$/] // Default is fine for dev
      }
    }),
    visualizer({ // Add the visualizer plugin instance
      filename: './dist/stats.html', // Output file in the dist folder
      open: true, // Automatically open it in browser after build
      gzipSize: true, // Show GZIP size
      brotliSize: true, // Show Brotli size
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));