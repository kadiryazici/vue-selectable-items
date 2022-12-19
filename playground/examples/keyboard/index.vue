<script lang="ts" setup>
import {
  SelectableItems,
  item,
  customItem,
  type Context,
  itemGroup,
  createItemDefaults,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type Item,
} from '../../../src';
import useKey from '../../composables/useKey';
import type { DemoItemMetaData } from '../../types';

const itemDefaults = createItemDefaults((item) => ({
  elementTag: 'button',
  elementAttrs: {
    tabindex: item.disabled ? -1 : 0,
    disabled: item.disabled ? true : null,
    style: {
      outline: 'none',
    },
  },
}));

function setupHandler(ctx: Context) {
  useKey(
    'down',
    () => {
      ctx.focusNext();
      ctx.getFocusedItemElement()?.focus({ preventScroll: true });
      setTimeout(ctx.scrollToFocusedItemElement, 0, {
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
      setTimeout(ctx.scrollToFocusedItemElement, 0, {
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

      ctx.selectFocusedItem();
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
  }),
  item<DemoItemMetaData>({
    meta: { text: 'New York City' },
    key: 'nwc',
  }),
  item<DemoItemMetaData>({
    meta: { text: 'Istanbul' },
    key: 'Istanbul',
  }),
  customItem<DemoItemMetaData>({
    meta: { text: 'Cars' },
    name: 'label',
    key: 'label-cars',
  }),
  item<DemoItemMetaData>({
    meta: { text: 'BMW' },
    key: 'bmw',
    disabled: true,
    onSelect: () => console.log('Bremın how are you'),
  }),
  item<DemoItemMetaData>({
    meta: { text: 'Mercedes' },
    key: 'mercedes',
  }),
  itemGroup({
    key: 'group-of-car',
    items: [
      item<DemoItemMetaData>({
        meta: { text: 'Volkswagen' },
        key: 'Volkswagen',
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
    :itemDefaults="itemDefaults"
  >
    <template #render="{ meta }: Item<DemoItemMetaData>">
      {{ meta!.text }}
    </template>

    <template #label="{ text }: DemoItemMetaData">
      <div class="selection-label">
        {{ text }}
      </div>
    </template>
  </SelectableItems>
</template>
