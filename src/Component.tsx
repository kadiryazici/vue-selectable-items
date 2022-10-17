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
  type ComputedRef,
} from 'vue';
import { ClassNames, DEFAULT_ITEM_SLOT_NAME, HookType } from './constants';
import { filterSelectableItems, isComponent, isCustomItem, isItem, isItemGroup } from './functions';
import type { AllItems, Item, Hook } from './types';

const enum Direction {
  Next,
  Previous,
}

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
    const selectableItems: ComputedRef<Item[]> = computed(() => filterSelectableItems(props.items));

    const focusedItemKey = ref('');
    const focusedItemIndex = computed(() =>
      selectableItems.value.findIndex((item) => item.key === focusedItemKey.value),
    );
    const focusedItem = computed<Item | undefined>(
      () => selectableItems.value[focusedItemIndex.value],
    );

    const setFocusByKey = (key?: string) => {
      focusedItemKey.value = key || '';
    };

    watch(
      () => selectableItems.value.map((item) => item.key),
      (keys) => {
        const exists = keys.some((key) => key === focusedItemKey.value);
        if (!exists) {
          setFocusByKey();
        }
      },
    );

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
      const el = selectableItemsElements.get(focusedItemKey.value);
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
      if (focusedItemKey.value === item.key || item.disabled) return;

      setFocusByKey(item.key);
      // It should be called after unFocus events
      setTimeout(() => {
        runHooks(HookType.Hover, item);
        emit('itemHover', item.meta, item, getItemElementByKey(item.key)!);
      });
    };

    const handleClick = (item: Item) => {
      if (item.disabled) return;

      if (focusedItemKey.value !== item.key) {
        setFocusByKey(item.key);
        setTimeout(() => selectItem(item.key), 0);
      } else {
        selectItem(item.key);
      }
    };

    const handleDOMFocus = (event: FocusEvent, item: Item<unknown>) => {
      if (item.disabled) return;

      runHooks(HookType.DOMFocus, item);
      emit('itemDOMFocus', event, item.meta, item);
    };

    const focusNextInDirection = (direction: Direction) => {
      if (selectableItems.value.every((item) => item.disabled)) {
        return setFocusByKey('');
      }

      const increment = direction === Direction.Next ? 1 : -1;
      let nextIndex = focusedItemIndex.value;

      for (;;) {
        nextIndex += increment;

        if (direction === Direction.Next) {
          if (nextIndex >= selectableItems.value.length) {
            nextIndex = 0;
          }
        } else {
          if (nextIndex < 0) {
            nextIndex = selectableItems.value.length - 1;
          }
        }

        const item = selectableItems.value[nextIndex];
        if (!item.disabled) {
          return setFocusByIndex(nextIndex);
        }
      }
    };

    const isFocused = (key: string) => focusedItemKey.value === key;

    const isDisabled = (key: string) => {
      const item = selectableItems.value.find((item) => item.key === key);
      return item?.disabled === true;
    };

    const selectItem = (queryKey?: string) => {
      const item = getItemByKey(selectableItems.value, queryKey || focusedItemKey.value);
      if (!item || item.disabled) return;

      const el = getItemElementByKey(item.key)!;

      item.onSelect?.(item.meta, item, el);
      runHooks(HookType.Select, item);
      emit('select', item.meta, item, el);
    };

    const clearFocus = () => {
      focusedItemKey.value = '';
    };

    const context: Context = {
      focusNext: () => focusNextInDirection(Direction.Next),
      focusPrevious: () => focusNextInDirection(Direction.Previous),
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
      getFocusedItemElement: () => selectableItemsElements.get(focusedItemKey.value),
      getFocusedItem<Meta = unknown>() {
        return focusedItem.value as Item<Meta> | undefined;
      },
    };

    expose(context);
    props.setup?.(context);

    return {
      handleDOMFocus,
      handleMouseEnter,
      handleClick,
      isFocused,
      isDisabled,
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
                  [ClassNames.Disabled]: this.isDisabled(item.key),
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
