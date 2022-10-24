<script lang="ts">
import { ref, shallowRef } from 'vue';
import type { Item, ItemGroup, CustomItem, Context } from '../../../src';
import { Wowerlay } from 'wowerlay';
import useKey from '../../composables/useKey';
import { SelectableItems, createItemDefaults } from '../../../src/';
import IconChevronRight from 'virtual:icons/carbon/chevron-right';
import ItemRenderer from './ItemRenderer.vue';

const itemDefaults = createItemDefaults({
  elementTag: 'button',
  elementAttrs: {
    tabindex: 0,
    style: {
      outline: 'none',
    },
  },
});

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

export const createFocusRestorer = (element: HTMLElement) => {
  const elementScrollPositions = [] as { target: HTMLElement; x: number; y: number }[];
  const rootScrollingElement = document.scrollingElement || document.documentElement;
  let parent = element.parentNode as HTMLElement | null;

  while (parent && parent !== rootScrollingElement) {
    if (parent.offsetHeight < parent.scrollHeight || parent.offsetWidth < parent.scrollWidth) {
      elementScrollPositions.push({ target: parent, x: parent.scrollLeft, y: parent.scrollTop });
    }
    parent = parent.parentNode as HTMLElement | null;
  }

  return () => {
    for (const { target, x, y } of elementScrollPositions) {
      target.scrollLeft = x;
      target.scrollTop = y;
    }
  };
};

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
const focusedItemHasChildren = ref(false);

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
      if (document.activeElement === el || isFocusedOnBlackListedElement()) {
        console.log('blocked');
        return;
      }

      ctx.selectFocusedItem();
    },
    { input: true },
  );

  ctx.onFocus((meta, item, el, byPointer) => {
    focusedElement.value = el;
    focusedItem.value = item;
    focusedItemHasChildren.value = Array.isArray(meta?.children);

    if (byPointer) {
      expandIfHasChildren(meta);
    }

    if (!isInputing()) {
      const restore = createFocusRestorer(el);
      el.focus();

      if (byPointer) {
        restore();
      }
    } else {
      el.scrollIntoView({
        block: 'center',
        inline: 'center',
      });
    }
  });

  const expandIfHasChildren = (meta?: ItemMetaWithChildren) => {
    if (Array.isArray(meta?.children)) {
      expand.value = true;
    }
  };

  ctx.onSelect((meta: ItemMetaWithChildren) => {
    expandIfHasChildren(meta);
    if (!props.preventCloseOnSelect && !meta.children) emit('close');
  });

  ctx.onUnfocus(() => {
    focusedElement.value = null;
    focusedItem.value = undefined;
    expand.value = false;
  });

  ctx.onDOMFocus((_event, _meta, item) => {
    ctx.setFocusByKey(item.key);
  });
}
</script>

<template>
  <SelectableItems
    v-bind="$attrs"
    :setup="setupHandler"
    :items="props.items"
    :itemDefaults="itemDefaults"
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
