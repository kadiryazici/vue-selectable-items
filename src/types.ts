import type { Component, Ref } from 'vue';

export type AllItems = Item | CustomItem | ItemGroup;

export interface ItemGroup {
  key: string;
  type: symbol;
  wrapperComponentOrTag?: Component | string;
  wrapperProps?: Record<string, unknown>;
  items: AllItems[];
}

export interface Item {
  key: string;
  type: symbol;
  wrapperComponentOrTag?: Component | string;
  wrapperProps?: Record<string, unknown>;
  elementTag?: string;
  elementAttrs?: {
    key?: undefined;
    ref?: Ref<HTMLElement | null | undefined>;
    [key: string]: unknown;
  };
  onSelect?: (metaData: unknown) => void;
  metaData?: unknown;
}

export interface CustomItem {
  key: string;
  type: symbol;
  slotName: string;
  metaData?: unknown;
}

export type OnFocusHook = (metaData: unknown, el: HTMLElement) => void;
export type OnUnfocusHook = (metaData: unknown, el: HTMLElement) => void;
export type OnSelectHook = (metaData: unknown, el: HTMLElement) => void;

export type CustomItemOptions = Omit<CustomItem, 'type' | 'key' | 'metaData'>;
export type ItemOptions = Omit<Item, 'type' | 'key' | 'metaData'>;
export type ItemGroupOptions = Omit<ItemGroup, 'type' | 'key' | 'items'>;
