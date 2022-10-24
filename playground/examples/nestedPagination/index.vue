<script lang="ts" setup>
import { item } from '../../../src';
import ItemRenderer, { type ItemMetaWithChildren } from './ItemRenderer.vue';
import { computed } from 'vue';

const items = computed(() => [
  item<ItemMetaWithChildren>({
    meta: { text: 'Washington' },
    key: 'washington',
  }),
  item<ItemMetaWithChildren>({
    meta: {
      text: 'New York City',
      children: [
        item<ItemMetaWithChildren>({
          meta: { text: 'Momentos' },
          key: 'child-inner-0',
        }),
        item<ItemMetaWithChildren>({
          meta: {
            text: 'Momentos',
            children: [
              item<ItemMetaWithChildren>({
                meta: { text: 'Something' },
                key: 'child-inner-0',
              }),
              item<ItemMetaWithChildren>({
                meta: { text: 'Other thing' },
                key: 'child-inner-1',
              }),
              item<ItemMetaWithChildren>({
                meta: { text: 'Real Thing' },
                key: 'child-inner-2',
              }),
            ],
          },
          key: 'inner-1',
        }),
        item<ItemMetaWithChildren>({
          meta: { text: 'Momentos' },
          key: 'inner-2',
        }),
      ],
    },
    key: 'nwc',
  }),
  item<ItemMetaWithChildren>({
    meta: { text: 'Istanbul' },
    key: 'Istanbul',
  }),
  item<ItemMetaWithChildren>({
    meta: { text: 'BMW' },
    key: 'bmw',
    onSelect: () => console.log('Bremın how are you'),
  }),
]);
</script>

<template>
  <ItemRenderer :items="items" />
</template>

<style lang="scss" scoped></style>
