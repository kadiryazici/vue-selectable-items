<script lang="ts" setup>
import {
  SelectableItems,
  item,
  customItem,
  type SetupFunctionContext,
  type ItemOptions,
} from '../../../src';
import useKey from '../../composables/useKey';
import type { DemoItemMetaData } from '../../types';

const itemOptions: ItemOptions = {
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
  useKey('enter', ctx.selectFocusedElement, { input: true });
}

const items = [
  customItem(
    { text: 'Cities' } as DemoItemMetaData, //
    { slotName: 'label' },
  ),
  item({ text: 'Washington' } as DemoItemMetaData, itemOptions),
  item({ text: 'New York City' } as DemoItemMetaData, itemOptions),
  item({ text: 'Istanbul' } as DemoItemMetaData, itemOptions),
  customItem(
    { text: 'Cars' } as DemoItemMetaData, //
    { slotName: 'label' },
  ),
  item({ text: 'BMW' } as DemoItemMetaData, itemOptions),
  item({ text: 'Mercedes' } as DemoItemMetaData, itemOptions),
  item({ text: 'Volkswagen' } as DemoItemMetaData, itemOptions),
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
