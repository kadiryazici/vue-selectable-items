import {
  defineComponent,
  renderList,
  type PropType,
  Fragment,
  type VNodeChild,
  h,
  mergeProps,
  computed,
  ref,
  withCtx,
} from 'vue';
import { ClassNames, DEFAULT_ITEM_SLOT_NAME } from './constants';
import { getFlattenedItems, isComponent, isCustomItem, isItem, isItemGroup } from './functions';
import type { AllItems } from './types';

export interface Props {
  noWrapperElement: boolean;
  items: AllItems[];
  onSelect: (metaData: unknown) => void;
  setup: (context: {
    focusNext: () => void;
    focusPrevious: () => void;
    selectedCurrentItem: () => void;
  }) => void;
}

export default defineComponent({
  name: 'SelectableItems',
  inheritAttrs: false,
  props: {
    noWrapperElement: {
      type: Boolean as PropType<Props['noWrapperElement']>,
      default: false,
    },
    items: {
      type: Array as PropType<Props['items']>,
      default: () => [],
    },
    setup: {
      type: Function as PropType<Props['setup']>,
      default: null,
    },
  },
  emits: {
    select: null as unknown as Props['onSelect'],
  },
  setup(props, { emit }) {
    const flattenedItems = computed(() => getFlattenedItems(props.items));
    const selectableItems = computed(() => flattenedItems.value.filter(isItem));

    const focusedKey = ref('');
    const focusedItemIndex = computed(() =>
      selectableItems.value.findIndex((item) => item.key === focusedKey.value),
    );

    const focusNext = () => {
      const nextIndex =
        focusedItemIndex.value >= selectableItems.value.length - 1 ? 0 : focusedItemIndex.value + 1;

      focusedKey.value = selectableItems.value[nextIndex].key;
    };

    const focusPrevious = () => {
      const nextIndex =
        focusedItemIndex.value <= 0 ? selectableItems.value.length - 1 : focusedItemIndex.value - 1;

      focusedKey.value = selectableItems.value[nextIndex].key;
    };

    const setFocus = (key: string) => {
      focusedKey.value = key;
    };

    const getItemByKey = (key: string) => selectableItems.value.find((item) => item.key === key);

    const isFocused = (key: string) => focusedKey.value === key;

    const selectItem = (queryKey?: string) => {
      const key = queryKey || focusedKey.value;
      if (!key) return;

      const item = getItemByKey(key);
      if (!item) return;

      item.onSelect?.(item.metaData);
      emit('select', item.metaData);
    };

    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown': {
          focusNext();
          break;
        }

        case 'ArrowUp': {
          focusPrevious();
          break;
        }

        case 'Enter': {
          selectItem();
          break;
        }
      }
    });

    props.setup?.({
      focusNext,
      focusPrevious,
      selectedCurrentItem: () => selectItem(),
    });

    return {
      flattenedItems,
      selectableItems,
      focusNext,
      focusPrevious,
      isFocused,
      setFocus,
      selectItem,
    };
  },
  render() {
    const renderer = (items: AllItems[]): VNodeChild[] =>
      renderList(items, (item) => {
        if (isItemGroup(item)) {
          const Wrapper = item.wrapperComponentOrTag || Fragment;
          const props = item.wrapperProps || {};

          const children = renderer(item.items);

          // Have to use `h` here because JSX thinks
          // renderer(item.items) returns a vNode not vNode[]
          // so it converts it into vNode[][]
          return h(
            // @ts-expect-error it's dynamic component
            Wrapper,
            mergeProps({ key: item.key, to: 'body' }, props),
            isComponent(Wrapper) ? { default: withCtx(() => children) } : children,
          );
        }

        if (isItem(item)) {
          const Tag = ((typeof item.elementTag === 'string' && item.elementTag) || 'div') as 'div';

          const vNodeItem = (
            <Tag
              class={[
                ClassNames.Item, //
                {
                  [ClassNames.Focused]: this.isFocused(item.key),
                },
              ]}
              {...(item.elementAttrs || {})}
              onMouseenter={() => this.setFocus(item.key)}
              onClick={() => this.selectItem(item.key)}
            >
              {this.$slots[DEFAULT_ITEM_SLOT_NAME]?.(item.metaData)}
            </Tag>
          );

          if (
            isComponent(item.wrapperComponentOrTag) ||
            typeof item.wrapperComponentOrTag === 'string'
          ) {
            return h(
              // @ts-expect-error dynamic component
              item.wrapperComponentOrTag,
              mergeProps({ key: item.key }, item.wrapperProps || {}),
              isComponent(item.wrapperComponentOrTag)
                ? { default: withCtx(() => [vNodeItem]) }
                : [vNodeItem],
            );
          }

          return vNodeItem;
        }

        if (isCustomItem(item) && Object.keys(this.$slots).includes(item.slotName)) {
          return h(
            Fragment,
            { key: item.key }, //
            this.$slots[item.slotName]?.(item.metaData),
          );
        }

        return null;
      });

    const rendered = renderer(this.items);

    if (this.noWrapperElement) return h(Fragment, {}, rendered);

    return h('div', { class: ClassNames.Wrapper }, rendered);
  },
});
