import { ItemTypes } from './constants';
import type { CustomItem, Item, ItemGroup } from './types';

const createKey = () => performance.now().toString(36) + Math.random().toString(36).slice(2);

export function itemGroup(items: ItemGroup['items'], options?: Omit<ItemGroup, 'type' | 'key' | 'items'>): ItemGroup {
  return {
    ...options,
    items,
    key: createKey(),
    type: ItemTypes.Group,
  };
}

export function item(data: Item['metaData'], options?: Omit<Item, 'type' | 'key' | 'metaData'>): Item {
  return {
    ...options,
    metaData: data,
    key: createKey(),
    type: ItemTypes.Item,
  };
}

export function customItem(
  data: CustomItem['metaData'],
  options: Omit<CustomItem, 'type' | 'key' | 'metaData'>,
): CustomItem {
  return {
    ...options,
    metaData: data,
    key: createKey(),
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
