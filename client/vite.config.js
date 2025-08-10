import path from 'node:path';
import react from '@vitejs/plugin-react';
import { createLogger, defineConfig, loadEnv } from 'vite';

export default defineConfig(async ({ mode }) => {
  // Load env values
  const env = loadEnv(mode, process.cwd(), '');
  const BASE_URL = env.VITE_BASE_URL;

  const isDev = mode !== 'production';
  let inlineEditPlugin, editModeDevPlugin;

  if (isDev) {
    inlineEditPlugin = (await import('./plugins/visual-editor/vite-plugin-react-inline-editor.js')).default;
    editModeDevPlugin = (await import('./plugins/visual-editor/vite-plugin-edit-mode.js')).default;
  }

  console.warn = () => {};
  const logger = createLogger();
  const loggerError = logger.error;

  logger.error = (msg, options) => {
    if (options?.error?.toString().includes('CssSyntaxError: [postcss]')) {
      return;
    }
    loggerError(msg, options);
  };

  return {
    customLogger: logger,
    plugins: [
      ...(isDev ? [inlineEditPlugin(), editModeDevPlugin()] : []),
      react(),
      {
        name: 'add-transform-index-html',
        transformIndexHtml(html) {
          return {
            html,
            tags: [
              {
                tag: 'script',
                attrs: { type: 'module' },
                children: `window.onerror = (message, source, lineno, colno, errorObj) => {
                  const errorDetails = errorObj ? JSON.stringify({
                    name: errorObj.name,
                    message: errorObj.message,
                    stack: errorObj.stack,
                    source,
                    lineno,
                    colno,
                  }) : null;

                  window.parent.postMessage({
                    type: 'horizons-runtime-error',
                    message,
                    error: errorDetails
                  }, '*');
                };`,
                injectTo: 'head',
              }
            ],
          };
        },
      }
    ],
    server: {
      cors: true,
      headers: {
        'Cross-Origin-Embedder-Policy': 'credentialless',
      },
      allowedHosts: true,
      proxy: {
        '/api': {
          target: BASE_URL,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    resolve: {
      extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        external: [
          '@babel/parser',
          '@babel/traverse',
          '@babel/generator',
          '@babel/types'
        ]
      }
    }
  };
});
