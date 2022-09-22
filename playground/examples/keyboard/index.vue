<script lang="ts" setup>
import {
  SelectableItems,
  item,
  customItem,
  type SetupFunctionContext,
  type ItemOptions,
  itemGroup,
} from '../../../src';
import useKey from '../../composables/useKey';
import type { DemoItemMetaData } from '../../types';

const itemOptions: Partial<Omit<ItemOptions, 'meta'>> = {
  elementTag: 'button',
  elementAttrs: {
    tabindex: 0,
    style: {
      outline: 'none',
    },
  },
};

function setupHandler(ctx: SetupFunctionContext) {
  useKey(
    'down',
    () => {
      ctx.focusNext();
      ctx.getFocusedItemElement()?.focus({ preventScroll: true });
      setTimeout(ctx.scrollToFocusedElement, 0, {
        behavior: 'smooth',
        block: 'center',
        inline: 'start',
      });
    },
    { input: true, repeat: true, prevent: true },
  );
  useKey(
    'up',
    () => {
      ctx.focusPrevious();
      ctx.getFocusedItemElement()?.focus({ preventScroll: true });
      setTimeout(ctx.scrollToFocusedElement, 0, {
        behavior: 'smooth',
        block: 'center',
        inline: 'start',
      });
    },
    { input: true, repeat: true, prevent: true },
  );
  useKey(
    'enter',
    () => {
      // We return if focused item is selectable item because by pressing enter
      // users fire @click event and it triggeres selection
      // so it selects twice.
      if (document.activeElement?.hasAttribute('data-vue-selectable-items-item')) return;

      ctx.selectFocusedElement();
    },
    { input: true },
  );
}

const items = [
  customItem<DemoItemMetaData>({
    key: 'label-1',
    name: 'label',
    meta: { text: 'Cities' },
  }),
  item<DemoItemMetaData>({
    meta: { text: 'Washington' },
    key: 'washington',
    ...itemOptions,
  }),
  item<DemoItemMetaData>({
    meta: { text: 'New York City' },
    key: 'nwc',
    ...itemOptions,
  }),
  item<DemoItemMetaData>({
    meta: { text: 'Istanbul' },
    key: 'Istanbul',
    ...itemOptions,
  }),
  customItem<DemoItemMetaData>({
    meta: { text: 'Cars' },
    name: 'label',
    key: 'label-cars',
  }),
  item<DemoItemMetaData>({
    meta: { text: 'BMW' },
    key: 'bmw',
    onSelect: () => console.log('Bremın how are you'),
    ...itemOptions,
  }),
  item<DemoItemMetaData>({
    meta: { text: 'Mercedes' },
    key: 'mercedes',
    ...itemOptions,
  }),
  itemGroup({
    key: 'group-of-car',
    items: [
      item<DemoItemMetaData>({
        meta: { text: 'Volkswagen' },
        key: 'Volkswagen',
        ...itemOptions,
      }),
    ],
  }),
];
</script>

<template>
  <p style="margin-bottom: 20px; color: var(--txt-2)">
    Navigate with ArrowUp and ArrowDown and select with Enter
  </p>

  <SelectableItems
    :items="items"
    :setup="setupHandler"
  >
    <template #render="{ text }: DemoItemMetaData">
      {{ text }}
    </template>

    <template #label="{ text }: DemoItemMetaData">
      <div class="selection-label">
        {{ text }}
      </div>
    </template>
  </SelectableItems>
</template>
