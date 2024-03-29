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
  onBeforeUpdate,
  reactive,
  watch,
} from 'vue';
import { ClassNames, HookType, READONLY_EMPTY_OBJECT } from './constants';
import {
  filterSelectableItems,
  hasOwn,
  isComponent,
  isComponentOrTag,
  isCustomItem,
  isItem,
  isItemGroup,
  isObject,
  isOr,
} from './functions';
import type {
  Item,
  FocusHook,
  SelectHook,
  UnfocusHook,
  DOMFocusHook,
  HookFnMap,
  ItemDefaults,
  NullablePartial,
  ItemRenderList,
} from './types';

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
  onSelect(fn: SelectHook): void;
  onFocus(fn: FocusHook): void;
  onUnfocus(fn: UnfocusHook): void;
  onDOMFocus(fn: DOMFocusHook): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getItemMetaByKey<Meta = any>(key: string): Meta | undefined;
  getSelectableItemCount(): number;
  getSelectableItems<Meta = unknown>(): Item<Meta>[];
  selectFocusedItem(): void;
  getFocusedItem<Meta = unknown>(): Item<Meta> | undefined;
  getItemElementByKey(key: string): HTMLElement | undefined;
  getItemElementByIndex(index: number): HTMLElement | undefined;
  scrollToFocusedItemElement(options?: ScrollIntoViewOptions): void;
  getFocusedItemElement(): HTMLElement | undefined;
};

export interface Props {
  noWrapperElement: boolean;
  items: ItemRenderList;
  setup(context: Context): void;
  itemDefaults:
    | NullablePartial<ItemDefaults>
    | ((item: Item<unknown>) => NullablePartial<ItemDefaults>);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  onSelect: SelectHook;
  onItemFocus: FocusHook;
  onItemUnfocus: UnfocusHook;
  onItemDOMFocus: DOMFocusHook;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

function getItemByKey<Meta>(items: Item<Meta>[], key: Item['key']) {
  return items.find((item) => item.key === key);
}

// For saving bytes
const wrapperComponentOrTag = 'wrapperComponentOrTag';

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
    itemDefaults: {
      type: [Object, Function] as PropType<Props['itemDefaults']>,
      default: null,
    },
  },
  emits: {
    select: null as unknown as Props['onSelect'],
    itemFocus: null as unknown as Props['onItemFocus'],
    itemUnfocus: null as unknown as Props['onItemUnfocus'],
    itemDOMFocus: null as unknown as Props['onItemDOMFocus'],
  },
  setup(props, { emit, expose, slots, attrs }) {
    const selectableItems = computed(() => filterSelectableItems(props.items));

    const focusedItemKey = ref('');
    const focusedItemIndex = computed(() =>
      selectableItems.value.findIndex((item) => item.key === focusedItemKey.value),
    );
    const focusedItem = computed<Item | undefined>(
      () => selectableItems.value[focusedItemIndex.value],
    );

    const hooks = {
      [HookType.Focus]: new Set<FocusHook>(),
      [HookType.Select]: new Set<SelectHook>(),
      [HookType.Unfocus]: new Set<UnfocusHook>(),
      [HookType.DOMFocus]: new Set<DOMFocusHook>(),
    };

    const onFocus = (fn: FocusHook) => hooks[HookType.Focus].add(fn);
    const onSelect = (fn: SelectHook) => hooks[HookType.Select].add(fn);
    const onUnfocus = (fn: UnfocusHook) => hooks[HookType.Unfocus].add(fn);
    const onDOMFocus = (fn: DOMFocusHook) => hooks[HookType.DOMFocus].add(fn);

    function runHook<T extends HookType>(hook: T, ...args: Parameters<HookFnMap[T]>) {
      // @ts-expect-error spread error
      hooks[hook].forEach((_hook) => _hook(...args));
    }

    function handleFocusedItemChange(to?: Item, from?: Item, byPointer = false) {
      if (to?.key === from?.key) return;

      if (isItem(from)) {
        const el = getItemElementByKey(from.key)!;
        runHook(HookType.Unfocus, from.meta, from, el);
        emit('itemUnfocus', from.meta, from, el);
      }

      if (isItem(to)) {
        const el = getItemElementByKey(to.key)!;
        runHook(HookType.Focus, to.meta, to, el, byPointer);
        emit('itemFocus', to.meta, to, el, byPointer);
      }
    }

    const setFocusByKey = (key: string, byPointer = false) => {
      const newKey = key || '';
      const newItem = getItemByKey(selectableItems.value, newKey);

      if (newItem?.disabled) return;

      const oldItem = getItemByKey(selectableItems.value, focusedItemKey.value);

      focusedItemKey.value = newKey;

      handleFocusedItemChange(newItem, oldItem, byPointer);
    };

    watch(
      () => selectableItems.value.map((item) => item.key),
      (keys) => {
        const exists = keys.some((key) => key === focusedItemKey.value);
        if (!exists) {
          setFocusByKey('');
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
      setFocusByKey(item.key, true);
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

      const el = getItemElementByKey(item.key)!;
      runHook(HookType.DOMFocus, event, item.meta, item, el);
      emit('itemDOMFocus', event, item.meta, item, el);
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

    const selectItem = (key: string) => {
      const item = getItemByKey(selectableItems.value, key);
      if (!item || item.disabled) return;

      const el = getItemElementByKey(item.key)!;

      item.onSelect?.(item.meta, item, el);
      runHook(HookType.Select, item.meta, item, el);
      emit('select', item.meta, item, el);
    };

    const context: Context = {
      focusNext: () => focusNextInDirection(Direction.Next),
      focusPrevious: () => focusNextInDirection(Direction.Previous),
      clearFocus: () => setFocusByKey(''),
      setFocusByKey,
      setFocusByIndex,
      onSelect,
      onFocus,
      onUnfocus,
      onDOMFocus,
      getSelectableItemCount: () => selectableItems.value.length,
      selectFocusedItem: () => selectItem(focusedItemKey.value),
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

    const renderItems = (items: ItemRenderList): VNodeChild[] =>
      renderList(items, (item) => {
        if (Array.isArray(item)) {
          return renderItems(item);
        }

        if (isItemGroup(item)) {
          const Wrapper = item[wrapperComponentOrTag] || Fragment;
          const props = item.wrapperProps || READONLY_EMPTY_OBJECT;

          const children = renderItems(item.items);

          // Have to use `h` here because JSX thinks
          // renderer(item.items) returns a vNode not vNode[]
          // so it converts it into vNode[][]
          return h(
            Wrapper,
            mergeProps(props, { key: item.key }),
            isComponent(Wrapper) ? { default: () => children } : children,
          );
        }

        if (isItem(item)) {
          const defaults =
            typeof props.itemDefaults === 'function'
              ? props.itemDefaults(item)
              : props.itemDefaults || READONLY_EMPTY_OBJECT;

          const ItemTag = isOr(
            item.elementTag || defaults.elementTag,
            isComponentOrTag,
            'div',
          ) as /* For type checking */ 'div';

          const itemProps = mergeProps(
            isOr(defaults.elementAttrs!, isObject, READONLY_EMPTY_OBJECT),
            isOr(item.elementAttrs as Record<string, never>, isObject, READONLY_EMPTY_OBJECT),
          );

          const vNodeItem = (
            <ItemTag
              data-vue-selectable-items-item={''}
              class={[
                ClassNames.Item, //
                {
                  [ClassNames.Focused]: isFocused(item.key),
                  [ClassNames.Disabled]: isDisabled(item.key),
                },
              ]}
              {...itemProps}
              onMouseenter={() => handleMouseEnter(item)}
              onFocus={(event) => handleDOMFocus(event, item)}
              onClick={() => handleClick(item)}
              ref={(instance) => saveSelectableItemElement(item.key, instance as HTMLElement)}
            >
              {slots.render?.(item)}
            </ItemTag>
          );

          const Wrapper = item[wrapperComponentOrTag] || defaults[wrapperComponentOrTag];
          if (isComponentOrTag(Wrapper)) {
            const wrapperProps = mergeProps(
              isOr(defaults.wrapperProps!, isObject, READONLY_EMPTY_OBJECT),
              isOr(item.wrapperProps!, isObject, READONLY_EMPTY_OBJECT),
              { key: item.key },
            );

            return h(
              Wrapper as 'div',
              wrapperProps,
              isComponent(Wrapper) //
                ? { default: () => [vNodeItem] }
                : [vNodeItem],
            );
          }

          return vNodeItem;
        }

        if (isCustomItem(item) && hasOwn(slots, item.name)) {
          return h(
            Fragment,
            { key: item.key }, //
            slots[item.name]?.(item.meta),
          );
        }

        return null;
      });

    return () => {
      const rendered = renderItems(props.items);

      if (props.noWrapperElement) return h(Fragment, READONLY_EMPTY_OBJECT, rendered);

      return h('div', mergeProps({ class: ClassNames.Wrapper }, attrs), rendered);
    };
  },
});
