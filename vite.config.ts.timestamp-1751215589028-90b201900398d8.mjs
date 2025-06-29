// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
import { visualizer } from "file:///home/project/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcic7IC8vIEltcG9ydCB2aXN1YWxpemVyXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbXG4gICAgICAgICdmYXZpY29uLmljbycsXG4gICAgICAgICdhcHBsZS10b3VjaC1pY29uLnBuZycsIC8vIENvbnNpZGVyIGNyZWF0aW5nIHRoaXMgaWYgaXQgZG9lc24ndCBleGlzdFxuICAgICAgICAnbWFuaWZlc3Qud2VibWFuaWZlc3QnLCAvLyBBZGQgbWFuaWZlc3QgdG8gaW5jbHVkZWQgYXNzZXRzIGZvciBwcmVjYWNoaW5nXG4gICAgICAgICdpY29ucy9wd2EtMTkyeDE5Mi5wbmcnLFxuICAgICAgICAnaWNvbnMvcHdhLTUxMng1MTIucG5nJ1xuICAgICAgXSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6ICdGaXRDb2FjaCBQcm8nLFxuICAgICAgICBzaG9ydF9uYW1lOiAnRml0Q29hY2gnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1BsYXRhZm9ybWEgY29tcGxldGEgcGFyYSBwZXJzb25hbCB0cmFpbmVycyBnZXJlbmNpYXJlbSBhbHVub3MsIHRyZWlub3MgZSBwcm9ncmVzc28uIEZ1bmNpb25hIG9mZmxpbmUgZSBcdTAwRTkgaW5zdGFsXHUwMEUxdmVsIScsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzhiNWNmNicsIC8vIFZpb2xldCBjb2xvciBmcm9tIGxvZ2luIHBhZ2VcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxuICAgICAgICBzY29wZTogJy8nLFxuICAgICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgICAgY2F0ZWdvcmllczogWydlZHVjYXRpb24nLCAnZml0bmVzcycsICdoZWFsdGgnLCAnc3BvcnRzJ10sXG4gICAgICAgIHNob3J0Y3V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdDcmlhciBOb3ZvIFRyZWlubycsXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnTm92byBUcmVpbm8nLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBYnJpciBhIHBcdTAwRTFnaW5hIHBhcmEgY3JpYXIgdW0gbm92byBwbGFubyBkZSB0cmVpbm8uJyxcbiAgICAgICAgICAgIHVybDogJy90cmFpbmVyL2NyZWF0ZS13b3Jrb3V0JywgLy8gQXNzdW1pbmcgdGhpcyBpcyB0aGUgcm91dGUgZm9yIGNyZWF0aW5nIHdvcmtvdXRzXG4gICAgICAgICAgICBpY29uczogW3sgc3JjOiAnaWNvbnMvcHdhLTE5MngxOTIucG5nJywgc2l6ZXM6ICcxOTJ4MTkyJyB9XVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1ZlciBNZXVzIEFsdW5vcycsXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnQWx1bm9zJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmlzdWFsaXphciBlIGdlcmVuY2lhciBzdWEgbGlzdGEgZGUgYWx1bm9zLicsXG4gICAgICAgICAgICB1cmw6ICcvdHJhaW5lci9zdHVkZW50cycsIC8vIEFzc3VtaW5nIHRoaXMgaXMgdGhlIHJvdXRlIGZvciB0aGUgc3R1ZGVudHMgbGlzdFxuICAgICAgICAgICAgaWNvbnM6IFt7IHNyYzogJ2ljb25zL3B3YS0xOTJ4MTkyLnBuZycsIHNpemVzOiAnMTkyeDE5MicgfV1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdNZXUgUHJvZ3Jlc3NvJyxcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdQcm9ncmVzc28nLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBY29tcGFuaGFyIHNldSBwcm9ncmVzc28gbm9zIHRyZWlub3MuJyxcbiAgICAgICAgICAgIHVybDogJy9zdHVkZW50L3Byb2dyZXNzJywgLy8gQXNzdW1pbmcgdGhpcyBpcyB0aGUgcm91dGUgZm9yIHN0dWRlbnQgcHJvZ3Jlc3NcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6ICdpY29ucy9wd2EtMTkyeDE5Mi5wbmcnLCBzaXplczogJzE5MngxOTInIH1dXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ2ljb25zL3B3YS0xOTJ4MTkyLnBuZycsIC8vIFVwZGF0ZWQgcGF0aFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnIC8vIFdpbGwgYmUgU1ZHLCBidXQgdHlwZSBpcyBmb3IgYnJvd3NlciBoaW50XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdpY29ucy9wd2EtNTEyeDUxMi5wbmcnLCAvLyBVcGRhdGVkIHBhdGhcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyAvLyBXaWxsIGJlIFNWR1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnaWNvbnMvcHdhLTUxMng1MTIucG5nJywgLy8gVXBkYXRlZCBwYXRoIGZvciBtYXNrYWJsZVxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLCAvLyBXaWxsIGJlIFNWR1xuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICAvLyBTd2l0Y2ggdG8gaW5qZWN0TWFuaWZlc3Qgc3RyYXRlZ3lcbiAgICAgIHN0cmF0ZWdpZXM6ICdpbmplY3RNYW5pZmVzdCcsXG4gICAgICBzcmNEaXI6ICdzcmMnLCAvLyBEaXJlY3Rvcnkgd2hlcmUgeW91ciBjdXN0b20gU1cgaXMgbG9jYXRlZFxuICAgICAgZmlsZW5hbWU6ICdzdy50cycsIC8vIFlvdXIgY3VzdG9tIFNXIGZpbGUgbmFtZVxuICAgICAgLy8gVGhlIHdvcmtib3ggb3B0aW9ucyBsaWtlIGdsb2JQYXR0ZXJucywgcnVudGltZUNhY2hpbmcgYXJlIG5vdyBoYW5kbGVkIGluIHN3LnRzXG4gICAgICAvLyBIb3dldmVyLCB5b3UgbWlnaHQgc3RpbGwgbmVlZCB0byBjb25maWd1cmUgc29tZSB3b3JrYm94IG9wdGlvbnMgaGVyZSBpZiB0aGUgcGx1Z2luIHJlcXVpcmVzIHRoZW0gZm9yIGluamVjdGlvbi5cbiAgICAgIC8vIEZvciBgaW5qZWN0TWFuaWZlc3RgLCBWaXRlUFdBIHdpbGwgcHJpbWFyaWx5IGp1c3QgYnVpbGQgeW91ciBzdy50cyBhbmQgaW5qZWN0IHRoZSBwcmVjYWNoZSBtYW5pZmVzdC5cbiAgICAgIGluamVjdE1hbmlmZXN0OiB7XG4gICAgICAgIC8vIFlvdSBjYW4gcGFzcyBvcHRpb25zIHRvIHdvcmtib3gtYnVpbGQncyBpbmplY3RNYW5pZmVzdCBmdW5jdGlvbiBoZXJlIGlmIG5lZWRlZFxuICAgICAgICAvLyBGb3IgZXhhbXBsZSwgdG8gaW5jbHVkZSBhZGRpdGlvbmFsIGFzc2V0cyBpbiB0aGUgcHJlY2FjaGUgbWFuaWZlc3Qgbm90IGNhdWdodCBieSBnbG9iUGF0dGVybnMgaW4gc3cudHNcbiAgICAgICAgLy8gaW5qZWN0aW9uUG9pbnQ6ICdzZWxmLl9fV0JfTUFOSUZFU1QnLCAvLyBUaGlzIGlzIHVzdWFsbHkgdGhlIGRlZmF1bHRcbiAgICAgIH0sXG4gICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsIC8vIEtlZXAgU1cgZW5hYmxlZCBpbiBkZXYgZm9yIHRlc3RpbmdcbiAgICAgICAgbmF2aWdhdGVGYWxsYmFjazogJ2luZGV4Lmh0bWwnLCAvLyBGYWxsYmFjayBmb3IgU1BBIGluIGRldlxuICAgICAgICAvLyBuYXZpZ2F0ZUZhbGxiYWNrQWxsb3dsaXN0OiBbL15pbmRleC5odG1sJC9dIC8vIERlZmF1bHQgaXMgZmluZSBmb3IgZGV2XG4gICAgICB9XG4gICAgfSksXG4gICAgdmlzdWFsaXplcih7IC8vIEFkZCB0aGUgdmlzdWFsaXplciBwbHVnaW4gaW5zdGFuY2VcbiAgICAgIGZpbGVuYW1lOiAnLi9kaXN0L3N0YXRzLmh0bWwnLCAvLyBPdXRwdXQgZmlsZSBpbiB0aGUgZGlzdCBmb2xkZXJcbiAgICAgIG9wZW46IHRydWUsIC8vIEF1dG9tYXRpY2FsbHkgb3BlbiBpdCBpbiBicm93c2VyIGFmdGVyIGJ1aWxkXG4gICAgICBnemlwU2l6ZTogdHJ1ZSwgLy8gU2hvdyBHWklQIHNpemVcbiAgICAgIGJyb3RsaVNpemU6IHRydWUsIC8vIFNob3cgQnJvdGxpIHNpemVcbiAgICB9KVxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGVBQWU7QUFDeEIsU0FBUyxrQkFBa0I7QUFMM0IsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxJQUNoQixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlO0FBQUEsUUFDYjtBQUFBLFFBQ0E7QUFBQTtBQUFBLFFBQ0E7QUFBQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxZQUFZLENBQUMsYUFBYSxXQUFXLFVBQVUsUUFBUTtBQUFBLFFBQ3ZELFdBQVc7QUFBQSxVQUNUO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUE7QUFBQSxZQUNMLE9BQU8sQ0FBQyxFQUFFLEtBQUsseUJBQXlCLE9BQU8sVUFBVSxDQUFDO0FBQUEsVUFDNUQ7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUE7QUFBQSxZQUNMLE9BQU8sQ0FBQyxFQUFFLEtBQUsseUJBQXlCLE9BQU8sVUFBVSxDQUFDO0FBQUEsVUFDNUQ7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUE7QUFBQSxZQUNMLE9BQU8sQ0FBQyxFQUFFLEtBQUsseUJBQXlCLE9BQU8sVUFBVSxDQUFDO0FBQUEsVUFDNUQ7QUFBQSxRQUNGO0FBQUEsUUFDQSxPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUE7QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUE7QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUE7QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUEsWUFBWTtBQUFBLE1BQ1osUUFBUTtBQUFBO0FBQUEsTUFDUixVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlWLGdCQUFnQjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSWhCO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixTQUFTO0FBQUE7QUFBQSxRQUNULGtCQUFrQjtBQUFBO0FBQUE7QUFBQSxNQUVwQjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBO0FBQUEsTUFDVCxVQUFVO0FBQUE7QUFBQSxNQUNWLE1BQU07QUFBQTtBQUFBLE1BQ04sVUFBVTtBQUFBO0FBQUEsTUFDVixZQUFZO0FBQUE7QUFBQSxJQUNkLENBQUM7QUFBQSxFQUNILEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
