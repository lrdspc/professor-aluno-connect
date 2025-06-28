// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
import basicSsl from "file:///home/project/node_modules/@vitejs/plugin-basic-ssl/dist/index.mjs";
import { visualizer } from "file:///home/project/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    https: true
    // Enable HTTPS
  },
  plugins: [
    react(),
    basicSsl(),
    // Add the basicSsl plugin
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        // Consider creating this if it doesn't exist
        "manifest.webmanifest",
        // Add manifest to included assets for precaching
        "icons/pwa-192x192.png",
        "icons/pwa-512x512.png"
      ],
      manifest: {
        name: "FitCoach Pro",
        short_name: "FitCoach",
        description: "Plataforma completa para personal trainers gerenciarem alunos, treinos e progresso. Funciona offline e \xE9 instal\xE1vel!",
        theme_color: "#8b5cf6",
        // Violet color from login page
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        categories: ["education", "fitness", "health", "sports"],
        shortcuts: [
          {
            name: "Criar Novo Treino",
            short_name: "Novo Treino",
            description: "Abrir a p\xE1gina para criar um novo plano de treino.",
            url: "/trainer/create-workout",
            // Assuming this is the route for creating workouts
            icons: [{ src: "icons/pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Ver Meus Alunos",
            short_name: "Alunos",
            description: "Visualizar e gerenciar sua lista de alunos.",
            url: "/trainer/students",
            // Assuming this is the route for the students list
            icons: [{ src: "icons/pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Meu Progresso",
            short_name: "Progresso",
            description: "Acompanhar seu progresso nos treinos.",
            url: "/student/progress",
            // Assuming this is the route for student progress
            icons: [{ src: "icons/pwa-192x192.png", sizes: "192x192" }]
          }
        ],
        icons: [
          {
            src: "icons/pwa-192x192.png",
            // Updated path
            sizes: "192x192",
            type: "image/png"
            // Will be SVG, but type is for browser hint
          },
          {
            src: "icons/pwa-512x512.png",
            // Updated path
            sizes: "512x512",
            type: "image/png"
            // Will be SVG
          },
          {
            src: "icons/pwa-512x512.png",
            // Updated path for maskable
            sizes: "512x512",
            type: "image/png",
            // Will be SVG
            purpose: "any maskable"
          }
        ]
      },
      // Switch to injectManifest strategy
      strategies: "injectManifest",
      srcDir: "src",
      // Directory where your custom SW is located
      filename: "sw.ts",
      // Your custom SW file name
      // The workbox options like globPatterns, runtimeCaching are now handled in sw.ts
      // However, you might still need to configure some workbox options here if the plugin requires them for injection.
      // For `injectManifest`, VitePWA will primarily just build your sw.ts and inject the precache manifest.
      injectManifest: {
        // You can pass options to workbox-build's injectManifest function here if needed
        // For example, to include additional assets in the precache manifest not caught by globPatterns in sw.ts
        // injectionPoint: 'self.__WB_MANIFEST', // This is usually the default
      },
      devOptions: {
        enabled: true,
        // Keep SW enabled in dev for testing
        navigateFallback: "index.html"
        // Fallback for SPA in dev
        // navigateFallbackAllowlist: [/^index.html$/] // Default is fine for dev
      }
    }),
    visualizer({
      // Add the visualizer plugin instance
      filename: "./dist/stats.html",
      // Output file in the dist folder
      open: true,
      // Automatically open it in browser after build
      gzipSize: true,
      // Show GZIP size
      brotliSize: true
      // Show Brotli size
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xuaW1wb3J0IGJhc2ljU3NsIGZyb20gJ0B2aXRlanMvcGx1Z2luLWJhc2ljLXNzbCc7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJzsgLy8gSW1wb3J0IHZpc3VhbGl6ZXJcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIGh0dHBzOiB0cnVlLCAvLyBFbmFibGUgSFRUUFNcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgYmFzaWNTc2woKSwgLy8gQWRkIHRoZSBiYXNpY1NzbCBwbHVnaW5cbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIGluY2x1ZGVBc3NldHM6IFtcbiAgICAgICAgJ2Zhdmljb24uaWNvJyxcbiAgICAgICAgJ2FwcGxlLXRvdWNoLWljb24ucG5nJywgLy8gQ29uc2lkZXIgY3JlYXRpbmcgdGhpcyBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgICAgICdtYW5pZmVzdC53ZWJtYW5pZmVzdCcsIC8vIEFkZCBtYW5pZmVzdCB0byBpbmNsdWRlZCBhc3NldHMgZm9yIHByZWNhY2hpbmdcbiAgICAgICAgJ2ljb25zL3B3YS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICdpY29ucy9wd2EtNTEyeDUxMi5wbmcnXG4gICAgICBdLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ0ZpdENvYWNoIFBybycsXG4gICAgICAgIHNob3J0X25hbWU6ICdGaXRDb2FjaCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUGxhdGFmb3JtYSBjb21wbGV0YSBwYXJhIHBlcnNvbmFsIHRyYWluZXJzIGdlcmVuY2lhcmVtIGFsdW5vcywgdHJlaW5vcyBlIHByb2dyZXNzby4gRnVuY2lvbmEgb2ZmbGluZSBlIFx1MDBFOSBpbnN0YWxcdTAwRTF2ZWwhJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjOGI1Y2Y2JywgLy8gVmlvbGV0IGNvbG9yIGZyb20gbG9naW4gcGFnZVxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXG4gICAgICAgIHNjb3BlOiAnLycsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBjYXRlZ29yaWVzOiBbJ2VkdWNhdGlvbicsICdmaXRuZXNzJywgJ2hlYWx0aCcsICdzcG9ydHMnXSxcbiAgICAgICAgc2hvcnRjdXRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NyaWFyIE5vdm8gVHJlaW5vJyxcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdOb3ZvIFRyZWlubycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FicmlyIGEgcFx1MDBFMWdpbmEgcGFyYSBjcmlhciB1bSBub3ZvIHBsYW5vIGRlIHRyZWluby4nLFxuICAgICAgICAgICAgdXJsOiAnL3RyYWluZXIvY3JlYXRlLXdvcmtvdXQnLCAvLyBBc3N1bWluZyB0aGlzIGlzIHRoZSByb3V0ZSBmb3IgY3JlYXRpbmcgd29ya291dHNcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6ICdpY29ucy9wd2EtMTkyeDE5Mi5wbmcnLCBzaXplczogJzE5MngxOTInIH1dXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnVmVyIE1ldXMgQWx1bm9zJyxcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdBbHVub3MnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdWaXN1YWxpemFyIGUgZ2VyZW5jaWFyIHN1YSBsaXN0YSBkZSBhbHVub3MuJyxcbiAgICAgICAgICAgIHVybDogJy90cmFpbmVyL3N0dWRlbnRzJywgLy8gQXNzdW1pbmcgdGhpcyBpcyB0aGUgcm91dGUgZm9yIHRoZSBzdHVkZW50cyBsaXN0XG4gICAgICAgICAgICBpY29uczogW3sgc3JjOiAnaWNvbnMvcHdhLTE5MngxOTIucG5nJywgc2l6ZXM6ICcxOTJ4MTkyJyB9XVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ01ldSBQcm9ncmVzc28nLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ1Byb2dyZXNzbycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Fjb21wYW5oYXIgc2V1IHByb2dyZXNzbyBub3MgdHJlaW5vcy4nLFxuICAgICAgICAgICAgdXJsOiAnL3N0dWRlbnQvcHJvZ3Jlc3MnLCAvLyBBc3N1bWluZyB0aGlzIGlzIHRoZSByb3V0ZSBmb3Igc3R1ZGVudCBwcm9ncmVzc1xuICAgICAgICAgICAgaWNvbnM6IFt7IHNyYzogJ2ljb25zL3B3YS0xOTJ4MTkyLnBuZycsIHNpemVzOiAnMTkyeDE5MicgfV1cbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnaWNvbnMvcHdhLTE5MngxOTIucG5nJywgLy8gVXBkYXRlZCBwYXRoXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycgLy8gV2lsbCBiZSBTVkcsIGJ1dCB0eXBlIGlzIGZvciBicm93c2VyIGhpbnRcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ2ljb25zL3B3YS01MTJ4NTEyLnBuZycsIC8vIFVwZGF0ZWQgcGF0aFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnIC8vIFdpbGwgYmUgU1ZHXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdpY29ucy9wd2EtNTEyeDUxMi5wbmcnLCAvLyBVcGRhdGVkIHBhdGggZm9yIG1hc2thYmxlXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsIC8vIFdpbGwgYmUgU1ZHXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIC8vIFN3aXRjaCB0byBpbmplY3RNYW5pZmVzdCBzdHJhdGVneVxuICAgICAgc3RyYXRlZ2llczogJ2luamVjdE1hbmlmZXN0JyxcbiAgICAgIHNyY0RpcjogJ3NyYycsIC8vIERpcmVjdG9yeSB3aGVyZSB5b3VyIGN1c3RvbSBTVyBpcyBsb2NhdGVkXG4gICAgICBmaWxlbmFtZTogJ3N3LnRzJywgLy8gWW91ciBjdXN0b20gU1cgZmlsZSBuYW1lXG4gICAgICAvLyBUaGUgd29ya2JveCBvcHRpb25zIGxpa2UgZ2xvYlBhdHRlcm5zLCBydW50aW1lQ2FjaGluZyBhcmUgbm93IGhhbmRsZWQgaW4gc3cudHNcbiAgICAgIC8vIEhvd2V2ZXIsIHlvdSBtaWdodCBzdGlsbCBuZWVkIHRvIGNvbmZpZ3VyZSBzb21lIHdvcmtib3ggb3B0aW9ucyBoZXJlIGlmIHRoZSBwbHVnaW4gcmVxdWlyZXMgdGhlbSBmb3IgaW5qZWN0aW9uLlxuICAgICAgLy8gRm9yIGBpbmplY3RNYW5pZmVzdGAsIFZpdGVQV0Egd2lsbCBwcmltYXJpbHkganVzdCBidWlsZCB5b3VyIHN3LnRzIGFuZCBpbmplY3QgdGhlIHByZWNhY2hlIG1hbmlmZXN0LlxuICAgICAgaW5qZWN0TWFuaWZlc3Q6IHtcbiAgICAgICAgLy8gWW91IGNhbiBwYXNzIG9wdGlvbnMgdG8gd29ya2JveC1idWlsZCdzIGluamVjdE1hbmlmZXN0IGZ1bmN0aW9uIGhlcmUgaWYgbmVlZGVkXG4gICAgICAgIC8vIEZvciBleGFtcGxlLCB0byBpbmNsdWRlIGFkZGl0aW9uYWwgYXNzZXRzIGluIHRoZSBwcmVjYWNoZSBtYW5pZmVzdCBub3QgY2F1Z2h0IGJ5IGdsb2JQYXR0ZXJucyBpbiBzdy50c1xuICAgICAgICAvLyBpbmplY3Rpb25Qb2ludDogJ3NlbGYuX19XQl9NQU5JRkVTVCcsIC8vIFRoaXMgaXMgdXN1YWxseSB0aGUgZGVmYXVsdFxuICAgICAgfSxcbiAgICAgIGRldk9wdGlvbnM6IHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSwgLy8gS2VlcCBTVyBlbmFibGVkIGluIGRldiBmb3IgdGVzdGluZ1xuICAgICAgICBuYXZpZ2F0ZUZhbGxiYWNrOiAnaW5kZXguaHRtbCcsIC8vIEZhbGxiYWNrIGZvciBTUEEgaW4gZGV2XG4gICAgICAgIC8vIG5hdmlnYXRlRmFsbGJhY2tBbGxvd2xpc3Q6IFsvXmluZGV4Lmh0bWwkL10gLy8gRGVmYXVsdCBpcyBmaW5lIGZvciBkZXZcbiAgICAgIH1cbiAgICB9KSxcbiAgICB2aXN1YWxpemVyKHsgLy8gQWRkIHRoZSB2aXN1YWxpemVyIHBsdWdpbiBpbnN0YW5jZVxuICAgICAgZmlsZW5hbWU6ICcuL2Rpc3Qvc3RhdHMuaHRtbCcsIC8vIE91dHB1dCBmaWxlIGluIHRoZSBkaXN0IGZvbGRlclxuICAgICAgb3BlbjogdHJ1ZSwgLy8gQXV0b21hdGljYWxseSBvcGVuIGl0IGluIGJyb3dzZXIgYWZ0ZXIgYnVpbGRcbiAgICAgIGd6aXBTaXplOiB0cnVlLCAvLyBTaG93IEdaSVAgc2l6ZVxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSwgLy8gU2hvdyBCcm90bGkgc2l6ZVxuICAgIH0pXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sY0FBYztBQUNyQixTQUFTLGtCQUFrQjtBQU4zQixJQUFNLG1DQUFtQztBQVN6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLEVBQ1Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQTtBQUFBLElBQ1QsU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxJQUNoQixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlO0FBQUEsUUFDYjtBQUFBLFFBQ0E7QUFBQTtBQUFBLFFBQ0E7QUFBQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxZQUFZLENBQUMsYUFBYSxXQUFXLFVBQVUsUUFBUTtBQUFBLFFBQ3ZELFdBQVc7QUFBQSxVQUNUO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUE7QUFBQSxZQUNMLE9BQU8sQ0FBQyxFQUFFLEtBQUsseUJBQXlCLE9BQU8sVUFBVSxDQUFDO0FBQUEsVUFDNUQ7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUE7QUFBQSxZQUNMLE9BQU8sQ0FBQyxFQUFFLEtBQUsseUJBQXlCLE9BQU8sVUFBVSxDQUFDO0FBQUEsVUFDNUQ7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUE7QUFBQSxZQUNMLE9BQU8sQ0FBQyxFQUFFLEtBQUsseUJBQXlCLE9BQU8sVUFBVSxDQUFDO0FBQUEsVUFDNUQ7QUFBQSxRQUNGO0FBQUEsUUFDQSxPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUE7QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUE7QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUE7QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUEsWUFBWTtBQUFBLE1BQ1osUUFBUTtBQUFBO0FBQUEsTUFDUixVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlWLGdCQUFnQjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSWhCO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixTQUFTO0FBQUE7QUFBQSxRQUNULGtCQUFrQjtBQUFBO0FBQUE7QUFBQSxNQUVwQjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBO0FBQUEsTUFDVCxVQUFVO0FBQUE7QUFBQSxNQUNWLE1BQU07QUFBQTtBQUFBLE1BQ04sVUFBVTtBQUFBO0FBQUEsTUFDVixZQUFZO0FBQUE7QUFBQSxJQUNkLENBQUM7QUFBQSxFQUNILEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
