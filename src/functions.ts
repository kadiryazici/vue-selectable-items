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

export function isItem(value: unknown): value is Item {
  return isObject(value) && value.type === ItemTypes.Item;
}

export function isCustomItem(value: unknown): value is CustomItem {
  return isObject(value) && value.type === ItemTypes.Custom;
}

export function isComponent(value: unknown): value is Component {
  if (isObject(value)) {
    return typeof value.setup === 'function' || typeof value.render === 'function';
  }

  return typeof value === 'function';
}

export const getFlattenedItems = (
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
