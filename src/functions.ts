import { markRaw, type Component } from 'vue';
import { ItemTypes } from './constants';
import type {
  AllItems,
  CustomItem,
  CustomItemOptions,
  Item,
  ItemGroup,
  ItemGroupOptions,
  ItemOptions,
} from './types';

export function itemGroup<WrapperComponent>(
  options: ItemGroupOptions<WrapperComponent>,
): ItemGroup<WrapperComponent> {
  return {
    ...options,
    wrapperComponentOrTag: isObject(options.wrapperComponentOrTag)
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
    wrapperComponentOrTag: isObject(options.wrapperComponentOrTag)
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

function isObject(value: unknown): value is Record<string | number | symbol, unknown> {
  return getType(value) === 'Object';
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
    return typeof value.setup === 'function' || typeof value.render === 'function';
  }

  return typeof value === 'function';
}

export function filterSelectableAndCustomItems<Meta = unknown>(
  items: AllItems<Meta>[],
): (Item<Meta> | CustomItem<Meta>)[] {
  const seen: (Item<Meta> | CustomItem<Meta>)[] = [];
  items.forEach((item) => {
    if (isItemGroup(item)) {
      seen.push(...filterSelectableAndCustomItems(item.items));
    }

    if (isItem<Meta>(item) || isCustomItem<Meta>(item)) {
      seen.push(item);
    }
  });

  return seen;
}

export function filterSelectableItems<Meta = unknown>(items: AllItems<Meta>[]): Item<Meta>[] {
  const flattened = filterSelectableAndCustomItems(items);
  return flattened.filter(isItem<Meta>);
}
