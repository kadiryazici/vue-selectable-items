/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { ClassNames, DEFAULT_ITEM_SLOT_NAME, HookType } from './constants';
import {
  filterSelectableAndCustomItems,
  isComponent,
  isCustomItem,
  isItem,
  isItemGroup,
} from './functions';
import type { AllItems, Item, Hook } from './types';

export type Context = {
  focusNext(): void;
  focusPrevious(): void;
  clearFocus(): void;
  setFocusByKey(key?: string | null | undefined): void;
  setFocusByIndex(index: number): void;
  onSelect(fn: Hook): void;
  onFocus(fn: Hook): void;
  onUnfocus(fn: Hook): void;
  onHover(fn: Hook): void;
  onDOMFocus(fn: Hook): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getItemMetaByKey<Meta = any>(key: string): Meta | undefined;
  getSelectableItemCount(): number;
  getSelectableItems<Meta = unknown>(): Item<Meta>[];
  selectFocusedElement(): void;
  getFocusedItem<Meta = unknown>(): Item<Meta> | undefined;
  getItemElementByKey(key: string): HTMLElement | undefined;
  getItemElementByIndex(index: number): HTMLElement | undefined;
  scrollToFocusedItemElement(options?: ScrollIntoViewOptions): void;
  getFocusedItemElement(): HTMLElement | undefined;
};

export interface Props {
  noWrapperElement: boolean;
  items: AllItems[];
  setup(context: Context): void;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  onSelect(meta: any, item: Item<any>, el: HTMLElement): void;
  onItemFocus(meta: any, item: Item<any>, el: HTMLElement): void;
  onItemUnfocus(meta: any, item: Item<any>, el: HTMLElement): void;
  onItemDOMFocus(e: FocusEvent, meta: any, item: Item<any>): void;
  onItemHover(meta: any, item: Item<any>, el: HTMLElement): void;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

function getItemByKey<Meta>(items: Item<Meta>[], key: Item['key']) {
  return items.find((item) => item.key === key);
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
    itemFocus: null as unknown as Props['onItemFocus'],
    itemUnfocus: null as unknown as Props['onItemUnfocus'],
    itemDOMFocus: null as unknown as Props['onItemDOMFocus'],
    itemHover: null as unknown as Props['onItemHover'],
  },
  setup(props, { emit, expose }) {
    const flattenedItems = computed(() => filterSelectableAndCustomItems(props.items));
    const selectableItems = computed(() => flattenedItems.value.filter(isItem));

    const focusedKey = ref('');
    const focusedItemIndex = computed(() =>
      selectableItems.value.findIndex((item) => item.key === focusedKey.value),
    );
    const focusedItem = computed<Item | undefined>(
      () => selectableItems.value[focusedItemIndex.value],
    );

    const setFocusByKey = (key: string | null | undefined) => {
      focusedKey.value = key || '';
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

    const hooks = new Map([
      [HookType.Focus, new Set<Hook>()],
      [HookType.Hover, new Set<Hook>()],
      [HookType.Select, new Set<Hook>()],
      [HookType.Unfocus, new Set<Hook>()],
      [HookType.DOMFocus, new Set<Hook>()],
    ]);

    const onFocus = (fn: Hook) => hooks.get(HookType.Focus)!.add(fn);
    const onSelect = (fn: Hook) => hooks.get(HookType.Select)!.add(fn);
    const onUnfocus = (fn: Hook) => hooks.get(HookType.Unfocus)!.add(fn);
    const onHover = (fn: Hook) => hooks.get(HookType.Hover)!.add(fn);
    const onDOMFocus = (fn: Hook) => hooks.get(HookType.DOMFocus)!.add(fn);

    const runHooks = (type: HookType, item: Item) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const el = selectableItemsElements.get(item.key)!;
      hooks.get(type)?.forEach((hook) => hook(item.meta, item, el));
    };

    watch(focusedItem, (to, from) => {
      if (isItem(from)) {
        runHooks(HookType.Unfocus, from);
        emit('itemUnfocus', from.meta, from, getItemElementByKey(from.key)!);
      }

      if (isItem(to)) {
        runHooks(HookType.Focus, to);
        emit('itemFocus', to.meta, to, getItemElementByKey(to.key)!);
      }
    });

    const scrollToFocusedItemElement = (options: ScrollIntoViewOptions = {}) => {
      const el = selectableItemsElements.get(focusedKey.value);
      if (el) el.scrollIntoView(options);
    };

    const getItemElementByIndex = (index: number) => {
      const item = selectableItems.value[index];
      if (isItem(item)) return selectableItemsElements.get(item.key);
    };

    const getItemElementByKey = (key: string) => {
      const item = getItemByKey(selectableItems.value, key);
      if (isItem(item)) return selectableItemsElements.get(key);
    };

    const handleMouseEnter = (item: Item) => {
      if (focusedKey.value === item.key) return;
      setFocusByKey(item.key);
      // It should be called after unFocus events
      setTimeout(() => {
        runHooks(HookType.Hover, item);
        emit('itemHover', item.meta, item, getItemElementByKey(item.key)!);
      });
    };

    const handleClick = (item: Item) => {
      selectItem(item.key);
    };

    const handleDOMFocus = (event: FocusEvent, item: Item<unknown>) => {
      runHooks(HookType.DOMFocus, item);
      emit('itemDOMFocus', event, item.meta, item);
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

    const isFocused = (key: string) => focusedKey.value === key;

    const selectItem = (queryKey?: string) => {
      const key = queryKey || focusedKey.value;
      if (!key) return;

      const item = getItemByKey(selectableItems.value, key);
      if (!item) return;

      const el = getItemElementByKey(item.key)!;

      item.onSelect?.(item.meta, item, el);
      runHooks(HookType.Select, item);
      emit('select', item.meta, item, el);
    };

    const clearFocus = () => {
      focusedKey.value = '';
    };

    const context: Context = {
      focusNext,
      focusPrevious,
      clearFocus,
      setFocusByKey,
      setFocusByIndex,
      onSelect,
      onFocus,
      onUnfocus,
      onHover,
      onDOMFocus,
      getSelectableItemCount: () => selectableItems.value.length,
      selectFocusedElement: () => selectItem(),
      getItemElementByIndex,
      getItemElementByKey,
      scrollToFocusedItemElement,
      getItemMetaByKey<Meta = unknown>(key: string) {
        return getItemByKey(selectableItems.value, key)?.meta as Meta;
      },
      getSelectableItems<Meta = unknown>() {
        return selectableItems.value as Item<Meta>[];
      },
      getFocusedItemElement: () => selectableItemsElements.get(focusedKey.value),
      getFocusedItem<Meta = unknown>() {
        return focusedItem.value as Item<Meta> | undefined;
      },
    };

    expose(context);
    props.setup?.(context);

    return {
      flattenedItems,
      selectableItems,
      handleDOMFocus,
      handleMouseEnter,
      handleClick,
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
            Wrapper,
            mergeProps({ key: item.key, to: 'body' }, props),
            isComponent(Wrapper) ? { default: withCtx(() => children) } : children,
          );
        }

        if (isItem(item)) {
          const Tag = ((typeof item.elementTag === 'string' && item.elementTag) || 'div') as 'div';

          const vNodeItem = (
            <Tag
              data-vue-selectable-items-item
              class={[
                ClassNames.Item, //
                {
                  [ClassNames.Focused]: this.isFocused(item.key),
                },
              ]}
              {...(item.elementAttrs || {})}
              onMouseenter={() => this.handleMouseEnter(item)}
              onFocus={(event) => this.handleDOMFocus(event, item)}
              onClick={() => this.handleClick(item)}
              ref={(instance) => this.saveSelectableItemElement(item.key, instance as HTMLElement)}
            >
              {this.$slots[DEFAULT_ITEM_SLOT_NAME]?.(item.meta)}
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

        if (isCustomItem(item) && Object.keys(this.$slots).includes(item.name)) {
          return h(
            Fragment,
            { key: item.key }, //
            this.$slots[item.name]?.(item.meta),
          );
        }

        return null;
      });

    const rendered = renderer(this.items);

    if (this.noWrapperElement) return h(Fragment, {}, rendered);

    return h('div', { class: ClassNames.Wrapper }, rendered);
  },
});
