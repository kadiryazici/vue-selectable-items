import type { Example } from '../../types';
import { nanoid } from 'nanoid';
import { defineAsyncComponent } from 'vue';
import all from './index.vue?raw';

const keyboardExample: Example = {
  id: nanoid(),
  title: 'Keyboard Support',
  component: defineAsyncComponent(() => import('./index.vue')),
  scriptCode: all,
};

export default keyboardExample;
