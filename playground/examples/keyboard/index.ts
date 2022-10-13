import type { Example } from '../../types';
import { nanoid } from 'nanoid';
import { defineAsyncComponent } from 'vue';

const keyboardExample: Example = {
  id: nanoid(),
  title: 'Keyboard Support',
  component: defineAsyncComponent(() => import('./index.vue')),
  repoLink:
    'https://github.com/kadiryazici/vue-selectable-items/tree/main/playground/examples/keyboard',
};

export default keyboardExample;
