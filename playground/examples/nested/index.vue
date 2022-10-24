<script lang="ts" setup>
import { item } from '../../../src';
import ItemRenderer, { type ItemMetaWithChildren } from './ItemRenderer.vue';
import { Wowerlay } from 'wowerlay';
import { ref } from 'vue';

const items = [
  item<ItemMetaWithChildren>({
    meta: { text: 'Washington' },
    key: 'washington',
  }),
  item<ItemMetaWithChildren>({
    meta: {
      text: 'New York City',
      children: [
        item<ItemMetaWithChildren>({
          meta: { text: 'Disabled one' },
          key: 'inner-0',
          disabled: true,
        }),
        item<ItemMetaWithChildren>({
          key: 'inner-1',
          disabled: true,
          meta: {
            text: 'Momentos',
            children: [
              item<ItemMetaWithChildren>({
                meta: { text: 'Momentos' },
                key: 'inner-0',
              }),
              item<ItemMetaWithChildren>({
                meta: { text: 'Momentos' },
                key: 'inner-1',
              }),
              item<ItemMetaWithChildren>({
                meta: { text: 'Momentos' },
                key: 'inner-2',
              }),
            ],
          },
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
];

const target = ref<HTMLElement>();
</script>

<template>
  <p style="margin-bottom: 20px; color: var(--txt-2)">
    Navigate with ArrowUp and ArrowDown and select with Enter
  </p>

  <div style="text-align: center">
    <input
      class="input"
      type="text"
      placeholder="test-input"
    />

    <button
      style="margin-left: 10px"
      class="btn"
    >
      Clicko
    </button>
  </div>

  <br /><br />

  <div ref="target"></div>
  <Wowerlay
    noBackground
    :visible="true"
    position="bottom"
    :target="target"
    :transition="false"
  >
    <ItemRenderer :items="items" />
  </Wowerlay>
</template>

<style lang="scss" scoped></style>
