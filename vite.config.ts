import { defineConfig, type UserConfigExport } from 'vite';
import VueJSX from '@vitejs/plugin-vue-jsx';
import path from 'path';
import ViteDTS from 'vite-plugin-dts';
import Vue from '@vitejs/plugin-vue';

const devConfig: UserConfigExport = {
  plugins: [VueJSX(), Vue()],
  root: './playground',
};

const prodConfig: UserConfigExport = {
  plugins: [
    VueJSX(), //
    ViteDTS({
      outputDir: 'dist/types',
      include: ['src'],
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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => (mode === 'production' ? prodConfig : devConfig));
