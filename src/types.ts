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
