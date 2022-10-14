import type { Example } from '../../types';
import { defineAsyncComponent } from 'vue';

const nestedPagination: Example = {
  id: 'example:nested-pagination',
  title: 'Nested Pagination',
  component: defineAsyncComponent(() => import('./index.vue')),
  repoLink:
    'https://github.com/kadiryazici/vue-selectable-items/tree/main/playground/examples/nestedPagination',
};

export default nestedPagination;
