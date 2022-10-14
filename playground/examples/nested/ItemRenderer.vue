<script lang="ts">
import { computed, ref, shallowRef } from 'vue';
import type { Item, ItemGroup, CustomItem } from '../../../src';
import { Wowerlay } from 'wowerlay';
import useKey from '../../composables/useKey';
import { SelectableItems, type Context, filterSelectableItems } from '../../../src/';
import IconChevronRight from 'virtual:icons/carbon/chevron-right';
import ItemRenderer from './ItemRenderer.vue';

export type ItemMetaWithChildren = {
  children?: (Item<ItemMetaWithChildren> | ItemGroup | CustomItem<ItemMetaWithChildren>)[];
  text: string;
};

const allowedInputTypes = ['email', 'password', 'text', 'number', 'url', 'time', 'tel'];

export const isInputing = () =>
  document.activeElement instanceof HTMLTextAreaElement ||
  document.activeElement instanceof HTMLSelectElement ||
  (document.activeElement instanceof HTMLInputElement &&
    allowedInputTypes.includes(document.activeElement.type));

export const isFocusedOnBlackListedElement = () =>
  document.activeElement?.getAttribute('role') === 'button' ||
  document.activeElement instanceof HTMLButtonElement ||
  document.activeElement instanceof HTMLAnchorElement ||
  document.activeElement instanceof HTMLTextAreaElement ||
  document.activeElement instanceof HTMLSelectElement ||
  (document.activeElement instanceof HTMLInputElement &&
    !allowedInputTypes.includes(document.activeElement.type));

export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    items?: (Item<ItemMetaWithChildren> | ItemGroup | CustomItem<ItemMetaWithChildren>)[];
    preventCloseOnSelect?: boolean;
    child?: boolean;
  }>(),
  {
    items: () => [],
    preventCloseOnSelect: false,
    child: false,
  },
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'closeSelf'): void;
}>();

const focusedElement = ref<null | HTMLElement>(null);

const expand = ref(false);
const focusedItem = shallowRef<Item<ItemMetaWithChildren> | undefined>();

const focusedItemHasChildren = computed(() => {
  if (focusedItem.value == null) return false;

  const meta = focusedItem.value.meta;
  return meta && Array.isArray(meta.children) && meta.children.length > 0;
});

function setupHandler(ctx: Context) {
  useKey('esc', () => emit('close'));
  useKey('up', ctx.focusPrevious, { input: true, repeat: true, prevent: true });
  useKey('down', ctx.focusNext, { input: true, repeat: true, prevent: true });

  useKey(
    'left',
    (event) => {
      if (props.child) {
        event.preventDefault();
        emit('closeSelf');
      }
    },
    { input: true },
  );

  useKey(
    'right',
    (event) => {
      const item = ctx.getFocusedItem<ItemMetaWithChildren>();
      if (item && Array.isArray(item.meta?.children)) {
        event.preventDefault();
        expand.value = true;
      }
    },
    { input: true },
  );

  useKey(
    'enter',
    (event) => {
      const el = ctx.getFocusedItemElement();
      if (document.activeElement === el) {
        console.log('momentos');
        return;
      }

      if (isFocusedOnBlackListedElement()) {
        ctx.setFocusByKey();
        return;
      }
    },
    { input: true },
  );

  ctx.onFocus((_meta, item, el) => {
    focusedElement.value = el;
    focusedItem.value = item;

    if (!isInputing()) {
      el.focus();
    } else {
      el.scrollIntoView({
        block: 'center',
        inline: 'center',
      });
    }
  });

  const expandIfHasChildren = (meta: ItemMetaWithChildren) => {
    if (meta && Array.isArray(meta.children) && filterSelectableItems(meta.children).length > 0) {
      expand.value = true;
    }
  };

  ctx.onHover((meta) => {
    expandIfHasChildren(meta);
  });

  ctx.onSelect((meta: ItemMetaWithChildren) => {
    expandIfHasChildren(meta);
    if (!props.preventCloseOnSelect && !meta.children) emit('close');
  });

  ctx.onUnfocus(() => {
    focusedElement.value = null;
    focusedItem.value = undefined;
    expand.value = false;
  });

  ctx.onDOMFocus((meta, item, el) => {
    ctx.setFocusByKey(item.key);
  });
}
</script>

<template>
  <SelectableItems
    v-bind="$attrs"
    :setup="setupHandler"
    :items="props.items"
  >
    <template #render="{ text, children }: ItemMetaWithChildren">
      {{ text }}
      <IconChevronRight
        style="transform: translateX(50%); margin-left: auto; font-size: 10px"
        v-if="!!children"
      />
    </template>
  </SelectableItems>

  <Wowerlay
    v-if="focusedItemHasChildren"
    :target="focusedElement"
    v-model:visible="expand"
    noBackground
    position="right-start"
    :horizontalGap="-3"
    :transition="false"
  >
    <ItemRenderer
      child
      @closeSelf="expand = false"
      :items="focusedItem!.meta!.children!"
      @close="
        () => {
          expand = false;
          $emit('close');
        }
      "
    />
  </Wowerlay>
</template>
