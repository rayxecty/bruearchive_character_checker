import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from 'process';
import { defineConfig, type Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin to copy index.html to 404.html in dist for GitHub Pages routing support
function githubPagesSpaPlugin(): Plugin {
  return {
    name: 'github-pages-spa',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const indexPath = path.resolve(outDir, 'index.html');
      const notFoundPath = path.resolve(outDir, '404.html');
      try {
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath);
          console.log('✓ Generated 404.html for GitHub Pages SPA routing');
        }
      } catch (err) {
        console.warn('Could not generate 404.html for GitHub Pages', err);
      }
    },
  };
}

export default defineConfig(({ command }) => {
  // Use repository path on build (for GitHub Pages), or VITE_BASE_PATH if customized.
  // Use '/' during development so local preview and dev server work at root.
  const repoName = 'bruearchive_character_checker';
  const base = process.env.VITE_BASE_PATH ?? (command === 'build' ? `/${repoName}/` : '/');

  return {
    base,
    plugins: [react(), tailwindcss(), githubPagesSpaPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
