import type { FunctionalComponent, Ref } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllItems<T = any> = Item<T> | CustomItem<T> | ItemGroup;

type GetComponentOrElementProps<C> = C extends string
  ? C extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[C]
    : Record<string, unknown>
  : C extends FunctionalComponent<infer Props>
  ? Props
  : C extends new () => { $props: infer Props }
  ? Props
  : Record<string, unknown>;

type GetElemenAttrs<T> = T extends string
  ? T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : Record<string, unknown>
  : Record<string, unknown>;

export interface ItemGroup<
  WrapperComponent = unknown,
  Props = GetComponentOrElementProps<WrapperComponent>,
> {
  key: string;
  type: symbol;
  wrapperComponentOrTag?: WrapperComponent;
  wrapperProps?: Props;
  items: AllItems[];
}

export interface Item<
  Meta = unknown,
  WrapperComponent = unknown,
  ElementTag = unknown,
  //
  WrapperProps = GetComponentOrElementProps<WrapperComponent>,
  ElementAttrs = {
    key?: undefined;
    ref?: Ref<HTMLElement | null | undefined> | ((el: HTMLElement) => void);
  } & GetElemenAttrs<ElementTag>,
> {
  key: string;
  type: symbol;
  wrapperComponentOrTag?: WrapperComponent;
  wrapperProps?: WrapperProps;
  elementTag?: ElementTag;
  elementAttrs?: ElementAttrs;
  onSelect?: (
    thisMeta: Meta,
    thisItem: Item<Meta, WrapperComponent, ElementTag>,
    thisEl: HTMLElement,
  ) => void;
  meta?: Meta;
}

export interface CustomItem<Meta = unknown> {
  key: string;
  type: symbol;
  name: string;
  meta?: Meta;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Hook = (meta: any, item: Item<any>, el: HTMLElement) => void;
/* eslint-enable @typescript-eslint/no-explicit-any */

export type CustomItemOptions<Meta = unknown> = Omit<CustomItem<Meta>, 'type'>;
export type ItemOptions<Meta = unknown, WrapperComponent = unknown, ElementTag = unknown> = Omit<
  Item<Meta, WrapperComponent, ElementTag>,
  'type'
>;
export type ItemGroupOptions<WrapperComponent = unknown> = Omit<
  ItemGroup<WrapperComponent>,
  'type'
>;
