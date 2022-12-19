export const ItemTypes = {
  Custom: Symbol(),
  Item: Symbol(),
  Group: Symbol(),
} as const;

export enum HookType {
  Focus,
  Unfocus,
  Select,
  DOMFocus,
}

const libName = 'vue-selectable-items';
export const ClassNames = {
  Wrapper: libName,
  Item: `${libName}-item`,
  Focused: `${libName}-item-focused`,
  Disabled: `${libName}-item-disabled`,
} as const;

export const READONLY_EMPTY_OBJECT = Object.freeze(Object.create(null)) as Readonly<
  Record<string, never>
>;
