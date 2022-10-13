import type { Example } from '../../types';
import { nanoid } from 'nanoid';
import { defineAsyncComponent } from 'vue';
import code from './index.vue?raw';

const nestedExample: Example = {
  id: nanoid(),
  title: 'Nested Items',
  component: defineAsyncComponent(() => import('./index.vue')),
  code,
};

export default nestedExample;
