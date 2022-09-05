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
  onBeforeUpdate,
  reactive,
  watch,
} from 'vue';
import { ClassNames, DEFAULT_ITEM_SLOT_NAME } from './constants';
import { getFlattenedItems, isComponent, isCustomItem, isItem, isItemGroup } from './functions';
import type { AllItems, Item, OnFocusHook, OnSelectHook, OnUnfocusHook } from './types';

export type SetupFunctionContext = {
  focusNext(): void;
  focusPrevious(): void;
  clearFocus(): void;
  setFocusByKey(key: string): void;
  setFocusByIndex(index: number): void;
  onSelect(fn: OnSelectHook): void;
  onFocus(fn: OnFocusHook): void;
  onUnfocus(fn: OnUnfocusHook): void;
  getItemMetaDataByKey(key: string): unknown;
  getSelectableItemCount(): number;
  getSelectableItems(): Item[];
  selectFocusedElement(): void;
  getItemElementByKey(key: string): HTMLElement | undefined;
  getItemElementByIndex(index: number): HTMLElement | undefined;
  scrollToFocusedElement(options?: ScrollIntoViewOptions): void;
  getFocusedItemElement(): HTMLElement | undefined;
};

export interface Props {
  noWrapperElement: boolean;
  items: AllItems[];
  onSelect: (metaData: unknown) => void;
  setup: (context: SetupFunctionContext) => void;
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
    const focusedItem = computed<Item | undefined>(
      () => selectableItems.value[focusedItemIndex.value],
    );

    const setFocusByKey = (key: string) => {
      focusedKey.value = key;
    };

    const setFocusByIndex = (index: number) => {
      const item = selectableItems.value[index];
      if (isItem(item)) {
        setFocusByKey(selectableItems.value[index].key);
      }
    };

    const selectableItemsElements = reactive(new Map<string, HTMLElement>());
    onBeforeUpdate(() => selectableItemsElements.clear());

    const saveSelectableItemElement = (key: string, element: HTMLElement) =>
      selectableItemsElements.set(key, element);

    const focusHooks = new Set<OnFocusHook>();
    const selectHooks = new Set<OnSelectHook>();
    const unfocusHooks = new Set<OnUnfocusHook>();

    const onFocus = (fn: OnFocusHook) => focusHooks.add(fn);
    const onSelect = (fn: OnSelectHook) => selectHooks.add(fn);
    const onUnfocus = (fn: OnUnfocusHook) => unfocusHooks.add(fn);

    const runSelectHooks = (item: Item) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const el = selectableItemsElements.get(item.key)!;
      selectHooks.forEach((hook) => hook(item.metaData, el));
    };

    const runFocusHooks = (item: Item) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const el = selectableItemsElements.get(item.key)!;
      focusHooks.forEach((hook) => hook(item.metaData, el));
    };

    const runUnfocusHooks = (item: Item) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const el = selectableItemsElements.get(item.key)!;
      unfocusHooks.forEach((hook) => hook(item.metaData, el));
    };

    watch(focusedItem, (to, from) => {
      if (isItem(from)) runUnfocusHooks(from);
      if (isItem(to)) runFocusHooks(to);
    });

    const scrollToFocusedElement = (options: ScrollIntoViewOptions = {}) => {
      const el = selectableItemsElements.get(focusedKey.value);
      if (el) el.scrollIntoView(options);
    };

    const getItemElementByIndex = (index: number) => {
      const item = selectableItems.value[index];
      if (isItem(item)) return selectableItemsElements.get(item.key);
    };

    const getItemElementByKey = (key: string) => {
      const item = getItemByKey(key);
      if (isItem(item)) return selectableItemsElements.get(key);
    };

    const focusNext = () => {
      const nextIndex =
        focusedItemIndex.value >= selectableItems.value.length - 1 ? 0 : focusedItemIndex.value + 1;

      setFocusByIndex(nextIndex);
    };

    const focusPrevious = () => {
      const nextIndex =
        focusedItemIndex.value <= 0 ? selectableItems.value.length - 1 : focusedItemIndex.value - 1;

      setFocusByIndex(nextIndex);
    };

    const getItemByKey = (key: string) => selectableItems.value.find((item) => item.key === key);

    const isFocused = (key: string) => focusedKey.value === key;

    const selectItem = (queryKey?: string) => {
      const key = queryKey || focusedKey.value;
      if (!key) return;

      const item = getItemByKey(key);
      if (!item) return;

      item.onSelect?.(item.metaData);
      runSelectHooks(item);
      emit('select', item.metaData);
    };

    const clearFocus = () => {
      focusedKey.value = '';
    };

    const getItemMetaDataByKey = (key: string) => getItemByKey(key)?.metaData;

    props.setup?.({
      focusNext,
      focusPrevious,
      clearFocus,
      setFocusByKey,
      setFocusByIndex,
      onSelect,
      onFocus,
      onUnfocus,
      getItemMetaDataByKey,
      getSelectableItemCount: () => selectableItems.value.length,
      getSelectableItems: () => selectableItems.value,
      selectFocusedElement: () => selectItem(),
      getItemElementByIndex,
      getItemElementByKey,
      scrollToFocusedElement,
      getFocusedItemElement: () => selectableItemsElements.get(focusedKey.value),
    });

    return {
      flattenedItems,
      selectableItems,
      focusNext,
      focusPrevious,
      isFocused,
      setFocusByKey,
      selectItem,
      saveSelectableItemElement,
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
              onMouseenter={() => this.setFocusByKey(item.key)}
              onClick={() => this.selectItem(item.key)}
              ref={(instance) => this.saveSelectableItemElement(item.key, instance as HTMLElement)}
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
