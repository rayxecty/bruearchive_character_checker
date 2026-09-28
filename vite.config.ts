import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from 'process';
import { defineConfig, type Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin to prepare files for GitHub Pages:
// 1. Generate 404.html from index.html (SPA redirect)
// 2. Generate .nojekyll (bypasses Jekyll processing)
// 3. Mirror output into docs/ folder (allows Deploy from branch -> /docs)
function githubPagesPlugin(): Plugin {
  return {
    name: 'github-pages-plugin',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const docsDir = path.resolve(__dirname, 'docs');
      const indexPath = path.resolve(outDir, 'index.html');
      const notFoundPath = path.resolve(outDir, '404.html');
      const noJekyllDist = path.resolve(outDir, '.nojekyll');

      try {
        if (fs.existsSync(indexPath)) {
          // 1. SPA fallback: 404.html
          fs.copyFileSync(indexPath, notFoundPath);
          // 2. Disable Jekyll processing
          fs.writeFileSync(noJekyllDist, '');
          console.log('✓ Generated 404.html and .nojekyll in dist');

          // 3. Mirror dist into docs/ for GitHub Pages /docs branch option
          if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
          }
          fs.cpSync(outDir, docsDir, { recursive: true });
          console.log('✓ Mirrored build to docs/ folder for GitHub Pages');
        }
      } catch (err) {
        console.warn('GitHub Pages post-build operations warning:', err);
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
    plugins: [react(), tailwindcss(), githubPagesPlugin()],
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
