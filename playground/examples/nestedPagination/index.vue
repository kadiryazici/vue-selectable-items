<script lang="ts" setup>
import { item } from '../../../src';
import ItemRenderer, { type ItemMetaWithChildren } from './ItemRenderer.vue';
import { computed } from 'vue';

const itemOptions = {
  elementTag: 'button',
  elementAttrs: {
    tabindex: 0,
    style: {
      outline: 'none',
    },
  },
};

const items = computed(() => [
  item<ItemMetaWithChildren>({
    meta: { text: 'Washington' },
    key: 'washington',
    ...itemOptions,
  }),
  item<ItemMetaWithChildren>({
    meta: {
      text: 'New York City',
      children: [
        // item<ItemMetaWithChildren>({
        //   meta: { text: 'Momentos' },
        //   key: 'inner-0',
        //   ...itemOptions,
        // }),
        item<ItemMetaWithChildren>({
          meta: {
            text: 'Momentos',
            children: [
              item<ItemMetaWithChildren>({
                meta: { text: 'Momentos' },
                key: 'inner-0',
                ...itemOptions,
              }),
              item<ItemMetaWithChildren>({
                meta: { text: 'Momentos' },
                key: 'inner-1',
                ...itemOptions,
              }),
              item<ItemMetaWithChildren>({
                meta: { text: 'Momentos' },
                key: 'inner-2',
                ...itemOptions,
              }),
            ],
          },
          key: 'inner-1',
          ...itemOptions,
        }),
        item<ItemMetaWithChildren>({
          meta: { text: 'Momentos' },
          key: 'inner-2',
          ...itemOptions,
        }),
      ],
    },
    key: 'nwc',
    ...itemOptions,
  }),
  item<ItemMetaWithChildren>({
    meta: { text: 'Istanbul' },
    key: 'Istanbul',
    ...itemOptions,
  }),
  item<ItemMetaWithChildren>({
    meta: { text: 'BMW' },
    key: 'bmw',
    onSelect: () => console.log('Bremın how are you'),
    ...itemOptions,
  }),
]);
</script>

<template>
  <ItemRenderer :items="items" />
</template>

<style lang="scss" scoped></style>
