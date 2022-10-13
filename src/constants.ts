export const ItemTypes = {
  Custom: Symbol(),
  Item: Symbol(),
  Group: Symbol(),
} as const;

export enum HookType {
  Focus,
  Unfocus,
  Select,
  Hover,
  DOMFocus,
}

export const DEFAULT_ITEM_SLOT_NAME = 'render';

const libName = 'vue-selectable-items';

export const ClassNames = {
  Wrapper: libName,
  Item: `${libName}-item`,
  Focused: `${libName}-item-focused`,
} as const;
