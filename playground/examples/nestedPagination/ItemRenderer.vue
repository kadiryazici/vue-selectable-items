<script lang="ts">
import { computed, shallowRef } from 'vue';
import {
  type Item,
  type ItemGroup,
  type CustomItem,
  type AllItems,
  item,
  customItem,
  createItemDefaults,
} from '../../../src';
import { SelectableItems } from '../../../src/';
import IconChevronRight from 'virtual:icons/carbon/chevron-right';
import IconChevronLeft from 'virtual:icons/carbon/chevron-left';

export type ItemMetaWithChildren = {
  children?: (Item<ItemMetaWithChildren> | ItemGroup | CustomItem<ItemMetaWithChildren>)[];
  text: string;
  back?: boolean;
};

const itemDefaults = createItemDefaults({
  elementTag: 'button',
  elementAttrs: {
    tabindex: 0,
    style: {
      outline: 'none',
    },
  },
});

export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    items?: (Item<ItemMetaWithChildren> | ItemGroup | CustomItem<ItemMetaWithChildren>)[];
  }>(),
  {
    items: () => [],
  },
);

const emit = defineEmits<{ (e: 'close'): void }>();

type StackItem = {
  parent: Item<ItemMetaWithChildren> | null;
  items: AllItems<ItemMetaWithChildren>[];
}[];

const stack = shallowRef<StackItem>([
  {
    parent: null,
    items: props.items,
  },
]);

const currentItems = computed(() => {
  const current = stack.value[stack.value.length - 1];

  if (current.parent) {
    return [
      item<ItemMetaWithChildren>({
        key: `back:${current.parent.key}`,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        meta: {
          text: `${current.parent.meta?.text}`,
          back: true,
        },
        onSelect() {
          stack.value = stack.value.slice(0, -1);
        },
      }),
      customItem({
        key: `seperator:${current.parent.meta?.text}`,
        name: 'separator',
      }),
      ...current.items,
    ];
  }

  return current.items;
});

function handleSelect(meta: ItemMetaWithChildren, item: Item<ItemMetaWithChildren>) {
  if (meta.children) {
    stack.value = [...stack.value, { parent: item, items: meta.children }];
    return;
  }

  emit('close');
}
</script>

<template>
  <SelectableItems
    v-bind="$attrs"
    @select="handleSelect"
    :items="currentItems"
    :itemDefaults="itemDefaults"
  >
    <template #render="{ text, children, back }: ItemMetaWithChildren">
      <IconChevronLeft
        style="transform: translateX(-40%); font-size: 10px"
        v-if="back"
      />

      {{ text }}

      <IconChevronRight
        style="transform: translateX(40%); margin-left: auto; font-size: 10px"
        v-if="!!children"
      />
    </template>

    <template #separator>
      <div style="background-color: var(--bg-3); margin: 4px 0; height: 1px"></div>
    </template>
  </SelectableItems>
</template>
