import type { Example } from '../../types';
import { defineAsyncComponent } from 'vue';

const nestedExample: Example = {
  id: 'example:nested',
  title: 'Nested Items',
  component: defineAsyncComponent(() => import('./index.vue')),
  repoLink:
    'https://github.com/kadiryazici/vue-selectable-items/tree/main/playground/examples/nested',
};

export default nestedExample;
