import { markRaw, type Component } from 'vue';
import { ItemTypes } from './constants';
import type {
  CustomItem,
  CustomItemOptions,
  Item,
  ItemDefaults,
  ItemGroup,
  ItemGroupOptions,
  ItemOptions,
  ItemRenderList,
  NullablePartial,
} from './types';

export function itemGroup<WrapperComponent>(
  options: ItemGroupOptions<WrapperComponent>,
): ItemGroup<WrapperComponent> {
  return {
    ...options,
    wrapperComponentOrTag: isComponent(options.wrapperComponentOrTag)
      ? markRaw(options.wrapperComponentOrTag)
      : options.wrapperComponentOrTag,
    type: ItemTypes.Group,
  };
}

export function item<Meta = unknown, WrapperComponent = unknown, ElementTag = unknown>(
  options: ItemOptions<Meta, WrapperComponent, ElementTag>,
): Item<Meta, WrapperComponent, ElementTag> {
  return {
    ...options,
    disabled: !!options.disabled,
    wrapperComponentOrTag: isComponent(options.wrapperComponentOrTag)
      ? markRaw(options.wrapperComponentOrTag)
      : options.wrapperComponentOrTag,
    type: ItemTypes.Item,
  };
}

export function customItem<Meta = unknown>(options: CustomItemOptions<Meta>): CustomItem<Meta> {
  return {
    ...options,
    type: ItemTypes.Custom,
  };
}

const getType = (value: unknown): string => Object.prototype.toString.call(value).slice(8, -1);

export function isObject(value: unknown): value is Record<string | number | symbol, unknown> {
  return getType(value) === 'Object';
}

export function isString(value: unknown): value is string {
  return getType(value) === 'String';
}

export function isFunction<T = (...args: unknown[]) => unknown>(value: unknown): value is T {
  return getType(value) === 'Function';
}

export function hasOwn(obj: unknown, property: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, property);
}

export function isComponentOrTag(value: unknown): value is Component | string {
  return isComponent(value) || isString(value);
}

export function isItemGroup(value: unknown): value is ItemGroup {
  return isObject(value) && value.type === ItemTypes.Group;
}

export function isItem<Meta = unknown>(value: unknown): value is Item<Meta> {
  return isObject(value) && value.type === ItemTypes.Item;
}

export function isCustomItem<Meta = unknown>(value: unknown): value is CustomItem<Meta> {
  return isObject(value) && value.type === ItemTypes.Custom;
}

export function isComponent(value: unknown): value is Component {
  if (isObject(value)) {
    return isFunction(value.setup) || isFunction(value.render) || isString(value.template);
  }

  return isFunction(value);
}

/**
 *
 * @param items Items to filter
 * @param seen Destination of filtered items. Do not pass this argument. It's used internally.
 */
export function filterSelectableAndCustomItems<Meta = unknown>(
  items: ItemRenderList<Meta>,
  seen: (Item<Meta> | CustomItem<Meta>)[] = [],
): (Item<Meta> | CustomItem<Meta>)[] {
  items.forEach((item) => {
    if (Array.isArray(item)) {
      filterSelectableAndCustomItems(item, seen);
    }

    if (isItemGroup(item)) {
      filterSelectableAndCustomItems(item.items, seen);
    }

    if (isItem<Meta>(item) || isCustomItem<Meta>(item)) {
      seen.push(item);
    }
  });

  return seen;
}

export function filterSelectableItems<Meta = unknown>(items: ItemRenderList<Meta>): Item<Meta>[] {
  const flattened = filterSelectableAndCustomItems(items);
  return flattened.filter(isItem<Meta>);
}

export function isOr<Value, Or>(value: Value, is: (value: unknown) => boolean, or: Or): Value | Or {
  return is(value) ? value : or;
}

export function createItemDefaults<Meta = unknown>(
  param: NullablePartial<ItemDefaults> | ((item: Item<Meta>) => NullablePartial<ItemDefaults>),
) {
  if (typeof param === 'function') {
    return param;
  }

  const { wrapperComponentOrTag = null, ...others } = param;

  return {
    ...others,
    wrapperComponentOrTag: isComponent(wrapperComponentOrTag)
      ? markRaw(wrapperComponentOrTag)
      : wrapperComponentOrTag,
  };
}
