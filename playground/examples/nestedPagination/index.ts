import type { Example } from '../../types';
import { nanoid } from 'nanoid';
import { defineAsyncComponent } from 'vue';

const nestedPagination: Example = {
  id: nanoid(),
  title: 'Nested Pagination',
  component: defineAsyncComponent(() => import('./index.vue')),
  repoLink:
    'https://github.com/kadiryazici/vue-selectable-items/tree/main/playground/examples/nestedPagination',
};

export default nestedPagination;
