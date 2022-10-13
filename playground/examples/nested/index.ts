import type { Example } from '../../types';
import { nanoid } from 'nanoid';
import { defineAsyncComponent } from 'vue';

const nestedExample: Example = {
  id: nanoid(),
  title: 'Nested Items',
  component: defineAsyncComponent(() => import('./index.vue')),
  repoLink:
    'https://github.com/kadiryazici/vue-selectable-items/tree/main/playground/examples/nested',
};

export default nestedExample;
