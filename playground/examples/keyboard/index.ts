import type { Example } from '../../types';
import { defineAsyncComponent } from 'vue';

const keyboardExample: Example = {
  id: 'example:keyboard',
  title: 'Keyboard Support',
  component: defineAsyncComponent(() => import('./index.vue')),
  repoLink:
    'https://github.com/kadiryazici/vue-selectable-items/tree/main/playground/examples/keyboard',
};

export default keyboardExample;
