import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Le decimos a Vite: "Tranquilo, yo sé que mis librerías de PDF pesan. No me avises a menos que pasen de 1 MB (1000 kB)"
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase'; 
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'vendor-charts'; 
            }
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('dompurify')) {
              return 'vendor-pdf-utils'; 
            }
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'vendor-react'; 
            }
            return 'vendor-core'; 
          }
        }
      }
    }
  }
});