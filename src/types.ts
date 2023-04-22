import type { FunctionalComponent, Ref } from 'vue';
import type { HookType } from './constants';

export type NullablePartial<T> = { [P in keyof T]?: T[P] | undefined | null };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllItems<T = any> = Item<T> | CustomItem<T> | ItemGroup;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ItemRenderList<T = any> = (AllItems<T> | AllItems<T>[] | ItemRenderList<T>)[];

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
  items: ItemRenderList;
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
  disabled: boolean;
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
export type SelectHook = Hook;
export type UnfocusHook = Hook;
export type FocusHook = (meta: any, item: Item<any>, el: HTMLElement, byPointer: boolean) => void;
export type DOMFocusHook = (event: FocusEvent, meta: any, item: Item<any>, el: HTMLElement) => void;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface HookFnMap {
  [HookType.DOMFocus]: DOMFocusHook;
  [HookType.Select]: SelectHook;
  [HookType.Focus]: FocusHook;
  [HookType.Unfocus]: UnfocusHook;
}

export type CustomItemOptions<Meta = unknown> = Omit<CustomItem<Meta>, 'type'>;

export type ItemOptions<Meta = unknown, WrapperComponent = unknown, ElementTag = unknown> = Omit<
  Item<Meta, WrapperComponent, ElementTag>,
  'type' | 'disabled'
> & { disabled?: boolean };

export type ItemGroupOptions<WrapperComponent = unknown> = Omit<
  ItemGroup<WrapperComponent>,
  'type'
>;

export type ItemDefaults = {
  wrapperComponentOrTag: unknown;
  wrapperProps: Record<string, unknown>;
  elementTag: string;
  elementAttrs: Record<string, unknown>;
};
