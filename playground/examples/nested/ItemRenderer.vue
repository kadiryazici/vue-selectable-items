<script lang="ts">
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  shallowRef,
  type InjectionKey,
} from 'vue';
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

export const InjectKey: InjectionKey<boolean> = Symbol();

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
  }>(),
  {
    items: () => [],
    preventCloseOnSelect: false,
  },
);

const child = inject(InjectKey, false);
provide(InjectKey, true);

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
      if (child) {
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
    () => {
      if (isFocusedOnBlackListedElement()) {
        ctx.setFocusByKey();
        return;
      }
      // We return if focused item is selectable item because by pressing enter
      // users fire @click event and it triggeres selection
      // so it selects twice.
      if (document.activeElement?.hasAttribute('data-vue-selectable-items-item')) return;

      ctx.selectFocusedElement();
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

const ctx = shallowRef<Context | null>(null);
function focusInHandler() {
  const el = document.activeElement;

  if (el == null) {
    ctx.value?.clearFocus();
    return;
  }

  if (
    el.matches('[data-vue-selectable-items-item]') ||
    el.querySelector('[data-vue-selectable-items-item]') ||
    isInputing()
  ) {
    return;
  }

  ctx.value?.clearFocus();
}

onMounted(() => window.addEventListener('focusin', focusInHandler));
onUnmounted(() => window.removeEventListener('focusin', focusInHandler));
</script>

<template>
  <SelectableItems
    v-bind="$attrs"
    :setup="setupHandler"
    :items="props.items"
    ref="ctx"
  >
    <template #render="{ text, children }: ItemMetaWithChildren">
      {{ text }}
      <IconChevronRight
        style="transform: translateX(50%); margin-left: 10px; font-size: 10px"
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
