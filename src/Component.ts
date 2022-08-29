import { defineComponent, renderList, type PropType, Fragment, type VNodeChild, h, mergeProps, computed } from 'vue';
import { ClassNames, DEFAULT_ITEM_SLOT_NAME } from './constants';
import { isCustomItem, isItem, isItemGroup } from './functions';
import type { AllItems, CustomItem, Item } from './types';

export interface Props {
  noWrapperElement: boolean;
  items: AllItems[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: (metaData: any) => void;
  onSetup: () => void;
}

const getFlattenedItems = (
  items: AllItems[], //
  seenItems: (Item | CustomItem)[] = [],
): (Item | CustomItem)[] => {
  items.forEach((item) => {
    if (isItemGroup(item)) {
      getFlattenedItems(item.items, seenItems);
    }

    if (isItem(item) || isCustomItem(item)) {
      seenItems.push(item);
    }
  });

  return seenItems;
};

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
  },
  emits: {
    setup: null as unknown as Props['onSetup'],
  },
  setup(props) {
    const flattenedItems = computed(() => getFlattenedItems(props.items));
    const selectableItems = computed(() => flattenedItems.value.filter(isItem));

    return {
      flattenedItems,
      selectableItems,
    };
  },
  render() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;

    const renderer = (items: AllItems[]): VNodeChild =>
      renderList(items, (item) => {
        if (isItemGroup(item)) {
          const Wrapper = item.wrapperComponent || Fragment;
          const props = item.wrapperComponentProps || {};

          return h(
            // @ts-expect-error it's dynamic component
            Wrapper,
            mergeProps({ key: item.key }, props),
            renderer(item.items),
          );
        }

        if (isItem(item)) {
          const Wrapper = item.wrapperComponent || Fragment;
          const wrapperProps = item.wrapperComponentProps || {};

          const Element = (item.elementTag || 'div') as 'div';
          const elementAttrs = item.elementAttrs || {};

          return h(
            // @ts-expect-error ts cannot know, it's dynamic
            Wrapper,
            mergeProps({ key: item.key }, wrapperProps),
            h(Element, elementAttrs, _this.$slots[DEFAULT_ITEM_SLOT_NAME]?.(item.metaData)),
          );
        }

        if (isCustomItem(item) && Object.keys(_this.$slots).includes(item.slotName)) {
          return h(Fragment, { key: item.key }, _this.$slots[item.slotName]?.(item.metaData));
        }

        return null;
      });

    const rendered = renderer(this.items);

    if (this.noWrapperElement) return h(Fragment, {}, [rendered]);

    return h('div', { class: ClassNames.Wrapper }, [rendered]);
  },
});
