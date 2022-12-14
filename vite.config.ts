import VueJSX from '@vitejs/plugin-vue-jsx';
import path from 'path';
import ViteDTS from 'vite-plugin-dts';
import Vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import { defineConfig, type UserConfigExport } from 'vitest/config';

const devConfig: UserConfigExport = {
  plugins: [
    VueJSX(), //
    Vue(),
    Icons({
      compiler: 'vue3',
    }),
  ],
  root: './playground',
};

const prodConfig: UserConfigExport = {
  plugins: [
    VueJSX(), //
    ViteDTS({
      outputDir: 'dist/types',
      include: ['src'],
      exclude: ['playground'],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src', 'index.ts'),
      name: 'vue-selectable-items',
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
};

const testConfig: UserConfigExport = {
  plugins: [VueJSX(), Vue()],
  test: {
    environment: 'jsdom',
    transformMode: {
      web: [/\.[jt]sx$/],
    },
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'production') return prodConfig;
  if (mode === 'test') return testConfig;
  if (mode === 'development') return devConfig;
  if (mode === 'staging') return { ...devConfig, base: '/vue-selectable-items' };

  throw new Error('Invalid mode');
});
