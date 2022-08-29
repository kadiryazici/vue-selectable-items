import type { Component, Ref } from 'vue';

export type AllItems = Item | CustomItem | ItemGroup;

export interface ItemGroup {
  key: string;
  type: symbol;
  wrapperComponent?: Component | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapperComponentProps?: Record<string, any>;
  items: AllItems[];
}

export interface Item {
  key: string;
  type: symbol;
  wrapperComponent?: Component | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapperComponentProps?: Record<string, any>;
  elementTag?: string;
  elementAttrs?: {
    key?: undefined;
    ref?: Ref<HTMLElement | null | undefined>;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metaData?: any;
}

export interface CustomItem {
  key: string;
  type: symbol;
  slotName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metaData?: any;
}
